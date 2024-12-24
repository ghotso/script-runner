export interface Script {
  id: string;
  name: string;
  type: string;
  tags: string[];
  code: string;
  dependencies: string;
  schedules: string[];
  executions: Execution[];
  isSchedulerEnabled: boolean;
}

export interface Execution {
  id: string;
  status: 'success' | 'failed';
  timestamp: string;
  log: string;
  runtime?: number;
  triggeredBySchedule?: boolean;
}

