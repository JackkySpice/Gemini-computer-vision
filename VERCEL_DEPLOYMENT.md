# Vercel Deployment Guide - Fixed Configuration

## Problem
The error `No Output Directory named "public" found after the Build completed` occurs because Vercel was trying to deploy from the root of the monorepo, but your Next.js app is in `apps/web`.

## Solution

### Step 1: Configure Root Directory in Vercel Dashboard

**CRITICAL:** You must set the **Root Directory** in Vercel to point to your Next.js app.

1. Go to your Vercel project settings
2. Navigate to **Settings** → **General**
3. Find the **Root Directory** section
4. Click **Edit**
5. Set Root Directory to: `apps/web`
6. Click **Save**

### Step 2: Configure Build Settings

In the same settings page:

1. **Framework Preset:** Next.js (should auto-detect)
2. **Build Command:** `pnpm build` (or leave as auto-detected)
3. **Output Directory:** Leave empty (Next.js default is `.next`)
4. **Install Command:** `pnpm install --frozen-lockfile`

### Step 3: Set Environment Variables

Go to **Settings** → **Environment Variables** and add:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SERVER_URL` | `https://your-backend-url.railway.app` | Production, Preview, Development |

**Important:** 
- Replace `your-backend-url.railway.app` with your actual backend URL
- You need to deploy the backend first (see Backend Deployment below)

### Step 4: Redeploy

After configuring the Root Directory and environment variables:

1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**

## Backend Deployment (Railway Recommended)

Since Vercel is for the frontend only, you need to deploy the backend separately.

### Deploy Backend on Railway

1. **Create Railway Account**
   - Visit https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service**
   - Click on the new service
   - Go to **Settings**
   - Set **Root Directory** to: `apps/server`

4. **Configure Build**
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `node dist/index.js`
   - **Watch Paths:** `apps/server/**`

5. **Add Environment Variables**
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key
   PORT=5050
   WEB_ORIGIN=https://your-frontend.vercel.app
   NODE_ENV=production
   ```

6. **Generate Domain**
   - Go to **Settings** → **Networking**
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://your-app.up.railway.app`)

7. **Update Vercel Environment Variable**
   - Go back to Vercel
   - Update `NEXT_PUBLIC_SERVER_URL` with the Railway URL
   - Redeploy on Vercel

## Alternative: Deploy Both on Vercel (Advanced)

If you want to deploy both frontend and backend on Vercel:

### Option A: Two Separate Vercel Projects

1. **Frontend Project:**
   - Root Directory: `apps/web`
   - Framework: Next.js
   - Env: `NEXT_PUBLIC_SERVER_URL=https://your-backend.vercel.app`

2. **Backend Project:**
   - Root Directory: `apps/server`
   - Framework: Other
   - Build Command: `pnpm install && pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install --frozen-lockfile`
   - Env Variables: `GEMINI_API_KEY`, `WEB_ORIGIN`

### Option B: Vercel Monorepo (Advanced)

Use Turborepo or configure multiple `vercel.json` files. This is more complex and not recommended for beginners.

## Troubleshooting

### Error: "No Output Directory named 'public' found"
**Solution:** Set Root Directory to `apps/web` in Vercel dashboard.

### Error: Camera not working in production
**Cause:** HTTPS required for camera access  
**Solution:** Vercel automatically provides HTTPS, so this should work. Check browser permissions.

### Error: CORS errors when calling backend
**Cause:** Backend `WEB_ORIGIN` doesn't match frontend URL  
**Solution:** Update `WEB_ORIGIN` environment variable on Railway to match your Vercel URL.

### Error: 500 errors from backend
**Cause:** Missing `GEMINI_API_KEY`  
**Solution:** Verify environment variable is set correctly on Railway.

### Build fails with "Cannot find module"
**Cause:** Dependencies not installed correctly in monorepo  
**Solution:** Ensure `pnpm-lock.yaml` is committed and install command uses `pnpm install --frozen-lockfile`.

## Verification Checklist

After deployment, verify:

- [ ] Frontend loads at Vercel URL
- [ ] Camera permission request appears (HTTPS working)
- [ ] Backend health check works: `https://your-backend/health`
- [ ] ER detection works (check browser console for errors)
- [ ] Live API can start (requires microphone permission)
- [ ] No CORS errors in browser console

## Cost Estimates

**Vercel (Frontend):**
- Free tier: Sufficient for development and small projects
- Pro: $20/month if you need more

**Railway (Backend):**
- Free tier: $5 credit/month (may not be sufficient)
- Developer: ~$5-20/month depending on usage
- **Note:** Backend is constantly running, so expect costs

**Gemini API:**
- ER 1.5: $0.00007 per image (~$0.42 per 100 images)
- Live API: Variable based on usage
- Monitor usage in Google AI Studio

## Production Optimizations

### Frontend (Next.js)

Update `apps/web/next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable SWC minification (faster)
  swcMinify: true,
  // Compress responses
  compress: true,
  // Production optimizations
  productionBrowserSourceMaps: false,
  // Reduce bundle size
  modularizeImports: {
    '@/components': {
      transform: '@/components/{{member}}',
    },
  },
};

module.exports = nextConfig;
```

### Backend (Express)

Consider adding:
- Rate limiting (e.g., express-rate-limit)
- Request timeout handling
- Compression middleware
- Better error logging (e.g., Sentry)

## Security Recommendations

1. **Never commit `.env` files**
2. **Use specific CORS origins** (not `*`)
3. **Enable rate limiting** on backend
4. **Monitor API usage** to prevent abuse
5. **Set up alerts** for unusual activity
6. **Keep dependencies updated**

## Next Steps

After successful deployment:

1. **Set up monitoring:** Use Vercel Analytics and Railway metrics
2. **Configure custom domain:** Add your domain in Vercel/Railway settings
3. **Set up CI/CD:** Automatic deployments on git push (Vercel does this automatically)
4. **Add error tracking:** Integrate Sentry or similar
5. **Performance monitoring:** Set up Core Web Vitals tracking

## Support

If you continue to have issues:

1. Check Vercel build logs for specific errors
2. Check Railway logs: `railway logs`
3. Test locally first: `pnpm dev` in root directory
4. Verify environment variables are set correctly
5. Check browser console for client-side errors

## Files Created

This fix includes:
- ✅ `apps/web/vercel.json` - Vercel configuration for Next.js app
- ✅ `apps/web/.env.example` - Frontend environment variables template
- ✅ `apps/server/.env.example` - Backend environment variables template
- ✅ This deployment guide

## Quick Command Reference

```bash
# Test locally before deploying
pnpm install
pnpm dev

# Build locally to test
pnpm build

# Check for linting errors
cd apps/web && pnpm lint

# Test backend
cd apps/server && pnpm test
```

---

**Remember:** The key fix is setting **Root Directory to `apps/web`** in Vercel dashboard!