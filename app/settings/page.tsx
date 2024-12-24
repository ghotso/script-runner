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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setDiscordWebhook(data.discordWebhook || '')
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
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ discordWebhook }),
      })

      if (response.ok) {
        showToast.success('Settings updated successfully')
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      showToast.error('Failed to update settings')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">Settings</h1>
      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Discord Integration
            </CardTitle>
            <CardDescription>
              Configure Discord webhook for script execution notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discordWebhook">Webhook URL</Label>
                <Input
                  id="discordWebhook"
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="font-mono"
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure when to receive Discord notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifySuccess" className="flex flex-col gap-1">
                  <span>Successful Executions</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Notify when a script executes successfully
                  </span>
                </Label>
                <Switch
                  id="notifySuccess"
                  checked={notifications.onSuccess}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, onSuccess: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifyFailure" className="flex flex-col gap-1">
                  <span>Failed Executions</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Notify when a script execution fails
                  </span>
                </Label>
                <Switch
                  id="notifyFailure"
                  checked={notifications.onFailure}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, onFailure: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifyScheduled" className="flex flex-col gap-1">
                  <span>Scheduled Executions</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Notify for scheduled script executions
                  </span>
                </Label>
                <Switch
                  id="notifyScheduled"
                  checked={notifications.onScheduled}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, onScheduled: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

