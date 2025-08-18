# DOC/ACTIVITIES-LESSON-SELECTION.md

# Activities puslapio pamokos pasirinkimo funkcionalumas

## Apžvalga

Activities puslapyje (`/dashboard/mentors/activities`) implementuotas išsamus pamokos pasirinkimo ir detalių rodymo funkcionalumas, kuris palaiko:
- Pamokos pasirinkimo išsaugojimą localStorage
- Išsamią pamokos informacijos demonstraciją
- Kelių pamokų rodymo palaikymą vienoje veikloje (GlobalSchedule)
- IMUPlan sistemos integracijos su studentų planais

## Funkcionalumo aprašymas

### 1. Pamokos pasirinkimo išsaugojimas

**Veikimo principas:**
- Vartotojas spusteli ant pamokos kortelės tvarkaraštyje
- Pasirinkimas išsaugomas localStorage su raktu `activities_selected_lesson`
- Pasirinkimas išlieka net uždarant tvarkaraščio akordeono
- Pasirinkimas išsilaiko iki kitos pamokos pasirinkimo arba puslapio perkrovimo

**Implementacija:** `useSelectedLesson` hook naudoja localStorage API duomenų išsaugojimui.

### 2. Išsami pamokos informacija

Sistema rodo išsamią informaciją apie pasirinktą pamoką iš `curriculum.models.Lesson`:

**Rodomą informacija:**
- **Pamokos pavadinimas ir tema** - iš `title` ir `topic` laukų
- **Mokomoji medžiaga** - iš `content` lauko
- **Komponentų sąrašas** - iš `components` JSON lauko
- **Tikslų sąrašas** - iš `objectives` JSON lauko  
- **Gebėjimų informacija** - iš `skills` ManyToMany ryšio
- **Dorybės** - iš `virtues` ManyToMany ryšio
- **Mokymo lygiai** - iš `levels` ManyToMany ryšio
- **Pasiekimo lygiai:**
  - Slenkstinis (54%) - iš `slenkstinis` lauko
  - Bazinis (74%) - iš `bazinis` lauko
  - Pagrindinis (84%) - iš `pagrindinis` lauko
  - Aukštesnysis (100%) - iš `aukstesnysis` lauko
- **BUP kompetencijos** - iš `competency_atcheves` ManyToMany ryšio
- **Mentorius** - iš `mentor` ForeignKey ryšio

### 3. Kelių pamokų palaikymas

**Scenarijus:** Viena GlobalSchedule veikla gali turėti kelis IMUPlan įrašus su skirtingomis pamokomis.

**Rodymo logika:**
- Jei yra kelios pamokos, rodoma "Pamokos šioje veikloje (X)" sekcija
- Kiekviena pamoka rodoma atskiroje kortelėje su:
  - Pamokos pavadinimu
  - Dalyku ir tema
  - Mentoriaus vardu
  - Pirmoji pamoka pažymėta kaip "Pagrindinis"

**Duomenų šaltinis:** IMUPlan.objects.filter(global_schedule=id) grąžina visus planus

### 4. IMU planų (Mokinių planų) rodymas

**Informacija apie studentus:**
- Studento vardas ir pavardė
- Priskirtos pamokos pavadinimas (arba "Pamoka nepriskirta")
- Plano statusas (Suplanuota/Vyksta/Baigta/Praleista/Atšaukta)
- Veiklos data, laikas ir klasė

**Duomenų šaltinis:** `plans.models.IMUPlan` įrašai filtruojami pagal `global_schedule` ID.

## Techninis sprendimas

### Komponentų architektūra

```
activities/page.tsx (pagrindinis puslapis)
├── WeeklyScheduleCalendar (tvarkaraščio komponentas)
│   ├── LessonCard (pamokos kortelė)
│   └── onScheduleItemSelect callback
├── LessonDetailsPanel (pamokos detalių komponentas)
│   ├── Pamokų sąrašas (jei kelios)
│   ├── IMU planų sąrašas
│   ├── Mokomoji medžiaga
│   ├── Tikslai, komponentai, gebėjimai
│   └── Pasiekimo lygiai
└── useSelectedLesson hook (būsenos valdymas)
```

### API Endpoint'ai

**IMU planų gavimas:**
```
GET /api/plans/imu-plans/?global_schedule={id}
```

**Pamokos detalių gavimas:**
```
GET /api/curriculum/lessons/{lesson_id}/
```

**Backend konfigūracija:**
- `plans.views.IMUPlanViewSet.filterset_fields` turi `'global_schedule'` lauką
- `curriculum.views.LessonViewSet` grąžina visas pamokos detales per `LessonSerializer`

### Duomenų srautas

1. **Pasirinkimas:** Vartotojas spusteli ant pamokos tvarkaraštyje
2. **localStorage:** Pasirinkimas išsaugomas su GlobalSchedule ID
3. **IMU planų gavimas:** API iškvietimas `/plans/imu-plans/?global_schedule={id}`
4. **Pamokų ID gavimas:** Ištraukiami unikalūs `lesson` ID iš IMU planų
5. **Pamokų detalių gavimas:** Paraleliai gaunamos visos pamokos `/curriculum/lessons/{id}/`
6. **Rodymas:** LessonDetailsPanel komponentas rodo visą informaciją

### TypeScript tipai

```typescript
interface SelectedLessonState {
  globalScheduleId: number | null;
  lessonDetails: LessonDetails | null;      // Pagrindinė pamoka
  allLessonsDetails: LessonDetails[];       // Visos pamokos
  imuPlans: IMUPlan[];                      // Studentų planai
  isLoading: boolean;
  error: string | null;
}

interface IMUPlan {
  id: number;
  student: number;
  student_name: string;
  global_schedule: number;
  lesson: number | null;
  lesson_title: string | null;
  status: 'planned' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
  // ...kiti laukai
}
```

## Problemų sprendimas

### Problema: API grąžino tuščią masyvą

**Priežastis:** Frontend tikėjosi `response.data.results` (pagination formatas), bet API grąžino masyvą tiesiogiai.

**Sprendimas:**
```typescript
const imuPlans = Array.isArray(imuPlansResponse.data) 
  ? imuPlansResponse.data 
  : (imuPlansResponse.data.results || []);
```

### Problema: Filtravimas neveikė

**Priežastis:** `plans.views.IMUPlanViewSet.filterset_fields` neturėjo `'global_schedule'` lauko.

**Sprendimas:** Pridėtas `'global_schedule'` į filterset_fields:
```python
filterset_fields = ['student', 'status', 'global_schedule', 'global_schedule__subject', 'global_schedule__level']
```

## Naudojimas

### Kaip naudoti vartotojui

1. Eikite į `/dashboard/mentors/activities`
2. Išskleiskite "Savaitės tvarkaraštis" akordeono
3. Spauskite ant bet kurios pamokos kortelės tvarkaraštyje
4. Pamoka pažymėta geltuniu ženkliuku ✓
5. Apačioje matysite išsamią pamokos informaciją
6. Pasirinkimas išsaugotas - galite uždarytį akordeono

### Kaip plėtoti funkcionalumą

**Naujų laukų pridėjimas:**
1. Pridėti lauką į `curriculum.models.Lesson`
2. Atnaujinti `curriculum.serializers.LessonSerializer`
3. Pridėti rodyma į `LessonDetailsPanel.tsx`

**Naujų filtrų pridėjimas:**
1. Pridėti filtro lauką į `plans.views.IMUPlanViewSet.filterset_fields`
2. Atnaujinti frontend API iškvietimus su naujais parametrais

## Failų sąrašas

### Frontend failai
- `frontend/src/hooks/useSelectedLesson.ts` - pasirinkimo būsenos valdymas
- `frontend/src/app/dashboard/mentors/activities/page.tsx` - pagrindinis puslapis
- `frontend/src/app/dashboard/mentors/activities/components/LessonDetailsPanel.tsx` - detalių komponentas
- `frontend/src/app/dashboard/mentors/activities/types.ts` - TypeScript tipai
- `frontend/src/components/dashboard/WeeklyScheduleCalendar.tsx` - tvarkaraščio komponentas

### Backend failai
- `backend/plans/views.py` - IMUPlan API endpoint'ai
- `backend/plans/models.py` - IMUPlan duomenų modelis
- `backend/curriculum/views.py` - Lesson API endpoint'ai  
- `backend/curriculum/models.py` - Lesson duomenų modelis
- `backend/curriculum/serializers.py` - Lesson serializeris

## Išvados

Implementuotas funkcionalumas pilnai palaiko:
- ✅ Pamokos pasirinkimo išsaugojimą
- ✅ Išsamią pamokos informacija rodyma
- ✅ Kelių pamokų palaikymą vienoje veikloje
- ✅ IMUPlan sistemos integracija su studentų planais

Sistema sukurta moduliario architektūra ir gali būti lengvai plėčiama ateityje.
