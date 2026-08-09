---
title: Kit Comparison 3-5 vs 6-8
layout: default
nav_order: 19
parent: Wiki
---

# CS & AI Kit Comparison: Grades 3-5 vs Grades 6-8

**Summary**: Side-by-side comparison of the two LEGO Education Computer Science & AI single kits — SKU 45521 (grades 3-5) and SKU 45522 (grades 6-8). The team owns the 6-8 kit while competing in the Grades 3-5 division.

**Sources**: education.lego.com/en-us/products/lego-education-computer-science-and-ai/45521/, education.lego.com/en-us/products/lego-education-computer-science-and-ai/45522/

**Last updated**: 2026-08-08

---

## Quick Summary

| | **CS & AI Kit 3-5** | **CS & AI Kit 6-8** |
|---|---|---|
| SKU | 45521 | 45522 |
| Grades | 3–5 | 6–8 |
| Single kit price | $429.95 | $529.95 |
| Classroom bundle price | $2,799.00 (24 students) | $3,499.00 (24 students) |
| LEGO pieces | 321 | 379 |
| Double motor | ✓ | ✓ |
| Single motor | ✗ | ✓ |
| Color sensor | ✓ | ✓ |
| Controller | ✗ | ✓ |
| Connection cards | 1 | 2 |
| Lessons | 30 (6 units × 4 lessons + 1 challenge) | 30 (6 units × 4 lessons + 1 challenge) |

**Bottom line**: 6-8 kit adds single motor + controller, costs $100 more, includes 58 more pieces. Curriculum units differ in two slots (Events → Functions, adding modular programming).

---

## Hardware Contents

### Single Kit — What's in the Box

| Component | 3-5 (45521) | 6-8 (45522) |
|-----------|:-----------:|:-----------:|
| LEGO bricks | 321 | 379 |
| Double motor (hub + dual drive) | ✓ | ✓ |
| Single motor (arm/attachment) | ✗ | ✓ |
| Color sensor | ✓ | ✓ |
| Controller (remote lever) | ✗ | ✓ |
| Connection cards | 1 | 2 |
| USB charging cable | ✓ | ✓ |
| Building instructions | ✓ | ✓ |
| Sturdy stackable box | ✓ | ✓ |

### Classroom Bundle Additions (24 students = 6 kits)

| | 3-5 (45521) | 6-8 (45522) |
|---|---|---|
| Multi-chargers included | 2 | 3 |
| Replacement brick pack | ✓ | ✓ |

---

## Curriculum Units

Both kits: 6 units, 4 lessons + 1 design challenge per unit = 30 total lessons.

| Unit # | 3-5 (45521) | 6-8 (45522) |
|--------|------------|------------|
| 1 | Basics | Basics |
| 2 | **Events** | **Loops** |
| 3 | Loops | Conditionals |
| 4 | Conditionals | Variables |
| 5 | Variables | **Functions** |
| 6 | AI & Data | AI & Data |

**Key differences**:
- 3-5 has dedicated **Events** unit (event-driven triggers, keyboard/sensor events)
- 6-8 replaces Events with **Functions** unit (modular design, reusable procedures — matches [[coding-and-programming]] skill ladder advanced topics)
- 6-8 moves Loops up to unit 2; Events concepts folded into Basics or Conditionals units
- Both end with AI & Data unit (classification, machine learning concepts)

---

## What Each Extra Hardware Piece Unlocks (6-8 Only)

### Single Motor
- Powers a second independent axis (arm, claw, attachment)
- Enables mission-style tasks requiring arm + drivetrain simultaneously
- Critical for FLL robot game — most missions need an arm motor
- Block types: `MotorRunForRotations`, `MotorStartDirection`, `MotorStop`, `MotorSetSpeed` (see [[lecp-block-catalog]])

### Controller (Remote Lever)
- Physical two-lever remote control
- Enables manual/teleoperation lessons
- Block types: `ControllerWhenLever`, `ControllerIsLever`, `ControllerPosition`
- Functions unit uses controller to teach input → function → output design pattern

---

## Pricing Breakdown

| | 3-5 (45521) | 6-8 (45522) | Difference |
|---|---|---|---|
| Single kit | $429.95 | $529.95 | +$100 |
| Cost per student (single kit, 4 students) | $107.49 | $132.49 | +$25/student |
| Classroom bundle (24 students) | $2,799.00 | $3,499.00 | +$700 |
| Cost per student (bundle) | $116.63 | $145.79 | +$29/student |

---

## Software Platform (Same for Both)

- **Coding Canvas**: web app + iOS app, block-based (icon and word modes)
- PIN-based lesson access — no student logins or accounts
- Projects saved locally, no cloud data collection
- AI features use on-device computer vision, no image storage
- One device per group of 4 students

For FLL teams: LEGO coding canvas uses the Word mode (type `word` in the LECP manifest). See [[lecp-project-schema]] and [[lecp-block-catalog]] for full technical details.

---

## Which Kit for FLL?

**We own the 6-8 kit (45522)** and are registered in the **BIOGLOW Future Edition Grades 3-5 division** — one band below the kit. (source: user statement 2026-08-08; see [[equipment-inventory]] and [[bioglow-season]])

| FLL Need | 3-5 Kit | 6-8 Kit (ours) |
|----------|---------|----------------|
| Drivetrain (forward/back/turn) | ✓ | ✓ |
| Arm/attachment motor | ✗ (no single motor) | ✓ |
| Color sensor (line following, stop at mat) | ✓ | ✓ |
| Controller for remote driving practice | ✗ | ✓ |

### What this buys us

The single motor is the decisive difference. Without it, a robot drives *or* actuates, never both — missions needing a lift, hook, or release have to be solved with passive attachments pushed by the drivetrain alone. The 6-8 kit removes that constraint, so powered-attachment designs are on the table from Week 4 onward in [[bot-builders-training-plan]].

The controller additionally enables manual driving practice, useful for early driver training before autonomous programs are reliable.

### Division legality — resolved, and it inverts the question

Earlier this page flagged an open question: does the Grades 3-5 division *permit* the 6-8 kit's single motor and controller? The Future Edition rulebook answers it — and reverses the framing.

Rule 5 specifies equipment by **type and quantity**, never by kit SKU, and requires **2× color sensor, 2× double motor, 2× controller, 2× single motor**. (source: fll-future-3-8-bioglow-rulebook.pdf)

So the 6-8 kit's extra hardware is not a liability to justify — it is **mandatory**. A team equipped only with #45521 cannot field a legal match setup at all, since that kit contains zero single motors and zero controllers.

The live problem is the opposite of the one first suspected: even both kits together supply just 1 single motor and 1 controller against a requirement of 2. See [[equipment-inventory]] for the gap table and [[bioglow-missions]] for the full hardware rule.

---

## Shared Features (Both Kits)

- 80+ educators contributed to development
- 850+ students tested in instruction
- 30+ classrooms participated in testing
- Standards-aligned curriculum
- Screen-free lessons available
- Differentiation support for novice and advanced learners
- Python package available for advanced exploration
- Free Teacher Portal with presentations, facilitation notes, rubrics, timing guidance
- "I can" statements + evaluation rubrics per lesson

---

## Related Pages
- [[equipment-inventory]]
- [[coding-and-programming]]
- [[lecp-block-catalog]]
- [[lecp-project-schema]]
- [[robot-design-principles]]
- [[bioglow-missions]]
- [[bioglow-season]]
- [[bot-builders-training-plan]]
