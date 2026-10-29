// Isolated, real MongoDB replica set for browser QA. Never used by npm start.
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const replica = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
const uri = replica.getUri('team_b_browser_test');
let child;
function start() {
 child = spawn(process.execPath, ['server/src/index.js'], {
   cwd: fileURLToPath(new URL('../../', import.meta.url)),
   env: { ...process.env, MONGODB_URI: uri, PORT: process.env.TEST_PORT || '3000' }, stdio: ['ignore','inherit','inherit'],
 });
}
start();
console.log('ISOLATED TEST DATABASE — temporary QA data. Type restart to restart only the backend.');
process.stdin.setEncoding('utf8');
process.stdin.on('data', text => {
 if (text.trim() === 'restart') { child.once('exit',start); child.kill('SIGTERM'); }
});
async function stop() { child?.kill('SIGTERM'); await replica.stop(); process.exit(); }
process.once('SIGINT',stop); process.once('SIGTERM',stop);

