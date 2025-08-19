# /DOC/IMUPLAN_STATUS_REFACTORING.md

# IMUPlan Status Sistemos Refaktorinimas

## PROJEKTO APŽVALGA

Šis dokumentas aprašo **IMUPlan status sistemos refaktorinimą**, kuris atskiria **planų valdymo statusus** nuo **lankomumo statusų** A-DIENYNAS sistemoje. Refaktorinimas buvo atliktas 2025-08-19.

## REFAKTORINIMO TIKSLAS

### **Problema:**
- **Vienas `status` stulpelis** buvo naudojamas tiek planų valdymui, tiek lankomumo žymėjimui
- **Statusų maišymas** sukėlė painiavą tarp ugdymo plano būsenos ir mokinio lankomumo
- **Sudėtinga logika** statusų konvertavimui tarp skirtingų sistemų

### **Sprendimas:**
- **Atskirti statusus** į du stulpelius su aiškiais atsakomybių ribomis
- **Išlaikyti backward compatibility** migracijos metu
- **Supaprastinti logiką** statusų valdymui

## NAUJA STRUKTŪRA

### **1. Nauji Stulpeliai**

```python
class IMUPlan(models.Model):
    # Planų valdymo statusai (ugdymo planų kūrimui ir valdymui)
    plan_status = models.CharField(
        choices=PLAN_STATUS_CHOICES,
        default='planned'
    )
    
    # Lankomumo statusai (AttendanceMarker komponentui)
    attendance_status = models.CharField(
        choices=ATTENDANCE_CHOICES,
        default='present'
    )
    
    # Laikinai paliekame seną status stulpelį migracijos metu
    status = models.CharField(...)  # Bus pašalintas po migracijos
```

### **2. Statusų Rinkiniai**

#### **PLAN_STATUS_CHOICES** (Planų valdymui)
```python
[
    ('planned', 'Suplanuota'),      # Planas sukurtas, bet dar nepradėtas
    ('in_progress', 'Vyksta'),      # Planas vykdomas
    ('completed', 'Baigta'),        # Planas baigtas
]
```

#### **ATTENDANCE_CHOICES** (Lankomumo žymėjimui)
```python
[
    ('present', 'Dalyvavo'),        # Mokinys dalyvavo pamokoje
    ('absent', 'Nedalyvavo'),       # Mokinys nedalyvavo pamokoje
    ('late', 'Vėlavo'),            # Mokinys vėlavo į pamoką
    ('excused', 'Pateisinta'),     # Mokinys pateisintas
]
```

## REFAKTORINIMO EIGA

### **1 ETAPAS: Modelio Atnaujinimas**
- ✅ Pridėti `plan_status` ir `attendance_status` stulpelius
- ✅ Atnaujinti `STATUS_CHOICES` → `PLAN_STATUS_CHOICES` + `ATTENDANCE_CHOICES`
- ✅ Atnaujinti `__str__` metodą
- ✅ Atnaujinti `save` metodą
- ✅ Atnaujinti `bulk_start_activity` ir `bulk_end_activity` metodus

### **2 ETAPAS: Migracijos Sukūrimas**
- ✅ **0002_refactor_imuplan_status_separation.py** - pridėti naujus stulpelius
- ✅ **0003_migrate_status_data.py** - perkelti duomenis iš seno status

### **3 ETAPAS: Backend API Atnaujinimas**
- ✅ Atnaujinti `views.py` - `bulk_create_from_sequence`, `update_status`
- ✅ Atnaujinti `serializers.py` - pridėti naujus statusų laukus
- ✅ Atnaujinti `admin.py` - rodomi abu statusai
- ✅ Atnaujinti `tests.py` - testai su naujais stulpeliais

### **4 ETAPAS: Frontend Atnaujinimas**
- ✅ Atnaujinti `types.ts` - naujas IMUPlan interface
- ✅ Atnaujinti `StudentRow.tsx` - nauja statusų konvertavimo logika
- ✅ Atnaujinti `LessonInfoCard.tsx` - naujas studentų skaičiavimas

## MIGRACIJOS DETALĖS

### **Duomenų Perkėlimas**
```python
def migrate_status_data(apps, schema_editor):
    for plan in IMUPlan.objects.all():
        current_status = plan.status
        
        if current_status in ['planned', 'in_progress', 'completed']:
            # Planų valdymo statusas
            plan.plan_status = current_status
            plan.attendance_status = 'present'  # Default: mokinys dalyvavo
        elif current_status in ['present', 'absent', 'late', 'excused']:
            # Lankomumo statusas
            plan.attendance_status = current_status
            plan.plan_status = 'planned'  # Default: planas suplanuotas
```

### **Backward Compatibility**
- **Laikinai paliekame** `status` stulpelį migracijos metu
- **Sinchronizuojame** `status` su `plan_status` arba `attendance_status`
- **Po migracijos** `status` stulpelis bus pašalintas

## API ENDPOINTŲ POKEČIAI

### **1. `/api/plans/imu-plans/start_activity/`**
```python
# REFAKTORINIMAS: Dabar atnaujiname abu statusus
plan_status='in_progress'      # Planas pradėtas vykdyti
attendance_status='present'    # Mokinys dalyvavo
```

### **2. `/api/plans/imu-plans/end_activity/`**
```python
# REFAKTORINIMAS: Dabar atnaujiname tik plan_status
plan_status='completed'        # Planas baigtas
# attendance_status lieka nepakeistas
```

### **3. `/api/plans/imu-plans/{id}/update_status/`**
```python
# REFAKTORINIMAS: Dabar galime atnaujinti plan_status arba attendance_status
POST /api/plans/imu-plans/{id}/update_status/
{
    "status": "in_progress",
    "status_type": "plan"  # 'plan' arba 'attendance'
}
```

## FRONTEND POKEČIAI

### **1. IMUPlan Interface**
```typescript
export interface IMUPlan {
  // REFAKTORINIMAS: Dabar turime atskirus statusų laukus
  plan_status: 'planned' | 'in_progress' | 'completed';
  plan_status_display: string;
  attendance_status: AttendanceStatus;
  attendance_status_display: string;
  
  // Laikinai paliekame senus laukus migracijos metu
  status: 'planned' | 'in_progress' | 'completed' | AttendanceStatus;
  status_display: string;
}
```

### **2. Statusų Konvertavimas**
```typescript
// REFAKTORINIMAS: Dabar galime naudoti attendance_status tiesiogiai
const convertToAttendanceStatus = (status: string): AttendanceStatus => {
  if (isIMUPlan) {
    const imuPlan = student as IMUPlan;
    if (imuPlan.attendance_status) {
      return imuPlan.attendance_status;  // Tiesiogiai naudojame
    }
    // Fallback: senai logikai migracijos metu
  }
  return status as AttendanceStatus;
};
```

### **3. Studentų Skaičiavimas**
```typescript
// REFAKTORINIMAS: Dabar naudojame attendance_status tiesiogiai
<span className="text-green-600">
  Dalyvavo: {studentsForThisLesson.filter(s => s.attendance_status === 'present').length}
</span>
```

## PRIVALUMAI

### **1. Aiškus Atsakomybių Atskyrimas**
- **`plan_status`** = tik planų valdymui
- **`attendance_status`** = tik lankomumo žymėjimui
- **Nėra konfliktų** tarp statusų

### **2. Lankesnis Valdymas**
- Galima keisti lankomumą nepriklausomai nuo plano būsenos
- Galima turėti planą "baigtas", bet mokinys "nedalyvavo"
- Galima turėti planą "vyksta", bet mokinys "vėlavo"

### **3. Backward Compatibility**
- **Esami API endpointai** veikia be pakeitimų
- **Frontend komponentai** veikia su naujais duomenimis
- **Migracija** yra saugi ir grįžtama

## TRŪKUMAI IR RIBOJIMAI

### **1. Duomenų Dubliavimas (Laikinai)**
- **`status`** ir **`plan_status`** turės identiškus duomenis migracijos metu
- **Po migracijos** `status` stulpelis bus pašalintas

### **2. Migracijos Sudėtingumas**
- Reikėjo **perkelti duomenis** iš `status` į naujus stulpelius
- Reikėjo **nustatyti default reikšmes** naujiems stulpeliams

## ATEITIES PLANAI

### **1. Status Stulpelio Pašalinimas**
```python
# Po sėkmingos migracijos sukurti migraciją:
class Migration(migrations.Migration):
    operations = [
        migrations.RemoveField(
            model_name='imuplan',
            name='status',
        ),
    ]
```

### **2. API Endpointų Optimizavimas**
- **Pašalinti** `status_type` parametrą `update_status` endpoint'e
- **Sukurti** atskirus endpoint'us planų ir lankomumo valdymui

### **3. Frontend Optimizavimas**
- **Pašalinti** seną statusų konvertavimo logiką
- **Naudoti** `attendance_status` tiesiogiai

## TESTAVIMAS

### **1. Backend Testai**
```bash
cd backend
python manage.py test plans.tests.PlansModelsTestCase
```

### **2. Migracijų Testavimas**
```bash
cd backend
python manage.py migrate plans --fake-initial
python manage.py migrate plans
```

### **3. API Testavimas**
```bash
# Testuoti start_activity endpoint'ą
curl -X POST /api/plans/imu-plans/start_activity/ \
  -H "Authorization: Bearer {token}" \
  -d '{"global_schedule_id": 1}'
```

## IŠVADOS

**IMUPlan status sistemos refaktorinimas buvo sėkmingai įgyvendintas:**

✅ **Atskirti statusai** - planų valdymas ir lankomumo žymėjimas  
✅ **Backward compatibility** - esami API endpointai veikia  
✅ **Lankesnis valdymas** - galima keisti statusus nepriklausomai  
✅ **Saugi migracija** - duomenys perkelti be praradimo  
✅ **Aiškesnė logika** - kiekvienas statusas turi savo paskirtį  

**Refaktorinimas paruošė sistemą ateities plėtrai ir supaprastino statusų valdymą.**

---

**Dokumentas sukurtas:** 2025-08-19  
**Atnaujintas:** 2025-08-19  
**Versija:** 1.0
