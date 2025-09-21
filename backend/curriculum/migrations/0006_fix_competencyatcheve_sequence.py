# /backend/curriculum/migrations/0006_fix_competencyatcheve_sequence.py
from django.db import migrations

def fix_sequence(apps, schema_editor):
    """
    Ištaiso curriculum_competencyatcheve_id_seq seką
    Nustato seką į maksimalų ID arba 1, jei lentelė tuščia
    """
    if schema_editor.connection.vendor == 'postgresql':
        with schema_editor.connection.cursor() as cursor:
            # Patikrinti ar lentelė turi įrašų
            cursor.execute("SELECT COUNT(*) FROM curriculum_competencyatcheve;")
            count = cursor.fetchone()[0]
            
            if count > 0:
                cursor.execute("""
                    SELECT setval('curriculum_competencyatcheve_id_seq', 
                    COALESCE((SELECT MAX(id) FROM curriculum_competencyatcheve), 1));
                """)
            else:
                # Jei lentelė tuščia, nustatyti sequence į 1
                cursor.execute("""
                    SELECT setval('curriculum_competencyatcheve_id_seq', 1, false);
                """)

def reverse_fix_sequence(apps, schema_editor):
    """
    Reverse operacija paprastai nereikalinga sequence atvejais
    Sequence pataisymas yra atvirkščiai nekeičiamas
    """
    pass

class Migration(migrations.Migration):
    """
    Migracija ištaiso curriculum_competencyatcheve_id_seq sekos problemą
    Išspręs duplicate key constraint error kuriant CompetencyAtcheve
    """
    dependencies = [
        ('curriculum', '0005_lesson_deleted_at_lesson_is_deleted'),
    ]
    
    operations = [
        migrations.RunPython(fix_sequence, reverse_fix_sequence),
    ]
