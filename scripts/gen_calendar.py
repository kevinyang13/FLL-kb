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
MAYBE = {
    dt.date(2026, 8, 15): "Farm trip?",
    dt.date(2026, 8, 22): "Farm trip?",
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
                if d in MAYBE:
                    cls.append("maybe")
                    title = MAYBE[d]
                t = f' title="{title}"' if title else ""
                cells.append(f'<span class="{" ".join(cls)}"{t}>{d.day}{tag}</span>')
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
        '<span><i class="sw maybe"></i>Possible field trip</span>'
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
                    cells.append(f"**{d.day}**<br>W{MEETINGS[d]}")
                elif d in DAYS_OFF:
                    cells.append(f"{d.day}<br>*off*")
                elif d in MAYBE:
                    cells.append(f"{d.day}<br>*trip?*")
                else:
                    cells.append(str(d.day))
            out.append("| " + " | ".join(cells) + " |")
        notes = [
            f"**{d.strftime('%b %-d')}** {label}"
            for d, label in sorted({**MILESTONES, **DAYS_OFF}.items())
            if d.month == month
        ]
        if notes:
            out.append("")
            out.append(" · ".join(notes))
        out.append("")
    out.append("Bold dates with a **W** number are Sunday meetings, 4:30–7:30 PM.\n")
    return "\n".join(out)


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
