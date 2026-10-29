import { useState } from 'react';
import Brand from './Brand.jsx';
import { request } from '../lib/api.js';

export default function Home({ onOpen }) {
  const [roomName, setRoomName] = useState('Testing');
  const [id, setId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function open(create) {
    setBusy(true);
    setError('');
    try {
      if (create) {
        const name = roomName.trim() || 'Testing';
        const room = await request('/api/rooms', {
          method: 'POST',
          body: JSON.stringify({ name })
        });
        onOpen(room.roomId);
      } else {
        const cleanId = id.trim().replace(/^room-/, '').toLowerCase();
        const room = await request('/api/rooms/' + encodeURIComponent(cleanId));
        onOpen(room.roomId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfcf7] text-black selection:bg-yellow-200">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b-2 border-black/10">
        <Brand />
        <span className="bg-[#bbf7d0] text-black font-extrabold text-xs tracking-wider px-3.5 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_#000]">
          ✨ HACK4HALDIA'26 • TEAM B
        </span>
      </header>

      {/* Main Hero Container */}
      <main className="max-w-7xl mx-auto px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Hero Text + Action Card */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <span className="bg-[#fef08a] text-black font-extrabold text-[11px] tracking-widest uppercase px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_#000] mb-5">
              A LITTLE SPACE. A BIG IDEA.
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-black leading-[1.08] tracking-tight mb-4">
              Big ideas start with a<br />
              <span className="inline-block bg-[#fde047] text-black px-3 py-0.5 border-[2.5px] border-black shadow-[4px_4px_0px_#000] rounded-xl mt-1.5">
                bold stroke.
              </span>
            </h1>

            <p className="text-gray-700 text-sm sm:text-base font-medium max-w-xl leading-relaxed mb-8">
              Brainstorm, sketch, diagram and collaborate with your team in real time. No sign-ups, no friction — just pure creative velocity on a shared canvas.
            </p>

            {/* Neo-brutalist Action Card */}
            <div className="w-full max-w-lg bg-white border-[2.5px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000]">
              <div className="space-y-3">
                <input
                  type="text"
                  className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-sm font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Testing"
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  maxLength={80}
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => open(true)}
                  className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-extrabold text-sm py-3 px-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>✨</span> {busy ? 'Creating Room…' : 'Create New Room'}
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-[1.5px] bg-gray-300"></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                  OR JOIN AN EXISTING ROOM
                </span>
                <div className="flex-1 h-[1.5px] bg-gray-300"></div>
              </div>

              {/* Join Existing Room Form */}
              <form onSubmit={e => { e.preventDefault(); open(false); }} className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 min-w-0 bg-white border-2 border-black rounded-xl px-3.5 py-2.5 text-xs font-mono font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter Room ID (e.g. room-7f2a8c)"
                  value={id}
                  onChange={e => setId(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={busy || !id.trim()}
                  className="bg-[#fde047] hover:bg-[#facc15] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  Join Room →
                </button>
              </form>

              {error && (
                <p className="text-xs text-red-600 font-bold mt-3 bg-red-50 p-2.5 rounded-lg border border-red-300" role="alert">
                  {error}
                </p>
              )}

              <p className="text-[11px] text-gray-500 font-semibold text-center mt-4">
                ✦ No sign-up required. Just a little room to think.
              </p>
            </div>
          </div>

          {/* Right Column: Hero Illustration Whiteboard Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              className="relative w-full max-w-md h-[400px] bg-white border-[2.5px] border-black rounded-2xl shadow-[6px_6px_0px_#000] p-6 overflow-hidden select-none"
              style={{
                backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)',
                backgroundSize: '20px 20px'
              }}
            >
              {/* Sticky Note 1 (Yellow) */}
              <div className="absolute top-5 left-5 bg-[#fef08a] border-2 border-black rounded-lg p-3 shadow-[4px_4px_0px_#000] max-w-[160px] rotate-[-2deg]">
                <div className="w-8 h-2 bg-yellow-300/80 border border-black/30 mx-auto -mt-4 mb-1.5 rounded-sm"></div>
                <p className="text-[11px] font-black text-black leading-tight">
                  📌 Launch Day:<br />
                  <span className="font-semibold text-[10px] text-gray-800">Ship the live canvas fast!</span>
                </p>
              </div>

              {/* Hand-drawn Star Doodle */}
              <div className="absolute top-7 right-20 text-3xl select-none" style={{ filter: 'drop-shadow(2px 2px 0px #000)' }}>
                ⭐
              </div>

              {/* Bob's Live Cursor */}
              <div className="absolute top-16 right-16 flex items-start gap-1 z-10 pointer-events-none">
                <svg className="w-5 h-5 text-[#3b82f6] -rotate-45" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3l7 18 3-7 7-3L3 3z" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <span className="bg-[#3b82f6] text-white text-[9px] font-black px-1.5 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_#000]">
                  Bob
                </span>
              </div>

              {/* Sticky Note 2 (Coral / Red) */}
              <div className="absolute top-28 right-5 bg-[#f87171] text-white border-2 border-black rounded-lg p-3 shadow-[4px_4px_0px_#000] max-w-[165px] rotate-[2deg]">
                <p className="text-[11px] font-black leading-tight">
                  ✦ Idea:<br />
                  <span className="font-medium text-[10px] text-white/95">Real-time multi-user strokes via WebSockets!</span>
                </p>
              </div>

              {/* Dotted Blue Oval */}
              <div className="absolute bottom-20 left-20 w-28 h-16 border-2 border-dashed border-[#3b82f6] bg-[#3b82f6]/10 rounded-full rotate-[-4deg]"></div>

              {/* Sticky Note 3 (Mint Green) */}
              <div className="absolute bottom-5 left-5 bg-[#86efac] text-black border-2 border-black rounded-lg p-3 shadow-[4px_4px_0px_#000] max-w-[170px] rotate-[-1deg]">
                <p className="text-[11px] font-black leading-tight">
                  ✨ Neo-Brutalism:<br />
                  <span className="font-semibold text-[10px] text-gray-800">Bold borders & hard shadows!</span>
                </p>
              </div>

              {/* Alice's Live Cursor */}
              <div className="absolute bottom-20 left-36 flex items-start gap-1 z-10 pointer-events-none">
                <svg className="w-5 h-5 text-[#10b981] -rotate-45" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3l7 18 3-7 7-3L3 3z" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <span className="bg-[#10b981] text-white text-[9px] font-black px-1.5 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_#000]">
                  Alice (drawing)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Three Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 mb-8">
          <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000]">
            <span className="inline-block bg-[#fef08a] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black mb-3">
              01 / TOOLS
            </span>
            <h3 className="font-black text-sm text-black mb-1">Draw Freely</h3>
            <p className="text-xs text-gray-600 font-semibold leading-relaxed">
              Pens, markers, translucent highlighters, geometric shapes, dashed strokes, and interactive inline text.
            </p>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000]">
            <span className="inline-block bg-[#bbf7d0] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black mb-3">
              02 / SHARING
            </span>
            <h3 className="font-black text-sm text-black mb-1">Share Ideas</h3>
            <p className="text-xs text-gray-600 font-semibold leading-relaxed">
              1-click invite link, instant room sync across all teammates, and crystal-clear PNG board export.
            </p>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000]">
            <span className="inline-block bg-[#fca5a5] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black mb-3">
              03 / SYNC
            </span>
            <h3 className="font-black text-sm text-black mb-1">Make it Together</h3>
            <p className="text-xs text-gray-600 font-semibold leading-relaxed">
              Real-time collaborative stroke streaming, per-user undo/redo, and persistent MongoDB storage.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-6 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-semibold">
        <span>TEAM-B • FUNBOARD Live Collaborative Whiteboard</span>
        <span>Hack4Haldia 2026 • Persistent MongoDB Multi-User Sync</span>
      </footer>
    </div>
  );
}
