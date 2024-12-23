import cronstrue from 'cronstrue';

export function getReadableCronExpression(cronExpression: string): string {
  try {
    return cronstrue.toString(cronExpression);
  } catch (error) {
    console.error('Invalid cron expression:', error);
    return 'Invalid cron expression';
  }
}

