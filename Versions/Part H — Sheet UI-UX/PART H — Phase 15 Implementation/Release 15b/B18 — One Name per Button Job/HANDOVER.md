# Release 15b · B18 group (B18, B18.1, B18.2) — handover (draft)

26 November 2026 (Claude); device round recorded 27 November. **Built and previewed; the owner's device checks all passed and all three units are accepted (27 November); two notes are on a round-3 mock-up board, not answered yet.** Nothing is on `main`; the qualification chain has not been run.

**What the group is:** B18, one name per button job, as the owner approved it on the mock-up board (https://claude.ai/artifact/CEVcuCGBbiamEg8spLQ3o2), in three units on stacked branches on top of group 2 as live (`450362b9`, application `1f002be9…5819`):

- **B18:** the words and spoken names (round 1: 19 cards approved; Touch of the Void kept as "Keep control (TN 30)"; Reset approved as a word).
- **B18.1:** every Reset one size, 28 px in capitals, with the buttons on its row (round 2, card `size`).
- **B18.2:** the i at the right end of its row (round 2, card `iright`).

**Branches and build:** the group tip is `claude/release-15b-b18-2`. It carries B18's revision of 26 November (a word change keeps what is inside the button; see "Found while building"); the lower branches (`-b18`, `-b18-1`) keep the version before it, as group 2's lower branches kept its round 1. Tip application `56b280e2c99ef956195b30b6da259bdb415cf17e08b92e2ca960ef8f6b44aab1`, 17,813,266 bytes.

## Approvals

- **Rulings** (24 November 2026) and **round 1** (25 November, 19:26–19:32 UTC): 19 approved, `touch` kept, `order` "Next, before group 3", `reset` "Change it" (the word approved; a size and i pass asked for). **Round 2** (25 November, 20:25–20:26 UTC): `size` and `iright` approved as shown, no notes. The owner's words, verbatim: [MOCKUP.md](MOCKUP.md).
- **Device round:** the checklist is a private artifact, [B18 Device Checks](https://claude.ai/artifact/PaVBJfu4N4j5KKKEMkgdfJ): 24 cards, one change per card, Pass / Fail / Not run on the iPhone and on the laptop, a note; Accept / Revise / Remove for each unit. Answers save on the page (collection `answers`). Mirrored in [DEVICE-CHECKS.md](DEVICE-CHECKS.md), with the owner's results verbatim.
- **Device round answered (27 November 2026, 20:36–20:58 UTC):** all 24 cards Pass on the iPhone and on the laptop; B18, B18.1 and B18.2 **Accept**. Two notes, verbatim: “I have noticed when picking unlucky the rank is not the same picker as any other rank picker” and “I think we can remove the "i" tool tip from lucky as I don't think there is any extra information that it provides”. The answers as saved: `qa/answers-device/answers/`.
- **Round 3 mock-ups (27 November):** https://claude.ai/artifact/33HybUMniMLz5BZDX6Cyf6, four cards: Luck’s i goes; Unlucky’s rank window looks like the other rank windows (Wealthy’s and Perceived Honor’s number box, since Unlucky has no top Rank); Elemental Imbalance’s Rank step the same; the empty bar goes from the other Disadvantage windows. See [MOCKUP.md](MOCKUP.md#round-3-the-device-round-notes-27-november-2026). Not answered; nothing built.

| Site | What it has |
|---|---|
| https://claude-release-15b-b18-2.l5r-character-sheet-creator.pages.dev/ | Group 2 as live, plus B18, B18.1 and B18.2 (the tip) |
| https://l5r-character-sheet-creator.pages.dev/ | Live, to compare with |

## Units

| Unit | Marker | Tag / switch | Own checks | Branch |
|---|---|---|---:|---|
| B18 One Name per Button Job | `PART H PHASE 15.2.10` | `BN15` / `ONE_NAME_PER_JOB_ENABLED` | 35 | `claude/release-15b-b18`; its revision on the tip |
| B18.1 One Size for Reset | `PART H PHASE 15.2.10.1` | `RS15` / `RESET_ONE_SIZE_ENABLED` | 11 | `claude/release-15b-b18-1` |
| B18.2 The i at the End of Its Row | `PART H PHASE 15.2.10.2` | `IE15` / `INFO_AT_ROW_END_ENABLED` | 11 | `claude/release-15b-b18-2` (the tip) |

Each unit's folder has its README, ROLLBACK, harness with pinned ids, remover and removal proof; all three are registered in the removal chain after B09. B18's records (inventory, mock-ups, this handover) share its folder.

**How it is built.** B18 changes each word only where today's exact words are found, as the control is drawn: wrappers of the functions that draw each row, window, roll result, menu and wizard step, installed last so they run after every earlier layer; no page-wide observer and no `!important`. The corner ✕'s and the four Honour/Glory/Status/Taint cards' − and + are named through `aria-labelledby`. B18.1 and B18.2 are a switch that marks the page and one stylesheet each, outranking each row's own rule by specificity.

**The tier question.** The screen-only tier, as group 2's: every change is set synchronously as a control is drawn or in the same event's handlers (the Emphasis bar's are capture or bubble listeners that run after the bar's own handlers in the same event). Nothing waits on a timer, an animation frame, the network or a chain of awaits, and B18 has no observer of its own (Phase 4.54's existing observer calls the `R454.decorate` it wraps, which is that phase's microtask). So the 4× CPU screen does not apply.

## Found while building

- **Fourteen older harnesses pin B18's old words** (found by a discovery run of all 213 live harnesses): each now follows `BN15` with the same ids and counts, declared in both ROLLBACKs. **One more pins B18.1's size**: Dark Paragon's `DP-GEOMETRY-*` (32 px), now following `RS15`.
- **Release 15a A08's quick-tap Undo** tells the Honour cards' − and + by their `aria-label`; renaming them stopped it grouping taps. B18 names those eight through `aria-labelledby` instead; taps still make one Undo.
- **Luck's i window was headed "Reset session"** (Phase 4.54 heads it with the button's words): B18 shows "Reset".
- **Without Release 15a A04** (the "15a removed, group kept" check), Phase 4.54 puts Luck's i inside its Reset; B18's word change removed it. Revised on the tip: a word change keeps what is inside the button, and that i is heard "Reset information".
- **Two Ancestor gift notes** said press “Use it now” on the card; they say press “Use”. The Ancestor's own question's "Use it now" reads "Use".
- **Left for the owner:** the creation wizard's − and + ("Raise Agility") were not on the approved list and are not renamed (the Creation Cap fix finds them by their `aria-label`). An Emphasis's ✕ is heard "Remove Emphasis", as the board pictured it, without the Emphasis's name.

## Light checks (26 November 2026)

- **Own harnesses on the tip:** B18 35/35, B18.1 11/11, B18.2 11/11; the same with all 26 Release 15a units removed (`qa/light/tip-own/`, `qa/light/tip-15a-removed/`; the 15a removal itself: `qa/build/remove-15a-keep-group.log`, all 26 removed, rebuild verifies, the group kept).
- **The board's 41 places** read on the tip: 41/41 as approved (`qa/build/probe-tip/probe.json`).
- **Removal proofs on the tip:** 10/10 for each unit. Removing B18.2 gives B18 + B18.1 (`a85cb648…c429`); B18.1 then gives B18 (`0a55634f…754a`); B18 then gives group 2 as live exactly (`1f002be9…5819`).
- **Dependencies:** each unit's checker exit 0. Older removers that now refuse while a unit is present (remove the unit first; reciprocal notes in each ROLLBACK): for B18, Release 15b A14, B04, B17, the Ancestor Gifts fix, Phase 4.5.14, 4.5.32, 4.8, 11.1, 11.2, 11.2.1, 11.2.5 and 13; for B18.1, Phase 4.5.23, 4.5.32 and 4.8; for B18.2, Phase 4.5.23. No Release 15a remover names the group, so the "15a removed, group kept" stage can run.
- **The live suite on the tip** (application `56b280e2…aab1`, after B18's revision): **213/213 harnesses, 7,562/7,562 checks**, five at a time with the suite's preloads, the live-site leaves included (`qa/light/full-tip-revised/`). Before the revision, on `c7d7f0a3…1b19`: the same (`../B18.2 …/qa/light/full-tip/`). Every older harness keeps its count.
- **The preview** on its deployed files (`qa/verify-preview.py`, 27 November): the page, service worker, manifest and icons match the tip's build byte for byte (deployed page `fa0713a3…`, 17,820,043 bytes; application `56b280e2…aab1`), and the three units' harnesses and the 15 older harnesses they touch pass on the downloaded page: **883/883** (`qa/hosted-preview/claude-release-15b-b18-2/`, `qa/preview-tip.log`).

## Next

1. **The owner's answers on the round-3 board**; then build what is approved on the tip (with its harness changes: B18's Luck i window checks and B18.2's Luck place depend on Luck's i), a light pass and a device check of those cards.
2. Then, on the owner's word: the qualification chain (group removal, the units each removed alone, the owner's decision 3, dependencies) and one full pass, with the candidate and retained counts pinned beforehand. Candidate = group 2's qualified 7,562 + B18's 35 + B18.1's 11 + B18.2's 11 = **7,619** (213 + 3 = 216 leaves), with the 15 older harnesses keeping their counts.
3. Records (ledger, roadmap, CLAUDE.md), and the owner's word to go live.

Then Release 15b group 3 (B06, B10, B11, B16), mock-ups first.
