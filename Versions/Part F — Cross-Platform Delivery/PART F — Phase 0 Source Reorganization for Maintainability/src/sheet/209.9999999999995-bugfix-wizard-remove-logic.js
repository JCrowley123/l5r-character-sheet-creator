  // BUGFIX WR7: the creation wizard's Skills step can remove a Skill bought with experience (owner ruling R21,
  // 23 October 2026). School Skills and the School's free choices are not offered. The experience comes back
  // because the sheet counts it from the rows.
  const WIZARD_SKILL_REMOVE_ENABLED = true;
  const WR7Logic = {
    // row: {name, school, freeChoice, freeRanks}.
    removable(row){ return !!row && !!String(row.name || '').trim() && !row.school && !row.freeChoice && !(row.freeRanks > 0); }
  };
