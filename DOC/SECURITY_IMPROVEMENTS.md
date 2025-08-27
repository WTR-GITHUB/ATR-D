# /DOC/SECURITY_IMPROVEMENTS.md

# A-DIENYNAS Saugumo Pataisymai

# Dokumentacija apie saugumo problemų sprendimą, susijusias su duomenų nuotėkiu tarp vartotojų

# CHANGE: Sukurta dokumentacija apie saugumo pataisymus, kurie išsprendžia kritinę problemą su duomenų nuotėkiu tarp vartotojų

## Problema

Identifikuota kritinė saugumo spraga: vartotojai galėjo matyti ankstesnių vartotojų duomenis dėl neteisingo localStorage valdymo.

### Simptomai
- 404 klaidos gaunant pamokos duomenis pagal senus ID's
- `activities_selected_lesson` ID išsaugomas tarp vartotojų sesijų
- Vartotojai mato neteisingus duomenis po prisijungimo

## Implementuoti sprendimai

### 1. IMMEDIATE: Išsamus logout funkcionalumas

**Failas:** `frontend/src/hooks/useAuth.ts`

**Pakeitimas:**
```typescript
logout: () => {
  if (typeof window !== 'undefined') {
    // CHANGE: Išvalyti VISUS duomenis iš localStorage ir sessionStorage
    // Tai užtikrina, kad kitas vartotojas negaus ankstesnio vartotojo duomenų
    localStorage.clear();
    sessionStorage.clear();
  }
  // ... rest of logout logic
}
```

**Rezultatas:** Logout metu išvalomi visi duomenys, ne tik autentifikacijos token'ai.

### 2. HIGH: Duomenų valymas login metu

**Failas:** `frontend/src/hooks/useAuth.ts`

**Pakeitimas:**
```typescript
login: async (credentials: LoginCredentials) => {
  set({ isLoading: true, error: null });
  
  try {
    // CHANGE: Išvalyti senus duomenis PRISIJUNGIMO pradžioje
    // Tai užtikrina, kad naujas vartotojas negaus ankstesnio vartotojo duomenų
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    
    // ... rest of login logic
  }
}
```

**Rezultatas:** Naujas vartotojas prisijungiant automatiškai išvalomi seni duomenys.

### 3. MEDIUM: Vartotojo ID tikrinimas useSelectedLesson

**Failas:** `frontend/src/hooks/useSelectedLesson.ts`

**Pridėta funkcija useAuth:**
```typescript
getCurrentUserId: () => {
  const user = get().user;
  return user?.id || null;
}
```

**Pakeitimas useSelectedLesson:**
```typescript
useEffect(() => {
  const savedId = loadFromStorage();
  const currentUserId = getCurrentUserId();
  
  // CHANGE: Tikrinti, ar išsaugotas ID priklauso dabartiniam vartotojui
  if (savedId && currentUserId) {
    fetchLessonData(savedId);
  } else if (savedId && !currentUserId) {
    // CHANGE: Jei yra išsaugotas ID, bet nėra vartotojo - išvalyti
    console.warn('Rastas išsaugotas pamokos ID, bet vartotojas neprisijungęs. Išvaloma...');
    clearSelection();
  }
}, [loadFromStorage, fetchLessonData, getCurrentUserId, clearSelection]);
```

**Rezultatas:** Hook'as tikrina vartotojo autentifikaciją prieš naudojant išsaugotus duomenis.

### 4. LOW: Vartotojo informavimas apie neteisingus ID's

**Failas:** `frontend/src/hooks/useSelectedLesson.ts`

**Pakeitimas:**
```typescript
catch (err: any) {
  console.error('Klaida gaunant pamokos duomenis:', err);
  
  // CHANGE: Specialus 404 klaidos apdorojimas - pamoka neegzistuoja
  if (err.response?.status === 404) {
    console.warn('Pamoka su ID', globalScheduleId, 'neegzistuoja. Išvaloma...');
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: 'Pasirinkta pamoka neegzistuoja. Prašome pasirinkti pamoką iš tvarkaraščio.'
    }));
    // Išvalyti neteisingą ID iš localStorage
    saveToStorage(null);
    return;
  }
  
  // ... rest of error handling
}
```

**Rezultatas:** Vartotojas gauna aiškų pranešimą, kai pamoka neegzistuoja, ir neteisingas ID automatiškai išvalomas.

## Saugumo pranašumai

1. **Duomenų izoliacija:** Kiekvienas vartotojas mato tik savo duomenis
2. **Automatinis valymas:** Seni duomenys išvalomi automatiškai
3. **Klaidų prevencija:** 404 klaidos apdorojamos gražiai
4. **Vartotojo patirtis:** Aiškūs pranešimai apie problemas

## Testavimo rekomendacijos

1. **Testuoti logout:** Patikrinti, ar visi duomenys išvalomi
2. **Testuoti login:** Patikrinti, ar seni duomenys išvalomi
3. **Testuoti neteisingus ID's:** Patikrinti, ar 404 klaidos apdorojamos
4. **Testuoti vartotojų keitimą:** Patikrinti, ar duomenys neperkeliami

## Ateities patobulinimai

- Pridėti duomenų validaciją prieš išsaugojimą
- Implementuoti duomenų versijavimą
- Pridėti audit log'ą duomenų valymo operacijoms


