/* One saved garden in localStorage. Storage can be unavailable (private
   windows, blocked site data), so every call is guarded and the game simply
   starts fresh when it fails — a save is a convenience, never a dependency. */
const KEY = 'lacewing-v2';

export function load(){
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const g = JSON.parse(raw);
    return (g && typeof g.day === 'number') ? g : null;
  } catch { return null; }
}

export function save(G){
  try { localStorage.setItem(KEY, JSON.stringify(G)); return true; }
  catch { return false; }
}

export function clear(){
  try { localStorage.removeItem(KEY); } catch { /* nothing to do */ }
}
