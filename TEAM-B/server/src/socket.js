import { Server } from 'socket.io';
import { ROOM_ID, UUID, validateStroke, validateElement, problem, userProfile } from '../../shared/protocol.js';

export function attachSocketServer(server, origins, rooms) {
  const io = new Server(server, {
    cors: { origin: origins }, maxHttpBufferSize: 128 * 1024,
    allowRequest: (req, done) => done(null, !req.headers.origin || origins.includes(req.headers.origin)),
  });
  const members = new Map();
  const channel = id => 'board:' + id;

  function presence(roomId) {
    const sessions = [...(members.get(roomId)?.values() || [])];
    const users = new Map();
    for (const user of sessions) {
      const existing = users.get(user.userId);
      if (existing) existing.sessions++;
      else users.set(user.userId, { ...user, sessions: 1 });
    }
    io.to(channel(roomId)).emit('presence:update', { roomId, users: [...users.values()], sessions: sessions.length });
  }

  function leave(socket) {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    socket.data.roomId = null;
    socket.leave(channel(roomId));
    members.get(roomId)?.delete(socket.id);
    socket.to(channel(roomId)).emit('cursor:move', { roomId, sessionId: socket.id, position: null });
    socket.to(channel(roomId)).emit('stroke:preview', { roomId, sessionId: socket.id, stroke: null });
    presence(roomId);
    if (!members.get(roomId)?.size) members.delete(roomId);
  }

  io.use((socket, next) => {
    if (!UUID.test(socket.handshake.auth?.userId || '')) return next(new Error('A stable anonymous UUID is required.'));
    socket.data.user = userProfile(socket.handshake.auth.userId);
    next();
  });

  io.on('connection', socket => {
    const limits = new Map();
    function rate(event, max) {
      const now = Date.now();
      const entry = limits.get(event);
      if (!entry || now - entry.start >= 1000) { limits.set(event, { start: now, count: 1 }); return; }
      if (++entry.count > max) throw problem('Too many events. Retry shortly.', 'RATE_LIMITED', 429);
    }
    function member(roomId) {
      if (!socket.connected || !ROOM_ID.test(roomId || '') || socket.data.roomId !== roomId || !socket.rooms.has(channel(roomId))) {
        throw problem('Join this room before sending events.', 'NOT_JOINED', 403);
      }
    }
    function errorPayload(error) {
      const known = Boolean(error.status);
      if (!known) console.error('Room operation failed:', error.name || 'Error');
      return { code: known ? error.code : 'DATABASE_UNAVAILABLE',
        message: known ? error.message : 'Could not save or load the board. Unsynced strokes will retry.',
        retryable: !known || error.status >= 500 || error.status === 429 };
    }
    function handle(event, max, callback) {
      socket.on(event, async (payload, ack) => {
        const reply = typeof ack === 'function' ? ack : () => {};
        try { rate(event, max); const result = await callback(payload); reply({ ok: true, ...result }); }
        catch (error) {
          const detail = errorPayload(error);
          reply({ ok: false, error: detail });
          if (!['stroke:preview','cursor:move'].includes(event)) socket.emit('room:error', detail);
        }
      });
    }

    let joining = false;
    let generation = 0;

    handle('room:join', 5, async payload => {
      if (!ROOM_ID.test(payload?.roomId || '')) throw problem('Invalid room ID.');
      if (joining) throw problem('Room join already in progress.', 'BUSY', 429);
      joining = true;
      const current = ++generation;
      try {
        leave(socket);
        await rooms.join(payload.roomId, async state => {
          if (!socket.connected || generation !== current) return;
          await socket.join(channel(payload.roomId));
          socket.data.roomId = payload.roomId;
          if (!members.has(payload.roomId)) members.set(payload.roomId, new Map());
          const peers = [...members.get(payload.roomId).values()];
          const sameUser = peers.find(user => user.userId === socket.data.user.userId);
          const palette = ['#2563eb','#be185d','#7c3aed','#0f766e','#b45309','#4338ca','#ea580c','#059669'];
          const usedColors = new Set(peers.map(user => user.color));
          socket.data.user.color = sameUser?.color ||
            (!usedColors.has(socket.data.user.color) ? socket.data.user.color :
              palette.find(color => !usedColors.has(color)) || 'hsl(' + ((usedColors.size * 137) % 360) + ' 65% 38%)');
          members.get(payload.roomId).set(socket.id, socket.data.user);
          socket.emit('room:state', state);
          presence(payload.roomId);
        });
      } finally { joining = false; }
    });

    handle('room:leave', 5, payload => { member(payload?.roomId); generation++; leave(socket); });

    handle('stroke:preview', 35, payload => {
      member(payload?.roomId);
      const stroke = payload.stroke === null ? null : (payload.stroke.type && payload.stroke.type !== 'pen' ? validateElement(payload.stroke, payload.roomId, socket.data.user.userId) : validateStroke(payload.stroke, payload.roomId, socket.data.user.userId));
      socket.to(channel(payload.roomId)).volatile.emit('stroke:preview', { roomId: payload.roomId, sessionId: socket.id, stroke });
    });

    handle('stroke:commit', 20, async payload => {
      member(payload?.roomId);
      const stroke = validateStroke(payload.stroke, payload.roomId, socket.data.user.userId);
      return rooms.commit(stroke, () => member(payload.roomId), saved => {
        io.to(channel(payload.roomId)).emit('stroke:added', { roomId: payload.roomId, version: saved.version, stroke: saved });
      });
    });

    handle('element:create', 25, async payload => {
      member(payload?.roomId);
      const element = validateElement(payload.element || payload.stroke, payload.roomId, socket.data.user.userId);
      return rooms.commit(element, () => member(payload.roomId), saved => {
        io.to(channel(payload.roomId)).emit('element:created', { roomId: payload.roomId, version: saved.version, element: saved });
        io.to(channel(payload.roomId)).emit('stroke:added', { roomId: payload.roomId, version: saved.version, stroke: saved });
      });
    });

    handle('element:update', 25, async payload => {
      member(payload?.roomId);
      const strokeId = payload.id || payload.strokeId;
      if (!UUID.test(strokeId || '')) throw problem('Invalid element ID.');
      return rooms.update(payload.roomId, strokeId, payload.updates || {}, () => member(payload.roomId), updated => {
        io.to(channel(payload.roomId)).emit('element:updated', { roomId: payload.roomId, version: updated.version, stroke: updated });
      });
    });

    handle('element:delete', 25, async payload => {
      member(payload?.roomId);
      const strokeId = payload.id || payload.strokeId;
      if (!UUID.test(strokeId || '')) throw problem('Invalid element ID.');
      return rooms.delete(payload.roomId, strokeId, () => member(payload.roomId), result => {
        io.to(channel(payload.roomId)).emit('element:deleted', { roomId: payload.roomId, version: result.version, strokeId });
      });
    });

    handle('element:restore', 25, async payload => {
      member(payload?.roomId);
      const strokeId = payload.id || payload.strokeId;
      if (!UUID.test(strokeId || '')) throw problem('Invalid element ID.');
      return rooms.restore(payload.roomId, strokeId, () => member(payload.roomId), restored => {
        io.to(channel(payload.roomId)).emit('element:restored', { roomId: payload.roomId, version: restored.version, stroke: restored });
      });
    });

    handle('cursor:move', 35, payload => {
      member(payload?.roomId);
      const position = payload.position;
      if (position !== null && (!Array.isArray(position) || position.length !== 2 ||
        !position.every(value => Number.isFinite(value) && Math.abs(value) <= 100000))) throw problem('Invalid cursor.');
      socket.to(channel(payload.roomId)).volatile.emit('cursor:move', {
        roomId: payload.roomId, sessionId: socket.id, ...socket.data.user, position,
      });
    });

    socket.on('disconnecting', () => { generation++; leave(socket); });
  });
  return io;
}
