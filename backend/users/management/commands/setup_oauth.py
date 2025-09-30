# /var/www/ATR-D/backend/users/management/commands/setup_oauth.py
"""
Django management command to setup Google OAuth configuration.

Purpose: Automatically configure Google OAuth SocialApp and Site settings
Updates: Creates Google SocialApp and updates Site domain for production
Never delete old notes: This command ensures OAuth works after deployment
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
import os


class Command(BaseCommand):
    help = 'Setup Google OAuth configuration (SocialApp and Site)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--domain',
            type=str,
            default='dienynas.mokyklaatradimai.lt',
            help='Domain name for the site (default: dienynas.mokyklaatradimai.lt)'
        )
        parser.add_argument(
            '--site-name',
            type=str,
            default='ATR-DIENYNAS',
            help='Site name (default: ATR-DIENYNAS)'
        )

    def handle(self, *args, **options):
        domain = options['domain']
        site_name = options['site_name']
        
        self.stdout.write(
            self.style.SUCCESS(f'🔧 Setting up OAuth for domain: {domain}')
        )
        
        try:
            # Get Google OAuth credentials from environment
            client_id = os.getenv('GOOGLE_OAUTH_CLIENT_ID')
            client_secret = os.getenv('GOOGLE_OAUTH_CLIENT_SECRET')
            
            if not client_id or not client_secret:
                raise CommandError(
                    '❌ Google OAuth credentials not found in environment variables!\n'
                    'Please set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET'
                )
            
            self.stdout.write(f'✅ Found Google OAuth credentials')
            
            # Update or create Site
            site, created = Site.objects.get_or_create(
                id=1,
                defaults={'domain': domain, 'name': site_name}
            )
            
            if not created:
                site.domain = domain
                site.name = site_name
                site.save()
                self.stdout.write(f'✅ Updated Site: {site.domain} -> {site.name}')
            else:
                self.stdout.write(f'✅ Created Site: {site.domain} -> {site.name}')
            
            # Create or update Google SocialApp
            google_app, created = SocialApp.objects.get_or_create(
                provider='google',
                defaults={
                    'name': 'Google OAuth',
                    'client_id': client_id,
                    'secret': client_secret
                }
            )
            
            if not created:
                google_app.client_id = client_id
                google_app.secret = client_secret
                google_app.save()
                self.stdout.write(f'✅ Updated Google SocialApp: {google_app.name}')
            else:
                self.stdout.write(f'✅ Created Google SocialApp: {google_app.name}')
            
            # Link SocialApp to Site
            google_app.sites.add(site)
            self.stdout.write(f'✅ Linked Google SocialApp to site: {site.domain}')
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n🎉 OAuth setup completed successfully!\n'
                    f'   Domain: {domain}\n'
                    f'   Site: {site_name}\n'
                    f'   Google App: {google_app.name}'
                )
            )
            
        except Exception as e:
            raise CommandError(f'❌ Error setting up OAuth: {str(e)}')
