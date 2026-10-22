  // ========= PART I PHASE 4.5.39: SUPPLEMENT SKILL PICKERS =========
  // Pickers for four of Phase 4.5.37's entries (owner's rulings, 22 October 2026, as recommended):
  //   Reincarnated          Book of Void p.191  three non-School Skills, +1k0 on their rolls (the GM approves).
  //                                             A Void Point on one of those rolls brings on Anachronism for
  //                                             1-10 hours: a note in the preview. 5 points with an Ancestor
  //                                             (Phase 4.8) or a Henshin School, otherwise 6.
  //   Watanu-Trained        Book of Void p.195  one Craft; +1k1, declared on its roll, making metal goods.
  //   Water Hammer Citizen  Strongholds p.107   one Rank in a Craft, not above 4.
  //   Zakyo Toshi Citizen   Strongholds p.152   one Rank in a Games Skill.
  // A granted Rank is added on Confirm (the Skill row is made if missing) and costs no XP: it raises that row's
  // free floor by one through the getPaidEmphCount-then-skillCost contract (Feature 4.5.32). The receipt is kept
  // in the entry's config, so choosing another Skill, renaming or removing the entry takes the Rank back.
  // Kill switch SUPPLEMENT_SKILL_PICKERS_ENABLED.
  const SUPPLEMENT_SKILL_PICKERS_ENABLED = true;

  const SUPP4539 = (function(){
    const api = {};
    api.TYPE = 'supp4539Skills';
    api.PROVIDER = 'supplement-skill-pickers';
    api.enabled = function(){
      return SUPPLEMENT_SKILL_PICKERS_ENABLED && typeof ADV_CONFIG_ENABLED !== 'undefined' && ADV_CONFIG_ENABLED;
    };
    const norm = function(s){ return String(s == null ? '' : s).trim().replace(/\s+/g, ' ').toLowerCase(); };
    // "Craft:Blacksmithing (Tools)" -> "craft: blacksmithing": the emphasis is not part of the Skill.
    api.skillKey = function(name){ return norm(String(name == null ? '' : name).replace(/\s*\(.*$/, '').replace(/\s*:\s*/, ': ')); };
    api.base = function(name){ return api.skillKey(name).split(':')[0].trim(); };
    api.ENTRIES = {
      'Reincarnated': {count:3, source:'Book of Void p.191'},
      'Watanu-Trained': {count:1, base:'Craft', declare:true, source:'Book of Void p.195'},
      'Water Hammer Citizen': {count:1, base:'Craft', grant:true, max:4, source:'Strongholds of the Empire p.107'},
      'Zakyo Toshi Citizen': {count:1, base:'Games', grant:true, source:'Strongholds of the Empire p.152'},
    };
    api.entryFor = function(name){
      const key = Object.keys(api.ENTRIES).find(function(k){ return norm(k) === norm(name); });
      return key ? Object.assign({name:key}, api.ENTRIES[key]) : null;
    };
    api.owns = function(schema){ return !!schema && schema.supp4539 === true && !!api.entryFor(schema.name); };

    // ---------- The character ----------
    api.schoolSkills = function(){
      const out = new Set();
      (typeof getSchoolsList === 'function' ? getSchoolsList() : []).forEach(function(s){
        (typeof schoolConcreteSkillNames === 'function' ? schoolConcreteSkillNames(s.name) : []).forEach(function(n){ out.add(api.skillKey(n)); });
      });
      document.querySelectorAll('#skillsBody tr').forEach(function(tr){
        const box = tr.querySelector('.sk-school'), name = tr.querySelector('.sk-name');
        if(box && box.checked && name) out.add(api.skillKey(name.value));
      });
      out.delete('');
      return out;
    };
    api.skillRow = function(skill){
      const key = api.skillKey(skill);
      return Array.from(document.querySelectorAll('#skillsBody tr')).find(function(tr){
        const n = tr.querySelector('.sk-name');
        return !!n && api.skillKey(n.value) === key;
      }) || null;
    };
    api.rankOf = function(tr){ return tr ? (parseInt(tr.querySelector('.sk-rank').value || '0', 10) || 0) : 0; };
    api.henshin = function(){
      return (typeof getSchoolsList === 'function' ? getSchoolsList() : []).some(function(s){ return /\bhenshin\b/i.test(s.name); });
    };
    api.ancestor = function(){
      try { return typeof ANC48 === 'object' && !!ANC48 && typeof ANC48.current === 'function' && !!ANC48.current(); }
      catch(e){ return false; }
    };
    api.reincarnatedPrice = function(){ return api.ancestor() || api.henshin() ? 5 : 6; };

    // ---------- Configuration ----------
    // {type, revision:1, skills:[...], value, grant?:{skill, created}}
    api.problem = function(entry, skills, schoolSkills){
      if(skills.length !== entry.count || skills.some(function(s){ return typeof s !== 'string' || !s.trim() || s.length > 80; })){
        return entry.count === 1 ? 'Enter the Skill.' : 'Enter ' + entry.count + ' Skills.';
      }
      const keys = skills.map(api.skillKey);
      if(new Set(keys).size !== keys.length) return 'Choose ' + entry.count + ' different Skills.';
      if(entry.base){
        const bad = skills.find(function(s){ return api.base(s) !== norm(entry.base) || !/:\s*\S/.test(s); });
        if(bad !== undefined) return 'Write the Skill as ' + entry.base + ': its name, such as ' + (entry.base === 'Craft' ? 'Craft: Blacksmithing.' : 'Games: Go.');
      }
      if(schoolSkills){
        const school = skills.find(function(s){ return schoolSkills.has(api.skillKey(s)); });
        if(school !== undefined) return school.trim() + ' is one of your School Skills; choose another.';
      }
      return '';
    };
    api.complete = function(schema, config){
      if(!api.enabled() || !api.owns(schema) || !config || Array.isArray(config) || config.type !== api.TYPE ||
        config.revision !== 1 || !Array.isArray(config.skills)) return false;
      if(Object.keys(config).some(function(k){ return ['type', 'revision', 'skills', 'value', 'grant'].indexOf(k) === -1; })) return false;
      const entry = api.entryFor(schema.name);
      if(api.problem(entry, config.skills, null)) return false;
      if(!entry.grant) return config.grant === undefined;
      const g = config.grant;
      return !!g && typeof g === 'object' && typeof g.created === 'boolean' && typeof g.skill === 'string' &&
        api.skillKey(g.skill) === api.skillKey(config.skills[0]);
    };
    api.summary = function(entry, skills){
      const list = skills.map(function(s){ return s.trim(); });
      if(entry.name === 'Reincarnated') return '+1k0 on ' + list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1] + ' (the GM approves)';
      if(entry.name === 'Watanu-Trained') return list[0] + ' — +1k1 making metal goods (declare it on the roll)';
      if(entry.name === 'Water Hammer Citizen') return list[0] + ' — one free Rank; crafting time as if it cost one coin smaller';
      return list[0] + ' — one free Rank';
    };
    api.resolve = function(name, config){
      const schema = typeof advConfigSchemaFor === 'function' ? advConfigSchemaFor(name) : null;
      if(!api.complete(schema, config)) return null;
      const entry = api.entryFor(name);
      const effect = {effect:'supp4539', entryName:entry.name, skills:config.skills.slice(), label:api.summary(entry, config.skills)};
      if(entry.name === 'Reincarnated') effect.cost = api.reincarnatedPrice();
      return effect;
    };
    // Configured entries on the Advantages list: [{div, entry, config}].
    api.active = function(name){
      if(!api.enabled()) return [];
      return Array.from(document.querySelectorAll('#advList .entry')).map(function(div){
        const n = div.querySelector('.en-name'), entry = n && api.entryFor(n.value);
        if(!entry || (name && entry.name !== name)) return null;
        const config = readAdvConfig(div);
        return api.resolve(n.value, config) ? {div:div, entry:entry, config:config} : null;
      }).filter(Boolean);
    };

    // ---------- Granted Ranks ----------
    api.grant = function(skill){
      let tr = api.skillRow(skill), created = false;
      if(tr){
        tr.querySelector('.sk-rank').value = String(api.rankOf(tr) + 1);
      } else {
        const lib = typeof findSkill === 'function' ? findSkill(skill.trim()) : null;
        tr = makeSkillRow({name:skill.trim(), trait:lib ? lib.trait : '', rank:1, emph:''});
        document.getElementById('skillsBody').appendChild(tr);
        created = true;
      }
      return {skill:skill.trim(), created:created};
    };
    // A row the grant made goes again while it holds nothing else; otherwise it loses one Rank.
    api.takeBack = function(receipt){
      const tr = receipt && api.skillRow(receipt.skill);
      const rank = api.rankOf(tr);
      if(!tr || rank <= 0) return false;
      const bare = receipt.created && rank === 1 && !tr.querySelector('.sk-school').checked &&
        (typeof getEmphValues !== 'function' || getEmphValues(tr).length === 0);
      if(bare) tr.remove();
      else tr.querySelector('.sk-rank').value = String(rank - 1);
      return true;
    };
    api.grantedCount = function(tr){
      const name = tr && tr.querySelector('.sk-name');
      if(!name) return 0;
      const key = api.skillKey(name.value);
      return api.active().filter(function(a){ return a.entry.grant && api.skillKey(a.config.grant.skill) === key; }).length;
    };
    // THE CONTRACT (as Feature 4.5.32 reads it): recalcAll's Skills loop calls getPaidEmphCount(tr), then
    // skillCost(rank, emphCount, freeFloor) for the same row. The noted row is used once, for its own Rank.
    let pricingRow = null;
    api.notePricingRow = function(tr){ pricingRow = tr || null; };
    api.extraFloor = function(rank){
      const tr = pricingRow;
      pricingRow = null;
      try { return tr && api.rankOf(tr) === rank ? api.grantedCount(tr) : 0; } catch(e){ return 0; }
    };
    // An entry renamed away from a granting entry gives its Rank back.
    api.renamed = function(div){
      const config = readAdvConfig(div);
      if(!config || config.type !== api.TYPE || !config.grant) return;
      const n = div.querySelector('.en-name'), entry = n && api.entryFor(n.value);
      if(entry && entry.grant) return;
      api.takeBack(config.grant);
      delete div.dataset.advConfig;
    };
    api.removed = function(div){
      const config = readAdvConfig(div);
      if(config && config.type === api.TYPE && config.grant) api.takeBack(config.grant);
    };

    // ---------- Rolls ----------
    api.rollKind = function(ctx, kinds){
      return !!ctx && typeof ROLL_KINDS === 'object' && !!ROLL_KINDS && kinds.some(function(k){ return ctx.kind === ROLL_KINDS[k]; });
    };
    api.modifiers = function(ctx){
      if(!api.enabled() || !api.rollKind(ctx, ['SKILL', 'ATTACK'])) return [];
      const key = api.skillKey(ctx.skillName);
      const hit = api.active('Reincarnated').find(function(a){ return a.config.skills.some(function(s){ return api.skillKey(s) === key; }); });
      if(!key || !hit) return [];
      const out = [{source:'adv-config', label:'Reincarnated', rolledDelta:1, keptDelta:0, note:'a Skill from a past life. Book of Void p.191.'}];
      const pending = typeof getVoidPending === 'function' ? getVoidPending() : null;
      if(pending && (pending.k1 || pending.skill)){
        out.push({source:'adv-config', label:'Reincarnated', informational:true, display:'Anachronism for 1–10 hours',
          note:'a Void Point spent on this Skill brings on Anachronism: TN +5 on Artisan, Craft and Social Skill Rolls. Book of Void p.191.'});
      }
      return out;
    };
    api.watanu = function(ctx){
      if(!api.enabled() || !api.rollKind(ctx, ['SKILL'])) return null;
      const key = api.skillKey(ctx.skillName);
      return key && api.active('Watanu-Trained').some(function(a){ return api.skillKey(a.config.skills[0]) === key; }) ? 'watanu-trained' : null;
    };
    api.provider = {
      label:'Advantages',
      offers:function(ctx){
        return api.watanu(ctx) ? [{key:'watanu-trained', label:'Watanu-Trained: making a metal item, not a weapon or armour — +1k1',
          note:'Book of Void p.195.'}] : [];
      },
      modifiers:function(ctx, keys){
        return (keys || []).indexOf('watanu-trained') !== -1 && api.watanu(ctx)
          ? [{label:'Watanu-Trained', rolledDelta:1, keptDelta:1, note:'Declared: making a metal item'}] : [];
      },
    };

    // ---------- UI: the picker (Phase 4.5's dialog) ----------
    api.NOTES = {
      'Reincarnated':'Three Skills that are not School Skills; your GM approves them. +1k0 on their rolls. A Void Point spent on one of those rolls brings on Anachronism for 1–10 hours. Book of Void p.191.',
      'Watanu-Trained':'One Craft for making metal goods, not weapons or armour. +1k1 when you declare it on that Craft’s roll. Book of Void p.195.',
      'Water Hammer Citizen':'One Craft. It gains one Rank at no XP cost, not above Rank 4; the Rank goes again if you remove this Advantage. Strongholds of the Empire p.107.',
      'Zakyo Toshi Citizen':'One Games Skill. It gains one Rank at no XP cost; the Rank goes again if you remove this Advantage. Strongholds of the Empire p.152.',
    };
    api.suggestions = function(entry){
      const school = api.schoolSkills();
      const names = (typeof SKILL_LIBRARY === 'undefined' || entry.base ? [] : SKILL_LIBRARY.map(function(s){ return s.name; }))
        .concat(Array.from(document.querySelectorAll('#skillsBody .sk-name')).map(function(e){ return e.value.trim(); }));
      return Array.from(new Set(names)).filter(function(n){
        return n && (entry.base ? api.base(n) === norm(entry.base) && /:\s*\S/.test(n) : !school.has(api.skillKey(n)));
      }).sort();
    };
    api.open = function(div, schema){
      if(!api.enabled() || !api.owns(schema)) return false;
      const entry = api.entryFor(schema.name);
      if(div.parentElement && div.parentElement.id === 'disadvList'){ setStatus(entry.name + ' belongs in Advantages.'); return true; }
      const config = readAdvConfig(div);
      const current = api.complete(schema, config) ? config.skills : [];
      advConfigTargetEntry = div;
      advConfigExtendedModal = {kind:'supp4539', schema:schema, entryName:norm(schema.name)};
      document.getElementById('advConfigTitle').textContent = entry.name;
      document.getElementById('advConfigSubtitle').textContent = entry.count === 1 ? 'Choose the Skill' : 'Choose ' + entry.count + ' Skills';
      const note = document.getElementById('advConfigNote');
      note.textContent = api.NOTES[entry.name];
      note.style.display = '';
      const grid = document.getElementById('advConfigGrid');
      const options = api.suggestions(entry).map(function(n){ return '<option value="' + escAttr(n) + '"></option>'; }).join('');
      let html = '<datalist id="supp4539Options">' + options + '</datalist>';
      for(let i = 0; i < entry.count; i++){
        html += '<label class="named4513-label" for="supp4539Skill' + i + '">' + (entry.count === 1 ? 'Skill' : 'Skill ' + (i + 1)) + '</label>' +
          '<input class="named4513-input supp4539-skill" id="supp4539Skill' + i + '" type="text" list="supp4539Options" maxlength="80" value="' +
          escAttr(current[i] || '') + '" placeholder="' + (entry.base ? escAttr(entry.base + ': name') : 'Skill name') + '">';
      }
      grid.innerHTML = html + '<p class="named4513-error supp4539-error" role="alert" hidden></p>';
      document.getElementById('advConfigConfirm').textContent = 'Confirm';
      document.getElementById('advConfigModalOverlay').style.display = 'flex';
      grid.querySelector('input').focus({preventScroll:true});
      return true;
    };
    api.fail = function(message){
      const error = document.querySelector('#advConfigGrid .supp4539-error');
      if(error){ error.textContent = message; error.hidden = false; }
      setStatus(message);
      return true;
    };
    api.confirm = function(){
      const state = advConfigExtendedModal;
      if(!api.enabled() || !state || state.kind !== 'supp4539') return false;
      const div = advConfigTargetEntry, name = div && div.querySelector('.en-name');
      if(!div || !div.isConnected || !name || norm(name.value) !== state.entryName){
        closeAdvConfigModal(); setStatus('The entry changed; open its configuration again.'); return true;
      }
      const entry = api.entryFor(state.schema.name);
      const skills = Array.from(document.querySelectorAll('#advConfigGrid .supp4539-skill')).map(function(i){ return i.value.trim(); });
      const problem = api.problem(entry, skills, entry.name === 'Reincarnated' ? api.schoolSkills() : null);
      if(problem) return api.fail(problem);
      const prior = readAdvConfig(div);
      const priorGrant = prior && prior.type === api.TYPE && prior.grant ? prior.grant : null;
      const config = {type:api.TYPE, revision:1, skills:skills, value:skills.join(', ')};
      if(entry.grant){
        const same = priorGrant && api.skillKey(priorGrant.skill) === api.skillKey(skills[0]) && !!api.skillRow(skills[0]);
        if(same) config.grant = priorGrant;
        else {
          if(entry.max && api.rankOf(api.skillRow(skills[0])) >= entry.max){
            return api.fail(skills[0] + ' is at Rank ' + entry.max + ' already, the starting maximum; choose another ' + entry.base + '.');
          }
          if(priorGrant) api.takeBack(priorGrant);
          config.grant = api.grant(skills[0]);
        }
      } else if(priorGrant) api.takeBack(priorGrant);
      return commitExtendedAdvConfig(config, entry.name + ' configured.');
    };
    // UI hook: Phase 4.5's row, after its summary is drawn.
    api.decorate = function(div, row, schema){
      if(!api.owns(schema)) return;
      if(!div.dataset.supp4539RemoveWired){
        div.dataset.supp4539RemoveWired = '1';
        const remove = div.querySelector('.rm-btn');
        // Runs after makeEntry's own remove listener.
        if(remove) remove.addEventListener('click', function(){ api.removed(div); recalcAll(); });
      }
      const config = readAdvConfig(div), entry = api.entryFor(schema.name);
      if(entry.name !== 'Reincarnated' || !api.complete(schema, config)) return;
      const problem = api.problem(entry, config.skills, api.schoolSkills());
      if(problem){
        const warn = document.createElement('span');
        warn.className = 'adv-config-warn supp4539-warning';
        warn.textContent = problem;
        row.appendChild(warn);
      }
    };
    return api;
  })();

  if(SUPP4539.enabled()){
    Object.keys(SUPP4539.ENTRIES).forEach(function(name){
      registerAdvConfigSchema(name, {type:SUPP4539.TYPE, effect:'supp4539', supp4539:true, title:name, prompt:SUPP4539.NOTES[name]});
    });
    const supp4539PreviousComplete = isExtendedAdvConfigComplete;
    isExtendedAdvConfigComplete = function(schema, config){
      return SUPP4539.owns(schema) ? SUPP4539.complete(schema, config) : supp4539PreviousComplete(schema, config);
    };
    const supp4539PreviousResolve = resolveAdvDisadvEffect;
    resolveAdvDisadvEffect = function(name, config){
      return SUPP4539.owns(advConfigSchemaFor(name)) ? SUPP4539.resolve(name, config) : supp4539PreviousResolve(name, config);
    };
    const supp4539PreviousSummary = advConfigSummaryForEffect;
    advConfigSummaryForEffect = function(effect){
      return effect && effect.effect === 'supp4539' ? escHtml(effect.label) : supp4539PreviousSummary.apply(this, arguments);
    };
    const supp4539PreviousDecorate = decorateExtendedAdvConfigRow;
    decorateExtendedAdvConfigRow = function(div, row, schema){
      SUPP4539.decorate(div, row, schema);
      return supp4539PreviousDecorate.apply(this, arguments);
    };
    const supp4539PreviousRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){
      SUPP4539.renamed(div);
      return supp4539PreviousRefresh.apply(this, arguments);
    };
    const supp4539PreviousOpen = openExtendedAdvConfigModal;
    openExtendedAdvConfigModal = function(div, schema){ return SUPP4539.open(div, schema) || supp4539PreviousOpen(div, schema); };
    const supp4539PreviousConfirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){ return SUPP4539.confirm() || supp4539PreviousConfirm(); };
    const supp4539PreviousModifiers = advConfigExtendedRollModifiers;
    advConfigExtendedRollModifiers = function(context){
      return (supp4539PreviousModifiers(context) || []).concat(SUPP4539.modifiers(context));
    };
    if(typeof RD4515 === 'object' && RD4515) RD4515.register(SUPP4539.PROVIDER, SUPP4539.provider);
    const supp4539PreviousEmph = getPaidEmphCount;
    getPaidEmphCount = function(tr){
      SUPP4539.notePricingRow(tr);
      return supp4539PreviousEmph.apply(this, arguments);
    };
    const supp4539PreviousSkillCost = skillCost;
    skillCost = function(rank, emphCount, freeFloor){
      const extra = SUPP4539.extraFloor(rank);
      return supp4539PreviousSkillCost.call(this, rank, emphCount, extra ? (Number(freeFloor) || 0) + extra : freeFloor);
    };
  }
