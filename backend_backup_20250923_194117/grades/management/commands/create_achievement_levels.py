# backend/grades/management/commands/create_achievement_levels.py

# Management command AchievementLevel duomenų sukūrimui
# CHANGE: Sukurtas naujas command'as pasiekimų lygių duomenų bazės užpildymui

from django.core.management.base import BaseCommand
from grades.models import AchievementLevel


class Command(BaseCommand):
    help = 'Sukuria pasiekimų lygius duomenų bazėje'

    def handle(self, *args, **options):
        """Sukuria pasiekimų lygius pagal frontend logiką"""
        
        # CHANGE: Pasiekimų lygiai pagal frontend GradeSelector komponento logiką
        achievement_levels_data = [
            {
                'code': 'S',
                'name': 'Slenkstinis',
                'min_percentage': 40,
                'max_percentage': 54,
                'color': 'green',
                'description': 'Slenkstinis pasiekimų lygis - minimalūs reikalavimai'
            },
            {
                'code': 'B', 
                'name': 'Bazinis',
                'min_percentage': 55,
                'max_percentage': 69,
                'color': 'blue',
                'description': 'Bazinis pasiekimų lygis - pagrindiniai reikalavimai'
            },
            {
                'code': 'P',
                'name': 'Pagrindinis', 
                'min_percentage': 70,
                'max_percentage': 84,
                'color': 'orange',
                'description': 'Pagrindinis pasiekimų lygis - geri pasiekimai'
            },
            {
                'code': 'A',
                'name': 'Aukštesnysis',
                'min_percentage': 85,
                'max_percentage': 100,
                'color': 'red',
                'description': 'Aukštesnysis pasiekimų lygis - puikūs pasiekimai'
            }
        ]
        
        created_count = 0
        updated_count = 0
        
        for level_data in achievement_levels_data:
            level, created = AchievementLevel.objects.get_or_create(
                code=level_data['code'],
                defaults=level_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Sukurtas pasiekimų lygis: {level.code} - {level.name}')
                )
            else:
                # CHANGE: Atnaujiname esamus įrašus jei duomenys pasikeitė
                updated = False
                for field, value in level_data.items():
                    if field != 'code' and getattr(level, field) != value:
                        setattr(level, field, value)
                        updated = True
                
                if updated:
                    level.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'🔄 Atnaujintas pasiekimų lygis: {level.code} - {level.name}')
                    )
                else:
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Pasiekimų lygis jau egzistuoja: {level.code} - {level.name}')
                    )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎯 Rezultatas:\n'
                f'   Sukurta: {created_count} pasiekimų lygių\n'
                f'   Atnaujinta: {updated_count} pasiekimų lygių\n'
                f'   Iš viso: {AchievementLevel.objects.count()} pasiekimų lygių duomenų bazėje'
            )
        )
