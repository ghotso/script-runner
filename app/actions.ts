'use server'

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const getScriptsFilePath = () => {
  return process.env.NODE_ENV === 'production'
    ? process.env.SCRIPTS_PATH
    : path.join(process.cwd(), 'data', 'scripts.json');
};

async function getScripts() {
  const filePath = getScriptsFilePath();
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

async function saveScripts(scripts) {
  const filePath = getScriptsFilePath();
  await fs.writeFile(filePath, JSON.stringify(scripts, null, 2));
}

export async function addScript(script) {
  const data = await getScripts();
  
  const newScript = {
    ...script,
    id: (data.scripts.length + 1).toString(),
    logs: []
  };
  
  data.scripts.push(newScript);
  
  await saveScripts(data);
}

export async function updateScript(scriptId, content) {
  const data = await getScripts();
  const script = data.scripts.find(s => s.id === scriptId);
  if (script) {
    script.content = content;
    await saveScripts(data);
  }
}

export async function updateRequirements(scriptId, requirements) {
  const data = await getScripts();
  const script = data.scripts.find(s => s.id === scriptId);
  if (script) {
    script.requirements = requirements;
    await saveScripts(data);
  }
}

export async function installRequirements(scriptId) {
  const data = await getScripts();
  const script = data.scripts.find(s => s.id === scriptId);
  if (script && script.requirements.length > 0) {
    // In a real-world scenario, you would execute pip install here
    console.log(`Installing requirements for script ${scriptId}: ${script.requirements.join(', ')}`);
    // Simulate installation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

export async function updateSchedule(scriptId, schedule) {
  const data = await getScripts();
  const script = data.scripts.find(s => s.id === scriptId);
  if (script) {
    script.schedule = schedule;
    await saveScripts(data);
  }
}

export async function runScript(scriptId) {
  const data = await getScripts();
  const script = data.scripts.find(s => s.id === scriptId);
  
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
  } catch (error) {
    status = 'Failed';
    output = error.message;
  }

  const endTime = new Date();
  const duration = endTime - startTime;

  // Log the execution
  script.logs.push({
    timestamp: startTime.toISOString(),
    status: status,
    duration: duration,
    output: output
  });
  
  // Keep only the last 10 logs
  script.logs = script.logs.slice(-10);
  
  await saveScripts(data);

  return output;
}

async function executePythonScript(content) {
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

async function executeBashScript(content) {
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

