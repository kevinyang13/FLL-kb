---
title: Team Google Drive
layout: default
nav_order: 24
parent: Wiki
---

# Team Google Drive

**Summary**: Proposed folder structure for the team's shared Drive, organized around the four judged areas plus operations, with the naming rules and habits that keep judged artifacts intact.

**Sources**: raw/bioglow/fll-future-3-8-judging-rubric.pdf; team practice

**Last updated**: 2026-08-08

---

> **Drive:** [FLL-BIOGLOW-BOTBUILDER](https://drive.google.com/drive/folders/18saDG8seFVwaMr1_Mw7XZBz6KXE6iBJV) — all 34 folders created 2026-08-08.

## Design Principles

The structure below is not generic. Three things drive it:

1. **The rubric scores specific artifacts.** "Explores multiple design options for each role tool," "uses multiple relevant sources," "follows a clear testing process and documents results" — each of those needs a home, or the evidence does not exist at judging time. See [[judging-and-awards]].
2. **The game is organized by role.** Tool designs and Project Path research both split four ways, matching [[team-roster]].
3. **Coding Canvas saves locally, not to the cloud.** Project files live on whichever device made them. Without a deliberate weekly export they are one wiped iPad away from gone.

Number prefixes keep folders in a fixed order so a 4th grader and a parent see the same thing.

---

## Structure

```
BOT Builders — FLL BIOGLOW 2026-27/
│
├── 00 Admin/
│   ├── Registration/              team registration, coach clearances, event signup
│   ├── Roster & Contacts/         who's who, emergency contacts
│   ├── Budget/                    budget sheet, receipts, reimbursements
│   └── Event Day/                 event packet, day schedule, packing list
│
├── 01 Engineering Notebook/       ← JUDGED
│   ├── Current/                   the live notebook
│   └── Weekly Entries/            W02 … W16
│
├── 02 Robot Game/
│   ├── Mission Strategy/          which missions, point targets, run plan
│   ├── Tool Designs/
│   │   ├── Driver/
│   │   ├── Operator/
│   │   ├── Technician/
│   │   ├── Specialist/
│   │   └── Explored and Rejected/ ← scored rubric row — never delete
│   ├── Testing Logs/              10-run reliability sheets, 40% cut data
│   └── Match Scores/              practice and event scores
│
├── 03 Software/
│   ├── LECP Projects/             exported .lecp files
│   ├── Design Freeze Snapshot/    frozen copies, Oct 25
│   └── Code Notes/                pseudocode, block explanations
│
├── 04 Innovation Project/
│   ├── Project Paths/
│   │   ├── Driver — Drones/
│   │   ├── Operator — Mechanical Tools/
│   │   ├── Technician — Animal Monitoring/
│   │   └── Specialist — Forestry/
│   ├── Sources Log/               ← scored rubric row
│   ├── Expert Interviews/         notes, photos, thank-you notes
│   ├── Prototype/                 photos, drawings, iterations
│   └── Feedback/                  what users and experts said
│
├── 05 Presentations/
│   ├── Project (5 min)/
│   ├── Engineering Design (5 min)/
│   └── QA Prep/
│
├── 06 Core Values/                activities, GP moments, team agreements
│
├── 07 Media/                      photos, video, team identity
│
└── 08 Templates/                  testing sheet, interview sheet, notebook template
```

---

## Why Each Folder Earns Its Place

| Folder | Judged? | What it protects |
|--------|---------|------------------|
| **01 Engineering Notebook** | **Yes** | The single most-referenced artifact at judging. Needs an owner from Week 1 — see [[team-roster]]. |
| **02 · Explored and Rejected** | **Yes** | The rubric asks whether the team explored multiple options **per role tool**. Rejected designs are the only proof. Photograph before dismantling. |
| **02 · Testing Logs** | **Yes** | "Follows a clear testing process and documents results" plus the Week 8 40% cut in [[robot-design-principles]] both need this data. |
| **03 Software** | Indirectly | "Custom coding that supports their mission strategy" is scored. Also plain disaster insurance. |
| **04 · Sources Log** | **Yes** | "Uses multiple relevant sources" — log as you go; reconstructing sources in November is miserable and unconvincing. |
| **04 · Project Paths** | **Yes** | The rubric's first section names the project path. Four subfolders, one per role — see [[project-paths]]. |
| **05 Presentations** | **Yes** | Two separate 5-minute presentations with different rubrics — see [[judging-and-awards]]. |
| **00 · Budget** | No | Three families bought kits; reimbursement and fair-share tracking. See [[equipment-inventory]]. |
| **07 Media** | Indirectly | Photos support the notebook and presentations. |

---

## Naming Rules

Dates first, so files sort chronologically:

| Type | Pattern | Example |
|------|---------|---------|
| LECP project | `YYYY-MM-DD_role_what_vN.lecp` | `2026-09-20_technician_waterfall-cycle_v3.lecp` |
| Testing log | `YYYY-MM-DD_mission_test.xlsx` | `2026-09-20_M03_reliability.xlsx` |
| Photo | `YYYY-MM-DD_what.jpg` | `2026-08-23_operator-tool-v1.jpg` |
| Notebook entry | `W##_YYYY-MM-DD_topic` | `W08_2026-09-20_mission-cut.pdf` |

Never overwrite a version. `v3` does not replace `v2` — the older one is rubric evidence.

---

## Habits That Make It Work

**Export LECP files every session.** Coding Canvas stores projects on the device, not in the cloud. One wiped iPad or a swapped laptop loses the season's code. Ten seconds per session prevents it. Extraction and file format: [[lecp-file-operations]].

**Photograph before dismantling.** Tool designs get taken apart to build the next idea. The photo is what survives into judging.

**Log sources at the moment of use.** Drop the URL into the Sources Log while researching, not later.

**Snapshot at the design freeze.** On **Oct 25**, copy the working LECP files and tool photos into `Design Freeze Snapshot/`. If a late bug fix goes wrong, that folder is the way back. See [[calendar]].

**One owner per top folder.** Folders without an owner rot. Match them to the adult lanes in [[team-roster]].

---

## Sharing Settings — Decide Before Sharing

The Drive will hold children's names, photos, and parent contact details. Settings worth deciding deliberately:

- **Restrict to named team members**, not "anyone with the link." A link-shared folder is public to anyone who ever sees the URL.
- **This wiki is a public site.** If the Drive link is published here, treat the folder as discoverable. Restricted sharing means outsiders hit a request-access wall rather than the contents — that is the safe combination.
- Keep any photo-release or consent notes in `00 Admin/Roster & Contacts/`.
- If you would rather not publish the link at all, share it through the parent group chat and leave this page pointing to nothing. Say the word and it comes off the site.

## Housekeeping

One folder was created as `Roster &amp; Contacts` instead of `Roster & Contacts` — an encoding slip on my side. Rename it in Drive; it takes a moment and nothing depends on the name.

## Related pages
- [[judging-and-awards]]
- [[team-roster]]
- [[project-paths]]
- [[lecp-file-operations]]
- [[calendar]]
- [[equipment-inventory]]
