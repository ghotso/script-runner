'use client'

import { useState, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import CodeEditor from '../components/CodeEditor'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Plus, Clock, Tag, X, FileCode, Terminal, Save } from 'lucide-react'
import { showToast } from '../lib/toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
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
    } finally {
      setIsSubmitting(false)
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
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-2xl">
            <FileCode className="h-6 w-6" />
            Add New Script
          </CardTitle>
          <CardDescription className="text-gray-400">
            Create a new script with schedules and dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-200 flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Script Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-gray-900/50 border-gray-600 text-gray-200 placeholder:text-gray-500"
                placeholder="Enter script name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-200 flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Script Type
              </Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-gray-900/50 text-gray-200 rounded-md px-3 py-2 border border-gray-600 focus:border-gray-400 focus:ring-gray-400"
              >
                <option value="Python">Python</option>
                <option value="Bash">Bash</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-gray-200 flex items-center gap-2">
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
                  className="bg-gray-900/50 border-gray-600 text-gray-200 placeholder:text-gray-500"
                />
                <Button 
                  type="button" 
                  onClick={handleAddTag}
                  className="bg-gray-700 hover:bg-gray-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <div key={tag} className="group relative">
                    <div className="bg-gray-700 text-gray-200 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                      <span>{tag}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTag(tag)}
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedules" className="text-gray-200 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedules
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="schedules"
                  value={newSchedule}
                  onChange={(e) => setNewSchedule(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'schedule')}
                  placeholder="Add new schedule (cron format)"
                  className="bg-gray-900/50 border-gray-600 text-gray-200 placeholder:text-gray-500"
                />
                <Button 
                  type="button" 
                  onClick={handleAddSchedule}
                  className="bg-gray-700 hover:bg-gray-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {schedules.map((schedule, index) => (
                  <div key={index} className="flex items-center justify-between group bg-gray-700/50 rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2 text-gray-200">
                      <Clock size={16} />
                      <span>{schedule}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dependencies" className="text-gray-200 flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Dependencies
              </Label>
              <div className="bg-gray-900/50 rounded-lg border border-gray-600">
                <CodeEditor
                  value={dependencies}
                  onChange={setDependencies}
                  language="plaintext"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-gray-200 flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Script Code
              </Label>
              <div className="bg-gray-900/50 rounded-lg border border-gray-600">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={type.toLowerCase() as 'python' | 'bash'}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary/20 text-primary hover:bg-primary/30"
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Script'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

