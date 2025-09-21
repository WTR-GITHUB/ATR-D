# /backend/curriculum/management/commands/fix_sequences.py
from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    """
    Django management komanda PostgreSQL sekų atnaujinimui
    Naudojama po duomenų importavimo
    """
    help = 'Fix PostgreSQL sequences after data import'

    def add_arguments(self, parser):
        """
        Prideda komandos argumentus
        """
        parser.add_argument(
            '--check',
            action='store_true',
            help='Tikrinti sekų statusą be jų keitimo',
        )
        parser.add_argument(
            '--models',
            nargs='+',
            help='Specifiniai modelių pavadinimai (be curriculum_ prefikso)',
            default=None
        )

    def handle(self, *args, **options):
        """
        Pagrindinė komandos logika
        """
        if options['check']:
            self.check_sequences_status(options['models'])
        else:
            self.fix_all_sequences(options['models'])

    def get_models_list(self, specific_models=None):
        """
        Grąžina modelių sąrašą
        """
        all_models = [
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
        
        if specific_models:
            # Prideda curriculum_ prefiksą jei jo nėra
            return [f"curriculum_{model}" if not model.startswith('curriculum_') else model 
                   for model in specific_models]
        
        return all_models

    def fix_all_sequences(self, specific_models=None):
        """
        Atnaujina visas PostgreSQL sekas
        """
        models = self.get_models_list(specific_models)
        
        self.stdout.write("🔧 Pradedamas PostgreSQL sekų atnaujinimas...")
        self.stdout.write("=" * 60)
        
        fixed_count = 0
        error_count = 0
        
        with connection.cursor() as cursor:
            for model in models:
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
                        self.stdout.write(
                            self.style.WARNING(f"⚠️  Lentelė {model} neegzistuoja - praleidžiama")
                        )
                        continue
                    
                    # Gauna didžiausią ID lentelėje
                    cursor.execute(f"SELECT MAX(id) FROM {model};")
                    max_id_result = cursor.fetchone()
                    max_id = max_id_result[0] if max_id_result[0] is not None else 0
                    
                    # Gauna dabartinę sekos reikšmę
                    sequence_name = f"{model}_id_seq"
                    try:
                        cursor.execute(f"SELECT currval('{sequence_name}');")
                        current_seq = cursor.fetchone()[0]
                    except Exception:
                        # Jei seka nėra inicializuota, naudojame nextval()
                        cursor.execute(f"SELECT nextval('{sequence_name}');")
                        current_seq = cursor.fetchone()[0]
                    
                    # Atnaujina seką jei reikia
                    if current_seq < max_id:
                        cursor.execute(f"SELECT setval('{sequence_name}', {max_id});")
                        self.stdout.write(f"✅ {model}: {current_seq} → {max_id}")
                        fixed_count += 1
                    else:
                        self.stdout.write(f"✅ {model}: seka jau sinchronizuota ({current_seq})")
                        
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"❌ {model}: Klaida - {str(e)}")
                    )
                    error_count += 1
        
        self.stdout.write("=" * 60)
        self.stdout.write(f"📊 Rezultatai:")
        self.stdout.write(f"   Atnaujinta sekų: {fixed_count}")
        self.stdout.write(f"   Klaidų: {error_count}")
        self.stdout.write(f"   Iš viso modelių: {len(models)}")
        
        if error_count == 0:
            self.stdout.write(
                self.style.SUCCESS("🎉 Visos sekos sėkmingai atnaujintos!")
            )
        else:
            self.stdout.write(
                self.style.WARNING(f"⚠️  Buvo {error_count} klaidų. Patikrinkite žurnalo įrašus.")
            )

    def check_sequences_status(self, specific_models=None):
        """
        Tikrina sekų statusą be jų keitimo
        """
        models = self.get_models_list(specific_models)
        
        self.stdout.write("🔍 Tikrinamas sekų statusas...")
        self.stdout.write("=" * 60)
        
        with connection.cursor() as cursor:
            for model in models:
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
                        self.stdout.write(f"⚠️  {model}: Lentelė neegzistuoja")
                        continue
                    
                    # Gauna didžiausią ID lentelėje
                    cursor.execute(f"SELECT MAX(id) FROM {model};")
                    max_id_result = cursor.fetchone()
                    max_id = max_id_result[0] if max_id_result[0] is not None else 0
                    
                    # Gauna dabartinę sekos reikšmę
                    sequence_name = f"{model}_id_seq"
                    try:
                        cursor.execute(f"SELECT currval('{sequence_name}');")
                        current_seq = cursor.fetchone()[0]
                    except Exception:
                        # Jei seka nėra inicializuota, naudojame nextval()
                        cursor.execute(f"SELECT nextval('{sequence_name}');")
                        current_seq = cursor.fetchone()[0]
                    
                    status = "✅ OK" if current_seq >= max_id else "❌ NEATNAUJINTA"
                    self.stdout.write(f"{status} {model}: MAX_ID={max_id}, SEQ={current_seq}")
                        
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"❌ {model}: Klaida - {str(e)}")
                    )
