# Release 15b · G1 Totals and their breakdowns: reproduction on Release 15a as live

20 November 2026 (Claude).

- **Build.** Source SHA-256 `921f3ac9e5c61bde84068a20dd5cc4ab014367e8b1b7930438cf24b4a7686150`, 17,718,601 bytes: the live tree in the worktree on `claude/release-15b-kickoff` (`main` `3b499a88`).
- **Browser.** Chromium 153.0.8010.12 from the project's QA tools, at 390 × 844 touch (device scale 2) and 1440 × 1000, one browser job at a time, with the suite's two preloads (the navigation budget and the splash test switch).
- **Test characters.** The audit's dense Kuni Shugenja (`A03 …/qa/a03-fixtures.json`, `dense`), each with only the entries its finding needs, written by `qa/mockup/fixtures.cjs` and opened from the file.
- **Status.** Scratch evidence, not qualification. Native Safari was not used. There were no page errors in any run (16 page-error lists, all empty).

## Scripts and results

The scripts are in `qa/mockup/`:

- `repro.cjs` runs through `run.sh`, which sets the QA environment and the two preloads. It uses `common.cjs` and `fixtures.cjs`.
- `proposals.cjs` draws each proposal in the page from the sheet's own values (`WND4529`, `CP4525`, `DSX4532`, `CHK4531`, `TR4524`). No application file was edited.
- `embed.py` builds the board from `board-template.html` with `--webp 85 --max-width 640:phone`. The phone pictures are scaled from 780 to 640 pixels wide.

Every value below is in `reproduction.json`, from one run at 01:09 UTC. The PNG captures are in the session notes folder (`g1-15b-mockup-evidence/`), not in the repository.

## A14: Low Pain Threshold with Strength of the Earth, Nicked

Earth 2, campaign multiplier 2 (Healthy to 10, Nicked 11 to 14). The test sets 12 of 38 wound points in Play.

**Today:**

- **Wounds line:** "Nicked — TN of all rolls +5 (Low Pain Threshold +5, Strength of the Earth −3) — 12 of 38 wound points".
- **Each level's screen-reader name** carries the same brackets: Grazed +7, Hurt +12, Injured +17, Crippled +22, Down +42.
- **The window a tap on the current level opens:** "Nicked / TN of all rolls +5 (Low Pain Threshold +5, Strength of the Earth −3) / Increase the TN of all rolls made by +3 while Nicked. …".
- **Quick Access** repeats the line.
- **A Defense roll's preview** has two rows: "Wound Penalty −5 to total — Nicked" and "Wound Penalty 3 → 5 (Low Pain Threshold +5, Strength of the Earth −3) — already included in the Wound Penalty."
- **The penalty** (`getWoundPenalty`) is −5.

**Proposed:**

- The line reads "Nicked — TN of all rolls +5 — 12 of 38 wound points", with an i, and the levels' names lose their brackets.
- **The window:** Nicked +3 (Wound Rank penalty); Low Pain Threshold +5 (Disadvantage, Core Rulebook p.160); Strength of the Earth −3 (Advantage, Core Rulebook p.154); TN of all rolls +5; then the rank's rule.
- **Quick Access:** the net line, with an i.
- **The preview:** one row, "−5 to total — Nicked 3 + Low Pain Threshold 5 − Strength of the Earth 3".
- **The penalty** is still −5.

## B02: prices another entry changes

**Setup.** Blissful Betrothal with "Your Kharmic Tie is to your spouse" ticked. Social Position is saved at 4, from 6, with Phase 4.5.32's record. Kharmic Tie Rank 3 (Aiko) is priced 3 by the core, and 1 after Blissful Betrothal. Large is fixed at the Crab price (Feature 4.5.25: 3, catalogue 4). Manage, Advantages.

**Today:**

- **Social Position:** 4, with no note.
- **Kharmic Tie:** 1, with no note.
- **Large:** "Crab price: 3 XP (catalogue 4)."
- **Blissful Betrothal's own note:** "Gentry, Social Position and Wealthy (and that Kharmic Tie) cost 2 less each, never below 1."

**Proposed:**

- **The three lines:** "Actual 4 XP · catalogue 6 XP", "Actual 1 XP · catalogue 3 XP" and "Actual 3 XP · catalogue 4 XP", each with an i. Large's old note is hidden.
- **Social Position's window:** Catalogue price 6 XP; Blissful Betrothal −2 (2 less, never below 1, Core Rulebook p.146); Actual price 4 XP.
- **The Kharmic Tie's window:** the same, with "Your Tie is to your spouse".
- **Large's window:** Catalogue price 4 XP; Crab price −1 (Core Rulebook p.151); Actual price 3 XP.
- **Costs:** unchanged.

## B04: Blind, Reflexes 2, no armour

Play, Combat page.

**Today:**

- **Quick Access:** "Armor TN 7" with "Blind: Reflexes 2 + 5 = 7" under it.
- **The Combat card:** "Blind: Reflexes 2 + 5 = 7 (Core Rulebook p.156)" under Base TN to be Hit (7). Current TN is 7.
- **The Combat card's ⓘ:** "Base TN = (Reflexes × 5) + 5. Current TN adds your Armor TN Bonus. Initiative = (Reflexes + Insight Rank)k(Reflexes)."

**Proposed:**

- **Quick Access:** "Armor TN 7" with an i.
- **The window:** Armor TN, 7 to be hit; Base: Blind, Reflexes 2 + 5 (Blind: Reflexes + 5 instead of Reflexes × 5 + 5, Core Rulebook p.156) 7; Armor TN Bonus +0; Armor TN 7.
- **The Combat card's ⓘ:** the same table above its formula.
- **The Combat card's line:** unchanged.

## B14: Touch of the Spirit Realms (Jigoku), Lost, Taint Rank 4

Play. A Defense roll (Reflexes), and the Advantage card.

**Today:**

- **The preview:** "Touch of the Spirit Realms (Jigoku) +8 to total — Lost: twice Taint Rank 4". Pool 3k2.
- **The card:** "Adding 8 (Taint Rank 4, doubled: Lost)."

**Proposed:**

- **The preview:** "+8 to total — Taint Rank 4 × 2 (Lost)".
- **The card:** "Adding +8 — Taint Rank 4 × 2 (Lost)."
- **The pool:** unchanged.

## Book pages

None were extracted. Every page reference is the one the sheet already records:

| Entry | Page | Recorded in |
|---|---|---|
| Low Pain Threshold | Core p.160 | Phase 4.5.29 |
| Strength of the Earth | Core p.154 | Phase 4.5.29 |
| Blind | Core p.156 | Phase 4.5.34 |
| Blissful Betrothal | Core p.146 | Phase 4.5.32 |
| Large (Crab price) | Core p.151 | Feature 4.5.25 |
| Touch of the Spirit Realms | Core pp.154–155 | Feature 4.5.24 |
