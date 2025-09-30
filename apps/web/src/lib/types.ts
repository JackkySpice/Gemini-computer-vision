export interface ERPoint {
  point: [number, number]; // [y, x] normalized 0-1000
  label?: string;
  box?: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

export interface ERTrajectory {
  trajectory: [number, number][]; // [[y, x], ...]
  label: string;
}

export type ERMode = 'points' | 'boxes' | 'trajectory';

export interface AppState {
  // ER state
  erResults: ERPoint[] | ERTrajectory | null;
  erMode: ERMode;
  thinkingBudget: number;
  queries: string[];
  latencyMs: number;
  fps: number;
  
  // Live state
  isLiveActive: boolean;
  liveToken: string | null;
  liveTranscript: string;
  
  // Actions
  setErResults: (results: ERPoint[] | ERTrajectory | null) => void;
  setErMode: (mode: ERMode) => void;
  setThinkingBudget: (budget: number) => void;
  setQueries: (queries: string[]) => void;
  setLatency: (ms: number) => void;
  setFps: (fps: number) => void;
  setLiveActive: (active: boolean) => void;
  setLiveToken: (token: string | null) => void;
  setLiveTranscript: (transcript: string) => void;
}