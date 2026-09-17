# Rokugan Build Ledger

Where every roadmap phase actually stands — separating what is **verified** from what is merely
**built**, and what is built from what is **finished**.

| | |
|---|---|
| Snapshot taken | 17 September 2026 |
| Branch | `main` |
| Phase 0 build | `4cc3fa78` (canonical LF build; 2,614,082 bytes) |
| Last change | Phase 4.5.10 — **Cursed by the Realm (D01)**, ten Spirit Realms behind one catalogue row. Takes **no pre-roll registry seat and re-registers nothing** — a better route than 4.5.9's, and the one future entries should prefer: `D45.modules` entries are consulted generically from the single existing `adv-config` seat, and because `D45.modifiers()` returns early for DAMAGE *before* consulting that table, the damage exclusion is **inherited structurally** rather than filtered by the entry. Adds `realmPick` to `configTypes` on an explicit decision that **lifts a constraint 4.5.8 had recorded as absolute** — that argument held only for a *constant* expected value, and Phase 1.5 (Part G) had already solved it with a *conditional* one; three harnesses were corrected to that shape and read 826/826 present, 766/766 removed. **Jigoku's resistance roll is deliberately deferred**: the sheet models no Taint rank and the resisting roll is stated nowhere, so choosing one would be inventing rules content. Two bugs of my own were caught by *measuring* rather than reading — a CSS class collision (Toshigoku's effect key is literally `check`, colliding with the button rule) and a harness that hung instead of failing. **Not yet device-confirmed.** *Previously:* Phase 4.5.9 — Doubt (D03), the first build of the TN-reporting convention, at **4%** |
| Live site | <https://l5r-character-sheet-creator.pages.dev/> |
| Interactive version | [Rokugan Build Ledger artifact](https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk) — same content, but the tick-boxes below actually save there |

> **This file is a snapshot; the artifact is the live copy.** Ticking a box in the artifact does
> not update this file, and editing this file does not update the artifact. If they disagree,
> the artifact is newer — ask Claude to re-export, or tick the boxes here by hand. The roadmap
> at `L5R Character Sheet Phased Roadmap reorder.md` remains the single source of truth for
> *what* the phases are; this ledger only tracks *how far along* each one is.

## Latest review note — Phase 4.5 remaining Advantages

On 13 September 2026, the sheet-only Phase 4.5 configuration audit was reviewed and several
Advantage decisions were recorded in
`PART I — Phase 4.5 Remaining Configuration Audit/AUDIT.md`.

The user has accepted the remaining recommendations for future Phase 4.5 work, including
lightweight choices and reminders. Blackmail, Forbidden Knowledge, Inheritance, and Way of
the Land are no longer excluded. Servant reference help is approved; its compact record
remains deferred for complexity and does not require a full NPC sheet.

| Advantage | Approved approach / boundary |
|---|---|
| Blackmail | Name and player-entered target Status as agreed purchase details; calculate XP and show a badge. No live NPC tracking, automatic circumstance updates, or use of the player's own Status. |
| Darling of the Court | One row with multiple selectable court badges, one selected court, and one "Court in session" toggle. Show contextual Status +1 without changing actual Status or Blackmailed. Cost per court: 2 XP normally, 1 XP for Courtier; three courts cost 6 XP or 3 XP. |
| Forbidden Knowledge | Free-text subject, optional agreed-effects note, short badge, and examples behind an accessible circled-i icon. Identify Lore/effects as manually managed; no automatic grants. |
| Heart of Vengeance | Save the faction; eligible Skill/Trait/Ring/manual previews start with an unchecked +1k1 contested-roll declaration. No persistent activation or attack/damage/spell effect. Confirm Imperial-family target eligibility; retain Kharmic Tie-style isolation. |
| Inheritance | Named heirloom badge first. A non-combat Skill-roll +1k1 declaration is an optional later enhancement, not part of initial implementation. |
| Paragon | Tenet picker, badge, and concise benefit reminder; Honor awards stay player-controlled. Review future roll support individually by tenet. |
| Servant | Reference/tooltip-first presentation. Compact name/type/specialty/upgrades record with calculated XP is deferred, not inherently outside companion scope. No full NPC/combat/equipment subsystem. |
| Soul of Artistry | Artisan/Craft selection using an authoritative family list; matching unskilled rolls become effectively Rank 1 with full skilled behaviour. Purchased Skill Rank, Insight, and skill XP remain unchanged. Cost: 4 XP normally or 3 XP for Crane OR Courtier, with no stacked discount. |
| Touch of the Spirit Realms | Realm picker, accessible information icons, badge, and benefit reminder. Review automation separately for each effect later. |
| Way of the Land | Optional region name and reminder badge; retain 2-XP base / 1-XP Unicorn pricing. No map, location detection, or automatic navigation adjudication. |

These approvals update the planned approach, not implementation status. The audit addendum
supersedes broader initial proposals and records planned validation/regression coverage.
All additions must retain Phase 4.5-owned persistence, surgical removal, unchanged other-phase
harnesses, and no additional modifier-registry seat. The four decisions below are preserved.

Seven Fortunes' Blessing remains the canonical missing variable-configuration Advantage and
needs source-confirmed Fortune data before implementation.

Follow-up confirmations on 13 September 2026 (documentation only; see the audit for evidence
and proposed QA cases):

- **Naishou Citizen:** keep active Blessing selection separate from purchase accounting.
  Replacing it must not silently refund previous purchases; editing a selection must not
  itself charge XP.
- **Perceived Honor:** verified in the supplied Core Rulebook, printed p.152 / PDF p.155:
  **2 XP per rank**, so ten ranks cost 20 XP. The sheet's current 3-XP catalogue value and
  description are a confirmed data defect pending production correction. Actual Honor is
  unchanged; the higher value is for attempts to discern it.
- **Void Versatility:** verified in The Great Clans, printed p.199 / PDF p.200. Select one
  non-Void Ring at purchase; the Void-casting preview offers ordinary Void payment or that
  saved Ring. Preserve Void casting calculations/effects, eligibility, exhaustion checks,
  and existing shared Bonus-pool warnings/accounting.
- **Wealthy:** now verified in the supplied Core Rulebook, printed p.155 / PDF p.158:
  `XP = rank × 1 − (Crane OR Unicorn OR Imperial ? 1 : 0)`. The discount applies once to
  the total. The user's original formula was correct; only their example mixed ranks with
  koku. Five ranks cost 5 XP normally or 4 XP for an eligible character; the agreed grant is
  10 koku. The catalogue's per-rank discount wording is a confirmed data defect pending
  production correction. See the audit for boundary and one-time-grant QA requirements.

No new implementation or QA pass is claimed by these confirmations.

## Latest review note — Phase 4.5 remaining Disadvantages

On 13 September 2026, the user approved the recommendations for all seven remaining
Disadvantages, with the TN-reporting clarification below. The detailed design, unresolved
rule boundaries, and planned Validation Suite / Regression Matrix coverage are recorded in
`PART I — Phase 4.5 Remaining Configuration Audit/AUDIT.md`.

**TN reporting:** for Ring, Trait, Skill, spell casting, and attack rolls only, represent an
applicable `TN +N` rule as `−N` to the reported total when the GM adjudicates against the
original TN. Keep the preview's actual rule labelled `TN +N`, and show the equivalent result
adjustment transparently. Damage is excluded. With no known TN, report the adjusted number
without inventing pass/fail. When the app knows the TN, apply the penalty once: compare an
adjusted total with the original TN, or the unadjusted total with the increased TN, never
both adjustments together. Required Raises and Free Raises retain their distinct rule
meaning; neither becomes an unexplained flat modifier.

| Disadvantage | Approved approach / boundary |
|---|---|
| D01 — Cursed by the Realm | Realm picker, accessible information icons, badge; include all ten realms: Chikushudo, Gaki-do, Jigoku, Maigo no Musha, Meido, Sakkaku, Tengoku, Toshigoku, Yomi, Yume-do. Automatically target Animal Handling for Chikushudo; use a labelled Taint-resistance roll for Jigoku, per-roll spirit declaration for Maigo no Musha, player-controlled trance / temple conditions for Meido / Tengoku, and a player-triggered Willpower check for Toshigoku. Remaining branches use reminders or verified incompatibility checks; no NPC, location, calendar, or sleep tracking. See audit for exact branch effects and damage-applicability boundaries. Value: 4 XP normally / 5 XP for shugenja. |
| D02 — Dependant | Record the player/GM-agreed XP value, with optional name and note. No invented mandatory tiers or automated campaign consequences. |
| D03 — Doubt | School Skill picker and badge. Each use of the chosen Skill, including relevant weapon attacks, requires one Raise with no benefit. Show that requirement and its TN +5 / reported-total −5 equivalent; account for Raise limits and other declared Raises. Do not apply it to subsequent damage automatically. |
| D04 — Seven Fortunes' Curse | Fortune picker, information icons, badge; scoped automatic effects, declared context, or labelled resistance rolls as appropriate to each branch. Benten / Fukurokujin use the TN-reporting rule above; Bishamon reduces only the applicable Strength contribution to weapon damage; Daikoku's starting-koku reduction happens once; Ebisu requires the player's non-samurai Social-roll declaration; Jurojin supports poison and disease resistance. Hotei is 6 XP instead of the usual 3 XP and requires two Void for covered Technique / Advantage activations, not ordinary +1k1 spending; activation classification, affordability, and exact-once payment require review. |
| D05 — Unlucky | Positive rank input, 2 XP per rank, one session use per rank: rank 5 means 10 XP and 5/5 uses. A GM-invoked result button rerolls the saved pool and original modifiers, keeps the second result in all cases, and spends one use. Do not restart the action, repay its resources, repeat gates, or offer fresh resource spending. Disable the button at zero; provide session reset and manual counter adjustment. |
| D06 — Weakness | Trait picker and badge showing purchased and effective values. Use a separately calculated effective-Trait reduction, preserving purchased Trait and XP records. Review every relevant roll and derived-statistic consumer; do not assume how Insight, dependent Rings, or Ring-derived resources change without resolving those boundaries. |
| D07 — Wrath of the Kami | Element picker and incoming-spell Free Raise reminder. Value: 3 XP normally / 4 XP for shugenja. No automatic +5 to casting, no own-casting or spell-slot change, and no decision on how another caster spends the Free Raise. |

**Confirmed correction pending implementation:** the supplied Core Rulebook, printed p.162,
requires Unlucky to keep the second roll in all cases. The current sheet's "keep worse"
summary and the original audit repeating it are incorrect. This approval records the
correction; it does not claim the production catalogue or reroll behaviour has been changed.

This is design approval only, not implementation completion. No new production work,
Validation Suite execution, or removal proof is claimed. Future work must retain Phase 4.5
ownership in `feature-dependencies.py`, non-colliding markers, guarded hooks, scoped CSS/JS
and persistence, byte-identical surgical removal, unchanged other-phase harness results,
and no additional registry seat or Phase 1.5 pipeline-baseline change. The audit lists the
tests to fold into the current suite before any implementation is called complete.

## What each phase has cost

Recorded by the project owner against their weekly Claude allowance, because build order is
partly a budget decision and the estimates have been wrong in both directions before.

| Week | Phase | Cost |
|---|---|---:|
| w/c 9 Sep | Phases 0, 0.5, 0.6, 0.7, 1, 1.5, 1.6, 2, 3, 4, and a start on 9 | ~75% |
| w/c 9 Sep | Phase 5 — Character Creation Linting | ~3% |
| w/c 9 Sep | Phase 8 — Casting Diagnostics | ~10% |
| w/c 9 Sep | Phase 4.5 — Modal-Configured Advantages/Disadvantages | ~10% |
| w/c 16 Sep | Phase 4.5.3 — Configuration Repairs | **8%** |
| w/c 16 Sep | Phase 4.5.4 — Configuration UX Pass, plus two real-device corrections | **9%** |
| w/c 16 Sep | Phase 4.5.5 — Eligibility Gates, plus the Great Potential skill-picker revision | **7%** |
| w/c 16 Sep | Phase 4.5.6 — Perceived Honor and Wealthy | **5%** |
| w/c 16 Sep | Phase 4.5.7 — Unlucky, plus the tooltip correction | **12%** |
| w/c 16 Sep | Phase 4.5.8 — Dependant and Wrath of the Kami | **4%** |
| w/c 16 Sep | Phase 4.5.9 — Doubt, plus a same-day wording correction | **4%** |
| w/c 16 Sep | Phase 4.5.10 — Cursed by the Realm (D01) | _pending_ |

**Seven point releases in one day, 16 September, against a week that began at 02:00 BST
that morning. The project owner's own reading after 4.5.9 is 49% of the weekly allowance —
exactly what the row-by-row figures below sum to.**

The spread is the useful part, and it is wide: **4%** bought two whole Disadvantages (twice —
4.5.8 and 4.5.9 both), **5%** bought two rank-priced Advantages, and **12%** bought a *single*
Disadvantage that needed dice-engine integration and a twenty-invocation harness. Entry count is
a poor estimator of cost; *how much new machinery an entry needs* is a good one. Budget the next
batch by that, not by how many catalogue rows it closes.

> **On the arithmetic — corrected.** An earlier version of this table carried a discrepancy: the
> w/c 16 Sep rows summed to 45% against a reported running total of 41% after 4.5.8. That 41% was
> a mis-report — the project owner has since confirmed the actual running total after 4.5.8 was
> **45%**, matching the table exactly, and the 41% belonged to the point before it (after 4.5.7).
> Every phase from 4.5.8 onward has now been reported as its own direct figure rather than a
> differenced running total, and the two agree to the percentage point. Worth keeping as the
> standing practice: report each phase's own cost, not just a cumulative total to subtract from.

Phase 5's 3% is the outlier worth remembering: its audit found the machinery already existed and
the phase was mostly consolidation. Phase 4 is the opposite lesson — the roadmap called it "mostly
wiring" and five of its seven factors turned out unbuilt. **The cheap phases are the ones whose
unknowns were resolved before the work started**, which is the reasoning behind measuring first in
4.5.3 and 4.5.4.

## At a glance

| Status | Count | What it means |
|---|---:|---|
| ✅ **Fully done** | 13 | Built, and proven by something other than an assertion |
| 🔵 **Built, not validated** | 1 | Mechanism works; no evidence from real hardware yet |
| 🟡 **Started, not finished** | 1 | One half shipped, the other half parked |
| ⬜ **Ahead** | 10 | Not started (Phase 10 excluded — deferred by design) |

---

## ✅ Fully done

Built, and proven by an automated harness with a recorded pass count, a byte-identical build
check, or a real device — not by a claim.

**Phase 0 — Source Reorganization** · Part F
Build output **byte-identical** to the pre-split deliverable; behavioural parity harness across
all 14 flows.
*The current trunk — every later phase edits its fragments.*

**Phase 0.5 — Hosting & Deployment** · Part F
Cloudflare Pages rebuilds and redeploys on every push to `main`; the deploy refuses to publish
if its copy doesn't hash identically to the Phase 0 build.
*Repo stays private; the pages.dev link is open and unauthenticated. Two separate facts, and
only the first is enforced by anything.*

**Phase 0.6 — Installable Web App** · Part F
PWA and update harnesses pass, and — the part that matters — install, launch and aeroplane-mode
offline were all **confirmed on an iPhone 16e**.
*The offline case only passed after a real failure was found on that device and fixed. This is
the one delivery phase with genuine device evidence behind it.*

**Phase 1.5 — Roll Pipeline Consolidation** · Part G
**34/34** checks against the modifier registry, every contributor, and stacked combinations.
No production code changed — audit only.

**Phase 1 — UI/UX Foundations** · Part H
**9/9** against the fixed build, and **4/9** against the build that originally shipped — the
harness was made to fail before it was trusted.
*Shipped broken: the first harness asked the code under test whether it was working, so both
halves agreed with each other rather than with reality. Real-device testing caught it. This is
the origin of the project's "a harness must be able to fail — prove it" rule.*

**Phase 1.6 — Combat Tab Streamlining** · Part H
**23/23** checks, plus a full before/after behavioural diff against the rest of the sheet.

**Phase 2 — Quick-Access Sidebar** · Part H
**19/19**, dropping to 12/19 and 18/19 against two intermediate builds each missing one class of
live-update hook.
*Its own harness caught four controls that bypass `recalcAll()` — three before shipping, and the
shared Bonus-slot pool after a real-device tester noticed it missing.*

**Phase 3 — Smart Roll Preview** · Part G
**43/43** checks, dropping to **18/21** (at the 21 checks that existed then) against a build that
commits the Void spend on toggle instead of on confirm, **7/21** with the phase's kill-switch
off, and **32/35** with the Skill-Rank RAW gate reverted. Phase 1.5's pipeline baseline still
reads 34/34.
*The audit found the roadmap's "introduce a RollContext" already built, so this renders the
pipeline's own numbers rather than computing its own. Ticking a Void option in the preview costs
nothing until you actually roll.*

⚠️ *Real-device testing after ship found **two** genuine rules bugs, both in the Void spend list
and both surfaced by the preview showing that list plainly for the first time.*

*First: ticking two one-roll Void options stacked both onto the same roll — an Earth Ring Roll's
`2k2` went to `4k4`. Root cause was two-fold: "+1 Trait" was never a real RAW power (RAW's actual
text is one `+1k1` effect covering Skill/Trait/Ring/Spell Casting rolls), and nothing enforced
"only one of these effects" outside combat.*

*Second: `+1 Skill Rank (0 → 1)` was offered on every roll kind except Damage — including Ring
rolls, which have no Skill Rank at all. RAW restricts it twice in one sentence ("from 0 to 1",
"avoiding Unskilled Roll penalties"), so it applies to a skill-based roll made unskilled and
nothing else. Reported by the project owner's own reading of the rule, which was correct.*

*Both fixed the same session, in `160-feat-void.js` rather than in the preview — the preview
decides what to offer by simulating the real contributor, so fixing the rule fixed the offer
list with no second copy to maintain. See
`BUGFIX — Void One-Roll Effects Not Mutually Exclusive/README.md`.*

⚠️ *A later pass found **two more**, this time in the offer list itself rather than the rules.
`voidKeyWouldMatter()` compared each key against the pool currently on screen instead of the
unmodified one — so once any option was ticked, every other one looked relevant, putting
`+1 Skill Rank` back on trained rolls. And an option refused because you had no Void Points left
vanished silently, which the project owner — who wrote the app — reported as a broken feature.
Both fixed; the harness went 35 → 41 checks. See
`BUGFIX — Void Offer List (Wrong Baseline, Silent Refusal)/README.md`.*

**Phase 4 — "Explain This Roll"** · Part G
**22/22** checks, dropping to **6/22** with the phase's kill-switch off and **20/22** against a
build with Phase 3 removed. Phase 3's own harness reads **35/35 both with this phase present and
with it deleted**.
*The roadmap called this "mostly wiring". The wiring was real but small; the actual gap was that
five of its seven named factors — base dice, Trait, Skill, School bonuses, Affinity — had no
representation anywhere, because a pool reaches the pipeline as two bare integers with its
composition already thrown away. Callers now declare their own parts and the phase shapes them,
never recomputing: what is not declared is not claimed, and parts that don't reconcile print an
honest "Base pool" row instead of a confident wrong one.*

*It also closed a blind spot: the post-roll bar only appeared when a modifier applied, so an
ordinary unmodified roll was the one roll the sheet could not explain.*

*Real-device pass afterwards fixed the two groups colliding onto one line at phone width, and
corrected a comment the breakdown exposed: `Affinity/Deficiency never applies` to Universal
spells was untrue — the code was right, the comment was not.*

**Phase 5 — Character Creation Linting** · Part J
**25/25** checks, dropping to **11/25** with the phase's kill-switch off and **0/1** with its
fragment deleted. The eight other phase harnesses read **identically** with this phase present
and with it surgically removed — and the removed build is **byte-identical** to the build from
before it was added (`50ab1c71`, 2,265,218 bytes both times), which is the strongest form of the
removability claim in this project so far.
*The roadmap called this "consolidation, not writing rules from nothing" and that held: all five
rule families already had working machinery, it just never said anything. Nine rules now report
against the sheet's own deciding code — nothing clamps, blocks or refuses.*

⚠️ *"Over-capped rings" is the one named rule family NOT built: the sheet caps nothing about a
Ring, and the RAW that would say where the cap sits is in the desktop-only sourcebooks. Parked
per Process Requirement #3 rather than invented. Related: the sheet has no "at creation" vs
"in play" distinction at all until Phase 12, so every rule shipped here is one that holds at all
times.*

⚠️ *The audit turned up three pre-existing issues in other Parts' code, recorded in that phase's
README and deliberately not fixed here: the Rings & Traits hint promises you can adjust a Ring
freely when `recalcAll()` overwrites all four elemental Rings unconditionally on every pass; and
two School lookups (`schoolConcreteSkillNames`, `characterCasterLock`) search only the major-Clan
library, so Minor Clan and Brotherhood Schools fall through both.*

**Phase 4.5 — Modal-Configured Advantages/Disadvantages** · Part I
**51/51** legacy checks and **48/48** completion-pass checks pass. The ten unaffected phase
harnesses retain their exact passing totals with Phase 4.5 present and removed, and Phase 1.5
remains **35/35** in both builds. Surgical removal rebuilds **byte-identical** to the pre-phase
build (`9dbaf6c6`, 2,322,320 bytes both times); the canonical expanded build is `4355dec4`,
2,428,891 bytes.
*The original Ring/severity and three roll-effect entries are joined by complete configuration for
Allies, Gentry, Kharmic Tie, Languages, Luck, Magic Resistance, Sacred Weapon, and Great Potential.
Every variable entry is visibly unconfigured and inert until complete; configs, pip pools, and
tagged Clan equipment round-trip through persistence.*

*The original price/options audit remains in the phase README as historical evidence. The
completion pass uses only the user-approved ladders and Clan profiles; no unapproved rule content
is inferred.*

⚠️ *The roll half needed a RULING, not just work: `PREROLL_MODIFIER_REGISTRY` was baselined by
Phase 1.5 at exactly six contributors, and that phase's own comment named 4.5 as one that must
not change it. You ruled the baseline may go to seven. Phase 1.5's check is now written
conditionally on this phase being present, so it reads **35/35 both with 4.5 in the build and
with it surgically removed** — a hard `length === 7` would have broken this phase's own
removability proof.*

✅ *Friend of the Elements grants a **Free Raise**, which is not a dice-pool change — this sheet
has no Raise mechanic to spend one through, and every other Free Raise in the codebase is
likewise descriptive text. It registers an `informational:true` modifier that reports the Free
Raise and moves no dice, asserted by folding it through the trunk's own `applyPreRollModifiers()`
and requiring the pool to come out unchanged. Inventing a dice equivalent would have been
inventing rules content.*

⚠️ *Real-laptop testing found the picker's tiles broken: `LOW 3 PTMEDIUM 5 PHIGH 7 PTS`. The
modal reuses the universal-spell Element picker's markup per the roadmap's "no new modal system",
and THAT picker's tiles are a fixed 78×78 square with a `nowrap` label — right for the one-word
labels it was built for (Air, Fire), impossible for "Medium 5 pts". Reusing markup inherits its
unstated assumptions, not just its look. Fixed with an override scoped to this phase's own grid,
so the trunk's pickers keep the square they were designed around. The check written afterwards
found it was worse than reported — **all 15 options across all six severity entries** overflowed,
Cast Out's worst at 292px in a 78px tile — and drops the suite to 50/51 against a build with the
fix reverted. Nothing in the existing suite could have seen it: every other check reads values,
and this was geometry.*

⚠️ *Still not opened on a phone. `skillPick` is now implemented for Great Potential and reports
both Skill and Void raise limits; `traitPick` remains outside the approved scope.*

⚠️ *The mandatory end-of-phase re-verification earned its place again. `feature-dependencies.py`
reported six of this phase's own CSS rules as owned by `PART J PHASE 5` — whose remover would
have deleted them — because this phase's CSS comment explained its placement with the words
"Part J Phase 5's removal script…", and `MARKER_RE` is case-insensitive, so marker-shaped prose
in a comment is parsed as a real marker. Exactly the trap Phase 8 hit. Reworded, it reports
clean. Review had not caught it.*

**Phase 4.5.2 — Disadvantages point release** · Part I
**163/163** point-release checks pass. The integrated runner folds this suite into the two existing
Phase 4.5 harnesses and all retained phase harnesses; their totals remain unchanged, including
Phase 1.5 at **35/35**. The release adds the eleven approved Disadvantages with explicit refund
logic, guarded effects, player toggles, isolated Willpower gates, schema-3 migration, and visible
unknown-config handling. Full removal from a fresh copy restores the canonical expanded pre-release
build (`4355dec4`, 2,428,891 bytes), and the retained suites read identically. Phobia, Sworn Enemy,
the gates, and the core config each have their own exact marker and removal scope.
Antisocial now uses the supplied authoritative seven-skill list and leaves non-Social Skills unchanged.
See `Versions/PART I — Phase 4.5.2 Disadvantages/README.md` and its regression matrix.

⚠️ *Post-release owner feedback recorded 13 September 2026 — backlog, not yet implemented.*
The configured Advantage/Disadvantage experience needs a follow-up polish and bug pass before this
area should be treated as final UX. Modal tooltip affordances should use a consistent circled "i"
icon everywhere a tooltip appears. Several modal option cards overflow their card bounds on narrow
screens, especially long Skill/tenet labels. Disadvantage card copy should be shorter and closer in
feel to Magic Resistance: compact reminder text plus a badge where possible, with "XP refund" wording
removed or greatly reduced in the UI in favour of consistent language such as "level of phobia",
"level of imbalance", "level of compulsion", or "severity". School-gated entries need an audit beyond
Elemental Imbalance; Friendly Kami is a known example that should be Shugenja-only.

⚠️ *The same feedback pass should also consider broader sheet UX items.* Added Advantages should
appear beneath the add control in natural top-to-bottom order rather than visually building from the
bottom. Advantage/Disadvantage dropdowns need search/filter support. Techniques, Kata, Kiho, and
Spells likely need an expanded picker/filter design, including spell element filters plus text search,
but that implementation should be workshopped before coding. The wound bar has an unwanted surrounding
box. A Dark Mode setting is desired, ideally with an explicit toggle and optional device-theme sync.
Spell-slot accounting has a suspected bug when manual element-slot pips and extra spell slots are
mixed: reducing Water usage after casting beyond Water capacity can appear to release both Water and
Fire slots. Reassess the manual-vs-roll spell-slot model before changing logic.

**Phase 4.5.3 — Configuration Repairs** · Part I
**39/39** checks, dropping to **18/39** against a build with the phase's kill-switch off, where all
21 failures are the original defects reappearing. The removal fixtures pass **14/14**, and surgical
removal rebuilds **byte-identical** to the pre-release build (`27b57eff`, 2,476,062 bytes). Every
retained suite reads **504/504** with this release present and removed alike; combined **543/543**.
*Eleven confirmed defects in already-shipped Phase 4.5 code, all found by the 13 September audit and
each re-verified against the tree before it was written. No new catalogue entry and no new
configuration type: every line exists to make something that already shipped behave the way its own
description already claimed.*

*Two entries were charging the wrong price — a Phoenix Elemental Blessing and a Shugenja Friend of
the Elements both paid 4 where their own descriptions say 3, because only severityTier entries ever
returned a cost. Three catalogue values were wrong against the books: Perceived Honor at 3 XP/rank
instead of 2 (Core p.152), Wealthy's discount described as per-rank instead of once off the total
(p.155), and Unlucky keeping "the worse result" instead of the second roll (p.162). Friendly Kami's
"Shugenja only" was documented in two places and enforced in none. Great Potential's raise-limit
reminder never reached a weapon attack, which is exactly where a Raise gets spent.*

⚠️ *The catalogue corrections fix the LIBRARY, not saved characters. A row a player already added
keeps the cost they agreed at the table; silently repricing a saved character is a data mutation
this release deliberately does not make. An old save will disagree with the Advantage list until
the entry is re-added.*

⚠️ *Lord Moon's Curse is the audit's twelfth confirmed defect and is **parked, not fixed**. Its
severity tier is correct; the full-moon bonus Void Point and rank-scaled Willpower TN are stated
nowhere in this sheet, so implementing them would mean inventing rules content. It now sits
alongside Seven Fortunes' Blessing as source-gated.*

⚠️ *The first removal attempt rebuilt **one byte heavy** — a blank line on both sides of the seam
block left a double blank where the original had one. The harness was green and the ownership scan
was clean; only the byte comparison caught it. Same failure mode as Phase 8's two-byte discrepancy,
and the argument for demanding a byte-identical rebuild rather than a diff that looks right.*

✅ *One fixture correction in Phase 4.5's own harness, listed in 4.5.3's ROLLBACK.md: it configured
Friendly Kami on a character with no School and asserted the bonus applied, which is part of why
nothing ever caught the unenforced requirement. It now applies a Shugenja School and reads 51/51
both with 4.5.3 present and removed — the same precedent Phase 1.5 set when 4.5 took the registry's
seventh seat.*

⚠️ *No sourcebook conformance audit beyond the three passages already verified, and no UX work —
the narrow-screen card overflow, circled-i affordance and "XP refund" wording all remain
outstanding.*

📱 *Real-device pass, 16 September 2026, iPhone 16e, against the live deployed build. All five
price/behaviour fixes confirmed working (Elemental Blessing, Friend of the Elements, Perceived
Honor, Wealthy, Unlucky). Five items recorded as feedback for a later round — see
`PART I — Phase 4.5 Remaining Configuration Audit/AUDIT.md`, "Real-device feedback — 16 September
2026":*

1. *Friend of the Elements' Free Raise note is squished in the **roll preview** at phone width —
   a different screen than the config-picker overflow already on the backlog.*
2. *& 3. Perceived Honor, Wealthy and Unlucky show no modal on the phone. **Confirmed as expected,
   not a regression** — none of the three has a schema entry at all; building one is audit items
   A10, A16 and D05, not part of this release's scope.*
4. *Friendly Kami can still be picked by a non-Shugenja before the inert-with-reason behaviour
   this release added kicks in. Proposed: grey it out in the dropdown itself, matching
   `btnAddSchoolToggle`'s disabled treatment — flagged as a design question bigger than one entry,
   since adopting it raises whether Elemental Imbalance's existing after-the-fact alert should
   change to match.*
5. *Great Potential's Skill field is free text with no link to the character's actual Skills. The
   sheet already has the machinery for a dropdown (`api.skills()` in 209.85,
   `schoolConcreteSkillNames()`) — noted for when this is next touched.*

✅ *Items 1 and 4's geometry are fixed by Phase 4.5.4 below; items 4 and 5 by Phase 4.5.5. Items 2
and 3 remain open, and are the same item — three entries with no configuration handler at all.*

**Phase 4.5.4 — Configuration UX Pass** · Part I
**28/28** checks, dropping to **15/26** against a build with the phase's kill-switch off and
**25/28** against one with its stylesheet dropped from the manifest — two different broken
builds, because this phase has a JS half and a CSS half that fail independently. Removal fixtures
pass **16/16**, and surgical removal rebuilds **byte-identical** to the pre-release build
(`18a740e8`, 2,495,934 bytes) after both same-day corrections alike. Every retained suite reads
**543/543** with the release present and removed alike; combined **571/571**. Live build after
both corrections: **2,515,953 bytes**, `da0db0946afa356df26e9ea79cfb82f87a669d479247ec1ca230e9bb17be7b13`.
*Scoped from measurements at 375px rather than from the reports, which moved it in both
directions.*

*The reported "several overflowing option cards" was down to **one** by the time this phase
measured — Consumed's `Determination — 6 XP`, 165px of text in a 134px box. Phase 4.5's own
override had already handled the rest. "Use a consistent circled-i icon" turned out to need more
than an icon for the ~24 entries offering only a bare `title=` and no other affordance, since
`title=` does nothing without hover. Those now carry a tappable button opening the sheet's
existing info overlay. The `title=` stays, so desktop hover is unchanged, and the button's glyph
is a CSS `::after` so it contributes nothing to the row text several existing harnesses assert
on.*

⚠️ *`white-space:normal` was measured NOT to fix Consumed's label, which is worth recording
because it looked sufficient — the label still ran 165px inside 134px. The text span is a flex
item at `min-width:auto`, which resolves to its min-content width, so it refused to shrink into
the 106px available. `min-width:0` is the actual fix.*

⚠️ *The ownership scan caught this phase handing three of its own CSS rules to Phase 3. The
comment explaining whose class it was styling opened with that phase's name in marker order, and
`MARKER_RE` is case-insensitive, so marker-shaped prose parses as a real ownership marker. **Third
time this project has hit that trap** — Phase 8, Phase 4.5, now this one — and the third time
review missed it and the mechanical check did not.*

⚠️ *Copy shortening was on the same feedback list and is **deferred**, on the project owner's call
once measured: entries run 76–197 characters against Magic Resistance's 151, which that feedback
named as the good example, and only four exceed it. Rewriting rules copy on a marginal case was
judged not worth it yet.*

🔴 *Real-device correction, same day (16 September 2026) — the first cut shipped with three real
bugs, all reported back from the project owner's iPhone 16e. First, its own claim that the tenet
rules were "simply unreadable on touch" **overstated the gap**: Phase 4.5.2 already builds a
native `<details>` disclosure carrying that exact text on every tenet option, with no JS and no
hover dependency, that predates this phase entirely. Adding a second, competing route to the same
text was reported as confusing rather than helpful. Second, that same disclosure's hidden body
text was leaking into the new button's heading — `textContent` traverses a closed `<details>`
exactly as it does visible text — producing a garbled multi-line modal title such as
`"Determination — 6 XPRuleYou cannot spend Void Points…"`. Third, `overflow-wrap:anywhere` did not
just permit last-resort breaking as intended: per spec it also changes a flex item's automatic
minimum size to ignore intact words, so several option cards were sized too small and split
mid-word — "KNOWLEDGE" as `KNOWLEDG/E`, "PERFECTION" as `PERFECTIO/N` — for words that fit their
box fine on their own.*

*All three fixed the same day. The disclosure is now hidden (never removed) wherever this
phase's own button replaces it; the heading is read through a helper that excludes that
disclosure's subtree before reading any text; and `overflow-wrap:break-word` replaces `anywhere`,
verified live via `Range.getClientRects()` on each tenet name rather than a visual read. One
genuine case remained even under `break-word` — "Determination", the longest tenet name, renders
137px wide once its real uppercase-plus-letter-spacing styling is applied, against 106px
available — fixed with a small width increase scoped to `.d45-option` alone, so Phase 4.5's own
Ring/severity tiles keep their original size. Seven new checks were added and run against a
reverted scratch copy before being trusted: all four reproduced the exact reported symptoms,
including the literal garbled string from the screenshot. See the phase's own README,
"Real-device correction, 16 September 2026," for the full account.*

🔴 *Second real-device correction, same day — "Determination" still split, at a different point in
the word, after the 200px fix above shipped. Root cause found via `document.fonts`, not another
pixel probe: this sandbox has no outbound network access, so Google Fonts (`Shippori Mincho`)
never loads here (`fonts` returns an empty set), and every width measured in this phase — 165px,
137px, 200px, all of it — was measured against a browser-substituted fallback serif, never the
font real devices render. **Standing lesson recorded for future geometry fixes in this project:
a pixel cap calculated in this sandbox cannot be trusted for anything that depends on webfont
metrics; prefer a fix that doesn't need to know a word's exact width.** Fixed by giving the option
card the full row width (`width:100%; max-width:none`) instead of any calculated cap — both
affected entries already lay out one card per row regardless of width, so the cap was solving a
problem the layout didn't have. Verified live at `width:100%`: all fourteen tenet names across
both entries measure with 237px of room for a word that measured 137px under the same fallback
font — wide margin, shipped without claiming proof against the real font, only
robust-by-construction. The harness's no-split checks were re-confirmed able to fail by removing
the width override entirely and reproducing the original splits. **Confirmed the same day on the
reporting iPhone 16e:** every tenet name across both entries, "Determination — 6 XP" included, now
renders on one line. See the phase's own README, "Second real-device correction, same day," for
the full account.*

**Phase 4.5.5 — Eligibility Gates + Great Potential Skill Validation** · Part I
**41/41** checks, dropping to **16/37** against a build with the phase's kill-switch off and
**39/41** against one with its stylesheet dropped from the manifest. Removal fixtures pass
**16/16**, and surgical removal rebuilds **byte-identical** to the Feature 4.54 build this release
was added to (`da0db094`, 2,515,953 bytes) on the first attempt. Every retained suite reads
**571/571** with the release present and removed alike; combined **612/612**. Live build:
**2,533,897 bytes**, `0538c4662e19ba633a3faefb8d1111f1b502f557e7f7b935c7fb53ae6570ab7f`.
*The last two open defects on the Phase 4.5 audit. Both reports were overstated, and both were
re-measured before anything was built — the third phase running where the report and the code
disagreed.*

⚠️ *"Friendly Kami can still be selected by a non-Shugenja" was **worse** than reported: the option
was not merely selectable, its configuration modal opened in full on a character with no School at
all. "Great Potential renders a plain text input with no connection to the Skill list" was **half
wrong**: 209.81 already backed it with a datalist of all 44 library Skills. The real defects there
were that the list is the master catalogue rather than this character's Skills, and that the field
accepted anything — `Underwater Basket Weaving` typed, confirmed, and saved as a configured Skill
without complaint.*

🔵 *A design question the audit said to settle first, and it was right to. The sheet already had
**four** different answers to "this will not work": a disabled control plus hint
(`btnAddSchoolToggle`), a disabled option card (4.5.2's deficient-Ring tile), a hard `appAlert`
refusal (Elemental Imbalance), and 4.5.3's allow-then-explain (Friendly Kami) — while the quick-add
`<select>` the feedback was actually about disabled nothing, ever. The project owner chose disable
in the picker as the **standard for every gated entry**, not a Friendly Kami exception. Both
entries now appear greyed with the reason in their own label, because a disabled `<option>` on an
iOS select wheel has no hover, no tooltip and no styling hook — the reason has to be in the text or
it does not exist on a phone.*

⚠️ *The gate rides the recalc cycle rather than build time. `buildAdvDisadvQuickAdd` runs **once**,
at load, but eligibility depends on School, which the player enters later — a build-time flag would
have been right on a fresh sheet and wrong forever after. And the verdict is **not** this phase's:
where Feature 4.53 already owns an entry's rule, this asks 4.53 and supplies only the wording, so
the greyed option and the row explaining itself cannot drift into saying opposite things.*

🔴 *The Skill half was **revised the same day, on real-device feedback**, and the miss is worth
recording because the measurement behind it was sound and still pointed the wrong way. The first
cut kept the text box and only re-sorted the list behind it, reasoning from a real fact — applying
a School does not populate the Skills table for every School; an Isawa Shugenja reports five School
Skills with `#skillsBody` still empty — to the conclusion that a list would be empty for most
characters mid-build. The project owner tested it and said plainly they expected a list of their
Skills with a tick box, one selectable. The error was generalising from one School without driving
the real Apply School flow: a Hida Bushi applied properly appends all six granted Skills as rows,
so the list is populated in the normal case. It is now a single-select card list of the
character's own Skills, School-granted ones first and badged, with an `Another Skill…` card last
that reveals the validated text field — Great Potential names no School restriction in the rules,
and a Skill may be chosen before it is bought. A character with no Skills still gets the plain text
field. The School's `any one Bugei Skill` slot is deliberately skipped by Apply School and reaches
the list once the player adds it.*

⚠️ *A harness bug worth recording because it looked exactly like a product bug. The first cut drove
eligibility by writing to `#f_school`; the value snapped back on the next recalc and the entry
stayed enabled, which reads as latched state in the phase under test. It is not — `#f_school` is a
**display field**, re-rendered from `getSchoolsList()`, which is what `characterCasterLock()`
actually reads. The gate was correct throughout; the harness was driving a control that holds no
state. Recorded in the harness so the next phase does not repeat it.*

🔴 *Known residual, recorded rather than absorbed: Feature 4.5.2's own `appAlert` entry gate for
Elemental Imbalance is untouched, so an imported character carrying that entry without a Shugenja
School still meets the older hard refusal. The picker gate prevents the bad add, which is the path
the feedback concerned; fixing the rest means changing behaviour inside a function 4.5.2 owns.*

✅ *Both halves confirmed on the reporting iPhone, same day. The disabled `<option>`'s rendering —
the one thing this sandbox genuinely could not show headlessly — greys Friendly Kami with
`— Shugenja only` exactly as designed. The revised Skill picker showed a fully-applied Hida Bushi's
six School Skills plus the player's own addition, each badged, `Another Skill…` last, and a
selection committed to a correctly configured entry with a working `Change` control.*

**Phase 4.5.6 — Perceived Honor and Wealthy** · Part I
**29/29** checks, dropping to **3/12** against a build with the phase's kill-switch off and
**28/29** against one with its stylesheet dropped. Removal fixtures pass **16/16**, and surgical
removal rebuilds **byte-identical** to the Feature 4.55 build this release was added to
(`0538c466`, 2,533,897 bytes) on the first attempt. Every retained suite reads **612/612** with the
release present and removed alike; combined **641/641**. Live build: **2,546,662 bytes**,
`5a47ab73eb955fa03edddf9d16c90a4d9a0c6d90c1e679d0665320f963225ca6`.
*Two of the audit's 23 missing configuration handlers (A10 and A16) — rank-priced Advantages that
had sat in the catalogue with an editable points box and no way to record the rank it was meant to
price. Feature 4.53 had already corrected both entries' DATA; this adds the handler those corrected
prices were waiting for.*

⚠️ *The obvious approach was tried first and refused. Phase 4.5.2 exposes a public
`D45.install()` whose `rankPick` already accepts any positive integer with no cap — on paper an
exact fit for "a free-number rank, no invented cap", and a fraction of the code. Driven live, the
modal opened, the input rendered, the config stored, and the row still priced at **0 with no
summary**: `D45.refresh()` opens with `div.parentElement?.id !== 'disadvList'` and renders "This
entry belongs in Disadvantages." That is a deliberate invariant of a Disadvantage-only module, not
something to route around, so the free-number rank was added on the Advantage side instead as its
own `rankFreePick` type. More code, no fighting another phase's rules.*

⚠️ *Wealthy's pricing is the whole point of the entry and the easiest thing to get wrong. Five
ranks cost **5 XP**, or **4 XP** for a Crane/Unicorn/Imperial character — one discount off the
total, not one per rank, which is the reading the catalogue carried until 4.5.3 and which would
have priced this at 0. Rank 1 with the discount costs **0 XP**, and no minimum was borrowed from
another Advantage to avoid that, because the audit is explicit that none exists.*

⚠️ *No money is minted. The koku entitlement is stated in the row as a reminder and nothing more,
which sidesteps the whole repeated-grant lifecycle the audit warned about rather than trying to
manage it. Asserted across a confirm and five recalcs.*

🔴 *The stylesheet check took two attempts, for the SECOND phase running. The first compared the
input against the modal width — `#advConfigGrid` stretches its children either way, so it passed
with the stylesheet dropped. The second measured the input's font size — the base stylesheet
already supplies 16px, so that passed too. Measuring both builds side by side settled it: the base
sheet already gives this input its border, radius, padding, background and font, and the only
genuinely missing piece is the **label**, which inherits 10.56px at 144px wide inside a 291px modal.
Two consequences, both kept — the stylesheet was cut down to only what is actually missing rather
than restating the base, and the lesson is recorded rather than quietly fixed: "a check that cannot
go red is not a check" has now cost two phases running.*

*Perceived Honor's readout is recomputed from `f_honorRank` on every refresh and stored nowhere,
which is what makes it follow the Honor field — change Honor 5 → 8 and the perceived reading moves
to 10 on its own, while actual Honor is never written to. **D05 (Unlucky) stays open**: it is the
third entry with no handler and the only one needing dice-engine integration.*

✅ *Confirmed on the reporting device, same day. A character carrying a **fractional** Honor Rank
(3.5, from the sheet's own Points-to-Rank tracking) surfaced a case that was not deliberately
designed for: Perceived Honor at rank 5 read `Rank 5 — read as Honor 8.5 (actual 3.5, unchanged)`,
correct, since `Number(f_honorRank.value)` never assumed an integer. Wealthy's single discount was
then checked against all three eligible clans specifically — Crane, Unicorn and Imperial each read
`Rank 10 — 9 XP (clan discount −1)` on the device, identically.*

**Phase 4.5.10 — Cursed by the Realm** · Part I
**60/60** checks, dropping to **19/50** against a build with the phase's kill-switch off and
**57/60** against one with its stylesheet dropped. Removal fixtures pass **19/19**, and surgical
removal rebuilds **byte-identical** to the Feature 4.59 build this release was added to
(`a8c63d61`, 2,585,131 bytes). Every retained suite reads **766/766** with the release present and
removed alike; combined **826/826**. Live build: **2,614,082 bytes**,
`4cc3fa7885b7f43b49b55525b99ca783ed16b018ed549d006e2d3348232b87b5`.
*D01 — ten realms, one row. Four of the ten branches needed machinery that did not exist; the other
six were nearly free. This is the release where entry count and cost came apart most visibly.*

🔵 *It takes **no registry seat and re-registers nothing**, which is new. Feature 4.5.9 had to
re-register Phase 4.5's own `adv-config` contributor and delegate to the previous one — its own
ROLLBACK calls that "the most important line in this file". Measured before building: entries added
to `D45.modules` are consulted generically by `D45.modifiers()`, which that one existing seat
already reaches. The registry stays at seven, and nothing is wrapped. **Prefer this route.***

✅ *And it makes the convention's hardest rule structural. `D45.modifiers()` returns `[]` for
DAMAGE **before** consulting `D45.modules`, so a damage context never reaches this fragment at all —
proven by a check that wraps the module and asserts it is never entered. Feature 4.5.9 named the
damage leak as the easiest way to get TN reporting wrong, because a damage context carries the same
`skillName` as the attack before it. Here it is impossible rather than remembered.*

⚠️ *`realmPick` was added to `configTypes`, **lifting a constraint Feature 4.5.8 recorded as
absolute**. That release concluded no phase may ever add a type string, because 4.5.2's harness pins
the array exactly and no expected value passes both with a phase present and removed. That is true
of a **constant** expected value and false of a **conditional** one — the shape Phase 1.5 (Part G)
already uses for the registry baseline, on your own earlier ruling that an audit check exists to
notice a change rather than forbid it. The alternative was storing a Spirit Realm under a schema
called `tenetPick`, permanently, in saved character data — and D04's seven Fortunes would have
inherited the same lie. Three harnesses corrected to the conditional shape, each keeping its own
intent; 826/826 present, 766/766 removed.*

🔴 *Two bugs of mine, both caught by measurement rather than review. A **CSS class collision** that
would have shipped: the badge's modifier was `realm4510-<effect>` and Toshigoku's effect key is
literally `check`, so the badge carried the same class as this phase's own button rule. It surfaced
only because the geometry measurement printed each element's tag and class beside its box and the
button's numbers looked like the badge's. And a **harness that hung instead of failing** —
`openPreview()` was an `async` function returning the pending roll promise, so awaiting it waited
for a roll nobody had confirmed; the timeout then reported six unrelated sections as failures.*

📋 *Jigoku's resistance roll is **deferred by your decision**, not an oversight. The audit lists
"resistance roll/TN sourcing" as unresolved and the sheet models no Taint rank anywhere — the only
Shadowlands Taint in the source is a catalogue row. It ships as a badge and a reminder that says
plainly the roll is not automated, with a check on that wording. Finishing it needs exactly one
fact from a sourcebook.*

✅ *The stylesheet-dropped number is **57/60 and not lower on purpose**: exactly the three geometry
checks fail. Both builds were measured side by side before a single geometry check was written.
Two things that looked assertable were deliberately **not** asserted — `.d45-toggle-label` is
identical in both builds because 4.5.2 owns it, and the Toshigoku button is identical except for
one margin because the base sheet's `.ghost` supplies the rest. Fourth phase running that this
practice has earned its keep. A `white-space:nowrap` rule was also written, measured to change
nothing at any width, and deleted rather than shipped as CSS nobody could later tell was dead.*

⚠️ *Not real-device confirmed. **Nothing in this release has been seen on a screen** — the ten-realm
picker is the largest option list any entry has put in that modal, and Feature 4.5.4 had to fix that
same modal twice for narrower lists.*

**Phase 4.5.9 — Doubt** · Part I
**38/38** checks, dropping to **0/1** against a build with the phase's kill-switch off and
**36/38** against one with its stylesheet dropped. Removal fixtures pass **16/16**, and surgical
removal rebuilds **byte-identical** to the Feature 4.58 build this release was added to
(`e61137ad`, 2,572,964 bytes) on the first attempt. Every retained suite reads **728/728** with
the release present and removed alike; combined **766/766**. Live build: **2,585,131 bytes**,
`a8c63d61a9cd7fed740792ddd38781280b577941dc3947a07f45b2ae009d2abe`.
*D03, and the first implementation of the TN-reporting convention approved back in September. That
is why it was built second in the staged plan rather than saved: D04's Benten and Fukurokujin
branches reuse this machinery, so it is built here on the simplest consumer there is.*

🔴 *The convention's damage exclusion is the easiest thing in it to get wrong, and only measuring
showed why. A DAMAGE roll context carries the **same `skillName`** as the attack before it —
driven live before a line was written. A modifier filtering on skill name alone would have
penalised damage, which the audit explicitly forbids and which would have read as correct in
review. Filter on roll KIND first; the whole SCOPE section is a matrix over every roll kind
because of it.*

🔵 *No new registry seat, contrary to what "it changes a roll" suggests.
`registerPreRollModifier` REPLACES an entry with a matching id, so re-registering Phase 4.5's own
`adv-config` contributor and delegating to the previous one keeps Phase 1.5's baseline at seven.
Worth knowing: the obvious wrapper does NOT work here — the registry captured the function
reference at registration, so reassigning the identifier changes nothing that runs.*

⚠️ *A spell context carries no `skillName` at all (keys: `['kind','round']`), so a skill-scoped
entry cannot reach a casting roll through this pipeline. Stated rather than implied, because
"we support spell rolls" would be a claim this cannot honour.*

✅ *A stale Skill keeps its award and stops applying. Change School and a chosen School Skill may
no longer be one; Feature 4.5.3's principle that this project does not silently reprice a saved
character settles it — the 4 XP stays, the −5 stops, and the badge switches to a dashed untinted
treatment so it cannot be mistaken for the working state. That distinction is exactly what the
stylesheet-dropped build loses, which is what makes the geometry checks able to fail.*

🔴 *Two harness bugs and one bad check, all mine, all sharpened rather than worked around. The
roll driver read an empty modal because `rollWithModifiers()` is async behind Phase 3's preview
gate. The stale-transition check wrote to `#f_school` and expected a Skill to be orphaned — the
SECOND time that display-field trap has caught a harness here, and the code was right both times.
And a verdict check asserted success/fail text that this path never surfaces, so it was testing
the harness's own assumption; it now asserts what the convention actually requires — the penalty
listed once, declared already-included, with the trunk's misleading "Ten Dice Rule bonus" note
confirmed hidden.*

📋 *One pre-existing display quirk found and deliberately NOT fixed: the keep-note renders
`+ -5 bonus`. Verified it predates this phase by rolling a wounded character with no Doubt
present at all, which gives `+ -40 bonus` — every negative total modifier has done this since
Wound Penalties (Part C, Feature 3). It lives in the trunk, outside this phase's marker, and
deserves its own one-line bugfix rather than widening a release whose removal must rebuild
byte-identical.*

✅ *Confirmed on the reporting device, same day, with two wording corrections. The roll preview
and roll result text read as dense and squished — the modifier's note shrank from two clauses
across three lines to `required Raise, no benefit (TN +5)`, with the Raise-limit caveat kept once
in the row's own summary rather than repeated on every roll. The row badge dropped its
`(reported total −5)` suffix, which made it the widest thing on the row, since the preview and
result already show the adjusted total beside the rule; it now reads `Athletics — TN +5`. Both
changes are wording only, inside this phase's own fragment: suite still 38/38, combined 766/766,
removal still byte-identical to the same restore point.*

**Phase 4.5.8 — Dependant and Wrath of the Kami** · Part I
**55/55** checks, dropping to **0/1** against a build with the phase's kill-switch off and
**53/55** against one with its stylesheet dropped. Removal fixtures pass **16/16**, and surgical
removal rebuilds **byte-identical** to the Feature 4.57 build this release was added to
(`ad856e50`, 2,562,091 bytes) on the first attempt. Every retained suite reads **673/673** with
the release present and removed alike; combined **728/728**. Live build: **2,572,964 bytes**,
`e61137adcd8d6b891c17c69a7f498d936dbc36eabf5531e77fa4b36a47496104`.
*D02 and D07, the first two of the six Disadvantages left after 4.5.7 closed D05 — and the first
release of the staged plan agreed on the budget: cheapest and most reusable first, D06 Weakness
left for a fresh week.*

⚠️ *Four premises were driven live before any code was written, and THREE of them changed the
design. D45 cannot host an optional field (`readStep()` requires every step), so Dependant's
optional name and arrangement live on the row rather than in the modal. Neither entry may add a
`configTypes` string, because 4.5.2's harness pins that array exactly — and unlike 4.57's
`R453-CAT-06`, no fixture correction could rescue it, since an exact-array assertion has no
expected value that passes both with a phase present and removed. And `D45.confirm()` would have
written `Rank undefined` into Dependant's legacy display field, because its number is `points`;
the `finalize` hook exists for exactly that.*

🔵 *Wrath of the Kami shares Elemental Imbalance's `elementPick` type, and Elemental Imbalance
carries a pre-casting Willpower gate — precisely the thing this entry must not do. Sharing is
safe because every Elemental Imbalance behaviour is keyed on the NAME: grepped, `elementPick`
appears nowhere outside 209.85. Proven rather than asserted, by diffing the whole character
across configuring it.*

⚠️ *The element list was measured, not assumed. The audit asked for it to be confirmed rather
than taken from the Ring list, and it was right — `RINGS` holds four, Void not being a Ring row.
The sheet's own spell library carries Air 80, Earth 58, Fire 46, Water 43, **Void 30** and
Universal 3, so the picker offers the five castable elements and excludes `Universal` as a
category marker. **A measured decision from the sheet's own data, not a source citation** — the
one thing here a rulebook check could still overturn.*

✅ *"Roughly 2-6" stays guidance. 1 and 40 both price at face value, deliberately and with a
check that says so, because the audit is explicit that the book's examples must not become
mandatory tiers. And the catalogue's 2 no longer shows on an unconfigured row: it reads 0 and
"Needs a choice", the same rule Antisocial, Obligation and Unlucky follow.*

✅ *The geometry checks were written AFTER measuring both builds, and that immediately paid off:
the two optional inputs are 303px wide in BOTH builds, so an input-width check would have passed
with the stylesheet dropped and proved nothing. It was not written. What the stylesheet actually
supplies — a 6px flex column and the badge's box — is what the checks assert. Third phase running
that this practice has earned its keep.*

🔴 *One harness bug, sharpened rather than loosened. The isolation check first expected the whole
character to be unchanged and failed on the XP totals — but taking a 3-point Disadvantage is
SUPPOSED to move those; that is the award. Ignoring XP would have thrown away what the check was
for, so it now asserts the two XP totals are the COMPLETE list of what moves outside the entry's
own row, plus a second check that they move by exactly 3.*

*Not real-device confirmed. **Three constraints on every future `D45.install()`** came out of
this release and are written up in its ROLLBACK for whoever builds D01, D03, D04 or D06.*

**Phase 4.5.7 — Unlucky** · Part I
**32/32** checks, dropping to **2/13** against a build with the phase's kill-switch off and
**31/32** against one with its stylesheet dropped. Removal fixtures pass **16/16**, and surgical
removal rebuilds **byte-identical** to the Feature 4.56 build this release was added to
(`5a47ab73`, 2,546,662 bytes) on the first attempt. Every retained suite reads **641/641** with the
release present and removed alike; combined **673/673**. Live build: **2,562,091 bytes**,
`ad856e506e35121951923e28c907427c273eacf14a490db5d42ad446b2c3f0cf`.
*D05 — the LAST of the audit's 23 missing configuration handlers, and the only one of the final
three that needed dice-engine work rather than a badge. **With this shipped, every finding on the
Phase 4.5 audit is either built or explicitly parked.***

⚠️ *Two numbers that are easy to conflate, and the audit said so: 2 XP per rank, and ONE use per
rank per session. Rank 5 is 10 XP and **5/5 uses, not 10/10**. There is a check for that
specifically, because the award and the resource scale off the same rank without being the same
number.*

✅ *"Keep the second result even when it is higher" cannot be proven by one roll — whether the
reroll comes out higher is chance. The check invokes **twenty times** over a real exploding pool,
asserts the displayed total equals the reroll every single time, then separately asserts at least
one reroll actually came out higher so the branch was reached. Measured: **15 of 20 rerolled
higher, and all 15 were still kept.** Nothing is stubbed.*

⚠️ *Nothing is re-paid by a reroll, and the proof is structural rather than a checklist. It reuses
Phase 4.5's own `advConfigLuckRerollResult()`, which re-rolls the SAVED pool and re-applies the flat
modifiers already in the first result — it never re-enters the action, so no spell slot, Void point,
Willpower gate or limited resource CAN be charged twice. Asserted by diffing the entire character
before and after an invoke and requiring the only changed path to be Unlucky's own counter, which
would also catch a cost added years from now that nobody here thought to name.*

🔵 *This one belonged on Phase 4.5.2's D45 seam and Feature 4.56's did not — the seam's rule working
in both directions, not an inconsistency. `D45.refresh()` requires a d45 entry to sit in
`#disadvList`: Unlucky is a Disadvantage so it satisfies that and inherits the whole
rank/validate/resolve/decorate surface free, while Perceived Honor and Wealthy are Advantages and
needed the Advantage-side path.*

⚠️ *A cross-phase fixture correction, declared in this phase's ROLLBACK. Feature 4.53's
`R453-CAT-06` added an UNCONFIGURED Unlucky row and asserted its cost box read 2 — true only while
Unlucky had no handler. It now reads 0 and "Needs a choice" until a rank is picked, the same rule
Antisocial and Obligation already followed (both verified on the live build) and 209.8's own stated
principle that "a variable price is not a provisional price". The check's intent is unchanged and
now proven through the live pricing path; the corrected fixture passes both with this phase present
AND removed, which the original could not have done.*

✅ *The stylesheet check discriminated on the FIRST attempt this time — both builds were measured
side by side before the check was written, which is what the two previous phases had to learn the
hard way.*

✅ *Confirmed on the reporting device, same day, with ONE correction. All three row controls —
`−`, `+` and `Reset session` — carried a Feature 4.54 circled-i, because that phase decorates any
element with an explanatory `title=`. Right for a rules tooltip a phone cannot otherwise reach,
wrong for three small controls whose own labels sit inches away. Each description moved from
`title` to **`aria-label`**: 4.54 selects on `[title]`, so nothing is decorated now, and the
accessible name survives — a screen reader announcing "−" with no description would be useless.
`UNLUCKY457-MANUAL-06` pins all three properties and was proven able to fail by reverting the
attribute. The result-modal invoke button was never affected; 4.54 does not watch the roll modal.
**The reroll behaviour is device-confirmed; this correction is headless-verified only.***

**Phase 8 — Casting Diagnostics ("Why can't I cast this?")** · Part J
**36/36** checks, dropping to **15/36** with the phase's kill-switch off and **33/36** against the
build the Universal-spell correction replaced. The surgical removal still rebuilds
**byte-identical** to the pre-phase build (`71ab9e17`, 2,289,334 bytes both times), and the eight
other phase harnesses read identically with this phase present and removed.
*A spell entry now says whether you could cast it RIGHT NOW. The audit found that every casting
restriction in the sheet is enforced at ACQUISITION time and none at cast time — `castSpell()`
checks only whether a slot is free — so a character who since took a Bushi School or lost School
Rank kept a working Cast button for a spell the picker would now refuse. Nothing had ever asked
"can you cast this now".*

*Built as an OPEN REGISTRY, modelled on the roll pipeline's `PREROLL_MODIFIER_REGISTRY`, because
Phase 6 is a declared dependency that is source-blocked. Phase 6 will register a contributor
rather than edit this fragment, and may either add a reason or SUPPRESS one — a suppressed
blocker is rewritten as a visible "lifted" note rather than vanishing. Six checks drive that seam
directly, so the contract Phase 6 is promised is tested before Phase 6 exists. **This inverts the
roadmap's declared dependency direction** — Phase 6 will softly need Phase 8, declared in this
phase's ROLLBACK.md.*

*Reports; never blocks. The Cast button behaves identically with the fragment present or deleted.
Deliberate: shipping without the SynergyEngine means over-reporting is a known state, and
over-caution that only prints text is recoverable in a way that over-caution wired into the Cast
button would not be.*

⚠️ *Three ownership bugs in one phase, none caught by review, all three caught by the mechanical
checks — which is the argument for the end-of-phase rule made again. The CSS block was first
written between Phase 5's block and the trunk's Print banner, so Phase 5's own remover refused to
run. `feature-dependencies.py` then reported this phase's whole seam block as owned by a
`PART G PHASE 6` that does not exist, because its marker regex is case-insensitive and this
phase's own prose said "Part G Phase 6". Fixing that by rewording rewrote one line of ANOTHER
phase's comment — caught only because the removal rebuilt two bytes heavy, exactly the length
difference between the two spellings.*

⚠️ *One scope addition beyond the roadmap's six reasons: `no-slots`. It is the only refusal the
sheet actually enforces at cast time, so omitting it would have left the report silent about the
one thing that stops a cast today. And "wrong element" has no single-Element case in this sheet's
rules — it covers the Universal-spell Element pick only, rather than inventing one.*

⚠️ *Real-device testing then found the `no-slots` rule **skipped Universal spells entirely**. The
tester spent every Earth slot AND the whole shared bonus pool on Commune; `castSpell()` correctly
refused, and the report said nothing about slots. The original reasoning — "the pool spent is not
known until the player picks an Element" — was wrong: the pool is not unknowable, it is plural.
The rule now enumerates every Element the spell could be cast in and reports a **note** (some
Elements out, others open), a **caution** (all out, bonus pool left) or a **blocker** (all out,
bonus spent). An Element already ruled out by `wrong-element` is never counted as a way to still
cast it — asserted against the School's own raw deficiency field, not assumed.*

✅ *A second report from the same session — the Void "+1 Skill Rank" option appearing on a Spell
Casting Roll — turned out **not to be a regression**. It was a **stale cached build**: that
screenshot's label existed only between commits `097fe36` and `6ddf39d`. Measured against the
current build across every roll kind, including the reporter's exact ticked-first state, the
option appears only on an unskilled skill roll. No production code changed — but the coverage gap
was real, so Phase 3's harness went **43 → 50**, reading 38/50 against a build with the roll-kind
gate reverted. Worth remembering: a stale service worker can make a fixed bug look live.*

---

## 🔵 Built, not yet validated

The mechanism is built and its automated side passes. What's missing is evidence from actual
hardware — and this project's own history says that gap is where the bugs live: the first
real-device test found two in an afternoon.

### Phase 0.7 — Native Android App · Part F

Capacitor wrap; the APK compiles in GitHub Actions and the staged page hashes identically to the
website's. None of that proves how a phone behaves.

Full instructions for each test are in
`Part F — Cross-Platform Delivery/PART F — Phase 0.7 Native Android App/qa/MANUAL-TESTS.md`.
Report failures by **test number** and **what you saw**.

- [ ] **1 · It installs** — Android will refuse first and offer a settings link; that's expected
      outside the Play Store. Passes when it appears in the drawer as "L5R Sheet".
- [ ] **2 · Icon and splash look right** — samurai artwork, not a generic robot. All five element
      mons down the left, nothing clipped. Worth noting whether your launcher shows it as a
      circle, squircle or rounded square — the icon is built to survive all three and this is the
      only way to confirm it does.
- [ ] **3 · It fills the screen** — no address bar, nothing identifying it as a web page.
- [ ] **4 · It works with no network** — aeroplane mode, WiFi off, swipe it from recents, reopen.
      Everything is inside the APK, so this should work on the very first launch. If it doesn't,
      that's a real defect.
- [ ] **5 · Characters survive closing the app** — make one, force-close, reopen.
- [ ] **6 · Characters survive an app update** — *the one most likely to fail.* Needs two APKs, an
      earlier and a later build. Install over the top and check your characters are still there.
- [ ] **7 · It survives a reboot** — restart the phone, open the app, characters intact.

---

## 🟡 Started, not finished

### Phase 9 — Polish & Immersion · Part H

**Built and verified:** Clan-themed UI skins — **17/17** checks, dropping to 16/17, 15/17 and
12/17 against three scratch builds each missing one thing (a safety-colour protection, the
Void-pip recolour, and the phase's own kill-switch). Per-Clan override of the sheet's `--shu*`
tokens, plus the ink-brush mon watermark and tab-bar colophon. Three mockup rounds settled the
treatment before any code was written.

**Outstanding:**

- [ ] **School-specific flavour text** — *desktop session required.* Blocked on source material,
      not effort: the sourcebook PDFs are gitignored and desktop-only. 61 major-clan and 22
      minor-clan schools, none carrying a description field today. Scope measured and four open
      decisions written up in that phase's `DESKTOP-HANDOFF — School Flavour Text.md`.
- [x] **Void pip should stay grey** — ✅ **done.** `.void-pip` now reads `--void-slot-color`, the
      same token the Void spell-slot pip and Void bonus pip already used, rather than the brand
      accent `--shu` that every Clan theme overrides. Fixed in the trunk's own rule rather than
      as a Phase 9 exception, so it holds with no Clan applied too — and survives this phase's
      removal, which is declared in its `ROLLBACK.md`.
- [ ] **Colophon placement** — parked feedback. Looks odd sitting behind the tab bar and "sort of
      breaks" on the Identity tab; not yet root-caused.
- [ ] **Floating-button clutter** — parked feedback, and an open design question rather than a
      bug: three fixed controls now share a narrow screen and sometimes overlap readable fields.

All three feedback items are recorded in full, in your own words, in
`Part H — Sheet UI-UX/PENDING FEEDBACK — Real-Device UX Notes.md` — one now marked done, the
other two parked at your explicit instruction rather than blocked on anything.

---

## ⬜ Ahead

In Recommended Build Order. **Phase 6 is next by the roadmap's order, and remains source-blocked.**

> **Phase 5 was built ahead of Phase 6, deliberately.** The order below puts 6 at position 12 and
> 5 at position 13, but Phase 5 has no hard dependency of its own and Phase 6 turned out to be
> partly source-gated: a `SynergyEngine` has to scan techniques, and of the **338** technique
> names the School libraries reference, **98 carry no description at all** (they render a "check
> the official rulebook" fallback) while the other 240 are explicitly labelled in-code as
> *paraphrases, not exact rules text*. Building a stacking-detection engine on that would mean
> inventing rules content, which Process Requirement #3 forbids. Phase 6 is cheaper and safer
> once the sourcebooks are reachable from a desktop session.
"Partly built already" is the roadmap's own note that the machinery exists and the phase is
really an audit-and-extend rather than a fresh build — though Phase 4 is a caution about taking
that note at face value: it was marked that way and still turned out to have five of its seven
factors unbuilt. **Phase 7 deserves that caution specifically:** its JSON export/import and
schema-versioning do exist, but `AuditLog` returns zero hits anywhere in the codebase and there is
no general migration machinery — Phase 4.5.2 wrote its own private schema-3 adapter for its own
data. Both of that phase's named deliverables are absent, and it carries an unresolved scope
question (whether export/import needs a shell-aware abstraction now that 0.6 and 0.7 exist) that
is flagged *pending approval* in the roadmap and would need settling before any code.

> **The remaining Phase 4.5 configuration scope is not in this table, and is the other candidate
> for what comes next.** After 4.5.3, what is left is the audit's 23 missing configuration
> handlers and 22 review cases. All seven remaining **Disadvantages** (D01–D07) carry complete
> approved branch tables, and the rules for them were extracted into the audit itself, so they
> are implementable without the sourcebooks. The Advantages are mixed: Perceived Honor, Wealthy,
> Void Versatility, Blackmail, Darling of the Court, Way of the Land and Inheritance are ready,
> while Seven Fortunes' Blessing, Soul of Artistry's Artisan/Craft family list, Dark Paragon's
> precept contexts and Touch of the Spirit Realms' per-realm effects are still genuinely
> source-gated.
>
> The audit's UX finding (#11) is worth treating as a prerequisite rather than a follow-up: the
> modal card overflow is still unfixed, and D01's ten-realm picker and D04's seven-Fortune picker
> would go into that same modal — the one that already shipped `LOW 3 PTMEDIUM 5 PHIGH 7 PTS` to
> a real laptop.

| Phase | Name | Part | Note |
|---|---|---|---|
| 6 | Kata/Technique Synergy Detection | G | Next up |
| 7 | Data Integrity & Persistence | J | Partly built already |
| 4.6 | Alternate Paths — All Classes | I | Needs sourcebooks |
| 4.7 | Advanced Schools | I | Needs sourcebooks |
| 4.8 | Ancestors | I | Needs sourcebooks — you have this material |
| 11 | Characters List, Wizard & Save Model | K | |
| 12 | Play Mode / Management Mode Split | K | |
| 13 | Library (Sourcebook Viewer) | K | Needs sourcebooks |
| 14 | Comprehensive Search | K | Needs Phase 13 |
| 15 | UI Consistency Pass | H | Built dead last, by design |

**Phase 10 — Future Expansions (Equipment)** sits outside this count: deferred by design, not yet
assigned a Part, nothing scoped to build.

---

## Also shipped, outside the phase numbering

**The removability contract.** Phases 1, 2 and 9 were hardened so any one can be surgically
removed without touching the others — guarded hooks, per-phase comment markers, and a
`qa/feature-dependencies.py` check that attributes every reference to whichever phase owns it.
Proven by removing each in a scratch copy: the other two passed in full every time (9/9, 19/19,
14/14 in every combination). It is now the standing rule in `CLAUDE.md` for all future features,
including how to declare a genuine dependency between two of them.

**Three bugfixes** also landed outside the numbering: the School free-rank reload bug, the Spell
Slots tab visibility race, and the scroll-to-top button that shipped broken.

---

## Keeping this current

Re-export it by asking Claude to refresh the ledger — it reads the tick state from the artifact
and regenerates this file. Or tick the boxes here by hand: they are ordinary GitHub task-list
checkboxes and editing the file is enough.

`BUILD-LEDGER.html` beside this file is the source of the published artifact. GitHub will show it
as source rather than rendering it — open it locally, or use the artifact link at the top. Its
tick-boxes only persist inside the artifact runtime, so a local copy behaves as a static page.
