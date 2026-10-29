import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'node:dns/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { createApp } from './app.js';
import { attachSocketServer } from './socket.js';
import { createModels } from './models.js';
import { createRoomStore, unavailableStore } from './storage/rooms.js';
import { createRoomService } from './services/roomState.js';
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });
// Optional process-local override for networks whose default resolver refuses Atlas SRV queries.
if (process.env.MONGODB_DNS_SERVERS) dns.setServers(process.env.MONGODB_DNS_SERVERS.split(',').map(value => value.trim()));
const origins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(value => value.trim()).filter(Boolean);
const connection = mongoose.createConnection();
const models = createModels(connection);
let initialized = false;
const databaseStore = createRoomStore(connection, models);
const unavailable = unavailableStore();
const store = {
 isReady: () => initialized && databaseStore.isReady(),
 ...Object.fromEntries(['create','get','add'].map(method => [method, (...args) => (initialized ? databaseStore : unavailable)[method](...args)])),
};
const rooms = createRoomService(store);
const server = createServer(createApp({ rooms, origins }));
const io = attachSocketServer(server, origins, rooms);
let retry;
async function connectDatabase() {
 if (!process.env.MONGODB_URI) {
   console.error('MONGODB_URI is missing. Add it to server/.env and restart. Room APIs return 503; no memory fallback.');
   return;
 }
 try {
   if (connection.readyState !== 1) await connection.openUri(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000, socketTimeoutMS: 15000, maxPoolSize: 10 });
   const hello = await connection.db.admin().command({ hello: 1 });
   if (!hello.setName && hello.msg !== 'isdbgrid') throw new Error('ReplicaSetRequired');
   await models.Room.init();
   await models.Stroke.init();
   initialized = true;
   console.log('MongoDB ready; transactional room storage enabled.');
 } catch (error) {
   // Never log a URI or driver message that may contain credentials.
   console.error('MongoDB initialization failed (' + error.name + '). Check URI, Atlas access list, and replica-set support. Retrying in 10 seconds.');
   retry = setTimeout(connectDatabase, 10000);
 }
}
connection.on('error', () => console.error('MongoDB connection error; unsaved commits will be retried by clients.'));
connection.on('disconnected', () => console.warn('MongoDB disconnected; room operations are unavailable.'));
const port = Number(process.env.PORT || 3000);
server.listen(port, () => console.log('TEAM-B API running at http://localhost:' + port));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
void connectDatabase();
async function shutdown() { clearTimeout(retry); io.close(); server.close(); await connection.close(); }
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);

