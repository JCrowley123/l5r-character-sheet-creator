# Instigator Blackmail Count

**Status, 29 October 2026:** built for Release 7b.2 on branch `claude/release-7b2-2026-10-29`; not merged. The release's QA folder is `QA — Release 7b.2 2026-10-29`.

Your ruling R17 (FT-07, 23 October 2026), with your answer of 29 October (Q4: yes). The Scorpion Instigator (Core pp.249–250) needs Blackmail on at least four different people, and Blackmail (Core p.146) is bought for one person. The Advanced School's gate now reads its `special.blackmailDistinctPeople` (4): it counts configured Blackmail rows (target and agreed Status set) with different target names, trimmed and in any case, and reports "Blackmail on 4 different people (n recorded)" in place of the bare Blackmail line. The four-people confirmation goes; the Dark Secret disclosure stays a confirmation, since the sheet cannot know it.

## How it is built

One fragment behind one switch, `INSTIGATOR_BLACKMAIL_ENABLED = true`: `src/sheet/209.99999999999996-bugfix-instigator-blackmail.js`, with `BK7Logic` (UI-agnostic: the count and the report) and `BK7` (reads the Blackmail rows, wraps `AS47.unmet`, drops the confirmation from the entry). Test seam: the `blackmail-seam` block in `src/sheet/210-test-seam-and-init.js`.

Phase 4.7's two Instigator checks (`AS47-NARRATIVE-CONFIRMED`, `AS47-ALL-SCHOOLS-ADVANCE`) entered with one unconfigured Blackmail and both confirmations. While this switch is on, their fixture now holds four configured Blackmail rows naming four people and confirms only the disclosure; without it, exactly as before.

Known limit: Search's Advanced School entry still lists Blackmail as an Advantage and, with the confirmation gone, no longer says "four different people".

## Checks

- `qa/instigator-harness.js`: 14/14 on the candidate, again at 4× CPU.
- Pinned negative variants (`qa/variants.json`, written before the first run): main (baseline) fails exactly 10 pinned checks; disabled 9 (its logic still answers); case-sensitive 2; counts-unconfigured 1; bare-kept 2; confirmation-kept 3. All matched on the first run.
- Removal (`qa/test-removal.py`): 6/6. This remover rebuilds `389ef613f98b127ea8e860cf8620b43d6c338ee503d0b2cfd359396d972e7595`, 17,403,392 bytes.
