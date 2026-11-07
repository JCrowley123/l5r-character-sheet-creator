# Release 15a · G1 (A04, A15, A16) — reproduction and mockups

6 November 2026 (Claude). Steps 1 and 2 of [the G1 kickoff](<../A03 — Top-Aligned Columns and Compact Skill Cards/KICKOFF-15A-G1.md>). **A03.1 approved 7 Nov. Revision 3 of A15 sent 7 Nov; waiting on the owner's approval. Nothing is built.**

- **Baseline:** `main` and `origin/main` at `47218576` (records only since A03's `b2f376a8`). Phase 0 rebuilds application `e73b7c0c…de06`, 17,553,370 bytes, byte for byte. Branch `claude/release-15a-a03`.
- **Test environment:** Playwright's bundled Chromium still hangs on `newPage()`. Run every probe with `NODE_OPTIONS=--require ".../QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"`, as the QA runners already do.

## Step 1 · reproduction (`qa/inventory.cjs`, output in `qa/reproduce/e73b7c0c/`)

Measured on the dense audit character plus the seven picker Advantages (Clan Crane), on a phone (390 × 844) and a desktop (1440 × 1000), in Play and Manage.

**Information treatments in the four areas (Skills, spells, Advantages, Disadvantages):**

| Treatment | Element and owner layer | Where |
|---|---|---|
| Eye 👁 in a 40 px gold ring, no accessible name | `button.sk-info-btn` (trunk Skills table; A03 places it on the phone card) | every Skill row |
| ⓘ glyph inside a gold ring | `button.sk-info-btn` (trunk) | Techniques: the Kiho note |
| Gold italic i, 18 px, **inside the "Choose…" button** | `button.adv-config-info` (Phase 4.54 (Part I)'s title= decorator, `209.9-feat-adv-config-ux.js`, `58-adv-config-ux.css`) | unconfigured Adv/Disadv rows in Manage (Wealthy, Kharmic Tie, Zakyo Toshi Citizen on this character) |
| Upright circled i, 28 px ink ring (the standard) | `.fb4521-info`, `.dp4523-info`, `.court4514-info`, `.p4518-info`, `.sa4519-info`, `.tr4524-info`, `.vv4520-info`, and others in A01–A16 | configured Advantage rows and the seven pickers |
| ? | `button.cast-why-btn` (Phase 8 (Part J)) | spell rows. Explains an error, so it stays distinct |

**Outside the four areas:**
- the Void Points eye (`#voidInfoBtn.void-eye-btn`, Rings & Traits);
- the Combat ⓘ (`.stance-info-btn`; `.combat-formula-info` inside the Armor & TN and Weapons `<summary>`);
- the Ancestor i (already the standard, via the Ancestor info fix).

Spells have no reference-information control: their text is drawn inline.

**Nested controls:**
- `adv-config-info` inside `button.adv-config-btn` ("Choose…"): six per mode per device on this character;
- the Combat formula ⓘ inside `<summary>` (not a configuration button, outside A04's areas).

**The seven pickers (A16):** A01, A03, A04, A09, A12, A13 and A14, as named by the 24 September device audit S1/S2 (`PART I — Phase 4.5 Remaining Configuration Audit/IPHONE-AUDIT-A01-A16-2026-09-24.md`).
- Each one appends its own i to the picker with a single line: `grid.appendChild(api.info(...))` (Darling of the Court: `editor.appendChild(api.darlingInfo())`).
- In all seven, every sentence of the bottom panel is also in the row's i or on the row after Confirm.
- In all seven, the picker's own note (`#advConfigNote`) already states the core rule.
- While choosing, the bottom i adds only detail, chiefly the price in A03, A09 and A12.

**The court row (A15):**
- the chips are `label.court4514-court` around a radio, 32 px tall on a phone;
- "Court in session" is a 13 px checkbox;
- Change is 76 × 20;
- Add court exists only inside the editor.

**The Skill information window:** Rank, Trait, roll, description and Emphases, then two "DEBUG — mastery data" buttons. It has no player-facing Mastery list.

## Step 2 · mockups (`qa/prototype.cjs`, `qa/board.cjs`; boards in `qa/mockup/`)

These are scratch prototypes injected into today's build. The boards are `G1-A04-one-information-pattern.png`, `G1-A04-desktop.png`, `G1-A15-court-chips.png`, `G1-A16-bottom-i.png`, `G1-A16-seven-today.png` and `G1-extra-skill-info.png`. Every proposed control measures a 44 × 44 px touch area on both devices.

**Questions put to the owner:**
1. A04 as shown?
2. A04's Hotei part (static text behind the i)?
3. Add the Void Points eye to A04?
4. A15 as shown?
5. A16: Option 1 (remove, as ruled; recommended) or Option 2 (move it beside the title)?
6. A fourth unit for the Mastery list in the Skill information?

## Owner's answers, 6 Nov (first round)

- **A04: approved as recommended**, including the Hotei part (static text behind the i) and **the Void Points eye** (now in A04).
- **A16: Option 1, remove the bottom i**, as ruled.
- **A15: revise.** No tick symbol and no black. Each court is a badge, a gold outline on the page colour. Tapping it fills it, and filled MEANS the court is in session; tapping it again empties it and removes the bonus. The radio dot and the "Court in session" tick box go.
- **Mastery list: added** as G1's fourth unit, A03.1 (Masteries in the Skill information), about 2–3 points. G1 is now about 13–14 points.

## Revision 2 (`qa/prototype-r2.cjs`; boards `G1-A15-court-chips.png`, `G1-extra-skill-info.png`)

**A15:**
- The badge is drawn from the same saved data as today: tap X sets `{selected: X, inSession: true}`; tap the filled badge sets `inSession: false`. Saved characters are unchanged.
- Only one court can be in session, because the sheet stores one, so tapping another badge moves the session.
- The legend reads "Courts: tap the one in session". The off readout reads "no court in session" instead of naming a court.
- Every badge and + Add court measures 44 px.
- **Fill, the owner's call:** deeper gold `--gold-dark` with paper text, 4.88 : 1 (recommended), or sheet gold `--gold`, 2.81 : 1, below 4.5 : 1. Measured from the computed colours.

**A03.1:**
- A Mastery Abilities list after the Emphases, built from `lib.m` (the same data as `renderSkillMasteryNote`).
- Reached Masteries are in the Clan colour, the rest in grey.
- A Skill without Masteries says so.
- The Debug buttons are unchanged.
- It is built by rebinding `showSkillInfoModal`, as the Skill-trait fix already does.
- In the picture, Defense was raised to Rank 5 in the scratch copy only, because the audit character reaches no Mastery.

## Owner's answers, 7 Nov (second round)

- **A03.1: approved as in revision 2.**
- **A15: the fill should follow the Clan colour** (Crane the blue used elsewhere, and so on).

## Revision 3 (`qa/prototype-r2.cjs … clans`; board `G1-A15-court-badges-clan.png`)

- **Fill:** `var(--shu-dark)` with paper text. This is the shade Phase 9 (Part H) recolours per Clan, and the sheet already uses it for section headings and reached Masteries.
- **Contrast against paper,** measured from the palette:

  | Clan | Contrast |
  |---|---|
  | Crane | 6.41 |
  | Crab | 5.82 |
  | Dragon | 5.72 |
  | Lion | 6.08 |
  | Phoenix | 7.15 |
  | Scorpion | 9.44 |
  | Unicorn | 9.11 |
  | No Great Clan (sheet red) | 7.91 |

  All are above 4.5 : 1. The computed colours in the page matched the palette for all eight.
- **Not a dependency:** it reads the trunk token, not Phase 9's code. Remove Phase 9 and the fill is the sheet red. This will be stated in A15's ROLLBACK as a comment-level note.

## Usage (Claude, account-wide)

| When (UTC) | Five-hour | Weekly | Note |
|---|---|---|---|
| 6 Nov 17:37 | 32% | 62% | G1 start |
| 6 Nov 17:56 | 44% | 64% | after reproduction and mockups |
| 6 Nov 23:52 | 7% (new window) | 65% | after revision 2 |
| 7 Nov 01:24 | 59% | 72% | four units built and light-checked, before the review |
