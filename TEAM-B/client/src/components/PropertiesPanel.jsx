import { Pipette } from 'lucide-react';

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

  return (
    <div className="absolute top-20 left-5 bg-white border-2 border-black rounded-2xl p-3.5 shadow-[4px_4px_0px_#000] z-20 flex flex-col gap-3 min-w-[190px] select-none text-black">
      {/* Stroke Color */}
      <div>
        <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1.5">
          {isText ? 'Text Color' : 'Stroke Color'}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STROKE_COLORS.map(c => {
            const isSelected = (selectedElement ? (selectedElement.color || selectedElement.strokeColor) : color) === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleColorChange(c)}
                className={`w-5 h-5 rounded-full border-2 border-black transition-all ${
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
        <div className="pt-2 border-t border-black/10">
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
                  className={`w-5 h-5 rounded-md border-2 border-black transition-all relative overflow-hidden ${
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
        <div className="pt-2 border-t border-black/10">
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
                  className={`flex-1 py-1 px-1.5 rounded-lg border-2 border-black text-xs font-black transition-all ${
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
        <div className="pt-2 border-t border-black/10">
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
                  className={`flex-1 py-1 px-1.5 rounded-lg border-2 border-black text-xs font-black transition-all ${
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
    </div>
  );
}

