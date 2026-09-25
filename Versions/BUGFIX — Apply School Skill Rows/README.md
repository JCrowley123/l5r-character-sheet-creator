# BUGFIX — Apply School Skill Rows

Built 25 September 2026, on the Windows desktop. The ledger's open reminder said "Apply School adds
placeholder Skill rows for four Schools". **Measured first, it was much wider.**

## What was wrong

Measured on the live build, then swept across every School the Clan & School pickers offer (104,
the Brotherhood included) through the real Apply School button:

1. **School Skills with no Trait: 69 of the 104 Schools.** The Skill lookup matches exact names
   only, so every School Skill written "Family: Subject" (Kitsu's *Lore: History* and *Lore:
   Theology*, Hida's *Lore: Shadowlands*, Kaiu's *Craft: Armorsmithing*, Doji's *Perform:
   Storytelling*, Kakita's *Games: Sadane*…) was added with a blank Trait, and its roll button
   refused ("Set a Trait for this skill before rolling") until the player typed one. Typing such a
   name by hand did the same. The creation wizard avoided it only for "Lore (pick one)".
2. **Three misnamed Skills.** Mirumoto Bushi and Shiba Bushi list "Theology" (the sheet's Skill is
   "Lore: Theology"); Kaiu Engineer lists "War Fans" (the sheet's is "War Fan").
3. **Placeholder rows.** Tsi Smith [Artisan] got rows named "Bugei", "or Merchant Skill" and "two
   ranks in any one Craft Skill"; Kasuga Smuggler [Courtier] got "Merchant" and "or Low Skill".
4. **Found by this fix's own sweep, recorded nowhere before:** The Order of Jurojin's Blessing
   [Monk] lists "Medicine (Disease, Herbalism)", and the comma inside the brackets split it into
   rows named "Medicine (Disease" and "Herbalism)".

The character check (Phase 5, Part J) and the second-School Technique unlock read a School's Skill
text the same broken way, so they counted "Bugei" and "or Merchant Skill" as School Skills too.

## What the fix does

- **A blank Trait is filled** from the Skill's own library entry, its corrected name, or, for a
  "Family: Subject" name, the family's entry (Lore → Intelligence, Craft and Perform and Games →
  Awareness, as the sheet's own library gives them). This happens whenever a row is made (Apply
  School, a loaded save, Add Skill) and when a row is renamed. **A Trait the row already has is
  never overwritten**, and a name the library does not know stays blank.
- **The three misnamed Skills are corrected in the School library at load**, so every reader of
  it (Apply School, the free-Rank rebuild, the second-School unlock, the character check, the
  wizard) sees the sheet's own name.
- **A School's Skill text is read whole**, with the rule the wizard already uses: a piece
  containing "any" opens a free choice, which takes the following pieces until it says Skill; and
  a comma inside brackets no longer splits a Skill from its Emphases. Tsi Smith now leaves four
  free choices and adds two rows; Jurojin's monks get one Medicine row with both Emphases, free.

**Existing saves (your ruling, 25 September):** a blank Trait is filled where the Skill's family
makes it clear. Placeholder rows are **left** for the player to delete, because a save cannot tell
a placeholder row from a deliberate one. A row saved as "Theology" or "War Fans" **keeps its name**
(Apply School's own undo finds rows by the name it recorded), gets its Trait, and is matched as the
Skill it stands for by the character check and the second-School unlock, so an older Mirumoto or
Shiba save shows no new warning.

## How it is built

| Piece | What |
|---|---|
| `src/sheet/209.9995-bugfix-school-skill-rows.js` | The fix. Kill switch `SCHOOL_SKILL_ROWS_FIX_ENABLED`. Ordered last among the sheet fragments, after the Import fix |
| Two delimited blocks in `080-identity-build-ui.js` | Inside Apply School's Skill loop, purely additive: one reader per Apply, and a guard that skips a free choice's pieces and uses a bracketed Skill whole |
| One delimited block in `210-test-seam-and-init.js` | Guarded seam export: the switch, `SCHOOL_SKILL_ROWS`, and the rebound `hasSchoolSkillOverlap` and `schoolConcreteSkillNames` |
| Rebindings, by name | `makeSkillRow` (trunk, wrapped), `schoolConcreteSkillNames` and `hasSchoolSkillOverlap` (trunk, replaced), and, when Phase 5 (Part J) is present, `validatorConcreteSkills`, `validatorChoiceSlots` (replaced) and `validatorSkillRanks` (wrapped) |

No stylesheet, deliberately: the fix adds no element, class or colour. Marker `BUGFIX
SCHOOLSKILLROWS` (`// BUGFIX SCHOOLSKILLROWS BEGIN <slug>` / `// END SCHOOLSKILLROWS <slug>`).

## QA

All measured on the Windows desktop on 25 September 2026.

| Check | Result |
|---|---|
| Own harness | **37/37**. The oracle is the sheet's own `SKILL_LIBRARY`, never the fix's functions. The sweep applies all **104** Schools and reads **578** School Skill rows |
| On the pre-fix build | **13/37**: it fails exactly the 24 checks pinned for "fix removed" |
| Combined suite | **2,472/2,472** (2,435 retained + 37 new), `0dcb56e8…` |
| Removal | **Byte-identical** to `738c7ccf…` (3,062,010 bytes, commit `322d9e6`), and the three touched sources match that commit exactly. The retained suites on that exact build read **2,435/2,435** earlier the same day |
| Removal fixtures | **16 run, 15 pass, 1 skipped** (the symlink test: Windows refuses symlinks without Developer Mode) |
| Earlier live fixtures | All eight earlier chain releases' `test-removal.py` pass with this fix present; each strips it first through the shared removal chain, with **no edit to any of their folders** |
| `feature-dependencies.py` | Exit 0: every reference is inside a block this fix owns |
| Variants | **12 of 12 as pinned**, below |

| Variant | Result | Checks that fail |
|---|---|---|
| Fix removed | 13/37 | 24 |
| Master switch off | 14/37 | 23: the switch is read |
| No Trait fill | 28/37 | 9 |
| Trait fill overwrites | 36/37 | 1: the never-overwrite guard |
| No library corrections | 29/37 | 8 |
| No old-name aliases | 34/37 | 3: older saves |
| Apply School reads pieces | 29/37 | 8 |
| Brackets split | 32/37 | 5: Jurojin |
| Character check not reread | 36/37 | 1 |
| Continuations counted as choices | 35/37 | 2 |
| Unknown names get a Trait | 35/37 | 2 |
| Choice slots not reread | 36/37 | 1 |

**The first variant run found three blind spots**: checks that no variant could turn red (Kasuga's
choice count, an unknown name staying blank, the character check's choice slots). The last three
variants were added for them. Each fails where expected.

## Decisions made while building

- **Correct the library, don't rename rows.** Renaming only the rows Apply School writes would have
  left two other readers (the second-School unlock and the character check) matching the old
  library text, and every Mirumoto or Shiba character would have been told "Theology" was missing.
  Correcting the library keeps every reader in step. Renaming rows in existing saves was not done:
  it would break the School's own undo, which finds rows by the name it recorded.
- **"Artisan (pick 2)" and "Lore (pick 1)" are left as they are.** Artisan and Lore are real library
  Skills; those rows are the family rows the wizard already names. The sweep's first cut flagged
  "Artisan" as a placeholder; that was the harness's error, corrected.
- **Tsi Smith's "two ranks in any one Craft Skill" is a free choice at one Rank**, as the wizard
  already offers it. The sheet has no way to make a second Rank of a free choice free.

## Not verified

- ~~Not tried on a real device.~~ **Confirmed on the owner's iPhone, 25 September**, on the branch
  preview: Kitsu's Lore rows show Intelligence and roll, Mirumoto's row reads Lore: Theology, Tsi
  Smith adds only Commerce and Defense, and an older character's Lore Skill has its Trait filled.
- **Old saves with Doubt or Touch of the Spirit Realms (Yomi) configured on exactly "Theology" or
  "War Fans".** Those entries store the Skill name, and the corrected library now says "Lore:
  Theology" / "War Fan", so such an entry would read as stale and stop applying (those phases keep a
  stale Skill's award and flag it). Not measured; judged rare enough to declare rather than build
  for.
- **An older Kaiu save's "War Fans" row** still does not match a war fan's weapon Skill ("War Fan"),
  exactly as before. A new Kaiu Engineer gets "War Fan".
- The wizard was not driven through its own screens for the affected Schools. It applies the School
  through the same button, and `CW-SAME-AS-BY-HAND` (retained, passing) compares the two.

## Files

| File | What it is |
|---|---|
| `qa/school-skill-rows-harness.js` | The 37 checks |
| `qa/current-suite-runner.js` | Chains the Import fix's runner and adds this harness |
| `qa/remove-phase.py` | Surgical remover |
| `qa/test-removal.py` | Its fixtures, including the live-tree proof through the shared removal chain |
| `qa/verify-variants.py` | The 12 pinned variants |
| `ROLLBACK.md` | How to undo it |
