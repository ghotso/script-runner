import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScriptEditor from './script-editor';
import RequirementsEditor from './requirements-editor';
import ScheduleManager from './schedule-manager';
import LogViewer from './log-viewer';
import ScriptRunner from './script-runner';

async function getScript(id) {
  const filePath = path.join(process.cwd(), 'data', 'scripts.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  const scripts = JSON.parse(fileContents).scripts;
  return scripts.find(script => script.id === id);
}

export default async function ScriptDetail({ params }) {
  const script = await getScript(params.id);

  if (!script) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="bg-gray-800 text-white">
        <CardHeader>
          <CardTitle>{script.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Type: {script.type}</p>
          <div className="mt-2">
            {script.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="mr-1">
                {tag}
              </Badge>
            ))}
          </div>
          <ScriptEditor script={script} />
          <RequirementsEditor script={script} />
          <ScheduleManager script={script} />
          <ScriptRunner script={script} />
          <LogViewer logs={script.logs} />
        </CardContent>
      </Card>
    </div>
  );
}

