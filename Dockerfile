# Smithery-specific Dockerfile for DinCoder MCP Server
FROM node:22-slim

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies based on lockfile
RUN if [ -f bun.lockb ]; then \
      bun install --no-cache; \
    elif [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then \
      yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    elif [ -f package.json ]; then \
      npm install; \
    fi

# Build the server using Smithery CLI
RUN npx -y @smithery/cli@latest build -o .smithery/index.cjs

# Create the run script
RUN echo '#!/bin/sh\nnode /app/.smithery/index.cjs' > /app/run.sh && \
    chmod +x /app/run.sh

# Set the entrypoint
ENTRYPOINT ["/app/run.sh"]