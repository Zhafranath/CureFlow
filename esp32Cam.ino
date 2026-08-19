#include <WiFi.h>
#include <HTTPClient.h>
#include <esp_camera.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

// ==========================================
// 1. KONFIGURASI WIFI & SERVER WEBSITE
// ==========================================
const char* WIFI_SSID     = "Kunimitsu";
const char* WIFI_PASSWORD = "1234554322";

// URL Endpoint API analisis tanaman di website CureFlow (Vercel Production)
// Pastikan user_id sesuai dengan ID Anda di database Supabase (tabel profiles)
const char* SERVER_URL    = "https://curetest.vercel.app/api/analyze-plant?user_id=3684b391-5350-475f-a92c-4d453496188b";
const char* TRIGGER_URL   = "https://curetest.vercel.app/api/camera-trigger?user_id=3684b391-5350-475f-a92c-4d453496188b";

// ==========================================
// 2. MODEL KAMERA & PIN CONFIGURATION (AI THINKER WITH PSRAM)
// ==========================================
#define CAMERA_MODEL_AI_THINKER // Model ESP32-CAM AI Thinker (Has PSRAM)

#if defined(CAMERA_MODEL_AI_THINKER)
  #define PWDN_GPIO_NUM     32
  #define RESET_GPIO_NUM    -1
  #define XCLK_GPIO_NUM      0
  #define SIOD_GPIO_NUM     26
  #define SIOC_GPIO_NUM     27

  #define Y9_GPIO_NUM       35
  #define Y8_GPIO_NUM       34
  #define Y7_GPIO_NUM       39
  #define Y6_GPIO_NUM       36
  #define Y5_GPIO_NUM       21
  #define Y4_GPIO_NUM       19
  #define Y3_GPIO_NUM       18
  #define Y2_GPIO_NUM        5
  #define VSYNC_GPIO_NUM    25
  #define HREF_GPIO_NUM     23
  #define PCLK_GPIO_NUM     22

  #define FLASH_LED_PIN      4
#endif

// Pin Tombol Capture Manual (Opsional, GPIO 13 atau eksternal)
#define BUTTON_PIN        13

void setupCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;

  // Kompatibilitas ESP32 Core v3.x.x
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;

  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if (psramFound()) {
    config.frame_size = FRAMESIZE_VGA; // 640x480
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_CIF;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  // Inisialisasi Kamera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Kamera gagal diinisialisasi dengan error 0x%x\n", err);
    return;
  }
  Serial.println("Kamera ESP32-CAM Siap!");
}

void captureAndSendImage() {
  Serial.println("Mengambil gambar dari sensor kamera ESP32-CAM...");
  
  // Nyalakan Flash LED sebentar (opsional untuk penerangan foto)
  digitalWrite(FLASH_LED_PIN, HIGH);
  delay(150);

  camera_fb_t * fb = esp_camera_fb_get();
  digitalWrite(FLASH_LED_PIN, LOW); // Matikan flash

  if (!fb) {
    Serial.println("Gagal mengambil gambar dari kamera!");
    return;
  }

  Serial.printf("Gambar berhasil diambil! Ukuran JPEG: %u bytes\n", fb->len);

  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure(); // Bypass SSL certificate validation for Vercel
    
    HTTPClient http;
    http.begin(client, SERVER_URL);

    // Mengirim gambar sebagai multipart/form-data langsung dari RAM
    String boundary = "----ESP32CamBoundary";
    String head = "--" + boundary + "\r\nContent-Disposition: form-data; name=\"image\"; filename=\"capture.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n";
    String tail = "\r\n--" + boundary + "--\r\n";

    uint32_t extraLen = head.length() + tail.length();
    uint32_t totalLen = fb->len + extraLen;

    uint8_t * payload = (uint8_t *)malloc(totalLen);
    if (payload) {
      memcpy(payload, head.c_str(), head.length());
      memcpy(payload + head.length(), fb->buf, fb->len);
      memcpy(payload + head.length() + fb->len, tail.c_str(), tail.length());

      http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
      int httpResponseCode = http.POST(payload, totalLen);
      
      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("HTTP Response code: %d\n", httpResponseCode);
        Serial.println("Hasil Analisis Server Website:");
        Serial.println(response);
      } else {
        Serial.printf("Error pada pengiriman HTTP POST: %s\n", http.errorToString(httpResponseCode).c_str());
      }
      free(payload);
    } else {
      Serial.println("Memori RAM tidak cukup untuk alokasi payload HTTP!");
    }

    http.end();
  } else {
    Serial.println("WiFi tidak terhubung, gagal mengirim gambar!");
  }

  // Bebaskan memori frame buffer (TIDAK DISIMPAN DI DISK/SD CARD)
  esp_camera_fb_return(fb);
  Serial.println("Memori frame buffer dibebaskan. Gambar tidak disimpan.");
}

void setup() {
  Serial.begin(115200);
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  // Hubungkan ke WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Menghubungkan ke WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nTerhubung ke WiFi!");
  Serial.print("IP Address ESP32-CAM: ");
  Serial.println(WiFi.localIP());

  // Setup kamera ESP32-CAM
  setupCamera();
}

unsigned long lastTriggerCheck = 0;
const unsigned long TRIGGER_CHECK_INTERVAL = 2000; // Check trigger every 2 seconds

void checkCameraTrigger() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[TRIGGER] WiFi terputus, membatalkan polling.");
    return;
  }
  
  Serial.print("[TRIGGER] Polling Vercel... ");
  
  WiFiClientSecure client;
  client.setInsecure(); // Bypass SSL certificate validation for Vercel
  
  HTTPClient http;
  http.begin(client, TRIGGER_URL);
  http.setTimeout(2500); // Short timeout to avoid stalling the loop
  
  int httpResponseCode = http.GET();
  Serial.printf("HTTP Code: %d\n", httpResponseCode);
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    
    DynamicJsonDocument doc(384);
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error) {
      bool trigger = doc["trigger"].as<bool>();
      if (trigger) {
        Serial.println("[TRIGGER] Perintah capture diterima dari website!");
        captureAndSendImage();
      }
    } else {
      Serial.print("[TRIGGER] Gagal deserialize JSON: ");
      Serial.println(error.c_str());
    }
  } else {
    Serial.printf("[TRIGGER] HTTP GET gagal, status code: %d (%s)\n", 
                  httpResponseCode, http.errorToString(httpResponseCode).c_str());
  }
  http.end();
}

void loop() {
  // Opsi 1: Pengambilan via tombol fisik eksternal
  if (digitalRead(BUTTON_PIN) == LOW) {
    delay(50); // Debounce
    if (digitalRead(BUTTON_PIN) == LOW) {
      captureAndSendImage();
      while(digitalRead(BUTTON_PIN) == LOW); // Tunggu lepas tombol
    }
  }

  // Opsi 2: Menerima perintah Serial "CAPTURE"
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd == "CAPTURE") {
      captureAndSendImage();
    }
  }

  // Opsi 3: Polling status pemicu dari website CureFlow
  if (millis() - lastTriggerCheck >= TRIGGER_CHECK_INTERVAL) {
    lastTriggerCheck = millis();
    checkCameraTrigger();
  }

  delay(100);
}
