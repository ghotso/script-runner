import cron from 'node-cron'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import util from 'util'
import { logInfo, logError, logWarn } from './logger'
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
}

interface SchedulerState {
  globalEnabled: boolean;
  scriptStates: { [scriptId: string]: boolean };
}

const scheduledJobs: { [key: string]: cron.ScheduledTask } = {}

async function getSchedulerState(): Promise<SchedulerState> {
  try {
    const data = await fs.readFile(schedulerStateFile, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    logError('scheduler', 'Error reading scheduler state', { error })
    return { globalEnabled: false, scriptStates: {} }
  }
}

async function saveSchedulerState(state: SchedulerState): Promise<void> {
  try {
    await fs.writeFile(schedulerStateFile, JSON.stringify(state, null, 2), 'utf-8')
    logInfo('scheduler', 'Scheduler state saved successfully', { state })
  } catch (error) {
    logError('scheduler', 'Error saving scheduler state', { error, state })
    throw error
  }
}

export async function initializeScheduler(): Promise<void> {
  try {
    logInfo('scheduler', 'Initializing scheduler...')
    const scriptsData = await fs.readFile(dataFile, 'utf-8')
    const scripts: Script[] = JSON.parse(scriptsData)
    const schedulerState = await getSchedulerState()

    logInfo('scheduler', `Global scheduler state: ${schedulerState.globalEnabled ? 'Enabled' : 'Disabled'}`)
    logInfo('scheduler', `Found ${scripts.length} scripts`)

    // Stop all existing jobs
    Object.values(scheduledJobs).forEach(job => job.stop())
    Object.keys(scheduledJobs).forEach(key => delete scheduledJobs[key])

    for (const script of scripts) {
      const isScriptEnabled = schedulerState.scriptStates[script.id] ?? false
      if (isScriptEnabled) {
        for (const schedule of script.schedules) {
          scheduleScript(script, schedule, schedulerState.globalEnabled)
        }
      } else {
        logInfo('scheduler', `Script ${script.name} (ID: ${script.id}) scheduler is disabled. Skipping scheduling.`)
      }
    }

    logInfo('scheduler', 'Scheduler initialized successfully')
  } catch (error) {
    logError('scheduler', 'Error initializing scheduler', { error })
    throw error
  }
}

export function scheduleScript(script: Script, schedule: string, isGlobalSchedulerEnabled: boolean): void {
  const jobKey = `${script.id}_${schedule}`

  if (scheduledJobs[jobKey]) {
    scheduledJobs[jobKey].stop()
  }

  try {
    scheduledJobs[jobKey] = cron.schedule(schedule, async () => {
      const currentState = await getSchedulerState()
      if (currentState.globalEnabled && currentState.scriptStates[script.id]) {
        logInfo('scheduler', `Executing scheduled script: ${script.name} (ID: ${script.id})`)
        await executeScript(script)
      } else {
        logWarn('scheduler', `Skipping execution of script ${script.name} (ID: ${script.id})`, {
          globalScheduler: currentState.globalEnabled ? 'Enabled' : 'Disabled',
          scriptScheduler: currentState.scriptStates[script.id] ? 'Enabled' : 'Disabled'
        })
      }
    }, {
      scheduled: isGlobalSchedulerEnabled
    })

    logInfo('scheduler', `Scheduled script ${script.name} (ID: ${script.id}) with schedule: ${schedule}`, {
      jobStatus: isGlobalSchedulerEnabled ? 'started' : 'created but not started'
    })
  } catch (error) {
    logError('scheduler', `Error scheduling script ${script.name} (ID: ${script.id})`, { error, schedule })
  }
}

export function removeSchedule(scriptId: string, schedule: string): void {
  const jobKey = `${scriptId}_${schedule}`
  if (scheduledJobs[jobKey]) {
    scheduledJobs[jobKey].stop()
    delete scheduledJobs[jobKey]
    logInfo('scheduler', `Removed schedule for script ${scriptId}: ${schedule}`)
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
    logError('scheduler', `Unsupported script type: ${script.type}`, { scriptId: script.id })
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

    logInfo('scheduler', 'Scheduled script execution completed', {
      scriptId: script.id,
      runtime,
      stdout,
      stderr,
    })

    await sendDiscordNotification(`Scheduled script "${script.name}" (ID: ${script.id}) executed successfully.`, 'success')

    logInfo('scheduler', `Scheduled script execution completed: ${script.name} (ID: ${script.id})`, { runtime })
  } catch (error) {
    await sendDiscordNotification(`Scheduled script "${script.name}" (ID: ${script.id}) failed to execute.\nError: ${error instanceof Error ? error.message : String(error)}`, 'failure')
    logError('scheduler', 'Error executing scheduled script', {
      scriptId: script.id,
      error: error instanceof Error ? error.message : String(error),
    })
  } finally {
    await fs.unlink(scriptPath)
  }
}

export async function updateGlobalSchedulerState(isEnabled: boolean): Promise<void> {
  try {
    const currentState = await getSchedulerState()
    currentState.globalEnabled = isEnabled
    await saveSchedulerState(currentState)
    
    // Update all existing jobs
    for (const [jobKey, job] of Object.entries(scheduledJobs)) {
      if (isEnabled) {
        job.start()
      } else {
        job.stop()
      }
    }

    logInfo('scheduler', `Global scheduler state updated to: ${isEnabled ? 'Enabled' : 'Disabled'}`)
  } catch (error) {
    logError('scheduler', 'Error updating global scheduler state', { error, isEnabled })
    throw error
  }
}

export async function updateScriptSchedulerState(scriptId: string, isEnabled: boolean): Promise<void> {
  try {
    const currentState = await getSchedulerState()
    currentState.scriptStates[scriptId] = isEnabled
    await saveSchedulerState(currentState)

    const scriptsData = await fs.readFile(dataFile, 'utf-8')
    const scripts: Script[] = JSON.parse(scriptsData)
    const script = scripts.find(s => s.id === scriptId)

    if (script) {
      // Remove existing schedules for this script
      script.schedules.forEach(schedule => removeSchedule(scriptId, schedule))

      // Reschedule if enabled
      if (isEnabled) {
        for (const schedule of script.schedules) {
          scheduleScript(script, schedule, currentState.globalEnabled)
        }
      }

      logInfo('scheduler', `Script ${script.name} (ID: ${scriptId}) scheduler state updated`, { isEnabled })
    } else {
      logWarn('scheduler', `Script not found when updating scheduler state`, { scriptId, isEnabled })
    }
  } catch (error) {
    logError('scheduler', 'Error updating script scheduler state', { error, scriptId, isEnabled })
    throw error
  }
}

// Export all functions
export default {
  initializeScheduler,
  scheduleScript,
  removeSchedule,
  updateGlobalSchedulerState,
  updateScriptSchedulerState,
}

