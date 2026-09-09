/* ============================================================
   PHASE 2 — SWIPE-TAB CAROUSEL CONTROLLER
   Runs AFTER the sheet's own script, in its own IIFE. Declares no
   globals, calls nothing inside the sheet, and touches the DOM only
   through the `car-` layer. Removing this block and the `car-`
   markup restores the original single-page sheet exactly.
   ============================================================ */
(function(){
  'use strict';

  var track, tabsHost, tabbar, prevBtn, nextBtn;
  var pages   = [];   // VISIBLE real pages, document order
  var tabs    = [];   // tab buttons, parallel to `pages`
  var count   = 0;    // number of visible real pages
  var current = 0;    // current REAL index
  var loop    = false;
  var offset  = 0;    // slot index = real index + offset
  var settleTimer  = null;
  var scrollRaf    = null;
  var cloneTimer   = null;
  var pendingIndex = null;  // index we owe the track once it has a real width
  var userMoved    = false; // has anyone actually navigated yet?
  var liveRegion   = null;  // polite announcer for page changes (Phase 4)

  function $(id){ return document.getElementById(id); }
  function toArray(list){ return Array.prototype.slice.call(list); }
  function clamp(n, lo, hi){ return n < lo ? lo : (n > hi ? hi : n); }

  function reducedMotion(){
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function allPages(){
    return toArray(track.querySelectorAll(':scope > .car-page:not([data-clone])'));
  }

  /* ---------- clone plumbing ------------------------------- */
  /* A clone is scenery. Every id and name inside it is stripped so it can never
     be seen by the sheet's three global sweeps -- two `[id^="f_"]` passes in
     collectData/applyData and the `.roll-modal-overlay` stacking observer -- and
     the subtree is marked `inert` so it takes no focus, clicks or AT attention. */
  function makeClone(src){
    var c = src.cloneNode(true);
    c.setAttribute('data-clone', 'true');
    c.removeAttribute('id');
    toArray(c.querySelectorAll('[id]')).forEach(function(n){ n.removeAttribute('id'); });
    toArray(c.querySelectorAll('[name]')).forEach(function(n){ n.removeAttribute('name'); });
    c.removeAttribute('data-visible-with');
    // PHASE 4: a clone must not present itself as a tabpanel. It would answer to
    // a real tab's aria-controls and offer a second, stale copy of the same
    // section to assistive tech. `inert` already hides it, but stripping the
    // identity outright means there is nothing to get out of sync in the first place.
    c.removeAttribute('role');
    c.removeAttribute('aria-labelledby');
    c.removeAttribute('tabindex');
    toArray(c.querySelectorAll('[tabindex]')).forEach(function(n){ n.removeAttribute('tabindex'); });
    c.setAttribute('inert', '');
    c.setAttribute('aria-hidden', 'true');
    // PHASE 6: a clone is a full copy whose content is already there, so it must
    // never wear a skeleton. Without this, re-cutting the leading clone from a
    // page that is currently skeletoned copies the bars across, and they show
    // through during the loop teleport -- the one moment the clone is on screen.
    c.removeAttribute('data-skeleton');
    // PHASE 7: a clone must never answer to a test selector. Two elements with
    // the same data-testid would make querySelector return whichever came first
    // in the DOM -- and the leading clone always does.
    c.removeAttribute('data-testid');
    c.removeAttribute('data-car-slug');
    toArray(c.querySelectorAll('[data-testid]')).forEach(function(n){ n.removeAttribute('data-testid'); });
    syncCloneValues(src, c);
    return c;
  }

  /* cloneNode copies ATTRIBUTES, not live values: a typed-in input, a chosen
     <select> option and an edited <textarea> would all clone back to their
     defaults, so the loop seam would flash stale data. Copy the live values
     across by position -- the two subtrees are structurally identical. */
  function syncCloneValues(src, clone){
    var a = src.querySelectorAll('input, textarea, select');
    var b = clone.querySelectorAll('input, textarea, select');
    if(a.length !== b.length) return;
    for(var i = 0; i < a.length; i++){
      var t = a[i].type;
      if(t === 'checkbox' || t === 'radio') b[i].checked = a[i].checked;
      else if(t !== 'file') b[i].value = a[i].value;
    }
  }

  /* The edge pages hold live character data, so their clones go stale the moment
     anything is edited. Re-cut them whenever we come to rest on an edge page --
     which is exactly when the next swipe could reveal one. */
  function refreshClones(){
    if(!loop || !count) return;
    var lead = track.firstElementChild;
    var tail = track.lastElementChild;
    if(lead && lead.hasAttribute('data-clone')) track.replaceChild(makeClone(pages[count - 1]), lead);
    if(tail && tail.hasAttribute('data-clone')) track.replaceChild(makeClone(pages[0]), tail);
  }
  function scheduleCloneRefresh(){
    clearTimeout(cloneTimer);
    cloneTimer = setTimeout(refreshClones, 120);   // never inside the settle path
  }

  /* ---------- conditional pages ---------------------------- */
  /* A page carrying data-visible-with="<selector>" disappears -- from the track,
     the tab bar and the loop -- whenever the element it names is hidden. That is
     how Spell Slots follows the sheet's own shugenja test without the carousel
     knowing what a shugenja is. */
  function targetHidden(page){
    var sel = page.getAttribute('data-visible-with');
    if(!sel) return false;
    var el = document.querySelector(sel);
    if(!el) return true;
    if(el.style.display === 'none') return true;
    return window.getComputedStyle(el).display === 'none';
  }

  function applyVisibility(){
    var changed = false;
    allPages().forEach(function(p){
      var hide = targetHidden(p);
      if(p.hasAttribute('hidden') !== hide){
        if(hide) p.setAttribute('hidden', ''); else p.removeAttribute('hidden');
        changed = true;
      }
    });
    return changed;
  }

  function watchVisibility(){
    var targets = [];
    allPages().forEach(function(p){
      var sel = p.getAttribute('data-visible-with');
      if(!sel) return;
      var el = document.querySelector(sel);
      if(el && targets.indexOf(el) === -1) targets.push(el);
    });
    if(!targets.length || typeof MutationObserver !== 'function') return;
    var obs = new MutationObserver(function(){
      if(applyVisibility()) rebuild();
    });
    targets.forEach(function(el){
      obs.observe(el, { attributes:true, attributeFilter:['style', 'class', 'hidden'] });
    });
  }

  /* ---------- geometry ------------------------------------- */
  /* A zero-width track means the carousel is not laid out yet -- hidden ancestor,
     fonts still loading, print preview. Every geometry read is worthless then,
     and acting on one would silently park the track on the leading clone, so
     positioning is deferred until a real width shows up. */
  function ready(){ return !!track && track.clientWidth > 0; }
  function pageWidth(){ return track.clientWidth; }
  function currentSlot(){ return Math.round(track.scrollLeft / pageWidth()); }
  function lastSlot(){ return loop ? count + 1 : count - 1; }

  function slotToReal(slot){
    if(!loop) return clamp(slot, 0, count - 1);
    if(slot <= 0) return count - 1;          // leading clone == last page
    if(slot >= count + 1) return 0;          // trailing clone == first page
    return slot - 1;
  }

  /* Snap must be switched off around a programmatic jump, or the snap engine
     fights the assignment and drags the track back to where it was. */
  function jumpToSlot(slot){
    var saved = track.style.scrollSnapType;
    track.style.scrollSnapType = 'none';
    track.scrollLeft = slot * pageWidth();
    void track.offsetWidth;                  // force reflow: new resting place
    track.style.scrollSnapType = saved || '';
  }

  function glideToSlot(slot){
    if(reducedMotion() || typeof track.scrollTo !== 'function'){ jumpToSlot(slot); return; }
    track.scrollTo({ left: slot * pageWidth(), behavior: 'smooth' });
  }

  /* ---------- navigation ----------------------------------- */
  function goToIndex(realIndex, smooth){
    if(!count) return;
    // Deliberate navigation outranks any gesture verdict still in flight: a tab
    // tap or an arrow key must never be bounced back by the swipe before it.
    verdict = null;
    var i = loop
      ? ((realIndex % count) + count) % count
      : clamp(realIndex, 0, count - 1);
    current = i;
    syncTabs();
    hydrateAround(i);
    announce();
    if(!ready()){ pendingIndex = i; return; }   // settle it when width arrives
    // Already parked on the target: no scroll will happen, so no scrollend will
    // fire. Release the settle waiters anyway, or a harness that navigates to the
    // page it is already on hangs until whenSettled() times out.
    if(currentSlot() === i + offset){ setTimeout(resolveSettled, 0); return; }
    if(smooth) glideToSlot(i + offset); else jumpToSlot(i + offset);
  }

  /* Stepping works on SLOTS, not real indices, so the clones do the looping
     for free: one smooth scroll onto a clone, then an invisible teleport. */
  function step(dir){
    if(!count || !ready()) return;
    userMoved = true;
    verdict = null;                       // same reasoning as goToIndex
    var target = currentSlot() + dir;
    if(!loop) target = clamp(target, 0, count - 1);
    else target = clamp(target, 0, lastSlot());
    glideToSlot(target);
  }

  /* ---------- settle: where the loop actually happens ------- */
  /* Called once the track has come to rest. If we are parked on a clone, we
     teleport to the identical real page. The teleport lands on a real slot, so a
     re-entrant settle is a harmless no-op. */
  function onSettle(){
    if(!count || !ready()) return;
    var slot = currentSlot();
    if(loop && slot <= 0){
      current = count - 1;
      jumpToSlot(count);
    } else if(loop && slot >= count + 1){
      current = 0;
      jumpToSlot(1);
    } else {
      current = slotToReal(slot);
    }
    // PHASE 5: was the gesture that landed us here actually meant? If not, this
    // reverts and returns -- the bounce-back settles on its own.
    if(vetoPending()) return;
    syncTabs();
    hydrateAround(current);
    announce();
    resolveSettled();
    if(current === 0 || current === count - 1) scheduleCloneRefresh();
  }

  /* ---------- tab bar -------------------------------------- */
  function labelFor(page, i){
    var explicit = page.getAttribute('data-tab-label');
    if(explicit) return explicit;
    var heading = page.querySelector('h1, h2, h3');
    if(heading && heading.textContent.trim()) return heading.textContent.trim();
    return 'Page ' + (i + 1);
  }

  /* ---------- PHASE 4: ARIA identity for the panels ---------- */
  /* Runs BEFORE the clones are cut, so every real page already carries the id a
     tab will point at and no clone can inherit a live one. */
  function applyPanelAria(){
    slugSeen = {};
    // Every real page, not just the visible ones. Panel ids are positional, so a
    // page that drops out of the running order (Spell Slots, for a non-shugenja)
    // must surrender its id -- otherwise it keeps `car-panel-6` while Combat
    // shifts up and claims the same one, and the document has a duplicate id
    // that aria-controls then resolves to the wrong section.
    allPages().forEach(function(page){
      var i = pages.indexOf(page);
      if(i < 0){
        page.removeAttribute('id');
        page.removeAttribute('role');
        page.removeAttribute('aria-labelledby');
        page.removeAttribute('tabindex');
        page.removeAttribute('data-testid');
        page.removeAttribute('data-tab-index');
        page.removeAttribute('data-car-slug');
        return;
      }
      page.id = 'car-panel-' + i;
      page.setAttribute('role', 'tabpanel');
      page.setAttribute('aria-labelledby', 'car-tab-' + i);
      // PHASE 7: slug, not index. Indices shift when Spell Slots drops out for a
      // non-shugenja, which would silently repoint every index-based selector at
      // the wrong section; the slug stays put.
      var slug = uniqueSlug(labelFor(page, i));
      page.setAttribute('data-car-slug', slug);          // tabs reuse this exact slug
      page.setAttribute('data-testid', 'carousel-panel-' + slug);
      page.setAttribute('data-tab-index', String(i));
      // A scrollable region must be reachable by keyboard, or its content is
      // unreachable for anyone who cannot drag it.
      page.setAttribute('tabindex', '0');
    });
  }

  /* Slugs are derived from labels, and two sections could in principle carry the
     same one. A duplicate testid makes querySelector return whichever came first
     and the mismatch is invisible until a test asserts on the wrong section, so
     collisions get a numeric suffix instead. */
  var slugSeen = null;
  function uniqueSlug(label){
    var base = slugify(label) || 'section';
    var n = slugSeen[base] || 0;
    slugSeen[base] = n + 1;
    return n ? base + '-' + (n + 1) : base;
  }

  function buildTabs(){
    tabsHost.textContent = '';
    tabs = pages.map(function(page, i){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'car-tab';
      b.id = 'car-tab-' + i;
      b.textContent = labelFor(page, i);
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', 'car-panel-' + i);
      b.setAttribute('aria-selected', i === current ? 'true' : 'false');
      // Roving tabindex: the whole tablist is ONE tab stop, and the arrow keys
      // move within it. Ten separate tab stops would bury the sheet itself.
      b.setAttribute('tabindex', i === current ? '0' : '-1');
      b.setAttribute('data-testid', 'carousel-tab-' + (page.getAttribute('data-car-slug') || slugify(b.textContent)));
      b.setAttribute('data-tab-index', String(i));
      b.addEventListener('click', function(){ userMoved = true; goToIndex(i, true); });
      tabsHost.appendChild(b);
      return b;
    });
  }

  /* Scroll the active tab into view by hand. `scrollIntoView` would walk up the
     ancestor chain and yank the carousel track sideways with it. */
  function revealTab(el){
    if(!el || !tabbar) return;
    var left  = el.offsetLeft;
    var right = left + el.offsetWidth;
    if(left < tabbar.scrollLeft) tabbar.scrollLeft = left - 12;
    else if(right > tabbar.scrollLeft + tabbar.clientWidth) tabbar.scrollLeft = right - tabbar.clientWidth + 12;
  }

  function syncTabs(){
    for(var i = 0; i < tabs.length; i++){
      var on = (i === current);
      tabs[i].classList.toggle('is-active', on);
      tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
      tabs[i].setAttribute('tabindex', on ? '0' : '-1');
    }
    syncPanelInertness();
    revealTab(tabs[current]);
  }

  /* ---------- PHASE 4: keep focus on the page you can see ---- */
  /* Ten pages of form fields all sit in the DOM at once. Without this, Tab walks
     out of the visible page and into the next one's inputs, and the browser
     scrolls that off-screen field into view -- dragging the track with it and
     leaving the carousel parked between two pages. Marking every non-current
     page `inert` confines the tab order to the page actually on screen.

     The one exception is a page that already holds focus: ripping focus out from
     under someone mid-edit would be worse than the problem being solved. It gets
     inerted on the next sync after focus leaves. */
  function syncPanelInertness(){
    var active = document.activeElement;
    pages.forEach(function(page, i){
      var keep = (i === current) || (active && page.contains(active));
      if(keep){
        page.removeAttribute('inert');
        page.removeAttribute('aria-hidden');
      } else {
        page.setAttribute('inert', '');
        page.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /* ---------- PHASE 4: announce the page change -------------- */
  /* A swipe changes the whole screen with no audible event. One polite live
     region turns that into "Combat, section 8 of 10". Announced on settle only,
     never per scroll frame, or a single swipe would queue ten utterances. */
  function announce(){
    if(!liveRegion || !pages[current]) return;
    var msg = labelFor(pages[current], current) + ', section ' + (current + 1) + ' of ' + count;
    // Idempotent on purpose: a smooth keyboard move announces once when the
    // intent is recorded and again when the track settles. Writing the same
    // string twice would speak the section name twice.
    if(liveRegion.textContent === msg) return;
    liveRegion.textContent = msg;
  }

  /* ---------- live highlight while dragging ---------------- */
  function onScroll(){
    if(scrollRaf || !ready()) return;
    scrollRaf = requestAnimationFrame(function(){
      scrollRaf = null;
      if(!ready()) return;
      var live = slotToReal(currentSlot());
      if(live !== current){ current = live; syncTabs(); }
    });
  }

  /* ============================================================
     PHASE 5 — GESTURE TUNING
     The swipe itself stays native: CSS scroll-snap owns the drag, the
     momentum and the landing, which is why it feels right and why the
     loop, the keyboard layer and the a11y tree all still work. This
     layer does not replace that. It does two things the native engine
     cannot: it keeps horizontal drags that belong to page content from
     ever reaching the carousel, and it arbitrates -- after the fact --
     whether the gesture that just paged the sheet was deliberate.
     ============================================================ */
  var SWIPE = {
    axisRatio:   1.2,   // |dx| must beat |dy| by this factor to count as horizontal
    minVelocity: 0.35,  // px/ms — a flick can be short if it is fast
    tapSlop:     10,    // below this, the finger never really moved
    verdictTTL:  700    // ms a verdict stays valid, so it cannot haunt a later settle
  };

  /* Distance scales with the page: 40px is a decisive shove on a phone and a
     twitch on a tablet, so a fixed number is wrong at one end or the other. */
  function minSwipeDistance(){
    return Math.max(36, Math.min(72, pageWidth() * 0.10));
  }

  var gesture = null;   // the gesture currently under the finger
  var verdict = null;   // {accepted, origin, at} left behind for onSettle to read

  /* One clock, read the same way at both ends of a gesture. Never `e.timeStamp
     || Date.now()`: those are different epochs -- a document-relative
     DOMHighResTimeStamp and a Unix time -- so the moment one end falls back the
     subtraction is meaningless and the velocity test silently stops working.
     Measured here: that mix produced a 2000ms "duration" for a 30ms flick. */
  function now(){
    return (window.performance && performance.now) ? performance.now() : Date.now();
  }

  /* A drag that starts inside something which scrolls sideways -- a wide table,
     the toolbar rail -- belongs to that thing. `overscroll-behavior-x: contain`
     already stops the scroll chaining outward; this stops us second-guessing a
     page change we did not cause. */
  function inHorizontalScroller(el){
    var n = el;
    while(n && n !== track && n.nodeType === 1){
      if(n.scrollWidth - n.clientWidth > 2){
        var ox = window.getComputedStyle(n).overflowX;
        if(ox === 'auto' || ox === 'scroll') return true;
      }
      n = n.parentNode;
    }
    return false;
  }

  /* Touch events, not pointer events, on purpose: once the browser takes a touch
     over for scrolling it fires pointercancel and the pointer stream stops dead,
     which is exactly the part of the gesture we need to measure. touchmove keeps
     firing throughout. All three listeners are passive -- this layer observes,
     it never calls preventDefault, so it cannot stall a scroll. */
  function onTouchStart(e){
    userMoved = true;
    if(e.touches.length !== 1){ gesture = null; return; }
    var t = e.touches[0];
    gesture = {
      x0: t.clientX, y0: t.clientY,
      t0: now(),
      dx: 0, dy: 0,
      origin: current,
      optOut: inHorizontalScroller(e.target)
    };
  }

  function onTouchMove(e){
    if(!gesture || e.touches.length !== 1) return;
    var t = e.touches[0];
    gesture.dx = t.clientX - gesture.x0;
    gesture.dy = t.clientY - gesture.y0;
  }

  function onTouchEnd(e){
    if(!gesture) return;
    var g = gesture;
    gesture = null;
    if(g.optOut){ verdict = null; return; }

    var adx = Math.abs(g.dx), ady = Math.abs(g.dy);
    var dt  = Math.max(1, now() - g.t0);
    var accepted;

    if(adx < SWIPE.tapSlop)                 accepted = false;  // a tap, or a tremor
    else if(adx < ady * SWIPE.axisRatio)    accepted = false;  // reading, not paging
    else accepted = (adx >= minSwipeDistance()) || (adx / dt >= SWIPE.minVelocity);

    verdict = { accepted: accepted, origin: g.origin, at: now() };
  }

  /* Called from onSettle once the track has come to rest on a real page. If the
     gesture that put us here failed the threshold, go back where we came from.
     The verdict is consumed either way, so the bounce-back's own settle is never
     vetoed in turn. */
  function vetoPending(){
    if(!verdict || verdict.accepted) return false;
    if(now() - verdict.at > SWIPE.verdictTTL){ verdict = null; return false; }
    var origin = verdict.origin;
    verdict = null;
    if(current === origin || origin >= count) return false;
    goToIndex(origin, true);
    return true;
  }

  /* ---------- PHASE 5: reachable wide content --------------- */
  /* The sheet's tables are width:100% with up to nine columns of inputs. On a
     phone the inputs cannot compress past their intrinsic width, so the table
     overflows -- and .car-page clips overflow-x, which made those columns simply
     unreachable. Each table gets its own horizontal scroller: the columns come
     back, and a sideways drag over a table scrolls the table instead of paging
     the sheet. Nothing in the sheet reads a table's parent, so re-parenting is
     safe (verified: no parentNode/closest call walks above a row). */
  function wrapWideContentIn(page){
    if(!page) return;
    toArray(page.querySelectorAll('table.dyn')).forEach(function(tbl){
      var parent = tbl.parentNode;
      if(parent && parent.classList && parent.classList.contains('car-hscroll')) return;
      var box = document.createElement('div');
      box.className = 'car-hscroll';
      parent.insertBefore(box, tbl);
      box.appendChild(tbl);
    });
  }

  /* ============================================================
     PHASE 6 — LAZY LOADING
     What can and cannot be deferred here is decided by the sheet, not
     by preference. Its script is one IIFE that runs at parse time and
     reaches into Combat, Equipment and the rest by id -- addArrows,
     combatActiveToggle, voidDamageInput, stanceTiles -- so every
     section MUST exist in the DOM before that script runs. Holding
     markup back in <template> and hydrating it later would break the
     sheet outright, and that is a rewrite this workflow forbids.

     So nothing is withheld from the document. What is deferred is the
     WORK: rendering (via content-visibility, in the CSS) and the DOM
     touch-ups this controller would otherwise do to all ten pages up
     front. Each page pays its own share the first time it is needed.
     ============================================================ */
  var prepared = (typeof WeakSet === 'function') ? new WeakSet() : null;
  var revealed = (typeof WeakSet === 'function') ? new WeakSet() : null;

  /* Structural work a page needs before it is looked at. Runs for the current
     page AND its two neighbours, so the work is already done by the time a swipe
     arrives rather than landing as a layout shift under the finger. */
  function preparePage(i){
    var page = pages[i];
    if(!page) return;
    if(prepared){
      if(prepared.has(page)) return;
      prepared.add(page);
    }
    wrapWideContentIn(page);
  }

  /* The skeleton is only honest while a page has genuinely never been rendered,
     so it comes off on arrival -- not on prefetch. */
  function revealPage(i){
    var page = pages[i];
    if(!page) return;
    page.removeAttribute('data-skeleton');
    if(revealed) revealed.add(page);
  }

  function hydrateAround(i){
    preparePage(i);
    if(count > 1){
      preparePage((i + 1) % count);
      preparePage((i - 1 + count) % count);
    }
    revealPage(i);
  }

  /* Every page except the one that opens starts behind a skeleton. A page that
     has already been visited never gets one back: build() re-runs on every
     rebuild (a school change withdrawing Spell Slots, say), and re-arming there
     would put skeleton bars behind sections the reader has already been looking
     at for the last ten minutes. */
  function armSkeletons(){
    pages.forEach(function(p, i){
      if(i === current || (revealed && revealed.has(p))){
        p.removeAttribute('data-skeleton');
        if(i === current && revealed) revealed.add(p);
      } else {
        p.setAttribute('data-skeleton', '');
      }
    });
  }

  /* ---------- PHASE 4: keyboard navigation ------------------ */
  /* Three guards decide whether a key belongs to the carousel at all. Each one
     exists because ignoring it would break something the sheet already does. */

  // 1. A caret always wins. Left/Right inside a field moves the cursor; stealing
  //    those would make every text input on the sheet unusable.
  function isEditable(el){
    if(!el) return false;
    if(el.isContentEditable) return true;
    var tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
  }

  // 2. Never page the sheet out from behind an open dialog. The sheet opens all
  //    16 overlays by setting inline display, so that is what we read.
  function modalOpen(){
    var overlays = document.querySelectorAll('.roll-modal-overlay');
    for(var i = 0; i < overlays.length; i++){
      var d = overlays[i].style.display;
      if(d && d !== 'none') return true;
    }
    return false;
  }

  // 3. Home/End belong to the tablist, per the ARIA tabs pattern. Inside a page
  //    they must keep scrolling that page to top/bottom -- Combat and Skills are
  //    long, and taking that away to gain a redundant shortcut is a bad trade.
  function inTabList(el){ return !!(el && tabsHost && tabsHost.contains(el)); }
  function homeEndAllowed(el){
    if(inTabList(el)) return true;
    if(!el || el === document.body || el === document.documentElement) return true;
    if(el === prevBtn || el === nextBtn) return true;
    return !!(tabbar && tabbar.contains(el));
  }

  function focusTab(i){ if(tabs[i]) tabs[i].focus(); }

  /* A wrap goes through step(), so travelling from the last page to the first
     runs across the clone exactly like a swipe does instead of sweeping backwards
     over the whole track. Every other move goes through goToIndex(), which sets
     `current` synchronously -- so a second keypress arriving before the scroll
     has settled steps from the new index rather than re-reading a stale
     scroll position and going nowhere. */
  function moveBy(dir, onTabs){
    var next  = ((current + dir) % count + count) % count;
    var wraps = (dir > 0 && current === count - 1) || (dir < 0 && current === 0);
    if(wraps) step(dir);
    else goToIndex(next, true);
    if(onTabs) focusTab(next);
  }

  function onKeyDown(e){
    if(e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if(!count || !ready()) return;
    if(isEditable(e.target)) return;
    if(modalOpen()) return;

    var onTabs = inTabList(e.target);

    switch(e.key){
      case 'ArrowLeft':  e.preventDefault(); moveBy(-1, onTabs); break;
      case 'ArrowRight': e.preventDefault(); moveBy(1,  onTabs); break;
      case 'Home':
        if(!homeEndAllowed(e.target)) return;
        e.preventDefault(); goToIndex(0, true); if(onTabs) focusTab(0);
        break;
      case 'End':
        if(!homeEndAllowed(e.target)) return;
        e.preventDefault(); goToIndex(count - 1, true); if(onTabs) focusTab(count - 1);
        break;
      default: return;
    }
  }

  /* ---------- build ---------------------------------------- */
  function build(){
    // Idempotent: drop any clones from a previous build before re-reading.
    toArray(track.querySelectorAll(':scope > [data-clone]')).forEach(function(n){
      n.parentNode.removeChild(n);
    });

    applyVisibility();
    pages = allPages().filter(function(p){ return !p.hasAttribute('hidden'); });
    count = pages.length;

    // ARIA identity first: the clones below must never inherit a live panel id.
    // Runs BEFORE the empty-set bail-out, because applyPanelAria is also what
    // strips identity from pages that have dropped out. Returning early would
    // leave orphaned car-panel-N ids and testids pointing at nothing.
    applyPanelAria();

    if(!count){ tabsHost.textContent = ''; tabs = []; return; }

    loop   = count > 1;
    offset = loop ? 1 : 0;
    // The two edge pages are what get cloned, so they must be prepared before
    // the copy is taken or the clone and the original would differ.
    preparePage(0);
    preparePage(count - 1);

    if(loop){
      track.insertBefore(makeClone(pages[count - 1]), pages[0]);
      track.appendChild(makeClone(pages[0]));
    }

    buildTabs();
    armSkeletons();
  }

  /* Rebuild after a page appears or disappears, staying on the same SECTION
     rather than the same index -- the index shifts when a page above vanishes. */
  function rebuild(){
    var keep = pages[current] || null;
    build();
    var i = keep ? pages.indexOf(keep) : -1;
    goToIndex(i >= 0 ? i : 0, false);
  }

  /* ---------- wiring --------------------------------------- */
  function publishTabbarHeight(){
    if(!tabbar) return;
    document.documentElement.style.setProperty('--car-tabbar-h', tabbar.offsetHeight + 'px');
  }

  function wire(){
    if(prevBtn) prevBtn.addEventListener('click', function(){ step(-1); });
    if(nextBtn) nextBtn.addEventListener('click', function(){ step(1); });

    // Bubble phase, and never preventDefault on a key we do not own -- the
    // sheet's own Escape handler for the stance overlay must keep working.
    document.addEventListener('keydown', onKeyDown);

    // Focus moving out of a page is the moment that page becomes safe to inert.
    document.addEventListener('focusin', syncPanelInertness);

    // PHASE 5: passive throughout — this layer measures, it never blocks.
    track.addEventListener('touchstart',  onTouchStart,  { passive:true });
    track.addEventListener('touchmove',   onTouchMove,   { passive:true });
    track.addEventListener('touchend',    onTouchEnd,    { passive:true });
    track.addEventListener('touchcancel', function(){ gesture = null; verdict = null; },
                                                       { passive:true });

    track.addEventListener('scroll', onScroll, { passive:true });

    // `scrollend` is the precise signal; the debounce is the fallback.
    if('onscrollend' in window){
      track.addEventListener('scrollend', onSettle);
    } else {
      track.addEventListener('scroll', function(){
        clearTimeout(settleTimer);
        settleTimer = setTimeout(onSettle, 130);
      }, { passive:true });
    }

    // Width changes (rotation, resize, mobile URL bar) must not leave the track
    // parked between two pages. This is also where a deferred cold-start
    // position is finally applied.
    var reflow = function(){
      publishTabbarHeight();
      if(!ready()) return;
      var target = (pendingIndex !== null) ? pendingIndex : current;
      pendingIndex = null;
      current = target;
      jumpToSlot(target + offset);
      syncTabs();
    };
    if(typeof ResizeObserver === 'function'){
      var pending = null;
      var ro = new ResizeObserver(function(){
        clearTimeout(pending);
        pending = setTimeout(reflow, 60);
      });
      ro.observe(track);
      if(tabbar) ro.observe(tabbar);
    } else {
      window.addEventListener('resize', reflow);
    }

    watchVisibility();
  }

  /* ============================================================
     PHASE 7 — TEST HARNESS SEAM
     Mirrors the convention the sheet already set with window.__L5R_TEST__:
     one namespaced export, additive, and deletable in a single block
     without touching anything else. Unlike the sheet's seam this one is
     not read-only -- driving navigation is the point -- but it moves the
     UI only. It never reads or writes character data, so a harness can
     drive the carousel and still assert against __L5R_TEST__ for the
     numbers.
     ============================================================ */
  function slugify(s){
    return String(s || '')
      .replace(/&amp;/g, ' ')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /* Navigation is asynchronous -- a smooth scroll finishes some frames after the
     call returns. Without a settle signal every test is forced to guess with a
     sleep, which is exactly how flaky suites happen. */
  var settleWaiters = [];
  function resolveSettled(){
    if(!settleWaiters.length) return;
    var list = settleWaiters;
    settleWaiters = [];
    for(var i = 0; i < list.length; i++) list[i]();
  }
  function whenSettled(timeoutMs){
    return new Promise(function(resolve){
      var done = false;
      var waiter = function(){
        if(!done){ done = true; clearTimeout(timer); resolve(true); }
      };
      var timer = setTimeout(function(){
        if(done) return;
        done = true;
        // Drop our own entry rather than leaving it for the next settle to walk.
        // A long suite that calls whenSettled repeatedly without a settle in
        // between would otherwise grow this array without bound.
        var at = settleWaiters.indexOf(waiter);
        if(at >= 0) settleWaiters.splice(at, 1);
        resolve(false);
      }, timeoutMs || 2000);
      settleWaiters.push(waiter);
    });
  }

  /* Accepts an index, a slug ("combat"), or a label ("Adv & Disadv"). */
  function resolveTarget(target){
    if(typeof target === 'number' && isFinite(target)) return Math.round(target);
    var want = slugify(target);
    for(var i = 0; i < pages.length; i++){
      var slug = pages[i].getAttribute('data-car-slug') || slugify(labelFor(pages[i], i));
      if(slug === want) return i;
    }
    return -1;
  }

  function describe(i){
    var page = pages[i];
    if(!page) return null;
    return {
      index: i,
      label: labelFor(page, i),
      slug:  page.getAttribute('data-car-slug') || slugify(labelFor(page, i)),
      tab:   tabs[i] || null,
      panel: page
    };
  }

  var API = {
    version: '1.0',

    /* ---- required by the phase spec ---- */
    goToTab: function(target){
      var i = resolveTarget(target);
      if(i < 0 || i >= count) return null;
      goToIndex(i, true);
      return describe(current);
    },
    /* Return the tab being navigated TO, not a snapshot of where we still are.
       A wrap (last -> first) travels through the clone and only commits `current`
       once the track settles, so returning describe(current) there would hand the
       caller the tab it just left. Callers that need the committed state should
       await whenSettled() and re-read getActiveTab(). */
    nextTab: function(){
      if(!count) return null;
      var target = (current + 1) % count;
      moveBy(1, false);
      return describe(target);
    },
    prevTab: function(){
      if(!count) return null;
      var target = (current - 1 + count) % count;
      moveBy(-1, false);
      return describe(target);
    },
    getActiveTab: function(){ return describe(current); },

    /* ---- what a harness actually needs on top ---- */
    isReady:     function(){ return !!track && count > 0 && ready(); },
    getTabCount: function(){ return count; },
    getTabs:     function(){ return pages.map(function(p, i){ return describe(i); }); },
    whenSettled: whenSettled,

    /* One call that answers "what is the carousel doing right now", so a failing
       assertion can print the whole picture instead of one number. */
    getState: function(){
      return {
        index:       current,
        label:       pages[current] ? labelFor(pages[current], current) : null,
        count:       count,
        loop:        loop,
        slot:        ready() ? currentSlot() : null,
        offset:      offset,
        pageWidth:   ready() ? pageWidth() : 0,
        scrollLeft:  track ? track.scrollLeft : 0,
        trackChildren: track ? track.children.length : 0,
        clones:      track ? track.querySelectorAll(':scope > [data-clone]').length : 0,
        hiddenPages: track ? track.querySelectorAll(':scope > .car-page[hidden]').length : 0,
        skeletons:   pages.filter(function(p){ return p.hasAttribute('data-skeleton'); }).length,
        deferred:    pages.filter(function(p){ return p.hasAttribute('inert'); }).length,
        announced:   liveRegion ? liveRegion.textContent : null
      };
    }
  };

  /* ---------- PHASE 4: static ARIA on the fixed chrome ------- */
  /* Set here rather than in the markup so the whole accessibility layer lives in
     one place and stays in step with the tabs, which are generated anyway. */
  function buildAriaScaffold(){
    tabsHost.setAttribute('role', 'tablist');
    tabsHost.setAttribute('aria-label', 'Character sheet sections');
    tabsHost.setAttribute('aria-orientation', 'horizontal');

    // The glyphs are decorative; the button needs a real name.
    if(prevBtn){
      prevBtn.setAttribute('aria-label', 'Previous section');
      prevBtn.innerHTML = '<span aria-hidden="true">' + prevBtn.innerHTML + '</span>';
    }
    if(nextBtn){
      nextBtn.setAttribute('aria-label', 'Next section');
      nextBtn.innerHTML = '<span aria-hidden="true">' + nextBtn.innerHTML + '</span>';
    }

    liveRegion = document.createElement('div');
    liveRegion.className = 'car-sr-only';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
  }

  function init(){
    track    = $('carTrack');
    tabsHost = $('carTabbarInner');
    tabbar   = $('carTabbar');
    prevBtn  = $('carPrev');
    nextBtn  = $('carNext');
    if(!track || !tabsHost) return;

    buildAriaScaffold();
    build();
    goToIndex(0, false);
    announce();
    publishTabbarHeight();
    wire();

    window.__L5R_CAROUSEL__ = API;

    // The sheet's init is async: it populates selects and decides whether the
    // Spell Slots section exists at all. Re-check once it has had a turn.
    setTimeout(function(){
      if(applyVisibility()) rebuild(); else refreshClones();
      reassertPosition();
    }, 0);

    // Browsers restore a scroll container's offset on reload, and that
    // restoration lands AFTER init -- so the track can end up parked on whatever
    // page was open last time while the tab bar says otherwise. Re-assert the
    // opening page once the document has finished loading, but only while nobody
    // has navigated yet, so this can never yank a reader off a page they chose.
    window.addEventListener('load', reassertPosition);
  }

  function reassertPosition(){
    if(userMoved || !count || !ready()) return;
    if(currentSlot() === current + offset) return;
    jumpToSlot(current + offset);
    syncTabs();
  }

  /* If the controller cannot run, the carousel CSS must not stay applied. Ten
     full-width pages in a scroll container with no tab bar and no way to
     navigate is strictly worse than the sheet it replaced, so a failure drops
     `car-active` and the original single-page layout comes straight back.
     Nothing about the sheet's own logic depends on this class. */
  function safeInit(){
    if(window.__L5R_CAROUSEL__) return;          // never build twice
    try {
      init();
    } catch(err){
      try {
        document.body.classList.remove('car-active');
        toArray(document.querySelectorAll('.car-page')).forEach(function(p){
          p.removeAttribute('inert');
          p.removeAttribute('aria-hidden');
          p.removeAttribute('data-skeleton');
        });
      } catch(e){ /* nothing further we can do */ }
      if(window.console && console.error){
        console.error('[carousel] init failed; reverted to the single-page sheet.', err);
      }
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', safeInit);
  } else {
    safeInit();
  }
})();
