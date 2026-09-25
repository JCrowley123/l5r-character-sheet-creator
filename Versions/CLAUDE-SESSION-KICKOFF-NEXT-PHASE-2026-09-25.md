# Claude session kickoff: after Phase 11, choosing and starting the next phase

Prepared 25 September 2026, at the end of the session that completed Phase 11 (the Characters
list, the Creation Wizard as 11.2 to 11.2.4, and three bugfixes). Use this file to start a fresh
Claude session. It supersedes the implementation-state claims in
`PART I — Phase 4.5 Remaining Configuration Audit/CLAUDE-SESSION-KICKOFF-BUGFIXES-2026-09-23.md`
and `GPT-SESSION-KICKOFF.md`.

You have no access to the previous conversation. Read the committed records and inspect the
checkout. This prompt is a snapshot that may already be stale, so correct it where it is wrong
rather than inheriting it.

**The project:** the L5R 4th Edition character sheet. It is one self-contained HTML file built
from split source fragments. Repo `JCrowley123/l5r-character-sheet-creator`, deployed from
`main` to https://l5r-character-sheet-creator.pages.dev/.

- It is a **player companion, like D&D Beyond**: not a VTT, GM tracker or combat engine.
- It is worked on from a Windows desktop and from cloud sessions driven from an iPhone. The owner
  tests on an iPhone (Safari, and the installed web app) and a laptop.
- **`git pull` first. Never force-push and never rewrite history.** Push before finishing.

=============================================================================
READ THESE BEFORE ANYTHING ELSE
=============================================================================
1. **`Versions/CLAUDE.md`, in full.** It covers:
   - the conventions and the surgical-removability contract;
   - the rule to re-verify removability at the end of a phase;
   - "Working style the user expects";
   - the folder map, including the Part K and BUGFIX entries added on 24 and 25 September.
2. **`Versions/BUILD-LEDGER.md`:**
   - "Open reminders" at the top: three findings, one bug, two pieces of feedback and three
     reviews are open;
   - the current update, and the "Device-pass decisions and backlog" table (24 September);
   - "What each phase has cost", and every dated paragraph under it;
   - "At a glance", and the "Ahead" table at the bottom.
3. **`Versions/L5R Character Sheet Phased Roadmap reorder.md`:**
   - "Process Requirements";
   - "Recommended Build Order" and "Status Overview";
   - the phase sections for **7, 11, 11.1, 11.2, 12 and 15**.
4. **The Phase 11 READMEs**, especially their "Decisions made while building" and "Found while
   building" sections. They say what Phase 11 deliberately left for Phase 12 (the old toolbar,
   `#charSelect`/`#btnLoad`, Save As from Management mode):
   - `Versions/PART K — Phase 11 Characters List and Save Model/README.md`
   - `Versions/PART K — Phase 11.2 Creation Wizard/README.md` and 11.2.1 to 11.2.4
5. **`Versions/BUGFIX — Import File Picker Filter/README.md`:** the most recent release, and a
   compact example of the full fix pattern.
6. **The canonical Phase 0 folder:** `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0
   Source Reorganization for Maintainability/`.
   - All source editing happens there.
   - Rebuild with `build/recombine.py`, and check with `python3 build.py --check-drift` from the
     repo root. Never hand-edit the generated HTML.

=============================================================================
WHERE THINGS STAND: end of 25 September 2026
=============================================================================
**Phase 11 is complete**, and confirmed on the owner's iPhone and laptop:
- creating a character through the wizard, opening it, Save As a copy, and Export JSON;
- Import JSON, including an unrenamed older `.l5r` save after BUGFIX — Import File Picker Filter.

What was split out or left:
- **Export to PDF** was split out as **Phase 11.1** and has not been started.
- **Play mode, the old toolbar's replacement, and Save As from Management mode** were left to
  Phase 12.

**The live build**, recorded at commit `72ec1f6`:
- **3,062,010 bytes**, SHA-256
  `738c7ccfa3bdf67a6ca160371508fe22521cac845b883119b95a5a4e9490958a`.
- `main` was fast-forwarded to it, and the ledger commit that adds this file follows it.
- Check that `main` and the deployed site carry it. A push is not proof of deployment.

**Combined regression: 2,435/2,435.** Run it with:
`NODE_PATH=/opt/node22/lib/node_modules node "Versions/BUGFIX — Import File Picker Filter/qa/current-suite-runner.js" <built html>`
- Each runner chains the one before it, so allow well over 20 minutes.
- A 0/0 result is a failure, never a pass.

**Folder counts at the `Versions/` top level:** 25 `PART I` folders, 6 `PART K` folders and 11
`BUGFIX` folders. Recount them yourself.

**Dependencies that matter for new work:**
- Every Part K stage depends on the one before it. Their removers refuse while a later stage is
  present.
- Every Part K and Part K-era bugfix fixture carries a **`LATER_STAGES`** (and sometimes
  `LATER_FIXES`) list, so its live-tree removal fixture can strip later work first.
  - **Each new release in this area has had to be added to all of those lists: 7 folders for the
    Import fix.**
  - This per-release overhead grows with every stage. Price it into any staged plan.

**Corrected on 25 September, so treat these as recent edits:**
- The roadmap's Status Overview row for Phase 5 read "Not started", though Phase 5 was built and
  verified long ago (25/25). It now says so.
- The ledger's "Ahead" table was missing Phase 11.1. It now lists 10 phases, not 9.

Look for more stale rows of this kind. Both documents have drifted before.

=============================================================================
USAGE: HONEST FIGURES ONLY
=============================================================================
**This week stands at 77%, by the owner's reading after the Import fix.**
- The week began around 23 September.
- In September it turned over on Tuesdays at 02:00 BST, which would put the reset at about
  30 September. Confirm this with the owner rather than assuming it.
- **About 23% is left.**
- The previous session's estimates are not measurements: ask the owner for the current reading
  before planning.

**This week's figures, from the ledger's cost table:**

| Work | Cost |
|---|---|
| A01–A16, eleven releases | 28% |
| Recording their iPhone device pass | +6% |
| Three bugfixes (Spell Slot Accounting, Spell Slots Tab on Safari, Service Worker Redirected Page) | +13% |
| Phase 11, first stage: Characters list and save model, 70 checks | +4% |
| Phase 11.2, first stage: six wizard screens, 43 checks | +3% |
| Phases 11.2.1 to 11.2.4 and the Kitsune [Mantis] fix | +20%, about 4 points a release |
| BUGFIX — Import File Picker Filter, and marking Phase 11 complete | +3% |

**Calibration the ledger has recorded:**
- A fix inside a release's own fragment costs roughly half as much as one that touches a shared
  file.
- New machinery predicts cost well; entry count does not.
- Screens that reuse existing controls are cheap. Stages that change earlier stages' fixtures
  are not: the spell stages cost more than the screens did for exactly that reason.
- Budget the device correction as part of the phase it corrects.
- Exact token counts have never been exposed to a session. Do not estimate or fabricate them.

=============================================================================
THE PREVIOUS SESSION'S PROPOSAL: ASSESS IT, DON'T ADOPT IT
=============================================================================
This proposal was reached at the end of a long session, from the ledger and roadmap as they stood
and a quick measurement of the source. **It is one input, not the plan.**

**Step 1: BUGFIX — Apply School Placeholder Skill Rows (small; estimated 2–4%).**

The open ledger reminder is "Apply School adds placeholder Skill rows for four Schools", found
while building 11.2.2.

What goes wrong:
- **Tsi Smith [Artisan]** gets Skill rows named "Bugei", "or Merchant Skill" and "two ranks in any
  one Craft Skill".
- **Kasuga Smuggler [Courtier]** gets "Merchant" and "or Low Skill".
- **Mirumoto Bushi and Shiba Bushi** list "Theology", but the sheet's Skill is "Lore: Theology".
- **Kaiu Engineer** lists "War Fans", but the sheet's Skill is "War Fan".
- The last three produce rows with no Trait.

Why first:
- The wizard goes through Apply School, so every character a player creates in one of these
  Schools now gets the bad rows.
- Mirumoto and Shiba are common choices.
- The fix is library data plus a small guard, it has its own folder, and it adds no machinery.
- By the ledger's rule it is arguably a Phase 11 device correction.

**A ruling is needed first:** what happens to saves that already contain the bad rows? The
recommendation is to leave them untouched and let the player delete the rows, since a save
cannot tell a placeholder row from a deliberate one.

**Step 2: Phase 12, Play Mode / Management Mode Split, first stage only.**

Why Phase 12:
- It is the next Part K phase in the Recommended Build Order.
- All its hard dependencies (11, 1.6 and 4.5) are met; 4.8 is soft.
- It is not source-gated.
- It picks up the work Phase 11 deliberately deferred: the old toolbar and the `#charSelect`/
  `#btnLoad` chrome.
- It is the D&D Beyond experience the project is aiming at.

Why it must be staged:
- It is the widest change since Phase 0. It touches every editable control on Skills,
  Advantages & Disadvantages, Techniques and Background.
- The roadmap requires hidden controls to be **inert in the underlying function**, not just
  hidden. That means a gate on every mutating entry point, including the ones the 25 Part I
  releases wrap.
- A quick count found at least ten add buttons in the markup (`addSkill`, `addAdv`, `addDisadv`,
  `addTech`, `addEquip`, `addWeapon`, `addSpellScroll`, `addArrows`, and others), plus row
  removal in 23 source fragments. None of this is audited yet.

Suggested stages:
- **12 (this week):**
  - a read-only audit of every mutating entry point, per tab, including 4.5.x wrappers;
  - the mode flag, and the low-key toggle;
  - one gate that the underlying functions consult;
  - the Skills tab.
- **Later stages:** Advantages & Disadvantages (with configured entries), Techniques, and
  Background/Identity with the toolbar's replacement and Save As from Management.
- **Estimate:** 5–8% for the first stage, and 20–35% for the whole phase over later weeks. This
  is a guess, anchored on Phase 11's 4 + 3 + 20.

**The alternatives weighed, and why they came second:**
- **Phase 7 (Data Integrity).** It is earlier in the build order and is unblocked. Its
  user-visible value is low, though:
  - the sheet already reads every older save;
  - `AuditLog` has no consumer in a player companion.
  - Its one live item is the open finding "an imported older save keeps its older layout until
    opened", which needs the owner's ruling and could be a small fix. The same goes for Phase 11's
    finding that the sheet writes format 3 while `SHEET_SCHEMA_VERSION` still says 2.
- **Phase 11.1 (Export to PDF):**
  - A single offline file means inlining a PDF library into a page that is already 3 MB.
  - It needs the iOS share sheet, which only a device can test.
  - A PDF is essentially a print of Play mode's read-only view, so building it after Phase 12
    means building it once.
  - Note that a `#btnPrint` already exists in the markup. Find out what it does before scoping
    11.1.
- **The wizard feedback (remove an XP-bought Skill with a refund; the ⓘ info buttons):**
  - The owner recorded these as observations "to be addressed later".
  - The ⓘ buttons belong to Phase 15.
  - The Skill removal could be argued to be a Phase 11 correction. If you think it should come
    now, say so.
- **The Rank 0 exploding-10s bug:** parked "until the next change to dice rolling". Phase 12
  changes no dice. The Skill-removal feedback runs into it, which may be a reason to revisit.
- **Phases 6, 4.6, 4.7, 4.8, 13 and 14** need the sourcebooks or a desktop session. **Phase 15**
  comes last by design.

=============================================================================
WHAT THIS SESSION MUST DO FOR ITSELF
=============================================================================
**Do your own assessment of cost and of the remaining roadmap, and draw your own conclusions.**
Specifically:
1. **Cost.**
   - Ask the owner for the current weekly reading and when the week resets.
   - From the ledger's cost table and its dated paragraphs, work out what each candidate is
     likely to cost and whether it fits what is left.
   - Say which figures are the owner's readings and which are your estimates.
   - Look hard at the `LATER_STAGES` overhead. Would a shared registry of later stages, as its own
     small change, pay for itself before Phase 12's stages multiply it?
2. **Roadmap.**
   - Re-derive the next phase from the Recommended Build Order, the Status Overview, the
     dependencies and what is source-gated, rather than from this file.
   - Check both documents for stale rows, as two were found today.
   - Measure Phase 12's real surface before accepting any estimate, whether this file's or
     yours.
3. **Your proposal.** Give the order you would build in, and why.
4. **If your proposal differs from the one above, explain why, point by point:**
   - which facts you found that this file missed or got wrong;
   - which trade-offs you weigh differently;
   - what you would lose by following this file's proposal instead.
   If you agree, say what you checked that convinced you. Don't just endorse it. The owner wants
   it challenged; the last several sessions each found the framing wrong somewhere.
5. **The rulings you need from the owner**, as short questions with a recommended option each.
   Likely ones:
   - the existing saves question for Step 1;
   - Phase 12: the default mode when a character opens, where the toggle lives, and which mode a
     newly created character opens in;
   - the two open Import/Export findings, and whether they belong to Phase 7.

=============================================================================
ALSO OPEN: RAISE IT, DON'T FOLD IT IN
=============================================================================
- **Open ledger reminders:**
  - two export findings;
  - two wizard feedback items;
  - "do starting spells begin memorised?";
  - the Rank 0 bug;
  - the two Seven Fortunes' Blessing reviews;
  - the parked A01–A16 device-pass backlog.
- **The Part I wrapper folder:** 25 top-level folders, still deferred, because every remover and
  runner resolves paths by counting parent directories. Part K now has 6 top-level folders and
  will gain more with Phase 12's stages. Say whether that changes the argument.
- **The registry provider-list checks** (4.5.15's `RD-NO-PRODUCTION-PROVIDER` and 4.5.16's
  `HV-PROVIDER-REGISTERED`) have now been made conditional by three releases. A generalisation
  has been proposed as its own small change.
- **Older live-tree guards:** some Part I removers from before 4.5.11 have a live-tree guard that
  cannot fire. Always pass an explicit scratch copy; never the live tree.
- **Phase 0.7:** its Android device tests are still open. The Android WebView's export path waits
  on them.

=============================================================================
NON-NEGOTIABLES (short form; CLAUDE.md has the full reasons)
=============================================================================
- **Check the premise live before building,** and let the measurement change the design.
- **A harness must be able to fail.** Use deliberately broken builds and quote both numbers.
  - Use fixed dice where a random roll could let a wrong rule pass.
  - After each variant run, look for checks that should have failed and didn't. Two blind spots
    were found this way in 11.2.4.
- **Every release needs:**
  - its own folder, a kill switch, delimited blocks, a guarded seam export and a harness;
  - `remove-phase.py`, `test-removal.py` and `verify-variants.py`, plus a README and a ROLLBACK;
  - a byte-identical removal to its recorded restore point, with every retained suite green on
    the removed build;
  - its name added to every earlier folder's `LATER_STAGES` where applicable, declared in their
    ROLLBACKs.
- **Headless limits:**
  - Playwright ignores a file input's `accept` attribute, and the sandbox never loads the real
    fonts.
  - Take a 375px screenshot of anything new.
  - Row `<label>`s need an ID in their selector, or the carousel rule shrinks them.
- **Files have gone missing during QA:** the `Characters/` folder's files were once deleted during variant runs (the script was never identified). Check
  `git status --short Characters` before committing.
- **Finish every release by:**
  - updating BUILD-LEDGER.md and .html, the roadmap, and CLAUDE.md's folder map;
  - republishing the ledger artifact from BUILD-LEDGER.html
    (https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk);
  - committing with a message that names the release, and pushing.
  - Merge to `main` only when the owner asks.
- **Report what was NOT verified.** A cloud session cannot see the real fonts or a real phone.

=============================================================================
WHAT I WANT FROM YOU FIRST
=============================================================================
After reading, and before writing any code:
1. **Your understanding of the current state**, including anything in this prompt that is now
   wrong. Check `main`, the deployed build, the suite count and the folder counts yourself.
2. **Your own cost assessment and roadmap assessment**, as described under "What this session
   must do for itself".
3. **Your proposed next phase and build order.** If it differs from the proposal above, give the
   point-by-point reasons it differs.
4. **The rulings you need**, each with a recommended option.

**Do not start writing code until the owner confirms the plan.** Once it is confirmed, work in
small verified releases without asking permission for routine steps.
