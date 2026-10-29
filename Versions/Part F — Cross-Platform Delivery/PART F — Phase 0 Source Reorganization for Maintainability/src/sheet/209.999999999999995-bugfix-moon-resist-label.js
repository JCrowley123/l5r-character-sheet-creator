  // BUGFIX MR7: Lord Moon's Curse's roll button says what it is for, "Resist Lord Moon (TN 20)", in place of
  // "Willpower roll (TN 20)" (the owner's ruling from the Release 7c device checks, 29 October). The TN still follows
  // the row's level (15, 20 or 25) and the roll itself is unchanged.
  const MOON_RESIST_LABEL_ENABLED = true;
  const MR7Logic = {
    label(tn){ return 'Resist Lord Moon (TN ' + tn + ')'; }
  };
  const MR7 = (() => {
    const api = {};
    api.enabled = () => MOON_RESIST_LABEL_ENABLED && typeof LM7 === 'object' && !!LM7 && LM7.enabled();
    // UI hook: the button LM7 draws under the row's severity summary.
    api.relabel = div => {
      const config = LM7.config(div);
      const button = config && typeof advConfigRowFor === 'function' ? advConfigRowFor(div).querySelector('.lm7-roll') : null;
      if(!button) return false;
      button.textContent = MR7Logic.label(LM7Logic.tn(config.value));
      return true;
    };
    if(api.enabled()){
      const previousDecorate = LM7.decorate;
      LM7.decorate = function(div){
        const out = previousDecorate.apply(this, arguments);
        if(api.enabled()) api.relabel(div);
        return out;
      };
    }
    return api;
  })();
