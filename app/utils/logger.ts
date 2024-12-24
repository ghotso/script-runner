import fs from 'fs/promises'
import path from 'path'
import { createWriteStream } from 'fs'

const logsDir = path.join(process.cwd(), 'data', 'logs')
const maxLogSize = 5 * 1024 * 1024 // 5 MB
const maxLogAge = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
}

async function ensureLogDirectory() {
  await fs.mkdir(logsDir, { recursive: true })
}

function getLogFileName(scriptId: string) {
  return path.join(logsDir, `${scriptId}.log`)
}

async function rotateLogIfNeeded(logFile: string) {
  try {
    const stats = await fs.stat(logFile)
    if (stats.size >= maxLogSize) {
      const newLogFile = `${logFile}.${Date.now()}`
      await fs.rename(logFile, newLogFile)
    }
  } catch (error) {
    // If the file doesn't exist, no need to rotate
    if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
      console.error('Error rotating log file:', error)
    }
  }
}

async function cleanupOldLogs() {
  const now = Date.now()
  const files = await fs.readdir(logsDir)
  for (const file of files) {
    const filePath = path.join(logsDir, file)
    const stats = await fs.stat(filePath)
    if (now - stats.mtime.getTime() > maxLogAge) {
      await fs.unlink(filePath)
    }
  }
}

export async function log(scriptId: string, level: LogLevel, message: string, metadata?: Record<string, any>) {
  await ensureLogDirectory()
  const logFile = getLogFileName(scriptId)
  await rotateLogIfNeeded(logFile)

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    metadata,
  }

  const logStream = createWriteStream(logFile, { flags: 'a' })
  logStream.write(JSON.stringify(logEntry) + '\n')
  logStream.end()

  // Cleanup old logs periodically (e.g., every 100 log entries)
  if (Math.random() < 0.01) {
    await cleanupOldLogs()
  }
}

export const logInfo = (scriptId: string, message: string, metadata?: Record<string, any>) => 
  log(scriptId, LogLevel.INFO, message, metadata)

export const logWarn = (scriptId: string, message: string, metadata?: Record<string, any>) => 
  log(scriptId, LogLevel.WARN, message, metadata)

export const logError = (scriptId: string, message: string, metadata?: Record<string, any>) => 
  log(scriptId, LogLevel.ERROR, message, metadata)

