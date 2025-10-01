import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import erRouter from '../routes/er';
import liveTokenRouter from '../routes/liveToken';
import benchmarkRouter from '../routes/benchmark';

// Create test app
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/er', erRouter);
app.use('/api/live', liveTokenRouter);
app.use('/api/er/benchmark', benchmarkRouter);

describe('Server Integration Tests', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('ER Frame Processing', () => {
    it('should process frame request with mock data', async () => {
      // Small 1x1 test image
      const testImage = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

      const response = await request(app)
        .post('/api/er/frame')
        .send({
          imageBase64: testImage,
          mode: 'points',
          queries: ['test'],
          thinkingBudget: 0,
        })
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('latencyMs');
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should reject request without image', async () => {
      const response = await request(app)
        .post('/api/er/frame')
        .send({
          mode: 'points',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle boxes mode', async () => {
      const testImage = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

      const response = await request(app)
        .post('/api/er/frame')
        .send({
          imageBase64: testImage,
          mode: 'boxes',
          thinkingBudget: 0,
        })
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(response.body.latencyMs).toBeGreaterThan(0);
    });
  });

  describe('Live Token Generation', () => {
    it('should attempt to generate ephemeral token', async () => {
      const response = await request(app)
        .post('/api/live/token')
        .send({});

      // Either succeeds (200) or fails gracefully (500) without exposing API key
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('expireTime');
        expect(response.body).toHaveProperty('newSessionExpireTime');
        expect(response.body.token).toBeTruthy();
      } else {
        // Should fail safely without exposing API key
        expect(response.body.error).toBeTruthy();
        expect(response.body.error).not.toContain('AIza'); // API key should NOT be in response
      }
    });

    it('should accept custom model parameter', async () => {
      const response = await request(app)
        .post('/api/live/token')
        .send({ model: 'gemini-live-2.5-flash-preview' });

      // Either succeeds or fails gracefully
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 500) {
        // Should fail safely without exposing API key
        expect(response.body.error).not.toContain('AIza');
      }
    });
  });

  describe('Benchmark Endpoint', () => {
    it('should run latency benchmark with reduced iterations (real API)', async () => {
      // Use fewer iterations for real API testing to avoid timeouts
      const response = await request(app)
        .post('/api/er/benchmark/latency')
        .send({ iterations: 2 }) // Reduced from 10 for faster testing
        .timeout(30000) // 30 seconds timeout for real API
        .expect(200);

      expect(response.body).toHaveProperty('iterations', 2);
      expect(response.body).toHaveProperty('successCount');
      expect(response.body).toHaveProperty('avgLatency');
      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results.length).toBe(2);
      
      // Verify infinity bug is fixed
      expect(response.body.minLatency).not.toBe(Infinity);
      expect(response.body.maxLatency).not.toBe(-Infinity);
    });

    it('should run benchmark with custom iterations', async () => {
      const response = await request(app)
        .post('/api/er/benchmark/latency')
        .send({ iterations: 2 }) // Reduced for faster testing
        .timeout(30000)
        .expect(200);

      expect(response.body.iterations).toBe(2);
      expect(response.body.results.length).toBe(2);
      
      if (response.body.successCount > 0) {
        expect(response.body.avgLatency).toBeGreaterThan(0);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/er/frame')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    it('should handle invalid routes', async () => {
      await request(app)
        .get('/api/invalid')
        .expect(404);
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});