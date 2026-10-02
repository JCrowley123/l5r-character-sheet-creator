  // PART I FEATURE 4.5.26: effective Skill ranks and Gaijin Name's per-die limit.
  // Core pp.147,153,159. Purchased ranks, prices and character resources are unchanged.
  const DICE_ENTRIES_ENABLED = true;
  const DICE4526 = (function(){
    const api = {};
    api.enabled = function(){ return DICE_ENTRIES_ENABLED && ADV_CONFIG_ENABLED && ADV_CONFIG_ROLL_EFFECTS_ENABLED; };
    api.norm = function(value){ return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase(); };
    api.base = function(value){ return api.norm(String(value || '').replace(/\(.*$/, '').split(':')[0]); };
    api.has = function(name, list){
      return Array.from(document.querySelectorAll('#' + list + ' .entry .en-name')).some(function(e){ return api.norm(e.value) === api.norm(name); });
    };
    api.liftName = function(context){
      if(!api.enabled() || !context || (context.kind !== ROLL_KINDS.SKILL && context.kind !== ROLL_KINDS.ATTACK)) return '';
      if(!(context.unskilled === true || Number(context.skillRank) === 0)) return '';
      const base = api.base(context.skillName);
      const skill = SKILL_LIBRARY.find(function(s){ return api.norm(s.name) === base; });
      const cat = skill ? skill.cat : '';
      const options = [
        ['Crab Hands', /\bWeapon\b/.test(cat)], ['Crafty', /\bLow\b/.test(cat)],
        ['Sage', context.kind === ROLL_KINDS.SKILL && base === 'lore'],
        ['Sensation', context.kind === ROLL_KINDS.SKILL && base === 'perform']
      ];
      const hit = options.find(function(e){ return e[1] && api.has(e[0], 'advList'); });
      return hit ? hit[0] : '';
    };
    api.gaijin = function(context){
      return api.enabled() && !!context && context.kind === ROLL_KINDS.SKILL &&
        typeof D45 === 'object' && D45.enabled() && D45.socialSkills.some(function(s){ return api.base(s) === api.base(context.skillName); }) &&
        api.has('Gaijin Name', 'disadvList');
    };
    api.modifiers = function(context){
      if(!api.enabled()) return [];
      const out = [];
      if(context && context.dice4526Lift) out.push({source:'adv-config',label:context.dice4526Lift,informational:true,
        display:'treated as Rank 1',note:'No Rank bought; this roll uses Rank 1. Core pp.147,153.'});
      if(api.gaijin(context)) out.push({source:'adv-config',label:'Gaijin Name',informational:true,
        display:'each die explodes at most once',note:'Each die is at most 20. Untrained dice still do not explode. Core p.159.'});
      return out;
    };
    // A bounded generator stops drawing after the permitted extra throw. Never roll an
    // unlimited chain and clamp its total: that would consume the following die's randoms.
    api.die = function(explode, rng){
      const rand = typeof rng === 'function' ? rng : Math.random;
      const chain = [1 + Math.floor(rand() * 10)];
      if(explode !== false && chain[0] === 10) chain.push(1 + Math.floor(rand() * 10));
      return {total:chain.reduce(function(a,b){ return a+b; },0),chain:chain};
    };
    api.pool = function(rawNumDice, rawKeepDice, explode){
      rawNumDice = Math.max(0, Math.round(rawNumDice || 0)); rawKeepDice = Math.max(0, Math.round(rawKeepDice || 0));
      const adj = applyTenDiceRule(rawNumDice,rawKeepDice), dice = [];
      for(let i=0;i<adj.rolled;i++) dice.push(api.die(explode));
      const sorted = dice.sort(function(a,b){return b.total-a.total;}), kept = sorted.slice(0,adj.kept);
      return {rawNumDice:rawNumDice,rawKeepDice:rawKeepDice,numDice:adj.rolled,keepDice:adj.kept,
        bonus:adj.bonus,sorted:sorted,kept:kept,total:kept.reduce(function(s,d){return s+d.total;},0)+adj.bonus,
        explode:explode === undefined ? true : explode,maxExplosions:1,
        tenDiceRuleApplied:rawNumDice>10 || rawKeepDice>10,debugExplanation:adj.debugExplanation};
    };
    // Only synchronous, existing reroll functions enter this scope. It is never held across
    // a preview, confirmation, Promise or other user interaction; nested calls restore it.
    api.limit = null;
    api.withLimit = function(result, run){
      const old = api.limit;
      api.limit = api.enabled() && result && result.maxExplosions === 1 ? 1 : null;
      try { return run(); } finally { api.limit = old; }
    };
    api.shown = null;
    return api;
  })();

  // This guarded pipeline hook runs after the preview and Void override have resolved.
  function dice4526RollPool(n,k,explode,context){
    return DICE4526.gaijin(context) ? DICE4526.pool(n,k,explode) : rollDicePool(n,k,explode);
  }
  if(DICE_ENTRIES_ENABLED){
    const dice4526PreviousRoll = rollWithModifiers;
    rollWithModifiers = function(title, context, baseRolled, baseKept, opts){
      const name = DICE4526.liftName(context);
      if(name){
        context = Object.assign({},context,{skillRank:1,unskilled:false,dice4526Lift:name});
        baseRolled = (Number(baseRolled)||0)+1;
        opts = Object.assign({},opts||{},{explode:true});
        title = String(title||context.skillName||'Skill Roll').replace(/\s*\(Unskilled\)\s*$/, '').replace(/, Unskilled(?=[,)])/g, ' 1') + ' ('+name+' - Rank 1)';
      }
      return dice4526PreviousRoll.call(this,title,context,baseRolled,baseKept,opts);
    };
    const dice4526PreviousModifiers = advConfigExtendedRollModifiers;
    advConfigExtendedRollModifiers = function(context){ return (dice4526PreviousModifiers(context)||[]).concat(DICE4526.modifiers(context)); };
    const dice4526PreviousPool = rollDicePool;
    rollDicePool = function(n,k,explode){ return DICE4526.limit === 1 && DICE4526.enabled() ? DICE4526.pool(n,k,explode) : dice4526PreviousPool.apply(this,arguments); };
    const dice4526PreviousLuck = advConfigLuckRerollResult;
    advConfigLuckRerollResult = function(result){
      const self=this;return DICE4526.withLimit(result,function(){return dice4526PreviousLuck.call(self,result);});
    };
    if(typeof ANC48 === 'object' && ANC48){
      ['rerollPlus','sunTao'].forEach(function(key){
        const previous = ANC48[key];
        if(typeof previous !== 'function') return;
        ANC48[key] = function(){
          const self=this,args=arguments,result=key==='sunTao'?args[1]:args[0];
          return DICE4526.withLimit(result,function(){return previous.apply(self,args);});
        };
      });
    }
    const dice4526PreviousShow = showRollResult;
    showRollResult = function(title,result,tn){
      DICE4526.shown = result;
      const returned = dice4526PreviousShow.apply(this,arguments);
      if(DICE4526.enabled() && result && result.maxExplosions === 1){
        const note = Array.from(document.querySelectorAll('#rollModalBody .roll-note')).find(function(e){return /^Click a die to keep or drop it\./.test(e.textContent);});
        if(note) note.textContent = 'Click a die to keep or drop it. ' + (result.explode === false ? 'This is an Unskilled Roll - 10s do not explode. ' : '') +
          'Gaijin Name: each die can explode at most once (maximum 20).' + (result.keepDice ? ' Suggested keep: '+result.keepDice+'.' : '');
      }
      return returned;
    };
    // Emphasis has its own generator. Capture the result's policy in this particular bar;
    // a later unrelated result cannot change the meaning of an existing reroll control.
    const dice4526PreviousAttach = attachEmphasisReroll;
    attachEmphasisReroll = function(context){
      if(DICE4526.enabled() && DICE4526.shown && DICE4526.shown.maxExplosions === 1){
        context = Object.assign({},context,{explodeOn:{dice4526:true,explode:DICE4526.shown.explode}});
      }
      return dice4526PreviousAttach.call(this,context);
    };
    const dice4526PreviousEmphasis = rerollEmphasisDice;
    rerollEmphasisDice = function(dice,indices,threshold,rng){
      if(!DICE4526.enabled() || !threshold || threshold.dice4526 !== true) return dice4526PreviousEmphasis.apply(this,arguments);
      const want = new Set((indices||[]).map(function(i){return parseInt(i,10);}));
      return (dice||[]).map(function(d,i){return want.has(i) && d && d.total === 1 ? Object.assign(DICE4526.die(threshold.explode,rng),{rerolledFrom:1}) : d;});
    };
  }
