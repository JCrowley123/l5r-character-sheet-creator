# Claude session kickoff — Release 7b.1.1 (28 October 2026)

Release 7b.1 is live (main `5970447`, then records). The owner's device checks on 28 October passed 13 of 16 on the
iPhone and in Edge ([Release 7b.1 — Device Checks](https://claude.ai/artifact/9GEnpXbSecHBucCBHJSV1z)). 7b.1.1 fixes the
other three, as the owner ruled. Estimate **6 points (4–9)**; the week read 26% when this was written.

## Start of session

1. Turn Remote Control on, and keep the computer awake (the owner follows from an iPhone).
2. Work only in `C:\Users\jcrow\l5r-character-sheet-creator`. Never touch the OneDrive clone; the shell starts there,
   so use absolute paths.
3. Read this file, `Versions/QA — Release 7b.1 2026-10-28/HANDOVER.md`, and `Versions/CLAUDE.md`'s last pointer. Do not
   re-read the whole ledger or roadmap; search them. Release 7b.1's own kickoff
   (`CLAUDE-SESSION-KICKOFF-RELEASE-7B1-2026-10-28.md`) holds the rules for how a release runs; they all apply here.

## Scope: three removable layers

| Check | What the owner saw | Build |
|---|---|---|
| D1 (known from the walk; not run) | With Gender `Female`, choosing the Lion's Pride from Techniques → Advanced School leaves "My character is female…" unticked, with no line, and Begin training is worked out from the unticked box, until Gender is edited again | `209.999999-feat-advanced-schools.js` line 672 registers `AS47.renderChoice` itself as `#advancedSchoolPicker`'s `change` listener, before R15's layer (GI7) wraps the property, so the list never reaches GI7's wrapper. A layer that adds its own `change` listener on the picker, registered after the original so it runs after it: `GI7Ui.paint()`, then `AS47.updateEntryButton()` |
| B2 (Fail, iPhone and Edge) | Crab with Kuni and Hotei's Curse, 1 Void Point: cast Jade Strike, tick Kuni's gift, Roll. "Kuni: … Roll without it?" answered **Cancel roll** or ✕ cancels the roll but keeps the Earth spell slot spent | Older than 7b.1; R10 only made it easy to reach. The refund (`209.992-bugfix-spell-slot-accounting.js`, SSA992) wraps `rollPreviewGate` and clears its pending payment once the preview says go; Phase 4.8's Ancestors (`209.99998-feat-ancestors.js` ~line 1620) wraps `rollPreviewGate` later, so its `ANC48.gate` cancel comes after the refund has stood down. A layer that wraps `rollPreviewGate` after the Ancestors: note `SSA992.pending` on entry, mark refunds by wrapping `SSA992.refund` (it is called through the property), and when the gate as a whole answers false for a Spell Casting roll whose payment was not refunded, refund it once. Check first that `SSA992.take()` returns an object you can mark |
| E1 (Pass, with a note) | "Go to Advanced Schools" is too big beside its one-line hint (Edge screenshot in the doc) | The pointer's CSS (`59.9999999979-bugfix-school-pointer.css`) gives `.ap7-go` `min-height:44px` everywhere. A layer that makes it compact, sized like the Taint card's Check Taint growth button, keeping a reasonable tap height on touch screens (`@media (pointer:coarse)`). Screenshot it at 390 px and on the desktop before and after |

Kuni's tick-box label ("(a Void Point; once a session)" under Hotei's Curse) stays as it is: the owner left no note.

## Checks to pin before the first run (with negative variants)

- **D1:** drive the real control (Playwright `selectOption` on `#advancedSchoolPicker`), never `AS47.renderChoice()`.
  Female → the box ticked and greyed, "Your Identity says Female, which meets this."; Male → unticked, the GM line; empty →
  "Or enter the Gender in Identity."; Begin training follows each. Use the Matsu test character's data (it meets every
  other requirement): `Versions/QA — Release 7b.1 2026-10-28/qa/walk/7b1-checks-matsu.l5r.json`.
- **B2:** from the Crab test character (`…/qa/walk/7b1-checks-crab.l5r.json`): Void Points 1, cast, tick Kuni, Roll →
  Cancel roll → the Earth slots back to 2/2 and nothing spent; the same with ✕; Roll without it → one slot spent, rolled;
  the preview's own Cancel → refunded exactly once (not twice); a cast without a gift unchanged.
- **E1:** the button's computed size at 390 px and at 1280 px, against the Check Taint growth button.
- Keep the 7b.1 lessons: `SURFACE_RE` with base64-safe lookarounds; for every method a layer wraps, look for an earlier
  listener that holds it (memory `wrapped-method-early-listener`).

## The full suite

Candidate: 7b.1's runner (`QA — Release 7b.1 2026-10-28/qa/current-suite-runner.js`, 6,452) plus the new harnesses.
Retained: main's suite **less the two live-site leaves** (5a's `sw-checks.js` 61 and 5b's `notice-checks.js` 12, which
refuse any sheet but the live tree's build), 6,379, as 7a's and 7b.1's retained runs did; carry the changed-leaf counts
(`module.exports.changedHarnesses`). Removing the new layers through the registry must rebuild main's build exactly:
`4ed1738aa87c4004966e847f0eb27d0cca18d91bbb435c4d5652ab1c499c7d34`, 17,382,264 bytes, after
`BUGFIX — Ancestor Gifts Used and Favour`. Run `qa/run-final-twice.py` in the background on mains, screen awake.

## After the merge (on the owner's word only)

Live check (adapt 7b.1's `qa/verify-live.py`, `qa/live-browser-smoke.cjs`), the walk on the live site at phone size
(adapt `qa/checklist-walk.cjs`), then add a section **"I. Release 7b.1.1 re-tests"** to the same Device Checks doc, before
its Results heading (`mq2r95v2erm.7079`), and its rows at the end of the Results table (`mq2r95v2erm.7209`); dropdown
enum `65a63dd4-da2d` (Pass, Fail, Not run). Read the doc by outline or one block, never whole. Then the records (ledger
parts 1–4 and 6, MD and HTML; the roadmap; a `CLAUDE.md` pointer, 8 CR bytes kept) and hand back to the owner.

## Done looks like

D1, B2 and E1 fixed as removable layers, reviewed once, both full runs passing first time, merged on the owner's word,
verified live, the re-tests walked and added to the doc, the records updated. Then say what comes next: the reading
session, at the start of a fresh 5-hour window.
