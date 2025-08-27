# /DOC/ACCORDION_INTEGRATION.md

# Akordeono integracija į LessonInfoCard

## Problemos aprašymas

**Data:** 2025-08-26  
**Problema:** Komponentai, Tikslai, Pasiekimo lygiai, Gebėjimai, BUP Kompetencijos, Fokusai ir Mokomoji medžiaga užima daug vietos ekrane, net kai jų nereikia matyti.

## Sprendimas

**Integruotas vienas bendras akordeono komponentas** į `LessonInfoCard`, kuris suskleidžia/išskleidžia visą informacijos dalį, o viduje išlaiko originalų grid layout'ą.

## Atlikti pakeitimai

### 1. Sukurtas Accordion komponentas
- **Failas:** `frontend/src/components/ui/Accordion.tsx`
- **Funkcionalumas:**
  - Sklandžios animacijos išskleidimui/suskleidimui
  - Kontekstas akordeono būsenai valdyti
  - Galimybė nustatyti, kurios sekcijos pagal nutylėjimą išskleistos
  - Ikonų keitimas (ChevronDown/ChevronUp)
  - **largeContent prop'as** didesniam turiniui tvarkyti

### 2. Integruotas akordeonas į LessonInfoCard
- **Failas:** `frontend/src/app/dashboard/mentors/activities/components/LessonInfoCard.tsx`
- **Pakeitimai:**
  - **Vienas bendras akordeonas** su antrašte "Pamokos informacija"
  - **Viduje atstatytas originalus grid layout** (2 eilutės po 3 korteles)
  - **largeContent={true}** prop'as akordeono elementui
  - Kiekviena sekcija išlaiko savo spalvas ir ikonas

## Akordeono struktūra

### Vienas bendras akordeonas:
- **Antraštė:** "Pamokos informacija" su BookOpen ikona
- **Pagal nutylėjimą suskleistas** - neuzima vietos, kol jų nereikia
- **Viduje:** Originalus grid layout su visais elementais

### Grid layout viduje akordeono:
**1 eilutė (3 kortelės):**
- **Komponentai** - mėlynos spalvos kortelės
- **Tikslai** - žalios spalvos kortelės  
- **Pasiekimo lygiai** - geltonos spalvos kortelės

**2 eilutė (3 kortelės):**
- **Gebėjimai** - violetinės spalvos kortelės
- **BUP Kompetencijos** - indigo spalvos kortelės
- **Fokusai** - pilkos spalvos kortelės

**Apatinė dalis (viso pločio):**
- **Mokomoji medžiaga** - pilkos spalvos kortelė

## Techniniai detaliai

### Accordion komponentas:
```typescript
interface AccordionProps {
  children: React.ReactNode;
  className?: string;
  defaultOpen?: string[]; // Pagal nutylėjimą išskleistos sekcijos
}

interface AccordionItemProps {
  id: string;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  largeContent?: boolean; // Didesniam turiniui tvarkyti
}
```

### Animacijos:
- **Trukmė:** 300ms
- **Easing:** ease-in-out
- **Efektai:** 
  - Mažam turiniui: max-height: 384px (max-h-96)
  - Dideliam turiniui: max-height: 2000px (max-h-[2000px])
  - Opacity keitimas

## Privalumai

✅ **Vietos sutaupymas** - visas informacijos blokas suskleidžiamas/išskleidžiamas  
✅ **Išlaikytas originalus dizainas** - grid layout ir spalvos lieka tos pačios  
✅ **Vienas akordeonas** - paprastesnis valdymas ir mažiau komponentų  
✅ **Geresnis organizavimas** - visa pamokos informacija viename vietoje  
✅ **Responsive dizainas** - geriau veikia mažuose ekranuose  

## Naudojimo instrukcijos

### Vartotojams:
1. **Išskleisti informaciją:** paspausti ant "Pamokos informacija" antraštės
2. **Suskleisti informaciją:** paspausti ant "Pamokos informacija" antraštės dar kartą
3. **Pagal nutylėjimą suskleistas** - neužima vietos, kol jų nereikia

### Programuotojams:
1. **Pridėti naują sekciją:** pridėti į grid layout viduje akordeono
2. **Keisti išskleistą būseną:** naudoti `defaultOpen` prop'ą
3. **Didesnis turinys:** naudoti `largeContent={true}` prop'ą

## Ateities plėtra

- **Išsaugoti vartotojo pasirinkimus** localStorage
- **Animacijų optimizavimas** didesniems duomenų kiekiams
- **Klaviatūros navigacija** (Tab, Enter, Space)
- **Accessibility** (ARIA labels, screen reader palaikymas)
- **Nestintas akordeonas** - galimybė turėti akordeoną akordeono viduje
