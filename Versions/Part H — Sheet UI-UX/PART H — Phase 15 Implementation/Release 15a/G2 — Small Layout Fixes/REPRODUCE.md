# Release 15a · G2 — Small Layout Fixes · step 1: reproduction on today's build

7 November 2026 (Claude). Read-only: nothing in the tree was changed.

- **Build measured:** `2dcf6f20…6af6`, 17,586,964 bytes. This is G1 as live, at `main` `2790a2ba`.
- **Sizes and modes:** phone 390 × 844 (touch) and desktop 1440 × 1000, in Play and Manage.
- **Character:** A03's dense audit character (Crane). The rows below were added to it through their own pickers.
- **Scripts:** `qa/inventory.cjs` (every picker, the unit rows, the whole-app read), `qa/card-text-x.cjs` (where each line of an Advantage card starts) and `qa/configured-rows.cjs` (Wealthy and Lord Moon's Curse configured, plus the Insight and Spent XP helper text).
- **Outputs:** `qa/reproduce/`, which holds 58 picker screenshots, the row and helper screenshots, and the JSON files.

> **Browser note.** On 7 November, Playwright's bundled Chromium (1243) **crashes on this machine** whenever it opens a page: the headless shell exits with 0xC0000005, and the full build will not start ("spawn UNKNOWN"). Microsoft Edge 154 and Chrome 156 work, so this read ran on Edge (`PW_CHANNEL=msedge`). G1's harnesses and its qualification ran on the bundled Chromium. That has to be working again, or a browser change has to be agreed, before G2's light checks. Also, `timeout` in this Git Bash is Windows' `timeout.exe`, not GNU timeout.

## A05 · Missing Limb's picker

| | Missing Limb's select | Shared controls on the same card |
|---|---|---|
| Size | 123 × **25** px | the row's buttons are 32 px tall (Resist Lord Moon, Add koku) |
| Font | 16 px **Arial** (the browser's default) | EB Garamond for text, Noto Sans JP for buttons |
| Label | "MISSING", 9.7 px uppercase on a phone and 10.6 px on desktop. The carousel's label rule shrinks it, as Phase 4.5.14 (Part I) recorded. | |
| Layout | Phone: the select, then the note "Ticks on every roll but damage." on the line below. Desktop: the note on the same line, 8 px after the select. | |

The same in Play and Manage. Owner layer: Phase 4.5.31 (Part I), `chk4531-limb` / `chk4531-field`.

## A06 · Grant actions and their state

- **Zakyo Toshi Citizen:**
  - The row shows "Add 1.5 koku" (120 × 32) and "Already added" (138 × 32) **touching, with a 0 px gap**. Both are styled alike (`ghost supp4540-btn`), so neither reads as the main action.
  - On a phone, the two buttons sit inside the text block "Half your School's starting koku again: 1.5…", 18 px below its top.
  - Present in Play and Manage. Owner layer: `209.99999999997-feat-supplement-identity-outfit.js`.
- **Wealthy:**
  - The picker asks "Starting koku — 2 per Rank": *Add it to my Koku now* or *I have already added it myself*.
  - After the choice, the row shows a state line ("4 koku from Wealthy recorded on your Koku.").
  - The two grant buttons (`wealth4517-btn`) appear only on a save that has no receipt, which is Phase 4.5.17's (Part I) "asked, never assumed" state. The mock-up will show that state as well.

## A07 · The Moon row

On every size and mode, the row is three lines that do not share an edge or a baseline:

1. "Medium — 5 points" in 13 px text, followed (in Manage) by "Change", a 20 px button.
2. The full-moon tick: a 13 px checkbox inside a 20 px label, in 9.7–10.6 px uppercase. Its text starts **10 px right of** "Medium" on the line above (the checkbox takes the first 10 px).
3. "Resist Lord Moon (TN 20)", a 32 px button.

The severity has no label of its own: "Medium" is the only word on its line. Owner layers: LM7, which is `209.99999999999997-bugfix-moon-curse.js` (`lm7-*`) with its resist label in `…995-bugfix-moon-resist-label.js`.

## A11 · Helper text, and text that does not line up

**Insight and Spent XP (the audit's case):**
- **Desktop:** both hints have `margin-top: -4px`, so they start **4 px above** the bottom of the field grid above them. They are 12.5 px text with a 1.42 line height.
- **Phone:** the gap is 14 px and the text is 11.7 px with a 1.42 line height. The cramping is a desktop problem.

**The owner's case (Advantage cards), confirmed, and found on every card:**
- On every Advantage and Disadvantage card, phone and desktop, Play and Manage, the name and description boxes start their text **10 px right of** every summary, note, warning and reminder line.
- Measured from the card's left edge: the name and description (`en-name`, `en-desc`) start at **23 px**, because the box's own 10 px padding is inside them. The plain text lines start at **13 px**. Those lines are `adv-config-summary`, `adv-config-warn`, `chk4531-note`, `dsx4532-note`, `vi4533-note`, `sr7-flag`, `p4518-reminder` and `fb4521-reminder`.
- Sworn Enemy and Seven Fortunes' Curse (Hotei) measure exactly that: 13, then 23.
- Two smaller cases on the same cards:
  - Hotei's badge `fortune4511-badge` starts at 22 px, because it is a pill with its own padding.
  - Paragon's and Seven Fortunes' Blessing's reminder lines start 9 px left of their badge, for the same reason.

**The whole-app read** covered every tab on both sizes and in both modes. It looked for text that starts 3–24 px away from the text above it in the same card, and for small text less than 4 px below a field.

| Where | What | Size |
|---|---|---|
| Every Adv/Disadv card | name and description boxes vs the lines between them (above) | 10 px |
| Lord Moon's Curse | the full-moon tick vs "Medium" (part of A07) | 10 px |
| Switch rows (Soft-Hearted, Lost Love, Blissful Betrothal) | the switch's text starts after its checkbox, 33 px right of the notes | by design: the box is at the edge |
| Identity, desktop | Insight and Spent XP hints 4 px over the field grid | −4 px |
| Missing Limb, Lost Love, Contrary, Rumormonger, Soft-Hearted, Blissful Betrothal | the description box 2 px under the row's controls | 2 px |
| Rings, desktop | "Ring = lower of its two traits" 12 px right of its label | 12 px |
| Combat, Play | the "Armor & TN ⓘ" summary 15 px right of its heading | 15 px |
| Wounds | the table's first column 8 px right of its caption | 8 px |
| Combat, Play bonus note (`bl4534-note`) | 3 px under its field | 3 px |

The read is a heuristic, so these are candidates for the owner rather than defects. Two hits are not misalignments and are left out: the Skills table's cost column, and the Emphasis badge. Those are table and inline layouts that the test misreads as text below a field. **Proposed scope for A11:** the audit's Insight and Spent XP gap, and the card text edge (the first row of the table). The owner decides whether the smaller candidates join A11 or wait.

## A04.1 · How every picker explains its options

All 174 entries in the two quick-add lists were tried. **56 open a picker; 118 are added directly.** No picker failed to open, and the pages logged no errors.

| How options are explained | Pickers |
|---|---|
| **Rule shown in full on the option (inline)** | Paragon (7 options), Dark Paragon (7), Touch of the Spirit Realms (10), Soul of Artistry (2) |
| **"▶ Rule" disclosure on each option** | Seven Fortunes' Blessing (7) |
| **Phase 4.54's i on each option** (4.5.2's own disclosure hidden behind it) | Consumed (7), Failure of Bushido (7), Cursed by the Realm (10), Seven Fortunes' Curse (7) |
| **Name and cost only: nothing to explain** (ranks, tiers, Elements, Skills, Traits) | 28: Languages, Naga Ancestry, Allies, Chosen by the Oracles, Elemental Blessing, Friendly Kami, Friend of the Elements, Luck, Magic Resistance, Void Versatility, Gentry, Wealthy, Great Potential, Compulsion, Doubt, Phobia, Sleeper Agent, Weakness, Antisocial, Bounty, Cast Out, Clear Water Stigma, Obligation, The Chrysanthemum Court, Enlightened Madness, Lord Moon's Curse, Wrath of the Kami, Ruined City Survivor |
| **No option list** (text fields, selects); a field-level i on five of them | 19: Forbidden Knowledge (i), Way of the Land (i), Blackmail (i), Heart of Vengeance (i), Inheritance (i), Watanu-Trained, Darling of the Court, Perceived Honor, Stolen Identity, Water Hammer Citizen, Zakyo Toshi Citizen, Kharmic Tie, Reincarnated, Dependant, Imperial City Stigma, Sworn Enemy, Trials of the Imperial City, Elemental Imbalance, Unlucky |

**So A04.1 changes five pickers:** Seven Fortunes' Blessing, Consumed, Failure of Bushido, Cursed by the Realm and Seven Fortunes' Curse. It brings them to the inline pattern the four inline pickers already use.

- **Out of scope:** the 28 label-only pickers have no per-option rule to show. The five field-level i's explain a field, not an option, so they stay as A04 left them.
- **Length on a phone:** the window's scroll height today is 976 px for Touch of the Spirit Realms (inline, 10 rules) and 754 px for Paragon. The five A04.1 pickers measure 801 px (Blessing) and 811–1,109 px (Consumed, Failure of Bushido, Cursed by the Realm, Seven Fortunes' Curse) **with their rules hidden**. Shown inline, Cursed by the Realm and both Seven Fortunes pickers will be the longest windows in the app, so the mock-up must show them on a phone.

## Usage (Claude, account-wide, five-hour / weekly)

| When (UTC) | Five-hour | Weekly | Point |
|---|---|---|---|
| 7 Nov 14:05 | 22% | 84% | G2 start |
| 7 Nov 14:26 | 32% | 86% | end of step 1 |

Step 1 cost about **2 weekly points**. Nothing so far suggests G2 is bigger than the kickoff's 15–20 estimate. A04.1 touches five pickers, which fits its 3–5 estimate. A11 depends on the scope chosen above.

## Next: step 2, mock-ups

One board per unit, today beside proposed, then **STOP for the owner's approval.**
