/* The notebook, in localStorage. Storage can be unavailable (private windows,
   blocked site data), so every call is guarded and the game simply starts
   with a blank notebook when it fails — a save is a convenience, never a
   dependency. */
const KEY = 'lacewing-notebook';

export function load(){
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const n = JSON.parse(raw);
    return (n && n.found && n.log) ? n : null;
  } catch { return null; }
}
export function save(N){
  try { localStorage.setItem(KEY, JSON.stringify(N)); return true; }
  catch { return false; }
}
export function clear(){
  try { localStorage.removeItem(KEY); } catch { /* nothing to do */ }
}
