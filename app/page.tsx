import ScriptList from './components/ScriptList'
import { Button } from './components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Scripts</h1>
        <Link href="/add-script">
          <Button className="bg-primary/20 text-primary hover:bg-primary/30">
            <Plus className="mr-2 h-4 w-4" /> Add New Script
          </Button>
        </Link>
      </div>
      <ScriptList />
    </div>
  )
}

