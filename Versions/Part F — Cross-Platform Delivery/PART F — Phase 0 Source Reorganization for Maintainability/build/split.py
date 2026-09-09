#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ONE-SHOT BOOTSTRAP -- carves the pre-split deliverable into src/ fragments.

This ran once, to create the source tree. It is kept for provenance: it shows
exactly how the fragments were produced, and re-running it reproduces them from
the original build. Day-to-day work does not use this script -- edit the files
under src/ and run recombine.py.

    python3 split.py           # write the fragments
    python3 split.py --check   # validate the manifest, write nothing

Refuses to run unless the manifest's line ranges tile the source file exactly:
contiguous, no gaps, no overlaps, first line 1, last line EOF. A fragment quietly
dropping or duplicating lines is the one failure that would produce a build that
looks fine and is not, so it is made impossible rather than tested for.

Stdlib only. Never modifies the source build it reads.
"""

import hashlib
import io
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MANIFEST = os.path.join(HERE, "manifest.json")


def load_manifest():
    with io.open(MANIFEST, "r", encoding="utf-8") as fh:
        return json.load(fh)


def validate(fragments, total_lines):
    """The manifest must tile [1, total_lines] exactly. Anything else is fatal."""
    problems = []
    expected_next = 1
    for frag in fragments:
        start, end = frag["lines"]
        if start != expected_next:
            problems.append(
                "%s starts at %d, expected %d%s"
                % (frag["file"], start, expected_next,
                   " (gap)" if start > expected_next else " (overlap)")
            )
        if end < start:
            problems.append("%s has end %d before start %d" % (frag["file"], end, start))
        expected_next = end + 1

    last = expected_next - 1
    if last != total_lines:
        problems.append(
            "manifest covers %d lines, source has %d (%s)"
            % (last, total_lines, "short" if last < total_lines else "over")
        )
    return problems


def main():
    check_only = "--check" in sys.argv
    man = load_manifest()

    src_path = os.path.normpath(os.path.join(ROOT, man["source_build"]))
    if not os.path.isfile(src_path):
        sys.exit("source build not found:\n  %s" % src_path)

    with io.open(src_path, "r", encoding="utf-8", newline="") as fh:
        text = fh.read()

    # Split on "\n" rather than readlines() so line endings are preserved
    # verbatim and rejoining with "\n" is exactly lossless.
    lines = text.split("\n")
    total = len(lines)

    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    print("source : %s" % os.path.basename(src_path))
    print("sha256 : %s" % digest)
    print("lines  : %d (as split on \\n)" % total)
    if digest != man.get("expect_sha256"):
        print("WARNING: source sha256 does not match manifest expect_sha256")
        print("         manifest: %s" % man.get("expect_sha256"))

    problems = validate(man["fragments"], total)
    if problems:
        print("\nMANIFEST INVALID -- refusing to split:")
        for p in problems:
            print("  - %s" % p)
        sys.exit(1)
    print("manifest tiles the source exactly: %d fragments, no gaps or overlaps"
          % len(man["fragments"]))

    if check_only:
        return

    written = 0
    for frag in man["fragments"]:
        start, end = frag["lines"]
        chunk = "\n".join(lines[start - 1:end])
        out_path = os.path.join(ROOT, frag["file"])
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with io.open(out_path, "w", encoding="utf-8", newline="") as fh:
            fh.write(chunk)
        written += 1
        print("  %-46s %5d lines" % (frag["file"], end - start + 1))

    print("\nwrote %d fragments under %s/src" % (written, ROOT))
    print("now run: python3 build/recombine.py")


if __name__ == "__main__":
    main()
