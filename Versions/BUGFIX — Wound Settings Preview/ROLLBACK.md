# Rollback

Depends on Campaign Wound Multipliers. Optional guard disables the preview if that layer is off. No dependency on Characteristic Card Editing. Remove this layer first when removing the campaign setting; the chain does so.

Use qa/remove-phase.py only on a scratch Phase0 tree. Removes own fragments ['src/sheet/209.9999999999984-bugfix-wound-preview-logic.js', 'src/sheet/209.9999999999985-bugfix-wound-preview-ui.js', 'src/css/59.9999999976-bugfix-wound-preview.css'], manifest entries and WP7 preview-seam in210-test-seam-and-init.js, then rebuild --verify. Exact predecessor ac59ef11ee32eb97852c1140e8fb5040b8530c9dd03f6dd3296b50cacda6a919,17344141 bytes. (Superseded: see the 28 October update below.)

Current-tree removal6/6 passes. Ownership scanner predates tagged BUGFIX markers: its7 reported hits were inspected and all are WP7-owned fragment/seam lines. The strict remover recognizes the full tag and rejects foreign blocks.

28 October update: the exact predecessor is now fc268dd274c03a80f9715026d13ef8706958e75f33ce11900eda84c95232f4ef, 17346510 bytes (the card-editing layer after both reviews). qa/remove-phase.py and qa/test-removal.py carry the new hash; removal 6/6 passes against it.

Full suite, 28 October: both runs removed both layers through the registry and rebuilt main e58fe09 exactly (4f2ebd5b6ec932010983906dff5f8c76c52c8116b680fb0d2d461c722d130e5f, 17336656 bytes); the retained suite then passed 6,228/6,228.
