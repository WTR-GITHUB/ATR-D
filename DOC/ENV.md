# /DOC/ENV.md

# A-DIENYNAS Environment Variables Setup Guide

# Šis dokumentas aprašo, kaip paruošti .env failą ir perkelti konfigūracijos kintamuosius iš projekto failų į .env failą
# CHANGE: Sukurtas išsamus .env failo nustatymo vadovas su visais reikalingais žingsniais

## 📋 **VEIKSMŲ PLANAS PAŽINGSNIUI:**

### **1. Sukurti .env failą (projekto šaknyje)**
```bash
# Sukurti .env failą
touch .env

# Redaguoti .env failą
nano .env
```

**Įrašyti šiuos kintamuosius:**
```bash
# Django Backend
SECRET_KEY=django-insecure-o+kbs@e+_dri$pe3do2*2t2eid(f%y5_cdlw$*&r*$9(*thefq
DEBUG=True
ALLOWED_HOSTS=*,192.168.1.166,localhost,127.0.0.1
CORS_ALLOW_ALL_ORIGINS=True
CORS_ALLOW_CREDENTIALS=True

# Database
DATABASE_ENGINE=django.db.backends.sqlite3
DATABASE_NAME=db.sqlite3

# Static files
STATIC_URL=/static/
STATIC_ROOT=static
MEDIA_URL=/media/
MEDIA_ROOT=media

# JWT settings
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=A-DIENYNAS
NEXT_PUBLIC_VERSION=1.0.0
```

### **2. Sukurti .env.example failą**
```bash
# Sukurti .env.example failą
touch .env.example

# Redaguoti .env.example failą
nano .env.example
```

**Įrašyti pavyzdžius (be realių reikšmių):**
```bash
# Django Backend
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=*,your-ip,localhost,127.0.0.1
CORS_ALLOW_ALL_ORIGINS=True
CORS_ALLOW_CREDENTIALS=True

# Database
DATABASE_ENGINE=django.db.backends.sqlite3
DATABASE_NAME=db.sqlite3

# Static files
STATIC_URL=/static/
STATIC_ROOT=static
MEDIA_URL=/media/
MEDIA_ROOT=media

# JWT settings
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=A-DIENYNAS
NEXT_PUBLIC_VERSION=1.0.0
```

### **3. Atnaujinti .gitignore failą**
```bash
# Redaguoti .gitignore failą
nano .gitignore

# Pridėti šias eilutes failo pabaigoje:
.env
.env.local
.env.production
```

### **4. Atnaujinti backend/core/settings.py failą**
```bash
# Redaguoti settings.py failą
nano backend/core/settings.py

# Pridėti import os ir python-dotenv failo pradžioje (po from pathlib import Path):
import os
from dotenv import load_dotenv

# Pridėti .env nuskaitymą (po BASE_DIR):
load_dotenv()

# Pakeisti SECRET_KEY eilutę:
SECRET_KEY = os.getenv('SECRET_KEY')  # Perkelta į .env failą

# Pakeisti DEBUG eilutę:
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'  # Perkelta į .env failą

# Pakeisti ALLOWED_HOSTS eilutę:
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')  # Perkelta į .env failą

# Pakeisti CORS nustatymus:
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'True').lower() == 'true'  # Perkelta į .env failą
CORS_ALLOW_CREDENTIALS = os.getenv('CORS_ALLOW_CREDENTIALS', 'True').lower() == 'true'  # Perkelta į .env failą

# Pakeisti DATABASES nustatymus:
DATABASES = {
    'default': {
        'ENGINE': os.getenv('DATABASE_ENGINE', 'django.db.backends.sqlite3'),  # Perkelta į .env failą
        'NAME': BASE_DIR / os.getenv('DATABASE_NAME', 'db.sqlite3'),  # Perkelta į .env failą
    }
}

# Pakeisti STATIC_ROOT ir MEDIA_ROOT:
STATIC_ROOT = BASE_DIR / os.getenv('STATIC_ROOT', 'static')  # Perkelta į .env failą
MEDIA_ROOT = BASE_DIR / os.getenv('MEDIA_ROOT', 'media')  # Perkelta į .env failą

# Pakeisti JWT nustatymus:
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.getenv('JWT_ACCESS_TOKEN_LIFETIME', 60))),  # Perkelta į .env failą
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.getenv('JWT_REFRESH_TOKEN_LIFETIME', 1))),  # Perkelta į .env failą
    # ... kiti nustatymai lieka tie patys
}
```

### **5. Atnaujinti frontend/next.config.ts failą**
```bash
# Redaguoti next.config.ts failą
nano frontend/next.config.ts

# Pakeisti rewrites dalį:
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/:path*`,  # Perkelta į .env failą
    },
  ];
},
```

### **6. Įdiegti python-dotenv paketą**
```bash
# Aktyvuoti virtual environment
source venv/bin/activate

# Įdiegti python-dotenv
pip install python-dotenv

# Atnaujinti requirements.txt
pip freeze > requirements.txt
```

### **7. Paleisti serverius iš naujo**
```bash
# Paleisti nginx
sudo systemctl start nginx

# Paleisti backend
sudo systemctl start a-dienynas-backend

# Paleisti frontend
sudo systemctl start a-dienynas-frontend

# Patikrinti statusą
sudo systemctl status nginx a-dienynas-backend a-dienynas-frontend
```

## 🔒 **Saugumo Taisyklės:**

1. **NIEKADA** necommitinti `.env` failo į Git
2. `.env` failas turi būti `.gitignore` faile
3. `.env.example` failas gali būti commitintas (be realių reikšmių)
4. Production aplinkoje naudoti tiksliai nustatytas reikšmes

## 📁 **Failų Struktūra:**

```
A-DIENYNAS/
├── .env                    # Realūs kintamieji (NE commitinti)
├── .env.example           # Pavyzdžiai (gali būti commitintas)
├── .gitignore             # Atnaujintas su .env
├── backend/
│   └── core/
│       └── settings.py    # Atnaujintas su .env nuskaitymu
└── frontend/
    └── next.config.ts     # Atnaujintas su .env kintamaisiais
```

## 🚨 **Svarbūs Pastabai:**

- Prieš atliekant pakeitimus **SUSUSTABDYTI** visus serverius
- Po pakeitimų **PALEISTI** serverius iš naujo
- Patikrinti, ar `.env` failas yra projekto šaknyje (ne backend/ ar frontend/ kataloguose)
- Visi kintamieji turi būti be tarpų aplink `=` ženklą

## 🔍 **Troubleshooting:**

### Problema: Django neatskaito .env failo
**Sprendimas:** Patikrinti, ar `python-dotenv` įdiegtas ir ar `load_dotenv()` iškviestas

### Problema: Frontend neatskaito .env kintamųjų
**Sprendimas:** Patikrinti, ar kintamieji prasideda su `NEXT_PUBLIC_`

### Problema: Serveriai nepasileidžia
**Sprendimas:** Patikrinti .env failo sintaksę ir ar visi reikalingi kintamieji yra

---

**Pastaba:** Šis dokumentas yra atsinaujintas 2025-08-25. Visi pakeitimai dokumentuojami CHANGE komentaruose.
