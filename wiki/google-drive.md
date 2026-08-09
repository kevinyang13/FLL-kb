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

## Budget Sheet

**[Team Budget 2026-27](https://docs.google.com/spreadsheets/d/1aRY3oYhdJQbhr-oAbopj-RXylOe1VetDiLNgav8mezE/edit)** — lives in `00 Admin/Budget/`. One row per expense; the summary recalculates itself.

Each family enters their own spending in the **Expense Log** (date, family, who paid, item, category, amount, receipt link). The **Summary** at the top totals per family and shows the balance against an equal split.

Known kit purchases are pre-filled. Everything else — registration, tournament fees, challenge set, shirts, supplies, snacks — is stubbed and waiting for amounts.

Two things it does not decide for you:

- **Equal split or per-student split?** Family 1 has two students, the rest have one, so the two give different answers. Both columns are shown; pick one and delete the other.
- **Whether the #45521 counts.** It is logged with a "confirm — possibly cancelled or returned" note. If that kit was returned it comes out of the total and shifts every family's share by roughly $116. See [[equipment-inventory]].

## Templates

In `08 Templates/`. Copy a template into its working folder rather than editing the template itself.

| Template | Copy it into | What it does |
|----------|--------------|--------------|
| [Engineering Notebook](https://docs.google.com/document/d/1EN_PuyM_aGjFQOHaINtz_pDkwrtOE-yWx-GtPPGcsSU/edit) | `01 Engineering Notebook/Current/` | Mission strategy, per-role tool design log with an explored-and-rejected table, testing log, repeatable weekly entry, design freeze sign-off |
| [Innovation Project Workbook](https://docs.google.com/document/d/1cmzJE7sTQ3AfebSyMTZ3qpnV73jGMMZNsQwYsno_8mg/edit) | `04 Innovation Project/` | All four Project Paths, sources log, problem selection, expert interview notes, solution, impact and feasibility, who-did-what |
| [Project Presentation script](https://docs.google.com/document/d/18M8fH4AefWko5vkGmGjvO3VAfxszU9hAXNB3jUh55vs/edit) | `05 Presentations/Project (5 min)/` | Minute-by-minute script mapped to the Project rubric, with speaker assignments and Q&A prep |
| [Engineering Design script](https://docs.google.com/document/d/1eG15uBPRXYzvNo_nOnQvFdNV3qJwqiPFm3HPrqvM5EA/edit) | `05 Presentations/Engineering Design (5 min)/` | Same, mapped to the Engineering Design rubric — includes game strategy and cooperative strategy, both scored |

Each is built from the actual rubric rows in [[judging-and-awards]], so filling one in produces judging evidence rather than homework. Prompts that carry a scored row are marked in the templates.

**Two presentation templates, not one.** The judging session contains two separate 5-minute presentations with different rubrics, delivered minutes apart. See [[judging-and-awards]].

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
