# Rolling back Part J, Phase 5 — Character Creation Linting

## Dependencies

Per `CLAUDE.md`'s "Every feature must be surgically removable", declared here before shipping so
a removal is never a surprise. Verified with:

```bash
python3 qa/feature-dependencies.py src/sheet/209.5-feat-character-validator.js "PART J PHASE 5" \
  --also validationReport vr-panel vr-head vr-clean vr-row vr-text vr-detail vr-badge \
         vr-badge-error vr-badge-warning vr-badge-info vr-badge-clean vr-error vr-warning vr-info
```

— exit 0, clean: every reference sits inside a block this phase's own marker owns.

- **This phase depends on the trunk**, and on nothing else. It reads `RINGS`,
  `getSchoolsList()`, `findAnySchoolLibraryEntry()`, `schoolCasterCategory()`,
  `calculateSchoolRank()`, `escHtml()`/`escAttr()`, and the live DOM (`#skillsBody`,
  `#techList`, the Trait and XP inputs). All are core sheet code, not optional phases, so this
  needs no declaration beyond the note — removing this phase simply stops calling them.
- **This phase depends on NO removable feature.** It touches no other phase's functions,
  classes or elements. Phases 1, 1.6, 2, 9, 3 and 4 can each be removed without affecting it,
  and it can be removed without affecting them — measured in both directions, see the README.
- **Removable features that depend on this phase: none.** Nothing calls
  `validateCharacter()`, reads `#validationReport`, or references a `.vr-*` class outside this
  phase's own marked blocks.
- **Comment-only mentions.** This phase's CSS comment explains that its severity colours are
  pinned rather than read from `--shu`, and names Phase 9's `CLAN_THEME_PALETTE` as the reason.
  Its `remove-phase.py` and the CSS block's closing comment both name Part G Phase 4 as the
  worked example of the marker-ownership trap. Neither is a dependency: removing Phase 9 or
  Phase 4 leaves a stale sentence and nothing else.

**This phase changes no behaviour.** Every rule is a pure read; nothing clamps a value, blocks
an edit, refuses a save, or alters a roll. The strongest statement of that is in the removal
proof below: a build with this phase surgically removed hashes **byte-identically** to the build
from before it was added.

## The fast way first: one flag

In `src/sheet/209.5-feat-character-validator.js`:

```js
const CHARACTER_VALIDATOR_ENABLED = false;
```

then rebuild (`python3 build/recombine.py` from the Phase 0 folder). `validateCharacter()`
returns an empty report for everything and `renderValidationReport()` empties and hides the
panel, so the Identity tab is back to ending at the XP breakdown. Nothing else in the codebase
changes and the fragment stays in the build, ready to flip back on.

Verified: a scratch build with the flag flipped drops this phase's harness from **25/25 to
11/25**, with no page errors. The eleven that still pass are the checks asserting an *absence*
(a clean character, a silent rule) plus the pure-parse check on `validatorConcreteSkills()`,
which is a string function the flag does not gate — exactly the set that should survive.

## Surgical removal (scripted, asserted, and verified byte-exact)

`qa/remove-phase.py` in this folder performs the whole removal and **asserts before every
deletion** that the lines it is about to cut contain no other phase's marker and name only
things this phase introduced. It refuses to run against the live tree.

```bash
cp -r "<Phase 0>/src" "<Phase 0>/build" /tmp/scratch/
python3 "qa/remove-phase.py" /tmp/scratch
cd /tmp/scratch && python3 build/recombine.py
```

It earned its assertions: on its first three runs it refused, correctly, over lines it could not
attribute — the seam block's `Object.assign` boilerplate, an HTML comment continuation, and a
two-declaration CSS line. Each was a gap in the script's attribution rules rather than a real
ownership problem, and each was fixed by making the rule precise instead of by loosening it.

### What it removes, and what to do by hand if you prefer

1. **The fragment**: `rm src/sheet/209.5-feat-character-validator.js`
2. **Its manifest entry**: the two-line `"src/sheet/209.5-feat-character-validator.js"` object
   in `build/manifest.json`.
3. **`src/sheet/110-modals-trackers.js`** — 7 lines at the end of `recalcAll()`: the
   `PART J PHASE 5` comment and the guarded
   `if(typeof renderValidationReport === 'function') renderValidationReport();`.
4. **`src/sheet/210-test-seam-and-init.js`** — 15 lines: the blank line above the
   `// ---- PART J PHASE 5 ... ----` marker, the marker, its prose, and the whole guarded
   `Object.assign` block through its closing `}`. **Take the blank line too** — leaving it
   produces a doubled blank and the file stops being byte-identical to its pre-phase state.
5. **`src/markup/10-swipe-tab-shell.html`** — 6 lines: the `PART J PHASE 5` HTML comment and
   the `<div id="validationReport" class="vr-panel print-hide"></div>` under `#xpBreakdown`.
6. **`src/css/10-sheet-base.css`** — 45 lines: from the
   `/* ---------- PART J PHASE 5: ValidationReport ---------- */` marker down to, **but not
   including**, the trunk's own `/* ---------- Print / PDF export (physical play) ---------- */`
   banner.

**That Print banner is the terminator and it is load-bearing.** A marker owns every line from
itself until the next marker, and the next thing after this phase's CSS is a plain section
banner rather than another phase's marker — so a removal that deleted "to the end of the file"
would take the trunk's banner with it. Part G Phase 4 shipped exactly this bug in the other
direction (its marker silently owned four of Phase 3's rules) and only
`qa/feature-dependencies.py` caught it. This phase's block therefore ends with an explicit
`/* END PART J PHASE 5 ... */` comment saying where the boundary is, and `remove-phase.py`
stops at the banner rather than at EOF.

### Rebuild

```bash
python3 build/recombine.py            # note the printed sha256
# paste that hash into manifest.json's "expect_sha256"
python3 build/recombine.py --verify   # now reports BYTE-IDENTICAL
python3 build.py --check-drift        # from the repo root
```

## What that leaves

- **The sheet behaves exactly as it does now.** Nothing this phase added was ever consulted by
  anything that computes.
- **The Identity tab** ends at the XP breakdown, as it did before.
- **Every other phase is untouched** — see the README's measured table.

## Confirming the rollback

```bash
NODE_PATH=$(npm root -g) node \
  "../../PART J — Phase 5 Character Creation Linting/qa/character-validator-harness.js" \
  l5r-character-sheet.html
```

Expect it to stop immediately with **0/1** — *"the phase exports validateCharacter on the test
seam — got undefined"*. That is the correct result for a completed removal, not a failure to
investigate. The rollback is confirmed by the other harnesses still passing in full, and by the
hash below.

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before this phase | `50ab1c7143f6a4ff4c06f1a8d384448d0634b4a64af3b8c28e24feea73e648f4` |
| Phase 0 build `sha256`, after this phase (current) | `71ab9e176db025adfc944d771d6de5a82ef369af6e874e843336bc469d00e13f` |
| Phase 0 build `sha256`, after surgical removal | `50ab1c7143f6a4ff4c06f1a8d384448d0634b4a64af3b8c28e24feea73e648f4` — **identical to before**, 2,265,218 bytes both times |
| `window.__L5R_TEST__` key count, before / after | 306 / **322** (+`validateCharacter`, +`renderValidationReport`, +`CHARACTER_VALIDATOR_ENABLED`, +`CHARACTER_VALIDATOR_RULES`, +the nine rule functions, +three validator helpers) |

The removed build matching the pre-phase build **byte for byte** is the strongest form of the
removability claim available here: not "equivalent", not "all tests still pass" — the same file.
