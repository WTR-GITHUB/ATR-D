# /home/master/A-DIENYNAS/docker/nginx/Dockerfile
# A-DIENYNAS Nginx Dockerfile
# CHANGE: Created Nginx Dockerfile for reverse proxy service
# PURPOSE: Container image for Nginx reverse proxy
# UPDATES: Initial setup with Alpine Nginx and custom configuration

FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY sites-enabled/ /etc/nginx/sites-enabled/

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Set permissions
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chmod 755 /etc/nginx/sites-enabled/

# Expose ports
EXPOSE 80 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

