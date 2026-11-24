  // ============ PART H PHASE 15.2.8 — YOU REMAIN IN CONTROL ============
  // Phase 15, Release 15b, unit B05 (group 2, action labels and wording), approved by the owner on 24 November 2026
  // ("Approve as recommended": with Lord Moon's line too); "You remain in control" is Q8's, accepted on 1 November 2026.
  // Two Willpower checks whose success means keeping control say so in the same words:
  //   Touch of the Void (Core p.162)    "You keep your head."                                 becomes
  //                                      "You remain in control."
  //   Lord Moon's Curse (Core p.160)    "Willpower roll passed. You keep control tonight."    becomes
  //                                      "Willpower roll passed. You remain in control tonight."
  // The words are changed where the roll is asked for, before the roll window opens, so the window, a reroll that
  // copies the roll's words (Dark Paragon, Luck, Unlucky, the Ancestors' gifts) and anything else that reads them get
  // the new words. Only these two titles with these exact words are touched; every other roll goes through unchanged.
  // Words only: the TNs, the dice, the failure lines and what the sheet does after are Feature 4.5.33's (Part I) and
  // the Lord Moon's Curse fix's own. Screen only; nothing is saved.
  const REMAIN_IN_CONTROL_ENABLED = true;

  const RC15 = (function(){
    const api = {installed: false};
    api.LINES = Object.freeze([
      Object.freeze({title: /^Touch of the Void — Willpower vs TN \d+$/, was: 'You keep your head.', now: 'You remain in control.'}),
      Object.freeze({title: /^Lord Moon’s Curse — Willpower vs TN \d+$/, was: 'Willpower roll passed. You keep control tonight.',
        now: 'Willpower roll passed. You remain in control tonight.'})
    ]);
    api.enabled = function(){ return REMAIN_IN_CONTROL_ENABLED === true && typeof rollWithModifiers === 'function'; };
    // The options with the new words, or the same options when nothing matches.
    api.reword = function(title, opts){
      const tn = opts && opts.tnConfig;
      if(!tn || typeof tn.successText !== 'string') return opts;
      const line = api.LINES.find(function(l){ return l.was === tn.successText && l.title.test(String(title || '')); });
      return line ? Object.assign({}, opts, {tnConfig: Object.assign({}, tn, {successText: line.now})}) : opts;
    };
    api.install = function(){
      if(api.installed || !api.enabled()) return false;
      const previous = rollWithModifiers;
      rollWithModifiers = function(title){
        const args = Array.prototype.slice.call(arguments);
        try { args[4] = api.reword(title, args[4]); } catch(e){}
        return previous.apply(this, args);
      };
      api.installed = true;
      return true;
    };
    return api;
  })();
  if(REMAIN_IN_CONTROL_ENABLED) RC15.install();
  // ============ END PART H PHASE 15.2.8 RC15 ============
