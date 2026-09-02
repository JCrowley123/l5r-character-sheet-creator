# Bugfix — School skill free rank lost on reload

**Build:** `l5r-character-sheet part C feature 1 + schoolfree fix.html`
**Supersedes:** the Feature 1 build. This is the new trunk for Feature 2.

| Suite | Result |
|---|---:|
| Bugfix harness | **30/30** |
| Feature 1 | **80/80** |
| P1 + P2 | **46/46** |
| Feature 0 | **72/72** |
| Part B | **127/127** |

Diff vs the Feature 1 build: **61 added, 1 removed** — one line changed in `makeSkillRow`.

---

## What was actually wrong

Your diagnosis was right in substance, and the precise location is `makeSkillRow`, not the loader
proper. `collectData()` *does* save the free rank as `freeFloor`, and `applyData()` *does* restore
it — I verified a current-build save round-trips correctly. The defect is in the **fallback for
saves that predate that field**:

```js
data-free="${data.freeFloor !== undefined ? data.freeFloor
              : (data.school ? Math.max(1, data.rank||1) : 0)}"
```

When `freeFloor` is absent, the old code assumed **the entire current Rank** was School-granted.
That is exactly the reported symptom — `school_skill = true` → `xp_cost = 0`, regardless of how
many ranks were bought.

### Reproduced before fixing

| Scenario | free rank | XP cost |
|---|---|---|
| Current-build save (has `freeFloor`) | 2 | **3 xp** — correct |
| **Legacy save (no `freeFloor`)** | **3** | **0 xp** — the bug |
| Manual School tick (`freeFloor:"0"`) | 0 → 1 | 5 xp — correct |

So the trigger is **loading a character saved by an earlier build**, not the save/load cycle
itself. If you saw this on a character you created recently, it came from a file first saved
before `freeFloor` existed.

---

## The fix

Rather than guessing from the current Rank, reconstruct the free Rank from the School that
actually granted the skill — which is what your "Required Fix" describes:

```js
data-free="${data.freeFloor !== undefined ? data.freeFloor
              : (data.school ? inferSchoolFreeFloor(data.name, data.rank) : 0)}"
```

Two new pure functions:

- **`schoolGrantedRankForSkill(schoolName, skillName)`** — parses the School's own skills string
  using the *same rule Apply School uses*: `"Defense 2"` → 2, `"Kenjutsu (Katana)"` → 1, a bare
  name → 1, `"any one Skill"` → never matches.
- **`inferSchoolFreeFloor(skillName, currentRank)`** — takes the highest grant across every School
  the character has (`f_schoolsData`, then `f_school`, then `f_schoolApplied`), falls back to **1**
  (the standard "first Rank free" rule) when the skill is not a named School skill, and never
  returns more than the current Rank.

It runs **only when `freeFloor` is absent**. Any save that records it keeps its explicit value —
asserted by E2/E3/E4, including the case where an explicit `"0"` must not be "helpfully" upgraded.

`applyData()` restores `f_school` and `f_schoolsData` *before* it builds skill rows, so the
reconstruction has the School data it needs at the moment it runs.

---

## Verification — all the cases you listed

| Your case | Test | Result |
|---|---|---|
| Skills granted at rank 1, 2, or higher | A1–A3, B3, B4 | PASS |
| Skills upgraded multiple times | C4 (Defense 6, free 2 → 18 xp) | PASS |
| Characters with multiple school skills | C1–C3 | PASS |
| Characters switching / gaining schools | D1, D2 | PASS |
| Bushi characters (no spells in dropdown) | G1, G2 | PASS |

### The reported case, end to end

Daidoji Iron Warrior grants **Defense 2**; the player buys up to **Rank 3**:

```
before fix:  free rank 3, cost 0 xp     <-- wrong
after fix:   free rank 2, cost 3 xp     <-- matches your Expected State
```

Once loaded, the repaired row **saves `freeFloor:"2"`** (F1), so the character self-heals: the
legacy shape is repaired once and never re-inferred. Second round trip is byte-stable (F3).

---

## Scope note

This changes `makeSkillRow`, which the Part C roadmap lists as frozen Part B code. That constraint
exists to stop features silently altering Part B behaviour — it is not a reason to leave a
reported defect in place, and you asked for this fix explicitly. The behavioural change is
confined to loading legacy saves that were being read incorrectly; every other path is byte-identical,
and all four existing suites pass unchanged (325 assertions).

If you re-run the frozen-hash check from the Feature 0 report, `makeSkillRow` will now hash
differently. That is intentional and expected.

---

## Rollback

| Level | Action | Effect |
|---|---|---|
| Full | Return to the Feature 1 build | Reverts the fix; legacy saves resume loading with cost 0 |
| Fallback only | Restore `Math.max(1, data.rank\|\|1)` in the `data-free` expression | Keeps the helpers, restores the old guess |
| Conservative | Make `inferSchoolFreeFloor` always `return Math.min(1, rank)` | Every legacy School skill gets only first-rank-free |

No save migration is needed in either direction. A save written by the fixed build carries an
explicit `freeFloor` that older builds already understand.

---

## Running the harness

```bash
python -m http.server 8799 --directory "."
```

```js
fetch('/l5r-schoolfree-bugfix-harness.js').then(r=>r.text()).then(s=>(0,eval)(s))
```

Exit condition: `failed === 0`, plus `l5r-P1-P2-F1-test-harness.js` reporting 0 failures across
all three sub-suites.
