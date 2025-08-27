# Lankomumo statistikos implementacija

## Apžvalga

Implementuota dinamiška lankomumo statistikos skaičiavimo sistema, kuri automatiškai skaičiuoja mokinių lankomumą pagal subject (dalyką) ir atnaujina statistiką realiu laiku.

## Backend'o implementacija

### Naujas API endpoint'as

**URL:** `/api/plans/imu-plans/attendance_stats/`

**Metodas:** `GET`

**Parametrai:**
- `student_id` - mokinio ID
- `subject_id` - dalyko ID

**Atsakymas:**
```json
{
  "student_id": 123,
  "subject_id": 456,
  "total_records": 20,
  "present_records": 15,
  "absent_records": 3,
  "left_records": 1,
  "excused_records": 1,
  "percentage": 75,
  "calculated_from": "15/20"
}
```

### Skaičiavimo logika

1. **Iš viso įrašų** = visi IMUPlan įrašai mokiniui pagal subject
2. **Išskaičiuojami** įrašai su `attendance_status = None` (NULL) - šie NĖRA skaičiuojami
3. **Skaičiuojami tik** įrašai su `attendance_status` reikšmėmis: `'present'`, `'absent'`, `'left'`, `'excused'`
4. **Procentas** = `present / (viso_kiekio - null_įrašų)`

### Pavyzdys

Jei mokinys turi:
- 25 IMUPlan įrašus iš viso
- 5 įrašus su `attendance_status = None` (neįskaičiuojami)
- 15 įrašų su `attendance_status = 'present'`
- 5 įrašus su `attendance_status = 'absent'`

**Skaičiavimas:**
- Bendras skaičiuojamas kiekis: 25 - 5 = 20
- Present: 15
- Procentas: 15/20 = 75%

## Frontend'o implementacija

### Naujas hook'as

**`useAttendanceStats`** - skirta lankomumo statistikai gauti iš API

```typescript
const { stats, loading, error, fetchAttendanceStats, clearStats } = useAttendanceStats();
```

### Integracija su StudentRow

- Pakeista `getAttendanceStats()` funkcija IMUPlan duomenims
- Pridėtas `useEffect` lankomumo statistikai gauti
- Statistika atnaujinama automatiškai

### Trigeriai skaičiavimui

1. **Pasirenkant pamoką** iš Savaitės tvarkaraščio
2. **Spaudinėjant lankomumo mygtukus** (present, absent, left, excused)

## Techninė architektūra

### Duomenų srautas

1. **Pasirenkant pamoką** → `useSelectedLesson` gauna `GlobalSchedule` → `subject.id`
2. **Subject ID** perduodamas į `StudentRow` komponentą
3. **StudentRow** naudoja `useAttendanceStats` hook'ą
4. **API iškvietimas** `/plans/imu-plans/attendance_stats/?student_id=X&subject_id=Y`
5. **Statistika** atnaujinama automatiškai

### Failų struktūra

- `backend/plans/views.py` - naujas `attendance_stats` action
- `frontend/src/hooks/useCurriculum.ts` - `useAttendanceStats` hook'as
- `frontend/src/lib/api.ts` - plans API endpoint'as
- `frontend/src/app/dashboard/mentors/activities/components/StudentRow.tsx` - integracija
- `frontend/src/hooks/useSelectedLesson.ts` - `GlobalSchedule` duomenų gavimas

## Testavimas

### Backend'o testavimas

```bash
# Testuoti endpoint'ą
curl "http://localhost:8000/api/plans/imu-plans/attendance_stats/?student_id=1&subject_id=1"
```

### Frontend'o testavimas

1. Pasirinkti pamoką iš tvarkaraščio
2. Patikrinti, ar lankomumo statistika rodoma teisingai
3. Pakeisti mokinio lankomumo statusą
4. Patikrinti, ar statistika atnaujinama

## Ateities plėtros galimybės

1. **Caching** - išsaugoti statistiką Redis'e greitesniam prieigui
2. **Real-time updates** - WebSocket'ai statistikos atnaujinimui
3. **Bulk operations** - masinis statistikos skaičiavimas visiems mokiniams
4. **Historical data** - lankomumo istorijos peržiūra
5. **Export** - statistikos eksportavimas į Excel/PDF

## Žinomos problemos

1. **Subject ID** gaunamas iš `GlobalSchedule`, o ne iš `Lesson` - gali būti netikslumų
2. **Performance** - dideliam mokinių kiekiui gali būti lėtas API iškvietimas
3. **Error handling** - reikia geresnio klaidų apdorojimo

## Išvados

Implementacija sėkmingai suteikia:
- ✅ Dinamišką lankomumo statistikos skaičiavimą
- ✅ Automatinį atnaujinimą realiu laiku
- ✅ Teisingą NULL reikšmių apdorojimą
- ✅ Integraciją su esama sistema

Sistema paruošta naudojimui ir tolesniam plėtojimui.
