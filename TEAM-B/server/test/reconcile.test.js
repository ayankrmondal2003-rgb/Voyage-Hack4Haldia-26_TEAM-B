import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAdded, applySnapshot } from '../../client/src/lib/boardState.js';
import { readOutbox, writeOutbox } from '../../client/src/lib/outbox.js';
import { randomUUID } from 'node:crypto';
test('snapshot/delta races and duplicate echoes converge without duplicates',()=>{
 const stroke={id:'a',version:1}, newer={id:'b',version:2};
 let state=applyAdded({version:0,strokes:[]},newer);
 state=applySnapshot(state,{version:1,strokes:[stroke]});
 state=applyAdded(state,newer);
 assert.equal(state.version,2);assert.deepEqual(state.strokes,[stroke,newer]);
 state=applySnapshot(state,{version:2,strokes:[stroke,newer]});
 assert.equal(state.strokes.length,2);
});
test('offline queue survives remount, isolates rooms and reports storage failure',()=>{
 const data=new Map();
 globalThis.sessionStorage={getItem:key=>data.get(key),setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
 const authorId=randomUUID(),roomId='123456abcdef';
 const stroke={id:randomUUID(),authorId,roomId,tool:'pen',color:'#000000',width:4,points:[[1,2]],createdAt:new Date().toISOString()};
 assert.equal(writeOutbox(roomId,authorId,[stroke]),true);
 assert.deepEqual(readOutbox(roomId,authorId),[stroke]);
 assert.deepEqual(readOutbox('abcdef123456',authorId),[]);
 writeOutbox(roomId,authorId,[]);assert.deepEqual(readOutbox(roomId,authorId),[]);
 globalThis.sessionStorage.setItem=()=>{throw new Error('Quota exceeded');};
 assert.equal(writeOutbox(roomId,authorId,[stroke]),false);
 delete globalThis.sessionStorage;
});

