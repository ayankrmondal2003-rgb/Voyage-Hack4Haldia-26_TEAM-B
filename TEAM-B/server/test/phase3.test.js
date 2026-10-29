import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { io } from 'socket.io-client';
import { createApp } from '../src/app.js';
import { createModels } from '../src/models.js';
import { createRoomStore } from '../src/storage/rooms.js';
import { createRoomService } from '../src/services/roomState.js';
import { attachSocketServer } from '../src/socket.js';
import { getElementBounds, hitTestElement } from '../../client/src/drawing/render.js';

const once = (socket, event) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => { socket.off(event, listener); reject(new Error('Timed out waiting for ' + event)); }, 10000);
  function listener(value) { clearTimeout(timer); resolve(value); }
  socket.once(event, listener);
});
const emit = (socket, event, data) => socket.timeout(10000).emitWithAck(event, data);

test('Phase 3 — Unified Elements, Undo/Redo & Multiplayer Persistence', { timeout: 120000 }, async t => {
  const replica = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  t.after(() => replica.stop());
  const uri = replica.getUri('team_b_phase3');

  const connection = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 }).asPromise();
  const models = createModels(connection);
  await models.Room.init();
  await models.Stroke.init();
  const service = createRoomService(createRoomStore(connection, models));
  const server = createServer(createApp({ rooms: service }));
  const sockets = attachSocketServer(server, ['http://localhost:5173'], service);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;

  const clients = [];
  t.after(async () => {
    clients.forEach(c => c.disconnect());
    await new Promise(r => sockets.close(r));
    await connection.close();
  });

  async function client(userId = randomUUID()) {
    const socket = io(base, { auth: { userId }, autoConnect: false, reconnection: false, transports: ['websocket'] });
    const connected = once(socket, 'connect');
    socket.connect();
    await connected;
    socket.userId = userId;
    clients.push(socket);
    return socket;
  }

  // 1. Create a room
  const created = await (await fetch(base + '/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Phase 3 Test Room' })
  })).json();
  const roomId = created.roomId;

  // 2. Connect User A and User B
  const userA = await client();
  const userB = await client();
  await emit(userA, 'room:join', { roomId });
  await emit(userB, 'room:join', { roomId });

  let rectId, textId;

  await t.test('1. Creation of Rectangle, Ellipse, Line, Arrow, and Text elements', async () => {
    rectId = randomUUID();
    const rect = {
      id: rectId,
      roomId,
      authorId: userA.userId,
      tool: 'rectangle',
      type: 'rectangle',
      color: '#2563eb',
      width: 4,
      fillColor: '#fef08a',
      x: 50,
      y: 50,
      w: 120,
      h: 80,
      points: [[50, 50], [170, 130]],
      createdAt: new Date().toISOString()
    };

    textId = randomUUID();
    const textElem = {
      id: textId,
      roomId,
      authorId: userA.userId,
      tool: 'text',
      type: 'text',
      color: '#000000',
      width: 1,
      fontSize: 24,
      text: 'Excalidraw in Team-B',
      x: 200,
      y: 100,
      points: [[200, 100]],
      createdAt: new Date().toISOString()
    };

    const addedB1 = once(userB, 'stroke:added');
    const ack1 = await emit(userA, 'element:create', { roomId, element: rect });
    assert.equal(ack1.ok, true);
    assert.equal(ack1.stroke.version, 1);
    assert.equal((await addedB1).stroke.id, rect.id);

    const addedB2 = once(userB, 'stroke:added');
    const ack2 = await emit(userA, 'element:create', { roomId, element: textElem });
    assert.equal(ack2.ok, true);
    assert.equal(ack2.stroke.version, 2);
    assert.equal((await addedB2).stroke.text, 'Excalidraw in Team-B');

    // Verify persisted in MongoDB
    const count = await models.Stroke.countDocuments({ roomId, active: true });
    assert.equal(count, 2);
  });

  await t.test('2. Element Update (Moving shape or modifying text)', async () => {
    const updatedB = once(userB, 'element:updated');
    const ack = await emit(userA, 'element:update', {
      roomId,
      id: rectId,
      updates: { x: 90, y: 90, points: [[90, 90], [210, 170]] }
    });
    assert.equal(ack.ok, true);
    assert.equal(ack.version, 3);
    const event = await updatedB;
    assert.equal(event.stroke.x, 90);
    assert.equal(event.version, 3);

    // Verify in DB
    const dbDoc = await models.Stroke.findOne({ roomId, strokeId: rectId });
    assert.equal(dbDoc.x, 90);
    assert.equal(dbDoc.version, 3);
  });

  await t.test('3. Element Deletion (Eraser / Delete key)', async () => {
    const deletedB = once(userB, 'element:deleted');
    const ack = await emit(userA, 'element:delete', { roomId, id: textId });
    assert.equal(ack.ok, true);
    assert.equal(ack.version, 4);

    const event = await deletedB;
    assert.equal(event.strokeId, textId);
    assert.equal(event.version, 4);

    // Active strokes in room snapshot should now be 1
    const snapshot = await service.get(roomId);
    assert.equal(snapshot.strokes.length, 1);
    assert.equal(snapshot.strokes[0].id, rectId);
  });

  await t.test('4. Element Restoration (Undo deletion)', async () => {
    const restoredB = once(userB, 'element:restored');
    const ack = await emit(userA, 'element:restore', { roomId, id: textId });
    assert.equal(ack.ok, true);
    assert.equal(ack.version, 5);

    const event = await restoredB;
    assert.equal(event.stroke.id, textId);
    assert.equal(event.version, 5);

    const snapshot = await service.get(roomId);
    assert.equal(snapshot.strokes.length, 2);
  });

  await t.test('5. Late joiners receive updated/restored board accurately', async () => {
    const userC = await client();
    const statePromise = once(userC, 'room:state');
    await emit(userC, 'room:join', { roomId });
    const snapshot = await statePromise;
    assert.equal(snapshot.version, 5);
    assert.equal(snapshot.strokes.length, 2);

    const rectElement = snapshot.strokes.find(s => s.id === rectId);
    const textElement = snapshot.strokes.find(s => s.id === textId);
    assert.ok(rectElement);
    assert.ok(textElement);
    assert.equal(rectElement.x, 90);
    assert.equal(textElement.text, 'Excalidraw in Team-B');
  });

  await t.test('6. Hit testing and element bounding box calculation', async () => {
    const rect = {
      id: 'rect-1',
      tool: 'rectangle',
      x: 100,
      y: 100,
      points: [[100, 100], [200, 180]]
    };
    const bounds = getElementBounds(rect);
    assert.equal(bounds.minX, 100);
    assert.equal(bounds.minY, 100);
    assert.equal(bounds.width, 100);
    assert.equal(bounds.height, 80);

    // Inside point hits
    assert.equal(hitTestElement([150, 140], rect), true);
    // Far point misses
    assert.equal(hitTestElement([300, 300], rect), false);

    // Line hit test
    const line = {
      id: 'line-1',
      tool: 'line',
      width: 4,
      points: [[0, 0], [100, 0]]
    };
    assert.equal(hitTestElement([50, 2], line), true);
    assert.equal(hitTestElement([50, 30], line), false);
  });
});
