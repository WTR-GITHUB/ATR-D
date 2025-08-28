# /home/master/A-DIENYNAS/PROJECT_STRUCTURE.md
# A-DIENYNAS Project Structure Documentation
# CHANGE: Created final project structure documentation
# PURPOSE: Complete overview of project files and directories
# UPDATES: Initial setup with all created files and their purposes

# 🏗️ A-DIENYNAS Project Structure

Šis dokumentas aprašo visą A-DIENYNAS projekto failų struktūrą ir jų paskirtis.

## 📁 **Root Directory Structure**

```
A-DIENYNAS/
├── 📄 README.md                           # Pagrindinė projekto dokumentacija
├── 📄 DEPLOYMENT_CHECKLIST.md             # Deployment patikrinimo sąrašas
├── 📄 PROJECT_STRUCTURE.md                # Šis failas - projekto struktūros apžvalga
├── 📄 docker-compose.yml                  # Pagrindinis Docker Compose failas
├── 📄 env.docker                          # Docker aplinkos kintamieji
├── 📁 docker/                             # Docker konfigūracijos katalogas
│   ├── 📁 backend/                        # Backend Docker konfigūracija
│   │   ├── 📄 Dockerfile                  # Backend container image
│   │   └── 📄 entrypoint.sh               # Backend startup script
│   ├── 📁 frontend/                       # Frontend Docker konfigūracija
│   │   └── 📄 Dockerfile                  # Frontend container image
│   ├── 📁 nginx/                          # Nginx Docker konfigūracija
│   │   ├── 📄 Dockerfile                  # Nginx container image
│   │   ├── 📄 nginx.conf                  # Pagrindinė Nginx konfigūracija
│   │   └── 📁 sites-enabled/              # Nginx site konfigūracijos
│   │       └── 📄 a-dienynas.conf         # A-DIENYNAS site konfigūracija
│   └── 📁 postgres/                       # PostgreSQL konfigūracija
│       └── 📄 init.sql                    # PostgreSQL inicializacijos skriptas
├── 📁 scripts/                            # Deployment ir maintenance skriptai
│   ├── 📄 deploy.sh                       # Pagrindinis deployment skriptas
│   ├── 📄 backup.sh                       # Backup kūrimo skriptas
│   ├── 📄 restore.sh                      # Backup atkūrimo skriptas
│   ├── 📄 maintenance.sh                  # Sistemos maintenance skriptas
│   └── 📄 setup-cron.sh                   # Cron job'ų nustatymo skriptas
├── 📁 backups/                            # Backup failų katalogas
│   ├── 📁 database/                       # Duomenų bazės backup'ai
│   ├── 📁 uploads/                        # Upload failų backup'ai
│   ├── 📁 logs/                           # Log failų backup'ai
│   ├── 📁 redis/                          # Redis backup'ai
│   └── 📁 config/                         # Konfigūracijos backup'ai
└── 📁 logs/                               # Log failų katalogas
    ├── 📁 nginx/                          # Nginx log'ai
    ├── 📁 backend/                        # Backend log'ai
    └── 📁 frontend/                       # Frontend log'ai
```

## 📋 **File Descriptions**

### **Root Level Files**

#### **README.md**
- **Paskirtis:** Pagrindinė projekto dokumentacija
- **Turinys:** Quick start, architektūra, konfigūracija, naudojimas
- **Auditorija:** IT inžinieriai, administratoriai, vartotojai

#### **DEPLOYMENT_CHECKLIST.md**
- **Paskirtis:** Deployment patikrinimo sąrašas
- **Turinys:** Step-by-step deployment instrukcijos
- **Auditorija:** IT inžinieriai, deployment komanda

#### **PROJECT_STRUCTURE.md**
- **Paskirtis:** Projekto struktūros apžvalga (šis failas)
- **Turinys:** Failų ir katalogų aprašymas
- **Auditorija:** IT inžinieriai, developeriai

#### **docker-compose.yml**
- **Paskirtis:** Docker container orchestration
- **Turinys:** Visų servisų konfigūracija, tinklai, volume'ai
- **Auditorija:** Docker administratoriai, DevOps inžinieriai

#### **env.docker**
- **Paskirtis:** Docker aplinkos kintamieji
- **Turinys:** Slaptažodžiai, API URL'ai, konfigūracijos
- **Auditorija:** IT administratoriai (jautrus failas)

### **Docker Configuration Files**

#### **docker/backend/Dockerfile**
- **Paskirtis:** Backend container image
- **Bazinis image:** Python 3.12-slim
- **Funkcionalumas:** Django aplikacija su Gunicorn

#### **docker/backend/entrypoint.sh**
- **Paskirtis:** Backend startup script
- **Funkcionalumas:** Duomenų bazės laukimas, migracijos, superuser kūrimas

#### **docker/frontend/Dockerfile**
- **Paskirtis:** Frontend container image
- **Bazinis image:** Node.js 18-alpine
- **Funkcionalumas:** Next.js aplikacija su production build

#### **docker/nginx/Dockerfile**
- **Paskirtis:** Nginx container image
- **Bazinis image:** Nginx Alpine
- **Funkcionalumas:** Reverse proxy su custom konfigūracija

#### **docker/nginx/nginx.conf**
- **Paskirtis:** Pagrindinė Nginx konfigūracija
- **Funkcionalumas:** Performance optimizacijos, saugumas, logging

#### **docker/nginx/sites-enabled/a-dienynas.conf**
- **Paskirtis:** A-DIENYNAS site konfigūracija
- **Funkcionalumas:** Proxy rules, rate limiting, static failų servavimas

#### **docker/postgres/init.sql**
- **Paskirtis:** PostgreSQL inicializacijos skriptas
- **Funkcionalumas:** Duomenų bazės kūrimas, indeksai, funkcijos

### **Scripts Directory**

#### **scripts/deploy.sh**
- **Paskirtis:** Pagrindinis deployment skriptas
- **Funkcionalumas:** Containerių paleidimas, migracijos, health checks
- **Naudojimas:** `./scripts/deploy.sh`

#### **scripts/backup.sh**
- **Paskirtis:** Backup kūrimo skriptas
- **Funkcionalumas:** Duomenų bazės, failų, log'ų backup'ai
- **Naudojimas:** `./scripts/backup.sh`

#### **scripts/restore.sh**
- **Paskirtis:** Backup atkūrimo skriptas
- **Funkcionalumas:** Backup failų atkūrimas su validacija
- **Naudojimas:** `./scripts/restore.sh <backup_date>`

#### **scripts/maintenance.sh**
- **Paskirtis:** Sistemos maintenance skriptas
- **Funkcionalumas:** Monitoringas, cleanup, health checks
- **Naudojimas:** `./scripts/maintenance.sh --all`

#### **scripts/setup-cron.sh**
- **Paskirtis:** Cron job'ų nustatymo skriptas
- **Funkcionalumas:** Automatinių backup'ų ir maintenance cron'ai
- **Naudojimas:** `./scripts/setup-cron.sh`

### **Backup and Log Directories**

#### **backups/**
- **database/:** PostgreSQL duomenų bazės backup'ai
- **uploads/:** Media failų backup'ai
- **logs/:** Log failų backup'ai
- **redis/:** Redis cache backup'ai
- **config/:** Konfigūracijos failų backup'ai

#### **logs/**
- **nginx/:** Nginx access ir error log'ai
- **backend/:** Django ir Gunicorn log'ai
- **frontend/:** Next.js log'ai

## 🔧 **Configuration Details**

### **Docker Services**

#### **PostgreSQL (postgres)**
- **Port:** 5432
- **Image:** postgres:15-alpine
- **Volume:** postgres_data
- **Health Check:** pg_isready

#### **Redis (redis)**
- **Port:** 6379
- **Image:** redis:7-alpine
- **Volume:** redis_data
- **Health Check:** redis-cli ping

#### **Backend (backend)**
- **Port:** 8000
- **Build:** Local Dockerfile
- **Dependencies:** postgres, redis
- **Health Check:** API endpoint

#### **Frontend (frontend)**
- **Port:** 3000
- **Build:** Local Dockerfile
- **Dependencies:** backend
- **Health Check:** HTTP response

#### **Nginx (nginx)**
- **Ports:** 80 (HTTP), 443 (HTTPS)
- **Build:** Local Dockerfile
- **Dependencies:** frontend, backend
- **Health Check:** nginx -t

### **Network Configuration**
- **Network:** a-dienynas-network
- **Subnet:** 172.20.0.0/16
- **Driver:** bridge
- **Isolation:** Full container isolation

### **Volume Configuration**
- **postgres_data:** PostgreSQL duomenų bazės failai
- **redis_data:** Redis cache failai
- **static_volume:** Django statiniai failai
- **media_volume:** Vartotojų įkelti failai

## 🚀 **Deployment Process**

### **1. Initial Setup**
```bash
# Clone repository
git clone <repository-url>
cd A-DIENYNAS

# Setup environment
cp env.docker .env.docker
nano .env.docker  # Edit configuration

# Make scripts executable
chmod +x scripts/*.sh
```

### **2. Deploy System**
```bash
# Run deployment script
./scripts/deploy.sh

# Or manual deployment
docker compose up -d
```

### **3. Setup Automation**
```bash
# Setup cron jobs
./scripts/setup-cron.sh

# Verify setup
./scripts/maintenance.sh --status
```

### **4. Create Backup**
```bash
# Test backup
./scripts/backup.sh

# Verify backup
ls -la backups/
```

## 🔒 **Security Features**

### **Network Security**
- Docker network isolation
- Port exposure only where necessary
- UFW firewall configuration
- SSH access restrictions

### **Application Security**
- JWT authentication
- Rate limiting on API endpoints
- CORS configuration
- Security headers (XSS, CSRF protection)

### **Container Security**
- Non-root user execution
- Minimal base images
- Resource limits
- Health checks

## 📊 **Monitoring & Maintenance**

### **Automated Tasks**
- **Daily backup:** 02:00 AM
- **Weekly maintenance:** 03:00 AM (Sundays)
- **Daily status check:** 08:00 AM
- **Daily cleanup:** 04:00 AM and 05:00 AM

### **Manual Maintenance**
```bash
# System status
./scripts/maintenance.sh --status

# Health checks
./scripts/maintenance.sh --health

# Resource usage
./scripts/maintenance.sh --resources

# Cleanup
./scripts/maintenance.sh --cleanup

# Full maintenance with report
./scripts/maintenance.sh --all --report
```

## 🚨 **Troubleshooting**

### **Common Commands**
```bash
# View logs
docker compose logs -f

# Container status
docker compose ps

# Restart services
docker compose restart

# Rebuild containers
docker compose build --no-cache
```

### **Debug Information**
```bash
# Container inspection
docker inspect <container-name>

# Network inspection
docker network inspect a-dienynas_a-dienynas-network

# Volume inspection
docker volume ls
```

## 📈 **Performance Optimization**

### **Container Optimization**
- Multi-stage builds
- Layer caching
- Resource limits
- Health checks

### **Application Optimization**
- Gzip compression
- Static file caching
- Database indexing
- Redis caching

## 🔄 **Updates & Upgrades**

### **Code Updates**
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d
```

### **Configuration Updates**
```bash
# Edit configuration
nano docker/nginx/sites-enabled/a-dienynas.conf

# Reload services
docker compose restart nginx
```

---

## 📝 **File Permissions**

### **Critical Files**
- **env.docker:** 600 (owner read/write only)
- **scripts/*.sh:** 755 (executable)
- **docker/nginx/sites-enabled/*:** 644 (readable)

### **Directories**
- **logs/:** 755 (readable, executable)
- **backups/:** 755 (readable, executable)
- **docker/:** 755 (readable, executable)

---

## 🎯 **Next Steps**

1. **Review Configuration:** Patikrinkite visus konfigūracijos failus
2. **Test Deployment:** Paleiskite testinį deployment'ą
3. **Setup Monitoring:** Sukonfigūruokite monitoring'ą ir alert'us
4. **Create Documentation:** Sukurkite vartotojų dokumentaciją
5. **Train Team:** Apmokinkite IT komandą

---

**Pastaba:** Šis dokumentas turi būti atnaujinamas kiekvieną kartą keičiant projekto struktūrą.

**Kontaktai:** Jei kyla klausimų dėl projekto struktūros, kreipkitės į IT inžinierius.

**Paskutinis atnaujinimas:** 2025-01-25

