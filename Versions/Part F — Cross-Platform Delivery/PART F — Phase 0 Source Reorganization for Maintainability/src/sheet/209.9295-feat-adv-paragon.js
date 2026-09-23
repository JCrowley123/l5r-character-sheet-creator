  // ========= PART I FEATURE 4.5.18: PARAGON =========
  // A09. One Bushido tenet is saved on the row, with a badge and an accurate reminder of what it
  // gives. Approved scope is reminder only: no roll modifier, Void effect or Honor award is applied
  // by the sheet. The player adds the extra Honor and applies the tenet's benefit.
  const ADV_PARAGON_ENABLED = true;

  const P4518 = (function(){
    const api = {};
    api.NAME = 'Paragon';
    api.TYPE = 'paragonTenet';
    // Core p.152, as recorded in SOURCE-CORE-PREPARATION.md. Order as printed.
    api.TENETS = [
      ['Compassion', 'When a Void Point improves a roll made to directly help someone lower in the Celestial Order, it gives +2k2 instead of +1k1.'],
      ['Courage', '+1k1 on rolls to resist Intimidation or overcome Fear.'],
      ['Courtesy', '+2k0 on Etiquette rolls to avoid embarrassment or a breach of honor.'],
      ['Duty', 'A Void Point can negate every TN penalty, including Wound penalties, on one Skill or Spell Casting roll.'],
      ['Honesty', '+1k1 on Sincerity (Honesty) rolls, even without that Emphasis when it would fit.'],
      ['Honor', 'Use twice your Honor Rank instead of the normal Honor contribution when resisting Temptation or Intimidation.'],
      ['Sincerity', '+2k0 on Contested Rolls using Sincerity.'],
    ];
    api.enabled = function(){ return ADV_PARAGON_ENABLED && ADV_CONFIG_ENABLED; };
    api.is = function(name){ return normalizeAdvName(name) === normalizeAdvName(api.NAME); };
    api.ownsSchema = function(schema){ return !!schema && schema.p4518 === true && api.is(schema.name); };
    api.price = function(){ return normalizeAdvName(advConfigCharacterClan()) === 'lion' ? 6 : 7; };
    api.tenet = function(name){ return api.TENETS.find(function(t){ return t[0] === name; }) || null; };

    api.complete = function(config){
      if(!api.enabled() || !config || typeof config !== 'object' || Array.isArray(config)) return false;
      if(config.type !== api.TYPE || config.revision !== 1) return false;
      if(Object.keys(config).some(function(k){ return ['type', 'revision', 'value', 'tenet'].indexOf(k) === -1; })) return false;
      return !!api.tenet(config.tenet);
    };
    api.resolve = function(config){
      if(!api.complete(config)) return null;
      return {effect:'p4518Reminder', entryName:api.NAME, cost:api.price(), label:config.tenet};
    };
    api.honorLine = function(tenet){
      return '+1 Honor whenever you gain Honor for showing ' + tenet + ' — add it yourself.';
    };

    api.info = function(tenet){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'p4518-info';
      button.textContent = 'i';
      button.setAttribute('aria-label', api.NAME + ' information');
      button.addEventListener('click', function(){
        const chosen = tenet ? api.tenet(tenet) : null;
        populateInfoOverlay(api.NAME, 'Reference — Core p.152, not automatic effects',
          (chosen ? 'Your tenet: ' + chosen[0] + '\n' + chosen[1] + '\n' + api.honorLine(chosen[0]) + '\n\n' : '') +
          'Choose one tenet of Bushido. Whenever you gain Honor for showing that virtue, gain 1 more Honor. ' +
          'Cost 7 XP, or 6 for a Lion character.\n\nThis sheet records the tenet and reminds you of it; it does not change dice, spend Void or award Honor.\n\n' +
          api.TENETS.map(function(t){ return t[0] + ': ' + t[1]; }).join('\n'));
      });
      return button;
    };
    api.clearRenamed = function(div, name){
      const own = div.querySelector('.p4518-row');
      if(own && own.dataset.p4518Name !== normalizeAdvName(name)){ delete div.dataset.advConfig; own.remove(); return; }
      const foreign = api.is(name) && div.querySelector('.adv-config-row:not(.p4518-row)');
      if(foreign){ delete div.dataset.advConfig; foreign.remove(); }
    };
    api.refresh = function(div){
      if(!api.enabled()) return false;
      const name = div && div.querySelector('.en-name');
      if(!name) return false;
      api.clearRenamed(div, name.value);
      if(!api.ownsSchema(advConfigSchemaFor(name.value))) return false;
      const stored = !!div.dataset.advConfig, config = readAdvConfig(div), valid = api.complete(config);
      const wrong = !!div.parentElement && div.parentElement.id === 'disadvList';
      const cost = div.querySelector('.en-cost');
      let warning = '';
      if(wrong) warning = 'This entry belongs in Advantages; move it there before configuring.';
      else if(stored && !valid) warning = 'Saved setting kept — unsupported or invalid configuration. Review before replacing it.';
      else {
        if(cost) cost.value = api.price();
        if(!valid) warning = 'Choose your tenet of Bushido';
      }
      const row = advConfigRowFor(div);
      row.dataset.p4518Name = normalizeAdvName(api.NAME);
      row.className = 'adv-config-row p4518-row ' + (warning ? 'unconfigured' : 'configured');
      row.textContent = '';
      const lead = document.createElement('span');
      lead.className = warning ? 'adv-config-warn p4518-warning' : 'adv-config-summary p4518-badge';
      lead.textContent = warning || config.tenet;
      row.appendChild(lead);
      if(wrong) return true;
      const change = document.createElement('button');
      change.type = 'button';
      change.className = 'ghost adv-config-btn';
      change.textContent = stored ? 'Change' : 'Choose…';
      change.setAttribute('aria-label', 'Configure ' + api.NAME);
      change.addEventListener('click', function(){ openAdvConfigModal(div); });
      row.appendChild(change);
      row.appendChild(api.info(valid ? config.tenet : null));
      if(valid){
        const reminder = document.createElement('p');
        reminder.className = 'p4518-reminder';
        reminder.textContent = api.tenet(config.tenet)[1] + ' ' + api.honorLine(config.tenet);
        row.appendChild(reminder);
      }
      return true;
    };
    api.open = function(div, schema){
      if(!api.enabled() || !api.ownsSchema(schema)) return false;
      if(div.parentElement && div.parentElement.id === 'disadvList'){ setStatus('Paragon belongs in Advantages.'); return true; }
      const config = readAdvConfig(div), valid = api.complete(config);
      advConfigTargetEntry = div;
      advConfigExtendedModal = {kind:'p4518', schema:schema};
      document.getElementById('advConfigTitle').textContent = api.NAME;
      document.getElementById('advConfigSubtitle').textContent = 'Choose one tenet of Bushido';
      const note = document.getElementById('advConfigNote');
      note.textContent = (div.dataset.advConfig && !valid ? 'The saved setting is unsupported. Confirming replaces it. ' : '') +
        'Reminder only: the sheet records your tenet but changes no dice, Void or Honor. Whenever you gain Honor for showing it, add 1 more yourself.';
      note.style.display = '';
      const grid = document.getElementById('advConfigGrid');
      grid.innerHTML = '<fieldset class="p4518-picker"><legend class="p4518-legend">Tenet</legend></fieldset><p class="p4518-error" role="alert" hidden></p>';
      const set = grid.querySelector('.p4518-picker');
      api.TENETS.forEach(function(t){
        const label = document.createElement('label');
        label.className = 'p4518-option';
        const radio = document.createElement('input');
        radio.type = 'radio'; radio.name = 'p4518Tenet'; radio.value = t[0];
        radio.checked = valid && config.tenet === t[0];
        const text = document.createElement('span');
        const strong = document.createElement('b');
        strong.textContent = t[0];
        text.appendChild(strong);
        text.appendChild(document.createTextNode(' — ' + t[1]));
        label.appendChild(radio); label.appendChild(text);
        set.appendChild(label);
      });
      grid.appendChild(api.info(valid ? config.tenet : null));
      document.getElementById('advConfigConfirm').textContent = 'Confirm';
      document.getElementById('advConfigModalOverlay').style.display = 'flex';
      const focus = grid.querySelector('input:checked') || grid.querySelector('input');
      if(focus) focus.focus({preventScroll:true});
      return true;
    };
    api.confirm = function(){
      const state = advConfigExtendedModal;
      if(!api.enabled() || !state || state.kind !== 'p4518') return false;
      const div = advConfigTargetEntry, name = div && div.querySelector('.en-name');
      if(!div || !div.isConnected || !name || !api.is(name.value)){
        closeAdvConfigModal(); setStatus('The entry changed; open its configuration again.'); return true;
      }
      const picked = document.querySelector('#advConfigGrid input[name="p4518Tenet"]:checked');
      if(!picked || !api.tenet(picked.value)){
        const error = document.querySelector('#advConfigGrid .p4518-error');
        error.textContent = 'Choose a tenet before confirming.'; error.hidden = false;
        setStatus(error.textContent);
        return true;
      }
      return commitExtendedAdvConfig({type:api.TYPE, revision:1, tenet:picked.value, value:picked.value}, api.NAME + ': ' + picked.value + '.');
    };
    return api;
  })();

  if(P4518.enabled()){
    registerAdvConfigSchema(P4518.NAME, {type:P4518.TYPE, effect:'p4518Reminder', p4518:true,
      title:P4518.NAME, prompt:'Choose one tenet of Bushido.'});
    const p4518PreviousComplete = isExtendedAdvConfigComplete;
    isExtendedAdvConfigComplete = function(schema, config){
      return P4518.ownsSchema(schema) ? P4518.complete(config) : p4518PreviousComplete(schema, config);
    };
    const p4518PreviousResolve = resolveAdvDisadvEffect;
    resolveAdvDisadvEffect = function(name, config){
      return P4518.ownsSchema(advConfigSchemaFor(name)) ? P4518.resolve(config) : p4518PreviousResolve(name, config);
    };
    const p4518PreviousRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){ if(!P4518.refresh(div)) p4518PreviousRefresh(div); };
    const p4518PreviousOpen = openExtendedAdvConfigModal;
    openExtendedAdvConfigModal = function(div, schema){ return P4518.open(div, schema) || p4518PreviousOpen(div, schema); };
    const p4518PreviousConfirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){ return P4518.confirm() || p4518PreviousConfirm(); };
  }
