# Render Deployment Guide

Complete guide to deploy both frontend and backend on Render.

## 🚀 Yes, You Can Deploy Both on Render!

Render supports deploying:
- **Backend**: As a Web Service (Node.js/Express)
- **Frontend**: As a Web Service (Next.js has its own server)

## Prerequisites

- Render account ([Sign up free](https://render.com))
- GitHub repository with your code
- Gemini API key ([Get one here](https://ai.google.dev/))

## Step-by-Step Deployment

### Part 1: Deploy Backend (Express Server)

#### 1.1 Create Web Service

1. Log into [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Click **"Connect"** next to your repository

#### 1.2 Configure Backend Service

Fill in the following settings:

**Basic Settings:**
- **Name**: `gemini-robotics-backend` (or your choice)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `apps/server` ⚠️ **CRITICAL!**

**Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**: 
  ```bash
  cd /opt/render/project/src && npm install -g pnpm && pnpm install && pnpm build
  ```
- **Start Command**: 
  ```bash
  node dist/index.js
  ```

**Instance Type:**
- Select **Free** (for testing) or **Starter** (for production)

#### 1.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=5050
NODE_ENV=production
```

**Important Notes:**
- Do NOT add `WEB_ORIGIN` yet (we'll add it after deploying frontend)
- Keep `PORT=5050` (Render will expose it via the provided URL)

#### 1.4 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for build and deployment (3-5 minutes)
3. Once deployed, copy your backend URL (e.g., `https://gemini-robotics-backend.onrender.com`)

#### 1.5 Test Backend

```bash
# Health check
curl https://your-backend.onrender.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Part 2: Deploy Frontend (Next.js)

#### 2.1 Create Another Web Service

1. Go back to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect the **same** GitHub repository
4. Click **"Connect"** again

#### 2.2 Configure Frontend Service

Fill in the following settings:

**Basic Settings:**
- **Name**: `gemini-robotics-frontend` (or your choice)
- **Region**: Same as backend
- **Branch**: `main`
- **Root Directory**: `apps/web` ⚠️ **CRITICAL!**

**Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**: 
  ```bash
  cd /opt/render/project/src && npm install -g pnpm && pnpm install && pnpm build
  ```
- **Start Command**: 
  ```bash
  pnpm start
  ```

**Instance Type:**
- Select **Free** or **Starter**

#### 2.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

```env
NEXT_PUBLIC_SERVER_URL=https://your-backend.onrender.com
```

Replace `https://your-backend.onrender.com` with the actual URL from Part 1.4.

#### 2.4 Deploy Frontend

1. Click **"Create Web Service"**
2. Wait for build and deployment (3-5 minutes)
3. Once deployed, copy your frontend URL (e.g., `https://gemini-robotics-frontend.onrender.com`)

### Part 3: Configure CORS

Now that both services are deployed, configure backend CORS:

#### 3.1 Update Backend Environment Variables

1. Go to your **backend service** in Render Dashboard
2. Click **"Environment"** tab
3. Add new environment variable:

```env
WEB_ORIGIN=https://your-frontend.onrender.com
```

Replace with your actual frontend URL from Part 2.4.

#### 3.2 Redeploy Backend

Click **"Manual Deploy"** → **"Deploy latest commit"** to apply the CORS changes.

### Part 4: Test Complete Deployment

1. Open your frontend URL: `https://your-frontend.onrender.com`
2. Allow camera and microphone permissions
3. Test features:
   - ✅ Camera feed appears
   - ✅ ER detection works (points/boxes/trajectory)
   - ✅ Live conversation connects
   - ✅ No CORS errors in browser console

## ⚠️ Important Render Considerations

### Free Tier Limitations

**Free tier services spin down after 15 minutes of inactivity:**
- First request may take 30-50 seconds to wake up
- Not suitable for production use
- Users may experience delays

**Solution Options:**
1. Upgrade to **Starter** plan ($7/month per service)
2. Use external uptime monitor to keep services warm (limited effectiveness)
3. Accept the cold start delay for demos/testing

### Build Command Issues

If builds fail, try these alternative build commands:

**Backend Build Command (Alternative):**
```bash
npm install -g pnpm && cd apps/server && pnpm install && pnpm build
```

**Frontend Build Command (Alternative):**
```bash
npm install -g pnpm && cd apps/web && pnpm install && pnpm build
```

### Port Configuration

- Render automatically assigns a port via `PORT` environment variable
- Your Express app must use `process.env.PORT`
- Default `5050` is overridden by Render's dynamic port

Verify in `apps/server/src/index.ts`:
```typescript
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 🔧 Troubleshooting

### Issue: Build Fails with "Command not found: pnpm"

**Solution**: Ensure build command includes `npm install -g pnpm`:
```bash
cd /opt/render/project/src && npm install -g pnpm && pnpm install && pnpm build
```

### Issue: "Root directory not found"

**Solution**: Double-check Root Directory setting:
- Backend: `apps/server`
- Frontend: `apps/web`

### Issue: CORS errors in browser

**Solution**: Verify `WEB_ORIGIN` matches your frontend URL exactly:
```bash
# Correct
WEB_ORIGIN=https://gemini-robotics-frontend.onrender.com

# Wrong
WEB_ORIGIN=https://gemini-robotics-frontend.onrender.com/
WEB_ORIGIN=http://gemini-robotics-frontend.onrender.com
```

### Issue: Camera not working

**Solution**: Ensure HTTPS is enabled (Render provides this automatically):
- Check URL starts with `https://`
- Browser may block camera on `http://`

### Issue: Service keeps restarting

**Check logs:**
1. Go to service in Render Dashboard
2. Click **"Logs"** tab
3. Look for errors

Common causes:
- Missing environment variables
- Port binding issues
- Dependency installation failures

### Issue: High latency

**Causes:**
- Cold start (free tier)
- Server region far from users
- Large thinking budget in ER settings

**Solutions:**
- Upgrade to paid tier
- Choose closer region
- Reduce thinking budget to 0-2
- Implement caching

## 📊 Cost Estimate

| Service | Free Tier | Starter ($7/mo) | Pro ($25/mo) |
|---------|-----------|-----------------|--------------|
| Backend | ✅ Spins down | ✅ Always on | ✅ Faster |
| Frontend | ✅ Spins down | ✅ Always on | ✅ Faster |
| **Total** | **$0/mo** | **$14/mo** | **$50/mo** |

**Plus Gemini API costs** (pay-as-you-go, varies by usage)

## 🚀 Production Recommendations

### For Demo/Testing
- Use **Free tier** for both services
- Accept cold start delays
- Perfect for showing off to friends

### For Production
- Use **Starter tier** ($7/mo each) minimum
- Add custom domain
- Enable auto-deploy from GitHub
- Set up health check monitoring

### Performance Optimization
1. **Enable auto-deploy**: Push to GitHub → Automatic deployment
2. **Health checks**: Render pings your service to keep it warm
3. **CDN**: Use Render's built-in CDN for static assets
4. **Caching**: Implement response caching on backend

## 📝 Environment Variables Reference

### Backend Environment Variables

**Required:**
```env
GEMINI_API_KEY=<your_api_key>
PORT=5050
```

**Optional but Recommended:**
```env
WEB_ORIGIN=https://your-frontend.onrender.com
NODE_ENV=production
LOG_LEVEL=info
```

### Frontend Environment Variables

**Required:**
```env
NEXT_PUBLIC_SERVER_URL=https://your-backend.onrender.com
```

**Optional:**
```env
NODE_ENV=production
```

## 🔄 CI/CD Setup

Enable automatic deployments:

1. Go to service → **"Settings"**
2. Under **"Build & Deploy"**:
   - ✅ **Auto-Deploy**: Yes
   - **Branch**: `main`

Now every push to `main` triggers automatic deployment!

## 🌐 Custom Domain (Optional)

### Add Custom Domain to Frontend

1. Go to frontend service → **"Settings"**
2. Click **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter your domain (e.g., `gemini.yourdomain.com`)
5. Update DNS records at your domain registrar:

```
Type: CNAME
Name: gemini (or subdomain)
Value: your-frontend.onrender.com
```

6. Wait for DNS propagation (5-60 minutes)
7. Render auto-provisions SSL certificate

### Update Backend CORS

After adding custom domain, update backend `WEB_ORIGIN`:

```env
WEB_ORIGIN=https://gemini.yourdomain.com
```

## 🎯 Quick Command Reference

### View Logs
```bash
# In Render Dashboard → Service → Logs tab
# Or use Render CLI:
render logs -s your-service-name
```

### Manual Deploy
```bash
# Dashboard → Service → Manual Deploy → "Deploy latest commit"
```

### Check Service Status
```bash
# Health check endpoints:
curl https://your-backend.onrender.com/health
curl https://your-frontend.onrender.com
```

## 📞 Support

**Render Support:**
- [Render Documentation](https://render.com/docs)
- [Render Community Forum](https://community.render.com/)
- Support email: support@render.com

**Project Issues:**
- Check logs first
- Verify environment variables
- Test locally with same config
- Consult main [DEPLOYMENT.md](DEPLOYMENT.md)

## ✅ Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] CORS configured (`WEB_ORIGIN` set)
- [ ] Environment variables configured
- [ ] Camera permissions work (HTTPS)
- [ ] ER detection functioning
- [ ] Live API connecting
- [ ] No console errors
- [ ] Auto-deploy enabled
- [ ] Monitoring set up (optional)
- [ ] Custom domain added (optional)

## 🎉 Success!

Both your frontend and backend are now deployed on Render!

**Your URLs:**
- Frontend: `https://your-frontend.onrender.com`
- Backend: `https://your-backend.onrender.com`

Share your app with the world! 🚀

---

**Need help?** See [DEPLOYMENT.md](DEPLOYMENT.md) for other deployment options (Vercel + Railway, VPS, Docker).
