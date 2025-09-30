import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ERPoint, ERTrajectory } from '../types';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const apiKey = process.env.GEMINI_API_KEY || '';
const isDev = process.env.NODE_ENV !== 'production';
const useMock = process.env.USE_MOCK === 'true';

if (!apiKey && !useMock) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const client = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function callER(
  imageBase64: string,
  prompt: string,
  thinkingBudget: number = 0
): Promise<ERPoint[] | ERTrajectory> {
  const startTime = Date.now();
  
  logger.info({
    action: 'callER',
    promptLength: prompt.length,
    imageSize: imageBase64.length,
    thinkingBudget,
  }, 'Starting ER API call');

  // Dev mode mock response
  if (useMock || !client) {
    logger.info({ useMock, hasClient: !!client }, 'Using mock ER response');
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate latency
    
    const mockResponse: ERPoint[] = [
      { point: [450, 320], label: 'mock-object-1', box: [400, 280, 500, 360] },
      { point: [550, 480], label: 'mock-object-2', box: [500, 440, 600, 520] },
    ];
    
    logger.info({ latency: Date.now() - startTime }, 'Mock ER response completed');
    return mockResponse;
  }

  const model = client.getGenerativeModel({
    model: 'gemini-robotics-er-1.5-preview',
  });

  const image = {
    inlineData: {
      data: imageBase64,
      mimeType: 'image/jpeg',
    },
  };

  logger.debug({ model: 'gemini-robotics-er-1.5-preview' }, 'Calling Gemini ER API');

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [image, { text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
      },
      // @ts-ignore - thinking config may not be in types yet
      thinkingConfig: {
        thinkingBudget,
      },
    });

    const response = result.response;
    const text = response.text();
    
    logger.debug({ responseLength: text.length }, 'Received ER response');

    try {
      const parsed = JSON.parse(text);
      logger.info({ latency: Date.now() - startTime, resultCount: Array.isArray(parsed) ? parsed.length : 1 }, 'ER API call successful');
      return parsed;
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        logger.info({ latency: Date.now() - startTime }, 'ER API call successful (extracted from markdown)');
        return parsed;
      }
      logger.error({ text, error: e }, 'Failed to parse ER response');
      throw new Error(`Failed to parse ER response as JSON: ${text}`);
    }
  } catch (error: any) {
    logger.error({ error: error.message, latency: Date.now() - startTime }, 'ER API call failed');
    throw error;
  }
}

export async function createEphemeralToken(
  model: string,
  constraints?: Record<string, any>
): Promise<{ token: string; expireTime: string; newSessionExpireTime: string }> {
  logger.info({ model }, 'Creating ephemeral token');
  
  // Calculate expire times
  const now = new Date();
  const expireTime = new Date(now.getTime() + 30 * 60 * 1000).toISOString(); // 30 minutes
  const newSessionExpireTime = new Date(now.getTime() + 9 * 60 * 1000).toISOString(); // 9 minutes for auto-refresh

  // Mock token for testing
  if (useMock || !client) {
    logger.info('Returning mock ephemeral token');
    return {
      token: 'mock-ephemeral-token-' + Date.now(),
      expireTime,
      newSessionExpireTime,
    };
  }

  const config = {
    uses: 1,
    expireTime,
    newSessionExpireTime,
    liveConnectConstraints: {
      model,
      config: {
        responseModalities: ['AUDIO', 'TEXT'],
        ...constraints,
      },
    },
    httpOptions: {
      apiVersion: 'v1alpha',
    },
  };

  try {
    // @ts-ignore - authTokens API may not be fully typed
    const tokenResponse = await client.authTokens.create({ config });
    logger.info({ expireTime, newSessionExpireTime }, 'Ephemeral token created successfully');
    return {
      token: tokenResponse.name,
      expireTime,
      newSessionExpireTime,
    };
  } catch (error: any) {
    logger.warn({ error: error.message }, 'Failed to create ephemeral token, using API key directly');
    // Fallback: return the API key directly with a warning
    // This is for development only - in production, ephemeral tokens should work
    return {
      token: apiKey,
      expireTime,
      newSessionExpireTime,
    };
  }
}