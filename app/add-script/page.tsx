'use client'

import { useState, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import CodeEditor from '../components/CodeEditor'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Plus, Clock, Tag, X, FileCode, Terminal, Save } from 'lucide-react'
import { showToast } from '../lib/toast'

export default function AddScript() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [type, setType] = useState('Python')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [schedules, setSchedules] = useState<string[]>([])
  const [newSchedule, setNewSchedule] = useState('')
  const [code, setCode] = useState('')
  const [dependencies, setDependencies] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, type, tags, schedules, code, dependencies }),
      })

      if (!response.ok) {
        throw new Error('Failed to create script')
      }

      showToast.success('Script created successfully!')
      router.push('/')
    } catch (error) {
      console.error('Error creating script:', error)
      showToast.error('Failed to create script')
    }
  }

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags(prev => [...prev, newTag])
      setNewTag('')
      showToast.success(`Tag "${newTag}" added successfully!`)
    }
  }

  const handleAddSchedule = () => {
    if (newSchedule && !schedules.includes(newSchedule)) {
      setSchedules(prev => [...prev, newSchedule])
      setNewSchedule('')
      showToast.success(`Schedule "${newSchedule}" added successfully!`)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>, action: 'tag' | 'schedule') => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (action === 'tag') {
        handleAddTag()
      } else {
        handleAddSchedule()
      }
    }
  }

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToDelete))
    showToast.success(`Tag "${tagToDelete}" removed`)
  }

  const handleDeleteSchedule = (scheduleToDelete: string) => {
    setSchedules(prev => prev.filter(schedule => schedule !== scheduleToDelete))
    showToast.success(`Schedule removed`)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <FileCode className="h-8 w-8" />
        Add New Script
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Script Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="type" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Script Type
          </Label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-white/5 text-white rounded px-3 py-2 border border-white/10"
          >
            <option value="Python">Python</option>
            <option value="Bash">Bash</option>
          </select>
        </div>
        <div>
          <Label htmlFor="tags" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </Label>
          <div className="flex space-x-2">
            <Input
              id="tags"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'tag')}
              placeholder="Add new tag"
            />
            <Button type="button" onClick={handleAddTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => (
              <div key={tag} className="group relative">
                <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                  <span>{tag}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTag(tag)}
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="schedules" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Schedules
          </Label>
          <div className="flex space-x-2">
            <Input
              id="schedules"
              value={newSchedule}
              onChange={(e) => setNewSchedule(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'schedule')}
              placeholder="Add new schedule"
            />
            <Button type="button" onClick={handleAddSchedule}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ul className="mt-2 space-y-1">
            {schedules.map((schedule, index) => (
              <li key={index} className="flex items-center justify-between group">
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{schedule}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSchedule(schedule)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Label htmlFor="dependencies" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Dependencies
          </Label>
          <CodeEditor
            value={dependencies}
            onChange={setDependencies}
            language="plaintext"
          />
        </div>
        <div>
          <Label htmlFor="code" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Script Code
          </Label>
          <CodeEditor
            value={code}
            onChange={setCode}
            language={type.toLowerCase() as 'python' | 'bash'}
          />
        </div>
        <Button type="submit" className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Script
        </Button>
      </form>
    </div>
  )
}

