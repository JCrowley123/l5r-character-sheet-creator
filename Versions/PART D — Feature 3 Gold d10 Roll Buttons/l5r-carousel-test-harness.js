/* ============================================================================
   L5R SWIPE-TAB CAROUSEL — REGRESSION HARNESS
   For: l5r-character-sheet part D feature 2.1 RINGS.html

   Paste into the browser console with the sheet open, or:
       const s = document.createElement('script');
       s.src = 'l5r-carousel-test-harness.js';
       document.head.appendChild(s);

   Asserts the invariants every phase of the build depends on. It drives the UI
   through window.__L5R_CAROUSEL__ and never touches character data, so it can
   run alongside the sheet's own __L5R_TEST__ suites without disturbing them.

   Returns (and logs) { total, passed, failed:[names], detail:{} }.
   ============================================================================ */
(async function(){
  'use strict';

  const API   = window.__L5R_CAROUSEL__;
  const track = document.getElementById('carTrack');
  const R     = {};
  const real  = () => [...document.querySelectorAll('.car-page:not([data-clone])')];
  const dup   = a => { const m = {}, d = []; a.forEach(v => { if(m[v]) d.push(v); m[v] = 1; }); return d; };
  const wait  = ms => new Promise(r => setTimeout(r, ms));

  if(!API || !track){
    console.error('[carousel-qa] window.__L5R_CAROUSEL__ or #carTrack missing — is this the SWIPE build?');
    return { total: 0, passed: 0, failed: ['seam missing'], detail: {} };
  }
  if(!API.isReady()){
    console.warn('[carousel-qa] carousel not ready yet; waiting…');
    for(let i = 0; i < 50 && !API.isReady(); i++) await wait(100);
  }

  const n = API.getTabCount();
  const W = track.clientWidth;

  /* ---- structure (Phases 1–2) ------------------------------------------ */
  /* getTabCount() counts the sections in the RUNNING ORDER, which is not the
     same as the number of pages in the track. A conditional section that has
     withdrawn — Spell Slots for a non-shugenja, which is the sheet's default
     state — is still a child of the track; it is display:none, not removed. So
     the child count has to allow for it, or these two assertions fail on an
     ordinary load and cry wolf. */
  const withdrawn = API.getState().hiddenPages;
  R['track holds every page plus two clones'] = track.children.length === n + withdrawn + 2;
  R['exactly two clones']                     = track.querySelectorAll(':scope > [data-clone]').length === 2;
  /* Only the pages in the running order are laid out, so the scrollable width is
     one page per visible section plus the two clones — not one per child. */
  R['snap geometry intact']                   = Math.abs(track.scrollWidth - (n + 2) * W) < 2;
  R['no duplicate element ids']               = dup([...document.querySelectorAll('[id]')].map(e => e.id)).length === 0;
  R['clones carry no ids']                    = document.querySelectorAll('[data-clone] [id]').length === 0;
  R['clones carry no name attributes']        = document.querySelectorAll('[data-clone] [name]').length === 0;

  /* The sheet's save/load sweeps [id^="f_"]. A clone leaking into that would
     corrupt collectData(); this is the single most important invariant here. */
  const fReal  = real().reduce((t, p) => t + p.querySelectorAll('[id^="f_"]').length, 0);
  const fTotal = document.querySelectorAll('[id^="f_"]').length;
  R['f_ sweep never sees a clone'] = fTotal >= fReal &&
      document.querySelectorAll('[data-clone] [id^="f_"]').length === 0;

  /* ---- chrome (Phase 3) ------------------------------------------------ */
  R['tab bar height published to CSS'] =
      /\d+px/.test(getComputedStyle(document.documentElement).getPropertyValue('--car-tabbar-h'));
  R['modals live outside the track'] =
      document.querySelectorAll('#carTrack .roll-modal-overlay').length === 0;
  R['dice button lives outside the track'] =
      document.querySelectorAll('#carTrack #floatingDiceBtn').length === 0;

  /* ---- accessibility (Phase 4) ----------------------------------------- */
  R['tablist role present'] = document.getElementById('carTabbarInner').getAttribute('role') === 'tablist';
  R['roving tabindex: one tab stop'] =
      [...document.querySelectorAll('.car-tab')].filter(t => t.getAttribute('tabindex') === '0').length === 1;
  R['every aria-controls resolves to its own panel'] =
      [...document.querySelectorAll('.car-tab')].every(t => {
        const p = document.getElementById(t.getAttribute('aria-controls'));
        return p && p.getAttribute('aria-labelledby') === t.id;
      });
  R['exactly one page is interactive'] = real().filter(p => !p.hasAttribute('inert')).length === 1;
  R['focus cannot reach an off-screen page'] = (() => {
      const f = document.querySelector('.car-page[inert] input, .car-page[inert] button');
      if(!f) return true;
      const before = document.activeElement;
      f.focus();
      const escaped = document.activeElement === f;
      if(before && before.focus) before.focus();
      return !escaped;
  })();
  R['live region announces the section'] =
      /section \d+ of \d+/.test((document.querySelector('.car-sr-only') || {}).textContent || '');

  /* ---- gestures + wide content (Phase 5) ------------------------------- */
  R['wide tables scroll inside the page'] =
      [...document.querySelectorAll('.car-hscroll')].every(b =>
          getComputedStyle(b).overscrollBehaviorX === 'contain');
  R['no nested table wrappers'] = document.querySelectorAll('.car-hscroll .car-hscroll').length === 0;

  /* ---- deferral (Phase 6) ---------------------------------------------- */
  R['only the current page is rendered'] =
      [...document.querySelectorAll('.car-page')]
        .filter(p => getComputedStyle(p).contentVisibility !== 'auto').length === 1;
  R['clones never wear a skeleton'] =
      document.querySelectorAll('[data-clone][data-skeleton]').length === 0;

  /* ---- test seam (Phase 7) --------------------------------------------- */
  R['no duplicate data-testid'] =
      dup([...document.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid'))).length === 0;
  R['clones answer to no testid'] =
      document.querySelectorAll('[data-clone] [data-testid], [data-clone][data-testid]').length === 0;
  R['section slugs are unique'] =
      dup(real().map(p => p.getAttribute('data-car-slug'))).length === 0;

  const startSlug = API.getActiveTab().slug;
  R['goToTab by slug'] = (API.goToTab(startSlug), API.getActiveTab().slug === startSlug);
  R['goToTab rejects bad input'] = API.goToTab('no-such-section') === null && API.goToTab(9999) === null;
  R['whenSettled resolves on a no-op'] = await API.whenSettled(1500);

  /* ---- navigation round trip ------------------------------------------- */
  const tabs = API.getTabs();
  let visitedAll = true;
  for(const t of tabs){
    API.goToTab(t.index);
    await API.whenSettled(1500);
    if(API.getActiveTab().slug !== t.slug) visitedAll = false;
  }
  R['every section is reachable by index'] = visitedAll;

  API.goToTab(n - 1); await API.whenSettled(1500);
  API.nextTab();      await API.whenSettled(2000);
  R['loop closes forward (last -> first)'] = API.getActiveTab().index === 0;

  API.goToTab(0);     await API.whenSettled(1500);
  API.prevTab();      await API.whenSettled(2000);
  R['loop closes backward (first -> last)'] = API.getActiveTab().index === n - 1;

  API.goToTab(0);     await API.whenSettled(1500);
  R['every page is prepared once visited'] =
      real().every(p => p.querySelectorAll('table.dyn').length === 0 ||
                        p.querySelectorAll('.car-hscroll > table.dyn').length > 0);
  R['skeletons clear as pages are visited'] =
      real().filter(p => p.hasAttribute('data-skeleton')).length < n;

  /* ---- conditional section --------------------------------------------- */
  const slots = document.getElementById('spellSlotsSection');
  if(slots){
    const was     = slots.style.display;
    const atStart = API.getTabCount();
    /* The sheet hides this section for a non-shugenja (applySchool sets
       style.display directly), and that is the default character. Hiding an
       already-hidden section is a no-op, so the test has to SHOW it first —
       otherwise the count cannot drop and the assertion fails on every ordinary
       load without anything being wrong. */
    slots.style.display = '';
    await wait(350);
    const before = API.getTabCount();
    slots.style.display = 'none';
    await wait(350);
    R['hidden section withdraws its tab']    = API.getTabCount() === before - 1;
    R['hidden section drops its identity']   =
        document.querySelectorAll('.car-page[hidden][data-testid], .car-page[hidden][id]').length === 0;
    R['no duplicate testids after withdraw'] =
        dup([...document.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid'))).length === 0;
    slots.style.display = was;
    await wait(350);
    /* `was`, not `''` — the suite leaves the sheet exactly as it found it, so
       the count returns to the one it started with, not the one it forced. */
    R['section returns cleanly'] = API.getTabCount() === atStart;
  }

  const failed = Object.keys(R).filter(k => !R[k]);
  const out = { total: Object.keys(R).length, passed: Object.keys(R).length - failed.length, failed, detail: R };

  console.log('%c[carousel-qa] ' + out.passed + '/' + out.total + ' passed',
              'font-weight:bold;color:' + (failed.length ? '#a3332a' : '#3f6f95'));
  if(failed.length){
    failed.forEach(f => console.error('  FAIL  ' + f));
    console.log('state at failure:', API.getState());
  }
  return out;
})();
