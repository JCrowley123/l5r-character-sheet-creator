# Rolling back Part J, Phase 8 — Casting Diagnostics ("Why can't I cast this?")

## Dependencies

Per `CLAUDE.md`'s "Every feature must be surgically removable", declared here before shipping so
a removal is never a surprise. Verified with:

```bash
python3 qa/feature-dependencies.py src/sheet/209.7-feat-casting-diagnostics.js "PART J PHASE 8" \
  --also castWhyModalOverlay castWhySubtitle castWhyBody castWhyX cast-why-btn \
         cwd-body cwd-clean cwd-row cwd-text cwd-detail cwd-badge cwd-blocked cwd-caution
```

— exit 0, clean: every reference sits inside a block this phase's own marker owns.

- **This phase depends on the trunk**, and on nothing else. It reads `SPELL_ELEMENTS`,
  `UNIVERSAL_SPELL_ELEMENTS`, `characterCasterLock()`, `getSchoolsList()`,
  `findSchoolLibraryEntry()`, `schoolCasterCategory()`, `effectiveSchoolRankForElement()`,
  `effectiveSchoolRankForSpell()`, `getActiveSchoolElementalProfile()`,
  `getActiveSchoolKeywordProfile()`, `universalSpellElementBlockReason()`, `hasSpellScroll()`,
  `refreshModalStacking()`, `escHtml()`/`escAttr()`, and the live DOM. All are core sheet code,
  not optional phases, so removing this phase simply stops calling them.
- **This phase depends on NO removable feature.** It touches no other phase's functions, classes
  or elements. Phases 1, 1.6, 2, 9, 3, 4 and 5 can each be removed without affecting it, and it
  can be removed without affecting them — measured in both directions, see the README's table.
- **Removable features that depend on this phase: none today.**

### ⚠️ Part G Phase 6, when it is built, WILL depend on this phase

This is the one declaration that matters, and it **inverts** the roadmap's stated direction.

The roadmap lists `SynergyEngine` (Phase 6) as a dependency *of* Phase 8. Phase 6 is blocked on
sourcebook text this repository does not carry, so this phase was built first, with an **open
registry** precisely so Phase 6 can add to it later without editing this fragment:

```js
registerCastingDiagnostic('synergy-exceptions', 50, fn);   // from Phase 6's OWN fragment
```

A contributor returns findings, or a `castingSuppression(id, reason)` that cancels one of the
built-in reasons — which is what "this technique lets you ignore that restriction" means.

So when Phase 6 lands:

- **Phase 6's `ROLLBACK.md` must declare a SOFT dependency on this phase**: it registers a
  contributor here. Removing this phase must leave Phase 6's registration a guarded no-op —
  Phase 6's call site should be `if (typeof registerCastingDiagnostic === 'function') …`,
  exactly like every other cross-fragment call in this project.
- **This phase stays removable regardless.** With no contributor registered the seven built-in
  rules are the whole engine, which is the state shipped and measured today.
- **The roadmap's Phase 8 Dependencies line should be amended** to record the inversion, or
  someone later reads "Phase 8 needs Phase 6" and is misled.

Checks 22–27 in this phase's harness drive that seam directly (register, add, suppress, contain
a thrower, unregister), so the contract Phase 6 is promised is tested before Phase 6 exists.

### Comment-only mentions

This phase's CSS comment explains that its severity colours are pinned rather than read from
`--shu*`, and names Phase 9 of Part H's `CLAN_THEME_PALETTE` as the reason. Its
`remove-phase.py` and README name Phase 4 of Part G and Phase 5 of Part J as worked examples.
None is a dependency: removing any of those phases leaves a stale sentence and nothing else.

**Note on wording.** Every phase reference in this phase's own source comments is deliberately
written `Phase 6 (Part G)` rather than `Part G Phase 6`. `qa/feature-dependencies.py`'s
`MARKER_RE` is **case-insensitive**, so marker-shaped prose inside a comment is parsed as a real
ownership marker — it reported this phase's entire seam block as belonging to a `PART G PHASE 6`
that does not exist. Keep the inverted wording in any future edit to these comments.

## The fast way first: one flag

In `src/sheet/209.7-feat-casting-diagnostics.js`:

```js
const CASTING_DIAGNOSTICS_ENABLED = false;
```

then rebuild (`python3 build/recombine.py` from the Phase 0 folder). The `?` button is never
attached, `getCastingDiagnostics()` returns an empty report for everything, and the modal is
never opened. Nothing else in the codebase changes and the fragment stays in the build, ready to
flip back on.

Verified: a scratch build with the flag flipped drops this phase's harness from 32/32 to
**15/32**, with no page errors.

## Surgical removal (verified, scripted, byte-exact)

`qa/remove-phase.py` in this folder performs it and **asserts** that every line it deletes names
something this phase owns and carries no other phase's marker, so the proof fails loudly rather
than passing by luck:

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
cp -r build src /tmp/scratch-copy/          # it refuses to run against the live tree
python3 "../../Part J — Data Integrity & Validation/PART J — Phase 8 Why Cant I Cast This/qa/remove-phase.py" /tmp/scratch-copy
python3 /tmp/scratch-copy/build/recombine.py
```

What it removes, and what each is terminated by:

| # | File | Block | Lines |
|---|---|---|---|
| 1 | `src/sheet/209.7-feat-casting-diagnostics.js` | the whole fragment | — |
| 2 | `build/manifest.json` | the fragment entry | 2 |
| 3 | `src/sheet/090-table-rows-weapons.js` | the `makeEntry()` button hook | 4 |
| 4 | `src/sheet/110-modals-trackers.js` | the `recalcAll()` badge refresh | 5 |
| 5 | `src/sheet/210-test-seam-and-init.js` | the seam export block | 17 |
| 6 | `src/sheet/210-test-seam-and-init.js` | the `init()` call | 4 |
| 7 | `src/markup/20-fixed-layers.html` | the modal overlay | 16 |
| 8 | `src/css/10-sheet-base.css` | the `.cast-why-btn` / `.cwd-*` block | 34 |

**Two of those terminators are load-bearing — do not "simplify" them.**

- **The CSS block ends at `PART J PHASE 5`'s marker, NOT at the trunk's Print banner.** This
  phase's block sits deliberately *above* Phase 5's. Written the other way round — at the end of
  the file, where every previous phase put its block — it lands between Phase 5's block and the
  Print banner, which is the span Phase 5's own remover deletes. That is not hypothetical: it
  was written that way first and Phase 5's remover refused outright (*"line 1752 belongs to
  another phase"*). Its `FOREIGN` assertion caught it; review had not.
- **The markup block ends at the trunk's `CHUDA SHUGENJA DEFICIENCY PICKER` comment, not at the
  overlay's own `</div>`.** The blank line after that `</div>` is also this phase's, and leaving
  it behind costs byte-identity with the pre-phase build — which is the assertion the README
  quotes.

`originals/` in this folder holds a verbatim pre-edit copy of every file touched, and is safe to
restore wholesale **only if** no later phase has since edited the same files — check first. The
surgical route above is the method; the snapshot is the fallback.

### Rebuild and re-pin

```bash
python3 build/recombine.py            # note the printed sha256
# paste that hash into manifest.json's "expect_sha256"
python3 build/recombine.py --verify   # now reports BYTE-IDENTICAL
python3 build.py --check-drift        # from the repo root
```

## What that leaves

- **Every spell casts exactly as it does now.** This phase reports; it never blocks. `castSpell()`
  is untouched and no arithmetic reads anything it computes.
- **The `?` button and its modal disappear.** Spell entries return to Cast plus the Memorised
  tick box.
- **Measured, not asserted:** the removed tree rebuilds to `71ab9e176db025ad…`, **2,289,334
  bytes** — byte-identical to the build from immediately before this phase was added. That is
  the strongest available form of "nothing else was touched", and it is what the README's
  regression table rests on.
- **Every other phase passes in full** against that removed build — 23/23, 9/9, 19/19, 17/17,
  43/43, 22/22, 25/25 and 6/6 respectively.
- **Phase 5 and this phase are independently removable in either order**, measured both ways:
  with Phase 5 removed and this phase kept, this phase reads **32/32**; with this phase
  removed and Phase 5 kept, Phase 5 reads **25/25**. Phase 5's own `remove-phase.py` was
  re-run against the tree as it now stands and completes cleanly — the reason this phase's
  CSS block sits above Phase 5's rather than below it.

## Confirming the rollback

```bash
NODE_PATH=$(npm root -g) node \
  "../../Part J — Data Integrity & Validation/PART J — Phase 8 Why Cant I Cast This/qa/casting-diagnostics-harness.js" \
  l5r-character-sheet.html
```

Expect it to stop immediately with **0/1** — *"the phase exports getCastingDiagnostics on the
test seam — got undefined"*. That is the correct result for a completed removal, not a failure
to investigate. The rollback is confirmed by the byte-identity above and by the OTHER harnesses
still passing in full.

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before this phase | `71ab9e176db025adfc944d771d6de5a82ef369af6e874e843336bc469d00e13f` |
| Phase 0 build `sha256`, after this phase (current) | `6c69f0723c4227b03438d095d84e6d1a63982a4ba5b10148c8cbc1ace6d6a99f` |
| bytes, before / after | 2,289,334 / 2,319,259 |
| `element_id_count`, before / after | 259 / **263** (all unique both times) |
| `section_count` | unchanged: 10 |
| `roll_modal_overlay_count`, before / after | 24 / **25** |
| `window.__L5R_TEST__` key count, before / after | 322 / **340** |
| `window.__L5R_CAROUSEL__` method count | unchanged: 11 |
