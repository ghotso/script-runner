'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, Tag, FileCode, Terminal, CheckCircle, XCircle } from 'lucide-react'
import { Input } from './ui/input'
import Select, { MultiValue } from 'react-select'
import { toast } from 'react-toastify'

type TagOption = { value: string; label: string };
type Script = {
  id: string;
  name: string;
  type: string;
  tags: string[];
  executions: Array<{ status: 'success' | 'failed' }>;
};

const getRandomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

export default function ScriptList() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const response = await fetch('/api/scripts')
        if (!response.ok) {
          throw new Error('Failed to fetch scripts')
        }
        const data = await response.json()
        setScripts(data)
      } catch (error) {
        console.error('Error fetching scripts:', error)
        toast.error('Failed to load scripts')
      }
    }

    fetchScripts()
  }, [])

  const allTags = useMemo(() => Array.from(new Set(scripts.flatMap(script => script.tags))), [scripts])
  const tagColors = useMemo(() => {
    return allTags.reduce((acc, tag) => {
      acc[tag] = getRandomColor()
      return acc
    }, {} as Record<string, string>)
  }, [allTags])

  const filteredScripts = scripts.filter(script => 
    script.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedTags.length === 0 || selectedTags.some(tag => script.tags.includes(tag)))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search scripts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-foreground w-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
        </div>
        <div className="w-full sm:w-64">
          <Select<TagOption, true>
            isMulti
            options={allTags.map(tag => ({ value: tag, label: tag }))}
            onChange={(selected) => setSelectedTags(selected.map(option => option.value))}
            className="bg-white/5 border-white/10 text-foreground"
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: 'white',
              }),
              multiValue: (provided) => ({
                ...provided,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }),
              multiValueLabel: (provided) => ({
                ...provided,
                color: 'white',
              }),
              multiValueRemove: (provided) => ({
                ...provided,
                color: 'white',
                ':hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                },
              }),
            }}
          />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredScripts.map(script => (
          <Link key={script.id} href={`/script/${script.id}`}>
            <div className="glassmorphism p-4 hover:bg-white/20 transition duration-200 relative">
              <div className="absolute top-2 right-2">
                {script.executions && script.executions.length > 0 && (
                  script.executions[0].status === 'success' ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <XCircle className="text-red-500" size={20} />
                  )
                )}
              </div>
              <div className="flex items-center mb-2">
                {script.type === 'Python' ? (
                  <FileCode className="mr-2 text-blue-500" size={24} />
                ) : (
                  <Terminal className="mr-2 text-green-500" size={24} />
                )}
                <h3 className="text-xl font-semibold text-primary">{script.name}</h3>
              </div>
              <p className="text-muted-foreground mb-2">{script.type}</p>
              <div className="flex flex-wrap gap-2">
                {script.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="text-xs px-2 py-1 rounded-full flex items-center" 
                    style={{ backgroundColor: tagColors[tag], color: 'white' }}
                  >
                    <Tag size={12} className="mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

