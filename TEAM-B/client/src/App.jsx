import { useEffect, useState } from 'react';
import { request } from './lib/api.js';
import Home from './components/Home.jsx';
import Workspace from './components/Workspace.jsx';

const roomFromUrl = () => new URLSearchParams(location.search).get('room') || '';

export default function App() {
  const [roomId, setRoomId] = useState(roomFromUrl);
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const onPop = () => setRoomId(roomFromUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    let active = true;
    setRoom(null);
    setError('');
    if (!roomId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    request('/api/rooms/' + encodeURIComponent(roomId))
      .then(data => {
        if (active) setRoom(data);
      })
      .catch(err => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [roomId, retry]);

  function navigate(id) {
    history.pushState({}, '', id ? '?room=' + encodeURIComponent(id) : location.pathname);
    setRoomId(id);
  }

  if (room) return <Workspace key={room.roomId} room={room} onHome={() => navigate('')} />;

  if (roomId) {
    return (
      <main className="min-h-screen bg-[#fdfcf7] grid place-items-center p-6 text-black">
        <div className="bg-white border-[2.5px] border-black rounded-2xl p-8 shadow-[6px_6px_0px_#000] max-w-md w-full text-center">
          <div className="w-12 h-12 bg-[#fef08a] border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] mx-auto mb-4 flex items-center justify-center text-xl">
            {loading ? '⏳' : '⚠️'}
          </div>
          <h1 className="text-xl font-black mb-2">
            {loading ? 'Opening your whiteboard…' : 'Unable to open room'}
          </h1>
          {error && (
            <p className="text-xs text-red-600 font-bold bg-red-50 p-3 rounded-lg border border-red-300 mb-6" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            {!loading && (
              <button
                type="button"
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-black text-xs px-4 py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                onClick={() => setRetry(v => v + 1)}
              >
                Try Again
              </button>
            )}
            <button
              type="button"
              className="bg-white hover:bg-gray-100 text-black font-black text-xs px-4 py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              onClick={() => navigate('')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  return <Home onOpen={navigate} />;
}
