# /home/master/A-DIENYNAS/README.md
# A-DIENYNAS Docker Containerization Guide
# CHANGE: Created comprehensive README documentation
# PURPOSE: Complete documentation for A-DIENYNAS Docker deployment
# UPDATES: Initial setup with all necessary information

# 🎓 A-DIENYNAS - Student Diary Management System

**A-DIENYNAS** yra modernus studentų dienynas ir mokymosi valdymo sistema, sukurta su Django REST API backend'u ir Next.js frontend'u. Sistema valdo 5 vartotojų tipus: studentus, tėvus, kuratorius, mentorius ir administratorius.

## 🚀 **Quick Start**

### **1. Prerequisites**
- Docker Engine 20.10+
- Docker Compose 2.0+
- Linux Ubuntu 20.04+ (recommended)
- At least 4GB RAM
- At least 20GB free disk space

### **2. Clone and Setup**
```bash
# Clone the repository
git clone <repository-url>
cd A-DIENYNAS

# Copy environment file
cp env.docker .env.docker

# Edit environment variables
nano .env.docker

# Make scripts executable
chmod +x scripts/*.sh
```

### **3. Deploy System**
```bash
# Run deployment script
./scripts/deploy.sh

# Or manually with Docker Compose
docker compose up -d
```

### **4. Access System**
- **Frontend:** http://192.168.88.167 (current server)
- **Backend API:** http://192.168.88.167/api
- **Local Access:** http://localhost (for development)
- **Future Server:** http://192.168.192.168 (configured)
- **Admin Access:** admin@example.com / admin123

## 🐳 **Docker Architecture**

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

## 📁 **Project Structure**

```
A-DIENYNAS/
├── docker/                          # Docker configurations
│   ├── nginx/                       # Nginx configuration
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── sites-enabled/
│   │       └── a-dienynas.conf
│   ├── backend/                     # Backend Docker config
│   │   ├── Dockerfile
│   │   └── entrypoint.sh
│   ├── frontend/                    # Frontend Docker config
│   │   └── Dockerfile
│   └── postgres/                    # PostgreSQL config
│       └── init.sql
├── scripts/                         # Deployment scripts
│   ├── deploy.sh                    # Main deployment script
│   ├── backup.sh                    # Backup script
│   ├── restore.sh                   # Restore script
│   └── maintenance.sh               # Maintenance script
├── docker-compose.yml               # Main Docker Compose
├── env.docker                       # Environment variables
├── backups/                         # Backup files
├── logs/                            # Log files
└── README.md                        # This file
```

## 🌐 **Server IP Configuration**

### **IP Address Management**
Sistema sukonfigūruota dirbti su keliais serverio IP adresais:

#### **Current Configuration**
- **Active Server IP:** 192.168.88.167
- **Future Server IP:** 192.168.192.168 (pre-configured)
- **Local Development:** localhost, 127.0.0.1

### **Automatic IP Switching**
Naudokite automatizuotą script'ą serverio IP keitimui:

```bash
# Switch to current server IP
./scripts/switch-server-ip.sh current

# Switch to future server IP  
./scripts/switch-server-ip.sh future

# Switch to custom IP
./scripts/switch-server-ip.sh 192.168.1.100

# Show current configuration
grep -E "(NEXT_PUBLIC_API_URL|ALLOWED_HOSTS)" .env
```

#### **Manual Configuration Files**
Jei reikia keisti rankiniu būdu:

**1. Nginx Configuration**
```bash
# Edit server_name in nginx config
nano docker/nginx/sites-enabled/a-dienynas.conf
# server_name localhost 192.168.88.167 192.168.192.168;
```

**2. Environment Variables**
```bash
# Edit .env file
nano .env
# Update these lines:
# ALLOWED_HOSTS=localhost,127.0.0.1,192.168.88.167,192.168.192.168
# CORS_ALLOWED_ORIGINS=http://localhost:3000,http://192.168.88.167:3000,http://192.168.192.168:3000
# NEXT_PUBLIC_API_URL=http://192.168.88.167/api
```

**3. Restart Services**
```bash
# Apply configuration changes
docker compose down
docker compose up -d
```

### **Network Security Configuration**
- **Firewall Rules:** Allow ports 80/443 for configured IPs
- **CORS Policy:** Configured for both current and future IPs
- **Django ALLOWED_HOSTS:** Includes all configured server IPs
- **SSL Support:** Ready for HTTPS configuration

## 🔧 **Configuration**

### **Environment Variables**
Edit `env.docker` file to configure:
- Database passwords
- Django secret key
- API URLs
- Redis configuration
- SSL certificates (production)

### **Port Configuration**
- **80/443:** Nginx (HTTP/HTTPS) - External access
- **3000:** Frontend (Next.js) - Internal Docker network
- **8000:** Backend (Django + Gunicorn) - Internal Docker network
- **5432:** PostgreSQL - Internal Docker network
- **6379:** Redis - Internal Docker network

### **Network Access**
- **Current Server IP:** 192.168.88.167
- **Future Server IP:** 192.168.192.168 (pre-configured)
- **Local Development:** localhost, 127.0.0.1

## 💾 **Backup Strategy**

### **Automated Backups**
```bash
# Create backup
./scripts/backup.sh

# Restore from backup
./scripts/restore.sh 20250125_143000

# Dry run restore
./scripts/restore.sh 20250125_143000 --dry-run
```

### **Backup Contents**
- **Database:** PostgreSQL dump
- **Uploads:** Media files
- **Logs:** Application logs
- **Redis:** Cache data
- **Configuration:** Docker configs

### **Backup Retention**
- Default: 7 days
- Configurable via `BACKUP_RETENTION_DAYS`
- Automatic cleanup of old backups

## 🛠️ **Maintenance**

### **System Monitoring**
```bash
# Show system status
./scripts/maintenance.sh

# Health checks
./scripts/maintenance.sh --health

# Resource usage
./scripts/maintenance.sh --resources

# Clean up resources
./scripts/maintenance.sh --cleanup

# Full maintenance with report
./scripts/maintenance.sh --all --report
```

### **Log Management**
- Logs stored in `./logs/` directory
- Automatic log rotation
- 7-day retention policy
- Structured logging format

## 🔒 **Security Features**

### **Network Security**
- Isolated Docker network
- Port exposure only where necessary
- Rate limiting on API endpoints
- CORS configuration

### **Application Security**
- JWT authentication
- Secure headers (XSS, CSRF protection)
- Input validation
- SQL injection prevention

### **Container Security**
- Non-root user execution
- Minimal base images
- Regular security updates
- Resource limits

## 📊 **Monitoring & Health Checks**

### **Health Check Endpoints**
- **Backend:** `/api/health/`
- **Frontend:** `/`
- **Nginx:** `/health`
- **Database:** PostgreSQL connection
- **Redis:** Ping command

### **Resource Monitoring**
- Container resource usage
- System resource monitoring
- Disk space monitoring
- Network traffic monitoring

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Containers Not Starting**
```bash
# Check logs
docker compose logs

# Check container status
docker compose ps

# Restart services
docker compose restart
```

#### **Database Connection Issues**
```bash
# Check PostgreSQL logs
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U a_dienynas_user -d a_dienynas
```

#### **Port Conflicts**
```bash
# Check port usage
sudo ss -tlnp | grep -E ':(80|443|3000|8000|5432)'

# Stop conflicting services
sudo systemctl stop apache2 nginx
```

### **Debug Commands**
```bash
# Container inspection
docker inspect <container-name>

# Network inspection
docker network inspect a-dienynas_a-dienynas-network

# Volume inspection
docker volume ls
docker volume inspect <volume-name>
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

### **System Optimization**
- SSD storage recommended
- Sufficient RAM allocation
- Network optimization
- Regular maintenance

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
# Edit configuration files
nano docker/nginx/sites-enabled/a-dienynas.conf

# Reload services
docker compose restart nginx
```

### **Database Updates**
```bash
# Run migrations
docker compose exec backend python manage.py migrate

# Collect static files
docker compose exec backend python manage.py collectstatic --noinput
```

## 📋 **Deployment Checklist**

### **Pre-Deployment**
- [ ] Docker Engine installed
- [ ] Docker Compose installed
- [ ] Environment variables configured
- [ ] Firewall configured
- [ ] SSL certificates ready (production)

### **Deployment**
- [ ] Containers start successfully
- [ ] Database migrations complete
- [ ] Static files collected
- [ ] Health checks pass
- [ ] Services accessible

### **Post-Deployment**
- [ ] Backup scripts working
- [ ] Monitoring active
- [ ] Logs being collected
- [ ] Performance acceptable
- [ ] Security verified

## 🌐 **Production Deployment**

### **SSL Configuration**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Firewall Configuration**
```bash
# Enable UFW
sudo ufw enable

# Allow necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Check status
sudo ufw status
```

### **Monitoring Setup**
```bash
# Set up log rotation
sudo nano /etc/logrotate.d/a-dienynas

# Configure system monitoring
sudo apt install htop iotop nethogs
```

## 📞 **Support & Maintenance**

### **Regular Tasks**
- **Daily:** Check system status
- **Weekly:** Create backups
- **Monthly:** Security updates
- **Quarterly:** Performance review

### **Contact Information**
- **IT Engineers:** [Contact Info]
- **Documentation:** [Wiki Link]
- **Issues:** [Issue Tracker]

## 📚 **Additional Resources**

### **Documentation**
- [Docker Documentation](https://docs.docker.com/)
- [Django Documentation](https://docs.djangoproject.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### **Troubleshooting Guides**
- [Docker Troubleshooting](https://docs.docker.com/config/daemon/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [PostgreSQL Administration](https://www.postgresql.org/docs/current/admin.html)

---

**Last Updated:** 2025-01-25  
**Version:** 1.0.0  
**Maintainer:** IT Engineering Team

---

*This documentation is part of the A-DIENYNAS project. For questions or support, please contact the IT engineering team.*

