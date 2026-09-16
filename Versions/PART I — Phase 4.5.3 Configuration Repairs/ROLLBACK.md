# Rollback — Part I, Feature 4.53 (Configuration Repairs)

Marker: **`PART I FEATURE 4.53`**. Block delimiters: `PART I FEATURE 4.53 BEGIN <slug>` …
`END REPAIRS453 <slug>`.

Two ways out, in order of preference.

## 1. Kill-switch (instant, reversible, no rebuild of anything else)

In `src/sheet/209.89-feat-adv-config-repairs.js`:

```js
const ADV_CONFIG_REPAIRS_ENABLED = false;
```

Rebuild. Every repair goes quiet at once and the sheet behaves exactly as it did before this
release: the two entry prices go back to a flat 4, the three catalogue rows go back to their
previous values, Friendly Kami stops checking for a Shugenja School, Great Potential stops
reaching attacks, the loose validation returns, unknown configs are dropped again, and effects
are read from whichever list they sit in.

Measured: the suite reads **18/39** against that build, versus 39/39 with the switch on.

## 2. Surgical removal (permanent)

```bash
cp -r "<Phase 0 tree>/src" "<Phase 0 tree>/build" /tmp/scratch/
python3 "qa/remove-phase.py" /tmp/scratch
```

The script refuses the live Phase 0 tree outright — pass a copy. It validates everything before
writing a byte, then rebuilds and **requires** the result to match the recorded pre-release
build. Run it with `--dry-run` first to see the plan without changes.

What it removes:

| Target | What goes |
|---|---|
| `src/sheet/209.89-feat-adv-config-repairs.js` | the whole fragment |
| `build/manifest.json` | its one fragment entry |
| `src/sheet/210-test-seam-and-init.js` | the `repairs-seam` block |
| `src/sheet/209.8-feat-adv-config.js` | the `stale-header-note` block |
| `build/manifest.json` | `expect_sha256` pointed back at the pre-release build |

That last one matters: without it the rolled-back tree is self-inconsistent, because
`recombine.py --verify` would compare the restored output against the hash of the build this
release produced and report a failure that is not one. Verified after a real removal — the
rolled-back tree reports `BYTE-IDENTICAL to the pre-split build` under `--verify`.

**Recorded restore point.** The rebuild after removal must be:

```
2,476,062 bytes
sha256 27b57eff316ee6f34f528e055a8d8adda6bb0d60ed7a951519ec12af35122ff2
```

That is byte-identical to the pre-release build. Verified on a fresh copy; the script fails
loudly if it ever stops matching.

The live build with this release present is **2,495,934 bytes**,
`18a740e8aeb334dac6a0405ec98c79edc6a450d5a09c8b7cfd715273f7b7b8c0`.

### Doing it by hand instead

If you remove the blocks manually, delete from the `BEGIN` line through the `END` line
**inclusive** in both shared files. In `210-test-seam-and-init.js` the `END REPAIRS453
repairs-seam` line is immediately followed by `// ---------- Init ----------` with **no blank
line between them** — that is deliberate, not a typo. The blank line above `BEGIN` is the
original file's. Leaving a blank line on both sides is exactly the mistake that made the first
removal attempt rebuild one byte heavy.

Remember to revert the manifest's `expect_sha256` to `27b57eff…` by hand as well — the script
does that for you, a manual removal does not.

## 3. The one file outside this folder that is not covered by either

`Versions/PART I — Phase 4.5 Modal-Configured Advantages-Disadvantages/qa/adv-config-harness.js`
carries a **fixture correction**, not a code change. It is a QA file, is not a build input, and
does not affect the byte-identical rebuild above — but it is an edit to a previous phase's
folder and is listed here so it can be reverted.

The block labelled `FIXTURE CORRECTION (Part I Feature 4.53)`, immediately above
`// ---- Friendly Kami: +1k1 on Sense/Commune/Summon in the chosen Element ----`, adds:

```js
  await page.evaluate(() => {
    document.getElementById('f_school').value = 'Isawa Shugenja';
    document.getElementById('f_schoolDeficiencyElement').value = '';
    window.__L5R_TEST__.recalcAll();
  });
```

plus the explanatory comment above it. Deleting both restores the original fixture.

**You almost certainly should not revert it.** Reverting returns the harness to asserting that a
character with no School gets a Shugenja-only bonus. The corrected fixture reads 51/51 with this
release present *and* with it removed, so it is correct in both worlds; the original is only
"correct" against the defect.

## Dependencies

**This release depends on Phase 4.5 and Phase 4.5.2, and they do not depend on it.**

- It wraps `resolveAdvDisadvEffect`, `advConfigIsComplete`, `advConfigExtendedRollModifiers`,
  `activeAdvConfigEffects` and `refreshAdvConfigControl`, each time keeping the previous binding
  and delegating to it. Remove Phase 4.5 and this fragment's own guard
  (`typeof resolveAdvDisadvEffect === 'function'`) makes the whole release a no-op rather than a
  `ReferenceError`.
- It reads `ADV_LIBRARY`, `DISADV_LIBRARY`, `RINGS`, `normalizeAdvName`, `advConfigOptionsFor`,
  `advConfigRowFor`, `readAdvConfig`, `escHtml`, `ROLL_KINDS` and `characterCasterLock`. All are
  trunk or Phase 4.5 surface; none needs declaring beyond this line.
- It reads `D45.configTypes` when Phase 4.5.2 is present, guarded by
  `typeof D45 === 'object' && Array.isArray(D45.configTypes)`. With 4.5.2 removed, the known-type
  set is simply smaller and the unknown-config notice fires for more payloads — which is the
  intended behaviour, not a breakage.
- **Nothing depends on this release.** It declares exactly two names, `ADV_CONFIG_REPAIRS_ENABLED`
  and `R453`, and the only references to either outside its own fragment are in its own seam
  block. Confirmed by `qa/feature-dependencies.py`, exit 0.

**No registry seat.** The pre-roll modifier registry is untouched: same six baseline contributors
plus Phase 4.5's single `adv-config` seat at priority 60, asserted in both directions
(`R453-REGISTRY-01`, `-02`). Phase 1.5 still reads 35/35 with this release present and removed.

**No CSS.** The two row notices reuse `.adv-config-row.unconfigured` and `.adv-config-warn`,
which 209.8 already ships. There is no stylesheet block to hand back.
