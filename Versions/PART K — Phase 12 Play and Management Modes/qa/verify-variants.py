#!/usr/bin/env python3
"""Prove the harness can fail, and that each part of Phase 12's first part is load-bearing: build
broken variants of the live tree in scratch copies and show the harness fails exactly where it
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
HARNESS = HERE / "modes-harness.js"
REMOVER = HERE / "remove-phase.py"
FRAGMENT = "src/sheet/209.9996-feat-play-management-modes.js"
STYLE = "src/css/59.997-feat-play-management-modes.css"
THIS_RELEASE = "PART K — Phase 12 Play and Management Modes"


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
    "master switch off": edit("const MODES12_ENABLED = true;", "const MODES12_ENABLED = false;"),
    "no capture-phase gate": edit("      GATED.forEach(function(type){ document.addEventListener(type, api.gate, true); });\n", ""),
    "fields not locked": edit("      if(TEXTLIKE(el)){ if(!el.readOnly){ el.readOnly = true; changed = 'readonly'; } }",
                              "      if(TEXTLIKE(el)){ }"),
    "unlock touches the sheet's own read-only": edit("      if(TEXTLIKE(el)){ if(!el.readOnly){ el.readOnly = true; changed = 'readonly'; } }",
                                                     "      if(TEXTLIKE(el)){ el.readOnly = true; changed = 'readonly'; }"),
    "no stylesheet": no_style,
    "list open not hooked": edit("          if(!(typeof CL11.isOpen === 'function' && CL11.isOpen())) MODES12.set('play');\n", ""),
    "wizard Finish not hooked": edit("        MODES12.set('play');\n        return result;", "        return result;"),
    "toolbar Load not hooked": edit("    ['btnLoad', 'btnNew'].forEach(function(id){", "    ['btnNew'].forEach(function(id){"),
    "New Blank not hooked": edit("    ['btnLoad', 'btnNew'].forEach(function(id){", "    ['btnLoad'].forEach(function(id){"),
    "new rows not locked": edit("      Promise.resolve().then(function(){ queued = false; api.lockNew(); });",
                                "      Promise.resolve().then(function(){ queued = false; });"),
}

# Pinned from the discovery run of 25 September 2026. Without the part (or with its switch off) the
# toggle does not exist, so whole scenarios stop at their first click and are counted as one failure.
EXPECTED = {
    "part removed": ['PM12-BLANK-SHEET-IS-MANAGEMENT', 'PM12-ENABLED', 'PM12-OPEN-FROM-LIST-IS-PLAY',
                     'PM12-SAVE-STAYS-MANAGEMENT', 'PM12-SCENARIO-RAN-ENTRY-POINTS', 'PM12-SCENARIO-RAN-TOGGLE-AND-GATE',
                     'PM12-SCENARIO-RAN-WIZARD', 'PM12-TOOLBAR-LOAD-IS-MANAGEMENT'],
    "master switch off": ['PM12-BLANK-SHEET-IS-MANAGEMENT', 'PM12-ENABLED', 'PM12-NEW-BLANK-IS-MANAGEMENT',
                          'PM12-OPEN-FROM-LIST-IS-PLAY', 'PM12-SCENARIO-RAN-TOGGLE-AND-GATE', 'PM12-SCENARIO-RAN-WIZARD'],
    "no capture-phase gate": ['PM12-PLAY-DISPATCHED-EVENT-STOPPED'],
    "fields not locked": ['PM12-OPEN-FROM-LIST-IS-PLAY', 'PM12-PLAY-BACKGROUND-READ-ONLY', 'PM12-REGISTRY-AND-NEW-ROWS'],
    "unlock touches the sheet's own read-only": ['PM12-REGISTRY-AND-NEW-ROWS'],
    "no stylesheet": ['PM12-PLAY-SHOWS-PLAIN-TEXT'],
    "list open not hooked": ['PM12-OPEN-FROM-LIST-IS-PLAY'],
    "wizard Finish not hooked": ['PM12-WIZARD-FINISH-IS-PLAY'],
    "toolbar Load not hooked": ['PM12-TOOLBAR-LOAD-IS-MANAGEMENT'],
    "New Blank not hooked": ['PM12-NEW-BLANK-IS-MANAGEMENT'],
    "new rows not locked": ['PM12-REGISTRY-AND-NEW-ROWS'],
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
