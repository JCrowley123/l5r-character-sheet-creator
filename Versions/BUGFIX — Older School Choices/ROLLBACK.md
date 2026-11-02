# Removing the older-School-choice correction

The layer uses the switch `OLDER_SCHOOL_CHOICES_ENABLED` and requires Release 8b’s School-choice pickers. Its own fragment, review control styles and test seam are registered as **BUGFIX — Older School Choices** at the end of the removal chain. The previous application is Release 8b at 17,484,443 bytes and SHA-256 `1eb9e017636829a941a8d9b0916fc2b0d0c81eefc97e2b8fd7d222f4ea02f322`.

On a scratch copy of the Phase 0 tree, use `qa/remove-phase.py` from this folder, then run the copied builder with `--verify`. The remover refuses the live tree. The existing 8b wizard and character check receive their previous behavior when this layer is removed.

Confirmed choices use the 8b row records. The optional `schoolReviewVersion` and `olderSchoolReview` fields distinguish current saves from unfinished older reviews. `reviewedScrollOnly` preserves the source of a reviewed scroll when only an Equipment row exists. Release 8b retains the character’s ordinary rows, ranks, quantities, and its own source records. Resaving in 8b drops the newer review fields. A subsequent upgrade can offer the review again for unclassified holdings. Remove this follow-up before removing its Release 8b prerequisite.
