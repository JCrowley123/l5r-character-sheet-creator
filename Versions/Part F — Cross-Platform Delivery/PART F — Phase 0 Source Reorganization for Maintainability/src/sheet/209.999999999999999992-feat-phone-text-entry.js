  // ============ PART H PHASE 15.1.24 — PHONE TEXT ENTRY AND REPEATED TAPS ============
  // Phase 15, Release 15a, finding A09 (FT-49, group G4), approved as mocked up by the owner on 12 November 2026.
  // The number 24 is this unit's marker only; the finding keeps its identifier, A09.
  // The owner's three iPhone reports: a quick double press on a button or stepper zooms instead of pressing twice;
  // typing in a box zooms in and stays zoomed; double-tap sometimes will not zoom back out. iPhone Safari zooms in on
  // any text box whose text is under 16 px, and treats a quick second tap on a button as a zoom. On a phone the sheet
  // drew 34 kinds of box at 13.3 to 15.7 px.
  // The stylesheet (1142-phone-text-entry.css) makes every editable box at least 16 px on phones and touch screens and
  // lets buttons answer a quick second tap (touch-action: manipulation, buttons only). Pinch zoom, and double-tap zoom
  // on text and empty space, are kept; the viewport is never forced back. Laptops with a mouse are unchanged.
  // This fragment holds only the switch and the body class; all the work is styling.
  // Everything waits for body.tx15-on, which the switch sets: with the switch off the sheet is exactly as before.
  const PHONE_TEXT_ENTRY_ENABLED = true;

  const TX15 = (function(){
    const api = {installed: false};
    api.enabled = function(){ return PHONE_TEXT_ENTRY_ENABLED; };
    api.install = function(){
      if(api.installed || !PHONE_TEXT_ENTRY_ENABLED) return false;
      api.installed = true;
      document.body.classList.add('tx15-on');
      return true;
    };
    return api;
  })();
  TX15.install();
  // ============ END PART H PHASE 15.1.24 ============
