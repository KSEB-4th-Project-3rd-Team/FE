import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'KSEB Smart WMS',
    template: '%s | KSEB Smart WMS'
  },
  description: 'KSEB 스마트 창고 관리 시스템 - Unity 3D 시뮬레이션, 실시간 재고 관리, AMR 로봇 제어를 통한 차세대 WMS 솔루션',
  keywords: ['WMS', '창고관리시스템', 'Unity', 'AMR', '재고관리', 'KSEB', 'Smart Warehouse', '물류관리'],
  authors: [{ name: 'KSEB 4기 3팀' }],
  generator: 'Next.js',
  applicationName: 'KSEB Smart WMS',
  referrer: 'origin-when-cross-origin',
  creator: 'KSEB 4기 3팀',
  publisher: 'KSEB',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://kseb-smart-wms.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KSEB Smart WMS - 스마트 창고 관리 시스템',
    description: 'Unity 3D 시뮬레이션과 AMR 로봇을 활용한 차세대 창고 관리 시스템. 실시간 재고 추적, 자동화된 입출고 관리, 직관적인 대시보드를 제공합니다.',
    url: 'https://kseb-smart-wms.vercel.app',
    siteName: 'KSEB Smart WMS',
    images: [
      {
        url: '/images/optimized/page-logo.png',
        width: 1200,
        height: 630,
        alt: 'KSEB Smart WMS - 스마트 창고 관리 시스템',
      },
      {
        url: '/images/optimized/page-logo.png',
        width: 1800,
        height: 1600,
        alt: 'KSEB Smart WMS Dashboard',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KSEB Smart WMS - 스마트 창고 관리 시스템',
    description: 'Unity 3D 시뮬레이션과 AMR 로봇을 활용한 차세대 창고 관리 시스템',
    images: ['/images/optimized/page-logo.png'],
    creator: '@KSEB',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/images/optimized/page-logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/optimized/page-logo.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/images/optimized/page-logo.png',
    apple: [
      { url: '/images/optimized/page-logo.png', sizes: '180x180', type: 'image/png' },
      { url: '/images/optimized/page-logo.png', sizes: '152x152', type: 'image/png' },
      { url: '/images/optimized/page-logo.png', sizes: '144x144', type: 'image/png' },
      { url: '/images/optimized/page-logo.png', sizes: '120x120', type: 'image/png' },
      { url: '/images/optimized/page-logo.png', sizes: '114x114', type: 'image/png' },
      { url: '/images/optimized/page-logo.png', sizes: '76x76', type: 'image/png' },
      { url: '/images/optimized/page-logo.png', sizes: '72x72', type: 'image/png' },
      { url: '/images/optimized/page-logo.png', sizes: '60x60', type: 'image/png' },
      { url: '/images/optimized/page-logo.png', sizes: '57x57', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/images/optimized/page-logo.png',
      },
      {
        rel: 'mask-icon',
        url: '/images/optimized/page-logo.png',
        color: '#2563eb',
      },
    ],
  },
  manifest: '/manifest.json',
}

// Disable static generation and caching for dynamic content
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
