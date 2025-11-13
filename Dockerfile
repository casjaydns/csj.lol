# Use Node.js 18 alpine image for smaller size
FROM node:18-alpine

# Install bash and curl for healthcheck and debugging
RUN apk add --no-cache bash curl

# Environment variables with defaults
ENV PORT=2550 \
    URLHOST="localhost" \
    NODE_ENV="production" \
    MONGODB_URI="mongodb://localhost:27017/url" \
    PROJECT_NAME="shrtnr" \
    PROJECT_REPO="https://github.com/casjaydns/shrtnr"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs && \
    chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser

# Build CSS during image build
RUN npm run build-css || echo "CSS build failed, continuing..."

# Expose the port the app runs on (configurable via PORT env var)
EXPOSE ${PORT}

# Health check using curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/docs || exit 1

# Start the application with bash
CMD ["/bin/bash", "-c", "npm start"]