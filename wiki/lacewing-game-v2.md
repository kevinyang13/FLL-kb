---
title: Lacewing Garden v2
layout: default
nav_order: 11
parent: Wiki
---

# Lacewing Garden v2 — the walk-around version

**Summary**: A backyard garden you walk around in first person, looking for insects. Thirteen field-guide cards to fill in, each one earned by guessing *helpful or pest* before the answer appears — and three of them change in front of you if you stay and watch. Built as layered ES modules following the architecture of the SimCraft reference project.

**Sources**: github.com/justinyang13/app-project-zero (app-sim-craft — architecture and control scheme); raw/source-docs/tracy-rincon-vitova-zoom-2026-10-04.md (development times, feeding); raw/source-docs/good-bugs-vs-bad-bugs-poster-2026-10-04.jpg

**Last updated**: 2026-10-19

---

> **[Play it](../v2/)** · v1, the tabletop version, is still at **[game.html](../game.html)** and is the better one for a two-minute visit at a table.

## The game

You walk a garden and look for things. There is **no clock, no score and no way to lose** — the only thing that advances is how much of the notebook is filled in.

**Refreshing puts you back.** Position and facing are written to `localStorage` every couple of seconds and restored on load, in their own key apart from the notebook. A pose carries the **shape of the world it was taken in** — seed, garden size, room count, how many clumps and trees — and a pose from a different world is thrown away rather than trusted, because a spot that was a lawn last week may be the middle of the lake now. A restored pose also goes through the same clamp a normal step does, so a saved spot outside the fence or inside a tree comes back as the nearest legal one.

**Press `M` for the area view** — the same map, 170 m across instead of 640, big in the middle of the screen. The corner map answers *where am I in the garden*; at 640 m across it cannot answer *what is around me*, because a whole room is a fifth of an inch on it. The area view draws the walks, the planting rooms, the water, every sighting near you with the missing ones picked out, and dashed rings at 25 and 50 m so it also answers *how far*. It does **not** pause the game: a map you can keep an eye on while you walk is worth more than one you have to stop for, and watching your own arrow move is how a child learns to read it. `M` again or `Esc` closes it, and it is drawn from exactly the same data as the corner map — there is no second model of the garden to keep in step.

**The map.** A minimap sits top right, **north-up** rather than rotating with the player: in a grid of a hundred rooms what matters is which room you are in and which way the unexplored part lies, and an arrow turning on a map that stays still is easier for a nine-year-old to read than a map that spins underneath them. It shows the room grid, every sighting in the garden as a faint speck, the set-piece scenes as gold rings that hollow out when finished, a view cone, and the player.

Markers for cards still missing are drawn brightly — but only **within 130 m**. At the start twelve of the thirteen cards are blank, and lighting all six hundred turned the entire map yellow. Sightings are never coloured by helpful or pest: that is the question the game asks, and a map that answered it would end the game.

**Finding them.** A **glowing mote** floats over every scene you have not finished, drawn at a constant size on screen so it is as visible from across the lawn as it is up close, and a **compass at the bottom of the screen** always points at the nearest thing still missing with its distance in metres. Hidden is not the same as unfindable: an insect is a centimetre across in a six-hundred-metre garden, and without those two things the garden reads as empty even while you are standing in it.

**Find.** Two different things to find. **Nine set-piece scenes** are placed around the garden: an aphid colony with ants patrolling it and a mummy among the living, eggs on stalks under a leaf, a cocoon wedged in bark, whitefly on a leaf underside, a spider in the hedge, adults at the flowers. Crouch with `C` — which is also the macro lens — and press `E`.

And **600 scattered sightings** — 2,556 individual insects — spread through all hundred rooms. Each is a real card from the field guide, on a plant that species would actually be on, in the numbers it would actually be in: aphids by the dozen, whitefly in clouds, one lacewing on its own. They are weighted by how common the species is, so the garden reads honestly — you meet aphids and ants constantly and a lacewing egg rarely, which is both the real ratio and the reason the predators matter.

| | Sightings | | Sightings |
|---|---|---|---|
| Aphid | 106 | Spider | 34 |
| Ant | 92 | Aphid mummy | 32 |
| Whitefly | 80 | Lacewing adult | 22 |
| Mealybug | 56 | Lacewing larva | 20 |
| Hoverfly | 43 | Lacewing egg | 20 |
| Ladybug | 42 | Lacewing cocoon | 17 |
| Ladybug larva | 36 | | |

The notebook keeps a **tally** beside each card, so your twentieth aphid is not a new card but it does tell you the garden is full of them.

This is also what fixed the walking. Before the scatter, the compass read **140 m to the nearest thing you have not found**; now it reads **12 m**. A card you are missing is far more likely to be on a leaf in the next bed than in the one set-piece scene that holds it, three hundred metres away.

**Two things that had to be true.** Six hundred clumps built up front is about twelve thousand `Object3D`s for the renderer to walk every frame in order to draw a few dozen, so a sighting is only **built when the player comes within 34 m** and taken down again past 46 m — verified by teleporting across the garden and counting what was left standing. And the glints marking them are **one `Points` object, not 600 sprites**, which would have been 600 draw calls. They are a single neutral colour on purpose: a marker that showed helpful in green and pest in red would answer the question the game is asking.

**Guess first.** Before it tells you anything, the game asks: **helpful, or a pest?** Then the card opens with the answer and the reason. A wrong guess costs nothing but a small mark in the notebook, because being wrong about a ladybug larva *is* the lesson. Guessing before being told is what makes the answer stick.

**Watch.** Three cards are not finished when you find them. Hold `F` and keep looking and the thing changes in front of you. The garden object itself is replaced, and the new stage becomes findable where the old one stood. Look away and the watch stops.

Two of them are a single swap — a cocoon opens, a ladybug larva pupates. **The egg clutch is the whole life story**, eight beats and about forty seconds, played on the leaf where you found it:

| | |
|--:|---|
| 1 | The eggs on their silk stalks — *that stalk is a fence* |
| 2 | One splits, and what climbs out looks nothing like the adult |
| 3 | The larva walks off the stalk, hungry from the first hour |
| 4 | It drains an aphid, then the next — *two hundred before it is done* |
| 5 | A second larva hatches behind it |
| 6 | **The bigger one eats the smaller one** — why an insectary rears them one to a cup |
| 7 | It spins a cocoon the size of a peppercorn |
| 8 | It cuts a round lid and climbs out with lace wings — and from here on drinks nectar, not pests |

Each beat that introduces a stage writes that card into the notebook **without asking you to guess**, because the garden showed it to you rather than asking what you thought. Beat 6 is the reason the sequence exists: cannibalism is the one fact about rearing lacewings that nobody believes until they watch it.

The thirteen cards cover the lacewing's four stages, the ladybug's two, and seven other residents from the Rincon-Vitova chart. The point of the lacewing spread is the thing almost nobody knows: **those four pictures are one animal.**

| | |
|---|---|
| **Walk** | `W` `A` `S` `D`, or the arrow keys |
| **Look** | Mouse (click once to capture it), or drag on a touch screen |
| **Crouch** | Hold `C`. Drops you to leaf height and narrows the view 68° → 34° |
| **Hand lens** | `Z` steps in, `X` steps back out — or the mouse wheel. Three steps: **3.4× · 6.2× · 11.3×**, enough to count an aphid's legs. It carries its own light, because up against a leaf you are inside the shrub's shadow |
| **Look at something** | `E`, `Space`, or click |
| **Stay and watch it change** | Hold `F` |
| **Notebook** | `N` or `Tab` |
| **Where do I look next?** | `H` |
| **Start over** | In the notebook, at the bottom. It asks once before it wipes anything |

On a phone: a joystick anchors wherever your thumb lands bottom-left, dragging elsewhere looks around, and the buttons on the right are **Look**, **Watch** and **Notebook**.

### What replaced the old game

v2 used to be the rearing-bench simulation — cups, feeding, temperature, day counter — in three dimensions. That is still the better design for *v1*, which is where it lives. Walking a garden and opening cups on a bench turned out to be two games stapled together: `core/garden.js` was deleted and `core/notebook.js` took its place.

## How the code is arranged

Each folder under `docs/v2/src` is a layer, and a layer may only import from the layers below it. `scripts/check_layers.py` fails if that is broken — the same job SimCraft's `architecture.test.ts` does, written in Python because this repo has no npm.

```
ui ──→ session ──→ engine ──→ entities ──→ core ──→ data
                      ↓            ↓
                  rendering    worldgen
```

| Layer | What lives there |
|---|---|
| `data/` | Species table, stage lengths, palette. Imports nothing |
| `core/` | The notebook: what has been found, what was guessed, what has been watched. **No three.js, no DOM** |
| `worldgen/` | Deterministic layout and the nine findable scenes — same seed, same garden |
| `rendering/` | Procedural textures, the material cache, disposal |
| `entities/` | Insect bodies and the populations that stand for the counts |
| `engine/` | The running game: loop, player, camera, interaction, world build |
| `input/` | Keyboard, mouse and touch → one input object |
| `state/` `session/` | The store the interface reads, and the commands it may call |
| `ui/` | The overlay. Imports nothing from `engine/` |

**Why it is worth the extra files.** `core/notebook.js` has no browser in it, so the rules run under node. That is how the data is checked: every scene part names a real card, every card appears in some scene, and every "watch" target names a card that exists — three bugs caught before the page was ever loaded.

## The garden

The planting plan follows a sunken ornamental garden of the Butchart kind: a lawn with a path curving through it, deep mixed borders on both sides, specimen conifers as vertical punctuation, a hedge at the back, and a forested slope rising beyond the boundary.

**The garden is 640 m square — ten times bigger each way than it was.** It is not one plan stretched ten times. Stretching a back-yard plan to that size gives a 500 m lawn with a lonely shrub border somewhere over the horizon, which reads as a playing field. A real garden of that size — Butchart included — is a grid of **garden rooms**, each about the size of a back yard, joined by paths. So one *bay* here is the original 64 m garden, and the world is **10 × 10 = 100 bays**.

**The rooms are not walled off.** The first version divided them with hedges, which drew a hard line across the garden every 64 metres and turned one place into a hundred separate yards. The ground between two rooms is now a **grove** instead: deep woodland planting — big shrubs under tall trees and conifers — running the full depth of the bay, so each room's planting grows into its neighbour's and you walk from lawn, through trees, into the next lawn without meeting an edge. Hedges still exist, but as an occasional feature set inside a room, one every third room, dividing nothing. They had to survive in some form: a spider's web lives in a hedge, and so do some of the scattered cocoons, so the anchor still has to exist for those to be placed. Every plant stays the size it was, the planting stays as dense as it was, and the counts scale with the area on their own:

| | Before | Now |
|---|---|---|
| Garden | 64 × 64 m | 640 × 640 m |
| Shrub clumps | 92 | 13,200 |
| Bedding carpets | 18 | 1,800 |
| Conifers / canopy trees | 14 / 12 | 2,200 / 2,200 |
| Hedges | 2 | 32 (features, not walls) |
| Forest trees beyond the boundary | 150 | 15,000 |
| Instances in the scene | ~3,700 | **427,814** |
| Insects to find | 14 | **2,570** |
| Walks | 1 | 20 (10 spines, 10 cross paths) |

**335,000 plants at 60 fps.** Every repeated thing — shrub blobs, bedding flowers, conifers, canopy masses, the forest — is an `InstancedMesh` with a colour per instance. At this size that alone is not enough: an `InstancedMesh` is culled as *one object*, so 184,000 shrub blobs in a single mesh are drawn, and shadow-mapped, whenever any corner of the garden is on screen. They are now **bucketed into 60 m cells**, one mesh per cell, each with its own bounding sphere, so the frustum and the fog throw away everything the player is not standing in. Measured on the coach's Mac at the spawn point: **60 fps, 16.1 M triangles, 716 draw calls** out of 1,133 chunk meshes, 78 MB.

### The landscape it sits in

The garden fills the middle 640 m. Around it and cut into it is a landscape:

| | |
|---|---|
| **Mountains** | A wall across the north, peaks to 254 m, summed from eight overlapping cones so they make a ridge rather than a row of hills. The high ground is tinted towards rock and then snow by a colour per terrain vertex — without it, the mountains were 250 m of mown grass, because they come out of the same height field as the lawn. |
| **Rainforest** | A band between the mountains and the garden: 1,669 trees 17–36 m tall in deep jungle greens, thickest around the plunge pool, over 2,600 understory clumps. |
| **Waterfall** | 49 m off the escarpment, with spray at its foot. |
| **River** | From the plunge pool to the lake, 26 m wide, its surface falling steadily the whole way. |
| **Lake** | 78 m across, 9 m deep, inside the garden itself. |

**Every body of water is cut to fit the shape drawn over it.** The bed is a half ellipse that meets its own surface exactly at the rim of the disc or ribbon drawn above it, and the ground outside is pulled down towards the water's edge but never below it. Inside the drawn shape the bed is under the surface; outside it the ground is above the surface; the two can never disagree. Checked over 300,000 random samples of the whole map: **no spot is under water without water drawn there.**

**It is all one height field.** `groundHeight` is the single source of truth for where the ground is: the garden's gentle bowl, plus the mountains and the escarpment, minus the lake basin and the river bed cut back out of them. Every plant, the player's feet and the terrain mesh read that one function, so carving a river bed removed the plants from it and let the player walk down to the water without another line of code. **0 plants stand in water**, checked over all 18,000 of them. Only the water *surface* is drawn separately, because a surface is flat where its bed is not.

**You can swim.** Walk in; past chest depth (1.25 m) you float, your eyes ride the surface wherever it happens to be, and you move at 1.75 m/s instead of 2.9. Hold `C` — the same key as crouching, because it is already "get lower" — and you duck under: the fog turns green and closes to 17 m, which is the whole underwater effect, and it comes back out the moment your head does. The player's position stays on the bed the whole time, so collision and everything else that reads a position carries on working unchanged; only the eyes move.

The first version of this fenced the water off at knee depth. That was a decision I made without being asked, and the wading rule took three tries to even get right — see the log for 2026-10-19, including a rounding error of 4×10⁻¹⁶ that froze anyone standing in the river. The waterfall is 100 m beyond the garden boundary, so the river valley stays open: a corridor you can walk up to the plunge pool, because a waterfall you can only look at over a fence is scenery rather than a place.

Three other things had to move with the size:

- **The sun travels with the player.** The shadow camera is a 52 m box. Left at the origin it shadowed the one room in the middle of the garden and nothing else.
- **The land undulates over the whole garden, not once per bay.** `groundHeight`'s frequencies came down by ten, so a 4 m terrain mesh segment still follows the ground to within **4 mm** — measured against the analytic height over 40,000 samples — and nothing floats.
- **The markers are not fogged.** Fog ends at 420 m; the scene you are walking towards is usually further away than that, and a marker the fog erases is no marker at all.

Two details that do most of the work:

- **Leaf colour, not flowers.** The border palette carries plum, copper, gold and five greens. A mixed border gets its depth from foliage; the bedding carpets are the accent, not the subject.
- **Depth-graded planting.** A shrub's size comes from how far back in the border it sits, so the beds read as banks rather than as scattered balls.

No raised beds, no potting bench, no vegetable row. The insects live on the garden's own planting: a scene says *on foliage*, *on bare earth*, *at the flowers*, *on a trunk* or *in the hedge*, and the engine resolves that against the garden it actually built. Fixed coordinates were wrong twice over — they drifted whenever the planting changed, and they left insects hanging in the air the moment the plant beneath them was deleted.

## What the game still gets wrong

- **The insects are drawn nine times life size.** An aphid is about 2 mm; at true scale it is two or three pixels on a phone and no child ever finds it. This is the one place the game lies about the insects. Everything it says about what they *do* is true.
- The look is **stylised, not photographic**: faceted foliage masses rather than scanned plants, because every texture is generated in code and nothing is downloaded.
- **Thirteen cards, six hundred sightings.** The scatter makes the garden feel full, but it does not add anything new to learn after the thirteenth card. What it buys is that the cards can now be found anywhere, and that a child who wanders gets rewarded for wandering.
- **A stage change takes seven seconds.** In life it is days. Nothing else about the lifecycle is compressed — the order, the places, and what each stage eats are all as they are.

## Related pages
- [[lacewing-project]]
- [[outreach-event]]
- [[lacewing-play]]
