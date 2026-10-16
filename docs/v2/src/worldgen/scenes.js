/* The findable scenes, placed deterministically from the seed.

   These are set pieces, not scattered specimens: an aphid colony with the
   ants patrolling it, a mummy among the living aphids, a ladybug larva
   working the edge. Each one is a picture with a caption, which is how the
   trifold board shows them and how a child remembers them.

   Parts that share a scene are nudged apart by at least a hand's width: two
   things at the same point cannot be told apart by where the player looks,
   and then one of the cards is unobtainable.

   A scene is pure data — position, what it holds, which notebook card each
   part fills in. The engine turns it into meshes. */

const SITES = {
  // around the vegetable bed, the flower border, the hedge and the big tree
  bedLeaf:   { x: 13.2, y: 0.70, z: -9.4 },
  bedLeaf2:  { x: 12.4, y: 0.60, z: -2.4 },
  bedUnder:  { x: 14.3, y: 0.50, z: -2.0 },
  bedStem:   { x: 13.8, y: 0.45, z: 5.0 },
  soil:      { x: 12.6, y: 0.12, z: -9.9 },
  flower:    { x: -4.2, y: 0.75, z: 6.5 },
  flower2:   { x: -5.6, y: 0.85, z: 8.2 },
  bark:      { x: -13.0, y: 1.05, z: -3.6 },
  hedge:     { x: -20.3, y: 1.25, z: 4.0 },
};

export function buildScenes(){
  return [
    {
      id: 'colony',
      title: 'The aphid colony',
      at: SITES.bedLeaf,
      caption: 'Everything that matters in this project is happening on one leaf.',
      parts: [
        { key: 'aphid',         model: 'aphid',       count: 26, spread: 0.1 },
        { key: 'wasp-mummy',    model: 'mummy',       count: 2,  spread: 0.04, offset: [0.14, 0.002, 0.1] },
        { key: 'lacewing-larva',model: 'larva',       count: 1,  offset: [0.07, 0.004, -0.03] },
        { key: 'ladybug-larva', model: 'ladybugLarva',count: 1,  offset: [-0.08, 0.004, 0.04] },
      ],
    },
    {
      id: 'eggs',
      title: 'Eggs on stalks',
      at: SITES.bedLeaf2,
      caption: 'Stay and watch one. It will not wait for you, but it will not take long either.',
      parts: [{ key: 'lacewing-egg', model: 'eggCluster', count: 1 }],
    },
    {
      id: 'underleaf',
      title: 'Under the leaf',
      at: SITES.bedUnder,
      caption: 'Turn a leaf over. This is where most of a garden actually lives.',
      parts: [
        { key: 'whitefly', model: 'whitefly', count: 9, spread: 0.06, offset: [-0.08, 0, 0] },
        { key: 'mealybug', model: 'mealybug', count: 4, spread: 0.04, offset: [0.12, 0, 0.06] },
      ],
    },
    {
      id: 'ants',
      title: 'The ant road',
      at: SITES.soil,
      caption: 'Follow them up the stem and you find out what they are protecting.',
      parts: [{ key: 'ant', model: 'ant', count: 7, spread: 0.16 }],
    },
    {
      id: 'nectar',
      title: 'At the flowers',
      at: SITES.flower,
      caption: 'The adults are here, not on the pests. This is why flowers matter.',
      parts: [
        { key: 'lacewing-adult', model: 'adult',   count: 1, offset: [-0.1, 0.03, -0.05] },
        { key: 'ladybug-adult',  model: 'ladybug', count: 2, spread: 0.05, offset: [0.16, -0.03, 0.12] },
      ],
    },
    {
      id: 'hover',
      title: 'The one pretending to be a wasp',
      at: SITES.flower2,
      caption: 'Stripes, no sting. Its young eat aphids by the hundred.',
      parts: [{ key: 'hoverfly', model: 'hoverfly', count: 1 }],
    },
    {
      id: 'cocoon',
      title: 'In the bark',
      at: SITES.bark,
      caption: 'A silk pea wedged in a crevice. Something is rebuilding itself in there.',
      parts: [{ key: 'lacewing-cocoon', model: 'cocoon', count: 1 }],
    },
    {
      id: 'web',
      title: 'The web in the hedge',
      at: SITES.hedge,
      caption: 'Nothing on this list eats a plant less than a spider does.',
      parts: [{ key: 'spider', model: 'spider', count: 1 }],
    },
    {
      id: 'stem',
      title: 'Where the stem forks',
      at: SITES.bedStem,
      caption: 'White fluff in the crook of a stem is rarely just dust.',
      parts: [{ key: 'mealybug', model: 'mealybug', count: 6, spread: 0.04 }],
    },
  ];
}
