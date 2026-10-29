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
  Redo2 
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
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 select-none">
      <div className="bg-white border-[2.5px] border-black rounded-2xl px-3 py-1.5 shadow-[4px_4px_0px_#000] flex items-center gap-1.5 overflow-x-auto max-w-[95vw]">
        
        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
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
        <div className="flex items-center gap-1">
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
