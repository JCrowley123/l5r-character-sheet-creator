# G5 · Undo and the roll preview: mock-ups and the owner's approval

14 November 2026 (Claude). The board, [mockups/G5-MOCKUPS.html](mockups/G5-MOCKUPS.html), was published to the owner as a private artifact (https://claude.ai/artifact/AmDpMba4h7asooEyGyqncd). It shows today beside the proposal for each unit, at phone and laptop size, with a recommendation. Every picture is the live build (`99b76d62…15b8`, `main` at `c5dd578b`, the automatic-entries group live) in a test browser, with the proposal applied only in that browser. How the pictures were made: [REPRODUCTION.md](REPRODUCTION.md).

## The grouping

The four 15a findings not yet built were A08, A12, A19 and A20. Asked once how to group them (weekly usage 64%, reset 18 November 01:00 UTC; all four were unlikely to finish with qualification before the reset), the owner chose the recommended option, the plan in the design rules' 6 November amendment:

> "A08 + A12 now (Recommended)"

G5 = A08 + A12, now. G6 = A19 + A20, the two large new functions, after the 18 November reset. Not in scope: A13 (declined at Q5), A14 (Release 15b), A18 (closed in G4), and the parked A04.2, FT-59 and the roll-odds idea.

## The units as approved

| Unit | Approved scope | Tier |
|---|---|---|
| **A08** One Undo for quick taps (FT-47, Q4) | Consecutive − / + taps on the same Honour, Glory, Status or Taint card, each within 5 seconds of the previous one, are one change. − and + both count, whatever amount is in the box. The group ends after 5 seconds without a tap, or on a tap on another card, a typed Rank or Points value, Set Rank, Recognition by your lord, Undo, opening, loading, saving or resetting the character, or any other change to the character (a roll, a Void Point, an edit elsewhere); moving between pages or scrolling does not end it. Undo goes back to the value before the group's first tap, in one step, and stays on screen as long as today (20 seconds after the last tap, or until a save); one Undo at a time, as today. History (the audit log) has one entry for the group, written when the group ends; a group undone before it ends leaves no entry. One tap: the message word for word as today; two or more: "Honour: Rank 5, Points 0. Undo takes back all 3 taps."; after Undo: "Undone. Honour: Rank 4, Points 7." Values, limits, Rank changes, the save format and autosave unchanged; nothing new saved. | Behaviour |
| **A12** One Resisting? line (R6, ruled 7 October) | In the roll preview's "Declare for this roll", every resistance choice moves into one closed "Resisting?" line at the top of the section: Honour's (Core p.91); Balance, Clear Thinker, Heartless, Irreproachable; Seven Fortunes' Blessing Jurojin and Hotei; Touch of the Spirit Realms Meido and Tengoku; the Ancestor gifts of Kaimetsu-Uo, Moto, Togashi Yamatsu, Matsu Hitomi and Usagi Reichin (two). Fifteen in all; a character sees only those it has. The line says "N options"; opened, it shows the existing labelled choices and notes, Honour first, each under its source; it stays open while ticking; every preview opens with it closed. With a choice ticked the closed line reads "N chosen" and names each choice with its bonus (for example "Honour +4"), so a ticked resistance is never hidden. Every other choice stays where it is. Bonuses, totals, Balance including Honour once, the "in place of" pair, per-roll reset and nothing saved: all unchanged. A native disclosure (tap, click, keyboard). | Screen-only |

Proposed names: **A08 — One Undo for Quick Taps** (marker `PART H PHASE 15.1.31`) and **A12 — One Resisting? Line** (`PART H PHASE 15.1.32`), each with its own folder, switch, harness, remover and removal-chain entry after AE3. The group is qualified at behaviour tier because of A08: the 4× CPU screen, then two full passes, both first time.

## The owner's reply, 14 November 2026, in the Claude session

> "approve as recommended, however take extra care ring fencing A12, as this is one I am least certain about"

| Unit | Approved |
|---|---|
| A08 | As proposed |
| A12 | As proposed, ring-fenced with extra care |

**What "ring-fenced" means for A12's build.** A12 is the unit the owner is least sure of, so it must be the easiest to take out again, at the device round or later:

- One switch and one owned fragment pair (script and stylesheet). It changes no other layer's code: the declaration registry (Part I 4.5.15, `RD4515`), the roll preview (Part G Phase 3) and every provider stay as they are. A12 only rearranges the registry's finished markup and reads its offers; it never arms, clears or recomputes a choice.
- With the switch off, or the fragments removed, the Declare section is the registry's own markup byte for byte; the harness proves it on the same roll.
- No saved data, no new storage, no change to totals; the harness checks the roll's dice and total with the same choices ticked, A12 on and off.
- Fail open: if A12's code throws or meets markup it does not recognise, the registry's markup is shown unchanged.
- No other unit or layer depends on A12; A08 does not touch the roll preview. Removing A12 alone, with A08 kept, is part of the removal proof.

This is mock-up approval. It permits the build and preview stage: two separately owned units on stacked branches, light checks, one code review, then the owner's device round with Accept / Revise / Remove for each. It is not device acceptance, qualification or a go-live instruction.
