/* The notebook: what the player has found, what they guessed, and what the
   garden has shown them. Pure — no three.js, no DOM — so the whole thing can
   be driven from a terminal and checked.

   There is no score and no failure. A wrong guess still opens the card and
   still gives the reason; the only thing it changes is the small mark the
   notebook keeps next to that entry, because being wrong about a ladybug
   larva is the lesson, not a punishment. */
import { GUIDE, GROUPS, ALL_KEYS } from '../data/species.js';

export function freshNotebook(){
  return {
    found: {},            // key -> { guess, correct, at }
    watched: {},          // key -> true, for the stages seen changing
    log: [],
    opened: null,         // the card being read
  };
}

export const isFound = (N, key) => !!N.found[key];
export const foundCount = N => Object.keys(N.found).length;
export const totalCount = () => ALL_KEYS.length;
export const complete = N => foundCount(N) === totalCount();

export function note(N, text, kind){
  N.log.unshift({ text, kind: kind || '' });
  if (N.log.length > 40) N.log.pop();
}

/** Record a find. `guess` is 'good' or 'pest'; returns what to show. */
export function record(N, key, guess){
  const entry = GUIDE[key];
  if (!entry) return null;
  const correct = guess === entry.side;
  if (!N.found[key]) {
    N.found[key] = { guess, correct, at: Date.now() };
    note(N, `<b>${entry.name}</b> added to the notebook.` +
      (correct ? '' : ` You called it ${guess === 'good' ? 'helpful' : 'a pest'} — it is ${entry.side === 'good' ? 'helpful' : 'a pest'}.`),
      correct ? 'good' : 'bad');
  }
  N.opened = key;
  return { entry, correct, firstTime: true };
}

/** A card filled in by watching rather than by guessing. No guess is
    recorded, because the player never made one — the garden showed them. */
export function observe(N, key){
  if (N.found[key]) return false;
  N.found[key] = { guess: null, correct: null, at: Date.now() };
  return true;
}

/** Mark that the player stayed and watched a stage change. */
export function watch(N, key){
  const entry = GUIDE[key];
  if (!entry || !entry.watch) return null;
  const next = GUIDE[entry.watch];
  if (!next) return null;        // a watch target that names no card is a data bug
  N.watched[key] = true;
  note(N, `You watched it happen: <b>${entry.name} → ${next.name}</b>.`, 'good');
  return next;
}

/** How many of a group's stages are in the notebook. */
export function groupProgress(N, groupKey){
  const g = GROUPS[groupKey];
  return { found: g.keys.filter(k => isFound(N, k)).length, total: g.keys.length };
}

/** A nudge towards whatever is still missing, in plain words. */
export function hint(N){
  const missing = ALL_KEYS.filter(k => !isFound(N, k));
  if (!missing.length) return 'Every card is filled in. Walk the garden again and watch the ones that change.';
  const HINTS = {
    'lacewing-egg': 'Look under the leaves of the vegetable bed for something on a thin stalk.',
    'lacewing-larva': 'Find the aphid colony. Something is working its way along the edge of it.',
    'lacewing-cocoon': 'Check the bark of the big tree, low down, where the crevices are.',
    'lacewing-adult': 'Adults drink nectar. Try the flower border.',
    'ladybug-larva': 'Something spiky and orange is on the aphid leaf. It is not a pest.',
    'ladybug-adult': 'On the flowers, or near any aphids.',
    'aphid': 'The bed plants. You will not have to look hard.',
    'ant': 'Follow the ants on the soil up to whatever they are guarding.',
    'wasp-mummy': 'On the aphid leaf, one of them is the wrong colour and has a hole in it.',
    'hoverfly': 'Hovering over the flower border, striped like a wasp.',
    'spider': 'In the hedge, where the web is.',
    'mealybug': 'White fluff where a leaf meets a stem.',
    'whitefly': 'Under a leaf in the bed. They lift off when you get close.',
  };
  return HINTS[missing[0]] || 'Keep looking.';
}

export function summary(N){
  const right = Object.values(N.found).filter(f => f.correct).length;
  return {
    found: foundCount(N), total: totalCount(),
    firstGuessRight: right,
    watched: Object.keys(N.watched).length,
  };
}
