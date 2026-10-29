import { useState, useRef, useEffect } from 'react';
import { Pipette, GripHorizontal, Minimize2, Maximize2 } from 'lucide-react';

const STROKE_COLORS = [
  '#000000',
  '#2563eb',
  '#ef4444',
  '#10b981',
  '#f97316',
  '#8b5cf6',
  '#ffffff',
];

const FILL_COLORS = [
  { color: 'transparent', label: 'None' },
  { color: '#fef08a', label: 'Yellow' },
  { color: '#bbf7d0', label: 'Mint' },
  { color: '#fca5a5', label: 'Coral' },
  { color: '#e0f2fe', label: 'Blue' },
  { color: '#f3e8ff', label: 'Lavender' },
  { color: '#ffffff', label: 'White' },
];

const STROKE_WIDTHS = [
  { size: 2, label: 'Fine' },
  { size: 4, label: 'Medium' },
  { size: 8, label: 'Bold' },
];

const FONT_SIZES = [
  { size: 16, label: 'S' },
  { size: 24, label: 'M' },
  { size: 36, label: 'L' },
];

export default function PropertiesPanel({
  activeTool,
  selectedElement,
  color,
  setColor,
  fillColor,
  setFillColor,
  width,
  setWidth,
  fontSize,
  setFontSize,
  onUpdateSelected
}) {
  const isText = activeTool === 'text' || selectedElement?.tool === 'text' || selectedElement?.type === 'text';
  const showFill = ['rectangle', 'ellipse'].includes(activeTool) || ['rectangle', 'ellipse'].includes(selectedElement?.tool || selectedElement?.type);

  // 1. Position State
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem('funboard_properties_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    return { x: 20, y: 80 };
  });

  // 2. Minimize / Maximize State
  const [isMinimized, setIsMinimized] = useState(() => {
    try {
      return localStorage.getItem('funboard_properties_minimized') === 'true';
    } catch {
      return false;
    }
  });

  // 3. Scale / Resize State (0.80 to 1.30)
  const [scale, setScale] = useState(() => {
    try {
      const saved = localStorage.getItem('funboard_properties_scale');
      if (saved) {
        const parsed = parseFloat(saved);
        if (parsed >= 0.8 && parsed <= 1.3) return parsed;
      }
    } catch {}
    return 1.0;
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, originX: 0, originY: 0, active: false });

  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef({ startX: 0, startY: 0, startScale: 1.0, active: false });

  // Keep within viewport if window is resized
  useEffect(() => {
    const handleResize = () => {
      setPos(prev => ({
        x: Math.max(10, Math.min(window.innerWidth - 120, prev.x)),
        y: Math.max(70, Math.min(window.innerHeight - 80, prev.y))
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function toggleMinimize() {
    setIsMinimized(prev => {
      const next = !prev;
      try { localStorage.setItem('funboard_properties_minimized', String(next)); } catch {}
      return next;
    });
  }

  function cycleScale(e) {
    e.stopPropagation();
    setScale(prev => {
      let next = 1.0;
      if (prev < 0.95) next = 1.0;
      else if (prev < 1.1) next = 1.15;
      else next = 0.85;
      try { localStorage.setItem('funboard_properties_scale', String(next)); } catch {}
      return next;
    });
  }

  // Dragging Handlers
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.x,
      originY: pos.y,
      active: true
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const newX = Math.max(10, Math.min(window.innerWidth - 80, dragRef.current.originX + dx));
    const newY = Math.max(70, Math.min(window.innerHeight - 80, dragRef.current.originY + dy));
    setPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
      localStorage.setItem('funboard_properties_pos', JSON.stringify(pos));
    } catch {}
  };

  // Resize Corner Drag Handlers
  const handleResizeDown = (e) => {
    e.stopPropagation();
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startScale: scale,
      active: true
    };
    setIsResizing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleResizeMove = (e) => {
    if (!resizeRef.current.active) return;
    e.stopPropagation();
    const dx = e.clientX - resizeRef.current.startX;
    const nextScale = Math.max(0.80, Math.min(1.30, resizeRef.current.startScale + dx / 250));
    setScale(Math.round(nextScale * 100) / 100);
  };

  const handleResizeUp = (e) => {
    if (!resizeRef.current.active) return;
    resizeRef.current.active = false;
    setIsResizing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
      localStorage.setItem('funboard_properties_scale', String(scale));
    } catch {}
  };

  function handleColorChange(c) {
    setColor(c);
    if (selectedElement && onUpdateSelected) {
      onUpdateSelected(selectedElement.id, { color: c, strokeColor: c });
    }
  }

  function handleFillChange(fc) {
    setFillColor(fc);
    if (selectedElement && onUpdateSelected) {
      onUpdateSelected(selectedElement.id, { fillColor: fc });
    }
  }

  function handleWidthChange(w) {
    setWidth(w);
    if (selectedElement && onUpdateSelected) {
      onUpdateSelected(selectedElement.id, { width: w, strokeWidth: w });
    }
  }

  function handleFontSizeChange(fs) {
    setFontSize(fs);
    if (selectedElement && onUpdateSelected) {
      onUpdateSelected(selectedElement.id, { fontSize: fs });
    }
  }

  const currentColor = selectedElement ? (selectedElement.color || selectedElement.strokeColor) : color;

  // -----------------------------------------------------------------
  // 1. MINIMIZED VIEW (Floating Compact Pill)
  // -----------------------------------------------------------------
  if (isMinimized) {
    return (
      <div 
        className="fixed z-20 select-none touch-none text-black"
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      >
        <div 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`bg-white border-2 border-black rounded-2xl px-3 py-1.5 shadow-[4px_4px_0px_#000] flex items-center gap-2 cursor-grab ${
            isDragging ? 'cursor-grabbing shadow-[6px_6px_0px_#000] scale-[1.03]' : ''
          } transition-transform duration-75`}
        >
          <GripHorizontal size={14} strokeWidth={2.5} className="text-gray-400" />
          
          <span className="text-[10px] font-black uppercase text-gray-700 tracking-wider">
            Styling
          </span>

          <div 
            className="w-4 h-4 rounded-full border-1.5 border-black shadow-sm"
            style={{ backgroundColor: currentColor }}
            title={`Active color: ${currentColor}`}
          />

          <button
            type="button"
            onClick={toggleMinimize}
            onPointerDown={e => e.stopPropagation()}
            className="p-1 hover:bg-gray-100 rounded-lg border border-black/40 hover:border-black text-black cursor-pointer ml-0.5"
            title="Expand Styling Panel"
          >
            <Maximize2 size={12} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // 2. MAXIMIZED VIEW (Full Panel with Scale & Resize)
  // -----------------------------------------------------------------
  return (
    <div 
      className="fixed z-20 select-none touch-none text-black"
      style={{ 
        left: `${pos.x}px`, 
        top: `${pos.y}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left'
      }}
    >
      <div className={`relative bg-white border-2 border-black rounded-2xl p-3 shadow-[4px_4px_0px_#000] flex flex-col gap-2.5 min-w-[195px] ${
        isDragging ? 'shadow-[6px_6px_0px_#000] scale-[1.01]' : ''
      } ${isResizing ? 'ring-2 ring-blue-500' : ''} transition-transform duration-75`}>
        
        {/* Header Drag Bar */}
        <div 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex items-center justify-between pb-1.5 border-b border-black/15 cursor-grab active:cursor-grabbing group"
          title="Drag colour / styling panel anywhere on screen"
        >
          <div className="flex items-center gap-1.5">
            <div className="text-gray-400 group-hover:text-black">
              <GripHorizontal size={15} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase text-gray-600 tracking-wider">
              Styling
            </span>
          </div>

          <div className="flex items-center gap-1" onPointerDown={e => e.stopPropagation()}>
            {/* Scale toggle (S / M / L) */}
            <button
              type="button"
              onClick={cycleScale}
              className="px-1 py-0.5 text-[9px] font-black rounded border border-black/30 hover:border-black hover:bg-gray-100 text-gray-700 cursor-pointer"
              title={`Size: ${Math.round(scale * 100)}% (Click to toggle)`}
            >
              {scale < 0.95 ? 'S' : scale > 1.1 ? 'L' : 'M'}
            </button>

            {/* Minimize button */}
            <button
              type="button"
              onClick={toggleMinimize}
              className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-black cursor-pointer"
              title="Minimize Panel"
            >
              <Minimize2 size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Stroke Color */}
        <div onPointerDown={e => e.stopPropagation()}>
          <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1.5">
            {isText ? 'Text Color' : 'Stroke Color'}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {STROKE_COLORS.map(c => {
              const isSelected = currentColor === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleColorChange(c)}
                  className={`w-5 h-5 rounded-full border-2 border-black transition-all cursor-pointer ${
                    isSelected ? 'ring-2 ring-black ring-offset-2 scale-110 z-10' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              );
            })}
            <label className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center bg-gradient-to-tr from-pink-300 via-yellow-200 to-blue-300 cursor-pointer hover:scale-105" title="Custom color">
              <Pipette size={10} strokeWidth={2.5} className="text-black" />
              <input
                type="color"
                value={color}
                onChange={e => handleColorChange(e.target.value)}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        {/* Fill Color (for shapes) */}
        {showFill && (
          <div className="pt-2 border-t border-black/10" onPointerDown={e => e.stopPropagation()}>
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1.5">
              Background / Fill
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILL_COLORS.map(fc => {
                const isSelected = (selectedElement ? selectedElement.fillColor : fillColor) === fc.color;
                return (
                  <button
                    key={fc.color}
                    type="button"
                    onClick={() => handleFillChange(fc.color)}
                    className={`w-5 h-5 rounded-md border-2 border-black transition-all relative overflow-hidden cursor-pointer ${
                      isSelected ? 'ring-2 ring-black ring-offset-2 scale-110 z-10' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: fc.color === 'transparent' ? '#ffffff' : fc.color }}
                    title={fc.label}
                  >
                    {fc.color === 'transparent' && (
                      <div className="w-full h-[1.5px] bg-red-500 rotate-45 absolute top-1/2 left-0 -translate-y-1/2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stroke Width (unless text) */}
        {!isText && (
          <div className="pt-2 border-t border-black/10" onPointerDown={e => e.stopPropagation()}>
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1.5">
              Thickness
            </span>
            <div className="flex items-center gap-1.5">
              {STROKE_WIDTHS.map(sw => {
                const isSelected = (selectedElement ? (selectedElement.width || selectedElement.strokeWidth) : width) === sw.size;
                return (
                  <button
                    key={sw.size}
                    type="button"
                    onClick={() => handleWidthChange(sw.size)}
                    className={`flex-1 py-1 px-1.5 rounded-lg border-2 border-black text-xs font-black transition-all cursor-pointer ${
                      isSelected ? 'bg-[#fef08a] shadow-[1px_1px_0px_#000]' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    title={`${sw.label} (${sw.size}px)`}
                  >
                    {sw.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Font Size (for text) */}
        {isText && (
          <div className="pt-2 border-t border-black/10" onPointerDown={e => e.stopPropagation()}>
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1.5">
              Font Size
            </span>
            <div className="flex items-center gap-1.5">
              {FONT_SIZES.map(fs => {
                const isSelected = (selectedElement ? selectedElement.fontSize : fontSize) === fs.size;
                return (
                  <button
                    key={fs.size}
                    type="button"
                    onClick={() => handleFontSizeChange(fs.size)}
                    className={`flex-1 py-1 px-1.5 rounded-lg border-2 border-black text-xs font-black transition-all cursor-pointer ${
                      isSelected ? 'bg-[#fef08a] shadow-[1px_1px_0px_#000]' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    title={`${fs.label} (${fs.size}px)`}
                  >
                    {fs.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedElement && (
          <div className="pt-2 border-t border-black/10 text-[9px] font-mono text-gray-500">
            Selected: {selectedElement.tool || selectedElement.type}
          </div>
        )}

        {/* Tactile Corner Resize Drag Handle (Bottom Right) */}
        <div
          onPointerDown={handleResizeDown}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeUp}
          onPointerCancel={handleResizeUp}
          className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full bg-black text-white flex items-center justify-center cursor-nwse-resize shadow-sm hover:scale-125 transition-transform"
          title="Drag corner to smoothly resize panel"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
        </div>
      </div>
    </div>
  );
}
