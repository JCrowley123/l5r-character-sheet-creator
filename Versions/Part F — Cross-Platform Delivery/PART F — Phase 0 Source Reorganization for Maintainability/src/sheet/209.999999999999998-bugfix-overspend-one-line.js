  // BUGFIX OL8: the wizard's overspend warning, quieter (the owner's ruling, 30 October 2026). XW8's amber box goes, from
  // every step and from the top of Review. Instead one line above the buttons, where "Some of your School's choices are
  // still open." sits, on the step where the overspend first turned up in this wizard run, while it is still overspent;
  // if it clears and comes back on another step, that step takes the line. Review keeps only the sheet's own
  // "Overspent by" item in its findings list, and Finish still asks once (XW8). Where 11.2.2's nudge also writes the
  // line, the nudge wins. Every other reason still blocks Next and keeps the line, as before.
  const OVERSPEND_ONE_LINE_ENABLED = true;
  const OL8 = (() => {
    const api = {};
    const $ = id => document.getElementById(id);
    let run = null;   // the wizard run (CW112.state, new at each start) the step below belongs to
    api.step = '';    // the id of the step where the overspend first turned up in this run, or ''
    api.enabled = () => OVERSPEND_ONE_LINE_ENABLED && typeof XW8 === 'object' && !!XW8 && XW8.enabled();
    // Worked out at every refresh of the buttons, so the step the player is on when the validator first reports the
    // overspend takes the line, and a cleared overspend frees it.
    api.track = () => {
      if(CW112.state !== run){ run = CW112.state; api.step = ''; }
      const step = CW112.steps[CW112.index];
      if(!XW8.overspent()) api.step = '';
      else if(!api.step && step) api.step = step.id;
    };
    // UI hook: the line itself, only where nothing else is said and Next is open.
    api.show = () => {
      api.track();
      const step = CW112.steps[CW112.index], next = $('cw112Next'), reason = $('cw112Reason');
      if(!step || step.id === 'review' || step.id !== api.step || !next || !reason || next.disabled || reason.textContent) return;
      reason.textContent = XW8Logic.stepText(XW8.amounts().over);
    };
    if(api.enabled()){
      // XW8 still removes the red line and marks Review's item as a warning; only its box goes.
      const previousDecorate = XW8.decorate;
      XW8.decorate = function(){
        const out = previousDecorate.apply(this, arguments);
        if(api.enabled()){ const box = $('xw8Warning'); if(box) box.remove(); }
        return out;
      };
      const previousRefreshNav = CW112.refreshNav;
      CW112.refreshNav = function(){
        const out = previousRefreshNav.apply(this, arguments);
        if(api.enabled() && CW112.view) api.show();
        return out;
      };
    }
    return api;
  })();
