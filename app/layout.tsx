import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Home, FileCode, Settings } from 'lucide-react'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Script Runner',
  description: 'Run and manage your scripts',
  icons: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      url: '/favicon.svg',
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-foreground`}>
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <nav className="relative border-b border-white/10 bg-white/5 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-white flex items-center">
                <FileCode className="w-6 h-6 mr-2" />
                Script Runner
              </Link>
              <div className="flex items-center gap-4">
                <Link 
                  href="/" 
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <Home className="w-5 h-5" />
                  Home
                </Link>
                <Link 
                  href="/add-script"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Add New Script
                </Link>
                <Link 
                  href="/settings"
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="relative container mx-auto py-6 px-4">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}

