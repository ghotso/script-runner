import fs from 'fs/promises'
import path from 'path'

const settingsFile = path.join(process.cwd(), 'data', 'settings.json')

async function getDiscordWebhook() {
  try {
    const data = await fs.readFile(settingsFile, 'utf-8')
    const settings = JSON.parse(data)
    return settings.discordWebhook
  } catch (error) {
    console.error('Failed to read Discord webhook:', error)
    return null
  }
}

export async function sendDiscordNotification(message: string) {
  const webhookUrl = await getDiscordWebhook()
  if (!webhookUrl) {
    console.error('Discord webhook URL not set')
    return
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: message }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error('Failed to send Discord notification:', error)
  }
}

