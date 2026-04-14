# GetHired Deployment Guide

## Deployment Overview

This guide covers deploying GetHired to production environments using popular cloud platforms.

## Prerequisites

- Domain name
- SSL certificate
- Cloud account (AWS, Heroku, etc.)
- Database credentials
- API keys (Gemini, Groq)

## Local Production Testing

### 1. Build Frontend

```bash
cd frontend
npm run build

# Verify dist/ folder
ls -la dist/
```

### 2. Run Backend in Production Mode

```bash
cd backend

# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
FLASK_ENV=production gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### 3. Test Locally

- Frontend: http://localhost:3000
- API: http://localhost:5000/api

## Heroku Deployment

### Backend Deployment

1. **Install Heroku CLI**
   ```bash
   curl https://cli.heroku.com/install.sh | sh
   ```

2. **Create Heroku App**
   ```bash
   heroku login
   heroku create gethired-api
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set FLASK_ENV=production
   heroku config:set SECRET_KEY=your-strong-secret-key
   heroku config:set GEMINI_API_KEY=your-gemini-key
   heroku config:set GROQ_API_KEY=your-groq-key
   ```

4. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:standard-0
   ```

5. **Deploy**
   ```bash
   cd backend
   git push heroku main
   ```

6. **Run Migrations**
   ```bash
   heroku run python -c "from database import init_db; init_db()"
   ```

### Frontend Deployment (Heroku)

For static site hosting, use a buildpack:

1. **Create Frontend App**
   ```bash
   heroku create gethired-app
   ```

2. **Add Buildpack**
   ```bash
   heroku buildpacks:add mars/create-react-app
   cd frontend
   git push heroku main
   ```

3. **Set API URL**
   ```bash
   heroku config:set REACT_APP_API_URL=https://gethired-api.herokuapp.com/api
   ```

## AWS Deployment

### Backend (EC2 + RDS)

1. **Create EC2 Instance**
   ```
   - AMI: Ubuntu 22.04 LTS
   - Instance: t3.medium
   - Security Groups: Allow 22, 80, 443
   ```

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

3. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install python3.11 python3.11-venv python3-pip nginx
   ```

4. **Setup Application**
   ```bash
   cd /home/ec2-user
   git clone https://github.com/yourusername/GetHired.git
   cd GetHired/backend
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

5. **Configure Environment**
   ```bash
   nano .env
   # Add production settings
   ```

6. **Create Systemd Service**
   ```bash
   sudo nano /etc/systemd/system/gethired.service
   ```
   
   ```ini
   [Unit]
   Description=GetHired API
   After=network.target

   [Service]
   User=ec2-user
   WorkingDirectory=/home/ec2-user/GetHired/backend
   Environment="PATH=/home/ec2-user/GetHired/backend/venv/bin"
   ExecStart=/home/ec2-user/GetHired/backend/venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 app:app
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

7. **Start Service**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start gethired
   sudo systemctl enable gethired
   ```

8. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/gethired
   ```
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

9. **Enable Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/gethired /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Frontend (S3 + CloudFront)

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://gethired-frontend --region us-east-1
   ```

2. **Build and Upload**
   ```bash
   cd frontend
   npm run build
   aws s3 sync dist/ s3://gethired-frontend --delete
   ```

3. **Configure S3 for Static Hosting**
   - Enable static website hosting
   - Set index.html as error document

4. **Create CloudFront**
   - Origin: S3 bucket
   - Default root object: index.html
   - Add SSL certificate

### RDS Database

1. **Create RDS Instance**
   - Engine: PostgreSQL 14
   - Instance: db.t3.small
   - Storage: 20GB
   - Backup enabled

2. **Update Backend Connection**
   ```python
   # config.py
   DATABASE_URL = "postgresql://user:pass@rds-endpoint:5432/gethired"
   ```

## Docker Deployment

### Dockerfile (Backend)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Run application
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Dockerfile (Frontend)

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://gethired:password@db:5432/gethired
      FLASK_ENV: production
    depends_on:
      - db
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: postgres:14
    environment:
      POSTGRES_USER: gethired
      POSTGRES_PASSWORD: password
      POSTGRES_DB: gethired
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Database Migration

### From SQLite to PostgreSQL

1. **Export SQLite data**
   ```bash
   sqlite3 gethired.db .dump > backup.sql
   ```

2. **Create PostgreSQL connection**
   ```python
   # Migration script
   from sqlalchemy import create_engine
   from sqlalchemy_utils import create_database, drop_database
   
   new_db_url = 'postgresql://user:pass@host/gethired'
   engine = create_engine(new_db_url)
   create_database(engine.url)
   
   # Recreate tables and migrate data
   from database import db, init_db
   init_db()
   ```

3. **Update DATABASE_URL**
   ```
   DATABASE_URL=postgresql://user:pass@host/gethired
   ```

## SSL Certificate Setup

### Let's Encrypt (Free)

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Generate Certificate**
   ```bash
   sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com
   ```

3. **Update Nginx**
   ```nginx
   server {
       listen 443 ssl http2;
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
   }
   ```

4. **Auto-renewal**
   ```bash
   sudo systemctl enable certbot.timer
   ```

## Production Checklist

### Backend
- [ ] Environment variables configured
- [ ] Database migrated and backed up
- [ ] FLASK_ENV=production
- [ ] Strong SECRET_KEY set
- [ ] CORS properly configured
- [ ] Database connection pooling enabled
- [ ] Logging configured
- [ ] Error monitoring set up (Sentry)
- [ ] Rate limiting enabled
- [ ] API key validation working

### Frontend
- [ ] Production build created (npm run build)
- [ ] API URL correctly configured
- [ ] Environment variables set
- [ ] Static assets compressed
- [ ] Service worker configured
- [ ] Analytics integrated
- [ ] Error tracking configured
- [ ] Security headers set
- [ ] CSP policy defined

### Infrastructure
- [ ] SSL certificate installed
- [ ] HTTPS enforced
- [ ] Firewall rules configured
- [ ] Backups scheduled
- [ ] Monitoring enabled
- [ ] Load balancer configured
- [ ] CDN configured
- [ ] Database backups automated
- [ ] Logs centralized
- [ ] Disaster recovery plan

## Monitoring & Maintenance

### Application Monitoring

```python
# Sentry integration
import sentry_sdk

sentry_sdk.init(
    "https://your-sentry-dsn@sentry.io/project",
    traces_sample_rate=1.0
)
```

### Database Backups

```bash
# PostgreSQL backup
pg_dump -U gethired gethired > backup_$(date +%Y%m%d).sql

# Restore
psql gethired < backup_20240115.sql
```

### Log Rotation

```bash
# /etc/logrotate.d/gethired
/var/log/gethired/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

## Scaling Strategy

### Horizontal Scaling

1. **Multiple API Servers**
   - Load balancer (Nginx, HAProxy)
   - Multiple Gunicorn instances
   - Shared database

2. **Database Replication**
   - Primary (write)
   - Read replicas
   - Connection pooling

3. **Caching Layer**
   - Redis for session cache
   - Cache frequently accessed data
   - Implement cache invalidation

### Vertical Scaling

1. **Increase Instance Size**
   - More CPU/RAM
   - Better performance
   - Simple but limited

### Cost Optimization

- Use auto-scaling groups
- Schedule scaling based on traffic
- Use reserved instances
- Monitor and optimize queries
- Cache aggressively

## Rollback Procedure

### Frontend Rollback
```bash
# Revert to previous version
git revert HEAD
npm run build
aws s3 sync dist/ s3://gethired-frontend
```

### Backend Rollback
```bash
# Revert code
git revert HEAD

# Redeploy
git push heroku main
```

## Post-Deployment

1. **Verify Deployment**
   - Check health endpoint
   - Test critical flows
   - Monitor error logs

2. **Performance Monitoring**
   - Check response times
   - Monitor database queries
   - Track API usage

3. **Security Validation**
   - Test authentication
   - Verify SSL
   - Check CORS

---

For questions or issues, refer to:
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Architecture Guide](./ARCHITECTURE.md)
