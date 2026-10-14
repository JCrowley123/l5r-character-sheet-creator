  // ============ BUGFIX SCREENFOCUS — SCREEN FOCUS FROM THE APP BAR ============
  // Opening the Characters screen focuses its active tab, but the app bar hides those tabs, so focus stayed on the
  // app bar and Escape could not reach the screen. When the app bar opens the screen, focus moves to the shown
  // entry's heading or the panel's title. Never a field (the iPhone keyboard); never at start-up or from a script.
  // Interface: SCREENFOCUS.enabled(), .target().
  const SCREEN_FOCUS_FIX_ENABLED = true;

  const SCREENFOCUS = (function(){
    const api = {};

    api.enabled = function(){
      return SCREEN_FOCUS_FIX_ENABLED && typeof CL11 === 'object' && !!CL11 && CL11.enabled();
    };

    function shown(n){ return !!n && !n.hidden && n.getClientRects().length > 0; }

    // An open Search entry's heading, else the shown panel's title.
    api.target = function(){
      const v = CL11.view;
      if(!shown(v)) return null;
      const panel = Array.prototype.filter.call(v.querySelectorAll('.cl11-panel'), shown)[0];
      if(!panel) return null;
      const entry = panel.querySelector('.s14-detail:not([hidden]) h3');
      if(shown(entry)) return entry;
      const title = panel.querySelector('h2');
      if(!shown(title)) return null;
      if(!title.hasAttribute('tabindex')) title.tabIndex = -1;
      return title;
    };

    // Opened from the app bar (Phase 11.3): its item held focus when the open began.
    function fromControl(el){
      const bar = typeof APPBAR113 === 'object' && APPBAR113 && typeof APPBAR113.element === 'function' ? APPBAR113.element() : null;
      return !!bar && !!el && el !== bar && bar.contains(el);
    }
    function settle(before){
      if(!fromControl(before)) return;
      const v = CL11.view, now = document.activeElement;
      if(v && now && now !== document.body && v.contains(now)) return;
      const t = api.target();
      if(t) t.focus({ preventScroll: true });
    }
    function wrap(owner, name){
      const base = owner[name];
      owner[name] = async function(){
        const before = document.activeElement;
        const out = await base.apply(this, arguments);
        settle(before);
        return out;
      };
    }

    api.install = function(){
      if(!api.enabled()) return;
      // UI hook: the Characters screen's open (Characters, and Search through it).
      wrap(CL11, 'open');
      // UI hook: Search's own open, which redraws an open entry after the screen opens.
      if(typeof SEARCHPAGE14 === 'object' && SEARCHPAGE14 && SEARCHPAGE14.enabled()) wrap(SEARCHPAGE14, 'open');
    };

    return api;
  })();

  if(SCREEN_FOCUS_FIX_ENABLED) SCREENFOCUS.install();
  // ============ END BUGFIX SCREENFOCUS ============
