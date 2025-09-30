# 🚀 Quick Start: Deploy to Production

## TL;DR - Fix for Your Vercel Error

**Error:** `No Output Directory named "public" found after the Build completed`

**Solution:** Set **Root Directory** to `apps/web` in Vercel Dashboard Settings → General

---

## 📋 Prerequisites

Before deploying, make sure you have:

1. **Gemini API Key** - Get from https://aistudio.google.com/apikey
2. **GitHub Account** - Your code should be pushed to GitHub
3. **Vercel Account** - Sign up at https://vercel.com
4. **Railway Account** - Sign up at https://railway.app

---

## ⚡ Quick Deployment (5 minutes)

### Step 1: Deploy Backend to Railway (2 min)

1. Go to https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Select your repository
4. Click on the new service
5. Go to **Settings → General**:
   - **Root Directory:** `apps/server`
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `node dist/index.js`
6. Go to **Variables** tab, add:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=5050
   NODE_ENV=production
   WEB_ORIGIN=https://temp-placeholder.vercel.app
   ```
7. Go to **Settings → Networking**
8. Click **"Generate Domain"**
9. **Copy the domain URL** (e.g., `https://your-app-production.up.railway.app`)

### Step 2: Deploy Frontend to Vercel (2 min)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. **⚠️ CRITICAL:** Go to **Settings → General**
   - Click **Edit** on Root Directory
   - Enter: `apps/web`
   - Click **Save**
4. Go to **Settings → Environment Variables**
5. Add variable:
   ```
   Name: NEXT_PUBLIC_SERVER_URL
   Value: https://your-app-production.up.railway.app
   (use the Railway URL from Step 1)
   ```
6. Go to **Deployments** → Click **Redeploy**

### Step 3: Link Frontend & Backend (1 min)

1. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Go back to Railway → **Variables**
3. Update `WEB_ORIGIN`:
   ```
   WEB_ORIGIN=https://your-app.vercel.app
   ```
4. Railway will automatically redeploy

### ✅ Done! Test Your Deployment

Visit your Vercel URL. You should see:
- ✅ Frontend loads
- ✅ Camera permission request
- ✅ Video feed appears
- ✅ ER detection works
- ✅ No CORS errors (check browser console F12)

---

## 🛠️ Alternative: Deploy Using Scripts

We've created helper scripts for you:

### Deploy Backend (Railway)
```bash
./deploy-railway.sh
```

### Deploy Frontend (Vercel)
```bash
./deploy-vercel.sh
```

These scripts will:
- ✅ Check for required dependencies
- ✅ Verify environment variables
- ✅ Test build locally
- ✅ Guide you through deployment

---

## 📁 Files Created for You

1. **`apps/web/vercel.json`** - Vercel configuration
2. **`apps/web/.env.example`** - Frontend environment variables template
3. **`apps/server/.env.example`** - Backend environment variables template
4. **`VERCEL_DEPLOYMENT.md`** - Comprehensive deployment guide
5. **`DEPLOYMENT_ISSUES_FIXED.md`** - Detailed issue analysis
6. **`deploy-vercel.sh`** - Automated Vercel deployment script
7. **`deploy-railway.sh`** - Automated Railway deployment script

---

## 🔧 Configuration Summary

### Vercel Settings
| Setting | Value |
|---------|-------|
| Root Directory | `apps/web` ⚠️ **CRITICAL** |
| Framework | Next.js |
| Build Command | `pnpm build` |
| Install Command | `pnpm install --frozen-lockfile` |
| Environment Variable | `NEXT_PUBLIC_SERVER_URL` |

### Railway Settings
| Setting | Value |
|---------|-------|
| Root Directory | `apps/server` |
| Build Command | `pnpm install && pnpm build` |
| Start Command | `node dist/index.js` |
| Environment Variables | `GEMINI_API_KEY`, `WEB_ORIGIN`, `PORT` |

---

## 🐛 Troubleshooting

### "No Output Directory named 'public' found"
**Fix:** Set Root Directory to `apps/web` in Vercel Settings → General

### "CORS policy has blocked"
**Fix:** Update `WEB_ORIGIN` on Railway to match your Vercel URL exactly (including `https://`)

### "Failed to get token: 500"
**Fix:** Check `GEMINI_API_KEY` is set correctly on Railway

### Camera doesn't work
**Check:**
- Are you using HTTPS? (Vercel provides this automatically)
- Did you allow camera permissions in browser?

### Live API fails to connect
**Check:**
- Is `NEXT_PUBLIC_SERVER_URL` set correctly on Vercel?
- Is backend running? Test: `curl https://your-backend.railway.app/health`

---

## 💰 Cost Estimate

**Monthly Costs:**
- **Vercel (Frontend):** FREE for most use cases
- **Railway (Backend):** ~$5-20/month (backend is always running)
- **Gemini API:** Variable based on usage
  - ER 1.5: ~$0.42 per 100 images
  - Live API: Monitor in Google AI Studio

**Tips to reduce costs:**
- Lower frame rate for ER detection
- Implement rate limiting
- Set up usage alerts

---

## 📊 Architecture

```
User Browser (HTTPS)
      ↓
Vercel Frontend (apps/web)
      ↓ API Calls
Railway Backend (apps/server)
      ↓ API Calls
Google Gemini API
```

---

## 🎯 Post-Deployment Checklist

- [ ] Frontend loads at Vercel URL
- [ ] Camera permission works (HTTPS)
- [ ] Backend health check responds: `/health`
- [ ] ER detection shows bounding boxes
- [ ] Live API can start session
- [ ] No CORS errors in console
- [ ] Environment variables all set
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up (optional)

---

## 📚 Additional Resources

- **Comprehensive Guide:** See `VERCEL_DEPLOYMENT.md`
- **Issue Analysis:** See `DEPLOYMENT_ISSUES_FIXED.md`
- **Original Deployment Doc:** See `DEPLOYMENT.md`

---

## 🆘 Still Having Issues?

1. **Check build logs** in Vercel/Railway dashboard
2. **Verify environment variables** are set correctly
3. **Test locally first:** `pnpm dev` in repository root
4. **Check browser console** (F12) for errors
5. **Review** `DEPLOYMENT_ISSUES_FIXED.md` for detailed troubleshooting

---

## ✨ Success!

Once deployed, your app will:
- ✅ Process video in real-time with ER 1.5
- ✅ Support voice interactions with Live API
- ✅ Scale automatically on Vercel/Railway
- ✅ Use HTTPS for camera/microphone access

**Happy deploying! 🚀**