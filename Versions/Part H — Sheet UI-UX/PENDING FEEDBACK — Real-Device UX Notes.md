# Pending feedback — real-device UX notes

Real-device feedback from the project owner, captured **as notes for a later session, not
actioned yet**. Nothing in this file has been implemented. When picked back up, treat each item
as its own small decision — they don't have to be resolved together, and the fix for one may
turn out to affect a judgement call in another (the Clan Theme override touches all three).

All three items were seen live on an iPhone 16e, after Part H Phase 9 (Clan-themed look) was
promoted to `main`.

## 1. The Void pip should stay a fixed grey, not follow the Clan theme

Seen on: Rings & Traits tab, Dragon clan applied.

`.void-pip.filled{background:var(--shu);}` (in `110-modals-trackers.js`'s CSS) is swept up in
Phase 9's global `--shu`/`--shu-dark`/etc. override like every other use of those tokens
sheet-wide. The project owner's read: Void already has its own fixed, neutral identity colour
elsewhere in the sheet — the `--void-slot-color:#5a5450` token used for the Void element in
Spell Slots, and the Void ring's own (unthemed, grey) background art on the Rings & Traits tab
itself — so having the Void pip alone switch to the applied Clan's colour reads as inconsistent
with how Void is depicted everywhere else, not as a deliberate design choice.

Open question for later: pin `.void-pip.filled` to a fixed grey (matching `--void-slot-color` or
close to it) as an explicit exception to the Clan override, the same way Phase 9 already pins
`button.danger` and `.wound-seg.sev-danger.current` for their own reasons (see that phase's
README). Not yet decided whether that's the right fix or whether Void should theme like
everything else and this is just how it reads on Dragon's specific hue.

## 2. The tab-bar colophon looks odd and collides with the active tab

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

## 3. Floating buttons feel cluttered together, especially on a narrow phone

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

None of Phase 1, Phase 2, or Phase 9 needs to be fully removed to address any of this — items 1
and 2 are small, scoped edits inside Phase 9's own fragment/CSS, and item 3 is a design
conversation about existing controls, not necessarily a removal. But if a decision here turns
into "actually, just take Quick Access out" or "revert the Clan buttons to the sheet's default
colour," `Versions/CLAUDE.md`'s "Independently-removable feature phases that share edit points"
section, and each phase's own `ROLLBACK.md`, document a verified surgical-removal procedure for
Phase 1, Phase 2, and Phase 9 independently of one another — removing one won't disturb the
others or require redoing this feedback triage for whichever ones are kept.
