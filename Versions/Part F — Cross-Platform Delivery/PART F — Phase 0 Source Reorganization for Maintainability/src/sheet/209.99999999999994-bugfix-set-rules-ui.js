  // BUGFIX SR7: the set rules on the sheet. Greyed entries in the Advantage and Disadvantage pickers (the wizard copies
  // them), a greyed Fortune in its choice, a flag on both rows of a held pair (never changed), the GM overrides in
  // Management, and one validator warning. Every decision is SR7Logic's.
  const SR7 = (() => {
    const api = {};
    api.enabled = () => SET_RULES_ENABLED && typeof R455 === 'object' && !!R455 && R455.enabled() && typeof readAdvConfig === 'function';
    api.FIELD = 'f_setRuleOverrides';
    api.overrides = () => SR7Logic.parseOverrides((document.getElementById(api.FIELD) || {}).value);
    api.rows = () => Array.from(document.querySelectorAll('#advList .entry, #disadvList .entry')).map(div => {
      const n = div.querySelector('.en-name'), name = n ? n.value : '', set = SR7Logic.setOf(name), c = set ? readAdvConfig(div) : null;
      return {div, name, choice:c && typeof c[set.field] === 'string' ? c[set.field] : ''};
    });
    api.pickerReason = name => {
      if(!SR7Logic.setOf(name)) return null;
      const hit = SR7Logic.blocked(name, undefined, api.rows(), api.overrides());
      return hit ? SR7Logic.reason(hit) : null;
    };
    // UI hook: the open choice dialog. A choice another row rules out is greyed with its reason; the saved one never is.
    api.decorateModal = div => {
      const rows = api.rows(), at = rows.findIndex(r => r.div === div);
      if(at < 0 || !SR7Logic.setOf(rows[at].name)) return 0;
      const overrides = api.overrides();
      let greyed = 0;
      document.querySelectorAll('#advConfigGrid input[type="radio"]').forEach(radio => {
        const hit = radio.value === rows[at].choice ? null : SR7Logic.blocked(rows[at].name, radio.value, rows, overrides, at);
        if(!hit) return;
        radio.disabled = true;
        const label = radio.closest('label');
        if(label && !label.querySelector('.sr7-reason')){
          const why = document.createElement('span');
          why.className = 'sr7-reason';
          why.textContent = ' — ' + SR7Logic.reason(hit);
          label.appendChild(why);
        }
        greyed++;
      });
      return greyed;
    };
    // A ruled-out choice is refused at Confirm too; keeping the saved choice never is.
    api.refuseConfirm = () => {
      const div = advConfigTargetEntry, picked = document.querySelector('#advConfigGrid input[type="radio"]:checked');
      if(!div || !picked) return false;
      const rows = api.rows(), at = rows.findIndex(r => r.div === div);
      if(at < 0 || picked.value === rows[at].choice) return false;
      const hit = SR7Logic.blocked(rows[at].name, picked.value, rows, api.overrides(), at);
      if(!hit) return false;
      setStatus(rows[at].name + ': ' + picked.value + ' is ' + SR7Logic.reason(hit) + '.');
      return true;
    };
    // UI hook: the flag on each row of a held pair, before the row's description.
    api.paint = () => {
      const rows = api.rows(), want = new Map();
      SR7Logic.pairs(rows, api.overrides()).forEach(p => [p.i, p.j].forEach(k => {
        const list = want.get(rows[k].div) || [];
        list.push({text:SR7Logic.text(p, rows), allowed:p.allowed});
        want.set(rows[k].div, list);
      }));
      rows.forEach(r => {
        const list = want.get(r.div) || [], key = JSON.stringify(list);
        let box = r.div.querySelector(':scope > .sr7-flags');
        if(!list.length){ if(box) box.remove(); return; }
        if(box && box.dataset.sr7 === key) return;
        if(!box){
          box = document.createElement('div');
          box.className = 'sr7-flags print-hide';
          r.div.insertBefore(box, r.div.querySelector(':scope > .en-desc'));
        }
        box.dataset.sr7 = key;
        box.textContent = '';
        list.forEach(f => {
          const p = document.createElement('p');
          p.className = f.allowed ? 'sr7-note' : 'sr7-flag';
          p.setAttribute('role', 'note');
          p.textContent = f.text;
          box.appendChild(p);
        });
      });
    };
    api.findings = () => {
      const rows = api.rows(), held = SR7Logic.pairs(rows, api.overrides()).filter(p => !p.allowed);
      return held.length ? [validationFinding('set-rules', 'warning', 'Advantage and Disadvantage sets (' + SR7Logic.PAGE + ')',
        held.map(p => SR7Logic.text(p, rows)).join(' '))] : [];
    };
    api.setOverride = (id, on) => {
      const rule = SR7Logic.rule(id), field = document.getElementById(api.FIELD);
      if(!rule || !field) return false;
      if(typeof MODES12 === 'object' && MODES12 && MODES12.isPlay()){
        setStatus('Switch to Management to change a GM override.');
        api.syncOverrides();
        return false;
      }
      field.value = SR7Logic.writeOverrides(api.overrides().filter(x => x !== id).concat(on ? [id] : []));
      recalcAll();
      field.dispatchEvent(new Event('input', {bubbles:true}));
      setStatus('GM override ' + (on ? 'on' : 'off') + ': ' + rule.label + '.');
      return true;
    };
    api.syncOverrides = () => {
      const list = api.overrides();
      document.querySelectorAll('#sr7Overrides input[type="checkbox"]').forEach(box => {
        const on = list.indexOf(box.value) >= 0;
        if(box.checked !== on) box.checked = on;
      });
    };
    // UI hook: the GM overrides, closed, under the Advantage and Disadvantage lists.
    api.mount = () => {
      const list = document.getElementById('disadvList'), host = list && list.closest('.section');
      if(!host || document.getElementById('sr7Overrides')) return false;
      const box = document.createElement('details');
      box.id = 'sr7Overrides';
      box.className = 'sr7-overrides print-hide';
      const summary = document.createElement('summary');
      summary.textContent = 'GM overrides: Advantage and Disadvantage sets';
      const hint = document.createElement('p');
      hint.className = 'hint';
      hint.textContent = SR7Logic.PAGE + ' lets the GM allow what its set rules forbid. Each tick lifts one rule for this character. ' +
        'Entries already held are never changed either way.';
      const field = document.createElement('input');
      field.type = 'hidden';
      field.id = api.FIELD;
      box.append(summary, hint, field);
      SR7Logic.RULES.forEach(rule => {
        const label = document.createElement('label');
        label.className = 'sr7-override';
        const tick = document.createElement('input');
        tick.type = 'checkbox';
        tick.value = rule.id;
        tick.addEventListener('change', () => api.setOverride(rule.id, tick.checked));
        const text = document.createElement('span');
        text.textContent = rule.label;
        label.append(tick, text);
        box.appendChild(label);
      });
      host.appendChild(box);
      return true;
    };
    return api;
  })();
  if(SR7.enabled()){
    SR7.mount();
    const sr7Ineligible = R455.ineligible;
    R455.ineligible = function(name){ return sr7Ineligible.apply(this, arguments) || SR7.pickerReason(name); };
    // Both openers: a Disadvantage row's own Change button calls D45.open directly.
    const sr7Decorated = open => function(div){ const result = open.apply(this, arguments); SR7.decorateModal(div); return result; };
    openAdvConfigModal = sr7Decorated(openAdvConfigModal);
    if(typeof D45 === 'object' && D45 && typeof D45.open === 'function') D45.open = sr7Decorated(D45.open);
    const sr7Confirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){ return SR7.refuseConfirm() || sr7Confirm.apply(this, arguments); };
    const sr7Recalc = recalcAll;
    recalcAll = function(){ const result = sr7Recalc.apply(this, arguments); SR7.paint(); SR7.syncOverrides(); return result; };
    // The lists' own input listener holds recalcAll from before this layer: a committed set name, or one typed over,
    // recalculates here so its flags follow.
    ['advList', 'disadvList'].forEach(id => document.getElementById(id).addEventListener('change', event => {
      const input = event.target, row = input.closest('.entry');
      if(input.classList.contains('en-name') && (SR7Logic.setOf(input.value) || (row && row.querySelector(':scope > .sr7-flags')))) recalcAll();
    }));
    // A save from before this layer has no overrides: none carry over from the character open before it.
    const sr7Apply = applyData;
    applyData = function(data){
      const handed = data && data.fields && typeof data.fields === 'object' && !(SR7.FIELD in data.fields)
        ? Object.assign({}, data, {fields:Object.assign({}, data.fields, {[SR7.FIELD]:''})}) : data;
      const result = sr7Apply.call(this, handed);
      SR7.syncOverrides();
      SR7.paint();
      return result;
    };
    const sr7Reset = resetToBaseline;
    resetToBaseline = function(){ const result = sr7Reset.apply(this, arguments); SR7.syncOverrides(); SR7.paint(); return result; };
    if(typeof CHARACTER_VALIDATOR_RULES !== 'undefined') CHARACTER_VALIDATOR_RULES.push({id:'set-rules', fn:SR7.findings});
    if(typeof MODES12 === 'object' && MODES12 && typeof MODES12.register === 'function') MODES12.register('#sr7Overrides input');
  }
