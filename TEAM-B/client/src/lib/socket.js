import { io } from 'socket.io-client';
import { apiUrl } from './api.js';
export function createSocket(userId) {
  return io(apiUrl || undefined, { autoConnect: false, auth: { userId }, reconnectionDelayMax: 3000 });
}

