/* The field guide. One entry per thing you can find in the garden; the
   notebook, the scenes and the insect models all read from here, so adding a
   species is one entry plus a model.

   Facts come from the Rincon-Vitova chart the team photographed on
   4 October 2026 and from Tracy's interview the same day. Where a figure is
   rounded for a nine-year-old to say out loud, it says so. */

export const SIDE = { GOOD: 'good', PEST: 'pest' };

/* Besides the nine set-piece scenes, the garden is scattered with hundreds of
   single sightings. Each card therefore says four more things: which `model`
   draws it, `where` it can turn up on its own (anchor kinds the garden
   provides), how `common` it is as a relative weight, and `group_size`, how
   many of it stand together. A pest colony is a crowd; a lacewing is one
   insect on its own. */

export const GUIDE = {
  'lacewing-egg': {
    model: 'eggCluster', where: ['leaf'], common: 2, group_size: [1, 1],
    name: 'Lacewing egg',
    side: SIDE.GOOD, group: 'lacewing', stage: 1,
    sub: 'Each one on its own silk stalk',
    eats: 'Nothing yet',
    fact: 'The mother glues a hair-thin stalk to the leaf and lays one egg on the tip. The stalk is a fence: the first larva to hatch cannot walk across and eat the others.',
    watch: 'lacewing-larva',
  },
  'lacewing-larva': {
    model: 'larva', where: ['leaf'], common: 2, group_size: [1, 2],
    name: 'Lacewing larva',
    side: SIDE.GOOD, group: 'lacewing', stage: 2,
    sub: 'The part that does the work',
    eats: 'Aphids, mealybugs, thrips, mites, insect eggs',
    fact: 'One larva eats over 200 aphids before it pupates. It has hollow jaws like two curved needles, and it will eat its own brother or sister if they meet.',
  },
  'lacewing-cocoon': {
    model: 'cocoon', where: ['trunk', 'hedge'], common: 2, group_size: [1, 1],
    name: 'Lacewing cocoon',
    side: SIDE.GOOD, group: 'lacewing', stage: 3,
    sub: 'A silk pea tucked out of sight',
    eats: 'Nothing',
    fact: 'The larva spins a round white cocoon about the size of a peppercorn, usually wedged in bark or a folded leaf. Five to seven days later the adult cuts a neat circular lid and climbs out.',
    watch: 'lacewing-adult',
  },
  'lacewing-adult': {
    model: 'adult', where: ['flower', 'leaf'], common: 2, group_size: [1, 1],
    name: 'Green lacewing',
    side: SIDE.GOOD, group: 'lacewing', stage: 4,
    sub: 'Gold eyes, lace wings',
    eats: 'Nectar and pollen — not pests',
    fact: 'The adult eats no pests at all. It drinks nectar, which is why a garden with no flowers loses its lacewings: the adults leave, and no eggs are laid.',
  },

  'ladybug-larva': {
    model: 'ladybugLarva', where: ['leaf'], common: 3, group_size: [1, 2],
    name: 'Ladybug larva',
    side: SIDE.GOOD, group: 'ladybug', stage: 1,
    sub: 'The one everybody squashes',
    eats: 'Aphids, and plenty of them',
    fact: 'Spiky, black and orange, shaped like a tiny alligator. It looks far more like a pest than the beetle does, so this is the single most commonly killed helpful insect in a garden.',
    watch: 'ladybug-adult',
  },
  'ladybug-adult': {
    model: 'ladybug', where: ['flower', 'leaf'], common: 4, group_size: [1, 3],
    name: 'Ladybug',
    side: SIDE.GOOD, group: 'ladybug', stage: 2,
    sub: 'Everyone knows this one',
    eats: 'Aphids, soft-bodied insects',
    fact: 'The adult eats aphids too, but it is the larva that clears a colony. People welcome the beetle and kill its young without knowing they are the same animal.',
  },

  'aphid': {
    model: 'aphid', where: ['leaf'], common: 10, group_size: [4, 14],
    name: 'Aphid',
    side: SIDE.PEST, group: 'aphid',
    sub: 'The whole problem, two millimetres long',
    eats: 'Sap, straight out of the stem',
    fact: 'Aphids are born pregnant: a female gives birth to live young without mating. One becomes hundreds in a week, which is why spraying never keeps up and predators do.',
  },
  'ant': {
    model: 'ant', where: ['soil', 'trunk'], common: 8, group_size: [3, 8],
    name: 'Ant',
    side: SIDE.PEST, group: 'ant',
    sub: 'Not eating your plants — farming them',
    eats: 'Honeydew, from the aphids it guards',
    fact: 'Ants milk aphids for honeydew and fight off ladybugs and lacewings to protect the herd. Deal with the ants and the aphids often sort themselves out.',
  },
  'wasp-mummy': {
    model: 'mummy', where: ['leaf'], common: 3, group_size: [1, 3],
    name: 'Aphid mummy',
    side: SIDE.GOOD, group: 'wasp',
    sub: 'A hard tan shell with a hole in it',
    eats: 'The aphid it grew inside',
    fact: 'A parasitoid wasp laid one egg inside a living aphid. The grub ate it from the inside, the shell went papery tan, and the new wasp cut its way out of that round hole.',
  },
  'hoverfly': {
    model: 'hoverfly', where: ['flower'], common: 4, group_size: [1, 1],
    name: 'Hoverfly',
    side: SIDE.GOOD, group: 'hoverfly',
    sub: 'Striped like a wasp. It is not one',
    eats: 'Nectar as an adult; its maggot eats aphids',
    fact: 'It copies a wasp so birds leave it alone, and it cannot sting. Its blind, legless maggot crawls over leaves and drains hundreds of aphids.',
  },
  'spider': {
    model: 'spider', where: ['hedge', 'trunk'], common: 3, group_size: [1, 1],
    name: 'Garden spider',
    side: SIDE.GOOD, group: 'spider',
    sub: 'Scary-looking is not the same as harmful',
    eats: 'Insects, every one of them',
    fact: 'No spider eats a plant. The gap between what looks frightening and what is actually harmful is most of the reason people kill the wrong things.',
  },
  'mealybug': {
    model: 'mealybug', where: ['leaf'], common: 6, group_size: [2, 6],
    name: 'Mealybug',
    side: SIDE.PEST, group: 'mealybug',
    sub: 'A crawling speck of white fluff',
    eats: 'Sap',
    fact: 'Covered in white wax. Its predator, Cryptolaemus, has a larva wearing exactly the same white fluff — a good bug disguised as the bad one it hunts.',
  },
  'whitefly': {
    model: 'whitefly', where: ['leaf'], common: 7, group_size: [3, 9],
    name: 'Whitefly',
    side: SIDE.PEST, group: 'whitefly',
    sub: 'A cloud that lifts when you touch the leaf',
    eats: 'Sap',
    fact: 'Two insects are sold together against it: Encarsia parasitises the young, Delphastus eats the adults. Two predators for two stages of one pest.',
  },
};

/** Stages of a species, in order — the notebook draws these as one spread. */
export const GROUPS = {
  lacewing: { label: 'Green lacewing', keys: ['lacewing-egg', 'lacewing-larva', 'lacewing-cocoon', 'lacewing-adult'] },
  ladybug:  { label: 'Ladybug',        keys: ['ladybug-larva', 'ladybug-adult'] },
  aphid:    { label: 'Aphid',          keys: ['aphid'] },
  ant:      { label: 'Ant',            keys: ['ant'] },
  wasp:     { label: 'Parasitoid wasp',keys: ['wasp-mummy'] },
  hoverfly: { label: 'Hoverfly',       keys: ['hoverfly'] },
  spider:   { label: 'Garden spider',  keys: ['spider'] },
  mealybug: { label: 'Mealybug',       keys: ['mealybug'] },
  whitefly: { label: 'Whitefly',       keys: ['whitefly'] },
};

export const ALL_KEYS = Object.keys(GUIDE);
