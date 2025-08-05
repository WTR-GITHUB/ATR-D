# 🔄 A-DIENYNAS Backend Reorganizacijos Planas

## 📋 **Planas: CRM → Modulinė Architektūra**

### 🎯 **Tikslas**
Reorganizuoti backend'ą iš vieno CRM app'o į modulinę architektūrą su atskirais app'ais:
- `core` - pagrindiniai nustatymai ir User modelis
- `crm` - vartotojų santykiai
- `schedule` - tvarkaraštis (naujas)
- `curriculum` - dalykai ir pamokos
- `grades` - pažymiai

---

## 📝 **1 FAZĖ: Pasiruošimas**

### 1.1 Dabartinės struktūros analizė
- [ ] Peržiūrėti visus dabartinius modelius `crm/models.py`
- [ ] Identifikuoti priklausomybes tarp modelių
- [ ] Sukurti duomenų migracijos planą
- [ ] Nustatyti, kurie modeliai kur eis

### 1.2 Backup'as
- [ ] Sukurti git branch: `reorganization-backup`
- [ ] Eksportuoti dabartinius duomenis: `python manage.py dumpdata > backup.json`
- [ ] Patikrinti, kad visi testai praeina

---

## 🏗️ **2 FAZĖ: Core App Sukūrimas**

### 2.1 Core app struktūra
```
backend/core/
├── __init__.py
├── apps.py
├── models.py → User modelis
├── admin.py
├── serializers.py
├── views.py
├── urls.py
└── migrations/
```

### 2.2 User modelio perkėlimas
- [ ] Perkelti `User` modelį iš `crm/models.py` į `core/models.py`
- [ ] Atnaujinti `settings.py` su `AUTH_USER_MODEL = 'core.User'`
- [ ] Sukurti `core/serializers.py` su `UserSerializer`
- [ ] Sukurti `core/views.py` su `UserViewSet`
- [ ] Sukurti `core/urls.py`
- [ ] Sukurti `core/admin.py`

### 2.3 Core app registravimas
- [ ] Pridėti `core` į `INSTALLED_APPS` settings.py
- [ ] Sukurti ir vykdyti migracijas: `python manage.py makemigrations core`
- [ ] Testuoti User modelio veikimą

---

## 📅 **3 FAZĖ: Schedule App Sukūrimas**

### 3.1 Schedule app struktūra
```
backend/schedule/
├── __init__.py
├── apps.py
├── models.py → GlobalSchedule, Period, Classroom
├── admin.py
├── serializers.py
├── views.py
├── urls.py
└── migrations/
```

### 3.2 Schedule modelių sukūrimas
- [ ] Sukurti `Period` modelį (starttime, endtime, duration)
- [ ] Sukurti `Classroom` modelį (name, description)
- [ ] Sukurti `GlobalSchedule` modelį su visais reikalingais laukais
- [ ] Pridėti validacijas ir komentarus

### 3.3 Schedule API sukūrimas
- [ ] Sukurti `schedule/serializers.py`
- [ ] Sukurti `schedule/views.py` su ViewSet'ais
- [ ] Sukurti `schedule/urls.py`
- [ ] Sukurti `schedule/admin.py`

### 3.4 Schedule app registravimas
- [ ] Pridėti `schedule` į `INSTALLED_APPS`
- [ ] Sukurti migracijas: `python manage.py makemigrations schedule`
- [ ] Testuoti Schedule API

---

## 📚 **4 FAZĖ: Curriculum App Sukūrimas**

### 4.1 Curriculum app struktūra
```
backend/curriculum/
├── __init__.py
├── apps.py
├── models.py → Subject, Level, Lesson, Skill, Competency, Virtue
├── admin.py
├── serializers.py
├── views.py
├── urls.py
└── migrations/
```

### 4.2 Curriculum modelių perkėlimas
- [ ] Perkelti `Subject` iš `crm/models.py` į `curriculum/models.py`
- [ ] Perkelti `Level` iš `crm/models.py` į `curriculum/models.py`
- [ ] Perkelti `Lesson` iš `crm/models.py` į `curriculum/models.py`
- [ ] Perkelti `Skill` iš `crm/models.py` į `curriculum/models.py`
- [ ] Perkelti `Competency` iš `crm/models.py` į `curriculum/models.py`
- [ ] Perkelti `Virtue` iš `crm/models.py` į `curriculum/models.py`
- [ ] Perkelti `CompetencyAtcheve` iš `crm/models.py` į `curriculum/models.py`

### 4.3 Curriculum API perkėlimas
- [ ] Perkelti serializers iš `crm/serializers.py` į `curriculum/serializers.py`
- [ ] Perkelti views iš `crm/views.py` į `curriculum/views.py`
- [ ] Sukurti `curriculum/urls.py`
- [ ] Sukurti `curriculum/admin.py`

### 4.4 Curriculum app registravimas
- [ ] Pridėti `curriculum` į `INSTALLED_APPS`
- [ ] Sukurti migracijas: `python manage.py makemigrations curriculum`
- [ ] Testuoti Curriculum API

---

## 📊 **5 FAZĖ: Grades App Sukūrimas**

### 5.1 Grades app struktūra
```
backend/grades/
├── __init__.py
├── apps.py
├── models.py → Grade
├── admin.py
├── serializers.py
├── views.py
├── urls.py
└── migrations/
```

### 5.2 Grade modelio perkėlimas
- [ ] Perkelti `Grade` iš `crm/models.py` į `grades/models.py`
- [ ] Atnaujinti ForeignKey nuorodas į `settings.AUTH_USER_MODEL`

### 5.3 Grades API perkėlimas
- [ ] Perkelti `GradeSerializer` iš `crm/serializers.py` į `grades/serializers.py`
- [ ] Perkelti `GradeViewSet` iš `crm/views.py` į `grades/views.py`
- [ ] Sukurti `grades/urls.py`
- [ ] Sukurti `grades/admin.py`

### 5.4 Grades app registravimas
- [ ] Pridėti `grades` į `INSTALLED_APPS`
- [ ] Sukurti migracijas: `python manage.py makemigrations grades`
- [ ] Testuoti Grades API

---

## 👥 **6 FAZĖ: CRM App Atnaujinimas**

### 6.1 CRM modelių palikimas
- [ ] Palikti tik santykių modelius `crm/models.py`:
  - `StudentParent`
  - `StudentCurator`
  - `StudentSubjectLevel`
  - `MentorSubject`

### 6.2 CRM API atnaujinimas
- [ ] Atnaujinti `crm/serializers.py` - palikti tik santykių serializers
- [ ] Atnaujinti `crm/views.py` - palikti tik santykių views
- [ ] Atnaujinti `crm/urls.py` - palikti tik santykių URLs
- [ ] Atnaujinti `crm/admin.py`

### 6.3 CRM app testavimas
- [ ] Testuoti CRM API po pakeitimų
- [ ] Patikrinti, kad visi santykiai veikia

---

## 🔗 **7 FAZĖ: URL Integracija**

### 7.1 Pagrindinio URL atnaujinimas
- [ ] Atnaujinti `backend/core/urls.py` su visais app'ų URL'ais
- [ ] Sukurti URL struktūrą:
  ```
  /api/core/ → User endpoints
  /api/crm/ → santykių endpoints
  /api/schedule/ → tvarkaraščio endpoints
  /api/curriculum/ → dalykų endpoints
  /api/grades/ → pažymių endpoints
  ```

### 7.2 URL testavimas
- [ ] Testuoti visus endpoint'us
- [ ] Patikrinti, kad autentifikacija veikia
- [ ] Patikrinti permissions

---

## 🗄️ **8 FAZĖ: Duomenų Migracija**

### 8.1 Migracijų sukūrimas
- [ ] Sukurti migracijas visiems app'ams: `python manage.py makemigrations`
- [ ] Patikrinti migracijų failus
- [ ] Sukurti backup prieš migraciją

### 8.2 Migracijos vykdymas
- [ ] Vykdyti migracijas: `python manage.py migrate`
- [ ] Patikrinti, kad visi duomenys perkelti
- [ ] Testuoti visus modelius

### 8.3 Duomenų validacija
- [ ] Patikrinti, kad visi ForeignKey veikia
- [ ] Patikrinti, kad visi ManyToMany veikia
- [ ] Patikrinti, kad visi custom metodai veikia

---

## 🧪 **9 FAZĖ: Testavimas**

### 9.1 API testavimas
- [ ] Testuoti visus CRUD operacijas
- [ ] Testuoti permissions ir autentifikaciją
- [ ] Testuoti validacijas
- [ ] Testuoti serializers

### 9.2 Integracijos testavimas
- [ ] Testuoti tarp app'ų ryšius
- [ ] Testuoti ForeignKey veikimą
- [ ] Testuoti ManyToMany veikimą
- [ ] Testuoti custom metodų veikimą

### 9.3 Frontend testavimas
- [ ] Patikrinti, kad frontend veikia su nauja struktūra
- [ ] Testuoti visus frontend endpoint'us
- [ ] Patikrinti, kad autentifikacija veikia
- [ ] Testuoti naujus komponentus
- [ ] Testuoti naujus puslapius

---

## 🖥️ **9.5 FAZĖ: Frontend Atnaujinimas**

### 9.5.1 API endpoint'ų atnaujinimas
- [ ] Atnaujinti `frontend/src/lib/api.ts` su naujais endpoint'ais
- [ ] Sukurti atskirus API klientus kiekvienam moduliui:
  - `api/core.ts` - User endpoints
  - `api/crm.ts` - santykių endpoints
  - `api/schedule.ts` - tvarkaraščio endpoints
  - `api/curriculum.ts` - dalykų endpoints
  - `api/grades.ts` - pažymių endpoints

### 9.5.2 Komponentų atnaujinimas
- [ ] Atnaujinti `frontend/src/components/dashboard/` komponentus
- [ ] Atnaujinti `frontend/src/app/dashboard/` puslapius
- [ ] Pridėti naujus komponentus tvarkaraščiui:
  - `ScheduleCalendar.tsx`
  - `ScheduleForm.tsx`
  - `PeriodSelector.tsx`
  - `ClassroomSelector.tsx`

### 9.5.3 Puslapių atnaujinimas
- [ ] Atnaujinti `frontend/src/app/dashboard/mentors/lessons/` puslapius
- [ ] Atnaujinti `frontend/src/app/dashboard/mentors/curriculum/` puslapius
- [ ] Sukurti naujus puslapius tvarkaraščiui:
  - `frontend/src/app/dashboard/schedule/` - tvarkaraščio valdymas
  - `frontend/src/app/dashboard/schedule/create/` - tvarkaraščio kūrimas
  - `frontend/src/app/dashboard/schedule/edit/[id]/` - tvarkaraščio redagavimas

### 9.5.4 Tipų atnaujinimas
- [ ] Atnaujinti `frontend/src/types/` su naujais tipais:
  - `Schedule.ts` - tvarkaraščio tipai
  - `Period.ts` - periodų tipai
  - `Classroom.ts` - klasės tipai
- [ ] Atnaujinti esamus tipus su naujais endpoint'ais
- [ ] Atnaujinti `User` tipą su kelių rolių palaikymu:
  - `role: string` → `roles: string[]`
- [ ] Atnaujinti komponentus su kelių rolių palaikymu

### 9.5.5 Hooks atnaujinimas
- [ ] Atnaujinti `frontend/src/hooks/useAuth.ts` su naujais endpoint'ais
- [ ] Sukurti naujus hooks:
  - `useSchedule.ts` - tvarkaraščio valdymas
  - `useCurriculum.ts` - dalykų valdymas
  - `useGrades.ts` - pažymių valdymas

### 9.5.6 Error handling atnaujinimas
- [ ] Atnaujinti error handling su naujais endpoint'ais
- [ ] Pridėti specifinius error messages kiekvienam moduliui
- [ ] Atnaujinti loading states

### 9.5.7 UI/UX atnaujinimas
- [ ] Pridėti naujus UI komponentus tvarkaraščiui
- [ ] Atnaujinti navigaciją su naujais puslapiais
- [ ] Pridėti breadcrumbs naujiems puslapiams
- [ ] Atnaujinti sidebar su naujais meniu punktais
- [ ] Atnaujinti rolių rodymą su kelių rolių palaikymu
- [ ] Atnaujinti permission checks su kelių rolių palaikymu

### 9.5.8 Testavimas
- [ ] Testuoti visus atnaujintus komponentus
- [ ] Testuoti naujus puslapius
- [ ] Testuoti API integraciją
- [ ] Testuoti error handling
- [ ] Testuoti loading states
- [ ] Testuoti responsive design

---

## 🧹 **10 FAZĖ: Valymas**

### 10.1 Backend senų failų šalinimas
- [ ] Pašalinti senus modelius iš `crm/models.py`
- [ ] Pašalinti senus serializers iš `crm/serializers.py`
- [ ] Pašalinti senus views iš `crm/views.py`
- [ ] Pašalinti senus URL'us iš `crm/urls.py`

### 10.2 Frontend senų failų šalinimas
- [ ] Pašalinti senus API endpoint'us iš `frontend/src/lib/api.ts`
- [ ] Pašalinti nenaudojamus komponentus
- [ ] Pašalinti nenaudojamus tipus
- [ ] Pašalinti nenaudojamus hooks

### 10.3 Importų valymas
- [ ] Pašalinti nenaudojamus importus backend'e
- [ ] Pašalinti nenaudojamus importus frontend'e
- [ ] Patikrinti, kad nėra circle import'ų
- [ ] Optimizuoti importus

### 10.4 Dokumentacijos atnaujinimas
- [ ] Atnaujinti README.md
- [ ] Atnaujinti API dokumentaciją
- [ ] Sukurti naują struktūros diagramą
- [ ] Atnaujinti frontend'o dokumentaciją

---

## ✅ **11 FAZĖ: Finalizacija**

### 11.1 Galutinis testavimas
- [ ] Vykdyti pilną testų rinkinį
- [ ] Patikrinti, kad visi testai praeina
- [ ] Patikrinti, kad nėra klaidų

### 11.2 Dokumentacijos sukūrimas
- [ ] Sukurti naują API dokumentaciją
- [ ] Sukurti struktūros diagramą
- [ ] Atnaujinti deployment instrukcijas

### 11.3 Git commit
- [ ] Sukurti git commit su visais pakeitimais
- [ ] Sukurti git tag su versijos numeriu
- [ ] Atnaujinti git branch'ą

---

## 🚨 **Rizikos Valdymas**

### Rizikos identifikacija:
1. **Duomenų praradimas** - backup prieš kiekvieną žingsnį
2. **Circle import** - naudoti `settings.AUTH_USER_MODEL`
3. **API neveikimas** - testuoti po kiekvieno žingsnio
4. **Frontend neveikimas** - testuoti integraciją

### Atsarginiai planai:
1. **Rollback** - git revert jei kažkas neveikia
2. **Duomenų atkūrimas** - backup.json jei duomenys prarasti
3. **Laikinas sprendimas** - palikti seną struktūrą jei reikia

---

## 📊 **Progreso Sekimas**

- [x] 1 FAZĖ: Pasiruošimas
- [x] 2 FAZĖ: Core App
- [x] 3 FAZĖ: Schedule App
- [x] 4 FAZĖ: Curriculum App
- [x] 5 FAZĖ: Grades App
- [x] 6 FAZĖ: CRM App Atnaujinimas
- [x] 7 FAZĖ: URL Integracija
- [x] 8 FAZĖ: Duomenų Migracija
- [x] 9 FAZĖ: Testavimas
- [x] 9.5 FAZĖ: Frontend Atnaujinimas
- [x] 10 FAZĖ: Valymas
- [ ] 11 FAZĖ: Finalizacija

---

## 🎯 **Rezultatas**

Po sėkmingo plano įgyvendinimo turėsime:
- ✅ Modulinę architektūrą
- ✅ Circle import problemų išvengimą
- ✅ Geresnį kodo organizavimą
- ✅ Lengvesnį testavimą
- ✅ Geresnį skalavimą
- ✅ Saugesnę struktūrą 