#!/usr/bin/env python3
"""Make print-ready QR cards for the outreach station.

Usage:
    python3 scripts/make_qr.py "https://forms.gle/abc123" "Tell us what you think"
    python3 scripts/make_qr.py "https://youtu.be/xyz" "Watch the video" --out video

Writes a PNG into docs/assets/qr/ sized for printing at roughly 10 cm square,
with the label underneath so nobody has to guess which code is which.

Requires: segno, pillow   →   python3 -m pip install --user segno pillow
"""

import argparse
import sys
from pathlib import Path

try:
    import segno
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("Install the two libraries first:\n"
             "    python3 -m pip install --user segno pillow")

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "docs" / "assets" / "qr"

# 300 dpi × 4 inches ≈ 1200 px, which prints cleanly at about 10 cm
CARD = 1200
QUIET = 4          # quiet zone in modules — below 4 some scanners fail
LABEL_H = 190
INK = (16, 26, 22)
PAPER = (255, 255, 255)


def pick_font(size):
    for path in ("/System/Library/Fonts/Supplemental/Arial Bold.ttf",
                 "/System/Library/Fonts/Helvetica.ttc",
                 "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def make(url, label, stem):
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # error correction H survives a scuffed, taped-down print card
    qr = segno.make(url, error="h")
    tmp = OUT_DIR / f".{stem}.tmp.png"
    qr.save(tmp, scale=40, border=QUIET, dark="#101A16", light="#FFFFFF")

    code = Image.open(tmp).convert("RGB").resize((CARD, CARD), Image.NEAREST)
    tmp.unlink()

    card = Image.new("RGB", (CARD, CARD + LABEL_H), PAPER)
    card.paste(code, (0, 0))

    draw = ImageDraw.Draw(card)
    font = pick_font(88)
    box = draw.textbbox((0, 0), label, font=font)
    draw.text(((CARD - (box[2] - box[0])) / 2, CARD + 30), label, font=font, fill=INK)

    path = OUT_DIR / f"qr-{stem}.png"
    card.save(path, dpi=(300, 300))
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("label", nargs="?", default="Scan me")
    ap.add_argument("--out", default="survey", help="file stem, e.g. survey or video")
    a = ap.parse_args()

    if not a.url.startswith(("http://", "https://")):
        sys.exit("URL must start with http:// or https://")

    path = make(a.url, a.label, a.out)
    print(f"wrote {path.relative_to(ROOT)}")
    print("Print it at about 10 cm square, then scan it from across a table before the event.")


if __name__ == "__main__":
    main()
