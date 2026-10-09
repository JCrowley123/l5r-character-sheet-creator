  // ========= PART I FEATURE 4.5.33: VOID AND INITIATIVE ENTRIES =========
  // Five Core Rulebook entries that recorded only their cost and text, read 9 October 2026 (our own words):
  //   Daredevil          p.147  a Void Point spent on an Athletics roll gives +3k1 instead of +1k1
  //   Touch of the Void  p.162  a Void Point spent on a roll gives +2k1 instead of +1k1; after every Void
  //                             Point spent, a Willpower roll (TN 30) or be Dazed for one Round
  //   Momoku             p.161  Void Points may be spent only on School Techniques that call for them;
  //                             the general uses (the Void card, Kiho activation included) are closed
  //   Quick              p.152  each Round you did not act first, in the Reactions Stage: add Reflexes to
  //                             your Initiative Score for the rest of the skirmish
  //   Leadership         p.151  once a Round, in the Reactions Stage: School Rank + 1k1 to one ally's
  //                             Initiative Score until the next Reactions Stage
  //
  // The owner's rulings, 9 October 2026 ("as recommended"):
  //   * Daredevil and Touch of the Void do not stack: on an Athletics roll the higher, +3k1, applies.
  //   * Momoku closes the whole Void card. The Void pips stay tappable: Technique costs are the player's.
  //   * Quick's uses go into the trunk's round ledger (cleared by Reset rounds), so the running total is
  //     this skirmish's; it is shown on the row and added to Initiative rolls, as Void's +10 is.
  //   * Leadership rolls for an ally only; nothing is added to this character.
  //
  // Mechanisms, all existing: one contributor on the pre-roll registry (the extra Void dice, source 'void'
  // so Sworn Enemy's suppression and Momoku drop them with Void's own +1k1); canSpendVoid and
  // getPreRollModifiers wrapped for Momoku (Phase 4.5.2's precedent); the round ledger for Quick and
  // Leadership; row lines drawn on every refreshAllAdvConfigControls, as Feature 4.5.31's are. No row
  // setting is saved, so Feature 4.5.3 needs telling nothing.
  const VOID_INITIATIVE_ENTRIES_ENABLED = true;

  const VI4533 = (function(){
    const api = {};
    api.enabled = function(){ return VOID_INITIATIVE_ENTRIES_ENABLED; };
    api.QUICK = 'Quick';
    api.LEAD = 'Leadership';
    api.MOMOKU_REASON = 'Momoku: Void Points only for School Techniques that call for them (Core Rulebook p.161).';
    api.norm = function(value){
      return String(value || '').trim().replace(/\s+/g, ' ').replace(/[’ʼ`']/g, '\'').toLowerCase();
    };
    api.base = function(name){ return api.norm(String(name || '').replace(/\(.*$/, '').split(':')[0]); };
    api.isKind = function(context, kinds){
      return !!context && typeof ROLL_KINDS === 'object' && !!ROLL_KINDS &&
        kinds.some(function(k){ return context.kind === ROLL_KINDS[k]; });
    };
    // Only rows on the entry's own list count, as for every Phase 4.5 entry.
    api.LIST = { 'daredevil':'advList', 'quick':'advList', 'leadership':'advList',
      'touch of the void':'disadvList', 'momoku':'disadvList' };
    api.rows = function(name){
      const key = api.norm(name), list = document.getElementById(api.LIST[key] || '');
      if(!list) return [];
      return Array.prototype.filter.call(list.querySelectorAll('.entry'), function(div){
        const n = div.querySelector('.en-name');
        return !!n && api.norm(n.value) === key;
      });
    };
    api.has = function(name){ return api.enabled() && api.rows(name).length > 0; };
    api.owns = function(div){
      const n = div && div.querySelector('.en-name');
      const key = n ? api.norm(n.value) : '';
      return !!key && !!div.parentElement && api.LIST[key] === div.parentElement.id ? key : '';
    };
    api.momoku = function(){ return api.has('Momoku'); };
    api.trait = function(name){
      const v = typeof getTraitValueByName === 'function' ? getTraitValueByName(name) : NaN;
      return Number.isFinite(v) ? v : NaN;
    };
    api.schoolRank = function(){
      const v = parseInt((document.getElementById('f_rank') || {}).value, 10);
      return Number.isFinite(v) && v > 0 ? v : 1;
    };
    api.inCombat = function(){ return typeof isCombatActive === 'function' && isCombatActive(); };

    // ---------- Void dice ----------
    // Called with Void's own +1k1 armed: Daredevil on Athletics adds +2k0 more (+3k1), otherwise Touch of
    // the Void adds +1k0 more (+2k1). Never on damage, which Void cannot enhance.
    api.voidModifiers = function(context){
      if(!api.enabled() || !context || api.isKind(context, ['DAMAGE']) || api.momoku()) return null;
      if(typeof getVoidPending !== 'function' || !getVoidPending().k1) return null;
      if(api.has('Daredevil') && api.isKind(context, ['SKILL']) && api.base(context.skillName) === 'athletics'){
        return { source:'void', label:'Daredevil: Void +3k1 on Athletics', rolledDelta:2, keptDelta:0 };
      }
      if(api.has('Touch of the Void')){
        return { source:'void', label:'Touch of the Void: Void +2k1', rolledDelta:1, keptDelta:0 };
      }
      return null;
    };

    // ---------- Quick and Leadership (the round ledger) ----------
    api.quickTotal = function(){
      if(typeof getRoundLedger !== 'function') return 0;
      const ledger = getRoundLedger();
      return Object.keys(ledger).reduce(function(sum, r){
        const v = ledger[r] && ledger[r][api.QUICK];
        return sum + (Number.isFinite(v) ? v : 0);
      }, 0);
    };
    api.usedThisRound = function(key){ return typeof hasSpentThisRound === 'function' && hasSpentThisRound(key); };
    api.blocked = function(key){
      if(!api.inCombat()) return 'Start a combat round first.';
      if(api.usedThisRound(key)) return 'Already used this Round.';
      return '';
    };
    api.initiativeModifiers = function(context){
      if(!api.enabled() || !api.isKind(context, ['INITIATIVE']) || !api.has('Quick')) return null;
      const total = api.quickTotal();
      return total ? { source:'quick', label:'Quick: +' + total + ' Initiative (this skirmish)', totalDelta:total } : null;
    };
    api.modifiers = function(context){
      return [api.voidModifiers(context), api.initiativeModifiers(context)].filter(Boolean);
    };
    api.useQuick = function(){
      const why = api.blocked(api.QUICK);
      const reflexes = api.trait('Reflexes');
      if(why || !Number.isFinite(reflexes) || typeof recordRoundSpend !== 'function'){
        if(typeof setStatus === 'function') setStatus(why || 'Enter your Reflexes first.');
        return 0;
      }
      recordRoundSpend(api.QUICK, reflexes);
      if(typeof setStatus === 'function') setStatus('Quick: Initiative Score +' + reflexes + ' (+' + api.quickTotal() + ' this skirmish).');
      api.after();
      return reflexes;
    };
    api.lead = function(){
      const why = api.blocked(api.LEAD);
      if(why || typeof rollDicePool !== 'function' || typeof showRollResult !== 'function' || typeof recordRoundSpend !== 'function'){
        if(typeof setStatus === 'function') setStatus(why || 'Rolling is not available.');
        return null;
      }
      const rank = api.schoolRank();
      const rolled = rollDicePool(1, 1, true);
      const result = Object.assign({}, rolled, { bonus: rolled.bonus + rank, total: rolled.total + rank });
      showRollResult('Leadership — 1k1 + School Rank ' + rank + ', for one ally', result);
      // The modal labels any bonus as the Ten Dice Rule's; this one is the School Rank.
      document.querySelectorAll('#rollModalBody .roll-note').forEach(function(n){
        if(/^Ten Dice Rule bonus/.test(n.textContent)) n.textContent = 'School Rank: +' + rank + ' (already included in the total above)';
      });
      recordRoundSpend(api.LEAD, result.total);
      api.after();
      return result;
    };
    api.after = function(){
      if(typeof renderCombatRoundUI === 'function') renderCombatRoundUI();
      if(typeof recalcAll === 'function') recalcAll(); else api.decorate();
    };

    // ---------- Touch of the Void's check ----------
    api.check = function(){
      if(!api.enabled() || typeof rollWithModifiers !== 'function' || typeof makeRollContext !== 'function') return Promise.resolve(null);
      const value = api.trait('Willpower');
      if(!Number.isFinite(value) || value < 1){
        if(typeof appAlert === 'function') appAlert('Enter a valid Willpower Rank before making this check.');
        return Promise.resolve(null);
      }
      const context = makeRollContext(ROLL_KINDS.TRAIT, { traitName:'Willpower', traitValue:value, vi4533:'touch' });
      return rollWithModifiers('Touch of the Void — Willpower vs TN 30', context, value, value,
        { tnConfig:{ tn:30, successText:'You keep your head.', failText:'You are Dazed for one Round. Tell the GM: the sheet does not track Dazed.' } });
    };

    // ---------- Rows ----------
    api.make = function(tag, cls, text){
      const el = document.createElement(tag);
      if(cls) el.className = cls;
      if(text != null) el.textContent = text;
      return el;
    };
    api.button = function(text, onClick, why){
      const b = api.make('button', 'vi4533-btn', text);
      b.type = 'button';
      b.disabled = !!why;
      if(why) b.title = why;
      b.addEventListener('click', function(){ onClick(); });
      return b;
    };
    api.note = function(text){ return api.make('span', 'vi4533-note', text); };
    api.lines = function(key){
      switch(key){
        case 'daredevil': return [api.note('A Void Point spent on an Athletics roll gives +3k1, added in the roll.')];
        case 'touch of the void': return [api.button('Willpower (TN 30)', api.check, ''),
          api.note('After every Void Point you spend. A Void Point on a roll gives +2k1, added in the roll.')];
        case 'momoku': return [api.note('The Void card is closed. Spend Void Points by hand, only on School Techniques that call for them.')];
        case 'quick': {
          const total = api.quickTotal();
          return [api.button('Did not act first: +Reflexes', api.useQuick, api.blocked(api.QUICK)),
            api.note(total ? 'Initiative Score +' + total + ' this skirmish.' : 'Each Round you did not act first, in the Reactions Stage.')];
        }
        case 'leadership': {
          const last = typeof getRoundSpend === 'function' ? getRoundSpend(api.LEAD) : undefined;
          return [api.button('Lead an ally (School Rank + 1k1)', api.lead, api.blocked(api.LEAD)),
            api.note(last !== undefined ? 'This Round: ' + last + ' to one ally’s Initiative Score.'
              : 'Once a Round, in the Reactions Stage: one ally adds the total until the next Reactions Stage.')];
        }
      }
      return [];
    };
    api.decorateRow = function(div){
      const key = api.owns(div);
      let row = div.querySelector('.vi4533-row');
      if(!key){ if(row) row.remove(); return; }
      if(!row){
        row = api.make('div', 'vi4533-row');
        const top = div.querySelector('.entry-top');
        if(top && top.nextSibling) div.insertBefore(row, top.nextSibling); else div.appendChild(row);
      }
      row.textContent = '';
      api.lines(key).forEach(function(el){ row.appendChild(el); });
    };
    api.decorate = function(){
      if(!api.enabled()) return;
      document.querySelectorAll('#advList .entry, #disadvList .entry').forEach(api.decorateRow);
    };
    return api;
  })();

  if(VI4533.enabled()){
    if(typeof registerPreRollModifier === 'function') registerPreRollModifier('void-initiative-entries', 51, VI4533.modifiers);

    // Momoku closes the Void card and drops any armed Void dice.
    if(typeof canSpendVoid === 'function'){
      const vi4533PreviousCanSpend = canSpendVoid;
      canSpendVoid = function(key){
        return VI4533.momoku() ? { ok:false, reason:VI4533.MOMOKU_REASON } : vi4533PreviousCanSpend.apply(this, arguments);
      };
    }
    if(typeof getPreRollModifiers === 'function'){
      const vi4533PreviousModifiers = getPreRollModifiers;
      getPreRollModifiers = function(context){
        const out = vi4533PreviousModifiers.apply(this, arguments);
        return VI4533.momoku() ? out.filter(function(m){ return m.source !== 'void'; }) : out;
      };
    }
    if(typeof renderVoidPanel === 'function'){
      const vi4533PreviousPanel = renderVoidPanel;
      renderVoidPanel = function(){
        const result = vi4533PreviousPanel.apply(this, arguments);
        const reason = document.getElementById('voidDisabledReason');
        if(reason && VI4533.momoku()) reason.textContent = VI4533.MOMOKU_REASON;
        return result;
      };
    }

    // The row lines follow every recalc (refreshAllAdvConfigControls is called by name from recalcAll).
    if(typeof refreshAllAdvConfigControls === 'function'){
      const vi4533PreviousRefresh = refreshAllAdvConfigControls;
      refreshAllAdvConfigControls = function(){
        const result = vi4533PreviousRefresh.apply(this, arguments);
        VI4533.decorate();
        return result;
      };
    }
  }
  // ========= END PART I FEATURE 4.5.33 VI4533 =========
