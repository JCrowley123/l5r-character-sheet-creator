# A03 comparison: A02 as live (predecessor) and A03 (candidate)

Measured on 6 November 2026 with `qa/reproduce.cjs`:
- **Builds:**
  - A02 as live (`91d45109…6dc0`);
  - the frozen revision 2 candidate (`e73b7c0c…de06`);
  - for reference, revision 1 (`eb1c29f7…8d18`).
- **Characters** (`qa/a03-fixtures.json`):
  - the Phase 15 audit's dense test character, with 6 Advantages and 11 Disadvantages;
  - the same with either list emptied;
  - a long-Skills version with 18 Skills, Ranks up to 7, Masteries, up to 3 Emphases and School ticks.
- **Screens:** a phone (390 × 844), a small phone (375 × 667) and a desktop (1440 × 1000), in Play and in Manage.

Results are in `qa/reproduce/predecessor-a02/`, `qa/reproduce/candidate-r2/` and (revision 1) `qa/reproduce/candidate/`: `a03-states.json` and screenshots. The revision 2 table is `qa/reproduce/compare-r2.md` (`qa/compare.cjs`).

## Desktop: the two columns (the same in both revisions)

| Character | Mode | Distance between the two column headings, A02 → A03 |
|---|---|---:|
| Both lists filled | Play / Manage | 1,113 / 1,092 → **0 / 0 px** |
| No Advantages | Play / Manage | 2,247 / 2,249 → **0 / 0 px** |
| No Disadvantages | Play / Manage | 1,134 / 1,157 → **0 / 0 px** |

- Only this grid changes. A03's harness checks that every other grid on every page keeps the carousel's alignment (`OTHER-GRIDS-UNCHANGED`).
- The desktop Skills table is unchanged: the same row heights, and a page length of 1,808 px in Play and 2,096 px in Manage, before and after.
- **Declined on the owner's decision:** a laptop grid that lined each Advantage up with the Disadvantage beside it. On the revision 1 build it padded the shorter card in every pair with 17–88 px and made the page about 100 px longer.

## Phone: the Skill cards, revision 2 (nothing behind a control)

| Screen | Character | Mode | Card height, A02 → revision 2 | Skills page length | Cards per screen | Revision 1 (Details closed) |
|---|---|---|---|---|---|---|
| Phone 390 × 844 | dense (6 Skills) | Play | 324–382 → **114 px** | 2,601 → 1,185 px | 1.8 → 5.6 | 116 px, 5.5 |
| | | Manage | 372–440 → **241–309 px** | 3,022 → 2,236 px | 1.6 → 2.4 | 116 px, 5.5 |
| | long (18 Skills) | Play | 324–490 → **114–158 px** | 7,581 → 2,908 px | 1.7 → 5.0 | 116 px, 5.5 |
| | | Manage | 372–601 → **241–470 px** | 8,894 → 6,537 px | 1.4 → 2.0 | 116 px, 5.5 |
| Small phone 375 × 667 | dense | Play | 324–382 → **114 px** | 2,600 → 1,184 px | 1.3 → 4.1 | 116 px, 4.0 |
| | | Manage | 372–440 → **241–309 px** | 3,021 → 2,235 px | 1.1 → 1.7 | 116 px, 4.0 |
| | long | Play | 324–519 → **114–158 px** | 7,649 → 2,936 px | 1.2 → 3.6 | 116 px, 4.0 |
| | | Manage | 372–630 → **241–499 px** | 9,028 → 6,670 px | 1.0 → 1.4 | 116 px, 4.0 |

"Cards per screen" is the page's visible height divided by the average card.

**In Play** a card is 114 px with no Mastery reached, plus about 15 px for each reached Mastery line. Kenjutsu at Rank 7, with three reached, is 158 px. The dense character's Skills are all below Rank 3, so none show a Mastery.

**In Manage** every field is drawn, so cards are about two-thirds of their height on A02 (the harness requires at most 85%, `MANAGE-SHORTER`). The first row stays where it is when switching modes (`FIRST-ROW-STEADY`). Script errors: 0 on all builds.

## What the screenshots show (revision 2)

The same file names are used in each folder.
- **`phone-play-longSkills-skills.png`:**
  - **before:** the first card fills most of the screen;
  - **after:** about five cards fit, each with its name, Rank and d10, then its summary line beside the eye, and its reached Masteries.
- **`phone-management-longSkills-skills.png`:**
  - **before:** every field on its own labelled line;
  - **after:** the same fields, with the Trait and School beside the eye, then the Emphases, XP, every Mastery and Remove.
- **`desktop-management-noAdv-adv.png`:**
  - **before:** the Advantages column is pushed far down the page;
  - **after:** it starts level with Disadvantages.

**Not changed by A03.** Browser print still aligns the two columns to the bottom of the grid. Measured on the dense character, Advantages start 836 px lower on paper. Print belongs to Release 15b's B12 and is recorded there as a follow-up.

## Revision 1, as recorded

### Revision 1: the Skill cards (Details control, closed)

| Screen | Character | Mode | Card height | Skills page length | Cards per screen |
|---|---|---|---|---|---|
| Phone 390 × 844 | dense (6 Skills) | Play | 324–382 → **116 px** | 2,601 → 1,197 px | 1.8 → 5.5 |
| | | Manage | 372–440 → **116 px** | 3,022 → 1,296 px | 1.6 → 5.5 |
| | long (18 Skills) | Play | 324–490 → **116 px** | 7,581 → 2,709 px | 1.7 → 5.5 |
| | | Manage | 372–601 → **116 px** | 8,894 → 2,808 px | 1.4 → 5.5 |
| Small phone 375 × 667 | dense | Play | 324–382 → **116 px** | 2,600 → 1,196 px | 1.3 → 4.0 |
| | | Manage | 372–440 → **116 px** | 3,021 → 1,295 px | 1.1 → 4.0 |
| | long | Play | 324–519 → **116 px** | 7,649 → 2,708 px | 1.2 → 4.0 |
| | | Manage | 372–630 → **116 px** | 9,028 → 2,807 px | 1.0 → 4.0 |

"Cards per screen" is the page's visible height divided by the average card.

Every card is now the same height, closed, whatever its Masteries or Emphases. Opening one card's Details brings back that card's full contents in place. At 320 × 568, the narrowest phone tested, cards stay at most 180 px (`NARROW-PHONE-FIT`). Script errors: 0 on both builds.

### Revision 1: what the screenshots show

The same file names are used in both folders.
- `phone-play-longSkills-skills.png` and `phone-management-longSkills-skills.png`:
  - **before:** the first card fills most of the screen;
  - **after:** about five cards fit, each with its name, Rank and d10, then *Details* with its summary and the eye.
- `cards/management-Kenjutsu.png` and `cards/management-Kenjutsu-open.png`: Kenjutsu, Rank 7, two Emphases and three Masteries.
  - **before:** about 490 px in Manage;
  - **after:** closed, 116 px; open, every field, the Mastery notes and Remove.
- `desktop-management-noAdv-adv.png`:
  - **before:** the Advantages column is pushed far down the page;
  - **after:** it starts level with Disadvantages.

**Not changed by A03.** Browser print still aligns the two columns to the bottom of the grid: measured on the dense character, Advantages start 836 px lower on paper. Print belongs to Release 15b's B12 and is recorded there as a follow-up.
