export interface ERPoint {
  point: [number, number]; // [y, x] normalized 0-1000
  label?: string;
  box?: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

export interface ERTrajectory {
  trajectory: [number, number][]; // [[y, x], ...]
  label: string;
}

export interface ERFrameRequest {
  imageBase64: string;
  mode?: 'points' | 'boxes' | 'trajectory';
  queries?: string[];
  thinkingBudget?: number;
}

export interface ERFrameResponse {
  results: ERPoint[] | ERTrajectory;
  latencyMs: number;
}

export interface LiveTokenRequest {
  model?: string;
}

export interface LiveTokenResponse {
  token: string;
  expireTime: string;
  newSessionExpireTime: string;
}