# A-DIENYNAS Spalvų Sistema

## Apžvalga

A-DIENYNAS sistemoje naudojamos trys atskiros spalvų schemos tvarkaraščio komponentams:

1. **Mentorių spalvos** (`scheduleColors.ts`) - mentorių veiklų puslapiui
2. **Studentų spalvos** (`scheduleStudentColors.ts`) - studentų tvarkaraščiui
3. **Dalykų spalvos** (`subjectColors.ts`) - dalykų vizualiniam atskyrimui

## Failų struktūra

```
frontend/src/constants/
├── scheduleColors.ts              # Mentorių spalvų konstantos
├── scheduleStudentColors.ts       # Studentų spalvų konstantos
├── subjectColors.ts               # Dalykų spalvų konstantos
├── scheduleColorsIndex.ts         # Spalvų konstantų indeksas
└── README_ScheduleColors.md      # Šis dokumentacijos failas
```

## Spalvų skirtumai

### Mentorių spalvos (scheduleColors.ts)
- **Suplanuota**: Balta su žaliu rėmeliu (`emerald-200`)
- **Vyksta**: Žalias fonas (`emerald-200`)
- **Baigta**: Pilkas fonas (`gray-200`)
- **Nėra IMUPlan**: Balta su raudonu rėmeliu (`blush-200`)

### Studentų spalvos (scheduleStudentColors.ts)
- **Suplanuota**: Šviesiai mėlynas fonas (`blue-100`) su mėlynu rėmeliu (`blue-500`)
- **Vyksta**: Žalias fonas (`green-300`) su tamsiai žaliu rėmeliu (`green-600`)
- **Baigta**: Šviesiai pilkas fonas (`gray-100`) su pilku rėmeliu (`gray-500`)
- **Nėra IMUPlan**: Šviesiai oranžinis fonas (`orange-200`) su oranžiniu rėmeliu (`orange-600`)

### Dalykų spalvos (subjectColors.ts)
- **Akademiniai dalykai**: Unikalūs pasteliniai atspalviai ir šiltosios spalvos
  - Matematika: Šampano (`champagne-200`)
  - Lietuvių literatūra: Dramblio kaulo (`ivory-200`)
  - Lietuvių gramatika: Vanilės (`vanilla-200`)
  - Biologija: Mėtų žalia (`mint-green-200`)
  - Chemija: Levandų (`lavender-200`)
  - Fizika: Barvinko (`periwinkle-200`)
  - Informacinės technologijos: Kūdikio mėlyna (`baby-blue-200`)
- **Kalbos**: Šaltosios pastelinės spalvos (mėlynos paletės)
  - Anglų kalba: Dangaus (`sky-200`)
  - Prancūzų kalba: Mėlyna (`blue-200`)
  - Rusų kalba: Indigo (`indigo-200`)
  - Ispanų kalba: Violetinė (`violet-200`)
  - Vokiečių kalba: Purpurinė (`purple-200`)
- **Kūrybiniai/praktiniai**: Papildomos švelniųjų atspalvių spalvos
  - Dailė: Šalavijų (`sage-200`)
  - MUZIKA: Alyvinė (`lilac-200`)
  - Kinas: Pudros mėlyna (`powder-blue-200`)
  - Kuravimasis: Jūros putos (`seafoam-200`)
  - Etika: Vandens (`aqua-200`)
  - Kūno kultūra: Turkio (`turquoise-200`)
  - Maisto gamyba: Pistacijų (`pistachio-200`)
  - Technologijos vaikinams: Mėtų (`mint-200`)
  - Spalvų psichologija: Vatos cukraus (`cotton-candy-200`)
  - VIDUDIENIO RATAS: Dulkėtos rožės (`dusty-rose-200`)
  - TRIVIA ŽAIDIMAI: Violetinai rožinė (`mauve-200`)
  - Band'as: Rausvumo (`blush-200`)
  - Ekskursija: Medaus rasos (`honeydew-200`)

## Naudojimas komponentuose

### Mentorių komponentuose
```typescript
import { getScheduleColors, getScheduleColorClasses } from '@/constants/scheduleColors';

const colors = getScheduleColors('planned');
const className = getScheduleColorClasses('in_progress');
```

### Studentų komponentuose
```typescript
import { getStudentScheduleColors, getStudentScheduleColorClasses } from '@/constants/scheduleStudentColors';

const colors = getStudentScheduleColors('planned');
const className = getStudentScheduleColorClasses('in_progress');
```

### Dalykų spalvoms
```typescript
import { getSubjectColors, getSubjectColorClasses } from '@/constants/subjectColors';

const colors = getSubjectColors('Matematika');
const className = getSubjectColorClasses('Lietuvių literatūra');
```

### Visų spalvų naudojimas
```typescript
import { 
  getScheduleColors, 
  getStudentScheduleColors,
  getSubjectColors
} from '@/constants/scheduleColorsIndex';
```

## Spalvų keitimas

1. **Mentorių spalvoms**: Redaguokite `scheduleColors.ts`
2. **Studentų spalvoms**: Redaguokite `scheduleStudentColors.ts`
3. **Dalykų spalvoms**: Redaguokite `subjectColors.ts`
4. **Visoms**: Redaguokite atitinkamus failus

## Dizaino principai

### Mentorių spalvos
- Profesionalus, rimtas stilius
- Žalios spalvos akcentuojamos
- Raudonos spalvos įspėjimams

### Studentų spalvos
- Šviesesnės, minkštesnės spalvos
- Mėlynos spalvos pagrindiniams elementams
- Oranžinės spalvos įspėjimams
- Didesnis kontrastas teksto skaitomumui

### Dalykų spalvos
- Unikalios spalvos kiekvienam dalykui
- Kategorijos pagal dalyko tipą (akademiniai, kalbos, kūrybiniai)
- Pastelinės spalvos, pritaikytos studentų poreikiams
- Spalvos atspindi dalyko charakteristikas

## Komponentų sąrašas

### Naudoja mentorių spalvas
- `WeeklyScheduleCalendar.tsx` (mentorių veiklų puslapyje)
- Kiti mentorių tvarkaraščio komponentai

### Naudoja studentų spalvas
- `StudentWeeklyScheduleCalendar.tsx`
- Kiti studentų tvarkaraščio komponentai

### Naudoja dalykų spalvas
- `StudentWeeklyScheduleCalendar.tsx` - dalykų vizualiniam atskyrimui pagal statusą
  - **planned**: Balta kortelė su dalyko spalvos krašteliu
  - **in_progress**: Visa kortelė nudažyta dalyko spalva
  - **completed**: Dalyko spalvos kraštelis + pilkas fonas (`gray-200`)
- `WeeklyScheduleCalendar.tsx` - mentorių tvarkaraštyje
- Kiti tvarkaraščio komponentai

## Ateities plėtros galimybės

- Galima pridėti daugiau spalvų schemų (pvz., administratorių)
- Galima pridėti tema (tamsi/šviesi)
- Galima pridėti spalvų personalizavimą pagal vartotojo poreikius


## Spalvų kodai .....

<!DOCTYPE html>
<html lang="lt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>50 Pastelinių Spalvų</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            color: #4a5568;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.8;
        }
        
        .color-section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 1.5rem;
            color: #2d3748;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 600;
            padding: 10px;
            background: rgba(255,255,255,0.7);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        
        .color-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .color-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .color-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 35px rgba(0,0,0,0.15);
        }
        
        .color-swatch {
            height: 80px;
            position: relative;
            overflow: hidden;
        }
        
        .color-swatch::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
            transform: translateX(-100%);
            transition: transform 0.6s;
        }
        
        .color-card:hover .color-swatch::before {
            transform: translateX(100%);
        }
        
        .color-info {
            padding: 15px;
            text-align: center;
        }
        
        .color-name {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 5px;
            font-size: 0.9rem;
        }
        
        .color-description {
            font-size: 0.8rem;
            color: #718096;
            font-style: italic;
        }
        
        /* Spalvų definicijos */
        .red-200 { background-color: #fecaca; }
        .pink-200 { background-color: #fbb6ce; }
        .rose-200 { background-color: #fbb6ce; }
        .orange-200 { background-color: #fed7aa; }
        .amber-200 { background-color: #fde68a; }
        .yellow-200 { background-color: #fef08a; }
        .lime-200 { background-color: #d9f99d; }
        .peach-200 { background-color: #ffdbcc; }
        .coral-200 { background-color: #ff9999; }
        .salmon-200 { background-color: #ffb3ba; }
        
        .green-200 { background-color: #bbf7d0; }
        .emerald-200 { background-color: #a7f3d0; }
        .teal-200 { background-color: #99f6e4; }
        .cyan-200 { background-color: #a5f3fc; }
        .sky-200 { background-color: #bae6fd; }
        .blue-200 { background-color: #bfdbfe; }
        .indigo-200 { background-color: #c7d2fe; }
        .violet-200 { background-color: #ddd6fe; }
        .purple-200 { background-color: #e9d5ff; }
        .fuchsia-200 { background-color: #f5d0fe; }
        
        .slate-200 { background-color: #e2e8f0; }
        .gray-200 { background-color: #e5e7eb; }
        .zinc-200 { background-color: #e4e4e7; }
        .neutral-200 { background-color: #e5e5e5; }
        .stone-200 { background-color: #e7e5e4; }
        .warm-gray-200 { background-color: #f3f4f6; }
        .cool-gray-200 { background-color: #e5e7eb; }
        .blue-gray-200 { background-color: #e2e8f0; }
        
        .mint-200 { background-color: #aaffc3; }
        .sage-200 { background-color: #c9e4ca; }
        .lavender-200 { background-color: #e6e6fa; }
        .lilac-200 { background-color: #dda0dd; }
        .periwinkle-200 { background-color: #c5c5ff; }
        .baby-blue-200 { background-color: #89cff0; }
        .powder-blue-200 { background-color: #b6d7ff; }
        .seafoam-200 { background-color: #93e9be; }
        .aqua-200 { background-color: #7fdbff; }
        .turquoise-200 { background-color: #afeeee; }
        .mint-green-200 { background-color: #98fb98; }
        .pistachio-200 { background-color: #93c572; }
        
        .champagne-200 { background-color: #f7e7ce; }
        .cream-200 { background-color: #fffdd0; }
        .ivory-200 { background-color: #fffff0; }
        .vanilla-200 { background-color: #f3e5ab; }
        .buttercream-200 { background-color: #fff8dc; }
        .lemon-200 { background-color: #fffacd; }
        .honeydew-200 { background-color: #f0fff0; }
        .cotton-candy-200 { background-color: #ffb7ce; }
        .blush-200 { background-color: #de5d83; }
        .dusty-rose-200 { background-color: #dcae96; }
        .mauve-200 { background-color: #e0b4d6; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 50 Pastelinių Spalvų</h1>
        <p>Švelnūs, raminantys atspalviai švietimo ir mokymosi aplikacijoms</p>
    </div>

    <div class="color-section">
        <h2 class="section-title">🔥 Šiltosios pastelinės spalvos</h2>
        <div class="color-grid">
            <div class="color-card">
                <div class="color-swatch red-200"></div>
                <div class="color-info">
                    <div class="color-name">Red-200</div>
                    <div class="color-description">Pastelinė raudona</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch pink-200"></div>
                <div class="color-info">
                    <div class="color-name">Pink-200</div>
                    <div class="color-description">Pastelinė rožinė</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch rose-200"></div>
                <div class="color-info">
                    <div class="color-name">Rose-200</div>
                    <div class="color-description">Pastelinė rožių</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch orange-200"></div>
                <div class="color-info">
                    <div class="color-name">Orange-200</div>
                    <div class="color-description">Pastelinė oranžinė</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch amber-200"></div>
                <div class="color-info">
                    <div class="color-name">Amber-200</div>
                    <div class="color-description">Pastelinė gintarinė</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch yellow-200"></div>
                <div class="color-info">
                    <div class="color-name">Yellow-200</div>
                    <div class="color-description">Pastelinė geltona</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch lime-200"></div>
                <div class="color-info">
                    <div class="color-name">Lime-200</div>
                    <div class="color-description">Pastelinė citrinų žalia</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch peach-200"></div>
                <div class="color-info">
                    <div class="color-name">Peach-200</div>
                    <div class="color-description">Pastelinė persikų</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch coral-200"></div>
                <div class="color-info">
                    <div class="color-name">Coral-200</div>
                    <div class="color-description">Pastelinė koralinė</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch salmon-200"></div>
                <div class="color-info">
                    <div class="color-name">Salmon-200</div>
                    <div class="color-description">Pastelinė lašišos</div>
                </div>
            </div>
        </div>
    </div>

    <div class="color-section">
        <h2 class="section-title">❄️ Šaltosios pastelinės spalvos</h2>
        <div class="color-grid">
            <div class="color-card">
                <div class="color-swatch green-200"></div>
                <div class="color-info">
                    <div class="color-name">Green-200</div>
                    <div class="color-description">Pastelinė žalia</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch emerald-200"></div>
                <div class="color-info">
                    <div class="color-name">Emerald-200</div>
                    <div class="color-description">Pastelinė smaragdinė</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch teal-200"></div>
                <div class="color-info">
                    <div class="color-name">Teal-200</div>
                    <div class="color-description">Pastelinė žalsvai mėlyna</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch cyan-200"></div>
                <div class="color-info">
                    <div class="color-name">Cyan-200</div>
                    <div class="color-description">Pastelinė žydra</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch sky-200"></div>
                <div class="color-info">
                    <div class="color-name">Sky-200</div>
                    <div class="color-description">Pastelinė dangaus</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch blue-200"></div>
                <div class="color-info">
                    <div class="color-name">Blue-200</div>
                    <div class="color-description">Pastelinė mėlyna</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch indigo-200"></div>
                <div class="color-info">
                    <div class="color-name">Indigo-200</div>
                    <div class="color-description">Pastelinė indigo</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch violet-200"></div>
                <div class="color-info">
                    <div class="color-name">Violet-200</div>
                    <div class="color-description">Pastelinė violetinė</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch purple-200"></div>
                <div class="color-info">
                    <div class="color-name">Purple-200</div>
                    <div class="color-description">Pastelinė purpurinė</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch fuchsia-200"></div>
                <div class="color-info">
                    <div class="color-name">Fuchsia-200</div>
                    <div class="color-description">Pastelinė fuksijų</div>
                </div>
            </div>
        </div>
    </div>

    <div class="color-section">
        <h2 class="section-title">⚖️ Neutraliosios pastelinės spalvos</h2>
        <div class="color-grid">
            <div class="color-card">
                <div class="color-swatch slate-200"></div>
                <div class="color-info">
                    <div class="color-name">Slate-200</div>
                    <div class="color-description">Pastelinė pilkai melsva</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch gray-200"></div>
                <div class="color-info">
                    <div class="color-name">Gray-200</div>
                    <div class="color-description">Pastelinė pilka</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch zinc-200"></div>
                <div class="color-info">
                    <div class="color-name">Zinc-200</div>
                    <div class="color-description">Pastelinė cinko</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch neutral-200"></div>
                <div class="color-info">
                    <div class="color-name">Neutral-200</div>
                    <div class="color-description">Pastelinė neutrali</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch stone-200"></div>
                <div class="color-info">
                    <div class="color-name">Stone-200</div>
                    <div class="color-description">Pastelinė akmens</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch warm-gray-200"></div>
                <div class="color-info">
                    <div class="color-name">Warm-Gray-200</div>
                    <div class="color-description">Pastelinė šilta pilka</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch cool-gray-200"></div>
                <div class="color-info">
                    <div class="color-name">Cool-Gray-200</div>
                    <div class="color-description">Pastelinė šalta pilka</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch blue-gray-200"></div>
                <div class="color-info">
                    <div class="color-name">Blue-Gray-200</div>
                    <div class="color-description">Pastelinė mėlynai pilka</div>
                </div>
            </div>
        </div>
    </div>

    <div class="color-section">
        <h2 class="section-title">🌿 Papildomos švelniųjų atspalvių spalvos</h2>
        <div class="color-grid">
            <div class="color-card">
                <div class="color-swatch mint-200"></div>
                <div class="color-info">
                    <div class="color-name">Mint-200</div>
                    <div class="color-description">Pastelinė mėtų</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch sage-200"></div>
                <div class="color-info">
                    <div class="color-name">Sage-200</div>
                    <div class="color-description">Pastelinė šalavijų</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch lavender-200"></div>
                <div class="color-info">
                    <div class="color-name">Lavender-200</div>
                    <div class="color-description">Pastelinė levandų</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch lilac-200"></div>
                <div class="color-info">
                    <div class="color-name">Lilac-200</div>
                    <div class="color-description">Pastelinė alyvinė</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch periwinkle-200"></div>
                <div class="color-info">
                    <div class="color-name">Periwinkle-200</div>
                    <div class="color-description">Pastelinė barvinko</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch baby-blue-200"></div>
                <div class="color-info">
                    <div class="color-name">Baby-Blue-200</div>
                    <div class="color-description">Pastelinė kūdikio mėlyna</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch powder-blue-200"></div>
                <div class="color-info">
                    <div class="color-name">Powder-Blue-200</div>
                    <div class="color-description">Pastelinė pudros mėlyna</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch seafoam-200"></div>
                <div class="color-info">
                    <div class="color-name">Seafoam-200</div>
                    <div class="color-description">Pastelinė jūros putos</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch aqua-200"></div>
                <div class="color-info">
                    <div class="color-name">Aqua-200</div>
                    <div class="color-description">Pastelinė vandens</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch turquoise-200"></div>
                <div class="color-info">
                    <div class="color-name">Turquoise-200</div>
                    <div class="color-description">Pastelinė turkio</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch mint-green-200"></div>
                <div class="color-info">
                    <div class="color-name">Mint-Green-200</div>
                    <div class="color-description">Pastelinė mėtų žalia</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch pistachio-200"></div>
                <div class="color-info">
                    <div class="color-name">Pistachio-200</div>
                    <div class="color-description">Pastelinė pistacijų</div>
                </div>
            </div>
        </div>
    </div>

    <div class="color-section">
        <h2 class="section-title">✨ Unikalūs pasteliniai atspalviai</h2>
        <div class="color-grid">
            <div class="color-card">
                <div class="color-swatch champagne-200"></div>
                <div class="color-info">
                    <div class="color-name">Champagne-200</div>
                    <div class="color-description">Pastelinė šampano</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch cream-200"></div>
                <div class="color-info">
                    <div class="color-name">Cream-200</div>
                    <div class="color-description">Pastelinė kremo</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch ivory-200"></div>
                <div class="color-info">
                    <div class="color-name">Ivory-200</div>
                    <div class="color-description">Pastelinė dramblio kaulo</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch vanilla-200"></div>
                <div class="color-info">
                    <div class="color-name">Vanilla-200</div>
                    <div class="color-description">Pastelinė vanilės</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch buttercream-200"></div>
                <div class="color-info">
                    <div class="color-name">Buttercream-200</div>
                    <div class="color-description">Pastelinė sviesto kremo</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch lemon-200"></div>
                <div class="color-info">
                    <div class="color-name">Lemon-200</div>
                    <div class="color-description">Pastelinė citrinos</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch honeydew-200"></div>
                <div class="color-info">
                    <div class="color-name">Honeydew-200</div>
                    <div class="color-description">Pastelinė medaus rasos</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch cotton-candy-200"></div>
                <div class="color-info">
                    <div class="color-name">Cotton-Candy-200</div>
                    <div class="color-description">Pastelinė vatos cukraus</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch blush-200"></div>
                <div class="color-info">
                    <div class="color-name">Blush-200</div>
                    <div class="color-description">Pastelinė rausvumo</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch dusty-rose-200"></div>
                <div class="color-info">
                    <div class="color-name">Dusty-Rose-200</div>
                    <div class="color-description">Pastelinė dulkėtos rožės</div>
                </div>
            </div>
            <div class="color-card">
                <div class="color-swatch mauve-200"></div>
                <div class="color-info">
                    <div class="color-name">Mauve-200</div>
                    <div class="color-description">Pastelinė violetinai rožinė</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>