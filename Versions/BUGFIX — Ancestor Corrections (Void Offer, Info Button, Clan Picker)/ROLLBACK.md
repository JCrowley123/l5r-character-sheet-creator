# ROLLBACK — BUGFIX — Ancestor Corrections (Void Offer, Info Button, Clan Picker)

## Surgical removal (the method)

On a **scratch copy** of the Phase 0 tree, never the live one:

```bash
python "Versions/BUGFIX — Ancestor Corrections (Void Offer, Info Button, Clan Picker)/qa/remove-phase.py" <copy> [--dry-run] [--expect-sha SHA]
python <copy>/build/recombine.py
```

It removes exactly:

| What | Where |
|---|---|
| `src/css/59.9999-bugfix-ancestor-info.css` | the whole stylesheet, and its manifest entry |
| `src/sheet/209.999992-bugfix-ancestor-corrections.js` | the whole fragment, and its manifest entry |

Nothing else: the fix adds no block to any shared file, no markup and no seam key. Both files are
delimited `BUGFIX ANCFIX` … `END BUGFIX ANCFIX`. The remover preflights everything before writing,
refuses either file holding any other marker, refuses any retained source that still names the
fix's marker or its surface (`ANCFIX_VOID_OFFER_ENABLED`, `ANCFIX_INFO_ICON_ENABLED`,
`ANCFIX_CLAN_PICKER_ENABLED`, `ancfixPreviewWouldMatter`, `ancfixVoidModCount`, `ancfix-info`), and
refuses the live tree, its parents, a symbolic link, and any file that is the live tree's own file
under another name.

**Measured on 1 October 2026:** removal rebuilds **byte-identical** to the build before the fix,
`7daf6aec5558807f81aa4f0b436df4c2332ddd4624eea4e52e85aa044ee68677`, 3,260,361 bytes, on the first
attempt. The remover's own fixtures: 12 tests, 11 passed, 1 skipped (the symlink test; Windows
refuses symlinks without Developer Mode).

**Kill switches**, one per part, in the fragment: `ANCFIX_VOID_OFFER_ENABLED`,
`ANCFIX_INFO_ICON_ENABLED` (the stylesheet waits for the class it adds) and
`ANCFIX_CLAN_PICKER_ENABLED`. Each switched off fails exactly its own part's checks and no other
(measured; see the README).

## What removing it does

The roll preview again offers "Make an Unskilled roll Skilled" beside a ticked Seppun or Komori
Iongi gift on a roll it cannot help; the Ancestor's i goes back to the small gold italic one; the
Ancestor list again keeps the previous Clan's Ancestors after a Clan picker change until the sheet
next recalculates. No saved data is involved.

## Dependencies (all soft, all guarded)

| On | What it uses | Without it |
|---|---|---|
| Phase 3 (Part G), the roll preview | rebinds `voidKeyWouldMatter`; calls `projectRoll` | the Void part does nothing (its `typeof` guards fail); nothing else changes |
| Part C's Void rules (trunk) | `getVoidPending`, `setVoidPending`, `clearOneRollVoidPending`, `armOneRollVoidPending` | core sheet code |
| Phase 4.8 (Part I), Ancestors | restyles `#anc48Section .anc48-info`; calls `renderAncestorCard()` | nothing to correct: measured with Ancestors switched off, the harness's `--no-ancestors` boundary, 7/7 |
| Phase 12 (Part K) | nothing | measured: Phase 12's modes switched off, 28/28 |

**Removal order.** Phase 4.8's remover refuses while this fix is present, because the fix's files
name `anc48` and `renderAncestorCard`; remove this fix first. The shared removal chain does so: this
fix is registered in `QA — Removal Chain Registry` after BUGFIX — Multiple Schools Keep Earlier
Techniques. Measured with it in the tree: the live removal tests of the Multiple Schools fix (12, 1
skipped), the Manage fix (11, 1 skipped), Phase 4.8 (20, 1 skipped) and Phase 11 (15, 1 skipped)
all pass; the registry's own checks 11/11. Phase 3 (Part G) has no remover; its ROLLBACK and Phase
4.8's now name this fix. Copies of those two files, and of `removal_chain.py`, from before this fix
are in `originals/`.

## A retained check corrected for this fix (test-only)

Phase 4.8's `ANC48-PLACE-INFO-MATCHES-ADVANTAGES` takes the A01–A16 Advantages' i as its oracle while
the page carries `ancfix-info`, and the configuration windows' i otherwise. It passes both ways
(Phase 4.8's harness 349/349 with this fix and without it), so removing the fix needs no change to
that harness. Its original is in `originals/PART I — Phase 4.8 Ancestors/qa/`.

## Restore points

| | |
|---|---|
| Phase 0 build before this fix | `7daf6aec5558807f81aa4f0b436df4c2332ddd4624eea4e52e85aa044ee68677`, 3,260,361 bytes (`main` at `66bff1b`) |
| Phase 0 build with this fix | `4551175ef8c697742c4a704047b1e3e5f306c61a532dd94a4d34d3f47c3f6643`, 3,264,762 bytes |
| `window.__L5R_TEST__` | unchanged: the fix adds no key |
