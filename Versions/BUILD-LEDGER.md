# Rokugan Build Ledger

Where every roadmap phase actually stands — separating what is **verified** from what is merely
**built**, and what is built from what is **finished**.

| | |
|---|---|
| Snapshot taken | 12 September 2026 |
| Branch | `main` |
| Phase 0 build | `27b57eff` (canonical LF build; 2,476,062 bytes) |
| Last change | Phase 4.5.2 Disadvantages point release: authoritative Social Skill targeting added to Antisocial, full audit, eleven approved Disadvantages, schema-3 migration, integrated QA, and surgical-removal proof |
| Live site | <https://l5r-character-sheet-creator.pages.dev/> |
| Interactive version | [Rokugan Build Ledger artifact](https://claude.ai/code/artifact/316b554f-75f0-4c69-a2db-60b27e102f3b) — same content, but the tick-boxes below actually save there |

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

## At a glance

| Status | Count | What it means |
|---|---:|---|
| ✅ **Fully done** | 12 | Built, and proven by something other than an assertion |
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
factors unbuilt.

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
