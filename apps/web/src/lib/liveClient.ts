import { GoogleGenerativeAI } from '@google/generative-ai';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5050';

export interface LiveClientConfig {
  onTranscript?: (text: string) => void;
  onAudio?: (audioData: ArrayBuffer) => void;
  onError?: (error: Error) => void;
}

export class LiveClient {
  private client: GoogleGenerativeAI | null = null;
  private session: any = null;
  private config: LiveClientConfig;
  private token: string | null = null;
  private tokenExpireTime: string | null = null;
  private newSessionExpireTime: string | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;

  constructor(config: LiveClientConfig) {
    this.config = config;
  }

  async start(mediaStream: MediaStream) {
    try {
      this.mediaStream = mediaStream;

      // Get ephemeral token from server
      const response = await fetch(`${SERVER_URL}/api/live/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Failed to get token: ${response.status}`);
      }

      const data = await response.json();
      this.token = data.token;
      this.tokenExpireTime = data.expireTime;
      this.newSessionExpireTime = data.newSessionExpireTime;

      // Set up auto-refresh before newSessionExpireTime (9 minutes)
      this.setupTokenAutoRefresh();

      // Create client with ephemeral token
      this.client = new GoogleGenerativeAI(this.token);

      // Initialize audio context
      if (!this.audioContext) {
        this.audioContext = new AudioContext({ sampleRate: 16000 });
      }

      // Connect to Live API
      // @ts-ignore - Live API types may not be complete
      this.session = await this.client.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: ['AUDIO', 'TEXT'],
        },
      });

      // Set up callbacks
      this.session.on('transcript', (transcript: string) => {
        this.config.onTranscript?.(transcript);
      });

      this.session.on('audio', (audioData: ArrayBuffer) => {
        this.config.onAudio?.(audioData);
        this.playAudio(audioData);
      });

      this.session.on('error', (error: Error) => {
        this.config.onError?.(error);
      });

      // Start streaming audio from microphone
      this.streamAudio();
    } catch (error: any) {
      this.config.onError?.(error);
      throw error;
    }
  }

  private async streamAudio() {
    if (!this.session || !this.mediaStream || !this.audioContext) return;

    try {
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }

        // @ts-ignore
        this.session?.sendAudio?.(pcm16.buffer);
      };

      source.connect(processor);
      processor.connect(this.audioContext.destination);
    } catch (error: any) {
      this.config.onError?.(error);
    }
  }

  private async playAudio(audioData: ArrayBuffer) {
    if (!this.audioContext) return;

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  }

  async sendText(text: string) {
    if (!this.session) {
      throw new Error('Session not started');
    }

    // @ts-ignore
    await this.session.sendText?.(text);
  }

  private setupTokenAutoRefresh() {
    // Clear any existing refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Calculate time until refresh (8 minutes = 480 seconds)
    const refreshTime = 8 * 60 * 1000; // 8 minutes in ms
    
    console.log('Setting up token auto-refresh in 8 minutes');
    
    this.refreshInterval = setInterval(async () => {
      console.log('Auto-refreshing ephemeral token');
      try {
        const response = await fetch(`${SERVER_URL}/api/live/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        if (response.ok) {
          const data = await response.json();
          this.token = data.token;
          this.tokenExpireTime = data.expireTime;
          this.newSessionExpireTime = data.newSessionExpireTime;
          
          // Recreate client with new token
          if (this.token) {
            this.client = new GoogleGenerativeAI(this.token);
            console.log('Token refreshed successfully');
          }
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        this.config.onError?.(error as Error);
      }
    }, refreshTime);
  }

  stop() {
    // Clear token refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    if (this.session) {
      // @ts-ignore
      this.session.disconnect?.();
      this.session = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.client = null;
    this.token = null;
    this.tokenExpireTime = null;
    this.newSessionExpireTime = null;
  }
}