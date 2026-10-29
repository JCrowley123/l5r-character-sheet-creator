# Rollback

Quickest: set `STATION_REFERENCE_ENABLED = false` and rebuild; Search then has no Stations and Shapeshifters category, and the older Search checks expect exactly what they did before.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). Later releases come off first through `QA — Removal Chain Registry/removal_chain.py` (`strip_later`). It removes this layer's fragment, its manifest entry and the `station-seam` block; the rebuild is then exactly `6c0a3f47b5b13c5299090ccc433afa2b951575d458e71e84c4b7ae847a16e21b`, 17,401,083 bytes.
