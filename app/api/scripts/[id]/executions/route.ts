import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const logsDir = path.join(process.cwd(), 'data', 'logs')

export async function GET(request: NextRequest) {
  try {
    const id = request.url.split('/').slice(-2)[0]
    const logFile = path.join(logsDir, `${id}.log`)

    try {
      await fs.access(logFile)
    } catch (error) {
      return NextResponse.json({ executions: [] })
    }

    const logContent = await fs.readFile(logFile, 'utf-8')
    const executions = logContent
      .split('\n')
      .filter(Boolean)
      .map(JSON.parse)
      .filter(log => log.metadata && log.metadata.status)
      .map(log => ({
        id: log.metadata.id,
        status: log.metadata.status,
        timestamp: log.timestamp,
        runtime: log.metadata.runtime,
        triggeredBySchedule: log.metadata.triggeredBySchedule
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)

    return NextResponse.json({ executions })
  } catch (error) {
    console.error('Failed to fetch script executions:', error)
    return NextResponse.json({ error: 'Failed to fetch script executions' }, { status: 500 })
  }
}

