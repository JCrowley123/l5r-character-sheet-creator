  // BUGFIX EQ7: an empty quiver no longer stops the attack (owner ruling R26, as recommended; no book). The arrow picker
  // opens saying the quiver is empty and offers to roll without an arrow: nothing is spent, and the damage uses the
  // bow's arrow as it does today. Closing the picker still cancels the attack. Reached from the attack's empty-quiver
  // block (100-dice-engine.js).
  const EMPTY_QUIVER_ENABLED = true;
  const EQ7Logic = {
    // quantities: how many of each arrow the character holds.
    empty(quantities){ return (quantities || []).reduce((n, q) => n + (q > 0 ? q : 0), 0) === 0; },
    MESSAGE:'Your quiver is empty. You can still roll the attack; no arrow is spent.',
    BUTTON:'Roll without an arrow'
  };
  const EQ7 = (() => {
    const api = {};
    api.passing = null;   // {row}: the attack that rolls without an arrow, read once by ammoTrackingActive()
    api.enabled = () => EMPTY_QUIVER_ENABLED && typeof promptArrowSelection === 'function' &&
      typeof ammoTrackingActive === 'function' && typeof ARROW_LIBRARY !== 'undefined';
    api.empty = () => EQ7Logic.empty(ARROW_LIBRARY.map(a => getArrowQuantity(a.name)));
    // Resolves false to cancel the attack; true to go on, without an arrow when the quiver is empty.
    api.before = async ctx => {
      api.passing = null;
      if(!api.enabled() || !ctx || !weaponUsesAmmo(ctx.entry) || !ammoTrackingActive(ctx.row) || !api.empty()) return true;
      let without = false;
      const picked = promptArrowSelection(ctx.entry);
      // UI hook: the picker's empty message and its one extra button.
      const note = document.querySelector('#arrowPickBody .arrow-opt-empty');
      if(note) note.textContent = EQ7Logic.MESSAGE;
      const button = document.createElement('button');
      button.type = 'button';
      button.id = 'eq7RollWithout';
      button.className = 'ghost eq7-roll-without';
      button.textContent = EQ7Logic.BUTTON;
      button.addEventListener('click', () => {
        without = true;
        const close = document.getElementById('arrowPickClose');
        if(close) close.click();
      });
      document.getElementById('arrowPickBody').appendChild(button);
      await picked;
      if(!without) return false;
      api.passing = {row:ctx.row};
      setStatus('Rolling without an arrow: the quiver is empty, and nothing is spent.');
      return true;
    };
    if(api.enabled()){
      const previousTracking = ammoTrackingActive;
      ammoTrackingActive = function(row){
        if(api.passing && api.passing.row === row){ api.passing = null; return false; }
        return previousTracking.apply(this, arguments);
      };
    }
    return api;
  })();
