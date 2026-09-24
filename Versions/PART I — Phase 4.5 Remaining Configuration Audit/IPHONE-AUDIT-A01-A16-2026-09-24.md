# A01–A16 iPhone Audit — 24 September 2026

The owner's iPhone pass over all sixteen A01–A16 Advantages (Phases 4.5.13–4.5.24), run from
`IPHONE-TESTS-A01-A16-2026-09-23.md` in this folder. Results were reported on 23–24 September in one
session, with about 150 screenshots. Build under test: the live site at `3e262b18…` (2,914,055
bytes); the A13 realm picker opening on the phone confirms the phone had that build.

**Nothing in the sheet has been changed by this audit.** It records what was found, classifies it,
and gives Claude's assessment of the owner's suggestions. The order of work and the rulings needed
are in the ledger's open reminders and the session reply of 24 September.

Usage: the owner's weekly reading after the testing session is **34%**, up from 28% at the end of
the A01–A16 build session. That reading was taken before this write-up.

Companion HTML: `IPHONE-AUDIT-A01-A16-2026-09-24.html`, published as an artifact at
https://claude.ai/artifact/65AgcyTmmfPL1Ud2n4ag7N.

---

## The result in brief

- **All sixteen entries behave as built on the iPhone.** No defect was found in any A01–A16
  release's own code.
- **One serious defect was found through A14, and it is older than A01–A16: cancelling a spell at
  the roll preview still uses the spell slot.** It affects every spell a caster casts (D1 below).
- **Two A03 Dark Paragon precepts, Perfection and Will, work as specified on 23 September**, but
  seeing them live the owner wants them to do the work rather than only take payment. That changes
  an approved ruling.
- **Twelve suggestions would change the sheet or an approved ruling:** interface changes (A01, A04,
  the pickers), the two A03 precepts, automation for two Paragon tenets, two new features (a Jurojin
  roll, A14 bonus slots) and three reviews (Honor, Glory and Status; A07/A11 scope; Hotei). The owner
  also confirmed that seven reminders should stay reminders, and moved the Blessing review to the
  final A01–A16 review.
- **The A06 rival list was audited as asked:** all 29 entries present, nothing extra.

| Class (kickoff triage) | Count | Items |
|---|---:|---|
| a) Confirmed working on the device | 16 of 16 | Every entry; A03 Perfection/Will and A14 carry notes |
| b) Defect | 1 (+1 same shape) | D1 cancelled cast uses the slot (trunk); Maho Own-Blood Wounds (found by reading code) |
| c) Wording or layout | 0 reported | One small layout note from the screenshots (L1) |
| d) New request or change to a ruling | 12 | S1–S9, S11, S13, S14 (S10 confirms rulings; S15 was already open) |
| e) Known issue | 0 reported | None of the four known issues was reported against |

---

## Defects

### D1 — A cancelled cast still uses the spell slot (every spell) · HIGH

**Reported.** During A13/A14: with Void Versatility on Earth, a Void spell paid with Earth and
cancelled at the preview still used an Earth slot; with Earth full, paying with Void and cancelling
used a Void slot. Then, with the Advantage removed, on a Crane Asahina Shugenja: Boundless Sight
(Void) and Arrow's Flight (Air) each used a slot after Cancel.

**Confirmed in code** (not yet driven headlessly). `castSpell()` in
`src/sheet/110-modals-trackers.js` fills the slot first (line 739 for an Element slot, lines 754–756
for a bonus slot) and only then calls `performSpellCastRoll()`, which opens the preview.
`rollWithModifiers()` already returns `null` when the preview is cancelled, but `castSpell()` neither
waits for that result nor refunds. Void Versatility's own payment (`payWithRing()`, 4.5.20's fragment)
spends before the preview in the same way. The preview itself says "Nothing is spent until you
roll", which is true of Void Points and not of spell slots.

**Where it came from.** Before Phase 3 (Part G, Smart Roll Preview) nothing sat between spending the
slot and rolling, so there was nothing to cancel. Phase 3 put a Cancel in front of every roll and
made Void Points wait for the confirm; spell slots were never moved. 4.5.20's README recorded that
the slot is spent before the preview, but nobody logged it as a defect. A01–A16 did not cause it;
A14 is where it became visible.

**Why it is high.** It hits every caster on every cancelled cast. The hand workaround for a bonus
slot (tapping the pip back) is exactly the path of the open bonus-pip bug, which can strip another
Element's pip, so one bug's workaround triggers the other.

**Same shape, not reported, found while checking.** A Maho spell cast with the caster's own blood
applies the Wounds before the preview (around line 955), so a Cancel keeps them. Taint is already
right: it is only gained when the roll succeeds.

**Proposed fix.** Its own BUGFIX folder. On a cancelled preview, refund exactly what the cast took:
the Element slot, or the shared bonus pool plus that Element's bonus fill, or the Void Versatility
Ring slot, and Own-Blood Wounds. Refunding (rather than moving the spend after the preview) keeps the
"no slots left" refusals where they are, before the preview opens. Trunk `castSpell()` plus one
guarded block for 4.5.20's `payWithRing()`. Full combined suite and a removal proof.

### L1 — Jigoku's Lost line wraps badly in the preview · LOW (layout, not reported)

The Kenjutsu preview reads "+8 to total — Lost: twice Taint Rank" with "4" alone on the next line.
Suggested wording: "+8 to total — Taint Rank 4 ×2 (Lost)". Inside 4.5.24's fragment; wording only.

### Still unverified

A08's "2 XP: Crane price" wording (the checklist asked about it) was not seen: the A08 test used a
non-Crane character, whose Blessing costs 3 XP.

---

## Entry by entry

| Entry | Release | What the owner tested | Result | Owner's notes |
|---|---|---|---|---|
| A01 Seven Fortunes' Blessing | 4.5.21 | Benten as Crane (3 XP, roll); Bishamon prices as Lion, Crab and Crane; Fukurokujin with Lore: History; Daikoku as Mantis, skilled and unskilled; Ebisu; Jurojin; Hotei | Works | The picker needs either the arrows or the **i**, not both (S1). Wants a "Resist poison" button (S3). Unsure Hotei is the best implementation (S4). Fortune change and replace-without-refund go to the final review (S15). |
| A02 Blackmail | 4.5.13 | Price from the target's Status; Scorpion 1 less; Status 1 still costs 1; Status 0 refused | Works | — |
| A03 Dark Paragon | 4.5.23 | Control (only on Social Skills; payment; Void fallback), Determination (Honor and Void payment), Insight, Knowledge, Strength, Perfection, Will | Works as built; Perfection and Will to change | Perfection should be a die pick in the result (S5). Will should prompt when Wounds rise (S6). Wants Honor, Glory and Status reviewed (S14). |
| A04 Darling of the Court | 4.5.14 | Courts and price; selected court; in session; Status above 1 | Works | Drop the radio dot and make the whole chip the button; add courts from the row, and keep the editor for rename and remove (S7). Status system (S14). |
| A05 Forbidden Knowledge | 4.5.13 | "Works ok" | Works | — |
| A06 Heart of Vengeance | 4.5.16 | Rival and roll tick | Works | Asked for an audit of the rival list: done, 29 of 29 (S12). |
| A07 Inheritance | 4.5.13 | Reminder | Works | Possible wider scope (S13). |
| A08 Naishou Citizen | 4.5.22 | −1 XP on the Blessing; "Aligned with" follows a Fortune change | Works | Replace-without-refund to the final review (S15). |
| A09 Paragon | 4.5.18 | Picker and tenets | Works | Bottom **i** redundant (S2). Courtesy +2k0 on Etiquette and Honesty +1k1 on Sincerity should apply automatically (S8, S9). Duty, Honor and Sincerity stay reminders (S10). |
| A10 Perceived Honor | 4.5.6 | Rank reading | Works | Honor system review (S14). |
| A11 Servant | 4.5.14 | Reference | Works | Possible wider scope (S13). |
| A12 Soul of Artistry | 4.5.19 | 4 XP, 3 as Crane, 3 as a Crane Courtier (no double discount); Artisan, Calligraphy, Craft, Engineering, Sailing and Forgery rolls | Works | — |
| A13 Touch of the Spirit Realms | 4.5.24 | All ten realms; Bushi and Shugenja prices including Toshigoku 8/7 and Yomi 7/6 with the GM note; Yomi's School Skill flag; Jigoku at Taint 4 and Lost (+4, +8); Sakkaku with the Deceit Emphasis re-roll; Meido skilled and unskilled; Tengoku on an Earth Ring roll | Works | Bottom **i** redundant (S2). Gaki-do, Maigo no Musha, Toshigoku and Yume-do stay reminders (S10). The Lost label shows at normal size, which confirms the 4.5.24 label fix. |
| A14 Void Versatility | 4.5.20 | Earth chosen; the payment dialog | Works; exposed D1 | Bonus-slot cascade (S11). |
| A15 Way of the Land | 4.5.13 | "Looks to be ok" | Works | — |
| A16 Wealthy | 4.5.17 | "Wealthy works" | Works | — |

---

## The owner's suggestions, and Claude's assessment

**The lens.** This is a player companion, like D&D Beyond: it should do the arithmetic a player
would otherwise do on paper, and remind them of what they own. It should not guess what only the
table knows (an NPC's caste, which roll a poison calls for, how big a hit was), and it is not a VTT,
GM tracker or combat engine. Where a rule depends on the situation, the sheet's established answer is
a per-roll tick in the preview: the player says it applies, and the sheet does the maths.

### S1 — A01 picker: arrows and **i** · Agree, keeping the other one

**The owner's view.** One of the two is redundant: drop the arrows, or drop the **i** at the bottom.

**What is there.** Each Fortune has a "Rule" disclosure (the arrow) that opens its rule under that
option. The **i** at the bottom opens a separate panel listing all seven rules again.

**Assessment.** Remove the bottom **i** and keep each Fortune's "Rule". Reading one rule next to the
option you are weighing is easier on a phone than opening a panel over the picker, reading seven and
closing it. The **i** on the row stays: once the picker is closed, it is the only place the rules
live.

**Scope.** Six other pickers and editors share this bottom **i**: A03, A04, A09, A12, A13 and A14.
Do all seven together so they stay consistent. Check each panel for a sentence found nowhere else
before removing it (A13's Shugenja price note is already on the picker; A09's "+1 Honor, add it
yourself" is on the row). Each is a one-line change inside that release's own fragment: seven
removal proofs re-measured, one combined suite run.

### S2 — A09 and A13 pickers: the bottom **i** is redundant · Agree

Same change as S1.

### S3 — A01 Jurojin: a dedicated "Resist poison" button · Disagree for now

**The owner's view.** A button on the row that makes a dedicated poison-resistance roll, which Jurojin's
Curse could also use.

**Assessment.** L5R has no single "resist poison" roll: each poison or disease names its own roll and
TN. A button would still have to ask which Ring or Trait to roll, so it saves one tap over rolling
that Ring or Trait and ticking "Resisting poison or disease" (+2k0), which the sheet does today. D&D
Beyond treats the same kind of bonus as a note on the save, not a separate button. It would also span
two releases on different mechanisms: Jurojin's Curse (4.5.11) predates the 4.5.15 registry.

**What Claude would do instead.** Make the row's reminder give the steps ("Roll the Ring or Trait the
poison names, then tick 'Resisting poison or disease'"). If the owner still wants the button, build it
once as a shared "Resist poison or disease" roll with a Ring or Trait choice, used by both Blessing and
Curse, after moving Jurojin's Curse onto the registry.

### S4 — A01 Hotei: "unsure this is the best implementation" · Needs specifics; no change proposed

**What is there.** A Contested Void Roll button on the row, and a "+10" tick for contests. The rule
(Core p.154) only protects against Void loss caused by someone else's effect, which the sheet cannot
see, so a button and a tick are the smallest version that does not guess. If the button feels like
clutter because Hotei rarely comes up, the alternative is the tick and a reminder only. The owner is
asked what felt wrong.

### S5 — A03 Perfection: pick a die in the result window · Agree

**The owner's view.** A button in the result window, like the Emphasis re-roll: pick one die, roll it
again and add the new roll to it (a 7 that rolls 6 becomes 13), with 10s exploding as normal.

**Assessment.** This is exactly the rule ("make one chosen die on a Skill Roll explode", with no +5),
and it is better than today's Use button, which takes payment and leaves the maths to the player. The
result window already has a die-selection mode for the Emphasis re-roll (Part C, Feature 0), so the
pattern exists. Details to keep: Skill Rolls only, as the rule says; one die; no +5; payment on
confirm after the die is chosen, and cancelling is free; the die shows "7→13" as an Emphasis re-roll
does.

**Where.** 4.5.23's fragment, reusing the result window's selection pattern. Size to be measured: it
depends on whether that selection code can be driven from outside its own file.

### S6 — A03 Will: prompt when Wounds rise · Agree with the goal, not with a pop-up

**The owner's view.** When Wounds go up and Will is available, a pop-up offers it, asks how many
Wounds the hit dealt, and applies that number minus 10.

**What the sheet has.** Wounds change through +/− buttons (one at a time), a slider and a typed total.
None of them knows the size of a hit. A pop-up on "Wounds went up" would fire on the first + of a
15-Wound hit, fire again on every later tap if declined, and fire over and over while the slider is
dragged.

**What Claude would do.** A line under the Wound bar, not a pop-up, that appears when Wounds go up
while Will is unused and affordable: "Dark Paragon (Will): negate up to 10 of these Wounds." Tapping
it asks for the hit (pre-filled with how much Wounds just rose), takes payment, and lowers Wounds by
up to 10, never below where they were before the hit. It stays hidden when Will is used or cannot be
paid, as the owner asked. The row's Use button does the same arithmetic. The rule negates the Wounds
when they are suffered; entering them and negating them straight away is the same moment at the
table.

**Where.** 4.5.23's fragment, listening to the Wound controls. Whether this needs a shared-file block
is to be measured.

### S7 — A04: the whole chip as the button, and Add court on the row · Agree

Hide the radio dot (keep it for keyboards and screen readers) and show the selected court by the
chip's fill, which it already has. Add an "Add court" button on the row (name, duplicate check, price
updates); the editor keeps rename and remove. Also drop the editor's bottom **i** (S1). Inside
4.5.14's fragment and stylesheet.

### S8 — A09 Courtesy: automatic +2k0 on Etiquette · Partly agree

**Agree:** it is a bonus on the Etiquette roll itself, not a separate roll made after an
embarrassment.

**Disagree with "every Etiquette roll":** the rule gives it "to avoid embarrassment or a breach of
honor", and Etiquette also covers Bureaucracy and Conversation (its Emphases in the sheet's own Skill
list), where it does not apply.

**What Claude would do.** A tick on Etiquette rolls, "Avoiding embarrassment or a breach of honor —
+2k0", the same shape as the Sakkaku "Lying" tick the owner tested. One tap when it applies, never
applied wrongly. The +1 Honor stays a reminder (agree). If nearly every Etiquette roll at the owner's
table is about avoiding embarrassment, automatic is a defensible house reading; the owner can rule
that, and it is the simpler build.

### S9 — A09 Honesty: automatic +1k1 on Sincerity · Automate it, but as a tick

The rule is Sincerity (Honesty) only. An automatic bonus on every Sincerity roll would also add +1k1
when lying, the opposite of the tenet. The sheet already has the mirror case: Sakkaku's "Lying —
Sincerity (Deceit)" tick. Add "Telling the truth — Sincerity (Honesty) — +1k1". The rule applies
without owning the Emphasis, so no Emphasis check.

### S10 — Reminders that should stay reminders · Agree

A09 Duty, Honor and Sincerity; A13 Gaki-do, Maigo no Musha, Toshigoku and Yume-do. One note: A09
Courage (+1k1 resisting Intimidation or Fear) has the same shape as S8 and S9 and would cost almost
nothing to add in the same change. The owner has not commented on it.

### S11 — A14: Void Versatility spilling into bonus slots · Disagree

**The owner's view.** When the chosen Ring (say Fire) is full, a Void spell paid "as Fire" should take
a shared bonus slot and show it on Fire's bonus row.

**What already happens.** Once Fire has no slot left, Void Versatility steps aside and the ordinary
Void flow runs: Void slots, then the shared bonus pool. So the spell can already use a bonus slot. The
change would only alter which row shows the used bonus pip (Fire's instead of Void's); the number of
spells that can be cast stays the same. The rule converts that Ring's slots, and the bonus pool is not
Fire's slots.

**What Claude would do.** Nothing now. If the owner wants it for bookkeeping, do it after the
bonus-pip bugfix: both write the per-Element bonus counters, and 4.5.20 currently promises never to
touch the bonus pool.

### S12 — A06: audit the rival list · Done

Measured on the live build. The list is built from the sheet's own Clan and Family catalogues, so it
holds exactly what the sheet knows, and anything added there appears automatically:

- 8 Clans: Crab, Crane, Dragon, Lion, Phoenix, Scorpion, Spider, Unicorn
- 14 Minor Clans: Badger, Bat, Boar, Dragonfly, Falcon, Fox, Hare, Mantis, Monkey, Oriole, Ox, Snake,
  Sparrow, Tortoise
- 6 Imperial families: Miya, Otomo, Seppun, Hantei, Toturi, Nasu
- the Brotherhood of Shinsei

29 in all, matching the owner's list exactly, with no duplicates.

### S13 — A07 Inheritance and A11 Servant: wider scope · Keep as they are for now

Both hand the effect to the table: an heirloom's properties and a servant's abilities are the GM's to
set. The one extension that fits a companion app: Inheritance could add the heirloom to the Equipment
list, the way D&D Beyond adds starting equipment. The owner is asked what they had in mind before
anything is scheduled.

### S14 — Honor, Glory and Status · Agree it needs a review; audit first

**Measured.** Each track is stored twice: a whole-number Rank and a decimal Points field (Honor 5 and
5.0 by default). They are set together when a School is picked and nothing keeps them in step after
that, so a sheet can read Honor Rank 3 with Points 7.2. Features read different halves: A03 pays from
Honor Points, A10 reads Honor Rank, A04 reads Status Rank. Six source files read these fields.

**What Claude would do.** A short read-only audit first (every reader, the save format, and how the
book and printed sheet present these), then one decision on the model (for example, one decimal
value per track with the Rank derived from it), then the build. Not before the bugfixes: it will
change A03, A04 and A10 and their checks.

### S15 — A01/A08: changing the Fortune, and replace-without-refund · Already on the ledger

Claude's recommendation for that review:
1. A second Blessing row: flag it, never delete it.
2. Changing the Fortune on an existing row corrects a mistake: re-price it, as now.
3. Naishou Citizen's later replacement: keep the old Blessing as a locked row with no effect
   ("Benten's Blessing — replaced, no refund") that keeps its XP, and add the new Fortune as a fresh
   row. That shows the spent XP without an XP history the sheet does not have, and the replaced row is
   exempt from the one-Blessing flag.

---

## Not verified on the device

- The "Across all of them" checks were not reported: save and reload, JSON export and import,
  renaming a configured row, an Advantage on the Disadvantage list, portrait and landscape.
- A03: the Session Resources panel and Reset session were not reported.
- A14: the greyed entry for a non-Shugenja, and that Void slots and the bonus pool stay untouched when
  a Ring pays, were not reported.
- A08's Crane wording (above).
- D1 is confirmed by reading the code, not yet by a headless run. Its fix starts by reproducing it.
- Per-release READMEs still say "iPhone open". They will be updated as each release's device
  correction lands, or in one pass if no correction touches them.
