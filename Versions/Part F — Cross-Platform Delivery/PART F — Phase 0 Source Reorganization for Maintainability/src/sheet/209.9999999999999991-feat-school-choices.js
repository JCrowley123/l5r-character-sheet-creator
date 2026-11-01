  // ============ PART K PHASE 11.2.5 — SCHOOL CHOICES FROM THE CHARACTER CHECK ============
  const SCHOOL_CHOICES_ENABLED = true;

  // Optional row records: old saves remain unclaimed until the player chooses their source.
  const SC8Logic = {
    key: function(value){ return String(value || '').trim().toLowerCase(); },
    record: function(value, kind, name){
      if(!value || typeof value !== 'object' || Array.isArray(value) || value.version !== 1 ||
        value.stage !== 'starting' || value.kind !== kind || typeof value.school !== 'string' ||
        !value.school.trim() || value.school.length > 200 || typeof value.name !== 'string' ||
        SC8Logic.key(value.name) !== SC8Logic.key(name)) return null;
      if(kind === 'skill' && (!Number.isInteger(value.slot) || value.slot < 0 || value.slot > 99 ||
        typeof value.choice !== 'string' || value.choice.length > 500)) return null;
      const out = {version:1, stage:'starting', kind:kind, school:value.school, name:value.name, created:value.created === true};
      if(kind === 'spell' && Array.isArray(value.otherSchools)){
        out.otherSchools = value.otherSchools.filter(function(s, i, all){ return typeof s === 'string' && s.trim() && s.length <= 200 && s !== value.school && all.indexOf(s) === i; });
        if(!out.otherSchools.length) delete out.otherSchools;
      }
      if(kind === 'skill') Object.assign(out, {slot:value.slot, choice:value.choice,
        priorSchool:value.priorSchool === true, priorFloor:String(Math.max(0, Math.min(10, Number(value.priorFloor) || 0)))});
      return out;
    },
    belongs: function(record, school){ return !!record && [record.school].concat(record.otherSchools || []).includes(school); },
    addSchool: function(record, school){
      const out = Object.assign({}, record);
      if(!SC8Logic.belongs(out, school)) out.otherSchools = (out.otherSchools || []).concat(school);
      return out;
    },
    withoutSchool: function(record, school){
      const left = [record.school].concat(record.otherSchools || []).filter(function(s){ return s !== school; });
      if(!left.length) return null;
      const out = Object.assign({}, record, {school:left[0]});
      if(left.length > 1) out.otherSchools = left.slice(1); else delete out.otherSchools;
      return out;
    },
    slotFilled: function(record, school, slot, label, rank, ticked){
      return SC8Logic.belongs(record, school) && record.slot === slot && record.choice === label && Number(rank) >= 1 && ticked === true;
    }
  };

  const SC8 = (function(){
    const api = {scope:null, dialog:null, school:'', kind:'', pendingSlot:null, rendering:false};
    const $ = function(id){ return document.getElementById(id); };
    const norm = SC8Logic.key;
    api.spellName = function(name){ return typeof SPELLNAMES === 'object' && SPELLNAMES.currentName(name) || name; };
    api.enabled = function(){ return SCHOOL_CHOICES_ENABLED; };
    api.withSchool = function(school, fn){
      const before = api.scope;
      api.scope = school;
      try { return fn(); } finally { api.scope = before; }
    };
    api.inPicker = function(){ return !!api.scope || !!(api.dialog && api.dialog.open) || CW112.isOpen(); };
    api.rowName = function(row, kind){
      const input = row.querySelector(kind === 'skill' ? '.sk-name' : kind === 'scroll' ? '.eq-name' : '.en-name');
      const value = input ? input.value : '';
      return kind === 'scroll' ? (spellNameFromScrollLabel(value) || '') : value;
    };
    api.read = function(row, kind){
      let raw;
      try { raw = JSON.parse(row.dataset.sc8Grant || 'null'); } catch(e){ return null; }
      const name = api.rowName(row, kind);
      if(kind !== 'skill' && raw) raw = Object.assign({}, raw, {name:api.spellName(raw.name)});
      return SC8Logic.record(raw, kind === 'scroll' ? 'spell' : kind, kind === 'skill' ? name : api.spellName(name));
    };
    // UI hook: a visible source on the actual row, kept out of editable notes and names.
    api.badge = function(row, record){
      row.querySelectorAll('.sc8-source').forEach(function(n){ n.remove(); });
      if(!record) return;
      const label = document.createElement('small');
      label.className = 'sc8-source';
      label.textContent = 'School: ' + [record.school].concat(record.otherSchools || []).join(' · ');
      const name = row.querySelector('.sk-name, .eq-name, .en-name');
      if(name) name.after(label);
    };
    api.write = function(row, record){
      if(record) row.dataset.sc8Grant = JSON.stringify(record);
      else delete row.dataset.sc8Grant;
      api.badge(row, record);
    };
    api.spellRows = function(){ return Array.from($('techList').querySelectorAll('.entry')).filter(function(r){ return !!r.dataset.spellElement; }); };
    api.skillRows = function(){ return Array.from($('skillsBody').rows); };
    api.scrollRow = function(name){ return Array.from($('equipBody').rows).find(function(r){ return norm(api.spellName(api.rowName(r, 'scroll'))) === norm(api.spellName(name)); }); };
    api.spellRow = function(name){ return api.spellRows().find(function(r){ return norm(api.spellName(api.rowName(r, 'spell'))) === norm(api.spellName(name)); }); };
    api.slots = function(school){ return api.withSchool(school, function(){ return CW1121.slots(); }); };
    api.slotRows = function(school){
      const out = {}, slots = api.slots(school);
      api.skillRows().forEach(function(row){
        const grant = api.read(row, 'skill');
        if(!grant || slots[grant.slot] === undefined) return;
        if(SC8Logic.slotFilled(grant, school, grant.slot, slots[grant.slot], row.querySelector('.sk-rank').value,
          row.querySelector('.sk-school').checked) && !out[grant.slot]) out[grant.slot] = row;
      });
      return out;
    };
    api.openSkills = function(school){
      const filled = api.slotRows(school);
      return api.slots(school).filter(function(label, i){ return !filled[i]; });
    };
    api.changed = function(){
      recalcAll();
      if(typeof CL11 === 'object' && CL11) CL11.flush();
    };
    api.skillChoice = function(row, school, slot, created, prior){
      const slots = api.slots(school);
      if(!row || !Number.isInteger(slot) || !slots[slot]) return;
      api.write(row, {version:1, stage:'starting', kind:'skill', school:school, slot:slot, choice:slots[slot],
        name:api.rowName(row, 'skill'), created:created, priorSchool:prior.school, priorFloor:prior.floor});
    };
    api.releaseSkill = function(row){
      const record = api.read(row, 'skill');
      if(!record) return false;
      api.write(row, null);
      const rank = row.querySelector('.sk-rank');
      // Keep paid ranks and adopted rows; a pristine new free row can follow the wizard's undo.
      if(record.created && Number(rank.value) === 1 && !getEmphValues(row).length) return false;
      row.querySelector('.sk-school').checked = record.priorSchool;
      rank.dataset.free = record.priorFloor;
      api.changed();
      return true;
    };
    api.findings = function(kind){
      const result = [];
      validatorSchoolEntries().forEach(function(s){
        if(!s.lib) return;
        let open, title, detail;
        if(kind === 'skill'){
          open = api.openSkills(s.name);
          title = s.name + ': ' + open.length + ' free Skill choice' + (open.length === 1 ? '' : 's') + ' still open';
          detail = 'Still to choose: ' + open.join('; ') + '. Choose these as this School’s Skills in Manage.';
        } else {
          const data = CW1123.forSchool(s.name);
          if(!data) return;
          open = api.withSchool(s.name, function(){ return CW1123.open(data); });
          title = s.name + ': starting spells not all chosen';
          detail = data.source + ' gives ' + CW1123.describe(data) + '. Still to choose: ' + open.join(', ') + '.';
        }
        if(!open.length) return;
        const finding = validationFinding(kind === 'skill' ? 'school-choice-slots' : 'school-starting-spells', 'info', title, detail);
        finding.sc8School = s.name;
        finding.sc8Kind = kind;
        result.push(finding);
      });
      return result;
    };
    // UI hook: decorate the report with actions; asking for findings itself never changes a row.
    api.decorate = function(){
      const host = $('validationReport');
      if(!host) return;
      host.querySelectorAll('.sc8-open').forEach(function(b){ b.remove(); });
      if(MODES12.isPlay() || CW112.isOpen()) return;
      const findings = validateCharacter().findings;
      Array.from(host.querySelectorAll('.vr-row')).forEach(function(row, index){
        const f = findings[index];
        if(!f || !f.sc8School) return;
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'ghost sc8-open';
        button.textContent = f.sc8Kind === 'skill' ? 'Choose School Skills' : 'Choose School scrolls';
        button.dataset.school = f.sc8School; button.dataset.kind = f.sc8Kind;
        button.addEventListener('click', function(){ api.open(f.sc8School, f.sc8Kind); });
        row.querySelector('.vr-text').appendChild(button);
      });
    };
    api.close = function(){
      if(api.dialog){ const dialog = api.dialog; api.dialog = null; dialog.close(); dialog.remove(); }
      api.school = ''; api.kind = ''; api.pendingSlot = null;
      CW1121.slotRows = {}; CW1121.slotSchool = '';
      if(api.returnFocus && api.returnFocus.isConnected) api.returnFocus.focus();
      api.returnFocus = null;
    };
    // UI hook: render the existing wizard forms inside a separate, dismissible dialog.
    api.render = function(){
      if(!api.dialog || !api.dialog.open || api.rendering) return;
      api.rendering = true;
      try {
        const body = $('sc8Body'); body.textContent = '';
        api.withSchool(api.school, function(){
          if(api.kind === 'skill'){
            CW1121.skillsStep.render(body);
            Array.from(body.children).forEach(function(n){ if(!n.matches('.cw1121-slot[data-slot]')) n.remove(); });
          } else {
            const data = CW1123.forSchool(api.school);
            if(data) CW1123.render(body, data);
            body.querySelectorAll('.cw1122-open').forEach(function(n){ n.remove(); });
            let active = null, element = '';
            body.querySelectorAll('.cw1123-quota').forEach(function(box){
              const available = box.querySelector('select') && !api.skipped.has(box.dataset.element);
              if(!active && available){ active = box; element = box.dataset.element; }
              else box.hidden = true;
            });
            const dynamic = body.querySelector('.cw1124-pick');
            if(dynamic){
              const select = dynamic.querySelector('select');
              if(select){
                const group = Array.from(select.querySelectorAll('optgroup')).find(function(g){ return !api.skipped.has(g.label); });
                if(group){
                  element = group.label; active = dynamic;
                  Array.from(select.querySelectorAll('optgroup')).forEach(function(g){ if(g !== group) g.remove(); });
                  select.options[0].textContent = '— choose a ' + element + ' spell —';
                } else dynamic.hidden = true;
              }
            }
            if(active){
              const later = document.createElement('button'); later.type = 'button';
              later.className = 'ghost sc8-later'; later.textContent = 'Leave ' + element + ' for later';
              later.addEventListener('click', function(){ api.skipped.add(element); api.render(); });
              active.appendChild(later);
            }
            // The School picker may undo its own grants, never an unrelated reward scroll.
            body.querySelectorAll('.cw1121-entry').forEach(function(entry){
              const name = entry.querySelector('.cw1121-entry-name').textContent.replace(/ · scroll in Equipment$/, '');
              const row = api.spellRow(name), record = row && api.read(row, 'spell');
              if(!SC8Logic.belongs(record, api.school)) entry.remove();
            });
            if(api.skipped.size){
              const note = document.createElement('p'); note.className = 'cw112-note';
              note.textContent = 'Choices left for later stay in the character check.'; body.appendChild(note);
            }
          }
        });
      } finally { api.rendering = false; }
    };
    api.open = function(school, kind){
      if(!api.enabled() || MODES12.isPlay() || CW112.isOpen() || !getSchoolsList().some(function(s){ return s.name === school; }) ||
        !['skill', 'spell'].includes(kind)) return false;
      api.close();
      api.school = school; api.kind = kind; api.skipped = new Set(); api.returnFocus = document.activeElement;
      const dialog = document.createElement('dialog');
      dialog.id = 'sc8Dialog'; dialog.className = 'sc8-dialog'; dialog.setAttribute('aria-labelledby', 'sc8Title');
      const title = document.createElement('h2'); title.id = 'sc8Title';
      title.textContent = school + (kind === 'skill' ? ' — School Skills' : ' — School scrolls');
      const intro = document.createElement('p'); intro.className = 'cw112-note';
      intro.textContent = 'Choose now or leave choices for later. Selecting an item already on your sheet marks it as this School’s choice without adding another copy.';
      const body = document.createElement('div'); body.id = 'sc8Body';
      const message = document.createElement('p'); message.id = 'sc8Message'; message.setAttribute('role', 'status');
      const done = document.createElement('button'); done.type = 'button'; done.id = 'sc8Done'; done.textContent = 'Done';
      done.addEventListener('click', function(){ api.close(); });
      dialog.addEventListener('cancel', function(e){ e.preventDefault(); api.close(); });
      dialog.append(title, intro, message, body, done); document.body.appendChild(dialog);
      api.dialog = dialog; dialog.showModal(); api.render();
      return true;
    };
    return api;
  })();

  if(SC8.enabled()){
    const sc8AppliedSchool = CW112.appliedSchool;
    CW112.appliedSchool = function(){ return SC8.scope || SC8.school || sc8AppliedSchool.apply(this, arguments); };
    const sc8Learned = CW1123.learned;
    CW1123.learned = function(){
      if(!SC8.inPicker()) return sc8Learned.apply(this, arguments);
      const school = CW112.appliedSchool();
      return SC8.spellRows().filter(function(row){ return SC8Logic.belongs(SC8.read(row, 'spell'), school); })
        .map(function(row){ return SC8.spellName(SC8.rowName(row, 'spell').trim()); });
    };
    const sc8AddSpell = CW1122.addSpell;
    CW1122.addSpell = function(index){
      if(!SC8.inPicker()) return sc8AddSpell.apply(this, arguments);
      const spell = SPELL_LIBRARY[index];
      if(!spell) return false;
      const school = CW112.appliedSchool();
      if(!school) return sc8AddSpell.apply(this, arguments);
      const previous = SC8.spellRow(spell.name), scroll = SC8.scrollRow(spell.name);
      const record = previous && SC8.read(previous, 'spell');
      if(SC8Logic.belongs(record, school)) return false;
      if(!previous) sc8AddSpell.call(this, index);
      else if(!scroll){
        renderSpellScrollsList('');
        const button = document.querySelector('#spellScrollsList .spell-scroll-add-btn[data-idx="' + index + '"]');
        if(button) button.click();
      }
      const row = SC8.spellRow(spell.name);
      if(!row) return false;
      const grant = record ? SC8Logic.addSchool(record, school) : {version:1, stage:'starting', kind:'spell', school:school, name:spell.name, created:!previous};
      SC8.write(row, grant);
      const owned = SC8.scrollRow(spell.name);
      if(owned){
        const old = SC8.read(owned, 'scroll');
        SC8.write(owned, old ? SC8Logic.addSchool(old, school) : Object.assign({}, grant, {created:!scroll}));
      }
      SC8.changed();
      return true;
    };
    const sc8RemoveSpell = CW1122.removeSpell;
    CW1122.removeSpell = function(row){
      const record = SC8.read(row, 'spell');
      if(!record) return sc8RemoveSpell.apply(this, arguments);
      const scroll = SC8.scrollRow(record.name), scrollGrant = scroll && SC8.read(scroll, 'scroll');
      const school = CW112.appliedSchool(), remaining = SC8Logic.withoutSchool(record, school);
      SC8.write(row, remaining);
      const removeEntry = !remaining && record.created && row.dataset.isMemorised !== 'true';
      if(removeEntry) row.querySelector('.rm-btn').click();
      if(SC8Logic.belongs(scrollGrant, school)){
        const scrollRemaining = SC8Logic.withoutSchool(scrollGrant, school);
        SC8.write(scroll, scrollRemaining);
        // A retained known/memorised entry keeps its scroll too; this cannot open a hidden confirmation.
        if(removeEntry && !scrollRemaining && scrollGrant.created) scroll.querySelector('.rm-btn').click();
      }
      SC8.changed();
    };
    const sc8SkillsRender = CW1121.skillsStep.render;
    CW1121.skillsStep.render = function(body){
      const school = CW112.appliedSchool();
      CW1121.slotRows = SC8.slotRows(school); CW1121.slotSchool = school;
      sc8SkillsRender.apply(this, arguments);
      body.querySelectorAll('.cw1121-slot[data-slot]').forEach(function(box){
        box.addEventListener('click', function(){ SC8.pendingSlot = Number(box.dataset.slot); }, true);
      });
    };
    const sc8AddSkill = CW1121.addSkill;
    CW1121.addSkill = function(name, subject, asSchool){
      if(!asSchool || !SC8.inPicker()) return sc8AddSkill.apply(this, arguments);
      const school = CW112.appliedSchool(), slots = SC8.slots(school), filled = SC8.slotRows(school);
      const slot = SC8.pendingSlot === null ? slots.findIndex(function(s, i){ return !filled[i]; }) : SC8.pendingSlot;
      SC8.pendingSlot = null;
      if(!slots[slot] || filled[slot]) return null;
      const full = subject ? name + ': ' + subject : name;
      let row = SC8.skillRows().find(function(r){ return SC8Logic.key(SC8.rowName(r, 'skill')) === SC8Logic.key(full); });
      const fixed = validatorConcreteSkills(findAnySchoolLibraryEntry(school)).map(SC8Logic.key);
      if(row && fixed.some(function(n){ return n === SC8Logic.key(full) || n === SC8Logic.key(name); })){
        const message = document.getElementById('sc8Message') || document.getElementById('cw112Reason');
        if(message) message.textContent = full + ' is already a fixed School Skill. Choose another Skill or subject.';
        return null;
      }
      const oldGrant = row && SC8.read(row, 'skill');
      if(oldGrant && (oldGrant.school !== school || Object.values(filled).includes(row))) return null;
      const prior = row ? {school:row.querySelector('.sk-school').checked, floor:row.querySelector('.sk-rank').dataset.free || '0'} : {school:false, floor:'0'};
      const created = !row;
      if(!row) row = sc8AddSkill.apply(this, arguments);
      else {
        const rank = row.querySelector('.sk-rank'); rank.value = Math.max(1, Number(rank.value) || 0);
        rank.dataset.free = String(Math.max(1, Number(rank.dataset.free) || 0));
        const tick = row.querySelector('.sk-school'); tick.checked = true;
        tick.dispatchEvent(new Event('change', {bubbles:true}));
      }
      SC8.skillChoice(row, school, slot, created, prior); SC8.changed();
      return row;
    };
    const sc8Groups = CW1121.skillGroups;
    CW1121.skillGroups = function(){
      const groups = sc8Groups.apply(this, arguments);
      if(!SC8.inPicker() || !SC8.forSlot) return groups;
      const school = findAnySchoolLibraryEntry(CW112.appliedSchool());
      const fixed = validatorConcreteSkills(school).map(SC8Logic.key);
      SC8.skillRows().forEach(function(row){
        const record = SC8.read(row, 'skill');
        if(record && (record.school !== CW112.appliedSchool() || Object.values(SC8.slotRows(record.school)).includes(row))) return;
        const name = SC8.rowName(row, 'skill'), base = name.split(':')[0].trim();
        if(fixed.some(function(n){ return n === SC8Logic.key(name) || n === SC8Logic.key(base); })) return;
        const skill = findSkill(base);
        if(!skill) return;
        let group = groups.find(function(g){ return g.label === skill.cat; });
        if(!group){ group = {label:skill.cat, options:[]}; groups.push(group); }
        if(!group.options.includes(base)) group.options.push(base);
      });
      return groups;
    };
    const sc8GroupsForSlot = CW1121.groupsForSlot;
    CW1121.groupsForSlot = function(){
      SC8.forSlot = true;
      try { return sc8GroupsForSlot.apply(this, arguments); } finally { SC8.forSlot = false; }
    };
    const sc8RemoveSkill = CW1121.removeRow;
    CW1121.removeRow = function(row){ if(!SC8.dialog || !SC8.dialog.open || !SC8.releaseSkill(row)) return sc8RemoveSkill.apply(this, arguments); };
    const sc8OpenFor = CW1122.openFor;
    CW1122.openFor = function(id){
      if(id === 'skills'){
        CW1121.slotRows = SC8.slotRows(CW112.appliedSchool());
        return sc8OpenFor.apply(this, arguments);
      }
      if(id === 'spells') return SC8.withSchool(CW112.appliedSchool(), function(){ return sc8OpenFor(id); });
      return sc8OpenFor.apply(this, arguments);
    };
    const sc8RenderWizard = CW112.render;
    CW112.render = function(){
      if(SC8.dialog && SC8.dialog.open){ SC8.render(); SC8.changed(); return; }
      return sc8RenderWizard.apply(this, arguments);
    };
    ['skill', 'spell'].forEach(function(kind){
      const id = kind === 'skill' ? 'school-choice-slots' : 'school-starting-spells';
      const rule = CHARACTER_VALIDATOR_RULES.find(function(r){ return r.id === id; });
      if(rule) rule.fn = function(){ return SC8.findings(kind); };
    });
    const sc8Report = renderValidationReport;
    renderValidationReport = function(){ const result = sc8Report.apply(this, arguments); SC8.decorate(); return result; };
    const sc8SetMode = MODES12.set;
    MODES12.set = function(){ const result = sc8SetMode.apply(this, arguments); if(MODES12.isPlay()) SC8.close(); SC8.decorate(); return result; };
    const sc8Collect = collectData;
    collectData = function(){
      const data = sc8Collect.apply(this, arguments);
      [['skills', '#skillsBody tr', 'skill'], ['tech', '#techList .entry', 'spell'], ['equip', '#equipBody tr', 'scroll']].forEach(function(spec){
        document.querySelectorAll(spec[1]).forEach(function(row, i){
          const record = SC8.read(row, spec[2]);
          if(record && data[spec[0]][i]) data[spec[0]][i].schoolChoice = record;
        });
      });
      return data;
    };
    const sc8MakeSkill = makeSkillRow;
    makeSkillRow = function(data){ const row = sc8MakeSkill.apply(this, arguments); SC8.write(row, SC8Logic.record(data && data.schoolChoice, 'skill', SC8.rowName(row, 'skill'))); return row; };
    const sc8MakeEntry = makeEntry;
    makeEntry = function(data){ const row = sc8MakeEntry.apply(this, arguments); if(row.dataset.spellElement) SC8.write(row, SC8Logic.record(data && data.schoolChoice, 'spell', SC8.spellName(SC8.rowName(row, 'spell')))); return row; };
    const sc8MakeEquip = makeEquipRow;
    makeEquipRow = function(data){ const row = sc8MakeEquip.apply(this, arguments); SC8.write(row, SC8Logic.record(data && data.schoolChoice, 'spell', SC8.spellName(SC8.rowName(row, 'scroll')))); return row; };
    const sc8Clear = clearAllRows;
    clearAllRows = function(){ SC8.close(); return sc8Clear.apply(this, arguments); };
  }
  // ============ END PART K PHASE 11.2.5 ============
