# 🌊 CureFlow - Smart Aquaponics & Green Pharmacy System

CureFlow adalah sistem manajemen akuaponik pintar dan apotek hijau terintegrasi IoT. Aplikasi ini dirancang untuk memantau budidaya tanaman obat dan stok ikan secara *real-time*, sekaligus memfasilitasi kebutuhan instalasi gizi/dapur rumah sakit dan permintaan dokter untuk resep obat herbal pasien.

Aplikasi ini menggunakan visual premium, interaksi WebGL 3D, dan terintegrasi langsung ke database Supabase yang tersambung dengan hardware ESP32 Arduino.

---

## 🌟 Fitur Utama

### 1. 🖥️ Multi-Role Dashboards
* **Apoteker (Pharmacist):** Mengelola katalog tanaman obat yang sedang ditanam, melihat progres pertumbuhan secara visual, memanen hasil gizi ikan, serta menyetujui/menolak permintaan panen dari dokter.
* **Dokter (Doctor):** Memantau ketersediaan tanaman herbal berkhasiat obat dan mengajukan permintaan panen tanaman obat secara instan berdasarkan keluhan klinis pasien.
* **Teknisi (Technician):** Memantau sensor IoT (kadar kekeruhan, volume air, volume pakan), mengendalikan aktuator secara manual (pompa & servo feeder), mengatur jadwal pakan otomatis, serta menyalin kode Arduino yang terintegrasi.

### 2. 🔌 Integrasi IoT Hardware (ESP32 / Arduino)
* Terintegrasi langsung dengan sketsa **`cureFlow.ino`** yang siap dijalankan pada mikrokontroler ESP32 fisik.
* Menyediakan fitur penyalinan kredensial otomatis (Supabase URL, Key, dan User UUID) di dalam dashboard teknisi untuk kemudahan setup board.

### 3. 🎨 Visual Premium & Efek WebGL 3D
* Latar belakang 3D interaktif yang hidup menggunakan **Three.js** (Wavy Particle Grid) dan transisi kamera yang halus dengan **GSAP**.
* Antarmuka glassmorphism modern dengan transisi warna halus, lencana status berdenyut (*pulsing indicators*), dan skema warna adaptif siang/malam (Day/Night Mode).

### 4. 🗃️ Integrasi Supabase Real-Time
* Mendukung sinkronisasi instan via PostgreSQL Real-time channel untuk pemantauan parameter sensor dan status tangki tanpa perlu memuat ulang halaman (*zero-reload*).
* **Pemisahan Mode Demo:** Memuat data mock secara otomatis untuk kebutuhan presentasi/demo lokal jika Supabase belum terhubung.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, TailwindCSS, Framer Motion
* **Visual 3D & Animasi:** Three.js, GSAP (GreenSock)
* **Database & Auth:** Supabase (PostgreSQL)
* **Hardware Language:** C++ (Arduino IDE)

---

## 🚀 Panduan Memulai (Quick Start)

### 1. Clone & Install Dependensi
Pastikan Anda menggunakan Node.js versi terbaru, lalu jalankan:
```bash
npm install
# atau menggunakan pnpm
pnpm install
```

### 2. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env` di root folder dan masukkan kredensial Supabase proyek Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://proyek-anda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key-proyek-anda
```

### 3. Setup Database Supabase
Jalankan script SQL yang ada di [schema.sql](file:///c:/Users/Admin/Documents/coding/medibotics%20final/lib/schema.sql) pada SQL Editor di dashboard Supabase Anda. Ini akan membuat tabel-tabel berikut beserta policy RLS-nya:
* `profiles` (profil dokter, apoteker, teknisi)
* `sensor_readings` (tangki air, volume pakan, kekeruhan, kontrol aktuator, jadwal)
* `catalog` (data tanaman obat)
* `fish_stock` (stok kolam ikan)
* `doctor_requests` (rekam permintaan panen dokter)

### 4. Jalankan Aplikasi Secara Lokal
```bash
npm run dev
# atau
pnpm dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🔌 Setup Integrasi Hardware (ESP32)

1. Pastikan Anda telah mengunggah struktur database Supabase menggunakan `schema.sql`.
2. Lakukan login akun riil ke dalam sistem web CureFlow dengan peran **Teknisi**.
3. Buka tab **Arduino Integration** di dashboard teknisi.
4. Salin kode yang telah terisi kredensial unik akun Anda secara otomatis, kemudian unggah (*upload*) menggunakan Arduino IDE ke board ESP32 Anda.
