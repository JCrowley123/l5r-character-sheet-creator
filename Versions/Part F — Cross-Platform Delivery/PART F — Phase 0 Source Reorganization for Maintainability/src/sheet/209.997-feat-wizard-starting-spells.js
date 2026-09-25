  // ============ PART K PHASE 11.2.3 — WIZARD: STARTING SPELLS ============
  // A Shugenja School's own "Spells:" line (Core Rulebook, e.g. Kitsu Shugenja p.118: "Sense,
  // Commune, Summon, 3 Water, 2 Air, and 1 Earth"), which the School library never carried.
  //
  //   - The wizard's Spells step (Phase 11.2.2's) shows the allotment: the spells the School gives
  //     are added for the player, and each Element's quota gets its own picker.
  //   - Each picker offers exactly the spells the sheet's own rule lets this character learn:
  //     spellEligibility(), which is effective School Rank for that Element with Affinity and
  //     Deficiency applied. A Deficiency that takes an Element to Rank 0 offers nothing.
  //   - Every spell is added through the sheet's own path: its Spell Scroll into Equipment, then
  //     learned from the Technique picker (11.2.2's CW1122.addSpell).
  //   - Phase 5's validator (Part J) gains one 'info' rule: starting spells not yet all chosen.
  //
  // The table is keyed by School name and holds only lines quoted from the rulebooks; a School
  // with no line keeps 11.2.2's "the sheet does not record" note. Whether starting spells are
  // MEMORISED (no scroll needed, no XP) is an open design question, recorded, not built.
  const WIZARD_STARTING_SPELLS_ENABLED = true;

  const STARTING_SPELLS = {
    'Kitsu Shugenja': {source: 'Core Rulebook p.118', given: ['Sense', 'Commune', 'Summon'],
      choose: [['Water', 3], ['Air', 2], ['Earth', 1]]},
  };

  const CW1123 = (function(){
    const api = {};
    api.enabled = function(){ return WIZARD_STARTING_SPELLS_ENABLED; };
    api.table = STARTING_SPELLS;
    api.givenDone = '';   // the School whose given spells were added, so a removed one stays removed
    api.autoAdded = [];   // the given spells this phase added by itself, and so takes back

    const $ = function(id){ return document.getElementById(id); };
    function el(tag, cls, text){
      const node = document.createElement(tag);
      if(cls) node.className = cls;
      if(text !== undefined) node.textContent = text;
      return node;
    }
    function norm(s){ return String(s || '').trim().toLowerCase(); }
    function spellByName(name){
      return SPELL_LIBRARY.find(function(s){ return norm(s.name) === norm(name); }) || null;
    }

    api.forSchool = function(name){ return (name && api.table[name]) || null; };
    api.current = function(){ return api.forSchool(CW112.appliedSchool()); };
    api.learned = function(){
      return Array.from($('techList').querySelectorAll('.entry')).filter(function(div){ return !!div.dataset.spellElement; })
        .map(function(div){ return div.querySelector('.en-name').value.trim(); });
    };
    // Where the character stands against an allotment: given spells missing, and each Element's
    // quota with how many learned spells of that Element (the given ones aside) fill it.
    api.status = function(data){
      const learned = api.learned();
      const given = data.given.map(norm);
      const missing = data.given.filter(function(n){ return !learned.some(function(l){ return norm(l) === norm(n); }); });
      const byElement = {};
      learned.forEach(function(n){
        if(given.indexOf(norm(n)) >= 0) return;
        const s = spellByName(n);
        if(s && !s.maho) byElement[s.element] = (byElement[s.element] || 0) + 1;
      });
      const quotas = data.choose.map(function(pair){
        return {element: pair[0], want: pair[1], have: Math.min(pair[1], byElement[pair[0]] || 0)};
      });
      return {missing: missing, quotas: quotas};
    };
    api.describe = function(data){
      return data.given.join(', ') + ', ' + data.choose.map(function(p){ return p[1] + ' ' + p[0]; }).join(', ');
    };
    api.open = function(data){
      const st = api.status(data);
      const out = st.missing.map(function(n){ return n + ' (given by your School)'; });
      st.quotas.forEach(function(q){
        const left = q.want - q.have;
        if(left > 0) out.push(left + ' ' + q.element + ' spell' + (left === 1 ? '' : 's'));
      });
      return out;
    };
    // The sheet's own gate, per Element: what this character may learn now, not yet known.
    api.optionsFor = function(element){
      const known = api.learned().map(norm);
      return SPELL_LIBRARY.map(function(s, i){ return {s: s, i: i}; }).filter(function(x){
        return x.s.element === element && !x.s.maho && spellEligibility(x.s).eligible && known.indexOf(norm(x.s.name)) < 0;
      });
    };
    api.addGiven = function(data){
      const school = CW112.appliedSchool();
      if(api.givenDone === school) return;
      api.givenDone = school;
      data.given.forEach(function(n){
        const s = spellByName(n);
        if(s && !api.learned().some(function(l){ return norm(l) === norm(n); }) && CW1122.addSpell(SPELL_LIBRARY.indexOf(s))) api.autoAdded.push(s.name);
      });
    };
    // A new School: the given spells this phase added for the old one go, with their scrolls.
    // Spells the player chose stay, as a School change never removes a player's own choices.
    api.takeBackGiven = function(){
      api.autoAdded.forEach(function(n){
        const div = Array.from($('techList').querySelectorAll('.entry')).find(function(d){
          return d.dataset.spellElement && norm(d.querySelector('.en-name').value) === norm(n);
        });
        if(div) CW1122.removeSpell(div);
      });
      api.autoAdded = [];
      api.givenDone = '';
    };

    api.render = function(body, data){
      CW1122.openBox(body, 'spells');
      const school = CW112.appliedSchool();
      body.appendChild(el('p', 'cw112-note', school + ' starts with ' + api.describe(data) + ' (' + data.source + '). Each is added to your Equipment as its Spell Scroll and learned.'));
      const st = api.status(data);
      const given = el('div', 'cw1121-slot cw1123-given');
      given.appendChild(el('p', 'cw1121-slot-label', 'Given by your School'));
      given.appendChild(el('p', st.missing.length ? 'cw112-note' : 'cw112-done',
        st.missing.length ? 'Not yet learned: ' + st.missing.join(', ') + '. Add it below or on the sheet.' : data.given.join(', ') + '.'));
      if(st.missing.length){
        const add = el('button', 'ghost cw1121-add-btn', 'Add ' + st.missing.join(', '));
        add.type = 'button';
        add.id = 'cw1123AddGiven';
        add.addEventListener('click', function(){
          st.missing.forEach(function(n){ const s = spellByName(n); if(s) CW1122.addSpell(SPELL_LIBRARY.indexOf(s)); });
          CW112.render();
        });
        given.appendChild(add);
      }
      body.appendChild(given);
      st.quotas.forEach(function(q){
        const box = el('div', 'cw1121-slot cw1123-quota');
        box.dataset.element = q.element;
        box.appendChild(el('p', 'cw1121-slot-label', q.element + ': choose ' + q.want + ' · ' + q.have + ' chosen'));
        if(q.have >= q.want){
          box.appendChild(el('p', 'cw112-done', 'Done.'));
        } else {
          const opts = api.optionsFor(q.element);
          if(!opts.length){
            box.appendChild(el('p', 'cw112-note', 'No ' + q.element + ' spell is within your effective School Rank for ' + q.element + ', so the sheet will not let you learn one yet.'));
          } else {
            const form = el('div', 'cw1121-add');
            const sel = el('select', 'cw1121-select');
            sel.id = 'cw1123Pick' + q.element;
            sel.setAttribute('aria-label', q.element + ' spell');
            sel.appendChild(new Option('— choose ' + (/^[AEIOU]/.test(q.element) ? 'an ' : 'a ') + q.element + ' spell —', ''));
            opts.forEach(function(x){ sel.appendChild(new Option(x.s.name + ' (Mastery ' + x.s.mastery + ')', String(x.i))); });
            const add = el('button', 'ghost cw1121-add-btn', 'Add');
            add.type = 'button';
            add.id = 'cw1123Add' + q.element;
            add.disabled = true;
            sel.addEventListener('change', function(){ add.disabled = !sel.value; });
            add.addEventListener('click', function(){ if(sel.value){ CW1122.addSpell(parseInt(sel.value, 10)); CW112.render(); } });
            form.appendChild(sel);
            form.appendChild(add);
            box.appendChild(form);
          }
        }
        if(CW1122.nudged === 'spells' && q.have < q.want) box.classList.add('cw1122-open-slot');
        body.appendChild(box);
      });
      body.appendChild(el('h3', 'cw112-sub', 'Your spells'));
      const list = el('div', 'cw1121-entries');
      const rows = Array.from($('techList').querySelectorAll('.entry')).filter(function(d){ return !!d.dataset.spellElement; });
      if(!rows.length) list.appendChild(el('p', 'cw112-note', 'None yet.'));
      rows.forEach(function(div){
        const name = div.querySelector('.en-name').value.trim();
        const row = el('div', 'cw1121-entry');
        row.appendChild(el('span', 'cw1121-entry-name', name + ' · scroll in Equipment'));
        const rm = el('button', 'ghost cw1121-remove', 'Remove');
        rm.type = 'button';
        rm.setAttribute('aria-label', 'Remove ' + name);
        rm.addEventListener('click', function(){ CW1122.removeSpell(div); CW112.render(); });
        row.appendChild(rm);
        list.appendChild(row);
      });
      body.appendChild(list);
    };

    // Phase 5's rule: an allotment not yet filled. 'info', like its free-Skill-choice note: the
    // count is a lower bound (spells learned later count too), never a claim of a violation.
    api.rule = function(){
      const out = [];
      (typeof getSchoolsList === 'function' ? getSchoolsList() : []).forEach(function(entry){
        const data = api.forSchool(entry && entry.name);
        if(!data) return;
        const open = api.open(data);
        if(open.length){
          out.push(validationFinding('school-starting-spells', 'info',
            entry.name + ': starting spells not all chosen',
            data.source + ' gives ' + api.describe(data) + '. Still to choose: ' + open.join(', ') + '.'));
        }
      });
      return out;
    };
    return api;
  })();

  if(WIZARD_STARTING_SPELLS_ENABLED){
    // Into Phase 5's own registry (Part J), when it is present.
    if(typeof CHARACTER_VALIDATOR_RULES !== 'undefined' && Array.isArray(CHARACTER_VALIDATOR_RULES) && typeof validationFinding === 'function'){
      CHARACTER_VALIDATOR_RULES.push({ id: 'school-starting-spells', fn: CW1123.rule });
    }
    // Into Phase 11.2.2's Spells step, by property. Without it there is no step to extend.
    if(typeof CW1122 === 'object' && CW1122 && CW1122.spellsStep){
      const cw1123PreviousSpellsRender = CW1122.spellsStep.render;
      CW1122.spellsStep.render = function(body){
        const data = CW1123.current();
        if(!data) return cw1123PreviousSpellsRender.call(this, body);
        CW1123.addGiven(data);
        CW1123.render(body, data);
      };
      const cw1123PreviousOpenFor = CW1122.openFor;
      CW1122.openFor = function(id){
        const data = id === 'spells' ? CW1123.current() : null;
        return data ? CW1123.open(data) : cw1123PreviousOpenFor.apply(this, arguments);
      };
      const cw1123PreviousApplySchool = CW112.applySchool;
      CW112.applySchool = async function(name){
        if(CW1123.givenDone && name !== CW1123.givenDone) CW1123.takeBackGiven();
        return cw1123PreviousApplySchool.apply(this, arguments);
      };
      const cw1123PreviousStart = CW112.start;
      CW112.start = function(){
        CW1123.givenDone = '';
        CW1123.autoAdded = [];
        return cw1123PreviousStart.apply(this, arguments);
      };
    }
  }
  // ============ END PART K PHASE 11.2.3 ============
