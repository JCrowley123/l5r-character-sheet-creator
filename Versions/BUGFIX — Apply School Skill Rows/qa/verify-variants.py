#!/usr/bin/env python3
"""Prove the harness can fail, and that each part of the fix is load-bearing: build nine broken
variants of the live tree in scratch copies and show the harness fails exactly where it should.

    NODE_PATH=<global node_modules> python3 qa/verify-variants.py [--discover]

Never writes to the live tree. Later work is removed first by the shared removal chain, so the
"fix removed" variant reaches this fix's own remover. --discover prints each variant's failures
without comparing them, for pinning.
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
HARNESS = HERE / "school-skill-rows-harness.js"
REMOVER = HERE / "remove-phase.py"
FRAGMENT = "src/sheet/209.9995-bugfix-school-skill-rows.js"
THIS_RELEASE = "BUGFIX — Apply School Skill Rows"


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


def edit(old, new):
    def apply(tree: Path):
        path = tree / FRAGMENT
        text = path.read_bytes().decode("utf-8")
        assert text.count(old) == 1, f"variant edit does not apply exactly once: {old[:60]!r}"
        path.write_bytes(text.replace(old, new).encode("utf-8"))
    return apply


def remove_fix(tree: Path):
    _removal_chain().strip_later(tree, after=THIS_RELEASE)
    subprocess.run([sys.executable, str(REMOVER), str(tree)], check=True, capture_output=True)


VARIANTS = {
    "fix removed": remove_fix,
    "master switch off": edit("const SCHOOL_SKILL_ROWS_FIX_ENABLED = true;", "const SCHOOL_SKILL_ROWS_FIX_ENABLED = false;"),
    "no Trait fill": edit("      if(!SCHOOL_SKILL_ROWS_FIX_ENABLED || !tr || !tr.querySelector) return false;\n",
                          "      return false;\n"),
    "Trait fill overwrites": edit("if(!traitEl || !nameEl || traitEl.value.trim()) return false;", "if(!traitEl || !nameEl) return false;"),
    "no library corrections": edit("    api.correctLibrary = function(){\n", "    api.correctLibrary = function(){ return;\n"),
    "no old-name aliases": edit("api.ALIASES = {'theology':'Lore: Theology', 'war fans':'War Fan'};", "api.ALIASES = {};"),
    "Apply School reads pieces": edit("      if(!SCHOOL_SKILL_ROWS_FIX_ENABLED) return null;\n      const verdicts = [];",
                                      "      return null;\n      const verdicts = [];"),
    "brackets split": edit("while(depth(text) > 0 && i + 1 < parts.length)", "while(false && depth(text) > 0 && i + 1 < parts.length)"),
    "character check not reread": edit("if(typeof validatorConcreteSkills === 'function'){", "if(false){"),
    # Added after the first discovery run: three checks no variant could turn red.
    "continuations counted as choices": edit("for(let k = 1; k < g.pieces; k++) verdicts.push('continuation');",
                                             "for(let k = 1; k < g.pieces; k++) verdicts.push('choice');"),
    "unknown names get a Trait": edit("return family ? findSkill(family[1]) : null;", "return family ? findSkill(family[1]) : findSkill('Lore');"),
    "choice slots not reread": edit("if(typeof validatorChoiceSlots === 'function'){", "if(false){"),
}

_REMOVED = ['SSR-ENABLED', 'SSR-JUROJIN-MEDICINE-EMPHASES', 'SSR-JUROJIN-MEDICINE-WHOLE', 'SSR-KAIU-WAR-FAN',
            'SSR-KASUGA-ROWS', 'SSR-KITSU-LORES', 'SSR-LIBRARY-KAIU', 'SSR-LIBRARY-MIRUMOTO', 'SSR-LIBRARY-SHIBA',
            'SSR-LORE-ROW-ROLLS', 'SSR-MIRUMOTO-LORE-THEOLOGY', 'SSR-OLD-SAVE-LORE-TRAIT-FILLED',
            'SSR-OLD-SAVE-OLD-NAME-KEPT-AND-FILLED', 'SSR-SECOND-SCHOOL-READS-CORRECTED-LIBRARY', 'SSR-SHIBA-LORE-THEOLOGY',
            'SSR-SWEEP-EVERY-ROW-IS-A-SKILL', 'SSR-SWEEP-NO-BLANK-TRAIT', 'SSR-SWEEP-NO-PLACEHOLDER-ROWS',
            'SSR-SWEEP-TRAIT-MATCHES-LIBRARY', 'SSR-TSI-FOUR-CHOICE-SLOTS', 'SSR-TSI-FOUR-CHOICES-LEFT', 'SSR-TSI-ROWS',
            'SSR-TYPED-FAMILY-NAME-FILLS']
# Pinned from the discovery runs of 25 September 2026. The removed build also fails the unlock check,
# because the seam does not export it there; with the switch off it is exported and the trunk
# answers for the uncorrected library, so it passes.
EXPECTED = {
    "fix removed": _REMOVED + ['SSR-OLD-NAME-SATISFIES-SECOND-SCHOOL-UNLOCK'],
    "master switch off": _REMOVED,
    "no Trait fill": ['SSR-KITSU-LORES', 'SSR-LORE-ROW-ROLLS', 'SSR-MIRUMOTO-LORE-THEOLOGY', 'SSR-OLD-SAVE-LORE-TRAIT-FILLED',
                      'SSR-OLD-SAVE-OLD-NAME-KEPT-AND-FILLED', 'SSR-SHIBA-LORE-THEOLOGY', 'SSR-SWEEP-NO-BLANK-TRAIT',
                      'SSR-SWEEP-TRAIT-MATCHES-LIBRARY', 'SSR-TYPED-FAMILY-NAME-FILLS'],
    "Trait fill overwrites": ['SSR-EXISTING-TRAIT-NEVER-OVERWRITTEN'],
    "no library corrections": ['SSR-KAIU-WAR-FAN', 'SSR-LIBRARY-KAIU', 'SSR-LIBRARY-MIRUMOTO', 'SSR-LIBRARY-SHIBA',
                               'SSR-MIRUMOTO-LORE-THEOLOGY', 'SSR-SECOND-SCHOOL-READS-CORRECTED-LIBRARY',
                               'SSR-SHIBA-LORE-THEOLOGY', 'SSR-SWEEP-EVERY-ROW-IS-A-SKILL'],
    "no old-name aliases": ['SSR-OLD-NAME-SATISFIES-CHARACTER-CHECK', 'SSR-OLD-NAME-SATISFIES-SECOND-SCHOOL-UNLOCK',
                            'SSR-OLD-SAVE-OLD-NAME-KEPT-AND-FILLED'],
    "Apply School reads pieces": ['SSR-JUROJIN-MEDICINE-EMPHASES', 'SSR-JUROJIN-MEDICINE-WHOLE', 'SSR-KASUGA-ROWS',
                                  'SSR-SWEEP-EVERY-ROW-IS-A-SKILL', 'SSR-SWEEP-NO-BLANK-TRAIT', 'SSR-SWEEP-NO-PLACEHOLDER-ROWS',
                                  'SSR-TSI-FOUR-CHOICES-LEFT', 'SSR-TSI-ROWS'],
    "brackets split": ['SSR-JUROJIN-MEDICINE-EMPHASES', 'SSR-JUROJIN-MEDICINE-WHOLE', 'SSR-SWEEP-EVERY-ROW-IS-A-SKILL',
                       'SSR-SWEEP-NO-BLANK-TRAIT', 'SSR-SWEEP-NO-PLACEHOLDER-ROWS'],
    "character check not reread": ['SSR-TSI-NO-FALSE-MISSING-SKILLS'],
    "continuations counted as choices": ['SSR-KASUGA-ONE-CHOICE-LEFT', 'SSR-TSI-FOUR-CHOICES-LEFT'],
    "unknown names get a Trait": ['SSR-OLD-SAVE-PLACEHOLDERS-KEPT', 'SSR-UNKNOWN-NAME-STAYS-BLANK'],
    "choice slots not reread": ['SSR-TSI-FOUR-CHOICE-SLOTS'],
}


def run_variant(name, work: Path):
    tree = work / re.sub(r"\W+", "-", name)
    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns("l5r-character-sheet.html"))
    VARIANTS[name](tree)
    subprocess.run([sys.executable, str(tree / "build/recombine.py")], check=True, capture_output=True)
    out = subprocess.run(["node", str(HARNESS), str(tree / "l5r-character-sheet.html")],
                         capture_output=True, text=True, timeout=1800)
    text = out.stdout + out.stderr
    failed = sorted(set(re.findall(r"^FAIL (\S+)", text, re.M)))
    count = re.search(r"(\d+)/(\d+) checks passed", text)
    return failed, count.group(0) if count else "no count"


def main() -> int:
    discover = "--discover" in sys.argv
    bad = 0
    with tempfile.TemporaryDirectory(prefix="l5r-ssr-variant-") as work:
        for name in VARIANTS:
            failed, count = run_variant(name, Path(work))
            if discover or EXPECTED is None:
                print(f"---- {name}: {count}\n     {failed}")
                continue
            ok = failed == sorted(EXPECTED[name])
            bad += not ok
            print(f"{'OK  ' if ok else 'BAD '} {name}: {count}; failed {len(failed)}"
                  + ("" if ok else f"\n     expected {sorted(EXPECTED[name])}\n     actual   {failed}"))
    if EXPECTED is not None and not discover:
        print("VARIANTS " + ("all as expected" if not bad else f"{bad} NOT as expected"))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
