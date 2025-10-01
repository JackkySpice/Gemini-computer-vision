# Critical Bugs & Issues Summary

## 🚨 CRITICAL - Fix Immediately

### 1. **API Key Security Vulnerability**
- **File**: `apps/server/src/lib/gemini.ts:143-149`
- **Issue**: Raw API key sent to client browser on ephemeral token failure
- **Risk**: API key exposure, unauthorized usage, security breach
- **Fix**: Remove fallback, throw error instead

### 2. **Benchmark Infinity Bug**
- **File**: `apps/server/src/routes/benchmark.ts:55-56`
- **Issue**: `Math.min/max()` on empty array returns Infinity/-Infinity
- **Risk**: Invalid API responses, client crashes
- **Fix**: Check array length before Math operations

### 3. **Deprecated Browser API**
- **File**: `apps/web/src/lib/liveClient.ts:97`
- **Issue**: `createScriptProcessor()` is deprecated
- **Risk**: Future browser incompatibility, performance warnings
- **Fix**: Migrate to AudioWorklet API

---

## ⚠️ HIGH PRIORITY

### 4. **Token Refresh Doesn't Reconnect**
- **File**: `apps/web/src/lib/liveClient.ts:168`
- **Issue**: New token created but session not restarted
- **Risk**: Session dies after 9 minutes despite token refresh
- **Fix**: Restart session after token refresh

### 5. **E2E Tests All Failing**
- **File**: All Playwright tests
- **Issue**: Browsers not installed (16/16 failures)
- **Risk**: No automated UI testing
- **Fix**: Run `pnpm exec playwright install`

### 6. **No Input Validation on Benchmark**
- **File**: `apps/server/src/routes/benchmark.ts:9`
- **Issue**: Client can send unlimited iterations
- **Risk**: DoS attack, resource exhaustion
- **Fix**: Validate 1 <= iterations <= 100

### 7. **Docker Network Misconfiguration**
- **File**: `docker-compose.yml:23`
- **Issue**: Web uses internal Docker URL for browser API calls
- **Risk**: API calls fail when accessed from browser
- **Fix**: Use environment variable for public URL

---

## 📋 MEDIUM PRIORITY

### 8. **Camera Stream Memory Leak**
- **File**: `apps/web/src/app/page.tsx:62` and `VideoCanvas.tsx:26`
- **Issue**: Multiple MediaStream instances not properly cleaned up
- **Risk**: Battery drain, memory leak
- **Fix**: Share single MediaStream via context

### 9. **Missing Error Boundaries**
- **File**: `apps/web/src/app/layout.tsx`
- **Issue**: No React error boundary
- **Risk**: White screen on errors
- **Fix**: Add error boundary wrapper

### 10. **No Rate Limiting**
- **File**: All endpoints
- **Issue**: API endpoints unprotected
- **Risk**: Abuse, high costs
- **Fix**: Add express-rate-limit

---

## 🔧 LOW PRIORITY

### 11. **Missing .env.example Files**
- **Issue**: No template environment files
- **Risk**: Setup confusion for developers
- **Fix**: Create .env.example files

### 12. **Hard-coded Model Names**
- **Issue**: Model names scattered across files
- **Risk**: Difficult to update
- **Fix**: Use constants or env vars

### 13. **Inconsistent Logging**
- **File**: `apps/server/src/routes/benchmark.ts:60`
- **Issue**: console.error instead of logger
- **Risk**: Inconsistent log format
- **Fix**: Use pino logger consistently

---

## Quick Fix Commands

```bash
# Fix E2E tests
cd apps/web
pnpm exec playwright install

# Create env examples
cat > apps/server/.env.example << 'EOF'
GEMINI_API_KEY=your_api_key_here
PORT=5050
WEB_ORIGIN=http://localhost:3000
USE_MOCK=false
LOG_LEVEL=info
EOF

cat > apps/web/.env.local.example << 'EOF'
NEXT_PUBLIC_SERVER_URL=http://localhost:5050
EOF
```

## Priority Order

1. **TODAY**: Fix #1 (API key exposure), #2 (infinity bug)
2. **THIS WEEK**: Fix #3 (deprecated API), #4 (token refresh), #5 (E2E setup)
3. **NEXT WEEK**: Fix #6-10 (validation, docker, error boundaries)
4. **ONGOING**: Address #11-13 (developer experience)

---

## Test Before Deploy

```bash
# Run all tests
pnpm --filter @app/server test
pnpm --filter @app/web test

# Check builds
pnpm build

# Security check
npm audit
```
