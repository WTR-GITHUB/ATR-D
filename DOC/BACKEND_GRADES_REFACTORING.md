# /DOC/BACKEND_GRADES_REFACTORING.md

# Backend Grades Sistemos Refaktoringas

## Apžvalga

Backend grades sistema buvo visiškai perprojektuota, kad atitiktų frontend GradeSelector komponento logiką. Sistema dabar palaiko S, B, P, A pasiekimų lygius su automatiniais skaičiavimais ir real-time išsaugojimu.

## CHANGE: Visiškai perprojektuota grades sistema pagal frontend reikalavimus

## Techniniai Pokyčiai

### 1. Modeliai (backend/grades/models.py)

#### AchievementLevel Modelis
- **Kodas**: S, B, P, A
- **Procentų intervalai**: 
  - S: 40-54% (žalias)
  - B: 55-69% (mėlynas) 
  - P: 70-84% (oranžinis)
  - A: 85-100% (raudonas)
- **Spalvos**: Frontend integracijai
- **Validacija**: Procentų intervalų tikrinimas

#### Grade Modelis (Refaktorintas)
- **Pasiekimų lygis**: Automatiškai nustatomas pagal procentus
- **Procentai**: 0-100 su validacija
- **IMU Planas**: Susiejimas su individualiu mokinio ugdymo planu
- **Mentorius**: Kas duoda vertinimą
- **Automatika**: Pasiekimų lygis apskaičiuojamas automatiškai

#### GradeCalculation Modelis
- **Skaičiavimų istorija**: Procentų → lygio konversijų sekimas
- **Auditas**: Kada buvo atliktas skaičiavimas

### 2. Admin Sąsaja (backend/grades/admin.py)

- **AchievementLevel**: Pilnas CRUD valdymas
- **Grade**: Optimizuotas sąrašas su filtravimu
- **GradeCalculation**: Skaičiavimų istorijos peržiūra

### 3. API Serializers (backend/grades/serializers.py)

- **AchievementLevelSerializer**: Pasiekimų lygių duomenys
- **GradeSerializer**: Automatinis lygio skaičiavimas
- **GradeListSerializer**: Sąrašo atvaizdavimas
- **StudentGradeSummarySerializer**: Mokinio vertinimų suvestinė
- **LessonGradeSummarySerializer**: Pamokos vertinimų suvestinė

### 4. API Views (backend/grades/views.py)

- **AchievementLevelViewSet**: Tik skaitymas (GET)
- **GradeViewSet**: Pilnas CRUD + specialūs veiksmai
  - `calculate_level`: Lygio skaičiavimas pagal procentus
  - `student_summary`: Mokinio vertinimų suvestinė
  - `lesson_summary`: Pamokos vertinimų suvestinė
  - `recalculate_all`: Visų vertinimų perskaičiavimas

### 5. URL Konfigūracija (backend/grades/urls.py)

- **Pasiekimų lygiai**: `/api/grades/achievement-levels/`
- **Vertinimai**: `/api/grades/grades/`
- **Specialūs veiksmai**: `/api/grades/grades/calculate_level/` ir kt.

### 6. Management Komandos

- **init_achievement_levels**: Pasiekimų lygių inicializavimas duomenų bazėje
- Automatiškai sukuria S, B, P, A lygius su procentų intervalais

## Duomenų Bazės Migracija

### Sukurti Lentelės
- `grades_achievementlevel`: Pasiekimų lygių duomenys
- `grades_gradecalculation`: Skaičiavimų istorija

### Atnaujinti Lentelės  
- `grades_grade`: Pridėti nauji laukai ir ryšiai

### Ryšiai
- Grade → AchievementLevel (ForeignKey)
- Grade → IMUPlan (ForeignKey, optional)
- GradeCalculation → AchievementLevel (ForeignKey)

## Frontend Integracija

### GradeSelector Komponentas
- **Pasiekimų lygių mygtukai**: S, B, P, A su spalvomis
- **Procentų įvedimas**: Automatinis lygio nustatymas
- **Real-time išsaugojimas**: API integracija su optimistiniais atnaujinimais
- **Klaidų valdymas**: Vartotojo draugiški pranešimai

### StudentRow Integracija
- **Išplėsta sekcija**: GradeSelector komponentas accordion'e
- **Props perduodimas**: Student ID, Lesson ID, IMU Plan ID, Mentor ID
- **Būsenos valdymas**: Vertinimo pakeitimų sekimas

## API Endpoint'ai

### GET /api/grades/achievement-levels/
```json
[
  {
    "id": 1,
    "code": "S",
    "name": "Slenkstinis",
    "min_percentage": 40,
    "max_percentage": 54,
    "color": "žalias",
    "description": "Slenkstinis pasiekimų lygis..."
  }
]
```

### POST /api/grades/grades/
```json
{
  "student": 1,
  "lesson": 1,
  "mentor": 1,
  "percentage": 75,
  "imu_plan": 1,
  "notes": "Puikus darbas"
}
```

### PUT /api/grades/grades/{id}/
```json
{
  "percentage": 80,
  "notes": "Atnaujintas vertinimas"
}
```

## Validacija ir Saugumas

### Procentų Validacija
- **Minimalus**: 0%
- **Maksimalus**: 100%
- **Automatika**: Pasiekimų lygis nustatomas automatiškai

### Rolio Tikrinimas
- **Studentas**: Tik mokinys gali gauti vertinimą
- **Mentorius**: Tik mentorius gali duoti vertinimą
- **Unikalumas**: Vienas vertinimas vienam mokiniui už pamoką

### Duomenų Integritetas
- **Foreign Keys**: Visi ryšiai saugomi
- **Cascade**: Saugus duomenų ištrynimas
- **Constraints**: Unikalūs indeksai

## Naudojimo Pavyzdžiai

### 1. Pasiekimų Lygio Skaičiavimas
```python
# Automatiškai nustatomas pagal procentus
grade = Grade.objects.create(
    student=student,
    lesson=lesson,
    mentor=mentor,
    percentage=75  # Automatiškai nustatomas P lygis
)
print(grade.achievement_level.code)  # "P"
```

### 2. Lygio Nustatymas Pagal Procentus
```python
level = AchievementLevel.get_level_by_percentage(85)
print(level.code)  # "A"
print(level.name)  # "Aukštesnysis"
```

### 3. Mokinio Vertinimų Suvestinė
```python
# API endpoint: /api/grades/grades/student_summary/?student_id=1
summary = Grade.objects.filter(student_id=1).aggregate(
    avg_percentage=Avg('percentage'),
    total_grades=Count('id')
)
```

## Testavimas

### Unit Testai
- Modelių validacija
- Automatiniai skaičiavimai
- Rolio tikrinimas

### Integration Testai
- API endpoint'ai
- Serializer logika
- Admin sąsaja

### Manual Testai
- Frontend integracija
- Real-time išsaugojimas
- Klaidų valdymas

## Ateities Plėtra

### Galimi Patobulinimai
- **Bulk Operations**: Masinis vertinimų importas/eksportas
- **Analytics**: Detalesnė statistika ir ataskaitos
- **Notifications**: Vertinimo pakeitimų pranešimai
- **Audit Trail**: Pilnas pakeitimų istorijos sekimas

### API Plėtra
- **GraphQL**: Lanksesni duomenų užklausų
- **Webhooks**: Real-time pranešimai
- **Rate Limiting**: API naudojimo ribojimas

## Išvados

Backend grades sistema sėkmingai perprojektuota pagal frontend reikalavimus:

✅ **Pasiekimų lygiai**: S, B, P, A su procentų intervalais  
✅ **Automatinis skaičiavimas**: Lygis nustatomas pagal procentus  
✅ **Real-time išsaugojimas**: API integracija su optimistiniais atnaujinimais  
✅ **Validacija**: Procentų ir rolių tikrinimas  
✅ **Integracija**: Frontend GradeSelector komponentas  

Sistema dabar pilnai palaiko modernų, interaktyvų vertinimo procesą su real-time duomenų atnaujinimu ir vartotojo draugiška sąsaja.
