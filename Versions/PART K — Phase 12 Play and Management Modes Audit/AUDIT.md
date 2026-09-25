# Phase 12 — Play and Management Modes: the audit

Written 25 September 2026, before any Phase 12 code, as the first deliverable the owner agreed that
day. **Documentation only: nothing in the sheet changed.** Measured against build `0dcb56e8…`
(3,072,896 bytes, after BUGFIX — Apply School Skill Rows).

It answers four questions: what every editable control is, which mode each belongs to under the
owner's rulings, how "inert in the underlying function" can actually be enforced in this sheet, and
what the build will cost.

## The owner's rulings this audit applies (25 September)

1. A character opens in **Play** when opened from the Characters list or finished in the wizard;
   **Management** otherwise (a blank sheet, a load through the old toolbar) until the toolbar is
   replaced. The mode is **never saved into the character**.
2. The roadmap's per-tab table, plus three rows it lacked: **Clan & School** read-only in Play,
   **Rings & Traits** read-and-roll in Play, **Spell Slots** fully usable in both.
3. **In-play controls stay live in Play.** On Advantages & Disadvantages, "read only" means no add,
   remove or configure.

## How it was measured

- `qa/inventory-controls.js` loads the build twice (a Mirumoto Bushi and an Isawa Shugenja, the
  second so the Spell Slots tab renders), applies the School, adds one of every hand-made row, and
  lists every input, select, textarea and button on each of the ten carousel pages (clones
  excluded). The raw result is `qa/inventory-0dcb56e8.json`.
- Controls that the Part I releases build on **configured** Advantage and Disadvantage rows only
  exist once a row is configured, so they were read from each fragment's source instead
  (`createElement` sites and the class, label and `aria-label` each is given).
- The retained harnesses were searched for the paths that would land them in Play.

## What the sheet is made of, for this purpose

**The character's state is its own form controls.** `collectData()` reads the inputs; there is no
separate model. A Skill's rank is the value of its `.sk-rank` input, not a field behind a
`raiseSkill()` function. And most edits are **anonymous listeners** attached where the row is built
(`makeSkillRow`, `makeEntry`, `makeWeaponRow`, `makeEquipRow`). About 270 click listeners and 70
change/input listeners sit across 48 fragments.

So the roadmap's "a hidden rank-up function must not be triggerable via any other path" cannot mean
"gate the function": for most edits there is no function. What can be enforced is that **no user
event reaches a Management control while in Play**, which covers typing, clicking, and a script's
`.click()` or dispatched event, since all of those arrive as events. The sheet's own code writing a
value directly (loading a save, autosave, a Void spend, Dark Paragon's Honor payment) is not a user
path and must keep working in Play. **This is the interpretation the build would test**; see
"Rulings needed" below.

## The controls, tab by tab

Counts are for the Mirumoto Bushi with one of each hand-made row. *M* = Management only (hidden and
inert in Play); *P* = works in Play (and in Management); *I* = information only, harmless in both.

### Clan & School (6 kinds, 6 controls) — read-only in Play

| Control | Mode |
|---|---|
| `#cfs_clan`, `#cfs_minorClan`, `#cfs_family`, `#cfs_school`, `#cfs_applyFamily`, `#cfs_applySchool` | M |
| `#cfs_affinityBadgeBtn` (Shugenja only, "Tap for details") | I |

### Identity (23 fields) — read-only in Play, with one question

| Control | Mode |
|---|---|
| `#f_name`, `#f_gender`, `#f_age`, `#f_rank`, `#f_insight*`, `#f_xpTotal`, `#f_xpAdjust`, `#btnAddSchoolToggle` | M |
| `#f_clan`, `#f_family`, `#f_school`, `#f_xpSpent`, `#f_xpRemain` | already displays; stay read-only |
| `#f_honorRank`/`#f_honorPts`, `#f_gloryRank`/`#f_gloryPts`, `#f_statusRank`/`#f_statusPts`, `#f_taint` | **Ruling needed.** These change *during* play (Honor lost, Glory gained, Taint from Jigoku). The roadmap puts Identity read-only in Play. Recommendation: points and Taint stay editable in Play; ranks are Management |

### Rings & Traits (16 kinds, 18 controls) — read-and-roll in Play

| Control | Mode |
|---|---|
| The eight Trait inputs and five Ring inputs (`#trait_*`, `#ring_*`) | M |
| `.stepbtn[data-ring="void"]` (the Void **Ring** − / +; the wizard clicks these) | M |
| `.void-pip` (spend or restore a Void **Point**) | P |
| `#voidInfoBtn` | I |

### Skills (14 kinds, 62 controls with 7 rows) — read-and-roll in Play

| Control | Mode |
|---|---|
| `#skillQuickAdd`, `#addSkill`, `#loadAllSkills`, and per row `.sk-name`, `.sk-trait`, `.sk-rank`, `.sk-school`, `.emph-add-btn`, `.sk-emph-select` / `.sk-emph-text`, `.emph-item-del`, `.rm-btn` | M |
| `.sk-roll` (the d10), `#btnUntrainedSkills` (rolls from the untrained list) | P |
| `.sk-info-btn` | I |

### Advantages & Disadvantages (8 kinds on plain rows) — read-only in Play except in-play controls

Trunk rows:

| Control | Mode |
|---|---|
| `#advQuickAdd`, `#disadvQuickAdd`, `#addAdv`, `#addDisadv`, and per row `.en-name`, `.en-cost`, `.en-desc`, `.rm-btn` | M |

Controls the configured-entry releases (4.5 to 4.5.24) add, read from source:

| Control | Release | Mode |
|---|---|---|
| `.adv-config-btn` ("Choose…" / "Change") — every configured entry | 4.5 onward | M |
| `.named4513-input`, `.court4514-input`, `.court4514-add`, `.court4514-remove`, `.hv4516-input`, `.dep458-input` | 4.5.13, 4.5.14, 4.5.16, 4.5.8 | M |
| `.wealth4517-btn` (grant or return koku) | 4.5.17 | M (a purchase-time grant) |
| `.adv-config-spend-luck`, `.adv-config-reset-session` (Luck, Kharmic Tie) | 4.5 (resources, Kharmic Tie) | P |
| `.court4514-session-box` (Darling's in-session toggle) | 4.5.14 | P |
| `.fb4521-hotei-roll` ("Contested Void Roll") | 4.5.21 | P |
| `.dp4523-use` ("Use <precept>"), `.dp4523-reroll` (in the roll result) | 4.5.23 | P |
| `.unlucky-btn` (session reset and counter), `.unlucky-invoke` (in the roll result) | 4.5.7 | P |
| `.realm4510-check` (Toshigoku's Willpower check) | 4.5.10 | P |
| `.adv-config-info`, `.named4513-info`, `.hv4516-info`, `.p4518-info`, `.sa4519-info`, `.vv4520-info`, `.fb4521-info`, `.nc4522-info`, `.dp4523-info`, `.tr4524-info`, and the court info buttons | 4.5.4 onward | I |

Fields inside the configuration modal (`#advConfig…`, `#fb4521Lore`, `#tr4524Skill` and so on) are
reached only through `.adv-config-btn`, so gating the button gates them.

### Techniques (8 kinds on plain rows) — read-and-use in Play

| Control | Mode |
|---|---|
| `#techQuickAdd`, `#pathPicker`, `#addTech`, and per row `.en-name`, `.en-cost`, `.en-desc`, `.rm-btn` | M |
| `.spell-memo-checkbox` (memorising a spell) | M |
| `.spell-cast-btn` | P |
| `.spell-scroll-add-btn` (adds a scroll to Equipment, which is full-edit in both) | P |
| `#kihoRulesInfoBtn`, the "Why can't I cast this?" button (Phase 8, Part J) | I |

### Spell Slots (10 kinds, 20 pips for a starting Shugenja) — fully usable in both

`.spell-pip-*` and `.spell-bonus-pip-*`: P. Nothing here changes.

### Combat (39 kinds, 56 controls) — Play only; not shown in Management

Everything is P by the roadmap (weapons, stances, Void spends, wounds, rounds, initiative).
Management mode hides the whole tab. Only `#f_armorName`, `#f_armorTN` and `#f_armorRed` read like
Management data; the roadmap keeps them on Combat, so they stay P.

### Equipment (10 kinds, 34 controls) — full edit in both

No change.

### Background (4 textareas) — read-only in Play

`#f_appearance`, `#f_personality`, `#f_history`, `#f_notes`: M.

### Outside the tabs

- **The old toolbar** (`#charSelect`, `#btnLoad`, `#btnSave`, `#btnSaveAs`, `#btnNew`, `#btnDelete`,
  `#btnPrint`, `#btnExport`, `#btnImportTrigger`): the stage that replaces it decides. Ten retained
  harnesses drive `#charSelect` / `#btnLoad`, so the IDs must stay in the page even when hidden.
- **Floating controls** (`#floatingDiceBtn`, `#scrollTopBtn`, `#quickAccessToggleBtn`) and every
  modal: P, unchanged. The Quick-Access Sidebar (Phase 2, Part H) mirrors Void, Spell Slots, Wounds,
  Armor TN and Initiative, all P.

## Summary of the split

| Tab | Management-only kinds | Play kinds | Info kinds |
|---|---:|---:|---:|
| Clan & School | 6 | 0 | 1 |
| Identity | 11 (+5 displays) | 0, or 7 if the Honor/Glory/Status/Taint ruling says so | 0 |
| Rings & Traits | 14 | 1 | 1 |
| Skills | 11 | 2 | 1 |
| Adv & Disadv | 8 trunk + 8 configured | 9 configured | 11 |
| Techniques | 8 | 2 | 2 |
| Spell Slots | 0 | 10 | 0 |
| Combat | 0 (tab hidden in Management) | 39 | — |
| Equipment | 0 | 10 | 0 |
| Background | 4 | 0 | 0 |

## How the gate should work (recommendation)

One mechanism, not a gate in each handler:

1. **A mode flag** `play` / `management` held in memory and on `<body>` as a class. Not in
   `collectData()`, so switching never changes a save, and autosave sees no difference.
2. **One capture-phase listener on `document`** for `click`, `input`, `change`, `beforeinput`,
   `keydown`, `paste` and `drop`. In Play, an event whose target matches a Management selector is
   stopped (`stopImmediatePropagation` and `preventDefault`) before any of the sheet's own listeners
   run. Because a script's `.click()` or dispatched event travels the same path, the roadmap's
   "cannot be triggered by other means" holds for every event-driven edit.
3. **CSS for the look**: `body.mode-play` hides Management-only buttons and pickers and shows inputs
   as plain text. Inputs also get `readonly` (text) or `disabled` (checkbox/select) so the keyboard
   and assistive tools agree with the screen.
4. **A selector registry** (`register(selector, 'manage' | 'play')`) holding the table above, so a
   later phase registers its own controls instead of editing Phase 12, the pattern
   `PREROLL_MODIFIER_REGISTRY` and 4.5.15's registry already use. Phase 12's own table names other
   phases' class names: a declared, comment-level dependency. A removed phase leaves a selector that
   matches nothing.
5. **The wizard runs in Management.** It drives the sheet by clicking its own buttons (Apply Family,
   Apply School, the Void Ring steppers, the Trait inputs), all Management controls. Finish then
   switches to Play, per the ruling.
6. **Combat in Management** is hidden through the carousel's own visibility path
   (`data-visible-with` / `refreshVisibility()`). That path has had two bugs, one Safari-only (BUGFIX —
   Spell Slots Tab on Safari), so the harness must use that fix's Safari emulation rule, and the
   stage needs a device check.

The one thing this does **not** stop is the sheet's own code writing a value (a load, a Void spend).
That is intended: those are not user edits and several are Play actions.

## What the retained suites will see

- **30 of the retained harness folders drive a control that Play would lock.** Under ruling 1 almost
  none of them ever reach Play: they start from a fresh page or load through `#charSelect` /
  `#btnLoad`, which stay in Management.
- **Three open a character from the Characters list or press the wizard's Finish**, the only paths
  that land in Play: Phase 11 (`characters-harness.js`), Phase 11.2 (`wizard-harness.js`) and the
  Import fix (`import-filter-harness.js`). Any of their checks that edit a field *after* opening
  (Phase 11's autosave checks rename the character) need a conditional correction: switch to
  Management first when Phase 12 is present. Declared in both folders when built.
- The later wizard stages (11.2.1 to 11.2.4) compare `collectData()` after Finish, which only reads.

## Proposed stages and cost

Estimates, anchored on this week's measured costs (Phase 11: 4 + 3 + about 4 a stage; the Apply
School fix and the registry below the ranges given for them). The gate is generic, so a tab is
mostly table rows and checks; the expensive parts are the gate itself, the configured-entry
classification, and anything touching the carousel.

| Stage | Contents | Estimate |
|---|---|---|
| **12** | Mode flag, the toggle, the capture-phase gate and registry; Clan & School, Identity, Rings & Traits, Skills and Background; the wizard held in Management; the three harnesses' conditional corrections | 6–9% |
| **12.1** | Advantages & Disadvantages, including the 17 configured-entry control classes above (8 Management, 9 Play) and their information buttons, and Techniques and spells | 5–8% |
| **12.2** | Combat hidden in Management (carousel, Safari emulation, device check), the old toolbar replaced, Save As from Management | 6–10% |
| Device corrections | Budget them inside each stage, as the ledger's rule says | — |

**Total: about 17–27%.** That is lower than the kickoff's 20–35% for one measured reason: one
capture-phase gate replaces a gate in every handler, so no earlier release's fragment has to be
edited. Each stage also adds one line to the shared removal chain rather than editing every earlier
Part K folder.

## Rulings needed before stage 12

1. **The meaning of "inert".** Every user event path (typing, clicking, a script's `.click()` or
   dispatched event) is stopped; the sheet's own code writing values is not. *Recommended.*
2. **Honor, Glory, Status and Taint.** Points and Taint editable in Play; ranks Management-only.
   *Recommended.* (The alternative is the roadmap's letter: all read-only in Play.)
3. **Where the toggle sits.** A small "Manage" button beside the character's name in the header,
   which reads "Done" in Management. *Recommended* over the toolbar (which a later stage replaces)
   or the Quick-Access Sidebar (a play surface).
4. **What Play shows for a Management-only field.** Its value as plain text, in place.
   *Recommended* over hiding the field.

## Not verified

- Configured-entry controls were read from source, not rendered: building a character with every
  configured entry was not done. Stage 12.1's harness has to render each.
- The Kiho and Kata rows of a Brotherhood monk were not rendered; they are `makeEntry` rows like
  Techniques, and the audit assumes the same controls.
- No Phase 12 code exists, so nothing here is tested behaviour. It is a plan with a measured inventory.
