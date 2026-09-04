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

There are now **two trunks**, and which one you are working from is the first thing to
establish. A trunk holds the sheet's own `<script>` — all the game logic. A layer holds only
presentation and is generated from a trunk by a splice.

```
PART C — Feature 8 Mirumoto Rank 1      trunk (pre-monk) — READ ONLY  bfbbd19197c9fd81
PART D — Feature 1 swipe                  layer on Part C   swipe-tab carousel  c5462a7a70224388
PART D — Feature 1.1 …                    layer on Part C   mobile optimisation  5b19394c1c5595cf
PART D — Feature 2 Circular Ring Layout    layer on Part C   circular rings      d393123f242db61b
PART D — Feature 2.1 …                    layer on Part C   order, fit, harness c0d9d4ad7766f1e4
PART D — Feature 3 Gold d10 Roll Buttons   layer on Part C   gold d10 buttons    8e646d7651322670
PART D — Feature 3.1 Larger Roll Button d10 layer on Part C  34px die            cae6e9f0328508da

PART E — Feature 1 Monks & Kiho         trunk (CURRENT) — edit logic here  d62c51f17942adb4
PART E — Feature 1.1 … (Part D UI)     layer on Part E — THE DELIVERABLE   48027ff7170af3ed
```

**Open `PART E — Feature 1.1`.** It is the Part E trunk with the whole Part D UI spliced on:
carousel, mobile optimisation, circular rings, gold d10. **Edit logic in the Part E trunk**,
edit presentation in the 1.1 folder's sidecars, and never edit a generated deliverable — the
next splice overwrites it.

The Part C trunk and its six Part D layers are kept as the pre-monk line. They still build and
still pass; they are simply no longer the head. Part E 1.1 carries its own copies of every
sidecar, so nothing in Part D is needed to build it and nothing in Part D is affected by it.

Every layer reads its trunk directly and writes only to itself. None depends on another.

## Building

From inside any layer folder — the six Part D ones, or `PART E — Feature 1.1`:

```bash
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
