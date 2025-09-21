#!/usr/bin/env python3
# /home/master/DIENYNAS/scripts/evaluate_lessons.py
# Skriptas pamokų JSON duomenų tikrinimui prieš įkėlimą į duomenų bazę
# Patikrina duomenų tipus, foreign key ryšius, JSON standartus ir auto-increment ID

import os
import sys
import json
import django
from django.db import transaction
from django.core.exceptions import ValidationError

# Load environment variables for venv FIRST
from dotenv import load_dotenv
load_dotenv('/home/master/DIENYNAS/.env')

# Override DATABASE_HOST for venv (use localhost instead of postgres)
os.environ['DATABASE_HOST'] = 'localhost'

# Django setup
sys.path.append('/home/master/DIENYNAS/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from curriculum.models import Lesson, Skill, CompetencyAtcheve, Subject, Level, Virtue, Competency
from users.models import User
from django.db import connection

class LessonEvaluator:
    def __init__(self, json_file_path, update_file=False):
        """
        Inicializuoja pamokų duomenų tikrinimo klasę
        
        Args:
            json_file_path: Kelias iki JSON failo su pamokų duomenimis
            update_file: Ar atnaujinti failą su tikrais ID
        """
        self.json_file_path = json_file_path
        self.update_file = update_file
        self.errors = []
        self.warnings = []
        self.suggestions = []
        self.valid_lessons = 0
        self.total_lessons = 0
        self.auto_skill_mapping = {}  # AUTO_X -> tikras ID
        self.auto_competency_mapping = {}  # AUTO_X -> tikras ID
        self.created_skills = []
        self.created_competencies = []
        
    def fix_sequences_after_import(self):
        """
        Atnaujina PostgreSQL sekas po importavimo
        """
        print("\n🔧 Atnaujinamos PostgreSQL sekos po importavimo...")
        
        # Modelių sąrašas, kuriuos importavome
        models_to_fix = [
            'curriculum_skill',
            'curriculum_competencyatcheve', 
            'curriculum_lesson'
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
        
    def load_json_data(self):
        """Nuskaito JSON failą su pamokų duomenimis"""
        try:
            with open(self.json_file_path, 'r', encoding='utf-8') as file:
                return json.load(file)
        except FileNotFoundError:
            self.errors.append(f"Failas {self.json_file_path} nerastas")
            return None
        except json.JSONDecodeError as e:
            self.errors.append(f"Netinkamas JSON formatas - {e}")
            return None
    
    def validate_data_types(self, lesson_data, lesson_index):
        """
        Tikrina duomenų tipus pagal template reikalavimus
        
        Args:
            lesson_data: Pamokos duomenys
            lesson_index: Pamokos numeris (indeksas)
        """
        lesson_prefix = f"Pamoka {lesson_index + 1}"
        
        # Tikrinti privalomus laukus
        required_fields = {
            'title': str,
            'subject': int
        }
        
        for field, expected_type in required_fields.items():
            if field not in lesson_data:
                self.errors.append(f"{lesson_prefix}: Trūksta privalomo lauko '{field}'")
            elif not isinstance(lesson_data[field], expected_type):
                self.errors.append(f"{lesson_prefix}: Laukas '{field}' turi būti {expected_type.__name__}, gautas {type(lesson_data[field]).__name__}")
        
        # Tikrinti optional laukus su tipais
        optional_fields = {
            'levels': list,
            'mentor': (int, type(None)),
            'content': str,
            'topic': str,
            'objectives': str,
            'components': str,
            'focus': str,
            'slenkstinis': str,
            'bazinis': str,
            'pagrindinis': str,
            'aukstesnysis': str,
            'skills': list,
            'virtues': list,
            'competency_atcheves': list
        }
        
        for field, expected_type in optional_fields.items():
            if field in lesson_data:
                if isinstance(expected_type, tuple):
                    if not isinstance(lesson_data[field], expected_type):
                        self.errors.append(f"{lesson_prefix}: Laukas '{field}' turi būti {expected_type[0].__name__} arba None, gautas {type(lesson_data[field]).__name__}")
                elif not isinstance(lesson_data[field], expected_type):
                    self.errors.append(f"{lesson_prefix}: Laukas '{field}' turi būti {expected_type.__name__}, gautas {type(lesson_data[field]).__name__}")
    
    def validate_json_fields(self, lesson_data, lesson_index):
        """
        Tikrina JSON laukus (objectives, components, focus)
        
        Args:
            lesson_data: Pamokos duomenys
            lesson_index: Pamokos numeris
        """
        lesson_prefix = f"Pamoka {lesson_index + 1}"
        json_fields = ['objectives', 'components', 'focus']
        
        for field in json_fields:
            if field in lesson_data and lesson_data[field]:
                try:
                    # Bandyti parsinti JSON string
                    parsed = json.loads(lesson_data[field])
                    if not isinstance(parsed, list):
                        self.errors.append(f"{lesson_prefix}: Laukas '{field}' turi būti JSON array, gautas {type(parsed).__name__}")
                except json.JSONDecodeError as e:
                    self.errors.append(f"{lesson_prefix}: Netinkamas JSON formatas lauke '{field}' - {e}")
    
    def validate_foreign_keys(self, lesson_data, lesson_index):
        """
        Tikrina foreign key ryšius su duomenų baze
        
        Args:
            lesson_data: Pamokos duomenys
            lesson_index: Pamokos numeris
        """
        lesson_prefix = f"Pamoka {lesson_index + 1}"
        
        # Tikrinti subject
        if 'subject' in lesson_data:
            try:
                Subject.objects.get(id=lesson_data['subject'])
            except Subject.DoesNotExist:
                self.errors.append(f"{lesson_prefix}: Subject su ID {lesson_data['subject']} neegzistuoja duomenų bazėje")
        
        # Tikrinti mentor
        if 'mentor' in lesson_data and lesson_data['mentor'] is not None:
            try:
                User.objects.get(id=lesson_data['mentor'])
            except User.DoesNotExist:
                self.errors.append(f"{lesson_prefix}: Mentor su ID {lesson_data['mentor']} neegzistuoja duomenų bazėje")
        
        # Tikrinti levels
        if 'levels' in lesson_data:
            for level_id in lesson_data['levels']:
                try:
                    Level.objects.get(id=level_id)
                except Level.DoesNotExist:
                    self.errors.append(f"{lesson_prefix}: Level su ID {level_id} neegzistuoja duomenų bazėje")
        
        # Tikrinti virtues
        if 'virtues' in lesson_data:
            for virtue_id in lesson_data['virtues']:
                try:
                    Virtue.objects.get(id=virtue_id)
                except Virtue.DoesNotExist:
                    self.errors.append(f"{lesson_prefix}: Virtue su ID {virtue_id} neegzistuoja duomenų bazėje")
    
    def validate_skills_and_competencies(self, lesson_data, lesson_index, new_skills_data, new_competencies_data):
        """
        Tikrina skills ir competency_atcheves (egzistuojančius ir naujus)
        
        Args:
            lesson_data: Pamokos duomenys
            lesson_index: Pamokos numeris
            new_skills_data: Naujų skills duomenys
            new_competencies_data: Naujų competencies duomenys
        """
        lesson_prefix = f"Pamoka {lesson_index + 1}"
        
        # Tikrinti skills
        if 'skills' in lesson_data:
            for skill_id in lesson_data['skills']:
                if isinstance(skill_id, str) and skill_id.startswith('AUTO_'):
                    # Tikrinti ar yra naujo skill duomenys
                    if skill_id not in new_skills_data:
                        self.errors.append(f"{lesson_prefix}: Nerastas naujo skill duomenys '{skill_id}'")
                    else:
                        # Tikrinti naujo skill duomenis
                        self.validate_new_skill_data(skill_id, new_skills_data[skill_id], lesson_prefix)
                else:
                    # Tikrinti ar egzistuoja skill duomenų bazėje
                    try:
                        Skill.objects.get(id=skill_id)
                    except Skill.DoesNotExist:
                        self.errors.append(f"{lesson_prefix}: Skill su ID {skill_id} neegzistuoja duomenų bazėje")
        
        # Tikrinti competency_atcheves
        if 'competency_atcheves' in lesson_data:
            for comp_id in lesson_data['competency_atcheves']:
                if isinstance(comp_id, str) and comp_id.startswith('AUTO_'):
                    # Tikrinti ar yra naujo competency duomenys
                    if comp_id not in new_competencies_data:
                        self.errors.append(f"{lesson_prefix}: Nerastas naujo competency_atcheve duomenys '{comp_id}'")
                    else:
                        # Tikrinti naujo competency duomenis
                        self.validate_new_competency_data(comp_id, new_competencies_data[comp_id], lesson_prefix)
                else:
                    # Tikrinti ar egzistuoja competency_atcheve duomenų bazėje
                    try:
                        CompetencyAtcheve.objects.get(id=comp_id)
                    except CompetencyAtcheve.DoesNotExist:
                        self.errors.append(f"{lesson_prefix}: CompetencyAtcheve su ID {comp_id} neegzistuoja duomenų bazėje")
    
    def validate_new_skill_data(self, auto_key, skill_data, lesson_prefix):
        """
        Tikrina naujo skill duomenis
        
        Args:
            auto_key: AUTO_X raktas
            skill_data: Skill duomenys
            lesson_prefix: Pamokos prefiksas klaidoms
        """
        required_fields = ['code', 'name', 'subject']
        for field in required_fields:
            if field not in skill_data:
                self.errors.append(f"{lesson_prefix}: Naujame skill '{auto_key}' trūksta lauko '{field}'")
        
        # Tikrinti ar skill su tokiu code jau egzistuoja
        if 'code' in skill_data:
            existing_skill = Skill.objects.filter(code=skill_data['code']).first()
            if existing_skill:
                self.warnings.append(f"{lesson_prefix}: Skill su code '{skill_data['code']}' jau egzistuoja (ID: {existing_skill.id})")
        
        # Tikrinti subject
        if 'subject' in skill_data:
            try:
                Subject.objects.get(id=skill_data['subject'])
            except Subject.DoesNotExist:
                self.errors.append(f"{lesson_prefix}: Naujame skill '{auto_key}' subject su ID {skill_data['subject']} neegzistuoja")
    
    def validate_new_competency_data(self, auto_key, comp_data, lesson_prefix):
        """
        Tikrina naujo competency_atcheve duomenis
        
        Args:
            auto_key: AUTO_X raktas
            comp_data: Competency duomenys
            lesson_prefix: Pamokos prefiksas klaidoms
        """
        required_fields = ['subject', 'competency', 'virtues']
        for field in required_fields:
            if field not in comp_data:
                self.errors.append(f"{lesson_prefix}: Naujame competency_atcheve '{auto_key}' trūksta lauko '{field}'")
        
        # Tikrinti subject
        if 'subject' in comp_data:
            try:
                Subject.objects.get(id=comp_data['subject'])
            except Subject.DoesNotExist:
                self.errors.append(f"{lesson_prefix}: Naujame competency '{auto_key}' subject su ID {comp_data['subject']} neegzistuoja")
        
        # Tikrinti competency
        if 'competency' in comp_data:
            try:
                Competency.objects.get(id=comp_data['competency'])
            except Competency.DoesNotExist:
                self.errors.append(f"{lesson_prefix}: Naujame competency '{auto_key}' competency su ID {comp_data['competency']} neegzistuoja")
        
        # Tikrinti virtues
        if 'virtues' in comp_data:
            if not isinstance(comp_data['virtues'], list) or not comp_data['virtues']:
                self.errors.append(f"{lesson_prefix}: Naujame competency '{auto_key}' virtues turi būti ne tuščias masyvas")
            else:
                for virtue_id in comp_data['virtues']:
                    try:
                        Virtue.objects.get(id=virtue_id)
                    except Virtue.DoesNotExist:
                        self.errors.append(f"{lesson_prefix}: Naujame competency '{auto_key}' virtue su ID {virtue_id} neegzistuoja")
        
        # Tikrinti todos JSON formatą
        if 'todos' in comp_data and comp_data['todos']:
            try:
                parsed = json.loads(comp_data['todos'])
                if not isinstance(parsed, list):
                    self.errors.append(f"{lesson_prefix}: Naujame competency '{auto_key}' todos turi būti JSON array")
            except json.JSONDecodeError as e:
                self.errors.append(f"{lesson_prefix}: Naujame competency '{auto_key}' netinkamas todos JSON formatas - {e}")
    
    def check_auto_increment_consistency(self, lessons_data, new_skills_data, new_competencies_data):
        """
        Tikrina auto-increment ID nuoseklumą
        
        Args:
            lessons_data: Pamokų duomenys
            new_skills_data: Naujų skills duomenys
            new_competencies_data: Naujų competencies duomenys
        """
        used_auto_skills = set()
        used_auto_competencies = set()
        
        # Rinkti visus naudojamus AUTO_X iš pamokų
        for lesson_data in lessons_data:
            if 'skills' in lesson_data:
                for skill_id in lesson_data['skills']:
                    if isinstance(skill_id, str) and skill_id.startswith('AUTO_'):
                        used_auto_skills.add(skill_id)
            
            if 'competency_atcheves' in lesson_data:
                for comp_id in lesson_data['competency_atcheves']:
                    if isinstance(comp_id, str) and comp_id.startswith('AUTO_'):
                        used_auto_competencies.add(comp_id)
        
        # Tikrinti ar visi naudojami AUTO_X turi duomenis
        for auto_key in used_auto_skills:
            if auto_key not in new_skills_data:
                self.errors.append(f"Naudojamas skill '{auto_key}' bet nerastas jo duomenys")
        
        for auto_key in used_auto_competencies:
            if auto_key not in new_competencies_data:
                self.errors.append(f"Naudojamas competency '{auto_key}' bet nerastas jo duomenys")
        
        # Tikrinti ar yra nenaudojamų duomenų
        for auto_key in new_skills_data:
            if auto_key not in used_auto_skills:
                self.warnings.append(f"Skill duomenys '{auto_key}' nenaudojami jokiose pamokose")
        
        for auto_key in new_competencies_data:
            if auto_key not in used_auto_competencies:
                self.warnings.append(f"Competency duomenys '{auto_key}' nenaudojami jokiose pamokose")
    
    def generate_suggestions(self, lessons_data):
        """
        Generuoja pasiūlymus duomenų pagerinimui
        
        Args:
            lessons_data: Pamokų duomenys
        """
        # Tikrinti ar yra tuščių laukų
        for i, lesson_data in enumerate(lessons_data):
            lesson_prefix = f"Pamoka {i + 1}"
            
            if not lesson_data.get('content'):
                self.suggestions.append(f"{lesson_prefix}: Rekomenduojama pridėti 'content' lauką")
            
            if not lesson_data.get('topic'):
                self.suggestions.append(f"{lesson_prefix}: Rekomenduojama pridėti 'topic' lauką")
            
            if not lesson_data.get('objectives'):
                self.suggestions.append(f"{lesson_prefix}: Rekomenduojama pridėti 'objectives' lauką")
            
            if not lesson_data.get('skills'):
                self.suggestions.append(f"{lesson_prefix}: Rekomenduojama pridėti 'skills' lauką")
    
    def evaluate_lessons(self):
        """
        Pagrindinis metodas pamokų duomenų tikrinimui
        
        Returns:
            True jei duomenys validūs, False kitu atveju
        """
        print("🔍 Pradedamas pamokų duomenų tikrinimas...")
        
        # Nuskaityti JSON duomenis
        data = self.load_json_data()
        if not data:
            return False
        
        lessons_data = data.get('lessons', [])
        new_skills_data = data.get('new_skills', {})
        new_competencies_data = data.get('new_competency_atcheves', {})
        
        if not lessons_data:
            self.errors.append("Nerasta pamokų duomenų")
            return False
        
        self.total_lessons = len(lessons_data)
        print(f"📊 Tikrinama {self.total_lessons} pamokų")
        print(f"🔧 Tikrinama {len(new_skills_data)} naujų skills")
        print(f"🔧 Tikrinama {len(new_competencies_data)} naujų competency_atcheves")
        
        # Tikrinti kiekvieną pamoką
        for i, lesson_data in enumerate(lessons_data):
            print(f"\n--- Tikrinama pamoka {i + 1}/{self.total_lessons}: {lesson_data.get('title', 'Be pavadinimo')} ---")
            
            # Duomenų tipų tikrinimas
            self.validate_data_types(lesson_data, i)
            
            # JSON laukų tikrinimas
            self.validate_json_fields(lesson_data, i)
            
            # Foreign key tikrinimas
            self.validate_foreign_keys(lesson_data, i)
            
            # Skills ir competencies tikrinimas
            self.validate_skills_and_competencies(lesson_data, i, new_skills_data, new_competencies_data)
            
            # Jei nėra klaidų, pamoka validi
            if not any(error.startswith(f"Pamoka {i + 1}") for error in self.errors):
                self.valid_lessons += 1
                print(f"✅ Pamoka {i + 1} validi")
            else:
                print(f"❌ Pamoka {i + 1} turi klaidų")
        
        # Tikrinti auto-increment nuoseklumą
        self.check_auto_increment_consistency(lessons_data, new_skills_data, new_competencies_data)
        
        # Generuoti pasiūlymus
        self.generate_suggestions(lessons_data)
        
        # Jei nėra klaidų ir reikia atnaujinti failą
        if len(self.errors) == 0 and self.update_file:
            print("\n🔄 Atnaujinamas failas su tikrais ID...")
            try:
                # Tik atnaujinti JSON failą su tikrais ID (ne kurti objektus DB)
                self.update_json_file(data)
                print("✅ Failas sėkmingai atnaujintas!")
                
            except Exception as e:
                print(f"❌ Klaida atnaujinant failą: {e}")
                return False
        
        return len(self.errors) == 0
    
    def get_next_skill_id(self):
        """Gauna kitą galimą skill ID iš duomenų bazės"""
        try:
            last_skill = Skill.objects.order_by('-id').first()
            return (last_skill.id + 1) if last_skill else 1
        except Exception as e:
            print(f"❌ Klaida gaunant skill ID: {e}")
            return 1
    
    def get_next_competency_id(self):
        """Gauna kitą galimą competency_atcheve ID iš duomenų bazės"""
        try:
            last_competency = CompetencyAtcheve.objects.order_by('-id').first()
            return (last_competency.id + 1) if last_competency else 1
        except Exception as e:
            print(f"❌ Klaida gaunant competency ID: {e}")
            return 1
    
    def update_json_file(self, data):
        """
        Atnaujina JSON failą su tikrais ID (ne kuria objektus DB)
        
        Args:
            data: Atnaujinti duomenys
        """
        if not self.update_file:
            return
            
        try:
            # Gauti paskutinius ID iš duomenų bazės
            last_skill_id = self.get_next_skill_id() - 1
            last_competency_id = self.get_next_competency_id() - 1
            
            # Sukurti mapping AUTO_X -> tikras ID
            auto_skill_mapping = {}
            auto_competency_mapping = {}
            
            # Mapinti skills
            skill_counter = 1
            for auto_key in data.get('new_skills', {}):
                auto_skill_mapping[auto_key] = last_skill_id + skill_counter
                skill_counter += 1
            
            # Mapinti competency_atcheves
            comp_counter = 1
            for auto_key in data.get('new_competency_atcheves', {}):
                auto_competency_mapping[auto_key] = last_competency_id + comp_counter
                comp_counter += 1
            
            # Atnaujinti pamokų duomenis su tikrais ID
            for lesson_data in data.get('lessons', []):
                self.replace_auto_ids_with_mapping(lesson_data, auto_skill_mapping, auto_competency_mapping)
            
            # Pašalinti new_skills ir new_competency_atcheves sekcijas
            if 'new_skills' in data:
                del data['new_skills']
                print("🗑️  Pašalinta 'new_skills' sekcija")
            
            if 'new_competency_atcheves' in data:
                del data['new_competency_atcheves']
                print("🗑️  Pašalinta 'new_competency_atcheves' sekcija")
            
            # Išsaugoti atnaujintą failą
            with open(self.json_file_path, 'w', encoding='utf-8') as file:
                json.dump(data, file, ensure_ascii=False, indent=2)
            
            print(f"✅ Failas {self.json_file_path} atnaujintas su tikrais ID")
            print(f"📝 Skills ID: {auto_skill_mapping}")
            print(f"📝 Competency ID: {auto_competency_mapping}")
            
        except Exception as e:
            print(f"❌ Klaida atnaujinant failą: {e}")
    
    def replace_auto_ids_with_mapping(self, lesson_data, skill_mapping, competency_mapping):
        """
        Pakeičia AUTO_X žymėjimus tikrais ID naudojant mapping
        
        Args:
            lesson_data: Pamokos duomenys
            skill_mapping: AUTO_X -> skill ID mapping
            competency_mapping: AUTO_X -> competency ID mapping
        """
        # Pakeisti skills AUTO_X į tikrus ID
        if 'skills' in lesson_data:
            updated_skills = []
            for skill_id in lesson_data['skills']:
                if isinstance(skill_id, str) and skill_id.startswith('AUTO_'):
                    if skill_id in skill_mapping:
                        updated_skills.append(skill_mapping[skill_id])
                    else:
                        print(f"⚠️  Nerastas mapping skill {skill_id}")
                else:
                    updated_skills.append(skill_id)
            lesson_data['skills'] = updated_skills
        
        # Pakeisti competency_atcheves AUTO_X į tikrus ID
        if 'competency_atcheves' in lesson_data:
            updated_competencies = []
            for comp_id in lesson_data['competency_atcheves']:
                if isinstance(comp_id, str) and comp_id.startswith('AUTO_'):
                    if comp_id in competency_mapping:
                        updated_competencies.append(competency_mapping[comp_id])
                    else:
                        print(f"⚠️  Nerastas mapping competency {comp_id}")
                else:
                    updated_competencies.append(comp_id)
            lesson_data['competency_atcheves'] = updated_competencies
    
    def print_results(self):
        """Spausdina tikrinimo rezultatus"""
        print("\n" + "="*60)
        print("📋 TIKRINIMO REZULTATAI")
        print("="*60)
        
        print(f"📊 Iš viso pamokų: {self.total_lessons}")
        print(f"✅ Validūs: {self.valid_lessons}")
        print(f"❌ Su klaidomis: {self.total_lessons - self.valid_lessons}")
        
        if self.errors:
            print(f"\n❌ KLAIDOS ({len(self.errors)}):")
            for i, error in enumerate(self.errors, 1):
                print(f"  {i}. {error}")
        
        if self.warnings:
            print(f"\n⚠️  ĮSPĖJIMAI ({len(self.warnings)}):")
            for i, warning in enumerate(self.warnings, 1):
                print(f"  {i}. {warning}")
        
        if self.suggestions:
            print(f"\n💡 PASIŪLYMAI ({len(self.suggestions)}):")
            for i, suggestion in enumerate(self.suggestions, 1):
                print(f"  {i}. {suggestion}")
        
        if not self.errors:
            print(f"\n🎉 Visos pamokos validūs! Galite saugiai importuoti duomenis.")
            
            # Atnaujina sekas po sėkmingo tikrinimo
            self.fix_sequences_after_import()
        else:
            print(f"\n❌ Rasta klaidų. Ištaisykite jas prieš importavimą.")
        
        print("="*60)

def main():
    """Pagrindinė funkcija"""
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        print("Naudojimas: python evaluate_lessons.py <json_failo_kelias> [--update]")
        print("Pavyzdys: python evaluate_lessons.py /home/master/DIENYNAS/test.json")
        print("Pavyzdys su atnaujinimu: python evaluate_lessons.py /home/master/DIENYNAS/test.json --update")
        sys.exit(1)
    
    json_file_path = sys.argv[1]
    update_file = len(sys.argv) == 3 and sys.argv[2] == '--update'
    
    if not os.path.exists(json_file_path):
        print(f"❌ Failas {json_file_path} neegzistuoja")
        sys.exit(1)
    
    # Sukurti tikrinimo objektą ir paleisti
    evaluator = LessonEvaluator(json_file_path, update_file)
    is_valid = evaluator.evaluate_lessons()
    evaluator.print_results()
    
    if is_valid:
        if update_file:
            print("\n✅ Duomenys atnaujinti ir paruošti importavimui!")
        else:
            print("\n✅ Duomenys paruošti importavimui!")
        sys.exit(0)
    else:
        print("\n❌ Duomenys turi klaidų!")
        sys.exit(1)

if __name__ == "__main__":
    main()
