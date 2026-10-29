import { Users } from 'lucide-react';

export default function PresenceList({ presence }) {
  const count = presence.users?.length || 0;
  return (
    <details className="presence-dropdown relative select-none">
      <summary className="bg-white hover:bg-gray-50 border-2 border-black rounded-xl px-3 py-1.5 shadow-[2px_2px_0px_#000] font-black text-xs flex items-center gap-2 cursor-pointer list-none active:translate-x-[1px] active:translate-y-[1px] transition-all">
        <Users size={15} strokeWidth={2.5} className="text-black" />
        <span>{count} {count === 1 ? 'user' : 'users'}</span>
      </summary>
      <div className="absolute right-0 top-11 bg-white border-2 border-black rounded-xl p-3 shadow-[4px_4px_0px_#000] min-w-[200px] z-50 animate-in fade-in zoom-in-95 duration-100">
        <div className="text-[11px] font-black uppercase text-gray-500 pb-2 border-b-2 border-black/10 flex justify-between">
          <span>Active Users</span>
          <span className="text-black">{presence.sessions || count} sessions</span>
        </div>
        <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
          {presence.users?.map(user => (
            <div key={user.userId} className="flex items-center justify-between text-xs font-bold py-1">
              <span className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full border border-black flex-shrink-0" 
                  style={{ backgroundColor: user.color }} 
                />
                <span className="text-black">{user.name}</span>
              </span>
              <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300">
                {user.sessions > 1 ? `${user.sessions} tabs` : 'Live'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
