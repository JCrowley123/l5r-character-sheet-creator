  // ============ PART H PHASE 15.1.3 — TOP-ALIGNED COLUMNS AND COMPACT SKILL CARDS ============
  // Phase 15, Release 15a, finding A03 (owner's ruling Q1, 1 November 2026). Two layout changes, one unit:
  // 1. On a wide screen the Advantage and Disadvantage columns sit side by side, and the carousel's grid rule
  //    aligned them to the BOTTOM, so with unequal lists one column began far below the other (measured on the
  //    dense test character: 1,113 px; with no Advantages, 2,247 px). The stylesheet (1129-compact-skill-cards.css)
  //    starts both at the top, on that page's grid only.
  // 2. On a phone each Skill card stacked every field on its own labelled line, 324-601 px a card. The stylesheet
  //    lays each card out as a compact name / Rank / roll row, with the secondary editing (Trait, Emphases, School,
  //    XP, Remove) and the Mastery notes under a labelled Details control, which this script adds to each row. The
  //    control's one-line summary repeats the Trait, the Emphases and the School tick, so nothing needed to read a
  //    roll is hidden; while a row has more Emphases than its Rank allows, the summary leads with the sheet's own
  //    count note, so that warning is never hidden either. No field, value, tick or action is removed, moved or rewired: they keep their elements,
  //    listeners, names and Play/Manage locks; only where and whether they are drawn changes.
  // The Details control's visible words come from CSS (attr()), so it adds no text to the row; its accessible name
  // is an aria-label. It has no title=, so no information button is added to it. A card with no name or no Trait
  // starts open, so a new row's fields are on view. The open state is per row and never saved.
  // With the switch off nothing is set or added and the page is exactly as before.
  const COMPACT_SKILL_CARDS_ENABLED = true;

  const CS15 = (function(){
    const api = {installed: false, observer: null};
    api.enabled = function(){ return COMPACT_SKILL_CARDS_ENABLED; };
    api.rows = function(){ return Array.from(document.querySelectorAll('#skillsBody > tr')); };
    api.value = function(el){ return el ? String(el.value || '').trim() : ''; };
    // The one-line summary: Trait, the chosen Emphases, and School when ticked.
    api.summary = function(tr){
      const parts = [];
      const trait = api.value(tr.querySelector('.sk-trait'));
      if(trait) parts.push(trait);
      const emph = Array.from(tr.querySelectorAll('.emph-container .sk-emph-select, .emph-container .sk-emph-text'))
        .map(api.value).filter(Boolean);
      if(emph.length) parts.push(emph.join(', '));
      const school = tr.querySelector('.sk-school');
      if(school && school.checked) parts.push('School');
      return parts.join(' · ');
    };
    // More Emphases than the Rank allows: the sheet's own count note (the only warning, in the Emphases cell) is
    // under Details, so the summary leads with it while the row is over the limit. Uses the trunk's own count.
    api.warning = function(tr){
      if(typeof getUsableEmphSlots !== 'function') return '';
      let usable;
      try { usable = getUsableEmphSlots(tr).usableSlots; } catch(e){ return ''; }
      const count = tr.querySelectorAll('.emph-container .emph-item-row').length;
      if(count <= usable) return '';
      const noteEl = tr.querySelector('.emph-limit-note');
      const note = noteEl ? String(noteEl.textContent || '').trim() : '';
      return note ||(count + ' Emphases, ' + usable + ' allowed');
    };
    api.toggleOf = function(tr){ return tr.querySelector('.cs15-toggle'); };
    api.isOpen = function(tr){ return tr.classList.contains('cs15-open'); };
    // Writes only what changed, so repeated refreshes cause no attribute churn.
    api.refresh = function(tr){
      const button = api.toggleOf(tr);
      if(!button) return;
      const warning = api.warning(tr);
      const summary = [warning, api.summary(tr)].filter(Boolean).join(' · ');
      const open = api.isOpen(tr) ? 'true' : 'false';
      const name = api.value(tr.querySelector('.sk-name')) || 'this Skill';
      const label = 'Details for ' + name + (summary ? ': ' + summary.replace(/ · /g, ', ') : '');
      if(warning && !button.hasAttribute('data-cs15-warn')) button.setAttribute('data-cs15-warn', '');
      if(!warning && button.hasAttribute('data-cs15-warn')) button.removeAttribute('data-cs15-warn');
      if(button.getAttribute('data-cs15-summary') !== summary) button.setAttribute('data-cs15-summary', summary);
      if(button.getAttribute('aria-expanded') !== open) button.setAttribute('aria-expanded', open);
      if(button.getAttribute('aria-label') !== label) button.setAttribute('aria-label', label);
    };
    api.setOpen = function(tr, open){
      tr.classList.toggle('cs15-open', !!open);
      api.refresh(tr);
    };
    // Adds the Details control to one row, once, right after the name line.
    api.decorate = function(tr){
      if(!tr || api.toggleOf(tr)) return false;
      const nameRow = tr.querySelector('.sk-name-row');
      if(!nameRow) return false;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cs15-toggle';
      button.addEventListener('click', function(){ api.setOpen(tr, !api.isOpen(tr)); });
      nameRow.insertAdjacentElement('afterend', button);
      const empty = !api.value(tr.querySelector('.sk-name')) || !api.value(tr.querySelector('.sk-trait'));
      api.setOpen(tr, empty);
      return true;
    };
    api.refreshAll = function(){
      if(!api.installed) return;
      api.rows().forEach(function(tr){ if(!api.decorate(tr)) api.refresh(tr); });
    };
    api.install = function(){
      if(api.installed || !COMPACT_SKILL_CARDS_ENABLED) return false;
      const body = document.getElementById('skillsBody');
      if(!body) return false;
      document.body.classList.add('cs15-on');
      api.installed = true;
      api.rows().forEach(api.decorate);
      // New rows (Add Skill, Apply School, a load) are decorated as they arrive. Watches the row list only, never
      // the rows' contents, so adding a control cannot re-trigger it.
      if(typeof MutationObserver === 'function'){
        api.observer = new MutationObserver(function(){ api.rows().forEach(api.decorate); });
        api.observer.observe(body, {childList: true});
      }
      // Typing in a row keeps its summary current; programmatic changes are caught after each recalculation.
      body.addEventListener('input', function(e){ const tr = e.target && e.target.closest && e.target.closest('#skillsBody > tr'); if(tr) api.refresh(tr); });
      body.addEventListener('change', function(e){ const tr = e.target && e.target.closest && e.target.closest('#skillsBody > tr'); if(tr) api.refresh(tr); });
      if(typeof recalcAll === 'function'){
        const cs15Recalc = recalcAll;
        recalcAll = function(){ const out = cs15Recalc.apply(this, arguments); api.refreshAll(); return out; };
      }
      return true;
    };
    return api;
  })();
  CS15.install();
  // ============ END PART H PHASE 15.1.3 ============
