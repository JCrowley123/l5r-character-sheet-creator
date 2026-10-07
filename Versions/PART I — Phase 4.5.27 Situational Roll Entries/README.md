# Phase 4.5.27 — Situational Roll Entries

Nine Advantages that only recorded their cost and text now work when you roll. Each gives a bonus
in a circumstance the sheet cannot see for itself — who you are dealing with, or why you are
rolling — so the roll preview offers it as a tick under **Declare for this roll → Advantages**:
unticked on every roll, offered only where the roll type fits, applied to that roll (and a reroll
of it) alone, and never saved. **Approved by the owner on 7 October 2026, all decisions as
recommended.** Built on branch `claude/phase-4-5-27-situational-entries` from `main` `b414423`.

| Entry | Offered on | The tick (in our own words) | Effect | Book |
|---|---|---|---|---|
| Balance | Skill, Trait, Ring and dice-tray rolls | Resisting Intimidation or Temptation, adding your Honor Rank | +1k0 | Core Rulebook p.146 |
| Clear Thinker | Skill, Trait, Ring and dice-tray rolls | A Contested Roll against someone trying to confuse or manipulate you | +1k0 | Core Rulebook p.147 |
| Heartless | Skill, Trait, Ring and dice-tray rolls | Resisting Courtier, Sincerity or Temptation used to persuade, seduce or change your mind | +1k0 | The Great Clans p.136 |
| Irreproachable | Skill, Trait, Ring and dice-tray rolls | A Contested Roll in which the other side uses Temptation | +1k0 | Core Rulebook p.151 |
| Dangerous Beauty | Temptation rolls | Temptation with someone of the opposite sex | +1k0 | Core Rulebook p.147 |
| Imperial Spouse | Social Skill rolls | Dealing with a member of an Imperial family | +1k1 | Core Rulebook p.150 |
| Imperial Scribe | Social Skill rolls | Dealing with a shugenja or an artisan | +1k0 | Imperial Histories p.67 |
| Precise Memory | Intelligence Trait Rolls | Recalling something exactly | +1k1 | Core Rulebook p.152 |
| Wary | Investigation rolls using Perception | Detecting an ambush (against Stealth / Agility) | +1k1 | Core Rulebook p.155 |

Social Skills are the seven whose sub-type the Core Rulebook gives as Social Skill (pp.135–145):
Acting, Courtier, Etiquette, Perform (all its kinds), Sincerity, Intimidation and Temptation. The
rules were read from the PDFs on 7 October 2026; book text was extracted to a scratch folder only.

## The owner's rulings (7 October 2026, all as recommended)

1. **Build it as scoped.**
2. **Imperial Scribe's Free Raise on Calligraphy** appears automatically on every skilled
   Calligraphy roll as an "Imperial Scribe — Free Raise available" line that moves no dice. This is
   the convention Friend of the Elements set: the sheet has no Raise mechanic, and a Free Raise is
   not a dice bonus. It never appears on an Unskilled Roll, which may not benefit from Free Raises
   (Core p.80).
3. **Balance adds only its own +1k0**, with a note to add your Honor Rank yourself: the sheet does
   not add Honor Rank to resistance rolls (Core p.91) for anyone, and that general rule belongs to
   the end-of-project Glory, Status and Honour review. **While a configured Failure of Bushido is
   the Honor tenet** (you cannot add your Honor Rank, Core p.159), Balance is not offered.
4. **The revised build order** is recorded in the roadmap.

Defaults, as proposed: different entries stack (Core p.149's "Advantage Limits" sidebar leaves any
cap on stacked bonuses to the GM, and none is built); the same entry on two rows is offered once;
only rows on the Advantages list count; no new controls on the Advantage rows; the Full Defense
stance's Defense roll, attacks, damage, spells and initiative never offer them.

**Catalogue wording reconciled with the books:** Clear Thinker now reads "+1k0 on Contested Rolls
against someone trying to confuse or manipulate you. Dragon pay 2." (was "…resisting deception or
manipulation…") and Heartless "+1k0 on rolls to resist Courtier, Sincerity or Temptation used to
persuade you, seduce you or change your mind." (was "…aimed at swaying your emotions."). Rows
already on a character keep the text they were added with.

## Not in this release

- Imperial Spouse's +0.5 Status, and Imperial Scribe's purchase requirements (Status 2+,
  Calligraphy 4+): both wait for the Glory, Status and Honour review.
- Adding Honor Rank to resistance rolls (Core p.91), Paragon (Honor)'s doubling and Failure of
  Bushido (Honor)'s own effect: unchanged reminders.
- Advantages a Technique grants. The ownership check sees Advantage rows only: an Ikoma Bard (The
  Herald of Glory grants Precise Memory free) adds a 0-XP Precise Memory row; The Clarity of Fire
  Path's temporary Clear Thinker and Precise Memory stay manual.
- Identity gender: Dangerous Beauty's circumstance is the other person's, declared by the player
  (FT-04 and FT-05 stay deferred).
- Every other mechanism, missing entry, picker, D06 Weakness, Hotei and FT item.

**Known shared limit:** the dice tray and a hand-typed (unlinked) weapon row both roll as a plain
manual XkY, which the sheet cannot tell apart. The four resistance ticks therefore also appear on
those, exactly as Heart of Vengeance's and Jurojin's already do; leave them unticked.

## Implementation and removal

One fragment, `src/sheet/209.9999994-feat-situational-entries.js` (`SIT4527`, kill switch
`SITUATIONAL_ENTRIES_ENABLED`), one manifest entry and one guarded seam block
(`situational-entries-seam`, marker `PART I FEATURE 4.5.27`). It registers one provider,
`situational-entries`, with the 4.5.15 registry, and wraps `advConfigExtendedRollModifiers` for the
Free Raise line through the existing `adv-config` seat: the registry stays at seven seats. No CSS,
markup, save field, roll-pipeline or registry change. Dependencies and removal are in
[ROLLBACK.md](ROLLBACK.md).

## QA — 7 October 2026

Restore point recorded before any edit: `main` at `b414423`, **3,561,844 bytes**, SHA-256
`b6b8bc00756cbeca437228f5cef8f182598ab7dd493f91bc6f0c1c2f8b91fe83` (the live build, checked against the
deployed page on 7 October). Release build: **3,573,333 bytes**, SHA-256
`26eb8d8c1f0c61c015831e5b426010d470d49df1a2d86975f5fc9f3b58fa416f` (the manifest's `expect_sha256`).

| Check | Measured result |
|---|---|
| Own real-browser harness | **127/127** at 375px with fixed dice; **17/63** on `b414423` (sections that need the provider abort there), so it can fail |
| Full combined suite | **4,389/4,389** = the 4,262 retained checks + 127; zero failed suites |
| Surgical removal | Rebuilds **byte-identical** to `b6b8bc00…` (3,561,844 bytes); **4,262/4,262** retained checks on those exact bytes |
| Remover fixtures | 21 run: **20 passed**, one skipped (Windows refuses the symlink fixture), including a real removal from a scratch copy of the live tree |
| Ownership scan | `feature-dependencies.py`: every reference inside `PART I FEATURE 4.5.27` blocks, exit 0 |
| Removal chain registry | One entry added at the end; its own checks **11/11** |
| Inventory | Unchanged apart from size: 270 unique IDs, sections, overlays, seams; seven registry seats |
| Dependency boundaries | **30/30**: registry off or absent (no offers, Free Raise line still shown), Disadvantage configuration off (Balance offered), roll effects off and Advantage configuration off (nothing), no page errors |
| Retained provider-list checks | measured on this build before the correction: 4.5.15 52/53 and 4.5.16 90/91, failing only RD-NO-PRODUCTION-PROVIDER and HV-PROVIDER-REGISTERED; corrected: 53/53 and 91/91 with this release present and removed |

### Deliberately broken builds (pinned; discovery, then a pinned run: all 12 as expected, 3 boundaries green)

| Mutation | Result | What failed |
|---|---|---|
| Release removed / switch off | 16/63 | Every offer, dice, Free Raise, description and layout section |
| Wary at +1k0 | 121/127 | Wary's dice, preview, label, duplicate, reroll and Skill-table checks |
| Imperial Spouse at +1k0 | 121/127 | Its dice, preview and label, Gaijin Name and both Ten Dice Rule checks |
| Dangerous Beauty on every Social roll | 121/127 | The six non-Temptation Social probes |
| Wary ignores the Trait | 126/127 | `SIT-OFFERS-INVESTIGATION-AWARENESS` |
| Attacks offered | 126/127 | `SIT-OFFERS-ATTACK` |
| Disadvantage rows count | 126/127 | `SIT-DISADVANTAGE-LIST-DOES-NOT-COUNT` |
| Balance ignores Failure of Bushido | 126/127 | `SIT-BALANCE-HIDDEN-WITH-FAILURE-OF-HONOR` |
| Free Raise added as a die | 124/127 | The three Free Raise checks that see dice |
| Free Raise on Unskilled Rolls | 125/127 | The Rank 0 and Unskilled Free Raise checks |
| Descriptions not reconciled | 125/127 | Both description checks |

Boundaries: the registry's suite **53/53** and Heart of Vengeance's **91/91** with this release removed;
the dependency harness **30/30**.

**Found while building:** the roll preview's pool line states the pool before the Ten Dice Rule (8k5 plus
the ticks reads 15k6 while the dice roll 10k8): existing behaviour, left as it is; the harness checks both.
Geometry was measured in Chromium at 320, 375, 768 and 1440px with fallback fonts only (this desktop's
headless browser does not load the webfonts): seven options fit inside the preview at every width. That
is not an iPhone result.

## Usage

Claude Pro, read from the meter (account-wide): weekly **0% → 3%** for the assessment; **3% → 10%** and 5-hour 19% → 70% from build start (13:16 UTC) to the end of QA (13:53 UTC). After the merge, live check, checklist doc and ledgers: **11%** (5-hour 80%), 14:02 UTC; after the published ledger page refresh: **12%** (5-hour 88%), so about 9 points of the week all in. Readings, not a precise cost.

## Live — 7 October 2026

merged by fast-forward at `86e6d49`; the deployed page matches the committed build plus its app head byte for byte (3,578,982 bytes, SHA-256 `626d579a…`), service worker `0459cec5c5578655`; **271/271** focused checks on the downloaded page (this release 127, the registry 53, Heart of Vengeance 91); the checklist walked through the real controls on the live site: **28/28**. Your check is the [Situational Roll Entries — Test Checklist](https://claude.ai/code/artifact/e242e507-13ce-43aa-a557-65e11c263f1d) (Tests 1–9, about 15 minutes). iPhone and Windows: Not run. Evidence: `qa/live-verification.json`, `qa/live-qa.log`, `qa/live-checklist-walk.log`.

## Run

With `NODE_PATH=C:\Users\jcrow\l5r-qa-tools\node_modules`,
`PLAYWRIGHT_BROWSERS_PATH=C:\Users\jcrow\l5r-qa-tools\ms-playwright` and `PYTHONUTF8=1`:

- `node qa/situational-entries-harness.js <sheet.html>` — this release's checks.
- `node qa/current-suite-runner.js <sheet.html>` — the full chain (the Paragon fix's runner, then
  this harness); a missing or 0/0 suite fails.
- `node qa/dependency-harness.js <sheet.html>` — dependency boundaries.
- `python -B qa/verify-variants.py --jobs 4` — the pinned mutation variants and boundaries, in
  temporary copies only.
- `python -B qa/test-removal.py` — remover fixtures, including a real removal from a scratch copy.
- `python -B qa/verify-regression.py` — the full suite, then actual scratch removal and the
  retained suite on the removed build.
