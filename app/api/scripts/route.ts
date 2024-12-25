import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const dataFile = path.join(dataDir, 'scripts.json')

async function ensureScriptsFileExists() {
  try {
    await fs.access(dataFile)
  } catch (error) {
    // File doesn't exist, create it with an empty array
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(dataFile, '[]', 'utf-8')
  }
}

export async function GET() {
  try {
    await ensureScriptsFileExists()
    const data = await fs.readFile(dataFile, 'utf-8')
    const scripts = JSON.parse(data)
    return NextResponse.json(scripts)
  } catch (error) {
    console.error('Failed to fetch scripts:', error)
    return NextResponse.json({ error: 'Failed to fetch scripts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureScriptsFileExists()
    const newScript = await request.json()
    const data = await fs.readFile(dataFile, 'utf-8')
    const scripts = JSON.parse(data)
    newScript.id = Date.now().toString()
    // Remove the executions array
    delete newScript.executions
    scripts.push(newScript)
    await fs.writeFile(dataFile, JSON.stringify(scripts, null, 2))
    return NextResponse.json(newScript, { status: 201 })
  } catch (error) {
    console.error('Failed to create script:', error)
    return NextResponse.json({ error: 'Failed to create script' }, { status: 500 })
  }
}

