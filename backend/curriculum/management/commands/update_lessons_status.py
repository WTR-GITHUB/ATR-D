# backend/curriculum/management/commands/update_lessons_status.py

from django.core.management.base import BaseCommand
from curriculum.models import Lesson


class Command(BaseCommand):
    help = 'Atnaujina visas esamas pamokas, kad jos neturėtų is_deleted=True statuso'

    def handle(self, *args, **options):
        try:
            # Gauname visas pamokas
            all_lessons = Lesson.objects.all()
            total_lessons = all_lessons.count()
            
            self.stdout.write(f"Rasta {total_lessons} pamokų duomenų bazėje")
            
            # Atnaujiname visas pamokas, kad jos neturėtų is_deleted=True
            updated_count = all_lessons.update(
                is_deleted=False,
                deleted_at=None
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Sėkmingai atnaujinta {updated_count} pamokų. '
                    f'Visos pamokos dabar turi is_deleted=False statusą.'
                )
            )
            
            # Patikriname rezultatą
            active_lessons = Lesson.objects.filter(is_deleted=False).count()
            deleted_lessons = Lesson.objects.filter(is_deleted=True).count()
            
            self.stdout.write(f"Po atnaujinimo:")
            self.stdout.write(f"  - Aktyvios pamokos: {active_lessons}")
            self.stdout.write(f"  - Ištrintos pamokos: {deleted_lessons}")
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Klaida atnaujinant pamokas: {e}')
            )
