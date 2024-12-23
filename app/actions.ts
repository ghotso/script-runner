'use server'

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Script } from '@/types/script';

const execAsync = promisify(exec);

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

async function getScripts(): Promise<{ scripts: Script[] }> {
  await ensureScriptsFileExists();
  const filePath = getScriptsFilePath();
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents) || { scripts: [] };
  } catch (error) {
    console.error('Error reading scripts file:', error);
    return { scripts: [] };
  }
}

async function saveScripts(scripts: { scripts: Script[] }) {
  const filePath = getScriptsFilePath();
  await fs.writeFile(filePath, JSON.stringify(scripts, null, 2));
}

export async function addScript(script: Omit<Script, 'id' | 'logs'>) {
  const data = await getScripts();
  
  const newScript: Script = {
    ...script,
    id: (data.scripts.length + 1).toString(),
    logs: []
  };
  
  data.scripts.push(newScript);
  
  await saveScripts(data);

  // Make the script executable if it's a bash script
  if (newScript.type === 'bash') {
    const scriptPath = path.join('/data', `script_${newScript.id}.sh`);
    await fs.writeFile(scriptPath, newScript.content);
    await fs.chmod(scriptPath, '755');
  }
}

export async function updateScript(scriptId: string, content: string) {
  const data = await getScripts();
  const script = data.scripts.find((s: Script) => s.id === scriptId);
  if (script) {
    script.content = content;
    await saveScripts(data);
  }
}

export async function updateRequirements(scriptId: string, requirements: string[]) {
  const data = await getScripts();
  const script = data.scripts.find((s: Script) => s.id === scriptId);
  if (script) {
    script.requirements = requirements;
    await saveScripts(data);
  }
}

export async function installRequirements(scriptId: string) {
  const data = await getScripts();
  const script = data.scripts.find((s: Script) => s.id === scriptId);
  if (script && script.requirements.length > 0) {
    console.log(`Installing requirements for script ${scriptId}: ${script.requirements.join(', ')}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

export async function updateSchedule(scriptId: string, schedule: string) {
  const data = await getScripts();
  const script = data.scripts.find((s: Script) => s.id === scriptId);
  if (script) {
    script.schedule = schedule;
    await saveScripts(data);
  }
}

export async function updateTags(scriptId: string, tags: string[]) {
  const data = await getScripts();
  const script = data.scripts.find((s: Script) => s.id === scriptId);
  if (script) {
    script.tags = tags;
    await saveScripts(data);
  }
}

export async function runScript(scriptId: string) {
  const data = await getScripts();
  const script = data.scripts.find((s: Script) => s.id === scriptId);
  
  if (!script) {
    throw new Error('Script not found');
  }

  console.log(`Running script: ${script.name}`);
  const startTime = new Date();
  let status = 'Completed';
  let output = '';

  try {
    if (script.type === 'python') {
      output = await executePythonScript(script.content);
    } else if (script.type === 'bash') {
      output = await executeBashScript(script.content);
    } else {
      throw new Error('Unsupported script type');
    }
  } catch (error: any) {
    status = 'Failed';
    output = error.message;
  }

  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();

  script.logs.push({
    timestamp: startTime.toISOString(),
    status: status,
    duration: duration,
    output: output
  });
  
  script.logs = script.logs.slice(-10);
  
  await saveScripts(data);

  return output;
}

async function executePythonScript(content: string) {
  const tempScriptPath = path.join('/tmp', `script_${Date.now()}.py`);
  await fs.writeFile(tempScriptPath, content);
  try {
    const { stdout, stderr } = await execAsync(`python ${tempScriptPath}`);
    if (stderr) {
      console.error('Python script error:', stderr);
    }
    return stdout;
  } finally {
    await fs.unlink(tempScriptPath);
  }
}

async function executeBashScript(content: string) {
  const tempScriptPath = path.join('/tmp', `script_${Date.now()}.sh`);
  await fs.writeFile(tempScriptPath, content);
  await fs.chmod(tempScriptPath, '755');
  try {
    const { stdout, stderr } = await execAsync(tempScriptPath);
    if (stderr) {
      console.error('Bash script error:', stderr);
    }
    return stdout;
  } finally {
    await fs.unlink(tempScriptPath);
  }
}

export async function deleteScript(scriptId: string) {
  const data = await getScripts();
  data.scripts = data.scripts.filter((s: Script) => s.id !== scriptId);
  await saveScripts(data);
}

