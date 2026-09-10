# Desktop handoff — Phase 9's second bullet, School-specific flavour text

Phase 9 has two bullets. The first, Clan-themed UI skins, is **built, verified and shipped** —
see this folder's `README.md`. The second, **School-specific flavour text, is not built**, and
was deliberately parked for a desktop session rather than attempted in the cloud. This note
exists so that session can start cold without re-deriving any of it.

## Why it was parked, not skipped

The flavour text has to come from the sourcebooks, and **the sourcebooks are not reachable from
a cloud session.** `L5R 4th edition books/` is gitignored on purpose — `.gitignore`'s own comment
gives the reason: several of the PDFs exceed GitHub's 100MB hard push limit, the full set is well
past the free Git LFS quota, and Phase 13 will load them client-side from IndexedDB rather than
from git, so tracking them was never architecturally necessary. They live on the Windows desktop
clone (OneDrive-backed) and nowhere else.

The roadmap's Process Requirement #3 covers exactly this: *"Source-dependent phases wait for
source material… If that material hasn't been supplied yet, say so and stop — do not invent rules
content to fill the gap."* Generating 80-odd schools' worth of setting text from a model's own
recollection of a licensed property would be fabrication that reads as plausible and would be
very hard to catch as wrong later. Don't do it on the desktop either — read it from the books.

## The scope, as measured (not estimated)

Counted directly from `src/sheet/060-lib-schools.js` and `070-schools-paths-techniques.js` on the
current build:

| Library | Entries |
|---|---|
| `SCHOOL_LIBRARY` (the seven Great Clans, Spider, Imperial, Ronin) | **61** |
| `MINOR_CLAN_SCHOOL_LIBRARY` | **22** |
| `BROTHERHOOD_SCHOOL_LIBRARY` | a separate array, count it before scoping |
| `ALTERNATE_PATH_LIBRARY` (`070-schools-paths-techniques.js`) | **12** |

**No school entry carries any description, flavour, blurb or desc field today.** A school entry
is currently exactly this shape:

```js
{name:'Hida Bushi', benefit:'Stamina', skills:'Athletics, Defense, …', honor:3.5,
 outfit:'Light or Heavy Armor, …', tech:['The Way of the Crab', …]}
```

plus optional shugenja fields (`shugenja`, `affinity`, `deficiency`) and the Kiho-related flags
documented in that file's own header comment. So this bullet is a **new field plus somewhere to
render it**, not a change to any existing one.

## Decisions still open — settle these before writing code

None of these were decided, and the roadmap's own Engineering Scope for this bullet is one line
("Add flavour text to school definitions"), so it does not settle them either:

1. **Which entries are in scope.** All 61 major-clan schools only? Plus the 22 minor-clan ones?
   Brotherhood? Alternate Paths? Flavour text for 95+ entries is a lot of transcription — a first
   pass covering the Great Clan schools is a reasonable place to stop and review.
2. **How long each entry runs.** One evocative sentence reads very differently from a full
   paragraph, and it changes where it can sit in the UI.
3. **Where it renders.** The Clan & School tab is the obvious home, near the applied School. It
   is also the tab that already carries Phase 9's mon watermark, so check the two together rather
   than in isolation. An on-demand disclosure (the `<details>` pattern, or the stance-info modal
   pattern Phase 1.6 established) probably beats permanent inline text — Phase 15's whole thesis
   is that the sheet should prefer tap-to-open info over always-on prose.
4. **Verbatim or paraphrased.** Copying sourcebook prose verbatim into a file that gets deployed
   to a public URL is a different question from paraphrasing it. The site is open and
   unauthenticated even though the repo is private. Worth a deliberate decision, not a default.

## Build rules this must follow

Since Phase 9 already exists as a shipped, independently-removable feature, its second bullet
should extend it rather than become a new phase — but it must not break the removability
contract that phase now carries. From `Versions/CLAUDE.md`, "Every feature must be surgically
removable":

- If the flavour text ships as its own fragment, give it its own `PART H PHASE 9` marked blocks
  and guard every call into it with `typeof`.
- If it extends `207-feat-clan-theming.js` instead, keep it behind that fragment's existing
  `CLAN_THEME_ENABLED` reasoning or give it its own flag — the project owner asked specifically
  that this phase stay easy to reverse.
- Adding a field to `060-lib-schools.js`'s entries is a trunk data change, not a Part H block.
  Decide explicitly whether removing Phase 9 should also strip that field, and write the answer
  into this folder's `ROLLBACK.md`.
- Update this folder's `ROLLBACK.md` **Dependencies** section if the flavour text depends on
  anything removable.

## Verify with

```bash
python3 build/recombine.py --verify        # from the Phase 0 folder
python3 build.py --check-drift             # from the repo root
python3 qa/inventory.py l5r-character-sheet.html
python3 qa/feature-dependencies.py src/sheet/207-feat-clan-theming.js "PART H PHASE 9" \
  --also cfsSection clanMonWatermark clanMonColophon clan-mon-watermark clan-mon-colophon clan-mon-url
```

The clan-theming harness (`qa/clan-theming-harness.js`, 14/14 at time of writing) must still pass
unchanged — the flavour text should not disturb the colour override or the mon artwork.

## Also waiting on a decision, same tab

`Versions/Part H — Sheet UI-UX/PENDING FEEDBACK — Real-Device UX Notes.md` holds three
real-device items the project owner raised after Phase 9 shipped, two of which touch this same
tab (the Void pip's colour, and the tab-bar colophon's placement). They are explicitly **not
actioned** and are not this bullet's job — but if the flavour text work opens up the Clan &
School tab anyway, read them first so the two passes don't fight each other.
