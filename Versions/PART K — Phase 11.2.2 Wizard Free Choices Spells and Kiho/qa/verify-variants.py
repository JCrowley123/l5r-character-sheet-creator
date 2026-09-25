#!/usr/bin/env python3
"""Prove each part of the phase is load-bearing: build deliberately broken variants in scratch
copies of the Phase 0 tree and show the harness fails exactly where it should.

    NODE_PATH=/opt/node22/lib/node_modules python3 qa/verify-variants.py

Never writes to the live tree. Each variant edits ONE thing in a fresh copy, rebuilds with that
copy's own recombine.py, and runs wizard3-harness.js against the result. The previous build
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
FRAGMENT = "src/sheet/209.996-feat-wizard-free-choices.js"
CSS_ENTRY = "src/css/59.996-feat-wizard-free-choices.css"
HARNESS = HERE / "wizard3-harness.js"
REMOVER = HERE / "remove-phase.py"

VARIANTS = [
    ("split choices not joined", [("          while(!/\\bskills?\\b/i.test(text) && i + 1 < parts.length){", "          while(false){")],
     ["CW2-LIBRARY-NO-SPLIT-CHOICE", "CW2-FORM-JOINED"]),
    ("categories not read", [("      if(!spec.words.length){\n        chosen = all;", "      if(true){\n        chosen = all;")],
     ["CW2-KAKITA-OPTIONS", "CW2-LIBRARY-EVERY-CATEGORY-READ", "CW2-FORM-FROM-LIST", "CW2-FORM-BUGEI"]),
    ("one box per choice, not per Skill", [("        for(let i = 1; i <= spec.count; i++){", "        for(let i = 1; i <= 1; i++){")],
     ["CW2-MONK-TWO-SLOTS", "CW2-MONK-NUDGE-LISTS-ALL", "CW2-REVIEW-LISTS-KIHO"]),
    ("no reminder on Next", [("      if(step && !CW112.busy && !step.check() && CW1122.nudged !== step.id && CW1122.openFor(step.id).length){", "      if(false){")],
     # Without the reminder, Next leaves at once, so each scenario is on a later step than its next
     # check expects: the Kakita, Spells and monk walks stop there.
     ["CW2-MONK-NUDGE-LISTS-ALL", "CW2-SCENARIO-RAN-KAKITA", "CW2-SCENARIO-RAN-MONK", "CW2-SCENARIO-RAN-SPELLS", "CW2-SPELLS-NUDGE"]),
    ("spell learned without its scroll", [("      if(!hasSpellScroll(s.name)){\n        renderSpellScrollsList('');", "      if(false){\n        renderSpellScrollsList('');")],
     # The sheet's own picker refuses a spell with no scroll, so nothing is learned.
     ["CW2-SAME-AS-BY-HAND-SPELLS", "CW2-SCENARIO-RAN-SPELLS", "CW2-SPELL-ADDED", "CW2-SPELL-LEAVES-PICKER", "CW2-SPELL-NO-NUDGE-ONCE-CHOSEN"]),
    ("Remove leaves the scroll behind", [("      if(scroll) scroll.querySelector('.rm-btn').click();", "")],
     ["CW2-SPELL-REMOVED-WITH-SCROLL"]),
    ("named Lore kept through a School change", [("      CW1122.unnameLore();\n      CW1122.lore = {};\n      return cw1122PreviousApplySchool", "      CW1122.lore = {};\n      return cw1122PreviousApplySchool")],
     ["CW2-LORE-GOES-WITH-SCHOOL"]),
    ("Bugei offers Weapon (Low) again", [("      bugei: ['Bugei', 'Weapon'],", "      bugei: ['Bugei', 'Weapon', 'Weapon (Low)'],")],
     ["CW2-KAKITA-OPTIONS", "CW2-FORM-BUGEI"]),
    ("non-Bugei keeps Weapon (Low)", [("        const drop = EXCLUDE[w] || GROUPS[w] || [];", "        const drop = GROUPS[w] || [];")],
     ["CW2-FORM-BUGEI"]),
    ("Kiho step for everyone", [("      return !!(ent.brotherhood && ent.grantedAllowance > 0);", "      return true;")],
     # A Bushi then passes through a Kiho step, so "Next" from Skills no longer reaches Advantages.
     ["CW2-BUSHI-NO-EXTRA-STEPS", "CW2-NO-NUDGE-WHEN-CHOSEN", "CW2-NUDGE-SECOND-NEXT-LEAVES", "CW2-SHUGENJA-STEPS"]),
]


def build_variant(work: Path, edits) -> Path:
    tree = work / "tree"
    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns("l5r-character-sheet.html"))
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
             ("switch off", [("const WIZARD_FREE_CHOICES_ENABLED = true;", "const WIZARD_FREE_CHOICES_ENABLED = false;")], None),
             ("no stylesheet", "no-css", ["CW2-TOUCH-TARGETS-LORE"])]
    only = sys.argv[1:]
    for name, edits, expected in plan:
        if only and name not in only:
            continue
        with tempfile.TemporaryDirectory(prefix="l5r-cw1122-variant-") as work:
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
