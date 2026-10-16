---
title: Lacewing Garden v2
layout: default
nav_order: 11
parent: Wiki
---

# Lacewing Garden v2 — the walk-around version

**Summary**: A second version of the lacewing game: a backyard garden you walk around in first person, with a potting bench you raise lacewings on. Built as layered ES modules rather than one file, following the architecture of the SimCraft reference project.

**Sources**: github.com/justinyang13/app-project-zero (app-sim-craft — architecture and control scheme); raw/source-docs/tracy-rincon-vitova-zoom-2026-10-04.md (development times, feeding); raw/source-docs/good-bugs-vs-bad-bugs-poster-2026-10-04.jpg

**Last updated**: 2026-10-13

---

> **[Play it](../v2/)** · v1, the tabletop version, is still at **[game.html](../game.html)** and is the better one for a two-minute visit at a table.

## What is different from v1

| | v1 | v2 |
|---|---|---|
| View | A tabletop you orbit | First person, standing in the garden |
| Code | One 855-line HTML file | 27 ES modules in 11 layers |
| Textures | Flat colours | Generated PBR maps — colour, roughness, normal |
| Moving about | Drag to rotate | WASD, mouse look, touch joystick |
| Day | Button | Button, or `N` |

**v1 is not replaced.** It loads instantly and explains itself in ten seconds, which is what a QR code at a shopping-centre table needs. v2 asks for a minute and a bigger screen. Both are linked from the homepage.

## Controls

| | |
|---|---|
| **Walk** | `W` `A` `S` `D`, or the arrow keys |
| **Look** | Move the mouse (click once to capture it), or drag on a touch screen |
| **Run** | Hold `Shift` |
| **Crouch — and zoom in** | Hold `C`. This is how you see an insect: it drops you to leaf height *and* narrows the lens from 68° to 34°, which is what looking closely really does |
| **Use what you are looking at** | `E`, `Space`, or click |
| **The rearing bench** | `Tab`, or walk up to the bench and press `E` |
| **End the day** | `N` |
| **Back out of a panel** | `Esc` |

On a phone: a joystick anchors wherever your thumb lands in the bottom-left circle, dragging anywhere else looks around, and the two buttons on the right are **Use** and **End day**.

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
| `core/` | The garden's data model and every rule that changes it. **No three.js, no DOM** |
| `worldgen/` | Deterministic layout from a seed — same seed, same garden, every time |
| `rendering/` | Procedural textures, the material cache, disposal |
| `entities/` | Insect bodies and the populations that stand for the counts |
| `engine/` | The running game: loop, player, camera, interaction, world build |
| `input/` | Keyboard, mouse and touch → one input object |
| `state/` `session/` | The store the interface reads, and the commands it may call |
| `ui/` | The overlay. Imports nothing from `engine/` |

**Why it is worth the extra files.** `core/garden.js` has no browser in it, so the whole simulation runs under node. The balance of this game was tuned by running forty seasons a second in a terminal — *"played well: 17/40 wins, did nothing: 40/40 losses"* — which is not something you can do when the rules live inside a render loop.

## The garden

The planting plan follows a sunken ornamental garden of the Butchart kind: a lawn with a path curving through it, deep mixed borders on both sides, specimen conifers as vertical punctuation, a hedge at the back, and a forested slope rising beyond the boundary.

**About 3,700 plants, in 80 draw calls.** Every repeated thing — shrub blobs, bedding flowers, conifers, canopy masses, the forest — is one `InstancedMesh` with a colour per instance, which is the only reason a garden this dense opens on a phone.

Two details that do most of the work:

- **Leaf colour, not flowers.** The border palette carries plum, copper, gold and five greens. A mixed border gets its depth from foliage; the bedding carpets are the accent, not the subject.
- **Depth-graded planting.** A shrub's size comes from how far back in the border it sits, so the beds read as banks rather than as scattered balls.

The working vegetable beds — the part the game is actually about — sit off to one side at the east end, by the potting bench.

## What the game still gets wrong

- **The insects are drawn nine times life size.** An aphid is about 2 mm; at true scale it is two or three pixels on a phone and no child ever finds it. This is the one place the game lies about the insects. Everything it says about what they *do* is true.
- **Larval development is compressed** from about fourteen days to eight, for the same reason — at the real length nobody at a table sees an adult emerge.
- The look is **stylised, not photographic**: faceted foliage masses rather than scanned plants, because every texture is generated in code and nothing is downloaded.
- Aphids multiply at **1.13× a day** here. The real figure is nearer 1.28×, which makes the game unwinnable: the garden is gone before the first larva pupates. Worth saying out loud at the table, because it is the honest version of *"why is this so hard to control?"*

## Related pages
- [[lacewing-project]]
- [[outreach-event]]
- [[lacewing-play]]
