# Hack4Haldia 2026 — Pull Request Submission Template

**Pull Request Title:** `TEAM-B: FUNBOARD — Real-time Multiplayer Collaborative Whiteboard`
**Target Repository:** `Voyage-Hack4Haldia-26/TEAM-B`
**Target Branch:** `main`
**Source Branch:** `team-b-solution`

---

## 📝 Project Summary
**FUNBOARD (TEAM-B Live Whiteboard)** is a high-performance, real-time multiplayer collaborative drawing application inspired by Excalidraw, designed with a tactile Neo-Brutalist visual aesthetic. Built for Hack4Haldia 2026, it enables distributed engineering and design teams to sketch, diagram, and brainstorm together without login friction.

## 🚀 Live Demo & Deployment
- **Live Deployed URL:** *(Insert your Render Web Service URL here)*
- **Health Check:** `/healthz` (Status: 200 OK)

## ✨ Implemented Features
### Core Mandatory Requirements (100% Completed)
- [x] **Room Management:** Create unique rooms, join via Room ID, and 1-click shareable URLs.
- [x] **Live Multiplayer Sync:** Sub-30ms bidirectional drawing previews and committed element broadcasts via Socket.IO.
- [x] **Late-Joiner Synchronization:** Authoritative MongoDB snapshots load instantly for new peers entering an active session.
- [x] **Durable Persistence:** All committed board elements are stored transactionally in MongoDB Atlas with monotonic versioning.
- [x] **Network Resilience:** Auto-reconnection with persistent outbox queue and idempotent deduplication prevents stroke loss.

### Advanced Bonus Features (100% Completed)
- [x] **9 Specialized Drawing Tools:** Selection, Pan, Freehand Pen, Eraser, Rectangle, Ellipse, Straight Line, Arrow, and Inline Text.
- [x] **Per-User Undo/Redo:** `Ctrl+Z` / `Ctrl+Shift+Z` isolates user actions so collaborators never delete each other's work.
- [x] **Contextual Properties Panel:** Real-time color palette, custom hex picker, stroke thickness, fill styles, and font sizes.
- [x] **Element Manipulation:** Hit-testing, drag-to-move shapes, and keyboard `Delete` support.
- [x] **High-Resolution PNG Export:** Calculates canvas bounding box and downloads cropped, high-DPI image diagrams.
- [x] **Canvas Navigation:** Smooth zoom in/out/reset and hand pan controls with world-coordinate transformations.
- [x] **Live Collaboration Indicators:** Real-time colored cursors with guest names and online participant list drawer.

## 🛠️ Technology Stack
- **Frontend:** React 19, Vite, Lucide Icons, HTML5 Canvas 2D API (High-DPI Bézier rendering)
- **Backend:** Node.js 22, Express, Socket.IO 4
- **Database:** MongoDB Atlas (Mongoose ODM, Replica Set transactions)
- **Testing:** Node.js native test runner (`node:test`, `node:assert`)
- **Design System:** Neo-Brutalism with high-contrast borders and tactile drop shadows

## 🧪 Testing Verification
- **22 / 22 Automated Tests Passing (100% pass rate)**
- Covered: Room lifecycle, Socket rate-limiting, late-join state delivery, element CRUD, per-user undo/redo, canvas DPI scaling, and delta reconciliation.
```bash
npm test
```

## 👥 Team B
- **Team:** Team B
- **Hackathon:** Hack4Haldia 2026

