# Release 7b.1.1 — handover (29 October 2026; built and tested, waiting for the owner's word to merge)

Branch `claude/release-7b1-1-2026-10-28`. Candidate `649a0008b84eda58ee0b0c84a12d942b4e1d7add2c35789c53879bd505b8f294`,
17,385,712 bytes. Kickoff: `Versions/CLAUDE-SESSION-KICKOFF-RELEASE-7B1-1-2026-10-28.md`.

Done:
- Three layers, each with README, ROLLBACK, harness, pinned variants and a removal-chain entry:
  D1 `BUGFIX — School List Gender Tick` (GP7), B2 `BUGFIX — Gift Cancel Refunds the Spell Slot` (GR7),
  E1 `BUGFIX — Compact Advanced Schools Button` (AB7).
- Own harnesses 25/25, again 25/25 at 4× CPU (`qa/under-load/`); every pinned variant matched (3, 5, 4); removal 6/6
  each. Two first-run corrections are recorded in the layers' READMEs (GP7's no-button variant retired with the
  redundant call it mutated; AB7's AB-GO-OPENS reads the active tab).
- One review (`REVIEW-FINDINGS.md`): no correctness defects; the AB7 wording fixed, the rest recorded.
- Affected groups 35/35 (`qa/affected-1/`). Full suite, runs 1 and 2, first time: candidate 6,477/6,477; the three
  removed rebuild main exactly (`4ed1738a…`, 17,382,264 bytes); retained 6,379/6,379.

Next (on the owner's word only): merge to main (fast-forward), `qa/verify-live.py` (500 checks on the downloaded
files) and `qa/live-browser-smoke.cjs` (12), `qa/checklist-walk.cjs` on the live site (7), then section I of the
Release 7b.1 Device Checks doc, then the records.
