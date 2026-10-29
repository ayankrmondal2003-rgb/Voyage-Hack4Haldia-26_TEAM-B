import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApp } from '../src/app.js';

test('AI Roadmap & Idea Generator endpoint (/api/ai/generate)', async t => {
  const app = createApp();
  const server = createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(() => server.close());

  // Test 1: Generates a 5-phase roadmap for preset
  const res1 = await fetch(`${base}/api/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: 'fullstack web development', mode: 'roadmap' })
  });
  assert.equal(res1.status, 200);
  const data1 = await res1.json();
  assert.equal(data1.ok, true);
  assert.equal(data1.plan.mode, 'roadmap');
  assert.equal(Array.isArray(data1.plan.phases), true);
  assert.equal(data1.plan.phases.length, 5);
  assert.equal(typeof data1.plan.phases[0].title, 'string');
  assert.equal(Array.isArray(data1.plan.phases[0].tasks), true);

  // Test 2: Generates a mindmap idea brainstorm
  const res2 = await fetch(`${base}/api/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: 'Autonomous Drone', mode: 'mindmap' })
  });
  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  assert.equal(data2.ok, true);
  assert.equal(data2.plan.mode, 'mindmap');
  assert.equal(typeof data2.plan.center.title, 'string');
  assert.equal(Array.isArray(data2.plan.satellites), true);
  assert.equal(data2.plan.satellites.length, 4);

  // Test 3: Generates custom open-ended topic roadmap
  const res3 = await fetch(`${base}/api/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: 'Coffee Shop Business Plan', mode: 'roadmap' })
  });
  assert.equal(res3.status, 200);
  const data3 = await res3.json();
  assert.equal(data3.ok, true);
  assert.equal(data3.plan.phases.length, 5);
});
