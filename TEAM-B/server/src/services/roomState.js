import { problem } from '../../../shared/protocol.js';

export function createRoomService(store) {
  const queues = new Map();
  const depths = new Map();

  function ordered(roomId, operation) {
    const depth = depths.get(roomId) || 0;
    if (depth >= 100) return Promise.reject(problem('Room is busy. Retry shortly.', 'BUSY', 429));
    depths.set(roomId, depth + 1);
    const previous = queues.get(roomId) || Promise.resolve();
    const result = previous.catch(() => {}).then(operation);
    const tail = result.catch(() => {});
    queues.set(roomId, tail);
    tail.finally(() => {
      const count = (depths.get(roomId) || 1) - 1;
      if (count) depths.set(roomId, count); else depths.delete(roomId);
      if (queues.get(roomId) === tail) queues.delete(roomId);
    });
    return result;
  }

  return {
    isReady: () => store.isReady(),
    create: name => store.create(name),
    get: roomId => ordered(roomId, () => store.get(roomId)),
    join: (roomId, deliver) => ordered(roomId, async () => {
      const state = await store.get(roomId);
      if (!state) throw problem('Room not found.', 'ROOM_NOT_FOUND', 404);
      await deliver(state);
    }),
    commit: (stroke, authorize, publish) => ordered(stroke.roomId, async () => {
      authorize();
      const result = await store.add(stroke);
      if (!result.duplicate) publish(result.stroke);
      return result;
    }),
    update: (roomId, strokeId, updates, authorize, publish) => ordered(roomId, async () => {
      authorize();
      const result = await store.update(roomId, strokeId, updates);
      publish(result.stroke);
      return result;
    }),
    delete: (roomId, strokeId, authorize, publish) => ordered(roomId, async () => {
      authorize();
      const result = await store.delete(roomId, strokeId);
      publish(result);
      return result;
    }),
    restore: (roomId, strokeId, authorize, publish) => ordered(roomId, async () => {
      authorize();
      const result = await store.restore(roomId, strokeId);
      publish(result.stroke);
      return result;
    }),
  };
}
