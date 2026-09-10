# Pending feedback — real-device UX notes

Real-device feedback from the project owner. All three items were seen live on an iPhone 16e,
after Part H Phase 9 (Clan-themed look) was promoted to `main`.

**Status: 1 of 3 actioned.** Item 1 (the Void pip) is **done** — see below for what was actually
decided and why it differs from the option this note originally sketched. Items 2 and 3 remain
**parked at the project owner's explicit instruction**, not forgotten and not blocked: when item
1 was picked up the instruction was *"we will keep the other 2 UX items parked."* Treat each as
its own small decision — they don't have to be resolved together, and the fix for one may turn
out to affect a judgement call in the other.

## 1. The Void pip should stay a fixed grey, not follow the Clan theme — ✅ DONE

Seen on: Rings & Traits tab, Dragon clan applied.

`.void-pip` (in `10-sheet-base.css` — this note originally said `110-modals-trackers.js`'s CSS,
which was wrong; the pips are *built* there, styled here) read `var(--shu)` for its border and
filled background, and so was swept up in Phase 9's global `--shu*` override like every other use
of those tokens sheet-wide. The project owner's read: Void already has its own fixed, neutral
identity colour elsewhere in the sheet — the `--void-slot-color:#5a5450` token used for the Void
element in Spell Slots, and the Void ring's own (unthemed, grey) background art on the Rings &
Traits tab itself — so having the Void pip alone switch to the applied Clan's colour reads as
inconsistent with how Void is depicted everywhere else, not as a deliberate design choice.

**Resolved:** `.void-pip` now reads `var(--void-slot-color)` — the same token, not merely a
similar grey — with its hover and filled rules made identical to `.spell-pip`'s, so the Void
Points pips and the Void spell-slot pips are visually interchangeable.

**This is deliberately *not* the fix this note sketched.** The original suggestion was to pin the
pip as an exception inside Phase 9's own protected-colour block, alongside `button.danger` and
`.wound-seg.sev-danger.current`. Those two are protections *against* Clan theming — they mean
"destructive" and "badly hurt". Void being grey isn't a protection, it's a fact about Void: with
no Clan applied at all the pips were the sheet's plain maroon, equally out of step with the rest
of the Void family. So the change went into the trunk's own rule instead, where it holds
regardless of Clan, and regardless of whether Phase 9 exists. Consequence, declared in Phase 9's
`ROLLBACK.md`: removing Phase 9 does **not** put the pip back to maroon.

Covered by three checks in Phase 9's harness (17/17, dropping to 15/17 with the recolour
reverted — reporting `#a3332a` unthemed and Scorpion's `#713d50` themed, the reported bug
reproduced). Full write-up in that phase's README, *The Void pip, after real-device feedback*.

## 2. The tab-bar colophon looks odd and collides with the active tab — ⏸ PARKED

Seen on: Clan & School tab and Identity tab, both Dragon clan applied.

The project owner's words: "The colophon at the bottom looks odd sat behind the bar maybe it
should sit lower. This looks odd and even sort of breaks when you go to the identity tab."

The colophon (`.clan-mon-colophon`, `#clanMonColophon`) sits centred inside `#carTabbar`, behind
the tab list, at 28px / 55% opacity — see Phase 9's own README for how those values were
arrived at (an earlier 24px/16% version was invisible; these are the corrected values). The
"breaks on Identity" remark hasn't been root-caused yet — worth checking whether the active
tab's own pill/underline overlaps the colophon differently depending on which tab is active
(the tab list is horizontally scrollable/centred per active tab, so the colophon's fixed
centre position may end up under a different part of the bar, or under the active tab's own
background, depending on scroll state).

Open question for later: reposition (the project owner suggested sitting lower), resize, or
change how it layers with the active tab indicator. Not yet investigated which specifically is
wrong — position, z-order, or something tab-state-dependent.

## 3. Floating buttons feel cluttered together, especially on a narrow phone — ⏸ PARKED

Seen on: Identity tab, Dragon clan applied — screenshot showed the Quick Access toggle button
sitting over the Glory Rank field.

The project owner's words (lightly reformatted, not edited for content):

> Having so many floating buttons is beginning to make the screen feel cluttered especially
> when they overlap and stop you reading some elements like in this screenshot. The quick tab
> is over the glory rank field. The scroll to top button is over the clan and school tab. To be
> clear these buttons work as intended. I am now wondering if they are making the screen feel
> cluttered. I know and understand that this is a problem due to me viewing this on my iPhone
> 16e and there being limited space. So I am wondering if in my desire to try and consolidate
> and try to enhance some aspects of UI/UX what I have really done is make it cluttered.

Three `position:fixed` controls now share the viewport: `.floating-dice-btn` (bottom-right,
Phase 0/early — primary manual-roll action), `.scroll-top-btn` (bottom-left, Phase 1),
`.quick-access-toggle-btn` (top-left, Phase 2). All three are solid `--shu-dark` circles (the
dice button styled distinctly as the primary action) and all three are now also recoloured by
whichever Clan is applied, since Phase 9's override is global. Individually each does what it
was built to do; the concern raised is about their cumulative footprint on a small screen, not
any one button's own behaviour.

Explicitly flagged as an open, unresolved reflection, not a bug report — the project owner's own
framing is "is this genuinely cluttered, or is it a narrow-viewport-only problem." Options for a
later session likely span a spectrum from "leave as-is" through "reduce the number of buttons,"
"make position responsive to viewport width," to "consolidate some into one control" — none of
these have been discussed or decided.

## Where this leaves things for whoever picks this up

None of Phase 1, Phase 2, or Phase 9 needs to be fully removed to address any of this — item 2 is
a small, scoped edit inside Phase 9's own fragment/CSS, and item 3 is a design conversation about
existing controls, not necessarily a removal. (Item 1 turned out to be a one-rule edit in the
trunk, smaller still.) But if a decision here turns
into "actually, just take Quick Access out" or "revert the Clan buttons to the sheet's default
colour," `Versions/CLAUDE.md`'s "Independently-removable feature phases that share edit points"
section, and each phase's own `ROLLBACK.md`, document a verified surgical-removal procedure for
Phase 1, Phase 2, and Phase 9 independently of one another — removing one won't disturb the
others or require redoing this feedback triage for whichever ones are kept.
