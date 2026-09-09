#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Structural inventory of a built single-file sheet.

Measures the invariants CLAUDE.md names -- element IDs, section count,
roll-modal count, test seams, tag balance -- plus a sha256 of the whole file
and of the sheet's own <script> alone. Emits JSON on stdout.

Run it against the pre-split deliverable to capture a baseline, then against
the recombined output and diff the two. Any difference is a regression.

    python3 inventory.py <file.html> > baseline.json

Reads only. Never writes to the file it is given. Stdlib only.
"""

import hashlib
import io
import json
import re
import sys
from collections import Counter

# The sheet is authored with tags that never carry a closing partner. Counting
# these as "open" would make every balance check fail for no reason.
VOID_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}

TAG_RE = re.compile(r"<(/?)([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(/?)>")
ID_RE = re.compile(r"""\bid\s*=\s*["']([^"']+)["']""")


def read(path):
    with io.open(path, "r", encoding="utf-8", newline="") as fh:
        return fh.read()


def script_blocks(text):
    """Return the inner text of every <script> block, in document order."""
    return re.findall(r"<script>(.*?)</script>", text, re.S)


def style_blocks(text):
    return re.findall(r"<style>(.*?)</style>", text, re.S)


def markup_only(text):
    """Strip <script> and <style> bodies and HTML comments so their contents
    can't be mistaken for markup. String literals inside the sheet's JS contain
    plenty of angle brackets, and one comment describes a debug <pre> element --
    counting either would drown the real tag balance.

    Prose placeholders written in visible text -- the sheet says "<School Rank>"
    and "<Path name>" in a couple of labels -- still register as opens here.
    They are text, not markup, and they are pre-existing: the figure is carried
    as a baseline to compare against, not as an assertion that it should be nil.
    """
    text = re.sub(r"<script>.*?</script>", "<script></script>", text, flags=re.S)
    text = re.sub(r"<style>.*?</style>", "<style></style>", text, flags=re.S)
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    return text


def tag_balance(markup):
    """Count opens and closes per tag name. Returns only the unbalanced ones."""
    depth = Counter()
    for closing, name, self_closing in TAG_RE.findall(markup):
        name = name.lower()
        if name in VOID_TAGS or self_closing:
            continue
        depth[name] += -1 if closing else 1
    return {k: v for k, v in sorted(depth.items()) if v != 0}


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: inventory.py <file.html>")

    path = sys.argv[1]
    text = read(path)
    raw = text.encode("utf-8")

    scripts = script_blocks(text)
    styles = style_blocks(text)
    markup = markup_only(text)

    ids = ID_RE.findall(markup)
    id_counts = Counter(ids)

    report = {
        "file": path,
        "bytes": len(raw),
        "lines": text.count("\n") + (0 if text.endswith("\n") else 1),
        "sha256": hashlib.sha256(raw).hexdigest(),

        # The sheet's own script is the first block; the rest are Part D layers.
        # CLAUDE.md requires this one stays byte-identical through any build.
        "script_count": len(scripts),
        "sheet_script_sha256": (
            hashlib.sha256(scripts[0].encode("utf-8")).hexdigest() if scripts else None
        ),
        "script_sha256": [
            hashlib.sha256(s.encode("utf-8")).hexdigest() for s in scripts
        ],
        "script_lines": [s.count("\n") for s in scripts],

        "style_count": len(styles),
        "style_sha256": [
            hashlib.sha256(s.encode("utf-8")).hexdigest() for s in styles
        ],

        # CLAUDE.md invariants.
        "element_id_count": len(ids),
        "element_id_unique": len(id_counts),
        "element_ids_duplicated": sorted(k for k, v in id_counts.items() if v > 1),
        "element_ids": sorted(id_counts),

        "section_count": len(re.findall(r"<section\b", markup)),
        "roll_modal_overlay_count": len(re.findall(r"roll-modal-overlay", text)),
        "tag_imbalance": tag_balance(markup),

        # Test seams the split must carry through untouched.
        "has_L5R_TEST_seam": "window.__L5R_TEST__" in text,
        "has_L5R_CAROUSEL_seam": "window.__L5R_CAROUSEL__" in text,
    }

    json.dump(report, sys.stdout, indent=2, ensure_ascii=False, sort_keys=True)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
