#!/usr/bin/env python3
"""Prove each part of the phase is load-bearing: build deliberately broken variants in scratch
copies of the Phase 0 tree and show the harness fails exactly where it should.

    NODE_PATH=/opt/node22/lib/node_modules python3 qa/verify-variants.py

Never writes to the live tree. Each variant edits ONE thing in a fresh copy, rebuilds with that
copy's own recombine.py, and runs characters-harness.js against the result. The previous build
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
FRAGMENT = "src/sheet/209.993-feat-characters-list.js"
CSS_ENTRY = "src/css/59.993-feat-characters-list.css"
HARNESS = HERE / "characters-harness.js"
REMOVER = HERE / "remove-phase.py"

# With sharing off, the first touch export downloads instead; the scenario waits for a share
# that never comes and stops there, so its later share checks never run.
SHARE = ["CL-ENABLED", "CL-SCENARIO-RAN-EXPORT-SHARE-SHEET-TOUCH-"]
VARIANTS = [
    ("share switch off", [("const CHARACTERS_SHARE_ENABLED = true;", "const CHARACTERS_SHARE_ENABLED = false;")], SHARE),
    ("no pending write before applyData", [("    if(CL11.enabled() && CL11.ready) CL11.write(CL11.prepare());\n    return cl11PreviousApply", "    return cl11PreviousApply")],
     ["CL-FLUSH-ON-TOOLBAR-IMPORT"]),
    ("no pending write before a load", [("    // Written first: loading '' (the picker's \"New / unsaved\") resets the sheet with no applyData.\n    await CL11.flush();\n", "")],
     ["CL-FLUSH-ON-BLANK-LOAD"]),
    ("no pending write on New Blank", [("if(e.type === 'click' && e.target.closest && e.target.closest('#btnNew')){ CL11.flush(); return; }", "")],
     ["CL-FLUSH-ON-NEW-BLANK"]),
    ("no write when the page is hidden", [("document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'hidden') CL11.flush(); });", "")],
     ["CL-FLUSH-ON-HIDE"]),
    ("autosave writes a deleted character back", [("        if(idx < 0){ if(api.lastSaved === job.text) api.lastSaved = null; return false; }\n", "")],
     ["CL-WRITE-SKIPS-DELETED"]),
    ("Phase 9 (Part H) mon data absent", [("      if(typeof CLAN_MON_DATA !== 'object' || !CLAN_MON_DATA || !clan) return null;", "      return null;")],
     ["CL-PORTRAIT-MON"]),
    ("import limited to SHEET_SCHEMA_VERSION", [("const supported = Math.max(SHEET_SCHEMA_VERSION, parseInt(collectData().schemaVersion, 10) || 1);", "const supported = SHEET_SCHEMA_VERSION;")],
     # The first import is refused as "newer", so the scenario stops waiting for its row.
     ["CL-SCENARIO-RAN-IMPORT"]),
]
SPECIAL = ["previous build (phase removed)", "master switch off", "autosave switch off", "no stylesheet"]


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
             ("master switch off", [("const CHARACTERS_LIST_ENABLED = true;", "const CHARACTERS_LIST_ENABLED = false;")], None),
             ("autosave switch off", [("const CHARACTERS_AUTOSAVE_ENABLED = true;", "const CHARACTERS_AUTOSAVE_ENABLED = false;")], None),
             ("no stylesheet", "no-css", None)]
    only = sys.argv[1:]
    for name, edits, expected in plan:
        if only and name not in only:
            continue
        with tempfile.TemporaryDirectory(prefix="l5r-cl11-variant-") as work:
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
