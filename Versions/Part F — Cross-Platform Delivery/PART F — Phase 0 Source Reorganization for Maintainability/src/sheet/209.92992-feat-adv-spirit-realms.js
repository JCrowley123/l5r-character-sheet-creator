  // ========= PART I FEATURE 4.5.24: TOUCH OF THE SPIRIT REALMS =========
  // A13 (Core pp.154-155), to the owner's rulings of 23 September 2026 (audit "A13 decisions").
  // One realm is saved on the row (Yomi adds one School Skill; Jigoku may carry a player-set Lost
  // flag). Prices: 5, Toshigoku 8, Yomi 7; a Shugenja pays 1 less -- 4, 7 and 6. The book prints
  // only "Shugenja pay 4", so 7 and 6 are this sheet's reading, and the row says to confirm them
  // with the GM.
  //   * Automatic, through the adv-config seat: Chikushudo +1k1 on Animal Handling; Yomi +1k0 on
  //     the chosen School Skill; Jigoku adds the Taint Rank field (twice when Lost) to attack rolls
  //     and to Skill and Trait rolls using a Physical Trait -- never damage.
  //   * Declared per roll (4.5.15, unticked every roll): Sakkaku +1k1 lying with Sincerity;
  //     Meido +2k0 on a Contested Roll against social manipulation; Tengoku +2k0 on an Earth Ring
  //     Roll resisting Shadowlands Taint.
  //   * Reminders: Gaki-do, Maigo no Musha, Toshigoku, Yume-do.
  const ADV_SPIRIT_REALMS_ENABLED = true;

  const TR4524 = (function(){
    const api = {};
    api.NAME = 'Touch of the Spirit Realms';
    api.TYPE = 'spiritRealmTouch';
    api.PROVIDER = 'spirit-realms';
    api.PHYSICAL = ['Agility', 'Reflexes', 'Stamina', 'Strength'];
    // Core pp.154-155, printed order: base XP, the rule, how the sheet applies it.
    api.REALMS = {
      Chikushudo:{base:5, rule:'+1k1 on all Animal Handling rolls.', how:'Added automatically to Animal Handling rolls.'},
      'Gaki-do':{base:5, rule:'When you resolve an attack that kills an opponent, immediately regain 5 Wounds.', how:'Reminder: heal the 5 Wounds yourself.'},
      Jigoku:{base:5, rule:'Requires Shadowlands Taint. Add your Taint Rank to attack rolls and to Skill and Trait rolls using a Physical Trait; if you are Lost, add twice your Taint Rank.', how:'Added automatically from your Taint Rank; tick Lost when you are.'},
      'Maigo no Musha':{base:5, rule:'When you are awarded more than 3 points of Glory, gain one more.', how:'Reminder: add the extra Glory yourself.'},
      Meido:{base:5, rule:'+2k0 on Contested Rolls against social manipulation, such as Courtier.', how:'Tick it in the roll preview when it applies.'},
      Sakkaku:{base:5, rule:'+1k1 on Sincerity (Deceit) rolls.', how:'Tick it in the preview of a Sincerity roll when you are lying.'},
      Tengoku:{base:5, rule:'+2k0 on Earth Ring Rolls to resist Shadowlands Taint.', how:'Tick it in the preview of an Earth Ring Roll when you resist Taint.'},
      Toshigoku:{base:8, rule:'A Move Action taken to get into attack range moves you 5 extra feet.', how:'Reminder: add the 5 feet yourself.'},
      Yomi:{base:7, rule:'Choose one School Skill; +1k0 on Skill Rolls using it.', how:'Added automatically to rolls of your chosen School Skill.'},
      'Yume-do':{base:5, rule:'Four hours of rest recover all your expended Void Points, instead of a full night’s rest.', how:'Reminder: restore your Void Points yourself.'},
    };
    api.GM_NOTE = 'The book gives only “Shugenja pay 4”; this sheet reads that as 1 XP less, so a Shugenja pays 7 for Toshigoku and 6 for Yomi. You may want to confirm this price with your GM.';

    api.enabled = function(){ return ADV_SPIRIT_REALMS_ENABLED && ADV_CONFIG_ENABLED; };
    api.is = function(name){ return normalizeAdvName(name) === normalizeAdvName(api.NAME); };
    api.ownsSchema = function(schema){ return !!schema && schema.tr4524 === true && api.is(schema.name); };
    api.realm = function(name){ return Object.prototype.hasOwnProperty.call(api.REALMS, name) ? api.REALMS[name] : null; };
    api.shugenja = function(){ return typeof characterCasterLock === 'function' && characterCasterLock() === 'shugenja'; };
    api.price = function(realm){
      const r = api.realm(realm);
      return r ? r.base - (api.shugenja() ? 1 : 0) : null;
    };
    api.interpreted = function(realm){ return api.shugenja() && api.realm(realm) && api.realm(realm).base !== 5; };
    api.norm = function(s){ return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase(); };
    // The character's School Skills: each School's named Skills, and any row ticked as one.
    api.schoolSkills = function(){
      const out = new Set();
      const schools = typeof getSchoolsList === 'function' ? getSchoolsList() : [];
      schools.forEach(function(s){
        if(typeof schoolConcreteSkillNames === 'function') schoolConcreteSkillNames(s.name).forEach(function(n){ out.add(n); });
      });
      document.querySelectorAll('#skillsBody tr').forEach(function(row){
        const tick = row.querySelector('.sk-school'), name = row.querySelector('.sk-name');
        if(tick && tick.checked && name && name.value.trim()) out.add(name.value.trim());
      });
      return Array.from(out).filter(Boolean).sort();
    };
    api.isSchoolSkill = function(skill){
      return api.schoolSkills().some(function(s){ return api.norm(s) === api.norm(skill); });
    };
    api.taint = function(){
      const el = document.getElementById('f_taint');
      const value = el ? parseInt(el.value, 10) : NaN;
      return Number.isFinite(value) && value > 0 ? value : 0;
    };

    api.complete = function(config){
      if(!api.enabled() || !config || typeof config !== 'object' || Array.isArray(config)) return false;
      if(config.type !== api.TYPE || config.revision !== 1 || !api.realm(config.realm)) return false;
      const allowed = ['type', 'revision', 'value', 'realm'].concat(config.realm === 'Yomi' ? ['skill'] : config.realm === 'Jigoku' ? ['lost'] : []);
      if(Object.keys(config).some(function(k){ return allowed.indexOf(k) === -1; })) return false;
      if(config.realm === 'Yomi' && (typeof config.skill !== 'string' || !config.skill.trim())) return false;
      if('lost' in config && typeof config.lost !== 'boolean') return false;
      return true;
    };
    api.resolve = function(config){
      if(!api.complete(config)) return null;
      return {effect:'tr4524Realm', entryName:api.NAME, cost:api.price(config.realm), realm:config.realm,
        skill:config.skill || '', lost:config.lost === true};
    };
    // Configured realms on the Advantage list.
    api.active = function(){
      const out = [];
      if(!api.enabled()) return out;
      document.querySelectorAll('#advList .entry').forEach(function(div){
        const name = div.querySelector('.en-name');
        if(!name || !api.is(name.value)) return;
        const config = readAdvConfig(div);
        if(api.complete(config)) out.push({div:div, config:config});
      });
      return out;
    };
    api.first = function(realm){ return api.active().find(function(a){ return a.config.realm === realm; }) || null; };

    // ---------- Automatic effects (adv-config seat) ----------
    api.skillIs = function(context, skill){
      const have = api.norm(context.skillName), want = api.norm(skill);
      return !!want && (have === want || have.indexOf(want + ' (') === 0);
    };
    api.jigokuBonus = function(entry){
      const taint = api.taint();
      return taint ? taint * (entry.config.lost ? 2 : 1) : 0;
    };
    api.jigokuApplies = function(context){
      if(context.kind === ROLL_KINDS.ATTACK) return true;
      return (context.kind === ROLL_KINDS.SKILL || context.kind === ROLL_KINDS.TRAIT) && api.PHYSICAL.indexOf(context.traitName) !== -1;
    };
    api.modifiers = function(context){
      if(!api.enabled() || !ADV_CONFIG_ROLL_EFFECTS_ENABLED || !context || context.kind === ROLL_KINDS.DAMAGE) return [];
      const out = [];
      const skillRoll = context.kind === ROLL_KINDS.SKILL || context.kind === ROLL_KINDS.ATTACK;
      if(context.kind === ROLL_KINDS.SKILL && api.skillIs(context, 'Animal Handling') && api.first('Chikushudo')){
        out.push({source:'adv-config', label:'Touch of the Spirit Realms (Chikushudo)', rolledDelta:1, keptDelta:1, note:'Animal Handling'});
      }
      const yomi = api.first('Yomi');
      if(yomi && skillRoll && api.skillIs(context, yomi.config.skill) && api.isSchoolSkill(yomi.config.skill)){
        out.push({source:'adv-config', label:'Touch of the Spirit Realms (Yomi)', rolledDelta:1, keptDelta:0, note:yomi.config.skill});
      }
      const jigoku = api.first('Jigoku');
      if(jigoku && api.jigokuApplies(context)){
        const bonus = api.jigokuBonus(jigoku);
        if(bonus) out.push({source:'adv-config', label:'Touch of the Spirit Realms (Jigoku)', totalDelta:bonus,
          note:(jigoku.config.lost ? 'Lost: twice Taint Rank ' : 'Taint Rank ') + api.taint()});
      }
      return out;
    };

    // ---------- Per-roll declarations (4.5.15 registry) ----------
    api.resistKind = function(context){
      return !!context && [ROLL_KINDS.SKILL, ROLL_KINDS.TRAIT, ROLL_KINDS.RING, ROLL_KINDS.MANUAL].indexOf(context.kind) !== -1;
    };
    api.DECLARATIONS = {
      sakkaku:{realm:'Sakkaku', label:'Lying — Sincerity (Deceit) — +1k1', note:'Touch of the Spirit Realms (Sakkaku): only when this Sincerity roll is a lie.',
        when:function(c){ return !!c && c.kind === ROLL_KINDS.SKILL && api.skillIs(c, 'Sincerity'); }, mod:{rolledDelta:1, keptDelta:1, totalDelta:0}},
      meido:{realm:'Meido', label:'Contested Roll against social manipulation — +2k0', note:'Touch of the Spirit Realms (Meido): for example against Courtier.',
        when:function(c){ return api.resistKind(c); }, mod:{rolledDelta:2, keptDelta:0, totalDelta:0}},
      tengoku:{realm:'Tengoku', label:'Resisting Shadowlands Taint — +2k0', note:'Touch of the Spirit Realms (Tengoku): Earth Ring Rolls only.',
        when:function(c){ return !!c && c.kind === ROLL_KINDS.RING && c.ringName === 'Earth'; }, mod:{rolledDelta:2, keptDelta:0, totalDelta:0}},
    };
    api.provider = {
      label:api.NAME,
      offers:function(context){
        if(!api.enabled()) return [];
        return Object.keys(api.DECLARATIONS).filter(function(k){
          const d = api.DECLARATIONS[k]; return api.first(d.realm) && d.when(context);
        }).map(function(k){ return {key:k, label:api.DECLARATIONS[k].label, note:api.DECLARATIONS[k].note}; });
      },
      modifiers:function(context, keys){
        return keys.filter(function(k){ const d = api.DECLARATIONS[k]; return d && api.first(d.realm) && d.when(context); })
          .map(function(k){ const d = api.DECLARATIONS[k];
            return Object.assign({label:'Touch of the Spirit Realms (' + d.realm + ')', note:'Declared for this roll'}, d.mod); });
      },
    };

    // ---------- Row and picker ----------
    api.info = function(realm){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tr4524-info';
      button.textContent = 'i';
      button.setAttribute('aria-label', api.NAME + ' information');
      button.addEventListener('click', function(){
        populateInfoOverlay(api.NAME, 'Reference — Core pp.154–155',
          (realm ? 'Your realm: ' + realm + '\n\n' : '') +
          'Choose one Spirit Realm. Cost 5 XP (Toshigoku 8, Yomi 7); a Shugenja pays 4, and by this sheet’s reading 7 for Toshigoku and 6 for Yomi. ' +
          'The book does not print those two Shugenja prices; you may want to confirm them with your GM.\n\n' +
          Object.keys(api.REALMS).map(function(k){ const r = api.REALMS[k];
            return k + ' (' + api.price(k) + ' XP) — ' + r.rule + ' ' + r.how; }).join('\n\n'));
      });
      return button;
    };
    api.clearRenamed = function(div, name){
      const own = div.querySelector('.tr4524-row');
      if(own && own.dataset.tr4524Name !== normalizeAdvName(name)){ delete div.dataset.advConfig; own.remove(); return; }
      const foreign = api.is(name) && div.querySelector('.adv-config-row:not(.tr4524-row)');
      if(foreign){ delete div.dataset.advConfig; foreign.remove(); }
    };
    api.setLost = function(div, lost){
      const config = readAdvConfig(div);
      if(!api.complete(config) || config.realm !== 'Jigoku') return false;
      writeAdvConfig(div, api.TYPE, Object.assign({}, config, {lost:!!lost}));
      recalcAll();
      return true;
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
      else if(!valid) warning = 'Choose a Spirit Realm';
      // Only a configured row is priced: the price depends on the realm.
      else if(cost) cost.value = api.price(config.realm);
      const row = advConfigRowFor(div);
      row.dataset.tr4524Name = normalizeAdvName(api.NAME);
      row.className = 'adv-config-row tr4524-row ' + (warning ? 'unconfigured' : 'configured');
      row.textContent = '';
      const lead = document.createElement('span');
      lead.className = warning ? 'adv-config-warn tr4524-warning' : 'adv-config-summary tr4524-badge';
      lead.textContent = warning || (config.realm + (config.skill ? ' — ' + config.skill : ''));
      row.appendChild(lead);
      if(wrong) return true;
      const change = document.createElement('button');
      change.type = 'button';
      change.className = 'ghost adv-config-btn';
      change.textContent = stored ? 'Change' : 'Choose…';
      change.setAttribute('aria-label', 'Configure ' + api.NAME);
      change.addEventListener('click', function(){ openAdvConfigModal(div); });
      row.appendChild(change);
      row.appendChild(api.info(valid ? config.realm : null));
      if(!valid) return true;
      const r = api.realm(config.realm);
      const reminder = document.createElement('p');
      reminder.className = 'tr4524-reminder';
      reminder.textContent = r.rule + ' ' + r.how;
      row.appendChild(reminder);
      const notes = [];
      if(config.realm === 'Jigoku'){
        const taint = api.taint();
        if(!taint) notes.push(['tr4524-flag', 'Requires Shadowlands Taint: your Taint Rank is 0, so nothing is added.']);
        else notes.push(['tr4524-note', 'Adding ' + api.jigokuBonus({config:config}) + ' (Taint Rank ' + taint + (config.lost ? ', doubled: Lost' : '') + ').']);
      }
      if(config.realm === 'Yomi' && !api.isSchoolSkill(config.skill)){
        notes.push(['tr4524-flag', config.skill + ' is not one of your School Skills now, so the +1k0 is not added. Choose another, or restore that School Skill.']);
      }
      if(api.interpreted(config.realm)) notes.push(['tr4524-note tr4524-gm', api.GM_NOTE]);
      notes.forEach(function(n){
        const p = document.createElement('p');
        p.className = n[0];
        p.textContent = n[1];
        row.appendChild(p);
      });
      if(config.realm === 'Jigoku'){
        const label = document.createElement('label');
        label.className = 'tr4524-lost';
        const box = document.createElement('input');
        box.type = 'checkbox';
        box.checked = config.lost === true;
        box.addEventListener('change', function(){ api.setLost(div, box.checked); });
        const text = document.createElement('span');
        text.textContent = 'Lost (twice your Taint Rank)';
        label.appendChild(box); label.appendChild(text);
        row.appendChild(label);
      }
      return true;
    };
    api.syncSkillField = function(){
      const grid = document.getElementById('advConfigGrid');
      const picked = grid && grid.querySelector('input[name="tr4524Realm"]:checked');
      const field = grid && grid.querySelector('.tr4524-skill');
      if(field) field.hidden = !picked || picked.value !== 'Yomi';
    };
    api.open = function(div, schema){
      if(!api.enabled() || !api.ownsSchema(schema)) return false;
      if(div.parentElement && div.parentElement.id === 'disadvList'){ setStatus('Touch of the Spirit Realms belongs in Advantages.'); return true; }
      const config = readAdvConfig(div), valid = api.complete(config);
      advConfigTargetEntry = div;
      advConfigExtendedModal = {kind:'tr4524', schema:schema};
      document.getElementById('advConfigTitle').textContent = api.NAME;
      document.getElementById('advConfigSubtitle').textContent = 'Choose one Spirit Realm';
      const note = document.getElementById('advConfigNote');
      note.textContent = (div.dataset.advConfig && !valid ? 'The saved setting is unsupported. Confirming replaces it. ' : '') +
        (api.shugenja() ? 'Shugenja price shown. ' + api.GM_NOTE : 'A Shugenja pays 1 XP less for every realm.');
      note.style.display = '';
      const grid = document.getElementById('advConfigGrid');
      grid.innerHTML = '<fieldset class="tr4524-picker"><legend class="tr4524-legend">Spirit Realm</legend></fieldset>' +
        '<div class="tr4524-skill" hidden><label class="tr4524-skill-label" for="tr4524Skill">School Skill for Yomi</label>' +
        '<select id="tr4524Skill" class="tr4524-skill-select"></select></div><p class="tr4524-error" role="alert" hidden></p>';
      const set = grid.querySelector('.tr4524-picker');
      Object.keys(api.REALMS).forEach(function(k){
        const r = api.REALMS[k];
        const label = document.createElement('label');
        label.className = 'tr4524-option';
        const radio = document.createElement('input');
        radio.type = 'radio'; radio.name = 'tr4524Realm'; radio.value = k;
        radio.checked = valid && config.realm === k;
        radio.addEventListener('change', api.syncSkillField);
        const text = document.createElement('span');
        const strong = document.createElement('b');
        strong.textContent = k;
        text.appendChild(strong);
        text.appendChild(document.createTextNode(' — ' + api.price(k) + ' XP' + (api.interpreted(k) ? ' (confirm with your GM)' : '') + '. ' + r.rule));
        label.appendChild(radio); label.appendChild(text);
        set.appendChild(label);
      });
      const select = grid.querySelector('#tr4524Skill');
      const skills = api.schoolSkills();
      const blank = document.createElement('option');
      blank.value = ''; blank.textContent = skills.length ? 'Choose a School Skill…' : 'No School Skills found';
      select.appendChild(blank);
      skills.forEach(function(s){ const o = document.createElement('option'); o.value = s; o.textContent = s; select.appendChild(o); });
      if(valid && config.skill && skills.indexOf(config.skill) !== -1) select.value = config.skill;
      api.syncSkillField();
      grid.appendChild(api.info(valid ? config.realm : null));
      document.getElementById('advConfigConfirm').textContent = 'Confirm';
      document.getElementById('advConfigModalOverlay').style.display = 'flex';
      const focus = grid.querySelector('input:checked') || grid.querySelector('input');
      if(focus) focus.focus({preventScroll:true});
      return true;
    };
    api.confirm = function(){
      const state = advConfigExtendedModal;
      if(!api.enabled() || !state || state.kind !== 'tr4524') return false;
      const div = advConfigTargetEntry, name = div && div.querySelector('.en-name');
      if(!div || !div.isConnected || !name || !api.is(name.value)){
        closeAdvConfigModal(); setStatus('The entry changed; open its configuration again.'); return true;
      }
      const error = document.querySelector('#advConfigGrid .tr4524-error');
      const fail = function(message){ error.textContent = message; error.hidden = false; setStatus(message); return true; };
      const picked = document.querySelector('#advConfigGrid input[name="tr4524Realm"]:checked');
      if(!picked || !api.realm(picked.value)) return fail('Choose a Spirit Realm before confirming.');
      const config = {type:api.TYPE, revision:1, realm:picked.value, value:picked.value};
      if(picked.value === 'Yomi'){
        const skill = document.getElementById('tr4524Skill').value;
        if(!skill || !api.isSchoolSkill(skill)) return fail('Choose one of your School Skills for Yomi.');
        config.skill = skill;
      }
      if(picked.value === 'Jigoku'){
        const before = readAdvConfig(div);
        config.lost = !!(api.complete(before) && before.realm === 'Jigoku' && before.lost === true);
      }
      return commitExtendedAdvConfig(config, api.NAME + ': ' + picked.value + (config.skill ? ' (' + config.skill + ')' : '') + '.');
    };
    return api;
  })();

  if(TR4524.enabled()){
    registerAdvConfigSchema(TR4524.NAME, {type:TR4524.TYPE, effect:'tr4524Realm', tr4524:true,
      title:TR4524.NAME, prompt:'Choose one Spirit Realm.'});
    const tr4524PreviousComplete = isExtendedAdvConfigComplete;
    isExtendedAdvConfigComplete = function(schema, config){
      return TR4524.ownsSchema(schema) ? TR4524.complete(config) : tr4524PreviousComplete(schema, config);
    };
    const tr4524PreviousResolve = resolveAdvDisadvEffect;
    resolveAdvDisadvEffect = function(name, config){
      return TR4524.ownsSchema(advConfigSchemaFor(name)) ? TR4524.resolve(config) : tr4524PreviousResolve(name, config);
    };
    const tr4524PreviousRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){ if(!TR4524.refresh(div)) tr4524PreviousRefresh(div); };
    const tr4524PreviousOpen = openExtendedAdvConfigModal;
    openExtendedAdvConfigModal = function(div, schema){ return TR4524.open(div, schema) || tr4524PreviousOpen(div, schema); };
    const tr4524PreviousConfirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){ return TR4524.confirm() || tr4524PreviousConfirm(); };
    const tr4524PreviousModifiers = advConfigExtendedRollModifiers;
    advConfigExtendedRollModifiers = function(context){
      return (tr4524PreviousModifiers(context) || []).concat(TR4524.modifiers(context));
    };
    // Declared dependency on the roll declaration registry (Feature 4.5.15); without it the
    // realm is still recorded, priced and automatic, and nothing is offered at roll time.
    if(typeof RD4515 === 'object' && RD4515) RD4515.register(TR4524.PROVIDER, TR4524.provider);
  }
