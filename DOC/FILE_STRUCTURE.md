# A-DIENYNAS - Projekto failų ir aplankalų struktūra

## 📁 Pagrindinė projekto struktūra

```
A-DIENYNAS/
├── 📱 frontend/                    # Next.js 15 frontend aplikacija
├── ⚙️ backend/                     # Django 5.2 REST API backend
├── 📚 DOC/                        # Projekto dokumentacija
├── 🔧 ADITIONAL/                  # Papildomi import skriptai ir duomenys
├── 📄 README.md                   # Pagrindinė projekto dokumentacija
├── 📄 requirements.txt            # Python priklausomybės (backend)
├── 📄 package.json               # Node.js priklausomybės (root level)
├── 📄 package-lock.json          # Node.js priklausomybių lock failas
├── 📄 Pakeitimo_planas.md        # Projekto keitimų ir vystymo planas
├── 📄 backup_before_reorganization.json # Duomenų atsarginė kopija
├── 📄 .cursorignore              # Cursor IDE ignoruojamų failų sąrašas
├── 📄 .cursorrules               # Cursor IDE taisyklės ir konfigūracija
├── 📄 .gitignore                 # Git ignoruojamų failų ir aplankų sąrašas
└── 📁 .cursor/                   # Cursor IDE konfigūracijos aplankas
    └── 📄 rules                  # Papildomos Cursor taisyklės
```

---

## 🔧 ADITIONAL - Duomenų importavimo skriptai

```
ADITIONAL/
├── 📄 competencies.json                    # Kompetencijų duomenų rinkinys JSON formatu
├── 📄 competency_atcheve_example.json      # Kompetencijų pasiekimų pavyzdys
├── 📄 competency_example.json              # Kompetencijos struktūros pavyzdys
├── 📄 generate_student_subject_levels.py   # Skriptas studentų dalykų lygių generavimui
├── 📄 import_competencies.py               # Kompetencijų importavimo skriptas
├── 📄 import_competency_atcheves.py        # Kompetencijų pasiekimų importas
├── 📄 import_lessons.py                    # Pamokų duomenų importavimo skriptas
├── 📄 import_levels.py                     # Mokymosi lygių importavimo skriptas
├── 📄 import_skills.py                     # Įgūdžių duomenų importavimo skriptas
├── 📄 import_students.py                   # Studentų duomenų importavimo skriptas
├── 📄 import_subjects_levels.py            # Dalykų-lygių ryšių importavimo skriptas
├── 📄 import_subjects.py                   # Dalykų duomenų importavimo skriptas
├── 📄 import_virtues.py                    # Dorybių duomenų importavimo skriptas
├── 📄 lesson_example.json                  # Pamokos struktūros pavyzdys JSON formatu
├── 📄 lesson_json_documentation.md         # Pamokų JSON duomenų struktūros dokumentacija
├── 📄 levels.json                          # Mokymosi lygių duomenų rinkinys
├── 📄 README_competencies.md               # Kompetencijų sistemos dokumentacija
├── 📄 skill_example.json                   # Įgūdžio struktūros pavyzdys
├── 📄 students.json                        # Studentų duomenų rinkinys
├── 📄 subjects.json                        # Dalykų duomenų rinkinys
└── 📄 virtues.json                         # Dorybių duomenų rinkinys
```

---

## ⚙️ BACKEND - Django REST API aplikacija

### Backend pagrindinė struktūra
```
backend/
├── ⚙️ manage.py                  # Django projekto valdymo komandų failas
├── 🏗️ core/                     # Pagrindinė Django projekto konfigūracija
├── 👥 users/                     # Vartotojų valdymo aplikacija
├── 👨‍👩‍👧‍👦 crm/                     # Customer Relationship Management aplikacija
├── 📚 curriculum/                # Mokymo programos ir turinio aplikacija
├── 📋 plans/                     # Ugdymo planų valdymo aplikacija
├── 🎯 grades/                    # Pažymių ir vertinimų sistema
└── 📅 schedule/                  # Tvarkaraščių valdymo aplikacija
```

### Core aplikacija (Django konfigūracija)
```
backend/core/
├── 📄 __init__.py                   # Python paketo inicializacijos failas
├── 📄 asgi.py                       # ASGI konfigūracija asynchroniniam serveriui
├── 📄 settings.py                   # Django projekto pagrindiniai nustatymai
├── 📄 urls.py                       # Pagrindinis URL routing visoms aplikacijoms
└── 📄 wsgi.py                       # WSGI konfigūracija tradicioniam serveriui
```

### Users aplikacija (Vartotojų valdymas)
```
backend/users/
├── 📄 __init__.py                   # Python paketo inicializacijos failas
├── 📄 admin.py                      # Django admin konfigūracija vartotojų valdymui
├── 📄 apps.py                       # Aplikacijos konfigūracijos nustatymai
├── 📄 models.py                     # Vartotojų duomenų modeliai ir User išplėtimai
├── 📄 serializers.py                # DRF serializers vartotojų duomenų apdorojimui
├── 📄 tests.py                      # Unit testai vartotojų funkcionalumui
├── 📄 urls.py                       # URL routing vartotojų API endpoint'ams
├── 📄 views.py                      # API views vartotojų valdymo logikai
└── 📁 migrations/                   # Duomenų bazės migracijos
    ├── 📄 __init__.py               # Migracijų paketo inicializacija
    └── 📄 0001_initial.py           # Pradinė vartotojų lentelių migracija
```

### CRM aplikacija (Customer Relationship Management)
```
backend/crm/
├── 📄 __init__.py                   # Python paketo inicializacijos failas
├── 📄 admin.py                      # Admin interface studentų, tėvų, kuratorių valdymui
├── 📄 apps.py                       # CRM aplikacijos konfigūracijos nustatymai
├── 📄 models.py                     # Studentų, tėvų, kuratorių modeliai ir ryšiai
├── 📄 serializers.py                # DRF serializers CRM duomenų apdorojimui
├── 📄 tests.py                      # Unit testai CRM funkcionalumui
├── 📄 urls.py                       # URL routing CRM API endpoint'ams
├── 📄 views.py                      # API views ryšių ir vartotojų valdymo logikai
└── 📁 migrations/                   # Duomenų bazės migracijos
    ├── 📄 __init__.py               # Migracijų paketo inicializacija
    ├── 📄 0001_initial.py           # Pradinė CRM lentelių migracija
    └── 📄 0002_initial.py           # Papildoma CRM ryšių migracija
```

### Curriculum aplikacija (Mokymo programos)
```
backend/curriculum/
├── 📄 __init__.py                   # Python paketo inicializacijos failas
├── 📄 admin.py                      # Admin interface dalykų, pamokų, kompetencijų valdymui
├── 📄 apps.py                       # Curriculum aplikacijos konfigūracija
├── 📄 models.py                     # Dalykų, lygių, pamokų, įgūdžių, kompetencijų modeliai
├── 📄 serializers.py                # DRF serializers mokymo turinio duomenų apdorojimui
├── 📄 tests.py                      # Unit testai curriculum funkcionalumui
├── 📄 urls.py                       # URL routing curriculum API endpoint'ams
├── 📄 views.py                      # API views mokymo turinio valdymo logikai
└── 📁 migrations/                   # Duomenų bazės migracijos
    ├── 📄 __init__.py               # Migracijų paketo inicializacija
    ├── 📄 0001_initial.py           # Pradinė curriculum lentelių migracija
    ├── 📄 0002_initial.py           # Papildoma curriculum struktūros migracija
    ├── 📄 0003_remove_lesson_description_lesson_content.py # Pamokų aprašymo perkėlimas į content lauką
    └── 📄 0004_remove_old_lesson_fields.py # Senų pamokų laukų pašalinimas
```

### Plans aplikacija (Ugdymo planai)
```
backend/plans/
├── 📄 __init__.py                   # Python paketo inicializacijos failas
├── 📄 admin.py                      # Admin interface ugdymo planų valdymui
├── 📄 apps.py                       # Plans aplikacijos konfigūracija
├── 📄 models.py                     # LessonSequence ir LessonSequenceItem modeliai
├── 📄 serializers.py                # DRF serializers planų duomenų apdorojimui (create/read skirtingi)
├── 📄 tests.py                      # Unit testai planų funkcionalumui
├── 📄 urls.py                       # URL routing planų API endpoint'ams
├── 📄 views.py                      # API views planų valdymo logikai su optimizacijomis
└── 📁 migrations/                   # Duomenų bazės migracijos
    ├── 📄 __init__.py               # Migracijų paketo inicializacija
    └── 📄 0001_initial.py           # Pradinė planų lentelių migracija
```

### Grades aplikacija (Pažymiai)
```
backend/grades/
├── 📄 __init__.py                   # Python paketo inicializacijos failas
├── 📄 admin.py                      # Admin interface pažymių valdymui
├── 📄 apps.py                       # Grades aplikacijos konfigūracija
├── 📄 models.py                     # Pažymių ir vertinimų duomenų modeliai
├── 📄 serializers.py                # DRF serializers pažymių duomenų apdorojimui
├── 📄 tests.py                      # Unit testai pažymių funkcionalumui
├── 📄 urls.py                       # URL routing pažymių API endpoint'ams
├── 📄 views.py                      # API views pažymių valdymo logikai
└── 📁 migrations/                   # Duomenų bazės migracijos
    ├── 📄 __init__.py               # Migracijų paketo inicializacija
    ├── 📄 0001_initial.py           # Pradinė pažymių lentelių migracija
    └── 📄 0002_initial.py           # Papildoma pažymių struktūros migracija
```

### Schedule aplikacija (Tvarkaraščiai)
```
backend/schedule/
├── 📄 __init__.py                   # Python paketo inicializacijos failas
├── 📄 admin.py                      # Admin interface tvarkaraščių valdymui
├── 📄 apps.py                       # Schedule aplikacijos konfigūracija
├── 📄 models.py                     # Tvarkaraščių, periodų ir globalių tvarkaraščių modeliai
├── 📄 serializers.py                # DRF serializers tvarkaraščių duomenų apdorojimui
├── 📄 tests.py                      # Unit testai tvarkaraščių funkcionalumui
├── 📄 urls.py                       # URL routing tvarkaraščių API endpoint'ams
├── 📄 views.py                      # API views tvarkaraščių valdymo logikai
└── 📁 migrations/                   # Duomenų bazės migracijos
    ├── 📄 __init__.py               # Migracijų paketo inicializacija
    ├── 📄 0001_initial.py           # Pradinė tvarkaraščių lentelių migracija
    ├── 📄 0002_initial.py           # Papildoma tvarkaraščių struktūros migracija
    ├── 📄 0003_add_period_name_field.py # Periodų pavadinimų laukų pridėjimas
    ├── 📄 0004_limit_user_to_mentors.py # Vartotojų apribojimas tik mentoriams
    ├── 📄 0005_remove_limit_choices_to.py # Pasirinkimų apribojimų pašalinimas
    ├── 📄 0006_make_weekday_auto_and_lesson_optional.py # Savaitės dienų automatinis nustatymas
    ├── 📄 0007_change_period_ordering_to_starttime.py # Periodų rikiavimas pagal pradžios laiką
    └── 📄 0008_remove_globalschedule_lesson.py # Pamokos lauko pašalinimas iš globalaus tvarkaraščio
```

---

## 🖥️ FRONTEND - Next.js aplikacija

### Frontend pagrindinė struktūra
```
frontend/
├── 📦 package.json               # Node.js priklausomybės ir npm skriptai
├── 📦 package-lock.json          # Node.js priklausomybių versijų lock failas
├── ⚙️ next.config.ts             # Next.js konfigūracijos nustatymai
├── ⚙️ tsconfig.json              # TypeScript kompiliavimo nustatymai
├── ⚙️ eslint.config.mjs          # ESLint kodo kokybės tikrinimo taisyklės
├── ⚙️ postcss.config.mjs         # PostCSS CSS apdorojimo konfigūracija
├── ⚙️ next-env.d.ts              # Next.js TypeScript tipo deklaracijos
├── 📄 README.md                  # Frontend aplikacijos dokumentacija
├── 📄 OPTIMIZATION.md            # Frontend optimizavimo gidas ir rekomendacijos
├── 📁 public/                    # Statiniai failai (SVG, JS bibliotekos)
└── 📁 src/                       # Pagrindinis šaltinio kodas
```

### Public aplankas (Statiniai failai)
```
frontend/public/
├── 🎯 file.svg                   # Failo ikonos SVG grafika
├── 🌐 globe.svg                  # Globuso ikonos SVG grafika
├── ▶️ next.svg                   # Next.js logotipo SVG grafika
├── ✅ vercel.svg                 # Vercel platformos logotipo SVG
├── 🪟 window.svg                 # Lango ikonos SVG grafika
├── 📊 dataTables.js              # DataTables biblioteka lentelių funkcionalumui
└── 📚 jquery-3.7.1.js           # jQuery biblioteka DOM manipuliacijoms
```

### Src struktūra (Šaltinio kodas)
```
frontend/src/
├── 📁 app/                       # Next.js App Router puslapiai ir layout'ai
├── 📁 components/                # Daugkartinio naudojimo React komponentai
├── 📁 hooks/                     # Custom React hooks duomenų valdymui
├── 📁 lib/                       # Utility funkcijos ir API integracijos
├── 📁 styles/                    # CSS stilių failai
└── 📁 types/                     # TypeScript tipo deklaracijos
```

---

## 📱 APP ROUTER - Puslapių struktūra

```
frontend/src/app/
├── 🏠 page.tsx                   # Pagrindinis puslapis (/)
├── 🎨 globals.css                # Globalūs CSS stiliai su Tailwind importu
├── 📄 layout.tsx                 # App layout komponentas su navigacija
├── 🎯 favicon.ico                # Svetainės favicon ikonėlė
├── 🔐 auth/                      # Autentifikacijos puslapiai
│   └── login/
│       └── 📄 page.tsx           # Prisijungimo puslapis (/auth/login)
├── 🏛️ admin/
│   └── 📄 page.tsx               # Administratorių valdymo puslapis (/admin)
└── 📊 dashboard/                 # Dashboard sistema skirtingoms rolėms
    ├── 📄 page.tsx               # Pagrindinis dashboard puslapis (/)
    ├── 👨‍🏫 mentors/              # MENTORIŲ VALDYMO SKYRIUS
    │   ├── 📄 page.tsx           # Mentorių dashboard (/dashboard/mentors)
    │   ├── 📚 lessons/           # Pamokų valdymo sekcija
    │   │   ├── 📄 page.tsx       # Pamokų sąrašas (/dashboard/mentors/lessons)
    │   │   ├── create/
    │   │   │   └── 📄 page.tsx   # Naujos pamokos kūrimas (/dashboard/mentors/lessons/create)
    │   │   └── edit/
    │   │       └── [id]/
    │   │           └── 📄 page.tsx # Pamokos redagavimas (/dashboard/mentors/lessons/edit/[id])
    │   ├── 📋 plans/             # Ugdymo planų valdymo sekcija
    │   │   ├── 📄 page.tsx       # Planų sąrašas (/dashboard/mentors/plans)
    │   │   ├── assign/
    │   │   │   └── 📄 page.tsx   # Plano priskyrimas (/dashboard/mentors/plans/assign)
    │   │   ├── create/
    │   │   │   └── 📄 page.tsx   # Naujo plano kūrimas (/dashboard/mentors/plans/create)
    │   │   └── edit/
    │   │       └── [id]/
    │   │           └── 📄 page.tsx # Plano redagavimas (/dashboard/mentors/plans/edit/[id])
    │   ├── 📅 schedule/
    │   │   └── 📄 page.tsx       # Tvarkaraščių valdymas (/dashboard/mentors/schedule)
    │   └── 👥 students/
    │       └── 📄 page.tsx       # Studentų valdymas (/dashboard/mentors/students)
    ├── 👥 students/
    │   └── 📄 page.tsx           # Studentų skyrius (/dashboard/students)
    ├── 👨‍👩‍👧‍👦 parents/
    │   └── 📄 page.tsx           # Tėvų skyrius (/dashboard/parents)
    └── 👨‍💼 curators/
        └── 📄 page.tsx           # Kuratorių skyrius (/dashboard/curators)
```

---

## 🧩 KOMPONENTŲ SISTEMA

```
frontend/src/components/
├── 🔐 auth/                      # Autentifikacijos komponentai
│   └── 📄 ClientAuthGuard.tsx    # Kliento autentifikacijos apsaugos komponentas
├── 📊 dashboard/                 # Dashboard specifiniai komponentai
│   ├── 📄 ScheduleCard.tsx       # Tvarkaraščio kortelės komponentas
│   ├── 📄 TableCell.tsx          # Lentelės ląstelės komponentas su stilizavimu
│   └── 📄 WeeklySchedule.tsx     # Savaitės tvarkaraščio rodymo komponentas
├── 📋 DataTable/                 # Duomenų lentelių sistemos komponentai
│   ├── 📄 index.ts               # Komponentų eksportų failas
│   ├── 📄 FilterRow.tsx          # Filtrų eilutės komponentas su paieška
│   ├── 📄 LocalDataTable.tsx     # Lokali duomenų lentelė be API integracijos
│   └── 📄 ReactDataTable.tsx     # React duomenų lentelė su API integracija
├── 📝 forms/                     # Formų komponentai (tuščias aplankas)
├── 🎨 layout/                    # Layout ir navigacijos komponentai
│   └── 📄 Header.tsx             # Navigacijos antraštės komponentas
└── 🎛️ ui/                       # Baziniai UI komponentų biblioteka
    ├── 📄 Button.tsx             # Universalus mygtuko komponentas
    ├── 📄 Card.tsx               # Kortelės komponentas su šešėliais
    ├── 📄 DynamicList.tsx        # Dinaminiai sąrašai su drag & drop funkcionalumu
    ├── 📄 Input.tsx              # Įvesties laukų komponentas su validacija
    ├── 📄 LoadingSpinner.tsx     # Užkrovimo indikatorių komponentas
    ├── 📄 MultiSelect.tsx        # Daugerio pasirinkimo laukų komponentas
    ├── 📄 Select.tsx             # Pasirinkimo laukų komponentas
    └── 📄 Textarea.tsx           # Teksto sričių komponentas
```

---

## 🔗 HOOKS IR UTILIAI

```
frontend/src/
├── hooks/                        # Custom React hooks duomenų valdymui
│   ├── 📄 useAuth.ts             # Autentifikacijos logikos hook su Zustand
│   ├── 📄 useCurriculum.ts       # Mokymo programos duomenų valdymo hook
│   ├── 📄 useGrades.ts           # Pažymių valdymo hook su CRUD operacijomis
│   ├── 📄 useLevels.ts           # Mokymosi lygių valdymo hook
│   ├── 📄 usePeriods.ts          # Pamokų periodų valdymo hook
│   └── 📄 useSchedule.ts         # Tvarkaraščių logikos valdymo hook
├── lib/                          # Utility funkcijos ir integracijos
│   ├── 📄 api.ts                 # Axios API klientas su interceptors
│   ├── 📄 types.ts               # TypeScript tipo definicijos visam projektui
│   └── 📄 utils.ts               # Bendros utility funkcijos
├── styles/
│   └── 📄 datatables.css         # DataTables bibliotekos stilių teminimas
└── types/
    └── 📄 jquery.d.ts            # jQuery TypeScript tipo deklaracijos
```

---

## 📚 DOKUMENTACIJA

```
DOC/
├── 📄 FILE_STRUCTURE.md          # Šis failas - išsami projekto struktūros dokumentacija
├── 📄 DATA-TABLE-COMPONENT.md    # DataTable komponento naudojimo dokumentacija
└── 📄 MCP.md                     # MCP protokolo integracijos dokumentacija
```

---

## 🛠️ TECHNOLOGIJŲ STACK

### Frontend technologijos:
- **Next.js 15** - React framework su App Router architektūra
- **TypeScript** - Tipų saugumas ir geresnė kodo kokybė
- **Tailwind CSS 4** - Utility-first CSS framework stilizavimui
- **Zustand** - Lengvas state management be boilerplate kodo
- **Axios** - HTTP klientas API užklausoms su interceptors
- **React Hook Form** - Formų valdymas su validacija
- **Lucide React** - Moderna ikonų biblioteka

### Backend technologijos:
- **Django 5.2** - Python web framework su ORM
- **Django REST Framework** - RESTful API kūrimui
- **Django Simple JWT** - JWT autentifikacijos sistema
- **SQLite** - Duomenų bazė development aplinkoje
- **Django CORS Headers** - Cross-origin resource sharing

### Duomenų bazės struktūra:
- **Users** - Vartotojų valdymas su role-based permissions
- **CRM** - Studentai, tėvai, kuratoriai ir jų tarpusavio ryšiai
- **Curriculum** - Dalykai, lygiai, pamokos, įgūdžiai, kompetencijos
- **Plans** - Ugdymo planai su pamokų sekomis ir ordenavimo logika
- **Grades** - Pažymių ir vertinimų sistema
- **Schedule** - Tvarkaraščių valdymas su periodais ir automatizacija

---

## 🔄 API Endpoints struktūra

### Autentifikacija:
- `POST /api/auth/login/` - Vartotojo prisijungimas su JWT token
- `POST /api/auth/refresh/` - JWT token atnaujinimas

### Vartotojų valdymas:
- `GET /api/users/` - Vartotojų sąrašas su rolių filtravimu
- `POST /api/users/` - Naujo vartotojo kūrimas
- `PUT /api/users/{id}/` - Vartotojo duomenų atnaujinimas
- `DELETE /api/users/{id}/` - Vartotojo šalinimas

### CRM funkcijos:
- `GET /api/crm/student-parents/` - Studentų-tėvų ryšiai
- `GET /api/crm/student-curators/` - Studentų-kuratorių ryšiai
- `GET /api/crm/student-subject-levels/` - Studentų dalykų lygiai
- `GET /api/crm/mentor-subjects/` - Mentorų priskirtų dalykų sąrašas

### Mokymo programos:
- `GET /api/curriculum/subjects/` - Dalykų sąrašas
- `GET /api/curriculum/levels/` - Mokymosi lygių sąrašas
- `GET /api/curriculum/lessons/` - Pamokų sąrašas su filtravimu
- `GET /api/curriculum/skills/` - Įgūdžių sąrašas
- `GET /api/curriculum/competencies/` - Kompetencijų sąrašas

### Ugdymo planai:
- `GET /api/plans/sequences/` - Ugdymo planų sąrašas
- `POST /api/plans/sequences/` - Naujo plano kūrimas
- `PUT /api/plans/sequences/{id}/` - Plano redagavimas
- `DELETE /api/plans/sequences/{id}/` - Plano šalinimas
- `GET /api/plans/sequences/subjects/` - Dalykų sąrašas planams
- `GET /api/plans/sequences/levels/` - Lygių sąrašas planams

### Pažymiai:
- `GET /api/grades/` - Pažymių sąrašas
- `POST /api/grades/` - Naujo pažymio išstatymas
- `PUT /api/grades/{id}/` - Pažymio redagavimas

### Tvarkaraščiai:
- `GET /api/schedule/periods/` - Pamokų periodų sąrašas
- `GET /api/schedule/global/` - Globalus tvarkaraštis
- `POST /api/schedule/global/` - Naujo tvarkaraščio įrašo kūrimas

---

## 🎯 Pagrindinės sistemos funkcijos

### Autentifikacija ir autorizacija:
- 🔐 **JWT token** autentifikacija su automatišku atnaujinimu
- 👥 **Role-based access control** - studentai, tėvai, kuratoriai, mentoriai, adminai
- 🛡️ **Route protection** su ClientAuthGuard komponentu
- 🔄 **Persistent login** su Zustand persistence

### UI/UX funkcijos:
- 📱 **Responsive dizainas** su Tailwind CSS grid sistema
- 🎨 **Moderna UI** su card-based layout ir shadow effects
- 📊 **Interaktyvios lentelės** su filtravimu, paieška ir rikiavmu
- 🎯 **Loading states** su spinner komponentais
- ✨ **Smooth animations** ir hover effects

### Duomenų valdymas:
- 🔄 **Real-time updates** be papildomų perkrovimų
- 📝 **Form validation** su React Hook Form
- 🗃️ **CRUD operacijos** visoms pagrindinėms entitetėms
- 🔍 **Advanced filtering** ir search funkcionalumas
- 📈 **Performance optimization** su lazy loading ir caching

### Ugdymo proceso valdymas:
- 📚 **Pamokų kūrimas** su JSON content struktūra
- 📋 **Ugdymo planų valdymas** su drag & drop pamokų sequence
- 📊 **Pažymių sistema** su dalykų ir lygių atskyrimu
- 📅 **Tvarkaraščių sudarymas** su automatine konfliktų detekcija
- 🎯 **Kompetencijų tracking** ir progress monitoringas

---

*Paskutinį kartą atnaujinta: 2025-08-12*  
*Projekto versija: A-DIENYNAS v1.0*  
*Dokumentacijos versija: 2.0 (su pilna struktūra ir aprašymais)*