import test from 'node:test';
import assert from 'node:assert/strict';
import { pointFromEvent, renderBoard } from '../../client/src/drawing/render.js';
test('canvas coordinates, high-DPI reconstruction, dots and smooth strokes', () => {
 const calls=[];
 const ctx=new Proxy({}, {get:(_target,key)=>(...args)=>calls.push([key,...args]),set:()=>true});
 const canvas={width:0,height:0,getBoundingClientRect:()=>({left:40,top:80,width:500,height:300}),getContext:()=>ctx};
 globalThis.window={devicePixelRatio:2};
 assert.deepEqual(pointFromEvent({clientX:70,clientY:120},canvas),[30,40]);
 const strokes=[{color:'#123456',width:4,points:[[3,5]]},{color:'#123456',width:8,points:[[1,2],[4,6],[7,8]]}];
 renderBoard(canvas,strokes);
 assert.equal(canvas.width,1000);assert.equal(canvas.height,600);
 assert.ok(calls.some(call=>call[0]==='arc'));
 assert.ok(calls.some(call=>call[0]==='quadraticCurveTo'));
 assert.deepEqual(calls[0],['setTransform',2,0,0,2,0,0]);
 calls.length=0;canvas.getBoundingClientRect=()=>({left:0,top:0,width:250,height:200});
 renderBoard(canvas,strokes);assert.equal(canvas.width,500);assert.equal(canvas.height,400);
 assert.equal(calls.filter(call=>call[0]==='beginPath').length,2);
 renderBoard(canvas,[]);assert.equal(calls.at(-1)[0],'clearRect');
 delete globalThis.window;
});


