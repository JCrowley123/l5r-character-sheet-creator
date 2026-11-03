# Removing Release 8c

The switch is `RANK_SPELL_CHOICES_ENABLED`. Two fragments implement the rules and the picker. They depend on the existing School records, Alternate Paths, Ancestors, character check, wizard picker, management mode and character saves. Remove 8c before removing its prerequisites.

From this release’s QA folder, run `remove-phase.py` on an external scratch copy of the Phase 0 tree. Then run the scratch tree’s `build/recombine.py --verify`. The remover refuses the live tree. It strips the two fragments, their manifest entries and the marked test block. The exact predecessor is Release 8b.1, 17,505,080 bytes, SHA-256 `1716feb4d43428c0e5a5ebff9d025ac2a353e0af91b8a30227df791d994226f7`.

The optional save field `rankSpellChoices` holds each School’s tracked ranks, unspent choices and redeemed spell names. The spell itself and its scroll are ordinary character rows. Release 8b.1 can read and use those rows. Resaving in 8b.1 discards the advancement record. After upgrading again, use the earlier-rank review to report only genuinely missing picks.
