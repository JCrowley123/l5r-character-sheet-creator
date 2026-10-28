  // BUGFIX GI7: the confirmation Identity meets is shown ticked; the wizard's Name step asks gender and age.
  const GI7Ui = (() => {
    const api = {};
    api.NOTES = {
      match: g => 'Your Identity says ' + g + ', which meets this.',
      conflict: g => 'Your Identity says ' + g + '. Tick only if your GM agrees.',
      unknown: () => 'Or enter the Gender in Identity.'
    };
    // UI hook: the Advanced School's confirmation boxes.
    api.paint = () => {
      document.querySelectorAll('#advancedSchoolConfirmations input[type=checkbox]').forEach(box => {
        const status = GI7Logic.status(box.value, GI7.gender());
        const label = box.closest('label');
        let note = document.getElementById('gi7Note-' + box.value);
        if(!status || !label){ if(note) note.remove(); return; }
        if(status === 'match'){ box.checked = true; box.disabled = true; }
        else if(box.dataset.gi7 === 'match'){ box.checked = false; box.disabled = false; }
        box.dataset.gi7 = status;
        if(!note){ note = document.createElement('p'); note.id = 'gi7Note-' + box.value; note.className = 'gi7-note'; label.after(note); }
        note.textContent = api.NOTES[status](GI7.gender().trim());
      });
    };
    api.optional = () => {
      const box = document.createElement('div');
      box.className = 'gi7-wizard';
      box.id = 'gi7Wizard';
      const head = document.createElement('h3');
      head.className = 'cw112-sub';
      head.textContent = 'Gender and age (optional)';
      const hint = document.createElement('p');
      hint.className = 'cw112-note';
      hint.textContent = 'Skip either. You can fill them in or change them later in Identity.';
      box.append(head, hint);
      [['f_gender', 'gi7Gender', 'Gender'], ['f_age', 'gi7Age', 'Age']].forEach(([field, id, text]) => {
        const label = document.createElement('label');
        label.className = 'gi7-label';
        label.htmlFor = id;
        label.textContent = text;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'cw112-input';
        input.id = id;
        input.autocomplete = 'off';
        input.value = (document.getElementById(field) || {}).value || '';
        input.addEventListener('input', () => {
          const target = document.getElementById(field);
          if(!target) return;
          target.value = input.value;
          target.dispatchEvent(new Event('input', {bubbles:true}));
          target.dispatchEvent(new Event('change', {bubbles:true}));
        });
        box.append(label, input);
      });
      return box;
    };
    // UI hook: the creation wizard's Name step; a new Clan's start-over keeps gender and age with the name.
    api.wizard = () => {
      if(typeof CW112 !== 'object' || !CW112 || !Array.isArray(CW112.steps)) return false;
      const step = CW112.steps.find(s => s && s.id === 'name');
      if(!step) return false;
      const render = step.render;
      step.render = function(body){
        const result = render.apply(this, arguments);
        body.appendChild(api.optional());
        return result;
      };
      const startOver = CW112.startOverIfApplied;
      CW112.startOverIfApplied = async function(){
        const keep = ['f_gender', 'f_age'].map(id => [id, (document.getElementById(id) || {}).value || '']);
        const ok = await startOver.apply(this, arguments);
        if(ok) keep.forEach(([id, value]) => {
          const field = document.getElementById(id);
          if(field && field.value !== value){ field.value = value; field.dispatchEvent(new Event('input', {bubbles:true})); }
        });
        return ok;
      };
      return true;
    };
    if(GI7.enabled()){
      if(typeof AS47 === 'object' && AS47 && typeof AS47.renderChoice === 'function'){
        const renderChoice = AS47.renderChoice;
        // The entry button is worked out inside renderChoice, before the boxes are painted, so it is worked out again.
        AS47.renderChoice = function(){
          const result = renderChoice.apply(this, arguments);
          api.paint(); if(typeof AS47.updateEntryButton === 'function') AS47.updateEntryButton();
          return result;
        };
      }
      api.wizard();
    }
    return api;
  })();
