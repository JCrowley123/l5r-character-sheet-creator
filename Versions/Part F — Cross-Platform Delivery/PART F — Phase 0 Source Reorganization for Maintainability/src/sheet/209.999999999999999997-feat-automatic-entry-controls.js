  // ============ PART H PHASE 15.1.30 — NO XP BOX AND NO REMOVE BUTTON ON AUTOMATIC ENTRIES ============
  // Phase 15, Release 15a, unit AE3 (the automatic-entries group), approved by the owner on 13 November 2026: layout A
  // (the tag on the name's line) with a fallback on the left. The number 30 is this unit's marker only; the unit keeps
  // its identifier, AE3.
  // The owner's rule (11 November 2026): what the sheet gives automatically is not a choice, so it has no XP box and no
  // ×; what the player chose keeps both. The sheet adds a School's Techniques itself at 0 XP and takes them back itself
  // when the School, a Path or the Rank goes; a × on them misled, because nothing recorded the removal and the next
  // application of the School's Techniques put the card back. The same holds for a School's given spells.
  // This unit marks those cards (.ax15-auto) and the stylesheet (1146-automatic-entry-controls.css) hides their XP box
  // and ×. A card counts only when the sheet itself labelled it and its School is on the character:
  //   - a Technique whose description starts "[School Technique — Rank N, <School>]" or "[Advanced School Technique —
  //     Rank N, <School>]" (the labels the sheet writes), with an XP figure of 0. Its tag reads "School technique",
  //     "Path technique" (the Alternate Path taken at that Rank gives it) or "Advanced School technique";
  //   - a spell the School-choice layer records for a School on the character whose given list names it.
  // A Technique typed in by hand, any other XP figure, Kata, Kiho (bought or free) and every chosen or reward spell
  // keep both controls. When a card's name would not fit beside its tag, the card gets .ax15-wrap and the tag starts
  // the next line, on the left; this is checked when the cards change, when the window is resized and when the mode
  // changes. Nothing is written: the XP box is hidden, not removed, and the save is exactly as before.
  // Everything waits for body.ax15-on, which the switch sets: with the switch off the cards are exactly as before.
  const AUTOMATIC_ENTRY_CONTROLS_ENABLED = true;

  const AX15 = (function(){
    const api = {installed: false, queued: false};
    api.enabled = function(){ return AUTOMATIC_ENTRY_CONTROLS_ENABLED; };
    api.LABELS = {school: 'School technique', path: 'Path technique', advanced: 'Advanced School technique'};
    const TECH = /^\[(Advanced )?School Technique — Rank (\d+), (.+?)\]/;
    const norm = function(s){ return String(s || '').trim().toLowerCase(); };
    const value = function(row, cls){ const el = row.querySelector(cls); return el ? el.value : ''; };
    // The Schools on the character: the Schools list, the current School, and a held Advanced School.
    api.schools = function(){
      const out = [];
      try { getSchoolsList().forEach(function(e){ if(e && typeof e.name === 'string' && e.name) out.push(e.name); }); } catch(e){ /* none */ }
      const current = (document.getElementById('f_school') || {}).value;
      if(current && current.trim()) out.push(current.trim());
      if(typeof AS47 === 'object' && AS47 && typeof AS47.record === 'function'){
        const r = AS47.record();
        if(r && typeof r.name === 'string') out.push(r.name);
      }
      return out;
    };
    // What kind of automatic entry a card is: 'school', 'path', 'advanced', 'given', or '' for none.
    api.kind = function(row, schools){
      schools = schools || api.schools();
      if(row.dataset.spellElement){
        if(typeof SC8 !== 'object' || !SC8 || typeof CW1123 !== 'object' || !CW1123) return '';
        const record = SC8.read(row, 'spell');
        if(!record) return '';
        const name = norm(SC8.spellName(value(row, '.en-name')));
        const owners = [record.school].concat(record.otherSchools || []);
        return owners.some(function(school){
          const data = schools.indexOf(school) >= 0 ? CW1123.forSchool(school) : null;
          return !!data && Array.isArray(data.given) && data.given.some(function(g){ return norm(SC8.spellName(g)) === name; });
        }) ? 'given' : '';
      }
      const hit = TECH.exec(value(row, '.en-desc'));
      if(!hit || schools.indexOf(hit[3]) < 0) return '';
      const cost = row.querySelector('.en-cost');
      if(cost && String(cost.value).trim() !== '' && Number(cost.value) !== 0) return '';
      if(hit[1]) return 'advanced';
      if(typeof pathAtRank === 'function' && hit[3] === ((document.getElementById('f_school') || {}).value || '').trim()){
        const path = pathAtRank(Number(hit[2]));
        if(path && norm(path.tech) === norm(value(row, '.en-name'))) return 'path';
      }
      return 'school';
    };
    // Mark every card, tag the Techniques, then lay out the fallback where a name would not fit.
    api.sweep = function(){
      api.queued = false;
      const list = document.getElementById('techList');
      if(!list || !document.body.classList.contains('ax15-on')) return 0;
      const schools = api.schools();
      let changed = 0;
      Array.from(list.children).forEach(function(row){
        if(!row.classList.contains('entry')) return;
        const kind = api.kind(row, schools);
        const top = row.querySelector(':scope > .entry-top');
        let tag = top ? top.querySelector(':scope > .ax15-tag') : null;
        if(row.classList.contains('ax15-auto') !== !!kind){ row.classList.toggle('ax15-auto', !!kind); changed++; }
        if((row.dataset.ax15 || '') !== kind){ if(kind) row.dataset.ax15 = kind; else delete row.dataset.ax15; changed++; }
        const label = api.LABELS[kind] || '';
        if(!label || !top){
          if(tag){ tag.remove(); changed++; }
          if(row.classList.contains('ax15-wrap')){ row.classList.remove('ax15-wrap'); changed++; }
          return;
        }
        if(!tag){ tag = document.createElement('span'); tag.className = 'ax15-tag'; top.appendChild(tag); changed++; }
        if(tag.textContent !== label){ tag.textContent = label; changed++; }
      });
      api.fit();
      return changed;
    };
    // The fallback: a card's tag starts the next line when its name would be cut beside it. Measured on one line.
    api.fit = function(){
      document.querySelectorAll('#techList > .entry.ax15-auto:not([data-spell-element])').forEach(function(row){
        const name = row.querySelector(':scope > .entry-top > .en-name');
        if(!name) return;
        row.classList.remove('ax15-wrap');
        if(name.clientWidth > 0 && name.scrollWidth > name.clientWidth + 1) row.classList.add('ax15-wrap');
      });
    };
    api.queue = function(){
      if(api.queued) return;
      api.queued = true;
      (window.requestAnimationFrame || setTimeout)(api.sweep);
    };
    api.install = function(){
      if(api.installed || !AUTOMATIC_ENTRY_CONTROLS_ENABLED) return false;
      const list = document.getElementById('techList');
      if(!list) return false;
      api.installed = true;
      document.body.classList.add('ax15-on');
      if(typeof recalcAll === 'function'){
        const ax15Recalc = recalcAll;
        recalcAll = function(){ const out = ax15Recalc.apply(this, arguments); api.queue(); return out; };
      }
      if(typeof MutationObserver === 'function'){
        // Cards added or removed, a School record written on a card, and the mode or other body classes changing.
        new MutationObserver(api.queue).observe(list, {childList: true, subtree: true, attributes: true, attributeFilter: ['data-sc8-grant']});
        new MutationObserver(api.queue).observe(document.body, {attributes: true, attributeFilter: ['class']});
      }
      // A name edited, the window resized, or the list given its width (a page laid out after it was hidden).
      list.addEventListener('input', api.queue);
      window.addEventListener('resize', api.queue);
      if(typeof ResizeObserver === 'function') new ResizeObserver(api.queue).observe(list);
      api.sweep();
      return true;
    };
    return api;
  })();
  AX15.install();
  // ============ END PART H PHASE 15.1.30 ============
