import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import util from 'util'
import fs from 'fs/promises'
import path from 'path'

const execPromise = util.promisify(exec)
const dataFile = path.join(process.cwd(), 'data', 'scripts.json')
const scriptsDir = path.join(process.cwd(), 'scripts')

export async function POST(request: Request, { params }: { params: { id: string } }) {
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
      command = `python3 ${scriptPath}`
    } else if (script.type === 'Bash') {
      command = `bash ${scriptPath}`
    } else {
      return NextResponse.json({ error: 'Unsupported script type' }, { status: 400 })
    }

    const { stdout, stderr } = await execPromise(command)
    await fs.unlink(scriptPath)

    const execution = {
      id: Date.now().toString(),
      status: stderr ? 'failed' : 'success',
      timestamp: new Date().toISOString(),
      log: stdout || stderr
    }

    scripts[scriptIndex].executions = [execution, ...(scripts[scriptIndex].executions || [])].slice(0, 10)
    await fs.writeFile(dataFile, JSON.stringify(scripts, null, 2))

    return NextResponse.json({ output: stdout, error: stderr, execution })
  } catch (error) {
    console.error('Error executing script:', error)
    return NextResponse.json({ error: 'Failed to run script' }, { status: 500 })
  }
}

