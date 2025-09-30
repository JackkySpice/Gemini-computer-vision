import type { ERPoint, ERTrajectory } from './types';

export function normalizedToPixel(
  normalized: [number, number],
  width: number,
  height: number
): [number, number] {
  const [y, x] = normalized;
  return [(x / 1000) * width, (y / 1000) * height];
}

export function drawPoints(
  ctx: CanvasRenderingContext2D,
  points: ERPoint[],
  canvasWidth: number,
  canvasHeight: number
) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  points.forEach((item) => {
    const [px, py] = normalizedToPixel(item.point, canvasWidth, canvasHeight);

    // Draw point
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label
    if (item.label) {
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 16px sans-serif';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(item.label, px + 12, py - 8);
      ctx.fillText(item.label, px + 12, py - 8);
    }

    // Draw box if present
    if (item.box) {
      const [ymin, xmin, ymax, xmax] = item.box;
      const [x1, y1] = normalizedToPixel([ymin, xmin], canvasWidth, canvasHeight);
      const [x2, y2] = normalizedToPixel([ymax, xmax], canvasWidth, canvasHeight);

      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      // Draw semi-transparent fill
      ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    }
  });
}

export function drawTrajectory(
  ctx: CanvasRenderingContext2D,
  trajectory: ERTrajectory,
  canvasWidth: number,
  canvasHeight: number
) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (trajectory.trajectory.length === 0) return;

  // Draw path
  ctx.strokeStyle = '#ff00ff';
  ctx.lineWidth = 4;
  ctx.beginPath();

  trajectory.trajectory.forEach((point, idx) => {
    const [px, py] = normalizedToPixel(point, canvasWidth, canvasHeight);
    if (idx === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  });

  ctx.stroke();

  // Draw waypoints
  trajectory.trajectory.forEach((point, idx) => {
    const [px, py] = normalizedToPixel(point, canvasWidth, canvasHeight);

    ctx.fillStyle = idx === 0 ? '#00ff00' : idx === trajectory.trajectory.length - 1 ? '#ff0000' : '#ff00ff';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Draw label
  if (trajectory.label) {
    const [px, py] = normalizedToPixel(trajectory.trajectory[0], canvasWidth, canvasHeight);
    ctx.fillStyle = '#ff00ff';
    ctx.font = 'bold 16px sans-serif';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(trajectory.label, px + 12, py - 8);
    ctx.fillText(trajectory.label, px + 12, py - 8);
  }
}