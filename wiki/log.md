---
title: Wiki Log
layout: default
nav_order: 26
parent: Wiki
---

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

## 2026-05-12 — Kit comparison wiki created

**Sources**: education.lego.com/en-us/products/lego-education-computer-science-and-ai/45521/ and /45522/

**Created**:
- `wiki/kit-comparison-3-5-vs-6-8.md` — full comparison: hardware (single motor + controller only in 6-8), curriculum units (Events vs Functions), pricing ($429.95 vs $529.95), FLL implications

## 2026-05-12 — LECP block catalog wiki created

**Sources**: code.legoeducation.com/en-us/word (JS bundle, 4.17MB), raw/extracted/ (56 LECP lesson files)

**Created**:
- `wiki/lecp-block-catalog.md` — complete catalog of all block types: 12 categories, 100+ blocks, fields/inputs/shadow types, category icon IDs, MyBlock rules, soundShadow indexing

## 2026-08-08 — Bot Builders Parent Handbook ingested

**Sources**: Bot Builders Parent Handbook & Weekly Training Plan (image)

**Created**:
- `wiki/bot-builders-training-plan.md` — full 16-week plan, all 4 phases, week-by-week robot/innovation/parent goals, special events, 40% rule, design freeze

**Updated**:
- `wiki/team-charter.md` — added team name (Bot Builders), motto, meeting schedule
- `wiki/robot-design-principles.md` — added 40% success threshold, design freeze rule
- `wiki/index.md` — added bot-builders-training-plan entry

## 2026-08-08 — Month calendar view added

Added four month grids — August through November 2026 — to both the homepage and `wiki/calendar.md`, above the existing week-by-week table. Sunday meetings carry their week number, milestones a yellow dot, no-school days a cream fill, and the possible farm Saturdays a dashed outline.

Generated by `scripts/gen_calendar.py` from a single dictionary of dates, patched into both files between marker comments, so the month view and the week table cannot drift apart. Re-run it after any date change.

One fix during build: the milestone marker was originally an inset ring, which disappeared against the lime of a meeting day — every milestone falls on a Sunday meeting, so all five were invisible. Replaced with a corner dot that reads on any background.

## 2026-08-08 — Per-role lenses for the farm and the lagoon

Added a table to each of the two site entries showing what **Technician, Specialist, Driver and Operator** each look for there, what to ask, and what it could become. Also created a printable **Field Trip Role Sheet** in `08 Templates/`, one per student, covering both sites.

The point is that one group walk otherwise produces one blur of shared memory. Give each student their own questions and it produces four sets of notes that land in four different Project Path folders — which is what the rubric row about guided research influencing project direction actually wants.

Two things worth keeping:

- **The Specialist's angle at the farm** is the sneaky-good one. In the game the Specialist operates the grand tree and cycles resources to the canopy; a farm compost loop is the same shape in the real world — collected, transformed, sent back out.
- **Visiting both sites teaches more than either alone**, because the same role meets an opposite problem at each. Operator tools *add* at a farm and *remove* at a lagoon; Technician sensors help things grow versus detect harm; the Specialist plans one season versus decades. Added a contrast table for that.

## 2026-08-08 — Idea list ranked for 4th graders; farm booking corrected

**Correction**: the Coastal Roots Farm tour is **not booked** — still being decided. Six places across the ideas page, plus the calendar and homepage, had been asserting it was arranged. All corrected to "under consideration", and the calendar now carries a decide-whether-to-go item ahead of the pick-a-date item.

**Added a ranking**, judged on what actually works for nine- and ten-year-olds: can they see the problem themselves, can they build something real, is there something alive to care about, and does it work in an August-to-November season.

Two earlier judgements did not survive that lens:

- **Vernal pools** had been flagged as the strongest local fit. They fill with *winter* rain, so across the whole season the kids would be looking at dry depressions and taking the creatures on trust. Moved to tier 3 with the seasonality stated plainly.
- **Kelp forests** dropped to tier 4 — the problem is underwater, and an aquarium tank is a poor substitute for standing in the place.

**Tier 1**: food waste at school, canyon invasives, pollinator corridors, and the farm *if the trip happens*. The single recommendation is food waste at school — no travel, no booking, no permissions, the kids are the users and the experts are down the hall. Unglamorous, which is why it works.

Also noted seasonality as a cross-cutting factor: cafeteria bins, canyon weeds and pollinator plots do not care what month it is, while vernal pools, beach nesting and tide pools all do.

## 2026-08-08 — Two wetland sites added to the idea shortlist

Added **San Elijo Lagoon** (12) and the **Tijuana River Estuary** (13), bringing the list to thirteen. Checked both against their own sources rather than writing from memory.

**San Elijo Lagoon** — used the three research directions supplied (invasive plants, water quality, community monitoring). Two things worth noting: it sits minutes from Coastal Roots Farm, so one Saturday could cover a tended landscape and a wild one with the contrast doing much of the teaching; and the community-monitoring angle names a real user, which the Implement rubric rows ask for directly. Nature Collective, the nonprofit that has run the lagoon since 1987, offers education tours, field trips and volunteer programs.

**Tijuana River Estuary** — a National Estuarine Research Reserve, one of 30, jointly run by California State Parks and US Fish & Wildlife with NOAA support. 2,293 acres, eight threatened and endangered species, Ramsar-designated, three quarters of the watershed in Mexico. The standout for a school team is that the reserve publishes **real-time monitoring data updated every 10 minutes** — a project built on live data the kids analyse is a much stronger answer to "uses multiple relevant sources" than one built on reading. Flagged that the cross-border sewage story needs careful framing for 9-year-olds and that the habitat and bird-recovery angle is the better way in.

**Sources**: coast.noaa.gov/nerrs/reserves/tijuana-river.html, naturecollective.org

## 2026-08-08 — Coastal Roots Farm added to the idea shortlist

Added the farm as **idea 1** in `innovation-project-ideas.md` and renumbered the rest to eleven.

It earns the top slot on logistics rather than merit: every other idea needs a visit arranged and an expert found, while this one has both already booked for Aug 15 or 22. Broke it into three pickable angles visible on a single tour — smart irrigation, composting, and pest control without poison.

Also noted that smart irrigation is the closest prototype parallel on the whole list: a sensor reads a condition and a motor responds, which is exactly the Technician's tool and exactly what the CS & AI kit does. The kids could build a working version of what they saw that morning.

Differentiated the old food-waste entry, which had used the farm as its site and was now redundant. It is reframed around the team's **own school cafeteria** — same idea, different site, and users the kids know better than any adult does.

Added a sequencing note: an Aug 15 tour puts the team in the Week 3 vote having just seen a working example, which is a further argument for that date over Aug 22.

## 2026-08-08 — Weekly documentation TODO created

**Created**:
- `wiki/weekly-documentation.md` — what gets captured each session, which document it goes in, who owns it, and the rubric row it feeds
- Drive: **Weekly Documentation Checklist** in `08 Templates/` — printable, one per session

Built the list backwards from the rubric rather than from habit: every item maps to a scored row, and anything without a rubric reason was left off. Judging is a single 24-minute session with no retry, so all of it has to exist weeks earlier.

**Structure**: a six-item end-of-session list (notebook entry, photos, per-student tool logs, sources, LECP exports, who-did-what), then per-area tables for Core Values, Project and Engineering Design, then the weeks that add something — expert interview, farm tour, 40% cut, design freeze snapshot, mock judging.

**Ownership model**: students capture, adults only verify. Notebook Lead and Photographer rotate weekly so five students each do both jobs several times. Each student owns their own tool log and their own Project Path notes; the Specialist owns LECP exports; the Technician owns testing logs.

**Updated**: index, google-drive, bot-builders-training-plan, judging-and-awards, docs/index.html.

## 2026-08-08 — Costs removed from the site; order PDFs unpublished

**Kits are family-owned, not shared.** Each family bought and owns their own #45522 and brings it to sessions. Registration and tournament fees are the shared costs. Reframed equipment-inventory, kit-comparison, fll-program-overview, team-roster, and the homepage accordingly, and removed every dollar figure from the site — financial detail lives in the Drive budget sheet.

**The budget sheet needs its four kit rows deleted**, since it was built assuming kits were a shared expense. Once they are out, the per-family balances reflect genuinely shared spending.

**Security fix — order receipts were publicly served.** `docs/` is the GitHub Pages root, so six PDFs sitting there were live on the public web, including two LEGO order receipts carrying a full name, home address, email, phone number, and the last four digits of a card. Verified with a 200 response before removal. Moved all six to `raw/source-docs/` and repointed the source citations.

Note this removes them from the *website* only. The repository is public and the files remain in git history, so full removal needs either a history rewrite or making the repo private.

## 2026-08-08 — Correction: #45521 returned, inventory is 3 kits

**Source**: user statement 2026-08-08

The 3-5 kit (#45521, order 731406161) was **returned**. Team inventory is **three #45522 kits and nothing else**. This closes the long-standing open question about whether that order was cancelled or returned.

Corrected counts — still compliant, with exactly one spare of each device rather than the two the earlier figures implied:

| Hardware | Rule 5 | Have | Spare |
|---|--:|--:|--:|
| Color sensor | 2 | 3 | +1 |
| Double motor | 2 | 3 | +1 |
| Single motor | 2 | 3 | +1 |
| Controller | 2 | 3 | +1 |
| Connection cards | 4 max | 6 | +2 |

Added a note that the margin is thinner than it looks: two of each device are committed every match — one to the field models, one to the robot — so the third is the only fallback for a flat battery or dead motor. All three kits should be charged before every event.

**Budget impact**: team spend drops from $2,053.12 to **$1,589.85** (3 × $529.95). The $463.27 row for the returned kit needs deleting from the budget sheet — the connector cannot edit an existing file, so that is a manual one-row delete, after which every total recalculates.

**Updated**: equipment-inventory, bioglow-missions, kit-comparison-3-5-vs-6-8, google-drive, team-roster, docs/index.html.

## 2026-08-08 — Scoring model documented; penalty scale found

Answering how judging and matches combine.

**The model**: four equally weighted parts — Core Values, Project, Engineering Design, Robot Game. Core Values at 25% is stated outright on both rubric pages. Game rank comes only from the field (average of at least three matches); the judged rankings come only from the rubrics. The Champion's Award is the single place the two tracks combine.

**New finding — interference penalties escalate** (rulebook rule 21, not previously captured):
first penalty −10 from match score, second −20 more, third **match score is zero**. Because rank is an average, a zeroed match cannot be dropped and costs roughly a third of the game standing across a three-match event.

**Updated**: judging-and-awards (new "How It All Adds Up" section plus the penalty table), bioglow-missions (penalty escalation), core-values (25% weighting and why it cannot be crammed).

## 2026-08-08 — Drive templates created

Created four Google Docs in `08 Templates/`, each built from the actual rubric rows rather than generic headings, so filling one in produces judging evidence:

- **Engineering Notebook** — mission strategy table for our five missions, per-role tool design log with an explored-and-rejected table, testing log tied to the 40% cut, repeatable weekly entry, design freeze sign-off
- **Innovation Project Workbook** — all four Project Paths with their guiding questions, sources log, problem selection, expert interview notes with a "what we changed because of it" prompt, solution, impact and feasibility, who-did-what
- **Project Presentation script** — minute-by-minute against the Project rubric with speaker assignments
- **Engineering Design script** — same against the Engineering Design rubric, including game strategy and cooperative-with-the-other-team, both scored rows teams commonly miss

Two presentation templates rather than one, because the judging session holds two separate 5-minute presentations with different rubrics.

**Housekeeping**: a duplicate notebook template exists. Reading the first back showed escaped asterisks in table headers, so a v2 was made without bold in those cells — but v2 read back identically, showing the escaping is an artifact of the read-back serializer rather than a defect in the document. Both are fine; keep one and delete the other. The Drive connector exposes no delete or rename, so that is a manual step.

## 2026-08-08 — Coastal Roots Farm field trip added

Private team tour at Coastal Roots Farm, a Saturday in August — smart irrigation and composting, real-world "nature + tech" to spark invention ideas.

**Date not fixed.** Recommended **Sat Aug 15**: the team votes on its project problem at the Week 3 meeting the next day, so the tour feeds that decision rather than arriving after it. Aug 22 works if the trip doubles as the expert interview; Aug 29 is too late (the problem is chosen and the build has started). Aug 8 has passed.

**Two connections worth using:**
1. **It can count as the expert interview.** Farm staff working on irrigation and composting are legitimate experts for a biodiversity project, so with prepared questions this satisfies the Week 3–4 interview rather than being a separate errand. Requires kids asking their own questions, notes and photos captured, and the visit logged in the Sources Log — all rubric-scored.
2. **It feeds all four Project Paths.** Irrigation sensors → Technician, composting equipment → Operator, soil stewardship → Specialist, aerial survey → Driver. Smart irrigation is also the closest real-world parallel to the team's own hardware — a sensor reads a condition and a motor responds — and composting connects directly to M01 Mighty Microbiomes.

**Updated**: calendar (full section with date options and prep checklist), innovation-project, bot-builders-training-plan, project-paths, docs/index.html.

## 2026-08-08 — Team Drive created

Located the team folder **FLL-BIOGLOW-BOTBUILDER** by searching Drive (the URL was not supplied with the request), confirmed it was empty and owned by the team, and built out the full structure: **34 folders**, 9 top-level plus nested children.

Drive: https://drive.google.com/drive/folders/18saDG8seFVwaMr1_Mw7XZBz6KXE6iBJV

Link added to `wiki/urls.md`, `wiki/google-drive.md`, and the homepage Team Files card.

**Known issue**: one folder was created as `Roster &amp; Contacts` rather than `Roster & Contacts` — an HTML-entity slip. The Drive connector exposes no rename, so it needs a manual fix in the Drive UI. Later folders used plain characters to avoid a repeat, and `Explored and Rejected` / `QA Prep` use "and"/plain spelling for the same reason; the wiki structure diagram was updated to match what actually exists.

## 2026-08-08 — Team Drive structure proposed

**Created**:
- `wiki/google-drive.md` — proposed folder structure, naming rules, and the habits that keep judged artifacts intact

Structure is built around the four judged areas plus operations, with three things driving it: the rubric scores specific artifacts (rejected designs, sources log, testing results), the game is organized by role so tool designs and Project Path research both split four ways, and Coding Canvas saves locally rather than to the cloud so LECP files need a deliberate weekly export.

Also flagged sharing settings — the Drive will hold children's names, photos, and parent contacts, and this wiki is a public site, so restricted sharing is the safe pairing with a published link.

**Drive URL not yet recorded** — the link did not come through with the request. Page and homepage card are in place with a "link pending" marker, ready to wire in.

## 2026-08-08 — Coach background clearances confirmed

Both coach background clearances are cleared. FLL's requirement for two cleared adult coaches is now fully satisfied, not just assigned. Closed the outstanding verification item on the calendar and updated team-roster, team-charter, and the homepage.

## 2026-08-08 — Coaches named

**Source**: user statement 2026-08-08

- **Head Coach: Jason** (family 2)
- **Assistant Coach: Kevin** (family 1)

FLL requires two cleared adult coaches; that is now satisfied on paper. Flagged that both background clearances still need confirming as filed through the registration portal before the first event.

**Updated**: team-roster (coaches section plus full parent lane table), team-charter, calendar (coach line closed, remaining lanes still open), docs/index.html (coach cards in the roster section).

**Still open**: five adult lanes — robot & engineering, coding support, innovation project, logistics & snacks, notebook & photos. Five parents remain unassigned, so every lane can be covered.

; no official schedule exists

**Sources**: raw/bioglow/fll-future-3-8-path-{driver,operator,technician,specialist}.pdf

**Answer to "is there an official week-by-week?": no, not for Future Edition.** Published Future Edition materials are the rulebook, game missions, field map, role cards, Project Paths, Engineering Notebook, judging documents, and videos — no meeting guide, no session plan, no dated schedule. The other edition ships a 12-session Team Meeting Guide, but its sessions are built on SPIKE hardware and that game's missions, so the content does not transfer. Our 16-week plan is the parent handbook's own; it tracks the shape of the official 12-session arc and adds four weeks of rehearsal beyond it.

**Created**:
- `wiki/project-paths.md` — the four role-specific research briefs, their topics and vocabulary, and how they feed both tool design and the Project rubric

**Key finding**: the Project Paths are the official research scaffold, assigned **per role**, not one topic per team. The Project rubric's first section is titled "EXPLORE: How does the team research the project path?" and scores it by name — so a generic brainstorm that never touches the paths cannot score those rows. Our training plan had no Project Path step; added at Weeks 3–4.

**Updated**: bot-builders-training-plan (provenance note + path steps), innovation-project, judging-and-awards, bioglow-season, index; homepage gained the provenance note and two wiki cards.

, and awards ingested

**Sources**: raw/bioglow/fll-future-3-8-judging-flowchart.pdf, -judging-rubric.pdf, -awards-list.pdf (official LEGO Education, downloaded 2026-08-08)

**Created**:
- `wiki/judging-and-awards.md` — event day structure, the judging session flowchart with exact timings, both rubrics row by row, and all 10 awards

**Key findings**:
1. **One combined 24-minute judging session**, not separate sessions: welcome 2 · project presentation 5 · project Q&A 3 · engineering design presentation 5 · design Q&A 3 · Core Values Q&A 3 · feedback 3. Judges then deliberate 10 min before the next team.
2. **Two distinct 5-minute presentations** minutes apart, with different rubrics. Setup happens during the 2-minute welcome.
3. **The order of judging vs matches is set by the local organizer** — no official document specifies the day's running order. Comes in the event packet.
4. Rubric levels are Beginning 1 / Developing 2 / **Achieves** 3 / Exceeds 4 (Exceeds requires a written comment). Earlier wiki said "Accomplished" — corrected.
5. Core Values has **no rubric of its own**: designated rows in both rubrics count dually, and it is 25% of the Champion's score.
6. Engineering Design presentation must cover design work **and game strategy**; one scored row is explicitly about cooperative strategy **with the other team**.
7. **Game Performance Award goes to the highest average**, and the **Coopertition Award goes to two teams** with the highest combined score — same logic as M05.

**Updated**: engineering-design-process, innovation-project, core-values, calendar, bot-builders-training-plan, index; homepage gained an Event Day section with both sequences.

 filled in

**Source**: user statement 2026-08-08

**Roster** — 4 families, 5 students:

| Family | Students | Parents | Kit |
|--------|----------|---------|-----|
| 1 | Kyle, Lindsey | Kevin & Ivy | #45522 |
| 2 | Cheryl | Jason & Meiling | #45522 |
| 3 | Lola | Chris & Rumi | — |
| 4 | Kei | Hiroshi | #45522 |

**Hardware gap CLOSED.** Three #45522 kits plus the earlier #45521 give 4 color sensors, 4 double motors, 3 single motors, 3 controllers, 7 connection cards — against a rule-5 requirement of 2 of each. Met with a spare of every device. The earlier shortfall note assumed a single kit.

Note 2-of-each is a maximum, not a minimum — spares are for parallel practice stations and tournament-day failures, not extra hardware on the field.

**Updated**:
- `wiki/team-roster.md` — families, students, parents; noted that 5 students across 4 roles forces real cross-training, since rank is the average of at least three matches
- `wiki/equipment-inventory.md` — kit tally, rule-5 comparison, and a match-day allocation table for which device goes to the field vs the robot
- `wiki/kit-comparison-3-5-vs-6-8.md`, `wiki/bioglow-missions.md`, `wiki/robot-design-principles.md`, `wiki/calendar.md` — shortfall language replaced with the resolved position
- `docs/index.html` — hardware section now a READY panel with device counts; roster section shows the four families and the four role cards

**Still open**: role assignments (target Week 5, Aug 30), adult lane assignments, and who brings the laptop/tablet.

## 2026-08-08 — Cleanup: Future Edition only; calendar, roster, links

**Removed** (8 pages — recoverable in git history):
- `submerged-missions`, `submerged-solutions`, `solution-m01-coral-nursery` — 2024-25 season
- `bioglow-founders-missions` — other edition, not our game
- `robot-game` — described the classic MINDSTORMS/SPIKE game with 3 rounds and top-score-counts; wrong on every point for Future Edition
- `fll-rookie-roadmap`, `12-week-season-plan`, `6-family-model` — superseded by bot-builders-training-plan and calendar

Also deleted the Founders Edition PDFs from `raw/bioglow/`.

**Created**:
- `wiki/calendar.md` — standing schedule, all 16 meetings, milestones, pre-freeze deadlines, days off
- `wiki/team-roster.md` — four match roles with primary/backup slots, student and adult tables, agreements. **Names still TBD.**

**Rewritten for this season**:
- `coding-and-programming` — was SPIKE Prime vs EV3; now Coding Canvas, our hardware blocks, and how coding splits across the four roles
- `fll-program-overview` — was 2024-25 costs and theme history; now Future Edition structure and match format
- `urls` → links hub, grouped by task; added mission and field-setup videos, registration portal
- `core-values`, `gracious-professionalism` — re-sourced to the BIOGLOW rulebook; both now note that Coopertition literally scores points in our game (M05, M01)
- `robot-design-principles` — added the season's hard constraints (203 mm, hardware limits, no passing) and tied the 40% rule to average-not-best ranking
- `innovation-project` — biodiversity brief and our actual schedule
- `engineering-design-process`, `team-charter`, `index` — stale references cleared

**Homepage** restructured around what was asked for: hardware action item, calendar (summary cards + full 16-week table), roster with the four roles, and a grouped links grid.

**Site**: 22 pages, 297 internal links, zero broken, zero dangling.

## 2026-08-08 — BIOGLOW missions ingested; hardware requirement discovered

**Sources**: raw/bioglow/fll-future-3-8-bioglow-game-missions.pdf, raw/bioglow/fll-future-3-8-bioglow-rulebook.pdf, raw/bioglow/fll-challenge-bioglow-rgr.pdf, fll-challenge-bioglow-season-overview.pdf (all official, downloaded 2026-08-08)

**Created**:
- `wiki/bioglow-missions.md` — our game: 5 Future Edition missions + optional Level Up Challenge, exact scoring, rule-5 hardware table, four role definitions, setup/penalty rules
- `wiki/bioglow-founders-missions.md` — the other edition's 15-mission game, reference only
- `scripts/build_site.py` — renders wiki/*.md into docs/wiki/*.html so Pages can serve them

**Key findings**:
1. **Future and Founders Edition are different games.** Founders: 15 missions, one robot, 13 models. Future (ours): 5 missions, shared alliance field, four simultaneous player roles. Most BIOGLOW material online is Founders and does not apply.
2. **Rule 5 requires 2× color sensor, 2× double motor, 2× controller, 2× single motor.** Specified by type and quantity, never by kit SKU.
3. **Division-legality question resolved and inverted** — the 6-8 kit's single motor and controller are not merely permitted, they are required; #45521 alone cannot field a legal team.
4. **Hardware shortfall** — both kits together give 1 single motor and 1 controller against a requirement of 2. Action before the Oct 25 design freeze.
5. Rank is set by **average** score across at least three matches, not best — consistency outweighs peak.
6. Earlier role descriptions in bioglow-season.md were guesses and were **wrong**; replaced with rulebook definitions.

**Updated**:
- `wiki/bioglow-season.md` — real role table, missions section, corrected legality note
- `wiki/equipment-inventory.md` — hardware gap table, legality resolved
- `wiki/kit-comparison-3-5-vs-6-8.md` — legality section rewritten
- `docs/index.html` — kit callout replaced with the hardware action item; mission cards added
- `wiki/index.md` — new pages and source rows

**Still open**: whether the team holds both kits or only #45522 (changes the size of the gap).

## 2026-08-08 — BIOGLOW season ingest + kit correction + site retheme

**Sources**: education.lego.com/en-us/first-lego-league/season-materials/, docs/LEGO® Education Order.pdf (order 731406368), user statement

**Created**:
- `wiki/bioglow-season.md` — 2026-2027 season: biodiversity theme, Future vs Founders editions, four team roles, game models, published materials, our Grades 3-5 registration

**Updated**:
- `wiki/equipment-inventory.md` — recorded the second order (45522, $529.95, 2026-05-15) alongside the first (45521, $463.27, 2026-05-12); team competes with the 6-8 kit
- `wiki/kit-comparison-3-5-vs-6-8.md` — corrected "we own the 3-5 kit" to 6-8; added what the single motor unlocks and the open division-legality question
- `wiki/team-charter.md` — added registered division and hardware
- `wiki/submerged-missions.md`, `wiki/submerged-solutions.md`, `wiki/solution-m01-coral-nursery.md` — archive banners; SUBMERGED is 2024-25, not the current challenge
- `docs/index.html` — retheme to BIOGLOW brand identity; kit-status callout; auto-computed current week
- `wiki/index.md` — new page, archive markers, source rows

**Open questions**:
1. Two kit orders three days apart — was 45521 cancelled/returned, or does the team hold both?
2. Does the Grades 3-5 division permit the 6-8 kit's single motor and controller? Resolve before the Oct 25 design freeze.
3. BIOGLOW mission names and point values are still uncaptured — need the Game Missions PDF.

## 2026-05-11 — LECP schema corrections (verified against working LECP)

**Updated**:
- `wiki/lecp-project-schema.md` — corrected three field formats found wrong in original schema:
  1. `soundShadow.VALUE` is 1-based integer index into `canvas.sounds` (not a string name)
  2. `DataVariableSet`/`DataVariableChangeBy` `VARIABLE` field is `{"id": "var_id"}` object (not a plain string); `DataVariableGet` `LABEL` is the name string
  3. `MyBlock` structure: PROTOTYPE must be in `shadow` slot (not `block`); `MyBlockPrototype` needs `extraState: {args, id}`; function body lives in `MyBlockDefinition.next`; `MyBlockCall` needs matching `extraState` and input key `"{arg}_1"` with `ShadowText`
