import Link from 'next/link'
import { Home, PlusCircle } from 'lucide-react'

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 h-screen p-6 flex flex-col">
      <h1 className="text-2xl font-bold text-white mb-8">Script Runner</h1>
      <nav className="space-y-2">
        <Link 
          href="/" 
          className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
        >
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link 
          href="/add-script" 
          className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle size={20} />
          <span>Add New Script</span>
        </Link>
      </nav>
    </div>
  )
}

