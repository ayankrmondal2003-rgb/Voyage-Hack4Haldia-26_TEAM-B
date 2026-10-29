import { useState, useMemo } from 'react';
import { Sparkles, X, Compass, Lightbulb, ArrowRight, CheckCircle2 } from 'lucide-react';
import { synthesizePlan, generateCanvasElements } from '../lib/aiRoadmap.js';

const PRESETS = [
  { id: 'fullstack', label: '⚡ Full-Stack Web App' },
  { id: 'ai-agent', label: '🤖 AI Agent Architecture' },
  { id: 'hackathon', label: '⏱️ 24h Hackathon MVP' },
  { id: 'mobile-app', label: '📱 Mobile App Launch' },
  { id: 'saas', label: '☁️ B2B SaaS Platform' },
];

export default function AiRoadmapModal({ isOpen, onClose, onGenerate, currentCenter }) {
  const [mode, setMode] = useState('roadmap'); // 'roadmap' | 'mindmap'
  const [topic, setTopic] = useState('Full-Stack Web Application');
  const [isGenerating, setIsGenerating] = useState(false);

  const plan = useMemo(() => {
    return synthesizePlan({ topic: topic || 'Project Plan', mode });
  }, [topic, mode]);

  if (!isOpen) return null;

  function handlePresetClick(presetLabel) {
    // Strip leading emoji
    const clean = presetLabel.replace(/^[^\w\s]+\s*/, '');
    setTopic(clean);
  }

  function handleConfirm() {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const elements = generateCanvasElements(plan, {
          centerX: currentCenter?.x ?? 500,
          centerY: currentCenter?.y ?? 350,
          roomId: currentCenter?.roomId,
          authorId: currentCenter?.authorId
        });
        onGenerate(elements);
        onClose();
      } finally {
        setIsGenerating(false);
      }
    }, 250);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm select-none">
      <div 
        className="bg-[#fdfcf7] border-[3px] border-black rounded-3xl p-6 shadow-[8px_8px_0px_#000] w-full max-w-2xl flex flex-col gap-5 text-black animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-[2px] border-black/15 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#fef08a] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Sparkles size={20} strokeWidth={2.5} className="text-black" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                FUNBOARD AI Studio
                <span className="text-[10px] font-extrabold uppercase bg-[#bbf7d0] border-1.5 border-black px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#000]">
                  New
                </span>
              </h2>
              <p className="text-xs font-semibold text-gray-600">
                Generate live collaborative roadmaps & brainstorm ideas directly on the whiteboard.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-200 border-2 border-transparent hover:border-black transition-all cursor-pointer"
            title="Close"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1.5 rounded-2xl border-2 border-black">
          <button
            type="button"
            onClick={() => setMode('roadmap')}
            className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'roadmap'
                ? 'bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-black'
                : 'text-gray-600 hover:text-black border-2 border-transparent'
            }`}
          >
            <Compass size={16} strokeWidth={2.5} />
            Milestone Roadmap (Flowchart)
          </button>
          <button
            type="button"
            onClick={() => setMode('mindmap')}
            className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'mindmap'
                ? 'bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-black'
                : 'text-gray-600 hover:text-black border-2 border-transparent'
            }`}
          >
            <Lightbulb size={16} strokeWidth={2.5} />
            Idea Brainstorm (Mindmap)
          </button>
        </div>

        {/* Preset Chips */}
        <div>
          <span className="text-[11px] font-black uppercase text-gray-500 tracking-wider block mb-2">
            Quick Templates
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetClick(p.label)}
                className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-white hover:bg-yellow-100 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div>
          <label className="text-[11px] font-black uppercase text-gray-500 tracking-wider block mb-2">
            Topic or Goal
          </label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. Autonomous Drone System, Learn Python in 30 Days, Coffee Shop Franchise..."
            className="w-full px-4 py-2.5 rounded-xl border-2 border-black bg-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#fef08a] shadow-[2px_2px_0px_#000]"
          />
        </div>

        {/* Live Preview Card */}
        <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#000] max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase text-gray-700">
              Preview of Generated Cards
            </span>
            <span className="text-[10px] font-bold text-gray-500">
              {mode === 'roadmap' ? `${plan.phases?.length || 0} Connected Phases` : 'Central Hub + 4 Concept Nodes'}
            </span>
          </div>

          {mode === 'roadmap' && plan.phases && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {plan.phases.map((ph, idx) => (
                <div 
                  key={idx}
                  className="flex-shrink-0 w-36 rounded-xl border-1.5 border-black p-2 shadow-[2px_2px_0px_#000]"
                  style={{ backgroundColor: ph.color }}
                >
                  <p className="text-[11px] font-black truncate">{ph.title}</p>
                  <p className="text-[9px] font-semibold text-gray-700 mt-1 line-clamp-2">
                    {ph.tasks.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {mode === 'mindmap' && plan.satellites && (
            <div className="grid grid-cols-2 gap-2">
              <div 
                className="col-span-2 rounded-xl border-1.5 border-black p-2 text-center shadow-[1px_1px_0px_#000]"
                style={{ backgroundColor: plan.center?.color }}
              >
                <p className="text-[11px] font-black">{plan.center?.title}</p>
              </div>
              {plan.satellites.map((sat, idx) => (
                <div 
                  key={idx}
                  className="rounded-xl border-1.5 border-black p-2 shadow-[1px_1px_0px_#000]"
                  style={{ backgroundColor: sat.color }}
                >
                  <p className="text-[10px] font-black truncate">{sat.title}</p>
                  <p className="text-[9px] font-semibold text-gray-700 truncate">
                    {sat.tasks?.[0]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature Hint Callout */}
        <div className="bg-[#fef9c3] border border-black/30 rounded-xl p-2.5 flex items-start gap-2 text-[11px] font-semibold text-gray-800">
          <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Multiplayer & Fully Interactive:</strong> All cards and connecting arrows are generated as native whiteboard elements. You and your teammates can select, move, annotate on top with the Pen tool, or undo anytime.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold text-xs rounded-xl hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isGenerating || !topic.trim()}
            onClick={handleConfirm}
            className="px-5 py-2.5 font-black text-xs rounded-xl bg-[#2563eb] hover:bg-blue-600 text-white border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          >
            <Sparkles size={16} />
            {isGenerating ? 'Synthesizing...' : 'Generate on Whiteboard'}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

