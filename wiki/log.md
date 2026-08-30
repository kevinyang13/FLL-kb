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

## 2026-08-14 — This Week card moved into the Calendar group

Moved the This Week card out of the links grid and made it the lead card of the Calendar section, where temporal information belongs. It now spans the width with team goals on the left and parent actions on the right, and its header shows the live week number.

**Two silent CSS failures found while checking the render**, both from string replaces that matched nothing:

1. The goal-list styles never landed, because the replace targeted unspaced CSS while the file uses spaced declarations. The result was a list showing both a native "1." and the inherited ✦ bullet. Fixed by appending before the closing style tag instead of matching an existing rule.
2. Verified the rest of the batch afterwards — `nowcard` and `tw-cols` had landed, three others had not.

Worth remembering: a replace that does not match fails silently, so any CSS added by string substitution needs checking in the render rather than assumed.

## 2026-08-30 — Match strategy brainstorm

**Created**: `wiki/match-strategy.md` — mission sequencing, five candidate match plans

Started from a question about which mission to run first, and it turned on a scoring reading worth recording. The missions PDF writes caps as `(maximum N): X points each`, and **N is a count of objects, not a point ceiling** — proven elsewhere in the same document, where *"(maximum 3 in each): 20 points each"* is plainly three keystone species per microbiome. So **M03's `(maximum 50)` is 50 cycles = 250 points**, the largest pool on the field, not 50 points. That reading decides the whole strategy.

**M04 goes first, and it is not a judgement call.** It opens the nest and hollow tree, and those tokens feed every other mission. All-or-nothing scoring means there is no reason to do it halfway.

**The real tension is park-or-cycle.** M01 and M03 compete for the same keystone species tokens on different terms — parking pays 20 once and kills the token, cycling pays 5 and returns it. Break-even is four cycles, so: cycle early, park late. The crossover is a stopwatch question, not an opinion.

**Five sequences**: Waterfall Engine (highest ceiling, needs a fast loop), Anchor First (highest floor, right for a rookie team), Split the Field (best use of four simultaneous roles), Coopertition Max (M05 pays both teams — a floor-raiser layered on any plan), Level Up Gambit (up to 100 points for handicapping yourself; the real cost is obstruction, not points).

Recorded five **unmeasured** numbers the page marks `[verify]` — most importantly whether tokens actually return to play after cycling, and how long one cycle takes. Sequence 1 collapses if they do not return. Flagged rather than assumed, since neither is stated in the missions PDF and the field is built and countable.

Filed as a brainstorm, not a decision, with a banner saying so.

## 2026-08-16 — NorCal opens a door for SoCal Future Edition teams

**Source**: Cecilia Guerra Rios, NorCal FIRST LEGO League / Playing At Learning, replying to Meiling and Jason

> *"Yes, Southern California Future Edition teams will be able to participate in NorCal Future Edition events, as long as we have enough capacity and the event is able to move forward."*

The first real possibility of a competitive Future Edition event for this team. Recorded with its three conditions rather than as a win, because none of them is settled: NorCal needs enough Future registrations in their own region to hold a qualifier at all, NorCal teams get priority with SoCal teams admitted only if space allows, and the process and timeline are still being written.

Also noted two things worth being straight about. **The travel** — NorCal is the Bay Area or Sacramento, so this is a trip rather than a Saturday, and that lands differently on different households. And **the threshold** — our registering in SoCal probably does not count toward NorCal's number, so we cannot will the event into existence; we can stay registered, stay ready and watch.

**Updated the regional support table.** Northern California moves from unverified to confirmed — but by direct reply, not publication. That distinction matters: the earlier caution was correct, since NorCal has still published nothing. The lead was good; the word *"published"* was the part that could not be supported. Texas remains unverified.

Reframed Option 2 in `where-we-stand.md` as the strongest-looking path, since it now has a possible competitive event attached rather than only a recreational one.

Added four follow-up questions: whether a NorCal qualifier carries advancement, when registration numbers will be known, whether we can help it reach viability, and roughly where and when it would be held.

## 2026-08-16 — Season paused; status page for team members

Meetings are paused from 23 August while the coaches decide the path forward. Created **`wiki/where-we-stand.md`** as the page for all team members and families — what happened in order, what it means, and what is being decided.

Wrote it to do three things beyond stating facts:

1. **Say plainly that this is not the team's or the kids' fault.** Registration was open and unqualified; everyone followed the instructions.
2. **List what is *not* lost**, because it is easy to feel the season evaporated — the kits (required for LEGO League from 2028-29), everything built, what the kids learned, the farm visit, the team itself. And especially that **the Innovation Project is entirely unaffected** and can still be finished and presented to a real audience.
3. **Note this is a pilot-year pattern rather than a local failure** — VA-DC also runs Future without advancement, and no Future team appears to be advancing anywhere.

Recorded the three options factually with what each gains, costs and carries over. Checked option 3 rather than leaving it vague: the **VEX IQ 2026-27 season window runs 1 Aug 2026 – 28 Feb 2027**, SoCal has active leagues including LAUSD, and robotevents.com lists events by region — so entering now is possible.

Added the outstanding questions and who can answer each, and suggested wording for what to tell the kids, including that they did everything right and that the farm problems are still theirs to solve.

**Updated**: homepage alert to PAUSED, Week 4 goals and parent actions, the generated week table, calendar banner, season journal, index.

## 2026-08-16 — Region answered: Founders only, no Future advancement

**Source**: Paul Kass, SoCal organiser, via Jason

> *"As of now, all of our events will follow the Founder's Edition as well as advancement. If there is enough interest, we will look at hosting an off-season Future event for teams that chose that option."*

So there is no official Future Edition tournament and no advancement path in Southern California this season, with a possible standalone off-season event if enough teams want one.

**Checked whether this is unusual before writing it up, and it is not.** VA-DC is running Future Edition as a **spring 2027 pilot**, explicitly *"as stand-alone experiences without advancement to additional levels of competition"*. Future Edition's first season under the FIRST banner is also its last, since the programme becomes LEGO League in 2027-28. The pattern across regions is pilot-without-advancement, so **no Future Edition team appears to be advancing anywhere this season** — our team is not behind others, which is a materially different situation from a local failure.

Recorded that switching to Founders is not realistic: it runs on SPIKE we do not own, it is a completely different game, and there are about 13 weeks left with the whole field and three tools already built for Future.

Wrote up what remains: the off-season event as the realistic target, the full season regardless, and the long game where CS & AI is *required* for LEGO League from 2028-29. Stated plainly that **the Innovation Project loses nothing** — the farm work, the Bermuda grass and rabbit problems and the prototype are edition-independent, and that half of the season is the one most at risk of being abandoned in disappointment.

Added five follow-up questions for Paul, including whether the team can help create the interest he mentioned — a rookie team helping bring an event into existence for other teams is a stronger Gracious Professionalism story than most teams will have.

## 2026-08-16 — Week table generated from one source

The homepage week-by-week table and the calendar page's All Meetings table were maintained by hand and had already drifted: the site still carried the original generic plan for Weeks 2–4 while the calendar had the real progress.

Extended `scripts/gen_calendar.py` with a `WEEKS` dictionary and two renderers, so both tables are now generated from the same data between marker comments — the same treatment the month grids already had. Edit the dictionary, re-run, and both update together. They cannot diverge again.

The data carries `done` for completed weeks and `flag` for milestone cells, so the site gets ticks, dimmed rows and highlighted milestones while the wiki gets ✅ marks and bold — each rendering suited to its medium from one source.

Site table now shows Weeks 2 and 3 ticked with their real outcomes, Week 4 highlighted as current with its owners, and the five milestones flagged.

## 2026-08-16 — Site advanced to Week 4; current week made data-driven

The site was computing the current week purely from the clock, which had two problems. On a meeting day it advanced at midnight rather than when the meeting actually ended, and more importantly it could disagree with what the coach had already reported.

Two changes:

1. **The week now rolls when the Sunday meeting ends** (19:30), not at midnight, so a Sunday evening already belongs to the week ahead. That matches how the team talks about it — on Friday they said "we are in week 3" with the meeting still to come.
2. **Added `COMPLETED_THROUGH`**, the last week reported finished. The site shows whichever is further along, the calendar or reported reality, so it can never lag behind what has actually happened. Bump it when a week's results go into the journal.

Set to 3, so the site now shows **Week 4** — goals with owners, the Aug 17–23 band highlighted on the August grid, and the Week 4 row marked in the schedule table.

Also refreshed what had gone stale: parent actions for Week 4 no longer reference arranging the expert interview, since the farm visit covered it; the field-trip card shows Coastal Roots as done with the two problems it produced; and the optional 20 September tour is now the next dated item.

## 2026-08-16 — Correction: the Week 3 runs were familiarisation, not practice matches

**Coach correction.** The five 2:30 run-throughs in Week 3 were the kids' **first time seeing the game as a game** — learning how long 2:30 feels, what each role does while it is running, how the four areas relate. They were not scored practice matches and they are not the Week 9 milestone.

I had read them as performance runs and built a claim on top of it — *"roughly six weeks ahead of plan"*, with a table showing the Week 9 first-timed-run milestone as complete. That was wrong and is removed everywhere rather than softened: the journal headline, the calendar note, the training-plan banner and the homepage panel.

Replaced with an honest status: **the build is ahead, the playing has not started.** Field, motors and three of four role tools are done and every student has sat in every seat. Still missing: a mission strategy, the Specialist tool and role, and any reliability data. Having tools built early is the easy half; the season is decided by whether they work the same way ten times running.

Also dropped the item urging the team to reconstruct "the five practice match scores" — there were no scores to record. Replaced with something that does exist and is worth keeping: what each student noticed from each seat.

Reordered what comes next so it does not read as spending a surplus: choose a mission strategy first, then build the Specialist tool, then start counting ten-run reliability, then keep the Innovation Project moving.

## 2026-08-16 — Split the record: wiki journal vs kids' notebook

Coach direction: **the Drive and the Engineering Notebook are the kids' to fill in; the wiki and site keep a high-level journal.** Adopted, and did not create a notebook document.

Renamed `progress-log.md` to **`season-journal.md`** and retitled it *Season Journal*, since that is what it actually is. All inbound links updated.

Stated the boundary explicitly on the journal, on `google-drive.md`, on `weekly-documentation.md`, and on the notebook adult lane in `team-roster.md`:

| | Written by | Contains |
|---|---|---|
| Drive and notebook | **The kids** | Their own entries, tool logs, testing tallies, photos, sources. Judges read this. |
| Wiki and site | Coaches | The high-level season story, reference material, rules, plans |

Reframed the journal's open-items table as *"what the team needs to capture"*, with a column for where each item goes in the Drive, so the wiki points at the notebook rather than substituting for it.

**Found real content while checking**: `01 Engineering Notebook/Weekly Entries/` holds one completed Week 2 checklist — Notebook Lead Kyle, photographer Mieling — recording who built which model, and a Core Values note: *"Kei and Kyle helped each other, being patient when building the hive. Same for Cheryl & Lola, Lindsey & Kei."* Lifted both into the journal, since who-built-what and an on-the-day GP moment are exactly what a season record should hold.

`Current/` is still empty and Week 3 has no entry, which is the biggest week so far. Recorded as the team's item, not the wiki's.

## 2026-08-16 — Week 4 goals recorded, with owners

**Source**: coach report

First week with named owners: Driver improvements (Kyle · Lindsey), Technician rebuild from launcher to ramp (Kei), Operator accuracy tools for the grand tree (Cheryl · Lola), plus team communication and rulebook study for everyone.

**Four things flagged alongside them:**

1. **Photograph the launcher before it is dismantled.** Goal 2 replaces a launching mechanism with a ramp, which means a tool the team built, tested and rejected is about to be destroyed. That is the strongest possible evidence for the scored row "explores multiple design options for each role tool" — but only if a photo and one line of reasoning survive. Marked as the first thing to do on Sunday.

2. **Mounting the Technician tool on the driving base is explicitly legal** — the rulebook tip says the driving base may be used to move the robotic tool out of the Technician Area, and rule 17 allows items to leave only by robotic tool or base. Two constraints to build around: the Technician mounts it, only inside their own area, and the Driver may never touch the base by hand.

3. **Goal 3 is only half a scoring chain.** Accuracy into the grand tree feeds M02, but resources score 5 at the base and 10 in the canopy, and only the Specialist's grand tree motor can cycle them up. The Operator's work cannot pay full value without a Specialist.

4. **The Specialist is still unassigned and its tool unbuilt** — now the blocking gap, since it gates half of goal 3's points and is also the role that can operate other players' tools.

Also noted that launching → dropping with a deliberately *slow* motor is the reliability principle showing up in the team's own build, and picked out the five rulebook rules that touch this week's work rather than leaving "study the rulebook" as forty pages.

**Updated**: progress-log, team-roster (real assignments recorded), calendar, docs/index.html.

## 2026-08-16 — Weeks 2 and 3 actual progress recorded

**Source**: coach report

Created `wiki/progress-log.md` to record what actually happened each week, as distinct from what was planned. Judges score the doing, not the plan.

**Week 2** — most mission models built, a few taken home between families to finish; research items assigned to each student.

**Week 3** — all mission structures complete, all motors installed, Driver, Technician **and Operator** tools built with basic coding, keystone and resource setup learned, and **five full 2:30 practice matches with team members rotating through each role**. Morning at Coastal Roots Farm: regenerative farming and the chicken-and-plant circle, invasive Bermuda grass, a rabbit problem, healthy soil, questions to the guide, team lunch, then brainstorming.

**The headline: the robot game is roughly six weeks ahead of plan.** The first full 2:30 run was scheduled for Week 9 and the team did five in Week 3; the Operator tool was not due until about Week 5. Added a note on spending that lead on reliability data, the outstanding Specialist tool, and the Innovation Project rather than on more building — rank is the average across matches, so consistency is worth more than capability.

**Two real problems came back from the farm**, and they outrank everything on the speculative shortlist because the team heard them from someone who lives with them. Added as **Tier 0**:

- **Bermuda grass** — spreads by underground runners, regrows from fragments, cannot be sprayed on an organic farm. The literal answer to "which job is still done by hand".
- **Rabbits eating crops** — needs a humane answer, which makes it *a sensor noticing something and a motor responding*: exactly the Technician's tool and exactly what the CS & AI kit does, plus a Core Values story with no victim.

**Flagged as urgent**: the five practice matches produced no written scores. That data is a scored rubric row and the basis for the Week 8 cut — recorded as an open item to reconstruct from memory now, before it is lost.

## 2026-08-16 — Farm question bank expanded to 40

Added twenty more questions in five new sets, chosen to open ground the first twenty did not cover rather than to pad the list: **people and jobs** (which the Project Paths ask about by name), **problems and things that went wrong**, **animals and bugs**, **where the food goes**, and **time and change**.

Three new stars, bringing the protected set to eight. Set 7 is the most useful on the page — a team cannot solve a problem nobody told them about, and "what went wrong this year" gets a farm worker talking about exactly that.

Reframed the whole page as a **menu rather than a checklist**: forty is far more than anyone will ask, the group will manage ten or fifteen across a morning, and each student circles four or five they actually care about. Without that framing a long list becomes pressure.

Also added a note for shy kids — ask a warm-up question first, because once an adult has answered them seriously the harder question is much easier.

**Housekeeping**: the Drive connector's update tool only changes metadata, not document content, so the printable was recreated with all forty and the old one renamed `ZZ OLD — superseded by 40 Questions — do not print` rather than left as a confusable duplicate.

## 2026-08-14 — Week 3 goals recorded; no-gyro correction

**Week 3 goals** (from the coach): farm visit · narrow the project ideas · finish the map setup with basic coding for grand tree, hive and young forest · build the Driver and Technician tools with basic coding. Added to the calendar, the training plan, and the homepage This Week card.

Three things worth recording alongside them:

1. **The three field models are the rule-8 required hardware.** Grand tree holds a double motor, hive a single motor, young forest a color sensor — all surrendered before each match. The grand tree is also **the Specialist's match tool**, so building it is half of setting that role up. And the young forest pairs with the *opposite* team's hive, which is the mechanism behind M01's cross-field bonus: build both this week and the kids can see the two fields talk to each other.

2. **The week's build list consumes exactly the legal complement.** Field models plus Driver plus Technician come to 2 double motors, 2 single motors and 2 color sensors — precisely the rule 5 maximum, with one spare of each left from the three kits. Nothing to buy.

3. **⚠️ There is no gyro sensor.** The plan had inherited "color and gyro navigation" from the parent handbook. Rule 5 permits only color sensors, double motors, controllers and single motors and says no other electronic hardware is allowed; there are also zero gyro blocks among the 100+ in the Coding Canvas catalogue. The color sensor is the team's only sensor. Corrected in both places it appeared — worth knowing before a session themed "Sensors & Decisions".

Also noted a fallback order if the shortened evening runs out of time: field models first (nothing can be tested without a field), then the driving base, then the Technician tool, which can slip to Week 4 without blocking anything.

## 2026-08-14 — Current week highlighted; off-by-one week fix

**Bug found from the report that "we are in week 3."** The week counter advanced *on* a meeting day rather than the day after it, so Fri Aug 14 was reading as Week 2. A season week runs Monday through the following Sunday meeting, so the Monday after a meeting already belongs to the next week. Changed the floor to a ceiling; Aug 9 still reads W2, Aug 10 onward reads W3, Aug 16 reads W3, Aug 17 reads W4.

That single function drives the week chip, the schedule-table highlight and the This Week card, so all three were wrong together and are now right together.

**Added live highlighting to the month grids.** Each day cell now carries a `data-d` date, and at load the seven days of the current week are shaded, today gets an outline, and the containing month gets a NOW badge. Static markdown in `calendar.md` cannot do this, so a note there points at the homepage for the live view and states the Monday-to-Sunday rule.

**Second bug, caught by looking at the render:** Sep 20 is both a Sunday meeting and the optional farm tour, and the optional-tour style set lime text while the meeting style set a lime background — the date was invisible. Added a rule for the both-states case. Worth remembering that any day can carry several markers at once.

## 2026-08-14 — Farm visit confirmed; roles reframed as "magic sunglasses"

**Source**: call from Mrs. Megan at Coastal Roots Farm; coastalrootsfarm.org/nature-play

### Visit confirmed — Sunday 16 August

The team joins the farm's **Nature Play** program. Meet 8:30 AM (coffee stand on site), program 9:00–12:00, 441 Saxony Road, Encinitas. $10 per kid, $10 for the first adult, additional adults free, drop-in with no registration. Layers and closed-toe shoes; runs in all weather; service animals only. Farm Stand open 10:00–3:00. **A tour guide will be available** — the expert-interview opportunity.

Two things worth flagging that came out of checking the program page:

- **Nature Play is built for ages 0–8** and our team is 9–10, so the play structures will feel young. The FLL value is the farm and the guide, not the playground — set that expectation with the kids so their questions are the main event.
- **Aug 16 is Week 3**, whose 4:30–7:30 PM agenda is the vote on the project problem. Ideal sequencing — field in the morning, decide in the evening — but 8:30 to 12 plus 4:30 to 7:30 is a long day for nine-year-olds. Recommended a shorter evening: debrief, then vote.

**Optional 20 September deeper tour** recorded: 90 minutes, $25 per person, normally adults but kids welcome for technical questions. Better pitched at their level, and by then they will know their project — but it collides with Week 8's 40% mission cut, and costs more. Worth it if the project ends up farm-related.

### Roles reframed

Coach's framing, adopted across the wiki: **nobody is locked into one job**. The four roles are **four pairs of magic sunglasses** — 🛠️ Operator sees tools and moving parts, ⚙️ Technician sees sensors and data, 🌱 Specialist sees how living things fit together, 🚁 Driver sees the big picture from above. Everyone tries every pair, and sharing those views is the foundation of the team's teamwork.

Added the distinction that keeps this consistent with the rulebook: **sunglasses while learning, one seat per player on match day**. Rule 11 requires one player per role for a match with no switching once it begins, so the season's job is making sure every student has worn every pair and each match has someone confident in each seat.

**Created**: Drive **Farm Visit Sheet — Aug 16**, built around trying all four lenses rather than an assigned role, with a space for each student's own question and a reminder that they ask it themselves.

**Updated**: calendar, project-paths, team-roster, innovation-project-ideas, weekly-documentation, gen_calendar.py, docs/index.html.

## 2026-08-08 — Cost of inaction added to every project idea

Added an **"If nobody does anything"** line to all thirteen ideas — one true, specific consequence each.

The reason is the Project rubric: it asks the team to identify *"the real-world users and potential impact"* of their idea, and impact is easiest to explain by describing the world without it. It is also the most useful sentence a 4th grader can own — "we built a thing" is forgettable, "if nobody does this the fairy shrimp is gone from the whole planet" is not.

Kept them honest and local rather than apocalyptic. Nine-year-olds do not need catastrophe, they need one consequence they can picture. Several are genuinely sharp: vernal pool hardpan takes thousands of years to form so a flattened pool never returns; invasive mustard burns hotter each cycle so every fire makes the next one worse; roads kill populations by isolation rather than only by collision.

Also created **Innovation Project Workbook v2** in `08 Templates/`, adding a "what happens if nobody does anything" table for the top three ideas, a new "Who Is Affected" section, and a suggested expert question — *"what happens if nobody works on this?"* The vote procedure now runs that question before narrowing, since it is usually what settles the choice.

**Housekeeping**: workbook v1 is superseded and can be deleted; the connector has no delete.

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
