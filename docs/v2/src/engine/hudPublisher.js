/* The only road from the game to the interface. The UI never reads the world,
   and the engine never reads the DOM — this throttled snapshot is the whole
   contract between them. */
import { foundCount, totalCount, summary } from '../core/notebook.js';

const EVERY_MS = 120;

export class HudPublisher {
  constructor(store){ this.store = store; this.last = 0; }

  publish(N, extra, now){
    if (now - this.last < EVERY_MS) return;
    this.last = now;
    this.store.set({
      found: { ...N.found },
      watched: { ...N.watched },
      opened: N.opened,
      count: foundCount(N), total: totalCount(),
      stats: summary(N),
      log: N.log.slice(0, 12),
      ...extra,
    });
  }
}
