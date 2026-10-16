/* A minimal store: subscribe, set, read. The UI's projection of the game,
   never the source of truth — the garden in core/ is. Small enough that
   pulling in a state library would cost more than it saves. */
export function createStore(initial){
  let state = initial;
  const subs = new Set();
  return {
    get: () => state,
    set(patch){
      state = { ...state, ...patch };
      for (const fn of subs) fn(state);
    },
    subscribe(fn){ subs.add(fn); return () => subs.delete(fn); },
  };
}

export const hud = createStore({
  found: {}, watched: {}, opened: null,
  count: 0, total: 0, stats: { found: 0, total: 0, firstGuessRight: 0, watched: 0 },
  log: [], prompt: null, panel: null, pending: null, watching: null,
});
