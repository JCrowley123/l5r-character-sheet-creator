  // ========= PART I FEATURE 4.5.31: CHECKS AND CONDITIONS =========
  // Thirteen Advantages and Disadvantages that until now only recorded their cost and text. Rules
  // read from the Core Rulebook on 8 October 2026, in our own words:
  //
  //   CHECKS -- a button on the row makes the roll the entry calls for, against its TN:
  //   Brash          p.157  threatened or insulted: Willpower, TN 25, adding your Honor Rank, or
  //                         attack at once
  //   Can't Lie      p.157  a lie told in front of you: Willpower, TN 20, or correct it
  //   Contrary       p.158  a dispute: Willpower against a TN the GM sets, or argue your side
  //   Epilepsy       p.159  a trigger: Willpower, TN 15, or a seizure; Willpower, TN 10, to end one
  //   Overconfident  p.161  a clearly better foe: Perception, TN 20, to see it and back off
  //   Rumormonger    p.161  a rumor to pass on: Willpower, TN 5 x the Glory Rank involved
  //   Soft-Hearted   p.162  to kill: Willpower, TN 20 (afterwards, see its switch below)
  //
  //   TICKS -- unticked by default, offered in the roll preview, the player decides:
  //   Lame           p.160  an Agility roll that uses the legs: TN +10 (Move: Water counts as 1)
  //   Missing Limb   p.161  a roll that needs the missing limb: TN +10 (the limb is chosen on the row)
  //   Disbeliever    p.158  a Social Skill roll involving a shugenja or monk: TN +5
  //
  //   SWITCHES -- saved on the row, applied to every roll while on:
  //   Lost Love      p.160  reminded of the loss: every TN +5 until a Void Point is spent (at most
  //                         twice a day, an hour apart)
  //   Soft-Hearted   p.162  wracked with guilt after a kill: every TN +10 for a day
  //
  //   ALWAYS ON:
  //   Blind          p.156  -3k3 on ranged attacks, -1k1 on melee attacks; the base of the Armor TN
  //                         is Reflexes + 5 (armor and everything else add as normal); Move, Simple
  //                         Move and Perception stay with the player (reminders on the row)
  //   Ishiken-Do     p.151  Shugenja only; lets a shugenja learn and cast Void spells
  //
  // The owner's rulings, 8 October 2026 ("proceed as recommended"):
  //   * Disbeliever is a tick on the seven Social Skill rolls, "A shugenja or monk is involved".
  //   * Void spells need Ishiken-Do. The spell picker and the creation wizard's spell steps grey
  //     the Void spells out ("needs Ishiken-Do"). A Universal spell can never be cast as Void on
  //     this sheet in any case (UNIVERSAL_SPELL_ELEMENTS in 110-modals-trackers.js is Air, Earth,
  //     Fire and Water), so that half of the ruling needed no change; the harness checks it stays
  //     so. A Void spell already on a character is flagged, not removed: the casting report
  //     (Phase 8, Part J) lists it as a blocker and its "?" turns into a cross, but the Cast button
  //     still works -- that report never blocks a cast, and this release keeps it that way. Spell
  //     scrolls in Equipment are untouched: a Void scroll can be carried, just not learned.
  //     Maho is not a prayer to the kami and is left exactly as it was.
  //   * TN +N is reported as -N to the total, the sheet's convention since Doubt (Feature 4.5.9).
  //     Initiative has no TN, so the TN entries leave it alone; no entry here touches damage.
  //
  // THE ARMOR TN CONTRACT (Blind). The trunk works the Armor TN out inside recalcAll
  // (110-modals-trackers.js): it writes the base, Reflexes x 5 + 5, to #f_baseTN and then writes
  // #f_currentTN as that base plus armor, stance, Void, two weapons and Mirumoto (and Phase 4.8
  // adds Shiba's gift to the written value). This release does no Armor TN arithmetic of its own
  // beyond the one thing Blind changes: after the core has written both boxes, it reads the
  // core's base, replaces it with Reflexes + 5, and moves the current TN by exactly the same
  // difference. It assumes only that the current TN CONTAINS the base once, added. Every other
  // part of the sum stays the core's. A second pass sees its own mark and changes nothing.
  //
  // Row state (Lost Love's and Soft-Hearted's switches, Missing Limb's limb) is kept in the row's
  // own data-adv-config as {type:'chk4531', ...}, which the save already carries. Phase 4.5's
  // repaint deletes the setting of an entry it has no schema for, so this release puts back its
  // own setting -- and only its own, on its own entries -- after that repaint has run. Feature
  // 4.5.3 keeps (and flags) a setting whose type no module in the build knows; this release tells
  // it that 'chk4531' is known, so a renamed entry's setting is dropped as for any other.
  //
  // REMOVAL: this file, 59.99994-feat-checks-conditions.css, one seam block and their manifest
  // entries. Every change is a wrapper that keeps the function it replaced (or a registry entry),
  // so deleting this file restores the earlier behaviour exactly. A saved switch or limb is then a
  // setting of a type the build no longer knows, which Feature 4.5.3 keeps untouched and flags.
  const CHECKS_CONDITIONS_ENABLED = true;

  const CHK4531 = (function(){
    const api = {};
    api.TYPE = 'chk4531';
    api.PROVIDER = 'checks-conditions';
    api.enabled = function(){ return CHECKS_CONDITIONS_ENABLED; };
    api.rolls = function(){
      return api.enabled() && typeof ADV_CONFIG_ENABLED !== 'undefined' && ADV_CONFIG_ENABLED &&
        typeof ADV_CONFIG_ROLL_EFFECTS_ENABLED !== 'undefined' && ADV_CONFIG_ROLL_EFFECTS_ENABLED;
    };
    // "Can’t Lie" is catalogued with a curly apostrophe; a typed name may use a straight one.
    api.norm = function(value){
      return String(value || '').trim().replace(/\s+/g, ' ').replace(/[’ʼ`']/g, '\'').toLowerCase();
    };
    api.base = function(name){ return api.norm(String(name || '').replace(/\(.*$/, '').split(':')[0]); };
    api.isKind = function(context, kinds){
      return !!context && typeof ROLL_KINDS === 'object' && !!ROLL_KINDS &&
        kinds.some(function(k){ return context.kind === ROLL_KINDS[k]; });
    };
    // A roll with a TN the entries here can raise: every kind except damage and initiative.
    api.hasTN = function(context){ return !!context && !api.isKind(context, ['DAMAGE', 'INITIATIVE']); };
    // Only rows on the entry's own list count, as for every Phase 4.5 entry.
    api.LIST = {
      'brash':'disadvList', 'can\'t lie':'disadvList', 'contrary':'disadvList', 'epilepsy':'disadvList',
      'overconfident':'disadvList', 'rumormonger':'disadvList', 'soft-hearted':'disadvList',
      'lame':'disadvList', 'missing limb':'disadvList', 'disbeliever':'disadvList', 'lost love':'disadvList',
      'blind':'disadvList', 'ishiken-do':'advList',
    };
    api.rows = function(name){
      const key = api.norm(name), list = document.getElementById(api.LIST[key] || '');
      if(!list) return [];
      return Array.prototype.filter.call(list.querySelectorAll('.entry'), function(div){
        const n = div.querySelector('.en-name');
        return !!n && api.norm(n.value) === key;
      });
    };
    api.has = function(name){ return api.rows(name).length > 0; };
    api.owns = function(div){
      const n = div && div.querySelector('.en-name');
      const key = n ? api.norm(n.value) : '';
      return !!key && !!div.parentElement && api.LIST[key] === div.parentElement.id ? key : '';
    };

    // ---------- Row state ----------
    api.STATEFUL = ['lost love', 'soft-hearted', 'missing limb'];
    api.state = function(div){
      const c = typeof readAdvConfig === 'function' ? readAdvConfig(div) : null;
      return c && c.type === api.TYPE ? c : {};
    };
    api.setState = function(div, patch){
      if(typeof writeAdvConfig !== 'function') return;
      writeAdvConfig(div, api.TYPE, Object.assign({}, api.state(div), patch));
    };
    // The raw setting to put back after Phase 4.5's repaint, or null.
    api.keep = function(div){
      if(!api.enabled() || !div || !div.dataset || !div.dataset.advConfig) return null;
      if(api.STATEFUL.indexOf(api.owns(div)) === -1) return null;
      return api.state(div).type === api.TYPE ? div.dataset.advConfig : null;
    };
    api.on = function(name, field){
      return api.rows(name).some(function(div){ return api.state(div)[field] === true; });
    };
    api.LIMBS = ['Left arm', 'Right arm', 'Left leg', 'Right leg'];
    api.limb = function(){
      let found = '';
      api.rows('Missing Limb').forEach(function(div){
        const l = api.state(div).limb;
        if(!found && api.LIMBS.indexOf(l) !== -1) found = l;
      });
      return found;
    };

    // ---------- What the character has ----------
    api.trait = function(name){
      const v = typeof getTraitValueByName === 'function' ? getTraitValueByName(name) : NaN;
      return Number.isFinite(v) ? v : NaN;
    };
    api.honorRank = function(){
      const rank = parseInt((document.getElementById('f_honorRank') || {}).value, 10);
      if(Number.isFinite(rank)) return rank;
      const points = parseFloat((document.getElementById('f_honorPts') || {}).value);
      return Number.isFinite(points) ? Math.floor(points) : 0;
    };
    // Failure of Bushido configured with the Honor tenet: "you cannot add your Honor Rank".
    api.honorBarred = function(){
      if(typeof D45 !== 'object' || !D45 || typeof D45.active !== 'function') return false;
      try {
        return D45.active('Failure of Bushido').some(function(i){ return i && i.effect && i.effect.tenet === 'Honor'; });
      } catch(e){ return false; }
    };
    api.shugenja = function(){ return typeof characterCasterLock === 'function' && characterCasterLock() === 'shugenja'; };

    // ---------- Checks ----------
    // tn(row) may return NaN, with the reason in api.lastProblem, when the row's box is empty.
    api.CHECKS = {
      'brash':{name:'Brash', trait:'Willpower', tn:function(){ return 25; }, source:'Core Rulebook p.157',
        why:'when threatened or insulted', success:'You keep your temper.',
        fail:'You attack (or challenge) the one who provoked you, at once. Tell the GM: the sheet does not act for you.'},
      'can\'t lie':{name:'Can’t Lie', trait:'Willpower', tn:function(){ return 20; }, source:'Core Rulebook p.157',
        why:'when a lie is told in front of you', success:'You let the lie stand.',
        fail:'You must correct the lie. Tell the GM: the sheet does not act for you.'},
      'contrary':{name:'Contrary', trait:'Willpower', source:'Core Rulebook p.158', box:'tn',
        tn:function(row){ return api.boxValue(row, 'TN'); },
        why:'when a dispute is going on', success:'You hold your tongue.',
        fail:'You must argue your side of the dispute. Tell the GM: the sheet does not act for you.'},
      'epilepsy':{name:'Epilepsy', trait:'Willpower', tn:function(){ return 15; }, source:'Core Rulebook p.159',
        why:'to avoid a seizure', success:'No seizure.',
        fail:'You have a seizure. Tell the GM: the sheet does not act for you. Each round, the End seizure button rolls to end it.'},
      'epilepsy-end':{name:'Epilepsy', trait:'Willpower', tn:function(){ return 10; }, source:'Core Rulebook p.159',
        why:'to end a seizure', success:'The seizure ends.', fail:'The seizure goes on.'},
      'overconfident':{name:'Overconfident', trait:'Perception', tn:function(){ return 20; }, source:'Core Rulebook p.161',
        why:'to see that a foe is clearly better than you', success:'You see the danger and may back off.',
        fail:'You do not see it, and press on. Tell the GM: the sheet does not act for you.'},
      'rumormonger':{name:'Rumormonger', trait:'Willpower', source:'Core Rulebook p.161', box:'glory',
        tn:function(row){ const g = api.boxValue(row, 'the Glory Rank'); return Number.isFinite(g) ? 5 * g : NaN; },
        why:'to keep a rumor to yourself', success:'You keep it to yourself.',
        fail:'You pass the rumor on. Tell the GM: the sheet does not act for you.'},
      'soft-hearted':{name:'Soft-Hearted', trait:'Willpower', tn:function(){ return 20; }, source:'Core Rulebook p.162',
        why:'to kill', success:'You can do it. Afterwards, turn on “Wracked with guilt”: every TN is 10 higher for a day.',
        fail:'You cannot bring yourself to kill. Tell the GM: the sheet does not act for you.'},
    };
    api.lastProblem = '';
    api.boxValue = function(row, what){
      const box = row && row.querySelector('.chk4531-input');
      const v = box ? parseInt(box.value, 10) : NaN;
      if(!Number.isFinite(v) || v < 0){ api.lastProblem = 'Enter ' + what + ' first.'; return NaN; }
      return v;
    };
    api.check = function(key, row){
      const spec = api.CHECKS[key];
      if(!api.enabled() || !spec) return Promise.resolve(null);
      if(typeof rollWithModifiers !== 'function' || typeof makeRollContext !== 'function' ||
         typeof ROLL_KINDS !== 'object' || !ROLL_KINDS) return Promise.resolve(null);
      const value = api.trait(spec.trait);
      if(!Number.isFinite(value) || value < 1){
        if(typeof appAlert === 'function') appAlert('Enter a valid ' + spec.trait + ' Rank before making this check.');
        return Promise.resolve(null);
      }
      api.lastProblem = '';
      const tn = spec.tn(row);
      if(!Number.isFinite(tn)){
        if(typeof appAlert === 'function') appAlert(api.lastProblem || 'Enter the TN first.');
        return Promise.resolve(null);
      }
      const context = makeRollContext(ROLL_KINDS.TRAIT, {traitName:spec.trait, traitValue:value, chk4531:key});
      return rollWithModifiers(spec.name + ' — ' + spec.trait + ' vs TN ' + tn, context, value, value,
        {tnConfig:{tn:tn, successText:spec.success, failText:spec.fail}});
    };

    // ---------- Roll modifiers ----------
    api.ranged = function(c){
      return api.isKind(c, ['ATTACK']) && typeof isRangedWeapon === 'function' && !!c.weaponEntry && !!isRangedWeapon(c.weaponEntry);
    };
    api.SOCIAL = Object.freeze(['acting', 'courtier', 'etiquette', 'perform', 'sincerity', 'intimidation', 'temptation']);
    api.social = function(c){ return api.isKind(c, ['SKILL']) && api.SOCIAL.indexOf(api.base(c.skillName)) !== -1; };
    api.modifiers = function(context){
      if(!api.rolls() || !context || api.isKind(context, ['DAMAGE'])) return [];
      const out = [];
      if(context.chk4531 === 'brash' && api.isKind(context, ['TRAIT']) && api.has('Brash')){
        if(api.honorBarred()){
          out.push({source:'adv-config', label:'Brash', informational:true, display:'Honor Rank not added',
            note:'Failure of Bushido (Honor): you cannot add your Honor Rank. Core Rulebook p.157.'});
        } else {
          const rank = api.honorRank();
          if(rank) out.push({source:'adv-config', label:'Brash: Honor Rank', rolledDelta:0, keptDelta:0, totalDelta:rank,
            note:'Your Honor Rank is added to this check. Core Rulebook p.157.'});
        }
      }
      if(api.hasTN(context) && api.on('Lost Love', 'reminded')){
        out.push({source:'adv-config', label:'Lost Love', rolledDelta:0, keptDelta:0, totalDelta:-5,
          note:'Reminded of your loss: TN +5 until you spend a Void Point. Core Rulebook p.160.'});
      }
      if(api.hasTN(context) && api.on('Soft-Hearted', 'guilt')){
        out.push({source:'adv-config', label:'Soft-Hearted', rolledDelta:0, keptDelta:0, totalDelta:-10,
          note:'Wracked with guilt: TN +10 for a day after a kill. Core Rulebook p.162.'});
      }
      if(api.has('Blind')){
        if(api.isKind(context, ['ATTACK'])){
          const ranged = api.ranged(context);
          out.push({source:'adv-config', label:'Blind', rolledDelta:ranged ? -3 : -1, keptDelta:ranged ? -3 : -1,
            note:(ranged ? 'Ranged' : 'Melee') + ' attack. Core Rulebook p.156.'});
        }
        if(api.norm(context.traitName) === 'perception'){
          out.push({source:'adv-config', label:'Blind', informational:true, display:'other senses only',
            note:'a Perception roll is only possible with your other senses: your GM decides. Core Rulebook p.156.'});
        }
      }
      return out;
    };

    // ---------- Ticks (Feature 4.5.15's registry) ----------
    api.TICKS = [
      {key:'lame', name:'Lame', source:'Core Rulebook p.160', delta:-10,
        label:function(){ return 'Uses your legs: TN +10'; },
        when:function(c){ return api.hasTN(c) && api.norm(c.traitName) === 'agility'; }},
      {key:'missing-limb', name:'Missing Limb', source:'Core Rulebook p.161', delta:-10,
        label:function(){ const l = api.limb(); return 'Uses your ' + (l ? l.toLowerCase() : 'missing limb') + ': TN +10'; },
        when:function(c){ return api.hasTN(c); }},
      {key:'disbeliever', name:'Disbeliever', source:'Core Rulebook p.158', delta:-5,
        label:function(){ return 'A shugenja or monk is involved: TN +5'; },
        when:function(c){ return api.social(c); }},
    ];
    api.tick = function(key){ return api.TICKS.find(function(t){ return t.key === key; }) || null; };
    api.ticks = function(context){
      if(!api.rolls() || !context) return [];
      return api.TICKS.filter(function(t){
        try { return api.has(t.name) && t.when(context) === true; } catch(e){ return false; }
      });
    };
    api.provider = {
      label:'Disadvantages',
      offers:function(context){
        return api.ticks(context).map(function(t){
          return {key:t.key, label:t.name + ': ' + t.label(), note:'Reported as ' + t.delta + ' to the total. ' + t.source + '.'};
        });
      },
      modifiers:function(context, keys){
        const offered = api.ticks(context).map(function(t){ return t.key; });
        return (keys || []).filter(function(k){ return offered.indexOf(k) !== -1; }).map(api.tick).map(function(t){
          return {label:t.name, rolledDelta:0, keptDelta:0, totalDelta:t.delta, note:'Declared: ' + t.label()};
        });
      },
    };

    // ---------- Blind: the Armor TN adapter (see THE ARMOR TN CONTRACT above) ----------
    api.adjustArmorTN = function(){
      const baseEl = document.getElementById('f_baseTN'), currentEl = document.getElementById('f_currentTN');
      if(!baseEl || !currentEl) return;
      try {
        if(!api.enabled() || !api.has('Blind')){ delete baseEl.dataset.chk4531; return; }
        // Our own mark: the core has not rewritten the base since this adapter last ran.
        if(baseEl.dataset.chk4531 !== undefined && baseEl.dataset.chk4531 === String(baseEl.value)) return;
        const coreBase = parseFloat(baseEl.value);
        const reflexes = api.trait('Reflexes');
        if(!Number.isFinite(coreBase) || !Number.isFinite(reflexes)) return;
        const blindBase = reflexes + 5;
        const current = parseFloat(currentEl.value);
        baseEl.value = blindBase;
        if(Number.isFinite(current)) currentEl.value = current + (blindBase - coreBase);
        baseEl.dataset.chk4531 = String(baseEl.value);
        // Quick Access was painted earlier in the same recalc; it mirrors #f_currentTN, so repaint it.
        if(typeof renderQuickAccessPanel === 'function') renderQuickAccessPanel();
      } catch(e){ /* an error here must never break the Armor TN: the core's value stands */ }
    };

    // ---------- Ishiken-Do: Void spells ----------
    let bypass = 0;
    api.withoutGate = function(fn){ bypass++; try { return fn(); } finally { bypass--; } };
    api.gating = function(){
      return api.enabled() && !(typeof hasAdvantageNamed === 'function' ? hasAdvantageNamed('Ishiken-Do') : api.has('Ishiken-Do'));
    };
    api.voidGated = function(spell){
      return bypass === 0 && !!spell && spell.element === 'Void' && spell.maho !== true && api.gating();
    };
    api.GATE_TEXT = 'needs Ishiken-Do';
    // The Technique picker: Void spells it would list are disabled, with the reason in the label.
    api.greyPicker = function(html){
      if(!api.gating() || typeof SPELL_LIBRARY === 'undefined') return html;
      const esc = typeof escAttr === 'function' ? escAttr : function(s){ return String(s); };
      return String(html)
        .replace(/<optgroup label="Void Spells">/g, '<optgroup label="Void Spells (' + api.GATE_TEXT + ')">')
        .replace(/<option value="spell:(\d+)"([^>]*)>([^<]*)<\/option>/g, function(all, idx, attrs, label){
          const s = SPELL_LIBRARY[parseInt(idx, 10)];
          if(!s || s.element !== 'Void' || s.maho === true) return all;
          const head = esc(s.name + ' (' + s.element + ' ' + s.mastery + ')');
          const text = label.indexOf(head) === 0
            ? head + ' — ' + api.GATE_TEXT + label.slice(head.length)
            : label + ' — ' + api.GATE_TEXT;
          return '<option value="spell:' + idx + '" disabled>' + text + '</option>';
        });
    };
    // The creation wizard's spell pickers: option values are SPELL_LIBRARY indexes.
    api.WIZARD_PICKERS = 'select[id^="cw1122Spell"], select[id^="cw1123Pick"], select[id^="cw1124Pick"]';
    api.greyWizard = function(body){
      if(!body || !api.gating() || typeof SPELL_LIBRARY === 'undefined') return;
      body.querySelectorAll(api.WIZARD_PICKERS).forEach(function(sel){
        Array.prototype.forEach.call(sel.options, function(o){
          if(!/^\d+$/.test(o.value)) return;
          const s = SPELL_LIBRARY[parseInt(o.value, 10)];
          if(!s || s.element !== 'Void' || s.maho === true || o.disabled) return;
          o.disabled = true;
          o.textContent += ' — ' + api.GATE_TEXT;
        });
        Array.prototype.forEach.call(sel.querySelectorAll('optgroup'), function(g){
          if(g.label === 'Void') g.label = 'Void (' + api.GATE_TEXT + ')';
        });
      });
    };
    // The casting report: a Void spell on the list without Ishiken-Do. Reported, never blocked.
    api.diagnostic = function(ctx){
      if(!ctx || ctx.isMaho || ctx.elementKey !== 'void' || !api.gating() || typeof castingFinding !== 'function') return null;
      return castingFinding('ishiken-do', 'blocker', 'Needs Ishiken-Do',
        'Void spells need the Ishiken-Do Advantage (Core Rulebook p.151), which only a shugenja may take. ' +
        'The spell stays on your list and the Cast button still works: this report never stops a cast.');
    };
    api.ishikenIneligible = function(name){
      return api.enabled() && api.norm(name) === 'ishiken-do' && !api.shugenja() ? 'Shugenja only' : null;
    };

    // ---------- The rows ----------
    api.make = function(tag, cls, text){
      const el = document.createElement(tag);
      if(cls) el.className = cls;
      if(text !== undefined) el.textContent = text;
      return el;
    };
    api.button = function(text, label, run){
      const b = api.make('button', 'ghost chk4531-btn', text);
      b.type = 'button';
      b.setAttribute('aria-label', label);
      b.addEventListener('click', run);
      return b;
    };
    api.checkButton = function(key, row, text){
      const spec = api.CHECKS[key];
      return api.button(text, spec.name + ': ' + spec.trait + ' Trait Roll ' + spec.why, function(){ api.check(key, row); });
    };
    api.box = function(label, value, min){
      const wrap = api.make('label', 'chk4531-field');
      wrap.appendChild(document.createTextNode(label + ' '));
      const input = api.make('input', 'chk4531-input');
      input.type = 'number'; input.inputMode = 'numeric'; input.min = String(min);
      if(value !== '') input.value = value;
      wrap.appendChild(input);
      return wrap;
    };
    api.toggle = function(div, field, text){
      const wrap = api.make('label', 'chk4531-switch');
      const input = api.make('input', 'chk4531-toggle');
      input.type = 'checkbox';
      input.dataset.chk4531 = field;
      input.checked = api.state(div)[field] === true;
      // Saved on 'input' as well as 'change': a tick fires 'input' first, and the list's own
      // listener recalcs on it, which redraws this switch from the saved state. Saving here first
      // keeps the two in step; whichever event comes second finds nothing to change.
      const save = function(){
        if((api.state(div)[field] === true) === input.checked) return;
        const patch = {}; patch[field] = input.checked;
        api.setState(div, patch);
        if(typeof recalcAll === 'function') recalcAll();
      };
      input.addEventListener('input', save);
      input.addEventListener('change', save);
      wrap.appendChild(input);
      wrap.appendChild(document.createTextNode(text));
      return wrap;
    };
    api.note = function(text){ return api.make('span', 'chk4531-note', text); };
    api.spendVoid = function(div){
      if(typeof getVoidPoints !== 'function' || typeof consumeVoidPoint !== 'function') return false;
      if(getVoidPoints() <= 0){
        if(typeof appAlert === 'function') appAlert('No Void Points remaining.');
        return false;
      }
      consumeVoidPoint();
      api.setState(div, {reminded:false});
      if(typeof recalcAll === 'function') recalcAll();
      if(typeof setStatus === 'function') setStatus('Lost Love: a Void Point spent to set the memory aside.');
      return true;
    };
    // What one row carries. sig changes only when the row has to be rebuilt, so a typed TN or Glory
    // Rank survives a recalc.
    api.want = function(key){
      if(key === 'ishiken-do') return api.shugenja() ? null : {sig:'ishiken-note'};
      return api.LIST[key] ? {sig:key} : null;
    };
    api.build = function(div, key, row){
      const add = function(el){ row.appendChild(el); };
      switch(key){
        case 'brash':
          add(api.checkButton('brash', row, 'Check (TN 25)'));
          add(api.note(api.honorBarred() ? 'Honor Rank not added: Failure of Bushido (Honor).' : 'Adds your Honor Rank.'));
          break;
        case 'can\'t lie': add(api.checkButton('can\'t lie', row, 'Check (TN 20)')); break;
        case 'contrary':
          add(api.box('TN', '15', 5));
          add(api.checkButton('contrary', row, 'Check'));
          break;
        case 'epilepsy':
          add(api.checkButton('epilepsy', row, 'Avoid (TN 15)'));
          add(api.checkButton('epilepsy-end', row, 'End seizure (TN 10)'));
          break;
        case 'overconfident': add(api.checkButton('overconfident', row, 'Check (TN 20)')); break;
        case 'rumormonger':
          add(api.box('Glory Rank', '', 0));
          add(api.checkButton('rumormonger', row, 'Check (TN 5 × Glory)'));
          break;
        case 'soft-hearted':
          add(api.checkButton('soft-hearted', row, 'Check (TN 20)'));
          add(api.toggle(div, 'guilt', 'Wracked with guilt (TN +10)'));
          break;
        case 'lame': add(api.note('Ticks on Agility rolls. Move: your Water counts as 1.')); break;
        case 'missing limb': {
          const label = api.make('label', 'chk4531-field', 'Missing ');
          const sel = api.make('select', 'chk4531-limb');
          sel.setAttribute('aria-label', 'Which limb is missing');
          sel.appendChild(new Option('— choose —', ''));
          api.LIMBS.forEach(function(l){ sel.appendChild(new Option(l, l)); });
          sel.value = api.LIMBS.indexOf(api.state(div).limb) !== -1 ? api.state(div).limb : '';
          const save = function(){ if(api.state(div).limb !== sel.value) api.setState(div, {limb:sel.value}); };
          sel.addEventListener('input', save);
          sel.addEventListener('change', save);
          label.appendChild(sel);
          add(label);
          add(api.note('Ticks on every roll but damage.'));
          break;
        }
        case 'disbeliever': add(api.note('Ticks on Social Skill rolls.')); break;
        case 'lost love': {
          add(api.toggle(div, 'reminded', 'Reminded of your loss (TN +5)'));
          add(api.button('Spend a Void Point', 'Lost Love: spend a Void Point to set the memory aside', function(){ api.spendVoid(div); }));
          add(api.note('At most twice a day, an hour apart.'));
          break;
        }
        case 'blind':
          add(api.note('Armor TN uses Reflexes + 5. Move: Water counts 2 lower. Simple Move (Athletics / Agility): TN 20. Perception: other senses only, your GM decides.'));
          break;
        case 'ishiken-do':
          add(api.note('Not in effect: needs a Shugenja School.'));
          break;
      }
    };
    api.decorateRow = function(div){
      const key = api.owns(div);
      const want = key ? api.want(key) : null;
      let row = div.querySelector('.chk4531-row');
      if(!want){ if(row) row.remove(); return; }
      if(!row || row.dataset.chk4531 !== want.sig){
        if(!row){
          row = api.make('div', 'chk4531-row');
          const top = div.querySelector('.entry-top');
          if(top && top.nextSibling) div.insertBefore(row, top.nextSibling); else div.appendChild(row);
        }
        row.dataset.chk4531 = want.sig;
        row.textContent = '';
        api.build(div, key, row);
      }
      // Switches follow the saved state on every pass (a load, an undo, a Void Point spent).
      row.querySelectorAll('.chk4531-toggle').forEach(function(t){ t.checked = api.state(div)[t.dataset.chk4531] === true; });
      const brashNote = key === 'brash' ? row.querySelector('.chk4531-note') : null;
      if(brashNote){
        const text = api.honorBarred() ? 'Honor Rank not added: Failure of Bushido (Honor).' : 'Adds your Honor Rank.';
        if(brashNote.textContent !== text) brashNote.textContent = text;
      }
    };
    api.decorate = function(){
      if(!api.enabled()) return;
      document.querySelectorAll('#advList .entry, #disadvList .entry').forEach(api.decorateRow);
    };
    api.refresh = function(){
      api.decorate();
      api.adjustArmorTN();
    };
    return api;
  })();

  if(CHK4531.enabled()){
    // Roll modifiers, through Phase 4.5's existing adv-config seat (no new registry seat).
    if(typeof advConfigExtendedRollModifiers === 'function'){
      const chk4531PreviousModifiers = advConfigExtendedRollModifiers;
      advConfigExtendedRollModifiers = function(context){
        return (chk4531PreviousModifiers(context) || []).concat(CHK4531.modifiers(context));
      };
    }
    // Ticks, through the declaration registry (Feature 4.5.15). Without it nothing is offered.
    if(typeof RD4515 === 'object' && RD4515) RD4515.register(CHK4531.PROVIDER, CHK4531.provider);

    // Row settings survive Phase 4.5's repaint (see the comment at the top).
    if(typeof refreshAdvConfigControl === 'function'){
      const chk4531PreviousControl = refreshAdvConfigControl;
      refreshAdvConfigControl = function(div){
        const kept = CHK4531.keep(div);
        const result = chk4531PreviousControl.apply(this, arguments);
        if(kept && div && div.dataset && !div.dataset.advConfig) div.dataset.advConfig = kept;
        return result;
      };
    }

    // Feature 4.5.3: 'chk4531' is a type this build understands (see the comment at the top).
    if(typeof R453 === 'object' && R453 && typeof R453.isUnknownConfigType === 'function'){
      const chk4531PreviousUnknown = R453.isUnknownConfigType;
      R453.isUnknownConfigType = function(type){
        return type === CHK4531.TYPE ? false : chk4531PreviousUnknown.apply(this, arguments);
      };
    }

    // The rows and Blind's Armor TN follow every recalc: refreshAllAdvConfigControls is called by
    // name from the trunk's recalcAll, after the Armor TN is written and before Quick Access reads it.
    if(typeof refreshAllAdvConfigControls === 'function'){
      const chk4531PreviousRefresh = refreshAllAdvConfigControls;
      refreshAllAdvConfigControls = function(){
        const result = chk4531PreviousRefresh.apply(this, arguments);
        CHK4531.refresh();
        return result;
      };
    }

    // Ishiken-Do: Shugenja only, greyed out in the Advantage picker (Feature 4.5.5's standard).
    if(typeof R455 === 'object' && R455 && typeof R455.ineligible === 'function'){
      const chk4531PreviousIneligible = R455.ineligible;
      R455.ineligible = function(name){
        const block = R455.enabled() ? CHK4531.ishikenIneligible(name) : null;
        return block || chk4531PreviousIneligible.apply(this, arguments);
      };
    }

    // Void spells need Ishiken-Do. Learning: the wizard and the picker's own safety check ask
    // spellEligibility(); the picker itself lists the Void spells greyed out instead of hiding them.
    if(typeof spellEligibility === 'function'){
      const chk4531PreviousEligibility = spellEligibility;
      spellEligibility = function(s){
        const out = chk4531PreviousEligibility.apply(this, arguments);
        return out && out.eligible && CHK4531.voidGated(s) ? Object.assign({}, out, {eligible:false, needsIshikenDo:true}) : out;
      };
    }
    if(typeof techQuickAddOptionsHTML === 'function'){
      const chk4531PreviousOptions = techQuickAddOptionsHTML;
      techQuickAddOptionsHTML = function(){
        const self = this, args = arguments;
        return CHK4531.greyPicker(CHK4531.withoutGate(function(){ return chk4531PreviousOptions.apply(self, args); }));
      };
    }
    if(typeof CW1122 === 'object' && CW1122 && CW1122.spellsStep && typeof CW1122.spellsStep.render === 'function'){
      const chk4531PreviousSpellsRender = CW1122.spellsStep.render;
      CW1122.spellsStep.render = function(body){
        const self = this, args = arguments;
        const result = CHK4531.withoutGate(function(){ return chk4531PreviousSpellsRender.apply(self, args); });
        CHK4531.greyWizard(body);
        return result;
      };
    }
    // Casting: the casting report (Phase 8, Part J) flags a Void spell on the list.
    if(typeof registerCastingDiagnostic === 'function') registerCastingDiagnostic('ishiken-do', 15, CHK4531.diagnostic);

    // Missing Limb's limb is a purchased choice: read-only in Play, like the other row editors.
    if(typeof MODES12 === 'object' && MODES12 && typeof MODES12.register === 'function') MODES12.register('#disadvList .chk4531-limb');
  }
