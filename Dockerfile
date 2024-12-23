# ... (previous content remains the same)

# Production stage
FROM node:18.18.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Install Python and other necessary tools, and set up paths properly
RUN apk add --no-cache python3 py3-pip jq make g++ dcron && \
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

# ... (rest of the Dockerfile remains the same)

# Set environment variables
ENV PATH="/home/nextjs/.local/bin:$PATH"
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV SCRIPTS_PATH="/data/scripts.json"
ENV PYTHON_PATH="/usr/bin/python3"
ENV LOGS_PATH="/data/logs"
ENV RUNS_LOGS_PATH="/data/logs/runs"

# ... (rest of the Dockerfile remains the same)

