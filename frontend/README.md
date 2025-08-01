# A-DIENYNAS Frontend

Moderni studentų dienynas ir mokymosi valdymo sistema, sukurta naudojant Next.js, TypeScript ir Tailwind CSS.

## Technologijos

- **Next.js 15** - React framework
- **TypeScript** - Tipų saugumas
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **Axios** - HTTP klientas
- **Lucide React** - Ikonos
- **React Hook Form** - Formų valdymas

## Funkcionalumas

### Vartotojų valdymas
- Studentų, tėvų, kuratorių ir mentorius valdymas
- Rolės pagrindu skirtingos teisės
- Saugus prisijungimas su JWT

### Mokymosi valdymas
- Dalykų ir lygių valdymas
- Studentų progreso sekimas
- Tėvų ir kuratorių ryšių valdymas

### Sistemos funkcijos
- Moderni ir responsive dizainas
- Realaus laiko atnaujinimai
- Intuityvus vartotojo sąsaja

## Instaliavimas

1. **Įdėkite priklausomybes:**
```bash
npm install
```

2. **Paleiskite development serverį:**
```bash
npm run dev
```

3. **Atidarykite naršyklę:**
```
http://localhost:3000
```

## Projekto struktūra

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Autentifikacijos puslapiai
│   ├── dashboard/         # Dashboard puslapiai
│   └── layout.tsx         # Pagrindinis layout
├── components/            # React komponentai
│   ├── ui/               # Baziniai UI komponentai
│   ├── layout/           # Layout komponentai
│   └── forms/            # Formų komponentai
├── hooks/                # Custom React hooks
├── lib/                  # Utilities ir konfigūracija
└── styles/               # Papildomi stiliai
```

## API Integracija

Frontend automatiškai nukreipia `/api/*` užklausas į Django backend serverį (`http://localhost:8000/api/*`).

### Pagrindiniai API endpoint'ai:

- **Autentifikacija:** `/api/token/`, `/api/token/refresh/`
- **Vartotojai:** `/api/users/`
- **Dalykai:** `/api/subjects/`
- **Lygiai:** `/api/levels/`
- **Studentų-tėvų ryšiai:** `/api/student-parents/`
- **Studentų-kuratorių ryšiai:** `/api/student-curators/`

## Vystymas

### Komandos

```bash
# Development serveris
npm run dev

# Production build
npm run build

# Production serveris
npm start

# Linting
npm run lint
```

### Kodo stilius

- Naudojame TypeScript tipų saugumą
- Tailwind CSS utility klases
- Komponentų kompozicija
- Custom hooks state valdymui

## Saugumas

- JWT token autentifikacija
- Automatinis token atnaujinimas
- Saugūs API užklausų interceptoriai
- XSS apsauga su Next.js

## Deployment

### Vercel (Rekomenduojama)

1. Pridėkite projektą į Vercel
2. Nustatykite environment kintamuosius:
   - `NEXT_PUBLIC_API_URL` - Backend API URL

### Kiti hostingai

1. Sukurkite production build: `npm run build`
2. Paleiskite serverį: `npm start`
3. Nustatykite environment kintamuosius

## Prisidėjimas

1. Fork'inkite projektą
2. Sukurkite feature branch: `git checkout -b feature/nauja-funkcija`
3. Commit'inkite pakeitimus: `git commit -am 'Pridėta nauja funkcija'`
4. Push'inkite į branch: `git push origin feature/nauja-funkcija`
5. Sukurkite Pull Request

## Licencija

Šis projektas yra atviro kodo ir prieinamas pagal MIT licenciją.
