'use client'

import { useState, useEffect } from 'react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Bell, Webhook } from 'lucide-react'
import { Switch } from '../components/ui/switch'
import { showToast } from '../lib/toast'

export default function Settings() {
  const [discordWebhook, setDiscordWebhook] = useState('')
  const [notifications, setNotifications] = useState({
    onSuccess: true,
    onFailure: true,
    onScheduled: false
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setDiscordWebhook(data.discordWebhook || '')
          setNotifications(data.notifications || {
            onSuccess: true,
            onFailure: true,
            onScheduled: false
          })
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
        showToast.error('Failed to load settings')
      }
    }

    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ discordWebhook, notifications }),
      })

      if (response.ok) {
        showToast.success('Settings updated successfully')
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      showToast.error('Failed to update settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-white">Settings</h1>
      
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Webhook className="h-5 w-5" />
            Discord Integration
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure Discord webhook for script execution notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="discordWebhook" className="text-gray-200">Webhook URL</Label>
              <Input
                id="discordWebhook"
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="font-mono bg-gray-900/50 border-gray-600 text-gray-200 placeholder:text-gray-500"
              />
            </div>
            <Button 
              type="submit" 
              className="bg-primary/20 text-primary hover:bg-primary/30"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure when to receive Discord notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-200">Successful Executions</Label>
                <p className="text-sm text-gray-400">
                  Notify when a script executes successfully
                </p>
              </div>
              <Switch
                checked={notifications.onSuccess}
                onCheckedChange={(checked) =>
                  setNotifications(prev => ({ ...prev, onSuccess: checked }))
                }
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-200">Failed Executions</Label>
                <p className="text-sm text-gray-400">
                  Notify when a script execution fails
                </p>
              </div>
              <Switch
                checked={notifications.onFailure}
                onCheckedChange={(checked) =>
                  setNotifications(prev => ({ ...prev, onFailure: checked }))
                }
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-200">Scheduled Executions</Label>
                <p className="text-sm text-gray-400">
                  Notify for scheduled script executions
                </p>
              </div>
              <Switch
                checked={notifications.onScheduled}
                onCheckedChange={(checked) =>
                  setNotifications(prev => ({ ...prev, onScheduled: checked }))
                }
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

