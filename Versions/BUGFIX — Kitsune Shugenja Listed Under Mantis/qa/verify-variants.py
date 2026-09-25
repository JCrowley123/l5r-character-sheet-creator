#!/usr/bin/env python3
"""Prove the harness can fail: build the tree with the fix removed (the School put back, by this
fix's own remover) in a scratch copy and show the harness fails exactly where it should.

    NODE_PATH=/opt/node22/lib/node_modules python3 qa/verify-variants.py

Never writes to the live tree. Later work built on this fix is removed first, newest first, each
by its own remover, so this fix's remover can reach the pre-fix tree.
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
HARNESS = HERE / "kitsune-mantis-harness.js"
REMOVER = HERE / "remove-phase.py"
LATER_STAGES = (
    ("BUGFIX — Import File Picker Filter", "src/sheet/209.999-bugfix-import-file-filter.js"),
    ("PART K — Phase 11.2.4 Wizard Starting Spells for Every School", "src/sheet/209.998-feat-wizard-starting-spells-all.js"),)
EXPECTED = ["KM-MANTIS-PICKER", "KM-NOT-IN-LIBRARY", "KM-SHUGENJA-SCHOOLS", "KM-WIZARD-MANTIS-CARDS"]


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="l5r-km-variant-") as work:
        tree = Path(work) / "tree"
        shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns("l5r-character-sheet.html"))
        for folder, fragment in LATER_STAGES:
            if (tree / fragment).is_file():
                subprocess.run([sys.executable, str(HERE.parents[1] / folder / "qa" / "remove-phase.py"), str(tree)],
                               check=True, capture_output=True)
        subprocess.run([sys.executable, str(REMOVER), str(tree)], check=True, capture_output=True)
        subprocess.run([sys.executable, str(tree / "build/recombine.py")], check=True, capture_output=True)
        out = subprocess.run(["node", str(HARNESS), str(tree / "l5r-character-sheet.html")], capture_output=True, text=True, timeout=1800)
    text = out.stdout + out.stderr
    failed = sorted(set(re.findall(r"^FAIL (\S+)", text, re.M)))
    count = re.search(r"(\d+)/(\d+) checks passed", text)
    ok = failed == sorted(EXPECTED)
    print(f"{'OK  ' if ok else 'BAD '} fix removed (School put back): {count.group(0) if count else 'no count'}; failed {failed}"
          + ("" if ok else f"\n     expected {sorted(EXPECTED)}"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
