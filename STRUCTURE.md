# Project Structure

```
gemini-robotics-live/
│
├── 📱 apps/
│   ├── 🖥️  server/                       # Express Backend (Node 20 + TypeScript)
│   │   ├── src/
│   │   │   ├── index.ts                  # Main Express server, CORS, routes
│   │   │   ├── types.ts                  # Shared TypeScript interfaces
│   │   │   ├── lib/
│   │   │   │   └── gemini.ts            # Gemini SDK client, ER + token methods
│   │   │   └── routes/
│   │   │       ├── er.ts                # POST /api/er/frame (ER processing)
│   │   │       └── liveToken.ts         # POST /api/live/token (ephemeral tokens)
│   │   ├── package.json                  # Backend dependencies
│   │   ├── tsconfig.json                 # TypeScript config
│   │   └── .env.example                  # Environment template
│   │
│   └── 🌐 web/                           # Next.js 14 Frontend (TypeScript + Tailwind)
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx             # Main UI with controls
│       │   │   ├── layout.tsx           # Root layout
│       │   │   └── globals.css          # Global Tailwind styles
│       │   ├── components/
│       │   │   ├── VideoCanvas.tsx      # Camera capture + ER processing
│       │   │   └── Overlay.tsx          # Canvas overlay rendering
│       │   └── lib/
│       │       ├── store.ts             # Zustand state management
│       │       ├── types.ts             # TypeScript types
│       │       ├── draw.ts              # Canvas drawing utilities
│       │       └── liveClient.ts        # Live API WebSocket client
│       ├── public/
│       │   └── .gitkeep                 # Assets directory
│       ├── package.json                  # Frontend dependencies
│       ├── next.config.js               # Next.js configuration
│       ├── tsconfig.json                # TypeScript config
│       ├── tailwind.config.js           # Tailwind CSS config
│       ├── postcss.config.js            # PostCSS config
│       └── .env.local.example           # Environment template
│
├── 🛠️  scripts/
│   ├── setup.sh                         # Auto setup script
│   └── health-check.sh                  # Health check utility
│
├── 📚 Documentation/
│   ├── README.md                        # Main documentation
│   ├── SETUP.md                         # Quick setup guide
│   ├── DEVELOPMENT.md                   # Developer guide
│   ├── EXAMPLES.md                      # Usage examples
│   ├── PROJECT_SUMMARY.md               # Complete overview
│   ├── QUICK_REFERENCE.md               # Cheat sheet
│   └── STRUCTURE.md                     # This file
│
├── 🐳 Docker/
│   ├── Dockerfile                       # Multi-stage production build
│   ├── docker-compose.yml               # Compose configuration
│   └── .dockerignore                    # Docker ignore rules
│
├── ⚙️  Configuration/
│   ├── package.json                     # Root workspace config
│   ├── pnpm-workspace.yaml              # PNPM workspace definition
│   ├── .eslintrc.json                   # ESLint rules
│   ├── .prettierrc                      # Prettier formatting
│   ├── .gitignore                       # Git ignore patterns
│   ├── .nvmrc                           # Node version (20)
│   ├── .node-version                    # Node version file
│   └── LICENSE                          # MIT License
│
└── 📊 Stats/
    ├── Total Files: 40+
    ├── TypeScript Files: 12
    ├── React Components: 3
    ├── API Endpoints: 2
    ├── Documentation: 7 files
    └── Lines of Code: ~2,500+
```

## Key Files Explained

### Backend Core

| File | Purpose |
|------|---------|
| `apps/server/src/index.ts` | Express server initialization, middleware, routing |
| `apps/server/src/lib/gemini.ts` | Gemini SDK wrapper for ER and token generation |
| `apps/server/src/routes/er.ts` | Frame processing endpoint with ER 1.5 |
| `apps/server/src/routes/liveToken.ts` | Ephemeral token generation for Live API |

### Frontend Core

| File | Purpose |
|------|---------|
| `apps/web/src/app/page.tsx` | Main UI with all controls and state |
| `apps/web/src/components/VideoCanvas.tsx` | Webcam capture and ER frame processing |
| `apps/web/src/components/Overlay.tsx` | Canvas overlay for points/boxes/trajectories |
| `apps/web/src/lib/liveClient.ts` | Live API WebSocket client with audio |
| `apps/web/src/lib/draw.ts` | Drawing utilities for visualization |
| `apps/web/src/lib/store.ts` | Zustand global state management |

### Configuration Files

| File | Purpose |
|------|---------|
| `pnpm-workspace.yaml` | Monorepo workspace definition |
| `package.json` | Root scripts (dev, build, start) |
| `Dockerfile` | Production Docker image |
| `docker-compose.yml` | Container orchestration |

### Documentation

| File | Audience |
|------|----------|
| `README.md` | Everyone - main docs |
| `SETUP.md` | New users - quick start |
| `DEVELOPMENT.md` | Developers - detailed guide |
| `EXAMPLES.md` | Users - practical examples |
| `QUICK_REFERENCE.md` | Everyone - cheat sheet |
| `PROJECT_SUMMARY.md` | Stakeholders - overview |
| `STRUCTURE.md` | Developers - this file |

## Technology Stack

### Frontend Stack
```
Next.js 14 (App Router)
├── React 18
├── TypeScript 5.4
├── Tailwind CSS 3.4
├── Zustand 4.5 (State)
└── @google/genai SDK
```

### Backend Stack
```
Node.js 20
├── Express 4.18
├── TypeScript 5.4
├── @google/genai SDK
├── Pino (Logging)
└── CORS + dotenv
```

### Development Tools
```
PNPM 8+ (Package Manager)
├── ESLint (Linting)
├── Prettier (Formatting)
├── tsx (TS Execution)
├── Nodemon (Hot Reload)
└── Concurrently (Multi-process)
```

## Data Flow

### ER Frame Processing
```
Camera
  → VideoCanvas captures frame
    → Downscale to 960px
      → JPEG encode (70% quality)
        → POST /api/er/frame
          → Gemini ER 1.5 API
            → JSON response (points/boxes/trajectory)
              → Overlay renders on canvas
```

### Live API Session
```
User clicks "Start Live"
  → POST /api/live/token
    → Ephemeral token created
      → Browser connects to Live API
        → Microphone audio stream
          → Gemini processes
            → Audio + text responses
              → Playback in browser
```

## Environment Setup

### Development
```bash
# Backend: apps/server/.env
GEMINI_API_KEY=your_key_here
PORT=5050

# Frontend: apps/web/.env.local
NEXT_PUBLIC_SERVER_URL=http://localhost:5050
```

### Production
```bash
# Backend
GEMINI_API_KEY=your_key
PORT=5050
WEB_ORIGIN=https://your-frontend.com

# Frontend
NEXT_PUBLIC_SERVER_URL=https://your-backend.com
```

## Build & Deploy

### Local Development
```bash
pnpm install    # Install all dependencies
pnpm dev        # Run both servers
```

### Production Build
```bash
pnpm build      # Build both apps
pnpm start      # Start production servers
```

### Docker Deployment
```bash
docker-compose up --build
```

## API Surface

### REST Endpoints
- `POST /api/er/frame` - Process video frame with ER
- `POST /api/live/token` - Generate ephemeral token
- `GET /health` - Health check

### WebSocket (via Live API)
- Audio streaming (bidirectional)
- Text messages
- Transcription
- Real-time responses

## Security Model

```
Browser                          Server                    Gemini API
───────                          ──────                    ──────────
                                 [API Key]
                                    │
                                    ├→ Create Token ────→ Ephemeral Token
[Token] ←──────────────────────────┘
   │
   ├→ Live Session ──────────────────────────────────────→ [Live API]
   │
   └→ POST /api/er/frame ───────→ [Forward to ER] ───────→ [ER 1.5 API]
```

✅ API key never exposed to browser  
✅ Ephemeral tokens: single-use, short-lived  
✅ CORS protection on backend  
✅ No frame storage