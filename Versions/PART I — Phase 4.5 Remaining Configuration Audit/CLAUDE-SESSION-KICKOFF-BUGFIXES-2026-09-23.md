# Claude session kickoff — A01–A16 device feedback and the open bugfixes

Prepared 23 September 2026, at the end of the session that completed A01–A16. Use this file to
start a fresh Claude session. It supersedes the implementation-state claims in
`Versions/GPT-SESSION-KICKOFF.md` and `CLAUDE-SESSION-KICKOFF-A01-A16-2026-09-20.md`. Do not assume
access to the previous conversation. Read the committed records and inspect the checkout, and
treat this prompt as a snapshot that may already be stale. Correct it where it is wrong; don't
inherit it.

The L5R 4th Edition character sheet: one self-contained HTML file built from split source
fragments. Repo `JCrowley123/l5r-character-sheet-creator`, deployed from `main` to
https://l5r-character-sheet-creator.pages.dev/.

- It is a **player companion, like D&D Beyond**: not a VTT, GM tracker or combat engine.
- It is worked on from a Windows desktop and from cloud sessions driven off an iPhone.
- **`git pull` first. Never force-push, never rewrite history.** Push before finishing.

The owner will give you **the results of iPhone testing of A01–A16**, run from
`IPHONE-TESTS-A01-A16-2026-09-23.md` in this folder, alongside this prompt.

=============================================================================
READ THESE BEFORE ANYTHING ELSE
=============================================================================
1. `Versions/CLAUDE.md` in full: conventions, the surgical-removability contract, the
   end-of-phase re-verification rule, "Working style the user expects", and the folder map.
   The map's 4.5.13–4.5.24 entries each carry a ⚠️ lesson worth knowing before touching the
   same code.
2. `Versions/BUILD-LEDGER.md`. Start with "Open reminders" at the top (the two bugs and two
   review items below), then the current update and the cost table.
3. `Versions/PART I — Phase 4.5 Remaining Configuration Audit/AUDIT.md`. Read the top sections:
   "Open defects to come back to", the A01/A03/A13 decisions, and the delivery updates.
4. In this folder: `IPHONE-TESTS-A01-A16-2026-09-23.md`, the checklist the owner ran.
5. The READMEs of the release each piece of feedback touches (`Versions/PART I — Phase 4.5.1x …`).
   Every one has a Behaviour section, measured QA, a mutation table and "found while building".
6. For the Rank 0 bug: `PART I — Phase 4.5.19 Soul of Artistry/README.md`, "Found, not fixed:
   Rank 0 table rows already explode".
7. For the bonus-pip bug: the ledger's "Open reminders" entry, and
   `PART I — Phase 4.5.20 Void Versatility/README.md` (what that release writes, and what it
   never touches, in the spell-slot counters).
8. The canonical Phase 0 folder: `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0
   Source Reorganization for Maintainability/`. All source editing happens there. Rebuild with
   `build/recombine.py`; never hand-edit the generated HTML.

=============================================================================
WHERE THINGS STAND — end of 23 September 2026
=============================================================================
- **A01–A16 are all delivered** (Phases 4.5.13 to 4.5.24), each to the owner's recorded
  rulings. A07 is a reminder and A11 a reference, as approved. None is yet confirmed on a real
  device.
- Live build: **2,914,055 bytes**, SHA-256
  `3e262b188a453aed40451a7162a38e90761f6a04b35ea54bf124b9f1309151a2`. Branch
  `claude/amazing-sagan-8p699k` was merged to `main` (fast-forward) for deployment. Verify that
  `main` and the deployed site actually carry it: a push is not proof of deployment.
- Combined regression: **2,052/2,052**. Run it with
  `NODE_PATH=/opt/node22/lib/node_modules node "Versions/PART I — Phase 4.5.24 Touch of the
  Spirit Realms/qa/current-suite-runner.js" <built html>` (about 20 minutes). A 0/0 result is
  a failure, never a pass. Each release folder also has `qa/verify-variants.py` (mutations and
  removal proofs) and `qa/test-removal.py`.
- Every release from 4.5.14 to 4.5.24 removes **byte-identically** to its recorded restore
  point, with all older suites passing on the removed build.
- **Dependencies:**
  - 4.5.16, 4.5.21, 4.5.23 and 4.5.24 all depend on 4.5.15's roll-declaration registry, so each
    must be removed before it.
  - 4.5.22 depends on 4.5.21.
  - 4.5.17 depends on 4.5.6.
  - The registry is still seven seats.

=============================================================================
USAGE — HONEST FIGURES ONLY
=============================================================================
- **Completing A01–A16 in one session (4.5.14–4.5.24, eleven releases, 1,128 → 2,052 checks)
  took 28% of that week's allowance**, by the owner's reading. That is about 2.5% per release,
  roughly half the 4.5.3–4.5.12 rate. Reusing existing machinery (4.5.15's registry, base 4.5's
  reroll and the adv-config seat) did what the ledger's lessons predicted.
- **It does not include any device correction**: none has happened yet. The ledger's own rule
  is to budget the device correction as part of the phase. The corrections the iPhone results
  call for belong to that 28%'s work, not to "new" work.
- Exact token counts have never been exposed to a session. Do not estimate or fabricate them.
  **Ask the owner for the current weekly reading before planning**; do not assume the 28% is
  still the week's position.
- Calibration from the ledger:
  - A fix inside a release's own fragment costs roughly half one that touches a shared file.
  - Entry count is a poor estimator; new machinery is a good one.
  - Estimates have run high once groundwork existed.

=============================================================================
THE WORK QUEUED — AND THE OWNER'S PROPOSED PLAN
=============================================================================
The owner intends this session to (1) act on the A01–A16 iPhone feedback, and (2) start the bug
fixes. The proposed order is below. **Assess it; do not simply adopt it.**

**Step 1. Triage the iPhone feedback before building anything.** Classify each reported item:
  a) **Confirmed working**: record it in the ledger/README as real-device confirmed.
  b) **A defect in a 4.5.x release**: a correction inside that release's own fragment where
     possible (cheaper, and its removal proof only needs re-measuring). Say which release, and
     whether the fix is display-only or behavioural.
  c) **Wording that reads wrong on the device**: counts as a defect. Two earlier device passes
     found exactly this. Known candidate: Naishou Citizen's Blessing row still says "2 XP: Crane
     price".
  d) **A new request, or a change to an approved ruling**: out of scope until the owner decides.
  e) **A known issue** (the list at the end of the test file): not a new finding.

  Re-measure each report before fixing it. Several past reports were overstated or understated
  when driven, and one headless-verified fix still failed on the real device because the
  sandbox never loads the real fonts.

**Step 2. BUGFIX — Rank 0 Skill-table rolls explode 10s.**
- Trunk `rollSkill()` (`src/sheet/100-dice-engine.js`, ~line 242) passes no `explode:false`, so a
  Rank 0 row rolled from the Skill table is labelled "Unskilled" but explodes. The Untrained
  Skills list is already right.
- Own `BUGFIX — <name>` folder at `Versions/` top level, delimited additive model (like
  Negative Roll Modifier Display).
- Check that Void's "Rank 0 → 1" option still re-enables explosion, and that Soul of Artistry
  (4.5.19) still lifts matching rows to Rank 1 (it rewrites the context before the preview).
- If a retained harness rolls a Rank 0 row and expects explosion, make that check conditional
  and declare it.

**Step 3. BUGFIX — hand-tapped bonus spell pips can exceed the shared pool.**
- Reproduced with Water 2, Fire 2 and Void 3: fill the shared bonus pool by casting, then tap an
  EMPTY bonus pip on another element. That element's fill count still rises (4 shown against a
  pool of 3). Taking bonus pips back on one element then also strips another element's pips,
  because each row is trimmed to the shared total.
- Casting and ordinary slot pips never cause it.
- Trunk code: the manual bonus-pip handler around `renderSpellBonusPips` in
  `080-identity-build-ui.js` (~line 652–700), and the clamp in `110-modals-trackers.js`.
- Proposed fix: refuse a hand-tapped bonus pip when the pool is full; a take-back changes only
  the row tapped; repair saves that are already over-full once, on load.
- **Needs an owner ruling first**: a save does not record which element's pips a repair should
  remove.
- Void Versatility (4.5.20) writes only `spell_used_<ring>` and must stay untouched by this fix.

**Step 4. The two Seven Fortunes' Blessing review items** (deferred by the owner):
- one Blessing per character (Core p.148) — the proposal is to flag, never delete;
- changing the Fortune on an existing row, and Naishou Citizen's replace-without-refund
  purchase history.

These need the owner's decisions, not engineering judgement.

=============================================================================
ALSO OPEN — RAISE, DON'T FOLD IN
=============================================================================
- **The Part I wrapper folder**: `ls -d "Versions/PART I"*` reports **25** folders at top level.
  CLAUDE.md explains why it keeps being deferred: every remover and runner resolves paths by
  counting parents. It is its own piece of work.
- **The provider-list checks**: 4.5.15's `RD-NO-PRODUCTION-PROVIDER` and 4.5.16's
  `HV-PROVIDER-REGISTERED` have now been made conditional by three releases (4.5.21, 4.5.23,
  4.5.24). Every future registry provider must edit both again. Consider proposing a
  generalisation, as its own small change.
- **Older live-tree guards**: some Part I removers from before 4.5.11 have a live-tree guard that
  cannot fire. Always pass an explicit scratch copy; never the live tree "to watch it refuse".
- **Not in scope unless the owner says so:** D06 Weakness, Hotei's Curse, Phase 6, the
  ammo-picker change (needs a ruling), Lord Moon's Curse, the p.148 set rules (no mechanism
  exists).

=============================================================================
NON-NEGOTIABLES (short form; CLAUDE.md has the full reasons)
=============================================================================
- **Check the premise live before building.** Let the measurement change the design.
- **A harness must be able to fail.** Use deliberately broken builds and quote both numbers.
  Use fixed dice where a random roll could let a wrong rule pass; this session's keep-the-higher
  mutation only failed once the dice were fixed.
- **Damage bypasses `applyPreRollModifiers()`.** Drive real rolls.
- **Every fix needs:**
  - its own folder, kill switch, delimited blocks, guarded seam export and harness;
  - `remove-phase.py` and `test-removal.py`, README and ROLLBACK;
  - a byte-identical removal to its recorded restore point, with every retained suite green on
    the removed build.
- **Row `<label>`s need an ID in their selector**, or the carousel rule shrinks them. 4.5.24
  caught this only from a screenshot, so take a 375px screenshot of anything new.
- **Finish every release by:**
  - updating AUDIT.md, BUILD-LEDGER.md and .html, and CLAUDE.md's folder map;
  - republishing the ledger artifact from BUILD-LEDGER.html
    (https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk);
  - committing with a message that names the release, and pushing. Merge to `main` only when
    the owner asks.
- **Report what was NOT verified.** A cloud session cannot see the real fonts or a real phone.

=============================================================================
WHAT I WANT FROM YOU FIRST
=============================================================================
After reading, and before writing any code:
1. **Your understanding of the current state**, including anything in this prompt that is now
   wrong. Check `main`, the deployed build, the suite count and the folder count yourself.
2. **The iPhone feedback, triaged** into the five classes above, with the release each item
   touches and whether a fix stays inside that release's fragment.
3. **Your assessment of the proposed plan** (feedback corrections → Rank 0 bugfix → bonus-pip
   bugfix → Blessing review items) against the owner's current usage reading. Specifically weigh:
   - whether the device corrections should come first, per the ledger's "budget the device
     correction as part of the phase" rule, or whether the small, self-contained Rank 0 fix
     should lead;
   - whether the two bugfixes should share one folder (they share no code) or stay separate
     (each is independently removable, and one needs a ruling first);
   - whether any iPhone finding changes the priority of the bugs;
   - whether the provider-list generalisation or the Part I wrapper should be scheduled now,
     before more work adds to either.
4. **If you disagree, give a concrete alternative order** and explain the trade-offs. Don't just
   endorse the plan; the last several sessions each found the owner's framing wrong somewhere,
   and the owner wants that challenged.
5. **The rulings you need from the owner**, as short questions with a recommended option each.

**Do not start writing code until the owner confirms the plan.** Once confirmed, work in small
verified releases without asking permission for routine steps.
