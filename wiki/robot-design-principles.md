---
title: Robot Design Principles
layout: default
nav_order: 8
parent: Wiki
---

# Robot Design Principles

**Summary**: Core heuristics guiding robot build and mission strategy for FLL competition.

**Sources**: docs/FLL_Rookie_Team_Master_Roadmap.pdf, docs/IntrotoFLLSUBMERGED.pdf

**Last updated**: 2026-05-11

---

## Core Principle: Reliability > Complexity

Build simpler mechanisms that work consistently over complex mechanisms that score more but fail often. A mission scored 8/10 times beats a mission scored 10/10 points but only 3/10 times. (source: FLL_Rookie_Team_Master_Roadmap.pdf)

## Mission Selection Strategy

**Low-Hanging Fruit** vs. **High-Risk** analysis done in Phase 1 (Weeks 1–3):

- Identify missions with straightforward mechanics and high success probability first
- Reserve complex missions for Phase 2+ once base reliability is established
- "High-Risk" missions only attempted if team has capacity after core missions are reliable

(source: FLL_Rookie_Team_Master_Roadmap.pdf)

## Drivetrain First

Build a stable drivetrain before any attachments. All mission consistency depends on repeatable robot positioning. Sensor suite: Color sensor (line detection/positioning), Gyro sensor (heading correction). Introduced in [[12-week-season-plan]] Phase 2.

## Testing Protocol

Run each mission 10 times to measure reliability. Practice on varied conditions: shift mats, change tables, move mission models slightly. No two competition tables are alike. (source: IntrotoFLLSUBMERGED.pdf)

## 40% Success Threshold (Bot Builders)

Week 8 cut rule: any mission below 40% success rate gets dropped from the run. Applied during "Upgrade & Iterate" week after reliability testing. Keeps run lean and predictable over chasing points from unreliable missions. (source: Bot Builders Parent Handbook 2026-08-08)

## Design Freeze

Applied at Week 13 (Oct 25). After this point: fix bugs only, no new missions, no structural changes. Prevents late-season regressions before competition. (source: Bot Builders Parent Handbook 2026-08-08)

## Programming Skill Ladder

See [[coding-and-programming]] for full detail. Levels: Basic (sensors, loops, line following) → Intermediate (MyBlocks, logic) → Advanced (PID, proportional control, gyro, menu system). Rookies target basic reliable sensor navigation.

## Engineering Notebook

Curation starts Week 1. Documents design decisions, iterations, and failures. Required for judging — judges ask "Why" and "How" about design choices. Owned by Media & Documentation role — see [[6-family-model]].

## Related pages
- [[fll-rookie-roadmap]]
- [[12-week-season-plan]]
- [[6-family-model]]
- [[equipment-inventory]]
