# /home/master/A-DIENYNAS/docker/backend/Dockerfile
# A-DIENYNAS Backend Dockerfile
# CHANGE: Created Backend Dockerfile for Django application
# PURPOSE: Container image for Django backend service
# UPDATES: Initial setup with Python 3.12 and all dependencies

FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    redis-tools \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Create necessary directories
RUN mkdir -p /app/static /app/media /app/logs

# Set permissions
RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
