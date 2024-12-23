import Link from 'next/link'
import { Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="glassmorphism mt-8">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <p className="text-muted-foreground">&copy; 2023 Script Runner</p>
        <Link href="https://github.com/yourusername/script-runner" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
          <Github size={20} />
          <span>GitHub</span>
        </Link>
      </div>
    </footer>
  )
}

