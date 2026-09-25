  // ============ PART K PHASE 12.2 — PLAY AND MANAGEMENT MODES: IDENTITY ============
  // Part 3 of Phase 12, one part per tab. The Identity tab is read-only in Play, with the owner's
  // ruling of 25 September 2026 as the one exception: Honor, Glory and Status POINTS and Taint change
  // during play, so they stay editable; their RANKS, and everything else on the tab, are Management
  // only. The read-only displays the sheet computes (Insight, XP spent and left, Rank) are listed too,
  // so every field Play cannot edit reads the same way; locking a field the sheet already made
  // read-only changes nothing about it.
  //
  // + Add School: the sheet re-sets that button's disabled state on every recalc, so in Play it is
  // kept inert by part 1's gate and hidden by part 1's style rather than by `disabled`; its dropdown
  // is hidden by this part's style. Registers through part 1's MODES12, so it HARD-DEPENDS on part 1.
  const MODES122_ENABLED = true;

  const MODES122 = {
    selector: [
      '#f_name', '#f_clan', '#f_family', '#f_school', '#f_gender', '#f_age',
      '#f_rank', '#f_insightRank', '#f_insightPts', '#f_insightToNextRank', '#f_insightBonus',
      '#f_honorRank', '#f_gloryRank', '#f_statusRank',
      '#f_xpTotal', '#f_xpAdjust', '#f_xpSpent', '#f_xpRemain',
      '#btnAddSchoolToggle', '#addSchoolSelect'
    ].join(', '),
    // Left editable in Play, by the owner's ruling. Listed so a check can hold the line.
    playEditable: ['f_honorPts', 'f_gloryPts', 'f_statusPts', 'f_taint']
  };

  if(MODES122_ENABLED && typeof MODES12 === 'object' && MODES12 && typeof MODES12.register === 'function'){
    MODES12.register(MODES122.selector);
  }
  // ============ END PART K PHASE 12.2 MODES122 ============
