# Recent branch audit — 4 October 2026

Requested by the owner: ensure branches created in the previous 96 hours are
merged into main. Audit started 4 October 2026 at 14:25:49 BST; cutoff is
30 September 2026 at 14:25:49 BST.

GitHub refs were refreshed with `git fetch origin`. Local creation dates below
come from branch-creation reflogs, not the date of a branch's latest commit.
Remote Git refs have no reliable creation timestamp; every fetched remote ref
was also checked for ancestry against origin/main.

| Local branch created within the window | Creation (BST) | At audit start |
|---|---|---|
| claude/sourcebook-index-2026-09-30 | 30 Sep 15:40:53 | Included in main |
| claude/phase-7-save-format | 30 Sep 16:15:39 | Included in main |
| claude/bugfix-multiple-schools-techniques | 1 Oct 10:13:19 | Included in main |
| claude/bugfix-ancestor-corrections | 1 Oct 12:46:50 | Included in main |
| claude/phase-4-6-alternate-paths | 1 Oct 14:17:20 | Included in main |
| claude/phase-4-6-alternate-paths-r2 | 1 Oct 15:49:29 | Included in main |
| claude/phase-4-6-alternate-paths-r3 | 1 Oct 20:05:01 | Included in main |
| claude/phase-6-technique-text | 2 Oct 03:51:57 | Included in main |
| claude/adv-disadv-audit | 2 Oct 12:34:05 | Included in main |
| claude/phase-4-5-25-clan-prices | 2 Oct 14:28:49 | Included in main |
| codex/phase-4-5-26-dice-entries | 2 Oct 22:47:40 | Included in main |
| codex/phase-4-7-core-advanced-schools | 3 Oct 11:37:14 | Branch tip included; release changes still uncommitted |

All fetched remote refs except `origin/claude/project-thread-tw7vtn` were already
ancestors of origin/main at audit start. That exception points to `a83393c`
(23 September) and was already present in the older branch inventory; it is
outside this request and is left untouched. Recent remote-only ledger, Ancestor
and sourcebook-wiki branches are included in main too.

The owner has authorized committing and merging the outstanding Phase 4.7
release, its QA evidence, manual examples and deferred feedback notes. The four
locally deleted older kickoff files and seven untracked Word files are unrelated
owner changes and are excluded. No branch deletion, force push or history rewrite
is needed.

## Merge result

Phase 4.7 was committed as `71a15cb` and main was fast-forwarded from `9c332ae`
to that commit on 4 October. All 12 local branch tips are now ancestors of main.
Final QA: release 4,036/4,036, removed-build retained suite 3,840/3,840,
24 remover tests (23 passed, one Windows symlink skip), ownership and build drift
checks pass. Owner feedback FT-01 to FT-08 remains deferred; this merge does not
implement it. Owner deletions and Word files remain in the local working tree,
unstaged. Main and the feature branch are to be pushed without force; final
remote ancestry is checked after the push.
