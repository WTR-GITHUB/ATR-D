#!/usr/bin/env python3
# /home/master/DIENYNAS/scripts/fix_sequences.py
# Vienkartinis skriptas PostgreSQL sekų atnaujinimui po duomenų importavimo
# Naudoja Docker container'į su Django aplinka

import os
import sys
import django
from django.db import connection

# Load environment variables for venv FIRST
from dotenv import load_dotenv
load_dotenv('/home/master/DIENYNAS/.env')

# Override DATABASE_HOST for venv (use localhost instead of postgres)
os.environ['DATABASE_HOST'] = 'localhost'

# Django setup
sys.path.append('/home/master/DIENYNAS/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

class SequenceFixer:
    """
    PostgreSQL sekų atnaujinimo klasė
    """
    
    def __init__(self):
        """
        Inicializuoja sekų atnaujinimo klasę
        """
        self.models = [
            'curriculum_skill',
            'curriculum_competencyatcheve', 
            'curriculum_lesson',
            'curriculum_subject',
            'curriculum_level',
            'curriculum_virtue',
            'curriculum_competency',
            'curriculum_objective',
            'curriculum_component'
        ]
        
    def fix_all_sequences(self):
        """
        Atnaujina visas PostgreSQL sekas
        """
        print("🔧 Pradedamas PostgreSQL sekų atnaujinimas...")
        print("=" * 60)
        
        fixed_count = 0
        error_count = 0
        
        with connection.cursor() as cursor:
            for model in self.models:
                try:
                    # Tikrina ar lentelė egzistuoja
                    cursor.execute("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = 'public' 
                            AND table_name = %s
                        );
                    """, [model])
                    
                    if not cursor.fetchone()[0]:
                        print(f"⚠️  Lentelė {model} neegzistuoja - praleidžiama")
                        continue
                    
                    # Gauna didžiausią ID lentelėje
                    cursor.execute(f"SELECT MAX(id) FROM {model};")
                    max_id_result = cursor.fetchone()
                    max_id = max_id_result[0] if max_id_result[0] is not None else 0
                    
                    # Gauna dabartinę sekos reikšmę
                    sequence_name = f"{model}_id_seq"
                    cursor.execute(f"SELECT currval('{sequence_name}');")
                    current_seq = cursor.fetchone()[0]
                    
                    # Atnaujina seką jei reikia
                    if current_seq < max_id:
                        cursor.execute(f"SELECT setval('{sequence_name}', {max_id});")
                        print(f"✅ {model}: {current_seq} → {max_id}")
                        fixed_count += 1
                    else:
                        print(f"✅ {model}: seka jau sinchronizuota ({current_seq})")
                        
                except Exception as e:
                    print(f"❌ {model}: Klaida - {str(e)}")
                    error_count += 1
        
        print("=" * 60)
        print(f"📊 Rezultatai:")
        print(f"   Atnaujinta sekų: {fixed_count}")
        print(f"   Klaidų: {error_count}")
        print(f"   Iš viso modelių: {len(self.models)}")
        
        if error_count == 0:
            print("🎉 Visos sekos sėkmingai atnaujintos!")
        else:
            print(f"⚠️  Buvo {error_count} klaidų. Patikrinkite žurnalo įrašus.")
    
    def check_sequences_status(self):
        """
        Tikrina sekų statusą be jų keitimo
        """
        print("🔍 Tikrinamas sekų statusas...")
        print("=" * 60)
        
        with connection.cursor() as cursor:
            for model in self.models:
                try:
                    # Tikrina ar lentelė egzistuoja
                    cursor.execute("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = 'public' 
                            AND table_name = %s
                        );
                    """, [model])
                    
                    if not cursor.fetchone()[0]:
                        print(f"⚠️  {model}: Lentelė neegzistuoja")
                        continue
                    
                    # Gauna didžiausią ID lentelėje
                    cursor.execute(f"SELECT MAX(id) FROM {model};")
                    max_id_result = cursor.fetchone()
                    max_id = max_id_result[0] if max_id_result[0] is not None else 0
                    
                    # Gauna dabartinę sekos reikšmę
                    sequence_name = f"{model}_id_seq"
                    cursor.execute(f"SELECT currval('{sequence_name}');")
                    current_seq = cursor.fetchone()[0]
                    
                    status = "✅ OK" if current_seq >= max_id else "❌ NEATNAUJINTA"
                    print(f"{status} {model}: MAX_ID={max_id}, SEQ={current_seq}")
                        
                except Exception as e:
                    print(f"❌ {model}: Klaida - {str(e)}")

def main():
    """
    Pagrindinė funkcija
    """
    print("🚀 A-DIENYNAS PostgreSQL sekų atnaujinimo skriptas")
    print("=" * 60)
    
    fixer = SequenceFixer()
    
    # Tikrina ar yra argumentų
    if len(sys.argv) > 1 and sys.argv[1] == '--check':
        fixer.check_sequences_status()
    else:
        # Klausia patvirtinimo
        response = input("Ar tikrai norite atnaujinti visas PostgreSQL sekas? (y/N): ")
        if response.lower() in ['y', 'yes', 'taip']:
            fixer.fix_all_sequences()
        else:
            print("❌ Operacija atšaukta")

if __name__ == "__main__":
    main()
