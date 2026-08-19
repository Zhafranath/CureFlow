import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { AppProvider } from '@/lib/store'
import Script from 'next/script'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CureFlow — Sistem Manajemen Kesehatan & IoT Aquaponics',
  description:
    'CureFlow adalah sistem manajemen kesehatan berbasis IoT aquaponik ESP32 yang memantau kualitas air dan merawat tanaman obat secara otomatis.',
  generator: 'v0.app',
  keywords: ['CureFlow', 'hospital management', 'herbal aquaponics', 'ESP32', 'healthcare system'],
  authors: [{ name: 'CureFlow Team' }],
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0fdff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a1628' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      className={`dark ${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background font-sans antialiased" suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(reg) { console.log('PWA ServiceWorker registered with scope:', reg.scope); },
                  function(err) { console.error('PWA ServiceWorker registration failed:', err); }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
