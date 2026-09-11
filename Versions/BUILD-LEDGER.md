# Rokugan Build Ledger

Where every roadmap phase actually stands — separating what is **verified** from what is merely
**built**, and what is built from what is **finished**.

| | |
|---|---|
| Snapshot taken | 11 September 2026 |
| Branch | `claude/admiring-euler-9kee6t` (this session; earlier snapshots were taken on `claude/practical-faraday-1sv22j`, `claude/jolly-cori-vec6xe` and `claude/relaxed-ritchie-2lsy62` — all track `main`) |
| Phase 0 build | `3a6082b4` |
| Last change | Phase 4.5 built — variable Advantages/Disadvantages now carry a pick that changes the XP maths (cost effects only; the roll-modifier half needs a ruling — see below) |
| Live site | <https://l5r-character-sheet-creator.pages.dev/> |
| Interactive version | [Rokugan Build Ledger artifact](https://claude.ai/code/artifact/316b554f-75f0-4c69-a2db-60b27e102f3b) — same content, but the tick-boxes below actually save there |

> **This file is a snapshot; the artifact is the live copy.** Ticking a box in the artifact does
> not update this file, and editing this file does not update the artifact. If they disagree,
> the artifact is newer — ask Claude to re-export, or tick the boxes here by hand. The roadmap
> at `L5R Character Sheet Phased Roadmap reorder.md` remains the single source of truth for
> *what* the phases are; this ledger only tracks *how far along* each one is.

## At a glance

| Status | Count | What it means |
|---|---:|---|
| ✅ **Fully done** | 11 | Built, and proven by something other than an assertion |
| 🔵 **Built, not validated** | 1 | Mechanism works; no evidence from real hardware yet |
| 🟡 **Started, not finished** | 2 | One half shipped, the other half parked |
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

### Phase 4.5 — Modal-Configured Advantages/Disadvantages · Part I

**Built and verified:** the COST half — **34/34** checks, dropping to **17/34** with the phase's
kill-switch off and to **32/34** and **29/34** against two deliberately-bugged builds (one that
forgets which Ring was blessed, one that discounts Ranks nobody bought). The surgical removal
rebuilds **byte-identical** to the pre-phase build (`9dbaf6c6`, 2,322,320 bytes both times), every
touched source file returns identical to `originals/`, and all **ten** other harnesses read
identically with this phase present and removed.

*Elemental Blessing now discounts its chosen Ring's two Traits by 1 XP per Rank bought, and six
severity-tier entries (Lord Moon's Curse, Luck, Magic Resistance, Antisocial, Enlightened Madness,
Cast Out) set their own cost from a picker. Nothing is ever silently defaulted — an unconfigured
entry is flagged and contributes nothing.*

*Every price offered is quoted from the entry's own library description, and a harness check audits
that mechanically — 15 prices across 6 entries — so "no rules content was invented" is measured
rather than claimed. Entries the library prices as a RANGE ("2-4 points", "8-30") are deliberately
left alone.*

**Outstanding:**

- [ ] **The roll-modifier half** — *needs your ruling, not more work.* Chosen by the Oracles, Friend
      of the Elements and Friendly Kami are configurable roll effects, and a roll effect belongs in
      `PREROLL_MODIFIER_REGISTRY`. But **Phase 1.5 asserts that registry holds exactly six
      contributors**, and its own source comment names Phase 4.5 as one that must not change it.
      Registering a seventh takes Phase 1.5 from 34/34 to 33/34; the only repair is editing a
      previous phase's recorded baseline, which `CLAUDE.md` forbids doing unilaterally. **The
      question: may Phase 1.5's baseline go from 6 to 7?** Probably yes — it is an audit phase meant
      to *notice* pipeline changes, not forbid them — but it is your call. After that, the work is
      data plus one guarded registration.
- [ ] **`skillPick` / `traitPick`** — parked, not blocked. The entries that would use them (Great
      Potential, Doubt) have no cost consequence, so they would record a value nothing reads.
- [ ] **Real-device pass** — never opened on hardware. The per-entry row wraps and the picker gained
      a note line neither of which anyone has seen at phone width.

⚠️ *The mandatory end-of-phase re-verification earned its place again. `feature-dependencies.py`
reported six of this phase's own CSS rules as owned by `PART J PHASE 5` — whose remover would have
deleted them — because this phase's CSS comment explained its placement with the words "Part J Phase
5's removal script…", and `MARKER_RE` is case-insensitive, so marker-shaped prose in a comment is
parsed as a real marker. Exactly the trap Phase 8 hit and `CLAUDE.md` records. Reworded, it reports
clean. Review had not caught it.*

---

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
