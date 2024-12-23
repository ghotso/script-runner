'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import CodeEditor from '../../components/CodeEditor'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Play, Trash2, Clock, Save, Plus, Download, CheckCircle, XCircle, Loader, X } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { translateCronSchedule } from '../../utils/cron'

type Script = {
  id: string;
  name: string;
  type: string;
  tags: string[];
  code: string;
  dependencies: string;
  schedules: string[];
  executions: Array<{
    id: string;
    status: 'success' | 'failed';
    timestamp: string;
    log: string;
  }>;
};

export default function ScriptDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isRunning, setIsRunning] = useState(false)
  const [script, setScript] = useState<Script | null>(null)
  const [newTag, setNewTag] = useState('')
  const [newSchedule, setNewSchedule] = useState('')
  const [selectedExecution, setSelectedExecution] = useState<Script['executions'][0] | null>(null)

  useEffect(() => {
    const fetchScript = async () => {
      try {
        const response = await fetch(`/api/scripts/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch script')
        }
        const data = await response.json()
        setScript(data)
      } catch (error) {
        console.error('Error fetching script:', error)
        toast.error('Failed to load script')
      }
    }

    fetchScript()
  }, [params.id])

  const handleRun = async () => {
    if (!script) return
    setIsRunning(true)
    try {
      const response = await fetch(`/api/scripts/${script.id}/run`, { method: 'POST' })
      if (!response.ok) {
        throw new Error('Failed to run script')
      }
      const data = await response.json()
      setScript(prevScript => {
        if (!prevScript) return null
        return {
          ...prevScript,
          executions: [data.execution, ...prevScript.executions].slice(0, 10)
        }
      })
      toast.success('Script executed successfully!')
    } catch (error) {
      console.error('Error running script:', error)
      toast.error('Failed to execute script')
    } finally {
      setIsRunning(false)
    }
  }

  const handleDelete = async () => {
    if (!script) return
    try {
      const response = await fetch(`/api/scripts/${script.id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Failed to delete script')
      }
      toast.success('Script deleted successfully!')
      router.push('/')
    } catch (error) {
      console.error('Error deleting script:', error)
      toast.error('Failed to delete script')
    }
  }

  const handleSave = async () => {
    if (!script) return
    try {
      const response = await fetch(`/api/scripts/${script.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(script)
      })
      if (!response.ok) {
        throw new Error('Failed to save script')
      }
      toast.success('Script saved successfully!')
    } catch (error) {
      console.error('Error saving script:', error)
      toast.error('Failed to save script')
    }
  }

  const handleChange = (field: keyof Script, value: string) => {
    setScript(prev => {
      if (!prev) return null
      return { ...prev, [field]: value }
    })
  }

  const handleAddTag = () => {
    if (!script || !newTag || script.tags.includes(newTag)) return
    setScript(prev => {
      if (!prev) return null
      return { ...prev, tags: [...prev.tags, newTag] }
    })
    setNewTag('')
    toast.success(`Tag "${newTag}" added successfully!`)
  }

  const handleAddSchedule = () => {
    if (!script || !newSchedule || script.schedules.includes(newSchedule)) return
    setScript(prev => {
      if (!prev) return null
      return { ...prev, schedules: [...prev.schedules, newSchedule] }
    })
    setNewSchedule('')
    toast.success(`Schedule "${newSchedule}" added successfully!`)
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

  const handleInstallDependencies = async () => {
    if (!script) return
    toast.info('Installing dependencies... (This is a mock action)')
    // In a real scenario, you would send a request to the server to install dependencies
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Dependencies installed successfully!')
  }

  const handleDeleteTag = (tagToDelete: string) => {
    if (!script) return
    setScript(prev => {
      if (!prev) return null
      return { ...prev, tags: prev.tags.filter(tag => tag !== tagToDelete) }
    })
    toast.success(`Tag "${tagToDelete}" removed`)
  }

  const handleDeleteSchedule = (scheduleToDelete: string) => {
    if (!script) return
    setScript(prev => {
      if (!prev) return null
      return { ...prev, schedules: prev.schedules.filter(schedule => schedule !== scheduleToDelete) }
    })
    toast.success(`Schedule removed`)
  }

  if (!script) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">{script.name}</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleRun} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Script
              </>
            )}
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Script
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div>
            <Label htmlFor="dependencies">Dependencies</Label>
            <CodeEditor
              value={script.dependencies}
              onChange={(value) => handleChange('dependencies', value)}
              language="plaintext"
            />
          </div>
          <div>
            <Label htmlFor="code">Script Code</Label>
            <CodeEditor
              value={script.code}
              onChange={(value) => handleChange('code', value)}
              language={script.type.toLowerCase() as 'python' | 'bash'}
            />
          </div>
          <Button onClick={handleInstallDependencies}>
            <Download className="mr-2 h-4 w-4" />
            Install Dependencies
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="schedules">Schedules</Label>
            <div className="flex space-x-2">
              <Input
                id="schedules"
                value={newSchedule}
                onChange={(e) => setNewSchedule(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'schedule')}
                placeholder="Add new schedule"
              />
              <Button onClick={handleAddSchedule}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ul className="mt-2 space-y-1">
              {script.schedules.map((schedule, index) => (
                <li key={index} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-2">
                    <Clock size={16} />
                    <span>{translateCronSchedule(schedule)}</span>
                  </div>
                  <Button
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
            <Label htmlFor="tags">Tags</Label>
            <div className="flex space-x-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'tag')}
                placeholder="Add new tag"
              />
              <Button onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {script.tags.map(tag => (
                <span key={tag} className="bg-blue-600 text-xs px-2 py-1 rounded-full flex items-center group">
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTag(tag)}
                    className="ml-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Execution History</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {script.executions.slice(0, 12).map(execution => (
            <div
              key={execution.id}
              className="glassmorphism p-4 cursor-pointer"
              onClick={() => setSelectedExecution(execution)}
            >
              <div className="flex items-center justify-between mb-2">
                {execution.status === 'success' ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : (
                  <XCircle className="text-red-500" size={24} />
                )}
                <span className="text-sm text-muted-foreground">
                  {new Date(execution.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm truncate">{execution.log}</p>
            </div>
          ))}
        </div>
      </div>
      {selectedExecution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="glassmorphism p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <h3 className="text-xl font-semibold mb-4">Execution Log</h3>
            <pre className="whitespace-pre-wrap">{selectedExecution.log}</pre>
            <Button className="mt-4" onClick={() => setSelectedExecution(null)}>Close</Button>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  )
}

