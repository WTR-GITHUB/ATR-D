# backend/plans/migrations/0003_migrate_status_data.py
# Generated manually for IMUPlan status refactoring

from django.db import migrations


def migrate_status_data(apps, schema_editor):
    """
    Migruoja duomenis iš seno status stulpelio į naujus plan_status ir attendance_status stulpelius
    
    Logika:
    - Jei status yra planų valdymo statusas ('planned', 'in_progress', 'completed') → plan_status
    - Jei status yra lankomumo statusas ('present', 'absent', 'late', 'excused') → attendance_status
    - Default reikšmės: plan_status='planned', attendance_status='present'
    """
    IMUPlan = apps.get_model('plans', 'IMUPlan')
    
    # Planų valdymo statusai
    plan_statuses = ['planned', 'in_progress', 'completed']
    
    # Lankomumo statusai  
    attendance_statuses = ['present', 'absent', 'late', 'excused']
    
    # Atnaujiname visus IMUPlan įrašus
    for plan in IMUPlan.objects.all():
        current_status = plan.status
        
        if current_status in plan_statuses:
            # Jei statusas yra planų valdymo statusas
            plan.plan_status = current_status
            plan.attendance_status = 'present'  # Default: mokinys dalyvavo
        elif current_status in attendance_statuses:
            # Jei statusas yra lankomumo statusas
            plan.attendance_status = current_status
            plan.plan_status = 'planned'  # Default: planas suplanuotas
        else:
            # Fallback: nežinomas statusas
            plan.plan_status = 'planned'
            plan.attendance_status = 'present'
        
        plan.save()


def reverse_migrate_status_data(apps, schema_editor):
    """
    Atstatome duomenis atgal į seną status stulpelį
    """
    IMUPlan = apps.get_model('plans', 'IMUPlan')
    
    for plan in IMUPlan.objects.all():
        # Grąžiname plan_status kaip pagrindinį statusą
        plan.status = plan.plan_status
        plan.save()


class Migration(migrations.Migration):

    dependencies = [
        ('plans', '0002_refactor_imuplan_status_separation'),
    ]

    operations = [
        migrations.RunPython(
            migrate_status_data,
            reverse_migrate_status_data,
        ),
    ]
