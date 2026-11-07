  // ============ PART H PHASE 15.1.11 — EXPLANATORY TEXT: GAPS AND ONE LEFT EDGE ============
  // Phase 15, Release 15a, finding A11 (FT-51; owner's ruling Q1; mock-up approved 7 November 2026, with the owner's
  // additions of 7 November). Three changes, all in the stylesheet (1137-text-edges.css):
  //  1. The owner's point from G1's review: in Play an Advantage or Disadvantage card's name and description are plain
  //     text, yet each kept its box's inner padding and border, so both started 10 px right of every line between them
  //     (summaries, notes, warnings, reminders). Measured on every card, phone and laptop. In Play they now start on the
  //     card's text edge. In Manage they stay editable boxes, whose text is inset by design.
  //  2. The audit's case: Insight's and Spent XP's notes were pulled 4 px up into the fields above them on a laptop.
  //     They now take the shared 6 px helper gap there (a phone already gives them 14 px, from the carousel's own rule)
  //     and a readable 1.5 line height everywhere.
  //  3. Owner, 7 November: the description box on six condition cards (Missing Limb, Lost Love, Contrary, Rumormonger,
  //     Soft-Hearted, Blissful Betrothal) sat 2 px under the row's controls; it now has the same 6 px gap.
  // This fragment holds only the switch, which sets body.te15-on: with the switch off everything is as before.
  const TEXT_EDGES_ENABLED = true;

  const TE15 = (function(){
    const api = {installed: false};
    api.enabled = function(){ return TEXT_EDGES_ENABLED; };
    api.install = function(){
      if(api.installed || !TEXT_EDGES_ENABLED || !document.body) return false;
      api.installed = true;
      document.body.classList.add('te15-on');
      return true;
    };
    return api;
  })();
  TE15.install();
  // ============ END PART H PHASE 15.1.11 ============
