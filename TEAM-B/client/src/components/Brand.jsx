import { PenTool } from 'lucide-react';

export default function Brand() {
  return (
    <div className="brand flex items-center gap-2.5 select-none">
      <span className="brand-icon-box bg-[#fde047] text-black border-2 border-black rounded-lg p-1.5 shadow-[2px_2px_0px_#000] flex items-center justify-center">
        <PenTool size={18} strokeWidth={2.5} className="rotate-[-10deg]" />
      </span>
      <div className="flex items-center gap-2">
        <span className="font-black text-lg tracking-tight text-black">FUNBOARD</span>
        <span className="text-gray-400 font-medium">|</span>
        <span className="text-xs font-bold text-gray-700 hidden sm:inline tracking-tight">Collaborative Whiteboard</span>
      </div>
    </div>
  );
}
