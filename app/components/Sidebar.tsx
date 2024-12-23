'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileCode, Home, PlusCircle, Settings, Menu, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { useState } from 'react'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/add-script', icon: PlusCircle, label: 'Add Script' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <aside className="glassmorphism w-16 h-screen fixed left-0 top-0 p-4 flex flex-col items-center z-50 hidden sm:flex">
        <div className="mb-8">
          <FileCode size={32} className="text-primary" />
        </div>
        <nav className="flex-1">
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-primary hover:bg-primary/20"
                  )}
                  title={item.label}
                >
                  <item.icon size={24} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="sm:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-md"
        >
          <Menu size={24} />
        </button>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40">
            <aside className="glassmorphism w-64 h-screen p-4 flex flex-col items-start">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="self-end p-2 mb-4"
              >
                <X size={24} />
              </button>
              <nav className="flex-1 w-full">
                <ul className="space-y-4">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link 
                        href={item.href} 
                        className={cn(
                          "flex items-center w-full p-2 rounded-md transition-colors",
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "text-primary hover:bg-primary/20"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon size={24} className="mr-2" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}

