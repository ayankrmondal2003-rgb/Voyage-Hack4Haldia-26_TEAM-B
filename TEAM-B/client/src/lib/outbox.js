import { validateStroke } from '../../../shared/protocol.js';
const key = (roomId, userId) => 'team-b:outbox:' + roomId + ':' + userId;
export function readOutbox(roomId, userId) {
  try {
    const values = JSON.parse(sessionStorage.getItem(key(roomId, userId)) || '[]');
    if (!Array.isArray(values)) return [];
    return values.flatMap(value => {
      try { return [validateStroke(value, roomId, userId)]; } catch { return []; }
    });
  } catch { return []; }
}
export function writeOutbox(roomId, userId, strokes) {
  try {
    if (strokes.length) sessionStorage.setItem(key(roomId, userId), JSON.stringify(strokes));
    else sessionStorage.removeItem(key(roomId, userId));
    return true;
  } catch { return false; }
}

