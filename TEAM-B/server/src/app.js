import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { roomRoutes } from './routes/rooms.js';
import { unavailableStore } from './storage/rooms.js';
import { createRoomService } from './services/roomState.js';

export function createApp({ rooms = createRoomService(unavailableStore()), origins = ['http://localhost:5173', 'http://127.0.0.1:5173'] } = {}) {
  const app = express();
  app.use(cors({ origin: origins.includes('*') ? '*' : origins }));
  app.use(express.json({ limit: '16kb' }));

  // Both /health and /healthz supported for Render deployment
  app.get(['/health', '/healthz'], (_req, res) => res.status(rooms.isReady() ? 200 : 503).json({ 
    status: rooms.isReady() ? 'ok' : 'unavailable', 
    database: rooms.isReady() ? 'connected' : 'unavailable', 
    project: 'TEAM-B Live Whiteboard', 
    phase: 3 
  }));

  app.use('/api/rooms', roomRoutes(rooms));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found.' }));

  const client = fileURLToPath(new URL('../../client/dist/', import.meta.url));
  if (existsSync(client)) {
    app.use(express.static(client));
    app.get('*', (_req, res) => res.sendFile(path.join(client, 'index.html')));
  }

  app.use((error, _req, res, _next) => {
    const status = error.status || 503;
    if (!error.status) console.error('Database request failed:', error.name);
    res.status(status).json({ 
      error: status === 413 ? 'Request body is too large.' : status === 400 ? 'Invalid JSON body.' : error.status ? error.message : 'Database unavailable. Please retry shortly.' 
    });
  });

  return app;
}
