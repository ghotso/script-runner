import { NextResponse } from 'next/server';
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
    // File exists, let's make sure it's valid JSON
    const content = await fs.readFile(filePath, 'utf8');
    try {
      JSON.parse(content);
    } catch (parseError) {
      // If it's not valid JSON, overwrite with a valid empty structure
      await fs.writeFile(filePath, JSON.stringify({ scripts: [] }, null, 2));
    }
  } catch (error) {
    // File doesn't exist, create it with an empty scripts array
    await fs.writeFile(filePath, JSON.stringify({ scripts: [] }, null, 2));
  }
}

async function getScriptsFromFile(): Promise<Script[]> {
  await ensureScriptsFileExists();
  const filePath = getScriptsFilePath();
  const fileContents = await fs.readFile(filePath, 'utf8');
  const parsedContents = JSON.parse(fileContents);
  return parsedContents.scripts || [];
}

export async function GET() {
  try {
    const scripts = await getScriptsFromFile();
    return NextResponse.json(scripts);
  } catch (error) {
    console.error('Error reading scripts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newScript = await request.json();
    const scripts = await getScriptsFromFile();
    
    const scriptWithId: Script = {
      ...newScript,
      id: (scripts.length + 1).toString(),
      logs: []
    };
    
    scripts.push(scriptWithId);
    
    const filePath = getScriptsFilePath();
    await fs.writeFile(filePath, JSON.stringify({ scripts }, null, 2));
    
    return NextResponse.json(scriptWithId, { status: 201 });
  } catch (error) {
    console.error('Error adding script:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

