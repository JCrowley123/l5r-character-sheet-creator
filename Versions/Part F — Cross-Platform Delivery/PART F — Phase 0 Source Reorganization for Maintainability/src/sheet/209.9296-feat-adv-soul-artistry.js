  // ========= PART I FEATURE 4.5.19: SOUL OF ARTISTRY =========
  // A12. The player picks Artisan Skills or Craft Skills. A matching Skill that would otherwise be
  // rolled Unskilled is rolled as Rank 1 instead: Trait + 1 rolled, Trait kept, 10s explode. It is
  // an effective roll rank only; the Skill's purchased Rank, its XP and Insight are never touched.
  //
  // The lift rewrites the roll BEFORE the preview opens, by wrapping rollWithModifiers(). The
  // preview, the breakdown, the Void offer list and the dice therefore all see one and the same
  // Rank 1 roll: the Void "Rank 0 -> 1" option is not offered on top of it, because the context it
  // reads now says Rank 1. One informational line through the existing adv-config seat says why.
  const ADV_SOUL_ARTISTRY_ENABLED = true;

  const SA4519 = (function(){
    const api = {};
    api.NAME = 'Soul of Artistry';
    api.TYPE = 'skillFamilyPick';
    // Core pp.135 and 143-144, as recorded in SOURCE-OTHER-PREPARATION.md (A12): each family's
    // own name and its colon specializations, plus the Skills the book says count as members.
    // The printed example lists are not exhaustive, so they are NOT a whitelist; a name that is
    // neither the family, one of its specializations nor a listed member is never guessed at.
    api.FAMILIES = {
      Artisan:{label:'Artisan Skills', members:['Calligraphy']},
      Craft:{label:'Craft Skills', members:['Engineering', 'Sailing', 'Forgery']},
    };
    api.enabled = function(){ return ADV_SOUL_ARTISTRY_ENABLED && ADV_CONFIG_ENABLED; };
    api.is = function(name){ return normalizeAdvName(name) === normalizeAdvName(api.NAME); };
    api.ownsSchema = function(schema){ return !!schema && schema.sa4519 === true && api.is(schema.name); };

    // Crane OR Courtier is one eligibility test for one stated price (3), never two discounts.
    // A School counts as a Courtier School when its name or bracketed type says so; the same
    // test Feature 4.5.14 applies to Darling of the Court, written out here so neither release
    // depends on the other.
    api.courtierSchool = function(){
      const list = typeof getSchoolsList === 'function' ? getSchoolsList() : [];
      const hit = list.find(function(entry){ return entry && /\bcourtier\b/i.test(String(entry.name || '')); });
      return hit ? String(hit.name) : '';
    };
    api.priceReason = function(){
      if(normalizeAdvName(advConfigCharacterClan()) === 'crane') return 'Crane';
      const school = api.courtierSchool();
      return school ? 'Courtier School (' + school + ')' : '';
    };
    api.price = function(){ return api.priceReason() ? 3 : 4; };

    // "Artisan", "Artisan: Painting", "Artisan (Painting)" (an Emphasis in parentheses) and the
    // listed members, in any case. "Crafty" or "Craftsmanship" are not Craft: the family name
    // must be followed by nothing, a colon or an Emphasis.
    api.familyOf = function(skillName){
      const base = String(skillName || '').replace(/\(.*$/, '').replace(/\s+/g, ' ').trim().toLowerCase();
      if(!base) return null;
      const fits = function(name){ const n = name.toLowerCase(); return base === n || base.indexOf(n + ':') === 0; };
      return Object.keys(api.FAMILIES).find(function(family){
        return fits(family) || api.FAMILIES[family].members.some(fits);
      }) || null;
    };

    api.complete = function(config){
      if(!api.enabled() || !config || typeof config !== 'object' || Array.isArray(config)) return false;
      if(config.type !== api.TYPE || config.revision !== 1) return false;
      if(Object.keys(config).some(function(k){ return ['type', 'revision', 'value', 'family'].indexOf(k) === -1; })) return false;
      return Object.prototype.hasOwnProperty.call(api.FAMILIES, config.family);
    };
    api.resolve = function(config){
      if(!api.complete(config)) return null;
      return {effect:'sa4519Lift', entryName:api.NAME, cost:api.price(), family:config.family, label:api.FAMILIES[config.family].label};
    };
    // Only configured rows on the Advantage list count. A second row naming the same family adds
    // nothing: the lift is to Rank 1, once.
    api.families = function(){
      const out = [];
      if(!api.enabled()) return out;
      document.querySelectorAll('#advList .entry').forEach(function(div){
        const name = div.querySelector('.en-name');
        if(!name || !api.is(name.value)) return;
        const config = readAdvConfig(div);
        if(api.complete(config) && out.indexOf(config.family) === -1) out.push(config.family);
      });
      return out;
    };
    api.applies = function(context){
      // The base release's own switch for configured roll effects turns this lift off too.
      if(!api.enabled() || !ADV_CONFIG_ROLL_EFFECTS_ENABLED) return null;
      if(!context || context.kind !== ROLL_KINDS.SKILL || context.sa4519) return null;
      const unskilled = context.unskilled === true || (parseInt(context.skillRank, 10) || 0) <= 0;
      if(!unskilled) return null;
      const family = api.familyOf(context.skillName);
      return family && api.families().indexOf(family) !== -1 ? family : null;
    };
    // The whole lift, as one pure rewrite of the arguments rollWithModifiers() receives.
    api.lift = function(title, context, baseRolled, baseKept, opts){
      const family = api.applies(context);
      if(!family) return null;
      const bought = Math.max(0, parseInt(context.skillRank, 10) || 0);
      return {
        title:String(title || context.skillName || 'Skill Roll').replace(/\s*\(Unskilled\)\s*$/, '') + ' (Soul of Artistry — Rank 1)',
        context:Object.assign({}, context, {skillRank:1, unskilled:false, sa4519:{family:family, bought:bought}}),
        baseRolled:(parseInt(baseRolled, 10) || 0) + 1,
        baseKept:baseKept,
        opts:Object.assign({}, opts || {}, {explode:true}),
      };
    };
    api.modifiers = function(context){
      if(!api.enabled() || !context || !context.sa4519) return [];
      const family = context.sa4519.family;
      return [{source:'adv-config', label:api.NAME, informational:true, display:'treated as Rank 1',
        note:api.FAMILIES[family].label + ': no Rank bought (Rank ' + context.sa4519.bought + '), so it rolls as Rank 1 and 10s explode'}];
    };

    api.listText = function(items){
      return items.length > 1 ? items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1] : items.join('');
    };
    api.reminder = function(family){
      const f = api.FAMILIES[family];
      const reason = api.priceReason();
      return f.label + ' you have no Rank in roll as Rank 1, and 10s explode' +
        ' (includes ' + api.listText(f.members) + ').' +
        (reason ? ' ' + api.price() + ' XP: ' + reason + '.' : '');
    };
    api.info = function(family){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'sa4519-info';
      button.textContent = 'i';
      button.setAttribute('aria-label', api.NAME + ' information');
      button.addEventListener('click', function(){
        populateInfoOverlay(api.NAME, 'Reference — Core p.154',
          (family ? 'Your choice: ' + api.FAMILIES[family].label + '\n\n' : '') +
          'Choose Artisan Skills or Craft Skills. When a matching Skill would be rolled Unskilled, it is rolled as Rank 1 instead: Trait + 1 dice rolled, Trait kept, and 10s explode. A Skill you have trained is unchanged, and no bought Rank or XP changes.\n\n' +
          'Artisan: the Artisan Skill and its specializations (Artisan: Painting, Poetry, Bonsai…); Calligraphy counts as Artisan.\n' +
          'Craft: the Craft Skill and its specializations (Craft: Blacksmithing, Cooking…); Engineering, Sailing and Forgery count as Craft.\n\n' +
          'Cost 4 XP, or 3 for a Crane or a Courtier (one reduced price, not two).');
      });
      return button;
    };
    api.clearRenamed = function(div, name){
      const own = div.querySelector('.sa4519-row');
      if(own && own.dataset.sa4519Name !== normalizeAdvName(name)){ delete div.dataset.advConfig; own.remove(); return; }
      const foreign = api.is(name) && div.querySelector('.adv-config-row:not(.sa4519-row)');
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
        if(!valid) warning = 'Choose Artisan or Craft Skills';
      }
      const row = advConfigRowFor(div);
      row.dataset.sa4519Name = normalizeAdvName(api.NAME);
      row.className = 'adv-config-row sa4519-row ' + (warning ? 'unconfigured' : 'configured');
      row.textContent = '';
      const lead = document.createElement('span');
      lead.className = warning ? 'adv-config-warn sa4519-warning' : 'adv-config-summary sa4519-badge';
      lead.textContent = warning || api.FAMILIES[config.family].label;
      row.appendChild(lead);
      if(wrong) return true;
      const change = document.createElement('button');
      change.type = 'button';
      change.className = 'ghost adv-config-btn';
      change.textContent = stored ? 'Change' : 'Choose…';
      change.setAttribute('aria-label', 'Configure ' + api.NAME);
      change.addEventListener('click', function(){ openAdvConfigModal(div); });
      row.appendChild(change);
      row.appendChild(api.info(valid ? config.family : null));
      if(valid){
        const reminder = document.createElement('p');
        reminder.className = 'sa4519-reminder';
        reminder.textContent = api.reminder(config.family);
        row.appendChild(reminder);
      }
      return true;
    };
    api.open = function(div, schema){
      if(!api.enabled() || !api.ownsSchema(schema)) return false;
      if(div.parentElement && div.parentElement.id === 'disadvList'){ setStatus('Soul of Artistry belongs in Advantages.'); return true; }
      const config = readAdvConfig(div), valid = api.complete(config);
      advConfigTargetEntry = div;
      advConfigExtendedModal = {kind:'sa4519', schema:schema};
      document.getElementById('advConfigTitle').textContent = api.NAME;
      document.getElementById('advConfigSubtitle').textContent = 'Choose Artisan or Craft Skills';
      const note = document.getElementById('advConfigNote');
      note.textContent = (div.dataset.advConfig && !valid ? 'The saved setting is unsupported. Confirming replaces it. ' : '') +
        'A matching Skill you have no Rank in rolls as Rank 1 (10s explode). Trained Skills and bought Ranks are unchanged.';
      note.style.display = '';
      const grid = document.getElementById('advConfigGrid');
      grid.innerHTML = '<fieldset class="sa4519-picker"><legend class="sa4519-legend">Skill family</legend></fieldset><p class="sa4519-error" role="alert" hidden></p>';
      const set = grid.querySelector('.sa4519-picker');
      Object.keys(api.FAMILIES).forEach(function(family){
        const f = api.FAMILIES[family];
        const label = document.createElement('label');
        label.className = 'sa4519-option';
        const radio = document.createElement('input');
        radio.type = 'radio'; radio.name = 'sa4519Family'; radio.value = family;
        radio.checked = valid && config.family === family;
        const text = document.createElement('span');
        const strong = document.createElement('b');
        strong.textContent = f.label;
        text.appendChild(strong);
        text.appendChild(document.createTextNode(' — ' + family + ' and its specializations, plus ' + api.listText(f.members)));
        label.appendChild(radio); label.appendChild(text);
        set.appendChild(label);
      });
      grid.appendChild(api.info(valid ? config.family : null));
      document.getElementById('advConfigConfirm').textContent = 'Confirm';
      document.getElementById('advConfigModalOverlay').style.display = 'flex';
      const focus = grid.querySelector('input:checked') || grid.querySelector('input');
      if(focus) focus.focus({preventScroll:true});
      return true;
    };
    api.confirm = function(){
      const state = advConfigExtendedModal;
      if(!api.enabled() || !state || state.kind !== 'sa4519') return false;
      const div = advConfigTargetEntry, name = div && div.querySelector('.en-name');
      if(!div || !div.isConnected || !name || !api.is(name.value)){
        closeAdvConfigModal(); setStatus('The entry changed; open its configuration again.'); return true;
      }
      const picked = document.querySelector('#advConfigGrid input[name="sa4519Family"]:checked');
      if(!picked || !Object.prototype.hasOwnProperty.call(api.FAMILIES, picked.value)){
        const error = document.querySelector('#advConfigGrid .sa4519-error');
        error.textContent = 'Choose Artisan or Craft Skills before confirming.'; error.hidden = false;
        setStatus(error.textContent);
        return true;
      }
      return commitExtendedAdvConfig({type:api.TYPE, revision:1, family:picked.value, value:picked.value},
        api.NAME + ': ' + api.FAMILIES[picked.value].label + '.');
    };
    return api;
  })();

  if(SA4519.enabled()){
    registerAdvConfigSchema(SA4519.NAME, {type:SA4519.TYPE, effect:'sa4519Lift', sa4519:true,
      title:SA4519.NAME, prompt:'Choose Artisan or Craft Skills.'});
    const sa4519PreviousComplete = isExtendedAdvConfigComplete;
    isExtendedAdvConfigComplete = function(schema, config){
      return SA4519.ownsSchema(schema) ? SA4519.complete(config) : sa4519PreviousComplete(schema, config);
    };
    const sa4519PreviousResolve = resolveAdvDisadvEffect;
    resolveAdvDisadvEffect = function(name, config){
      return SA4519.ownsSchema(advConfigSchemaFor(name)) ? SA4519.resolve(config) : sa4519PreviousResolve(name, config);
    };
    const sa4519PreviousRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){ if(!SA4519.refresh(div)) sa4519PreviousRefresh(div); };
    const sa4519PreviousOpen = openExtendedAdvConfigModal;
    openExtendedAdvConfigModal = function(div, schema){ return SA4519.open(div, schema) || sa4519PreviousOpen(div, schema); };
    const sa4519PreviousConfirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){ return SA4519.confirm() || sa4519PreviousConfirm(); };
    // The explanation rides the single existing adv-config registry seat: no eighth contributor.
    const sa4519PreviousModifiers = advConfigExtendedRollModifiers;
    advConfigExtendedRollModifiers = function(context){
      return (sa4519PreviousModifiers(context) || []).concat(SA4519.modifiers(context));
    };
    // Every caller reaches rollWithModifiers() by name at call time, so this one rebinding covers
    // the Skill table's roll button and the Untrained Skills list alike.
    const sa4519PreviousRoll = rollWithModifiers;
    rollWithModifiers = function(title, context, baseRolled, baseKept, opts){
      const lifted = SA4519.lift(title, context, baseRolled, baseKept, opts);
      return lifted
        ? sa4519PreviousRoll.call(this, lifted.title, lifted.context, lifted.baseRolled, lifted.baseKept, lifted.opts)
        : sa4519PreviousRoll.apply(this, arguments);
    };
  }
