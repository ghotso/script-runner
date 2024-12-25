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
    const { action, scriptId, isEnabled } = await request.json()
    
    if (action === 'updateGlobal') {
      await scheduler.updateGlobalSchedulerState(isEnabled)
      logInfo('api', 'Updated global scheduler state', { isEnabled })
    } else if (action === 'updateScript' && scriptId) {
      await scheduler.updateScriptSchedulerState(scriptId, isEnabled)
      logInfo('api', 'Updated script scheduler state', { scriptId, isEnabled })
    } else {
      logError('api', 'Invalid action in scheduler update', { action, scriptId, isEnabled })
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedState = await getSchedulerState()
    return NextResponse.json(updatedState)
  } catch (error) {
    logError('api', 'Failed to update scheduler state', { error })
    return NextResponse.json({ error: 'Failed to update scheduler state' }, { status: 500 })
  }
}

