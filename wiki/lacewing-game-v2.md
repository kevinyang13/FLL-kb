---
title: Lacewing Garden v2
layout: default
nav_order: 11
parent: Wiki
---

# Lacewing Garden v2 — the walk-around version

**Summary**: A backyard garden you walk around in first person, looking for insects. Thirteen field-guide cards to fill in, each one earned by guessing *helpful or pest* before the answer appears — and three of them change in front of you if you stay and watch. Built as layered ES modules following the architecture of the SimCraft reference project.

**Sources**: github.com/justinyang13/app-project-zero (app-sim-craft — architecture and control scheme); raw/source-docs/tracy-rincon-vitova-zoom-2026-10-04.md (development times, feeding); raw/source-docs/good-bugs-vs-bad-bugs-poster-2026-10-04.jpg

**Last updated**: 2026-10-21

---

> **[Play it](../v2/)** · v1, the tabletop version, is still at **[game.html](../game.html)** and is the better one for a two-minute visit at a table.

## The game

You walk a garden and look for things. There is **no clock, no score and no way to lose** — the only thing that advances is how much of the notebook is filled in.

**Refreshing puts you back.** Position and facing are written to `localStorage` every couple of seconds and restored on load, in their own key apart from the notebook. A pose carries the **shape of the world it was taken in** — seed, garden size, room count, how many clumps and trees — and a pose from a different world is thrown away rather than trusted, because a spot that was a lawn last week may be the middle of the lake now. A restored pose also goes through the same clamp a normal step does, so a saved spot outside the fence or inside a tree comes back as the nearest legal one.

**Rock is ground, not a wall.** Boulders, crags and the granite dome used to be collision cylinders: solid, but you bumped into them and stopped. They are part of the surface you stand on now — `standHeight(x, z)` is the land plus the stone standing on it — so you cannot walk through them because the ground rises, and you *can* walk up them wherever the rise is gentle enough. A rock is an ellipsoid about its seat, just inside the lumpy shape that is drawn, and the seat is worked out once by the planting plan and read off the rock by the renderer: two copies of that sum would drift apart the first time either changed, and the player would stand where the stone is not.

A pure slope test was not enough. An ellipsoid is vertical at its rim however small it is, so every stone in the garden came out a wall again — a wall made of ground instead of a cylinder. A walker also gets a **step**: a single move may rise 62 cm however steep it is, which is a kerb, or putting a foot on a boulder. Garden rocks are climbable; an 18 m mountain crag is not, and neither is the dome — its sides are sheer by design, which is what Half Dome is. Those you reach **by griffin**, which now sets you down on top of a boulder or on the dome's back as readily as on the lawn. Only a castle roof is still refused.

**Press `T` to change the hour.** Seven of them, cycling: **Sunrise → Morning → Midday → Afternoon → Sunset → Dusk → Full moon**. The sky crosses from one to the next over about a second and a half rather than cutting, and the hour is saved with your position, so a refresh brings back the light you left.

Each hour is a row of numbers in `data/daytime.js` — sky gradient, the key light's colour, strength, height above the horizon and bearing, how much fill light bounces, how far you can see, how much of the star field shows, and the exposure. The engine interpolates between two of them and decides nothing about how any hour looks.

**At night the key light *is* the moon**: the same single shadow-casting light, cool and weak (0.62 against midday's 3.1) instead of warm and strong, which is why a full-moon night still casts shadows. Fourteen hundred stars fade in across dusk, the fill light drops to a fifth, and the fog closes from 420 m to 200, so the garden ends in darkness a little way off instead of running to the horizon. Shadows are the most expensive thing on a phone, so there is still exactly one light casting them, whatever the hour.

**Tap forward twice to run.** A second press of `W` (or `↑`) within a third of a second keeps you running at **8.7 m/s — exactly three times the 2.9 m/s walk** (it was double until the mountains opened up and the walks got long) — for as long as you hold the key; letting go ends it. `Shift` does the same thing, but the double tap is what a nine-year-old on a laptop reaches for first, because it is what every game they have already played does.

**Press `M` to go up.** The camera leaves your head and climbs, looking back down along the way you are facing, and the whole screen becomes the garden from the air — the real one, in three dimensions, not a drawing of it. Two heights: **34 m**, close enough to read the planting in the next room, and **105 m**, high enough to hold the lake, the river and the mountains in one frame. `M` again lands you; `Z` and `X` change height while you are up; `Esc` lands you too.

It does **not** pause the game. You keep walking, and watching the garden move under you is most of what the view is for. A ring marks where you are standing, scaled with the height so it stays the same size on screen — from a hundred metres up a person is a few pixels. Nothing is in reach from the air: the targeting test is an angle measured from the camera, and up there the camera is a hundred metres from the player it is measuring distances for.

The fog is what tells the three ways of seeing apart, because it is already the thing that says how far you can see: 0.4–17 m and green underwater, 220–1250 m from the air, 90–420 m on foot. Underwater wins over aerial, aerial over walking — at 105 m the garden's own 420 m fog would hide the mountains the view exists to show.

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
| **Hide or show the messages** | `L`, or the chip at the top. Remembered in this browser |
| **Call the griffin / send it away** | `G` |
| **Ride the griffin / land** | `R` (stand next to it first) |
| **Fly** | `W` goes where you look, `Space` climbs, `C` dives, `A`/`D` slide sideways |
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
| **The dome** | A granite dome after Half Dome, 210 m tall and about 400 m across, with one sheer face about 200 m beyond the east fence and turned to look back at the garden. |
| **Stone** | 1,451 small stones, 158 boulders and 1,731 mountain rocks — see below. |

### Out of the garden and up the mountains

**The garden is no longer fenced on the north, east or west.** You can walk out through the forest and climb any of the **seven summits**, the highest **258 m** above the lawn — a three-to-five-minute walk from the start. Each top has a cairn, and the first time you stand on one the notebook says which peak it was and how high. Higher up the fog opens out, so from a summit you can see the garden you climbed out of. The south stays fenced: the hills there are scenery shapes, not ground.

**A cliff is still a cliff.** A step steeper than about 60° is refused and you slide along the slope instead, which is how you find the way round. The mountain tops are pointed and steep, so the limit is set just above them; the waterfall escarpment is several times steeper, so you walk round its ends. The dome cannot be climbed. Forest trunks and mountain rock are solid now that you can reach them.

### The griffin

**Press `G` and a griffin comes down out of the sky** to stand beside you: a white eagle head with a hooked yellow beak, a brown feathered chest and wings, golden lion haunches and a tufted tail, about 3.5 m long and 10 m across the wings. It waits with its wings folded and follows if you walk off. Walk up to it and press **`R`** to climb on; **`G`** again sends it away.

**Flying is where you look.** `W` takes you the way the camera faces, so looking up climbs and looking down dives; `Space` and `C` climb and dive without changing the view. Top speed is **29 m/s — ten times walking** — and it builds and fades over about a second, so it feels like riding something heavy rather than moving a camera. **`R` lands**: it glides down and sets you on the ground beside it.

**What you feel on its back:** the body heaves a little on every wingbeat, it banks into turns and the view rolls with it, the view widens slightly with speed, and on top of that a slow drift — two waves at unrelated speeds, so it never settles into a rhythm — keeps a long glide moving under you. Measured over two seconds of level flight at full speed: about 40 cm of rise and fall, and a roll of a couple of degrees.

It flies over things rather than through them: the ground, water, the dome and both castles. Landing over the dome or a castle, it glides on until there is open ground below. It is three meshes (body and two wings), so three draw calls. Flight runs on the frame rather than the 20 Hz walking step, because at 29 m/s a 20 Hz step is a 1.5 m jump and the view stutters.

### Two castles

**A palace on the lake**, after Moszna in Poland: a sandstone Gothic block with a great round tower, a cream Baroque centre with a domed entrance and a fountain terrace, and a pale Renaissance wing with stepped gables, under steep red roofs and a crowd of spires. It stands on the south shore, looking north across the water to the mountains.

**A fortress on the hill**, after Hohenzollern in Germany: golden stone, battlemented curtain walls with round bastions, a keep and slate spires, on the peak above the waterfall. The top of the peak is levelled into a courtyard, a road winds up to the gate in switchbacks, and you can walk in through the gate. It counts as one of the seven summits.

Both are plans in `worldgen/castles.js` — every wall, roof and window as a record — and each is baked into **one mesh**, so a whole castle costs one draw call.

### Rock, boulders and the dome

**Rock shows where the land is steep, not only where it is high.** The terrain was tinted towards rock above 18 m, which left the escarpment green all the way up its face, because it starts at the valley floor. It now also turns to rock wherever the slope stands up past about 30°, and snow no longer lies on a cliff.

**Stone, in three sizes**, all from `placeRocks()` in `worldgen/layout.js`:

| | How many | Where | Drawn as |
|---|--:|---|---|
| Small stones | 1,451 | Behind the front row of the borders, round the grove boulders, at the waterline | No shadow, nothing to walk round |
| Boulders | 158 | A group in three rooms out of four, the river and lake banks, the foot of the escarpment | Cast shadows, and each is a blocker you walk round |
| Mountain rock | 1,731 | Crags on the high ground, and the fallen slab under the dome's face | No shadow, out of reach |

Every pass has its own random generator, so adding stone **moved no plant and no insect** — it is the same garden with rocks in it. Boulders keep clear of trunks (a boulder against a trunk hides the insects on the bark), of each other, and of the paths. Small stones sit behind the front row of a border, never in front of it, because the front row is where the insects are. A rock sits on the *lowest* of five points of ground under it and sinks into that, so on a slope it is buried uphill rather than floating downhill. Mountain rock comes in **crags** — a big block with a few broken off round it — because single rocks sprinkled evenly read from the air as grey polka dots.

**The dome is its own mesh, because the height field cannot make it.** The terrain has a vertex every 4 m; it can rise and fall but it cannot stand up straight, so a 200 m wall would come out as a smeared ramp. The dome starts as a hemisphere, its shoulders are pushed out so the sides climb steeply, the surface is roughened, and then every point past a cutting plane is pressed flat onto it. That last step *is* the face: sheer to the full height without being modelled. The face is pale granite with dark water streaks; the back is older and greyer. **It is wider than it is tall** — the first version was 285 m high and 300 m across, and from the air it read as a grey pillar; the real Half Dome is about twice as wide as its face is high. About 14,000 triangles (`engine/landmark.js`).

**Where it stands was decided by the fog.** On foot the fog closes at 420 m (200 m at night), so a dome on the horizon would only be seen from the air. It stands just past the east fence instead: it towers over the eastern rooms and is the view across the lake, and from the air it is the biggest thing in the landscape. From the western half of the garden on foot it is in the fog — by design, not by accident.

**What it cost**, measured at the same seven spots before and after (headless browser, so draw calls and triangles rather than frame rate):

| | Before | After |
|---|--:|--:|
| Draw calls at the spawn | 676 | 708 (+5%) |
| Draw calls from the air at 105 m | 1,028 | 1,080 (+5%) |
| Triangles from the air | 18.9 M | 19.1 M (+1%) |
| Memory | 74 MB | 77 MB |
| Time to build the garden | ~2.2 s | ~2.2 s |

Drawing the stone in 60 m cells like the planting cost about one draw call in seven; it now goes in 120 m (boulders), 160 m (small stones) and 240 m (mountain rock) cells, which halved that. A stone is a few dozen triangles, so drawing a few hundred off-screen ones is cheaper than the extra draw call that finer cells spend skipping them. The dome casts no shadow: the shadow camera is a 52 m box that travels with the player and the dome is never in it.

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
