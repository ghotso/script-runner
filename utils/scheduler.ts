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

export async function initializeScheduler(): Promise<void> {
  try {
    console.log('Initializing scheduler...')
    const data = await fs.readFile(dataFile, 'utf-8')
    const scripts: Script[] = JSON.parse(data)
    const isGlobalSchedulerEnabled = await getGlobalSchedulerState()

    console.log(`Global scheduler state: ${isGlobalSchedulerEnabled ? 'Enabled' : 'Disabled'}`)
    console.log(`Found ${scripts.length} scripts`)

    // Stop all existing jobs
    Object.values(scheduledJobs).forEach(job => job.stop())
    Object.keys(scheduledJobs).forEach(key => delete scheduledJobs[key])

    if (isGlobalSchedulerEnabled) {
      for (const script of scripts) {
        if (script.isSchedulerEnabled) {
          for (const schedule of script.schedules) {
            scheduleScript(script, schedule)
          }
        } else {
          console.log(`Script ${script.name} (ID: ${script.id}) scheduler is disabled. Skipping scheduling.`)
        }
      }
    } else {
      console.log('Global scheduler is disabled. No scripts will be scheduled.')
    }

    console.log('Scheduler initialized successfully')
  } catch (error) {
    console.error('Error initializing scheduler:', error)
    throw error
  }
}

export function scheduleScript(script: Script, schedule: string): void {
  const jobKey = `${script.id}_${schedule}`

  if (scheduledJobs[jobKey]) {
    scheduledJobs[jobKey].stop()
  }

  try {
    scheduledJobs[jobKey] = cron.schedule(schedule, async () => {
      const isGlobalEnabled = await getGlobalSchedulerState()
      if (isGlobalEnabled && script.isSchedulerEnabled) {
        console.log(`Executing scheduled script: ${script.name} (ID: ${script.id})`)
        await executeScript(script)
      } else {
        console.log(`Skipping execution of script ${script.name} (ID: ${script.id}). Global scheduler: ${isGlobalEnabled ? 'Enabled' : 'Disabled'}, Script scheduler: ${script.isSchedulerEnabled ? 'Enabled' : 'Disabled'}`)
      }
    })

    console.log(`Scheduled script ${script.name} (ID: ${script.id}) with schedule: ${schedule}`)
  } catch (error) {
    console.error(`Error scheduling script ${script.name} (ID: ${script.id}):`, error)
  }
}

export function removeSchedule(scriptId: string, schedule: string): void {
  const jobKey = `${scriptId}_${schedule}`
  if (scheduledJobs[jobKey]) {
    scheduledJobs[jobKey].stop()
    delete scheduledJobs[jobKey]
    console.log(`Removed schedule for script ${scriptId}: ${schedule}`)
  }
}

async function executeScript(script: Script): Promise<void> {
  const scriptPath = path.join(scriptsDir, `${script.id}.${script.type.toLowerCase()}`)
  await fs.writeFile(scriptPath, script.code)

  let command: string
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

    await sendDiscordNotification(`Scheduled script "${script.name}" (ID: ${script.id}) executed successfully.`, 'success')

    console.log(`Scheduled script execution completed: ${script.name} (ID: ${script.id}), Runtime: ${runtime}ms`)
  } catch (error) {
    await sendDiscordNotification(`Scheduled script "${script.name}" (ID: ${script.id}) failed to execute.\nError: ${error instanceof Error ? error.message : String(error)}`, 'failure')
    await logError(script.id, 'Error executing scheduled script', {
      error: error instanceof Error ? error.message : String(error),
    })
    console.error(`Error executing scheduled script ${script.name} (ID: ${script.id}):`, error)
  } finally {
    await fs.unlink(scriptPath)
  }
}

export async function updateSchedulerState(isEnabled: boolean): Promise<void> {
  await fs.writeFile(schedulerStateFile, JSON.stringify({ isEnabled }), 'utf-8')
  await initializeScheduler()
}

export async function updateScriptSchedulerState(scriptId: string, isEnabled: boolean): Promise<void> {
  const data = await fs.readFile(dataFile, 'utf-8')
  const scripts: Script[] = JSON.parse(data)
  const scriptIndex = scripts.findIndex(s => s.id === scriptId)
  
  if (scriptIndex !== -1) {
    scripts[scriptIndex].isSchedulerEnabled = isEnabled
    await fs.writeFile(dataFile, JSON.stringify(scripts, null, 2))
    await initializeScheduler()
  }
}

// Export all functions
export default {
  initializeScheduler,
  scheduleScript,
  removeSchedule,
  updateSchedulerState,
  updateScriptSchedulerState,
}

