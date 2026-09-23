# Phase 4.5.18 — surgical rollback

Restore point recorded before this release: commit `bfd82eef4fa38b516bfea36cd38a031adf4bccbc`, Phase 0 build **2,767,985 bytes**, SHA-256 **`be9076cfbebc3fac31641a03fab82508b35a7c06caf961e347e546151930115a`**.

## Owned surface

- `src/sheet/209.9295-feat-adv-paragon.js`: `P4518`, `ADV_PARAGON_ENABLED`; registers the `Paragon` schema (`paragonTenet`, effect `p4518Reminder`); wraps `isExtendedAdvConfigComplete`, `resolveAdvDisadvEffect`, `refreshAdvConfigControl`, `openExtendedAdvConfigModal` and `confirmExtendedAdvConfigModal`.
- `src/css/59.94-adv-paragon.css`: `p4518-picker`, `-legend`, `-option`, `-error`, `-row`, `-badge`, `-warning`, `-reminder`, `-info`.
- One block in `src/sheet/210-test-seam-and-init.js`: `paragon-seam` (`END P4518`).
- Two compact manifest entries; `expect_sha256` is recomputed by the remover. Radio group `p4518Tenet`; row dataset key `p4518Name`; config type `paragonTenet`.

## Procedure

`qa/remove-phase.py <explicit scratch Phase-0 path>`, then that copy's `build/recombine.py`. Never run any remover against the live tree.

## Dependencies

- **Hard dependency on base Phase 4.5** (both `209.8` and `209.81`): schema registration, config read/write, the row helper, the shared modal and its extended-modal state, `commitExtendedAdvConfig`, `advConfigCharacterClan`, and the five hooks it wraps. Declared in the base ROLLBACK.
- **Trunk only otherwise:** the info overlay (`populateInfoOverlay`, Part C Feature 2) and `setStatus`.
- **No dependency on 4.5.13–4.5.17** in either direction; measured against 4.5.17 in both removal orders. No other phase references Paragon's surface (ownership scan exit 0).
- **Not shared with Phase 4.5.2:** Failure of Bushido's config type is `tenetPick`; this release deliberately uses its own `paragonTenet`, and a `tenetPick` config saved on a Paragon row is treated as unreadable (`P-INVALID-DISADV-TYPE`).

No registry seat, roll modifier, markup, cross-phase fixture correction or top-level save change.

## What removal does to characters

Measured on the removed build with Lion and Crab characters:

- **The saved tenet stays** in the row's config, byte-for-byte, through save/export. Phase 4.5.3 shows the row as "Saved setting kept — this build cannot show it". Re-installing this release reads it back as configured.
- **The row keeps its saved cost** (6 for a Lion purchase, 7 otherwise). Nothing reprices Paragon any more: an unconfigured row keeps the cost it was saved with, and a newly added one takes the catalogue's 7 even for a Lion character, with no picker (the pre-release behaviour).
- Nothing else on the character was ever changed by this release, so nothing else needs undoing.

## Proof

Measured 23 September 2026: the 2,780,550-byte build (`96dda731ef0cf9670fe2c65763bf28e2a73698972e7d8f49014ac598c728385a`) removes to **exactly 2,767,985 bytes**, `be9076cf…`; the removed copy verifies; **1,584/1,584** retained checks pass on those bytes. Live **1,664/1,664**. With 4.5.17 removed first: this suite 80/80 and older suites 1,497/1,497; both removed in either order: byte-identical to `0aefe9c90c964eb50132bd0782b433648fee31ca069d7fc3a5c35615ea98163a` (2,753,162 bytes). Fixtures 45/45, no skips. Inventory unchanged; seven registry seats.
