'use client'

import { useState } from 'react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'

export default function Settings() {
  const [discordWebhook, setDiscordWebhook] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement settings update logic
    console.log({ discordWebhook })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="discordWebhook">Discord Webhook URL</Label>
          <Input
            id="discordWebhook"
            value={discordWebhook}
            onChange={(e) => setDiscordWebhook(e.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
          />
        </div>
        <Button type="submit">Save Settings</Button>
      </form>
    </div>
  )
}

