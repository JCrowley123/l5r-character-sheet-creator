  // ============ PART H PHASE 15.1.23 — SPELL ROWS: REMOVE IN ITS OWN CLEAR CORNER ============
  // Phase 15, Release 15a, follow-up 8b.1-UI-03 (group G3), approved as mocked up by the owner on 11 November 2026.
  // The number 23 is this unit's marker only; the finding keeps its identifier, 8b.1-UI-03.
  // On a spell row the Remove cross sat in the card's top-right corner, as on every other card, but the row's one
  // line ran underneath it: the cross covered the right end of Memorised, 34 x 33 px on a phone and about 21 x 25 px
  // on a laptop, so a tap meant for one could reach the other.
  // Remove keeps that corner. The stylesheet (1141-spell-remove-corner.css) gives it a 44 x 44 px target there and
  // keeps the corner clear: on a laptop the row's line stops short of it; on a phone the name takes the first line
  // and stops short of it, and the rest of the row moves below. Nothing else on the row is moved or resized, and no
  // other card is touched. In Play, where Remove is not drawn, the corner is given back.
  // This fragment holds only the switch and the body class; all the work is styling.
  // Everything waits for body.sx15-on, which the switch sets: with the switch off the rows are exactly as before.
  const SPELL_REMOVE_CORNER_ENABLED = true;

  const SX15 = (function(){
    const api = {installed: false};
    api.enabled = function(){ return SPELL_REMOVE_CORNER_ENABLED; };
    api.install = function(){
      if(api.installed || !SPELL_REMOVE_CORNER_ENABLED) return false;
      api.installed = true;
      document.body.classList.add('sx15-on');
      return true;
    };
    return api;
  })();
  SX15.install();
  // ============ END PART H PHASE 15.1.23 ============
