import fetch from 'cross-fetch'

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

export async function sendDiscordNotification(message: string, type: 'success' | 'failure' | 'scheduled'): Promise<void> {
  if (!DISCORD_WEBHOOK_URL) {
    console.log('Discord webhook URL not set. Skipping notification.')
    return
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
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

