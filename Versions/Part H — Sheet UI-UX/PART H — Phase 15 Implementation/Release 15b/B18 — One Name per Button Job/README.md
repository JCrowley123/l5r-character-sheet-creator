# Release 15b · B18 — One Name per Button Job

One word for each job a button does, and a spoken name that says what it acts on. This README is the build of the names (unit B18). The round-2 looks are units of their own: [B18.1 — One Size for Reset](<../B18.1 — One Size for Reset/README.md>) and [B18.2 — The i at the End of Its Row](<../B18.2 — The i at the End of Its Row/README.md>).

- **Where it came from:** the owner's note of 20 November 2026 (Phase 15 is a consistency pass; "Reset" in one place and "Reset session" in another). The inventory is [INVENTORY.md](INVENTORY.md), re-checked in [RECHECK.md](RECHECK.md).
- **Approved:** the rulings of 24 November 2026; the mock-up board, round 1, 25 November 2026 (19 cards approved, Touch of the Void kept as "Keep control (TN 30)", Reset approved as a word, "Next, before group 3"). The owner's answers, verbatim: [MOCKUP.md](MOCKUP.md). Board: https://claude.ai/artifact/CEVcuCGBbiamEg8spLQ3o2.
- **Built:** 26 November 2026 (Claude), on branch `claude/release-15b-b18`, from `main` as live (`450362b9`, application `1f002be9…5819`) with this folder brought across from `claude/release-15b-b18-mockups` (`ef937717`).
- **Not live.** Nothing is on `main`; the owner's device checks come next.

## What changes

| Card | Group | The change |
|---|---|---|
| `reset` | G01 | "Reset session" reads **Reset** on seven cards (Kharmic Tie, Luck, Dark Paragon, Great Destiny, Haunted, Unlucky, the Ancestor card), heard "Reset {name} for a new session" (the Ancestor card: "Reset Kuni’s gift for a new session"). The round counter's Reset is heard "Reset the round counter". The three lines that name the button say "Reset": Great Destiny's "… is already used this session. Reset to use it again.", the Ancestor gift's roll-preview note "… ready again after Reset on the Ancestor card …", and Kharmic Tie's i window "Reset gives back all 3 …". |
| `use` | G06 | An Ancestor's "Use it now" reads **Use**, heard "Use Seppun’s free Void Point" (or Iongi's); its question's button reads "Use" too. Great Destiny's (and Dark Fate's) Use is heard "Use Great Destiny: a killing blow leaves you 1 Wound from death instead". |
| `gotit` | G05 | "Got it" reads **OK** in the five messages. |
| `yesno` | G05 | The bonus spell slot question's "Yes" and "No" read **Confirm** and **Cancel**. |
| `reroll` | G08 | "Re-roll 1s" and "Re-roll selected" read **Reroll 1s** and **Reroll selected**; Kakita's "Re-roll with Kakita (…)" reads "Reroll with Kakita (…)". |
| `luck` | G08 | "Spend Luck (n/m)" reads **Reroll with Luck (n/m)**, heard "Reroll with Luck: roll the whole roll again and keep the higher result, n of m left"; Toku's "Spend Toku’s Luck (n/1)" reads "Reroll with Toku’s Luck (n/1)". "GM invokes Unlucky" and "Add Sun Tao’s die" stay. |
| `emph` | G10 | "+ Emph" reads **+ Add Emphasis**, heard "Add Emphasis to {Skill}". |
| `book` | G10 | The Library's "+Book" reads **+ Add Book**, heard "Add Book". |
| `court` | G10 | Darling of the Court's window: "Add court" reads **+ Add court**. |
| `spendvoid` | G07 | Hida Atarasi's question: "Spend a Void Point" reads **Spend Void**. |
| `combati` | G12 | The Combat tab's ⓘ (Armor & TN, Weapons, each stance) and 👁 (each weapon) are drawn as the sheet's ring i, heard "TN & Initiative information", "Attack & Damage information", "{weapon} information", "{stance} stance information". |
| `pdf` | G16 | A saved character's ⋯ menu: "Export to PDF" reads **Export PDF**. |
| `chooseagain` | G02 | The creation wizard's "Choose again" (two places) reads **Change**. |
| `rowx` | G03 | A row's ✕ is heard "Remove {row}": Skills, Advantages, Disadvantages, Techniques, items and weapons ("Remove Calligraphy", "Remove Robes"); an Emphasis's ✕ "Remove Emphasis". Written Remove and Delete stay. |
| `cornerx` | G04 | A window's corner ✕ is heard "Close {window}" when it only shows something ("Close Calligraphy information"), "Cancel {window}" when it holds a choice not kept yet ("Cancel Before you roll"); the shared window "Close notice" or "Cancel question". |
| `changechoose` | G02 | Change and Choose… are heard with the card's name ("Change Luck", "Choose Wealthy"). Kharmic Tie's "Change Kharmic Tie: person or Rank" is kept. |
| `info` | G12 | Every i is heard "{thing} information": "Explain: {entry}" (each Advantage card and the configuration window's options), "About Ancestors", "Armor TN: how it is worked out", "Wound penalty: how it is worked out". |
| `steppers` | G14 | Every − and + is heard "Decrease {thing}" and "Increase {thing}": Honour, Glory, Status and Taint ("Increase Honour points"), the Void Ring ("Decrease Void Ring"), the Arrows window ("Increase Willow Leaf"), the Rank settings ("Increase Honour Rank", "Decrease Honour points by one"). Unlucky's pair and the Wounds pair stay. |
| `clear` | G09 | The dice tray's Clear buttons are heard "Clear the dice" and "Clear the other dice"; the word stays Clear. |
| `touch` | G11 | **Kept:** Touch of the Void stays "Keep control (TN 30)". |

**Unchanged:** what every button does, its class, its title, the rolls, the save file, print.

**Looks:** words only, except the Combat tab's i's (the ring i, as the board showed: on a phone the Armor & TN, Weapons and Stance cards grow, the stance tiles most) and the widths that follow from the words (shorter Resets and Use; "+ Add Emphasis" puts a Skill's Emphasis count on its own line on a phone when it has none yet).

## How it is built

`src/sheet/209.99999999999999999992-feat-button-names.js` holds `BN15` and the switch `ONE_NAME_PER_JOB_ENABLED`. Each change is made only where today's exact words are found, as the control is drawn, never by watching the page:

- **Each Advantage and Disadvantage row**, after every earlier layer has drawn it (a wrapper of `refreshAdvConfigControl`, installed last): Reset, Change and Choose…, Great Destiny's Use, the i's, the row's ✕.
- **Phase 4.5.4's i's** wherever they are drawn (a wrapper of `R454.decorate`, after Release 15a A04's): the rows and the configuration window's options.
- **After every recalculation** (a wrapper of `recalcAll`): the Skills, Weapons and Equipment rows, every list's entries, the steppers, the Ancestor card's i, Quick Access's i's. Names also follow a row's name as it is typed (input and change on each list).
- **The question and message window** as each is asked for (wrappers of `appConfirm`, `appConfirm3Way`, `appAlert`): the button words, the ✕'s name, Great Destiny's used message.
- **A roll's result** as it is shown (`showRollResult`), and the Emphasis reroll's bar each time it is drawn again (`attachEmphasisReroll`, then its own buttons' and the dice's click, which run after the bar's own handlers).
- **The stances, the Arrows window, the Ancestor card's line, the wizard's steps, the School choices window, the Library's shelf, the court window, the Characters menu and Kharmic Tie's i window**, each as it is built (wrappers of `renderStanceTiles`, `renderArrowsPicker`, `ANC48.sessionLine`, `CW112.render`, `SC8.render`, `LIBPAGE13.mount`, `CS4514.open`, `PDF111.decorate`, `KT15.show`).
- **Values read when drawing**, changed once when the unit installs: `AG7.USED_NOTE`, `WP15.LABEL`, `AT15.LABEL`, two gift notes in `ANC48.LIBRARY`.
- **The corner ✕'s** are named with `aria-labelledby`: the verb (a hidden word) and the window's own heading, so the name is always the heading as it reads when heard (Phase 4.5's window, the Skill and stance windows and the affinity picker rewrite theirs as they open).
- **The Honour, Glory, Status and Taint cards' − and +** are also named with `aria-labelledby`, keeping their `aria-label`: Release 15a A08 tells those eight from every other control by it, to keep a burst of quick taps as one Undo.
- `src/css/1155-button-names.css` draws the Combat tab's i's as the ring i (the board's drawing rule, without `!important`).

Tier: like group 2's B01 and B09, the screen-only tier. Every change is set synchronously as a control is drawn, or in the same event's handlers; nothing waits on a timer, an animation frame or the network, so a slower phone cannot reorder it.

### Found while building

- **Release 15a A08 (quick-tap Undo).** The discovery run found that renaming the cards' − and + with `aria-label` stopped A08 grouping quick taps (A08's harness 10/21). Hence `aria-labelledby` for those eight; A08's harness 21/21 and B18's own check pass.
- **The creation wizard's − and +** ("Raise Agility", "Lower Agility") are not renamed: they were not on the approved list, and the Creation Cap fix finds the wizard's + by its `aria-label`. A question for the owner if they should follow.
- **Two Ancestor gift notes** (Seppun's and Iongi's) told the player to press “Use it now” on the card; they now say press “Use”. The kickoff listed only the three Reset lines; these two name the same button.
- **The Ancestor's question** ("… use this session’s free Void Point now …?") had its own "Use it now" button; it reads "Use", heard as the card's.
- **An Emphasis's ✕** is heard "Remove Emphasis", as the board pictured it (without the Emphasis's name).

## Light checks (26 November 2026)

- **Own harness** `qa/button-names-harness.js`: **34/34** (`qa/run-2.log`), with the suite's two preloads, on a phone (390 × 844, touch) and a laptop (1440 × 1000). Ids pinned before the first run; one check (`BN-QUICK-TAPS-ONE-UNDO-PHONE`) added and pinned after the discovery run, before its first run. Run 1 (`qa/run-1.log`): 28/33, five harness recipe errors, no unit fault.
- **The board itself:** every one of round 1's 41 pictured places opened on the build and read for its words and spoken name: **41/41 match the approved "after"** (and Touch of the Void its kept "now"). `qa/build/probe-built.cjs`, results `qa/build/probe-b18/probe.json`.
- **Removal:** `qa/test-removal.py` **10/10** (`qa/removal.log`). Removing B18 rebuilds group 2 as live exactly (`1f002be9…5819`, 17,773,727 bytes); B09 removed next gives B05 (`029595b6…8983`); B09 removed with B18 kept verifies (`00f22949…e3dd`, 17,801,799 bytes).
- **Dependencies:** `qa/feature-dependencies.py` exit 0 (`qa/dependencies.log`); older removers that name B18's files: `qa/build/surface-hits.log`.
- **Older harnesses that pin the old words:** 14, made to follow B18 (see ROLLBACK). On B18's build and on live main's build: **15/15 harnesses, 781/781 checks** each (`qa/light/`).
- **The live suite on B18's build:** all 213 harnesses pass. Run five at a time: 7,561/7,562; the one miss, the splash's "fades after ready and 5 s" timing in the live-site leaf, passes when run alone (61/61). `qa/light/full-b18/`, and `qa/light/README.md` for every run.

Build: application `2be73c43bd748bc7135f1a2d24c9b4cb17ad43dab760c3310d7fbb2f90d7faea`.
