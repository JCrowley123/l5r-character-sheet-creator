  // BUGFIX OC8 — Older School choices
  const OLDER_SCHOOL_CHOICES_ENABLED = true;
  const OC8 = (function(){
    const api = {enabled: () => OLDER_SCHOOL_CHOICES_ENABLED && SC8.enabled()};
    const key = SC8Logic.key;
    const skills = () => SC8.skillRows();
    const holdings = () => SC8.spellRows().concat(Array.from(document.getElementById('equipBody').rows));
    const kind = row => row.matches('#skillsBody tr') ? 'skill' : row.matches('#equipBody tr') ? 'scroll' : 'spell';
    const name = row => {
      const type = kind(row), raw = SC8.rowName(row, type);
      return type === 'skill' ? raw : SC8.spellName(raw);
    };
    const catalog = new Map(SPELL_LIBRARY.map(s => [key(s.name), s]));
    const activeSpellEligibility = spellEligibility, activeDeficiency = CW1124.deficiency;
    let pending = new Map();
    let fixedNames = new Set(), fixedFamilies = new Map();
    function marked(row, school){
      const entry = pending.get(row);
      return !!entry && row.isConnected && entry.name === name(row) && entry.schools.has(school);
    }
    function mark(row, schools){
      if(schools.length) pending.set(row, {name:name(row), schools:new Set(schools)});
    }
    function clearSchool(school, type){
      for(const [row, entry] of pending){
        if((kind(row) === 'skill') === (type === 'skill')) entry.schools.delete(school);
        if(!entry.schools.size) pending.delete(row);
      }
    }
    function stamped(row, school){ return SC8Logic.belongs(SC8.read(row, kind(row)), school); }
    const canonical = value => key(SCHOOL_SKILL_ROWS.canonical(value));
    function fixedSkills(entries, applied){
      fixedNames = new Set(entries.flatMap(s => validatorConcreteSkills(s.lib)).map(canonical));
      fixedFamilies.clear();
      entries.forEach(s => {
        const named = validatorConcreteSkills(s.lib).map(canonical);
        const grants = s.name === applied?.school && Array.isArray(applied.skillGrants) ?
          applied.skillGrants.filter(g => g?.name).map(g => canonical(g.name)) : [];
        grants.forEach(n => fixedNames.add(n));
        for(const family of named){
          if(family.includes(':') || grants.some(n => n.startsWith(family + ':') && !named.includes(n))) continue;
          fixedFamilies.set(family, (fixedFamilies.get(family) || 0) + 1);
        }
      });
    }
    function skillSlots(school){
      const filled = SC8.slotRows(school);
      return SC8.withSchool(school, () => SC8.slots(school).map((label, index) => {
        const allowed = new Set(CW1121.groupsForSlot(label).flatMap(g => g.options).map(canonical));
        return {school, index, label, filled:filled[index], allowed};
      }));
    }
    const baseSkill = row => canonical(name(row)).split(':')[0].trim();
    function ticked(row){
      return row.querySelector('.sk-school').checked && Number(row.querySelector('.sk-rank').value) >= 1;
    }
    function fitsSkill(row, slot){
      const base = baseSkill(row);
      if(!ticked(row) || SC8.read(row, 'skill') || !slot.allowed.has(base)) return false;
      if(!fixedFamilies.has(base)) return true;
      const available = skills().filter(r => ticked(r) && !SC8.read(r,'skill') && baseSkill(r) === base &&
        (canonical(name(r)) === base || !fixedNames.has(canonical(name(r)))));
      return available.length > fixedFamilies.get(base);
    }
    function reserve(row, slot){
      // Only the source changes. Existing Rank, free floor, emphases and XP stay as loaded.
      SC8.skillChoice(row, slot.school, slot.index, false, {school:false, floor:row.querySelector('.sk-rank').dataset.free || '0'});
      pending.delete(row);
    }
    function autoSkills(slots){
      // An edge forced in every maximum matching identifies a choice even for
      // overlapping slots. Ambiguous assignments stay for the player.
      const open = slots.filter(slot => !slot.filled);
      const candidates = open.map(slot => skills().filter(row => marked(row, slot.school) && fitsSkill(row, slot)));
      function matching(skipSlot, skipRow){
        const assigned = new Map();
        function place(i, seen){
          for(const row of candidates[i]){
            if((i === skipSlot && row === skipRow) || seen.has(row)) continue;
            seen.add(row);
            if(!assigned.has(row) || place(assigned.get(row), seen)){
              assigned.set(row, i); return true;
            }
          }
          return false;
        }
        open.forEach((slot, i) => place(i, new Set()));
        return assigned;
      }
      const best = matching(-1, null);
      for(const [row, i] of best){
        const conflict = slots.some(slot => slot.filled && marked(row,slot.school) && fitsSkill(row,slot));
        if(!conflict && !fixedFamilies.has(baseSkill(row)) && matching(i, row).size < best.size) reserve(row, open[i]);
      }
    }
    function frozenProfile(school){
      const entry = getSchoolsList().find(e => e.name === school && e.frozen);
      if(!entry) return null;
      const lib = findAnySchoolLibraryEntry(school);
      return lib && {rank:Number(entry.frozenRank) || 0, affinity:lib.affinity, deficiency:lib.deficiency,
        unknownAffinity:!!lib.affinityChoice, unknownDeficiency:!!lib.elementDeficiencyChoice};
    }
    function deficiency(school){
      return frozenProfile(school) ? '' : activeDeficiency();
    }
    function frozenRank(profile, s, historical){
      if(s.element === 'Universal') return profile.rank;
      const possibleAffinity = historical && profile.unknownAffinity;
      // Old saves retained a frozen rank but no former Isawa affinity or Chuda deficiency.
      // Allow a player to identify an owned choice that could have qualified. New grants
      // use the rank that is certain without assuming a lost choice.
      const bonus = profile.affinity === s.element || possibleAffinity ? 1 : 0;
      const penalty = profile.deficiency === s.element || (!historical && profile.unknownDeficiency) ? 1 : 0;
      return Math.max(0, profile.rank + bonus - penalty);
    }
    function spellFits(data, s, school){
      if(!s || !data) return false;
      if(data.given.includes(s.name)) return true;
      if(data.slots) return data.slots.some(slot => CW1124.fits(slot, s, deficiency(school)));
      return !s.maho && data.choose.some(pair => pair[0] === s.element);
    }
    function eligible(data, s, school, historical){
      if(!spellFits(data, s, school)) return false;
      const profile = frozenProfile(school);
      return data.given.includes(s.name) || s.maho ||
        (profile ? s.mastery <= frozenRank(profile,s,historical) : activeSpellEligibility(s).eligible);
    }
    function credited(school){
      return new Set(SC8.withSchool(school, () => CW1123.learned()).map(n => catalog.get(key(n))).filter(Boolean));
    }
    function seats(data, spells, school){
      const chosen = [...spells].filter(s => !data.given.includes(s.name));
      const given = spells.size - chosen.length;
      const have = data.slots ? CW1124.bestFit(data.slots, chosen, deficiency(school)).have :
        data.choose.map(([element, count]) => Math.min(count, chosen.filter(s => !s.maho && s.element === element).length));
      return given + have.reduce((a,b) => a+b, 0);
    }
    function withinQuota(data, already, added, school){
      const combined = new Set([...already, ...added]);
      return seats(data, combined, school) - seats(data, already, school) === added.length;
    }
    function reviewSpells(school){
      const data = CW1123.forSchool(school), already = credited(school);
      const out = new Set();
      for(const row of pending.keys()){
        if(kind(row) === 'skill' || !marked(row, school)) continue;
        const s = catalog.get(key(name(row)));
        if(eligible(data, s, school, true) && !already.has(s) && withinQuota(data, already, [s], school)) out.add(s);
      }
      return [...out];
    }
    function reviewSkills(school){
      const slots = skillSlots(school);
      return [...pending.keys()].filter(row => kind(row) === 'skill' && marked(row, school) && slots.some(slot => fitsSkill(row, slot)));
    }
    function needs(school, type){
      if(!pending.size) return false;
      return type === 'skill' ? reviewSkills(school).length > 0 : reviewSpells(school).length > 0;
    }
    api.load = function(data){
      const current = data.schoolReviewVersion !== undefined;
      if(current && ![data.skills,data.tech,data.equip].some(list => Array.isArray(list) &&
        list.some(row => row && (row.olderSchoolReview?.length || row.reviewedScrollOnly)))) return false;
      const schools = validatorSchoolEntries().filter(s => s.lib);
      if(!schools.length) return;
      const names = schools.map(s => s.name);
      const restore = (row, saved, candidates) => {
        if(!saved) return;
        const pendingSchools = current ? (Array.isArray(saved.olderSchoolReview) ? saved.olderSchoolReview : []) : names;
        mark(row, candidates.filter(n => pendingSchools.includes(n)));
      };
      const rows = skills();
      let applied;
      try { applied = JSON.parse(data.fields?.f_schoolApplied || 'null'); } catch(e){}
      fixedSkills(schools, applied);
      const slots = schools.flatMap(s => skillSlots(s.name));
      rows.forEach((row, i) => {
        const full = canonical(name(row));
        if(!full || fixedNames.has(full) || !ticked(row) || SC8.read(row, 'skill')) return;
        restore(row, data.skills?.[i], slots.filter(slot => fitsSkill(row, slot)).map(slot => slot.school));
      });
      if(pending.size) autoSkills(slots);
      for(const [list, savedRows] of [[document.querySelectorAll('#techList .entry'),data.tech],[document.getElementById('equipBody').rows,data.equip]]){
        Array.from(list).forEach((row, i) => {
          const saved = savedRows?.[i], type = kind(row);
          if(!saved || (type === 'spell' && !row.dataset.spellElement)) return;
          if(type === 'scroll' && saved.reviewedScrollOnly === true && SC8.read(row, 'scroll')) row.dataset.oc8ScrollOnly = '1';
          const s = catalog.get(key(name(row)));
          const record = SC8.read(row,type);
          if(!s || (record && !current)) return;
          restore(row, saved, names.filter(n => !SC8Logic.belongs(record,n) && spellFits(CW1123.forSchool(n), s, n)));
        });
      }
      return true;
    };
    api.save = function(data){
      data.schoolReviewVersion = 1;
      for(const [list, field] of [[skills(),'skills'],[document.querySelectorAll('#techList .entry'),'tech'],[document.getElementById('equipBody').rows,'equip']]){
        Array.from(list).forEach((row,i) => {
          const entry = pending.get(row), saved = data[field]?.[i];
          if(!saved) return;
          if(entry && name(row) === entry.name && entry.schools.size) saved.olderSchoolReview = [...entry.schools];
          if(field === 'equip' && row.dataset.oc8ScrollOnly && SC8.read(row, 'scroll')) saved.reviewedScrollOnly = true;
        });
      }
      return data;
    };
    api.clear = () => { pending.clear(); fixedNames.clear(); fixedFamilies.clear(); };
    function tag(row, school, s){
      const record = SC8.read(row, kind(row));
      SC8.write(row, record ? SC8Logic.addSchool(record, school) :
        {version:1, stage:'starting', kind:'spell', name:s.name, school, created:false});
    }
    function finish(school, type){
      clearSchool(school, type);
      SC8.changed();
      SC8.render();
    }
    // UI hook: the existing Manage dialog hosts the review. Drafts belong to this
    // render and disappear with the dialog. Validate every row before committing.
    function node(tagName, text){
      const el = document.createElement(tagName);
      if(text) el.textContent = text;
      return el;
    }
    function button(text, click){
      const el = node('button',text); el.type = 'button'; el.className = 'ghost';
      el.addEventListener('click',click); return el;
    }
    function spellsUI(body, school){
      const data = CW1123.forSchool(school), items = reviewSpells(school);
      const already = credited(school);
      const status = SC8.withSchool(school, () => (data.slots ? CW1124 : CW1123).status(data));
      body.append(node('p','Select the spells your School gave you at creation. Leave later rewards unselected.'));
      if(data.slots) body.append(node('p',status.quotas.map(q => q.slot.label + ' (' + (q.want-q.have) + ' left)').join(' · ')));
      const groups = new Map(), inputs = [];
      items.forEach(s => {
        const group = data.given.includes(s.name) ? 'Given' : s.element;
        if(!groups.has(group)){
          const box = node('fieldset'), quota = status.quotas.find(q => q.element === group);
          const left = group === 'Given' ? status.missing.length : !data.slots && quota ? quota.want-quota.have : null;
          box.append(node('legend',group + (left === null ? '' : ' · ' + left + ' left')));
          groups.set(group,box); body.append(box);
        }
        const label = node('label'), input = node('input'); label.className = 'oc8-held-spell';
        input.type = 'checkbox'; input.value = s.name; input.className = 'oc8-spell';
        label.append(input,document.createTextNode(' ' + s.name));
        const line = node('div'); line.append(label); groups.get(group).append(line); inputs.push([input,s]);
      });
      const confirm = button('Confirm starting spells', () => {
        if(!SC8.dialog?.open || !body.contains(confirm) || SC8.school !== school || MODES12.isPlay()) return;
        const selected = inputs.filter(([input]) => input.checked).map(([,s]) => s);
        const available = new Set(reviewSpells(school));
        if(selected.some(s => !available.has(s)) || !withinQuota(data, credited(school), selected, school)){
          const excess = data.choose?.filter(([element, cap]) =>
            [...new Set([...already,...selected])].filter(s => s.element === element && !data.given.includes(s.name)).length > cap);
          document.getElementById('sc8Message').textContent = excess?.length ?
            'Too many choices for ' + excess.map(([e]) => e).join(', ') + '. Deselect a spell.' :
            'These choices do not fit the remaining School allotment. Check the groups above.';
          return;
        }
        selected.forEach(s => {
          const row = SC8.spellRow(s.name), scroll = SC8.scrollRow(s.name);
          if(row) tag(row,school,s);
          if(scroll){ tag(scroll,school,s); if(!row) scroll.dataset.oc8ScrollOnly = '1'; }
        });
        finish(school,'spell');
      });
      confirm.classList.add('oc8-confirm'); body.append(confirm);
    }
    function skillsUI(body,school){
      const rows = reviewSkills(school), slots = skillSlots(school);
      body.append(node('p','These Skills are already ticked as School Skills. Confirm which existing row fills a starting choice. If a tick is incorrect, close this review and correct it on the Skills page.'));
      rows.forEach(row => {
        const line = node('p',name(row) + ' · Rank ' + row.querySelector('.sk-rank').value + ' ');
        slots.filter(slot => !slot.filled && fitsSkill(row,slot)).forEach(slot => {
          const use = button('Use for ' + slot.label, () => {
            if(!SC8.dialog?.open || !body.contains(use) || MODES12.isPlay() || !marked(row,school) ||
               !fitsSkill(row,slot) || SC8.slotRows(school)[slot.index]) return;
            reserve(row,slot); SC8.changed(); SC8.render();
          });
          use.classList.add('oc8-use'); line.append(use);
        });
        body.append(line);
      });
      if(slots.some(slot => !slot.filled && rows.some(row => fitsSkill(row,slot)))) return;
      if(slots.every(slot => slot.filled))
        body.append(node('p','All starting slots already have a choice. Check the extra School ticks on your Skills page.'));
      const keep = button('Keep recorded choices', () => {
        if(body.contains(keep) && SC8.dialog?.open && !MODES12.isPlay()) finish(school,'skill');
      });
      body.append(keep);
    }
    api.install = function(){
      const clear = clearAllRows;
      clearAllRows = function(){ api.clear(); return clear.apply(this,arguments); };
      const apply = applyData;
      applyData = function(data){
        const result = apply.apply(this,arguments);
        if(result !== false && data && api.load(data)) renderValidationReport();
        return result;
      };
      const collect = collectData;
      collectData = function(){ return api.save(collect.apply(this,arguments)); };
      const learned = CW1123.learned;
      CW1123.learned = function(){
        const result = learned.apply(this,arguments);
        if(SC8.inPicker()){
          const school = CW112.appliedSchool();
          document.querySelectorAll('#equipBody [data-oc8-scroll-only]').forEach(row => {
            if(stamped(row,school) && !result.includes(name(row))) result.push(name(row));
          });
        }
        return result;
      };
      const findings = SC8.findings;
      SC8.findings = function(type){
        const result = findings.call(this,type);
        if(!pending.size) return result;
        validatorSchoolEntries().forEach(s => {
          if(!s.lib || !needs(s.name,type)) return;
          let item = result.find(f => f.sc8School === s.name);
          const id = type === 'skill' ? 'school-choice-slots' : 'school-starting-spells';
          if(!item){ item = validationFinding(id,'info','',''); item.sc8School = s.name; item.sc8Kind = type; result.push(item); }
          item.title = s.name + (type === 'skill' ? ': review older School Skills' : ': review starting spells');
          item.detail = type === 'skill' ? 'Check the School Skills already ticked on this character.' : 'Identify starting spells among the spells already on this character.';
          item.oc8Review = true;
        });
        return result;
      };
      const decorate = SC8.decorate;
      SC8.decorate = function(){
        decorate.apply(this,arguments);
        if(pending.size) document.querySelectorAll('#validationReport .sc8-open').forEach(b => {
          if(needs(b.dataset.school,b.dataset.kind))
            b.textContent = b.dataset.kind === 'skill' ? 'Review School Skills' : 'Review starting spells';
        });
      };
      const render = SC8.render;
      SC8.render = function(){
        if(!SC8.dialog?.open) return render.apply(this,arguments);
        const school = SC8.school, type = SC8.kind;
        const review = needs(school,type), dialog = SC8.dialog;
        const intro = dialog.querySelector('h2 + p'), done = document.getElementById('sc8Done');
        intro.hidden = review; done.textContent = review ? 'Later' : 'Done';
        document.getElementById('sc8Message').textContent = '';
        if(!review) return render.apply(this,arguments);
        const body = document.getElementById('sc8Body'); body.replaceChildren();
        if(type === 'skill') skillsUI(body,school); else spellsUI(body,school);
      };
      const addSkill = CW1121.addSkill;
      CW1121.addSkill = function(n, subject, asSchool){
        if(asSchool && SC8.inPicker() && needs(CW112.appliedSchool(),'skill')) return null;
        return addSkill.apply(this,arguments);
      };
      const addSpell = CW1122.addSpell;
      spellEligibility = function(s){
        const profile = (SC8.scope || SC8.school) && frozenProfile(SC8.scope || SC8.school);
        if(!profile) return activeSpellEligibility.apply(this,arguments);
        const effRank = frozenRank(profile,s,false);
        return {eligible:s.mastery <= effRank, effRank};
      };
      CW1124.deficiency = function(){
        return (SC8.scope || SC8.school) && frozenProfile(SC8.scope || SC8.school) ? '' : activeDeficiency.apply(this,arguments);
      };
      CW1122.addSpell = function(index){
        if(SC8.inPicker()){
          const school = CW112.appliedSchool(), s = SPELL_LIBRARY[index], data = CW1123.forSchool(school);
          if(needs(school,'spell')) return false;
          if(data && (!eligible(data,s,school,false) || !withinQuota(data, credited(school), [s], school))) return false;
        }
        return addSpell.apply(this,arguments);
      };
    };
    return api;
  })();
  if(OC8.enabled()) OC8.install();
