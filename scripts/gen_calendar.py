#!/usr/bin/env python3
"""Generate the season month-grid views from a single source of truth.

Emits an HTML block into docs/index.html and a markdown block into
wiki/calendar.md, so the two views cannot drift apart. Re-run after
changing any date below.
"""

import calendar
import datetime as dt
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ── Source of truth ────────────────────────────────────────────────
WEEK2 = dt.date(2026, 8, 9)          # week 2 meets this Sunday
LAST_WEEK = 25

MILESTONES = {
    dt.date(2026, 9, 20): "40% cut",
    dt.date(2026, 9, 27): "First timed run",
    dt.date(2026, 10, 25): "Design freeze",
    dt.date(2026, 11, 8): "Mock judging",
    dt.date(2026, 11, 22): "Everything finished",
    dt.date(2027, 1, 10): "Back from the break",
    dt.date(2027, 1, 17): "Competition (assumed date)",
}
DAYS_OFF = {
    dt.date(2026, 9, 7): "Labor Day",
    dt.date(2026, 11, 11): "Veterans Day",
    dt.date(2026, 11, 26): "Thanksgiving",
    dt.date(2026, 12, 25): "Christmas",
    dt.date(2027, 1, 1): "New Year",
}
TRIPS = {
    dt.date(2026, 8, 16): "Farm visit 8:30 AM",
    dt.date(2026, 9, 20): "Farm tour 10:30 AM — beneficial insects",
}
MAYBE = {}


# Week-by-week plan. `done` marks a completed week; `flag` names columns to
# highlight as milestones. Edit here only — both the site table and the wiki
# table are generated from this.
WEEKS = {
    2:  dict(theme="Rules & Strategy", done=True,
             robot="Most mission models built",
             project="Research items assigned"),
    3:  dict(theme="Sensors & Decisions", done=True,
             robot="Field complete, motors in; Driver, Technician and Operator built; 5 × 2:30 familiarisation runs",
             project="Farm visit — Bermuda grass and rabbit problems found"),
    4:  dict(theme="Skipped", skipped=True, flag=("robot",),
             robot="No meeting — deciding path forward after SoCal confirmed Founders-only",
             project="Innovation Project continued regardless"),
    5:  dict(theme="Rules, Judging & Runs", done=True,
             robot="Rulebook/setup/mission test; multiple game runs — driving base with collector, Technician ramp, better Operator tools",
             project="Judging rubrics learned; BIOGLOW Bingo; team logo and slogan drawn"),
    6:  dict(theme="First Points on the Board", done=True, flag=("robot",),
             robot="Strong driving base; navigation to young forest; 3 keystone species via the new ramp; grand tree split to serve both waterfall and young forest — 10+ runs, 100 points",
             project="Project chosen — lacewings and the insect ecosystem; team logo voted in"),
    7:  dict(theme="Three Decisions", done=True, flag=("robot",),
             robot="Decided: small simple base on sticky wheels; 6-keystone dispenser (3 at a time) replaces the ramp; program-first with controller to correct drift",
             project="Logo final; lacewing habitat and lifecycle designs presented; quiz on lacewings, the farm and biodiversity; Core Values tower game"),
    8:  dict(theme="Farm Tour + Three Projects", done=True, flag=("robot",),
             robot="P1 software improved, controller still an issue · P2 tower lifts and rotates a keystone, grabber not built · P3 Operator tool decided",
             project="Second farm tour — beneficial insects; presentation board introduced and sections assigned; play introduced, first lacewing role-play"),
    9:  dict(theme="Grabber Week", flag=("robot",),
             robot="P1 better driver/controller software (Cheryl) · P2 everyone designs a grabber prototype to push keystones into the tower · first full 2:30 timed run still on the calendar",
             project="Board sections: Journey (Kyle · Kei), Problem (Cheryl), Solution (Lola), Learned (Lindsey); Process and Impact unassigned · play: practise, assign roles"),
    10: dict(theme="Three Bases, One Jig", done=True, flag=("robot",),
             robot="Base design settled — double + single motor, two gear-switched attachments; three identical bases built; meshers adopted to register tools against the mission models; Kei's rubber-band pickup tool finished",
             project="Zoom interview with Tracy at Rincon-Vitova; Core Values bridge-build between two chairs"),
    11: dict(theme="Skipped", skipped=True, flag=("robot",),
             robot="No meeting — holiday travel",
             project="Lacewings still need daily feeding at home"),
    12: dict(theme="Connectors & Meshers", flag=("robot",),
             robot="P1 connector, mesher, software (Cheryl · Lola) · P2 connector, one-way-door grabber, new rope loop (Kyle · Lindsey · Kei)",
             project="Board: Process and Impact still unassigned · play: assign roles"),
    13: dict(theme="Design Freeze", flag=("robot",),
             robot="Design freeze — bug fixes only",
             project="Prototype frozen; board assembled"),
    14: dict(theme="Reliability",
             robot="Run every mission ten times; cut anything under 40%",
             project="Rehearse the play with real props"),
    15: dict(theme="Mock Judging", flag=("robot",),
             robot="Full judging simulation — both 5-minute presentations",
             project="Full judging simulation"),
    16: dict(theme="Fix What Broke",
             robot="Act on mock-judging feedback",
             project="Act on mock-judging feedback"),
    17: dict(theme="Everything Finished", flag=("robot", "project"),
             robot="Robot, programs and notebook done — nothing new after today",
             project="Board, play and project done — evidence blanks filled"),
    18: dict(theme="Thanksgiving weekend — buffer",
             robot="Optional. Catch-up only if something slipped",
             project="Optional. Catch-up only if something slipped"),
    19: dict(theme="December break", skipped=True,
             robot="No meetings — holiday travel",
             project="Lacewings still need care at home"),
    20: dict(theme="December break", skipped=True,
             robot="No meetings — holiday travel",
             project="Lacewings still need care at home"),
    21: dict(theme="December break", skipped=True,
             robot="No meetings — holiday travel",
             project="Lacewings still need care at home"),
    22: dict(theme="December break", skipped=True,
             robot="No meetings — holiday travel",
             project="Lacewings still need care at home"),
    23: dict(theme="New Year weekend — tentative", skipped=True,
             robot="Likely still travelling",
             project="Likely still travelling"),
    24: dict(theme="Back to It", flag=("robot",),
             robot="Re-test every mission and re-tune after a month off — batteries, wheels, meshers",
             project="Re-read the script; re-rehearse the play"),
    25: dict(theme="Competition", flag=("robot", "project"),
             robot="Competition day — SoCal Future Edition event",
             project="Competition day — judging sessions"),
}

MEETINGS = {WEEK2 + dt.timedelta(days=7 * (w - 2)): w for w in range(2, LAST_WEEK + 1)}
MONTHS = [(2026, 8), (2026, 9), (2026, 10), (2026, 11), (2026, 12), (2027, 1)]


def weeks_of(year, month):
    """Return the month as lists of 7 date-or-None, Sunday first."""
    cal = calendar.Calendar(firstweekday=6)  # 6 = Sunday
    out = []
    for week in cal.monthdatescalendar(year, month):
        out.append([d if d.month == month else None for d in week])
    return out


def html_block():
    rows = []
    for year, month in MONTHS:
        name = calendar.month_name[month]
        cells = []
        for week in weeks_of(year, month):
            for d in week:
                if d is None:
                    cells.append('<span class="day blank"></span>')
                    continue
                cls, tag, title = ["day"], "", ""
                if d in MEETINGS:
                    cls.append("meet")
                    tag = f'<em>W{MEETINGS[d]}</em>'
                    title = f"Week {MEETINGS[d]} meeting"
                if d in MILESTONES:
                    cls.append("mile")
                    title = MILESTONES[d]
                if d in DAYS_OFF:
                    cls.append("off")
                    title = DAYS_OFF[d]
                if d in TRIPS:
                    cls.append("trip")
                    title = TRIPS[d]
                if d in MAYBE:
                    cls.append("maybe")
                    title = MAYBE[d]
                t = f' title="{title}"' if title else ""
                cells.append(
                    f'<span class="{" ".join(cls)}" data-d="{d.isoformat()}"{t}>{d.day}{tag}</span>'
                )
        dows = "".join(f'<span class="dow">{c}</span>' for c in "SMTWTFS")
        rows.append(
            f'    <div class="block month">\n'
            f'      <div class="month-head">{name}</div>\n'
            f'      <div class="grid">{dows}{"".join(cells)}</div>\n'
            f"    </div>"
        )
    legend = (
        '    <div class="cal-legend">'
        '<span><i class="sw meet"></i>Sunday meeting</span>'
        '<span><i class="sw mile"></i>Milestone</span>'
        '<span><i class="sw off"></i>No school</span>'
        '<span><i class="sw trip"></i>Farm visit</span>'
        "</div>"
    )
    return (
        '  <div class="months">\n' + "\n".join(rows) + "\n  </div>\n" + legend + "\n"
    )


def md_block():
    out = ["## Month View\n"]
    for year, month in MONTHS:
        out.append(f"### {calendar.month_name[month]} 2026\n")
        out.append("| Sun | Mon | Tue | Wed | Thu | Fri | Sat |")
        out.append("|:---:|:---:|:---:|:---:|:---:|:---:|:---:|")
        for week in weeks_of(year, month):
            cells = []
            for d in week:
                if d is None:
                    cells.append("")
                elif d in MEETINGS:
                    extra = " 🌱" if d in TRIPS else ""
                    cells.append(f"**{d.day}**<br>W{MEETINGS[d]}{extra}")
                elif d in DAYS_OFF:
                    cells.append(f"{d.day}<br>*off*")
                elif d in MAYBE:
                    cells.append(f"{d.day}<br>*tour?*")
                else:
                    cells.append(str(d.day))
            out.append("| " + " | ".join(cells) + " |")
        notes = [
            f"**{d.strftime('%b %-d')}** {label}"
            for d, label in sorted({**MILESTONES, **DAYS_OFF, **TRIPS}.items())
            if d.month == month
        ]
        if notes:
            out.append("")
            out.append(" · ".join(notes))
        out.append("")
    out.append("Bold dates with a **W** number are Sunday meetings, 2:30–6:00 PM (4:30–7:30 PM before 13 Sep).\n")
    return "\n".join(out)




def _cell(w, key):
    txt = WEEKS[w][key]
    return f'<span class="flag">{txt}</span>' if key in WEEKS[w].get("flag", ()) else txt


def weeks_html():
    rows = []
    for w in sorted(WEEKS):
        d = next(k for k, v in MEETINGS.items() if v == w)
        done = WEEKS[w].get("done")
        skipped = WEEKS[w].get("skipped")
        cls = ' class="done skipped"' if skipped else (' class="done"' if done else "")
        wk = f"{w}&nbsp;—" if skipped else (f"{w}&nbsp;✓" if done else str(w))
        rows.append(
            f'            <tr data-week="{w}"{cls}><td class="wk">{wk}</td>'
            f'<td class="dt">{d.strftime("%b %-d")}</td>'
            f'<td class="th-cell">{WEEKS[w]["theme"]}</td>'
            f'<td>{_cell(w, "robot")}</td>'
            f'<td>{_cell(w, "project")}</td></tr>'
        )
    return "\n".join(rows) + "\n"


def weeks_md():
    out = ["| Week | Date | Theme | Robot focus | Project focus |",
           "|-----:|------|-------|-------------|---------------|"]
    for w in sorted(WEEKS):
        d = next(k for k, v in MEETINGS.items() if v == w)
        done = WEEKS[w].get("done")
        skipped = WEEKS[w].get("skipped")
        tick = " ⤬" if skipped else (" ✅" if done else "")
        def cell(key):
            t = WEEKS[w][key]
            if key in WEEKS[w].get("flag", ()):
                t = f"**{t}**"
            if skipped:
                return "⤬ " + t
            return ("✅ " + t) if done else t
        out.append(
            f'| {w} | **{d.strftime("%a %b %-d")}**{tick} | {WEEKS[w]["theme"]} '
            f'| {cell("robot")} | {cell("project")} |'
        )
    return "\n".join(out) + "\n"


def patch(path, start, end, body):
    p = ROOT / path
    s = p.read_text()
    i, j = s.index(start), s.index(end)
    p.write_text(s[: i + len(start)] + body + s[j:])
    print(f"patched {path}")


if __name__ == "__main__":
    patch(
        "docs/index.html",
        "<!-- CAL:MONTHS:START -->\n",
        "  <!-- CAL:MONTHS:END -->",
        html_block(),
    )
    patch(
        "wiki/calendar.md",
        "<!-- CAL:MONTHS:START -->\n",
        "<!-- CAL:MONTHS:END -->",
        md_block(),
    )
    patch(
        "docs/index.html",
        "<!-- CAL:WEEKS:START -->\n",
        "          <!-- CAL:WEEKS:END -->",
        weeks_html(),
    )
    patch(
        "wiki/calendar.md",
        "<!-- CAL:WEEKS:START -->\n",
        "<!-- CAL:WEEKS:END -->",
        weeks_md(),
    )
