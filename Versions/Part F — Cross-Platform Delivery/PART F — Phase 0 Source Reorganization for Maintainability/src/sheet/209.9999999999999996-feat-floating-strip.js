  // ============ PART H PHASE 15.1.2 — FLOATING CONTROLS IN THE BOTTOM CORNERS, ABOVE THE TABS ============
  // Phase 15, Release 15a, finding A02 (owner's ruling Q2, 1 November 2026: Search stays in the app bar, no second
  // destination bar). On a phone the three floating controls lay over the sheet: Quick Access's circle over each
  // page's heading, the return-to-top control on the tab bar, and the dice over the lowest fields even at the very
  // end of a page. Revision 2 (owner's ruling, 5 November 2026, after device checks): no band above the tabs; the
  // stylesheet (1128-floating-strip.css) places the SAME three buttons in the bottom corners just above the tab bar,
  // Quick Access on the left, the dice on the right and return-to-top above the dice (still shown only once the page
  // has scrolled, by Phase 1's own rule), and gives every page room at its end so nothing is left under them. The
  // buttons are not moved, copied or rewired: their markup, listeners, names and stacking stay exactly as they were.
  // This script only sets the body class the stylesheet waits for. With the switch off, or without the carousel's
  // shell and tab bar, nothing is set and the page is exactly as before.
  const FLOATING_STRIP_ENABLED = true;

  const FC15 = (function(){
    const api = {installed: false};
    api.enabled = function(){ return FLOATING_STRIP_ENABLED; };
    // Sets the body class once, only where the carousel's shell holds its tab bar (the placements are measured from it).
    api.install = function(){
      if(api.installed || !FLOATING_STRIP_ENABLED) return false;
      const shell = document.getElementById('carShell');
      const tabbar = document.getElementById('carTabbar');
      if(!shell || !tabbar || tabbar.parentElement !== shell) return false;
      document.body.classList.add('fc15-on');
      api.installed = true;
      return true;
    };
    return api;
  })();
  FC15.install();
  // ============ END PART H PHASE 15.1.2 ============
