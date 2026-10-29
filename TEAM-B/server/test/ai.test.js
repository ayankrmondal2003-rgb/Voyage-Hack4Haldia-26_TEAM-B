import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApp } from '../src/app.js';

test('AI Roadmap, Idea & Execution Generator endpoint (/api/ai/generate)', async t => {
  const app = createApp();
  const server = createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(() => server.close());

  // Test 1: Execution Blueprint mode ("How to execute that idea")
  const resExec = await fetch(`${base}/api/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: 'AI Whiteboard', mode: 'execution' })
  });
  assert.equal(resExec.status, 200);
  const dataExec = await resExec.json();
  assert.equal(dataExec.ok, true);
  assert.equal(dataExec.plan.mode, 'execution');
  assert.equal(Array.isArray(dataExec.plan.stages), true);
  assert.equal(dataExec.plan.stages.length, 5);
  assert.equal(dataExec.plan.stages[0].badge, '01');
  assert.equal(typeof dataExec.plan.stages[0].name, 'string');

  // Test 2: Ideation Studio mode ("Brainstorm breakthrough ideas")
  const resIdea = await fetch(`${base}/api/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: 'Fintech Payments', mode: 'ideation' })
  });
  assert.equal(resIdea.status, 200);
  const dataIdea = await resIdea.json();
  assert.equal(dataIdea.ok, true);
  assert.equal(dataIdea.plan.mode, 'ideation');
  assert.equal(Array.isArray(dataIdea.plan.ideas), true);
  assert.equal(dataIdea.plan.ideas.length, 4);

  // Test 3: Generates a 5-phase roadmap
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

  // Test 4: Generates a mindmap idea brainstorm
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
});
