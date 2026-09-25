  // ============ PART K PHASE 12.4 — PLAY AND MANAGEMENT MODES: SKILLS ============
  // Part 5 of Phase 12, one part per tab. Skills is read-and-roll in Play (roadmap, Phase 12): a
  // row's name, Trait, Rank, School tick, Emphases and remove button are Management only, and so are
  // the Add Skill picker and buttons. What stays live: each row's d10 (.sk-roll), the Untrained
  // Skills list (it rolls), and the Skill information button.
  //
  // Rows are built and rebuilt all the time (Apply School, a load, Add Skill, a new Emphasis). Part 1's
  // observer locks new matches as they appear, so the selector names row controls, not rows. The
  // d10 sits in its own cell, outside every locked control, so the gate never reaches it. Registers
  // through part 1's MODES12, so it HARD-DEPENDS on part 1.
  const MODES124_ENABLED = true;

  const MODES124 = {
    selector: [
      '#skillQuickAdd', '#addSkill', '#loadAllSkills',
      '#skillsBody .sk-name', '#skillsBody .sk-trait', '#skillsBody .sk-rank', '#skillsBody .sk-school',
      '#skillsBody .emph-add-btn', '#skillsBody .sk-emph-select', '#skillsBody .sk-emph-text',
      '#skillsBody .emph-item-del', '#skillsBody .rm-btn'
    ].join(', ')
  };

  if(MODES124_ENABLED && typeof MODES12 === 'object' && MODES12 && typeof MODES12.register === 'function'){
    MODES12.register(MODES124.selector);
  }
  // ============ END PART K PHASE 12.4 MODES124 ============
