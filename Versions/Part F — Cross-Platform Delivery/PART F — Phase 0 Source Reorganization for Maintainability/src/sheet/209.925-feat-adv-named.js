  // ========= PART I FEATURE 4.5.13: NAMED ADVANTAGE CONFIGURATION =========
  // Source-checked companion reminders. The existing configuration host and serializer are
  // reused; this release neither registers a roll contributor nor grants character resources.
  const ADV_NAMED_ENTRIES_ENABLED = true;

  const N4513 = (function(){
    const api = {};
    api.enabled = function(){ return ADV_NAMED_ENTRIES_ENABLED && ADV_CONFIG_ENABLED; };
    api.ENTRIES = {
      'Blackmail': {
        type:'targetStatusPick',
        fields:[['target','named4513Target','Target name'],['targetStatus','named4513Status','Agreed target Status Rank']],
        note:'Record the target’s agreed Status at purchase, not your own Status. This calculator supports positive whole Status Ranks; zero or fractional values need a separate player/GM ruling. No NPC is tracked.',
        price:function(config){
          if(!config) return 0;
          return normalizeAdvName(advConfigCharacterClan()) === 'scorpion'
            ? Math.max(1, config.targetStatus - 1) : config.targetStatus;
        },
        summary:function(config){ return config.target + ' — agreed Status ' + config.targetStatus; },
      },
      'Forbidden Knowledge': {
        type:'knowledgePick',
        fields:[['subject','named4513Subject','Subject'],['notes','named4513Notes','Agreed effects (optional)']],
        note:'Benefits are managed manually with your GM; this note does not grant Skills, items, spells or roll bonuses.',
        help:'Core pp.148–149 — examples, not a closed list. All benefits below are managed manually.\n\n' +
          'Gaijin Pepper: Craft: Explosives Rank 1 and a small pouch of gaijin pepper; knowledge of making and using gunpowder.\n\n' +
          'Gozoku: Lore: Gozoku Rank 1 and +1k1 on Social Skill Rolls with known Gozoku members. Membership is not required.\n\n' +
          'Kolat: Lore: Kolat Rank 1 and +1k1 on Social Skill Rolls with known Kolat members. Membership is not required.\n\n' +
          'Lying Darkness: Lore: Lying Darkness Rank 1; observe someone and use that Lore / Perception at TN 30 to identify its corruption.\n\n' +
          'Maho: Lore: Maho Rank 1; a starting maho spell requires GM permission, not an automatic grant.',
        price:function(){ return 5; },
        summary:function(config){ return config.subject + ' — benefits managed manually'; },
      },
      'Inheritance': {
        type:'itemPick', fields:[['itemName','named4513Item','Heirloom name']],
        note:'Reminder only: one heirloom beyond your School outfit; +1k1 on non-combat Skill Rolls using it. Add any equipment and apply that benefit manually. Automatic items and roll bonuses are not included.',
        price:function(){ return 5; }, summary:function(config){ return config.itemName + ' — reminder only'; },
      },
      'Way of the Land': {
        type:'regionPick', fields:[['region','named4513Region','Region (optional)']], optional:true,
        note:'Within your chosen region, you cannot become lost and know its available resources. This is a reminder only; your location is not tracked. You may add the region name later.',
        price:function(){ return normalizeAdvName(advConfigCharacterClan()) === 'unicorn' ? 1 : 2; },
        summary:function(config){ return config && config.region ? config.region + ' — region reminder' : 'Region not recorded (optional)'; },
      },
    };
    api.entryFor = function(name){
      const key = Object.keys(api.ENTRIES).find(function(key){ return normalizeAdvName(key) === normalizeAdvName(name); });
      return key ? Object.assign({name:key}, api.ENTRIES[key]) : null;
    };
    api.owns = function(schema){ return !!schema && schema.named4513 === true && !!api.entryFor(schema.name); };
    api.positiveWhole = function(value){
      if(!/^\d+$/.test(String(value).trim())) return null;
      const number = Number(String(value).trim());
      return Number.isSafeInteger(number) && number >= 1 ? number : null;
    };
    api.complete = function(schema, config){
      if(!api.enabled() || !api.owns(schema) || !config || Array.isArray(config) ||
          config.type !== schema.type || config.revision !== 1) return false;
      const entry = api.entryFor(schema.name);
      const allowed = ['type','revision','value'].concat(entry.fields.map(function(field){ return field[0]; }));
      if(Object.keys(config).some(function(key){ return allowed.indexOf(key) === -1; })) return false;
      return entry.fields.every(function(field){
        const value = config[field[0]];
        if(field[0] === 'targetStatus') return typeof value === 'number' && api.positiveWhole(value) !== null;
        if((field[0] === 'notes' || entry.optional) && value === undefined) return true;
        if(typeof value !== 'string') return false;
        return field[0] === 'notes' || entry.optional || value.trim().length > 0;
      });
    };
    api.resolve = function(name, config){
      if(!api.enabled()) return null;
      const schema = advConfigSchemaFor(name);
      if(!api.owns(schema) || !api.complete(schema, config)) return null;
      const entry = api.entryFor(name);
      return {effect:'named4513Reminder',entryName:entry.name,cost:entry.price(config),label:entry.summary(config)};
    };
    api.addInfo = function(scope, entry, config){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'named4513-info';
      button.textContent = 'i';
      button.setAttribute('aria-label', entry.name + ' information');
      button.addEventListener('click', function(){
        const agreed = config && typeof config.notes === 'string' && config.notes.trim()
          ? '\n\nYour agreed effects (manual):\n' + config.notes : '';
        // The trunk's existing information overlay renders body as textContent, never HTML.
        populateInfoOverlay(entry.name, 'Reference — not automatic effects', (entry.help || entry.note) + agreed);
      });
      scope.appendChild(button);
    };
    api.refresh = function(div){
      if(!api.enabled()) return false;
      const name = div && div.querySelector('.en-name');
      const priorRow = div && div.querySelector('.named4513-row');
      if(priorRow && name && priorRow.dataset.named4513Name !== normalizeAdvName(name.value)){
        // An explicit live rename discards this row's former pick. An imported unsupported
        // config has no previous rendered row, so it is preserved and flagged instead.
        delete div.dataset.advConfig;
        priorRow.remove();
      }
      const schema = name && advConfigSchemaFor(name.value);
      if(!api.owns(schema)) return false;
      const entry = api.entryFor(name.value);
      const stored = !!div.dataset.advConfig;
      const config = readAdvConfig(div);
      const valid = api.complete(schema, config);
      const wrong = div.parentElement && div.parentElement.id === 'disadvList';
      const cost = div.querySelector('.en-cost');
      const row = advConfigRowFor(div);
      row.dataset.named4513Name = normalizeAdvName(name.value);
      let warning = '', summary = '';
      if(wrong) warning = 'This entry belongs in Advantages; move it there before configuring.';
      else if(stored && !valid) warning = 'Saved setting kept — unsupported or invalid configuration. Review before replacing it.';
      else {
        if(cost) cost.value = entry.price(valid ? config : null);
        if(valid || entry.optional) summary = entry.summary(valid ? config : null);
        else warning = entry.name === 'Blackmail' ? 'Needs a target and agreed Status — not priced yet' : 'Needs a ' + (entry.name === 'Inheritance' ? 'named heirloom' : 'subject');
      }
      row.className = 'adv-config-row named4513-row ' + (warning ? 'unconfigured' : 'configured');
      row.innerHTML = warning
        ? '<span class="adv-config-warn named4513-warning">' + escHtml(warning) + '</span>'
        : '<span class="adv-config-summary named4513-badge">' + escHtml(summary) + '</span>';
      if(!wrong){
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'ghost adv-config-btn';
        button.textContent = stored ? 'Change' : (entry.optional ? 'Add region' : 'Choose…');
        button.setAttribute('aria-label', 'Configure ' + entry.name);
        button.addEventListener('click', function(){ openAdvConfigModal(div); });
        row.appendChild(button);
        api.addInfo(row,entry,config);
      }
      return true;
    };
    api.open = function(div, schema){
      if(!api.enabled() || !api.owns(schema)) return false;
      if(div.parentElement && div.parentElement.id === 'disadvList'){
        setStatus('Blackmail and these reminders belong in Advantages.'); return true;
      }
      const entry = api.entryFor(schema.name), config = readAdvConfig(div);
      const valid = api.complete(schema,config);
      advConfigTargetEntry = div;
      advConfigExtendedModal = {kind:'named4513',schema:schema,entryName:normalizeAdvName(schema.name)};
      document.getElementById('advConfigTitle').textContent = entry.name;
      document.getElementById('advConfigSubtitle').textContent = 'Record ' + (entry.name === 'Blackmail' ? 'the agreed purchase details' : 'your reminder');
      const note = document.getElementById('advConfigNote');
      note.textContent = (div.dataset.advConfig && !valid ? 'The saved setting is unsupported. Confirming replaces it with these details. ' : '') + entry.note;
      note.style.display = '';
      const grid = document.getElementById('advConfigGrid');
      grid.innerHTML = entry.fields.map(function(field){
        const value = config && (typeof config[field[0]] === 'string' || typeof config[field[0]] === 'number') ? String(config[field[0]]) : '';
        const control = field[0] === 'notes'
          ? '<textarea class="named4513-input" id="'+field[1]+'" rows="3">'+escHtml(value)+'</textarea>'
          : '<input class="named4513-input" id="'+field[1]+'" type="text"'+(field[0] === 'targetStatus' ? ' inputmode="numeric"' : '')+' value="'+escAttr(value)+'">';
        return '<label class="named4513-label" for="'+field[1]+'">'+escHtml(field[2])+'</label>'+control;
      }).join('');
      const error = document.createElement('p');
      error.className = 'named4513-error'; error.setAttribute('role','alert'); error.hidden = true;
      grid.appendChild(error);
      api.addInfo(grid,entry,config);
      document.getElementById('advConfigConfirm').textContent = 'Confirm';
      document.getElementById('advConfigModalOverlay').style.display = 'flex';
      grid.querySelector('input').focus({preventScroll:true});
      return true;
    };
    api.confirm = function(){
      const state = advConfigExtendedModal;
      if(!api.enabled() || !state || state.kind !== 'named4513') return false;
      const div = advConfigTargetEntry;
      const currentName = div && div.querySelector('.en-name');
      if(!div || !div.isConnected || !currentName || normalizeAdvName(currentName.value) !== state.entryName){
        closeAdvConfigModal(); setStatus('The entry changed; open its configuration again.'); return true;
      }
      const entry = api.entryFor(state.schema.name), config = {type:entry.type,revision:1};
      entry.fields.forEach(function(field){
        const value = document.getElementById(field[1]).value.trim();
        config[field[0]] = field[0] === 'targetStatus' ? api.positiveWhole(value) : value;
      });
      if(!api.complete(state.schema,config)){
        const message = entry.name === 'Blackmail'
          ? 'Enter a target name and a positive whole Status Rank. Zero/fractional values need a player/GM ruling outside this calculator.'
          : 'Enter the ' + (entry.name === 'Inheritance' ? 'heirloom name' : 'subject') + ' before confirming.';
        const error = document.querySelector('#advConfigGrid .named4513-error');
        error.textContent = message; error.hidden = false;
        setStatus(message);
        return true;
      }
      config.value = entry.summary(config);
      return commitExtendedAdvConfig(config,entry.name + ' configured.');
    };
    return api;
  })();

  if(N4513.enabled()){
    Object.keys(N4513.ENTRIES).forEach(function(name){
      const entry = N4513.ENTRIES[name];
      registerAdvConfigSchema(name,{type:entry.type,effect:'named4513Reminder',named4513:true,title:name,prompt:entry.note});
    });
    const named4513PreviousComplete = isExtendedAdvConfigComplete;
    isExtendedAdvConfigComplete = function(schema,config){
      return N4513.owns(schema) ? N4513.complete(schema,config) : named4513PreviousComplete(schema,config);
    };
    const named4513PreviousResolve = resolveAdvDisadvEffect;
    resolveAdvDisadvEffect = function(name,config){
      return N4513.owns(advConfigSchemaFor(name)) ? N4513.resolve(name,config) : named4513PreviousResolve(name,config);
    };
    const named4513PreviousRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){ if(!N4513.refresh(div)) named4513PreviousRefresh(div); };
    const named4513PreviousOpen = openExtendedAdvConfigModal;
    openExtendedAdvConfigModal = function(div,schema){ return N4513.open(div,schema) || named4513PreviousOpen(div,schema); };
    const named4513PreviousConfirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){ return N4513.confirm() || named4513PreviousConfirm(); };
  }
