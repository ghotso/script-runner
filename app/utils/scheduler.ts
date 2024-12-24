import cron from 'node-cron'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import util from 'util'
import { logInfo, logError } from './logger'
import { sendDiscordNotification } from './discord'

const execPromise = util.promisify(exec)
const dataFile = path.join(process.cwd(), 'data', 'scripts.json')
const scriptsDir = path.join(process.cwd(), 'scripts')
const schedulerStateFile = path.join(process.cwd(), 'data', 'scheduler-state.json')

interface Script {
  id: string;
  name: string;
  type: string;
  code: string;
  schedules: string[];
  executions: any[];
  isSchedulerEnabled: boolean;
}

const scheduledJobs: { [key: string]: cron.ScheduledTask } = {}

async function getGlobalSchedulerState(): Promise<boolean> {
  try {
    const data = await fs.readFile(schedulerStateFile, 'utf-8')
    const state = JSON.parse(data)
    return state.isEnabled
  } catch (error) {
    console.error('Error reading global scheduler state:', error)
    return false
  }
}

export async function initializeScheduler() {
  try {
    const data = await fs.readFile(dataFile, 'utf-8')
    const scripts: Script[] = JSON.parse(data)
    const isGlobalSchedulerEnabled = await getGlobalSchedulerState()

    for (const script of scripts) {
      if (isGlobalSchedulerEnabled && script.isSchedulerEnabled) {
        for (const schedule of script.schedules) {
          scheduleScript(script, schedule)
        }
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
      scripts[scriptIndex].executions = [execution, ...scripts[scriptIndex].executions].slice(0, 20)
      await fs.writeFile(dataFile, JSON.stringify(scripts, null, 2))
    }

    await logInfo(script.id, 'Scheduled script execution completed', {
      runtime,
      stdout,
      stderr,
    })

    await sendDiscordNotification(`Scheduled script "${script.name}" (ID: ${script.id}) executed successfully.`, 'scheduled')

    console.log(`Scheduled script execution completed: ${script.name} (ID: ${script.id}), Runtime: ${runtime}ms`)
  } catch (error) {
    await sendDiscordNotification(`Scheduled script "${script.name}" (ID: ${script.id}) failed to execute.\nError: ${error instanceof Error ? error.message : String(error)}`, 'scheduled')
    await logError(script.id, 'Error executing scheduled script', {
      error: error instanceof Error ? error.message : String(error),
    })
    console.error(`Error executing scheduled script ${script.name} (ID: ${script.id}):`, error)
  } finally {
    await fs.unlink(scriptPath)
  }
}

export async function updateSchedulerState(isEnabled: boolean) {
  await fs.writeFile(schedulerStateFile, JSON.stringify({ isEnabled }), 'utf-8')
  if (isEnabled) {
    await initializeScheduler()
  } else {
    Object.values(scheduledJobs).forEach(job => job.stop())
    scheduledJobs = {}
  }
}

export async function updateScriptSchedulerState(scriptId: string, isEnabled: boolean) {
  const data = await fs.readFile(dataFile, 'utf-8')
  const scripts: Script[] = JSON.parse(data)
  const scriptIndex = scripts.findIndex(s => s.id === scriptId)
  
  if (scriptIndex !== -1) {
    scripts[scriptIndex].isSchedulerEnabled = isEnabled
    await fs.writeFile(dataFile, JSON.stringify(scripts, null, 2))
    
    if (isEnabled) {
      const isGlobalSchedulerEnabled = await getGlobalSchedulerState()
      if (isGlobalSchedulerEnabled) {
        for (const schedule of scripts[scriptIndex].schedules) {
          scheduleScript(scripts[scriptIndex], schedule)
        }
      }
    } else {
      scripts[scriptIndex].schedules.forEach(schedule => removeSchedule(scriptId, schedule))
    }
  }
}

