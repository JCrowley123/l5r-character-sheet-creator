  // BUGFIX HT7: the Curse's row names the spends the sheet doubles by itself.
  if(HT7.enabled() && typeof hoteiUi4536Row === 'function'){
    const ht7Row = hoteiUi4536Row;
    // UI hook: the Curse's Disadvantage row, after its own note.
    hoteiUi4536Row = function(row){
      const result = ht7Row.apply(this, arguments);
      const note = document.createElement('span');
      note.className = 'ht7-note';
      note.textContent = 'Where the sheet spends the Void Point itself (Dark Paragon, your Ancestor’s gifts), it takes both. Use the button for a Technique.';
      row.appendChild(note);
      return result;
    };
    // UI hook: the status line written straight after a doubled spend says two points.
    const ht7Status = setStatus;
    setStatus = function(msg){
      return ht7Status.call(this, HT7.doubled ? HT7Logic.outcome(msg) : msg);
    };
    // UI hook: the after-roll gift buttons (Kakita, Sun Tao) name the price while the Curse is on.
    if(typeof ANC48 === 'object' && ANC48 && typeof ANC48.block === 'function'){
      const ht7Block = ANC48.block;
      ANC48.block = function(key, head, label){
        const args = Array.prototype.slice.call(arguments);
        if(HT7.cursed() && typeof label === 'string') args[2] = label.replace('(a Void Point)', '(two Void Points: Hotei’s Curse)');
        return ht7Block.apply(this, args);
      };
    }
  }
