#!/usr/bin/env python3
"""Prove each part of the phase is load-bearing: build deliberately broken variants in scratch
copies of the Phase 0 tree and show the harness fails exactly where it should.

    NODE_PATH=/opt/node22/lib/node_modules python3 qa/verify-variants.py

Never writes to the live tree. Each variant edits ONE thing in a fresh copy, rebuilds with that
copy's own recombine.py, and runs wizard2-harness.js against the result. The previous build
(the phase removed) is run too.
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
FRAGMENT = "src/sheet/209.995-feat-wizard-skills-advantages.js"
CSS_ENTRY = "src/css/59.995-feat-wizard-skills-advantages.css"
HARNESS = HERE / "wizard2-harness.js"
REMOVER = HERE / "remove-phase.py"

VARIANTS = [
    ("free choices not narrowed", [("      if(!m) return all;\n", "      return all;\n")],
     ["CW1-SLOT-LORE-NARROWED", "CW1-SLOT-HIGH-NARROWED"]),
    ("free choice not ticked as School", [("      if(asSchool){", "      if(false){")],
     # The slot row is added unticked, so it costs XP and differs from the same choice by hand.
     ["CW1-SLOT-ROW", "CW1-BOTH-SLOTS", "CW1-SAME-AS-BY-HAND"]),
    ("no overspend gate on Skills", [("      check: function(){ return overspend(); },", "      check: function(){ return ''; },")],
     ["CW1-OVERSPEND-BLOCKS"]),
    ("Advantage step does not wait for its question", [("            if(!asking && Date.now() - started > 150) return resolve();", "            return resolve();")],
     ["CW1-CONFIG-ASKS-ABOVE"]),
    ("new School keeps the old free choices", [("      if(CW1121.slotSchool && CW112.appliedSchool() !== CW1121.slotSchool){", "      if(false){")],
     ["CW1-SCHOOL-CHANGE-CLEARS-SLOTS"]),
    ("Review keeps the not-yet note", [("          if(/^Skills and Advantages\\/Disadvantages are not in the wizard yet/.test(n.textContent)) n.remove();", "")],
     ["CW1-REVIEW"]),
]


# Later Part K stages depend on this one, so this phase's remover refuses while any is present.
# Every variant here runs with them removed first (newest first, each by its own remover): a
# later stage replaces some of this phase's code, so a variant of that code only shows without it.
LATER_STAGES = (
    ("PART K — Phase 11.2.3 Wizard Starting Spells", "src/sheet/209.997-feat-wizard-starting-spells.js"),
    ("PART K — Phase 11.2.2 Wizard Free Choices Spells and Kiho", "src/sheet/209.996-feat-wizard-free-choices.js"),
)


def strip_later(tree: Path) -> None:
    for folder, fragment in LATER_STAGES:
        if (tree / fragment).is_file():
            subprocess.run([sys.executable, str(HERE.parents[1] / folder / "qa" / "remove-phase.py"), str(tree)],
                           check=True, capture_output=True)


def build_variant(work: Path, edits) -> Path:
    tree = work / "tree"
    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns("l5r-character-sheet.html"))
    strip_later(tree)
    if edits == "remove":
        subprocess.run([sys.executable, str(REMOVER), str(tree)], check=True, capture_output=True)
    elif edits == "no-css":
        manifest = tree / "build/manifest.json"
        text = manifest.read_text(encoding="utf-8")
        cut = re.compile(r'    \{ "file": "' + re.escape(CSS_ENTRY) + r'",\n      "note": "[^"]*" \},\n')
        text, n = cut.subn("", text)
        assert n == 1, "stylesheet manifest entry not found"
        manifest.write_text(text, encoding="utf-8")
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
             ("switch off", [("const WIZARD_SKILLS_ADV_ENABLED = true;", "const WIZARD_SKILLS_ADV_ENABLED = false;")], None),
             ("no stylesheet", "no-css", ["CW1-TOUCH-TARGETS"])]
    only = sys.argv[1:]
    for name, edits, expected in plan:
        if only and name not in only:
            continue
        with tempfile.TemporaryDirectory(prefix="l5r-cw1121-variant-") as work:
            failed, count, text = run(build_variant(Path(work), edits))
        if expected is None:
            # Broad variants: report what failed; the README records and explains each list.
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
