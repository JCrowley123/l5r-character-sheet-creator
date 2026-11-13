  // ============ PART H PHASE 15.1.29 — A SCHOOL'S GIVEN SPELLS CREDITED WHEN A CHARACTER IS OPENED ============
  // Phase 15, Release 15a, unit AE2 (the automatic-entries group), approved by the owner on 13 November 2026 as
  // revision 1 of the mock-up. The number 29 is this unit's marker only; the unit keeps its identifier, AE2.
  // The owner's rule (11 November 2026): what the rules give a character is not a choice. Every Shugenja School gives
  // its own spells (Sense, Commune and Summon; Fuzake adds Path to Inner Peace), yet an older character was asked to
  // tick them in the starting-spell review, and one that lacked one was not told.
  // Now, whenever a character is opened (a file, or the Characters list), for each Shugenja School on it, the School's
  // own given list (Phase 11.2.3/11.2.4's table) is read. A held spell, and its scroll, are marked as that School's,
  // exactly as ticking it in the older-holdings review does; a missing one is added with its Spell Scroll through the
  // wizard's own path, and marked as created for the School. One note per School in the character check names each
  // spell and says "marked" or "added". The sheet never changes a saved character silently.
  // The note is kept with the character (the save's "givenSpellsNote") until the player saves it themselves: Save,
  // Save As New or Export JSON. Autosave does not clear it, and an exported file never carries it. Opening the
  // character again before that shows the same note; the spells are not marked or added twice.
  // Nothing here autosaves while a character is being opened (the Characters list's own id is still the previous
  // character's then). The older-holdings review, which runs first, then finds only the real choices left.
  const GIVEN_SPELLS_ON_OPENING_ENABLED = true;

  const GS15 = (function(){
    // paused: set only by a test page that checks an earlier layer's review as it works without this unit.
    const api = {installed: false, paused: false, notes: [], KEY: 'givenSpellsNote', RULE: 'given-spells-credited'};
    api.enabled = function(){ return GIVEN_SPELLS_ON_OPENING_ENABLED; };
    const norm = function(s){ return String(s || '').trim().toLowerCase(); };
    const spellByName = function(n){ return SPELL_LIBRARY.find(function(s){ return norm(s.name) === norm(n); }) || null; };
    const names = function(list){
      return Array.isArray(list) ? list.filter(function(n, i, all){ return typeof n === 'string' && n.trim() && n.length <= 200 && all.indexOf(n) === i; }).slice(0, 20) : [];
    };
    // A saved note, field by field: [{school, marked:[...], added:[...]}]. Anything else is dropped.
    api.clean = function(value){
      if(!Array.isArray(value)) return [];
      return value.filter(function(v){ return v && typeof v === 'object' && typeof v.school === 'string' && v.school.trim() && v.school.length <= 200; })
        .slice(0, 10).map(function(v){ return {school: v.school, marked: names(v.marked), added: names(v.added)}; })
        .filter(function(v){ return v.marked.length || v.added.length; });
    };
    api.merge = function(entry){
      const old = api.notes.find(function(n){ return n.school === entry.school; });
      if(!old){ api.notes.push(entry); return; }
      old.marked = names(old.marked.concat(entry.marked));
      old.added = names(old.added.concat(entry.added));
    };
    const grant = function(school, name, created){ return {version: 1, stage: 'starting', kind: 'spell', school: school, name: name, created: created}; };
    // A row (spell or scroll) becomes this School's too, keeping any School it already belongs to.
    const tag = function(row, kind, school, name, created){
      const record = SC8.read(row, kind);
      if(SC8Logic.belongs(record, school)) return;
      SC8.write(row, record ? SC8Logic.addSchool(record, school) : grant(school, name, created));
    };
    // One School: mark the given spells it holds, add the ones it lacks. {school, marked, added}, or null.
    api.credit = function(school){
      const data = CW1123.forSchool(school);
      if(!data || !Array.isArray(data.given)) return null;
      const out = {school: school, marked: [], added: []};
      data.given.forEach(function(given){
        const s = spellByName(given);
        if(!s) return;
        const held = SC8.spellRow(s.name);
        if(held){
          if(SC8Logic.belongs(SC8.read(held, 'spell'), school)) return;
          tag(held, 'spell', school, s.name, false);
          const scroll = SC8.scrollRow(s.name);
          if(scroll) tag(scroll, 'scroll', school, s.name, false);
          out.marked.push(s.name);
          return;
        }
        if(!s.maho && !spellEligibility(s).eligible) return;
        const hadScroll = !!SC8.scrollRow(s.name);
        CW1122.addSpell(SPELL_LIBRARY.indexOf(s));
        const row = SC8.spellRow(s.name);
        if(!row) return;
        tag(row, 'spell', school, s.name, true);
        const scroll = SC8.scrollRow(s.name);
        if(scroll) tag(scroll, 'scroll', school, s.name, !hadScroll);
        out.added.push(s.name);
      });
      return out.marked.length || out.added.length ? out : null;
    };
    api.afterOpen = function(data){
      api.notes = api.clean(data && data[api.KEY]);
      let changed = false;
      const seen = [];
      getSchoolsList().forEach(function(entry){
        const school = entry && typeof entry.name === 'string' ? entry.name : '';
        if(!school || seen.indexOf(school) >= 0) return;
        seen.push(school);
        const done = api.credit(school);
        if(done){ api.merge(done); changed = true; }
      });
      if(changed) recalcAll();
      renderValidationReport();
      return changed;
    };
    const list = function(items){
      return items.length < 2 ? items.join('') : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
    };
    const COUNT = ['', 'this spell', 'these two', 'these three', 'these four', 'these five'];
    api.title = function(note){
      const parts = [];
      if(note.marked.length) parts.push(list(note.marked) + ' marked as your School’s spell' + (note.marked.length === 1 ? '' : 's'));
      if(note.added.length) parts.push(list(note.added) + (note.marked.length ? ' added' : ' added as your School’s spell' + (note.added.length === 1 ? '' : 's')));
      return note.school + ': ' + parts.join('; ');
    };
    api.detail = function(note){
      const data = CW1123.forSchool(note.school);
      const count = data && Array.isArray(data.given) ? data.given.length : 0;
      const what = COUNT[count] || 'these spells';
      const given = 'Every ' + note.school + ' is given ' + what;
      let text;
      if(!note.added.length) text = given + ', so there was nothing to choose.';
      else if(note.added.length === 1) text = given + '. ' + note.added[0] + ' was missing, so it was added with its Spell Scroll.';
      else text = given + '. ' + list(note.added) + ' were missing, so they were added with their Spell Scrolls.';
      return text + ' This note goes once you save the character.';
    };
    api.findings = function(){
      return api.notes.map(function(note){ return validationFinding(api.RULE, 'info', api.title(note), api.detail(note)); });
    };
    // The player's own save: Save, Save As New, or Export JSON of the open character.
    api.clear = function(){
      if(!api.notes.length) return false;
      api.notes = [];
      renderValidationReport();
      return true;
    };
    api.install = function(){
      if(api.installed || !GIVEN_SPELLS_ON_OPENING_ENABLED) return false;
      if(typeof SC8 !== 'object' || !SC8 || typeof SC8Logic !== 'object' || typeof CW1123 !== 'object' || typeof CW1122 !== 'object') return false;
      api.installed = true;
      // The note is shown first among the character check's lines, where the change it describes is easiest to see.
      if(typeof CHARACTER_VALIDATOR_RULES !== 'undefined' && Array.isArray(CHARACTER_VALIDATOR_RULES)) CHARACTER_VALIDATOR_RULES.unshift({id: api.RULE, fn: api.findings});
      const clear = clearAllRows;
      clearAllRows = function(){ api.notes = []; return clear.apply(this, arguments); };
      const apply = applyData;
      applyData = function(data){
        const result = apply.apply(this, arguments);
        if(result !== false && data && typeof data === 'object' && SC8.enabled() && !api.paused) api.afterOpen(data);
        return result;
      };
      const collect = collectData;
      collectData = function(){
        const data = collect.apply(this, arguments);
        if(data && typeof data === 'object'){
          if(api.notes.length) data[api.KEY] = api.notes.map(function(n){ return {school: n.school, marked: n.marked.slice(), added: n.added.slice()}; });
          else delete data[api.KEY];
          // Not saved: tells an export of the open character from one of a stored character.
          Object.defineProperty(data, 'gs15Open', {value: true, enumerable: false});
        }
        return data;
      };
      const save = saveCharacter;
      saveCharacter = function(){
        api.clear();
        return save.apply(this, arguments);
      };
      const exportFile = exportJSON;
      exportJSON = function(data){
        if(data && typeof data === 'object' && api.KEY in data){
          if(data.gs15Open) api.clear();
          data = Object.assign({}, data);
          delete data[api.KEY];
        } else if(data && data.gs15Open) api.clear();
        return exportFile.call(this, data);
      };
      return true;
    };
    return api;
  })();
  GS15.install();
  // ============ END PART H PHASE 15.1.29 ============
