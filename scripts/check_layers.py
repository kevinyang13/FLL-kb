#!/usr/bin/env python3
"""Enforce the layer rules in docs/v2/src.

SimCraft keeps its architecture honest with client/src/architecture.test.ts —
a forbidden import fails the test suite. This repo has no npm, so the same
rule lives here: each folder under src/ may import only from the layers listed
beside it, and main.js (the composition root) may import anything.

Run: python3 scripts/check_layers.py
"""
import re
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parent.parent / "docs" / "v2" / "src"

ALLOWED = {
    "data":        set(),
    "worldgen":    {"data"},
    "core":        {"data"},
    "rendering":   {"data", "worldgen"},
    "entities":    {"data", "core", "rendering", "worldgen"},
    "state":       {"data", "core"},
    "session":     set(),
    "persistence": {"core"},
    "input":       {"core"},
    "engine":      {"core", "data", "entities", "input", "persistence",
                    "rendering", "session", "state", "worldgen"},
    "ui":          {"core", "data", "input", "session", "state"},
}

IMPORT = re.compile(r"""^\s*import\s[^'"]*['"]([^'"]+)['"]""", re.M)


def layer_of(path: Path) -> str:
    rel = path.relative_to(SRC)
    return rel.parts[0] if len(rel.parts) > 1 else "<root>"


def main() -> int:
    problems = []
    for f in sorted(SRC.rglob("*.js")):
        layer = layer_of(f)
        if layer == "<root>":
            continue                      # main.js composes everything
        allowed = ALLOWED.get(layer)
        if allowed is None:
            problems.append(f"{f.relative_to(SRC)}: folder '{layer}' is not a declared layer")
            continue
        for spec in IMPORT.findall(f.read_text()):
            if not spec.startswith("."):
                continue                  # bare specifiers come from the import map
            target = (f.parent / spec).resolve()
            try:
                other = layer_of(target)
            except ValueError:
                problems.append(f"{f.relative_to(SRC)}: imports outside src/ — {spec}")
                continue
            if other in (layer, "<root>"):
                continue
            if other not in allowed:
                problems.append(
                    f"{f.relative_to(SRC)}: {layer} may not import {other} ({spec})")
            if not target.exists():
                problems.append(f"{f.relative_to(SRC)}: missing file — {spec}")

    if problems:
        print(f"{len(problems)} layer violation(s):")
        for p in problems:
            print("  " + p)
        return 1

    counted = sum(1 for _ in SRC.rglob("*.js"))
    print(f"layers ok — {counted} modules, {len(ALLOWED)} layers")
    return 0


if __name__ == "__main__":
    sys.exit(main())
