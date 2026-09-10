# Part H, Phase 1 — UI/UX Foundations

Two additions: a scroll-to-top button (each Section panel scrolls independently, and a long
tab can leave a player stranded far below the tab bar), and a colour accent on the Rings tab
marking the character's Affinity and Deficiency Ring at a glance.

**Status: built and verified. 15/15 automated checks pass, plus a full before/after
behavioural diff showing zero differences anywhere outside the one new element this phase adds.**

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
phase's actual scope is narrower than the roadmap's own framing: **the scroll-to-top button**
(genuinely unbuilt) and **a Ring-card accent** (the one target with no existing treatment at
all) — plus the shared pure function both this phase's own additions and any future colour
work should call, so the fact "is this Ring the active School's Affinity/Deficiency" has
exactly one place it is computed.

### Respecting "resolved by removing, not multiplying"

That same comment is also the reason the Ring accent below is colour **and** a small corner
tag, but never restates what the Affinity/Deficiency effect actually *does*. The Applied
School badge stays the one place that explanation lives (tap it, same as before); the Ring
card only echoes *which* Ring it is, from the natural second place a player already looks
when using the Rings tab. Colour alone was deliberately not used on its own, for the same
reason Phase 1.6's wound segments carry an `aria-label` rather than colour by itself.

### No new UI state manager

The Engineering Scope allows for one "if not already present." None is needed: the scroll
button's visibility is derived live from a DOM `scrollTop` read, and the Ring accent is
derived live from the active School — the same DOM-as-model approach every other feature on
this sheet already uses. Introducing a state-tracking layer for two derived, always-recomputed
facts would be new abstraction with nothing to abstract.

## What changed, where

All of it lives in one new fragment, `src/sheet/205-feat-ui-foundations.js` — new because
nothing existing needed rewriting (contrast Phase 1.6, whose whole diff was inside functions
that already existed). Four other files needed a small, additive touch to wire it in:

| File | What changed |
|---|---|
| `src/sheet/205-feat-ui-foundations.js` | **New.** `ringAffinityStatus()`, `renderRingAffinityAccents()`, `getActiveCarPage()`, `scrollToTop()`, `updateScrollTopVisibility()`, `initScrollToTop()` |
| `src/sheet/110-modals-trackers.js` | One added line in `recalcAll()`: `renderRingAffinityAccents();`, beside the existing `renderAppliedSchoolAffinity()` call it stays in sync with |
| `src/sheet/210-test-seam-and-init.js` | Calls `initScrollToTop()` from `init()`; exports the six new names to `window.__L5R_TEST__` |
| `src/markup/20-fixed-layers.html` | New `#scrollTopBtn`, styled and positioned like the existing floating dice button, opposite corner |
| `src/css/10-sheet-base.css` | `.scroll-top-btn` (+ `[hidden]`), `.ring-card.ring-affinity` / `.ring-card.ring-deficiency`, `.ring-affinity-tag` |
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

## Verification

**1. `qa/ui-foundations-harness.js` (this folder) — 15/15.** `ringAffinityStatus()` against
every case (affinity match, deficiency match, neither, empty profile); the Ring accent driven
through the real `f_school` field and `recalcAll()` with Kuni Shugenja (affinity Earth,
deficiency Air) confirming the right two cards get the right accent and tag, the other three
get neither, and clearing the School removes the tag element entirely rather than just hiding
it; the scroll button's full lifecycle (hidden on open, shown past the threshold, an instant
— not smooth — scroll back to 0 on click, re-hides, hides on switching tabs, and the
`MutationObserver` path exercised by revisiting a previously-scrolled tab).

**2. A full before/after behavioural diff**, using Phase 0's own `qa/behaviour-harness.js`
against two builds — fragments as they were at the end of Phase 1.6, and as they are now —
across all 14 of its flows. Every one of the 215 raw differences the diff reports resolves to
exactly one of three expected causes, and nothing else: the new `#scrollTopBtn` element's own
snapshot appearing in every flow (always `hidden:true`, `value:''` — none of the 14 flows
scroll a panel, so it correctly never shows); the `window.__L5R_TEST__` seam gaining exactly
six keys (`ringAffinityStatus`, `renderRingAffinityAccents`, `getActiveCarPage`, `scrollToTop`,
`updateScrollTopVisibility`, `initScrollToTop` — confirmed by set comparison, zero removals);
and the harness's own recorded file path. **Zero other fields, across every id-keyed element
in all 14 flows, differ at all.**

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
website page sha256 (Phase 0.6 build)     : 8e61f44a8fe51b9915ace7791c247a06841237c4fc89a72f22c9953f5e919088
Android staged page sha256 (Phase 0.7)    : 8e61f44a8fe51b99...   (identical)
```

## What a player sees

- Scroll down any long tab (Skills, Equipment, Techniques) and a small round button appears in
  the bottom-left corner — opposite the floating dice button — that jumps straight back to the
  top of that tab. It disappears again once you're back near the top, and switching tabs always
  starts a tab at its own top.
- On the Rings tab, whichever Ring your applied School makes an **Affinity** gets a gold
  outline and a small "Affinity" tag in its corner; a **Deficiency** Ring gets the same
  treatment in maroon reading "Deficiency". Neither changes what tapping the Ring does, and the
  full explanation of what the bonus/penalty means is still one tap away on the Applied School
  badge, exactly where it already was.

## Rollback

See `ROLLBACK.md`. This phase's diff, like Phase 1.6's, lives inside Phase 0's own fragments —
rollback means restoring the touched fragments from `originals/`, not deleting a folder Phase 0
never depended on. One of those five files (`205-feat-ui-foundations.js`) never existed before
this phase, so "restoring" it means deleting it outright, not copying an earlier version —
`ROLLBACK.md` says so explicitly.
