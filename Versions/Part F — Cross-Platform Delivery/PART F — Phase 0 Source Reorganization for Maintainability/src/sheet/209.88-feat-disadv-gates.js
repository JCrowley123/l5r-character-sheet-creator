  // ========= PART I FEATURE 4.523: ISOLATED DISADVANTAGE WILLPOWER GATES =========
  // This entire module is an optional extension of the configured-disadvantage core.
  // It owns the gate queue, nested resource policy, interruption cleanup and orchestration
  // wrappers. It owns no persistent fields, no modal host and no registry contributor.
  // Delete this fragment and its manifest entry to recover the pre-gate roll path.
  const D45_GATES_ENABLED = true;
  const D45G = (function(){
    const policy = { nestedVoid:true, nestedLuck:true };
    let transaction = null;
    const baseRoll = rollWithModifiers;
    const norm = value => String(value || '').trim().toLowerCase();
    function enabled(){
      return D45_GATES_ENABLED && typeof D45 !== 'undefined' && D45.enabled();
    }
    function busy(){ return !!(transaction && !transaction.cancelled); }
    function inCheck(){ return busy() && transaction.phase !== 'parent'; }
    function matching(context){
      if(!enabled() || !context || context.d45WillpowerGate) return [];
      const gates = [];
      const elementalSpell = context.kind === ROLL_KINDS.SPELL && !context.maho;
      if(elementalSpell){
        D45.active('Elemental Imbalance').forEach(item=>{
          if(norm(item.effect.element) !== norm(context.element)) return;
          gates.push({ name:'Elemental Imbalance', tn:item.effect.tn,
            target:item.effect.element, cancels:false, div:item.div });
        });
      }
      D45.active('Enlightened Madness').forEach(item=>{
        const effect = item.effect;
        const target = norm(effect.target);
        const type = norm(effect.targetType);
        const ringMatches = type === 'ring' &&
          ((context.kind === ROLL_KINDS.RING && norm(context.ringName) === target) ||
           (context.kind === ROLL_KINDS.SPELL && norm(context.element) === target));
        const skillMatches = type === 'skill' &&
          (context.kind === ROLL_KINDS.SKILL || context.kind === ROLL_KINDS.ATTACK) &&
          norm(context.skillName) === target;
        // Tattoos have no automated action engine. Only the explicit row action supplies
        // this context; unrelated manual notation must never activate a tattoo check.
        const tattooMatches = type === 'tattoo' && context.d45TattooUse === true &&
          norm(context.tattooName) === target;
        if(ringMatches || skillMatches || tattooMatches){
          gates.push({ name:'Enlightened Madness', tn:effect.tn,
            target:effect.target, targetType:effect.targetType, cancels:true, div:item.div });
        }
      });
      return gates;
    }
    function refuseOverlap(){
      setStatus('Finish the current Willpower check and its action before starting another roll.');
      return null;
    }
    function savePending(tx){
      if(typeof getVoidPending !== 'function' || typeof setVoidPending !== 'function') return;
      tx.savedPending = getVoidPending();
      // Pre-armed effects belong to the requested action, not to its resistance check.
      // Points and the combat ledger are never rolled back: a nested expenditure is real.
      setVoidPending(typeof clearOneRollVoidPending === 'function'
        ? clearOneRollVoidPending(tx.savedPending) : {});
    }
    function restorePending(tx){
      if(tx.restored || tx.discardPending) return;
      tx.restored = true;
      if(tx.savedPending && typeof setVoidPending === 'function') setVoidPending(tx.savedPending);
    }
    function cancel(discardPending){
      const tx = transaction;
      if(!tx) return false;
      tx.cancelled = true;
      tx.discardPending = !!discardPending;
      // Use the existing modal's own close path so its listeners and pending projection
      // are cleaned up before reset/load replaces the character beneath this transaction.
      if(tx.phase === 'check-preview' || tx.phase === 'parent'){
        const close = document.getElementById('rollPreviewClose');
        const overlay = document.getElementById('rollPreviewOverlay');
        if(close && overlay && overlay.style.display !== 'none') close.click();
      } else if(tx.phase === 'check-result'){
        if(typeof closeRollModal === 'function') closeRollModal();
      } else if(tx.phase === 'notice'){
        const close = document.getElementById('appConfirmX');
        if(close) close.click();
      }
      if(tx.resolveResult) tx.resolveResult(null);
      restorePending(tx);
      return true;
    }
    async function check(tx, gate){
      if(tx.cancelled) return null;
      const willpower = getTraitValueByName('Willpower');
      if(!Number.isFinite(willpower) || willpower < 1){
        tx.phase = 'notice';
        await appAlert('Enter a valid Willpower Rank before making this resistance check.');
        return null;
      }
      tx.phase = 'check-preview';
      const context = makeRollContext(ROLL_KINDS.TRAIT, {
        traitName:'Willpower', traitValue:willpower,
        d45WillpowerGate:true, d45GateName:gate.name,
      });
      let settle;
      const finished = new Promise(resolve=>{ settle = resolve; });
      tx.resolveResult = settle;
      const result = await baseRoll(gate.name + ' — Willpower vs TN ' + gate.tn,
        context, willpower, willpower, {
          tnConfig:{ tn:gate.tn, successText:'Willpower check passed.',
            failText:'Willpower check failed.',
            onClose:passed=>settle(tx.cancelled ? null : passed === true) },
        });
      if(!result || tx.cancelled){
        settle(null);
        tx.resolveResult = null;
        return null;
      }
      tx.phase = 'check-result';
      // The ordinary result modal remains open for die choices and optional Luck. Luck's
      // existing winning-reroll path preserves this callback and TN, so only the final
      // acknowledged result settles the check. No roll history is added to save data.
      const passed = await finished;
      tx.resolveResult = null;
      return tx.cancelled ? null : passed;
    }
    async function failureNotice(tx, gate){
      tx.phase = 'notice';
      if(gate.cancels){
        // This is the sole policy boundary for a future change to cancellation costs.
        // The approved behaviour keeps any spell slot already consumed by the caller.
        await appAlert('You failed to resist Enlightened Madness. Your action is cancelled. ' +
          'The GM controls your character for the next 8 hours. Any spell slot already used remains spent.');
      } else {
        await appAlert('You failed the Elemental Imbalance Willpower check. Tell the GM; ' +
          'the consequences are determined by the GM. Your Spell Casting Roll still proceeds.');
      }
    }
    async function run(gates, request, action){
      if(busy()) return refuseOverlap();
      const tx = { phase:'start', cancelled:false, discardPending:false, restored:false,
        resolveResult:null, savedPending:null };
      transaction = tx;
      savePending(tx);
      try {
        for(const gate of gates){
          const passed = await check(tx, gate);
          if(passed === null || tx.cancelled) return null;
          if(!passed){
            await failureNotice(tx, gate);
            if(tx.cancelled || gate.cancels) return null;
          }
        }
        if(tx.cancelled) return null;
        restorePending(tx);
        tx.phase = 'parent';
        return await action(request);
      } finally {
        restorePending(tx);
        if(transaction === tx) transaction = null;
      }
    }
    async function roll(title, context, baseRolled, baseKept, opts){
      if(busy()) return refuseOverlap();
      const gates = matching(context);
      if(!gates.length) return baseRoll(title, context, baseRolled, baseKept, opts);
      return run(gates, {title, context, baseRolled, baseKept, opts},
        req=>baseRoll(req.title, req.context, req.baseRolled, req.baseKept, req.opts));
    }
    async function checkTattoo(target){
      if(!enabled()) return null;
      const context = makeRollContext(ROLL_KINDS.MANUAL, {
        d45TattooUse:true, tattooName:String(target || '').trim(),
      });
      const gates = matching(context);
      if(!gates.length) return null;
      return run(gates, {context}, ()=>{
        setStatus('Willpower check passed. Resolve the tattoo effect with your GM.');
        return { tattooAllowed:true };
      });
    }
    return { enabled, busy, matching, checkTattoo, cancel, roll, policy,
      inCheck, get phase(){ return transaction ? transaction.phase : null; } };
  })();

  if(typeof D45 !== 'undefined') D45.gates = D45G;
  rollWithModifiers = D45G.roll;

  // The same optional module guards side effects that happen before the pipeline. A second
  // cast must be refused before it spends another slot, and a damage roll must not replace
  // the shared result modal while the player is deciding a resistance check.
  const d45GateCastSpellBase = castSpell;
  castSpell = function(){
    if(D45G.busy()){
      setStatus('Finish the current Willpower check and its action before casting again.');
      return Promise.resolve(null);
    }
    return d45GateCastSpellBase.apply(this, arguments);
  };
  const d45GateMahoBase = castMahoSpell;
  castMahoSpell = function(){
    if(D45G.busy()){
      setStatus('Finish the current Willpower check and its action before casting again.');
      return Promise.resolve(null);
    }
    return d45GateMahoBase.apply(this, arguments);
  };
  const d45GateDamageBase = rollWeaponDamage;
  rollWeaponDamage = function(){
    if(D45G.busy()){
      setStatus('Finish the current Willpower check and its action before rolling damage.');
      return null;
    }
    return d45GateDamageBase.apply(this, arguments);
  };

  // Keep the nested resource options in this module so later changes to them need touch
  // neither the common preview nor the existing Luck implementation.
  if(typeof canSpendVoid === 'function'){
    const d45GateVoidBase = canSpendVoid;
    canSpendVoid = function(key){
      if(D45G.inCheck() && !D45G.policy.nestedVoid){
        return {ok:false, reason:'Void spending is disabled for this Willpower check.'};
      }
      return d45GateVoidBase(key);
    };
  }
  if(typeof onAdvConfigRollResult === 'function'){
    const d45GateLuckBase = onAdvConfigRollResult;
    onAdvConfigRollResult = function(title, result){
      if(D45G.inCheck() && !D45G.policy.nestedLuck) return;
      return d45GateLuckBase(title, result);
    };
  }
  const d45GateApplyBase = applyData;
  applyData = function(){
    D45G.cancel(true);
    return d45GateApplyBase.apply(this, arguments);
  };
  const d45GateResetBase = resetToBaseline;
  resetToBaseline = function(){
    D45G.cancel(true);
    return d45GateResetBase.apply(this, arguments);
  };
