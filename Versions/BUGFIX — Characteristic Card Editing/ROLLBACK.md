# Rollback

Run qa/remove-phase.py ONLY on an external scratch Phase0 tree, then build/recombine.py --verify. Remove entries/fragments ['src/sheet/209.9999999999982-bugfix-card-editing-logic.js', 'src/sheet/209.9999999999983-bugfix-card-editing-ui.js', 'src/css/59.9999999975-bugfix-card-editing.css'], and CE7 marked blocks in 120-persistence.js,210-test-seam-and-init.js and209.9999999999975-bugfix-compact-points-ui.js. Restores predecessor 4f2ebd5b6ec932010983906dff5f8c76c52c8116b680fb0d2d461c722d130e5f,17336656 bytes. Exact proof pending.

Depends on Compact Characteristic Controls, Social Rank and Points, Taint Points and Growth and Play/Management. Remove this layer first if removing those; chain entry handles ordered removal. No dependency on the forthcoming wound preview. Existing hidden controls remain for surgical rollback. The shared save hook is guarded; token avoids clearing a newer transaction when a slow save finishes.

Measured proof:6/6 safeguards pass; predecessor exactly17336656 bytes /4f2ebd5b6ec932010983906dff5f8c76c52c8116b680fb0d2d461c722d130e5f.

Ownership scan:16 hits inspected, all CE7-owned lines. The historical scanner reduces tagged BUGFIX markers to BUGFIX; the strict remover recognizes CE7 and proves exact surgery. No foreign caller found.
