import fs from 'fs/promises'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const schedulerStateFile = path.join(dataDir, 'scheduler-state.json')
const scriptsFile = path.join(dataDir, 'scripts.json')

export async function initializeDataDirectory() {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(dataDir, { recursive: true })

    // Initialize scheduler state if it doesn't exist
    try {
      await fs.access(schedulerStateFile)
    } catch {
      await fs.writeFile(
        schedulerStateFile,
        JSON.stringify({ isEnabled: false }),
        'utf-8'
      )
    }

    // Initialize scripts file if it doesn't exist
    try {
      await fs.access(scriptsFile)
    } catch {
      await fs.writeFile(scriptsFile, JSON.stringify([]), 'utf-8')
    }
  } catch (error) {
    console.error('Error initializing data directory:', error)
  }
}

