# Quick Setup Guide

## 5-Minute Setup

### Step 1: Get Your API Key

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Click "Get API key"
3. Create a new API key
4. Copy the key

### Step 2: Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd gemini-robotics-live

# Install dependencies (requires PNPM)
pnpm install
```

### Step 3: Configure

```bash
# Backend configuration
cd apps/server
cp .env.example .env
nano .env  # Add your API key

# Frontend configuration
cd ../web
cp .env.local.example .env.local
# Default values should work for local development
```

Your `apps/server/.env` should look like:
```env
GEMINI_API_KEY=AIzaSyD...your-key-here
PORT=5050
```

### Step 4: Run

```bash
# From the root directory
pnpm dev
```

This will start:
- Backend server on http://localhost:5050
- Frontend app on http://localhost:3000

### Step 5: Test

1. Open http://localhost:3000 in Chrome/Edge
2. Allow camera access when prompted
3. You should see:
   - Your webcam feed
   - Green dots/boxes on detected objects
   - Stats showing latency and FPS

## Troubleshooting

### "pnpm: command not found"
```bash
npm install -g pnpm
```

### "GEMINI_API_KEY is required"
- Check `apps/server/.env` exists
- Verify the API key is correctly set
- Restart the server: `pnpm dev:server`

### Camera doesn't work
- Use Chrome or Edge (best support)
- Check browser permissions
- Try HTTPS in production (required for camera)

### No objects detected
- Ensure good lighting
- Try different objects (banana, cup, phone work well)
- Increase thinking budget slider
- Check browser console for errors

### Connection errors
- Verify both servers are running
- Check `NEXT_PUBLIC_SERVER_URL` in `apps/web/.env.local`
- Check firewall settings

## Next Steps

1. **Try different modes:**
   - Points: Quick object centers
   - Boxes: Bounding box detection
   - Trajectory: Path planning

2. **Test Live API:**
   - Click "Start Live Session"
   - Say "What objects do you see?"
   - Send text messages

3. **Customize queries:**
   - Type "banana, bowl, cup"
   - Click quick presets
   - Adjust thinking budget

4. **Read the docs:**
   - [README.md](./README.md) - Full documentation
   - [DEVELOPMENT.md](./DEVELOPMENT.md) - Developer guide

## Production Deployment

See [README.md](./README.md#deployment) for Vercel/Railway deployment instructions.

## Getting Help

- Check [Troubleshooting](#troubleshooting)
- Review [DEVELOPMENT.md](./DEVELOPMENT.md)
- Open an issue on GitHub
- Read [Gemini API docs](https://ai.google.dev/gemini-api/docs)