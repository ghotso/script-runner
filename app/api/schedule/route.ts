import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { scheduleScript } from '../../utils/scheduler'

const dataFile = path.join(process.cwd(), 'data', 'scripts.json')

export async function POST(request: Request) {
  try {
    const { scriptId, schedule } = await request.json()
    const data = await fs.readFile(dataFile, 'utf-8')
    const scripts = JSON.parse(data)
    const script = scripts.find((s: any) => s.id === scriptId)
    
    if (!script) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 })
    }

    scheduleScript(script, schedule)

    if (!script.schedules.includes(schedule)) {
      script.schedules.push(schedule)
      await fs.writeFile(dataFile, JSON.stringify(scripts, null, 2))
    }

    return NextResponse.json({ message: 'Schedule updated successfully' })
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}

