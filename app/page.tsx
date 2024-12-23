import fs from 'fs/promises'
import path from 'path'
import SearchScripts from './components/search-scripts'
import { type Script } from '@/types/script'

async function getScripts(): Promise<Script[]> {
  const filePath = path.join(process.cwd(), 'data', 'scripts.json');
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents).scripts;
  } catch (error) {
    console.error('Error reading scripts file:', error);
    return [];
  }
}

export default async function Home() {
  const scripts = await getScripts();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Script Runner</h1>
      <SearchScripts initialScripts={scripts} />
    </div>
  );
}

