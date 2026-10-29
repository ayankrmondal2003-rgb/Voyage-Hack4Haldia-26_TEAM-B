import { useState, useRef, useEffect } from 'react';
import { 
  MousePointer2, 
  Hand, 
  Pen, 
  Eraser, 
  Square, 
  Circle, 
  Minus, 
  ArrowRight, 
  Type, 
  Undo2, 
  Redo2,
  GripVertical
} from 'lucide-react';

const TOOLS = [
  { id: 'select', label: 'Select', shortcut: 'V', icon: MousePointer2 },
  { id: 'pan', label: 'Hand (Pan)', shortcut: 'H', icon: Hand },
  { id: 'pen', label: 'Pen', shortcut: 'P', icon: Pen },
  { id: 'eraser', label: 'Eraser', shortcut: 'E', icon: Eraser },
  { id: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: Square },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'O', icon: Circle },
  { id: 'line', label: 'Line', shortcut: 'L', icon: Minus },
  { id: 'arrow', label: 'Arrow', shortcut: 'A', icon: ArrowRight },
  { id: 'text', label: 'Text', shortcut: 'T', icon: Type },
];

export default function Toolbar({
  activeTool,
  setActiveTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) {
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem('funboard_toolbar_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    const defaultX = typeof window !== 'undefined' ? Math.max(10, (window.innerWidth - 480) / 2) : 200;
    return { x: defaultX, y: 76 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, originX: 0, originY: 0, active: false });

  // Keep within viewport if window is resized
  useEffect(() => {
    const handleResize = () => {
      setPos(prev => ({
        x: Math.max(10, Math.min(window.innerWidth - 200, prev.x)),
        y: Math.max(70, Math.min(window.innerHeight - 60, prev.y))
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    const newX = Math.max(10, Math.min(window.innerWidth - 100, dragRef.current.originX + dx));
    const newY = Math.max(70, Math.min(window.innerHeight - 60, dragRef.current.originY + dy));
    setPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
      localStorage.setItem('funboard_toolbar_pos', JSON.stringify(pos));
    } catch {}
  };

  return (
    <div 
      className="fixed z-30 select-none touch-none"
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
    >
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`bg-white border-[2.5px] border-black rounded-2xl px-2.5 py-1.5 shadow-[4px_4px_0px_#000] flex items-center gap-1.5 cursor-grab ${
          isDragging ? 'cursor-grabbing shadow-[6px_6px_0px_#000] scale-[1.02]' : ''
        } transition-transform duration-75`}
      >
        {/* Drag Handle Indicator */}
        <div 
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black cursor-grab active:cursor-grabbing flex items-center justify-center -ml-0.5"
          title="Drag toolbar anywhere on screen"
        >
          <GripVertical size={16} strokeWidth={2.5} />
        </div>

        {/* Drawing Tools */}
        <div className="flex items-center gap-1" onPointerDown={e => e.stopPropagation()}>
          {TOOLS.map((t) => {
            const Icon = t.icon;
            const isSelected = activeTool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTool(t.id)}
                className={`relative group w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#fef08a] border-black text-black shadow-[2px_2px_0px_#000] translate-y-[-1px]'
                    : 'bg-white hover:bg-gray-100 border-transparent text-gray-700 hover:border-black/30'
                }`}
                aria-label={`${t.label} (${t.shortcut})`}
              >
                <Icon size={17} strokeWidth={2.5} />
                
                {/* Tooltip */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md whitespace-nowrap z-50">
                  {t.label} <span className="text-yellow-400 font-mono ml-1">[{t.shortcut}]</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-[1.5px] h-6 bg-black/20 mx-1" />

        {/* Undo & Redo */}
        <div className="flex items-center gap-1" onPointerDown={e => e.stopPropagation()}>
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            className={`relative group w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
              canUndo
                ? 'bg-white hover:bg-gray-100 border-black text-[#2563eb] shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]'
                : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Undo (Ctrl+Z)"
          >
            <Undo2 size={16} strokeWidth={2.5} />
            <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md whitespace-nowrap z-50">
              Undo <span className="text-yellow-400 font-mono ml-1">[Ctrl+Z]</span>
            </div>
          </button>

          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            className={`relative group w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
              canRedo
                ? 'bg-white hover:bg-gray-100 border-black text-[#2563eb] shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]'
                : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={16} strokeWidth={2.5} />
            <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md whitespace-nowrap z-50">
              Redo <span className="text-yellow-400 font-mono ml-1">[Ctrl+Shift+Z]</span>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
