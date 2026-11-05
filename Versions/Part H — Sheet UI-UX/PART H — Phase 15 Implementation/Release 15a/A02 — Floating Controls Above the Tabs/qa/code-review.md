# A02 code review (one read-only reviewer, 4 November 2026, before full QA)

Scope given: the approved A02 scope (audit A02, ruling Q2), the diff, the project's removability rules and A01 as the template. The reviewer read code, diffs and scripts and ran small text checks only: no browser, harness, remover or build, because the affected-set run was using the machine.

**Verdict: no defects that block A02.** Confirmed by hand: the fragments in manifest order rebuild `7537b309…` (the build then under review) byte for byte; the only marker in either owned fragment is `PART H PHASE 15.1.2`; every `fc15` token sits inside A02's fragments or seam block; A02's rules (specificity 1,2,2) outrank every older placement of the three buttons (base 0,1,0, the ≤600 px rules, the carousel 0,2,1, the app bar 0,3,2) while `[hidden]` and print's `!important` still win; no script sets inline positions on them; the app-bar-at-bottom arithmetic matches the real stacking; the panel's cap leaves 15–16 px under the header; a failed carousel (no `car-active`) falls back to the old placements; installing at fragment time is safe (the shell markup is parsed earlier, nothing walks the shell's children); the Characters screen, wizard, Library and splash all sit above z-index 500; totals 23 + 6,805 = 6,828 and 31 + 6,701 = 6,732 agree everywhere; `BEFORE`, `LAST_KEPT`, `LAYERS` are right; the two corrected pins match the discovery log.

Findings and what was done:

1. **Minor, `TABS-REACHABLE` centres each tab before hit-testing,** so it cannot see a control at either end of the tab bar (where the old return-to-top sat). **Recorded, not changed:** that case is asserted by every sweep state's `onTabs` test (no control may overlap the tab bar), which the baseline fails. Changing the check now would re-pin the baseline for no new coverage.
2. **Minor, `DESKTOP-CLEAR` could pass without testing return-to-top** when it was not showing. **Fixed:** the check now goes to Adv & Disadv (long at every width), scrolls 600 px and requires return-to-top to be showing, on the band and off the tabs. The first run of the fix showed the reviewer was right: on the desktop, Skills is too short to scroll 600 px, so the old clause had passed on nothing. No pin changed (every variant that fails it already did).
3. **Minor, the app-bar-at-bottom path and the panel's height cap are untested** (`APP_BAR_POSITION` is a constant `'top'`; the dense panel is shorter than its cap). **Recorded in the README as unverified.**
4. **Note, touch targets:** Quick Access and return-to-top were 40 px, under the carousel's own 44 px `--car-tap`. **Fixed:** both are 44 px (the dice stays 48 px), centred in the 52 px band.
5. **Note, safe area:** the page's viewport meta has no `viewport-fit=cover`, so `env(safe-area-inset-*)` is 0 and iOS keeps the home-indicator area itself. **README corrected;** device check 9 is the real test.
6. **Note, remover `SURFACE_RE` (`fc15[\w-]*`):** a future retained colour like `#fc15ab` would make the remover refuse (it fails closed; no hits today). The tag FC15 resembles `BUGFIX FC8`; harmless. **Recorded.**
7. **Note, unfinished docs at review time** (HANDOVER, `reproduce/candidate/`, the checklist's candidate hash, `reproduce.cjs`'s header). **Done** before records were committed.
8. **Note, `QA-PANEL-BESIDE-BUTTON` uses the CSS's 8 px gap,** so it pins the spec rather than an independent oracle. **Accepted** as a spec pin.

The candidate was rebuilt after fixes 2 and 4: application `1cc41d8c…5d2c`, frozen in `qualified-sha256.txt` before the qualification chain.

# Revision 2 review (one read-only reviewer, 5 November 2026, before full QA)

Scope: commit `3254c2a3` (the corner placements, no band), against the owner's ruling of 5 November, the removability rules and revision 1's review. Read only; no files changed.

**Verdict: one defect, in the harness, not in the app.** No placement-maths defect in the CSS. Confirmed by hand: specificity (the ID rules at 1,2,2 beat the app bar's 0,3,2, the carousel's dice rule and the 600 px rules; the short-screen override wins by coming later); every gap is 8 px and the end room is 116 = 8 + 48 + 8 + 44 + 8 (64 on a short screen); the panel's bottom is 8 px above its button's top and its cap leaves 24 px under the header; print keeps the carousel's own padding because the room is `@media screen`; nothing covers content at the end of any page, clone pages included; A02's surface is its two fragments and the guarded seam block, and the remover's surface rule covers `fc15-*`; `shown()` with `checkVisibility()` drops only what the browser does not draw.

Findings and what was done:

1. **Defect: the harness never tested part-way down a page.** `scroll('middle')` assigned the string, which the browser reads as 0, so both sweeps tested the top twice. **Revision 1's harness had the same slip.** **Fixed:** `'middle'` now scrolls `Math.min(400, (scrollHeight − clientHeight) / 2)`, as `reproduce.cjs` already did. The check count stays 23; variant discovery was run afterwards and every pin held.
2. **Note: `TABS-REACHABLE` samples each tab's centre**, so the baseline passes it; the sweep's `onTabs` test is what guards the tab bar. **Recorded,** as in revision 1.
3. **Note: `PRINT-HIDDEN`'s padding test compared with the layer's own value.** **Fixed** with an independent reference: the same page printed with `fc15-on` removed (A01 prints 22 px, not the `0px` the note suggested, so the first attempt at the fix was corrected before running).
4. **Note: the app bar at the bottom is never exercised.** The maths was checked by hand and looks right. **Recorded** (README, *Not verified automatically*).
5. **Note: on a 320 px phone the open Quick Access panel ran under return-to-top** (z-index 499 against 500). **Fixed:** the panel is drawn at 501. A 320 × 568 session was added to `SMALL-PHONE-CLEAR`, and a new variant `panel-below-controls` was pinned before it ran.
6. **Note: the panel is short on a phone on its side with the app bar on top** (roughly 45–100 px). **Recorded;** it works.
7. **Note: the 112 px corner zone would allow the dice's old spot;** `dice-unplaced` is caught through the gap to return-to-top. **Recorded.**
8. **Note: the end-room checks compare with the layer's constants;** the independent oracle is `under()`. **Accepted** as spec pins.
9. **Note: the comparison probe had no landscape device.** **Fixed:** an 844 × 390 device was added to `reproduce.cjs` and `compare.cjs`.
10. **Note: nine checks cannot be failed by any variant** (QA-CLOSES, DICE-OPENS, OVERLAYS-ABOVE, SEARCH-IN-APP-BAR among them). **Accepted** as regression guards.
11. **Note: `panel-unplaced` passes `QA-OPENS-UPWARD` only because the fixture's panel is short.** **Recorded.**

The fixes landed in `91885213`. The candidate was rebuilt and frozen at `91d45109…6dc0` in `qualified-sha256.txt` before the qualification chain.
