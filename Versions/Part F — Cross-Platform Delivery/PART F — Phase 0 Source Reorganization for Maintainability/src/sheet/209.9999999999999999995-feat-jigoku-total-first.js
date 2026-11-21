  // ============ PART H PHASE 15.2.4 — JIGOKU'S TOTAL, THEN ITS ARITHMETIC ============
  // Phase 15, Release 15b, unit B14 (group 1, totals and their breakdowns), approved by the owner on 20 November 2026
  // as mocked up ("B04 and B14: approved as shown"); its short sum stays because Jigoku has no level name to stand for
  // the figure (the owner's round-2 reading).
  // Touch of the Spirit Realms (Jigoku) (Feature 4.5.24 (Part I)) words its total first, then how it is made:
  //   roll preview  "+8 to total — Lost: twice Taint Rank 4"   becomes  "+8 to total — Taint Rank 4 × 2 (Lost)"
  //                 "+4 to total — Taint Rank 4"                stays as it is
  //   the card      "Adding 8 (Taint Rank 4, doubled: Lost)."  becomes  "Adding +8 — Taint Rank 4 × 2 (Lost)."
  //                 "Adding 4 (Taint Rank 4)."                 becomes  "Adding +4 — Taint Rank 4."
  // Words only: the figures are Feature 4.5.24's own, read from its own text. Text it does not recognise is left as it
  // is. The formula, the gate (attack rolls and Physical Trait rolls), Cursed by the Realm (Jigoku) and the Lost tick
  // are not touched. Screen only; nothing is saved.
  const JIGOKU_TOTAL_FIRST_ENABLED = true;

  const JK15 = (function(){
    const api = {installed: false};
    api.LABEL = 'Touch of the Spirit Realms (Jigoku)';
    api.NOTE_RE = /^Lost: twice Taint Rank (\d+)$/;
    api.CARD_RE = /^Adding (\d+) \(Taint Rank (\d+)(, doubled: Lost)?\)\.$/;
    api.enabled = function(){
      return JIGOKU_TOTAL_FIRST_ENABLED === true && typeof TR4524 === 'object' && !!TR4524 &&
        typeof TR4524.modifiers === 'function' && typeof TR4524.refresh === 'function';
    };
    // The roll's note, after "+8 to total — ".
    api.note = function(text){
      const m = api.NOTE_RE.exec(String(text || ''));
      return m ? 'Taint Rank ' + m[1] + ' × 2 (Lost)' : text;
    };
    // The card's line.
    api.card = function(text){
      const m = api.CARD_RE.exec(String(text || ''));
      return m ? 'Adding +' + m[1] + ' — Taint Rank ' + m[2] + (m[3] ? ' × 2 (Lost)' : '') + '.' : text;
    };
    api.rewordCard = function(div){
      const row = div && div.querySelector ? div.querySelector('.adv-config-row') : null;
      if(!row) return;
      row.querySelectorAll('.tr4524-note').forEach(function(p){
        const text = api.card(p.textContent);
        if(text !== p.textContent) p.textContent = text;
      });
    };
    api.install = function(){
      if(api.installed || !api.enabled()) return false;
      const previousModifiers = TR4524.modifiers;
      TR4524.modifiers = function(){
        const out = previousModifiers.apply(this, arguments);
        try {
          return (out || []).map(function(m){
            return m && m.label === api.LABEL && typeof m.note === 'string' ? Object.assign({}, m, {note: api.note(m.note)}) : m;
          });
        } catch(e){ return out; }
      };
      const previousRefresh = TR4524.refresh;
      TR4524.refresh = function(div){
        const result = previousRefresh.apply(this, arguments);
        try { if(result) api.rewordCard(div); } catch(e){}
        return result;
      };
      api.installed = true;
      return true;
    };
    return api;
  })();
  if(JIGOKU_TOTAL_FIRST_ENABLED) JK15.install();
  // ============ END PART H PHASE 15.2.4 JK15 ============
