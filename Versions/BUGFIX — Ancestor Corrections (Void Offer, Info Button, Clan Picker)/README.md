# BUGFIX — Ancestor Corrections (Void Offer, Info Button, Clan Picker)

Three corrections from the owner's iPhone check of 1 October 2026 (the "iPhone Test Checklist"
doc), bundled on the owner's word into one folder: one test run, one removal proof, one device
check. Each part has its own switch. Branch: `claude/bugfix-ancestor-corrections`. **Not merged: it
waits for the owner's iPhone check ([MANUAL-TESTS.md](MANUAL-TESTS.md)) and word.**

Two other points from the same check were **deferred by the owner**, not built: a once-a-session
gift that is already used should not be offered at all (checks 4.18 and 4.23), and the first tap of
Manage is slow (checks 1.1 and 1.3; Phase 15). The gold i in the Advantage configuration windows
stays until Phase 15.

## 1. Void offers beside a declared Void gift (check 4.23)

**Reported:** with Seppun's gift ticked on a Battle roll (Rank 1), the preview's Void section swapped
"+1k1" for "Make an Unskilled roll Skilled", on a roll that was already Skilled.

**Measured** on `main` (`7daf6aec…`), headless, through the real preview:

| Roll | Void offers before the gift is ticked | After |
|---|---|---|
| Battle, Rank 1 | +1k1 | **Make Skilled** |
| Awareness, a Trait roll | +1k1 | **Make Skilled** |
| An unskilled Skill roll (Rank 0) | +1k1, Make Skilled | Make Skilled |
| Courtier, Rank 1, with Komori Iongi's gift | +1k1 | **Make Skilled** |

**Cause.** Seppun's and Komori Iongi's gifts are a Void Point's +1k1 taken without spending one, and
the Ancestors (Phase 4.8, Part I) switch them off whenever a one-roll Void effect is armed, because a
roll takes one such effect. The preview (Phase 3, Part G) offers a Void option when arming it
changes the roll, measured from the roll with no Void armed. With a gift ticked, arming any option
switches the gift off, which changes the roll, so an option that does nothing on that roll looked as
if it mattered. It is the same family as BUGFIX — Void Offer List (Wrong Baseline, Silent Refusal), reintroduced by a
new contributor whose bonus depends on the Void being unarmed.

**Fix.** `voidKeyWouldMatter` is rebound: the preview's own test runs first, unchanged, and an option
is then offered only if arming it also brings its own Void effect onto the roll (a `source:'void'`
modifier the unarmed roll lacks). +1k1 stays hidden beside a ticked gift (spending a Void Point would
add nothing); Make Skilled stays offered on a genuinely unskilled roll, where it is a real trade.

## 2. The Ancestor's info button (check 4.1)

**Reported:** the Ancestor's circled i is the gold italic one; the owner wants the i the Advantages
carry. **Measured:** Phase 4.8 copied `.adv-config-info` (18px, a gold ring, Shippori Mincho 12px
italic bold), which only the Advantage configuration windows use. The ten Advantages built in
A01–A16 (Dark Paragon's `.dp4523-info`, Named Advantages' `.named4513-info` and their siblings) all
carry one style: 28px, a ring in the ink colour, Georgia 17px upright. **Fix:** one stylesheet rule
gives the Ancestor's button that style while the page carries `ancfix-info`, which this part's switch
adds. The glyph is still drawn by the stylesheet, so the heading's text is unchanged.

## 3. The Ancestor list follows the Clan picker

**Found** the same day while writing the checklist, headless: before a Family is applied the Ancestor
card reads the Clan & School picker, but nothing redrew it when the picker changed, so the previous
Clan's Ancestors stayed listed until the next recalculation (Apply Family, or any edit, put it right).
**Fix:** the card is redrawn when either Clan picker (Clan, or Minor Clan) changes. A chosen Ancestor
is kept, and once a Family is applied its Clan still decides.

## One retained check corrected (test-only)

The first full run failed one retained check, Phase 4.8's `ANC48-PLACE-INFO-MATCHES-ADVANTAGES`, and
nothing else (3,443/3,444). That check compares the Ancestor's i with the configuration windows'
`.adv-config-info`, the reference the owner has now ruled out. It is made conditional, as Phase 4.8
made two Feature 4.5.15 and 4.5.16 checks conditional: while the page carries this fix's class, the
oracle is an A01–A16 button (`.dp4523-info`, its glyph a text "i"); without it, the check reads
exactly what it read before. Phase 4.8's harness gives **349/349 with the fix and 349/349 on `main`
without it**. Its original is in `originals/PART I — Phase 4.8 Ancestors/qa/`.

## Files

| File | Purpose |
|---|---|
| Phase 0 `src/sheet/209.999992-bugfix-ancestor-corrections.js` | The three parts and their switches (`BUGFIX ANCFIX`) |
| Phase 0 `src/css/59.9999-bugfix-ancestor-info.css` | The info button's style (`BUGFIX ANCFIX`) |
| Phase 0 `build/manifest.json` | Two entries, new expected hash |
| `QA — Removal Chain Registry/removal_chain.py` | One entry at the end of `CHAIN` |
| Phase 4.8's and Phase 3's (Part G) `ROLLBACK.md` | Each names this fix; their earlier copies, and the registry's, are in `originals/` |
| Phase 4.8's `qa/ancestors-harness.js` | One check made conditional (test-only, above); its original is in `originals/` |
| `qa/ancfix-harness.js` | 28 checks through the real preview, real select changes and computed styles |
| `qa/verify-variants.py`, `qa/expected-failures.json` | Seven broken variants with pinned failures, two boundary builds |
| `qa/current-suite-runner.js` | Chains the Multiple Schools fix's full runner and this harness |
| `qa/remove-phase.py`, `qa/test-removal.py` | Surgical remover and its adversarial tests |
| `MANUAL-TESTS.md` | The owner's iPhone check |

## QA (1 October 2026, Windows laptop, Chromium via Playwright 1.63)

**Final combined run: 3,444/3,444, zero failed suites** (3,416 retained + 28 new), with
`qa/current-suite-runner.js`, after the one test-only correction below.

| Build | Bytes | SHA-256 |
|---|---:|---|
| This fix (branch) | 3,264,762 | `4551175ef8c697742c4a704047b1e3e5f306c61a532dd94a4d34d3f47c3f6643` |
| `main` before it (`66bff1b`) | 3,260,361 | `7daf6aec5558807f81aa4f0b436df4c2332ddd4624eea4e52e85aa044ee68677` |

**Harness: 28/28** on the fixed build. **On `main` it gives 18/28**: the ten that fail are exactly
the three bugs (three Void offers, the info button's box, colour and glyph, four Clan picker reads);
the eighteen that pass are behaviour that must not change. Oracles: the preview's own Void
checkboxes and the dice of a real roll; a button carrying the A01–A16 Advantages' own classes,
measured with `getComputedStyle`; the Ancestor picker's first group straight after a change event.

| Scenario | Checks | What it drives |
|---|---:|---|
| Void, no Ancestor | 4 | The offers on a Rank 1, an unskilled and a Trait roll are as they always were |
| Void, Seppun | 7 | The owner's case; a Trait roll; an unskilled roll keeps Make Skilled; unticking; a real roll with the gift (5k4 from 4k3, no Void Point spent) |
| Void, Komori Iongi | 2 | The same on her gift |
| Info button | 8 | The two Advantage references agree; box, colour and glyph match them; no text added; fits at 390px; opens the rules |
| Clan picker | 7 | Imperial, Ronin, Badger, and the Minor Clan picker alone; a chosen Ancestor kept; an applied Family still decides |

**Deliberate faults**, each built in a scratch copy, all failing with exactly the pinned assertions
in `qa/expected-failures.json` (discovered, then confirmed by a separate pinned run: "all as expected"):

| Variant | Result |
|---|---:|
| Fix removed (the rebuild is `main`'s build) | 18/28 |
| Void offer switch off | 25/28 |
| Info button switch off | 25/28 |
| Clan picker switch off | 24/28 |
| Own effect alone, without the preview's own test (offers +1k1 beside a ticked gift) | 24/28 |
| Italic glyph kept | 27/28 |
| Minor Clan picker not watched | 27/28 |

**Boundaries**, fully green: Phase 12's modes switched off, 28/28; Phase 4.8's Ancestors switched
off, run with `--no-ancestors`, 7/7 (the ordinary offers stand, the pickers raise no error).

**Removal:** `qa/test-removal.py` **12 tests, 11 passed, 1 skipped** (Windows symlinks). The
live-tree test strips later releases through the chain, removes this fix from a copy and rebuilds to
exactly `main`'s build above. Registry `qa/test-chain.py` **11/11**. With this fix in the tree the
live removal tests of the Multiple Schools fix, the Manage fix, Phase 4.8 and Phase 11 all pass.
`qa/feature-dependencies.py … "BUGFIX" --also ancfix-info`: every reference is inside the blocks the
fix owns. `build.py --check-drift`: identical to the Phase 0 build.

**Structure** (`qa/inventory.py`, against `main`): 270 element IDs, all unique, and every other
count unchanged; only the sheet's script and stylesheet differ.

Not tested here: Safari and a real phone (see `MANUAL-TESTS.md`). The web fonts do not load in this
environment; the info button's check compares computed styles, not rendered pixels, and Georgia is a
system font on the iPhone.

### Regression matrix

| Area | Risk | Validation |
|---|---|---|
| Void offers on every roll | High | No-Ancestor scenario; the preview's own test still runs first; three variants |
| Ancestor gifts paid at roll time | High | A real roll with Seppun's gift; the full retained suite, including Phase 4.8's 349 checks |
| The Ancestor card | Medium | Info and Clan scenarios; chosen Ancestor kept; applied Family decides |
| Everything else | — | The full retained suite |
