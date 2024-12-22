import './globals.css'
import { Inter } from 'next/font/google'
import Sidebar from './components/sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Script Runner',
  description: 'Run and manage your scripts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

