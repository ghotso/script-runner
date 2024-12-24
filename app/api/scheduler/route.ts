import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const schedulerStateFile = path.join(process.cwd(), 'data', 'scheduler-state.json')

async function ensureSchedulerStateFileExists() {
  try {
    await fs.access(schedulerStateFile)
  } catch (error) {
    await fs.writeFile(schedulerStateFile, JSON.stringify({ isEnabled: true }), 'utf-8')
  }
}

export async function GET() {
  try {
    await ensureSchedulerStateFileExists()
    const data = await fs.readFile(schedulerStateFile, 'utf-8')
    const state = JSON.parse(data)
    return NextResponse.json(state)
  } catch (error) {
    console.error('Failed to fetch scheduler state:', error)
    return NextResponse.json({ error: 'Failed to fetch scheduler state' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { isEnabled } = await request.json()
    await ensureSchedulerStateFileExists()
    await fs.writeFile(schedulerStateFile, JSON.stringify({ isEnabled }), 'utf-8')
    return NextResponse.json({ isEnabled })
  } catch (error) {
    console.error('Failed to update scheduler state:', error)
    return NextResponse.json({ error: 'Failed to update scheduler state' }, { status: 500 })
  }
}

