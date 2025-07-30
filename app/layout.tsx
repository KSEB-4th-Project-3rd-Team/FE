import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Smart WMS',
  description: 'Smart WMS',
  generator: 'Smart WMS',
  icons: {
    icon: [
      { url: '/images/tap-logo.png' },
      { url: '/images/tap-logo.png' },
      { url: '/images/tap-logo.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: [
      { url: '/images/tap-logo.png' },
      { url: '/images/tap-logo.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/images/tap-logo.png',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
