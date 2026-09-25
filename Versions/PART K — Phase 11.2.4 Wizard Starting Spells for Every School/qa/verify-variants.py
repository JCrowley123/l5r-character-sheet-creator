#!/usr/bin/env python3
"""Prove each part of the phase is load-bearing: build deliberately broken variants in scratch
copies of the Phase 0 tree and show the harness fails exactly where it should.

    NODE_PATH=/opt/node22/lib/node_modules python3 qa/verify-variants.py [variant name ...]

Never writes to the live tree. Each variant edits ONE thing in a fresh copy, rebuilds with that
copy's own recombine.py, and runs wizard5-harness.js against the result. The previous build
(the phase removed) and the switch turned off are run too, and reported rather than pinned.
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
LIVE = (HERE.parents[1] / "Part F — Cross-Platform Delivery"
        / "PART F — Phase 0 Source Reorganization for Maintainability")
FRAGMENT = "src/sheet/209.998-feat-wizard-starting-spells-all.js"
HARNESS = HERE / "wizard5-harness.js"
REMOVER = HERE / "remove-phase.py"

VARIANTS = [
    ("Deficiency ignored", [("      if(slot.notDeficient && deficiency && s.element === deficiency) return false;\n", "")], ["CW5-CHUDA-DEFICIENCY", "CW5-CHUDA-OPTIONS-MATCH-SHEET"]),
    ("one-Element boxes take any Element", [("(!slots[k].oneElement || spells[si].element === chosen[k])", "true")], ["CW5-CHUDA-DEFICIENCY", "CW5-EARLIER-BOXES-FIRST", "CW5-ISAWA-BEST-FIT", "CW5-ISAWA-FILLED", "CW5-ISAWA-OPTIONS-SHRINK"]),
    ("boxes of one group may share an Element", [("if(chosen[a] && chosen[a] === chosen[b] && slots[a].group && slots[a].group === slots[b].group) return;", "")], ["CW5-ISAWA-OPTIONS-SHRINK"]),
    ("earlier boxes not filled first", [("return [sum(have)].concat(have).concat(", "return [sum(have)].concat(")], ["CW5-EARLIER-BOXES-FIRST"]),
    ("Maho allowed in every box", [("      if(maho === 'no' && s.maho) return false;\n", "")], ["CW5-ISAWA-OPTIONS-MATCH-SHEET", "CW5-ISAWA-OPTIONS-SHRINK", "CW5-YOGO-OPTIONS-MATCH-SHEET"]),
    ("Yogo's quoted list ignored", [(" || YOGO_TREATED_AS_WARDS.indexOf(s.name) >= 0", "")], ["CW5-YOGO-BOXES", "CW5-YOGO-WARDS"]),
    ("picker ignores the sheet's gate", [("        if(!s.maho && !spellEligibility(s).eligible) return false;\n", "")], ["CW5-CHUDA-OPTIONS-MATCH-SHEET", "CW5-ISAWA-OPTIONS-MATCH-SHEET", "CW5-ISAWA-OPTIONS-SHRINK", "CW5-YOGO-OPTIONS-MATCH-SHEET"]),
    ("Fuzake's Path to Inner Peace not given", [("given: ['Sense', 'Commune', 'Summon', 'Path to Inner Peace'],", "given: ['Sense', 'Commune', 'Summon'],")], ["CW5-FUZAKE-PATH-GIVEN", "CW5-LINE-FUZAKE-SHUGENJA", "CW5-WALK-FUZAKE-SHUGENJA"]),
    ("a School's line changed (Kuni)", [("'Kuni Shugenja': {source: 'Core Rulebook p.107', given: ['Sense', 'Commune', 'Summon'], choose: [['Earth', 3], ['Fire', 2], ['Water', 1]]}",
                                        "'Kuni Shugenja': {source: 'Core Rulebook p.107', given: ['Sense', 'Commune', 'Summon'], choose: [['Earth', 3], ['Water', 2], ['Fire', 1]]}")], ["CW5-LINE-KUNI-SHUGENJA", "CW5-WALK-KUNI-SHUGENJA"]),
]


def build_variant(work: Path, edits) -> Path:
    tree = work / "tree"
    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns("l5r-character-sheet.html"))
    if edits == "remove":
        subprocess.run([sys.executable, str(REMOVER), str(tree)], check=True, capture_output=True)
    else:
        fragment = tree / FRAGMENT
        text = fragment.read_text(encoding="utf-8")
        for old, new in edits:
            assert text.count(old) == 1, f"variant anchor not unique: {old[:70]}"
            text = text.replace(old, new)
        fragment.write_text(text, encoding="utf-8")
    subprocess.run([sys.executable, str(tree / "build/recombine.py")], check=False, capture_output=True)
    return tree / "l5r-character-sheet.html"


def run(sheet: Path):
    out = subprocess.run(["node", str(HARNESS), str(sheet)], capture_output=True, text=True, timeout=1800)
    text = out.stdout + out.stderr
    failed = sorted(set(re.findall(r"^FAIL (\S+)", text, re.M)))
    count = re.search(r"(\d+)/(\d+) checks passed", text)
    return failed, (count.group(0) if count else "no count"), text


def main() -> int:
    problems = 0
    plan = [(n, e, x) for n, e, x in VARIANTS]
    plan += [("previous build (phase removed)", "remove", None),
             ("switch off", [("const WIZARD_STARTING_SPELLS_ALL_ENABLED = true;", "const WIZARD_STARTING_SPELLS_ALL_ENABLED = false;")], None)]
    only = sys.argv[1:]
    for name, edits, expected in plan:
        if only and name not in only:
            continue
        with tempfile.TemporaryDirectory(prefix="l5r-cw1124-variant-") as work:
            failed, count, text = run(build_variant(Path(work), edits))
        if expected is None:
            print(f"INFO {name}: {count}; failed {failed}")
            continue
        ok = set(failed) == set(expected)
        problems += 0 if ok else 1
        print(f"{'OK  ' if ok else 'BAD '} {name}: {count}; failed {failed}"
              + ("" if ok else f"\n     expected {sorted(expected)}"))
    print("VARIANTS", "all fail where expected" if problems == 0 else f"{problems} variant(s) off target")
    return 0 if problems == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
