# Claude — next-session kickoff after Phases 4.5.27 to 4.5.32 (9 October 2026)

Prepared at the owner's request after Phases 4.5.31 and 4.5.32 passed their device check (all 35 Pass). The owner
asked for a reassessment of the ledger and roadmap aimed at **the biggest impact on the project's overall progress,
in the most efficient way**, and for this file to start the next session.

This supersedes `CLAUDE-SESSION-KICKOFF-AFTER-PHASE-4-7-2026-10-07.md`, the kickoff the previous session started from
(and the shape this one follows). Earlier kickoffs are historical examples, not current instructions. This file does
not override the owner's decisions.

The project is the **L5R 4th Edition single-player character sheet**: a player companion in the spirit of D&D Beyond,
**not** a combat engine, simulator or virtual tabletop (owner, 8 October). Repository:
https://github.com/JCrowley123/l5r-character-sheet-creator. Live site: https://l5r-character-sheet-creator.pages.dev/.

**Begin with your own assessment, not implementation.** The owner requested this handoff; they have not approved the
proposal below. If the message that accompanies this file approves a particular scope, respect that and do not ask
again.

## What I want from you first

1. **Do your own assessment of what remains and what it will cost.** Recount the remaining work from the current
   checkout and records (ledger, roadmap, audit, source), not from this file's lists. Read the current Claude usage
   yourself, and build your own cost model from the evidence below and anything newer. Say how confident you are.
2. **Draw your own conclusions** about the next phase and the order after it: user benefit, effort, confidence,
   dependencies, open rulings, verification overhead and device needs. Explain why your order makes efficient progress.
3. **Compare with the proposal below.** If yours differs, say exactly where and **give your reasons**: the old
   proposal, your alternative, the evidence that changed your mind, and the cost or QA trade-off. If you agree, say
   what you checked that convinced you. Agreement is not the goal; a well-argued difference is welcome.
4. Give the smallest useful next release, its exact boundaries and what it leaves out.
5. Describe its acceptance tests, surgical removal proof, regression checks, a concise owner checklist and the usage
   checkpoints you will record.
6. Bundle only the decisions the next release needs into a short set of questions, each with a recommended answer.
   Later decisions must not block a self-contained release.

Do the read-only investigation needed to make this concrete before asking for build approval. Once the owner approves,
proceed with routine implementation and verification without asking again. Do not start a later phase automatically.

## Read these first

Read selectively, but completely within the relevant sections; keep bulky logs on disk.

- `Versions/CLAUDE.md`: standing rules, surgical removability, folder and marker conventions, and the dated notes of
  7 and 8 October (the 4.5.31 and 4.5.32 lessons are there).
- `Versions/BUILD-LEDGER.md`: the current update, Open reminders, the cost tables (newest first) and At a glance.
  `Versions/BUILD-LEDGER.html` should agree.
- `Versions/L5R Character Sheet Phased Roadmap reorder.md`: Process Requirements, Recommended Build Order, Status
  Overview, Phases 6, 7, 9, 11.1, 13, 14 and 15, Deferred and declined (FT-01 to FT-14), and the newest amendments
  (7, 8 and 9 October).
- `Versions/PART I — Phase 4.5 Sourcebook Audit of Advantages and Disadvantages/AUDIT.md`: its counts describe
  2 October. Reconcile them with Phases 4.5.25 to 4.5.32 before calling anything the current backlog.
- `Versions/SOURCEBOOK INDEX — Page Map/INDEX.md` and its README, to find rule pages and PDF offsets.

Nearest precedents:

- Newest release pair: `Versions/PART I — Phase 4.5.31 Checks and Conditions/` and
  `Versions/PART I — Phase 4.5.32 Damage, Sessions and XP/` (READMEs, ROLLBACKs, `qa/`).
- Overlay screens, if you take Search: Phase 11's Characters screen and Phase 11.2's wizard (their fragments are
  `209.993-feat-characters-list.js` and `209.994-feat-creation-wizard.js`).
- `Versions/QA — Removal Chain Registry/` (inspect the live registry; do not copy old fixture lists).

## Checkout and source of truth

- **Canonical checkout: `C:\Users\jcrow\l5r-character-sheet-creator`.** Work and commit there. The OneDrive folder is an
  older clone; sessions may open there, but never build or commit there.
- At preparation, `main` and `origin/main` were at **`51aed3f`** ("Ledger: Phases 4.5.31 and 4.5.32 checked, all 35
  Pass; complete"); the commit adding this kickoff follows it. Verify history and status before syncing.
- Four owner-deleted kickoff files, untracked Word documents and an untracked `tmp/` folder sit in the checkout. Do not
  restore, delete or stage them. Stage exact paths only.
- Keep `core.autocrlf=false`, `core.longpaths=true`. One branch per release. Never force-push. **Merge only on the
  owner's word for that release.**

All production source is under
`Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/`. Edit fragments,
rebuild with `build/recombine.py`, pin `expect_sha256` (string edit, never `json.dumps` the manifest), and test that
folder's `l5r-character-sheet.html`.

## Verified state at handoff

### Since the last kickoff (7 to 8 October, Claude)

| Release | What it did | Owner check |
|---|---|---|
| 4.5.27 Situational Roll Entries | Nine per-roll ticks (Balance, Clear Thinker, Dangerous Beauty, Heartless, Irreproachable, Precise Memory, Wary, Imperial Spouse, Imperial Scribe) | 31 Pass, 2 Fail, both fixed by 4.5.28 |
| 4.5.28 Situational Entry Buttons and Gates | Spot ambush and Recall buttons; Imperial Scribe and Sacrosanct gated; device corrections | Re-test 9/9 |
| 4.5.29 Wound Entries | Strength of the Earth, Low Pain Threshold, Bad Health, Permanent Wound, built under a contract with the wound core | 21 Pass, 1 Not run (since closed) |
| 4.5.30 Automatic Roll Entries | Silent, Prodigy, Voice, Bad Eyesight, Disturbing Countenance, Anachronism | as above |
| 4.5.31 Checks and Conditions | 13 entries: check buttons, ticks, switches, Blind, Ishiken-Do; Void spells need Ishiken-Do | 35/35 Pass with 4.5.32 |
| 4.5.32 Damage, Sessions and XP | 9 entries: damage dice, Great Destiny, Dark Fate, Haunted, Enlightened, Obtuse, Blissful Betrothal | as above |

The 8 October check also closed the **owed iPhone looks** of 4.5.29, 4.5.30 and Phase 4.7: all passed on the iPhone.
Nothing is owed on a device now except Phase 0.7's optional Android checks (the owner has no Android device).

QA evidence (recorded 8 October, not fresh runs): full suite **4,706/4,706**; removing 4.5.32 restores 4.5.31's build
byte for byte (4,637/4,637), and removing 4.5.31 restores 4.5.30's (4,536/4,536). Source build **3,680,503 bytes**,
SHA-256 `fe2873e6654e63947fef50a36ebf8f0c6cd611d887651225b78abf87916501dd`. Live page **3,686,152 bytes**, SHA-256
`03896369…`, service worker `ea341dc9fe46c41f`; 211/211 focused checks and the checklist walk 32/32 on the live site.
**Latest runner:** `Versions/PART I — Phase 4.5.32 Damage, Sessions and XP/qa/current-suite-runner.js` (4,706).

### What remains (my count, 9 October; recount it yourself)

Phase status (ledger At a glance): 17 Fully done; Phase 0.7 built, not validated; Phases 6, 7 and 9 started, not
finished; Phases 11.1, 13, 14 and 15 ahead; Phase 10 deferred by design.

| Work | What is left | My size (Claude weekly points) | Blocked on |
|---|---|---|---|
| Phase 14 Search | Nothing built. A first release can search the catalogues that exist (below) | 10–16 first release; 8–12 for facets and the Library link later | Design rulings |
| Phase 4.5 remainder: supplement entries | 42 usable entries from the owner's supplements are not in the catalogue (audit: 34 automatable with existing machinery, 8 reminders) | 25–40, two or three releases | Scope rulings (Stations, Naga Ancestry, Trials of the Imperial City, Wanderer, Imperial City Stigma's cost) |
| Phase 4.5 remainder: the Void trio and Initiative | Daredevil, Touch of the Void, Momoku; Quick and Leadership (no Initiative mechanism yet) | 6–10 | Rule reading; small rulings |
| Phase 4.5 remainder: rulings-gated | D06 Weakness (approach approved, boundaries not ruled), Hotei (source-blocked), the other pickers the audit lists | 10–20 | Owner rulings |
| Phase 11.1 Export to PDF | Not built; must not rely on `window.print()` in the installed app | 3–15 | The owner's free iPhone ⋯ → Print test, never reported |
| Phase 6 SynergyEngine | Technique text done; the engine is not | 15–30 | Design |
| Phase 9 School flavour text | Clan look done; flavour text for every School remains | 10–20 | Book reading, own words |
| Phase 13 Library | PDF reader, separate storage, table of contents per book | 15–30 | Device checks |
| Phase 7 audit log | Deferred by the owner ("later") | 5–10 | Owner |
| End-of-project reviews | Glory, Status and Honour (with Fame, Social Position, Virtuous, Social Disadvantage, Infamous, Dishonored, Shadowlands Taint, Imperial Spouse's Status), the wound calculation (Core p.82), resist clutter, Manage as a screen, Print on the Characters list, Ancestor items, FT-01 to FT-14 | 15–30 | Owner decisions |
| Phase 15 UI consistency pass | Audit-first; absorbs FT-11 to FT-14 and the style notes | 15–25 | Last by design |

**Total, my estimate: about 140–260 points**, roughly 1.5 to 2.7 weeks of Claude allowance at recent costs. It is an
estimate, not a measurement. It will move with the owner's rulings and with how lean each session runs.

Catalogues a first Search release could cover today: `SKILL_LIBRARY`, `ADV_LIBRARY`, `DISADV_LIBRARY`,
`WEAPON_LIBRARY` (+ arrows), `KATA_LIBRARY`, `KIHO_LIBRARY`, `SPELL_LIBRARY`, `FAMILY_LIBRARY`, `MINOR_CLAN_LIBRARY`,
`SCHOOL_LIBRARY`, `MINOR_CLAN_SCHOOL_LIBRARY`, `BROTHERHOOD_SCHOOL_LIBRARY`, `ADVANCED_SCHOOL_LIBRARY`,
`ALTERNATE_PATH_LIBRARY`, the School Technique text (070), the Ancestors (209.99998), stances and Void spends. There
is no Items, armour or Monsters catalogue. An info pop-up exists to reuse (`populateInfoOverlay`).

## Usage and honest cost planning

Claude Pro, account-wide readings from the meter. The week resets on **14 October at 01:00 UTC**.

| Work (7 to 9 October) | Weekly | Points |
|---|---|---:|
| Assessment at session start (7 Oct) | 0% → 3% | 3 |
| 4.5.27, nine entries, through merge and live check | 3% → 12% | 9 |
| 4.5.27 results, 4.5.28 and its device corrections | 12% → 21% | 9 |
| Reassessment, 4.5.29 and 4.5.30 (10 entries), merge, live, results | 21% → 32% | 11 |
| 4.5.31 and 4.5.32 (22 entries), full QA, merge, live check | 32% → 45% | 13 |
| Results read, ledgers, this reassessment and kickoff (8 Oct, 23:50 UTC) | 45% → 49% | 4 |

What the evidence suggests (test it, do not just repeat it):

- **Batching pays.** Points per entry fell from about 1.0 (4.5.27 alone) to about 0.6 (4.5.31 and 4.5.32 together):
  one cycle's fixed costs (full suite, removal proof, variants, docs, three ledgers, checklist, merge, live check)
  are shared. Two related releases per cycle, one checklist, one merge.
- **Context size costs.** This session reached about 790,000 tokens of context; each step re-reads it, and the 5-hour
  window ran out once (99% on 8 October). **Start a fresh session per build cycle**, keep logs on disk, read sections
  rather than whole files, and wait for background jobs by notification rather than by polling.
- **Machine time is free; tokens are not.** A full regression takes about 10 minutes, its removed half another 10, and
  24 variants with `--jobs 2` about 25. Run them in the background, sequentially (parallel load caused false
  Phase 12.3 timeouts), and do not re-run a full suite without a code change or a failure to explain.
- Historical anchors: Phase 4.6, about 30 points for three releases; 4.5.25, about 5. Codex readings (2 to 7 October)
  are a different provider and window: do not add them to Claude figures.

Record usage at the start, after QA and after the merge, with timestamps and both windows.

## Proposal to challenge: next phase and order

**Recommended next: Phase 14 Search, first release** (row 4 of the adopted build order, which the audit sweep jumped
on 8 October). Why:

- **Impact.** It is the one remaining feature every player uses every session. A D&D-Beyond-style companion lives on
  look-up, and well over a thousand catalogue entries (Schools, Paths, Advanced Schools, Techniques, spells, kata,
  kiho, Skills, Advantages, Disadvantages, weapons, Ancestors) are today reachable only through the add pickers.
- **Efficiency.** It reuses the catalogues and the info pop-up, needs no book reading, and stands alone: Phase 14's
  own text lets search come before the Library, which only adds the book link. Supplement entries added later appear
  in it automatically.
- **Against the alternatives.** The 42 supplement entries cost about twice as much for entries most players never
  take. The Void trio and Initiative entries are cheap but rare. PDF export may be small or not; the owner's free
  Print test decides that first. Synergy, the Library and flavour text are larger or less certain.

**Smallest useful scope (my proposal):** one Search entry point opening a full-screen overlay; type-ahead over names,
descriptions and sources across the catalogues above; category chips to narrow; a result opens a read-only detail
view with its book and page. Out of scope for release 1: per-category facets (release 2), the Library link (Phase
13), Items and Monsters (no catalogue), and adding from results.

**Same cycle, separately removable:** the Blind Armor TN note, if the owner approves (see below).

**Then, in order:** Phase 11.1 if the Print test says it is small; the supplement entries by mechanism, with the Void
trio and Quick and Leadership folded in by mechanism (two releases per cycle, after the scope rulings); then reassess
Phase 6, Phase 9, Phase 13 with Search's book link and facets, and the audit log; D06 and Hotei once ruled; the
end-of-project reviews; Phase 15 last.

### Decisions the owner can make now, at no cost

1. **Search design** (questions for your proposal): where the entry point sits (my default: a Search item in the ⋯
   menu, or a small icon if a layout check shows room, since the iPhone header row is already full; it opens a
   full-screen overlay like the Characters screen); whether release 1 is view-only (my default: yes);
   which categories (my default: every catalogue above); available in Play and Manage alike (my default: yes).
2. **Blind's Armor TN note** (from check C11): add one line naming Blind and the sum under the Base TN and on Quick
   Access (recommended, shipped with the next build as its own removable correction), or park it for Phase 15.
3. **The iPhone ⋯ → Print test**, which sizes 11.1.
4. **Supplement scope:** Stations (The World of the Daimyo, The Daimyo's Path), Naga Ancestry, Trials of the Imperial
   City (its text repeats Imperial City Stigma), Wanderer's missing type, Imperial City Stigma's "Special" cost.
5. **D06 Weakness boundaries and Hotei**, when convenient.

## Owner decisions and deferred feedback

Preserve these; this handoff does not authorize implementing them:

- **FT-01 to FT-10** (4 to 6 October): see the roadmap's Deferred and declined. FT-07 (Blackmail purchases) is
  deferred to Phase 15 or beyond; FT-08 (Spell Slots in ChatGPT's preview) is unreproduced.
- **FT-11 to FT-14** (8 October, all for Phase 15): thematic names for the check buttons, with the owner's
  suggestions; Missing Limb's picker looks unlike the others; rows priced by another entry should show actual against
  catalogue price; one information symbol (italic "I" against upright "i").
- Parked for Phase 15 or the end: the wound track's text with both wound entries; the resist entries' clutter
  (Balance, Clear Thinker, Heartless, Irreproachable on every roll); the wound calculation (Core p.82: Healthy is
  Earth × 5; the owner's call, 4.5.29 follows any change under its contract).
- Standing rulings: Void spells need Ishiken-Do (reported, never blocked); Disbeliever is a tick on Social rolls;
  TN +N is shown as −N on the total; the Multiple Schools gate for Advanced Schools; 4.5.25's purchase-time prices;
  sourcebook rules always in our own words, never book text in the repository.

## Practical workflow and lessons from 4.5.27 to 4.5.32

- Books: `C:\Users\jcrow\OneDrive\Documents\L5R 4th edition books`. Extract only the pages you need into scratch.
- Test environment: Node `C:\Program Files\nodejs\node.exe`; `NODE_PATH=C:\Users\jcrow\l5r-qa-tools\node_modules`,
  `PLAYWRIGHT_BROWSERS_PATH=C:\Users\jcrow\l5r-qa-tools\ms-playwright`, `PYTHONUTF8=1`, `LANG=C.UTF-8`.
- Per release: fragment + stylesheet + one guarded seam block + manifest lines; own harness with book or ruling
  oracles; dependency harness; `remove-phase.py` and `test-removal.py` generated from the newest pair; `variants.json`
  (discover, review, pin, confirm); `verify-regression.py`; ownership scan (`qa/feature-dependencies.py`); inventory;
  a removal-chain entry at the end of `CHAIN`; README, ROLLBACK, MANUAL-TESTS; a CLAUDE.md folder-map entry and a
  dated note; a roadmap amendment; three ledgers.
- **Cross-phase fixtures:** a new tick provider needs a conditional term in 4.5.15's `RD-NO-PRODUCTION-PROVIDER` and
  4.5.16's `HV-PROVIDER-REGISTERED`; a greyed picker entry in 4.5.5's `GATES455-GATE-04`; a casting rule in Phase 8's
  rule list. Make each term depend on your API object and declare it in your ROLLBACK.
- **Pitfalls met:** a checkbox fires `input` before `change` and the lists recalc on `input`, so save on both;
  Feature 4.5.3 flags any row setting type it does not know (tell `R453.isUnknownConfigType`); Quick Access is painted
  before `refreshAllAdvConfigControls` runs; Universal spells are Air, Earth, Fire and Water only; never `await` a
  function that opens a confirm dialog inside `page.evaluate` (a variant can hang the run); a weapon attack asks for
  range (bows) or hand (two weapons) first; keep `verify-live.py`'s expected counts equal to the harness totals.
- Checklists: Claude Docs, one Result dropdown per row (Pass / Fail / Not run), one table per release. The owner tests on
  the live site; **never infer an iPhone pass from Windows or headless results.**
- The published ledger, https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk, keeps its ticks in its own database; publish
  the HTML file to that URL (read it first if this session has not published it).
- After a merge the owner asked for: verify production byte for byte, walk the checklist on the live site, then send
  the checklist. Update the ledgers once per verified milestone.

**First deliverable: your independent assessment of the remaining roadmap and its cost, your recommended next phase
with reasons (and where and why it differs from this proposal), the concrete next release and the decisions it needs.
This kickoff is not approval to build.**
