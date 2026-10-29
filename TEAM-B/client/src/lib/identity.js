import { UUID, userProfile } from '../../../shared/protocol.js';
let cached;
export function getIdentity() {
  if (cached) return cached;
  let userId;
  try { userId = localStorage.getItem('team-b:user-id'); } catch { /* Private storage may be disabled. */ }
  if (!UUID.test(userId || '')) {
    userId = crypto.randomUUID();
    try { localStorage.setItem('team-b:user-id', userId); } catch { /* Identity lasts for this page only. */ }
  }
  cached = userProfile(userId);
  return cached;
}

