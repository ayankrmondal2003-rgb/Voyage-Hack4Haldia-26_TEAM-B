import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { io } from 'socket.io-client';
import { createApp } from '../src/app.js';
import { createModels } from '../src/models.js';
import { createRoomStore, unavailableStore } from '../src/storage/rooms.js';
import { createRoomService } from '../src/services/roomState.js';
import { attachSocketServer } from '../src/socket.js';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const once = (socket, event) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => { socket.off(event, listener); reject(new Error('Timed out: ' + event)); }, 10000);
  function listener(value) { clearTimeout(timer); resolve(value); }
  socket.once(event, listener);
});
const emit = (socket, event, data) => socket.timeout(10000).emitWithAck(event, data);
const makeStroke = (roomId, authorId) => ({ id: randomUUID(), roomId, authorId, tool:'pen', color:'#2563eb', width:4, points:[[10,20],[30,40]], createdAt:new Date().toISOString() });

test('MongoDB multiplayer acceptance A–I', { timeout: 240000 }, async t => {
  const replica = await MongoMemoryReplSet.create({ replSet: { count:1, storageEngine:'wiredTiger' } });
  t.after(() => replica.stop());
  const uri = replica.getUri('team_b_test');
  let connection, models, service, server, sockets, base;
  const clients=[];
  async function start() {
    connection = await mongoose.createConnection(uri, { serverSelectionTimeoutMS:5000 }).asPromise();
    models=createModels(connection);
    await models.Room.init(); await models.Stroke.init();
    service=createRoomService(createRoomStore(connection,models));
    server=createServer(createApp({rooms:service}));
    sockets=attachSocketServer(server,['http://localhost:5173'],service);
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    base='http://127.0.0.1:' + server.address().port;
  }
  async function stop() { clients.forEach(client=>client.disconnect()); await new Promise(resolve=>sockets.close(resolve)); await connection.close(); }
  await start(); t.after(stop);
  async function client(userId=randomUUID()) {
    const socket=io(base,{auth:{userId},autoConnect:false,reconnection:false,transports:['websocket']});
    const connected=once(socket,'connect');socket.connect();await connected;
    socket.testUserId=userId;clients.push(socket);return socket;
  }
  async function join(socket,roomId) {
    const state=once(socket,'room:state');
    assert.equal((await emit(socket,'room:join',{roomId})).ok,true);
    return state;
  }
  let room, other;
  await t.test('A: create room is persisted, REST validation and readiness', async()=>{
    assert.equal((await fetch(base+'/health')).status,200);
    const created=await fetch(base+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json',Origin:'http://localhost:5173'},body:'{"name":" Design jam "}'});
    assert.equal(created.status,201);assert.equal(created.headers.get('access-control-allow-origin'),'http://localhost:5173');
    room=await created.json();assert.equal(room.name,'Design jam');assert.equal(room.version,0);
    assert.ok(await models.Room.findOne({roomId:room.roomId}));
    assert.deepEqual(await (await fetch(base+'/api/rooms/'+room.roomId)).json(),room);
    other=await service.create('Isolated');
    for(const body of ['{"name":""}','{"name":4}','[]','{broken','{"name":"'+'a'.repeat(81)+'"}']) {
      assert.equal((await fetch(base+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json'},body})).status,400);
    }
    assert.equal((await fetch(base+'/api/rooms/invalid')).status,400);
    assert.equal((await fetch(base+'/api/rooms/000000000000')).status,404);
    assert.equal((await fetch(base+'/api/unknown')).status,404);
    assert.equal((await fetch(base+'/health',{headers:{Origin:'https://bad.invalid'}})).headers.get('access-control-allow-origin'),null);
  });
  const a=await client(), b=await client(), outsider=await client();
  await join(a,room.roomId);await join(b,room.roomId);await join(outsider,other.roomId);
  const seenA=[],seenB=[],isolated=[];
  a.on('stroke:added',event=>seenA.push(event)); b.on('stroke:added',event=>seenB.push(event)); outsider.on('stroke:added',event=>isolated.push(event));
  const first=makeStroke(room.roomId,a.testUserId), second=makeStroke(room.roomId,b.testUserId);
  await t.test('B: bidirectional preview, cursor and durable commit',async()=>{
    const preview=once(b,'stroke:preview');
    assert.equal((await emit(a,'stroke:preview',{roomId:room.roomId,stroke:first})).ok,true);
    assert.equal((await preview).stroke.id,first.id);
    const cursor=once(b,'cursor:move');
    await emit(a,'cursor:move',{roomId:room.roomId,position:[20,30]});
    assert.deepEqual((await cursor).position,[20,30]);
    const added=once(b,'stroke:added');
    const result=await emit(a,'stroke:commit',{roomId:room.roomId,stroke:first});
    assert.equal(result.ok,true);assert.equal(result.stroke.version,1);
    assert.equal(await models.Stroke.countDocuments({roomId:room.roomId}),1);
    assert.equal((await added).stroke.id,first.id);
    const back=once(a,'stroke:added');
    assert.equal((await emit(b,'stroke:commit',{roomId:room.roomId,stroke:second})).ok,true);
    assert.equal((await back).stroke.id,second.id);
  });
  await t.test('C: room isolation and membership enforcement',async()=>{
    const denied=await emit(outsider,'stroke:commit',{roomId:room.roomId,stroke:makeStroke(room.roomId,outsider.testUserId)});
    assert.equal(denied.ok,false);assert.equal(denied.error.code,'NOT_JOINED');
    assert.equal((await emit(a,'cursor:move',{roomId:other.roomId,position:[0,0]})).ok,false);
    await delay(50);assert.deepEqual(isolated,[]);
  });
  await t.test('D: late join and snapshot/commit race cannot lose a stroke',async()=>{
    const c=await client();
    const state=await join(c,room.roomId);
    assert.equal(state.version,2);assert.equal(state.strokes.length,2);
    const d=await client(); const events=[];d.on('stroke:added',event=>events.push(event.stroke));
    const third=makeStroke(room.roomId,a.testUserId);
    const [snapshot,commit]=await Promise.all([join(d,room.roomId),emit(a,'stroke:commit',{roomId:room.roomId,stroke:third})]);
    await delay(50);
    assert.equal(commit.ok,true);
    const all=new Set([...snapshot.strokes,...events].map(stroke=>stroke.id));
    assert.equal(all.size,3);assert.ok(all.has(third.id));
  });
  await t.test('E/F: refresh, disconnected peer catches up and duplicate retry is idempotent',async()=>{
    b.disconnect();
    const stroke=makeStroke(room.roomId,a.testUserId);
    assert.equal((await emit(a,'stroke:commit',{roomId:room.roomId,stroke})).ok,true);
    const refreshed=await client(b.testUserId);
    assert.equal((await join(refreshed,room.roomId)).strokes.length,4);
    const retry=await emit(a,'stroke:commit',{roomId:room.roomId,stroke:first});
    assert.equal(retry.ok,true);assert.equal(retry.duplicate,true);
    assert.equal((await service.get(room.roomId)).version,4);
    const conflict=await emit(a,'stroke:commit',{roomId:room.roomId,stroke:{...first,color:'#000000'}});
    assert.equal(conflict.error.code,'ID_CONFLICT');
  });
  await t.test('H: simultaneous commits preserve ordered versions',async()=>{
    const x=await client();await join(x,room.roomId);
    const [one,two]=await Promise.all([
      emit(a,'stroke:commit',{roomId:room.roomId,stroke:makeStroke(room.roomId,a.testUserId)}),
      emit(x,'stroke:commit',{roomId:room.roomId,stroke:makeStroke(room.roomId,x.testUserId)})]);
    assert.equal(one.ok,true);assert.equal(two.ok,true);
    const state=await service.get(room.roomId);
    assert.deepEqual(state.strokes.map(stroke=>stroke.version),[1,2,3,4,5,6]);
    assert.deepEqual(seenA.map(event=>event.version),[1,2,3,4,5,6]);
  });
  await t.test('I: nonexistent rooms, malformed strokes, identity and bounds',async()=>{
    const invalid=await client();
    assert.equal((await emit(invalid,'room:join',{roomId:'ffffffffffff'})).error.code,'ROOM_NOT_FOUND');
    assert.equal((await emit(invalid,'room:join',{roomId:'bad'})).ok,false);
    await join(invalid,room.roomId);
    for(const change of [{points:[]},{points:[[NaN,0]]},{points:[[100001,0]]},{points:Array.from({length:2001},()=>[0,0])},{authorId:a.testUserId},{width:100},{color:'red'},{tool:'text'},{createdAt:'bad'}]) {
      const result=await emit(invalid,'stroke:commit',{roomId:room.roomId,stroke:{...makeStroke(room.roomId,invalid.testUserId),...change}});
      assert.equal(result.ok,false);
    }
    assert.equal((await service.get(room.roomId)).version,6);
  });
  await t.test('presence groups tabs by user and removes disconnected sessions',async()=>{
    const twin=await client(a.testUserId);
    const presence=once(a,'presence:update');
    await join(twin,room.roomId);
    assert.equal((await presence).users.find(user=>user.userId===a.testUserId).sessions,2);
    const left=once(a,'presence:update');twin.disconnect();
    assert.equal((await left).users.find(user=>user.userId===a.testUserId).sessions,1);
  });
  await t.test('G: new backend and database connection recover persisted rooms and strokes',async()=>{
    await stop();await start();
    const state=await (await fetch(base+'/api/rooms/'+room.roomId)).json();
    assert.equal(state.strokes.length,6);assert.equal(state.version,6);
    const reconnected=await client(a.testUserId);
    assert.equal((await join(reconnected,room.roomId)).strokes.length,6);
    assert.equal((await emit(reconnected,'stroke:commit',{roomId:room.roomId,stroke:first})).duplicate,true);
    assert.equal(await models.Stroke.countDocuments({roomId:room.roomId}),6);
  });
  await t.test('database failure never acknowledges a successful save',async()=>{
    const user=await client();await join(user,room.roomId);
    await connection.close();
    const result=await emit(user,'stroke:commit',{roomId:room.roomId,stroke:makeStroke(room.roomId,user.testUserId)});
    assert.equal(result.ok,false);assert.equal(result.error.retryable,true);
    assert.equal((await fetch(base+'/health')).status,503);
  });
});
test('no MongoDB configuration means explicit 503, never memory persistence',async t=>{
 const server=createServer(createApp({rooms:createRoomService(unavailableStore())}));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>server.close());
 const base='http://127.0.0.1:'+server.address().port;
 assert.equal((await fetch(base+'/health')).status,503);
 const response=await fetch(base+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
 assert.equal(response.status,503);assert.match((await response.json()).error,/MONGODB_URI/);
});

