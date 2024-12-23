import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Script } from '@/types/script';

const getScriptsFilePath = () => {
  return process.env.NODE_ENV === 'production'
    ? process.env.SCRIPTS_PATH || '/data/scripts.json'
    : path.join(process.cwd(), 'data', 'scripts.json');
};

async function getScriptsFromFile(): Promise<Script[]> {
  const filePath = getScriptsFilePath();
  const fileContents = await fs.readFile(filePath, 'utf8');
  const parsedContents = JSON.parse(fileContents);
  return parsedContents.scripts || [];
}

async function saveScriptsToFile(scripts: Script[]) {
  const filePath = getScriptsFilePath();
  await fs.writeFile(filePath, JSON.stringify({ scripts }, null, 2));
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const scripts = await getScriptsFromFile();
    const script = scripts.find(s => s.id === params.id);
    
    if (!script) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 });
    }
    
    return NextResponse.json(script);
  } catch (error) {
    console.error('Error fetching script:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const updatedFields = await request.json();
    const scripts = await getScriptsFromFile();
    const index = scripts.findIndex(s => s.id === params.id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 });
    }
    
    scripts[index] = { ...scripts[index], ...updatedFields };
    await saveScriptsToFile(scripts);
    
    return NextResponse.json(scripts[index]);
  } catch (error) {
    console.error('Error updating script:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const scripts = await getScriptsFromFile();
    const updatedScripts = scripts.filter(s => s.id !== params.id);
    
    if (updatedScripts.length === scripts.length) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 });
    }
    
    await saveScriptsToFile(updatedScripts);
    
    return NextResponse.json({ message: 'Script deleted successfully' });
  } catch (error) {
    console.error('Error deleting script:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

