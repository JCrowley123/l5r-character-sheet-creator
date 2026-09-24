  // ============ PART K PHASE 11.2.1 — WIZARD: SKILLS AND ADVANTAGES ============
  // The creation wizard's second stage: a Skills step and an Advantages & Disadvantages step,
  // inserted before Review. Built on Phase 11.2's wizard (CW112), which it extends from outside:
  // it adds two entries to CW112.steps and wraps three of its methods by property, so 11.2's own
  // file is untouched.
  //
  // THE SAME RULE AS 11.2: NEW SCREENS, NO NEW RULES. A Skill is added by the sheet's own
  // #skillQuickAdd, then its Rank, name and School tick are set through the row's own inputs and
  // their events, exactly as a player does by hand. An Advantage or Disadvantage is added by the
  // sheet's own #advQuickAdd / #disadvQuickAdd, so a configurable one still opens its own
  // choice, and an ineligible one is greyed exactly as the sheet greys it. Every list is read from
  // the sheet's own pickers.
  //
  // A SCHOOL'S FREE CHOICES ("any one Lore Skill") are found by the same test Apply School uses
  // to skip them (a School Skill entry starting "any"). The picker for one is narrowed to the
  // category or Skill it names when that name is one of the sheet's own Skill categories or
  // Skills; otherwise every Skill is offered. That narrowing is a presentation choice, declared
  // here and in the README, not a rule: the sheet itself never checks a free choice.
  const WIZARD_SKILLS_ADV_ENABLED = true;

  const CW1121 = (function(){
    const api = {};
    api.enabled = function(){ return WIZARD_SKILLS_ADV_ENABLED; };
    api.slotRows = {};    // free-choice index -> the Skill row the wizard added for it
    api.slotSchool = '';  // the School those rows were filled for
    api.busy = false;

    const $ = function(id){ return document.getElementById(id); };
    function el(tag, cls, text){
      const node = document.createElement(tag);
      if(cls) node.className = cls;
      if(text !== undefined) node.textContent = text;
      return node;
    }
    function fire(node, type){ node.dispatchEvent(new Event(type, {bubbles:true})); }
    function xpLine(){
      // "left" can exceed the starting total once a Disadvantage gives experience back, so the two
      // numbers are stated separately rather than as "X of Y".
      const p = el('p', 'cw112-xp', 'Experience left: ' + $('f_xpRemain').value + ' · started with ' + $('f_xpTotal').value);
      p.id = 'cw1121Xp';
      return p;
    }
    function overspend(){
      const all = CW112.findings();
      const errs = all ? all.filter(function(f){ return f.severity === 'error' && f.id === 'xp-overspend'; }) : [];
      return errs.length ? errs[0].title : '';
    }

    // ---- The School's free choices ----
    api.slots = function(){
      const name = CW112.appliedSchool();
      const lib = name && typeof findAnySchoolLibraryEntry === 'function' ? findAnySchoolLibraryEntry(name) : null;
      if(!lib || typeof lib.skills !== 'string') return [];
      return lib.skills.split(',').map(function(s){ return s.trim(); }).filter(function(s){ return /^any\b/i.test(s); });
    };
    // The sheet's own Skill picker, as [{label, options:[name]}] groups.
    api.skillGroups = function(){
      return Array.from($('skillQuickAdd').querySelectorAll('optgroup')).map(function(g){
        return {label: g.label, options: Array.from(g.querySelectorAll('option')).map(function(o){ return o.value; })};
      });
    };
    api.groupsForSlot = function(slot){
      const m = /^any\s+(?:one\s+)?(.+?)\s+skills?$/i.exec(slot);
      const all = api.skillGroups();
      if(!m) return all;
      const word = m[1].toLowerCase();
      const byCat = all.filter(function(g){ const l = g.label.toLowerCase(); return l === word || l.indexOf(word + ' ') === 0; });
      if(byCat.length) return byCat;
      const byName = all.map(function(g){
        return {label: g.label, options: g.options.filter(function(n){ return n.toLowerCase() === word; })};
      }).filter(function(g){ return g.options.length; });
      return byName.length ? byName : all;
    };
    function needsSubject(name){
      const lib = typeof findSkill === 'function' ? findSkill(name) : null;
      return !!(lib && /^varies/i.test(lib.emph || ''));
    }
    // Exactly the by-hand sequence: add through the picker, name the subject, Rank 1, tick School.
    api.addSkill = function(name, subject, asSchool){
      const body = $('skillsBody');
      const before = body.rows.length;
      const quick = $('skillQuickAdd');
      quick.value = name;
      fire(quick, 'change');
      if(body.rows.length === before) return null;
      const tr = body.lastElementChild;
      if(subject){
        const n = tr.querySelector('.sk-name');
        n.value = name + ': ' + subject;
        fire(n, 'input');
        fire(n, 'change');
      }
      const rank = tr.querySelector('.sk-rank');
      rank.value = 1;
      fire(rank, 'input');
      fire(rank, 'change');
      if(asSchool){
        const box = tr.querySelector('.sk-school');
        box.checked = true;
        fire(box, 'change');
      }
      return tr;
    };
    api.removeRow = function(tr){
      if(tr && tr.isConnected){ const b = tr.querySelector('.rm-btn'); if(b) b.click(); }
    };
    api.pruneSlots = function(){
      Object.keys(api.slotRows).forEach(function(k){ if(!api.slotRows[k].isConnected) delete api.slotRows[k]; });
    };
    api.stepRank = function(tr, step){
      const rank = tr.querySelector('.sk-rank');
      rank.value = Math.max(0, Math.min(10, parseInt(rank.value || '0', 10) + step));
      fire(rank, 'input');
      fire(rank, 'change');
      CW112.render();
    };

    function skillPicker(groups, id){
      const sel = el('select', 'cw1121-select');
      if(id) sel.id = id;
      sel.appendChild(new Option('— choose a Skill —', ''));
      groups.forEach(function(g){
        const og = document.createElement('optgroup');
        og.label = g.label;
        g.options.forEach(function(n){ og.appendChild(new Option(n, n)); });
        sel.appendChild(og);
      });
      return sel;
    }
    function addForm(groups, idBase, onAdd){
      const form = el('div', 'cw1121-add');
      const sel = skillPicker(groups, idBase + 'Pick');
      sel.setAttribute('aria-label', 'Skill');
      const subject = el('input', 'cw112-input cw1121-subject');
      subject.type = 'text';
      subject.id = idBase + 'Subject';
      subject.placeholder = 'Subject, e.g. History';
      subject.setAttribute('aria-label', 'Subject');
      subject.hidden = true;
      const add = el('button', 'ghost cw1121-add-btn', 'Add');
      add.type = 'button';
      add.id = idBase + 'Add';
      add.disabled = true;
      const refresh = function(){
        subject.hidden = !sel.value || !needsSubject(sel.value);
        add.disabled = !sel.value || (!subject.hidden && !subject.value.trim());
      };
      sel.addEventListener('change', refresh);
      subject.addEventListener('input', refresh);
      add.addEventListener('click', function(){ onAdd(sel.value, subject.hidden ? '' : subject.value.trim()); });
      form.appendChild(sel);
      form.appendChild(subject);
      form.appendChild(add);
      return form;
    }

    api.skillsStep = {
      id:'skills', title:'Skills',
      intro:'Pick your School’s free Skill choices, then spend experience on Skills. The first Rank of a School Skill is free.',
      render: function(body){
        api.pruneSlots();
        body.appendChild(xpLine());
        const slots = api.slots();
        if(slots.length){
          body.appendChild(el('h3', 'cw112-sub', 'Your School’s free choices'));
          slots.forEach(function(slot, i){
            const box = el('div', 'cw1121-slot');
            box.dataset.slot = String(i);
            box.appendChild(el('p', 'cw1121-slot-label', slot.charAt(0).toUpperCase() + slot.slice(1)));
            const filled = api.slotRows[i];
            if(filled){
              const done = el('p', 'cw112-done', 'Chosen: ' + filled.querySelector('.sk-name').value + ' (School Skill, Rank 1 free)');
              box.appendChild(done);
              const undo = el('button', 'ghost cw1121-undo', 'Choose again');
              undo.type = 'button';
              undo.addEventListener('click', function(){ api.removeRow(filled); delete api.slotRows[i]; CW112.render(); });
              box.appendChild(undo);
            } else {
              box.appendChild(addForm(api.groupsForSlot(slot), 'cw1121Slot' + i, function(name, subject){
                const tr = api.addSkill(name, subject, true);
                if(tr){ api.slotRows[i] = tr; api.slotSchool = CW112.appliedSchool(); }
                CW112.render();
              }));
            }
            body.appendChild(box);
          });
          const open = slots.length - Object.keys(api.slotRows).length;
          if(open > 0) body.appendChild(el('p', 'cw112-note', open + ' free choice' + (open === 1 ? '' : 's') + ' still open. You can also choose later on the sheet.'));
        }
        body.appendChild(el('h3', 'cw112-sub', 'Your Skills'));
        const list = el('div', 'cw1121-skills');
        Array.from($('skillsBody').rows).forEach(function(tr){
          const name = tr.querySelector('.sk-name').value.trim();
          if(!name) return;
          const input = tr.querySelector('.sk-rank');
          const value = parseInt(input.value || '0', 10) || 0;
          const floor = Math.max(0, parseInt(input.dataset.free || '0', 10) || 0);
          const row = el('div', 'cw112-trait cw1121-skill');
          row.appendChild(el('span', 'cw112-trait-name', name + (tr.querySelector('.sk-school').checked ? ' · School' : '')));
          const minus = el('button', 'cw112-step', '−');
          minus.type = 'button';
          minus.setAttribute('aria-label', 'Lower ' + name);
          minus.disabled = value <= floor;
          minus.addEventListener('click', function(){ api.stepRank(tr, -1); });
          const plus = el('button', 'cw112-step', '+');
          plus.type = 'button';
          plus.setAttribute('aria-label', 'Raise ' + name);
          plus.disabled = value >= 10;
          plus.addEventListener('click', function(){ api.stepRank(tr, 1); });
          row.appendChild(minus);
          row.appendChild(el('span', 'cw112-trait-val', String(value)));
          row.appendChild(plus);
          list.appendChild(row);
        });
        body.appendChild(list);
        body.appendChild(el('h3', 'cw112-sub', 'Add a Skill'));
        body.appendChild(addForm(api.skillGroups(), 'cw1121Extra', function(name, subject){
          api.addSkill(name, subject, false);
          CW112.render();
        }));
        const over = overspend();
        if(over) body.appendChild(el('p', 'cw112-error', over));
      },
      check: function(){ return overspend(); },
    };

    // ---- Advantages & Disadvantages ----
    api.addEntry = async function(selectId, name){
      const sel = $(selectId);
      sel.value = name;
      api.busy = true;
      CW112.refreshNav();
      try {
        fire(sel, 'change');
        await new Promise(function(resolve){
          const started = Date.now();
          (function wait(){
            const asking = Array.from(document.querySelectorAll('.roll-modal-overlay')).some(function(o){ return o.style.display === 'flex'; });
            if(!asking && Date.now() - started > 150) return resolve();
            setTimeout(wait, 60);
          })();
        });
      } finally {
        api.busy = false;
      }
      CW112.render();
    };
    function mirror(selectId, id){
      const src = $(selectId);
      const sel = el('select', 'cw1121-select');
      sel.id = id;
      Array.from(src.children).forEach(function(child){ sel.appendChild(child.cloneNode(true)); });
      sel.value = '';
      sel.addEventListener('change', function(){ if(sel.value) api.addEntry(selectId, sel.value); });
      return sel;
    }
    function entryList(listId, label, verb){
      const wrap = el('div', 'cw1121-entries');
      const rows = Array.from($(listId).querySelectorAll('.entry'));
      if(!rows.length){ wrap.appendChild(el('p', 'cw112-note', 'None yet.')); return wrap; }
      rows.forEach(function(div){
        const row = el('div', 'cw1121-entry');
        const name = div.querySelector('.en-name').value;
        const cost = div.querySelector('.en-cost');
        row.appendChild(el('span', 'cw1121-entry-name', name + (cost ? ' · ' + verb + ' ' + cost.value + ' XP' : '')));
        const rm = el('button', 'ghost cw1121-remove', 'Remove');
        rm.type = 'button';
        rm.setAttribute('aria-label', 'Remove ' + label + ' ' + name);
        rm.addEventListener('click', function(){ div.querySelector('.rm-btn').click(); CW112.render(); });
        row.appendChild(rm);
        wrap.appendChild(row);
      });
      return wrap;
    }
    api.advStep = {
      id:'advantages', title:'Advantages & Disadvantages',
      intro:'Optional. Advantages cost experience and Disadvantages give it back. Some ask a question of their own when chosen.',
      render: function(body){
        body.appendChild(xpLine());
        body.appendChild(el('h3', 'cw112-sub', 'Advantages'));
        body.appendChild(mirror('advQuickAdd', 'cw1121AdvPick'));
        body.appendChild(entryList('advList', 'Advantage', 'costs'));
        body.appendChild(el('h3', 'cw112-sub', 'Disadvantages'));
        body.appendChild(mirror('disadvQuickAdd', 'cw1121DisadvPick'));
        body.appendChild(entryList('disadvList', 'Disadvantage', 'gives'));
        const over = overspend();
        if(over) body.appendChild(el('p', 'cw112-error', over));
      },
      check: function(){ return api.busy ? 'Waiting for its own question…' : overspend(); },
    };
    return api;
  })();

  // Hooked into the wizard from outside, by property. Without Phase 11.2 there is nothing to extend.
  if(typeof CW112 === 'object' && CW112 && WIZARD_SKILLS_ADV_ENABLED){
    const reviewAt = CW112.steps.findIndex(function(s){ return s.id === 'review'; });
    CW112.steps.splice(reviewAt < 0 ? CW112.steps.length : reviewAt, 0, CW1121.skillsStep, CW1121.advStep);
    const review = CW112.steps.find(function(s){ return s.id === 'review'; });
    if(review){
      const cw1121PreviousReview = review.render;
      review.render = function(body){
        cw1121PreviousReview.call(this, body);
        body.querySelectorAll('.cw112-note').forEach(function(n){
          if(/^Skills and Advantages\/Disadvantages are not in the wizard yet/.test(n.textContent)) n.remove();
        });
        const extra = document.createElement('dl');
        extra.className = 'cw112-summary';
        const skills = Array.from(document.getElementById('skillsBody').rows).filter(function(tr){
          return tr.querySelector('.sk-name').value.trim();
        }).map(function(tr){
          return tr.querySelector('.sk-name').value.trim() + ' ' + tr.querySelector('.sk-rank').value;
        });
        const entries = function(id){ return Array.from(document.querySelectorAll('#' + id + ' .entry .en-name')).map(function(n){ return n.value; }); };
        [['Skills', skills.join(' · ')], ['Advantages', entries('advList').join(' · ')], ['Disadvantages', entries('disadvList').join(' · ')]].forEach(function(pair){
          const dt = document.createElement('dt'); dt.textContent = pair[0];
          const dd = document.createElement('dd'); dd.textContent = pair[1] || '—';
          extra.appendChild(dt); extra.appendChild(dd);
        });
        const first = body.querySelector('.cw112-summary');
        if(first) first.after(extra); else body.appendChild(extra);
      };
    }
    // A new School's free choices are not the old School's: the rows filled for it go.
    const cw1121PreviousApplySchool = CW112.applySchool;
    CW112.applySchool = async function(){
      const result = await cw1121PreviousApplySchool.apply(this, arguments);
      if(CW1121.slotSchool && CW112.appliedSchool() !== CW1121.slotSchool){
        Object.keys(CW1121.slotRows).forEach(function(k){ CW1121.removeRow(CW1121.slotRows[k]); });
        CW1121.slotRows = {};
        CW1121.slotSchool = '';
        CW112.render();
      }
      return result;
    };
    const cw1121PreviousStart = CW112.start;
    CW112.start = function(){
      CW1121.slotRows = {};
      CW1121.slotSchool = '';
      return cw1121PreviousStart.apply(this, arguments);
    };
    const cw1121PreviousFinish = CW112.finish;
    CW112.finish = function(){
      const result = cw1121PreviousFinish.apply(this, arguments);
      setStatus('"' + document.getElementById('f_name').value.trim() + '" is ready.');
      return result;
    };
  }
  // ============ END PART K PHASE 11.2.1 ============
