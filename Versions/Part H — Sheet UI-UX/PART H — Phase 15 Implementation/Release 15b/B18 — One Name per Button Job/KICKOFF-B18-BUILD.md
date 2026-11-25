# B18 · One Name per Button Job — build kickoff

Written by Claude on **25 November 2026**, after the owner answered both mock-up rounds. **Nothing is built yet.** The owner approved every card and set the order: **build B18 next, before 15b group 3** (answer `order`, "Next, before group 3").

- **Records so far:** [MOCKUP.md](MOCKUP.md) (both rounds, the owner's answers verbatim), [RECHECK.md](RECHECK.md) (the 409 controls on live `450362b9`), [INVENTORY.md](INVENTORY.md) and `inventory.json` (every control by job group), [REPRODUCTION.md](REPRODUCTION.md).
- **Branch with the records:** `claude/release-15b-b18-mockups` (not on main). Build from `origin/main` as live (`450362b9`, application `1f002be9…5819`), bringing this folder across.
- **The specification:** the mock-up's drawing rules are the exact words and spoken names: `qa/mockup/proposals.cjs` for round 1 (one rule per group) and `qa/mockup/proposals-r2.cjs` for round 2's two looks. The build writes them into the sheet's own source; the mock-up's `MutationObserver`, the `!important` and the test-browser style sheet are not the build.

## What was approved

### Round 1: names (19 cards approved, 1 kept, Reset approved as a word)

| Card | Group | The change |
|---|---|---|
| `reset` | G01 | "Reset session" → **Reset** on 7 cards (Kharmic Tie, Luck, Dark Paragon, Great Destiny, Haunted, Unlucky, the Ancestor card); heard "Reset {name} for a new session". The three lines of text that name the button change with it (Great Destiny's used message, the Ancestor gift's roll-preview note, Kharmic Tie's i window). |
| `use` | G06 | "Use it now" → **Use** (the Ancestor card's gift); heard "Use {gift}". |
| `gotit` | G05 | "Got it" → **OK** in the 5 messages. |
| `yesno` | G05 | "Yes" / "No" → **Confirm** / **Cancel** (casting with no slot of that Element left). |
| `reroll` | G08 | "Re-roll" → **Reroll** (the Emphasis reroll's two buttons; Kakita's gift). |
| `luck` | G08 | "Spend Luck" → **Reroll with Luck**; Toku's gift "Reroll with Toku's Luck". "GM invokes Unlucky" and "Add Sun Tao's die" stay. |
| `emph` | G10 | "+ Emph" → **+ Add Emphasis** (Skill cards, Manage). On a phone a Skill with no Emphasis yet gets one line taller. |
| `book` | G10 | "+Book" → **+ Add Book** (Library). |
| `court` | G10 | "Add court" → **+ Add court** (Darling of the Court's window). |
| `spendvoid` | G07 | "Spend a Void Point" → **Spend Void** (Hida Atarasi's question). |
| `combati` | G12 | The Combat tab's ⓘ and 👁 → the sheet's ring i (Armor & TN, Weapons, each weapon, each stance); heard "… information". Combat cards get 120 px taller on a phone, 40 px on a laptop. |
| `pdf` | G16 | "Export to PDF" → **Export PDF** (a saved character's ⋯ menu). |
| `chooseagain` | G02 | "Choose again" → **Change** (two places in the creation wizard). Not pictured on the board. |
| `rowx` | G03 | A row's ✕ is heard "**Remove** {row}" (Skills, Emphases, Advantages and Disadvantages, items, weapons). **Delete** stays for a saved character and a Library book. |
| `cornerx` | G04 | A window's corner ✕ is heard "**Close** {window}" when the window only shows something, "**Cancel** {window}" when it holds a choice not kept yet (31 windows; the shared question window: "Close notice" or "Cancel question"). |
| `changechoose` | G02 | Change and Choose… heard with the card's name ("Change {card}", "Choose {card}"). |
| `info` | G12 | Every i heard "{thing} information" (the Ancestor section, "Explain: …" on Advantage cards, Armor TN, the wound penalty). |
| `steppers` | G14 | Every − and + heard "Decrease {thing}" / "Increase {thing}" (Honour, Glory, Status, Taint, the Void Ring, Add Arrows, Rank settings). Unlucky's − and + stay. |
| `clear` | G09 | The dice tray's Clear buttons heard "Clear the dice" and "Clear the other dice"; the word stays Clear. |
| `touch` | G11 | **Kept:** Touch of the Void stays "Keep control (TN 30)" (B01 round 2). The 24 November "Check (TN 30)" ruling is superseded. |

### Round 2: two looks (both approved as shown)

| Card | The change |
|---|---|
| `size` | **Every Reset is one size:** 28 px tall, in the letters of Change and Choose… on the same cards (capitals, .78rem, letter spacing .06em, padding 2px 10px). Approved with the capitals. The buttons on the same row take the same look: Great Destiny's Use, Unlucky's − and +, and the Combat round counter's Next round. Today's own rules to replace: `.adv-config-reset-session` (base CSS), `.dp4523-session .dp4523-reset` / `.dp4523-use`, `.dsx4532-btn`, `.unlucky-btn`, `.anc48-session .anc48-session-reset` / `-use`, `.combat-round-box button`. |
| `iright` | **The i at the right end of its row,** where Kharmic Tie's already is (13 px from the card's edge): Luck (its i sits inside `.adv-config-luck-controls`), Dark Paragon (`.dp4523-info`), Seven Fortunes' Curse (`.ip15-hotei-info`), and the "Needs a choice" cards (`.adv-config-info`). The left margin to replace is set by Release 15a's one-info-pattern rule (`1130-one-info-pattern.css`), which outranks a plain rule. Left as they are: the Skills list's i's, the i's beside a heading, and where Change sits in Manage (A04.2). |

## Things the build must handle

- **Old words pinned by older harnesses.** A quick search finds the old words in many files under `Versions/`, counting application source, harnesses and older phase copies. For example, "Reset session" is in 19 files, "Re-roll" in 19, "Spend a Void Point" in 20 and "Export to PDF" in 47. Start by listing which live harnesses pin them, and pin each change in the runners' `changedHarnesses`, as group 2 did for B01.
- **B17** (Kharmic Tie) is live with "Reset session" and the spoken "Reset session: all 3 Kharmic Tie uses back". B18 changes both.
- **A04.2 stays parked** until the rules read: badges, summaries, where Change sits. Round 2's i rule is the A04.2 layout's right-hand i and does not need A04.2.
- **Units (a suggestion):** B18 for the names and spoken names, B18.1 for one Reset size, and B18.2 for the i at the right end. Each can then be removed alone, as A04.1 and A19.1 were.
- **Tier question:** names set as a control is drawn are screen-only and synchronous, like group 2's B01. A relabel done in a `MutationObserver` is a microtask, like B09. Decide the tier as group 2's handover does.
- **Process:** as the earlier 15b groups did it (see `G2 — Action Labels and Wording/HANDOVER.md`):
  - build and preview;
  - the owner's device checks;
  - the qualification chain and one full pass;
  - records;
  - the owner's word to go live.

  Nothing goes to main without the owner's word.
