  // ============ PART H PHASE 15.1.6 — GRANT ACTIONS AND THEIR STATE ============
  // Phase 15, Release 15a, finding A06 (FT-42; owner's ruling Q1; mock-up approved 7 November 2026, revision 2: no tick).
  // Zakyo Toshi Citizen's row (Phase 4.5.40 (Part I)) and Wealthy's row (Phase 4.5.17 (Part I)) offer a koku grant as
  // two equal outlined buttons, touching on Zakyo's row: "Add N koku" and "Already added" (or "Return N koku" and
  // "Keep"). They now read as one compact group with a clear gap: the first action filled as the primary, the second
  // outlined, both 44 px tall, and the state beside them ("Not recorded yet", or "Not settled yet" for Return / Keep).
  // Once recorded, the buttons go and the existing line says so in plain words, as today: no tick (owner, revision 2).
  // All of it is the stylesheet (1135-grant-actions.css): no button is moved, renamed or relabelled, and the state is
  // drawn by the stylesheet, so each row's text, buttons, one-time guard and reversal are exactly those phases' own.
  // This fragment holds only the switch, which sets body.ga15-on: with the switch off the rows are exactly as before.
  const GRANT_ACTIONS_ENABLED = true;

  const GA15 = (function(){
    const api = {installed: false};
    api.enabled = function(){ return GRANT_ACTIONS_ENABLED; };
    api.install = function(){
      if(api.installed || !GRANT_ACTIONS_ENABLED || !document.body) return false;
      api.installed = true;
      document.body.classList.add('ga15-on');
      return true;
    };
    return api;
  })();
  GA15.install();
  // ============ END PART H PHASE 15.1.6 ============
