# Deployment Guide

## Production Deployment Options

### Option 1: Vercel + Railway (Recommended)

#### Frontend on Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy from apps/web**
```bash
cd apps/web
vercel deploy --prod
```

3. **Configure Environment Variables in Vercel Dashboard**
```env
NEXT_PUBLIC_SERVER_URL=https://your-backend.railway.app
```

4. **Custom Domain (Optional)**
- Add domain in Vercel dashboard
- Update DNS records

#### Backend on Railway

1. **Create Railway Account**
- Visit https://railway.app
- Sign up with GitHub

2. **New Project from GitHub**
- Connect repository
- Select `apps/server` as root directory

3. **Configure Environment Variables**
```env
GEMINI_API_KEY=your_api_key_here
PORT=5050
WEB_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

4. **Configure Build**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build",
    "startCommand": "node dist/index.js"
  }
}
```

5. **Generate Domain**
- Railway provides automatic HTTPS domain
- Copy URL for frontend configuration

### Option 2: Docker Deployment

#### Using Docker Compose

1. **Build Images**
```bash
docker-compose build
```

2. **Set Environment Variables**
```bash
export GEMINI_API_KEY=your_api_key_here
```

3. **Run Containers**
```bash
docker-compose up -d
```

4. **Check Logs**
```bash
docker-compose logs -f
```

5. **Stop Containers**
```bash
docker-compose down
```

#### Individual Docker Images

**Build Server:**
```bash
docker build --target server -t gemini-server .
docker run -p 5050:5050 \
  -e GEMINI_API_KEY=your_key \
  -e WEB_ORIGIN=https://your-frontend.com \
  gemini-server
```

**Build Web:**
```bash
docker build --target web -t gemini-web .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SERVER_URL=https://your-backend.com \
  gemini-web
```

### Option 3: VPS (DigitalOcean, AWS, etc.)

#### Setup on Ubuntu Server

1. **Install Node.js 20**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm pm2
```

2. **Clone Repository**
```bash
git clone <your-repo>
cd gemini-robotics-live
pnpm install
```

3. **Configure Environment**
```bash
# Backend
cat > apps/server/.env << EOF
GEMINI_API_KEY=your_key
PORT=5050
WEB_ORIGIN=https://yourdomain.com
EOF

# Frontend
cat > apps/web/.env.local << EOF
NEXT_PUBLIC_SERVER_URL=https://api.yourdomain.com
EOF
```

4. **Build Applications**
```bash
pnpm build
```

5. **Run with PM2**
```bash
# Backend
pm2 start apps/server/dist/index.js --name gemini-server

# Frontend
cd apps/web
pm2 start npm --name gemini-web -- start

# Save PM2 config
pm2 save
pm2 startup
```

6. **Configure Nginx**
```nginx
# /etc/nginx/sites-available/gemini

# Frontend
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **Enable SSL with Certbot**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

### Option 4: Render

#### Backend on Render

1. **Create Web Service**
- Connect GitHub repository
- Root Directory: `apps/server`
- Build Command: `pnpm install && pnpm build`
- Start Command: `node dist/index.js`

2. **Environment Variables**
```env
GEMINI_API_KEY=your_key
PORT=5050
WEB_ORIGIN=https://your-frontend.onrender.com
```

#### Frontend on Render

1. **Create Static Site**
- Root Directory: `apps/web`
- Build Command: `pnpm install && pnpm build`
- Publish Directory: `.next`

2. **Environment Variables**
```env
NEXT_PUBLIC_SERVER_URL=https://your-backend.onrender.com
```

## Environment Variables Reference

### Backend (Required)
```env
GEMINI_API_KEY=<your_gemini_api_key>
PORT=5050
```

### Backend (Optional)
```env
WEB_ORIGIN=https://your-frontend.com
NODE_ENV=production
LOG_LEVEL=info
```

### Frontend (Required)
```env
NEXT_PUBLIC_SERVER_URL=https://your-backend.com
```

## Security Checklist

Before deploying to production:

- [ ] API key stored securely (environment variables, not in code)
- [ ] CORS configured with specific origins (not `*`)
- [ ] HTTPS enabled (required for camera access)
- [ ] Ephemeral tokens used for Live API
- [ ] No sensitive data in logs
- [ ] Rate limiting implemented
- [ ] Error messages don't expose internals
- [ ] Dependencies up to date
- [ ] Security headers configured

## Performance Optimization

### Frontend Optimizations

1. **Next.js Config**
```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['your-backend.com'],
  },
  compress: true,
};
```

2. **Image Optimization**
- Reduce capture resolution
- Adjust JPEG quality
- Implement frame dropping

3. **Code Splitting**
- Use dynamic imports for heavy components
- Lazy load Live API client

### Backend Optimizations

1. **Add Caching**
```typescript
// Simple in-memory cache for recent results
const cache = new Map();

app.post('/api/er/frame', async (req, res) => {
  const hash = hashImage(req.body.imageBase64);
  
  if (cache.has(hash)) {
    return res.json(cache.get(hash));
  }
  
  const result = await processFrame(req.body);
  cache.set(hash, result);
  
  res.json(result);
});
```

2. **Connection Pooling**
- Reuse HTTP connections
- Keep-alive headers

3. **Compression**
```typescript
import compression from 'compression';
app.use(compression());
```

## Monitoring

### Health Checks

**Backend:**
```bash
curl https://api.yourdomain.com/health
```

**Frontend:**
```bash
curl https://yourdomain.com
```

### Logging

**PM2 Logs:**
```bash
pm2 logs gemini-server
pm2 logs gemini-web
```

**Docker Logs:**
```bash
docker logs gemini-server
docker logs gemini-web
```

### Monitoring Services

- **Uptime**: UptimeRobot, Pingdom
- **Performance**: New Relic, DataDog
- **Errors**: Sentry
- **Analytics**: Google Analytics, Plausible

## Scaling

### Horizontal Scaling

1. **Load Balancer** (Nginx/HAProxy)
```nginx
upstream backend {
    server backend1:5050;
    server backend2:5050;
    server backend3:5050;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

2. **Container Orchestration** (Kubernetes)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gemini-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gemini-server
  template:
    metadata:
      labels:
        app: gemini-server
    spec:
      containers:
      - name: server
        image: gemini-server:latest
        ports:
        - containerPort: 5050
        env:
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: gemini-secrets
              key: api-key
```

### Vertical Scaling

- Increase server resources
- Optimize thinking budget
- Reduce frame rate
- Implement request queuing

## Backup & Recovery

### Backup Strategy

1. **Configuration Backup**
```bash
# Backup environment variables
cp apps/server/.env apps/server/.env.backup
cp apps/web/.env.local apps/web/.env.local.backup
```

2. **Database Backup** (if added)
```bash
# Example for PostgreSQL
pg_dump -h localhost -U user -d gemini > backup.sql
```

### Disaster Recovery

1. **Version Control**
- All code in Git
- Tag releases
- Document deployment process

2. **Rollback Plan**
```bash
# Vercel rollback
vercel rollback

# PM2 rollback
pm2 reload gemini-server --update-env
```

## Cost Optimization

### Gemini API Costs

- Monitor usage in Google Cloud Console
- Implement rate limiting per user
- Cache repeated requests
- Use lower thinking budget by default
- Reduce frame capture rate

### Infrastructure Costs

**Estimated Monthly Costs:**

| Platform | Backend | Frontend | Total |
|----------|---------|----------|-------|
| Railway + Vercel | $5-20 | Free-$20 | $5-40 |
| Render | $7-25 | Free | $7-25 |
| VPS (DigitalOcean) | $6-12 | (Same server) | $6-12 |
| AWS/GCP | $10-50+ | $5-20 | $15-70+ |

## Troubleshooting Production Issues

### Issue: Camera Not Working in Production

**Cause:** HTTPS required  
**Solution:** Ensure SSL certificate installed

### Issue: CORS Errors

**Cause:** Mismatched origins  
**Solution:** Update `WEB_ORIGIN` environment variable

### Issue: High Latency

**Cause:** Server location far from users  
**Solution:** Deploy to region closer to users

### Issue: Rate Limits

**Cause:** Too many API requests  
**Solution:** Implement caching, reduce frame rate

### Issue: Memory Leaks

**Cause:** Unclosed connections, large cache  
**Solution:** Implement proper cleanup, limit cache size

## Post-Deployment Checklist

- [ ] Health check endpoints responding
- [ ] Camera access works (HTTPS)
- [ ] ER detection functioning
- [ ] Live API connecting
- [ ] CORS properly configured
- [ ] Environment variables set
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Documentation updated
- [ ] Team trained on deployment

## Support

For deployment issues:
1. Check logs first
2. Verify environment variables
3. Test health endpoints
4. Review monitoring dashboards
5. Consult platform-specific docs