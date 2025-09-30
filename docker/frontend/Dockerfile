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

# Build for production with NODE_ENV set by docker-compose.yml
ARG NODE_ENV=production
ARG NEXT_PUBLIC_API_URL=/api
ENV NODE_ENV=$NODE_ENV
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the application during image creation (not at runtime)
RUN npm run build

# Copy static files and public files to standalone directory for proper serving
RUN cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/

# Start production server (no build at runtime)
CMD ["sh", "-c", "cd .next/standalone && PORT=3000 HOSTNAME=0.0.0.0 node server.js"]
