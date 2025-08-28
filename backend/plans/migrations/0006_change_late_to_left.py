# Generated manually to change 'late' to 'left' in attendance status

from django.db import migrations

def change_late_to_left(apps, schema_editor):
    """
    Pakeisti esamus 'late' lankomumo statusus į 'left'
    """
    IMUPlan = apps.get_model('plans', 'IMUPlan')
    
    # Pakeisti visus 'late' įrašus į 'left'
    IMUPlan.objects.filter(attendance_status='late').update(attendance_status='left')

def reverse_change_late_to_left(apps, schema_editor):
    """
    Grąžinti 'left' įrašus atgal į 'late' (jei reikia atšaukti)
    """
    IMUPlan = apps.get_model('plans', 'IMUPlan')
    
    # Pakeisti visus 'left' įrašus atgal į 'late'
    IMUPlan.objects.filter(attendance_status='left').update(attendance_status='late')

class Migration(migrations.Migration):

    dependencies = [
        ('plans', '0005_alter_imuplan_attendance_status_and_more'),
    ]

    operations = [
        migrations.RunPython(change_late_to_left, reverse_change_late_to_left),
    ]
