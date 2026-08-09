#!/usr/bin/env python3
"""Render wiki/*.md into docs/wiki/*.html in the BIOGLOW theme.

The wiki lives at the repo root (CLAUDE.md requires it) but GitHub Pages
publishes only docs/, so every page has to be rendered into docs/wiki/ for
the site's links to resolve. Run after editing any wiki page:

    python3 scripts/build_site.py
"""

import re
import shutil
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent.parent
WIKI = ROOT / "wiki"
OUT = ROOT / "docs" / "wiki"

# Pages that describe a season we are no longer competing in.
ARCHIVE = {"submerged-missions", "submerged-solutions", "solution-m01-coral-nursery"}

CSS = """
:root{--ink:#14231F;--panel:#1B2E28;--stroke:#0A120F;--lime:#B8DC7E;--leaf:#3E8A33;
--cream:#EFD9B4;--node:#FFD233;--on-lime:#101A16;--text:#E4EEDC;--muted:#92A98A;
--accent:#B8DC7E;--rule:rgba(146,169,138,.22)}
@media(prefers-color-scheme:light){:root:not([data-theme=dark]){--ink:#EFE7D4;--panel:#fff;
--leaf:#2F6B26;--text:#101A16;--muted:#5A6B54;--accent:#2F6B26;--rule:rgba(16,26,22,.14)}}
:root[data-theme=light]{--ink:#EFE7D4;--panel:#fff;--leaf:#2F6B26;--text:#101A16;
--muted:#5A6B54;--accent:#2F6B26;--rule:rgba(16,26,22,.14)}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:var(--ink);
color:var(--text);line-height:1.65;padding:0 1.25rem 4rem}
.display{font-family:'Arial Rounded MT Bold','Helvetica Rounded','Trebuchet MS',system-ui,sans-serif;
font-weight:900;letter-spacing:-.015em;text-transform:uppercase;line-height:.95}
.shell{max-width:820px;margin:0 auto}
a{color:var(--accent);text-decoration:none;font-weight:600}
a:hover{text-decoration:underline}
a:focus-visible{outline:3px solid var(--node);outline-offset:3px;border-radius:4px}
/* top bar */
.bar{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;
padding:1.25rem 0;margin-bottom:1.5rem;border-bottom:3px solid var(--stroke)}
.crumb{font-size:.78rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.crumb a{color:var(--accent)}
.spacer{flex:1}
.pill{border:2px solid var(--stroke);background:var(--panel);border-radius:999px;
padding:.25rem .8rem;font-size:.75rem;font-weight:700;color:var(--text);cursor:pointer;font-family:inherit}
.pill:hover{background:var(--lime);color:var(--on-lime)}
/* archive banner */
.arch{background:var(--cream);color:#33402E;border:3px solid var(--stroke);border-radius:14px;
padding:.9rem 1.15rem;margin-bottom:1.5rem;font-size:.87rem}
.arch strong{color:var(--on-lime)}
/* content */
h1{font-size:clamp(1.8rem,5vw,2.7rem);margin:.2rem 0 1rem;color:var(--text);
font-family:'Arial Rounded MT Bold','Helvetica Rounded','Trebuchet MS',system-ui,sans-serif;
font-weight:900;letter-spacing:-.015em;line-height:1.03;text-wrap:balance}
h2{font-size:1.3rem;margin:2.2rem 0 .7rem;padding-bottom:.35rem;color:var(--text);
border-bottom:2px solid var(--rule);font-family:'Arial Rounded MT Bold','Trebuchet MS',system-ui,sans-serif;
font-weight:900;letter-spacing:-.01em;text-wrap:balance}
h3{font-size:1.02rem;margin:1.5rem 0 .5rem;color:var(--accent);font-weight:800}
h4{font-size:.92rem;margin:1.1rem 0 .4rem;color:var(--text);font-weight:800}
p{margin:.7rem 0}
ul,ol{margin:.7rem 0 .7rem 1.3rem}
li{margin:.28rem 0}
li::marker{color:var(--leaf)}
strong{color:var(--text);font-weight:700}
em{color:var(--muted)}
hr{border:none;border-top:3px solid var(--stroke);margin:2rem 0;border-radius:2px}
blockquote{border-left:4px solid var(--leaf);background:var(--panel);border-radius:0 12px 12px 0;
padding:.8rem 1.1rem;margin:1.1rem 0;color:var(--muted);font-size:.9rem}
blockquote strong{color:var(--accent)}
blockquote p{margin:.3rem 0}
code{background:var(--panel);border:1px solid var(--rule);border-radius:5px;
padding:.1rem .35rem;font-size:.85em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--accent)}
pre{background:var(--panel);border:3px solid var(--stroke);border-radius:14px;
padding:1rem;overflow-x:auto;margin:1.1rem 0}
pre code{background:none;border:none;padding:0;color:var(--text);font-size:.83rem;line-height:1.55}
.tw{overflow-x:auto;border:3px solid var(--stroke);border-radius:14px;background:var(--panel);margin:1.1rem 0}
table{width:100%;border-collapse:collapse;font-size:.85rem;min-width:min(100%,460px)}
th{background:var(--stroke);color:var(--lime);text-align:left;padding:.55rem .8rem;
font-size:.68rem;letter-spacing:.09em;text-transform:uppercase;white-space:nowrap}
td{padding:.5rem .8rem;border-bottom:2px solid var(--rule);color:var(--muted);vertical-align:top}
tr:last-child td{border-bottom:none}
td strong{color:var(--text)}
/* related-pages chips */
.related{margin-top:2.5rem;padding-top:1.2rem;border-top:3px solid var(--stroke)}
.related h2{border:none;margin:0 0 .7rem;font-size:1rem}
.chips{display:flex;flex-wrap:wrap;gap:.5rem;list-style:none;margin:0}
.chips li{margin:0}
.chips a{display:inline-block;border:2px solid var(--stroke);background:var(--panel);
border-radius:999px;padding:.28rem .8rem;font-size:.8rem}
.chips a:hover{background:var(--lime);color:var(--on-lime);text-decoration:none}
footer{max-width:820px;margin:2.5rem auto 0;padding-top:1.2rem;border-top:3px solid var(--stroke);
font-size:.75rem;color:var(--muted);text-align:center}
"""

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — BOT Builders</title>
<style>{css}</style>
</head>
<body>
<div class="shell">
  <nav class="bar">
    <span class="crumb"><a href="../">BOT Builders</a> / <a href="index.html">Wiki</a></span>
    <span class="spacer"></span>
    <button class="pill" onclick="tt()">◐ Theme</button>
  </nav>
  {banner}
  {body}
  {related}
</div>
<footer>BOT Builders · FIRST<sup>&reg;</sup> LEGO<sup>&reg;</sup> League BIOGLOW&trade; 2026&ndash;2027 ·
<a href="../">Home</a> · <a href="index.html">Wiki index</a></footer>
<script>
function tt(){{var r=document.documentElement,
d=r.getAttribute('data-theme')==='dark'||(!r.hasAttribute('data-theme')&&
matchMedia('(prefers-color-scheme: dark)').matches);
r.setAttribute('data-theme',d?'light':'dark');}}
</script>
</body>
</html>
"""

ARCHIVE_BANNER = (
    '<div class="arch"><strong>Archive — 2024-2025 season.</strong> SUBMERGED is not the current '
    'challenge. The team competes in <a href="bioglow-season.html">BIOGLOW</a> (2026-2027). This page is '
    'kept as build-and-code practice reference; its missions and point values do not apply to BIOGLOW.'
    "</div>"
)


def strip_front_matter(text):
    """Return (title, body) with YAML front matter removed."""
    title = None
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            fm = text[3:end]
            m = re.search(r"^title:\s*(.+)$", fm, re.M)
            if m:
                title = m.group(1).strip()
            text = text[end + 4 :].lstrip("\n")
    return title, text


def build():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    slugs = {p.stem for p in WIKI.glob("*.md")}
    built = []

    for path in sorted(WIKI.glob("*.md")):
        slug = path.stem
        raw = path.read_text(encoding="utf-8")
        fm_title, body = strip_front_matter(raw)

        # Drop the duplicated markdown archive banner; the styled one replaces it.
        body = re.sub(r"^> \*\*Archive — 2024-2025 season\.\*\*.*?\n", "", body, flags=re.M)

        # Resolve [[wiki-links]] -> real anchors. Unknown targets render as
        # plain text so a dangling link never becomes a 404.
        def link(m):
            target = m.group(1).strip()
            label = target.replace("-", " ")
            if target in slugs:
                return f'<a href="{target}.html">{label}</a>'
            return f'<span class="missing">{label}</span>'

        body = re.sub(r"\[\[([^\]]+)\]\]", link, body)

        html = markdown.markdown(
            body, extensions=["tables", "fenced_code", "sane_lists", "attr_list"]
        )
        html = html.replace("<table>", '<div class="tw"><table>').replace(
            "</table>", "</table></div>"
        )

        # Pull the trailing "Related pages" list out into chips.
        related = ""
        m = re.search(
            r"<h2>Related [Pp]ages</h2>\s*<ul>(.*?)</ul>", html, re.S
        )
        if m:
            items = re.findall(r"<li>(.*?)</li>", m.group(1), re.S)
            chips = "".join(f"<li>{i.strip()}</li>" for i in items)
            related = (
                f'<div class="related"><h2 class="display">Related pages</h2>'
                f'<ul class="chips">{chips}</ul></div>'
            )
            html = html[: m.start()] + html[m.end() :]

        title = fm_title or slug.replace("-", " ").title()
        page = PAGE.format(
            title=title,
            css=CSS,
            banner=ARCHIVE_BANNER if slug in ARCHIVE else "",
            body=html,
            related=related,
        )
        (OUT / f"{slug}.html").write_text(page, encoding="utf-8")
        built.append(slug)

    print(f"built {len(built)} pages -> {OUT.relative_to(ROOT)}")
    return built


if __name__ == "__main__":
    build()
