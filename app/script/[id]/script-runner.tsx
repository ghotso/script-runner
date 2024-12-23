"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from 'lucide-react';
import { runScript } from '../../actions';
import { Script } from '@/types/script';
import { toast } from 'react-hot-toast';

interface ScriptRunnerProps {
  script: Script;
  refreshLogs: () => void;
}

export default function ScriptRunner({ script, refreshLogs }: ScriptRunnerProps) {
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const result = await runScript(script.id);
      if (result.success) {
        toast.success('Script executed successfully');
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
    setIsRunning(false);
    refreshLogs();
  };

  return (
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
  );
}

