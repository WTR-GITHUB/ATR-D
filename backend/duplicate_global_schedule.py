#!/usr/bin/env python3
# /home/master/DIENYNAS/scripts/duplicate_global_schedule.py
# A-DIENYNAS GlobalSchedule Duplication Script
# CHANGE: Created script for duplicating GlobalSchedule records
# PURPOSE: Duplicate GlobalSchedule records with date offset and multiple copies
# UPDATES: Initial setup with interactive date selection and duplication logic

import os
import sys
import django
from datetime import datetime, timedelta
from typing import List, Tuple

# Load environment variables for venv FIRST
from dotenv import load_dotenv
load_dotenv('/home/master/DIENYNAS/.env')

# Override DATABASE_HOST for venv (use localhost instead of postgres)
os.environ['DATABASE_HOST'] = 'localhost'

# Django setup
sys.path.append('/home/master/DIENYNAS/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from schedule.models import GlobalSchedule
from django.db import transaction, connection

def get_date_input() -> List[str]:
    """Klausia vartotojo datų sąrašo"""
    print("📅 Įveskite datų sąrašą (formatas: YYYY-MM-DD, atskirtos kableliais):")
    print("Pavyzdys: 2025-09-08, 2025-09-09, 2025-09-10")
    print("Arba viena data: 2025-09-08")
    
    while True:
        dates_input = input("Datos: ").strip()
        if not dates_input:
            print("❌ Prašome įvesti datas")
            continue
            
        try:
            # Padalinti pagal kablelį ir pašalinti tarpus
            dates = [date.strip() for date in dates_input.split(',')]
            # Pašalinti tuščius elementus
            dates = [date for date in dates if date]
            
            if not dates:
                print("❌ Prašome įvesti datas")
                continue
                
            # Validuoti datų formatą
            for date_str in dates:
                datetime.strptime(date_str, '%Y-%m-%d')
            return dates
        except ValueError:
            print("❌ Neteisingas datų formatas. Naudokite YYYY-MM-DD formatą")

def get_days_offset() -> int:
    """Klausia dienų skaičiaus offset"""
    while True:
        try:
            days = int(input("📆 Kiek dienų pridėti prie datų? (pvz. 7): "))
            if days <= 0:
                print("❌ Dienų skaičius turi būti teigiamas")
                continue
            return days
        except ValueError:
            print("❌ Prašome įvesti skaičių")

def get_copy_count() -> int:
    """Klausia kopijų skaičiaus"""
    while True:
        try:
            copies = int(input("🔄 Kiek kartų kopijuoti? (pvz. 3): "))
            if copies <= 0:
                print("❌ Kopijų skaičius turi būti teigiamas")
                continue
            return copies
        except ValueError:
            print("❌ Prašome įvesti skaičių")

def find_schedules_by_dates(dates: List[str]) -> List[GlobalSchedule]:
    """Randa GlobalSchedule įrašus pagal datas"""
    from datetime import date
    
    date_objects = [date.fromisoformat(date_str) for date_str in dates]
    schedules = GlobalSchedule.objects.filter(date__in=date_objects)
    
    print(f"🔍 Rasta {schedules.count()} įrašų pagal nurodytas datas:")
    for schedule in schedules:
        print(f"  - {schedule.date} | {schedule.period} | {schedule.subject} | {schedule.user}")
    
    return list(schedules)

def fix_sequences_after_import():
    """
    Atnaujina PostgreSQL sekas po importavimo
    """
    print("\n🔧 Atnaujinamos PostgreSQL sekos po importavimo...")
    
    # Modelių sąrašas, kuriuos importavome
    models_to_fix = [
        'schedule_globalschedule'
    ]
    
    fixed_count = 0
    
    with connection.cursor() as cursor:
        for model in models_to_fix:
            try:
                # Gauna didžiausią ID lentelėje
                cursor.execute(f"SELECT MAX(id) FROM {model};")
                max_id_result = cursor.fetchone()
                max_id = max_id_result[0] if max_id_result[0] is not None else 0
                
                if max_id > 0:  # Tik jei yra duomenų
                    # Atnaujina seką
                    sequence_name = f"{model}_id_seq"
                    cursor.execute(f"SELECT setval('{sequence_name}', {max_id});")
                    print(f"✅ {model}: seka atnaujinta į {max_id}")
                    fixed_count += 1
                    
            except Exception as e:
                print(f"⚠️  {model}: Klaida atnaujinant seką - {str(e)}")
    
    if fixed_count > 0:
        print(f"🎉 Atnaujinta {fixed_count} sekų!")
    else:
        print("ℹ️  Sekų atnaujinimas nebuvo reikalingas")

def duplicate_schedules(schedules: List[GlobalSchedule], days_offset: int, copy_count: int) -> int:
    """Dublikuoja GlobalSchedule įrašus"""
    created_count = 0
    
    with transaction.atomic():
        for schedule in schedules:
            print(f"\n📋 Dublikuojamas: {schedule.date} | {schedule.period} | {schedule.subject}")
            
            for i in range(copy_count):
                # Skaičiuoti naują datą
                new_date = schedule.date + timedelta(days=days_offset * (i + 1))
                
                # Patikrinti ar jau egzistuoja
                if GlobalSchedule.objects.filter(
                    date=new_date,
                    period=schedule.period,
                    classroom=schedule.classroom
                ).exists():
                    print(f"  ⚠️  Įrašas jau egzistuoja: {new_date} | {schedule.period} | {schedule.classroom}")
                    continue
                
                # Sukurti dublikatą
                new_schedule = GlobalSchedule(
                    date=new_date,
                    weekday=None,  # Bus automatiškai apskaičiuota
                    period=schedule.period,
                    classroom=schedule.classroom,
                    subject=schedule.subject,
                    level=schedule.level,
                    user=schedule.user,
                    plan_status='planned',  # Default status
                    started_at=None,        # Null
                    completed_at=None      # Null
                )
                
                try:
                    new_schedule.full_clean()  # Validacija
                    new_schedule.save()
                    created_count += 1
                    print(f"  ✅ Sukurtas: {new_date} | {schedule.period} | {schedule.subject}")
                except Exception as e:
                    print(f"  ❌ Klaida: {e}")
    
    return created_count

def main():
    """Pagrindinė funkcija"""
    print("🎓 A-DIENYNAS GlobalSchedule Duplication Script")
    print("=" * 50)
    
    try:
        # 1. Gauti datų sąrašą
        dates = get_date_input()
        
        # 2. Rasti įrašus
        schedules = find_schedules_by_dates(dates)
        if not schedules:
            print("❌ Nerasta įrašų pagal nurodytas datas")
            return
        
        # 3. Gauti dienų offset
        days_offset = get_days_offset()
        
        # 4. Gauti kopijų skaičių
        copy_count = get_copy_count()
        
        # 5. Patvirtinti operaciją
        print(f"\n📋 Operacijos suvestinė:")
        print(f"  - Rasta įrašų: {len(schedules)}")
        print(f"  - Dienų offset: +{days_offset}")
        print(f"  - Kopijų skaičius: {copy_count}")
        print(f"  - Iš viso bus sukurtų: {len(schedules) * copy_count}")
        
        confirm = input("\n❓ Ar tęsti? (y/N): ").strip().lower()
        if confirm != 'y':
            print("❌ Operacija atšaukta")
            return
        
        # 6. Dublikuoti įrašus
        print("\n🔄 Dublikuojami įrašai...")
        created_count = duplicate_schedules(schedules, days_offset, copy_count)
        
        print(f"\n✅ Operacija baigta!")
        print(f"📊 Sukurta {created_count} naujų įrašų")
        
        # Atnaujina sekas po sėkmingo dubliavimo
        if created_count > 0:
            fix_sequences_after_import()
        
    except KeyboardInterrupt:
        print("\n❌ Operacija nutraukta vartotojo")
    except Exception as e:
        print(f"\n❌ Klaida: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
