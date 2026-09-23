  // ========= PART I FEATURE 4.5.16: HEART OF VENGEANCE =========
  // A06. The rival Clan or faction is saved on the row; the +1k1 is never saved or left armed.
  // It is offered as a per-roll declaration through the general registry (RD4515), on Skill,
  // Trait, Ring and manual rolls only. Attacks, damage, spells and initiative are excluded.
  const ADV_HEART_VENGEANCE_ENABLED = true;

  const HV4516 = (function(){
    const api = {};
    api.NAME = 'Heart of Vengeance';
    api.TYPE = 'factionPick';
    api.PROVIDER = 'heart-vengeance';
    api.enabled = function(){ return ADV_HEART_VENGEANCE_ENABLED && ADV_CONFIG_ENABLED; };
    api.is = function(name){ return normalizeAdvName(name) === normalizeAdvName(api.NAME); };
    api.ownsSchema = function(schema){ return !!schema && schema.hv4516 === true && api.is(schema.name); };
    api.price = function(){ return normalizeAdvName(advConfigCharacterClan()) === 'spider' ? 4 : 5; };

    // Suggestions only: Core p.150 gives no closed list, and names the Brotherhood of Shinsei and
    // an Imperial family as examples. Clans and Imperial families come from the sheet's own
    // family catalogues; any other faction can be typed.
    api.suggestions = function(){
      const out = [];
      const clans = typeof FAMILY_LIBRARY === 'object' && FAMILY_LIBRARY ? Object.keys(FAMILY_LIBRARY) : [];
      clans.filter(function(c){ return c !== 'Imperial' && c !== 'Ronin'; }).forEach(function(c){ out.push(c + ' Clan'); });
      if(typeof MINOR_CLAN_LIBRARY === 'object' && MINOR_CLAN_LIBRARY){
        Object.keys(MINOR_CLAN_LIBRARY).forEach(function(c){ out.push(c + ' Clan'); });
      }
      if(clans.indexOf('Imperial') !== -1){
        FAMILY_LIBRARY.Imperial.forEach(function(f){ out.push(f[0] + ' family (Imperial)'); });
      }
      out.push('Brotherhood of Shinsei');
      return out.filter(function(v, i){ return out.indexOf(v) === i; });
    };

    api.complete = function(config){
      if(!api.enabled() || !config || typeof config !== 'object' || Array.isArray(config)) return false;
      if(config.type !== api.TYPE || config.revision !== 1) return false;
      if(Object.keys(config).some(function(k){ return ['type', 'revision', 'value', 'faction'].indexOf(k) === -1; })) return false;
      return typeof config.faction === 'string' && config.faction.trim().length > 0;
    };
    api.resolve = function(config){
      if(!api.complete(config)) return null;
      return {effect:'hv4516Declaration', entryName:api.NAME, cost:api.price(), label:config.faction.trim()};
    };

    // Configured rivals on Advantage rows, first spelling of each faction kept.
    api.rivals = function(){
      const list = document.getElementById('advList');
      if(!api.enabled() || !list) return [];
      const seen = {}, out = [];
      list.querySelectorAll('.entry').forEach(function(div){
        const name = div.querySelector('.en-name');
        if(!name || !api.is(name.value)) return;
        const config = readAdvConfig(div);
        if(!api.complete(config)) return;
        const faction = config.faction.trim(), key = normalizeAdvName(faction.replace(/\s+/g, ' '));
        if(!seen[key]){ seen[key] = true; out.push(faction); }
      });
      return out;
    };
    api.eligibleKind = function(context){
      return !!context && typeof ROLL_KINDS === 'object' && !!ROLL_KINDS &&
        [ROLL_KINDS.SKILL, ROLL_KINDS.TRAIT, ROLL_KINDS.RING, ROLL_KINDS.MANUAL].indexOf(context.kind) !== -1;
    };
    api.provider = {
      label:api.NAME,
      offers:function(context){
        if(!api.eligibleKind(context)) return [];
        return api.rivals().map(function(faction, index){
          return {key:'target-' + index, label:'Contested against ' + faction + ' — apply +1k1',
            note:'Only for a Contested Roll against a member of this Clan or faction.'};
        });
      },
      // A Contested Roll has one opponent: however many rivals are ticked, +1k1 applies once.
      modifiers:function(context, keys){
        if(!api.eligibleKind(context) || !keys.length) return [];
        const rivals = api.rivals();
        const named = keys.map(function(k){ return rivals[Number(k.slice('target-'.length))]; }).filter(Boolean);
        if(!named.length) return [];
        return [{label:api.NAME, rolledDelta:1, keptDelta:1, note:'Contested against ' + named.join(' / ')}];
      },
    };

    api.info = function(){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'hv4516-info';
      button.textContent = 'i';
      button.setAttribute('aria-label', api.NAME + ' information');
      button.addEventListener('click', function(){
        populateInfoOverlay(api.NAME, 'Reference — Core p.150',
          'Choose one Clan or other faction. You gain +1k1 on a Contested Roll against a member of it.\n\n' +
          'Any Clan or faction may be chosen; the Brotherhood of Shinsei and the Imperial families are examples, not a complete list.\n\n' +
          'Cost 5 XP, or 4 for a Spider character.\n\n' +
          'On this sheet the bonus is offered in the roll preview of Skill, Trait, Ring and dice-tray rolls, unticked every time: tick it only when the roll is Contested against a member of your rival faction. ' +
          'It is never offered on attacks, damage, spell casting or initiative, and it is never saved.');
      });
      return button;
    };
    api.clearRenamed = function(div, name){
      const own = div.querySelector('.hv4516-row');
      if(own && own.dataset.hv4516Name !== normalizeAdvName(name)){ delete div.dataset.advConfig; own.remove(); return; }
      const foreign = api.is(name) && div.querySelector('.adv-config-row:not(.hv4516-row)');
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
        if(!valid) warning = 'Choose your rival Clan or faction';
      }
      const row = advConfigRowFor(div);
      row.dataset.hv4516Name = normalizeAdvName(api.NAME);
      row.className = 'adv-config-row hv4516-row ' + (warning ? 'unconfigured' : 'configured');
      row.textContent = '';
      const lead = document.createElement('span');
      lead.className = warning ? 'adv-config-warn hv4516-warning' : 'adv-config-summary hv4516-badge';
      lead.textContent = warning || ('Rival: ' + config.faction.trim() + ' — declare +1k1 when you roll');
      row.appendChild(lead);
      if(wrong) return true;
      const change = document.createElement('button');
      change.type = 'button';
      change.className = 'ghost adv-config-btn';
      change.textContent = stored ? 'Change' : 'Choose…';
      change.setAttribute('aria-label', 'Configure ' + api.NAME);
      change.addEventListener('click', function(){ openAdvConfigModal(div); });
      row.appendChild(change);
      row.appendChild(api.info());
      return true;
    };
    api.open = function(div, schema){
      if(!api.enabled() || !api.ownsSchema(schema)) return false;
      if(div.parentElement && div.parentElement.id === 'disadvList'){ setStatus('Heart of Vengeance belongs in Advantages.'); return true; }
      const config = readAdvConfig(div), valid = api.complete(config);
      advConfigTargetEntry = div;
      advConfigExtendedModal = {kind:'hv4516', schema:schema};
      document.getElementById('advConfigTitle').textContent = api.NAME;
      document.getElementById('advConfigSubtitle').textContent = 'Choose your rival Clan or faction';
      const note = document.getElementById('advConfigNote');
      note.textContent = (div.dataset.advConfig && !valid ? 'The saved setting is unsupported. Confirming replaces it. ' : '') +
        'Pick a suggestion or type any other faction. The +1k1 is declared in the roll preview, one roll at a time.';
      note.style.display = '';
      const grid = document.getElementById('advConfigGrid');
      grid.innerHTML = '<div class="hv4516-editor"><label class="hv4516-label" for="hv4516Faction">Rival Clan or faction</label>' +
        '<input class="hv4516-input" id="hv4516Faction" type="text" list="hv4516Suggestions" autocomplete="off">' +
        '<datalist id="hv4516Suggestions">' + api.suggestions().map(function(s){ return '<option value="' + escAttr(s) + '"></option>'; }).join('') +
        '</datalist><p class="hv4516-error" role="alert" hidden></p></div>';
      const input = grid.querySelector('#hv4516Faction');
      input.value = valid ? config.faction : '';
      grid.querySelector('.hv4516-editor').appendChild(api.info());
      document.getElementById('advConfigConfirm').textContent = 'Confirm';
      document.getElementById('advConfigModalOverlay').style.display = 'flex';
      input.focus({preventScroll:true});
      return true;
    };
    api.confirm = function(){
      const state = advConfigExtendedModal;
      if(!api.enabled() || !state || state.kind !== 'hv4516') return false;
      const div = advConfigTargetEntry, name = div && div.querySelector('.en-name');
      if(!div || !div.isConnected || !name || !api.is(name.value)){
        closeAdvConfigModal(); setStatus('The entry changed; open its configuration again.'); return true;
      }
      const faction = document.getElementById('hv4516Faction').value.trim().replace(/\s+/g, ' ');
      if(!faction){
        const error = document.querySelector('#advConfigGrid .hv4516-error');
        error.textContent = 'Enter or pick the rival Clan or faction before confirming.'; error.hidden = false;
        setStatus(error.textContent);
        return true;
      }
      return commitExtendedAdvConfig({type:api.TYPE, revision:1, faction:faction, value:faction}, api.NAME + ': rival ' + faction + '.');
    };
    return api;
  })();

  if(HV4516.enabled()){
    registerAdvConfigSchema(HV4516.NAME, {type:HV4516.TYPE, effect:'hv4516Declaration', hv4516:true,
      title:HV4516.NAME, prompt:'Choose your rival Clan or faction.'});
    const hv4516PreviousComplete = isExtendedAdvConfigComplete;
    isExtendedAdvConfigComplete = function(schema, config){
      return HV4516.ownsSchema(schema) ? HV4516.complete(config) : hv4516PreviousComplete(schema, config);
    };
    const hv4516PreviousResolve = resolveAdvDisadvEffect;
    resolveAdvDisadvEffect = function(name, config){
      return HV4516.ownsSchema(advConfigSchemaFor(name)) ? HV4516.resolve(config) : hv4516PreviousResolve(name, config);
    };
    const hv4516PreviousRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){ if(!HV4516.refresh(div)) hv4516PreviousRefresh(div); };
    const hv4516PreviousOpen = openExtendedAdvConfigModal;
    openExtendedAdvConfigModal = function(div, schema){ return HV4516.open(div, schema) || hv4516PreviousOpen(div, schema); };
    const hv4516PreviousConfirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){ return HV4516.confirm() || hv4516PreviousConfirm(); };
    // Declared dependency on the roll declaration registry; without it the rival is still
    // recorded and priced, and simply nothing is offered at roll time.
    if(typeof RD4515 === 'object' && RD4515) RD4515.register(HV4516.PROVIDER, HV4516.provider);
  }
