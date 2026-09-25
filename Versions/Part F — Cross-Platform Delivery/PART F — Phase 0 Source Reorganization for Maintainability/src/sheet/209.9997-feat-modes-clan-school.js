  // ============ PART K PHASE 12.1 — PLAY AND MANAGEMENT MODES: CLAN & SCHOOL ============
  // Part 2 of Phase 12, one part per tab. The Clan & School tab is read-only in Play (owner's ruling,
  // 25 September 2026): its four pickers show their choice as plain text and its two Apply buttons
  // are hidden. The Affinity details button is information and stays. Everything is done through
  // the gate and registry that part 1 built; this fragment only registers the tab's controls, so it
  // HARD-DEPENDS on part 1 and does nothing without it. Only the creation wizard clicks these
  // controls programmatically, and it runs in Management.
  const MODES121_ENABLED = true;

  const MODES121 = {
    selector: '#cfs_clan, #cfs_minorClan, #cfs_family, #cfs_school, #cfs_applyFamily, #cfs_applySchool'
  };

  if(MODES121_ENABLED && typeof MODES12 === 'object' && MODES12 && typeof MODES12.register === 'function'){
    MODES12.register(MODES121.selector);
  }
  // ============ END PART K PHASE 12.1 MODES121 ============
