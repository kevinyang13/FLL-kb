/* The findable scenes, placed deterministically from the seed.

   These are set pieces, not scattered specimens: an aphid colony with the
   ants patrolling it, a mummy among the living aphids, a ladybug larva
   working the edge. Each one is a picture with a caption, which is how the
   trifold board shows them and how a child remembers them.

   Parts that share a scene are nudged apart by at least a hand's width: two
   things at the same point cannot be told apart by where the player looks,
   and then one of the cards is unobtainable.

   A scene says WHERE it belongs in the garden's own terms — on foliage, on
   open soil, in the hedge, on a tree trunk, at the flowers — and the engine
   resolves that against the garden it actually built. Fixed coordinates were
   wrong twice over: they drifted every time the planting changed, and they
   left insects hanging in the air once the plant under them was removed. */

/** Where a scene attaches. `n` picks one of that kind, deterministically. */
const on = (kind, n) => ({ kind, n });

export function buildScenes(){
  return [
    {
      id: 'colony',
      title: 'The aphid colony',
      at: on('leaf', 3),
      caption: 'Everything that matters in this project is happening on one leaf.',
      parts: [
        { key: 'aphid',          model: 'aphid',        count: 26, spread: 0.1 },
        { key: 'wasp-mummy',     model: 'mummy',        count: 2,  spread: 0.04, offset: [0.14, 0.002, 0.1] },
        { key: 'lacewing-larva', model: 'larva',        count: 1,  offset: [0.07, 0.004, -0.03] },
        { key: 'ladybug-larva',  model: 'ladybugLarva', count: 1,  offset: [-0.08, 0.004, 0.04] },
      ],
    },
    {
      id: 'eggs',
      title: 'Eggs on stalks',
      at: on('leaf', 11),
      caption: 'Stay and watch one. It will not wait for you, but it will not take long either.',
      parts: [{ key: 'lacewing-egg', model: 'eggCluster', count: 1 }],
    },
    {
      id: 'underleaf',
      title: 'Under the leaf',
      at: on('leaf', 19),
      caption: 'Turn a leaf over. This is where most of a garden actually lives.',
      parts: [
        { key: 'whitefly', model: 'whitefly', count: 9, spread: 0.06, offset: [-0.08, 0, 0] },
        { key: 'mealybug', model: 'mealybug', count: 4, spread: 0.04, offset: [0.12, 0, 0.06] },
      ],
    },
    {
      id: 'ants',
      title: 'The ant road',
      at: on('soil', 1),
      caption: 'Follow them up the stem and you find out what they are protecting.',
      parts: [{ key: 'ant', model: 'ant', count: 7, spread: 0.16 }],
    },
    {
      id: 'nectar',
      title: 'At the flowers',
      at: on('flower', 2),
      caption: 'The adults are here, not on the pests. This is why flowers matter.',
      parts: [
        { key: 'lacewing-adult', model: 'adult',   count: 1, offset: [-0.1, 0.03, -0.05] },
        { key: 'ladybug-adult',  model: 'ladybug', count: 2, spread: 0.05, offset: [0.16, -0.03, 0.12] },
      ],
    },
    {
      id: 'hover',
      title: 'The one pretending to be a wasp',
      at: on('flower', 7),
      caption: 'Stripes, no sting. Its young eat aphids by the hundred.',
      parts: [{ key: 'hoverfly', model: 'hoverfly', count: 1 }],
    },
    {
      id: 'cocoon',
      title: 'In the bark',
      at: on('trunk', 0),
      caption: 'A silk pea wedged in a crevice. Something is rebuilding itself in there.',
      parts: [{ key: 'lacewing-cocoon', model: 'cocoon', count: 1 }],
    },
    {
      id: 'web',
      title: 'The web in the hedge',
      at: on('hedge', 0),
      caption: 'Nothing on this list eats a plant less than a spider does.',
      parts: [{ key: 'spider', model: 'spider', count: 1 }],
    },
    {
      id: 'stem',
      title: 'Low in the border',
      at: on('leaf', 27),
      caption: 'White fluff where leaves meet a stem is rarely just dust.',
      parts: [{ key: 'mealybug', model: 'mealybug', count: 6, spread: 0.04 }],
    },
  ];
}
