# /DOC/HYDRATION_FIX.md

# React Hydration Mismatch Fix Documentation

## Problemos aprašymas

**Data:** 2025-08-26  
**Problema:** React hydration mismatch klaida login puslapyje, kur serveris ir klientas generuoja skirtingus input ID.

## Ištaisytos problemos

### 1. Input komponento hydration problema
- **Failas:** `frontend/src/components/ui/Input.tsx`
- **Problema:** `Math.random().toString(36).substr(2, 9)` generuoja skirtingus ID serverio ir kliento pusėse
- **Sprendimas:** Pakeista į React `useId()` hook'ą, kuris generuoja nuoseklius ID

### 2. API URL nenuoseklumas
- **Failas:** `frontend/src/lib/api.ts`
- **Problema:** Token refresh endpoint'as naudoja neteisingą URL (`/api/token/refresh/` vietoj `/api/users/token/refresh/`)
- **Sprendimas:** Atnaujintas URL į teisingą backend'o endpoint'ą

### 3. Autentifikacijos būsenos nenuoseklumas
- **Failas:** `frontend/src/hooks/useAuth.ts`
- **Problema:** Server-side rendering metu bandoma pasiekti `localStorage`
- **Sprendimas:** Pridėta `refreshAuthToken()` metodas ir pagerintas `initializeAuth()` server-side rendering palaikymas

## Atlikti pakeitimai

### Input.tsx
```typescript
// Prieš:
const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

// Po:
const generatedId = useId();
const inputId = id || `input-${generatedId}`;
```

### api.ts
```typescript
// Prieš:
const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {

// Po:
const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
```

### useAuth.ts
- Pridėtas `refreshAuthToken()` metodas
- Pagerintas `initializeAuth()` server-side rendering palaikymas
- Pridėta geresnė klaidų apdorojimo logika

## Testavimo instrukcijos

### 1. Patikrinti hydration klaidas
1. Atidaryti browser console
2. Eiti į `/auth/login` puslapį
3. Patikrinti, ar nėra hydration mismatch klaidų

### 2. Patikrinti autentifikaciją
1. Prisijungti su teisingais duomenimis
2. Patikrinti, ar nukreipia į dashboard'ą
3. Patikrinti, ar JWT token refresh veikia

### 3. Patikrinti backend'o logus
```bash
sudo journalctl -u a-dienynas-backend -f
```
Tikėtina, kad `/api/users/token/refresh/` endpoint'as dabar veiks tinkamai.

## Rezultatai

- ✅ React hydration mismatch klaidos išspręstos
- ✅ API endpoint'ų URL'ai suderinti su backend'u
- ✅ Autentifikacijos būsena nuoseklesnė tarp serverio ir kliento
- ✅ Geresnis klaidų apdorojimas token refresh metu

## Ateities priežiūra

- Stebėti console klaidas po šių pakeitimų
- Patikrinti, ar autentifikacijos srautas veikia tinkamai
- Jei reikia, pridėti papildomą logging'ą autentifikacijos procesui
