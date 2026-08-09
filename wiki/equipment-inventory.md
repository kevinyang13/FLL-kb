---
title: Equipment Inventory
layout: default
nav_order: 20
parent: Wiki
---

# Equipment Inventory

**Summary**: Hardware and kits purchased for the FLL team. Two CS & AI kit orders were placed three days apart — the team competes with the Grades 6-8 kit (#45522).

**Sources**: docs/LEGO Education Order no. 731406161.PDF, docs/LEGO® Education Order.pdf, user statement 2026-08-08

**Last updated**: 2026-08-08

---

## Purchased Equipment

| Order | Date | Item | SKU | Price |
|-------|------|------|-----|-------|
| 731406161 | 2026-05-12 | Computer Science & AI Kit 3-5 | 45521 | $429.95 + $33.32 tax = **$463.27** |
| 731406368 | 2026-05-15 | Computer Science & AI Kit 6-8 | 45522 | **$529.95** |

Both orders billed to Kevin Yang, San Diego CA, via the LEGO Education web shop. (source: LEGO Education Order no. 731406161.PDF, LEGO® Education Order.pdf)

## Kit in Use

The team competes with the **Grades 6-8 kit (#45522)**. (source: user statement 2026-08-08)

This is one grade band above the team's registered division — see [[bioglow-season]] for the division registration and [[kit-comparison-3-5-vs-6-8]] for what the 6-8 kit adds.

## What the 6-8 Kit Adds

Relative to the 3-5 kit, #45522 is a strict hardware superset:

| Component | 45521 (3-5) | 45522 (6-8) |
|-----------|:-----------:|:-----------:|
| LEGO pieces | 321 | 379 |
| Double motor | ✓ | ✓ |
| **Single motor** | ✗ | **✓** |
| Color sensor | ✓ | ✓ |
| **Controller (remote lever)** | ✗ | **✓** |
| Connection cards | 1 | 2 |

The single motor is the meaningful gain — it powers an arm or attachment independently of the drivetrain, which the 3-5 kit cannot do. See [[robot-design-principles]].

## Hardware Gap — action needed

The Future Edition rulebook specifies equipment by **type and quantity**, not by kit SKU. Rule 5 requires exactly:

| Hardware | Required | 45521 has | 45522 has | Both kits | Gap |
|----------|---------:|----------:|----------:|----------:|----:|
| Color sensor | 2 | 1 | 1 | 2 | ✓ |
| Double motor | 2 | 1 | 1 | 2 | ✓ |
| **Single motor** | 2 | 0 | 1 | **1** | **−1** |
| **Controller** | 2 | 0 | 1 | **1** | **−1** |

(source: fll-future-3-8-bioglow-rulebook.pdf rule 5)

Even holding **both** kits, the team is one single motor and one controller short of a legal match setup. Two #45522 kits would satisfy the rule exactly.

Compounding this: before each match the team surrenders 1 double motor, 1 color sensor, and 1 single motor to operate the field models, and **that hardware counts toward the same total** — so only one of each remains for the robot itself.

**Action**: source one additional single motor and one additional controller (or a second #45522) before the Week 13 design freeze in [[bot-builders-training-plan]]. Full detail in [[bioglow-missions]].

## Resolved

- **Division legality** — previously flagged as an open question. **Resolved**: Future Edition mandates two single motors and two controllers, so the 6-8 kit's extra hardware is not merely permitted, it is required. The 3-5 kit alone cannot field a legal team. (source: fll-future-3-8-bioglow-rulebook.pdf rule 5)

## Needs Verification

1. **Two orders, one team** — order 731406161 (45521) was placed May 12 and order 731406368 (45522) May 15. Unclear whether the first was cancelled, returned, or whether the team holds both. This now matters directly: if both kits are in hand the gap is one motor and one controller; if only the 45522 is in hand the gap is doubled. Confirm with the coach and update this page.

## Related pages
- [[kit-comparison-3-5-vs-6-8]]
- [[bioglow-season]]
- [[robot-design-principles]]
- [[bot-builders-training-plan]]
- [[coding-and-programming]]
- [[bioglow-missions]]
