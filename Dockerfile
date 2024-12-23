# Build stage
FROM node:18.18.0-alpine AS builder

WORKDIR /app

# Install Python and build dependencies
RUN apk add --no-cache python3 py3-pip make g++

# Copy package.json
COPY package.json ./

# Remove existing package-lock.json and install dependencies
RUN rm -f package-lock.json && npm install

# Copy the rest of the source code
COPY . .

# Create an empty scripts.json file for build process
RUN mkdir -p /data && echo '{"scripts":[]}' > /data/scripts.json

# Set environment variable for build
ENV SCRIPTS_PATH=/data/scripts.json

# Run npm install before typecheck
RUN npm install

# Run TypeScript check
RUN npm run typecheck

# Build application
RUN npm run build

# Production stage
FROM node:18.18.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Install Python and other necessary tools, and set up paths properly
RUN apk add --no-cache python3 py3-pip jq make g++ dcron bash && \
    mkdir -p /home/nextjs/.local/bin && \
    chown -R root:root /home/nextjs && \
    # Remove existing python symlink if it exists
    rm -f /usr/bin/python && \
    # Create new symlink
    ln -s /usr/bin/python3 /usr/bin/python && \
    # Install pip packages globally to avoid permission issues
    pip3 install --no-cache-dir --upgrade pip && \
    # Set PATH for all users
    echo 'export PATH="/home/nextjs/.local/bin:$PATH"' >> /etc/profile

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /data && \
    mkdir -p /data/logs && \
    mkdir -p /data/logs/runs && \
    chown -R nextjs:nodejs /data && \
    chown -R nextjs:nodejs /data/logs && \
    chown -R nextjs:nodejs /home/nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create data volume
VOLUME /data

# Copy scripts.json to the data directory
COPY --chown=nextjs:nodejs data/scripts.json /data/scripts.json

# Add these lines
RUN touch /data/settings.json && \
    chown nextjs:nodejs /data/settings.json && \
    chmod 644 /data/settings.json

# Ensure the volume is created after setting up the files
VOLUME /data

# Copy and set up start script
COPY --chown=nextjs:nodejs start.sh ./
RUN chmod +x start.sh

# Create .next directory and set permissions
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

# Set up cron job for log rotation
RUN echo "0 0 * * * /usr/bin/find /data/logs -type f -mtime +7 -delete" > /etc/crontabs/root

# Switch to non-root user
USER nextjs

# Set environment variables
ENV PATH="/home/nextjs/.local/bin:$PATH"
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV SCRIPTS_PATH="/data/scripts.json"
ENV PYTHON_PATH="/usr/bin/python3"
ENV LOGS_PATH="/data/logs"
ENV RUNS_LOGS_PATH="/data/logs/runs"

# Expose port
EXPOSE 3000

# Start the application using the start script
CMD ["/bin/bash", "-c", "set -e && ./start.sh"]

