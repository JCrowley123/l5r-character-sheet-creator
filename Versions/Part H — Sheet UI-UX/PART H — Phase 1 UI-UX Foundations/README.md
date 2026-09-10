# Part H, Phase 1 — UI/UX Foundations

One addition: a scroll-to-top button, since each Section panel scrolls independently and a
long tab can leave a player stranded far below the tab bar.

**Status: built and verified. 7/7 automated checks pass, plus a full before/after behavioural
diff showing zero differences anywhere outside the one new element this phase adds.**

A second feature — a colour accent on the Rings tab marking the character's Affinity and
Deficiency Ring — was built, tested, and shipped in this phase, then reverted after the
project owner saw it live and decided against it. See *Reverted: the Ring accent* below.

---

## The audit came first, and it shrank the phase

The roadmap's brief asks for three colour-coding targets: "spell lists, ring displays,
affinity/deficiency indicators." Reading the existing code before writing any, two of those
three turned out to already exist:

- **Spell element icons are already colour-matched to their pips** — `SPELL_ICON_COLORIZE`
  and each element's `colorVar` (`010-prelude.js`), consumed by the Spell Slots tracker's row
  build (`080-identity-build-ui.js`). There is a documented revert switch and everything.
- **Affinity/Deficiency is already colour-coded** — the Applied School badge
  (`renderAppliedSchoolAffinity()`, `050-kiho-rules.js`) already carries gold `is-affinity` /
  maroon `is-deficiency` styling, and that badge's own comment explains it was deliberately
  *kept* during a past cleanup that *removed* a similar badge for Monks: "Affinity and
  Deficiency keep their badges because neither has a field anywhere on the sheet; that is the
  bar an affordance here has to clear... resolved by removing, not multiplying."

Building either again would be the exact duplication this phase's own Engineering Scope
("add a colour-coding utility... to avoid duplication") asks to avoid, not new work. So this
phase's actual scope was already narrower than the roadmap's own framing before a line of
production code was written: **the scroll-to-top button** was the one target with no existing
treatment at all.

### No new UI state manager

The Engineering Scope allows for one "if not already present." None is needed: the scroll
button's visibility is derived live from a DOM `scrollTop` read, the same DOM-as-model
approach every other feature on this sheet already uses.

## Reverted: the Ring accent

A Ring-card colour accent (gold outline + "Affinity" tag / maroon outline + "Deficiency" tag,
driven by the same `getActiveSchoolElementalProfile()` the Applied School badge already reads)
was built, covered by 8 passing automated checks, and shipped to `main`. After trying it on a
real device, the project owner decided they didn't want it and asked for it to be reverted —
a product-taste call, not a defect report. It is gone: the `ringAffinityStatus()` /
`renderRingAffinityAccents()` functions, the `recalcAll()` call, the CSS classes, the seam
exports, and the harness checks that covered it have all been removed from
`205-feat-ui-foundations.js` and its wiring. Nothing about the Applied School badge itself was
ever touched either way — it looked the same before this phase, during it, and after the
revert.

This is recorded here rather than scrubbed from history because the audit finding above (the
badge already existing, and why a second affordance was arguably redundant with it in the
first place) turned out to anticipate the eventual product decision reasonably well — worth
keeping visible for whoever reads this next.

## What changed, where

Everything lives in one new fragment, `src/sheet/205-feat-ui-foundations.js` — new because
nothing existing needed rewriting (contrast Phase 1.6, whose whole diff was inside functions
that already existed). Three other files needed a small, additive touch to wire it in:

| File | What changed |
|---|---|
| `src/sheet/205-feat-ui-foundations.js` | **New.** `getActiveCarPage()`, `scrollToTop()`, `updateScrollTopVisibility()`, `initScrollToTop()` |
| `src/sheet/210-test-seam-and-init.js` | Calls `initScrollToTop()` from `init()`; exports the four new names to `window.__L5R_TEST__` |
| `src/markup/20-fixed-layers.html` | New `#scrollTopBtn`, styled and positioned like the existing floating dice button, opposite corner |
| `src/css/10-sheet-base.css` | `.scroll-top-btn` (+ `[hidden]`) |
| `build/manifest.json` | New fragment entry (no `lines` provenance — it wasn't carved from the original monolith); `expect_sha256` updated |

## A real bug the harness caught, not inspection

The first working version of `initScrollToTop()` attached a `scroll` listener to every
`.car-page` element present at page-init time — ten of them. The carousel's own infinite-loop
wraparound (`10-carousel.js`) later clones **two** of those pages so it can scroll seamlessly
past the first/last tab. A per-element listener pass taken before those clones exist silently
misses them: switching to a cloned tab and scrolling it would never reveal the button at all,
with no error anywhere.

The harness caught this directly — "scrolling the active panel down reveals the button" failed
because the active element (a clone) had no listener. Fixed by switching to **capture-phase
delegation**: one `document.addEventListener('scroll', updateScrollTopVisibility, {capture:true})`
catches every `.car-page`'s scroll regardless of when it was created, since `scroll` events
don't bubble but do still propagate through the capture phase to every ancestor. No
enumeration, so no clone this carousel creates in the future can be missed the same way again.

A second, smaller thing the harness's own investigation surfaced: `.car-page[hidden]` is
`display:none` (see `20-carousel.css`), and Chromium resets a `display:none` element's
`scrollTop` to 0. So a hidden tab's scroll position never actually survives being hidden in
this carousel — verified empirically, not assumed. The `MutationObserver` watching the
`hidden` attribute (so a freshly-shown tab gets re-checked even though it fires no `scroll`
event of its own) is correct to keep regardless: it is presently unfalsifiable by scroll
position alone, and would start mattering the moment `[hidden]` styling ever became
`visibility:hidden` instead, which *does* preserve scroll offset.

## A pre-existing bug this phase's field-testing surfaced, but did not cause

Testing on a real iPhone (the first real-device test this whole project has had — every prior
phase's verification ran headless, via Playwright/Chromium, since a cloud session cannot open
a browser itself), the project owner also reported the Spell Slots tab missing entirely after
applying a caster School (Asahina Shugenja). **Reproduced and confirmed unrelated to this
phase**: driving the exact same Apply-School flow through `window.__L5R_TEST__` against the
build from the *end of Phase 1.6* — before any of this phase's code existed — shows the
identical failure. `updateSpellSlotsVisibility()` correctly sets `#spellSlotsSection`'s
`display` to visible the moment `characterCasterLock()` returns `'shugenja'`, but the
carousel's own `.car-page[data-tab-label="Spell Slots"]` keeps its `hidden` attribute set
regardless, and the tab never appears in the tab bar. The carousel's `watchVisibility()`
(`10-carousel.js`) is specifically built to react to exactly this kind of change — its own
comment says so — so this is a real defect in that mechanism, not a missing feature; it simply
predates Phase 1 and had never been exercised end-to-end (dropdown → Apply → tab bar) by any
automated flow or, apparently, a live human, until now. Left unfixed here deliberately —
diagnosing and repairing carousel internals is Part D's territory, not this phase's, per
"do not modify previous phases or layers" — and flagged for its own dedicated fix.

The reported missing scroll-to-top button, by contrast, did **not** reproduce: this phase's
own harness drives a real scroll past the visibility threshold and confirms the button
appears, both before and after the Ring-accent revert (see *Verification* below). The most
likely explanation is that no single tab had yet been scrolled far enough in one continuous
motion to cross the 300px threshold before the report — worth confirming by scrolling deep
into one long tab (Skills or Equipment) specifically, rather than switching between several
tabs each scrolled only a little.

## Verification

**1. `qa/ui-foundations-harness.js` (this folder) — 7/7.** The scroll button's full lifecycle:
hidden on open, shown past the threshold, an instant — not smooth — scroll back to 0 on click,
re-hides, hides on switching tabs, and the `MutationObserver` path exercised by revisiting a
previously-scrolled tab. (An earlier version of this harness also covered the Ring accent at
8/8 before its revert — see git history for that version if it's ever needed again.)

**2. A full before/after behavioural diff**, using Phase 0's own `qa/behaviour-harness.js`
against two builds — fragments as they were at the end of Phase 1.6, and as they are now
(post-revert) — across all 14 of its flows. Every raw difference the diff reports resolves to
exactly one of two expected causes, and nothing else: the new `#scrollTopBtn` element's own
snapshot appearing in every flow (always `hidden:true`, `value:''` — none of the 14 flows
scroll a panel, so it correctly never shows); and the `window.__L5R_TEST__` seam gaining
exactly four keys (`getActiveCarPage`, `scrollToTop`, `updateScrollTopVisibility`,
`initScrollToTop` — confirmed by set comparison, zero removals). **Zero other fields, across
every id-keyed element in all 14 flows, differ at all.**

**3. Phase 0.6 and 0.7's own harnesses, re-run against the new build** — 12/12
(`pwa-harness.js`) + 5/5 (`update-harness.js`), plus Phase 0.7's `build_android.py --check`,
confirming the installable web app and the Android app's staged assets are both still
byte-identical to the freshly built site.

Run it yourself:

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
python3 build/recombine.py --verify
cd "../../../Part H — Sheet UI-UX/PART H — Phase 1 UI-UX Foundations"
NODE_PATH=$(npm root -g) node qa/ui-foundations-harness.js "../../Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html"
```

## Both shells stay in sync

Same chain as every phase since Phase 0.7: `python3 build.py` (website) and Phase 0.7's
`build/build_android.py` (Android's staged web assets) both start from Phase 0's fragments,
and their own checks confirm both land on the identical byte-for-byte page:

```
website page sha256 (Phase 0.6 build)     : bbf4c9366e8134c654141d66b4b743a150416359142f9b6613b703d1cd44c7c6
Android staged page sha256 (Phase 0.7)    : bbf4c9366e8134c6...   (identical)
```

## What a player sees

Scroll down any long tab (Skills, Equipment, Techniques) and a small round button appears in
the bottom-left corner — opposite the floating dice button — that jumps straight back to the
top of that tab. It disappears again once you're back near the top, and switching tabs always
starts a tab at its own top.

## Rollback

See `ROLLBACK.md`. This phase's diff, like Phase 1.6's, lives inside Phase 0's own fragments —
rollback means restoring the touched fragments from `originals/`, not deleting a folder Phase 0
never depended on. One of those files (`205-feat-ui-foundations.js`) never existed before this
phase, so "restoring" it means deleting it outright, not copying an earlier version —
`ROLLBACK.md` says so explicitly.
