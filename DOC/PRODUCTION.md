# /DOC/PRODUCTION.md

# A-DIENYNAS Production Environment Setup Guide

# Šis dokumentas aprašo, kaip paruošti A-DIENYNAS sistemą production aplinkai
# CHANGE: Sukurtas išsamus production aplinkos nustatymo vadovas su saugumo taisyklėmis

## 🔄 **DEVELOPMENT vs PRODUCTION .env nustatymai:**

### **1. Django Backend nustatymai:**

#### **Development (.env):**
```bash
# Saugumas
DEBUG=True
SECRET_KEY=django-insecure-o+kbs@e+_dri$pe3do2*2t2eid(f%y5_cdlw$*&r*$9(*thefq
ALLOWED_HOSTS=*,192.168.1.166,localhost,127.0.0.1

# CORS (laisvas prieiga)
CORS_ALLOW_ALL_ORIGINS=True
CORS_ALLOW_CREDENTIALS=True

# Duomenų bazė (SQLite)
DATABASE_ENGINE=django.db.backends.sqlite3
DATABASE_NAME=db.sqlite3

# Statiniai failai (lokalūs)
STATIC_ROOT=static
MEDIA_ROOT=media
```

#### **Production (.env):**
```bash
# Saugumas (kritiškai svarbu!)
DEBUG=False
SECRET_KEY=your-super-secure-production-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,192.168.1.166

# CORS (tik specifiniai domain'ai)
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CORS_ALLOW_CREDENTIALS=True

# Duomenų bazė (PostgreSQL/MySQL)
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=a_dienynas_prod
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_secure_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Statiniai failai (serverio keliai)
STATIC_ROOT=/var/www/static/
MEDIA_ROOT=/var/www/media/
```

### **2. Frontend nustatymai:**

#### **Development (.env):**
```bash
# API endpoint'as (lokalus)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=A-DIENYNAS
NEXT_PUBLIC_VERSION=1.0.0
```

#### **Production (.env):**
```bash
# API endpoint'as (production serveris)
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_APP_NAME=A-DIENYNAS
NEXT_PUBLIC_VERSION=1.0.0
```

## 🚨 **Kritiniai Production pakeitimai:**

### **Saugumas:**
- `DEBUG=False` - **NIEKADA** True production'e
- `SECRET_KEY` - **NEVER** naudoti development raktą
- `ALLOWED_HOSTS` - tik realūs domain'ai
- `CORS` - tik specifiniai origin'ai

### **Duomenų bazė:**
- **NEVER** SQLite production'e
- **VISADA** PostgreSQL/MySQL
- **SAUGUS** prisijungimo duomenys

### **Statiniai failai:**
- **NEVER** lokalūs keliai
- **VISADA** serverio keliai
- **NGINX** statinių failų servavimas

## 📁 **Production .env failo struktūra:**

```bash
# Production .env failas
# NIEKADA necommitinti į Git!

# Django Backend
DEBUG=False
SECRET_KEY=your-super-secure-production-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,192.168.1.166

# CORS
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CORS_ALLOW_CREDENTIALS=True

# Database (PostgreSQL)
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=a_dienynas_prod
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_secure_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Static files
STATIC_ROOT=/var/www/static/
MEDIA_ROOT=/var/www/media/

# JWT settings
JWT_ACCESS_TOKEN_LIFETIME=30
JWT_REFRESH_TOKEN_LIFETIME=1440

# Frontend
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_APP_NAME=A-DIENYNAS
NEXT_PUBLIC_VERSION=1.0.0

# Email (SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True
```

## 🔒 **Production saugumo taisyklės:**

1. **NIEKADA** `DEBUG=True` production'e
2. **NIEKADA** naudoti development `SECRET_KEY`
3. **NIEKADA** `ALLOWED_HOSTS=['*']`
4. **NIEKADA** `CORS_ALLOW_ALL_ORIGINS=True`
5. **NIEKADA** SQLite duomenų bazė
6. **VISADA** naudoti HTTPS
7. **VISADA** saugūs slaptažodžiai

## 🚀 **Kaip perjungti į production:**

### **1. Sukurti production .env failą:**
```bash
# Sukurti production .env failą
cp .env .env.production

# Redaguoti .env.production su production reikšmėmis
nano .env.production
```

### **2. Perjungti į production .env:**
```bash
# Perjungti į production .env
cp .env.production .env

# Patikrinti ar perjungta
cat .env | grep DEBUG
```

### **3. Perkrauti serverius:**
```bash
# Perkrauti backend
sudo systemctl restart a-dienynas-backend

# Perkrauti frontend
sudo systemctl restart a-dienynas-frontend

# Patikrinti statusą
sudo systemctl status a-dienynas-backend a-dienynas-frontend
```

## 🗄️ **Production duomenų bazės nustatymas:**

### **PostgreSQL įdiegimas:**
```bash
# Įdiegti PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Įjungti PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Patikrinti statusą
sudo systemctl status postgresql
```

### **Duomenų bazės sukūrimas:**
```bash
# Prisijungti prie PostgreSQL
sudo -u postgres psql

# Sukurti duomenų bazę
CREATE DATABASE a_dienynas_prod;

# Sukurti vartotoją
CREATE USER a_dienynas_user WITH PASSWORD 'your_secure_password';

# Suteikti teises
GRANT ALL PRIVILEGES ON DATABASE a_dienynas_prod TO a_dienynas_user;

# Išeiti
\q
```

### **Django migracijos:**
```bash
# Aktyvuoti virtual environment
source venv/bin/activate

# Paleisti migracijas
cd backend
python manage.py migrate

# Sukurti superuser
python manage.py createsuperuser
```

## 🔐 **HTTPS ir SSL nustatymas:**

### **Certbot įdiegimas (Let's Encrypt):**
```bash
# Įdiegti Certbot
sudo apt install certbot python3-certbot-nginx

# Gauti SSL sertifikatą
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Automatinis atnaujinimas
sudo crontab -e

# Pridėti eilutę:
0 12 * * * /usr/bin/certbot renew --quiet
```

### **Nginx HTTPS konfigūracija:**
```nginx
# /etc/nginx/sites-available/a-dienynas
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL nustatymai
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Frontend
    location / {
        root /home/vilkas/atradimai/A-DIENYNAS/frontend/.next;
        try_files $uri $uri/ /_next/static/$uri;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Statiniai failai
    location /static/ {
        alias /var/www/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Media failai
    location /media/ {
        alias /var/www/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 📊 **Production monitoringas:**

### **Systemd servisų statusas:**
```bash
# Patikrinti visų servisų statusą
sudo systemctl status nginx a-dienynas-backend a-dienynas-frontend

# Patikrinti log'us
sudo journalctl -u a-dienynas-backend -f
sudo journalctl -u a-dienynas-frontend -f
sudo tail -f /var/log/nginx/access.log
```

### **Sistemos resursai:**
```bash
# Procesų informacija
htop
ps aux | grep -E '(python|node|nginx)'

# Atminties naudojimas
free -h

# Diskų naudojimas
df -h

# Portų statusas
sudo ss -tlnp | grep -E ':(80|443|3000|8000)'
```

## 🛡️ **Saugumo patikrinimas:**

### **Failų teisės:**
```bash
# Patikrinti projekto failų teises
ls -la /home/vilkas/atradimai/A-DIENYNAS/

# Nustatyti teisingas teises
sudo chown -R vilkas:vilkas /home/vilkas/atradimai/A-DIENYNAS/
chmod -R 755 /home/vilkas/atradimai/A-DIENYNAS/
chmod 600 /home/vilkas/atradimai/A-DIENYNAS/.env
```

### **Firewall nustatymai:**
```bash
# Įjungti UFW
sudo ufw enable

# Atidaryti HTTP/HTTPS portus
sudo ufw allow 80
sudo ufw allow 443

# Atidaryti SSH portą
sudo ufw allow ssh

# Patikrinti UFW statusą
sudo ufw status
```

## 🔄 **Rollback procedūra:**

### **Grįžimas į development:**
```bash
# Grįžti į development .env
cp .env.development .env

# Perkrauti serverius
sudo systemctl restart a-dienynas-backend
sudo systemctl restart a-dienynas-frontend

# Patikrinti ar grįžta
cat .env | grep DEBUG
```

### **Backup prieš production:**
```bash
# Sukurti backup
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Sukurti development .env
cp .env .env.development
```

## 📝 **Production checklist:**

- [ ] `DEBUG=False` production .env faile
- [ ] Saugus `SECRET_KEY`
- [ ] Tikslūs `ALLOWED_HOSTS`
- [ ] CORS nustatymai production'e
- [ ] PostgreSQL/MySQL duomenų bazė
- [ ] HTTPS/SSL sertifikatas
- [ ] Teisingi failų keliai
- [ ] Saugūs slaptažodžiai
- [ ] Firewall nustatymai
- [ ] Monitoringas ir log'ai
- [ ] Backup procedūros

---

**Pastaba:** Šis dokumentas yra atsinaujintas 2025-08-25. Visi pakeitimai dokumentuojami CHANGE komentaruose.
