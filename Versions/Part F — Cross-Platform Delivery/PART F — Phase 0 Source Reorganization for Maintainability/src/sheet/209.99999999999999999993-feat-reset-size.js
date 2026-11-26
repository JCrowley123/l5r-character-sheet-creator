  // ============ PART H PHASE 15.2.10.1 — ONE SIZE FOR RESET ============
  // Phase 15, Release 15b, unit B18.1 (one name per button job, round 2). The owner, 25 November 2026, on the Reset
  // card: "a pass needs to be done to make sure that they are the same size"; the round-2 card "Every Reset button is
  // the same size" approved as shown, with the capitals. Every Reset (Kharmic Tie, Luck, Dark Paragon, Great Destiny,
  // Haunted, Unlucky, the Ancestor card, the Combat round counter) is 28 px tall in the letters of Change and Choose… on
  // the same cards: capitals, .78rem, letter spacing .06em, padding 2px 10px. The buttons on the same row take the same
  // look: Great Destiny's Use, Dark Paragon's Use, Unlucky's − and +, the Ancestor card's Use and the round counter's
  // Next Round. Screen only: this fragment marks the page (body.rs15-on) and the unit's stylesheet
  // (1156-reset-size.css) draws the size. Words, spoken names and what each button does are unchanged; print is
  // unchanged. Nothing is saved.
  const RESET_ONE_SIZE_ENABLED = true;

  const RS15 = (function(){
    const api = {installed: false};
    api.enabled = function(){ return RESET_ONE_SIZE_ENABLED === true && !!document.body; };
    api.install = function(){
      if(api.installed || !api.enabled()) return false;
      document.body.classList.add('rs15-on');
      api.installed = true;
      return true;
    };
    return api;
  })();
  if(RESET_ONE_SIZE_ENABLED) RS15.install();
  // ============ END PART H PHASE 15.2.10.1 RS15 ============
