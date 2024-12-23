"use client"

import { useState, useEffect } from 'react';
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

interface LogViewerProps {
  scriptId: string;
}

export default function LogViewer({ scriptId }: LogViewerProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  const fetchLogs = async () => {
    try {
      const script = await getScript(scriptId);
      if (script) {
        setLogs(script.logs || []);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [scriptId]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'failed':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-500 text-white';
      case 'failed':
        return 'bg-red-500 text-white';
      default:
        return 'bg-yellow-500 text-white';
    }
  };

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
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="absolute right-4 top-4">
                    <div className={`rounded-full p-2 ${getStatusStyles(log.status)}`}>
                      {getStatusIcon(log.status)}
                    </div>
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
                    <div className={`rounded-full p-1.5 ${getStatusStyles(log.status)}`}>
                      {getStatusIcon(log.status)}
                    </div>
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
                          ? 'bg-emerald-500/10 text-emerald-400'
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

