  // ============ BUGFIX — APPLY SCHOOL SKILL ROWS ============
  // Three faults in the rows Apply School writes, all measured on the live build (25 September
  // 2026) before this was written:
  //
  // 1. NO TRAIT. The Skill lookup matches exact names only, so every School Skill written as
  //    "Family: Subject" (Lore: History, Lore: Theology, Craft: Armorsmithing, Perform:
  //    Storytelling, Games: Sadane) was added with a blank Trait, and its roll button refused
  //    until the player typed one. About 45 of the 79 Schools. Typing such a name by hand did the
  //    same. A blank Trait is now filled from the Skill's own library entry, its corrected name,
  //    or its family's entry, whenever a row is made (Apply School, a loaded save, Add Skill) or
  //    renamed. A Trait the row already has is never overwritten.
  // 2. MISNAMED SKILLS. Mirumoto Bushi and Shiba Bushi list "Theology" (the sheet's Skill is
  //    "Lore: Theology") and Kaiu Engineer lists "War Fans" (the sheet's is "War Fan"). Corrected
  //    in the School library at load, so every reader of it sees the sheet's own name. A save
  //    made before keeps its rows as named -- the School's own undo finds rows by the name it
  //    recorded -- and those old names are matched as the Skill they stand for.
  // 3. PLACEHOLDER ROWS. Two entries write one free choice across commas ("any one High, Bugei,
  //    or Merchant Skill"), and Tsi Smith's "two ranks in any one Craft Skill" does not start with
  //    "any", so Apply School added rows named "Bugei", "or Merchant Skill" and so on; and The
  //    Order of Jurojin's Blessing's "Medicine (Disease, Herbalism)" became rows named "Medicine
  //    (Disease" and "Herbalism)" (found by this fix's own sweep of every School). A School's
  //    Skills text is now read with the rule the creation wizard already uses -- a piece containing
  //    "any" opens a free choice, which takes the following pieces until it says Skill -- and a
  //    comma inside brackets no longer splits a Skill from its Emphases. The same
  //    reading is given to the second-School Technique unlock and to the character check, which
  //    otherwise counted those fragments as School Skills. Rows already in a save are left for the
  //    player to delete: a save cannot tell a placeholder row from a deliberate one.
  const SCHOOL_SKILL_ROWS_FIX_ENABLED = true;

  const SCHOOL_SKILL_ROWS = (function(){
    const api = {};
    api.LIBRARY_CORRECTIONS = [
      {school:'Mirumoto Bushi', from:'Theology', to:'Lore: Theology'},
      {school:'Shiba Bushi', from:'Theology', to:'Lore: Theology'},
      {school:'Kaiu Engineer [Artisan/Bushi]', from:'War Fans', to:'War Fan'}
    ];
    // The old names a save may still carry, and the Skill each stands for.
    api.ALIASES = {'theology':'Lore: Theology', 'war fans':'War Fan'};
    api.applied = [];

    api.canonical = function(name){
      const n = String(name || '').trim();
      return api.ALIASES[n.toLowerCase()] || n;
    };

    // The library entry a row name resolves to: itself, its corrected name, or, for a
    // "Family: Subject" name, the family's own entry.
    api.libraryEntry = function(name){
      const n = api.canonical(name);
      if(!n) return null;
      const exact = findSkill(n);
      if(exact) return exact;
      const family = n.match(/^([^:]+?)\s*:\s*\S/);
      return family ? findSkill(family[1]) : null;
    };

    api.fillTrait = function(tr){
      if(!SCHOOL_SKILL_ROWS_FIX_ENABLED || !tr || !tr.querySelector) return false;
      const traitEl = tr.querySelector('.sk-trait');
      const nameEl = tr.querySelector('.sk-name');
      if(!traitEl || !nameEl || traitEl.value.trim()) return false;
      const lib = api.libraryEntry(nameEl.value);
      if(!lib || !lib.trait) return false;
      traitEl.value = lib.trait;
      return true;
    };

    // A School's Skills text, read whole. Split on commas, then two kinds of piece are joined back:
    // a bracket left open ("Medicine (Disease, Herbalism)", The Order of Jurojin's Blessing), and a
    // free choice that has not yet said Skill. Each group records how many comma pieces it took.
    api.groups = function(skills){
      const parts = String(skills || '').split(',').map(function(s){ return s.trim(); }).filter(Boolean);
      const depth = function(s){ return (s.match(/\(/g) || []).length - (s.match(/\)/g) || []).length; };
      const out = [];
      for(let i = 0; i < parts.length; i++){
        let text = parts[i], pieces = 1;
        while(depth(text) > 0 && i + 1 < parts.length){ i++; pieces++; text += ', ' + parts[i]; }
        const choice = /\bany\b/i.test(text);
        if(choice){
          while(!/\bskills?\b/i.test(text) && i + 1 < parts.length){ i++; pieces++; text += ', ' + parts[i]; }
        }
        out.push({text: text, choice: choice, pieces: pieces});
      }
      return out;
    };
    api.read = function(skills){
      const groups = api.groups(skills);
      return {
        concrete: groups.filter(function(g){ return !g.choice; }).map(function(g){ return g.text; }),
        choices: groups.filter(function(g){ return g.choice; }).map(function(g){ return g.text; })
      };
    };
    // The named Skills with a trailing Rank count and an Emphasis dropped, as the sheet's other
    // readers of this text do.
    api.namedSkills = function(skills){
      return api.read(skills).concrete
        .map(function(s){ return s.replace(/\s*\d+\s*$/, ''); })
        .map(function(s){ return s.replace(/\s*\([^)]*\)\s*$/, ''); })
        .filter(Boolean);
    };

    // One reader per Apply School, for the comma pieces its loop visits in order (blank pieces
    // never reach it). For each piece: 'choice' (a free choice starts here), 'continuation' (a
    // piece already taken by the group before it), or the Skill text to use, joined whole.
    api.choiceReader = function(skills){
      if(!SCHOOL_SKILL_ROWS_FIX_ENABLED) return null;
      const verdicts = [];
      api.groups(skills).forEach(function(g){
        verdicts.push(g.choice ? 'choice' : g.text);
        for(let k = 1; k < g.pieces; k++) verdicts.push('continuation');
      });
      let at = 0;
      return function(){ return at < verdicts.length ? verdicts[at++] : null; };
    };

    api.correctLibrary = function(){
      api.LIBRARY_CORRECTIONS.forEach(function(c){
        const entry = findAnySchoolLibraryEntry(c.school);
        let hit = false;
        if(entry && typeof entry.skills === 'string'){
          const parts = entry.skills.split(',').map(function(piece){
            if(piece.trim() !== c.from) return piece;
            hit = true;
            return piece.replace(c.from, c.to);
          });
          if(hit) entry.skills = parts.join(',');
        }
        api.applied.push({school: c.school, from: c.from, to: c.to, applied: hit});
      });
    };
    return api;
  })();

  if(SCHOOL_SKILL_ROWS_FIX_ENABLED){
    SCHOOL_SKILL_ROWS.correctLibrary();

    // Every Skill row is made here: Apply School, a loaded save, Add Skill, Load All Skills.
    const schoolSkillRowsPreviousMakeSkillRow = makeSkillRow;
    makeSkillRow = function(){
      const tr = schoolSkillRowsPreviousMakeSkillRow.apply(this, arguments);
      SCHOOL_SKILL_ROWS.fillTrait(tr);
      const nameEl = tr && tr.querySelector ? tr.querySelector('.sk-name') : null;
      if(nameEl){
        nameEl.addEventListener('change', function(){
          if(SCHOOL_SKILL_ROWS.fillTrait(tr)) recalcAll();
        });
      }
      return tr;
    };

    // The second-School Technique unlock: the School's named Skills, read whole, and a row
    // carrying an old name counts as the Skill it stands for.
    schoolConcreteSkillNames = function(schoolName){
      for(const clan in SCHOOL_LIBRARY){
        const found = SCHOOL_LIBRARY[clan].find(function(s){ return s.name === schoolName; });
        if(found) return SCHOOL_SKILL_ROWS.namedSkills(found.skills);
      }
      return [];
    };
    hasSchoolSkillOverlap = function(schoolName){
      const concrete = schoolConcreteSkillNames(schoolName).map(function(s){
        return SCHOOL_SKILL_ROWS.canonical(s).toLowerCase();
      });
      if(!concrete.length) return false;
      const owned = Array.from(document.querySelectorAll('#skillsBody tr'))
        .filter(function(tr){ return parseInt(tr.querySelector('.sk-rank').value || '0', 10) >= 1; })
        .map(function(tr){ return SCHOOL_SKILL_ROWS.canonical(tr.querySelector('.sk-name').value).toLowerCase(); });
      return concrete.every(function(s){ return owned.indexOf(s) >= 0; });
    };

    // The character check (Phase 5, Part J), when it is present: the same reading, and the same
    // matching of old names.
    if(typeof validatorConcreteSkills === 'function'){
      validatorConcreteSkills = function(libEntry){
        if(!libEntry || typeof libEntry.skills !== 'string') return [];
        return SCHOOL_SKILL_ROWS.namedSkills(libEntry.skills);
      };
    }
    if(typeof validatorChoiceSlots === 'function'){
      validatorChoiceSlots = function(libEntry){
        if(!libEntry || typeof libEntry.skills !== 'string') return [];
        return SCHOOL_SKILL_ROWS.read(libEntry.skills).choices;
      };
    }
    if(typeof validatorSkillRanks === 'function'){
      const schoolSkillRowsPreviousRanks = validatorSkillRanks;
      validatorSkillRanks = function(){
        const out = schoolSkillRowsPreviousRanks.apply(this, arguments);
        Object.keys(out).forEach(function(name){
          const as = SCHOOL_SKILL_ROWS.canonical(name).toLowerCase();
          if(as !== name) out[as] = Math.max(out[as] || 0, out[name]);
        });
        return out;
      };
    }
  }
  // ============ END BUGFIX SCHOOLSKILLROWS ============
