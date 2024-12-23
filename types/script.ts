export interface Log {
  timestamp: string;
  status: string;
  duration: number;
  output: string;
}

export interface Script {
  id: string;
  name: string;
  type: 'python' | 'bash';
  content: string;
  requirements: string[];
  tags: string[];
  schedule: string;
  logs: Log[];
}

