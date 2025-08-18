# A-DIENYNAS

Moderni studentų dienynas ir mokymosi valdymo sistema, sukurta naudojant Django REST API backend ir Next.js frontend.

## 🚀 Funkcionalumas

### Vartotojų valdymas
- **Studentai** - mokymosi progreso sekimas
- **Tėvai** - vaikų progreso stebėjimas
- **Kuratoriai** - studentų valdymas ir konsultavimas
- **Mentoriai** - dalykų mokymas ir vertinimas
- **Administratoriai** - visos sistemos valdymas

### Mokymosi valdymas
- Dalykų ir lygių organizavimas
- Studentų progreso sekimas
- Tėvų ir kuratorių ryšių valdymas
- Mentorų ir dalykų susiejimas
- **Išsamus pamokų vykdymas** - pamokos pasirinkimas, detalių rodymas, kelių pamokų palaikymas
- **IMU planų valdymas** - individualūs mokinių ugdymo planai su statusų sekimu

### Sistemos funkcijos
- Saugus JWT autentifikacija
- Moderni ir responsive vartotojo sąsaja
- Realaus laiko atnaujinimai
- RESTful API

## 🛠️ Technologijos

### Backend
- **Django 5.2** - Python web framework
- **Django REST Framework** - API kūrimas
- **Django Simple JWT** - Autentifikacija
- **SQLite** - Duomenų bazė (development)
- **CORS** - Cross-origin resource sharing

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Tipų saugumas
- **Tailwind CSS** - Stiliai
- **Zustand** - State management
- **Axios** - HTTP klientas
- **Lucide React** - Ikonos

## 📦 Instaliavimas

### 1. Klonuokite projektą
```bash
git clone <repository-url>
cd A-DIENYNAS
```

### 2. Backend setup
```bash
cd backend

# Sukurkite virtual environment
python -m venv venv

# Aktyvuokite virtual environment
source venv/bin/activate  # Linux/Mac
# arba
venv\Scripts\activate     # Windows

# Įdėkite priklausomybes
pip install -r requirements.txt

# Paleiskite migracijas
python manage.py migrate

# Sukurkite superuser
python manage.py createsuperuser

# Paleiskite serverį
python manage.py runserver
```

### 3. Frontend setup
```bash
cd frontend

# Įdėkite priklausomybes
npm install

# Paleiskite development serverį
npm run dev
```

### 4. Atidarykite naršyklę
- Backend API: http://localhost:8000
- Frontend: http://localhost:3000
- Admin panel: http://localhost:8000/admin

## 📁 Projekto struktūra

```
A-DIENYNAS/
├── backend/                 # Django backend
│   ├── core/              # Pagrindinė Django konfigūracija
│   ├── consumers/         # Vartotojų aplikacija
│   ├── manage.py          # Django management
│   └── requirements.txt   # Python priklausomybės
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # React komponentai
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Utilities
│   ├── package.json      # Node.js priklausomybės
│   └── README.md         # Frontend dokumentacija
├── venv/                 # Python virtual environment
└── README.md            # Pagrindinė dokumentacija
```

## 🔧 Vystymas

### Backend komandos
```bash
cd backend
source venv/bin/activate

# Paleisti serverį
python manage.py runserver

# Sukurti migracijas
python manage.py makemigrations

# Paleisti migracijas
python manage.py migrate

# Patikrinti kodą
python manage.py check
```

### Frontend komandos
```bash
cd frontend

# Development serveris
npm run dev

# Production build
npm run build

# Production serveris
npm start

# Linting
npm run lint
```

## 🔐 Saugumas

- JWT token autentifikacija
- Automatinis token atnaujinimas
- CORS konfigūracija
- Saugūs API endpoint'ai
- XSS apsauga

## 📊 API Dokumentacija

### Autentifikacija
- `POST /api/token/` - Prisijungimas
- `POST /api/token/refresh/` - Token atnaujinimas

### Vartotojai
- `GET /api/users/` - Vartotojų sąrašas
- `POST /api/users/` - Naujas vartotojas
- `PUT /api/users/{id}/` - Vartotojo atnaujinimas
- `DELETE /api/users/{id}/` - Vartotojo šalinimas

### Dalykai ir lygiai
- `GET /api/subjects/` - Dalykų sąrašas
- `GET /api/levels/` - Lygių sąrašas

### Ryšiai
- `GET /api/student-parents/` - Studentų-tėvų ryšiai
- `GET /api/student-curators/` - Studentų-kuratorių ryšiai
- `GET /api/student-subject-levels/` - Studentų dalykų lygiai
- `GET /api/mentor-subjects/` - Mentorų dalykai

## 🚀 Deployment

### Backend (Django)
1. Nustatykite `DEBUG = False` settings.py faile
2. Sukonfigūruokite duomenų bazę (PostgreSQL rekomenduojama)
3. Sukurkite static files: `python manage.py collectstatic`
4. Paleiskite su Gunicorn arba uWSGI

### Frontend (Next.js)
1. Sukurkite production build: `npm run build`
2. Paleiskite su Vercel, Netlify arba kitais hostingais
3. Nustatykite environment kintamuosius

## 🤝 Prisidėjimas

1. Fork'inkite projektą
2. Sukurkite feature branch: `git checkout -b feature/nauja-funkcija`
3. Commit'inkite pakeitimus: `git commit -am 'Pridėta nauja funkcija'`
4. Push'inkite į branch: `git push origin feature/nauja-funkcija`
5. Sukurkite Pull Request

## 📝 Licencija

Šis projektas yra atviro kodo ir prieinamas pagal MIT licenciją.

## 👥 Autoriai

- Sukurta kaip mokymosi projektas
- Naudojama modernių technologijų
- Skirta efektyviam mokymosi procesui organizuoti

---

**A-DIENYNAS** - Moderni studentų dienynas ir mokymosi valdymo sistema 🎓 