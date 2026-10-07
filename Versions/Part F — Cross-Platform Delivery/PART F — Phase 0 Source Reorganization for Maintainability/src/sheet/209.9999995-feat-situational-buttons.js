  // ========= PART I FEATURE 4.5.28: SITUATIONAL ENTRY BUTTONS AND GATES =========
  // The owner's device check of Feature 4.5.27 (7 October 2026) and the rulings taken on it:
  //
  //   * Wary (Core p.155) names one roll: Investigation (Notice) / Perception against Stealth
  //     (Ambush) / Agility, to detect an ambush. A "Spot ambush" button on its row makes that
  //     roll with Wary's +1k1 applied as a modifier, as Recall's is. Wary is no longer a tick on
  //     any roll. The Notice Emphasis is handled as for any Skill Roll: if the character has it,
  //     its re-roll of 1s is offered after; the roll does not need it (the notation names the
  //     roll), as the owner confirmed on 7 October.
  //   * Precise Memory (Core p.152): a "Recall" button on its row makes an Intelligence Trait
  //     Roll with its +1k1 applied as a modifier, not a tick. It is no longer offered on
  //     ordinary Intelligence rolls.
  //   * Imperial Scribe (Status 2+, Calligraphy 4+; Imperial Histories p.67) and Sacrosanct
  //     (Honor 6.0+) are gated to Feature 4.5.5's standard: greyed out in the Advantage picker
  //     with the requirement in the label, and on a row already on a character that does not
  //     meet it, the row says why and Imperial Scribe's +1k0 and Free Raise are not offered. This
  //     reverses Feature 4.5.27's deferral of Imperial Scribe's requirements, on the owner's word.
  //     Neither entry is repriced or removed: the XP the player agreed stays as it is.
  //
  // Status and Honor are read from their Points fields (the full value, such as 6.2), falling
  // back to the Rank field when Points is empty; Calligraphy is the highest Rank on the Skills
  // table. All read afresh on every recalc, so raising Status unlocks the entry at once.
  //
  // Real-device corrections, 7 October 2026 (the owner's checklist for this release):
  //   * Wary's tick on the Spot ambush roll was redundant: the bonus is now applied directly.
  //   * Changing a Skill's Rank did not redraw a row's requirement note: the Skills table's
  //     listeners hold the trunk's own recalcAll, captured before any wrapper existed, so a
  //     recalcAll wrapper never sees that change. The rows and the picker are now refreshed from
  //     refreshAllAdvConfigControls, which the trunk's recalcAll calls by name on every pass.
  //     Honor and Status have no recalc listener at all, so their boxes refresh them directly.
  //
  // Everything here extends Feature 4.5.27 (a hard dependency: without it this does nothing) and
  // Feature 4.5.5 from outside, by property or by wrapping, so deleting this fragment restores
  // their behaviour exactly.
  const SITUATIONAL_BUTTONS_ENABLED = true;

  const SIT4528 = (function(){
    const api = {};
    api.enabled = function(){
      return SITUATIONAL_BUTTONS_ENABLED && typeof SIT4527 === 'object' && !!SIT4527;
    };
    // The two buttons and their bonuses follow Feature 4.5.27's own switches.
    api.rolls = function(){ return api.enabled() && SIT4527.enabled(); };
    api.norm = function(value){ return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase(); };

    // ---------- What the character has ----------
    api.value = function(name){
      const field = function(id){ const el = document.getElementById(id); return el ? parseFloat(el.value) : NaN; };
      const points = field('f_' + name + 'Pts');
      if(Number.isFinite(points)) return points;
      const rank = field('f_' + name + 'Rank');
      return Number.isFinite(rank) ? rank : 0;
    };
    // The highest Rank on the Skills table, whatever Emphasis or subject a row names.
    api.skillRank = function(name){
      const want = api.norm(name);
      let best = 0;
      document.querySelectorAll('#skillsBody tr').forEach(function(row){
        const n = row.querySelector('.sk-name'), r = row.querySelector('.sk-rank');
        if(n && r && api.norm(String(n.value).replace(/\(.*$/, '').split(':')[0]) === want){
          best = Math.max(best, parseInt(r.value || '0', 10) || 0);
        }
      });
      return best;
    };
    api.owns = function(name){ return api.rolls() && SIT4527.has(name); };

    // ---------- Requirements ----------
    // label: the short form the picker appends; unmet(): the parts not yet met, for the row.
    const one = function(n){ return n.toFixed(1); };
    api.GATES = {
      'imperial scribe':{name:'Imperial Scribe', label:'needs Status 2+ and Calligraphy 4+', unmet:function(){
        const out = [], status = api.value('status'), rank = api.skillRank('Calligraphy');
        if(status < 2) out.push('Status 2.0+ (yours ' + one(status) + ')');
        if(rank < 4) out.push('Calligraphy Rank 4+ (yours ' + rank + ')');
        return out;
      }},
      'sacrosanct':{name:'Sacrosanct', label:'needs Honor 6.0+', unmet:function(){
        const honor = api.value('honor');
        return honor < 6 ? ['Honor 6.0+ (yours ' + one(honor) + ')'] : [];
      }},
    };
    api.ineligibility = function(name){
      if(!api.enabled()) return null;
      const gate = api.GATES[api.norm(name)];
      if(!gate) return null;
      const unmet = gate.unmet();
      if(!unmet.length) return null;
      return {label:gate.label, reason:'Not in effect: needs ' + unmet.join(' and ') + '.' +
        (gate.name === 'Imperial Scribe' ? ' Its +1k0 and Free Raise are not offered until then.' : '')};
    };

    // ---------- The two rolls ----------
    // A roll made from a row's button carries sit4528 on its context: 'ambush' or 'recall'.
    // rollSkill() builds its own context, so the Spot ambush roll is marked by the next
    // rollWithModifiers() call it makes (synchronously, before its first await); the mark is
    // cleared whether or not that call happens.
    let pending = null;
    api.markNext = function(mark){
      const out = pending === mark && mark !== null;
      pending = null;
      return out;
    };
    api.ambush = function(){
      if(!api.owns('Wary') || typeof rollSkill !== 'function') return Promise.resolve(null);
      pending = 'ambush';
      try { return Promise.resolve(rollSkill('Investigation', 'Perception', api.skillRank('Investigation'))); }
      finally { pending = null; }
    };
    api.recall = function(){
      if(!api.owns('Precise Memory') || typeof rollWithModifiers !== 'function' || typeof makeRollContext !== 'function') return Promise.resolve(null);
      const rank = typeof getTraitValueByName === 'function' ? getTraitValueByName('Intelligence') : NaN;
      if(!Number.isFinite(rank) || rank < 1){
        if(typeof appAlert === 'function') appAlert('Enter a valid Intelligence Rank before making this roll.');
        return Promise.resolve(null);
      }
      return rollWithModifiers('Recall — Intelligence Trait Roll',
        makeRollContext(ROLL_KINDS.TRAIT, {traitName:'Intelligence', traitValue:rank, sit4528:'recall'}), rank, rank);
    };

    // Both buttons' bonuses are applied to their own roll (and a reroll of it, which reads the
    // same context) and to nothing else: only a context a button marked carries them.
    api.modifiers = function(context){
      if(!api.rolls() || !context || typeof ROLL_KINDS !== 'object' || !ROLL_KINDS) return [];
      const out = [];
      if(context.sit4528 === 'recall' && context.kind === ROLL_KINDS.TRAIT && SIT4527.has('Precise Memory')){
        out.push({source:'adv-config', label:'Precise Memory', rolledDelta:1, keptDelta:1,
          note:'Recall: remembering something exactly. Core Rulebook p.152.'});
      }
      if(context.sit4528 === 'ambush' && context.kind === ROLL_KINDS.SKILL && SIT4527.has('Wary')){
        out.push({source:'adv-config', label:'Wary', rolledDelta:1, keptDelta:1,
          note:'Spot ambush: detecting an ambush. Core Rulebook p.155.'});
      }
      return out;
    };

    // ---------- Feature 4.5.27's entries, retuned from outside ----------
    api.retune = function(){
      const wary = SIT4527.entry('wary'), memory = SIT4527.entry('precise-memory'), scribe = SIT4527.entry('imperial-scribe');
      if(wary) wary.when = function(){ return false; };
      if(memory) memory.when = function(){ return false; };
      if(scribe){
        const when = scribe.when;
        scribe.when = function(c){ return !api.ineligibility('Imperial Scribe') && when(c); };
      }
      const freeRaise = SIT4527.freeRaise;
      SIT4527.freeRaise = function(){
        return api.ineligibility('Imperial Scribe') ? [] : freeRaise.apply(this, arguments);
      };
    };

    // ---------- The rows ----------
    api.button = function(text, label, run){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ghost sit4528-btn';
      button.textContent = text;
      button.setAttribute('aria-label', label);
      button.addEventListener('click', function(){ run(); });
      return button;
    };
    // What one Advantage row should carry, or null.
    api.want = function(name){
      const key = api.norm(name);
      if(key === 'wary' && api.rolls()) return {sig:'ambush'};
      if(key === 'precise memory' && api.rolls()) return {sig:'recall'};
      const block = api.ineligibility(name);
      return block ? {sig:'note|' + block.reason, text:block.reason} : null;
    };
    api.decorateRow = function(div){
      const nameEl = div.querySelector('.en-name');
      const want = nameEl ? api.want(nameEl.value) : null;
      let row = div.querySelector('.sit4528-row');
      if(!want){ if(row) row.remove(); return; }
      if(row && row.dataset.sit4528 === want.sig) return;
      if(!row){
        row = document.createElement('div');
        row.className = 'sit4528-row';
        const top = div.querySelector('.entry-top');
        if(top && top.nextSibling) div.insertBefore(row, top.nextSibling); else div.appendChild(row);
      }
      row.dataset.sit4528 = want.sig;
      row.textContent = '';
      if(want.sig === 'ambush'){
        row.appendChild(api.button('Spot ambush',
          'Wary: roll Investigation (Notice) / Perception to spot an ambush, with +1k1 ticked', api.ambush));
      } else if(want.sig === 'recall'){
        row.appendChild(api.button('Recall',
          'Precise Memory: roll Intelligence to recall something exactly, with +1k1', api.recall));
      } else {
        const note = document.createElement('span');
        note.className = 'sit4528-note';
        note.textContent = want.text;
        row.appendChild(note);
      }
    };
    api.decorate = function(){
      if(!api.enabled()) return;
      document.querySelectorAll('#advList .entry').forEach(api.decorateRow);
      document.querySelectorAll('#disadvList .sit4528-row').forEach(function(row){ row.remove(); });
    };
    return api;
  })();

  if(SIT4528.enabled()){
    SIT4528.retune();

    const sit4528PreviousRoll = rollWithModifiers;
    rollWithModifiers = function(title, context, baseRolled, baseKept, opts){
      if(SIT4528.markNext('ambush') && context && context.kind === ROLL_KINDS.SKILL){
        return sit4528PreviousRoll.call(this, 'Spot ambush — Investigation (Notice) / Perception',
          Object.assign({}, context, {sit4528:'ambush'}), baseRolled, baseKept, opts);
      }
      return sit4528PreviousRoll.apply(this, arguments);
    };

    if(typeof advConfigExtendedRollModifiers === 'function'){
      const sit4528PreviousModifiers = advConfigExtendedRollModifiers;
      advConfigExtendedRollModifiers = function(context){
        return (sit4528PreviousModifiers(context) || []).concat(SIT4528.modifiers(context));
      };
    }

    // Feature 4.5.5: grey the two gated entries out in the Advantage picker. Extended by property.
    if(typeof R455 === 'object' && R455 && typeof R455.ineligible === 'function'){
      const sit4528PreviousIneligible = R455.ineligible;
      R455.ineligible = function(name){
        const block = R455.enabled() ? SIT4528.ineligibility(name) : null;
        return block ? block.label : sit4528PreviousIneligible.apply(this, arguments);
      };
    }

    // The rows' line and the picker follow every recalc, including the Skills table's own
    // listeners, which call the trunk's recalcAll directly (see the corrections above).
    const sit4528Refresh = function(){
      SIT4528.decorate();
      if(typeof R455 === 'object' && R455 && typeof R455.decoratePickers === 'function') R455.decoratePickers();
    };
    if(typeof refreshAllAdvConfigControls === 'function'){
      const sit4528PreviousRefresh = refreshAllAdvConfigControls;
      refreshAllAdvConfigControls = function(){
        const result = sit4528PreviousRefresh.apply(this, arguments);
        sit4528Refresh();
        return result;
      };
    } else {
      const sit4528PreviousRecalc = recalcAll;
      recalcAll = function(){
        const result = sit4528PreviousRecalc.apply(this, arguments);
        sit4528Refresh();
        return result;
      };
    }
    // Honor and Status have no recalc listener of their own, so their four boxes refresh this
    // release's rows and the picker directly (nothing else is recalculated).
    ['f_statusPts', 'f_statusRank', 'f_honorPts', 'f_honorRank'].forEach(function(id){
      const box = document.getElementById(id);
      if(box){ box.addEventListener('input', sit4528Refresh); box.addEventListener('change', sit4528Refresh); }
    });
  }
