#!/bin/sh

# Read the scripts file
SCRIPTS_FILE=${SCRIPTS_PATH:-/data/scripts.json}

# Check if the file exists
if [ ! -f "$SCRIPTS_FILE" ]; then
    echo "Scripts file not found: $SCRIPTS_FILE"
    exit 0
fi

# Extract all unique requirements
REQUIREMENTS=$(jq -r '.scripts[].requirements[]' "$SCRIPTS_FILE" | sort -u)

# Install the requirements
if [ -n "$REQUIREMENTS" ]; then
    echo "Installing requirements:"
    echo "$REQUIREMENTS"
    echo "$REQUIREMENTS" | xargs -n 1 pip install
else
    echo "No requirements to install."
fi

