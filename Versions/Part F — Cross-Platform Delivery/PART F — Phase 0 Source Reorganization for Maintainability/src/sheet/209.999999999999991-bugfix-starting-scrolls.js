  // BUGFIX SS7: starting spells start as scrolls, not memorised (Core p.164; owner's answer Q5, 29 October 2026). The
  // wizard's Spells step says so in one line, under the School's allotment. What the sheet does is unchanged.
  const STARTING_SCROLLS_ENABLED = true;
  const SS7Logic = {
    LINE:'These are scrolls in your Equipment. Memorising a spell costs XP equal to its Mastery (Core p.164); ' +
      'tick Memorised on its row.'
  };
  const SS7 = (() => {
    const api = {};
    api.enabled = () => STARTING_SCROLLS_ENABLED && typeof CW1122 === 'object' && !!CW1122 &&
      !!CW1122.spellsStep && typeof CW1122.spellsStep.render === 'function';
    // UI hook: the line follows the step's first note, or opens the step when it has none.
    api.place = body => {
      const line = document.createElement('p');
      line.className = 'cw112-note ss7-scrolls';
      line.textContent = SS7Logic.LINE;
      const first = body.querySelector('.cw112-note');
      if(first) first.insertAdjacentElement('afterend', line); else body.insertBefore(line, body.firstChild);
      return line;
    };
    if(api.enabled()){
      const previousRender = CW1122.spellsStep.render;
      CW1122.spellsStep.render = function(body){
        const out = previousRender.apply(this, arguments);
        if(body) api.place(body);
        return out;
      };
    }
    return api;
  })();
