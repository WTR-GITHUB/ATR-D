# /home/master/A-DIENYNAS/DEPLOYMENT_CHECKLIST.md
# A-DIENYNAS Deployment Checklist
# CHANGE: Created comprehensive deployment checklist
# PURPOSE: Step-by-step deployment verification guide
# UPDATES: Initial setup with all necessary checks

# 🚀 A-DIENYNAS Deployment Checklist

Šis dokumentas padeda IT inžinieriams sėkmingai išdiegti A-DIENYNAS sistemą naudojant Docker konteinerius.

## 📅 **ŠIANDIENOS PROGRESAS (2025-08-27)**

### **✅ Sėkmingai Atlikta:**
- **Backend Container** - veikia ir `healthy`
- **PostgreSQL** - prisijungta ir `healthy`
- **Redis** - prisijungta ir `healthy`
- **Django aplikacija** - paleista su Gunicorn
- **Health Check endpoint** - sukurtas `/api/health/`
- **Database migrations** - įvykdytos
- **Superuser** - sukurtas (admin@example.com/admin123)
- **Static files** - surinkti (163 failai)
- **Port 8000** - atidarytas ir veikia

### **🔧 Išspręstos Problemos:**
- ✅ Custom user model superuser creation
- ✅ Gunicorn startup su `python -m gunicorn`
- ✅ Django settings PostgreSQL konfigūracija
- ✅ Health check endpoint'as Docker health check'ui
- ✅ Container health status

### **📊 Dabartinis Statusas:**
```
NAME                  STATUS                    PORTS
a-dienynas-backend    Up (healthy)             0.0.0.0:8000->8000/tcp
a-dienynas-postgres   Up (healthy)             0.0.0.0:5432->5432/tcp
a-dienynas-redis      Up (healthy)             0.0.0.0:6379->6379/tcp
```

## 📋 **Pre-Deployment Checklist**

### **System Requirements**
- [+] **OS:** Ubuntu 20.04+ arba Debian 11+
- [+] **RAM:** Mažiausiai 4GB (rekomenduojama 8GB+)
- [+] **Disk:** Mažiausiai 20GB laisvos vietos
- [+] **Network:** Stabilus interneto ryšys
- [+] **Ports:** 22 (SSH), 80 (HTTP), 443 (HTTPS)

### **Software Prerequisites**
- [+] **Docker Engine:** 20.10+ versija
- [+] **Docker Compose:** 2.0+ versija
- [+] **Git:** Naujausia versija
- [ ] **Curl:** HTTP klientas
- [+] **UFW:** Firewall (rekomenduojama)

### **System Preparation**
- [+] Sistema atnaujinta (`sudo apt update && sudo apt upgrade`)
- [ ] Reikalingi paketai įdiegti
- [ ] Firewall sukonfigūruotas
- [+] Vartotojas pridėtas į docker grupę
- [+] Docker servisas veikia

## 🔧 **Installation Checklist**

### **Docker Installation**
- [+] Docker GPG raktas pridėtas
- [+] Docker repository pridėtas
- [+] Docker Engine įdiegtas
- [+] Docker Compose įdiegtas
- [+] Vartotojas pridėtas į docker grupę
- [+] Docker servisas įjungtas ir automatiškai paleidžiamas

### **Project Setup**
- [+] A-DIENYNAS kodas nuklonuotas
- [+] Katalogo struktūra sukurta
- [+] Failų teisės nustatytos
- [+] Aplinkos kintamieji sukonfigūruoti
- [+] Skriptai padaryti vykdomais

## 🐳 **Docker Configuration Checklist**

### **Docker Compose**
- [+] `docker-compose.yml` failas sukonfigūruotas
- [ ] Visi servisai apibrėžti (postgres, redis, backend, frontend, nginx)
- [ ] Tinklo konfigūracija teisinga
- [ ] Volume'ų konfigūracija teisinga
- [ ] Portų mapping'as teisingas

### **Container Images**
- [ ] Backend Dockerfile sukonfigūruotas
- [ ] Frontend Dockerfile sukonfigūruotas
- [ ] Nginx Dockerfile sukonfigūruotas
- [ ] PostgreSQL init skriptas paruoštas
- [ ] Entrypoint skriptai sukonfigūruoti

### **Environment Variables**
- [ ] `env.docker` failas sukurta
- [ ] Duomenų bazės slaptažodžiai nustatyti
- [ ] Django SECRET_KEY nustatytas
- [ ] API URL'ai sukonfigūruoti
- [ ] Redis konfigūracija nustatyta

## 🚀 **Deployment Checklist**

### **Initial Deployment**
- [ ] Containeriai sustabdyti (jei buvo)
- [ ] Docker image'ai sukurti (`docker compose build`)
- [ ] Containeriai paleisti (`docker compose up -d`)
- [ ] Visi servisai pasileidžia be klaidų
- [ ] Health check'ai praeina

### **Service Verification**
- [ ] **PostgreSQL:** Containeris veikia, duomenų bazė pasiekiama
- [ ] **Redis:** Containeris veikia, cache pasiekiamas
- [ ] **Backend:** Django aplikacija veikia, API atsako
- [ ] **Frontend:** Next.js aplikacija veikia, puslapis rodomas
- [ ] **Nginx:** Reverse proxy veikia, statiniai failai servuojami

### **Database Setup**
- [ ] Duomenų bazės migracijos paleistos
- [ ] Statiniai failai surinkti
- [ ] Superuser sukurtas
- [ ] Duomenų bazės indeksai sukurti
- [ ] Testiniai duomenys įkelti (jei reikia)

## 🔒 **Security Checklist**

### **Network Security**
- [ ] Docker tinklas izoliuotas

## 🚧 **LIKUSIEJI DARBAI (RYTOJ)**

### **🔥 PRIORITETAS 1 - Frontend Servisas:**
- [ ] **Išspręsti TypeScript problemą** frontend Dockerfile
- [ ] **Pridėti TypeScript** į frontend dependencies
- [ ] **Paleisti frontend container** - `docker compose up -d frontend`
- [ ] **Patikrinti** ar Next.js aplikacija veikia port 3000

### **🔥 PRIORITETAS 2 - Nginx Reverse Proxy:**
- [ ] **Paleisti nginx container** - `docker compose up -d nginx`
- [ ] **Patikrinti** ar nginx veikia port 80
- [ ] **Testuoti** reverse proxy funkcionalumą
- [ ] **Patikrinti** statinių failų servavimą

### **🔥 PRIORITETAS 3 - Pilnas Deployment:**
- [ ] **Paleisti visus servisus** - `docker compose up -d`
- [ ] **Patikrinti** ar visi containeriai `healthy`
- [ ] **Testuoti** pilną sistemą per nginx (port 80)
- [ ] **Patikrinti** ar frontend gali prisijungti prie backend API

### **🔧 Papildomi Darbai:**
- [ ] **SSL sertifikatai** (jei reikia production)
- [ ] **Backup skriptai** testavimas
- [ ] **Monitoring** ir log'ų konfigūracija
- [ ] **Performance testing** su realiais duomenimis

### **📝 Testavimo Komandos:**
```bash
# Frontend testavimas
curl http://localhost:3000

# Nginx testavimas  
curl http://localhost:80

# Pilnas deployment
docker compose up -d
docker compose ps
docker compose logs -f
```
- [ ] Tik reikalingi portai atidaryti
- [ ] Firewall sukonfigūruotas
- [ ] SSH prieiga saugoma
- [ ] Nereikalingi servisai išjungti

### **Application Security**
- [ ] JWT autentifikacija veikia
- [ ] CORS nustatymai teisingi
- [ ] Rate limiting įjungtas
- [ ] Saugumo antraštės nustatytos
- [ ] Input validacija veikia

### **Container Security**
- [ ] Containeriai veikia ne-root vartotojais
- [ ] Resource limitai nustatyti
- [ ] Health check'ai veikia
- [ ] Log'ai renkami
- [ ] Automatinis restart'as sukonfigūruotas

## 💾 **Backup & Recovery Checklist**

### **Backup Configuration**
- [ ] Backup skriptai sukonfigūruoti
- [ ] Backup katalogai sukurta
- [ ] Automatiniai backup'ai sukonfigūruoti (cron)
- [ ] Backup retention policy nustatyta
- [ ] Backup test'ai atlikti

### **Recovery Testing**
- [ ] Restore skriptai veikia
- [ ] Backup failai galima atkurti
- [ ] Duomenų bazės restore testuotas
- [ ] Failų restore testuotas
- [ ] Disaster recovery planas paruoštas

## 📊 **Monitoring & Maintenance Checklist**

### **System Monitoring**
- [ ] Log'ai renkami ir saugomi
- [ ] Resource usage monitoringas veikia
- [ ] Health check'ai automatiškai atliekami
- [ ] Alert'ai sukonfigūruoti (jei reikia)
- [ ] Performance metrikos renkami

### **Maintenance Procedures**
- [ ] Maintenance skriptai veikia
- [ ] Log rotation sukonfigūruotas
- [ ] Resource cleanup automatinis
- [ ] Update procedūros dokumentuotos
- [ ] Rollback planas paruoštas

## 🌐 **Production Deployment Checklist**

### **SSL/HTTPS**
- [ ] SSL sertifikatai gauti (Let's Encrypt arba komerciniai)
- [ ] Nginx SSL konfigūracija sukonfigūruota
- [ ] HTTP → HTTPS redirect'as veikia
- [ ] SSL sertifikatų auto-renewal sukonfigūruotas
- [ ] SSL test'ai praeina

### **Domain & DNS**
- [ ] Domeno vardas sukonfigūruotas
- [ ] DNS įrašai teisingi
- [ ] A ir AAAA įrašai nustatyti
- [ ] CNAME įrašai (jei reikia) nustatyti
- [ ] SSL sertifikatas domenui gautas

### **Performance Optimization**
- [ ] Gzip compression įjungtas
- [ ] Static failų caching'as sukonfigūruotas
- [ ] Database indeksai optimizuoti
- [ ] Redis caching'as veikia
- [ ] CDN sukonfigūruotas (jei reikia)

## 🧪 **Testing Checklist**

### **Functional Testing**
- [ ] Vartotojo registracija veikia
- [ ] Prisijungimas veikia
- [ ] API endpoint'ai veikia
- [ ] Frontend funkcionalumas veikia
- [ ] Duomenų bazės operacijos veikia

### **Performance Testing**
- [ ] Aplikacija greitai kraunasi
- [ ] API atsako greitai
- [ ] Duomenų bazės užklausos greitos
- [ ] Static failai greitai servuojami
- [ ] Load testing'as atliktas

### **Security Testing**
- [ ] SQL injection test'ai praeina
- [ ] XSS test'ai praeina
- [ ] CSRF apsauga veikia
- [ ] Authentication test'ai praeina
- [ ] Authorization test'ai praeina

## 📚 **Documentation Checklist**

### **Technical Documentation**
- [ ] README.md failas sukonfigūruotas
- [ ] API dokumentacija paruošta
- [ ] Deployment instrukcijos dokumentuotos
- [ ] Troubleshooting gidas paruoštas
- [ ] Maintenance procedūros dokumentuotos

### **User Documentation**
- [ ] Vartotojo vadovas paruoštas
- [ ] Administratoriaus vadovas paruoštas
- [ ] FAQ dokumentas paruoštas
- [ ] Video instrukcijos (jei reikia) paruoštos
- [ ] Support kontaktai dokumentuoti

## 🔄 **Post-Deployment Checklist**

### **System Verification**
- [ ] Visi servisai veikia stabiliai
- [ ] Performance yra priimtinas
- [ ] Error rate yra žemas
- [ ] Resource usage yra normalus
- [ ] Backup'ai veikia automatiškai

### **Monitoring Setup**
- [ ] Log'ai renkami ir analizuojami
- [ ] Alert'ai sukonfigūruoti
- [ ] Performance metrikos renkami
- [ ] Uptime monitoringas veikia
- [ ] Error tracking'as veikia

### **Support & Maintenance**
- [ ] IT komanda apmokinta
- [ ] Support procedūros dokumentuotos
- [ ] Maintenance schedule'as nustatytas
- [ ] Update procedūros paruoštos
- [ ] Emergency contact'ai nustatyti

## 🚨 **Troubleshooting Checklist**

### **Common Issues**
- [ ] Container startup problemos sprendžiamos
- [ ] Database connection problemos sprendžiamos
- [ ] Port conflict'ai sprendžiami
- [ ] Permission problemos sprendžiamos
- [ ] Resource limit'ai sprendžiami

### **Debug Tools**
- [ ] Docker logs komandos žinomos
- [ ] Container inspection komandos žinomos
- [ ] Network debugging komandos žinomos
- [ ] Performance profiling komandos žinomos
- [ ] Log analysis tools'ai įdiegti

## 📈 **Optimization Checklist**

### **Performance Tuning**
- [ ] Database queries optimizuotos
- [ ] Caching strategija sukonfigūruota
- [ ] Static failų optimizacija atlikta
- [ ] CDN sukonfigūruotas (jei reikia)
- [ ] Load balancing'as sukonfigūruotas (jei reikia)

### **Resource Optimization**
- [ ] Container resource limit'ai nustatyti
- [ ] Memory usage optimizuotas
- [ ] CPU usage optimizuotas
- [ ] Disk I/O optimizuotas
- [ ] Network bandwidth optimizuotas

## ✅ **Final Verification**

### **System Health**
- [ ] Visi health check'ai praeina
- [ ] Performance metrikos normalūs
- [ ] Error rate yra žemas
- [ ] Resource usage yra normalus
- [ ] Uptime yra 99%+

### **User Acceptance**
- [ ] Vartotojai gali prisijungti
- [ ] Pagrindinės funkcijos veikia
- [ ] Performance yra priimtinas
- [ ] UI/UX yra patogus
- [ ] Feedback yra teigiamas

---

## 📝 **Deployment Notes**

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** _______________  
**Environment:** _______________  

**Issues Found:**  
- [ ] _______________
- [ ] _______________
- [ ] _______________

**Actions Taken:**  
- [ ] _______________
- [ ] _______________
- [ ] _______________

**Next Steps:**  
- [ ] _______________
- [ ] _______________
- [ ] _______________

---

**Pastaba:** Šis checklist'as turi būti užpildytas kiekvieną kartą diegiant A-DIENYNAS sistemą. Visi punktai turi būti pažymėti kaip užbaigti prieš perduodant sistemą vartotojams.

**Kontaktai:** Jei kyla klausimų dėl deployment'o, kreipkitės į IT inžinierius.
