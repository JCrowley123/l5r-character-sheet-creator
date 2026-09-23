# Phase 4.5.16 — Heart of Vengeance

A06, the first production provider for Feature 4.5.15's roll declaration registry. **Implemented and verified, 23 September 2026.**

| Scope | Detail |
|---|---|
| Rival | One Clan or other faction saved on the row (`factionPick`, revision 1). Suggestions list the major and minor Clans and the Imperial families from the sheet's own family catalogues, plus the Brotherhood of Shinsei; any other faction can be typed, because Core p.150 gives no closed list |
| Price | 5 XP, or 4 for a Spider character (Clan field) |
| Roll | In the roll preview of **Skill, Trait, Ring and dice-tray (manual)** rolls: an unticked `Contested against <rival> — apply +1k1`. Never offered on attacks, damage, spell casting or initiative. Unticked on every roll, never saved, disarmed by cancel, and bound to that one roll |
| Several rivals | One option per distinct faction (case/space/apostrophe-folded); however many are ticked, **+1k1 applies once**, because a Contested Roll has one opponent |
| Not included | No tracking of other characters and no automatic "is this Contested?" judgement; the player declares it |

Source: `SOURCE-OTHER-PREPARATION.md` A06 (Core printed p.150 / PDF p.153) and the approved audit design. The source says "any Contested Roll"; excluding attacks and spells is the owner's approved companion-app boundary, not a rules claim, and the information panel says so in player terms.

Restore point recorded before any edit: commit `45d0f489081de3c5740c60b74afb0714396b6a6d` (4.5.15), **2,739,496 bytes**, SHA-256 `1d8aa345b8c054cca212bd57a57acb49cb593bf4b7805cec0438a171537a70e4`, **1,406/1,406**.

## Measured QA — 23 September 2026

Final Phase 0 output: **2,753,162 bytes**, SHA-256 `0aefe9c90c964eb50132bd0782b433648fee31ca069d7fc3a5c35615ea98163a` (pinned).

| Check | Measured result |
|---|---|
| New real-browser suite | **91/91** |
| Full combined suite | **1,497/1,497** = 1,406 retained + 91; one retained fixture corrected (below) |
| Real dice | Declared Skill, Trait, Ring and manual rolls each roll 6 dice / keep 4 from 5k3; the next roll of each is unticked and rolls 5 / 3; an attack preview offers nothing; two rivals ticked still give 6k4; a confirmed declaration does not reach a roll that skips the preview |
| Surgical removal | **Byte-identical** to the restore point (2,739,496 bytes, `1d8aa345…`); removed copy verifies; **1,406/1,406** retained on those bytes |
| Dependency on 4.5.15 | 4.5.15's remover **refuses** while this release is present (exit 2, names `209.928-feat-adv-heart-vengeance.js`, writes nothing). Removing this release, then 4.5.15, rebuilds **byte-identical** to 4.5.14's `61de1d40…` (2,730,118 bytes) |
| Remover fixtures | **45 run, 45 passed, 0 skipped** |
| Ownership scan | 15 surface names, every reference inside `PART I FEATURE 4.5.16` blocks; exit 0. 4.5.15's scan now exits 1 with exactly two references, both this release's registration of its provider — the declared dependency |
| Recombine / drift / inventory / registry | Exit 0 / exit 0 / no differences / seven seats |

### Deliberately broken builds (one run, 292 s)

| Mutation | Result | What failed |
|---|---|---|
| Kill-switch off | **4/25** | Every feature group; modal-dependent groups abort |
| Own stylesheet removed | **87/91** | The four geometry checks |
| Spider price removed | **90/91** | `HV-PRICE-SPIDER` |
| Offered on attacks | **89/91** | The two attack-exclusion checks |
| +1k1 per ticked rival | **89/91** | The two once-per-roll checks |
| Rivals not de-duplicated | **90/91** | `HV-ONE-OPTION-PER-FACTION` |
| Blank faction accepted | **90/91** | `HV-INVALID-EMPTY` |
| Provider never registered | **56/68** | Every offer and dice check; sections abort |
| Inline error hidden | **90/91** | `HV-REJECT-EMPTY` |
| Brotherhood suggestion dropped | **90/91** | Only that suggestion check |

### Cross-phase fixture correction

4.5.15's `RD-NO-PRODUCTION-PROVIDER` asserted that no provider is registered — true only while this release is absent. It now ignores `heart-vengeance` exactly when `HV4516` is present: the conditional shape Phase 1.5 (Part G) and 4.5.10 established. Measured both ways: 53/53 on the 4.5.15-only build, and within 1,497/1,497 with this release.

A harness bug was found and fixed before recording results: `open()` first returned the in-flight roll promise from an `async` function, so `await open(...)` waited for a roll nobody had confirmed — the exact trap 4.5.10's harness documents. It now returns the promise wrapped.

The row, editor and declared preview were inspected at 375px with fallback fonts only (webfonts cannot load here). Physical iPhone testing remains open.

A known stale comment, not fixed here to keep 4.5.15's bytes stable: its fragment header and manifest note say "three older hardwired declarations"; the measured count is four (Kharmic Tie, Maigo no Musha, Ebisu, Jurojin), as its README states.

## Run

`NODE_PATH=/opt/node22/lib/node_modules node qa/current-suite-runner.js <built html>`; `qa/verify-variants.py --node <node> --retained`; `qa/test-removal.py`.

## Cost

Exact token counts are not exposed to this session; none is estimated. Production surface: one JS fragment, one stylesheet, one guarded seam block, two manifest entries; nothing added to the roll preview itself.
