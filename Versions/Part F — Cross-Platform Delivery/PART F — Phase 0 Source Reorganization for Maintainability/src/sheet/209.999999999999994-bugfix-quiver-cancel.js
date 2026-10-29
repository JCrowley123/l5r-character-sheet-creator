  // BUGFIX QC7: an empty quiver's arrow picker offers Cancel instead of a roll without an arrow (the owner's ruling
  // from the Release 7c device checks, 29 October). The picker says there is nothing to fire; Cancel closes it as the
  // picker's own close button does, so the attack ends and nothing rolls. EQ7 still opens the picker; with arrows in
  // the quiver nothing changes.
  const EMPTY_QUIVER_CANCEL_ENABLED = true;
  const QC7Logic = {
    MESSAGE:'You have no arrows: your quiver is empty, so there is nothing to fire. Add arrows in Equipment to attack with this bow.',
    BUTTON:'Cancel'
  };
  const QC7 = (() => {
    const api = {};
    api.enabled = () => EMPTY_QUIVER_CANCEL_ENABLED && typeof EQ7 === 'object' && !!EQ7 && EQ7.enabled();
    // UI hook: the empty picker's message, and EQ7's button replaced by Cancel (a fresh node, so its roll-on listener goes).
    api.decorate = () => {
      const old = document.getElementById('eq7RollWithout');
      if(!old) return false;
      const note = document.querySelector('#arrowPickBody .arrow-opt-empty');
      if(note) note.textContent = QC7Logic.MESSAGE;
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.id = 'qc7Cancel';
      cancel.className = 'ghost qc7-cancel';
      cancel.textContent = QC7Logic.BUTTON;
      cancel.addEventListener('click', () => {
        const close = document.getElementById('arrowPickClose');
        if(close) close.click();
      });
      old.replaceWith(cancel);
      return true;
    };
    // EQ7.before builds its picker before its first await, so the button is there to replace when it returns.
    if(api.enabled()){
      const previousBefore = EQ7.before;
      EQ7.before = function(){
        const out = previousBefore.apply(this, arguments);
        if(api.enabled()) api.decorate();
        return out;
      };
    }
    return api;
  })();
