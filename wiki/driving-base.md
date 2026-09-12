---
title: Driving Base
layout: default
nav_order: 6
parent: Wiki
---

# Driving Base — Why the Robot Doesn't Go Where You Told It

**Summary**: For the kids. The things about the robot's body that change how it moves — wheels, weight and balance, battery — and why changing any of them means changing the program too.

**Sources**: raw/bioglow/fll-future-3-8-bioglow-rulebook.pdf (rule 5 hardware); wiki/lecp-block-catalog.md (motor blocks); team observation, Weeks 5–7

**Last updated**: 2026-09-12

---

## The big idea

The program says *"go forward 3 rotations, turn 90 degrees."*

The robot does **not** know where it is. It only knows how far its **motors** turned. Whether 3 motor rotations gets you to the young forest depends on the robot's *body* — the wheels, how heavy it is, how much battery is left.

> **Change the body, and the same program goes somewhere different.**

That is why the Week 7 plan matters so much: a **smaller driving base** is a *different body*, and every distance and turn in the program will need checking again.

### Why our robot can't just "know"

Our kit has **no gyro sensor** — rule 5 allows only color sensors, double motors, controllers and single motors, nothing else. (source: fll-future-3-8-bioglow-rulebook.pdf) So the robot cannot feel itself turning. It counts motor rotations and *trusts* that the wheels did what they were told.

That trust is exactly what the three factors below break.

---

## Factor 1 — The wheels

### What changes

| Wheel thing | What it does to movement |
|-------------|--------------------------|
| **Size** (how big around) | A bigger wheel goes **further** for one motor rotation. Same program, robot overshoots |
| **Grip** (rubber vs. plastic) | Slippery wheels **spin without moving** — the motor counts a rotation the robot never made |
| **Width** | Wide wheels resist turning; narrow ones turn easier but wobble more |
| **Distance between the two wheels** | Changes how many wheel-degrees make one **robot-degree** of turn |

### The one number to know

**One rotation of the wheel = one time around the wheel's edge.** Measure around the edge of the wheel with string — that is how far the robot moves per rotation.

Then: *distance to the young forest ÷ distance per rotation = rotations to program.*

### Why turns are the hard part

When the robot turns in place, one wheel goes forward and the other goes back. How far *the robot* turns depends on how far apart the wheels are. **Wheels further apart = more rotations to make the same turn.**

The `DoubleMotorTurn` block asks for degrees — but the robot has no way to check it actually turned that far. It guesses from wheel rotations. So a 90° turn on one base can be an 80° or 100° turn on another. **Every new base needs its turns re-tested.**

---

## Factor 2 — Weight and balance

### Weight

A heavy robot **starts slower and stops later**. The motors are strong enough to push it, but not to stop it instantly — so it slides a little past where the program said to stop.

That is not a bug in the code. That is *momentum*. The fix is either a lighter robot, slower speed near the end, or a shorter distance in the program that *accounts for* the slide.

### Balance

Where the weight sits matters as much as how much there is:

| Weight is… | What happens |
|-----------|--------------|
| **Over the driving wheels** | Best grip. Wheels push down hard on the mat and don't slip |
| **Far in front or behind** | The driving wheels get light and **spin on the spot** — robot goes less far than counted |
| **On one side** | Robot **pulls** toward the heavy side. Drives in a slow curve when it should go straight |
| **Tall and top-heavy** | Rocks on starts and stops. Tips on fast turns |

**The attachment counts as weight.** The Technician ramp bolted on the front moves the balance forward — which is why the base that drove straight *without* the ramp may curve *with* it.

**Test:** run the same "go straight 5 rotations" program with and without the ramp attached. Mark where it ends up each time. If the marks are in different places, the ramp changed the balance.

---

## Factor 3 — Battery

A full battery and a nearly-empty one drive differently.

- **Full:** motors start sharply, hit their speed fast, stop crisply
- **Low:** motors are sluggish — slower to start, weaker on turns, sometimes stopping short of the target

The controller tries to keep the *speed* you asked for even when the battery drops, so the difference is smaller than you might expect on a long straight run. **Where it shows is at the edges:** the start, the stop, and any turn where one motor is fighting the mat.

### The practical rule

**Practice on the same battery level you will compete on.** A program tuned on a full battery at 4:30 PM will drift by 7:00 PM. Charge before every session and know roughly where the charge sits during testing.

**Test:** run the same program on a fresh charge, then again after an hour of running. Mark both end points.

---

## What "changing the program" actually means

When the body changes, these numbers in the code change:

| In the program | Depends on |
|----------------|-----------|
| **Rotations** in `DoubleMotorRunForRotations` | Wheel size, wheel slip, weight |
| **Degrees** in `DoubleMotorTurn` | Distance between wheels, grip, balance |
| **Speed** in `DoubleMotorSetSpeed` | Weight — heavy needs slower stops |
| **Hold / Brake / Coast** in `DoubleMotorSetEndstate` | How much slide you can tolerate |

Block names from [[lecp-block-catalog]].

**That last one is worth trying.** `Brake` stops the motors hard; `Coast` lets them roll. `Hold` locks them in place. A heavy robot on `Coast` slides a long way; on `Hold` it stops and stays. Pick it on purpose.

---

## Two more that matter — bonus

The three above are the big ones. Two more bite in practice:

**The mat and the table.** A mat that is wrinkled, dusty, or not taped down slips. A table that is not level makes the robot drift downhill. Set the field up the same way every time — see [[calendar]] for the field setup video.

**Where you start.** The program measures from where the robot began. Start it one stud to the left, and everything after is one stud to the left. Build a **starting jig** — something the robot bumps against so it starts in exactly the same place every run.

---

## How to tune a new base — the recipe

Do this every time the base changes. Every time.

1. **Measure the wheel.** String around the edge → distance per rotation
2. **Drive straight 5 rotations.** Measure where it ended. Adjust the rotations until it lands
3. **Turn 90° four times.** It should face the way it started. If not, adjust the degrees until it does
4. **Put the attachment on.** Repeat steps 2 and 3. Different answers? That's the balance changing
5. **Write all four numbers down** in the notebook — with the date and the battery level

Step 5 is the one that scores. The Engineering Design rubric looks for *"a clear testing process, documented."* A page of end-point measurements with dates is exactly that. See [[judging-and-awards]].

---

## What to say to a judge

If a judge asks *"why did you make the base smaller?"*, the real answer is one sentence:

> *"A lighter robot stops where we tell it to, and stops the same way every time — and our rank is the average of all our matches, so the same every time is worth more than fast."*

That is [[robot-design-principles]] in a sentence, and it is true.

## Related pages
- [[robot-design-principles]]
- [[coding-and-programming]]
- [[lecp-block-catalog]]
- [[match-strategy]]
- [[bioglow-missions]]
- [[judging-and-awards]]
- [[season-journal]]
