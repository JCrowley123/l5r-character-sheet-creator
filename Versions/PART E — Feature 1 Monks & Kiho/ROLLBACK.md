# PART E — Feature 1 · Monks & Kiho

Part E is the **monk and Kiho** line of work: Brotherhood of Shinsei Schools, the
Kiho subsystem, monk-specific character creation, and monk Alternate Paths. It is a
new Part because none of the existing three fit — Part B is weapons, Part C is the
combat engine, Part D is UI and presentation.

**This folder is a new trunk, not a Part D layer.** That distinction is the whole
reason it exists, so it is worth stating plainly before anything else.

---

## Why this forks the trunk instead of continuing from Part D

Every Part D folder is a *presentation layer*: `splice_swipe_tabs.py` reads the
Part C trunk, injects sidecar CSS/JS, and writes a deliverable beside itself. One of
that model's stated invariants is that **the sheet's own `<script>` stays
byte-identical to the trunk**. Part D changes markup and styling; it never changes
the sheet's logic.

Monks and Kiho are nothing *but* logic. In the trunk the sheet's script runs lines
2086–10443, and this feature's work lands squarely inside it — beside `KATA_LIBRARY`
(2712), `SPELL_LIBRARY` (2731), `SCHOOL_LIBRARY` (3383), `cfs_applySchool` and
`characterCasterLock` (4023+).

So editing the Part D 3.1 deliverable would have been the wrong move twice over:
it breaks the byte-identical invariant, and the next `python splice_swipe_tabs.py`
in any Part D folder regenerates from the trunk and silently produces a build with
no monks in it. The work would sit in a generated artefact that its own generator
overwrites.

Forking the trunk instead means the monk feature lands where the layer model already
expects logic to live, and any Part D layer later re-pointed at this trunk picks the
feature up for free.

## What this folder is built from

| | |
|---|---|
| Source | `PART C — Feature 8 Mirumoto Rank 1/l5r-character-sheet part C feature 8 mirumoto.html` |
| This file | `l5r-character-sheet part E feature 1 MONKS.html` |
| Relationship at the zero point | **byte-identical** — `sha256 bfbbd19197c9fd81…` on both |

No sibling assets were copied. The trunk HTML is fully self-contained — all CSS,
JavaScript and artwork inlined — so unlike a Part D layer there are no build inputs
to carry. The Part C folder's regression harnesses (`l5r-P1-P2-F*-test-harness.js`
and friends) are still read from where they are rather than duplicated here.

## Relationship to the Part D layers

**Part D is untouched by this work and keeps building from the Part C trunk.** All
six layers still splice against `bfbbd19197c9fd81` and still produce exactly the
files they produced before Part E existed. Nothing here can break them.

The consequence, stated so it is not discovered by surprise: the deliverable in
*this* folder has no swipe carousel, no circular Ring layout and no gold d10 roll
buttons. Those are Part D layers, and they are not in the trunk. Monk work is
therefore tested on the plain sheet.

Re-pointing the Part D layers at this trunk is deliberate follow-up work, not part
of this feature. It is not just a path change: the splices are anchor-asserted
against hardcoded line numbers (1346, 1742, 2083, 2084) and `#techQuickAdd`'s markup
sits at line 1614, inside that anchored region — so every phase here that inserts
markup shifts them. They will fail loudly rather than build something wrong, which is
the behaviour that makes deferring this safe.

## Rollback

A full revert is cheap and stays cheap: **delete this folder** and `git revert` the
Part E commit range. The Part C trunk is untouched on disk throughout, and Part D
never depended on Part E, so deleting this folder returns the repository to exactly
the state described by `PART D — Feature 3.1 Larger Roll Button d10`.

Per-phase rollback is not equally cheap, and the difference is worth knowing in
advance. This table is filled in as each phase lands.

| Phase | Landed | What it touched that predates this feature |
|---|---|---|
| 0 · zero point | yes | nothing — an unmodified copy |
| 1 · `KIHO_LIBRARY` + quick-add | yes | `techQuickAddOptionsHTML()` (new Kiho block + placeholder string), `buildTechQuickAdd()` (new `kiho` branch), `collectData()` (stamps `schemaVersion`), `applyData()` (refuse-newer guard, now returns `false` on refusal), `loadCharacter()` and the file-import handler (check that return), the `#techQuickAdd` markup line, a new `.hint` in the Techniques section, a comment block above `SCHOOL_LIBRARY`, and additions to `window.__L5R_TEST__`. Everything else is purely additive. |
| 2 · Brotherhood Schools | — | |
| 3 · creation deltas | — | |
| 4 · Kiho grants and cap | — | |
| 5 · Elemental books | — | |
| 6 · Alternate Paths | — | |
| 7 · later books | — | |
| 8 · era-variant review | — | |
| 9 · verification | — | |

## Restore points

| Layer | Folder | sha256 |
|---|---|---|
| Trunk, no carousel | `PART C — Feature 8 Mirumoto Rank 1` | `bfbbd19197c9fd81` |
| **This — Part E zero point** | `PART E — Feature 1 Monks & Kiho` | `bfbbd19197c9fd81` |

Identical hashes at the zero point are the point: nothing has been changed yet.

## Superseded — do not follow

`Versions/Monks.txt` is an earlier design sketch for this same feature and it is
**wrong**. It proposes Kiho slots with per-Element counts and daily refresh, a
preparation step borrowed from spell slots, a separate "Monk" role type, a blanket
"Monks cannot cast spells" rule, and an activation TN derived from Mastery Level.
L5R 4e has none of those: Core Rulebook p.261 (*Utilizing Kiho*) gives the complete
activation rules and there is no slot mechanic anywhere in them. It is kept only as
a record of a rejected approach.

## Verified at the zero point

- The copy is byte-identical to the trunk (`sha256` matches, both `bfbbd19197c9fd81…`).
- The Part C trunk still hashes `bfbbd19197c9fd81…` — read, not written.
- The repository is in sync with `origin/main`; nothing was stranded.

### Not verified here

- The copied sheet has not been opened in a browser. It is byte-identical to a file
  that was working, which is a strong argument but not the same as looking at it.
