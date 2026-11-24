# Release 15b · B09 — Skill Picker Traits from the Final List

Group 2 (action labels and wording), unit 4.

- **Where it came from:** FT-29 in the Phase 15 audit, and the owner's Q1.
- **Approved:** 24 November 2026, round 1: "Approve as recommended". That means as shown, without naming the Trait range for Perform, Games and Craft.
- **Records:** see [MOCKUP.md](<../G2 — Action Labels and Wording/MOCKUP.md>) and the board, https://claude.ai/artifact/REUwrJoboaHe6xQBuGDDy2.
- **Built:** 24 November 2026 (Claude), on branch `claude/release-15b-b09`, stacked on `claude/release-15b-b05`. It is the group's tip.
- **Accepted** in the device round, 24 November 2026. B09 itself is unchanged by round 2. Round 2 (B01 and B03 revised) was committed on this branch, the group's tip, so the predecessor builds below changed.

## What changes

The Skills page's picker ("— choose a skill to add —") takes each Skill's Trait from the list as it stands after every layer, whenever the picker is drawn.

- **Today only Intimidation changes:** "Intimidation (Willpower)" becomes "Intimidation (Awareness)", which matches the row it adds.
- **Every other option already matched.** The mock-up compared all 44 options with the rows they add, including Sailing's "Agility or Intelligence" and Ninjutsu's "Agility or Reflexes".
- **A later correction to the list** would show in the picker by itself.

**Unchanged:**
- the options' values, groups and order;
- which options are hidden while a Skill is held;
- the row each option adds;
- the creation wizard, which reads the values only;
- Search, the Untrained Skills list and the catalogue, which already said Awareness;
- the save file.

## Why the picker was wrong

The trunk writes the picker once, early (`buildSkillQuickAdd`), before the Skill-Trait fix corrects Intimidation in the list. The Skill list fix then captures those first words and redraws the picker from them whenever the Skill rows change, so the old Trait came back each time.

## How it is built

- `src/sheet/209.99999999999999999991-feat-picker-traits.js` holds `SKP15` and the switch `PICKER_TRAITS_FINAL_ENABLED`.
  - **At load,** it relabels every option as "Name (Trait)" from `findSkill`, the same words the trunk always used.
  - **After that,** a `MutationObserver` on the picker relabels each new drawing before it is painted.
  - **An option it cannot look up** is left as it is.
- **One guarded seam block:** `picker-traits-seam`.
- No stylesheet, no class, no save field.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With B09 (this branch, on B05): group 2 complete | `0d8cebb174c4c4130cfab0368bb0950793d93c01285310438f9e073bb4b81637` | 17,765,990 |
| First build, with the tag `PT15` (not kept) | `aad92d78a0bb6ed041dc72b99992408f06335f1a7c14150158601032ef997134` | 17,765,983 |
| B09 removed (B05 on B03) | `4d0a42b5ed28d24ce3614b0afe66bde674da07955f724c09dce350fe43313473` | 17,762,714 |
| **Round 2:** with B09, group 2 complete (B01 and B03 revised) | `1f002be964b12ee91b7ed484b949946a859d84b84a7a7756bf7d9ed1841b5819` | 17,773,727 |
| **Round 2:** B09 removed (B05 on B03); `qa/remove-phase.py` and `qa/test-removal.py` restacked on it | `029595b6412b10183837cf1e6ade8aeb80d78ac94ea68fdee696a280c9528983` | 17,770,451 |

## Light checks (24 November)

| Check | Result |
|---|---|
| Own harness `qa/picker-traits-harness.js` (9 checks, pinned before the first run) | Run 1: 8/9 (`qa/run-1.log`). `PT-INTIMIDATION-PHONE` expected Intimidation in the "High" group, which was my mistake. The picker has always listed it under "Low" (the mock-up's reproduction of the live build), and the unit's words were right. The harness now expects "Low", and no other expectation changed. Run 2: 9/9 (`qa/run-2-group.log`). |
| `qa/test-removal.py`, first build | 6/10 (`removal.log` of that run, replaced). The remover refused: its surface rule found `PT15` inside the vendored PDF library's data (`209.9999999999968-feat-pdf-deps.js`). The tag became `SKP15`, which appears nowhere else in the sources. The unit's behaviour did not change. |
| Own harness on the renamed build | 9/9 (`qa/run-3-tag.log`) |
| `qa/test-removal.py` | 10/10 (`qa/removal.log`) |
| The dependency check, all four units (`G2 — Action Labels and Wording/qa/dependencies.py`) | 4/4: every reference inside each unit's own blocks (`G2 — Action Labels and Wording/qa/dependencies-group.log`) |
| The harnesses of the layers it touches: every suite harness of the Skills page, the creation wizard and Search. They include the Skill list and Skill-Trait fixes, A03, A03.1 and A20, Phase 12.4's Play Skills, Phases 11.2 to 11.2.4, School Skill rows, Phases 14, 14.1 and 14.3a, the printed Skills table and Feature 4.5.39's pickers. | 27/27 harnesses, 713/713, first time, on the final build (`G2 — Action Labels and Wording/qa/light/b09-touched-run.log`). A first start on the `PT15` build was stopped when the page was rebuilt under it, and its partial log was discarded. |
| **The group's four harnesses on the group build** (`0d8cebb1…1637`) | B01 15/15, B03 13/13, B05 10/10, B09 9/9 (`G2 — Action Labels and Wording/qa/light/own-on-group-0d8cebb1/`) |
| **The "15a removed, group kept" stage** (`G2 — Action Labels and Wording/qa/remove-15a-keep-group.py`): all 26 Release 15a units removed with group 2 kept, rebuild verifies (`509a17ee…e498`, 17,572,767 bytes) | B01 15/15, B03 13/13, B05 10/10, B09 9/9 (`G2 — Action Labels and Wording/qa/light/own-on-15a-removed-509a17ee/`, `G2 — Action Labels and Wording/qa/remove-15a-keep-group.log`) |

## Light checks, round 2 (24 November)

B09 itself did not change.

| Check | Result |
|---|---|
| Own harness `qa/picker-traits-harness.js` | 9/9 (`G2 — Action Labels and Wording/qa/light/r2-own-on-group-1f002be9/picker-traits-harness.log`) |
| `qa/test-removal.py`, restacked | 10/10 (`qa/removal-round2.log`) |
| The group's four harnesses on the group build (`1f002be9…5819`) | B01 23/23, B03 15/15, B05 10/10, B09 9/9, first time (`G2 — Action Labels and Wording/qa/light/r2-own-on-group-1f002be9/`) |
| The dependency check, all four units (`G2 — Action Labels and Wording/qa/dependencies.py`; B01 searched with the class `cn15-on` too) | 4/4 (`G2 — Action Labels and Wording/qa/dependencies-round2.log`) |
| The harnesses of every layer the group touches, one run on the group build: round 1's four sets (B01's, B03's, B05's and B09's), plus Feature 4.5.5's gates harness | 85/85 harnesses, 3,806/3,806, first time (`G2 — Action Labels and Wording/qa/light/r2-touched-run.log`, `G2 — Action Labels and Wording/qa/light/r2-touched/`) |
| The "15a removed, group kept" stage: all 26 Release 15a units removed, rebuild verifies (`fd8fb7d0…8469`, 17,580,504 bytes) | B01 23/23, B03 15/15, B05 10/10, B09 9/9 (`G2 — Action Labels and Wording/qa/remove-15a-keep-group-round2.log`, `G2 — Action Labels and Wording/qa/light/r2-own-on-15a-removed-fd8fb7d0/`) |

## Not covered by the harness

- A native iPhone and Safari picker (a wheel or list drawn by the system). In the device round, open the picker on a real phone and find Intimidation.
