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

    def wrap(self, x, y, s, size=10.5, width=46, lh=1.42, fill=MUTED, weight="400"):
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
        self.text(x, y + h + 13, caption, size=9.5, fill=MUTED, weight="700")

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
        h = 42 if kicker else 32
        self.add(f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h}" rx="{h/2:.0f}" '
                 f'fill="{RIBBON}" stroke="{RIBBON_DK}" stroke-width="2.5"/>')
        tx = x + 18
        if number is not None:
            cy = y + (22 if kicker else h / 2)
            self.add(f'<circle cx="{x+24:.0f}" cy="{cy:.0f}" r="11" fill="#FFFFFF" '
                     f'stroke="{RIBBON_DK}" stroke-width="2.5"/>')
            self.text(x + 26, cy + 4, str(number), size=12, weight="900", fill=RIBBON_DK,
                      anchor="middle", family=DISPLAY)
            tx = x + 42
        self.text(tx, y + (21 if kicker else h / 2 + 5), title, size=13, weight="900",
                  fill="#FFFFFF", family=DISPLAY)
        if kicker:
            self.text(tx, y + 35, kicker, size=9.5, fill="#DDF0CC", weight="700")
        self.leaf_sprig(x + w - 14, y + h / 2 + 4, flip=-1, scale=0.7)
        return y + h + 11

    def out(self):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" '
                f'xmlns:xlink="http://www.w3.org/1999/xlink" '
                f'viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
                f'<rect width="{W}" height="{H}" fill="{PAPER}"/>'
                + "".join(self.parts) + "</svg>")


def build():
    s = Svg()
    wing = WING_IN * PX
    pad = 20

    # the black trifold edge the real board has, and the two folds
    s.add(f'<rect x="0" y="0" width="{W}" height="{H}" rx="10" fill="none" '
          f'stroke="{EDGE}" stroke-width="18"/>')
    for x in (wing, W - wing):
        s.add(f'<line x1="{x}" y1="9" x2="{x}" y2="{H-9}" stroke="{EDGE}" '
              f'stroke-width="7" opacity="0.85"/>')
        s.text(x, 24, "fold", size=9, fill="#FFFFFF", weight="800", anchor="middle")

    cx = wing + pad
    cw = W - 2 * wing - 2 * pad
    colw = (cw - 20) / 2

    # ── title banner ─────────────────────────────────────────
    s.rect(cx, 30, cw, 96, fill=RIBBON, stroke=RIBBON_DK, sw=3, rx=24)
    s.leaf_sprig(cx + 24, 56, flip=1, scale=1.1)
    s.leaf_sprig(cx + cw - 24, 56, flip=-1, scale=1.1)
    s.text(cx + cw / 2, 72, "Robot Design:", size=31, weight="900", fill="#FFFFFF",
           anchor="middle", family=DISPLAY)
    s.text(cx + cw / 2, 96, "Small Robot, Big Decisions", size=17, weight="900",
           fill="#DDF0CC", anchor="middle", family=DISPLAY)
    s.add(f'<rect x="{cx+cw/2-150:.0f}" y="104" width="300" height="24" rx="12" '
          f'fill="{NODE}" stroke="{RIBBON_DK}" stroke-width="2.5"/>')
    s.text(cx + cw / 2, 120, "BOT Builders \u00b7 Team 300024 \u00b7 BIOGLOW", size=11,
           weight="800", fill=INK, anchor="middle")

    # ══════════════ LEFT WING — missions and sequences ═══════
    x = pad
    w = wing - 2 * pad
    y = s.heading(x, 40, w, "Mission Design", "What we go for, and in what order", number=1)
    s.rect(x, y - 12, w, 86, fill=CARD, rx=12)
    y = s.wrap(x + 10, y + 2,
               "Five missions, one Level Up, 2:30 on the clock. We split the work into "
               "three sequences so two of us can run tools at once instead of queueing "
               "for one robot.", width=48)
    y += 16

    s.photo(x, y, w, 118, "mat-overview.jpg", "Our table, set up for a full run")
    y += 118 + 28

    SEQ = [
        ("Sequence 1 \u2014 the park route",
         "Young Forest \u2192 Nest \u2192 Hollow Tree",
         "M01 pays 20 a token for keystone species parked in a microbiome, three to a "
         "microbiome. M04 opens the nest and the hollow tree to release them. One "
         "attachment, one loop, run under program.",
         "Cheryl \u00b7 Lola"),
        ("Sequence 2 \u2014 the cycle route",
         "Cave Waterfall \u00d7 50 loops",
         "M03 pays 5 every time a token goes through the waterfall \u2014 and it comes "
         "back. 50 cycles is the biggest points pool on the table. Lift tower, one-way "
         "door grabber, a rope loop.",
         "Kyle \u00b7 Lindsey \u00b7 Kei"),
        ("Sequence 3 \u2014 the Operator tool",
         "Launcher into the Grand Tree",
         "M02 Roots of Renewal: resources cycled up the tree, 5 a time at the base and "
         "more in the canopy. The grand tree motor is the Specialist\u2019s, so this one "
         "never stops the driving base.",
         "Specialist \u00b7 Operator"),
    ]
    for title, route, why, who in SEQ:
        s.rect(x, y, w, 130, fill=CARD, rx=12)
        s.text(x + 10, y + 19, title, size=11, weight="900", fill=RIBBON_DK, family=DISPLAY)
        s.add(f'<rect x="{x+8:.0f}" y="{y+26:.0f}" width="{w-16:.0f}" height="19" rx="9" fill="{LIME}"/>')
        s.text(x + 14, y + 39, route, size=10.5, weight="800", fill=INK)
        s.wrap(x + 10, y + 59, why, size=9.5, width=50)
        s.text(x + w - 10, y + 122, who, size=9, weight="800", fill=RIBBON_DK, anchor="end")
        y += 138

    s.add(f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="34" rx="10" fill="{NODE}"/>')
    s.wrap(x + 10, y + 14, "Still to measure: how long one waterfall loop takes. That "
                           "number picks the sequence we run.", size=9.5, width=52, fill=INK, weight="800")

    # ══════════════ CENTRE — final design, then iterations ═══
    y = 148
    y = s.heading(cx, y, cw, "Our Final Design", "v4 \u2014 one chassis, two jobs", number=2)
    s.photo(cx, y, colw, 112, "robot-v4-base.jpg", "The bare chassis \u2014 gears ready at the corner")
    s.photo(cx + colw + 20, y, colw, 112, "robot-v4-waterfall.jpg", "Wearing the waterfall lift, at the model")
    y += 112 + 24

    FEATURES = [
        ("One chassis, two jobs", "Double and single motor on one base, with a gear take-off. Both attachments bolt to it."),
        ("Meshers", "Shaped to fit the tree, waterfall and nest. The tool locks on, so we only have to get close."),
        ("Three identical bases", "One per kit, so two projects build and test at once."),
        ("Small, light, sticky wheels", "It stops where it was told, and a counted rotation is a real one."),
    ]
    fw = (cw - 14) / 2
    for i, (title, body) in enumerate(FEATURES):
        fx = cx + (i % 2) * (fw + 14)
        fy = y + (i // 2) * 56
        s.rect(fx, fy, fw, 50, fill=CARD, rx=10)
        s.text(fx + 11, fy + 17, title, size=10.5, weight="900", fill=RIBBON_DK)
        s.wrap(fx + 11, fy + 31, body, size=9, width=56)
    y += 2 * 56

    y += 4
    y = s.heading(cx, y, cw, "How We Got Here", "Four robots \u2014 each died of something specific", number=3)

    ITER = [
        (["robot-v1.jpg"], "v1 \u00b7 16 Aug", "Hand-driven launcher",
         "No control \u2014 it tipped, and a launcher scatters", "Go wide, low, heavy"),
        (["robot-v2.jpg"], "v2 \u00b7 6 Sep", "Big base + ramp \u00b7 210",
         "A ramp cannot count, and the base ate the margin", "Shrink it; carry 6, release 3"),
        (["robot-v3.jpg", "robot-v3-waterfall.jpg"], "v3 \u00b7 13 Sep", "Small base, two tools",
         "Same code, different end point. No gyro", "Slow down, grip, Driver nudges"),
        (["robot-v4-base.jpg", "robot-v4-waterfall.jpg"], "v4 \u00b7 4 Oct", "One chassis + gears",
         "Driving will never be exact", "Meshers \u2014 the tool forgives it"),
    ]
    s.rect(cx, y, cw, 26, fill=LIME, stroke=LINE, sw=2.5, rx=9)
    for lx, label in ((cx + 12, "THE ROBOT"), (cx + 232, "WHAT WENT WRONG"), (cx + 430, "WHAT WE CHANGED")):
        s.text(lx, y + 18, label, size=10, weight="900", fill=INK, family=DISPLAY, spacing="0.03em")
    y += 32

    TW, TH = 48, 38
    for shots, ver, built, wrong, change in ITER:
        s.rect(cx, y, cw, 46, fill=CARD, rx=10)
        for i, shot in enumerate(shots):
            tx = cx + 7 + i * (TW + 4)
            s.add(f'<image href="{data_uri(shot, TW, TH)}" x="{tx:.0f}" y="{y+4:.0f}" '
                  f'width="{TW}" height="{TH}" preserveAspectRatio="xMidYMid slice"/>')
            s.rect(tx, y + 4, TW, TH, stroke=LINE, sw=1.8, rx=5)
        s.text(cx + 124, y + 20, ver, size=10, weight="900", fill=RIBBON_DK)
        s.text(cx + 124, y + 33, built, size=9, fill=MUTED, weight="600")
        s.wrap(cx + 232, y + 20, wrong, size=9.5, width=28)
        s.wrap(cx + 430, y + 20, change, size=9.5, width=26)
        y += 50

    y += 2
    s.add(f'<rect x="{cx:.0f}" y="{y:.0f}" width="{cw:.0f}" height="26" rx="9" fill="{NODE}"/>')
    s.text(cx + 12, y + 17, "We stopped trying to make the driving perfect, and made the tool "
                            "forgiving instead.", size=10.5, weight="800", fill=INK)
    y += 32

    y = s.heading(cx, y, cw, "What It Scores", "From real runs \u2014 never guessed", number=4)
    s.rect(cx, y, cw, 104, fill=CARD, rx=12)
    heads = ["Sequence", "Tries", "Worked", "Seconds", "Points"]
    for i, h_ in enumerate(heads):
        s.text(cx + 16 + i * (cw - 32) / 5, y + 20, h_, size=10, weight="900",
               fill=RIBBON_DK, family=DISPLAY)
    for r, name in enumerate(["1 \u00b7 Park route", "2 \u00b7 Waterfall \u00d7 50", "3 \u00b7 Grand tree"]):
        ry = y + 42 + r * 20
        s.text(cx + 16, ry, name, size=9.5, weight="700", fill=INK)
        s.add(f'<line x1="{cx+12}" y1="{ry+7}" x2="{cx+cw-12}" y2="{ry+7}" '
              f'stroke="{LINE}" stroke-width="1.5"/>')
    s.text(cx + 16, y + 97, "A judge believes 11 of 15. Nobody believes \u201calmost always\u201d.",
           size=9.5, weight="800", fill=AMBER)

    # ══════════════ RIGHT WING — team and journey ════════════
    x = W - wing + pad
    y = s.heading(x, 40, w, "Our Team", "Five of us, four jobs at once", number=4)
    s.photo(x, y, w, 118, "team-with-mat.jpg", "Every one of us built part of this")
    y += 118 + 26

    for role, what in [("Driver", "moves the robot"),
                       ("Operator", "starts and stops the program"),
                       ("Technician", "swaps the attachments"),
                       ("Specialist", "grand tree, clock, plan")]:
        s.rect(x, y, w, 30, fill=CARD, rx=9)
        s.text(x + 10, y + 20, role, size=11, weight="900", fill=RIBBON_DK)
        s.text(x + w - 10, y + 20, what, size=9, fill=MUTED, weight="700", anchor="end")
        y += 34
    y += 6
    s.rect(x, y - 12, w, 52, fill=CARD, rx=12)
    y = s.wrap(x + 10, y + 2, "All four roles work at the same time. Write each name in \u2014 "
                              "a judge asks, and \u201cwe all did everything\u201d is the wrong answer.",
               size=9.5, width=50)
    y += 18

    y = s.heading(x, y, w, "Our Journey", "Twenty-five Sundays", number=5)
    JOURNEY = [
        ("16 Aug", "Field built. First five runs at 2:30"),
        ("6 Sep", "First real score, then 210 the next day"),
        ("13 Sep", "Three decisions: small base, dispenser, drive on program"),
        ("20 Sep", "Split into three projects, two running at once"),
        ("4 Oct", "Three identical bases \u2014 and meshers"),
        ("22 Nov", "Everything finished. Mock judging"),
        ("17 Jan", "Competition \u2014 game and judging"),
    ]
    for when, what in JOURNEY:
        s.add(f'<circle cx="{x+9:.0f}" cy="{y+9:.0f}" r="4.5" fill="{RIBBON}"/>')
        s.text(x + 20, y + 12, when, size=9.5, weight="900", fill=RIBBON_DK)
        s.wrap(x + 66, y + 12, what, size=9, width=36)
        y += 30

    y += 4
    y = s.heading(x, y, w, "What We Would Do Next", "The honest bit", number=6)
    s.rect(x, y, w, 70, fill=CARD, rx=12, dash="8 7")
    s.text(x + 10, y + 20, "Write it here, in pencil first", size=10, fill=MUTED, weight="700")
    s.wrap(x + 10, y + 38, "Two sentences about what is still wrong with the robot. "
                           "Judges trust a team that names its own weakest point.",
           size=9, width=52)

    s.text(W / 2, H - 4,
           "48 x 36 in tri-fold \u2014 wings 12 in, centre 24 in \u00b7 print at 100%: every box is a real size",
           size=10, fill="#FFFFFF", weight="700", anchor="middle")
    return s.out()


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(build())
    print(f"wrote {OUT.relative_to(ROOT)}  ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
