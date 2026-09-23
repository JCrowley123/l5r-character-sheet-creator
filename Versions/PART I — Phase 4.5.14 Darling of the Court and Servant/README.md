# Phase 4.5.14 — Darling of the Court and Servant

Second fresh, bounded batch of the approved A01–A16 work. **Implemented and verified, 23 September 2026.** This is not completion of all A01–A16. A push is not proof of a completed deployment or a refreshed device cache.

| Entry | Scope |
|---|---|
| A04 Darling of the Court | Every purchased court on **one** Advantage row: add, rename and remove courts in one editor; duplicate courts refused. 2 XP per court, 1 XP per court for a Courtier School (three courts: 6 / 3 XP). One selected court and one persisted "Court in session" toggle. A contextual readout — `Status 3 — counts as 4 at Kyuden Bayushi (in session). Actual Status unchanged.` — that never writes Status. |
| A11 Servant | Reference only: a row badge and an accessible circled-i with the Core p.153 rules and all nine sample servants. No servant record, upgrades, NPC sheet, cost change or player-Skill effect. |

Stage 2 was split at the owner's approval (23 September): **A06 Heart of Vengeance is the next, separate batch**, because it would be the fourth per-name declaration hardwired into Phase 3's (Part G) roll preview and 4.5.10's ROLLBACK flags four as the point to decide whether to generalise instead. That design question goes to the owner before any A06 code. Wealthy's 2-koku-per-rank grant and the rest of A01–A16 remain pending.

## Source and boundary decisions

Source: `SOURCE-OTHER-PREPARATION.md` (A04: Core printed p.148 / PDF p.151; A11: Core printed p.153 / PDF p.156) and the approved AUDIT.md addendum. Restore point recorded before any edit: commit `9dd3fef0c86e4494ef5ceb75a47e502ec78d0639`, Phase 0 build **2,704,237 bytes**, SHA-256 `1e2683d81ddab13662f76c62ca8c595d521d633f6cc66a512169661cd85b8326`, combined suite **1,128/1,128**, 270 unique IDs, 10 sections, 26 overlays.

**Darling of the Court.**

- *Courtier price.* The sheet had no Courtier classifier. A School counts as a Courtier School when its library name says so — as its title (`Doji Courtier`) or as the bracketed type tag the library uses otherwise (`Kitsuki Investigator [Courtier]`, `Order of Ebisu [Monk/Courtier]`). Every School the character has trained counts, the way `characterCasterLock()` reads the same list. **Declared interpretation, not a quotation:** an Artisan School without a Courtier tag (e.g. `Kakita Artisan`) pays the normal 2 XP. The harness pins this as `CS-COURTIER-UNTAGGED-ARTISAN` so an owner ruling the other way changes one visible check. The same test will be needed by A12 Soul of Artistry.
- *Unconfigured row.* A newly added or legacy row without a court list is priced as **one** purchase (2, or 1 for a Courtier) and flagged "Name your court". A legacy save therefore keeps the price it already paid; nothing is silently repriced to zero.
- *Duplicate rows.* A second Darling row (a legacy save, or a second quick-add) keeps its own price and is flagged "Keep every court on your first Darling of the Court row"; it gets **no** selection or toggle, so the sheet only ever shows one session toggle. Its editor says the same thing.
- *Selection and session.* Selecting a different court **clears** "Court in session": being in session at one court says nothing about another. A rename in the editor keeps the selection (and its session state) on the renamed court; removing the selected court selects the first court, not in session. An omitted `selected`/`inSession` on import means first court, not in session — never a guessed higher Status.
- *Session toggle persists.* It records an ongoing situation (attending a court in session), as the audit's A04 config shape proposes, unlike Heart of Vengeance's per-roll declaration, which must not persist.
- *Duplicate detection* ignores case, surrounding/internal repeated whitespace and straight/curly apostrophes, using the sheet's own `normalizeAdvName()` fold.
- The readout reads `f_statusRank` and nothing else; `f_statusRank`, `f_statusPts` and Blackmailed's price are checked unchanged with the toggle on. No dice, roll modifier or registry seat.

**Servant.** No configuration schema, so quick-add opens nothing. The row cost stays the library's 5 and stays whatever the player types (for a Clan discount or upgrades) through recalculation. The reference states: base 5 before the listed Clan discount; typical Traits 2 and one Skill at 3; +3 points per extra Skill Rank or Emphasis at purchase; up to twice Status Rank in servants (with the character's current figure); and the nine samples with notable ability and listed discount, marked "not a complete list". No discount is auto-applied without a recorded servant type, per the source note. An imported Servant row that carries some future servant-record config keeps it and says so.

## Persistence

| Entry | Config type | Persisted fields |
|---|---|---|
| Darling of the Court | `courtList`, revision 1 | `courts` (non-empty, unique strings), `selected` (one of `courts`), `inSession` (boolean), compatibility `value` |
| Servant | none | nothing is written |

The existing schema-3 opaque config serialization is reused; no top-level save schema or resource store is added. Unknown fields, a future revision, duplicate/empty/non-string courts, a selection not in the list, a non-boolean toggle or a different type are preserved byte-for-byte, flagged "Saved setting kept", keep their saved cost and render no controls. A config on the wrong list is flagged. An explicit live rename discards the row's former pick, exactly as 4.5.13 does, including a rename from another configured entry (checked with base 4.5's Elemental Blessing, so this harness does not depend on 4.5.13).

## Validation and regression matrix

| Area | Risk | Acceptance tests |
|---|---|---|
| XP | High | Blank row priced as one; 1 and 3 courts at 2 each; Courtier by title and by tag at 1 each; Bushi and untagged Artisan at 2; totals; recalculation idempotent; cancel keeps courts and price; removing a court reprices |
| Configuration | High | Duplicates by case, whitespace and apostrophe; empty line; no courts; trimming; inline `role=alert` error visible in the open modal |
| Selection/session | High | One radio checked; select resets session; rename keeps selection; remove-selected resets; add keeps; one session toggle on the sheet, including with a duplicate row; focus returns to the equivalent control after the rebuild |
| Contextual Status | High | Readout +1 only in session, never +2; follows a Status change; `f_statusRank`/`f_statusPts` unchanged; Blackmailed cost unchanged by the toggle and still follows actual Status |
| Servant | Medium | No modal, no schema, library price, manual cost kept, repeatable, all nine samples verbatim, rule text including the current 2×Status figure, no Skill change |
| UI | Medium | Real clicks on radios/toggle; circled-i on row and inside the editor; nested info returns to the editor unchanged; escaped user text; long unbroken names; 320/375/768/1440px; 16px inputs; labelled inputs; named Remove buttons; ≥32px touch targets; readable, non-uppercased row labels |
| Persistence | High | Real export download → import upload; browser save → reload → load; schema 1/2/3 legacy rows; minimal import; eight invalid shapes preserved; wrong list |
| Isolation | High | Skills, equipment, weapons, Disadvantages, techniques, Traits, Rings, Void and spell slots unchanged; only XP fields change; every roll kind's modifiers unchanged; registry exactly seven seats |
| Removal | High | Scratch-only surgical removal byte-identical to the restore point; all retained suites on the removed bytes; removal order with 4.5.13 both ways; remover refusal fixtures |
| Harness sensitivity | High | Kill-switch off, stylesheet absent and eight targeted mutations must each turn intended checks red |

## Measured QA — 23 September 2026

Final Phase 0 output: **2,730,118 bytes**, SHA-256 `61de1d40772cb00abba41f7ab5d2d151027b3554545d04e4f8bf127d39adaa48` (pinned as the manifest's `expect_sha256`).

| Check | Measured result |
|---|---|
| Before implementation | **1,128/1,128** retained checks on `9dd3fef` |
| New real-browser suite | **225/225** |
| Final build, full combined suite | **1,353/1,353** = 992 + 136 + 225; zero retained checks removed or edited |
| Removed build, retained combined suite | **1,128/1,128** on the exact removed bytes |
| Recombine `--verify` / `build.py --check-drift` | Both exit 0 |
| Structural inventory | No differences: 270 unique IDs, zero duplicates, 10 sections, 26 overlays, 3 scripts, 2 styles, balanced tags |
| Surgical removal | **Byte-identical** to the restore point: 2,704,237 bytes, `1e2683d8…`; the removed copy's own `recombine.py --verify` exits 0 |
| Removal order with 4.5.13 | 4.5.13 removed while this release stays: this suite **225/225** and the pre-4.5.13 suites **992/992**. Both removed, 4.5.14 first **and** 4.5.13 first: each **byte-identical** to 4.5.13's own restore point, 2,689,172 bytes, `c7063f52…` |
| Saved data across removal | `qa/saved-after-removal.js` **13/13**: a saved court list opened by the removed build is preserved byte-for-byte, flagged by 4.5.3's unknown-config handler, keeps its 4 XP, survives a second save, and the live build reads it back fully configured. Negative control (live build passed as "removed"): **10/13** |
| Remover safety fixtures | **45 run, 45 passed, 0 skipped** — on Linux the two real-symlink fixtures that Windows skipped for 4.5.13 actually ran |
| Roll isolation | Every roll kind's modifier result unchanged with a court in session; registry exactly seven seats |
| Ownership scan | `feature-dependencies.py`: 31 surface names, every reference inside `PART I FEATURE 4.5.14` blocks; exit 0. 4.5.13's own scan still exits 0 with this block after it |
| Source line endings | No CR byte anywhere in Phase 0 `src/` |

### Deliberately broken builds

All measured in one `verify-variants.py --retained` run (353 s), each in its own scratch copy.

| Mutation | Result | What failed |
|---|---|---|
| Kill-switch off | **43/63** | 20 feature checks/groups; modal-dependent groups abort, so the denominator is not 225 |
| Own stylesheet removed | **209/225** | Exactly the 16 geometry, long-row, label-readability and touch-target checks (four widths) |
| Courtier price removed | **220/225** | Only the five Courtier-price checks |
| Duplicate-court check removed | **201/209** | The case-duplicate rejection and the imported-duplicate preservation checks; the validation group aborts |
| Selecting a court keeps the session | **220/225** | Session reset and the four checks downstream of it |
| Readout +2 instead of +1 | **220/225** | The five contextual-Status readouts, including `CS-NO-STACK` |
| Inline error hidden | **220/225** | Only the five `CS-REJECT-VISIBLE-*` checks |
| Controls rendered on a configured duplicate row | **222/225** | The three configured-duplicate checks |
| One servant sample dropped | **224/225** | Only `CS-SERVANT-SAMPLE-Sohei` |
| Foreign rename keeps the old config | **223/225** | Only the two foreign-rename checks |

**The first variant run found a blind spot in this harness.** "Controls rendered on a duplicate row" passed 218/218, because the only duplicate row the suite built was *unconfigured*, where "no controls because duplicate" and "no controls because unconfigured" look identical. Seven checks with a configured duplicate were added (including promotion to primary when the first row is deleted); the same mutation now fails 222/225. That is why the suite is 225, not the 218 of the first full run.

Two harness corrections happened during development, both test-side: clearing `f_schoolsData` falls back to the `#f_school` **display** field (CLAUDE.md's "displays, not state"), so the check now sets a non-Courtier School explicitly; and the foreign-rename check was moved off 4.5.13's Blackmail onto base 4.5's Elemental Blessing so this suite survives 4.5.13's removal. One production correction: the carousel's `body.car-active .car-page label` rule shrank the row's court labels to its .66rem uppercase caption size; the row selectors now carry three own classes and `CS-ROW-CONTROLS-READABLE-*` pins it.

The court editor and both rows were visually inspected at 375px. The loaded-webfont set in this sandbox is **empty**: these are fallback-font observations, not proof against Shippori Mincho / Noto Sans JP. Physical iPhone testing remains the owner's device pass. The print stylesheet was not changed; like every other configured row, the Darling row's controls print as they appear.

## Run

`NODE_PATH=/opt/node22/lib/node_modules node qa/current-suite-runner.js <built html>` chains the unchanged 4.5.13 combined runner and this batch's harness; a missing or 0/0 suite is a failure.

`qa/verify-variants.py --node <node> --retained` works only in temporary copies: structural comparison, kill-switch/stylesheet/targeted mutations, byte-identical removal with every retained suite on the removed output, and removal order with 4.5.13. `qa/test-removal.py` exercises the remover's refusal fixtures. `qa/saved-after-removal.js <live.html> <removed.html>` checks saved data across a removal; build the removed copy with `qa/remove-phase.py` first.

## Measured cost

Exact input/output/total token counts are not exposed to this session; none is estimated here. The session's remaining context-window counter is not a batch cost and is not recorded as one. Production surface: one JS fragment, one scoped stylesheet, one guarded six-line seam block, two manifest entries; no markup, dice-engine, catalogue or save-schema edit.
