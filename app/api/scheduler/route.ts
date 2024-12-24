import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { initializeDataDirectory } from '../../utils/init'

const schedulerStateFile = path.join(process.cwd(), 'data', 'scheduler-state.json')

async function getSchedulerState() {
  await initializeDataDirectory()
  try {
    const data = await fs.readFile(schedulerStateFile, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading scheduler state:', error)
    return { isEnabled: false }
  }
}

export async function GET() {
  try {
    const { isEnabled } = await getSchedulerState()
    return NextResponse.json({ isEnabled })
  } catch (error) {
    console.error('Failed to fetch scheduler state:', error)
    return NextResponse.json({ error: 'Failed to fetch scheduler state' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { isEnabled } = await request.json()
    await fs.writeFile(schedulerStateFile, JSON.stringify({ isEnabled }), 'utf-8')
    return NextResponse.json({ isEnabled })
  } catch (error) {
    console.error('Failed to update scheduler state:', error)
    return NextResponse.json({ error: 'Failed to update scheduler state' }, { status: 500 })
  }
}

