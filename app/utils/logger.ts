import fs from 'fs/promises'
import { createWriteStream, existsSync } from 'fs'
import path from 'path'

const logsDir = path.join(process.cwd(), 'data', 'logs')
const maxLogSize = 5 * 1024 * 1024 // 5 MB
const maxLogAge = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
const maxLogFiles = 10 // Maximum number of log files to keep per script

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
      const timestamp = new Date().toISOString().replace(/:/g, '-')
      const newLogFile = `${logFile}.${timestamp}`
      await fs.rename(logFile, newLogFile)
      
      // Remove old log files if there are too many
      const logFiles = await fs.readdir(logsDir)
      const relatedLogs = logFiles.filter(file => file.startsWith(path.basename(logFile)))
      if (relatedLogs.length > maxLogFiles) {
        const oldestLogs = await Promise.all(
          relatedLogs.map(async (file) => {
            const filePath = path.join(logsDir, file);
            const stats = await fs.stat(filePath);
            return { file, mtime: stats.mtime.getTime() };
          })
        );
        oldestLogs.sort((a, b) => a.mtime - b.mtime);
        const logsToDelete = oldestLogs.slice(0, relatedLogs.length - maxLogFiles);
        
        for (const { file } of logsToDelete) {
          await fs.unlink(path.join(logsDir, file));
        }
      }
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

