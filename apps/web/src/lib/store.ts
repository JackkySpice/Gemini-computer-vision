import { create } from 'zustand';
import type { AppState } from './types';

export const useStore = create<AppState>((set) => ({
  // ER state
  erResults: null,
  erMode: 'points',
  thinkingBudget: 0,
  queries: [],
  latencyMs: 0,
  fps: 0,

  // Live state
  isLiveActive: false,
  liveToken: null,
  liveTranscript: '',

  // Actions
  setErResults: (results) => set({ erResults: results }),
  setErMode: (mode) => set({ erMode: mode }),
  setThinkingBudget: (budget) => set({ thinkingBudget: budget }),
  setQueries: (queries) => set({ queries }),
  setLatency: (ms) => set({ latencyMs: ms }),
  setFps: (fps) => set({ fps }),
  setLiveActive: (active) => set({ isLiveActive: active }),
  setLiveToken: (token) => set({ liveToken: token }),
  setLiveTranscript: (transcript) => set({ liveTranscript: transcript }),
}));