import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { initializeDataDirectory } from '../../utils/init'
import scheduler from '../../../utils/scheduler'
import { logInfo, logError } from '../../../utils/logger'

const schedulerStateFile = path.join(process.cwd(), 'data', 'scheduler-state.json')

async function getSchedulerState() {
  await initializeDataDirectory()
  try {
    const data = await fs.readFile(schedulerStateFile, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    logError('api', 'Error reading scheduler state', { error })
    return { globalEnabled: true, scriptStates: {} }
  }
}

export async function GET() {
  try {
    const state = await getSchedulerState()
    logInfo('api', 'Fetched scheduler state', { state })
    return NextResponse.json(state)
  } catch (error) {
    logError('api', 'Failed to fetch scheduler state', { error })
    return NextResponse.json({ error: 'Failed to fetch scheduler state' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { isEnabled } = await request.json()
    
    if (typeof isEnabled !== 'boolean') {
      logError('api', 'Invalid isEnabled value in scheduler update', { isEnabled })
      return NextResponse.json({ error: 'Invalid isEnabled value' }, { status: 400 })
    }

    await scheduler.updateGlobalSchedulerState(isEnabled)
    logInfo('api', 'Updated global scheduler state', { isEnabled })

    const updatedState = await getSchedulerState()
    return NextResponse.json(updatedState)
  } catch (error) {
    logError('api', 'Failed to update scheduler state', { error })
    return NextResponse.json({ error: 'Failed to update scheduler state' }, { status: 500 })
  }
}

