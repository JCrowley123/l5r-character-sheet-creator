  // ============ PART H PHASE 15.1.2 — FLOATING CONTROLS ON ONE STRIP ABOVE THE TABS ============
  // Phase 15, Release 15a, finding A02 (owner's ruling Q2, 1 November 2026: one navigation system, a compact action
  // strip above the existing tabs, Search stays in the app bar, no second destination bar). On a phone the three
  // floating controls lay over the sheet: Quick Access's circle over each page's heading, the return-to-top control
  // on the tab bar, and the dice over the lowest fields. This layer reserves one band of the screen between the pages
  // and the tab bar, so the pages end above it, and its stylesheet (1128-floating-strip.css) places the SAME three
  // buttons on that band: Quick Access on the left, return-to-top in the middle (still shown only once the page has
  // scrolled, by Phase 1's own rule), the dice on the right. The buttons are not moved, copied or rewired: their
  // markup, listeners, names and stacking stay exactly as they were. With the switch off, or without the carousel's
  // shell and tab bar, nothing is added and the page is exactly as before.
  const FLOATING_STRIP_ENABLED = true;

  const FC15 = (function(){
    const api = {installed: false};
    api.enabled = function(){ return FLOATING_STRIP_ENABLED; };
    api.strip = function(){ return document.getElementById('fc15Strip'); };
    // Adds the band once, directly before the carousel's tab bar inside its shell, and the body class the
    // stylesheet waits for. The band is decoration and space only: the controls placed on it keep their own names.
    api.install = function(){
      if(api.installed || !FLOATING_STRIP_ENABLED) return false;
      const shell = document.getElementById('carShell');
      const tabbar = document.getElementById('carTabbar');
      if(!shell || !tabbar || tabbar.parentElement !== shell) return false;
      const strip = document.createElement('div');
      strip.id = 'fc15Strip';
      strip.className = 'fc15-strip print-hide';
      strip.setAttribute('aria-hidden', 'true');
      shell.insertBefore(strip, tabbar);
      document.body.classList.add('fc15-on');
      api.installed = true;
      return true;
    };
    return api;
  })();
  FC15.install();
  // ============ END PART H PHASE 15.1.2 ============
