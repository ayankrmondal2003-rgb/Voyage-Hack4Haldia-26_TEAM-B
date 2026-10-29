# Team B: Live Whiteboard (FUNBOARD)
## Current implementation: Phase 3 — Advanced Drawing Tools, Undo/Redo & PNG Export

Real-time Excalidraw-inspired collaborative whiteboard with full multiplayer synchronization, MongoDB Atlas persistence, 9 working drawing tools, per-user undo/redo, contextual properties panel, high-res PNG export, zoom/pan navigation, keyboard shortcuts, live cursors, and presence. See [Phase 3 Documentation](docs/PHASE3.md).

Run `npm install`, configure `server/.env` from `server/.env.example`, then start the application:
```powershell
# Development (two terminals)
npm run dev:server
npm run dev:client

# Production
npm run build
npm start
```
Frontend: http://127.0.0.1:5173 | API: http://localhost:3000

The original challenge instructions below are preserved.

> Real-time collaborative drawing rooms

**Hack4Haldia'26** is a 3-hour build challenge. This is your starter repository. Build new features on top of it, integrate them, **deploy the working project**, and open a **Pull Request** on this repository. AI tools and open-source / open-weight models are fully allowed.

## The Problem

Remote teams need a shared canvas. Build a whiteboard where multiple people join a room and see each other's strokes instantly.

## Must-have (core, do these first)

- [x] Create/join a room by ID
- [x] Draw strokes that sync live to everyone in the room
- [x] Late joiners see the existing board (server keeps state)
- [x] Handle disconnect/reconnect without losing the board

## Bonus (completed in Phase 3)

- [x] Per-user undo/redo
- [x] Live cursors and presence list
- [x] Export board as PNG
- [x] Full drawing toolbar: Selection, Pan, Pen, Eraser, Rectangle, Ellipse, Line, Arrow, Text
- [x] Contextual properties panel (stroke color, fill color, thickness, font size)
- [x] Zoom and pan navigation controls with world coordinate translation
- [x] Keyboard shortcuts (V, H, P, E, R, O, L, A, T, Delete, Ctrl+Z, Ctrl+Shift+Z)
- [ ] Redis pub/sub for multi-server scaling (Phase 4)

## Architecture

```text
shared/
  protocol.js         Common element validation, UUIDs, rate limits, profile generator
client/
  src/
    components/
      Workspace.jsx   Whiteboard workspace with header, zoom controls, export, cursors
      Toolbar.jsx     Floating drawing toolbar with active tool states and shortcuts
      PropertiesPanel Contextual styling panel for stroke, fill, width, and font size
      DrawingCanvas   Multi-tool canvas with hit testing, selection, inline text editor
      Home.jsx        Neo-brutalist landing page for room creation and joining
      PresenceList    Active collaborators dropdown with session counting
      Brand.jsx       FUNBOARD brand identity
    drawing/
      render.js       High-DPI canvas rendering, bezier curves, shapes, text, hit testing
      exportPng.js    Calculates board bounds and exports clean high-res PNG
    hooks/
      useRoom.js      Socket lifecycle, per-user undo/redo, real-time sync, outbox retry
server/
  src/
    models.js         Mongoose schemas for Room and Stroke/Element
    storage/rooms.js  Transactional MongoDB storage (add, update, delete, restore)
    services/roomState.js Per-room serialized queue for state consistency
    socket.js         Socket.IO handlers (element:create, element:update, element:delete, etc.)
    routes/rooms.js   REST API endpoints (POST /api/rooms, GET /api/rooms/:id)
    app.js            Express app configuration and static build serving
    index.js          Server bootstrap and MongoDB connection lifecycle
  test/
    api.test.js       Phase 2 acceptance tests A–I
    phase3.test.js    Phase 3 unified elements, update, delete, restore, hit-testing tests
    drawing.test.js   Canvas coordinate and DPI regression tests
    reconcile.test.js Board state snapshot and delta convergence tests
```

## Running Tests

```bash
npm test
```
Runs all 22 automated acceptance tests across Phase 2 and Phase 3 suites.
