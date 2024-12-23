"use client"

import { useState } from 'react';
import { Button } from "../../../components/ui/button";
import { updateRequirements, installRequirements } from '../../actions';
import dynamic from 'next/dynamic';

const CodeEditor = dynamic(() => import('@uiw/react-textarea-code-editor').then((mod) => mod.default), { ssr: false });

export default function RequirementsEditor({ script }) {
  const [requirements, setRequirements] = useState(script.requirements.join('\n'));
  const [isInstalling, setIsInstalling] = useState(false);

  const handleUpdate = async () => {
    await updateRequirements(script.id, requirements.split('\n').filter(r => r.trim() !== ''));
  };

  const handleInstall = async () => {
    setIsInstalling(true);
    await installRequirements(script.id);
    setIsInstalling(false);
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Requirements:</h3>
      <CodeEditor
        value={requirements}
        language="python"
        placeholder="Please enter your requirements, one per line."
        onChange={(evn) => setRequirements(evn.target.value)}
        padding={15}
        style={{
          fontSize: 12,
          backgroundColor: "#2D2D2D",
          fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
        }}
        className="mt-2 rounded"
        data-color-mode="dark"
        data-line-numbers="true"
      />
      <div className="mt-2 space-x-2">
        <Button onClick={handleUpdate}>Update Requirements</Button>
        <Button onClick={handleInstall} disabled={isInstalling}>
          {isInstalling ? 'Installing...' : 'Install Requirements'}
        </Button>
      </div>
    </div>
  );
}

