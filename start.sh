#!/bin/bash

set -e

echo "Container startup script beginning..."

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a /data/logs/container.log
}

# Ensure log directories exist and have correct permissions
if [ ! -d "/data/logs" ] || [ ! -d "/data/logs/runs" ]; then
    log_message "Creating log directories..."
    mkdir -p /data/logs /data/logs/runs || log_message "Failed to create log directories"
fi

log_message "Setting permissions for log directories..."
chown -R nextjs:nodejs /data/logs /data/logs/runs || log_message "Failed to set ownership for log directories"
chmod -R 755 /data/logs /data/logs/runs || log_message "Failed to set permissions for log directories"

log_message "Log directories created and permissions set"

# Function to install requirements
install_requirements() {
    SCRIPTS_FILE=${SCRIPTS_PATH:-/data/scripts.json}
    log_message "Checking scripts file at: $SCRIPTS_FILE"
    
    if [ -f "$SCRIPTS_FILE" ]; then
        log_message "Found scripts file, extracting requirements..."
        
        # Use jq to extract requirements, handle empty arrays
        REQUIREMENTS=$(jq -r '.scripts[] | select(.requirements != null) | .requirements[]' "$SCRIPTS_FILE" 2>/dev/null | sort -u)
        
        if [ $? -eq 0 ] && [ -n "$REQUIREMENTS" ]; then
            log_message "Found the following requirements to install:"
            echo "$REQUIREMENTS" | tee -a /data/logs/container.log
            log_message "Installing requirements..."
            echo "$REQUIREMENTS" | while read req; do
                log_message "Installing: $req"
                pip install "$req" || log_message "Failed to install $req"
            done
            log_message "All requirements installation attempts completed."
        else
            log_message "No requirements found in scripts.json"
        fi
    else
        log_message "Warning: Scripts file not found at: $SCRIPTS_FILE"
    fi
}

# Install requirements
log_message "Starting requirements installation..."
install_requirements
log_message "Requirements installation completed."

# Start cron daemon
log_message "Starting cron daemon..."
crond -f &

# Start the application
log_message "Starting Node.js application..."
exec node server.js

