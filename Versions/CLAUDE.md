# L5R Character Sheet — project instructions

A single self-contained HTML character sheet for Legend of the Five Rings 4th
Edition. No build system, no dependencies: each version is one HTML file with all
CSS, JavaScript and artwork inlined, opened directly in a browser.

**Live at <https://l5r-character-sheet-creator.pages.dev/>** — Cloudflare Pages
rebuilds and redeploys on every push to `main` (Part F, Phase 0.5). The link is
open and unauthenticated; the repository stays private. Those are two separate
things and only the second is enforced by anything.

The roadmap at `Versions/L5R Character Sheet Phased Roadmap reorder.md` is the
single source of truth for planned work. Everything under `Versions/Old roadmaps/`
is superseded — historical record only, not a reference for current planning.

---

## Folder convention — follow this exactly

Every feature or substantial change gets **its own clearly labelled folder**, and
**every new file it produces goes inside that folder**. Never add files alongside
an existing version's trunk, even when that trunk is what is being modified.

> **Two standing exceptions, both at the repo root, both thin entry points.**
>
> 1. **`build.py`** — Phase 0.5 put it there because a CI build command is typed
>    into a web form, and pointing that form at a path containing spaces and
>    em-dashes is a failure waiting to happen. It holds no logic: it locates and
>    delegates to the highest deploy phase present.
> 2. **`.github/workflows/android.yml`** — Phase 0.7's APK build. Forced, not
>    chosen: GitHub reads workflows only from `.github/workflows/` and offers no
>    way to point it elsewhere. Kept to the same shape as the first — it installs
>    tools and calls `PART F — Phase 0.7 …/build/ci_build_apk.sh`, where every
>    decision actually lives.
>
> Rolling back either phase means deleting its folder **and** its root file; both
> `ROLLBACK.md` files say so. The precedent is narrow: a root-level file is
> allowed only when an external tool dictates the path, and only as a delegator
> with no logic of its own. Raise it before adding a third.

There are now **two nesting levels**, not one:

- **Level 1 — theme wrapper.** `Part <Letter> — <short theme phrase>` (Title-case
  "Part"). One per Part letter that has more than one build folder under it.
  Existing wrappers: `Part C — Advanced combat engine`, `Part D — Improved UI`,
  `Part E — Monks`. This level exists purely for browsability — a Part's folders
  used to sit loose at `Versions/` top level and had grown too numerous to scan.
- **Level 2 — feature/phase folder** (this is the unchanged unit from before the
  reorg). `PART <LETTER> — Feature <n[.n]> <Description>` for Parts B–E, or
  `PART <LETTER> — Phase <n[.n]> <Description>` for Part F onward (see the
  Feature-vs-Phase naming rule below) — nested inside its theme wrapper either
  way. This is still the folder that owns rollback: its own `ROLLBACK.md`, its
  own copies of every sidecar it needs. Nothing about how this folder is built
  or what it contains changed — it just lives one directory deeper than it
  used to.

A Part with only one build has **no wrapper** — it stays directly under
`Versions/` (e.g. `Part B — CORE WEAPONS SYSTEM`). Non-Part categories were never
wrapped and still aren't: the `BUGFIX — School Skill Free Rank on Reload` folder
and the `00 Build History` archive sit flat at `Versions/` top level, same as
always.

**Starting new work:**
- Adding to a Part that already has a wrapper → put the new feature/phase folder
  inside the existing wrapper, alongside its siblings.
- Starting a Part's very first folder, general case → create it flat (no
  wrapper) at `Versions/` top level. Only add a wrapper once a second folder for
  that same Part letter shows up — then move both into it together.
- **Exception: Part F.** Its wrapper (`Part F — Cross-Platform Delivery`) was
  created alongside Phase 0's own folder, before a second Part F folder
  existed — a deliberate deviation from the rule above. The roadmap's
  Recommended Build Order already fixes Phases 0.5, 0.6, and 0.7 as the very
  next three phases built, all under Part F, making a near-term second folder
  a certainty rather than a maybe. Don't read this as license to jump straight
  to a wrapper for other Parts on similar reasoning — confirm with the user
  first, the way this one was confirmed.

The Part letter is a **thematic** grouping, not chronological:

- **Part B** — core weapons system
- **Part C** — combat engine (ranges, stances, wounds, Void, ammo, dual-wielding, schools)
- **Part D** — UI and presentation
- **Part E** — monks and kiho
- **Part F** — cross-platform delivery (source reorganization, hosting, installable web app, native Android app)

When work moves into a genuinely new theme it gets a new Part letter. An
increment to existing work gets a point release in its **own new folder** —
never by editing the previous stage's folder. Ask which Part something belongs
to if it is not obvious.

**Feature folders (Parts B–E) vs. Phase folders (Part F onward).** Parts B
through E predate the phased roadmap and number their folders sequentially per
Part: `PART <LETTER> — Feature <n[.n]> <Description>`, restarting at 1 for each
new Part letter. Leave that historical naming alone — don't rename existing
folders to match the scheme below.

Part F onward is driven by `Versions/L5R Character Sheet Phased Roadmap
reorder.md`, whose own Phase numbers are stable cross-reference identifiers —
the roadmap explicitly keeps them fixed regardless of build order or which Part
a phase is filed under, so one phase can say "needs Phase 1.5" and have that
stay true permanently. Folder names preserve that traceability instead of
relabeling it: `PART <LETTER> — Phase <n[.n]> <Description>`, using the
roadmap's own phase number verbatim, never a re-sequenced "Feature N."

If a task prompt prescribes a folder name that clashes with this convention, raise
it rather than following it silently.

## Rollback is a requirement, not a nicety

Each layer must be removable by **deleting its folder**. That means:

- the previous layer's folder is left exactly as found
- build scripts reference the untouched trunk by **relative path**, never copying
  or mutating it
- every new folder ships a `ROLLBACK.md` explaining how to revert
- each layer carries its own copies of build inputs, so layers stay independent

**The theme-wrapper level above does not change any of this.** A feature folder's
rollback promise is unaffected by which wrapper folder it happens to sit inside —
deleting `Versions/Part E — Monks/PART E — Feature 1.1 Monks & Kiho (Part D UI)/`
removes that layer exactly as cleanly as it did before the reorg. You just
navigate one directory deeper to find it. Relative sibling references inside
splice scripts (e.g. a layer's `TRUNK_DIR = os.path.join(HERE, os.pardir, "PART E
— Feature 1 Monks & Kiho")`) still resolve correctly precisely because a trunk and
every layer built on it were always moved into the *same* new wrapper together —
their sibling relationship to each other never changed, only their shared parent
did.

### Every feature must be surgically removable — build them that way

**This applies to every feature phase from here on, not only the ones that already follow it.**
The standing requirement, in the project owner's own words: if the instruction is "remove
feature X" or "undo feature Y", that feature comes out cleanly and nothing else in the sheet is
harmed — not the features already built, and not the ones built after it. The one accepted
exception is a feature another feature genuinely *depends* on; that removal is allowed to be a
larger job, but only if the dependency was **declared up front** rather than discovered halfway
through.

Every feature phase already gets its own folder, its own new fragment under `src/sheet/`, and
its own `ROLLBACK.md`. What makes it *removable* is how it touches the handful of files every
phase shares — `110-modals-trackers.js`, `210-test-seam-and-init.js`, `10-sheet-base.css`, and
whichever markup file it hooks into. Three rules:

1. **Guard every call from a shared file into the phase's own fragment**:
   `if (typeof someFragmentFunction === 'function') someFragmentFunction();`. Deleting the
   fragment then makes the call a silent no-op instead of a `ReferenceError` that would abort
   whatever shared code runs after it — including, for a hook inside `init()`, everything else
   `init()` was still going to do. This applies to the `window.__L5R_TEST__` seam export too:
   a phase's seam keys go in via a guarded `Object.assign()` *after* the main object literal,
   never as inline shorthand properties inside it, because a bare reference to an undeclared
   identifier there throws while *constructing* the seam object itself, taking the whole seam
   and all of `init()` with it.
2. **Mark every block the phase adds to a shared file** with that phase's own comment marker
   (`PART H PHASE <n>`, matching the folder-name convention above), placed **above** the first
   line of the block — above the `if`, not inside it, and above an attribute-only change such
   as an `id=` added to an existing element. A marker one line too low leaves the block's own
   first line attributed to whichever phase is above it.
3. **Keep the phase's whole surface inside those marked blocks.** Anything of the phase's that
   lives outside them — a function another feature calls, an element another feature reads — is
   a dependency, and falls under the rules below.

Together these make a **surgical removal** (delete only the blocks carrying this phase's marker,
plus its own fragment file and manifest entry, then rebuild) correct no matter how many other
phases have since added their own blocks to the same files. That is the primary rollback method
in each phase's `ROLLBACK.md`, with the exact blocks listed and the numbers verified against a
real scratch removal rather than asserted.

#### Dependencies: allowed, but declared

Three different things get called "a dependency" and only one of them is a problem:

- **On the trunk** — the phase calls `recalcAll()`, `renderWounds()`, `SKILL_LIBRARY`, the
  carousel's own API. Normal, needs no declaration: core sheet code is not going anywhere, and
  removing the phase simply stops calling it.
- **On another removable feature** — the phase calls a function, or reads an element, that
  another optional phase owns. **Allowed, but must be declared in both phases' `ROLLBACK.md`
  before shipping**: the depending phase says what it needs, and the depended-on phase says who
  would break if it were removed. Removing the depended-on feature is then a known compound
  operation (remove both, or sever the dependency first) instead of a silent breakage
  discovered later.
- **A comment-only mention** — one phase's comment refers to another phase's class or function
  to explain a design choice. Not a dependency; removing the other phase leaves a stale sentence
  and nothing else. Worth a line in `ROLLBACK.md` so it can be tidied, not worth avoiding. There
  is one today: Phase 2's CSS comment explains that its toggle button matches
  `.scroll-top-btn`'s visual language, which is Phase 1's class.

#### Checking it mechanically, before shipping and before removing

`qa/feature-dependencies.py` (in the Phase 0 folder, alongside `inventory.py`) answers "who else
references this feature's surface?" without relying on anyone's memory. It reads the phase's own
fragment for the names it declares, finds every reference to them across `src/`, and attributes
each one to whichever phase marker is in effect at that point in the file:

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
python3 qa/feature-dependencies.py src/sheet/207-feat-clan-theming.js "PART H PHASE 9" \
  --also cfsSection clanMonWatermark clanMonColophon clan-mon-watermark clan-mon-colophon clan-mon-url
```

`--also` takes the markup IDs, CSS classes and custom properties the phase introduces, which
are not JS declarations and so cannot be found automatically — take them from the phase's own
`ROLLBACK.md`, which lists what it added. Exit 0 means every reference sits inside a block that
phase's marker owns, so surgical removal already covers all of them. Exit 1 lists the ones that
don't: each is either a block still missing its marker (fix the marker) or a genuine dependency
(declare it, per above). Run it when a phase is built, and again before removing one.

It has been shown to fail for the right reason: injecting an unguarded call to Phase 1's
`scrollToTop()` into Phase 2's fragment made it report that reference, attributed to Phase 2,
against an otherwise-clean tree.

#### Re-verify removability at the END of a phase, against the code as it now stands

**Mandatory, every phase, no exceptions — and "I proved it earlier" does not count.** A phase is
not finished until its removability has been demonstrated against the *current* tree.

The reason is not pedantry. Between a phase's first removal proof and the end of that phase, the
tree typically moves several times: bugfixes land, real-device feedback gets actioned, a later
phase adds blocks to the same shared files, comments get reworded. Any one of those can quietly
invalidate the proof, and none of them looks like it touched removability.

Part G Phase 4 is the worked example, and it is why this rule exists. Its removability was
proven clean when it was built. Several rounds of feedback later — a layout fix, a CSS class
split, a reworded comment — a re-run of `qa/feature-dependencies.py` found that the phase's
base-pool CSS marker had **no marker after it**, so it had silently taken ownership of four of
Phase 3's rules. Following that phase's own `ROLLBACK.md` would have deleted them. Nothing in
the intervening work looked like it had anything to do with ownership; review had not caught it;
only re-running the checker did.

So, at the end of every phase, before calling it done:

1. **Re-run `qa/feature-dependencies.py`** for the phase's fragment. Read the report, not just
   the exit code — exit 1 is correct and expected where a dependency is genuinely declared, and
   the checker matches comment prose as well as code, so a class name mentioned in a comment
   shows up as a hit. Both are fine; what matters is that every line in the report is one you
   can account for.
2. **Actually perform the removal in a scratch copy** — delete the fragment, its manifest entry,
   and *only* the blocks carrying its marker — then rebuild and run every OTHER phase's harness.
   All must pass in full. Have the removal script **assert** that what it deletes contains
   nothing belonging to another phase, so the proof fails loudly rather than passing by luck.
3. **Quote both numbers in the phase's README** — the live build and the removed build — as
   measured on that run, not copied from an earlier one.

**The most common way this check earns its keep is marker-shaped PROSE.** `MARKER_RE` is
case-insensitive, so a comment that says "Part G Phase 3's roll-preview row" to explain whose
class it is styling is parsed as a real ownership marker and hands everything after it to that
phase. Three phases have now hit this — Phase 8, Part I Phase 4.5, and Part I Feature 4.54 — and
review caught none of the three. **Write the reference as "Phase 3 (Part G)", never in marker
order**, whenever a comment names another phase.

A marker owns every line from itself until the next marker. A block added at the end of a
phase's own section therefore swallows whatever follows it unless a marker hands ownership back;
`/* ---------- PART <X> PHASE <n> (continued) ---------- */` is how that is done. And never let
one rule or one statement be shared between two phases — a grouped CSS selector covering both
phases' classes cannot be surgically removed by either. Duplicate the few declarations instead;
unambiguous ownership is worth more than the duplication costs.

#### The whole-file `originals/` restore is a fallback, not the method

Each phase's `originals/` copy is frozen at the moment that phase was built. Restoring it
silently deletes every block any *later* phase has since added to the same file, with no error
to point at why — confirmed by diffing Phase 1's `originals/` copy of
`210-test-seam-and-init.js` against the live file, which carries Phase 2's and Phase 9's blocks
that Phase 1's snapshot does not. Use the surgical method; treat the snapshot restore as a
historical fallback that only still works once you have confirmed nothing later touched the
same files.

## Current structure

There are now **three trunks**, and which one you are working from is the first thing to
establish. The first two are single-file trunks: a trunk holds the sheet's own `<script>` —
all the game logic — and a layer holds only presentation, generated from a trunk by a splice.
The third, opened by Part F Phase 0, is a different shape: a **split source tree** that a
recombine step assembles into the same single file. It is the head.

```
Versions/
├── Part B — CORE WEAPONS SYSTEM/                        (single build, no wrapper)
│
├── Part C — Advanced combat engine/                      theme wrapper
│   ├── PART C — P1 P2 PREREQUISITES/
│   ├── PART C — FEATURE 0 EMPHASIS REROLL/
│   ├── PART C — Feature 1 Range & Range Penalties/
│   ├── PART C — Feature 2 Stance System/
│   ├── PART C — Feature 3 Wound Penalties/
│   ├── PART C — Feature 4 Void Automation/
│   ├── PART C — Feature 6 Ammo Tracking/
│   ├── PART C — Feature 7 Dual-Wielding/
│   ├── PART C — Feature 7 Dual-Wielding (Updated Stance Icons)/
│   ├── PART C — Feature 8 Mirumoto Rank 1/     trunk (pre-monk) — READ ONLY
│   └── PART C — FULL COMBAT ENGINE/
│
├── Part D — Improved UI/                                 theme wrapper — six layers, all on the Part C trunk above
│   ├── PART D — Feature 1 swipe/                                   swipe-tab carousel
│   ├── PART D — Feature 1.1 Swipe Mobile Optimization & Cross-Device Testing/
│   ├── PART D — Feature 2 Circular Ring Layout/                    circular rings
│   ├── PART D — Feature 2.1 Ring DOM Order, Void Card Fit and Harness Fixes/
│   ├── PART D — Feature 3 Gold d10 Roll Buttons/                   gold d10 buttons
│   └── PART D — Feature 3.1 Larger Roll Button d10/                 34px die
│
├── Part E — Monks/                                       theme wrapper
│   ├── PART E — Feature 1 Monks & Kiho/          trunk (single-file, superseded)
│   └── PART E — Feature 1.1 Monks & Kiho (Part D UI)/   layer on Part E — the input Phase 0 split
│
├── Part F — Cross-Platform Delivery/                     theme wrapper
│   ├── PART F — Phase 0 Source Reorganization for Maintainability/
│   │                                             trunk (CURRENT) — split source tree, edit here
│   ├── PART F — Phase 0.5 Hosting & Deployment Pipeline/
│   │                                             deploy: Cloudflare Pages builds from Phase 0
│   ├── PART F — Phase 0.6 Installable Web App/
│   │                                             PWA: manifest, service worker, icons, offline
│   └── PART F — Phase 0.7 Native Android App/
│                                                 Capacitor wrap; APK built by GitHub Actions
│
├── Part H — Sheet UI-UX/                                 theme wrapper (roadmap's own header names
│   │                                             this Part "Sheet UI/UX"; a folder name can't hold
│   │                                             a literal "/", so the wrapper substitutes a hyphen)
│   ├── PART H — Phase 1.6 Combat Tab Streamlining/
│   │                                             feature phase; edits Phase 0's fragments directly
│   │                                             (see its own README's "Why this phase's code lives
│   │                                             in Phase 0, not here"), keeps its own rollback +
│   │                                             QA + a git-committed copy of every fragment it
│   │                                             touched, pre-edit, in its own originals/
│   ├── PART H — Phase 1 UI-UX Foundations/
│   │                                         feature phase; scroll-to-top button, in one new
│   │                                         fragment (205-feat-ui-foundations.js) plus small
│   │                                         wiring touches to three existing ones; same
│   │                                         originals/ + rollback + QA model as Phase 1.6.
│   │                                         A Ring affinity/deficiency accent was also built
│   │                                         here and shipped, then reverted at the project
│   │                                         owner's request after seeing it live — see the
│   │                                         phase's own README, "Reverted: the Ring accent"
│   ├── PART H — Phase 2 Quick-Access Sidebar/
│   │                                         feature phase; toggle button + overlay panel
│   │                                         mirroring Void/Spell Slots (incl. the shared
│   │                                         Bonus pool)/Wounds/Armor TN/Initiative, in one
│   │                                         new fragment (206-feat-quick-access-sidebar.js)
│   │                                         plus small wiring touches to two existing ones;
│   │                                         same originals/ + rollback + QA model as Phase
│   │                                         1.6. Own harness caught a live-update gap (four
│   │                                         of the sheet's own controls bypass recalcAll())
│   │                                         in two rounds — three before shipping, the
│   │                                         Bonus-pool one after a real-device tester noticed
│   │                                         it was missing entirely — see the phase's own
│   │                                         README, "The gap this phase's own harness caught"
│   │                                         and "The Bonus line"
│   └── PART H — Phase 9 Clan-Themed Look/
│                                             feature phase; per-Clan colour override of the
│                                             sheet's own --shu* CSS tokens (confirmed by grep
│                                             that every button/active-tab/heading sheet-wide
│                                             already reads from them -- no new CSS needed for
│                                             the recolour itself), plus mon watermark + a
│                                             tab-bar colophon, in one new fragment
│                                             (207-feat-clan-theming.js) plus small wiring
│                                             touches to three existing ones. Two colours
│                                             (Delete button, worst wound severity) pinned to
│                                             the real maroon regardless of Clan -- see the
│                                             phase's own README. Built with an explicit
│                                             one-line kill-switch (CLAN_THEME_ENABLED) on top
│                                             of the usual originals/ + rollback model, per the
│                                             project owner's own request for easy reversal.
│                                             Real-device feedback afterwards found the Void
│                                             Points pips following the Clan colour; fixed by
│                                             moving the TRUNK's own .void-pip rule onto
│                                             --void-slot-color (Void's element grey, already
│                                             read by .spell-pip-void). That edit is NOT inside
│                                             this phase's marked CSS block and deliberately
│                                             OUTLIVES its removal -- declared in the phase's
│                                             ROLLBACK.md under Dependencies
│   └── PENDING FEEDBACK — Real-Device UX Notes.md
│                                             not a phase folder; real-device feedback on Phases
│                                             1/2/9 (Void pip colour, tab-bar colophon placement,
│                                             floating-button clutter). The Void pip is now DONE
│                                             (see Phase 9 above); the other two stay parked at
│                                             the project owner's explicit instruction
│

├── Part G — Combat & Roll Engine/                        theme wrapper (created when Phase 3
│   │                                         became Part G's second folder; Phase 1.5 was moved
│   │                                         in alongside it, per the convention above)
│   ├── PART G — Phase 1.5 Roll Pipeline Consolidation/
│   │                                         audit-only phase; edits nothing in Phase 0 (reads
│   │                                         the existing pipeline through window.__L5R_TEST__
│   │                                         and documents it), so rollback is plain
│   │                                         delete-the-folder — see its own ROLLBACK.md
│   └── PART G — Phase 3 Smart Roll Preview/
│                                             feature phase; gates every pipeline roll behind a
│                                             pre-roll modal showing the pool, its modifiers, the
│                                             TN where one exists, and any Void Point worth
│                                             spending. Small because the audit found the
│                                             calculating half already existed and was already
│                                             pure (getPreRollModifiers/applyPreRollModifiers) —
│                                             this renders the pipeline's own numbers rather than
│                                             computing its own. Ticking a Void option projects
│                                             via the pending flag only, so Cancel costs nothing;
│                                             Confirm commits through the canonical spendVoid().
│                                             Own kill-switch (ROLL_PREVIEW_ENABLED) on top of
│                                             the usual originals/ + rollback model
│   ├── PART G — Phase 4 Explain This Roll/
│                                             feature phase; makes the BASE pool self-describing
│                                             the way Phase 3 made the modifiers. Each caller now
│                                             DECLARES the parts it already computed (Trait,
│                                             Skill Rank, Ring, School Rank and the rank it had
│                                             before Affinity moved it) on the roll context --
│                                             numbers only -- and one pure function in
│                                             209-feat-roll-breakdown.js shapes them into rows
│                                             shown in both the preview and the result. It never
│                                             recomputes a pool: what is not declared is not
│                                             claimed, and declared parts that do not reconcile
│                                             with the real pool print one honest "Base pool" row
│                                             rather than a decomposition that disagrees with the
│                                             roll. Also closed a gap -- the post-roll bar used
│                                             to appear only when a modifier applied, so a plain
│                                             unmodified roll was the one roll that could not be
│                                             explained at all. SOFT two-way dependency with
│                                             Phase 3, declared in both ROLLBACK.md files and
│                                             measured in both directions: either phase can be
│                                             removed alone, in either order. Own kill-switch
│                                             (ROLL_BREAKDOWN_ENABLED)
│   └── PART G — Phase 6 School Technique Text/
│                                             2 Oct, branch claude/phase-6-technique-text (one release
│                                             with BUGFIX — Technique Name Clashes beneath it). FIRST
│                                             RELEASE of Phase 6: the text of the 72 School Techniques
│                                             that had none (all 20 Minor Clan and Mantis Schools), our
│                                             own words with book and page (Core pp.120-122, 216-227;
│                                             Great Clans pp.166-169; Secrets p.238). ONE FRAGMENT
│                                             (209.999995, PART G PHASE 6, TECHTEXT6_ENABLED, object
│                                             TECHTEXT6) + one seam block (technique-text-seam). Adds
│                                             entries to TECH_DESCRIPTIONS; a name already described is
│                                             reported (TECHTEXT6.clashes), never overwritten; the load
│                                             check reports any School Technique left without text.
│                                             qa/own-words-check.py: no text shares a run of 8+ words
│                                             with the book (book text from a scratch folder only).
│                                             DEPENDS ON the Technique Name Clashes fix for saved
│                                             characters (its row rewrite) and the Toku Bushi's Rank 4
│                                             (its rename) -- remove this phase first. SynergyEngine,
│                                             Void costs and automation are later releases.
│                                             21/21 own, 9/21 on main; full suite 3,666/3,666;
│                                             8/8 variants, both boundaries green; byte-identical
│                                             removal to b17b8584. MERGED 2 Oct, before the iPhone check.
│
├── PART I — Phase 4.5 Modal-Configured Advantages-Disadvantages/
│                                             Part I's first folder, which is why it sits FLAT at
│                                             Versions/ top level with no wrapper.
│                                             ⚠️ THE WRAPPER IS NOW OVERDUE AND DELIBERATELY NOT
│                                             CREATED. There are ELEVEN Part I folders at top level
│                                             as of Feature 4.5.10 (this one, the Remaining
│                                             Configuration Audit, and 4.5.2 through 4.5.10) --
│                                             this note said "four" when it was written and was not
│                                             updated for seven releases; treat the count as
│                                             whatever `ls -d "Versions/PART I"*` reports rather
│                                             than as a number in prose. By the convention above a
│                                             `Part I — Character Progression Content` wrapper
│                                             should exist and all four should move into it
│                                             together. It has not been done because each folder's
│                                             remove-phase.py locates the repository root by
│                                             counting parents (`parents[3]`) and the suite runners
│                                             resolve `../../..`; adding a directory level silently
│                                             breaks the live-tree refusal check and every runner
│                                             path at once. Doing it properly means moving the four
│                                             folders AND re-deriving those paths AND re-running
│                                             every removal proof, which is its own small piece of
│                                             work rather than something to slip into a feature
│                                             release. Raise it before adding a fifth Part I folder.
│                                             (The roadmap's own header names
│                                             this phase "Advantages/Disadvantages"; a folder name
│                                             can't hold a literal "/", so it substitutes a hyphen,
│                                             the same substitution the Part H wrapper makes.)
│                                             Feature phase; variable Advantages/Disadvantages gain
│                                             a stored PICK that changes the XP maths, in one new
│                                             fragment (209.8-feat-adv-config.js) plus purely
│                                             ADDITIVE blocks in six shared files — it rewrote no
│                                             existing line anywhere, which is why its removal
│                                             rebuilds byte-identical. The config schema is
│                                             name-keyed INSIDE the fragment rather than added as
│                                             fields on ADV_LIBRARY's rows, precisely so the trunk's
│                                             data is untouched and the phase deletes to nothing.
│                                             Both halves built. COST effects (a Trait XP discount,
│                                             six severity tiers), and ROLL effects as 4.5.1 — one
│                                             contributor registered into PREROLL_MODIFIER_REGISTRY
│                                             (adv-config, priority 60). That registry was baselined
│                                             by Phase 1.5 (Part G) at exactly six contributors and
│                                             that phase's own comment named 4.5 as one that must
│                                             not change it, so the seventh seat was taken only
│                                             after the project owner RULED the baseline may grow.
│                                             Phase 1.5's check is now conditional on this phase
│                                             being present, so it reads 35/35 both with 4.5 in the
│                                             build and with it surgically removed — a hard
│                                             length === 7 would have broken 4.5's own removability
│                                             proof. Friend of the Elements grants a FREE RAISE,
│                                             which is not a dice-pool change and this sheet has no
│                                             Raise mechanic to spend one through, so it registers
│                                             an informational:true modifier that reports it and
│                                             moves no dice. Declared both ways in both phases'
│                                             ROLLBACK.md. Two kill-switches (ADV_CONFIG_ENABLED,
│                                             and ADV_CONFIG_ROLL_EFFECTS_ENABLED for the roll half
│                                             alone)
│
├── PART I — Phase 4.5.2 Disadvantages/
│                                             point release on 4.5; eleven approved Disadvantages
│                                             across four independently removable fragments
│                                             (209.85-209.88), each with its own marker
│                                             (4.52/4.521/4.522/4.523)
│
├── PART I — Phase 4.5 Remaining Configuration Audit/
│                                             not a build folder; the 13 September 2026 audit of
│                                             every catalogue entry against the live configuration
│                                             system, plus the project owner's approved designs for
│                                             the remaining scope. Carries rules text extracted
│                                             from the sourcebooks, which is what lets a CLOUD
│                                             session implement entries that would otherwise be
│                                             desktop-gated
│
├── PART I — Phase 4.5.3 Configuration Repairs/
│                                             point release on 4.5; eleven of the audit's twelve
│                                             confirmed defects in ALREADY-SHIPPED 4.5 code, fixed
│                                             purely ADDITIVELY in one new fragment
│                                             (209.89-feat-adv-config-repairs.js) plus two
│                                             delimited blocks in shared files. It adds no
│                                             catalogue entry and no config type: it corrects the
│                                             library rows at load time from a table it owns, and
│                                             rebinds the five functions it repairs, each time
│                                             keeping the previous binding and delegating to it.
│                                             Ordered LAST among the 4.5 fragments so "the previous
│                                             binding" means 4.5.2's. Because nothing is rewritten
│                                             in place, removal rebuilds byte-identical. Uses
│                                             explicit `PART I FEATURE 4.53 BEGIN <slug>` /
│                                             `END REPAIRS453 <slug>` delimiters rather than
│                                             marker-until-next-marker, per 4.5.2's precedent.
│                                             Lord Moon's Curse is the audit's twelfth defect and
│                                             is PARKED -- the sheet states no TN map for its
│                                             Willpower check. Own kill-switch
│                                             (ADV_CONFIG_REPAIRS_ENABLED). Carries one FIXTURE
│                                             correction in Phase 4.5's own harness, declared in
│                                             its ROLLBACK.md
│
├── PART I — Phase 4.5.4 Configuration UX Pass/
│                                             point release on 4.5; the UX round the 13 September
│                                             feedback and the 16 September real-device pass both
│                                             asked for. SCOPED FROM MEASUREMENTS at 375px, which
│                                             moved it both ways: the reported "several
│                                             overflowing option cards" was down to ONE by the
│                                             time it was measured, while "use a consistent
│                                             circled-i icon" needed more than an icon for the
│                                             ~24 entries offering only a bare title= and no other
│                                             affordance. One new fragment
│                                             (209.9-feat-adv-config-ux.js) plus its own
│                                             stylesheet (58-adv-config-ux.css) and one delimited
│                                             seam block. Adds the affordance GENERICALLY via one
│                                             decorator rather than editing 60 call sites across
│                                             three earlier releases; keeps every title= so
│                                             desktop hover is unchanged; the button's glyph is a
│                                             CSS ::after so it contributes nothing to the row
│                                             textContent other harnesses assert on. Two halves
│                                             that fail independently, so it was proven against
│                                             TWO broken builds. Styles two classes other phases
│                                             own (.d45-option from 4.52, .rp-mod* from Phase 3)
│                                             as separate overrides in its own file, and also
│                                             READS a third (.d45-tooltip, also 4.52's) -- all
│                                             three declared in its ROLLBACK.md, and all owning
│                                             phases stay independently removable. Own
│                                             kill-switch (ADV_CONFIG_UX_ENABLED)
│                                             SAME-DAY REAL-DEVICE CORRECTION: shipped claiming
│                                             the Consumed/Failure of Bushido tenet rules were
│                                             "simply unreadable on touch", which overstated the
│                                             gap -- 4.5.2 already built a native <details>
│                                             disclosure for exactly that text, so the real bugs
│                                             were a doubled affordance, a garbled heading (the
│                                             disclosure's hidden text leaking into
│                                             textContent), and overflow-wrap:anywhere splitting
│                                             several tenet names mid-word by shrinking their
│                                             flex-item automatic minimum size. All three fixed;
│                                             own suite grew 21 -> 28 checks. See the phase's
│                                             README, "Real-device correction, 16 September
│                                             2026," for the full account -- worth reading before
│                                             assuming a `title=` count alone proves something is
│                                             unreachable. A SECOND same-day correction followed:
│                                             the max-width:200px fix from the first was measured
│                                             against a font this sandbox cannot load, and still
│                                             split on the real device. Replaced with a
│                                             font-independent full-row width; confirmed on the
│                                             reporting iPhone. See "Working style the user
│                                             expects" for the standing lesson
│
├── PART I — Phase 4.5.5 Eligibility Gates/
│                                             point release on 4.5; the last two open defects on
│                                             the Phase 4.5 audit (findings 4 and 5). BOTH
│                                             REPORTS WERE OVERSTATED and both were re-measured
│                                             first -- the third phase running where the report
│                                             and the code disagreed. Settles a design question
│                                             the audit explicitly deferred: the sheet had FOUR
│                                             different answers to "this will not work", and the
│                                             project owner chose disable-in-the-picker as the
│                                             standard for every gated entry, not a Friendly Kami
│                                             exception. One new fragment
│                                             (209.91-feat-adv-eligibility-gates.js) plus its own
│                                             stylesheet (59-adv-eligibility.css) and one
│                                             delimited seam block. Takes its eligibility VERDICT
│                                             from Feature 4.53 where 4.53 owns the rule and
│                                             supplies only the picker wording, so the greyed
│                                             option and the row explaining itself cannot
│                                             disagree. Rides the recalc cycle because
│                                             buildAdvDisadvQuickAdd runs ONCE at load while
│                                             eligibility depends on School. Own kill-switch
│                                             (ADV_ELIGIBILITY_GATES_ENABLED). KNOWN RESIDUAL,
│                                             declared in its ROLLBACK.md: 4.5.2's own appAlert
│                                             entry gate for Elemental Imbalance is untouched
│
├── PART I — Phase 4.5.6 Rank Entries/
│                                             point release on 4.5; Perceived Honor (A10) and
│                                             Wealthy (A16), two of the audit's 23 MISSING
│                                             CONFIGURATION HANDLERS rather than defects. Feature
│                                             4.53 had already corrected both entries' catalogue
│                                             DATA; this adds the handler those corrected prices
│                                             were waiting for. One new fragment
│                                             (209.92-feat-adv-rank-entries.js) plus its own
│                                             stylesheet (59.1-adv-rank-entries.css, numbered 59.1
│                                             because 60-sheet-print.css must stay last) and one
│                                             delimited seam block. Adds a rankFreePick config type
│                                             on the ADVANTAGE side: Phase 4.5.2's public
│                                             D45.install() seam was tried first and REFUSED,
│                                             because D45.refresh() requires a d45 entry to sit in
│                                             #disadvList -- worth knowing before reaching for that
│                                             seam again. Own kill-switch
│                                             (ADV_RANK_ENTRIES_ENABLED). Reads f_honorRank and
│                                             f_clan, writes neither; grants no koku, so Wealthy's
│                                             entitlement is a reminder and the repeated-grant
│                                             lifecycle cannot arise. D05 (Unlucky) is the third
│                                             unhandled entry and stays open: it needs dice-engine
│                                             integration, unlike these two
│
├── PART I — Phase 4.5.7 Unlucky/
│                                             point release on 4.5; D05, the LAST of the audit's
│                                             23 missing configuration handlers and the only one
│                                             of the final three needing dice-engine work. With it
│                                             shipped, every finding on that audit is built or
│                                             explicitly parked. One new fragment
│                                             (209.93-feat-disadv-unlucky.js) plus its own
│                                             stylesheet (59.2-disadv-unlucky.css) and one
│                                             delimited seam block. Installed through Phase
│                                             4.5.2's D45.install() seam -- which Feature 4.56
│                                             could NOT use, because D45.refresh() requires a d45
│                                             entry to sit in #disadvList. Unlucky is a
│                                             Disadvantage, so the seam's rule is satisfied rather
│                                             than fought: the same rule, working in both
│                                             directions. 2 XP per rank with ONE USE PER RANK per
│                                             session (rank 5 = 10 XP and 5/5 uses, not 10/10 --
│                                             a conflation the audit called out and a check
│                                             enforces). Reuses Phase 4.5's own
│                                             advConfigLuckRerollResult(), which re-rolls the
│                                             SAVED pool without re-entering the action, so no
│                                             spell slot, Void point, Willpower gate or limited
│                                             resource can be charged twice -- proven by diffing
│                                             the whole character across an invoke rather than by
│                                             listing costs. Own kill-switch
│                                             (DISADV_UNLUCKY_ENABLED). Carries ONE cross-phase
│                                             fixture correction, declared in its ROLLBACK.md:
│                                             4.53's R453-CAT-06 asserted an unconfigured row's
│                                             price, which only held while Unlucky had no handler.
│                                             SAME-DAY REAL-DEVICE CORRECTION: all three row
│                                             controls carried a Feature 4.54 circled-i, because
│                                             that phase decorates ANY element with an explanatory
│                                             title=. Descriptions moved to aria-label, which keeps
│                                             the accessible name without presenting as a tooltip
│                                             worth decorating. STANDING LESSON for any dense row
│                                             built from here on: since 4.54, an explanatory title=
│                                             is an opt-in to a VISIBLE ICON, not just hover text
│
├── PART I — Phase 4.5.8 Dependant and Wrath of the Kami/
│                                             point release on 4.5; D02 and D07, the first two of
│                                             the six Disadvantages left after 4.5.7 closed D05,
│                                             and the first release of the STAGED plan agreed on
│                                             the weekly budget (cheapest and most reusable first;
│                                             D06 Weakness deliberately left for a fresh week).
│                                             One new fragment
│                                             (209.94-feat-disadv-dependant-wrath.js) plus its own
│                                             stylesheet (59.3-disadv-dependant-wrath.css) and one
│                                             delimited seam block. Both installed through 4.5.2's
│                                             D45.install(). THREE CONSTRAINTS ON EVERY FUTURE
│                                             D45.install() came out of this phase and are written
│                                             up in its ROLLBACK.md -- read them before starting
│                                             D01, D03, D04 or D06: (1) you CANNOT add a
│                                             configTypes string, because 4.5.2's harness pins that
│                                             array exactly and, unlike an ordinary fixture, an
│                                             exact-array assertion has no expected value that
│                                             passes both with a phase present AND removed; (2)
│                                             there is NO optional modal field -- readStep()
│                                             requires every step, so optional detail belongs on
│                                             the row via decorate, committing on `change` rather
│                                             than per keystroke (refresh() clears row.innerHTML
│                                             and would take the caret with it); (3) `finalize` is
│                                             what keeps the legacy `value` display field honest
│                                             when an entry's number is not one of
│                                             tenet/element/target/tier/rank -- Dependant's is
│                                             `points`, and without it the field reads
│                                             'Rank undefined'. Wrath of the Kami REUSES Elemental
│                                             Imbalance's elementPick type; that is safe only
│                                             because every Elemental Imbalance behaviour,
│                                             including its pre-casting Willpower gate, is keyed on
│                                             the NAME -- if a future phase ever keys on the TYPE,
│                                             this entry inherits it silently. Its element list was
│                                             MEASURED from the sheet's own spell library (Air 80,
│                                             Earth 58, Fire 46, Water 43, Void 30, Universal 3)
│                                             rather than taken from RINGS, which holds only four;
│                                             that is a measured decision, NOT a source citation.
│                                             Own kill-switch (DISADV_DEPENDANT_WRATH_ENABLED).
│                                             No cross-phase fixture correction -- checked before
│                                             building this time rather than discovered after
│
├── PART I — Phase 4.5.9 Doubt/
│                                             point release on 4.5; D03, and the FIRST build of
│                                             the approved TN-REPORTING CONVENTION -- a rule's
│                                             TN +N shown as -N to the reported total, for
│                                             Ring/Trait/Skill/spell/attack rolls only and NEVER
│                                             for damage. Built second in the staged plan rather
│                                             than saved, because D04's Benten and Fukurokujin
│                                             branches reuse the machinery. One new fragment
│                                             (209.95-feat-disadv-doubt.js) plus its own
│                                             stylesheet (59.4-disadv-doubt.css) and one delimited
│                                             seam block.
│                                             ⚠️ TWO THINGS TO KNOW BEFORE BUILDING D04 OR ANY
│                                             FUTURE TN-REPORTING ENTRY. (1) A DAMAGE roll context
│                                             carries the SAME skillName as the attack before it
│                                             -- measured live. Filtering on skill name alone
│                                             penalises damage, which the audit forbids and which
│                                             reads as correct in review. FILTER ON ROLL KIND
│                                             FIRST. (2) It takes NO new registry seat:
│                                             registerPreRollModifier REPLACES an entry with a
│                                             matching id, so re-registering Phase 4.5's own
│                                             adv-config contributor and delegating to the previous
│                                             one keeps Phase 1.5's baseline at seven. The obvious
│                                             `const prev = fn; fn = ...` wrapper does NOT work
│                                             here -- the registry captured the function REFERENCE
│                                             at registration, so reassigning the identifier
│                                             changes nothing that runs.
│                                             A spell context carries no skillName at all, so a
│                                             skill-scoped entry cannot reach a casting roll; that
│                                             is a property of the pipeline, not a rule this phase
│                                             enforces. A stale Skill (School changed) KEEPS its
│                                             award and stops applying, per 4.5.3's principle that
│                                             the project does not silently reprice a saved
│                                             character. Own kill-switch (DISADV_DOUBT_ENABLED).
│                                             DECLARED, NOT FIXED: the roll modal's keep-note
│                                             renders '+ -5 bonus'. Verified PRE-EXISTING by
│                                             rolling a wounded character with no Doubt present
│                                             (gives '+ -40 bonus') -- every negative totalDelta
│                                             has done this since Wound Penalties (Part C, Feature
│                                             3). It is trunk code outside this phase's marker and
│                                             wants its own one-line bugfix folder.
│                                             SAME-DAY REAL-DEVICE CORRECTION: the roll preview and
│                                             result text was dense and squished, and the row
│                                             badge's bracketed suffix made it the widest thing on
│                                             the row. The modifier note shrank to
│                                             'required Raise, no benefit (TN +5)' and the badge
│                                             dropped '(reported total -5)' -- both wording only,
│                                             inside this phase's own fragment; 38/38, 766/766 and
│                                             byte-identical removal all held unchanged
│
├── PART I — Phase 4.5.10 Cursed by the Realm/
│                                             point release on 4.5; D01, ten Spirit Realms behind
│                                             one catalogue row (4 XP, 5 for a Shugenja). One new
│                                             fragment (209.96-feat-disadv-realm.js) plus its own
│                                             stylesheet (59.5-disadv-realm.css), one delimited
│                                             seam block, and -- FIRST for a 4.5.x release -- FOUR
│                                             delimited blocks in a fragment OUTSIDE the seam,
│                                             namely Phase 3's (Part G) 208-feat-roll-preview.js.
│                                             The FIRST DOTTED MARKER in the project:
│                                             `PART I FEATURE 4.5.10`, chosen over the compressed
│                                             `4.510` because that reads as 4.51.0 and would become
│                                             ambiguous the moment any 4.51 exists. Both regexes
│                                             already accept dots; a test-removal fixture invents a
│                                             4.51 block to prove they do not collide.
│                                             ⚠️ ELEVENTH Part I folder at top level. The wrapper
│                                             was overdue at ten and was DEFERRED AGAIN by explicit
│                                             decision, to keep the week's budget on features. The
│                                             blocker is unchanged: every Part I remove-phase.py
│                                             resolves the repo root by counting parents
│                                             (parents[3]) and the runners resolve ../../.., so
│                                             adding a level breaks the live-tree refusal check and
│                                             every runner path at once. Eleven of each now.
│                                             TAKES NO REGISTRY SEAT AND RE-REGISTERS NOTHING --
│                                             a better route than 4.5.9's, and the one future
│                                             entries should prefer: entries added to D45.modules
│                                             are consulted generically by D45.modifiers(), reached
│                                             from the single existing adv-config seat. Measured:
│                                             registry stays at seven. And because D45.modifiers()
│                                             returns early for ROLL_KINDS.DAMAGE BEFORE consulting
│                                             that table, the damage exclusion is INHERITED
│                                             structurally rather than filtered by the entry --
│                                             the single easiest thing in the TN convention to get
│                                             wrong, now impossible rather than remembered.
│                                             Meido scopes on the roll's own traitName rather than
│                                             a skill list (exactly three Perception skills exist;
│                                             a list would rot). Chikushudo cannot overlap it --
│                                             Animal Handling rolls on AWARENESS, measured, which
│                                             is the intuitive wrong answer. Yomi's ancestral
│                                             surface is exactly Inheritance and Haunted, measured
│                                             across both libraries rather than assumed, and it
│                                             FLAGS rather than deletes. Adds realmPick to
│                                             D45.configTypes on the project owner's explicit
│                                             decision, LIFTING the constraint 4.5.8 recorded as
│                                             absolute: that argument holds only for a CONSTANT
│                                             expected value, and Phase 1.5 (Part G) had already
│                                             solved it with a CONDITIONAL one. Three harnesses
│                                             (4.5.2's, 4.5.8's, 4.5.9's) corrected to the
│                                             conditional shape, declared in this phase's ROLLBACK;
│                                             826/826 present, 766/766 removed. Also exports
│                                             ADV_LIBRARY on the seam, which was missing and had
│                                             made Yomi's Advantage-side claim unverifiable.
│                                             JIGOKU'S ROLL IS DEFERRED by explicit decision: the
│                                             sheet models no Taint rank and the resisting roll is
│                                             stated nowhere, so choosing one would be inventing
│                                             rules content. It ships as a badge saying so, with a
│                                             check on that wording. Own kill-switch
│                                             (DISADV_REALM_ENABLED). Real-device confirmed, with
│                                             TWO same-day corrections (Toshigoku's button
│                                             alignment, twice; Yomi's badge falling through to
│                                             the "active" look by omission). Cost 18% of a weekly
│                                             allowance -- the week's most expensive phase and its
│                                             cheapest-LOOKING entry, one catalogue row with ten
│                                             branches behind it
│
├── PART I — Phase 4.5.11 Seven Fortunes Curse/
│                                             point release on 4.5; D04a, FIVE of the seven Fortune
│                                             curses behind one catalogue row (3 XP, 6 for Hotei).
│                                             One new fragment (209.97-feat-disadv-fortune.js) plus
│                                             its own stylesheet (59.6-disadv-fortune.css), one
│                                             delimited seam block, and four delimited blocks in
│                                             Phase 3's (Part G) 208-feat-roll-preview.js.
│                                             DELIBERATELY CHEAP: every branch reuses a shape
│                                             Feature 4.5.10 already paid for, and this phase adds
│                                             no new mechanism. Benten (Etiquette TN +10) and
│                                             Fukurokujin (Lore TN +5) are the third and fourth
│                                             consumers of the TN-reporting convention; Daikoku is
│                                             Chikushudo's named-Skill -1k1; Ebisu and Jurojin are
│                                             Maigo no Musha's per-roll declaration.
│                                             ⚠️ TWELFTH Part I folder. Wrapper deferred again.
│                                             THE SOCIAL SKILL LIST WAS ALREADY BUILT. The audit
│                                             asks Ebisu to use "the authoritative Social Skill
│                                             list" and the PDFs are desktop-only, so this looked
│                                             source-gated like Jigoku -- but 4.5.2 has shipped one
│                                             since it was built, frozen at 209.85 and exposed as
│                                             D45.socialSkills, which Antisocial already scopes on.
│                                             MEASURE BEFORE DECLARING SOMETHING BLOCKED.
│                                             DAIKOKU REMINDS, IT DOES NOT DEBIT: #f_koku is live
│                                             player money and a School's starting koku is free
│                                             text inside its outfit string, so there is nothing
│                                             idempotent to debit -- 4.5.6 reached the same answer
│                                             for Wealthy. Bishamon and Hotei are DEFERRED to D04b
│                                             but stay pickable, priced and honestly noted, which
│                                             is Jigoku's shape.
│                                             ⚠️ FOUND AND FIXED HERE: every Part I remove-phase.py
│                                             BEFORE this one has a LIVE-TREE GUARD THAT CANNOT
│                                             FIRE. They resolve the live tree as parents[3]/"Part
│                                             F — …", but parents[2] is Versions/ and parents[3] is
│                                             the repo root, so the path never existed and the
│                                             refusal was decorative. Proven by a run that deleted
│                                             this phase's own files out of the live tree. THIS
│                                             phase's remover resolves from parents[2] AND compares
│                                             resolved manifest paths; EIGHT others are UNFIXED --
│                                             never pass a live tree to one "to watch it refuse".
│                                             (This release's own count of "ten" was CORRECTED on
│                                             17 September by auditing all thirteen Part I folders:
│                                             4.5.3 through 4.5.10 carry the dead parents[3] guard,
│                                             but 4.5.2's ALREADY resolved from parents[2] and
│                                             already refused parents, descendants and a symlinked
│                                             root, and the base 4.5 remover is a third case again
│                                             -- a substring path match, which DOES fire but has no
│                                             symlink or manifest check behind it. See
│                                             BUGFIX -- Mastery Rank Labelling's ROLLBACK.md. The
│                                             operational rule is unchanged: always pass an
│                                             explicit /tmp copy.)
│                                             ALSO: first D45 entry whose name carries a curly
│                                             apostrophe, and D45's norm() does not fold them, so a
│                                             straight-quote row silently failed to configure.
│                                             Worked around inside this fragment (installs under
│                                             both spellings; active() filters on its own flag);
│                                             widening D45's norm() is declared, not done.
│                                             Own kill-switch (DISADV_FORTUNE_ENABLED).
│                                             74/74 own, 902/902 combined, byte-identical removal.
│                                             Not real-device confirmed
│
├── PART I — Phase 4.5.12 Seven Fortunes Curse Bishamon/
│                                             point release on 4.5; D04b's FIRST HALF -- Bishamon
│                                             alone, the sixth Fortune, left deferred by D04a. One
│                                             new fragment
│                                             (209.98-feat-disadv-fortune-bishamon.js) plus its own
│                                             stylesheet (59.7-disadv-fortune-bishamon.css), one
│                                             seam block, and -- FIRST for a 4.5.x release -- TWO
│                                             delimited blocks in TRUNK code, namely Part B's
│                                             100-dice-engine.js.
│                                             ⚠️ THE ONE THING TO KNOW BEFORE TOUCHING DAMAGE:
│                                             rollWeaponDamage() does NOT call
│                                             applyPreRollModifiers(). It rolls
│                                             getWeaponDamageDice()'s numbers DIRECTLY and consults
│                                             the pipeline only afterwards, to DECORATE the
│                                             already-rendered modal. Measured with a probe
│                                             returning a real -3k-1 for ROLL_KINDS.DAMAGE: the
│                                             modal PRINTED it and the dice rolled the full 5k2. So
│                                             a damage entry built as a pre-roll modifier shows a
│                                             penalty the dice never took AND passes any check that
│                                             only asks getPreRollModifiers(). This phase therefore
│                                             reduces the Strength CONTRIBUTION inside the damage
│                                             maths, which is what the audit asks for anyway. Its
│                                             F4512-ROLL-01 drives a REAL roll and counts rendered
│                                             dice; a scratch build that reports the reduced pool
│                                             and rolls the unreduced one fails that check ALONE.
│                                             TAKES NO REGISTRY SEAT AT ALL -- better than 4.5.10's
│                                             and 4.5.11's route, because the pipeline is not
│                                             involved, so Phase 1.5's baseline of seven holds by
│                                             construction rather than by care.
│                                             NEEDS NO EDIT TO 4.5.11 despite completing its entry:
│                                             F4511.FORTUNES is a plain mutable object read live by
│                                             spec(), and definition.decorate reaches
│                                             api.decorateRow by PROPERTY LOOKUP at call time, so
│                                             retuning the spec and wrapping the decorator both work
│                                             from outside -- 4.5.3's pattern. Changing the effect
│                                             key away from 'deferred' also makes 4.5.11's own
│                                             'not yet automated' note and quiet dashed badge stop
│                                             matching, without touching that file: 4.5.10's Yomi
│                                             mechanism used deliberately rather than by omission.
│                                             THE THREE BRANCHES THE AUDIT ASKS TO BE CHECKED
│                                             SEPARATELY WERE ALREADY SEPARATE: it keys on the
│                                             traitName getWeaponDamageDice() reports. Bow Strength
│                                             is reduced INSIDE its own min(), so Han-kyu (rating 1)
│                                             never moves at any Strength 1-5 -- measured, and the
│                                             one check a blanket -1k0 fails. Unarmed IS affected
│                                             (no dmgTrait key at all, so `undefined !== null` sends
│                                             it to `dmgTrait || 'Strength'`). Perception weapons
│                                             and flat-DR weapons are untouched. Actual Strength is
│                                             never written -- measured that it would move the Water
│                                             Ring.
│                                             FLOOR AT STRENGTH 1 IS A MEASURED DECISION, NOT A
│                                             SOURCE CITATION: the Strength input's own min is 1,
│                                             and an effective 0 makes unarmed roll 0k1 which
│                                             rollWeaponDamage() refuses outright. So at Strength 1
│                                             the curse costs nothing, and the row says so in those
│                                             words. One named constant; the one thing here a
│                                             rulebook could overturn.
│                                             Own kill-switch (DISADV_BISHAMON_ENABLED). Carries ONE
│                                             cross-phase fixture correction, declared in its
│                                             ROLLBACK: 4.5.11's F4511-DEFER-Bishamon-NOTE now asks
│                                             the SEAM whether a later phase automated that Fortune
│                                             rather than asserting deferral flatly -- the shape
│                                             D04b's second half will need again for Hotei.
│                                             Hotei remains deferred and is SOURCE-BLOCKED rather
│                                             than expensive, per the audit.
│                                             REAL-DEVICE CORRECTION, 17 Sep: the dice were right
│                                             everywhere and the damage modal was SILENT wherever
│                                             the curse cost nothing, because adjustDamage()
│                                             returned null for THREE UNLIKE CASES at once -- the
│                                             floor, a bow already capped by its own rating, and
│                                             Perception/flat-DR weapons Strength never reached.
│                                             The first two are owed a reason and now return a
│                                             ZERO-DELTA result carrying one; the third still
│                                             returns null, pinned by F4512-EXPLAIN-04 which fails
│                                             if the note starts appearing on pistols. STANDING
│                                             LESSON: on a configured, paid-for entry, silence
│                                             reads as 'not implemented', not as 'cannot apply
│                                             here' -- so a null that means several different
│                                             things is a display bug waiting to be reported.
│                                             It needed NO change to the trunk block (numDice += 0
│                                             and traitValue = had are already no-ops there,
│                                             measured), which is why the byte-identical rollback
│                                             survived the correction untouched. Also reworded:
│                                             'Bow Strength counts as 1' was read on the device as
│                                             the BOW's rating, so both branches now say 'your
│                                             Strength'.
│                                             51/51 own, 953/953 combined, 902/902 removed,
│                                             byte-identical removal on the first attempt, 16/16
│                                             removal fixtures. The corrected wording is not
│                                             itself real-device confirmed.
│                                             TWO ITEMS COSTED AND DEFERRED from the same session,
│                                             neither this phase's: (1) '<Skill> Rank 8 mastery'
│                                             names the CHARACTER's rank, not the granting one
│                                             (masteries are at 3 and 7) -- getDamageBonus()
│                                             ACCUMULATES across thresholds and records nothing
│                                             about which contributed, so it needs a new lookup,
│                                             not a string change, across 7 call sites in 3 files;
│                                             (2) a bow with an EMPTY QUIVER skips the ammo picker,
│                                             because ammoTrackingActive() is
│                                             anyArrowEquipRows() || !!getRowArrowType(row) and a
│                                             DEFAULT_ARROW fallback sits behind it -- a product
│                                             decision before a code change. Each wants its own
│                                             bugfix folder
│
├── PART I — Phase 4.5.13 Named Advantages/
│                                             first fresh A01-A16 batch: Blackmail target/Status,
│                                             Forbidden Knowledge subject/manual notes, named
│                                             Inheritance reminder, optional Way of the Land region.
│                                             209.925-feat-adv-named.js + 59.8-adv-named.css,
│                                             one guarded six-line post-literal seam block.
│                                             Dotted marker; ADV_NAMED_ENTRIES_ENABLED kill-switch.
│                                             Base 4.5/extended-modal hard dependency, reciprocally
│                                             declared; trunk info overlay, NO UX-release dependency.
│                                             No modifier seat, dice-engine or save-schema change.
│                                             136/136 own, 1128/1128 combined, 992/992 removed;
│                                             exact c7063f52 baseline after removal. 43 remover
│                                             fixtures pass, 2 real-symlink privilege skips.
│                                             Future/invalid config preserved with visible warning;
│                                             real save/load and JSON round-trips tested. Mutations
│                                             prove switch, CSS, discount, optional-field validation
│                                             and inline errors are load-bearing. iPhone: covered by
│                                             the A01-A16 device pass (23-24 Sep, 16/16 as built);
│                                             headless webfonts empty. A01-A16 NOT complete, notably
│                                             Wealthy's actual 2-koku/rank grant still pending.
│
├── PART I — Phase 4.5.14 Darling of the Court and Servant/
│                                             A04 + A11, the first half of Stage 2 as split on 23
│                                             Sep; A06 Heart of Vengeance is its own next batch,
│                                             held for an owner decision on generalising Phase 3's
│                                             (Part G) hardwired per-name declarations (A06 would be
│                                             the fourth). 209.926-feat-adv-court-servant.js +
│                                             59.9-adv-court-servant.css, one guarded six-line seam
│                                             block. ADV_COURT_SERVANT_ENABLED kill-switch.
│                                             Darling: every court on ONE row (courtList rev 1),
│                                             2 XP/court or 1 for a Courtier School, one selected
│                                             court + one persisted in-session toggle, readout
│                                             'Status N — counts as N+1 at <court>' that never
│                                             writes Status. Servant: reference row only, writes
│                                             nothing, leaves the cost to the player.
│                                             ⚠️ NO COURTIER CLASSIFIER EXISTED: this release's is a
│                                             School NAME containing 'Courtier' (title or bracket
│                                             tag). Untagged Artisan Schools pay 2 -- a declared
│                                             interpretation pinned by CS-COURTIER-UNTAGGED-ARTISAN.
│                                             A12 Soul of Artistry needs the same test.
│                                             ⚠️ THE CAROUSEL'S `body.car-active .car-page label`
│                                             (0,2,2) shrinks and uppercases any label on a row;
│                                             single-class row selectors lose to it silently.
│                                             No dependency on 4.5.13 either way, measured by
│                                             removing them in both orders.
│                                             225/225 own, 1353/1353 combined, 1128/1128 removed;
│                                             exact 1e2683d8 restore point after removal, and
│                                             c7063f52 after removing both. 45/45 remover fixtures,
│                                             no skips. First variant run found a harness blind
│                                             spot (duplicate rows only tested unconfigured) --
│                                             closed. iPhone: covered by the A01-A16 device pass
│                                             (23-24 Sep, 16/16 as built); headless webfonts empty.
│                                             ⚠️ `ls -d "Versions/PART I"*` now reports 15 folders
│                                             (the audit folder included). The wrapper stays
│                                             deferred and was not started here.
│
├── PART I — Phase 4.5.15 Roll Declaration Registry/
│                                             THE GENERAL PER-ROLL DECLARATION HOOK. Use it for any
│                                             new "declare it for this roll" option instead of
│                                             adding hooks to Phase 3's (Part G) preview: call
│                                             RD4515.register(id, {label, offers(ctx), modifiers(ctx,
│                                             keys)}) and touch no shared file. It owns the
│                                             checkboxes, fresh state per preview, cancel/Escape
│                                             disarm, central damage exclusion, and routes to the
│                                             dice through the adv-config seat (wraps
│                                             advConfigExtendedRollModifiers; seven seats kept).
│                                             ⚠️ Arming is bound to the ROLL CONTEXT OBJECT the
│                                             preview opened with -- unlike the older pattern, which
│                                             stays armed until the next preview and so could reach a
│                                             roll that skips it. The four older declarations
│                                             (Kharmic Tie, Maigo no Musha, Ebisu, Jurojin) were NOT
│                                             migrated. Ships no production provider. 209.927 +
│                                             59.91, four delimited blocks in 208, one seam block.
│                                             53/53 own, 1406/1406 combined, 1353/1353 removed,
│                                             byte-identical to 61de1d40; 47/47 fixtures.
│                                             ⚠️ A harness with in-flight rolls must .catch() them: an
│                                             aborted section's roll rejects after the browser closes
│                                             and kills Node before the count prints (seen as 0/0).
│
├── PART I — Phase 4.5.16 Heart of Vengeance/
│                                             A06, the registry's FIRST PROVIDER and the worked
│                                             example of using it: one JS fragment (209.928), one
│                                             stylesheet, one seam block -- nothing added to the
│                                             preview. factionPick rev 1 (open list; Clans, Imperial
│                                             families, Brotherhood suggested), 5 XP / 4 Spider,
│                                             +1k1 declared on Skill/Trait/Ring/manual only, once per
│                                             roll. DEPENDS ON 4.5.15 -- remove this first; 4.5.15's
│                                             remover refuses otherwise (measured). Made one 4.5.15
│                                             fixture conditional (declared). 91/91 own, 1497/1497
│                                             combined, 1406/1406 removed, byte-identical to 1d8aa345.
│                                             ⚠️ Harness trap hit AGAIN (4.5.10 documents it): an async
│                                             helper that RETURNS the in-flight roll promise gets it
│                                             awaited by the caller and hangs. Return it wrapped.
│
├── PART I — Phase 4.5.17 Wealthy Koku Grant/
│                                             A16 COMPLETE: 2 koku per Rank actually added to #f_koku,
│                                             plus Core p.149's 1-XP minimum (retuned on 4.56's own
│                                             mutable R456.ENTRIES.Wealthy). THE MONEY RULES, reusable
│                                             for any future grant: money moves ONLY on an explicit
│                                             action (confirm or a row button), never in render/recalc;
│                                             a receipt in the row's own config ({wealth4517:{revision,
│                                             granted}}) makes every later action move only the
│                                             DIFFERENCE; a save with no receipt is ASKED, never
│                                             assumed; lowering offers Return/Keep, never claws back.
│                                             Hard dependency on 4.56 (remove this first). Made three
│                                             4.56 checks conditional (declared; 29/29 both ways).
│                                             87/87 own, 1584/1584 combined, 1497/1497 removed,
│                                             byte-identical to 0aefe9c9. "Mint during render"
│                                             mutation reds 23 checks.
│
├── PART I — Phase 4.5.18 Paragon/
│                                             A09, REMINDER ONLY as approved: seven tenets in
│                                             printed order (Core p.152), nothing preselected, one
│                                             saved tenet, badge + benefit + "+1 Honor ... add it
│                                             yourself". 7 XP, 6 Lion. No dice/Void/Honor change,
│                                             measured across eight roll kinds. 209.9295 + 59.94,
│                                             one seam block. Config type is `paragonTenet`, NOT
│                                             the audit's `tenetPick` -- that is Failure of
│                                             Bushido's (4.5.2). Depends on base 4.5 only.
│                                             Core p.148's Paragon/Dark Paragon/Failure of Bushido
│                                             set rule NOT built (no set-rule mechanism exists).
│                                             80/80 own, 1664/1664 combined, 1584/1584 removed,
│                                             byte-identical to be9076cf. ⚠️ Harness trap: select
│                                             tenets by radio VALUE -- benefit texts name other
│                                             tenets, so a text match clicks the wrong one.
│
├── PART I — Phase 4.5.19 Soul of Artistry/
│                                             A12: Artisan or Craft Skills (skillFamilyPick rev 1);
│                                             a matching Skill with no Rank rolls as REAL Rank 1
│                                             (Trait+1 k Trait, 10s explode). Built by REBINDING
│                                             rollWithModifiers() to rewrite the context BEFORE the
│                                             preview, so preview/breakdown/Void offers/dice agree
│                                             and Void's own 0->1 lift is not offered twice. The
│                                             pattern to reuse for Crab Hands, Crafty and Sage.
│                                             4 XP / 3 Crane OR Courtier (one price). 209.9296 +
│                                             59.95, one seam block; base 4.5 only.
│                                             ⚠️ FOUND, NOT FIXED: a Rank 0 Skill-TABLE roll already
│                                             explodes while its preview says Unskilled (trunk
│                                             rollSkill() passes no explode:false); only the
│                                             Untrained Skills list is right. Wants a bugfix folder.
│                                             92/92 own, 1756/1756 combined, 1664/1664 removed,
│                                             byte-identical to 96dda731.
│
├── PART I — Phase 4.5.20 Void Versatility/
│                                             A14: one non-Void Ring (voidVersatilityRing rev 1;
│                                             NOT base ringPick, whose loose check would bypass
│                                             validation). Void spells may be paid from that
│                                             Ring's slots. ⚠️ castSpell() SPENDS THE SLOT BEFORE
│                                             THE ROLL PREVIEW and has no refund path, so the
│                                             payment choice is asked there, via the trunk's own
│                                             appConfirm3Way (X spends nothing), not in the
│                                             preview. Only spell_used_<ring> moves; the shared
│                                             Bonus pool is never touched. Eligibility live:
│                                             Shugenja + School Void Affinity (library: Isawa with
│                                             Void only), no Uncentered. Soft guarded extensions of
│                                             Phase 8 (no-slots lift), 4.5.5 (picker gate, via
│                                             R455.ineligible by property) and 4.5.2 (busy check);
│                                             two of their harness checks made conditional.
│                                             66/66 own, 1822/1822 combined, 1756/1756 removed,
│                                             byte-identical to 2b69794d.
│
├── PART I — Phase 4.5.21 Seven Fortunes Blessing/
│                                             A01 to the owner-agreed design (audit "A01
│                                             decisions"). fortuneBlessing rev 1 (+ lore for
│                                             Fukurokujin only; NOT the Curse's fortunePick).
│                                             Automatic via adv-config seat: Bishamon +1k0 Strength
│                                             TRAIT rolls only, Daikoku +1k1 Commerce, Fukurokujin
│                                             +1k1 chosen "Lore: …". Declared via 4.5.15 registry
│                                             (DEPENDS ON 4.5.15 -- remove this first): Benten
│                                             +0k1 / Ebisu +1k1 on Social rolls, Jurojin +2k0,
│                                             Hotei +10; Hotei Contested Void Roll button. Two
│                                             items DEFERRED FOR OWNER REVIEW (one Blessing per
│                                             character; re-pricing on Fortune change) -- see the
│                                             ledger's open reminders. 77/77 own, 1899/1899
│                                             combined, 1822/1822 removed, byte-identical to
│                                             10683306. ⚠️ Harness lesson again: every in-flight
│                                             click/roll needs a .catch and a modal cleanup, or a
│                                             mutation shows as 0/0 instead of a real count.
│
├── PART I — Phase 4.5.22 Naishou Citizen/
│                                             A08. 3 XP, no config of its own. HARD DEPENDENCY on
│                                             4.5.21: extends FB4521.price by property (−1 XP while
│                                             on the Advantage list; stacks with the Clan price;
│                                             1-XP floor). Row badge/reminder names the current
│                                             Fortune; the aligned-monk Free Raise is a REMINDER.
│                                             Replace-without-refund NOT built (deferred review).
│                                             Removal order: 4.5.22 first -- 4.5.21's remover
│                                             refuses while it is present (measured). 36/36 own,
│                                             1935/1935 combined, 1899/1899 removed, byte-identical
│                                             to 9c749b7d; 4522 then 4521 reaches 10683306.
│
├── PART I — Phase 4.5.23 Dark Paragon/
│                                             A03 to the owner's rulings (audit "A03 decisions").
│                                             darkParagon rev 1 {precept, remaining 0|1}; 5 XP / 4
│                                             Spider; once per session + Reset. PAYMENT on confirm:
│                                             0.5 off f_honorPts (5 Honor points), Void only below
│                                             that (Round limit kept); cancel always free; Honor
│                                             RANK never touched. Control/Insight/Knowledge/Strength:
│                                             reroll button in the RESULT of a matching roll, the
│                                             REROLL STANDS +5 (not keep-higher). Knows which roll
│                                             by marking it in rebound rollWithModifiers /
│                                             rollWeaponDamage; skips 4.5.2's Willpower checks.
│                                             Determination: 4.5.15 tick, removes Wound penalty;
│                                             paid in a rebound rollPreviewGate. ⚠️ 4.5.15 keeps
│                                             only STILL-OFFERED ticks armed, so a provider whose
│                                             offer depends on a resource it spends at commit must
│                                             keep offering for that roll (paidContext here).
│                                             DEPENDS ON 4.5.15 -- remove this first. Made two
│                                             provider-list checks conditional (4.5.15, 4.5.16).
│                                             67/67 own, 2002/2002 combined, 1935/1935 removed,
│                                             byte-identical to 985fdeee.
│
├── PART I — Phase 4.5.24 Touch of the Spirit Realms/
│                                             A13 to the owner's rulings (audit "A13 decisions") --
│                                             completes A01-A16. spiritRealmTouch rev 1 (+skill for
│                                             Yomi, +lost boolean for Jigoku; NOT 4.5.10's
│                                             realmPick). 5 XP / Toshigoku 8 / Yomi 7; Shugenja 1
│                                             less (7 and 6 are an INTERPRETATION -- row tells the
│                                             player to confirm with the GM). Automatic (adv-config
│                                             seat): Chikushudo, Yomi (School Skill computed from
│                                             trunk getSchoolsList + ticked rows; stale Skill kept,
│                                             flagged, not applied), Jigoku (+f_taint on attacks and
│                                             Physical-Trait Skill/Trait rolls, x2 via Lost tick,
│                                             flagged at 0). Declared via 4.5.15: Sakkaku, Meido,
│                                             Tengoku. DEPENDS ON 4.5.15 -- remove this first. Made
│                                             two provider-list checks conditional (4.5.15, 4.5.16)
│                                             -- the third release to extend them; a future provider
│                                             will need the same. ⚠️ A row <label> needs an ID in its
│                                             selector or the carousel rule shrinks it (caught here
│                                             from a screenshot, not a check). 50/50 own, 2052/2052
│                                             combined, 2002/2002 removed, byte-identical to 4d112320.
│
├── PART I — Phase 4.6 Alternate Paths/
│                                             1 Oct, branch claude/phase-4-6-alternate-paths, MERGED
│                                             1 Oct; CONFIRMED on the iPhone 1 Oct (19/19).
│                                             FIRST RELEASE: the Core
│                                             Rulebook's 18 Great Clan Paths (pp. 251-255), our own
│                                             words with pages; the other 9 (magistrate, Legion,
│                                             Champion) and several Paths in one School are the
│                                             second release. ONE FRAGMENT (209.999993, PART I PHASE
│                                             4.6, ALTERNATE_PATHS_ENABLED, object AP46) + one seam
│                                             block (BEGIN alternate-paths-seam / END PATHS46). It
│                                             REBINDS eight trunk functions, never edits them:
│                                             pathClauseMatches (+clan/type clauses), getPathTaken /
│                                             savePathTaken / pathsTaken (record keyed BY SCHOOL),
│                                             unlockTechniques (answers for the School it unlocks),
│                                             pathRequirementsUnmet (+honor, disadvantages,
│                                             skillOfKind), kihoEntitlement (Core p.246: a monk's
│                                             FIRST Path grants 1 Kiho, a later one 0 -- owner's
│                                             ruling), renderPathPicker (Rank per clause, p.246
│                                             notes, "Kept from" earlier Schools). ⚠️ f_pathTaken IS
│                                             NOW {"<School>": {"<Rank>": "<Path>"}}: a PHASE 7
│                                             FORMAT STEP (format 3 -> 4 with 4.5.2) carries the old
│                                             {"<Rank>": "<Path>"} up, and an old record is also read
│                                             per School at runtime. ⚠️ A School's TYPE comes from its
│                                             bracket tag, else the type word in its name, plus the
│                                             shugenja/monk flags (AP46.schoolTypes). ⚠️ Honor
│                                             requirements read f_honorRank (Points only if Rank is
│                                             empty); Honor edits don't recalc, so the picker redraws
│                                             on them. Made 4 retained harnesses' format-3 pins
│                                             conditional on its step (Phase 7's FORMAT and reader,
│                                             4.5.13, 4.5.14, 11). Phase 7's remover refuses while it
│                                             is present (names VersionManager): the chain removes it
│                                             first. Byte-identical removal to 4551175e.
│                                             SECOND RELEASE (same fragment, same folder; branch
│                                             claude/phase-4-6-alternate-paths-r2; MERGED, CONFIRMED
│                                             on the iPhone 21/21, 1 Oct): the 9
│                                             Miscellaneous Paths (pp. 256-257). Clauses take
│                                             types:[...] (any of) and anyRank:true (Champions: the
│                                             player picks the Rank in the sheet's pick modal);
│                                             requires.glory (f_gloryRank) and appointments as GM
│                                             notes; imperialSkillWaiver (f_clan 'Imperial', which
│                                             APPLY FAMILY sets, waives the first unmet Skill).
│                                             SEVERAL PATHS PER SCHOOL: ⚠️ #pathPicker IS SWAPPED for
│                                             a clone (cloneNode) to drop 050's one-Path handler;
│                                             options are "add:<Path>" / "remove:<Rank>". p.246 "a
│                                             later Path is not a School Rank": rebinds
│                                             kihoEligibility, cumulativeMonkShugenjaRank,
│                                             effectiveSchoolRankForElement, makeRollContext (SPELL
│                                             schoolRankBase) and getMirumotoRank; f_rank untouched.
│                                             Topaz keeps the replaced Technique. ⚠️ The Topaz
│                                             Champion is open to every School, so the dropdown now
│                                             shows for EVERY character with a School.
│                                             THIRD RELEASE (same fragment; branch
│                                             claude/phase-4-6-alternate-paths-r3; MERGED 1 Oct,
│                                             CONFIRMED on the iPhone 13/13, 2 Oct): the other
│                                             books' 175 Paths (136 takeable; 39 ronin/Naga/peasant/
│                                             geisha RECORDED ONLY: `unreachable` with a reason, no
│                                             clause, never offered)
│                                             and AUDIT.md (16 books, SotE's School Index, 24 wiki
│                                             pages: nothing missing). New clause keys: family,
│                                             minorClan + exceptClans (Mantis out), exceptSchools,
│                                             affinity, notInSheet (Hiruma Scout, Akodo Tactical
│                                             Master, Kaiu Siege Master), rank 6 (the unlock grants
│                                             a 6th Technique). New requires keys: skillOfKind count,
│                                             families, skillsAny, advantagesAny, honorBelow,
│                                             honorAtMost, pathsHeld. ⚠️ The load check refuses a
│                                             Technique name a School already uses (AP46.clashes),
│                                             hence "Strike the Center (Eyes of Nanashi)". Rebinds
│                                             assertPathSchoolsResolve (skips notInSheet). A new Path
│                                             goes in AP46.PATHS / AP46.DESCRIPTIONS in book order;
│                                             the harness pins the list in BOOK3. ⚠️ FOUND 2 Oct:
│                                             Master of Games' Technique "Forge Your Own Fate" is
│                                             also Toku Bushi's Rank 4 (undescribed), so a Toku shows
│                                             the Path's text. Fix: rename the Path's Technique and
│                                             check names against ALL_SCHOOL_TECHNIQUES, not only
│                                             TECH_DESCRIPTIONS (proposed with Phase 6's 1st release).
│
├── PART I — Phase 4.8 Ancestors/
│                                             30 Sep, branch claude/phase-4-8-ancestors; MERGED 1 Oct
│                                             on the owner's word, iPhone check owed. The Core Rulebook's 18
│                                             Ancestors (pp. 241-244, from the owner's photographs,
│                                             our own words). OWNER'S RULINGS: it lives WITH THE CLAN
│                                             AND FAMILY (a card at the foot of Clan, Family & School
│                                             and a section on the wizard's Family screen), NOT in the
│                                             Advantages list; a "Lost ancestor's favour" badge
│                                             switches every gift off; favour returns once, a second
│                                             loss is final, no replacement, no refund (p. 241); own
│                                             Clan + Spider with the GM's permission. State is ONE
│                                             hidden field, f_ancestor (JSON), so the trunk's own
│                                             save/load/reset carry it; an older save with no field
│                                             clears it after a load that went ahead. Cost added to
│                                             f_xpSpent by a guarded block in recalcAll(); gifts via
│                                             the adv-config seat (still seven) and 4.5.15's
│                                             registry; Hida/Ikoma damage inside
│                                             getWeaponDamageDice(); Shiba's Armor TN after the TN
│                                             sum. 209.99998 + 59.9997, five blocks in 100/110, one
│                                             seam block (PART I PHASE 4.8 BEGIN / END ANCESTORS48).
│                                             ⚠️ The 4.5.15/4.5.16 provider-list checks now set aside
│                                             `ancestors` too (fourth extension). ⚠️ Phase 11.2's
│                                             harness reads the FIRST card grid and the first four
│                                             Review lines: a wizard addition must not be either.
│                                             ⚠️ 4.5.15's, 11.2's and 12's removers refuse while it
│                                             is present: remove 4.8 first.
│                                             SECOND RELEASE, same night: The Great Clans (16) and
│                                             Secrets of the Empire (20) -- 54 Ancestors, 55 entries
│                                             (Agasha twice) -- and the owner's Kakita feedback, as a
│                                             RULE FOR EVERY GIFT (AUDIT.md): dice changed after the
│                                             roll are offered AFTER it (Kakita, Sun Tao, Toku: a
│                                             wrapped onAdvConfigRollResult, like Luck); a bonus that
│                                             COSTS is a tick paid when the player presses Roll (a
│                                             rebound rollPreviewGate; Void by the Void card's rules,
│                                             a session use with Reset on the card; a refused payment
│                                             cancels the roll with nothing spent); a free one is
│                                             automatic and shown. Taint points and spell slots are
│                                             ASKED and left to the player to record. The i button
│                                             copies .adv-config-info (owner's standard). Factions:
│                                             Minor Clans, Imperial, Ronin, Brotherhood (a monk also
│                                             sees their Clan's). DEFERRED by the owner: point 2
│                                             (clutter, Phase 15), point 9 (lost favour editable in
│                                             Management, end of project). 349/349 own; full
│                                             suite 3,347/3,347 with the harness at 348 checks;
│                                             40/40 pinned variants; byte-identical removal to
│                                             2e65b361 again.
│
├── Part J — Data Integrity & Validation/                 theme wrapper (created when Phase 8
│   │                                         became Part J's second folder; Phase 5 was moved
│   │                                         in alongside it, per the convention above, and its
│   │                                         two documented harness paths updated to match)
│   ├── PART J — Phase 5 Character Creation Linting/
│   │                                         feature phase; a CharacterValidator of nine
│   │                                         discrete rule functions over state the sheet
│   │                                         already maintained, plus a ValidationReport panel
│   │                                         on the Identity tab, in one new fragment
│   │                                         (209.5-feat-character-validator.js). Nothing
│   │                                         clamps, blocks or refuses — it only reports.
│   │                                         "Over-capped rings" is deliberately NOT built:
│   │                                         blocked on desktop-only sourcebooks, parked per
│   │                                         Process Requirement #3 rather than invented. Own
│   │                                         kill-switch (CHARACTER_VALIDATOR_ENABLED)
│   ├── PART J — Phase 7 Save Format and Migration/
│   │                                         first release (30 Sep; MERGED on the owner's word the
│   │                                         same day, iPhone check still owed): a
│   │                                         VersionManager holding ONE chain of registered
│   │                                         save-format steps (1->2 Kiho, 2->3 = 4.5.2's own
│   │                                         D45.migrate). Every save/export stamped with
│   │                                         current(); older saves carried up on Import (via
│   │                                         storageSet), copy, export and load; current, newer
│   │                                         and malformed saves pass UNTOUCHED. Export names
│   │                                         keep accents (NFC). ⚠️ SHEET_SCHEMA_VERSION stays 2:
│   │                                         it is the trunk's own format. A later format change
│   │                                         registers a step, never a new wrapper. 45/45 own,
│   │                                         24/45 on main, 12/12 variants, byte-identical
│   │                                         removal to 23df67a7; 2,999/2,999 full suite.
│   └── PART J — Phase 8 Why Cant I Cast This/
│                                             feature phase; a CastingDiagnosticEngine of seven
│                                             rules answering "could you cast this RIGHT NOW",
│                                             behind a ? button on each spell entry, in one new
│                                             fragment (209.7-feat-casting-diagnostics.js).
│                                             The audit found every casting restriction is
│                                             enforced at ACQUISITION time and none at cast
│                                             time, so an entry added under one School kept a
│                                             working Cast button under another. Reports only;
│                                             never blocks, exactly like Phase 5.
│                                             Built as an OPEN REGISTRY (registerCasting-
│                                             Diagnostic), modelled on PREROLL_MODIFIER_REGISTRY
│                                             in 130-round-and-pipeline.js, because Part G's
│                                             Phase 6 is a declared dependency that is
│                                             source-blocked: Phase 6 registers a contributor
│                                             rather than editing this fragment, and may ADD a
│                                             reason or SUPPRESS one. That INVERTS the roadmap's
│                                             declared dependency direction and is declared in
│                                             this phase's ROLLBACK.md.
│                                             NOTE for any future edit to its comments: every
│                                             phase reference in its source is worded
│                                             "Phase 6 (Part G)", never "Part G Phase 6" —
│                                             feature-dependencies.py's MARKER_RE is CASE-
│                                             INSENSITIVE, so marker-shaped prose in a comment
│                                             is parsed as a real ownership marker. It reported
│                                             this phase's whole seam block as owned by a
│                                             PART G PHASE 6 that does not exist.
│                                             Its CSS block also sits ABOVE Phase 5's
│                                             deliberately — written below it, it lands inside
│                                             the span Phase 5's own remover deletes, which
│                                             Phase 5's FOREIGN assertion caught by refusing to
│                                             run. Own kill-switch (CASTING_DIAGNOSTICS_ENABLED)
├── PART K — Phase 11 Characters List and Save Model/
│                                             Part K's FIRST folder, so flat with no wrapper. Phase
│                                             11's first stage (approved 24 Sep): a Characters
│                                             screen (Clan-mon portrait, name, School + Insight
│                                             Rank, Family + Clan), tap to open, per-row menu
│                                             (Export JSON, Save As a copy, Delete), list-level
│                                             Import JSON (always a NEW entry), autosave, and an
│                                             Export JSON that uses the share sheet on touch.
│                                             Export to PDF SPLIT OUT as Phase 11.1; the creation
│                                             wizard is Phase 11.2. 209.993 + 59.993, two
│                                             delimited blocks in 210 (PART K PHASE 11 BEGIN /
│                                             END CHARLIST11). Save format and keys UNCHANGED.
│                                             ⚠️ THE SCREEN OPENS AT STARTUP WHENEVER A CHARACTER
│                                             IS SAVED. It is an overlay (z 700); any load closes
│                                             it, which is what keeps the ten retained harnesses
│                                             that save, reload and load via #charSelect/#btnLoad
│                                             passing. A new harness that saves and reloads must
│                                             load (or close the screen) before clicking the sheet.
│                                             ⚠️ AUTOSAVE follows only a character with a save;
│                                             a harness that saved one will see background writes.
│                                             ⚠️ SAVES ARE FORMAT 3 (4.5.2's collectData wrapper)
│                                             while SHEET_SCHEMA_VERSION is still 2 -- compare
│                                             against collectData().schemaVersion, not the constant.
│                                             Soft dependency on Phase 9 (Part H) for the mon,
│                                             declared both ways. Kill-switches
│                                             CHARACTERS_LIST_ENABLED / _AUTOSAVE_ / _SHARE_.
├── PART K — Phase 11.2 Creation Wizard/
│                                             Phase 11's second part (own number for its own
│                                             marker, PART K PHASE 11.2 / END WIZARD112). FULL
│                                             SCREENS (owner's choice over a guided mode): Name,
│                                             Clan, Family, School, Rings & Traits, Review.
│                                             NEW SCREENS, NO NEW RULES: every choice goes through
│                                             the sheet's own selects, Apply buttons, Trait input
│                                             events and Void stepper; CW-SAME-AS-BY-HAND requires
│                                             collectData() identical to doing it by hand. Gated by
│                                             Phase 5's validateCharacter() (soft). Launched by
│                                             rebinding CL11.createNew -- HARD dependency on Phase
│                                             11; remove 11.2 first (11's remover refuses).
│                                             ⚠️ The sheet cannot UN-apply a Family or School, so
│                                             a new Clan after applying starts over via
│                                             resetToBaseline(), keeping the name.
│                                             ⚠️ Part K now has TWO folders and no wrapper: the
│                                             removers/runners count parent folders (Part I's
│                                             blocker). Deferred, recorded, not done in passing.
│                                             Skills and Advantages: see 11.2.1 below; every free
│                                             choice, Spells and Kiho: 11.2.2.
├── PART K — Phase 11.2.1 Wizard Skills and Advantages/
│                                             the wizard's second stage (PART K PHASE 11.2.1 /
│                                             END WIZARD1121): Skills (School free choices found by
│                                             Apply School's own 'any' test, narrowed to the named
│                                             category as a DISPLAY choice; raise/add) and
│                                             Advantages & Disadvantages (the sheet's own pickers
│                                             mirrored, so config questions and eligibility greying
│                                             still apply). Inserted into CW112.steps from outside;
│                                             HARD dependency on 11.2 (remove this first).
│                                             ⚠️ Skills ticked as School BY HAND carry no data-free
│                                             floor -- only Apply School's grants do.
│                                             ⚠️ 11.2's harness now navigates by STEP TITLE; any new
│                                             wizard step needs no further fixture change.
├── PART K — Phase 11.2.2 Wizard Free Choices Spells and Kiho/
│                                             the wizard's third stage (PART K PHASE 11.2.2 /
│                                             END WIZARD1122), the owner's request: EVERY School
│                                             free-choice form read (counts, "X or Y", non-Low,
│                                             "from A/B/C", and the two library entries whose
│                                             commas split one choice), "Lore (pick one)" named,
│                                             a Spells step for a Shugenja (scroll + learn, the
│                                             sheet's own path) and a Kiho step for a Brotherhood
│                                             monk; Next ASKS ONCE before leaving a choice open,
│                                             Review lists what is still open. Rebinds CW1121/
│                                             CW112 by property; HARD dependency on 11.2.1 (remove
│                                             this first). 52/52 own. OWNER'S RULING: "Bugei"
│                                             offers Bugei + Weapon groups, NOT Weapon (Low)
│                                             (Cannon/Firearms/Ninjutsu) unless it also says Low.
│                                             ⚠️ The sheet has NO starting-spell counts per School;
│                                             the Spells step says so rather than guessing.
│                                             ⚠️ A wizard harness must move by TITLE and expect a
│                                             second Next on a step with an open choice.
│                                             ⚠️ 11.2.1's verify-variants removes later stages first.
├── PART K — Phase 11.2.3 Wizard Starting Spells/
│                                             a Shugenja School's own rulebook "Spells:" line
│                                             (PART K PHASE 11.2.3 / END WIZARD1123), as a table
│                                             keyed by School name INSIDE the fragment (library
│                                             untouched). Given spells auto-added, one picker per
│                                             Element quota, options = the sheet's own
│                                             spellEligibility() (Affinity/Deficiency included);
│                                             plus an info rule pushed onto Phase 5's registry
│                                             (soft). ONLY KITSU IS RECORDED (owner's quotation,
│                                             Core p.118): NEVER fill a line from memory -- the other
│                                             21 need the desktop books. OPEN DESIGN QUESTION, not
│                                             built: do starting spells begin memorised (no scroll,
│                                             no XP)? HARD dependency on 11.2.2 (remove this first).
│                                             No stylesheet, deliberately.
│                                             ⚠️ Every Part K test-removal.py's live test and every
│                                             "phase removed" variant now REMOVES LATER STAGES FIRST
│                                             (strip_later, newest first). A new Part K stage must
│                                             be added to each earlier stage's LATER_STAGES list, or
│                                             their live fixtures fail again -- as Phase 11's did
│                                             from 11.2 until 25 Sep, unnoticed. SUPERSEDED 25 Sep:
│                                             those lists are gone; a new release registers ONCE in
│                                             QA — Removal Chain Registry (see below).
├── PART K — Phase 11.2.4 Wizard Starting Spells for Every School/
│                                             the other 20 Shugenja Schools' "Spells:" lines, AS
│                                             THE OWNER QUOTED EACH (25 Sep), in the fragment
│                                             (PART K PHASE 11.2.4 / END WIZARD1124); 11.2.3's own
│                                             table stays Kitsu-only. Rebinds CW1123.forSchool,
│                                             describe, open, render by property. Isawa / Spider
│                                             Chuda / Yogo are not Element counts: learned spells
│                                             are MATCHED TO BOXES (best fit, order-independent),
│                                             never an Element the player picks (the sheet could
│                                             not store it). Pages NOT GIVEN for Horiuchi, Yogo,
│                                             Yoritomo, Ninube, Fuzake: owner said skip them; never
│                                             fill them from memory. Seppun is 3 Fire, 2 EARTH, 1
│                                             Air (owner's correction; an earlier quote said Water,
│                                             its own Deficiency). Kitsu stays p.118 (owner).
│                                             HARD dependency on 11.2.3 (remove this first).
│                                             ⚠️ Earlier wizard harnesses used Isawa as "a School
│                                             with no line"; their fresh() now takes Isawa's line
│                                             away for their page. A new School-data phase must
│                                             not assume any Shugenja School is unrecorded.
├── BUGFIX — School Skill Free Rank on Reload/            (bugfix, not a Part; stays flat)
├── BUGFIX — Spell Slots Tab Visibility Race/              (bugfix, not a Part; stays flat)
│                                             edits Phase 0's src/layer/10-carousel.js and
│                                             src/sheet/110-modals-trackers.js directly (same
│                                             originals/ + rollback + QA model as Phase 1.6);
│                                             see its own README for what was and wasn't
│                                             actually confirmed
├── BUGFIX — Void One-Roll Effects Not Mutually Exclusive/ (bugfix, not a Part; stays flat)
│                                             reported live via Part G Phase 3's roll preview:
│                                             ticking two one-roll Void options (+1k1, "+1 Trait")
│                                             stacked both onto the same roll for two Void Points.
│                                             Root cause was two-fold -- "+1 Trait" was never a
│                                             real RAW power, only +1k1 misread as a menu of
│                                             per-roll-type bonuses, AND nothing enforced RAW's
│                                             "one of the following effects" outside combat. Fixed
│                                             in 160-feat-void.js (Part C Feature 4, trunk) and
│                                             208-feat-roll-preview.js (Phase 3's own fragment) via
│                                             two shared helpers both now go through, rather than
│                                             each keeping its own definition of "mutually
│                                             exclusive." Surgical rollback (not whole-file
│                                             restore), since the shared files it touches also
│                                             carry Phase 1/2/3/9's own blocks.
│                                             A SECOND RAW misreading in the same list was found
│                                             the same way and is fixed in this same folder:
│                                             "+1 Skill Rank (0 -> 1)" applied to every roll kind
│                                             except Damage, though RAW restricts it twice in one
│                                             sentence ("from 0 to 1", "avoiding Unskilled Roll
│                                             penalties") -- so it is now gated by
│                                             voidSkillRankApplies() to a skill-based roll made
│                                             unskilled, which includes an unskilled weapon
│                                             attack. The two fixes revert independently; see
│                                             that folder's ROLLBACK.md
├── BUGFIX — Void Offer List (Wrong Baseline, Silent Refusal)/  (bugfix, not a Part; stays flat)
│                                             two defects in Part G Phase 3's Void OFFER LIST,
│                                             both reported on a real device. voidKeyWouldMatter()
│                                             compared each key against the pool CURRENTLY ON
│                                             SCREEN rather than the unmodified one -- and since
│                                             arming one one-roll effect clears the others, every
│                                             other key looked relevant once anything was ticked,
│                                             putting "+1 Skill Rank" back on trained rolls. And a
│                                             key refused by canSpendVoid() was dropped along with
│                                             its reason, so "no Void Points left" looked exactly
│                                             like a broken feature. Both fixed in Phase 3's own
│                                             fragment; six checks added to its harness (35 -> 41)
├── BUGFIX — Mastery Rank Labelling/                       (bugfix, not a Part; stays flat)
│                                             reported on a real device during Feature 4.5.12's
│                                             pass: the weapon damage breakdown named the rank the
│                                             CHARACTER holds as the rank that GRANTED a mastery
│                                             ("Kenjutsu Rank 8 mastery +1k0", when Kenjutsu's
│                                             masteries are at 3 and 7). The arithmetic was right
│                                             throughout; only the attribution was wrong.
│                                             FIRST BUGFIX FOLDER TO USE THE DELIMITED ADDITIVE
│                                             MODEL rather than the whole-file originals/ restore
│                                             the three earlier ones use -- one new fragment
│                                             (209.99-bugfix-mastery-rank-label.js) plus one seam
│                                             block and TWO purely additive blocks in TRUNK code
│                                             (100-dice-engine.js), so removal rebuilds
│                                             BYTE-IDENTICAL. No stylesheet, deliberately: it adds
│                                             no element, class or colour, so an empty file was not
│                                             created -- declared in its README and ROLLBACK.
│                                             TWO LEDGER FIGURES CORRECTED BY MEASUREMENT: it does
│                                             NOT need "a new lookup" (getStructuredMastery already
│                                             returns the raw threshold tables, for Phase 3's
│                                             (Part G) debug button) and it does NOT touch "7 call
│                                             sites across 3 files" (three adjacent lines in one;
│                                             the Skill-info debug button already labels correctly,
│                                             measured). Rewrites lines IN PLACE, so the
│                                             masteryDamageExempt notice and anything a later phase
│                                             appends are left exactly as found.
│                                             ⚠️ MARKER_RE CAPTURES THE BARE WORD "BUGFIX", never
│                                             "BUGFIX MASTERYRANK" -- so feature-dependencies.py
│                                             exits 1 under the long spelling and 0 under the short
│                                             one, the remover must accept both inside its own
│                                             blocks, and NO LINE INSIDE A BLOCK MAY MENTION
│                                             ANOTHER BUGFIX or it is swallowed rather than
│                                             refused. Its test-removal.py reads the LIVE tree and
│                                             enforces that; it fired on this fix's own comment.
│                                             ⚠️ ITS ROLLBACK CORRECTS 4.5.11's: eight earlier Part
│                                             I removers have the dead parents[3] guard, not ten --
│                                             4.5.2's was already fixed, and the base 4.5 one uses
│                                             a substring match that does fire. Audited across all
│                                             thirteen folders.
│                                             ⚠️ REWORDED AFTER A SECOND DEVICE REPORT, same day.
│                                             Correcting the rank IN PLACE ("Kenjutsu Rank 3
│                                             mastery") was accurate and STILL AMBIGUOUS -- it
│                                             parses as "[Kenjutsu Rank 3] mastery", so a Rank 8
│                                             reader still has to work out whether that 3 is their
│                                             rank or the threshold. The number was fixed; the
│                                             QUESTION had only been moved. The clause now names the
│                                             rank as the SOURCE: "Kenjutsu mastery from Rank 3:
│                                             +1k0 -> 6k2." MR-SCOPE-04 fails if any line reverts to
│                                             the ambiguous shape, and MR-SCOPE-01 was rewritten
│                                             from "only the rank number changed" -- a premise the
│                                             reword destroyed -- to "every changed line kept its
│                                             effect text exactly", which is stronger. STANDING
│                                             LESSON: a label can be factually correct and still
│                                             read wrong; correcting the VALUE is not the same as
│                                             removing the AMBIGUITY.
│                                             Own suite 27/27, combined 980/980, 953/953 removed,
│                                             byte-identical removal, 16/16 removal fixtures. Eight
│                                             isolated reverts all go red; one of them found a
│                                             decision with NO check on it (see the README's
│                                             MR-GUARD-03). The bundled ammo-picker half was
│                                             deliberately NOT shipped with it -- it is blocked on
│                                             a product ruling. Not real-device confirmed
├── BUGFIX — Negative Roll Modifier Display/               (bugfix, not a Part; stays flat)
│                                             a negative flat total modifier was printed with a
│                                             hardcoded "+": the roll modal read "Keeping 3 of 5
│                                             (suggested 3) + -40 bonus" on a WOUNDED character
│                                             with no Disadvantage configured. Pre-existing since
│                                             Wound Penalties (Part C, Feature 3); Feature 4.5.9
│                                             confirmed it as pre-existing and three ROLLBACK files
│                                             asked for this folder. The arithmetic was never wrong.
│                                             result.bonus SUMS TWO UNLIKE THINGS -- the Ten Dice
│                                             Rule's conversion bonus (always >= 0) and the
│                                             pipeline's totalDelta (wounds, firing into melee, a
│                                             required Raise) -- so the number can be net negative
│                                             and the word in front of it has to follow. That is why
│                                             it is a WORDING fix, not a sign fix.
│                                             MEASURED: THREE sites format it with a hardcoded "+"
│                                             and TWO are visible. The keep-note was reported; the
│                                             NOTATION line ("12k4 -> 10k5 +-40") was NOT, and was
│                                             found by driving the roll rather than reading the
│                                             report. Both fixed. The third ("Ten Dice Rule bonus:
│                                             +-40") is DELIBERATELY left: it can only malform when
│                                             totalDelta is non-zero, which is exactly when
│                                             attachRollModifierBreakdown() hides it, and correcting
│                                             only its sign would leave it calling a wound penalty a
│                                             Ten Dice Rule bonus. NEGMOD-HIDDEN-01 pins that it
│                                             stays hidden. formatRollNotation() has the same shape
│                                             but reads applyTenDiceRule() directly, whose bonus is
│                                             built from non-negative counts -- measured safe, not
│                                             assumed.
│                                             ⚠️ ITS REMOVER RESTORES, IT DOES NOT ONLY CUT. Unlike
│                                             the Mastery Rank Labelling fix, this one REWRITES two
│                                             trunk expressions, so the remover carries their
│                                             original text and puts it back. What makes that text
│                                             verifiable is that both blocks keep the trunk's own
│                                             expression as their guarded fallback, so the exact
│                                             restore text is in the live file; two fixtures assert
│                                             the live tree and the RESTORE table agree.
│                                             ⚠️ ITS KILL-SWITCH WAS DECORATIVE ON FIRST WRITE and
│                                             an isolated revert found it: neither helper consulted
│                                             the flag, so the switch changed nothing on screen
│                                             (11/12). Both helpers now return the TRUNK'S OWN
│                                             pre-fix formatting when it is off, so a disabled build
│                                             is byte-identical to the pre-fix one, and the revert
│                                             reds eight checks (4/12). STANDING LESSON, the second
│                                             of this kind after 4.5.11's live-tree guard: a switch
│                                             that is declared but never READ is not a switch.
│                                             No stylesheet, deliberately -- declared, not silent.
│                                             Positive values unchanged byte for byte, asserted
│                                             against a recorded pre-fix baseline. Own suite 12/12,
│                                             combined 992/992, 980/980 removed, byte-identical
│                                             removal, 17/17 removal fixtures. Six isolated reverts
│                                             all go red. REAL-DEVICE CONFIRMED same day, across
│                                             TWO rounds: "Keeping 3 of 8 (suggested 3) - 10
│                                             penalty" on a Hurt character and "11k3 -> 10k3 -10
│                                             (Ten Dice Rule)" -- a capped pool with no real Ten
│                                             Dice bonus, wound-penalty-only. A second round closed
│                                             the gap the first left open: 16k8 on the same
│                                             character produced a GENUINE +4 Ten Dice bonus
│                                             alongside the -3 wound penalty, net +1, rendering as
│                                             "Keeping 10 of 10 (suggested 10) + 1 bonus" and
│                                             "16k8 -> 10k10 +1 (Ten Dice Rule)". Incidental
│                                             corroboration both rounds: Phase 4's (Part G)
│                                             roll-modifier breakdown panel -- a separate rendering
│                                             path this fix does not touch -- agreed throughout,
│                                             including the Net +1 in round two.
│                                             Still unconfirmed: the same mix with the net
│                                             REVERSED -- a real Ten Dice bonus present but
│                                             outweighed by a larger wound penalty
├── PART K — Phase 12 Play and Management Modes/
│                                             Phase 12, PART 1 of one-part-per-tab (owner's request, so
│                                             each part is testable and a usage limit strands nothing).
│                                             209.9996 + 59.997 + one seam block (PART K PHASE 12 /
│                                             END MODES12); no trunk edit. MODES12: mode (never saved),
│                                             Manage/Done toggle beside the name, ONE capture-phase gate,
│                                             and MODES12.register(selector) -- EVERY LATER PART REGISTERS
│                                             ITS TAB FROM ITS OWN FRAGMENT and hard-depends on this one.
│                                             Locks Background only. Hooks by property: CL11.openCharacter
│                                             /createNew, CW112.finish; toolbar Load/New/Import listeners.
│                                             ⚠️ A MutationObserver that also updates DOM text loops
│                                             forever (hit here on the first tap; lockNew only sets
│                                             attributes). 25/25 own, 11/11 variants, byte-identical
│                                             removal to 0dcb56e8. Phase 11's CL-COPY-INDEPENDENT made
│                                             conditional (declared). REAL-DEVICE CONFIRMED 25 Sep.
├── PART K — Phase 12.1 Play Mode Clan and School/
│                                             Phase 12 PART 2: registers the Clan & School tab (four
│                                             pickers, Apply Family, Apply School) with part 1's gate;
│                                             pickers shown as plain text in Play; Affinity info stays.
│                                             209.9997 + 59.998 + one seam block (PART K PHASE 12.1 /
│                                             END MODES121). HARD dependency on part 1. 14/14 own, 5/5
│                                             variants, byte-identical removal to 6c860a52.
├── PART K — Phase 12.2 Play Mode Identity/
│                                             Phase 12 PART 3: Identity read-only in Play EXCEPT Honor/
│                                             Glory/Status points and Taint (owner's ruling). 209.9998 +
│                                             59.999 + one seam block (PART K PHASE 12.2 / END MODES122).
│                                             ⚠️ refreshMultipleSchoolsUI() re-sets btnAddSchoolToggle's
│                                             disabled on EVERY recalc, so Play keeps it inert by the gate
│                                             and CSS, not by disabled. HARD dependency on part 1. 17/17
│                                             own, 6/6 variants, byte-identical removal to d6c0c79b.
├── PART K — Phase 12.3 Play Mode Rings and Traits/
│                                             Phase 12 PART 4: Trait/Ring boxes and Void RING steppers
│                                             locked in Play; Void POINT pips stay live. 209.9999 +
│                                             59.9991 + one seam block (PART K PHASE 12.3 / END
│                                             MODES123). Ring boxes carry INLINE shading, so its CSS
│                                             needs !important. HARD dependency on part 1. 16/16 own,
│                                             6/6 variants, byte-identical removal to c4ddd6fb.
├── PART K — Phase 12.4 Play Mode Skills/
│                                             Phase 12 PART 5: Skill row controls and Add Skill locked in
│                                             Play; each row's d10, Untrained Skills and Skill Info stay
│                                             live. 209.99991 + 59.9992 + one seam block (PART K PHASE
│                                             12.4 / END MODES124). ⚠️ The Skills table's own styles
│                                             outrank part 1's hide-locked-buttons rule: a tab with
│                                             table buttons needs its own ID-scoped !important rule.
│                                             HARD dependency on part 1. 17/17 own, 6/6 variants,
│                                             byte-identical removal to f3174bba. REAL-DEVICE CONFIRMED 25 Sep.
├── PART K — Phase 12.6 Play Mode Techniques/
│                                             Phase 12's Techniques tab (built before Adv & Disadv, whose
│                                             12.5 was reserved). Entry controls, pickers, Add and the
│                                             memorised tick locked in Play; Cast, Why-can't-I-cast and
│                                             Kiho rules stay live. SCOPED TO #techList: Advantage rows
│                                             share makeEntry's classes. 209.99992 + 59.9993 + one seam
│                                             block (PART K PHASE 12.6 / END MODES126). ⚠️ "part of Phase
│                                             12" in a comment IS a marker to MARKER_RE (hit here).
│                                             16/16 own, 6/6 variants, byte-identical removal to 4ac2b09f.
│                                             REAL-DEVICE CONFIRMED 25 Sep.
├── PART K — Phase 12.5 Play Mode Advantages and Disadvantages/
│                                             Built after 12.6, on codex/phase-12-5-adv-disadv. Purchase
│                                             editing locked in Play; contextual, resource and info
│                                             actions remain live. Parent gate/observer reused; stale
│                                             configuration drafts cancelled. Own CSS activation class
│                                             honours the kill switch. No rules/schema/registry seat.
│                                             Removal to 7f187450…fc4ff0; OWNER TESTED, MERGED 28 Sep.
│                                             Read its README for the current QA totals and runner.
├── PART K — Phase 12.7 Play Mode Combat/
│                                             Combat is a Play tab: in Management it leaves the carousel
│                                             through its OWN data-visible-with path, pointing at a gate
│                                             element OUTSIDE the carousel (so Safari's hidden-page
│                                             display:none cannot reach it). Wraps MODES12.refresh by
│                                             property; refreshVisibility() makes a switch take effect
│                                             in the same task. Leaving from Combat lands on Equipment.
│                                             ⚠️ goToTab() glides to the OLD slot; after the rebuild the
│                                             carousel thinks it is parked and the glide runs on past
│                                             (to Background). One instant scrollLeft assignment stops
│                                             it. ⚠️ Print hides .car-page[hidden]: 59.9995 CSS keeps
│                                             Combat on paper. ⚠️ A fresh page is Management, so three
│                                             retained harnesses (1.6 wounds, both Spell Slots bugfixes)
│                                             got test-only corrections; originals/ keeps them.
│                                             209.99995 + 59.9995 + one seam block (PART K PHASE 12.7 /
│                                             END MODES127). HARD dependency on part 1. 55/55 own, 38/55
│                                             without it, 9/9 variants, byte-identical removal to
│                                             2c8a426f. REAL-DEVICE CONFIRMED 30 Sep; merged to main.
├── PART K — Phase 12.8 Play Mode Toolbar/
│                                             The old toolbar row replaced (owner's choices, 30 Sep):
│                                             header Characters, Save, ⋯ (Save As a copy in Management,
│                                             Print, Export JSON), Manage/Done. New Blank removed. The
│                                             existing buttons are MOVED (ids, listeners, wrappers
│                                             intact); the rest of the row stays in the page, hidden
│                                             (#charSelect still holds the open id). Wraps
│                                             CL11.addToolbarButton by property; installs nothing
│                                             without the Characters list. ⚠️ The header clips what
│                                             overflows it: the ⋯ menu lives at the end of <body>,
│                                             placed on opening. ⚠️ A test cannot type into a field on
│                                             a page the carousel is not showing (it is inert): go to
│                                             that tab first. ⚠️ Fourteen retained harnesses clicked
│                                             the old row; test-only corrections, originals/ keeps
│                                             them. 37/37 own, 9/37 without it, 10/10 variants,
│                                             byte-identical removal to 47fdb778. REAL-DEVICE CONFIRMED 30 Sep; merged.
├── PART K — Phase 12 Play and Management Modes Audit/
│                                             not a build folder: Phase 12's first deliverable (25 Sep),
│                                             documentation only. Every control on all ten tabs,
│                                             measured in the live build by qa/inventory-controls.js,
│                                             classified Management-only / Play / info under the
│                                             owner's rulings. Recommends ONE capture-phase gate plus a
│                                             selector registry (the sheet keeps state in its inputs;
│                                             most edits are anonymous listeners, so there is no
│                                             function to gate). About 17-27% over stages 12/12.1/12.2.
│                                             Its four rulings were TAKEN AS RECOMMENDED 25 Sep
│                                             (recorded in the audit and the roadmap's Phase 12
│                                             section); stage 12 is ready to build.
├── BUGFIX — Spell Slot Accounting/                        (bugfix, not a Part; stays flat)
│                                             two spell-slot counter defects, one folder, two
│                                             switches. (1) A CANCELLED CAST STILL USED ITS SLOT:
│                                             castSpell() spends BEFORE the roll preview and
│                                             nothing read rollWithModifiers()'s null on Cancel
│                                             (since Phase 3 (Part G) added the Cancel). Found on
│                                             the iPhone through A14, affects every caster. Fixed
│                                             by REFUNDING, not moving the spend: snapshot the
│                                             counters when a cast starts, take the difference
│                                             when its Casting Roll starts, give exactly that back
│                                             if that roll's preview (or 4.5.2's Willpower-check
│                                             preview before it) answers Cancel. Covers Element,
│                                             bonus, 4.5.20 Ring and Maho Own-Blood Wounds with no
│                                             edit to any of them. A FAILED Enlightened Madness
│                                             check still keeps the slot (4.5.2's approved rule).
│                                             A refund arriving after the counters changed is
│                                             dropped. (2) A hand-tapped bonus pip could overfill
│                                             the shared pool; now refused when full, take-back
│                                             changes only the tapped row, and an overfull save
│                                             is WARNED, never repaired (owner's ruling).
│                                             209.992 fragment (LAST among sheet fragments -- its
│                                             five wrappers must be outermost) + 59.992 CSS + one
│                                             guarded block in 080's click handler + seam block.
│                                             ⚠️ To catch a spell cast in a harness, click the
│                                             spell's own .spell-cast-btn; castSpell is not on
│                                             the seam, and calling performSpellCastRoll()
│                                             directly skips every castSpell wrapper.
│                                             REAL-DEVICE CONFIRMED 24 Sep.
├── BUGFIX — Spell Slots Tab on Safari/                    (bugfix, not a Part; stays flat)
│                                             the iPhone never showed the Spell Slots tab. Measured
│                                             on the device with a diagnostic bookmarklet: SAFARI
│                                             REPORTS display:none FOR ANYTHING INSIDE A HIDDEN
│                                             PAGE (Chromium reports the element's own value), so
│                                             the carousel's targetHidden() could never see the
│                                             section as shown once its page was hidden at load.
│                                             Fix: two delimited blocks in 10-carousel.js that
│                                             un-hide, measure and re-hide the page synchronously
│                                             (switch SAFARI_TAB_PROBE_ENABLED). The earlier
│                                             Visibility Race bugfix was real but not this cause.
│                                             ⚠️ Headless Chromium CANNOT show this bug; the
│                                             harness emulates Safari with one test-only rule,
│                                             `.car-page[hidden] #spellSlotsSection{display:none
│                                             !important}`. Any future check of what is visible
│                                             inside a hidden page needs the same emulation.
│                                             REAL-DEVICE CONFIRMED 24 Sep.
├── BUGFIX — Service Worker Redirected Page/               (bugfix, not a Part; stays flat)
│                                             "Response served by service worker has redirections"
│                                             on the iPhone. Phase 0.6's sw.js saved the page by
│                                             fetching ./index.html, which CLOUDFLARE PAGES
│                                             REDIRECTS TO /, so the cached copy carried the
│                                             redirected flag and browsers refuse it for a page
│                                             load (Chromium too: net::ERR_FAILED, so it IS
│                                             reproducible headlessly). Three delimited blocks in
│                                             Phase 0.6's src/sw.js (SWREDIRECT, switch
│                                             SW_REDIRECT_FIX_ENABLED) store and serve a clean copy.
│                                             ⚠️ Phase 0.6's own harness serves /index.html with no
│                                             redirect and cannot see this; this folder's harness
│                                             has a PAGES mode that redirects like Cloudflare.
│                                             REAL-DEVICE CONFIRMED 24 Sep.
├── BUGFIX — Kitsune Shugenja Listed Under Mantis/        (bugfix, not a Part; stays flat)
│                                             the owner's removal, 25 Sep: ONE LINE DELETED from
│                                             060-lib-schools.js (Mantis's "Kitsune Shugenja
│                                             [Mantis]", a word-for-word copy of the Fox Clan's
│                                             Kitsune Shugenja). No fragment, block or seam key;
│                                             its remover PUTS THE LINE BACK. The Mantis Kitsune
│                                             FAMILY is untouched. An old save with that School
│                                             loads without error but loses its granted Technique
│                                             row, as for any unknown School; no migration.
│                                             ⚠️ A library edit changes the build under every Part
│                                             K stage: their live fixtures undo it first
│                                             (LATER_FIXES). A new trunk fix must be added there --
│                                             now ONE entry in QA — Removal Chain Registry.
├── BUGFIX — Import File Picker Filter/                (bugfix, not a Part; stays flat)
│                                             iPhone could not PICK an older ".l5r" save: both
│                                             Import controls had accept=JSON, and iOS greys other
│                                             files. One fragment (209.999, BUGFIX IMPORTFILTER)
│                                             removes accept from #fileImport at load and from
│                                             #cl11ImportFile after each CL11.build (wrapped by
│                                             property). Imports still refuse non-JSON and
│                                             non-character files. Headless browsers ignore
│                                             accept, so the oracle is the attribute itself.
│                                             SOFT dependency on Phase 11; Phase 11's remover
│                                             refuses while it is present. In the shared removal
│                                             chain (QA — Removal Chain Registry).
├── BUGFIX — Apply School Skill Rows/                   (bugfix, not a Part; stays flat)
│                                             the ledger said "placeholder rows for four Schools";
│                                             MEASURED FIRST IT WAS 69 OF THE 104 SCHOOLS: every
│                                             "Family: Subject" School Skill (Lore: X, Craft: X,
│                                             Perform: X, Games: X) was added with NO TRAIT, so its
│                                             roll refused, because findSkill() matches exact names
│                                             only. Plus Theology/War Fans (library names), Tsi and
│                                             Kasuga's comma-split choices, and -- found by its own
│                                             sweep -- Jurojin's "Medicine (Disease, Herbalism)"
│                                             split at the bracketed comma. One fragment (209.9995,
│                                             BUGFIX SCHOOLSKILLROWS), two ADDITIVE blocks in trunk
│                                             080 (Apply School's loop) and one seam block.
│                                             ⚠️ IT CORRECTS THE SCHOOL LIBRARY AT LOAD rather than
│                                             renaming rows: the second-School unlock and Phase 5's
│                                             (Part J) character check read the library text too, so
│                                             renaming rows alone would have made every Mirumoto
│                                             character "miss" Theology. Old rows keep their names
│                                             (revertSchoolApplied finds rows by the recorded name)
│                                             and are matched through a two-entry alias table.
│                                             ⚠️ It REBINDS BY NAME: makeSkillRow (wrapped),
│                                             schoolConcreteSkillNames and hasSchoolSkillOverlap
│                                             (070) and three of Phase 5's validator helpers
│                                             (guarded; soft dependency, declared). A School's Skill
│                                             text is read with the wizard's own rule ("any" opens a
│                                             choice until it says Skill) plus bracket depth.
│                                             37/37 own (sweep of all 104 Schools, 578 rows; oracle
│                                             is SKILL_LIBRARY), 13/37 on the pre-fix build,
│                                             2,472/2,472 combined, byte-identical removal to
│                                             738c7ccf, 12/12 pinned variants (three added after the
│                                             first run found checks nothing could turn red). The
│                                             FIRST RELEASE REGISTERED IN THE SHARED REMOVAL CHAIN:
│                                             one line, no edit to any earlier folder.
│                                             REAL-DEVICE CONFIRMED 25 Sep (branch preview).
├── BUGFIX — Dependant Inline Typing/                  (bugfix, not a Part; stays flat)
│                                             4.5.8's two optional Dependant fields lost typing: the
│                                             list's input listener rebuilt the row on the FIRST
│                                             keystroke, before 4.5.8's change-only commit. One
│                                             fragment (209.99994, BUGFIX DEPTYPE, switch
│                                             DEPENDANT_TYPING_ENABLED) + one seam block: save every
│                                             keystroke, skip D45.refresh for the row whose field has
│                                             focus, stop 4.5.8's commit-time recalcAll (it rebuilt
│                                             the editor being moved INTO), repaint only this row
│                                             once focus is out of it. ⚠️ A test that sets .value and
│                                             dispatches change cannot see this class of bug; type
│                                             with the keyboard and move focus straight between
│                                             editors. ⚠️ A mouse click in a harness must be scrolled
│                                             into view first, or it lands on the page. HARD
│                                             dependency on 4.5.8. 73/73 own, 20/73 unfixed, 8/8
│                                             pinned variants, byte-identical removal to 4f8509e6.
│                                             Started by Codex; finished after a laptop crash.
│                                             REAL-DEVICE CONFIRMED 30 Sep; merged to main.
├── BUGFIX — Manage Button Clipping/                    (bugfix, not a Part; stays flat)
│                                             the owner's iPhone report (Phase 4.8 feedback point 5,
│                                             30 Sep): the first tap on Manage showed "M|DONE".
│                                             MEASURED: the label change resized the toggle (70.7 ->
│                                             53.1px at 390px, fallback font) and the header's other
│                                             buttons moved ~18px; the stale letter is a READING of
│                                             Safari's repaint, not reproducible headlessly. ONE CSS
│                                             RULE (59.9998): an invisible zero-height ::after line
│                                             holding "Manage", so the button is always as wide as its
│                                             longer label in ANY font -- no measured width anywhere.
│                                             Plus a three-line switch fragment (209.99999, BUGFIX
│                                             MANAGETOGGLE, MANAGE_TOGGLE_FIX_ENABLED adds the class
│                                             the rule waits for). ⚠️ THE FRAGMENT IS ALSO WHAT LETS
│                                             THE REMOVAL CHAIN ORDER IT: test-chain.py checks CHAIN
│                                             against manifest order, and a stylesheet sits before
│                                             every script, so a CSS-only release cannot register.
│                                             The harness's "without the fix" oracle is the same page
│                                             with the ::after switched off by a test-only style, so
│                                             each width also proves the premise; a hidden label must
│                                             paint nothing (screenshot unchanged when forced
│                                             transparent). Phase 12's remover refuses while it is
│                                             present (it names pm12Toggle): remove the fix first.
│                                             36/36 own, 26/36 without it, 6/6 variants,
│                                             byte-identical removal to ceb2d4b2. Not yet seen on
│                                             the iPhone.
├── BUGFIX — Multiple Schools Keep Earlier Techniques/  (bugfix, not a Part; stays flat)
│                                             found 1 Oct assessing Phase 4.6 (headless, not from a
│                                             device): adding a School through Multiple Schools
│                                             STRIPPED every Technique (and a monk's free Kiho) the
│                                             earlier School granted, once the new School unlocked.
│                                             Cause: applyUnlockedTechniquesToList() reads any change
│                                             of the active School as a REPLACEMENT. Core p.151-152:
│                                             nothing is forgotten. ONE FRAGMENT (209.999991, BUGFIX
│                                             MSTECH, MSTECH_ENABLED) rebinds that trunk function: a
│                                             previous School still in the Schools list is kept; one
│                                             gone from it (Apply School, retyped name) is stripped as
│                                             before, plus any earlier School no longer listed. A row's
│                                             School comes from its tag, longest known name first (a
│                                             name may hold "]"). No shared-file block, no seam key, no
│                                             save field. ⚠️ A FROZEN SCHOOL IS STILL THE CHARACTER'S:
│                                             code keyed to "the previous School" must ask the Schools
│                                             list. Not fixed here: the Alternate Path record holds a
│                                             Rank but no School (Phase 4.6's first release). 32/32
│                                             own, 21/32 on main, 7/7 pinned variants, byte-identical
│                                             removal to f4345b4a. Merged 1 Oct; CONFIRMED on the
│                                             iPhone 1 Oct (5/5).
├── BUGFIX — Ancestor Corrections (Void Offer, Info Button, Clan Picker)/  (bugfix; stays flat)
│                                             three corrections from the owner's 1 Oct iPhone check,
│                                             bundled on the owner's word, one switch each. (1) VOID:
│                                             with Seppun's/Komori Iongi's gift ticked the preview
│                                             offered "Make Skilled" on Rank 1 Skill and Trait rolls:
│                                             the gift switches off when any Void option is armed, and
│                                             Phase 3's (Part G) voidKeyWouldMatter counted that as the
│                                             option mattering. Rebound: its own test first, then the
│                                             option must bring its OWN source:'void' modifier. ⚠️ ANY
│                                             contributor whose bonus depends on Void being unarmed
│                                             reopens this class (cf. the Void Offer List bugfix).
│                                             (2) INFO: the Ancestor's i takes the A01-A16 style
│                                             (28px, ink ring, Georgia upright), not .adv-config-info's
│                                             18px gold italic one (CSS 59.9999, class ancfix-info).
│                                             (3) CLAN: the card redraws on a Clan/Minor Clan picker
│                                             change. 28/28 own, 18/28 on main, 7/7 variants, both
│                                             boundaries green, byte-identical removal to 7daf6aec.
│                                             Phase 4.8's remover refuses while it is present (names
│                                             anc48): the chain removes it first. Merged 1 Oct
│                                             (5cd7117), before the iPhone re-test.
├── BUGFIX — Technique Name Clashes/                     (bugfix; stays flat)
│                                             2 Oct, same branch as Phase 6's first release (Part G),
│                                             built first. techniqueDescription() looks text up BY NAME
│                                             ALONE. (1) "The Gift of the Lady" is the Doji Courtier's
│                                             Rank 5 (Core p.111) AND the Kikage Zumi's Rank 1 (IH1
│                                             p.215): TECH_DESCRIPTIONS held the key twice, the monk's
│                                             won, so a Rank 5 Doji read the tattoo Technique. (2) The
│                                             Master of Games Path's "Forge Your Own Fate" stood in for
│                                             the Toku Bushi's Rank 4. (3) The text is SAVED in each
│                                             Technique row, so fixing text alone reaches only new
│                                             characters. ONE FRAGMENT (209.999994, BUGFIX TECHNAMES,
│                                             object TECHNAMES) + one seam block (technique-names-seam).
│                                             Rebinds unlockTechniques (a School's own Technique answers
│                                             with TECHNAMES.BY_SCHOOL text) and applyData (OWNER'S
│                                             RULING 2 Oct: a School Technique row still holding text
│                                             the sheet wrote and now knows is wrong or missing -- the
│                                             notice or a TECHNAMES.STALE text -- is rewritten on load,
│                                             before the Characters list marks it saved; an edited or
│                                             untagged row never). Renames the Path's Technique at load
│                                             to "Forge Your Own Fate (Master of Games)" (Phase 4.6's
│                                             fragment untouched). ⚠️ LOAD CHECK: a Path Technique named
│                                             like ANY School Technique, or a name two Schools share
│                                             without text for each, is refused (console.error). ⚠️ Made
│                                             Phase 4.6's R3LOAD pin conditional (renamed if TECHNAMES).
│                                             26/26 own, 13/26 on main, 10/10 variants, both
│                                             boundaries green, byte-identical removal to aa5c55d9.
│                                             MERGED 2 Oct on the owner's word, before the iPhone check.
│
├── PART I — Phase 4.5 Sourcebook Audit of Advantages and Disadvantages/  (audit, docs only)
│                                             2 Oct, branch claude/adv-disadv-audit (docs only, not
│                                             merged). The owner's full sourcebook audit of Advantages
│                                             and Disadvantages, building nothing; also published as a
│                                             Claude Doc. AUDIT.md: the sheet's 139 (all 131 Core + 8),
│                                             what the sheet does with each; 65 missing (42 usable, 23
│                                             Naga/Nezumi only), each in our own words with book and
│                                             page; pickers needed (9 existing, 16 missing, 4 options);
│                                             automation by existing mechanism (60 + 34); 43 unapplied
│                                             Clan/School prices. Book text was read from scratch only.
│                                             Four rulings asked; nothing built until the owner chooses.
│
├── SOURCEBOOK INDEX — Page Map/                        (documentation, not a Part; stays flat)
│                                             30 Sep, merged. Supplementary fan-wiki links
│                                             (wiki_links.json; `build_index.py --from-json` rewrites
│                                             the index without the PDFs) -- the books stay primary.
│                                             build_index.py reads the owner's PDFs (outside the
│                                             repo) and writes INDEX.md, OUTLINES.md, index.json:
│                                             topic -> book -> printed page (PDF page), bookmarks,
│                                             and the sheet's Schools/techniques matched to pages.
│                                             Page numbers and headings ONLY (owner's ruling:
│                                             rules content in our own words); extracted text is
│                                             never saved. Printed = PDF - 1 in 14 books, - 3 in
│                                             Core, same in Unexpected Allies 2. Not in the build.
├── QA — Removal Chain Registry/                         (test infrastructure, not a Part; stays flat)
│                                             THE ONE LIST OF RELEASES WHOSE REMOVAL FIXTURES STRIP
│                                             LATER WORK FIRST. Replaced the hand-kept LATER_STAGES /
│                                             LATER_FIXES tuples in 14 fixture files across 8 folders
│                                             (Phases 11 to 11.2.4, the Kitsune and Import fixes).
│                                             ⚠️ A NEW RELEASE BUILT AFTER PHASE 11 ADDS ONE ENTRY AT
│                                             THE END OF CHAIN in removal_chain.py, gives its own
│                                             fixtures THIS_RELEASE and the _removal_chain() locator,
│                                             and runs qa/test-chain.py -- which fails on any
│                                             src/sheet/209.* fragment after the chain's first that
│                                             is not registered. An unregistered folder raises
│                                             ChainError, never "nothing later".
│                                             Locates Versions/ and every release folder WITHOUT
│                                             counting parents, so it is wrapper-proof (the Part I /
│                                             Part K wrapper blocker is otherwise unchanged).
│                                             Removes strictly in reverse build order; fixes=False
│                                             keeps text-only fixes applied (the "phase removed"
│                                             variants' old behaviour). Sheet build untouched.
│                                             11/11 own checks; six sabotage variants (scratch copies
│                                             of Versions/) each go red. Rollback restores the 14
│                                             files from its originals/ and re-adds any later
│                                             release to them by hand.
├── 00 Build History/                                     (pre-Part archive; stays flat)
├── Old roadmaps/                                         superseded roadmap docs
├── L5R Character Sheet Phased Roadmap reorder.md         current roadmap — single source of truth
├── BUILD-LEDGER.md                                       phase status: what is verified vs merely
│                                                         built vs finished. A snapshot, not a
│                                                         source of truth — the roadmap defines
│                                                         WHAT the phases are, this tracks HOW FAR
│                                                         along each one is. Renders on GitHub;
│                                                         its task-list boxes are tickable by hand
├── BUILD-LEDGER.html                                     source of the published Rokugan Build
│                                                         Ledger artifact (the interactive copy,
│                                                         whose tick-boxes persist). GitHub shows
│                                                         this as source, not a rendered page
└── CLAUDE.md                                             this file
```

**Work in `Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for
Maintainability`.** That folder is the head. Its `src/` tree holds the sheet cut into 39
fragments by concern — `src/css/`, `src/markup/`, `src/sheet/` (21 files), `src/layer/`,
`src/shell/` — and `python3 build/recombine.py` concatenates them back into the same
single-file HTML the app has always been. Edit a fragment, rebuild, open the output.

Phase 0 changed no behaviour: its build output is **byte-identical** to the Part E 1.1
deliverable it was split from. That folder's `README.md` and `ROLLBACK.md` carry the detail,
including the recorded QA baselines.

**Feature phases edit Phase 0's fragments directly; delivery phases never do.** Part F's own
later phases (0.5, 0.6, 0.7) only ever read Phase 0's *built output* and wrap it — none of them
touches its sources, which is what lets each be rolled back by deleting its own folder. A phase
whose job is an actual sheet feature (Part H's Phase 1.6, and Parts G/I/J/K to come) cannot work
that way: the code being changed — `renderWounds()`, a skill list, a roll modifier — lives inside
Phase 0's fragments, so changing what it does means editing the fragment it is defined in. That
phase still gets its own folder, its own `README.md`/`ROLLBACK.md`, and its own QA — the folder
just documents a diff made in Phase 0 rather than containing the diff itself. Its `originals/`
holds a verbatim pre-edit copy of every fragment it touched, so rollback means restoring those
copies over Phase 0's live tree, not deleting a folder Phase 0 never depended on. See Phase 1.6's
own `README.md` and `ROLLBACK.md` for the fully worked example.

**A Part letter being thematically about features does not mean every phase inside it edits
Phase 0.** Part G's first phase, 1.5 (Roll Pipeline Consolidation), is explicitly scoped as
audit-and-baseline-only — it reads Phase 0's existing pipeline through `window.__L5R_TEST__` and
documents/tests what is already there, changing nothing. Its folder therefore follows the
delivery-phase rollback model (delete the folder) despite sitting under a feature Part, and has
no `originals/`. Check each phase's own Engineering Scope before assuming which model applies —
"lives under a feature Part" and "edits Phase 0's sources" are independent facts, not the same
fact twice.

The two single-file trunks are kept as the previous line:

- **Part E** (`PART E — Feature 1 Monks & Kiho` + its `1.1` layer) is what Phase 0 split.
  It still builds via its own `splice_swipe_tabs.py` and still passes. It is no longer where
  edits go.
- **Part C** (`PART C — Feature 8 Mirumoto Rank 1`) and its six Part D layers are the
  pre-monk line, kept for the same reason.

Within that older model every layer read its trunk directly and wrote only to itself; none
depended on another, and Part E 1.1 carried its own copies of every sidecar. All of that
still holds for those folders — it just no longer describes where current work happens.

## Other repository content

- **`L5R 4th edition books/`** (gitignored; **on this desktop it is not inside either clone** but at
  `%USERPROFILE%\OneDrive\Documents\L5R 4th edition books`, checked 30 September 2026. The
  `.gitignore` entry still covers a copy at the repo root) —
  the user's own legally-owned sourcebook PDFs. This is source material staged ahead of the
  roadmap's Phase 13 (Library / Sourcebook Viewer); it is not itself part of the
  `Versions/` folder convention above, and Phase 13's own storage design (client-side,
  IndexedDB, separate from character-save data) governs how these files get consumed once
  that phase is built — this top-level folder is just where they currently live.

## Building

### Current head — the split source tree (Part F, Phase 0)

```bash
python3 "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/build/recombine.py"
```

Concatenates the fragments named in `build/manifest.json`, in that order, and writes
`l5r-character-sheet.html` beside it. Stdlib only, runnable from any working directory.
`--verify` fails the build if the output stops matching the manifest's `expect_sha256`;
`--stdout` pipes it instead of writing.

Two rules for that tree:

- **Order in `manifest.json` is the build order.** The CSS cascade depends on it (the sheet's
  `@media print` block is last so it wins) and so does script sequence (the sheet's own script
  must run before the Part D layers that decorate its DOM). Adding a source file means adding
  a manifest entry in the right position.
- **`src/sheet/*.js` are fragments of one IIFE, not modules.** None parses standalone —
  `010-prelude.js` opens `(function(){` and `210-test-seam-and-init.js` closes it. Editors
  will flag unbalanced braces per file; that is expected. Making them real modules would
  change the sheet's logic.

### Deploying (Part F, Phases 0.5 and 0.6)

```bash
python3 build.py                # build the site into dist/ — what Cloudflare Pages runs
python3 build.py --check-drift  # does the committed build still match its sources?
```

One command, a chain of phases, each reusing the one below rather than
reimplementing it:

```
build.py -> 0.6 build_pwa.py -> 0.5 deploy_build.py -> 0 recombine.py -> fragments
```

Phase 0.7 hangs off the same chain rather than extending it — it *calls*
`build.py` and wraps the result, so it is not a deploy phase and `build.py` does
not delegate to it:

```
0.7 build_android.py -> build.py (above) -> stages dist/ as the Android app's web assets
```

Compiling the APK needs the Android SDK and runs in GitHub Actions. See that
phase's `BUILD-FROM-A-PHONE.md`.

`build.py` picks the highest-numbered deploy phase present, so rolling one back
needs no edit there — the next one down takes over by itself.

Phase 0.5 copies Phase 0's build to `dist/index.html`, refusing to publish if
the copy does not hash identically. Phase 0.6 then injects the PWA `<head>`
block into that output and writes `manifest.webmanifest`, `sw.js` and the icons
beside it. Neither owns assembly logic of its own — one build, not three to keep
in step.

`dist/` is gitignored: Cloudflare rebuilds it from source on every push.

Run `--check-drift` after editing anything under Phase 0's `src/`. It catches the
mistake this layout invites — changing a fragment and forgetting to rebuild, so
the committed HTML no longer matches its own sources.

### Previous line — the anchor-splice layers (Parts C–E)

Still valid for those folders, no longer where current work happens. From inside any of the
six Part D folders, or `PART E — Feature 1.1`:

```bash
cd "Versions/Part E — Monks/PART E — Feature 1.1 Monks & Kiho (Part D UI)"
python splice_swipe_tabs.py
```

It reads its trunk, injects the sidecar CSS/JS, and writes the deliverable beside
itself. It is anchor-asserted — it fails loudly rather than producing a wrong file
if the trunk shifts. Runnable from any working directory.

Those anchors are hardcoded line numbers, so **any change to a trunk's markup moves them**.
Do not adjust them by hand: derive an old-line → new-line map with `difflib` between the two
trunks and rewrite every anchor through it. When Part E 1.1 was first built the real shift ran
from +6 at the top of the body to +30 by the footer, and a constant offset would have been
wrong for seven of the ten `SECTIONS` rows. See that folder's `ROLLBACK.md`.

**Edit the sidecars (`carousel.css`, `carousel-mobile.css`, `rings-circular.css`,
`carousel.js`, `rings-order.js`, `rings-fit.js`, `dice-icons.css`,
`dice-icons.js`), never the generated HTML.** If you rename an output file, update
`DST` in the splice or the next rebuild creates a duplicate.

## Invariants every build must preserve

Check these after any change to a build:

- the sheet's own `<script>` stays **byte-identical** to the trunk
- every element ID preserved — none removed, none duplicated
- 10 sections present, and the `.roll-modal-overlay` count unchanged
- HTML tag balance clean
- the trunk file is never modified

**On the counts.** This section used to name "209 element IDs" and "16
`.roll-modal-overlay` blocks". Measured against the current head those are **227** and
**23**: the figures were written against the Part C line and the Part E monk work added to
both since. They were stale, not violated. What matters is that a build does not *change*
them, so the numbers are no longer hardcoded here — measure with
`qa/inventory.py` in the Phase 0 folder, which reports all of the above and diffs cleanly
against a recorded baseline.

Two test seams exist and must survive any build:

- `window.__L5R_TEST__` — the sheet's own surface, 356 keys as of Part I Phase 4.5.1 (grows as feature
  phases add exports; like the id/modal counts above, treat the number as a snapshot to diff
  against, not a target). Its definition is at the end of `src/sheet/210-test-seam-and-init.js`.
- `window.__L5R_CAROUSEL__` — the carousel's, 11 methods as of the Spell Slots visibility
  bugfix (`refreshVisibility()` — see `BUGFIX — Spell Slots Tab Visibility Race`; see also
  `CAROUSEL-TEST-API.md`). Paste
  `l5r-carousel-test-harness.js` into the browser console with the sheet open for a full
  regression run, or drive both seams headlessly with `qa/behaviour-harness.js`.

**Running a phase harness: `NODE_PATH=/opt/node22/lib/node_modules`.** Several phases' notes record
`/home/user/node_modules`, which does not exist in the cloud sandbox — Playwright is installed
globally. This matters more than a path typo should, because of how it fails: with the wrong
NODE_PATH every child suite fails to launch and the pre-4.5.10 runners printed
**`COMBINED 0/0 checks passed`**, a line that reads like success. Feature 4.5.10's runner treats a
0/0 run as a failure; if you chain a new runner off an older one, keep that guard.

**On the Windows desktop** (from 25 September 2026): Node.js 24.19.0 is installed, with
Playwright 1.63.0 and its Chromium in **`C:\Users\jcrow\l5r-qa-tools`**. Use
`NODE_PATH='C:\Users\jcrow\l5r-qa-tools\node_modules'`,
`PLAYWRIGHT_BROWSERS_PATH='C:\Users\jcrow\l5r-qa-tools\ms-playwright'` and, in Git Bash,
`PATH="/c/Program Files/nodejs:$PATH"`. **Not the npm global folder under `AppData`:** this
desktop's Python is a packaged build whose view of `AppData` is virtualised, so a Node process
launched FROM PYTHON (every `verify-variants.py`) cannot see `AppData\Roaming\npm` and fails
with "Cannot find module 'playwright'", which those scripts report as "no count". Node launched
directly (the combined runners) is unaffected. Found and moved on 25 September. Also set
`PYTHONUTF8=1`: several older `verify-variants.py` decode the harness output with the platform
default, which on Windows is cp1252, and crash on the harnesses' curly quotes. The combined suite measured **2,435/2,435** there on its
first run. Two differences from the cloud: the symlink fixtures skip (Windows refuses symlinks
without Developer Mode), and `build.py` run on Windows writes the PWA head block with CRLF line
endings, so a local `dist/index.html` differs from the deployed one by 119 bytes. The Phase 0
build itself is byte-identical, which is what is verified. The suite takes over 20 minutes, longer
than a tool call's time limit, so start it as a detached process and read its log.

## Design decisions already made — do not relitigate

- **No animation or motion.** A full motion layer was built, reviewed and rejected,
  and the folder deleted. Do not add transitions, fades or micro-interactions as an
  unprompted improvement.
- **The page slide is native CSS scroll-snap.** Do not replace it with a transform
  track — that would break momentum, looping and `scrollend`.
- **The carousel degrades safely.** `safeInit()` strips `car-active` on failure and a
  `<noscript>` block unwinds the shell. Preserve both.
- **Phones do not get the circular Ring layout.** It needs 512px of content width;
  the widest phone offers 406px. Below 600px the sheet's own grid stands.

## Working style the user expects

- Verify claims by measuring, not by asserting. Say plainly what was not tested.
- Report honestly when something fails or is unverified.
- Do not modify previous phases or layers.
- Ask before destructive or outward-facing actions.

**A harness must be able to fail. Prove it can.** Part H Phase 1 shipped a feature that was
broken on every tab while its own harness reported 15/15, because the harness asked the code
under test which element was on screen, scrolled that element, and then asked the same code
whether the button should now show. The two halves agreed with each other and neither agreed
with reality. Passing checks are worth nothing until you have seen them go red for the right
reason — so run a new harness against the *broken* build too, and quote both numbers (that
phase's README does: 9/9 fixed, 4/9 broken). Where a fact can be read from something this
phase does not own — the carousel's own `getActiveTab()`, an existing library constant, the
sheet's own `WOUND_PENALTIES` — take the oracle from there rather than from the code being
tested. And note what the headless harnesses cannot see at all: every phase before Phase 1
was verified only in Playwright/Chromium, and the first real-device test of this project
found two real bugs in an afternoon.

**Some fields on this sheet are displays, not state.** `#f_school` is re-rendered from
`getSchoolsList()` on every recalc, so a harness that writes to it watches the value snap back and
concludes the feature under test has latched — Phase 4.5.5's first harness cut did exactly that and
read a correct eligibility gate as a bug. `characterCasterLock()` reads the schools list, not the
field. Before driving a control from a test, check whether anything rewrites it during
`recalcAll()`; if it does, drive the underlying state or use `resetToBaseline()` instead.

**A pixel width measured in this sandbox is not a pixel width real devices render.** This
sandbox has no outbound network access, so the sheet's Google Fonts (`Shippori Mincho`,
`Noto Sans JP`) never load here — confirmed via `document.fonts`, whose font set is empty.
`document.fonts.check(...)` still returns `true` in that state; it reports whether the browser
considers the font *usable*, including a silent fallback substitution, not whether the real
font loaded. Phase 4.5.4 shipped a `max-width:200px` fix calculated from a word measured at
137px in this sandbox, verified zero splits headlessly, and still split on the real device —
because 137px was the fallback serif's width, not Shippori Mincho's. The fix that actually held
was architectural (give the element the full width its layout already had available) rather
than a number calculated from any font metric taken here. When a real device is reported to
still exhibit a geometry bug a headless-verified fix claimed to close, check `document.fonts`
before trusting another pixel measurement — and where possible, design the fix so it does not
need to know a word's exact rendered width at all.

## This project is worked on from two places

The repository is cloned on a Windows desktop and also opened in cloud sessions
driven from an iPhone. Only one of those can see the local machine, so:

- **Pull before starting.** `git pull` first, every session, wherever you are.
- **Commit and push before finishing.** Work left uncommitted in a cloud session
  is stranded — the desktop cannot reach it. A finished layer means: the folder
  built, its `ROLLBACK.md` written, committed, pushed.
- **One commit per layer.** Message names the Part and Feature.
- **Never force-push.** If the two sides have diverged, stop and say so.

Git is configured `core.autocrlf false` and `core.longpaths true`. Leave both
alone: line endings must round-trip byte-for-byte or the sha256 restore points
recorded in every `ROLLBACK.md` stop matching, and one file in the repository
root has a 180-character name that git refuses without long paths.

A cloud session **cannot preview the sheet.** It can build the HTML and verify
by measurement, but looking at it needs a browser on the desktop.

## Phase 12.5 handoff (28 September 2026)

Phase 12.5 Advantages & Disadvantages in Play was built on `codex/phase-12-5-adv-disadv` and
merged to `main` on 28 September after the owner reported successful testing and approved it.
Its `MODES125` registration gates Management editing while preserving contextual and resource
actions in Play. Read its README for the final browser/mutation checks and `MANUAL-TESTS.md` for
device review. Final combined run passes 2,789/2,789 (2,577 retained + 212 new); ten negative
variants match exactly; removal restores the exact `d7ba875` build. The current runner is
`Versions/PART K — Phase 12.5 Play Mode Advantages and Disadvantages/qa/current-suite-runner.js`.
The retained Techniques test has a test-only focus-readiness correction, still 16/16 on baseline
and current builds with its six negative variants unchanged. A pre-existing Dependant inline
typing bug was separately recorded in both ledgers; it is not fixed by this part.
Owner review and merge approval are complete; main now includes Phase 12.5.
Do not start Combat (12.7) or toolbar replacement (12.8) as part of this approval. Four older
kickoff-file deletions belong to the owner: preserve them locally and leave them out of this
release commit. No reliable release-attributable Codex usage percentage was available.

### Current next-session pointers — 28 September 2026

Read `CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-09-28.md` or
`GPT-SESSION-KICKOFF-NEXT-SESSION-2026-09-28.md`, not the superseded 25 September plan.
Both ledgers now record the owner's **56% Codex weekly usage used** through work so far, before
the documentation pass; this is not a measured per-phase delta or Claude allowance reading.
Suggested order: a separate Dependant typing bugfix, then Phase 12.7 Combat visibility, then
12.8 toolbar replacement. These are proposals, not authorisation to implement. Independently
reassess cost and the remaining roadmap; explain any different recommendation with evidence.

### Paragon correction verified — 7 October 2026

Minor Clan Defender now requires a Paragon with a confirmed, valid Bushido tenet
for new entry. Any of the seven tenets qualifies; merely adding the Advantage or
cancelling its configuration does not. Existing Advanced School records, earned
ranks and saved Techniques are preserved. This is a separately removable fix in
BUGFIX — Minor Clan Defender Paragon Gate. Kobune Captain and the Honor/Glory/Status behavior remain unchanged.

Full corrected suite **4,262/4,262**; actual scratch removal restores the exact previous build and all **4,230/4,230** retained checks pass. Focused checks **32/32**, dependency checks **40/40**, retained dependency checks **189/189**, five pinned mutation variants, and ownership checks pass. Removal fixtures: 20 pass, one Windows symlink skip.

The correction is verified on codex/fix-minor-defender-paragon and is not yet live.
Latest full runner: this fix's qa/current-suite-runner.js; detailed evidence is in
qa/final-verification.json and qa/regression-verification.json. The prior merged
release's live verification (194/194, 6 October) remains historical evidence for
d39348a. Owner retest and iPhone visual checks for the correction are Not run.

### 6 October 2026 — live verification and owner test feedback

Both remaining Phase 4.7 releases were merged on the owner's word on 5 October:
main d39348a, PRs #5 and #6 merged. The 6 October live check matches the exact
deployed source/PWA/assets and service-worker build 180ebc2cf0a07deb; downloaded
page checks pass 156/156 supplemental and 38/38 Basic. See the Basic release's
qa/live-verification.json. The owner's other tests work, with exceptions in the
ledger: unconfigured Paragon incorrectly qualifies Minor Clan Defender; correction
is separate branch codex/fix-minor-defender-paragon, not live yet. Kolat Assassin
and Legion of Two Thousand need clearer-test reruns (guide sections 9a/9b), not
presumed passes or code failures. Current test device was not specified.
Keep Imperial Scion Status/Rank/Points review with final Glory/Honor/Status review
(FT-09). Kobune Captain remains unchanged; review non-Mantis narrative membership
only at the end of the entire project (FT-10). FT-07 remains Phase 15 or beyond.
Account-wide usage at this feedback follow-up: 69% weekly / 69% five-hour used;
not a measured release cost. Preserve all earlier owner artifacts and rulings.

### 5 October 2026 — remaining Phase 4.7 releases

The owner authorized the supplemental catalogue and the two missing Basic Schools.
Read their README, AUDIT and ROLLBACK files. Both were verified, then merged on the owner's word on 5 October. Full checks: 4,230/4,230; both
independent removal suites pass. Latest full runner: Missing Basic Schools'
qa/current-suite-runner.js. Twenty-three Advanced records include one unavailable
Nezumi entry; the 22 human entries are playable subject to requirements. Effects
remain manual, and the Advanced-rank Path replacement remains unsupported.
Hiruma Scout and Tiger's alternate-history Yotsu Bushi are distinct Basic Schools.
Their source fragments are 209.9999991 and 209.9999992, with separately owned seams.
Scorpion Instigator's four Blackmail purchases review is explicitly deferred to
Phase 15 or beyond. Preserve every FT feedback item and the Windows-preview vs
resolved-Safari distinction. See the 6 October test report above; no iPhone pass is recorded.
Keep releases on separate branches and merge only on the owner's word. Canonical
checkout remains C:\Users\jcrow\l5r-character-sheet-creator. Never stage the four
owner deletions or seven untracked Word files.

### 4 October 2026 — Phase 4.7 Core release merged; recent branches audited

Merged on the owner's instruction by fast-forward at `71a15cb`. The audit of
the prior 96 hours found 12 local branch creations; all are included in main.
Remote refs were fetched and checked too; the only older unmerged ref is
`origin/claude/project-thread-tw7vtn` (23 September), outside the request.
Read the release's MERGE-AUDIT.md. Final evidence: 4,036/4,036 release checks;
3,840/3,840 retained checks after exact removal; 23 removal fixtures pass with
one Windows symlink skip; ownership and drift pass. MANUAL-TESTS.md now includes
worked examples. Owner reports other tests passed; FT-07 Blackmail count and
FT-08 ChatGPT preview/file-explorer Spell Slots remain open, iPhone not reported.
FT-01 to FT-08 in the ledger/roadmap are deferred review items, not permission
to implement. Safari's prior Spell Slots issue is resolved; shared cause is
unconfirmed. Four old kickoff deletions and seven Word files remain local and
must not be swept into later commits.

#### Implementation context

Branch `codex/phase-4-7-core-advanced-schools` starts from main `9c332ae`.
The owner authorized the first release: nine Core Advanced Schools. Production
is in `209.999999-feat-advanced-schools.js`; own folder
`Versions/PART I — Phase 4.7 Advanced Schools/`. Read its README and AUDIT before
continuing. Final QA is recorded there; do not infer merge or device acceptance.

Core p.245 requires three separate Advanced ranks and stops earlier basic
advancement. The picker starts at Rank 0, freezes the basic rank, then grants
Advanced Ranks 1–3 at subsequent Insight Ranks. All 27 Technique descriptions
are references; effects, including casting/slots, remain manual. Core p.151's
Bushi/Shugenja exclusion and the owner's Multiple Schools gate apply. Save
format advances through VersionManager to 5; do not bump SHEET_SCHEMA_VERSION.
Hard dependencies: Alternate Paths and Save Format. Surgical removal owns one
fragment, one manifest entry and the guarded advanced-schools-seam block.

### 3 October 2026 — owner accepts Windows verification and starts the next phase

The owner accepts the Windows functional pass as sufficient to move forward.
Keep the note that the release has not been fully tested on iPhone; the remaining
iPhone purpose is visual/layout fit and is non-blocking. Do not label iPhone
tests passed by inference. Phase 4.5.26 and its separate Rank 0 fix are accepted.
The owner authorizes moving to Phase 4.7's first release: Core's nine Advanced
Schools. Keep the Multiple Schools Advantage gate ruled on 2 October.

### 3 October 2026 (Codex) — dice entries merged and deployed

The owner approved the merge on 3 October. `main` now includes release `72523fe`
(fix `b9a03bc`). Built on
`codex/phase-4-5-26-dice-entries` from `main` at `6e6da0b`, in
`C:\Users\jcrow\l5r-character-sheet-creator`, not the OneDrive clone.
Two independently removable layers: `BUGFIX — Rank 0 Skill Rolls Explode` and
`PART I — Phase 4.5.26 Dice Rolling Entries`. New fragments are `209.999997` and
`209.999998`; guarded seam blocks, and the latter's guarded pipeline block in
`130`, are owned and removed by their respective tools. Parent dependencies are
declared in both rollback notes. The former fixes table/attack untrained dice;
the latter implements four effective-Rank-1 Advantages and Gaijin Name's Social
die limit, including rerolls. No save-schema or purchased-rank change.

Focused checks 19/19 and 110/110; 17 pinned mutation variants and four boundaries
pass. Full suite: **3,840/3,840**, no retained harness changed. Both removal
orders restore main byte for byte. The final main harness gives 22/110; the fix
with entries removed stays 19/19. Structural inventory and existing seam/registry
surfaces are unchanged. Phone/desktop preview and result screenshots inspected. The current full runner
is `Versions/PART I — Phase 4.5.26 Dice Rolling Entries/qa/current-suite-runner.js`.
Build 3,489,469 bytes, SHA-256
`7f57135bddb8c4c1bc306c8841f52ed0eb9c03292f873e7302a8b13ccda8bd49`.
Owner's test, 3 October: **Windows: Pass (owner report)**, with 15 screenshots
reviewed and no discrepancy found. The owner explicitly confirmed Windows-only
testing. See the release's `OWNER-TEST-REVIEW.md` for visible versus reported
evidence. **iPhone: Not run**; do not relabel the Windows result as iPhone-tested.

Deployed page verified: **129/129** focused checks, exact expected PWA bytes and
service-worker build `545ec25de79b1c69`. The combined iPhone checklist remains
Not run; publish it through the docs connector when available. The docs
connector is unavailable in this session; the published ledger is not refreshed.
Read that live artifact fully and preserve ticks before a later publication.

Next proposed order remains Phase 4.7's Core nine Advanced Schools, then its
other two releases together, then the audit's nine situational preview entries
after scope rulings. The latest ledger update corrects projection arithmetic;
Claude allowance estimates do not predict Codex usage. Fresh Codex build baseline:
0% weekly and 0% five-hour used. After QA: **14% weekly / 89% five-hour used**,
account-wide and before final commits/merge/device review.

### 2 October 2026 (night, final) — reassessment after 4.5.25; the next kickoff

**Proposed next: Phase 4.5.26, the dice-path entries**, first after the 7 October reset (5–7%):

- the Rank 0 exploding-10s bug, as its own BUGFIX layer, on the owner's word;
- Crab Hands, Crafty, Sage and Sensation's Rank 1 lift;
- Gaijin Name's explode-once rule.

All three share one dice code path. Then Phase 4.7's Core 9 Advanced Schools; then the audit by mechanism,
after the owner's scope ruling. The next session starts from `Versions/CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-07.md`. Nothing is approved.

### 2 October 2026 (night, last) — 4.5.25 confirmed; the project's projected length

Phase 4.5.25 is confirmed on the iPhone and merged (`main`). The week reads **94%** (resets 7 October).
**The ledger's current update holds a re-derived projection: about three more weeks of allowance from the
7 October reset, around the week of 28 October, range 21 October to early November.** It is an estimate,
not a fact. Use its table to size releases, and re-derive it rather than quote it. Next: 4.5.26, untrained
Skills, first after the reset.

### 2 October 2026 (night, latest) — Phase 4.5.25 Clan and School Prices, built on a branch

Branch `claude/phase-4-5-25-clan-prices` (cut from the docs-only audit branch), **not merged**. One fragment,
`209.999996-feat-adv-clan-prices.js` (`PART I FEATURE 4.5.25`, `CP4525`, `ADV_CLAN_PRICES_ENABLED`), and
the `clan-prices-seam` block. **The current full runner is its `qa/current-suite-runner.js`** (3,711/3,711).

- **A Management visit is the purchase** (owner's ruling): rows are provisional in Management and fixed by
  `MODES12.set('play')` or `CW112.finish()`. Each priced row saves a `clanPrice` record.
- **⚠️ A new Advantage entry with a Clan or School price** goes in `CP4525`'s `ROWS`, unless it has a picker.
  A picker entry prices itself, and the step must not fight it.
- **Usage can be read directly** with the session tool `get_usage`. No reading is needed from the owner.

### 2 October 2026 (night, later) — reassessment after the audit; the next kickoff

Usage was 86% after the audit (+6). **Proposed next: Phase 4.5.25, Clan and School prices.**

- It prices 39 entries in the sheet.
- It copies Heart of Vengeance's price-on-refresh: it rebinds `refreshAdvConfigControl`, which
  `refreshAllAdvConfigControls()` runs for every row from `recalcAll()`.

After that:

1. 4.5.26, untrained Skills (the Rank 1 lift, plus the parked Rank 0 bug on the owner's word);
2. Phase 4.7's Core 9, after the 7 October reset.

The evidence is in the roadmap's last amendment and in the ledger's current update. The next session
starts from `Versions/CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-03.md`. Nothing is approved.

### 2 October 2026 (night) — the Advantages and Disadvantages audit

Docs only, on branch `claude/adv-disadv-audit` (not merged): `Versions/PART I — Phase 4.5 Sourcebook Audit of Advantages and Disadvantages/AUDIT.md`, also
published as the doc "Advantages and Disadvantages — Sourcebook Audit" (https://claude.ai/code/artifact/485b7ec0-c6cd-4c63-b9e6-3e5c4ecf74a6).
**Read it before building any Advantage or Disadvantage work:** it lists the 65 missing entries by book,
which need pickers, and which existing mechanism each could reuse. Usage was 80% before it.

### 2 October 2026 (evening) — Phase 6's first release and the Technique name fix CONFIRMED (13/13)

The owner's iPhone check passed 13/13 (the checklist doc records Pass for Tests A to D; E to G passed on the owner's
word and in the live-site walk). Usage 80% (week resets 7 October). **Proposed next, awaiting approval:** Phase 4.7
Advanced Schools, the Core Rulebook's 9 first, with the Multiple Schools Advantage REQUIRED (owner's ruling); or the
Advantages and Disadvantages audit alone, as a cheaper way to spend the rest of the week. The current full runner is
Phase 6's `qa/current-suite-runner.js` (3,666 checks).

### 2 October 2026 (later) — Phase 6's first release and BUGFIX — Technique Name Clashes, built on a branch

**Approved by the owner:** "the Technique text release with the Toku fix". **Rulings this session:**

1. Saved characters' Technique rows still holding text the sheet wrote, now known to be wrong or
   missing, are rewritten on load; an edited row is never touched.
2. The Doji Courtier clash is fixed in the same release.
3. **Phase 4.7: an Advanced School REQUIRES the Multiple Schools Advantage** (the roadmap's scope,
   not Core p. 245).

**Branch `claude/phase-6-technique-text`, MERGED to `main` on the owner's word (2 October), before the
iPhone check (Phase 6's MANUAL-TESTS.md, Tests A to G). Two layers, one commit each:

- `Versions/BUGFIX — Technique Name Clashes/`
- `Versions/Part G — Combat & Roll Engine/PART G — Phase 6 School Technique Text/`

Read both READMEs. **The current full runner is Phase 6's `qa/current-suite-runner.js`**: 3,666
checks, which chains the fix's, which chains Phase 4.6's.

- **Removal:** removing Phase 6 alone gives `b17b8584…`; removing both gives `aa5c55d9…`, byte for
  byte.
- **Variants:** the fix's 10 variants and Phase 6's 8 each turn their harness red exactly where pinned (discovery, then a pinned run), and each layer's two boundary builds (Phase 12's modes off, Phase 4.6 off) read fully green.
- **⚠️ Technique text is saved in each Technique row.** A later change to a Technique's text needs
  the fix's row rewrite to reach saved characters: add the old text to `TECHNAMES.STALE`, or rely on
  the "not yet available" notice being stale for every row.
- **⚠️ A new School or Path Technique** must not take a School Technique's name. The fix's load check
  says so in the console.
- **⚠️ Sourcebook text for the own-words check** is extracted only to a scratch folder (see
  `qa/own-words-check.py`).

### 2 October 2026 — Phase 4.6 CONFIRMED (13/13) and complete; the next phase reassessed

The owner's check of the third release passed 13/13 (Android checks not run): Phase 4.6 is complete
for the owner's books (19/19, 21/21, 13/13). **Proposed next, awaiting approval:** Phase 6's first
release, the missing School Technique text (72 Techniques, all 20 Minor Clan and Mantis Schools, every
one found in the books), with
the Toku Bushi fix folded in; then Phase 4.7 (the Core Rulebook's 9 Advanced Schools) after the
Multiple Schools ruling; then the full sourcebook audit of Advantages and Disadvantages. See the
roadmap's "Reassessment after Phase 4.6 — 2 October 2026". **Handoff:**
`CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-02.md`. Usage 66% (week resets 7 October). The current full
runner is Phase 4.6's `qa/current-suite-runner.js` (3,619 checks).

### 1 October 2026 (late night) — Phase 4.6's third release merged, and the audit

`claude/phase-4-6-alternate-paths-r3`, **merged on the owner's word** before the iPhone check
(MANUAL-TESTS.md Tests F to K; the checklist doc is linked in the ledger), `main` at `7c01d0c`;
the checklist was walked headlessly on the live site after the merge: all 13 checks hold. The
audit is also published as a doc, "Phase 4.6 Alternate Paths Audit". The other books' 175 Paths and `AUDIT.md` (every Path in the
owner's 16 books is in; thirteen come from books the owner lacks). Same fragment and folder as the
first two releases. On that branch the full runner is still Phase 4.6's `qa/current-suite-runner.js`,
now 3,619 checks (175 its own); `qa/verify-variants.py --jobs 2` runs its 44 variants two at a time.
Usage 51% at the start, 60% before the docs and ledgers.

### 1 October 2026 (night, later) — Phase 4.6's second release merged and CONFIRMED (21/21)

All 27 Core Paths confirmed on the iPhone. **Proposed next, awaiting approval:** Phase 4.7 Advanced
Schools (Core first), after the owner's ruling on the Multiple Schools gate; or 4.6's other books.
Usage 51%. The current full runner is Phase 4.6's `qa/current-suite-runner.js` (3,568 checks).

#### Second release, as built

`claude/phase-4-6-alternate-paths-r2`, **merged on the owner's word** before the iPhone check
(MANUAL-TESTS.md Tests A to E; usage 50% at the merge). Same fragment and folder as the first release. On that branch the
full runner is still Phase 4.6's `qa/current-suite-runner.js`, now 3,568 checks (124 its own). Usage
was 45% at the start.

### 1 October 2026 (night) — Phase 4.6's first release merged and CONFIRMED on the iPhone (19/19)

The owner's check passed 19/19 (Android checks not run). **Proposed next, awaiting approval:** Phase
4.6's second release (the other 9 Core Paths; several Paths in one School).


`Versions/PART I — Phase 4.6 Alternate Paths/` (the Core Rulebook's 18 Great Clan Paths and the engine
work: read its README) was built on branch `claude/phase-4-6-alternate-paths` and **merged to `main` on
the owner's word (`317ebca`), before the iPhone check** (the "Phase 4.6 iPhone Checklist" doc, linked
from the ledger; it also holds the seven Phase 0.7 Android checks). **The current full runner is its
`qa/current-suite-runner.js`** (3,524 checks), which chains Ancestor Corrections'. ⚠️ Saves are now
format 4 (Phase 4.6's step); a later format change registers its step after it. Open: the owner's word
on which Honor field a Path's Honor requirement reads (built: Rank). Next for 4.6: the second release
(the other 9 Core Paths; several Paths in one School). Usage was 43% at the merge.

### 1 October 2026 (laptop) — assessment, and BUGFIX — Multiple Schools Keep Earlier Techniques

The session after the cloud handoff below, on the laptop. **The owner approved a bugfix, then Phase
4.6's first release: the Core Rulebook's 18 Great Clan paths (pp. 251–255) with the engine work they
need** (the other 9 Core paths, and several Paths per character, in a second release). The
assessment and its findings are in the ledger's 1 October laptop update and the roadmap's last
amendment; read them before 4.6. **One ruling is open before 4.6 starts:** the monk Kiho rule of
Core p. 246.

**Later the same day:** the owner worked through the combined iPhone checklist (47 of 52 passed:
Phase 7 and the Multiple Schools fix confirmed; Phase 4.8 35/38; the Manage fix does its job, its slow
first tap is for Phase 15) and ruled: the monk Kiho rule of Core p. 246 **is applied in 4.6's first
release**; the configuration windows' gold i and the first Manage tap wait for Phase 15. The
corrections are `Versions/BUGFIX — Ancestor Corrections (Void Offer, Info Button, Clan Picker)/`, on
branch `claude/bugfix-ancestor-corrections`, **merged to `main` on the owner's word (`5cd7117`), before
the iPhone re-test** (the "Re-test Checklist" doc, linked from the ledger). **The current full runner
is its `qa/current-suite-runner.js`** (3,444 checks), which chains the Multiple Schools fix's. **Phase
4.6 branches from `main`** and chains its runner from that fix's. Usage was 35% at that point.

`Versions/BUGFIX — Multiple Schools Keep Earlier Techniques/` is built on branch
`claude/bugfix-multiple-schools-techniques` and **merged to `main` on the owner's word on 1 October
(`c7731cb`), before the iPhone check**. The four owed iPhone checks (Phase 7, Phase 4.8, the Manage
fix, this fix) are combined in one doc, linked from the ledger's open reminders.
On that branch the full runner is its `qa/current-suite-runner.js` (3,416 checks: 3,384 retained + 32), which
chains the Manage fix's. **Phase 4.6 branches from `main`** and chains its runner from the fix's.

**From a laptop session the sourcebooks need no photographs:** `pdftotext -layout -f <pdf page> -l
<pdf page>` into the session's scratch folder, never into the repository (the 30 September ruling).

### 1 October 2026 — reassessment after Phase 4.8; next-session handoff

**Start here:** `CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-01.md`. It supersedes the 30 and 28
September kickoffs (and the 28 September pointers above) for planning; it does not override the
owner's rulings. **`main` is the merge of Phase 4.8 and BUGFIX — Manage Button Clipping**
(Phase 0 build `f4345b4a…`, 3,256,563 bytes); the current full runner is that fix's
`qa/current-suite-runner.js` (3,384 checks). **Proposed next build phase (a proposal, not
approval): Phase 4.6 Alternate Paths, with the Core Rulebook's 27 paths first** — the path engine
already takes any School (checked in the source 1 October), so it is content and tests; Phase 4.7's
Core Advanced Schools follow from the same photographs (Core pp. 245–257). The owner reported
**22% weekly usage** on 1 October; the ledger notes why that reading cannot be compared with the
22% recorded after Phase 7. Device checks still owed: Phase 7, Phase 4.8 and the Manage fix on the
iPhone; Phase 0.7 on an Android device. `BUILD-LEDGER.html` and its published artifact were
brought up to date the same day.

### 30 September 2026 (night) — Phase 4.8 Ancestors built on a branch

`claude/phase-4-8-ancestors`: `Versions/PART I — Phase 4.8 Ancestors/`. Built from a cloud session
on the owner's phone from photographs of Core pp. 241-244. **Merged to `main` on the owner's word
on 1 October, before the iPhone check, which is still owed.** Before the fix below, **the full runner was that folder's
`qa/current-suite-runner.js`** (3,160 checks). Phase 7, the sourcebook index and its wiki links
were merged to `main` earlier the same evening. The cloud container needs `LANG=C.UTF-8` for the
full suite: without a UTF-8 locale Chromium saves "Sairyū.l5r.json" as "download" and three Phase 7
checks fail (the sheet is not at fault). **Ruling, 30 September: the owner's fan-wiki pages
(Magical Samurai, Last Haiku) are supplementary only; the books stay primary** (see the index's
README). The next Ancestors are in The Great Clans and Secrets of the Empire (see the index).

**Later the same night, on the same branch:** Phase 4.8's second release (The Great Clans and
Secrets of the Empire, from the owner's photographs, and the owner's Kakita feedback applied to every
Ancestor; see its README and AUDIT.md), then `Versions/BUGFIX — Manage Button Clipping/` as its own
layer and commit (1 October), all merged the same day. **The current full runner is that fix's
`qa/current-suite-runner.js`** (3,384 checks: 2,999 retained, Phase 4.8's 349, the fix's 36), which chains Phase 4.8's. The owner
DEFERRED the rest of that feedback:
point 2 (the Clan & School page may be cluttered) to Phase 15, point 9 (a lost-favour Ancestor
editable in Management) to the end of the project; both are open reminders in the ledger. The wiki
cross-check stays blocked until the owner allows the two wiki hosts in the environment's network
settings.

### 30 September 2026 (later) — rulings, the sourcebook index, and Phase 7's first release

**Rulings (owner, 30 September):**
- **Sourcebook content is written in our own words with page references, never verbatim.** It
  goes in the app, the repository and GitHub the same way.
- Extract PDF text only to a scratch folder; never save or commit it.
- Import converts older saves; no bulk rewrite of stored saves; the audit log is later.

**On branches, awaiting the owner's word to merge:**
- `claude/sourcebook-index-2026-09-30`: `Versions/SOURCEBOOK INDEX — Page Map/`.
- `claude/phase-7-save-format`: `Versions/Part J — Data Integrity & Validation/PART J — Phase 7
  Save Format and Migration/`.

**Once Phase 7 merges, the current full runner is that folder's `qa/current-suite-runner.js`**
(2,999 checks). **Do not raise `SHEET_SCHEMA_VERSION`**: register a step with
`VersionManager.register()` instead. Phase 7 sits one wrapper deeper than the Part K phases, so its
qa scripts find `Versions/` by walking up to the ledger rather than by counting parents.

**Next agreed:** Phase 4.8 Ancestors (Core pp. 241–244 first; see the index).

### 30 September 2026 — Phase 12.8 confirmed and merged; Phase 12 complete

`PART K — Phase 12.8 Play Mode Toolbar` was confirmed on the owner's iPhone and merged to `main`.
**The current full runner is `Versions/PART K — Phase 12.8 Play Mode Toolbar/qa/current-suite-runner.js`**
(2,954 checks). Phase 12 is complete. **A second owner idea is parked for review after completion:**
Print on the Characters list's per-character menu (roadmap, *Deferred and declined*); review it with
Phase 11.1. The next-session handoff is `CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-09-30.md` (revised proposal: sourcebook index, Phase 7 first release, then 4.8, 4.6/4.7, 6; the session must assess independently). What comes next needs the owner's choice; the 28 September reassessment suggested
comparing Phase 11.1 (PDF) with Phase 7 (persistence and migration).

### 30 September 2026 — Phase 12.7 confirmed and merged; 12.8 started

`PART K — Phase 12.7 Play Mode Combat` was confirmed on the owner's iPhone and merged to `main`.
**The current full runner is `Versions/PART K — Phase 12.7 Play Mode Combat/qa/current-suite-runner.js`**
(2,917 checks). The owner then asked for Phase 12.8 (toolbar replacement) to start.

**Parked owner idea — do not build without a new instruction:** the owner pictured **Manage** opening
a separate screen, like the creation wizard, rather than fields switching in place. It is recorded
for review after the app is complete (roadmap, *Deferred and declined*, "REVIEW LATER — Manage as a
separate screen"). Later phases should not quietly make that redesign harder.

### 30 September 2026 — Dependant typing bugfix confirmed and merged

`BUGFIX — Dependant Inline Typing` was built on `codex/dependant-typing`, confirmed on the owner's
iPhone and merged to `main` on 30 September; read its README. **The current full runner is now
`Versions/BUGFIX — Dependant Inline Typing/qa/current-suite-runner.js`** (2,862 checks), which
chains Phase 12.5's. Phase 12.7 is the next proposed roadmap phase and still needs its own approval.

A laptop crash on 28 September corrupted a local Git object and some files on disk; see the
ledger's 30 September entry. The crash also damaged four of the desktop Python 3.14's `.pyc` cache files ("bad marshal data"
on `import argparse`); they were deleted on 30 September with the owner's approval and a rescan
found none left. If that error ever reappears, delete the named `.pyc` (Python regenerates it) or
run with `PYTHONPYCACHEPREFIX` set to a scratch folder. The Codex runtime Python path recorded in
the 28 September kickoff did not start in a Claude session.
