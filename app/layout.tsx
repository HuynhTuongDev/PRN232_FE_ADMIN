import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GoRide Manager - Trang Quản Trị',
  description: 'Hệ thống quản trị cho thuê xe máy GoRide - Quản lý xe, đơn thuê, người dùng, blog và ưu đãi.',
  keywords: ['GoRide', 'quản trị', 'thuê xe máy', 'Quy Nhơn', 'admin'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
