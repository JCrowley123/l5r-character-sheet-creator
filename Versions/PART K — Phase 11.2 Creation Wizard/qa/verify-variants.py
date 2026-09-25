#!/usr/bin/env python3
"""Prove each part of the phase is load-bearing: build deliberately broken variants in scratch
copies of the Phase 0 tree and show the harness fails exactly where it should.

    NODE_PATH=/opt/node22/lib/node_modules python3 qa/verify-variants.py

Never writes to the live tree. Each variant edits ONE thing in a fresh copy, rebuilds with that
copy's own recombine.py, and runs wizard-harness.js against the result. The previous build
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
FRAGMENT = "src/sheet/209.994-feat-creation-wizard.js"
CSS_ENTRY = "src/css/59.994-feat-creation-wizard.css"
HARNESS = HERE / "wizard-harness.js"
REMOVER = HERE / "remove-phase.py"

VARIANTS = [
    ("Trait set without its input event", [("        input.value = Math.max(1, Math.min(10, parseInt(input.value || '0', 10) + step));\n        fire(input, 'input');\n",
                                            "        input.value = Math.max(1, Math.min(10, parseInt(input.value || '0', 10) + step));\n")],
     # The sheet never recalculates XP, so the overspend goes unseen. The final data still matches
     # by hand only because the later Void stepper recalculates everything.
     ["CW-OVERSPEND-BLOCKS"]),
    ("no start-over on a new Clan", [("              if(!(await api.startOverIfApplied())) return;\n              api.state.clan = o.value;",
                                      "              api.state.clan = o.value;")],
     # The scenario waits for the start-over question that never comes.
     ["CW-SCENARIO-RAN-CLAN-CHANGE"]),
    ("School step does not wait for its questions", [("        await new Promise(function(resolve){", "        await new Promise(function(resolve){ return resolve();")],
     # Next is not held while the question is open, and every walk through the School stalls.
     ["CW-SCHOOL-QUESTION-ABOVE", "CW-SCENARIO-RAN-WALK", "CW-SCENARIO-RAN-SAME-AS-BY-HAND", "CW-SCENARIO-RAN-CLAN-CHANGE"]),
    ("no validator gate on Traits", [("          const errs = errorsFor(TRAIT_RULES);\n          return errs.length ? errs[0].title : '';",
                                      "          return '';")],
     ["CW-OVERSPEND-BLOCKS"]),
    ("Finish not gated by errors", [("          const errs = errorsFor(null);\n          return errs.length ? 'Fix the errors above to finish: ' + errs[0].title : '';",
                                     "          return '';")],
     ["CW-FINISH-BLOCKED-BY-ERROR"]),
    # Phase 5 (Part J) has no remover script; its absence is simulated in this fragment.
    ("Phase 5 (Part J) validator absent", [("      if(typeof validateCharacter !== 'function') return null;", "      return null;")],
     None),
    ("Family chosen but not applied", [("              $('cfs_applyFamily').click();\n", "")],
     # Next never unlocks after the Family, so every walk past it stalls.
     ["CW-FAMILY-APPLIED", "CW-SCENARIO-RAN-WALK", "CW-SCENARIO-RAN-SAME-AS-BY-HAND", "CW-SCENARIO-RAN-CLAN-CHANGE"]),
]


# Later Part K stages depend on this one, so this phase's remover refuses while any is present.
# The "phase removed" variant removes them first (newest first, each by its own remover),
# so it can reach this phase's own remover at all. Every other variant runs on the live tree.
LATER_STAGES = (
    ("PART K — Phase 11.2.4 Wizard Starting Spells for Every School", "src/sheet/209.998-feat-wizard-starting-spells-all.js"),
    ("PART K — Phase 11.2.3 Wizard Starting Spells", "src/sheet/209.997-feat-wizard-starting-spells.js"),
    ("PART K — Phase 11.2.2 Wizard Free Choices Spells and Kiho", "src/sheet/209.996-feat-wizard-free-choices.js"),
    ("PART K — Phase 11.2.1 Wizard Skills and Advantages", "src/sheet/209.995-feat-wizard-skills-advantages.js"),
)


def strip_later(tree: Path) -> None:
    for folder, fragment in LATER_STAGES:
        if (tree / fragment).is_file():
            subprocess.run([sys.executable, str(HERE.parents[1] / folder / "qa" / "remove-phase.py"), str(tree)],
                           check=True, capture_output=True)


def build_variant(work: Path, edits) -> Path:
    tree = work / "tree"
    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns("l5r-character-sheet.html"))
    if edits == "remove":
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
             ("switch off", [("const CREATION_WIZARD_ENABLED = true;", "const CREATION_WIZARD_ENABLED = false;")], None),
             ("no stylesheet", "no-css", ["CW-COVERS-VIEWPORT"])]
    only = sys.argv[1:]
    for name, edits, expected in plan:
        if only and name not in only:
            continue
        with tempfile.TemporaryDirectory(prefix="l5r-cw112-variant-") as work:
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
