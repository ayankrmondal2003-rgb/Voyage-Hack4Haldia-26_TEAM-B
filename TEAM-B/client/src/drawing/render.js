export function pointFromEvent(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return [event.clientX - rect.left, event.clientY - rect.top];
}

export function screenToWorld(point, zoom = 1, pan = [0, 0]) {
  return [
    (point[0] - pan[0]) / zoom,
    (point[1] - pan[1]) / zoom
  ];
}

export function worldToScreen(point, zoom = 1, pan = [0, 0]) {
  return [
    point[0] * zoom + pan[0],
    point[1] * zoom + pan[1]
  ];
}

export function getElementBounds(element) {
  const tool = element.tool || element.type || 'pen';
  if (tool === 'pen') {
    const points = element.points || [];
    if (!points.length) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of points) {
      if (p[0] < minX) minX = p[0];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[1] > maxY) maxY = p[1];
    }
    const pad = (element.width || 4) / 2;
    return {
      minX: minX - pad,
      minY: minY - pad,
      maxX: maxX + pad,
      maxY: maxY + pad,
      width: (maxX - minX) + pad * 2,
      height: (maxY - minY) + pad * 2
    };
  }

  if (tool === 'rectangle' || tool === 'ellipse') {
    const p0 = element.points?.[0] || [element.x ?? 0, element.y ?? 0];
    const p1 = element.points?.[1] || [p0[0] + (element.w ?? 100), p0[1] + (element.h ?? 60)];
    const minX = Math.min(p0[0], p1[0]);
    const minY = Math.min(p0[1], p1[1]);
    const maxX = Math.max(p0[0], p1[0]);
    const maxY = Math.max(p0[1], p1[1]);
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  if (tool === 'line' || tool === 'arrow') {
    const p0 = element.points?.[0] || [0, 0];
    const p1 = element.points?.[1] || p0;
    const pad = Math.max(8, (element.width || 4));
    const minX = Math.min(p0[0], p1[0]) - pad;
    const minY = Math.min(p0[1], p1[1]) - pad;
    const maxX = Math.max(p0[0], p1[0]) + pad;
    const maxY = Math.max(p0[1], p1[1]) + pad;
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  if (tool === 'text') {
    const x = element.x ?? element.points?.[0]?.[0] ?? 0;
    const y = element.y ?? element.points?.[0]?.[1] ?? 0;
    const fontSize = element.fontSize || 18;
    const lines = (element.text || 'Text').split('\n');
    let maxLen = 0;
    for (const l of lines) {
      if (l.length > maxLen) maxLen = l.length;
    }
    const width = Math.max(40, maxLen * fontSize * 0.6);
    const height = Math.max(fontSize, lines.length * fontSize * 1.3);
    return {
      minX: x - 4,
      minY: y - fontSize,
      maxX: x + width + 4,
      maxY: y + height - fontSize + 4,
      width: width + 8,
      height: height + 8
    };
  }

  return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
}

export function hitTestElement(point, element) {
  const [px, py] = point;
  const tool = element.tool || element.type || 'pen';

  if (tool === 'pen') {
    const points = element.points || [];
    const threshold = Math.max(8, (element.width || 4));
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (Math.hypot(px - p[0], py - p[1]) <= threshold) return true;
      if (i > 0) {
        const prev = points[i - 1];
        if (distToSegment([px, py], prev, p) <= threshold) return true;
      }
    }
    return false;
  }

  const b = getElementBounds(element);
  if (tool === 'rectangle' || tool === 'text') {
    return px >= b.minX - 4 && px <= b.maxX + 4 && py >= b.minY - 4 && py <= b.maxY + 4;
  }

  if (tool === 'ellipse') {
    const cx = (b.minX + b.maxX) / 2;
    const cy = (b.minY + b.maxY) / 2;
    const rx = Math.max(1, b.width / 2);
    const ry = Math.max(1, b.height / 2);
    const val = Math.pow((px - cx) / rx, 2) + Math.pow((py - cy) / ry, 2);
    return val <= 1.2;
  }

  if (tool === 'line' || tool === 'arrow') {
    const p0 = element.points?.[0] || [0, 0];
    const p1 = element.points?.[1] || p0;
    const threshold = Math.max(8, (element.width || 4));
    return distToSegment([px, py], p0, p1) <= threshold;
  }

  return false;
}

function distToSegment(p, v, w) {
  const l2 = Math.pow(v[0] - w[0], 2) + Math.pow(v[1] - w[1], 2);
  if (l2 === 0) return Math.hypot(p[0] - v[0], p[1] - v[1]);
  let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (v[0] + t * (w[0] - v[0])), p[1] - (v[1] + t * (w[1] - v[1])));
}

export function renderStroke(ctx, stroke) {
  const tool = stroke.tool || stroke.type || 'pen';
  const color = stroke.color || stroke.strokeColor || '#000000';
  const width = stroke.width || stroke.strokeWidth || 3;

  // 1. FREEHAND PEN
  if (tool === 'pen') {
    const points = stroke.points || [];
    if (!points.length) return;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (points.length === 1) {
      ctx.arc(points[0][0], points[0][1], width / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length - 1; i++) {
      const next = points[i + 1];
      ctx.quadraticCurveTo(points[i][0], points[i][1], (points[i][0] + next[0]) / 2, (points[i][1] + next[1]) / 2);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last[0], last[1]);
    ctx.stroke();
    return;
  }

  // 2. RECTANGLE
  if (tool === 'rectangle') {
    const p0 = stroke.points?.[0] || [stroke.x ?? 0, stroke.y ?? 0];
    const p1 = stroke.points?.[1] || [p0[0] + (stroke.w ?? 100), p0[1] + (stroke.h ?? 60)];
    const x = Math.min(p0[0], p1[0]);
    const y = Math.min(p0[1], p1[1]);
    const w = Math.abs(p1[0] - p0[0]);
    const h = Math.abs(p1[1] - p0[1]);

    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.lineJoin = 'round';

    if (stroke.fillColor && stroke.fillColor !== 'transparent') {
      ctx.fillStyle = stroke.fillColor;
      ctx.fillRect(x, y, w, h);
    }
    ctx.strokeRect(x, y, w, h);
    return;
  }

  // 3. ELLIPSE / CIRCLE
  if (tool === 'ellipse') {
    const p0 = stroke.points?.[0] || [stroke.x ?? 0, stroke.y ?? 0];
    const p1 = stroke.points?.[1] || [p0[0] + (stroke.w ?? 100), p0[1] + (stroke.h ?? 60)];
    const cx = (p0[0] + p1[0]) / 2;
    const cy = (p0[1] + p1[1]) / 2;
    const rx = Math.max(0.1, Math.abs(p1[0] - p0[0]) / 2);
    const ry = Math.max(0.1, Math.abs(p1[1] - p0[1]) / 2);

    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);

    if (stroke.fillColor && stroke.fillColor !== 'transparent') {
      ctx.fillStyle = stroke.fillColor;
      ctx.fill();
    }
    ctx.stroke();
    return;
  }

  // 4. STRAIGHT LINE
  if (tool === 'line') {
    const p0 = stroke.points?.[0] || [0, 0];
    const p1 = stroke.points?.[1] || p0;
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.lineTo(p1[0], p1[1]);
    ctx.stroke();
    return;
  }

  // 5. ARROW
  if (tool === 'arrow') {
    const p0 = stroke.points?.[0] || [0, 0];
    const p1 = stroke.points?.[1] || p0;
    const widthVal = width;
    ctx.lineWidth = widthVal;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.lineTo(p1[0], p1[1]);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
    const headLen = Math.max(12, widthVal * 3.5);
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p1[0] - headLen * Math.cos(angle - Math.PI / 6), p1[1] - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(p1[0] - headLen * Math.cos(angle + Math.PI / 6), p1[1] - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    return;
  }

  // 6. TEXT
  if (tool === 'text') {
    const x = stroke.x ?? stroke.points?.[0]?.[0] ?? 0;
    const y = stroke.y ?? stroke.points?.[0]?.[1] ?? 0;
    const fontSize = stroke.fontSize || 18;
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = color;
    const lines = (stroke.text || '').split('\n');
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + (index * fontSize * 1.25));
    });
  }
}

export function renderSelectionBox(ctx, bounds) {
  ctx.save();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(bounds.minX - 4, bounds.minY - 4, bounds.width + 8, bounds.height + 8);
  ctx.setLineDash([]);

  // Handles at 4 corners
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  const corners = [
    [bounds.minX - 7, bounds.minY - 7],
    [bounds.maxX + 1, bounds.minY - 7],
    [bounds.maxX + 1, bounds.maxY + 1],
    [bounds.minX - 7, bounds.maxY + 1]
  ];
  for (const [cx, cy] of corners) {
    ctx.fillRect(cx, cy, 6, 6);
    ctx.strokeRect(cx, cy, 6, 6);
  }
  ctx.restore();
}

export function renderBoard(canvas, strokes, options = {}) {
  if (!canvas) return;
  const { zoom = 1, pan = [0, 0], selectedIds = [], draft = null } = options;
  const rect = canvas.getBoundingClientRect();
  const ratio = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(1, Math.round(rect.height * ratio));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio * zoom, 0, 0, ratio * zoom, ratio * pan[0], ratio * pan[1]);
  ctx.clearRect(-pan[0] / zoom, -pan[1] / zoom, rect.width / zoom, rect.height / zoom);

  // Render all active strokes
  const renderedIds = new Set();
  if (strokes) {
    for (const stroke of strokes) {
      if (stroke && stroke.active !== false) {
        renderStroke(ctx, stroke);
        renderedIds.add(stroke.id);
      }
    }
  }

  // Render draft preview if not already in strokes
  if (draft && draft.active !== false && !renderedIds.has(draft.id)) {
    renderStroke(ctx, draft);
  }

  // Render selection highlights
  if (selectedIds && selectedIds.length && strokes) {
    for (const stroke of strokes) {
      if (selectedIds.includes(stroke.id) && stroke.active !== false) {
        const bounds = getElementBounds(stroke);
        renderSelectionBox(ctx, bounds);
      }
    }
  }
}
