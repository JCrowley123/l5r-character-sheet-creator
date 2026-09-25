#!/usr/bin/env python3
"""Prove each part of the phase is load-bearing: build deliberately broken variants in scratch
copies of the Phase 0 tree and show the harness fails exactly where it should.

    NODE_PATH=/opt/node22/lib/node_modules python3 qa/verify-variants.py [variant name ...]

Never writes to the live tree. Each variant edits ONE thing in a fresh copy, rebuilds with that
copy's own recombine.py, and runs import-filter-harness.js against the result. The previous build
(the fix removed) and the switch turned off are run too.
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
FRAGMENT = "src/sheet/209.999-bugfix-import-file-filter.js"
HARNESS = HERE / "import-filter-harness.js"
REMOVER = HERE / "remove-phase.py"

VARIANTS = [
    ("Characters screen control not lifted after its build", [("        IMPORT_FILE_FILTER.lift();\n        return view;", "        return view;")],
     ["IF-NO-FILTER-LIST", "IF-NO-FILTER-LIST-REOPENED"]),
]
# Not a variant: removing the load-time lift changes nothing measurable here (10/10, measured),
# because Phase 11 (Part K) builds its Characters screen at startup and this fix's wrapper then
# lifts both controls. The load-time lift is for a build without that screen.


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
    filters = ["IF-ENABLED", "IF-NO-FILTER-LIST", "IF-NO-FILTER-LIST-REOPENED", "IF-NO-FILTER-TOOLBAR"]
    plan += [("previous build (fix removed)", "remove", filters),
             ("switch off", [("const IMPORT_FILE_FILTER_FIX_ENABLED = true;", "const IMPORT_FILE_FILTER_FIX_ENABLED = false;")], filters)]
    only = sys.argv[1:]
    for name, edits, expected in plan:
        if only and name not in only:
            continue
        with tempfile.TemporaryDirectory(prefix="l5r-importfilter-variant-") as work:
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
