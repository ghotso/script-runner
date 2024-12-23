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
  const newScript = await response.json();
  return newScript;
}

export async function updateScript(scriptId: string, content: string) {
  const response = await fetch(`${API_BASE_URL}/api/scripts/${scriptId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    throw new Error('Failed to update script');
  }
  return response.json();
}

export async function updateRequirements(scriptId: string, requirements: string[]) {
  const response = await fetch(`${API_BASE_URL}/api/scripts/${scriptId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requirements }),
  });
  if (!response.ok) {
    throw new Error('Failed to update requirements');
  }
  return response.json();
}

export async function installRequirements(scriptId: string) {
  const scripts = await getScripts();
  const script = scripts.find((s: Script) => s.id === scriptId);
  if (script && script.requirements.length > 0) {
    console.log(`Installing requirements for script ${scriptId}: ${script.requirements.join(', ')}`);
    try {
      const { stdout, stderr } = await execAsync(`${process.env.VIRTUAL_ENV}/bin/pip install --no-cache-dir ${script.requirements.join(' ')}`);
      
      if (stderr) {
        console.error('Error installing requirements:', stderr);
        return { 
          success: false, 
          message: 'Failed to install requirements. Check the logs for more details.' 
        };
      }
      
      console.log('Requirements installed successfully:', stdout);
      return { 
        success: true, 
        message: `Successfully installed: ${script.requirements.join(', ')}` 
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
        const errorOutput = error.message || 'An unknown error occurred';
        status = 'Failed';
        
        // Send Discord notification for failed run
        await sendDiscordNotification(script, startTime, errorOutput);

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
Error:
${errorOutput}
        `;

        await writeToLogFile(logContent);
        await writeToRunLogFile(scriptId, logContent);

        const newLog: Log = {
            timestamp: startTime.toISOString(),
            status: status,
            duration: duration,
            output: errorOutput
        };

        script.logs.push(newLog);
        script.logs = script.logs.slice(-12);

        await saveScript(script);

        return { success: false, error: errorOutput };
    }
}

export async function deleteScript(scriptId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/scripts/${scriptId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete script');
  }
}

export async function getSettings(): Promise<Settings> {
  return getSettingsFromAPI();
}

export async function updateSettings(settings: Settings): Promise<Settings> {
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
  return response.json();
}

export async function sendDiscordNotification(script: Script, startTime: Date, output: string) {
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

async function writeToLogFile(content: string) {
  try {
    const timestamp = new Date().toISOString().split('T')[0]; // Get current date
    const logFileName = `${timestamp}.log`;
    const logFilePath = path.join(LOGS_PATH, logFileName);
    await fs.mkdir(path.dirname(logFilePath), { recursive: true });
    await fs.appendFile(logFilePath, content + '\n');

    // Implement log rotation for container logs (keep last 7 days)
    const logFiles = await fs.readdir(LOGS_PATH);
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 7);

    for (const file of logFiles) {
      const filePath = path.join(LOGS_PATH, file);
      const stats = await fs.stat(filePath);
      if (stats.isFile() && stats.mtime < dateThreshold) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
}

async function writeToRunLogFile(scriptId: string, content: string) {
    try {
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const logFileName = `${scriptId}_${timestamp}.log`;
        const logFilePath = path.join(RUNS_LOGS_PATH, logFileName);
        await fs.mkdir(path.dirname(logFilePath), { recursive: true });
        await fs.writeFile(logFilePath, content);

        // Implement log rotation for run logs (keep last 20 logs)
        const logFiles = await fs.readdir(RUNS_LOGS_PATH);
        const scriptLogs = logFiles.filter(file => file.startsWith(`${scriptId}_`));
        
        if (scriptLogs.length > 20) {
            scriptLogs.sort((a, b) => {
                const timeA = a.split('_')[1].split('.')[0];
                const timeB = b.split('_')[1].split('.')[0];
                return new Date(timeB).getTime() - new Date(timeA).getTime();
            });

            for (let i = 20; i < scriptLogs.length; i++) {
                await fs.unlink(path.join(RUNS_LOGS_PATH, scriptLogs[i]));
            }
        }
    } catch (error) {
        console.error('Error writing to run log file:', error);
    }
}

async function executePythonScript(content: string) {
  try {
    const escapedContent = content.replace(/"/g, '\\"');
    const { stdout, stderr } = await execAsync(`${process.env.PYTHON_PATH || 'python3'} -c "${escapedContent}"`);
    if (stderr) {
      console.error('Python script error:', stderr);
      return stderr;
    }
    return stdout;
  } catch (error: any) {
    console.error('Error executing Python script:', error);
    return error.message;
  }
}

async function executeBashScript(content: string) {
  try {
    const escapedContent = content.replace(/"/g, '\\"');
    const { stdout, stderr } = await execAsync(`bash -c "${escapedContent}"`);
    if (stderr) {
      console.error('Bash script error:', stderr);
      return stderr;
    }
    return stdout;
  } catch (error: any) {
    console.error('Error executing Bash script:', error);
    return error.message;
  }
}

async function getSettingsFromAPI(): Promise<Settings> {
  const response = await fetch(`${API_BASE_URL}/api/settings`);
  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }
  return response.json();
}

