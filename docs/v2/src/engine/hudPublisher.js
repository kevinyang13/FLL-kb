/* The only road from the simulation to the interface. The UI never reads the
   garden directly, and the engine never reads the DOM — this throttled
   snapshot is the whole contract between them. */
import { goalList, aliveCount } from '../core/garden.js';

const EVERY_MS = 120;

export class HudPublisher {
  constructor(store){ this.store = store; this.last = 0; }

  publish(G, extra, now){
    if (now - this.last < EVERY_MS) return;
    this.last = now;
    this.store.set({
      day: G.day, temp: G.temp, released: G.released, died: G.died,
      alive: aliveCount(G), pop: { ...G.pop }, food: { ...G.food },
      cups: G.cups.map(c => c.length ? { ...c[0], count: c.length } : null),
      shelter: [...G.shelter],
      goals: goalList(G), log: G.log.slice(0, 24), over: G.over,
      ...extra,
    });
  }
}
