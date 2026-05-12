#!/usr/bin/env python3
"""
Download LEGO Education CS lesson JSON files.

Fetches all lessons from the lessons index page, extracts the PIN from each
lesson page, downloads the project JSON from code.legoeducation.com, and saves
as raw/extracted/<pin>-<lesson-name>.json. Lessons without a PIN are skipped.
"""

import json
import re
import time
from pathlib import Path

import requests

LESSONS_URL = (
    "https://teach.legoeducation.com/en-us/computer-science/lessons"
    "?grade-band=blt208ea26397de2978&grade=bltfb4655617fe48722"
)
LESSON_BASE = "https://teach.legoeducation.com/en-us/computer-science/lesson"
CONTENT_BASE = "https://code.legoeducation.com/content/en-us"
OUT_DIR = Path("raw/extracted")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

DELAY = 0.5  # seconds between requests


def get_lesson_slugs(session: requests.Session) -> list[tuple[str, str]]:
    """Return list of (lesson_id, slug) from the lessons index page."""
    resp = session.get(LESSONS_URL, headers=HEADERS, timeout=30)
    resp.raise_for_status()

    # Lesson data is embedded in Next.js RSC payload with backslash-escaped quotes.
    # In resp.text, fields appear as: \"lesson_id\":\"CS:B102\" (one backslash before each quote)
    pairs = re.findall(
        r'\\"lesson_id\\":\\"(CS:[^\\"]+)\\"'
        r'.{0,300}?'
        r'\\"url\\":\\"(/[a-z][a-z0-9-]*)\\"',
        resp.text,
    )
    return pairs


def get_pin(session: requests.Session, slug: str) -> str | None:
    """Fetch lesson page and extract 4-digit PIN, or None if not present."""
    url = f"{LESSON_BASE}{slug}"
    resp = session.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()

    m = re.search(r'lesson_pin[\\\":\s]+(\d{4})', resp.text)
    return m.group(1) if m else None


def download_json(session: requests.Session, pin: str) -> dict:
    """Download lesson JSON from code.legoeducation.com."""
    url = f"{CONTENT_BASE}/{pin}.json"
    resp = session.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    return resp.json()


def slugify(text: str) -> str:
    """Convert headline to filename-safe slug."""
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    session = requests.Session()

    print("Fetching lesson list...")
    lessons = get_lesson_slugs(session)
    print(f"Found {len(lessons)} lessons\n")

    skipped = []
    downloaded = []
    errors = []

    for lesson_id, slug in lessons:
        label = f"{lesson_id} ({slug})"
        print(f"  {label}...", end=" ", flush=True)

        try:
            pin = get_pin(session, slug)
            if not pin:
                print("skip (no PIN)")
                skipped.append(label)
                time.sleep(DELAY)
                continue

            data = download_json(session, pin)

            headline = data.get("headline") or slug.lstrip("/")
            name = slugify(headline)
            filename = f"{pin}-{name}.json"
            out_path = OUT_DIR / filename

            out_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
            print(f"OK -> {filename}")
            downloaded.append(filename)

        except Exception as exc:
            print(f"ERROR: {exc}")
            errors.append((label, str(exc)))

        time.sleep(DELAY)

    print(f"\nDone. Downloaded: {len(downloaded)}, Skipped: {len(skipped)}, Errors: {len(errors)}")
    if skipped:
        print(f"Skipped (no PIN): {', '.join(skipped)}")
    if errors:
        print("Errors:")
        for label, err in errors:
            print(f"  {label}: {err}")


if __name__ == "__main__":
    main()
