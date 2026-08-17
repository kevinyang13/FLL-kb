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
LAST_WEEK = 16

MILESTONES = {
    dt.date(2026, 9, 20): "40% cut",
    dt.date(2026, 9, 27): "First timed run",
    dt.date(2026, 10, 25): "Design freeze",
    dt.date(2026, 11, 1): "Mock judging",
    dt.date(2026, 11, 15): "Tournament",
}
DAYS_OFF = {
    dt.date(2026, 9, 7): "Labor Day",
    dt.date(2026, 11, 11): "Veterans Day",
}
TRIPS = {
    dt.date(2026, 8, 16): "Farm visit 8:30 AM",
}
MAYBE = {
    dt.date(2026, 9, 20): "Optional deeper farm tour",
}


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
    4:  dict(theme="First Iteration",
             robot="Driver improvements · Technician ramp rebuild · Operator accuracy tools · team comms · rulebook",
             project="Pick the problem — Bermuda grass or rabbits"),
    5:  dict(theme="Chaining Missions",
             robot="Connect 2–3 missions; quick-release tools",
             project="Build the physical prototype"),
    6:  dict(theme="Inconsistency",
             robot="Improve reliability; align off walls and lines",
             project="Identify the target audience"),
    7:  dict(theme="Sharing & Feedback",
             robot="Log failures and fixes in the notebook",
             project="Share with users; collect feedback"),
    8:  dict(theme="Upgrade & Iterate", flag=("robot",),
             robot="Cut every mission under 40% success",
             project="Improve prototype on feedback"),
    9:  dict(theme="Master Program", flag=("robot",),
             robot="First full 2:30 timed run",
             project="Draft the 5-minute script"),
    10: dict(theme="Robot Design Talk",
             robot="Draft the 5-minute design presentation",
             project="Props, costumes, trifold boards"),
    11: dict(theme="Off-Script",
             robot="Clean up code; add comments",
             project="Memorise lines; practise with props"),
    12: dict(theme="Stress Test",
             robot="Practise Q&A; explain Core Values",
             project="Simulate competition pressure"),
    13: dict(theme="Design Freeze", flag=("robot",),
             robot="Design freeze — bug fixes only",
             project="Prepare team tokens"),
    14: dict(theme="Mock Judging", flag=("robot",),
             robot="Full judging simulation",
             project="Full judging simulation"),
    15: dict(theme="Final Polish",
             robot="Final notebook check; light practice",
             project="Final script and props check"),
    16: dict(theme="Competition", flag=("robot",),
             robot="Tournament day",
             project="Team mindset and encouragement"),
}

MEETINGS = {WEEK2 + dt.timedelta(days=7 * (w - 2)): w for w in range(2, LAST_WEEK + 1)}
MONTHS = [(2026, 8), (2026, 9), (2026, 10), (2026, 11)]


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
        '<span><i class="sw maybe"></i>Optional tour</span>'
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
    out.append("Bold dates with a **W** number are Sunday meetings, 4:30–7:30 PM.\n")
    return "\n".join(out)




def _cell(w, key):
    txt = WEEKS[w][key]
    return f'<span class="flag">{txt}</span>' if key in WEEKS[w].get("flag", ()) else txt


def weeks_html():
    rows = []
    for w in sorted(WEEKS):
        d = next(k for k, v in MEETINGS.items() if v == w)
        done = WEEKS[w].get("done")
        cls = ' class="done"' if done else ""
        wk = f"{w}&nbsp;✓" if done else str(w)
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
        tick = " ✅" if done else ""
        def cell(key):
            t = WEEKS[w][key]
            if key in WEEKS[w].get("flag", ()):
                t = f"**{t}**"
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
