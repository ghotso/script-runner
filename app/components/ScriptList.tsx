'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Search, Tag, FileCode, Terminal, CheckCircle, XCircle, Clock, Power } from 'lucide-react'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import Select from 'react-select'
import { showToast } from '../lib/toast'
import { translateCronSchedule } from '../utils/cron'
import { cn } from '../lib/utils'
import { Script } from '../types/script'
import Color from 'color'

type TagOption = { value: string; label: string };

const getRandomColor = () => {
  const hue = Math.floor(Math.random() * 360)
  return Color(`hsl(${hue}, 70%, 60%)`).toString()
}

const getContrastColor = (bgColor: string) => {
  return Color(bgColor).isLight() ? '#000000' : '#ffffff'
}

export default function ScriptList() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [updatingScheduler, setUpdatingScheduler] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scriptsLoaded, setScriptsLoaded] = useState(false)

  const fetchScripts = useCallback(async () => {
    if (scriptsLoaded) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/scripts')
      if (!response.ok) {
        throw new Error('Failed to fetch scripts')
      }
      const data = await response.json()
      setScripts(data)
      setScriptsLoaded(true)
    } catch (error) {
      console.error('Error fetching scripts:', error)
      setError('Failed to load scripts. Please try again later.')
      showToast.error('Failed to load scripts')
    } finally {
      setIsLoading(false)
    }
  }, [scriptsLoaded])

  useEffect(() => {
    fetchScripts()
  }, [fetchScripts])

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
      const bgColor = getRandomColor()
      acc[tag] = {
        bg: bgColor,
        text: getContrastColor(bgColor)
      }
      return acc
    }, {} as Record<string, { bg: string; text: string }>)
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
          <div key={script.id} className="relative group">
            <Link href={`/script/${script.id}`}>
              <div className="glassmorphism-card p-6 hover:bg-white/15 transition-all duration-300 h-[280px] flex flex-col rounded-xl">
                <div className="absolute top-4 right-4">
                  {script.executions && script.executions.length > 0 && (
                    script.executions[0].status === 'success' ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <XCircle className="text-red-500" size={20} />
                    )
                  )}
                </div>
                <div className="flex items-start mb-4">
                  <div className="relative p-2 bg-white/10 rounded-lg mr-3 w-[64px] h-[64px] flex items-center justify-center">
                    <img 
                      src={script.type === 'Python' ? '/python.svg' : '/bash.svg'} 
                      alt={`${script.type} icon`}
                      className={cn(
                        "object-contain",
                        script.type === 'Python' ? 'w-[96px] h-[96px] -m-6' : 'w-9 h-9'
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <h3 className="text-xl font-semibold text-white group-hover:text-primary transition-colors">
                      {script.name}
                    </h3>
                    <p className="text-white/70 text-sm">{script.type}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {script.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="text-xs px-2 py-1 rounded-full flex items-center" 
                      style={{
                        backgroundColor: tagColors[tag].bg,
                        color: tagColors[tag].text
                      }}
                    >
                      <Tag size={12} className="mr-1 opacity-70" />
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-white/90 flex-1 pb-16">
                  <h4 className="font-medium mb-2 flex items-center text-white/80">
                    <Clock className="mr-2" size={14} />
                    Schedules:
                  </h4>
                  <div className="flex flex-wrap gap-2 max-w-[calc(100%-24px)]">
                    {script.schedules.map((schedule, index) => (
                      <span 
                        key={index}
                        className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-xs flex items-center"
                      >
                        <Clock size={12} className="mr-1.5 opacity-70" />
                        {translateCronSchedule(schedule)}
                      </span>
                    ))}
                    {script.schedules.length === 0 && (
                      <span className="text-white/50 italic text-xs">No schedules set</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
            <div 
              className="absolute bottom-4 right-4 flex items-center gap-2 z-10 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10" 
              onClick={(e) => e.preventDefault()}
            >
              <Power className={cn(
                "h-4 w-4",
                script.isSchedulerEnabled ? "text-green-500" : "text-red-500"
              )} />
              <span className="text-sm text-white/90">Scheduler</span>
              <Switch
                checked={script.isSchedulerEnabled}
                onCheckedChange={() => handleToggleScheduler(script.id, script.isSchedulerEnabled)}
                className={cn(
                  "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600",
                  updatingScheduler === script.id && "opacity-50 cursor-not-allowed"
                )}
                disabled={updatingScheduler === script.id}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

