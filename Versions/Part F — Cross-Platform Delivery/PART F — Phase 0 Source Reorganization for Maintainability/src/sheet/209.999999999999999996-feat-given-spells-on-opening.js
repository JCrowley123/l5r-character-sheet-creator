  // ============ PART H PHASE 15.1.29 — A SCHOOL'S GIVEN SPELLS CREDITED WHEN A CHARACTER IS FIRST OPENED ============
  // Phase 15, Release 15a, unit AE2 (the automatic-entries group), approved by the owner on 13 November 2026 as
  // revision 1 of the mock-up, and revised the same day after the device round (revision 2, the owner's option B).
  // The number 29 is this unit's marker only; the unit keeps its identifier, AE2.
  // The owner's rule (11 November 2026): what the rules give a character is not a choice. Every Shugenja School gives
  // its own spells (Sense, Commune and Summon; Fuzake adds Path to Inner Peace), yet an older character was asked to
  // tick them in the starting-spell review, and one that lacked one was not told.
  // The first time a character is opened (a file, or the Characters list) with a Shugenja School on it, the School's
  // own given list (Phase 11.2.3/11.2.4's table) is read. A held spell, and its scroll, are marked as that School's,
  // exactly as ticking it in the older-holdings review does; a missing one is added with its Spell Scroll, and marked as
  // created for the School. One note per School in the character check names each spell and says "marked" or
  // "added". The sheet never changes a saved character silently.
  // Revision 2 (the owner's option B, 13 November 2026): this happens once for each School. The School is then recorded
  // as done with the character (the save's "givenSpellsSettled"). Spells are prayers read from scrolls, and a player
  // may lose them for story reasons, so a given spell removed after that is the player's choice: it is not added
  // again, and the character check no longer lists it as still to choose. A missing spell is added with its scroll or
  // not at all (never a scroll alone), never through a School-choice window or the creation wizard, and nothing is
  // done while either is open; a School whose spells could not all be added is not recorded as done, so the next
  // opening tries again.
  // The note is kept with the character (the save's "givenSpellsNote") until the player saves it themselves: Save,
  // Save As New or Export JSON. Autosave does not clear it, and an exported file never carries it.
  // Nothing here autosaves while a character is being opened (the Characters list's own id is still the previous
  // character's then). The older-holdings review, which runs first, then finds only the real choices left.
  const GIVEN_SPELLS_ON_OPENING_ENABLED = true;

  const GS15 = (function(){
    // paused: set only by a test page that checks an earlier layer's review as it works without this unit.
    const api = {installed: false, paused: false, notes: [], settled: [], KEY: 'givenSpellsNote', SETTLED: 'givenSpellsSettled', RULE: 'given-spells-credited'};
    api.enabled = function(){ return GIVEN_SPELLS_ON_OPENING_ENABLED; };
    const GIVEN = ' (given by your School)';
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
    // Add one missing spell with its scroll, or nothing: a scroll this added for a spell that could not be learned is
    // taken away again. True when the spell row is there afterwards.
    api.add = function(s){
      if(!s.maho && !spellEligibility(s).eligible) return false;
      const hadScroll = SC8.scrollRow(s.name);
      // A saved character usually opens in Play, where Phase 12's gate (Part K) stops every event on the Technique
      // picker, so the spell would never be learned. The gate is lifted for this one add and put back at once; the
      // mode the player sees does not change. (Found at the device round: the scroll came back alone.)
      const play = typeof MODES12 === 'object' && MODES12 && MODES12.mode === 'play';
      if(play) MODES12.mode = 'management';
      try { CW1122.addSpell(SPELL_LIBRARY.indexOf(s)); } finally { if(play) MODES12.mode = 'play'; }
      if(SC8.spellRow(s.name)) return true;
      const scroll = SC8.scrollRow(s.name);
      if(scroll && scroll !== hadScroll) scroll.remove();
      return false;
    };
    // One School: mark the given spells it holds, add the ones it lacks. {school, marked, added, complete}.
    api.credit = function(school){
      const data = CW1123.forSchool(school);
      const out = {school: school, marked: [], added: [], complete: true};
      if(!data || !Array.isArray(data.given)) return out;
      data.given.forEach(function(given){
        const s = spellByName(given);
        if(!s){ out.complete = false; return; }
        const held = SC8.spellRow(s.name);
        if(held){
          if(SC8Logic.belongs(SC8.read(held, 'spell'), school)) return;
          tag(held, 'spell', school, s.name, false);
          const scroll = SC8.scrollRow(s.name);
          if(scroll) tag(scroll, 'scroll', school, s.name, false);
          out.marked.push(s.name);
          return;
        }
        const hadScroll = !!SC8.scrollRow(s.name);
        if(!api.add(s)){ out.complete = false; return; }
        tag(SC8.spellRow(s.name), 'spell', school, s.name, true);
        const scroll = SC8.scrollRow(s.name);
        if(scroll) tag(scroll, 'scroll', school, s.name, !hadScroll);
        out.added.push(s.name);
      });
      return out;
    };
    // Not while a School-choice window or the creation wizard is open: their own paths decide what is added there.
    api.busy = function(){
      return (typeof SC8.inPicker === 'function' && SC8.inPicker()) || (typeof CW112 === 'object' && CW112 && typeof CW112.isOpen === 'function' && CW112.isOpen());
    };
    api.afterOpen = function(data){
      api.notes = api.clean(data && data[api.KEY]);
      api.settled = names(data && data[api.SETTLED]);
      let changed = false;
      if(!api.busy()){
        getSchoolsList().forEach(function(entry){
          const school = entry && typeof entry.name === 'string' ? entry.name : '';
          if(!school || api.settled.indexOf(school) >= 0 || !CW1123.forSchool(school)) return;
          const done = api.credit(school);
          if(done.marked.length || done.added.length){ api.merge(done); changed = true; }
          if(done.complete) api.settled.push(school);
        });
      }
      if(changed) recalcAll();
      renderValidationReport();
      return changed;
    };
    // The School a given list belongs to: the School-choice layer's School in scope, else a School already done.
    api.schoolOf = function(data){
      const candidates = (SC8.scope ? [SC8.scope] : []).concat(api.settled);
      return candidates.find(function(n){ return CW1123.forSchool(n) === data; }) || '';
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
      clearAllRows = function(){ api.notes = []; api.settled = []; return clear.apply(this, arguments); };
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
          if(api.settled.length) data[api.SETTLED] = api.settled.slice();
          else delete data[api.SETTLED];
          // Not saved: tells an export of the open character from one of a stored character.
          Object.defineProperty(data, 'gs15Open', {value: true, enumerable: false});
        }
        return data;
      };
      // A School already done: a given spell the player removed is not listed as still to choose. The character
      // check's starting-spell lines (Phase 11.2.3 and the School-choice layer) both read this list.
      const open = CW1123.open;
      CW1123.open = function(data){
        const out = open.apply(this, arguments);
        if(!Array.isArray(out) || !api.settled.length || !data || !Array.isArray(data.given)) return out;
        const school = api.schoolOf(data);
        if(!school || api.settled.indexOf(school) < 0) return out;
        const quiet = data.given.map(function(n){ return n + GIVEN; });
        return out.filter(function(item){ return quiet.indexOf(item) < 0; });
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
