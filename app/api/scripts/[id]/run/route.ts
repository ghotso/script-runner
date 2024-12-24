import { NextResponse } from 'next/server'
import { exec, ExecException } from 'child_process'
import util from 'util'
import fs from 'fs/promises'
import path from 'path'

const execPromise = util.promisify(exec)
const dataFile = path.join(process.cwd(), 'data', 'scripts.json')
const scriptsDir = path.join(process.cwd(), 'scripts')
const logsDir = path.join(process.cwd(), 'data', 'logs')

interface ExecResult {
  stdout: string;
  stderr: string;
}

const isSuccess = (stdout: string, stderr: string, exitCode: number) => {
  // Consider the execution successful if there's output in stdout,
  // even if stderr is not empty (as some scripts might use stderr for non-error messages)
  return exitCode === 0 && stdout.trim() !== '';
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

    scripts[scriptIndex].executions = [execution, ...(scripts[scriptIndex].executions || [])].slice(0, 10)
    await fs.writeFile(dataFile, JSON.stringify(scripts, null, 2))

    // Log to file with improved naming
    const logFileName = `${script.id}_${execution.timestamp.replace(/:/g, '-')}.log`
    const logFile = path.join(logsDir, logFileName)
    await fs.writeFile(logFile, `${execution.timestamp} - ${execution.status}\n${execution.log}\n`)

    console.log(`Script execution result:`, { stdout, stderr, exitCode, status: execution.status })

    return NextResponse.json({ 
      message: success ? 'Script executed successfully' : 'Script execution completed with warnings or errors',
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

    // Log the error
    const errorLogFile = path.join(logsDir, 'error.log')
    await fs.appendFile(errorLogFile, `${execution.timestamp} - Error executing script: ${JSON.stringify(execution)}\n\n`)

    return NextResponse.json({ 
      error: 'Failed to run script',
      execution,
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

