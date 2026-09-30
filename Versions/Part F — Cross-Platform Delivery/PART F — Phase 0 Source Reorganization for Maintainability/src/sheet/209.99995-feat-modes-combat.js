  // ============ PART K PHASE 12.7 — PLAY AND MANAGEMENT MODES: COMBAT ============
  // Owner's ruling (the Phase 12 table, 25 September 2026): Combat is a Play tab. In Management it
  // does not appear at all -- not in the tab bar, not in the swipe loop. Nothing inside Combat is
  // locked by the mode, and no combat rule, value or save field changes: the page is only taken out
  // of the carousel, the way Spell Slots is for a character who casts nothing.
  //
  // It uses the carousel's own conditional-page path. The Combat page names an element that sits
  // outside the carousel, so Safari's report of display:none for everything inside a hidden page
  // cannot reach it; this part hides that element in Management. The carousel's own observer
  // follows it, and refreshVisibility() makes a switch take effect at once. Switching to Management
  // while on Combat first moves to the next tab that is shown, instead of back to the first tab.
  const MODES127_ENABLED = true;

  const MODES127 = {
    gateId: 'pm127CombatShown',
    page: function(){
      return document.querySelector('.car-page[data-tab-label="Combat"]:not([data-clone])');
    },
    gate: function(){ return document.getElementById(this.gateId); },
    // The page a player lands on when Combat disappears under them: the next shown page, else the
    // one before it.
    neighbour: function(){
      const page = this.page();
      if(!page) return null;
      const shown = function(p){
        return p && p.classList.contains('car-page') && !p.hasAttribute('data-clone') && !p.hasAttribute('hidden');
      };
      for(let p = page.nextElementSibling; p; p = p.nextElementSibling) if(shown(p)) return p;
      for(let p = page.previousElementSibling; p; p = p.previousElementSibling) if(shown(p)) return p;
      return null;
    },
    apply: function(){
      const gate = this.gate();
      if(!gate) return;
      const show = MODES12.isPlay();
      if(gate.hidden === !show) return;
      const carousel = window.__L5R_CAROUSEL__;
      let moved = false;
      if(!show && carousel && typeof carousel.getActiveTab === 'function' && typeof carousel.goToTab === 'function'){
        const active = carousel.getActiveTab();
        const next = active && active.panel === this.page() ? this.neighbour() : null;
        // goToTab commits the new page at once; the rebuild below then keeps it.
        if(next) moved = !!carousel.goToTab(next.getAttribute('data-tab-label'));
      }
      gate.hidden = !show;
      if(carousel && typeof carousel.refreshVisibility === 'function') carousel.refreshVisibility();
      // goToTab also starts a smooth glide towards the next page's OLD position. With Combat gone
      // that page now sits exactly where the track rests, so the carousel has nothing to correct
      // and the glide would run on past it and back. Any scroll ends a smooth scroll in progress
      // (CSSOM View), and the track sets no scroll-behavior, so this one is instant.
      if(moved){
        const track = document.querySelector('.car-track');
        if(track) track.scrollLeft = track.scrollLeft;
      }
    },
    install: function(){
      if(typeof MODES12_ENABLED === 'undefined' || !MODES12_ENABLED ||
         typeof MODES12 !== 'object' || !MODES12 || typeof MODES12.refresh !== 'function') return;
      const page = this.page();
      if(!page || page.hasAttribute('data-visible-with') || !document.body || this.gate()) return;
      const gate = document.createElement('span');
      gate.id = this.gateId;
      gate.setAttribute('aria-hidden', 'true');
      gate.hidden = !MODES12.isPlay();
      document.body.appendChild(gate);
      page.setAttribute('data-visible-with', '#' + this.gateId);
      // Activates this part's print rule (Combat prints in either mode) only once installed.
      document.body.classList.add('pm127-enabled');
      // Every mode change and every registration goes through MODES12.refresh, reached by property.
      const self = this;
      const previousRefresh = MODES12.refresh;
      MODES12.refresh = function(){
        const result = previousRefresh.apply(this, arguments);
        self.apply();
        return result;
      };
    }
  };

  if(MODES127_ENABLED) MODES127.install();
  // ============ END PART K PHASE 12.7 MODES127 ============
