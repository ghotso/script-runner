'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { FileCode, Calendar, Plus } from 'lucide-react'
import { Tag } from "../../components/ui/tag"
import { MultiSelect } from "../../components/ui/multi-select"
import { getTagColor } from '../../utils/tag-colors'
import { Script } from '@/types/script'

interface ScriptListProps {
  initialScripts: Script[]
}

export default function ScriptList({ initialScripts }: ScriptListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [scripts, setScripts] = useState<Script[]>(initialScripts)

  useEffect(() => {
    console.log('Initial scripts:', initialScripts);
  }, [initialScripts]);

  // Get unique tags from all scripts
  const allTags = Array.from(new Set(scripts.flatMap(script => script.tags)))
    .map(tag => ({ label: tag, value: tag }))

  // Filter scripts based on search term and selected tags
  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => script.tags.includes(tag))
    return matchesSearch && matchesTags
  })

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-white">Scripts</h1>
        <div className="flex flex-col gap-4 md:flex-row mb-4">
          <div className="flex-1 max-w-md">
            <Input 
              type="text" 
              placeholder="Search scripts by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 focus:border-white/20"
            />
          </div>
          <div className="flex-1 max-w-md">
            <MultiSelect
              options={allTags}
              selected={selectedTags}
              onChange={setSelectedTags}
              placeholder="Filter by tags..."
            />
          </div>
          <Link
            href="/add-script"
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors 
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
              disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Script
          </Link>
        </div>
      </header>

      {filteredScripts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-white/70">No scripts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScripts.map((script) => (
            <Card 
              key={script.id} 
              className="group backdrop-blur-md bg-white/10 border-white/20 transition-all hover:bg-white/15"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                {script.type === 'python' ? (
                  <FileCode className="w-8 h-8 text-blue-400" />
                ) : (
                  <Calendar className="w-8 h-8 text-green-400" />
                )}
                <div>
                  <CardTitle className="text-lg text-white group-hover:text-white/90 transition-colors">
                    {script.name}
                  </CardTitle>
                  <p className="text-sm text-white/70">
                    Type: {script.type}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {script.tags.map((tag) => (
                    <Tag 
                      key={tag}
                      variant={getTagColor(tag) as any}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
                <Link 
                  href={`/script/${script.id}`}
                  className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2"
                >
                  View Details →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

