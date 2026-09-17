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
│   └── PART G — Phase 4 Explain This Roll/
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
│                                             resolved manifest paths; the other ten are UNFIXED --
│                                             never pass a live tree to one "to watch it refuse".
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
│                                             45/45 own, 947/947 combined, 902/902 removed,
│                                             byte-identical removal on the first attempt, 16/16
│                                             removal fixtures. Not real-device confirmed
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

- **`L5R 4th edition books/`** (repo root, sibling to `Versions/`, `Art/`, `Characters/`) —
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
