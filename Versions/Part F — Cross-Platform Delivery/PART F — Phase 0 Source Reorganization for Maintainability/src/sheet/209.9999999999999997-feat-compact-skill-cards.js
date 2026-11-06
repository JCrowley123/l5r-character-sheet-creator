  // ============ PART H PHASE 15.1.3 — TOP-ALIGNED COLUMNS AND COMPACT SKILL CARDS ============
  // Phase 15, Release 15a, finding A03 (owner's ruling Q1, 1 November 2026; revision 2 on the owner's decision of
  // 6 November 2026). Two layout changes, one unit:
  // 1. On a wide screen the Advantage and Disadvantage columns sit side by side, and the carousel's grid rule
  //    aligned them to the BOTTOM, so with unequal lists one column began far below the other (measured on the
  //    dense test character: 1,113 px; with no Advantages, 2,247 px). The stylesheet (1129-compact-skill-cards.css)
  //    starts both at the top, on that page's grid only.
  // 2. On a phone each Skill card stacked every field on its own labelled line, 324-601 px a card. The stylesheet
  //    lays each card out as a compact name / Rank / roll row, then:
  //    - in Play, one summary line (the Trait, the Emphases and School when ticked) beside the eye, then the
  //      Mastery notes already reached. The fields themselves are not drawn, because the line shows their values;
  //      the XP and the Masteries not yet reached are drawn in Manage;
  //    - in Manage, every field, packed tighter, then all the Mastery notes, then Remove.
  //    Nothing is behind a control. Revision 1 put the fields and notes under a Details disclosure; the owner
  //    removed it because it hid what is used at the table. This script adds the summary line to each row and
  //    keeps it current. While a row has more Emphases than its Rank allows, the line leads with the sheet's own
  //    count note, so that warning is never hidden. No field, value, tick or action is removed, moved or rewired:
  //    they keep their elements, listeners, names and Play/Manage locks; only where and whether they are drawn
  //    changes.
  // The summary's words come from CSS (attr()), so it adds no text to the row. It is not a control: it takes no
  // focus and has no title=, so no information button is added to it. Play and Manage are told apart by the body
  // class of Phase 12 (Part K); without that phase every card takes the Manage layout.
  // With the switch off nothing is set or added and the page is exactly as before.
  const COMPACT_SKILL_CARDS_ENABLED = true;

  const CS15 = (function(){
    const api = {installed: false, observer: null};
    api.enabled = function(){ return COMPACT_SKILL_CARDS_ENABLED; };
    api.rows = function(){ return Array.from(document.querySelectorAll('#skillsBody > tr')); };
    api.value = function(el){ return el ? String(el.value || '').trim() : ''; };
    // The summary line: Trait, the chosen Emphases, and School when ticked.
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
    // More Emphases than the Rank allows: the sheet's own count note (the only warning, in the Emphases cell) is not
    // drawn in Play, so the summary leads with it while the row is over the limit. Uses the trunk's own count.
    api.warning = function(tr){
      if(typeof getUsableEmphSlots !== 'function') return '';
      let usable;
      try { usable = getUsableEmphSlots(tr).usableSlots; } catch(e){ return ''; }
      const count = tr.querySelectorAll('.emph-container .emph-item-row').length;
      if(count <= usable) return '';
      const noteEl = tr.querySelector('.emph-limit-note');
      const note = noteEl ? String(noteEl.textContent || '').trim() : '';
      return note || (count + ' Emphases, ' + usable + ' allowed');
    };
    api.summaryOf = function(tr){ return tr.querySelector('.cs15-summary'); };
    // Writes only what changed, so repeated refreshes cause no attribute churn.
    api.refresh = function(tr){
      const line = api.summaryOf(tr);
      if(!line) return;
      const warning = api.warning(tr);
      const summary = [warning, api.summary(tr)].filter(Boolean).join(' · ');
      if(warning && !line.hasAttribute('data-cs15-warn')) line.setAttribute('data-cs15-warn', '');
      if(!warning && line.hasAttribute('data-cs15-warn')) line.removeAttribute('data-cs15-warn');
      if(line.getAttribute('data-cs15-summary') !== summary) line.setAttribute('data-cs15-summary', summary);
    };
    // Adds the summary line to one row, once, right after the name line.
    api.decorate = function(tr){
      if(!tr || api.summaryOf(tr)) return false;
      const nameRow = tr.querySelector('.sk-name-row');
      if(!nameRow) return false;
      const line = document.createElement('div');
      line.className = 'cs15-summary';
      nameRow.insertAdjacentElement('afterend', line);
      api.refresh(tr);
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
      // the rows' contents, so adding the line cannot re-trigger it.
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
