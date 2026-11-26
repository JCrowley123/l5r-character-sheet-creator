  // ============ PART H PHASE 15.2.10.2 — THE I AT THE END OF ITS ROW ============
  // Phase 15, Release 15b, unit B18.2 (one name per button job, round 2). The owner, 25 November 2026, on the Reset
  // card: "my gut says that where appropriate the "i" should be on the right hand side as to not make the buttons too
  // crowded"; the round-2 card "The i always sits at the right end of its row" approved as shown. Where an
  // Advantage or Disadvantage card's top row has an i beside its buttons, the i sits at the right end of the row, as
  // Kharmic Tie's already does (Release 15b B17): Luck (its i inside the pips and Reset), Dark Paragon, Seven
  // Fortunes' Curse with Hotei, and a card that still needs a choice. Left as they are: the Skills list's i's, the i's
  // beside a heading, Kharmic Tie, and where Change sits in Manage (parked with A04.2 for the rules read).
  // Screen only: this fragment marks the page (body.ie15-on) and the unit's stylesheet (1157-info-row-end.css) moves the
  // i. Words, spoken names, the order a screen reader reads them and what each button does are unchanged; print is
  // unchanged. Nothing is saved.
  const INFO_AT_ROW_END_ENABLED = true;

  const IE15 = (function(){
    const api = {installed: false};
    api.enabled = function(){ return INFO_AT_ROW_END_ENABLED === true && !!document.body; };
    api.install = function(){
      if(api.installed || !api.enabled()) return false;
      document.body.classList.add('ie15-on');
      api.installed = true;
      return true;
    };
    return api;
  })();
  if(INFO_AT_ROW_END_ENABLED) IE15.install();
  // ============ END PART H PHASE 15.2.10.2 IE15 ============
