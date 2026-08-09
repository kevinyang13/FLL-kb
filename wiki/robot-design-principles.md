---
title: Robot Design Principles
layout: default
nav_order: 8
parent: Wiki
---

# Robot Design Principles

**Summary**: Design heuristics for building and coding the team's tools — reliability first, plus the season's hard constraints and cut rules.

**Sources**: raw/bioglow/fll-future-3-8-bioglow-rulebook.pdf, Bot Builders Parent Handbook

**Last updated**: 2026-08-08

---

## Core Principle: Reliability Over Complexity

Build simpler mechanisms that work consistently over complex mechanisms that score more but fail often. A mission scored 8 times out of 10 beats a mission worth more points that lands 3 times out of 10.

**Our game raises the stakes on this.** Rank is set by the **average** score across at least three matches, not the best single match. A blowout match cannot be discarded, so consistency is worth strictly more than peak performance. (source: fll-future-3-8-bioglow-rulebook.pdf rule 2)

## Hard Constraints to Design Around

| Constraint | Value |
|------------|-------|
| Inspection height limit | **8 in. (203 mm)** |
| Equipment must fit completely inside | its designated player area |
| Hardware allowed | 2× color sensor, 2× double motor, 2× controller, 2× single motor |
| Hardware surrendered to the field | 1 double motor, 1 color sensor, 1 single motor |
| Passing between players | **Not allowed** — items leave an area only via a tool |
| Floor storage | Not allowed |

Because field hardware counts against the same total, the robot effectively gets **one** of each device. Design for that from day one. Full rules: [[bioglow-missions]].

## Mission Selection

Score the free points first — they cost no match time:

1. Tokens already in place or scored by *not* disturbing things
2. Single-condition missions
3. Missions with independent partial credit
4. Multi-step or opponent-dependent missions last

Then layer complexity only once the base is reliable.

## Testing Protocol

Run each mission 10 times to measure reliability. Vary the conditions — shift the mat, change tables, nudge models. No two competition tables are alike.

## 40% Success Threshold

**Week 8 cut rule**: any mission below 40% success gets dropped. Applied during "Upgrade & Iterate" after reliability testing. Keeps the run lean rather than chasing points from unreliable attempts.

Exception: free-point items are never cut, since they consume no match time.

## Design Freeze

**Week 13, Oct 25.** After this point: bug fixes only. No new missions, no structural changes. Prevents late-season regressions. See [[calendar]].

Anything requiring new hardware must therefore be settled *well* before this date — see the open hardware gap in [[equipment-inventory]].

## Engineering Notebook

Curation starts week one. Documents design decisions, iterations, and failures. Required for judging — judges ask "why" and "how" about design choices.

## Related pages
- [[bioglow-missions]]
- [[equipment-inventory]]
- [[coding-and-programming]]
- [[engineering-design-process]]
- [[bot-builders-training-plan]]
- [[calendar]]
