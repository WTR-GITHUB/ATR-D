# /DOC/DOCKER_SETUP_GUIDE.md

# A-DIENYNAS Docker Containerization Guide for IT Engineers

# Comprehensive guide for deploying A-DIENYNAS system on Linux Ubuntu using Docker containers
# CHANGE: Created comprehensive Docker deployment guide with containerization strategy, project structure, and backup procedures

## 🐳 **PROJEKTO APŽVALGA**

**A-DIENYNAS** yra modernus studentų dienynas ir mokymosi valdymo sistema, sukurta su Django REST API backend'u ir Next.js frontend'u. Sistema valdo 5 vartotojų tipus: studentus, tėvus, kuratorius, mentorius ir administratorius.

### **Techninė Architektūra**
- **Backend:** Django 5.2.4 + Django REST Framework 3.16.0
- **Frontend:** Next.js 15.4.5 + React 19.1.0 + TypeScript 5
- **Duomenų bazė:** SQLite (development), PostgreSQL (production)
- **Autentifikacija:** JWT su 60 min. access token
- **API:** RESTful su CORS palaikymu

## 🚀 **DOCKER CONTAINERIZATION STRATEGY**

### **1. Mikroservisų Architektūra**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Django)      │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Nginx         │
                    │   (Reverse      │
                    │   Proxy)        │
                    │   Port: 80/443  │
                    └─────────────────┘
```

### **2. Containerų Paskirtys**
- **Frontend Container:** Next.js aplikacija su statiniais failais
- **Backend Container:** Django API serveris su Gunicorn
- **Database Container:** PostgreSQL duomenų bazė
- **Nginx Container:** Reverse proxy ir statinių failų servavimas
- **Redis Container:** Session storage ir caching (optional)

## 🛠️ **LINUX UBUNTU SISTEMOS PARUOŠIMAS**

### **1. Sistema Atnaujinti**
```bash
# Atnaujinti sistemą
sudo apt update && sudo apt upgrade -y

# Įdiegti reikalingus paketus
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    git \
    htop \
    unzip \
    wget
```

### **2. Docker Engine Įdiegimas**
```bash
# Pridėti Docker oficialų GPG raktą
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Pridėti Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Atnaujinti paketų sąrašą
sudo apt update

# Įdiegti Docker Engine
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Pridėti vartotoją į docker grupę
sudo usermod -aG docker $USER

# Įjungti Docker servisą
sudo systemctl start docker
sudo systemctl enable docker

# Patikrinti Docker versiją
docker --version
docker compose version
```

### **3. Docker Compose Įdiegimas (jei neįtrauktas)**
```bash
# Įdiegti Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Suteikti vykdymo teises
sudo chmod +x /usr/local/bin/docker-compose

# Patikrinti versiją
docker-compose --version
```

### **4. Firewall Nustatymai**
```bash
# Įjungti UFW
sudo ufw enable

# Atidaryti reikalingus portus
sudo ufw allow 22/tcp        # SSH
sudo ufw allow 80/tcp        # HTTP
sudo ufw allow 443/tcp       # HTTPS
sudo ufw allow 3000/tcp      # Frontend
sudo ufw allow 8000/tcp      # Backend

# Patikrinti UFW statusą
sudo ufw status
```

## 📁 **DOCKER PROJEKTO STRUKTŪRA**

### **1. Pagrindinė Katalogo Struktūra**
```
A-DIENYNAS/
├── docker/                          # Docker konfigūracijos
│   ├── nginx/                       # Nginx konfigūracija
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── sites-enabled/
│   │       └── a-dienynas.conf
│   ├── backend/                     # Backend Docker konfigūracija
│   │   ├── Dockerfile
│   │   ├── gunicorn.conf.py
│   │   └── entrypoint.sh
│   ├── frontend/                    # Frontend Docker konfigūracija
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   └── postgres/                    # PostgreSQL konfigūracija
│       ├── Dockerfile
│       └── init.sql
├── docker-compose.yml               # Pagrindinis Docker Compose failas
├── docker-compose.prod.yml          # Production Docker Compose
├── docker-compose.dev.yml           # Development Docker Compose
├── .env.docker                      # Docker aplinkos kintamieji
├── .env.docker.example              # Docker aplinkos pavyzdys
├── scripts/                         # Deployment skriptai
│   ├── deploy.sh
│   ├── backup.sh
│   ├── restore.sh
│   └── maintenance.sh
└── backups/                         # Backup failai
    ├── database/
    ├── uploads/
    └── logs/
```

### **2. Docker Compose Pagrindinis Failas**
```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: a-dienynas-postgres
    environment:
      POSTGRES_DB: a_dienynas
      POSTGRES_USER: a_dienynas_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - a-dienynas-network
    restart: unless-stopped

  # Redis Cache (Optional)
  redis:
    image: redis:7-alpine
    container_name: a-dienynas-redis
    ports:
      - "6379:6379"
    networks:
      - a-dienynas-network
    restart: unless-stopped

  # Django Backend
  backend:
    build:
      context: ./backend
      dockerfile: ../docker/backend/Dockerfile
    container_name: a-dienynas-backend
    environment:
      - DATABASE_URL=postgresql://a_dienynas_user:${POSTGRES_PASSWORD}@postgres:5432/a_dienynas
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=${DEBUG}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
    volumes:
      - ./backend:/app
      - static_volume:/app/static
      - media_volume:/app/media
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
    networks:
      - a-dienynas-network
    restart: unless-stopped

  # Next.js Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: ../docker/frontend/Dockerfile
    container_name: a-dienynas-frontend
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - a-dienynas-network
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    build:
      context: ./docker/nginx
      dockerfile: Dockerfile
    container_name: a-dienynas-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/sites-enabled:/etc/nginx/sites-enabled
      - ./docker/nginx/ssl:/etc/nginx/ssl
      - static_volume:/var/www/static
      - media_volume:/var/www/media
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - a-dienynas-network
    restart: unless-stopped

volumes:
  postgres_data:
  static_volume:
  media_volume:

networks:
  a-dienynas-network:
    driver: bridge
```

### **3. Backend Dockerfile**
```dockerfile
# docker/backend/Dockerfile
FROM python:3.12-slim

# Nustatyti darbinį katalogą
WORKDIR /app

# Įdiegti sisteminius paketus
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Nukopijuoti requirements.txt
COPY requirements.txt .

# Įdiegti Python paketus
RUN pip install --no-cache-dir -r requirements.txt

# Nukopijuoti backend kodą
COPY . .

# Sukurti statinių failų katalogus
RUN mkdir -p /app/static /app/media

# Suteikti teises
RUN chmod +x /app/docker/backend/entrypoint.sh

# Nustatyti entrypoint
ENTRYPOINT ["/app/docker/backend/entrypoint.sh"]
```

### **4. Frontend Dockerfile**
```dockerfile
# docker/frontend/Dockerfile
FROM node:18-alpine

# Nustatyti darbinį katalogą
WORKDIR /app

# Nukopijuoti package.json ir package-lock.json
COPY package*.json ./

# Įdiegti dependencies
RUN npm ci --only=production

# Nukopijuoti frontend kodą
COPY . .

# Sukurti production build
RUN npm run build

# Įdiegti production dependencies
RUN npm ci --only=production && npm cache clean --force

# Nustatyti production serverį
EXPOSE 3000

# Paleisti aplikaciją
CMD ["npm", "start"]
```

### **5. Nginx Dockerfile ir Konfigūracija**
```dockerfile
# docker/nginx/Dockerfile
FROM nginx:alpine

# Nukopijuoti nginx konfigūraciją
COPY nginx.conf /etc/nginx/nginx.conf
COPY sites-enabled/ /etc/nginx/sites-enabled/

# Sukurti SSL katalogą
RUN mkdir -p /etc/nginx/ssl

# Nustatyti teises
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# docker/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    include /etc/nginx/sites-enabled/*;
}
```

```nginx
# docker/nginx/sites-enabled/a-dienynas.conf
server {
    listen 80;
    server_name localhost;
    
    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location /static/ {
        alias /var/www/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files
    location /media/ {
        alias /var/www/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔧 **APLINKOS KINTAMŲJŲ NUSTATYMAS**

### **1. .env.docker Failas**
```bash
# .env.docker
# Docker aplinkos kintamieji

# Database
POSTGRES_PASSWORD=your_secure_postgres_password
POSTGRES_DB=a_dienynas
POSTGRES_USER=a_dienynas_user

# Django
SECRET_KEY=your_super_secure_django_secret_key_here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your_domain.com

# Frontend
NEXT_PUBLIC_API_URL=http://localhost/api

# Redis
REDIS_PASSWORD=your_redis_password

# SSL (Production)
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

### **2. .env.docker.example Failas**
```bash
# .env.docker.example
# Docker aplinkos kintamųjų pavyzdys

# Database
POSTGRES_PASSWORD=change_this_password
POSTGRES_DB=a_dienynas
POSTGRES_USER=a_dienynas_user

# Django
SECRET_KEY=change_this_secret_key
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your_domain.com

# Frontend
NEXT_PUBLIC_API_URL=http://localhost/api

# Redis
REDIS_PASSWORD=change_this_redis_password

# SSL (Production)
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

## 🚀 **DEPLOYMENT PROCESAS**

### **1. Deployment Skriptas**
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting A-DIENYNAS deployment..."

# Patikrinti Docker statusą
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Sukurti reikalingus katalogus
echo "📁 Creating necessary directories..."
mkdir -p logs/nginx backups/database backups/uploads

# Nustatyti teises
echo "🔐 Setting permissions..."
chmod 600 .env.docker

# Sustabdyti esamus containerius
echo "🛑 Stopping existing containers..."
docker compose down

# Sukurti Docker image'us
echo "🔨 Building Docker images..."
docker compose build --no-cache

# Paleisti containerius
echo "🚀 Starting containers..."
docker compose up -d

# Palaukti kol containeriai pasileis
echo "⏳ Waiting for containers to start..."
sleep 30

# Patikrinti containerių statusą
echo "📊 Checking container status..."
docker compose ps

# Paleisti Django migracijas
echo "🗄️ Running Django migrations..."
docker compose exec backend python manage.py migrate

# Sukurti superuser (jei reikia)
echo "👤 Creating superuser..."
docker compose exec backend python manage.py createsuperuser --noinput || true

# Rinkti statinius failus
echo "📦 Collecting static files..."
docker compose exec backend python manage.py collectstatic --noinput

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "🗄️ Database: localhost:5432"
```

### **2. Maintenance Skriptas**
```bash
#!/bin/bash
# scripts/maintenance.sh

set -e

echo "🔧 Starting A-DIENYNAS maintenance..."

# Patikrinti containerių statusą
echo "📊 Container status:"
docker compose ps

# Patikrinti log'us
echo "📝 Recent logs:"
docker compose logs --tail=50

# Patikrinti resursų naudojimą
echo "💾 Resource usage:"
docker stats --no-stream

# Patikrinti diskų naudojimą
echo "💿 Disk usage:"
df -h

# Patikrinti atminties naudojimą
echo "🧠 Memory usage:"
free -h

echo "✅ Maintenance check completed!"
```

## 💾 **BACKUP STRATEGIJA**

### **1. Backup Skriptas**
```bash
#!/bin/bash
# scripts/backup.sh

set -e

# Nustatyti kintamuosius
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="a-dienynas-postgres"

echo "💾 Starting A-DIENYNAS backup..."

# Sukurti backup katalogus
mkdir -p "$BACKUP_DIR/database"
mkdir -p "$BACKUP_DIR/uploads"
mkdir -p "$BACKUP_DIR/logs"

# Database backup
echo "🗄️ Backing up database..."
docker compose exec -T postgres pg_dump -U a_dienynas_user a_dienynas > "$BACKUP_DIR/database/backup_$DATE.sql"

# Uploads backup
echo "📁 Backing up uploads..."
if [ -d "./media" ]; then
    tar -czf "$BACKUP_DIR/uploads/backup_$DATE.tar.gz" -C . media/
fi

# Logs backup
echo "📝 Backing up logs..."
if [ -d "./logs" ]; then
    tar -czf "$BACKUP_DIR/logs/backup_$DATE.tar.gz" -C . logs/
fi

# Sukurti backup informacijos failą
cat > "$BACKUP_DIR/backup_info_$DATE.txt" << EOF
Backup Date: $(date)
Database: backup_$DATE.sql
Uploads: backup_$DATE.tar.gz
Logs: backup_$DATE.tar.gz
Container Status: $(docker compose ps --format json | jq -r '.[] | "\(.Name): \(.State)"' | tr '\n' ' ')
EOF

# Išvalyti senus backup'us (palikti paskutinius 7)
echo "🧹 Cleaning old backups..."
find "$BACKUP_DIR/database" -name "backup_*.sql" -mtime +7 -delete
find "$BACKUP_DIR/uploads" -name "backup_*.tar.gz" -mtime +7 -delete
find "$BACKUP_DIR/logs" -name "backup_*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed successfully!"
echo "📁 Backup location: $BACKUP_DIR"
echo "🗄️ Database: backup_$DATE.sql"
echo "📁 Uploads: backup_$DATE.tar.gz"
echo "📝 Logs: backup_$DATE.tar.gz"
```

### **2. Restore Skriptas**
```bash
#!/bin/bash
# scripts/restore.sh

set -e

if [ $# -eq 0 ]; then
    echo "❌ Usage: $0 <backup_date>"
    echo "Example: $0 20250101_120000"
    exit 1
fi

BACKUP_DATE=$1
BACKUP_DIR="./backups"
DB_CONTAINER="a-dienynas-postgres"

echo "🔄 Starting A-DIENYNAS restore from $BACKUP_DATE..."

# Patikrinti ar backup failai egzistuoja
if [ ! -f "$BACKUP_DIR/database/backup_$BACKUP_DATE.sql" ]; then
    echo "❌ Database backup not found: backup_$BACKUP_DATE.sql"
    exit 1
fi

# Sustabdyti aplikacijas
echo "🛑 Stopping applications..."
docker compose stop backend frontend

# Database restore
echo "🗄️ Restoring database..."
docker compose exec -T postgres psql -U a_dienynas_user -d a_dienynas < "$BACKUP_DIR/database/backup_$BACKUP_DATE.sql"

# Uploads restore
if [ -f "$BACKUP_DIR/uploads/backup_$BACKUP_DATE.tar.gz" ]; then
    echo "📁 Restoring uploads..."
    rm -rf ./media
    tar -xzf "$BACKUP_DIR/uploads/backup_$BACKUP_DATE.tar.gz"
fi

# Logs restore
if [ -f "$BACKUP_DIR/logs/backup_$BACKUP_DATE.tar.gz" ]; then
    echo "📝 Restoring logs..."
    rm -rf ./logs
    tar -xzf "$BACKUP_DIR/logs/backup_$BACKUP_DATE.tar.gz"
fi

# Paleisti aplikacijas
echo "🚀 Starting applications..."
docker compose start backend frontend

echo "✅ Restore completed successfully!"
echo "🔄 System restored from backup: $BACKUP_DATE"
```

### **3. Automated Backup su Cron**
```bash
# Pridėti į crontab
crontab -e

# Kasdienis backup 02:00
0 2 * * * /home/vilkas/atradimai/A-DIENYNAS/scripts/backup.sh >> /home/vilkas/atradimai/A-DIENYNAS/logs/backup.log 2>&1

# Kas savaitės backup 03:00 (sekmadieniais)
0 3 * * 0 /home/vilkas/atradimai/A-DIENYNAS/scripts/backup.sh >> /home/vilkas/atradimai/A-DIENYNAS/logs/weekly_backup.log 2>&1
```

## 🔒 **SAUGUMO NUSTATYMAI**

### **1. SSL/HTTPS Konfigūracija**
```bash
# Įdiegti Certbot
sudo apt install certbot python3-certbot-nginx

# Gauti SSL sertifikatą
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Automatinis atnaujinimas
sudo crontab -e
# Pridėti:
0 12 * * * /usr/bin/certbot renew --quiet
```

### **2. Firewall Nustatymai**
```bash
# Įjungti UFW
sudo ufw enable

# Atidaryti tik reikalingus portus
sudo ufw allow 22/tcp        # SSH
sudo ufw allow 80/tcp        # HTTP
sudo ufw allow 443/tcp       # HTTPS

# Uždaryti kitus portus
sudo ufw deny 3000/tcp       # Frontend (tik per Nginx)
sudo ufw deny 8000/tcp       # Backend (tik per Nginx)
sudo ufw deny 5432/tcp       # Database (tik lokaliai)

# Patikrinti statusą
sudo ufw status
```

### **3. Failų Teisių Nustatymas**
```bash
# Nustatyti teisingas teises
sudo chown -R $USER:$USER /home/vilkas/atradimai/A-DIENYNAS/
chmod 600 .env.docker
chmod 755 scripts/*.sh
chmod 644 docker/nginx/sites-enabled/*
```

## 📊 **MONITORINGAS IR LOG'AI**

### **1. Log'ų Konfigūracija**
```yaml
# docker-compose.yml papildymas
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
  
  frontend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
  
  nginx:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### **2. Log'ų Peržiūra**
```bash
# Peržiūrėti visų containerių log'us
docker compose logs -f

# Peržiūrėti konkretaus serviso log'us
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx

# Peržiūrėti log'us su laiko žymėmis
docker compose logs -f --timestamps
```

### **3. Resursų Monitoringas**
```bash
# Containerių resursų naudojimas
docker stats

# Diskų naudojimas
df -h

# Atminties naudojimas
free -h

# Procesų informacija
htop
```

## 🚨 **TROUBLESHOOTING**

### **1. Dažniausios Problemos**

#### **Containeriai nepasileidžia**
```bash
# Patikrinti log'us
docker compose logs

# Patikrinti Docker statusą
docker info

# Patikrinti portų užimtumą
sudo ss -tlnp | grep -E ':(80|443|3000|8000|5432)'
```

#### **Duomenų bazės prisijungimo problemos**
```bash
# Patikrinti PostgreSQL containerio statusą
docker compose ps postgres

# Patikrinti PostgreSQL log'us
docker compose logs postgres

# Prisijungti prie PostgreSQL
docker compose exec postgres psql -U a_dienynas_user -d a_dienynas
```

#### **Nginx proxy problemos**
```bash
# Patikrinti Nginx konfigūraciją
docker compose exec nginx nginx -t

# Patikrinti Nginx log'us
docker compose logs nginx

# Perkrauti Nginx
docker compose exec nginx nginx -s reload
```

### **2. Debug Komandos**
```bash
# Patikrinti containerių tinklo konfigūraciją
docker network inspect a-dienynas_a-dienynas-network

# Patikrinti volume'ų informaciją
docker volume ls
docker volume inspect a-dienynas_postgres_data

# Patikrinti image'ų informaciją
docker images
docker inspect a-dienynas-backend
```

## 📋 **DEPLOYMENT CHECKLIST**

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

## 🔄 **ATNAUJINIMŲ PROCESAS**

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

---

**Pastaba:** Šis dokumentas yra atsinaujintas 2025-01-25. Visi pakeitimai dokumentuojami CHANGE komentaruose.

**Kontaktai:** Jei kyla klausimų dėl Docker deployment'o, kreipkitės į IT inžinierius.
