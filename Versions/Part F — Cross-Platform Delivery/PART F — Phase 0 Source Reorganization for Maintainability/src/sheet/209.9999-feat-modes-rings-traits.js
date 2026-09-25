  // ============ PART K PHASE 12.3 — PLAY AND MANAGEMENT MODES: RINGS & TRAITS ============
  // Part 4 of Phase 12, one part per tab. Rings & Traits is read-and-roll in Play (owner's ruling,
  // 25 September 2026): the eight Trait boxes, the five Ring boxes and the Void RING - / + steppers
  // are Management only. The Void POINT pips stay live, because spending Void is a play action, and
  // the Void information button stays. The tab is drawn once at load; its edits run through a
  // delegated click listener on #ringsWrap and input listeners on the Trait boxes, all of which part
  // 1's capture-phase gate reaches first. Only the creation wizard drives these controls itself, and
  // it runs in Management. Registers through part 1's MODES12, so it HARD-DEPENDS on part 1.
  const MODES123_ENABLED = true;

  const MODES123 = {
    selector: '#ringsWrap input[id^="ring_"], #ringsWrap input[id^="trait_"], #ringsWrap .stepbtn[data-ring="void"]'
  };

  if(MODES123_ENABLED && typeof MODES12 === 'object' && MODES12 && typeof MODES12.register === 'function'){
    MODES12.register(MODES123.selector);
  }
  // ============ END PART K PHASE 12.3 MODES123 ============
