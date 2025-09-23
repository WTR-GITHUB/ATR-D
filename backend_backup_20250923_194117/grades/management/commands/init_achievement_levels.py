# backend/grades/management/commands/init_achievement_levels.py

# Django management komanda pasiekimų lygių inicializavimui
# CHANGE: Sukurta komanda frontend logikos pasiekimų lygiams sukurti

from django.core.management.base import BaseCommand
from grades.models import AchievementLevel


class Command(BaseCommand):
    """
    Inicializuoja pasiekimų lygius pagal frontend logiką
    CHANGE: Sukuria S, B, P, A lygius su tinkamais procentų intervalais
    """
    help = 'Inicializuoja pasiekimų lygius pagal frontend logiką (S, B, P, A)'
    
    def handle(self, *args, **options):
        """Pagrindinė komandos logika"""
        self.stdout.write(
            self.style.SUCCESS('Pradėju pasiekimų lygių inicializavimą...')
        )
        
        # Frontend logikos pasiekimų lygiai
        achievement_levels = [
            {
                'code': 'S',
                'name': 'Slenkstinis',
                'min_percentage': 40,
                'max_percentage': 54,
                'color': 'žalias',
                'description': 'Slenkstinis pasiekimų lygis - mokinys pasiekia minimalius reikalavimus'
            },
            {
                'code': 'B',
                'name': 'Bazinis',
                'min_percentage': 55,
                'max_percentage': 69,
                'color': 'mėlynas',
                'description': 'Bazinis pasiekimų lygis - mokinys pasiekia pagrindinius reikalavimus'
            },
            {
                'code': 'P',
                'name': 'Pagrindinis',
                'min_percentage': 70,
                'max_percentage': 84,
                'color': 'oranžinis',
                'description': 'Pagrindinis pasiekimų lygis - mokinys pasiekia vidutinius reikalavimus'
            },
            {
                'code': 'A',
                'name': 'Aukštesnysis',
                'min_percentage': 85,
                'max_percentage': 100,
                'color': 'raudonas',
                'description': 'Aukštesnysis pasiekimų lygis - mokinys pasiekia aukščiausius reikalavimus'
            }
        ]
        
        created_count = 0
        updated_count = 0
        
        for level_data in achievement_levels:
            level, created = AchievementLevel.objects.update_or_create(
                code=level_data['code'],
                defaults={
                    'name': level_data['name'],
                    'min_percentage': level_data['min_percentage'],
                    'max_percentage': level_data['max_percentage'],
                    'color': level_data['color'],
                    'description': level_data['description']
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Sukurtas pasiekimų lygis: {level.code} - {level.name} '
                        f'({level.min_percentage}-{level.max_percentage}%)'
                    )
                )
                created_count += 1
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f'↻ Atnaujintas pasiekimų lygis: {level.code} - {level.name} '
                        f'({level.min_percentage}-{level.max_percentage}%)'
                    )
                )
                updated_count += 1
        
        # Patikriname, ar visi lygiai sukurti
        total_levels = AchievementLevel.objects.count()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎯 Pasiekimų lygių inicializavimas baigtas!'
            )
        )
        
        self.stdout.write(
            f'📊 Rezultatai:'
        )
        self.stdout.write(
            f'   • Sukurta: {created_count}'
        )
        self.stdout.write(
            f'   • Atnaujinta: {updated_count}'
        )
        self.stdout.write(
            f'   • Iš viso: {total_levels}'
        )
        
        # Rodome visus sukurtus lygius
        self.stdout.write(
            f'\n📋 Esami pasiekimų lygiai:'
        )
        
        for level in AchievementLevel.objects.all().order_by('min_percentage'):
            self.stdout.write(
                f'   • {level.code} ({level.color}): {level.name} - '
                f'{level.min_percentage}-{level.max_percentage}%'
            )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Pasiekimų lygiai sėkmingai inicializuoti pagal frontend logiką!'
            )
        )
