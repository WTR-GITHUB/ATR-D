# Django Admin Static Files - Problemos Sprendimas

## 📋 **Problemos Aprašymas**

Django admin puslapyje (`https://dienynas.mokyklaatradimai.lt/admin/`) neveikė static failai (CSS, JS). Naršyklės konsolėje rodo klaidas:

```
Refused to apply style from 'https://dienynas.mokyklaatradimai.lt/static/admin/css/base.css' 
because its MIME type ('text/html') is not a supported stylesheet MIME type
```

## 🔍 **Problemos Analizė**

### **Pagrindinės Priežastys:**

1. **Docker Volume Mount'ing'o Problema:**
   - `docker-compose.yml` naudojo `static_volume:/app/static` (Docker volume)
   - Bet Nginx ieško failų `/var/www/dienynas/backend/static/` (host sistemoje)
   - Volume ir host failai nebuvo susieti

2. **Nginx Konfigūracijos Problema:**
   - Sisteminis Nginx proxy'ino `/static/` užklausas į Django backend
   - Django neturi teisingo static failų serving'o
   - Reikėjo tiesioginio failų serving'o

3. **Django Static Failų Surinkimas:**
   - `collectstatic` veikė teisingai, bet failai buvo neteisingoje vietoje
   - Reikėjo pakeisti Docker volume mount'ing'ą

## ✅ **Sprendimo Žingsniai**

### **1. Pakeista Docker Compose Konfigūracija**

**Failas:** `docker-compose.yml`

**Buvo:**
```yaml
volumes:
  - ./backend:/app
  - static_volume:/app/static  # Docker volume
  - media_volume:/app/media
```

**Pakeista į:**
```yaml
volumes:
  - ./backend:/app
  - ./backend/static:/app/static  # Tiesioginis host mount'as
  - media_volume:/app/media
```

**Priežastis:** Docker volume nebuvo susietas su host failais. Tiesioginis mount'as leidžia Nginx tiesiogiai pasiekti failus.

### **2. Užkomentuotas Docker Nginx Servisas**

**Failas:** `docker-compose.yml`

**Priežastis:** Naudojamas sisteminis Nginx, ne Docker container'is.

**Pridėtas komentaras:**
```yaml
# Nginx Reverse Proxy - UŽKOMENTUOTA
# PASTABA: Naudojamas sisteminis Nginx, ne Docker container'is
# Žiūrėti nustatymus: /etc/nginx/sites-enabled/a-dienynas.conf
```

### **3. Atnaujinta Sisteminio Nginx Konfigūracija**

**Failas:** `/etc/nginx/sites-available/dienynas.mokyklaatradimai.lt`

**Buvo:**
```nginx
location /static/ {
    proxy_pass http://127.0.0.1:8000;  # Proxy į Django
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Pakeista į:**
```nginx
location /static/ {
    alias /var/www/dienynas/backend/static/;  # Tiesioginis failų serving'as
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options nosniff;
    access_log off;
}
```

**Priežastis:** Tiesioginis failų serving'as yra efektyvesnis nei proxy'jimas į Django.

### **4. Paleistas collectstatic iš naujo**

```bash
# Perkrauti container'ius
docker compose down
docker compose up -d

# Paleisti collectstatic
docker compose exec backend python manage.py collectstatic --clear --noinput
```

### **5. Perkrautas sisteminis Nginx**

```bash
# Patikrinti konfigūraciją
sudo nginx -t

# Perkrauti Nginx
sudo systemctl reload nginx
```

## 🎯 **Rezultatas**

✅ **Django admin static failai veikia teisingai**
- CSS failai kraunasi be klaidų
- JavaScript failai veikia
- Admin puslapis atrodo teisingai
- MIME type klaidos išspręstos

## 📁 **Failų Struktūra**

```
/var/www/dienynas/backend/static/
├── admin/
│   ├── css/
│   │   ├── base.css
│   │   ├── login.css
│   │   ├── nav_sidebar.css
│   │   └── ...
│   ├── js/
│   │   ├── theme.js
│   │   ├── nav_sidebar.js
│   │   └── ...
│   └── img/
└── rest_framework/
    └── ...
```

## 🔧 **Techninė Informacija**

### **Django Settings:**
```python
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / os.getenv('STATIC_ROOT', 'static')
STATICFILES_DIRS = [BASE_DIR / 'staticfiles']
```

### **Docker Volume Mount'ing'as:**
```yaml
volumes:
  - ./backend/static:/app/static  # Host → Container
```

### **Nginx Static Files Serving:**
```nginx
location /static/ {
    alias /var/www/dienynas/backend/static/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🚨 **Svarbūs Pastabos**

1. **Sisteminis Nginx:** Naudojamas sisteminis Nginx, ne Docker container'is
2. **Volume Mount'ing'as:** Tiesioginis host mount'as, ne Docker volume
3. **Static Files:** Tiesioginis Nginx serving'as, ne proxy'jimas į Django
4. **Cache'ing'as:** Static failai cache'inami 1 metus

## 📅 **Data**

**Sprendimo data:** 2025-09-10  
**Problema išspręsta:** ✅  
**Testuota:** ✅  

---

*Šis dokumentas aprašo Django admin static failų problemos sprendimą A-DIENYNAS projekte.*
