  // ============ PART H PHASE 15.1.35 — THE DAMAGE ROW FITS A PHONE ============
  // Phase 15, Release 15a, unit A19.1 (group G6, new functions), approved by the owner on 19 November 2026 as mocked up,
  // after G6's device round: on the Combat page's Void card, the row "Reduce damage by 10" opens wrapped its Apply button
  // onto four lines on a phone and ran Cancel past the card's edge (as on the live app; A19 did not cause it). The number
  // 35 is this unit's marker only; the unit keeps its identifier, A19.1.
  // Screen only: this fragment marks the page (body.dr15-on) so that the unit's stylesheet lets the row wrap, keeps each
  // button's words on one line and, at 640 px wide or less, gives each button the row's full width beneath the amount.
  // Words, buttons, what they do and print are unchanged. Nothing is saved.
  const DAMAGE_ROW_FIT_ENABLED = true;

  const DR15 = (function(){
    const api = {installed: false};
    api.enabled = function(){ return DAMAGE_ROW_FIT_ENABLED === true && !!document.getElementById('voidDamageRow'); };
    api.install = function(){
      if(api.installed || !api.enabled() || !document.body) return false;
      document.body.classList.add('dr15-on');
      api.installed = true;
      return true;
    };
    return api;
  })();
  if(DAMAGE_ROW_FIT_ENABLED) DR15.install();
  // ============ END PART H PHASE 15.1.35 DR15 ============
