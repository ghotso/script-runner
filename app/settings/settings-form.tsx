'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Save } from 'lucide-react'
import { updateSettings, getSettings } from '../actions'
import { toast } from 'react-hot-toast'

export default function SettingsForm() {
  const [discordWebhook, setDiscordWebhook] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getSettings()
      setDiscordWebhook(settings.discordWebhook || '')
    }
    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updateSettings({ discordWebhook })
      toast.success('Settings updated successfully')
    } catch (error) {
      toast.error('Failed to update settings')
    }
    setIsLoading(false)
  }

  return (
    <Card className="max-w-2xl mx-auto backdrop-blur-md bg-white/10 border-white/20">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Discord Webhook Settings</CardTitle>
        <CardDescription className="text-white/70">
          Configure the Discord webhook for failed script execution notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="discord-webhook" className="text-white">Discord Webhook URL</Label>
            <Input
              id="discord-webhook"
              type="url"
              value={discordWebhook}
              onChange={(e) => setDiscordWebhook(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="bg-white/5 border-white/10 text-white placeholder-white/50"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              'Saving...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

