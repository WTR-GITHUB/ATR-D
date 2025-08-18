<!-- frontend/src/app/dashboard/mentors/veiklos/README.md -->

<!-- Veiklos modulio dokumentacija -->
<!-- Išsamus aprašymas apie Veiklos puslapio struktūrą, komponentus ir funkcionalumą -->
<!-- Skirtas vystytojams suprasti kodą ir lengvai juo dirbti -->
<!-- CHANGE: Sukurta pilna Veiklos modulio dokumentacija -->

# Veiklos modulis

## Apžvalga

Veiklos modulis skirtas mentoriams vykdyti pamokas realiu laiku pagal tvarkaraštį. Čia galima:

- Pasirinkti datą, pamokos periodą ir dalyką
- Matyti suplanuotas pamokas iš GlobalSchedule
- Žymėti mokinių lankumą (dalyvavo, nedalyvavo, vėlavo, pateisinta)
- Vertinti mokinių aktyvumą, užduočių atlikimą ir supratimą
- Rašyti pastabas apie kiekvieno mokinio dalyvavimą
- Stebėti pamokos statistikas ir tendencijas

## Failų struktūra

```
/veiklos/
├── page.tsx                 # Pagrindinis puslapis
├── types.ts                 # Centralizuoti tipų aprašai
├── components/
│   ├── LessonSelector.tsx   # Pamokos pasirinkimo komponentas (su natyviu date input)
│   ├── StudentsList.tsx     # Mokinių sąrašo komponentas
│   ├── StudentRow.tsx       # Mokinio eilutės komponentas
│   ├── AttendanceMarker.tsx # Lankomumo žymėjimo komponentas
│   └── StudentStats.tsx     # Statistikos komponentas
└── README.md               # Ši dokumentacija
```

## Komponentų aprašymai

### page.tsx
Pagrindinis puslapis, sujungiantis visus komponentus. Valdo:
- Bendras būsenas (data, dalykas, pamoka, mokiniai)
- Lankomumo keitimo logiką
- Auto-save indikatorių

### LessonSelector.tsx
Filtrų komponentas, leidžiantis pasirinkti:
- Datą
- Pamokos periodą (iš schedule.Period modelio)
- Dalyką
Pagal šiuos filtrus gauna suplanuotas pamokas iš GlobalSchedule

### StudentsList.tsx
Mokinių sąrašo valdymo komponentas su:
- Paieška pagal vardą/pavardę
- Filtravimas pagal lankomumo būseną
- Rūšiavimas pagal vardą, lankumą ar grįžtamąjį ryšį
- Statistikų rodymas

### StudentRow.tsx
Individualaus mokinio eilutės komponentas su:
- Accordion funkcionalumu
- Lankomumo žymėjimu
- Išsamiu vertinimu (aktyvumas, užduočių atlikimas, supratimas)
- Pastabų lauku
- Užduočių žymėjimais

### AttendanceMarker.tsx
Specializuotas lankomumo žymėjimo komponentas:
- 4 būsenos: dalyvavo, nedalyvavo, vėlavo, pateisinta
- Vizualūs indikatoriai su spalvomis ir ikonelėmis
- Hover ir active būsenos
- Grupinis komponentas visų mygtukų rodymui

### StudentStats.tsx
Statistikos komponentas, rodantis:
- Bendrą dalyvavimo procentą
- Lankomumo paskirstymą
- Aukštų pasiakimų ir dėmesio reikalaujančių mokinių skaičių
- Grįžtamojo ryšio statistikas

## Tipų sistema

Visi tipai centralizuoti `types.ts` faile:

### Pagrindiniai tipai
- `AttendanceStatus` - lankomumo būsenos
- `Student` - mokinio duomenų struktūra
- `Subject` - dalyko informacija
- `Lesson` - pamokos duomenys

### Vertinimo tipai
- `ActivityLevel` - aktyvumo lygis
- `TaskCompletion` - užduočių atlikimas
- `Understanding` - supratimo lygis
- `StudentEvaluation` - pilnas mokinio vertinimas

### Statistikos tipai
- `AttendanceStats` - lankomumo statistikos
- `PerformanceStats` - veiklos statistikos

## Funkcionalumas

### Lankomumo žymėjimas
- Realaus laiko atnaujinimas
- 4 būsenos su vizualiais indikatoriais
- Automatinis statistikų perskaičiavimas

### Filtravimas ir paieška
- Paieška pagal mokinio vardą/pavardę
- Filtravimas pagal lankomumo būseną
- Rūšiavimas pagal skirtingus kriterijus

### Vertinimas
- Aktyvumo vertinimas (aukštas/vidutinis/žemas)
- Užduočių atlikimo sekimas
- Supratimo lygio nustatymas
- Laisvos formos pastabos

### Auto-save
- Automatinis pakeitimų išsaugojimas
- Vizualus indikatorius apačioje dešinėje
- Console išvedimas (bus pakeistas API iškvietimais)

## Plėtimo galimybės

### API integracija
Ateityje reikės prijungti:
- Mokinių sąrašo gavimą iš backend
- Pamokų informacijos gavimą
- Lankomumo išsaugojimą
- Vertinimų išsaugojimą

### Papildomas funkcionalumas
- Masinis lankomumo žymėjimas
- Eksportavimas į Excel/PDF
- Email pranešimai tėvams
- Istorijos peržiūra
- Ataskaitos generavimas

## Techninės pastabos

### Stilizavimas
- Naudojamas Tailwind CSS
- Responsive dizainas
- Hover ir transition efektai
- Aiškūs vizualūs indikatoriai

### TypeScript
- Griežta tipizacija visur
- Centralizuoti tipų aprašai
- Props interfaces visiem komponentam
- Callback funkcijų tipai

### Performance
- React.useMemo optimizacijos filtravimui
- Moduliari komponentų struktūra
- Memoization statistikų skaičiavimui

## Naudojimas

1. Paleisti frontend serverį: `npm run dev`
2. Naviguoti į `/dashboard/mentors/veiklos`
3. Pasirinkti datą, dalyką ir pamoką
4. Žymėti mokinių lankumą
5. Plėsti mokinio eilutę papildomam vertinimui
6. Stebėti statistikas viršuje

Visi pakeitimai automatiškai išsaugomi (šiuo metu tik console log).
