#!/bin/bash

# /home/master/DIENYNAS/backend/entrypoint.sh
# A-DIENYNAS Backend Entrypoint Script
# CHANGE: Created entrypoint script for Django backend
# PURPOSE: Initialize and start Django application
# UPDATES: Initial setup with database migrations and static files

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

# Create superuser if it doesn't exist
echo "Checking for superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@example.com').exists():
    User.objects.create_superuser(
        email='admin@example.com',
        password='admin123',
        first_name='Admin',
        last_name='User',
        roles=[User.Role.MANAGER]
    )
    print('Superuser created: admin@example.com / admin123')
    print('Name: Admin User, Role: Manager')
else:
    print('Superuser already exists')
"

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
