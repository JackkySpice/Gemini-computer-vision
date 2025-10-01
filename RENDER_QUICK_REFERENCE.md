# Render Deployment Quick Reference Card

## 🚀 One-Click Deploy

```
https://render.com/deploy?repo=https://github.com/JackkySpice/Gemini-computer-vision
```

Or click: [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/JackkySpice/Gemini-computer-vision)

## 📋 Checklist

- [ ] Render account created
- [ ] Gemini API key ready
- [ ] Click deploy button
- [ ] Add GEMINI_API_KEY
- [ ] Wait 5-8 minutes
- [ ] Get URLs and test

## 🔑 Required Environment Variable

**You MUST add this during deployment:**

```
GEMINI_API_KEY=your_actual_api_key_here
```

Get your key: https://ai.google.dev/

## 📦 What Gets Deployed

| Service | Location | URL Pattern |
|---------|----------|-------------|
| Backend | `apps/server` | `gemini-robotics-backend.onrender.com` |
| Frontend | `apps/web` | `gemini-robotics-frontend.onrender.com` |

## 🔧 Automatic Configuration

### Backend receives:
```env
NODE_ENV=production
PORT=5050
GEMINI_API_KEY=<your_key>
WEB_ORIGIN=<frontend_url>  # Auto-linked
```

### Frontend receives:
```env
NODE_ENV=production
NEXT_PUBLIC_SERVER_URL=<backend_url>  # Auto-linked
```

## ⚡ Service Details

### Backend (Express API)
- **Build**: `npm install -g pnpm && pnpm install && pnpm build`
- **Start**: `node dist/index.js`
- **Health Check**: `/health`
- **Region**: Oregon (configurable)
- **Plan**: Free (upgradeable)

### Frontend (Next.js)
- **Build**: `npm install -g pnpm && pnpm install && pnpm build`
- **Start**: `pnpm start`
- **Region**: Oregon (configurable)
- **Plan**: Free (upgradeable)

## ⚠️ Free Tier Notes

**Cold Starts**: Services spin down after 15 min inactivity
- First request: 30-50 seconds delay
- Subsequent requests: Normal speed
- **Solution**: Upgrade to Starter ($7/mo per service)

## ✅ Post-Deployment Testing

### 1. Test Backend Health
```bash
curl https://your-backend.onrender.com/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Test Frontend
- Open: `https://your-frontend.onrender.com`
- Allow camera permissions
- Allow microphone permissions
- Test ER detection (points/boxes/trajectory)
- Test Live conversation

### 3. Check Browser Console (F12)
- No CORS errors ✅
- No 404 errors ✅
- API requests succeed ✅

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Build failed | Check logs, verify pnpm installs correctly |
| Missing API key | Add `GEMINI_API_KEY` in Environment tab |
| CORS errors | Verify `WEB_ORIGIN` matches frontend URL |
| Camera not working | Ensure using `https://` URL |
| Service restarting | Check logs for errors, verify env vars |
| Slow performance | Reduce Thinking Budget to 0-2 |

## 💰 Pricing

| Plan | Cost/Service | Features |
|------|--------------|----------|
| Free | $0 | Spins down after 15 min |
| Starter | $7/mo | Always on, no cold starts |
| Pro | $25/mo | More resources |

**Total for both services:**
- Free: $0/month
- Starter: $14/month
- Pro: $50/month

## 🔄 Auto-Deploy Setup

1. Go to service → Settings
2. Enable "Auto-Deploy"
3. Select branch: `main`
4. Push to GitHub → Automatic deployment!

## 🌐 Custom Domain

### Add to Frontend:
1. Service → Settings → Custom Domains
2. Add: `gemini.yourdomain.com`
3. Create DNS CNAME:
   ```
   Type: CNAME
   Name: gemini
   Value: gemini-robotics-frontend.onrender.com
   ```
4. Wait 5-60 min for DNS propagation

### Update Backend CORS:
1. Backend → Environment
2. Edit `WEB_ORIGIN`
3. Set: `https://gemini.yourdomain.com`
4. Save changes

## 📊 Monitoring

### View Logs
- Dashboard → Service → Logs tab
- Watch real-time deployment
- Debug errors

### Health Checks
- Backend: `https://backend.onrender.com/health`
- Frontend: `https://frontend.onrender.com`

### Metrics
- Dashboard → Service → Metrics
- CPU, Memory, Network usage
- Request counts

## 🔗 Important Links

**Deployment:**
- [One-Click Deploy Guide](ONE_CLICK_DEPLOY.md)
- [Render Manual Guide](RENDER_DEPLOYMENT.md)
- [Main Deployment Docs](DEPLOYMENT.md)

**Render:**
- [Dashboard](https://dashboard.render.com/)
- [Documentation](https://render.com/docs)
- [Community Forum](https://community.render.com/)

**Gemini:**
- [Get API Key](https://ai.google.dev/)
- [ER 1.5 Docs](https://ai.google.dev/gemini-api/docs/robotics-overview)
- [Live API Docs](https://ai.google.dev/gemini-api/docs/live)

**GitHub:**
- [Repository](https://github.com/JackkySpice/Gemini-computer-vision)

## 📱 Share Your Deployment

After successful deployment:
```
🎉 My Gemini Robotics Live app is deployed!
Frontend: https://your-frontend.onrender.com
Backend: https://your-backend.onrender.com

Built with @GoogleAI Gemini ER 1.5 + Live API
Deployed on @render
#GeminiAPI #AI #ComputerVision
```

## 🆘 Get Help

1. **Check Logs**: First troubleshooting step
2. **Read Docs**: [ONE_CLICK_DEPLOY.md](ONE_CLICK_DEPLOY.md)
3. **GitHub Issues**: Report bugs/ask questions
4. **Render Support**: support@render.com

---

**🎯 TL;DR:**
1. Click deploy button
2. Add GEMINI_API_KEY
3. Wait 5-8 minutes
4. Open frontend URL
5. Start using! 🚀

---

Print this page for quick reference during deployment!
