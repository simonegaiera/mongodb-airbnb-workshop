import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MongoDB Arena Portal',
  description: 'Manage workshop participants',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="circuit-bg">{children}</body>
    </html>
  )
}
