export const ROOM_ID = /^[a-f0-9]{12}$/;
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const MAX_POINTS = 2000;
export const PREVIEW_MS = 40;
export const MAX_COORD = 100000;
export const VALID_TYPES = ['pen', 'rectangle', 'ellipse', 'line', 'arrow', 'text'];

export function problem(message, code = 'INVALID_INPUT', status = 400) {
  return Object.assign(new Error(message), { code, status });
}

export function validateStroke(value, roomId, authorId) {
  if (!value || typeof value !== 'object' || !UUID.test(value.id || '') ||
      value.roomId !== roomId || value.authorId !== authorId || value.tool !== 'pen' ||
      !/^#[0-9a-f]{6}$/i.test(value.color || '') || !Number.isFinite(value.width) ||
      value.width < 1 || value.width > 24 || !Array.isArray(value.points) ||
      !value.points.length || value.points.length > MAX_POINTS ||
      typeof value.createdAt !== 'string' || !Number.isFinite(Date.parse(value.createdAt))) {
    throw problem('Invalid stroke. Use a UUID, pen, hex color, width 1–24 and 1–2000 points.');
  }
  if (!value.points.every(point => Array.isArray(point) && point.length === 2 &&
      point.every(number => Number.isFinite(number) && Math.abs(number) <= MAX_COORD))) {
    throw problem('Stroke coordinates must be finite [x, y] pairs within board bounds.');
  }
  return { id: value.id, roomId, authorId, tool: 'pen', color: value.color,
    width: value.width, points: value.points.map(point => [...point]), createdAt: new Date(value.createdAt).toISOString() };
}

export function validateElement(value, roomId, authorId) {
  if (!value || typeof value !== 'object' || !UUID.test(value.id || '') ||
      value.roomId !== roomId || value.authorId !== authorId) {
    throw problem('Invalid element. Must have a valid UUID, roomId, and authorId.');
  }

  const type = value.type || value.tool || 'pen';
  if (!VALID_TYPES.includes(type)) {
    throw problem(`Invalid element type: ${type}.`);
  }

  const color = value.color || value.strokeColor || '#000000';
  if (!/^#[0-9a-f]{6}$/i.test(color)) {
    throw problem('Invalid color format. Hex format #RRGGBB required.');
  }

  const width = Number.isFinite(value.width) ? value.width : Number.isFinite(value.strokeWidth) ? value.strokeWidth : 3;
  if (width < 1 || width > 32) {
    throw problem('Stroke width must be between 1 and 32.');
  }

  if (typeof value.createdAt !== 'string' || !Number.isFinite(Date.parse(value.createdAt))) {
    throw problem('Invalid createdAt timestamp.');
  }

  const points = Array.isArray(value.points) ? value.points : [];
  if (points.length && !points.every(p => Array.isArray(p) && p.length === 2 &&
      p.every(n => Number.isFinite(n) && Math.abs(n) <= MAX_COORD))) {
    throw problem('Coordinates must be finite numbers within board bounds.');
  }

  return {
    id: value.id,
    roomId,
    authorId,
    tool: type,
    type,
    color,
    width,
    strokeColor: color,
    strokeWidth: width,
    fillColor: typeof value.fillColor === 'string' ? value.fillColor : 'transparent',
    x: Number.isFinite(value.x) ? value.x : (points[0]?.[0] ?? 0),
    y: Number.isFinite(value.y) ? value.y : (points[0]?.[1] ?? 0),
    w: Number.isFinite(value.w) ? value.w : Number.isFinite(value.widthVal) ? value.widthVal : 0,
    h: Number.isFinite(value.h) ? value.h : Number.isFinite(value.heightVal) ? value.heightVal : 0,
    text: typeof value.text === 'string' ? value.text.slice(0, 1000) : '',
    fontSize: Number.isFinite(value.fontSize) ? value.fontSize : 18,
    points: points.map(p => [...p]),
    createdAt: new Date(value.createdAt).toISOString(),
    active: value.active !== false
  };
}

export function sameStroke(a, b) {
  return ['id','roomId','authorId','tool','color','width','createdAt'].every(key => a[key] === b[key]) &&
    JSON.stringify(a.points) === JSON.stringify(b.points);
}

export function userProfile(userId) {
  const colors = ['#2563eb','#be185d','#7c3aed','#0f766e','#b45309','#4338ca','#ea580c','#059669'];
  const number = parseInt(userId.slice(0, 8), 16);
  return { userId, name: 'Maker ' + userId.slice(0, 4), color: colors[number % colors.length] };
}
