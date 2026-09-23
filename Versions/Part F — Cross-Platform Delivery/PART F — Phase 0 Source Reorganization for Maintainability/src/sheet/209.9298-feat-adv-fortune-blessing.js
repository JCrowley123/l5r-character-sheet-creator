  // ========= PART I FEATURE 4.5.21: SEVEN FORTUNES' BLESSING =========
  // A01 (Core pp.153-154), built to the design agreed with the owner on 23 September 2026 and
  // recorded in the audit's "A01 decisions". One Fortune is saved on the row (plus a Lore Skill
  // for Fukurokujin only). Three Fortunes apply automatically through the existing adv-config
  // seat; four are per-roll declarations through the 4.5.15 registry, unticked on every roll and
  // never saved; Hotei also gets a Contested Void Roll button on its row.
  //
  //   Bishamon    +1k0 on Strength TRAIT rolls only (not Skills using Strength, not damage)
  //   Daikoku     +1k1 on Commerce Skill rolls
  //   Fukurokujin +1k1 on the chosen Lore Skill
  //   Benten      declared: persuading (not coercing) on a Social Skill roll, +0k1
  //   Ebisu       declared: with a non-samurai citizen on a Social Skill roll, +1k1
  //   Jurojin     declared: resisting poison or disease, +2k0, on whatever roll the GM calls
  //   Hotei       declared: +10 when an effect that would take your Void already calls for a
  //               Contested Roll; otherwise the row's Contested Void Roll button
  //
  // Deferred by the owner for later review, and deliberately NOT built: flagging a second
  // Blessing row (Core p.148's family rule), and any purchase-history treatment of changing the
  // Fortune. Interim: every configured row is priced by its current Fortune and none is flagged.
  const ADV_FORTUNE_BLESSING_ENABLED = true;

  const FB4521 = (function(){
    const api = {};
    api.NAME = 'Seven Fortunes’ Blessing';
    api.TYPE = 'fortuneBlessing';
    api.PROVIDER = 'fortune-blessing';
    // Core pp.153-154 as recorded in SOURCE-CORE-PREPARATION.md (A01). Printed order.
    api.FORTUNES = {
      Benten:{base:4, clans:['Crane'], title:'Fortune of Romantic Love',
        rule:'+0k1 on a Social Skill Roll made to persuade someone. Persuasion only — not coercion.',
        how:'In the roll preview of a Social Skill roll, tick "Persuading" when it applies.'},
      Bishamon:{base:5, clans:['Crab', 'Lion'], title:'Fortune of Strength',
        rule:'+1k0 on Strength Trait Rolls. Also: declaring and making three successful Raises for Increased Damage on an attack earns one additional Raise; Free Raises do not count.',
        how:'The +1k0 is applied to Strength Trait Rolls automatically. The extra Raise is yours to claim.'},
      Daikoku:{base:4, clans:['Mantis'], title:'Fortune of Wealth',
        rule:'+1k1 on all Commerce Skill Rolls.',
        how:'Applied to Commerce Skill rolls automatically.'},
      Ebisu:{base:4, clans:['Unicorn'], title:'Fortune of Honest Work',
        rule:'+1k1 on Social Skill Rolls made with citizens of Rokugan who are not samurai.',
        how:'In the roll preview of a Social Skill roll, tick "With a non-samurai citizen" when it applies.'},
      Fukurokujin:{base:4, clans:['Dragon', 'Phoenix'], title:'Fortune of Wisdom',
        rule:'Choose one Lore Skill when you buy this. +1k1 on Skill Rolls using that Lore Skill.',
        how:'Applied to rolls of your chosen Lore Skill automatically.'},
      Hotei:{base:4, clans:[], title:'Fortune of Contentment',
        rule:'When any effect would make you lose Void Points, whoever caused it must first beat you in a Contested Void Roll. If the effect already calls for a Contested Roll, your roll gets +10 instead.',
        how:'Use the row\'s Contested Void Roll button, or tick "+10 (Hotei)" in the preview of a Contested Roll the effect already calls for. Your own Void spending is not affected.'},
      Jurojin:{base:4, clans:['Scorpion'], title:'Fortune of Longevity',
        rule:'+2k0 on rolls to resist the effects of a disease or poison.',
        how:'In the roll preview of the resistance roll the GM calls for, tick "Resisting poison or disease".'},
    };
    api.enabled = function(){ return ADV_FORTUNE_BLESSING_ENABLED && ADV_CONFIG_ENABLED; };
    api.is = function(name){ return normalizeAdvName(name) === normalizeAdvName(api.NAME); };
    api.ownsSchema = function(schema){ return !!schema && schema.fb4521 === true && api.is(schema.name); };
    api.possessive = function(fortune){ return fortune + '’s Blessing'; };
    api.clan = function(){ return normalizeAdvName(advConfigCharacterClan()).replace(/\s+clan$/, ''); };
    api.discounted = function(fortune){
      const f = api.FORTUNES[fortune], clan = api.clan();
      return !!f && f.clans.some(function(c){ return normalizeAdvName(c) === clan; });
    };
    api.price = function(fortune){ const f = api.FORTUNES[fortune]; return f ? f.base - (api.discounted(fortune) ? 1 : 0) : null; };
    api.priceText = function(fortune){
      const f = api.FORTUNES[fortune];
      return f.base + ' XP' + (f.clans.length ? ', ' + (f.base - 1) + ' for ' + f.clans.join(' or ') : '');
    };

    // A Lore Skill is written "Lore: <subject>". Stored in one canonical spacing; matched without
    // regard to case, spacing around the colon, or an Emphasis in parentheses.
    api.LORE_RE = /^lore\s*:\s*\S/i;
    api.canonLore = function(text){
      const s = String(text || '').replace(/\s+/g, ' ').trim();
      return api.LORE_RE.test(s) ? 'Lore: ' + s.replace(/^lore\s*:\s*/i, '') : '';
    };
    api.loreKey = function(text){
      return api.canonLore(String(text || '').replace(/\(.*$/, '')).toLowerCase();
    };
    api.characterLores = function(){
      const out = [];
      document.querySelectorAll('#skillsBody .sk-name').forEach(function(input){
        const lore = api.canonLore(input.value);
        if(lore && out.indexOf(lore) === -1) out.push(lore);
      });
      return out;
    };

    api.complete = function(config){
      if(!api.enabled() || !config || typeof config !== 'object' || Array.isArray(config)) return false;
      if(config.type !== api.TYPE || config.revision !== 1) return false;
      if(!Object.prototype.hasOwnProperty.call(api.FORTUNES, config.fortune)) return false;
      const allowed = config.fortune === 'Fukurokujin' ? ['type', 'revision', 'value', 'fortune', 'lore'] : ['type', 'revision', 'value', 'fortune'];
      if(Object.keys(config).some(function(k){ return allowed.indexOf(k) === -1; })) return false;
      return config.fortune !== 'Fukurokujin' || (typeof config.lore === 'string' && api.canonLore(config.lore) === config.lore);
    };
    api.resolve = function(config){
      if(!api.complete(config)) return null;
      return {effect:'fb4521Blessing', entryName:api.NAME, cost:api.price(config.fortune), fortune:config.fortune, lore:config.lore || ''};
    };
    // Configured Blessings on the Advantage list, one per Fortune (and Lore Skill).
    api.active = function(){
      const out = [];
      if(!api.enabled()) return out;
      document.querySelectorAll('#advList .entry').forEach(function(div){
        const name = div.querySelector('.en-name');
        if(!name || !api.is(name.value)) return;
        const config = readAdvConfig(div);
        if(!api.complete(config)) return;
        const key = config.fortune + '|' + (config.lore || '').toLowerCase();
        if(!out.some(function(a){ return a.key === key; })) out.push({key:key, fortune:config.fortune, lore:config.lore || ''});
      });
      return out;
    };
    api.has = function(fortune){ return api.active().some(function(a){ return a.fortune === fortune; }); };

    // ---------- Automatic effects ----------
    api.skillBase = function(name){ return String(name || '').replace(/[(:].*$/, '').replace(/\s+/g, ' ').trim().toLowerCase(); };
    api.modifiers = function(context){
      if(!api.enabled() || !ADV_CONFIG_ROLL_EFFECTS_ENABLED || !context) return [];
      const out = [], active = api.active();
      const hit = function(f){ return active.some(function(a){ return a.fortune === f; }); };
      if(context.kind === ROLL_KINDS.TRAIT && context.traitName === 'Strength' && hit('Bishamon')){
        out.push({source:'adv-config', label:api.possessive('Bishamon'), rolledDelta:1, keptDelta:0, note:'Strength Trait Roll'});
      }
      if(context.kind === ROLL_KINDS.SKILL && api.skillBase(context.skillName) === 'commerce' && hit('Daikoku')){
        out.push({source:'adv-config', label:api.possessive('Daikoku'), rolledDelta:1, keptDelta:1, note:'Commerce Skill Roll'});
      }
      if(context.kind === ROLL_KINDS.SKILL && api.loreKey(context.skillName)){
        const lore = active.find(function(a){ return a.fortune === 'Fukurokujin' && a.lore.toLowerCase() === api.loreKey(context.skillName); });
        if(lore) out.push({source:'adv-config', label:api.possessive('Fukurokujin'), rolledDelta:1, keptDelta:1, note:lore.lore});
      }
      return out;
    };

    // ---------- Per-roll declarations (4.5.15 registry) ----------
    // The Social Skill list is Feature 4.5.2's authoritative one when present (guarded); a
    // specialization or Emphasis of a listed Skill counts. Without it, any Skill roll is offered.
    api.social = function(context){
      if(!context || context.kind !== ROLL_KINDS.SKILL) return false;
      const list = typeof D45 === 'object' && D45 && Array.isArray(D45.socialSkills) ? D45.socialSkills : null;
      if(!list) return true;
      const base = api.skillBase(context.skillName);
      return list.some(function(s){ return String(s).toLowerCase() === base; });
    };
    api.resistKind = function(context){
      return !!context && [ROLL_KINDS.SKILL, ROLL_KINDS.TRAIT, ROLL_KINDS.RING, ROLL_KINDS.MANUAL].indexOf(context.kind) !== -1;
    };
    api.DECLARATIONS = {
      benten:{fortune:'Benten', label:'Persuading (not coercing) — +0k1', note:'Benten’s Blessing: only when this Social roll is made to persuade.',
        when:function(c){ return api.social(c); }, mod:{rolledDelta:0, keptDelta:1, totalDelta:0}},
      ebisu:{fortune:'Ebisu', label:'With a non-samurai citizen of Rokugan — +1k1', note:'Ebisu’s Blessing: only when you are dealing with a citizen who is not samurai.',
        when:function(c){ return api.social(c); }, mod:{rolledDelta:1, keptDelta:1, totalDelta:0}},
      jurojin:{fortune:'Jurojin', label:'Resisting poison or disease — +2k0', note:'Jurojin’s Blessing: tick on the resistance roll the GM calls for.',
        when:function(c){ return api.resistKind(c); }, mod:{rolledDelta:2, keptDelta:0, totalDelta:0}},
      hotei:{fortune:'Hotei', label:'Contested Roll against an effect that would take your Void Points — +10', note:'Hotei’s Blessing: only when that effect already calls for a Contested Roll.',
        when:function(c){ return api.resistKind(c); }, mod:{rolledDelta:0, keptDelta:0, totalDelta:10}},
    };
    api.provider = {
      label:api.NAME,
      offers:function(context){
        if(!api.enabled()) return [];
        return Object.keys(api.DECLARATIONS).filter(function(k){
          const d = api.DECLARATIONS[k]; return api.has(d.fortune) && d.when(context);
        }).map(function(k){ return {key:k, label:api.DECLARATIONS[k].label, note:api.DECLARATIONS[k].note}; });
      },
      modifiers:function(context, keys){
        return keys.filter(function(k){ return api.DECLARATIONS[k] && api.has(api.DECLARATIONS[k].fortune) && api.DECLARATIONS[k].when(context); })
          .map(function(k){ const d = api.DECLARATIONS[k];
            return Object.assign({label:api.possessive(d.fortune), note:'Declared for this roll'}, d.mod); });
      },
    };
    api.contestedVoidRoll = function(){
      const rank = typeof getRingValueByName === 'function' ? getRingValueByName('Void') : 0;
      return rollWithModifiers('Contested Void Roll — ' + api.possessive('Hotei'),
        makeRollContext(ROLL_KINDS.RING, {ringName:'Void', ringValue:rank}), rank, rank);
    };

    // ---------- Row and modal ----------
    api.info = function(fortune){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'fb4521-info';
      button.textContent = 'i';
      button.setAttribute('aria-label', api.NAME + ' information');
      button.addEventListener('click', function(){
        populateInfoOverlay(api.NAME, 'Reference — Core pp.153–154',
          (fortune ? 'Your Fortune: ' + api.possessive(fortune) + '\n\n' : '') +
          'Choose one of the Seven Fortunes. The Clans listed for a Fortune buy it for 1 point less.\n\n' +
          Object.keys(api.FORTUNES).map(function(k){ const f = api.FORTUNES[k];
            return api.possessive(k) + ' (' + api.priceText(k) + ') — ' + f.rule; }).join('\n\n'));
      });
      return button;
    };
    api.clearRenamed = function(div, name){
      const own = div.querySelector('.fb4521-row');
      if(own && own.dataset.fb4521Name !== normalizeAdvName(name)){ delete div.dataset.advConfig; own.remove(); return; }
      const foreign = api.is(name) && div.querySelector('.adv-config-row:not(.fb4521-row)');
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
      else if(!valid) warning = 'Choose a Fortune';
      // Only a configured row is priced: an unconfigured one keeps whatever cost it carries,
      // because its price depends on the Fortune not yet chosen.
      else if(cost) cost.value = api.price(config.fortune);
      const row = advConfigRowFor(div);
      row.dataset.fb4521Name = normalizeAdvName(api.NAME);
      row.className = 'adv-config-row fb4521-row ' + (warning ? 'unconfigured' : 'configured');
      row.textContent = '';
      const lead = document.createElement('span');
      lead.className = warning ? 'adv-config-warn fb4521-warning' : 'adv-config-summary fb4521-badge';
      lead.textContent = warning || (api.possessive(config.fortune) + (config.lore ? ' — ' + config.lore : ''));
      row.appendChild(lead);
      if(wrong) return true;
      const change = document.createElement('button');
      change.type = 'button';
      change.className = 'ghost adv-config-btn';
      change.textContent = stored ? 'Change' : 'Choose…';
      change.setAttribute('aria-label', 'Configure ' + api.NAME);
      change.addEventListener('click', function(){ openAdvConfigModal(div); });
      row.appendChild(change);
      row.appendChild(api.info(valid ? config.fortune : null));
      if(valid && config.fortune === 'Hotei'){
        const roll = document.createElement('button');
        roll.type = 'button';
        roll.className = 'ghost adv-config-btn fb4521-hotei-roll';
        roll.textContent = 'Contested Void Roll';
        roll.setAttribute('aria-label', 'Roll a Contested Void Roll for Hotei’s Blessing');
        roll.addEventListener('click', function(){ api.contestedVoidRoll(); });
        row.appendChild(roll);
      }
      if(valid){
        const f = api.FORTUNES[config.fortune];
        const reminder = document.createElement('p');
        reminder.className = 'fb4521-reminder';
        reminder.textContent = f.how + (api.discounted(config.fortune) ? ' ' + api.price(config.fortune) + ' XP: ' + f.clans.join(' or ') + ' price.' : '');
        row.appendChild(reminder);
      }
      return true;
    };
    api.syncLoreField = function(){
      const grid = document.getElementById('advConfigGrid');
      const picked = grid && grid.querySelector('input[name="fb4521Fortune"]:checked');
      const field = grid && grid.querySelector('.fb4521-lore');
      if(field) field.hidden = !picked || picked.value !== 'Fukurokujin';
    };
    api.open = function(div, schema){
      if(!api.enabled() || !api.ownsSchema(schema)) return false;
      if(div.parentElement && div.parentElement.id === 'disadvList'){ setStatus('Seven Fortunes’ Blessing belongs in Advantages.'); return true; }
      const config = readAdvConfig(div), valid = api.complete(config);
      advConfigTargetEntry = div;
      advConfigExtendedModal = {kind:'fb4521', schema:schema};
      document.getElementById('advConfigTitle').textContent = api.NAME;
      document.getElementById('advConfigSubtitle').textContent = 'Choose one of the Seven Fortunes';
      const note = document.getElementById('advConfigNote');
      note.textContent = (div.dataset.advConfig && !valid ? 'The saved setting is unsupported. Confirming replaces it. ' : '') +
        'The Clans listed for a Fortune pay 1 XP less. Open "Rule" on any Fortune to read what it does.';
      note.style.display = '';
      const grid = document.getElementById('advConfigGrid');
      grid.innerHTML = '<fieldset class="fb4521-picker"><legend class="fb4521-legend">Fortune</legend></fieldset>' +
        '<div class="fb4521-lore" hidden><label class="fb4521-lore-label" for="fb4521Lore">Lore Skill for Fukurokujin</label>' +
        '<input type="text" id="fb4521Lore" class="fb4521-lore-input" list="fb4521LoreList" placeholder="Lore: Theology" autocomplete="off">' +
        '<datalist id="fb4521LoreList"></datalist></div><p class="fb4521-error" role="alert" hidden></p>';
      const set = grid.querySelector('.fb4521-picker');
      Object.keys(api.FORTUNES).forEach(function(k){
        const f = api.FORTUNES[k];
        const item = document.createElement('div');
        item.className = 'fb4521-item';
        const label = document.createElement('label');
        label.className = 'fb4521-option';
        const radio = document.createElement('input');
        radio.type = 'radio'; radio.name = 'fb4521Fortune'; radio.value = k;
        radio.checked = valid && config.fortune === k;
        radio.addEventListener('change', api.syncLoreField);
        const text = document.createElement('span');
        const strong = document.createElement('b');
        strong.textContent = api.possessive(k);
        text.appendChild(strong);
        text.appendChild(document.createTextNode(' — ' + api.price(k) + ' XP' +
          (f.clans.length ? ' (' + f.clans.join(', ') + ' pay ' + (f.base - 1) + ')' : '')));
        label.appendChild(radio); label.appendChild(text);
        const rule = document.createElement('details');
        rule.className = 'fb4521-rule';
        const summary = document.createElement('summary');
        summary.textContent = 'Rule';
        const body = document.createElement('span');
        body.textContent = f.title + '. ' + f.rule + ' ' + f.how;
        rule.appendChild(summary); rule.appendChild(body);
        item.appendChild(label); item.appendChild(rule);
        set.appendChild(item);
      });
      const list = grid.querySelector('#fb4521LoreList');
      api.characterLores().forEach(function(l){ const o = document.createElement('option'); o.value = l; list.appendChild(o); });
      if(valid && config.lore) grid.querySelector('#fb4521Lore').value = config.lore;
      api.syncLoreField();
      grid.appendChild(api.info(valid ? config.fortune : null));
      document.getElementById('advConfigConfirm').textContent = 'Confirm';
      document.getElementById('advConfigModalOverlay').style.display = 'flex';
      const focus = grid.querySelector('input:checked') || grid.querySelector('input');
      if(focus) focus.focus({preventScroll:true});
      return true;
    };
    api.confirm = function(){
      const state = advConfigExtendedModal;
      if(!api.enabled() || !state || state.kind !== 'fb4521') return false;
      const div = advConfigTargetEntry, name = div && div.querySelector('.en-name');
      if(!div || !div.isConnected || !name || !api.is(name.value)){
        closeAdvConfigModal(); setStatus('The entry changed; open its configuration again.'); return true;
      }
      const error = document.querySelector('#advConfigGrid .fb4521-error');
      const fail = function(message){ error.textContent = message; error.hidden = false; setStatus(message); return true; };
      const picked = document.querySelector('#advConfigGrid input[name="fb4521Fortune"]:checked');
      if(!picked || !api.FORTUNES[picked.value]) return fail('Choose a Fortune before confirming.');
      const config = {type:api.TYPE, revision:1, fortune:picked.value, value:picked.value};
      if(picked.value === 'Fukurokujin'){
        const lore = api.canonLore(document.getElementById('fb4521Lore').value);
        if(!lore) return fail('Enter the Lore Skill as "Lore: <subject>", for example Lore: Theology.');
        config.lore = lore;
      }
      return commitExtendedAdvConfig(config, api.NAME + ': ' + api.possessive(picked.value) + (config.lore ? ' (' + config.lore + ')' : '') + '.');
    };
    return api;
  })();

  if(FB4521.enabled()){
    registerAdvConfigSchema(FB4521.NAME, {type:FB4521.TYPE, effect:'fb4521Blessing', fb4521:true,
      title:FB4521.NAME, prompt:'Choose one of the Seven Fortunes.'});
    const fb4521PreviousComplete = isExtendedAdvConfigComplete;
    isExtendedAdvConfigComplete = function(schema, config){
      return FB4521.ownsSchema(schema) ? FB4521.complete(config) : fb4521PreviousComplete(schema, config);
    };
    const fb4521PreviousResolve = resolveAdvDisadvEffect;
    resolveAdvDisadvEffect = function(name, config){
      return FB4521.ownsSchema(advConfigSchemaFor(name)) ? FB4521.resolve(config) : fb4521PreviousResolve(name, config);
    };
    const fb4521PreviousRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){ if(!FB4521.refresh(div)) fb4521PreviousRefresh(div); };
    const fb4521PreviousOpen = openExtendedAdvConfigModal;
    openExtendedAdvConfigModal = function(div, schema){ return FB4521.open(div, schema) || fb4521PreviousOpen(div, schema); };
    const fb4521PreviousConfirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){ return FB4521.confirm() || fb4521PreviousConfirm(); };
    const fb4521PreviousModifiers = advConfigExtendedRollModifiers;
    advConfigExtendedRollModifiers = function(context){
      return (fb4521PreviousModifiers(context) || []).concat(FB4521.modifiers(context));
    };
    // Declared dependency on the roll declaration registry (Feature 4.5.15); without it the
    // Fortune is still recorded, priced and automatic, and nothing is offered at roll time.
    if(typeof RD4515 === 'object' && RD4515) RD4515.register(FB4521.PROVIDER, FB4521.provider);
  }
