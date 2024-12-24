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

    let command
    let installedDependencies = []
    if (script.type === 'Python') {
      const requirementsPath = path.join(tempDir, 'requirements.txt')
      await fs.writeFile(requirementsPath, script.dependencies)
      command = `${process.env.VIRTUAL_ENV}/bin/pip install -r ${requirementsPath}`
    } else if (script.type === 'Bash') {
      const dependencies = script.dependencies.split('\n').filter((dep: string) => dep.trim() !== '')
      for (const dep of dependencies) {
        try {
          await execPromise(`which ${dep}`)
          console.log(`${dep} is already installed`)
        } catch {
          try {
            // Use apk instead of apt-get for Alpine Linux
            await execPromise(`apk add ${dep}`)
            installedDependencies.push(dep)
          } catch (error) {
            console.error(`Failed to install ${dep}:`, error)
            return NextResponse.json({ 
              error: `Failed to install ${dep}`, 
              details: error instanceof Error ? error.message : String(error)
            }, { status: 500 })
          }
        }
      }
      command = 'echo "Dependencies checked/installed"'
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

    let message
    if (installedDependencies.length > 0) {
      message = `Dependencies installed successfully: ${installedDependencies.join(', ')}`
    } else if (script.type === 'Python') {
      message = stdout.includes('Successfully installed') 
        ? `Dependencies installed successfully: ${stdout.split('Successfully installed')[1].trim()}`
        : 'All dependencies are already up to date.'
    } else {
      message = 'All dependencies are already installed.'
    }

    return NextResponse.json({ 
      message,
      details: stdout
    })
  } catch (error) {
    console.error('Error installing dependencies:', error)
    return NextResponse.json({ 
      error: 'Failed to install dependencies', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

