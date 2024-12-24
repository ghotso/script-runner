# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies and generate a new package-lock.json
RUN npm install

# Copy source code
COPY . .

# Create scripts and data directories
RUN mkdir -p scripts data/logs

# Build the application
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

# Install Python 3, pip, bash, jq, and other necessary tools
RUN apk add --no-cache python3 py3-pip bash curl jq

# Create app directory
WORKDIR /app

# Create scripts directory
RUN mkdir -p /app/scripts

# Create data and logs directories with proper permissions
RUN mkdir -p /app/data/logs && chmod 777 /app/data/logs

# Copy built assets from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/lib ./lib

# Copy the scripts and data directories
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/data ./data

# Set up Python virtual environment
ENV VIRTUAL_ENV=/app/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Give necessary permissions
RUN chmod -R 777 /app

# Copy the startup script
COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

# Expose the port
EXPOSE 3000

# Start the application using the startup script
CMD ["/app/startup.sh"]

