# ROLLBACK — BUGFIX — Spell Slot Accounting

## What this fix adds to Phase 0

| Where | What |
|---|---|
| `src/sheet/209.992-bugfix-spell-slot-accounting.js` | New fragment: `SSA992`, `ssaBonusPipTap()`, three switches, and five wrappers (`castSpell`, `castMahoSpell`, `rollWithModifiers`, `rollPreviewGate`, `renderSpellBonusPips`), each keeping the previous binding |
| `src/css/59.992-bugfix-spell-slot-accounting.css` | New stylesheet: `.ssa992-note`, the overfull-pips warning |
| `src/sheet/080-identity-build-ui.js` | One guarded block, `// BUGFIX SPELLSLOT BEGIN bonus-pip-tap` … `// END SPELLSLOT bonus-pip-tap`, at the top of the Spell Slots click handler's bonus-pip branch |
| `src/sheet/210-test-seam-and-init.js` | One guarded seam block, `spell-slot-seam`, after the Negative Roll Modifier seam |
| `build/manifest.json` | Two entries (the stylesheet after `59.991`, the fragment last among the sheet fragments) and `expect_sha256` |

Nothing else is edited. No save field is added: the fix only reads and writes the counters the
sheet already saves.

## Primary method: surgical removal

Run the remover on a **scratch copy**, never on the live tree (it refuses the live tree, any
ancestor or descendant of it, and symbolic links):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/ssa-removal
python3 "Versions/BUGFIX — Spell Slot Accounting/qa/remove-phase.py" /tmp/ssa-removal --dry-run
python3 "Versions/BUGFIX — Spell Slot Accounting/qa/remove-phase.py" /tmp/ssa-removal
python3 /tmp/ssa-removal/build/recombine.py --verify
```

It deletes the two owned files, cuts exactly the two delimited blocks and the two manifest
entries, and rewrites `expect_sha256` to the hash of what remains. It refuses, writing nothing,
if a block is missing, duplicated, unclosed, in the wrong file, or contains any other phase's
marker. Once the scratch result is checked, copy the changed files back over the live tree.

**Measured on the build this fix shipped with:** removal rebuilds **byte-identical** to
`3e262b188a453aed40451a7162a38e90761f6a04b35ea54bf124b9f1309151a2` (2,914,055 bytes), the build of
restore commit `c814568`, and `build/manifest.json`, `080-identity-build-ui.js` and
`210-test-seam-and-init.js` come back byte-identical to that commit. See the README for the
retained-suite count on the removed bytes.

If a later phase has since added blocks to the same files, the remover still removes only this
fix's blocks and computes the new hash rather than forcing the old one.

## Turning part of it off without removing it

In the fragment:

- `SPELL_SLOT_ACCOUNTING_FIX_ENABLED = false` turns the whole fix off. Every wrapper passes straight
  through and the pip block hands the tap back to the original handler.
- `SPELL_SLOT_REFUND_ENABLED = false` turns off only the refund on a cancelled cast.
- `BONUS_PIP_GUARD_ENABLED = false` turns off only the bonus-pip rule and the overfull warning.

Each switch is proven by `qa/verify-variants.py`: turning it off fails exactly the checks for that
half.

## Dependencies

- **Nothing depends on this fix.**
- **Soft, guarded dependency on Phase 3 (Part G), Smart Roll Preview.** The refund hooks
  `rollPreviewGate()`. Without that phase there is no preview and so no Cancel to refund; the
  wrapper is simply not installed.
- **Reads release 4.5.2's `d45WillpowerGate` context flag** to recognise a cancelled Willpower check
  before a cast. If 4.5.2 is removed the flag never appears and nothing else changes.
- **Wraps functions other releases also wrap**: `castSpell` (4.5.2's busy gate, 4.5.20's payment
  choice), `castMahoSpell` (4.5.2), `rollWithModifiers` (4.5.2, 4.5.19, 4.5.20, 4.5.23),
  `rollPreviewGate` (4.5.23). It captures whatever binding exists when it loads, so any of those
  releases can be removed before or after this one. **It must stay last among the sheet fragments**
  so its wrappers are outermost: the refund reads the counters before and after every earlier
  payment route.
- **Ownership report note.** `qa/feature-dependencies.py` attributes the trunk lines after the
  `080` block's END line to BUGFIX, because an END line carries no marker to hand ownership back.
  The Mastery Rank Labelling fix has the same shape. Removal is by the delimiters, not by that
  attribution, so it is unaffected.

## Declared behaviour boundary

A Willpower check from release 4.5.2 that is **rolled and failed** (Enlightened Madness) still ends
the action with the slot spent, as that release's approved rule says. Only a **cancelled preview**
refunds. `SSA-GATE-FAILED-KEEPS-SLOT` pins this.
