  // BUGFIX RF7: nothing a roll pays after its preview is kept when a later question cancels the roll (owner ruling,
  // 29 October 2026; Dark Paragon's Determination first). The outermost gate reads what a roll can pay from before
  // the preview and its questions, and puts all of it back when they cancel. Spell slots stay with GR7, which
  // refunds them; the slot is taken before the gate opens, so this layer never sees it.
  const PREVIEW_REFUND_ENABLED = true;
  const RF7Logic = {
    // before, after: {key: value}. The keys whose value changed.
    changed(before, after){ return Object.keys(before).filter(k => before[k] !== after[k]); },
    // labels: what was given back, in order; blanks are things armed, not paid. prior: the status line now, which
    // keeps an inner refund's message (a spell slot's) and adds to it.
    message(labels, prior){
      const named = labels.filter((l, i) => l && labels.indexOf(l) === i);
      if(!named.length) return '';
      return /given back/.test(prior || '') ? prior + ' Also given back: ' + named.join(', ') + '.'
        : 'Roll cancelled; given back: ' + named.join(', ') + '.';
    }
  };
  const RF7 = (() => {
    const api = {};
    // [element id, label]: Honor, Void Points, the armed Void effects, the Round's spends, the Ancestor's gifts.
    api.FIELDS = [['f_honorPts', 'Honor'], ['f_honorRank', 'Honor'], ['void_current', 'Void Points'],
      ['voidPendingEffects', ''], ['combatRoundLedger', 'this Round’s Void spend'], ['f_ancestor', 'the Ancestor’s gift']];
    api.enabled = () => PREVIEW_REFUND_ENABLED && typeof rollPreviewGate === 'function';
    api.last = null;
    // Each Advantage and Disadvantage row's saved setting: a session use, a moon's Void Point.
    api.rows = () => Array.from(document.querySelectorAll('#advList .entry, #disadvList .entry'));
    api.rowLabel = div => {
      const name = div.querySelector('.en-name');
      return (name && name.value.trim() ? name.value.trim() : 'an Advantage') + '’s use';
    };
    api.capture = () => {
      const fields = {}, rows = new Map();
      api.FIELDS.forEach(([id]) => { const el = document.getElementById(id); if(el) fields[id] = el.value; });
      api.rows().forEach(div => rows.set(div, div.dataset.advConfig === undefined ? null : div.dataset.advConfig));
      return {fields, rows};
    };
    // Puts back what changed since `before`; returns the labels of what was given back.
    api.restore = before => {
      const now = api.capture(), given = [];
      RF7Logic.changed(before.fields, now.fields).forEach(id => {
        document.getElementById(id).value = before.fields[id];
        given.push(api.FIELDS.find(f => f[0] === id)[1]);
      });
      before.rows.forEach((config, div) => {
        if(!div.isConnected || !now.rows.has(div) || now.rows.get(div) === config) return;
        if(config === null) delete div.dataset.advConfig; else div.dataset.advConfig = config;
        given.push(api.rowLabel(div));
      });
      if(!given.length) return given;
      // UI hook: the trackers that show these fields redraw from them.
      if(typeof renderVoidPips === 'function') renderVoidPips();
      if(typeof renderVoidPanel === 'function') renderVoidPanel();
      if(typeof renderCombatRoundUI === 'function') renderCombatRoundUI();
      if(typeof RP7 === 'object' && RP7 && RP7.enabled()) RP7.render('honor');
      recalcAll();
      const status = document.getElementById('statusMsg');
      const message = RF7Logic.message(given, status ? status.textContent : '');
      if(message) setStatus(message);
      return given;
    };
    if(api.enabled()){
      const previousGate = rollPreviewGate;
      rollPreviewGate = async function(){
        const before = api.capture();
        const proceed = await previousGate.apply(this, arguments);
        if(!proceed) api.last = api.restore(before);
        return proceed;
      };
    }
    return api;
  })();
