import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '工具箱 - 開發者實用工具集',
  description: '提供JSON、YAML、XML格式化和HAR解析等開發者實用工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>
        {children}
      </body>
    </html>
  )
} 