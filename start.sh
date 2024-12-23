#!/bin/sh

echo "Container startup script beginning..."

# Function to install requirements
install_requirements() {
    SCRIPTS_FILE=${SCRIPTS_PATH:-/data/scripts.json}
    echo "Checking scripts file at: $SCRIPTS_FILE"
    
    if [ -f "$SCRIPTS_FILE" ]; then
        echo "Found scripts file, extracting requirements..."
        
        # Use jq to extract requirements, handle empty arrays
        REQUIREMENTS=$(jq -r '.scripts[] | select(.requirements != null) | .requirements[]' "$SCRIPTS_FILE" 2>/dev/null | sort -u)
        
        if [ $? -eq 0 ] && [ -n "$REQUIREMENTS" ]; then
            echo "Found the following requirements to install:"
            echo "$REQUIREMENTS"
            echo "Installing requirements..."
            echo "$REQUIREMENTS" | while read req; do
                echo "Installing: $req"
                pip install "$req"
            done
            echo "All requirements installed successfully."
        else
            echo "No requirements found in scripts.json"
        fi
    else
        echo "Warning: Scripts file not found at: $SCRIPTS_FILE"
    fi
}

# Install requirements
echo "Starting requirements installation..."
install_requirements
echo "Requirements installation completed."

# Start the application
echo "Starting Node.js application..."
exec node server.js

