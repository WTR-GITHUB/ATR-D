#!/bin/bash
# /var/www/ATR-D/scripts/setup-oauth.sh
# Google OAuth setup script for production deployment
# Purpose: Automatically configure Google OAuth after deployment
# Updates: Sets up SocialApp and Site configuration
# Never delete old notes: This script ensures OAuth works after each deployment

set -e

echo "🔧 Setting up Google OAuth configuration..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

echo "✅ Found .env file"

# Check if Google OAuth credentials are set
if ! grep -q "GOOGLE_OAUTH_CLIENT_ID" .env || ! grep -q "GOOGLE_OAUTH_CLIENT_SECRET" .env; then
    echo "❌ Error: Google OAuth credentials not found in .env file"
    echo "Please add:"
    echo "GOOGLE_OAUTH_CLIENT_ID=your_client_id"
    echo "GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret"
    exit 1
fi

echo "✅ Found Google OAuth credentials in .env"

# Run Django management command to setup OAuth
echo "🚀 Running OAuth setup command..."
docker-compose exec backend python manage.py setup_oauth

# Run migrations to update site domain
echo "🚀 Running site migrations..."
docker-compose exec backend python manage.py migrate sites

# Restart services to apply changes
echo "🔄 Restarting services..."
docker-compose restart nginx backend

echo "✅ OAuth setup completed successfully!"
echo ""
echo "🧪 Test OAuth by visiting:"
echo "   https://dienynas.mokyklaatradimai.lt/accounts/google/login/"
echo ""
echo "📋 OAuth URLs configured:"
echo "   Login: https://dienynas.mokyklaatradimai.lt/accounts/google/login/"
echo "   Callback: https://dienynas.mokyklaatradimai.lt/accounts/google/login/callback/"
