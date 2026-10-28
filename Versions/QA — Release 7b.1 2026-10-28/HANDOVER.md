# Release 7b.1 — handover (28 October 2026, live; waiting for the owner's device checks)

Main `5970447` (merged on the owner's word, fast-forward). Candidate `4ed1738a…`, 17,382,264 bytes.

Done:
- Eight layers (R7, R10, R14, R15, R16, R21, R24, R25), each with README, ROLLBACK, harness, pinned variants and a
  removal-chain entry. Own harnesses 87/87, again 87/87 at 4× CPU; removal 6/6 for each layer; every pinned variant
  matched. One review: five findings fixed with checks pinned first (`REVIEW-FINDINGS.md`).
- Affected groups 47/47 (`qa/affected-3/`). Full suite, runs 3 and 4: candidate 6,452/6,452; the eight removed rebuild
  main exactly (`55f9e9ed…`); retained 6,292/6,292. Run 1's retained half held two live-site groups; the runner now
  leaves them out as 7a's did (`d90d1c9`).
- Live (`qa/live/`): page and service worker byte for byte, 486/486 on the downloaded files, smoke 11/11.
- Checklist walk on the live site (`qa/walk/`): 16/17. The two test characters there were sent to the owner.
- [Release 7b.1 — Device Checks](https://claude.ai/artifact/9GEnpXbSecHBucCBHJSV1z) (doc `42e9c3a3-7d65-4a51-9aea-e2c7862bcb21`,
  body `ddc6ae38-9dcd`, Results table `mq2r95v2erm.7209`, dropdown enum `65a63dd4-da2d`: Pass, Fail, Not run).
- Records: ledger parts 1–4 and 6 (MD and HTML), the roadmap, a `CLAUDE.md` pointer. The ledger page is not republished
  (after Cycle 7, as agreed).

Open — Release 7b.1.1, after the owner's device checks (owner ruling, 28 October):
1. D1: `209.999999-feat-advanced-schools.js` registers `AS47.renderChoice` as `#advancedSchoolPicker`'s change listener
   before GI7 wraps it, so choosing a School from the list never paints the gender boxes or reworks Begin training.
   Pin a check that drives the real picker's change event (GI-PICKER: Female, choose the Lion's Pride, box ticked and
   greyed with its line; Begin training follows), and a variant without the fix; then GI7's UI also listens to the
   picker's change (registered after the original, so it runs after it): paint, then `AS47.updateEntryButton()`.
2. Optional, the owner's call: Kuni's tick-box label still says "(a Void Point; once a session)" under Hotei's Curse.
3. Anything else the owner's device checks find.
