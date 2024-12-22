'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { runScript } from '../../actions';

export default function ScriptRunner({ script }) {
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running script...');
    try {
      const result = await runScript(script.id);
      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
    setIsRunning(false);
  };

  return (
    <div className="mt-4">
      <Button onClick={handleRun} disabled={isRunning}>
        {isRunning ? 'Running...' : 'Run Script'}
      </Button>
      {output && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Output:</h3>
          <pre className="bg-gray-900 p-2 rounded mt-2 overflow-x-auto whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

