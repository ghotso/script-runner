#!/bin/sh

# Function to install Python dependencies
install_python_deps() {
  echo "Installing Python dependencies: $1"
  pip install $1
}

# Function to install Bash dependencies
install_bash_deps() {
  echo "Installing Bash dependencies: $1"
  apk add --no-cache $1
}

# Read the scripts file and install dependencies
if [ -f /app/data/scripts.json ]; then
  echo "Installing dependencies for existing scripts..."
  
  # Use jq to parse JSON and extract unique dependencies
  PYTHON_DEPS=$(jq -r '.[] | select(.type == "Python") | .dependencies' /app/data/scripts.json | sort -u | tr '\n' ' ')
  BASH_DEPS=$(jq -r '.[] | select(.type == "Bash") | .dependencies' /app/data/scripts.json | sort -u | tr '\n' ' ')

  # Install Python dependencies
  if [ ! -z "$PYTHON_DEPS" ]; then
    install_python_deps "$PYTHON_DEPS"
  fi

  # Install Bash dependencies
  if [ ! -z "$BASH_DEPS" ]; then
    install_bash_deps "$BASH_DEPS"
  fi
else
  echo "No existing scripts found."
fi

# Initialize the scheduler
echo "Initializing scheduler..."
node -e "require('./utils/scheduler').initializeScheduler()"

# Check if Discord webhook is set
if [ -z "$DISCORD_WEBHOOK_URL" ]; then
  echo "Warning: DISCORD_WEBHOOK_URL is not set. Discord notifications will be disabled."
else
  echo "Discord webhook is configured."
fi

# Start the Next.js application
echo "Starting the application..."
npm start

