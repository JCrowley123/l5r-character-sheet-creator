# Rollback

Run qa/remove-phase.py ONLY on an external scratch Phase0 tree, then build/recombine.py --verify. Remove entries/fragments ['src/sheet/209.9999999999982-bugfix-card-editing-logic.js', 'src/sheet/209.9999999999983-bugfix-card-editing-ui.js', 'src/css/59.9999999975-bugfix-card-editing.css'], and CE7 marked blocks in 120-persistence.js (save-token, save-identity, saved-feedback), 210-test-seam-and-init.js (editing-seam) and 209.9999999999975-bugfix-compact-points-ui.js (undo-expiry, undo-identity). Restores predecessor 4f2ebd5b6ec932010983906dff5f8c76c52c8116b680fb0d2d461c722d130e5f,17336656 bytes. Exact proof pending.

Depends on Compact Characteristic Controls, Social Rank and Points, Taint Points and Growth and Play/Management. Remove this layer first if removing those; chain entry handles ordered removal. No dependency on the forthcoming wound preview. Existing hidden controls remain for surgical rollback. The shared save hook is guarded; token avoids clearing a newer transaction when a slow save finishes.

Measured proof:6/6 safeguards pass; predecessor exactly17336656 bytes /4f2ebd5b6ec932010983906dff5f8c76c52c8116b680fb0d2d461c722d130e5f.

28 October (review follow-up): the two new blocks are removed by the same script; 6/6 safeguards pass and the predecessor is still exactly 17336656 bytes / 4f2ebd5b…30e5f. The wound preview layer, built after this one, is removed first by the chain; its own predecessor is now a2a2e9bb143c22f0afd0648746338b1c14e0d89223a742525a18d88ba3ca3f18, 17346020 bytes.

Ownership scan:22 hits inspected (16 before the follow-up), all CE7-owned lines. The historical scanner reduces tagged BUGFIX markers to BUGFIX; the strict remover recognizes CE7 and proves exact surgery. No foreign caller found.
