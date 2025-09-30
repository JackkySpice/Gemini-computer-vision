# Testing Guide

## Pre-flight Checklist

Before testing, ensure:

- [ ] Node.js 20+ installed (`node -v`)
- [ ] PNPM installed (`pnpm -v`)
- [ ] Gemini API key obtained
- [ ] `.env` files configured
- [ ] Dependencies installed (`pnpm install`)
- [ ] Both servers running (`pnpm dev`)

## Automated Tests

### Health Check
```bash
# Check if servers are running
./scripts/health-check.sh

# Expected output:
# ✅ Backend server is healthy
# ✅ Frontend is accessible
# ✅ GEMINI_API_KEY is set
```

### Setup Validation
```bash
# Validate setup
./scripts/setup.sh

# Should show:
# ✅ Node.js version
# ✅ PNPM version
# ✅ Environment files
```

## Manual Testing

### 1. Camera Initialization Test

**Steps:**
1. Open http://localhost:3000
2. Grant camera permission when prompted
3. Observe video feed

**Expected:**
- ✅ Webcam stream visible
- ✅ Green "Camera On" indicator
- ✅ No error messages
- ✅ Stats showing 0 latency initially

**Troubleshooting:**
- ❌ No video: Check browser permissions
- ❌ Error: Try different browser (Chrome/Edge)
- ❌ Black screen: Check camera is not in use

### 2. Points Detection Test

**Steps:**
1. Select "Points" mode
2. Set thinking budget to 2
3. Hold a recognizable object (banana, cup, phone)
4. Wait 1-2 seconds

**Expected:**
- ✅ Green dots appear on object centers
- ✅ Labels show object names
- ✅ Latency: 500-800ms
- ✅ FPS: ~2.0

**Troubleshooting:**
- ❌ No points: Check lighting, try different object
- ❌ High latency: Lower thinking budget
- ❌ Wrong labels: Increase thinking budget

### 3. Boxes Detection Test

**Steps:**
1. Select "Boxes" mode
2. Set thinking budget to 2
3. Place multiple objects in view

**Expected:**
- ✅ Green rectangles around objects
- ✅ Semi-transparent fill
- ✅ Labels on or near boxes
- ✅ Latency: 600-1000ms

**Troubleshooting:**
- ❌ Boxes too large/small: Adjust camera distance
- ❌ Missing boxes: Increase thinking budget
- ❌ Overlapping boxes: Normal for close objects

### 4. Query Filtering Test

**Steps:**
1. Mode: "Points" or "Boxes"
2. Enter queries: "banana, cup, phone"
3. Place these objects in view
4. Place other objects (should be ignored)

**Expected:**
- ✅ Only queried objects detected
- ✅ Other objects ignored
- ✅ Faster processing (fewer objects)
- ✅ Lower latency

**Troubleshooting:**
- ❌ All objects detected: Check query syntax
- ❌ No results: Verify object spelling

### 5. Trajectory Planning Test

**Steps:**
1. Select "Trajectory" mode
2. Set thinking budget to 4
3. Enter query: "reach the cup"
4. Place cup in view

**Expected:**
- ✅ Magenta path appears
- ✅ 5+ waypoints shown
- ✅ Start point (green) and end point (red)
- ✅ Latency: 1-2s

**Troubleshooting:**
- ❌ No trajectory: Be more specific in query
- ❌ Path unclear: Increase thinking budget
- ❌ Wrong target: Rephrase query

### 6. Thinking Budget Test

**Steps:**
1. Test with budget 0 (fast)
2. Test with budget 4 (balanced)
3. Test with budget 8 (accurate)
4. Compare results and latency

**Expected:**

| Budget | Latency | Accuracy | Use Case |
|--------|---------|----------|----------|
| 0 | <300ms | Basic | Real-time tracking |
| 2 | ~500ms | Good | General use |
| 4 | ~1s | Very good | Complex scenes |
| 8 | ~2s | Best | Precision tasks |

### 7. Live API Connection Test

**Steps:**
1. Click "Start Live Session"
2. Wait for connection (3-5s)
3. Observe UI changes

**Expected:**
- ✅ Button changes to "Stop Live Session"
- ✅ Text input appears
- ✅ No error alerts
- ✅ Microphone access granted

**Troubleshooting:**
- ❌ Connection failed: Check network
- ❌ Token error: Verify API key
- ❌ No mic access: Check browser permissions

### 8. Voice Interaction Test

**Steps:**
1. Start Live session
2. Say: "What objects do you see?"
3. Wait for response

**Expected:**
- ✅ Transcript appears
- ✅ Audio response plays
- ✅ Response relevant to video
- ✅ <2s response time

**Troubleshooting:**
- ❌ No audio: Check speaker/volume
- ❌ No transcript: Check microphone
- ❌ Irrelevant response: Improve question clarity

### 9. Text Message Test

**Steps:**
1. Start Live session
2. Type: "Count the objects on the table"
3. Press Enter or click Send

**Expected:**
- ✅ Message sent
- ✅ Input clears
- ✅ Response received
- ✅ Transcript updates

### 10. Performance Test

**Steps:**
1. Run for 2 minutes
2. Monitor stats panel
3. Check browser console

**Expected:**
- ✅ FPS: 1.5-2.5
- ✅ Latency: <1000ms (budget 0-2)
- ✅ No memory leaks
- ✅ No console errors

**Troubleshooting:**
- ❌ FPS drops: Reduce thinking budget
- ❌ High memory: Refresh page
- ❌ Errors: Check network tab

## API Testing

### Test ER Endpoint

```bash
# Capture a test image
# Convert to base64 (use online tool or script)

curl -X POST http://localhost:5050/api/er/frame \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "YOUR_BASE64_STRING",
    "mode": "points",
    "queries": ["banana"],
    "thinkingBudget": 2
  }'

# Expected response:
# {
#   "results": [
#     {"point": [450, 320], "label": "banana"}
#   ],
#   "latencyMs": 650
# }
```

### Test Token Endpoint

```bash
curl -X POST http://localhost:5050/api/live/token \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected response:
# {
#   "token": "projects/.../locations/.../tokens/...",
#   "expireTime": "2025-09-30T12:30:00Z",
#   "newSessionExpireTime": "2025-09-30T12:01:00Z"
# }
```

### Test Health Endpoint

```bash
curl http://localhost:5050/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2025-09-30T12:00:00Z"
# }
```

## Integration Testing

### Scenario 1: Object Counting

**Setup:**
- Place 3 bananas on table
- Mode: Boxes
- Queries: "banana"

**Test:**
1. Wait for detection
2. Count boxes in results
3. Verify count = 3

### Scenario 2: Spatial Reasoning

**Setup:**
- Place cup and phone
- Mode: Boxes
- No queries

**Test:**
1. Start Live session
2. Ask: "Which object is on the left?"
3. Verify correct answer

### Scenario 3: Real-time Tracking

**Setup:**
- Mode: Points
- Queries: "hand"
- Budget: 0

**Test:**
1. Move hand in view
2. Verify point follows hand
3. Check latency <500ms

### Scenario 4: Multi-object Scene

**Setup:**
- 5+ different objects
- Mode: Boxes
- No queries

**Test:**
1. Verify all detected
2. Check labels accurate
3. No duplicate boxes

## Load Testing

### Backend Load Test

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test ER endpoint (requires valid base64 image)
ab -n 100 -c 10 -p test_payload.json -T application/json \
  http://localhost:5050/api/er/frame

# Analyze results:
# - Requests per second
# - Mean latency
# - Failed requests
```

### Frontend Stress Test

**Steps:**
1. Open 3 browser tabs
2. All accessing the app
3. Monitor server logs
4. Check for crashes

**Expected:**
- ✅ All tabs work
- ✅ No server crashes
- ✅ CORS allows requests

## Error Handling Tests

### Test 1: Invalid API Key

**Steps:**
1. Set wrong API key in `.env`
2. Restart server
3. Try detection

**Expected:**
- ❌ HTTP 500 error
- ✅ Error message displayed
- ✅ Server doesn't crash

### Test 2: No Camera

**Steps:**
1. Deny camera permission
2. Reload page

**Expected:**
- ✅ Error message shown
- ✅ App doesn't crash
- ✅ Can retry permission

### Test 3: Network Failure

**Steps:**
1. Stop backend server
2. Try detection

**Expected:**
- ✅ Error toast/message
- ✅ Frontend still responsive
- ✅ Can retry when server returns

### Test 4: Invalid Image

**Steps:**
1. Send malformed base64
2. Check response

**Expected:**
- ✅ HTTP 400/500 error
- ✅ Descriptive error message

## Browser Compatibility

Test on:
- [ ] Chrome 120+ ✅ (Recommended)
- [ ] Edge 120+ ✅ (Recommended)
- [ ] Firefox 120+ ⚠️ (May have issues)
- [ ] Safari 17+ ⚠️ (Limited support)

## Mobile Testing

**Not fully supported but test:**
- [ ] Mobile Chrome (Android)
- [ ] Safari (iOS)

**Expected issues:**
- Camera orientation
- Performance on low-end devices
- Touch controls

## Security Testing

### Test 1: API Key Exposure

**Steps:**
1. Open browser DevTools
2. Check Network tab
3. Inspect all requests

**Expected:**
- ✅ No API key in browser
- ✅ Only ephemeral tokens sent
- ✅ Tokens expire after use

### Test 2: CORS Validation

**Steps:**
1. Try request from different origin
```bash
curl -X POST http://localhost:5050/api/er/frame \
  -H "Origin: http://evil.com" \
  -H "Content-Type: application/json"
```

**Expected:**
- ❌ CORS error
- ✅ Request blocked

## Regression Testing Checklist

Before each release:

- [ ] All detection modes work
- [ ] Query filtering works
- [ ] Thinking budget affects latency
- [ ] Live API connects
- [ ] Voice and text work
- [ ] Stats update correctly
- [ ] No console errors
- [ ] No memory leaks
- [ ] Performance acceptable
- [ ] Documentation accurate

## Known Issues & Limitations

1. **Ephemeral Token API** - May not be fully available; fallback uses API key
2. **Live API Audio** - Codec compatibility varies by browser
3. **Camera Permissions** - HTTPS required in production
4. **Mobile Support** - Limited, desktop recommended
5. **Rate Limits** - Frequent requests may hit API limits

## Reporting Issues

When reporting bugs, include:

1. Browser version
2. Node.js version
3. Error messages (console + network)
4. Steps to reproduce
5. Expected vs actual behavior
6. Screenshots if applicable

## Test Data

### Good Test Objects
- ✅ Banana (highly recognizable)
- ✅ Cup/Mug (common shape)
- ✅ Phone (distinct)
- ✅ Keyboard (multiple parts)
- ✅ Book (flat object)

### Challenging Objects
- ⚠️ Transparent items
- ⚠️ Very small objects
- ⚠️ Objects with similar colors to background
- ⚠️ Reflective surfaces

### Test Scenes
1. **Simple**: 1-2 objects, plain background
2. **Medium**: 3-5 objects, varied
3. **Complex**: 10+ objects, cluttered
4. **Dynamic**: Moving objects/people