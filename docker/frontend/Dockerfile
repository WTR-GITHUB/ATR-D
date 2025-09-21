# /home/master/A-DIENYNAS/docker/frontend/Dockerfile
# A-DIENYNAS Frontend Dockerfile
# CHANGE: Fixed conditional build and start commands for proper Docker execution
# PURPOSE: Container image for Next.js frontend service
# UPDATES: Fixed CMD syntax and build process for both dev and production modes

FROM node:24.8.0-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Copy package files
COPY frontend/package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm install

# Copy frontend code
COPY frontend/ .

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 3000

# Build for development with NODE_ENV set by docker-compose.yml
# ENV NODE_ENV=development  # Set by docker-compose.yml environment

# Start development server with hot reload
CMD ["npm", "run", "dev"]
