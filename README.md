# 🎓 A-DIENYNAS - Student Diary Management System

**A-DIENYNAS** yra elektroninis dienynas mokinių lankomumui ir atsiskaitymams fiksuoti, sukurta su Django REST API backend'u ir Next.js frontend'u. Sistema valdo 5 vartotojų tipus: studentus, tėvus, kuratorius, mentorius ir administratorius.

## 🎯 **Sistemos Pagrindinė Idėja**

### **1. Elektroninis Dienynas - Mokinių Lankomumas ir Atsiskaitymai**

Sistema skirta fiksuoti mokinių lankomumą ir atsiskaitymus per du pagrindinius procesus:

#### **Pamokų Kūrimas ir Valdymas**
- **Mentoriai** (mokytojai) kuria ir redaguoja pamokas
- Nustato pamokos parametrus: tikslus, fokusus, kompetencijas
- Kiekviena pamoka turi detalią struktūrą su mokymo lygiais (54%, 74%, 84%, 100%)

#### **Ugdymo Planų Sudarymas**
- Mentoriai sudėlioja pamokas tam tikra seka
- Sukuria ugdymo planus vienam mokiniui arba visai vaikų grupei
- Planai pritaikomi konkrečiam mokiniui per individualų mokinio ūgties planą

#### **Individualių Ūgties Planų Generavimas**
- Kiekvienam mokiniui pamokų seka parenkama pagal globalų tvarkaraštį
- Sistema automatiškai priskiria pamokų vietas (slotus) pagal galimybes
- Pavyzdys: Mokinys "A" matematikos trupmenų pamoką turės 2025-09-05, 1-os pamokos metu, 203-oje klasėje

#### **Mentorių Veiklos Puslapis**
- Mentoriai mato savo užimtumą ir mokinių sąrašus
- Gali pradėti pamoką, žymėti lankomumą ir atsiskaitymus
- Visi duomenys fiksuojami sistemoje realiu laiku

#### **AI Grįžtamojo Ryšio Formavimas** *(Plėtojama)*
- Pagal naujausius Lietuvos švietimo reikalavimus
- Atsiskaitymo duomenys siunčiami per AI API
- Mokytojas peržiūri ir tvirtina AI sugeneruotą grįžtamąjį ryšį

### **2. Globalus Tvarkaraštis** *(Pradėta kurti)*

#### **Kortelių Sistema**
- Tvarkaraštį kuriantis asmuo sukuria pagalbinius elementus - "korteles"
- Kiekviena kortelė nurodo: dalyką, lygį, kabinetą, mentorių
- Lygis "atradimų" terminais apibrėžia vaikų grupę

#### **Drag-and-Drop Funkcionalumas**
- Korteles galima vilkti į konkrečią savaitės dieną ir pamokos laiką
- Automatinis sutapimų tikrinimas tarp mokinių
- Mentorius galimybių tikrinimas (ar gali dirbti, ar neturi kitų veiklų)

#### **Backend Sprendimas**
- Sukurtas paprastas BackEnd sprendimas
- Jau pasitarnavo direktorei sudėlioti šių metų tvarkaraštį
- Labai palengvina tvarkaraščio sudarymo procesą

## 📋 **Sistemos Būsena ir TODO Sąrašas**

### **✅ Jau Sukurta ir Veikia**

#### **Backend Funkcionalumas**
- [x] Pamokų kūrimo ir redagavimo sistema
- [x] Ugdymo planų sudarymas
- [x] Individualių ūgties planų generavimas
- [x] Mentorių veiklos puslapis
- [x] Lankomumo ir atsiskaitymų fiksavimas
- [x] Django Admin prieiga visoms funkcijoms
- [ ] Globalaus tvarkaraščio Backend sprendimas

#### **Frontend Funkcionalumas**
- [x] Mentorių veiklos puslapis su lankomumo žymėjimu
- [x] Atsiskaitymų fiksavimo sistema
- [x] Role-based navigacija
- [x] Responsive dizainas

### **🔄 Dabar Kuriama**

#### **Globalus Tvarkaraštis**
- [ ] Drag-and-drop kortelių sistema
- [ ] Sutapimų tikrinimo algoritmai
- [ ] Mentorius galimybių tikrinimas
- [ ] Frontend tvarkaraščio kūrimo sąsaja

### **📅 Ateityje Planuojama**

#### **AI Integracija**
- [ ] AI grįžtamojo ryšio formavimas
- [ ] API integracija su AI paslaugomis
- [ ] Mokytojo patvirtinimo sistema

#### **Papildomi Vartotojai**
- [ ] Mokinio prieiga (student portal)
- [ ] Tėvų prieiga (parent portal)
- [ ] Mokinio pažangos stebėjimas

#### **Manager Funkcionalumas**
- [ ] Django Admin funkcijų perkėlimas į FrontEnd
- [ ] Mokinys+dalykas+lygis valdymas
- [ ] Mokinys+kuratorius santykių valdymas
- [ ] Mentorius+dalykas priskyrimas
- [ ] Vartotojų kūrimo sąsaja
- [ ] Klasės ir pamokų laikų valdymas

### **🔧 Techninis Tobulinimas**

#### **Backend Optimizacija**
- [ ] Globalaus tvarkaraščio algoritmų tobulinimas
- [ ] Performance optimizacija dideliems duomenų kiekiams
- [ ] API endpoint'ų papildymas

#### **Frontend Plėtra**
- [ ] Manager role FrontEnd funkcijos
- [ ] Student/Parent portal kūrimas
- [ ] AI integracijos sąsaja
- [ ] Advanced tvarkaraščio redaktorius

#### **Sistemos Integracija**
- [ ] AI API integracija
- [ ] Duomenų eksportas/importas
- [ ] Notification sistema
- [ ] Mobile aplikacija

## 🏗️ **Sistemos Architektūra**

### **Backend (Django)**
- **Lokacija:** `/backend/`
- **Framework:** Django 5.2.4 su Django REST Framework
- **Duomenų bazė:** PostgreSQL (production), SQLite (development)
- **Autentifikacija:** JWT tokenai per django-simple-jwt
- **Aplikacijos:** `users`, `crm`, `schedule`, `curriculum`, `grades`, `plans`, `violation`

### **Frontend (Next.js)**
- **Lokacija:** `/frontend/`
- **Framework:** Next.js 15 su App Router
- **Kalba:** TypeScript
- **Stiliai:** Tailwind CSS v4
- **Valdymas:** Zustand
- **HTTP klientas:** Axios
- **API proxy:** `/api/:path*` → `http://localhost:8000/api/:path*`

### **Infrastruktūra (Docker)**
- **Docker:** Multi-container setup su docker-compose.yml
- **Servisai:** PostgreSQL, Redis, Django backend, Next.js frontend, Nginx reverse proxy
- **Tinklas:** Izoliuotas Docker tinklas (172.20.0.0/16)
- **Volume'ai:** Duomenų bazės, Redis, statiniai failai, media failai

## 🚀 **Quick Start**

### **1. Prerequisites**
- Docker Engine 20.10+
- Docker Compose 2.0+
- Linux Ubuntu 20.04+ (recommended)
- At least 4GB RAM
- At least 20GB free disk space

### **2. Clone and Setup**
```bash
# Clone the repository
git clone <repository-url>
cd A-DIENYNAS

# Copy environment file
cp env.docker .env.docker

# Edit environment variables
nano .env.docker

# Make scripts executable
chmod +x scripts/*.sh
```

### **3. Deploy System**
```bash
# Run deployment script
./scripts/deploy.sh

# Or manually with Docker Compose
docker compose up -d

# Development mode (Django dev server)
DEBUG=True docker compose up -d

# Production mode (Gunicorn)
DEBUG=False docker compose up -d
```

### **4. Access System**
- **Frontend:** https://dienynas.mokyklaatradimai.lt (production server)
- **Backend API:** https://dienynas.mokyklaatradimai.lt/api
- **Local Access:** http://localhost (for development)
- **Admin Access:** https://dienynas.mokyklaatradimai.lt/admin
- **Admin Access:** Use `docker compose exec backend python manage.py createsuperuser` to create admin user

## 👥 **Rolių Sistema**

### **Rolių Tipai**
Sistema palaiko 5 vartotojų tipus su skirtingomis teisėmis:

#### **1. Manager (Sistemos valdytojas)**
- **Paskirtis:** Pilnas sistemos valdymas
- **Teisės:** Visi duomenys, visi violations, sistemos konfigūracija
- **Funkcionalumas:** Vartotojų valdymas, sistemos nustatymai, ataskaitos

#### **2. Curator (Kuratorius)**
- **Paskirtis:** Turinio valdymas ir moderavimas
- **Teisės:** Visi violations, studentų duomenys, turinio redagavimas
- **Funkcionalumas:** Violations valdymas, studentų stebėjimas, turinio moderavimas

#### **3. Mentor (Mentorius)**
- **Paskirtis:** Mokinių konsultavimas ir vedimas
- **Teisės:** Tik savo sukurti violations, priskirti studentai
- **Funkcionalumas:** Pamokų vedimas, pažymių įvedimas, studentų konsultavimas

#### **4. Parent (Tėvas/Globėjas)**
- **Paskirtis:** Vaiko edukacinės veiklos stebėjimas
- **Teisės:** Tik savo vaikų violations ir duomenys
- **Funkcionalumas:** Vaiko pažangos stebėjimas, komunikacija su mokytojais

#### **5. Student (Studentas)**
- **Paskirtis:** Mokymosi veiklos vykdymas
- **Teisės:** Tik savo violations ir duomenys
- **Funkcionalumas:** Pamokų dalyvavimas, užduočių atlikimas, pažangos stebėjimas

### **Rolių Keitimo Sistema**

#### **Default Role vs Current Role**
- **`default_role`** - Rolė, kurią vartotojas pasirenka nustatymuose
- **`current_role`** - Rolė, į kurią vartotojas persijungė eigos metu

#### **Kaip Veikia:**
1. **Prisijungimas:** Vartotojas prisijungia su `default_role`
2. **Rolės keitimas:** Frontend perduoda `current_role` per API header
3. **Duomenų filtravimas:** Backend naudoja `current_role` duomenų filtravimui
4. **Realus laikas:** Rolės keitimas veikia iškart be puslapio perkrovimo

#### **Techninis Implementavimas:**
```typescript
// Frontend - RoleSwitcher.tsx
const handleRoleSelect = (role: string) => {
  setCurrentRole(role);  // Išsaugo į auth store
  localStorage.setItem('current_role', role);  // API užklausoms
}

// API klientas perduoda rolę per header
api.interceptors.request.use((config) => {
  const currentRole = localStorage.getItem('current_role');
  if (currentRole) {
    config.headers['X-Current-Role'] = currentRole;
  }
});
```

## 🔌 **API Endpointai**

### **Pagrindiniai API Endpointai**
Visi API endpointai prieinami per `/api/` prefix'ą:

#### **1. Autentifikacija (`/api/users/`)**
```
POST   /api/users/token/                    # Prisijungimas (JWT token)
POST   /api/users/token/refresh/            # Token atnaujinimas
GET    /api/users/me/                       # Dabartinio vartotojo duomenys
GET    /api/users/settings/                 # Vartotojo nustatymai
GET    /api/users/students/<id>/            # Studento detalūs duomenys
```

#### **2. Vartotojų Valdymas (`/api/users/`)**
```
GET    /api/users/users/                    # Vartotojų sąrašas
POST   /api/users/users/                    # Naujo vartotojo kūrimas
GET    /api/users/users/<id>/               # Vartotojo duomenys
PUT    /api/users/users/<id>/               # Vartotojo atnaujinimas
DELETE /api/users/users/<id>/               # Vartotojo šalinimas
```

#### **3. Santykių Valdymas (`/api/crm/`)**
```
GET    /api/crm/student-parents/            # Studentų-tėvų santykiai
POST   /api/crm/student-parents/            # Naujo santykio kūrimas
GET    /api/crm/student-curators/           # Studentų-kuratorių santykiai
POST   /api/crm/student-curators/           # Naujo santykio kūrimas
GET    /api/crm/student-subject-levels/     # Studentų dalykų lygiai
GET    /api/crm/mentor-subjects/            # Mentorių dalykai
```

#### **4. Tvarkaraštis (`/api/schedule/`)**
```
GET    /api/schedule/periods/               # Pamokų periodai
POST   /api/schedule/periods/               # Naujo periodo kūrimas
GET    /api/schedule/classrooms/            # Klasės
POST   /api/schedule/classrooms/            # Naujos klasės kūrimas
GET    /api/schedule/schedules/             # Tvarkaraščiai
POST   /api/schedule/schedules/             # Naujo tvarkaraščio kūrimas
```

#### **5. Mokymo Programos (`/api/curriculum/`)**
```
GET    /api/curriculum/subjects/            # Dalykai
GET    /api/curriculum/levels/              # Mokymo lygiai
GET    /api/curriculum/objectives/          # Mokymo tikslai
GET    /api/curriculum/components/          # Pamokų komponentai
GET    /api/curriculum/skills/              # Įgūdžiai
GET    /api/curriculum/competencies/        # Kompetencijos
GET    /api/curriculum/virtues/             # Dorybės
GET    /api/curriculum/lessons/             # Pamokos
```

#### **6. Pažymiai (`/api/grades/`)**
```
GET    /api/grades/achievement-levels/      # Pasiekimų lygiai
POST   /api/grades/achievement-levels/      # Naujo lygio kūrimas
GET    /api/grades/grades/                  # Pažymiai
POST   /api/grades/grades/                  # Naujo pažymio kūrimas
POST   /api/grades/calculate-level/<int:percentage>/  # Lygio skaičiavimas
GET    /api/grades/student-summary/         # Studento suvestinė
GET    /api/grades/lesson-summary/          # Pamokos suvestinė
POST   /api/grades/recalculate-all/         # Visų pažymių perskaičiavimas
```

#### **7. Ugdymo Planai (`/api/plans/`)**
```
GET    /api/plans/sequences/                # Pamokų sekos
POST   /api/plans/sequences/                # Naujos sekos kūrimas
GET    /api/plans/sequence-items/           # Sekos elementai
POST   /api/plans/sequence-items/           # Naujo elemento kūrimas
GET    /api/plans/imu-plans/                # IMU planai
POST   /api/plans/imu-plans/                # Naujo IMU plano kūrimas
```

#### **8. Pažeidimai (`/api/violations/`)**
```
GET    /api/violations/                     # Pažeidimų sąrašas
POST   /api/violations/                     # Naujo pažeidimo kūrimas
GET    /api/violations/<id>/                # Pažeidimo duomenys
PUT    /api/violations/<id>/                # Pažeidimo atnaujinimas
DELETE /api/violations/<id>/                # Pažeidimo šalinimas
GET    /api/violations/categories/          # Pažeidimų kategorijos
GET    /api/violations/ranges/              # Pažeidimų diapazonai
GET    /api/violations/stats/               # Pažeidimų statistikos
GET    /api/violations/category-stats/      # Kategorijų statistikos
```

#### **9. Sistemos Sveikata (`/api/health/`)**
```
GET    /api/health/                         # Pagrindinis sveikatos patikrinimas
GET    /api/health/detailed/                # Detalus sveikatos patikrinimas
```

### **Autentifikacija**
Visi API endpointai (išskyrus `/api/health/` ir `/api/users/token/`) reikalauja JWT autentifikacijos:

```bash
# Prisijungimas
curl -X POST http://localhost:8000/api/users/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# API užklausa su token
curl -X GET http://localhost:8000/api/violations/ \
  -H "Authorization: Bearer <your-jwt-token>"
```

### **Rolių Filtravimas**
API automatiškai filtruoja duomenis pagal vartotojo rolę:
- **Manager/Curator:** Matо visus duomenis
- **Mentor:** Matо tik savo sukurtus duomenis
- **Parent:** Matо tik savo vaikų duomenis
- **Student:** Matо tik savo duomenis

## 📊 **Duomenų Bazės Schema**

### **Pagrindiniai Modeliai**

#### **1. Vartotojai (`users` aplikacija)**
```python
# User Model - Pagrindinis vartotojų modelis
class User(AbstractUser):
    first_name = models.CharField(max_length=150)           # Vardas
    last_name = models.CharField(max_length=150)            # Pavardė
    birth_date = models.DateField(null=True, blank=True)    # Gimimo data
    email = models.EmailField(unique=True)                  # El. paštas (unikalus)
    phone_number = models.CharField(max_length=30)          # Telefono numeris
    roles = models.JSONField(default=list)                  # Vartotojo rolės
    default_role = models.CharField(max_length=20)          # Numatytoji rolė
    contract_number = models.CharField(max_length=100)      # Sutarties numeris
```

**Rolių tipai:**
- `manager` - Sistemos valdytojas
- `student` - Studentas
- `parent` - Tėvas/Globėjas
- `curator` - Kuratorius
- `mentor` - Mentorius

#### **2. Santykių Valdymas (`crm` aplikacija)**
```python
# Student-Parent santykis
class StudentParent(models.Model):
    student = models.ForeignKey(User, related_name='student_parents')
    parent = models.ForeignKey(User, related_name='parent_students')
    created_at = models.DateTimeField(auto_now_add=True)

# Student-Curator santykis
class StudentCurator(models.Model):
    student = models.ForeignKey(User, related_name='student_curators')
    curator = models.ForeignKey(User, related_name='curator_students')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

# Student Subject Level
class StudentSubjectLevel(models.Model):
    student = models.ForeignKey(User, related_name='subject_levels')
    subject = models.ForeignKey('curriculum.Subject')
    level = models.ForeignKey('curriculum.Level')

# Mentor Subject
class MentorSubject(models.Model):
    mentor = models.ForeignKey(User, related_name='mentor_subjects')
    subject = models.ForeignKey('curriculum.Subject')
```

#### **3. Mokymo Programos (`curriculum` aplikacija)**
```python
# Dalykai
class Subject(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)

# Mokymo lygiai
class Level(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)

# Pamokos (su soft delete)
class Lesson(models.Model):
    title = models.CharField(max_length=200)
    subject = models.ForeignKey(Subject)
    levels = models.ManyToManyField(Level)
    mentor = models.ForeignKey(User, related_name='lessons_mentored')
    content = models.TextField(blank=True)
    topic = models.CharField(max_length=255)
    objectives = models.TextField(blank=True)  # JSON formatu
    components = models.TextField(blank=True)  # JSON formatu
    skills = models.ManyToManyField(Skill)
    virtues = models.ManyToManyField(Virtue)
    focus = models.TextField(blank=True)       # JSON formatu
    
    # Pasiekimo lygiai
    slenkstinis = models.TextField(blank=True)    # 54%
    bazinis = models.TextField(blank=True)        # 74%
    pagrindinis = models.TextField(blank=True)    # 84%
    aukstesnysis = models.TextField(blank=True)   # 100%
    
    # Soft delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
```

#### **4. Pažeidimų Valdymas (`violation` aplikacija)**
```python
# Pažeidimų kategorijos
class ViolationCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    color_type = models.CharField(max_length=20, choices=[...])
    is_active = models.BooleanField(default=True)

# Pažeidimų rėžiai (mokesčių skaičiavimui)
class ViolationRange(models.Model):
    name = models.CharField(max_length=100)
    min_violations = models.PositiveIntegerField()
    max_violations = models.PositiveIntegerField(null=True, blank=True)
    penalty_amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

# Pagrindinis pažeidimo modelis
class Violation(models.Model):
    student = models.ForeignKey(User, related_name='violations')
    todos = models.JSONField(default=list)  # ToDo sąrašas
    description = models.TextField()
    
    # Statusai
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Neatlikta'),
        ('completed', 'Skola išpirkta')
    ])
    penalty_status = models.CharField(max_length=20, choices=[
        ('unpaid', 'Neapmokėta'),
        ('paid', 'Apmokėta')
    ])
    
    # Kategorijos ir mokesčiai
    category = models.CharField(max_length=50)
    violation_count = models.PositiveIntegerField(default=1)
    penalty_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Datos
    created_at = models.DateTimeField(auto_now_add=True)
    task_completed_at = models.DateTimeField(null=True, blank=True)
    penalty_paid_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, related_name='created_violations')
```

### **Duomenų Bazės Ryšiai**

#### **Vartotojų Santykiai**
```
User (1) ←→ (M) StudentParent (M) ←→ (1) User
User (1) ←→ (M) StudentCurator (M) ←→ (1) User
User (1) ←→ (M) StudentSubjectLevel (M) ←→ (1) Subject
User (1) ←→ (M) MentorSubject (M) ←→ (1) Subject
```

#### **Mokymo Programos Santykiai**
```
Subject (1) ←→ (M) Lesson (M) ←→ (M) Level
Subject (1) ←→ (M) Skill
Lesson (M) ←→ (M) Skill
Lesson (M) ←→ (M) Virtue
Lesson (M) ←→ (M) CompetencyAtcheve
```

#### **Pažeidimų Santykiai**
```
User (1) ←→ (M) Violation
ViolationCategory (1) ←→ (M) Violation (per category field)
ViolationRange (1) ←→ (M) Violation (per penalty calculation)
```

### **Duomenų Bazės Optimizacija**

#### **Indeksai**
```python
# Violation model indeksai
indexes = [
    models.Index(fields=['student', 'status']),
    models.Index(fields=['student', 'penalty_status']),
    models.Index(fields=['category', 'status']),
    models.Index(fields=['violation_count']),
]
```

#### **Apribojimai**
```python
# Unique constraints
unique_together = [
    ('student', 'parent'),           # StudentParent
    ('student', 'curator', 'start_date'),  # StudentCurator
    ('student', 'subject', 'level'), # StudentSubjectLevel
]

# Check constraints
constraints = [
    models.CheckConstraint(
        check=models.Q(max_violations__isnull=True) | 
               models.Q(max_violations__gte=models.F('min_violations')),
        name='max_violations_gte_min_violations'
    )
]
```

### **Duomenų Validacija**

#### **Custom Validation**
```python
def clean(self):
    # StudentParent validation
    if not self.student.has_role('student'):
        raise ValidationError('Selected user must have Student role')
    if not self.parent.has_role('parent'):
        raise ValidationError('Selected user must have Parent role')
    if self.student == self.parent:
        raise ValidationError('Student and Parent cannot be the same user')
```

#### **Automatinis Skaičiavimas**
```python
def save(self, *args, **kwargs):
    # Automatiškai skaičiuoja pažeidimų skaičių
    if not self.pk:
        self.violation_count = self.get_student_violation_count()
        self.penalty_amount = ViolationRange.get_penalty_for_violation_count(
            self.violation_count
        )
    super().save(*args, **kwargs)
```

### **Soft Delete Implementacija**

#### **Lesson Model**
```python
class LessonManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    
    def all_including_deleted(self):
        return super().get_queryset()
    
    def deleted_only(self):
        return super().get_queryset().filter(is_deleted=True)

def delete(self, *args, **kwargs):
    """Soft delete - išlaiko duomenis"""
    self.is_deleted = True
    self.deleted_at = timezone.now()
    self.save()
```

## 🎨 **Frontend Komponentai**

### **Komponentų Architektūra**

#### **1. Layout Komponentai**
```typescript
// BaseNavigation - Pagrindinis navigacijos wrapper
interface BaseNavigationProps {
  isMobile?: boolean;
}

// Role-based navigation rendering
const renderNavigation = () => {
  switch (currentRole) {
    case 'manager': return <ManagerNavigation isMobile={isMobile} />;
    case 'curator': return <CuratorNavigation isMobile={isMobile} />;
    case 'mentor': return <MentorNavigation isMobile={isMobile} />;
    case 'student': return <StudentNavigation isMobile={isMobile} />;
    case 'parent': return <ParentNavigation isMobile={isMobile} />;
    default: return null;
  }
};
```

#### **2. UI Komponentai**

##### **RoleSwitcher - Rolės keitimo komponentas**
```typescript
interface RoleSwitcherProps {
  currentRole?: string;
  onRoleChange?: (role: string) => void;
}

// Rolės informacija
const roleInfo = {
  manager: { name: 'Sistemos valdytojas', description: 'Pilnas sistemos valdymas' },
  curator: { name: 'Kuratorius', description: 'Turinio valdymas ir moderavimas' },
  mentor: { name: 'Mentorius', description: 'Mokinių konsultavimas ir vedimas' },
  parent: { name: 'Tėvas/Globėjas', description: 'Vaiko edukacinės veiklos stebėjimas' },
  student: { name: 'Studentas', description: 'Mokymosi veiklos vykdymas' }
};

// Rolės keitimo logika
const handleRoleSelect = (role: string) => {
  setCurrentRole(role);  // Išsaugo į auth store
  localStorage.setItem('current_role', role);  // API užklausoms
  router.push(roleInfo[role]?.path || '/');
};
```

##### **ReactDataTable - Duomenų lentelės komponentas**
```typescript
interface ReactDataTableProps {
  data: any[];
  columns: Column[];
  title?: string;
  itemsPerPage?: number;
  showFilters?: boolean;
  filterableColumns?: string[];
  filterableColumnIndexes?: number[];
  customHeader?: React.ReactNode;
  customFilters?: { [key: string]: React.ReactNode };
  onFiltersChange?: (filters: { [key: string]: string }) => void;
  onClearFilters?: () => void;
}

interface Column {
  title: string;
  data: string;
  render?: (data: any, row: any) => React.ReactNode;
}
```

### **Komponentų Funkcionalumas**

#### **1. Navigacijos Sistema**
- **BaseNavigation:** Pagrindinis wrapper, valdo role-based rendering
- **Role-specific Navigation:** Atskiri komponentai kiekvienai rolei
- **MobileNavigation:** Mobile-responsive navigacijos versija
- **Responsive Design:** Automatinis mobile/desktop perjungimas

#### **2. Duomenų Valdymas**
- **ReactDataTable:** Pilna funkcionalumo duomenų lentelė
- **Filtravimas:** Real-time filtravimas visiems stulpeliams
- **Rūšiavimas:** Klikinami stulpelių antraštės
- **Puslapiavimas:** Automatinis puslapiavimas su navigacija
- **Custom Filters:** Galimybė pridėti custom filtravimo komponentus

#### **3. Rolių Valdymas**
- **RoleSwitcher:** Dropdown su visomis vartotojo rolėmis
- **Real-time Switching:** Rolės keitimas be puslapio perkrovimo
- **Persistent State:** Rolės išsaugojimas localStorage
- **API Integration:** Automatinis X-Current-Role header pridėjimas

### **State Management**

#### **useAuth Hook**
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  currentRole: string | null;
  setCurrentRole: (role: string) => void;
  getCurrentRole: () => string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Rolės valdymas
const setCurrentRole = (role: string) => {
  setCurrentRole(role);
  localStorage.setItem('current_role', role);
};

const getCurrentRole = () => {
  return currentRole || localStorage.getItem('current_role') || user?.default_role;
};
```

#### **API Integration**
```typescript
// Axios interceptor - automatinis header pridėjimas
api.interceptors.request.use((config) => {
  const currentRole = localStorage.getItem('current_role');
  if (currentRole) {
    config.headers['X-Current-Role'] = currentRole;
  }
  return config;
});
```

### **Komponentų Struktūra**

#### **Layout Komponentai**
```
components/layout/
├── Header.tsx                    # Pagrindinis header
├── Navigation/
│   ├── BaseNavigation.tsx        # Pagrindinis navigacijos wrapper
│   ├── MobileNavigation.tsx      # Mobile navigacija
│   └── roles/                    # Role-specific navigacijos
│       ├── ManagerNavigation.tsx
│       ├── CuratorNavigation.tsx
│       ├── MentorNavigation.tsx
│       ├── StudentNavigation.tsx
│       └── ParentNavigation.tsx
```

#### **UI Komponentai**
```
components/ui/
├── Button.tsx                    # Pagrindinis mygtukas
├── Card.tsx                      # Card komponentas
├── Input.tsx                     # Input laukas
├── Select.tsx                    # Select dropdown
├── RoleSwitcher.tsx             # Rolės keitimo komponentas
├── DataTable/                    # Duomenų lentelės komponentai
│   ├── ReactDataTable.tsx
│   ├── LocalDataTable.tsx
│   └── FilterRow.tsx
└── ...                          # Kiti UI komponentai
```

#### **Specialized Komponentai**
```
components/
├── auth/
│   └── ClientAuthGuard.tsx      # Autentifikacijos guard
├── dashboard/
│   ├── ScheduleCard.tsx         # Tvarkaraščio kortelė
│   ├── WeeklySchedule.tsx       # Savaitės tvarkaraštis
│   └── WeeklyScheduleCalendar.tsx
└── DataTable/                   # Duomenų lentelės sistema
```

### **Styling ir Design**

#### **Tailwind CSS v4**
- **Utility-first:** Naudojami Tailwind utility klasės
- **Responsive Design:** Mobile-first approach
- **Custom Components:** Konsistentūs komponentai su vienoda stilistika
- **Color System:** Vienoda spalvų sistema visoje aplikacijoje

#### **Design Patterns**
```typescript
// Konsistentūs button stiliai
const buttonVariants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-600 hover:bg-gray-700 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white"
};

// Card komponento stiliai
const cardStyles = "bg-white rounded-lg shadow-md border border-gray-200";

// Input laukų stiliai
const inputStyles = "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500";
```

### **Performance Optimizacija**

#### **React Optimizacija**
- **useMemo:** Filtruotų ir rūšiuotų duomenų memoization
- **useCallback:** Event handler'ų memoization
- **Lazy Loading:** Komponentų lazy loading didesnėms sekcijoms
- **Virtual Scrolling:** Didelių duomenų lentelių virtualizacija

#### **State Management Optimizacija**
- **Zustand:** Minimalus state management
- **Local Storage:** Rolės išsaugojimas localStorage
- **API Caching:** Duomenų cache'avimas API lygmenyje

## 🔒 **Saugumo Gairės**

### **Autentifikacija ir Autorizacija**

#### **JWT Token Valdymas**
```python
# Django settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}
```

#### **Rolių Valdymas**
```python
# Backend - Role-based access control
def get_queryset(self):
    current_role = self.request.headers.get('X-Current-Role')
    if not current_role:
        current_role = self.request.user.default_role
    
    if current_role == 'mentor':
        return Violation.objects.filter(created_by=self.request.user)
    elif current_role in ['manager', 'curator']:
        return Violation.objects.all()
    # ... kitos rolės
```

#### **Frontend Autentifikacija**
```typescript
// Axios interceptor - automatinis token pridėjimas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const currentRole = localStorage.getItem('current_role');
  if (currentRole) {
    config.headers['X-Current-Role'] = currentRole;
  }
  
  return config;
});

// Token refresh mechanizmas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await api.post('/api/users/token/refresh/', {
            refresh: refreshToken
          });
          localStorage.setItem('access_token', response.data.access);
          return api.request(error.config);
        } catch (refreshError) {
          logout();
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### **Duomenų Saugumas**

#### **Input Validacija**
```python
# Django model validation
def clean(self):
    if not self.student.has_role('student'):
        raise ValidationError('Selected user must have Student role')
    if not self.parent.has_role('parent'):
        raise ValidationError('Selected user must have Parent role')
    if self.student == self.parent:
        raise ValidationError('Student and Parent cannot be the same user')
```

#### **SQL Injection Prevention**
```python
# Django ORM - automatinis SQL injection prevention
violations = Violation.objects.filter(
    student=self.request.user,
    status='pending'
).select_related('student', 'created_by')

# Raw SQL su parametrais
cursor.execute(
    "SELECT * FROM violations WHERE student_id = %s AND status = %s",
    [user_id, status]
)
```

#### **XSS Prevention**
```typescript
// React - automatinis XSS prevention
const renderDescription = (description: string) => {
  return <span dangerouslySetInnerHTML={{ __html: description }} />;
};

// Arba saugiau - naudoti text content
const renderDescription = (description: string) => {
  return <span>{description}</span>;
};
```

### **Tinklo Saugumas**

#### **CORS Konfigūracija**
```python
# Django CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://dienynas.mokyklaatradimai.lt",
    "http://dienynas.mokyklaatradimai.lt",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-current-role',  # Custom header
    'x-requested-with',
]
```

#### **Rate Limiting**
```python
# Django REST Framework throttling
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}
```

#### **Security Headers**
```python
# Django security middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    # ... kiti middleware
]

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

### **Docker Saugumas**

#### **Container Saugumas**
```dockerfile
# Backend Dockerfile - non-root user
FROM python:3.12-slim

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Run application
CMD ["gunicorn", "core.wsgi:application", "--config", "gunicorn.conf.py"]
```

#### **Network Isolation**
```yaml
# docker-compose.yml - network isolation
networks:
  a-dienynas-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

services:
  backend:
    networks:
      - a-dienynas-network
    # No external port exposure for backend
    # ports: []  # Commented out for security
```

### **Duomenų Apsauga**

#### **Sensitive Data Encryption**
```python
# Django settings - sensitive data
SECRET_KEY = os.environ.get('SECRET_KEY')
DATABASE_PASSWORD = os.environ.get('DATABASE_PASSWORD')
REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD')

# Environment variables - never commit to git
# .env file (not in git)
SECRET_KEY=your-secret-key-here
DATABASE_PASSWORD=secure-password
REDIS_PASSWORD=redis-password
```

#### **Data Backup Security**
```bash
# Backup script - encrypted backups
#!/bin/bash
BACKUP_DIR="/app/backups"
ENCRYPTION_KEY="your-encryption-key"

# Create encrypted backup
pg_dump $DATABASE_URL | gpg --symmetric --cipher-algo AES256 --output $BACKUP_DIR/db_$(date +%Y%m%d_%H%M%S).sql.gpg

# Secure backup storage
chmod 600 $BACKUP_DIR/*.gpg
```

### **Monitoring ir Auditing**

#### **Security Logging**
```python
# Django logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'security_file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': '/app/logs/security.log',
        },
    },
    'loggers': {
        'django.security': {
            'handlers': ['security_file'],
            'level': 'WARNING',
            'propagate': True,
        },
    },
}
```

#### **Failed Login Attempts**
```python
# Custom authentication - track failed attempts
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            # Log successful login
            logger.info(f"Successful login: {request.data.get('email')}")
            return response
        except AuthenticationFailed as e:
            # Log failed login attempt
            logger.warning(f"Failed login attempt: {request.data.get('email')}")
            raise e
```

### **Production Saugumo Gairės**

#### **SSL/TLS Konfigūracija**
```nginx
# Nginx SSL configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### **Firewall Konfigūracija**
```bash
# UFW firewall rules
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 8000/tcp   # Block direct backend access
sudo ufw deny 3000/tcp   # Block direct frontend access
```

### **Saugumo Checklist**

#### **Development**
- [ ] JWT token expiration properly configured
- [ ] Role-based access control implemented
- [ ] Input validation on all forms
- [ ] SQL injection prevention (Django ORM)
- [ ] XSS prevention (React auto-escaping)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers set

#### **Production**
- [ ] SSL/TLS certificates installed
- [ ] Firewall configured
- [ ] Database access restricted
- [ ] Backup encryption enabled
- [ ] Security monitoring active
- [ ] Regular security updates
- [ ] Access logs monitored
- [ ] Failed login attempts tracked

## 🐳 **Docker Komandos**

### **Pagrindinės Komandos**
```bash
# Sistemos paleidimas
docker compose up -d                        # Paleisti visas paslaugas
docker compose down                         # Sustabdyti visas paslaugas
docker compose build --no-cache             # Perkurti visus image'us
docker compose logs -f                      # Peržiūrėti log'us

# Development vs Production
DEBUG=True docker compose up -d             # Development (Django dev server)
DEBUG=False docker compose up -d            # Production (Gunicorn)

# Backend valdymas
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py collectstatic --noinput
docker compose exec backend python manage.py shell

# Frontend valdymas
docker compose exec frontend npm run dev    # Development server
docker compose exec frontend npm run build  # Production build
docker compose exec frontend npm install    # Įdiegti naujus paketus

# Containerių valdymas
docker compose restart backend              # Perkrauti backend
docker compose restart frontend             # Perkrauti frontend
docker compose exec backend bash            # Shell į backend container
docker compose exec postgres psql -U a_dienynas_user -d a_dienynas  # DB prieiga

# Sveikatos patikrinimas
curl http://localhost:8000/api/health/      # Backend sveikata
curl http://localhost:3000/                 # Frontend sveikata
curl http://localhost/                      # Nginx proxy
```

### **Troubleshooting**
```bash
# Log'ų peržiūra
docker compose logs backend                 # Backend log'ai
docker compose logs frontend                # Frontend log'ai
docker compose logs postgres                # PostgreSQL log'ai
docker compose logs nginx                   # Nginx log'ai

# Containerių būsena
docker compose ps                           # Visų containerių būsena
docker compose exec backend python manage.py check  # Django patikrinimas

# Duomenų bazės valdymas
docker compose exec postgres psql -U a_dienynas_user -d a_dienynas
docker compose exec backend python manage.py dbshell
```

## 🐳 **Docker Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Django)      │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Nginx         │
                    │   (Reverse      │
                    │   Proxy)        │
                    │   Port: 80/443  │
                    └─────────────────┘
```

## 📁 **Projekto Struktūra**

```
A-DIENYNAS/
├── 📁 backend/                       # Django backend aplikacija
│   ├── 📁 core/                      # Django projektas
│   │   ├── settings.py               # Django nustatymai
│   │   ├── urls.py                   # Pagrindiniai URL'ai
│   │   └── wsgi.py                   # WSGI aplikacija
│   ├── 📁 users/                     # Vartotojų valdymas
│   ├── 📁 crm/                       # Santykių valdymas
│   ├── 📁 schedule/                  # Tvarkaraščio valdymas
│   ├── 📁 curriculum/                # Mokymo programos
│   ├── 📁 grades/                    # Pažymių valdymas
│   ├── 📁 plans/                     # Ugdymo planai
│   ├── 📁 violation/                 # Pažeidimų valdymas
│   ├── manage.py                     # Django CLI
│   ├── gunicorn.conf.py              # Gunicorn konfigūracija
│   └── entrypoint.sh                 # Container startup script
│   # Pastaba: requirements.txt yra root kataloge
├── 📁 frontend/                      # Next.js frontend aplikacija
│   ├── 📁 src/
│   │   ├── 📁 app/                   # Next.js App Router puslapiai
│   │   ├── 📁 components/            # UI komponentai
│   │   ├── 📁 hooks/                 # React hooks
│   │   ├── 📁 lib/                   # Utility funkcijos
│   │   └── 📁 types/                 # TypeScript tipai
│   ├── package.json                  # Node.js priklausomybės
│   └── next.config.ts                # Next.js konfigūracija
├── 📁 docker/                        # Docker konfigūracijos
│   ├── 📁 nginx/                     # Nginx konfigūracija
│   ├── 📁 backend/                   # Backend Docker
│   ├── 📁 frontend/                  # Frontend Docker
│   └── 📁 postgres/                  # PostgreSQL konfigūracija
├── 📁 scripts/                       # Deployment skriptai
├── 📁 backups/                       # Backup failai
├── 📁 logs/                          # Log failai
├── 📁 ATRADIMAI/                     # Papildomi projektai
├── docker-compose.yml                # Docker Compose konfigūracija
├── env.docker                        # Aplinkos kintamieji
├── requirements.txt                  # Python priklausomybės
└── README.md                         # Šis failas
```

## 🌐 **Server IP Configuration**

### **IP Address Management**
Sistema sukonfigūruota dirbti su keliais serverio IP adresais:

#### **Current Configuration**
- **Production Domain:** https://dienynas.mokyklaatradimai.lt
- **Local Development:** localhost, 127.0.0.1
- **Admin Access:** https://dienynas.mokyklaatradimai.lt/admin

### **Automatic IP Switching**
Naudokite automatizuotą script'ą serverio IP keitimui:

```bash
# Switch to current server IP
./scripts/switch-server-ip.sh current

# Switch to future server IP  
./scripts/switch-server-ip.sh future

# Switch to custom IP
./scripts/switch-server-ip.sh example.com

# Show current configuration
grep -E "(NEXT_PUBLIC_API_URL|ALLOWED_HOSTS)" .env
```

#### **Manual Configuration Files**
Jei reikia keisti rankiniu būdu:

**1. Nginx Configuration**
```bash
# Edit server_name in nginx config
nano docker/nginx/sites-enabled/a-dienynas.conf
# server_name localhost dienynas.mokyklaatradimai.lt;
```

**2. Environment Variables**
```bash
# Edit .env file
nano .env
# Update these lines:
# ALLOWED_HOSTS=localhost,127.0.0.1,dienynas.mokyklaatradimai.lt
# CORS_ALLOWED_ORIGINS=http://localhost:3000,https://dienynas.mokyklaatradimai.lt
# NEXT_PUBLIC_API_URL=https://dienynas.mokyklaatradimai.lt/api
```

**3. Restart Services**
```bash
# Apply configuration changes
docker compose down
docker compose up -d
```

### **Network Security Configuration**
- **Firewall Rules:** Allow ports 80/443 for configured IPs
- **CORS Policy:** Configured for both current and future IPs
- **Django ALLOWED_HOSTS:** Includes all configured server IPs
- **SSL Support:** Ready for HTTPS configuration

## 🔧 **Configuration**

### **Environment Variables**
Edit `env.docker` file to configure:
- Database passwords
- Django secret key
- API URLs
- Redis configuration
- SSL certificates (production)

### **Port Configuration**
- **80/443:** Nginx (HTTP/HTTPS) - External access
- **3000:** Frontend (Next.js) - Internal Docker network
- **8000:** Backend (Django + Gunicorn) - Internal Docker network
- **5432:** PostgreSQL - Internal Docker network
- **6379:** Redis - Internal Docker network

### **Network Access**
- **Production Domain:** https://dienynas.mokyklaatradimai.lt
- **Local Development:** localhost, 127.0.0.1

## 💾 **Backup Strategy**

### **Automated Backups**
```bash
# Create backup
./scripts/backup.sh

# Restore from backup
./scripts/restore.sh 20250125_143000

# Dry run restore
./scripts/restore.sh 20250125_143000 --dry-run
```

### **Backup Contents**
- **Database:** PostgreSQL dump
- **Uploads:** Media files
- **Logs:** Application logs
- **Redis:** Cache data
- **Configuration:** Docker configs

### **Backup Retention**
- Default: 7 days
- Configurable via `BACKUP_RETENTION_DAYS`
- Automatic cleanup of old backups

## 🛠️ **Maintenance**

### **System Monitoring**
```bash
# Show system status
./scripts/maintenance.sh

# Health checks
./scripts/maintenance.sh --health

# Resource usage
./scripts/maintenance.sh --resources

# Clean up resources
./scripts/maintenance.sh --cleanup

# Full maintenance with report
./scripts/maintenance.sh --all --report
```

### **Log Management**
- Logs stored in `./logs/` directory
- Automatic log rotation
- 7-day retention policy
- Structured logging format

## 🔒 **Security Features**

### **Network Security**
- Isolated Docker network
- Port exposure only where necessary
- Rate limiting on API endpoints
- CORS configuration

### **Application Security**
- JWT authentication
- Secure headers (XSS, CSRF protection)
- Input validation
- SQL injection prevention

### **Container Security**
- Non-root user execution
- Minimal base images
- Regular security updates
- Resource limits

## 📊 **Monitoring & Health Checks**

### **Health Check Endpoints**
- **Backend:** `/api/health/`
- **Frontend:** `/`
- **Nginx:** `/health`
- **Database:** PostgreSQL connection
- **Redis:** Ping command

### **Resource Monitoring**
- Container resource usage
- System resource monitoring
- Disk space monitoring
- Network traffic monitoring

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Containers Not Starting**
```bash
# Check logs
docker compose logs

# Check container status
docker compose ps

# Restart services
docker compose restart
```

#### **Database Connection Issues**
```bash
# Check PostgreSQL logs
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U a_dienynas_user -d a_dienynas
```

#### **Port Conflicts**
```bash
# Check port usage
sudo ss -tlnp | grep -E ':(80|443|3000|8000|5432)'

# Stop conflicting services
sudo systemctl stop apache2 nginx
```

### **Debug Commands**
```bash
# Container inspection
docker inspect <container-name>

# Network inspection
docker network inspect a-dienynas_a-dienynas-network

# Volume inspection
docker volume ls
docker volume inspect <volume-name>
```

## 📈 **Performance Optimization**

### **Container Optimization**
- Multi-stage builds
- Layer caching
- Resource limits
- Health checks

### **Application Optimization**
- Gzip compression
- Static file caching
- Database indexing
- Redis caching

### **System Optimization**
- SSD storage recommended
- Sufficient RAM allocation
- Network optimization
- Regular maintenance

## 🔄 **Updates & Upgrades**

### **Code Updates**
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d
```

### **Configuration Updates**
```bash
# Edit configuration files
nano docker/nginx/sites-enabled/a-dienynas.conf

# Reload services
docker compose restart nginx
```

### **Database Updates**
```bash
# Run migrations
docker compose exec backend python manage.py migrate

# Collect static files
docker compose exec backend python manage.py collectstatic --noinput
```

## 📋 **Deployment Checklist**

### **Pre-Deployment**
- [ ] Docker Engine installed
- [ ] Docker Compose installed
- [ ] Environment variables configured
- [ ] Google OAuth credentials configured
- [ ] Firewall configured
- [ ] SSL certificates ready (production)

### **Deployment**
- [ ] Containers start successfully
- [ ] Database migrations complete
- [ ] Static files collected
- [ ] Google OAuth setup completed
- [ ] Health checks pass
- [ ] Services accessible

### **Post-Deployment**
- [ ] Google OAuth login tested
- [ ] Backup scripts working
- [ ] Monitoring active
- [ ] Logs being collected
- [ ] Performance acceptable
- [ ] Security verified

## 🌐 **Production Deployment**

### **Google OAuth Setup**

Sistema naudoja Google OAuth prisijungimą. Po deployment reikia sukonfigūruoti OAuth:

```bash
# Automatinis OAuth setup
./scripts/setup-oauth.sh

# Arba rankiniu būdu:
docker-compose exec backend python manage.py setup_oauth
docker-compose exec backend python manage.py migrate sites
docker-compose restart nginx backend
```

**OAuth URLs:**
- Login: `https://dienynas.mokyklaatradimai.lt/accounts/google/login/`
- Callback: `https://dienynas.mokyklaatradimai.lt/accounts/google/login/callback/`

**Google Console konfigūracija:**
- Authorized JavaScript origins: `https://dienynas.mokyklaatradimai.lt`
- Authorized redirect URIs: `https://dienynas.mokyklaatradimai.lt/accounts/google/login/callback/`

### **SSL Configuration**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Firewall Configuration**
```bash
# Enable UFW
sudo ufw enable

# Allow necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Check status
sudo ufw status
```

### **Monitoring Setup**
```bash
# Set up log rotation
sudo nano /etc/logrotate.d/a-dienynas

# Configure system monitoring
sudo apt install htop iotop nethogs
```

## 📚 **Additional Resources**

### **Documentation**
- [Docker Documentation](https://docs.docker.com/)
- [Django Documentation](https://docs.djangoproject.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### **Troubleshooting Guides**
- [Docker Troubleshooting](https://docs.docker.com/config/daemon/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [PostgreSQL Administration](https://www.postgresql.org/docs/current/admin.html)

---

**Last Updated:** 2025-09-09  
**Version:** 2.0.0  
**Maintainer:** IT Engineering Team

---

*This documentation is part of the A-DIENYNAS project. For questions or support, please contact the IT engineering team.*

