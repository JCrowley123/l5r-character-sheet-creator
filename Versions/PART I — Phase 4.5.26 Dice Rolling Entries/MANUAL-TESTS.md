# Dice Rolling Entries — device checks

Status, 3 October: **Windows: Pass (owner report). iPhone: Not run.** The owner
supplied 15 screenshots and confirmed Windows-only testing. See
[OWNER-TEST-REVIEW.md](OWNER-TEST-REVIEW.md) for the distinction between visible
evidence and reported results. Merged on the owner's word, 3 October
2026 (`72523fe`); deployed-page checks passed 129/129. Open the
[live app](https://l5r-character-sheet-creator.pages.dev/) and refresh before
testing. Report each check below as Pass / Fail / Not run.

The requested Claude Doc could not be published: no matching connector was found
in this session's tools or plugin search. This repository checklist is the current
copy. When that connector is available, publish one checklist with a Pass / Fail /
Not run dropdown per check; existing saved ticks must survive. The old published
Claude ledger also still needs refreshing after its live page has been read fully.

Use a disposable character, or export a backup first. Open the live app after
deployment and refresh. Around 10–15 minutes. Random totals vary; the preview,
die chains and result description are the useful things to inspect.

1. **Untrained baseline.** With no relevant Advantage, put Hunting at Rank 0.
   Roll from the Skill table and the Untrained Skills list. Both describe an
   Unskilled Roll whose 10s do not explode. An untrained Katana attack does too.
   Windows: Pass (owner report). iPhone: Not run.
2. **Void still works.** On that Rank 0 Hunting roll select the Void option to
   treat it as Rank 1. It gains one rolled die and enables explosion. Cancel a
   second preview with this option selected: no Void is spent by cancellation.
   Windows: Pass (owner report). iPhone: Not run.
3. **Four families.** Add Crab Hands, Crafty, Sage and Sensation. Roll untrained
   Kenjutsu, Stealth, Lore (History), and Perform (Song) from the list and a
   Rank 0 table row. Each preview names the matching Advantage and Rank 1; it
   adds one rolled die. The purchased Rank stays 0.
   Windows: Pass (owner report). iPhone: Not run.
4. **Attacks and overlap.** An untrained Katana attack with Crab Hands and a
   Shuriken attack with Crafty both show Rank 1, with no contradictory Unskilled
   label. With Crab Hands and Crafty together, Ninjutsu gains only one die.
   A trained Skill gains no extra die from these Advantages.
   Windows: Pass (owner report). iPhone: Not run.
5. **Gaijin Name.** Add it and roll a trained Courtier or Perform Skill. Both
   preview and result state that a die explodes at most once. Any first 10 may
   add one die; a second 10 stops at 20. An untrained Social roll still does not
   explode unless Void or an Advantage gives effective Rank 1.
   Windows: Pass (owner report). iPhone: Not run.
6. **Rerolls.** On a Social roll with Gaijin Name, use Luck if held and available;
   try Emphasis when eligible 1s appear. The same per-die limit remains. Then
   roll a non-Social trained Skill; it has the usual unlimited explosion rule.
   Windows: Pass (owner report). iPhone: Not run.
7. **Save and layout.** Save, reopen, and reroll Perform with Sensation and Gaijin
   Name. Both effects still apply. Removing Gaijin Name restores normal trained
   explosions. Read both preview and result in portrait and landscape: explanatory
   text, dice and controls fit and remain tappable.
   Windows: Pass (owner report). iPhone portrait/landscape: Not run.

Phase 0.7's seven Android checks remain optional: the owner has no Android phone.
The unrelated iPhone Print/PDF check remains a planning input for Phase 11.1.
