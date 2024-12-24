'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import CodeEditor from '../../components/CodeEditor'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Play, Trash2, Clock, Save, Plus, Download, CheckCircle, XCircle, Loader, X, Timer, FileCode, Terminal, Tag, AlarmClock, Power } from 'lucide-react'
import { showToast } from '../../lib/toast'
import { translateCronSchedule } from '../../utils/cron'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip'
import { Script } from '../../types/script'
import { cn } from '../../lib/utils'
import { Switch } from '../../components/ui/switch'

export default function ScriptDetails() {
  const router = useRouter()
  const params = useParams()
  const [isRunning, setIsRunning] = useState(false)
  const [isInstallingDependencies, setIsInstallingDependencies] = useState(false)
  const [script, setScript] = useState<Script | null>(null)
  const [newTag, setNewTag] = useState('')
  const [newSchedule, setNewSchedule] = useState('')
  const [selectedExecution, setSelectedExecution] = useState<Script['executions'][0] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchScript = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/scripts/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch script')
        }
        const data = await response.json()
        setScript(data)
      } catch (error) {
        console.error('Error fetching script:', error)
        showToast.error('Failed to load script')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchScript()
    }
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
          executions: [data.execution, ...prevScript.executions].slice(0, 20)
        }
      })

      showToast.success(data.message || 'Script executed successfully!')
    } catch (error) {
      console.error('Error running script:', error)
      showToast.error(error instanceof Error ? error.message : 'Failed to execute script')
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
      showToast.success('Script deleted successfully!')
      router.push('/')
    } catch (error) {
      console.error('Error deleting script:', error)
      showToast.error('Failed to delete script')
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
      showToast.success('Script saved successfully!')
    } catch (error) {
      console.error('Error saving script:', error)
      showToast.error('Failed to save script')
    }
  }

  const handleChange = (field: keyof Script, value: string | boolean) => {
    setScript(prev => {
      if (!prev) return null
      return { ...prev, [field]: value }
    })
  }

  const handleAddTag = async () => {
    if (!script || !newTag || script.tags.includes(newTag)) return
    const updatedTags = [...script.tags, newTag]
    try {
      await saveChanges({ tags: updatedTags })
      setScript(prev => prev ? { ...prev, tags: updatedTags } : null)
      setNewTag('')
      showToast.success(`Tag "${newTag}" added successfully!`)
    } catch (error) {
      showToast.error('Failed to add tag')
    }
  }

  const handleAddSchedule = async () => {
    if (!script || !newSchedule || script.schedules.includes(newSchedule)) return
    const updatedSchedules = [...script.schedules, newSchedule]
    try {
      await saveChanges({ schedules: updatedSchedules })
      setScript(prev => prev ? { ...prev, schedules: updatedSchedules } : null)
      setNewSchedule('')
      
      // Update the scheduler
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: script.id, schedule: newSchedule })
      })
      if (!response.ok) {
        throw new Error('Failed to update scheduler')
      }
      showToast.success(`Schedule "${newSchedule}" added successfully!`)
    } catch (error) {
      console.error('Error updating scheduler:', error)
      showToast.error('Failed to update scheduler')
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

  const handleInstallDependencies = async () => {
    if (!script) return
    setIsInstallingDependencies(true)
    try {
      const response = await fetch(`/api/scripts/${script.id}/install-dependencies`, { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to install dependencies')
      }

      showToast.success(data.message || 'Dependencies installed successfully!')
    } catch (error) {
      console.error('Error installing dependencies:', error)
      showToast.error(error instanceof Error ? error.message : 'Failed to install dependencies')
    } finally {
      setIsInstallingDependencies(false)
    }
  }

  const handleDeleteTag = async (tagToDelete: string) => {
    if (!script) return
    const updatedTags = script.tags.filter(tag => tag !== tagToDelete)
    try {
      await saveChanges({ tags: updatedTags })
      setScript(prev => prev ? { ...prev, tags: updatedTags } : null)
      showToast.success(`Tag "${tagToDelete}" removed`)
    } catch (error) {
      showToast.error('Failed to remove tag')
    }
  }

  const handleDeleteSchedule = async(scheduleToDelete: string) => {
    if (!script) return
    const updatedSchedules = script.schedules.filter(schedule => schedule !== scheduleToDelete)
    try {
      await saveChanges({ schedules: updatedSchedules })
      setScript(prev => prev ? { ...prev, schedules: updatedSchedules } : null)
      
      // Update the scheduler
      const response = await fetch('/api/schedule', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: script.id, schedule: scheduleToDelete })
      })
      if (!response.ok) {
        throw new Error('Failed to update scheduler')
      }
      showToast.success(`Schedule removed`)
    } catch (error) {
      console.error('Error updating scheduler:', error)
      showToast.error('Failed to update scheduler')
    }
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
      throw error
    }
  }

  const toggleScriptScheduler = async () => {
    if (!script) return
    setIsLoading(true)
    try {
      const updatedScript = { ...script, isSchedulerEnabled: !script.isSchedulerEnabled }
      await saveChanges(updatedScript)
      setScript(updatedScript)
      showToast.success(`Script scheduler ${updatedScript.isSchedulerEnabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      showToast.error('Failed to update script scheduler state')
    } finally {
      setIsLoading(false)
    }
  }

  if (!script) {
    return <div className="glassmorphism p-6 rounded-lg">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileCode className="h-8 w-8" />
          {script.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10"
          >
            <Power 
              className={cn(
                "h-4 w-4",
                script.isSchedulerEnabled ? "text-green-500" : "text-red-500"
              )} 
            />
            <span className="text-sm text-white/90">Scheduler</span>
            <Switch
              checked={script.isSchedulerEnabled}
              onCheckedChange={toggleScriptScheduler}
              className={cn(
                "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600",
                "transition-opacity",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading}
            />
          </div>
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
          <div className="glassmorphism p-4 rounded-lg">
            <Label htmlFor="dependencies" className="flex items-center gap-2 mb-2">
              <FileCode className="h-4 w-4" />
              Dependencies
            </Label>
            <CodeEditor
              value={script.dependencies}
              onChange={(value) => handleChange('dependencies', value)}
              language="plaintext"
            />
          </div>
          <div className="glassmorphism p-4 rounded-lg">
            <Label htmlFor="code" className="flex items-center gap-2 mb-2">
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
          <div className="glassmorphism p-4 rounded-lg">
            <Label htmlFor="schedules" className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4" />
              Schedules
            </Label>
            <div className="flex space-x-2 mb-2">
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
                    <th className="h-10 w-[50px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {script.schedules.map((schedule, index) => (
                    <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-2 align-middle">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{schedule} | {translateCronSchedule(schedule)}</span>
                        </div>
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
                      <td colSpan={2} className="p-2 text-center text-sm text-muted-foreground">
                        No schedules configured
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="glassmorphism p-4 rounded-lg">
            <Label htmlFor="tags" className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            <div className="flex space-x-2 mb-2">
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
          <div className="glassmorphism p-4 rounded-lg">
            <Label className="flex items-center gap-2 mb-2">
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
                    {execution.triggeredBySchedule && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <AlarmClock className="h-3 w-3 ml-2" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Triggered by schedule</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {selectedExecution && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-8 z-50">
          <div className="w-full max-w-4xl mx-4">
            <div id="execution-modal" className="glassmorphism p-6 relative">
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
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {selectedExecution.log.replace('Errors/Warnings:', 'Script Log Output:')}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

