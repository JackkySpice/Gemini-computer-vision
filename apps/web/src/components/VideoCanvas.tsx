'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { useMediaStream } from '@/lib/MediaStreamContext';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5050';

export default function VideoCanvas() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());
  const requestInFlightRef = useRef(false);

  const { erMode, thinkingBudget, queries, setErResults, setLatency, setFps } = useStore();
  const { getMediaStream } = useMediaStream();

  // Start camera using shared media stream
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await getMediaStream();
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsCapturing(true);
      } catch (err: any) {
        setError(`Camera error: ${err.message}`);
      }
    };

    startCamera();
  }, [getMediaStream]);

  // Frame capture and ER processing
  useEffect(() => {
    if (!isCapturing || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lastCaptureTime = 0;
    const captureInterval = 500; // 500ms = ~2 fps

    const processFrame = async (timestamp: number) => {
      if (!video.videoWidth || !video.videoHeight) {
        animationId = requestAnimationFrame(processFrame);
        return;
      }

      // Set canvas size to match video
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Send frame to ER at interval
      if (timestamp - lastCaptureTime >= captureInterval && !requestInFlightRef.current) {
        lastCaptureTime = timestamp;
        requestInFlightRef.current = true;

        try {
          // Convert to JPEG with downscaling for better performance
          const downscaleCanvas = document.createElement('canvas');
          const targetWidth = 960;
          const scale = targetWidth / canvas.width;
          downscaleCanvas.width = targetWidth;
          downscaleCanvas.height = canvas.height * scale;
          const downscaleCtx = downscaleCanvas.getContext('2d');
          
          if (downscaleCtx) {
            downscaleCtx.drawImage(canvas, 0, 0, downscaleCanvas.width, downscaleCanvas.height);
            const dataUrl = downscaleCanvas.toDataURL('image/jpeg', 0.7);
            const base64 = dataUrl.split(',')[1];

            // Send to backend
            const response = await fetch(`${SERVER_URL}/api/er/frame`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: base64,
                mode: erMode,
                queries,
                thinkingBudget,
              }),
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setErResults(data.results);
            setLatency(data.latencyMs);

            // Update FPS
            frameCountRef.current++;
            const now = Date.now();
            const elapsed = now - lastFrameTimeRef.current;
            if (elapsed >= 1000) {
              setFps(frameCountRef.current / (elapsed / 1000));
              frameCountRef.current = 0;
              lastFrameTimeRef.current = now;
            }
          }
        } catch (err: any) {
          console.error('Frame processing error:', err);
          setError(`ER error: ${err.message}`);
        } finally {
          requestInFlightRef.current = false;
        }
      }

      animationId = requestAnimationFrame(processFrame);
    };

    animationId = requestAnimationFrame(processFrame);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isCapturing, erMode, thinkingBudget, queries, setErResults, setLatency, setFps]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto rounded-lg shadow-lg"
      />
      <canvas ref={canvasRef} className="hidden" />
      {error && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      {isCapturing && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Camera On
        </div>
      )}
    </div>
  );
}