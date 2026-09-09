#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Phase 0.7 -- stage the built site as the Android app's web assets.

    python3 build/build_android.py          stage into app/www/
    python3 build/build_android.py --check  verify the staged copy, write nothing

The chain, each link reusing the one below rather than reimplementing it:

    build_android.py -> build.py -> 0.6 build_pwa.py -> 0.5 deploy_build.py
                                       -> 0 recombine.py -> fragments

This script does NOT compile anything. It produces the `www` directory that
capacitor.config.json names as webDir; `npx cap copy android` then moves it into
the native project, and Gradle builds the APK. Compiling needs the Android SDK,
which is why that part runs in CI -- see .github/workflows/android.yml and
BUILD-FROM-A-PHONE.md.

THE PAGE IS SHIPPED BYTE-IDENTICAL

The APK carries exactly the bytes the website serves -- same sha256, asserted
below. That is worth protecting: it means the app cannot drift from the site,
there is no Android-only variant of the sheet to test separately, and a bug
reproduced in one is reproduced in the other. Every difference between the two
shells is therefore a difference in what is ALONGSIDE the page, never in it.

SW.JS IS DELIBERATELY LEFT OUT

It is the one file excluded, and the only file whose absence matters.

Inside the wrapper every asset is already local, so the service worker's whole
purpose -- surviving a lost network -- is already satisfied by the APK itself.
What it would still do is cache the page under a build id and serve that cached
copy first. After an app update the wrapper would hand the webview a new
index.html, the worker would answer the navigation from its old cache anyway,
and the app would keep showing the previous build with no error and no way for a
player to tell. Shipping a cache in front of files that cannot go stale buys
nothing and risks exactly that.

Leaving it out means head-pwa.html's registration call 404s. That is handled:
the registration is wrapped in .catch() precisely because it must never break
the sheet, so it logs one console.info line and the app carries on. That is also
why the page can stay byte-identical -- no Android-only edit is needed to
suppress it.

Stdlib only, as everywhere else in this project.
"""

import hashlib
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PHASE_DIR = os.path.dirname(HERE)
PART_F = os.path.dirname(PHASE_DIR)
REPO = os.path.dirname(os.path.dirname(PART_F))

ROOT_BUILD = os.path.join(REPO, "build.py")
DIST = os.path.join(REPO, "dist")
WWW = os.path.join(PHASE_DIR, "app", "www")

# Everything published by Phase 0.6 except sw.js -- see the header.
EXCLUDE = {"sw.js"}


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def run_site_build():
    """Produce dist/ by running the repo-root build, exactly as a deploy does."""
    if not os.path.isfile(ROOT_BUILD):
        sys.exit("repo-root build.py not found:\n  %s" % ROOT_BUILD)
    proc = subprocess.run([sys.executable, ROOT_BUILD],
                          cwd=REPO, capture_output=True, text=True)
    if proc.returncode != 0:
        sys.stderr.write(proc.stdout or "")
        sys.stderr.write(proc.stderr or "")
        sys.exit("site build failed (exit %d)" % proc.returncode)
    return proc.stdout.rstrip()


def collect():
    """Relative paths of everything in dist/, minus the exclusions."""
    keep, dropped = [], []
    for base, _dirs, files in os.walk(DIST):
        for name in sorted(files):
            full = os.path.join(base, name)
            rel = os.path.relpath(full, DIST).replace(os.sep, "/")
            (dropped if name in EXCLUDE else keep).append(rel)
    return sorted(keep), sorted(dropped)


def main():
    check_only = "--check" in sys.argv

    if not check_only:
        print(run_site_build())
        print()

    index = os.path.join(DIST, "index.html")
    if not os.path.isfile(index):
        sys.exit("no dist/index.html -- run `python3 build.py` from the repo root")

    keep, dropped = collect()
    if "index.html" not in keep:
        sys.exit("dist/ has no index.html to ship")
    if "sw.js" not in dropped:
        sys.exit("expected to exclude sw.js but dist/ does not contain one -- "
                 "has Phase 0.6 changed? Refusing to guess.")

    page_hash = sha256_file(index)

    if check_only:
        staged = os.path.join(WWW, "index.html")
        if not os.path.isfile(staged):
            sys.exit("nothing staged at %s -- run without --check first" % WWW)
        staged_hash = sha256_file(staged)
        ok = staged_hash == page_hash
        print("staged page : %s" % staged_hash[:16])
        print("built  page : %s" % page_hash[:16])
        print("identical   : %s" % ("yes" if ok else "NO"))
        for name in sorted(EXCLUDE):
            present = os.path.isfile(os.path.join(WWW, name))
            print("%s excluded : %s" % (name, "no -- IT IS STAGED" if present else "yes"))
            ok = ok and not present
        if not ok:
            sys.exit(1)
        print("\nstaged web assets match the built site")
        return

    # Wipe rather than overwrite: a file that stops being produced must stop
    # being shipped, and an overwrite would leave it behind indefinitely.
    if os.path.isdir(WWW):
        shutil.rmtree(WWW)
    os.makedirs(WWW)

    for rel in keep:
        dst = os.path.join(WWW, *rel.split("/"))
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copyfile(os.path.join(DIST, *rel.split("/")), dst)

    staged_hash = sha256_file(os.path.join(WWW, "index.html"))
    if staged_hash != page_hash:
        sys.exit("staged index.html does not match the built one:\n"
                 "  built  %s\n  staged %s" % (page_hash, staged_hash))

    print("Android web assets")
    print("  webDir      : %s" % os.path.relpath(WWW, PHASE_DIR))
    print("  page sha256 : %s  (identical to the deployed site)" % page_hash[:16])
    print("  staged      : %d files" % len(keep))
    for rel in keep:
        size = os.path.getsize(os.path.join(WWW, *rel.split("/")))
        print("      %-30s %9d bytes" % (rel, size))
    print("  excluded    : %s" % ", ".join(dropped))
    print()
    print("Next: npx cap copy android, then Gradle. CI does both --")
    print("see .github/workflows/android.yml")


if __name__ == "__main__":
    main()
