'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScriptEditor from './script-editor';
import RequirementsEditor from './requirements-editor';
import LogViewer from './log-viewer';
import SettingsCard from './settings-card';
import { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import DeleteScriptButton from './delete-script-button';
import { Script } from '@/types/script';

const ClientScriptRunner = dynamic(() => import('./script-runner'), { ssr: false });

interface ScriptDetailClientProps {
  script: Script;
}

export default function ScriptDetailClient({ script }: ScriptDetailClientProps) {
  const [logKey, setLogKey] = useState(Date.now());

  const refreshLogs = () => {
    setLogKey(Date.now());
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="bg-card text-card-foreground backdrop-blur-md bg-white/10 border-white/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-white">{script.name}</CardTitle>
            <p className="text-sm text-white/70 mt-1">Type: {script.type}</p>
          </div>
          <div className="flex gap-2">
            <Suspense fallback={<div>Loading...</div>}>
              <ClientScriptRunner script={script} refreshLogs={refreshLogs} />
            </Suspense>
            <DeleteScriptButton scriptId={script.id} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <SettingsCard script={script} />
          <RequirementsEditor script={script} />
          <ScriptEditor script={script} />
          <Suspense fallback={<div>Loading logs...</div>}>
            <LogViewer scriptId={script.id} key={logKey} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

