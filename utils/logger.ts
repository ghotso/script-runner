import fs from 'fs/promises'
import path from 'path'

const LOG_DIR = path.join(process.cwd(), 'logs')

// Ensure the log directory exists
async function ensureLogDir() {
  try {
    await fs.access(LOG_DIR)
  } catch {
    await fs.mkdir(LOG_DIR, { recursive: true })
  }
}

async function writeLog(level: string, scriptId: string, message: string, metadata?: Record<string, any>) {
  await ensureLogDir()
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    scriptId,
    message,
    metadata
  }
  const logFile = path.join(LOG_DIR, `${scriptId}.log`)
  await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n')
}

export async function logInfo(scriptId: string, message: string, metadata?: Record<string, any>) {
  await writeLog('INFO', scriptId, message, metadata)
}

export async function logError(scriptId: string, message: string, metadata?: Record<string, any>) {
  await writeLog('ERROR', scriptId, message, metadata)
}

