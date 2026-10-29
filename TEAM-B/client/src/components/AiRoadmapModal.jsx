import { useState, useMemo } from 'react';
import { Sparkles, X, Zap, Lightbulb, Compass, Network, ArrowRight, CheckCircle2 } from 'lucide-react';
import { synthesizePlan, generateCanvasElements } from '../lib/aiRoadmap.js';

const MODES = [
  { id: 'execution', label: '⚡ How to Execute Idea', icon: Zap, hint: 'Complete execution strategy: Concept ➔ Validation ➔ Tech ➔ Sprint ➔ Launch' },
  { id: 'ideation', label: '💡 Brainstorm Ideas', icon: Lightbulb, hint: 'Generates 4 breakthrough startup/project concepts from any domain' },
  { id: 'roadmap', label: '🗺️ Milestone Roadmap', icon: Compass, hint: 'Step-by-step phased timeline flowchart with connecting arrows' },
  { id: 'mindmap', label: '🧠 Concept Mindmap', icon: Network, hint: 'Central concept hub with radiating satellite topic cards' },
];

const PRESET_TOPICS = {
  execution: [
    'AI Collaborative Whiteboard',
    'Student Study Matcher',
    'Automated Resume Screener',
    'P2P Car Rental Platform',
    'On-Demand Dog Walking'
  ],
  ideation: [
    'AI & Autonomous Agents',
    'Fintech & Instant Payments',
    'Healthcare & Bio-Tech',
    'EdTech & Socratic Learning',
    'Remote Team Productivity'
  ],
  roadmap: [
    'Full-Stack Web App',
    'Hackathon 24h MVP Sprint',
    'Mobile App Launch',
    'B2B SaaS Platform',
    'AI Agent Architecture'
  ],
  mindmap: [
    'TEAM-B Whiteboard',
    'Autonomous Drone System',
    'E-Commerce Microservices',
    'Cloud Security Framework'
  ]
};

export default function AiRoadmapModal({ isOpen, onClose, onGenerate, currentCenter }) {
  const [mode, setMode] = useState('execution'); // 'execution' | 'ideation' | 'roadmap' | 'mindmap'
  const [topic, setTopic] = useState('AI Collaborative Whiteboard');
  const [isGenerating, setIsGenerating] = useState(false);

  const plan = useMemo(() => {
    return synthesizePlan({ topic: topic || 'Project Plan', mode });
  }, [topic, mode]);

  if (!isOpen) return null;

  function handleModeSelect(newMode) {
    setMode(newMode);
    // Switch to a relevant default preset for that mode
    const defaultTopic = PRESET_TOPICS[newMode]?.[0] || 'My Project Idea';
    setTopic(defaultTopic);
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

  const activeModeObj = MODES.find(m => m.id === mode) || MODES[0];
  const presetsForMode = PRESET_TOPICS[mode] || PRESET_TOPICS.execution;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm select-none">
      <div 
        className="bg-[#fdfcf7] border-[3px] border-black rounded-3xl p-6 shadow-[8px_8px_0px_#000] w-full max-w-2xl flex flex-col gap-4 text-black animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-[2px] border-black/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#fef08a] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Sparkles size={20} strokeWidth={2.5} className="text-black" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                FUNBOARD AI Innovation Studio
                <span className="text-[10px] font-extrabold uppercase bg-[#bbf7d0] border-1.5 border-black px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#000]">
                  AI Powered
                </span>
              </h2>
              <p className="text-xs font-semibold text-gray-600">
                Brainstorm breakthrough ideas, execution blueprints, and collaborative roadmaps.
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

        {/* 4 Mode Selector Tabs */}
        <div>
          <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1.5">
            Select AI Studio Mode
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-gray-100 p-1.5 rounded-2xl border-2 border-black">
            {MODES.map(m => {
              const Icon = m.icon;
              const isSelected = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModeSelect(m.id)}
                  className={`py-2 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-black scale-[1.02]'
                      : 'text-gray-600 hover:text-black border-2 border-transparent'
                  }`}
                >
                  <Icon size={14} strokeWidth={2.5} />
                  <span className="truncate">{m.label.replace(/^[^\w\s]+\s*/, '')}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] font-semibold text-gray-600 mt-1 italic">
            ℹ️ {activeModeObj.hint}
          </p>
        </div>

        {/* Quick Presets */}
        <div>
          <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1.5">
            Quick Examples ({activeModeObj.label})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presetsForMode.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setTopic(p)}
                className={`text-xs font-extrabold px-2.5 py-1 rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer ${
                  topic === p ? 'bg-[#fef08a] text-black' : 'bg-white hover:bg-yellow-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div>
          <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-1.5">
            {mode === 'execution' ? 'What is your idea?' : mode === 'ideation' ? 'Domain or topic to brainstorm:' : 'Project Name or Goal:'}
          </label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. AI-Powered Personal Chef, Drone Delivery Network, Learn Go in 30 Days..."
            className="w-full px-3.5 py-2 rounded-xl border-2 border-black bg-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#fef08a] shadow-[2px_2px_0px_#000]"
          />
        </div>

        {/* Live Preview of Generated Cards */}
        <div className="bg-white border-2 border-black rounded-2xl p-3 shadow-[3px_3px_0px_#000] max-h-40 overflow-y-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase text-gray-700">
              Canvas Elements Preview
            </span>
            <span className="text-[10px] font-bold text-gray-500">
              {mode === 'execution' ? '5 Step-by-Step Execution Cards' :
               mode === 'ideation' ? 'Central Hub + 4 Breakthrough Ideas' :
               mode === 'mindmap' ? 'Central Hub + 4 Concept Satellites' :
               `${plan.phases?.length || 5} Phased Milestones`}
            </span>
          </div>

          {mode === 'execution' && plan.stages && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {plan.stages.map((st, idx) => (
                <div 
                  key={idx}
                  className="flex-shrink-0 w-36 rounded-xl border-1.5 border-black p-2 shadow-[1.5px_1.5px_0px_#000]"
                  style={{ backgroundColor: st.color }}
                >
                  <p className="text-[10px] font-black truncate">{st.badge}. {st.name}</p>
                  <p className="text-[8.5px] font-semibold text-gray-700 mt-0.5 line-clamp-2">
                    {st.tasks[0]}
                  </p>
                </div>
              ))}
            </div>
          )}

          {mode === 'ideation' && plan.ideas && (
            <div className="grid grid-cols-2 gap-2">
              {plan.ideas.map((id, idx) => (
                <div 
                  key={idx}
                  className="rounded-xl border-1.5 border-black p-2 shadow-[1px_1px_0px_#000] bg-blue-50"
                >
                  <p className="text-[10px] font-black truncate">💡 {id.title}</p>
                  <p className="text-[8.5px] font-semibold text-gray-700 truncate">{id.tasks?.[0]}</p>
                </div>
              ))}
            </div>
          )}

          {mode === 'roadmap' && plan.phases && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {plan.phases.map((ph, idx) => (
                <div 
                  key={idx}
                  className="flex-shrink-0 w-36 rounded-xl border-1.5 border-black p-2 shadow-[1.5px_1.5px_0px_#000]"
                  style={{ backgroundColor: ph.color }}
                >
                  <p className="text-[10px] font-black truncate">{ph.title}</p>
                  <p className="text-[8.5px] font-semibold text-gray-700 mt-0.5 line-clamp-2">
                    {ph.tasks.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {mode === 'mindmap' && plan.satellites && (
            <div className="grid grid-cols-2 gap-2">
              {plan.satellites.map((sat, idx) => (
                <div 
                  key={idx}
                  className="rounded-xl border-1.5 border-black p-2 shadow-[1px_1px_0px_#000]"
                  style={{ backgroundColor: sat.color }}
                >
                  <p className="text-[10px] font-black truncate">{sat.title}</p>
                  <p className="text-[8.5px] font-semibold text-gray-700 truncate">{sat.tasks?.[0]}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature Hint Callout */}
        <div className="bg-[#fef9c3] border border-black/30 rounded-xl p-2.5 flex items-start gap-2 text-[11px] font-semibold text-gray-800">
          <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Multiplayer & Annotatable:</strong> Generated as native whiteboard elements. Connected peers see them live! Drag, circle with the Pen tool, add sticky notes, or undo anytime.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-1">
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
            {isGenerating ? 'Synthesizing...' : `Generate ${activeModeObj.label.replace(/^[^\w\s]+\s*/, '')}`}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
