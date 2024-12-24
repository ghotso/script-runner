import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const dataFile = path.join(process.cwd(), 'data', 'scripts.json')

export async function GET(request: NextRequest) {
  try {
    const id = request.url.split('/').pop()
    const data = await fs.readFile(dataFile, 'utf-8')
    const scripts = JSON.parse(data)
    const script = scripts.find((s: any) => s.id === id)
    if (!script) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 })
    }
    return NextResponse.json(script)
  } catch (error) {
    console.error('Failed to fetch script:', error)
    return NextResponse.json({ error: 'Failed to fetch script' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.url.split('/').pop()
    const updatedScript = await request.json()
    const data = await fs.readFile(dataFile, 'utf-8')
    let scripts = JSON.parse(data)
    const index = scripts.findIndex((s: any) => s.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 })
    }
    scripts[index] = { ...scripts[index], ...updatedScript }
    await fs.writeFile(dataFile, JSON.stringify(scripts, null, 2))
    return NextResponse.json(scripts[index])
  } catch (error) {
    console.error('Failed to update script:', error)
    return NextResponse.json({ error: 'Failed to update script' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.url.split('/').pop()
    const data = await fs.readFile(dataFile, 'utf-8')
    let scripts = JSON.parse(data)
    scripts = scripts.filter((s: any) => s.id !== id)
    await fs.writeFile(dataFile, JSON.stringify(scripts, null, 2))
    return NextResponse.json({ message: 'Script deleted successfully' })
  } catch (error) {
    console.error('Failed to delete script:', error)
    return NextResponse.json({ error: 'Failed to delete script' }, { status: 500 })
  }
}

