#!/usr/bin/env python3
"""
Start a new piece in one command.

    python3 tools/new.py art "Untitled No. 05"
    python3 tools/new.py photography "Night Trains"
    python3 tools/new.py writing "A Short Essay"
    python3 tools/new.py sidequests "Learning All the Flags"

It will:
  • create the Markdown file from the template in _templates/ (with today's date filled in)
  • create the matching, empty image folder  assets/images/<type>/<slug>/
  • print where to drop your images

The file name (the "slug") is made from the title and becomes the URL.
You can override it with  --slug my-own-name .
"""
import argparse
import datetime
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KINDS = {"art": "_art", "photography": "_photography", "writing": "_writing", "sidequests": "_sidequests"}


def slugify(text):
    text = text.lower().replace("'", "").replace("’", "")
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text or "untitled"


def main():
    ap = argparse.ArgumentParser(description="Create a new Anemoia piece from a template.")
    ap.add_argument("kind", choices=KINDS.keys())
    ap.add_argument("title")
    ap.add_argument("--slug", help="override the URL name")
    args = ap.parse_args()

    slug = args.slug or slugify(args.title)
    folder = ROOT / KINDS[args.kind]
    target = folder / f"{slug}.md"
    if target.exists():
        sys.exit(f"{target.relative_to(ROOT)} already exists — pick a different title or --slug.")

    text = (ROOT / "_templates" / f"{args.kind}.md").read_text(encoding="utf-8")
    today = datetime.date.today().isoformat()
    title = args.title.replace('"', '\\"')
    text = text.replace("title: TITLE", f'title: "{title}"').replace("title: QUEST TITLE", f'title: "{title}"')
    text = text.replace("title: SERIES TITLE", f'title: "{title}"')
    text = text.replace("YYYY-MM-DD", today, 1)  # the first one is the main date

    folder.mkdir(exist_ok=True)
    target.write_text(text, encoding="utf-8")
    images = ROOT / "assets" / "images" / args.kind / slug
    images.mkdir(parents=True, exist_ok=True)
    (images / ".gitkeep").touch()

    print(f"Created  {target.relative_to(ROOT)}")
    print(f"Images → {images.relative_to(ROOT)}/")
    print(f"URL    → /{args.kind}/{slug}/")
    print("\nNext: edit the file, add images, then run  python3 tools/check.py")


if __name__ == "__main__":
    main()
