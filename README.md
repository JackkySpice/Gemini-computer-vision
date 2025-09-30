# Gemini Robotics Live

A production-ready web application combining **Gemini Robotics-ER 1.5** for spatial reasoning and **Gemini Live API** for real-time conversational AI. Stream your webcam to detect objects, track trajectories, and interact with AI using voice and text.

![Demo](https://img.shields.io/badge/Status-Preview-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

- 🎥 **Real-time Webcam Processing**: Stream video and get instant spatial analysis
- 🤖 **Gemini Robotics-ER 1.5**: Point detection, bounding boxes, and trajectory planning
- 🎙️ **Gemini Live API**: Voice-based interaction with low-latency audio streaming
- 🔒 **Secure Architecture**: Ephemeral tokens, no API keys exposed to browser
- ⚡ **Optimized Performance**: Frame downscaling, throttling, and smart caching
- 🎨 **Modern UI**: Built with Next.js 14 and Tailwind CSS

## Architecture

### Monorepo Structure

```
├── apps/
│   ├── web/          # Next.js 14 frontend (TypeScript, App Router)
│   └── server/       # Express backend (Node 20)
├── pnpm-workspace.yaml
└── package.json
```

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- @google/genai (SDK)

**Backend:**
- Node 20
- Express
- @google/genai (SDK)
- TypeScript
- Pino (logging)

## Getting Started

### Prerequisites

- Node.js 20+
- PNPM 8+
- Gemini API key ([Get one here](https://ai.google.dev/))
- Webcam and microphone

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd gemini-robotics-live
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment variables**

Create `.env` file in `apps/server/`:

```bash
cd apps/server
cp .env.example .env
# Edit .env and add your Gemini API key
```

```env
GEMINI_API_KEY=your_api_key_here
PORT=5050
```

Create `.env.local` in `apps/web/`:

```bash
cd apps/web
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:5050
```

### Running the App

**Option 1: Run both services together (recommended)**

```bash
# From root directory
pnpm dev
```

**Option 2: Run services separately**

```bash
# Terminal 1 - Backend
pnpm dev:server

# Terminal 2 - Frontend
pnpm dev:web
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Spatial Reasoning (ER 1.5)

**Detection Modes:**
- **Points**: Detect object centers with labels
- **Boxes**: Detect objects with bounding boxes
- **Trajectory**: Plan movement paths

**Controls:**
- **Thinking Budget (0-8)**: Trade speed for accuracy
  - 0-2: Fast, real-time (500-800ms)
  - 3-5: Balanced
  - 6-8: Highest accuracy (1-2s+)
- **Object Queries**: Filter specific objects (e.g., "banana, bowl, cup")

### 2. Live Conversation

Click **"Start Live Session"** to:
- Enable voice conversation with Gemini
- Send text messages
- Receive audio responses
- View real-time transcripts

### 3. Performance Tips

- Start with **Thinking Budget = 0** for low latency
- Use **object queries** to reduce processing time
- Default frame rate is ~2 fps (configurable in `VideoCanvas.tsx`)
- Frames are downscaled to 960px for efficiency

## API Endpoints

### Backend (`http://localhost:5050`)

#### POST `/api/er/frame`
Process a video frame with ER 1.5

**Request:**
```json
{
  "imageBase64": "base64_jpeg_string",
  "mode": "points|boxes|trajectory",
  "queries": ["banana", "bowl"],
  "thinkingBudget": 0
}
```

**Response:**
```json
{
  "results": [
    {
      "point": [450, 320],
      "label": "banana",
      "box": [400, 280, 500, 360]
    }
  ],
  "latencyMs": 650
}
```

#### POST `/api/live/token`
Get ephemeral token for Live API

**Request:**
```json
{
  "model": "gemini-2.5-flash-native-audio-preview-09-2025"
}
```

**Response:**
```json
{
  "token": "ephemeral_token_string",
  "expireTime": "2025-09-30T12:30:00Z",
  "newSessionExpireTime": "2025-09-30T12:01:00Z"
}
```

## Coordinate System

ER 1.5 returns normalized coordinates (0-1000):
- **Points**: `[y, x]` - center position
- **Boxes**: `[ymin, xmin, ymax, xmax]` - bounding box

Convert to pixels:
```typescript
const px = (x / 1000) * canvasWidth;
const py = (y / 1000) * canvasHeight;
```

## Security

✅ **Secure by Design:**
- Long-lived API key never exposed to browser
- Ephemeral tokens for Live API (single-use, short-lived)
- CORS protection on backend
- No frame storage on server

## Privacy & Compliance

⚠️ **Important:**
- Camera is active when app is running
- Frames are sent to Google Gemini API for processing
- No frames are stored locally or on server
- **Always obtain consent** if others may appear on camera
- Consider face-blurring for public deployments

## Troubleshooting

### Camera not working
- Check browser permissions
- Ensure HTTPS in production (getUserMedia requires secure context)
- Try different browsers (Chrome/Edge recommended)

### ER API errors
- Verify `GEMINI_API_KEY` is set correctly
- Check API quota/limits
- Ensure model ID is correct: `gemini-robotics-er-1.5-preview`

### Live API connection fails
- Check network connectivity
- Verify ephemeral token generation
- Try refreshing the token (auto-refreshes every ~9 min)

### High latency
- Reduce thinking budget to 0-2
- Use specific object queries
- Check network speed
- Consider reducing frame rate

## Development

### Project Structure

```
apps/web/src/
├── app/
│   ├── page.tsx          # Main UI
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── VideoCanvas.tsx   # Camera capture & ER processing
│   └── Overlay.tsx       # Visual overlay renderer
└── lib/
    ├── store.ts          # Zustand state
    ├── types.ts          # TypeScript types
    ├── draw.ts           # Canvas drawing utils
    └── liveClient.ts     # Live API client

apps/server/src/
├── index.ts              # Express app
├── routes/
│   ├── er.ts             # ER frame processing
│   └── liveToken.ts      # Token generation
├── lib/
│   └── gemini.ts         # Gemini SDK client
└── types.ts              # Shared types
```

### Build for Production

```bash
# Build all apps
pnpm build

# Start production servers
pnpm start
```

## Deployment

### 🚀 Quick Deploy (5 minutes)

**Got a Vercel error?** → See [DEPLOYMENT_FIX_SUMMARY.md](DEPLOYMENT_FIX_SUMMARY.md)

**Quick Steps:**
1. **Backend (Railway):** Set Root Directory: `apps/server`
2. **Frontend (Vercel):** Set Root Directory: `apps/web` ← **CRITICAL!**
3. Configure environment variables
4. Deploy!

### 📚 Complete Documentation

**→ Start Here:** [DEPLOYMENT_INDEX.md](DEPLOYMENT_INDEX.md) - Complete documentation index

**Quick Links:**
- 📖 **[Quick Start Guide](DEPLOYMENT_QUICK_START.md)** - 5-minute deployment
- 📖 **[Vercel Deployment](VERCEL_DEPLOYMENT.md)** - Comprehensive guide
- 📖 **[Architecture Diagram](DEPLOYMENT_DIAGRAM.md)** - System architecture
- 📖 **[Issue Resolution](DEPLOYMENT_ISSUES_FIXED.md)** - Troubleshooting
- 📖 **[Fix Summary](DEPLOYMENT_FIX_SUMMARY.md)** - Error solutions

**Helper Scripts:**
```bash
./deploy-vercel.sh   # Deploy frontend to Vercel (automated)
./deploy-railway.sh  # Deploy backend to Railway (automated)
```

## Roadmap

- [x] Deployment guides (Vercel, Railway, etc.) ✅
- [ ] LiveKit integration for WebRTC
- [ ] Multi-frame video tracking
- [ ] ROS/robotics controller integration
- [ ] Object persistence across frames
- [ ] Demo image upload (no camera)

## Resources

**API Documentation:**
- [Gemini ER 1.5 Docs](https://ai.google.dev/gemini-api/docs/robotics-overview)
- [Live API Guide](https://ai.google.dev/gemini-api/docs/live)
- [Ephemeral Tokens](https://ai.google.dev/gemini-api/docs/ephemeral-tokens)
- [LiveKit Integration](https://docs.livekit.io/agents/integrations/realtime/gemini/)

**Deployment:**
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

---

**Built with ❤️ using Gemini API**