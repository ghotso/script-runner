'use client'

import { useEffect, useState } from 'react'
import ScriptList from './components/ScriptList'
import { Button } from './components/ui/button'
import Link from 'next/link'
import { Plus, FileCode } from 'lucide-react'
import { useScheduler } from './contexts/SchedulerContext'

export default function Home() {
  const { isGlobalSchedulerEnabled } = useScheduler()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    return () => setIsLoaded(false)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded-lg border border-gray-700">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <FileCode className="h-8 w-8" />
          Scripts
        </h1>
        <div className="flex gap-2">
          <Link href="/add-script">
            <Button className="bg-primary/20 text-primary hover:bg-primary/30">
              <Plus className="mr-2 h-4 w-4" /> Add New Script
            </Button>
          </Link>
        </div>
      </div>
      {isLoaded && <ScriptList />}
    </div>
  )
}

