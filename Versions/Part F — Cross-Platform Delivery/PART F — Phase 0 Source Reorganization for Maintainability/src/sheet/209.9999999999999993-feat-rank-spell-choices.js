// PART K PHASE 11.2.6 — Spell choices earned on advancement (Core pp.105, 246, 267).
  const RANK_SPELL_CHOICES_ENABLED = true;
  const RS8Rules = {
    rank(value){
      const n = Number(value);
      return Number.isSafeInteger(n) && n > 0 ? n : 0;
    },
    allowance(path, ancestor){ return path === 'first' ? 1 : path === 'later' ? 0 : 3 + Number(ancestor === true); },
    eligible(spell, profile, effectiveRank, ward){
      if(!spell || effectiveRank < 1) return false;
      if(spell.maho) return profile.school === 'Chuda Shugenja';
      if(spell.element === 'Void' && !profile.voidMagic) return false;
      let rank = effectiveRank;
      if(spell.element === profile.affinity) rank++;
      if(spell.element === profile.deficiency || (profile.unknownDeficiency && spell.element !== 'Universal')) rank--;
      if(profile.school === 'Yogo Wardmaster [Shugenja]'){
        if(ward && spell.element !== 'Void') rank++;
        if((spell.keywords || []).some(k=>k==='Travel' || k==='Craft')) rank--;
      }
      return spell.mastery <= rank;
    }
  };

  const RS8 = (function(){
    const api = { enabled:() => RANK_SPELL_CHOICES_ENABLED && SC8.enabled() };
    const rank = RS8Rules.rank;
    const records = new Map();
    let loading = 0, adding = false;
    const schools = () => getSchoolsList().filter(s => CW1123.forSchool(s.name));
    const level = entry => rank(entry.frozen ? entry.frozenRank : document.getElementById('f_rank').value);
    const held = school => schools().find(s => s.name === school);
    const key = SC8Logic.key;
    const catalog = new Map(SPELL_LIBRARY.map(s => [key(s.name), s]));
    function profile(school){
      const lib = findAnySchoolLibraryEntry(school);
      const active = document.getElementById('f_school').value === school;
      return {school, affinity:lib.affinityChoice ? (active ? document.getElementById('f_schoolAffinity').value : '') : lib.affinity || '',
        deficiency:lib.elementDeficiencyChoice && active ? CW1124.deficiency() : lib.deficiency || '',
        unknownDeficiency:!!lib.elementDeficiencyChoice && (!active || !CW1124.deficiency()), voidMagic:hasAdvantageNamed('Ishiken-do')};
    }
    function pathAt(school, number){
      const taken = AP46.taken();
      const i = taken.findIndex(t => t.school === school && t.rank === number);
      return i < 0 ? '' : i === 0 ? 'first' : 'later';
    }
    function limit(grant){ return RS8Rules.allowance(pathAt(grant.school, grant.rank), grant.ancestor); }
    function available(grant){
      const entry = held(grant.school);
      return !!entry && level(entry) >= grant.rank;
    }
    api.left = grant => available(grant) ? Math.max(0, limit(grant) - grant.already - grant.spells.length) : 0;
    function excess(grant){
      const allowance = available(grant) ? Math.max(0,limit(grant)-grant.already) : 0;
      if(grant.spells.length <= allowance) return [];
      const stillHeld = grant.spells.filter(n=>SC8.spellRow(n) || SC8.scrollRow(n));
      return stillHeld.length > allowance ? stillHeld : [];
    }
    api.grants = function(school){ return records.get(school)?.grants || []; };
    api.schools = schools;
    api.profile = profile;
    function eligibleAt(grant, spell, effective){
      if(!spell || CW1123.forSchool(grant.school).given.includes(spell.name)) return false;
      return RS8Rules.eligible(spell, grant.profile, effective, CW1124.isWard(spell));
    }
    api.eligible = function(grant, spell){
      return eligibleAt(grant, spell, grant.rank - AP46.laterPathRanks(grant.school, grant.rank));
    };
    function createGrant(school, number, prior = 0){
      return {school, rank:number, profile:profile(school), ancestor:ANC48.is('Isawa'), already:prior, spells:[]};
    }
    function newRecord(base){ return {base, high:base, grants:[]}; }
    function track(importing){
      const next = [];
      for(const entry of schools()){
        const school = entry.name, current = level(entry);
        if(!records.has(school)) records.set(school,newRecord(importing || entry.frozen ? Math.max(1,current) : 1));
        const record = records.get(school);
        if(entry.frozen) continue;
        for(let n=record.high+1;n<=current;n++){
          const grant = createGrant(school,n);
          record.grants.push(grant);
          if(api.left(grant)) next.push(grant);
        }
        record.high = Math.max(record.high,current);
      }
      return next;
    }
    function save(data){
      if(records.size) data.rankSpellChoices = {version:1, schools:Array.from(records, ([school, record]) => ({
        school, base:record.base, high:record.high, grants:record.grants.map(g => ({
          rank:g.rank, profile:{...g.profile}, ancestor:g.ancestor, already:g.already, spells:[...g.spells]
        }))
      }))};
      return data;
    }
    function restore(data){
      records.clear();
      const saved = data.rankSpellChoices;
      if(saved?.version === 1 && Array.isArray(saved.schools)){
        for(const item of saved.schools){
          if(!item || !CW1123.forSchool(item.school) || records.has(item.school) || !Array.isArray(item.grants)) continue;
          const record = newRecord(Math.max(1,rank(item.base)));
          record.high = Math.max(record.base,rank(item.high));
          for(const raw of item.grants){
            const n = rank(raw?.rank);
            if(n < 2 || n > record.high || record.grants.some(g=>g.rank===n) || !Array.isArray(raw.spells)) continue;
            const g = createGrant(item.school,n);
            for(const field of ['affinity','deficiency']) g.profile[field] = ['Air','Earth','Fire','Water','Void'].includes(raw.profile?.[field]) ? raw.profile[field] : '';
            g.profile.voidMagic = raw.profile?.voidMagic === true;
            g.profile.unknownDeficiency = raw.profile?.unknownDeficiency === true;
            g.ancestor = raw.ancestor === true;
            g.already = Math.min(4,rank(raw.already));
            g.spells = [...new Set(raw.spells.filter(s=>typeof s==='string' && catalog.has(key(SC8.spellName(s)))).map(s=>SC8.spellName(s)))];
            record.grants.push(g);
          }
          records.set(item.school,record);
        }
      }
      track(true);
    }
    api.earlier = function(school){
      const record = records.get(school), entry = held(school);
      if(!record || !entry) return [];
      const choices = [];
      for(let n=2;n<=Math.min(record.base,level(entry));n++){
        if(!record.grants.some(g=>g.rank===n)){
          const g = createGrant(school,n);
          if(limit(g)>0) choices.push({rank:n,maximum:limit(g)});
        }
      }
      return choices;
    };
    api.claim = function(school, number, missing){
      const choice = api.earlier(school).find(entry=>entry.rank===number);
      if(MODES12.isPlay() || CW112.isOpen() || !choice || !Number.isInteger(missing) || missing<0 || missing>choice.maximum) return false;
      records.get(school).grants.push(createGrant(school,number,choice.maximum-missing));
      SC8.changed();
      return true;
    };
    api.earnedSpell = function(name){
      return Array.from(records.values()).some(record=>record.grants.some(g=>g.spells.some(n=>key(n)===key(name))));
    };
    function ownsSpell(s){
      return SC8.spellRow(s.name) || SC8.scrollRow(s.name) || api.earnedSpell(s.name);
    }
    api.options = function(grant){
      if(!api.left(grant)) return [];
      const owned = new Set(SC8.spellRows().map(r=>key(SC8.spellName(SC8.rowName(r,'spell')))));
      for(const r of document.getElementById('equipBody').rows) owned.add(key(SC8.spellName(SC8.rowName(r,'scroll'))));
      for(const record of records.values()) for(const g of record.grants) for(const n of g.spells) owned.add(key(n));
      const effective = grant.rank - AP46.laterPathRanks(grant.school,grant.rank);
      return SPELL_LIBRARY.map((s,i)=>({s,i})).filter(x=>!owned.has(key(x.s.name)) && eligibleAt(grant,x.s,effective));
    };
    api.grant = function(grant, index){
      const s = SPELL_LIBRARY[index];
      if(adding || MODES12.isPlay() || CW112.isOpen() || !grant || !api.grants(grant.school).includes(grant) ||
        !api.left(grant) || !api.eligible(grant,s) || ownsSpell(s)) return false;
      // Build both ordinary rows before attaching either. An earned pick is kept separately
      // from starting grants, even when the same character still owes creation choices.
      const scroll = makeEquipRow({name:'Spell Scroll — '+s.name, qty:1, notes:'A scroll with the prayer for '+s.name+'.'});
      const spell = makeEntry({name:s.name, cost:0, desc:'[Spell — '+s.element+' '+s.mastery+(s.maho?', Maho':'')+'] '+s.desc,
        spellElement:s.element.toLowerCase(), spellMastery:s.mastery, spellKeywords:s.keywords || [], spellIsMaho:s.maho===true}, true,'XP');
      adding = true;
      try{
        document.getElementById('equipBody').appendChild(scroll);
        document.getElementById('techList').appendChild(spell);
        grant.spells.push(s.name);
      } catch(e){ scroll.remove(); spell.remove(); throw e; }
      finally { adding = false; }
      SC8.changed();
      return true;
    };
    api.findings = function(){
      const result = [];
      for(const {name} of schools()){
        for(const g of api.grants(name)){
          const left = api.left(g), heldSpells = excess(g), conflict = heldSpells.length>0;
          if(!left && !conflict) continue;
          const title = name+' · Rank '+g.rank+(conflict ? ' spell allowance changed' : ' · '+left+' spell'+(left===1?'':'s')+' still to choose');
          const detail = conflict ? 'Review '+heldSpells.join(', ')+'. The current School Rank or Path no longer covers all of these spells. Check the rank and Path, then correct any extra spell and scroll in Manage.' :
            'These choices were earned at School Rank '+g.rank+'. Choose now or leave them for later.';
          const f = validationFinding('rank-spell-choices','info',title,detail);
          if(left){ f.sc8School = name; f.sc8Kind = 'rank-'+g.rank; }
          result.push(f);
        }
      }
      return result;
    };
    api.install = function(){
      // The original input listeners hold their own reference to recalcAll. Every
      // route refreshes the Schools list after writing the new capped School Rank.
      const previousRefresh = refreshMultipleSchoolsUI;
      refreshMultipleSchoolsUI = function(){
        const result = previousRefresh.apply(this,arguments);
        if(!loading && !adding && !CW112.isOpen()){
          const newGrants = track(false);
          if(newGrants.length) api.offer(newGrants);
        }
        return result;
      };
      const previousApply = applyData;
      applyData = function(data){
        loading++;
        try{
          const result = previousApply.apply(this,arguments);
          if(result !== false && data){ api.dismiss(); restore(data); renderValidationReport(); }
          return result;
        } finally { loading--; }
      };
      const previousClear = clearAllRows;
      clearAllRows = function(){ records.clear(); api.dismiss(); return previousClear.apply(this,arguments); };
      const previousCollect = collectData;
      collectData = function(){ return save(previousCollect.apply(this,arguments)); };
      CHARACTER_VALIDATOR_RULES.push({id:'rank-spell-choices',fn:api.findings});
    };
    return api;
  })();
