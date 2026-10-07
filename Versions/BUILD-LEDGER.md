# Rokugan Build Ledger

Where every roadmap phase actually stands — separating what is **verified** from what is merely
**built**, and what is built from what is **finished**.

## Current update — 7 October 2026 (Claude): Phase 4.5.28 device corrections

**Your Phase 4.5.28 check (7 October): 21 Pass, 1 Not run** on Windows (Edge), with Test 6 on the
iPhone. The [checklist](https://claude.ai/code/artifact/bd563c7b-96c9-40f9-a76f-4672aa92026e) is closed. Your rulings: proceed as recommended; keep item 3.

- **3.4, a real bug:** the "Not in effect" line did not appear when you changed Calligraphy's Rank.
  The bonuses were withheld correctly (that is decided when you roll), but the line was redrawn only by
  a hook the Skills table's own Rank box never reaches. Fixed: the line and the greyed-out list now
  follow every recalculation, and Honor's and Status's boxes (which trigger none at all) are watched
  too. My checklist walk had forced a recalculation after each change; it now types into the boxes as
  you do, and on the live build it reproduces your finding (and the same gap on Honor, your 4.2).
- **1.2 and 1.4, Wary's tick was redundant:** Spot ambush now applies Wary's +1k1 directly, as Recall
  does; Wary is a tick on no roll.
- **1.6, kept:** Spot ambush needs no Notice Emphasis; owning Notice only adds its re-roll of 1s.

**Built and verified on `claude/phase-4-5-28-device-corrections`, in the release's own fragment; it
merges on your word.** QA: own harness **71/71**; full suite **4,450/4,450**; removal still restores
4.5.27's build exactly, with **4,389/4,389** retained; 17 pinned variants (reverting the fix fails
exactly the new typed-Rank check); five boundaries; remover fixtures, ownership scan and removal chain
pass; the typed checklist walk passes 22/22 here and fails 5 on the live build. Build **3,587,753
bytes**, SHA-256 `d711f1ce…`. See the [README](PART%20I%20%E2%80%94%20Phase%204.5.28%20Situational%20Entry%20Buttons%20and%20Gates/README.md).

**Your re-check after the merge:** a short re-test doc (Wary applied; the typed Rank, Status and Honor).

## Previous update — 7 October 2026 (Claude): Phase 4.5.28 Situational Entry Buttons and Gates

**Your Phase 4.5.27 check (7 October): 31 Pass, 2 Fail** on Windows (Edge), with 9.1 and 9.2 then passed
on the iPhone. The [checklist](https://claude.ai/code/artifact/e242e507-13ce-43aa-a557-65e11c263f1d) is closed. The two Fails and your rulings:

- **6.1, Imperial Scribe ungated:** it needs Status 2+ and Calligraphy 4+. Gated now, to Phase 4.5.5's
  standard, with **Sacrosanct** (Honor 6.0+, the only other Advantage that states a requirement).
- **1.5, Wary felt clunky** (the check itself behaved): one **Spot ambush** button on Wary's row, which
  opens the one roll the book names (Investigation (Notice) / Perception against Stealth (Ambush) /
  Agility) with +1k1 already ticked; no Wary tick on ordinary Investigation rolls.
- **Precise Memory:** a **Recall** button that opens the Intelligence roll with +1k1 already applied, not
  a tick.
- **Parked, the resist entries' clutter** (Balance, Clear Thinker, Heartless, Irreproachable on every
  roll): the code works; reviewed at Phase 15 or the end of the project, with your three ideas — a closed
  "Resisting?" line, limiting each to the book's rolls, or a row badge such as "Resist Temptation" that
  opens its own roll. In memory, the roadmap and the reminders below.

**Phase 4.5.28 is built, verified and merged to `main` on your word (7 October), and live.**

| Entry | Now |
|---|---|
| Wary | **Spot ambush** button: "Spot ambush — Investigation (Notice) / Perception" at your Investigation Rank (Rank 0: Perception alone, no explosions), Wary ticked (you can untick it); a Notice Emphasis keeps its re-roll of 1s |
| Precise Memory | **Recall** button: "Recall — Intelligence Trait Roll" with Precise Memory +1k1 applied |
| Imperial Scribe | Greyed out in the picker, "— needs Status 2+ and Calligraphy 4+"; an unqualified row says what is missing, and its +1k0 and Free Raise are withheld |
| Sacrosanct | Greyed out, "— needs Honor 6.0+"; an unqualified row says so |

Status and Honor are read from their Points boxes, re-read on every change; nothing is repriced or saved.
The buttons also work in Play mode.

**QA, 7 October:** own harness **69/69** (13/37 on today's `main`: it can fail); full suite
**4,453/4,453** (the 4,384 retained checks with this release present, plus 69); actual scratch removal
restores Phase 4.5.27's build exactly (`26eb8d8c…`, 3,573,333 bytes) and the retained suite passes
**4,389/4,389** on it; 16 pinned mutation variants fail exactly as pinned; five boundaries pass
(4.5.27's harness with this release 122/122 and without it 127/127, the registry 53/53, the eligibility
gates 41/41, dependency boundaries 49/49); remover fixtures 22 pass, one Windows symlink skip; the
checklist walked through the real controls on the local build, 22/22; ownership scan exit 0; removal chain
11/11; inventory unchanged. Build **3,586,935 bytes**, SHA-256
`b7ee968c48fccb650e43816797f49ebb06f60755dcdb9c880b979ff855be55df`. Two retained checks corrected,
test-only and declared: 4.5.5's `GATES455-GATE-04` counts the two new gated entries (40/41 before, 41/41
both ways), and 4.5.27's harness asserts the ruled behaviour when this release is present. The first
full-suite run caught a real defect of this release, fixed before release (an earlier Spot ambush roll
could get Wary back). See the [README](PART%20I%20%E2%80%94%20Phase%204.5.28%20Situational%20Entry%20Buttons%20and%20Gates/README.md).

**Live, 7 October (18:34 UTC):** merged by fast-forward at `ec7f42a`; the deployed page matches the committed build plus its app head byte for byte (3,592,584 bytes, SHA-256 `4d80bae2…`), service worker `6e5f652849ea4a5c`; **285/285** focused checks on the downloaded page (this release 69, Situational Roll Entries 122, the eligibility gates 41, the registry 53); the checklist walked through the real controls on the live site: **22/22**. Your check is the [Situational Entry Buttons and Gates — Test Checklist](https://claude.ai/code/artifact/bd563c7b-96c9-40f9-a76f-4672aa92026e) (Tests 1–6, about 10–15 minutes). iPhone and Windows: Not run.

**Usage (Claude Pro, read from the meter, account-wide):** see the cost table "Phase 4.5.28 and your
4.5.27 results — recorded Claude usage".

## Previous update — 7 October 2026 (Claude): Phase 4.5.27 Situational Roll Entries

**You approved the assessment "all as recommended" (7 October).** That adopted the revised build order
(recorded in the roadmap's newest amendment), approved Phase 4.5.27 as scoped, and took three rulings:
Imperial Scribe's Free Raise on Calligraphy shown as a no-dice "Free Raise available" line; Balance adds
only its own +1k0 with a reminder to add your Honor Rank; Balance is hidden while your Failure of Bushido
is the Honor tenet.

**Phase 4.5.27 is built, verified and merged to `main` on your word (7 October).** Nine Advantages that only recorded their cost and
text now work in the roll preview, as ticks under **Declare for this roll → Advantages**: unticked on every
roll, offered only where the book's roll type fits, applied to that roll (and a reroll of it) alone, never
saved.

| Entry | Offered on | Effect | Book |
|---|---|---|---|
| Balance | Skill, Trait, Ring and dice-tray rolls | +1k0 resisting Intimidation or Temptation while adding your Honor Rank | Core p.146 |
| Clear Thinker | Skill, Trait, Ring and dice-tray rolls | +1k0 on a Contested Roll against someone confusing or manipulating you | Core p.147 |
| Heartless | Skill, Trait, Ring and dice-tray rolls | +1k0 resisting Courtier, Sincerity or Temptation used to persuade, seduce or change your mind | The Great Clans p.136 |
| Irreproachable | Skill, Trait, Ring and dice-tray rolls | +1k0 on a Contested Roll where the other side uses Temptation | Core p.151 |
| Dangerous Beauty | Temptation rolls | +1k0 with someone of the opposite sex | Core p.147 |
| Imperial Spouse | Social Skill rolls | +1k1 with a member of an Imperial family | Core p.150 |
| Imperial Scribe | Social Skill rolls; skilled Calligraphy rolls | +1k0 with a shugenja or an artisan; "Free Raise available" on Calligraphy | Imperial Histories p.67 |
| Precise Memory | Intelligence Trait Rolls | +1k1 recalling something exactly | Core p.152 |
| Wary | Investigation rolls using Perception | +1k1 detecting an ambush | Core p.155 |

- **Left out, as agreed:** Imperial Spouse's +0.5 Status and Imperial Scribe's purchase requirements (both
  wait for the Glory, Status and Honour review); adding Honor Rank to resistance rolls (a rule for every
  character, same review); Advantages a Technique grants (an Ikoma Bard adds a 0-XP Precise Memory row);
  Identity gender.
- **Catalogue wording reconciled with the books:** Clear Thinker and Heartless.
- **Known shared limit:** the dice tray and a hand-typed weapon row both roll as a plain manual XkY, so the
  four resistance ticks appear there too, exactly as Heart of Vengeance's and Jurojin's already do.

**QA, 7 October:** own harness **127/127** (17/63 on today's `main`: it can fail); full suite
**4,389/4,389** (the 4,262 retained checks plus 127); actual scratch removal restores today's live build
exactly (`b6b8bc00…`, 3,561,844 bytes) and the retained suite passes **4,262/4,262** on it; 12 pinned
mutation variants fail exactly as pinned; three boundaries pass (the registry's and Heart of Vengeance's
suites with this release removed, 53/53 and 91/91; dependency boundaries 30/30); remover fixtures 20 pass,
one Windows symlink skip; ownership scan exit 0; removal chain 11/11; inventory unchanged. Build
**3,573,333 bytes**, SHA-256 `26eb8d8c1f0c61c015831e5b426010d470d49df1a2d86975f5fc9f3b58fa416f`. Two
retained provider-list checks set aside `situational-entries`, as every earlier provider's release did
(measured on this build before the correction: 4.5.15 52/53 and 4.5.16 90/91, failing only RD-NO-PRODUCTION-PROVIDER and HV-PROVIDER-REGISTERED; corrected: 53/53 and 91/91 with this release present and removed). See the
[README](PART%20I%20%E2%80%94%20Phase%204.5.27%20Situational%20Roll%20Entries/README.md).

**Live, 7 October (14:00 UTC):** merged by fast-forward at `86e6d49`; the deployed page matches the committed build plus its app head byte for byte (3,578,982 bytes, SHA-256 `626d579a…`), service worker `0459cec5c5578655`; **271/271** focused checks on the downloaded page (this release 127, the registry 53, Heart of Vengeance 91); the checklist walked through the real controls on the live site: **28/28**. Your check is the [Situational Roll Entries — Test Checklist](https://claude.ai/code/artifact/e242e507-13ce-43aa-a557-65e11c263f1d) (Tests 1–9, about 15 minutes). iPhone and Windows: Not run.

**Usage (Claude Pro, read from the meter, account-wide):** weekly 0% → 3% for the assessment; 3% → **10%** (5-hour 19% → 70%) for the build and full QA; **11%** (5-hour 80%) after the merge, live check, checklist doc and these ledgers, 14:02 UTC; **12%** (5-hour 88%) after the published ledger page was read in full and refreshed, 14:05 UTC. So the release took about **9 points** of the week all in (3% → 12%), the assessment 3.

## Previous update — 7 October 2026 (Codex): Phase 4.7 complete; recorded costs

**Phase 4.7 is complete for the agreed scope as of 7 October 2026.** All three releases are merged and live: nine Core Advanced Schools, fourteen supplemental records, and the two missing Basic Schools. The separately removable Paragon correction is included. The owner confirmed the final three retests (1, 9a and 9b), after reporting the other tests passed. Full corrected QA: **4,262/4,262**; live focused QA: **226/226**.

Nezumi remains recorded-only, Advanced-rank Path replacement remains unsupported, and Technique effects remain manual; these are boundaries of the agreed delivery. iPhone visual/layout testing is unconfirmed and non-blocking by the owner’s decision. FT-01–FT-10 stay in final review, including FT-07 Blackmail at Phase 15 or beyond. No next phase is started by this closeout.

Cost evidence is consolidated under [What each phase has cost](#what-each-phase-has-cost); exact Phase 4.7 cost cannot be isolated from the recorded account-wide readings.

The owner authorized the remaining Phase 4.7 work. Two separate removable releases
add fourteen supplemental Advanced School records and the missing Hiruma Scout
and Yotsu Bushi Basic Schools. Both releases were merged to main on the owner's instruction on 5 October
at `d39348a` (supplemental commit `f9e3b88`), and both pull requests are merged.
Live deployment was verified on 6 October: exact committed HTML plus the PWA
head, service worker and published assets match; **156/156 supplemental and
38/38 Basic checks** pass against the downloaded live page. Evidence:
`PART I — Phase 4.7.2 Missing Basic Schools/qa/live-verification.json`.

Thirteen supplemental entries support current human characters. Nezumi Berserkers
is recorded but unavailable because the sheet has no Nezumi character model.
The full catalogue has 23 Advanced School records, 22 playable with the current
model, and 69 source-cited Technique references. Technique effects remain manual.
The two Basic Schools add ten more Technique references and normal starting
packages; no outfit is invented for Hiruma Scout. Tiger's Yotsu is labelled with
its Heroes of Rokugan setting and does not replace canonical Ronin Yotsu.

The supplemental gate checks now handle prior qualifying Shugenja training,
Void casting only with Ishiken-Do, distinct Ring/Weapon counts, configured Allies
and Great Potential, and actual Inquisitor's Strike possession. Kakita Artisan
training requires an earned rank. Five existing Hiruma Scout Path clauses now
resolve. Akodo Tactical Master's Advanced-rank replacement Path remains outside
the existing Basic-rank Path interface; this boundary and Nezumi support must
not be described as completed playable functionality.

**Verified 5 October:** full combined suite **4,230/4,230**; supplemental **156/156**, Basic **38/38**, dependency checks **189/189**, and all 16 mutation variants match their reviewed pins. Each remover has 23 passing fixtures and one Windows symlink skip. Both removal orders restore main exactly; retained suites pass with either release removed. Build, ownership and structural checks pass. See each release’s qa/final-verification.json. The full runner is the Missing Basic Schools release's
qa/current-suite-runner.js. Worked normal and fringe cases are in each new
release's MANUAL-TESTS.md. The owner's 6 October report and its exceptions
are recorded below; automated narrow-view checks are not an iPhone pass.

**Owner ruling: FT-07, Scorpion Instigator's four Blackmail purchases, is deferred
to Phase 15 or beyond.** All other FT-01–FT-08 feedback stays recorded for final
review. The intermittent Spell Slots issue was observed in ChatGPT's Windows
preview/file explorer; the earlier Safari issue is resolved, and a shared cause
is unconfirmed. No feedback feature has been silently implemented here.

Next proposed work remains the audit's nine situational roll-preview entries,
after its scope rulings. Do not move to that work merely because this catalogue
is built. The published Claude ledger has not been refreshed; preserve its saved
ticks before any future publication. Account-wide Codex usage on this resumption
was 36% weekly / 29% five-hour used; it is not a clean release cost or comparable
to the historical Claude allowance projection. After final verification the account
read 51% weekly / 23% five-hour used; the five-hour window changed during the work.

### Owner functional retests confirmed — 7 October 2026

The owner explicitly reran and confirmed all three follow-ups work as expected:

- **Test 1 — Minor Clan Defender / configured Paragon: Pass (owner report).**
- **Test 9a — Kolat Assassin: Pass (owner report).**
- **Test 9b — Legion of Two Thousand: Pass (owner report).**

These three functional follow-ups are closed. With the earlier report that the
other tests passed, the delivered Phase 4.7 scope is owner-confirmed. Device and
browser were not specified; no iPhone visual/layout pass is inferred.
FT-07 Blackmail remains deferred to Phase 15 or beyond; FT-09 Honor/Glory/Status
and FT-10 Kobune Captain remain end-of-project reviews. Nezumi is recorded-only,
Advanced-rank Path replacement is unsupported, and Technique effects remain
manual. This confirmation does not expand those delivered boundaries or approve
implementation of the next audit phase.

### Paragon correction verified — 7 October 2026

Minor Clan Defender now requires a Paragon with a confirmed, valid Bushido tenet
for new entry. Any of the seven tenets qualifies; merely adding the Advantage or
cancelling its configuration does not. Existing Advanced School records, earned
ranks and saved Techniques are preserved. This is a separately removable fix in
BUGFIX — Minor Clan Defender Paragon Gate. Kobune Captain and the Honor/Glory/Status behavior remain unchanged.

Full corrected suite **4,262/4,262**; actual scratch removal restores the exact previous build and all **4,230/4,230** retained checks pass. Focused checks **32/32**, dependency checks **40/40**, retained dependency checks **189/189**, five pinned mutation variants, and ownership checks pass. Removal fixtures: 20 pass, one Windows symlink skip.

The correction was merged to main on 7 October at 9dc8d01 (PR #7). Live
deployment is verified: **226/226 focused checks** on the served page, exact
committed source plus PWA head/assets, and service-worker build 77e83cad44e77520.
See the fix's qa/live-verification.json. The owner confirmed the three functional retests on 7 October (above).
Latest full runner: this fix's qa/current-suite-runner.js; detailed evidence is in
qa/final-verification.json and qa/regression-verification.json. The prior merged
release's live verification (194/194, 6 October) remains historical evidence for
d39348a. Owner functional retests passed on 7 October; iPhone visual checks remain unconfirmed.

### Owner test feedback — 6 October 2026

The owner reports that the other Phase 4.7 tests worked as described, with these
qualifications. The device/browser for this report was not specified; do not infer
an iPhone pass or turn the aggregate report into evidence for every individual case.

- **Minor Clan Defender: confirmed eligibility defect.** An unconfigured Paragon
  qualified in the deployed release. The correction requires a chosen, valid Paragon tenet; any of
  the seven virtues is acceptable. This is a focused corrective follow-up, separate
  from the deferred reviews below. Retest blank/cancelled configuration, a valid
  Compassion choice, and save/reopen. Correction work is on
  codex/fix-minor-defender-paragon; merged and verified live on 7 October.
- **Imperial Scion / test 2: owner reports pass.** Include its fractional Status
  threshold and the distinction between Rank and Points in the existing final
  Glory/Honor/Status review (FT-09); preserve current behavior meanwhile.
- **Kobune Captain / test 3: owner reports pass.** Keep the current gate. Review
  whether a non-Mantis character's appointment is adequately represented by the
  narrative confirmation, or needs a Clan/GM-exception rule, after the entire
  project (FT-10). The owner's setting concern is a review request, not a new rule.
- **Kolat Assassin and Legion of Two Thousand: reruns passed on 7 October.** The
  owner had trouble following the earlier brief instructions on 6 October, then
  confirmed both worked after using the expanded sections 9a and 9b. The earlier
  report was a request for clearer instructions, not a reported functional failure.

## Previous update — 4 October 2026 (Codex): Core Advanced Schools merged to main

The owner accepted Phase 4.5.26's Windows results and authorized Phase 4.7's
first release. Branch `codex/phase-4-7-core-advanced-schools` starts at main
`9c332ae`. It adds the Core's **nine Advanced Schools and 27 Technique references**.
The source index's old count of eight is corrected: Elemental Guard was missing.

Entry checks printed requirements, the owner's Multiple Schools gate, and the
Core p.151 Bushi/Shugenja exclusion. Story conditions require confirmation.
Training freezes the preceding basic School, starts at Advanced Rank 0 and
earns one Advanced rank at each next Insight Rank, capped at three. Prior
Techniques remain. Further basic training requires GM permission after Rank 3.
The saved progression uses format 5, with older saves migrated on access.

**Scope:** all Advanced Technique effects are manual references, including
casting bonuses and extra slots. This follows the technique-text release;
the SynergyEngine remains separate work. No new starting Skills, Traits,
equipment or spells are granted. The UI states the manual-effects limitation.

**Verification:** release suite 4,036/4,036; final removed-build retained suite
3,840/3,840; 14 pinned mutation variants and three boundary builds as expected.
Final removal restores the exact 3,489,469-byte baseline; 24 remover tests
(23 passed, one Windows symlink skip), ownership scan and build drift check pass.
See the release README and `qa/final-verification.json`. **Merged to main by
fast-forward at `71a15cb`, 4 October, on the owner's instruction.** The 96-hour
audit found 12 locally created branches: 11 already included, this release now
included too. Recent remote refs were also checked. See the release's
`MERGE-AUDIT.md`; no branch deletion or history rewrite. On 4 October the
owner reported that all other tests passed, with the Scorpion Instigator
Blackmail purchase-count concern and intermittent Spell Slots issue below left
open. Screenshots show Windows and the ChatGPT preview; they do not establish
every individual test result. No iPhone pass was reported. The previous dice
release's iPhone layout check remains Not run and non-blocking by the owner's decision.

### Owner feedback — review after project completion (4 October 2026)

**Status: recorded for later fine-tuning, not approved for implementation now.**
Review with Phase 15 and the relevant feature owners once the project is complete.
These IDs also appear in the roadmap's Deferred and declined section.

- **FT-01 — Prevent duplicate Skills from the picker.** When a Skill is already
  on the character sheet, remove it from the Add from Skill List dropdown.
  Review restoring the option after removal and how distinct specialisations
  such as different Lore Skills are identified; do not merge legitimate distinct Skills.
- **FT-02 — Show future options in Management.** Let players inspect options
  they do not yet qualify for, with their requirements and what is still missing,
  so they can plan progression. Visibility must not itself grant eligibility.
- **FT-03 — Career progression suggestions.** Explore suggestions based on the
  character's current state and a player-markable checklist of steps towards a
  chosen path. This is a proposal to scope later, not a committed feature.
- **FT-04 — Identity gender or confirmation.** For gender-restricted Paths,
  Skills or Schools, review accepting a matching Identity gender OR the relevant
  confirmation checkbox. If a qualifying gender is recorded, an extra tick should
  not be required; if it is absent, confirmation is required. Review ambiguous or
  conflicting entries explicitly rather than silently deciding them.
- **FT-05 — Optional wizard gender and age.** Offer both immediately after the
  character's name; allow either to be skipped, and allow later editing like Name.
- **FT-06 — Advanced School discoverability.** The owner expected Advanced
  Schools in Identity's Add School section because they represent another School
  attended. The existing roadmap explicitly placed the picker in Techniques,
  alongside progression and its Technique references. Separate Advanced ranks
  explain the distinct training flow, but do not require a separate UI location.
  Review a shared entry point, relocation or signposting; no UI change requested now.
- **FT-07 — Scorpion Instigator Blackmail count (rules/test review).** The owner
  believes Blackmail must be purchased four separate times, in addition to the
  confirmation checkbox. Current implementation checks for a Blackmail Advantage
  and confirmation of four distinct people; it does not count four purchases.
  Verify the purchase rule against the source and then review the gate, costs and
  test 8 together. Keep this open; do not treat the owner's concern as a verified rule
  or record test 8 as an unqualified pass. Earlier chat instructions describing
  automatic counting of entered targets overstated the current implementation.
- **FT-08 — Intermittent missing Spell Slots.** On Windows inside ChatGPT's
  preview/file explorer (not Safari),
  the owner temporarily could not see Spell Slots for a Moshi Shugenja despite
  having added spells. It later became visible again. The owner clarified that
  the earlier Safari Spell Slots issue has been resolved. Safari was mentioned
  only because its former underlying cause might also explain this separate
  ChatGPT issue; no shared cause is established and the Safari issue is not reopened.
  Screenshots show the Shugenja identity and
  a partial navigation strip, not the full hidden state or cause. Record as
  unresolved and not independently reproduced in ChatGPT; recovered visibility
  does not establish a fix.
  At final review, check caster School application, character load/switching,
  Play/Management changes, carousel navigation and viewport changes inside
  ChatGPT's Windows preview/file explorer. Compare the previous Safari fix only
  as a possible diagnostic lead. Evidence: `C:/Users/jcrow/OneDrive/Pictures/Screenshots 1/`
  files `Screenshot 2026-10-04 135728.png` and `Screenshot 2026-10-04 135743.png`.

- **FT-09 — Imperial Scion within the Glory/Honor/Status review (6 October).**
  Test 2 works as described. At the end of the project, review its Status 4.0 gate,
  fractional boundary, editable Rank versus Points and Technique costs as part of
  the already-deferred review of all three attributes. No behavior change now.
- **FT-10 — Kobune Captain and Clan membership (6 October).** Test 3 works.
  Keep current eligibility and the Mantis command-appointment confirmation. At the
  end of the whole project, check the source and setting implications of a
  non-Mantis captain, and whether a Clan restriction or explicit GM exception is
  appropriate. An exceptional appointment being narratively rare does not itself
  establish a rules restriction. Do not implement a Mantis-only gate now.

The order remains the other 14 Advanced Schools, then the two missing Basic
Schools, before the audit's situational preview entries (after its scope rulings).
Core p.245 requires a separate progression engine, correcting the roadmap's old
assumption that basic progression would continue unchanged. This first release
does not complete Phase 4.7 or its later Technique automation.

**Usage:** Phase 4.7 began at 24% weekly / 56% five-hour used. Resumption on
4 October read 64% / 6%; several five-hour windows elapsed. These account-wide
Codex readings are not a clean per-release cost and cannot be substituted into
the historical Claude projection below. No reset credit was redeemed.

## Previous update — 3 October 2026 (Codex): dice entries merged and deployed

The owner approved continuing after the independent assessment. Built on
`codex/phase-4-5-26-dice-entries` from main `6e6da0b`; **merged on the owner's word,
3 October, at `72523fe`. Deployed and verified; iPhone confirmation still owed.**
Two separately removable layers: **Rank 0 Skill Rolls Explode** and **Phase 4.5.26
Dice Rolling Entries** (Crab Hands, Crafty, Sage, Sensation and Gaijin Name).
Coverage includes the table, Untrained Skills list, relevant weapon attacks and
existing reroll paths. Purchased ranks and character data are unchanged.

**Measured:** focused harnesses 19/19 and 110/110; 17 mutation variants match their
reviewed pins; four disabled/removed-feature boundaries pass. Both removers restore
their preceding build hashes; each has 20 passing fixtures and one Windows symlink
fixture skipped. **Full retained suite: 3,840/3,840**, no earlier harness changed.
Both removal orders restore main byte for byte; structural inventory, all 504
existing seam keys and seven contributors survive. Preview/result fit at 390px
and 1440px, with screenshots inspected. The final 110-check harness gives 22/110
on original main. The Rank 0 fix remains 19/19 with the entries removed.
Release build: **3,489,469 bytes**, SHA-256
`7f57135bddb8c4c1bc306c8841f52ed0eb9c03292f873e7302a8b13ccda8bd49`.
The newest runner is the dice-entry folder's `qa/current-suite-runner.js`.

**Live page:** 129/129 focused checks (19 fix + 110 entries), exact expected PWA
bytes, service-worker build `545ec25de79b1c69`. Evidence is in the dice-entry
folder's `qa/live-verification.json` and `qa/live-qa.log`.

**Owner's test, 3 October:** the combined checklist is **Windows: Pass (owner
report)**. The owner supplied 15 screenshots and confirmed Windows-only testing.
The images support the four Rank 1 effects, attacks, unchanged purchased ranks
and Gaijin Name's single-explosion limit; no discrepancy found. See the release's
`OWNER-TEST-REVIEW.md` for exactly what is visible versus reported.

**Accepted by the owner, 3 October:** the Windows pass is sufficient to proceed
to Phase 4.7's first release (Core's nine Advanced Schools). The remaining iPhone
check is for visual/layout suitability and is **non-blocking**. Its checklist
still reads **Not run**; Windows success is not recorded as an iPhone pass.
The published Claude ledger has not been refreshed: this session has no docs
connector. Before publishing, read the live artifact fully and preserve its ticks.
Phase 0.7's seven Android checks remain optional.

**Independent planning correction:** the previous eleven projection rows add to
156–300 percentage points of a Claude week. Phase 4.6's complete delivery cost was
30 points, not the 21-point implementation subset. Allowing 30–40 instead of 20–30
for Advanced Schools gives **166–310 points**; a further 0–10 points of uncertainty
gives the assessment's provisional **166–320** range. This is historical Claude
allowance modelling, not measured Codex cost or a promised finish date. The dice
scope was budgeted at 8–12 historical Claude points because attacks and rerolls
need coverage. That work is inside the audit allowance, not an additional row.

The proposed build order remains: Core's nine Advanced Schools, then the other
two Phase 4.7 releases together; then audit mechanisms, starting with the nine
situational preview entries after the scope rulings. Reassess cost after this
release's device check; do not subtract an unfinished release as though delivered.

**Usage:** Codex's fresh build-window baseline was 0% weekly and 0% five-hour used.
The earlier assessment readings and Claude's 94% belong to different windows or
providers and are not comparable. After QA the meter read **14% weekly used and
89% five-hour used** (account-wide, before final commits/merge/device review).

**3 October, after merge/live verification:** 22% weekly and 37% five-hour used.
The last handoff reading was 17%/8%; the five-hour window reset between the build
and that handoff, so do not subtract from the previous window's 89%. These are
account-wide readings. The owner's iPhone check is still outstanding; the
subsequent Windows-only pass is recorded above.

## Previous update — 2 October 2026 (night, final): reassessment after 4.5.25; next phase proposed

> **Usage: 94% of this week** (read from the meter). About 6% is left until the 7 October reset (about
> 02:00 BST). That is too little for a release with full QA, so nothing more is built this week.

**You asked for the next phase with the biggest impact on the project, built as efficiently as possible.**
I reread this ledger, the roadmap, the audit and the projection below, and measured one new fact.

**Proposed next (needs your approval): Phase 4.5.26, the dice-path entries, first after the reset.**

- **What it does:**
  - **The parked Rank 0 exploding-10s bug**, fixed as its own layer, on your word. An untrained roll from the
    Skill table should not explode.
  - **Crab Hands, Crafty, Sage and Sensation** roll their untrained Skill family as Rank 1: Weapon, Low,
    Lore and Perform Skills. They use Soul of Artistry's tested wrapper.
  - **Gaijin Name:** on a Social Skill roll, each die explodes only once.
- **The new fact:** Gaijin Name's rule (Core p. 159, read from the PDF) changes the same exploding-dice code
  as the Rank 0 bug, and the four lifts go through the same Skill roll. The audit listed Gaijin Name as a
  mechanism the sheet does not have yet.
- **Why first:**
  - **One release on the dice code instead of three.** Each change would otherwise need its own pass of
    regression tests on the dice engine.
  - **It closes your only parked dice bug.**
  - **It is small and well-defined:** about **5–7%**, with every rule printed.
  - **It suits the start of a week**, leaving Phase 4.7 a clean run.
- **Then, the same week:** Phase 4.7, the Core Rulebook's 9 Advanced Schools (7–10%). Then its other two
  releases, kept together so the engine is read once.
- **Then:** the rest of the audit, by mechanism, the most entries first, starting with the roll-preview
  ticks (9 entries in the sheet).

**The single most efficient thing is free and yours: decide the audit's scope.** The audit is the largest
block left (40–70% of a week). Two cuts each save allowance:

- GM-agreed choices as a note on the row instead of a picker;
- no Naga, Nezumi or Station entries.

Together they save 10–15%.

**Free in the meantime, all in one batch:**

- whether to unpark the Rank 0 bug;
- the audit's scope;
- its three rulings (Student of the Past, Trials of the Imperial City, Wanderer);
- Weakness's boundaries;
- the three defaults in the kickoff;
- the iPhone ⋯ → Print test, which sizes 11.1.

**Alternatives I weighed:**

- **4.7 first:** bigger but dearer, and both fit the week.
- **The roll-preview ticks first:** they wait on your scope ruling.
- **11.1 first:** unknown until the Print test.
- **The bug alone:** it leaves a second pass on the dice code.

The next session starts from [CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-07.md](CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-07.md).

## Previous update — 2 October 2026 (night, last): Phase 4.5.25 confirmed; the projected length of the project

> **Usage: 94% of this week** (read from the meter; your figure agrees). The week resets on 7 October at about
> 02:00 BST, so about 6% is left until then.

**Phase 4.5.25 is confirmed on your iPhone (all checks passed) and merged.** The Uncentered and Void Kiho
note is closed: it was a Void **Kata** ("Striking as Void"), not a Kiho, and Uncentered bars only Void Kiho.
Measured headlessly, the sheet's Kiho list does bar Void Kiho once Uncentered is taken.

### How long the project should take — AN ESTIMATE AND A GUIDE, NOT A FACT

**Most likely about three more weeks of allowance from the 7 October reset: finished around the week of
28 October. The range is about 21 October to early November.**

It assumes you use most of each week's allowance and are free for the iPhone checks. Weeks you use less
push the date back. It is re-derived from this week's measured costs, and it will change as rulings land and
releases come in over or under estimate. Treat it as a picture of the road ahead, not a deadline.

**What this week tells us.** This week's 94% bought:

- Phase 4.6's three releases (214 Paths);
- Phase 6's first release and two bugfixes;
- the Advantages and Disadvantages audit;
- Phase 4.5.25;
- their docs, checklists and ledgers.

Recent releases have come in at or under their estimates. 4.5.25 cost about 5% all in: +3% to build, +1% for
Uncentered, +1% for the merge and the checklist. Its estimate was 5–8%.

| Work left | Share of one week | Why |
|---|---:|---|
| The rest of the Advantages and Disadvantages audit: 4.5.26 untrained Skills (with the Rank 0 bug), automation by mechanism, the 42 missing entries, 25 pickers | 40–70% | 4.5.25 is done (5% all in). The scope you choose is the biggest lever |
| 4.7 Advanced Schools (23, plus 2 Basic Schools) | 20–30% | Three releases, as Phase 4.6 took (+21% for three) |
| D06 Weakness and Hotei | 10–20% | Need your rulings first |
| Phase 6's SynergyEngine | 15–30% | Every School Technique now has text |
| 11.1 Export to PDF | 3–15% | Sized by your free iPhone Print test |
| Phase 9's School flavour text | 8–15% | 83 Schools, in our own words |
| 13 Library and 14 Search | 25–50% | A PDF viewer inside a single-file app; the least certain row |
| Phase 7's audit log | 5–10% | Your ruling: later |
| Parked backlog and device feedback | 10–20% | Small items that add up |
| End-of-project reviews (Glory, Status and Honour; Manage as a screen; Print on the list; the lost-favour Ancestor) | 5–15% | Review first; building depends on what you decide |
| 15, the UI consistency pass (last) | 15–25% | Audit first |
| **Total** | **about 160–300%** | 1.6–3 weeks of allowance; about 2–4 weeks with margin for device corrections |

**Calendar view** (weeks reset on Wednesdays at about 02:00 BST):

| Week | Likely work |
|---|---|
| 7–14 October | 4.5.26 untrained Skills, then Phase 4.7's Core Advanced Schools, then the first audit mechanisms |
| 14–21 October | The rest of 4.7, more audit mechanisms, and 11.1 if your Print test says it is small |
| 21–28 October | The missing entries and pickers you choose, the SynergyEngine, flavour text |
| 28 October – 4 November | 13 and 14, the end-of-project reviews, 15 last |

**What would shorten it:**

- a smaller audit scope (GM-agreed choices as row notes instead of pickers; no Naga, Nezumi or Station
  entries), which saves 10–15%;
- a usable PDF from ⋯ → Print on your iPhone, which makes 11.1 about 3%;
- every ruling given in one batch.

**What would lengthen it:**

- the Library (13) proving harder in a single-file app;
- device corrections after a release;
- weeks with less allowance used.

**For other Claude sessions:** use this table to size releases against the allowance left in the week. Rank by
impact per unit of allowance, and re-derive the estimate rather than quote it.

## Previous update — 2 October 2026 (night, latest): Phase 4.5.25 Clan and School Prices, built on a branch

> **Usage: 92% of this week**, read from the meter (Claude can now read it directly, so no reading is
> needed from you): 89% at this session's start, so the handoff below cost **+3%** (86% → 89%); 89%
> after the assessment; **92%** after the build. The week resets on 7 October at about 02:00 BST.

**You approved Phase 4.5.25 with four rulings (2 October):**

- a cost you typed is kept and marked;
- **a Management visit is the purchase**: prices are provisional while you are in Management and follow
  everything you change in that visit (Clan, family, a School added before or after the row); leaving
  Management, or finishing the wizard, fixes them;
- every School you hold at that moment counts, but nothing is re-priced afterwards;
- a character saved before this release is priced once, from its starting School, and fixed.

**Built on branch `claude/phase-4-5-25-clan-prices`**, cut from the audit branch, so merging it brings
the audit too. **Not merged: merge on your word**, then the iPhone checklist.

- **40 entries priced:** the 38 picker-less Core entries in the audit's table, plus Friend of the
  Brotherhood (Dragon 4), which the audit missed, and **Uncentered** (your later ruling: 2 for a Clan
  monk, a [Monk] School of a Clan; 4 for a Brotherhood monk; new purchases only, so no saved character
  loses XP).
- **Left out:** Blackmail and Way of the Land, whose pickers own the row (the audit missed both prices).
- **[Artisan] is its own School type** (your ruling; Core p. 222 tags the Tsi Smith [Artisan]).
- **"Crab and bushi characters" means either group.** Measured: the book's "Crab and Mantis characters"
  can only mean either.
- **QA:** own harness 45/45 (15/45 on `main`); 10 variants pinned exactly; both boundary builds green;
  full suite **3,711/3,711**; removal rebuilds `033a0bf2…` byte for byte. Live build `319f4f48…`, 3,479,860
  bytes. See the [README](PART%20I%20%E2%80%94%20Phase%204.5.25%20Clan%20and%20School%20Prices/README.md).
- **Device checks:** [MANUAL-TESTS.md](PART%20I%20%E2%80%94%20Phase%204.5.25%20Clan%20and%20School%20Prices/MANUAL-TESTS.md), Tests A–G, about 14 minutes; the
  checklist doc follows the merge.
- **For you, none blocking:**
  - the iPhone Print test;
  - the audit's four rulings, and Weakness;
  - whether the Rank 0 bug joins 4.5.26.

**Next:** 4.5.26, untrained Skills, first after the reset (about 8% of this week is left).

## Previous update — 2 October 2026 (night, later): reassessment after the audit; next phase proposed

> **Usage: 86% of this week** (your reading after the audit): **+6** from 80%. This reassessment,
> the ledgers, the roadmap and the next-session kickoff are not yet measured; their row below reads
> "To be read". The week resets on 7 October at about 02:00 BST.

**You asked for the next phase with the biggest impact on the project, built as efficiently as
possible.** I reread this ledger, the roadmap and the audit.

**Proposed next (needs your approval): Phase 4.5.25, Clan and School prices**, the audit's cheapest
win.

- **What it does.** 39 Advantages and Disadvantages in the sheet cost less, or give more XP, for some
  Clans, families or School types. For example, Clear Thinker costs a Dragon 2, and Brash gives a Lion
  4. Today the sheet charges every one at the catalogue price. One shared step would price each row
  from the character.
- **Why first:**
  - **The most entries for the least usage.** 39 entries, about a quarter of the catalogue, in one
    release. Every character who qualifies gets the right XP total.
  - **It fits this week.** About 11% will be left after this handoff, and my estimate is **5–8%**
    with the docs, the merge and your checklist. Unused allowance is lost at the reset; a bigger
    release would stop part-way and need re-reading next week.
  - **No rules ruling, low risk.** Every price is printed in the books. It copies Heart of
    Vengeance's tested price-on-refresh, which every row passes through: added, typed, loaded or
    imported. The wizard reads the row's own cost.
  - **Mechanisms before entries.** Missing entries added later arrive working instead of
    record-only, so nothing is built twice.
- **Three defaults for you to confirm:**
  - a cost you typed by hand is kept and marked, not overwritten;
  - with several Schools, any School's type counts;
  - existing characters are re-priced when opened, before they are marked saved.
- **It leaves out** the effects of those 39 entries (only their price changes), the 4 missing entries
  with Clan prices, the untrained-Skill lift and every picker.

**Then:**

1. **4.5.26, untrained Skills.**
   - Crab Hands, Crafty, Sage and Sensation would roll their untrained Skills as Rank 1, the way Soul
     of Artistry does.
   - On your word, the parked **Rank 0 exploding-10s bug** would come with it as its own fix. You
     parked it until the next change to dice rolling, and this is that change, in the same code.
   - This week if your reading allows; otherwise first after the reset.
2. **Phase 4.7, the Core Rulebook's 9 Advanced Schools, first after the 7 October reset**, with the
   whole week's allowance.
3. **The rest of the audit, by mechanism, the most entries first.** Then the missing entries by book,
   each with its mechanism. Then the pickers.
4. **Then, as you choose:** Phase 6's SynergyEngine; 11.1; 13 and 14; Phase 9's flavour text; D06
   and Hotei once ruled; 15 last.

**Free in the meantime:**

- the audit's four rulings, and Weakness's;
- the three defaults;
- whether to unpark the Rank 0 bug;
- one test: try ⋯ → Print on your iPhone and tell me whether the PDF is usable. That decides whether
  11.1 is about 3% or about 15%.

**Alternatives I weighed:**

- **Phase 4.7 now** is too large for what is left this week.
- **Prices and the lift together** would save 2–3% of overhead, but it is over budget, and the lift
  belongs with the Rank 0 bug.
- **The missing entries first** would mostly arrive record-only.
- **Waiting for the reset** would waste about 11%.

**Projected length, re-derived (AN ESTIMATE, not a measurement):**

| Work left | Share of one week | Why |
|---|---:|---|
| The audit's follow-ups, if built in full for the sheet's characters | 45–75% | Prices; untrained Skills; automation by mechanism; 42 missing entries; 25 pickers |
| 4.7 Advanced Schools (23, plus 2 Basic Schools) | 20–30% | Three releases, like Phase 4.6 (+21% for three) |
| D06 Weakness, Hotei | 10–20% | Need your rulings |
| Phase 6's SynergyEngine | 15–30% | Every School Technique now has text |
| 11.1 Export to PDF | 3–15% | Sized by your iPhone Print test |
| Phase 9's School flavour text | 8–15% | 83 Schools, in our own words |
| 13 Library and 14 Search | 25–50% | A PDF viewer inside a single-file app |
| Phase 7's audit log (later) | 5–10% | Your ruling: later |
| Parked backlog and feedback | 10–20% | Small items that add up |
| 15, the UI consistency pass (last) | 15–25% | Audit first |

That is **about 1.5–3 weeks of allowance. With margin for device feedback, it is 2–4 weeks, most
likely 3.**

- The audit adds about half to three-quarters of a week that had never been measured.
- **How much of the audit you want built is now the biggest lever on the project's length.**
- One release or two (about 10–15%) could be saved by:
  - keeping the GM-agreed choices (Bad Fortune, Inner Gift, Gaijin Gear, Haunted, Jealousy) as a note on
    the row instead of a picker;
  - leaving out the entries that need rules the sheet doesn't have (Station, shapeshifters, Naga and
    Nezumi).

The evidence is in the roadmap's "Reassessment after the Advantages and Disadvantages audit —
2 October 2026 (night)". The next session starts from [CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-03.md](CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-03.md).

## Previous update — 2 October 2026 (night): the Advantages and Disadvantages audit

> **Usage: 86% of this week** (your reading after the audit): **+6** from 80%.

**You asked for the full sourcebook audit, building nothing.** It is published as a doc, [Advantages and
Disadvantages — Sourcebook Audit](https://claude.ai/code/artifact/485b7ec0-c6cd-4c63-b9e6-3e5c4ecf74a6), with a repository copy in
[PART I — Phase 4.5 Sourcebook Audit of Advantages and Disadvantages/AUDIT.md](PART%20I%20%E2%80%94%20Phase%204.5%20Sourcebook%20Audit%20of%20Advantages%20and%20Disadvantages/AUDIT.md), on branch `claude/adv-disadv-audit`.

**What it found:**

- **The sheet has all 131 of the Core Rulebook's Advantages and Disadvantages, plus 8 from supplements:
  139 in all.** 44 have a picker and 6 more are handled without one; **89 only record their cost and
  text.**
- **65 are missing, all from supplements: 44 Advantages and 21 Disadvantages.** 42 can be taken by the
  characters the sheet builds; 23 are for Naga or Nezumi only. Strongholds of the Empire alone adds 24
  (city Citizen and Stigma pairs).
- **Pickers still needed: 25** (9 for entries already in the sheet, 16 for missing ones), plus 4 missing
  heirlooms and weapons that fit the existing Inheritance and Sacred Weapon pickers.
- **94 could be automated with what the sheet already does** (60 of the 89, and 34 of the 42), each matched
  to a working example.
- **The cheapest single win:** 43 entries cost less or more for some Clans or Schools, and the sheet charges
  all of them at the catalogue price.

**Rulings it asks for:** Weakness (already pending); Student of the Past (no cost printed); Trials of the
Imperial City (its text repeats Imperial City Stigma's); Wanderer (no type printed); and whether to add
entries for Naga, Nezumi or the Emerald Empire's Station rules, which the sheet does not have.

## Previous update — 2 October 2026 (evening): the Technique text and name fix confirmed on your iPhone (13/13)

> **Usage: 80% of this week** (your reading after your check): **+3** from 77% for the ledger updates, the
> ledger page read and republished, the live-site walk and the checklist doc. The week resets on 7 October
> at about 02:00 BST.

**Your check ([Technique Text and Name Fix — iPhone Checklist](https://claude.ai/code/artifact/7bcdcc1a-bbe2-4341-852a-abc75fd8e59c)): all 13 checks passed**, by your
report. The doc records Pass for Tests A to D (9 checks: your existing Usagi Bushi and Yoritomo Courtier,
the Toku Bushi's Rank 4, the Doji Courtier's Rank 5). Tests E to G (the Kikage Zumi, the Mantis Brawler and
Kitsune Shugenja, Play mode) have no pick in the doc and are recorded as passed on your word; the same four
checks held in my live-site walk. The seven Android checks stay Not run.

**Phase 6's first release and BUGFIX — Technique Name Clashes are confirmed.** Every School Technique in the
sheet now has its own text. Phase 6 stays under Started, not finished: its SynergyEngine is a later release.

**Proposed next (needs your approval): Phase 4.7 Advanced Schools, the Core Rulebook's 9 first**
(pp. 247–250), with your ruling that the Multiple Schools Advantage is required. Phase 4.6's requirement
engine and School-keyed record are reused. With 20% of the week left, the Core 9 is likely a full week's
remainder or more; if you would rather spend the rest of this week cheaply, **the Advantages and
Disadvantages audit alone** (no building) is the alternative: it measures the one gap nobody has sized yet.

## Previous update — 2 October 2026 (later): the Technique text and the Technique name fix, built on a branch

> **Usage: 77% of this week** (your reading at the merge, 2 October): **+11** from 66%. That covers
> the assessment, the release and its docs, ledgers and merge; the session reached your five-hour
> limit once and resumed. The week resets on 7 October at about 02:00 BST.

**What you approved:** the Technique text release with the Toku fix. **Your three rulings this
session:**

1. **Saved characters' rows are updated.** A School Technique row that still holds text the sheet
   wrote, now known to be wrong or missing, is rewritten when the character is opened. A row you
   edited is never touched.
2. **The Doji Courtier fix is included** (below).
3. **Phase 4.7: an Advanced School requires the Multiple Schools Advantage**, as the roadmap's scope
   says, not Core p. 245's reading. This settles the reminder "Ruling before Phase 4.7 starts".

**Found this session, measured on the live build before building:**

- **A second wrong description, on a Great Clan School.** "The Gift of the Lady" is the Doji
  Courtier's Rank 5 (Core Rulebook p.111) and the Hitomi Kikage Zumi Order's Rank 1 (Imperial
  Histories 1 p.215). The sheet held the name twice, and the monk's text won, so **a Rank 5 Doji
  Courtier read a tattoo Technique.** It is older than Phase 4.6 and the only repeated name.
- **Technique text is saved with the character.** Each Technique row keeps the text it was granted
  with. Without an update on load, your existing Usagi Bushi and Yoritomo Courtier would have kept
  "not yet available" after the release.

**Built on branch `claude/phase-6-technique-text`, in two layers, and merged to `main` on your word (2 October), before your iPhone check.**

- **[BUGFIX — Technique Name Clashes](BUGFIX%20%E2%80%94%20Technique%20Name%20Clashes/README.md)**
  - The Doji Courtier and the Kikage Zumi each show their own Gift of the Lady.
  - The Master of Games' Technique is renamed "Forge Your Own Fate (Master of Games)", so the Toku
    Bushi's name is free.
  - The load check now covers every School Technique name, described or not, and any name two
    Schools share.
  - Saved characters' stale rows are rewritten on load.
- **[Phase 6's first release (Part G): School Technique Text](Part%20G%20%E2%80%94%20Combat%20%26%20Roll%20Engine/PART%20G%20%E2%80%94%20Phase%206%20School%20Technique%20Text/README.md)**
  - The 72 texts, in our own words, each ending with its book and page.
  - No text shares a run of 8 or more words with the book. A check script measures this, reading
    the book text from a scratch folder only.

**QA:**

- The full suite passed **3,666/3,666**: the 3,619 retained checks, the fix's 26 and Phase 6's 21.
- **On today's `main`,** the fix's harness reads 13/26 and Phase 6's 9/21.
- **Variants:** The fix's 10 variants and Phase 6's 8 each turn their harness red exactly where pinned (discovery, then a pinned run), and each layer's two boundary builds (Phase 12's modes off, Phase 4.6 off) read fully green.
- **Removal:** removing both layers rebuilds `main`'s build byte for byte (`aa5c55d9…`, 3,432,964
  bytes); removing Phase 6 alone gives the fix's build (`b17b8584…`, 3,442,633 bytes).
- **Removal tests:** 21 in each folder pass (one skipped: Windows refuses symlinks). The
  dependency checker is clean for both layers.
- The new build is `033a0bf2…` (3,464,120 bytes).

**Your check** is [MANUAL-TESTS.md](Part%20G%20%E2%80%94%20Combat%20%26%20Roll%20Engine/PART%20G%20%E2%80%94%20Phase%206%20School%20Technique%20Text/MANUAL-TESTS.md),
about fifteen minutes on the live site after the merge:

- your existing Usagi Bushi and Yoritomo Courtier;
- a Toku Bushi at Rank 4;
- a Doji Courtier at Rank 5;
- a Kikage Zumi;
- a Mantis Brawler and a Kitsune Shugenja;
- Play mode.

## Previous update — 2 October 2026: Phase 4.6 confirmed on your iPhone (13/13) and complete; next phase proposed

> **Usage: 66% of this week** (your reading, 2 October): **+6** from 60% for the docs and ledgers, the
> audit published as a doc, the merge, the checklist doc and the live-site walk. The week resets on
> 7 October at about 02:00 BST.

**Your check ([Phase 4.6 Third Release — iPhone Checklist](https://claude.ai/artifact/8PKQsDUZrAmxmPdPkehM4n)): 13 of 13 passed**: a
Path from another book (3/3), any Minor Clan School but not the Mantis (2/2, with your screenshots), a
Rank 6 Path (3/3), a Skill-count requirement (2/2), a family requirement (2/2) and the ronin Paths kept
out (1/1). The seven Android checks are marked Not run. **Phase 4.6 is complete for your books** and
moves to Fully done: 214 Paths, confirmed in three iPhone checks (19/19, 21/21 and 13/13).

**Found from your screenshots, and measured on 2 October:**

- **72 School Techniques lack their own description**, across **20 Schools: every Minor Clan School
  and every Mantis School** (all five Techniques of most of them). 71 show the "Full description not
  yet available" text you saw under your Usagi Bushi's and Yoritomo Courtier's Techniques; the 72nd,
  the Toku Bushi's Rank 4, shows another Path's text (the defect below). **All 72 are found in the
  books:** the sourcebook index located 65, and a search of the Core Rulebook's text on 2 October
  found the other seven.
- **A defect from the third release:** the Book of Air's Master of Games (a ronin Path, recorded only)
  names its Technique "Forge Your Own Fate", the same name as the Toku Bushi's Rank 4 Technique, which
  had no description. So a Toku Bushi now shows the Master of Games' text (a Social bonus) on a
  Technique that really cancels an opponent's two highest damage dice (Core Rulebook p. 222). It is
  the only such name, checked against every School Technique on the live site. Nothing else is
  affected. The fix (rename the Path's Technique; make Phase 4.6's name check cover every School
  Technique, described or not) is folded into the proposal below rather than made unasked.

**Proposed next (needs your approval): Phase 6's first release, the missing School Technique text.**
The 72 descriptions in our own words with book and page, the Toku Bushi fix with it; every one is on
Core Rulebook pp. 120–122 or 216–227, The Great Clans pp. 166–169 or Secrets of the Empire p. 238. It
is small, needs no ruling,
and is the text Phase 6's synergy engine must have before it can scan anything. **Then Phase 4.7
Advanced Schools**, the Core Rulebook's 9 first: the books hold 23 and the sheet none, and it needs
your ruling on the Multiple Schools gate first (recommended: follow Core p. 245, which asks for no
Advantage). **Then** the full sourcebook audit of Advantages and Disadvantages that your September
prompt describes; it has not been run (the sheet has 73 and 66). The reasons, the alternatives and
the order after that are in the roadmap's "Reassessment after Phase 4.6 — 2 October 2026"; the next
session starts from [CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-02.md](CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-02.md).

## Previous update — 1 October 2026 (late night): Phase 4.6's third release and the audit, merged on your word

> **Usage: 60% of this week** (your reading): **+9** from 51% for the third release and the audit,
> before the docs and ledgers.

**Phase 4.6's third release** ([README](PART%20I%20%E2%80%94%20Phase%204.6%20Alternate%20Paths/README.md)), built on branch
`claude/phase-4-6-alternate-paths-r3` on your word and **merged to `main` on your word (1 October), before the
iPhone check**:

- **The other books' Paths: 175 from 13 books.** 136 can be taken in the sheet. 39 are recorded only:
  ronin, Naga, peasant and geisha Paths, which no School in the sheet can take; they are kept with their
  Techniques for a later phase and never offered.
- **The audit you asked for** ([AUDIT.md](PART%20I%20%E2%80%94%20Phase%204.6%20Alternate%20Paths/AUDIT.md), also published as the
  [Phase 4.6 Alternate Paths Audit](https://claude.ai/artifact/4o2YWKYiA3KcaVGuST7i9C) doc): every page of all 16 books that says
  "Replaces:" or "Technique Rank:", every Path heading, Secrets of the Empire's own School Index and the
  24 wiki pages in the sourcebook index. **Every Path in your books is now in.** Thirteen Paths come from
  books you do not have (eleven from The Second City). The audit is what found the 21 Ronin Paths of the
  Core Rulebook and Enemies of the Empire, which the Core Rulebook calls a kind of Alternate Path.
- **Three Schools some Paths name are not in the sheet** (Hiruma Scout, Akodo Tactical Master, Kaiu
  Siege Master); those Paths still work in the Schools it has. They are candidates for Phase 4.7.
- **Found by the testing:** the sheet files the Mantis with the Minor Clans, so "any Minor Clan School"
  (the Minor Clan Alliance Diplomat) now leaves them out; by that Path's day they are a Great Clan.
- **Your iPhone check** is the [Phase 4.6 Third Release — iPhone Checklist](https://claude.ai/artifact/8PKQsDUZrAmxmPdPkehM4n)
  (MANUAL-TESTS.md Tests F to K, about seventeen minutes, a Result dropdown under each), walked
  headlessly on the live site after the merge: all 13 checks hold. Once it passes, **Phase 4.6 is
  complete for your books**.

| Current snapshot | Value |
|---|---|
| Build (branch) | **3,432,964 bytes**, SHA-256 `aa5c55d9c3563801e2f0a31b892f341558852b171839d3b646f4dc3a319b9cdb` |
| Own harness | **175/175** (124 earlier + 51 new); **121/175 on `main`** |
| Full QA | **3,619/3,619**, zero failed suites (3,444 retained + 175); no retained check changed |
| Variants | **44/44** broken builds fail exactly as pinned (17 new); Phase 12's modes off and Phase 4.5.2 off both 175/175 |
| Removal | All three releases together, still **byte-identical** to the build before Phase 4.6 (`4551175e…`); six earlier releases' live removal tests and the chain pass |
| Live site | Tests F to K walked headlessly on the live site after the merge: all 13 checks hold, no page errors; the live page matches the local build apart from line endings |
| Device | **Merged before the iPhone check** (`main` at `7c01d0c`), which is owed: [Phase 4.6 Third Release — iPhone Checklist](https://claude.ai/artifact/8PKQsDUZrAmxmPdPkehM4n) |

**Proposed next (needs your approval), after your check:** Phase 4.7 Advanced Schools,
the Core Rulebook's 9 first (pp. 247–250), after your ruling on the Multiple Schools gate (recommended:
follow Core p. 245, which asks for no Advantage).

## Previous update — 1 October 2026 (night, later): Phase 4.6's second release confirmed; the Core Paths done

> **Usage: 51% of this week** (your reading): **+1** from 50% for the live-site walk, the checklist and
> the ledgers.

**Your check ([Phase 4.6 Second Release Checklist](https://claude.ai/artifact/7r7RjJqyNJfQN4ZQa8cpwX)): 21 of 21 passed**: several Paths in one
School (4/4), a Champion's Rank of your choosing (4/4), the Topaz Champion (2/2), Glory and the Imperial
waiver (5/5), and a later Path not counting as a School Rank (6/6). **All 27 of the Core Rulebook's
Alternate Paths are in and confirmed on your iPhone.** Phase 4.6 stays under Started, not finished:
the other 12 books' Paths remain.

**Proposed next (needs your approval): Phase 4.7 Advanced Schools, the Core Rulebook's 9 first**
(pp. 247–250), as the roadmap orders it after 4.6's Core releases. **One ruling first:** Core p. 245
does not ask for the Multiple Schools Advantage to enter an Advanced School, while the roadmap's 4.7
scope does; recommended: follow the book. The alternative is Phase 4.6's next books (about 109 Paths
across the other 12).

## Previous update — 1 October 2026 (night): Phase 4.6's second release built and merged; your checklist

> **Usage: 50% of this week** (your reading at the merge): **+5** from 45% for the second release.

**Phase 4.6's second release** ([README](PART%20I%20%E2%80%94%20Phase%204.6%20Alternate%20Paths/README.md)), built on branch
`claude/phase-4-6-alternate-paths-r2` on your approval, **merged to `main` on your word (1 October), before the iPhone check**:

- **The other 9 Core Paths** (pp. 256–257): the Emerald and Jade Magistrates (any Bushi, Courtier or
  Shugenja School, Rank 4), the Imperial and Jade Legionnaires (Rank 2, Glory 2), and the five Champions,
  which replace **a Rank you choose** in a small window. Appointments are listed as things to confirm with
  your GM. Glory reads the Glory block's Rank field, as Honor does. A character of the Imperial Clan
  may ignore one Skill requirement of either Magistrate Path. The Topaz Champion keeps the Technique it
  replaces.
- **Several Paths in one School** (Core p. 246): the dropdown now adds and removes; each Rank is replaced
  once, and a Path you hold from another School is not offered again.
- **A later Path is not a School Rank** (p. 246): Kiho Mastery, the Kiho purchase cap, a shugenja's spells
  and the casting breakdown, and Mirumoto's Rank-scaled Techniques count without it; the School Rank
  field and the Technique list are untouched.
- **Because the Topaz Champion is open to every School, the dropdown now shows for every character with
  a School.**

| Current snapshot | Value |
|---|---|
| Build (branch) | **3,319,796 bytes**, SHA-256 `ab1363ad0300200d40fad7f2cf9737ec886e21d87d95808c287bd3d6f5c1095d` |
| Own harness | **124/124** (80 first-release + 44 new); **56/124 on the first release's build** |
| Full QA | **3,568/3,568**, zero failed suites (3,444 retained + 124); no retained check changed |
| Variants | **27/27** broken builds fail exactly as pinned (13 new); Phase 12's modes off and Phase 4.5.2 off both 124/124 |
| Removal | Both releases together, still **byte-identical** to the build before Phase 4.6 (`4551175e…`); six earlier releases' live removal tests and the chain pass |
| Live site | Tests A to E walked headlessly on the live site after the merge: all hold |
| Device | **Merged before the iPhone check**, which is owed: [Phase 4.6 Second Release Checklist](https://claude.ai/artifact/7r7RjJqyNJfQN4ZQa8cpwX) |

## Previous update — 1 October 2026 (night, later): Phase 4.6's first release confirmed on your iPhone

**Your check ([Phase 4.6 iPhone Checklist](https://claude.ai/artifact/8ChDqk3nrwnhupozzTpyaG)): 19 of 19 passed**, with no notes: Crab
Berserker (5/5), Empress Guard's Rank per School (3/3), a Path kept with its School through Multiple
Schools, save and reopen (3/3), the monk Kiho rule (3/3), the Honor lock (2/2), and your existing
characters (3/3). The seven Android checks are marked Not run (no Android phone). **Phase 4.6's first
release is confirmed** and moves to Started, not finished: its second release is next. Your ruling in
the checklist: Honor requirements read the Honor block's Rank field, as built, with Glory, Status and
Honour to be reviewed as a whole at the end of the project.

**Proposed next (needs your approval): Phase 4.6's second release** — the Core Rulebook's other 9
Paths (Emerald and Jade Magistrates, the Imperial and Jade Legions, the five Champions), which need
Courtier Schools as a type, Glory and appointments as requirements, and "any Rank" Paths; and more than
one Path in the same School (Core p. 246: each basic Rank replaced once, a later Path not a School Rank).

## Previous update — 1 October 2026 (night): Phase 4.6's first release built and merged; your checklist

> **Usage: 43% of this week** (your reading, 1 October): **+7** from 36% for Phase 4.6's first
> release (the engine work, the 18 Paths, 80 new checks, two full-suite runs), its merge and the
> checklist. The week resets 7 October at about 02:00 BST.

**Phase 4.6 Alternate Paths, first release** ([README](PART%20I%20%E2%80%94%20Phase%204.6%20Alternate%20Paths/README.md)): the Core Rulebook's
**18 Great Clan Paths** (pp. 251–255), each Technique in our own words with its page. Built on branch
`claude/phase-4-6-alternate-paths` and **merged to `main` on your word (`317ebca`), before the iPhone
check**, which is owed: the [Phase 4.6 iPhone Checklist](https://claude.ai/artifact/8ChDqk3nrwnhupozzTpyaG) (six tests, about 20
minutes; the seven Android checks are at its end, optional).

What changed in the engine, by rebinding trunk functions from one fragment:

- **A Path stays with its School** (the kickoff's risk 1): the record is keyed by School, and older
  saves are carried up by a Phase 7 format step (saves are now format 4).
- **"Any Crab Bushi School" clauses**, from each School's type tag; **a Rank per clause** (Empress
  Guard: Kakita 3, Daidoji 4); **Honor, a named Disadvantage and "one Skill of a kind"** as
  requirements.
- **Your Core p. 246 ruling:** a monk's first Path grants one Kiho at its Rank, a later Path none.
- **A load check** of every clause, so a Path that reaches no School is reported, never silent.

Two choices made in the build, open to your word: Honor requirements read the Honor block's
**Rank** field (the sheet's features disagree on Rank and Points; the book says "Honor Rank"); and
Deathseeker is read as printed (Honor Rank 5 **and** the Dishonored Disadvantage). The first is asked
in a comment in the checklist.

| Current snapshot | Value |
|---|---|
| Build (`main`) | **3,300,280 bytes**, SHA-256 `d8f889ef56c9f24750cdc5451ead73c7e28c474bc7374da453583f1e6227199c` |
| Own harness | **80/80**; **16/80 on the build before it** (it can fail) |
| Full QA | **3,524/3,524**, zero failed suites (3,444 retained + 80 new) |
| Retained checks corrected (test-only) | Four harnesses pinned save format 3: Phase 7's (27 checks), Features 4.5.13 and 4.5.14, Phase 11. Each now expects one more only while Phase 4.6's step is registered; all pass on both builds |
| Removal | **Byte-identical** to the build before it (`4551175e…`); 21 remover tests (1 symlink skip); chain 11/11; six earlier releases' live removal tests pass with it in the tree |
| Variants | **14/14** broken builds fail exactly as pinned; Phase 12's modes off and Phase 4.5.2 off both 80/80 |
| Live site | Tests 1 to 5 of the checklist walked headlessly on the live site after the merge: all hold |
| Device | **Merged before the iPhone check**, which is owed: [Phase 4.6 iPhone Checklist](https://claude.ai/artifact/8ChDqk3nrwnhupozzTpyaG) |

## Previous update — 1 October 2026 (evening): your re-test passed; Phase 4.6 started

> **Usage: 36% of this week** (your reading, 1 October): **+1** from 35% for the merge of the
> Ancestor Corrections fix, the Re-test Checklist and the ledger. Phase 4.6's first release is
> measured from here. The week resets 7 October at about 02:00 BST.

**Your re-test ([Re-test Checklist](https://claude.ai/artifact/3kAFwsszUbfWjzprt4nqys)): 9 of 9 passed.** BUGFIX — Ancestor
Corrections is **confirmed on your iPhone**: Seppun's gift no longer brings "Make an Unskilled roll
Skilled" onto a skilled roll, ordinary Void offers are unchanged, the Ancestor's i is the
Advantages' i, and the Ancestor list follows the Clan picker. With that, **Phase 4.8 is complete for
the books supplied** and moves to Fully done. The seven Android checks (Test 2) are still not run:
they wait for an Android phone.

**All three forms of this ledger are brought up to date** in this update: this file,
`BUILD-LEDGER.html` and its published page ([Rokugan Build Ledger](https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk)), which
had not been refreshed since the 1 October cloud session.

**Phase 4.6's first release has started, on your word**: the Core Rulebook's 18 Great Clan paths
(pp. 251–255) with the engine work they need, and the monk Kiho rule of Core p. 246 you ruled in.

## Previous update — 1 October 2026 (laptop, later): your iPhone results, four rulings, and BUGFIX — Ancestor Corrections

> **Usage: 35% of this week** (your reading, 1 October), after the Ancestor Corrections fix: **+6**
> from 29%, which was taken after the Multiple Schools fix, its merge, the iPhone checklist and the
> ledger (24% before them). Phase 4.6's first release starts from 35%.

**Your iPhone results** ([iPhone Test Checklist](https://claude.ai/artifact/TqMLexNAa9gDgwVkHGB13y)): **47 of 52 passed.** Phase 7
(6/6) and the Multiple Schools fix (5/5) are confirmed. Phase 4.8 passed 35 of 38. The Manage fix
does its job (nothing in the header moves, 1.2), but its first tap is slow, with a brief overlap of
the labels (1.1, 1.3).

**Your rulings, 1 October** ("go with your recommendations"):
1. One bugfix folder for this check's corrections: **built**, below.
2. The gold i in the Advantage configuration windows stays until Phase 15.
3. The slow first Manage tap waits for Phase 15 (headless, the first tap is not measurably slower;
   the likely cause is Safari's first restyle, to be timed on the iPhone if it is ever fixed sooner).
4. **The monk Kiho rule of Core p. 246 is applied in Phase 4.6's first release**: a monk's first
   Path grants exactly one Kiho at its Rank, later Paths none.

Deferred by you in the doc (4.18, 4.23): a once-a-session gift already used this session should not
be offered at all. Style feedback, for later.

**BUGFIX — Ancestor Corrections (Void Offer, Info Button, Clan Picker)**, built on branch
`claude/bugfix-ancestor-corrections` and **merged to `main` on your word (1 October, `5cd7117`), before
the iPhone re-test** ([README](BUGFIX%20%E2%80%94%20Ancestor%20Corrections%20(Void%20Offer%2C%20Info%20Button%2C%20Clan%20Picker)/README.md)). **The re-test is owed**: the
[Re-test Checklist](https://claude.ai/artifact/3kAFwsszUbfWjzprt4nqys) holds it (about six minutes), with the Android checks for when you have the phone (see also [MANUAL-TESTS.md](BUGFIX%20%E2%80%94%20Ancestor%20Corrections%20(Void%20Offer%2C%20Info%20Button%2C%20Clan%20Picker)/MANUAL-TESTS.md)).

| Current snapshot | Value |
|---|---|
| The bugs, measured on `main` | With Seppun's or Komori Iongi's gift ticked, "Make an Unskilled roll Skilled" was offered on Rank 1 Skill rolls and on Trait rolls: the preview counted the gift switching off as the option mattering. The Ancestor's i was the configuration windows' gold italic one, not the A01–A16 Advantages' i. The Ancestor list ignored a Clan picker change until the next recalculation |
| The fix | One fragment with three switches, one stylesheet rule; rebinds Phase 3's (Part G) `voidKeyWouldMatter`; no shared-file block, seam key or save field |
| Build (branch) | **3,264,762 bytes**, SHA-256 `4551175ef8c697742c4a704047b1e3e5f306c61a532dd94a4d34d3f47c3f6643` |
| Own harness | **28/28**; **18/28 on `main`** (it can fail) |
| Variants | **7/7** broken builds fail exactly as pinned; Phase 12's modes off 28/28; Ancestors off 7/7 |
| Removal | **Byte-identical** to `main` (`7daf6aec…`); 12 remover tests (1 symlink skip); chain 11/11; the Multiple Schools fix's, the Manage fix's, Phase 4.8's and Phase 11's live removal tests pass with it in the tree |
| Full QA | **3,444/3,444**: 3,416 retained + 28 new; one retained Phase 4.8 check made conditional (test-only), 349/349 with the fix and without it |
| Device | **Merged before the iPhone re-test**, which is owed: [Re-test Checklist](https://claude.ai/artifact/3kAFwsszUbfWjzprt4nqys) |

## Previous update — 1 October 2026 (laptop session): the assessment, and BUGFIX — Multiple Schools Keep Earlier Techniques

> **Usage: 24% of this week** at the start of this session (your reading, after the assessment
> below; the update beneath recorded 22%). The reading after the bugfix is to be taken before Phase
> 4.6 starts, from the same place.

**Approved by you, 1 October:** the bugfix below, then **Phase 4.6's first release: the Core
Rulebook's 18 Great Clan paths (pp. 251–255) with the engine work they need**; the other 9 (magistrate,
Legion and Champion paths) in a second release. One ruling is still open, to be asked before 4.6
starts: whether the monk Kiho rule on p. 246 is applied in that release.

**The assessment** (the kickoff's proposal tested against the source, the live build and the Core
Rulebook PDF, read on the laptop with its text kept in a scratch folder only):
- **Phase 4.6 is not "content and tests".** 17 of the 27 Core paths need something the path engine
  lacks: "any Crab/Lion/Mantis/Scorpion School of a type" (4), a different Rank per School (Empress
  Guard: Kakita 3 or Daidoji 4), Honor, a Disadvantage or "one Skill of a type" as requirements (4),
  "any Bushi, Courtier or Shugenja School" with Glory and an appointment (4), and the five Champions
  (any Rank, one profession; Topaz replaces nothing). Re-rated **medium, medium confidence** (was
  small to medium, high).
- **Core p. 246 allows several Paths per character** (each basic Rank replaced once; a second Path
  is not a School Rank). The sheet's picker holds one Path in total (measured: a second pick replaced
  the first). Planned for 4.6's second release.
- **The kickoff's risk 1 reproduces** on the live build: a Path taken at Hida Bushi Rank 2 replaced
  Hiruma Bushi's Rank 2 Technique on a Multiple Schools character. Fixed in 4.6's first release by
  keying the record to its School through a Phase 7 format step.
- **A new bug, below:** adding a School through Multiple Schools stripped the earlier School's
  Techniques.
- **The Core Rulebook has 9 Advanced Schools, not 8**: the index's automatic scan missed the
  Elemental Guard (its heading runs over two lines).
- **Core p. 245 answers Phase 4.7's two questions:** an Advanced School is a separate track (Rank 3
  Isawa Shugenja and Rank 1 Elemental Guard); the basic School stops advancing; one Advanced School
  per character; the Multiple Schools Advantage is not mentioned. The roadmap's 4.7 scope requires
  it, so it needs your ruling before 4.7 starts (recommended: follow the book).
- **Possible gap in the 12 monk Paths, found by reading the code:** p. 246 gives a monk's first Path
  exactly one Kiho at its Rank; the sheet gives the usual two unless the Path's own text overrides
  (9 of the 12). The open ruling above.
- **No photographs are needed from a laptop session**: the PDFs are read directly. From a cloud-only
  session the pages would be Core pp. 245–257 (PDF 248–260).

**BUGFIX — Multiple Schools Keep Earlier Techniques**, built on branch
`claude/bugfix-multiple-schools-techniques`
([README](BUGFIX%20%E2%80%94%20Multiple%20Schools%20Keep%20Earlier%20Techniques/README.md)). **Waiting for
your iPhone check** (about five minutes:
[MANUAL-TESTS.md](BUGFIX%20%E2%80%94%20Multiple%20Schools%20Keep%20Earlier%20Techniques/MANUAL-TESTS.md))
and your word to merge.

| Current snapshot | Value |
|---|---|
| The bug, measured on `main` | A Rank 3 Hida Bushi who added Hiruma Bushi through Multiple Schools kept none of Hida's three Techniques once Hiruma unlocked; a monk's free Kiho went the same way. Core p. 151–152: nothing is forgotten |
| The fix | One fragment rebinding one trunk function: a School added past keeps its rows; a School replaced (Apply School, a retyped name) is stripped as before, with any earlier School no longer listed. No shared-file block, seam key or save field |
| Build (branch) | **3,260,361 bytes**, SHA-256 `7daf6aec5558807f81aa4f0b436df4c2332ddd4624eea4e52e85aa044ee68677` |
| Own harness | **32/32**; **21/32 on `main`** (it can fail) |
| Variants | **7/7** broken builds fail exactly as pinned; Phase 12's modes off 32/32 |
| Removal | **Byte-identical** to `main` (`f4345b4a…`); 12 remover tests (1 symlink skip); chain 11/11; the Manage fix's, Phase 4.8's and Phase 11's live removal tests pass with it in the tree |
| Full QA | **3,416/3,416**: 3,384 retained + 32 new; no retained harness changed |
| Not in it | Repairing saves the bug already damaged (needs a ruling; none known); the Path collision (Phase 4.6) |
| Device | **Merged to `main` on your word (1 October), before the iPhone check**, which is owed on the live site |

The ledger's HTML page and its published artifact will be refreshed once, after Phase 4.6's first
release, rather than for each release.

## Previous update — 1 October 2026: usage 22%, reassessment after Phase 4.8, and the next-session handoff

> **Usage: 22% of this week** (Claude Pro, your reading, 1 October; the week resets 7 October at
> about 02:00 BST). It was taken after Phase 4.8's two releases, the Manage button fix, the audit
> page and the merge. This ledger recorded the same 22% after Phase 7 on 30 September, before any
> of that work, so the two readings cannot be compared and no cost is derived from them; they may
> come from different meters. Take a start and an end reading from the same place for the next
> phase.

**Proposed next build phase: Phase 4.6 Alternate Paths, starting with the Core Rulebook's 27 paths
(pp. 251–257).** A proposal for your approval, not a start. You asked for the next phase whether or
not it needs the books: the sourcebook index and the photograph workflow that built Phase 4.8 have
made the books a small part of the cost.

**Why Phase 4.6 first** (checked in the source on 1 October, not taken from the roadmap's word):
- **The engine is built and takes any School.** `ALTERNATE_PATH_LIBRARY`, `pathsAvailableAt()` and
  `pathRequirementsUnmet()` work by School name; the Techniques tab's path picker stays hidden until
  a path is available and padlocks one whose requirements are not met; `unlockTechniques()` swaps
  the chosen path's Technique in at its Rank. Twelve monk paths use all of it today. The work is
  content and tests, as Phase 4.8's was.
- **It is the most-used option still missing.** The Core Rulebook alone has 27: two for each of
  the nine Great Clans (p. 251 on) and nine magistrate, Legion and Imperial Champion paths (p. 256
  on), per the sourcebook index. About 136 across 13 books.
- **One photo session feeds two phases.** The Core Rulebook's Advanced Schools are on pp. 245–250,
  directly before the paths. Photographing pp. 245–257 once supplies the first release of both 4.6
  and 4.7.

**Its smallest useful first release:** the Core Rulebook's 27 paths, each with its School and Rank,
its requirements, and its Technique in our own words with the page. **Not in it:** automating
Technique effects on rolls (the sheet shows School Techniques as text too); other books' paths
(later releases, one book at a time); Advanced Schools (Phase 4.7).

**Risks to measure before building** (read in the source on 1 October, not yet driven live; the
kickoff lists six): chiefly, a taken path is recorded by Rank alone, not by School. Once Great Clan
paths exist, a character with Multiple Schools may see their first School's path replace the second
School's Technique at the same Rank. If that reproduces, the fix changes saved data and belongs in a
Phase 7 format step.

**The order after that, with relative effort rather than invented percentages:**

| Order | Phase | Why it sits here | Effort and confidence |
|---|---|---|---|
| 1 | **4.6 Alternate Paths**, Core Rulebook first | Engine exists; content and tests | Small to medium; high confidence |
| 2 | **4.7 Advanced Schools**, Core Rulebook first (8 Schools, pp. 245–250) | Needs new engine work beside Multiple Schools. Two questions to settle against Core p. 245 before building: is an Advanced School a separate track (the roadmap's default), and does it need the Multiple Schools Advantage at all | Medium; medium confidence. It touches the School-list code behind several earlier bugfixes |
| 3 | **4.6 and 4.7, book by book** | One book per release: The Great Clans, Strongholds, the Elemental books, Sword and Fan, Secrets of the Empire, Emerald Empire | Content; small each |
| 4 | **6 Kata/Technique synergy, with Hotei** | Needs Technique text (72 Techniques have none; 4.6 and 4.7 add more) and a new engine with a real false-positive risk. Hotei needs a ruling | Large; low confidence |
| 5 | **13 Library**, then **14 Search** | High value at the table, and the index has already mapped every book's bookmarks and page offsets. Large engineering: a PDF viewer and book storage that survives on the iPhone | Large; medium confidence |
| 6 | **11.1 Export to PDF** | Needs no books, but has the largest engineering unknowns (generating the PDF, fonts, saving in the installed app and on Android). Print already works from the ⋯ menu in Safari, and your parked Print idea sits beside it | Large; low to medium confidence |
| When ruled | **D06 Weakness** | Needs your boundary rulings first | Small |
| A light session | **9: School flavour text** | Our own words for about 100 Schools | Medium; low risk |
| Last | **15 UI consistency** | After everything, with your deferred Ancestor point 2 | — |

**Owed, but not builds:** your iPhone checks of Phase 7, Phase 4.8 and the Manage button fix, now on
the live site; the Android checks for Phase 0.7 (0 of 7); allowing the two wiki hosts for the
Ancestor cross-check.

**Corrections made in this update:**
- The roadmap's status table still showed Phase 4.8 as "Fully scoped" and Phase 7 as awaiting a
  merge, and its build-order row for Phase 12 said 4.8 was not built.
- This ledger's open reminders still asked you to merge Phase 7 and the index (merged 30 September).
- The "Ahead" table still counted Phase 12 (complete), Phase 7 and Phase 4.8 as not started. Phase
  12 now sits under Fully done, Phase 4.8 under Built, not yet validated (it waits for the iPhone),
  and Phase 7 under Started, not finished (its audit log is later, by your ruling).
- `BUILD-LEDGER.html` and its published page had not been refreshed since the 30 September
  afternoon update (six updates); they are brought up to date here.

**Handoff for the next session:** [`CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-01.md`](CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-01.md).
It asks the new session to make its own assessment first and to explain any difference from this one.

## Previous update — 30 September to 1 October 2026 (cloud session from the phone): Phase 4.8's second release, and the Manage button fix

> **Phase 4.8 now covers all three books you supplied, and your Kakita feedback is applied**, on
> branch `claude/phase-4-8-ancestors`, with the Manage button fix as its own layer and commit.
> **Waiting for your iPhone check** (Ancestors: about twenty minutes,
> [MANUAL-TESTS.md](PART%20I%20%E2%80%94%20Phase%204.8%20Ancestors/MANUAL-TESTS.md); the Manage
> button: two minutes,
> [MANUAL-TESTS.md](BUGFIX%20%E2%80%94%20Manage%20Button%20Clipping/MANUAL-TESTS.md)). **Merged to
> `main` on your word, 1 October, before the iPhone check**: the check is still owed, now on the live
> site. The audit is also published as a page, "Ancestor Gift Audit".

**Your feedback on Kakita (30 September), and what happened to each point:**

| Point | What you said | Done |
|---|---|---|
| 1 | The round **i** should match the Advantages' circled i | **Done**: the same size, ring and glyph, checked style by style against the Advantages' own button |
| 2 | The page may be cluttered | **Deferred to Phase 15**, as you said |
| 3, 4 | The wizard, and favour lost and regained, work | Nothing needed |
| 5 | Manage clipped on the first press | **Fixed** in its own folder, `BUGFIX — Manage Button Clipping`: the button keeps one width, so nothing in the header moves when it is tapped |
| 6, 7 | A re-roll comes after the roll; a paid bonus is chosen in the preview; a free one is automatic | **Done for every Ancestor**: Kakita's re-roll, Sun Tao's die and Toku's Luck are after the roll; gifts that cost a Void Point or a session's use are ticked in the preview and paid by the sheet when you press Roll |
| 8 | Audit every Ancestor, and check for missing ones | **Done**: [AUDIT.md](PART%20I%20%E2%80%94%20Phase%204.8%20Ancestors/AUDIT.md). Nothing is missing from the books supplied; the wiki pages could not be reached (below) |
| 9 | A lost-favour Ancestor should stay editable in Management | **Deferred to the end of the project**, as you said |

**What was built.** The other 36 Ancestors: The Great Clans (16, on pp. 42–283) and Secrets of the
Empire (20, pp. 243–247), from your photographs, in our own words with page references. 54
Ancestors in all, 55 entries (Agasha has two). New factions in the picker: Minor Clans, the Imperial
families, ronin and the Brotherhood (a monk also sees their Clan's). New mechanics: payment when you
press Roll (a Void Point by the Void card's rules, a session's use with Reset session on the card;
Atarasi's Taint point and Bikimi's spell slot are asked for and left to you to record), the three
after-the-roll offers, Seppun's and Iongi's "Use it now", and Chuda Bikimi's favour that never
returns.

| Current snapshot | Value |
|---|---|
| Phase 4.8 build (branch) | **3,255,067 bytes**, SHA-256 `ceb2d4b2cd1f281c1878ffb3368a216da930df490e358f1d7c2cc55ef424cfef` |
| Full QA | **3,347/3,347**: 2,999 retained + 348 (the harness then gained a 349th check, below) |
| Phase 4.8 harness | **349/349** (was 161); 180/349 on the first release's build and 1/349 on `main` (it can fail); `--absent` 7/7 on `main` |
| Removal | **Byte-identical** to `main` (`2e65b361…`) again, first attempt; 20/20 remover fixtures; all 21 releases' fixtures pass; chain checks 11/11 |
| Variants | **40/40** broken builds fail exactly as pinned (1,077 failing assertions); six boundaries green. The first run found one blind spot (Sun Tao's die re-sorted into the best dice); a 349th check closes it |
| Manage fix build | **3,256,563 bytes**, SHA-256 `f4345b4aa63dc9a1e0e61e01fd83fdbb95a296701ecaa84650e1909c44119760` (one CSS rule and a switch) |
| Manage fix QA | Own harness **36/36**; **26/36** without the fix (it can fail); removal byte-identical to the Phase 4.8 build; 11/11 remover fixtures; 6/6 pinned variants; full suite **3,384/3,384** (2,999 retained + 349 + 36; 3,348/3,348 through Phase 4.8's runner on the same build) |
| Not done | Your points 2 and 9 (deferred); the wiki cross-check; other books (none has an Ancestor section; Enemies of the Empire p. 243 is worth a look) |
| Device | **Awaiting your iPhone check** on the branch preview |

**To let a future session reach your wiki pages:** in the Claude app, open the cloud environment
from the session's title bar, choose Edit, and under Network access either pick a broader level or
add `magicalsamurai.wikidot.com` and `lasthaiku.wikidot.com` to the allowed domains.

## Previous update — 30 September 2026 (night, cloud session from the phone): Phase 4.8 Ancestors built

> **Phase 4.8's first release is built and waiting for your iPhone check** (about ten minutes:
> [MANUAL-TESTS.md](PART%20I%20%E2%80%94%20Phase%204.8%20Ancestors/MANUAL-TESTS.md)), on branch
> `claude/phase-4-8-ancestors`. Not merged: it waits for your word. The wiki links branch was
> merged to `main` on your word earlier this evening.

**Your rulings, 30 September:**
1. **The Ancestor lives with the Clan and Family**, not in the Advantages list: a card in Clan &
   School and a section on the wizard's Family screen, so a player sees it exists.
2. **A "Lost ancestor's favour" badge** switches every gift off.
3. **Favour follows the book (p. 241):** it can return once; a second loss is final; no other
   Ancestor can replace one whose favour was lost; the points are never refunded.
4. **Offered:** your own Clan's Ancestors; Spider Ancestors to anyone with the GM's permission;
   other Clans' greyed out.
5. Cost as the book prices it (5–14), charged to Experience spent from the card.

**What was built.** The Core Rulebook's eighteen Ancestors (pp. 241–244), from your photographs,
in our own words with page references. Automatic gifts through the `adv-config` seat (the registry
stays at seven), per-roll gifts through Feature 4.5.15's registry, Hida's and Ikoma's damage inside
the weapon damage maths, Shiba's Intelligence on Armor TN, Honor and Taint demands flagged (never
automatic), the picker fixed in Play, and the wizard's Ancestor section and Review line. Read the
[README](PART%20I%20%E2%80%94%20Phase%204.8%20Ancestors/README.md) for every Ancestor's table and
the readings made (Kuni's kept dice is the one to confirm with your GM).

| Current snapshot | Value |
|---|---|
| Phase 4.8 build (branch) | **3,188,218 bytes**, SHA-256 `bb5207dc5a023ddb97fa3095771463b7cc07b69894b18252c12898cdc3bec355` |
| Full QA | **3,160/3,160**: 2,999 retained + 161 new |
| Own harness | **161/161**; 1/160 on `main` (it can fail); `--absent` 6/6 on `main` |
| Removal | **Byte-identical** to `main` (`2e65b361…`, 3,128,232 bytes) on the first attempt; 20/20 remover fixtures; all 21 releases in the removal chain pass |
| Cross-phase | Two provider-list checks made conditional (4.5.15 52/53 → 53/53, 4.5.16 90/91 → 91/91, both ways); Phase 11.2's wizard harness left as it was, the Ancestor block changed instead (39/43 → 43/43) |
| Not in this release | Other books' Ancestors (The Great Clans; Secrets of the Empire); the wiki cross-check (blocked by this session's network); a link to Cursed by the Realm's Yomi |
| Device | **Awaiting your iPhone check** on the branch preview |

## Previous update — 30 September 2026 (evening, cloud session from the phone): both branches merged; wiki links added to the index

**Merged to `main` on your word:** Phase 7's first release (`claude/phase-7-save-format`) and the
sourcebook index (`claude/sourcebook-index-2026-09-30`). Main's build is the Phase 7 build
(`2e65b361…`, 3,128,232 bytes). Full QA on main: **2,999/2,999** once the container runs in a UTF-8
locale. Without one, Chromium saves "Sairyū.l5r.json" as "download" and three Phase 7 name checks
fail; that is the container, not the sheet (45/45 with `LANG=C.UTF-8`). **Phase 7 was merged
without the iPhone check**; the check is still owed, now on the live site.

**Your ruling, 30 September: fan wiki pages as a supplementary source.** Ancestors and each
Clan's Schools pages from the Magical Samurai and Last Haiku wikis. **The sourcebook PDFs stay the
primary source**; the wikis are for cross-checking that everything is carried over correctly and
for clarifying discrepancies. The book wins where they differ, the difference is recorded, and
anything found only on a wiki is flagged to you, never added on the wiki's word. Our own words,
never the wiki's text.

**Wiki links in the sourcebook index** (branch `claude/sourcebook-wiki-links-2026-09-30`; merged to
`main` on your word the same evening). The links live in `wiki_links.json`. `build_index.py --from-json` rewrites the
index from its own data, so the change was made without the books. Without the links file it
reproduces the index byte for byte. With it, every one of the sheet's 104 School rows links to its
Clan's pages. This session's network settings block both wikis, so nothing was read from them.

## Previous update — 30 September 2026 (later): sourcebook index built; Phase 7's first release built

> **Phase 7's first release is built and waiting for your iPhone check** (about five minutes:
> [MANUAL-TESTS.md](Part%20J%20%E2%80%94%20Data%20Integrity%20%26%20Validation/PART%20J%20%E2%80%94%20Phase%207%20Save%20Format%20and%20Migration/MANUAL-TESTS.md)),
> on branch `claude/phase-7-save-format`. The sourcebook index is on branch
> `claude/sourcebook-index-2026-09-30`. Neither is merged: both wait for your word.

**Your rulings, 30 September (all as recommended):**
1. Sourcebook content goes into the app in **our own words, with page references; never verbatim**.
2. Import **converts** an older save to the current format on the way in.
3. The **audit log is later**, not part of Phase 7's first release.
4. Accented file names are fixed with this change to export.
5. The index goes in a new top-level folder, `Versions/SOURCEBOOK INDEX — Page Map/`.

**The sourcebook index.** [README](SOURCEBOOK%20INDEX%20%E2%80%94%20Page%20Map/README.md) on its branch.
- A script maps each topic the remaining phases need to its book and page. It extracts the text
  of all 16 books (3,782 pages) in under a minute, into a temporary folder it deletes. The index
  holds page numbers and headings only.
- **Printed page = PDF page − 1** in 14 books, **− 3** in the Core Rulebook, **the same** in
  Unexpected Allies 2. The page labels a PDF reader shows are wrong for 8 books.
- **Ancestors (4.8):** Core pp. 241–244; eight "New … Ancestors" sections in The Great Clans;
  Secrets of the Empire pp. 243–245.
- **Alternate Paths (4.6):** about 136 entries across 13 books, not checked. The sheet has 12,
  all monk paths.
- **Advanced Schools (4.7):** about 21 entries across 10 books.
- **The sheet's own library matched to the books:** 98 of its 104 Schools found by heading.
  72 of its 338 techniques have no description; 65 of those 72 were located.
- **Bookmarks for Phase 13:** 12 books have working ones; Strongholds has none; Naishou's 48 all
  point nowhere.
- **Checks:** six page references the sheet already cites all land on the computed page (0 of 6
  with the page offset forced wrong); two runs are byte-identical.

**Phase 7, first release.** [README](Part%20J%20%E2%80%94%20Data%20Integrity%20%26%20Validation/PART%20J%20%E2%80%94%20Phase%207%20Save%20Format%20and%20Migration/README.md) on its branch.
- A `VersionManager` holds one chain of registered format steps: 1 → 2 (Kiho), then 2 → 3
  (Phase 4.5.2's own migration, reused unedited).
- Every save and export is stamped with the current format.
- Older saves are carried up on Import, on Save As a copy, on Export (including the list's export
  of a character never opened) and on load. Stored characters are not rewritten in bulk.
- Current, newer and malformed saves pass through untouched, so every existing refusal is
  unchanged.
- Export names keep accented letters ("Sairyū.l5r.json").
- **`SHEET_SCHEMA_VERSION` is deliberately left at 2.** Raising it, as the handoff proposed, would
  let the trunk load format-3 saves and silently drop their configurations if 4.5.2 were removed.
- **Correction to my own plan:** "export without opening = open then save" does not hold byte for
  byte. Opening and saving writes every field; conversion changes only what the format steps
  change. The test compares how both saves read instead.

| Current snapshot | Value |
|---|---|
| Phase 7 build (branch) | **3,128,232 bytes**, SHA-256 `2e65b361aac71649c137b4f22fc37de7c5a77826ea43eb5f889a49fa47fe4763` |
| Full QA | **2,999/2,999**: 2,954 retained + 45 new; no retained harness needed a correction |
| New harness | **45/45**; **24/45 on `main`**; 38/38 on `main` with the "absent" expectations |
| Sensitivity | **12 of 12** pinned variants fail exactly as expected; boundaries green (removed, switched off, 4.5.2 off, Characters list off) |
| Removal | **Byte-identical** to `main` (`23df67a7…`, 3,117,804 bytes); 20 tests, 19 pass, 1 symlink skip; removal chain 11/11 |
| Scope | One fragment, one 3-line trunk block in `exportJSON()`, one seam block, one removal-chain entry; consumer notes in Phase 11's and 4.5.2's ROLLBACK |
| Usage | Claude Pro, 30 September. **Weekly:** 17% at session start, 17% after the assessment, 19% after the index, 22% after Phase 7. **5-hour window:** 39%, 45%, 57%, 77% at the same points. Readings, not precise costs |
| Device | **Awaiting your iPhone check** on the branch preview |

**Discrepancies found and corrected in this update:**
- The "Ahead" section below still said "Phase 12 is next to build".
- The cost table had no 30 September rows.
- The "98 techniques without a description" figure is now **72**, checked by evaluating the
  libraries.
- CLAUDE.md placed the books at the repo root. They are in
  `OneDrive\Documents\L5R 4th edition books`, outside both clones.
- A second, older clone exists at `OneDrive\Documents\L5R character sheet creator`, 11+ commits
  behind with uncommitted changes of its own. It was left untouched.

**Next, after your check:** merge both branches on your word. Then Phase 4.8 Ancestors (Core pp.
241–244 first), per the agreed order. The ledger's HTML artifact will be refreshed at the merge
rather than twice.

## Previous update — 30 September 2026: reassessment after Phase 12, and the next-session handoff

**Revised order (owner's request, 30 September, after asking about working on sourcebook phases
from the laptop and continuing on the iPhone through Claude's Remote Control):**

1. **A one-off sourcebook index.** A map of which book and pages cover each topic the remaining
   phases need: ancestors (4.8), alternate paths (4.6), advanced schools (4.7), technique text and
   Void costs (6 and Hotei), School descriptions (9). Page references only, no quoting. It also
   establishes whether the 17 PDFs have selectable text (cheap scripted extraction) or not.
   Reading the books is the costly part; the index means each later phase reads only its own pages.
2. **Phase 7, first release** — the save format made true and older saves migrated (no books
   needed). Content phases add save data, so the upgrade path comes first. Can be swapped later if
   the owner prefers content progress.
3. **Phase 4.8 Ancestors** — the first sourcebook build: the smallest reading, reuses Phase 4.5's
   configuration machinery, the owner has the material, and Phase 12 already expects it.
4. **Phases 4.6 and 4.7** — one shared extraction pass, then two builds.
5. **Phase 6 with Hotei** — the heaviest extraction and a new engine; the index makes it tractable.
6. **Phase 9's School flavour text** as a light session; **13 and 14** late; **15** last.

**Ruling needed first:** quote rules text verbatim, or record mechanics and page references in our
own words? The site is public; it affects 4.6, 4.7, 4.8, 6 and 9. Until ruled, keep extracts out of
the public build (and out of GitHub if verbatim).

**Working this way (verify):** the session runs on the laptop, which must stay on mains power,
awake (keep-awake on; closing the lid may sleep it) and online, or the session pauses. Save each
extract as a data file so no later session re-reads a PDF; do reviews and approvals from the phone;
batch iPhone checks; one full-suite run per release.

**Usage:** Claude Pro weekly **16%** at the end of this session (the week resets 7 October). The
last 3 points were the ledger artifact republish (reading its full source) and this reassessment.

**Handoff:** [CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-09-30.md](CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-09-30.md).
It asks the new session to make **its own assessment of cost and the remaining roadmap**, draw its
own conclusions, and give point-by-point reasons wherever its proposal differs from this one.

## Previous update — 30 September 2026: Phase 12.8 — the old toolbar replaced, merged; Phase 12 complete

> **Confirmed on your iPhone, 30 September, and merged to `main`. Phase 12 is complete.** Built on
> branch `claude/phase-12-8-toolbar` and verified headlessly first. The device checks are in
> [MANUAL-TESTS.md](PART%20K%20%E2%80%94%20Phase%2012.8%20Play%20Mode%20Toolbar/MANUAL-TESTS.md)
> (about five minutes).

**Your choices, as built:** the header now has **Characters**, **Save**, **⋯** and **Manage/Done**
under the name; the ⋯ menu has **Save As a copy** (Management only), **Print** and **Export JSON**.
**New Blank is gone**; new characters come from Create New Character or Import on the Characters
list, which also handles opening, copying, exporting and deleting, as Phase 11 planned. The old row
of buttons is gone from the screen. See [the part](PART%20K%20%E2%80%94%20Phase%2012.8%20Play%20Mode%20Toolbar/README.md).

**Found while building, and handled:** the first ⋯ menu was cut off by the header (it now opens
over the page); on a phone the header wrapped differently depending on how long the name is (the
name now always has its own line); and fourteen retained test harnesses pressed the old row's
buttons with real clicks, so they received **test-only corrections** (originals kept), each passing
with and without this part. One Phase 12.7 check turned out to compare two empty names; corrected.

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build (branch) | **3,117,804 bytes**, SHA-256 `23df67a7cd16b86802cc22967ea5af5fe586fdaccfa504ac79a7b28067734896` |
| Full QA | **2,954/2,954**: 2,917 retained + 37 new; the corrected retained suites also 2,917/2,917 on `main` without this part |
| New harness | **37/37**; **9/37 on `main`**; 7/7 on `main` with the "old row untouched" expectations |
| Sensitivity | **10 of 10 pinned variants** fail exactly as expected; boundaries (removed, switched off, Characters list off, Phase 12 modes off) all green |
| Removal | **Byte-identical** to `main` (`47fdb778…`, 3,109,466 bytes); 24 tests, 23 pass, 1 symlink skip |
| Scope | One script fragment, one stylesheet, one seam block; buttons moved, not rebuilt. Phase 11's and Phase 12's rollbacks name this consumer |
| Usage | Claude Pro, 30 September: **weekly 9% → 13%** between about 12:53 and 14:30 BST, which also covers merging 12.7 and recording your parked idea. The 5-hour window reset at 13:50 and was at 12% by 14:30. Not a precise cost of this part; not comparable with the Codex readings below |
| Device | **Confirmed on your iPhone**, 30 September, on the branch preview; merged to `main` |

**Your second design idea for later — Print on the Characters list's menu.** On testing 12.8 you
said the per-character menu on the Characters list (Export JSON, Save As a copy, Delete) should also
offer **Print**. Parked for review **after the app is complete**; no work now. It sits next to Phase
11.1 (Export to PDF), which plans an Export PDF item in the same menu, so the two should be reviewed
together. Recorded in the roadmap under *Deferred and declined* and as an open reminder below.

## Previous update — 30 September 2026: Phase 12.7 — Combat in Play only, merged

> **Confirmed on your iPhone, 30 September, and merged to `main`.** Built on branch
> `claude/phase-12-7-combat-visibility` and verified headlessly first. The device checks are in
> [MANUAL-TESTS.md](PART%20K%20%E2%80%94%20Phase%2012.7%20Play%20Mode%20Combat/MANUAL-TESTS.md)
> (about five minutes): Combat in Play, gone in Management, switching while on Combat lands on
> Equipment without the page swinging, Spell Slots unaffected, and Combat still on a printout.

**Your ruling, applied as written:** Combat shows in Play and does not appear in Management; the
mode changes nothing *inside* Combat. The older "mode-independent" wording in the Phase 12 section
is read the way the audit and the 28 September handoff read it. Combat leaves the carousel through
the same path Spell Slots uses, pointed at an element outside the carousel so the Safari hidden-page
bug cannot reach it. See [the part](PART%20K%20%E2%80%94%20Phase%2012.7%20Play%20Mode%20Combat/README.md).

**Found while building, and handled:**
- Leaving Combat by switching to Management would have dropped you on the *first* tab; it now lands
  on Equipment. The first version of that glided past Equipment to Background and back (caught by
  the tests); one instant scroll stops the glide.
- The print layout hides every hidden carousel page, so a sheet printed in Management would have
  lost the whole Combat section. A print rule keeps it.
- A fresh page opens in Management (your ruling), so three retained test harnesses that opened
  Combat from a fresh page (Phase 1.6 wounds, and both Spell Slots bugfixes) needed **test-only
  corrections**. Each passes in full with and without this part; originals are kept.

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build (branch) | **3,109,466 bytes**, SHA-256 `47fdb778d72b6febe3a4767a80a94cf1e308eaa25f9316d1cabdd195fc6c6d83` |
| Full QA | **2,917/2,917**: 2,862 retained + 55 new; retained named results identical to `main` |
| New harness | **55/55**; **38/55 on `main`** (proves it can fail); 55/55 on `main` with the "always shown" expectations |
| Sensitivity | **9 of 9 pinned variants** fail exactly as expected; boundaries with this part removed, switched off, or Phase 12 switched off all 55/55 |
| Removal | **Byte-identical** to `main` (`2c8a426f…`, 3,104,431 bytes); 24 tests, 23 pass, 1 symlink skip; registry 11/11; the Dependant and Phase 11 chain fixtures pass |
| Scope | One script fragment, one print rule, one seam block. No markup, carousel, rules, save or registry change. Phase 12 part 1's rollback names this consumer |
| Usage | Claude Pro, 30 September: **weekly 4% → 9%, 5-hour window 30% → 63%** between about 10:23 and 12:53 BST. That span also covers merging the Dependant fix and clearing the Python cache (both small), and repeating the runs spoiled by an hour-long machine stall. Not a precise cost of this part; not comparable with the Codex readings below |
| Device | **Confirmed on your iPhone**, 30 September, on the branch preview; merged to `main` |

**Your design idea for later — Manage as a separate screen.** On testing 12.7 you said you had
pictured **Manage** opening a separate screen, like the creation wizard, rather than the sheet's
fields switching between editable and static in place. Parked for review **after the app is
complete**; no work now. Recorded in the roadmap under *Deferred and declined* ("REVIEW LATER —
Manage as a separate screen") and as an open reminder below.

## Previous update — 30 September 2026: crash recovery, and BUGFIX — Dependant Inline Typing merged

> **Confirmed on your iPhone, 30 September, and merged to `main`.** Built on branch
> `codex/dependant-typing` and verified headlessly first. The device checks are in the fix's
> [MANUAL-TESTS.md](BUGFIX%20%E2%80%94%20Dependant%20Inline%20Typing/MANUAL-TESTS.md) (about five
> minutes): type into both Dependant boxes, move straight between them and between two Dependant
> rows, tap Change right after typing, reload, and confirm Play still locks the boxes.

**A laptop crash interrupted the Codex session on 28 September**, after its last write at 13:29.
Nothing committed was lost: `main` and the Phase 12.5 branch were already on GitHub. The crash did
corrupt one object in the local Git repository (restored from GitHub; `git fsck` clean), three
committed documents on disk (both 28 September kickoff files and the Phase 12 audit; restored
byte-for-byte), and two uncommitted files of the bugfix Codex was building (`ROLLBACK.md` and the
remover, both rewritten). This desktop's own Python 3.14 also had four damaged `.pyc` cache files
(`argparse`, `pprint` and two in installed packages); QA ran with `PYTHONPYCACHEPREFIX` pointing
elsewhere, and afterwards the four files were deleted with your approval (Python regenerates them).

**Codex had taken the recommended order's first item**, the separate Dependant typing bugfix, and
written most of it. Its harness had not yet been run. Run here, it failed 8 of its 64 checks on
Codex's version: moving straight from one Dependant field to the other, or to another Dependant
row, still lost the next text typed, because Phase 4.5.8's own commit rebuilt every row during the
focus change. The finished fix stops that commit-time rebuild and repaints only the edited row
once focus has left it. See [the fix](BUGFIX%20%E2%80%94%20Dependant%20Inline%20Typing/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build (branch) | **3,104,431 bytes**, SHA-256 `2c8a426f85d00d1637a9ec48453ac01b3600b5193494aae342f3b5113e3c4fc6` |
| Full QA | **2,862/2,862**: 2,789 retained + 73 new; retained named results identical to the pre-fix baseline |
| New harness | **73/73** (real keyboard, clipboard and mouse input); **20/73 on the unfixed build**; 61/73 on Codex's pre-crash version |
| Sensitivity | **8 of 8 pinned variants** fail exactly as expected; one planned variant changed nothing, and the line it tested was removed from the fix rather than kept untested. The first full run failed one retained 4.5.8 check; the fix was corrected, not the check. Boundaries with 4.5.8, Phase 12 or 12.5 switched off all pass |
| Removal | **Byte-identical** to `main` (`4f8509e6…`, 3,100,276 bytes); 26 tests, 25 pass, 1 symlink skip; registry 11/11; Phase 11 chain fixtures 2/2 |
| Scope | One fragment and one seam block; no CSS, markup, rules, prices, save fields or registry seat. Phase 4.5.8's rollback now names this consumer |
| Usage | Claude Pro, 30 September: **weekly 3% → 4%, 5-hour window 18% → 30%** between about 09:30 and 10:23 BST (the final QA rounds: two fix corrections, three variant and full-suite cycles). The week had reset at 01:59 BST that day and no reading was taken at the session start, so the whole session, including the crash recovery, is at most 4% of the week; not a precise cost of the fix. Not comparable with the Codex readings below |
| Device | **Confirmed on your iPhone**, 30 September, on the branch preview; merged to `main` |

## Previous update — 28 September 2026: 56% weekly usage and next-session recommendation

**Owner-reported Codex weekly usage: 56% used, approximately 44% remaining at the time of the
report, before this documentation pass.** The owner attributes this to the work completed so far.
Record that observation, but do not relabel it as a measured 56-percentage-point cost of Phase
12.5: there is no matching starting reading or per-activity breakdown. This is not the historical
Claude 96% reading below; those are separate allowances, not comparable before/after measurements.
No new reset time, token count or remaining-feature capacity has been measured.

### Why the work appeared expensive

The visible change was small, but the work included implementation, audit, test repair, removal
proof, owner-review preparation and release verification. The evidence supports these contributors,
**not a percentage allocation between them**:

- **A large behaviour matrix.** Phase 12.5 must lock editing without disabling in-play actions.
  The initial 16-check harness was too shallow; the final suite has **212 new checks across 35
  representative configured entries**, plus **10 pinned negative variants**. This caught real
  omissions, including a kill-switch CSS leak. The final combined run passed **2,789/2,789**.
- **The removal contract adds real verification.** Byte-identical removal, unchanged retained
  results, switch-off boundaries and shared removal-chain checks all needed evidence. Removing
  these checks to save allowance would weaken the agreed contract.
- **A retained test failure needed investigation.** The Techniques harness intermittently lost its
  first typed character. A test-only focus-readiness correction preserved all 16 assertions and
  six negative variants. Its underlying timing cause was not conclusively established. Separately,
  real typing exposed the pre-existing Dependant text-loss bug; that fix remains unbuilt.
- **There was avoidable process overhead.** Repeated reviews/full-suite runs, expanding an
  inadequate test inventory late, revisiting already established results and lengthy context/tool
  output made this less efficient than it should have been. Earlier completion claims preceded
  the final depth of QA. Not all of this expenditure was unavoidable or new feature work.
- **Interrupted sessions added recovery work.** Usage-limit interruptions affected agents and
  Codex's automatic approval review, requiring resumed context and status reconstruction. That
  was not a GitHub failure, nor evidence that the owner's requests to continue caused the cost.

OpenAI explains that usage varies with model, task complexity, context, reasoning and tool use;
message count alone is not a reliable cost estimate. See the [official usage guidance](https://learn.chatgpt.com/docs/pricing#what-are-the-usage-limits-for-my-plan).
Those general factors make the workflow above a plausible explanation, not an account-level
attribution report. Local test runtime or waiting time alone is not a measured AI allowance charge.

### Reassessment: next work, not approval to implement

**Recommended next roadmap phase: 12.7 — Combat hidden in Management.** Before it, recommend a
**separate, narrowly scoped Dependant typing bugfix**, because confirmed user-entered text loss is
more urgent than another visibility change. If the owner prioritises roadmap progression, 12.7
can go first; do not silently bundle the bugfix into it.

| Proposed order | Scope and reason | Relative effort / main uncertainty |
|---|---|---|
| 1 — separate bugfix | Dependant name and arrangement: preserve actual typing through refresh/blur and save/load; retain Play locking. No editor rewrite | Small implementation hypothesis; verification must prove the event-order fix and removal |
| 2 — Phase 12.7 | Hide Combat in Management through the existing carousel visibility path; restore in Play; preserve all combat rules/data. Test switching while Combat is selected, fallback navigation, clones, repeated switches and Spell Slots | Bounded implementation, medium regression risk due to prior Safari/carousel bugs; real iPhone check required |
| 3 — Phase 12.8 | Replace legacy toolbar, Management Save As and approved mode-entry defaults | Broader lifecycle and retained-test impact; keep separate from 12.7 |
| Reassess after 12 | Compare Phase 11.1 PDF with Phase 7 persistence/migration using evidence from the completed toolbar work and owner export testing | PDF scope depends on supported mobile/installed/Android behaviour; a Safari Print pass alone does not complete 11.1. Phase 7's audit-log scope still needs a decision |
| Separate rules backlog | D06 Weakness and remaining Hotei work | D06 requires Trait/Ring/Insight/resource boundary rulings; Hotei remains source-blocked in the ledger. Do not infer completion from existing Hotei UI |
| Later / source-dependent | 4.6–4.8, 6, remaining School flavour, then 13/14 as prerequisites permit; Phase 15 last. Phase 10 remains unscoped | Sources, rules decisions and substantial engineering remain; no reliable whole-project duration can be inferred |

This changes the 25 September proposal by recognising **12.5 is complete**, prioritising a newly
confirmed data-loss bug, and making the PDF-versus-persistence order evidence-led rather than fixed.
Its Claude-based **2–4% per-tab** and **2–4 weeks remaining** estimates are historical, not calibrated
Codex forecasts. Engineering/QA risk is material too; source availability is not the only major
uncertainty. Do not promise how many releases the reported 44% will fund.

**Cost-control plan:** record a fresh provider-specific usage reading before an approved batch
and at its assessment/release checkpoints; define the complete control/test inventory before
coding; use focused tests while iterating and the full retained suite for the final frozen
candidate; repeat only for a relevant change or failure; retain concise evidence instead of
re-reading/re-running it without cause. Keep independent review bounded. Do not weaken QA or
claim a precise cost before comparable measurements exist. This documentation-only pass does
not require another 2,789-check application run.

New-session handoffs: [ChatGPT / Codex](GPT-SESSION-KICKOFF-NEXT-SESSION-2026-09-28.md) and
[Claude](CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-09-28.md). Both must independently reassess cost,
remaining roadmap, source blockers and the proposed order, explain any disagreement with evidence,
and obtain approval for the selected implementation. This entry records a recommendation only.

## Open reminders

- [ ] **BUILT on a branch — awaiting your word to merge — Phase 4.5.28 device corrections.**
  `claude/phase-4-5-28-device-corrections`; full suite 4,450/4,450. After the merge, a short re-test doc.

- [x] **CHECKED 7 October — Phase 4.5.28 Situational Entry Buttons and Gates: 21 Pass, 1 Not run** (Windows,
  Edge; Test 6 on the iPhone). The [Situational Entry Buttons and Gates — Test Checklist](https://claude.ai/code/artifact/bd563c7b-96c9-40f9-a76f-4672aa92026e). 3.4 found a
  real bug and 1.2/1.4 the redundant tick: both corrected (above).

- [ ] **PHASE 15 OR END OF PROJECT (your ruling, 7 October) — the resist entries' clutter.** Balance, Clear
  Thinker, Heartless and Irreproachable appear on every Skill, Trait, Ring and dice-tray roll. Review then:
  a closed "Resisting?" line showing what is resisted and the bonuses; limiting each to the rolls the books
  use for resisting (every entry checked against the books); or a row badge ("Resist Temptation") that
  opens a dedicated roll, as Wary's Spot ambush now does.

- [x] **CHECKED 7 October — Phase 4.5.27 Situational Roll Entries: 31 Pass, 2 Fail** (Windows, Edge; 9.1 and
  9.2 on the iPhone). The [Situational Roll Entries — Test Checklist](https://claude.ai/code/artifact/e242e507-13ce-43aa-a557-65e11c263f1d). Both Fails
  answered by Phase 4.5.28 (above).

- [x] **CLOSED 2 October, not a bug — "a Void Kiho could still be added with Uncentered."** It was a Void Kata
  ("Striking as Void"); Uncentered bars only Void Kiho, which the sheet enforces. The sheet's
  own Kiho list bars it (measured headlessly: a Kuni Witch-Hunter's "Song of the World" turns "🔒 barred by
  Uncentered"), so the Kiho came by another route: one held before Uncentered was added (the ban stops only new
  picks), the wizard's Kiho step, or a typed Technique row. Answered: it was a Kata.

- [x] **CONFIRMED on your iPhone 2 October (all checks passed) — MERGED on your word (`main` at `00d0ca6`): Phase 4.5.25 Clan and School Prices**
  (with the audit). Your check is the [Clan and School Prices — iPhone Checklist](https://claude.ai/code/artifact/74204bd6-f75e-4a53-8bd2-fd13072866d4) (Tests A–G, about
  14 minutes, a Result dropdown under each), walked headlessly on the live page after the deploy: 45/45.

- [ ] **YOUR REVIEW — the Advantages and Disadvantages audit** ([the doc](https://claude.ai/code/artifact/485b7ec0-c6cd-4c63-b9e6-3e5c4ecf74a6)). The audit merged with Phase 4.5.25 on 2 October; its recommendations remain a historical snapshot. The outstanding rulings concern scope (including GM-agreed choices and Naga/Nezumi/Station), Student of the Past, Trials of the Imperial City and Wanderer. Weakness's boundaries are separate. Clan/School pricing is already delivered; the dice entries are merged and accepted on your Windows pass (3 October); the nine situational roll-preview entries are Phase 4.5.27 (7 October). The audit's counts predate those releases: about 84 entries still record only cost and text, about 45 of them buildable with existing machinery.

- [x] **CONFIRMED on your iPhone 2 October (13/13) — MERGED on your word (branch `claude/phase-6-technique-text`):
  Phase 6's first release (the 72 School Technique texts) and BUGFIX — Technique Name Clashes.**
  - The fix corrects the Toku Bushi's Rank 4, found 2 October: the Book of Air's Master of Games and
    the Toku Bushi's Rank 4 were both "Forge Your Own Fate".
  - It also corrects the Doji Courtier's Rank 5, found this session.
  - Its load check now covers every School Technique.
  - Saved characters' stale rows are updated when opened (your ruling).
  - Full suite 3,666/3,666. Your check is the [Technique Text and Name Fix — iPhone Checklist](https://claude.ai/code/artifact/7bcdcc1a-bbe2-4341-852a-abc75fd8e59c) (Phase 6's MANUAL-TESTS.md, Tests A to G; walked headlessly on the live site after the deploy: Tests C to F hold).

- [x] **CONFIRMED on your iPhone 2 October (13/13) — PHASE 4.6 Alternate Paths, third release** (branch
  `claude/phase-4-6-alternate-paths-r3`; `main` at `7c01d0c`, build `aa5c55d9…`): the other books' 175 Paths
  and the audit ([AUDIT.md](PART%20I%20%E2%80%94%20Phase%204.6%20Alternate%20Paths/AUDIT.md); also the [Phase 4.6 Alternate Paths Audit](https://claude.ai/artifact/4o2YWKYiA3KcaVGuST7i9C) doc).
  Its iPhone check is the [Phase 4.6 Third Release — iPhone Checklist](https://claude.ai/artifact/8PKQsDUZrAmxmPdPkehM4n) (Tests F to K,
  about seventeen minutes, a Result dropdown under each), walked headlessly on the live site after the
  merge: all hold.

- [x] **CONFIRMED on your iPhone 1 October (21/21) — PHASE 4.6 Alternate Paths, second release** (branch
  `claude/phase-4-6-alternate-paths-r2`, build `ab1363ad…`): the 9 Miscellaneous Paths and several Paths
  in one School. Its iPhone check is the [Phase 4.6 Second Release Checklist](https://claude.ai/artifact/7r7RjJqyNJfQN4ZQa8cpwX) (Tests A to E, about
  twenty minutes, a Result dropdown under each), walked headlessly on the live site after the merge: all hold.

- [x] **CONFIRMED on your iPhone 1 October (19/19) — PHASE 4.6 Alternate Paths, first release**
  (built on branch `claude/phase-4-6-alternate-paths`; `main` at `317ebca`, build `d8f889ef…`): the
  [Phase 4.6 iPhone Checklist](https://claude.ai/artifact/8ChDqk3nrwnhupozzTpyaG), six tests with a Result dropdown under each, and the
  seven Phase 0.7 Android checks at its end for when you have the phone.

- [x] **RULED 1 October (in the checklist) — a Path's Honor requirement reads the Honor block's Rank
  field**, as built (Points only when Rank is empty).

- [ ] **END OF PROJECT (your note, 1 October) — review how Glory, Status and Honour work and are
  calculated** across the sheet (its features disagree today on Honor's Rank and Points fields).

- [x] **CONFIRMED on your iPhone 1 October (9/9) — BUGFIX — Ancestor Corrections (Void
  Offer, Info Button, Clan Picker)** (built on branch `claude/bugfix-ancestor-corrections`; `main` at
  `5cd7117`, build `4551175e…`): check 4.23's Void offer, check 4.1's info button, and the Ancestor
  list following the Clan picker. Re-tested in the [Re-test Checklist](https://claude.ai/artifact/3kAFwsszUbfWjzprt4nqys) (Test 1,
  9/9); its Test 2 holds the seven Phase 0.7 checks for when you have an Android phone.

- [ ] **DEFERRED by you, 1 October — a once-a-session Ancestor gift already used should not be
  offered** (checks 4.18 and 4.23: Kuni's and Seppun's). Today it stays listed in the preview with a
  note, and ticking it asks whether to roll without it. Style feedback; build it later.

- [ ] **PHASE 15 (your ruling, 1 October) — the first Manage tap is slow, with a brief overlap of the
  labels** (checks 1.1, 1.3); later taps are quick. The label is written once the whole mode switch
  has run. Headless, the first tap is not measurably slower (13 ms against 4–7 ms; with 6× CPU
  throttling about 100 ms against 56–97 ms), so the likely cause is Safari's first restyle: time it
  on the iPhone first if it is to be fixed sooner.

- [ ] **PHASE 15 (your ruling, 1 October) — the Advantage configuration windows keep the older gold
  italic i** (`.adv-config-info`, Feature 4.54's), while the A01–A16 Advantages, and with the fix
  above the Ancestor card, carry the 28px ink i.

- [x] **DONE 1 October — YOUR iPHONE RESULTS: 47 of 52 passed.** The four owed checks (Phase 7, Phase
  4.8, the Manage fix and the Multiple Schools fix) were combined into one doc with a Pass/Fail table under each test:
  [iPhone Test Checklist](https://claude.ai/artifact/TqMLexNAa9gDgwVkHGB13y). It follows each folder's MANUAL-TESTS.md, with
  three corrections: Test 3's steps are reordered so added Skills cannot push Insight past Rank 3;
  Ancestor Part 9 applies a Family for each Clan (see the next item); a new character is started
  with Create New Character, then Exit and Leave in the wizard (New Blank no longer exists).

- [x] **FOUND 1 October (headless), FIXED in BUGFIX — Ancestor Corrections (confirmed on your iPhone) — the
  Ancestor list does not follow the Clan picker.** On Clan & School, changing only the Clan picker (no Family applied) leaves the
  previous Clan's Ancestors listed until the sheet next recalculates; Apply Family, or any edit,
  puts it right. Phase 4.8's card reads the picker but nothing redraws it on that change.

- [x] **CONFIRMED on your iPhone 1 October (5/5) — BUGFIX — Multiple Schools Keep Earlier
  Techniques** (built on branch `claude/bugfix-multiple-schools-techniques`; merged 1 October, `main`
  at `c7731cb`, build `7daf6aec…`).

- [x] **RULED 1 October — the monk Kiho rule (Core p. 246): applied in Phase 4.6's first release.** A
  monk's first Path grants exactly one Kiho at its Rank (later Paths none); the sheet grants the usual
  two for 9 of the 12 monk Paths unless the Path's own text says otherwise.

- [x] **RULED 2 October — the Multiple Schools gate for Phase 4.7: an Advanced School requires the
  Multiple Schools Advantage**, as the roadmap's scope says. Core p. 245 does not ask for it; the
  recommendation was to follow the book, and you chose the Advantage.

- [x] **CONFIRMED on your iPhone 1 October — PHASE 4.8 Ancestors (both releases) and BUGFIX — Manage
  Button Clipping** (built on branch `claude/phase-4-8-ancestors`). Ancestors 35/38: check 4.1 and the
  bug in 4.23 are corrected in BUGFIX — Ancestor Corrections; the rest of 4.18 and 4.23 is deferred.
  The Manage fix does its job (nothing moves); its slow first tap is in Phase 15.

- [ ] **DEFERRED TO PHASE 15 — the Clan & School page may be cluttered** (your Ancestor feedback,
  point 2, 30 September). Look at it in the UI consistency pass.

- [ ] **DEFERRED TO THE END OF THE PROJECT — a lost-favour Ancestor editable in Management** (your
  Ancestor feedback, point 9, 30 September). Today the card locks once the favour has been lost,
  as the book's Jealousy rule says. Your reasoning: someone in Management mode is there for a
  reason (testing, or a GM's house rules), and the sheet should not assume cheating. Build it then;
  Play mode keeps the lock.

- [ ] **WIKI CROSS-CHECK FOR THE ANCESTORS — blocked by the cloud session's network.** AUDIT.md's
  missing-Ancestor check covered the books; your two wiki pages could not be reached. Allow
  `magicalsamurai.wikidot.com` and `lasthaiku.wikidot.com` in the cloud environment's network
  settings, then ask for the cross-check.

- [x] **CONFIRMED on your iPhone 1 October (6/6) — PHASE 7, first release — save format and
  migration** (merged 30 September on your word). (The **sourcebook
  index** was merged the same day and needs no device check.) Until 1 October this reminder still
  asked you to merge both.

- [ ] **REVIEW AFTER COMPLETION — Manage as a separate screen (your idea, 30 September).** Instead of
  the sheet's fields switching between editable and static in place, **Manage** would open a
  separate screen, like the creation wizard. Parked: no work until the app is complete, then review
  it. Questions for that review are in the roadmap's *Deferred and declined* section.

- [ ] **REVIEW AFTER COMPLETION — Print on the Characters list's menu (your idea, 30 September).** The
  per-character menu (Export JSON, Save As a copy, Delete) would also offer Print. Parked: no work
  until the app is complete; review it with Phase 11.1 (Export to PDF), which plans Export PDF in the
  same menu.

- [x] **COMPLETE 30 September — PHASE 12.8 — the old toolbar replaced:** confirmed on your iPhone and merged; Phase 12 complete; built on
  branch `claude/phase-12-8-toolbar`
  ([README](PART%20K%20%E2%80%94%20Phase%2012.8%20Play%20Mode%20Toolbar/README.md),
  [MANUAL-TESTS](PART%20K%20%E2%80%94%20Phase%2012.8%20Play%20Mode%20Toolbar/MANUAL-TESTS.md)).

- [x] **COMPLETE 30 September — PHASE 12.7 — Combat in Play only:** confirmed on your iPhone and merged; built on branch
  `claude/phase-12-7-combat-visibility`
  ([README](PART%20K%20%E2%80%94%20Phase%2012.7%20Play%20Mode%20Combat/README.md),
  [MANUAL-TESTS](PART%20K%20%E2%80%94%20Phase%2012.7%20Play%20Mode%20Combat/MANUAL-TESTS.md)).
  Phase 12.8 (toolbar) started 30 September as its own release.

- [x] **FIXED and CONFIRMED on the iPhone 30 September — BUG FOUND 27 September — Dependant's optional inline text can be lost while typing.**
  In Management, start with a configured Dependant named `Akiko`, type `New name` in its inline
  name field and blur: the saved name remains `Akiko`. Reproduced on the exact pre-12.5 build,
  with 12.5 disabled and with the parent modes disabled. The provider commits on `change`, but
  the existing list `input` listener recalculates and rebuilds the field before that commit.
  Phase 4.5.8's direct-change tests did not cover real keystrokes. **Not fixed in 12.5**: proposed
  separate ring-fenced bugfix with actual typing/blur, save/load and removal tests. Check the
  arrangement field too; do not broaden this into an unrelated editor rewrite.
  **30 September: fixed** in
  [BUGFIX — Dependant Inline Typing](BUGFIX%20%E2%80%94%20Dependant%20Inline%20Typing/README.md),
  both fields covered; **confirmed on your iPhone and merged to `main`**.

- [x] **COMPLETE 28 September 2026 — PHASE 12.5 — Advantages & Disadvantages in Play:** owner reported
  successful testing and approved merging `codex/phase-12-5-adv-disadv` into `main`. Merged on 28 September. Management-only row editors,
  pickers and the shared configuration grid are gated by `MODES125`; Hotei's Contested Void Roll,
  Dark Paragon reset/use, contextual toggles, Darling court selection, Lost status, resource
  controls and information buttons remain live in Play. Final combined checks: **2,789/2,789**
  (**2,577 retained + 212 new**); **10/10 negative variants** match their exact expected failures.
  Retained named PASS results match baseline. Removal: **21 tests (20 passed, one Windows symlink
  skip)**; shared removal registry **11/11**; oldest Phase 11 live-tree removal checks **2/2**.
  The expanded focused matrix and deliberate failure variants are detailed in the
  [release README](PART%20K%20%E2%80%94%20Phase%2012.5%20Play%20Mode%20Advantages%20and%20Disadvantages/README.md).
  Rebuilt Phase 0 output: **3,100,276 bytes**, SHA-256
  `4f8509e68a05054b2c813575f77750c4598a9b4295d18faf266ecc10de06413a`; removal restores
  `7f187450905c96500f16015a3ffe0250d2a9ca49e24d882252a93061e3fc4ff0` exactly.
  Narrow/wide Chromium screenshots inspected; owner testing accepted on 28 September. No rules,
  save schema or Phase 1.5 registry seat changed. The QA review caught a kill-switch CSS leak and
  corrected it before release. On 28 September the owner reported **56% Codex weekly usage used
  through the work so far**; a release-specific delta is unavailable. See the current usage
  assessment above. Later phases remain unstarted.

- [x] **FIXED and CONFIRMED on the iPhone 24 September — BUG — A cancelled spell cast still uses the spell slot (every spell).** Found on the iPhone
  on 24 September through A14, then reproduced with no Advantage (Boundless Sight, Arrow's Flight):
  cancelling at the roll preview leaves the Element slot, bonus slot or Void Versatility Ring slot
  spent. Trunk `castSpell()` (`110-modals-trackers.js`) spends before the preview and never reads
  `rollWithModifiers()`'s `null` on Cancel; 4.5.20's `payWithRing()` does the same. Older than
  A01–A16: it dates from Phase 3 (Part G) adding a Cancel in front of every roll. Same shape, found
  by reading code: Maho Own-Blood Wounds survive a Cancel. Confirmed in code, not yet reproduced
  headlessly. Proposed: its own BUGFIX folder that refunds exactly what the cast took. See
  [the device audit](PART%20I%20%E2%80%94%20Phase%204.5%20Remaining%20Configuration%20Audit/IPHONE-AUDIT-A01-A16-2026-09-24.md), D1.
  **Owner's decision, 24 September: fix it now, in one BUGFIX folder with the bonus-pip bug below,
  including the Maho refund.** Shipped as
  [BUGFIX — Spell Slot Accounting](BUGFIX%20%E2%80%94%20Spell%20Slot%20Accounting/README.md).
- [x] **FIXED and CONFIRMED on the iPhone 24 September — BUG — The Spell Slots tab never appears on an iPhone.**
  Reported while testing the spell-slot fix: a fresh Isawa Shugenja in Safari (iOS 18.7, private
  browsing) had no Spell Slots tab. A diagnostic bookmarklet showed the cause: Safari reports
  `display:none` for anything inside a hidden carousel page, so once the page was hidden at load it
  could never be shown again. Fixed in
  [BUGFIX — Spell Slots Tab on Safari](BUGFIX%20%E2%80%94%20Spell%20Slots%20Tab%20on%20Safari/README.md). Confirm with the same bookmarklet: expect
  `pageHidden=false` and Spell Slots listed.
- [x] **FIXED and CONFIRMED on the iPhone 24 September — BUG — The installed web app's cache can refuse to load the page on Safari**
  ("Response served by service worker has redirections"). Phase 0.6's `sw.js` caches
  `fetch('./index.html')`; Cloudflare Pages redirects `/index.html` to `/`, so the cached response
  is marked as redirected and Safari refuses it for a page load. Proposed: its own BUGFIX folder
  that caches `./` directly (or rebuilds a clean response). Workaround until then: Settings → Safari
  → Advanced → Website Data → delete `pages.dev`. Recommended before Phase 11. **Owner's yes, 24 September.**
  Fixed in [BUGFIX — Service Worker Redirected Page](BUGFIX%20%E2%80%94%20Service%20Worker%20Redirected%20Page/README.md).
- [x] **COMPLETE 25 September — Phase 11, Characters List, Creation Wizard & Save Model (Part K).**
  Your choice on 24 September, built in stages: the Characters list and save model, then the
  wizard as Phases 11.2 to 11.2.4. **Confirmed on your iPhone and laptop, 25 September:** creating
  a character through the wizard, opening, Save As a copy, Export JSON, and Import JSON (a save
  renamed to `.json`). Picking an older `.l5r` save without renaming it needed a fix, built the
  same day (BUGFIX — Import File Picker Filter, below). **Its device check passed on your iPhone
  the same afternoon:** Import offered Choose File, and `Sairyu_.l5r` was picked and imported
  without renaming. **Export to
  PDF is Phase 11.1**, split out on 24 September and not started. Play mode, the old toolbar's
  replacement and Save As from Management mode belong to Phase 12.
- [x] **BUILT and MERGED 30 September in Phase 7, CONFIRMED on the iPhone 1 October — FINDING — An imported older save keeps its older layout until it is opened.** **Ruled 25
  September: belongs to Phase 7** (migration), together with Phase 11's finding that the sheet writes
  format 3 while `SHEET_SCHEMA_VERSION` still says 2. Nothing is lost meanwhile: the sheet reads both. Found
  25 September from your note that an export looked like the old format. Import stores the file
  exactly as picked, and the list's Export JSON and Save As a copy copy that stored data. Measured
  with `Sairyu_.l5r`: exported without opening it, the file is byte-for-byte the import (no format
  number); opened on the sheet first, it exports as the current format 3. The sheet reads both, so
  nothing is lost. **Not changed:** your ruling wanted on whether Import should convert on the way
  in.
- [x] **BUILT and MERGED 30 September in Phase 7, CONFIRMED on the iPhone 1 October — FINDING — Export file names drop accented letters.** "Sairyū" exports as
  `Sairy_.l5r.json`: the name keeps only a to z, 0 to 9, hyphen and underscore. Cosmetic; the
  name inside the file is intact. Not changed. **Ruled 25 September: fix it with the next change to
  export** (Phase 11.1 or Phase 12's toolbar work), not on its own.
- [x] **FIXED and CONFIRMED on the iPhone 25 September — BUG — Apply School adds placeholder
  Skill rows for four Schools — MEASURED WIDER: 69 of the 104 Schools.** Fixed in
  [BUGFIX — Apply School Skill Rows](BUGFIX%20%E2%80%94%20Apply%20School%20Skill%20Rows/README.md); the iPhone
  checks are in its update below. The first measurement ("about 45 of the 79") was a static scan
  of two libraries; the fix's sweep of all 104 Schools through the real button gives 69. Measured on the live site: every School Skill written
  "Lore: X", "Craft: X", "Perform: X" or "Games: X" (Kitsu's Lore: History and Lore: Theology, Hida's
  Lore: Shadowlands, Kaiu's Craft Skills, and so on) is added with **no Trait**, and its roll button
  refuses ("Set a Trait for this skill before rolling") until one is typed, because the Skill lookup
  matches exact names only. The wizard avoids it only for "Lore (pick one)". **Ruled 25 September:**
  fill a blank Trait wherever the Skill's family makes it clear, including in existing saves; leave
  placeholder rows in existing saves for the player to delete. Being built as BUGFIX — Apply School
  Skill Rows. The original entry follows. Found building Phase
  11.2.2 on 25 September. Tsi Smith [Artisan] gets rows named "Bugei", "or Merchant Skill" and "two
  ranks in any one Craft Skill", and Kasuga Smuggler [Courtier] gets "Merchant" and "or Low Skill",
  because the library writes one free choice across commas. Mirumoto Bushi and Shiba Bushi list
  "Theology" (the sheet's Skill is "Lore: Theology") and Kaiu Engineer lists "War Fans" (the sheet's
  is "War Fan"), so Apply School adds rows with no Trait. The wizard reads the choices correctly; the
  rows are trunk behaviour and library data. Proposed: its own BUGFIX folder.
- [x] **DONE 25 September — DATA — Starting spells for every Shugenja School.** You sent each
  School's entry from the books; Phase 11.2.4 records the 20 that 11.2.3 lacked, so all 21
  Shugenja Schools in the library have their "Spells:" line. Kitsune [Mantis] was removed from the
  library at your request first (it copied the Fox Clan's School).
- [x] **SKIPPED 25 September — DATA — Five pages not given.** Fuzake (Secrets of the Empire),
  Ninube (Great Clans), and Horiuchi, Yogo Wardmaster and Yoritomo (no book named) show "page not
  yet recorded". Your ruling: skip them. Kitsu stays p.118, as you confirmed.
- [x] **RESOLVED 25 September — Seppun Shugenja's starting spells.** The first quotation gave 2
  Water spells, Seppun's own Deficiency, which the sheet allows none of at Rank 1. You sent the
  entry again: **3 Fire, 2 Earth, 1 Air**. Corrected.
- [ ] **FEEDBACK — Remove a Skill bought with XP in the wizard, with its XP refunded.** Your
  observation from the iPhone test of 25 September, recorded, **not built**. An Asahina Shugenja
  added Etiquette and Investigation on the wizard's Skills step, deliberately not as free School
  choices, and the wizard correctly charged XP for them. Changing your mind, there was no way to
  remove them and get the XP back: lowering the Rank to 0 leaves the row, which then rolls as
  Unskilled (and meets the Rank 0 exploding-10s bug below). Wanted: a Skill that is neither a
  School Skill nor a free choice can be removed in the wizard, refunding its XP, as the sheet
  itself already allows outside the wizard.
- [ ] **FEEDBACK — An ⓘ info button on Skills, Spells, Advantages and Disadvantages.** Your design
  suggestion of 25 September, recorded, **not built**: the same circled-i the sheet already uses
  for Advantage tooltips, shown against each Skill, Spell, Advantage and Disadvantage (in the
  wizard's lists as well as the sheet).
- [ ] **REVIEW — Do a Shugenja's starting spells begin memorised?** Your design question of 25
  September, deferred for research and **not built**. Should starting spells be memorised (no
  scroll needed) and, like School Skills, cost no experience to memorise? Today each is added with
  its Spell Scroll and none is memorised. Needs the rulebook's text on memorisation and starting
  spells before deciding.
- [ ] **BACKLOG — A01–A16 device-pass items, parked 24 September.** The owner parked every other
  device-pass item so the roadmap can move again. Each one is listed, with Claude's recommendation,
  under "Device-pass decisions and backlog" below. Pick them up when a phase touches the same code,
  or in Phase 15 (UI Consistency Pass) for the interface items.
- [x] **ACCEPTED on your Windows pass, 3 October — Rank 0 Skill-table rolls explode 10s.** The owner unparked it with the dice release. Its separate BUGFIX layer covers Skill-table rolls and untrained attacks; the list remains correct. Void's Rank 0-to-1 option and Soul of Artistry retain normal explosions. Focused checks: 19/19. You accepted the Windows pass as sufficient on 3 October; the iPhone layout check is non-blocking and Not run (corrected 7 October: this reminder had stayed open).

- [x] **FIXED and CONFIRMED on the iPhone 24 September — BUG — Hand-tapped bonus spell-slot pips can exceed the shared pool, and taking one back
  strips another element's pip.** Reproduced 23 September (Water 2, Fire 2, Void 3): fill the shared
  bonus pool by casting, then tap an EMPTY bonus pip by hand on another element. The shared total
  stays capped at the Void Rank, but that element's own fill count still rises, so the rows show
  more bonus pips than the pool holds (4 shown against 3). Taking bonus pips back on Water then also
  removes one of Fire's, because each row's fill is trimmed to the shared total. Casting and ordinary
  slot pips never cause it (a 60-session randomised run found no cross-element change without the
  hand-tapped bonus pip). Trunk code: the manual bonus-pip handler in `080-identity-build-ui.js` and
  `renderSpellBonusPips()` in `110-modals-trackers.js`. Proposed fix, own BUGFIX folder: refuse a
  hand-tapped bonus pip when the pool is full (as casting does); a take-back changes only the row
  tapped; repair saves that already show more than the pool once on load — **needs an owner ruling
  on which element's pips a repair removes**, since a save does not record that. Kept open at the
  owner's request. **Ruled 24 September: never remove pips automatically; warn that the rows show
  more than the pool holds, and let the corrected take-back fix it.** Fixed with the spell-slot
  bug above, in the same folder.
- [ ] **REVIEW — Seven Fortunes' Blessing: one Blessing per character.** Discussed 23 September;
  deferred by the owner for review at an appropriate time. Core p.148 bans two members of the same
  Advantage family. Proposal on the table: flag (never delete) a second Blessing row; a Blessing and
  a Curse from different Fortunes stay allowed (the source says so explicitly). Until reviewed, 4.5.21
  neither flags nor blocks a second Blessing row.
- [ ] **REVIEW — Seven Fortunes' Blessing: changing the Fortune on an existing row.** Discussed 23
  September; deferred by the owner. Proposal on the table: changing the Fortune re-prices the row
  (e.g. Benten 4 → Bishamon 5) because it corrects the choice; Naishou Citizen's "a later purchase
  replaces your Blessing without a refund" belongs to A08, not A01. Until reviewed, 4.5.21 prices the
  row by the currently chosen Fortune, like every other configured entry. A08 shipped as 4.5.22
  on 23 September **without** replace-without-refund; that purchase history waits on this review.
- Both Blessing reviews above were **parked on 24 September** with the rest of the device-pass
  backlog (item 15 below carries Claude's recommendation for each).
- [ ] **REMAINING PHASE 4.5 SCOPE — D06 Weakness and Hotei (D04b's second half).** Neither is built,
  and the 25 September kickoff did not list them. D06 has an approved approach (the Disadvantage
  table further down) but needs boundary rulings (Insight, dependent Rings, Ring-derived resources)
  and reaches every Trait consumer, so it is new machinery rather than a catalogue row. Hotei stays
  recorded as source-blocked. **Ruled 25 September: after Phase 12's first build stage.**

## Historical update — 25 September 2026: Claude project estimate and the week at 96%

**Superseded planning snapshot.** Preserve the original estimate and readings below as history,
not today's status, remaining allowance or next-session instructions. Phase 12.5 has since merged;
use the 28 September assessment and handoffs above. These Claude percentages do not predict Codex
cost, and the old reset time must not be applied to the current account reading.

> **Usage: 96% of this week** by your reading, up from 95% (1 point for the estimate below and this
> ledger update). The week resets **Wednesday 30 September at 02:00**.

### Projected length of the project — AN ESTIMATE, not a measurement (25 September 2026)

Recorded at the owner's request so future sessions can judge the state of the project and choose
what to build next. **It is Claude's estimate, anchored on the costs in this ledger; treat it as
one input and re-derive it.**

**Estimate: about 3 more weeks of the weekly allowance (range 2–4); roughly 4–6 weeks of calendar
time**, because the source-gated work, desktop sessions and iPhone checks move at the owner's pace
rather than the allowance's.

**The pace it is based on.** Since 18 September (when the last estimate was asked for, after
BUGFIX — Negative Roll Modifier Display, the week then at 92%), roughly one week's allowance plus 25
September built: all of A01–A16 and their iPhone pass; five bugfixes; Phase 11 in full (Characters
list, save model, the wizard in five stages); the shared removal chain and the Apply School fix;
the Phase 12 audit and five Phase 12 tab parts plus Techniques. Releases now cost about **1–4%
each**, against 4–18% in mid-September, mainly because new work reuses machinery that exists (the
pipeline, the registries, the modes gate, the removal chain).

| Work left | Estimate (share of one week's allowance) | Why |
|---|---:|---|
| Phase 12: Adv & Disadv (12.5), Combat hidden in Management, toolbar replacement | 10–15% | Mostly known shape; Combat carries the Safari risk |
| Phase 4.5 remainder: D06 Weakness, Hotei | 10–20% | D06 is new machinery touching every Trait; both need rulings |
| Phase 7: migration, the Import/Export findings | 8–15% | Depends on how much of the audit log is actually wanted |
| Phase 11.1: Export to PDF | 3–15% | Cheap if the existing Print button works on iOS; dear if a PDF library is needed |
| Phase 9 remainder: School flavour text | 5–10% | Needs the sourcebooks (desktop) |
| Phases 4.6, 4.7, 4.8: Alternate Paths, Advanced Schools, Ancestors | 30–70% | Content-heavy and source-gated; the biggest uncertainty |
| Phase 6: Technique synergy | 15–30% | Source-gated; 98 techniques have no description yet |
| Phases 13 and 14: Library and Search | 25–50% | A PDF viewer inside a single-file app is real engineering |
| Phase 15: UI consistency pass, plus the parked UI feedback | 15–25% | Audit first; scope depends on what it finds |
| Parked backlog: A03 extras, Blessing reviews, Rank 0 bug, wizard feedback, starting spells | 15–25% | Small items that add up |

**The work totals roughly 135–275% of a week's allowance, about 1.5–3 weeks.** Margin has been added
for device corrections and the new items each test round tends to raise, which gives **2–4 weeks,
most likely about 3**.

**What could move it:**
- **Longer:**
  - The source-gated phases (4.6–4.8, 6, 13): they depend on extracting and checking sourcebook text.
  - New feedback: every iPhone pass so far has added work.
  - Phase 10 (Equipment) is left out, because it isn't scoped yet.
- **Shorter:**
  - Parts that reuse existing machinery keep coming in at the low end, as Phase 12's did.
  - Descoping the audit log in Phase 7, or the heavier parts of Library and Search, would save the
    most.

**Most of the remaining risk sits in the sourcebook-dependent phases, not in the engineering.**
Staging the book extracts early, as the owner did for the starting-spell lines, would do more for
the timeline than anything else.

### Proposed next phase, and handoff files for a new session

**Proposed: finish Phase 12, one part per tab.**

| Order | Part | Estimate |
|---|---|---:|
| 1 | **12.5, Advantages & Disadvantages in Play.** The trunk rows and pickers, plus the 8 configured-entry Management classes, lock; the 9 in-play classes and every info button stay live | 2–4% |
| 2 | **12.7, Combat hidden in Management.** Uses the carousel's visibility path, Safari emulation and a device check | 2–4% |
| 3 | **12.8, the old toolbar replaced**, and Save As from Management | 3–5% |

- **Timing:** with the week at 96%, none of these should start before the reset on Wednesday
  30 September, unless the owner chooses otherwise.
- **Meanwhile, with no code:** the owner can test "🖨 Print / Export PDF" on iOS, which sizes Phase
  11.1, and can stage sourcebook extracts, starting with Ancestors (4.8).
- **After Phase 12:** 11.1, then Phase 7 (with the audit log descoped unless it is wanted), then D06
  Weakness and Hotei, then the source-gated phases as extracts arrive. Phase 15 comes last.

A new session should start from `CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-09-25.md`, or from
`GPT-SESSION-KICKOFF-NEXT-SESSION-2026-09-25.md` for ChatGPT/Codex. **Both ask the session to make
its own assessment of cost and the remaining roadmap first**, and to give point-by-point reasons
wherever it differs from this proposal.

## Previous update — 25 September 2026: Phase 12 — Techniques in Play (12.6)

> **Confirmed on your iPhone, 25 September, and merged to `main`.** **Usage: 95% of this week** by
> your reading, up from 94% (1 point). Built before Advantages & Disadvantages at your choice (that part, 12.5, is too big for
> the week's remaining ~6%).

**What to test:** in Play (button reads *Manage*), each Techniques entry's name, XP and description
can't be changed, its remove button is gone, a spell's memorised tick can't be changed, and the
Techniques picker, Alternate Path picker and Add are gone. **A spell's Cast still works**, as do
"Why can't I cast this?" and the Kiho rules button. The Advantages tab is unchanged. Tap *Manage*:
everything edits again.

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,095,845 bytes**, SHA-256 `7f187450905c96500f16015a3ffe0250d2a9ca49e24d882252a93061e3fc4ff0` |
| Full QA | **2,577/2,577**: 2,561 retained + 16 new, no earlier check changed |
| Variants | **6 of 6** pinned variants fail where expected, including rows not scoped to Techniques and Cast wrongly locked |
| Removal | **Byte-identical** to `4ac2b09f…` (part 5) |
| Found while building | Marker-shaped prose in the fragment's comment (the remover refused it, as designed) and a harness check where Add and remove cancelled out; both fixed |
| Device | **Confirmed on your iPhone**, 25 September |
| Usage | **95% of this week**, up from 94% |

See [the part](PART%20K%20%E2%80%94%20Phase%2012.6%20Play%20Mode%20Techniques/README.md).

## Previous update — 25 September 2026: Phase 12, part 5 — Skills in Play

> **Confirmed on your iPhone, 25 September, and merged to `main`.** **Usage: 94% of this week** by
> your reading, up from 93% (1 point for the handoff files and this part together). Built at your
> request with about 7% of the week left, after the handoff files for Claude
> and ChatGPT/Codex (`CLAUDE-SESSION-KICKOFF-PHASE-12-2026-09-25.md`,
> `GPT-SESSION-KICKOFF-PHASE-12-2026-09-25.md`), which are on the same branch.

**What to test:** in Play (button reads *Manage*), each Skill row's name, Trait, Rank, School tick and
Emphases can't be changed, the row's remove and + Emph buttons are gone, and Add Skill / Load Full
Skill List are gone. **Each row's d10 still rolls**, Untrained Skills still works, and Skill Info
still opens. Tap *Manage*: everything edits again.

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,093,125 bytes**, SHA-256 `4ac2b09f5ba7f3c2945bcce71f0f64e1fdc79a4d1d92754eb5aea2d66cf8adc1` |
| Full QA | **2,561/2,561**: 2,544 retained + 17 new, no earlier check changed; 8/17 on part 4's build |
| Variants | **6 of 6** pinned variants fail where expected, including the d10 wrongly locked |
| Removal | **Byte-identical** to `f3174bba…` (part 4) |
| Found while building | The row buttons stayed visible in Play (the table's own styles outranked part 1's rule); fixed with this tab's own rule |
| Device | **Confirmed on your iPhone**, 25 September |
| Usage | **94% of this week**, up from 93% |

See [the part](PART%20K%20%E2%80%94%20Phase%2012.4%20Play%20Mode%20Skills/README.md).

## Previous update — 25 September 2026: Phase 12, part 4 — Rings & Traits in Play

> **Confirmed on your iPhone, 25 September, together with parts 1 to 3, and merged to `main`.** All
> four parts work as described. **Usage: 93% of this week** by your reading, up from 91% before
> this part (2 points, inside the 1–2% estimate).

**What to test:** in Play (button reads *Manage*), the Trait and Ring boxes on Rings & Traits show
as plain text and cannot be edited, and the Void **Ring** − / + buttons are gone. The Void **Point**
pips still spend and restore Void Points. Tap *Manage*: everything edits again.

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,089,890 bytes**, SHA-256 `f3174bba1fa485221579882528163e7de22a666e43b79cb8e6d17c7f73371798` |
| Full QA | **2,544/2,544**: 2,528 retained + 16 new, no earlier check changed; 8/16 on part 3's build |
| Variants | **6 of 6** pinned variants fail where expected, including the Void Point pips wrongly locked |
| Removal | **Byte-identical** to `c4ddd6fb…` (part 3) |
| Device | **Confirmed on your iPhone** (parts 1 to 4), 25 September |
| Usage | **93% of this week**, up from 91% |

See [the part](PART%20K%20%E2%80%94%20Phase%2012.3%20Play%20Mode%20Rings%20and%20Traits/README.md).

## Previous update — 25 September 2026: Phase 12, part 3 — Identity in Play

> **Merged to `main`, 25 September, at your request.** **Usage: 91% of this week** by your reading,
> up from 90% before this part (1 point, under the 1.5–3% estimate). An iPhone test of this part was
> not reported before the merge; the checks below are still worth a look.

**What to test:** in Play (button reads *Manage*), the Identity tab's Name, Clan, Family, School,
Gender, Age, the Honor/Glory/Status **ranks**, and XP total and adjustment show as plain text and
cannot be edited; **Honor, Glory and Status points and Taint still can** (your ruling). + Add School
is hidden. Tap *Manage*: everything edits again.

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,088,014 bytes**, SHA-256 `c4ddd6fbd9cdc6bd743509ff93936673996922c2956237bb17b8dad27ceae932` |
| Full QA | **2,528/2,528**: 2,511 retained + 17 new, no earlier check changed; 7/17 on part 2's build |
| Variants | **6 of 6** pinned variants fail where expected, including a points field wrongly locked |
| Removal | **Byte-identical** to `d6c0c79b…` (part 2) |
| Usage | **91% of this week**, up from 90% |
| Device | **Confirmed on your iPhone** with parts 1 to 4, 25 September (after the merge) |

See [the part](PART%20K%20%E2%80%94%20Phase%2012.2%20Play%20Mode%20Identity/README.md).

## Previous update — 25 September 2026: Phase 12, part 2 — Clan & School in Play

> **Merged to `main`, 25 September, at your request.** **Usage: 90% of this week** by your reading,
> up from 89% before this part (1 point, inside the 1.5–2.5% estimate). An iPhone test of this part
> was not reported before the merge; the checks below are still worth a look.

**What to test:** in Play (button reads *Manage*), the Clan & School tab shows your Clan, Family and
School as plain text, and Apply Family / Apply School are gone. The Shugenja Affinity details button
still works. Tap *Manage*: the pickers and both Apply buttons are back and work. A character opened
from the Characters list opens with the tab locked.

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,085,178 bytes**, SHA-256 `d6c0c79b2e42cef57ce2a061420b229bb482e39d67af35beb3b4a3066d158bd3` |
| Full QA | **2,511/2,511**: 2,497 retained + 14 new; 8/14 on part 1's build (exactly the six lock checks fail) |
| Variants | **5 of 5** pinned variants fail where expected |
| Removal | **Byte-identical** to `6c860a52…` (part 1) |
| Noted, not changed | The tab's "Pick your Clan… then apply each" introduction still shows in Play |
| Usage | **90% of this week**, up from 89% |
| Device | **Confirmed on your iPhone** with parts 1 to 4, 25 September (after the merge) |

See [the part](PART%20K%20%E2%80%94%20Phase%2012.1%20Play%20Mode%20Clan%20and%20School/README.md).

## Previous update — 25 September 2026: Phase 12, part 1 — Play and Management modes (machinery and Background)

> **Confirmed on your iPhone, 25 September, and merged to `main`.** Everything worked as described:
> the toggle, Background locked in Play, Play from the Characters list and the wizard, Management
> from the toolbar's Load. **Usage: 89% of this week** by your reading, up from 87% before this part
> (2 points). Phase 12 is being built one tab per part, at your request, so each part is small
> enough to test and merge on its own and a usage limit cannot strand a half-built stage.
>
> **Your question, answered:** the old toolbar's Load opens in Management for testing reasons, not
> for players: about ten retained suites load through it and then edit, and would otherwise need
> corrections in every later part. The Characters list is the intended way in, and the toolbar is
> replaced in a later Phase 12 part, where the difference disappears. Left as it is for now.

**What to test:** a **Manage / Done** button now sits beside the character's name. Open a character
from the Characters list: it opens in **Play** (the button reads *Manage*), and the Background tab's
four boxes show their text as plain text and cannot be edited. Tap *Manage*: they edit again, and the
button reads *Done*. A blank sheet, or a load through the old toolbar, opens in Management. **Only
Background is locked in this part**; the other tabs follow one part at a time.

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,083,017 bytes**, SHA-256 `6c860a52b8e3215c7011484e90f8d33c991b347c4211e83fcb9d94a63bf857a9` |
| Full QA | **2,497/2,497**: 2,472 retained + 25 new; 11 of 11 pinned variants fail where expected |
| Found while building | An infinite loop on the first tap of the toggle (caught by the harness, fixed), and a harness blind spot (fixed, with its own variant) |
| Cross-phase fixture | Phase 11's `CL-COPY-INDEPENDENT` switches to Management before editing Notes, only when Phase 12 is present: 70/70 both ways |
| Removal | **Byte-identical** to `0dcb56e8…` |
| Device | **Confirmed on your iPhone** (branch preview), 25 September |
| Usage | **89% of this week**, up from 87% before this part |

See [the part](PART%20K%20%E2%80%94%20Phase%2012%20Play%20and%20Management%20Modes/README.md).

## Previous update — 25 September 2026: Phase 12 audit, and the week at 85%

> **Usage: 85% of this week** by your reading, up from 79% at the start of this session: 6 points
> for the removal chain, BUGFIX — Apply School Skill Rows and this audit together, not split. The
> week resets on Wednesday 30 September at 02:00. **Phase 12's build waits for next week's
> allowance, as agreed.**

**The audit is Phase 12's first deliverable, and no code.** It lists every control on all ten tabs,
measured in the live build (plus the 17 control classes the configured Advantages and Disadvantages
add, read from their source), and sorts each into Management-only, Play or information under your
rulings. It recommends one capture-phase gate and a selector registry instead of a gate in every
handler, because the sheet keeps its state in its own inputs and most edits have no function to
gate. That is also why its estimate is lower than the kickoff's: **about 17–27% over three stages**
(12, 12.1, 12.2). Only three retained harnesses reach Play under your default-mode ruling. See
[the audit](PART%20K%20%E2%80%94%20Phase%2012%20Play%20and%20Management%20Modes%20Audit/AUDIT.md).

**Its four rulings were taken as recommended, 25 September:** "inert" means every user event on a
Management control is stopped in Play, while the sheet's own code writing values keeps working;
Honor, Glory and Status points and Taint stay editable in Play, ranks are Management-only; the
toggle is a small "Manage" button beside the character's name, reading "Done" in Management; and
Play shows a Management-only field's value as plain text. **Stage 12 is ready to build** on next
week's allowance. The ledger artifact is deliberately not republished yet (your instruction).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | Unchanged: **3,072,896 bytes**, SHA-256 `0dcb56e8…` |
| Audit | Ten tabs: Clan & School 6 Management-only kinds, Identity 11 (plus 7 awaiting a ruling), Rings & Traits 14, Skills 11, Adv & Disadv 16, Techniques 8, Background 4; Spell Slots, Equipment and Combat all Play |
| Removal chain, older folders | The six converted `verify-variants.py` runs: see the registry README (Phases 11, 11.2, 11.2.1 and the Kitsune fix all as expected) |
| Device | BUGFIX — Apply School Skill Rows **confirmed on your iPhone** (all four checks) and merged to `main` |

## Previous update — 25 September 2026: BUGFIX — Apply School Skill Rows

> **Confirmed on your iPhone, 25 September,** on the branch preview: all four checks below worked as
> described, and the fix was merged to `main`. Built and verified headlessly first. Usage: see
> the update above (85% after this, the removal chain and the Phase 12 audit together).
>
> **To check on the iPhone** (after a merge to `main`, or on a Cloudflare preview of the branch):
> 1. Apply **Kitsu Shugenja**: *Lore: History* and *Lore: Theology* show **Intelligence**, and the
>    d10 on each rolls.
> 2. Apply **Mirumoto Bushi**: the row reads **Lore: Theology**, not "Theology".
> 3. Apply **Tsi Smith [Artisan]** (Minor Clan → Oriole): only Commerce and Defense are added,
>    and the status line says 4 choices are left. No "Bugei" or "or Merchant Skill" rows.
> 4. Open a character you made **before** this fix that has a Lore Skill: its Trait is now filled.
>    Placeholder rows it already had are still there, for you to delete.

**The bug was much wider than recorded.** Every School Skill written "Family: Subject" (Lore: X,
Craft: X, Perform: X, Games: X) was added with no Trait, and its roll refused until one was typed:
**69 of the 104 Schools**. Also fixed: Mirumoto's and Shiba's "Theology" and Kaiu's "War Fans"
(corrected in the School library, so every reader agrees), Tsi Smith's and Kasuga Smuggler's
placeholder rows, and one case nobody had recorded, found by the fix's own sweep: The Order of
Jurojin's Blessing split "Medicine (Disease, Herbalism)" at the bracketed comma into two nonsense
rows. The character check and the second-School Technique unlock now read a School's Skills the
same way. Your ruling on existing saves holds: blank Traits are filled, placeholder rows are left.
See [the fix](BUGFIX%20%E2%80%94%20Apply%20School%20Skill%20Rows/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,072,896 bytes**, SHA-256 `0dcb56e8c02efbb1c7dba6e9d61da29b7e355009f47b2777c7d481bbdb1ed5d1` |
| Full QA | **2,472/2,472**: 2,435 retained + 37 new; **13/37** on the pre-fix build |
| Key checks | A sweep applies all 104 Schools through the real button (578 School Skill rows) against the sheet's own `SKILL_LIBRARY`; an older save keeps its names and placeholder rows and shows no new warning |
| Removal | **Byte-identical** to `738c7ccf…` (commit `322d9e6`); 15/16 fixtures pass, 1 symlink skip on Windows |
| Sensitivity | **12 of 12 pinned variants** fail where expected; the first run found three checks nothing could turn red, and three variants were added for them |
| Removal chain | **Its first use:** one line in the registry, and all eight earlier live fixtures strip this fix with no edit to their folders |
| Found alongside | This desktop's Python cannot see `AppData\Roaming`, so Node launched from a Python script could not find Playwright. The tooling now lives in `C:\Users\jcrow\l5r-qa-tools` (recorded in `CLAUDE.md`) |
| Device | **Confirmed on your iPhone**: all four checks, on the branch preview, 25 September |

## Previous update — 25 September 2026: rulings for the next phase, and QA — Removal Chain Registry

> **Usage: 79% of this week** by your reading after this session's assessment (77% after the Import
> fix). **The week resets on Wednesday 30 September at 02:00**, by your reading; the kickoff had
> guessed a Tuesday. **Agreed plan for the rest of the week:** the shared removal chain (below), then
> BUGFIX — Apply School Skill Rows, then Phase 12's audit. Phase 12's build starts on next week's
> allowance.

**Your rulings, 25 September.** All nine went with the recommendation:

| # | Question | Ruling |
|---:|---|---|
| 1 | Usage | 79%; resets Wednesday 30 September at 02:00 |
| 2 | Order | Shared removal chain, then the Apply School bugfix, then the Phase 12 audit this week; Phase 12's build next week |
| 3 | Existing saves (Apply School) | Fill a blank Trait where the Skill's family makes it clear; leave placeholder rows for the player to delete |
| 4 | Phase 12 default mode | Play when opened from the Characters list or finished in the wizard; Management otherwise; the mode is never saved into the character |
| 5 | Tabs the roadmap left out | Clan & School read-only in Play; Rings & Traits read-and-roll in Play; Spell Slots fully usable in both |
| 6 | In-play Advantage controls | Use, Reset, invoke and session toggles stay live in Play mode |
| 7 | Import/Export findings | The older-format import and the format-number mismatch go to Phase 7; accented file names get fixed with the next change to export |
| 8 | D06 Weakness and Hotei | After Phase 12's first build stage |
| 9 | Test tooling | Node.js and Playwright installed on the desktop; the combined suite now runs there (2,435/2,435 on its first run) |

**QA — Removal Chain Registry.** Every Part K stage's removal fixture used to carry its own list of
the releases built after it, and each new release had to be added to every earlier list (14 files in
8 folders by the Import fix). A missed list failed silently, as Phase 11's did from 11.2 to 11.2.3.
There is now one list, and a new release adds one line to it. Test infrastructure only: the sheet
and its build are unchanged. See
[the registry](QA%20%E2%80%94%20Removal%20Chain%20Registry/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | Unchanged: **3,062,010 bytes**, SHA-256 `738c7ccfa3bdf67a6ca160371508fe22521cac845b883119b95a5a4e9490958a` |
| Full QA | **2,435/2,435** on the Windows desktop (first run there); the registry changes no sheet source |
| Registry checks | **11/11**; six sabotage variants on scratch copies of `Versions/` each go red where expected |
| Converted fixtures | All eight `test-removal.py` suites pass; one symlink test skips in each on Windows |
| Also corrected | Stale rows in the roadmap (Phases 0, 0.5, 0.6, 9, 4.5, and 12's dependency on 4.8), this ledger ("Ahead", the remaining-4.5 note, the bugfix count, the "Fully done" count) and `CLAUDE.md` ("iPhone pending" on 4.5.13 and 4.5.14) |

## Previous update — 25 September 2026: BUGFIX — Import File Picker Filter, and Phase 11 complete

> **Confirmed on your iPhone, 25 September.** On the Characters screen, Import offered Photo
> Library, Take Photo or Video and Choose File; Choose File opened Files, where `Sairyu_.l5r`
> (9 KB, in the Chrome folder) was no longer greyed out, and it imported without renaming.
> **Usage: 77% of this week** by your reading after the fix, up from 74%.
>
> **Next:** a proposed next phase, and a kickoff prompt for a fresh session, are in
> [`CLAUDE-SESSION-KICKOFF-NEXT-PHASE-2026-09-25.md`](CLAUDE-SESSION-KICKOFF-NEXT-PHASE-2026-09-25.md).
> The proposal is the BUGFIX for Apply School's placeholder Skill rows, then Phase 12's first
> stage. Nothing is built until you confirm, and the new session is asked to reach its own view.

**Your iPhone could not pick an older save.** Both Import controls told the browser to offer only
JSON files, and iOS greys everything else out, including a save named `.l5r`, the sheet's older
extension. It was the sheet's filter, not an iOS limitation: renamed to `.json`, your file
imported. The filter is lifted from both controls; each import still refuses a file that is not
JSON or not a character save. On the iPhone the picker may now offer Photo Library and Take
Photo beside Choose File; choose Files. See
[the fix](BUGFIX%20%E2%80%94%20Import%20File%20Picker%20Filter/README.md).

**Phase 11 is complete**, on your checks of 25 September (open reminder above). Export to PDF is
Phase 11.1.

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,062,010 bytes**, SHA-256 `738c7ccfa3bdf67a6ca160371508fe22521cac845b883119b95a5a4e9490958a` |
| Full QA | **2,435/2,435**: 2,425 retained + 10 new; 6/10 on the pre-fix build, failing exactly the four filter checks |
| Removal | **Byte-identical** to `480e1a15…` (commit `d07b03f`); Phase 11's remover refuses while it is present; 15/15 fixtures |
| Found alongside | An imported older save stays in its older layout until opened; export names drop accented letters (open findings above) |
| Device | **Confirmed on your iPhone:** `Sairyu_.l5r` picked through Choose File and imported without renaming |
| Usage | **77% of this week** by your reading, up from 74%: 3 points for the fix, the Phase 11 write-up and the merge |

## Previous update — 25 September 2026: Phase 11.2.4 — Wizard Starting Spells for Every School

**Built from your quotations and verified headlessly.** Every Shugenja School now has its own
rulebook "Spells:" line in the wizard: the 20 you sent today, plus Kitsu from 11.2.3. Seventeen
are Element counts and work exactly like Kitsu's. Four are not, and are read as follows:
- **Fuzake:** Path to Inner Peace is given (with its scroll), and the Water box asks for one more.
- **Isawa:** four boxes (3 of one Element, 2 of another, 1 of a third, 1 of a fourth).
- **Chuda (Spider):** 3 Maho of one Element, 2 Maho of a second Element that is not your chosen
  Deficiency, and any 1 spell that is not of your Deficiency.
- **Yogo Wardmaster:** Commune and Summon (no Sense), 3 Ward spells and 3 other spells that are
  not Void. "Ward" is the library's Wards keyword plus the 17 spells your quotation lists.

For those, you never pick an Element: the sheet could not keep it. Your learned spells are matched
to the boxes in whichever way fills the most, so the order you choose them in never matters. One
picker offers only the spells that would fill a box and that the sheet lets you learn now. See
[the phase](PART%20K%20%E2%80%94%20Phase%2011.2.4%20Wizard%20Starting%20Spells%20for%20Every%20School/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,060,080 bytes**, SHA-256 `480e1a157c4f9a1ad259e4d141d2e262e574da3926909a7d7393f878b6fae890` |
| Full QA | **2,425/2,425**: 2,354 retained + 71 new |
| Key checks | One check per School's line and one walk per School to its Spells step (40); every picker against the sheet's own Technique picker; `CW5-SAME-AS-BY-HAND` with a Maho spell |
| Removal | **Byte-identical** to `63b51115…` (commit `90d3452`); 11.2.3's and 11.2.2's removers refuse while it is present; 15/15 fixtures |
| Sensitivity | Nine pinned variants each fail where expected; the first run found two blind spots (Chuda's Deficiency, earlier boxes first), now checked by cases where the rule changes the count |
| Found while building | **Seppun's first line asked for 2 Water spells, its own Deficiency**, which the sheet allows none of at Rank 1; you corrected it to 3 Fire, 2 Earth, 1 Air. The earlier wizard harnesses used Isawa as "a School with no recorded line"; they now take Isawa's line away for their own page, with no check changed |
| Not given | Pages for Fuzake, Ninube, Horiuchi, Yogo Wardmaster, Yoritomo: skipped at your request |
| Device | **Tested on your iPhone and laptop, 25 September: all work as described and designed.** Two observations recorded as feedback (open reminders above) |
| Usage | **74% of this week** by your reading after Phase 11.2.4, up from 54% after the wizard's first stage: 20 points for 11.2.1 to 11.2.4 and the Kitsune [Mantis] fix together, not split per stage |

**Next:** your iPhone check (six Schools, listed in the phase README).

## Previous update — 25 September 2026: BUGFIX — Kitsune Shugenja Listed Under Mantis

**Removed at your request.** The Mantis Clan listed "Kitsune Shugenja [Mantis]", a word-for-word copy
of the Fox Clan's Kitsune Shugenja. One library line is deleted; the Mantis Clan now offers seven
Schools, in the sheet's picker and the wizard alike, and the library holds exactly your 21 Shugenja
Schools. The Fox Clan's Kitsune Shugenja and the Mantis Clan's **Kitsune Family** are unchanged. A
character saved with the removed School still opens, without error, but loses its granted Technique
row (choose the Fox Clan's Kitsune Shugenja to restore it). See
[the fix](BUGFIX%20%E2%80%94%20Kitsune%20Shugenja%20Listed%20Under%20Mantis/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,042,451 bytes**, SHA-256 `63b51115800d8788a6d3392ef3af9fca988020ed8ba8cc5954c5d05ec9b6517b` |
| Full QA | **2,354/2,354**: 2,345 retained + 9 new; 5/9 on the pre-fix build, failing exactly the four checks that see the School |
| Removal | Puts the line back: **byte-identical** to `72ea88b7…` (commit `bbd7624`); 10/10 fixtures |
| Other fixtures | The five Part K live removal fixtures failed (a library line changes every build under them); each now undoes this fix first, 15/15 |
| Device | Not yet tried on the iPhone |
| Usage | **74% of this week** by your reading after Phase 11.2.4, up from 54% after the wizard's first stage: 20 points for 11.2.1 to 11.2.4 and the Kitsune [Mantis] fix together, not split per stage |

## Previous update — 25 September 2026: Phase 11.2.3 — Wizard Starting Spells

**Built from your iPhone test and verified headlessly.** You pointed out that the rulebook gives
each Shugenja School's starting spells (Kitsu Shugenja, Core p.118: "Sense, Commune, Summon, 3
Water, 2 Air, and 1 Earth") and that neither the School data, the character check nor the wizard
used it. Now, for a School whose line is recorded, the Spells step:
- states the allotment;
- adds the given spells (Sense, Commune, Summon) with their scrolls;
- gives each Element its own box ("Water: choose 3 · 1 chosen"), offering only the spells the sheet
  lets this character learn (effective School Rank with Affinity and Deficiency: a Kitsu gets Water
  up to Mastery 2 and no Fire at all);
- adds each pick's scroll to Equipment.

The character check notes an allotment not yet filled. **Only Kitsu's line is recorded**; the
other 21 need theirs from the books (open reminder above). Your memorisation question is recorded,
not built. See [the phase](PART%20K%20%E2%80%94%20Phase%2011.2.3%20Wizard%20Starting%20Spells/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,042,795 bytes**, SHA-256 `72ea88b789701faa2523b9097b06805d0c5051b0850aaab926e60617a9df8668` |
| Full QA | **2,345/2,345**: 2,320 retained + 25 new |
| Key checks | Each Element's list matches the sheet's own Technique picker; `CW3-SAME-AS-BY-HAND`; 24/24 also with Phase 5 removed |
| Removal | **Byte-identical** to `a2d148ee…` (commit `8c9b9eb`); 11.2.2's remover refuses while it is present; 15/15 fixtures |
| Sensitivity | Seven variants each fail where expected; the first run found a blind spot (a given spell counting toward a quota changed nothing with Kitsu's data), now checked directly |
| Found while building | **Every Part K live removal fixture had been failing** since the next stage landed (Phase 11's since 11.2). The remover refusal was correct; the fixtures never removed later stages first. All five fixed and 15/15; the whole chain comes off byte-identical down to Phase 11's restore point |
| Device | Not yet tried on the iPhone |
| Usage | **74% of this week** by your reading after Phase 11.2.4, up from 54% after the wizard's first stage: 20 points for 11.2.1 to 11.2.4 and the Kitsune [Mantis] fix together, not split per stage |

**Next:** the other 21 Schools' spell lines (your choice of how, below), then your iPhone check.

## Previous update — 25 September 2026: Phase 11.2.2 — Wizard Free Choices, Spells and Kiho

**Built at your request and verified headlessly:** the wizard now walks you through every choice
your School leaves to you. **Free Skill choices** in every form the School library uses: a Kakita
Bushi's "any one Bugei or High Skill" offers High, Bugei and Weapon Skills; "any two Skills" is
two boxes; "not Low" leaves Low Skills out. **"Lore (pick one)"** asks for the Lore's subject.
**Spells** for a Shugenja School: each is added as its Spell Scroll and learned, the sheet's own
way. **Kiho** for a Brotherhood monk School, with the sheet's own free-pick count. **A reminder,
never a block:** the first Next on a step with a choice still open points at it and reads "Leave
for later ›"; the second moves on. Review lists anything still open. See
[the phase](PART%20K%20%E2%80%94%20Phase%2011.2.2%20Wizard%20Free%20Choices%20Spells%20and%20Kiho/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,030,719 bytes**, SHA-256 `a2d148ee90ee2e877fc74c100e1766ad68620193dbae389763a6212cdec12953` |
| Full QA | **2,320/2,320**: 2,268 retained + 52 new |
| Key checks | Both by-hand comparisons (a Shugenja's spell, a monk's Skills, Lore and Kiho) save identically; a sweep reads all 112 free choices across the 104 Schools |
| Removal | **Byte-identical** to `ee049396…` (commit `7f25263`); 11.2.1's and 11.2's removers refuse while it is present; 15/15 fixtures |
| Sensitivity | Thirteen variants each fail where expected. A screenshot, not a check, found the Lore box under 44px; fixed and now checked |
| Your ruling, 25 September | **"Bugei" offers the Bugei and Weapon Skills, not Cannon, Firearms or Ninjutsu** unless the choice also says Low. The first cut offered those three; you asked why weapon Skills were listed at all |
| Other phases | 11.2.1's harness moves by step title (32/32 with and without this stage); its variants now remove this stage first |
| Not known to the sheet | **How many spells each School starts with.** The Spells step says so and points to the rulebook rather than guessing |
| Found, not fixed | Apply School adds placeholder Skill rows for four Schools (open reminder above) |
| Device | Not yet tried on the iPhone |
| Usage | **74% of this week** by your reading after Phase 11.2.4, up from 54% after the wizard's first stage: 20 points for 11.2.1 to 11.2.4 and the Kitsune [Mantis] fix together, not split per stage |

**Next:** your iPhone check of the whole wizard, with the test list from this session.
*Tested 25 September: works as designed. Your note on starting spells became Phase 11.2.3, above.*

## Previous update — 24 September 2026: Phase 11.2.1 — Wizard Skills and Advantages

**Built and verified headlessly:** the wizard's second stage. Two steps now sit before Review:
**Skills** and **Advantages & Disadvantages**, so the wizard covers a whole starting character.
Skills shows one box per free choice your School grants ("any one Lore Skill", "any one High
Skill"), narrowed to the Skills that choice names; each free pick is added through the sheet's own
Skill picker at Rank 1 and ticked as School, so it costs nothing. You can raise and add Skills
too. Advantages & Disadvantages copies the sheet's own two pickers, so an entry with a question
(Elemental Blessing and the rest) still asks it, and greyed-out entries stay greyed. Both steps
show the experience left and block Next only when you overspend. Review now lists the Skills and
Advantages too. **Still no new rules:** `CW1-SAME-AS-BY-HAND` requires the wizard's saved data to
match the same choices made by hand. See [the phase](PART%20K%20%E2%80%94%20Phase%2011.2.1%20Wizard%20Skills%20and%20Advantages/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **3,003,661 bytes**, SHA-256 `ee04939670db1817823f709974ef13207282d2a0f7df87c26e3c760883eb2939` |
| Full QA | **2,268/2,268**: 2,236 retained + 32 new |
| Key check | `CW1-SAME-AS-BY-HAND`: free choices, raised Skills and Advantages made in the wizard save exactly what the same choices save by hand |
| Removal | **Byte-identical** to `9244163e…` (commit `5c50e87`); 11.2's remover refuses while this stage is present; 15/15 fixtures |
| Sensitivity | Nine variants each fail where expected; the first run found one blind spot (with no stylesheet every check still passed), closed by a 44px touch-target check |
| Other phases | 11.2's harness now moves between steps by title (43/43 with and without this stage); dependencies declared both ways |
| Device | Not yet tried on the iPhone. One wording to look at: 11.2's Rings & Traits step still says "Experience left: 42 of 40" after a Disadvantage; the new steps say "42 · started with 40" |
| Usage | **74% of this week** by your reading after Phase 11.2.4, up from 54% after the wizard's first stage: 20 points for 11.2.1 to 11.2.4 and the Kitsune [Mantis] fix together, not split per stage |

**Next:** your iPhone check of the whole wizard (both stages), then the next Phase 11 part.
*Your request of 25 September came first: Phase 11.2.2, above.*

## Previous update — 24 September 2026: Phase 11.2 (first stage) — Creation Wizard

**Built and verified headlessly:** "Create New Character" now opens a full-screen wizard (your
choice over a guided mode): Name, Clan (with mons), Family, School, Rings & Traits, Review. **It
adds no rules.** Every choice goes through the sheet's own controls, including Apply School's own
questions, and every option list is read from the sheet. Next unlocks when the step has no error
from Phase 5's check, and Finish needs none at all. Changing Clan after applying starts over,
keeping the name, because the sheet cannot un-apply a Family or School. Skills and
Advantages/Disadvantages are the next stage. See [the phase](PART%20K%20%E2%80%94%20Phase%2011.2%20Creation%20Wizard/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,985,043 bytes**, SHA-256 `9244163ea532004707a2c8d5c19bf8cde4ecc0d5a39f3731e7ea3d51ba6a6ec0` |
| Full QA | **2,236/2,236**: 2,123 retained + 70 (Phase 11) + 43 new |
| Key check | `CW-SAME-AS-BY-HAND`: the wizard's saved data is identical to making the same choices by hand |
| Removal | **Byte-identical** to `6043dabb…` (commit `2b3b8c4`); Phase 11's remover refuses while the wizard is present; 15/15 fixtures |
| Sensitivity | Ten variants each fail where expected; the first run found one blind spot (no check that the wizard covers the screen), now closed |
| Other phases | One conditional fixture in Phase 11's harness (70/70 with and without the wizard); soft dependencies on Phase 5 and Phase 9 declared both ways |
| Device | Not yet tried on the iPhone |
| Usage | **54% of this week** by the owner's reading, up from 51% after Phase 11's first stage: 3 points for this stage |

**Next:** your iPhone check of the wizard, then its second stage (Skills, Advantages/Disadvantages).
*Second stage built: Phase 11.2.1, above.*

## Previous update — 24 September 2026: Phase 11 (first stage) — Characters List and Save Model

**Built and verified headlessly:** a Characters screen. It lists every saved character with its
Clan mon, name, School and Insight Rank, Family and Clan. A tap opens a character, and each row's
menu offers Export JSON, Save As a copy and Delete. Import JSON on the list always adds a new
character. The screen opens at startup whenever a character is saved. Autosave follows a saved
character a moment after each change, only when something changed. Export JSON uses the phone's
share sheet. The save format and storage keys are unchanged. Per your approval, Export to PDF is
now Phase 11.1 and the creation wizard Phase 11.2; the roadmap records both. See
[the phase](PART%20K%20%E2%80%94%20Phase%2011%20Characters%20List%20and%20Save%20Model/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,958,319 bytes**, SHA-256 `6043dabbde6d26f488124d1512be3866906039454cb850fafe1fc3ed53b76a09` |
| Full QA | **2,193/2,193**: 2,123 retained + 70 new; no retained harness changed |
| Removal | **Byte-identical** to `864c5134…` (commit `a2312e4`); 15/15 remover fixtures; ownership check exits 0 |
| Sensitivity | Ten scoped variants each fail only their own check; the previous build fails all six scenarios |
| Found while building | Saves are format 3 (4.5.2's wrapper) while `SHEET_SCHEMA_VERSION` is still 2; the first Import refused this build's own saves as "newer". Fixed before shipping |
| Device | **List view confirmed on the iPhone, 24 September**: the empty state, then two saved characters (Hida Bushi, Asahina Shugenja) with Crab and Crane mons, School + Insight Rank and Family + Clan lines, newest first; the Characters button first on the toolbar; the tab row fits without wrapping. **Not yet reported:** opening by tap, autosave, Save As a copy, Delete, Export JSON through the share sheet, Import JSON |
| Usage | **51% of this week** by the owner's reading, up from 47% after the three bugfixes: 4 points for this stage |

**Next:** your iPhone check of the Characters screen, then Phase 11.2, the creation wizard.

## Previous update — 24 September 2026: BUGFIX — Service Worker Redirected Page

**Implemented and verified headlessly:** the "Response served by service worker has redirections"
error. Phase 0.6's worker saved the page by fetching `./index.html`, which Cloudflare Pages
redirects to `/`, so the saved copy was marked as redirected and a browser will not load a page from
it. Three delimited blocks in Phase 0.6's `src/sw.js` (switch `SW_REDIRECT_FIX_ENABLED`) save a
clean copy and never hand a redirected one to a page load. Chromium refuses it just as Safari does,
so the previous worker fails in the harness exactly as the iPhone did, with no emulation. See
[the bugfix](BUGFIX%20%E2%80%94%20Service%20Worker%20Redirected%20Page/README.md).

| Current snapshot | Value |
|---|---|
| Sheet build | Unchanged: **2,928,189 bytes**, `864c5134…`; combined 2,123/2,123 unaffected |
| Service worker | `src/sw.js` 11,607 bytes, SHA-256 `0e75a84d3726ffe1ee6c687ee8264acd84d9771160d815e95ee2921741ba14f2` |
| Own suite | **11/11** fixed; **8/11** previous worker (`net::ERR_FAILED` on the reload, the iPhone's failure) |
| Phase 0.6 harnesses | 12/12 and 5/5 on the fixed worker |
| Removal | `sw.js` **byte-identical** to commit `9b465b5`; 13/13 remover fixtures |
| Sensitivity | Switch off 8/11; without the activate copy 10/11; without the serve-time copy 10/11 |
| Device | **Confirmed on the iPhone, 24 September**: the owner reports every check passed after the deploy |
| Usage | **47% of this week** by the owner's reading, up from 34% after the device pass; one figure for all three bugfixes |

**Next:** Phase 11, Characters List, Creation Wizard & Save Model. All three bugfixes are confirmed on the iPhone.

## Previous update — 24 September 2026: BUGFIX — Spell Slots Tab on Safari

**Implemented and verified headlessly:** the Spell Slots tab now appears on Safari. The carousel's
`targetHidden()` asked the browser whether `#spellSlotsSection` was displayed; Safari answers
`none` for anything inside a hidden page, so the page that was hidden at load stayed hidden all
session. When the page is hidden, it is now un-hidden, measured and re-hidden in one synchronous
step, so nothing is painted in between. Two delimited blocks in `src/layer/10-carousel.js`, switch
`SAFARI_TAB_PROBE_ENABLED`; no sheet code touched. The cause was measured on your iPhone with a
diagnostic bookmarklet, not guessed. See [the bugfix](BUGFIX%20%E2%80%94%20Spell%20Slots%20Tab%20on%20Safari/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,928,189 bytes**, SHA-256 `864c5134126ad8977bc39f764598aeda680c4db964bbafb8a755b88c9e5d4a04` |
| Full QA | **2,123/2,123**: 2,104 retained + 19 new; no retained check changed |
| Old build | The previous build fails **5 of the 19** new checks: exactly the emulated-Safari ones |
| Removal | **Byte-identical** to `8cbfa39` / `339a9590…`; manifest and carousel file identical to that commit |
| Sensitivity | Switch off 14/19; a probe that forgets to re-hide the page 11/19 |
| Fixtures | 13/13 remover fixtures |
| Device | **Confirmed on the iPhone, 24 September**: the Spell Slots tab appears once a Shugenja School is chosen. A re-run of the bookmarklet on a character with no School read `lock=null`, `pageHidden=true`, which is the correct hidden state. User agent: iPhone OS 18_7, Safari 26.6.1 |

**Next:** Phase 11.

## Previous update — 24 September 2026: BUGFIX — Spell Slot Accounting

**Implemented and verified:** both spell-slot bugs from the open reminders, in one folder with a
switch per half. (1) Cancelling at the roll preview now gives back exactly what the cast paid:
an Element slot, a bonus slot, Void Versatility's Ring slot, or Maho Own-Blood Wounds. Cancelling
4.5.2's Willpower check before a cast refunds too; a check that is rolled and **failed** still keeps
the slot, per that release's approved rule. (2) A hand-tapped bonus pip is refused while the shared
pool is full, a take-back changes only the row tapped, and a save that already shows too many pips
gets a warning line and is never repaired automatically (your ruling). It refunds rather than
moving the spend, so every refusal and payment dialog stays where it was, and no A01–A16 release
was edited. See [the bugfix](BUGFIX%20%E2%80%94%20Spell%20Slot%20Accounting/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,927,339 bytes**, SHA-256 `339a9590bb9761441db94abb776afc1df9e260d2647114f6f706d297c011e726` |
| Full QA | **2,104/2,104**: 2,052 retained + 52 new; no retained check changed |
| Old build | The pre-fix build fails **24 of the 52** of the new checks, including each of your exact reports |
| Removal | **Byte-identical** to `c814568` / `3e262b18…`; manifest and both shared files identical to that commit; 2,052/2,052 retained on the removed bytes |
| Sensitivity | Eleven isolated variants each fail only their intended checks (master switch 28/52, refund switch 35/52, pip switch 44/52, no stylesheet 51/52) |
| Fixtures / registry / ownership | 47/47 remover fixtures / seven seats / every reference inside the fix's own blocks |
| Device | **Confirmed on the iPhone, 24 September**: cancel refunds the slot, and a bonus pip is refused when the pool is full |

**Next:** Phase 11, Characters List, Creation Wizard & Save Model.

## Previous update — 24 September 2026: A01–A16 iPhone device pass complete

**Tested on the owner's iPhone:** all sixteen A01–A16 entries, from
`IPHONE-TESTS-A01-A16-2026-09-23.md`, over 23–24 September, with about 150 screenshots. The result,
the triage and Claude's assessment of every suggestion are in
[the device audit](PART%20I%20%E2%80%94%20Phase%204.5%20Remaining%20Configuration%20Audit/IPHONE-AUDIT-A01-A16-2026-09-24.md)
(also published as [an artifact](https://claude.ai/artifact/65AgcyTmmfPL1Ud2n4ag7N)). No code has changed.

| Current snapshot | Value |
|---|---|
| Build | Unchanged: **2,914,055 bytes**, SHA-256 `3e262b18…`; the A13 realm picker opening on the phone confirms the device had it |
| Device result | **16 of 16 work as built.** No defect in any A01–A16 release's own code. The A13 Lost label fix is confirmed at normal size |
| New defect | **A cancelled spell cast still uses the slot**, for every spell (trunk, older than A01–A16; open reminder above). One same-shape case found by reading code (Maho Own-Blood Wounds) |
| Change requests | Twelve, awaiting rulings: the two A03 precepts are the largest (Perfection as a die pick in the result, Will as a prompt when Wounds rise) |
| Answered | A06's rival list audited: 29 of 29 (8 Clans, 14 Minor Clans, 6 Imperial families, the Brotherhood), no extras |
| Not reported | The "Across all of them" checks (save/reload, JSON, rename, wrong list, orientation); A03 Session Resources and Reset; A14's greyed entry; A08's Crane wording |
| Usage | **34% of this week** after the testing session, by the owner's reading (28% at the end of the A01–A16 build). Taken before this write-up. Exact tokens unavailable |

### Device-pass decisions and backlog — 24 September 2026

The owner was concerned that refining finished stages is crowding out the roadmap, and asked for a
short path back to it. **Decided:** fix the one real bug now (a cancelled cast still uses the
slot), together with the bonus-pip bug it shares counters with, then start **Phase 11**. Everything
else below is **parked**, not rejected. Each row keeps Claude's recommendation so it doesn't have to
be worked out again; the reasoning is in
[the device audit](PART%20I%20%E2%80%94%20Phase%204.5%20Remaining%20Configuration%20Audit/IPHONE-AUDIT-A01-A16-2026-09-24.md)
under the S-number given.

| # | Item | Claude's recommendation | Status |
|---:|---|---|---|
| 1 | Order of work | Spell-slot bug first, then the rest | **Superseded:** spell-slot fix (with the bonus-pip bug), then Phase 11; the rest parked |
| 2 | Spell-slot fix and bonus-pip bug in one folder | One folder, two halves that revert separately | **Agreed** — building now |
| 3 | Refund Maho Own-Blood Wounds on Cancel too | Yes | **Included** (no objection) |
| 4 | A save showing more bonus pips than the pool holds | Warn; never remove pips automatically | **Agreed** by the owner |
| 5 | A03 Perfection (S5) | Pick one die in the result window: Skill Rolls only, one die, no +5, pay on confirm; keep the row's Use button for physical dice | Parked |
| 6 | A03 Will (S6) | A line under the Wound bar when Wounds rise, not a pop-up; negate up to 10, never below the pre-hit total | Parked |
| 7 | Bottom **i** in seven pickers (S1, S2) | Remove it; keep each option's own text and the row's **i** | Parked for Phase 15 |
| 8 | A04 court chips and Add court (S7) | Whole chip as the button; Add court on the row; editor keeps rename and remove | Parked for Phase 15 |
| 9 | A09 Courtesy, Honesty, Courage (S8–S10) | Per-roll ticks, not automatic; make the registry's provider-list checks generic first | Parked |
| 10 | A01 Jurojin button (S3) | No button; reword the row reminder with the steps | Parked |
| 11 | A14 bonus-slot spill (S11) | Drop it: no extra casting, only a different row shows the pip | Parked (recommend dropping) |
| 12 | A01 Hotei (S4) | Leave as is until the owner names what felt wrong | Parked, waiting on the owner |
| 13 | A07 Inheritance, A11 Servant (S13) | Nothing now; perhaps the heirloom in Equipment later | Parked, waiting on the owner |
| 14 | Honor, Glory and Status (S14) | Read-only audit first (two unsynced fields per track), then one design decision | Parked until a phase needs to change those fields |
| 15 | Blessing reviews (S15) | Flag a second Blessing; re-price on a Fortune change; a replaced Blessing becomes a locked row that keeps its XP | Parked |
| 16 | Part I wrapper folder | Keep deferring | Deferred; Phase 11 is Part K, so it adds no Part I folder |
| — | Rank 0 dice bug | Fix with the next dice-engine change | Parked (errs in the player's favour) |
| — | L1, Jigoku's Lost wording | "+8 to total — Taint Rank 4 ×2 (Lost)" | Parked for Phase 15 |

## Previous update — 23 September 2026: Phase 4.5.24 Touch of the Spirit Realms — A01–A16 complete

**Implemented and verified:** A13, to the owner's rulings. Ten realms; 5 XP (Toshigoku 8, Yomi 7), a
Shugenja 1 less (4/7/6; the last two are an interpretation, and the row suggests confirming them
with the GM). Automatic: Chikushudo, Yomi (a chosen School Skill), and Jigoku (Taint Rank, doubled
by a Lost tick). Per-roll ticks: Sakkaku, Meido, Tengoku. The other four are reminders. See
[the release](PART%20I%20%E2%80%94%20Phase%204.5.24%20Touch%20of%20the%20Spirit%20Realms/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,914,055 bytes**, SHA-256 `3e262b188a453aed40451a7162a38e90761f6a04b35ea54bf124b9f1309151a2` |
| Full QA | **2,052/2,052**: 2,002 retained + 50 new; two retained provider-list checks made conditional (declared, pass both ways) |
| Removal | **Byte-identical** to `9423585` / `4d112320…`; 2,002/2,002 on the removed bytes; either order with 4.5.23 reaches `985fdeee…`; depends on 4.5.15 (its remover refuses because of this release alone) |
| Sensitivity | Kill switch 6/33; no stylesheet 46/50; nineteen targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Device | 375px rows and picker inspected with fallback fonts (a label-size bug found and fixed this way); iPhone open |
| Usage | The whole A01–A16 session (4.5.14–4.5.24): **28% of this week's allowance**, the owner's reading. Exact tokens unavailable |

**A01–A16: all sixteen delivered.** Still open: the reminders above.

## Previous update — 23 September 2026: Phase 4.5.23 Dark Paragon

**Implemented and verified:** A03, to the owner's rulings. One precept of Shourido; 5 XP (Spider 4);
once per session with a Reset. Control, Insight, Knowledge and Strength offer a reroll in the result
of a matching roll: the reroll stands, +5. Determination is a per-roll tick that removes the Wound
penalty. Perfection and Will have a Use button. Payment happens on confirm: 5 Honor points, or a
Void Point only without them. See [the release](PART%20I%20%E2%80%94%20Phase%204.5.23%20Dark%20Paragon/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,888,142 bytes**, SHA-256 `4d112320eb4c1e9937a280b1e7d3f25ef1d5aff49a5a938e80b351fa329ccac7` |
| Full QA | **2,002/2,002**: 1,935 retained + 67 new; two retained provider-list checks made conditional (declared, pass both ways) |
| Removal | **Byte-identical** to `862dfbf` / `985fdeee…`; 1,935/1,935 on the removed bytes; either order with 4.5.22 reaches `9c749b7d…`; depends on 4.5.15 (its remover refuses because of this release alone) |
| Sensitivity | Kill switch 10/33; no stylesheet 63/67; twenty targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Device | 375px row, result, confirm and reroll inspected with fallback fonts; iPhone open. Exact tokens unavailable |

A01–A16 delivered: A01, A02, **A03**, A04, A05, A06, A07 (reminder), A08, A09, A10, A11 (reference), A12, A14, A15, A16.
Pending: A13 Touch of the Spirit Realms (owner ruling on the Toshigoku/Yomi Shugenja price).

## Previous update — 23 September 2026: Phase 4.5.22 Naishou Citizen

**Implemented and verified:** A08, with a hard dependency on 4.5.21. 3 XP, no config. While it is on
the Advantage list a configured Seven Fortunes' Blessing costs 1 XP less, stacking with the Clan
price and never below 1 XP (Crane Benten: 2 XP). The row names the current Fortune and reminds the
player of the Free Raise on Social rolls with that Fortune's monks. Replace-without-refund is not
built (deferred review item above). See [the release](PART%20I%20%E2%80%94%20Phase%204.5.22%20Naishou%20Citizen/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,854,260 bytes**, SHA-256 `985fdeeeb4888e2d62195b5182481c5f6da053418f0737b00bbacd9c9d8b9a3f` |
| Full QA | **1,935/1,935**: 1,899 retained + 36 new; no retained check changed |
| Removal | **Byte-identical** to `436372a` / `9c749b7d…`; 1,899/1,899 on the removed bytes; 4.5.21's remover refuses while this is present; 4.5.22 then 4.5.21 reaches `10683306…` |
| Sensitivity | Kill switch 10/32; no stylesheet 32/36; eleven targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Device | 375px rows inspected with fallback fonts; iPhone open. Exact tokens unavailable |

A01–A16 delivered: A01, A02, A04, A05, A06, A07 (reminder), **A08**, A09, A10, A11 (reference), A12, A14, A15, A16.
Pending: A03 Dark Paragon and A13 Touch of the Spirit Realms (owner rulings).

## Previous update — 23 September 2026: Phase 4.5.21 Seven Fortunes' Blessing

**Implemented and verified:** A01, to the design agreed with the owner. Seven Fortunes with Rule
disclosures; 4 XP (Bishamon 5), 1 less for the listed Clans. Automatic: Bishamon +1k0 on Strength
Trait rolls, Daikoku +1k1 Commerce, Fukurokujin +1k1 on the chosen Lore Skill. Declared per roll
(unticked every time): Benten +0k1, Ebisu +1k1, Jurojin +2k0, Hotei +10; Hotei also gets a
Contested Void Roll button. See [the release](PART%20I%20%E2%80%94%20Phase%204.5.21%20Seven%20Fortunes%20Blessing/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,846,031 bytes**, SHA-256 `9c749b7dc9c45fc5829f8db3172067d91ced54833e734da4f245d3ddb08528d0` |
| Full QA | **1,899/1,899**: 1,822 retained + 77 new; two retained provider-list checks made conditional (declared, pass both ways) |
| Removal | **Byte-identical** to `5b1fc00` / `10683306…`; 1,822/1,822 on the removed bytes; either order with 4.5.20 reaches `2b69794d…`; depends on 4.5.15 (its remover refuses first) |
| Sensitivity | Kill-switch 19/47; no stylesheet 73/77; sixteen targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Device | 375px picker (all Rules open) and rows inspected with fallback fonts; iPhone open. Exact tokens unavailable |

A01–A16 delivered: **A01**, A02, A04, A05, A06, A07 (reminder), A09, A10, A11 (reference), A12, A14, A15, A16.
Pending: A08 Naishou Citizen (next), A03 and A13 (owner rulings).

## Previous update — 23 September 2026: Phase 4.5.20 Void Versatility

**Implemented and verified:** A14. A Shugenja with a Void Affinity saves one non-Void Ring; casting a
Void spell asks, before any slot is spent, whether that Ring or the ordinary Void flow pays (✕
spends nothing). The Casting Roll is the ordinary Void roll; only the Ring's own counter moves,
never the shared Bonus pool. 4 XP; greyed out in the picker for anyone ineligible.
See [the release](PART%20I%20%E2%80%94%20Phase%204.5.20%20Void%20Versatility/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,820,250 bytes**, SHA-256 `106833069f5bf72a69b185b9d29c85c7f0d1cbf6748bff2195a2581b5d1e8e79` |
| Full QA | **1,822/1,822**: 1,756 retained + 66 new; two retained checks made conditional (declared, pass both ways) |
| Removal | **Byte-identical** to `46b15b4` / `2b69794d…`; 1,756/1,756 on the removed bytes; either order with 4.5.19 reaches `96dda731…` |
| Sensitivity | Kill-switch 15/35; no stylesheet 62/66; twelve targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Device | 375px picker, row and payment dialog inspected with fallback fonts; iPhone open. Exact tokens unavailable |

A01–A16 delivered: A02, A04, A05, A06, A07 (reminder), A09, A10, A11 (reference), A12, **A14**, A15, A16.
Pending: A03, A13 (both need owner rulings), then A01 → A08.

## Previous update — 23 September 2026: Phase 4.5.19 Soul of Artistry

**Implemented and verified:** A12. Pick Artisan or Craft Skills; a matching Skill with no Rank is
rolled as a real Rank 1 roll (Trait + 1 k Trait, 10s explode), with preview, breakdown, Void offers
and dice all agreeing. 4 XP, 3 for Crane or a Courtier. Purchased Ranks and XP never change.
See [the release](PART%20I%20%E2%80%94%20Phase%204.5.19%20Soul%20of%20Artistry/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,798,717 bytes**, SHA-256 `2b69794dcd3bf9d70b8a1676a4f9cb734cf1f4b0ecf7d40b0396d0bae8ef0c3e` |
| Full QA | **1,756/1,756**: 1,664 retained + 92 new; no retained check changed |
| Removal | **Byte-identical** to `fe20e75` / `96dda731…`; 1,664/1,664 on the removed bytes; either order with 4.5.18 reaches `be9076cf…` |
| Sensitivity | Kill-switch 7/24; no stylesheet 88/92; eleven targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Found, not fixed | Rank 0 Skill-table rolls already explode while labelled Unskilled (trunk `rollSkill()`); wants a bugfix folder |
| Device | 375px picker and row inspected with fallback fonts; iPhone open. Exact tokens unavailable |

A01–A16 delivered: A02, A04, A05, A06, A07 (reminder), A09, A10, A11 (reference), **A12**, A15, A16.
Pending: A03, A13, A14, then A01 → A08.

## Previous update — 23 September 2026: Phase 4.5.18 Paragon

**Implemented and verified:** A09 Paragon, reminder only as approved. A picker lists the seven
tenets in printed order with their Core p.152 benefits, nothing preselected; the saved tenet shows
as a badge with one reminder line (its benefit, plus "+1 Honor whenever you gain Honor for showing
<tenet> — add it yourself"). 7 XP, 6 for Lion. No dice, Void or Honor automation, measured.
See [the release](PART%20I%20%E2%80%94%20Phase%204.5.18%20Paragon/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,780,550 bytes**, SHA-256 `96dda731ef0cf9670fe2c65763bf28e2a73698972e7d8f49014ac598c728385a` |
| Full QA | **1,664/1,664**: 1,584 retained + 80 new; no retained check changed |
| Removal | **Byte-identical** to `bfd82ee` / `be9076cf…`; 1,584/1,584 on the removed bytes; either order with 4.5.17 reaches `0aefe9c9…` |
| Sensitivity | Kill-switch 2/11; no stylesheet 76/80; nine more targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Device | 375px picker and row inspected with fallback fonts; iPhone open. Exact tokens unavailable |

A01–A16 delivered: A02, A04, A05, A06, A07 (reminder), **A09**, A10, A11 (reference), A15, A16.
Pending: A12, A03, A13, A14, then A01 → A08.

## Previous update — 23 September 2026: Phase 4.5.17 Wealthy Koku Grant

**Implemented and verified:** A16's owner-approved grant of 2 koku per Rank, and Core p.149's
1-XP minimum (Rank 1 for Crane/Unicorn/Imperial is now 1 XP, not 0). Money moves only on an
explicit action, a receipt in the row's config prevents any re-grant, raising the Rank adds only
the difference, lowering it offers Return/Keep, and older saves are asked rather than assumed.
See [the release](PART%20I%20%E2%80%94%20Phase%204.5.17%20Wealthy%20Koku%20Grant/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,767,985 bytes**, SHA-256 `be9076cfbebc3fac31641a03fab82508b35a7c06caf961e347e546151930115a` |
| Full QA | **1,584/1,584**: 1,497 retained + 87 new; three 4.56 checks made conditional (declared; 29/29 both ways) |
| Removal | **Byte-identical** to `65d2106` / `0aefe9c9…`; 1,497/1,497 on the removed bytes; either order with 4.5.16 reaches `1d8aa345…` |
| Money | Exact Koku asserted after every action from a non-zero start; recalc/reload/import/re-apply never mint; deleting the row never claws back |
| Sensitivity | Kill-switch 10/39; no stylesheet 82/87; "mint while rendering" 57/80; seven more targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Device | 375px rows and modal inspected with fallback fonts; iPhone open. Exact tokens unavailable |

A01–A16 delivered: A02, A04, A05, A06, A07 (reminder), A10, A11 (reference), A15, **A16**. Pending:
A09, A12, A03, A13, A14, then A01 → A08.

## Previous update — 23 September 2026: Phase 4.5.16 Heart of Vengeance

**Implemented and verified:** A06 Heart of Vengeance, the first provider on the 4.5.15 registry.
A rival Clan or faction (open list, with Clans, Imperial families and the Brotherhood suggested),
5 XP or 4 for Spider, and an unticked `Contested against <rival> — apply +1k1` on Skill, Trait,
Ring and manual rolls only. See [the release](PART%20I%20%E2%80%94%20Phase%204.5.16%20Heart%20of%20Vengeance/README.md).

| Current snapshot | Value |
|---|---|
| Canonical Phase 0 build | **2,753,162 bytes**, SHA-256 `0aefe9c90c964eb50132bd0782b433648fee31ca069d7fc3a5c35615ea98163a` |
| Full QA | **1,497/1,497**: 1,406 retained + 91 new; one 4.5.15 fixture made conditional (declared) |
| Removal | **Byte-identical** to `45d0f48` / `1d8aa345…`; 1,406/1,406 on the removed bytes. 4.5.15's remover refuses while this is present; this-then-4.5.15 reaches `61de1d40…` |
| Real dice | Declared Skill/Trait/Ring/manual rolls: 6 dice / 4 kept from 5k3; next roll unticked 5/3; attacks offer nothing; two rivals ticked still +1k1 once |
| Sensitivity | Kill-switch 4/25; no stylesheet 87/91; eight targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 45/45 / seven seats / unchanged |
| Device | 375px row and preview inspected with fallback fonts; iPhone open. Exact tokens unavailable |

A01–A16 delivered so far: A02, A04, A05, A06, A07 (reminder), A10, A11 (reference), A15. Pending:
A03, A09, A12, **A16's actual 2-koku grant**, A13, A14, then A01 → A08.

## Previous update — 23 September 2026: Phase 4.5.15 Roll Declaration Registry

**Implemented and verified:** one general mechanism for per-roll "declare it for this roll"
options in the roll preview, built at the owner's decision before A06 Heart of Vengeance. It
ships no production provider, so nothing visible changes yet; A06 is next as its first provider
(4.5.16). The four existing hardwired declarations are unchanged. See [the release](PART%20I%20%E2%80%94%20Phase%204.5.15%20Roll%20Declaration%20Registry/README.md).

| Current snapshot | Value |
|---|---|
| Branch | `claude/amazing-sagan-8p699k` |
| Canonical Phase 0 build | **2,739,496 bytes**, SHA-256 `1d8aa345b8c054cca212bd57a57acb49cb593bf4b7805cec0438a171537a70e4` |
| Full QA | **1,406/1,406**: 1,353 retained + 53 new; no old harness edited |
| Removal | **Byte-identical** to `0055ec5` / `61de1d40…` (2,730,118 bytes); **1,353/1,353** retained on the removed bytes; removable in either order with 4.5.14 |
| Real dice | Declared +1k1 rolls 6 dice / keeps 4 from 5k3; the next roll is back to 5/3; a confirmed declaration cannot reach a roll that skips the preview |
| Sensitivity | Kill-switch 14/26; no stylesheet 49/53; eight targeted mutations each fail only their intended checks |
| Fixtures / registry / inventory | 47/47, no skips / seven seats / unchanged |
| Usage | Exact tokens unavailable; nothing estimated |

## Previous update — 23 September 2026: Phase 4.5.14 Darling of the Court and Servant

**Implemented and verified:** A04 Darling of the Court and the A11 Servant reference — the
owner-approved first half of the split Stage 2. **A06 Heart of Vengeance is the next, separate
batch**, held for one owner decision: add a fourth hardwired per-name declaration to Phase 3's
(Part G) roll preview, or generalise that hook first. See [the release and regression matrix](PART%20I%20%E2%80%94%20Phase%204.5.14%20Darling%20of%20the%20Court%20and%20Servant/README.md)
and its ROLLBACK.

| Current snapshot | Value |
|---|---|
| Branch | `claude/amazing-sagan-8p699k` (built from `main` at `9dd3fef`, which had not moved) |
| Phase 0 build at that release | **2,730,118 bytes**, SHA-256 `61de1d40772cb00abba41f7ab5d2d151027b3554545d04e4f8bf127d39adaa48` |
| Full QA | **1,353/1,353**: all 1,128 retained checks plus 225 new; no old harness edited |
| Removal | **Byte-identical** to `9dd3fef` / `1e2683d81ddab13662f76c62ca8c595d521d633f6cc66a512169661cd85b8326`, 2,704,237 bytes; retained suite **1,128/1,128** on those exact removed bytes |
| Removal order | 4.5.13 removed while 4.5.14 stays: 225/225 and 992/992. Both removed, either order: byte-identical to `c7063f52…` (2,689,172 bytes) |
| Other checks | Recombine verification and deployment drift check pass; inventory unchanged; ownership scan exits 0 for 4.5.14 and still for 4.5.13; registry stays at seven |
| Remover fixtures | **45 passed, 0 skipped** out of 45 (Linux ran the two real-symlink fixtures Windows skipped last time) |
| Sensitivity | Kill-switch 43/63; no stylesheet 209/225; eight targeted mutations each fail only their intended checks. The first run found a blind spot (duplicate rows tested only unconfigured); seven checks closed it |
| Device status | Browser layouts at 320/375/768/1440px pass; editor and rows visually inspected at 375px with fallback fonts only (loaded webfonts empty). Real iPhone verification open |
| Usage | Exact tokens unavailable to the session; nothing estimated |

Darling keeps every court on one row: 2 XP each, 1 for a Courtier School (a School whose name
or bracketed type says Courtier — untagged Artisan Schools pay 2, a declared interpretation).
One selected court and one persisted "Court in session" toggle drive a readout such as
`Status 3 — counts as 4 at Kyuden Bayushi (in session). Actual Status unchanged.` Status,
Blackmailed and every roll are measured unchanged. Servant is a reference row with the Core
p.153 rules and nine samples; it writes nothing and leaves its cost to the player.

Remaining A01–A16: A06 (above), A03, A09, A12, **A16 Wealthy's actual 2-koku-per-rank grant**
with receipt/reconciliation and the 1-XP minimum correction, A13, A14, then A01 → A08. No D06
Weakness, Hotei or later phase started. A push requests redeployment; it does not prove the host
has deployed or a device has refreshed its cache — the live site is not reachable from the cloud
session that built this, so deployment was not observed.

## Previous update — 20 September 2026: Phase 4.5.13 Named Advantages

**Implemented and verified:** A02 Blackmail, A05 Forbidden Knowledge, A07 Inheritance's
reminder, and A15 Way of the Land. This is the first fresh, small A01–A16 batch, not completion
of the whole list. Source notes were committed and pushed separately in `9a11267` before
implementation. See [the release and regression matrix](PART%20I%20%E2%80%94%20Phase%204.5.13%20Named%20Advantages/README.md)
and its ROLLBACK for full evidence.

| Current snapshot | Value |
|---|---|
| Branch | `main` |
| Canonical Phase 0 build | **2,704,237 bytes**, SHA-256 `1e2683d81ddab13662f76c62ca8c595d521d633f6cc66a512169661cd85b8326` |
| Full QA | **1,128/1,128**: all 992 retained checks plus 136 new checks; no old harness edited |
| Removal | **Byte-identical** to `6005fae` / `c7063f52269c306fcd6596e2103518ff27d4a57b01b0db031115dbb59c58ca15`, 2,689,172 bytes; retained suite **992/992** on those exact removed bytes |
| Other checks | Recombine verification and deployment drift check pass; inventory unchanged; all 19 owned surfaces and 10 external references correctly attributed; registry stays at seven |
| Remover fixtures | **43 passed, 2 skipped** out of 45: OS permission prevented two real symbolic-link fixtures; portable alias checks and a real hard-link fixture passed |
| Device status | Browser layouts at 320/375/768/1440px pass; three phone-width screens visually inspected. Loaded webfonts were empty, so fallback-font only. Real iPhone verification remains open |
| Usage | Exact tokens unavailable. Codex account snapshot at approximately 19:27 UTC: **13% five-hour used, 81% weekly used**. Not a per-batch cost; not comparable to the historic Claude percentage total |

Blackmail records an agreed NPC name/Status without tracking that NPC. Forbidden Knowledge and
Inheritance explicitly disclose that benefits are manual; neither creates Skills or equipment.
Way of the Land offers an optional region. Configs, notes, badges and pricing round-trip through
real save/load and JSON paths. A removed build preserves the four unknown configs and prices,
visibly flagged, including after saving again.

Mutation checks: switch off **12/26** (modal-dependent groups abort), styles absent **128/136**,
Scorpion discount removed **135/136**, optional fields wrongly required **133/136**, inline error
hidden **135/136**. Each targeted mutation fails only its intended checks except the whole-feature
switch, which disables multiple groups. Independent review found and fixed omitted optional-field
validation and a behind-modal error message before the final full run.

Production footprint: one JS fragment, one scoped stylesheet, one guarded six-line seam block,
two manifest entries; no dice-engine or top-level save-schema edits. Remaining A01–A16 work,
including Darling's courts, Heart's per-roll declaration and **Wealthy's actual 2-koku-per-rank
grant with receipt/reconciliation**, is still pending. Perceived Honor is retained, not rebuilt.
No D06 Weakness, Hotei or later phase was started. A push requests redeployment; it does not
prove the host has deployed or a device has refreshed its cache.

This dated repository update is newer than the historical artifact snapshot below. Compare dates
before assuming the external artifact is newer; its remote content has not been edited here.

## Historical snapshot — 17 September 2026

| | |
|---|---|
| Snapshot taken | 17 September 2026 |
| Branch | `main` |
| Phase 0 build | `c7063f52` (canonical LF build; 2,689,172 bytes) |
| Weekly allowance used | **92%** as of the Negative Roll Modifier Display bugfix — project owner's own reading, 17 September. **8% left.** |
| Last change | **BUGFIX — Negative Roll Modifier Display.** A negative flat total modifier was printed with a hardcoded `+`: the roll modal read `Keeping 3 of 5 (suggested 3) + -40 bonus` on a **wounded character with no Disadvantage configured at all**. Pre-existing since Wound Penalties (Part C, Feature 3); Feature 4.5.9 confirmed it as pre-existing and three ROLLBACK files asked for this folder. **The arithmetic was never wrong.** `result.bonus` **sums two unlike things** — the Ten Dice Rule's conversion bonus (always ≥ 0) and the pipeline's `totalDelta` (wounds, firing into melee, a required Raise) — so the number can be net negative and the word in front of it has to follow; that is why this is a *wording* fix rather than a sign fix. **The report understated it:** three sites format that number with a hardcoded `+` and **two are visible**. The keep-note was reported; the **notation line** (`12k4 → 10k5 +-40`) was not, and was found by driving the roll rather than reading the report. Both corrected. The third is **deliberately left alone** — it can only malform when `totalDelta` is non-zero, which is exactly when `attachRollModifierBreakdown()` hides it, and correcting only its sign would leave it calling a wound penalty a *Ten Dice Rule bonus*. **An isolated revert found a real defect in this fix: the kill-switch was decorative**, read 11/12 with it flipped because neither helper consulted the flag; both now return the trunk's own pre-fix formatting when it is off, and the revert reds eight checks (4/12). Positive values are unchanged byte for byte, asserted against a recorded pre-fix baseline. Its remover **restores text rather than only cutting it**, a first for this project, with fixtures asserting the live blocks and the restore table agree. 12/12 own, 992/992 combined, 980/980 removed, 17/17 removal fixtures, byte-identical removal. **Confirmed on the reporting iPhone across two rounds, same day.** First round: `Keeping 3 of 8 (suggested 3) − 10 penalty` and `11k3 → 10k3 −10 (Ten Dice Rule)` — a capped pool with no real Ten Dice bonus, wound-penalty-only. **A second round closed the gap the first left open**, producing the first real-device roll where `result.bonus` is a genuine sum of a non-zero Ten Dice conversion *and* a non-zero `totalDelta`: a 16k8 roll on the same character gave a real **+4** Ten Dice bonus alongside the **−3** wound penalty, net **+1**, rendering as `Keeping 10 of 10 (suggested 10) + 1 bonus` and `16k8 → 10k10 +1 (Ten Dice Rule)` — with Phase 4's (Part G) breakdown panel agreeing throughout (`+4`, `-3`, `Net +1`), confirming two independently-built panels agree on the device as well as in the harness. **Still unconfirmed:** the same mix with the net reversed — a real Ten Dice bonus present but outweighed by a larger wound penalty, so the total reads "penalty" despite a genuine bonus contributing. *Previously:* the Mastery Rank Labelling bugfix, at **4%** |
| Live site | <https://l5r-character-sheet-creator.pages.dev/> |
| Interactive version | [Rokugan Build Ledger artifact](https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk) — same content, but the tick-boxes below actually save there |

> **This file is a snapshot; the artifact is the live copy.** Ticking a box in the artifact does
> not update this file, and editing this file does not update the artifact. If they disagree,
> the artifact is newer — ask Claude to re-export, or tick the boxes here by hand. The roadmap
> at `L5R Character Sheet Phased Roadmap reorder.md` remains the single source of truth for
> *what* the phases are; this ledger only tracks *how far along* each one is.

## Latest review note — the Mastery Rank Labelling bugfix, and the bundle that did not happen

On 17 September the two items Phase 4.5.12 costed and deferred were agreed to ship as ONE bugfix
folder, on the reasoning — still correct — that per-phase *overhead*, not code, is what the ledger's
own spread keeps showing is expensive. **That decision was revisited and the pair was unbundled.**
Two reasons, one of which is new information rather than a change of mind:

1. **The ammo-picker half is blocked on a product ruling** that has not been given: an empty quiver
   should prompt-and-refuse, prompt-with-an-empty-state, or stay silent while the other path
   changes. Bundling would have made the unblocked half wait on the blocked one — and a saving
   cannot be put toward work that cannot start, which is the same trap this ledger flagged about
   putting the bundle's saving toward Hotei.
2. **The mastery half is cheaper than it was costed at**, and this was established by measurement
   before any code was written. Two figures recorded here on 17 September were wrong:

| This ledger said | Measured |
|---|---|
| "printing the granting rank needs a NEW LOOKUP" | It needs a new *derivation*. The lookup exists: the thresholds are the KEYS of the skill's own `dmgBonus`/`explodeOn`/`reductionMod` tables, and `getStructuredMastery()` already returns those tables whole — it was built for Phase 3's (Part G) "Show Structured Mastery" debug button |
| "7 call sites across 3 files" | **Three adjacent lines in one file.** The seven sites are real, but `110-modals-trackers.js`'s debug button already labels correctly ("current rank", "Raw thresholds (all ranks)"), the seam entry is an export not a label, and the two resolution sites were never wrong |

**The ammo picker stays queued, unchanged, and still needs the ruling before it can be costed
honestly.**

### What the Hotei re-measurement found, recorded so it is not re-derived

Also on 17 September, Hotei's blocker was re-measured against Phase 4.5.11's own standing lesson
(*measure before declaring something blocked*). The result is mixed and is worth having written
down:

- **"No structured Void-cost field exists anywhere" is false.** `KIHO_LIBRARY` has one: 73 rows
  carry an `activation` field, 14 non-null, **8 of them naming a Void Point**. And the sheet already
  models a covered activation costing one Void — `VOID_SPEND_LIBRARY`'s seventh entry, *Activate a
  Kiho*, an `immediate` non-roll spend with its own entitlement test and the Brotherhood
  once-per-Round exemption.
- **42 of the 240 described techniques state a Void spend** in a consistent, machine-findable
  phrase — though the descriptions are labelled in-code as paraphrases, so classifying "covered"
  from them would be inventing rules content (Process Requirement #3).
- **The Advantage half of Hotei's surface is empty.** **Zero of `ADV_LIBRARY`'s 73 rows** names a
  Void spend at all. Hotei's rule is "Technique/**Advantage** activations"; on this sheet the
  Advantage half has no referent.
- **The "per-roll declaration" idea is the wrong shape, though the conclusion survives.** Maigo no
  Musha, Ebisu and Jurojin declare at a *roll*, inside Phase 3's preview. Hotei attaches to a
  *spend*, and the covered spends produce no roll at all. It would be a new per-spend declaration on
  the Void card, not a reuse of existing machinery.
- **No collision with the one-roll exclusivity work**, which was the specific worry: the audit
  already exempts ordinary uses like `+1k1`, and those are the `oneRoll` keys while the doubled set
  would be the `immediate` activation keys. The real cost is elsewhere — `consumeVoidPoint()`
  hardcodes `current - 1` and `canSpendVoid()` gates on `<= 0` rather than `<= 1`, so "charge two
  exactly once, checking affordability first" means editing `160-feat-void.js`, trunk code already
  carrying two bugfix folders' blocks, plus the Brotherhood-exemption branch.
- **Estimate: 12–18%**, not the 4–7% a "second half of D04b" suggests. Machinery count, not entry
  count — this ledger's own estimator — puts it in 4.5.10's bracket.

## Latest review note — Phase 4.5.12 (D04b) Real-Device Testing Feedback

On 17 September 2026, D04b (Bishamon) was tested on a live device with full Kenjutsu mastery 
setup (Rank 8, Kyujutsu Rank 1, multiple weapons across damage branches). Three pre-existing 
issues were identified during testing, plus one D04b-specific edge case:

**Pre-existing issues (not D04b-specific):**
1. **Kenjutsu mastery labeling**: The damage preview says "Kenjutsu Rank 8 mastery +1k0" but 
   rank 8 has no mastery (masteries are at ranks 3 and 7). The mathematics is correct 
   (3k2 base + 2 for Strength = 5k2, −1k0 for Bishamon curse, +1k0 for rank 3 mastery = 5k2), 
   but the wording is confusing. This is a trunk roll-preview labelling issue, not a D04b defect.

2. **Arrow ammo picker inconsistency**: When no arrow is equipped in inventory, the sheet skips 
   the "pick ammo" prompt and proceeds directly to range check + roll. When an arrow IS equipped, 
   it asks to pick ammo first. This behaviour should be consistent. Not a D04b issue.

3. **Bow/arrow damage preview clarity**: The reduction for Bow Strength is applied and calculated 
   correctly, but the preview wording could be clearer about which branch is being reduced.

**D04b-specific finding — now FIXED:**
4. **Strength 1 edge case**: at Strength 1 the Bishamon line was absent from the damage modal
   entirely, with no explanation for why the curse had no effect. The dice were correct; the
   silence was the defect, and the reporter's reading was the honest one — a configured,
   paid-for curse with no line in the modal reads as an unimplemented feature.

   Root cause: `api.adjustDamage()` returned `null` whenever the curse cost nothing, and `null`
   was doing **triple duty** across three cases that are not alike — Strength at the floor, a bow
   whose own rating already binds, and Perception/flat-DR weapons where Strength was never in the
   pool. The first two are owed an explanation and the third is not.

   Fixed 17 September: it returns a zero-delta result carrying the reason for the first two and
   still returns `null` for the third, plus the bow wording from item 3 above. **It needed no
   change to `100-dice-engine.js`** — the existing block already treats a zero `rolledDelta` as a
   no-op, measured — so the byte-identical removal proof survived untouched. Own suite 45/45 →
   **51/51**, combined 947/947 → **953/953**, removed **902/902** and the removal rebuild
   `28e01755…` both unchanged. Each of the six new checks was proven able to fail by isolated
   revert. **The corrected wording is not itself real-device confirmed.**

**Costed and deferred (17 September):** items 1 and 2 above were both measured rather than
guessed. Mastery labelling needs a new lookup, not a string change — `getDamageBonus()`
accumulates across thresholds and records nothing about which contributed — and touches 7 call
sites across 3 files. The ammo picker's skip is `ammoTrackingActive()` returning false by design
with an empty quiver, so consistency is a product decision before it is a code change. Each
wants its own bugfix folder.

> **Superseded on both counts, same day.** Item 1 shipped as `BUGFIX — Mastery Rank Labelling`, and
> building it measured *both* figures in the paragraph above as overstated: the granting thresholds
> were already exposed by `getStructuredMastery()` (so no new lookup), and only **three adjacent
> lines in one file** needed changing (the Skill-info debug button already labels correctly). Item 2
> is unchanged and still needs its ruling before it can be costed. See the review note at the top of
> this file.

**Verified working:**
- Katana (melee, Strength branch): curse correctly reduces by 1 rank
- Dai-kyu (bow, Bow Strength branch): curse correctly reduces inside the min() cap
- Han-kyu (bow, boundary case): Bishamon has no effect at higher Strength values where 
  `min(rating, Strength)` caps the pool — this is correct behaviour
- Unarmed strike (Strength branch): curse correctly reduces by 1 rank
- All calculation chains (base → +Strength → −Bishamon → +mastery) verified against preview
- Stacking with other Fortunes confirmed to stack correctly
- Surgical removal proved byte-identical on first attempt

---

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

Recorded by the project owner, because build order is partly a budget decision and the estimates
have been wrong in both directions before. Most historical rows use Claude's weekly allowance;
Codex rows are labelled separately. Never combine providers or turn a cumulative reading into a
per-release delta without a matching starting measurement.

| Week | Phase | Cost | Tokens | Measured? |
|---|---|---:|---:|---|
| w/c 9 Sep | Phases 0, 0.5, 0.6, 0.7, 1, 1.5, 1.6, 2, 3, 4, and a start on 9 | ~75% | | |
| w/c 9 Sep | Phase 5 — Character Creation Linting | ~3% | | |
| w/c 9 Sep | Phase 8 — Casting Diagnostics | ~10% | | |
| w/c 9 Sep | Phase 4.5 — Modal-Configured Advantages/Disadvantages | ~10% | | |
| w/c 16 Sep | Phase 4.5.3 — Configuration Repairs | **8%** | | |
| w/c 16 Sep | Phase 4.5.4 — Configuration UX Pass, plus two real-device corrections | **9%** | | |
| w/c 16 Sep | Phase 4.5.5 — Eligibility Gates, plus the Great Potential skill-picker revision | **7%** | | |
| w/c 16 Sep | Phase 4.5.6 — Perceived Honor and Wealthy | **5%** | | |
| w/c 16 Sep | Phase 4.5.7 — Unlucky, plus the tooltip correction | **12%** | | |
| w/c 16 Sep | Phase 4.5.8 — Dependant and Wrath of the Kami | **4%** | | |
| w/c 16 Sep | Phase 4.5.9 — Doubt, plus a same-day wording correction | **4%** | | |
| w/c 16 Sep | Phase 4.5.10 — Cursed by the Realm (D01), plus two real-device corrections | **18%** | | |
| | **Running total after 4.5.10** | **67%** | | |
| w/c 16 Sep | Phase 4.5.11 — Seven Fortunes' Curse (D04a) | **7%** | | |
| | **Running total after 4.5.11** | **74%** | | |
| w/c 16 Sep | Phase 4.5.12 — Bishamon (D04b, first half), plus a real-device correction | **8%** | | |
| | **Running total after 4.5.12** | **82%** | | |
| w/c 16 Sep | BUGFIX — Mastery Rank Labelling | **4%** | | |
| | **Running total after the Mastery Rank Labelling bugfix** | **86%** | | |
| w/c 16 Sep | BUGFIX — Negative Roll Modifier Display | **6%** | | |
| | **Running total after the Negative Roll Modifier Display bugfix** | **92%** | | |
| 20 Sep (Codex) | Phase 4.5.13 — Blackmail, Forbidden Knowledge, Inheritance reminder, Way of the Land; 1 JS + 1 CSS + 1 shared block, 136 new checks | Unavailable | Unavailable | No exact per-batch meter; 13% five-hour / 81% weekly account snapshot only |
| 23 Sep (Claude) | **One session: Phases 4.5.14–4.5.24, completing A01–A16** — A04, A11, the 4.5.15 registry, A06, A16's grant, A09, A12, A14, A01, A08, A03, A13 (eleven releases, 1,128 → 2,052 checks), plus two trunk-bug investigations and the design/review rounds | **28%** of this week | Unavailable | The owner's reading of the weekly allowance for the whole session; not split per release |
| 24 Sep (Claude) | **A01–A16 iPhone device pass** — receiving and recording the owner's results for all sixteen entries (about 150 screenshots); no code changed | **+6%** (28% → **34%** of this week) | Unavailable | The owner's reading after testing, before the audit and ledger write-up. Same week as the row above |
| 24 Sep (Claude) | **Device-pass audit and ledger write-up, backlog record, and BUGFIX — Spell Slot Accounting** (1 JS + 1 CSS + 2 guarded blocks, 52 new checks) | **+13%** for this row and the two below together (34% → **47%** of this week) | Unavailable | The owner's reading after all three bugfixes were merged and confirmed on the iPhone; one figure, not split per fix |
| 24 Sep (Claude) | **Spell Slots tab on Safari** — diagnosis with the owner on the iPhone (bookmarklet) and BUGFIX — Spell Slots Tab on Safari (2 delimited carousel blocks, 19 new checks); service-worker redirect diagnosed | Inside the +13% above | Unavailable | Not split out |
| 24 Sep (Claude) | **BUGFIX — Service Worker Redirected Page** (3 delimited blocks in Phase 0.6's `sw.js`, 11 new checks) and merge to main | Inside the +13% above | Unavailable | Not split out |
| 24 Sep (Claude) | **Phase 11 (first stage) — Characters List and Save Model** (1 JS + 1 CSS + 2 delimited blocks, 70 new checks) and the roadmap scope rulings | **+4%** (47% → **51%** of this week) | Unavailable | The owner's reading after the build, before any device check |
| 24 Sep (Claude) | **Phase 11.2 (first stage) — Creation Wizard** (1 JS + 1 CSS + 1 delimited block, 43 new checks) | **+3%** (51% → **54%** of this week) | Unavailable | The owner's reading after the build, before any device check |
| 24 Sep (Claude) | **Phase 11.2.1 — Wizard Skills and Advantages** (1 JS + 1 CSS + 1 delimited block, 32 new checks; 11.2's harness moved to title navigation) | **+20%** for this row and the four below together (54% → **74%** of this week) | Unavailable | The owner's reading after 11.2.4 and the Seppun correction; one figure, not split per stage |
| 25 Sep (Claude) | **Phase 11.2.2 — Wizard Free Choices, Spells and Kiho** (1 JS + 1 CSS + 1 delimited block, 51 new checks) and the merge to main | Inside the +20% above | Unavailable | Not split out |
| 25 Sep (Claude) | **Phase 11.2.3 — Wizard Starting Spells** (1 JS + 1 delimited block, 25 new checks) and the Part K removal-fixture repair | Inside the +20% above | Unavailable | Not split out |
| 25 Sep (Claude) | **BUGFIX — Kitsune Shugenja Listed Under Mantis** (one library line deleted, 9 new checks) and the five Part K live fixtures taught to undo it | Inside the +20% above | Unavailable | Not split out |
| 25 Sep (Claude) | **Phase 11.2.4 — Wizard Starting Spells for Every School** (1 JS + 1 delimited block, 71 new checks) and the Seppun correction | Inside the +20% above | Unavailable | Not split out |
| 25 Sep (Claude) | **BUGFIX — Import File Picker Filter** (1 JS + 1 delimited block, 10 new checks), Phase 11 marked complete, and the merge to main | **+3%** (74% → **77%** of this week) | Unavailable | The owner's reading after the iPhone confirmed the fix |
| 25 Sep (Claude, desktop) | **Next-phase assessment**: both local clones synced to `main`, the live build and deploy checked, the kickoff re-derived (Apply School measured at about 45 Schools, not four; D06 and Hotei found missing; Phase 12's surface measured), nine rulings taken | **+2%** (77% → **79%** of this week) | Unavailable | The owner's reading after the assessment, before any build |
| 25 Sep (Claude, desktop) | **QA — Removal Chain Registry, BUGFIX — Apply School Skill Rows** (1 JS + 2 trunk blocks + 1 seam block, 37 new checks) **and the Phase 12 audit**, plus Node and Playwright set up on the desktop | **+6%** (79% → **85%** of this week) | Unavailable | The owner's reading after all three; not split |
| 25 Sep (Claude, desktop) | Recording the Phase 12 rulings, the merges, and answering the one-part-per-tab question | **+2%** (85% → **87%** of this week) | Unavailable | The owner's reading before Part 1 |
| 25 Sep (Claude, desktop) | **Phase 12, part 1** — the machinery and Background (1 JS + 1 CSS + 1 seam block, 25 new checks, 1 conditional fixture in Phase 11) | **+2%** (87% → **89%** of this week) | Unavailable | The owner's reading after the iPhone test |
| 25 Sep (Claude, desktop) | **Phase 12, part 2** — Clan & School in Play (1 JS + 1 CSS + 1 seam block, 14 new checks) | **+1%** (89% → **90%** of this week) | Unavailable | The owner's reading after the build |
| 25 Sep (Claude, desktop) | **Phase 12, part 3** — Identity in Play (1 JS + 1 CSS + 1 seam block, 17 new checks) | **+1%** (90% → **91%** of this week) | Unavailable | The owner's reading after the build |
| 25 Sep (Claude, desktop) | **Phase 12, part 4** — Rings & Traits in Play (1 JS + 1 CSS + 1 seam block, 16 new checks) | **+2%** (91% → **93%** of this week) | Unavailable | The owner's reading after testing parts 1 to 4 on the iPhone |
| 25 Sep (Claude, desktop) | **Handoff files** (Claude and ChatGPT/Codex) and **Phase 12, part 5** — Skills in Play (1 JS + 1 CSS + 1 seam block, 17 new checks) | **+1%** (93% → **94%** of this week) | Unavailable | The owner's reading after the iPhone test; not split |
| 25 Sep (Claude, desktop) | **Phase 12, Techniques** (12.6) — Techniques in Play (1 JS + 1 CSS + 1 seam block, 16 new checks) | **+1%** (94% → **95%** of this week) | Unavailable | The owner's reading after the iPhone test |
| 25 Sep (Claude, desktop) | **Project-length estimate** and the ledger, artifact and handoff wrap-up | **+1%** (95% → **96%** of this week) | Unavailable | The owner's reading after the estimate |
| 28 Sep (Codex) | Work through Phase 12.5 completion, owner acceptance and merge; usage review requested before this documentation pass | **56% used / ~44% remaining** | Unavailable | Owner-reported cumulative weekly reading; no matching start or per-activity split. NOT a measured 56-point cost for Phase 12.5; separate from Claude totals |
| 30 Sep (Claude) | Crash recovery and **BUGFIX — Dependant Inline Typing** finished and merged | **≤4%** (week reset that morning; 3% → 4%) | Unavailable | Readings; see that update |
| 30 Sep (Claude) | **Phase 12.7** Combat in Play, with the Dependant merge | **+5%** (4% → 9%) | Unavailable | Readings; includes runs spoiled by a machine stall |
| 30 Sep (Claude) | **Phase 12.8** toolbar, with merging 12.7 | **+4%** (9% → 13%) | Unavailable | Readings |
| 30 Sep (Claude) | Ledger artifact republish, reassessment and handoff | **+3%** (13% → 16%) | Unavailable | Readings |
| 30 Sep (Claude, new session) | Next-phase assessment, from the kickoff | **+0–1%** (17% → 17%; 5-hour 39% → 45%) | Unavailable | Readings; the week read 17% at the session's start |
| 30 Sep (Claude) | **Sourcebook index** (script, three generated files, README) | **+2%** (17% → 19%) | Unavailable | Readings |
| 30 Sep (Claude) | **Phase 7, first release**: fragment, harness, variants, removal, full suite, docs | **+3%** (19% → 22%) | Unavailable | Readings; before the device check |
| 30 Sep – 1 Oct (Claude, cloud session from the phone) | Sourcebook wiki links; **Phase 4.8** in two releases (54 Ancestors, your Kakita feedback, the audit); **BUGFIX — Manage Button Clipping**; the audit page; the merges | **22%** of this week (your reading, 1 October) | Unavailable | Not a cost: the same figure the ledger recorded after Phase 7, before this work, so no change can be read from the two |
| 1 Oct (Claude, laptop) | **Next-phase assessment** from the kickoff: source read, Core pp. 245–257 read from the PDF, two headless probes of the live build | **+2%** (22% → **24%**) | Unavailable | Your reading after the assessment; the 22% was taken in the cloud session, so the two may come from different meters |
| 1 Oct (Claude, laptop) | **BUGFIX — Multiple Schools Keep Earlier Techniques** (1 JS fragment, 32 new checks, 7 variants), its merge, the iPhone checklist doc and the ledger | **+5%** (24% → **29%**) | Unavailable | Your reading after you had worked through the checklist; not split |
| 1 Oct (Claude, laptop) | Reading your results (the doc and five screenshots), the diagnosis, and **BUGFIX — Ancestor Corrections** (1 JS fragment + 1 CSS rule, 28 new checks, 7 variants, a test-only correction to one Phase 4.8 check, two full-suite runs) | **+6%** (29% → **35%**) | Unavailable | Your reading after the fix was built, before its merge and the re-test checklist |
| 1 Oct (Claude, laptop) | The merge, the **Re-test Checklist** doc, and the ledger | **+1%** (35% → **36%**) | Unavailable | Your reading after the re-test, before the ledger's HTML page was refreshed |
| 1 Oct (Claude, laptop) | The three ledgers, then **Phase 4.6's first release** (one fragment rebinding eight trunk functions, the 18 Paths, 80 new checks, four retained pins corrected, two full-suite runs), its merge and the checklist doc | **+7%** (36% → **43%**) | Unavailable | Your reading at the merge, before the variant runs |
| 1 Oct (Claude, laptop) | The variant runs, the live-site walk, your iPhone results and the ledgers | **+2%** (43% → **45%**) | Unavailable | Your reading when you approved the second release |
| 1 Oct (Claude, laptop) | **Phase 4.6's second release** (the 9 Paths, several Paths per School, the p. 246 School Rank rule, 44 new checks, 13 new variants, a full-suite run) and the ledgers | **+5%** (45% → **50%**) | Unavailable | Your reading at the merge |
| 1 Oct (Claude, laptop) | The live-site walk, the second release's checklist doc, a wording fix from your comment, and the ledgers | **+1%** (50% → **51%**) | Unavailable | Your reading after your check |
| 1 Oct (Claude, laptop) | **Phase 4.6's third release** (the other books' 175 Paths, the audit across 16 books, Secrets of the Empire's index and 24 wiki pages, 51 new checks, 17 new variants, a full-suite run) | **+9%** (51% → **60%**) | Unavailable | Your reading before the docs and ledgers; the session paused once at your 5-hour limit |
| 1–2 Oct (Claude, laptop) | The docs and ledgers, the audit published as a doc, the merge, the checklist doc and the live-site walk | **+6%** (60% → **66%**) | Unavailable | Your reading after your check, 2 October |
| 2 Oct (Claude, laptop) | Reading your results, the ledgers, the reassessment (the missing Technique text, the Schools gap, the Toku Bushi finding) and the next-session kickoff | Included in the row below | Unavailable | One reading covers both rows |
| 2 Oct (Claude, laptop) | **Phase 6's first release and BUGFIX — Technique Name Clashes**: the assessment (two findings measured), 72 texts from three books, two fragments, 47 new checks, the variants, a full-suite run, the docs and ledgers. The session reached the five-hour limit once | **+11%** (66% → **77%**) | Unavailable | Your reading at the merge; covers this row and the one above, not split |
| 2 Oct (Claude, laptop) | The ledgers for the merge, the published ledger page read in full and republished, the live-site walk, the checklist doc | **+3%** (77% → **80%**) | Unavailable | Your reading after your check |
| 2 Oct (Claude, laptop) | **The Advantages and Disadvantages audit** (no building): your September prompts, the live catalogue, all 16 books' text searched, 65 missing entries read and summarised, the doc and AUDIT.md, the ledgers | **+6%** (80% → **86%**) | Unavailable | Your reading after the audit |
| 2 Oct (Claude, laptop) | **The reassessment after the audit**: the ledgers, the roadmap, the next-session kickoff, the ledger page republished | **+3%** (86% → **89%**) | Unavailable | Read from the meter at the next session's start |
| 2 Oct (Claude, laptop) | **The assessment from the kickoff**: the book's price sentences read, the code paths measured | **<1%** (89% → 89%) | Unavailable | Read from the meter |
| 2 Oct (Claude, laptop) | **Phase 4.5.25 Clan and School Prices**: one fragment, 39 checks, 9 variants, the removal proof, a full-suite run, the docs and ledgers | **+3%** (89% → **92%**) | Unavailable | Read from the meter; before the merge and the checklist |
| 2 Oct (Claude, laptop) | Two rulings (Artisans; Uncentered by monk type): Book of Void p. 192 read, Uncentered priced for new purchases, 6 checks and a variant, a second full-suite run | **+1%** (92% → **93%**) | Unavailable | Read from the meter |
| 2 Oct (Claude, laptop) | The merge, the live-page walk (45/45), the iPhone checklist doc, your results, the Uncentered/Kiho check, the ledgers and this projection | **+1%** (93% → **94%**) | Unavailable | Read from the meter |
| 2 Oct (Claude, laptop) | The reassessment after 4.5.25 (Gaijin Name and the four untrained-Skill entries read from the Core PDF), the ledgers, the roadmap and the next kickoff | To be read | Unavailable | Started at 94%; read it at the next session's start |
| 2 Oct (Codex, laptop) | Rank 0 fix and Phase 4.5.26 through QA and local documentation; merge/device review still owed | Claude: not measured | Codex weekly **0% → 14%**, five-hour **0% → 89%** used | Fresh build-window baseline; account-wide meter after QA, before final commits. Separate provider/window from earlier assessment |

### Phase 4.7 closeout and preceding dice release — recorded Codex usage, 7 October 2026

| Date / provider | Work | Recorded allowance usage | Tokens | Measurement limits |
|---|---|---|---|---|
| 2–3 Oct (Codex) | Rank 0 fix and Phase 4.5.26, through merge/live verification | Weekly 0% → 22% (+22 percentage points observed) | Unavailable | Account-wide readings, not an isolated phase cost. Earlier QA endpoint was 14%; final five-hour reading 37% follows a reset. Windows owner pass; iPhone layout unconfirmed and non-blocking. |
| 3–4 Oct (Codex) | Phase 4.7 Core Advanced Schools | Weekly 24% → 64% (+40 percentage points observed) | Unavailable | Start and later resumption snapshots, not an exact completion boundary or isolated release cost. Five-hour 56% → 6% spans resets; weekly-window identity was not recorded. |
| 5 Oct (Codex) | Phase 4.7.1 supplemental Advanced Schools + 4.7.2 missing Basic Schools | Weekly 36% → 51% (+15 percentage points observed) | Unavailable | Resumption through final verification, combined account-wide readings; no split between releases. Five-hour 29% → 23% spans a reset. Do not join this interval to the earlier 64% reading. |
| 6–7 Oct (Codex) | Phase 4.7 follow-ups: merge/live checks, Paragon correction, owner retests and closeout | Exact follow-up cost unavailable | Unavailable | 6 Oct snapshot: 69% weekly / 69% five-hour. 7 Oct documentation snapshot: 12% / 78%, with a different weekly reset endpoint. Missing boundary readings prevent a cost for this work or the complete phase. |

These are Codex account-wide allowance readings, not token counts, monetary charges or usage attributed exclusively to this project. The observed movements above are arithmetic differences between snapshots; they are not independently measured release costs. Allowance windows changed between sessions, so do not add these figures into a Phase 4.7 total or compare them directly with historical Claude estimates. Exact total cost and per-release splits are unavailable. The 7 October snapshot was taken during this documentation update, before its final commit.

### Phase 4.5.28 and your 4.5.27 results — recorded Claude usage, 7 October 2026

Read from the meter (Claude Pro, account-wide). The 5-hour window reset at 17:40 UTC, just before the build.

| Point (7 Oct, UTC) | Work up to that point | Weekly | 5-hour |
|---|---|---:|---:|
| about 15:20 | Your checklist results and screenshots read; the recommendations | 13% | 92% |
| about 17:10 | Your rulings recorded; the resist entries parked in memory | 13% | 94% |
| 17:41 | Build start (the 5-hour window had just reset) | 13% | 0% |
| 18:07 | Fragment, stylesheet, own harness (69 checks), the 4.5.27 and 4.5.5 corrections, remover and fixtures, dependency harness, 16 variants (discovery and pinned run), the checklist walk, docs and these ledgers; the full regression still running | 17% | 33% |
| 18:21 | Full regression 4,453/4,453 and removed 4,389/4,389; final logs; this row; commit and push of the branch | 18% | 37% |
| 18:35 | Your word; fast-forward merge, the checklist doc, deploy and live verification (285/285), the live checklist walk (22/22), these ledgers | 18% | 41% |
| 19:35 | Your results and screenshots read, the cause found, your rulings; the corrections, their QA (71/71, 4,450/4,450, 17 variants, typed walk), docs and these ledgers; commit and push of the branch | 20% | 56% |

These are readings, not a precise cost. From the end of 4.5.27 (12%), reading your results and the
rulings took about 1 point and the build, through full QA, the merge, the live check and the checklist
doc, about **5** (13% → 18%); reading your results and the device corrections through their QA took
about **2** more (18% → 20%).

### Phase 4.5.27 and the assessment before it — recorded Claude usage, 7 October 2026

Read from the meter in this session (Claude Pro, account-wide). The week reset early on 7 October and
next resets on 14 October at about 02:00 BST; this session's 5-hour window resets at 18:40 BST.

| Point (7 Oct, UTC) | Work up to that point | Weekly | 5-hour |
|---|---|---:|---:|
| 12:44 | Session start | 0% | 1% |
| 13:14 | The assessment: kickoff, ledgers, roadmap, audit, nine rules and the code paths read; live site checked | 3% | 17% |
| 13:16 | Build start (approval "all as recommended") | 3% | 19% |
| 13:53 | Build and full QA: fragment, harness (127 checks), 12 variants, removal proof, both full-suite runs, docs drafted; the whole HTML ledger read | 10% | 70% |
| 14:02 | Commit, fast-forward merge, deploy and live verification (271/271), the checklist doc and its live walk (28/28), these ledgers | 11% | 80% |
| 14:05 | The published ledger page read in full and refreshed; this row | 12% | 88% |

These are readings, not a precise cost: they are account-wide, and they include reading the whole HTML
ledger and the published ledger page so that page could be refreshed. The assessment's own cost is the
first difference (**+3 points** of the week); the release's is measured from 3%.

The Codex rows are separate from the historical Claude running total. **The 23 September row is a
new week's figure**, not added to the 92% above: completing A01–A16 in one session took **28%** of
that week's allowance. By the ledger's own rule it covers the builds but NOT their device
correction, which has not happened yet (iPhone testing is next). Per release it averages about
2.5%, roughly half the 4.5.3–4.5.12 rate. Reusing machinery that already existed (4.5.15's
registry, base 4.5's reroll and seat) did what the lessons below predicted. Device correction is not
included: it has not yet occurred. Historical blank token cells remain unknown, not zero.

**24 September: the iPhone testing is done and the week reads 34%.** The 6 points cover receiving
and recording the results; the corrections they call for, and the bugfixes, are still to come and
are in neither figure. By the rule above, those corrections belong to the A01–A16 work, not to new
work.

**24 September, later: the three bugfixes took the week from 34% to 47%.** The 13 points cover the
device-pass audit and ledger write-up, BUGFIX — Spell Slot Accounting (the cancelled-cast refund
and the bonus-pip guard), the diagnosis with the owner on the iPhone and BUGFIX — Spell Slots Tab
on Safari, and BUGFIX — Service Worker Redirected Page, each through to the iPhone confirmation.
The owner read one figure for all of it, so it is not split per fix. The Spell Slot Accounting fix
belongs to the A01–A16 work by the rule above (it was found in their device pass). The two
iPhone-only bugs (a carousel that could not see a hidden page on Safari, and a cached page that
Safari refused) are older than A01–A16 and were only found because the device pass sent the owner
to the Spell Slots tab. **Lesson: one of the three could not be seen headlessly at all.** A read-only diagnostic bookmarklet run on the phone found the cause in one round
trip, after two rounds of theories had not. When a device shows something the sandbox does not,
measure on the device first.

**25 September, later: the Import fix took the week from 74% to 77%.** Three points for
diagnosing the greyed-out file from your screenshots, a one-fragment fix with 10 checks, adding it
to seven earlier folders' removal fixtures, measuring the export-format observation, marking Phase
11 complete, and the merge. It passed its device check first time. **23% of the week is left.**

**25 September: the rest of the wizard took the week from 54% to 74%.** Twenty points for four
stages and a bugfix: Skills and Advantages/Disadvantages (11.2.1), every free choice, Spells and
Kiho (11.2.2), a School's starting spells (11.2.3), and every Shugenja School's line with the
Kitsune [Mantis] removal (11.2.4), 189 new checks between them (2,236 → 2,425). About four points
a release, against three for the first stage. The spell stages cost more than screens do: each
changed earlier stages' fixtures (the Part K live-removal repair, the Isawa stand-in) and re-ran
every earlier stage's variants, and two variant runs found blind spots that needed new checks.
None of these has had its device check yet; by the rule above, that belongs to these stages.

**24 September: the wizard's first stage took the week from 51% to 54%.** Three points for six
full-screen steps and 43 checks, cheaper than the Characters list because it adds screens and no
rules: every choice goes through controls the sheet already had.

**24 September: Phase 11's first stage took the week from 47% to 51%.** Four points for a new
screen, autosave, share-sheet export and 70 checks. It stayed cheap because it built on save
machinery that already existed (the storage helpers, `collectData`, the index) and changed no
save format. Its device check has not happened yet, and by the rule above that belongs to this
stage when it does.

**Seven point releases on 16 September, against a week that began at 02:00 BST that morning,
then an eighth on 17 September. The project owner's own reading after 4.5.9 was 49% of the
weekly allowance; after 4.5.10 it is 67%, after 4.5.11 it is 74%, and after 4.5.12 it is
**82%** — exactly what the row-by-row figures sum to.**

**4.5.12's 8% covers the build AND its real-device correction, which is the rule this table
already states rather than an exception to it.** The correction was costed at 3–4% before it was
built and came in inside that, so the first ship was the other 4–5% — the same bracket as 4.5.8
and 4.5.9, which is what a phase reusing one existing mechanism costs. Note what the 8% did
*not* have to pay for: the correction needed no change to any shared file, so the byte-identical
rollback and the 902/902 removed suite were re-measured rather than re-established. **A
correction that stays inside its own phase's fragment is roughly half the price of one that does
not** — worth weighing when choosing where a fix goes, not just what it does.

**With 18% left in the week, the two items 4.5.12 costed and deferred do not both fit
separately.** Mastery labelling was estimated at 5–7% and the ammo picker at 8–12% — 13–19% as
two releases.

**Decision, 17 September: bundle them, and put the saving toward D04b's second half.** The two
share no code, but they share every piece of *per-phase overhead* — one bugfix folder, one
marker, one removal proof, one combined-suite run, one real-device round trip instead of two of
each. That is the same economy 4.5.8 and 4.5.9 each got by carrying two Disadvantages for 4%, and
it is the overhead, not the code, that the ledger's own spread keeps showing is the expensive
part. Bundled they are roughly **11–16%**, so the saving is about 2–4%.

Both also came out of the *same* real-device session on Bishamon, and both are corrections to
already-shipped trunk or Part C behaviour rather than new catalogue entries — so one folder
describing "what the D04b test pass found in code this phase does not own" is a truer record than
two folders each describing half of it.

> **Outcome, 17 September: the pair was UNBUNDLED and the mastery half shipped alone.** See the
> review note at the top of this file for why — in short, the ammo half is blocked on a ruling and
> the mastery half was cheaper than costed. The bundling *reasoning* below stands; it was the
> availability of the second half that did not.

> ⚠️ **The vehicle needs checking before this plan is acted on.** D04b's second half is **Hotei**,
> which every prior release has recorded as *source-blocked rather than expensive*: "covered
> Technique/Advantage activations requiring one Void" cannot be identified from this sheet —
> technique descriptions are labelled in-code as paraphrases, 98 of 338 technique names carry no
> description at all, and no structured Void-cost field exists anywhere. **A saving cannot be put
> toward work that cannot start**, so either Hotei's blocker is re-examined first (see below) or
> the bundle's saving simply stays in the week.
>
> **And 4.5.11 wrote down the reason to re-examine it.** That phase declared Ebisu's Social Skill
> list source-gated for the same kind of reason and was wrong — 4.5.2 had already shipped one, as
> `D45.socialSkills`. Its own standing lesson is **MEASURE BEFORE DECLARING SOMETHING BLOCKED**.
> Hotei has not been re-measured against that lesson, and there is a shape the project already
> uses for exactly "the sheet cannot know this, the player can": the **per-roll declaration** that
> Maigo no Musha, Ebisu and Jurojin all ship. Auto-classifying a covered activation is blocked;
> asking the player to declare one, and doubling that Void cost when they do, is not obviously
> blocked at all. That is a ruling to take, not a fact to assume either way.

The spread is the useful part, and it is wide: **4%** bought two whole Disadvantages (twice —
4.5.8 and 4.5.9 both), **5%** bought two rank-priced Advantages, and **12%** bought a *single*
Disadvantage that needed dice-engine integration and a twenty-invocation harness. Entry count is
a poor estimator of cost; *how much new machinery an entry needs* is a good one. Budget the next
batch by that, not by how many catalogue rows it closes.

**4.5.10 is now the most expensive phase of the week at 18%, and worth reading as a warning
rather than as a surprise.** It is one catalogue row — which is exactly what makes it the
cheapest-looking entry on the remaining list and the one that cost the most. Ten branches
behind that row meant ten distinct behaviours to design, build and check, and *nine* of the
final suite's 62 checks are geometry or wording checks that exist only because a real device
disagreed with the sandbox twice on the same day. Against the rule of thumb above: the entry
count said one, the machinery count said ten, and the machinery count was right. Also note
that the 18% covers a full real-device round trip with two corrections, not just the build —
for any phase shipped straight to a live tester, budget the corrections as part of the phase
rather than as a follow-up that costs nothing.

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
| ✅ **Fully done** | 17 | Phase 4.7 joined on 7 October 2026 after owner retests passed. Built, and proven by something other than an assertion (17 phase numbers are listed below, the 4.5.x point releases counting under 4.5; this row read 14 until 25 September, then 13 until 1 October, when Phase 12 joined it, 14 until Phase 4.8 joined it that evening, and 15 until Phase 4.6 joined it on 2 October) |
| 🔵 **Built, not validated** | 1 | Mechanism works; no evidence from real hardware yet (Phase 0.7; Phase 4.8 and Phase 4.6's first release were here on 1 October until their iPhone checks passed) |
| 🟡 **Started, not finished** | 3 | One part shipped, the rest parked or later (Phase 9; Phase 7 from 1 October; Phase 6 from 2 October, its first release merged; Phase 4.6 was here from 1 October until it was confirmed on 2 October) |
| ⬜ **Ahead** | 4 | Phase 4.7 moved to Fully done on 7 October 2026. Not started (Phase 10 excluded — deferred by design; this row read 10 until 1 October, then 7 until Phase 4.6's first release was built that night, then 6 until Phase 6's first release merged on 2 October) |

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
**62/62** checks, dropping to **19/50** against a build with the phase's kill-switch off and
**57/62** against one with its stylesheet dropped. Removal fixtures pass **19/19**, and surgical
removal rebuilds **byte-identical** to the Feature 4.59 build this release was added to
(`a8c63d61`, 2,585,131 bytes). Every retained suite reads **766/766** with the release present and
removed alike; combined **828/828**. Live build: **2,617,077 bytes**,
`812ac85e88be88e261a834330fd976612a467448f5ad63da16c096ee052db13a`.
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

**Phase 4.5.11 — Seven Fortunes' Curse (D04a)** · Part I
**74/74** checks, dropping to **33/71** against a build with the phase's kill-switch off and
**70/74** against one with its stylesheet dropped. Removal fixtures pass **14/14**, and surgical
removal rebuilds **byte-identical** to the Feature 4.5.10 build this release was added to
(`812ac85e`, 2,617,077 bytes). Every retained suite reads **828/828** with the release removed;
combined **902/902**. Live build: **2,649,854 bytes**,
`28e017553102e860e0212869c80ef4bf90c8abe2127a35ef7b78c3e34dea76d2`.
*D04, first half — five of the seven Fortunes automated, two recorded honestly. The cheapest
release of the run, and deliberately so: every branch reuses a shape 4.5.10 already paid for.*

🔵 *The point of building D01 first, demonstrated. Benten and Fukurokujin are Tengoku's TN-reporting
convention; Daikoku is Chikushudo's named-Skill −1k1; Ebisu and Jurojin are Maigo no Musha's
per-roll declaration. **This fragment introduces no new mechanism at all.** It takes no registry
seat, re-registers nothing, and inherits the DAMAGE exclusion structurally — the route 4.5.10's own
notes said future entries should prefer, used exactly as intended the first time it was reached for.*

🔵 ***The Social Skill list was already built, and the phase was scoped wrongly until it was
measured.*** The audit asks Ebisu to use "the authoritative Social Skill list", the sourcebook PDFs
are desktop-only, and so this looked source-gated the way Jigoku genuinely is. It is not: Feature
4.5.2 has shipped one since it was built — frozen at `209.85`, exposed as `D45.socialSkills`, and
scoped on by Antisocial ever since. Ebisu reads *that* list, so the two entries cannot disagree
about what a Social Skill Roll is, and it ended up **twice** gated rather than once.
**Ten minutes of measurement turned a "blocked" branch into a finished one.**

⚠️ *Daikoku **reminds, it does not debit**, and that is the audit's own safeguard honoured rather
than dodged. It asks for the starting-outfit koku to drop by one "with no repeated debit on
recalc/load and no unexplained subtraction of money already spent in play." Measured: `#f_koku` is
live player-edited **current** money, and a School's starting koku exists only as free text inside
its `outfit:` string. There is nothing idempotent to debit. Feature 4.5.6 reached the identical
answer for Wealthy. The dice half is fully automated; only the money half is a note, and two checks
assert koku survives repeated recalcs and a typed value untouched.*

📋 *Bishamon and Hotei are **deferred to D04b by scoping, not blocked** — both need review the audit
asks for. They stay pickable, priced correctly (Hotei at the sourcebook's 6, not 3) and carry a row
note saying the sheet does not act on them yet. Jigoku's shape, for Jigoku's reason: a
seven-Fortune entry showing five options would read as broken, and a real character could not
record their own curse.*

🔴 ***The live-tree guard in every Part I remover cannot fire, and this release found out the hard
way.*** They resolve it as `parents[3] / "Part F — …"`, but `parents[2]` is `Versions/` and
`parents[3]` is the repository root — so the path never existed and `root != live` was always true.
A run intended to *demonstrate* the refusal instead executed against the live Phase 0 tree and
deleted this release's own two fragments and five blocks. Everything was recoverable and nothing
was lost, but **the safety net has been decorative in all eleven removers since the model was
established.** This one resolves from `Versions/` *and* compares resolved `manifest.json` paths, so
a copy reached by a symlink or a different spelling is refused too; three fixtures pin it. **The
other ten are unfixed** — never hand one a live tree to watch it refuse.

🔴 *A second defect, found by a check written expecting to pass. This is the first entry ever
installed through `D45.install()` whose catalogue name carries a **curly apostrophe**, and D45's
own `norm()` only trims and lowercases — so `Seven Fortunes' Curse` typed with a straight quote
found no schema, and `.en-name` is free text, so a player really can do that. Every earlier
installed name is plain ASCII, which is why it had never been reachable. Worked around inside this
fragment (installs under both spellings; `active()` filters on its own flag rather than a name);
widening D45's `norm()` is the better fix and is declared, not done.*

✅ ***Every check that encodes a decision was proven able to fail*** — and two turned out weaker
than they looked, which is recorded rather than quietly left. Removing *both* damage guards made
only one of the three damage checks go red: the other two are also gated on `skillish`, so they are
sentinels over three layers, not single-point tests. Widening `skillish` as well finally turned all
three red. `F4511-GEOM-03` is the same shape — two of its three assertions hold with the stylesheet
dropped because the base sheet supplies them, and only `flex-basis` is load-bearing.

⚠️ *Not real-device confirmed. Three new pieces of geometry, and the declaration blocks can now
appear **two at a time** in one preview — a layout no previous release produced.*

✅ *Real-device pass, 17 September 2026, iPhone, against the live build. All ten realms confirmed
working correctly for both Shugenja and non-Shugenja pricing — Gaki-do, Sakkaku, Yume-do, Jigoku,
Yomi, Chikushudo, Meido, Tengoku and Maigo no Musha with no corrections needed.*

⚠️ *Real-device correction, same day — Toshigoku's Willpower-check button.* Reported "not in
line." Measured before touching anything: at 375px the row is 303px wide; "Change" and the badge
already use 160px of it, leaving 143px, and the button's own 207px label can never fit — it wraps
on every device, at any width this sheet targets. The bug was never the wrap (shared trunk
`flex-wrap` every configured entry relies on); it was a `margin-left:6px` written on the assumption
the button would sit *beside* the badge, which at this width it never does. Alone on an orphaned
line, that margin read as an unexplained indent. Fixed with a zero-content break span
(`flex-basis:100%`) that forces the line break deliberately, so the button always starts flush left
at its own natural width; `margin-left` became `margin-top`, correct however the row wraps. A new
check (`REALM4510-GEOM-05`) asserts the guarantee and was proven able to fail first — a scratch
copy with the old margin restored drops the suite to 60/61 on that one check alone. Own suite
60/60 → **61/61**; combined 826/826 → **827/827**; surgical removal re-confirmed byte-identical to
the same `a8c63d61` restore point on a fresh copy.*

⚠️ *Second real-device correction, same day, on request — tried inline instead of accepting the
wrap. Measured three shortened labels against the 143px available: "Willpower (TN 15)" (158px,
still too wide), **"Check (TN 15)" (124px, fits)**, "TN 15 check" (115px, fits with more margin).
Shipped "Check (TN 15)" — the row's own text and the button's `aria-label` still say "Willpower
Trait Roll," so the visible label losing that word costs nothing needed. Paired with
`.adv-config-btn`'s own compact sizing, **duplicated rather than shared** (CLAUDE.md's rule: one
class shared between two phases cannot be surgically removed by either), it measures **117px**.
The break span and its margin are **removed entirely, not adjusted**: with no custom margin on the
button, the row's own `gap:8px` supplies correct spacing automatically whichever line it lands on.
Measured on this build: it lands inline, 8px after the badge, ending at 285 of the row's 303px.*

🔴 *This sandbox's measurement is not proof for the real device, and here that actually matters.
Button text passes through the same uppercase-plus-letter-spacing transform that split
"Determination" on Feature 4.5.4's first attempt, at a comparable margin. If the real webfont
renders wider than measured here, it wraps — and because nothing depends on which outcome
happens, that is a size difference, not a bug. The first correction needed no such caveat, because
flush-left held at **any** width by construction; this one is genuinely font-dependent and needs
on-device confirmation regardless of what this measurement says.*

✅ *Same day, also fixed on report: **Yomi's badge read inconsistently with Gaki-do's** — solid and
tinted instead of dashed and transparent, despite Yomi never touching a roll either. Real gap, not
a deliberate choice: the quiet styling only ever covered the `reminder` effect, and Yomi's
`conflict` key had no override, falling through to the "active" look by omission. Widened the
selector to cover both, **deliberately not** widened to Toshigoku's `check` or Maigo no Musha's
`declare` — both of those can produce a real roll or dice-pool change when invoked, unlike Yomi.*

✅ *Both new checks (`REALM4510-GEOM-05` rewritten, `REALM4510-GEOM-06` new) proven able to fail by
isolated scratch reverts — 61/62 in each case, the single relevant check going red and nothing
else. Own suite 61/61 → **62/62**; combined 827/827 → **828/828**; kill-switch-off unchanged at
19/50; stylesheet-dropped 58/61 → **57/62** — grew by two failures for a real reason: the button's
fit and Yomi's badge style are now genuinely CSS-supplied, where the first pass held structurally
regardless of CSS. Surgical removal re-confirmed byte-identical to the same `a8c63d61` restore
point on a fresh copy; retained suites re-confirmed at 766/766 with the phase removed.*

⚠️ *Not yet re-confirmed on the reporting device — this correction, unlike the first, carries a
real chance of needing a further round if the button still doesn't fit on the actual phone.*

**Phase 4.5.12 — Seven Fortunes' Curse: Bishamon (D04b)** · Part I
**45/45** checks, dropping to **24/45** against a build with the phase's kill-switch off and
**41/45** against one with its stylesheet dropped. Removal fixtures pass **16/16**, and surgical
removal rebuilds **byte-identical** to the D04a build this release was added to (`28e01755`,
2,649,854 bytes) **on the first attempt**. Every retained suite reads **902/902** with the release
removed; combined **947/947**. Live build: **2,669,182 bytes**,
`143a4ce7e4a7064e4548fe26d5110aa385f49b7d91617eb1323f8f8c44591219`.
*One Fortune. The cheapest-looking entry left on D04, and the one that found the largest thing.*

🔴 ***Damage rolls do not go through the modifier pipeline, and nobody had noticed.***
`rollWeaponDamage()` never calls `applyPreRollModifiers()`: it rolls `getWeaponDamageDice()`'s
numbers directly and consults the pipeline only *afterwards*, to decorate an already-rendered
modal. Measured by registering a probe returning a real `-3k-1` for `ROLL_KINDS.DAMAGE` — **the
modal printed `PROBE: -3k-1` and the dice rolled the full, unreduced 5k2.** Every 4.5.x entry
before this one reaches rolls through that registry, so the obvious Bishamon would have displayed
a penalty the dice never received *and* satisfied any check that asked `getPreRollModifiers()` and
stopped. That is Part H Phase 1's failure exactly: two halves agreeing with each other rather than
with reality.

✅ *So the reduction lives in the damage maths, and the check that proves it reads **rendered
dice**.* `F4512-ROLL-01` drives a real damage roll and counts what is on screen. A scratch build
that computes the reduced pool, reports it correctly, and rolls the unreduced one drops the suite
to **44/45 on that check alone** — nothing else in the file can see it. That is the strongest
single justification for the design, and it is why the check exists.

🔵 *It takes **no registry seat at all**, which is a better position than Features 4.5.9, 4.5.10 or
4.5.11 could reach — not by care, but because the pipeline is not involved. Phase 1.5's baseline of
seven holds by construction. And it needs **no edit to D04a** despite completing that phase's own
entry: `F4511.FORTUNES` is a live mutable object and `decorate` reaches `decorateRow` by property
lookup, so the spec is retuned in place and the decorator wrapped from outside — Feature 4.5.3's
pattern. Changing the effect key away from `deferred` also switches off D04a's "not yet automated"
note and its quiet dashed badge, without touching that file.*

✅ *The audit's three boundaries were **already separate in the code**, which is why this was cheap.
It keys on the `traitName` the damage function itself reports. **Han-kyu is the sharpest check in
the suite**: bow rating 1, so `min(rating, Strength)` reads 1 at every Strength from 1 to 5 and
Bishamon can never move it — a blanket −1k0 passes every other damage check in the file and fails
only that one. **Unarmed is affected**, measured: it carries no `dmgTrait` key at all, so
`undefined !== null` sends it to the `|| 'Strength'` fallback. **Perception weapons and flat-DR
weapons are untouched.** And actual Strength is never written — measured that lowering it would
move the Water Ring.*

⚠️ ***At Strength 1 the curse costs nothing, and the row says so in those words.*** The sourcebook
does not say what "one rank lower" means at Strength 1. Measured: the Strength input's own minimum
is 1, and an effective 0 makes an unarmed strike roll `0k1`, which `rollWeaponDamage()` refuses
outright — a curse presenting as a broken sheet is worse than one doing nothing. One named
constant, and **the single thing in this release a rulebook could overturn.**

🔴 *A defect found by a check written expecting to pass, and a mistake caught by the removal proof.*
`F4512-ROLL-02` failed: the dice dropped correctly and the modal said nothing about why — the
damage modal has no general explanation channel, because `getWeaponDamageDice()`'s breakdown is
only ever surfaced by the ammo phase's decorator. Fixed with one additive `.roll-note`; the
modifier bar was rejected because it builds a fixed `id` the ammo phase already uses, and an
informational modifier was rejected because it would need an eighth registry seat. Separately, the
first manifest edit used `json.dumps()` and **reformatted the whole file — 465 insertions where
four lines were wanted**, breaking every Part I remover's line surgery. Review and the harness were
both green; only running the removal caught it. A fixture now pins the manifest's compact shape.

✅ *The geometry checks discriminated on the **first** attempt. Both builds were measured side by
side first: the note's width and x position are **identical** with the stylesheet dropped, because
the row's own flex supplies them, so neither is asserted. The stylesheet-dropped build fails
exactly the four checks that rest on `flex-basis`, `margin-top`, `font-size` and `color`.*

📋 *Hotei is still deferred, and is **source-blocked rather than expensive** per the audit:
"covered Technique/Advantage activations requiring one Void" cannot be identified from this sheet —
technique descriptions are labelled in-code as paraphrases, 98 of 338 carry no description at all,
and no structured Void-cost field exists anywhere.*

⚠️ *Not real-device confirmed. One new full-width row note, and one new line in the damage modal.*

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

**Phase 11 — Characters List, Creation Wizard & Save Model** · Part K
Built in stages: the Characters list and save model (70 checks), then the wizard as 11.2 to 11.2.4
(43, 32, 52, 25 and 71 checks), each removing byte-identically; **2,435/2,435** combined with the
Import File Picker Filter fix. **Confirmed on your iPhone and laptop, 25 September:** the list,
opening, Save As a copy, Export JSON, Import JSON, and a character made through the wizard.
*Export to PDF is Phase 11.1, not started. Play mode and the toolbar's replacement are Phase 12.*

**Phase 12 — Play Mode / Management Mode Split** · Part K
One part per tab, each its own release with its own removal proof: the machinery and Background
(12), Clan & School (12.1), Identity (12.2), Rings & Traits (12.3), Skills (12.4), Advantages &
Disadvantages (12.5), Techniques (12.6), Combat (12.7) and the toolbar (12.8, the last, with the
full suite at **2,954/2,954**). **Every part confirmed on your iPhone** (25, 28 and 30 September)
and merged. *Two ideas parked for review after completion: Manage as a separate screen, and Print on
the Characters list's menu. Moved here from "Ahead" on 1 October.*

**Phase 4.8 — Ancestors** · Part I
All 54 Ancestors of the three books supplied (the Core Rulebook, The Great Clans, Secrets of the
Empire), in two releases with your Kakita feedback applied (**349/349** own checks). **Confirmed on
your iPhone, 1 October:** 35 of 38 checks at first; checks 4.1 and 4.23 were corrected in BUGFIX —
Ancestor Corrections, which passed its re-test 9/9. With BUGFIX — Manage Button Clipping (nothing in
the header moves; its slow first tap is for Phase 15) and BUGFIX — Multiple Schools Keep Earlier
Techniques. *Deferred by you: the Clan & School page's clutter (Phase 15), a lost-favour Ancestor
editable in Management (end of project), a used once-a-session gift not offered (later). The wiki
cross-check is still blocked. Moved here from "Built, not yet validated" on 1 October.*

**Phase 4.6 — Alternate Paths for All Character Types** · Part I
Every Alternate Path and Ronin Path in your 16 books: the Core Rulebook's 27 in two releases
(**80/80** and **124/124** own checks) and the other books' 175 in a third (**175/175**; full suite
**3,619/3,619**; 44/44 pinned variants), with the audit that finds none missing ([AUDIT.md](PART%20I%20%E2%80%94%20Phase%204.6%20Alternate%20Paths/AUDIT.md),
also the [Phase 4.6 Alternate Paths Audit](https://claude.ai/artifact/4o2YWKYiA3KcaVGuST7i9C) doc). 214 Paths in all: 175 can be taken, 39 are
recorded only. **Confirmed on your iPhone: 19/19, 21/21 and 13/13** (1 and 2 October). *Thirteen
Paths are in books you don't have (eleven from The Second City); three Schools the Paths name are not in
the sheet (Hiruma Scout, Akodo Tactical Master, Kaiu Siege Master). One defect found after the merge
(the Toku Bushi's Rank 4 text), fixed by BUGFIX — Technique Name Clashes, merged 2 October. Moved here
from "Started, not finished" on 2 October.*

---

**Phase 4.7 — Advanced Schools and Missing Basic Schools** · Part I
Complete for the agreed scope, 7 October 2026: 23 Advanced records (22 playable human, one recorded-only Nezumi), 69 manual Technique references, plus Hiruma Scout and Heroes of Rokugan Yotsu Bushi with ten Basic Technique references. All three releases and the Paragon correction are merged and live. **4,262/4,262** full corrected checks, **226/226** live focused checks; all owner functional follow-ups passed. iPhone layout remains unconfirmed and non-blocking. Advanced-rank Path replacement is unsupported; Technique effects remain manual. FT-01–FT-10 remain deferred final reviews. Cost readings and limitations are in the cost table above.

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

### Phase 7 — Data Integrity & Persistence · Part J

**Built, verified and merged (30 September):** the first release. One chain of registered save-format
steps; every save and export stamped with the current format; older saves carried up on Import,
copy, export and load; accented export names kept. **45/45** own checks, byte-identical removal.

**Outstanding:**

- [x] **Your iPhone check** of the first release (its MANUAL-TESTS.md, about five minutes): 6/6, 1 October.
- [ ] **The audit log** — later, by your ruling of 30 September.

### Phase 6 — Kata/Technique Synergy Detection · Part G

**Built on branch `claude/phase-6-technique-text` and merged on your word (2 October):** the first release, the text of the 72 School
Techniques that had none, with BUGFIX — Technique Name Clashes beneath it. 21/21 own checks, the fix
26/26, full suite 3,666/3,666.

**Outstanding:**

- [x] **Merged on your word**, 2 October.
- [x] **Your iPhone check**: 13/13, 2 October.
- [ ] **The SynergyEngine** and its flags in the roll preview: later releases.

---

## ⬜ Ahead

In Recommended Build Order. Phases 4.6, 4.7, 4.8 and 12 are complete and sit under Fully done, and Phase 7
under Started, not finished. **Phase 6's first release** (the Technique text it needs) is built on
branch `claude/phase-6-technique-text` and merged on your word (2 October), before your iPhone check; Phase 6 sits under
Started, not finished.

> **Phase 5 was built ahead of Phase 6, deliberately.** The order below puts 6 at position 12 and
> 5 at position 13, but Phase 5 has no hard dependency of its own and Phase 6 turned out to be
> partly source-gated: a `SynergyEngine` has to scan techniques, and of the **338** technique
> names the School libraries reference, **98 carry no description at all** (they render a "check
> the official rulebook" fallback; **72 as of 30 September 2026**, measured by evaluating the libraries, and still 72 on 2 October: every one in the 20 Minor Clan and Mantis Schools, and every one found in the books) while the other 240 are explicitly labelled in-code as
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

> **The remaining Phase 4.5 scope is not in this table:** D06 Weakness (approved approach, needs
> boundary rulings, not built) and Hotei, D04b's second half (recorded as source-blocked). Everything
> else in the audit's configuration scope shipped as 4.5.3 to 4.5.24, A01–A16 being completed on 23
> September, and the modal-overflow finding (#11) was fixed by 4.5.4. Ruled 25 September: D06 and
> Hotei come after Phase 12's first build stage. (Until 25 September this note described the scope
> as it stood after 4.5.3.)

| Phase | Name | Part | Note |
|---|---|---|---|
| 11.1 | Export to PDF | K | Split out of Phase 11 on 24 September; added to this table 25 September, when it was found missing |
| 13 | Library (Sourcebook Viewer) | K | Needs sourcebooks |
| 14 | Comprehensive Search | K | Needs Phase 13 only for a result's link into the book; a first Search release may come before 13 (revised order, 7 October 2026) |
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

**Bugfixes** landed outside the numbering: seventeen `BUGFIX` folders at the last count (2
October), listed in `CLAUDE.md`'s folder map, plus the scroll-to-top button that shipped
broken. (This paragraph said "sixteen" until 2 October; "three" until 25 September, "eleven" until 1 October, then "fourteen"
until that evening.)

---

## Keeping this current

Re-export it by asking Claude to refresh the ledger — it reads the tick state from the artifact
and regenerates this file. Or tick the boxes here by hand: they are ordinary GitHub task-list
checkboxes and editing the file is enough.

`BUILD-LEDGER.html` beside this file is the source of the published artifact. GitHub will show it
as source rather than rendering it — open it locally, or use the artifact link at the top. Its
tick-boxes only persist inside the artifact runtime, so a local copy behaves as a static page.
