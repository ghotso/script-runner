'use server'

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Script, Log } from '@/types/script';

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

async function getScripts(): Promise<Script[]> {
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

async function saveScripts(scripts: Script[]) {
  const filePath = getScriptsFilePath();
  await fs.writeFile(filePath, JSON.stringify({ scripts }, null, 2));
}

export async function addScript(script: Omit<Script, 'id' | 'logs'>) {
  const scripts = await getScripts();

  const newScript: Script = {
    ...script,
    id: (scripts.length + 1).toString(),
    logs: []
  };

  scripts.push(newScript);

  await saveScripts(scripts);

  // Make the script executable if it's a bash script
  if (newScript.type === 'bash') {
    const scriptPath = path.join('/data', `script_${newScript.id}.sh`);
    await fs.writeFile(scriptPath, newScript.content);
    await fs.chmod(scriptPath, '755');
  }
}

export async function updateScript(scriptId: string, content: string) {
  const scripts = await getScripts();
  const script = scripts.find((s: Script) => s.id === scriptId);
  if (script) {
    script.content = content;
    await saveScripts(scripts);
  }
}

export async function updateRequirements(scriptId: string, requirements: string[]) {
  const scripts = await getScripts();
  const script = scripts.find((s: Script) => s.id === scriptId);
  if (script) {
    script.requirements = requirements;
    await saveScripts(scripts);
  }
}

export async function installRequirements(scriptId: string) {
  const scripts = await getScripts();
  const script = scripts.find((s: Script) => s.id === scriptId);
  if (script && script.requirements.length > 0) {
    console.log(`Installing requirements for script ${scriptId}: ${script.requirements.join(', ')}`);
    try {
      const requirementsFile = path.join('/tmp', `requirements_${scriptId}.txt`);
      await fs.writeFile(requirementsFile, script.requirements.join('\n'));
      
      const { stdout } = await execAsync(`${process.env.PYTHON_PATH || 'python3'} -m pip freeze`);
      const installedPackages = new Set(stdout.split('\n').map((pkg: string) => pkg.split('==')[0].toLowerCase()));
      const packagesToInstall = script.requirements.filter((req: string) => 
        !installedPackages.has(req.toLowerCase())
      );
      
      if (packagesToInstall.length === 0) {
        return { 
          success: true, 
          message: 'All requirements are already installed.' 
        };
      }
      
      const { stdout: installStdout, stderr: installStderr } = await execAsync(
        `${process.env.PYTHON_PATH || 'python3'} -m pip install -r ${requirementsFile}`
      );
      
      if (installStderr) {
        console.error('Error installing requirements:', installStderr);
        return { 
          success: false, 
          message: 'Failed to install requirements. Check the logs for more details.' 
        };
      }
      
      console.log('Requirements installed successfully:', installStdout);
      return { 
        success: true, 
        message: `Successfully installed: ${packagesToInstall.join(', ')}` 
      };
    } catch (error) {
      console.error('Error installing requirements:', error);
      return { 
        success: false, 
        message: 'An error occurred while installing requirements.' 
      };
    }
  }
  return { 
    success: true, 
    message: 'No requirements to install.' 
  };
}

export async function updateSchedule(scriptId: string, schedule: string) {
  const scripts = await getScripts();
  const script = scripts.find((s: Script) => s.id === scriptId);
  if (script) {
    script.schedule = schedule;
    await saveScripts(scripts);
  }
}

export async function updateTags(scriptId: string, tags: string[]) {
  const scripts = await getScripts();
  const script = scripts.find((s: Script) => s.id === scriptId);
  if (script) {
    script.tags = tags;
    await saveScripts(scripts);
  }
}

export async function runScript(scriptId: string) {
  const scripts = await getScripts();
  const script = scripts.find((s: Script) => s.id === scriptId);

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

  const newLog: Log = {
    timestamp: startTime.toISOString(),
    status: status,
    duration: duration,
    output: output
  };

  script.logs.push(newLog);
  script.logs = script.logs.slice(-10);

  await saveScripts(scripts);

  return output;
}

async function executePythonScript(content: string) {
  const tempScriptPath = path.join('/tmp', `script_${Date.now()}.py`);
  await fs.writeFile(tempScriptPath, content);
  try {
    const { stdout, stderr } = await execAsync(`${process.env.PYTHON_PATH || 'python3'} ${tempScriptPath}`);
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
  const scripts = await getScripts();
  const updatedScripts = scripts.filter((s: Script) => s.id !== scriptId);
  await saveScripts(updatedScripts);
}

