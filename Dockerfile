# Build stage
FROM node:18.18.0-alpine AS builder

WORKDIR /app

# Install Python and build dependencies
RUN apk add --no-cache python3 py3-pip make g++

# Copy package files
COPY package*.json ./

# Install dependencies and update lock file
RUN npm install

# Copy source
COPY . .

# Create an empty scripts.json file for build process
RUN mkdir -p /data && echo '{"scripts":[]}' > /data/scripts.json

# Set environment variable for build
ENV SCRIPTS_PATH=/data/scripts.json

# Run TypeScript check
RUN npm run typecheck

# Build application
RUN npm run build

# Production stage
FROM node:18.18.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Install Python and other necessary tools
RUN apk add --no-cache python3 py3-pip

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /data && \
    chown nextjs:nodejs /data

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create data volume
VOLUME /data

# Copy scripts.json to the data directory
COPY --chown=nextjs:nodejs data/scripts.json /data/scripts.json

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV SCRIPTS_PATH "/data/scripts.json"
ENV PYTHON_PATH "/usr/bin/python3"

# Start the application
CMD ["node", "server.js"]

