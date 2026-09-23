  // ========= PART I FEATURE 4.5.23: DARK PARAGON =========
  // A03 (Core p.147), to the owner's rulings of 23 September 2026 (audit "A03 decisions").
  // One Shourido precept is saved on the row. Once per session the character sacrifices 5 Honor
  // points -- a Void Point only if they have fewer than 5 -- and the sheet takes that payment when
  // the player confirms, never on preview or cancel.
  //   * Control, Insight, Knowledge, Strength: a reroll offered in the roll result, only after a
  //     matching roll. The reroll STANDS (the source never says "keep the higher") and takes the
  //     introductory +5, which these four do not exclude.
  //   * Determination: a per-roll tick in the preview (4.5.15 registry) that removes the Wound
  //     penalty from one Skill, attack or Spell Casting roll. No +5 (printed).
  //   * Perfection, Will: a Use button that pays and marks the session; the die or the Wounds are
  //     the player's to adjust.
  // The Honor Rank field is never changed: the sheet does not link Rank to Points anywhere.
  const ADV_DARK_PARAGON_ENABLED = true;

  const DP4523 = (function(){
    const api = {};
    api.NAME = 'Dark Paragon';
    api.TYPE = 'darkParagon';
    api.HONOR_COST = 0.5;          // 5 Honor points; the Points field counts 10 to a Rank.
    api.PLUS = 5;
    // Core p.147, as recorded in SOURCE-CORE-PREPARATION.md. Order as printed.
    // [precept, operation, how the sheet applies it]
    api.PRECEPTS = [
      ['Control', 'Reroll any Social Skill Roll, with +5 to the reroll.',
        'After a Social Skill roll the result offers the reroll. The reroll stands.'],
      ['Determination', 'Negate every TN and Wound penalty on one Skill Roll or Spell Casting Roll. No +5.',
        'Tick it in the roll preview: the sheet removes your Wound penalty. Drop any other TN penalty yourself.'],
      ['Insight', 'Reroll a roll that used Awareness, with +5 to the reroll.',
        'After a roll using Awareness the result offers the reroll. The reroll stands.'],
      ['Knowledge', 'Reroll a roll that used Intelligence, with +5 to the reroll.',
        'After a roll using Intelligence the result offers the reroll. The reroll stands.'],
      ['Perfection', 'Make one chosen die on a Skill Roll explode. No +5.',
        'Press Use when you invoke it, then roll that die again and add it yourself.'],
      ['Strength', 'Reroll any damage roll, with +5 to the reroll.',
        'After a damage roll the result offers the reroll. The reroll stands.'],
      ['Will', 'Negate 10 Wounds at the moment you suffer them.',
        'Press Use when you invoke it, then take the 10 Wounds off yourself.'],
    ];
    api.REROLL = ['Control', 'Insight', 'Knowledge', 'Strength'];
    api.MANUAL = ['Perfection', 'Will'];
    // Feature 4.5.2's list is authoritative when present; this copy of it keeps Control exact
    // without that release.
    api.SOCIAL = ['Acting', 'Courtier', 'Etiquette', 'Perform', 'Sincerity', 'Intimidation', 'Temptation'];
    api.current = null;            // the roll whose result modal is being drawn
    api.paidContext = null;        // the one roll Determination was just paid for
    api.damageDepth = 0;

    api.enabled = function(){ return ADV_DARK_PARAGON_ENABLED && ADV_CONFIG_ENABLED; };
    api.is = function(name){ return normalizeAdvName(name) === normalizeAdvName(api.NAME); };
    api.ownsSchema = function(schema){ return !!schema && schema.dp4523 === true && api.is(schema.name); };
    api.price = function(){ return normalizeAdvName(advConfigCharacterClan()) === 'spider' ? 4 : 5; };
    api.precept = function(name){ return api.PRECEPTS.find(function(p){ return p[0] === name; }) || null; };

    api.complete = function(config){
      if(!api.enabled() || !config || typeof config !== 'object' || Array.isArray(config)) return false;
      if(config.type !== api.TYPE || config.revision !== 1) return false;
      if(Object.keys(config).some(function(k){ return ['type', 'revision', 'value', 'precept', 'remaining'].indexOf(k) === -1; })) return false;
      return !!api.precept(config.precept) && (config.remaining === 0 || config.remaining === 1);
    };
    api.resolve = function(config){
      if(!api.complete(config)) return null;
      return {effect:'dp4523Precept', entryName:api.NAME, cost:api.price(), label:config.precept,
        precept:config.precept, remaining:config.remaining, rank:1};
    };
    // The configured Advantage-list row, if any (the first one: the source allows one).
    api.entry = function(){
      if(!api.enabled()) return null;
      const rows = Array.prototype.slice.call(document.querySelectorAll('#advList .entry'));
      for(let i = 0; i < rows.length; i++){
        const name = rows[i].querySelector('.en-name');
        if(!name || !api.is(name.value)) continue;
        const config = readAdvConfig(rows[i]);
        if(api.complete(config)) return {div:rows[i], config:config, effect:api.resolve(config)};
      }
      return null;
    };
    api.setRemaining = function(div, remaining){
      const config = readAdvConfig(div);
      if(!api.complete(config)) return false;
      writeAdvConfig(div, api.TYPE, Object.assign({}, config, {remaining:remaining ? 1 : 0}));
      return true;
    };
    api.reset = function(div){
      if(!api.setRemaining(div, 1)) return false;
      recalcAll();
      setStatus('Dark Paragon reset: one use available this session.');
      return true;
    };

    // ---------- Payment: 5 Honor points, a Void Point only without them ----------
    api.honorPoints = function(){
      const el = document.getElementById('f_honorPts');
      const value = el ? parseFloat(el.value) : NaN;
      return Number.isFinite(value) ? value : 0;
    };
    api.fmt = function(value){ return (Math.round(value * 10) / 10).toFixed(1); };
    api.payment = function(){
      const honor = api.honorPoints();
      if(honor + 1e-9 >= api.HONOR_COST){
        return {method:'honor', before:honor, after:Math.round((honor - api.HONOR_COST) * 10) / 10};
      }
      const voids = typeof getVoidPoints === 'function' ? getVoidPoints() : 0;
      if(voids <= 0) return {method:null, reason:'You have fewer than 5 Honor points (' + api.fmt(honor) + ') and no Void Point.'};
      // RAW: one Void Point per Round in combat, as every other Void spend on the sheet.
      if(typeof isCombatActive === 'function' && isCombatActive() &&
         typeof hasSpentThisRound === 'function' && hasSpentThisRound('void')){
        return {method:null, reason:'You have fewer than 5 Honor points (' + api.fmt(honor) + ') and have already spent a Void Point this Round.'};
      }
      return {method:'void', honor:honor, before:voids, after:voids - 1};
    };
    api.priceText = function(pay){
      return pay.method === 'honor'
        ? 'Sacrifice 5 Honor points: Honor Points ' + api.fmt(pay.before) + ' → ' + api.fmt(pay.after) +
          '. Your Honor Rank field is not changed; adjust it yourself if your Rank drops.'
        : 'You have fewer than 5 Honor points (' + api.fmt(pay.honor) + '), so spend one Void Point instead: ' +
          pay.before + ' → ' + pay.after + '.';
    };
    // Takes the payment and the session use together. Returns false, changing nothing, if either
    // cannot be had.
    api.charge = function(entry, pay){
      if(!entry || entry.config.remaining !== 1 || !pay || !pay.method) return false;
      if(pay.method === 'honor'){
        const el = document.getElementById('f_honorPts');
        if(!el) return false;
        el.value = api.fmt(pay.after);
      } else {
        if(typeof consumeVoidPoint !== 'function' || !consumeVoidPoint()) return false;
        if(typeof isCombatActive === 'function' && isCombatActive() && typeof recordRoundSpend === 'function'){
          recordRoundSpend('void', 'dark-paragon');
        }
        if(typeof renderVoidPanel === 'function') renderVoidPanel();
      }
      api.setRemaining(entry.div, 0);
      setTimeout(function(){ recalcAll(); }, 0);
      return true;
    };
    // Confirm, then pay. Resolves true only when paid.
    api.pay = async function(entry, what){
      if(!entry || entry.config.remaining !== 1){ setStatus('Dark Paragon is already used this session.'); return false; }
      const pay = api.payment();
      if(!pay.method){ await appAlert('Dark Paragon cannot be paid. ' + pay.reason); return false; }
      const ok = await appConfirm('Dark Paragon — ' + entry.config.precept + ': ' + what + '\n\n' + api.priceText(pay) +
        '\n\nThis is your one use this session.', 'Pay and use', 'ghost', 'Cancel');
      if(!ok) return false;
      // Re-read after the dialog: nothing may have changed, but the charge must match what was shown.
      const again = api.entry();
      if(!again || again.div !== entry.div || again.config.remaining !== 1) return false;
      const now = api.payment();
      if(now.method !== pay.method || now.before !== pay.before) return false;
      return api.charge(again, now);
    };

    // ---------- Matching a roll ----------
    api.skillBase = function(name){ return String(name || '').replace(/[(:].*$/, '').replace(/\s+/g, ' ').trim().toLowerCase(); };
    api.social = function(skillName){
      const list = typeof D45 === 'object' && D45 && Array.isArray(D45.socialSkills) ? D45.socialSkills : api.SOCIAL;
      const base = api.skillBase(skillName);
      return !!base && list.some(function(s){ return String(s).toLowerCase() === base; });
    };
    api.matches = function(precept, token){
      if(!token) return false;
      const c = token.context || {};
      const damage = !!token.damage || c.kind === ROLL_KINDS.DAMAGE;
      if(precept === 'Strength') return damage;
      if(damage) return false;
      if(precept === 'Control') return c.kind === ROLL_KINDS.SKILL && api.social(c.skillName);
      if(precept === 'Insight') return c.traitName === 'Awareness';
      if(precept === 'Knowledge') return c.traitName === 'Intelligence';
      return false;
    };
    api.inCheck = function(){
      return typeof D45G === 'object' && D45G && typeof D45G.inCheck === 'function' && D45G.inCheck();
    };

    // ---------- The reroll ----------
    api.note = function(message){
      const body = document.getElementById('rollModalBody');
      if(!body) return;
      const old = body.querySelector('.dp4523-outcome');
      if(old) old.remove();
      const note = document.createElement('div');
      note.className = 'dp4523-outcome';
      note.textContent = message;
      body.insertBefore(note, body.firstChild);
    };
    api.reroll = async function(entry, title, result){
      const precept = entry.config.precept;
      const totalEl = document.getElementById('rollTotalDisplay');
      const originalTotal = parseInt(totalEl && totalEl.textContent || String(result.total || 0), 10) || 0;
      const tn = currentRollTN, success = currentRollSuccessText, fail = currentRollFailText, onClose = currentRollOnClose;
      if(!await api.pay(entry, 'reroll this roll with +5. The reroll stands, even if it is lower.')) return false;
      const rerolled = advConfigLuckRerollResult(result);
      if(!rerolled){ setStatus('Dark Paragon could not reroll this result.'); return false; }
      const carried = rerolled.bonus || 0;
      rerolled.bonus = carried + api.PLUS;
      rerolled.total += api.PLUS;
      showRollResult(title + ' — Dark Paragon reroll (+5)', rerolled, tn === null ? undefined : {
        tn:tn, successText:success, failText:fail, onClose:onClose,
      });
      // showRollResult() calls every flat bonus a "Ten Dice Rule bonus"; this one is not.
      const body = document.getElementById('rollModalBody');
      if(body){
        Array.prototype.forEach.call(body.querySelectorAll('.roll-note'), function(el){
          if(/^Ten Dice Rule bonus:/.test((el.textContent || '').trim())) el.style.display = 'none';
        });
        const bonus = document.createElement('div');
        bonus.className = 'roll-note dp4523-bonus-note';
        bonus.textContent = 'Includes Dark Paragon +5' + (carried ? '; ' + (carried > 0 ? '+' : '−') + Math.abs(carried) +
          ' carried from the original roll' : '') + '.';
        const dice = document.getElementById('rollDiceRow');
        body.insertBefore(bonus, dice || null);
      }
      api.note('Dark Paragon (' + precept + ') — original ' + originalTotal + ', reroll ' + (rerolled.total - api.PLUS) +
        ' + 5 = ' + rerolled.total + '. The reroll stands.');
      return true;
    };
    api.decorateResult = function(title, result){
      if(!api.enabled()) return 0;
      const token = api.current;
      const entry = api.entry();
      if(!token || !entry || api.inCheck() || api.REROLL.indexOf(entry.config.precept) === -1) return 0;
      if(!api.matches(entry.config.precept, token)) return 0;
      if(typeof advConfigLuckRerollResult !== 'function' || !result ||
         result.rawNumDice === undefined || result.rawKeepDice === undefined) return 0;
      const body = document.getElementById('rollModalBody');
      if(!body) return 0;
      const wrap = document.createElement('div');
      wrap.className = 'dp4523-actions';
      const head = document.createElement('div');
      head.className = 'dp4523-head';
      head.textContent = 'Dark Paragon — ' + entry.config.precept + ': reroll with +5; the reroll stands';
      wrap.appendChild(head);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ghost dp4523-reroll';
      button.disabled = entry.config.remaining !== 1;
      button.textContent = 'Reroll with Dark Paragon (' + entry.config.remaining + '/1)';
      button.title = entry.config.remaining === 1 ? 'Pay 5 Honor points (or a Void Point) and reroll with +5'
        : 'Dark Paragon is already used this session';
      button.addEventListener('click', function(){
        button.disabled = true;
        api.reroll(entry, title, result).then(function(done){ if(!done && button.isConnected) button.disabled = false; },
          function(){ if(button.isConnected) button.disabled = false; });
      });
      wrap.appendChild(button);
      body.appendChild(wrap);
      return 1;
    };

    // ---------- Determination (4.5.15 per-roll declaration) ----------
    api.KEY = 'dark-paragon:determination';
    api.determinationKinds = function(){ return [ROLL_KINDS.SKILL, ROLL_KINDS.ATTACK, ROLL_KINDS.SPELL]; };
    api.woundPenalty = function(){ return typeof getWoundPenalty === 'function' ? (getWoundPenalty() || 0) : 0; };
    api.provider = {
      label:'Dark Paragon',
      offers:function(context){
        const entry = api.entry();
        // Still offered for the roll it was paid for: 4.5.15 keeps only offered keys armed, and
        // paying spends the session use before the dice are read.
        const paid = !!context && context === api.paidContext;
        if(!entry || entry.config.precept !== 'Determination' || (entry.config.remaining !== 1 && !paid)) return [];
        if(!context || api.determinationKinds().indexOf(context.kind) === -1) return [];
        const penalty = api.woundPenalty();
        return [{key:'determination', label:'Determination — negate Wound and TN penalties',
          note:(penalty < 0 ? 'Removes your Wound penalty (' + penalty + ') from this roll.' : 'You have no Wound penalty right now.') +
            ' Drop any other TN penalty yourself. No +5. Paid when you roll: 5 Honor points, or a Void Point without them.'}];
      },
      modifiers:function(context, keys){
        if(keys.indexOf('determination') === -1) return [];
        const penalty = api.woundPenalty();
        return penalty < 0 ? [{label:'Dark Paragon — Determination', totalDelta:-penalty, note:'Wound penalty negated'}] : [];
      },
    };
    // Resolves true to roll, false to cancel the roll. Payment happens here, after the preview
    // and before the dice, so a cancelled preview can never cost anything.
    api.gate = async function(req){
      api.paidContext = null;
      if(typeof RD4515 !== 'object' || !RD4515 || RD4515.armed(req.context).indexOf(api.KEY) === -1) return true;
      const entry = api.entry();
      const pay = api.payment();
      if(!entry || entry.config.remaining !== 1 || !pay.method){
        const ok = await appConfirm('Dark Paragon cannot be used for this roll. ' +
          (pay.method ? 'It is already used this session.' : pay.reason) + '\n\nRoll without Determination?',
          'Roll without it', 'ghost', 'Cancel roll');
        if(!ok) return false;
        RD4515.toggle(api.KEY, false);
        return true;
      }
      const choice = await appConfirm3Way('Dark Paragon — Determination on this roll.\n\n' + api.priceText(pay) +
        '\n\nThis is your one use this session. ✕ cancels the roll.', 'Pay and roll', 'ghost', 'Roll without it');
      if(choice === 'cancel'){ RD4515.toggle(api.KEY, false); return true; }
      if(choice !== 'ok') return false;
      const now = api.payment();
      api.paidContext = req.context;
      if(now.method !== pay.method || now.before !== pay.before || !api.charge(entry, now)){
        api.paidContext = null;
        RD4515.toggle(api.KEY, false);
        setStatus('Dark Paragon could not be paid; rolled without Determination.');
        return true;
      }
      setStatus('Dark Paragon — Determination: ' + (now.method === 'honor' ? '5 Honor points' : 'a Void Point') + ' spent.');
      return true;
    };

    // ---------- Perfection and Will ----------
    api.use = async function(div){
      const entry = api.entry();
      if(!entry || entry.div !== div || api.MANUAL.indexOf(entry.config.precept) === -1) return false;
      const what = entry.config.precept === 'Perfection'
        ? 'make one chosen die on a Skill Roll explode (no +5). Roll that die again and add it yourself.'
        : 'negate 10 Wounds as you suffer them. Take them off your Wounds yourself.';
      if(!await api.pay(entry, what)) return false;
      setStatus('Dark Paragon — ' + entry.config.precept + ' used: ' + what);
      return true;
    };

    // ---------- Row and picker ----------
    api.info = function(precept){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'dp4523-info';
      button.textContent = 'i';
      button.setAttribute('aria-label', api.NAME + ' information');
      button.addEventListener('click', function(){
        const chosen = precept ? api.precept(precept) : null;
        populateInfoOverlay(api.NAME, 'Reference — Core p.147',
          (chosen ? 'Your precept: ' + chosen[0] + '\n' + chosen[1] + '\n' + chosen[2] + '\n\n' : '') +
          'Choose one precept of Shourido. Once per session, as a Free Action, sacrifice 5 Honor points to invoke it; ' +
          'only if you do not have 5 Honor points may you spend a Void Point instead. The roll gains +5, except where a precept says otherwise.\n\n' +
          'Cost 5 XP, or 4 for a Spider character.\n\n' +
          api.PRECEPTS.map(function(p){ return p[0] + ': ' + p[1]; }).join('\n') + '\n\n' +
          'The sheet takes the payment when you confirm, never on preview or cancel. The four rerolls keep the reroll, not the higher result. ' +
          'Reset the use at the start of each session.');
      });
      return button;
    };
    api.clearRenamed = function(div, name){
      const own = div.querySelector('.dp4523-row');
      if(own && own.dataset.dp4523Name !== normalizeAdvName(name)){ delete div.dataset.advConfig; own.remove(); return; }
      const foreign = api.is(name) && div.querySelector('.adv-config-row:not(.dp4523-row)');
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
        if(!valid) warning = 'Choose your precept of Shourido';
      }
      const row = advConfigRowFor(div);
      row.dataset.dp4523Name = normalizeAdvName(api.NAME);
      row.className = 'adv-config-row dp4523-row ' + (warning ? 'unconfigured' : 'configured');
      row.textContent = '';
      const lead = document.createElement('span');
      lead.className = warning ? 'adv-config-warn dp4523-warning' : 'adv-config-summary dp4523-badge';
      lead.textContent = warning || config.precept;
      row.appendChild(lead);
      if(wrong) return true;
      const change = document.createElement('button');
      change.type = 'button';
      change.className = 'ghost adv-config-btn';
      change.textContent = stored ? 'Change' : 'Choose…';
      change.setAttribute('aria-label', 'Configure ' + api.NAME);
      change.addEventListener('click', function(){ openAdvConfigModal(div); });
      row.appendChild(change);
      row.appendChild(api.info(valid ? config.precept : null));
      if(!valid) return true;
      const p = api.precept(config.precept);
      const reminder = document.createElement('p');
      reminder.className = 'dp4523-reminder';
      reminder.textContent = p[1] + ' ' + p[2] + ' Once per session: 5 Honor points, or a Void Point only without them.';
      row.appendChild(reminder);
      const session = document.createElement('div');
      session.className = 'dp4523-session';
      const state = document.createElement('span');
      state.className = 'dp4523-state';
      state.textContent = config.remaining === 1 ? 'Available this session (1/1)' : 'Used this session (0/1)';
      session.appendChild(state);
      if(api.MANUAL.indexOf(config.precept) !== -1){
        const use = document.createElement('button');
        use.type = 'button';
        use.className = 'ghost dp4523-use';
        use.textContent = 'Use ' + config.precept;
        use.disabled = config.remaining !== 1;
        use.addEventListener('click', function(){ api.use(div); });
        session.appendChild(use);
      }
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'ghost dp4523-reset';
      reset.textContent = 'Reset session';
      reset.title = 'Make Dark Paragon available again for a new session';
      reset.addEventListener('click', function(){ api.reset(div); });
      session.appendChild(reset);
      row.appendChild(session);
      return true;
    };
    api.open = function(div, schema){
      if(!api.enabled() || !api.ownsSchema(schema)) return false;
      if(div.parentElement && div.parentElement.id === 'disadvList'){ setStatus('Dark Paragon belongs in Advantages.'); return true; }
      const config = readAdvConfig(div), valid = api.complete(config);
      advConfigTargetEntry = div;
      advConfigExtendedModal = {kind:'dp4523', schema:schema};
      document.getElementById('advConfigTitle').textContent = api.NAME;
      document.getElementById('advConfigSubtitle').textContent = 'Choose one precept of Shourido';
      const note = document.getElementById('advConfigNote');
      note.textContent = (div.dataset.advConfig && !valid ? 'The saved setting is unsupported. Confirming replaces it. ' : '') +
        'Once per session: 5 Honor points, or a Void Point only without them. Changing the precept does not reset this session’s use.';
      note.style.display = '';
      const grid = document.getElementById('advConfigGrid');
      grid.innerHTML = '<fieldset class="dp4523-picker"><legend class="dp4523-legend">Precept</legend></fieldset><p class="dp4523-error" role="alert" hidden></p>';
      const set = grid.querySelector('.dp4523-picker');
      api.PRECEPTS.forEach(function(p){
        const label = document.createElement('label');
        label.className = 'dp4523-option';
        const radio = document.createElement('input');
        radio.type = 'radio'; radio.name = 'dp4523Precept'; radio.value = p[0];
        radio.checked = valid && config.precept === p[0];
        const text = document.createElement('span');
        const strong = document.createElement('b');
        strong.textContent = p[0];
        text.appendChild(strong);
        text.appendChild(document.createTextNode(' — ' + p[1]));
        label.appendChild(radio); label.appendChild(text);
        set.appendChild(label);
      });
      grid.appendChild(api.info(valid ? config.precept : null));
      document.getElementById('advConfigConfirm').textContent = 'Confirm';
      document.getElementById('advConfigModalOverlay').style.display = 'flex';
      const focus = grid.querySelector('input:checked') || grid.querySelector('input');
      if(focus) focus.focus({preventScroll:true});
      return true;
    };
    api.confirm = function(){
      const state = advConfigExtendedModal;
      if(!api.enabled() || !state || state.kind !== 'dp4523') return false;
      const div = advConfigTargetEntry, name = div && div.querySelector('.en-name');
      if(!div || !div.isConnected || !name || !api.is(name.value)){
        closeAdvConfigModal(); setStatus('The entry changed; open its configuration again.'); return true;
      }
      const picked = document.querySelector('#advConfigGrid input[name="dp4523Precept"]:checked');
      if(!picked || !api.precept(picked.value)){
        const error = document.querySelector('#advConfigGrid .dp4523-error');
        error.textContent = 'Choose a precept before confirming.'; error.hidden = false;
        setStatus(error.textContent);
        return true;
      }
      const before = readAdvConfig(div);
      const remaining = api.complete(before) ? before.remaining : 1;
      return commitExtendedAdvConfig({type:api.TYPE, revision:1, precept:picked.value, value:picked.value, remaining:remaining},
        api.NAME + ': ' + picked.value + '.');
    };
    return api;
  })();

  if(DP4523.enabled()){
    registerAdvConfigSchema(DP4523.NAME, {type:DP4523.TYPE, effect:'dp4523Precept', dp4523:true,
      title:DP4523.NAME, prompt:'Choose one precept of Shourido.'});
    const dp4523PreviousComplete = isExtendedAdvConfigComplete;
    isExtendedAdvConfigComplete = function(schema, config){
      return DP4523.ownsSchema(schema) ? DP4523.complete(config) : dp4523PreviousComplete(schema, config);
    };
    const dp4523PreviousResolve = resolveAdvDisadvEffect;
    resolveAdvDisadvEffect = function(name, config){
      return DP4523.ownsSchema(advConfigSchemaFor(name)) ? DP4523.resolve(config) : dp4523PreviousResolve(name, config);
    };
    const dp4523PreviousRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){ if(!DP4523.refresh(div)) dp4523PreviousRefresh(div); };
    const dp4523PreviousOpen = openExtendedAdvConfigModal;
    openExtendedAdvConfigModal = function(div, schema){ return DP4523.open(div, schema) || dp4523PreviousOpen(div, schema); };
    const dp4523PreviousConfirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){ return DP4523.confirm() || dp4523PreviousConfirm(); };

    // Which roll is being shown. Set when the roll starts and cleared when it settles; the result
    // modal is drawn in between, so the reroll button knows what it would reroll.
    const dp4523PreviousRoll = rollWithModifiers;
    rollWithModifiers = async function(title, context){
      const token = {context:context, damage:DP4523.damageDepth > 0};
      DP4523.current = token;
      try { return await dp4523PreviousRoll.apply(this, arguments); }
      finally { if(DP4523.current === token) DP4523.current = null; }
    };
    // Damage bypasses rollWithModifiers() for library weapons and reaches it through
    // rollNotation() for manual ones; both are marked as damage for Strength.
    const dp4523PreviousDamage = rollWeaponDamage;
    rollWeaponDamage = function(){
      const token = {context:{kind:ROLL_KINDS.DAMAGE}, damage:true};
      DP4523.current = token;
      DP4523.damageDepth++;
      try { return dp4523PreviousDamage.apply(this, arguments); }
      finally { DP4523.damageDepth--; if(DP4523.current === token) DP4523.current = null; }
    };
    if(typeof onAdvConfigRollResult === 'function'){
      const dp4523PreviousResult = onAdvConfigRollResult;
      onAdvConfigRollResult = function(title, result){
        const out = dp4523PreviousResult(title, result);
        DP4523.decorateResult(title, result);
        return out;
      };
    }
    // Declared dependency on Feature 4.5.15 for Determination; guarded, so without it the other
    // six precepts work and Determination is a reminder.
    if(typeof RD4515 === 'object' && RD4515 && RD4515.enabled()){
      RD4515.register('dark-paragon', DP4523.provider);
      if(typeof rollPreviewGate === 'function'){
        const dp4523PreviousGate = rollPreviewGate;
        rollPreviewGate = async function(req){
          const proceed = await dp4523PreviousGate.apply(this, arguments);
          if(!proceed || !req) return proceed;
          if(await DP4523.gate(req)) return proceed;
          RD4515.cancel();
          setStatus('Roll cancelled; Dark Paragon was not used.');
          return false;
        };
      }
    }
    if(typeof advConfigAllSessionResources === 'function'){
      const dp4523PreviousResources = advConfigAllSessionResources;
      advConfigAllSessionResources = function(){
        const resources = dp4523PreviousResources() || [];
        const entry = DP4523.entry();
        if(entry) resources.push({kind:'Dark Paragon', target:entry.config.precept, div:entry.div,
          effect:{remaining:entry.config.remaining, rank:1}});
        return resources;
      };
    }
  }
