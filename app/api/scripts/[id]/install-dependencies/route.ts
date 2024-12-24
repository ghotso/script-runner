import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)
const dataFile = path.join(process.cwd(), 'data', 'scripts.json')

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await fs.readFile(dataFile, 'utf-8')
    const scripts = JSON.parse(data)
    const script = scripts.find((s: any) => s.id === params.id)

    if (!script) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 })
    }

    const tempDir = path.join(process.cwd(), 'temp', script.id)
    await fs.mkdir(tempDir, { recursive: true })

    const requirementsPath = path.join(tempDir, 'requirements.txt')
    await fs.writeFile(requirementsPath, script.dependencies)

    let command
    if (script.type === 'Python') {
      // Use the virtual environment's pip to install dependencies
      command = `${process.env.VIRTUAL_ENV}/bin/pip install -r ${requirementsPath}`
    } else if (script.type === 'Bash') {
      // For Bash scripts, we'll assume the dependencies are actually shell commands to install packages
      command = script.dependencies
    } else {
      return NextResponse.json({ error: 'Unsupported script type' }, { status: 400 })
    }

    const { stdout, stderr } = await execPromise(command)

    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true })

    if (stderr && !stderr.includes('WARNING')) { // Ignore pip warnings
      console.error('Error installing dependencies:', stderr)
      return NextResponse.json({ 
        error: 'Failed to install dependencies', 
        details: stderr 
      }, { status: 500 })
    }

    const installedDependencies = stdout.split('\n').filter(line => line.includes('Successfully installed')).join('\n')

    if (installedDependencies) {
      return NextResponse.json({ 
        message: 'Dependencies installed successfully!',
        details: installedDependencies
      })
    } else {
      return NextResponse.json({ 
        message: 'No new dependencies were installed. All required packages are already up to date.',
        details: stdout
      })
    }
  } catch (error) {
    console.error('Error installing dependencies:', error)
    return NextResponse.json({ 
      error: 'Failed to install dependencies', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

