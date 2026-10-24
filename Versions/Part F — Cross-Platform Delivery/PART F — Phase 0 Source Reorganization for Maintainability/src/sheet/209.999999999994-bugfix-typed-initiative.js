  // ============ BUGFIX INITDICE — A TYPED INITIATIVE TOTAL IS THE DICE ============
  // FT-23 (the owner's check I5): Feature 4.5.35 took a typed total as the whole score, holding the bonuses of the
  // moment, so typed after a Void +10 a 23 stayed 23. A typed total is now the dice alone, and
  // Center, Void and Quick go on top as they do for a rolled one (23 with Void +10 is 33). The box says so.
  // Interface: INITDICE.enabled(), .set(value). Switch TYPED_INITIATIVE_DICE_ENABLED.
  const TYPED_INITIATIVE_DICE_ENABLED = true;

  var INITDICE = (function(){
    const api = {};
    api.PLACEHOLDER = 'Your dice total';
    api.LABEL = 'Your Initiative dice total, before bonuses';
    api.enabled = function(){
      return TYPED_INITIATIVE_DICE_ENABLED === true && typeof IS4535 === 'object' && !!IS4535 && IS4535.enabled();
    };
    // Logic: the typed number holds no bonuses.
    api.set = function(value){
      const n = parseInt(value, 10);
      if(!Number.isFinite(n) || String(value).trim() === '') return false;
      return IS4535.record(n, 0);
    };
    // UI hook: Feature 4.5.35's box under the Combat card's Initiative.
    api.label = function(){
      const input = document.getElementById('is4535Input');
      if(!input) return false;
      input.placeholder = api.PLACEHOLDER;
      input.setAttribute('aria-label', api.LABEL);
      return true;
    };
    return api;
  })();

  if(INITDICE.enabled() && typeof IS4535UI === 'object' && IS4535UI){
    IS4535.set = INITDICE.set;
    const initDicePreviousLine = IS4535UI.line;
    IS4535UI.line = function(){
      const line = initDicePreviousLine.apply(this, arguments);
      INITDICE.label();
      return line;
    };
  }
  // ============ END BUGFIX INITDICE ============
