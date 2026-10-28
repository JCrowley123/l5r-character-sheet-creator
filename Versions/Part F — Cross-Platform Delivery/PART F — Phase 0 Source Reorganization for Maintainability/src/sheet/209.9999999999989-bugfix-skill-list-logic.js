  // BUGFIX SL7: Skills already held leave Add from Skill List and return when their row goes (owner ruling R14,
  // 23 October 2026). Skills taken with a subject (Lore, Craft, Perform, Games, Artisan) stay listed.
  const SKILL_LIST_HIDES_HELD_ENABLED = true;
  const SL7Logic = {
    key(name){ return String(name || '').replace(/\s+/g, ' ').trim().toLowerCase(); },
    // groups: [{label, options:[{value, text}]}]; held: the Skill rows' names; subject(value): a subject Skill.
    visible(groups, held, subject){
      const have = new Set((held || []).map(SL7Logic.key).filter(Boolean));
      return (groups || []).map(g => ({label:g.label,
        options:g.options.filter(o => subject(o.value) || !have.has(SL7Logic.key(o.value)))})).filter(g => g.options.length);
    }
  };
