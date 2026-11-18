# G5 (A08 alone) negative-variant pins — prepared before any run

18 November 2026 (Claude). Frozen candidate `6d47849b1dcb5aa8ac4140b1895d1f0d713426092530e183ff87c3fc4d7c44b1`, 17,685,928 bytes (A08, the group's only unit since A12 was withdrawn), on `claude/release-15a-a08` at `6dd99349`. Baseline: the automatic-entries group as live, commit `c5dd578b`, application `99b76d625c04e6aa22ba8508005975525bbece945b82ead8c443b593e58115b8`, 17,675,311 bytes. Every exact failed-check id is in `variants.json`.

**What is known and what is reasoned.** The baseline's count is known: A08's harness gave 10/21 on AE3 (the automatic-entries group as live) during the light checks, and A08's README names the ten that pass; the eleven failing ids follow from that list. **Every other prediction is reasoned from the harness's oracles and the source, not taken from a variant run.** Two timings in the sheet decide several of them: History (AL71) writes an entry 1.5 seconds after the last click, input or change (`QUIET_MS`, `api.schedule`), and CE7 keeps Undo for 20 seconds after a tap.

5 mutations (switch off, and four focused defects) plus 1 baseline. Each mutation changes exactly one unique string in a scratch copy of the frozen page (`--dry-run`: all five unique). A08 has no stylesheet, so there is no stylesheet case. The discovery runs once; any correction is explained here before the qualification chain. No full-suite discovery, retries or widened assertions. A08's harness keeps every step inside a check, so no pin needs the automatic-entries group's "pinned stop" form.

| Case | Mutation | Predicted failures |
|---|---|---:|
| A08:baseline (count known) | the automatic-entries group as live | 11 |
| A08:disabled | `QUICK_TAP_UNDO_ENABLED = false` | 11 |
| A08:no-catch-up | Undo's catch-up never runs (`const p = null`) | 8 |
| A08:no-merge | History's entries never merged (`merge(g)` not called) | 3 |
| A08:no-edit-end | an edit elsewhere no longer ends a group (the `input` and `change` listeners not added) | 1 |
| A08:no-click-end | a click on another control no longer ends a group (the `click` listener not added) | 1 |

## Why each case fails where it does

- **Baseline** (no `QT15`): each tap is its own change and Undo takes back only the last. Fail: the seam; the quick burst (Undo leaves 4.9); the spaced taps (Undo leaves 4.9) and their History (three entries, one per tap, since the taps are two seconds apart); Undo inside the window (4.8 left, and one entry); − and + (4.9 left); moving pages (4.8 left); the History menu (two entries); Taint (2.5 left); the save data after Undo (not the data before); the listed character in Play (three entries in the stored copy, and Undo leaves 5.1). Hold: one tap, a gap over five seconds, another card, a typed value, Recognition, an edit elsewhere, opening the character, Save after two quick taps (History writes one entry for them anyway, as the save flushes it), and no page errors on either size.
- **Disabled** (`QT15` present, `install()` returns at once, `installed` false): the same eleven as the baseline.
- **No catch-up** (the group forms, its message and History merge work, but Undo is CP7's alone): Undo takes back only the last tap wherever a group of two or more is open or pending. Fail: the quick burst, the spaced taps, Undo inside the window (4.8 left; History then holds one entry 4.7→4.8, which the merge leaves, being one real change), − and +, moving pages, Taint, the save data, and the listed character (Undo leaves 5.1). Hold: the seam, one tap, the spaced taps' History (merged by the timer, 4.7→5.0), a gap over five seconds, another card (Glory's single tap is undone by CP7 as before), the History menu (the third tap is a group of one), Save, every laptop check that ends the group before Undo, and no errors.
- **No merge** (groups and Undo work; History keeps one entry per written tap): fail where taps are more than 1.5 seconds apart, so History has written each one: the spaced taps' History (three entries), the History menu (4.7→4.8 and 4.8→4.9), and the listed character's stored History (three entries). Hold everywhere History never wrote a tap separately: Undo inside the window and Taint (taps and Undo inside 1.5 seconds cancel out, so no entry), and Save after two quick taps (one entry anyway).
- **No edit end**: only the edit elsewhere. Typing the age neither ends the group by its `input` event nor, when the + button takes focus, by its `change` event; the + itself is the open card's own control, so the second tap joins: "Undo takes back all 2 taps." instead of the plain message. The typed value still ends a group through `CP7.commit`, and Recognition and the History menu end it through the `click` listener.
- **No click end**: only the History menu. Opening it no longer ends the group, so History shows the two taps separately (4.7→4.8 was written at 1.5 seconds, the second tap at the check), and the third tap after closing it joins the group. Save still ends a group through CE7's expiry, and Recognition through `CP7.commit`; the stored History is one entry either way.

## Counts pinned before full QA

Candidate: the automatic-entries group 7,380 + A08 21 = **7,401**; 202 leaves (`candidate-list.json`: A08's harness, then the automatic-entries group's 201 in its order).
Retained, A08 removed (the automatic-entries group as live): AE1 13 + AE2 21 + AE3 20 + the automatic-entries group's retained 7,253 = **7,307**; 199 leaves (`retained-list.json`: the group's 201 less the two live-site leaves, 5a's `sw-checks.js` and 5b's `notice-checks.js`, as G1 to the automatic-entries group ran their retained passes).
4× CPU screen: **163 leaves**, the automatic-entries group's 161 (its pattern, kept), A08's harness, and the undone-change fix's harness, which the added Phase 7 terms (compact controls, card editing, History) pick up.

The group removal must restore the automatic-entries group as live exactly, by the removal chain and by A08's own remover; AE3 (the unit before the group) is removed with A08 kept, and A08's harness runs in full on that build. A08 declares no conditional in another layer's tests. A light run of the removal proof before the chain: `light/removal-group-light-run.log` (9/9; its first light run, `light/removal-group-light-run-1-script-error.log`, passed all nine checks but the script could not add up a regex match, fixed with `bool()` before this record). A08 changes values in Undo and History, so the group is behaviour tier: the 4× CPU screen and two full passes follow the chain.

## Discovery

Discovery ran once on 18 November 2026, after the predictions were committed and pushed (`d7262389`). Evidence: `variants-discover.log` and `variants-discover-6d47849b/summary.json`. **All 6 cases matched every predicted id exactly**, each with its pinned count: baseline 10/21 and disabled 10/21 (the same eleven failures), no-catch-up 13/21, no-merge 18/21, no-edit-end 20/21, no-click-end 20/21. No correction was needed; the qualification chain asserts every pin as written.
