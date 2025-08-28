#!/bin/bash
# /home/master/A-DIENYNAS/docker/backend/entrypoint.sh
# A-DIENYNAS Backend Entrypoint Script
# CHANGE: Created Backend entrypoint script for Django startup
# PURPOSE: Startup script for Django backend container
# UPDATES: Initial setup with health checks and migrations

set -e

echo "🚀 Starting A-DIENYNAS Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
while ! pg_isready -h postgres -U a_dienynas_user -d a_dienynas; do
    echo "Database not ready, waiting..."
    sleep 2
done

echo "✅ Database is ready!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis..."
while ! redis-cli -h redis -a $REDIS_PASSWORD ping; do
    echo "Redis not ready, waiting..."
    sleep 2
done

echo "✅ Redis is ready!"

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if not exists
echo "👤 Checking superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
"

# Start Gunicorn server
echo "🚀 Starting Gunicorn server..."
exec gunicorn --bind 0.0.0.0:8000 \
    --workers 4 \
    --worker-class gevent \
    --timeout 120 \
    --keep-alive 2 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --access-logfile /app/logs/gunicorn-access.log \
    --error-logfile /app/logs/gunicorn-error.log \
    --log-level info \
    a_dienynas.wsgi:application

