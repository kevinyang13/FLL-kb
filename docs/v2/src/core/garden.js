/* The world's data model and all the rules that change it. Pure: no three.js,
   no DOM, no rendering. Everything the UI shows is derived from this object,
   and the day step is a function of state, so it can be reasoned about and
   tested on its own. */
import { CUPS, STAGES, STAGE_DAYS, TEMP, FOODS } from '../data/species.js';

let _id = 0;
const nid = () => ++_id;

export function freshGarden(){
  return {
    day: 1,
    temp: TEMP.ideal,
    cups: Array.from({ length: CUPS }, (_, i) => (
      i < 2 ? [{ id: nid(), stage: 'egg', age: 0, fed: 2 }] : []
    )),
    shelter: Array(CUPS).fill(false),
    food: { aphid: 6, moth: 5, fly: 3 },
    pop: { aphids: 40, ants: 0, ladybugs: 0, lacewings: 0, wildLarvae: 0, flowers: 0, eggs: 0 },
    released: 0, died: 0, winDays: 0, over: null,
    log: [],
  };
}

export function say(G, text, kind){ G.log.unshift({ day: G.day, text, kind: kind || '' }); }
export const occupants = G => G.cups.flat();
export const aliveCount = G => occupants(G).length;
export const firstEmptyCup = G => G.cups.findIndex(c => !c.length);
export const warm = G => G.temp >= TEMP.min && G.temp <= TEMP.max;

/* ── actions ───────────────────────────────────────────────── */

export function feedCup(G, i, kind){
  const b = G.cups[i][0];
  if (!b || b.stage !== 'larva') return false;
  const f = FOODS[kind];
  if (!f.prey){
    say(G, `Put lettuce in cup ${i+1}. <b>Nothing touched it.</b> ${f.note}`, 'bad');
    return true;
  }
  if (!G.food[kind]) return false;
  G.food[kind]--;
  b.fed = Math.min(3, b.fed + f.fill);
  say(G, `Fed ${f.label.toLowerCase()} to cup ${i+1}. ${kind === 'aphid' ? f.note : ''}`, 'good');
  return true;
}

export function releaseAdult(G, i){
  const b = G.cups[i][0];
  if (!b || b.stage !== 'adult') return false;
  G.cups[i].shift();
  G.released++; G.pop.lacewings++;
  say(G, 'Released an adult into the garden. ' + (G.pop.flowers
    ? 'There are flowers to feed on, so it should stay and lay eggs.'
    : '<b>No flowers out there.</b> Adults drink nectar — with nothing to feed on it may leave.'),
    G.pop.flowers ? 'good' : '');
  return true;
}

export function collectEgg(G){
  const i = firstEmptyCup(G);
  if (i < 0 || G.pop.eggs < 1) return false;
  G.pop.eggs--;
  G.cups[i].push({ id: nid(), stage: 'egg', age: 0, fed: 2 });
  say(G, `Collected an egg off a leaf into cup ${i+1}. <b>That is the second generation</b> — the lacewings you release lay the eggs you raise next.`, 'good');
  return true;
}

export function separate(G, from){
  const to = firstEmptyCup(G);
  if (to < 0 || G.cups[from].length < 2) return false;
  G.cups[to].push(G.cups[from].pop());
  say(G, `Separated them — one moved to cup ${to+1}. Now they cannot reach each other.`, 'good');
  return true;
}

export function toggleShelter(G, i){ G.shelter[i] = !G.shelter[i]; return true; }
export function plantFlowers(G){
  G.pop.flowers += 2;
  say(G, 'Planted flowers. Adult lacewings, ladybugs and wasps all drink nectar — flowers are how you get them to stay.', 'good');
  return true;
}
export function harvestAphids(G){
  if (G.pop.aphids < 6) return false;
  G.pop.aphids -= 6; G.food.aphid += 3;
  say(G, 'Collected aphids off the leaves — 2 meals. Your pest is also your food supply, which is the awkward part of raising predators.', '');
  return true;
}
export function sprayPesticide(G){
  const k = G.pop.ladybugs + G.pop.lacewings + G.pop.wildLarvae;
  G.pop.aphids = Math.max(4, Math.round(G.pop.aphids * 0.15));
  G.pop.ladybugs = G.pop.lacewings = G.pop.wildLarvae = 0;
  G.pop.sprayed = 5; G.winDays = 0;
  say(G, `Sprayed the whole garden. Aphids crashed — and <b>${k} beneficial insects died with them</b>. Nothing returns for about five days, and aphids breed back faster than their predators.`, 'bad');
  return true;
}

/* ── the day step ──────────────────────────────────────────── */

export function stepDay(G, rng){
  if (G.over) return;
  const r = rng || Math.random;
  const ok = warm(G);

  G.cups.forEach((cup, i) => {
    if (!cup.length) return;
    if (cup.length > 1){
      const victim = cup.pop(); G.died++;
      say(G, `Cup ${i+1}: <b>one larva ate the other.</b> They are cannibals from the moment they hatch — that is why one cup means one larva.`, 'bad');
      void victim;
    }
    const b = cup[0];
    if (!ok && b.stage !== 'adult'){
      say(G, `Cup ${i+1} did not develop. ${G.temp < TEMP.min ? 'Too cold' : 'Too hot'} — they need ${TEMP.min}–${TEMP.max}°F.`, 'bad');
      return;
    }
    b.age++;
    if (b.stage === 'larva'){
      b.fed--;
      if (b.fed < -1){
        cup.shift(); G.died++;
        say(G, `Cup ${i+1}: <b>the larva starved.</b> They eat every single day.`, 'bad');
        return;
      }
    }
    const span = STAGE_DAYS[b.stage];
    if (b.age >= span){
      const next = STAGES[STAGES.indexOf(b.stage) + 1];
      if (b.stage === 'larva' && !G.shelter[i]){
        say(G, `Cup ${i+1}: the larva is ready to pupate and has <b>nowhere to do it</b>. Add folded paper.`, 'bad');
        b.age = span - 1;
        return;
      }
      if (next){
        b.stage = next; b.age = 0;
        const line = {
          larva:  `Cup ${i+1}: <b>it hatched.</b> Feed it today — a larva eats from the hour it emerges.`,
          cocoon: `Cup ${i+1}: <b>spinning a cocoon</b> in the folded paper. It does not eat in there.`,
          adult:  `Cup ${i+1}: <b>an adult emerged</b> — pale green, gold eyes, lacy wings. Release it.`,
        }[next];
        say(G, line, 'good');
      }
    }
  });

  const p = G.pop;
  if (p.sprayed > 0) p.sprayed--;
  // Aphids compound. 1.28/day is close to the real thing and makes the game
  // unwinnable — by the time a first larva pupates the garden is gone — so the
  // rate is dialled to 1.13, still visibly exponential over a week.
  p.aphids = Math.round(p.aphids * 1.13) + 2;
  if (p.aphids > 45 && p.ants < 6 && r() < 0.5) p.ants++;
  if (p.aphids < 20 && p.ants > 0 && r() < 0.4) p.ants--;
  const guard = p.ants > 0 ? Math.max(0.35, 1 - p.ants * 0.13) : 1;

  if (!p.sprayed){
    if (p.flowers >= 2 && p.aphids > 18 && p.ladybugs < 6 && r() < 0.45){
      p.ladybugs++;
      if (p.ladybugs === 1) say(G, 'A <b>ladybug</b> found the garden. They come for the aphids and stay for the flowers.', 'good');
    }
    if (p.lacewings > 0 && p.flowers >= 1 && r() < 0.55){
      p.eggs++;
      say(G, 'A released lacewing <b>laid eggs on a leaf</b>, each on its own silk stalk. Collect them, or leave them and hope they hatch.', 'good');
    }
    if (p.lacewings > 0 && p.flowers === 0 && r() < 0.5){
      p.lacewings--;
      say(G, 'An adult lacewing <b>left</b>. No flowers means no nectar, and adults do not eat pests.', 'bad');
    }
  }

  if (p.eggs > 0){
    let robbed = 0, hatched = 0;
    for (let e = p.eggs; e > 0; e--){
      if (p.ants > 0 && r() < 0.3){ p.eggs--; robbed++; }
      else if (r() < 0.5){ p.eggs--; p.wildLarvae++; hatched++; }
    }
    if (robbed) say(G, `The ants took <b>${robbed} egg${robbed>1?'s':''}</b> off the leaves. The silk stalk lifts an egg above crawling ants, but it is not a wall.`, 'bad');
    if (hatched) say(G, `${hatched} garden egg${hatched>1?'s':''} hatched on their own — wild larvae hunting out there now.`, 'good');
  }

  const eaten = Math.round((p.wildLarvae * 16 + p.ladybugs * 12) * guard);
  if (eaten){
    p.aphids = Math.max(0, p.aphids - eaten);
    if (p.ants > 0 && guard < 0.8)
      say(G, `Beneficials took out ${eaten} aphids — <b>fewer than they should have.</b> The ants are guarding the aphids and driving the predators off.`, '');
  }
  p.aphids = Math.min(400, p.aphids);
  G.winDays = p.aphids <= 20 ? G.winDays + 1 : 0;

  const kinds = (p.lacewings + p.wildLarvae > 0 ? 1 : 0) + (p.ladybugs > 0 ? 1 : 0) + (p.flowers > 0 ? 1 : 0);
  if (G.winDays >= 3 && kinds >= 3 && G.released >= 4) G.over = 'win';
  else if (p.aphids >= 360) G.over = 'lose';
  else if (!aliveCount(G) && G.released === 0 && p.eggs === 0) G.over = 'lose';

  G.day++;
}

export function goalList(G){
  const p = G.pop;
  const kinds = (p.lacewings + p.wildLarvae > 0 ? 1 : 0) + (p.ladybugs > 0 ? 1 : 0) + (p.flowers > 0 ? 1 : 0);
  return [
    ['Aphids down to 20 or fewer', p.aphids <= 20],
    [`Hold it three days running — ${G.winDays}/3`, G.winDays >= 3],
    [`Three kinds of beneficial — ${kinds}/3`, kinds >= 3],
    [`Release 4 lacewings you raised — ${G.released}/4`, G.released >= 4],
  ];
}
