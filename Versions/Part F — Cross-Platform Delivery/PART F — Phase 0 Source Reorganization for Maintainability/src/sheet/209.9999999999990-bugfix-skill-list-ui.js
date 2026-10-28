  // BUGFIX SL7: the Skills page's picker, redrawn from the sheet's own list whenever the Skill rows change.
  const SL7 = (() => {
    const api = {};
    const picker = () => document.getElementById('skillQuickAdd');
    api.enabled = () => SKILL_LIST_HIDES_HELD_ENABLED && !!picker();
    api.full = null;    // the picker's groups as the sheet built them
    api.shown = '';
    // The sheet's own subject test, as the wizard uses it.
    api.subject = name => {
      const lib = typeof findSkill === 'function' ? findSkill(name) : null;
      return !!(lib && /^varies/i.test(lib.emph || ''));
    };
    api.held = () => Array.from(document.querySelectorAll('#skillsBody .sk-name')).map(input => input.value);
    api.capture = () => Array.from(picker().querySelectorAll('optgroup')).map(g => ({label:g.label,
      options:Array.from(g.querySelectorAll('option')).map(o => ({value:o.value, text:o.textContent}))}));
    api.render = () => {
      const sel = picker();
      if(!sel || !api.full) return;
      const groups = SL7Logic.visible(api.full, api.held(), api.subject);
      const key = JSON.stringify(groups.map(g => [g.label, g.options.map(o => o.value)]));
      if(key === api.shown) return;
      const blank = sel.options[0] && sel.options[0].value === '' ? sel.options[0] : new Option('— choose a skill to add —', '');
      sel.replaceChildren(blank, ...groups.map(g => {
        const og = document.createElement('optgroup');
        og.label = g.label;
        g.options.forEach(o => og.appendChild(new Option(o.text, o.value)));
        return og;
      }));
      sel.value = '';
      api.shown = key;
    };
    if(api.enabled()){
      api.full = api.capture();
      const body = document.getElementById('skillsBody');
      if(body){
        // UI hook: a row added, removed or renamed redraws the picker.
        new MutationObserver(api.render).observe(body, {childList:true});
        ['input', 'change'].forEach(type => body.addEventListener(type, e => {
          if(e.target && e.target.classList && e.target.classList.contains('sk-name')) api.render();
        }));
      }
      api.render();
      // UI hook: the wizard reads this picker for its own lists straight after a row changes, before the observer runs.
      if(typeof CW1121 === 'object' && CW1121 && typeof CW1121.skillGroups === 'function'){
        const sl7Groups = CW1121.skillGroups;
        CW1121.skillGroups = function(){ api.render(); return sl7Groups.apply(this, arguments); };
      }
    }
    return api;
  })();
