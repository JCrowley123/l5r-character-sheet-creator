  // ============ BUGFIX RPTOP — THE ROLL PREVIEW OPENS AT THE TOP ============
  // FT-21: the roll preview (Phase 3 of Part G) is one card shown and hidden for every roll, and the card kept its
  // scroll, so after scrolling down in one roll's preview every later one opened part-way down. It now opens at the top.
  // Interface: RPTOP.enabled(), .toTop(). Switch ROLL_PREVIEW_TOP_ENABLED.
  const ROLL_PREVIEW_TOP_ENABLED = true;

  var RPTOP = (function(){
    const api = {};
    api.enabled = function(){ return ROLL_PREVIEW_TOP_ENABLED === true; };
    // UI hook: the preview's card (#rollPreviewOverlay .roll-modal), the element that scrolls.
    api.toTop = function(){
      const overlay = document.getElementById('rollPreviewOverlay');
      const card = overlay && overlay.querySelector('.roll-modal');
      if(!api.enabled() || !card) return false;
      card.scrollTop = 0;
      overlay.scrollTop = 0;
      return true;
    };
    return api;
  })();

  if(ROLL_PREVIEW_TOP_ENABLED && typeof showRollPreview === 'function'){
    const rpTopPreviousShow = showRollPreview;
    showRollPreview = function(){
      const shown = rpTopPreviousShow.apply(this, arguments);   // shows the card before it returns
      RPTOP.toTop();
      return shown;
    };
  }
  // ============ END BUGFIX RPTOP ============
