# Release 7b.1.1 — handover (29 October 2026; live at `b484bbc`, the owner's re-tests waiting)

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

Live, 29 October: merged on the owner's word (fast-forward to `b484bbc`). `qa/verify-live.py`: page and service worker byte
for byte (17,392,489 bytes, service worker `01101213cdc9f918`), 500/500 on the downloaded files; `qa/live-browser-smoke.cjs`
12/12; `qa/checklist-walk.cjs` on the live site 7/7 (`qa/walk/`). Section I (I1–I6) added to the Release 7b.1 Device
Checks doc, with six Results rows (Not run). Records: ledger parts 1–4 and 6 (MD and HTML), the roadmap, a `CLAUDE.md`
pointer. Cost about 9 points against 6 (4–9).

Next: the owner's re-tests (section I); then the reading session at the start of a fresh 5-hour window.
