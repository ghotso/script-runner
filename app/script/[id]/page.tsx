'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import CodeEditor from '../../components/CodeEditor'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Play, Trash2, Clock, Save, Plus, Download, CheckCircle, XCircle, Loader, X, Timer, FileCode, Terminal, Tag } from 'lucide-react'
import { Slide, ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { translateCronSchedule } from '../../utils/cron'

type Execution = {
  id: string;
  status: 'success' | 'failed';
  timestamp: string;
  log: string;
  runtime?: number; // in milliseconds
};

type Script = {
  id: string;
  name: string;
  type: string;
  tags: string[];
  code: string;
  dependencies: string;
  schedules: string[];
  executions: Execution[];
};

export default function ScriptDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isRunning, setIsRunning] = useState(false)
  const [isInstallingDependencies, setIsInstallingDependencies] = useState(false)
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
        toast.error('Failed to load script', { transition: Slide })
      }
    }

    fetchScript()
  }, [params.id])

  const handleRun = async () => {
    if (!script) return
    setIsRunning(true)
    try {
      const response = await fetch(`/api/scripts/${script.id}/run`, { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to run script')
      }

      setScript(prevScript => {
        if (!prevScript) return null
        return {
          ...prevScript,
          executions: [data.execution, ...prevScript.executions].slice(0, 10)
        }
      })

      if (data.execution.status === 'success') {
        toast.success('Script executed successfully!', { transition: Slide })
      } else {
        toast.error('Script execution failed. Check the logs for details.', { transition: Slide })
      }
    } catch (error) {
      console.error('Error running script:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to execute script', { transition: Slide })
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
      toast.success('Script deleted successfully!', { transition: Slide })
      router.push('/')
    } catch (error) {
      console.error('Error deleting script:', error)
      toast.error('Failed to delete script', { transition: Slide })
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
      toast.success('Script saved successfully!', { transition: Slide })
    } catch (error) {
      console.error('Error saving script:', error)
      toast.error('Failed to save script', { transition: Slide })
    }
  }

  const handleChange = (field: keyof Script, value: string) => {
    setScript(prev => {
      if (!prev) return null
      return { ...prev, [field]: value }
    })
  }

  const handleAddTag = async () => {
    if (!script || !newTag || script.tags.includes(newTag)) return
    const updatedTags = [...script.tags, newTag]
    setScript(prev => prev ? { ...prev, tags: updatedTags } : null)
    setNewTag('')
    await saveChanges({ tags: updatedTags })
    toast.success(`Tag "${newTag}" added successfully!`, { transition: Slide })
  }

  const handleAddSchedule = async () => {
    if (!script || !newSchedule || script.schedules.includes(newSchedule)) return
    const updatedSchedules = [...script.schedules, newSchedule]
    setScript(prev => prev ? { ...prev, schedules: updatedSchedules } : null)
    setNewSchedule('')
    await saveChanges({ schedules: updatedSchedules })
    toast.success(`Schedule "${newSchedule}" added successfully!`, { transition: Slide })
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
    setIsInstallingDependencies(true)
    try {
      const response = await fetch(`/api/scripts/${script.id}/install-dependencies`, { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to install dependencies')
      }

      // Show the detailed message from the server if available
      toast.success(data.message || 'Dependencies installed successfully!', { transition: Slide })
    } catch (error) {
      console.error('Error installing dependencies:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to install dependencies', { transition: Slide })
    } finally {
      setIsInstallingDependencies(false)
    }
  }

  const handleDeleteTag = async (tagToDelete: string) => {
    if (!script) return
    const updatedTags = script.tags.filter(tag => tag !== tagToDelete)
    setScript(prev => prev ? { ...prev, tags: updatedTags } : null)
    await saveChanges({ tags: updatedTags })
    toast.success(`Tag "${tagToDelete}" removed`, { transition: Slide })
  }

  const handleDeleteSchedule = async (scheduleToDelete: string) => {
    if (!script) return
    const updatedSchedules = script.schedules.filter(schedule => schedule !== scheduleToDelete)
    setScript(prev => prev ? { ...prev, schedules: updatedSchedules } : null)
    await saveChanges({ schedules: updatedSchedules })
    toast.success(`Schedule removed`, { transition: Slide })
  }

  const saveChanges = async (changes: Partial<Script>) => {
    try {
      const response = await fetch(`/api/scripts/${script!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes)
      })
      if (!response.ok) {
        throw new Error('Failed to save changes')
      }
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error('Failed to save changes', { transition: Slide })
    }
  }

  if (!script) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileCode className="h-8 w-8" />
          {script.name}
        </h1>
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
          <Button onClick={handleInstallDependencies} disabled={isInstallingDependencies}>
            {isInstallingDependencies ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Installing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Install Dependencies
              </>
            )}
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
            <Label htmlFor="dependencies" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Dependencies
            </Label>
            <CodeEditor
              value={script.dependencies}
              onChange={(value) => handleChange('dependencies', value)}
              language="plaintext"
            />
          </div>
          <div>
            <Label htmlFor="code" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Script Code
            </Label>
            <CodeEditor
              value={script.code}
              onChange={(value) => handleChange('code', value)}
              language={script.type.toLowerCase() as 'python' | 'bash'}
            />
          </div>
        </div>
        <div className="space-y-4">
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
              <Button onClick={handleAddSchedule}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="rounded-md border mt-2">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Schedule</th>
                    <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Next Run</th>
                    <th className="h-10 w-[50px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {script.schedules.map((schedule, index) => (
                    <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-2 align-middle">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{schedule}</span>
                        </div>
                      </td>
                      <td className="p-2 align-middle text-sm text-muted-foreground">
                        {translateCronSchedule(schedule)}
                      </td>
                      <td className="p-2 align-middle">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSchedule(schedule)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {script.schedules.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-2 text-center text-sm text-muted-foreground">
                        No schedules configured
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
              <Button onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {script.tags.map(tag => (
                <div key={tag} className="group relative">
                  <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                    <span>{tag}</span>
                    <Button
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
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Execution History
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {script.executions.slice(0, 10).map(execution => (
                <div
                  key={execution.id}
                  className="glassmorphism p-3 cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() => setSelectedExecution(execution)}
                >
                  <div className="flex items-center justify-between mb-1">
                    {execution.status === 'success' ? (
                      <CheckCircle className="text-green-500" size={16} />
                    ) : execution.status === 'failed' ? (
                      <XCircle className="text-red-500" size={16} />
                    ) : (
                      <Clock className="text-yellow-500" size={16} />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(execution.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Timer className="h-3 w-3" />
                    <span>{execution.runtime ? `${(execution.runtime / 1000).toFixed(1)}s` : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {selectedExecution && (
        <div className="fixed inset-x-0 top-0 z-50 flex justify-center">
          <div className="w-full max-w-4xl m-4">
            <div className="glassmorphism p-6 relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Execution Log</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Timer className="h-4 w-4" />
                    <span>{selectedExecution.runtime ? `${(selectedExecution.runtime / 1000).toFixed(1)}s` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(selectedExecution.timestamp).toLocaleString()}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedExecution(null)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-black/50 rounded-lg p-4 max-h-[60vh] overflow-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm">{selectedExecution.log}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}

