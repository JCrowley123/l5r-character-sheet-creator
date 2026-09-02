# L5R Character Sheet — project instructions

A single self-contained HTML character sheet for Legend of the Five Rings 4th
Edition. No build system, no dependencies: each version is one HTML file with all
CSS, JavaScript and artwork inlined, opened directly in a browser.

---

## Folder convention — follow this exactly

Every feature or substantial change gets **its own clearly labelled folder** under
`Versions/`, and **every new file it produces goes inside that folder**. Never add
files alongside an existing version's trunk, even when that trunk is what is being
modified.

Names follow `PART <letter> — Feature <n[.n]> <Description>`. The Part letter is a
**thematic** grouping, not chronological:

- **Part B** — core weapons system
- **Part C** — combat engine (ranges, stances, wounds, Void, ammo, dual-wielding, schools)
- **Part D** — UI and presentation

When work moves into a genuinely new theme it gets a new Part letter and feature
numbering restarts. An increment to existing work gets a point release
(`Feature 1` → `Feature 1.1`) in its **own new folder** — never by editing the
previous stage's folder. Ask which Part something belongs to if it is not obvious.

If a task prompt prescribes a folder name that clashes with this convention, raise
it rather than following it silently.

## Rollback is a requirement, not a nicety

Each layer must be removable by **deleting its folder**. That means:

- the previous layer's folder is left exactly as found
- build scripts reference the untouched trunk by **relative path**, never copying
  or mutating it
- every new folder ships a `ROLLBACK.md` explaining how to revert
- each layer carries its own copies of build inputs, so layers stay independent

## Current structure

```
PART C — Feature 8 Mirumoto Rank 1      the trunk — READ ONLY   bfbbd19197c9fd81
PART D — Feature 1 swipe                swipe-tab carousel      c5462a7a70224388
PART D — Feature 1.1 …                  mobile optimisation     5b19394c1c5595cf
PART D — Feature 2 Circular Ring Layout circular rings (current) d393123f242db61b
```

Every Part D layer reads the trunk directly and writes only to itself. None depends
on another.

## Building

From inside any Part D folder:

```bash
python splice_swipe_tabs.py
```

It reads the trunk, injects the sidecar CSS/JS, and writes the deliverable beside
itself. It is anchor-asserted — it fails loudly rather than producing a wrong file
if the trunk shifts. Runnable from any working directory.

**Edit the sidecars (`carousel.css`, `carousel-mobile.css`, `rings-circular.css`,
`carousel.js`), never the generated HTML.** If you rename an output file, update
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
