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
