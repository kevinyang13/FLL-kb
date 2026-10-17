---
title: Robot Design Board
layout: default
nav_order: 12
parent: Wiki
---

# The Robot Design board

**Summary**: The plan for the Robot Design tri-fold — what goes in each panel, which of our photographs fills each slot, and what still has to be measured before it can be printed. Modelled on the Dino Diggers board (team 70440) the team studied.

**Sources**: raw/source-docs/robot-design-2026-10/ (eight photographs, October 2026, including two of the Dino Diggers board); wiki/match-strategy.md; wiki/driving-base.md; raw/bioglow/fll-future-3-8-judging-rubric.pdf

**Last updated**: 2026-10-16

---

![The board layout](../docs/assets/robot-design/board-layout.svg)

**[Open the layout full size](../assets/robot-design/board-layout.svg)** · regenerate with `python3 scripts/make_board.py`

It is drawn at true print proportions — **48 × 36 inches, wings 12 in, centre 24 in** — so every box on it is a real size. Print at 100% and the boxes are the boxes.

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

## Panel by panel

### Left wing — the missions, and the order

The sequence *is* the argument; the robot is only how it gets delivered. Pull the five sequences straight from [[match-strategy]] and show the one chosen, with the reason beside each step.

Then the driving base, with the photograph labelled: **hub, two double motors, two single motors, two colour sensors, wheel size**. [[driving-base]] already has the physics; the board needs one sentence of it.

> **Say the hard part out loud:** there is no gyro in the kit. The robot counts wheel rotations and trusts them, which is exactly why squaring up against a wall matters more than driving accurately.

### Centre — the robot and how it changed

A clean photograph of the robot, and one of each attachment **doing its job on the mat**, not sitting on a table.

Then the iteration table, their two-column form:

| What we found out | What we changed |
|---|---|
| The base wandered on long runs | Shorter runs between walls; square up on a wall, not on a guess |
| The attachment had to line up exactly | Added meshers, so the tool registers against the mission model itself |
| Swapping attachments cost seconds | One mounting point, the same two pins every time |
| Battery level changed how far it drove | Count rotations, not time — and charge before every match |

**These four are placeholders written from what the team already knows.** Replace each one with something that actually happened, with the date it happened.

### Right wing — the four roles, us, and what is still wrong

Future Edition runs **four jobs at once** — Driver, Operator, Technician, Specialist — so name who does which. *"We all did everything"* is the wrong answer to a question a judge will definitely ask.

Then the team photograph, and a box that says what is **still wrong with the robot**. A team that can name its own weakest point is believed about everything else.

---

## Before it can be printed

| | Still needed |
|---|---|
| ⬜ | **Timed runs.** Three columns of the numbers table are empty: tries, worked, seconds |
| ⬜ | **Names against the four roles** — unassigned since Week 6 |
| ⬜ | **Four real iterations** with dates, replacing the placeholders above |
| ⬜ | **A clean robot photo** on a plain background — every shot we have is on the mat or the floor |
| ⬜ | **The QR code** — `python3 scripts/make_qr.py "<run video URL>" "Watch a run" --out run` |

> **The numbers are the whole board.** *"Eleven of fifteen tries"* is worth more than any sentence on it. *"It almost always works"* is worth nothing, and a judge has heard it from every team before you.

## Related pages
- [[match-strategy]]
- [[driving-base]]
- [[judging-and-awards]]
- [[bioglow-missions]]
