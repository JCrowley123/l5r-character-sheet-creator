  // BUGFIX HR7: contextual declarations reuse the existing roll preview.
  const HR7 = (() => {
    const api = {};
    api.enabled = () => HONOUR_RESISTANCE_ENABLED;
    api.barred = () => typeof SIT4527 === 'object' && SIT4527 && SIT4527.honorBarred();
    api.rank = () => typeof RP7 === 'object' && RP7 && RP7.enabled() ? RP7.rank('honor') :
      Number(document.getElementById('f_honorRank')?.value);
    api.bonus = () => HR7Logic.bonus(api.rank(), api.barred());
    api.eligible = c => !!c && [ROLL_KINDS.SKILL,ROLL_KINDS.TRAIT,ROLL_KINDS.RING,ROLL_KINDS.MANUAL].includes(c.kind) &&
      !c.fullDefenseDeclaration && !c.chk4531 && !c.d45WillpowerGate && !c.ta7Growth;
    api.applies = c => api.enabled() && api.eligible(c) && !api.barred();
    api.modifier = () => ({label:'Honour: resistance',rolledDelta:0,keptDelta:0,totalDelta:api.bonus(),
      note:'Whole Honour Rank; points are ignored. Core Rulebook p.91.'});
    api.provider = {
      label:'Honour',
      offers:c => api.applies(c) ? [{key:'resist',label:'Resisting Intimidation, Temptation or Fear — +'+api.bonus()+' to the total',
        note:'Select when this roll resists one of those effects. Balance already includes this bonus. Core Rulebook p.91.'}] : [],
      modifiers:(c,keys) => api.applies(c) && keys.includes('resist') ? [api.modifier()] : []
    };
    api.balance = c => {
      if(!api.applies(c) || typeof RD4515 !== 'object' || !RD4515) return [];
      const keys=RD4515.armed(c);
      return keys.includes('situational-entries:balance') && !keys.includes('honour-resistance:resist') ?
        [Object.assign({source:'adv-config'},api.modifier())] : [];
    };
    return api;
  })();
  if(HR7.enabled()) {
    if(typeof RD4515 === 'object' && RD4515) RD4515.register('honour-resistance',HR7.provider);
    if(typeof advConfigExtendedRollModifiers === 'function') {
      const hr7Previous=advConfigExtendedRollModifiers;
      advConfigExtendedRollModifiers=function(context){return (hr7Previous(context)||[]).concat(HR7.balance(context));};
    }
    // UI hook: Balance declares the qualifying resistance itself; show that Honour is included.
    if(typeof SIT4527 === 'object' && SIT4527) {
      const balance=SIT4527.entry('balance');
      if(balance) balance.note='Your whole Honor Rank is added to the total once; points are ignored.';
    }
  }
