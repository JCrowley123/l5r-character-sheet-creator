# BUGFIX — Spell Slots Tab on Safari

On an iPhone the Spell Slots tab never appeared for a Shugenja: not after Apply School, not after
casting, not after re-checking. First reported during the Spell Slots Tab Visibility Race bugfix,
which closed a real timing gap but recorded that it could not reproduce the iPhone failure, because
no Safari engine was available. This fix finds and removes the actual cause.

## How it was found

A read-only diagnostic bookmarklet, run by the owner on the iPhone (iOS 18.7 Safari, private
browsing, fresh Isawa Shugenja), reported on 24 September 2026:

| Reading | Value |
|---|---|
| `characterCasterLock()` | `shugenja` |
| `#spellSlotsSection` inline display | `""` (the sheet had shown it) |
| `#spellSlotsSection` **computed** display | **`none`** |
| Spell Slots page `hidden` | `true` |
| `refreshVisibility()` | `false` (nothing changed) |

No rule hides `#spellSlotsSection` itself. **Safari reports `display:none` for everything inside a
hidden page; Chromium reports the element's own value.** The carousel's `targetHidden()` asked the
browser whether the section was displayed, so once the page had been hidden at load (no School yet)
the answer on Safari could never become "shown" again: the page stayed hidden for the session.

## The fix

When the page is currently hidden, `targetHidden()` removes the page's `hidden` attribute, reads the
section's computed display, and puts the attribute back, all in one synchronous step, so nothing is
painted in between. Everything else is unchanged. Two delimited blocks in `src/layer/10-carousel.js`
(`probe-switch` and `hidden-page-probe`), switch `SAFARI_TAB_PROBE_ENABLED`. No fragment, no
stylesheet, no seam change, no sheet code touched.

## QA

Chromium does not behave like Safari here, so the harness emulates it with **one test-only rule**,
`.car-page[hidden] #spellSlotsSection{display:none !important}`, which makes Chromium report exactly
what the iPhone reported. With it, the unfixed build reproduces the iPhone failure in Chromium.

| Measure | Result |
|---|---|
| Own suite, fixed build | **19/19** (`qa/safari-tab-harness.js`, emulated Safari and plain Chromium) |
| Own suite, previous build `339a9590…` | **14/19**: fails the five emulated-Safari checks (tab never appears after Apply School, after re-applying, or after loading a saved Shugenja); every plain-Chromium check passes on both |
| Switch off | 14/19, the same five |
| Probe that does not put `hidden` back | 11/19: the page is un-hidden behind the carousel's back, so no rebuild happens and the tab never appears in either mode |
| Combined | **2,123/2,123**: 2,104 retained + 19 new; no retained check changed (`qa/current-suite-runner.js`) |
| Build | **2,928,189 bytes**, SHA-256 `864c5134126ad8977bc39f764598aeda680c4db964bbafb8a755b88c9e5d4a04` |
| Surgical removal | **Byte-identical** to `339a9590bb9761441db94abb776afc1df9e260d2647114f6f706d297c011e726` (commit `8cbfa39`); `manifest.json` and `10-carousel.js` identical to that commit |
| Remover fixtures | **13/13** (`qa/test-removal.py`) |

## Device

- **Confirmed on the iPhone, 24 September 2026**: the Spell Slots tab appears once a Shugenja School
  is chosen. The owner re-ran the bookmarklet on a character with no School and it read `lock=null`,
  `pageHidden=true`, the correct hidden state for a non-caster. User agent: iPhone OS 18_7,
  Safari 26.6.1.

## Not verified

- Other conditional pages: Spell Slots is the only page with `data-visible-with` today; any future
  one gets the same treatment automatically.
