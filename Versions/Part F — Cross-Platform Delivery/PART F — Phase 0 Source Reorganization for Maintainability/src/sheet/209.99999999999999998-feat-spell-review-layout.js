  // ============ PART H PHASE 15.1.21 — STARTING-SPELL REVIEW: OPTION CARDS, LIVE COUNTS AND ONE ACTION BAR ============
  // Phase 15, Release 15a, follow-up 8b.1-UI-01 (group G3), approved as mocked up by the owner on 11 November 2026.
  // The number 21 is this unit's marker only; the finding keeps its identifier, 8b.1-UI-01.
  // The older-holdings review of starting spells drew its groups as boxed fieldsets with tall rows, put Confirm
  // against the last box and 2 px left of it, and left Later below on its own. This unit lays the same review out as
  // the app's other pickers: each held spell is an option card, the groups scroll, and Later and Confirm share one bar
  // under a divider. Each group's heading counts the ticks as they are made ("2 of 3 chosen"), where the older-holdings
  // layer wrote "3 left" once and never changed it.
  // It rebinds the School-choice dialog's render by property and, after each render, looks at what was drawn. A review
  // of spells (the older-holdings layer's Confirm and its tick boxes, both directly under the dialog's body) is
  // dressed; anything else, the ordinary chooser included, has the dressing class taken off. Nothing is moved out of
  // its parent: Confirm stays in the body, which the older-holdings layer's own guard requires, and Later stays the
  // dialog's own last child. The groups are wrapped in one scrolling box inside the body, which the next render
  // replaces along with everything else there. The stylesheet (1139-spell-review-layout.css) does the rest.
  // The count is display of the draft only: it reads the tick boxes and writes no value, save, roll, undo or focus.
  // Everything waits for body.sr15-on, which the switch sets: with the switch off the review is exactly as before.
  const SPELL_REVIEW_LAYOUT_ENABLED = true;

  const SR15 = (function(){
    const api = {installed: false};
    api.enabled = function(){ return SPELL_REVIEW_LAYOUT_ENABLED; };
    // The heading the older-holdings layer writes for a group with a number still owed: "Water · 3 left".
    api.LEFT = /^(.*?) · (\d+) left$/;
    api.GIVEN = 'Given by your School';
    api.body = function(dialog){ return dialog ? dialog.querySelector(':scope > #sc8Body') : null; };
    api.isReview = function(dialog){
      const body = api.body(dialog);
      return !!body && !!body.querySelector(':scope > .oc8-confirm') && !!body.querySelector('fieldset input.oc8-spell');
    };
    api.label = function(chosen, want){
      if(chosen > want) return chosen + ' of ' + want + ' · deselect ' + (chosen - want);
      return chosen + ' of ' + want + ' chosen' + (chosen === want ? ' ✓' : '');
    };
    // A group's heading: its name, then the running count where the layer gave a number.
    api.head = function(group){
      const legend = group.querySelector(':scope > legend');
      if(!legend || legend.querySelector('.sr15-name')) return;
      const hit = api.LEFT.exec(legend.textContent);
      const name = document.createElement('span');
      name.className = 'sr15-name';
      name.textContent = hit ? (hit[1] === 'Given' ? api.GIVEN : hit[1]) : legend.textContent;
      legend.textContent = '';
      legend.appendChild(name);
      if(!hit) return;
      group.dataset.sr15Want = hit[2];
      const count = document.createElement('span');
      count.className = 'sr15-count';
      legend.appendChild(count);
    };
    api.tally = function(){
      document.querySelectorAll('#sc8Dialog .sr15-groups > fieldset[data-sr15-want]').forEach(function(group){
        const count = group.querySelector(':scope > legend > .sr15-count');
        if(!count) return;
        const want = Number(group.dataset.sr15Want), chosen = group.querySelectorAll('input.oc8-spell:checked').length;
        const text = api.label(chosen, want), state = chosen > want ? 'over' : chosen === want ? 'done' : 'open';
        if(count.textContent !== text) count.textContent = text;
        if(count.dataset.state !== state) count.dataset.state = state;
      });
    };
    api.dress = function(){
      const dialog = document.getElementById('sc8Dialog');
      if(!dialog) return false;
      if(!document.body.classList.contains('sr15-on') || !api.isReview(dialog)){
        dialog.classList.remove('sr15-review');
        return false;
      }
      const body = api.body(dialog);
      if(!body.querySelector(':scope > .sr15-groups')){
        const sets = Array.from(body.querySelectorAll(':scope > fieldset'));
        const groups = document.createElement('div');
        groups.className = 'sr15-groups';
        sets[0].before(groups);
        sets.forEach(function(set){ groups.appendChild(set); api.head(set); });
        // The listener goes with the box when the next render replaces the body's contents.
        groups.addEventListener('change', api.tally);
      }
      dialog.classList.add('sr15-review');
      api.tally();
      return true;
    };
    api.install = function(){
      if(api.installed || !SPELL_REVIEW_LAYOUT_ENABLED) return false;
      if(typeof SC8 !== 'object' || !SC8 || typeof SC8.render !== 'function') return false;
      api.installed = true;
      document.body.classList.add('sr15-on');
      const sr15Render = SC8.render;
      SC8.render = function(){ const out = sr15Render.apply(this, arguments); api.dress(); return out; };
      return true;
    };
    return api;
  })();
  SR15.install();
  // ============ END PART H PHASE 15.1.21 ============
