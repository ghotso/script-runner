'use client'

import ScriptList from './components/ScriptList'
import { Button } from './components/ui/button'
import Link from 'next/link'
import { Plus, FileCode, Power } from 'lucide-react'
import { useScheduler } from './contexts/SchedulerContext'

export default function Home() {
  const { isGlobalSchedulerEnabled, toggleGlobalScheduler } = useScheduler()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <FileCode className="h-8 w-8" />
          Scripts
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={toggleGlobalScheduler}
            variant={isGlobalSchedulerEnabled ? "default" : "destructive"}
            className="flex items-center gap-2"
          >
            <Power className="h-4 w-4" />
            {isGlobalSchedulerEnabled ? 'Disable' : 'Enable'} Scheduler
          </Button>
          <Link href="/add-script">
            <Button className="bg-primary/20 text-primary hover:bg-primary/30">
              <Plus className="mr-2 h-4 w-4" /> Add New Script
            </Button>
          </Link>
        </div>
      </div>
      <ScriptList />
    </div>
  )
}

