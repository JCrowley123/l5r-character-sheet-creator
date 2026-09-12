  // ========= PART I PHASE 4.5: EXTENDED ADVANTAGE CONFIGURATION =========
  //
  // This fragment is deliberately a companion to 209.8-feat-adv-config.js, not a second
  // feature system.  It registers the additional schema shapes requested for the Phase 4.5
  // completion pass, renders them through the SAME modal host, and returns effects through the
  // existing Phase 4.5 resolver and its one existing roll-registry contributor.
  //
  // Keeping these types here makes the original shipped 4.5 core independently auditable, while
  // still making the combined phase a single surgical unit: the remover owns this file and the
  // small guarded calls into the core file.

  const ADV_CONFIG_EXTENDED_ENABLED = true;

  const ADV_CONFIG_GENTRY_OPTIONS = [
    { label:'Village', cost:8 },
    { label:'Large Village', cost:15 },
    { label:'Unique Holding', cost:18 },
    { label:'Town', cost:20 },
    { label:'City', cost:25 },
    { label:'Province', cost:30 },
  ];

  // The numbers and labels below are the choices requested for this completion pass.  They live
  // with the Phase 4.5 feature rather than ADV_LIBRARY so deleting the phase restores the
  // library byte-for-byte.
  registerAdvConfigSchema('Allies', {
    type:'dualTierPick',
    effect:'entryCost',
    title:'Configure Allies',
    prompt:'Choose their Influence, then their Devotion.',
    note:'Total cost is Influence + Devotion. Crane characters pay 1 less (minimum 1).',
    influenceOptions:[1,2,4],
    devotionOptions:[1,2,4],
  });
  registerAdvConfigSchema('Gentry', {
    type:'severityTier',
    effect:'entryCost',
    title:'Choose a holding',
    prompt:'Gentry — choose the size of the holding.',
    options:ADV_CONFIG_GENTRY_OPTIONS,
  });
  registerAdvConfigSchema('Kharmic Tie', {
    type:'rankPick',
    effect:'kharmicTie',
    title:'Configure Kharmic Tie',
    prompt:'Name the person, then choose the Rank.',
    note:'Once per session per Rank, declare that you are fighting for or protecting this person before a weapon attack roll.',
    options:[
      { label:'Rank 1', value:'Rank 1', rank:1, cost:1 },
      { label:'Rank 2', value:'Rank 2', rank:2, cost:2 },
      { label:'Rank 3', value:'Rank 3', rank:3, cost:3 },
      { label:'Rank 4', value:'Rank 4', rank:4, cost:4 },
      { label:'Rank 5', value:'Rank 5', rank:5, cost:5 },
    ],
  });
  registerAdvConfigSchema('Languages', {
    type:'languagePick',
    effect:'entryCost',
    title:'Configure Languages',
    prompt:'Choose the language type, then name the language.',
    note:'Enter the specific language yourself; no invented language list is imposed.',
    options:[
      { label:'Human language', value:'Human', cost:1 },
      { label:'Non-human language', value:'Non-human', cost:3 },
    ],
  });
  registerAdvConfigSchema('Luck', {
    type:'rankPick',
    effect:'luck',
    title:'Choose a Rank',
    prompt:'Luck — choose how many whole-roll rerolls you have each session.',
    note:'A Luck use rerolls the entire roll and keeps the higher result.',
    options:[
      { label:'Rank 1', value:'Rank 1', rank:1, cost:3 },
      { label:'Rank 2', value:'Rank 2', rank:2, cost:6 },
      { label:'Rank 3', value:'Rank 3', rank:3, cost:9 },
    ],
  });
  registerAdvConfigSchema('Magic Resistance', {
    type:'rankPick',
    effect:'magicResistanceReminder',
    title:'Choose a Rank',
    prompt:'Magic Resistance — choose how many Ranks.',
    note:'This player companion records a reminder for incoming elemental spells. Tell the caster their TN is +3 per Rank; this does not alter your own casting rolls.',
    options:[
      { label:'Rank 1', value:'Rank 1', rank:1, cost:2 },
      { label:'Rank 2', value:'Rank 2', rank:2, cost:4 },
      { label:'Rank 3', value:'Rank 3', rank:3, cost:6 },
    ],
  });
  registerAdvConfigSchema('Sacred Weapon', {
    type:'clanWeaponAutoPick',
    effect:'sacredWeapon',
    title:'Sacred Weapon',
    prompt:'The weapon is determined from your character Clan.',
    note:'The sheet grants the matching base weapon and displays its conditional rules for the player to apply.',
  });
  registerAdvConfigSchema('Great Potential', {
    type:'skillPick',
    effect:'greatPotential',
    title:'Choose a Skill',
    prompt:'Great Potential — choose the Skill whose Raise cap changes.',
    note:'The preview will show both the chosen Skill Rank and Void Ring limit. Use the higher one.',
  });

  function advConfigRankOption(schema, config){
    if(!schema || !config) return null;
    return (schema.options || []).find(function(opt){
      return String(opt.value === undefined ? opt.label : opt.value) === String(config.value) &&
        parseInt(opt.rank,10) === parseInt(config.rank,10);
    }) || null;
  }

 function advConfigCharacterClan(){
   const input = document.getElementById('f_clan');
   return (input && input.value || '').trim();
 }

  // A local identity lets a Sacred Weapon row and a Kharmic Tie use be tied to the exact
  // Advantage entry that created it, even when a character has more than one entry with the
  // same displayed name. It is persisted inside that entry's Phase 4.5 config only.
  function newAdvConfigSourceId(prefix){
    return String(prefix || 'adv') + '-' + Date.now().toString(36) + '-' +
      Math.random().toString(36).slice(2,10);
  }

  function isExtendedAdvConfigComplete(schema, config){
    if(!ADV_CONFIG_EXTENDED_ENABLED || !schema || !config) return false;
    if(schema.type === 'dualTierPick'){
      const has = function(list, value){ return list.indexOf(parseInt(value,10)) !== -1; };
      return has(schema.influenceOptions || [], config.influence) &&
        has(schema.devotionOptions || [], config.devotion);
    }
    if(schema.type === 'languagePick'){
      return (config.languageType === 'Human' || config.languageType === 'Non-human') &&
        !!String(config.language || '').trim();
    }
   if(schema.type === 'skillPick') return !!String(config.skill || '').trim();
   if(schema.type === 'clanWeaponAutoPick'){
      if(!config.value || !config.clan || !config.sourceId) return false;
      return typeof advConfigSacredWeaponProfileById === 'function' &&
        !!advConfigSacredWeaponProfileById(config.value);
   }
    return false;
  }

  function resolveExtendedAdvConfigEffect(name, config, schema){
    if(!ADV_CONFIG_EXTENDED_ENABLED || !schema || !config) return null;
    if(schema.type === 'dualTierPick'){
      const influence = parseInt(config.influence,10);
      const devotion = parseInt(config.devotion,10);
      if((schema.influenceOptions || []).indexOf(influence) === -1 ||
         (schema.devotionOptions || []).indexOf(devotion) === -1) return null;
      const craneDiscount = normalizeAdvName(advConfigCharacterClan()) === 'crane' ? 1 : 0;
      const cost = Math.max(1, influence + devotion - craneDiscount);
      return {
        effect:'entryCost', entryName:schema.name, cost:cost,
        label:'Influence ' + influence + ' + Devotion ' + devotion,
        influence:influence, devotion:devotion, craneDiscount:craneDiscount,
      };
    }
    if(schema.type === 'rankPick'){
      const opt = advConfigRankOption(schema, config);
      if(!opt) return null;
      if(schema.effect === 'kharmicTie'){
        const target = String(config.target || '').trim();
        if(!target) return null;
        return {
          effect:'kharmicTie', entryName:schema.name, target:target,
          rank:opt.rank, remaining:Math.max(0, Math.min(opt.rank, parseInt(config.remaining,10) || 0)),
          cost:opt.cost, label:opt.label,
        };
      }
      if(schema.effect === 'luck'){
        return {
          effect:'luck', entryName:schema.name, rank:opt.rank,
          remaining:Math.max(0, Math.min(opt.rank, parseInt(config.remaining,10) || 0)),
          cost:opt.cost, label:opt.label,
        };
      }
      if(schema.effect === 'magicResistanceReminder'){
        return {
          effect:'magicResistanceReminder', entryName:schema.name, rank:opt.rank,
          cost:opt.cost, label:opt.label, tnIncrease:opt.rank * 3,
        };
      }
      return { effect:'entryCost', entryName:schema.name, cost:opt.cost, label:opt.label, rank:opt.rank };
    }
    if(schema.type === 'languagePick'){
      const kind = config.languageType;
      const language = String(config.language || '').trim();
      if(!language) return null;
      const opt = (schema.options || []).find(function(item){ return item.value === kind; });
      if(!opt) return null;
      return {
        effect:'entryCost', entryName:schema.name, cost:opt.cost,
        label:kind + ': ' + language, languageType:kind, language:language,
      };
    }
    if(schema.type === 'skillPick'){
      const skill = String(config.skill || '').trim();
      if(!skill) return null;
      return { effect:'greatPotential', entryName:schema.name, skill:skill };
    }
   if(schema.type === 'clanWeaponAutoPick'){
      const profile = typeof advConfigSacredWeaponProfileById === 'function'
        ? advConfigSacredWeaponProfileById(config.value) : null;
      if(!profile) return null;
     return {
       effect:'sacredWeapon', entryName:schema.name, clan:config.clan,
        weaponId:config.value, sourceId:config.sourceId, cost:profile.cost, label:profile.weaponName,
     };
   }
    return null;
  }

 function advConfigSummaryForEffect(effect, schema, config, div){
   if(!effect) return '';
    if(effect.effect === 'ringRollBonus'){
      return escHtml(effect.ringName) + ' — +1k1 on Ring Rolls';
    }
    if(effect.effect === 'universalSpellBonus'){
      return escHtml(effect.ringName) + ' — +1k1 on Sense, Commune, and Summon';
    }
    if(effect.effect === 'traitFreeRaise'){
      return escHtml(effect.ringName) + ' — Free Raise on its Trait Rolls';
    }
   if(effect.entryName === 'Allies'){
      const discount = effect.craneDiscount ? ' (Crane discount −1)' : '';
      return 'Influence ' + effect.influence + ' + Devotion ' + effect.devotion +
        ' — ' + effect.cost + ' points' + discount;
    }
    if(effect.effect === 'kharmicTie'){
      return 'Target: ' + escHtml(effect.target) + ' — ' + effect.label +
        '; ' + effect.remaining + '/' + effect.rank + ' uses remaining';
    }
    if(effect.effect === 'magicResistanceReminder'){
      return effect.label + ' — incoming elemental spell casting TN +' + effect.tnIncrease +
        ' (reminder only)';
    }
    if(effect.effect === 'greatPotential'){
      return 'Skill: ' + escHtml(effect.skill) + ' — Raise cap uses Skill Rank or Void, whichever is higher';
    }
    if(effect.effect === 'sacredWeapon' && typeof advConfigSacredWeaponSummary === 'function'){
      return advConfigSacredWeaponSummary(effect, schema, config, div);
    }
    return '';
  }

  // ----- Shared existing modal host ---------------------------------------------------------
  let advConfigExtendedModal = null;

  function advConfigExtendedShow(title, subtitle, note){
    const overlay = document.getElementById('advConfigModalOverlay');
    if(!overlay) return false;
    document.getElementById('advConfigTitle').textContent = title;
    document.getElementById('advConfigSubtitle').textContent = subtitle;
    const noteEl = document.getElementById('advConfigNote');
    noteEl.textContent = note || '';
    noteEl.style.display = note ? '' : 'none';
    overlay.style.display = 'flex';
    return true;
  }

  function advConfigExtendedChoiceGrid(options, currentValue){
    return options.map(function(opt, index){
      const value = String(opt.value);
      const checked = String(currentValue || '') === value;
      const cost = opt.cost === undefined ? '' :
        '<span class="adv-config-cost">' + opt.cost + ' pt' + (opt.cost === 1 ? '' : 's') + '</span>';
      return '<div class="affinity-pick-item' + (checked ? ' checked' : '') + '" data-value="' +
        escAttr(value) + '">' +
        '<label for="advConfigExtendedPick_' + index + '">' + escHtml(opt.label) + cost + '</label>' +
        '<input type="checkbox" id="advConfigExtendedPick_' + index + '"' +
        (checked ? ' checked' : '') + '></div>';
    }).join('');
  }

  function wireAdvConfigExtendedChoices(){
    const grid = document.getElementById('advConfigGrid');
    const items = Array.from(grid.querySelectorAll('.affinity-pick-item'));
    const boxes = items.map(function(item){ return item.querySelector('input[type="checkbox"]'); });
    boxes.forEach(function(box, index){
      box.addEventListener('change', function(){
        if(box.checked){
          boxes.forEach(function(other, otherIndex){
            if(otherIndex !== index){
              other.checked = false;
              items[otherIndex].classList.remove('checked');
            }
          });
          items[index].classList.add('checked');
        } else {
          items[index].classList.remove('checked');
        }
      });
    });
  }

  function advConfigExtendedSelectedValue(){
    const item = Array.from(document.querySelectorAll('#advConfigGrid .affinity-pick-item'))
      .find(function(candidate){
        const box = candidate.querySelector('input[type="checkbox"]');
        return box && box.checked;
      });
    return item ? item.dataset.value : '';
  }

  function renderExtendedAdvConfigModal(){
    const state = advConfigExtendedModal;
    if(!state) return;
    const grid = document.getElementById('advConfigGrid');
    const confirm = document.getElementById('advConfigConfirm');
    if(!grid || !confirm) return;
    const schema = state.schema;
    if(state.kind === 'dualTierPick'){
      const influenceStep = state.step === 'influence';
      const values = (influenceStep ? schema.influenceOptions : schema.devotionOptions)
        .map(function(value){ return { label:String(value), value:String(value), cost:value }; });
      const selected = influenceStep ? state.influence : state.devotion;
      document.getElementById('advConfigTitle').textContent = influenceStep ? 'Allies — Influence' : 'Allies — Devotion';
      document.getElementById('advConfigSubtitle').textContent = influenceStep
        ? 'Choose the ally’s Influence.' : 'Choose the ally’s Devotion.';
      grid.innerHTML = advConfigExtendedChoiceGrid(values, selected);
      confirm.textContent = influenceStep ? 'Next' : 'Confirm';
      wireAdvConfigExtendedChoices();
      return;
    }
    if(state.kind === 'rankPick'){
      grid.innerHTML = advConfigExtendedChoiceGrid(advConfigOptionsFor(schema), state.config && state.config.value);
      confirm.textContent = 'Confirm';
      wireAdvConfigExtendedChoices();
      return;
    }
    if(state.kind === 'languagePick'){
      if(state.step === 'type'){
        grid.innerHTML = advConfigExtendedChoiceGrid(schema.options || [], state.languageType);
        confirm.textContent = 'Next';
        wireAdvConfigExtendedChoices();
      } else {
        document.getElementById('advConfigTitle').textContent = 'Languages — Specific Language';
        document.getElementById('advConfigSubtitle').textContent = 'Enter the ' + state.languageType.toLowerCase() + ' language.';
        grid.innerHTML = '<label class="adv-config-text-label" for="advConfigFreeText">Specific language</label>' +
          '<input id="advConfigFreeText" class="adv-config-text-input" type="text" maxlength="120" value="' +
          escAttr(state.language || '') + '" placeholder="Language name">';
        confirm.textContent = 'Confirm';
      }
      return;
    }
    if(state.kind === 'skillPick'){
      const skills = (typeof SKILL_LIBRARY === 'undefined' ? [] : SKILL_LIBRARY)
        .map(function(skill){ return skill.name; }).sort();
      grid.innerHTML = '<label class="adv-config-text-label" for="advConfigFreeText">Skill</label>' +
        '<input id="advConfigFreeText" class="adv-config-text-input" type="text" list="advConfigSkillOptions" maxlength="120" value="' +
        escAttr(state.skill || '') + '" placeholder="Skill name">' +
        '<datalist id="advConfigSkillOptions">' + skills.map(function(skill){
          return '<option value="' + escAttr(skill) + '"></option>';
        }).join('') + '</datalist>';
      confirm.textContent = 'Confirm';
    }
  }

  function openExtendedAdvConfigModal(div, schema){
   if(!ADV_CONFIG_EXTENDED_ENABLED || !schema) return false;
   if(schema.type === 'clanWeaponAutoPick'){
      // Quick-add calls recalc before it opens a picker. Sacred Weapon deliberately has no
      // picker, so trigger one more pass here to derive the Clan profile and add its rows now.
      recalcAll();
     setStatus('Sacred Weapon follows your current Clan. Apply or enter the Clan first if it still needs a choice.');
     return true;
   }
    if(['dualTierPick','rankPick','languagePick','skillPick'].indexOf(schema.type) === -1) return false;
    const config = readAdvConfig(div) || {};
    advConfigTargetEntry = div;
    advConfigExtendedModal = {
      kind:schema.type, schema:schema, config:config,
      step:schema.type === 'dualTierPick' ? 'influence' : (schema.type === 'languagePick' ? 'type' : 'only'),
      influence:config.influence ? String(config.influence) : '',
      devotion:config.devotion ? String(config.devotion) : '',
      languageType:config.languageType || '',
      language:config.language || '',
      skill:config.skill || '',
    };
    if(!advConfigExtendedShow(schema.title, schema.prompt, schema.note)) return true;
    renderExtendedAdvConfigModal();
    return true;
  }

 function commitExtendedAdvConfig(config, statusText){
    const state = advConfigExtendedModal;
    const div = advConfigTargetEntry;
    if(!state || !div) return false;
    writeAdvConfig(div, state.schema.type, config);
    const nameEl = div.querySelector('.en-name');
    const effect = resolveAdvDisadvEffect(nameEl ? nameEl.value : '', readAdvConfig(div));
    if(effect && effect.cost !== undefined){
     const costEl = div.querySelector('.en-cost');
     if(costEl) costEl.value = effect.cost;
    }
    advConfigExtendedModal = null;
    closeAdvConfigModal();
    recalcAll();
    setStatus(statusText);
   return true;
 }

  function closeExtendedAdvConfigModal(){
    advConfigExtendedModal = null;
  }

 function confirmExtendedAdvConfigModal(){
    const state = advConfigExtendedModal;
    if(!state) return false;
    if(state.kind === 'dualTierPick'){
      const selected = advConfigExtendedSelectedValue();
      if(!selected){ setStatus('Make a choice before continuing.'); return true; }
      if(state.step === 'influence'){
        state.influence = selected;
        state.step = 'devotion';
        renderExtendedAdvConfigModal();
        return true;
      }
      state.devotion = selected;
      return commitExtendedAdvConfig({
        influence:parseInt(state.influence,10),
        devotion:parseInt(state.devotion,10),
        value:'Influence ' + state.influence + ' / Devotion ' + state.devotion,
      }, 'Allies configured.');
    }
    if(state.kind === 'rankPick'){
      const selected = advConfigExtendedSelectedValue();
      const opt = (state.schema.options || []).find(function(item){
        return String(item.value === undefined ? item.label : item.value) === String(selected);
      });
      if(!opt){ setStatus('Make a choice before confirming.'); return true; }
      if(state.schema.effect === 'kharmicTie'){
        // Kharmic Tie is deliberately handled by its ring-fenced companion.  The target was
        // collected before this Rank step, so only a complete target+rank object is ever saved.
        const target = String(state.target || '').trim();
        if(!target){ setStatus('Enter the person you are tied to first.'); return true; }
       return commitExtendedAdvConfig({
          value:opt.value, rank:opt.rank, target:target, remaining:opt.rank,
          sourceId:(state.config && state.config.sourceId) || newAdvConfigSourceId('kharmic'),
       }, 'Kharmic Tie configured for ' + target + '.');
      }
      return commitExtendedAdvConfig({
        value:opt.value, rank:opt.rank, remaining:opt.rank,
      }, state.schema.name + ' configured.');
    }
    if(state.kind === 'languagePick'){
      if(state.step === 'type'){
        const selected = advConfigExtendedSelectedValue();
        if(!selected){ setStatus('Choose Human or Non-human before continuing.'); return true; }
        state.languageType = selected;
        state.step = 'language';
        renderExtendedAdvConfigModal();
        return true;
      }
      const input = document.getElementById('advConfigFreeText');
      const language = String(input && input.value || '').trim();
      if(!language){ setStatus('Enter the specific language before confirming.'); return true; }
      return commitExtendedAdvConfig({
        value:state.languageType + ': ' + language,
        languageType:state.languageType, language:language,
      }, 'Language configured: ' + language + '.');
    }
    if(state.kind === 'skillPick'){
      const input = document.getElementById('advConfigFreeText');
      const skill = String(input && input.value || '').trim();
      if(!skill){ setStatus('Enter a Skill before confirming.'); return true; }
      return commitExtendedAdvConfig({ value:skill, skill:skill }, 'Great Potential configured for ' + skill + '.');
    }
    return false;
  }

  // Kharmic Tie needs the target first, then the Rank.  It reuses the exact modal instance and
  // the same confirmation button; this tiny wrapper changes only the first step's content.
  const advConfigOpenExtendedBase = openExtendedAdvConfigModal;
  openExtendedAdvConfigModal = function(div, schema){
    if(schema && schema.type === 'rankPick' && schema.effect === 'kharmicTie'){
      const config = readAdvConfig(div) || {};
      advConfigTargetEntry = div;
      advConfigExtendedModal = {
        kind:'kharmicTarget', schema:schema, config:config,
        target:config.target || '', step:'target',
      };
      if(!advConfigExtendedShow('Kharmic Tie — Target', 'Enter the person you are tied to.', schema.note)) return true;
      const grid = document.getElementById('advConfigGrid');
      grid.innerHTML = '<label class="adv-config-text-label" for="advConfigFreeText">Target person</label>' +
        '<input id="advConfigFreeText" class="adv-config-text-input" type="text" maxlength="120" value="' +
        escAttr(config.target || '') + '" placeholder="Person’s name">';
      document.getElementById('advConfigConfirm').textContent = 'Next';
      return true;
    }
    return advConfigOpenExtendedBase(div, schema);
  };

  const advConfigConfirmExtendedBase = confirmExtendedAdvConfigModal;
  confirmExtendedAdvConfigModal = function(){
    const state = advConfigExtendedModal;
    if(state && state.kind === 'kharmicTarget'){
      const input = document.getElementById('advConfigFreeText');
      const target = String(input && input.value || '').trim();
      if(!target){ setStatus('Enter the person you are tied to before continuing.'); return true; }
      state.kind = 'rankPick';
      state.target = target;
      state.config = Object.assign({}, state.config, { target:target });
      renderExtendedAdvConfigModal();
      return true;
    }
    return advConfigConfirmExtendedBase();
  };

  function advConfigExtendedRollModifiers(context){
    const out = [];
    if(!context) return out;
    activeAdvConfigEffects().forEach(function(effect){
      if(effect.effect === 'greatPotential' && context.kind === ROLL_KINDS.SKILL &&
         normalizeAdvName(effect.skill) === normalizeAdvName(context.skillName)){
        const skillRank = Math.max(0, parseInt(context.skillRank,10) || 0);
        const voidInput = document.getElementById('ring_void');
        const voidRank = Math.max(0, parseInt(voidInput && voidInput.value || '0',10) || 0);
        const allowed = Math.max(skillRank, voidRank);
        out.push({
          source:'adv-config', label:'Great Potential', informational:true,
          display:'Raise cap ' + allowed,
          note:'Skill Rank ' + skillRank + '; Void Rank ' + voidRank + '; use the higher limit',
        });
      }
    });
    if(typeof advConfigKharmicRollModifiers === 'function'){
      const kharmic = advConfigKharmicRollModifiers(context);
      if(Array.isArray(kharmic)) kharmic.forEach(function(mod){ if(mod) out.push(mod); });
    }
    return out;
  }

  function decorateExtendedAdvConfigRow(div, row, schema, config, effect){
    if(!effect) return;
    if(effect.effect === 'magicResistanceReminder'){
      row.insertAdjacentHTML('beforeend',
        '<span class="adv-config-badge adv-config-magic-reminder" title="Tell an incoming elemental spell caster the TN increase. Maho and non-kami magic are excluded.">Incoming spell TN +' +
        effect.tnIncrease + '</span>');
    }
   if(effect.effect === 'greatPotential'){
     row.insertAdjacentHTML('beforeend',
       '<span class="adv-config-badge">Raise-limit reminder</span>');
   }
    if(effect.effect === 'kharmicTie'){
      row.insertAdjacentHTML('beforeend',
        '<span class="adv-config-badge" title="The chosen person for this Kharmic Tie">Target: ' +
        escHtml(effect.target) + '</span>');
    }
    if(effect.entryName === 'Languages'){
      row.insertAdjacentHTML('beforeend',
        '<span class="adv-config-badge">' + escHtml(effect.languageType) + ': ' +
        escHtml(effect.language) + '</span>');
    }
   if(typeof decorateAdvConfigResourceRow === 'function'){
      decorateAdvConfigResourceRow(div, row, schema, config, effect);
    }
    if(typeof decorateAdvConfigSacredWeaponRow === 'function'){
      decorateAdvConfigSacredWeaponRow(div, row, schema, config, effect);
    }
  }

  function ensureExtendedAdvConfigAutoConfig(div, schema, config){
    if(schema && schema.type === 'clanWeaponAutoPick' && typeof ensureAdvConfigSacredWeapon === 'function'){
      return ensureAdvConfigSacredWeapon(div, schema, config);
    }
    return null;
  }
