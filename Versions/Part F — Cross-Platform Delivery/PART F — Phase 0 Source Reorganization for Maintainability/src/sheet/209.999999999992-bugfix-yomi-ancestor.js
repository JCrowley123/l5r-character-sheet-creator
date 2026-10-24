  // ============ BUGFIX YOMIANC — YOMI SEES THE ANCESTOR ============
  // FT-45 (22 October 2026): Cursed by the Realm (Yomi) flags the sheet's ancestral entries (Feature 4.5.10), but read
  // only the Advantage and Disadvantage lists, and Phase 4.8's Ancestor has its own card (f_ancestor). Yomi's
  // ancestors have turned away (Core p.158), so a chosen Ancestor is flagged too, by name, whatever its favour; as
  // before, nothing is removed or switched off. The row is redrawn on every recalc, and choosing an Ancestor recalcs.
  // Interface: YOMIANC.enabled(), .label(). Switch YOMI_ANCESTOR_ENABLED.
  const YOMI_ANCESTOR_ENABLED = true;

  var YOMIANC = (function(){
    const api = {};
    api.enabled = function(){
      return YOMI_ANCESTOR_ENABLED === true && typeof R4510 === 'object' && !!R4510 && typeof R4510.ancestralPresent === 'function'
        && typeof ANC48 === 'object' && !!ANC48 && typeof ANC48.current === 'function';
    };
    // 'Ancestor: <name>' for the Ancestor on the sheet, or ''.
    api.label = function(){
      const s = api.enabled() ? ANC48.current() : null;
      return s && s.name ? 'Ancestor: ' + s.name : '';
    };
    return api;
  })();

  if(YOMIANC.enabled()){
    const yomiAncPreviousPresent = R4510.ancestralPresent;
    R4510.ancestralPresent = function(){
      const found = yomiAncPreviousPresent.apply(this, arguments);
      const label = YOMIANC.label();
      if(label && Array.isArray(found) && found.indexOf(label) === -1) found.push(label);
      return found;
    };
  }
  // ============ END BUGFIX YOMIANC ============
