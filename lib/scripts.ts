import fs from 'fs/promises';
import path from 'path';
import { Script } from '@/types/script';

const getScriptsFilePath = () => {
  return process.env.NODE_ENV === 'production'
    ? process.env.SCRIPTS_PATH || '/data/scripts.json'
    : path.join(process.cwd(), 'data', 'scripts.json');
};

export async function getScripts(): Promise<Script[]> {
  const filePath = getScriptsFilePath();
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents).scripts;
}

export async function getScript(id: string): Promise<Script | undefined> {
  const scripts = await getScripts();
  return scripts.find(script => script.id === id);
}

