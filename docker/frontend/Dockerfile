# /home/master/A-DIENYNAS/docker/frontend/Dockerfile
# A-DIENYNAS Frontend Dockerfile
# CHANGE: Fixed conditional build and start commands for proper Docker execution
# PURPOSE: Container image for Next.js frontend service
# UPDATES: Fixed CMD syntax and build process for both dev and production modes

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Copy package files
COPY frontend/package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy frontend code
COPY frontend/ .

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 3000

# Build for production with standard NODE_ENV
ENV NODE_ENV=production

# Start production server (build will be done at runtime due to volume mounts)
CMD ["sh", "-c", "npm run build && npm run start"]
