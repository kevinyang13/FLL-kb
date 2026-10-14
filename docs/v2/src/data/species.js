/* Static game data. Imports nothing — the bottom of the dependency graph.
   Numbers here are the ones the team can defend out loud at the table;
   where a figure is a guess for playability it says so. */

/** Lacewing life stages, in order, with how long each lasts at good warmth. */
export const STAGES = ['egg', 'larva', 'cocoon', 'adult'];

/* Real development is egg 3-5 days, larva ~2 weeks, cocoon 5-7 days
   (Rincon-Vitova, 4 Oct 2026). The larva stage is compressed here: at the
   true fourteen days nobody at an outreach table ever sees an adult, and
   the lesson ("it eats every day, for a long time") survives the trim. */
export const STAGE_DAYS = {
  egg: 3,
  larva: 8,
  cocoon: 5,
  adult: 30,   // lives weeks; the bench only holds it until release
};

/** Warmth band. Outside it, development stalls and eggs can fail. */
export const TEMP = { min: 66, max: 84, ideal: 75 };

/** What a larva will and will not eat. `prey:false` is the teaching case. */
export const FOODS = {
  aphid:   { label: 'Aphids',      prey: true,  fill: 3, note: 'Fresh prey. The best thing you can give them.' },
  moth:    { label: 'Moth eggs',   prey: true,  fill: 2, note: 'What insectaries actually use.' },
  fly:     { label: 'Fruit flies', prey: true,  fill: 2, note: 'Flightless, so they stay in the cup.' },
  lettuce: { label: 'Lettuce',     prey: false, fill: 0, note: 'A lacewing larva is a predator. It will not touch a leaf.' },
};

/** Garden residents. `good` decides which side of the balance they count on. */
export const SPECIES = {
  aphid:   { label: 'Aphid',    good: false, eats: 0,  note: 'Drinks sap. Gives birth to live young without mating.' },
  ant:     { label: 'Ant',      good: false, eats: 0,  note: 'Farms aphids for honeydew and drives predators off.' },
  ladybug: { label: 'Ladybug',  good: true,  eats: 11, note: 'Comes for the aphids, stays for the flowers.' },
  lacewing:{ label: 'Lacewing', good: true,  eats: 16, note: 'The larva is the predator. The adult drinks nectar.' },
};

export const CUPS = 6;
