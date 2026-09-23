  // ========= PART I FEATURE 4.5.14: DARLING OF THE COURT AND SERVANT REFERENCE =========
  // Darling of the Court keeps every purchased court on ONE Advantage row, with one selected
  // court and one "Court in session" toggle; each court is its own purchase. Servant is a
  // reference row only. Neither registers a roll contributor, writes Status, or grants anything.
  const ADV_COURT_SERVANT_ENABLED = true;

  const CS4514 = (function(){
    const api = {};
    api.DARLING = 'Darling of the Court';
    api.SERVANT = 'Servant';
    api.TYPE = 'courtList';
    api.seq = 0;
    api.enabled = function(){ return ADV_COURT_SERVANT_ENABLED && ADV_CONFIG_ENABLED; };
    api.is = function(name, wanted){ return normalizeAdvName(name) === normalizeAdvName(wanted); };
    api.ownsSchema = function(schema){ return !!schema && schema.cs4514 === true && api.is(schema.name, api.DARLING); };
    api.courtKey = function(court){ return normalizeAdvName(String(court).replace(/\s+/g, ' ')); };

    // A School counts as a Courtier School when its name says so, either as its title ("Doji
    // Courtier") or as the bracketed type tag the School library uses otherwise ("Kitsuki
    // Investigator [Courtier]", "Order of Ebisu [Monk/Courtier]"). Every School the character
    // has trained counts, the way characterCasterLock() reads the same list.
    api.courtierSchool = function(){
      const list = typeof getSchoolsList === 'function' ? getSchoolsList() : [];
      const hit = list.find(function(entry){ return entry && /\bcourtier\b/i.test(String(entry.name || '')); });
      return hit ? String(hit.name) : '';
    };
    api.perCourt = function(){ return api.courtierSchool() ? 1 : 2; };

    api.listProblem = function(courts){
      if(!courts.length) return 'Add at least one court.';
      if(courts.some(function(court){ return !String(court).trim(); })) return 'Enter a name for each court, or remove the empty line.';
      const seen = {};
      for(const court of courts){
        const key = api.courtKey(court);
        if(seen[key]) return 'Each court can be purchased only once: “' + String(court).trim() + '” is listed twice.';
        seen[key] = true;
      }
      return '';
    };
    api.complete = function(config){
      if(!api.enabled() || !config || typeof config !== 'object' || Array.isArray(config)) return false;
      if(config.type !== api.TYPE || config.revision !== 1) return false;
      const allowed = ['type', 'revision', 'value', 'courts', 'selected', 'inSession'];
      if(Object.keys(config).some(function(key){ return allowed.indexOf(key) === -1; })) return false;
      if(!Array.isArray(config.courts) || config.courts.some(function(court){ return typeof court !== 'string'; })) return false;
      if(api.listProblem(config.courts)) return false;
      if(config.selected !== undefined && config.courts.indexOf(config.selected) === -1) return false;
      return config.inSession === undefined || typeof config.inSession === 'boolean';
    };
    // An omitted selection or toggle (a hand-made or older import) means the first court, not
    // in session -- never a guessed "in session" that would show a higher Status.
    api.selectedOf = function(config){ return config.selected === undefined ? config.courts[0] : config.selected; };
    api.price = function(config){ return (config ? config.courts.length : 1) * api.perCourt(); };
    api.priceText = function(config){
      const count = config.courts.length, each = api.perCourt();
      return count + ' court' + (count === 1 ? '' : 's') + ' — ' + api.price(config) + ' XP (' +
        (each === 1 ? 'Courtier: 1' : '2') + ' each)';
    };
    api.resolve = function(config){
      if(!api.complete(config)) return null;
      return {effect:'court4514Reminder', entryName:api.DARLING, cost:api.price(config), label:config.courts.join(', ')};
    };

    api.statusRank = function(){
      const element = document.getElementById('f_statusRank');
      const rank = element && String(element.value).trim() !== '' ? Number(element.value) : NaN;
      return Number.isFinite(rank) ? rank : null;
    };
    api.contextText = function(config){
      const court = api.selectedOf(config), rank = api.statusRank();
      if(config.inSession === true){
        return (rank === null ? 'Your Status counts one Rank higher' : 'Status ' + rank + ' — counts as ' + (rank + 1)) +
          ' at ' + court + ' (in session). Actual Status unchanged.';
      }
      return (rank === null ? 'Status as normal' : 'Status ' + rank + ' as normal') + ' — ' + court + ' not in session.';
    };

    api.darlingHelp = function(){
      const school = api.courtierSchool();
      return 'Core p.148 — reference, not an automatic effect.\n\n' +
        'Choose a court. While you attend it and its court is in session, your Status counts as one Rank higher there. ' +
        'Your actual Status Rank, and everything calculated from it, is unchanged.\n\n' +
        'You may buy this again for a different court, but only once for any particular court. ' +
        'Each court costs 2 XP, or 1 XP for a Courtier.\n\n' +
        'Examples, not a complete list: the court of Kyuden Bayushi; the court of Toshi Ranbo’s Okura district.\n\n' +
        'This sheet shows the higher Status only for the one court you select, and only while “Court in session” is ticked.\n\n' +
        'Courtier price: ' + (school ? 'applies — ' + school + '.' : 'does not apply — no Courtier School recorded.') +
        ' A School counts when its name or its bracketed type says Courtier.';
    };
    api.SERVANT_SAMPLES = [
      ['Artisan', 'One Artisan Skill at 3', 'Crane −2'],
      ['Attendant', 'Etiquette (Conversation) 3', 'Scorpion −2'],
      ['Budoka', 'One Weapon Skill at 3', 'Lion −2'],
      ['Craftsman', 'One Craft Skill at 3', 'Dragon −2'],
      ['Eta Attendant', 'Lore: Anatomy 3', 'Crab −2'],
      ['Groom', 'Animal Handling (Horses) 3', 'Unicorn −2'],
      ['Merchant', 'Commerce (Appraisal) 3', 'Mantis −2'],
      ['Scribe', 'One Lore Skill at 3', 'Phoenix −2'],
      ['Sohei', 'Jiujutsu 3', 'Spider −2'],
    ];
    api.servantHelp = function(){
      const rank = api.statusRank();
      return 'Core p.153 — reference only. Nothing here changes your XP, Traits or Skills.\n\n' +
        'Base cost 5 points before the listed Clan discount. A typical servant has Traits of 2 and one Skill at Rank 3. ' +
        'At purchase, each extra Skill Rank or Emphasis costs 3 more points.\n\n' +
        'You may keep up to twice your Status Rank in servants' +
        (rank === null ? '.' : ' — Status ' + rank + ' allows up to ' + (2 * rank) + '.') + '\n\n' +
        'Record your servant’s type and Skill in the description, and adjust this row’s cost yourself for any discount or upgrade.\n\n' +
        'Sample servants, not a complete list (type — notable ability — listed discount):\n' +
        api.SERVANT_SAMPLES.map(function(sample){ return sample.join(' — '); }).join('\n');
    };

    api.infoButton = function(className, label, title, subtitle, body){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = className;
      button.textContent = 'i';
      button.setAttribute('aria-label', label);
      // The trunk's information overlay renders body as textContent, never HTML.
      button.addEventListener('click', function(){ populateInfoOverlay(title, subtitle, body()); });
      return button;
    };
    api.darlingInfo = function(){
      return api.infoButton('court4514-info', api.DARLING + ' information', api.DARLING,
        'Reference — not automatic effects', api.darlingHelp);
    };

    api.primaryDarling = function(){
      const list = document.getElementById('advList');
      return list ? Array.from(list.querySelectorAll('.entry')).find(function(entry){
        const name = entry.querySelector('.en-name');
        return name && api.is(name.value, api.DARLING);
      }) || null : null;
    };

    // Row controls commit on change and rebuild the row through the normal recalc, so the
    // badge, price and readout never disagree; focus returns to the equivalent control.
    api.update = function(div, patch, focusSelector, message){
      const config = readAdvConfig(div);
      if(!api.complete(config)) return;
      const next = Object.assign({}, config, {selected:api.selectedOf(config), inSession:config.inSession === true}, patch);
      writeAdvConfig(div, api.TYPE, next);
      recalcAll();
      const control = div.querySelector(focusSelector);
      if(control) control.focus({preventScroll:true});
      setStatus(message);
    };
    api.controls = function(div, config){
      const box = document.createElement('div');
      box.className = 'court4514-controls';
      const group = document.createElement('fieldset');
      group.className = 'court4514-courts';
      const legend = document.createElement('legend');
      legend.className = 'court4514-legend';
      legend.textContent = 'Selected court';
      group.appendChild(legend);
      const radioName = 'court4514-select-' + (++api.seq);
      const selected = api.selectedOf(config);
      config.courts.forEach(function(court, index){
        const label = document.createElement('label');
        label.className = 'court4514-court' + (court === selected ? ' court4514-court-selected' : '');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = radioName;
        radio.value = String(index);
        radio.checked = court === selected;
        radio.addEventListener('change', function(){
          if(!radio.checked) return;
          api.update(div, {selected:court, inSession:false}, '.court4514-courts input[value="' + index + '"]',
            api.DARLING + ': ' + court + ' selected; tick “Court in session” while it sits.');
        });
        const text = document.createElement('span');
        text.textContent = court;
        label.appendChild(radio);
        label.appendChild(text);
        group.appendChild(label);
      });
      box.appendChild(group);
      const session = document.createElement('label');
      session.className = 'court4514-session';
      const toggle = document.createElement('input');
      toggle.type = 'checkbox';
      toggle.className = 'court4514-session-box';
      toggle.checked = config.inSession === true;
      toggle.addEventListener('change', function(){
        api.update(div, {inSession:toggle.checked}, '.court4514-session-box',
          api.DARLING + ': ' + selected + (toggle.checked ? ' in session.' : ' not in session.'));
      });
      session.appendChild(toggle);
      session.appendChild(document.createTextNode(' Court in session'));
      box.appendChild(session);
      const status = document.createElement('p');
      status.className = 'court4514-status' + (config.inSession === true ? ' court4514-active' : '');
      status.textContent = api.contextText(config);
      box.appendChild(status);
      return box;
    };

    // A live rename away from (or onto) an entry this release owns discards that row's former
    // pick, as Feature 4.5.13 does. An imported config has no previously rendered row, so it is
    // preserved and flagged instead of being treated as a rename.
    api.clearRenamed = function(div, name){
      const own = div.querySelector('.court4514-row, .servant4514-row');
      if(own && own.dataset.cs4514Name !== normalizeAdvName(name)){
        delete div.dataset.advConfig;
        own.remove();
        return;
      }
      const owned = api.is(name, api.DARLING) || api.is(name, api.SERVANT);
      const foreign = owned && div.querySelector('.adv-config-row:not(.court4514-row):not(.servant4514-row)');
      if(foreign){
        delete div.dataset.advConfig;
        foreign.remove();
      }
    };
    api.renderDarling = function(div){
      const stored = !!div.dataset.advConfig;
      const config = readAdvConfig(div);
      const valid = api.complete(config);
      const wrong = !!div.parentElement && div.parentElement.id === 'disadvList';
      const duplicate = !wrong && api.primaryDarling() !== div;
      const cost = div.querySelector('.en-cost');
      let warning = '';
      if(wrong) warning = 'This entry belongs in Advantages; move it there before configuring.';
      else if(stored && !valid) warning = 'Saved setting kept — unsupported or invalid configuration. Review before replacing it.';
      else {
        if(cost) cost.value = api.price(valid ? config : null);
        if(duplicate) warning = 'Keep every court on your first Darling of the Court row: add these there, then delete this row.';
        else if(!valid) warning = 'Name your court — priced as one purchase until you do';
      }
      const row = advConfigRowFor(div);
      row.dataset.cs4514Name = normalizeAdvName(api.DARLING);
      row.className = 'adv-config-row court4514-row ' + (warning ? 'unconfigured' : 'configured');
      row.textContent = '';
      const lead = document.createElement('span');
      lead.className = warning ? 'adv-config-warn court4514-warning' : 'adv-config-summary court4514-badge';
      lead.textContent = warning || api.priceText(config);
      row.appendChild(lead);
      if(wrong) return;
      const change = document.createElement('button');
      change.type = 'button';
      change.className = 'ghost adv-config-btn';
      change.textContent = stored ? 'Change' : 'Choose…';
      change.setAttribute('aria-label', 'Configure ' + api.DARLING);
      change.addEventListener('click', function(){ openAdvConfigModal(div); });
      row.appendChild(change);
      row.appendChild(api.darlingInfo());
      if(!warning) row.appendChild(api.controls(div, config));
    };
    api.renderServant = function(div){
      const stored = !!div.dataset.advConfig;
      const wrong = !!div.parentElement && div.parentElement.id === 'disadvList';
      const row = advConfigRowFor(div);
      row.dataset.cs4514Name = normalizeAdvName(api.SERVANT);
      const warning = wrong ? 'This entry belongs in Advantages.'
        : (stored ? 'Saved servant record kept — this version shows the reference only.' : '');
      row.className = 'adv-config-row servant4514-row ' + (warning ? 'unconfigured' : 'configured');
      row.textContent = '';
      const lead = document.createElement('span');
      lead.className = warning ? 'adv-config-warn servant4514-warning' : 'adv-config-summary servant4514-badge';
      lead.textContent = warning || 'Reference only — record type, Skill and upgrades yourself';
      row.appendChild(lead);
      if(!wrong){
        row.appendChild(api.infoButton('servant4514-info', api.SERVANT + ' information', api.SERVANT,
          'Reference — Core p.153', api.servantHelp));
      }
    };
    api.refresh = function(div){
      if(!api.enabled()) return false;
      const name = div && div.querySelector('.en-name');
      if(!name) return false;
      api.clearRenamed(div, name.value);
      if(api.is(name.value, api.SERVANT)){ api.renderServant(div); return true; }
      if(!api.ownsSchema(advConfigSchemaFor(name.value))) return false;
      api.renderDarling(div);
      return true;
    };

    api.courtInput = function(list, value, origin){
      const id = 'court4514Court' + (++api.seq);
      const item = document.createElement('li');
      item.className = 'court4514-item';
      item.innerHTML = '<label class="court4514-label" for="' + id + '"></label>' +
        '<input class="court4514-input" id="' + id + '" type="text" autocomplete="off">' +
        '<button type="button" class="ghost court4514-remove">Remove</button>';
      const input = item.querySelector('input');
      input.value = value;
      input.dataset.court4514Origin = origin;
      item.querySelector('.court4514-remove').addEventListener('click', function(){
        item.remove();
        api.renumber(list);
        const next = list.querySelector('.court4514-input');
        const focusTarget = next || document.querySelector('#advConfigGrid .court4514-add');
        if(focusTarget) focusTarget.focus({preventScroll:true});
      });
      list.appendChild(item);
      api.renumber(list);
      return input;
    };
    api.renumber = function(list){
      Array.from(list.querySelectorAll('.court4514-item')).forEach(function(item, index){
        item.querySelector('.court4514-label').textContent = 'Court ' + (index + 1);
        item.querySelector('.court4514-remove').setAttribute('aria-label', 'Remove court ' + (index + 1));
      });
    };
    api.open = function(div, schema){
      if(!api.enabled() || !api.ownsSchema(schema)) return false;
      if(div.parentElement && div.parentElement.id === 'disadvList'){
        setStatus('Darling of the Court belongs in Advantages.'); return true;
      }
      const config = readAdvConfig(div), valid = api.complete(config);
      advConfigTargetEntry = div;
      advConfigExtendedModal = {kind:'court4514', schema:schema};
      document.getElementById('advConfigTitle').textContent = api.DARLING;
      document.getElementById('advConfigSubtitle').textContent = 'Name each court you have purchased';
      const each = api.perCourt();
      const note = document.getElementById('advConfigNote');
      note.textContent = (div.dataset.advConfig && !valid ? 'The saved setting is unsupported. Confirming replaces it with these courts. ' : '') +
        (api.primaryDarling() !== div ? 'You already have a Darling of the Court row; adding courts there keeps one selected court and one session toggle. ' : '') +
        'Each court is a separate purchase: ' + each + ' XP each' + (each === 1 ? ' (Courtier price)' : ', 1 XP for a Courtier') +
        '. A court can be listed only once. You choose the selected court and whether it is in session on the sheet.';
      note.style.display = '';
      const grid = document.getElementById('advConfigGrid');
      grid.innerHTML = '<div class="court4514-editor"><ol class="court4514-list"></ol>' +
        '<button type="button" class="ghost court4514-add">Add court</button>' +
        '<p class="court4514-error" role="alert" hidden></p></div>';
      const editor = grid.querySelector('.court4514-editor');
      const list = editor.querySelector('.court4514-list');
      (valid ? config.courts : ['']).forEach(function(court, index){ api.courtInput(list, court, valid ? String(index) : ''); });
      editor.querySelector('.court4514-add').addEventListener('click', function(){
        api.courtInput(list, '', '').focus({preventScroll:true});
      });
      editor.appendChild(api.darlingInfo());
      document.getElementById('advConfigConfirm').textContent = 'Confirm';
      document.getElementById('advConfigModalOverlay').style.display = 'flex';
      list.querySelector('input').focus({preventScroll:true});
      return true;
    };
    api.confirm = function(){
      const state = advConfigExtendedModal;
      if(!api.enabled() || !state || state.kind !== 'court4514') return false;
      const div = advConfigTargetEntry;
      const name = div && div.querySelector('.en-name');
      if(!div || !div.isConnected || !name || !api.is(name.value, api.DARLING)){
        closeAdvConfigModal(); setStatus('The entry changed; open its configuration again.'); return true;
      }
      const inputs = Array.from(document.querySelectorAll('#advConfigGrid .court4514-input'));
      const courts = inputs.map(function(input){ return input.value.trim().replace(/\s+/g, ' '); });
      const problem = api.listProblem(courts);
      if(problem){
        const error = document.querySelector('#advConfigGrid .court4514-error');
        error.textContent = problem; error.hidden = false;
        setStatus(problem);
        return true;
      }
      // The selection follows its court through a rename. If the selected court was removed,
      // the first court is selected and NOT in session: a higher Status is never carried over
      // to a court the player did not choose.
      const prior = readAdvConfig(div);
      let selected = courts[0], inSession = false;
      if(api.complete(prior)){
        const priorIndex = String(prior.courts.indexOf(api.selectedOf(prior)));
        const at = inputs.findIndex(function(input){ return input.dataset.court4514Origin === priorIndex; });
        if(at !== -1){ selected = courts[at]; inSession = prior.inSession === true; }
      }
      const config = {type:api.TYPE, revision:1, courts:courts, selected:selected, inSession:inSession, value:courts.join(', ')};
      return commitExtendedAdvConfig(config, api.DARLING + ': ' + courts.length + ' court' + (courts.length === 1 ? '' : 's') + ' recorded.');
    };
    return api;
  })();

  if(CS4514.enabled()){
    registerAdvConfigSchema(CS4514.DARLING, {type:CS4514.TYPE, effect:'court4514Reminder', cs4514:true,
      title:CS4514.DARLING, prompt:'Name each court you have purchased.'});
    const cs4514PreviousComplete = isExtendedAdvConfigComplete;
    isExtendedAdvConfigComplete = function(schema, config){
      return CS4514.ownsSchema(schema) ? CS4514.complete(config) : cs4514PreviousComplete(schema, config);
    };
    const cs4514PreviousResolve = resolveAdvDisadvEffect;
    resolveAdvDisadvEffect = function(name, config){
      return CS4514.ownsSchema(advConfigSchemaFor(name)) ? CS4514.resolve(config) : cs4514PreviousResolve(name, config);
    };
    const cs4514PreviousRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){ if(!CS4514.refresh(div)) cs4514PreviousRefresh(div); };
    const cs4514PreviousOpen = openExtendedAdvConfigModal;
    openExtendedAdvConfigModal = function(div, schema){ return CS4514.open(div, schema) || cs4514PreviousOpen(div, schema); };
    const cs4514PreviousConfirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){ return CS4514.confirm() || cs4514PreviousConfirm(); };
  }
