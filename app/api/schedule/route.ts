import { NextResponse } from 'next/server'
import cron from 'node-cron'
import fs from 'fs/promises'
import path from 'path'
import { exec, ExecException } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)
const dataFile = path.join(process.cwd(), 'data', 'scripts.json')
const logsDir = path.join(process.cwd(), 'data', 'logs')

const scheduledJobs: { [key: string]: cron.ScheduledTask } = {}

interface ExecResult {
  stdout: string;
  stderr: string;
}

export async function POST(request: Request) {
  try {
    // Ensure logs directory exists with proper permissions
    await fs.mkdir(logsDir, { recursive: true, mode: 0o755 })

    const { scriptId, schedule } = await request.json()
    const data = await fs.readFile(dataFile, 'utf-8')
    const scripts = JSON.parse(data)
    const script = scripts.find((s: any) => s.id === scriptId)
    if (!script) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 })
    }

    if (scheduledJobs[scriptId]) {
      scheduledJobs[scriptId].stop()
    }

    scheduledJobs[scriptId] = cron.schedule(schedule, async () => {
      const scriptPath = path.join(process.cwd(), 'scripts', `${script.id}.${script.type.toLowerCase()}`)
      await fs.writeFile(scriptPath, script.code)

      let command
      if (script.type === 'Python') {
        command = `${process.env.VIRTUAL_ENV}/bin/python ${scriptPath}`
      } else if (script.type === 'Bash') {
        command = `bash ${scriptPath}`
      } else {
        console.error('Unsupported script type')
        return
      }

      try {
        let stdout = ''
        let stderr = ''
        let exitCode = 0

        try {
          const result: ExecResult = await execPromise(command)
          stdout = result.stdout
          stderr = result.stderr
        } catch (error) {
          const execError = error as ExecException & { stdout?: string; stderr?: string }
          stdout = execError.stdout || ''
          stderr = execError.stderr || execError.message
          exitCode = execError.code || 1
        }

        const startTime = Date.now()
        const endTime = Date.now()
        const runtime = endTime - startTime

        const execution = {
          id: Date.now().toString(),
          status: exitCode === 0 ? 'success' : 'failed',
          timestamp: new Date().toISOString(),
          log: stdout || stderr,
          runtime,
          triggeredBySchedule: true
        }

        script.executions = [execution, ...(script.executions || [])].slice(0, 10)
        await fs.writeFile(dataFile, JSON.stringify(scripts, null, 2))

        // Log to file
        const logFile = path.join(logsDir, `${script.id}.log`)
        await fs.appendFile(logFile, `${new Date().toISOString()} - ${execution.status}\n${stdout || stderr}\n\n`)

        console.log(`Script ${script.id} executed:`, stdout)
        if (stderr) {
          console.error(`Script ${script.id} error:`, stderr)
        }
      } catch (error) {
        console.error(`Failed to execute script ${script.id}:`, error)
        // Log the error
        const logFile = path.join(logsDir, 'error.log')
        await fs.appendFile(logFile, `${new Date().toISOString()} - Failed to execute script ${script.id}: ${error}\n\n`)
      } finally {
        await fs.unlink(scriptPath)
      }
    })

    script.schedule = schedule
    await fs.writeFile(dataFile, JSON.stringify(scripts, null, 2))

    return NextResponse.json({ message: 'Schedule updated successfully' })
  } catch (error) {
    console.error('Error updating schedule:', error)
    // Log the error
    try {
      const logFile = path.join(logsDir, 'error.log')
      await fs.appendFile(logFile, `${new Date().toISOString()} - Error updating schedule: ${error}\n\n`)
    } catch (logError) {
      console.error('Failed to write to error log:', logError)
    }
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}

