---
title: Lacewing Garden v2
layout: default
nav_order: 11
parent: Wiki
---

# Lacewing Garden v2 — the walk-around version

**Summary**: A backyard garden you walk around in first person, looking for insects. Thirteen field-guide cards to fill in, each one earned by guessing *helpful or pest* before the answer appears — and three of them change in front of you if you stay and watch. Built as layered ES modules following the architecture of the SimCraft reference project.

**Sources**: github.com/justinyang13/app-project-zero (app-sim-craft — architecture and control scheme); raw/source-docs/tracy-rincon-vitova-zoom-2026-10-04.md (development times, feeding); raw/source-docs/good-bugs-vs-bad-bugs-poster-2026-10-04.jpg

**Last updated**: 2026-10-13

---

> **[Play it](../v2/)** · v1, the tabletop version, is still at **[game.html](../game.html)** and is the better one for a two-minute visit at a table.

## The game

You walk a garden and look for things. There is **no clock, no score and no way to lose** — the only thing that advances is how much of the notebook is filled in.

**Finding them.** A **glowing mote** floats over every scene you have not finished, drawn at a constant size on screen so it is as visible from across the lawn as it is up close, and a **compass at the bottom of the screen** always points at the nearest thing still missing with its distance in metres. Hidden is not the same as unfindable: an insect is a centimetre across in a sixty-metre garden, and without those two things the garden reads as empty even while you are standing in it.

**Find.** Nine set-piece scenes are placed around the garden: an aphid colony with ants patrolling it and a mummy among the living, eggs on stalks under a leaf, a cocoon wedged in bark, whitefly on a leaf underside, a spider in the hedge, adults at the flowers. Crouch with `C` — which is also the macro lens — and press `E`.

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

**About 3,700 plants, in 80 draw calls.** Every repeated thing — shrub blobs, bedding flowers, conifers, canopy masses, the forest — is one `InstancedMesh` with a colour per instance, which is the only reason a garden this dense opens on a phone.

Two details that do most of the work:

- **Leaf colour, not flowers.** The border palette carries plum, copper, gold and five greens. A mixed border gets its depth from foliage; the bedding carpets are the accent, not the subject.
- **Depth-graded planting.** A shrub's size comes from how far back in the border it sits, so the beds read as banks rather than as scattered balls.

No raised beds, no potting bench, no vegetable row. The insects live on the garden's own planting: a scene says *on foliage*, *on bare earth*, *at the flowers*, *on a trunk* or *in the hedge*, and the engine resolves that against the garden it actually built. Fixed coordinates were wrong twice over — they drifted whenever the planting changed, and they left insects hanging in the air the moment the plant beneath them was deleted.

## What the game still gets wrong

- **The insects are drawn nine times life size.** An aphid is about 2 mm; at true scale it is two or three pixels on a phone and no child ever finds it. This is the one place the game lies about the insects. Everything it says about what they *do* is true.
- The look is **stylised, not photographic**: faceted foliage masses rather than scanned plants, because every texture is generated in code and nothing is downloaded.
- **A stage change takes seven seconds.** In life it is days. Nothing else about the lifecycle is compressed — the order, the places, and what each stage eats are all as they are.

## Related pages
- [[lacewing-project]]
- [[outreach-event]]
- [[lacewing-play]]
