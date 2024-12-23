"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { updateRequirements, installRequirements } from '../../actions';
import dynamic from 'next/dynamic';
import { Script } from '@/types/script';
import { Package, Download, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CodeEditor = dynamic(() => import('@uiw/react-textarea-code-editor').then((mod) => mod.default), { ssr: false });

interface RequirementsEditorProps {
  script: Script;
}

export default function RequirementsEditor({ script }: RequirementsEditorProps) {
  const [requirements, setRequirements] = useState(script.requirements.join('\n'));
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    await updateRequirements(script.id, requirements.split('\n').filter((r: string) => r.trim() !== ''));
    setIsUpdating(false);
    toast.success('Requirements updated successfully');
  };

  const handleInstall = async () => {
    setIsInstalling(true);
    const result = await installRequirements(script.id);
    setIsInstalling(false);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <Package className="w-5 h-5 mr-2" />
        Requirements
      </h3>
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
        data-theme="dark"
        data-line-numbers="true"
      />
      <div className="mt-2 space-x-2">
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Save className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Requirements
            </>
          )}
        </Button>
        <Button onClick={handleInstall} disabled={isInstalling}>
          {isInstalling ? (
            <>
              <Download className="w-4 h-4 mr-2 animate-spin" />
              Installing...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Install Requirements
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

