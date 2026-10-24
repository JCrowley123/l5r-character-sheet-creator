# QA — Cycle 6 Release 6a (24 October 2026)

**Five fixes, each its own removable layer. The full suite passed twice, first time, on mains power with the screen held
awake: 6,046/6,046, then the five layers removed through the registry (rebuilding main, `7c7cdf21…`, byte for byte),
then 5,910/5,910, in both runs.**

| Layer | Fix | Own harness (main) | Variants | Removal |
|---|---|---:|---:|---:|
| BUGFIX — Clan and School Pickers After Cancel | FT-44 | 16/16 (11/16) | 7 | 8/8 |
| BUGFIX — Yomi Sees the Ancestor | FT-45 | 12/12 (6/12) | 5 | 6/6 |
| BUGFIX — Roll Preview Opens at the Top | FT-21 | 10/10 (4/10) | 4 | 6/6 |
| BUGFIX — Typed Initiative Is the Dice | FT-23 | 11/11 (3/11) | 4 | 6/6 |
| BUGFIX — Void Card Reasons on a Phone | FT-38 | 14/14 (5/14) | 7 | 6/6 |

- **The build:** 7,979,570 bytes, `221d38e0b428b10c2f697e88b893cf40bae720dbe0c3b7afab514f8dd6cd4466`.
- **Code review** (one reviewer, before the suite): two display bugs in FT-38, both fixed, with two checks and two
  variants added (`qa/code-review.md`).
- **Pre-run:** the 29 suite leaves whose folders touch what 6a changes, on the final build: all pass (`qa/prerun.log`).
- **Removal chain registry:** the five layers registered; `test-chain.py` 11/11.
- **The full suite** (`qa/final-qa.py`, runs `final-run-1` and `final-run-2`): candidate 6,046 (about 18 minutes),
  retained 5,910 (about 16 minutes), each run.

**A first attempt stopped on a runner error, not a sheet failure** (`qa/final-run-1-runner-error/`). The candidate passed
6,046/6,046; the retained step nested Release 5c.1's whole suite, which includes the two deployed-site checks (5a's 61,
5b's 12). Those build the site from the live tree and cannot run on the scratch rebuild, so they reported no count:
5,910 of 5,983. The retained runner now lists 5c.1's sheet-level suites, as 5c.1's own retained runner does (5,910),
and both runs above were made after that change.
