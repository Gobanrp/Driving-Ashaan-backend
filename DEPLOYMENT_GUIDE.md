# Deployment Guide

This guide covers deploying the D-Zone backend to various platforms.

## Prerequisites

- Backend code ready (all files created)
- MongoDB database (Atlas or self-hosted)
- Account on deployment platform
- Environment variables prepared

## Deployment Platforms

### Option 1: Heroku (Recommended for beginners)

#### Setup

1. **Create Heroku Account**
   - Go to https://www.heroku.com
   - Sign up and verify email

2. **Install Heroku CLI**
   ```bash
   # Windows
   Download from https://devcenter.heroku.com/articles/heroku-cli
   
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Linux
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

3. **Login to Heroku**
   ```bash
   heroku login
   ```

4. **Create Heroku App**
   ```bash
   heroku create d-zone-api
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set PORT=5000
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/d-zone
   heroku config:set JWT_SECRET=your_production_secret_key
   heroku config:set JWT_EXPIRE=7d
   heroku config:set FRONTEND_URL=https://your-frontend.com
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **View Logs**
   ```bash
   heroku logs --tail
   ```

### Option 2: Railway

#### Setup

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "GitHub repo"
   - Connect your repository

3. **Add MongoDB Plugin**
   - In Railway dashboard
   - Click "Add plugins"
   - Select "MongoDB"

4. **Configure Environment**
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=<from plugin>
   JWT_SECRET=your_secret
   JWT_EXPIRE=7d
   FRONTEND_URL=https://your-frontend.com
   ```

5. **Deploy**
   - Railway auto-deploys on push to main

### Option 3: AWS

#### Setup with EC2

1. **Create EC2 Instance**
   - AWS Console → EC2
   - Launch instance (Ubuntu 20.04 LTS)
   - Security group: Allow ports 22, 80, 443, 5000

2. **SSH into Instance**
   ```bash
   ssh -i key.pem ubuntu@instance-ip
   ```

3. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm git
   curl https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/D-zone-backend.git
   cd Driving-Ashaan-backend
   npm install
   ```

5. **Setup PM2**
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name "d-zone-api"
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/default
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
       }
   }
   ```

7. **Setup SSL**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Option 4: Docker + Any Platform

#### Create Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
```

Create `.dockerignore`:

```
node_modules
npm-debug.log
.git
.gitignore
README.md
src
tsconfig.json
```

#### Build and Run Locally

```bash
docker build -t d-zone-api .
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongo:27017/d-zone \
  -e JWT_SECRET=your_secret \
  d-zone-api
```

#### Deploy to Docker Hub

```bash
docker tag d-zone-api your-username/d-zone-api:1.0
docker push your-username/d-zone-api:1.0
```

## Environment Variables Checklist

- [ ] `PORT` - Server port (default: 5000)
- [ ] `NODE_ENV` - Environment (production/development)
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Secret key for JWT (use strong value)
- [ ] `JWT_EXPIRE` - Token expiration (e.g., 7d)
- [ ] `FRONTEND_URL` - Frontend domain for CORS

## Database Setup

### MongoDB Atlas (Recommended)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Add IP to whitelist (or allow all: 0.0.0.0/0)
4. Create database user
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/d-zone`

## Domain Setup

### Using Namecheap/GoDaddy

1. Buy domain
2. Update nameservers to your hosting provider
3. Create DNS records:
   - A record pointing to server IP
   - CNAME for www

### DNS Configuration Example

```
Type    Name    Value
A       @       123.45.67.89
CNAME   www     your-domain.com
```

## SSL Certificate

### Using Let's Encrypt (Free)

```bash
sudo certbot certonly --standalone -d your-domain.com
```

Renew automatically:
```bash
sudo systemctl enable certbot.timer
```

## Monitoring & Logging

### Option 1: PM2 (Self-hosted)

```bash
pm2 logs
pm2 monit
pm2 plus  # Cloud monitoring
```

### Option 2: CloudWatch (AWS)

```bash
npm install aws-sdk
```

### Option 3: ELK Stack

Set up Elasticsearch, Logstash, Kibana for advanced logging.

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build
        run: npm install && npm run build
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: d-zone-api
          heroku_email: your-email@gmail.com
```

## Performance Optimization

### Enable Compression

Already enabled via helmet and express middleware.

### Database Indexing

Indexes already created for:
- `userId` in Progress and QuizAttempt
- `lessonId` in Progress and QuizAttempt
- Compound index on `userId` + `lessonId`

### Add Caching

```bash
npm install redis
```

Update server.ts to add Redis caching for lessons.

## Scaling

### Horizontal Scaling

1. Load Balancer (Nginx)
2. Multiple server instances
3. Session store (Redis)
4. Database replication

### Vertical Scaling

- Upgrade server specs
- Increase RAM and CPU
- Use SSD storage

## Backup Strategy

### MongoDB Atlas

- Automatic backups (included)
- Manual snapshot: Atlas → Backup
- Export to S3

### Docker Volumes

```bash
docker run -v d-zone-db:/data/db d-zone-api
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
heroku logs --tail

# View environment variables
heroku config

# Rebuild app
heroku rebuild
```

### Database Connection Failed

- Check `MONGODB_URI` format
- Verify IP whitelisting in MongoDB Atlas
- Test connection locally first

### High Memory Usage

```bash
# Check memory
heroku ps:type

# Upgrade dyno
heroku dyno:resize standard-2x
```

### Slow API Responses

- Check database indexes
- Monitor CPU usage
- Enable caching
- Check for N+1 queries

## Post-Deployment

1. **Test All Endpoints**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **Monitor Performance**
   - Set up uptime monitoring
   - Configure alerts
   - Track error rates

3. **Update Frontend**
   - Update `VITE_API_URL` environment variable
   - Deploy frontend

4. **Security Checklist**
   - [ ] JWT_SECRET is strong
   - [ ] CORS is restricted
   - [ ] Rate limiting is enabled
   - [ ] Helmet headers enabled
   - [ ] HTTPS enforced
   - [ ] Database user limited permissions

5. **Documentation**
   - [ ] API documentation updated
   - [ ] Deployment process documented
   - [ ] Team trained on procedures

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit
npm audit fix
```

### Database Maintenance

- Monitor storage usage
- Archive old quiz attempts
- Clean up completed lessons log

### Monitoring Commands

```bash
# Heroku
heroku ps
heroku logs --tail --app d-zone-api

# PM2
pm2 list
pm2 logs d-zone-api
pm2 save
pm2 startup

# Docker
docker ps
docker logs container-id
```

## Rollback Procedure

### Heroku

```bash
heroku releases
heroku rollback v42  # Roll back to specific version
```

### Git

```bash
git revert HEAD
git push
```

## Success! 🎉

Your backend is now deployed and accessible at `https://your-domain.com/api`

For support and questions, refer to:
- Backend README.md
- API_DOCUMENTATION.md
- FRONTEND_INTEGRATION.md
