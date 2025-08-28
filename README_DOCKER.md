# README_DOCKER.md

# A-DIENYNAS Docker Deployment Guide

# Comprehensive Docker deployment guide for IT engineers
# CHANGE: Created Docker deployment README with step-by-step instructions

## 🚀 **GREITAS PALEIDIMAS**

### **1. Paruošimas (5 min.)**
```bash
# Klonuoti projektą
git clone <repository-url>
cd A-DIENYNAS

# Sukurti aplinkos failą
cp env.docker.example .env.docker
nano .env.docker  # Redaguoti reikšmes

# Nustatyti teises
chmod +x scripts/*.sh
```

### **2. Paleidimas (10 min.)**
```bash
# Paleisti deployment
./scripts/deploy.sh

# Arba rankiniu būdu:
docker compose up -d
```

### **3. Patikrinimas**
```bash
# Patikrinti statusą
docker compose ps

# Peržiūrėti log'us
docker compose logs -f
```

**Sistema pasiekiama:**
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:8000  
- 📡 Nginx Proxy: http://localhost
- 🗄️ Database: localhost:5432

## 📋 **REIKALAVIMAI**

### **Sistemos Reikalavimai**
- **OS:** Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM:** Minimum 4GB, Rekomenduojama 8GB+
- **Diskas:** Minimum 20GB laisvo vietos
- **Docker:** 20.10+ su Docker Compose 2.0+

### **Tinklo Reikalavimai**
- **Portai:** 80, 443, 3000, 8000, 5432, 6379
- **Firewall:** UFW arba iptables
- **SSL:** Let's Encrypt sertifikatai (production)

## 🛠️ **INSTALIAVIMAS**

### **1. Docker Engine**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# CentOS/RHEL
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
```

### **2. Docker Compose**
```bash
# Įdiegti Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Patikrinti versiją
docker compose version
```

### **3. Reikalingi Paketai**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y curl wget git htop unzip

# CentOS/RHEL
sudo yum install -y curl wget git htop unzip
```

## 🔧 **KONFIGŪRACIJA**

### **1. Aplinkos Kintamieji**
```bash
# Sukurti .env.docker failą
cp env.docker.example .env.docker

# Redaguoti reikšmes
nano .env.docker
```

**Kritiniai kintamieji:**
```bash
# Duomenų bazė
POSTGRES_PASSWORD=your_secure_password_here
SECRET_KEY=your_super_secure_django_secret_key

# Domain'ai
DOMAIN_NAME=yourdomain.com
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# SSL
SSL_ENABLED=True
```

### **2. SSL Sertifikatai (Production)**
```bash
# Įdiegti Certbot
sudo apt install certbot python3-certbot-nginx

# Gauti sertifikatą
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Automatinis atnaujinimas
sudo crontab -e
# Pridėti: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **3. Firewall Nustatymai**
```bash
# Įjungti UFW
sudo ufw enable

# Atidaryti portus
sudo ufw allow 22/tcp        # SSH
sudo ufw allow 80/tcp        # HTTP
sudo ufw allow 443/tcp       # HTTPS

# Patikrinti statusą
sudo ufw status
```

## 🚀 **DEPLOYMENT**

### **1. Automatinis Deployment**
```bash
# Paleisti deployment skriptą
./scripts/deploy.sh
```

**Skriptas atlieka:**
- ✅ Patikrina Docker statusą
- ✅ Sukuria reikalingus katalogus
- ✅ Nustato teises
- ✅ Sustabdo esamus containerius
- ✅ Sukuria Docker image'us
- ✅ Paleidžia containerius
- ✅ Palaukia kol pasileis
- ✅ Patikrina statusą
- ✅ Paleidžia Django migracijas
- ✅ Sukuria superuser
- ✅ Rinkia statinius failus
- ✅ Testuoja API endpoint'us

### **2. Rankinis Deployment**
```bash
# Sustabdyti esamus containerius
docker compose down

# Sukurti image'us
docker compose build --no-cache

# Paleisti containerius
docker compose up -d

# Patikrinti statusą
docker compose ps

# Paleisti migracijas
docker compose exec backend python manage.py migrate

# Rinkti statinius failus
docker compose exec backend python manage.py collectstatic --noinput
```

### **3. Production Deployment**
```bash
# Production aplinkos kintamieji
cp .env.docker .env.docker.prod
nano .env.docker.prod

# Production deployment
docker compose -f docker-compose.yml --env-file .env.docker.prod up -d

# Patikrinti SSL sertifikatus
sudo certbot certificates
```

## 💾 **BACKUP IR ATKURIMAS**

### **1. Automatinis Backup**
```bash
# Paleisti backup
./scripts/backup.sh

# Nustatyti cron job
crontab -e

# Kasdienis backup 02:00
0 2 * * * /path/to/A-DIENYNAS/scripts/backup.sh >> /path/to/A-DIENYNAS/logs/backup.log 2>&1

# Kas savaitės backup 03:00 (sekmadieniais)
0 3 * * 0 /path/to/A-DIENYNAS/scripts/backup.sh >> /path/to/A-DIENYNAS/logs/weekly_backup.log 2>&1
```

### **2. Backup Struktūra**
```
backups/
├── database/          # PostgreSQL backup'ai
├── uploads/           # Media failai
├── logs/              # Log failai
├── configs/           # Konfigūracijos
└── volumes/           # Docker volume'ai
```

### **3. Atkūrimas**
```bash
# Atkurti iš backup'o
./scripts/restore.sh 20250101_120000

# Arba rankiniu būdu:
docker compose stop backend frontend
docker compose exec -T postgres psql -U a_dienynas_user -d a_dienynas < backups/database/backup_20250101_120000.sql
docker compose start backend frontend
```

## 📊 **MONITORINGAS**

### **1. Containerių Statusas**
```bash
# Patikrinti statusą
docker compose ps

# Peržiūrėti log'us
docker compose logs -f

# Resursų naudojimas
docker stats
```

### **2. Sistemos Resursai**
```bash
# Diskų naudojimas
df -h

# Atminties naudojimas
free -h

# Procesų informacija
htop
```

### **3. Log'ų Peržiūra**
```bash
# Nginx log'ai
tail -f logs/nginx/access.log
tail -f logs/nginx/error.log

# Django log'ai
tail -f logs/django/django.log

# Frontend log'ai
tail -f logs/frontend/next.log
```

## 🔒 **SAUGUMAS**

### **1. Failų Teisės**
```bash
# Nustatyti teisingas teises
sudo chown -R $USER:$USER /path/to/A-DIENYNAS/
chmod 600 .env.docker
chmod 755 scripts/*.sh
chmod 644 docker/nginx/sites-enabled/*
```

### **2. SSL/HTTPS**
```bash
# Patikrinti SSL sertifikatus
sudo certbot certificates

# Atnaujinti sertifikatus
sudo certbot renew

# Patikrinti SSL konfigūraciją
docker compose exec nginx nginx -t
```

### **3. Firewall**
```bash
# Patikrinti UFW statusą
sudo ufw status

# Patikrinti atidarytus portus
sudo ss -tlnp | grep -E ':(80|443|3000|8000|5432)'
```

## 🚨 **TROUBLESHOOTING**

### **1. Containeriai nepasileidžia**
```bash
# Patikrinti log'us
docker compose logs

# Patikrinti Docker statusą
docker info

# Patikrinti portų užimtumą
sudo ss -tlnp | grep -E ':(80|443|3000|8000|5432)'
```

### **2. Duomenų bazės problemos**
```bash
# Patikrinti PostgreSQL statusą
docker compose ps postgres

# Patikrinti PostgreSQL log'us
docker compose logs postgres

# Prisijungti prie PostgreSQL
docker compose exec postgres psql -U a_dienynas_user -d a_dienynas
```

### **3. Nginx proxy problemos**
```bash
# Patikrinti Nginx konfigūraciją
docker compose exec nginx nginx -t

# Patikrinti Nginx log'us
docker compose logs nginx

# Perkrauti Nginx
docker compose exec nginx nginx -s reload
```

## 📋 **CHECKLIST**

### **Prieš Deployment:**
- [ ] Docker Engine įdiegtas ir veikia
- [ ] Docker Compose įdiegtas
- [ ] .env.docker failas sukonfigūruotas
- [ ] UFW firewall sukonfigūruotas
- [ ] SSL sertifikatai paruošti (production)

### **Deployment Metu:**
- [ ] Containeriai pasileidžia be klaidų
- [ ] Duomenų bazė prisijungia
- [ ] Backend API atsako
- [ ] Frontend rodomas
- [ ] Nginx proxy veikia
- [ ] Statiniai failai servuojami

### **Po Deployment:**
- [ ] Backup skriptai veikia
- [ ] Monitoringas veikia
- [ ] Log'ai renkami
- [ ] SSL sertifikatai veikia (production)
- [ ] Failų teisės teisingos

## 🔄 **ATNAUJINIMAI**

### **1. Kodas Atnaujinti**
```bash
# Atnaujinti kodą
git pull origin main

# Perkurti containerius
docker compose down
docker compose build --no-cache
docker compose up -d

# Paleisti migracijas
docker compose exec backend python manage.py migrate

# Rinkti statinius failus
docker compose exec backend python manage.py collectstatic --noinput
```

### **2. Konfigūracijos Atnaujinimas**
```bash
# Atnaujinti .env.docker
nano .env.docker

# Perkrauti containerius
docker compose restart

# Patikrinti statusą
docker compose ps
```

## 📚 **NAUDINGOS KOMANDOS**

### **Docker Komandos**
```bash
# Containerių valdymas
docker compose up -d          # Paleisti
docker compose down           # Sustabdyti
docker compose restart        # Perkrauti
docker compose ps            # Statusas
docker compose logs -f       # Log'ai

# Image valdymas
docker compose build         # Sukurti image'us
docker compose pull          # Atnaujinti image'us
docker images               # Sąrašas
docker rmi <image>          # Ištrinti image

# Volume valdymas
docker volume ls            # Sąrašas
docker volume inspect <vol> # Informacija
docker volume rm <vol>      # Ištrinti
```

### **Sistemos Komandos**
```bash
# Monitoringas
htop                        # Procesų informacija
df -h                       # Diskų naudojimas
free -h                     # Atminties naudojimas
sudo ss -tlnp               # Portų statusas

# Log'ai
tail -f logs/nginx/access.log
tail -f logs/django/django.log
journalctl -u docker -f
```

## 📞 **PAGALBA**

### **Dokumentacija**
- 📖 [Docker Setup Guide](../DOC/DOCKER_SETUP_GUIDE.md) - Išsamus Docker vadovas
- 📖 [Production Guide](../DOC/PRODUCTION.md) - Production aplinkos nustatymas
- 📖 [Environment Variables](../DOC/ENV.md) - Aplinkos kintamųjų nustatymas

### **Log'ai ir Debug'as**
```bash
# Visų containerių log'ai
docker compose logs -f

# Konkretaus serviso log'ai
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx

# Containerio shell
docker compose exec backend bash
docker compose exec postgres psql -U a_dienynas_user -d a_dienynas
```

### **Kontaktai**
- **IT Inžinieriai:** Docker deployment klausimai
- **Dokumentacija:** `/DOC` kataloge
- **Skriptai:** `/scripts` kataloge

---

**Pastaba:** Šis dokumentas yra atsinaujintas 2025-01-25. Visi pakeitimai dokumentuojami CHANGE komentaruose.

**Sėkmės deployment'e! 🚀**
