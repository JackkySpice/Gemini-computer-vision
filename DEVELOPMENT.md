# Development Guide

## Quick Start for Developers

### Local Development Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   # Backend
   cp apps/server/.env.example apps/server/.env
   # Add your GEMINI_API_KEY

   # Frontend
   cp apps/web/.env.local.example apps/web/.env.local
   ```

3. **Run development servers:**
   ```bash
   pnpm dev
   ```

### Configuration

#### Frame Capture Settings (apps/web/src/components/VideoCanvas.tsx)

```typescript
// Adjust capture interval (ms)
const captureInterval = 500; // 500ms = ~2 fps

// Downscale resolution
const targetWidth = 960; // Lower for faster processing

// JPEG quality
const dataUrl = downscaleCanvas.toDataURL('image/jpeg', 0.7); // 0.7 = 70% quality
```

#### ER Settings (apps/server/src/lib/gemini.ts)

```typescript
// Model configuration
const model = client.getGenerativeModel({
  model: 'gemini-robotics-er-1.5-preview',
});

// Generation config
generationConfig: {
  temperature: 0.5, // Adjust for creativity vs consistency
}
```

#### Thinking Budget Guidelines

| Budget | Latency | Use Case |
|--------|---------|----------|
| 0-1    | <500ms  | Real-time tracking, quick responses |
| 2-3    | 500-1000ms | Balanced accuracy |
| 4-6    | 1-2s    | Complex scenes, precise detection |
| 7-8    | 2s+     | Maximum accuracy, planning tasks |

### Prompt Engineering for ER

#### Points Detection
```
Point to up to 10 items in the image.
Return JSON array: [{"point": [y, x], "label": "<name>"}].
Points are [y, x] normalized to 0-1000.
If the item is not visible, return an empty array.
```

#### Boxes Detection
```
Detect up to 10 objects in the image.
Return JSON array: [{"point": [y, x], "label": "<name>", "box": [ymin, xmin, ymax, xmax]}].
Points and boxes are normalized to 0-1000.
```

#### Trajectory Planning
```
Plan a trajectory to reach the goal in the image.
Return JSON: {"trajectory": [[y, x], ...], "label": "<goal>"}.
Include at least 5 intermediate points. Points are [y, x] normalized to 0-1000.
```

### Testing ER Without Camera

Add a demo image upload feature:

```typescript
// In VideoCanvas.tsx
const [demoImage, setDemoImage] = useState<string | null>(null);

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      setDemoImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }
};

// Then use demoImage instead of webcam frame
```

### LiveKit Integration (Optional)

To use LiveKit instead of direct WebSocket:

1. Install LiveKit SDK:
   ```bash
   pnpm --filter @app/web add livekit-client
   pnpm --filter @app/server add livekit-server-sdk
   ```

2. Set environment variable:
   ```bash
   USE_LIVEKIT=true
   ```

3. Update `liveClient.ts` to use LiveKit RealtimeModel

### Debugging

#### Enable verbose logging (Backend)

```typescript
// apps/server/src/index.ts
const logger = pino({ level: 'debug' }); // Change from 'info'
```

#### Monitor ER responses (Frontend)

```typescript
// apps/web/src/components/VideoCanvas.tsx
console.log('ER Response:', data);
```

#### Check Live API connection

```typescript
// apps/web/src/lib/liveClient.ts
this.session.on('connected', () => {
  console.log('Live API connected');
});
```

### Performance Optimization

1. **Reduce frame rate:**
   - Increase `captureInterval` in VideoCanvas
   - Add motion detection to skip static frames

2. **Optimize image size:**
   - Lower `targetWidth` for downscaling
   - Reduce JPEG quality

3. **Batch requests:**
   - Queue frames and process in batches
   - Use debouncing for queries

4. **Caching:**
   - Cache ER results for similar frames
   - Implement object persistence

### Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| `GEMINI_API_KEY is required` | Missing API key | Set in apps/server/.env |
| `HTTP 429` | Rate limit exceeded | Reduce frame rate, add retry logic |
| `Camera access denied` | Browser permissions | Enable camera in browser settings |
| `WebSocket connection failed` | Network issue | Check firewall, try different network |
| `Failed to parse ER response` | Invalid JSON | Improve prompt, add fallback parsing |

### Adding New Features

#### Example: Multi-frame tracking

1. Store previous frames:
   ```typescript
   const frameHistory = useRef<string[]>([]);
   ```

2. Send to backend:
   ```typescript
   POST /api/er/video
   Body: { frames: string[], mode: 'tracking', target: 'person' }
   ```

3. Process in server:
   ```typescript
   // Compare frames and track object movement
   ```

#### Example: Face blurring

1. Add face detection:
   ```typescript
   const faces = await callER(frame, 'Detect faces, return boxes', 0);
   ```

2. Blur regions:
   ```typescript
   faces.forEach(face => {
     const [ymin, xmin, ymax, xmax] = face.box;
     ctx.filter = 'blur(20px)';
     ctx.drawImage(canvas, x1, y1, x2-x1, y2-y1, x1, y1, x2-x1, y2-y1);
   });
   ```

### API Cost Estimation

Rough estimates (check official pricing):
- ER frame: ~$0.0001 per request
- Live API: ~$0.001 per minute
- At 2 fps: ~$0.012/min for ER only

Monitor usage in Google Cloud Console.

### Deployment

#### Vercel (Frontend)
```bash
cd apps/web
vercel deploy
```

#### Railway/Render (Backend)
```bash
# Set environment variables in dashboard
# Deploy apps/server directory
```

#### Environment variables for production
```bash
# Backend
GEMINI_API_KEY=your_key
PORT=5050
WEB_ORIGIN=https://your-frontend.vercel.app

# Frontend
NEXT_PUBLIC_SERVER_URL=https://your-backend.railway.app
```