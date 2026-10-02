  // BUGFIX RANKZERO: untrained Skill and weapon attack dice do not explode.
  // The caller supplies the baseline; the pipeline's explicit Void override still wins.
  // An inner effective-rank wrapper may also replace these options before the preview.
  const RANKZERO_ENABLED = true;
  const RANKZERO = {
    applies:function(context){
      return !!context && (context.kind === ROLL_KINDS.SKILL || context.kind === ROLL_KINDS.ATTACK) &&
        (context.unskilled === true || Number(context.skillRank) === 0);
    }
  };
  if(RANKZERO_ENABLED){
    const rankzeroPreviousRoll = rollWithModifiers;
    rollWithModifiers = function(title, context, baseRolled, baseKept, opts){
      if(RANKZERO.applies(context)) opts = Object.assign({}, opts || {}, {explode:false});
      return rankzeroPreviousRoll.call(this, title, context, baseRolled, baseKept, opts);
    };
  }
