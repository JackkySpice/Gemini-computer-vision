# Quick Reference Card

## 🚀 Getting Started (3 Steps)

```bash
# 1. Install
pnpm install

# 2. Configure (add your API key)
cp apps/server/.env.example apps/server/.env
nano apps/server/.env

# 3. Run
pnpm dev
```

Open http://localhost:3000

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both servers |
| `pnpm dev:server` | Backend only |
| `pnpm dev:web` | Frontend only |
| `pnpm build` | Build for production |
| `pnpm start` | Run production build |
| `./scripts/setup.sh` | Auto setup |
| `./scripts/health-check.sh` | Health check |

---

## 🎛️ Detection Modes

| Mode | Output | Use Case | Latency |
|------|--------|----------|---------|
| **Points** | Center coordinates | Quick tracking | <500ms |
| **Boxes** | Bounding boxes | Object detection | ~800ms |
| **Trajectory** | Path planning | Robotics | ~1-2s |

---

## ⚙️ Thinking Budget

| Value | Speed | Accuracy | When to Use |
|-------|-------|----------|-------------|
| 0-1 | ⚡ Fast | ⭐ Basic | Real-time tracking |
| 2-4 | ⚡ Medium | ⭐⭐ Good | Balanced |
| 5-8 | 🐌 Slow | ⭐⭐⭐ High | Complex scenes |

---

## 🔌 API Endpoints

### Process Frame
```bash
POST http://localhost:5050/api/er/frame
Content-Type: application/json

{
  "imageBase64": "...",
  "mode": "points",
  "queries": ["banana", "cup"],
  "thinkingBudget": 2
}
```

### Get Token
```bash
POST http://localhost:5050/api/live/token
Content-Type: application/json

{}
```

---

## 📊 Coordinate System

ER returns normalized coordinates (0-1000):

```typescript
// Points
[y, x]  // Example: [450, 320]

// Boxes
[ymin, xmin, ymax, xmax]  // Example: [400, 280, 500, 360]

// Convert to pixels
const px = (x / 1000) * canvasWidth;
const py = (y / 1000) * canvasHeight;
```

---

## 🔒 Environment Variables

### Backend (`apps/server/.env`)
```env
GEMINI_API_KEY=your_key_here
PORT=5050
WEB_ORIGIN=http://localhost:3000
```

### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:5050
```

---

## 🎯 Quick Use Cases

### Detect Kitchen Items
- Mode: `Boxes`
- Queries: `banana, bowl, cup`
- Budget: `2`

### Track Person
- Mode: `Points`
- Queries: `person, face, hand`
- Budget: `1`

### Plan Robot Path
- Mode: `Trajectory`
- Queries: `reach the target`
- Budget: `4`

### Live Conversation
1. Click "Start Live Session"
2. Say: "What do you see?"
3. Get audio response

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Camera not working | Check permissions, use Chrome/Edge |
| No API key error | Set `GEMINI_API_KEY` in `apps/server/.env` |
| Connection failed | Check both servers are running |
| No objects detected | Improve lighting, try different objects |
| High latency | Lower thinking budget, reduce queries |
| CORS error | Check `WEB_ORIGIN` matches frontend URL |

---

## 📈 Performance Tips

✅ **Do:**
- Use thinking budget 0-2 for real-time
- Specify queries to filter objects
- Downscale images (960px is optimal)
- Monitor FPS and latency stats

❌ **Don't:**
- Use high budget for real-time
- Request all objects when unnecessary
- Send full-res images (>1280px)
- Ignore frame drop warnings

---

## 🔗 Quick Links

- [Full Setup Guide](./SETUP.md)
- [Developer Docs](./DEVELOPMENT.md)
- [Usage Examples](./EXAMPLES.md)
- [API Docs](https://ai.google.dev/gemini-api/docs/robotics-overview)

---

## 📦 Tech Stack

**Frontend:** Next.js 14, React, TypeScript, Tailwind, Zustand  
**Backend:** Node 20, Express, TypeScript  
**AI:** Gemini ER 1.5, Gemini Live API  
**Tools:** PNPM, Docker, ESLint, Prettier

---

## 🆘 Support

1. Check documentation
2. Run health check: `./scripts/health-check.sh`
3. Review logs in terminal
4. Open GitHub issue

---

**Made with ❤️ using Gemini API**