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

# The board is dressed to match the team's own Innovation Project board,
# "Backyard Biodiversity: Tiny Heroes, Big Impact" — white panels, green
# ribbon headings with a numbered badge and a one-line kicker beneath, soft
# white cards with pale green borders, and a yellow sticky note for the
# thing that still needs doing. Photo: reference-lacewing-board.jpg.
INK = "#1D2B1C"
MUTED = "#5E7357"
LINE = "#BFDCB0"         # the pale green card outline used all over that board
RIBBON = "#4C8C3F"       # heading ribbons
RIBBON_DK = "#2F6B26"
LEAF = "#2F6B26"
LIME = "#DCEFC8"         # the pale green fills
NODE = "#FBF0A4"         # the yellow sticky
AMBER = "#8A5A06"
PAPER = "#FFFFFF"        # the panels themselves are white
CARD = "#FFFFFF"
TINT = "#EEF7E6"
EDGE = "#12140F"         # the black trifold edge

DISPLAY = "'Arial Rounded MT Bold','Helvetica Rounded','Trebuchet MS',system-ui,sans-serif"
BODY = "system-ui,-apple-system,'Segoe UI',sans-serif"

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

    def rect(self, x, y, w, h, fill="none", stroke=LINE, sw=3, rx=14, dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.add(f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" '
                 f'rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>')

    def text(self, x, y, s, size=14, fill=INK, weight="400", anchor="start",
             family=BODY, spacing=None):
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
        self.rect(x, y, w, h, stroke=LINE, sw=3, rx=10)
        self.text(x, y + h + 16, caption, size=11, fill=MUTED, weight="700")

    def leaf_sprig(self, x, y, flip=1, scale=1.0):
        """The little leaf pair that sits either side of a heading on the
        lacewing board. Two teardrops off a short stem."""
        g = f'translate({x:.0f},{y:.0f}) scale({flip*scale},{scale})'
        self.add(f'<g transform="{g}">'
                 f'<path d="M0 0 q 10 -2 18 -9" stroke="{RIBBON_DK}" stroke-width="2.4" fill="none"/>'
                 f'<path d="M2 -1 q 7 -9 15 -8 q 1 9 -8 11 q -6 1 -7 -3z" fill="{RIBBON_DK}"/>'
                 f'<path d="M9 -6 q 8 -8 16 -6 q -1 9 -9 10 q -6 0 -7 -4z" fill="{RIBBON}"/>'
                 f'</g>')

    def heading(self, x, y, w, title, kicker=None, number=None):
        """A green ribbon with a numbered badge and the kicker underneath —
        the form every section takes on the team's own board."""
        h = 50 if kicker else 38
        self.add(f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h}" rx="{h/2:.0f}" '
                 f'fill="{RIBBON}" stroke="{RIBBON_DK}" stroke-width="2.5"/>')
        tx = x + 18
        if number is not None:
            cy = y + (26 if kicker else h / 2)
            self.add(f'<circle cx="{x+26:.0f}" cy="{cy:.0f}" r="13" fill="#FFFFFF" '
                     f'stroke="{RIBBON_DK}" stroke-width="2.5"/>')
            self.text(x + 26, cy + 5, str(number), size=15, weight="900", fill=RIBBON_DK,
                      anchor="middle", family=DISPLAY)
            tx = x + 48
        self.text(tx, y + (25 if kicker else h / 2 + 6), title, size=16, weight="900",
                  fill="#FFFFFF", family=DISPLAY)
        if kicker:
            self.text(tx, y + 42, kicker, size=11, fill="#DDF0CC", weight="700")
        self.leaf_sprig(x + w - 16, y + h / 2 + 4, flip=-1, scale=0.8)
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

    # the black trifold edge the real board has, and the two folds
    s.add(f'<rect x="0" y="0" width="{W}" height="{H}" rx="10" fill="none" '
          f'stroke="{EDGE}" stroke-width="18"/>')
    for x in (wing, W - wing):
        s.add(f'<line x1="{x}" y1="9" x2="{x}" y2="{H-9}" stroke="{EDGE}" '
              f'stroke-width="7" opacity="0.85"/>')
        s.text(x, 26, "fold", size=10, fill="#FFFFFF", weight="800", anchor="middle")

    # ── title block, across the centre panel ──────────────────
    cx = wing + pad
    cw = W - 2 * wing - 2 * pad
    s.rect(cx, 34, cw, 112, fill=RIBBON, stroke=RIBBON_DK, sw=3, rx=26)
    s.leaf_sprig(cx + 26, 62, flip=1, scale=1.25)
    s.leaf_sprig(cx + cw - 26, 62, flip=-1, scale=1.25)
    s.text(cx + cw / 2, 84, "Robot Design:", size=37, weight="900", fill="#FFFFFF",
           anchor="middle", family=DISPLAY)
    s.text(cx + cw / 2, 114, "Small Robot, Big Decisions", size=21, weight="900",
           fill="#DDF0CC", anchor="middle", family=DISPLAY)
    # the kicker pill the real board puts under every title
    s.add(f'<rect x="{cx+cw/2-168:.0f}" y="126" width="336" height="28" rx="14" '
          f'fill="{NODE}" stroke="{RIBBON_DK}" stroke-width="2.5"/>')
    s.text(cx + cw / 2, 145, "BOT Builders · Team 300024 · BIOGLOW", size=13,
           weight="800", fill=INK, anchor="middle")
    # QR slot
    s.rect(cx + cw - 104, 164, 74, 74, fill=CARD, stroke=RIBBON_DK, sw=2.5, rx=12, dash="7 6")
    s.text(cx + cw - 67, 208, "QR", size=17, weight="900", anchor="middle",
           fill=MUTED, family=DISPLAY)

    # ── LEFT WING: the problem and the strategy ───────────────
    x = pad
    w = wing - 2 * pad
    y = s.heading(x, 44, w, "Our Missions", "The order we run them in", number=1)
    s.rect(x, y - 16, w, 104, fill=CARD, rx=12)
    y = s.wrap(x + 12, y + 2, "Five missions, one Level Up, two minutes thirty. Draw the order "
                     "you run them in and say why that order. The sequence is the "
                     "argument — the robot is only how you deliver it.", width=40)
    y += 26
    s.photo(x, y, w, 158, "mat-overview.jpg", "Our table, set up for a full run")
    y += 158 + 32
    y = s.heading(x, y, w, "Why This Order", "What we worked out", number=2)
    s.rect(x, y - 18, w, 112, fill=CARD, rx=12)
    for line in ["1.  Nearest first — cross the table once",
                 "2.  Heavy load last — arm hides sensor",
                 "3.  Token \u2014 park once, or cycle it?",
                 "4.  Fallback when a mission fails"]:
        s.text(x + 14, y + 4, line, size=13, weight="700")
        y += 25
    y += 22
    y = s.heading(x, y, w, "Our Driving Base", "Three versions, one survivor", number=3)
    s.photo(x, y, w, 120, "robot-side-view.jpg", "The base that won the argument")
    y += 120 + 44
    s.rect(x, y - 16, w, 92, fill=CARD, rx=12)
    s.wrap(x + 12, y + 2, "Label it: hub, two double motors, two single motors, two "
                 "colour sensors, wheel size. Rule 5 allows no more, and there "
                 "is no gyro — it counts wheel turns and trusts them.", width=40)

    # ── CENTRE: the robot, attachments, iteration ─────────────
    y = 238
    colw = (cw - 24) / 2
    y = s.heading(cx, y, cw, "Our Robot", "Part by part, on the mat", number=4)
    s.photo(cx, y, colw, 152, "robot-at-mission-model.jpg", "At the mission model it was built for")
    s.photo(cx + colw + 24, y, colw, 152, "attachment-lift.jpg", "The lift attachment, mid-run")
    y += 152 + 34

    y = s.heading(cx, y, cw, "How It Changed", "Test, learn, rebuild, repeat", number=5)
    # the iteration table: left column what we learned, right what we changed
    rows = [
        ("The base wandered on long runs", "Shorter runs between walls; square up on a wall, not on a guess"),
        ("Attachment had to line up exactly", "Added meshers so the tool registers against the model itself"),
        ("Swapping attachments cost seconds", "One mounting point, same two pins every time"),
        ("Battery level changed the distance", "Count rotations, not time — and charge before every match"),
    ]
    hdr_y = y
    s.rect(cx, y, cw, 32, fill=LIME, stroke=LINE, sw=3, rx=10)
    s.text(cx + 14, y + 22, "WHAT WE FOUND OUT", size=12, weight="900",
           fill=INK, family=DISPLAY, spacing="0.03em")
    s.text(cx + colw + 24, y + 22, "WHAT WE CHANGED", size=12, weight="900",
           fill=INK, family=DISPLAY, spacing="0.03em")
    y += 40
    for a, b in rows:
        s.rect(cx, y, cw, 42, fill=CARD, rx=10)
        s.wrap(cx + 12, y + 20, a, size=12, width=30, fill=INK, weight="700")
        s.wrap(cx + colw + 24, y + 20, b, size=12, width=38)
        y += 47
    _ = hdr_y

    y += 6
    y = s.heading(cx, y, cw, "The Numbers", "From real runs — never guessed", number=6)
    s.rect(cx, y, cw, 76, fill=CARD, rx=12)
    cols = ["Mission", "Tries", "Worked", "Seconds", "Points"]
    for i, c in enumerate(cols):
        s.text(cx + 16 + i * (cw - 32) / 5, y + 24, c, size=12, weight="800")
    for r in range(3):
        yy = y + 42 + r * 15
        s.add(f'<line x1="{cx+12}" y1="{yy}" x2="{cx+cw-12}" y2="{yy}" '
              f'stroke="{LINE}" stroke-width="1.5"/>')
    s.add(f'<rect x="{cx+12:.0f}" y="{y+52:.0f}" width="{cw-24:.0f}" height="20" '
          f'rx="6" fill="{NODE}"/>')
    s.text(cx + 20, y + 67, "A judge believes 11 of 15. Nobody believes \u201calmost always\u201d.",
           size=11, fill=INK, weight="800")

    # ── RIGHT WING: roles, team, next ─────────────────────────
    x = W - wing + pad
    y = s.heading(x, 44, w, "Four Roles, One Match", "Everyone works at once", number=7)
    for role, what in [("Driver", "moves the robot"),
                       ("Operator", "starts and stops the program"),
                       ("Technician", "swaps attachments"),
                       ("Specialist", "watches the clock and the plan")]:
        s.rect(x, y, w, 40, fill=CARD, rx=10)
        s.text(x + 12, y + 26, role, size=14, weight="800")
        s.text(x + w - 12, y + 26, what, size=11, fill=MUTED, weight="600", anchor="end")
        y += 46
    y += 10
    s.rect(x, y - 16, w, 76, fill=CARD, rx=12)
    s.wrap(x + 12, y + 2, "All four work at the same time. Write each name in — a judge asks, "
                 "and “we all did everything” is the wrong answer.", width=40)

    y += 72
    y = s.heading(x, y, w, "Our Team", "Every one of us built part of it", number=8)
    s.photo(x, y, w, 168, "team-with-mat.jpg", "Every one of us built part of this")
    y += 168 + 38

    y = s.heading(x, y, w, "What We Would Do Next", "The honest bit", number=9)
    s.rect(x, y - 16, w, 92, fill=CARD, rx=12)
    y = s.wrap(x + 12, y + 2, "Two honest sentences about what is still wrong with the robot. "
                     "Judges trust a team that can name its own weakest point far "
                     "more than one that says everything works.", width=40)
    y += 24
    s.rect(x, y, w, 86, fill=CARD, rx=12, dash="8 7")
    s.text(x + 14, y + 28, "Write it here, in pencil first", size=12, fill=MUTED, weight="700")

    # footer note
    s.text(W / 2, H - 4,
           "48 x 36 in tri-fold — wings 12 in, centre 24 in · print at 100%: every box is a real size",
           size=11, fill="#FFFFFF", weight="700", anchor="middle")
    return s.out()


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(build())
    print(f"wrote {OUT.relative_to(ROOT)}  ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
