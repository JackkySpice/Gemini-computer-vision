# Deployment Architecture Diagram

## Full System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         User's Browser                            │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Camera     │  │  Microphone  │  │  React App (Next.js) │   │
│  │  Feed       │  │  Input       │  │  - Video Canvas      │   │
│  │             │  │              │  │  - Live Client       │   │
│  └─────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                   │
│  📹 Captures Frames        🎙️ Records Audio                      │
└──────────────┬────────────────────┬──────────────────────────────┘
               │                    │
               │ HTTPS Required     │
               │ (Camera API)       │
               ▼                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Vercel (CDN + Edge)                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Frontend: Next.js App (Static + SSR)                      │  │
│  │  Directory: apps/web/                                      │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  Environment Variables:                              │  │  │
│  │  │  • NEXT_PUBLIC_SERVER_URL → Railway Backend URL      │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  Features:                                                 │  │
│  │  ✓ Auto HTTPS (required for camera/mic)                   │  │
│  │  ✓ Global CDN distribution                                │  │
│  │  ✓ Automatic scaling                                      │  │
│  │  ✓ Preview deployments                                    │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       │ API Calls
                       │ POST /api/er/frame (Image data)
                       │ POST /api/live/token (Get ephemeral token)
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Railway (Backend Server)                       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Backend: Express Server (Node.js)                        │  │
│  │  Directory: apps/server/                                   │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  Environment Variables:                              │  │  │
│  │  │  • GEMINI_API_KEY → Your API Key (secret)           │  │  │
│  │  │  • WEB_ORIGIN → Vercel Frontend URL (CORS)          │  │  │
│  │  │  • PORT → 5050                                       │  │  │
│  │  │  • NODE_ENV → production                            │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  Endpoints:                                                │  │
│  │  ✓ GET  /health          (Health check)                   │  │
│  │  ✓ POST /api/er/frame    (Process ER frame)               │  │
│  │  ✓ POST /api/live/token  (Generate ephemeral token)       │  │
│  │                                                            │  │
│  │  Features:                                                 │  │
│  │  ✓ Always-on server                                       │  │
│  │  ✓ Auto HTTPS                                             │  │
│  │  ✓ CORS protection                                        │  │
│  │  ✓ No frame storage                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       │ API Calls (Authenticated)
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Google Gemini API                              │
│                                                                   │
│  ┌────────────────────────────────┐  ┌───────────────────────┐  │
│  │  Gemini Robotics ER 1.5        │  │  Gemini Live API      │  │
│  │  - Point detection             │  │  - Voice interaction  │  │
│  │  - Bounding boxes              │  │  - Audio streaming    │  │
│  │  - Trajectory planning         │  │  - Real-time response │  │
│  │  Model: gemini-robotics-er-1.5 │  │  Model: gemini-2.5    │  │
│  └────────────────────────────────┘  └───────────────────────┘  │
│                                                                   │
│  Authentication:                                                  │
│  • Long-lived API key (server-side only)                         │
│  • Ephemeral tokens for Live API (client-side, short-lived)      │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

### ER Detection Flow (Real-time Video Processing)

```
1. Browser captures camera frame
   ↓
2. VideoCanvas component converts to base64
   ↓
3. POST /api/er/frame
   {
     imageBase64: "data:image/jpeg;base64,...",
     queries: ["banana", "bowl"],
     thinkingBudget: 4,
     mode: "boxes"
   }
   ↓
4. Railway server forwards to Gemini ER API
   ↓
5. Gemini processes image (200-800ms)
   ↓
6. Returns coordinates [ymin, xmin, ymax, xmax]
   ↓
7. Frontend draws overlays on canvas
   ↓
8. Repeat at ~2-10 FPS
```

### Live API Flow (Voice Interaction)

```
1. User clicks "Start Live Session"
   ↓
2. Frontend requests microphone permission
   ↓
3. POST /api/live/token
   ↓
4. Railway server generates ephemeral token
   (valid for 10 minutes, single-use)
   ↓
5. Frontend receives token
   ↓
6. LiveClient connects to Gemini Live API
   ↓
7. Bidirectional audio stream established
   ↓
8. User speaks → Gemini responds
   ↓
9. Auto-refresh token every 8 minutes
```

## Security Flow

```
┌─────────────┐
│  API Key    │  ← Long-lived, stored in Railway env vars
│  (Secret)   │    NEVER exposed to browser
└──────┬──────┘
       │
       │ Used by backend to:
       │
       ├─► Process ER frames
       └─► Generate ephemeral tokens
              │
              ▼
       ┌──────────────────┐
       │ Ephemeral Token  │  ← Short-lived (10 min)
       │ (Client-safe)    │    Single-use per session
       └──────────────────┘    Sent to browser for Live API
```

## Monorepo Structure on GitHub

```
github.com/yourusername/computerv2/
│
├── apps/
│   ├── web/              ← Deployed to Vercel
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── vercel.json   ← Vercel config
│   │   └── .env.example
│   │
│   └── server/           ← Deployed to Railway
│       ├── src/
│       ├── dist/         ← Build output
│       ├── package.json
│       └── .env.example
│
├── pnpm-workspace.yaml   ← Monorepo config
└── package.json
```

## Deployment Configuration

### Vercel Configuration

```
Project Settings:
┌────────────────────────────────────┐
│ Root Directory: apps/web     ←────┼── CRITICAL!
│ Framework: Next.js                 │
│ Build Command: pnpm build          │
│ Output Directory: .next            │
│ Install Command: pnpm install      │
└────────────────────────────────────┘

Environment Variables:
┌────────────────────────────────────┐
│ NEXT_PUBLIC_SERVER_URL             │
│ = https://your-app.railway.app     │
└────────────────────────────────────┘
```

### Railway Configuration

```
Project Settings:
┌────────────────────────────────────┐
│ Root Directory: apps/server  ←────┼── CRITICAL!
│ Build Command:                     │
│   pnpm install && pnpm build       │
│ Start Command:                     │
│   node dist/index.js               │
└────────────────────────────────────┘

Environment Variables:
┌────────────────────────────────────┐
│ GEMINI_API_KEY = AIza...           │
│ WEB_ORIGIN = https://app.vercel... │
│ PORT = 5050                        │
│ NODE_ENV = production              │
└────────────────────────────────────┘
```

## Request Flow Timeline

```
User Action: Capture Camera Frame
│
├─ 0ms: Capture frame from video element
├─ 10ms: Convert to JPEG, scale down to 640x480
├─ 20ms: Base64 encode (~50-100KB)
├─ 25ms: POST to Railway backend
│
Railway Backend:
├─ 50ms: Receive request, validate
├─ 60ms: Forward to Gemini ER API
│
Gemini API:
├─ 100ms: Receive image
├─ 200-800ms: Process with ER 1.5 (depends on thinking budget)
│
Railway Backend:
├─ 850ms: Receive Gemini response
├─ 860ms: Return to frontend
│
Frontend:
├─ 880ms: Parse response
├─ 890ms: Draw overlays on canvas
└─ 900ms: Total latency

Next frame: Wait for next capture (100-500ms based on FPS)
```

## Cost Flow

```
Per Frame Processing:
┌─────────────────────────────────────┐
│ 1 Frame (640x480 JPEG)              │
│ ↓                                   │
│ Vercel: FREE (static hosting)       │
│ ↓                                   │
│ Railway: $0.000231/sec ≈ $0.0002    │
│ ↓                                   │
│ Gemini ER 1.5: $0.00007/image       │
│ ↓                                   │
│ Total per frame: ~$0.0007           │
└─────────────────────────────────────┘

At 5 FPS for 1 hour:
• Frames: 5 × 60 × 60 = 18,000
• Gemini cost: $1.26
• Railway cost: $0.83 (always on)
• Total: ~$2.09/hour

Monthly (assuming 10 hours usage):
• Gemini: ~$12.60
• Railway: ~$20 (744 hours/month)
• Vercel: FREE
• Total: ~$32.60/month
```

## Scaling Architecture

```
Current (Single User):
[Browser] → [Vercel] → [Railway] → [Gemini API]

Scaled (Multiple Users):
[Browser 1] ─┐
[Browser 2] ─┼→ [Vercel CDN] ─┐
[Browser 3] ─┘                 │
                               ├→ [Railway (scaled)] ─→ [Gemini API]
[Browser N] ─┐                 │
[Browser N+1]─┼→ [Vercel CDN] ─┘
[Browser N+2]─┘

Auto-scaling:
• Vercel: Automatic (serverless edge functions)
• Railway: Vertical scaling (more CPU/RAM)
• Gemini API: Google handles scaling
```

## Network Diagram

```
Internet
    │
    ├─────────────────────────────────┐
    │                                 │
    ▼                                 ▼
┌──────────┐                    ┌──────────┐
│  Vercel  │◄──────────────────►│ Railway  │
│  Edge    │   Backend API      │ US-West  │
│  Global  │   Calls            │          │
└──────────┘                    └──────────┘
    │                                 │
    │                                 │
    │                                 ▼
    │                          ┌────────────┐
    │                          │  Google    │
    │                          │  Gemini    │
    │                          │  API       │
    └──────────────────────────►            │
      Live API WebSocket       └────────────┘
      (with ephemeral token)
```

## File System After Deployment

```
Vercel:
/apps/web/.next/
├── server/
│   ├── app/
│   │   ├── page.js           ← Server component
│   │   └── layout.js
│   └── chunks/
├── static/
│   ├── chunks/
│   └── css/
└── BUILD_ID

Railway:
/apps/server/dist/
├── index.js                  ← Compiled entry point
├── routes/
│   ├── er.js
│   └── liveToken.js
└── lib/
    └── gemini.js
```

---

**This diagram shows the complete deployment architecture from user's browser to Gemini API.**