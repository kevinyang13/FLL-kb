---
title: Match Strategy
layout: default
nav_order: 5
parent: Wiki
---

# Match Strategy — Mission Order and Sequencing

**Summary**: Which mission to run first, why the waterfall and the microbiomes compete for the same tokens, and five candidate match sequences with their trade-offs.

**Sources**: raw/bioglow/fll-future-3-8-bioglow-game-missions.pdf, raw/bioglow/fll-future-3-8-bioglow-rulebook.pdf

**Last updated**: 2026-08-30

---

> **Brainstorm, not a decision.** Nothing here is settled. These are candidate sequences to test against a stopwatch on the real field. The numbers that would settle the argument are marked **[verify]** and have not been measured yet.

## First, a scoring reading that matters

The missions PDF writes caps as `(maximum N): X points each`. **N is a count of objects, not a point ceiling.** This is unambiguous elsewhere in the same document — *"(maximum 3 in each): 20 points each"* is three keystone species per microbiome, and *"(maximum 5): 20 points each"* is the five invasive species models.

Applied to M03, `(maximum 50): 5 points each` is **50 cycles = 250 points**, not 50 points.

That single reading decides everything below, because it makes the waterfall the largest pool on the field.

| Mission | Max points | Nature |
|---------|-----------:|--------|
| **M03** Cave Waterfall | **250** | Throughput — tokens cycle repeatedly |
| **M01** Mighty Microbiomes | 180 + 40 | One-time placement, **locks tokens up** |
| **M02** Roots of Renewal | 150 | Throughput through the grand tree |
| **M04** Rainforest Awakening | 50 | All-or-nothing, **supplies every other mission** |
| **M05** Central Haven | 5 each | End-of-match, scores for **both** teams |

Full mission detail: [[bioglow-missions]].

---

## The opening move is not a judgement call

**M04 Rainforest Awakening goes first.** It opens the nest and the hollow tree, and those tokens are what M01, M02, M03 and M05 all consume. Every second M04 is late, four other missions are starved.

It is also all-or-nothing — 30 points for releasing **all** keystone species from the nest, 20 for **all** resources from the hollow tree. No partial credit, so there is no reason to do it halfway or return to it later.

**Drill target: both halves fully open within the first 20 seconds.**

---

## The central tension — park or cycle?

M01 and M03 compete for the same keystone species tokens, and they pay on completely different terms.

| Choice | Payment | After |
|--------|---------|-------|
| **Park** a token in a microbiome | 20 points, once | Token is **dead** — it cannot be cycled |
| **Cycle** a token through the waterfall | 5 points | Token returns and can cycle again **[verify]** |

So the break-even is arithmetic, not opinion:

> **Cycling beats parking whenever a token can complete 4 or more cycles in the time remaining.**

A token in hand at 2:00 remaining might cycle eight times and pay 40. The same token at 0:20 remaining pays 20 by being parked. Which gives the general rule:

**Cycle early. Park late.**

The crossover point is a stopwatch question. Time one full cycle on the real field and the answer falls out for every match afterwards.

---

## Five candidate sequences

### 1 · Waterfall Engine — highest ceiling

```
M04 open → M03 continuous loop → M01 park leftovers → M05 dump
```

Treat the waterfall as a machine that runs the whole match. Driver and Technician feed it without stopping. At roughly 45 seconds remaining, stop cycling and park whatever is in hand into microbiomes at 20 each. Final 15 seconds, everything loose goes to the haven.

- **Wins because** it is the only sequence that meaningfully reaches the 250-point pool
- **Hard because** it needs a fast, reliable loop. A jam collapses the score — and rank is the *average* across matches, so a collapse cannot be discarded
- **Prerequisite** — a measured cycle time under roughly 8 seconds **[verify]**

### 2 · Anchor First — most consistent

```
M04 open → M01 nine placements + bonus → M02 canopy → M03 with remaining time → M05 dump
```

Bank the guaranteed points first: three keystone species into each of the three microbiomes for 180. Then the fourth into the young forest to knock down the opposite queen for +40. Specialist cycles resources to the canopy. Waterfall takes whatever is left.

- **Wins because** roughly 370 points do not depend on throughput at all, and the averaging rule rewards exactly this
- **Costs** most of the 250-point waterfall pool
- **Best fit** for a rookie team's first tournament

### 3 · Split the Field — best use of four roles

```
M04 open → Driver + Technician run the M03 loop
         → Specialist + Operator run M02 and M01
         → converge on M05
```

Two roles on throughput, two on placement, simultaneously. This uses the actual design of the game: four players acting at once in four areas.

- **Wins because** it has the highest points-per-second if communication holds
- **Hard because** it *is* the communication test — four areas, nothing passed by hand
- **Directly trains** the Week 4 goal of improving in-match communication

### 4 · Coopertition Max — lowest risk, highest floor

```
M04 open → normal scoring → heavy M05 dump, coordinated with the other team
```

Talk to the other team **before** the match and agree that both sides sweep everything loose into the central haven in the final 20 seconds. Every token resting there pays **both** teams 5 points, no matter who delivered it.

- **Wins because** it is the only mission where helping your opponent scores for you. The points are real and the cooperation costs nothing
- **Also wins** on the judging side — Coopertition and Gracious Professionalism are scored, and the Coopertition Award rewards a *pair* of teams. See [[gracious-professionalism]]
- **Limit** — 5 points per token is the lowest rate on the field, so this is a *floor-raiser layered onto another sequence*, not a plan by itself
- **Depends on** the other team agreeing. Ask early, ask politely, accept no gracefully

### 5 · Level Up Gambit — buy points with difficulty

```
Pre-match: place all 5 invasive species → M04 open → normal sequence
         → contain invasives when convenient
```

The Level Up Challenge pays **20 points per invasive species placed**, up to five, and the points are earned at placement whether or not the team ever cleans them up. That is up to **100 points before the match starts**. Containing them later adds 10 each.

- **Wins because** the placement points are close to free — the team is paid for handicapping itself
- **Real cost is obstruction**, not points: those five models sit in the grand tree, nest or young forest and get in the way of M01, M02 and M04 for the entire match
- **The question to test** is whether the obstruction costs more than 100 points of throughput. That is measurable — run the same sequence with and without the invasives and compare
- **Note** the invasive queen is a *required* model in the hive and scores nothing at placement, but can be delivered to containment for 10
- **Timing** — worth testing only once the base missions are reliable, per the Week 8 review in [[bot-builders-training-plan]]

---

## Comparison

| # | Sequence | Ceiling | Floor | Difficulty | Depends on |
|--:|----------|---------|-------|------------|------------|
| 1 | Waterfall Engine | Highest | Low | Hard | Fast, reliable cycle |
| 2 | Anchor First | Medium | **Highest** | Moderate | Placement accuracy |
| 3 | Split the Field | High | Medium | Hardest | Communication |
| 4 | Coopertition Max | Low alone | Raises any floor | Easy | The other team |
| 5 | Level Up Gambit | +100 up front | Lowers it | Moderate | Obstruction tolerance |

Sequences 4 and 5 are **layers**, not alternatives — either can be added on top of 1, 2 or 3.

---

## Fixed points regardless of sequence

- **M04 first, always.** Everything else is downstream of it
- **M05 last, always.** Tokens in the haven are out of circulation, so it is a final-15-seconds sweep
- **The +40 bonus is cross-field.** It needs three keystone species in your young forest **and** the invasive queen knocked down on the *opposite* side — the young forest color sensor talking to the hive single motor through the connection card. Forty points for one extra token, and worth a dedicated drill
- **Consistency beats peak.** Rank is the **average** across at least three matches. A team scoring 300 three times beats a team scoring 450, 400 and 80. This is the strongest argument for sequence 2 and against sequence 1

---

## What to measure before deciding

Everything above is reasoning from the printed scoring. These are the numbers that would turn it into a decision, and none of them has been measured.

| # | Question | How to answer |
|--:|----------|---------------|
| 1 | **Do tokens return to play after cycling the waterfall?** | Run one token through and watch where it goes. Sequence 1 collapses if they do not |
| 2 | **How many keystone species tokens exist in total?** | Count them on the built field |
| 3 | **How long is one full waterfall cycle?** | Stopwatch, ten runs, take the median |
| 4 | **How long does M04 take to open both halves?** | Stopwatch. Target under 20 seconds |
| 5 | **What does the Level Up obstruction actually cost?** | Same sequence with and without invasives, compare scores |

Question 3 is the important one. Under roughly 8 seconds and the Waterfall Engine becomes worth its risk. Over that, Anchor First is the right answer for the season.

## Related pages
- [[bioglow-missions]]
- [[robot-design-principles]]
- [[gracious-professionalism]]
- [[team-roster]]
- [[bot-builders-training-plan]]
- [[coding-and-programming]]
