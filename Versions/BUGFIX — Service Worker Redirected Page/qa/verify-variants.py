#!/usr/bin/env python3
"""Prove each part of the fix is load-bearing: build the site once into a scratch folder,
then run sw-redirect-harness.js against copies whose sw.js is the previous one or has one
part broken. Never writes to the live tree.

    NODE_PATH=/opt/node22/lib/node_modules python3 qa/verify-variants.py
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
SW_REL = ("Versions/Part F — Cross-Platform Delivery/PART F — Phase 0.6 Installable Web App/src/sw.js")
PRE_FIX_COMMIT = "9b465b5"
HARNESS = HERE / "sw-redirect-harness.js"

RELOAD = ["PAGES-RELOAD-FROM-CACHE-LOADS"]
VARIANTS = [
    ("fixed build", None, []),
    ("previous sw.js (commit %s)" % PRE_FIX_COMMIT, "previous",
     ["PAGES-CACHED-PAGE-CLEAN", "PAGES-RELOAD-FROM-CACHE-LOADS", "PAGES-POISONED-CACHE-LOADS"]),
    ("switch off", [("const SW_REDIRECT_FIX_ENABLED = true;", "const SW_REDIRECT_FIX_ENABLED = false;")],
     ["PAGES-CACHED-PAGE-CLEAN", "PAGES-RELOAD-FROM-CACHE-LOADS", "PAGES-POISONED-CACHE-LOADS"]),
    # Serve-time copy alone still answers every load; only the stored copy stays redirected.
    ("no activate-clean", [("if (stored && stored.redirected) await cache.put(key, await servable(stored));", "")],
     ["PAGES-CACHED-PAGE-CLEAN"]),
    # Activate-time copy alone makes the fresh cache clean; a cache poisoned any other way is not.
    ("no serve-clean", [("if (SW_REDIRECT_FIX_ENABLED && cached && cached.redirected) return servable(cached);", "")],
     ["PAGES-POISONED-CACHE-LOADS"]),
    ("helper returns the response unchanged", [("if (!SW_REDIRECT_FIX_ENABLED || !res || !res.redirected) return res;", "return res;")],
     ["PAGES-CACHED-PAGE-CLEAN", "PAGES-RELOAD-FROM-CACHE-LOADS", "PAGES-POISONED-CACHE-LOADS"]),
]


def run(site: Path):
    out = subprocess.run(["node", str(HARNESS), str(site)], capture_output=True, text=True, timeout=900)
    text = out.stdout + out.stderr
    failed = sorted(set(re.findall(r"^FAIL (\S+)", text, re.M)))
    count = re.search(r"(\d+)/(\d+) checks passed", text)
    return failed, (count.group(0) if count else "no count")


def main() -> int:
    problems = 0
    with tempfile.TemporaryDirectory(prefix="l5r-swredirect-") as work:
        base = Path(work) / "site"
        subprocess.run([sys.executable, str(REPO / "build.py"), "--out", str(base)], check=True, capture_output=True)
        stamped = (base / "sw.js").read_text(encoding="utf-8")
        build_id = re.search(r"const BUILD_ID = '([0-9a-f]+)';", stamped).group(1)
        for i, (name, edits, expected) in enumerate(VARIANTS):
            site = Path(work) / f"v{i}"
            shutil.copytree(base, site)
            if edits == "previous":
                old = subprocess.run(["git", "show", f"{PRE_FIX_COMMIT}:{SW_REL}"], cwd=REPO, check=True,
                                     capture_output=True, text=True).stdout
                (site / "sw.js").write_text(old.replace("__BUILD_ID__", build_id), encoding="utf-8")
            elif edits:
                text = stamped
                for old, new in edits:
                    assert text.count(old) == 1, f"variant anchor not unique: {old[:60]}"
                    text = text.replace(old, new)
                (site / "sw.js").write_text(text, encoding="utf-8")
            failed, count = run(site)
            ok = set(failed) == set(expected)
            problems += 0 if ok else 1
            print(f"{'OK  ' if ok else 'BAD '} {name}: {count}; failed {failed}"
                  + ("" if ok else f"\n     expected {sorted(expected)}"))
    print("VARIANTS", "all fail where expected" if problems == 0 else f"{problems} variant(s) off target")
    return 0 if problems == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
