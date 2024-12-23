import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScriptEditor from './script-editor';
import RequirementsEditor from './requirements-editor';
import LogViewer from './log-viewer';
import ScriptRunner from './script-runner';
import DeleteScriptButton from './delete-script-button';
import { getScript } from '@/lib/scripts';
import SettingsCard from './settings-card';

type Params = {
  id: string;
};

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function ScriptDetail({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
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
            <ScriptRunner script={script} />
            <DeleteScriptButton scriptId={script.id} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <SettingsCard script={script} />
          <RequirementsEditor script={script} />
          <ScriptEditor script={script} />
          <LogViewer logs={script.logs || []} />
        </CardContent>
      </Card>
    </div>
  );
}

