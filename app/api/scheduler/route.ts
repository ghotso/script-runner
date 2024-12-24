import { NextResponse } from 'next/server'
import { updateSchedulerState } from '../../utils/scheduler'

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
    await updateSchedulerState(isEnabled)
    return NextResponse.json({ isEnabled })
  } catch (error) {
    console.error('Failed to update scheduler state:', error)
    return NextResponse.json({ error: 'Failed to update scheduler state' }, { status: 500 })
  }
}

