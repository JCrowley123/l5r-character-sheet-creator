  // ============ BUGFIX SEARCHFOCUS — SEARCH FOCUS ON CLOSE ============
  // Closing an entry hides its focused heading; focus returns to the result that opened it,
  // so a second Escape reaches the Characters screen. Search's own code is unchanged.
  // Interface: SEARCHFOCUS.enabled(), .target(id).
  const SEARCH_FOCUS_FIX_ENABLED = true;

  const SEARCHFOCUS = (function(){
    const api = {};

    api.enabled = function(){
      return SEARCH_FOCUS_FIX_ENABLED && typeof SEARCHPAGE14 === 'object' && !!SEARCHPAGE14 && SEARCHPAGE14.enabled();
    };

    function page(){ return document.querySelector('.s14-page'); }
    function shown(n){ return !!n && !n.hidden && n.getClientRects().length > 0; }

    // The entry's own result, else the first shown result, else the category link.
    // Never the text field: focusing it opens the iPhone keyboard.
    api.target = function(id){
      const p = page();
      if(!p) return null;
      const rows = Array.prototype.filter.call(p.querySelectorAll('.s14-row'), shown);
      const own = rows.filter(function(b){ return b.dataset.id === id; })[0];
      if(own) return own;
      if(rows.length) return rows[0];
      const up = p.querySelector('[data-s14="up"]');
      return shown(up) ? up : null;
    };

    api.install = function(){
      if(!api.enabled()) return;
      let shownId = null;
      // UI hook: wraps Search's page render. Installed after the facets wrapper, so the list is final before focus moves.
      const baseRender = SEARCHPAGE14.render;
      SEARCHPAGE14.render = function(){
        const closing = shownId;
        const p = closing && page(), detail = p && p.querySelector('[data-s14="detail"]');
        const held = !!detail && !detail.hidden && detail.contains(document.activeElement);
        const out = baseRender.apply(this, arguments);
        shownId = SEARCHPAGE14.state().detailId;
        if(held && !shownId){
          const t = api.target(closing);
          if(t) t.focus({ preventScroll: true });
        }
        return out;
      };
    };

    return api;
  })();

  if(SEARCH_FOCUS_FIX_ENABLED) SEARCHFOCUS.install();
  // ============ END BUGFIX SEARCHFOCUS ============
