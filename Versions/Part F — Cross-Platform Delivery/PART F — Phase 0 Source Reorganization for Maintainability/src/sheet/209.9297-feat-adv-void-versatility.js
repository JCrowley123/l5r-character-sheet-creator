  // ========= PART I FEATURE 4.5.20: VOID VERSATILITY =========
  // A14 (The Great Clans p.199). A Shugenja with a Void Affinity picks one non-Void Ring when
  // buying this; from then on a Void spell may be paid for with a slot of that Ring as well as
  // with an ordinary Void slot. Only the PAYMENT changes. The spell is still cast as Void: the
  // Casting Roll is exactly the one performSpellCastRoll() makes for any Void spell.
  //
  // WHERE THE CHOICE IS ASKED. castSpell() spends the slot BEFORE the roll preview opens, so
  // asking inside the preview would need a refund path the trunk does not have. The choice is
  // asked where castSpell() already asks its own bonus-slot question -- immediately before any
  // slot is spent -- through the trunk's own three-way dialog (appConfirm3Way): the Ring, the
  // ordinary Void flow (which still offers the shared bonus pool exactly as before), or ✕ to
  // abort with nothing spent. Only that Ring's own counter is ever written; the shared bonus
  // pool and its per-element fill counters are never touched.
  const ADV_VOID_VERSATILITY_ENABLED = true;

  const VV4520 = (function(){
    const api = {};
    api.NAME = 'Void Versatility';
    api.TYPE = 'voidVersatilityRing';
    api.PRICE = 4;
    api.pending = null;
    api.enabled = function(){ return ADV_VOID_VERSATILITY_ENABLED && ADV_CONFIG_ENABLED; };
    api.is = function(name){ return normalizeAdvName(name) === normalizeAdvName(api.NAME); };
    api.ownsSchema = function(schema){ return !!schema && schema.vv4520 === true && api.is(schema.name); };
    api.aSlot = function(name){ return (/^[AEIOU]/.test(name) ? 'an ' : 'a ') + name + ' slot'; };
    // RINGS is exactly the four elemental Rings, which is the "non-Void" rule.
    api.ring = function(name){ return RINGS.find(function(r){ return r.name === name; }) || null; };

    api.complete = function(config){
      if(!api.enabled() || !config || typeof config !== 'object' || Array.isArray(config)) return false;
      if(config.type !== api.TYPE || config.revision !== 1) return false;
      if(Object.keys(config).some(function(k){ return ['type', 'revision', 'value', 'ring'].indexOf(k) === -1; })) return false;
      return !!api.ring(config.ring);
    };
    api.resolve = function(config){
      if(!api.complete(config)) return null;
      return {effect:'vv4520SlotSource', entryName:api.NAME, cost:api.PRICE, ringName:config.ring};
    };

    // Eligibility, read from the sheet's own School data every time: a Shugenja path
    // (characterCasterLock) whose active School has a Void Affinity, and no Uncentered.
    api.ineligibility = function(){
      const shugenja = typeof characterCasterLock === 'function' && characterCasterLock() === 'shugenja';
      if(!shugenja) return {label:'Shugenja with Void Affinity only', reason:'Requires a Shugenja School with a Void Affinity.'};
      const profile = typeof getActiveSchoolElementalProfile === 'function' ? getActiveSchoolElementalProfile() : {};
      if(profile.affinity !== 'Void'){
        return {label:'Shugenja with Void Affinity only',
          reason:'Requires a Void Affinity — your School\'s Affinity is ' + (profile.affinity || 'not set') + '.'};
      }
      const uncentered = Array.prototype.some.call(document.querySelectorAll('#disadvList .entry .en-name'),
        function(input){ return normalizeAdvName(input.value) === 'uncentered'; });
      if(uncentered) return {label:'not with Uncentered', reason:'Uncentered forbids Void Versatility.'};
      return null;
    };
    // The saved Ring of the first configured row on the Advantage list, or null.
    api.configuredRing = function(){
      if(!api.enabled()) return null;
      let found = null;
      document.querySelectorAll('#advList .entry').forEach(function(div){
        if(found) return;
        const name = div.querySelector('.en-name');
        if(!name || !api.is(name.value)) return;
        const config = readAdvConfig(div);
        if(api.complete(config)) found = api.ring(config.ring);
      });
      return found;
    };
    api.activeRing = function(){
      const ring = api.configuredRing();
      return ring && !api.ineligibility() ? ring : null;
    };
    // Read exactly the way castSpell() reads them.
    api.slots = function(key){
      const max = Math.max(0, Math.min(10, parseInt(document.getElementById('ring_' + key).value || '0', 10) || 0));
      const used = Math.max(0, Math.min(max, parseInt(document.getElementById('spell_used_' + key).value || '0', 10) || 0));
      return {max:max, used:used, free:max - used};
    };
    api.bonus = function(){
      const max = Math.max(0, Math.min(10, parseInt(document.getElementById('ring_void').value || '0', 10) || 0));
      const used = Math.max(0, Math.min(max, parseInt(document.getElementById('spell_bonus_used_shared').value || '0', 10) || 0));
      return {max:max, used:used, free:max - used};
    };
    // What a Void cast should offer, or null to leave castSpell() exactly as it was: no
    // eligible configured row, not a Void spell, or the saved Ring has no slot left.
    api.plan = function(elementKey){
      if(!api.enabled() || elementKey !== 'void') return null;
      const ring = api.activeRing();
      if(!ring) return null;
      const ringSlots = api.slots(ring.key);
      if(ringSlots.free <= 0) return null;
      return {ring:ring, ringSlots:ringSlots, voidSlots:api.slots('void'), bonus:api.bonus()};
    };
    api.ringLabel = function(plan){ return plan.ring.name + ' slot (' + plan.ringSlots.free + ' of ' + plan.ringSlots.max + ' left)'; };
    api.ordinaryLabel = function(plan){
      return plan.voidSlots.free > 0 ? 'Void slot (' + plan.voidSlots.free + ' of ' + plan.voidSlots.max + ' left)'
        : 'Bonus slot (' + plan.bonus.free + ' of ' + plan.bonus.max + ' shared left)';
    };
    api.ask = function(plan, spellName){
      const intro = spellName + ' is a Void spell. Void Versatility lets ' + api.aSlot(plan.ring.name) +
        ' pay for it; the spell is still cast as Void.';
      if(plan.voidSlots.free > 0 || plan.bonus.free > 0){
        return appConfirm3Way(intro + ' Which slot pays? (✕ cancels — nothing is spent.)',
          'Use ' + api.ringLabel(plan), 'ghost', 'Use ' + api.ordinaryLabel(plan))
          .then(function(r){ return r === 'ok' ? 'ring' : r === 'cancel' ? 'ordinary' : null; });
      }
      return appConfirm(intro + ' No Void or bonus slots are left.', 'Use ' + api.ringLabel(plan), 'ghost', 'Cancel')
        .then(function(ok){ return ok ? 'ring' : null; });
    };
    api.payWithRing = function(plan, spellName, mastery, keywords){
      const now = api.slots(plan.ring.key);
      if(now.free <= 0){ appAlert('No ' + plan.ring.name + ' spell slots are left.'); return false; }
      document.getElementById('spell_used_' + plan.ring.key).value = now.used + 1;
      renderSpellPips(plan.ring.key);
      api.pending = {ring:plan.ring.name, spellName:spellName};
      try { performSpellCastRoll('void', 'Void', spellName, mastery, keywords); }
      finally { api.pending = null; }
      setStatus(spellName + ': paid with ' + api.aSlot(plan.ring.name) + ' (Void Versatility).');
      return true;
    };
    api.busy = function(){
      // Phase 4.5.2's Willpower gate refuses a second cast while a check is pending; the Ring
      // path must refuse too, so it asks the same question (guarded: absent means never busy).
      return typeof D45G === 'object' && !!D45G && typeof D45G.busy === 'function' && D45G.busy();
    };
    api.cast = async function(previous, self, args){
      const plan = api.plan(args[0]);
      if(!plan || api.busy()) return previous.apply(self, args);
      const choice = await api.ask(plan, args[1] || 'This spell');
      if(choice === 'ring') return api.payWithRing(plan, args[1], args[2], args[3]);
      if(choice === 'ordinary') return previous.apply(self, args);
      setStatus('Cast cancelled — no spell slot spent.');
      return null;
    };
    api.modifiers = function(context){
      if(!api.enabled() || !context || !context.vv4520) return [];
      return [{source:'adv-config', label:api.NAME, informational:true, display:'paid with ' + api.aSlot(context.vv4520.ring),
        note:'the spell is cast as Void; only the slot that paid for it changed'}];
    };
    api.diagnostic = function(ctx){
      if(!ctx || ctx.elementKey !== 'void' || ctx.isMaho || !ctx.slots || ctx.slots.free > 0) return null;
      const ring = api.activeRing();
      if(!ring || typeof castingSuppression !== 'function') return null;
      const s = api.slots(ring.key);
      if(s.free <= 0) return null;
      return castingSuppression('no-slots', 'Void Versatility: your ' + ring.name + ' slots can pay for this Void spell (' +
        s.free + ' of ' + s.max + ' left).');
    };

    api.info = function(ringName){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'vv4520-info';
      button.textContent = 'i';
      button.setAttribute('aria-label', api.NAME + ' information');
      button.addEventListener('click', function(){
        const block = api.ineligibility();
        populateInfoOverlay(api.NAME, 'Reference — The Great Clans p.199',
          (ringName ? 'Your Ring: ' + ringName + '\n\n' : '') +
          'Choose one non-Void Ring when you buy this. Its spell slots may then pay for Void spells as well as for its own spells. The spell is still a Void spell: same Casting Roll, same effects. Only the slot that pays changes.\n\n' +
          'When you cast a Void spell, the sheet asks which slot pays: the chosen Ring, or the ordinary Void slots (with the shared bonus pool after them, as before). ✕ cancels and spends nothing.\n\n' +
          'Shugenja with a Void Affinity only. Uncentered forbids it. Cost 4 XP.' +
          (block ? '\n\nNot in effect on this character: ' + block.reason : ''));
      });
      return button;
    };
    api.clearRenamed = function(div, name){
      const own = div.querySelector('.vv4520-row');
      if(own && own.dataset.vv4520Name !== normalizeAdvName(name)){ delete div.dataset.advConfig; own.remove(); return; }
      const foreign = api.is(name) && div.querySelector('.adv-config-row:not(.vv4520-row)');
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
        if(cost) cost.value = api.PRICE;
        if(!valid) warning = 'Choose the Ring whose slots may pay for Void spells';
      }
      const block = !warning ? api.ineligibility() : null;
      const row = advConfigRowFor(div);
      row.dataset.vv4520Name = normalizeAdvName(api.NAME);
      row.className = 'adv-config-row vv4520-row ' + (warning || block ? 'unconfigured' : 'configured');
      row.textContent = '';
      const lead = document.createElement('span');
      lead.className = warning ? 'adv-config-warn vv4520-warning' : 'adv-config-summary vv4520-badge' + (block ? ' vv4520-inactive' : '');
      lead.textContent = warning || (config.ring + ' slots');
      row.appendChild(lead);
      if(wrong) return true;
      const change = document.createElement('button');
      change.type = 'button';
      change.className = 'ghost adv-config-btn';
      change.textContent = stored ? 'Change' : 'Choose…';
      change.setAttribute('aria-label', 'Configure ' + api.NAME);
      change.addEventListener('click', function(){ openAdvConfigModal(div); });
      row.appendChild(change);
      row.appendChild(api.info(valid ? config.ring : null));
      if(valid){
        const reminder = document.createElement('p');
        reminder.className = 'vv4520-reminder';
        reminder.textContent = block
          ? 'Not in effect: ' + block.reason + ' Void spells are paid with Void slots only.'
          : 'Your ' + config.ring + ' slots may also pay for Void spells; casting one asks which slot to use. The spell is still cast as Void.';
        row.appendChild(reminder);
      }
      return true;
    };
    api.open = function(div, schema){
      if(!api.enabled() || !api.ownsSchema(schema)) return false;
      if(div.parentElement && div.parentElement.id === 'disadvList'){ setStatus('Void Versatility belongs in Advantages.'); return true; }
      const config = readAdvConfig(div), valid = api.complete(config);
      const block = api.ineligibility();
      advConfigTargetEntry = div;
      advConfigExtendedModal = {kind:'vv4520', schema:schema};
      document.getElementById('advConfigTitle').textContent = api.NAME;
      document.getElementById('advConfigSubtitle').textContent = 'Choose one non-Void Ring';
      const note = document.getElementById('advConfigNote');
      note.textContent = (div.dataset.advConfig && !valid ? 'The saved setting is unsupported. Confirming replaces it. ' : '') +
        'That Ring\'s spell slots may also pay for Void spells. The spell is still cast as Void.' +
        (block ? ' Not in effect on this character yet: ' + block.reason : '');
      note.style.display = '';
      const grid = document.getElementById('advConfigGrid');
      grid.innerHTML = '<fieldset class="vv4520-picker"><legend class="vv4520-legend">Ring</legend></fieldset><p class="vv4520-error" role="alert" hidden></p>';
      const set = grid.querySelector('.vv4520-picker');
      RINGS.forEach(function(r){
        const label = document.createElement('label');
        label.className = 'vv4520-option';
        const radio = document.createElement('input');
        radio.type = 'radio'; radio.name = 'vv4520Ring'; radio.value = r.name;
        radio.checked = valid && config.ring === r.name;
        const text = document.createElement('span');
        text.textContent = r.name;
        label.appendChild(radio); label.appendChild(text);
        set.appendChild(label);
      });
      grid.appendChild(api.info(valid ? config.ring : null));
      document.getElementById('advConfigConfirm').textContent = 'Confirm';
      document.getElementById('advConfigModalOverlay').style.display = 'flex';
      const focus = grid.querySelector('input:checked') || grid.querySelector('input');
      if(focus) focus.focus({preventScroll:true});
      return true;
    };
    api.confirm = function(){
      const state = advConfigExtendedModal;
      if(!api.enabled() || !state || state.kind !== 'vv4520') return false;
      const div = advConfigTargetEntry, name = div && div.querySelector('.en-name');
      if(!div || !div.isConnected || !name || !api.is(name.value)){
        closeAdvConfigModal(); setStatus('The entry changed; open its configuration again.'); return true;
      }
      const picked = document.querySelector('#advConfigGrid input[name="vv4520Ring"]:checked');
      if(!picked || !api.ring(picked.value)){
        const error = document.querySelector('#advConfigGrid .vv4520-error');
        error.textContent = 'Choose a Ring before confirming.'; error.hidden = false;
        setStatus(error.textContent);
        return true;
      }
      return commitExtendedAdvConfig({type:api.TYPE, revision:1, ring:picked.value, value:picked.value},
        api.NAME + ': ' + picked.value + ' slots may pay for Void spells.');
    };
    return api;
  })();

  if(VV4520.enabled()){
    registerAdvConfigSchema(VV4520.NAME, {type:VV4520.TYPE, effect:'vv4520SlotSource', vv4520:true,
      title:VV4520.NAME, prompt:'Choose one non-Void Ring.'});
    const vv4520PreviousComplete = isExtendedAdvConfigComplete;
    isExtendedAdvConfigComplete = function(schema, config){
      return VV4520.ownsSchema(schema) ? VV4520.complete(config) : vv4520PreviousComplete(schema, config);
    };
    const vv4520PreviousResolve = resolveAdvDisadvEffect;
    resolveAdvDisadvEffect = function(name, config){
      return VV4520.ownsSchema(advConfigSchemaFor(name)) ? VV4520.resolve(config) : vv4520PreviousResolve(name, config);
    };
    const vv4520PreviousRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){ if(!VV4520.refresh(div)) vv4520PreviousRefresh(div); };
    const vv4520PreviousOpen = openExtendedAdvConfigModal;
    openExtendedAdvConfigModal = function(div, schema){ return VV4520.open(div, schema) || vv4520PreviousOpen(div, schema); };
    const vv4520PreviousConfirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){ return VV4520.confirm() || vv4520PreviousConfirm(); };
    const vv4520PreviousModifiers = advConfigExtendedRollModifiers;
    advConfigExtendedRollModifiers = function(context){
      return (vv4520PreviousModifiers(context) || []).concat(VV4520.modifiers(context));
    };
    // The Cast button and castUniversalSpell() both reach castSpell() by name at call time.
    const vv4520PreviousCast = castSpell;
    castSpell = function(){ return VV4520.cast(vv4520PreviousCast, this, arguments); };
    // Marks the one Void Casting Roll a Ring slot paid for, so its preview and breakdown can say
    // so. Set immediately before performSpellCastRoll() and cleared straight after; that call
    // reaches this synchronously, so no other roll can pick the mark up.
    const vv4520PreviousRoll = rollWithModifiers;
    rollWithModifiers = function(title, context, baseRolled, baseKept, opts){
      const mark = VV4520.pending;
      if(mark && context && context.kind === ROLL_KINDS.SPELL && context.element === 'Void'){
        VV4520.pending = null;
        return vv4520PreviousRoll.call(this, title + ' — paid with ' + VV4520.aSlot(mark.ring),
          Object.assign({}, context, {vv4520:{ring:mark.ring}}), baseRolled, baseKept, opts);
      }
      return vv4520PreviousRoll.apply(this, arguments);
    };
    // Phase 8 (Part J): lift its "no slots" blocker when the saved Ring can still pay.
    if(typeof registerCastingDiagnostic === 'function') registerCastingDiagnostic('void-versatility', 80, VV4520.diagnostic);
    // Feature 4.5.5: grey the entry out in the quick-add picker for an ineligible character,
    // the project's standard for gated entries. Extended by property, never edited.
    if(typeof R455 === 'object' && R455 && typeof R455.ineligible === 'function'){
      const vv4520PreviousIneligible = R455.ineligible;
      R455.ineligible = function(name){
        if(VV4520.is(name) && R455.enabled()){ const block = VV4520.ineligibility(); return block ? block.label : null; }
        return vv4520PreviousIneligible.apply(this, arguments);
      };
    }
  }
