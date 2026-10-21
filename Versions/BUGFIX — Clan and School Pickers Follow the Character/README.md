# BUGFIX — Clan and School Pickers Follow the Character

Cycle 5, Release 5a. Reported by the owner on 20 October 2026: after opening any saved character, the
**Identity** tab was right, but the **Clan & School** tab showed **Crab, Hida (+1 Strength), Hida Bushi** and Hida
Bushi's description, for every character, in Play mode as well as Management.

## What was wrong

The tab's four pickers (`#cfs_clan`, `#cfs_minorClan`, `#cfs_family`, `#cfs_school`) are *staging* controls: you
choose there, then Apply Family or Apply School writes the character's own fields (`f_clan`, `f_family`,
`f_school`, `f_familyApplied`, `f_schoolApplied`, `f_schoolsData`). No save holds the pickers, and no load set
them, so after a load they kept their first options. Phase 12.1 shows the pickers as plain text in Play mode, so
Play showed the defaults as the character's. The saves were always right.

**It was also a data risk.** Measured on the live build on 21 October with three synthetic characters (Crane /
Kakita / Kakita Bushi, a Lion Kitsu Shugenja, a Badger Minor Clan): in Management, one tap of **Apply School**
replaced the character's School and School list with Hida Bushi, and **Apply Family** then made them Crab / Hida
with Hida's +1 Strength. Neither button asks first.

## The fix

One fragment, `src/sheet/209.99999999993-bugfix-clan-school-sync.js` (`CFSSYNC`, switch `CFS_SYNC_ENABLED`), and
one seam block. It wraps `applyData()`, the single load path of Import, Load and the Characters list. After a load
that was not refused, the four pickers are set to the character's own Clan, Family and School:

- **Clan:** `f_clan` if it is a Great Clan; a Minor Clan selects "Minor Clan" and that Minor Clan; with no
  recognised Clan, the Clan whose picker offers the School (or the Brotherhood of Shinsei for a monk School).
- **School:** the School applied on this tab (`f_schoolApplied`), else the first of the character's Schools, else
  `f_school`. With Multiple Schools or an Advanced School, the tab shows the basic School it applied.
- A School or Family that the Clan's list lacks is shown as one extra, inert option (marked `data-cfssync`):
  Apply finds no library entry for it and changes nothing. Rebuilding the list (changing the Clan) drops it.
- Nothing is chosen (no Clan, no School): the pickers return to their first options, as on a fresh sheet.

**Display only.** Apply is never fired and no saved field is written (checked: `collectData()` is identical before
and after a sync). **After a reset** (New, Delete of the open character, the blank "New / unsaved" sheet) the
pickers return to their first options, as on a fresh page, so a blank sheet never shows the last character's
Clan (the code review's finding, 21 October). **Except while the creation wizard is open:** it resets the sheet
mid-step (a second Minor Clan pick after applying) and then stages its own pick, so there a reset leaves them.

**Apply asks first (the owner's ruling 5, 21 October).** A person's tap on Apply Family or Apply School, when the
character already has a Family or School applied, opens the sheet's own confirmation first: "Replace your School,
Kakita Bushi, with Kitsu Shugenja? Its Skills, Techniques and Honor are set again.", or "Apply Kakita Bushi again?
…, and your other School (Doji Courtier) will be removed." (it names other Schools and Alternate Paths that would
go). Cancel changes nothing. Only trusted clicks are held: the creation wizard clicks Apply by script and is never
stopped mid-step, and the confirmed click is replayed the same way. Phase 4.7's own refusal of Apply School over an
Advanced School still comes first. Nothing applied yet, or nothing valid staged: no question. Switch
`CFS_APPLY_GUARD_ENABLED`; `CFSSYNC.question()` builds the question.

Structure (owner's rules of 9 October): `CFSSYNC.target(record)` is pure logic over the School and Family
libraries; `CFSSYNC.sync()` is the UI hook into 080's pickers and refresh functions.

## QA

| Measure | Result |
|---|---|
| Own harness, `qa/cfs-sync-harness.js` (synthetic saves only; the guard's checks tap with real `page.click`) | **72/72** |
| The same harness on `main` (`a9a11199…`) | **16/72**: the 56 checks of the fix fail; the 16 that pass guard what must not change (fresh-sheet defaults, data intact after a load, a reset inside the wizard left alone, no question when nothing is applied, a script's click applies) |
| Pinned variants, `qa/verify-variants.py` (case list dry-run first: 12 mutations unique) | **all 13 matched**: baseline 56; switch off 41; load not hooked 36; Apply fired on load 4; Minor Clan left stale 6; synced on every reset, the wizard's too 1; reset not synced 1; no extra option 3; School read from `f_school` 7; no Clan from the School 6; guard off 8; guard holds script clicks 3 (the wizard would stop); losses not named 1 |
| Removal, `qa/test-removal.py` | **8/8**: rebuilds `a9a11199…` (6,718,713 bytes) byte for byte; with `--fixture`, the two harness helpers below return to main's bytes; refuses the live tree, a live harness, a foreign marker and a missing block |
| Suite harnesses that tap Apply for real | Two helpers now answer the new question, in blocks `apply-asks-first` owned by this fix: `BUGFIX — Spell Slots Tab on Safari/qa/safari-tab-harness.js` **19/19** (it re-applies a School) and `PART H — Phase 9 Clan-Themed Look/qa/clan-theming-harness.js` **17/17** (a second Family). Unchanged and passing: Eligibility Gates 41/41, Play Mode Combat 55/55. Every other harness clicks Apply by script |
| Removal chain registry, `qa/test-chain.py` | **11/11** with this fix registered |
| Every suite harness that touches the Clan & School pickers (23, pre-flight on the final build) | **all pass**: the five wizard harnesses (43, 32, 52, 25, 71), Ancestors 349, Play Mode Clan and School 14 and the rest |
| Sheet build with the fix | 6,728,218 bytes, `37eebd80…` (before the splash layer) |

Covered: Management and Play; a load while in Play; Import, the Characters list (saved, page reloaded, opened);
one character after another; a blank character; a Minor Clan (the last one in the picker, never its first option);
Multiple Schools; an Advanced School; a School from another Clan's list; a monk with no Clan recorded; a refused
load (a newer save format) leaves the pickers as they were.

## Still to note

- **Apply re-applies.** Confirmed, Apply School still resets the School list to the one School (dropping Multiple
  Schools and Alternate Paths), as it always has; the question now says so first.
- **A monk with a Great Clan recorded** shows that Clan and the monk School as an inert extra option; Apply School
  then says "No school selected" (the School is not in that Clan's list).
- Device checks (the owner's iPhone): in the Cycle 5 Device Checks checklist.
