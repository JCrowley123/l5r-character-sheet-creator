#!/usr/bin/env python3
"""Prove each part of the fix is load-bearing: build deliberately broken variants in scratch
copies of the Phase 0 tree and show the harness fails exactly where it should.

    NODE_PATH=/opt/node22/lib/node_modules python3 qa/verify-variants.py

Never writes to the live tree. Each variant edits ONE thing in a fresh copy, rebuilds with that
copy's own recombine.py, and runs spell-slot-accounting-harness.js against the result.
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
FRAGMENT = "src/sheet/209.992-bugfix-spell-slot-accounting.js"
CSS_ENTRY = "src/css/59.992-bugfix-spell-slot-accounting.css"
HARNESS = HERE / "spell-slot-accounting-harness.js"

# (name, [(old, new) in the fragment] or "no-css", checks expected to FAIL)
REFUND = ["SSA-ELEMENT-CANCEL-REFUNDS", "SSA-ELEMENT-STATUS", "SSA-ELEMENT-ROLL-KEEPS-SLOT",
          "SSA-VOID-CANCEL-REFUNDS", "SSA-BONUS-CANCEL-REFUNDS", "SSA-BONUS-STATUS",
          "SSA-UNIVERSAL-CANCEL-REFUNDS", "SSA-VV-RING-CANCEL-REFUNDS", "SSA-VV-VOID-CANCEL-REFUNDS",
          "SSA-MAHO-CANCEL-REFUNDS", "SSA-MAHO-STATUS", "SSA-LATE-RECORDED",
          "SSA-GATE-CHECK-CANCEL-REFUNDS", "SSA-GATE-FAILED-KEEPS-SLOT", "SSA-GATE-PASSED-CANCEL-REFUNDS"]
PIP = ["SSA-PIP-FULL-REFUSED", "SSA-PIP-FULL-STATUS", "SSA-PIP-SPEND-WITH-ROOM", "SSA-OVERFULL-WARNED",
       "SSA-OVERFULL-NOTE-STYLED", "SSA-OVERFULL-FIRST-TAKEBACK", "SSA-OVERFULL-FIRE-KEPT"]
VARIANTS = [
    ("master switch off", [("const SPELL_SLOT_ACCOUNTING_FIX_ENABLED = true;", "const SPELL_SLOT_ACCOUNTING_FIX_ENABLED = false;")],
     ["SSA-ENABLED"] + REFUND + PIP),
    ("refund switch off", [("const SPELL_SLOT_REFUND_ENABLED = true;", "const SPELL_SLOT_REFUND_ENABLED = false;")],
     ["SSA-ENABLED"] + REFUND),
    ("pip switch off", [("const BONUS_PIP_GUARD_ENABLED = true;", "const BONUS_PIP_GUARD_ENABLED = false;")],
     ["SSA-ENABLED"] + PIP),
    ("preview never refunds", [("if(!proceed){ SSA992.pending = null; SSA992.refund(payment); }",
                                "if(!proceed){ SSA992.pending = null; }")],
     REFUND),
    ("late refund not dropped", [("if(!api.unchanged(payment)){ api.lastRefund = {dropped:true}; return false; }", "")],
     ["SSA-LATE-DROPPED", "SSA-LATE-RECORDED"]),
    ("Willpower-check cancel not refunded", [("const resistanceCheck = !!context && context.d45WillpowerGate === true;",
                                              "const resistanceCheck = false;")],
     ["SSA-GATE-CHECK-CANCEL-REFUNDS", "SSA-GATE-FAILED-KEEPS-SLOT"]),
    ("failed check refunded too", [("const settle = function(){ if(SSA992.pending === payment) SSA992.pending = null; };",
                                    "const settle = function(r){ if(SSA992.pending === payment){ SSA992.pending = null; if(r === null) SSA992.refund(payment); } };")],
     ["SSA-GATE-FAILED-KEEPS-SLOT"]),
    ("take-back always empties the pool", [("        if(excess === 0) sharedEl.value = Math.max(0, shared - 1);",
                                            "        sharedEl.value = Math.max(0, shared - 1);")],
     # The pool drops while the rows do not, so the save stays overfull and the warning stays.
     ["SSA-OVERFULL-FIRST-TAKEBACK", "SSA-OVERFULL-WARNING-CLEARS", "SSA-OVERFULL-FIRE-KEPT"]),
    ("no pool check on a tap", [("        if(shared >= rank){", "        if(false){")],
     # The unrefused tap makes the rows overfull, so the warning appears and the next take-back
     # correctly spends the excess instead of the pool.
     ["SSA-PIP-FULL-REFUSED", "SSA-PIP-FULL-STATUS", "SSA-PIP-NO-WARNING-WHEN-CONSISTENT",
      "SSA-PIP-TAKEBACK-CONSISTENT", "SSA-PIP-SPEND-WITH-ROOM"]),
    ("no warning", [("    SSA992.renderWarning();\n", "")],
     ["SSA-OVERFULL-WARNED", "SSA-OVERFULL-NOTE-STYLED"]),
    ("no stylesheet", "no-css", ["SSA-OVERFULL-NOTE-STYLED"]),
]


def build_variant(work: Path, edits) -> Path:
    tree = work / "tree"
    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns("l5r-character-sheet.html"))
    if edits == "no-css":
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
            assert text.count(old) == 1, f"variant anchor not unique: {old[:60]}"
            text = text.replace(old, new)
        fragment.write_text(text, encoding="utf-8")
    subprocess.run([sys.executable, str(tree / "build/recombine.py")], check=False, capture_output=True)
    return tree / "l5r-character-sheet.html"


def run(sheet: Path):
    out = subprocess.run(["node", str(HARNESS), str(sheet)], capture_output=True, text=True, timeout=900)
    text = out.stdout + out.stderr
    failed = sorted(set(re.findall(r"^FAIL (\S+)", text, re.M)))
    count = re.search(r"(\d+)/(\d+) checks passed", text)
    return failed, (count.group(0) if count else "no count")


def main() -> int:
    problems = 0
    for name, edits, expected in VARIANTS:
        with tempfile.TemporaryDirectory(prefix="l5r-ssa-variant-") as work:
            failed, count = run(build_variant(Path(work), edits))
        ok = set(expected) <= set(failed) and set(failed) <= set(expected) | {"SSA-BONUS", "SSA-GATE", "SSA-LATE"}
        problems += 0 if ok else 1
        print(f"{'OK  ' if ok else 'BAD '} {name}: {count}; failed {len(failed)}"
              + ("" if ok else f"\n     unexpected={sorted(set(failed) - set(expected))} missing={sorted(set(expected) - set(failed))}"))
    print("VARIANTS", "all fail where expected" if problems == 0 else f"{problems} variant(s) off target")
    return 0 if problems == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
