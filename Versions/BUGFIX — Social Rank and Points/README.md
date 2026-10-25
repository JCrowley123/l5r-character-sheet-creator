# Social Rank and Points — Cycle 7a

**25 October final status:** one review complete; both fresh full QA passes succeeded (6,175 candidate / 5,973 retained each), with exact five-layer removal. Earlier stage-specific pending statements below are historical. Merge, live and device checks remain pending. See the Cycle 7a QA README.

Honour updates Rank and whole points together. Glory and Status keep pending points until Management uses **Recognition by your lord**. Losses borrow immediately. Nine pips stay together below the Rank controls on phones.

Built against main 440667b. Targeted verification passes; this is not a release claim.

## Rules and state

Core Rulebook pp.90–95; owner rulings R1, C1 and C2. Honour is a full value for fractional thresholds, and whole Rank where the rule calls for Rank. Glory and Status eligibility uses recognised Rank only. Inputs remain bounded to the existing Rank range 0–10. Pending points remain unbounded; recognition at Rank 10 keeps unused points. Pips edit only the remainder; Points +/- changes the full pending count.

Format 5→6 is registered with VersionManager. Honour uses the former Points score; Glory and Status keep the former approved Rank and tenths. Monk undo records migrate too. A discrepancy notice appears on migration and is not carried into the next collected save. Existing sourcebook text is not copied.

## Structure

RP7Logic is DOM-free arithmetic and migration. RP7 owns controls and existing-feature adapters. SOCIAL_RANK_POINTS_ENABLED disables the complete layer. RP7.labels.recognize is the single wording constant. Guarded shared blocks adapt School grants, Dark Paragon payments and the test seam. Ancestors, Paths, ranked Advantages, Court reminders, Disadvantages and situational gates read the common rule through their existing APIs. Taint, Imperial Scion and general resistance bonuses are later layers.

## Verification

qa/social-rank-points-harness.js has 30 checks. variants.json is pinned before any run. Candidate 30/30; predecessor 1/30; all four pinned variants matched; removal 6/6. Thirty affected older harnesses have passing evidence across build stages, under qa/evidence. Twelve fixture/schema adapters retain their assertion counts: qa/changed-harnesses.json lists their files and hashes. Dark Paragon now navigates to the visible panel and waits for fonts before its unchanged geometry assertions (67/67). The final CSS makes empty pips unfilled; 30/30 passed again, and the 390px layout was visually inspected. Final build: 7,995,221 bytes, cbadfe0b542c9cca269c0e1dd19a02c1038e49b11f973fd82651e7a77de349be. The notice appears once per unchanged legacy record per app session, and the next save drops it. The eventual Cycle 7a runner must list all changed harnesses/counts explicitly. No full-suite run or review yet.
