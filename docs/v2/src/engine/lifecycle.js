/* The lacewing's whole life, played out on the leaf where you found the eggs.

   This is the one thing in the project that a photograph cannot do and a
   paragraph does badly: the four stages are the same animal, and the reason
   they have to be reared one-to-a-cup is something the larvae demonstrate
   rather than something an adult asserts. So it is a scripted sequence —
   eight beats, about half a minute — that runs only while the player stays
   and keeps looking.

   Each beat owns the scene slot: it can add, move or remove models, and it
   carries the line that appears while it plays. `reveal` names the notebook
   card the beat fills in, without a guess, because the garden showed it. */
import * as THREE from 'three';
import { MODELS } from '../entities/models.js';

const v = (x, y, z) => new THREE.Vector3(x, y, z);

/** Remove everything currently in the slot. */
function clear(g){
  while (g.children.length){
    const c = g.children[0];
    g.remove(c);
    c.traverse(o => o.geometry && o.geometry.dispose());
  }
}

function add(g, model, pos){
  const o = MODELS[model]();
  if (pos) o.position.copy(pos);
  g.add(o);
  return o;
}

export const BEATS = [
  {
    dur: 4,
    caption: 'Each egg sits on its own silk stalk. That stalk is a fence — the first larva out cannot reach the others.',
    enter(ctx){
      clear(ctx.group);
      ctx.eggs = add(ctx.group, 'eggCluster', v(0, 0, 0));
    },
    update(ctx, k){
      if (ctx.eggs) ctx.eggs.rotation.z = Math.sin(k * 26) * 0.05 * k;
    },
  },
  {
    dur: 4,
    caption: 'One splits. What climbs out is nothing like the adult — flat, bristly, with jaws it already knows how to use.',
    reveal: 'lacewing-larva',
    enter(ctx){
      ctx.larva = add(ctx.group, 'larva', v(0.01, 0.01, 0));
      ctx.larva.scale.multiplyScalar(0.4);
    },
    update(ctx, k){
      ctx.larva.scale.setScalar(0.4 + k * 0.6);
      ctx.larva.position.y = 0.01 + k * 0.012;
    },
  },
  {
    dur: 4,
    caption: 'It walks off the stalk hungry. It has to be: a lacewing larva eats from the hour it hatches.',
    enter(ctx){
      ctx.aphids = [];
      for (let i = 0; i < 4; i++){
        ctx.aphids.push(add(ctx.group, 'aphid', v(0.14 + i * 0.035, 0.012, -0.02 + (i % 2) * 0.03)));
      }
    },
    update(ctx, k){
      ctx.larva.position.x = 0.01 + k * 0.1;
      ctx.larva.position.z = Math.sin(k * 7) * 0.008;
      ctx.larva.rotation.y = Math.sin(k * 7) * 0.3;
    },
  },
  {
    dur: 5,
    caption: 'It drains an aphid in about a minute, then goes straight to the next one. Two hundred of them before it is done growing.',
    update(ctx, k){
      ctx.larva.position.x = 0.11 + k * 0.05;
      const eaten = Math.floor(k * 3);
      ctx.aphids.forEach((a, i) => { a.visible = i >= eaten; });
    },
  },
  {
    dur: 5,
    caption: 'A second larva hatches behind it. They do not share a leaf for long.',
    reveal: null,
    enter(ctx){
      ctx.larva2 = add(ctx.group, 'larva', v(-0.02, 0.012, 0.01));
    },
    update(ctx, k){
      ctx.larva2.position.x = -0.02 + k * 0.1;
      ctx.larva2.position.z = 0.01 - k * 0.012;
      ctx.larva2.rotation.y = 0.4;
    },
  },
  {
    dur: 5,
    caption: 'The bigger one eats the smaller one. This is why an insectary rears them <b>one to a cup</b> — not fussiness, arithmetic.',
    update(ctx, k){
      if (!ctx.larva2) return;
      ctx.larva2.scale.setScalar(Math.max(0.001, (1 - k)) * 9);
      ctx.larva2.visible = k < 0.95;
      ctx.larva.position.x = 0.16 - k * 0.02;
    },
  },
  {
    dur: 5,
    caption: 'Fed enough, it spins a silk cocoon the size of a peppercorn and seals itself in.',
    reveal: 'lacewing-cocoon',
    enter(ctx){
      if (ctx.larva2) { ctx.group.remove(ctx.larva2); ctx.larva2 = null; }
      ctx.aphids.forEach(a => { a.visible = false; });
      ctx.cocoon = add(ctx.group, 'cocoon', ctx.larva.position.clone());
      ctx.cocoon.scale.multiplyScalar(0.1);
    },
    update(ctx, k){
      ctx.cocoon.scale.setScalar(9 * (0.1 + k * 0.9));
      ctx.larva.visible = k < 0.4;
    },
  },
  {
    dur: 6,
    caption: 'Days later it cuts a neat round lid and climbs out with lace wings and gold eyes — and from here on it drinks nectar, not pests.',
    reveal: 'lacewing-adult',
    enter(ctx){
      ctx.adult = add(ctx.group, 'adult', ctx.cocoon.position.clone());
      ctx.adult.visible = false;
    },
    update(ctx, k){
      ctx.cocoon.visible = k < 0.35;
      ctx.adult.visible = k >= 0.3;
      ctx.adult.position.y = ctx.cocoon.position.y + Math.max(0, k - 0.5) * 0.12;
      ctx.adult.rotation.y = k * 1.2;
      if (ctx.adult.userData.wings){
        ctx.adult.userData.wings.children.forEach(w => {
          w.rotation.z = w.userData.side * (0.25 + Math.sin(k * 90) * 0.35);
        });
      }
    },
  },
];

export const TOTAL = BEATS.reduce((s, b) => s + b.dur, 0);

/** Runs the sequence in one scene slot. Pauses when the player looks away. */
export class Lifecycle {
  constructor(group, onBeat){
    this.ctx = { group };
    this.onBeat = onBeat;
    this.i = -1;
    this.t = 0;
    this.elapsed = 0;
    this.done = false;
  }

  advance(dt){
    if (this.done) return;
    this.elapsed += dt;
    if (this.i < 0 || this.t >= BEATS[this.i].dur){
      this.i++;
      this.t = 0;
      if (this.i >= BEATS.length){ this.done = true; return; }
      const b = BEATS[this.i];
      b.enter?.(this.ctx);
      this.onBeat?.(b, this.i);
    }
    const b = BEATS[this.i];
    this.t += dt;
    b.update?.(this.ctx, Math.min(1, this.t / b.dur));
  }

  get progress(){ return Math.min(1, this.elapsed / TOTAL); }
  get caption(){ return this.i >= 0 && this.i < BEATS.length ? BEATS[this.i].caption : ''; }
}
