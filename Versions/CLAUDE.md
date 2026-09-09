# L5R Character Sheet — project instructions

A single self-contained HTML character sheet for Legend of the Five Rings 4th
Edition. No build system, no dependencies: each version is one HTML file with all
CSS, JavaScript and artwork inlined, opened directly in a browser.

The roadmap at `Versions/L5R Character Sheet Phased Roadmap reorder.md` is the
single source of truth for planned work. Everything under `Versions/Old roadmaps/`
is superseded — historical record only, not a reference for current planning.

---

## Folder convention — follow this exactly

Every feature or substantial change gets **its own clearly labelled folder**, and
**every new file it produces goes inside that folder**. Never add files alongside
an existing version's trunk, even when that trunk is what is being modified.

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

There are now **two trunks**, and which one you are working from is the first thing to
establish. A trunk holds the sheet's own `<script>` — all the game logic. A layer holds only
presentation and is generated from a trunk by a splice.

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
│   ├── PART E — Feature 1 Monks & Kiho/          trunk (CURRENT) — edit logic here
│   └── PART E — Feature 1.1 Monks & Kiho (Part D UI)/   layer on Part E — THE DELIVERABLE
│
├── BUGFIX — School Skill Free Rank on Reload/            (bugfix, not a Part; stays flat)
├── 00 Build History/                                     (pre-Part archive; stays flat)
├── Old roadmaps/                                         superseded roadmap docs
├── L5R Character Sheet Phased Roadmap reorder.md         current roadmap — single source of truth
└── CLAUDE.md                                             this file
```

**Open `Part E — Monks/PART E — Feature 1.1 Monks & Kiho (Part D UI)`.** It is the Part E trunk with the whole Part D UI spliced on:
carousel, mobile optimisation, circular rings, gold d10. **Edit logic in the Part E trunk**
(`Part E — Monks/PART E — Feature 1 Monks & Kiho`), edit presentation in the 1.1 folder's
sidecars, and never edit a generated deliverable — the next splice overwrites it.

The Part C trunk (`Part C — Advanced combat engine/PART C — Feature 8 Mirumoto Rank 1`) and
its six Part D layers are kept as the pre-monk line. They still build and still pass; they are
simply no longer the head. Part E 1.1 carries its own copies of every sidecar, so nothing in
Part D is needed to build it and nothing in Part D is affected by it.

Every layer reads its trunk directly and writes only to itself. None depends on another.

## Other repository content

- **`L5R 4th edition books/`** (repo root, sibling to `Versions/`, `Art/`, `Characters/`) —
  the user's own legally-owned sourcebook PDFs. This is source material staged ahead of the
  roadmap's Phase 13 (Library / Sourcebook Viewer); it is not itself part of the
  `Versions/` folder convention above, and Phase 13's own storage design (client-side,
  IndexedDB, separate from character-save data) governs how these files get consumed once
  that phase is built — this top-level folder is just where they currently live.

## Building

From inside any feature folder — the six Part D ones, or `PART E — Feature 1.1` —
navigating in through its theme wrapper:

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
- all 209 original element IDs preserved — none removed, none duplicated
- 10 sections and 16 `.roll-modal-overlay` blocks present
- HTML tag balance clean
- the trunk file is never modified

The carousel exposes a test seam at `window.__L5R_CAROUSEL__`
(see `CAROUSEL-TEST-API.md`). Paste `l5r-carousel-test-harness.js` into the browser
console with the sheet open for a full regression run.

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
