#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
THE BUILD. Concatenates every fragment named in manifest.json, in order, and
writes the single-file sheet.

    python3 build/recombine.py              # build
    python3 build/recombine.py --verify     # build, then check against expect_sha256
    python3 build/recombine.py --stdout     # write to stdout instead of a file

No bundler, no framework, no dependencies -- the output is a plain
double-click-and-go HTML file, exactly as the sheet has always been. Nothing is
transformed on the way through: the output is the fragments, joined by newlines,
and nothing else. That is the whole point. If this script ever starts rewriting
content, the guarantee that a rebuild cannot change behaviour is gone.

Runnable from any working directory.
"""

import hashlib
import io
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MANIFEST = os.path.join(HERE, "manifest.json")


def main():
    to_stdout = "--stdout" in sys.argv
    verify = "--verify" in sys.argv

    with io.open(MANIFEST, "r", encoding="utf-8") as fh:
        man = json.load(fh)

    chunks = []
    missing = []
    for frag in man["fragments"]:
        path = os.path.join(ROOT, frag["file"])
        if not os.path.isfile(path):
            missing.append(frag["file"])
            continue
        with io.open(path, "r", encoding="utf-8", newline="") as fh:
            chunks.append(fh.read())

    if missing:
        sys.exit("missing source fragment(s):\n  " + "\n  ".join(missing))

    # split.py cut the original on "\n"; joining on "\n" is its exact inverse.
    text = "\n".join(chunks)
    raw = text.encode("utf-8")
    digest = hashlib.sha256(raw).hexdigest()

    if to_stdout:
        sys.stdout.write(text)
        return

    out_path = os.path.join(ROOT, man["output"])
    # newline="" so Python never translates line endings on the way out. The
    # repo is configured core.autocrlf false precisely so bytes round-trip.
    with io.open(out_path, "w", encoding="utf-8", newline="") as fh:
        fh.write(text)

    print("built  : %s" % man["output"])
    print("bytes  : %d" % len(raw))
    print("lines  : %d" % (text.count("\n") + (0 if text.endswith("\n") else 1)))
    print("sha256 : %s" % digest)

    expected = man.get("expect_sha256")
    if expected:
        if digest == expected:
            print("verify : BYTE-IDENTICAL to the pre-split build")
        else:
            print("verify : DIFFERS from the pre-split build")
            print("         expected %s" % expected)
            if verify:
                sys.exit(1)


if __name__ == "__main__":
    main()
