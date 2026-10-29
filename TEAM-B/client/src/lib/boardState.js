// Server strokes are unique by ID; newer deltas survive an older snapshot.
export function applySnapshot(current, snapshot) {
  const byId = new Map(snapshot.strokes.map(stroke => [stroke.id, stroke]));
  for (const stroke of current.strokes) if (stroke.version > snapshot.version) byId.set(stroke.id, stroke);
  return { version: Math.max(current.version, snapshot.version),
    strokes: [...byId.values()].sort((a, b) => a.version - b.version) };
}
export function applyAdded(current, stroke) {
  const byId = new Map(current.strokes.map(item => [item.id, item]));
  byId.set(stroke.id, stroke);
  return { version: Math.max(current.version, stroke.version),
    strokes: [...byId.values()].sort((a, b) => a.version - b.version) };
}

