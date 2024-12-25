'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, Settings, Menu, X, Power } from 'lucide-react'
import { cn } from '../lib/utils'
import { useState } from 'react'
import { useScheduler } from '../contexts/SchedulerContext'
import { Switch } from './ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/add-script', icon: PlusCircle, label: 'Add Script' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isGlobalSchedulerEnabled, isLoading, toggleGlobalScheduler } = useScheduler()

  const handleToggleGlobalScheduler = async () => {
    if (isLoading) return
    await toggleGlobalScheduler()
  }

  return (
    <>
      <aside className="glassmorphism w-16 h-screen fixed left-0 top-0 p-4 flex flex-col items-center z-50 hidden sm:flex">
        <div className="mb-8">
          <img 
            src="/script-opened-svgrepo-com.svg" 
            alt="Script Runner Logo" 
            className="w-12 h-12 text-primary"
          />
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mt-auto">
                <div className="flex flex-col items-center gap-1">
                  <Power 
                    size={16} 
                    className={cn(
                      isGlobalSchedulerEnabled ? "text-green-500" : "text-red-500"
                    )} 
                  />
                  <Switch
                    checked={isGlobalSchedulerEnabled}
                    onCheckedChange={handleToggleGlobalScheduler}
                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600"
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{isGlobalSchedulerEnabled ? 'Disable' : 'Enable'} Global Scheduler</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
              <div className="mt-auto flex items-center justify-between w-full">
                <span className="text-sm">Global Scheduler</span>
                <div className="flex items-center gap-2">
                  <Power 
                    size={16} 
                    className={cn(
                      isGlobalSchedulerEnabled ? "text-green-500" : "text-red-500"
                    )} 
                  />
                  <Switch
                    checked={isGlobalSchedulerEnabled}
                    onCheckedChange={handleToggleGlobalScheduler}
                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600"
                  />
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}

