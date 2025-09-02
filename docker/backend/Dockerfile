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
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY ./backend /app

# Create necessary directories
RUN mkdir -p /app/static /app/media /app/logs

# Expose port
EXPOSE 8000

# Copy entrypoint script
COPY ./backend/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Start command
ENTRYPOINT ["/app/entrypoint.sh"]
