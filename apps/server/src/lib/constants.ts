/**
 * Central constants file for model names and configuration
 */

export const MODELS = {
  ER: 'gemini-robotics-er-1.5-preview',
  LIVE: 'gemini-2.5-flash-native-audio-preview-09-2025',
} as const;

export const VALIDATION = {
  MAX_BENCHMARK_ITERATIONS: 100,
  MIN_BENCHMARK_ITERATIONS: 1,
  MAX_IMAGE_SIZE_MB: 10,
} as const;

export const RATE_LIMITS = {
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
  STRICT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 30,
  },
} as const;
