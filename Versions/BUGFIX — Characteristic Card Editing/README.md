# Characteristic Card Editing

Management edits Rank/Points inside the four cards; Play retains read-only values. Recognition moves beside Glory/Status adjustment controls; Taint growth moves inside its card. Undo expires after20 seconds or successful manual save, without interrupting background autosave. Logic is separate from UI; switch CHARACTERISTIC_EDITING_ENABLED. Validation and writes reuse the existing rules; no save-format change.

Implementation checkpoint only. Own/affected checks, negative variants, visual verification, dependency scan, removal proof, one reviewer and full suites are pending. Do not treat this as release-ready.

Predecessor e58fe09: 4f2ebd5b6ec932010983906dff5f8c76c52c8116b680fb0d2d461c722d130e5f,17336656 bytes. Initial candidate ac59ef11ee32eb97852c1140e8fb5040b8530c9dd03f6dd3296b50cacda6a919,17344141 bytes.

27 October focused evidence: own31/31; predecessor and disabled1/31; four negative mutations plus baseline matched exact pins. Previous compact-card checks33/33; removal6/6 restores e58fe09 exactly. Broader affected checks, visual verification, review and full suites remain pending.
