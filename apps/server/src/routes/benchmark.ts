import { Router } from 'express';
import { callER } from '../lib/gemini';

const router = Router();

// Benchmark endpoint for latency testing
router.post('/latency', async (req, res) => {
  try {
    const { iterations = 10 } = req.body;
    
    // Create a small test image (1x1 pixel base64 JPEG)
    const testImage = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';
    
    const prompt = 'Return JSON array: [{"point": [500, 500], "label": "test"}]';
    
    const results = [];
    let totalLatency = 0;
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      try {
        await callER(testImage, prompt, 0);
        const latency = Date.now() - startTime;
        
        results.push({
          iteration: i + 1,
          latency,
          status: 'success',
        });
        
        totalLatency += latency;
        successCount++;
      } catch (error: any) {
        const latency = Date.now() - startTime;
        results.push({
          iteration: i + 1,
          latency,
          status: 'failure',
          error: error.message,
        });
        failureCount++;
      }
    }
    
    const avgLatency = successCount > 0 ? Math.round(totalLatency / successCount) : 0;
    
    res.json({
      iterations,
      successCount,
      failureCount,
      avgLatency,
      minLatency: Math.min(...results.filter(r => r.status === 'success').map(r => r.latency)),
      maxLatency: Math.max(...results.filter(r => r.status === 'success').map(r => r.latency)),
      results,
    });
  } catch (error: any) {
    console.error('Benchmark error:', error);
    res.status(500).json({ error: error.message || 'Benchmark failed' });
  }
});

export default router;