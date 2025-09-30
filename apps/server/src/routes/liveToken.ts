import { Router } from 'express';
import { createEphemeralToken } from '../lib/gemini.js';
import type { LiveTokenRequest, LiveTokenResponse } from '../types.js';

const router = Router();

router.post('/token', async (req, res) => {
  try {
    const { model = 'gemini-2.5-flash-native-audio-preview-09-2025' }: LiveTokenRequest = req.body;

    const tokenData = await createEphemeralToken(model);

    const response: LiveTokenResponse = {
      token: tokenData.token,
      expireTime: tokenData.expireTime,
      newSessionExpireTime: tokenData.newSessionExpireTime,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Live token error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;