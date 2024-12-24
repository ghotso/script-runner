import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const settingsFile = path.join(process.cwd(), 'data', 'settings.json')

async function ensureSettingsFileExists() {
  try {
    await fs.access(settingsFile)
  } catch (error) {
    await fs.writeFile(settingsFile, JSON.stringify({ discordWebhook: '' }), 'utf-8')
  }
}

export async function GET() {
  try {
    await ensureSettingsFileExists()
    const data = await fs.readFile(settingsFile, 'utf-8')
    const settings = JSON.parse(data)
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { discordWebhook } = await request.json()
    await ensureSettingsFileExists()
    await fs.writeFile(settingsFile, JSON.stringify({ discordWebhook }), 'utf-8')
    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Failed to update settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

