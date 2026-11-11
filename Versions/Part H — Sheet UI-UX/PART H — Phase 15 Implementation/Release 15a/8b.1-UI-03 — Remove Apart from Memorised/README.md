# Release 15a · 8b.1-UI-03 — Remove Apart from Memorised

Group G3, unit 3 of 3. A follow-up to the owner's 3 November device feedback on Release 8b.1. The owner approved option C of the mock-up on 11 November 2026 ([G3 mock-ups](<../G3 — Spell Rows/MOCKUP.md>)). Built on 11 November 2026 (Claude), on branch `claude/release-15a-ui03`, stacked on 8b.1-UI-02.

**Built and light-checked. Not code-reviewed, not device-accepted, not qualified, not live.**

## What changes

Only spell rows in Techniques, Kata & Spells, in Manage.

- **Remove keeps its corner.** The cross stays in the card's top-right corner, where every other card has it, with a 44 × 44 px target.
- **The corner is kept clear.** On a laptop the row's line stops 42 px short of the card's edge. On a phone the name takes the first line and stops 42 px short, and the rest of the row sits below. Nothing is under the cross: not Memorised, the name, the School tag or label, Cast, the casting help or the description.
- **Play.** Remove is not drawn there, as before, and the corner is given back to the name.

Before, the cross covered the right end of Memorised: 34 × 33 px on a phone, about 21 × 25 px on a laptop.

With 8b.1-UI-02 present, a laptop card keeps its height and a phone card is no taller than with 8b.1-UI-02 alone (both checked against the same rows with this unit's class off). The name has at least 250 px for text in Manage on a phone, and the longest name in the catalogue shows in full.

**On its own, without 8b.1-UI-02,** this unit still clears the corner on a phone by giving the name the first line; the School label and the controls share the second.

## How it is built

- `src/sheet/209.999999999999999991-feat-spell-remove-corner.js` — `SX15` and the switch `SPELL_REMOVE_CORNER_ENABLED`. It only sets the `sx15-on` body class.
- `src/css/1141-spell-remove-corner.css` — everything else. Screen only.
- One guarded seam block, `spell-remove-corner-seam`.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With UI-03 (this branch; the whole group), revision 1 | `15268822a339d55ecbf421bca7a0f76063254a34702be5820759bf6038e30ff8` | 17,630,476 |
| UI-03 removed (8b.1-UI-02) | `4f121ab46b9654219b589dfdde71cf8989f00ff1a92ea5f152151e53539569ca` | 17,626,337 |
| All of G3 removed (live G2) | `7793602382c68895b25dc572b71bd05af33667a9c1b1d1bd76032efd744182f0` | 17,609,230 |

## Light checks (11 November)

**What the checks found, in order. Nothing was re-run to get a pass; each failure was a defect and was fixed.**

1. **First run of the own harness: 21/24.** On a laptop the 44 px target reached 1 px into the description box (`SX-CORNER-CLEAR-DESKTOP`, and the two desktop checks that also require a clear corner). Fix: the target sits higher on wide screens. Second run: 24/24. That build was `e8537191…3a28`, then `05c79782…e9d9` with the fix.
2. **The cross-check with 8b.1-UI-02 removed: 21/24.** On a phone, with the harness's fallback fonts, the name box is 3 px shorter and the target touched Memorised by 1 px on School rows. Fix: the target starts 2 px higher everywhere, so it ends above the second line with either font. That gave the final build above.
3. **8b.1-UI-02's own harness with this unit present: 27/28.** `SN-CLASS-OFF-PHONE` assumed only that unit lets the line wrap. On a phone this unit does too. Its expected value is now conditional on this unit's seam key (same id and count; declared in both ROLLBACK files). It passes 28/28 with this unit present and with it removed.

| Check, on the final build | Result |
|---|---|
| Own harness `qa/spell-remove-harness.js` (24 checks pinned before the first run) | 24/24 |
| Own harness on the 8b.1-UI-02 build (the unit absent; measured before fix 2) | 14/24 |
| Own harness with 8b.1-UI-02 removed (UI-01 and UI-03 kept) | 24/24 |
| Own harness with 8b.1-UI-01 removed (UI-02 and UI-03 kept) | 24/24 |
| `qa/test-removal.py` (also UI-02's and UI-01's, with later units present) | 10/10 each |
| Each G3 unit removed alone with the other two kept: rebuild verifies | 3/3 |
| All of G3 removed through the registry | live G2 exactly |
| `feature-dependencies.py` | every reference inside this unit's own blocks |
| 8b.1-UI-01, 8b.1-UI-02 | 32/32, 28/28 |
| 8b.1-UI-01 with UI-02 removed; 8b.1-UI-02 with UI-01 removed | 32/32; 28/28 |
| Older School Choices: older review, legacy grants, allocation boundaries, tap walk | 20/20, 4/4, 5/5, 6/6 |
| Phase 11.2.5 (Part K): School choices, review regression | 30/30, 6/6 |
| Phase 12.6 (Part K): Play mode, Techniques | 16/16 |
| Phase 8 (Part J): casting help | 36/36 |
| A11 | 22/22 |

4. **The group's code review** (read-only, 11 November) found nothing serious. One point was taken in this unit: its two width ranges met at 768 and 769 px and left a gap between them, where the larger target applied but nothing kept its corner clear (a width such as 768.5 px under zoom). The wide range now starts just above 768 px. The build before that was `f79b079d…7d8c` (17,629,787 bytes); its preview passed 223/223. Every row of the table below was run again on the revised build.

**Declared:** this unit's harness names `.sn15-tag` and `.sc8-source` among the things that must not sit under the cross. It reads them only if they are drawn; with 8b.1-UI-02 removed the first is simply absent.

**Not yet done for the group:** the owner's device checklist and round (iPhone Safari, Laptop Edge), and full qualification.

See [ROLLBACK.md](ROLLBACK.md).
