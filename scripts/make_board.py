#!/usr/bin/env python3
"""Draw the Robot Design tri-fold board layout.

Writes an SVG at true print proportions (48 x 36 inches, wings 12 / centre 24)
with every panel marked out, the team's own photographs dropped into the slots
they belong in, and the words that go in each box.

The structure follows the Dino Diggers board (team 70440) the team studied:
a title block with a QR code, then evidence in three columns — what we built,
how it changed, and what it scored.

Run:  python3 scripts/make_board.py
Out:  docs/assets/robot-design/board-layout.svg
"""

import base64
import io
from pathlib import Path
from xml.sax.saxutils import escape

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "assets" / "robot-design" / "board-layout.svg"

PX = 26                       # pixels per inch
W_IN, H_IN = 48, 36
WING_IN = 12
W, H = W_IN * PX, H_IN * PX

INK = "#17241A"
MUTED = "#5A6D5C"
LINE = "#C3D1BB"
LEAF = "#2F6B2C"
AMBER = "#B9780F"
PAPER = "#FBFDF7"
TINT = "#EDF3E6"

PHOTO_DIR = ROOT / "docs" / "assets" / "robot-design"

# An SVG shown through an <img> tag is a sandboxed document: it may not fetch
# anything from the network, so a relative href to a photograph silently draws
# nothing. The photographs are therefore baked in as data URIs, resized to the
# box they sit in so the file stays a few hundred kilobytes rather than tens of
# megabytes.
_embedded = {}


def data_uri(name, box_w, box_h):
    key = (name, int(box_w), int(box_h))
    if key in _embedded:
        return _embedded[key]
    im = Image.open(PHOTO_DIR / name).convert("RGB")
    # cover the box at 2x for print, then crop to the box's aspect
    target = (int(box_w * 2), int(box_h * 2))
    scale = max(target[0] / im.width, target[1] / im.height)
    im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))),
                   Image.LANCZOS)
    left = (im.width - target[0]) // 2
    top = (im.height - target[1]) // 2
    im = im.crop((left, top, left + target[0], top + target[1]))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=72, optimize=True)
    uri = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
    _embedded[key] = uri
    return uri


def esc(t):
    return escape(str(t))


class Svg:
    def __init__(self):
        self.parts = []

    def add(self, s):
        self.parts.append(s)

    def rect(self, x, y, w, h, fill="none", stroke=LINE, sw=2, rx=10, dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.add(f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" '
                 f'rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>')

    def text(self, x, y, s, size=14, fill=INK, weight="400", anchor="start",
             family="'Nunito Sans',system-ui,sans-serif", spacing=None):
        ls = f' letter-spacing="{spacing}"' if spacing else ""
        self.add(f'<text x="{x:.0f}" y="{y:.0f}" font-size="{size}" fill="{fill}" '
                 f'font-weight="{weight}" text-anchor="{anchor}" '
                 f'font-family="{family}"{ls}>{esc(s)}</text>')

    def wrap(self, x, y, s, size=13, width=38, lh=1.45, fill=MUTED, weight="400"):
        """Crude word wrap — the board is a layout guide, not a typesetter."""
        words, line, out = s.split(), "", []
        for w_ in words:
            if len(line) + len(w_) + 1 <= width:
                line = (line + " " + w_).strip()
            else:
                out.append(line)
                line = w_
        out.append(line)
        for i, ln in enumerate(out):
            self.text(x, y + i * size * lh, ln, size=size, fill=fill, weight=weight)
        return y + len(out) * size * lh

    def photo(self, x, y, w, h, name, caption):
        self.add(f'<clipPath id="c{abs(hash((x,y,name)))%99999}">'
                 f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" rx="8"/></clipPath>')
        cid = f'c{abs(hash((x,y,name)))%99999}'
        self.add(f'<image href="{data_uri(name, w, h)}" x="{x:.0f}" y="{y:.0f}" '
                 f'width="{w:.0f}" height="{h:.0f}" preserveAspectRatio="xMidYMid slice" '
                 f'clip-path="url(#{cid})"/>')
        self.rect(x, y, w, h, stroke=LINE, sw=2, rx=8)
        self.text(x, y + h + 15, caption, size=11, fill=MUTED, weight="600")

    def heading(self, x, y, w, title, kicker=None):
        """A kicker only fits beside a title on the wide centre panel; on a
        12-inch wing it lands on top of the title, so it drops to its own line."""
        wide = w > 400
        h = 34 if wide or not kicker else 50
        self.add(f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h}" rx="8" fill="{TINT}"/>')
        self.text(x + 12, y + 23, title, size=16, weight="800",
                  family="'Baloo 2',system-ui,sans-serif")
        if kicker and wide:
            self.text(x + w - 12, y + 22, kicker, size=11, fill=MUTED, weight="700", anchor="end")
        elif kicker:
            self.text(x + 12, y + 42, kicker, size=11, fill=MUTED, weight="700")
        return y + h + 14

    def out(self):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" '
                f'xmlns:xlink="http://www.w3.org/1999/xlink" '
                f'viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
                f'<rect width="{W}" height="{H}" fill="{PAPER}"/>'
                + "".join(self.parts) + "</svg>")


def build():
    s = Svg()
    wing = WING_IN * PX
    pad = 22

    # fold lines
    for x in (wing, W - wing):
        s.add(f'<line x1="{x}" y1="0" x2="{x}" y2="{H}" stroke="{LINE}" '
              f'stroke-width="3" stroke-dasharray="14 10"/>')
        s.text(x, 18, "fold", size=11, fill=MUTED, weight="700", anchor="middle")

    # ── title block, across the centre panel ──────────────────
    cx = wing + pad
    cw = W - 2 * wing - 2 * pad
    s.rect(cx, 34, cw, 118, fill="#FFFFFF", stroke=LEAF, sw=3, rx=14)
    s.text(cx + 24, 78, "BOT BUILDERS", size=34, weight="800",
           family="'Baloo 2',system-ui,sans-serif")
    s.text(cx + 24, 106, "Team 300024 · FIRST LEGO League · BIOGLOW Future Edition",
           size=15, fill=MUTED, weight="700")
    s.text(cx + 24, 134, "ROBOT DESIGN — built it, changed it, scored it",
           size=15, fill=LEAF, weight="800")
    # QR slot, as on the Dino Diggers board
    s.rect(cx + cw - 110, 46, 80, 80, fill="#FFFFFF", stroke=INK, sw=2, rx=8, dash="6 5")
    s.text(cx + cw - 70, 92, "QR", size=18, weight="800", anchor="middle", fill=MUTED)
    s.text(cx + cw - 76, 148, "Scan me — run video", size=10, fill=MUTED,
           weight="700", anchor="middle")

    # ── LEFT WING: the problem and the strategy ───────────────
    x = pad
    w = wing - 2 * pad
    y = s.heading(x, 44, w, "The missions we chose", "and the order")
    y = s.wrap(x, y, "Five missions, one Level Up, two minutes thirty. Draw the order "
                     "you run them in and say why that order. The sequence is the "
                     "argument — the robot is only how you deliver it.", width=40)
    y += 10
    s.photo(x, y, w, 176, "mat-overview.jpg", "Our table, set up for a full run")
    y += 176 + 34
    y = s.heading(x, y, w, "Why this order")
    for line in ["1.  Nearest first — cross the table once",
                 "2.  Heavy load last — the arm hides a sensor",
                 "3.  Token \u2014 park once, or cycle it?",
                 "4.  Fallback when a mission fails"]:
        s.text(x + 6, y, line, size=13, weight="600")
        y += 25
    y += 14
    y = s.heading(x, y, w, "Our driving base", "three versions")
    s.photo(x, y, w, 158, "robot-side-view.jpg", "The base that won the argument")
    y += 158 + 32
    s.wrap(x, y, "Label it: hub, two double motors, two single motors, two "
                 "colour sensors, wheel size. Rule 5 allows no more, and there "
                 "is no gyro — it counts wheel turns and trusts them.", width=40)

    # ── CENTRE: the robot, attachments, iteration ─────────────
    y = 190
    colw = (cw - 24) / 2
    y = s.heading(cx, y, cw, "The robot, part by part", "photograph it clean, on white")
    s.photo(cx, y, colw, 196, "robot-at-mission-model.jpg", "At the mission model it was built for")
    s.photo(cx + colw + 24, y, colw, 196, "attachment-lift.jpg", "The lift attachment, mid-run")
    y += 196 + 38

    y = s.heading(cx, y, cw, "Iterations", "what changed, and why — the Dino Diggers table")
    # the iteration table: left column what we learned, right what we changed
    rows = [
        ("The base wandered on long runs", "Shorter runs between walls; square up on a wall, not on a guess"),
        ("Attachment had to line up exactly", "Added meshers so the tool registers against the model itself"),
        ("Swapping attachments cost seconds", "One mounting point, same two pins every time"),
        ("Battery level changed the distance", "Count rotations, not time — and charge before every match"),
    ]
    hdr_y = y
    s.rect(cx, y, cw, 30, fill=TINT, stroke="none", rx=6)
    s.text(cx + 12, y + 20, "What we found out", size=12, weight="800")
    s.text(cx + colw + 24, y + 20, "What we changed", size=12, weight="800")
    y += 34
    for a, b in rows:
        s.rect(cx, y, cw, 48, fill="#FFFFFF", rx=6)
        s.wrap(cx + 12, y + 20, a, size=12, width=30, fill=INK, weight="700")
        s.wrap(cx + colw + 24, y + 20, b, size=12, width=38)
        y += 54
    _ = hdr_y

    y += 6
    y = s.heading(cx, y, cw, "The numbers", "fill these in from real runs — never estimate")
    s.rect(cx, y, cw, 104, fill="#FFFFFF", rx=8)
    cols = ["Mission", "Tries", "Worked", "Seconds", "Points"]
    for i, c in enumerate(cols):
        s.text(cx + 16 + i * (cw - 32) / 5, y + 24, c, size=12, weight="800")
    for r in range(3):
        yy = y + 48 + r * 24
        s.add(f'<line x1="{cx+12}" y1="{yy}" x2="{cx+cw-12}" y2="{yy}" '
              f'stroke="{LINE}" stroke-width="1.5"/>')
    s.text(cx + 16, y + 92, "A judge believes 11 of 15. Nobody believes “almost always”.",
           size=11, fill=AMBER, weight="700")

    # ── RIGHT WING: roles, team, next ─────────────────────────
    x = W - wing + pad
    y = s.heading(x, 44, w, "Four roles, one match", "the Future Edition rule")
    for role, what in [("Driver", "moves the robot"),
                       ("Operator", "starts and stops the program"),
                       ("Technician", "swaps attachments"),
                       ("Specialist", "watches the clock and the plan")]:
        s.rect(x, y, w, 40, fill="#FFFFFF", rx=8)
        s.text(x + 12, y + 26, role, size=14, weight="800")
        s.text(x + w - 12, y + 26, what, size=11, fill=MUTED, weight="600", anchor="end")
        y += 46
    y += 6
    s.wrap(x, y, "All four work at the same time. Write each name in — a judge asks, "
                 "and “we all did everything” is the wrong answer.", width=40)

    y += 58
    y = s.heading(x, y, w, "Us, at the table")
    s.photo(x, y, w, 168, "team-with-mat.jpg", "Every one of us built part of this")
    y += 168 + 38

    y = s.heading(x, y, w, "What we would do next")
    y = s.wrap(x, y, "Two honest sentences about what is still wrong with the robot. "
                     "Judges trust a team that can name its own weakest point far "
                     "more than one that says everything works.", width=40)
    y += 16
    s.rect(x, y, w, 86, fill="#FFFFFF", rx=8, dash="7 6")
    s.text(x + 12, y + 26, "Write it here, in pencil first", size=12, fill=MUTED, weight="700")

    # footer note
    s.text(W / 2, H - 9,
           "48 x 36 in tri-fold — wings 12 in, centre 24 in. Print at 100%; every box is a real size.",
           size=12, fill=MUTED, weight="600", anchor="middle")
    return s.out()


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(build())
    print(f"wrote {OUT.relative_to(ROOT)}  ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
