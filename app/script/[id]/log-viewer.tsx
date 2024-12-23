"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Log, Script } from '@/types/script';
import { format, formatDistanceToNow } from 'date-fns';
import { CheckCircle2, XCircle, Clock, Terminal } from 'lucide-react';
import { getScript } from '@/lib/scripts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface LogViewerProps {
  scriptId: string;
}

export default function LogViewer({ scriptId }: LogViewerProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] =useState<string | null>(null);
  const router = useRouter();

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/logs/${scriptId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const logs = await response.json();
      setLogs(logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to fetch logs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [scriptId]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const refreshLogs = () => {
    fetchLogs();
    router.refresh();
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading logs...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 bg-red-100 border border-red-400 text-red-700 rounded">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <button
          onClick={fetchLogs}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Terminal className="w-5 h-5" />
        Execution History
      </h3>
      {logs.length === 0 ? (
        <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
          <Terminal className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-400">No execution logs available yet</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {logs.slice(-12).reverse().map((log: Log, index: number) => (
            <Dialog key={index}>
              <DialogTrigger className="w-full">
                <div 
                  className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="absolute right-4 top-4">
                    {getStatusIcon(log.status)}
                  </div>
                  <div className="pr-12">
                    <time className="text-sm text-gray-400">
                      {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                    </time>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-gray-400">Duration:</span>
                      <span className="text-sm font-medium text-white">
                        {log.duration}ms
                      </span>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-400 group-hover:text-white transition-colors">
                      Click to view details →
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl bg-gray-900/95 backdrop-blur-xl border-gray-800">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-white">
                    {getStatusIcon(log.status)}
                    Execution Details
                    <span className="ml-auto text-sm font-normal text-gray-400">
                      {formatDistanceToNow(new Date(log.timestamp))} ago
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Status</p>
                      <p className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-sm font-medium ${
                        log.status.toLowerCase() === 'completed' 
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {getStatusIcon(log.status)}
                        {log.status}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Duration</p>
                      <p className="text-sm font-medium text-white">{log.duration}ms</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">Output</p>
                      <p className="text-sm text-gray-400">
                        {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                      </p>
                    </div>
                    <ScrollArea className="h-[300px] w-full rounded-md border border-gray-800 bg-black/50">
                      <pre className="p-4 text-sm text-white font-mono whitespace-pre-wrap">
                        {log.output || 'No output available'}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}

