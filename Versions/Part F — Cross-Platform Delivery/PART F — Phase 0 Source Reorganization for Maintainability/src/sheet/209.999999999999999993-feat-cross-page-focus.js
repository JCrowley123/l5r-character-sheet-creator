  // ============ PART H PHASE 15.1.25 — CROSS-PAGE ACTIONS MOVE FOCUS ============
  // Phase 15, Release 15a, finding A10 (FT-50 and FT-52, group G4), approved as mocked up by the owner on
  // 12 November 2026. The number 25 is this unit's marker only; the finding keeps its identifier, A10.
  // Go to Advanced Schools, under Identity's Add School, opens the Techniques page. Two faults (owner, 29 October):
  // on a laptop the button sat 4 px below its hint's line (FT-50); and after the tap the button kept focus, so the
  // Identity page it sits on stayed live behind Techniques: the next Tab key went to Honour Rank on the hidden page
  // (FT-52). The owner's rule for Phase 15: any button that opens another page moves focus to what it opened.
  // The stylesheet (1143-cross-page-focus.css) lays the hint and the button out in one wrapping row, centred on each
  // other, 44 px touch height kept. This fragment moves focus: when a listed button is pressed, it waits for the
  // carousel to settle on the page it opened (and for that button's own scrolling), then focuses the heading that
  // names what was opened. The heading takes focus only for that moment (tabindex -1, given back when it loses focus)
  // and draws no ring; a heading is not a text box, so a phone keyboard does not open. The carousel itself then makes
  // the page left behind inert, as it does for every page that does not hold focus.
  // ROUTES lists each button that opens another page. Today there is one: the Advanced Schools pointer's (AP7).
  // A later cross-page button is one more line here.
  // Everything waits for body.cp15-on, which the switch sets: with the switch off the sheet is exactly as before.
  const CROSS_PAGE_FOCUS_ENABLED = true;

  const CP15 = (function(){
    const api = {installed: false, moves: 0};
    api.ROUTES = [
      {control: '#ap7Go', page: 'Techniques', heading: '#advancedSchoolPanel h3'}
    ];
    api.enabled = function(){ return CROSS_PAGE_FOCUS_ENABLED; };
    api.active = function(){ return !!document.body && document.body.classList.contains('cp15-on'); };
    const frames = function(){ return new Promise(function(resolve){ requestAnimationFrame(function(){ requestAnimationFrame(resolve); }); }); };
    const drawn = function(el){ return !!el && el.getClientRects().length > 0; };
    // The heading takes focus for this moment only: whatever tabindex it had is given back when it loses focus.
    api.focusHeading = function(heading){
      if(!heading) return false;
      const had = heading.getAttribute('tabindex');
      if(had === null) heading.setAttribute('tabindex', '-1');
      heading.setAttribute('data-cp15-target', '');
      heading.addEventListener('blur', function(){
        heading.removeAttribute('data-cp15-target');
        if(had === null) heading.removeAttribute('tabindex');
      }, {once: true});
      heading.focus({preventScroll: true});
      return document.activeElement === heading;
    };
    // After the carousel settles on the route's page: its own heading if drawn, otherwise the page's first heading.
    api.follow = async function(route){
      const carousel = window.__L5R_CAROUSEL__;
      if(!carousel || typeof carousel.whenSettled !== 'function' || typeof carousel.getActiveTab !== 'function') return false;
      await carousel.whenSettled();
      await frames();
      const tab = carousel.getActiveTab();
      if(!api.active() || !tab || tab.label !== route.page || !tab.panel) return false;
      const own = tab.panel.querySelector(route.heading);
      const heading = drawn(own) ? own : [...tab.panel.querySelectorAll('h2, h3')].find(drawn);
      const moved = api.focusHeading(heading);
      if(moved) api.moves++;
      return moved;
    };
    // Bubbling to the document, so the button's own handler has already started the move.
    api.onClick = function(event){
      if(!api.active() || !event.target || !event.target.closest) return;
      const route = api.ROUTES.find(function(r){ return event.target.closest(r.control); });
      if(route) api.follow(route);
    };
    api.install = function(){
      if(api.installed || !CROSS_PAGE_FOCUS_ENABLED) return false;
      api.installed = true;
      document.body.classList.add('cp15-on');
      document.addEventListener('click', api.onClick);
      return true;
    };
    return api;
  })();
  CP15.install();
  // ============ END PART H PHASE 15.1.25 ============
