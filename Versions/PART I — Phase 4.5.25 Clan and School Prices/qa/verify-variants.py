#!/usr/bin/env python3
"""Prove each part of PART I — Phase 4.5.25 Clan and School Prices is load-bearing: build deliberately broken
variants in scratch copies of the Phase 0 tree and show the harness fails exactly where
qa/expected-failures.json says.

    python qa/verify-variants.py [--discover] [--jobs N]

--jobs runs N variants at once (default 1); results are printed in the same order either way.

Never writes to the live tree. Each variant edits ONE thing in a fresh copy (later releases are
stripped first, through the shared removal chain), rebuilds with that copy's own recombine.py, and
runs clan-prices-harness.js against the result. --discover prints an oracle candidate for review;
it never updates the oracle. Two boundary builds must be fully green: Phase 12's modes switched off,
and Phase 4.6's Alternate Paths switched off. Adapted from Phase 4.6's (Part I) verifier.
"""

from __future__ import annotations

import importlib.util
import json
import re
import shutil
import subprocess
import sys
import tempfile
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).resolve().parent
CHAIN_LOCK = threading.Lock()


def versions_dir() -> Path:
    for directory in HERE.parents:
        if (directory / "BUILD-LEDGER.md").is_file() and (directory / "CLAUDE.md").is_file():
            return directory
    raise SystemExit("cannot find Versions/ above " + str(HERE))


VERSIONS = versions_dir()
LIVE = VERSIONS / "Part F — Cross-Platform Delivery" / "PART F — Phase 0 Source Reorganization for Maintainability"
FRAGMENT = "src/sheet/209.999996-feat-adv-clan-prices.js"
HARNESS = HERE / "clan-prices-harness.js"
REMOVER = HERE / "remove-phase.py"
NODE = shutil.which("node") or r"C:\Program Files\nodejs\node.exe"
THIS_RELEASE = "PART I — Phase 4.5.25 Clan and School Prices"


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


def edits(*pairs):
    steps = [edit(old, new) for old, new in pairs]
    def apply(tree):
        for step in steps:
            step(tree)
    return apply


def removed(tree):
    subprocess.run([sys.executable, str(REMOVER), str(tree)], check=True, capture_output=True)


def before(fragment, anchor):
    """Move `fragment`'s manifest entry to just before `anchor`'s, so it loads earlier."""
    def apply(tree):
        path = tree / "build/manifest.json"
        text = path.read_text(encoding="utf-8")
        start = text.index('    { "file": "' + fragment + '",')
        end = text.index("},\n", start) + 3
        entry, text = text[start:end], text[:start] + text[end:]
        at = text.index('    { "file": "' + anchor + '",')
        path.write_text(text[:at] + entry + text[at:], encoding="utf-8")
    return apply


VARIANTS = {
    "phase removed": removed,
    "switch off": edit("const ADV_CLAN_PRICES_ENABLED = true;", "const ADV_CLAN_PRICES_ENABLED = false;"),
    # "Crab and bushi characters" read as a Crab bushi: every group must hold.
    "and reading": edit("    api.basis = function(e, f){\n",
                        "    api.basis = function(e, f){\n      if(e.who.length > 1){ const all = e.who.every(function(w){ return w === 'Imperial' ? f.imperial"
                        " : api.TYPES.indexOf(w) >= 0 ? f.types.indexOf(w) >= 0 : norm(f.clan) === norm(w); }); return all ? e.who[0] : ''; }\n"),
    # A typed cost is re-priced like any other.
    "typed cost overwritten": edit("} else if(rec.s !== 'typed' && cur !== rec.v){", "} else if(false){"),
    # Leaving Management fixes nothing.
    "not fixed on leaving Management": edit("if(result && was !== 'play' && mode === 'play') CP4525.fixAll();", "void 0;"),
    # A save from before this release priced from every School, not the starting one.
    "old saves from every School": edit("api.bookPrice(e, api.facts(api.loading))", "api.bookPrice(e, api.facts(false))"),
    # A save from before this release left provisional.
    "old saves left provisional": edit("const state = api.loading ? 'fixed' : 'provisional';", "const state = 'provisional';"),
    # The purchase record does not travel with the save.
    "record not saved": edit("if(rec && arr[i]) arr[i].clanPrice = rec;", "void rec;"),
    # A Clan price on a character who does not qualify is taken back to the catalogue.
    # Uncentered lowered on a saved Clan monk (the owner's ruling: new purchases only).
    "uncentered lowered on old saves": edit("if(api.loading && api.takesAway(e) && cur !== book.price){", "if(false){"),
    "clan price taken away":edit("|| cur === e.base || cur === book.price){", "|| cur === e.base || cur === book.price || cur === e.price){"),
}
BOUNDARIES = {
    "Phase 12 modes off": edit("const MODES12_ENABLED = true;", "const MODES12_ENABLED = false;",
                               target="src/sheet/209.9996-feat-play-management-modes.js"),
    "Phase 4.6 off": edit("const ALTERNATE_PATHS_ENABLED = true;", "const ALTERNATE_PATHS_ENABLED = false;",
                          target="src/sheet/209.999993-feat-alternate-paths.js"),
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


def built_and_run(work: Path, label: str, mutate):
    with CHAIN_LOCK:   # the removal chain is a module loaded on demand; load and strip one at a time
        tree = copy(work, label)
    mutate(tree)
    build(tree)
    result = run(tree)
    shutil.rmtree(tree, ignore_errors=True)
    return result


def main() -> int:
    discover = "--discover" in sys.argv
    jobs = int(sys.argv[sys.argv.index("--jobs") + 1]) if "--jobs" in sys.argv else 1
    wanted = {} if discover else json.loads((HERE / "expected-failures.json").read_text(encoding="utf-8"))
    found, bad = {}, 0
    with tempfile.TemporaryDirectory(prefix="l5r-cp4525-variants-") as scratch:
        work = Path(scratch)
        with ThreadPoolExecutor(max_workers=jobs) as pool:
            variants = [(name, pool.submit(built_and_run, work, "variant " + name, mutate)) for name, mutate in VARIANTS.items()]
            boundaries = [(name, pool.submit(built_and_run, work, "boundary " + name, mutate)) for name, mutate in BOUNDARIES.items()]
        for name, future in variants:
            rc, out = future.result()
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
        for name, future in boundaries:
            rc, out = future.result()
            count = re.search(r"(\d+)/(\d+) checks passed", out)
            good = rc == 0 and bool(count) and count[1] == count[2] and int(count[2]) > 0
            bad += not good
            print(("OK" if good else "BAD") + " boundary " + name + ": " + (count[0] if count else "no count"), flush=True)
            if not good:
                print("\n".join(line for line in out.splitlines() if line.startswith("FAIL") or "Error" in line)[:3000], flush=True)
    if discover:
        print("ORACLE_JSON " + json.dumps(found, sort_keys=True))
    print("VARIANTS " + ("all as expected" if not bad else str(bad) + " NOT as expected"))
    return int(bool(bad))


if __name__ == "__main__":
    sys.exit(main())
