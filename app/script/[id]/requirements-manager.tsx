'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateRequirements, installRequirements } from '../../actions';

export default function RequirementsManager({ script }) {
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
      <textarea
        value={requirements}
        onChange={(e) => setRequirements(e.target.value)}
        className="w-full h-24 p-2 border rounded mt-2"
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

