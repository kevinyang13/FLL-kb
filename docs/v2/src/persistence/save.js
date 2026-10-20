/* The notebook, in localStorage. Storage can be unavailable (private windows,
   blocked site data), so every call is guarded and the game simply starts
   with a blank notebook when it fails — a save is a convenience, never a
   dependency. */
const KEY = 'lacewing-notebook';
const POSE = 'lacewing-pose';

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
/* Where the player was standing, so a refresh puts them back rather than at
   the garden gate. Kept in its own key: a notebook is worth keeping across
   a rebuild of the garden and a position may not be, and separating them
   means a bad pose can be thrown away without losing the cards.

   `v` is the shape of the world the pose was taken in. The garden gets
   rebuilt as this is developed, and a position saved in the old one can land
   in a lake that did not exist then — so a pose from a different world is
   ignored rather than trusted. */
export function savePose(pose){
  try { localStorage.setItem(POSE, JSON.stringify(pose)); return true; }
  catch { return false; }
}
export function loadPose(v){
  try {
    const raw = localStorage.getItem(POSE);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p || p.v !== v) return null;
    return [p.x, p.z, p.yaw, p.pitch].every(n => typeof n === 'number' && isFinite(n)) ? p : null;
  } catch { return null; }
}

export function clear(){
  try { localStorage.removeItem(KEY); localStorage.removeItem(POSE); }
  catch { /* nothing to do */ }
}
