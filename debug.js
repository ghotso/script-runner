const fs = require('fs');
const path = require('path');

function checkEnvironmentVariables() {
    console.log('Checking environment variables:');
    console.log('PORT:', process.env.PORT);
    console.log('HOSTNAME:', process.env.HOSTNAME);
    console.log('SCRIPTS_PATH:', process.env.SCRIPTS_PATH);
    console.log('PYTHON_PATH:', process.env.PYTHON_PATH);
    console.log('LOGS_PATH:', process.env.LOGS_PATH);
    console.log('RUNS_LOGS_PATH:', process.env.RUNS_LOGS_PATH);
}

function checkFilePermissions() {
    const filesToCheck = [
        '/data/scripts.json',
        '/data/settings.json',
        '/data/logs/container.log'
    ];

    console.log('Checking file permissions:');
    filesToCheck.forEach(file => {
        try {
            const stats = fs.statSync(file);
            console.log(`${file}: exists, mode: ${stats.mode.toString(8).slice(-3)}`);
        } catch (error) {
            console.error(`Error checking ${file}:`, error.message);
        }
    });
}

function checkDirectoryContents() {
    const dirsToCheck = ['/data', '/data/logs', '/data/logs/runs'];

    console.log('Checking directory contents:');
    dirsToCheck.forEach(dir => {
        try {
            const files = fs.readdirSync(dir);
            console.log(`${dir} contents:`, files);
        } catch (error) {
            console.error(`Error checking ${dir}:`, error.message);
        }
    });
}

function main() {
    console.log('Starting debug script...');
    checkEnvironmentVariables();
    checkFilePermissions();
    checkDirectoryContents();
    console.log('Debug script completed.');
}

main();

