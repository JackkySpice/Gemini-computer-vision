import { Router } from 'express';
import { callER } from '../lib/gemini';
import type { ERFrameRequest, ERFrameResponse } from '../types';

const router = Router();

router.post('/frame', async (req, res) => {
  try {
    const { imageBase64, mode = 'points', queries = [], thinkingBudget = 0 }: ERFrameRequest = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const startTime = Date.now();

    let prompt = '';

    if (mode === 'points') {
      prompt = `Point to up to 10 items in the image.
Return JSON array: [{"point": [y, x], "label": "<name>"}].
Points are [y, x] normalized to 0-1000.`;
      
      if (queries.length > 0) {
        prompt += `\nOnly return labels for: ${queries.join(', ')}.`;
      }
      
      prompt += `\nIf the item is not visible, return an empty array.`;
    } else if (mode === 'boxes') {
      prompt = `Detect up to 10 objects in the image.
Return JSON array: [{"point": [y, x], "label": "<name>", "box": [ymin, xmin, ymax, xmax]}].
Points and boxes are normalized to 0-1000.`;
      
      if (queries.length > 0) {
        prompt += `\nOnly return labels for: ${queries.join(', ')}.`;
      }
      
      prompt += `\nIf the item is not visible, return an empty array.`;
    } else if (mode === 'trajectory') {
      prompt = `Plan a trajectory to reach the goal in the image.
Return JSON: {"trajectory": [[y, x], ...], "label": "<goal>"}.
Include at least 5 intermediate points. Points are [y, x] normalized to 0-1000.`;
      
      if (queries.length > 0) {
        prompt += `\nGoal: ${queries[0]}.`;
      }
    }

    const results = await callER(imageBase64, prompt, thinkingBudget);
    const latencyMs = Date.now() - startTime;

    const response: ERFrameResponse = {
      results,
      latencyMs,
    };

    res.json(response);
  } catch (error: any) {
    console.error('ER frame error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;