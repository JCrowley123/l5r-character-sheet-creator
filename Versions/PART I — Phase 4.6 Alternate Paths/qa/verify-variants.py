#!/usr/bin/env python3
"""Prove each part of Phase 4.6's first release is load-bearing: build deliberately broken variants in
scratch copies of the Phase 0 tree and show the harness fails exactly where qa/expected-failures.json
says.

    python qa/verify-variants.py [--discover]

Never writes to the live tree. Each variant edits ONE thing in a fresh copy (later releases are
stripped first, through the shared removal chain), rebuilds with that copy's own recombine.py, and
runs alternate-paths-harness.js against the result. --discover prints an oracle candidate for review;
it never updates the oracle. Two boundary builds must be fully green: Phase 12's modes switched off
(this phase does not depend on them), and Phase 4.5.2's Disadvantage configurations switched off (the
save-format chain then ends one step earlier, and this phase's step must follow it). Adapted from
BUGFIX — Ancestor Corrections' verifier.
"""

from __future__ import annotations

import importlib.util
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent


def versions_dir() -> Path:
    for directory in HERE.parents:
        if (directory / "BUILD-LEDGER.md").is_file() and (directory / "CLAUDE.md").is_file():
            return directory
    raise SystemExit("cannot find Versions/ above " + str(HERE))


VERSIONS = versions_dir()
LIVE = VERSIONS / "Part F — Cross-Platform Delivery" / "PART F — Phase 0 Source Reorganization for Maintainability"
FRAGMENT = "src/sheet/209.999993-feat-alternate-paths.js"
HARNESS = HERE / "alternate-paths-harness.js"
REMOVER = HERE / "remove-phase.py"
NODE = shutil.which("node") or r"C:\Program Files\nodejs\node.exe"
THIS_RELEASE = "PART I — Phase 4.6 Alternate Paths"


def removal_chain():
    location = VERSIONS / "QA — Removal Chain Registry" / "removal_chain.py"
    spec = importlib.util.spec_from_file_location("removal_chain", location)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def edit(old, new, target=FRAGMENT):
    def apply(tree):
        path = tree / target
        text = path.read_text(encoding="utf-8")
        assert text.count(old) == 1, f"variant anchor not unique in {target}: {old[:70]}"
        path.write_text(text.replace(old, new), encoding="utf-8")
    return apply


def removed(tree):
    subprocess.run([sys.executable, str(REMOVER), str(tree)], check=True, capture_output=True)


VARIANTS = {
    "phase removed": removed,
    "switch off": edit("const ALTERNATE_PATHS_ENABLED = true;", "const ALTERNATE_PATHS_ENABLED = false;"),
    # Without the Clan filter, "any Crab Bushi School" is any Bushi School; without the type filter,
    # any Crab School.
    "no Clan filter": edit("      if(clause.clan && AP46.schoolClans(schoolName).indexOf(clause.clan) < 0) return false;\n", ""),
    "no type filter": edit("      if(clause.type && types.indexOf(clause.type) < 0) return false;\n", ""),
    # A record read as one list for every School: the kickoff's risk 1 comes back.
    "record not per School": edit("return Object.assign({}, AP46.record()[school] || {});",
                                  "const all = AP46.record(); return Object.assign.apply(null, [{}].concat(Object.keys(all).map(function(k){ return all[k]; })));"),
    "unlock reads the active School": edit("context = String(schoolName || '').trim();", "context = null;"),
    "Rank not read per clause": edit("return hit ? hit.rank : (path.techRank || null);", "return path.techRank || null;"),
    "picker label uses techRank": edit("(AP46.rankFor(p, school) || p.techRank)", "p.techRank"),
    "new requirements ignored": edit("const unmet = ap46Unmet.apply(this, arguments).concat(AP46.extraUnmet(path));",
                                     "const unmet = ap46Unmet.apply(this, arguments);"),
    "Kiho rule off": edit("if(!ent || !ent.brotherhood) return ent;", "return ent;"),
    "every Path counted as first": edit("      if(!api.isFirst(schoolName, rank)) return 0;\n", ""),
    "no format step": edit("VersionManager.register(VersionManager.current(), AP46.STEP_NAME, function(data){",
                           "(function(){})(VersionManager.current(), AP46.STEP_NAME, function(data){"),
    "old record not read": edit("if(typeof value === 'string'){", "if(false){"),
    # The load check must catch a clause that reaches no School (the Mantis have no Monk School).
    "a clause that reaches nothing": edit("{clan:'Mantis', type:'shugenja', rank:3}", "{clan:'Mantis', type:'monk', rank:3}"),
    # Second release.
    "only one School type per clause": edit("      if(clause.types && !clause.types.some(function(t){ return types.indexOf(t) >= 0; })) return false;\n", ""),
    "Glory ignored": edit("      if(req.glory !== undefined && api.glory() < req.glory) unmet.push('Glory Rank ' + req.glory);\n", ""),
    "no Imperial waiver": edit("const waived = AP46.waivedSkill(path, unmet);", "const waived = null;"),
    "one Path per School": edit("      slot[String(rank)] = chosen.name;\n",
                                "      Object.keys(slot).forEach(function(k){ delete slot[k]; });\n      slot[String(rank)] = chosen.name;\n"),
    "replaced Rank not locked": edit("else if(!any && taken[String(r)])", "else if(false)"),
    "held elsewhere not locked": edit("else if(AP46.heldElsewhere(p, school))", "else if(false)"),
    "any Rank not asked": edit("rank = free.length === 1 ? free[0] : await AP46.pickRank(chosen, free);", "rank = free[free.length - 1];"),
    "Topaz replaces": edit("          if(!p || !p.keepsReplacedTechnique || !name) continue;\n", "          continue;\n"),
    "later Path counted for spells": edit("return Math.max(0, ap46ElementRank.apply(this, arguments) - AP46.activeLater());",
                                          "return ap46ElementRank.apply(this, arguments);"),
    "breakdown base uncorrected": edit("ctx.schoolRankBase = Math.max(0, ctx.schoolRankBase - AP46.activeLater());",
                                       "ctx.schoolRankBase = ctx.schoolRankBase;"),
    "later Path counted for Kiho": edit("      const later = AP46.activeLater();\n      if(!later || !res", "      const later = 0;\n      if(!later || !res"),
    "later Path counted for the cap": edit("        later += AP46.laterPathRanks(name, upTo);\n", ""),
    "later Path counted for Mirumoto": edit("return entry ? Math.max(0, rank - AP46.laterPathRanks(entry.name, rank)) : rank;", "return rank;"),
}
BOUNDARIES = {
    "Phase 12 modes off": edit("const MODES12_ENABLED = true;", "const MODES12_ENABLED = false;",
                               target="src/sheet/209.9996-feat-play-management-modes.js"),
    "Phase 4.5.2 off": edit("const DISADV_CONFIG_ENABLED = true;", "const DISADV_CONFIG_ENABLED = false;",
                            target="src/sheet/209.85-feat-disadv-config.js"),
}


def copy(work: Path, name: str) -> Path:
    tree = work / re.sub(r"\W+", "-", name)
    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns("l5r-character-sheet.html", "dist", "__pycache__"))
    removal_chain().strip_later(tree, after=THIS_RELEASE)
    return tree


def build(tree: Path) -> None:
    subprocess.run([sys.executable, str(tree / "build/recombine.py")], check=True, capture_output=True)


def run(tree: Path, *args):
    p = subprocess.run([NODE, str(HARNESS), str(tree / "l5r-character-sheet.html"), *args], capture_output=True,
                       text=True, encoding="utf-8", errors="replace", timeout=1800)
    return p.returncode, p.stdout + p.stderr


def main() -> int:
    discover = "--discover" in sys.argv
    wanted = {} if discover else json.loads((HERE / "expected-failures.json").read_text(encoding="utf-8"))
    found, bad = {}, 0
    with tempfile.TemporaryDirectory(prefix="l5r-ap46-variants-") as scratch:
        work = Path(scratch)
        for name, mutate in VARIANTS.items():
            tree = copy(work, "variant " + name)
            mutate(tree)
            build(tree)
            rc, out = run(tree)
            failures = sorted(set(re.findall(r"^FAIL (\S+)", out, re.M)))
            count = re.search(r"\d+/\d+ checks passed", out)
            assert count, (name, out[-3000:])
            found[name] = {"failures": failures, "count": count[0]}
            # A variant that turns nothing red proves nothing; that is a failure even in discovery.
            good = rc != 0 and bool(failures) and (discover or found[name] == wanted.get(name))
            bad += not good
            print(("DISCOVER" if discover and good else "OK" if good else "BAD") + " " + name + ": " + count[0] + "; "
                  + str(len(failures)) + " failing assertions", flush=True)
            if not good and not discover:
                print("Expected:", wanted.get(name), "\nActual:", found[name], flush=True)
            shutil.rmtree(tree, ignore_errors=True)
        for name, mutate in BOUNDARIES.items():
            tree = copy(work, "boundary " + name)
            mutate(tree)
            build(tree)
            rc, out = run(tree)
            count = re.search(r"(\d+)/(\d+) checks passed", out)
            good = rc == 0 and bool(count) and count[1] == count[2] and int(count[2]) > 0
            bad += not good
            print(("OK" if good else "BAD") + " boundary " + name + ": " + (count[0] if count else "no count"), flush=True)
            if not good:
                print("\n".join(line for line in out.splitlines() if line.startswith("FAIL") or "Error" in line)[:3000], flush=True)
            shutil.rmtree(tree, ignore_errors=True)
    if discover:
        print("ORACLE_JSON " + json.dumps(found, sort_keys=True))
    print("VARIANTS " + ("all as expected" if not bad else str(bad) + " NOT as expected"))
    return int(bool(bad))


if __name__ == "__main__":
    sys.exit(main())
