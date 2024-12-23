"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from 'lucide-react';
import { runScript } from '../../actions';
import { Script } from '@/types/script';

interface ScriptRunnerProps {
  script: Script;
}

export default function ScriptRunner({ script }: ScriptRunnerProps) {
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running script...');
    try {
      const result = await runScript(script.id);
      setOutput(result);
    } catch (error: unknown) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
    setIsRunning(false);
  };

  return (
    <div>
      <Button 
        onClick={handleRun} 
        disabled={isRunning}
        className="w-32"
      >
        {isRunning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Run Script
          </>
        )}
      </Button>
      {output && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white">Output:</h3>
          <pre className="bg-gray-900 text-white p-2 rounded mt-2 overflow-x-auto whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

