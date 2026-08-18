import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'TestAi - Multi-Tenant Education Platform',
  description: 'A comprehensive multi-tenant SaaS platform for education and upskilling',
  keywords: ['education', 'learning', 'aptitude', 'coding', 'resume', 'job hunt'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
