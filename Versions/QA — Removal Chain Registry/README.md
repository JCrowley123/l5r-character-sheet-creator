# QA — Removal Chain Registry

Built 25 September 2026. Test infrastructure only: **the sheet is not touched** and its build is
byte-identical before and after (3,062,010 bytes, SHA-256 `738c7ccf…`).

## Why it exists

Each release's live removal fixture copies the live Phase 0 tree to a scratch folder, removes that
release, and expects the rebuild to hash to the release's own restore point. Anything built after it
sits in the same tree and has to come off first, newest first, each by its own remover.

Until now every fixture kept its own hand-written list of those later releases (`LATER_STAGES`, plus
`LATER_FIXES` for a fix with no fragment, such as the Kitsune [Mantis] removal). Every new release
had to be added to every earlier list, in the right place:

- **14 files in 8 folders** carried a list: `test-removal.py` in Phases 11 to 11.2.4, the Kitsune
  fix and the Import fix, and `verify-variants.py` in Phases 11 to 11.2.3 and the Kitsune fix.
- The Import fix had to edit seven of those folders. Phase 12's stages would each have added more.
- A missed list failed **silently**: Phase 11's live fixture failed from 11.2 until 11.2.3 was built,
  and nobody noticed (recorded in 11.2.3's README).

Now there is one list, `CHAIN` in [`removal_chain.py`](removal_chain.py), in build order. **A new
release adds one entry at the end**, and every earlier fixture picks it up.

## How a fixture uses it

```python
THIS_RELEASE = "PART K — Phase 11 Characters List and Save Model"

def strip_later(copy):
    _removal_chain().strip_later(copy, after=THIS_RELEASE)
```

`_removal_chain()` finds the registry by walking up from the fixture's own file, and the registry
finds each release's folder by searching `Versions/` one wrapper level deep. **Neither counts
parent directories**, the thing that has kept the Part I and Part K wrapper folders from being
built. That blocker is not removed by this change (every Part I remover and runner still counts
parents), but no fixture converted here adds to it.

- `strip_later(tree, after=…)` removes, newest first, every release built after `after` that is
  still present. This is what the live-tree proofs use.
- `fixes=False` removes only releases that add a fragment and leaves a text-only fix applied. The
  "phase removed" variants use it, which is exactly what their old lists did (stages only).
- A folder that is not in `CHAIN` raises `ChainError`. It is never treated as "nothing later", so a
  release that forgets to register itself fails its own fixture loudly.

**Order changed in one respect, measured harmless:** the old lists removed every stage first, then
every text fix. The registry removes strictly in reverse build order, so the Kitsune fix now comes
off between 11.2.4 and 11.2.3. The removers only verify a hash when one is requested (only the
fixture's own final removal does), and the Kitsune remover checks library text alone, so any order
reaches the same tree. All eight live fixtures pass in the new order.

## Adding a release to the chain

A release belongs in `CHAIN` if it was built after Phase 11 and any earlier chain release's live
fixture would otherwise see it in the tree. That is every release from Phase 11 on, because each
changes the build every earlier restore point was measured against.

1. Add `Release("<folder>", fragment="src/sheet/…")` at the **end** of `CHAIN`, or
   `absent_text=(file, text)` for a fix that only deletes text.
2. Give its own fixtures `THIS_RELEASE = "<folder>"` and the `_removal_chain()` locator above.
3. Run `python3 qa/test-chain.py` here. It fails if a `src/sheet/209.*` fragment after the chain's
   first one is not registered.

## QA

| Check | Result on this desktop (Windows, Python 3.14) |
|---|---|
| `qa/test-chain.py` (registry, consumers, live strip) | **11/11** |
| The eight converted `test-removal.py` suites | **all pass**: 15, 15, 15, 15, 15, 15, 10 and 15 tests, **one skipped in each** (the symlink test: Windows refuses symlinks without Developer Mode; cloud runs have passed it) |
| `qa/verify-variants.py`: six scratch copies of `Versions/` | **all as expected**, below |
| Sheet build | Unchanged, `738c7ccf…`; combined suite **2,435/2,435** on this desktop before the change, which changes no source |

The variants show the registry is load-bearing:

| Variant | Phase 11 live fixture | Kitsune live fixture | Registry checks |
|---|---|---|---|
| Unbroken | passes | passes | pass |
| Import fix not registered | **fails** | — | **fail** (unregistered fragment) |
| Kitsune fix not registered | **fails** | — | — |
| 11.2.3 and 11.2.4 out of order | **fails** (11.2.3's remover refuses) | — | — |
| Phase 11 not registered | **fails** (`ChainError`) | — | — |
| Text fixes never removed | **fails** | — | **fail** |

## Not verified

- ~~The converted `verify-variants.py` files were not run in full.~~ **Run in full on 25 September,
  after BUGFIX — Apply School Skill Rows joined the chain:** Phases 11, 11.2, 11.2.1, 11.2.2 and
  11.2.3 and the Kitsune fix each report "all fail where expected", including every "phase removed"
  variant, which strips later releases through this registry. Two of them first crashed on Windows,
  not on the registry: they decode the harness output with the platform default (cp1252), which
  cannot read the harnesses' curly quotes. Run with `PYTHONUTF8=1`, both pass.
- The registry's own checks were run on Windows only. Nothing in them is platform-specific, but a
  cloud session has not run them yet.

## Files

| File | What it is |
|---|---|
| `removal_chain.py` | The registry: `CHAIN`, `strip_later`, `later_than`, `is_present` |
| `qa/test-chain.py` | Its checks |
| `qa/verify-variants.py` | The sabotage variants above |
| `originals/` | Verbatim pre-change copies of the 14 fixture files, for rollback |
| `ROLLBACK.md` | How to undo this |
