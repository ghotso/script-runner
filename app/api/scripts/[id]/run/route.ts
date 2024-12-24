import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import util from 'util'
import fs from 'fs/promises'
import path from 'path'

const execPromise = util.promisify(exec)
const dataFile = path.join(process.cwd(), 'data', 'scripts.json')
const scriptsDir = path.join(process.cwd(), 'scripts')
const logsDir = path.join(process.cwd(), 'data', 'logs')

const isSuccess = (stdout: string, stderr: string, exitCode: number) => {
  if (exitCode !== 0) return false
  if (stderr && stderr.trim() !== '') return false
  return true
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  
  try {
    // Ensure logs directory exists with proper permissions
    await fs.mkdir(logsDir, { recursive: true, mode: 0o755 })

    const data = await fs.readFile(dataFile, 'utf-8')
    let scripts = JSON.parse(data)
    const scriptIndex = scripts.findIndex((s: any) => s.id === params.id)
    
    if (scriptIndex === -1) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 })
    }

    const script = scripts[scriptIndex]

    // Ensure scripts directory exists
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

    const { stdout, stderr, exitCode = 0 } = await execPromise(command).catch(error => ({
      stdout: '',
      stderr: error.message,
      exitCode: error.code
    }))
    const runtime = Date.now() - startTime
    
    await fs.unlink(scriptPath)

    const success = isSuccess(stdout, stderr, exitCode)
    const execution = {
      id: Date.now().toString(),
      status: success ? 'success' : 'failed',
      timestamp: new Date().toISOString(),
      log: stdout || stderr,
      runtime,
      triggeredBySchedule: false
    }

    scripts[scriptIndex].executions = [execution, ...(scripts[scriptIndex].executions || [])].slice(0, 10)
    await fs.writeFile(dataFile, JSON.stringify(scripts, null, 2))

    // Log to file
    const logFile = path.join(logsDir, `${script.id}.log`)
    await fs.appendFile(logFile, `${new Date().toISOString()} - ${execution.status}\n${stdout || stderr}\n\n`)

    console.log(`Script execution result:`, { stdout, stderr, exitCode, status: execution.status })

    return NextResponse.json({ 
      message: success ? 'Script executed successfully' : 'Script execution failed',
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

    // Attempt to log the error
    try {
      const logFile = path.join(logsDir, 'error.log')
      await fs.appendFile(logFile, `${new Date().toISOString()} - Error executing script: ${JSON.stringify(execution)}\n\n`)
    } catch (logError) {
      console.error('Failed to write to error log:', logError)
    }

    return NextResponse.json({ 
      error: 'Failed to run script',
      execution,
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

