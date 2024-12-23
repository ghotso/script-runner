// In the installRequirements function, update the return messages:

export async function installRequirements(scriptId: string) {
  const data = await getScripts();
  const script = data.scripts.find((s: Script) => s.id === scriptId);
  if (script && script.requirements.length > 0) {
    console.log(`Installing requirements for script ${scriptId}: ${script.requirements.join(', ')}`);
    try {
      const requirementsFile = path.join('/tmp', `requirements_${scriptId}.txt`);
      await fs.writeFile(requirementsFile, script.requirements.join('\n'));
      
      const { stdout, stderr } = await execAsync(`${process.env.PYTHON_PATH || 'python3'} -m pip freeze`);
      const installedPackages = new Set(stdout.split('\n').map(pkg => pkg.split('==')[0].toLowerCase()));
      const packagesToInstall = script.requirements.filter(req => 
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

