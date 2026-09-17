The L5R 4th Edition character sheet project — a single self-contained HTML file,
built from split source fragments. Repo: JCrowley123/l5r-character-sheet-creator.

**You are already in the middle of this work, and this document is being posted
into that same interrupted conversation.** Everything above it in this thread is
yours: the audit you produced (`L5R-4e-Sheet-Audit.md`), the rules clarifications
you extracted into `PART I — Phase 4.5 Remaining Configuration Audit/AUDIT.md`,
the approved designs for the Advantages and Disadvantages, and the run at
implementing Advantages A01–A16 that your usage limit cut short. **Continue from
there.** This is a resumption, not a fresh brief — it exists because the thread
was interrupted mid-flight and the ground has moved underneath it since.

Read the rest of this document before you act on anything you remember. Your
recollection of where the code stood is the one part of your context that is now
out of date.

`git pull` first. The repo is worked on from a Windows desktop AND from cloud
sessions driven off an iPhone. Claude has worked on it all week from the cloud
side and `main` has moved a long way since you last saw it.
**Never force-push. Never rewrite history.**

=============================================================================
READ THESE IN FULL, IN THIS ORDER, BEFORE DOING ANYTHING ELSE
=============================================================================
1. `Versions/CLAUDE.md` — project conventions: folder structure, the split-source
   build system, and the surgical-removability contract every feature must
   follow. Read the whole of "Every feature must be surgically removable"
   (including the dependency-declaration rules), "Invariants every build must
   preserve", "Design decisions already made — do not relitigate", and "Working
   style the user expects". Several of its rules exist because a previous phase
   broke them. Do not start work before reading it.
2. `Versions/L5R Character Sheet Phased Roadmap reorder.md` — the single source of
   truth for what each phase is, its scope and its dependencies. Also read
   "Deferred and declined — decisions, not omissions".
3. `Versions/BUILD-LEDGER.md` — which phases are done and verified vs merely
   built vs not started, plus the per-phase cost table. It is a snapshot, not a
   source of truth. Read its top three review notes: they were written this week
   and two of them CORRECT figures the ledger itself previously asserted.
4. `Versions/PART I — Phase 4.5 Remaining Configuration Audit/AUDIT.md` — your own
   13 September audit, plus the approved designs. Sections A01–A16 are your
   brief. The "User review addendum — Advantages scope decisions" is
   authoritative where it narrows an earlier proposal.
5. The current head: `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0
   Source Reorganization for Maintainability/` — **this is where ALL editing
   happens.** Read its `README.md`, then read `src/sheet/209.8-feat-adv-config.js`
   and `209.81-feat-adv-config-extended.js`, which are the existing Advantage
   configuration surface you will be extending, and
   `209.92-feat-adv-rank-entries.js`, which is the worked example of two
   Advantages (A10, A16) already shipped to this contract.
6. `Versions/PART I — Phase 4.5.12 Seven Fortunes Curse Bishamon/README.md` —
   READ THIS ONE EVEN IF YOU SKIM THE OTHERS. It carries the single most
   consequential measurement in the project: **damage rolls do not go through the
   modifier pipeline.** See "the damage finding" below.
7. `Versions/PART I — Phase 4.5.10 Cursed by the Realm/ROLLBACK.md` — the
   `D45.modules` route, which takes NO registry seat and is the route every new
   entry should prefer.
8. The two newest folders, which are Claude's work from today and are part of
   what you are being asked to audit:
   `Versions/BUGFIX — Mastery Rank Labelling/` and
   `Versions/BUGFIX — Negative Roll Modifier Display/` — README and ROLLBACK each.

=============================================================================
WHERE THINGS STAND — as of commit 580c44f, 17 September 2026
=============================================================================
- Live build: **2,689,172 bytes**, sha256
  `c7063f52269c306fcd6596e2103518ff27d4a57b01b0db031115dbb59c58ca15`.
  That figure is recorded in `build/manifest.json` as `expect_sha256`.
- Build it with:
  `python3 "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/build/recombine.py"`
  Add `--verify` to fail the build if the output stops matching the manifest.
- Combined regression: **992/992**. Run it with:
  `NODE_PATH=<your global node_modules> node "Versions/BUGFIX — Negative Roll Modifier Display/qa/current-suite-runner.js" <built html>`

  ⚠️ **THE NODE_PATH FAILS DEAF.** Playwright must resolve. In the cloud sandbox
  the correct value is `/opt/node22/lib/node_modules`; on your desktop it will be
  different — find it and confirm it. With the wrong path every child suite fails
  to launch and the pre-4.5.10 runners print `COMBINED 0/0 checks passed`, a line
  that reads like success. 4.5.10's runner onward treats 0/0 as a failure. If you
  chain a new runner off an older one, keep that guard.

**What shipped this week (w/c 16 September), all on `main`:** Phases 4.5.3
through 4.5.12 — configuration repairs, a UX pass, eligibility gates, the two
rank-priced Advantages (A10 Perceived Honor and A16 Wealthy), and Disadvantages
D05 Unlucky, D02 Dependant, D07 Wrath of the Kami, D03 Doubt, D01 Cursed by the
Realm, D04a Seven Fortunes' Curse and D04b's Bishamon branch — plus two bugfix
folders today (Mastery Rank Labelling, Negative Roll Modifier Display). Each
carries a byte-identical removal proof against a recorded restore point.

**Disadvantages are therefore nearly closed.** D01, D02, D03, D05 and D07 are
done; D04 is done except its **Hotei** branch; **D06 Weakness is untouched.**

**THE DAMAGE FINDING, and why it outranks everything else in this prompt.**
`rollWeaponDamage()` does **NOT** call `applyPreRollModifiers()`. It rolls
`getWeaponDamageDice()`'s numbers directly and consults the pipeline only
afterwards, to decorate an already-rendered modal. This was proven with a probe
returning a real −3k−1 for `ROLL_KINDS.DAMAGE`: the modal PRINTED it and the dice
rolled the full unreduced 5k2. Every 4.5.x entry before 4.5.12 reached rolls
through that registry. So anything that must change a DAMAGE pool has to do it
inside the damage maths, and a check that only asks `getPreRollModifiers()` will
pass against a build whose dice ignore the modifier entirely. **Assume nothing
about damage without driving it.**

**Decisions already taken — do not relitigate, but do check they were applied:**
- **Phase numbering is DOTTED.** `PART I FEATURE 4.5.13`, never the compressed
  `4.513`, which reads as 4.51.3 and collides the moment any 4.51 exists. Both
  removal regexes already accept dots. **The next feature phase number is
  4.5.13.** A bugfix instead takes a `BUGFIX — <name>` folder at `Versions/` top
  level.
- **`D45.configTypes` MAY grow.** 4.5.8's ROLLBACK records this as an absolute
  constraint; 4.5.10 LIFTED it on the owner's explicit decision, because the
  argument only ever held for a CONSTANT expected value and a CONDITIONAL one
  solves it. Read 4.5.10's ROLLBACK, not just 4.5.8's.
- **Prefer `D45.modules` over re-registering a contributor.** Entries in
  `D45.modules` are consulted generically from the single existing seat, and
  `D45.modifiers()` returns early for `ROLL_KINDS.DAMAGE` before reaching them,
  so the damage exclusion is inherited STRUCTURALLY rather than remembered.
  **Phase 1.5's baseline of seven registry seats must hold.**
- **The TN-reporting convention** (a rule's `TN +N` shown as `−N` to the reported
  total, never on damage) exists and has four consumers. Reuse it, don't reinvent.

=============================================================================
TASK 1 — RESUME DELIBERATELY: WHAT CARRIES OVER, AND WHAT DOES NOT
=============================================================================
You are continuing an interrupted session, so be precise about which parts of
your own context are still true.

**WHAT CARRIES OVER — use all of it.** Everything you LEARNED and DECIDED earlier
in this thread: the sourcebook passages you read and the pages they were on, the
rulings the owner gave you, the design decisions in `AUDIT.md`, the reasoning
behind each entry's approved approach, which entries you found genuinely blocked
and why, and anything you measured about how the sheet behaves. That is the
expensive part of the previous session and it is not repeated anywhere else.

**WHAT DOES NOT CARRY OVER — the code.** ⚠️ **Nothing you wrote was ever pushed.
There is no branch, no commit, no partial implementation anywhere in the
repository, and I have verified this rather than assumed it:** `main` is at
`c47a853`; all eight other branches are Claude's (`claude/*`), the newest dated
17 September; and nine of the config-type discriminators your own audit proposed
— `courtPick`, `factionPick`, `knowledgePick`, `targetStatusPick`, `itemPick`,
`servantPick`, `skillFamilyPick`, `regionPick`, `fortuneLinkPick` — appear
**nowhere** in `src/sheet/`. Only `rankPick` and `ringPick` exist, and both come
from phases that shipped.

**This is a decision, not an accident to be repaired.** The owner's position,
stated explicitly: a half-finished fragment sitting in a branch would only have
confused the situation, and he was content to resume this week from the last
fully-pushed state on GitHub. **So do not paste your half-written code back out
of this conversation.** Do not treat a partial fragment from earlier in the
thread as a starting point to patch up. Every entry gets written fresh against
today's `main`, to the contract in `CLAUDE.md`, using the audit as its
specification.

There are three concrete reasons this is the right call and not merely a
preference:
1. `main` has moved **fourteen shipped items** since you last saw it, including
   two phases and two bugfixes that add marked blocks to the very shared files
   your Advantage work will touch. Code written against the old tree is written
   against a file that no longer looks like that.
2. Your half-written work never passed a suite, never had a removal proof, and
   was never reviewed. It has no verified status of any kind. Rebuilt code and
   remembered code look identical on the page, and only one of them has been
   checked against the current build.
3. The removability contract requires a restore point **recorded before the work
   starts**. Work that predates today's `main` has no valid restore point.

**So, before writing any code, report back:** an inventory of what you had
reached — which of A01–A16 you had started, how far each got, what you had
decided about each, and specifically **which sourcebook data you had already
extracted and whether it reached `AUDIT.md` or only this conversation.** That
last point matters most: any page citation that lives only in this thread is one
usage limit away from being lost again, and Task 2 asks you to commit it to
`AUDIT.md` first, before you build anything with it.

If your recollection of some detail is uncertain, **say it is uncertain.** Do not
reconstruct a sourcebook figure from memory and present it as extracted — go back
to the PDF and re-read the page. A remembered number that turns out wrong would
be written into the catalogue as verified, which is the one class of error this
project has no defence against.

=============================================================================
TASK 2 — IMPLEMENT THE ADVANTAGES, AND STOP WHEN A01–A16 ARE DONE
=============================================================================
**The target is FOURTEEN entries, not sixteen.** A10 (Perceived Honor) and A16
(Wealthy) shipped this week as Phase 4.5.6 and are done — including their source
corrections (Perceived Honor is 2 XP/rank, not the catalogue's 3; Wealthy's
discount is 1 XP off the TOTAL, not per rank). **Do not rebuild them.** Verify
them against the audit and move on. Remaining: A01–A09, A11–A15.

**You are the right actor for this specifically because of the sourcebooks.**
The cloud sessions cannot reach them — the PDFs are gitignored and desktop-only —
and that is why eleven of these fourteen have sat blocked. The ledger names the
genuinely source-gated data as: Seven Fortunes' Blessing's Fortune list and
per-Fortune effects (A01), Soul of Artistry's authoritative Artisan/Craft family
list (A12), Dark Paragon's Shourido precept contexts (A03), Touch of the Spirit
Realms' per-realm effects (A13), and Paragon's per-tenet benefit table (A09).

⚠️ **EXTRACT THAT DATA INTO `AUDIT.md` AS YOU GO, AS A SEPARATE COMMIT, BEFORE
YOU USE IT.** This is the highest-leverage thing you can do in this session and
it outlives it: every figure you put in `AUDIT.md` with a printed-page citation
is a figure a cloud session can build from afterwards without you. The precedent
is already there — the A10 and A16 source corrections are recorded that way, with
printed page AND PDF page, method of verification, and what the sheet currently
says that is wrong. Follow that format exactly. Do this even for entries you then
implement yourself.

**Process Requirement #3 still binds: do not invent rules content.** If a
sourcebook does not state something, record the gap in `AUDIT.md` and implement
the entry's reminder/badge layer without the automated effect, rather than
guessing a number. Several audit entries say this explicitly ("do not invent a
floor", "do not mirror Cursed by the Realm by merely reversing its sign"). A
shipped reminder with an honest gap is worth more than an invented modifier.

**Every entry ships to the same contract as the twelve phases before it:** its
own folder, its own fragment under `src/sheet/`, a stylesheet if it adds any
visual surface, guarded calls from every shared file, its own dotted comment
marker, a kill-switch, a harness, `remove-phase.py`, `test-removal.py`,
`README.md`, `ROLLBACK.md` — and a removal that rebuilds **byte-identical** to a
restore point you record BEFORE you start. `CLAUDE.md` is authoritative on all of
this; the two bugfix folders from today are the most recent worked examples.

⚠️ **SHIP IN INCREMENTS, NOT IN ONE PASS. This is the instruction that matters
most.** You ran out of usage last time and the work was lost because none of it
was committed and pushed. Group the fourteen into small batches by how much NEW
MACHINERY each needs — the ledger's own estimator, and the reason 4.5.6 closed
two entries cheaply while 4.5.10 closed ONE expensively. Take the
badge-and-reminder entries first (Way of the Land, Blackmail, Darling of the
Court, Forbidden Knowledge, Heart of Vengeance, Inheritance's badge half), because
they share a shape and the audit has already approved them. Leave A01 Seven
Fortunes' Blessing and A08 Naishou Citizen for last: A08's price and reminder
both depend on A01, which is a declared dependency and must be written into both
ROLLBACK files.

**After EACH batch: build, run the full combined suite, prove the removal, write
the README and ROLLBACK, commit, push, and report your token usage** (see the
MANDATORY section below). A pushed batch survives your usage running out. An
unpushed one does not — that is the whole lesson of last time, and it is why the
usage figure is reported per batch rather than once at the end: if the limit cuts
you off again, every batch already pushed still has its cost on record.

**Stop when A01–A16 are implemented.** Do not continue into D06 Weakness, Hotei,
Phase 6, or anything else in the roadmap, however tempting. Report and stop.

⚠️ **The audit's UX finding #11 is a live hazard for this work, and it was never
fixed.** The modal card overflow is still open, and the ledger flagged it as a
*prerequisite* to D01's ten-realm picker and D04's seven-Fortune picker — both of
which then shipped through that same modal anyway. Your Fortune picker (A01), realm
picker (A13) and tenet pickers (A03, A09) go into it too. Decide deliberately
whether to fix it first, and say which you chose and why. Do not inherit the
bypass silently just because two phases already did.

=============================================================================
MANDATORY — REPORT YOUR USAGE AFTER EVERY PHASE, IN TOKENS
=============================================================================
**This is a standing requirement, not something to do when asked.** The ledger
records what every phase cost, because build order on this project is partly a
budget decision and the estimates have been wrong in both directions. Claude has
reported a percentage figure after each phase all week. You are asked to do the
same, and to do it better.

**After each phase or batch is built, tested, proven removable and pushed — and
before you start the next one — report:**

1. **The exact token count for that phase.** Input, output and total, if your
   platform exposes them separately. This is the figure that matters most.
2. **Your percentage-of-allowance reading**, if you have one, as a secondary.
3. **What the phase actually contained**, in the terms this project's own
   estimator uses — new fragments, blocks added to shared files, new checks in
   the harness, whether it needed dice-engine or persistence work, and whether a
   real-device correction is still outstanding.

**Why tokens rather than a percentage.** A percentage is relative to an allowance
that differs by plan, by platform and by week, and it resets — so it cannot be
compared across sessions, across models, or against the Claude figures already in
the ledger. A token count is absolute. It is the only cost measure on this project
that is comparable between you and Claude, and the only one that can be regressed
against item (3) above to turn "estimates have been wrong in both directions" into
something predictive. That is the entire point of collecting it: when the owner
next asks *which phase should I build with the budget I have left*, the answer
should come from measured costs against measured machinery counts, not from a
bracket someone felt was about right.

⚠️ **If you cannot read an exact token count, SAY SO PLAINLY AND GIVE THE
PERCENTAGE INSTEAD. Do not estimate a token count and present it as a
measurement.** This matters more here than almost anywhere else in this document,
because the number is going straight into the model that will be used to decide
what gets built next: **a fabricated figure does not merely fail to help, it
corrupts the estimator it was collected to improve**, and it would do so
invisibly, for weeks. An honest "my platform does not expose this, here is the
percentage" is a good answer. A plausible-looking invented number is the worst
possible one. This is the same discipline as the rest of the project — measure,
or say you did not.

**Recording it.** The ledger's cost table at `BUILD-LEDGER.md` currently carries
Week / Phase / Cost. Add a **Tokens** column and a **Measured?** marker
distinguishing a real reading from an estimate. **Leave the historic rows blank
rather than back-filling them** — those phases were never measured in tokens and
inventing figures for them would poison the same data set. Mirror every change
into `BUILD-LEDGER.html`, which is the source of the published artifact, exactly
as the markdown version. Ask the owner for his own percentage reading too; he
watches a meter you cannot see.

=============================================================================
TASK 3 — SPLICE, IN ONE DIRECTION ONLY
=============================================================================
**`main` is authoritative. Your Advantage work is the incoming change.** This is
not a merge of two peers: `main` has moved fourteen shipped items ahead of
anything you last saw, every one with a recorded byte-identical removal proof.
Rebase or re-apply onto `main`; never the reverse, and never force-push.

⚠️ **THE LINE-ENDING HAZARD IS THE BIGGEST RISK IN THIS ENTIRE SESSION.** Git here
is configured `core.autocrlf false` and `core.longpaths true`. **Leave both
exactly as they are.** You are on Windows; every sha256 restore point in every
`ROLLBACK.md` — and `manifest.json`'s `expect_sha256` — was recorded against LF
line endings. If any source fragment round-trips through CRLF, the build's
sha256 changes, and **every removal proof in the project silently stops matching
at once.** That would not break the sheet; it would destroy the project's ability
to prove any rollback, which is the contract the whole build is written to. Check
this FIRST, check it again before you push, and if you find CRLF anywhere in
`src/`, stop and report rather than "fixing" it in bulk.

Also on the splice, concretely:
- **`build/manifest.json` is the collision point.** Order in it IS the build
  order. Your new fragments need entries in the right positions, and
  `expect_sha256` must be updated to the new build. Both bugfixes from today
  already touch this file.
- **`src/sheet/100-dice-engine.js`, `110-modals-trackers.js` and
  `210-test-seam-and-init.js` are the shared files** that now carry multiple
  phases' marked blocks. `100-dice-engine.js` alone carries Feature 4.5.12's two
  Bishamon blocks plus both of today's bugfixes' blocks. Add your blocks with
  your own markers; **never restore a whole-file snapshot over one of these** —
  `BUGFIX — Negative Roll Modifier Display/ROLLBACK.md` explains exactly why that
  would silently delete other phases' work.
- **The seam.** Your keys go into `window.__L5R_TEST__` via a guarded
  `Object.assign()` **after** the main object literal, never as inline properties
  inside it: a bare reference to an undeclared identifier there throws while
  constructing the seam object, taking the entire seam and all of `init()` with it.
- **Run `qa/feature-dependencies.py`** and get exit 0. It attributes every
  reference to whichever phase owns it. Note that its `MARKER_RE` is
  case-insensitive and captures only the bare word `BUGFIX` from a BEGIN line,
  which has two consequences: a bugfix remover must include `"BUGFIX"` in its
  `OWN_MARKERS`, and **no block may name another phase's bugfix by name in its
  own prose** or the checker attributes it wrongly.

=============================================================================
TASK 4 — PROVE THE SPLICE BROKE NOTHING. BE SPECIFIC ABOUT WHAT THAT MEANS
=============================================================================
"Nothing broke" is not a suite number. Produce all of the following, with the
actual figures, and say plainly which you could not run:

1. **The combined suite, before and after.** It reads **992/992** on `main`
   today. After the splice it must read 992 + your new checks, with **zero**
   pre-existing checks lost. A drop of even one is a regression, not a fixture
   that "needed updating" — if you believe a pre-existing check is genuinely
   wrong, say so as a finding and get a ruling; do not edit it into agreement.
2. **`--verify` on the build**, and `python3 build.py --check-drift`.
3. **`qa/inventory.py`** in the Phase 0 folder, diffed against its baseline:
   element IDs, the ten sections, `.roll-modal-overlay` count, tag balance. The
   invariant is that a build does not CHANGE these, not that they hit a number.
4. **Every new harness proven able to fail.** Run each against a deliberately
   broken build and quote BOTH numbers. Better: revert each decision the phase
   encodes, ONE AT A TIME, and confirm the intended check goes red ALONE. This
   exercise has found real defects in two of the last three items shipped — a
   guard protecting two things instead of one, and a kill-switch that was
   decorative because nothing read it. **A switch that is declared but never READ
   is not a switch.** Check yours are load-bearing by flipping them.
5. **Byte-identical removal** for each new folder, run against a `/tmp` copy of
   the Phase 0 tree, rebuilt and compared to the restore point you recorded
   before starting.
6. **The removal in the other direction:** with all your new work removed, every
   retained suite must still pass in full — today that number is **980/980** with
   the newest bugfix removed.
7. **Edge cases the audit already names per entry.** Each A-entry's "Removal/tests"
   line lists them: missing/invalid/fractional input, switching a selection and
   clearing stale fields, save/load/import/export round-trip, repeated
   recalc/reload not re-granting anything, Clan pricing combinations, and the
   character's purchased ranks and XP left unchanged. These are not optional
   extras; they are the approved acceptance criteria.
8. **Persistence and schema.** Phase 4.5.2 wrote a private schema-3 adapter. Your
   new config objects must round-trip through it, and an OLD save must still load.
   Test a save written before your work against the build after it.

⚠️ **Say honestly what you did not verify.** A real-device pass is the owner's
job — he tests on an iPhone and reports back — and the first real-device test of
this project found two genuine bugs in an afternoon. Also: **a pixel width
measured in a headless browser is not one a real device renders.** In the cloud
sandbox the Google Fonts never load and `document.fonts.check()` still returns
`true` anyway. If you are on a desktop with real network access your font
metrics are more trustworthy than a cloud session's, but the iPhone's are not
yours either. Design geometry fixes so they do not need to know a word's exact
rendered width at all — that is the only kind that has held.

=============================================================================
TASK 5 — AUDIT CLAUDE'S WORK FROM THIS WEEK
=============================================================================
Once the splice is proven, audit the fourteen items Claude shipped w/c 16
September. This is a **verification** pass, not a code review for taste: the
claims are all written down and all of them are testable. Do not take a
README's word for anything you can run.

Test these claims specifically:
- **Every "byte-identical removal" claim.** Twelve phases and two bugfixes each
  record a pre-fix sha256 and byte count in their `ROLLBACK.md`. Run each
  `remove-phase.py` against a `/tmp` copy, rebuild, and compare. **Always pass an
  explicit `/tmp` path.**
- ⚠️ **THE DEAD LIVE-TREE GUARD, which is the most likely thing to bite you.**
  Every Part I `remove-phase.py` before 4.5.11's resolves the live tree as
  `parents[3]/"Part F — …"`, but `parents[2]` is `Versions/` and `parents[3]` is
  the repo root — a path that has never existed. So the refusal has always been
  **decorative**, and it was found the hard way by a run intended to DEMONSTRATE
  the refusal, which instead executed against the live tree. 4.5.11's, 4.5.12's
  and both bugfixes' are fixed. **Never pass the live tree "to watch it refuse",
  because it will not.** The count of affected removers was corrected from "ten"
  to **eight** (4.5.3–4.5.10) on 17 September, crediting 4.5.2 as already
  correct — **re-derive that count yourself across all thirteen folders and say
  whether eight is right.**
- **The two bugfixes' kill-switches are load-bearing.** Flip
  `MASTERY_RANK_LABEL_FIX_ENABLED` and
  `NEGATIVE_ROLL_MOD_DISPLAY_FIX_ENABLED` to `false`, rebuild, and confirm the
  suite goes red in the numbers their READMEs claim (4/12 for the negmod fix).
  The second one was decorative on first writing and was only caught by this
  exercise; check the first one has not the same defect.
- **The cost table's arithmetic.** It reconciles to 92% when I add it
  (8+9+7+5+12+4+4+18+7+8+4+6), but check the column against the narrative — the
  ledger has carried stale figures before, and two figures in its own review
  notes were corrected this week after measurement contradicted them.
- **The `Ten Dice Rule bonus: +N` note is still malformed and was left that way
  deliberately.** The claim is that it can only malform when `totalDelta` is
  non-zero, which is exactly when `attachRollModifierBreakdown()` hides it.
  `NEGMOD-HIDDEN-01` is supposed to pin that. **Verify both halves of that
  argument independently** — this is the one place today's work knowingly left a
  visible defect in the code, and the reasoning deserves a second pair of eyes.
- **The still-unconfirmed negmod case.** A real Ten Dice Rule bonus present but
  *outweighed* by a larger wound penalty — net negative from two opposite-signed
  contributions — has only ever been seen in the harness, never on a device. If
  you can drive it, do, and report.
- **The mastery-rank labelling wording.** It went through a revision after device
  feedback: it now reads `Kenjutsu mastery from Rank 3: +1k0 → 6k2`, naming the
  rank as the SOURCE rather than as a prefix, because `Kenjutsu Rank 3 mastery`
  read as "[Kenjutsu Rank 3] mastery". Check the accumulating tables
  (`dmgBonus`, `reductionMod`) name every contributing threshold while the
  superseding one (`explodeOn`) names only the lowest unlocked value's — that
  distinction is deliberate and is the part most likely to be subtly wrong.
- **Anything the roadmap or ledger asserts that the code does not do.** Four
  confirmed drifts between the QA document and the code were the headline finding
  of your own August audit. Look for more.

Report findings as findings. If Claude's work is sound, say so — that is a useful
result. If it is not, name the file, the line and what you ran.

=============================================================================
TASK 6 — ASSESS CLAUDE'S RECOMMENDATION, AND DISAGREE IF YOU SHOULD
=============================================================================
The Claude allowance for w/c 16 September is at **92% with 8% left**, and the
week resets around **02:00 BST on Wednesday 23 September** — roughly six days
away. Asked what to do with the remaining 8%, Claude recommended, verbatim in
substance:

> **Spend none of it on new feature work, and hold the 8% as a device-correction
> reserve for the two bugfixes shipped on 17 September.** Nothing in the queue
> fits: Hotei is 12–18%, the Part I wrapper-folder-and-dead-guard cleanup is
> 6–10%, and D06 Weakness is deliberately held to START a week rather than end
> one. The ledger's own rule is to budget a phase's real-device correction as
> part of the phase, and both of today's fixes shipped hours ago with one known
> unconfirmed case between them. Six days is a long window for a device report to
> arrive, and having nothing left to fix it with is the specific mistake this
> ledger keeps recording. Separately, the ammo-picker product ruling costs zero
> budget and should be given now so that item can be costed and built first thing
> next week.

Claude also recorded its own doubts about that recommendation, and you should
weigh them rather than just noting them:

1. If a device report never arrives before the reset, the 8% expires unused and
   worthless. "Hold a buffer" is advice that can never be proven wrong, which is
   exactly what makes it suspect.
2. The Part I wrapper-folder cleanup was the one item genuinely arguable at this
   size — bounded by counting rather than by design risk, and it ships no UI, so
   it is the only queued item with no device correction to budget for, which is
   the very rule that makes everything else unaffordable. Claude argued it should
   wait until AFTER your splice, on the grounds that you are about to add more
   folders and more removers and the move would otherwise be done twice. That
   ordering argument may be wrong.
3. The entire budget model runs on the owner's subjective readings of a
   percentage meter, not measured token counts, and is being treated with a
   precision it may not deserve.

**Assess this specifically.** Say whether you agree, and if not, what you would
do instead and why. Consider in particular:
- whether the wrapper-folder cleanup should go before or after your splice, and
  whether your work makes it cheaper or more expensive;
- whether your splice and audit will itself generate Claude-side work — a
  correction, a fixture fix, a conflict only a cloud session can resolve — that
  the 8% ought to be reserved for instead;
- whether D06 Weakness or Hotei genuinely needs a fresh week, or whether the
  machinery now shipped has made either cheaper than its estimate;
- whether closing A01–A16 changes the roadmap's recommended build order at all;
- whether anything in your audit of this week's work should outrank all of it.

**Explain your reasoning.** A different recommendation with a stated argument is
more useful than agreement.

=============================================================================
THE NON-NEGOTIABLES
=============================================================================
- **CHECK THE PREMISE LIVE BEFORE BUILDING.** Every phase across both weeks found
  at least one audit description or assumption that was wrong or overstated when
  actually driven. 4.5.12's first measurement overturned the design it was scoped
  with. Measure first; let the measurement change the design. This applies to
  YOUR OWN AUDIT too — it is a document, not a measurement.
- **MEASURE BEFORE DECLARING SOMETHING BLOCKED.** This is a standing lesson with
  two worked examples. 4.5.11 called a Social Skill list source-gated and was
  wrong, because 4.5.2 had already shipped it as `D45.socialSkills`. Hotei's
  "no structured Void-cost field exists anywhere" was also false — `KIHO_LIBRARY`
  has one. Before you record any of A01–A16 as blocked, grep for the data.
- **A HARNESS MUST BE ABLE TO FAIL. PROVE IT.** Part H Phase 1 shipped a feature
  broken on every tab while its own harness read 15/15, because the harness asked
  the code under test what the truth was. Where a fact can be read from something
  the phase does not own, take the oracle from there.
- **SILENCE IS A DISPLAY BUG.** On a configured, paid-for entry, showing nothing
  reads as "not implemented" rather than "does not apply here". A `null` return
  that means several different things will be reported as broken — 4.5.12's
  correction is the worked example, where one `null` was doing triple duty across
  three cases that were not alike.
- **SOME FIELDS ARE DISPLAYS, NOT STATE.** `#f_school` is re-rendered from
  `getSchoolsList()` on every recalc, so a harness that writes to it watches the
  value snap back and concludes the feature has latched. Before driving a control
  from a test, check whether `recalcAll()` rewrites it.
- **Do not modify previous phases or layers.** Do not add animation or motion —
  a full motion layer was built, reviewed and rejected. Do not replace the native
  CSS scroll-snap page slide. Phones do not get the circular Ring layout.
- **Finish each phase by updating** `AUDIT.md`, `BUILD-LEDGER.md`,
  `BUILD-LEDGER.html`, `CLAUDE.md`'s folder map, then commit and push — **and
  report that phase's token usage**, which is mandatory and has its own section
  above. The ledger's cost table wants a line per item.
- **Ask before destructive or outward-facing actions.** And ask me for a ruling
  rather than picking for me — the ammo-picker question is open precisely because
  nobody guessed at it.

=============================================================================
WHAT I WANT FROM YOU FIRST
=============================================================================
Before you write any code, tell me:
1. **An inventory of where you had actually reached** (Task 1) — including which
   sourcebook extractions live only in this conversation and not yet in
   `AUDIT.md`, and which details of your own recollection you are not certain of.
2. **Your understanding of the current state** — including anything in THIS
   PROMPT you think is now wrong. It was written by Claude at the end of a long
   session; previous versions of this document have carried stale figures, a
   NODE_PATH that did not exist, and at least one constraint that had already
   been lifted. Correct it rather than inheriting it.
3. **Your plan for the fourteen Advantages**, batched, with which batch you would
   ship first and why — and which entries you expect to be genuinely blocked even
   with the sourcebooks in front of you.
4. **Your assessment of Claude's recommendation** (Task 6).
5. **Whether you can read your own exact token usage**, and if so how — so we
   know before the first phase whether the ledger is getting measured token
   counts or percentage readings. Say plainly if you cannot.

Then stop and wait for my confirmation before writing code.
