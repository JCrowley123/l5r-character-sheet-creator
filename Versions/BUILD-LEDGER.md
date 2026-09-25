# Rokugan Build Ledger

Where every roadmap phase actually stands — separating what is **verified** from what is merely
**built**, and what is built from what is **finished**.

## Open reminders

- [x] **FIXED and CONFIRMED on the iPhone 24 September — BUG — A cancelled spell cast still uses the spell slot (every spell).** Found on the iPhone
  on 24 September through A14, then reproduced with no Advantage (Boundless Sight, Arrow's Flight):
  cancelling at the roll preview leaves the Element slot, bonus slot or Void Versatility Ring slot
  spent. Trunk `castSpell()` (`110-modals-trackers.js`) spends before the preview and never reads
  `rollWithModifiers()`'s `null` on Cancel; 4.5.20's `payWithRing()` does the same. Older than
  A01–A16: it dates from Phase 3 (Part G) adding a Cancel in front of every roll. Same shape, found
  by reading code: Maho Own-Blood Wounds survive a Cancel. Confirmed in code, not yet reproduced
  headlessly. Proposed: its own BUGFIX folder that refunds exactly what the cast took. See
  [the device audit](PART%20I%20%E2%80%94%20Phase%204.5%20Remaining%20Configuration%20Audit/IPHONE-AUDIT-A01-A16-2026-09-24.md), D1.
  **Owner's decision, 24 September: fix it now, in one BUGFIX folder with the bonus-pip bug below,
  including the Maho refund.** Shipped as
  [BUGFIX — Spell Slot Accounting](BUGFIX%20%E2%80%94%20Spell%20Slot%20Accounting/README.md).
- [x] **FIXED and CONFIRMED on the iPhone 24 September — BUG — The Spell Slots tab never appears on an iPhone.**
  Reported while testing the spell-slot fix: a fresh Isawa Shugenja in Safari (iOS 18.7, private
  browsing) had no Spell Slots tab. A diagnostic bookmarklet showed the cause: Safari reports
  `display:none` for anything inside a hidden carousel page, so once the page was hidden at load it
  could never be shown again. Fixed in
  [BUGFIX — Spell Slots Tab on Safari](BUGFIX%20%E2%80%94%20Spell%20Slots%20Tab%20on%20Safari/README.md). Confirm with the same bookmarklet: expect
  `pageHidden=false` and Spell Slots listed.
- [x] **FIXED and CONFIRMED on the iPhone 24 September — BUG — The installed web app's cache can refuse to load the page on Safari**
  ("Response served by service worker has redirections"). Phase 0.6's `sw.js` caches
  `fetch('./index.html')`; Cloudflare Pages redirects `/index.html` to `/`, so the cached response
  is marked as redirected and Safari refuses it for a page load. Proposed: its own BUGFIX folder
  that caches `./` directly (or rebuilds a clean response). Workaround until then: Settings → Safari
  → Advanced → Website Data → delete `pages.dev`. Recommended before Phase 11. **Owner's yes, 24 September.**
  Fixed in [BUGFIX — Service Worker Redirected Page](BUGFIX%20%E2%80%94%20Service%20Worker%20Redirected%20Page/README.md).
- [x] **COMPLETE 25 September — Phase 11, Characters List, Creation Wizard & Save Model (Part K).**
  Your choice on 24 September, built in stages: the Characters list and save model, then the
  wizard as Phases 11.2 to 11.2.4. **Confirmed on your iPhone and laptop, 25 September:** creating
  a character through the wizard, opening, Save As a copy, Export JSON, and Import JSON (a save
  renamed to `.json`). Picking an older `.l5r` save without renaming it needed a fix, built the
  same day (BUGFIX — Import File Picker Filter, below). **Its device check passed on your iPhone
  the same afternoon:** Import offered Choose File, and `Sairyu_.l5r` was picked and imported
  without renaming. **Export to
  PDF is Phase 11.1**, split out on 24 September and not started. Play mode, the old toolbar's
  replacement and Save As from Management mode belong to Phase 12.
- [ ] **FINDING — An imported older save keeps its older layout until it is opened.** **Ruled 25
  September: belongs to Phase 7** (migration), together with Phase 11's finding that the sheet writes
  format 3 while `SHEET_SCHEMA_VERSION` still says 2. Nothing is lost meanwhile: the sheet reads both. Found
  25 September from your note that an export looked like the old format. Import stores the file
  exactly as picked, and the list's Export JSON and Save As a copy copy that stored data. Measured
  with `Sairyu_.l5r`: exported without opening it, the file is byte-for-byte the import (no format
  number); opened on the sheet first, it exports as the current format 3. The sheet reads both, so
  nothing is lost. **Not changed:** your ruling wanted on whether Import should convert on the way
  in.
- [ ] **FINDING — Export file names drop accented letters.** "Sairyū" exports as
  `Sairy_.l5r.json`: the name keeps only a to z, 0 to 9, hyphen and underscore. Cosmetic; the
  name inside the file is intact. Not changed. **Ruled 25 September: fix it with the next change to
  export** (Phase 11.1 or Phase 12's toolbar work), not on its own.
- [x] **FIXED and CONFIRMED on the iPhone 25 September — BUG — Apply School adds placeholder
  Skill rows for four Schools — MEASURED WIDER: 69 of the 104 Schools.** Fixed in
  [BUGFIX — Apply School Skill Rows](BUGFIX%20%E2%80%94%20Apply%20School%20Skill%20Rows/README.md); the iPhone
  checks are in its update below. The first measurement ("about 45 of the 79") was a static scan
  of two libraries; the fix's sweep of all 104 Schools through the real button gives 69. Measured on the live site: every School Skill written
  "Lore: X", "Craft: X", "Perform: X" or "Games: X" (Kitsu's Lore: History and Lore: Theology, Hida's
  Lore: Shadowlands, Kaiu's Craft Skills, and so on) is added with **no Trait**, and its roll button
  refuses ("Set a Trait for this skill before rolling") until one is typed, because the Skill lookup
  matches exact names only. The wizard avoids it only for "Lore (pick one)". **Ruled 25 September:**
  fill a blank Trait wherever the Skill's family makes it clear, including in existing saves; leave
  placeholder rows in existing saves for the player to delete. Being built as BUGFIX — Apply School
  Skill Rows. The original entry follows. Found building Phase
  11.2.2 on 25 September. Tsi Smith [Artisan] gets rows named "Bugei", "or Merchant Skill" and "two
  ranks in any one Craft Skill", and Kasuga Smuggler [Courtier] gets "Merchant" and "or Low Skill",
  because the library writes one free choice across commas. Mirumoto Bushi and Shiba Bushi list
  "Theology" (the sheet's Skill is "Lore: Theology") and Kaiu Engineer lists "War Fans" (the sheet's
  is "War Fan"), so Apply School adds rows with no Trait. The wizard reads the choices correctly; the
  rows are trunk behaviour and library data. Proposed: its own BUGFIX folder.
- [x] **DONE 25 September — DATA — Starting spells for every Shugenja School.** You sent each
  School's entry from the books; Phase 11.2.4 records the 20 that 11.2.3 lacked, so all 21
  Shugenja Schools in the library have their "Spells:" line. Kitsune [Mantis] was removed from the
  library at your request first (it copied the Fox Clan's School).
- [x] **SKIPPED 25 September — DATA — Five pages not given.** Fuzake (Secrets of the Empire),
  Ninube (Great Clans), and Horiuchi, Yogo Wardmaster and Yoritomo (no book named) show "page not
  yet recorded". Your ruling: skip them. Kitsu stays p.118, as you confirmed.
- [x] **RESOLVED 25 September — Seppun Shugenja's starting spells.** The first quotation gave 2
  Water spells, Seppun's own Deficiency, which the sheet allows none of at Rank 1. You sent the
  entry again: **3 Fire, 2 Earth, 1 Air**. Corrected.
- [ ] **FEEDBACK — Remove a Skill bought with XP in the wizard, with its XP refunded.** Your
  observation from the iPhone test of 25 September, recorded, **not built**. An Asahina Shugenja
  added Etiquette and Investigation on the wizard's Skills step, deliberately not as free School
  choices, and the wizard correctly charged XP for them. Changing your mind, there was no way to
  remove them and get the XP back: lowering the Rank to 0 leaves the row, which then rolls as
  Unskilled (and meets the Rank 0 exploding-10s bug below). Wanted: a Skill that is neither a
  School Skill nor a free choice can be removed in the wizard, refunding its XP, as the sheet
  itself already allows outside the wizard.
- [ ] **FEEDBACK — An ⓘ info button on Skills, Spells, Advantages and Disadvantages.** Your design
  suggestion of 25 September, recorded, **not built**: the same circled-i the sheet already uses
  for Advantage tooltips, shown against each Skill, Spell, Advantage and Disadvantage (in the
  wizard's lists as well as the sheet).
- [ ] **REVIEW — Do a Shugenja's starting spells begin memorised?** Your design question of 25
  September, deferred for research and **not built**. Should starting spells be memorised (no
  scroll needed) and, like School Skills, cost no experience to memorise? Today each is added with
  its Spell Scroll and none is memorised. Needs the rulebook's text on memorisation and starting
  spells before deciding.
- [ ] **BACKLOG — A01–A16 device-pass items, parked 24 September.** The owner parked every other
  device-pass item so the roadmap can move again. Each one is listed, with Claude's recommendation,
  under "Device-pass decisions and backlog" below. Pick them up when a phase touches the same code,
  or in Phase 15 (UI Consistency Pass) for the interface items.
- [ ] **BUG — Rank 0 Skill-table rolls explode 10s.** A Rank 0 row rolled from the Skill table is
  labelled "Unskilled" in the preview but its 10s explode, because trunk `rollSkill()`
  (`src/sheet/100-dice-engine.js`) passes no `explode:false`; only the Untrained Skills list is
  right. Found during 4.5.19, deferred at the owner's request on 23 September. Fix as its own
  BUGFIX folder (delimited, additive, like Negative Roll Modifier Display); check Void's Rank 0 → 1
  option still re-enables explosion and Soul of Artistry still lifts matching rows; run the full
  combined suite; conditional fixture corrections if a retained harness rolls a Rank 0 row.
  **Parked 24 September** (backlog below): it errs in the player's favour; fix it with the next
  change to dice rolling.
- [x] **FIXED and CONFIRMED on the iPhone 24 September — BUG — Hand-tapped bonus spell-slot pips can exceed the shared pool, and taking one back
  strips another element's pip.** Reproduced 23 September (Water 2, Fire 2, Void 3): fill the shared
  bonus pool by casting, then tap an EMPTY bonus pip by hand on another element. The shared total
  stays capped at the Void Rank, but that element's own fill count still rises, so the rows show
  more bonus pips than the pool holds (4 shown against 3). Taking bonus pips back on Water then also
  removes one of Fire's, because each row's fill is trimmed to the shared total. Casting and ordinary
  slot pips never cause it (a 60-session randomised run found no cross-element change without the
  hand-tapped bonus pip). Trunk code: the manual bonus-pip handler in `080-identity-build-ui.js` and
  `renderSpellBonusPips()` in `110-modals-trackers.js`. Proposed fix, own BUGFIX folder: refuse a
  hand-tapped bonus pip when the pool is full (as casting does); a take-back changes only the row
  tapped; repair saves that already show more than the pool once on load — **needs an owner ruling
  on which element's pips a repair removes**, since a save does not record that. Kept open at the
  owner's request. **Ruled 24 September: never remove pips automatically; warn that the rows show
  more than the pool holds, and let the corrected take-back fix it.** Fixed with the spell-slot
  bug above, in the same folder.
- [ ] **REVIEW — Seven Fortunes' Blessing: one Blessing per character.** Discussed 23 September;
  deferred by the owner for review at an appropriate time. Core p.148 bans two members of the same
  Advantage family. Proposal on the table: flag (never delete) a second Blessing row; a Blessing and
  a Curse from different Fortunes stay allowed (the source says so explicitly). Until reviewed, 4.5.21
  neither flags nor blocks a second Blessing row.
- [ ] **REVIEW — Seven Fortunes' Blessing: changing the Fortune on an existing row.** Discussed 23
  September; deferred by the owner. Proposal on the table: changing the Fortune re-prices the row
  (e.g. Benten 4 → Bishamon 5) because it corrects the choice; Naishou Citizen's "a later purchase
  replaces your Blessing without a refund" belongs to A08, not A01. Until reviewed, 4.5.21 prices the
  row by the currently chosen Fortune, like every other configured entry. A08 shipped as 4.5.22
  on 23 September **without** replace-without-refund; that purchase history waits on this review.
- Both Blessing reviews above were **parked on 24 September** with the rest of the device-pass
  backlog (item 15 below carries Claude's recommendation for each).
- [ ] **REMAINING PHASE 4.5 SCOPE — D06 Weakness and Hotei (D04b's second half).** Neither is built,
  and the 25 September kickoff did not list them. D06 has an approved approach (the Disadvantage
  table further down) but needs boundary rulings (Insight, dependent Rings, Ring-derived resources)
  and reaches every Trait consumer, so it is new machinery rather than a catalogue row. Hotei stays
  recorded as source-blocked. **Ruled 25 September: after Phase 12's first build stage.**

## Current update — 25 September 2026: Phase 12, part 1 — Play and Management modes (machinery and Background)

> **Built and verified headlessly; on its own branch for your iPhone test before anything goes to
> `main`.** Phase 12 is being built one tab per part, at your request, so each part is small enough
> to test and merge on its own and a usage limit cannot strand a half-built stage.

**What to test:** a **Manage / Done** button now sits beside the character's name. Open a character
from the Characters list: it opens in **Play** (the button reads *Manage*), and the Background tab's
four boxes show their text as plain text and cannot be edited. Tap *Manage*: they edit again, and the
button reads *Done*. A blank sheet, or a load through the old toolbar, opens in Management. **Only
Background is locked in this part**; the other tabs follow one part at a time.

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,083,017 bytes**, SHA-256 `6c860a52b8e3215c7011484e90f8d33c991b347c4211e83fcb9d94a63bf857a9` |
| Full QA | **2,497/2,497**: 2,472 retained + 25 new; 11 of 11 pinned variants fail where expected |
| Found while building | An infinite loop on the first tap of the toggle (caught by the harness, fixed), and a harness blind spot (fixed, with its own variant) |
| Cross-phase fixture | Phase 11's `CL-COPY-INDEPENDENT` switches to Management before editing Notes, only when Phase 12 is present: 70/70 both ways |
| Removal | **Byte-identical** to `0dcb56e8…` |

See [the part](PART%20K%20%E2%80%94%20Phase%2012%20Play%20and%20Management%20Modes/README.md).

## Previous update — 25 September 2026: Phase 12 audit, and the week at 85%

> **Usage: 85% of this week** by your reading, up from 79% at the start of this session: 6 points
> for the removal chain, BUGFIX — Apply School Skill Rows and this audit together, not split. The
> week resets on Wednesday 30 September at 02:00. **Phase 12's build waits for next week's
> allowance, as agreed.**

**The audit is Phase 12's first deliverable, and no code.** It lists every control on all ten tabs,
measured in the live build (plus the 17 control classes the configured Advantages and Disadvantages
add, read from their source), and sorts each into Management-only, Play or information under your
rulings. It recommends one capture-phase gate and a selector registry instead of a gate in every
handler, because the sheet keeps its state in its own inputs and most edits have no function to
gate. That is also why its estimate is lower than the kickoff's: **about 17–27% over three stages**
(12, 12.1, 12.2). Only three retained harnesses reach Play under your default-mode ruling. See
[the audit](PART%20K%20%E2%80%94%20Phase%2012%20Play%20and%20Management%20Modes%20Audit/AUDIT.md).

**Its four rulings were taken as recommended, 25 September:** "inert" means every user event on a
Management control is stopped in Play, while the sheet's own code writing values keeps working;
Honor, Glory and Status points and Taint stay editable in Play, ranks are Management-only; the
toggle is a small "Manage" button beside the character's name, reading "Done" in Management; and
Play shows a Management-only field's value as plain text. **Stage 12 is ready to build** on next
week's allowance. The ledger artifact is deliberately not republished yet (your instruction).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | Unchanged: **3,072,896 bytes**, SHA-256 `0dcb56e8…` |
| Audit | Ten tabs: Clan & School 6 Management-only kinds, Identity 11 (plus 7 awaiting a ruling), Rings & Traits 14, Skills 11, Adv & Disadv 16, Techniques 8, Background 4; Spell Slots, Equipment and Combat all Play |
| Removal chain, older folders | The six converted `verify-variants.py` runs: see the registry README (Phases 11, 11.2, 11.2.1 and the Kitsune fix all as expected) |
| Device | BUGFIX — Apply School Skill Rows **confirmed on your iPhone** (all four checks) and merged to `main` |

## Previous update — 25 September 2026: BUGFIX — Apply School Skill Rows

> **Confirmed on your iPhone, 25 September,** on the branch preview: all four checks below worked as
> described, and the fix was merged to `main`. Built and verified headlessly first. Usage: see
> the update above (85% after this, the removal chain and the Phase 12 audit together).
>
> **To check on the iPhone** (after a merge to `main`, or on a Cloudflare preview of the branch):
> 1. Apply **Kitsu Shugenja**: *Lore: History* and *Lore: Theology* show **Intelligence**, and the
>    d10 on each rolls.
> 2. Apply **Mirumoto Bushi**: the row reads **Lore: Theology**, not "Theology".
> 3. Apply **Tsi Smith [Artisan]** (Minor Clan → Oriole): only Commerce and Defense are added,
>    and the status line says 4 choices are left. No "Bugei" or "or Merchant Skill" rows.
> 4. Open a character you made **before** this fix that has a Lore Skill: its Trait is now filled.
>    Placeholder rows it already had are still there, for you to delete.

**The bug was much wider than recorded.** Every School Skill written "Family: Subject" (Lore: X,
Craft: X, Perform: X, Games: X) was added with no Trait, and its roll refused until one was typed:
**69 of the 104 Schools**. Also fixed: Mirumoto's and Shiba's "Theology" and Kaiu's "War Fans"
(corrected in the School library, so every reader agrees), Tsi Smith's and Kasuga Smuggler's
placeholder rows, and one case nobody had recorded, found by the fix's own sweep: The Order of
Jurojin's Blessing split "Medicine (Disease, Herbalism)" at the bracketed comma into two nonsense
rows. The character check and the second-School Technique unlock now read a School's Skills the
same way. Your ruling on existing saves holds: blank Traits are filled, placeholder rows are left.
See [the fix](BUGFIX%20%E2%80%94%20Apply%20School%20Skill%20Rows/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,072,896 bytes**, SHA-256 `0dcb56e8c02efbb1c7dba6e9d61da29b7e355009f47b2777c7d481bbdb1ed5d1` |
| Full QA | **2,472/2,472**: 2,435 retained + 37 new; **13/37** on the pre-fix build |
| Key checks | A sweep applies all 104 Schools through the real button (578 School Skill rows) against the sheet's own `SKILL_LIBRARY`; an older save keeps its names and placeholder rows and shows no new warning |
| Removal | **Byte-identical** to `738c7ccf…` (commit `322d9e6`); 15/16 fixtures pass, 1 symlink skip on Windows |
| Sensitivity | **12 of 12 pinned variants** fail where expected; the first run found three checks nothing could turn red, and three variants were added for them |
| Removal chain | **Its first use:** one line in the registry, and all eight earlier live fixtures strip this fix with no edit to their folders |
| Found alongside | This desktop's Python cannot see `AppData\Roaming`, so Node launched from a Python script could not find Playwright. The tooling now lives in `C:\Users\jcrow\l5r-qa-tools` (recorded in `CLAUDE.md`) |
| Device | **Confirmed on your iPhone**: all four checks, on the branch preview, 25 September |

## Previous update — 25 September 2026: rulings for the next phase, and QA — Removal Chain Registry

> **Usage: 79% of this week** by your reading after this session's assessment (77% after the Import
> fix). **The week resets on Wednesday 30 September at 02:00**, by your reading; the kickoff had
> guessed a Tuesday. **Agreed plan for the rest of the week:** the shared removal chain (below), then
> BUGFIX — Apply School Skill Rows, then Phase 12's audit. Phase 12's build starts on next week's
> allowance.

**Your rulings, 25 September.** All nine went with the recommendation:

| # | Question | Ruling |
|---:|---|---|
| 1 | Usage | 79%; resets Wednesday 30 September at 02:00 |
| 2 | Order | Shared removal chain, then the Apply School bugfix, then the Phase 12 audit this week; Phase 12's build next week |
| 3 | Existing saves (Apply School) | Fill a blank Trait where the Skill's family makes it clear; leave placeholder rows for the player to delete |
| 4 | Phase 12 default mode | Play when opened from the Characters list or finished in the wizard; Management otherwise; the mode is never saved into the character |
| 5 | Tabs the roadmap left out | Clan & School read-only in Play; Rings & Traits read-and-roll in Play; Spell Slots fully usable in both |
| 6 | In-play Advantage controls | Use, Reset, invoke and session toggles stay live in Play mode |
| 7 | Import/Export findings | The older-format import and the format-number mismatch go to Phase 7; accented file names get fixed with the next change to export |
| 8 | D06 Weakness and Hotei | After Phase 12's first build stage |
| 9 | Test tooling | Node.js and Playwright installed on the desktop; the combined suite now runs there (2,435/2,435 on its first run) |

**QA — Removal Chain Registry.** Every Part K stage's removal fixture used to carry its own list of
the releases built after it, and each new release had to be added to every earlier list (14 files in
8 folders by the Import fix). A missed list failed silently, as Phase 11's did from 11.2 to 11.2.3.
There is now one list, and a new release adds one line to it. Test infrastructure only: the sheet
and its build are unchanged. See
[the registry](QA%20%E2%80%94%20Removal%20Chain%20Registry/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | Unchanged: **3,062,010 bytes**, SHA-256 `738c7ccfa3bdf67a6ca160371508fe22521cac845b883119b95a5a4e9490958a` |
| Full QA | **2,435/2,435** on the Windows desktop (first run there); the registry changes no sheet source |
| Registry checks | **11/11**; six sabotage variants on scratch copies of `Versions/` each go red where expected |
| Converted fixtures | All eight `test-removal.py` suites pass; one symlink test skips in each on Windows |
| Also corrected | Stale rows in the roadmap (Phases 0, 0.5, 0.6, 9, 4.5, and 12's dependency on 4.8), this ledger ("Ahead", the remaining-4.5 note, the bugfix count, the "Fully done" count) and `CLAUDE.md` ("iPhone pending" on 4.5.13 and 4.5.14) |

## Previous update — 25 September 2026: BUGFIX — Import File Picker Filter, and Phase 11 complete

> **Confirmed on your iPhone, 25 September.** On the Characters screen, Import offered Photo
> Library, Take Photo or Video and Choose File; Choose File opened Files, where `Sairyu_.l5r`
> (9 KB, in the Chrome folder) was no longer greyed out, and it imported without renaming.
> **Usage: 77% of this week** by your reading after the fix, up from 74%.
>
> **Next:** a proposed next phase, and a kickoff prompt for a fresh session, are in
> [`CLAUDE-SESSION-KICKOFF-NEXT-PHASE-2026-09-25.md`](CLAUDE-SESSION-KICKOFF-NEXT-PHASE-2026-09-25.md).
> The proposal is the BUGFIX for Apply School's placeholder Skill rows, then Phase 12's first
> stage. Nothing is built until you confirm, and the new session is asked to reach its own view.

**Your iPhone could not pick an older save.** Both Import controls told the browser to offer only
JSON files, and iOS greys everything else out, including a save named `.l5r`, the sheet's older
extension. It was the sheet's filter, not an iOS limitation: renamed to `.json`, your file
imported. The filter is lifted from both controls; each import still refuses a file that is not
JSON or not a character save. On the iPhone the picker may now offer Photo Library and Take
Photo beside Choose File; choose Files. See
[the fix](BUGFIX%20%E2%80%94%20Import%20File%20Picker%20Filter/README.md).

**Phase 11 is complete**, on your checks of 25 September (open reminder above). Export to PDF is
Phase 11.1.

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,062,010 bytes**, SHA-256 `738c7ccfa3bdf67a6ca160371508fe22521cac845b883119b95a5a4e9490958a` |
| Full QA | **2,435/2,435**: 2,425 retained + 10 new; 6/10 on the pre-fix build, failing exactly the four filter checks |
| Removal | **Byte-identical** to `480e1a15…` (commit `d07b03f`); Phase 11's remover refuses while it is present; 15/15 fixtures |
| Found alongside | An imported older save stays in its older layout until opened; export names drop accented letters (open findings above) |
| Device | **Confirmed on your iPhone:** `Sairyu_.l5r` picked through Choose File and imported without renaming |
| Usage | **77% of this week** by your reading, up from 74%: 3 points for the fix, the Phase 11 write-up and the merge |

## Previous update — 25 September 2026: Phase 11.2.4 — Wizard Starting Spells for Every School

**Built from your quotations and verified headlessly.** Every Shugenja School now has its own
rulebook "Spells:" line in the wizard: the 20 you sent today, plus Kitsu from 11.2.3. Seventeen
are Element counts and work exactly like Kitsu's. Four are not, and are read as follows:
- **Fuzake:** Path to Inner Peace is given (with its scroll), and the Water box asks for one more.
- **Isawa:** four boxes (3 of one Element, 2 of another, 1 of a third, 1 of a fourth).
- **Chuda (Spider):** 3 Maho of one Element, 2 Maho of a second Element that is not your chosen
  Deficiency, and any 1 spell that is not of your Deficiency.
- **Yogo Wardmaster:** Commune and Summon (no Sense), 3 Ward spells and 3 other spells that are
  not Void. "Ward" is the library's Wards keyword plus the 17 spells your quotation lists.

For those, you never pick an Element: the sheet could not keep it. Your learned spells are matched
to the boxes in whichever way fills the most, so the order you choose them in never matters. One
picker offers only the spells that would fill a box and that the sheet lets you learn now. See
[the phase](PART%20K%20%E2%80%94%20Phase%2011.2.4%20Wizard%20Starting%20Spells%20for%20Every%20School/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,060,080 bytes**, SHA-256 `480e1a157c4f9a1ad259e4d141d2e262e574da3926909a7d7393f878b6fae890` |
| Full QA | **2,425/2,425**: 2,354 retained + 71 new |
| Key checks | One check per School's line and one walk per School to its Spells step (40); every picker against the sheet's own Technique picker; `CW5-SAME-AS-BY-HAND` with a Maho spell |
| Removal | **Byte-identical** to `63b51115…` (commit `90d3452`); 11.2.3's and 11.2.2's removers refuse while it is present; 15/15 fixtures |
| Sensitivity | Nine pinned variants each fail where expected; the first run found two blind spots (Chuda's Deficiency, earlier boxes first), now checked by cases where the rule changes the count |
| Found while building | **Seppun's first line asked for 2 Water spells, its own Deficiency**, which the sheet allows none of at Rank 1; you corrected it to 3 Fire, 2 Earth, 1 Air. The earlier wizard harnesses used Isawa as "a School with no recorded line"; they now take Isawa's line away for their own page, with no check changed |
| Not given | Pages for Fuzake, Ninube, Horiuchi, Yogo Wardmaster, Yoritomo: skipped at your request |
| Device | **Tested on your iPhone and laptop, 25 September: all work as described and designed.** Two observations recorded as feedback (open reminders above) |
| Usage | **74% of this week** by your reading after Phase 11.2.4, up from 54% after the wizard's first stage: 20 points for 11.2.1 to 11.2.4 and the Kitsune [Mantis] fix together, not split per stage |

**Next:** your iPhone check (six Schools, listed in the phase README).

## Previous update — 25 September 2026: BUGFIX — Kitsune Shugenja Listed Under Mantis

**Removed at your request.** The Mantis Clan listed "Kitsune Shugenja [Mantis]", a word-for-word copy
of the Fox Clan's Kitsune Shugenja. One library line is deleted; the Mantis Clan now offers seven
Schools, in the sheet's picker and the wizard alike, and the library holds exactly your 21 Shugenja
Schools. The Fox Clan's Kitsune Shugenja and the Mantis Clan's **Kitsune Family** are unchanged. A
character saved with the removed School still opens, without error, but loses its granted Technique
row (choose the Fox Clan's Kitsune Shugenja to restore it). See
[the fix](BUGFIX%20%E2%80%94%20Kitsune%20Shugenja%20Listed%20Under%20Mantis/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,042,451 bytes**, SHA-256 `63b51115800d8788a6d3392ef3af9fca988020ed8ba8cc5954c5d05ec9b6517b` |
| Full QA | **2,354/2,354**: 2,345 retained + 9 new; 5/9 on the pre-fix build, failing exactly the four checks that see the School |
| Removal | Puts the line back: **byte-identical** to `72ea88b7…` (commit `bbd7624`); 10/10 fixtures |
| Other fixtures | The five Part K live removal fixtures failed (a library line changes every build under them); each now undoes this fix first, 15/15 |
| Device | Not yet tried on the iPhone |
| Usage | **74% of this week** by your reading after Phase 11.2.4, up from 54% after the wizard's first stage: 20 points for 11.2.1 to 11.2.4 and the Kitsune [Mantis] fix together, not split per stage |

## Previous update — 25 September 2026: Phase 11.2.3 — Wizard Starting Spells

**Built from your iPhone test and verified headlessly.** You pointed out that the rulebook gives
each Shugenja School's starting spells (Kitsu Shugenja, Core p.118: "Sense, Commune, Summon, 3
Water, 2 Air, and 1 Earth") and that neither the School data, the character check nor the wizard
used it. Now, for a School whose line is recorded, the Spells step:
- states the allotment;
- adds the given spells (Sense, Commune, Summon) with their scrolls;
- gives each Element its own box ("Water: choose 3 · 1 chosen"), offering only the spells the sheet
  lets this character learn (effective School Rank with Affinity and Deficiency: a Kitsu gets Water
  up to Mastery 2 and no Fire at all);
- adds each pick's scroll to Equipment.

The character check notes an allotment not yet filled. **Only Kitsu's line is recorded**; the
other 21 need theirs from the books (open reminder above). Your memorisation question is recorded,
not built. See [the phase](PART%20K%20%E2%80%94%20Phase%2011.2.3%20Wizard%20Starting%20Spells/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,042,795 bytes**, SHA-256 `72ea88b789701faa2523b9097b06805d0c5051b0850aaab926e60617a9df8668` |
| Full QA | **2,345/2,345**: 2,320 retained + 25 new |
| Key checks | Each Element's list matches the sheet's own Technique picker; `CW3-SAME-AS-BY-HAND`; 24/24 also with Phase 5 removed |
| Removal | **Byte-identical** to `a2d148ee…` (commit `8c9b9eb`); 11.2.2's remover refuses while it is present; 15/15 fixtures |
| Sensitivity | Seven variants each fail where expected; the first run found a blind spot (a given spell counting toward a quota changed nothing with Kitsu's data), now checked directly |
| Found while building | **Every Part K live removal fixture had been failing** since the next stage landed (Phase 11's since 11.2). The remover refusal was correct; the fixtures never removed later stages first. All five fixed and 15/15; the whole chain comes off byte-identical down to Phase 11's restore point |
| Device | Not yet tried on the iPhone |
| Usage | **74% of this week** by your reading after Phase 11.2.4, up from 54% after the wizard's first stage: 20 points for 11.2.1 to 11.2.4 and the Kitsune [Mantis] fix together, not split per stage |

**Next:** the other 21 Schools' spell lines (your choice of how, below), then your iPhone check.

## Previous update — 25 September 2026: Phase 11.2.2 — Wizard Free Choices, Spells and Kiho

**Built at your request and verified headlessly:** the wizard now walks you through every choice
your School leaves to you. **Free Skill choices** in every form the School library uses: a Kakita
Bushi's "any one Bugei or High Skill" offers High, Bugei and Weapon Skills; "any two Skills" is
two boxes; "not Low" leaves Low Skills out. **"Lore (pick one)"** asks for the Lore's subject.
**Spells** for a Shugenja School: each is added as its Spell Scroll and learned, the sheet's own
way. **Kiho** for a Brotherhood monk School, with the sheet's own free-pick count. **A reminder,
never a block:** the first Next on a step with a choice still open points at it and reads "Leave
for later ›"; the second moves on. Review lists anything still open. See
[the phase](PART%20K%20%E2%80%94%20Phase%2011.2.2%20Wizard%20Free%20Choices%20Spells%20and%20Kiho/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,030,719 bytes**, SHA-256 `a2d148ee90ee2e877fc74c100e1766ad68620193dbae389763a6212cdec12953` |
| Full QA | **2,320/2,320**: 2,268 retained + 52 new |
| Key checks | Both by-hand comparisons (a Shugenja's spell, a monk's Skills, Lore and Kiho) save identically; a sweep reads all 112 free choices across the 104 Schools |
| Removal | **Byte-identical** to `ee049396…` (commit `7f25263`); 11.2.1's and 11.2's removers refuse while it is present; 15/15 fixtures |
| Sensitivity | Thirteen variants each fail where expected. A screenshot, not a check, found the Lore box under 44px; fixed and now checked |
| Your ruling, 25 September | **"Bugei" offers the Bugei and Weapon Skills, not Cannon, Firearms or Ninjutsu** unless the choice also says Low. The first cut offered those three; you asked why weapon Skills were listed at all |
| Other phases | 11.2.1's harness moves by step title (32/32 with and without this stage); its variants now remove this stage first |
| Not known to the sheet | **How many spells each School starts with.** The Spells step says so and points to the rulebook rather than guessing |
| Found, not fixed | Apply School adds placeholder Skill rows for four Schools (open reminder above) |
| Device | Not yet tried on the iPhone |
| Usage | **74% of this week** by your reading after Phase 11.2.4, up from 54% after the wizard's first stage: 20 points for 11.2.1 to 11.2.4 and the Kitsune [Mantis] fix together, not split per stage |

**Next:** your iPhone check of the whole wizard, with the test list from this session.
*Tested 25 September: works as designed. Your note on starting spells became Phase 11.2.3, above.*

## Previous update — 24 September 2026: Phase 11.2.1 — Wizard Skills and Advantages

**Built and verified headlessly:** the wizard's second stage. Two steps now sit before Review:
**Skills** and **Advantages & Disadvantages**, so the wizard covers a whole starting character.
Skills shows one box per free choice your School grants ("any one Lore Skill", "any one High
Skill"), narrowed to the Skills that choice names; each free pick is added through the sheet's own
Skill picker at Rank 1 and ticked as School, so it costs nothing. You can raise and add Skills
too. Advantages & Disadvantages copies the sheet's own two pickers, so an entry with a question
(Elemental Blessing and the rest) still asks it, and greyed-out entries stay greyed. Both steps
show the experience left and block Next only when you overspend. Review now lists the Skills and
Advantages too. **Still no new rules:** `CW1-SAME-AS-BY-HAND` requires the wizard's saved data to
match the same choices made by hand. See [the phase](PART%20K%20%E2%80%94%20Phase%2011.2.1%20Wizard%20Skills%20and%20Advantages/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,003,661 bytes**, SHA-256 `ee04939670db1817823f709974ef13207282d2a0f7df87c26e3c760883eb2939` |
| Full QA | **2,268/2,268**: 2,236 retained + 32 new |
| Key check | `CW1-SAME-AS-BY-HAND`: free choices, raised Skills and Advantages made in the wizard save exactly what the same choices save by hand |
| Removal | **Byte-identical** to `9244163e…` (commit `5c50e87`); 11.2's remover refuses while this stage is present; 15/15 fixtures |
| Sensitivity | Nine variants each fail where expected; the first run found one blind spot (with no stylesheet every check still passed), closed by a 44px touch-target check |
| Other phases | 11.2's harness now moves between steps by title (43/43 with and without this stage); dependencies declared both ways |
| Device | Not yet tried on the iPhone. One wording to look at: 11.2's Rings & Traits step still says "Experience left: 42 of 40" after a Disadvantage; the new steps say "42 · started with 40" |
| Usage | **74% of this week** by your reading after Phase 11.2.4, up from 54% after the wizard's first stage: 20 points for 11.2.1 to 11.2.4 and the Kitsune [Mantis] fix together, not split per stage |

**Next:** your iPhone check of the whole wizard (both stages), then the next Phase 11 part.
*Your request of 25 September came first: Phase 11.2.2, above.*

## Previous update — 24 September 2026: Phase 11.2 (first stage) — Creation Wizard

**Built and verified headlessly:** "Create New Character" now opens a full-screen wizard (your
choice over a guided mode): Name, Clan (with mons), Family, School, Rings & Traits, Review. **It
adds no rules.** Every choice goes through the sheet's own controls, including Apply School's own
questions, and every option list is read from the sheet. Next unlocks when the step has no error
from Phase 5's check, and Finish needs none at all. Changing Clan after applying starts over,
keeping the name, because the sheet cannot un-apply a Family or School. Skills and
Advantages/Disadvantages are the next stage. See [the phase](PART%20K%20%E2%80%94%20Phase%2011.2%20Creation%20Wizard/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,985,043 bytes**, SHA-256 `9244163ea532004707a2c8d5c19bf8cde4ecc0d5a39f3731e7ea3d51ba6a6ec0` |
| Full QA | **2,236/2,236**: 2,123 retained + 70 (Phase 11) + 43 new |
| Key check | `CW-SAME-AS-BY-HAND`: the wizard's saved data is identical to making the same choices by hand |
| Removal | **Byte-identical** to `6043dabb…` (commit `2b3b8c4`); Phase 11's remover refuses while the wizard is present; 15/15 fixtures |
| Sensitivity | Ten variants each fail where expected; the first run found one blind spot (no check that the wizard covers the screen), now closed |
| Other phases | One conditional fixture in Phase 11's harness (70/70 with and without the wizard); soft dependencies on Phase 5 and Phase 9 declared both ways |
| Device | Not yet tried on the iPhone |
| Usage | **54% of this week** by the owner's reading, up from 51% after Phase 11's first stage: 3 points for this stage |

**Next:** your iPhone check of the wizard, then its second stage (Skills, Advantages/Disadvantages).
*Second stage built: Phase 11.2.1, above.*

## Previous update — 24 September 2026: Phase 11 (first stage) — Characters List and Save Model

**Built and verified headlessly:** a Characters screen. It lists every saved character with its
Clan mon, name, School and Insight Rank, Family and Clan. A tap opens a character, and each row's
menu offers Export JSON, Save As a copy and Delete. Import JSON on the list always adds a new
character. The screen opens at startup whenever a character is saved. Autosave follows a saved
character a moment after each change, only when something changed. Export JSON uses the phone's
share sheet. The save format and storage keys are unchanged. Per your approval, Export to PDF is
now Phase 11.1 and the creation wizard Phase 11.2; the roadmap records both. See
[the phase](PART%20K%20%E2%80%94%20Phase%2011%20Characters%20List%20and%20Save%20Model/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,958,319 bytes**, SHA-256 `6043dabbde6d26f488124d1512be3866906039454cb850fafe1fc3ed53b76a09` |
| Full QA | **2,193/2,193**: 2,123 retained + 70 new; no retained harness changed |
| Removal | **Byte-identical** to `864c5134…` (commit `a2312e4`); 15/15 remover fixtures; ownership check exits 0 |
| Sensitivity | Ten scoped variants each fail only their own check; the previous build fails all six scenarios |
| Found while building | Saves are format 3 (4.5.2's wrapper) while `SHEET_SCHEMA_VERSION` is still 2; the first Import refused this build's own saves as "newer". Fixed before shipping |
| Device | **List view confirmed on the iPhone, 24 September**: the empty state, then two saved characters (Hida Bushi, Asahina Shugenja) with Crab and Crane mons, School + Insight Rank and Family + Clan lines, newest first; the Characters button first on the toolbar; the tab row fits without wrapping. **Not yet reported:** opening by tap, autosave, Save As a copy, Delete, Export JSON through the share sheet, Import JSON |
| Usage | **51% of this week** by the owner's reading, up from 47% after the three bugfixes: 4 points for this stage |

**Next:** your iPhone check of the Characters screen, then Phase 11.2, the creation wizard.

## Previous update — 24 September 2026: BUGFIX — Service Worker Redirected Page

**Implemented and verified headlessly:** the "Response served by service worker has redirections"
error. Phase 0.6's worker saved the page by fetching `./index.html`, which Cloudflare Pages
redirects to `/`, so the saved copy was marked as redirected and a browser will not load a page from
it. Three delimited blocks in Phase 0.6's `src/sw.js` (switch `SW_REDIRECT_FIX_ENABLED`) save a
clean copy and never hand a redirected one to a page load. Chromium refuses it just as Safari does,
so the previous worker fails in the harness exactly as the iPhone did, with no emulation. See
[the bugfix](BUGFIX%20%E2%80%94%20Service%20Worker%20Redirected%20Page/README.md).

| Current snapshot | Value |
|---|---|
| Sheet build | Unchanged: **2,928,189 bytes**, `864c5134…`; combined 2,123/2,123 unaffected |
| Service worker | `src/sw.js` 11,607 bytes, SHA-256 `0e75a84d3726ffe1ee6c687ee8264acd84d9771160d815e95ee2921741ba14f2` |
| Own suite | **11/11** fixed; **8/11** previous worker (`net::ERR_FAILED` on the reload, the iPhone's failure) |
| Phase 0.6 harnesses | 12/12 and 5/5 on the fixed worker |
| Removal | `sw.js` **byte-identical** to commit `9b465b5`; 13/13 remover fixtures |
| Sensitivity | Switch off 8/11; without the activate copy 10/11; without the serve-time copy 10/11 |
| Device | **Confirmed on the iPhone, 24 September**: the owner reports every check passed after the deploy |
| Usage | **47% of this week** by the owner's reading, up from 34% after the device pass; one figure for all three bugfixes |

**Next:** Phase 11, Characters List, Creation Wizard & Save Model. All three bugfixes are confirmed on the iPhone.

## Previous update — 24 September 2026: BUGFIX — Spell Slots Tab on Safari

**Implemented and verified headlessly:** the Spell Slots tab now appears on Safari. The carousel's
`targetHidden()` asked the browser whether `#spellSlotsSection` was displayed; Safari answers
`none` for anything inside a hidden page, so the page that was hidden at load stayed hidden all
session. When the page is hidden, it is now un-hidden, measured and re-hidden in one synchronous
step, so nothing is painted in between. Two delimited blocks in `src/layer/10-carousel.js`, switch
`SAFARI_TAB_PROBE_ENABLED`; no sheet code touched. The cause was measured on your iPhone with a
diagnostic bookmarklet, not guessed. See [the bugfix](BUGFIX%20%E2%80%94%20Spell%20Slots%20Tab%20on%20Safari/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,928,189 bytes**, SHA-256 `864c5134126ad8977bc39f764598aeda680c4db964bbafb8a755b88c9e5d4a04` |
| Full QA | **2,123/2,123**: 2,104 retained + 19 new; no retained check changed |
| Old build | The previous build fails **5 of the 19** new checks: exactly the emulated-Safari ones |
| Removal | **Byte-identical** to `8cbfa39` / `339a9590…`; manifest and carousel file identical to that commit |
| Sensitivity | Switch off 14/19; a probe that forgets to re-hide the page 11/19 |
| Fixtures | 13/13 remover fixtures |
| Device | **Confirmed on the iPhone, 24 September**: the Spell Slots tab appears once a Shugenja School is chosen. A re-run of the bookmarklet on a character with no School read `lock=null`, `pageHidden=true`, which is the correct hidden state. User agent: iPhone OS 18_7, Safari 26.6.1 |

**Next:** Phase 11.

## Previous update — 24 September 2026: BUGFIX — Spell Slot Accounting

**Implemented and verified:** both spell-slot bugs from the open reminders, in one folder with a
switch per half. (1) Cancelling at the roll preview now gives back exactly what the cast paid:
an Element slot, a bonus slot, Void Versatility's Ring slot, or Maho Own-Blood Wounds. Cancelling
4.5.2's Willpower check before a cast refunds too; a check that is rolled and **failed** still keeps
the slot, per that release's approved rule. (2) A hand-tapped bonus pip is refused while the shared
pool is full, a take-back changes only the row tapped, and a save that already shows too many pips
gets a warning line and is never repaired automatically (your ruling). It refunds rather than
moving the spend, so every refusal and payment dialog stays where it was, and no A01–A16 release
was edited. See [the bugfix](BUGFIX%20%E2%80%94%20Spell%20Slot%20Accounting/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,927,339 bytes**, SHA-256 `339a9590bb9761441db94abb776afc1df9e260d2647114f6f706d297c011e726` |
| Full QA | **2,104/2,104**: 2,052 retained + 52 new; no retained check changed |
| Old build | The pre-fix build fails **24 of the 52** of the new checks, including each of your exact reports |
| Removal | **Byte-identical** to `c814568` / `3e262b18…`; manifest and both shared files identical to that commit; 2,052/2,052 retained on the removed bytes |
| Sensitivity | Eleven isolated variants each fail only their intended checks (master switch 28/52, refund switch 35/52, pip switch 44/52, no stylesheet 51/52) |
| Fixtures / registry / ownership | 47/47 remover fixtures / seven seats / every reference inside the fix's own blocks |
| Device | **Confirmed on the iPhone, 24 September**: cancel refunds the slot, and a bonus pip is refused when the pool is full |

**Next:** Phase 11, Characters List, Creation Wizard & Save Model.

## Previous update — 24 September 2026: A01–A16 iPhone device pass complete

**Tested on the owner's iPhone:** all sixteen A01–A16 entries, from
`IPHONE-TESTS-A01-A16-2026-09-23.md`, over 23–24 September, with about 150 screenshots. The result,
the triage and Claude's assessment of every suggestion are in
[the device audit](PART%20I%20%E2%80%94%20Phase%204.5%20Remaining%20Configuration%20Audit/IPHONE-AUDIT-A01-A16-2026-09-24.md)
(also published as [an artifact](https://claude.ai/artifact/65AgcyTmmfPL1Ud2n4ag7N)). No code has changed.

| Current snapshot | Value |
|---|---|
| Build | Unchanged: **2,914,055 bytes**, SHA-256 `3e262b18…`; the A13 realm picker opening on the phone confirms the device had it |
| Device result | **16 of 16 work as built.** No defect in any A01–A16 release's own code. The A13 Lost label fix is confirmed at normal size |
| New defect | **A cancelled spell cast still uses the slot**, for every spell (trunk, older than A01–A16; open reminder above). One same-shape case found by reading code (Maho Own-Blood Wounds) |
| Change requests | Twelve, awaiting rulings: the two A03 precepts are the largest (Perfection as a die pick in the result, Will as a prompt when Wounds rise) |
| Answered | A06's rival list audited: 29 of 29 (8 Clans, 14 Minor Clans, 6 Imperial families, the Brotherhood), no extras |
| Not reported | The "Across all of them" checks (save/reload, JSON, rename, wrong list, orientation); A03 Session Resources and Reset; A14's greyed entry; A08's Crane wording |
| Usage | **34% of this week** after the testing session, by the owner's reading (28% at the end of the A01–A16 build). Taken before this write-up. Exact tokens unavailable |

### Device-pass decisions and backlog — 24 September 2026

The owner was concerned that refining finished stages is crowding out the roadmap, and asked for a
short path back to it. **Decided:** fix the one real bug now (a cancelled cast still uses the
slot), together with the bonus-pip bug it shares counters with, then start **Phase 11**. Everything
else below is **parked**, not rejected. Each row keeps Claude's recommendation so it doesn't have to
be worked out again; the reasoning is in
[the device audit](PART%20I%20%E2%80%94%20Phase%204.5%20Remaining%20Configuration%20Audit/IPHONE-AUDIT-A01-A16-2026-09-24.md)
under the S-number given.

| # | Item | Claude's recommendation | Status |
|---:|---|---|---|
| 1 | Order of work | Spell-slot bug first, then the rest | **Superseded:** spell-slot fix (with the bonus-pip bug), then Phase 11; the rest parked |
| 2 | Spell-slot fix and bonus-pip bug in one folder | One folder, two halves that revert separately | **Agreed** — building now |
| 3 | Refund Maho Own-Blood Wounds on Cancel too | Yes | **Included** (no objection) |
| 4 | A save showing more bonus pips than the pool holds | Warn; never remove pips automatically | **Agreed** by the owner |
| 5 | A03 Perfection (S5) | Pick one die in the result window: Skill Rolls only, one die, no +5, pay on confirm; keep the row's Use button for physical dice | Parked |
| 6 | A03 Will (S6) | A line under the Wound bar when Wounds rise, not a pop-up; negate up to 10, never below the pre-hit total | Parked |
| 7 | Bottom **i** in seven pickers (S1, S2) | Remove it; keep each option's own text and the row's **i** | Parked for Phase 15 |
| 8 | A04 court chips and Add court (S7) | Whole chip as the button; Add court on the row; editor keeps rename and remove | Parked for Phase 15 |
| 9 | A09 Courtesy, Honesty, Courage (S8–S10) | Per-roll ticks, not automatic; make the registry's provider-list checks generic first | Parked |
| 10 | A01 Jurojin button (S3) | No button; reword the row reminder with the steps | Parked |
| 11 | A14 bonus-slot spill (S11) | Drop it: no extra casting, only a different row shows the pip | Parked (recommend dropping) |
| 12 | A01 Hotei (S4) | Leave as is until the owner names what felt wrong | Parked, waiting on the owner |
| 13 | A07 Inheritance, A11 Servant (S13) | Nothing now; perhaps the heirloom in Equipment later | Parked, waiting on the owner |
| 14 | Honor, Glory and Status (S14) | Read-only audit first (two unsynced fields per track), then one design decision | Parked until a phase needs to change those fields |
| 15 | Blessing reviews (S15) | Flag a second Blessing; re-price on a Fortune change; a replaced Blessing becomes a locked row that keeps its XP | Parked |
| 16 | Part I wrapper folder | Keep deferring | Deferred; Phase 11 is Part K, so it adds no Part I folder |
| — | Rank 0 dice bug | Fix with the next dice-engine change | Parked (errs in the player's favour) |
| — | L1, Jigoku's Lost wording | "+8 to total — Taint Rank 4 ×2 (Lost)" | Parked for Phase 15 |

## Previous update — 23 September 2026: Phase 4.5.24 Touch of the Spirit Realms — A01–A16 complete

**Implemented and verified:** A13, to the owner's rulings. Ten realms; 5 XP (Toshigoku 8, Yomi 7), a
Shugenja 1 less (4/7/6; the last two are an interpretation, and the row suggests confirming them
with the GM). Automatic: Chikushudo, Yomi (a chosen School Skill), and Jigoku (Taint Rank, doubled
by a Lost tick). Per-roll ticks: Sakkaku, Meido, Tengoku. The other four are reminders. See
[the release](PART%20I%20%E2%80%94%20Phase%204.5.24%20Touch%20of%20the%20Spirit%20Realms/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,914,055 bytes**, SHA-256 `3e262b188a453aed40451a7162a38e90761f6a04b35ea54bf124b9f1309151a2` |
| Full QA | **2,052/2,052**: 2,002 retained + 50 new; two retained provider-list checks made conditional (declared, pass both ways) |
| Removal | **Byte-identical** to `9423585` / `4d112320…`; 2,002/2,002 on the removed bytes; either order with 4.5.23 reaches `985fdeee…`; depends on 4.5.15 (its remover refuses because of this release alone) |
| Sensitivity | Kill switch 6/33; no stylesheet 46/50; nineteen targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Device | 375px rows and picker inspected with fallback fonts (a label-size bug found and fixed this way); iPhone open |
| Usage | The whole A01–A16 session (4.5.14–4.5.24): **28% of this week's allowance**, the owner's reading. Exact tokens unavailable |

**A01–A16: all sixteen delivered.** Still open: the reminders above.

## Previous update — 23 September 2026: Phase 4.5.23 Dark Paragon

**Implemented and verified:** A03, to the owner's rulings. One precept of Shourido; 5 XP (Spider 4);
once per session with a Reset. Control, Insight, Knowledge and Strength offer a reroll in the result
of a matching roll: the reroll stands, +5. Determination is a per-roll tick that removes the Wound
penalty. Perfection and Will have a Use button. Payment happens on confirm: 5 Honor points, or a
Void Point only without them. See [the release](PART%20I%20%E2%80%94%20Phase%204.5.23%20Dark%20Paragon/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,888,142 bytes**, SHA-256 `4d112320eb4c1e9937a280b1e7d3f25ef1d5aff49a5a938e80b351fa329ccac7` |
| Full QA | **2,002/2,002**: 1,935 retained + 67 new; two retained provider-list checks made conditional (declared, pass both ways) |
| Removal | **Byte-identical** to `862dfbf` / `985fdeee…`; 1,935/1,935 on the removed bytes; either order with 4.5.22 reaches `9c749b7d…`; depends on 4.5.15 (its remover refuses because of this release alone) |
| Sensitivity | Kill switch 10/33; no stylesheet 63/67; twenty targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Device | 375px row, result, confirm and reroll inspected with fallback fonts; iPhone open. Exact tokens unavailable |

A01–A16 delivered: A01, A02, **A03**, A04, A05, A06, A07 (reminder), A08, A09, A10, A11 (reference), A12, A14, A15, A16.
Pending: A13 Touch of the Spirit Realms (owner ruling on the Toshigoku/Yomi Shugenja price).

## Previous update — 23 September 2026: Phase 4.5.22 Naishou Citizen

**Implemented and verified:** A08, with a hard dependency on 4.5.21. 3 XP, no config. While it is on
the Advantage list a configured Seven Fortunes' Blessing costs 1 XP less, stacking with the Clan
price and never below 1 XP (Crane Benten: 2 XP). The row names the current Fortune and reminds the
player of the Free Raise on Social rolls with that Fortune's monks. Replace-without-refund is not
built (deferred review item above). See [the release](PART%20I%20%E2%80%94%20Phase%204.5.22%20Naishou%20Citizen/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,854,260 bytes**, SHA-256 `985fdeeeb4888e2d62195b5182481c5f6da053418f0737b00bbacd9c9d8b9a3f` |
| Full QA | **1,935/1,935**: 1,899 retained + 36 new; no retained check changed |
| Removal | **Byte-identical** to `436372a` / `9c749b7d…`; 1,899/1,899 on the removed bytes; 4.5.21's remover refuses while this is present; 4.5.22 then 4.5.21 reaches `10683306…` |
| Sensitivity | Kill switch 10/32; no stylesheet 32/36; eleven targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Device | 375px rows inspected with fallback fonts; iPhone open. Exact tokens unavailable |

A01–A16 delivered: A01, A02, A04, A05, A06, A07 (reminder), **A08**, A09, A10, A11 (reference), A12, A14, A15, A16.
Pending: A03 Dark Paragon and A13 Touch of the Spirit Realms (owner rulings).

## Previous update — 23 September 2026: Phase 4.5.21 Seven Fortunes' Blessing

**Implemented and verified:** A01, to the design agreed with the owner. Seven Fortunes with Rule
disclosures; 4 XP (Bishamon 5), 1 less for the listed Clans. Automatic: Bishamon +1k0 on Strength
Trait rolls, Daikoku +1k1 Commerce, Fukurokujin +1k1 on the chosen Lore Skill. Declared per roll
(unticked every time): Benten +0k1, Ebisu +1k1, Jurojin +2k0, Hotei +10; Hotei also gets a
Contested Void Roll button. See [the release](PART%20I%20%E2%80%94%20Phase%204.5.21%20Seven%20Fortunes%20Blessing/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,846,031 bytes**, SHA-256 `9c749b7dc9c45fc5829f8db3172067d91ced54833e734da4f245d3ddb08528d0` |
| Full QA | **1,899/1,899**: 1,822 retained + 77 new; two retained provider-list checks made conditional (declared, pass both ways) |
| Removal | **Byte-identical** to `5b1fc00` / `10683306…`; 1,822/1,822 on the removed bytes; either order with 4.5.20 reaches `2b69794d…`; depends on 4.5.15 (its remover refuses first) |
| Sensitivity | Kill-switch 19/47; no stylesheet 73/77; sixteen targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Device | 375px picker (all Rules open) and rows inspected with fallback fonts; iPhone open. Exact tokens unavailable |

A01–A16 delivered: **A01**, A02, A04, A05, A06, A07 (reminder), A09, A10, A11 (reference), A12, A14, A15, A16.
Pending: A08 Naishou Citizen (next), A03 and A13 (owner rulings).

## Previous update — 23 September 2026: Phase 4.5.20 Void Versatility

**Implemented and verified:** A14. A Shugenja with a Void Affinity saves one non-Void Ring; casting a
Void spell asks, before any slot is spent, whether that Ring or the ordinary Void flow pays (✕
spends nothing). The Casting Roll is the ordinary Void roll; only the Ring's own counter moves,
never the shared Bonus pool. 4 XP; greyed out in the picker for anyone ineligible.
See [the release](PART%20I%20%E2%80%94%20Phase%204.5.20%20Void%20Versatility/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,820,250 bytes**, SHA-256 `106833069f5bf72a69b185b9d29c85c7f0d1cbf6748bff2195a2581b5d1e8e79` |
| Full QA | **1,822/1,822**: 1,756 retained + 66 new; two retained checks made conditional (declared, pass both ways) |
| Removal | **Byte-identical** to `46b15b4` / `2b69794d…`; 1,756/1,756 on the removed bytes; either order with 4.5.19 reaches `96dda731…` |
| Sensitivity | Kill-switch 15/35; no stylesheet 62/66; twelve targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Device | 375px picker, row and payment dialog inspected with fallback fonts; iPhone open. Exact tokens unavailable |

A01–A16 delivered: A02, A04, A05, A06, A07 (reminder), A09, A10, A11 (reference), A12, **A14**, A15, A16.
Pending: A03, A13 (both need owner rulings), then A01 → A08.

## Previous update — 23 September 2026: Phase 4.5.19 Soul of Artistry

**Implemented and verified:** A12. Pick Artisan or Craft Skills; a matching Skill with no Rank is
rolled as a real Rank 1 roll (Trait + 1 k Trait, 10s explode), with preview, breakdown, Void offers
and dice all agreeing. 4 XP, 3 for Crane or a Courtier. Purchased Ranks and XP never change.
See [the release](PART%20I%20%E2%80%94%20Phase%204.5.19%20Soul%20of%20Artistry/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,798,717 bytes**, SHA-256 `2b69794dcd3bf9d70b8a1676a4f9cb734cf1f4b0ecf7d40b0396d0bae8ef0c3e` |
| Full QA | **1,756/1,756**: 1,664 retained + 92 new; no retained check changed |
| Removal | **Byte-identical** to `fe20e75` / `96dda731…`; 1,664/1,664 on the removed bytes; either order with 4.5.18 reaches `be9076cf…` |
| Sensitivity | Kill-switch 7/24; no stylesheet 88/92; eleven targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Found, not fixed | Rank 0 Skill-table rolls already explode while labelled Unskilled (trunk `rollSkill()`); wants a bugfix folder |
| Device | 375px picker and row inspected with fallback fonts; iPhone open. Exact tokens unavailable |

A01–A16 delivered: A02, A04, A05, A06, A07 (reminder), A09, A10, A11 (reference), **A12**, A15, A16.
Pending: A03, A13, A14, then A01 → A08.

## Previous update — 23 September 2026: Phase 4.5.18 Paragon

**Implemented and verified:** A09 Paragon, reminder only as approved. A picker lists the seven
tenets in printed order with their Core p.152 benefits, nothing preselected; the saved tenet shows
as a badge with one reminder line (its benefit, plus "+1 Honor whenever you gain Honor for showing
<tenet> — add it yourself"). 7 XP, 6 for Lion. No dice, Void or Honor automation, measured.
See [the release](PART%20I%20%E2%80%94%20Phase%204.5.18%20Paragon/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,780,550 bytes**, SHA-256 `96dda731ef0cf9670fe2c65763bf28e2a73698972e7d8f49014ac598c728385a` |
| Full QA | **1,664/1,664**: 1,584 retained + 80 new; no retained check changed |
| Removal | **Byte-identical** to `bfd82ee` / `be9076cf…`; 1,584/1,584 on the removed bytes; either order with 4.5.17 reaches `0aefe9c9…` |
| Sensitivity | Kill-switch 2/11; no stylesheet 76/80; nine more targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Device | 375px picker and row inspected with fallback fonts; iPhone open. Exact tokens unavailable |

A01–A16 delivered: A02, A04, A05, A06, A07 (reminder), **A09**, A10, A11 (reference), A15, A16.
Pending: A12, A03, A13, A14, then A01 → A08.

## Previous update — 23 September 2026: Phase 4.5.17 Wealthy Koku Grant

**Implemented and verified:** A16's owner-approved grant of 2 koku per Rank, and Core p.149's
1-XP minimum (Rank 1 for Crane/Unicorn/Imperial is now 1 XP, not 0). Money moves only on an
explicit action, a receipt in the row's config prevents any re-grant, raising the Rank adds only
the difference, lowering it offers Return/Keep, and older saves are asked rather than assumed.
See [the release](PART%20I%20%E2%80%94%20Phase%204.5.17%20Wealthy%20Koku%20Grant/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,767,985 bytes**, SHA-256 `be9076cfbebc3fac31641a03fab82508b35a7c06caf961e347e546151930115a` |
| Full QA | **1,584/1,584**: 1,497 retained + 87 new; three 4.56 checks made conditional (declared; 29/29 both ways) |
| Removal | **Byte-identical** to `65d2106` / `0aefe9c9…`; 1,497/1,497 on the removed bytes; either order with 4.5.16 reaches `1d8aa345…` |
| Money | Exact Koku asserted after every action from a non-zero start; recalc/reload/import/re-apply never mint; deleting the row never claws back |
| Sensitivity | Kill-switch 10/39; no stylesheet 82/87; "mint while rendering" 57/80; seven more targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Device | 375px rows and modal inspected with fallback fonts; iPhone open. Exact tokens unavailable |

A01–A16 delivered: A02, A04, A05, A06, A07 (reminder), A10, A11 (reference), A15, **A16**. Pending:
A09, A12, A03, A13, A14, then A01 → A08.

## Previous update — 23 September 2026: Phase 4.5.16 Heart of Vengeance

**Implemented and verified:** A06 Heart of Vengeance, the first provider on the 4.5.15 registry.
A rival Clan or faction (open list, with Clans, Imperial families and the Brotherhood suggested),
5 XP or 4 for Spider, and an unticked `Contested against <rival> — apply +1k1` on Skill, Trait,
Ring and manual rolls only. See [the release](PART%20I%20%E2%80%94%20Phase%204.5.16%20Heart%20of%20Vengeance/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,753,162 bytes**, SHA-256 `0aefe9c90c964eb50132bd0782b433648fee31ca069d7fc3a5c35615ea98163a` |
| Full QA | **1,497/1,497**: 1,406 retained + 91 new; one 4.5.15 fixture made conditional (declared) |
| Removal | **Byte-identical** to `45d0f48` / `1d8aa345…`; 1,406/1,406 on the removed bytes. 4.5.15's remover refuses while this is present; this-then-4.5.15 reaches `61de1d40…` |
| Real dice | Declared Skill/Trait/Ring/manual rolls: 6 dice / 4 kept from 5k3; next roll unticked 5/3; attacks offer nothing; two rivals ticked still +1k1 once |
| Sensitivity | Kill-switch 4/25; no stylesheet 87/91; eight targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Device | 375px row and preview inspected with fallback fonts; iPhone open. Exact tokens unavailable |

A01–A16 delivered so far: A02, A04, A05, A06, A07 (reminder), A10, A11 (reference), A15. Pending:
A03, A09, A12, **A16's actual 2-koku grant**, A13, A14, then A01 → A08.

## Previous update — 23 September 2026: Phase 4.5.15 Roll Declaration Registry

**Implemented and verified:** one general mechanism for per-roll "declare it for this roll"
options in the roll preview, built at the owner's decision before A06 Heart of Vengeance. It
ships no production provider, so nothing visible changes yet; A06 is next as its first provider
(4.5.16). The four existing hardwired declarations are unchanged. See [the release](PART%20I%20%E2%80%94%20Phase%204.5.15%20Roll%20Declaration%20Registry/README.md).

| Current snapshot | Value |
|---|---|
| Branch | `claude/amazing-sagan-8p699k` |
| Canonical Phase 0 build | **2,739,496 bytes**, SHA-256 `1d8aa345b8c054cca212bd57a57acb49cb593bf4b7805cec0438a171537a70e4` |
| Full QA | **1,406/1,406**: 1,353 retained + 53 new; no old harness edited |
| Removal | **Byte-identical** to `0055ec5` / `61de1d40…` (2,730,118 bytes); **1,353/1,353** retained on the removed bytes; removable in either order with 4.5.14 |
| Real dice | Declared +1k1 rolls 6 dice / keeps 4 from 5k3; the next roll is back to 5/3; a confirmed declaration cannot reach a roll that skips the preview |
| Sensitivity | Kill-switch 14/26; no stylesheet 49/53; eight targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 47/47, no skips / seven seats / unchanged |
| Usage | Exact tokens unavailable; nothing estimated |

## Previous update — 23 September 2026: Phase 4.5.14 Darling of the Court and Servant

**Implemented and verified:** A04 Darling of the Court and the A11 Servant reference — the
owner-approved first half of the split Stage 2. **A06 Heart of Vengeance is the next, separate
batch**, held for one owner decision: add a fourth hardwired per-name declaration to Phase 3's
(Part G) roll preview, or generalise that hook first. See [the release and regression matrix](PART%20I%20%E2%80%94%20Phase%204.5.14%20Darling%20of%20the%20Court%20and%20Servant/README.md)
and its ROLLBACK.

| Current snapshot | Value |
|---|---|
| Branch | `claude/amazing-sagan-8p699k` (built from `main` at `9dd3fef`, which had not moved) |
| Phase 0 build at that release | **2,730,118 bytes**, SHA-256 `61de1d40772cb00abba41f7ab5d2d151027b3554545d04e4f8bf127d39adaa48` |
| Full QA | **1,353/1,353**: all 1,128 retained checks plus 225 new; no old harness edited |
| Removal | **Byte-identical** to `9dd3fef` / `1e2683d81ddab13662f76c62ca8c595d521d633f6cc66a512169661cd85b8326`, 2,704,237 bytes; retained suite **1,128/1,128** on those exact removed bytes |
| Removal order | 4.5.13 removed while 4.5.14 stays: 225/225 and 992/992. Both removed, either order: byte-identical to `c7063f52…` (2,689,172 bytes) |
| Other checks | Recombine verification and deployment drift check pass; inventory unchanged; ownership scan exits 0 for 4.5.14 and still for 4.5.13; registry stays at seven |
| Remover fixtures | **45 passed, 0 skipped** out of 45 (Linux ran the two real-symlink fixtures Windows skipped last time) |
| Sensitivity | Kill-switch 43/63; no stylesheet 209/225; eight targeted mutations each fail only their intended checks. The first run found a blind spot (duplicate rows tested only unconfigured); seven checks closed it |
| Device status | Browser layouts at 320/375/768/1440px pass; editor and rows visually inspected at 375px with fallback fonts only (loaded webfonts empty). Real iPhone verification open |
| Usage | Exact tokens unavailable to the session; nothing estimated |

Darling keeps every court on one row: 2 XP each, 1 for a Courtier School (a School whose name
or bracketed type says Courtier — untagged Artisan Schools pay 2, a declared interpretation).
One selected court and one persisted "Court in session" toggle drive a readout such as
`Status 3 — counts as 4 at Kyuden Bayushi (in session). Actual Status unchanged.` Status,
Blackmailed and every roll are measured unchanged. Servant is a reference row with the Core
p.153 rules and nine samples; it writes nothing and leaves its cost to the player.

Remaining A01–A16: A06 (above), A03, A09, A12, **A16 Wealthy's actual 2-koku-per-rank grant**
with receipt/reconciliation and the 1-XP minimum correction, A13, A14, then A01 → A08. No D06
Weakness, Hotei or later phase started. A push requests redeployment; it does not prove the host
has deployed or a device has refreshed its cache — the live site is not reachable from the cloud
session that built this, so deployment was not observed.

## Previous update — 20 September 2026: Phase 4.5.13 Named Advantages

**Implemented and verified:** A02 Blackmail, A05 Forbidden Knowledge, A07 Inheritance's
reminder, and A15 Way of the Land. This is the first fresh, small A01–A16 batch, not completion
of the whole list. Source notes were committed and pushed separately in `9a11267` before
implementation. See [the release and regression matrix](PART%20I%20%E2%80%94%20Phase%204.5.13%20Named%20Advantages/README.md)
and its ROLLBACK for full evidence.

| Current snapshot | Value |
|---|---|
| Branch | `main` |
| Canonical Phase 0 build | **2,704,237 bytes**, SHA-256 `1e2683d81ddab13662f76c62ca8c595d521d633f6cc66a512169661cd85b8326` |
| Full QA | **1,128/1,128**: all 992 retained checks plus 136 new checks; no old harness edited |
| Removal | **Byte-identical** to `6005fae` / `c7063f52269c306fcd6596e2103518ff27d4a57b01b0db031115dbb59c58ca15`, 2,689,172 bytes; retained suite **992/992** on those exact removed bytes |
| Other checks | Recombine verification and deployment drift check pass; inventory unchanged; all 19 owned surfaces and 10 external references correctly attributed; registry stays at seven |
| Remover fixtures | **43 passed, 2 skipped** out of 45: OS permission prevented two real symbolic-link fixtures; portable alias checks and a real hard-link fixture passed |
| Device status | Browser layouts at 320/375/768/1440px pass; three phone-width screens visually inspected. Loaded webfonts were empty, so fallback-font only. Real iPhone verification remains open |
| Usage | Exact tokens unavailable. Codex account snapshot at approximately 19:27 UTC: **13% five-hour used, 81% weekly used**. Not a per-batch cost; not comparable to the historic Claude percentage total |

Blackmail records an agreed NPC name/Status without tracking that NPC. Forbidden Knowledge and
Inheritance explicitly disclose that benefits are manual; neither creates Skills or equipment.
Way of the Land offers an optional region. Configs, notes, badges and pricing round-trip through
real save/load and JSON paths. A removed build preserves the four unknown configs and prices,
visibly flagged, including after saving again.

Mutation checks: switch off **12/26** (modal-dependent groups abort), styles absent **128/136**,
Scorpion discount removed **135/136**, optional fields wrongly required **133/136**, inline error
hidden **135/136**. Each targeted mutation fails only its intended checks except the whole-feature
switch, which disables multiple groups. Independent review found and fixed omitted optional-field
validation and a behind-modal error message before the final full run.

Production footprint: one JS fragment, one scoped stylesheet, one guarded six-line seam block,
two manifest entries; no dice-engine or top-level save-schema edits. Remaining A01–A16 work,
including Darling's courts, Heart's per-roll declaration and **Wealthy's actual 2-koku-per-rank
grant with receipt/reconciliation**, is still pending. Perceived Honor is retained, not rebuilt.
No D06 Weakness, Hotei or later phase was started. A push requests redeployment; it does not
prove the host has deployed or a device has refreshed its cache.

This dated repository update is newer than the historical artifact snapshot below. Compare dates
before assuming the external artifact is newer; its remote content has not been edited here.

## Historical snapshot — 17 September 2026

| | |
|---|---|
| Snapshot taken | 17 September 2026 |
| Branch | `main` |
| Phase 0 build | `c7063f52` (canonical LF build; 2,689,172 bytes) |
| Weekly allowance used | **92%** as of the Negative Roll Modifier Display bugfix — project owner's own reading, 17 September. **8% left.** |
| Last change | **BUGFIX — Negative Roll Modifier Display.** A negative flat total modifier was printed with a hardcoded `+`: the roll modal read `Keeping 3 of 5 (suggested 3) + -40 bonus` on a **wounded character with no Disadvantage configured at all**. Pre-existing since Wound Penalties (Part C, Feature 3); Feature 4.5.9 confirmed it as pre-existing and three ROLLBACK files asked for this folder. **The arithmetic was never wrong.** `result.bonus` **sums two unlike things** — the Ten Dice Rule's conversion bonus (always ≥ 0) and the pipeline's `totalDelta` (wounds, firing into melee, a required Raise) — so the number can be net negative and the word in front of it has to follow; that is why this is a *wording* fix rather than a sign fix. **The report understated it:** three sites format that number with a hardcoded `+` and **two are visible**. The keep-note was reported; the **notation line** (`12k4 → 10k5 +-40`) was not, and was found by driving the roll rather than reading the report. Both corrected. The third is **deliberately left alone** — it can only malform when `totalDelta` is non-zero, which is exactly when `attachRollModifierBreakdown()` hides it, and correcting only its sign would leave it calling a wound penalty a *Ten Dice Rule bonus*. **An isolated revert found a real defect in this fix: the kill-switch was decorative**, read 11/12 with it flipped because neither helper consulted the flag; both now return the trunk's own pre-fix formatting when it is off, and the revert reds eight checks (4/12). Positive values are unchanged byte for byte, asserted against a recorded pre-fix baseline. Its remover **restores text rather than only cutting it**, a first for this project, with fixtures asserting the live blocks and the restore table agree. 12/12 own, 992/992 combined, 980/980 removed, 17/17 removal fixtures, byte-identical removal. **Confirmed on the reporting iPhone across two rounds, same day.** First round: `Keeping 3 of 8 (suggested 3) − 10 penalty` and `11k3 → 10k3 −10 (Ten Dice Rule)` — a capped pool with no real Ten Dice bonus, wound-penalty-only. **A second round closed the gap the first left open**, producing the first real-device roll where `result.bonus` is a genuine sum of a non-zero Ten Dice conversion *and* a non-zero `totalDelta`: a 16k8 roll on the same character gave a real **+4** Ten Dice bonus alongside the **−3** wound penalty, net **+1**, rendering as `Keeping 10 of 10 (suggested 10) + 1 bonus` and `16k8 → 10k10 +1 (Ten Dice Rule)` — with Phase 4's (Part G) breakdown panel agreeing throughout (`+4`, `-3`, `Net +1`), confirming two independently-built panels agree on the device as well as in the harness. **Still unconfirmed:** the same mix with the net reversed — a real Ten Dice bonus present but outweighed by a larger wound penalty, so the total reads "penalty" despite a genuine bonus contributing. *Previously:* the Mastery Rank Labelling bugfix, at **4%** |
| Live site | <https://l5r-character-sheet-creator.pages.dev/> |
| Interactive version | [Rokugan Build Ledger artifact](https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk) — same content, but the tick-boxes below actually save there |

> **This file is a snapshot; the artifact is the live copy.** Ticking a box in the artifact does
> not update this file, and editing this file does not update the artifact. If they disagree,
> the artifact is newer — ask Claude to re-export, or tick the boxes here by hand. The roadmap
> at `L5R Character Sheet Phased Roadmap reorder.md` remains the single source of truth for
> *what* the phases are; this ledger only tracks *how far along* each one is.

## Latest review note — the Mastery Rank Labelling bugfix, and the bundle that did not happen

On 17 September the two items Phase 4.5.12 costed and deferred were agreed to ship as ONE bugfix
folder, on the reasoning — still correct — that per-phase *overhead*, not code, is what the ledger's
own spread keeps showing is expensive. **That decision was revisited and the pair was unbundled.**
Two reasons, one of which is new information rather than a change of mind:

1. **The ammo-picker half is blocked on a product ruling** that has not been given: an empty quiver
   should prompt-and-refuse, prompt-with-an-empty-state, or stay silent while the other path
   changes. Bundling would have made the unblocked half wait on the blocked one — and a saving
   cannot be put toward work that cannot start, which is the same trap this ledger flagged about
   putting the bundle's saving toward Hotei.
2. **The mastery half is cheaper than it was costed at**, and this was established by measurement
   before any code was written. Two figures recorded here on 17 September were wrong:

| This ledger said | Measured |
|---|---|
| "printing the granting rank needs a NEW LOOKUP" | It needs a new *derivation*. The lookup exists: the thresholds are the KEYS of the skill's own `dmgBonus`/`explodeOn`/`reductionMod` tables, and `getStructuredMastery()` already returns those tables whole — it was built for Phase 3's (Part G) "Show Structured Mastery" debug button |
| "7 call sites across 3 files" | **Three adjacent lines in one file.** The seven sites are real, but `110-modals-trackers.js`'s debug button already labels correctly ("current rank", "Raw thresholds (all ranks)"), the seam entry is an export not a label, and the two resolution sites were never wrong |

**The ammo picker stays queued, unchanged, and still needs the ruling before it can be costed
honestly.**

### What the Hotei re-measurement found, recorded so it is not re-derived

Also on 17 September, Hotei's blocker was re-measured against Phase 4.5.11's own standing lesson
(*measure before declaring something blocked*). The result is mixed and is worth having written
down:

- **"No structured Void-cost field exists anywhere" is false.** `KIHO_LIBRARY` has one: 73 rows
  carry an `activation` field, 14 non-null, **8 of them naming a Void Point**. And the sheet already
  models a covered activation costing one Void — `VOID_SPEND_LIBRARY`'s seventh entry, *Activate a
  Kiho*, an `immediate` non-roll spend with its own entitlement test and the Brotherhood
  once-per-Round exemption.
- **42 of the 240 described techniques state a Void spend** in a consistent, machine-findable
  phrase — though the descriptions are labelled in-code as paraphrases, so classifying "covered"
  from them would be inventing rules content (Process Requirement #3).
- **The Advantage half of Hotei's surface is empty.** **Zero of `ADV_LIBRARY`'s 73 rows** names a
  Void spend at all. Hotei's rule is "Technique/**Advantage** activations"; on this sheet the
  Advantage half has no referent.
- **The "per-roll declaration" idea is the wrong shape, though the conclusion survives.** Maigo no
  Musha, Ebisu and Jurojin declare at a *roll*, inside Phase 3's preview. Hotei attaches to a
  *spend*, and the covered spends produce no roll at all. It would be a new per-spend declaration on
  the Void card, not a reuse of existing machinery.
- **No collision with the one-roll exclusivity work**, which was the specific worry: the audit
  already exempts ordinary uses like `+1k1`, and those are the `oneRoll` keys while the doubled set
  would be the `immediate` activation keys. The real cost is elsewhere — `consumeVoidPoint()`
  hardcodes `current - 1` and `canSpendVoid()` gates on `<= 0` rather than `<= 1`, so "charge two
  exactly once, checking affordability first" means editing `160-feat-void.js`, trunk code already
  carrying two bugfix folders' blocks, plus the Brotherhood-exemption branch.
- **Estimate: 12–18%**, not the 4–7% a "second half of D04b" suggests. Machinery count, not entry
  count — this ledger's own estimator — puts it in 4.5.10's bracket.

## Latest review note — Phase 4.5.12 (D04b) Real-Device Testing Feedback

On 17 September 2026, D04b (Bishamon) was tested on a live device with full Kenjutsu mastery 
setup (Rank 8, Kyujutsu Rank 1, multiple weapons across damage branches). Three pre-existing 
issues were identified during testing, plus one D04b-specific edge case:

**Pre-existing issues (not D04b-specific):**
1. **Kenjutsu mastery labeling**: The damage preview says "Kenjutsu Rank 8 mastery +1k0" but 
   rank 8 has no mastery (masteries are at ranks 3 and 7). The mathematics is correct 
   (3k2 base + 2 for Strength = 5k2, −1k0 for Bishamon curse, +1k0 for rank 3 mastery = 5k2), 
   but the wording is confusing. This is a trunk roll-preview labelling issue, not a D04b defect.

2. **Arrow ammo picker inconsistency**: When no arrow is equipped in inventory, the sheet skips 
   the "pick ammo" prompt and proceeds directly to range check + roll. When an arrow IS equipped, 
   it asks to pick ammo first. This behaviour should be consistent. Not a D04b issue.

3. **Bow/arrow damage preview clarity**: The reduction for Bow Strength is applied and calculated 
   correctly, but the preview wording could be clearer about which branch is being reduced.

**D04b-specific finding — now FIXED:**
4. **Strength 1 edge case**: at Strength 1 the Bishamon line was absent from the damage modal
   entirely, with no explanation for why the curse had no effect. The dice were correct; the
   silence was the defect, and the reporter's reading was the honest one — a configured,
   paid-for curse with no line in the modal reads as an unimplemented feature.

   Root cause: `api.adjustDamage()` returned `null` whenever the curse cost nothing, and `null`
   was doing **triple duty** across three cases that are not alike — Strength at the floor, a bow
   whose own rating already binds, and Perception/flat-DR weapons where Strength was never in the
   pool. The first two are owed an explanation and the third is not.

   Fixed 17 September: it returns a zero-delta result carrying the reason for the first two and
   still returns `null` for the third, plus the bow wording from item 3 above. **It needed no
   change to `100-dice-engine.js`** — the existing block already treats a zero `rolledDelta` as a
   no-op, measured — so the byte-identical removal proof survived untouched. Own suite 45/45 →
   **51/51**, combined 947/947 → **953/953**, removed **902/902** and the removal rebuild
   `28e01755…` both unchanged. Each of the six new checks was proven able to fail by isolated
   revert. **The corrected wording is not itself real-device confirmed.**

**Costed and deferred (17 September):** items 1 and 2 above were both measured rather than
guessed. Mastery labelling needs a new lookup, not a string change — `getDamageBonus()`
accumulates across thresholds and records nothing about which contributed — and touches 7 call
sites across 3 files. The ammo picker's skip is `ammoTrackingActive()` returning false by design
with an empty quiver, so consistency is a product decision before it is a code change. Each
wants its own bugfix folder.

> **Superseded on both counts, same day.** Item 1 shipped as `BUGFIX — Mastery Rank Labelling`, and
> building it measured *both* figures in the paragraph above as overstated: the granting thresholds
> were already exposed by `getStructuredMastery()` (so no new lookup), and only **three adjacent
> lines in one file** needed changing (the Skill-info debug button already labels correctly). Item 2
> is unchanged and still needs its ruling before it can be costed. See the review note at the top of
> this file.

**Verified working:**
- Katana (melee, Strength branch): curse correctly reduces by 1 rank
- Dai-kyu (bow, Bow Strength branch): curse correctly reduces inside the min() cap
- Han-kyu (bow, boundary case): Bishamon has no effect at higher Strength values where 
  `min(rating, Strength)` caps the pool — this is correct behaviour
- Unarmed strike (Strength branch): curse correctly reduces by 1 rank
- All calculation chains (base → +Strength → −Bishamon → +mastery) verified against preview
- Stacking with other Fortunes confirmed to stack correctly
- Surgical removal proved byte-identical on first attempt

---

## Latest review note — Phase 4.5 remaining Advantages

On 13 September 2026, the sheet-only Phase 4.5 configuration audit was reviewed and several
Advantage decisions were recorded in
`PART I — Phase 4.5 Remaining Configuration Audit/AUDIT.md`.

The user has accepted the remaining recommendations for future Phase 4.5 work, including
lightweight choices and reminders. Blackmail, Forbidden Knowledge, Inheritance, and Way of
the Land are no longer excluded. Servant reference help is approved; its compact record
remains deferred for complexity and does not require a full NPC sheet.

| Advantage | Approved approach / boundary |
|---|---|
| Blackmail | Name and player-entered target Status as agreed purchase details; calculate XP and show a badge. No live NPC tracking, automatic circumstance updates, or use of the player's own Status. |
| Darling of the Court | One row with multiple selectable court badges, one selected court, and one "Court in session" toggle. Show contextual Status +1 without changing actual Status or Blackmailed. Cost per court: 2 XP normally, 1 XP for Courtier; three courts cost 6 XP or 3 XP. |
| Forbidden Knowledge | Free-text subject, optional agreed-effects note, short badge, and examples behind an accessible circled-i icon. Identify Lore/effects as manually managed; no automatic grants. |
| Heart of Vengeance | Save the faction; eligible Skill/Trait/Ring/manual previews start with an unchecked +1k1 contested-roll declaration. No persistent activation or attack/damage/spell effect. Confirm Imperial-family target eligibility; retain Kharmic Tie-style isolation. |
| Inheritance | Named heirloom badge first. A non-combat Skill-roll +1k1 declaration is an optional later enhancement, not part of initial implementation. |
| Paragon | Tenet picker, badge, and concise benefit reminder; Honor awards stay player-controlled. Review future roll support individually by tenet. |
| Servant | Reference/tooltip-first presentation. Compact name/type/specialty/upgrades record with calculated XP is deferred, not inherently outside companion scope. No full NPC/combat/equipment subsystem. |
| Soul of Artistry | Artisan/Craft selection using an authoritative family list; matching unskilled rolls become effectively Rank 1 with full skilled behaviour. Purchased Skill Rank, Insight, and skill XP remain unchanged. Cost: 4 XP normally or 3 XP for Crane OR Courtier, with no stacked discount. |
| Touch of the Spirit Realms | Realm picker, accessible information icons, badge, and benefit reminder. Review automation separately for each effect later. |
| Way of the Land | Optional region name and reminder badge; retain 2-XP base / 1-XP Unicorn pricing. No map, location detection, or automatic navigation adjudication. |

These approvals update the planned approach, not implementation status. The audit addendum
supersedes broader initial proposals and records planned validation/regression coverage.
All additions must retain Phase 4.5-owned persistence, surgical removal, unchanged other-phase
harnesses, and no additional modifier-registry seat. The four decisions below are preserved.

Seven Fortunes' Blessing remains the canonical missing variable-configuration Advantage and
needs source-confirmed Fortune data before implementation.

Follow-up confirmations on 13 September 2026 (documentation only; see the audit for evidence
and proposed QA cases):

- **Naishou Citizen:** keep active Blessing selection separate from purchase accounting.
  Replacing it must not silently refund previous purchases; editing a selection must not
  itself charge XP.
- **Perceived Honor:** verified in the supplied Core Rulebook, printed p.152 / PDF p.155:
  **2 XP per rank**, so ten ranks cost 20 XP. The sheet's current 3-XP catalogue value and
  description are a confirmed data defect pending production correction. Actual Honor is
  unchanged; the higher value is for attempts to discern it.
- **Void Versatility:** verified in The Great Clans, printed p.199 / PDF p.200. Select one
  non-Void Ring at purchase; the Void-casting preview offers ordinary Void payment or that
  saved Ring. Preserve Void casting calculations/effects, eligibility, exhaustion checks,
  and existing shared Bonus-pool warnings/accounting.
- **Wealthy:** now verified in the supplied Core Rulebook, printed p.155 / PDF p.158:
  `XP = rank × 1 − (Crane OR Unicorn OR Imperial ? 1 : 0)`. The discount applies once to
  the total. The user's original formula was correct; only their example mixed ranks with
  koku. Five ranks cost 5 XP normally or 4 XP for an eligible character; the agreed grant is
  10 koku. The catalogue's per-rank discount wording is a confirmed data defect pending
  production correction. See the audit for boundary and one-time-grant QA requirements.

No new implementation or QA pass is claimed by these confirmations.

## Latest review note — Phase 4.5 remaining Disadvantages

On 13 September 2026, the user approved the recommendations for all seven remaining
Disadvantages, with the TN-reporting clarification below. The detailed design, unresolved
rule boundaries, and planned Validation Suite / Regression Matrix coverage are recorded in
`PART I — Phase 4.5 Remaining Configuration Audit/AUDIT.md`.

**TN reporting:** for Ring, Trait, Skill, spell casting, and attack rolls only, represent an
applicable `TN +N` rule as `−N` to the reported total when the GM adjudicates against the
original TN. Keep the preview's actual rule labelled `TN +N`, and show the equivalent result
adjustment transparently. Damage is excluded. With no known TN, report the adjusted number
without inventing pass/fail. When the app knows the TN, apply the penalty once: compare an
adjusted total with the original TN, or the unadjusted total with the increased TN, never
both adjustments together. Required Raises and Free Raises retain their distinct rule
meaning; neither becomes an unexplained flat modifier.

| Disadvantage | Approved approach / boundary |
|---|---|
| D01 — Cursed by the Realm | Realm picker, accessible information icons, badge; include all ten realms: Chikushudo, Gaki-do, Jigoku, Maigo no Musha, Meido, Sakkaku, Tengoku, Toshigoku, Yomi, Yume-do. Automatically target Animal Handling for Chikushudo; use a labelled Taint-resistance roll for Jigoku, per-roll spirit declaration for Maigo no Musha, player-controlled trance / temple conditions for Meido / Tengoku, and a player-triggered Willpower check for Toshigoku. Remaining branches use reminders or verified incompatibility checks; no NPC, location, calendar, or sleep tracking. See audit for exact branch effects and damage-applicability boundaries. Value: 4 XP normally / 5 XP for shugenja. |
| D02 — Dependant | Record the player/GM-agreed XP value, with optional name and note. No invented mandatory tiers or automated campaign consequences. |
| D03 — Doubt | School Skill picker and badge. Each use of the chosen Skill, including relevant weapon attacks, requires one Raise with no benefit. Show that requirement and its TN +5 / reported-total −5 equivalent; account for Raise limits and other declared Raises. Do not apply it to subsequent damage automatically. |
| D04 — Seven Fortunes' Curse | Fortune picker, information icons, badge; scoped automatic effects, declared context, or labelled resistance rolls as appropriate to each branch. Benten / Fukurokujin use the TN-reporting rule above; Bishamon reduces only the applicable Strength contribution to weapon damage; Daikoku's starting-koku reduction happens once; Ebisu requires the player's non-samurai Social-roll declaration; Jurojin supports poison and disease resistance. Hotei is 6 XP instead of the usual 3 XP and requires two Void for covered Technique / Advantage activations, not ordinary +1k1 spending; activation classification, affordability, and exact-once payment require review. |
| D05 — Unlucky | Positive rank input, 2 XP per rank, one session use per rank: rank 5 means 10 XP and 5/5 uses. A GM-invoked result button rerolls the saved pool and original modifiers, keeps the second result in all cases, and spends one use. Do not restart the action, repay its resources, repeat gates, or offer fresh resource spending. Disable the button at zero; provide session reset and manual counter adjustment. |
| D06 — Weakness | Trait picker and badge showing purchased and effective values. Use a separately calculated effective-Trait reduction, preserving purchased Trait and XP records. Review every relevant roll and derived-statistic consumer; do not assume how Insight, dependent Rings, or Ring-derived resources change without resolving those boundaries. |
| D07 — Wrath of the Kami | Element picker and incoming-spell Free Raise reminder. Value: 3 XP normally / 4 XP for shugenja. No automatic +5 to casting, no own-casting or spell-slot change, and no decision on how another caster spends the Free Raise. |

**Confirmed correction pending implementation:** the supplied Core Rulebook, printed p.162,
requires Unlucky to keep the second roll in all cases. The current sheet's "keep worse"
summary and the original audit repeating it are incorrect. This approval records the
correction; it does not claim the production catalogue or reroll behaviour has been changed.

This is design approval only, not implementation completion. No new production work,
Validation Suite execution, or removal proof is claimed. Future work must retain Phase 4.5
ownership in `feature-dependencies.py`, non-colliding markers, guarded hooks, scoped CSS/JS
and persistence, byte-identical surgical removal, unchanged other-phase harness results,
and no additional registry seat or Phase 1.5 pipeline-baseline change. The audit lists the
tests to fold into the current suite before any implementation is called complete.

## What each phase has cost

Recorded by the project owner against their weekly Claude allowance, because build order is
partly a budget decision and the estimates have been wrong in both directions before.

| Week | Phase | Cost | Tokens | Measured? |
|---|---|---:|---:|---|
| w/c 9 Sep | Phases 0, 0.5, 0.6, 0.7, 1, 1.5, 1.6, 2, 3, 4, and a start on 9 | ~75% | | |
| w/c 9 Sep | Phase 5 — Character Creation Linting | ~3% | | |
| w/c 9 Sep | Phase 8 — Casting Diagnostics | ~10% | | |
| w/c 9 Sep | Phase 4.5 — Modal-Configured Advantages/Disadvantages | ~10% | | |
| w/c 16 Sep | Phase 4.5.3 — Configuration Repairs | **8%** | | |
| w/c 16 Sep | Phase 4.5.4 — Configuration UX Pass, plus two real-device corrections | **9%** | | |
| w/c 16 Sep | Phase 4.5.5 — Eligibility Gates, plus the Great Potential skill-picker revision | **7%** | | |
| w/c 16 Sep | Phase 4.5.6 — Perceived Honor and Wealthy | **5%** | | |
| w/c 16 Sep | Phase 4.5.7 — Unlucky, plus the tooltip correction | **12%** | | |
| w/c 16 Sep | Phase 4.5.8 — Dependant and Wrath of the Kami | **4%** | | |
| w/c 16 Sep | Phase 4.5.9 — Doubt, plus a same-day wording correction | **4%** | | |
| w/c 16 Sep | Phase 4.5.10 — Cursed by the Realm (D01), plus two real-device corrections | **18%** | | |
| | **Running total after 4.5.10** | **67%** | | |
| w/c 16 Sep | Phase 4.5.11 — Seven Fortunes' Curse (D04a) | **7%** | | |
| | **Running total after 4.5.11** | **74%** | | |
| w/c 16 Sep | Phase 4.5.12 — Bishamon (D04b, first half), plus a real-device correction | **8%** | | |
| | **Running total after 4.5.12** | **82%** | | |
| w/c 16 Sep | BUGFIX — Mastery Rank Labelling | **4%** | | |
| | **Running total after the Mastery Rank Labelling bugfix** | **86%** | | |
| w/c 16 Sep | BUGFIX — Negative Roll Modifier Display | **6%** | | |
| | **Running total after the Negative Roll Modifier Display bugfix** | **92%** | | |
| 20 Sep (Codex) | Phase 4.5.13 — Blackmail, Forbidden Knowledge, Inheritance reminder, Way of the Land; 1 JS + 1 CSS + 1 shared block, 136 new checks | Unavailable | Unavailable | No exact per-batch meter; 13% five-hour / 81% weekly account snapshot only |
| 23 Sep (Claude) | **One session: Phases 4.5.14–4.5.24, completing A01–A16** — A04, A11, the 4.5.15 registry, A06, A16's grant, A09, A12, A14, A01, A08, A03, A13 (eleven releases, 1,128 → 2,052 checks), plus two trunk-bug investigations and the design/review rounds | **28%** of this week | Unavailable | The owner's reading of the weekly allowance for the whole session; not split per release |
| 24 Sep (Claude) | **A01–A16 iPhone device pass** — receiving and recording the owner's results for all sixteen entries (about 150 screenshots); no code changed | **+6%** (28% → **34%** of this week) | Unavailable | The owner's reading after testing, before the audit and ledger write-up. Same week as the row above |
| 24 Sep (Claude) | **Device-pass audit and ledger write-up, backlog record, and BUGFIX — Spell Slot Accounting** (1 JS + 1 CSS + 2 guarded blocks, 52 new checks) | **+13%** for this row and the two below together (34% → **47%** of this week) | Unavailable | The owner's reading after all three bugfixes were merged and confirmed on the iPhone; one figure, not split per fix |
| 24 Sep (Claude) | **Spell Slots tab on Safari** — diagnosis with the owner on the iPhone (bookmarklet) and BUGFIX — Spell Slots Tab on Safari (2 delimited carousel blocks, 19 new checks); service-worker redirect diagnosed | Inside the +13% above | Unavailable | Not split out |
| 24 Sep (Claude) | **BUGFIX — Service Worker Redirected Page** (3 delimited blocks in Phase 0.6's `sw.js`, 11 new checks) and merge to main | Inside the +13% above | Unavailable | Not split out |
| 24 Sep (Claude) | **Phase 11 (first stage) — Characters List and Save Model** (1 JS + 1 CSS + 2 delimited blocks, 70 new checks) and the roadmap scope rulings | **+4%** (47% → **51%** of this week) | Unavailable | The owner's reading after the build, before any device check |
| 24 Sep (Claude) | **Phase 11.2 (first stage) — Creation Wizard** (1 JS + 1 CSS + 1 delimited block, 43 new checks) | **+3%** (51% → **54%** of this week) | Unavailable | The owner's reading after the build, before any device check |
| 24 Sep (Claude) | **Phase 11.2.1 — Wizard Skills and Advantages** (1 JS + 1 CSS + 1 delimited block, 32 new checks; 11.2's harness moved to title navigation) | **+20%** for this row and the four below together (54% → **74%** of this week) | Unavailable | The owner's reading after 11.2.4 and the Seppun correction; one figure, not split per stage |
| 25 Sep (Claude) | **Phase 11.2.2 — Wizard Free Choices, Spells and Kiho** (1 JS + 1 CSS + 1 delimited block, 51 new checks) and the merge to main | Inside the +20% above | Unavailable | Not split out |
| 25 Sep (Claude) | **Phase 11.2.3 — Wizard Starting Spells** (1 JS + 1 delimited block, 25 new checks) and the Part K removal-fixture repair | Inside the +20% above | Unavailable | Not split out |
| 25 Sep (Claude) | **BUGFIX — Kitsune Shugenja Listed Under Mantis** (one library line deleted, 9 new checks) and the five Part K live fixtures taught to undo it | Inside the +20% above | Unavailable | Not split out |
| 25 Sep (Claude) | **Phase 11.2.4 — Wizard Starting Spells for Every School** (1 JS + 1 delimited block, 71 new checks) and the Seppun correction | Inside the +20% above | Unavailable | Not split out |
| 25 Sep (Claude) | **BUGFIX — Import File Picker Filter** (1 JS + 1 delimited block, 10 new checks), Phase 11 marked complete, and the merge to main | **+3%** (74% → **77%** of this week) | Unavailable | The owner's reading after the iPhone confirmed the fix |
| 25 Sep (Claude, desktop) | **Next-phase assessment**: both local clones synced to `main`, the live build and deploy checked, the kickoff re-derived (Apply School measured at about 45 Schools, not four; D06 and Hotei found missing; Phase 12's surface measured), nine rulings taken | **+2%** (77% → **79%** of this week) | Unavailable | The owner's reading after the assessment, before any build |
| 25 Sep (Claude, desktop) | **QA — Removal Chain Registry, BUGFIX — Apply School Skill Rows** (1 JS + 2 trunk blocks + 1 seam block, 37 new checks) **and the Phase 12 audit**, plus Node and Playwright set up on the desktop | **+6%** (79% → **85%** of this week) | Unavailable | The owner's reading after all three; not split |

The Codex row is separate from the historical Claude running total. **The 23 September row is a
new week's figure**, not added to the 92% above: completing A01–A16 in one session took **28%** of
that week's allowance. By the ledger's own rule it covers the builds but NOT their device
correction, which has not happened yet (iPhone testing is next). Per release it averages about
2.5%, roughly half the 4.5.3–4.5.12 rate. Reusing machinery that already existed (4.5.15's
registry, base 4.5's reroll and seat) did what the lessons below predicted. Device correction is not
included: it has not yet occurred. Historical blank token cells remain unknown, not zero.

**24 September: the iPhone testing is done and the week reads 34%.** The 6 points cover receiving
and recording the results; the corrections they call for, and the bugfixes, are still to come and
are in neither figure. By the rule above, those corrections belong to the A01–A16 work, not to new
work.

**24 September, later: the three bugfixes took the week from 34% to 47%.** The 13 points cover the
device-pass audit and ledger write-up, BUGFIX — Spell Slot Accounting (the cancelled-cast refund
and the bonus-pip guard), the diagnosis with the owner on the iPhone and BUGFIX — Spell Slots Tab
on Safari, and BUGFIX — Service Worker Redirected Page, each through to the iPhone confirmation.
The owner read one figure for all of it, so it is not split per fix. The Spell Slot Accounting fix
belongs to the A01–A16 work by the rule above (it was found in their device pass). The two
iPhone-only bugs (a carousel that could not see a hidden page on Safari, and a cached page that
Safari refused) are older than A01–A16 and were only found because the device pass sent the owner
to the Spell Slots tab. **Lesson: one of the three could not be seen headlessly at all.** A read-only diagnostic bookmarklet run on the phone found the cause in one round
trip, after two rounds of theories had not. When a device shows something the sandbox does not,
measure on the device first.

**25 September, later: the Import fix took the week from 74% to 77%.** Three points for
diagnosing the greyed-out file from your screenshots, a one-fragment fix with 10 checks, adding it
to seven earlier folders' removal fixtures, measuring the export-format observation, marking Phase
11 complete, and the merge. It passed its device check first time. **23% of the week is left.**

**25 September: the rest of the wizard took the week from 54% to 74%.** Twenty points for four
stages and a bugfix: Skills and Advantages/Disadvantages (11.2.1), every free choice, Spells and
Kiho (11.2.2), a School's starting spells (11.2.3), and every Shugenja School's line with the
Kitsune [Mantis] removal (11.2.4), 189 new checks between them (2,236 → 2,425). About four points
a release, against three for the first stage. The spell stages cost more than screens do: each
changed earlier stages' fixtures (the Part K live-removal repair, the Isawa stand-in) and re-ran
every earlier stage's variants, and two variant runs found blind spots that needed new checks.
None of these has had its device check yet; by the rule above, that belongs to these stages.

**24 September: the wizard's first stage took the week from 51% to 54%.** Three points for six
full-screen steps and 43 checks, cheaper than the Characters list because it adds screens and no
rules: every choice goes through controls the sheet already had.

**24 September: Phase 11's first stage took the week from 47% to 51%.** Four points for a new
screen, autosave, share-sheet export and 70 checks. It stayed cheap because it built on save
machinery that already existed (the storage helpers, `collectData`, the index) and changed no
save format. Its device check has not happened yet, and by the rule above that belongs to this
stage when it does.

**Seven point releases on 16 September, against a week that began at 02:00 BST that morning,
then an eighth on 17 September. The project owner's own reading after 4.5.9 was 49% of the
weekly allowance; after 4.5.10 it is 67%, after 4.5.11 it is 74%, and after 4.5.12 it is
**82%** — exactly what the row-by-row figures sum to.**

**4.5.12's 8% covers the build AND its real-device correction, which is the rule this table
already states rather than an exception to it.** The correction was costed at 3–4% before it was
built and came in inside that, so the first ship was the other 4–5% — the same bracket as 4.5.8
and 4.5.9, which is what a phase reusing one existing mechanism costs. Note what the 8% did
*not* have to pay for: the correction needed no change to any shared file, so the byte-identical
rollback and the 902/902 removed suite were re-measured rather than re-established. **A
correction that stays inside its own phase's fragment is roughly half the price of one that does
not** — worth weighing when choosing where a fix goes, not just what it does.

**With 18% left in the week, the two items 4.5.12 costed and deferred do not both fit
separately.** Mastery labelling was estimated at 5–7% and the ammo picker at 8–12% — 13–19% as
two releases.

**Decision, 17 September: bundle them, and put the saving toward D04b's second half.** The two
share no code, but they share every piece of *per-phase overhead* — one bugfix folder, one
marker, one removal proof, one combined-suite run, one real-device round trip instead of two of
each. That is the same economy 4.5.8 and 4.5.9 each got by carrying two Disadvantages for 4%, and
it is the overhead, not the code, that the ledger's own spread keeps showing is the expensive
part. Bundled they are roughly **11–16%**, so the saving is about 2–4%.

Both also came out of the *same* real-device session on Bishamon, and both are corrections to
already-shipped trunk or Part C behaviour rather than new catalogue entries — so one folder
describing "what the D04b test pass found in code this phase does not own" is a truer record than
two folders each describing half of it.

> **Outcome, 17 September: the pair was UNBUNDLED and the mastery half shipped alone.** See the
> review note at the top of this file for why — in short, the ammo half is blocked on a ruling and
> the mastery half was cheaper than costed. The bundling *reasoning* below stands; it was the
> availability of the second half that did not.

> ⚠️ **The vehicle needs checking before this plan is acted on.** D04b's second half is **Hotei**,
> which every prior release has recorded as *source-blocked rather than expensive*: "covered
> Technique/Advantage activations requiring one Void" cannot be identified from this sheet —
> technique descriptions are labelled in-code as paraphrases, 98 of 338 technique names carry no
> description at all, and no structured Void-cost field exists anywhere. **A saving cannot be put
> toward work that cannot start**, so either Hotei's blocker is re-examined first (see below) or
> the bundle's saving simply stays in the week.
>
> **And 4.5.11 wrote down the reason to re-examine it.** That phase declared Ebisu's Social Skill
> list source-gated for the same kind of reason and was wrong — 4.5.2 had already shipped one, as
> `D45.socialSkills`. Its own standing lesson is **MEASURE BEFORE DECLARING SOMETHING BLOCKED**.
> Hotei has not been re-measured against that lesson, and there is a shape the project already
> uses for exactly "the sheet cannot know this, the player can": the **per-roll declaration** that
> Maigo no Musha, Ebisu and Jurojin all ship. Auto-classifying a covered activation is blocked;
> asking the player to declare one, and doubling that Void cost when they do, is not obviously
> blocked at all. That is a ruling to take, not a fact to assume either way.

The spread is the useful part, and it is wide: **4%** bought two whole Disadvantages (twice —
4.5.8 and 4.5.9 both), **5%** bought two rank-priced Advantages, and **12%** bought a *single*
Disadvantage that needed dice-engine integration and a twenty-invocation harness. Entry count is
a poor estimator of cost; *how much new machinery an entry needs* is a good one. Budget the next
batch by that, not by how many catalogue rows it closes.

**4.5.10 is now the most expensive phase of the week at 18%, and worth reading as a warning
rather than as a surprise.** It is one catalogue row — which is exactly what makes it the
cheapest-looking entry on the remaining list and the one that cost the most. Ten branches
behind that row meant ten distinct behaviours to design, build and check, and *nine* of the
final suite's 62 checks are geometry or wording checks that exist only because a real device
disagreed with the sandbox twice on the same day. Against the rule of thumb above: the entry
count said one, the machinery count said ten, and the machinery count was right. Also note
that the 18% covers a full real-device round trip with two corrections, not just the build —
for any phase shipped straight to a live tester, budget the corrections as part of the phase
rather than as a follow-up that costs nothing.

> **On the arithmetic — corrected.** An earlier version of this table carried a discrepancy: the
> w/c 16 Sep rows summed to 45% against a reported running total of 41% after 4.5.8. That 41% was
> a mis-report — the project owner has since confirmed the actual running total after 4.5.8 was
> **45%**, matching the table exactly, and the 41% belonged to the point before it (after 4.5.7).
> Every phase from 4.5.8 onward has now been reported as its own direct figure rather than a
> differenced running total, and the two agree to the percentage point. Worth keeping as the
> standing practice: report each phase's own cost, not just a cumulative total to subtract from.

Phase 5's 3% is the outlier worth remembering: its audit found the machinery already existed and
the phase was mostly consolidation. Phase 4 is the opposite lesson — the roadmap called it "mostly
wiring" and five of its seven factors turned out unbuilt. **The cheap phases are the ones whose
unknowns were resolved before the work started**, which is the reasoning behind measuring first in
4.5.3 and 4.5.4.

## At a glance

| Status | Count | What it means |
|---|---:|---|
| ✅ **Fully done** | 13 | Built, and proven by something other than an assertion (13 phase numbers are listed below, the 4.5.x point releases counting under 4.5; this row read 14 until 25 September) |
| 🔵 **Built, not validated** | 1 | Mechanism works; no evidence from real hardware yet |
| 🟡 **Started, not finished** | 1 | One half shipped, the other half parked |
| ⬜ **Ahead** | 10 | Not started (Phase 10 excluded — deferred by design) |

---

## ✅ Fully done

Built, and proven by an automated harness with a recorded pass count, a byte-identical build
check, or a real device — not by a claim.

**Phase 0 — Source Reorganization** · Part F
Build output **byte-identical** to the pre-split deliverable; behavioural parity harness across
all 14 flows.
*The current trunk — every later phase edits its fragments.*

**Phase 0.5 — Hosting & Deployment** · Part F
Cloudflare Pages rebuilds and redeploys on every push to `main`; the deploy refuses to publish
if its copy doesn't hash identically to the Phase 0 build.
*Repo stays private; the pages.dev link is open and unauthenticated. Two separate facts, and
only the first is enforced by anything.*

**Phase 0.6 — Installable Web App** · Part F
PWA and update harnesses pass, and — the part that matters — install, launch and aeroplane-mode
offline were all **confirmed on an iPhone 16e**.
*The offline case only passed after a real failure was found on that device and fixed. This is
the one delivery phase with genuine device evidence behind it.*

**Phase 1.5 — Roll Pipeline Consolidation** · Part G
**34/34** checks against the modifier registry, every contributor, and stacked combinations.
No production code changed — audit only.

**Phase 1 — UI/UX Foundations** · Part H
**9/9** against the fixed build, and **4/9** against the build that originally shipped — the
harness was made to fail before it was trusted.
*Shipped broken: the first harness asked the code under test whether it was working, so both
halves agreed with each other rather than with reality. Real-device testing caught it. This is
the origin of the project's "a harness must be able to fail — prove it" rule.*

**Phase 1.6 — Combat Tab Streamlining** · Part H
**23/23** checks, plus a full before/after behavioural diff against the rest of the sheet.

**Phase 2 — Quick-Access Sidebar** · Part H
**19/19**, dropping to 12/19 and 18/19 against two intermediate builds each missing one class of
live-update hook.
*Its own harness caught four controls that bypass `recalcAll()` — three before shipping, and the
shared Bonus-slot pool after a real-device tester noticed it missing.*

**Phase 3 — Smart Roll Preview** · Part G
**43/43** checks, dropping to **18/21** (at the 21 checks that existed then) against a build that
commits the Void spend on toggle instead of on confirm, **7/21** with the phase's kill-switch
off, and **32/35** with the Skill-Rank RAW gate reverted. Phase 1.5's pipeline baseline still
reads 34/34.
*The audit found the roadmap's "introduce a RollContext" already built, so this renders the
pipeline's own numbers rather than computing its own. Ticking a Void option in the preview costs
nothing until you actually roll.*

⚠️ *Real-device testing after ship found **two** genuine rules bugs, both in the Void spend list
and both surfaced by the preview showing that list plainly for the first time.*

*First: ticking two one-roll Void options stacked both onto the same roll — an Earth Ring Roll's
`2k2` went to `4k4`. Root cause was two-fold: "+1 Trait" was never a real RAW power (RAW's actual
text is one `+1k1` effect covering Skill/Trait/Ring/Spell Casting rolls), and nothing enforced
"only one of these effects" outside combat.*

*Second: `+1 Skill Rank (0 → 1)` was offered on every roll kind except Damage — including Ring
rolls, which have no Skill Rank at all. RAW restricts it twice in one sentence ("from 0 to 1",
"avoiding Unskilled Roll penalties"), so it applies to a skill-based roll made unskilled and
nothing else. Reported by the project owner's own reading of the rule, which was correct.*

*Both fixed the same session, in `160-feat-void.js` rather than in the preview — the preview
decides what to offer by simulating the real contributor, so fixing the rule fixed the offer
list with no second copy to maintain. See
`BUGFIX — Void One-Roll Effects Not Mutually Exclusive/README.md`.*

⚠️ *A later pass found **two more**, this time in the offer list itself rather than the rules.
`voidKeyWouldMatter()` compared each key against the pool currently on screen instead of the
unmodified one — so once any option was ticked, every other one looked relevant, putting
`+1 Skill Rank` back on trained rolls. And an option refused because you had no Void Points left
vanished silently, which the project owner — who wrote the app — reported as a broken feature.
Both fixed; the harness went 35 → 41 checks. See
`BUGFIX — Void Offer List (Wrong Baseline, Silent Refusal)/README.md`.*

**Phase 4 — "Explain This Roll"** · Part G
**22/22** checks, dropping to **6/22** with the phase's kill-switch off and **20/22** against a
build with Phase 3 removed. Phase 3's own harness reads **35/35 both with this phase present and
with it deleted**.
*The roadmap called this "mostly wiring". The wiring was real but small; the actual gap was that
five of its seven named factors — base dice, Trait, Skill, School bonuses, Affinity — had no
representation anywhere, because a pool reaches the pipeline as two bare integers with its
composition already thrown away. Callers now declare their own parts and the phase shapes them,
never recomputing: what is not declared is not claimed, and parts that don't reconcile print an
honest "Base pool" row instead of a confident wrong one.*

*It also closed a blind spot: the post-roll bar only appeared when a modifier applied, so an
ordinary unmodified roll was the one roll the sheet could not explain.*

*Real-device pass afterwards fixed the two groups colliding onto one line at phone width, and
corrected a comment the breakdown exposed: `Affinity/Deficiency never applies` to Universal
spells was untrue — the code was right, the comment was not.*

**Phase 5 — Character Creation Linting** · Part J
**25/25** checks, dropping to **11/25** with the phase's kill-switch off and **0/1** with its
fragment deleted. The eight other phase harnesses read **identically** with this phase present
and with it surgically removed — and the removed build is **byte-identical** to the build from
before it was added (`50ab1c71`, 2,265,218 bytes both times), which is the strongest form of the
removability claim in this project so far.
*The roadmap called this "consolidation, not writing rules from nothing" and that held: all five
rule families already had working machinery, it just never said anything. Nine rules now report
against the sheet's own deciding code — nothing clamps, blocks or refuses.*

⚠️ *"Over-capped rings" is the one named rule family NOT built: the sheet caps nothing about a
Ring, and the RAW that would say where the cap sits is in the desktop-only sourcebooks. Parked
per Process Requirement #3 rather than invented. Related: the sheet has no "at creation" vs
"in play" distinction at all until Phase 12, so every rule shipped here is one that holds at all
times.*

⚠️ *The audit turned up three pre-existing issues in other Parts' code, recorded in that phase's
README and deliberately not fixed here: the Rings & Traits hint promises you can adjust a Ring
freely when `recalcAll()` overwrites all four elemental Rings unconditionally on every pass; and
two School lookups (`schoolConcreteSkillNames`, `characterCasterLock`) search only the major-Clan
library, so Minor Clan and Brotherhood Schools fall through both.*

**Phase 4.5 — Modal-Configured Advantages/Disadvantages** · Part I
**51/51** legacy checks and **48/48** completion-pass checks pass. The ten unaffected phase
harnesses retain their exact passing totals with Phase 4.5 present and removed, and Phase 1.5
remains **35/35** in both builds. Surgical removal rebuilds **byte-identical** to the pre-phase
build (`9dbaf6c6`, 2,322,320 bytes both times); the canonical expanded build is `4355dec4`,
2,428,891 bytes.
*The original Ring/severity and three roll-effect entries are joined by complete configuration for
Allies, Gentry, Kharmic Tie, Languages, Luck, Magic Resistance, Sacred Weapon, and Great Potential.
Every variable entry is visibly unconfigured and inert until complete; configs, pip pools, and
tagged Clan equipment round-trip through persistence.*

*The original price/options audit remains in the phase README as historical evidence. The
completion pass uses only the user-approved ladders and Clan profiles; no unapproved rule content
is inferred.*

⚠️ *The roll half needed a RULING, not just work: `PREROLL_MODIFIER_REGISTRY` was baselined by
Phase 1.5 at exactly six contributors, and that phase's own comment named 4.5 as one that must
not change it. You ruled the baseline may go to seven. Phase 1.5's check is now written
conditionally on this phase being present, so it reads **35/35 both with 4.5 in the build and
with it surgically removed** — a hard `length === 7` would have broken this phase's own
removability proof.*

✅ *Friend of the Elements grants a **Free Raise**, which is not a dice-pool change — this sheet
has no Raise mechanic to spend one through, and every other Free Raise in the codebase is
likewise descriptive text. It registers an `informational:true` modifier that reports the Free
Raise and moves no dice, asserted by folding it through the trunk's own `applyPreRollModifiers()`
and requiring the pool to come out unchanged. Inventing a dice equivalent would have been
inventing rules content.*

⚠️ *Real-laptop testing found the picker's tiles broken: `LOW 3 PTMEDIUM 5 PHIGH 7 PTS`. The
modal reuses the universal-spell Element picker's markup per the roadmap's "no new modal system",
and THAT picker's tiles are a fixed 78×78 square with a `nowrap` label — right for the one-word
labels it was built for (Air, Fire), impossible for "Medium 5 pts". Reusing markup inherits its
unstated assumptions, not just its look. Fixed with an override scoped to this phase's own grid,
so the trunk's pickers keep the square they were designed around. The check written afterwards
found it was worse than reported — **all 15 options across all six severity entries** overflowed,
Cast Out's worst at 292px in a 78px tile — and drops the suite to 50/51 against a build with the
fix reverted. Nothing in the existing suite could have seen it: every other check reads values,
and this was geometry.*

⚠️ *Still not opened on a phone. `skillPick` is now implemented for Great Potential and reports
both Skill and Void raise limits; `traitPick` remains outside the approved scope.*

⚠️ *The mandatory end-of-phase re-verification earned its place again. `feature-dependencies.py`
reported six of this phase's own CSS rules as owned by `PART J PHASE 5` — whose remover would
have deleted them — because this phase's CSS comment explained its placement with the words
"Part J Phase 5's removal script…", and `MARKER_RE` is case-insensitive, so marker-shaped prose
in a comment is parsed as a real marker. Exactly the trap Phase 8 hit. Reworded, it reports
clean. Review had not caught it.*

**Phase 4.5.2 — Disadvantages point release** · Part I
**163/163** point-release checks pass. The integrated runner folds this suite into the two existing
Phase 4.5 harnesses and all retained phase harnesses; their totals remain unchanged, including
Phase 1.5 at **35/35**. The release adds the eleven approved Disadvantages with explicit refund
logic, guarded effects, player toggles, isolated Willpower gates, schema-3 migration, and visible
unknown-config handling. Full removal from a fresh copy restores the canonical expanded pre-release
build (`4355dec4`, 2,428,891 bytes), and the retained suites read identically. Phobia, Sworn Enemy,
the gates, and the core config each have their own exact marker and removal scope.
Antisocial now uses the supplied authoritative seven-skill list and leaves non-Social Skills unchanged.
See `Versions/PART I — Phase 4.5.2 Disadvantages/README.md` and its regression matrix.

⚠️ *Post-release owner feedback recorded 13 September 2026 — backlog, not yet implemented.*
The configured Advantage/Disadvantage experience needs a follow-up polish and bug pass before this
area should be treated as final UX. Modal tooltip affordances should use a consistent circled "i"
icon everywhere a tooltip appears. Several modal option cards overflow their card bounds on narrow
screens, especially long Skill/tenet labels. Disadvantage card copy should be shorter and closer in
feel to Magic Resistance: compact reminder text plus a badge where possible, with "XP refund" wording
removed or greatly reduced in the UI in favour of consistent language such as "level of phobia",
"level of imbalance", "level of compulsion", or "severity". School-gated entries need an audit beyond
Elemental Imbalance; Friendly Kami is a known example that should be Shugenja-only.

⚠️ *The same feedback pass should also consider broader sheet UX items.* Added Advantages should
appear beneath the add control in natural top-to-bottom order rather than visually building from the
bottom. Advantage/Disadvantage dropdowns need search/filter support. Techniques, Kata, Kiho, and
Spells likely need an expanded picker/filter design, including spell element filters plus text search,
but that implementation should be workshopped before coding. The wound bar has an unwanted surrounding
box. A Dark Mode setting is desired, ideally with an explicit toggle and optional device-theme sync.
Spell-slot accounting has a suspected bug when manual element-slot pips and extra spell slots are
mixed: reducing Water usage after casting beyond Water capacity can appear to release both Water and
Fire slots. Reassess the manual-vs-roll spell-slot model before changing logic.

**Phase 4.5.3 — Configuration Repairs** · Part I
**39/39** checks, dropping to **18/39** against a build with the phase's kill-switch off, where all
21 failures are the original defects reappearing. The removal fixtures pass **14/14**, and surgical
removal rebuilds **byte-identical** to the pre-release build (`27b57eff`, 2,476,062 bytes). Every
retained suite reads **504/504** with this release present and removed alike; combined **543/543**.
*Eleven confirmed defects in already-shipped Phase 4.5 code, all found by the 13 September audit and
each re-verified against the tree before it was written. No new catalogue entry and no new
configuration type: every line exists to make something that already shipped behave the way its own
description already claimed.*

*Two entries were charging the wrong price — a Phoenix Elemental Blessing and a Shugenja Friend of
the Elements both paid 4 where their own descriptions say 3, because only severityTier entries ever
returned a cost. Three catalogue values were wrong against the books: Perceived Honor at 3 XP/rank
instead of 2 (Core p.152), Wealthy's discount described as per-rank instead of once off the total
(p.155), and Unlucky keeping "the worse result" instead of the second roll (p.162). Friendly Kami's
"Shugenja only" was documented in two places and enforced in none. Great Potential's raise-limit
reminder never reached a weapon attack, which is exactly where a Raise gets spent.*

⚠️ *The catalogue corrections fix the LIBRARY, not saved characters. A row a player already added
keeps the cost they agreed at the table; silently repricing a saved character is a data mutation
this release deliberately does not make. An old save will disagree with the Advantage list until
the entry is re-added.*

⚠️ *Lord Moon's Curse is the audit's twelfth confirmed defect and is **parked, not fixed**. Its
severity tier is correct; the full-moon bonus Void Point and rank-scaled Willpower TN are stated
nowhere in this sheet, so implementing them would mean inventing rules content. It now sits
alongside Seven Fortunes' Blessing as source-gated.*

⚠️ *The first removal attempt rebuilt **one byte heavy** — a blank line on both sides of the seam
block left a double blank where the original had one. The harness was green and the ownership scan
was clean; only the byte comparison caught it. Same failure mode as Phase 8's two-byte discrepancy,
and the argument for demanding a byte-identical rebuild rather than a diff that looks right.*

✅ *One fixture correction in Phase 4.5's own harness, listed in 4.5.3's ROLLBACK.md: it configured
Friendly Kami on a character with no School and asserted the bonus applied, which is part of why
nothing ever caught the unenforced requirement. It now applies a Shugenja School and reads 51/51
both with 4.5.3 present and removed — the same precedent Phase 1.5 set when 4.5 took the registry's
seventh seat.*

⚠️ *No sourcebook conformance audit beyond the three passages already verified, and no UX work —
the narrow-screen card overflow, circled-i affordance and "XP refund" wording all remain
outstanding.*

📱 *Real-device pass, 16 September 2026, iPhone 16e, against the live deployed build. All five
price/behaviour fixes confirmed working (Elemental Blessing, Friend of the Elements, Perceived
Honor, Wealthy, Unlucky). Five items recorded as feedback for a later round — see
`PART I — Phase 4.5 Remaining Configuration Audit/AUDIT.md`, "Real-device feedback — 16 September
2026":*

1. *Friend of the Elements' Free Raise note is squished in the **roll preview** at phone width —
   a different screen than the config-picker overflow already on the backlog.*
2. *& 3. Perceived Honor, Wealthy and Unlucky show no modal on the phone. **Confirmed as expected,
   not a regression** — none of the three has a schema entry at all; building one is audit items
   A10, A16 and D05, not part of this release's scope.*
4. *Friendly Kami can still be picked by a non-Shugenja before the inert-with-reason behaviour
   this release added kicks in. Proposed: grey it out in the dropdown itself, matching
   `btnAddSchoolToggle`'s disabled treatment — flagged as a design question bigger than one entry,
   since adopting it raises whether Elemental Imbalance's existing after-the-fact alert should
   change to match.*
5. *Great Potential's Skill field is free text with no link to the character's actual Skills. The
   sheet already has the machinery for a dropdown (`api.skills()` in 209.85,
   `schoolConcreteSkillNames()`) — noted for when this is next touched.*

✅ *Items 1 and 4's geometry are fixed by Phase 4.5.4 below; items 4 and 5 by Phase 4.5.5. Items 2
and 3 remain open, and are the same item — three entries with no configuration handler at all.*

**Phase 4.5.4 — Configuration UX Pass** · Part I
**28/28** checks, dropping to **15/26** against a build with the phase's kill-switch off and
**25/28** against one with its stylesheet dropped from the manifest — two different broken
builds, because this phase has a JS half and a CSS half that fail independently. Removal fixtures
pass **16/16**, and surgical removal rebuilds **byte-identical** to the pre-release build
(`18a740e8`, 2,495,934 bytes) after both same-day corrections alike. Every retained suite reads
**543/543** with the release present and removed alike; combined **571/571**. Live build after
both corrections: **2,515,953 bytes**, `da0db0946afa356df26e9ea79cfb82f87a669d479247ec1ca230e9bb17be7b13`.
*Scoped from measurements at 375px rather than from the reports, which moved it in both
directions.*

*The reported "several overflowing option cards" was down to **one** by the time this phase
measured — Consumed's `Determination — 6 XP`, 165px of text in a 134px box. Phase 4.5's own
override had already handled the rest. "Use a consistent circled-i icon" turned out to need more
than an icon for the ~24 entries offering only a bare `title=` and no other affordance, since
`title=` does nothing without hover. Those now carry a tappable button opening the sheet's
existing info overlay. The `title=` stays, so desktop hover is unchanged, and the button's glyph
is a CSS `::after` so it contributes nothing to the row text several existing harnesses assert
on.*

⚠️ *`white-space:normal` was measured NOT to fix Consumed's label, which is worth recording
because it looked sufficient — the label still ran 165px inside 134px. The text span is a flex
item at `min-width:auto`, which resolves to its min-content width, so it refused to shrink into
the 106px available. `min-width:0` is the actual fix.*

⚠️ *The ownership scan caught this phase handing three of its own CSS rules to Phase 3. The
comment explaining whose class it was styling opened with that phase's name in marker order, and
`MARKER_RE` is case-insensitive, so marker-shaped prose parses as a real ownership marker. **Third
time this project has hit that trap** — Phase 8, Phase 4.5, now this one — and the third time
review missed it and the mechanical check did not.*

⚠️ *Copy shortening was on the same feedback list and is **deferred**, on the project owner's call
once measured: entries run 76–197 characters against Magic Resistance's 151, which that feedback
named as the good example, and only four exceed it. Rewriting rules copy on a marginal case was
judged not worth it yet.*

🔴 *Real-device correction, same day (16 September 2026) — the first cut shipped with three real
bugs, all reported back from the project owner's iPhone 16e. First, its own claim that the tenet
rules were "simply unreadable on touch" **overstated the gap**: Phase 4.5.2 already builds a
native `<details>` disclosure carrying that exact text on every tenet option, with no JS and no
hover dependency, that predates this phase entirely. Adding a second, competing route to the same
text was reported as confusing rather than helpful. Second, that same disclosure's hidden body
text was leaking into the new button's heading — `textContent` traverses a closed `<details>`
exactly as it does visible text — producing a garbled multi-line modal title such as
`"Determination — 6 XPRuleYou cannot spend Void Points…"`. Third, `overflow-wrap:anywhere` did not
just permit last-resort breaking as intended: per spec it also changes a flex item's automatic
minimum size to ignore intact words, so several option cards were sized too small and split
mid-word — "KNOWLEDGE" as `KNOWLEDG/E`, "PERFECTION" as `PERFECTIO/N` — for words that fit their
box fine on their own.*

*All three fixed the same day. The disclosure is now hidden (never removed) wherever this
phase's own button replaces it; the heading is read through a helper that excludes that
disclosure's subtree before reading any text; and `overflow-wrap:break-word` replaces `anywhere`,
verified live via `Range.getClientRects()` on each tenet name rather than a visual read. One
genuine case remained even under `break-word` — "Determination", the longest tenet name, renders
137px wide once its real uppercase-plus-letter-spacing styling is applied, against 106px
available — fixed with a small width increase scoped to `.d45-option` alone, so Phase 4.5's own
Ring/severity tiles keep their original size. Seven new checks were added and run against a
reverted scratch copy before being trusted: all four reproduced the exact reported symptoms,
including the literal garbled string from the screenshot. See the phase's own README,
"Real-device correction, 16 September 2026," for the full account.*

🔴 *Second real-device correction, same day — "Determination" still split, at a different point in
the word, after the 200px fix above shipped. Root cause found via `document.fonts`, not another
pixel probe: this sandbox has no outbound network access, so Google Fonts (`Shippori Mincho`)
never loads here (`fonts` returns an empty set), and every width measured in this phase — 165px,
137px, 200px, all of it — was measured against a browser-substituted fallback serif, never the
font real devices render. **Standing lesson recorded for future geometry fixes in this project:
a pixel cap calculated in this sandbox cannot be trusted for anything that depends on webfont
metrics; prefer a fix that doesn't need to know a word's exact width.** Fixed by giving the option
card the full row width (`width:100%; max-width:none`) instead of any calculated cap — both
affected entries already lay out one card per row regardless of width, so the cap was solving a
problem the layout didn't have. Verified live at `width:100%`: all fourteen tenet names across
both entries measure with 237px of room for a word that measured 137px under the same fallback
font — wide margin, shipped without claiming proof against the real font, only
robust-by-construction. The harness's no-split checks were re-confirmed able to fail by removing
the width override entirely and reproducing the original splits. **Confirmed the same day on the
reporting iPhone 16e:** every tenet name across both entries, "Determination — 6 XP" included, now
renders on one line. See the phase's own README, "Second real-device correction, same day," for
the full account.*

**Phase 4.5.5 — Eligibility Gates + Great Potential Skill Validation** · Part I
**41/41** checks, dropping to **16/37** against a build with the phase's kill-switch off and
**39/41** against one with its stylesheet dropped from the manifest. Removal fixtures pass
**16/16**, and surgical removal rebuilds **byte-identical** to the Feature 4.54 build this release
was added to (`da0db094`, 2,515,953 bytes) on the first attempt. Every retained suite reads
**571/571** with the release present and removed alike; combined **612/612**. Live build:
**2,533,897 bytes**, `0538c4662e19ba633a3faefb8d1111f1b502f557e7f7b935c7fb53ae6570ab7f`.
*The last two open defects on the Phase 4.5 audit. Both reports were overstated, and both were
re-measured before anything was built — the third phase running where the report and the code
disagreed.*

⚠️ *"Friendly Kami can still be selected by a non-Shugenja" was **worse** than reported: the option
was not merely selectable, its configuration modal opened in full on a character with no School at
all. "Great Potential renders a plain text input with no connection to the Skill list" was **half
wrong**: 209.81 already backed it with a datalist of all 44 library Skills. The real defects there
were that the list is the master catalogue rather than this character's Skills, and that the field
accepted anything — `Underwater Basket Weaving` typed, confirmed, and saved as a configured Skill
without complaint.*

🔵 *A design question the audit said to settle first, and it was right to. The sheet already had
**four** different answers to "this will not work": a disabled control plus hint
(`btnAddSchoolToggle`), a disabled option card (4.5.2's deficient-Ring tile), a hard `appAlert`
refusal (Elemental Imbalance), and 4.5.3's allow-then-explain (Friendly Kami) — while the quick-add
`<select>` the feedback was actually about disabled nothing, ever. The project owner chose disable
in the picker as the **standard for every gated entry**, not a Friendly Kami exception. Both
entries now appear greyed with the reason in their own label, because a disabled `<option>` on an
iOS select wheel has no hover, no tooltip and no styling hook — the reason has to be in the text or
it does not exist on a phone.*

⚠️ *The gate rides the recalc cycle rather than build time. `buildAdvDisadvQuickAdd` runs **once**,
at load, but eligibility depends on School, which the player enters later — a build-time flag would
have been right on a fresh sheet and wrong forever after. And the verdict is **not** this phase's:
where Feature 4.53 already owns an entry's rule, this asks 4.53 and supplies only the wording, so
the greyed option and the row explaining itself cannot drift into saying opposite things.*

🔴 *The Skill half was **revised the same day, on real-device feedback**, and the miss is worth
recording because the measurement behind it was sound and still pointed the wrong way. The first
cut kept the text box and only re-sorted the list behind it, reasoning from a real fact — applying
a School does not populate the Skills table for every School; an Isawa Shugenja reports five School
Skills with `#skillsBody` still empty — to the conclusion that a list would be empty for most
characters mid-build. The project owner tested it and said plainly they expected a list of their
Skills with a tick box, one selectable. The error was generalising from one School without driving
the real Apply School flow: a Hida Bushi applied properly appends all six granted Skills as rows,
so the list is populated in the normal case. It is now a single-select card list of the
character's own Skills, School-granted ones first and badged, with an `Another Skill…` card last
that reveals the validated text field — Great Potential names no School restriction in the rules,
and a Skill may be chosen before it is bought. A character with no Skills still gets the plain text
field. The School's `any one Bugei Skill` slot is deliberately skipped by Apply School and reaches
the list once the player adds it.*

⚠️ *A harness bug worth recording because it looked exactly like a product bug. The first cut drove
eligibility by writing to `#f_school`; the value snapped back on the next recalc and the entry
stayed enabled, which reads as latched state in the phase under test. It is not — `#f_school` is a
**display field**, re-rendered from `getSchoolsList()`, which is what `characterCasterLock()`
actually reads. The gate was correct throughout; the harness was driving a control that holds no
state. Recorded in the harness so the next phase does not repeat it.*

🔴 *Known residual, recorded rather than absorbed: Feature 4.5.2's own `appAlert` entry gate for
Elemental Imbalance is untouched, so an imported character carrying that entry without a Shugenja
School still meets the older hard refusal. The picker gate prevents the bad add, which is the path
the feedback concerned; fixing the rest means changing behaviour inside a function 4.5.2 owns.*

✅ *Both halves confirmed on the reporting iPhone, same day. The disabled `<option>`'s rendering —
the one thing this sandbox genuinely could not show headlessly — greys Friendly Kami with
`— Shugenja only` exactly as designed. The revised Skill picker showed a fully-applied Hida Bushi's
six School Skills plus the player's own addition, each badged, `Another Skill…` last, and a
selection committed to a correctly configured entry with a working `Change` control.*

**Phase 4.5.6 — Perceived Honor and Wealthy** · Part I
**29/29** checks, dropping to **3/12** against a build with the phase's kill-switch off and
**28/29** against one with its stylesheet dropped. Removal fixtures pass **16/16**, and surgical
removal rebuilds **byte-identical** to the Feature 4.55 build this release was added to
(`0538c466`, 2,533,897 bytes) on the first attempt. Every retained suite reads **612/612** with the
release present and removed alike; combined **641/641**. Live build: **2,546,662 bytes**,
`5a47ab73eb955fa03edddf9d16c90a4d9a0c6d90c1e679d0665320f963225ca6`.
*Two of the audit's 23 missing configuration handlers (A10 and A16) — rank-priced Advantages that
had sat in the catalogue with an editable points box and no way to record the rank it was meant to
price. Feature 4.53 had already corrected both entries' DATA; this adds the handler those corrected
prices were waiting for.*

⚠️ *The obvious approach was tried first and refused. Phase 4.5.2 exposes a public
`D45.install()` whose `rankPick` already accepts any positive integer with no cap — on paper an
exact fit for "a free-number rank, no invented cap", and a fraction of the code. Driven live, the
modal opened, the input rendered, the config stored, and the row still priced at **0 with no
summary**: `D45.refresh()` opens with `div.parentElement?.id !== 'disadvList'` and renders "This
entry belongs in Disadvantages." That is a deliberate invariant of a Disadvantage-only module, not
something to route around, so the free-number rank was added on the Advantage side instead as its
own `rankFreePick` type. More code, no fighting another phase's rules.*

⚠️ *Wealthy's pricing is the whole point of the entry and the easiest thing to get wrong. Five
ranks cost **5 XP**, or **4 XP** for a Crane/Unicorn/Imperial character — one discount off the
total, not one per rank, which is the reading the catalogue carried until 4.5.3 and which would
have priced this at 0. Rank 1 with the discount costs **0 XP**, and no minimum was borrowed from
another Advantage to avoid that, because the audit is explicit that none exists.*

⚠️ *No money is minted. The koku entitlement is stated in the row as a reminder and nothing more,
which sidesteps the whole repeated-grant lifecycle the audit warned about rather than trying to
manage it. Asserted across a confirm and five recalcs.*

🔴 *The stylesheet check took two attempts, for the SECOND phase running. The first compared the
input against the modal width — `#advConfigGrid` stretches its children either way, so it passed
with the stylesheet dropped. The second measured the input's font size — the base stylesheet
already supplies 16px, so that passed too. Measuring both builds side by side settled it: the base
sheet already gives this input its border, radius, padding, background and font, and the only
genuinely missing piece is the **label**, which inherits 10.56px at 144px wide inside a 291px modal.
Two consequences, both kept — the stylesheet was cut down to only what is actually missing rather
than restating the base, and the lesson is recorded rather than quietly fixed: "a check that cannot
go red is not a check" has now cost two phases running.*

*Perceived Honor's readout is recomputed from `f_honorRank` on every refresh and stored nowhere,
which is what makes it follow the Honor field — change Honor 5 → 8 and the perceived reading moves
to 10 on its own, while actual Honor is never written to. **D05 (Unlucky) stays open**: it is the
third entry with no handler and the only one needing dice-engine integration.*

✅ *Confirmed on the reporting device, same day. A character carrying a **fractional** Honor Rank
(3.5, from the sheet's own Points-to-Rank tracking) surfaced a case that was not deliberately
designed for: Perceived Honor at rank 5 read `Rank 5 — read as Honor 8.5 (actual 3.5, unchanged)`,
correct, since `Number(f_honorRank.value)` never assumed an integer. Wealthy's single discount was
then checked against all three eligible clans specifically — Crane, Unicorn and Imperial each read
`Rank 10 — 9 XP (clan discount −1)` on the device, identically.*

**Phase 4.5.10 — Cursed by the Realm** · Part I
**62/62** checks, dropping to **19/50** against a build with the phase's kill-switch off and
**57/62** against one with its stylesheet dropped. Removal fixtures pass **19/19**, and surgical
removal rebuilds **byte-identical** to the Feature 4.59 build this release was added to
(`a8c63d61`, 2,585,131 bytes). Every retained suite reads **766/766** with the release present and
removed alike; combined **828/828**. Live build: **2,617,077 bytes**,
`812ac85e88be88e261a834330fd976612a467448f5ad63da16c096ee052db13a`.
*D01 — ten realms, one row. Four of the ten branches needed machinery that did not exist; the other
six were nearly free. This is the release where entry count and cost came apart most visibly.*

🔵 *It takes **no registry seat and re-registers nothing**, which is new. Feature 4.5.9 had to
re-register Phase 4.5's own `adv-config` contributor and delegate to the previous one — its own
ROLLBACK calls that "the most important line in this file". Measured before building: entries added
to `D45.modules` are consulted generically by `D45.modifiers()`, which that one existing seat
already reaches. The registry stays at seven, and nothing is wrapped. **Prefer this route.***

✅ *And it makes the convention's hardest rule structural. `D45.modifiers()` returns `[]` for
DAMAGE **before** consulting `D45.modules`, so a damage context never reaches this fragment at all —
proven by a check that wraps the module and asserts it is never entered. Feature 4.5.9 named the
damage leak as the easiest way to get TN reporting wrong, because a damage context carries the same
`skillName` as the attack before it. Here it is impossible rather than remembered.*

⚠️ *`realmPick` was added to `configTypes`, **lifting a constraint Feature 4.5.8 recorded as
absolute**. That release concluded no phase may ever add a type string, because 4.5.2's harness pins
the array exactly and no expected value passes both with a phase present and removed. That is true
of a **constant** expected value and false of a **conditional** one — the shape Phase 1.5 (Part G)
already uses for the registry baseline, on your own earlier ruling that an audit check exists to
notice a change rather than forbid it. The alternative was storing a Spirit Realm under a schema
called `tenetPick`, permanently, in saved character data — and D04's seven Fortunes would have
inherited the same lie. Three harnesses corrected to the conditional shape, each keeping its own
intent; 826/826 present, 766/766 removed.*

🔴 *Two bugs of mine, both caught by measurement rather than review. A **CSS class collision** that
would have shipped: the badge's modifier was `realm4510-<effect>` and Toshigoku's effect key is
literally `check`, so the badge carried the same class as this phase's own button rule. It surfaced
only because the geometry measurement printed each element's tag and class beside its box and the
button's numbers looked like the badge's. And a **harness that hung instead of failing** —
`openPreview()` was an `async` function returning the pending roll promise, so awaiting it waited
for a roll nobody had confirmed; the timeout then reported six unrelated sections as failures.*

📋 *Jigoku's resistance roll is **deferred by your decision**, not an oversight. The audit lists
"resistance roll/TN sourcing" as unresolved and the sheet models no Taint rank anywhere — the only
Shadowlands Taint in the source is a catalogue row. It ships as a badge and a reminder that says
plainly the roll is not automated, with a check on that wording. Finishing it needs exactly one
fact from a sourcebook.*

✅ *The stylesheet-dropped number is **57/60 and not lower on purpose**: exactly the three geometry
checks fail. Both builds were measured side by side before a single geometry check was written.
Two things that looked assertable were deliberately **not** asserted — `.d45-toggle-label` is
identical in both builds because 4.5.2 owns it, and the Toshigoku button is identical except for
one margin because the base sheet's `.ghost` supplies the rest. Fourth phase running that this
practice has earned its keep. A `white-space:nowrap` rule was also written, measured to change
nothing at any width, and deleted rather than shipped as CSS nobody could later tell was dead.*

**Phase 4.5.11 — Seven Fortunes' Curse (D04a)** · Part I
**74/74** checks, dropping to **33/71** against a build with the phase's kill-switch off and
**70/74** against one with its stylesheet dropped. Removal fixtures pass **14/14**, and surgical
removal rebuilds **byte-identical** to the Feature 4.5.10 build this release was added to
(`812ac85e`, 2,617,077 bytes). Every retained suite reads **828/828** with the release removed;
combined **902/902**. Live build: **2,649,854 bytes**,
`28e017553102e860e0212869c80ef4bf90c8abe2127a35ef7b78c3e34dea76d2`.
*D04, first half — five of the seven Fortunes automated, two recorded honestly. The cheapest
release of the run, and deliberately so: every branch reuses a shape 4.5.10 already paid for.*

🔵 *The point of building D01 first, demonstrated. Benten and Fukurokujin are Tengoku's TN-reporting
convention; Daikoku is Chikushudo's named-Skill −1k1; Ebisu and Jurojin are Maigo no Musha's
per-roll declaration. **This fragment introduces no new mechanism at all.** It takes no registry
seat, re-registers nothing, and inherits the DAMAGE exclusion structurally — the route 4.5.10's own
notes said future entries should prefer, used exactly as intended the first time it was reached for.*

🔵 ***The Social Skill list was already built, and the phase was scoped wrongly until it was
measured.*** The audit asks Ebisu to use "the authoritative Social Skill list", the sourcebook PDFs
are desktop-only, and so this looked source-gated the way Jigoku genuinely is. It is not: Feature
4.5.2 has shipped one since it was built — frozen at `209.85`, exposed as `D45.socialSkills`, and
scoped on by Antisocial ever since. Ebisu reads *that* list, so the two entries cannot disagree
about what a Social Skill Roll is, and it ended up **twice** gated rather than once.
**Ten minutes of measurement turned a "blocked" branch into a finished one.**

⚠️ *Daikoku **reminds, it does not debit**, and that is the audit's own safeguard honoured rather
than dodged. It asks for the starting-outfit koku to drop by one "with no repeated debit on
recalc/load and no unexplained subtraction of money already spent in play." Measured: `#f_koku` is
live player-edited **current** money, and a School's starting koku exists only as free text inside
its `outfit:` string. There is nothing idempotent to debit. Feature 4.5.6 reached the identical
answer for Wealthy. The dice half is fully automated; only the money half is a note, and two checks
assert koku survives repeated recalcs and a typed value untouched.*

📋 *Bishamon and Hotei are **deferred to D04b by scoping, not blocked** — both need review the audit
asks for. They stay pickable, priced correctly (Hotei at the sourcebook's 6, not 3) and carry a row
note saying the sheet does not act on them yet. Jigoku's shape, for Jigoku's reason: a
seven-Fortune entry showing five options would read as broken, and a real character could not
record their own curse.*

🔴 ***The live-tree guard in every Part I remover cannot fire, and this release found out the hard
way.*** They resolve it as `parents[3] / "Part F — …"`, but `parents[2]` is `Versions/` and
`parents[3]` is the repository root — so the path never existed and `root != live` was always true.
A run intended to *demonstrate* the refusal instead executed against the live Phase 0 tree and
deleted this release's own two fragments and five blocks. Everything was recoverable and nothing
was lost, but **the safety net has been decorative in all eleven removers since the model was
established.** This one resolves from `Versions/` *and* compares resolved `manifest.json` paths, so
a copy reached by a symlink or a different spelling is refused too; three fixtures pin it. **The
other ten are unfixed** — never hand one a live tree to watch it refuse.

🔴 *A second defect, found by a check written expecting to pass. This is the first entry ever
installed through `D45.install()` whose catalogue name carries a **curly apostrophe**, and D45's
own `norm()` only trims and lowercases — so `Seven Fortunes' Curse` typed with a straight quote
found no schema, and `.en-name` is free text, so a player really can do that. Every earlier
installed name is plain ASCII, which is why it had never been reachable. Worked around inside this
fragment (installs under both spellings; `active()` filters on its own flag rather than a name);
widening D45's `norm()` is the better fix and is declared, not done.*

✅ ***Every check that encodes a decision was proven able to fail*** — and two turned out weaker
than they looked, which is recorded rather than quietly left. Removing *both* damage guards made
only one of the three damage checks go red: the other two are also gated on `skillish`, so they are
sentinels over three layers, not single-point tests. Widening `skillish` as well finally turned all
three red. `F4511-GEOM-03` is the same shape — two of its three assertions hold with the stylesheet
dropped because the base sheet supplies them, and only `flex-basis` is load-bearing.

⚠️ *Not real-device confirmed. Three new pieces of geometry, and the declaration blocks can now
appear **two at a time** in one preview — a layout no previous release produced.*

✅ *Real-device pass, 17 September 2026, iPhone, against the live build. All ten realms confirmed
working correctly for both Shugenja and non-Shugenja pricing — Gaki-do, Sakkaku, Yume-do, Jigoku,
Yomi, Chikushudo, Meido, Tengoku and Maigo no Musha with no corrections needed.*

⚠️ *Real-device correction, same day — Toshigoku's Willpower-check button.* Reported "not in
line." Measured before touching anything: at 375px the row is 303px wide; "Change" and the badge
already use 160px of it, leaving 143px, and the button's own 207px label can never fit — it wraps
on every device, at any width this sheet targets. The bug was never the wrap (shared trunk
`flex-wrap` every configured entry relies on); it was a `margin-left:6px` written on the assumption
the button would sit *beside* the badge, which at this width it never does. Alone on an orphaned
line, that margin read as an unexplained indent. Fixed with a zero-content break span
(`flex-basis:100%`) that forces the line break deliberately, so the button always starts flush left
at its own natural width; `margin-left` became `margin-top`, correct however the row wraps. A new
check (`REALM4510-GEOM-05`) asserts the guarantee and was proven able to fail first — a scratch
copy with the old margin restored drops the suite to 60/61 on that one check alone. Own suite
60/60 → **61/61**; combined 826/826 → **827/827**; surgical removal re-confirmed byte-identical to
the same `a8c63d61` restore point on a fresh copy.*

⚠️ *Second real-device correction, same day, on request — tried inline instead of accepting the
wrap. Measured three shortened labels against the 143px available: "Willpower (TN 15)" (158px,
still too wide), **"Check (TN 15)" (124px, fits)**, "TN 15 check" (115px, fits with more margin).
Shipped "Check (TN 15)" — the row's own text and the button's `aria-label` still say "Willpower
Trait Roll," so the visible label losing that word costs nothing needed. Paired with
`.adv-config-btn`'s own compact sizing, **duplicated rather than shared** (CLAUDE.md's rule: one
class shared between two phases cannot be surgically removed by either), it measures **117px**.
The break span and its margin are **removed entirely, not adjusted**: with no custom margin on the
button, the row's own `gap:8px` supplies correct spacing automatically whichever line it lands on.
Measured on this build: it lands inline, 8px after the badge, ending at 285 of the row's 303px.*

🔴 *This sandbox's measurement is not proof for the real device, and here that actually matters.
Button text passes through the same uppercase-plus-letter-spacing transform that split
"Determination" on Feature 4.5.4's first attempt, at a comparable margin. If the real webfont
renders wider than measured here, it wraps — and because nothing depends on which outcome
happens, that is a size difference, not a bug. The first correction needed no such caveat, because
flush-left held at **any** width by construction; this one is genuinely font-dependent and needs
on-device confirmation regardless of what this measurement says.*

✅ *Same day, also fixed on report: **Yomi's badge read inconsistently with Gaki-do's** — solid and
tinted instead of dashed and transparent, despite Yomi never touching a roll either. Real gap, not
a deliberate choice: the quiet styling only ever covered the `reminder` effect, and Yomi's
`conflict` key had no override, falling through to the "active" look by omission. Widened the
selector to cover both, **deliberately not** widened to Toshigoku's `check` or Maigo no Musha's
`declare` — both of those can produce a real roll or dice-pool change when invoked, unlike Yomi.*

✅ *Both new checks (`REALM4510-GEOM-05` rewritten, `REALM4510-GEOM-06` new) proven able to fail by
isolated scratch reverts — 61/62 in each case, the single relevant check going red and nothing
else. Own suite 61/61 → **62/62**; combined 827/827 → **828/828**; kill-switch-off unchanged at
19/50; stylesheet-dropped 58/61 → **57/62** — grew by two failures for a real reason: the button's
fit and Yomi's badge style are now genuinely CSS-supplied, where the first pass held structurally
regardless of CSS. Surgical removal re-confirmed byte-identical to the same `a8c63d61` restore
point on a fresh copy; retained suites re-confirmed at 766/766 with the phase removed.*

⚠️ *Not yet re-confirmed on the reporting device — this correction, unlike the first, carries a
real chance of needing a further round if the button still doesn't fit on the actual phone.*

**Phase 4.5.12 — Seven Fortunes' Curse: Bishamon (D04b)** · Part I
**45/45** checks, dropping to **24/45** against a build with the phase's kill-switch off and
**41/45** against one with its stylesheet dropped. Removal fixtures pass **16/16**, and surgical
removal rebuilds **byte-identical** to the D04a build this release was added to (`28e01755`,
2,649,854 bytes) **on the first attempt**. Every retained suite reads **902/902** with the release
removed; combined **947/947**. Live build: **2,669,182 bytes**,
`143a4ce7e4a7064e4548fe26d5110aa385f49b7d91617eb1323f8f8c44591219`.
*One Fortune. The cheapest-looking entry left on D04, and the one that found the largest thing.*

🔴 ***Damage rolls do not go through the modifier pipeline, and nobody had noticed.***
`rollWeaponDamage()` never calls `applyPreRollModifiers()`: it rolls `getWeaponDamageDice()`'s
numbers directly and consults the pipeline only *afterwards*, to decorate an already-rendered
modal. Measured by registering a probe returning a real `-3k-1` for `ROLL_KINDS.DAMAGE` — **the
modal printed `PROBE: -3k-1` and the dice rolled the full, unreduced 5k2.** Every 4.5.x entry
before this one reaches rolls through that registry, so the obvious Bishamon would have displayed
a penalty the dice never received *and* satisfied any check that asked `getPreRollModifiers()` and
stopped. That is Part H Phase 1's failure exactly: two halves agreeing with each other rather than
with reality.

✅ *So the reduction lives in the damage maths, and the check that proves it reads **rendered
dice**.* `F4512-ROLL-01` drives a real damage roll and counts what is on screen. A scratch build
that computes the reduced pool, reports it correctly, and rolls the unreduced one drops the suite
to **44/45 on that check alone** — nothing else in the file can see it. That is the strongest
single justification for the design, and it is why the check exists.

🔵 *It takes **no registry seat at all**, which is a better position than Features 4.5.9, 4.5.10 or
4.5.11 could reach — not by care, but because the pipeline is not involved. Phase 1.5's baseline of
seven holds by construction. And it needs **no edit to D04a** despite completing that phase's own
entry: `F4511.FORTUNES` is a live mutable object and `decorate` reaches `decorateRow` by property
lookup, so the spec is retuned in place and the decorator wrapped from outside — Feature 4.5.3's
pattern. Changing the effect key away from `deferred` also switches off D04a's "not yet automated"
note and its quiet dashed badge, without touching that file.*

✅ *The audit's three boundaries were **already separate in the code**, which is why this was cheap.
It keys on the `traitName` the damage function itself reports. **Han-kyu is the sharpest check in
the suite**: bow rating 1, so `min(rating, Strength)` reads 1 at every Strength from 1 to 5 and
Bishamon can never move it — a blanket −1k0 passes every other damage check in the file and fails
only that one. **Unarmed is affected**, measured: it carries no `dmgTrait` key at all, so
`undefined !== null` sends it to the `|| 'Strength'` fallback. **Perception weapons and flat-DR
weapons are untouched.** And actual Strength is never written — measured that lowering it would
move the Water Ring.*

⚠️ ***At Strength 1 the curse costs nothing, and the row says so in those words.*** The sourcebook
does not say what "one rank lower" means at Strength 1. Measured: the Strength input's own minimum
is 1, and an effective 0 makes an unarmed strike roll `0k1`, which `rollWeaponDamage()` refuses
outright — a curse presenting as a broken sheet is worse than one doing nothing. One named
constant, and **the single thing in this release a rulebook could overturn.**

🔴 *A defect found by a check written expecting to pass, and a mistake caught by the removal proof.*
`F4512-ROLL-02` failed: the dice dropped correctly and the modal said nothing about why — the
damage modal has no general explanation channel, because `getWeaponDamageDice()`'s breakdown is
only ever surfaced by the ammo phase's decorator. Fixed with one additive `.roll-note`; the
modifier bar was rejected because it builds a fixed `id` the ammo phase already uses, and an
informational modifier was rejected because it would need an eighth registry seat. Separately, the
first manifest edit used `json.dumps()` and **reformatted the whole file — 465 insertions where
four lines were wanted**, breaking every Part I remover's line surgery. Review and the harness were
both green; only running the removal caught it. A fixture now pins the manifest's compact shape.

✅ *The geometry checks discriminated on the **first** attempt. Both builds were measured side by
side first: the note's width and x position are **identical** with the stylesheet dropped, because
the row's own flex supplies them, so neither is asserted. The stylesheet-dropped build fails
exactly the four checks that rest on `flex-basis`, `margin-top`, `font-size` and `color`.*

📋 *Hotei is still deferred, and is **source-blocked rather than expensive** per the audit:
"covered Technique/Advantage activations requiring one Void" cannot be identified from this sheet —
technique descriptions are labelled in-code as paraphrases, 98 of 338 carry no description at all,
and no structured Void-cost field exists anywhere.*

⚠️ *Not real-device confirmed. One new full-width row note, and one new line in the damage modal.*

**Phase 4.5.9 — Doubt** · Part I
**38/38** checks, dropping to **0/1** against a build with the phase's kill-switch off and
**36/38** against one with its stylesheet dropped. Removal fixtures pass **16/16**, and surgical
removal rebuilds **byte-identical** to the Feature 4.58 build this release was added to
(`e61137ad`, 2,572,964 bytes) on the first attempt. Every retained suite reads **728/728** with
the release present and removed alike; combined **766/766**. Live build: **2,585,131 bytes**,
`a8c63d61a9cd7fed740792ddd38781280b577941dc3947a07f45b2ae009d2abe`.
*D03, and the first implementation of the TN-reporting convention approved back in September. That
is why it was built second in the staged plan rather than saved: D04's Benten and Fukurokujin
branches reuse this machinery, so it is built here on the simplest consumer there is.*

🔴 *The convention's damage exclusion is the easiest thing in it to get wrong, and only measuring
showed why. A DAMAGE roll context carries the **same `skillName`** as the attack before it —
driven live before a line was written. A modifier filtering on skill name alone would have
penalised damage, which the audit explicitly forbids and which would have read as correct in
review. Filter on roll KIND first; the whole SCOPE section is a matrix over every roll kind
because of it.*

🔵 *No new registry seat, contrary to what "it changes a roll" suggests.
`registerPreRollModifier` REPLACES an entry with a matching id, so re-registering Phase 4.5's own
`adv-config` contributor and delegating to the previous one keeps Phase 1.5's baseline at seven.
Worth knowing: the obvious wrapper does NOT work here — the registry captured the function
reference at registration, so reassigning the identifier changes nothing that runs.*

⚠️ *A spell context carries no `skillName` at all (keys: `['kind','round']`), so a skill-scoped
entry cannot reach a casting roll through this pipeline. Stated rather than implied, because
"we support spell rolls" would be a claim this cannot honour.*

✅ *A stale Skill keeps its award and stops applying. Change School and a chosen School Skill may
no longer be one; Feature 4.5.3's principle that this project does not silently reprice a saved
character settles it — the 4 XP stays, the −5 stops, and the badge switches to a dashed untinted
treatment so it cannot be mistaken for the working state. That distinction is exactly what the
stylesheet-dropped build loses, which is what makes the geometry checks able to fail.*

🔴 *Two harness bugs and one bad check, all mine, all sharpened rather than worked around. The
roll driver read an empty modal because `rollWithModifiers()` is async behind Phase 3's preview
gate. The stale-transition check wrote to `#f_school` and expected a Skill to be orphaned — the
SECOND time that display-field trap has caught a harness here, and the code was right both times.
And a verdict check asserted success/fail text that this path never surfaces, so it was testing
the harness's own assumption; it now asserts what the convention actually requires — the penalty
listed once, declared already-included, with the trunk's misleading "Ten Dice Rule bonus" note
confirmed hidden.*

📋 *One pre-existing display quirk found and deliberately NOT fixed: the keep-note renders
`+ -5 bonus`. Verified it predates this phase by rolling a wounded character with no Doubt
present at all, which gives `+ -40 bonus` — every negative total modifier has done this since
Wound Penalties (Part C, Feature 3). It lives in the trunk, outside this phase's marker, and
deserves its own one-line bugfix rather than widening a release whose removal must rebuild
byte-identical.*

✅ *Confirmed on the reporting device, same day, with two wording corrections. The roll preview
and roll result text read as dense and squished — the modifier's note shrank from two clauses
across three lines to `required Raise, no benefit (TN +5)`, with the Raise-limit caveat kept once
in the row's own summary rather than repeated on every roll. The row badge dropped its
`(reported total −5)` suffix, which made it the widest thing on the row, since the preview and
result already show the adjusted total beside the rule; it now reads `Athletics — TN +5`. Both
changes are wording only, inside this phase's own fragment: suite still 38/38, combined 766/766,
removal still byte-identical to the same restore point.*

**Phase 4.5.8 — Dependant and Wrath of the Kami** · Part I
**55/55** checks, dropping to **0/1** against a build with the phase's kill-switch off and
**53/55** against one with its stylesheet dropped. Removal fixtures pass **16/16**, and surgical
removal rebuilds **byte-identical** to the Feature 4.57 build this release was added to
(`ad856e50`, 2,562,091 bytes) on the first attempt. Every retained suite reads **673/673** with
the release present and removed alike; combined **728/728**. Live build: **2,572,964 bytes**,
`e61137adcd8d6b891c17c69a7f498d936dbc36eabf5531e77fa4b36a47496104`.
*D02 and D07, the first two of the six Disadvantages left after 4.5.7 closed D05 — and the first
release of the staged plan agreed on the budget: cheapest and most reusable first, D06 Weakness
left for a fresh week.*

⚠️ *Four premises were driven live before any code was written, and THREE of them changed the
design. D45 cannot host an optional field (`readStep()` requires every step), so Dependant's
optional name and arrangement live on the row rather than in the modal. Neither entry may add a
`configTypes` string, because 4.5.2's harness pins that array exactly — and unlike 4.57's
`R453-CAT-06`, no fixture correction could rescue it, since an exact-array assertion has no
expected value that passes both with a phase present and removed. And `D45.confirm()` would have
written `Rank undefined` into Dependant's legacy display field, because its number is `points`;
the `finalize` hook exists for exactly that.*

🔵 *Wrath of the Kami shares Elemental Imbalance's `elementPick` type, and Elemental Imbalance
carries a pre-casting Willpower gate — precisely the thing this entry must not do. Sharing is
safe because every Elemental Imbalance behaviour is keyed on the NAME: grepped, `elementPick`
appears nowhere outside 209.85. Proven rather than asserted, by diffing the whole character
across configuring it.*

⚠️ *The element list was measured, not assumed. The audit asked for it to be confirmed rather
than taken from the Ring list, and it was right — `RINGS` holds four, Void not being a Ring row.
The sheet's own spell library carries Air 80, Earth 58, Fire 46, Water 43, **Void 30** and
Universal 3, so the picker offers the five castable elements and excludes `Universal` as a
category marker. **A measured decision from the sheet's own data, not a source citation** — the
one thing here a rulebook check could still overturn.*

✅ *"Roughly 2-6" stays guidance. 1 and 40 both price at face value, deliberately and with a
check that says so, because the audit is explicit that the book's examples must not become
mandatory tiers. And the catalogue's 2 no longer shows on an unconfigured row: it reads 0 and
"Needs a choice", the same rule Antisocial, Obligation and Unlucky follow.*

✅ *The geometry checks were written AFTER measuring both builds, and that immediately paid off:
the two optional inputs are 303px wide in BOTH builds, so an input-width check would have passed
with the stylesheet dropped and proved nothing. It was not written. What the stylesheet actually
supplies — a 6px flex column and the badge's box — is what the checks assert. Third phase running
that this practice has earned its keep.*

🔴 *One harness bug, sharpened rather than loosened. The isolation check first expected the whole
character to be unchanged and failed on the XP totals — but taking a 3-point Disadvantage is
SUPPOSED to move those; that is the award. Ignoring XP would have thrown away what the check was
for, so it now asserts the two XP totals are the COMPLETE list of what moves outside the entry's
own row, plus a second check that they move by exactly 3.*

*Not real-device confirmed. **Three constraints on every future `D45.install()`** came out of
this release and are written up in its ROLLBACK for whoever builds D01, D03, D04 or D06.*

**Phase 4.5.7 — Unlucky** · Part I
**32/32** checks, dropping to **2/13** against a build with the phase's kill-switch off and
**31/32** against one with its stylesheet dropped. Removal fixtures pass **16/16**, and surgical
removal rebuilds **byte-identical** to the Feature 4.56 build this release was added to
(`5a47ab73`, 2,546,662 bytes) on the first attempt. Every retained suite reads **641/641** with the
release present and removed alike; combined **673/673**. Live build: **2,562,091 bytes**,
`ad856e506e35121951923e28c907427c273eacf14a490db5d42ad446b2c3f0cf`.
*D05 — the LAST of the audit's 23 missing configuration handlers, and the only one of the final
three that needed dice-engine work rather than a badge. **With this shipped, every finding on the
Phase 4.5 audit is either built or explicitly parked.***

⚠️ *Two numbers that are easy to conflate, and the audit said so: 2 XP per rank, and ONE use per
rank per session. Rank 5 is 10 XP and **5/5 uses, not 10/10**. There is a check for that
specifically, because the award and the resource scale off the same rank without being the same
number.*

✅ *"Keep the second result even when it is higher" cannot be proven by one roll — whether the
reroll comes out higher is chance. The check invokes **twenty times** over a real exploding pool,
asserts the displayed total equals the reroll every single time, then separately asserts at least
one reroll actually came out higher so the branch was reached. Measured: **15 of 20 rerolled
higher, and all 15 were still kept.** Nothing is stubbed.*

⚠️ *Nothing is re-paid by a reroll, and the proof is structural rather than a checklist. It reuses
Phase 4.5's own `advConfigLuckRerollResult()`, which re-rolls the SAVED pool and re-applies the flat
modifiers already in the first result — it never re-enters the action, so no spell slot, Void point,
Willpower gate or limited resource CAN be charged twice. Asserted by diffing the entire character
before and after an invoke and requiring the only changed path to be Unlucky's own counter, which
would also catch a cost added years from now that nobody here thought to name.*

🔵 *This one belonged on Phase 4.5.2's D45 seam and Feature 4.56's did not — the seam's rule working
in both directions, not an inconsistency. `D45.refresh()` requires a d45 entry to sit in
`#disadvList`: Unlucky is a Disadvantage so it satisfies that and inherits the whole
rank/validate/resolve/decorate surface free, while Perceived Honor and Wealthy are Advantages and
needed the Advantage-side path.*

⚠️ *A cross-phase fixture correction, declared in this phase's ROLLBACK. Feature 4.53's
`R453-CAT-06` added an UNCONFIGURED Unlucky row and asserted its cost box read 2 — true only while
Unlucky had no handler. It now reads 0 and "Needs a choice" until a rank is picked, the same rule
Antisocial and Obligation already followed (both verified on the live build) and 209.8's own stated
principle that "a variable price is not a provisional price". The check's intent is unchanged and
now proven through the live pricing path; the corrected fixture passes both with this phase present
AND removed, which the original could not have done.*

✅ *The stylesheet check discriminated on the FIRST attempt this time — both builds were measured
side by side before the check was written, which is what the two previous phases had to learn the
hard way.*

✅ *Confirmed on the reporting device, same day, with ONE correction. All three row controls —
`−`, `+` and `Reset session` — carried a Feature 4.54 circled-i, because that phase decorates any
element with an explanatory `title=`. Right for a rules tooltip a phone cannot otherwise reach,
wrong for three small controls whose own labels sit inches away. Each description moved from
`title` to **`aria-label`**: 4.54 selects on `[title]`, so nothing is decorated now, and the
accessible name survives — a screen reader announcing "−" with no description would be useless.
`UNLUCKY457-MANUAL-06` pins all three properties and was proven able to fail by reverting the
attribute. The result-modal invoke button was never affected; 4.54 does not watch the roll modal.
**The reroll behaviour is device-confirmed; this correction is headless-verified only.***

**Phase 8 — Casting Diagnostics ("Why can't I cast this?")** · Part J
**36/36** checks, dropping to **15/36** with the phase's kill-switch off and **33/36** against the
build the Universal-spell correction replaced. The surgical removal still rebuilds
**byte-identical** to the pre-phase build (`71ab9e17`, 2,289,334 bytes both times), and the eight
other phase harnesses read identically with this phase present and removed.
*A spell entry now says whether you could cast it RIGHT NOW. The audit found that every casting
restriction in the sheet is enforced at ACQUISITION time and none at cast time — `castSpell()`
checks only whether a slot is free — so a character who since took a Bushi School or lost School
Rank kept a working Cast button for a spell the picker would now refuse. Nothing had ever asked
"can you cast this now".*

*Built as an OPEN REGISTRY, modelled on the roll pipeline's `PREROLL_MODIFIER_REGISTRY`, because
Phase 6 is a declared dependency that is source-blocked. Phase 6 will register a contributor
rather than edit this fragment, and may either add a reason or SUPPRESS one — a suppressed
blocker is rewritten as a visible "lifted" note rather than vanishing. Six checks drive that seam
directly, so the contract Phase 6 is promised is tested before Phase 6 exists. **This inverts the
roadmap's declared dependency direction** — Phase 6 will softly need Phase 8, declared in this
phase's ROLLBACK.md.*

*Reports; never blocks. The Cast button behaves identically with the fragment present or deleted.
Deliberate: shipping without the SynergyEngine means over-reporting is a known state, and
over-caution that only prints text is recoverable in a way that over-caution wired into the Cast
button would not be.*

⚠️ *Three ownership bugs in one phase, none caught by review, all three caught by the mechanical
checks — which is the argument for the end-of-phase rule made again. The CSS block was first
written between Phase 5's block and the trunk's Print banner, so Phase 5's own remover refused to
run. `feature-dependencies.py` then reported this phase's whole seam block as owned by a
`PART G PHASE 6` that does not exist, because its marker regex is case-insensitive and this
phase's own prose said "Part G Phase 6". Fixing that by rewording rewrote one line of ANOTHER
phase's comment — caught only because the removal rebuilt two bytes heavy, exactly the length
difference between the two spellings.*

⚠️ *One scope addition beyond the roadmap's six reasons: `no-slots`. It is the only refusal the
sheet actually enforces at cast time, so omitting it would have left the report silent about the
one thing that stops a cast today. And "wrong element" has no single-Element case in this sheet's
rules — it covers the Universal-spell Element pick only, rather than inventing one.*

⚠️ *Real-device testing then found the `no-slots` rule **skipped Universal spells entirely**. The
tester spent every Earth slot AND the whole shared bonus pool on Commune; `castSpell()` correctly
refused, and the report said nothing about slots. The original reasoning — "the pool spent is not
known until the player picks an Element" — was wrong: the pool is not unknowable, it is plural.
The rule now enumerates every Element the spell could be cast in and reports a **note** (some
Elements out, others open), a **caution** (all out, bonus pool left) or a **blocker** (all out,
bonus spent). An Element already ruled out by `wrong-element` is never counted as a way to still
cast it — asserted against the School's own raw deficiency field, not assumed.*

✅ *A second report from the same session — the Void "+1 Skill Rank" option appearing on a Spell
Casting Roll — turned out **not to be a regression**. It was a **stale cached build**: that
screenshot's label existed only between commits `097fe36` and `6ddf39d`. Measured against the
current build across every roll kind, including the reporter's exact ticked-first state, the
option appears only on an unskilled skill roll. No production code changed — but the coverage gap
was real, so Phase 3's harness went **43 → 50**, reading 38/50 against a build with the roll-kind
gate reverted. Worth remembering: a stale service worker can make a fixed bug look live.*

**Phase 11 — Characters List, Creation Wizard & Save Model** · Part K
Built in stages: the Characters list and save model (70 checks), then the wizard as 11.2 to 11.2.4
(43, 32, 52, 25 and 71 checks), each removing byte-identically; **2,435/2,435** combined with the
Import File Picker Filter fix. **Confirmed on your iPhone and laptop, 25 September:** the list,
opening, Save As a copy, Export JSON, Import JSON, and a character made through the wizard.
*Export to PDF is Phase 11.1, not started. Play mode and the toolbar's replacement are Phase 12.*

---

## 🔵 Built, not yet validated

The mechanism is built and its automated side passes. What's missing is evidence from actual
hardware — and this project's own history says that gap is where the bugs live: the first
real-device test found two in an afternoon.

### Phase 0.7 — Native Android App · Part F

Capacitor wrap; the APK compiles in GitHub Actions and the staged page hashes identically to the
website's. None of that proves how a phone behaves.

Full instructions for each test are in
`Part F — Cross-Platform Delivery/PART F — Phase 0.7 Native Android App/qa/MANUAL-TESTS.md`.
Report failures by **test number** and **what you saw**.

- [ ] **1 · It installs** — Android will refuse first and offer a settings link; that's expected
      outside the Play Store. Passes when it appears in the drawer as "L5R Sheet".
- [ ] **2 · Icon and splash look right** — samurai artwork, not a generic robot. All five element
      mons down the left, nothing clipped. Worth noting whether your launcher shows it as a
      circle, squircle or rounded square — the icon is built to survive all three and this is the
      only way to confirm it does.
- [ ] **3 · It fills the screen** — no address bar, nothing identifying it as a web page.
- [ ] **4 · It works with no network** — aeroplane mode, WiFi off, swipe it from recents, reopen.
      Everything is inside the APK, so this should work on the very first launch. If it doesn't,
      that's a real defect.
- [ ] **5 · Characters survive closing the app** — make one, force-close, reopen.
- [ ] **6 · Characters survive an app update** — *the one most likely to fail.* Needs two APKs, an
      earlier and a later build. Install over the top and check your characters are still there.
- [ ] **7 · It survives a reboot** — restart the phone, open the app, characters intact.

---

## 🟡 Started, not finished

### Phase 9 — Polish & Immersion · Part H

**Built and verified:** Clan-themed UI skins — **17/17** checks, dropping to 16/17, 15/17 and
12/17 against three scratch builds each missing one thing (a safety-colour protection, the
Void-pip recolour, and the phase's own kill-switch). Per-Clan override of the sheet's `--shu*`
tokens, plus the ink-brush mon watermark and tab-bar colophon. Three mockup rounds settled the
treatment before any code was written.

**Outstanding:**

- [ ] **School-specific flavour text** — *desktop session required.* Blocked on source material,
      not effort: the sourcebook PDFs are gitignored and desktop-only. 61 major-clan and 22
      minor-clan schools, none carrying a description field today. Scope measured and four open
      decisions written up in that phase's `DESKTOP-HANDOFF — School Flavour Text.md`.
- [x] **Void pip should stay grey** — ✅ **done.** `.void-pip` now reads `--void-slot-color`, the
      same token the Void spell-slot pip and Void bonus pip already used, rather than the brand
      accent `--shu` that every Clan theme overrides. Fixed in the trunk's own rule rather than
      as a Phase 9 exception, so it holds with no Clan applied too — and survives this phase's
      removal, which is declared in its `ROLLBACK.md`.
- [ ] **Colophon placement** — parked feedback. Looks odd sitting behind the tab bar and "sort of
      breaks" on the Identity tab; not yet root-caused.
- [ ] **Floating-button clutter** — parked feedback, and an open design question rather than a
      bug: three fixed controls now share a narrow screen and sometimes overlap readable fields.

All three feedback items are recorded in full, in your own words, in
`Part H — Sheet UI-UX/PENDING FEEDBACK — Real-Device UX Notes.md` — one now marked done, the
other two parked at your explicit instruction rather than blocked on anything.

---

## ⬜ Ahead

In Recommended Build Order. **Phase 12 is next to build** (agreed 25 September, audit first). Phase 6 comes earlier in the order but remains source-blocked.

> **Phase 5 was built ahead of Phase 6, deliberately.** The order below puts 6 at position 12 and
> 5 at position 13, but Phase 5 has no hard dependency of its own and Phase 6 turned out to be
> partly source-gated: a `SynergyEngine` has to scan techniques, and of the **338** technique
> names the School libraries reference, **98 carry no description at all** (they render a "check
> the official rulebook" fallback) while the other 240 are explicitly labelled in-code as
> *paraphrases, not exact rules text*. Building a stacking-detection engine on that would mean
> inventing rules content, which Process Requirement #3 forbids. Phase 6 is cheaper and safer
> once the sourcebooks are reachable from a desktop session.
"Partly built already" is the roadmap's own note that the machinery exists and the phase is
really an audit-and-extend rather than a fresh build — though Phase 4 is a caution about taking
that note at face value: it was marked that way and still turned out to have five of its seven
factors unbuilt. **Phase 7 deserves that caution specifically:** its JSON export/import and
schema-versioning do exist, but `AuditLog` returns zero hits anywhere in the codebase and there is
no general migration machinery — Phase 4.5.2 wrote its own private schema-3 adapter for its own
data. Both of that phase's named deliverables are absent, and it carries an unresolved scope
question (whether export/import needs a shell-aware abstraction now that 0.6 and 0.7 exist) that
is flagged *pending approval* in the roadmap and would need settling before any code.

> **The remaining Phase 4.5 scope is not in this table:** D06 Weakness (approved approach, needs
> boundary rulings, not built) and Hotei, D04b's second half (recorded as source-blocked). Everything
> else in the audit's configuration scope shipped as 4.5.3 to 4.5.24, A01–A16 being completed on 23
> September, and the modal-overflow finding (#11) was fixed by 4.5.4. Ruled 25 September: D06 and
> Hotei come after Phase 12's first build stage. (Until 25 September this note described the scope
> as it stood after 4.5.3.)

| Phase | Name | Part | Note |
|---|---|---|---|
| 6 | Kata/Technique Synergy Detection | G | Source-blocked (needs the sourcebooks) |
| 7 | Data Integrity & Persistence | J | Partly built already |
| 4.6 | Alternate Paths — All Classes | I | Needs sourcebooks |
| 4.7 | Advanced Schools | I | Needs sourcebooks |
| 4.8 | Ancestors | I | Needs sourcebooks — you have this material |
| 11.1 | Export to PDF | K | Split out of Phase 11 on 24 September; added to this table 25 September, when it was found missing |
| 12 | Play Mode / Management Mode Split | K | **Audit done 25 September** ([the audit](PART%20K%20%E2%80%94%20Phase%2012%20Play%20and%20Management%20Modes%20Audit/AUDIT.md)); build from next week, about 17–27% over three stages; all four rulings taken 25 September |
| 13 | Library (Sourcebook Viewer) | K | Needs sourcebooks |
| 14 | Comprehensive Search | K | Needs Phase 13 |
| 15 | UI Consistency Pass | H | Built dead last, by design |

**Phase 10 — Future Expansions (Equipment)** sits outside this count: deferred by design, not yet
assigned a Part, nothing scoped to build.

---

## Also shipped, outside the phase numbering

**The removability contract.** Phases 1, 2 and 9 were hardened so any one can be surgically
removed without touching the others — guarded hooks, per-phase comment markers, and a
`qa/feature-dependencies.py` check that attributes every reference to whichever phase owns it.
Proven by removing each in a scratch copy: the other two passed in full every time (9/9, 19/19,
14/14 in every combination). It is now the standing rule in `CLAUDE.md` for all future features,
including how to declare a genuine dependency between two of them.

**Bugfixes** landed outside the numbering: eleven `BUGFIX` folders at the last count (25
September), listed in `CLAUDE.md`'s folder map, plus the scroll-to-top button that shipped broken.
(This paragraph said "three" until 25 September.)

---

## Keeping this current

Re-export it by asking Claude to refresh the ledger — it reads the tick state from the artifact
and regenerates this file. Or tick the boxes here by hand: they are ordinary GitHub task-list
checkboxes and editing the file is enough.

`BUILD-LEDGER.html` beside this file is the source of the published artifact. GitHub will show it
as source rather than rendering it — open it locally, or use the artifact link at the top. Its
tick-boxes only persist inside the artifact runtime, so a local copy behaves as a static page.
