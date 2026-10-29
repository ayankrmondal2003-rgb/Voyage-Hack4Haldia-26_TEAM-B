import { Router } from 'express';
export function roomRoutes(store) {
  const router = Router();
  router.post('/', async (req, res, next) => {
    try {
      const body = req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ error: 'Expected a JSON object.' });
      const name = body.name === undefined ? 'Untitled whiteboard' : body.name;
      if (typeof name !== 'string' || !name.trim() || name.trim().length > 80) return res.status(400).json({ error: 'Room name must contain 1–80 characters.' });
      const room = await store.create(name.trim());
      res.status(201).location('/api/rooms/' + room.roomId).json(room);
    } catch (error) { next(error); }
  });
  router.get('/:id', async (req, res, next) => {
    try {
      if (!/^[a-f0-9]{12}$/.test(req.params.id)) return res.status(400).json({ error: 'Room ID must be 12 lowercase hexadecimal characters.' });
      const room = await store.get(req.params.id);
      if (!room) return res.status(404).json({ error: 'Room not found. Check the room ID or create a new room.' });
      res.json(room);
    } catch (error) { next(error); }
  });
  return router;
}
