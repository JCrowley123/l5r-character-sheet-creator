  // BUGFIX CE7: replaceable card editing and bounded Undo feedback.
  const CE7 = (() => {
    const api = {}, names = ['honor','glory','status','taint'];
    const titles = {honor:'Honour',glory:'Glory',status:'Status',taint:'Taint'};
    const inputs = new Map(), problems = new Map(), drafts = new Set();
    let timer = null, generation = 0, epoch = 0, shown = null;
    api.enabled = () => CHARACTERISTIC_EDITING_ENABLED && typeof CP7 === 'object' && CP7.enabled();
    // A save remembers the transaction and the count of loads and resets when it began.
    api.token = () => ({generation, epoch});
    const notice = () => document.getElementById('cp7-notice');
    function stopTimer() {clearTimeout(timer); timer = null;}
    api.expire = () => {stopTimer(); generation++; if(typeof CP7.ce7ExpireUndo === 'function') CP7.ce7ExpireUndo();};
    api.saved = token => {if(token?.generation === generation) api.expire();};
    // With no load or reset during the save, the sheet it names is the one still open, so a newer Undo follows the
    // id it was given; otherwise the sheet is another character and the Undo stays put. The button is redrawn either way.
    api.identified = token => {if(token && typeof CP7.ce7RebindUndo === 'function') CP7.ce7RebindUndo(currentId, token.epoch === epoch);};
    function arm() {stopTimer(); timer = setTimeout(api.expire, CE7Logic.undoMilliseconds);}
    function problem(input, text) {
      input.setAttribute('aria-invalid','true'); problems.delete(input); problems.set(input,text); shown = input;
      const n = notice(); if(n) {n.textContent = text; n.setAttribute('role','alert');}
    }
    // A corrected or cancelled field withdraws only its own alert; another field's error is shown again.
    function resolve(input) {
      drafts.delete(input); input.removeAttribute('aria-invalid');
      const text = problems.get(input), n = notice(); problems.delete(input);
      if(shown !== input || !n || n.getAttribute('role') !== 'alert' || n.textContent !== text) return;
      const left = [...problems.keys()].pop() || null; shown = left;
      n.textContent = left ? problems.get(left) : ''; n.setAttribute('role', left ? 'alert' : 'status');
    }
    // Undo, a load or a reset replaces the values: every field shows them, rejected drafts included. Undo alone
    // leaves the field still being typed in, since its text is not yet applied.
    function sync(keepTyping) {
      problems.clear(); shown = null;
      inputs.forEach((fields, name) => {
        const state = CP7.read(name);
        for(const field of ['rank','points']) {
          const input = fields[field];
          if(keepTyping && document.activeElement === input && drafts.has(input) && input.getAttribute('aria-invalid') !== 'true') continue;
          input.removeAttribute('aria-invalid'); drafts.delete(input); if(state) input.value = state[field];
        }
      });
    }
    // A redraw keeps typed text not yet applied and a rejected entry; any other field shows the value.
    api.render = name => {
      const state = CP7.read(name), fields = inputs.get(name); if(!state || !fields) return;
      for(const field of ['rank','points']) {
        const input = fields[field];
        if(!(document.activeElement === input && drafts.has(input)) && input.getAttribute('aria-invalid') !== 'true') input.value = state[field];
      }
    };
    api.edit = (name, field) => {
      if(typeof MODES12 === 'object' && MODES12.isPlay()) return false;
      const input = inputs.get(name)?.[field]; if(!input) return false;
      const state = CP7.read(name);
      if(!state || !CE7Logic.valid(name,field,input.value)) {
        problem(input, field === 'rank' && name !== 'taint' ? 'Enter a whole Rank between 0 and 10.' : 'Enter a whole number of zero or greater, with no decimals or minus sign.');
        return false;
      }
      const value = CE7Logic.integer(input.value), rank = field === 'rank' ? value : state.rank, points = field === 'points' ? value : state.points;
      const next = name === 'taint' ? TA7Logic.normalize(rank,points) : RP7Logic.normalize(name,rank,points);
      if(!next) {problem(input,'This value is too large to apply accurately.'); return false;}
      const ok = CP7Logic.same(state,next) || CP7.commit(name,next);
      if(!ok) {problem(input, notice()?.textContent || 'The change could not be applied.'); return false;}
      resolve(input); input.value = CP7.read(name)[field]; api.render(name); return true;
    };
    api.clearDrafts = () => {stopTimer(); generation++; epoch++; sync(false);};
    api.mount = () => {
      const host = document.getElementById('cp7-section'); if(!host) return;
      host.classList.add('ce7-active');
      names.forEach(name => {
        const card = host.querySelector('[data-cp7='+name+']'), fields = {};
        for(const field of ['rank','points']) {
          const output = card.querySelector('.cp7-'+field), input = document.createElement('input');
          input.id = 'ce7-'+name+'-'+field; input.className = 'ce7-edit'; input.type = 'text'; input.inputMode = 'numeric'; input.pattern = '[0-9]*';
          input.autocomplete = 'off'; input.dataset.ce7Management = 'true'; input.setAttribute('aria-label', titles[name]+' '+(field === 'rank'?'Rank':'Points')); input.setAttribute('aria-describedby','cp7-notice');
          output.after(input); fields[field] = input;
          input.addEventListener('input', () => drafts.add(input));
          input.addEventListener('change', () => api.edit(name,field));
          input.addEventListener('keydown', event => {if(event.key === 'Enter') {event.preventDefault(); api.edit(name,field);} if(event.key === 'Escape') {resolve(input); input.value = CP7.read(name)[field];}});
        }
        inputs.set(name,fields);
        if(name === 'glory' || name === 'status') {
          const button = document.getElementById('cp7-'+name+'-rank')?.parentElement.querySelectorAll('button')[1];
          if(button) {button.classList.add('ce7-recognition','ce7-card-action'); card.querySelector('.cp7-adjust').append(button);}
        }
      });
      const growth = document.getElementById('ta7-check');
      if(growth) {growth.classList.add('ce7-card-action'); host.querySelector('[data-cp7=taint] .cp7-adjust').append(growth);}
      document.getElementById('cp7-undo')?.addEventListener('click', () => {if(document.getElementById('cp7-undo').hidden && notice()?.getAttribute('role') !== 'alert') {generation++; sync(true); arm();}});
      if(typeof MODES12 === 'object') MODES12.register('[data-ce7-management]');
      names.forEach(api.render);
    };
    api.install = () => {
      api.mount();
      // UI hook: continue using the established write, validation and Undo transaction.
      const render = CP7.render; CP7.render = function(name) {const result = render.apply(this,arguments); api.render(name); return result;};
      const commit = CP7.commit; CP7.commit = function() {const result = commit.apply(this,arguments); if(result) {generation++; arm();} return result;};
      const clear = CP7.clear; CP7.clear = function() {const result = clear.apply(this,arguments); api.clearDrafts(); return result;};
    };
    return api;
  })();
  if(CE7.enabled()) CE7.install();
