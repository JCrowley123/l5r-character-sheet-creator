  // ========= PART I PHASE 4.5.40: SUPPLEMENT IDENTITY AND OUTFIT =========
  // Money and Outfit for three of Phase 4.5.37's entries (owner's ruling 2, 22 October 2026: nothing changes until
  // the player taps, and each change is recorded so it can be undone):
  //   Stolen Identity       Strongholds p.92   a family and School of another Great Clan and an alias. Confirm adds
  //                                            that School's Outfit without its koku; the Acting roll reports two
  //                                            Free Raises (the sheet has no Raise mechanic, as for Imperial Scribe).
  //                                            Its Spider price stays with Feature 4.5.25.
  //   Ruined City Survivor  Strongholds p.92   two Outfit items of the player's choice and the Outfit's koku are
  //                                            marked Missing (quantity 0), never deleted. A D45 entry.
  //   Zakyo Toshi Citizen   Strongholds p.152  "Add" puts half the School's starting koku again on Koku. Shown on
  //                                            Phase 4.5.39's row, so quiet without it.
  // The Great Clans are the sheet's own: SCHOOL_LIBRARY's Clans less the Imperial families, and the Mantis.
  // Kill switch SUPPLEMENT_IDENTITY_OUTFIT_ENABLED.
  const SUPPLEMENT_IDENTITY_OUTFIT_ENABLED = true;

  const SUPP4540 = (function(){
    const api = {};
    api.TYPE = 'supp4540Identity';
    api.IDENTITY = 'Stolen Identity';
    api.SURVIVOR = 'Ruined City Survivor';
    api.ZAKYO = 'Zakyo Toshi Citizen';
    api.OUTFIT_NOTE = 'Stolen Identity outfit';
    api.MISSING_NOTE = 'Missing (Ruined City Survivor)';
    api.enabled = function(){
      return SUPPLEMENT_IDENTITY_OUTFIT_ENABLED && typeof ADV_CONFIG_ENABLED !== 'undefined' && ADV_CONFIG_ENABLED;
    };
    const norm = function(s){ return String(s == null ? '' : s).trim().replace(/\s+/g, ' ').toLowerCase(); };
    api.norm = norm;

    // ---------- Clans, Schools and Outfits ----------
    api.greatClans = function(){
      const out = Object.keys(typeof SCHOOL_LIBRARY === 'object' ? SCHOOL_LIBRARY : {}).filter(function(c){ return c !== 'Imperial'; });
      if(typeof MINOR_CLAN_SCHOOL_LIBRARY === 'object' && MINOR_CLAN_SCHOOL_LIBRARY.Mantis && out.indexOf('Mantis') === -1) out.push('Mantis');
      return out;
    };
    api.schoolsOf = function(clan){
      const lib = clan === 'Mantis' && !(SCHOOL_LIBRARY || {}).Mantis ? MINOR_CLAN_SCHOOL_LIBRARY : SCHOOL_LIBRARY;
      return ((lib || {})[clan] || []).map(function(s){ return s.name; });
    };
    api.familiesOf = function(clan){
      return ((typeof FAMILY_LIBRARY === 'object' ? FAMILY_LIBRARY : {})[clan] || []).map(function(f){ return f[0]; });
    };
    // The Great Clans other than the character's own (all of them while no Clan is set).
    api.otherClans = function(){
      const own = norm(typeof advConfigCharacterClan === 'function' ? advConfigCharacterClan() : '');
      return api.greatClans().filter(function(c){ return norm(c) !== own; });
    };
    api.clanOfSchool = function(school){
      return api.otherClans().find(function(c){ return api.schoolsOf(c).some(function(s){ return norm(s) === norm(school); }); }) || '';
    };
    api.canonical = function(list, value){ return list.find(function(x){ return norm(x) === norm(value); }) || ''; };
    // "Light or Heavy Armor, ..., 3 koku" -> the items, less the koku.
    api.outfitItems = function(school){
      const entry = typeof findAnySchoolLibraryEntry === 'function' ? findAnySchoolLibraryEntry(school) : null;
      return entry && entry.outfit ? entry.outfit.split(',').map(function(s){ return s.trim(); }).filter(function(s){
        return s && !/\bkoku\b/i.test(s);
      }) : [];
    };
    api.startingSchool = function(){
      const list = typeof getSchoolsList === 'function' ? getSchoolsList() : [];
      return list.length ? list[0].name : '';
    };
    api.startingKoku = function(){
      const entry = typeof findAnySchoolLibraryEntry === 'function' ? findAnySchoolLibraryEntry(api.startingSchool()) : null;
      const m = entry && entry.outfit ? /(\d+(?:\.\d+)?)\s*koku\b/i.exec(entry.outfit) : null;
      return m ? Number(m[1]) : null;
    };

    // ---------- Equipment ----------
    api.equipRows = function(){ return Array.from(document.querySelectorAll('#equipBody tr')); };
    api.cell = function(tr, cls){ return tr.querySelector('.' + cls); };
    api.addOutfit = function(school){
      const body = document.getElementById('equipBody');
      const items = api.outfitItems(school);
      if(!body || typeof makeEquipRow !== 'function') return [];
      items.forEach(function(item){ body.appendChild(makeEquipRow({name:item, qty:1, notes:api.OUTFIT_NOTE})); });
      return items;
    };
    // Removes, once each, the rows a receipt added and that still carry the outfit note.
    api.removeOutfit = function(receipt){
      if(!receipt || !Array.isArray(receipt.items)) return 0;
      let removed = 0;
      receipt.items.forEach(function(item){
        const tr = api.equipRows().find(function(r){
          return api.cell(r, 'eq-name').value === item && api.cell(r, 'eq-notes').value === api.OUTFIT_NOTE;
        });
        if(tr){ tr.remove(); removed++; }
      });
      return removed;
    };
    api.isKokuRow = function(tr){ return /^\s*\d+(?:\.\d+)?\s*koku\s*$/i.test(api.cell(tr, 'eq-name').value); };
    // Marks each named item, then the Outfit's koku, Missing: [{name, notes, qty}] as they were.
    api.markMissing = function(names){
      const marked = [];
      const take = function(tr){
        marked.push({name:api.cell(tr, 'eq-name').value, notes:api.cell(tr, 'eq-notes').value, qty:String(api.cell(tr, 'eq-qty').value)});
        api.cell(tr, 'eq-notes').value = api.MISSING_NOTE;
        api.cell(tr, 'eq-qty').value = '0';
      };
      const free = function(tr){ return api.cell(tr, 'eq-notes').value !== api.MISSING_NOTE; };
      names.forEach(function(name){
        const rows = api.equipRows().filter(function(r){ return free(r) && norm(api.cell(r, 'eq-name').value) === norm(name); });
        const tr = rows.find(function(r){ return !!r.dataset.schoolGranted; }) || rows[0];
        if(tr) take(tr);
      });
      api.equipRows().filter(function(r){ return free(r) && !!r.dataset.schoolGranted && api.isKokuRow(r); }).forEach(take);
      return marked;
    };
    api.restoreMissing = function(marked){
      (Array.isArray(marked) ? marked : []).forEach(function(m){
        const tr = api.equipRows().find(function(r){
          return api.cell(r, 'eq-name').value === m.name && api.cell(r, 'eq-notes').value === api.MISSING_NOTE;
        });
        if(tr){ api.cell(tr, 'eq-notes').value = m.notes; api.cell(tr, 'eq-qty').value = m.qty; }
      });
    };

    // ---------- Stolen Identity: configuration ----------
    // {type, revision:1, school, family, alias, value, outfit:{school, items}}
    api.identityProblem = function(c){
      if(!c.school || !c.family || !c.alias) return 'Enter the School, the family and the alias.';
      const clan = api.clanOfSchool(c.school);
      if(!clan) return 'Choose a School of another Great Clan.';
      const families = api.familiesOf(clan);
      if(families.length && !api.canonical(families, c.family)) return 'Choose a family of the ' + clan + ' Clan, as the School is.';
      if(c.alias.length > 80 || c.school.length > 80 || c.family.length > 80) return 'Keep each name under 80 characters.';
      return '';
    };
    api.identityComplete = function(config){
      if(!api.enabled() || !config || Array.isArray(config) || config.type !== api.TYPE || config.revision !== 1) return false;
      if(Object.keys(config).some(function(k){ return ['type', 'revision', 'school', 'family', 'alias', 'value', 'outfit'].indexOf(k) === -1; })) return false;
      if(['school', 'family', 'alias'].some(function(k){ return typeof config[k] !== 'string' || !config[k].trim(); })) return false;
      const o = config.outfit;
      return !!o && typeof o === 'object' && typeof o.school === 'string' && norm(o.school) === norm(config.school) &&
        Array.isArray(o.items) && o.items.every(function(i){ return typeof i === 'string'; });
    };
    api.owns = function(schema){ return !!schema && schema.supp4540 === true && norm(schema.name) === norm(api.IDENTITY); };
    api.resolve = function(name, config){
      if(!api.identityComplete(config)) return null;
      return {effect:'supp4540', entryName:api.IDENTITY, school:config.school, family:config.family, alias:config.alias,
        label:'Alias ' + config.alias + ' — ' + config.family + ' family, ' + config.school};
    };
    api.identities = function(){
      if(!api.enabled()) return [];
      return Array.from(document.querySelectorAll('#advList .entry')).map(function(div){
        const n = div.querySelector('.en-name');
        return n && norm(n.value) === norm(api.IDENTITY) && api.identityComplete(readAdvConfig(div)) ? readAdvConfig(div) : null;
      }).filter(Boolean);
    };
    // Two Free Raises on a skilled Acting roll, reported, never added (Core p.80: not on an Unskilled Roll).
    api.modifiers = function(ctx){
      if(!api.enabled() || !ctx || typeof ROLL_KINDS !== 'object' || ctx.kind !== ROLL_KINDS.SKILL) return [];
      const skill = norm(String(ctx.skillName || '').replace(/\(.*$/, ''));
      if(skill !== 'acting' || ctx.unskilled === true || !(Number(ctx.skillRank) > 0)) return [];
      return api.identities().slice(0, 1).map(function(c){
        return {source:'adv-config', label:api.IDENTITY, informational:true, display:'2 Free Raises as ' + c.alias,
          note:'when you use Acting to pass as ' + c.alias + '; apply them yourself — this sheet has no Raise mechanic to spend them through. Strongholds of the Empire p.92.'};
      });
    };

    // ---------- Zakyo Toshi Citizen: koku receipt ----------
    // Kept on the entry as data-supp4540-koku ({revision:1, granted}) and saved beside its config.
    api.kokuReceipt = function(div){
      if(!div || !div.dataset.supp4540Koku) return null;
      try {
        const r = JSON.parse(div.dataset.supp4540Koku);
        return r && r.revision === 1 && Number.isFinite(r.granted) && r.granted >= 0 ? r : null;
      } catch(e){ return null; }
    };
    api.koku = function(){
      const field = document.getElementById('f_koku');
      const n = field && String(field.value).trim() !== '' ? Number(field.value) : 0;
      return Number.isFinite(n) ? n : 0;
    };
    api.setKoku = function(amount){
      const field = document.getElementById('f_koku');
      if(!field) return false;
      field.value = String(Math.round(amount * 100) / 100);
      field.dispatchEvent(new Event('input', {bubbles:true}));
      return true;
    };
    api.zakyoAmount = function(){ const k = api.startingKoku(); return k === null ? null : k / 2; };
    api.zakyoAct = function(div, action){
      const amount = api.zakyoAmount();
      if(amount === null || api.kokuReceipt(div)) return false;
      if(action === 'add') api.setKoku(api.koku() + amount);
      div.dataset.supp4540Koku = JSON.stringify({revision:1, granted:amount});
      recalcAll();
      setStatus(action === 'add' ? amount + ' koku added to your Koku for Zakyo Toshi Citizen.' : 'Zakyo Toshi Citizen’s koku recorded as already on your Koku.');
      return true;
    };
    api.zakyoRemoved = function(div){
      const r = api.kokuReceipt(div);
      if(!r || !r.granted) return;
      if(api.koku() >= r.granted){ api.setKoku(api.koku() - r.granted); setStatus(r.granted + ' koku taken back from your Koku with Zakyo Toshi Citizen.'); }
      else setStatus('Your Koku is below the ' + r.granted + ' koku Zakyo Toshi Citizen added; take it off yourself.');
    };
    // An entry renamed away from one of the three undoes what it changed, as removing it does.
    api.renamed = function(div){
      const n = div && div.querySelector('.en-name');
      if(!n) return;
      const name = norm(n.value), c = readAdvConfig(div);
      if(name !== norm(api.IDENTITY) && api.identityComplete(c)){ api.removeOutfit(c.outfit); delete div.dataset.advConfig; }
      if(name !== norm(api.SURVIVOR) && c && c.type === 'targetPick' && Array.isArray(c.marked)){ api.restoreMissing(c.marked); delete div.dataset.advConfig; }
      if(name !== norm(api.ZAKYO) && div.dataset.supp4540Koku){ api.zakyoRemoved(div); delete div.dataset.supp4540Koku; }
    };

    // ---------- Ruined City Survivor: a D45 entry ----------
    // Reuses D45's 'targetPick' type string, as Feature 4.5.8 reuses existing shapes: D45's type list is pinned.
    api.survivor = {
      type:'targetPick',
      steps:function(c){
        const items = api.outfitItems(api.startingSchool());
        if(items.length < 2){
          return [{field:'first', label:'Name the first missing item', text:true},
            {field:'second', label:'Name the second missing item', text:true}];
        }
        return [{field:'first', label:'Choose the first missing Outfit item', options:items.map(function(i){ return {value:i, label:i}; })},
          {field:'second', label:'Choose the second missing Outfit item',
            options:items.filter(function(i){ return i !== c.first; }).map(function(i){ return {value:i, label:i}; })}];
      },
      validate:function(c){
        return !!c && c.type === 'targetPick' && typeof c.first === 'string' && !!c.first.trim() &&
          typeof c.second === 'string' && !!c.second.trim() && norm(c.first) !== norm(c.second) &&
          (c.marked === undefined || Array.isArray(c.marked) && c.marked.every(function(m){
            return !!m && typeof m.name === 'string' && typeof m.notes === 'string' && typeof m.qty === 'string';
          }));
      },
      // The Confirm tap: the earlier marks go back, then the new ones are made and recorded.
      finalize:function(c){
        c.first = String(c.first || '').trim(); c.second = String(c.second || '').trim();
        c.value = c.first + ' and ' + c.second;
        const before = c.marked;
        delete c.marked;
        if(!api.survivor.validate(c)){ if(before) c.marked = before; return; }
        api.restoreMissing(before);
        c.marked = api.markMissing([c.first, c.second]);
      },
      resolve:function(c){
        return {cost:4, first:c.first, second:c.second,
          summary:'Missing: ' + c.first + ' and ' + c.second + ', and your Outfit’s koku (no starting koku).'};
      },
      decorate:function(div){
        if(div.dataset.supp4540RemoveWired) return;
        div.dataset.supp4540RemoveWired = '1';
        const remove = div.querySelector('.rm-btn');
        if(remove) remove.addEventListener('click', function(){
          const c = readAdvConfig(div);
          if(c && c.marked) api.restoreMissing(c.marked);
          recalcAll();
        });
      },
    };

    // ---------- UI: Stolen Identity's picker (Phase 4.5's dialog) ----------
    api.NOTE = 'A family and School of another Great Clan, and the alias you use. Confirm adds that School’s Outfit, without its koku, to Equipment; removing this Advantage takes it off again. Two Free Raises on Acting rolls to keep the identity up. Strongholds of the Empire p.92.';
    api.open = function(div, schema){
      if(!api.enabled() || !api.owns(schema)) return false;
      if(div.parentElement && div.parentElement.id === 'disadvList'){ setStatus(api.IDENTITY + ' belongs in Advantages.'); return true; }
      const config = readAdvConfig(div), current = api.identityComplete(config) ? config : {};
      advConfigTargetEntry = div;
      advConfigExtendedModal = {kind:'supp4540', schema:schema, entryName:norm(schema.name)};
      document.getElementById('advConfigTitle').textContent = api.IDENTITY;
      document.getElementById('advConfigSubtitle').textContent = 'Choose the identity you stole';
      const note = document.getElementById('advConfigNote');
      note.textContent = api.NOTE;
      note.style.display = '';
      const clans = api.otherClans();
      const list = function(id, values){
        return '<datalist id="' + id + '">' + values.map(function(v){ return '<option value="' + escAttr(v) + '"></option>'; }).join('') + '</datalist>';
      };
      const field = function(key, label, listId){
        return '<label class="named4513-label" for="supp4540' + key + '">' + label + '</label>' +
          '<input class="named4513-input" id="supp4540' + key + '" type="text" maxlength="80"' + (listId ? ' list="' + listId + '"' : '') +
          ' value="' + escAttr(current[key.toLowerCase()] || '') + '">';
      };
      const grid = document.getElementById('advConfigGrid');
      grid.innerHTML = list('supp4540Schools', [].concat.apply([], clans.map(api.schoolsOf)).sort()) +
        list('supp4540Families', [].concat.apply([], clans.map(api.familiesOf)).sort()) +
        field('School', 'School (another Great Clan’s)', 'supp4540Schools') + field('Family', 'Family', 'supp4540Families') +
        field('Alias', 'Alias') + '<p class="named4513-error supp4540-error" role="alert" hidden></p>';
      document.getElementById('advConfigConfirm').textContent = 'Confirm';
      document.getElementById('advConfigModalOverlay').style.display = 'flex';
      grid.querySelector('input').focus({preventScroll:true});
      return true;
    };
    api.confirm = function(){
      const state = advConfigExtendedModal;
      if(!api.enabled() || !state || state.kind !== 'supp4540') return false;
      const div = advConfigTargetEntry, name = div && div.querySelector('.en-name');
      if(!div || !div.isConnected || !name || norm(name.value) !== state.entryName){
        closeAdvConfigModal(); setStatus('The entry changed; open its configuration again.'); return true;
      }
      const read = function(key){ const i = document.getElementById('supp4540' + key); return i ? i.value.trim() : ''; };
      const c = {school:read('School'), family:read('Family'), alias:read('Alias')};
      const problem = api.identityProblem(c);
      if(problem){
        const error = document.querySelector('#advConfigGrid .supp4540-error');
        if(error){ error.textContent = problem; error.hidden = false; }
        setStatus(problem);
        return true;
      }
      const clan = api.clanOfSchool(c.school);
      const school = api.canonical(api.schoolsOf(clan), c.school);
      const family = api.canonical(api.familiesOf(clan), c.family) || c.family;
      const prior = readAdvConfig(div);
      const priorOutfit = api.identityComplete(prior) ? prior.outfit : null;
      let outfit = priorOutfit;
      if(!priorOutfit || norm(priorOutfit.school) !== norm(school)){
        api.removeOutfit(priorOutfit);
        outfit = {school:school, items:api.addOutfit(school)};
      }
      const config = {type:api.TYPE, revision:1, school:school, family:family, alias:c.alias, value:c.alias, outfit:outfit};
      return commitExtendedAdvConfig(config, api.IDENTITY + ' configured; ' + school + '’s Outfit added to Equipment.');
    };
    api.button = function(text, label, onClick){
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'ghost supp4540-btn'; b.textContent = text;
      b.setAttribute('aria-label', label);
      b.addEventListener('click', onClick);
      return b;
    };
    // UI hook: Phase 4.5's row, after its summary is drawn (Stolen Identity here; Zakyo's row is Phase 4.5.39's).
    api.decorate = function(div, row, schema){
      if(!api.enabled() || !schema || !div.parentElement || div.parentElement.id !== 'advList') return;
      const isIdentity = api.owns(schema), isZakyo = norm(schema.name) === norm(api.ZAKYO);
      if(!isIdentity && !isZakyo) return;
      if(!div.dataset.supp4540RemoveWired){
        div.dataset.supp4540RemoveWired = '1';
        const remove = div.querySelector('.rm-btn');
        // Runs after makeEntry's own remove listener.
        if(remove) remove.addEventListener('click', function(){
          if(isIdentity){ const c = readAdvConfig(div); if(api.identityComplete(c)) api.removeOutfit(c.outfit); }
          else api.zakyoRemoved(div);
          recalcAll();
        });
      }
      if(!isZakyo) return;
      const box = document.createElement('div');
      box.className = 'supp4540-koku';
      const text = document.createElement('span');
      box.appendChild(text);
      const r = api.kokuReceipt(div), amount = api.zakyoAmount();
      if(r){
        text.textContent = r.granted + ' koku from Zakyo Toshi Citizen recorded on your Koku.';
      } else if(amount === null){
        text.className = 'adv-config-warn';
        text.textContent = 'Apply your School: Zakyo Toshi Citizen adds half its starting koku again.';
      } else {
        text.className = 'adv-config-warn';
        text.textContent = 'Half your School’s starting koku again: ' + amount + ' koku.';
        box.appendChild(api.button('Add ' + amount + ' koku', 'Add ' + amount + ' koku to Koku now', function(){ api.zakyoAct(div, 'add'); }));
        box.appendChild(api.button('Already added', 'Record that the ' + amount + ' koku is already on your Koku', function(){ api.zakyoAct(div, 'already'); }));
      }
      row.appendChild(box);
    };
    return api;
  })();

  if(SUPP4540.enabled()){
    registerAdvConfigSchema(SUPP4540.IDENTITY, {type:SUPP4540.TYPE, effect:'supp4540', supp4540:true, title:SUPP4540.IDENTITY, prompt:SUPP4540.NOTE});
    const supp4540PreviousComplete = isExtendedAdvConfigComplete;
    isExtendedAdvConfigComplete = function(schema, config){
      return SUPP4540.owns(schema) ? SUPP4540.identityComplete(config) : supp4540PreviousComplete(schema, config);
    };
    const supp4540PreviousResolve = resolveAdvDisadvEffect;
    resolveAdvDisadvEffect = function(name, config){
      return SUPP4540.owns(advConfigSchemaFor(name)) ? SUPP4540.resolve(name, config) : supp4540PreviousResolve(name, config);
    };
    const supp4540PreviousSummary = advConfigSummaryForEffect;
    advConfigSummaryForEffect = function(effect){
      return effect && effect.effect === 'supp4540' ? escHtml(effect.label) : supp4540PreviousSummary.apply(this, arguments);
    };
    const supp4540PreviousDecorate = decorateExtendedAdvConfigRow;
    decorateExtendedAdvConfigRow = function(div, row, schema){
      SUPP4540.decorate(div, row, schema);
      return supp4540PreviousDecorate.apply(this, arguments);
    };
    const supp4540PreviousRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){
      SUPP4540.renamed(div);
      return supp4540PreviousRefresh.apply(this, arguments);
    };
    const supp4540PreviousOpen = openExtendedAdvConfigModal;
    openExtendedAdvConfigModal = function(div, schema){ return SUPP4540.open(div, schema) || supp4540PreviousOpen(div, schema); };
    const supp4540PreviousConfirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){ return SUPP4540.confirm() || supp4540PreviousConfirm(); };
    const supp4540PreviousModifiers = advConfigExtendedRollModifiers;
    advConfigExtendedRollModifiers = function(context){
      return (supp4540PreviousModifiers(context) || []).concat(SUPP4540.modifiers(context));
    };
    if(typeof D45 === 'object' && D45 && typeof D45.install === 'function') D45.install(SUPP4540.SURVIVOR, SUPP4540.survivor);
    // Zakyo's koku receipt is saved beside the entry's config, as Feature 4.5.25 saves its price record.
    const supp4540PreviousMakeEntry = makeEntry;
    makeEntry = function(data){
      const div = supp4540PreviousMakeEntry.apply(this, arguments);
      if(div && data && data.supp4540Koku && typeof data.supp4540Koku === 'object') div.dataset.supp4540Koku = JSON.stringify(data.supp4540Koku);
      return div;
    };
    const supp4540PreviousCollect = collectData;
    collectData = function(){
      const data = supp4540PreviousCollect.apply(this, arguments);
      const arr = data && data.adv;
      if(Array.isArray(arr)){
        document.querySelectorAll('#advList .entry').forEach(function(div, i){
          const r = SUPP4540.kokuReceipt(div);
          if(r && arr[i]) arr[i].supp4540Koku = r;
        });
      }
      return data;
    };
  }
