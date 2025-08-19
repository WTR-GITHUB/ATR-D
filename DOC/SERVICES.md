# /DOC/SERVICES.md

# A-DIENYNAS Servisų Konfigūracija ir Nustatymai

# Šis dokumentas aprašo A-DIENYNAS projekto servisų konfigūraciją, nginx nustatymus ir naudingas komandas
# CHANGE: Sukurtas išsamus servisų konfigūracijos dokumentas su visais nustatymais ir komandomis

## 📋 Sistemos Apžvalga

A-DIENYNAS sistema susideda iš trijų pagrindinių komponentų:
- **Nginx** - reverse proxy serveris (portas 80)
- **Django Backend** - REST API serveris (portas 8000)
- **Next.js Frontend** - vartotojo sąsaja (portas 3000)

## 🚀 Nginx Konfigūracija

### Konfigūracijos Failas
**Vieta:** `/etc/nginx/sites-available/a-dienynas`

```nginx
# /etc/nginx/sites-available/a-dienynas
# A-DIENYNAS projektas - nginx konfigūracija
# CHANGE: Sukurta nginx konfigūracija su reverse proxy backend ir frontend serveriams

server {
    listen 80;
    server_name 192.168.1.166;
    
    # Frontend (Next.js) - statiniai failai
    location / {
        root /home/vilkas/atradimai/A-DIENYNAS/frontend/.next;
        try_files $uri $uri/ /_next/static/$uri;
        
        # Next.js development serverio proxy
        location /_next/ {
            proxy_pass http://127.0.0.1:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    
    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Django admin panel
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Statiniai failai
    location /static/ {
        alias /home/vilkas/atradimai/A-DIENYNAS/backend/static/;
    }
    
    # Media failai
    location /media/ {
        alias /home/vilkas/atradimai/A-DIENYNAS/backend/media/;
    }
}
```

### Nginx Komandos
```bash
# Patikrinti konfigūraciją
sudo nginx -t

# Perkrauti nginx
sudo systemctl reload nginx

# Perkrauti nginx (pilnas restart)
sudo systemctl restart nginx

# Patikrinti nginx statusą
sudo systemctl status nginx

# Įjungti nginx autostart
sudo systemctl enable nginx

# Išjungti nginx autostart
sudo systemctl disable nginx
```

## 🔧 Systemd Servisai

### 1. Backend Servisas (Django)

**Failas:** `/etc/systemd/system/a-dienynas-backend.service`

```ini
# /etc/systemd/system/a-dienynas-backend.service
# A-DIENYNAS backend Django servisas
# CHANGE: Sukurtas systemd servisas Django backend serveriui

[Unit]
Description=A-DIENYNAS Django Backend
After=network.target

[Service]
Type=simple
User=vilkas
Group=vilkas
WorkingDirectory=/home/vilkas/atradimai/A-DIENYNAS/backend
Environment=PATH=/home/vilkas/atradimai/A-DIENYNAS/venv/bin
ExecStart=/home/vilkas/atradimai/A-DIENYNAS/venv/bin/python manage.py runserver 0.0.0.0:8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 2. Frontend Servisas (Next.js)

**Failas:** `/etc/systemd/system/a-dienynas-frontend.service`

```ini
# /etc/systemd/system/a-dienynas-frontend.service
# A-DIENYNAS frontend Next.js servisas
# CHANGE: Sukurtas systemd servisas Next.js frontend serveriui

[Unit]
Description=A-DIENYNAS Next.js Frontend
After=network.target

[Service]
Type=simple
User=vilkas
Group=vilkas
WorkingDirectory=/home/vilkas/atradimai/A-DIENYNAS/frontend
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10
Environment=NODE_ENV=development
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

### Systemd Komandos

```bash
# Perkrauti systemd konfigūraciją
sudo systemctl daemon-reload

# Įjungti servisą autostart
sudo systemctl enable a-dienynas-backend
sudo systemctl enable a-dienynas-frontend

# Išjungti servisą autostart
sudo systemctl disable a-dienynas-backend
sudo systemctl disable a-dienynas-frontend

# Paleisti servisą
sudo systemctl start a-dienynas-backend
sudo systemctl start a-dienynas-frontend

# Sustabdyti servisą
sudo systemctl stop a-dienynas-backend
sudo systemctl stop a-dienynas-frontend

# Perkrauti servisą
sudo systemctl restart a-dienynas-backend
sudo systemctl restart a-dienynas-frontend

# Patikrinti serviso statusą
sudo systemctl status a-dienynas-backend
sudo systemctl status a-dienynas-frontend

# Patikrinti serviso statusą (be pager)
sudo systemctl status a-dienynas-backend --no-pager
sudo systemctl status a-dienynas-frontend --no-pager
```

## 📊 Sistemos Monitoringas

### Portų Patikrinimas
```bash
# Patikrinti, kurie portai yra aktyvūs
sudo ss -tlnp | grep -E ':(80|3000|8000)'

# Patikrinti konkretų portą
sudo ss -tlnp | grep :8000
sudo ss -tlnp | grep :3000
sudo ss -tlnp | grep :80
```

### Log'ų Peržiūra
```bash
# Backend serviso log'ai
sudo journalctl -u a-dienynas-backend -f
sudo journalctl -u a-dienynas-backend --no-pager

# Frontend serviso log'ai
sudo journalctl -u a-dienynas-frontend -f
sudo journalctl -u a-dienynas-frontend --no-pager

# Nginx log'ai
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Sistema log'ai
sudo journalctl -f
```

### Sistemos Resursai
```bash
# Procesų informacija
ps aux | grep python
ps aux | grep node
ps aux | grep nginx

# Atminties naudojimas
free -h

# Diskų naudojimas
df -h

# Sistemos apkrova
htop
top
```

## 🛠️ Troubleshooting

### Dažniausios Problemos

#### 1. Servisas nepasileidžia (status=216/USER arba status=217/GROUP)
**Priežastis:** Neteisingas vartotojas arba grupė serviso konfigūracijoje

**Sprendimas:**
```bash
# Patikrinti vartotoją
whoami
groups

# Pataisyti serviso konfigūraciją
sudo sed -i 's/User=vilka/User=vilkas/g' /etc/systemd/system/a-dienynas-backend.service
sudo sed -i 's/Group=vilka/Group=vilkas/g' /etc/systemd/system/a-dienynas-backend.service

# Perkrauti systemd
sudo systemctl daemon-reload
sudo systemctl restart a-dienynas-backend
```

#### 2. Portas užimtas
**Priežastis:** Kitas procesas naudoja tą patį portą

**Sprendimas:**
```bash
# Patikrinti, kas naudoja portą
sudo ss -tlnp | grep :8000
sudo ss -tlnp | grep :3000

# Sustabdyti konfliktą sukeliantį procesą
sudo kill -9 <PID>
```

#### 3. Nginx konfigūracijos klaidos
**Priežastis:** Neteisinga nginx konfigūracija

**Sprendimas:**
```bash
# Patikrinti konfigūraciją
sudo nginx -t

# Perkrauti nginx
sudo systemctl reload nginx
```

## 🔒 Saugumo Nustatymai

### UFW Firewall
```bash
# Įjungti UFW
sudo ufw enable

# Atidaryti HTTP portą
sudo ufw allow 80

# Atidaryti SSH portą
sudo ufw allow ssh

# Patikrinti UFW statusą
sudo ufw status
```

### Failų Teisės
```bash
# Patikrinti projekto failų teises
ls -la /home/vilkas/atradimai/A-DIENYNAS/

# Nustatyti teisingas teises
sudo chown -R vilkas:vilkas /home/vilkas/atradimai/A-DIENYNAS/
chmod -R 755 /home/vilkas/atradimai/A-DIENYNAS/
```

## 📝 Konfigūracijos Pakeitimai

### Nginx Konfigūracijos Atnaujinimas
```bash
# Redaguoti konfigūraciją
sudo nano /etc/nginx/sites-available/a-dienynas

# Patikrinti sintaksę
sudo nginx -t

# Perkrauti nginx
sudo systemctl reload nginx
```

### Servisų Konfigūracijos Atnaujinimas
```bash
# Redaguoti backend servisą
sudo nano /etc/systemd/system/a-dienynas-backend.service

# Redaguoti frontend servisą
sudo nano /etc/systemd/system/a-dienynas-frontend.service

# Perkrauti systemd
sudo systemctl daemon-reload

# Perkrauti servisus
sudo systemctl restart a-dienynas-backend
sudo systemctl restart a-dienynas-frontend
```

## 🚀 Sistemos Paleidimas

### Automatinis Paleidimas
Sistemos komponentai automatiškai pasileis kompiuteriui startuojant:
- ✅ Nginx
- ✅ a-dienynas-backend
- ✅ a-dienynas-frontend

### Rankinis Paleidimas
```bash
# Paleisti visą sistemą
sudo systemctl start nginx
sudo systemctl start a-dienynas-backend
sudo systemctl start a-dienynas-frontend

# Sustabdyti visą sistemą
sudo systemctl stop nginx
sudo systemctl stop a-dienynas-backend
sudo systemctl stop a-dienynas-frontend
```

## 🌐 Prieiga prie Sistemos

### URL Adresai
- **Pagrindinis puslapis**: http://192.168.1.166
- **Backend API**: http://192.168.1.166/api/
- **Django admin**: http://192.168.1.166/admin/
- **Frontend dev**: http://192.168.1.166:3000
- **Backend dev**: http://192.168.1.166:8000

### Testavimas
```bash
# Testuoti HTTP atsakymą
curl -I http://192.168.1.166

# Testuoti backend API
curl http://192.168.1.166/api/

# Testuoti nginx statusą
curl http://192.168.1.166/nginx_status
```

## 📚 Papildomi Resursai

### Dokumentacija
- [Systemd Service Files](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Django Deployment](https://docs.djangoproject.com/en/stable/howto/deployment/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Naudingos Komandos
```bash
# Sistemos informacija
uname -a
lsb_release -a

# Python versija
python3 --version

# Node.js versija
node --version
npm --version

# Nginx versija
nginx -v

# Systemd versija
systemctl --version
```

---

**Pastaba:** Šis dokumentas yra atsinaujintas 2025-08-19. Visi pakeitimai dokumentuojami CHANGE komentaruose.



# Servisų statusas
sudo systemctl status a-dienynas-backend
sudo systemctl status a-dienynas-frontend
sudo systemctl status nginx

# Servisų perkrovimas
sudo systemctl restart a-dienynas-backend
sudo systemctl restart a-dienynas-frontend

# Log'ų peržiūra
sudo journalctl -u a-dienynas-backend -f
sudo journalctl -u a-dienynas-frontend -f
