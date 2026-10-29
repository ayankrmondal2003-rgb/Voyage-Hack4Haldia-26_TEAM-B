export const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export async function request(path, options = {}) {
 let response;
 try { response = await fetch(apiUrl + path, { ...options, signal: AbortSignal.timeout(8000), headers: { 'Content-Type': 'application/json', ...options.headers } }); }
 catch { throw new Error('Cannot reach the server. Check your connection and try again.'); }
 const data = await response.json().catch(() => null);
 if (!response.ok) throw new Error(data?.error || 'The server is unavailable. Please try again.');
 if (!data) throw new Error('Unexpected server response. Please try again.');
 return data;
}
