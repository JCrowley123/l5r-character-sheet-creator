  // ============ PART H PHASE 15.1.16 — NO BOTTOM INFORMATION BUTTON IN THE SEVEN PICKERS ============
  // Phase 15, Release 15a, finding A16 (owner's ruling Q3, 1 November 2026: "remove only the redundant bottom i in the
  // seven legacy pickers"; mock-up approved 6 November 2026, option 1). Seven Advantage pickers append their own
  // information button as the last item of the configuration window: Seven Fortunes' Blessing, Dark Paragon,
  // Darling of the Court, Paragon, Soul of Artistry, Touch of the Spirit Realms and Void Versatility (the 24 September
  // device audit's S1/S2). Measured on 6 November: in all seven the window's own note already states the rule, and
  // after Confirm the row's i opens every sentence the bottom one held.
  // An observer on the window's grid removes those seven buttons whenever a picker draws them, the same way Phase 4.54
  // (Part I) watches that grid; the stylesheet (1132-picker-bottom-info.css) keeps them from being painted in between.
  // Each is the grid's direct child (Darling's, its court editor's), which is how these selectors pick exactly that
  // button. The row's i on the Advantages list shares each class but is outside the window and untouched, as is every
  // other information button. The pickers' own fragments are not changed.
  // Everything waits for body.bi15-on, which the switch sets: with the switch off the buttons show as before.
  const PICKER_BOTTOM_INFO_REMOVED_ENABLED = true;

  const BI15 = (function(){
    const api = {installed: false, observer: null};
    api.enabled = function(){ return PICKER_BOTTOM_INFO_REMOVED_ENABLED; };
    api.SELECTOR = ['#advConfigGrid > .fb4521-info', '#advConfigGrid > .dp4523-info', '#advConfigGrid .court4514-editor > .court4514-info',
      '#advConfigGrid > .p4518-info', '#advConfigGrid > .sa4519-info', '#advConfigGrid > .tr4524-info', '#advConfigGrid > .vv4520-info'].join(', ');
    // Only removes, so the mutation it causes finds nothing more and the observer settles at once.
    api.sweep = function(){
      if(!document.body.classList.contains('bi15-on')) return 0;
      const found = Array.from(document.querySelectorAll(api.SELECTOR));
      found.forEach(function(button){ button.remove(); });
      return found.length;
    };
    api.install = function(){
      if(api.installed || !PICKER_BOTTOM_INFO_REMOVED_ENABLED) return false;
      const grid = document.getElementById('advConfigGrid');
      if(!grid) return false;
      api.installed = true;
      document.body.classList.add('bi15-on');
      if(typeof MutationObserver === 'function'){
        api.observer = new MutationObserver(api.sweep);
        api.observer.observe(grid, {childList: true, subtree: true});
      }
      api.sweep();
      return true;
    };
    return api;
  })();
  BI15.install();
  // ============ END PART H PHASE 15.1.16 ============
