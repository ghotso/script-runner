'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, Tag, FileCode, Terminal, CheckCircle, XCircle, Clock, Power } from 'lucide-react'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import Select from 'react-select'
import { showToast } from '../lib/toast'
import { translateCronSchedule } from '../utils/cron'
import { cn } from '../lib/utils'
import { Script } from '../types/script'

type TagOption = { value: string; label: string };

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
  const [updatingScheduler, setUpdatingScheduler] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchScripts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/scripts')
        if (!response.ok) {
          throw new Error('Failed to fetch scripts')
        }
        const data = await response.json()
        setScripts(data)
        showToast.success('Scripts loaded successfully')
      } catch (error) {
        console.error('Error fetching scripts:', error)
        setError('Failed to load scripts. Please try again later.')
        showToast.error('Failed to load scripts')
      } finally {
        setIsLoading(false)
      }
    }

    fetchScripts()
  }, [])

  const handleToggleScheduler = async (scriptId: string, currentState: boolean) => {
    if (updatingScheduler) return

    setUpdatingScheduler(scriptId)
    try {
      const response = await fetch(`/api/scripts/${scriptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSchedulerEnabled: !currentState })
      })

      if (!response.ok) {
        throw new Error('Failed to update scheduler state')
      }

      setScripts(prevScripts => 
        prevScripts.map(script => 
          script.id === scriptId 
            ? { ...script, isSchedulerEnabled: !currentState }
            : script
        )
      )

      showToast.success(`Scheduler ${!currentState ? 'enabled' : 'disabled'} for script`)
    } catch (error) {
      console.error('Error updating scheduler state:', error)
      showToast.error('Failed to update scheduler state')
    } finally {
      setUpdatingScheduler(null)
    }
  }

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

  if (isLoading) {
    return <div>Loading scripts...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

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
          <div key={script.id} className="relative">
            <Link href={`/script/${script.id}`}>
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
                <p className="text-white mb-2">{script.type}</p>
                <div className="flex flex-wrap gap-2 mb-2">
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
                <div className="text-sm text-white">
                  <h4 className="font-semibold mb-1 flex items-center">
                    <Clock className="mr-1" size={14} />
                    Schedules:
                  </h4>
                  <ul className="list-disc list-inside">
                    {script.schedules.map((schedule, index) => (
                      <li key={index}>{translateCronSchedule(schedule)}</li>
                    ))}
                  </ul>
                  {script.schedules.length === 0 && <p>No schedules set</p>}
                </div>
              </div>
            </Link>
            <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
              <span className="text-sm text-muted-foreground">Scheduler</span>
              <Switch
                checked={script.isSchedulerEnabled}
                onCheckedChange={(checked: boolean) => handleToggleScheduler(script.id, script.isSchedulerEnabled)}
                className="data-[state=checked]:bg-green-500"
                disabled={updatingScheduler === script.id}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

