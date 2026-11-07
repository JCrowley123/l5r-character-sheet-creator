  // ============ PART H PHASE 15.1.7 — THE MOON ROW ============
  // Phase 15, Release 15a, finding A07 (the Moon row, 29 October; owner's ruling Q1; mock-up approved 7 November 2026).
  // Lord Moon's Curse's row (the Lord Moon fix LM7's decorate, with the resist-label fix MR7) showed three things on three
  // different edges and baselines: the severity ("Medium — 5 points") with no label, a 13 px full-moon tick in tiny
  // capitals set 10 px in, and the roll button. It now reads as a labelled severity row ("SEVERITY Medium — 5 points",
  // then Change), the full-moon toggle on its own aligned 44 px line in body text, and "Resist Lord Moon (TN n)" at 44 px.
  // All of it is the stylesheet (1136-moon-row.css): the label is generated text, and the tick, its wording, its state,
  // the roll, the moon's extra Void pip and its order, and every rule are those fixes' own and unchanged.
  // This fragment holds only the switch, which sets body.mr15-on: with the switch off the row is exactly as before.
  const MOON_ROW_ENABLED = true;

  const MR15 = (function(){
    const api = {installed: false};
    api.enabled = function(){ return MOON_ROW_ENABLED; };
    api.install = function(){
      if(api.installed || !MOON_ROW_ENABLED || !document.body) return false;
      api.installed = true;
      document.body.classList.add('mr15-on');
      return true;
    };
    return api;
  })();
  MR15.install();
  // ============ END PART H PHASE 15.1.7 ============
