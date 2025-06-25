import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Agents Marketplace - Automate Your Business',
  description: 'Discover, deploy, and scale AI agents designed to automate your business processes. From customer service to data analysis, find the perfect AI solution.',
  keywords: 'AI agents, automation, business, customer service, data analysis, content creation',
  authors: [{ name: 'AgentHub Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}