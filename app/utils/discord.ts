import fs from 'fs/promises'
import path from 'path'

const settingsFile = path.join(process.cwd(), 'data', 'settings.json')

interface Settings {
  discordWebhook: string;
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    onScheduled: boolean;
  };
}

async function getSettings(): Promise<Settings> {
  try {
    const data = await fs.readFile(settingsFile, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to read settings:', error)
    return {
      discordWebhook: '',
      notifications: {
        onSuccess: true,
        onFailure: true,
        onScheduled: false
      }
    }
  }
}

export async function sendDiscordNotification(message: string, type: 'success' | 'failure' | 'scheduled') {
  const settings = await getSettings()
  
  if (!settings.discordWebhook) {
    console.log('Discord webhook URL not set. Skipping notification.')
    return
  }

  // Check if we should send this type of notification
  if (
    (type === 'success' && !settings.notifications.onSuccess) ||
    (type === 'failure' && !settings.notifications.onFailure) ||
    (type === 'scheduled' && !settings.notifications.onScheduled)
  ) {
    console.log(`Skipping ${type} notification as per user settings.`)
    return
  }

  try {
    const response = await fetch(settings.discordWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: message }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    console.log('Discord notification sent successfully')
  } catch (error) {
    console.error('Failed to send Discord notification:', error)
  }
}

