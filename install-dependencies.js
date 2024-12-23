import { execSync } from 'child_process';

try {
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('Dependencies have been successfully installed.');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
}

