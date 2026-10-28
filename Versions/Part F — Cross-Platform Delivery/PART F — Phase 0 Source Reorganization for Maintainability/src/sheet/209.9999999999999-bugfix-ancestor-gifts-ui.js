  // BUGFIX AG7: Management's favour setting on the Ancestor card; hidden and locked in Play.
  const AG7Ui = (() => {
    const api = {};
    api.choose = state => {
      const s = ANC48.current();
      if(!s) return false;
      const a = ANC48.byName(s.name);
      const next = AG7Logic.set(s, state, !!(a && a.noReturn));
      if(!next || !ANC48.valid(next)) return false;
      ANC48.write(next);
      ANC48.render();
      ANC48.after(s.name + ': ' + AG7Logic.LABELS[state].toLowerCase() + ', set in Management.');
      return true;
    };
    // UI hook: the Ancestor card, after its badge.
    api.paint = () => {
      const old = document.getElementById('ag7Favour');
      if(old) old.remove();
      const card = document.getElementById('anc48Card'), s = ANC48.current();
      const a = s ? ANC48.byName(s.name) : null;
      if(!card || card.hidden || !a) return;
      const box = document.createElement('div');
      box.id = 'ag7Favour';
      box.className = 'ag7-favour print-hide';
      const label = document.createElement('label');
      label.htmlFor = 'ag7FavourEdit';
      label.textContent = 'Set the favour (Management)';
      const select = document.createElement('select');
      select.id = 'ag7FavourEdit';
      select.className = 'field';
      AG7Logic.allowed(!!a.noReturn).forEach(state => select.appendChild(new Option(AG7Logic.LABELS[state], state)));
      select.value = AG7Logic.of(s);
      select.addEventListener('change', () => api.choose(select.value));
      const hint = document.createElement('p');
      hint.className = 'hint';
      hint.textContent = 'For corrections agreed with your GM: this sets the badge directly, without its questions.';
      box.append(label, select, hint);
      (card.querySelector('.anc48-favour') || card).appendChild(box);
    };
    if(AG7.enabled()){
      const render = ANC48.render;
      ANC48.render = function(){ const result = render.apply(this, arguments); api.paint(); return result; };
      if(typeof MODES12 === 'object' && MODES12 && typeof MODES12.register === 'function') MODES12.register('#ag7FavourEdit');
    }
    return api;
  })();
