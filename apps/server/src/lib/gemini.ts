import { GoogleGenerativeAI } from '@google/genai';
import type { ERPoint, ERTrajectory } from '../types.js';

const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const client = new GoogleGenerativeAI(apiKey);

export async function callER(
  imageBase64: string,
  prompt: string,
  thinkingBudget: number = 0
): Promise<ERPoint[] | ERTrajectory> {
  const model = client.getGenerativeModel({
    model: 'gemini-robotics-er-1.5-preview',
  });

  const image = {
    inlineData: {
      data: imageBase64,
      mimeType: 'image/jpeg',
    },
  };

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

  try {
    return JSON.parse(text);
  } catch (e) {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    throw new Error(`Failed to parse ER response as JSON: ${text}`);
  }
}

export async function createEphemeralToken(
  model: string,
  constraints?: Record<string, any>
): Promise<{ token: string; expireTime: string; newSessionExpireTime: string }> {
  // Calculate expire times
  const now = new Date();
  const expireTime = new Date(now.getTime() + 30 * 60 * 1000).toISOString(); // 30 minutes
  const newSessionExpireTime = new Date(now.getTime() + 1 * 60 * 1000).toISOString(); // 1 minute

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
    return {
      token: tokenResponse.name,
      expireTime,
      newSessionExpireTime,
    };
  } catch (error: any) {
    // Fallback: return the API key directly with a warning
    // This is for development only - in production, ephemeral tokens should work
    console.warn('Failed to create ephemeral token, using API key directly:', error.message);
    return {
      token: apiKey,
      expireTime,
      newSessionExpireTime,
    };
  }
}