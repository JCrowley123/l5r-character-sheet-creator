# Part H, Phase 9 — Clan-Themed Look

Recolours the sheet's maroon/gold "brand" accent to match whichever Great Clan is actually
applied to the character, plus two pieces of the real ink-brush Clan mon art from `Art/Clan
Mons/`: a large, faint watermark behind the Clan & School card's fields, and a small "colophon"
centred in the tab bar — visible on every tab, since the tab bar itself never scrolls away.

**Status: built and verified. 17/17 automated checks pass — dropping to 16/17 against a build
with one specific safety-colour protection removed, to 15/17 with the Void-pip recolour reverted,
and to 12/17 with the phase's own kill-switch disabled, in every case failing exactly the checks
that exercise what was removed and nothing else.** Half of Phase 9's original two-bullet scope
(Clan-themed UI skins) is built here; School-specific flavour text, the phase's other bullet, is
a separate, later piece of work. Three of those checks and one small CSS change came from
real-device feedback after this phase shipped — see *The Void pip, after real-device feedback*
below.

## Three rounds of mockup, confirmed before a line of production code was written

This is the one phase this session that went through a full design-review cycle before being
built at all — three published mockup iterations, each incorporating direct feedback:

1. **Round 1** compared a "subtle accent" (a small coloured chip + card edge) against a
   "broader re-skin" (buttons, tabs, and headings all re-themed). The user picked the broader
   re-skin, liked the colour change and the idea of the Clan mon shown as a background seal,
   and asked to drop a corner badge and a small heading icon that round had also tried.
2. **Round 2**, on request, explored four further directions for where the mon itself should
   live: a full-sheet seal, a header wax-seal, a lacquer-style frame with a bottom colophon,
   and an ink-wash card corner bleed. None of the four replaced the confirmed base — they were
   options for one more piece of it.
3. **Round 3**: the user picked the confirmed base's colour treatment plus Idea 3's colophon
   specifically ("stay with the baseline but add a small mon colophon centred at the bottom"),
   explicitly not its frame border. That combination is exactly what got built.

All three rounds live in one HTML mockup artifact, not in this repository — see the
conversation history for the actual mockups. This README picks up from "build this."

## Why this needed almost no new CSS for the recolour itself

Before writing any production code, `grep -rc "var(--shu-dark)" src/css/` (and the same for
`--shu`, `--shu-mid`, `--shu-soft`, `--shu-shadow`, and the `--gold*` family) confirmed something
worth checking rather than assuming: every reference to the sheet's "brand" maroon anywhere in
any CSS file goes through `var(...)` — zero hardcoded duplicates of the literal hex values
outside the five custom properties' own `:root` definition. Every button, every active-tab
highlight, and every one of the ten tabs' own section headings already reads its colour from
those five tokens. Overriding them on the document root — inline, via
`document.documentElement.style.setProperty(...)` — wins over the stylesheet's own `:root`
declaration and re-themes all of that in one pass, sheet-wide, with no new CSS rule needed for
the recolour itself. `removeProperty(...)` falls straight back to the stylesheet's own default.
That fallback **is** this phase's reversibility mechanism — see "Reversibility" below.

This is a materially different, and better, realisation of "the whole sheet reads as your
Clan's" than the mockup's own single-tab demo ever tested: the mockup could only ever show one
fake card, so its own "Section heading... picks up the Clan colour" bullet was true of one
invented card. The real implementation applies to the heading, active tab, and every other
`--shu`-driven element on **all ten tabs**, not just Clan & School's.

## Two colours deliberately left out of the override

`button.danger` (Delete, the confirm-OK button) and `.wound-seg.sev-danger.current` (the wound
bar's most-severe segment) also read from `--shu`/`--shu-dark` today — found by the same grep
pass, not guessed at. Those two colours carry real meaning ("this is destructive," "you are
badly hurt"), not brand decoration. Letting a Clan's colour silently soften or repaint a danger
signal would be a real usability regression a design-only feature has no business introducing,
so both are pinned back to the sheet's actual maroon explicitly, in a CSS block that sits after
both rules' own original definitions (same specificity, later source order, no `!important`
needed). Check 5 in this phase's own harness is the one that proves this protection is doing
something: run against a scratch build with just that one CSS rule deleted, it — and only it —
fails. See "Verification" below.

## The Void pip, after real-device feedback

Seeing the themed sheet on a phone turned up something the mockups hadn't: **the Void Points pip
tracker was following the Clan colour** — turning Crane blue, Dragon green, Scorpion plum — while
the Void artwork sitting inches away on the Spell Slots tab stayed its usual grey. Reported as
*"Void pip should stay grey."*

The tracker was reading `--shu`, the brand accent — which is exactly the token this phase
overrides, so it re-themed along with everything else. That was working as designed; the design
was wrong. Every *other* Void-coloured thing in the sheet — the Void spell slot pip
(`.spell-pip-void`), the Void bonus pip, the Void spell icon — reads `--void-slot-color`, a fixed
neutral grey no Clan palette touches. The Void Points tracker was the one member of that family
wired to the brand accent instead.

**Fixed in the trunk's own `.void-pip` rule, not in this phase's pinned-colour block above** —
and the distinction is deliberate. The two pinned colours are *protections against* Clan theming:
they mean "destructive" and "badly hurt" and would still be maroon if this phase were deleted
tomorrow. Void being grey is not a protection, it is a fact about Void — true with no Clan
applied at all, where the pips were previously the sheet's plain maroon and equally out of step
with the rest of the Void family. So `.void-pip` now reads `--void-slot-color`, with rules
otherwise identical to `.spell-pip`'s, and the two pip families are visually interchangeable.

**This means removing this phase does not put the Void pip back to maroon** — the recolour
outlives it. That is declared in this phase's `ROLLBACK.md` rather than left to be discovered.

The harness gained three checks for it: the pip is grey with *no* Clan applied (the fact about
Void), it is still grey under Scorpion (the behaviour the feedback asked for), and a sanity check
that Scorpion's own `--shu` is nowhere near that grey, so the comparison could actually have
caught a difference.

## What changed, where

Almost everything lives in one new fragment, `src/sheet/207-feat-clan-theming.js` — new because
nothing existing needed rewriting for the theming logic itself. Four other files needed a small,
additive touch to wire it in:

| File | What changed |
|---|---|
| `src/sheet/207-feat-clan-theming.js` | **New.** `CLAN_THEME_ENABLED` (the kill-switch), `CLAN_THEME_PALETTE` (7 Great Clans × 5 shades each), `CLAN_MON_DATA` (the same 7 clans' base64 mon art), `getAppliedClanKey()`, `applyClanTheme()` |
| `src/sheet/110-modals-trackers.js` | `recalcAll()` gained one line calling `applyClanTheme()`, right after `renderWounds()` — recalcAll() is the only path that ever changes `#f_clan` (Apply Family, in `080-identity-build-ui.js`, always calls it immediately after) and the only path a saved character's Clan is restored on load, so unlike Phase 2's Quick Access panel this needed no narrower hook of its own |
| `src/sheet/210-test-seam-and-init.js` | Calls `applyClanTheme()` once in `init()`, for the very first paint; exports `applyClanTheme`, `getAppliedClanKey`, `CLAN_THEME_PALETTE` to `window.__L5R_TEST__` |
| `src/markup/10-swipe-tab-shell.html` | The Clan & School `.section` gains `id="cfsSection"` and a `<span class="clan-mon-watermark">`; `#carTabbar` gains a `<span class="clan-mon-colophon">`, placed before `#carTabbarInner` in source order so it paints behind the tabs, not over them |
| `src/css/10-sheet-base.css` | New Phase 9 block (see below for exactly where it sits and why): the two danger-colour protection pins, `#cfsSection{position:relative;overflow:hidden;}`, `.clan-mon-watermark`/`.clan-mon-colophon` (shared mask-image plumbing via `--clan-mon-url`, individually sized/positioned/opacity'd), a mobile breakpoint for the watermark |
| `build/manifest.json` | New fragment entry (no `lines` provenance — it wasn't carved from the original monolith); `expect_sha256` updated three times across the build → colophon-visibility fix (see below) |

**Where the new CSS block sits, and why it has to.** It's appended right before the file's own
`/* Print / PDF export */` section — the last point in the "screen" CSS, deliberately after
*both* `button.danger` (near the top of the file) and `.wound-seg.sev-danger.current` (much
further down) in source order, so the protection pins win their cascade tie against each without
needing `!important`. Putting them anywhere in between would have protected one and not the
other.

## `#f_clan`, not `#cfs_clan`

`getAppliedClanKey()` reads `#f_clan` — the character's actual applied Clan, the same field
`collectData()`/`applyData()` persist — not `#cfs_clan`, the Clan & School tab's own staging
dropdown, which only reflects what's about to be applied. This matches how the rest of the sheet
already decides "what is this character": `characterCasterLock()` reads `#f_school`, not
whatever `#cfs_school` currently shows, for exactly the same reason.

## Scope: seven Clans, not nine

`CLAN_THEME_PALETTE` covers the seven Great Clans that have mon art in the repo — Crab, Crane,
Dragon, Lion, Phoenix, Scorpion, Unicorn. A character with no Clan applied yet, a Minor Clan,
Spider, or Imperial gets no theming at all; the sheet keeps its default maroon/gold exactly as
today. Spider and Imperial have no mon art in `Art/Clan Mons/` yet. Minor Clans raise a real,
separate design question — which Great Clan's colours a given Minor Clan should inherit, if any
— deliberately left alone here rather than guessed at. Check 6 in this phase's harness confirms
the fallback specifically (Spider, set directly since there's no Family data to drive a full
Apply-flow for it).

## The real per-Clan palette

Each Clan gets a five-shade ramp — `shu`, `shuDark`, `shuMid`, `shuSoft`, `shuShadow` — matching
the *structure* of the sheet's own ramp: same hue held constant across all five shades, the same
lightness steps (shadow < dark < mid < base < soft), the same ~58% saturation dropping to ~48%
for the softest shade. Hues were picked from traditional Clan colour associations (Crab
brown/bronze, Crane sky blue, Dragon jade, Lion amber-gold, Phoenix flame orange, Scorpion a
desaturated near-black plum rather than "the same red as everyone else," Unicorn plum-violet)
and spread far enough apart in hue (Crab 28°, Lion 46°, Phoenix 12° — the three closest
neighbours — are still 14-18° apart) to read as genuinely different Clans side by side, not
shades of the same thing. Every `shuDark` shade — the one carrying section headings and most
body-text-sized accents — was contrast-checked against the sheet's own `--paper` background;
Dragon and Lion needed an extra few points of darkening beyond the others to clear 4.5:1, the
rest cleared it unmodified. The exact derivation script and both contrast tables are recorded in
this phase's own commit; the final values are the arrays in `207-feat-clan-theming.js` itself.

## The colophon needed a much higher opacity than the mockup's own

The mockup's colophon sat alone on a plain `--card` background at 55% opacity and read fine.
The first real build used a much lower opacity (16%), reasoning that "small and subtle" should
mean fainter here too — and at that opacity, on the tab bar's own backdrop-blur background, with
a 24px ink-brush silhouette that already leaves plenty of its own bounding box transparent, it
was **not visible at all** in a real screenshot, forced-opacity comparison confirmed the element
itself was positioned and rendering correctly; only the opacity was the problem. Fixed by
matching the mockup's own already-validated values (55% opacity, 28px) rather than re-deriving a
number from first principles a second time. Screenshotted at both settings before and after —
see this phase's own build history for both.

## Reversibility — two levels, both cheap

This was built to an explicit ask: stay easy to back out of even after later phases have landed
on top of it.

1. **`CLAN_THEME_ENABLED` in `207-feat-clan-theming.js` is a single flag.** Set it to `false`
   and rebuild: every call into this phase's own functions becomes a no-op that actively clears
   any theming already applied — the sheet is back to its default maroon/gold instantly, and
   nothing else in the codebase needs to change. The fragment and its data stay in place, ready
   to flip back on later. Verified directly: a scratch build with the flag flipped drops from
   17/17 to 12/17 on this phase's own harness, failing exactly the five checks that depend on
   theming actually being active.
2. **A full removal follows the same `originals/` + `ROLLBACK.md` model as every other feature
   phase in this project** — see `ROLLBACK.md` for the exact restore procedure if the flag isn't
   enough and the feature should be gone from the codebase entirely.

## Verification

**1. `qa/clan-theming-harness.js` (this folder) — 17/17.** Checks, in order: default state (no
Clan applied — default maroon, both mon elements hidden, and the Void pip already its own grey);
Crab applied via a **real** Apply
Family click (not a seam call) — `--shu-dark` matches `CLAN_THEME_PALETTE.Crab.shuDark`, both mon
elements visible, the active tab's own text colour and a section heading's own colour both match
(read via `getComputedStyle`, checked against the palette this phase itself exports on the test
seam — an independent oracle, not a value this file invents); switching to Crane confirms
re-applying over an existing theme updates cleanly, not just "any theme sticks once"; resetting
to baseline confirms the fallback is real reversion, not merely "nothing is currently reading
it"; Scorpion applied and the Delete button checked against the sheet's real, hardcoded maroon
(with a sanity check that Scorpion's own colour is nowhere near that maroon, so the check could
actually have caught a difference); Spider (no mon art) falls back to default exactly like no
Clan at all. The Void pip is checked twice — grey with no Clan, and still grey under Scorpion —
because the two assertions say different things (see *The Void pip, after real-device feedback*).

Run against three scratch builds, each with exactly one thing removed:
- **The danger-colour protection block deleted**: 16/17 — only the Delete-button check fails.
- **`.void-pip` reverted to `var(--shu)`**: 15/17 — only the two Void-pip checks fail, and they
  report the real regression rather than a bare mismatch: `#a3332a` (the brand maroon) with no
  Clan, `#713d50` (Scorpion's own plum) under Scorpion. That second value *is* the reported bug,
  reproduced.
- **`CLAN_THEME_ENABLED` flipped to `false`**: 12/17 — only the five checks that depend on
  theming actually applying fail; every structural check (default state, reset, danger
  protection, Spider fallback) still correctly passes, since those describe "no theming" states
  that remain true when the feature is off. **Both Void-pip checks pass here too**, which is the
  point: the grey does not depend on this phase existing.

One real timing bug surfaced and got fixed while writing this harness, not glossed over:
`.car-tab.is-active` transitions its own `color` over `--car-fast` (160ms,
`20-carousel.css`) — the first version of the active-tab-colour check read `getComputedStyle`
after only 120ms and occasionally caught a still-interpolating value (`#7d4b21` instead of the
settled `#7d4c21` — a one-unit rounding difference in a single colour channel, the fingerprint
of reading mid-transition). Fixed by waiting 350ms after any Apply-Family click before reading a
transitioned CSS property, comfortably clear of the 160ms transition itself. Re-run three times
in a row afterward with zero flakes.

**2. A full before/after behavioural diff**, using Phase 0's own `qa/behaviour-harness.js`
against the build from immediately before this phase and the final build, across all 10 flows.
Three container-level snapshots (`carShell`, `carTrack`, `carViewport`) show as "changed" —
worth explaining rather than waving away, since every earlier phase's own diffs showed clean
new-elements-only additions instead. Those three containers are the only ones in this diff whose
**hash** changed, not their visible text: the new `#cfsSection`, `#clanMonWatermark`, and
`#clanMonColophon` markup sits *inside* the carousel's own DOM tree (unlike every previous
phase's fixed-position additions, which live in `20-fixed-layers.html`, explicitly hoisted
*outside* the carousel specifically so nothing inside it can clip them) — so the whitespace
between the new lines of markup this phase added becomes part of those three containers'
`.textContent`, and `.textContent` (correctly) includes whitespace text nodes. Confirmed
directly: `clanMonWatermark` and `clanMonColophon` both report `text: ''` (genuinely no visible
text of their own) and `hidden: true` at boot in the "after" snapshot, and the length delta on
`carShell`'s own text (36843 → 36905, +62 characters) matches the two multi-line comment blocks
and indented `<span>` tags this phase's own markup edits added, not any unintended content
change. **Zero elements' actual values changed anywhere, in any flow** — only whitespace from
this phase's own new markup, and the two brand-new elements themselves.

**3. The full existing regression suite, re-run against the final build** — Phase 1's
`ui-foundations-harness.js` (9/9), Phase 1.6's `wound-bar-harness.js` (23/23), the Spell Slots
bugfix's own harness (6/6), Phase 1.5's `roll-pipeline-baseline.js` (34/34), and Phase 2's
`quick-access-sidebar-harness.js` (19/19) — plus `qa/inventory.py` (254 element ids, up from 251;
zero duplicates; no tag imbalance; section/modal counts unchanged at 10/23) and Phase 0.7's
`build_android.py --check`, confirming the Android app's staged assets are byte-identical to the
freshly built site.

Run it yourself:

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
python3 build/recombine.py --verify
cd "../../../Part H — Sheet UI-UX/PART H — Phase 9 Clan-Themed Look"
NODE_PATH=$(npm root -g) node qa/clan-theming-harness.js "../../Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html"
```

## A note on file size

The seven Clans' mon art, embedded as base64 PNG data URIs (the "ink only" zip variant — see
below), adds roughly 730KB to the single-file build: the site went from ~1.49MB to ~2.21MB.
Accepted as a deliberate, known tradeoff for real, already-licensed-to-the-user art assets
shipping in a single-file app that has always inlined everything it needs — not something to
"fix" later without being asked.

## Both shells stay in sync

Same chain as every phase since Phase 0.7: `python3 build.py` (website) and Phase 0.7's
`build/build_android.py` (Android's staged web assets) both start from Phase 0's fragments, and
their own checks confirm both land on the identical byte-for-byte page:

```
website page sha256 (Phase 0.6 build)     : 998ffdbaf1f88e24816661d4c0a4eddc549dab6d9113e887d47ab3b6e934a357
Android staged page sha256 (Phase 0.7)    : 998ffdbaf1f88e24...   (identical)
```

## What a player sees

Apply a Clan (via Apply Family, on the Clan & School tab) and the sheet's own maroon accents —
every button that used to be that colour, the active tab's highlight, every section heading on
every tab — shift to that Clan's own colour instead. A faint silhouette of the Clan's mon appears
behind the Clan & School card's own fields, and a smaller one sits centred in the tab bar,
visible no matter which tab is open. Switch or clear the applied Clan and both the colours and
the mon art follow immediately. The Delete button, and the wound bar's most severe segment, never
change colour — those stay the sheet's own maroon regardless of Clan, on purpose.

## Rollback

See `ROLLBACK.md`. This phase's diff lives inside Phase 0's own fragments, like every other
feature phase this session — rollback means restoring the touched fragments from `originals/`,
not deleting a folder Phase 0 never depended on. One of those files
(`207-feat-clan-theming.js`) never existed before this phase, so "restoring" it means deleting it
outright, not copying an earlier version — `ROLLBACK.md` says so explicitly. For a faster,
code-free way to turn the feature off without a rollback session at all, see "Reversibility"
above — flipping `CLAN_THEME_ENABLED` to `false` and rebuilding is a one-line, one-file change.
