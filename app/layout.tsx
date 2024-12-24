import './globals.css'
import { Inter } from 'next/font/google'
import Sidebar from './components/Sidebar'
import { ToastProvider } from './components/providers/toast-provider'
import { SchedulerProvider } from './contexts/SchedulerContext'
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Script Runner',
  description: 'Run and manage your Python and Bash scripts',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/favicon.ico' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex`}>
        <SchedulerProvider>
          <Sidebar />
          <main className="flex-grow ml-16 p-4 sm:p-6 md:p-8">
            <div className="glassmorphism p-4 sm:p-6 min-h-screen">
              {children}
            </div>
          </main>
          <ToastProvider />
        </SchedulerProvider>
      </body>
    </html>
  )
}

