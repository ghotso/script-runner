import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import util from 'util'
import fs from 'fs/promises'
import path from 'path'

const execPromise = util.promisify(exec)
const dataFile = path.join(process.cwd(), 'data', 'scripts.json')
const scriptsDir = path.join(process.cwd(), 'scripts')

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

    const { stdout, stderr } = await execPromise(command)
    const runtime = Date.now() - startTime
    
    await fs.unlink(scriptPath)

    const execution = {
      id: Date.now().toString(),
      status: stderr ? 'failed' : 'success',
      timestamp: new Date().toISOString(),
      log: stdout || stderr,
      runtime
    }

    scripts[scriptIndex].executions = [execution, ...(scripts[scriptIndex].executions || [])].slice(0, 10)
    await fs.writeFile(dataFile, JSON.stringify(scripts, null, 2))

    return NextResponse.json({ 
      message: stderr ? 'Script execution failed' : 'Script executed successfully',
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
      runtime
    }

    return NextResponse.json({ 
      error: 'Failed to run script',
      execution,
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

