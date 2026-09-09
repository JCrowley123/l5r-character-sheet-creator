#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Phase 0.6 -- turn the deployed site into an installable, offline-capable app.

    python3 build.py            (from the repo root -- the usual way)
    --out DIR                   publish somewhere other than <repo>/dist

The chain, each link reusing the one below rather than reimplementing it:

    build.py  ->  0.6 build_pwa.py  ->  0.5 deploy_build.py
                                            ->  0 recombine.py  ->  fragments

So this script starts from a finished dist/index.html and adds four things:

  1. the PWA <head> block, injected immediately before </head>
  2. manifest.webmanifest
  3. sw.js, with its BUILD_ID stamped from the sha256 of everything published
  4. the icons

WHY NOTHING IN PHASE 0 IS EDITED

The <head> tags have to end up inside the built HTML, and the head lives in
Phase 0's src/shell/01-head-open.html. Editing that file would work and would
be wrong: rollback in this project means deleting a folder, and a phase that
reaches back into an earlier phase's sources cannot be removed that way.

So the tags are injected into the OUTPUT instead. The anchor is '</head>',
asserted to appear exactly once before anything is written -- if the sheet ever
grows a second one, this fails loudly rather than injecting into the wrong
place. Phase 0's sources, and the file it builds, are left untouched.

THE BUILD ID

sw.js carries a hash of every published file. A browser reinstalls a worker only
when the worker file's own bytes change, so without a per-build value every
deploy would ship an identical sw.js, the browser would see no change, and
installed apps would serve the old sheet indefinitely. Stamping the hash makes
each deploy a new worker with a new cache name.

Stdlib only.
"""

import hashlib
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PHASE_DIR = os.path.dirname(HERE)
PART_F = os.path.dirname(PHASE_DIR)
REPO = os.path.dirname(os.path.dirname(PART_F))

PHASE05 = os.path.join(PART_F, "PART F — Phase 0.5 Hosting & Deployment Pipeline")
DEPLOY_05 = os.path.join(PHASE05, "deploy", "deploy_build.py")

SRC = os.path.join(PHASE_DIR, "src")
ICONS = os.path.join(PHASE_DIR, "icons")
DEFAULT_OUT = os.path.join(REPO, "dist")

ANCHOR = "</head>"


def out_dir_from_argv():
    if "--out" in sys.argv:
        i = sys.argv.index("--out")
        if i + 1 >= len(sys.argv):
            sys.exit("--out needs a directory")
        return os.path.abspath(sys.argv[i + 1])
    return DEFAULT_OUT


def run_phase_05(out):
    """Produce the base dist/index.html by running Phase 0.5's deploy."""
    if not os.path.isfile(DEPLOY_05):
        sys.exit("Phase 0.5 deploy script not found:\n  %s" % DEPLOY_05)
    proc = subprocess.run(
        [sys.executable, DEPLOY_05, "--out", out],
        cwd=PHASE05, capture_output=True, text=True,
    )
    if proc.returncode != 0:
        sys.stderr.write(proc.stdout or "")
        sys.stderr.write(proc.stderr or "")
        sys.exit("Phase 0.5 deploy failed (exit %d)" % proc.returncode)
    return proc.stdout.rstrip()


def main():
    out = out_dir_from_argv()

    print(run_phase_05(out))
    print()

    index = os.path.join(out, "index.html")
    if not os.path.isfile(index):
        sys.exit("Phase 0.5 produced no index.html at %s" % index)

    with open(index, "r", encoding="utf-8", newline="") as fh:
        html = fh.read()
    base_hash = hashlib.sha256(html.encode("utf-8")).hexdigest()

    # --- inject the head block ------------------------------------------------
    if html.count(ANCHOR) != 1:
        sys.exit(
            "expected exactly one %r in the built page, found %d.\n"
            "Refusing to guess where the PWA tags belong."
            % (ANCHOR, html.count(ANCHOR))
        )

    head_path = os.path.join(SRC, "head-pwa.html")
    with open(head_path, "r", encoding="utf-8", newline="") as fh:
        head_block = fh.read().rstrip("\n")

    # The injected block must not itself contain the anchor. An earlier version
    # of head-pwa.html mentioned "</head>" in a prose comment, which shipped
    # inside the page and gave the output two of them -- the real tag and a
    # phantom inside a comment. Nothing broke immediately; a later tool that
    # searched for the anchor found the wrong one. Refuse it at the source.
    if ANCHOR in head_block:
        sys.exit(
            "head-pwa.html contains a literal %r.\n"
            "That would ship a second one inside the built page and break any\n"
            "tool that treats it as a unique anchor. Reword the comment."
            % ANCHOR
        )

    if "rel=\"manifest\"" in html:
        sys.exit("the built page already links a manifest -- has this run twice?")

    injected = head_block + "\n"
    html = html.replace(ANCHOR, injected + ANCHOR, 1)

    with open(index, "w", encoding="utf-8", newline="") as fh:
        fh.write(html)

    final_hash = hashlib.sha256(html.encode("utf-8")).hexdigest()
    added_bytes = len(injected.encode("utf-8"))

    # --- manifest and icons ---------------------------------------------------
    shutil.copyfile(os.path.join(SRC, "manifest.webmanifest"),
                    os.path.join(out, "manifest.webmanifest"))

    icons_out = os.path.join(out, "icons")
    os.makedirs(icons_out, exist_ok=True)
    icon_names = sorted(n for n in os.listdir(ICONS) if n.endswith(".png"))
    if not icon_names:
        sys.exit("no icons found in %s -- run build/make_icons.py first" % ICONS)
    for name in icon_names:
        shutil.copyfile(os.path.join(ICONS, name), os.path.join(icons_out, name))

    # --- the build id ---------------------------------------------------------
    #
    # Hashed over EVERYTHING published, not the page alone.
    #
    # It used to hash index.html only, which is wrong for any change that does
    # not touch the HTML -- a new icon being exactly that. The icons are served
    # cache-first from a cache named for this id, so an unchanged id means: sw.js
    # ships byte-identical, the browser sees no reason to reinstall the worker,
    # the cache is never renamed, and installed apps go on serving the OLD icons
    # indefinitely with nothing reporting an error anywhere. That is precisely
    # the failure the build id exists to prevent -- it was simply scoped too
    # narrowly to catch it, and an icon change is what exposed the gap.
    #
    # The name goes into the digest alongside the bytes, so adding, removing or
    # renaming a file counts as a change even if every byte is already present.
    digest = hashlib.sha256()
    digest.update(html.encode("utf-8"))
    published = ["manifest.webmanifest"] + ["icons/" + n for n in icon_names]
    for rel in published:
        digest.update(rel.encode("utf-8"))
        with open(os.path.join(out, *rel.split("/")), "rb") as fh:
            digest.update(fh.read())
    build_id = digest.hexdigest()

    # --- service worker, stamped with that id --------------------------------
    with open(os.path.join(SRC, "sw.js"), "r", encoding="utf-8", newline="") as fh:
        sw = fh.read()
    if "__BUILD_ID__" not in sw:
        sys.exit("sw.js has no __BUILD_ID__ placeholder to stamp")
    sw = sw.replace("__BUILD_ID__", build_id[:16])
    with open(os.path.join(out, "sw.js"), "w", encoding="utf-8", newline="") as fh:
        fh.write(sw)

    print("PWA layer")
    print("  head block injected before </head>  (+%d bytes)" % added_bytes)
    print("  base page   : %s  (Phase 0 build, unchanged)" % base_hash[:16])
    print("  page sha256 : %s" % final_hash)
    print("  sw BUILD_ID : %s  (page + manifest + icons)" % build_id[:16])
    print("  manifest.webmanifest, sw.js, %d icons" % len(icon_names))
    print()
    print("published : %s" % os.path.relpath(out, REPO))
    for name in ["index.html", "manifest.webmanifest", "sw.js"]:
        print("  %-22s %8d bytes" % (name, os.path.getsize(os.path.join(out, name))))
    for name in icon_names:
        print("  icons/%-16s %8d bytes" % (name, os.path.getsize(os.path.join(icons_out, name))))


if __name__ == "__main__":
    main()
