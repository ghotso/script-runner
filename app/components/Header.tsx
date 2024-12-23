import Link from 'next/link'
import { FileCode, Settings } from 'lucide-react'

export default function Header() {
  return (
    <header className="glassmorphism mb-8">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-primary">
          <FileCode size={24} />
          <span>Script Runner</span>
        </Link>
        <div className="space-x-4">
          <Link href="/" className="text-primary hover:text-primary/80 transition-colors">Home</Link>
          <Link href="/add-script" className="text-primary hover:text-primary/80 transition-colors">Add Script</Link>
          <Link href="/settings" className="text-primary hover:text-primary/80 transition-colors">
            <Settings size={20} />
          </Link>
        </div>
      </nav>
    </header>
  )
}

