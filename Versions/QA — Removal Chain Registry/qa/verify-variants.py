#!/usr/bin/env python3
"""Prove the registry is load-bearing: break it in a scratch copy of Versions/ and show the
fixtures that depend on it fail, then show the unbroken copy passes.

    python3 qa/verify-variants.py

Copies the whole Versions/ folder (about 60 MB) to a scratch directory and edits only the copy.
Each variant runs Phase 11's live removal fixture (the one with the longest chain behind it) and
this registry's own checks, and must turn at least one of them red.
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
VERSIONS = HERE.parents[1]
REGISTRY = "QA — Removal Chain Registry/removal_chain.py"
PHASE11 = "PART K — Phase 11 Characters List and Save Model/qa/test-removal.py"
KITSUNE = "BUGFIX — Kitsune Shugenja Listed Under Mantis/qa/test-removal.py"
OWN = "QA — Removal Chain Registry/qa/test-chain.py"


def drop(folder):
    def edit(text):
        pattern = re.compile(r'    Release\("' + re.escape(folder) + r'",\n\s+[^\n]*\),\n')
        assert len(pattern.findall(text)) == 1, folder
        return pattern.sub("", text)
    return edit


def swap(a, b):
    def edit(text):
        ra = re.search(r'    Release\("' + re.escape(a) + r'",\n\s+[^\n]*\),\n', text).group(0)
        rb = re.search(r'    Release\("' + re.escape(b) + r'",\n\s+[^\n]*\),\n', text).group(0)
        return text.replace(ra, "\0A").replace(rb, ra).replace("\0A", rb)
    return edit


def ignore_text_fixes(text):
    old = '        if release.kind == "text" and not fixes:\n'
    assert text.count(old) == 1
    return text.replace(old, '        if release.kind == "text":\n')


VARIANTS = [
    ("unbroken registry", None, {"phase 11 live": True, "kitsune live": True, "own checks": True}),
    ("Import fix not registered", drop("BUGFIX — Import File Picker Filter"), {"phase 11 live": False, "own checks": False}),
    ("Kitsune fix not registered", drop("BUGFIX — Kitsune Shugenja Listed Under Mantis"), {"phase 11 live": False}),
    ("11.2.3 and 11.2.4 out of order", swap("PART K — Phase 11.2.3 Wizard Starting Spells",
                                             "PART K — Phase 11.2.4 Wizard Starting Spells for Every School"),
     {"phase 11 live": False}),
    ("Phase 11 not registered", drop("PART K — Phase 11 Characters List and Save Model"), {"phase 11 live": False}),
    ("text fixes never removed", ignore_text_fixes, {"phase 11 live": False, "own checks": False}),
]


def run(path: Path, test: str | None = None) -> bool:
    args = [sys.executable, str(path)] + ([test] if test else [])
    out = subprocess.run(args, capture_output=True, text=True, timeout=1200)
    return out.returncode == 0


def main() -> int:
    bad = 0
    with tempfile.TemporaryDirectory(prefix="l5r-chain-variants-") as work:
        for name, edit, expected in VARIANTS:
            copy = Path(work) / re.sub(r"\W+", "-", name)
            shutil.copytree(VERSIONS, copy, ignore=shutil.ignore_patterns("__pycache__", "originals"))
            if edit:
                registry = copy / REGISTRY
                registry.write_bytes(edit(registry.read_bytes().decode("utf-8")).encode("utf-8"))
            results = {}
            for key in expected:
                if key == "phase 11 live":
                    results[key] = run(copy / PHASE11, "LiveTree.test_live_tree_removes_to_the_pre_release_build")
                elif key == "kitsune live":
                    results[key] = run(copy / KITSUNE, "LiveTree")
                else:
                    results[key] = run(copy / OWN)
            ok = results == expected
            bad += not ok
            shown = ", ".join(f"{k} {'passes' if v else 'FAILS'}" for k, v in results.items())
            print(f"{'OK ' if ok else 'BAD'} {name}: {shown}")
            shutil.rmtree(copy, ignore_errors=True)
    print("VARIANTS " + ("all as expected" if not bad else f"{bad} NOT as expected"))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
