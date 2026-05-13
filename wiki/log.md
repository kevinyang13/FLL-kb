# Wiki Log

Append-only record of all wiki operations.

---

## 2026-05-11 — Initial ingestion

**Sources**: docs/FLL_Rookie_Team_Master_Roadmap.pdf, docs/LEGO® Education.pdf

**Created**:
- `wiki/fll-rookie-roadmap.md` — master roadmap summary
- `wiki/gracious-professionalism.md` — Gracious Professionalism + Coopertition concept
- `wiki/12-week-season-plan.md` — three-phase season schedule
- `wiki/6-family-model.md` — six family roles
- `wiki/robot-design-principles.md` — design heuristics and mission strategy
- `wiki/equipment-inventory.md` — CS & AI Kit 3-5 purchase record
- `wiki/index.md` — table of contents
- `wiki/log.md` — this file

## 2026-05-11 — URLs wiki created

**Created**:
- `wiki/urls.md` — FLL resource URLs (3 links: LEGO coding env, CS Kit get-started, LEGO Education teacher hub)

## 2026-05-11 — Ingested Charter and Intro to FLL slides

**Sources**: docs/FLL_Rookie_Team_Charter_Registration_Ready.pdf, docs/IntrotoFLLSUBMERGED.pdf

**Created**:
- `wiki/team-charter.md` — 2026-2027 charter, parent roles (Tech Dads / Project Moms), team agreements
- `wiki/fll-program-overview.md` — FIRST program structure, eligibility, costs, official season timeline
- `wiki/robot-game.md` — match format, missions, scoring, common rookie challenges, testing protocol
- `wiki/innovation-project.md` — EDP for research project, expert interviews, rubric, historical themes
- `wiki/core-values.md` — 6 core values, GP scoring mechanics
- `wiki/engineering-design-process.md` — 6-step EDP, documentation requirements, robot design rubric
- `wiki/coding-and-programming.md` — SPIKE Prime vs EV3, basic/intermediate/advanced skill ladder

**Updated**:
- `wiki/gracious-professionalism.md` — added official definition, GP scoring details, kid-friendly definition
- `wiki/robot-design-principles.md` — added 10-run testing protocol, programming skill ladder reference

## 2026-05-11 — Lessons index created

**Created**:
- `wiki/lessons-index.md` — full unit/lesson/PIN mapping for both Basics (CS:B) and Connect (CS:C) courses, 60 lessons across 12 units

## 2026-05-11 — LECP schema wiki created

**Created**:
- `wiki/lecp-project-schema.md` — full schema spec derived from all 56 extracted-lecp files: top-level structure, manifest, canvas, block schema, all 40+ block types with fields/inputs, shadow types

## 2026-05-11 — LECP operations wiki created

**Created**:
- `wiki/lecp-file-operations.md` — how to extract LECP→JSON and create JSON→LECP, CLI and Python, folder conventions, minimal project template

## 2026-05-12 — All 15 SUBMERGED mission solutions wiki + single LECP

**Created**:
- `wiki/submerged-solutions.md` — all 15 mission solutions with attachment designs, program logic, calibration notes, and combo-run strategy
- `scripts/create_all_missions_lecp.py` — generates single LECP with all 15 missions, key A-O triggers each mission
- `project/proj-submerged-all-missions.json` + `.lecp` — 87KB project, 15 EventsWhenKeyPressed blocks + startup

## 2026-05-12 — M01 Coral Nursery solution wiki + LECP created

**Created**:
- `wiki/solution-m01-coral-nursery.md` — passive wedge+hook attachment design, two-phase program logic, calibration guide, failure modes, scoring strategy
- `scripts/create_m01_solution.py` — generates the LECP with calibration constants at top of file
- `project/proj-m01-coral-nursery.json` + `project/proj-m01-coral-nursery.lecp` — ready to load into LEGO coding canvas

## 2026-05-12 — SUBMERGED missions wiki created

**Sources**: komurobo.com/fll/2024-submerged (interactive scoresheet), FIRST official rulebook, fllcasts.com mission guides

**Created**:
- `wiki/submerged-missions.md` — all 15 missions with scoring conditions, point values, difficulty ratings, rookie strategy, and mission summary table

## 2026-05-12 — LECP block catalog wiki created

**Sources**: code.legoeducation.com/en-us/word (JS bundle, 4.17MB), raw/extracted/ (56 LECP lesson files)

**Created**:
- `wiki/lecp-block-catalog.md` — complete catalog of all block types: 12 categories, 100+ blocks, fields/inputs/shadow types, category icon IDs, MyBlock rules, soundShadow indexing

## 2026-05-11 — LECP schema corrections (verified against working LECP)

**Updated**:
- `wiki/lecp-project-schema.md` — corrected three field formats found wrong in original schema:
  1. `soundShadow.VALUE` is 1-based integer index into `canvas.sounds` (not a string name)
  2. `DataVariableSet`/`DataVariableChangeBy` `VARIABLE` field is `{"id": "var_id"}` object (not a plain string); `DataVariableGet` `LABEL` is the name string
  3. `MyBlock` structure: PROTOTYPE must be in `shadow` slot (not `block`); `MyBlockPrototype` needs `extraState: {args, id}`; function body lives in `MyBlockDefinition.next`; `MyBlockCall` needs matching `extraState` and input key `"{arg}_1"` with `ShadowText`
