import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Crypto Bubbles Indonesia',
  description:
    'Crypto Bubbles Indonesia – visualisasi pasar kripto real‑time berbasis bubble chart. Lacak harga, market cap, serta performa koin populer dalam tampilan interaktif. Satu‑satunya pengalaman crypto bubbles berbahasa Indonesia.',
  keywords:
    'crypto bubbles indonesia, crypto bubbles id, visualisasi kripto, bubble chart kripto, harga kripto real-time, market cap kripto, koin kripto naik turun, tracker kripto indonesia, grafik kripto indonesia, alternatif cryptobubbles',
  openGraph: {
    title: 'Crypto Bubbles Indonesia',
    description:
      'Satu‑satunya pengalaman crypto bubbles berbahasa Indonesia. Lihat pergerakan harga dan market cap kripto secara real‑time dalam tampilan bubble chart interaktif.',
    type: 'website',
    url: 'https://'+(process.env.NEXT_PUBLIC_SITE_DOMAIN || 'example.com'),
    siteName: 'Crypto Bubbles Indonesia',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crypto Bubbles Indonesia',
    description:
      'Satu‑satunya crypto bubbles di Indonesia – pantau harga & market cap kripto secara real‑time dengan bubble chart.',
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${inter.className} bg-black`}>{children}</body>
    </html>
  )
}
