#!/usr/bin/env python3
"""
Anemoia content checker — run it before you push:

    python3 tools/check.py

It reads every Markdown file in _art, _photography, _writing and _sidequests and tells you,
in plain language, about anything that would make a page look broken:
missing required fields, images that don't exist, bad dates, unknown writing types,
broken `related:` links, and dates in the future (Jekyll hides those).

Needs PyYAML:   pip install pyyaml
Exit code is 1 if there are errors (warnings don't fail it).
"""
import datetime
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.exit("PyYAML is needed:  pip install pyyaml")

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "images"

REQUIRED = {
    "_art": ["title", "date", "image", "alt"],
    "_photography": ["title", "date", "images"],
    "_writing": ["title", "date", "type"],
    "_sidequests": ["title", "date"],
}
# Sidequest status keys / writing types come from the data files so this never goes stale.
types = {t["key"] for t in yaml.safe_load((ROOT / "_data/writing_types.yml").read_text()) or []}
statuses = set((yaml.safe_load((ROOT / "_data/quest_status.yml").read_text()) or {}).keys())

errors, warnings = [], []
all_files = {}


def front_matter(path):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", text, re.S)
    if not m:
        return None, text
    return (yaml.safe_load(m.group(1)) or {}), m.group(2)


def as_date(v):
    if isinstance(v, datetime.datetime):
        return v.date()
    if isinstance(v, datetime.date):
        return v
    if isinstance(v, str):
        try:
            return datetime.date.fromisoformat(v[:10])
        except ValueError:
            return None
    return None


def image_exists(folder, ref):
    if not ref:
        return True
    ref = str(ref)
    if ref.startswith("http://") or ref.startswith("https://"):
        return True
    p = ROOT / ref.lstrip("/") if ref.startswith("/") else IMG / folder / ref
    return p.exists()


def images_in(fm):
    """Yield (field, filename) for every image reference in a piece."""
    for key in ("image", "image_full", "cover_image"):
        if fm.get(key):
            yield key, fm[key]
    for step in fm.get("process_images") or []:
        if isinstance(step, dict):
            for k in ("file", "full"):
                if step.get(k):
                    yield "process_images." + k, step[k]
        else:
            yield "process_images", step
    for im in fm.get("images") or []:
        if isinstance(im, dict):
            for k in ("file", "full"):
                if im.get(k):
                    yield "images." + k, im[k]
        else:
            yield "images", im


today = datetime.date.today()
for coll, req in REQUIRED.items():
    folder = ROOT / coll
    if not folder.exists():
        continue
    for path in sorted(folder.glob("*.md")):
        rel = f"{coll}/{path.name}"
        slug = path.stem
        all_files[rel] = True
        fm, body = front_matter(path)
        if fm is None:
            errors.append(f"{rel}: no front matter (the --- block at the top)")
            continue
        for field in req:
            if not fm.get(field):
                errors.append(f"{rel}: missing required field '{field}'")
        if re.match(r"^\d{4}-\d{2}-\d{2}-", path.stem):
            warnings.append(f"{rel}: file name starts with a date — the URL will include it. Name files without dates.")
        if path.stem != path.stem.lower() or " " in path.stem:
            warnings.append(f"{rel}: use lowercase letters, numbers and hyphens in file names")
        d = as_date(fm.get("date"))
        if fm.get("date") and d is None:
            errors.append(f"{rel}: date '{fm.get('date')}' isn't YYYY-MM-DD")
        elif d and d > today:
            warnings.append(f"{rel}: dated {d} — in the future, so Jekyll will NOT publish it until then")
        e = as_date(fm.get("end_date"))
        if fm.get("end_date") and e is None:
            errors.append(f"{rel}: end_date '{fm.get('end_date')}' isn't YYYY-MM-DD")
        if coll == "_writing" and fm.get("type") and fm["type"] not in types:
            errors.append(f"{rel}: type '{fm['type']}' not found in _data/writing_types.yml (known: {', '.join(sorted(types))})")
        if coll == "_sidequests" and fm.get("status") and fm["status"] not in statuses:
            errors.append(f"{rel}: status '{fm['status']}' not in _data/quest_status.yml (known: {', '.join(sorted(statuses))})")
        if fm.get("tags") is not None and not isinstance(fm["tags"], list):
            errors.append(f"{rel}: tags must be a list, e.g.  tags: [dhaka, rain]")
        for t in fm.get("tags") or []:
            if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", str(t)):
                warnings.append(f"{rel}: tag '{t}' — prefer lowercase-with-hyphens so tags don't split in two")
        coll_name = coll.lstrip("_")
        for field, ref in images_in(fm):
            if not image_exists(f"{coll_name}/{slug}", ref):
                errors.append(f"{rel}: {field} '{ref}' not found in assets/images/{coll_name}/{slug}/")
        for im in fm.get("images") or []:
            if isinstance(im, dict) and not im.get("alt"):
                warnings.append(f"{rel}: image '{im.get('file')}' has no alt text")
            elif not isinstance(im, dict):
                errors.append(f"{rel}: each entry in images: needs 'file:' (and ideally 'alt:' and 'caption:')")
        if fm.get("featured") is not None and not isinstance(fm.get("featured"), bool):
            errors.append(f"{rel}: featured must be true or false")
        # images used inside the body via the figure include
        for src in re.findall(r'include figure\.html[^%]*?src="([^"]+)"', body):
            if not image_exists(f"{coll_name}/{slug}", src):
                errors.append(f"{rel}: figure image '{src}' not found in assets/images/{coll_name}/{slug}/")
        for tgt in re.findall(r'include (?:link|ref)\.html[^%]*?to="([^"]+)"', body):
            fm.setdefault("_body_links", []).append(tgt)
        fm["_path"] = rel
        all_files[rel] = fm

for rel, fm in list(all_files.items()):
    if not isinstance(fm, dict):
        continue
    links = list(fm.get("related") or []) + fm.get("_body_links", [])
    for target in links:
        if target not in all_files:
            errors.append(f"{rel}: link to '{target}' — no such content file")

# Folders of images with no matching content file
for coll in ("art", "photography", "writing", "sidequests"):
    base = IMG / coll
    if base.exists():
        for d in sorted(p for p in base.iterdir() if p.is_dir()):
            if f"_{coll}/{d.name}.md" not in all_files:
                warnings.append(f"assets/images/{coll}/{d.name}/: no _{coll}/{d.name}.md uses this folder")

count = sum(1 for v in all_files.values() if isinstance(v, dict))
print(f"Checked {count} pieces.")
for w in warnings:
    print("  warning:", w)
for e in errors:
    print("  ERROR:  ", e)
if not errors and not warnings:
    print("  All good.")
elif not errors:
    print("  No errors.")
sys.exit(1 if errors else 0)
