'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { drawPoints, drawTrajectory } from '@/lib/draw';
import type { ERPoint, ERTrajectory } from '@/lib/types';

interface OverlayProps {
  videoWidth: number;
  videoHeight: number;
}

export default function Overlay({ videoWidth, videoHeight }: OverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { erResults, erMode } = useStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    // Draw results
    if (erResults) {
      if (erMode === 'trajectory' && 'trajectory' in erResults) {
        drawTrajectory(ctx, erResults as ERTrajectory, videoWidth, videoHeight);
      } else if (Array.isArray(erResults)) {
        drawPoints(ctx, erResults as ERPoint[], videoWidth, videoHeight);
      }
    }
  }, [erResults, erMode, videoWidth, videoHeight]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
}