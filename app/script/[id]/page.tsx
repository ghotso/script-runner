import { Metadata } from 'next'
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScriptEditor from './script-editor';
import RequirementsEditor from './requirements-editor';
import LogViewer from './log-viewer';
import ScriptRunner from './script-runner';
import DeleteScriptButton from './delete-script-button';
import { getScript } from '@/lib/scripts';
import SettingsCard from './settings-card';
import { Suspense } from 'react';

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params, searchParams }: Props
): Promise<Metadata> {
  const id = params.id
  const script = await getScript(id)

  return {
    title: script ? script.name : 'Script Not Found',
  }
}

export default async function ScriptDetail({ params }: Props) {
  const script = await getScript(params.id);

  if (!script) {
    notFound();
  }

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
              <ScriptRunner script={script} onScriptRun={() => {
                // This will trigger a re-render of the LogViewer component
                // You might need to implement a state management solution or use Server Components for real-time updates
              }} />
            </Suspense>
            <DeleteScriptButton scriptId={script.id} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <SettingsCard script={script} />
          <RequirementsEditor script={script} />
          <ScriptEditor script={script} />
          <Suspense fallback={<div>Loading logs...</div>}>
            <LogViewer scriptId={script.id} key={Date.now()} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

