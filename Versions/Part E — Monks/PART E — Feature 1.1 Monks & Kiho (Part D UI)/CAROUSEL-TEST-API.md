# Swipe-Tab Carousel — Test Harness Reference

Phase 7 seam for `l5r-character-sheet part C feature 8 mirumoto SWIPE.html`.

Exposed as **`window.__L5R_CAROUSEL__`**, mirroring the convention the sheet already
set with `window.__L5R_TEST__`: one namespaced export, additive, and deletable as a
single block without touching anything else.

The two seams are separate on purpose and complement each other:

| Seam | Owns | Nature |
|---|---|---|
| `window.__L5R_TEST__` | the sheet's calculations, dice, save/load | read-only |
| `window.__L5R_CAROUSEL__` | navigation and UI state | drives the UI, never touches character data |

A harness can drive the carousel with one and assert against the other. Nothing in
`__L5R_CAROUSEL__` reads or writes a character field, so navigating cannot perturb
any value a Part B / Part C test is checking.

---

## JS API

### Required surface

| Call | Returns | Notes |
|---|---|---|
| `goToTab(target)` | tab object, or `null` | `target` is an index (`7`), a slug (`'combat'`), or a label (`'Adv & Disadv'`). Out-of-range or unknown returns `null` and does nothing — it never throws. |
| `nextTab()` | tab object | Returns the tab being navigated **to**. |
| `prevTab()` | tab object | Returns the tab being navigated **to**. |
| `getActiveTab()` | tab object | The tab currently committed. |

### Supporting surface

| Call | Returns | Notes |
|---|---|---|
| `isReady()` | boolean | False before init, or while the track has zero width (hidden ancestor, print preview). Guard every suite on this. |
| `getTabCount()` | number | Visible tabs only — 9 when Spell Slots is hidden. |
| `getTabs()` | array of tab objects | In display order. |
| `whenSettled(ms?)` | `Promise<boolean>` | Resolves `true` when the track comes to rest, `false` on timeout (default 2000 ms). |
| `getState()` | object | Full snapshot, for printing on a failed assertion. |
| `version` | `'1.0'` | |

### The tab object

```js
{ index: 7,
  label: 'Combat',            // as shown on the tab
  slug:  'combat',            // matches the data-testid suffix
  tab:   <button.car-tab>,    // live DOM element
  panel: <section.car-page> } // live DOM element
```

### `getState()`

```js
{ index, label, count, loop, slot, offset, pageWidth, scrollLeft,
  trackChildren, clones, hiddenPages, skeletons, deferred, announced }
```

`slot` is the raw track position and includes the clone offset: `slot === index + offset`
whenever the carousel is at rest. `announced` is the current live-region text, so an
accessibility assertion needs no separate lookup.

---

## Navigation is asynchronous

Every navigation is a smooth scroll that finishes some frames after the call returns.
**Always await `whenSettled()` before asserting on position.**

```js
const car = window.__L5R_CAROUSEL__;

car.goToTab('combat');
await car.whenSettled();
assert(car.getActiveTab().slug === 'combat');
```

Two behaviours worth knowing:

- **`goToTab` commits `index` synchronously**, so a second call made immediately steps
  from the new index rather than a stale one.
- **A wrap does not.** Going from the last tab to the first travels through a clone and
  only commits once the track settles, which is why `nextTab()` returns its *target*
  rather than a snapshot. Await the settle before reading `getActiveTab()`.

`whenSettled()` also resolves `true` when the navigation was a no-op (you asked for the
page you were already on), instead of hanging until timeout.

---

## `data-testid` attributes

**Slugs, not indices.** Indices shift when Spell Slots drops out for a non-shugenja,
which would silently repoint every index-based selector at the wrong section. Slugs stay
put. Each tab and panel also carries `data-tab-index` if you genuinely want position.

### Fixed chrome

| testid | Element |
|---|---|
| `carousel-shell` | the whole shell |
| `carousel-topbar` | persistent header (titlebar + toolbar) |
| `carousel-toolbar-rail` | scrolling button rail inside the toolbar |
| `carousel-viewport` | swipe viewport |
| `carousel-track` | the scroll-snap track |
| `carousel-prev` / `carousel-next` | arrow buttons |
| `carousel-tabbar` | tab bar |
| `carousel-tablist` | the `role="tablist"` container |

### Generated per section

`carousel-tab-<slug>` and `carousel-panel-<slug>`:

```
clan-school   identity     rings-traits   skills      adv-disadv
techniques    spell-slots  combat         equipment   background
```

### Guarantees

- Every testid resolves to **exactly one** element.
- **Clones carry no testids.** They are stripped in `makeClone`, because two elements
  sharing a testid would make `querySelector` return whichever came first in the DOM —
  and the leading clone always does.
- A page that drops out of the running order **surrenders** its testid, `id`, and ARIA
  identity, so no stale selector resolves to a hidden section.

---

## Worked examples

```js
const car = window.__L5R_CAROUSEL__;

// wait for the carousel to be usable
async function ready(){
  for(let i = 0; i < 50; i++){
    if(car && car.isReady()) return true;
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('carousel never became ready');
}

// visit every section in order
await ready();
for(const t of car.getTabs()){
  car.goToTab(t.index);
  await car.whenSettled();
  console.assert(car.getActiveTab().slug === t.slug, 'landed on ' + car.getActiveTab().slug);
}

// the loop closes in both directions
car.goToTab(car.getTabCount() - 1);
await car.whenSettled();
car.nextTab();
await car.whenSettled();
console.assert(car.getActiveTab().index === 0, 'forward wrap');

// Spell Slots follows the sheet's own shugenja test
const before = car.getTabCount();
document.getElementById('cfs_school').value = '<a bushi school>';
document.getElementById('cfs_applySchool').click();
await new Promise(r => setTimeout(r, 300));
console.assert(car.getTabCount() < before, 'Spell Slots tab withdrawn');

// clicking a tab in the DOM agrees with the API
document.querySelector('[data-testid="carousel-tab-combat"]').click();
await car.whenSettled();
console.assert(car.getActiveTab().slug === 'combat');

// print a full picture when something fails
if(car.getActiveTab().slug !== 'combat') console.log(car.getState());
```

---

## Removing the seam

Delete the `PHASE 7 — TEST HARNESS SEAM` block in `carousel.js` and the single
`window.__L5R_CAROUSEL__ = API;` line in `init()`. The `data-testid` attributes are
inert markup and can stay or go independently; the static ones live in
`splice_swipe_tabs.py`, the generated ones in `applyPanelAria()` and `buildTabs()`.
No production path reads any of it.
