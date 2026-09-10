  // ============ PART H PHASE 2: QUICK-ACCESS SIDEBAR ============
  // A "sidebar" in name, per the roadmap -- but not a permanently pinned side rail. Measured
  // directly (see this phase's README) at both a 390px phone and a 1440px desktop: even at
  // 1440px the margin beside the sheet's own 1180px-capped column is already occupied by the
  // carousel's own prev/next arrows and is too narrow for five readable stat rows, and a
  // permanently open panel on a phone would either shrink the carousel or violate the
  // roadmap's own validation criterion "does not overlap or hide main content" outright. So
  // this is the same shape as the existing floating dice button and scroll-to-top button: a
  // toggle, fixed-position, opening a small anchored panel — non-intrusive when closed (just
  // a button), and only ever overlaying content the same way every modal on this sheet already
  // does when open.
  //
  // READ-ONLY BY DESIGN. The roadmap's own Validation Test Suite only asks that the panel
  // "updates instantly when values change" -- nothing requires the panel itself be a second
  // interactive control surface. Void pips and Spell Slot pips are normally click-to-spend
  // (110-modals-trackers.js); mirroring them as a SECOND clickable surface here would mean two
  // independent places that mutate the same state, which is exactly the class of synchronization
  // risk this project just spent two rounds fixing in the carousel's own tab visibility. A
  // glance-only mirror satisfies every stated requirement with none of that risk. Interactivity
  // is a natural, separate, additive follow-up if ever wanted -- not something this phase needs.
  //
  // FIVE PINNED VALUES, each read from the exact element the rest of the sheet already treats
  // as authoritative -- this file computes none of them itself:
  //   Void       -- #void_current / #ring_void (same source renderVoidPips() uses)
  //   Spell Slots -- #ring_<key> / #spell_used_<key> per SPELL_ELEMENTS entry, shown only for a
  //                  caster (characterCasterLock() === 'shugenja'), the same gate
  //                  updateSpellSlotsVisibility() already uses for the Spell Slots tab itself.
  //                  Bonus slots (spell_bonus_used_shared) are deliberately NOT folded into this
  //                  count -- a glance total that agreed with the per-element base slots but not
  //                  with the tab's own bonus-adjusted number would be worse than omitting bonus
  //                  slots outright, and the full tab is one navigation away for that detail.
  //   Wounds     -- #woundSummaryLine's own textContent, mirrored verbatim rather than
  //                 reformatted, so there is exactly one place the wording is decided
  //   Armor TN   -- #f_currentTN
  //   Initiative -- #f_initiative
  //
  // Called from renderWounds(), renderVoidPips() and renderSpellPips() -- not from recalcAll()
  // itself. recalcAll() always finishes by calling renderWounds() last, so a full recalc pass
  // still refreshes every one of the five values after they are all final -- but Void pips,
  // the wound stepper/slider, and the Cast-spell button each mutate state through their own
  // narrower render function WITHOUT going through recalcAll() at all (see each function's own
  // PART H PHASE 2 comment for why). A panel that only refreshed on a full recalcAll() pass
  // would silently go stale the moment any of those three controls were used while it was open
  // -- exactly the roadmap's own validation criterion ("updates instantly when values change")
  // failing in practice. Hooking the render functions those controls actually call, rather than
  // only recalcAll(), is what closes that gap.

  function renderQuickAccessPanel(){
    const panel = document.getElementById('quickAccessPanel');
    if(!panel) return;

    // ---- Void ----
    const voidRank = Math.max(0, parseInt(document.getElementById('ring_void').value||'0',10));
    const voidCurrent = Math.max(0, parseInt(document.getElementById('void_current').value||'0',10));
    document.getElementById('qaVoidValue').textContent = `${voidCurrent} / ${voidRank}`;
    const pipsWrap = document.getElementById('qaVoidPips');
    pipsWrap.innerHTML = '';
    for(let i=0;i<voidRank;i++){
      const dot = document.createElement('span');
      dot.className = 'qa-pip' + (i<voidCurrent ? ' filled' : '');
      pipsWrap.appendChild(dot);
    }

    // ---- Spell Slots (casters only) ----
    const spellRow = document.getElementById('qaSpellSlotsRow');
    const isCaster = (typeof characterCasterLock === 'function') && characterCasterLock() === 'shugenja';
    spellRow.hidden = !isCaster;
    if(isCaster){
      const parts = SPELL_ELEMENTS.map(el=>{
        const rank = Math.max(0, parseInt(document.getElementById('ring_'+el.key).value||'0',10));
        const usedEl = document.getElementById('spell_used_'+el.key);
        const used = Math.max(0, Math.min(rank, parseInt(usedEl && usedEl.value||'0',10)));
        return `${el.name} ${rank-used}/${rank}`;
      });
      document.getElementById('qaSpellSlotsValue').textContent = parts.join(' · ');
    }

    // ---- Wounds: mirrored verbatim, not reformatted ----
    const woundSummary = document.getElementById('woundSummaryLine');
    document.getElementById('qaWoundsValue').textContent = woundSummary ? woundSummary.textContent : '';

    // ---- Armor TN / Initiative ----
    document.getElementById('qaArmorTNValue').textContent = document.getElementById('f_currentTN').value;
    document.getElementById('qaInitiativeValue').textContent = document.getElementById('f_initiative').value;
  }

  // ---- Open/close ------------------------------------------------------------------------
  function isQuickAccessPanelOpen(){
    const panel = document.getElementById('quickAccessPanel');
    return !!panel && !panel.hidden;
  }
  function openQuickAccessPanel(){
    const panel = document.getElementById('quickAccessPanel');
    const btn = document.getElementById('quickAccessToggleBtn');
    if(!panel || !btn) return;
    renderQuickAccessPanel();
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  }
  function closeQuickAccessPanel(){
    const panel = document.getElementById('quickAccessPanel');
    const btn = document.getElementById('quickAccessToggleBtn');
    if(!panel || !btn) return;
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }
  function toggleQuickAccessPanel(){
    if(isQuickAccessPanelOpen()) closeQuickAccessPanel(); else openQuickAccessPanel();
  }
  // The header (#carTopbar: title + save/load toolbar) sits in a fixed-height band this sheet
  // never scrolls out from under -- .car-shell is a fixed-height flex column and only the
  // carousel's own pages scroll internally (20-carousel.css). Anchoring the toggle button
  // below it therefore needs that height, measured rather than guessed: it varies with the
  // character name's length wrapping to a second line, font-size zoom, and viewport width.
  // Published as a CSS variable, the same technique 10-carousel.js already uses for
  // --car-tabbar-h, so a resize or content change keeps the button correctly placed.
  function publishTopbarHeight(){
    const topbar = document.getElementById('carTopbar');
    if(topbar) document.documentElement.style.setProperty('--qa-topbar-h', topbar.offsetHeight + 'px');
  }
  // Wired from init() in 210-test-seam-and-init.js.
  function initQuickAccessPanel(){
    const btn = document.getElementById('quickAccessToggleBtn');
    const panel = document.getElementById('quickAccessPanel');
    const closeBtn = document.getElementById('quickAccessCloseBtn');
    if(!btn || !panel) return;
    publishTopbarHeight();
    window.addEventListener('resize', publishTopbarHeight);
    btn.addEventListener('click', e=>{ e.stopPropagation(); toggleQuickAccessPanel(); });
    if(closeBtn) closeBtn.addEventListener('click', e=>{ e.stopPropagation(); closeQuickAccessPanel(); });
    // Click-outside-to-close, the same convention this sheet's own overlays use (see
    // stanceInfoOverlay's own backdrop-click handler) -- but this panel has no full-screen
    // backdrop element of its own (deliberately, to stay non-intrusive), so the equivalent
    // here is a document-level listener that closes on any click landing outside both the
    // panel and its toggle button.
    document.addEventListener('click', e=>{
      if(!isQuickAccessPanelOpen()) return;
      if(panel.contains(e.target) || btn.contains(e.target)) return;
      closeQuickAccessPanel();
    });
    document.addEventListener('keydown', e=>{
      if(e.key === 'Escape' && isQuickAccessPanelOpen()) closeQuickAccessPanel();
    });
  }
  // ============ END PART H PHASE 2 ============
