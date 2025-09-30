#!/bin/bash

# /var/www/ATR-D/backend/entrypoint.sh
# A-DIENYNAS Backend Entrypoint Script
# CHANGE: Created entrypoint script for Django backend
# PURPOSE: Initialize and start Django application
# UPDATES: Removed hardcoded superuser creation for security

set -e

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "Database is ready!"

# Wait for Redis to be ready
echo "Waiting for Redis..."
while ! nc -z redis 6379; do
  sleep 1
done
echo "Redis is ready!"

# Run database migrations
echo "Running database migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Superuser creation removed for security reasons
# Use: python manage.py createsuperuser
echo "Superuser creation skipped - use 'python manage.py createsuperuser' manually"

# Start Django application with Gunicorn
echo "Starting Django application with Gunicorn..."

# Choose startup mode based on environment
if [ "$DJANGO_DEBUG" = "True" ] || [ "$DEBUG" = "True" ]; then
    echo "Starting in development mode..."
    exec python manage.py runserver 0.0.0.0:8000
else
    echo "Starting in production mode with Gunicorn..."
    exec gunicorn core.wsgi:application \
        --config /app/gunicorn.conf.py \
        --log-file=-
fi
