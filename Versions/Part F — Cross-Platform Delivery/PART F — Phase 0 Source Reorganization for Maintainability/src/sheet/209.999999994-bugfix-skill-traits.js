  // ============ BUGFIX SKILLTRAITS — SKILL DEFAULTS AND OLD ROWS ============
  const SKILL_TRAITS_FIX_ENABLED = true;

  // Core Rulebook pp.136–137, 143–144. No roll-time Trait selection or XP changes.
  const SKILL_TRAITS = (function(){
    const normalise = function(value){ return String(value || '').trim().toLowerCase().replace(/\s+/g, ' '); };
    const subjects = {
      perform: {biwa:'Agility', dance:'Agility', drums:'Agility', flute:'Agility', puppeteer:'Agility',
        samisen:'Agility', oratory:'Awareness', song:'Awareness', storytelling:'Awareness'},
      games: {'fortunes & winds':'Awareness', letters:'Awareness', sadane:'Awareness', go:'Intelligence',
        shogi:'Intelligence', kemari:'Agility'}
    };
    const api = {};
    api.craftNote = 'Trait varies by craft; the GM sets it (Core Rulebook p.143).';
    api.rule = function(name){
      const n = normalise(name);
      if(n === 'intimidation') return {trait:'Awareness', old:'Willpower'};
      const parts = n.match(/^(perform|games)\s*:\s*(.+)$/);
      const trait = parts && subjects[parts[1]][parts[2]];
      return typeof trait === 'string' ? {trait:trait, old:'Awareness'} : null;
    };
    api.corrected = function(name, current, automatic){
      const rule = api.rule(name), value = String(current || '');
      if(!rule) return value;
      return !value.trim() || normalise(value) === normalise(rule.old) ||
        (automatic && value === automatic) ? rule.trait : value;
    };
    api.isCraft = function(name){ return /^craft(?:\s*:|$)/.test(normalise(name)); };
    return api;
  })();

  const SKILL_TRAITS_UI = (function(){
    const automatic = new WeakMap();
    const manual = new WeakSet();
    const api = {};
    // UI hook: the existing row filler delegates through this one interface.
    api.correctRow = function(row){
      if(!row || !row.querySelector || manual.has(row)) return false;
      const name = row.querySelector('.sk-name'), trait = row.querySelector('.sk-trait');
      if(!name || !trait) return false;
      const before = trait.value, next = SKILL_TRAITS.corrected(name.value, before, automatic.get(row));
      if(next === before) return false;
      trait.value = next;
      automatic.set(row, next);
      return true;
    };
    // UI hook: optional row reminder; kept outside the mastery renderer's owned element.
    api.note = function(row){
      const name = row && row.querySelector('.sk-name');
      if(!name) return;
      let note = row.querySelector('.st10-craft-note');
      if(!SKILL_TRAITS.isCraft(name.value)){ if(note) note.remove(); return; }
      if(!note){
        note = document.createElement('div');
        note.className = 'st10-craft-note';
        note.style.cssText = 'font-size:.75rem;color:var(--ink-soft);margin-top:3px;';
        name.closest('td').appendChild(note);
      }
      note.textContent = SKILL_TRAITS.craftNote;
    };
    api.install = function(){
      const intimidation = SKILL_LIBRARY.find(function(s){ return s.name === 'Intimidation'; });
      if(intimidation) intimidation.trait = 'Awareness';
      SKILL_DESCRIPTIONS.Craft = (SKILL_DESCRIPTIONS.Craft || '') + ' ' + SKILL_TRAITS.craftNote;

      const schoolRows = typeof SCHOOL_SKILL_ROWS !== 'undefined' &&
        typeof SCHOOL_SKILL_ROWS_FIX_ENABLED !== 'undefined' && SCHOOL_SKILL_ROWS_FIX_ENABLED ? SCHOOL_SKILL_ROWS : null;
      if(schoolRows){
        const previousEntry = schoolRows.libraryEntry;
        schoolRows.libraryEntry = function(name){
          const entry = previousEntry.apply(this, arguments), rule = SKILL_TRAITS.rule(name);
          return entry && rule ? Object.assign({}, entry, {trait:rule.trait}) : entry;
        };
        // UI hook: preserve the previous fill and its aliases, then migrate only the ruled old values.
        const previousFill = schoolRows.fillTrait;
        schoolRows.fillTrait = function(row){
          const trait = row && row.querySelector ? row.querySelector('.sk-trait') : null;
          const before = trait ? trait.value : '';
          const filled = previousFill.apply(this, arguments);
          if(filled && trait) automatic.set(row, trait.value);
          const corrected = api.correctRow(row);
          return filled || corrected || !!(trait && trait.value !== before);
        };
      }

      // UI hook: makeSkillRow is also the load/import and creation-wizard entry point.
      const previousMake = makeSkillRow;
      makeSkillRow = function(){
        const row = previousMake.apply(this, arguments);
        const name = row.querySelector('.sk-name'), trait = row.querySelector('.sk-trait');
        if(SKILL_TRAITS.rule(name.value) && (schoolRows || name.value.trim().toLowerCase() === 'intimidation')) api.correctRow(row);
        api.note(row);
        trait.addEventListener('input', function(){ automatic.delete(row); manual.add(row); });
        trait.addEventListener('change', function(){ automatic.delete(row); manual.add(row); });
        name.addEventListener('change', function(){
          if(!schoolRows && name.value.trim().toLowerCase() === 'intimidation' && api.correctRow(row)) recalcAll();
          api.note(row);
        });
        return row;
      };

      // UI hook: named crafts use the same reminder as the catalogue's base Craft entry.
      const previousInfo = showSkillInfoModal;
      showSkillInfoModal = function(row){
        const result = previousInfo.apply(this, arguments);
        if(SKILL_TRAITS.isCraft(row.querySelector('.sk-name').value)){
          const description = document.getElementById('skillInfoDesc');
          if(!description.textContent.includes(SKILL_TRAITS.craftNote)){
            const note = document.createElement('p');
            note.className = 'st10-craft-note';
            note.textContent = SKILL_TRAITS.craftNote;
            description.appendChild(note);
          }
        }
        return result;
      };
      if(typeof SEARCH14 !== 'undefined' && typeof SEARCH14.get === 'function'){
        const previousDetail = SEARCH14.get;
        SEARCH14.get = function(){
          const record = previousDetail.apply(this, arguments);
          if(record && record.category === 'skills' && record.name === 'Craft') record.text.push(SKILL_TRAITS.craftNote);
          return record;
        };
        SEARCH14.invalidate();
      }
    };
    return api;
  })();
  if(SKILL_TRAITS_FIX_ENABLED) SKILL_TRAITS_UI.install();
  // ============ END BUGFIX SKILLTRAITS ============
