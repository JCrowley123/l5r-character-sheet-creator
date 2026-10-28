  // BUGFIX VR7: the Void Point's +1k1 is not spent on an Initiative roll (owner ruling R7, 23 October 2026).
  // Core names Skill, Trait, Ring and Spell Casting rolls for it; Initiative has its own Void spend (+10, skirmish).
  // An armed +1k1 is left out of an Initiative roll, so it stays armed for the next roll it can help.
  const VOID_RAISE_INITIATIVE_ENABLED = true;
  const VR7Logic = {
    LABEL: 'Void: +1k1',
    // The Void contributor's modifiers for one roll, without the +1k1 when the roll is Initiative.
    filter(ctx, mods){
      if(!Array.isArray(mods) || !ctx || ctx.kind !== ROLL_KINDS.INITIATIVE) return mods;
      const kept = mods.filter(m => !(m && m.source === 'void' && m.label === VR7Logic.LABEL));
      return kept.length ? kept : null;
    }
  };
  const VR7 = (() => {
    const api = {};
    api.enabled = () => VOID_RAISE_INITIATIVE_ENABLED && typeof voidPreRollModifiers === 'function' &&
      typeof registerPreRollModifier === 'function';
    // The registry replaces an entry with the same id, so the Void contributor is wrapped in its own seat.
    if(api.enabled()) registerPreRollModifier('void', 50, ctx => VR7Logic.filter(ctx, voidPreRollModifiers(ctx)));
    // Touch of the Void and Daredevil add to that +1k1 itself, so they leave Initiative with it.
    if(api.enabled() && typeof VI4533 === 'object' && VI4533 && typeof VI4533.voidModifiers === 'function'){
      const vr7Extra = VI4533.voidModifiers;
      VI4533.voidModifiers = function(context){
        return context && context.kind === ROLL_KINDS.INITIATIVE ? null : vr7Extra.apply(this, arguments);
      };
    }
    return api;
  })();
