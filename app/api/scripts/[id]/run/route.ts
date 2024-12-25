import { NextResponse } from 'next/server'
import { exec, ExecException } from 'child_process'
import util from 'util'
import fs from 'fs/promises'
import path from 'path'
import { sendDiscordNotification } from '../../../../utils/discord'
import { logInfo, logError } from '../../../../utils/logger'

const execPromise = util.promisify(exec)
const dataFile = path.join(process.cwd(), 'data', 'scripts.json')
const scriptsDir = path.join(process.cwd(), 'scripts')

interface ExecResult {
  stdout: string;
  stderr: string;
}

const isSuccess = (stdout: string, stderr: string, exitCode: number) => {
  return exitCode === 0;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  
  try {
    const data = await fs.readFile(dataFile, 'utf-8')
    let scripts = JSON.parse(data)
    const scriptIndex = scripts.findIndex((s: any) => s.id === params.id)
    
    if (scriptIndex === -1) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 })
    }

    const script = scripts[scriptIndex]

    await fs.mkdir(scriptsDir, { recursive: true })

    const scriptPath = path.join(scriptsDir, `${script.id}.${script.type.toLowerCase()}`)
    await fs.writeFile(scriptPath, script.code)

    let command
    if (script.type === 'Python') {
      command = `${process.env.VIRTUAL_ENV}/bin/python ${scriptPath}`
    } else if (script.type === 'Bash') {
      command = `bash ${scriptPath}`
    } else {
      return NextResponse.json({ error: 'Unsupported script type' }, { status: 400 })
    }

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

    const runtime = Date.now() - startTime
    
    await fs.unlink(scriptPath)

    const success = isSuccess(stdout, stderr, exitCode)
    const execution = {
      id: Date.now().toString(),
      status: success ? 'success' : 'failed',
      timestamp: new Date().toISOString(),
      log: stdout + (stderr ? '\nErrors/Warnings:\n' + stderr : ''),
      runtime,
      triggeredBySchedule: false
    }

    const logEntry = {
      id: execution.id,
      status: execution.status,
      timestamp: execution.timestamp,
      runtime: execution.runtime,
      triggeredBySchedule: execution.triggeredBySchedule
    }
    await logInfo(script.id, 'Script execution completed', logEntry)

    await logInfo(script.id, 'Script execution completed', {
      status: execution.status,
      runtime,
      stdout,
      stderr,
    })

    if (success) {
      await sendDiscordNotification(`Script "${script.name}" (ID: ${script.id}) executed successfully.`, 'success')
    } else {
      await sendDiscordNotification(`Script "${script.name}" (ID: ${script.id}) failed to execute.\nError: ${stderr}`, 'failure')
    }

    return NextResponse.json({ 
      message: success ? 'Script executed successfully' : 'Script execution completed with non-zero exit code',
      execution,
      output: stdout,
      error: stderr
    })
  } catch (error) {
    const runtime = Date.now() - startTime
    console.error('Error executing script:', error)
    
    const execution = {
      id: Date.now().toString(),
      status: 'failed',
      timestamp: new Date().toISOString(),
      log: error instanceof Error ? error.message : String(error),
      runtime,
      triggeredBySchedule: false
    }

    await logError(params.id, 'Error executing script', {
      error: error instanceof Error ? error.message : String(error),
      runtime,
    })

    await sendDiscordNotification(`Error executing script (ID: ${params.id}).\nError: ${execution.log}`, 'failure')

    return NextResponse.json({ 
      error: 'Failed to run script',
      execution,
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

