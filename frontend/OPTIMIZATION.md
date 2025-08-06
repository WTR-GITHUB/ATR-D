# A-DIENYNAS Optimizacijos

## Implementuotos Optimizacijos

### 1. Memoization (React.memo)

**TableCell komponentas:**
- Apgaubtas su `React.memo` - išvengia nereikalingų re-renderinimų
- Custom `useTableCellOptimization` hook'as pamokų duomenims
- Memoizuojami CSS klases, ikonos ir duomenys

```typescript
const TableCell = React.memo(({ subject, classroom, lesson }: TableCellProps) => {
  const { lessonData, icons, cssClasses } = useTableCellOptimization(subject, classroom, lesson);
  // ...
});
```

### 2. Duomenų struktūros optimizacija

**Map struktūra O(1) prieigai:**
- Vietoj `${date}-${periodId}-${levelId}` string rakto naudojamas objektas
- `useOptimizedSchedule` hook'as su Map struktūra
- Išvengiami string concatenation operacijai

```typescript
const key = {
  date: lesson.date,
  periodId: lesson.period?.id,
  levelId: lesson.level?.id
};
const keyString = JSON.stringify(key);
```

### 3. Cache'ing sistema

**Globalus cache'as:**
- Duomenų cache'ingas 5 minučių laikotarpiui
- Išvengiami daugkartiniai API kreipimaisi
- Automatinis cache'as atnaujinimas

```typescript
const getCachedData = <T>(key: 'periods' | 'classrooms' | 'schedule', maxAge: number = 5 * 60 * 1000): T | null => {
  const now = Date.now();
  const lastFetch = dataCache.lastFetch[key];
  
  if (dataCache[key] && (now - lastFetch) < maxAge) {
    return dataCache[key] as T;
  }
  
  return null;
};
```

### 4. Centrinis Loading State

**useLoadingManager hook'as:**
- Nuolatinis loading indikatorius
- Išvengia mirksėjimo
- Centrinis loading state valdymas

```typescript
const { isLoading, loadingText, startLoading, stopLoading } = useLoadingManager();
```

**LoadingSpinner komponentas:**
- Nuolatinis animuotas loading indikatorius
- Kelių dydžių spinner'iai
- Skeleton loading komponentas

### 5. Custom Hook'ai optimizacijai

**useOptimizedSchedule:**
- Memoizuojami pamokų duomenys
- O(1) greičiu paieška pagal raktą
- Filtravimas pagal datų diapazoną

**useRenderOptimization:**
- Memoizuojami renderinimo duomenys
- Greita langelio duomenų paieška
- Optimizuotas TableCell renderinimas

**useDebounce:**
- Debouncing funkcija optimizacijai
- Išvengia per daug API užklausų

**useVirtualization:**
- Virtualizacijos pagrindai dideliems duomenų rinkiniams
- Tik matomi elementai renderinami

### 6. WeeklySchedule optimizacijos

**Vienas API kreipimasis:**
- Išvengiami daugkartiniai API kreipimaisi
- Cache'ingas duomenų
- Centrinis duomenų kraunimas

**Memoizuojami komponentai:**
- `DaySchedule` komponentas su `React.memo`
- Savaitės dienos su `useMemo`
- Dienos datos funkcija su `useMemo`

**Optimizuota paieška:**
- Naudojami abu optimizacijos hook'ai
- O(1) greičiu pamokų paieška
- Memoizuojami langelio duomenys

### 7. Performance metrikos

**Optimizacijos informacija:**
- Pamokų slot'ų skaičius
- Langelio skaičius
- O(1) paieškos greitis

```typescript
<div className="text-xs text-gray-500 mb-4">
  Optimizuota tvarkaraštis: {scheduleSize} pamokų slot'ų, {totalCells} langelių, O(1) paieška
</div>
```

## Optimizacijos rezultatai

### Prieš optimizaciją:
- Nereikalingi re-renderinimai
- String concatenation operacijos
- O(n) paieškos greitis
- Nereikalingi skaičiavimai
- Daugkartiniai API kreipimaisi
- Mirksėjimas loading metu

### Po optimizacijos:
- React.memo išvengia nereikalingų re-renderinimų
- Map struktūra O(1) prieigai
- Memoizuojami duomenys ir skaičiavimai
- Optimizuotas renderinimas
- Cache'ingas išvengia daugkartinių API kreipimųsių
- Nuolatinis loading indikatorius

## Naudojimo instrukcijos

### TableCell komponentas:
```typescript
import TableCell from '@/components/dashboard/TableCell';

<TableCell
  subject="Matematika"
  classroom="101"
  lesson="Algebra"
/>
```

### Optimizuoti hook'ai:
```typescript
import { useOptimizedSchedule, useRenderOptimization } from '@/hooks/useSchedule';

const { getLessonsForSlot, scheduleSize } = useOptimizedSchedule(schedule, userId);
const { getCellData, totalCells } = useRenderOptimization(schedule, userId);
```

### Loading komponentai:
```typescript
import LoadingSpinner from '@/components/ui/LoadingSpinner';

<LoadingSpinner text="Kraunamas tvarkaraštis..." size="lg" />
```

### Centrinis loading manager:
```typescript
import { useLoadingManager } from '@/hooks/useSchedule';

const { isLoading, loadingText, startLoading, stopLoading } = useLoadingManager();
```

### Debouncing:
```typescript
import { useDebounce } from '@/hooks/useSchedule';

const debouncedValue = useDebounce(value, 300);
```

## Ateities optimizacijos

1. **Virtualizacija** - dideliems tvarkaraščiams
2. **Web Workers** - sunkiems skaičiavimams
3. **Lazy Loading** - progresyviam duomenų kraunamui
4. **CSS optimizacija** - fiksuotiems aukščiams
5. **Intersection Observer** - tik matomiems elementams
6. **Service Worker** - offline funkcionalumui
7. **IndexedDB** - lokaliems duomenų saugojimui

## Performance monitoring

Rekomenduojama pridėti:
- React DevTools Profiler
- Performance metrikos
- Bundle size analizė
- Memory leak monitoring
- Network request monitoring
- Cache hit/miss ratio tracking

## Cache'ing strategijos

### Duomenų cache'ingas:
- 5 minučių TTL (Time To Live)
- Automatinis atnaujinimas
- Force refresh galimybė

### Loading optimizacijos:
- Nuolatinis loading indikatorius
- Debouncing API užklausoms
- Centrinis loading state

### Renderinimo optimizacijos:
- React.memo komponentams
- useMemo skaičiavimams
- useCallback funkcijoms 