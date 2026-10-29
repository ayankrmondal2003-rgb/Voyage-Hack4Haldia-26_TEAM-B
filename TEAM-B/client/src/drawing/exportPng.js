import { getElementBounds, renderStroke } from './render.js';

export function exportBoardToPng(strokes, roomId = 'board', options = {}) {
  const activeStrokes = (strokes || []).filter(s => s.active !== false);

  if (!activeStrokes.length) {
    // Generate a clean empty board image with a placeholder note
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fdfcf7';
    ctx.fillRect(0, 0, 800, 600);
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'center';
    ctx.fillText('Whiteboard is empty', 400, 300);
    triggerDownload(canvas, `whiteboard-${roomId}.png`);
    return;
  }

  // Calculate overall bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of activeStrokes) {
    const b = getElementBounds(s);
    if (b.minX < minX) minX = b.minX;
    if (b.minY < minY) minY = b.minY;
    if (b.maxX > maxX) maxX = b.maxX;
    if (b.maxY > maxY) maxY = b.maxY;
  }

  const padding = options.padding || 60;
  const boardWidth = Math.max(200, Math.ceil(maxX - minX + padding * 2));
  const boardHeight = Math.max(200, Math.ceil(maxY - minY + padding * 2));

  // High-resolution canvas for crisp export
  const scale = options.scale || 2;
  const canvas = document.createElement('canvas');
  canvas.width = boardWidth * scale;
  canvas.height = boardHeight * scale;

  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = options.backgroundColor || '#fdfcf7';
  ctx.fillRect(0, 0, boardWidth, boardHeight);

  // Optional subtle dot grid
  if (options.grid !== false) {
    ctx.fillStyle = '#cbd5e1';
    for (let x = 20; x < boardWidth; x += 24) {
      for (let y = 20; y < boardHeight; y += 24) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Translate to place elements inside padded area
  ctx.translate(-minX + padding, -minY + padding);

  // Render all active strokes
  for (const s of activeStrokes) {
    renderStroke(ctx, s);
  }

  triggerDownload(canvas, `whiteboard-${roomId}.png`);
}

function triggerDownload(canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, 'image/png');
}

