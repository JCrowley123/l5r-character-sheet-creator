#!/usr/bin/env python3
"""Prove the harness can fail, and that Phase 12.2 (part 3) is load-bearing: build broken
variants of the live tree in scratch copies and show the harness fails exactly where it
should.

    NODE_PATH=<node_modules> PYTHONUTF8=1 python3 qa/verify-variants.py [--discover]

Never writes to the live tree. Later work is removed first through the shared removal chain.
"""

from __future__ import annotations

import importlib.util
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
LIVE = (HERE.parents[1] / "Part F — Cross-Platform Delivery"
        / "PART F — Phase 0 Source Reorganization for Maintainability")
HARNESS = HERE / "identity-harness.js"
REMOVER = HERE / "remove-phase.py"
FRAGMENT = "src/sheet/209.9998-feat-modes-identity.js"
STYLE = "src/css/59.999-feat-modes-identity.css"
THIS_RELEASE = "PART K — Phase 12.2 Play Mode Identity"


def _removal_chain():
    for directory in HERE.parents:
        candidate = directory / "QA — Removal Chain Registry" / "removal_chain.py"
        if candidate.is_file():
            spec = importlib.util.spec_from_file_location("removal_chain", candidate)
            module = importlib.util.module_from_spec(spec)
            sys.modules[spec.name] = module
            spec.loader.exec_module(module)
            return module
    raise RuntimeError("QA — Removal Chain Registry/removal_chain.py not found")


def edit(old, new, target=FRAGMENT):
    def apply(tree: Path):
        path = tree / target
        text = path.read_bytes().decode("utf-8")
        assert text.count(old) == 1, f"variant edit does not apply exactly once: {old[:60]!r}"
        path.write_bytes(text.replace(old, new).encode("utf-8"))
    return apply


def remove_part(tree: Path):
    _removal_chain().strip_later(tree, after=THIS_RELEASE)
    subprocess.run([sys.executable, str(REMOVER), str(tree)], check=True, capture_output=True)


def no_style(tree: Path):
    (tree / STYLE).write_bytes(b"  /* emptied for the variant */\n")


VARIANTS = {
    "part removed": remove_part,
    "master switch off": edit("const MODES122_ENABLED = true;", "const MODES122_ENABLED = false;"),
    "points locked too": edit("      '#f_honorRank', '#f_gloryRank', '#f_statusRank',", "      '#f_honorRank', '#f_gloryRank', '#f_statusRank', '#f_honorPts',"),
    "name left out": edit("      '#f_name', '#f_clan',", "      '#f_clan',"),
    "+ Add School left out": edit("      '#btnAddSchoolToggle', '#addSchoolSelect'", "      '#addSchoolSelect'"),
    "no stylesheet": no_style,
}

# Pinned from the discovery run of 25 September 2026.
EXPECTED = {
    "part removed": ['ID122-BACK-TO-MANAGEMENT', 'ID122-ENABLED', 'ID122-OPEN-FROM-LIST-LOCKS-THE-TAB', 'ID122-PLAY-ADD-SCHOOL-INERT', 'ID122-PLAY-FIELDS-READ-ONLY', 'ID122-PLAY-NAME-EVENTS-STOPPED', 'ID122-PLAY-NAME-TYPING-BLOCKED', 'ID122-PLAY-RANK-TYPING-BLOCKED', 'ID122-PLAY-SHOWS-PLAIN-TEXT', 'ID122-PLAY-XP-TYPING-BLOCKED'],
    "master switch off": ['ID122-BACK-TO-MANAGEMENT', 'ID122-ENABLED', 'ID122-OPEN-FROM-LIST-LOCKS-THE-TAB', 'ID122-PLAY-ADD-SCHOOL-INERT', 'ID122-PLAY-FIELDS-READ-ONLY', 'ID122-PLAY-NAME-EVENTS-STOPPED', 'ID122-PLAY-NAME-TYPING-BLOCKED', 'ID122-PLAY-RANK-TYPING-BLOCKED', 'ID122-PLAY-SHOWS-PLAIN-TEXT', 'ID122-PLAY-XP-TYPING-BLOCKED'],
    "points locked too": ['ID122-OPEN-FROM-LIST-LOCKS-THE-TAB', 'ID122-PLAY-HONOR-POINTS-EVENTS-REACH', 'ID122-PLAY-POINTS-AND-TAINT-EDITABLE'],
    "name left out": ['ID122-BACK-TO-MANAGEMENT', 'ID122-OPEN-FROM-LIST-LOCKS-THE-TAB', 'ID122-PLAY-FIELDS-READ-ONLY',
                      'ID122-PLAY-NAME-EVENTS-STOPPED', 'ID122-PLAY-NAME-TYPING-BLOCKED', 'ID122-PLAY-SHOWS-PLAIN-TEXT'],
    "+ Add School left out": ['ID122-PLAY-ADD-SCHOOL-INERT'],
    "no stylesheet": ['ID122-PLAY-SHOWS-PLAIN-TEXT'],
}


def run_variant(name, work: Path):
    tree = work / re.sub(r"\W+", "-", name)
    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns("l5r-character-sheet.html"))
    VARIANTS[name](tree)
    subprocess.run([sys.executable, str(tree / "build/recombine.py")], check=True, capture_output=True)
    out = subprocess.run(["node", str(HARNESS), str(tree / "l5r-character-sheet.html")],
                         capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=1800)
    text = (out.stdout or "") + (out.stderr or "")
    failed = sorted(set(re.findall(r"^FAIL (\S+)", text, re.M)))
    count = re.search(r"(\d+)/(\d+) checks passed", text)
    return failed, count.group(0) if count else "no count"


def main() -> int:
    discover = "--discover" in sys.argv or EXPECTED is None
    bad = 0
    with tempfile.TemporaryDirectory(prefix="l5r-pm12-variant-") as work:
        for name in VARIANTS:
            failed, count = run_variant(name, Path(work))
            if discover:
                print(f"---- {name}: {count}\n     {failed}")
                continue
            ok = failed == sorted(EXPECTED[name])
            bad += not ok
            print(f"{'OK  ' if ok else 'BAD '} {name}: {count}; failed {len(failed)}"
                  + ("" if ok else f"\n     expected {sorted(EXPECTED[name])}\n     actual   {failed}"))
    if not discover:
        print("VARIANTS " + ("all as expected" if not bad else f"{bad} NOT as expected"))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
