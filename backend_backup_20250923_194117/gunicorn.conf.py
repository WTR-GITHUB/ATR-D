# /backend/gunicorn.conf.py
# A-DIENYNAS Gunicorn Configuration
# PURPOSE: Production WSGI server configuration for Django backend
# UPDATES: Initial setup with optimal settings for containerized deployment

import multiprocessing
import os

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 100

# Logging
accesslog = "/app/logs/gunicorn-access.log"
errorlog = "/app/logs/gunicorn-error.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "a-dienynas-backend"

# Server mechanics
preload_app = True
daemon = False
pidfile = "/tmp/gunicorn.pid"
user = None
group = None
tmp_upload_dir = None

# SSL (for HTTPS in production)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"

# Worker process management
worker_tmp_dir = "/dev/shm"