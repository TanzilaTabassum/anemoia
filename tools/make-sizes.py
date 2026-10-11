#!/usr/bin/env python3
"""
Make smaller copies of your images so pages load fast — without touching your originals.

    python3 tools/make-sizes.py                     # every image in assets/images
    python3 tools/make-sizes.py assets/images/art   # just one folder

For  photo.jpg  it creates  photo-480.jpg, photo-960.jpg, photo-1600.jpg  next to it
(an original that's already smaller than a size is copied, never enlarged). Files already made
are skipped, so it's safe to re-run.

Then, in _config.yml, set:   responsive_images: true
and the site will automatically offer each visitor the right size (srcset),
while the lightbox still opens your full-size original.

Needs Pillow:   pip install pillow
"""
import re
import shutil
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow is needed:  pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
SIZES = [480, 960, 1600]          # keep in sync with image_sizes in _config.yml
EXT = {".jpg", ".jpeg", ".png", ".webp"}
DERIVED = re.compile(r"-(\d+)$")


def show(p):
    try:
        return p.relative_to(ROOT)
    except ValueError:
        return p


def main():
    base = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "assets" / "images"
    made = skipped = 0
    for p in sorted(base.rglob("*")):
        if p.suffix.lower() not in EXT or DERIVED.search(p.stem) and int(DERIVED.search(p.stem).group(1)) in SIZES:
            continue
        with Image.open(p) as im:
            im = ImageOps.exif_transpose(im)
            for w in SIZES:
                out = p.with_name(f"{p.stem}-{w}{p.suffix}")
                if out.exists():
                    skipped += 1
                    continue
                if im.width <= w:
                    # Never enlarge. Keep a same-named copy so the page's srcset never points at a missing file.
                    shutil.copyfile(p, out)
                    made += 1
                    print("copied", show(out), "(original is already small)")
                    continue
                h = round(im.height * w / im.width)
                small = im.resize((w, h), Image.LANCZOS)
                if p.suffix.lower() in (".jpg", ".jpeg"):
                    small.convert("RGB").save(out, "JPEG", quality=82, optimize=True, progressive=True)
                else:
                    small.save(out)
                made += 1
                print("made", show(out))
    print(f"\nDone: {made} new, {skipped} already existed.")
    print("Remember: set  responsive_images: true  in _config.yml")


if __name__ == "__main__":
    main()
