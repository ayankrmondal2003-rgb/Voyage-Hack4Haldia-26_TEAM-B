# Phase 2 — multiplayer and persistent rooms

## Run locally

Node.js 22.12+ and npm are required. From the repository root:

```powershell
npm install
Copy-Item server/.env.example server/.env # first-time setup only; do not overwrite existing credentials
# Fill in MONGODB_URI in server/.env.
npm run dev:server
# In another terminal:
npm run dev:client
```

Frontend: http://127.0.0.1:5173. API: http://localhost:3000.
For production: `npm run build`, then `npm start`; Express serves the built frontend and Socket.IO on one port. Set `PORT` and `CORS_ORIGINS` for the deployed origin. For a separately hosted frontend, set public `VITE_API_URL` before building. Use HTTPS for browser UUID/clipboard support outside localhost. There is no public deployment yet.

## MongoDB Atlas

1. Create an Atlas cluster and database user with read/write access to the chosen application database.
2. Add the backend host's IP to Atlas Network Access.
3. Put the Atlas driver URI in `server/.env` as `MONGODB_URI`, including a database name such as `team_b_whiteboard`. URL-encode special password characters.
4. Configure `CORS_ORIGINS` (comma-separated exact origins). `CLIENT_URL` is the single-origin fallback.
5. Start the backend. Look for “MongoDB ready; transactional room storage enabled.” `GET /health` returns 200 only when storage is ready.

Atlas or a MongoDB replica set is required for transactions. Standalone MongoDB is intentionally not accepted. No MongoDB URI or credentials enter browser configuration or bundles. Missing/unavailable MongoDB returns 503; there is no silent in-memory fallback. Initial connection failures retry every 10 seconds. The driver handles reconnection after a later outage.

If the operating system resolver refuses Atlas SRV lookups with `querySrv ECONNREFUSED`, optional `MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8` changes DNS only in this Node process. It does not change Windows settings or TLS verification. The local environment needed this setting during verification.

## Architecture and files

- `shared/protocol.js`: common room IDs, UUIDs, stroke validation, limits, and anonymous profiles.
- `server/src/models.js`: Room and Stroke schemas, unique room ID, unique (roomId, strokeId), and unique (roomId, version) indexes.
- `server/src/storage/rooms.js`: Mongoose transaction adapter; storage must commit before an acknowledgment.
- `server/src/services/roomState.js`: per-room ordered operation queue.
- `server/src/socket.js`: room membership, broadcasts, rate limits, transient previews/cursors, and presence.
- `server/src/index.js`: environment, MongoDB lifecycle, indexes, HTTP/Socket.IO startup.
- `server/src/app.js`, `routes/rooms.js`: persistent REST contract and readiness.
- `client/src/hooks/useRoom.js`: socket lifecycle, authoritative strokes, previews, outbox retry, reconnect.
- `client/src/lib/identity.js`, `outbox.js`, `boardState.js`, `socket.js`: stable identity, pending queue storage, reconciliation, transport.
- `client/src/components/DrawingCanvas.jsx`: immediate local drawing and preview/complete callbacks.
- `Workspace.jsx`, `PresenceList.jsx`, `Toolbar.jsx`, `Home.jsx`, `styles.css`: integrated status, cursors, users, and Phase 2 labels.
- `client/src/drawing/render.js`: array-coordinate rendering and high-DPI reconstruction.
- `server/test/api.test.js`, `drawing.test.js`, `reconcile.test.js`: acceptance and regression checks.
- `server/scripts/local-test-server.js`: explicitly temporary, isolated real MongoDB harness for QA only.
- `server/package.json`, root lockfile, environment example, README, and ignore rules updated.

New runtime dependency: Mongoose 8.24.7. New development dependency: mongodb-memory-server 10.4.3. The latter downloads and starts a real MongoDB replica-set binary for tests; it is not used by normal application startup.

## Persistent contract

`GET /health`: 200 with `{status:"ok", database:"connected", phase:2,...}`; 503 while persistence is unavailable.

`POST /api/rooms`: accepts `{}` or `{name}`. Returns 201 and `{roomId,name,version:0,strokes:[],createdAt,updatedAt}`. Names are 1–80 trimmed characters.

`GET /api/rooms/:id`: returns the same metadata plus all persisted active strokes in version order. Malformed ID: 400. Unknown room: 404. Database unavailable: 503.

A completed stroke is immutable:

```json
{
  "id": "UUID-v4",
  "roomId": "12-character-hex-id",
  "authorId": "stable-anonymous-UUID-v4",
  "tool": "pen",
  "color": "#2563eb",
  "width": 4,
  "points": [[120,150],[125,155]],
  "createdAt": "ISO-timestamp",
  "version": 1
}
```

Clients supply all fields except version. MongoDB stores id as strokeId, plus active:true. Coordinates use board-local CSS pixels with a fixed top-left origin, independent of viewport width and device pixel ratio. A smaller viewport clips offscreen marks without changing their stored coordinates.

## Socket.IO events

Handshake: `auth: {userId: UUID-v4}`. Anonymous IDs are not authentication credentials. Knowing a room ID is permission to join this MVP's shared room.

| Event | Direction | Payload / behavior |
|---|---|---|
| room:join | Client → server | `{roomId}`; validate existence, join, deliver snapshot, publish presence |
| room:state | Server → joining client | Complete REST-shaped room snapshot with version |
| room:leave | Client → server | `{roomId}`; membership required |
| stroke:preview | Client → server | `{roomId,stroke}`; stroke may be null to clear |
| stroke:preview | Server → peers | `{roomId,sessionId,stroke}`; transient, not persisted |
| stroke:commit | Client → server | `{roomId,stroke}`; transactional persistence and acknowledgment |
| stroke:added | Server → room including author | `{roomId,version,stroke}` after persistence |
| cursor:move | Client → server | `{roomId,position:[x,y] or null}` |
| cursor:move | Server → peers | Adds `sessionId,userId,name,color`; null removes cursor |
| presence:update | Server → room | `{roomId,users:[{userId,name,color,sessions}],sessions}` |
| room:error | Server → client | `{code,message,retryable}` |

Client commands support acknowledgments: `{ok:true,...}` or `{ok:false,error:{code,message,retryable}}`. A commit success includes `stroke` and `duplicate`. Identical retries return the saved stroke without incrementing version or broadcasting again. Reusing an ID with changed content returns ID_CONFLICT.

## Correctness and recovery

A per-room queue serializes joins, snapshot delivery, commits, and broadcasts on one backend instance. Joining and snapshot emission complete before the next commit broadcasts. MongoDB transactions atomically increment Room.version and insert the Stroke with that version, with majority write acknowledgment. Transactional snapshots read consistent room/stroke data.

The React client renders optimistic local strokes immediately. Previews are sent about 25 times per second; final previews remain visible until saved strokes replace them. The server checks membership and author ID for every drawing/cursor event. Incoming deltas are deduplicated by stroke ID. Version gaps trigger a fresh snapshot; newer deltas survive an older snapshot.

On reconnect, the client rejoins, receives authoritative state, removes stale previews/cursors, and retries unsaved strokes. The server never clears a board on disconnect.

Completed unsynced strokes are kept in a per-room, per-user **sessionStorage outbox**. This is a retry queue, not the authoritative board. It survives refresh in the same tab; closing that tab may lose changes that have not reached MongoDB. Successful snapshot/commit confirmation removes the outbox entry. Permanent validation/conflict failures stay unsynced with an error; Retry retries intentionally. Storage quota/disabled storage produces an explicit warning. Incomplete pointer-cancelled strokes are finalized. Long gestures split into bounded immutable strokes.

Stable anonymous user IDs use localStorage. Multiple tabs from the same identity count as one user with multiple sessions. Disconnected sessions and cursors are removed; abandoned previews and cursors expire after five seconds. Cursor coordinates never reach MongoDB.

## Safeguards and limits

- Maximum 128 KiB Socket.IO message.
- 1–2000 finite coordinate pairs per stroke, coordinates within ±100,000, widths 1–24, pen only, six-digit hex colors.
- Per-socket limits: 35 previews/cursor events per second, 12 commits per second, five join/leave commands per second.
- At most 100 queued operations per room.
- Exact configured origins for browser connections, payload validation, membership checks before queueing and again before persistence.
- No successful acknowledgment or broadcast for failed persistence.
- Whole-room snapshots are sent only on join/resync, not on every pointer move.

## Verification executed — 29 October 2026

`npm test`: **15 tests passed**, using an isolated real MongoDB replica set. Coverage includes room creation stored in MongoDB, REST validation/CORS, bidirectional preview/commit/cursor events, room isolation and membership rejection, late joins concurrent with commits, disconnect/refresh-style new sessions, identical and conflicting retries, simultaneous commits and ordered versions, invalid payloads, grouped presence, backend/database-connection recreation, database failure, missing configuration, high-DPI rendering, snapshot/delta races, and outbox storage.

Browser verification against the configured **MongoDB Atlas** database used **Chrome and the in-app browser**, with different anonymous identities:
- Created a persistent room and drew from both browsers; both received the drawings.
- Both browsers displayed five strokes at version 5.
- Refreshed Chrome and joined from a third tab; all five strokes loaded.
- Stopped the real backend, drew a sixth stroke offline, and saw “1 unsynced”.
- Restarted the backend against the same Atlas database; automatic reconnect saved the queued stroke exactly once. Both browsers displayed six strokes at version 6.
- Reloaded the late-join tab after the restart.

`npm run build` passes. Dependency installation reported no vulnerabilities. No multi-machine public deployment or physically disconnected-device test was performed.

## Remaining scope / Phase 3

This MVP supports one backend process. Multiple processes require a shared ordering/event-distribution design, not just a Socket.IO adapter. Very large boards need snapshot pagination/checkpoints and viewport rendering; current snapshots load all strokes. Room IDs are shared access links; there is no authentication, ownership, or per-room permissions. Anonymous identity can be spoofed by a modified client and must not be treated as security identity.

Shared clear, eraser, undo/redo, shapes, and text remain disabled until implemented as versioned server operations. The Phase 1 local clear action was disabled so it cannot falsely appear to delete shared data. Add deletion/undo semantics, PNG export, room names, pan/zoom, production abuse controls, deployment, and the hackathon submission next.

The original challenge and submission instructions remain in README. Phase 1 documentation is historical; this document describes current behavior.

