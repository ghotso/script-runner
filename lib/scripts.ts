import fs from 'fs/promises';
import path from 'path';
import { Script } from '@/types/script';

const getScriptsFilePath = () => {
  return process.env.NODE_ENV === 'production'
    ? process.env.SCRIPTS_PATH || '/data/scripts.json'
    : path.join(process.cwd(), 'data', 'scripts.json');
};

async function ensureScriptsFileExists() {
  const filePath = getScriptsFilePath();
  try {
    await fs.access(filePath);
  } catch (error) {
    // File doesn't exist, create it with an empty scripts array
    await fs.writeFile(filePath, JSON.stringify({ scripts: [] }, null, 2));
  }
}

export async function getScripts(): Promise<Script[]> {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Build time: Returning empty scripts array');
    return [];
  }

  await ensureScriptsFileExists();
  const filePath = getScriptsFilePath();
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const parsedContents = JSON.parse(fileContents);
    if (!parsedContents.scripts) {
      parsedContents.scripts = [];
      await fs.writeFile(filePath, JSON.stringify(parsedContents, null, 2));
    }
    return parsedContents.scripts;
  } catch (error) {
    console.error('Error reading scripts file:', error);
    return [];
  }
}

export async function getScript(id: string): Promise<Script | undefined> {
  const scripts = await getScripts();
  return scripts.find(script => script.id === id);
}

