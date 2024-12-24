import { NextResponse } from 'next/server'
import cron from 'node-cron'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)
const dataFile = path.join(process.cwd(), 'data', 'scripts.json')

const scheduledJobs: { [key: string]: cron.ScheduledTask } = {}

export async function POST(request: Request) {
  try {
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
        const startTime = Date.now()
        const { stdout, stderr } = await execPromise(command)
        const endTime = Date.now()
        const runtime = endTime - startTime

        const execution = {
          id: Date.now().toString(),
          status: stderr ? 'failed' : 'success',
          timestamp: new Date().toISOString(),
          log: stdout || stderr,
          runtime
        }

        script.executions = [execution, ...(script.executions || [])].slice(0, 10)
        await fs.writeFile(dataFile, JSON.stringify(scripts, null, 2))

        console.log(`Script ${script.id} executed:`, stdout)
        if (stderr) {
          console.error(`Script ${script.id} error:`, stderr)
        }
      } catch (error) {
        console.error(`Failed to execute script ${script.id}:`, error)
      } finally {
        await fs.unlink(scriptPath)
      }
    })

    script.schedule = schedule
    await fs.writeFile(dataFile, JSON.stringify(scripts, null, 2))

    return NextResponse.json({ message: 'Schedule updated successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}

