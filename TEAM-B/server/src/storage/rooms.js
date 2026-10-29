import { randomBytes } from 'node:crypto';
import { problem, sameStroke } from '../../../shared/protocol.js';

function serializeStroke(doc) {
  return {
    id: doc.strokeId,
    roomId: doc.roomId,
    authorId: doc.authorId,
    tool: doc.tool,
    type: doc.tool,
    color: doc.color,
    strokeColor: doc.color,
    width: doc.width,
    strokeWidth: doc.width,
    points: doc.points || [],
    x: doc.x ?? 0,
    y: doc.y ?? 0,
    w: doc.w ?? 0,
    h: doc.h ?? 0,
    fillColor: doc.fillColor || 'transparent',
    text: doc.text || '',
    fontSize: doc.fontSize || 18,
    createdAt: doc.createdAt.toISOString(),
    version: doc.version,
    active: doc.active !== false
  };
}

export function createRoomStore(connection, { Room, Stroke }) {
  const ready = () => {
    if (connection.readyState !== 1) throw problem('Database unavailable. Your unsynced strokes will retry.', 'DATABASE_UNAVAILABLE', 503);
  };

  return {
    isReady: () => connection.readyState === 1,
    async create(name) {
      ready();
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const doc = await Room.create({ roomId: randomBytes(6).toString('hex'), name });
          return { roomId: doc.roomId, name: doc.name, version: 0, strokes: [],
            createdAt: doc.createdAt.toISOString(), updatedAt: doc.updatedAt.toISOString() };
        } catch (error) { if (error.code !== 11000 || attempt === 2) throw error; }
      }
    },
    async get(roomId) {
      ready();
      let result = null;
      await connection.transaction(async session => {
        const room = await Room.findOne({ roomId }).session(session).lean();
        if (!room) return;
        const strokes = await Stroke.find({ roomId, active: true, version: { $lte: room.version } })
          .sort({ version: 1 }).session(session).lean();
        result = { roomId, name: room.name, version: room.version, strokes: strokes.map(serializeStroke),
          createdAt: room.createdAt.toISOString(), updatedAt: room.updatedAt.toISOString() };
      }, { readConcern: { level: 'snapshot' }, readPreference: 'primary' });
      return result;
    },
    async add(stroke) {
      ready();
      let result;
      await connection.transaction(async session => {
        const existing = await Stroke.findOne({ roomId: stroke.roomId, strokeId: stroke.id }).session(session).lean();
        if (existing) {
          const saved = serializeStroke(existing);
          if (!sameStroke(saved, stroke)) throw problem('Stroke ID already exists with different content.', 'ID_CONFLICT', 409);
          result = { stroke: saved, duplicate: true };
          return;
        }
        const room = await Room.findOneAndUpdate({ roomId: stroke.roomId },
          { $inc: { version: 1 } }, { new: true, session });
        if (!room) throw problem('Room not found.', 'ROOM_NOT_FOUND', 404);
        const { id, type, strokeColor, strokeWidth, ...fields } = stroke;
        const [saved] = await Stroke.create([{ ...fields, strokeId: id, version: room.version, active: true }], { session });
        result = { stroke: serializeStroke(saved.toObject()), duplicate: false };
      }, { writeConcern: { w: 'majority' }, readConcern: { level: 'snapshot' }, maxCommitTimeMS: 10000 });
      return result;
    },
    async update(roomId, strokeId, updates) {
      ready();
      let result;
      await connection.transaction(async session => {
        const room = await Room.findOneAndUpdate({ roomId }, { $inc: { version: 1 } }, { new: true, session });
        if (!room) throw problem('Room not found.', 'ROOM_NOT_FOUND', 404);
        const allowed = ['x', 'y', 'w', 'h', 'points', 'color', 'width', 'fillColor', 'text', 'fontSize'];
        const fieldsToSet = { version: room.version };
        for (const key of allowed) {
          if (updates[key] !== undefined) fieldsToSet[key] = updates[key];
        }
        if (updates.strokeColor !== undefined) fieldsToSet.color = updates.strokeColor;
        if (updates.strokeWidth !== undefined) fieldsToSet.width = updates.strokeWidth;
        const updated = await Stroke.findOneAndUpdate(
          { roomId, strokeId },
          { $set: fieldsToSet },
          { new: true, session }
        );
        if (!updated) throw problem('Element not found.', 'NOT_FOUND', 404);
        result = { stroke: serializeStroke(updated.toObject()), version: room.version };
      }, { writeConcern: { w: 'majority' }, readConcern: { level: 'snapshot' }, maxCommitTimeMS: 10000 });
      return result;
    },
    async delete(roomId, strokeId) {
      ready();
      let result;
      await connection.transaction(async session => {
        const room = await Room.findOneAndUpdate({ roomId }, { $inc: { version: 1 } }, { new: true, session });
        if (!room) throw problem('Room not found.', 'ROOM_NOT_FOUND', 404);
        const deleted = await Stroke.findOneAndUpdate(
          { roomId, strokeId },
          { $set: { active: false, version: room.version } },
          { new: true, session }
        );
        if (!deleted) throw problem('Element not found.', 'NOT_FOUND', 404);
        result = { strokeId, version: room.version };
      }, { writeConcern: { w: 'majority' }, readConcern: { level: 'snapshot' }, maxCommitTimeMS: 10000 });
      return result;
    },
    async restore(roomId, strokeId) {
      ready();
      let result;
      await connection.transaction(async session => {
        const room = await Room.findOneAndUpdate({ roomId }, { $inc: { version: 1 } }, { new: true, session });
        if (!room) throw problem('Room not found.', 'ROOM_NOT_FOUND', 404);
        const restored = await Stroke.findOneAndUpdate(
          { roomId, strokeId },
          { $set: { active: true, version: room.version } },
          { new: true, session }
        );
        if (!restored) throw problem('Element not found.', 'NOT_FOUND', 404);
        result = { stroke: serializeStroke(restored.toObject()), version: room.version };
      }, { writeConcern: { w: 'majority' }, readConcern: { level: 'snapshot' }, maxCommitTimeMS: 10000 });
      return result;
    }
  };
}

export function unavailableStore() {
  const fail = async () => { throw problem('MongoDB is not configured or is unavailable. Set MONGODB_URI in server/.env.', 'DATABASE_UNAVAILABLE', 503); };
  return { create: fail, get: fail, add: fail, update: fail, delete: fail, restore: fail, isReady: () => false };
}
