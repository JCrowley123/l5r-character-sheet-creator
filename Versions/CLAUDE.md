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

> **The one standing exception: `build.py` at the repo root.** Phase 0.5 put it
> there because a CI build command is typed into a web form, and pointing that
> form at a path containing spaces and em-dashes is a failure waiting to happen.
> It holds no logic — it locates and delegates to
> `PART F — Phase 0.5 …/deploy/deploy_build.py`, and its header says so. Rolling
> back Phase 0.5 means deleting both. Do not add a second root-level file on this
> precedent without raising it first; the exception is the thin entry point, not
> a general licence.

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
│   └── PART F — Phase 0.5 Hosting & Deployment Pipeline/
│                                                 deploy: Cloudflare Pages builds from Phase 0
│
├── BUGFIX — School Skill Free Rank on Reload/            (bugfix, not a Part; stays flat)
├── 00 Build History/                                     (pre-Part archive; stays flat)
├── Old roadmaps/                                         superseded roadmap docs
├── L5R Character Sheet Phased Roadmap reorder.md         current roadmap — single source of truth
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

### Deploying (Part F, Phase 0.5)

```bash
python3 build.py                # build the site into dist/ — what Cloudflare Pages runs
python3 build.py --check-drift  # does the committed build still match its sources?
```

`build.py` calls Phase 0's `recombine.py` and copies the result to
`dist/index.html`, refusing to publish if the copy does not hash identically. It
owns no assembly logic of its own — one build, not two to keep in step.

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

- `window.__L5R_TEST__` — the sheet's own surface, 277 keys. Its definition is at the end of
  `src/sheet/210-test-seam-and-init.js`.
- `window.__L5R_CAROUSEL__` — the carousel's, 10 methods (see `CAROUSEL-TEST-API.md`). Paste
  `l5r-carousel-test-harness.js` into the browser console with the sheet open for a full
  regression run, or drive both seams headlessly with `qa/behaviour-harness.js`.

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
