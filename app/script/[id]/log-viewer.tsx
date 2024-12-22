'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function LogViewer({ logs }) {
  const [selectedLog, setSelectedLog] = useState(null);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Last 10 Executions:</h3>
      {logs.length === 0 ? (
        <p>No execution logs available.</p>
      ) : (
        <ul className="list-disc list-inside">
          {logs.slice(-10).map((log, index) => (
            <li key={index}>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="p-0 text-blue-400 hover:underline" onClick={() => setSelectedLog(log)}>
                    {new Date(log.timestamp).toLocaleString()}: {log.status}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 text-white">
                  <DialogHeader>
                    <DialogTitle>Log Details</DialogTitle>
                    <DialogDescription>
                      Execution at {new Date(log.timestamp).toLocaleString()}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4">
                    <p><strong>Status:</strong> {log.status}</p>
                    <p><strong>Duration:</strong> {log.duration}ms</p>
                    <h4 className="text-lg font-semibold mt-2">Output:</h4>
                    <pre className="bg-gray-900 p-2 rounded mt-1 overflow-x-auto">
                      {log.output}
                    </pre>
                  </div>
                </DialogContent>
              </Dialog>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

