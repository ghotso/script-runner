import './globals.css'
import { Inter } from 'next/font/google'
import Sidebar from './components/Sidebar'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Script Runner',
  description: 'Run and manage your Python and Bash scripts',
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
        <Sidebar />
        <main className="flex-grow ml-16 p-4 sm:p-6 md:p-8">
          <div className="glassmorphism p-4 sm:p-6 min-h-screen">
            {children}
          </div>
        </main>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </body>
    </html>
  )
}

