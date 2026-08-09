---
title: Coding & Programming
layout: default
nav_order: 9
parent: Wiki
---

# Coding and Programming

**Summary**: The Coding Canvas platform, the hardware blocks available on our kit, and how programming is split across the four match roles.

**Sources**: raw/bioglow/fll-future-3-8-bioglow-rulebook.pdf, education.lego.com CS & AI product pages

**Last updated**: 2026-08-08

---

## Platform

Future Edition runs on **LEGO Education Computer Science & AI** hardware programmed through the **Coding Canvas** — a browser and iOS block-based environment at [code.legoeducation.com](https://code.legoeducation.com).

- Block-based, in icon mode or word mode
- PIN-based lesson access — no student accounts or logins
- Projects save locally; no cloud collection
- AI features run on-device; no image storage
- One device per group of four students

Project files are `.lecp` archives. Format and tooling: [[lecp-file-operations]], [[lecp-project-schema]], [[lecp-block-catalog]].

## Our Hardware

| Device | Blocks |
|--------|--------|
| Double motor | `MotorRunForRotations`, `MotorStartDirection`, `MotorStop`, `MotorSetSpeed` |
| Single motor | same motor family, independent axis |
| Color sensor | color detection, reflection, triggers |
| Controller | `ControllerWhenLever`, `ControllerIsLever`, `ControllerPosition` |

Full catalog: [[lecp-block-catalog]]. Kit contents: [[kit-comparison-3-5-vs-6-8]].

## Coding Splits Across Roles

Each role programs a different thing, which makes coding a shared job rather than one child's:

| Role | What gets programmed |
|------|---------------------|
| **Driver** | Driving base — controller-driven or autonomous |
| **Operator** | Nothing electronic; purely mechanical tool |
| **Technician** | Robotic tool — direct motor input, color-sensor trigger, or autonomous |
| **Specialist** | Grand tree motor, **plus can run other players' tools** from the laptop |

The Specialist's laptop is the only place team programs run during a match, so that role carries the heaviest coding load. Pair it with a strong programmer and a good backup. See [[team-roster]].

Rule 7 allows **up to one laptop or tablet** at the field. No charging cords, power banks, or mice.

## Skill Ladder

| Level | Concepts |
|-------|---------|
| **Basic** | Motor run/stop, timing, color-sensor triggers, simple loops |
| **Intermediate** | Conditionals, variables, reusable MyBlocks, event-driven triggers |
| **Advanced** | Proportional control, sensor-driven correction, coordinated multi-device programs |

Start at Basic and target reliable, repeatable sensor-triggered actions before anything clever.

## Judging

All team members must demonstrate coding and building skills for Robot Design judging — not just one specialist. Rubric detail: [[engineering-design-process]].

## Related pages
- [[bioglow-missions]]
- [[team-roster]]
- [[lecp-file-operations]]
- [[lecp-block-catalog]]
- [[kit-comparison-3-5-vs-6-8]]
- [[lessons-index]]
