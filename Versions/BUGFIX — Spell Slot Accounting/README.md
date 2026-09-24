# BUGFIX — Spell Slot Accounting

Two defects in how the sheet counts spell slots, fixed together because they write the same
counters. Each half has its own switch and can be turned off alone. Built 24 September 2026 on the
owner's decision after the A01–A16 iPhone pass (see the ledger's "Device-pass decisions and
backlog", items 2–4).

## What was wrong

### 1. A cancelled cast still used its slot

**Reported on the iPhone, 24 September.** With Void Versatility on Earth, a Void spell paid with
Earth and cancelled at the roll preview still used an Earth slot; paying with Void and cancelling
used a Void slot. With the Advantage removed, on a Crane Asahina Shugenja, Boundless Sight (Void)
and Arrow's Flight (Air) each used a slot after Cancel.

**Measured before fixing.** `castSpell()` (`110-modals-trackers.js`) fills the slot and only then
calls `performSpellCastRoll()`, which opens the preview. `rollWithModifiers()` returns `null` when
the preview is cancelled, but nothing gave the slot back. The preview itself says "Nothing is
spent until you roll", which was true of Void Points and not of slots. The pre-fix build fails 23
of this suite's checks, including each of the owner's exact reports.

**Where it came from.** Before Phase 3 (Part G, Smart Roll Preview) nothing sat between paying
and rolling. That phase put a Cancel in front of every roll and made Void Points wait for the
confirm; spell slots were never moved. Release 4.5.20's README recorded that the slot is spent
before the preview, but it was never logged as a defect. It affected every caster, not only A14.

**Same shape, found while measuring:** a Maho spell cast with the caster's own blood takes the
Wounds before the preview, so a Cancel kept them.

### 2. A hand-tapped bonus pip could overfill the shared pool

**Reproduced 23 September** (Water 2, Fire 2, Void 3). The Spell Slots click handler
(`080-identity-build-ui.js`) added a bonus pip with no pool check, so with the pool already full a
tap still raised that Element's fill (4 shown against a pool of 3). Taking pips back then also
stripped another Element's pip, because `renderSpellBonusPips()` trims every row to the shared
total. Casting never did this: it checks the pool first.

## What the fix does

| Situation | Before | After |
|---|---|---|
| Cancel at the preview after paying an Element slot | Slot stays used | Slot given back; status "Cast cancelled — the Air slot given back." |
| Cancel after taking a bonus slot | Bonus slot and that row's pip stay used | Both given back; other rows untouched |
| Cancel after Void Versatility paid with its Ring | Ring slot stays used | Ring slot given back |
| Cancel after a Universal spell's Element was chosen | That Element's slot stays used | Given back |
| Cancel a Maho cast paid with Own Blood | Wounds kept | Wounds given back; Taint was already only on success |
| Cancel the Willpower check (release 4.5.2) that runs before a cast | Slot stays used | Given back: nothing was rolled |
| Willpower check rolled and **failed** (Enlightened Madness) | Slot stays used | **Unchanged**: that release's approved rule |
| Roll the spell | Slot used | Unchanged |
| Tap an empty bonus pip while the pool is full | Row fill rises past the pool | Refused: "No bonus slots left: all 3 in the shared pool are used." |
| Take a bonus pip back | Can strip another row | Only the row tapped changes |
| Load a save whose bonus pips already exceed the pool | Shown as is | Shown as is, with a warning line under the Spell Slots; **nothing removed automatically** (owner's ruling). Taking pips back uses up the excess first |

**How the refund works.** It refunds; it does not move the spend. All the "no slots left" refusals
and payment dialogs stay where they are, before the preview. When a cast starts, the counters are
snapshotted (`spell_used_<element>`, `spell_bonus_used_shared`, `spell_bonus_used_visual_<element>`,
`f_woundsTaken`). When that cast's Casting Roll reaches `rollWithModifiers()`, the difference is
what the cast paid, whichever route paid it. If that roll's own preview, or the Willpower check's
preview in front of it, answers Cancel, exactly that difference is given back.

**A late refund is dropped.** The preview answers asynchronously. If the paid counters no longer
read what the cast left them at (a reset or load replaced the character meanwhile), nothing is
given back rather than subtracting from a different sheet.

## Files

One fragment (`209.992-bugfix-spell-slot-accounting.js`, last among the sheet fragments), one
stylesheet (`59.992-bugfix-spell-slot-accounting.css`), one guarded block in
`080-identity-build-ui.js`, one guarded seam block in `210-test-seam-and-init.js`, two manifest
entries. See `ROLLBACK.md`.

## QA

All measured on 24 September 2026, headless Chromium, `NODE_PATH=/opt/node22/lib/node_modules`.

| Measure | Result |
|---|---|
| Own suite, fixed build | **52/52** (`qa/spell-slot-accounting-harness.js`) |
| Own suite, pre-fix build `3e262b18…` | **28/52**: every refund, pip-guard and warning check fails, including each of the owner's exact reports |
| Combined, fixed build | **2,104/2,104**: 2,052 retained + 52 new; no retained check changed (`qa/current-suite-runner.js`) |
| Build | **2,927,339 bytes**, SHA-256 `339a9590bb9761441db94abb776afc1df9e260d2647114f6f706d297c011e726` |
| Surgical removal | **Byte-identical** to `3e262b188a453aed40451a7162a38e90761f6a04b35ea54bf124b9f1309151a2` (2,914,055 bytes, commit `c814568`) on the first attempt; `build/manifest.json`, `080-identity-build-ui.js` and `210-test-seam-and-init.js` identical to that commit |
| Retained suites on the removed bytes | **2,052/2,052** (the 4.5.24 combined runner) |
| Remover fixtures | **47/47** (`qa/test-removal.py`) |
| Ownership | `qa/feature-dependencies.py` exits 0: every reference to the fix's eleven names is inside a block it owns |
| Registry | Seven seats, unchanged |

**Each part is load-bearing** (`qa/verify-variants.py`, one edit per scratch copy):

| Variant | Own suite | Fails |
|---|---:|---|
| Master switch off | 28/52 | every refund, pip and warning check |
| Refund switch off | 35/52 | the refund checks only |
| Pip switch off | 44/52 | the pip and warning checks only |
| Preview never refunds | 36/52 | the refund checks |
| Late refund not dropped | 50/52 | `SSA-LATE-*` only |
| Willpower-check cancel not refunded | 50/52 | the gate-cancel check, and the failed-check count that follows it |
| Failed check refunded too | 51/52 | `SSA-GATE-FAILED-KEEPS-SLOT` only |
| Take-back always empties the pool | 49/52 | the overfull take-back checks |
| No pool check on a tap | 47/52 | the refusal checks, plus the warning and take-back checks that follow from an overfull state |
| No warning | 50/52 | the two warning checks |
| No stylesheet | 51/52 | `SSA-OVERFULL-NOTE-STYLED` only |

Two variants first failed **more** checks than listed, and both were real cascades rather than
stray failures: removing the pool check lets the refused tap create an overfull state (so the
warning appears and the next take-back spends the excess), and emptying the pool on every take-back
leaves the save overfull (so the warning correctly stays). Their expected lists were corrected and
the whole set re-run.

## Found while building

- **The Willpower check in front of a cast.** Release 4.5.2 records an approved rule that a
  **failed** Enlightened Madness check ends the action with the slot spent. Cancelling that check's
  own preview is different: nothing was rolled, so under the owner's rule it refunds. The fix
  separates the two by refunding only on a cancelled preview. `SSA-GATE-*` pins both sides.
- **A refund can arrive late.** The preview answers asynchronously, so a reset or load could replace
  the character before it does. The refund is dropped unless the paid counters still read what the
  cast left them at. `SSA-LATE-*` pins it.
- **Stopping the click would have broken the quick-access panel.** Intercepting a bonus-pip tap by
  stopping the click event would also have stopped Phase 2's (Part H) click-outside-to-close. The
  fix is reached from one guarded block inside the trunk handler instead, so the event still bubbles.
- **To drive a cast in a harness, click the spell's Cast button.** `castSpell` is not on the test
  seam, and calling `performSpellCastRoll()` directly skips every wrapper around `castSpell`.

## Not verified

- **Not tried on a real device.** Headless Chromium only, with fallback fonts (this sandbox cannot
  load the sheet's Google Fonts). The warning line is new geometry; it wraps as ordinary text.
- The tap-refusal message and the refund status use the sheet's status line, which clears after a
  few seconds; that timing is the trunk's, not this fix's.
