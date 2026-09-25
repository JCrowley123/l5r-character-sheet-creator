  // ============ PART K PHASE 11.2.2 — WIZARD: FREE CHOICES, SPELLS AND KIHO ============
  // The creation wizard's third stage: it walks the player through every choice their School
  // leaves to them, so none is forgotten. Built on Phases 11.2 (CW112) and 11.2.1 (CW1121),
  // which it extends from outside, by property; neither file is edited.
  //
  //   - Free Skill choices: every form the School library uses is read ("any one Bugei or High
  //     Skill", "any two Skills", "any 1 Skill (not Low)", "any 3 skills from
  //     Acting/Artisan/Perform", and the two entries whose commas split one choice in three),
  //     one box per Skill granted. "Lore (pick one)" asks for the Lore's subject.
  //   - Spells, for a Shugenja School: each spell is added as its Spell Scroll and then learned,
  //     through the sheet's own Spell Scrolls list and Technique picker.
  //   - Kiho, for a Brotherhood monk School: the sheet's own Kiho options and free-pick count.
  //   - A reminder, never a block: Next on a step with a choice still open first points at it;
  //     pressing Next again leaves it for the sheet. Review lists anything still open.
  //
  // STILL NO NEW RULES. Which category a free choice offers is a presentation choice (the sheet
  // itself never checks a free choice), declared in the README. The sheet does not record how
  // many spells a School starts with, so the Spells step says so rather than guessing.
  const WIZARD_FREE_CHOICES_ENABLED = true;

  const CW1122 = (function(){
    const api = {};
    api.enabled = function(){ return WIZARD_FREE_CHOICES_ENABLED; };
    api.nudged = '';      // the step id whose open choices were last pointed at
    api.specs = {};       // free-choice label -> parsed spec, for groupsForSlot
    api.lore = {};        // "Lore (pick one)" row -> its original emphasis text

    const $ = function(id){ return document.getElementById(id); };
    function el(tag, cls, text){
      const node = document.createElement(tag);
      if(cls) node.className = cls;
      if(text !== undefined) node.textContent = text;
      return node;
    }
    function fire(node, type){ node.dispatchEvent(new Event(type, {bubbles:true})); }
    function lib(){
      const name = CW112.appliedSchool();
      return name && typeof findAnySchoolLibraryEntry === 'function' ? findAnySchoolLibraryEntry(name) : null;
    }
    function xpLine(){
      const p = el('p', 'cw112-xp', 'Experience left: ' + $('f_xpRemain').value + ' · started with ' + $('f_xpTotal').value);
      p.id = 'cw1122Xp';
      return p;
    }
    function overspend(){
      const all = CW112.findings();
      const errs = all ? all.filter(function(f){ return f.severity === 'error' && f.id === 'xp-overspend'; }) : [];
      return errs.length ? errs[0].title : '';
    }

    // ---- Reading a School's free Skill choices ----
    // Two library entries write one choice across commas ("any one High, Bugei, or Merchant
    // Skill"), so a choice that has not yet said "Skill" takes the following pieces with it.
    api.choiceTexts = function(skills){
      const parts = String(skills || '').split(',').map(function(s){ return s.trim(); }).filter(Boolean);
      const out = [];
      for(let i = 0; i < parts.length; i++){
        let text = parts[i];
        if(/\bany\b/i.test(text)){
          while(!/\bskills?\b/i.test(text) && i + 1 < parts.length){ i++; text += ', ' + parts[i]; }
          out.push(text);
        }
      }
      return out;
    };
    const COUNT = {a:1, one:1, two:2, three:3};
    function count(word){ return COUNT[String(word).toLowerCase()] || parseInt(word, 10) || 1; }
    // The sheet's own picker groups each category word stands for.
    const GROUPS = {
      high: ['High'],
      bugei: ['Bugei', 'Weapon', 'Weapon (Low)'],
      weapon: ['Weapon', 'Weapon (Low)'],
      low: ['Low', 'Weapon (Low)'],
      merchant: ['Merchant'],
    };
    api.parseChoice = function(text){
      const t = text.replace(/\s+/g, ' ').trim();
      const spec = {text: t, count: 1, ranks: 1, words: [], not: []};
      const ranks = /^(\w+) ranks? in /i.exec(t);
      if(ranks) spec.ranks = count(ranks[1]);
      const m = /\bany\s+(?:(a|one|two|three|\d+)\s+)?(.*)$/i.exec(t);
      if(!m) return spec;
      if(m[1]) spec.count = count(m[1]);
      let rest = m[2];
      const not = /\((?:not|non-?)\s*([^)]+)\)/i.exec(rest);
      if(not){ spec.not.push(not[1].trim().toLowerCase()); rest = rest.replace(not[0], ''); }
      const from = /\bskills?\s+from\s+(.+)$/i.exec(rest);
      const phrase = from ? from[1] : rest.replace(/\bskills?\b.*$/i, '');
      phrase.split(/,|\bor\b|\//i).map(function(w){ return w.trim(); }).filter(Boolean).forEach(function(w){
        const neg = /^non-?\s*(.+)$/i.exec(w);
        if(neg) spec.not.push(neg[1].toLowerCase());
        else spec.words.push(w.toLowerCase());
      });
      return spec;
    };
    api.groupsForSpec = function(spec){
      const all = CW1121.skillGroups();
      let chosen;
      if(!spec.words.length){
        chosen = all;
      } else {
        chosen = [];
        spec.words.forEach(function(w){
          if(GROUPS[w]){
            all.forEach(function(g){ if(GROUPS[w].indexOf(g.label) >= 0 && chosen.indexOf(g) < 0) chosen.push(g); });
          } else {
            all.forEach(function(g){
              const hit = g.options.filter(function(n){ return n.toLowerCase() === w; });
              if(!hit.length) return;
              const have = chosen.find(function(c){ return c.label === g.label; });
              if(have) hit.forEach(function(n){ if(have.options.indexOf(n) < 0) have.options.push(n); });
              else chosen.push({label: g.label, options: hit});
            });
          }
        });
        if(!chosen.length) chosen = all;
      }
      spec.not.forEach(function(w){
        const drop = GROUPS[w] || [];
        chosen = chosen.filter(function(g){ return drop.indexOf(g.label) < 0; });
      });
      // In the sheet's own order, whatever order the School's text names them in.
      const order = all.map(function(g){ return g.label; });
      return chosen.sort(function(a, b){ return order.indexOf(a.label) - order.indexOf(b.label); });
    };
    // One label per Skill granted, so "any two Skills" is two boxes.
    api.slots = function(){
      const entry = lib();
      if(!entry || typeof entry.skills !== 'string') return [];
      const out = [];
      api.choiceTexts(entry.skills).forEach(function(text){
        const spec = api.parseChoice(text);
        const base = text.charAt(0).toUpperCase() + text.slice(1);
        for(let i = 1; i <= spec.count; i++){
          const label = spec.count > 1 ? base + ' (' + i + ' of ' + spec.count + ')' : base;
          api.specs[label.toLowerCase()] = spec;
          out.push(label);
        }
      });
      return out;
    };
    api.groupsForSlot = function(slot){
      const spec = api.specs[String(slot).toLowerCase()] || api.parseChoice(String(slot));
      return api.groupsForSpec(spec);
    };

    // ---- "Lore (pick one)": Apply School adds a Lore row; the player names its subject ----
    api.loreChoices = function(){
      const entry = lib();
      if(!entry || typeof entry.skills !== 'string') return [];
      return entry.skills.split(',').map(function(s){ return s.trim(); }).filter(function(s){
        return /^lore\s*\((?:pick|choose)\s+one\)$/i.test(s);
      });
    };
    api.loreRow = function(){
      return Array.from($('skillsBody').rows).find(function(tr){
        const n = tr.querySelector('.sk-name').value.trim();
        return /^lore(?::|$)/i.test(n) && tr.querySelector('.sk-school').checked && (n.toLowerCase() === 'lore' || api.lore[n]);
      }) || null;
    };
    api.nameLore = function(subject){
      const tr = api.loreRow();
      if(!tr || !subject) return false;
      const name = tr.querySelector('.sk-name');
      const placeholder = Array.from(tr.querySelectorAll('.emph-container .emph-item-row')).find(function(r){
        const w = r.querySelector('.sk-emph-select, .sk-emph-text');
        return w && /^(?:pick|choose)\s+one$/i.test(w.value.trim());
      });
      const was = placeholder ? placeholder.querySelector('.sk-emph-select, .sk-emph-text').value.trim() : '';
      // Exactly the by-hand steps: rename the row, then remove the placeholder Emphasis.
      name.value = 'Lore: ' + subject;
      fire(name, 'input');
      fire(name, 'change');
      const again = Array.from(tr.querySelectorAll('.emph-container .emph-item-row')).find(function(r){
        const w = r.querySelector('.sk-emph-select, .sk-emph-text');
        return w && /^(?:pick|choose)\s+one$/i.test(w.value.trim());
      });
      if(again) again.querySelector('.emph-item-del').click();
      api.lore[name.value.trim()] = was || 'pick one';
      return true;
    };
    // Back to the name Apply School gave it, so the School's own undo still finds the row.
    api.unnameLore = function(){
      const tr = api.loreRow();
      if(!tr) return;
      const name = tr.querySelector('.sk-name');
      const key = name.value.trim();
      if(key.toLowerCase() === 'lore') return;
      delete api.lore[key];
      name.value = 'Lore';
      fire(name, 'input');
      fire(name, 'change');
    };

    // ---- What is still open, per step ----
    api.openFor = function(id){
      if(id === 'skills'){
        CW1121.pruneSlots();
        const open = CW1121.slots().filter(function(s, i){ return !CW1121.slotRows[i]; });
        if(api.loreChoices().length){
          const tr = api.loreRow();
          if(tr && tr.querySelector('.sk-name').value.trim().toLowerCase() === 'lore') open.push('The subject of your School’s Lore');
        }
        return open;
      }
      if(id === 'spells'){
        return api.learnedSpells().length ? [] : ['Your School’s starting spells'];
      }
      if(id === 'kiho'){
        const ent = typeof kihoEntitlement === 'function' ? kihoEntitlement() : null;
        const left = ent ? ent.freePicksLeft : 0;
        return left > 0 ? [left + ' free Kiho pick' + (left === 1 ? '' : 's')] : [];
      }
      return [];
    };
    api.allOpen = function(){
      const out = [];
      CW112.steps.forEach(function(s){
        api.openFor(s.id).forEach(function(t){ out.push({step: s.title, text: t}); });
      });
      return out;
    };

    // ---- Spells (a Shugenja School) ----
    api.isShugenja = function(){
      const entry = lib();
      return !!(entry && typeof schoolCasterCategory === 'function' && schoolCasterCategory(entry) === 'shugenja');
    };
    api.learnedSpells = function(){
      return Array.from($('techList').querySelectorAll('.entry')).filter(function(div){ return !!div.dataset.spellElement; });
    };
    const SPELL_ORDER = ['Universal', 'Air', 'Earth', 'Fire', 'Water', 'Void'];
    api.spellGroups = function(){
      const known = api.learnedSpells().map(function(d){ return d.querySelector('.en-name').value.trim().toLowerCase(); });
      return SPELL_ORDER.map(function(elName){
        const items = SPELL_LIBRARY.map(function(s, i){ return {s: s, i: i}; }).filter(function(x){
          return x.s.element === elName && !x.s.maho && spellEligibility(x.s).eligible && known.indexOf(x.s.name.toLowerCase()) < 0;
        });
        return {label: elName, items: items};
      }).filter(function(g){ return g.items.length; });
    };
    // The by-hand sequence: the Spell Scrolls list's own + Add, then the Technique picker.
    api.addSpell = function(idx){
      const s = SPELL_LIBRARY[idx];
      if(!s) return false;
      if(!hasSpellScroll(s.name)){
        renderSpellScrollsList('');
        const add = $('spellScrollsList').querySelector('.spell-scroll-add-btn[data-idx="' + idx + '"]');
        if(add) add.click();
      }
      const before = api.learnedSpells().length;
      const quick = $('techQuickAdd');
      if(typeof refreshTechQuickAddOptions === 'function') refreshTechQuickAddOptions();
      quick.value = 'spell:' + idx;
      fire(quick, 'change');
      return api.learnedSpells().length > before;
    };
    api.removeSpell = function(div){
      const name = div.querySelector('.en-name').value.trim();
      div.querySelector('.rm-btn').click();
      const scroll = Array.from($('equipBody').rows).find(function(tr){
        const n = tr.querySelector('.eq-name');
        return n && typeof spellNameFromScrollLabel === 'function' && (spellNameFromScrollLabel(n.value) || '').toLowerCase() === name.toLowerCase();
      });
      if(scroll) scroll.querySelector('.rm-btn').click();
    };
    function pickerWithAdd(id, placeholder, groups, onAdd){
      const form = el('div', 'cw1121-add');
      const sel = el('select', 'cw1121-select');
      sel.id = id + 'Pick';
      sel.setAttribute('aria-label', placeholder);
      sel.appendChild(new Option('— ' + placeholder + ' —', ''));
      groups.forEach(function(g){ sel.appendChild(g); });
      const add = el('button', 'ghost cw1121-add-btn', 'Add');
      add.type = 'button';
      add.id = id + 'Add';
      add.disabled = true;
      sel.addEventListener('change', function(){ add.disabled = !sel.value; });
      add.addEventListener('click', function(){ if(sel.value) onAdd(sel.value); });
      form.appendChild(sel);
      form.appendChild(add);
      return form;
    }
    function entryRow(text, label, onRemove){
      const row = el('div', 'cw1121-entry');
      row.appendChild(el('span', 'cw1121-entry-name', text));
      const rm = el('button', 'ghost cw1121-remove', 'Remove');
      rm.type = 'button';
      rm.setAttribute('aria-label', 'Remove ' + label);
      rm.addEventListener('click', onRemove);
      row.appendChild(rm);
      return row;
    }
    api.openBox = function(body, id){
      if(api.nudged !== id) return;
      const open = api.openFor(id);
      if(!open.length) return;
      const box = el('div', 'cw1122-open');
      box.id = 'cw1122Open';
      box.setAttribute('role', 'alert');
      box.appendChild(el('strong', '', 'Still to choose: '));
      box.appendChild(el('span', '', open.join(' · ') + '. Choose now, or press “Leave for later” to finish on the sheet.'));
      body.insertBefore(box, body.firstChild);
    };
    api.spellsStep = {
      id:'spells', title:'Spells',
      intro:'Choose the spells your School starts with. Each is added to your Equipment as its Spell Scroll and then learned, exactly as on the sheet.',
      render: function(body){
        api.openBox(body, 'spells');
        body.appendChild(el('p', 'cw112-note', 'The sheet does not record how many spells your School starts with, or of which Elements. Your School’s entry in the rulebook lists them.'));
        const groups = api.spellGroups().map(function(g){
          const og = document.createElement('optgroup');
          og.label = g.label;
          g.items.forEach(function(x){ og.appendChild(new Option(x.s.name + ' (' + x.s.element + ' ' + x.s.mastery + ')', String(x.i))); });
          return og;
        });
        body.appendChild(el('h3', 'cw112-sub', 'Add a spell'));
        body.appendChild(pickerWithAdd('cw1122Spell', 'choose a spell', groups, function(v){
          api.addSpell(parseInt(v, 10));
          CW112.render();
        }));
        body.appendChild(el('h3', 'cw112-sub', 'Your spells'));
        const list = el('div', 'cw1121-entries');
        const learned = api.learnedSpells();
        if(!learned.length) list.appendChild(el('p', 'cw112-note', 'None yet.'));
        learned.forEach(function(div){
          const name = div.querySelector('.en-name').value.trim();
          list.appendChild(entryRow(name + ' · scroll in Equipment', name, function(){ api.removeSpell(div); CW112.render(); }));
        });
        body.appendChild(list);
      },
      check: function(){ return ''; },
    };

    // ---- Kiho (a Brotherhood monk School with free picks) ----
    api.hasFreeKiho = function(){
      if(!lib() || typeof kihoEntitlement !== 'function') return false;
      const ent = kihoEntitlement();
      return !!(ent.brotherhood && ent.grantedAllowance > 0);
    };
    api.kihoStep = {
      id:'kiho', title:'Kiho',
      intro:'Your School teaches Kiho. Pick your free ones here; the sheet marks which picks are free and which cost experience.',
      render: function(body){
        api.openBox(body, 'kiho');
        body.appendChild(xpLine());
        if(typeof renderKihoGrantNote === 'function') renderKihoGrantNote();
        const note = $('kihoGrantNote');
        if(note && note.textContent.trim()) body.appendChild(el('p', 'cw112-note', note.textContent.trim()));
        if(typeof refreshTechQuickAddOptions === 'function') refreshTechQuickAddOptions();
        const groups = Array.from($('techQuickAdd').querySelectorAll('optgroup')).filter(function(g){
          return / Kiho$/.test(g.label);
        }).map(function(g){ return g.cloneNode(true); });
        body.appendChild(el('h3', 'cw112-sub', 'Add a Kiho'));
        body.appendChild(pickerWithAdd('cw1122Kiho', 'choose a Kiho', groups, function(v){
          const quick = $('techQuickAdd');
          quick.value = v;
          fire(quick, 'change');
          CW112.render();
        }));
        body.appendChild(el('h3', 'cw112-sub', 'Your Kiho'));
        const list = el('div', 'cw1121-entries');
        const rows = kihoRows();
        if(!rows.length) list.appendChild(el('p', 'cw112-note', 'None yet.'));
        rows.forEach(function(div){
          const name = div.querySelector('.en-name').value.trim();
          const cost = div.querySelector('.en-cost');
          const text = name + (kihoRowIsFree(div) ? ' · free School Kiho' : ' · ' + (cost ? cost.value : '0') + ' XP');
          list.appendChild(entryRow(text, name, function(){ div.querySelector('.rm-btn').click(); recalcAll(); CW112.render(); }));
        });
        body.appendChild(list);
        const over = overspend();
        if(over) body.appendChild(el('p', 'cw112-error', over));
      },
      check: function(){ return overspend(); },
    };

    // ---- The School's Lore, on the Skills step ----
    api.renderLore = function(body){
      if(!api.loreChoices().length) return;
      const tr = api.loreRow();
      if(!tr) return;
      const box = el('div', 'cw1121-slot cw1122-lore');
      box.appendChild(el('p', 'cw1121-slot-label', 'Your School teaches a Lore of your choice'));
      const current = tr.querySelector('.sk-name').value.trim();
      if(current.toLowerCase() !== 'lore'){
        box.appendChild(el('p', 'cw112-done', 'Chosen: ' + current + ' (School Skill)'));
        const undo = el('button', 'ghost cw1121-undo', 'Choose again');
        undo.type = 'button';
        undo.addEventListener('click', function(){ api.unnameLore(); CW112.render(); });
        box.appendChild(undo);
      } else {
        const form = el('div', 'cw1121-add');
        const input = el('input', 'cw112-input cw1121-subject');
        input.type = 'text';
        input.id = 'cw1122LoreSubject';
        input.placeholder = 'Subject, e.g. Theology';
        input.setAttribute('aria-label', 'Lore subject');
        const set = el('button', 'ghost cw1121-add-btn', 'Set');
        set.type = 'button';
        set.id = 'cw1122LoreSet';
        set.disabled = true;
        input.addEventListener('input', function(){ set.disabled = !input.value.trim(); });
        set.addEventListener('click', function(){ api.nameLore(input.value.trim()); CW112.render(); });
        form.appendChild(input);
        form.appendChild(set);
        box.appendChild(form);
      }
      const after = body.querySelectorAll('.cw1121-slot');
      if(after.length) after[after.length - 1].after(box);
      else body.insertBefore(box, body.querySelector('.cw112-sub') || null);
    };

    // ---- Which of the two extra steps this character gets ----
    api.syncSteps = function(){
      const steps = CW112.steps;
      const current = steps[CW112.index];
      const want = [];
      if(api.isShugenja()) want.push(api.spellsStep);
      if(api.hasFreeKiho()) want.push(api.kihoStep);
      [api.spellsStep, api.kihoStep].forEach(function(s){
        const at = steps.indexOf(s);
        if(at >= 0 && want.indexOf(s) < 0) steps.splice(at, 1);
      });
      want.forEach(function(s, i){
        if(steps.indexOf(s) >= 0) return;
        const skillsAt = steps.findIndex(function(x){ return x.id === 'skills'; });
        const prev = i > 0 ? steps.indexOf(want[i - 1]) : skillsAt;
        steps.splice((prev >= 0 ? prev : steps.length - 2) + 1, 0, s);
      });
      const now = steps.indexOf(current);
      CW112.index = now >= 0 ? now : Math.min(CW112.index, steps.length - 1);
    };
    return api;
  })();

  // Hooked into both earlier stages from outside, by property. Without them there is nothing to
  // extend, and this is a silent no-op.
  if(typeof CW112 === 'object' && CW112 && typeof CW1121 === 'object' && CW1121 && WIZARD_FREE_CHOICES_ENABLED){
    // Every free-choice form the School library uses, one box per Skill granted.
    CW1121.slots = CW1122.slots;
    CW1121.groupsForSlot = CW1122.groupsForSlot;

    const cw1122PreviousSkillsRender = CW1121.skillsStep.render;
    CW1121.skillsStep.render = function(body){
      cw1122PreviousSkillsRender.call(this, body);
      CW1122.renderLore(body);
      // 11.2.1's own "N still open" line counts only the Skill boxes; the reminder below covers both.
      body.querySelectorAll('.cw112-note').forEach(function(n){ if(/free choices? still open/.test(n.textContent)) n.remove(); });
      const open = CW1122.openFor('skills');
      if(open.length){
        body.querySelectorAll('.cw1121-slot').forEach(function(box){
          if(box.querySelector('.cw1121-add') && CW1122.nudged === 'skills') box.classList.add('cw1122-open-slot');
        });
        const p = document.createElement('p');
        p.className = 'cw112-note';
        p.textContent = open.length + ' free choice' + (open.length === 1 ? '' : 's') + ' still open.';
        const last = body.querySelectorAll('.cw1121-slot');
        if(last.length) last[last.length - 1].after(p);
      }
      CW1122.openBox(body, 'skills');
    };

    // The extra steps come and go with the School, and the reminder lasts only on its own step.
    const cw1122PreviousRender = CW112.render;
    CW112.render = function(){
      CW1122.syncSteps();
      const step = CW112.steps[CW112.index];
      if(CW1122.nudged && (!step || step.id !== CW1122.nudged)) CW1122.nudged = '';
      return cw1122PreviousRender.apply(this, arguments);
    };
    const cw1122PreviousRefreshNav = CW112.refreshNav;
    CW112.refreshNav = function(){
      const result = cw1122PreviousRefreshNav.apply(this, arguments);
      const step = CW112.steps[CW112.index];
      const next = document.getElementById('cw112Next');
      if(step && next && !next.disabled && CW1122.nudged === step.id && CW1122.openFor(step.id).length){
        next.textContent = 'Leave for later ›';
        document.getElementById('cw112Reason').textContent = 'Some of your School’s choices are still open.';
      }
      return result;
    };
    // First Next with a choice open points at it; the second leaves it for the sheet.
    const cw1122PreviousNext = CW112.next;
    CW112.next = function(){
      const step = CW112.steps[CW112.index];
      if(step && !CW112.busy && !step.check() && CW1122.nudged !== step.id && CW1122.openFor(step.id).length){
        CW1122.nudged = step.id;
        CW112.render();
        if(CW112.view) CW112.view.scrollTop = 0;
        return;
      }
      CW1122.nudged = '';
      return cw1122PreviousNext.apply(this, arguments);
    };

    // Review lists everything still open, whichever step it belongs to.
    const review = CW112.steps.find(function(s){ return s.id === 'review'; });
    if(review){
      const cw1122PreviousReview = review.render;
      review.render = function(body){
        cw1122PreviousReview.call(this, body);
        const open = CW1122.allOpen();
        const box = document.createElement('div');
        box.id = 'cw1122Still';
        if(open.length){
          box.className = 'cw1122-open';
          const strong = document.createElement('strong');
          strong.textContent = 'Still to choose (you can finish these on the sheet):';
          box.appendChild(strong);
          const ul = document.createElement('ul');
          open.forEach(function(o){ const li = document.createElement('li'); li.textContent = o.step + ': ' + o.text; ul.appendChild(li); });
          box.appendChild(ul);
        } else {
          box.className = 'cw112-done';
          box.textContent = 'Every choice your School leaves to you is made.';
        }
        body.insertBefore(box, body.firstChild);
      };
    }

    // A new School: its Lore row goes back to the name Apply School gave it, so the School's own
    // undo finds and removes it; then the new School's choices start fresh.
    const cw1122PreviousApplySchool = CW112.applySchool;
    CW112.applySchool = async function(){
      CW1122.unnameLore();
      CW1122.lore = {};
      return cw1122PreviousApplySchool.apply(this, arguments);
    };
    const cw1122PreviousStart = CW112.start;
    CW112.start = function(){
      CW1122.nudged = '';
      CW1122.lore = {};
      return cw1122PreviousStart.apply(this, arguments);
    };
  }
  // ============ END PART K PHASE 11.2.2 ============
