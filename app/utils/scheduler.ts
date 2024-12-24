import cron from 'node-cron'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)
const dataFile = path.join(process.cwd(), 'data', 'scripts.json')
const scriptsDir = path.join(process.cwd(), 'scripts')
const logsDir = path.join(process.cwd(), 'data', 'logs')

interface Script {
  id: string;
  name: string;
  type: string;
  code: string;
  schedules: string[];
  executions: any[];
}

const scheduledJobs: { [key: string]: cron.ScheduledTask } = {}

export async function initializeScheduler() {
  try {
    const data = await fs.readFile(dataFile, 'utf-8')
    const scripts: Script[] = JSON.parse(data)

    for (const script of scripts) {
      for (const schedule of script.schedules) {
        scheduleScript(script, schedule)
      }
    }

    console.log('Scheduler initialized successfully')
  } catch (error) {
    console.error('Error initializing scheduler:', error)
  }
}

export function scheduleScript(script: Script, schedule: string) {
  const jobKey = `${script.id}_${schedule}`

  if (scheduledJobs[jobKey]) {
    scheduledJobs[jobKey].stop()
  }

  scheduledJobs[jobKey] = cron.schedule(schedule, async () => {
    console.log(`Executing scheduled script: ${script.name} (ID: ${script.id})`)
    await executeScript(script)
  })

  console.log(`Scheduled script ${script.name} (ID: ${script.id}) with schedule: ${schedule}`)
}

export function removeSchedule(scriptId: string, schedule: string) {
  const jobKey = `${scriptId}_${schedule}`
  if (scheduledJobs[jobKey]) {
    scheduledJobs[jobKey].stop()
    delete scheduledJobs[jobKey]
    console.log(`Removed schedule for script ${scriptId}: ${schedule}`)
  }
}

async function executeScript(script: Script) {
  const scriptPath = path.join(scriptsDir, `${script.id}.${script.type.toLowerCase()}`)
  await fs.writeFile(scriptPath, script.code)

  let command
  if (script.type === 'Python') {
    command = `${process.env.VIRTUAL_ENV}/bin/python ${scriptPath}`
  } else if (script.type === 'Bash') {
    command = `bash ${scriptPath}`
  } else {
    console.error(`Unsupported script type: ${script.type}`)
    return
  }

  const startTime = Date.now()
  try {
    const { stdout, stderr } = await execPromise(command)
    const endTime = Date.now()
    const runtime = endTime - startTime
    const execution = {
      id: Date.now().toString(),
      status: 'success',
      timestamp: new Date().toISOString(),
      log: stdout + (stderr ? '\nErrors/Warnings:\n' + stderr : ''),
      runtime,
      triggeredBySchedule: true
    }

    // Update script executions
    const data = await fs.readFile(dataFile, 'utf-8')
    const scripts: Script[] = JSON.parse(data)
    const scriptIndex = scripts.findIndex(s => s.id === script.id)
    if (scriptIndex !== -1) {
      scripts[scriptIndex].executions = [execution, ...scripts[scriptIndex].executions].slice(0, 10)
      await fs.writeFile(dataFile, JSON.stringify(scripts, null, 2))
    }

    // Log to file
    const logFileName = `${script.id}_${execution.timestamp.replace(/:/g, '-')}.log`
    const logFile = path.join(logsDir, logFileName)
    await fs.writeFile(logFile, `${execution.timestamp} - ${execution.status}\nRuntime: ${runtime}ms\n${execution.log}\n`)

    console.log(`Scheduled script execution completed: ${script.name} (ID: ${script.id}), Runtime: ${runtime}ms`)
  } catch (error) {
    console.error(`Error executing scheduled script ${script.name} (ID: ${script.id}):`, error)
  } finally {
    await fs.unlink(scriptPath)
  }
}

