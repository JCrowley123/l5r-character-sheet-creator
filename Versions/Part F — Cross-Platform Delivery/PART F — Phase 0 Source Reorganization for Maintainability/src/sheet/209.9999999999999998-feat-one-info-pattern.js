  // ============ PART H PHASE 15.1.4 — ONE INFORMATION PATTERN ============
  // Phase 15, Release 15a, finding A04 (owner's ruling Q3, 1 November 2026; mock-ups approved 6 November 2026).
  // The upright circled i that the A01-A16 Advantages already use becomes the one information control in the
  // Skills, Advantages and Disadvantages areas, and on the Void Points card (owner, 6 November):
  // 1. The Skill Info eye (and the Kiho note's ⓘ, the same trunk class) and the Void Points eye are drawn as that
  //    i by the stylesheet (1130-one-info-pattern.css). Each keeps its element, class, id, title and listener;
  //    A03 places the Skill one by its class. Their text is not changed, only hidden, so no row's textContent
  //    moves. Each gets an accessible name ("Calligraphy information"); the eye glyph was the only name before.
  // 2. Phase 4.54 (Part I) appends its i INSIDE any element with an explanatory title=, which put a button inside
  //    the "Choose…" button of an unconfigured row (nested controls; a tap near it was ambiguous). Its decorator
  //    is wrapped by property: after it runs, an i inside a button or link is moved to just after that control, and
  //    named after the entry rather than "Choose…". The same restyle draws it as the circled i. In Play, Phase 12
  //    (Part K) hides a locked control (data-pm12-locked); the stylesheet hides an i moved out of one with it, as it
  //    was hidden inside it before.
  // 3. Seven Fortunes' Curse with Hotei: the rule and the row's two instructions (the Void card's button; where
  //    the sheet spends Void itself) are folded behind the row's i, word for word. The row keeps the choice, its
  //    badge, Change, and one line of what it does: "Techniques and Advantages cost 2 Void Points to activate."
  //    with the price from the entry's cost box. The folded text is hidden, not removed, so it stays in the row's textContent; the line is
  //    drawn from an attribute (CSS attr()), so it adds none.
  // Out of scope here: the Combat tab's ⓘ (.stance-info-btn, .combat-formula-info) and the spells' "?" (Phase 8
  // (Part J)), which explains a refusal rather than offering reference text.
  // With the switch off nothing is set, moved or added and the page is exactly as before.
  const ONE_INFO_PATTERN_ENABLED = true;

  const IP15 = (function(){
    const api = {installed: false, observer: null};
    api.enabled = function(){ return ONE_INFO_PATTERN_ENABLED; };
    // Not <summary>: an i moved after one would sit inside its closed <details> (none is decorated today).
    api.HOSTS = 'button, a[href], [role="button"]';
    const setLabel = function(el, label){ if(el && label && el.getAttribute('aria-label') !== label) el.setAttribute('aria-label', label); };

    // ---- 1. Names for the trunk's eyes ----
    api.skillLabel = function(tr){
      const name = tr.querySelector('.sk-name');
      const value = name ? String(name.value || '').trim() : '';
      return (value || 'Skill') + ' information';
    };
    api.nameSkill = function(tr){ setLabel(tr.querySelector('.sk-name-row > .sk-info-btn'), api.skillLabel(tr)); };
    api.nameAll = function(){
      document.querySelectorAll('#skillsBody > tr').forEach(api.nameSkill);
      setLabel(document.getElementById('voidInfoBtn'), 'Void Points information');
      setLabel(document.getElementById('kihoRulesInfoBtn'), 'Kiho rules information');
    };

    // ---- 2. No information button inside another control ----
    api.entryName = function(el){
      const entry = el.closest && el.closest('.entry');
      const name = entry && entry.querySelector('.en-name');
      return name ? String(name.value || '').trim() : '';
    };
    api.unnest = function(scope){
      if(!scope || !scope.querySelectorAll) return 0;
      let moved = 0;
      scope.querySelectorAll('.adv-config-info').forEach(function(button){
        const host = button.parentElement && button.parentElement.closest(api.HOSTS);
        if(!host || (scope !== host && !scope.contains(host))) return;
        host.after(button);
        const name = api.entryName(host);
        if(name) setLabel(button, 'Explain: ' + name);
        moved++;
      });
      return moved;
    };

    // ---- 3. Hotei's row ----
    api.HOTEI_LINE = 'Techniques and Advantages cost 2 Void Points to activate.';
    api.hoteiRow = function(row){
      if(!row || !row.querySelector) return false;
      const badge = row.querySelector('.fortune4511-badge.fortune4511-eff-voidDouble');
      if(!badge || row.querySelector('.ip15-hotei-info')) return false;
      const summary = row.querySelector('.d45-summary');
      const notes = Array.from(row.querySelectorAll('.hotei4536-note, .ht7-note'));
      if(!summary) return false;
      // The rule is the summary's own title (its text without the price); the instructions are the two notes.
      const rule = String(summary.getAttribute('title') || summary.textContent || '').trim();
      const body = [rule].concat(notes.map(function(n){ return String(n.textContent || '').trim(); })).filter(Boolean).join('\n\n');
      // The price is the entry's own cost box, not the summary's wording (which another layer rewrites).
      const entry = row.closest('.entry');
      const cost = entry && entry.querySelector('.en-cost') ? String(entry.querySelector('.en-cost').value || '').trim() : '';
      [summary].concat(notes).forEach(function(el){ el.classList.add('ip15-folded'); });
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ip15-hotei-info';
      button.setAttribute('aria-label', 'Hotei’s Curse information');
      button.addEventListener('click', function(event){
        event.preventDefault();
        event.stopPropagation();
        if(typeof populateInfoOverlay === 'function') populateInfoOverlay('Hotei’s Curse', 'Seven Fortunes’ Curse', body);
      });
      badge.after(button);
      const line = document.createElement('span');
      line.className = 'ip15-hotei-line';
      line.setAttribute('data-ip15-line', api.HOTEI_LINE + (/^\d+$/.test(cost) ? ' ' + cost + ' XP.' : ''));
      row.appendChild(line);
      return true;
    };
    api.row = function(div){
      if(!api.installed || !div || !div.querySelector) return;
      api.unnest(div);
      const row = div.querySelector('.adv-config-row');
      if(row) api.hoteiRow(row);
    };

    api.install = function(){
      if(api.installed || !ONE_INFO_PATTERN_ENABLED) return false;
      api.installed = true;
      document.body.classList.add('ip15-on');
      // Phase 4.54's decorator, by property: every list pass and the configuration modal's observer call it there.
      if(typeof R454 === 'object' && R454 && typeof R454.decorate === 'function'){
        const ip15Decorate = R454.decorate;
        R454.decorate = function(scope){ const out = ip15Decorate.apply(this, arguments); api.unnest(scope); return out; };
      }
      // Each Advantage/Disadvantage row, after everything earlier has drawn it.
      if(typeof refreshAdvConfigControl === 'function'){
        const ip15Refresh = refreshAdvConfigControl;
        refreshAdvConfigControl = function(div){ const out = ip15Refresh.apply(this, arguments); api.row(div); return out; };
      }
      // Names follow the Skill's name as it is typed, and every recalculation (a load, Apply School).
      const body = document.getElementById('skillsBody');
      if(body){
        body.addEventListener('input', function(e){ const tr = e.target && e.target.closest && e.target.closest('#skillsBody > tr'); if(tr) api.nameSkill(tr); });
        body.addEventListener('change', function(e){ const tr = e.target && e.target.closest && e.target.closest('#skillsBody > tr'); if(tr) api.nameSkill(tr); });
      }
      if(typeof recalcAll === 'function'){
        const ip15Recalc = recalcAll;
        recalcAll = function(){ const out = ip15Recalc.apply(this, arguments); api.nameAll(); return out; };
      }
      api.nameAll();
      document.querySelectorAll('#advList .entry, #disadvList .entry').forEach(api.row);
      return true;
    };
    return api;
  })();
  IP15.install();
  // ============ END PART H PHASE 15.1.4 ============
