import fs from 'fs/promises'
import path from 'path'
import ScriptList from './components/script-list'

async function getScripts() {
  const filePath = path.join(process.cwd(), 'data', 'scripts.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents).scripts;
}

export default async function Home() {
  const scripts = await getScripts();

  return <ScriptList initialScripts={scripts} />;
}

