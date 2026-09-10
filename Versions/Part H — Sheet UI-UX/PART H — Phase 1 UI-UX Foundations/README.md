# Part H, Phase 1 — UI/UX Foundations

One addition: a scroll-to-top button, since each Section panel scrolls independently and a
long tab can leave a player stranded far below the tab bar.

**Status: built, shipped broken, fixed. 9/9 automated checks pass against the current build —
and 4/9 against the build that shipped, which is the point: the first version of this phase's
harness could not fail (see *The bug my own harness hid*). Plus a full before/after
behavioural diff showing zero differences anywhere outside the one new element this phase
adds.**

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

## The bug my own harness hid

**This feature shipped broken, passed 15/15 of its own checks, and was caught by the project
owner on a real phone.** The failure is worth recording in full, because the code bug was
ordinary and the testing bug was not.

**The code bug.** `getActiveCarPage()` was written as
`document.querySelector('.car-page:not([hidden])')`, on the belief that the carousel marks the
active tab by un-hiding it. It does not. The carousel is a horizontal scroll-snap track: all
twelve pages (ten real, two loop clones) sit side by side in the DOM at once, and which one
you see is a function of the track's horizontal scroll offset. `hidden` marks only
*conditional* pages — Spell Slots, while the character is not a caster. Eleven of the twelve
pages are un-hidden at any moment, so that selector returned the first in DOM order — a clone
of the Background page — on every tab. The button therefore read the scrollTop of a page
nobody was looking at, saw `0` forever, and never appeared.

**The testing bug, which is the more serious one.** The harness asked `getActiveCarPage()`
which page was on screen, scrolled *that*, then asked `updateScrollTopVisibility()` — which
reads the very same function — whether the button should now show. Both halves agreed with
each other perfectly while both were wrong about the world. Every check passed. A test whose
oracle is the code under test cannot fail, no matter how many cases it enumerates, and 15
green checks bought exactly no confidence here.

**The fix, in both places.** `getActiveCarPage()` now picks the page whose horizontal centre
is nearest the track's viewport centre — true mid-swipe as well as after the snap settles,
needing no carousel API, and immune to the loop clones (whichever copy is actually on screen
is the one it finds). And the harness now takes "which page is the player looking at" from
`window.__L5R_CAROUSEL__.getActiveTab().panel` — the carousel's own answer, which this phase
does not own and cannot bend — with its **first** check being that `getActiveCarPage()` agrees
with that on all nine tabs. Confirmed to discriminate: **9/9 against the fixed build, 4/9
against the build that shipped**, failing on precisely the tabs the owner reported.

### Two smaller things the same investigation settled, by measurement

- **The clone problem was real and the fix for it was right.** An even earlier draft attached
  a `scroll` listener per `.car-page` at init time, enumerating the ten that existed before
  the carousel had cloned two more. That one the harness did catch. It stays fixed by
  capture-phase delegation: one `document` listener with `{capture:true}` catches every
  page's scroll regardless of when the page was created, since `scroll` events don't bubble
  but do still propagate down through the capture phase.
- **Leaving a tab returns it to its own top**, so arriving anywhere means arriving at the top.
  Not because hidden pages are `display:none` (an earlier version of this file claimed that,
  and it was wrong — inactive pages are not hidden at all): the carousel marks off-screen
  pages `inert`, their computed `content-visibility` becomes `auto`, and the scroll offset
  goes with the skipped layout. Measured directly rather than reasoned about, after the first
  explanation turned out to be fiction.

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

The same report also flagged the scroll-to-top button never appearing. That one **was** this
phase's own bug, and a real one — see *The bug my own harness hid* above. It was initially
misdiagnosed here as "probably not scrolled far enough within one tab", on the strength of a
harness that could not fail; a second round of screenshots showing several screens of
continuous scrolling inside a single tab ruled that out and led to the actual cause.

## Verification

**1. `qa/ui-foundations-harness.js` (this folder) — 9/9, and 4/9 against the broken build.**
Both numbers matter: a harness that only reports green on the fixed build is the kind that
shipped this bug in the first place. It checks that `getActiveCarPage()` agrees with the
carousel's own active panel on all nine tabs (the check that catches the shipped bug), then
the button's full lifecycle against panels the *carousel* identifies: hidden at the top,
shown past the threshold, an instant — not smooth — scroll back to 0 on click, hidden on
moving to a tab sitting at its own top, and shown again after re-scrolling a tab that has
been through the off-screen `inert`/`content-visibility` cycle. (An earlier version also
covered the Ring accent at 8/8 before its revert — see git history if it's ever wanted.)

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
website page sha256 (Phase 0.6 build)     : 46d4ef27dc3b9767d064adaaa2fff459db2c904801fc74ed96d52209e37a0a0a
Android staged page sha256 (Phase 0.7)    : 46d4ef27dc3b9767...   (identical)
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
