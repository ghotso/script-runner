'use server'

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { Script, Log } from '@/types/script';
import { Settings } from '@/types/settings';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const execAsync = promisify(exec);

const LOGS_PATH = process.env.LOGS_PATH || '/data/logs';
const RUNS_LOGS_PATH = process.env.RUNS_LOGS_PATH || '/data/logs/runs';

async function getScripts(): Promise<Script[]> {
  const response = await fetch(`${API_BASE_URL}/api/scripts`);
  if (!response.ok) {
    throw new Error('Failed to fetch scripts');
  }
  return response.json();
}

async function saveScript(script: Script) {
  const response = await fetch(`${API_BASE_URL}/api/scripts/${script.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(script),
  });
  if (!response.ok) {
    throw new Error('Failed to save script');
  }
  return response.json();
}

export async function addScript(script: Omit<Script, 'id' | 'logs'>) {
  const response = await fetch(`${API_BASE_URL}/api/scripts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(script),
  });
  if (!response.ok) {
    throw new Error('Failed to add script');
  }
  return response.json();
}

export async function updateScript(scriptId: string, content: string) {
  const scripts = await getScripts();
  const script = scripts.find((s: Script) => s.id === scriptId);
  if (script) {
    script.content = content;
    await saveScript(script);
  }
}

export async function updateRequirements(scriptId: string, requirements: string[]) {
  const scripts = await getScripts();
  const script = scripts.find((s: Script) => s.id === scriptId);
  if (script) {
    script.requirements = requirements;
    await saveScript(script);
  }
}

export async function installRequirements(scriptId: string) {
  const scripts = await getScripts();
  const script = scripts.find((s: Script) => s.id === scriptId);
  if (script && script.requirements.length > 0) {
    console.log(`Installing requirements for script ${scriptId}: ${script.requirements.join(', ')}`);
    try {
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
        `${process.env.PYTHON_PATH || 'python3'} -m pip install ${packagesToInstall.join(' ')}`
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

export async function updateSchedule(scriptId: string, schedules: string) {
  const scripts = await getScripts();
  const script = scripts.find((s: Script) => s.id === scriptId);
  if (script) {
    script.schedule = schedules;
    await saveScript(script);
  }
}

export async function updateTags(scriptId: string, tags: string[]) {
  const scripts = await getScripts();
  const script = scripts.find((s: Script) => s.id === scriptId);
  if (script) {
    script.tags = tags;
    await saveScript(script);
  }
}

async function writeToLogFile(content: string) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const logFileName = `${timestamp}.log`;
  const logFilePath = path.join(LOGS_PATH, logFileName);
  await fs.writeFile(logFilePath, content);
}

async function writeToRunLogFile(scriptId: string, content: string) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const logFileName = `${scriptId}_${timestamp}.log`;
  const logFilePath = path.join(RUNS_LOGS_PATH, logFileName);
  await fs.writeFile(logFilePath, content);
}

export async function runScript(scriptId: string) {
  try {
    const scripts = await getScripts();
    const script = scripts.find((s: Script) => s.id === scriptId);

    if (!script) {
      throw new Error('Script not found');
    }

    console.log(`Running script: ${script.name}`);
    const startTime = new Date();
    let status = 'Completed';
    let output = '';

    if (script.type === 'python') {
      output = await executePythonScript(script.content);
    } else if (script.type === 'bash') {
      output = await executeBashScript(script.content);
    } else {
      throw new Error('Unsupported script type');
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    const logContent = `
Script ID: ${scriptId}
Name: ${script.name}
Type: ${script.type}
Start Time: ${startTime.toISOString()}
End Time: ${endTime.toISOString()}
Duration: ${duration}ms
Status: ${status}
Output:
${output}
    `;

    await writeToLogFile(logContent);
    await writeToRunLogFile(scriptId, logContent);

    const newLog: Log = {
      timestamp: startTime.toISOString(),
      status: status,
      duration: duration,
      output: output || 'Script executed successfully with no output'
    };

    script.logs.push(newLog);
    script.logs = script.logs.slice(-12);

    await saveScript(script);

    return { success: true, output };
  } catch (error: any) {
    console.error('Error running script:', error);
    return { success: false, error: error.message };
  }
}

async function executePythonScript(content: string) {
  const { stdout, stderr } = await execAsync(`${process.env.PYTHON_PATH || 'python3'} -c "${content}"`);
  if (stderr) {
    console.error('Python script error:', stderr);
  }
  return stdout || stderr;
}

async function executeBashScript(content: string) {
  const { stdout, stderr } = await execAsync(`bash -c "${content}"`);
  if (stderr) {
    console.error('Bash script error:', stderr);
  }
  return stdout || stderr;
}

export async function deleteScript(scriptId: string) {
  const response = await fetch(`${API_BASE_URL}/api/scripts/${scriptId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete script');
  }
}

// Settings-related functions

async function getSettingsFromAPI(): Promise<Settings> {
  const response = await fetch(`${API_BASE_URL}/api/settings`);
  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }
  return response.json();
}

export async function getSettings(): Promise<Settings> {
  return getSettingsFromAPI();
}

export async function updateSettings(settings: Settings) {
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error('Failed to update settings');
  }
}

async function sendDiscordNotification(script: Script, startTime: Date, output: string) {
  const settings = await getSettingsFromAPI();
  if (!settings.discordWebhook) {
    console.log('Discord webhook not configured. Skipping notification.');
    return;
  }

  const embed = {
    title: `Script Execution Failed: ${script.name}`,
    color: 0xFF0000, // Red color for error
    fields: [
      {
        name: 'Script ID',
        value: script.id,
        inline: true
      },
      {
        name: 'Script Type',
        value: script.type,
        inline: true
      },
      {
        name: 'Execution Time',
        value: startTime.toISOString(),
        inline: true
      },
      {
        name: 'Error Output',
        value: output.substring(0, 1024) // Discord has a 1024 character limit for field values
      }
    ],
    timestamp: new Date().toISOString()
  };

  const payload = {
    embeds: [embed]
  };

  try {
    const response = await fetch(settings.discordWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Failed to send Discord notification:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Discord notification:', error);
  }
}

