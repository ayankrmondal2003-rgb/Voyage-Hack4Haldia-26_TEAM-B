# Phase 3 — Advanced Drawing Tools, Per-User Undo/Redo & PNG Export

## Overview
Phase 3 expands **TEAM-B Live Whiteboard (FUNBOARD)** into an Excalidraw-inspired real-time collaborative workspace with 9 fully-functional drawing tools, per-user undo/redo, contextual properties styling, high-resolution PNG export, canvas zoom/pan navigation, keyboard shortcuts, and full MongoDB Atlas persistence.

---

## 1. Supported Drawing Tools
Every tool in the floating toolbar is fully functional:

| Tool | Shortcut | Description |
|---|---|---|
| **Selection** | `V` | Click to select an element, drag to move, bounding box handles, Delete/Backspace to delete |
| **Hand (Pan)** | `H` / `Space + drag` | Pan the infinite canvas smoothly across any zoom level |
| **Pen** | `P` | Smooth freehand drawing with quadratic bezier curves and variable thickness |
| **Eraser** | `E` | Click or drag over any element to erase it collaboratively in real time |
| **Rectangle** | `R` | Click and drag to create sharp or rounded rectangles with customizable stroke and fill |
| **Ellipse / Circle** | `O` | Click and drag to draw circles and ellipses with stroke and fill colors |
| **Straight Line** | `L` | Click and drag to draw straight lines with round caps |
| **Arrow** | `A` | Click and drag to draw directional arrows with geometric arrowheads |
| **Text** | `T` | Click anywhere to insert text via an inline editor, with adjustable font size and color |

---

## 2. Per-User Undo and Redo
- **Isolation**: User A never undoes User B's work. Each user maintains a private action history in `useRoom.js`.
- **Supported Operations**:
  - Element Creation (`add`)
  - Element Deletion (`delete` / eraser)
  - Element Movement / Editing (`update`)
- **Multiplayer Consistency**:
  - When User A undoes an element addition, the client emits `element:delete`, setting `active: false` in MongoDB and incrementing the room version.
  - When User A redoes an action, `element:restore` sets `active: true` and restores the element.
  - Late joiners only receive `active: true` elements in authoritative version order.

---

## 3. High-Resolution PNG Export
- **Full Board Calculation**: Computes the true bounding box across all active elements with customizable padding (default 60px).
- **Clean Output**: Bypasses UI controls, selection handles, and collaborator cursors.
- **Filename**: Generates descriptive filenames: `whiteboard-<roomId>.png`.
- **Graceful Fallback**: If the board is empty, exports a clean canvas with a placeholder note.

---

## 4. Zoom and Pan Navigation
- **World Coordinates**: All elements are stored and transmitted in world coordinates (`[x, y]`).
- **Screen Translation**: Zoom and Pan transformations are applied dynamically via Canvas 2D transforms:
  - Screen to world: `(screenPt - pan) / zoom`
  - World to screen: `worldPt * zoom + pan`
- **Remote Cursors**: Collaborator cursors are rendered using screen translation so live pointers remain anchored to the exact canvas content regardless of local zoom level.
- **Controls**: Zoom in (`+`), Zoom out (`-`), Zoom reset (`100%`), and Reset view button.

---

## 5. Contextual Properties Panel
When an element or drawing tool is selected, a floating properties panel appears on the left:
- **Stroke Color**: 7 preset color swatches + custom color picker.
- **Background / Fill Color**: Transparent (`none`), Soft Yellow, Mint, Coral, Blue, Lavender, and White.
- **Thickness**: Fine (2px), Medium (4px), Bold (8px).
- **Font Size**: Small (16px), Medium (24px), Large (36px).
- **Live Element Updates**: If an element is selected, changing properties updates it live and broadcasts to all connected collaborators.

---

## 6. Socket.IO Events

| Event | Direction | Payload |
|---|---|---|
| `element:create` | Client → Server | `{ roomId, element }` |
| `element:created` | Server → Room | `{ roomId, version, element }` |
| `element:update` | Client → Server | `{ roomId, id, updates }` |
| `element:updated` | Server → Room | `{ roomId, version, stroke }` |
| `element:delete` | Client → Server | `{ roomId, id }` |
| `element:deleted` | Server → Room | `{ roomId, version, strokeId }` |
| `element:restore` | Client → Server | `{ roomId, id }` |
| `element:restored` | Server → Room | `{ roomId, version, stroke }` |
| `stroke:commit` | Client → Server | `{ roomId, stroke }` (Backward compatible with Phase 2) |
| `stroke:added` | Server → Room | `{ roomId, version, stroke }` |

---

## 7. Automated Test Results
Run `npm test` from the `TEAM-B` directory to execute all 22 tests:
- **Phase 2 Tests (15 passed)**: Room persistence, REST APIs, late joins, simultaneous drawing, disconnect/reconnect, rate limits.
- **Phase 3 Tests (7 passed)**: Creation of all shape types, element update/movement, element deletion, element undo restoration, late join snapshot verification, hit testing, and bounding box calculations.

