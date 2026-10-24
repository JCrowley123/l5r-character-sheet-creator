# BUGFIX — Clan and School Pickers After Cancel

Cycle 6, Release 6a (FT-44). Reported in the owner's check B1, 22 October 2026: after **Apply → Cancel**, the Clan and
School pickers kept the new choice, also after save and reopen.

## What was wrong

Release 5a's question before Apply Family or Apply School left the Clan & School pickers on the new pick after
**Cancel**. The character was unchanged, but the tab showed a Clan and School it did not have. **Save and reopen** did
not put it right: opening the open character from the Characters list only closes the list (it does not load the
character again), so the pickers stayed.

## The fix

One fragment, `src/sheet/209.999999999991-bugfix-cfs-cancel.js` (`CFSCANCEL`, switch `CFS_CANCEL_ENABLED`), and one seam
block. After **Cancel** or **✕** on that question, and after **Open** on the character already open, the pickers go
back to the character's own Clan, Family and School through `CFSSYNC.sync()`. Display only: no saved field is written.

- **Replace** still applies the new pick, and the pickers keep it.
- **Another question's Cancel** (for example "This sheet has not been saved") leaves the pickers alone: only the question
  a person's tap on Apply raised is watched. A window listener sees the tap before 5a's own listener asks.
- The creation wizard clicks Apply by script and is never asked, so it is unaffected.

**One older harness changed.** 5a's harness (`cfs-sync-harness.js`) cancels the question and then taps Apply again,
expecting the new pick still staged. It now stages the pick again after each Cancel, in two blocks this fix owns
(`restage-after-school-cancel`, `restage-after-family-cancel`). Its count stays 72; it passes on main too.

## QA

| Measure | Result |
|---|---|
| Own harness, `qa/cfs-cancel-harness.js` | **16/16** |
| The same harness on main (`993389b`, 5c.1, `7c7cdf21…`) | **11/16**: the checks that pass guard what must not change |
| Pinned variants, `qa/verify-variants.py` (pins in `variants.json`, written before the first run) | **all 8 matched** (main plus 7 mutations; see `negative/summary.json`) |
| Removal, `qa/test-removal.py` | **8/8**: rebuilds the build before this layer byte for byte (`7c7cdf21…`, 7,966,579 bytes); refuses the live tree, a foreign marker and a missing block ; with `--fixture`, the 5a harness returns to main's bytes |
| All five 6a layers removed through the registry | rebuilds main (`7c7cdf21…`) byte for byte, manifest and seam file identical |
| Removal chain registry, `qa/test-chain.py` | **11/11** with the five 6a layers registered |
| `qa/feature-dependencies.py` | every hit is in this layer's own seam block (the checker reports the bare "BUGFIX" marker) |
| Older harnesses touching the same surfaces (pre-run on the 6a build) | **all 29 leaves pass** (`QA — Cycle 6 Release 6a 2026-10-24/qa/prerun.log`; folders in `prerun-folders.txt`) |

Covered: Cancel and ✕ after Apply School; Cancel after Apply Family; Replace; another question's Cancel; Open on the open character from the Characters list (saved first).

The full suite, the code review and the live check are recorded with the release, in
`QA — Cycle 6 Release 6a 2026-10-24`.

## Still to note

- The Characters list row is opened by a script click in the harness: in the headless phone another layer covers the row
  for a real tap. The owner's device check covers the real tap.

Device checks (the owner's iPhone): in the Cycle 6 Device Checks checklist.
