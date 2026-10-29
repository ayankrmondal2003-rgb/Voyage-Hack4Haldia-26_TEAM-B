import { useCallback, useEffect, useRef, useState } from 'react';
import { createSocket } from '../lib/socket.js';
import { getIdentity } from '../lib/identity.js';
import { readOutbox, writeOutbox } from '../lib/outbox.js';
import { applyAdded, applySnapshot } from '../lib/boardState.js';
import { PREVIEW_MS, sameStroke } from '../../../shared/protocol.js';

export default function useRoom(room) {
  const [identity] = useState(getIdentity);
  const [board, setBoard] = useState({ version: room.version, strokes: room.strokes || [] });
  const boardRef = useRef(board);
  const [pending, setPending] = useState(() => readOutbox(room.roomId, identity.userId));
  const pendingRef = useRef(pending);
  const [draft, setDraft] = useState(null);
  const [previews, setPreviews] = useState({});
  const [cursors, setCursors] = useState({});
  const [presence, setPresence] = useState({ users: [], sessions: 0 });
  const [status, setStatus] = useState('Connecting');
  const [error, setError] = useState('');
  const [storageWarning, setStorageWarning] = useState('');
  
  // Per-User Undo & Redo Stacks (only current user's actions)
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const undoStackRef = useRef(undoStack);
  const redoStackRef = useRef(redoStack);
  undoStackRef.current = undoStack;
  redoStackRef.current = redoStack;

  const socketRef = useRef(null);
  const ready = useRef(false);
  const flushRef = useRef(() => {});
  const lastPreview = useRef(0);
  const lastCursor = useRef(0);
  const blocked = useRef(new Set());

  const updatePending = useCallback(values => {
    pendingRef.current = values;
    setPending(values);
    if (!writeOutbox(room.roomId, identity.userId, values)) {
      setStorageWarning('Browser storage is full or disabled. Keep this tab open until all strokes are saved.');
    } else setStorageWarning('');
  }, [room.roomId, identity.userId]);

  useEffect(() => {
    const socket = createSocket(identity.userId);
    socketRef.current = socket;
    let disposed = false, joining = false, flushing = false;
    let nextJoin = 0, nextFlush = 0;
    const showBoard = value => { boardRef.current = value; setBoard(value); };

    function confirm(saved) {
      const local = pendingRef.current.find(stroke => stroke.id === saved.id);
      if (local && !sameStroke(local, saved)) {
        blocked.current.add(local.id);
        setError('A stroke ID conflict requires attention. The unsynced drawing remains in this tab.');
        return;
      }
      if (local) updatePending(pendingRef.current.filter(stroke => stroke.id !== saved.id));
      blocked.current.delete(saved.id);
    }

    function join() {
      if (disposed || !socket.connected || joining || Date.now() < nextJoin) return;
      joining = true; ready.current = false; setStatus('Syncing');
      socket.timeout(10000).emit('room:join', { roomId: room.roomId }, (timeout, result) => {
        if (disposed) return;
        joining = false;
        if (timeout || !result?.ok) {
          ready.current = false; setStatus('Sync unavailable');
          setError(result?.error?.message || 'Room synchronization timed out. Retrying…');
          nextJoin = Date.now() + 3000;
        }
      });
    }

    async function flush() {
      if (disposed || flushing || !ready.current || !socket.connected || Date.now() < nextFlush) return;
      const stroke = pendingRef.current.find(item => !blocked.current.has(item.id));
      if (!stroke) return;
      flushing = true;
      const eventName = stroke.tool && stroke.tool !== 'pen' ? 'element:create' : 'stroke:commit';
      socket.timeout(10000).emit(eventName, { roomId: room.roomId, stroke, element: stroke }, (timeout, result) => {
        flushing = false;
        if (disposed) return;
        if (timeout || !result?.ok) {
          setError(result?.error?.message || 'Save not confirmed. Keeping your stroke and retrying safely.');
          nextFlush = Date.now() + 3000;
          if (result?.error && !result.error.retryable) {
            if (result.error.code === 'NOT_JOINED') { ready.current = false; join(); }
            else blocked.current.add(stroke.id);
          }
          return;
        }
        const saved = result.stroke || result.element;
        confirm(saved);
        showBoard(applyAdded(boardRef.current, saved));
        setError('');
        flush();
      });
    }
    flushRef.current = flush;

    socket.on('connect', () => { nextJoin = 0; joining = false; join(); });
    const offline = () => {
      ready.current = false; joining = false; setStatus('Offline');
      setPresence({ users: [], sessions: 0 }); setPreviews({}); setCursors({});
    };
    socket.on('disconnect', offline);
    socket.on('connect_error', offline);

    socket.on('room:state', snapshot => {
      if (snapshot.roomId !== room.roomId) return;
      showBoard(applySnapshot(boardRef.current, snapshot));
      snapshot.strokes.forEach(confirm);
      setPreviews({}); setCursors({});
      ready.current = true; setStatus('Live'); setError('');
      flush();
    });

    socket.on('stroke:added', event => {
      if (event.roomId !== room.roomId) return;
      const gap = event.version > boardRef.current.version + 1;
      showBoard(applyAdded(boardRef.current, event.stroke));
      confirm(event.stroke);
      setPreviews(values => Object.fromEntries(Object.entries(values).filter(([, value]) => value.stroke.id !== event.stroke.id)));
      if (gap) { nextJoin = 0; join(); }
    });

    socket.on('element:created', event => {
      if (event.roomId !== room.roomId) return;
      const elem = event.element || event.stroke;
      showBoard(applyAdded(boardRef.current, elem));
      confirm(elem);
      setPreviews(values => Object.fromEntries(Object.entries(values).filter(([, value]) => value.stroke.id !== elem.id)));
    });

    socket.on('element:updated', event => {
      if (event.roomId !== room.roomId) return;
      const updated = event.stroke || event.element;
      showBoard({
        version: Math.max(boardRef.current.version, event.version || 0),
        strokes: boardRef.current.strokes.map(s => s.id === updated.id ? { ...s, ...updated } : s)
      });
    });

    socket.on('element:deleted', event => {
      if (event.roomId !== room.roomId) return;
      showBoard({
        version: Math.max(boardRef.current.version, event.version || 0),
        strokes: boardRef.current.strokes.map(s => s.id === event.strokeId ? { ...s, active: false } : s)
      });
    });

    socket.on('element:restored', event => {
      if (event.roomId !== room.roomId) return;
      const restored = event.stroke || event.element;
      showBoard({
        version: Math.max(boardRef.current.version, event.version || 0),
        strokes: boardRef.current.strokes.map(s => s.id === restored.id ? { ...s, ...restored, active: true } : s)
      });
    });

    socket.on('stroke:preview', event => {
      if (event.roomId !== room.roomId) return;
      setPreviews(values => {
        const next = { ...values };
        if (!event.stroke || boardRef.current.strokes.some(stroke => stroke.id === event.stroke.id && stroke.active !== false)) {
          delete next[event.sessionId];
        } else {
          next[event.sessionId] = { stroke: event.stroke, time: Date.now() };
        }
        return next;
      });
    });

    socket.on('presence:update', event => {
      if (event.roomId === room.roomId) setPresence(event);
    });

    socket.on('cursor:move', event => {
      if (event.roomId !== room.roomId) return;
      setCursors(values => {
        const next = { ...values };
        if (event.position) next[event.sessionId] = { ...event, time: Date.now() };
        else delete next[event.sessionId];
        return next;
      });
    });

    socket.on('room:error', detail => setError(detail.message));

    const timer = setInterval(() => {
      if (!ready.current) join(); else flush();
      const cutoff = Date.now() - 5000;
      setPreviews(values => Object.fromEntries(Object.entries(values).filter(([, value]) => value.time > cutoff)));
      setCursors(values => Object.fromEntries(Object.entries(values).filter(([, value]) => value.time > cutoff)));
    }, 1000);

    socket.connect();
    return () => {
      disposed = true; ready.current = false; clearInterval(timer);
      flushRef.current = () => {};
      if (socket.connected) socket.emit('room:leave', { roomId: room.roomId });
      socket.removeAllListeners(); socket.disconnect(); socketRef.current = null;
    };
  }, [room.roomId, identity.userId, updatePending]);

  function preview(stroke) {
    setDraft(stroke);
    const socket = socketRef.current;
    if (!ready.current || !socket?.connected || (stroke && performance.now() - lastPreview.current < PREVIEW_MS)) return;
    lastPreview.current = performance.now();
    socket.volatile.emit('stroke:preview', { roomId: room.roomId, stroke });
  }

  function complete(element) {
    updatePending([...pendingRef.current.filter(item => item.id !== element.id), element]);
    setDraft(null);

    // Push creation to current user's undo stack & reset redo stack
    setUndoStack(prev => [...prev, { type: 'add', element }]);
    setRedoStack([]);

    if (ready.current && socketRef.current?.connected) {
      socketRef.current.volatile.emit('stroke:preview', { roomId: room.roomId, stroke: element });
    }
    flushRef.current();
  }

  function addElements(newElements) {
    if (!newElements || !newElements.length) return;
    const newIds = new Set(newElements.map(e => e.id));
    const merged = [...pendingRef.current.filter(item => !newIds.has(item.id)), ...newElements];
    updatePending(merged);

    setUndoStack(prev => [...prev, { type: 'batch-add', elements: newElements }]);
    setRedoStack([]);

    setBoard(curr => ({
      ...curr,
      strokes: [...curr.strokes.filter(s => !newIds.has(s.id)), ...newElements]
    }));

    flushRef.current();
  }

  function updateElement(strokeId, updates, recordUndo = true) {
    const existing = boardRef.current.strokes.find(s => s.id === strokeId);
    if (!existing) return;

    if (recordUndo) {
      setUndoStack(prev => [...prev, { 
        type: 'update', 
        elementId: strokeId, 
        prev: { ...existing }, 
        next: { ...existing, ...updates } 
      }]);
      setRedoStack([]);
    }

    // Update optimistic local state immediately
    const updated = { ...existing, ...updates };
    setBoard(curr => ({
      ...curr,
      strokes: curr.strokes.map(s => s.id === strokeId ? updated : s)
    }));

    if (socketRef.current?.connected) {
      socketRef.current.emit('element:update', { roomId: room.roomId, id: strokeId, updates });
    }
  }

  function deleteElement(strokeId, recordUndo = true) {
    const existing = boardRef.current.strokes.find(s => s.id === strokeId);
    if (!existing) return;

    if (recordUndo) {
      setUndoStack(prev => [...prev, { type: 'delete', element: existing }]);
      setRedoStack([]);
    }

    // Optimistic local delete
    setBoard(curr => ({
      ...curr,
      strokes: curr.strokes.map(s => s.id === strokeId ? { ...s, active: false } : s)
    }));

    if (socketRef.current?.connected) {
      socketRef.current.emit('element:delete', { roomId: room.roomId, id: strokeId });
    }
  }

  function restoreElement(strokeId) {
    setBoard(curr => ({
      ...curr,
      strokes: curr.strokes.map(s => s.id === strokeId ? { ...s, active: true } : s)
    }));

    if (socketRef.current?.connected) {
      socketRef.current.emit('element:restore', { roomId: room.roomId, id: strokeId });
    }
  }

  // Per-User Undo
  function undo() {
    if (!undoStack.length) return;
    const action = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));

    if (action.type === 'add') {
      // Undo add -> delete element
      deleteElement(action.element.id, false);
      setRedoStack(prev => [...prev, action]);
    } else if (action.type === 'batch-add') {
      // Undo batch add -> delete all generated elements
      action.elements.forEach(el => deleteElement(el.id, false));
      setRedoStack(prev => [...prev, action]);
    } else if (action.type === 'delete') {
      // Undo delete -> restore element
      restoreElement(action.element.id);
      setRedoStack(prev => [...prev, action]);
    } else if (action.type === 'update') {
      // Undo update -> revert to prev
      updateElement(action.elementId, action.prev, false);
      setRedoStack(prev => [...prev, action]);
    }
  }

  // Per-User Redo
  function redo() {
    if (!redoStack.length) return;
    const action = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));

    if (action.type === 'add') {
      // Redo add -> restore element
      restoreElement(action.element.id);
      setUndoStack(prev => [...prev, action]);
    } else if (action.type === 'batch-add') {
      // Redo batch add -> restore all elements
      action.elements.forEach(el => restoreElement(el.id));
      setUndoStack(prev => [...prev, action]);
    } else if (action.type === 'delete') {
      // Redo delete -> delete element
      deleteElement(action.element.id, false);
      setUndoStack(prev => [...prev, action]);
    } else if (action.type === 'update') {
      // Redo update -> apply next
      updateElement(action.elementId, action.next, false);
      setUndoStack(prev => [...prev, action]);
    }
  }

  function cursor(position) {
    const socket = socketRef.current;
    if (!ready.current || !socket?.connected || (position && performance.now() - lastCursor.current < PREVIEW_MS)) return;
    lastCursor.current = performance.now();
    socket.volatile.emit('cursor:move', { roomId: room.roomId, position });
  }

  function retry() { blocked.current.clear(); setError(''); flushRef.current(); }

  const visible = new Map();
  // Server strokes
  board.strokes.forEach(stroke => {
    if (stroke.active !== false) visible.set(stroke.id, stroke);
  });
  // Remote live previews
  Object.values(previews).forEach(({ stroke }) => {
    if (stroke && stroke.active !== false) visible.set(stroke.id, stroke);
  });
  // Local pending strokes
  pending.forEach(stroke => {
    if (stroke.active !== false) visible.set(stroke.id, stroke);
  });
  // In-progress draft stroke
  if (draft && draft.active !== false) {
    visible.set(draft.id, draft);
  }

  return {
    identity,
    strokes: [...visible.values()],
    version: board.version,
    pendingCount: pending.length,
    status,
    error,
    storageWarning,
    presence,
    cursors: Object.values(cursors),
    preview,
    complete,
    addElements,
    updateElement,
    deleteElement,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    cursor,
    retry
  };
}
