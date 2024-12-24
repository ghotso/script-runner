export function translateCronSchedule(schedule: string): string {
  const parts = schedule.split(' ')
  if (parts.length !== 5) return schedule

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  // Every minute
  if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every minute'
  }

  // Every x minutes
  if (minute.startsWith('*/')) {
    const interval = parseInt(minute.substring(2))
    return `Every ${interval} minute${interval > 1 ? 's' : ''}`
  }

  // Every hour at specific minute
  if (minute.match(/^\d+$/) && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return `Every hour at ${minute.padStart(2, '0')} minutes past`
  }

  // Every day at specific time
  if (minute.match(/^\d+$/) && hour.match(/^\d+$/) && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    const timeStr = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
    return `Every day at ${timeStr}`
  }

  // Every day at midnight
  if (minute === '0' && hour === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every day at midnight'
  }

  // Every week on specific day
  if (minute === '0' && hour === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek.match(/^\d+$/)) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return `Every ${days[parseInt(dayOfWeek)]} at midnight`
  }

  // Specific days of the week at specific time
  if (minute.match(/^\d+$/) && hour.match(/^\d+$/) && dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const timeStr = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
    const weekDays = dayOfWeek.split(',').map(d => days[parseInt(d)]).join(', ')
    return `Every ${weekDays} at ${timeStr}`
  }

  return schedule
}

