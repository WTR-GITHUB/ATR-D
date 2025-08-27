# /DOC/ATTENDANCE_STATUS_CHANGE.md

# Lankomumo statuso pakeitimas: 'late' → 'left'

## Problemos aprašymas

**Data:** 2025-08-26  
**Problema:** Reikėjo pakeisti lankomumo statusą `late` (Vėlavo) į `left` (Paliko) lietuvių kalba.

## Atlikti pakeitimai

### 1. Backend'o pakeitimai

#### plans/models.py
- **Pakeista:** `('late', 'Vėlavo')` → `('left', 'Paliko')`
- **Failas:** `backend/plans/models.py` (70 eilutė)

#### Migracija
- **Sukurta:** `backend/plans/migrations/0006_change_late_to_left.py`
- **Funkcionalumas:** Pakeičia esamus `late` įrašus į `left` duomenų bazėje
- **Atvirkštinė migracija:** Galima grąžinti `left` atgal į `late`

### 2. Frontend'o pakeitimai

#### types.ts
- **AttendanceStatus tipas:** `'late'` → `'left'`
- **AttendanceStats interface:** `late_count` → `left_count`
- **FilterBy tipas:** `'late'` → `'left'`

#### Komponentai
- **StudentsList.tsx:** `late` → `left` statistikų skaičiavime
- **StudentStats.tsx:** `late` → `left` statistikų rodyme
- **AttendanceMarker.tsx:** `late` → `left` statusų apdorojime
- **StudentRow.tsx:** `late` → `left` ir `'Vėlavo'` → `'Paliko'`

## Pakeistų failų sąrašas

### Backend:
- `backend/plans/models.py`
- `backend/plans/migrations/0006_change_late_to_left.py`

### Frontend:
- `frontend/src/app/dashboard/mentors/activities/types.ts`
- `frontend/src/app/dashboard/mentors/activities/components/StudentsList.tsx`
- `frontend/src/app/dashboard/mentors/activities/components/StudentStats.tsx`
- `frontend/src/app/dashboard/mentors/activities/components/AttendanceMarker.tsx`
- `frontend/src/app/dashboard/mentors/activities/components/StudentRow.tsx`

## Migracijos vykdymas

### Pritaikyti migraciją:
```bash
cd backend
python manage.py migrate plans
```

### Atšaukti migraciją (jei reikia):
```bash
cd backend
python manage.py migrate plans 0005
```

## Rezultatai

✅ **Backend'e:** `late` → `left` modeliuose ir duomenų bazėje  
✅ **Frontend'e:** Visi `late` nuorodos pakeistos į `left`  
✅ **Lietuvių kalba:** `'Vėlavo'` → `'Paliko'`  
✅ **Duomenų bazė:** Esami įrašai automatiškai atnaujinami  
✅ **Tipų saugumas:** TypeScript tipai atnaujinti  

## Ateities priežiūra

- **Patikrinti,** ar visi komponentai veikia tinkamai
- **Testuoti** lankomumo žymėjimą su nauju `left` statusu
- **Stebėti** ar nėra klaidų konsolėje
- **Patikrinti** ar statistikos rodomos tinkamai

## Pastabos

- **Pakeitimas yra grįžtamas** - galima atšaukti migraciją
- **Frontend'o pakeitimai** nedaro įtakos esamiems duomenims
- **Backend'o pakeitimai** automatiškai atnaujina duomenų bazę
