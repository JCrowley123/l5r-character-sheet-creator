#!/usr/bin/env python3
"""Prove each part of the fix is load-bearing: build deliberately broken variants in scratch copies
of the Phase 0 tree and show the harness fails exactly where qa/expected-failures.json says.

    python qa/verify-variants.py [--discover]

Never writes to the live tree. Each variant edits ONE thing in a fresh copy (later releases are
stripped first, through the shared removal chain), rebuilds with that copy's own recombine.py, and
runs ancfix-harness.js against the result. --discover prints an oracle candidate for review; it
never updates the oracle. Two boundary builds must be fully green: Phase 12's modes switched off
(the fix does not depend on them), and Phase 4.8's Ancestors switched off, run with --no-ancestors
(the fix must then change nothing). Adapted from BUGFIX — Multiple Schools Keep Earlier Techniques'.
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
FRAGMENT = "src/sheet/209.999992-bugfix-ancestor-corrections.js"
CSS = "src/css/59.9999-bugfix-ancestor-info.css"
HARNESS = HERE / "ancfix-harness.js"
REMOVER = HERE / "remove-phase.py"
NODE = shutil.which("node") or r"C:\Program Files\nodejs\node.exe"
THIS_RELEASE = "BUGFIX — Ancestor Corrections (Void Offer, Info Button, Clan Picker)"


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
    "fix removed": removed,
    "Void offer switch off": edit("const ANCFIX_VOID_OFFER_ENABLED = true;", "const ANCFIX_VOID_OFFER_ENABLED = false;"),
    "info button switch off": edit("const ANCFIX_INFO_ICON_ENABLED = true;", "const ANCFIX_INFO_ICON_ENABLED = false;"),
    "Clan picker switch off": edit("const ANCFIX_CLAN_PICKER_ENABLED = true;", "const ANCFIX_CLAN_PICKER_ENABLED = false;"),
    # Asking only whether the option's own effect lands, without the preview's own test first, offers
    # +1k1 beside a ticked gift, where spending a Void Point would add nothing.
    "own effect alone": edit("      if(!ancfixPreviewWouldMatter.apply(this, arguments)) return false;\n", ""),
    "italic glyph kept": edit("font-style:normal;", "font-style:italic;", target=CSS),
    "Minor Clan picker not watched": edit("['cfs_clan', 'cfs_minorClan']", "['cfs_clan']"),
}
BOUNDARIES = {
    "Phase 12 modes off": (edit("const MODES12_ENABLED = true;", "const MODES12_ENABLED = false;",
                                target="src/sheet/209.9996-feat-play-management-modes.js"), []),
    "Phase 4.8 Ancestors off": (edit("const ANCESTORS_ENABLED = true;", "const ANCESTORS_ENABLED = false;",
                                     target="src/sheet/209.99998-feat-ancestors.js"), ["--no-ancestors"]),
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
                       text=True, encoding="utf-8", errors="replace", timeout=1200)
    return p.returncode, p.stdout + p.stderr


def main() -> int:
    discover = "--discover" in sys.argv
    wanted = {} if discover else json.loads((HERE / "expected-failures.json").read_text(encoding="utf-8"))
    found, bad = {}, 0
    with tempfile.TemporaryDirectory(prefix="l5r-ancfix-variants-") as scratch:
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
        for name, (mutate, flags) in BOUNDARIES.items():
            tree = copy(work, "boundary " + name)
            mutate(tree)
            build(tree)
            rc, out = run(tree, *flags)
            count = re.search(r"(\d+)/(\d+) checks passed", out)
            good = rc == 0 and bool(count) and count[1] == count[2] and int(count[2]) > 0
            bad += not good
            print(("OK" if good else "BAD") + " boundary " + name + " (" + (" ".join(flags) or "no flag") + "): "
                  + (count[0] if count else "no count"), flush=True)
            if not good:
                print("\n".join(line for line in out.splitlines() if line.startswith("FAIL") or "Error" in line)[:3000], flush=True)
            shutil.rmtree(tree, ignore_errors=True)
    if discover:
        print("ORACLE_JSON " + json.dumps(found, sort_keys=True))
    print("VARIANTS " + ("all as expected" if not bad else str(bad) + " NOT as expected"))
    return int(bool(bad))


if __name__ == "__main__":
    sys.exit(main())
