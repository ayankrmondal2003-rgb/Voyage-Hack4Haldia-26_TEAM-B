import { useEffect, useRef, useState, useCallback } from 'react';
import { pointFromEvent, renderBoard, screenToWorld, hitTestElement, getElementBounds } from '../drawing/render.js';
import { MAX_POINTS } from '../../../shared/protocol.js';

export default function DrawingCanvas({
  strokes,
  activeTool,
  setActiveTool,
  color,
  fillColor,
  width,
  fontSize,
  authorId,
  roomId,
  zoom = 1,
  pan = [0, 0],
  setPan,
  selectedId,
  setSelectedId,
  onPreview,
  onComplete,
  onUpdateElement,
  onDeleteElement,
  onCursor,
  onUndo,
  onRedo
}) {
  const canvasRef = useRef(null);
  const active = useRef(null);
  const isDraggingSelection = useRef(false);
  const isPanning = useRef(false);
  const spacePressed = useRef(false);
  const dragStart = useRef([0, 0]);
  const elementStartPos = useRef(null);
  const animationFrameRef = useRef(null);

  // Text editor state for Text Tool
  const [textEditor, setTextEditor] = useState(null);

  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() => {
      renderBoard(canvas, strokesRef.current, {
        zoom,
        pan,
        selectedIds: selectedId ? [selectedId] : [],
        draft: active.current?.stroke || null
      });
    });
  }, [zoom, pan, selectedId]);

  // Mount/unmount resize observer with EMPTY dependency array (never cancels active drawing)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => redraw());
    observer.observe(canvas);
    window.addEventListener('resize', redraw);
    redraw();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', redraw);
      cancelAnimationFrame(animationFrameRef.current);
      if (active.current && active.current.stroke) {
        onComplete(active.current.stroke);
        active.current = null;
      }
    };
  }, []); // Empty dependency array!

  // Redraw whenever strokes, zoom, pan, or selection changes
  useEffect(() => {
    redraw();
  }, [strokes, redraw]);

  // Keyboard Shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }

      if (e.code === 'Space' && !spacePressed.current) {
        spacePressed.current = true;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) onRedo();
        else onUndo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        onRedo();
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        onDeleteElement(selectedId);
        setSelectedId(null);
        return;
      }

      if (e.key === 'Escape') {
        setSelectedId(null);
        setTextEditor(null);
        return;
      }

      const key = e.key.toUpperCase();
      const shortcutMap = {
        V: 'select',
        H: 'pan',
        P: 'pen',
        E: 'eraser',
        R: 'rectangle',
        O: 'ellipse',
        L: 'line',
        A: 'arrow',
        T: 'text',
      };
      if (shortcutMap[key]) {
        e.preventDefault();
        setActiveTool(shortcutMap[key]);
      }
    }

    function handleKeyUp(e) {
      if (e.code === 'Space') {
        spacePressed.current = false;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedId, setActiveTool, onDeleteElement, onUndo, onRedo, setSelectedId]);

  function getCoords(e) {
    const screenPt = pointFromEvent(e, canvasRef.current);
    const worldPt = screenToWorld(screenPt, zoom, pan);
    return { screenPt, worldPt };
  }

  function start(e) {
    if (e.button !== 0) return;
    const canvas = canvasRef.current;
    if (canvas && e.pointerId) {
      try { canvas.setPointerCapture(e.pointerId); } catch {}
    }

    const { screenPt, worldPt } = getCoords(e);

    // Pan mode
    if (activeTool === 'pan' || spacePressed.current) {
      isPanning.current = true;
      dragStart.current = [e.clientX, e.clientY];
      return;
    }

    // 1. SELECT TOOL
    if (activeTool === 'select') {
      const activeStrokes = strokesRef.current.filter(s => s.active !== false);
      let hit = null;
      for (let i = activeStrokes.length - 1; i >= 0; i--) {
        if (hitTestElement(worldPt, activeStrokes[i])) {
          hit = activeStrokes[i];
          break;
        }
      }

      if (hit) {
        setSelectedId(hit.id);
        isDraggingSelection.current = true;
        dragStart.current = worldPt;
        elementStartPos.current = {
          x: hit.x ?? 0,
          y: hit.y ?? 0,
          points: hit.points ? hit.points.map(p => [...p]) : []
        };
      } else {
        setSelectedId(null);
      }
      redraw();
      return;
    }

    // 2. ERASER TOOL
    if (activeTool === 'eraser') {
      const activeStrokes = strokesRef.current.filter(s => s.active !== false);
      for (let i = activeStrokes.length - 1; i >= 0; i--) {
        if (hitTestElement(worldPt, activeStrokes[i])) {
          onDeleteElement(activeStrokes[i].id);
          break;
        }
      }
      active.current = { erasing: true };
      redraw();
      return;
    }

    // 3. TEXT TOOL
    if (activeTool === 'text') {
      setTextEditor({
        x: Math.round(worldPt[0]),
        y: Math.round(worldPt[1]),
        screenX: screenPt[0],
        screenY: screenPt[1],
        text: ''
      });
      return;
    }

    // 4. DRAWING TOOLS (pen, rectangle, ellipse, line, arrow)
    const newId = crypto.randomUUID();
    let initialStroke = {
      id: newId,
      roomId,
      authorId,
      tool: activeTool,
      type: activeTool,
      color,
      width,
      strokeColor: color,
      strokeWidth: width,
      fillColor: ['rectangle', 'ellipse'].includes(activeTool) ? fillColor : 'transparent',
      x: worldPt[0],
      y: worldPt[1],
      w: 0,
      h: 0,
      points: [worldPt],
      createdAt: new Date().toISOString()
    };

    active.current = {
      pointerId: e.pointerId,
      startPoint: worldPt,
      stroke: initialStroke
    };

    redraw();
    onPreview(initialStroke);
  }

  function move(e) {
    const { screenPt, worldPt } = getCoords(e);
    onCursor(worldPt);

    // Pan dragging
    if (isPanning.current) {
      const dx = e.clientX - dragStart.current[0];
      const dy = e.clientY - dragStart.current[1];
      dragStart.current = [e.clientX, e.clientY];
      setPan(prev => [prev[0] + dx, prev[1] + dy]);
      return;
    }

    // Selection dragging (move element)
    if (isDraggingSelection.current && selectedId && elementStartPos.current) {
      const dx = worldPt[0] - dragStart.current[0];
      const dy = worldPt[1] - dragStart.current[1];
      const start = elementStartPos.current;

      const newPoints = start.points.map(p => [p[0] + dx, p[1] + dy]);
      const updates = {
        x: start.x + dx,
        y: start.y + dy,
        points: newPoints
      };

      onUpdateElement(selectedId, updates, false);
      redraw();
      return;
    }

    // Eraser dragging
    if (active.current?.erasing) {
      const activeStrokes = strokesRef.current.filter(s => s.active !== false);
      for (let i = activeStrokes.length - 1; i >= 0; i--) {
        if (hitTestElement(worldPt, activeStrokes[i])) {
          onDeleteElement(activeStrokes[i].id);
          break;
        }
      }
      return;
    }

    if (!active.current || active.current.pointerId !== e.pointerId) return;

    const startPt = active.current.startPoint;
    let stroke = active.current.stroke;

    if (activeTool === 'pen') {
      const samples = e.nativeEvent?.getCoalescedEvents?.() || [];
      const pts = (samples.length ? samples : [e]).map(s => screenToWorld(pointFromEvent(s, canvasRef.current), zoom, pan));
      for (const pt of pts) {
        const last = stroke.points[stroke.points.length - 1];
        if (Math.hypot(pt[0] - last[0], pt[1] - last[1]) < 0.5) continue;
        if (stroke.points.length >= MAX_POINTS) {
          onComplete(stroke);
          stroke = {
            id: crypto.randomUUID(),
            roomId,
            authorId,
            tool: 'pen',
            type: 'pen',
            color,
            width,
            strokeColor: color,
            strokeWidth: width,
            points: [last],
            createdAt: new Date().toISOString()
          };
        }
        stroke = { ...stroke, points: [...stroke.points, pt] };
      }
    } else if (['rectangle', 'ellipse'].includes(activeTool)) {
      const minX = Math.min(startPt[0], worldPt[0]);
      const minY = Math.min(startPt[1], worldPt[1]);
      const w = Math.abs(worldPt[0] - startPt[0]);
      const h = Math.abs(worldPt[1] - startPt[1]);
      stroke = {
        ...stroke,
        x: minX,
        y: minY,
        w,
        h,
        points: [startPt, worldPt]
      };
    } else if (['line', 'arrow'].includes(activeTool)) {
      stroke = {
        ...stroke,
        points: [startPt, worldPt]
      };
    }

    active.current.stroke = stroke;
    redraw(); // Instant 60fps local render!
    onPreview(stroke);
  }

  function end(e) {
    if (isPanning.current) {
      isPanning.current = false;
    }

    if (isDraggingSelection.current && selectedId) {
      isDraggingSelection.current = false;
      const target = strokesRef.current.find(s => s.id === selectedId);
      if (target && elementStartPos.current) {
        onUpdateElement(selectedId, {
          x: target.x,
          y: target.y,
          points: target.points
        }, true);
      }
      elementStartPos.current = null;
    }

    if (active.current?.erasing) {
      active.current = null;
      return;
    }

    if (!active.current || active.current.pointerId !== e.pointerId) return;

    const stroke = active.current.stroke;
    active.current = null;
    redraw();

    if (stroke) {
      // Ignore zero-size accidental clicks for shapes
      if (['rectangle', 'ellipse', 'line', 'arrow'].includes(stroke.tool)) {
        const p0 = stroke.points?.[0];
        const p1 = stroke.points?.[1];
        if (p0 && p1 && Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) < 3) {
          onPreview(null);
          return;
        }
      }
      onComplete(stroke);
    }

    if (canvasRef.current && e.pointerId) {
      try {
        if (canvasRef.current.hasPointerCapture(e.pointerId)) {
          canvasRef.current.releasePointerCapture(e.pointerId);
        }
      } catch {}
    }
  }

  // Commit text element from inline editor
  function commitText(text) {
    if (!textEditor) return;
    const trimmed = text.trim();
    if (trimmed) {
      const textElement = {
        id: crypto.randomUUID(),
        roomId,
        authorId,
        tool: 'text',
        type: 'text',
        color,
        width: 1,
        strokeColor: color,
        strokeWidth: 1,
        fontSize,
        text: trimmed,
        x: textEditor.x,
        y: textEditor.y,
        points: [[textEditor.x, textEditor.y]],
        createdAt: new Date().toISOString()
      };
      onComplete(textElement);
    }
    setTextEditor(null);
    setActiveTool('select');
  }

  // Determine cursor based on tool
  const cursorStyle = spacePressed.current || activeTool === 'pan'
    ? (isPanning.current ? 'grabbing' : 'grab')
    : activeTool === 'select'
    ? 'default'
    : activeTool === 'text'
    ? 'text'
    : activeTool === 'eraser'
    ? 'crosshair'
    : 'crosshair';

  return (
    <div className="relative w-full h-full select-none">
      <canvas
        ref={canvasRef}
        className="drawing-canvas absolute inset-0 w-full h-full"
        style={{ cursor: cursorStyle }}
        aria-label="Interactive multiplayer collaborative canvas"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onLostPointerCapture={end}
        onPointerLeave={() => onCursor(null)}
      />

      {/* Inline Text Editor for Text Tool */}
      {textEditor && (
        <div
          className="absolute z-30"
          style={{
            left: textEditor.screenX,
            top: textEditor.screenY
          }}
        >
          <textarea
            autoFocus
            rows={1}
            defaultValue=""
            placeholder="Type text..."
            className="bg-white/90 border-2 border-blue-500 rounded px-1.5 py-0.5 outline-none font-bold resize-none overflow-hidden shadow-md"
            style={{
              color,
              fontSize: `${fontSize * zoom}px`,
              lineHeight: 1.25,
              minWidth: '120px'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                commitText(e.target.value);
              } else if (e.key === 'Escape') {
                setTextEditor(null);
              }
            }}
            onBlur={(e) => commitText(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
