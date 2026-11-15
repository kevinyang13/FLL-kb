---
title: Robot Design Board
layout: default
nav_order: 12
parent: Wiki
---

# The Robot Design board

**Summary**: The plan for the Robot Design tri-fold — what goes in each panel, which of our photographs fills each slot, and what still has to be measured before it can be printed. It is dressed to match our own Innovation Project board, and borrows its structure from the Dino Diggers board (team 70440).

**Sources**: raw/source-docs/robot-design-2026-10/ (nine photographs, October 2026 — our robot, our own Innovation Project board, and two of the Dino Diggers board); wiki/match-strategy.md; wiki/driving-base.md; raw/bioglow/fll-future-3-8-judging-rubric.pdf

**Last updated**: 2026-11-14

---

![The board layout](../docs/assets/robot-design/board-layout.svg)

**[Open the layout full size](../assets/robot-design/board-layout.svg)** · regenerate with `python3 scripts/make_board.py`

It is drawn at 48 × 36 inches with **wings 12 in, centre 24 in** — the real board has **side panels 12.75 in and a centre panel 22.5 in**, so the SVG is slightly off — so every box on it is a real size. Print at 100% and the boxes are the boxes.

---

## It matches our own board

The Innovation Project board already exists and already works — **Backyard Biodiversity: Tiny Heroes, Big Impact**. Two boards standing next to each other at a tournament should look like they came from the same team, so the Robot Design board borrows its whole visual language:

![Our Innovation Project board](../docs/assets/lacewing-board-final.jpg){: width="620"}

| From our board | On the robot board |
|---|---|
| **A black board**, with everything sitting on it as a card | Same — the panels are black, not cream |
| **Cream banner headings** in dark green display type | Every section heading |
| A **yellow numbered badge** — *1.* *2.* *3.* | Six sections, numbered in reading order |
| A one-line kicker under each heading | Every banner says what its section is *for* |
| White cards outlined in **green** | Every block of text and every photo |
| Yellow for anything still to do | The two callouts |
| Leaf sprigs either side of a heading | Same sprig, drawn in code |

---

## What we took from the Dino Diggers

Their board is an Innovation Project board, not a robot one, but the **shape** of it is what makes it work, and that transfers:

| What they do | Why it works |
|---|---|
| A title block you can read across a room | A judge decides whether to walk over from ten feet away |
| **Two-column iteration tables** — *what we learned* beside *what we changed* | It proves a loop happened. A list of features does not |
| Every expert conversation shown with a photo | *"We met an archaeologist"* is a claim; the screenshot is evidence |
| A costed parts table | Nobody expects it, so it reads as serious |
| A QR code to a video | The board cannot move; the video can |
| Hand-drawn doodles around the edges | It still looks like children made it, which it should |

![The Dino Diggers board](../docs/assets/robot-design/reference-dino-diggers-board.jpg){: width="420"}
![Their iteration tables](../docs/assets/robot-design/reference-dino-diggers-detail.jpg){: width="420"}

**The one thing not to copy: the density.** Theirs is packed to the edges because they had a full season of evidence. Ours has five weeks. A half-full board of real numbers beats a full one of filler.

---

## Board structure — built from the Engineering Design Rubric (decided 14 Nov 2026)

The board exists for the **5-minute presentation**, which the judges score on the Engineering Design Rubric (10 rows in four areas; rows marked ⚙ also count toward Core Values, which is 25% of the Champion's score). So every section answers one rubric row, and each section header on the page carries its row number. One board, two folds, three panels. **The board is a 36 in × 48 in tri-fold: side panels 12.75 in wide, centre panel 22.5 in wide** (supplier's dimensions, 14 Nov 2026), so the page uses that 12.75 : 22.5 : 12.75 split.

**Page:** [robot-design-board.html](../robot-design-board.html) is the source of truth for the layout and prints at 48 × 36 in. The SVG above shows the **earlier six-section layout** and has not been redrawn.

### Panel 1 — Identify · & our strategy *(side panel, one column)*

| # | Section | Rubric row | State |
|---|---|---|---|
| 1 | **How We Practise** | 1 · guided missions, build/code resources | Part filled (field built, five run-throughs, three identical bases). **Placeholder:** which guided missions and resources we used |
| 2 | **What We Found To Improve** | 2 ⚙ · areas to improve in the provided tools | Filled: what we found → design requirement (low/wide/heavy, place don't throw, release exactly 3, sticky wheels, forgiving tool, under 8 in.) |
| — | The map | — | Table photo |
| 3 | **Our Mission Strategy** | 3 · clear strategy guiding design | Filled: rank = average; three sequences with roles and points (see below); 40% rule |

### Panel 2 — Design & Create · Iterate *(centre panel, one column, two rows)*

| # | Section | Rubric row | State |
|---|---|---|---|
| 4 | **Our Robot** (v5) | 4 · custom builds supporting the strategy | Filled: v5 photos; tool → what it does for the strategy |
| 5 | **Our Code** | 5 ⚙ · custom coding supporting the strategy | Filled with the three programs (below). **Placeholder:** programs for sequences 2 and 3, how a program is chosen, a code screenshot |
| 6 | **Options We Explored** | 6 · multiple options per role tool | Filled from the iterations, by tool. **Placeholder:** grand-tree options, photos of rejected designs |
| 7 | **How We Test** | 7 · clear testing process, documented | Filled: reliability tests, 40% rule, readiness checks, scored rounds; score chart for 25 Oct, 1 Nov, 8 Nov. **Placeholder:** the testing log (per-tool reliability) |
| 8 | **What Testing Changed** | 8 ⚙ · uses results to improve | Filled: all five versions (built / went wrong / changed) plus test → change. **Placeholder:** what the 85 on 8 Nov taught us |

### Panel 3 — Communicate *(side panel, one column)*

| # | Section | Rubric row | State |
|---|---|---|---|
| 9 | **How We Play Together** | 9 ⚙ · cooperation between roles and with another team | Roles and hand-offs filled. **Placeholder:** partner-team plan — not agreed yet |
| 10 | **Everyone Contributes** | 10 ⚙ · all members contribute | Filled from the record (rotation, role picks, built the field together). **Placeholder:** who built or coded what, by name, on the printed board only |
| 11 | **Our Journey** | — | Timeline 16 Aug → 31 Jan |
| 12 | **What We Would Do Next** | — | Open items; space for the team's own words |
| 13 | **Our Presentation** | — | **Placeholder:** speakers, order, opening line |

### The three programs (coach, 14 Nov 2026)

1. **Sequence 1 drive** — controls the start of sequence 1: to the young forest, then to the nest.
2. **Dispenser motor** — controls the single motor that dispenses the keystone species into the young forest.
3. **Remote control** — if the robot goes off track, the Driver takes over with the remote.

Sequences 2 and 3 were not described, so no program is claimed for them. The robot has no gyro and counts wheel rotations (source: [[driving-base]]).

### 5-minute mode

A button on the page starts a 5:00 clock that lights up the part of the board for each rubric area in turn. The split is a **placeholder**: Identify 0:45 · Design & Create 1:30 · Iterate 1:45 · Communicate 1:00. Each segment has a speaker box (saved only in the viewer's browser, so no child's name is published). Pressing a segment jumps to it.

### What was dropped or changed on the page

- **No version selector:** all five robots are shown at once, so the page matches what is printed.
- **Content cut to fit** the narrow side panels: sequences shortened to 4–5 steps, tables trimmed, the version table drops the "built" column (built is in section 4 and 6), the journey is shortened to eight dates. The full wording of the sequences, including every dictated detail, is in the earlier sections of this page and in [[match-strategy]].
- **Smaller text** so everything fits; **print** is set to one 48 × 36 in page (Print button, or the browser's print with background graphics on). Measured: the tallest panel fits with about 10% spare.
- **Sequences** are always open and carry their role tags; the role buttons still highlight a role's steps on screen.

---

## Panel by panel (earlier six-section layout)

### Left wing — mission design and the three sequences

The sequence *is* the argument; the robot is only how it gets delivered. Three sequences, because three is how many can run without queueing for one robot — see [[match-strategy]] and [[season-journal]] Week 11.

| | Route | Why |
|---|---|---|
| **1 · the park route** | Young Forest → Nest → back to base | Roll in **3 tokens = 60**. Roll in a **4th = 40 extra** — the queen gets knocked out. **Nest = 30**. Then drive back to the technician base and take the bottom attachment off. Technician, driver and specialist work together (coach, 8 Nov 2026) |
| **2 · the cycle route** | Base → Cave Waterfall → back to base | The **Technician** loads the keystones, removes the mesher and tells the **Driver**. The Driver drives to the cave waterfall; the **Specialist** works the grand tree to open the top of the waterfall; keystones are dropped in. The Driver drives back to the technician base, the Technician refits the bottom part, and the robot grabs the tokens to Central Haven (coach, 8 Nov 2026) |
| **3 · the Operator tool** | Grand Tree → Hollow Tree → Cave Waterfall | Deliver the resource token; kicking it in is **5**. The Specialist spins the grand tree toward the hollow tree: resource into the canopy chamber **10**, keystone species into the hollow tree **20**. Do it again for another **20**. The Specialist spins the grand tree once more to move the top blocking the cave waterfall, so the Technician and Driver can get there and the Specialist releases the token. Two resources up top: **100** (coach, 8 Nov 2026) |

**Sequences 1 and 2 are the two sides of the central tension** — park the tokens, or cycle them — and running both is the refusal to choose that the team made in Week 6 when they split the grand tree. Sequence 3 costs the driving base nothing, because it is somebody else's hands.

### Centre — the final design, then how we got there

**Part one: the robot we are taking.** The v5 build — the v4 chassis cut down to 7 inches — shown from the side and at the field, with the four things that make it the one we kept — one chassis with both motor types and a gear take-off, meshers, three identical bases, and small-light-sticky.

**Part two: the five versions**, in four columns — **the robot · what we built · what went wrong · what we changed** — each with its own photographs, and v3, v4 and v5 with two photos each. Dates on every row, and the 210 on v2, so each version reads as an event rather than a label. Full write-up in [[robot-evolution]].

The run data is **not** on the board any more. Tries, worked, seconds and points belong in the kids' notebook and in what they say out loud; a table of empty cells on a tri-fold is worse than no table.

### Right wing — the team and the journey

The four roles with names against them, the team photograph, a dated timeline of twenty-seven Sundays from the field being built to the 31 January competition, and a box for what is still wrong with the robot.

## Before it can be printed

| | Still needed |
|---|---|
| ⬜ | **Timed runs.** Not for the board — for the notebook, and for the sentence *"it worked 11 times in 15"* |
| ⬜ | **Names against the four roles** — unassigned since Week 6 |
| ⬜ | **The waterfall loop time** — one number, and it picks which sequence we run |
| ✅ | **Five real iterations** with dates — done, from [[robot-evolution]] |
| ✅ | **Robot photos** — v1 to v5 are on the board; the final-design photos are now the 7-inch v5 |
| ⬜ | **The slanted ramp** photographed close up and working — the v5 photos show it fitted but not firing. Also confirm the v5 text: the dictation said "RAM at the back" and "a Lego piece box"; this board says *RAM at back* as dictated, probably a ramp |
| ⬜ | **The QR code** — `python3 scripts/make_qr.py "<run video URL>" "Watch a run" --out run` |

> **The numbers are the whole board.** *"Eleven of fifteen tries"* is worth more than any sentence on it. *"It almost always works"* is worth nothing, and a judge has heard it from every team before you.

## Related pages
- [[robot-evolution]]
- [[match-strategy]]
- [[driving-base]]
- [[judging-and-awards]]
- [[bioglow-missions]]

## v5 — what the coach said, and what is assumed

Dictated on 8 Nov 2026 and put on the board as written:

- **Why v5.** v4 was over the 8-inch maximum, so it was cut to **7 inches**. The mesher stays.
- **No hollow tree.** The robot no longer does the hollow tree because it is too high; that job moves to a different mission (matches the earlier decision that the grand tree drops into the hollow tree — see [[match-strategy]]).
- **New tool.** A **slanted ramp** that turns and shoots keystone species into the young forest. The dispenser stays.
- **"A RAM in the back, securing it with two Technic bars and a Lego piece box."** Not clear from the dictation whether this is a ramp, a ram or something else, or what the piece box does. Left as "RAM at the back" until confirmed.

The v5 photographs (1–2 Nov) show the compact black frame with the brown tube lying across the top; they are read, not labelled by the team.


> **Sequence 1, 8 Nov update:** hollow tree dropped from the route (moved to another mission, see v5). "4 tokens = 40 extra because the queen gets knocked out" is as dictated — which mission pays it, and whether it is 40 on top of the 60, still needs checking against the rule sheet.

> **Sequence 3, 8 Nov update:** the dictated figures (5 + 10 + 20, repeated, "total 100 with two up there", plus a stray "20 from the canopy chamber") do not add up cleanly — 2 × (5+10+20) is 70. Check the split against the rule sheet before it goes on a printed board. The old line that the grand tree "never stops the driving base" no longer holds: the Technician and Driver wait on the Specialist to clear the waterfall.

> **Sequence 2, 8 Nov update:** the "× 50 loops" framing is gone from the card because the dictation describes one run. Whether the 50-cycle pool is still the plan, who "drops" the keystones (driver or specialist — dictated both), and what "the bottom part" is, are unconfirmed. Per-run points were not given.

> **Interactive version:** [robot-design-board.html](../robot-design-board.html) — the same three panels as a page: sequences open by role, version tabs with photos, a compare table, and a journey timeline. Built 14 Nov 2026 from this page.
