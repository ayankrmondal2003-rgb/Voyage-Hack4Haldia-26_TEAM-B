import { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Copy, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw 
} from 'lucide-react';
import Brand from './Brand.jsx';
import DrawingCanvas from './DrawingCanvas.jsx';
import Toolbar from './Toolbar.jsx';
import PropertiesPanel from './PropertiesPanel.jsx';
import PresenceList from './PresenceList.jsx';
import useRoom from '../hooks/useRoom.js';
import { exportBoardToPng } from '../drawing/exportPng.js';

export default function Workspace({ room, onHome }) {
  const board = useRoom(room);
  
  // Tool & Styling State
  const [activeTool, setActiveTool] = useState('pen');
  const [color, setColor] = useState('#ef4444');
  const [fillColor, setFillColor] = useState('transparent');
  const [width, setWidth] = useState(4);
  const [fontSize, setFontSize] = useState(24);
  const [selectedId, setSelectedId] = useState(null);

  // Zoom & Pan State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState([0, 0]);

  // UI Notices
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');

  const selectedElement = board.strokes.find(s => s.id === selectedId);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    const warn = event => {
      if (board.pendingCount || board.storageWarning) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [board.pendingCount, board.storageWarning]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      setNotice('Invite link copied! Share with your team to collaborate live.');
    } catch {
      setNotice('Clipboard unavailable. Please copy URL from browser address bar.');
    }
  }

  function handleExportPng() {
    exportBoardToPng(board.strokes, room.roomId);
    setNotice('Exported whiteboard as PNG!');
    setTimeout(() => setNotice(''), 3000);
  }

  function handleZoom(delta) {
    setZoom(prev => {
      const next = Math.max(0.25, Math.min(3, prev + delta));
      return Math.round(next * 100) / 100;
    });
  }

  function handleResetZoom() {
    setZoom(1);
    setPan([0, 0]);
  }

  function leave() {
    if (!board.pendingCount || window.confirm('Some changes are unsynced. Keep this tab to retry saving. Leave now?')) {
      onHome();
    }
  }

  const isLive = board.status === 'Live';

  return (
    <main className="h-screen w-screen flex flex-col bg-[#fdfcf7] text-black overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-16 px-5 bg-white border-b-[2.5px] border-black flex items-center justify-between gap-4 z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 bg-white hover:bg-gray-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            aria-label="Back to home"
            title="Back to home"
            onClick={leave}
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
          </button>
          
          <Brand />
          
          <div className="h-6 w-[2px] bg-black/15 mx-1 hidden sm:block" />

          {/* Room Title Badge */}
          <div className="bg-[#fef08a] border-2 border-black rounded-xl px-3 py-1 shadow-[2px_2px_0px_#000] flex items-center gap-2">
            <span className="font-black text-xs text-black truncate max-w-[140px] sm:max-w-xs">{room.name}</span>
            <span className="text-[10px] font-mono font-bold text-gray-600 bg-white/70 px-1.5 py-0.5 rounded border border-black/20">
              #{room.roomId.slice(0, 6)}
            </span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5">
          {/* Connection Status Badge */}
          <span 
            className={`font-black text-xs px-3 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 ${
              isLive ? 'bg-[#bbf7d0] text-black' : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full border border-black ${isLive ? 'bg-[#10b981]' : 'bg-yellow-500 animate-pulse'}`} />
            <span className="hidden sm:inline">{board.status}</span>
          </span>

          {/* Presence Dropdown */}
          <PresenceList presence={board.presence} />

          {/* Export PNG Button */}
          <button
            type="button"
            onClick={handleExportPng}
            className="bg-white hover:bg-gray-100 text-black font-extrabold text-xs px-3.5 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer"
            title="Export whiteboard as high-res PNG"
          >
            <Download size={14} strokeWidth={2.5} />
            <span className="hidden md:inline">Export PNG</span>
          </button>

          {/* Copy Invite Link Button */}
          <button
            type="button"
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer"
            onClick={copy}
            title="Copy room invite link"
          >
            {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={2.5} />}
            <span>{copied ? 'Copied!' : 'Invite'}</span>
          </button>
        </div>
      </header>

      {/* Main Board Canvas Area */}
      <section 
        className="relative flex-1 min-h-0 bg-[#fdfcf7] overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)',
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan[0]}px ${pan[1]}px`
        }}
      >
        <DrawingCanvas
          strokes={board.strokes}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          color={color}
          fillColor={fillColor}
          width={width}
          fontSize={fontSize}
          authorId={board.identity.userId}
          roomId={room.roomId}
          zoom={zoom}
          pan={pan}
          setPan={setPan}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onPreview={board.preview}
          onComplete={board.complete}
          onUpdateElement={board.updateElement}
          onDeleteElement={board.deleteElement}
          onCursor={board.cursor}
          onUndo={board.undo}
          onRedo={board.redo}
        />

        {/* Floating Toolbar */}
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          canUndo={board.canUndo}
          canRedo={board.canRedo}
          onUndo={board.undo}
          onRedo={board.redo}
        />

        {/* Contextual Properties Panel */}
        <PropertiesPanel
          activeTool={activeTool}
          selectedElement={selectedElement}
          color={color}
          setColor={setColor}
          fillColor={fillColor}
          setFillColor={setFillColor}
          width={width}
          setWidth={setWidth}
          fontSize={fontSize}
          setFontSize={setFontSize}
          onUpdateSelected={board.updateElement}
        />

        {/* Remote Cursors Layer (mapped to screen coordinates with zoom/pan) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {board.cursors.map(c => {
            const screenX = c.position[0] * zoom + pan[0];
            const screenY = c.position[1] * zoom + pan[1];
            return (
              <div
                key={c.sessionId}
                className="absolute flex items-start gap-1 transition-all duration-75 ease-out"
                style={{
                  left: screenX,
                  top: screenY,
                  color: c.color
                }}
              >
                <svg className="w-5 h-5 -rotate-45" viewBox="0 0 24 24" fill={c.color}>
                  <path d="M3 3l7 18 3-7 7-3L3 3z" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <span 
                  className="text-white text-[10px] font-black px-1.5 py-0.5 rounded-md border-1.5 border-black shadow-[2px_2px_0px_#000] whitespace-nowrap"
                  style={{ backgroundColor: c.color }}
                >
                  {c.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Empty Canvas Hint */}
        {!board.strokes.length && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm border-[2.5px] border-black rounded-2xl p-6 shadow-[5px_5px_0px_#000] text-center max-w-sm pointer-events-none select-none z-10">
            <h2 className="font-black text-base text-black mb-1">Canvas is ready!</h2>
            <p className="text-xs font-semibold text-gray-600">
              Pick a tool: Draw with Pen [P], add Shapes [R, O, L, A], insert Text [T], or Pan [H].
            </p>
          </div>
        )}

        {/* Error / Warning Alert Banner */}
        {(board.error || board.storageWarning) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-100 border-2 border-black rounded-xl px-4 py-2 shadow-[3px_3px_0px_#000] text-xs font-black text-black flex items-center gap-3 z-30 max-w-lg">
            <span>⚠️ {board.storageWarning || board.error}</span>
            <button
              type="button"
              onClick={board.retry}
              className="bg-white hover:bg-gray-100 border border-black px-2 py-0.5 rounded text-[11px] font-extrabold underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Bottom Left Status Pill */}
        <div className="absolute bottom-5 left-5 z-20 pointer-events-none">
          <div className="bg-white border-2 border-black rounded-xl px-3 py-1.5 shadow-[3px_3px_0px_#000] text-xs font-black text-black flex items-center gap-2 pointer-events-auto">
            <span className={`w-2 h-2 rounded-full border border-black ${board.pendingCount ? 'bg-orange-500' : 'bg-[#10b981]'}`} />
            <span>
              {board.pendingCount
                ? `${board.pendingCount} unsynced`
                : isLive
                ? 'All changes saved'
                : 'Waiting to sync'}
            </span>
            <span className="text-gray-400 font-normal">/</span>
            <span className="font-mono text-gray-600">v{board.version}</span>
          </div>
        </div>

        {/* Bottom Right Zoom Controls (Section 8) */}
        <div className="absolute bottom-5 right-5 z-20 flex items-center gap-1.5 bg-white border-2 border-black rounded-xl p-1 shadow-[3px_3px_0px_#000]">
          <button
            type="button"
            onClick={() => handleZoom(-0.15)}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center font-bold text-black border border-transparent hover:border-black/20 cursor-pointer active:scale-95"
            title="Zoom Out"
          >
            <ZoomOut size={15} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-1 rounded-lg hover:bg-gray-100 text-xs font-mono font-bold text-black cursor-pointer"
            title="Reset Zoom to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={() => handleZoom(0.15)}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center font-bold text-black border border-transparent hover:border-black/20 cursor-pointer active:scale-95"
            title="Zoom In"
          >
            <ZoomIn size={15} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 border border-transparent hover:border-black/20 cursor-pointer"
            title="Reset View"
          >
            <RotateCcw size={13} strokeWidth={2.5} />
          </button>
        </div>
      </section>

      {/* Footer Info Strip */}
      <footer className="h-8 px-5 bg-white border-t-[2px] border-black flex items-center justify-between text-[11px] font-bold text-gray-600 z-10 flex-shrink-0">
        <span>{board.strokes.filter(s => s.active !== false).length} elements • {board.identity.name}</span>
        <span className="truncate max-w-xs sm:max-w-md">{notice || 'Excalidraw-inspired Whiteboard • Multi-Tool Sync • Per-User Undo/Redo'}</span>
        <span className="hidden sm:inline">Zoom: {Math.round(zoom * 100)}%</span>
      </footer>
    </main>
  );
}
