#!/usr/bin/env python3
# /home/master/DIENYNAS/scripts/import_lessons.py
# Skriptas pamokų importavimui į A-DIENYNAS duomenų bazę
# Palaiko auto-increment ID sistemą naujiems skills ir competency_atcheves

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

class LessonImporter:
    def __init__(self, json_file_path):
        """
        Inicializuoja pamokų importavimo klasę
        
        Args:
            json_file_path: Kelias iki JSON failo su pamokų duomenimis
        """
        self.json_file_path = json_file_path
        self.auto_skill_mapping = {}  # AUTO_X -> tikras ID
        self.auto_competency_mapping = {}  # AUTO_X -> tikras ID
        self.created_skills = []
        self.created_competencies = []
        self.created_lessons = []
        
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
            print(f"❌ Klaida: Failas {self.json_file_path} nerastas")
            return None
        except json.JSONDecodeError as e:
            print(f"❌ Klaida: Netinkamas JSON formatas - {e}")
            return None
    
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
    
    def create_skills(self, new_skills_data):
        """
        Sukuria naujus skills su auto-increment ID
        
        Args:
            new_skills_data: Žodynas su AUTO_X -> skill duomenimis
        """
        if not new_skills_data:
            return
            
        print("🔧 Kuriami nauji skills...")
        next_id = self.get_next_skill_id()
        
        for auto_key, skill_data in new_skills_data.items():
            try:
                # Patikrinti ar skill su tokiu code jau egzistuoja
                existing_skill = Skill.objects.filter(code=skill_data['code']).first()
                if existing_skill:
                    print(f"⚠️  Skill su code '{skill_data['code']}' jau egzistuoja (ID: {existing_skill.id})")
                    self.auto_skill_mapping[auto_key] = existing_skill.id
                    continue
                
                # Sukurti naują skill
                skill = Skill.objects.create(
                    id=next_id,
                    code=skill_data['code'],
                    name=skill_data['name'],
                    description=skill_data.get('description', ''),
                    subject_id=skill_data['subject']
                )
                
                self.auto_skill_mapping[auto_key] = next_id
                self.created_skills.append(skill)
                print(f"✅ Sukurtas skill: {skill.name} (ID: {next_id})")
                next_id += 1
                
            except Exception as e:
                print(f"❌ Klaida kuriant skill {auto_key}: {e}")
    
    def create_competency_atcheves(self, new_competencies_data):
        """
        Sukuria naujus competency_atcheves su auto-increment ID
        
        Args:
            new_competencies_data: Žodynas su AUTO_X -> competency duomenimis
        """
        if not new_competencies_data:
            return
            
        print("🔧 Kuriami nauji competency_atcheves...")
        next_id = self.get_next_competency_id()
        
        for auto_key, comp_data in new_competencies_data.items():
            try:
                # Sukurti naują competency_atcheve
                competency_atcheve = CompetencyAtcheve.objects.create(
                    id=next_id,
                    subject_id=comp_data['subject'],
                    competency_id=comp_data['competency'],
                    todos=comp_data.get('todos', '[]')
                )
                
                # Pridėti virtues (ManyToMany)
                if 'virtues' in comp_data:
                    competency_atcheve.virtues.set(comp_data['virtues'])
                
                self.auto_competency_mapping[auto_key] = next_id
                self.created_competencies.append(competency_atcheve)
                print(f"✅ Sukurtas competency_atcheve (ID: {next_id})")
                next_id += 1
                
            except Exception as e:
                print(f"❌ Klaida kuriant competency_atcheve {auto_key}: {e}")
    
    def replace_auto_ids(self, lesson_data):
        """
        Pakeičia AUTO_X žymėjimus tikrais ID pamokos duomenyse
        
        Args:
            lesson_data: Pamokos duomenys su galimais AUTO_X
            
        Returns:
            Atnaujinti pamokos duomenys su tikrais ID
        """
        # Pakeisti skills AUTO_X į tikrus ID
        if 'skills' in lesson_data:
            updated_skills = []
            for skill_id in lesson_data['skills']:
                if isinstance(skill_id, str) and skill_id.startswith('AUTO_'):
                    if skill_id in self.auto_skill_mapping:
                        updated_skills.append(self.auto_skill_mapping[skill_id])
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
                    if comp_id in self.auto_competency_mapping:
                        updated_competencies.append(self.auto_competency_mapping[comp_id])
                    else:
                        print(f"⚠️  Nerastas mapping competency {comp_id}")
                else:
                    updated_competencies.append(comp_id)
            lesson_data['competency_atcheves'] = updated_competencies
        
        return lesson_data
    
    def validate_lesson_data(self, lesson_data):
        """
        Validuoja pamokos duomenis prieš įrašymą
        
        Args:
            lesson_data: Pamokos duomenys
            
        Returns:
            True jei duomenys validūs, False kitu atveju
        """
        # Privalomi laukai
        required_fields = ['title', 'subject']
        for field in required_fields:
            if field not in lesson_data or not lesson_data[field]:
                print(f"❌ Trūksta privalomo lauko: {field}")
                return False
        
        # Patikrinti ar subject egzistuoja
        try:
            Subject.objects.get(id=lesson_data['subject'])
        except Subject.DoesNotExist:
            print(f"❌ Subject su ID {lesson_data['subject']} neegzistuoja")
            return False
        
        # Patikrinti ar mentor egzistuoja (jei nurodytas)
        if lesson_data.get('mentor'):
            try:
                User.objects.get(id=lesson_data['mentor'])
            except User.DoesNotExist:
                print(f"❌ Mentor su ID {lesson_data['mentor']} neegzistuoja")
                return False
        
        return True
    
    def create_lesson(self, lesson_data):
        """
        Sukuria pamoką duomenų bazėje
        
        Args:
            lesson_data: Pamokos duomenys su tikrais ID
            
        Returns:
            Sukurta Lesson objektas arba None
        """
        try:
            # Išskirti ManyToMany laukus
            skills_ids = lesson_data.pop('skills', [])
            virtues_ids = lesson_data.pop('virtues', [])
            levels_ids = lesson_data.pop('levels', [])
            competency_atcheves_ids = lesson_data.pop('competency_atcheves', [])
            
            # Gauti objektų instancijas
            if 'subject' in lesson_data:
                lesson_data['subject'] = Subject.objects.get(id=lesson_data['subject'])
            if 'mentor' in lesson_data and lesson_data['mentor']:
                lesson_data['mentor'] = User.objects.get(id=lesson_data['mentor'])
            
            # Sukurti pamoką
            lesson = Lesson.objects.create(**lesson_data)
            
            # Pridėti ManyToMany ryšius
            if skills_ids:
                lesson.skills.set(skills_ids)
            if virtues_ids:
                lesson.virtues.set(virtues_ids)
            if levels_ids:
                lesson.levels.set(levels_ids)
            if competency_atcheves_ids:
                lesson.competency_atcheves.set(competency_atcheves_ids)
            
            return lesson
            
        except Exception as e:
            print(f"❌ Klaida kuriant pamoką: {e}")
            return None
    
    def import_lessons(self):
        """Pagrindinis metodas pamokų importavimui"""
        print("🚀 Pradedamas pamokų importavimas...")
        
        # Nuskaityti JSON duomenis
        data = self.load_json_data()
        if not data:
            return False
        
        lessons_data = data.get('lessons', [])
        new_skills_data = data.get('new_skills', {})
        new_competencies_data = data.get('new_competency_atcheves', {})
        
        if not lessons_data:
            print("❌ Nerasta pamokų duomenų")
            return False
        
        print(f"📊 Rasta {len(lessons_data)} pamokų")
        print(f"🔧 Rasta {len(new_skills_data)} naujų skills")
        print(f"🔧 Rasta {len(new_competencies_data)} naujų competency_atcheves")
        
        try:
            with transaction.atomic():
                # 1. Sukurti naujus skills (jei yra AUTO_X)
                if new_skills_data:
                    self.create_skills(new_skills_data)
                
                # 2. Sukurti naujus competency_atcheves (jei yra AUTO_X)
                if new_competencies_data:
                    self.create_competency_atcheves(new_competencies_data)
                
                # 3. Sukurti pamokas
                print("📚 Kuriamos pamokos...")
                for i, lesson_data in enumerate(lessons_data, 1):
                    print(f"\n--- Pamoka {i}/{len(lessons_data)}: {lesson_data.get('title', 'Be pavadinimo')} ---")
                    
                    # Pakeisti AUTO_X į tikrus ID
                    lesson_data = self.replace_auto_ids(lesson_data)
                    
                    # Validuoti duomenis
                    if not self.validate_lesson_data(lesson_data):
                        print(f"❌ Pamoka {i} praleista dėl validacijos klaidų")
                        continue
                    
                    # Sukurti pamoką
                    lesson = self.create_lesson(lesson_data)
                    if lesson:
                        self.created_lessons.append(lesson)
                        print(f"✅ Pamoka sukurta sėkmingai (ID: {lesson.id})")
                    else:
                        print(f"❌ Nepavyko sukurti pamokos {i}")
                
                print(f"\n🎉 Importavimas baigtas!")
                print(f"✅ Sukurtos pamokos: {len(self.created_lessons)}")
                print(f"✅ Sukurti skills: {len(self.created_skills)}")
                print(f"✅ Sukurti competency_atcheves: {len(self.created_competencies)}")
                
                return True
                
        except Exception as e:
            print(f"❌ Klaida importavimo metu: {e}")
            return False

def main():
    """Pagrindinė funkcija"""
    if len(sys.argv) != 2:
        print("Naudojimas: python import_lessons.py <json_failo_kelias>")
        print("Pavyzdys: python import_lessons.py /home/master/DIENYNAS/test.json")
        sys.exit(1)
    
    json_file_path = sys.argv[1]
    
    if not os.path.exists(json_file_path):
        print(f"❌ Failas {json_file_path} neegzistuoja")
        sys.exit(1)
    
    # Sukurti importavimo objektą ir paleisti
    importer = LessonImporter(json_file_path)
    success = importer.import_lessons()
    
    if success:
        print("\n🎉 Visos pamokos sėkmingai importuotos!")
        
        # Atnaujina sekas po sėkmingo importavimo
        importer.fix_sequences_after_import()
        
        sys.exit(0)
    else:
        print("\n❌ Importavimas nepavyko!")
        sys.exit(1)

if __name__ == "__main__":
    main()
