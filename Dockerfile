FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json tsconfig.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

FROM node:22-alpine AS release
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/smithery.yaml ./

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV TRANSPORT_MODE=stateless
ENV MCP_TRANSPORT="streamable-http"
ENV MCP_HOST="0.0.0.0"

# Install only production dependencies
RUN npm ci --omit=dev

# Set the user to non-root
USER node

# Expose the port
EXPOSE 3000

# Run the HTTP server directly
ENTRYPOINT ["node", "dist/index.js"]