FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose HTTP port
EXPOSE 3000

# Start the HTTP server
CMD ["node", "dist/index.js"]