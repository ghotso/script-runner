'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { updateScript } from '../../actions';
import dynamic from 'next/dynamic';

const CodeEditor = dynamic(() => import('@uiw/react-textarea-code-editor').then((mod) => mod.default), { ssr: false });

export default function ScriptEditor({ script }) {
  const [content, setContent] = useState(script.content);

  const handleUpdate = async () => {
    await updateScript(script.id, content);
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Script Content:</h3>
      <CodeEditor
        value={content}
        language={script.type === 'python' ? 'python' : 'shell'}
        placeholder="Please enter your script code."
        onChange={(evn) => setContent(evn.target.value)}
        padding={15}
        style={{
          fontSize: 12,
          backgroundColor: "#1E1E1E",
          fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
        }}
        className="mt-2 rounded"
      />
      <Button onClick={handleUpdate} className="mt-2">Update Script</Button>
    </div>
  );
}

