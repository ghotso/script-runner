"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { updateScript } from '../../actions';
import dynamic from 'next/dynamic';
import { Script } from '@/types/script';
import { Check, Code } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CodeEditor = dynamic(() => import('@uiw/react-textarea-code-editor').then((mod) => mod.default), { ssr: false });

interface ScriptEditorProps {
  script: Script;
}

export default function ScriptEditor({ script }: ScriptEditorProps) {
  const [content, setContent] = useState(script.content);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    await updateScript(script.id, content);
    setIsUpdating(false);
    toast.success('Script updated successfully');
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <Code className="w-5 h-5 mr-2" />
        Script Content
      </h3>
      <CodeEditor
        value={content}
        language={script.type === 'python' ? 'python' : 'shell'}
        placeholder="Please enter your script code."
        onChange={(evn) => setContent(evn.target.value)}
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
        minHeight={200}
      />
      <Button onClick={handleUpdate} className="mt-2" disabled={isUpdating}>
        {isUpdating ? (
          <>
            <Code className="w-4 h-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" />
            Update Script
          </>
        )}
      </Button>
    </div>
  );
}

