#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Phase 0.5 -- produce the publish directory Cloudflare Pages serves.

    python3 build.py                  (from the repo root -- the usual way)
    python3 deploy/deploy_build.py    (directly, same result)

    --check-drift   build, compare against the committed single-file build,
                    exit non-zero if they differ. Writes nothing.
    --out DIR       publish somewhere other than <repo>/dist

What it does, in full:

  1. runs Phase 0's recombine.py -- the SAME build, not a second implementation
  2. copies its output to dist/index.html as raw bytes
  3. confirms the copy is byte-identical to what Phase 0 produced

Step 1 matters. This script deliberately owns no assembly logic of its own.
If it re-implemented the concatenation there would be two builds to keep in
step, and the deployed site could drift from the local one without either
looking wrong. Instead it shells out to the real build and copies the result.

Step 2 copies bytes rather than re-encoding text, so no newline translation can
creep in between the local build and the deployed one -- the same care the repo
takes with core.autocrlf false.

Stdlib only, no third-party packages, because the Cloudflare build container
gets whatever Python it ships with and nothing else.
"""

import hashlib
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PHASE_DIR = os.path.dirname(HERE)                        # PART F -- Phase 0.5 ...
PART_F = os.path.dirname(PHASE_DIR)                      # Part F -- Cross-Platform Delivery
VERSIONS = os.path.dirname(PART_F)                       # Versions
REPO = os.path.dirname(VERSIONS)                         # repo root

PHASE0 = os.path.join(
    PART_F, "PART F — Phase 0 Source Reorganization for Maintainability"
)
RECOMBINE = os.path.join(PHASE0, "build", "recombine.py")
BUILT = os.path.join(PHASE0, "l5r-character-sheet.html")

# Cloudflare Pages serves whatever sits in the output directory. Keeping that a
# dedicated folder containing exactly one file is deliberate: point Pages at the
# repo root instead and it would publish every legacy build, the Art folder and
# the whole Versions tree to an open URL.
DEFAULT_OUT = os.path.join(REPO, "dist")


def sha256_of(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for block in iter(lambda: fh.read(65536), b""):
            h.update(block)
    return h.hexdigest()


def run_recombine():
    """Run Phase 0's build with the interpreter running this script."""
    if not os.path.isfile(RECOMBINE):
        sys.exit("Phase 0 recombine.py not found:\n  %s" % RECOMBINE)

    proc = subprocess.run(
        [sys.executable, RECOMBINE],
        cwd=PHASE0, capture_output=True, text=True,
    )
    if proc.returncode != 0:
        sys.stderr.write(proc.stdout or "")
        sys.stderr.write(proc.stderr or "")
        sys.exit("Phase 0 recombine failed (exit %d)" % proc.returncode)
    return proc.stdout.strip()


def out_dir_from_argv():
    if "--out" in sys.argv:
        i = sys.argv.index("--out")
        if i + 1 >= len(sys.argv):
            sys.exit("--out needs a directory")
        return os.path.abspath(sys.argv[i + 1])
    return DEFAULT_OUT


def main():
    check_drift = "--check-drift" in sys.argv

    if check_drift:
        # Compare what is committed against what the sources currently produce.
        # Catches the one mistake this layout invites: editing a fragment and
        # forgetting to rebuild, leaving a committed HTML that no longer matches
        # its own sources. Deliberately not pinned to a fixed hash -- once a
        # later phase edits a fragment on purpose, a fixed hash would fail
        # forever, while this stays correct.
        before = sha256_of(BUILT) if os.path.isfile(BUILT) else None
        run_recombine()
        after = sha256_of(BUILT)
        if before is None:
            print("no committed build to compare against; built %s" % after[:16])
            return
        if before == after:
            print("no drift: committed build matches its sources (%s)" % after[:16])
            return
        print("DRIFT: the committed build does not match its sources")
        print("  committed : %s" % before)
        print("  rebuilt   : %s" % after)
        print("\nA source fragment changed without the build being re-run.")
        print("The rebuild has been written; commit it.")
        sys.exit(1)

    out = out_dir_from_argv()
    print(run_recombine())

    if not os.path.isfile(BUILT):
        sys.exit("recombine reported success but produced no file:\n  %s" % BUILT)

    os.makedirs(out, exist_ok=True)
    target = os.path.join(out, "index.html")
    shutil.copyfile(BUILT, target)          # bytes, not text -- no newline translation

    src_hash, out_hash = sha256_of(BUILT), sha256_of(target)
    if src_hash != out_hash:
        sys.exit("publish copy differs from the build -- refusing to continue")

    print("")
    print("published : %s" % os.path.relpath(target, REPO))
    print("bytes     : %d" % os.path.getsize(target))
    print("sha256    : %s" % out_hash)
    print("identical to the Phase 0 build: yes")


if __name__ == "__main__":
    main()
