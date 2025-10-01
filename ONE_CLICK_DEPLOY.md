# One-Click Deploy to Render 🚀

Deploy both frontend and backend to Render with a single click!

## 🎯 One-Click Deploy Button

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/JackkySpice/Gemini-computer-vision)

Click the button above to deploy both services automatically!

## What Gets Deployed

When you click the deploy button, Render will automatically create:

1. ✅ **Backend Service** (Express API)
   - Node.js runtime
   - Automatic builds from `apps/server`
   - Health check monitoring
   - HTTPS enabled

2. ✅ **Frontend Service** (Next.js)
   - Node.js runtime
   - Automatic builds from `apps/web`
   - HTTPS enabled
   - Connected to backend

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Render Platform                      │
│                                                          │
│  ┌────────────────────┐         ┌──────────────────┐   │
│  │  Frontend Service  │◄───────►│ Backend Service  │   │
│  │                    │         │                  │   │
│  │  Next.js App       │         │  Express API     │   │
│  │  Port: 3000        │         │  Port: 5050      │   │
│  │                    │         │                  │   │
│  │  HTTPS URL:        │         │  HTTPS URL:      │   │
│  │  gemini-robotics-  │         │  gemini-robotics-│   │
│  │  frontend.onr...   │         │  backend.onr...  │   │
│  └────────────────────┘         └──────────────────┘   │
│           │                              │              │
│           │                              │              │
└───────────┼──────────────────────────────┼──────────────┘
            │                              │
            ▼                              ▼
      ┌──────────┐                  ┌─────────────┐
      │  User's  │                  │   Gemini    │
      │  Browser │                  │   API       │
      └──────────┘                  └─────────────┘
       (Camera &                      (ER 1.5 &
        Microphone)                    Live API)
```

**Data Flow:**
1. User opens frontend URL in browser
2. Frontend requests camera/microphone permissions
3. Frontend sends video frames to backend
4. Backend processes frames with Gemini ER API
5. Backend returns detection results
6. Frontend displays overlays on video
7. Live conversation flows through Gemini Live API

## 📋 Prerequisites

Before clicking deploy, make sure you have:

- [ ] Render account ([Sign up free](https://render.com/register))
- [ ] Gemini API key ([Get one here](https://ai.google.dev/))

## 🚀 Deployment Steps

### Step 1: Click the Deploy Button

Click the **Deploy to Render** button above. You'll be redirected to Render.

### Step 2: Sign In / Sign Up

- If you have a Render account, sign in
- If not, create a free account (takes 30 seconds)

### Step 3: Configure Services

Render will show you a blueprint with 2 services:

#### Service 1: gemini-robotics-backend
- **Name**: `gemini-robotics-backend` (you can change this)
- **Region**: `Oregon` (you can change this)
- **Plan**: `Free` (or upgrade to Starter $7/mo)

#### Service 2: gemini-robotics-frontend
- **Name**: `gemini-robotics-frontend` (you can change this)
- **Region**: `Oregon` (should match backend)
- **Plan**: `Free` (or upgrade to Starter $7/mo)

### Step 4: Add Your Gemini API Key

⚠️ **CRITICAL**: You must add your Gemini API key!

In the deployment form, find the `GEMINI_API_KEY` field and paste your key:

```
GEMINI_API_KEY: your_actual_api_key_here
```

**Don't have an API key?** Get one at: https://ai.google.dev/

### Step 5: Click "Apply"

Click the **"Apply"** or **"Create Services"** button at the bottom.

### Step 6: Wait for Deployment

Render will now:
1. Clone your repository
2. Install dependencies (pnpm + packages)
3. Build both services
4. Deploy them with HTTPS

**Estimated time**: 5-8 minutes

### Step 7: Get Your URLs

Once deployed, you'll see two URLs:

- **Frontend**: `https://gemini-robotics-frontend.onrender.com`
- **Backend**: `https://gemini-robotics-backend.onrender.com`

Click the frontend URL to open your app! 🎉

## 🔧 What the Blueprint Does

The `render.yaml` file in this repository tells Render how to deploy your app:

```yaml
services:
  # Backend Service
  - type: web
    name: gemini-robotics-backend
    rootDir: apps/server
    buildCommand: install pnpm + dependencies + build
    startCommand: node dist/index.js
    
  # Frontend Service  
  - type: web
    name: gemini-robotics-frontend
    rootDir: apps/web
    buildCommand: install pnpm + dependencies + build
    startCommand: pnpm start
```

### Automatic Configuration

The blueprint automatically:
- ✅ Sets up CORS between frontend and backend
- ✅ Configures environment variables
- ✅ Links services together
- ✅ Enables health checks
- ✅ Provisions SSL certificates (HTTPS)

### Environment Variables Set Automatically

**Backend receives:**
```env
NODE_ENV=production
PORT=5050
GEMINI_API_KEY=<your_key>
WEB_ORIGIN=<frontend_url>
```

**Frontend receives:**
```env
NODE_ENV=production
NEXT_PUBLIC_SERVER_URL=<backend_url>
```

## ⚠️ Important Notes

### Free Tier Limitations

**Free tier services spin down after 15 minutes of inactivity:**
- First request takes 30-50 seconds (cold start)
- Not ideal for production
- Perfect for demos and testing

**Solutions:**
1. Upgrade to **Starter** plan ($7/month per service)
2. Accept cold start delays for free demos
3. Use external monitoring to keep services warm (limited effectiveness)

### Required: Gemini API Key

The deployment will **fail** if you don't add your Gemini API key!

**Get your key:**
1. Visit https://ai.google.dev/
2. Click "Get API Key"
3. Create or select a project
4. Copy your API key
5. Paste it in the Render deployment form

### HTTPS is Required

- Camera access requires HTTPS
- Render provides HTTPS automatically
- Your app will work on `https://` URLs only

## 🎨 Customization Options

### Change Service Names

In the deployment form, you can rename:
- `gemini-robotics-backend` → `my-app-api`
- `gemini-robotics-frontend` → `my-app-web`

### Change Region

Available regions:
- Oregon (US West)
- Ohio (US East)
- Frankfurt (EU)
- Singapore (Asia)

**Tip**: Choose the region closest to your users for best performance.

### Upgrade to Paid Plan

For production use, upgrade to **Starter** ($7/mo per service):
- No cold starts
- Always online
- Better performance
- More resources

## 🔄 Auto-Deploy on Push

After initial deployment, Render automatically redeploys when you push to GitHub!

**Enable auto-deploy:**
1. Go to service settings
2. Enable "Auto-Deploy" 
3. Select branch: `main`

Now every push to `main` → automatic deployment 🚀

## 🌐 Add Custom Domain (Optional)

### For Frontend:

1. Go to frontend service in Render Dashboard
2. Click **"Settings"** → **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter: `gemini.yourdomain.com`
5. Add CNAME record at your DNS provider:

```
Type: CNAME
Name: gemini
Value: gemini-robotics-frontend.onrender.com
```

6. Wait for DNS propagation (5-60 min)
7. SSL certificate auto-provisioned ✅

### Update Backend CORS:

After adding custom domain, update backend environment variable:

1. Go to backend service → **"Environment"**
2. Edit `WEB_ORIGIN`
3. Set to: `https://gemini.yourdomain.com`
4. Click **"Save Changes"**

## 🐛 Troubleshooting

### Deployment Failed?

**Check the logs:**
1. Go to service in Render Dashboard
2. Click **"Logs"** tab
3. Look for error messages

**Common issues:**
- Missing `GEMINI_API_KEY` → Add it in Environment tab
- Build failed → Check build logs for dependency errors
- Start failed → Verify start command is correct

### CORS Errors?

Make sure environment variables are set correctly:

**Backend should have:**
```env
WEB_ORIGIN=https://gemini-robotics-frontend.onrender.com
```

**Frontend should have:**
```env
NEXT_PUBLIC_SERVER_URL=https://gemini-robotics-backend.onrender.com
```

### Camera Not Working?

**Checklist:**
- ✅ Are you using `https://` URL? (not `http://`)
- ✅ Did you allow camera permissions in browser?
- ✅ Is your browser supported? (Chrome/Edge recommended)

### Services Keep Restarting?

**Possible causes:**
1. Missing environment variables
2. Port configuration issue
3. Dependency installation failed

**Fix:**
1. Check logs for errors
2. Verify all environment variables are set
3. Try manual redeploy

### Slow Performance?

**On free tier:**
- Cold starts are normal (30-50s first request)
- Upgrade to Starter for better performance

**On paid tier:**
- Reduce "Thinking Budget" to 0-2
- Lower frame capture rate
- Choose closer region

## 📊 Cost Calculator

| Plan | Backend | Frontend | Total/Month |
|------|---------|----------|-------------|
| **Free** | $0 | $0 | **$0** |
| **Starter** | $7 | $7 | **$14** |
| **Professional** | $25 | $25 | **$50** |

**Plus**: Gemini API costs (pay-as-you-go, varies by usage)

**Estimate Gemini API costs**: ~$0.01-$0.10 per session (depends on usage)

## ✅ Post-Deployment Checklist

After deployment completes:

- [ ] Frontend URL loads successfully
- [ ] Backend health check returns OK: `/health`
- [ ] Camera permissions prompt appears
- [ ] Video feed displays
- [ ] ER detection works (points/boxes)
- [ ] Live conversation connects
- [ ] No CORS errors in console (F12)
- [ ] HTTPS enabled (padlock in address bar)

## 🎯 Quick Start Guide

Once deployed, here's how to use your app:

### 1. Open Frontend URL
Navigate to your frontend URL in Chrome/Edge

### 2. Allow Permissions
- Allow camera access
- Allow microphone access (for Live API)

### 3. Test Spatial Reasoning
- Select mode: Points / Boxes / Trajectory
- Adjust "Thinking Budget" (start with 0)
- Point camera at objects
- Watch AI detect them!

### 4. Test Live Conversation
- Click "Start Live Session"
- Say "Hello!"
- AI responds with voice
- View transcript in real-time

## 🔗 Useful Links

**Render:**
- [Render Dashboard](https://dashboard.render.com/)
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)

**Gemini API:**
- [Get API Key](https://ai.google.dev/)
- [ER 1.5 Documentation](https://ai.google.dev/gemini-api/docs/robotics-overview)
- [Live API Documentation](https://ai.google.dev/gemini-api/docs/live)

**This Project:**
- [GitHub Repository](https://github.com/JackkySpice/Gemini-computer-vision)
- [Full Deployment Guide](DEPLOYMENT.md)
- [Render-Specific Guide](RENDER_DEPLOYMENT.md)

## 🆘 Need Help?

1. **Check Logs**: Render Dashboard → Service → Logs
2. **Read Docs**: See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)
3. **GitHub Issues**: [Open an issue](https://github.com/JackkySpice/Gemini-computer-vision/issues)
4. **Render Support**: support@render.com

## 🎉 Success!

Congratulations! Your Gemini Robotics Live app is now deployed!

**Share your deployment:**
- Tweet your frontend URL
- Show it to friends
- Build cool AI robotics projects!

---

## Manual Deployment Alternative

If you prefer manual deployment instead of one-click, see:
- [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) - Step-by-step manual guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - All deployment options

---

**Made with ❤️ using Gemini API**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/JackkySpice/Gemini-computer-vision)
