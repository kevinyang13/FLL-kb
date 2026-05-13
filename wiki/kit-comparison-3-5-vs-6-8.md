# CS & AI Kit Comparison: Grades 3-5 vs Grades 6-8

**Summary**: Side-by-side comparison of the two LEGO Education Computer Science & AI single kits — SKU 45521 (grades 3-5) and SKU 45522 (grades 6-8). Documents hardware differences, curriculum differences, and pricing.

**Sources**: education.lego.com/en-us/products/lego-education-computer-science-and-ai/45521/, education.lego.com/en-us/products/lego-education-computer-science-and-ai/45522/

**Last updated**: 2026-05-12

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

**We own the 3-5 kit (45521)**. Key limitation for FLL robot game:

| FLL Need | 3-5 Kit | 6-8 Kit |
|----------|---------|---------|
| Drivetrain (forward/back/turn) | ✓ | ✓ |
| Arm/attachment motor | ✗ (no single motor) | ✓ |
| Color sensor (line following, stop at mat) | ✓ | ✓ |
| Controller for remote driving practice | ✗ | ✓ |

The missing single motor is the critical gap — most SUBMERGED missions in [[submerged-solutions]] require an arm motor for lifting, hooking, or releasing mechanisms. The 3-5 kit can still compete using passive (unpowered) attachments pushed by the drivetrain only, which is the approach used in [[solution-m01-coral-nursery]].

**Option**: Purchase standalone SPIKE Prime Motor (45303) or upgrade to 6-8 kit for FLL seasons where powered attachments are needed.

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
- [[submerged-solutions]]
