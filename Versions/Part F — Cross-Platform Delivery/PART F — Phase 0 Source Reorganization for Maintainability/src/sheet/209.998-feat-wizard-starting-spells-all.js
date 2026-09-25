  // ============ PART K PHASE 11.2.4 — WIZARD: STARTING SPELLS FOR EVERY SCHOOL ============
  // Every other Shugenja School's own "Spells:" line, as the owner quoted each from the books on 25
  // September, added to Phase 11.2.3's allotments by property (11.2.3's own table keeps Kitsu).
  // Most lines are Element counts, which 11.2.3 already handles. Three are not:
  //   - Isawa: 3 spells of any one Element, 2 of another, 1 of a third, 1 of a fourth.
  //   - Chuda (Spider): 3 Maho spells of one Element, 2 Maho spells of a second Element that is not
  //     the chosen Deficiency, and any 1 spell of an Element that is not the Deficiency.
  //   - Yogo Wardmaster: 3 Ward spells and 3 other spells, not Void.
  // For those, the spells a character has learned are matched to the boxes in whichever way fills
  // the most, so a count never depends on the order the spells were chosen in. The one picker
  // offers exactly the spells that would fill a box and that the sheet itself lets this character
  // learn (the Technique picker's own rule: spellEligibility(), which Maho is exempt from).
  // Fuzake's "2 Water spells (one is automatically Path to Inner Peace)" is Path to Inner Peace
  // given, plus 1 Water.
  const WIZARD_STARTING_SPELLS_ALL_ENABLED = true;

  // Spells Yogo Wardmasters treat as having the Wards keyword. The book's names, matched to the
  // sheet's: Armor of the Earth = Armor of Earth, Courage of the 7 Thunders = Courage of the Seven
  // Thunders, Globe of Everlasting Sun = Globe of the Everlasting Sun, Wisdom and Clarity = Wisdom &
  // Clarity.
  const YOGO_TREATED_AS_WARDS = [
    'To Seek the Truth', 'By the Light of the Moon', 'Benten\'s Touch', 'Summon Fog',
    'Armor of Earth', 'Courage of the Seven Thunders', 'Force of Will', 'Wholeness of the World',
    'Extinguish', 'Fires of Purity', 'Disrupt the Aura', 'Haze of Battle', 'Globe of the Everlasting Sun',
    'Reversal of Fortunes', 'Rejuvenating Vapors', 'Wisdom & Clarity', 'Near to Ice',
  ];

  const NO_PAGE = 'page not yet recorded';
  const STARTING_SPELLS_EVERY_SCHOOL = {
    'Agasha Shugenja': {source: 'Core Rulebook p.125', given: ['Sense', 'Commune', 'Summon'], choose: [['Fire', 3], ['Earth', 2], ['Air', 1]]},
    'Asahina Shugenja': {source: 'Core Rulebook p.110', given: ['Sense', 'Commune', 'Summon'], choose: [['Air', 3], ['Water', 2], ['Earth', 1]]},
    'Chuda Shugenja': {source: 'Core Rulebook p.213', given: ['Sense', 'Commune', 'Summon'],
      text: 'Sense, Commune, Summon, 3 Maho spells of one Element, 2 Maho spells of a second non-Deficient Element, and any 1 spell of any non-Deficient Element',
      slots: [
        {want: 3, oneElement: true, group: 'maho', maho: 'only', label: 'Maho spells of one Element',
          noun: ['Maho spell of one Element', 'Maho spells of one Element']},
        {want: 2, oneElement: true, group: 'maho', maho: 'only', notDeficient: true, label: 'Maho spells of a second Element, not your Deficiency',
          noun: ['Maho spell of a second Element (not your Deficiency)', 'Maho spells of a second Element (not your Deficiency)']},
        {want: 1, maho: 'either', notDeficient: true, label: 'Any spell, not of your Deficiency',
          noun: ['spell of any Element but your Deficiency', 'spells of any Element but your Deficiency']},
      ]},
    'Chuda Shugenja [Snake]': {source: 'Core Rulebook p.224', given: ['Sense', 'Commune', 'Summon'], choose: [['Earth', 3], ['Fire', 2], ['Water', 1]]},
    'Fuzake Shugenja': {source: 'Secrets of the Empire, ' + NO_PAGE, given: ['Sense', 'Commune', 'Summon', 'Path to Inner Peace'],
      text: 'Sense, Commune, Summon, 3 Earth, 2 Water (one is automatically Path to Inner Peace), 1 Air',
      choose: [['Earth', 3], ['Water', 1], ['Air', 1]]},
    'Horiuchi Shugenja': {source: 'Rulebook ' + NO_PAGE, given: ['Sense', 'Commune', 'Summon'], choose: [['Earth', 3], ['Water', 2], ['Fire', 1]]},
    'Isawa Shugenja': {source: 'Core Rulebook p.124', given: ['Sense', 'Commune', 'Summon'],
      text: 'Sense, Commune, Summon, 3 spells of any one Element, 2 of any other Element, 1 of a third Element and 1 of a fourth',
      slots: [
        {want: 3, oneElement: true, group: 'isawa', label: 'Spells of any one Element', noun: ['spell of one Element', 'spells of one Element']},
        {want: 2, oneElement: true, group: 'isawa', label: 'Spells of another Element', noun: ['spell of another Element', 'spells of another Element']},
        {want: 1, oneElement: true, group: 'isawa', label: 'A spell of a third Element', noun: ['spell of a third Element', 'spells of a third Element']},
        {want: 1, oneElement: true, group: 'isawa', label: 'A spell of a fourth Element', noun: ['spell of a fourth Element', 'spells of a fourth Element']},
      ]},
    'Iuchi Shugenja': {source: 'Core Rulebook p.130', given: ['Sense', 'Commune', 'Summon'], choose: [['Water', 3], ['Earth', 2], ['Air', 1]]},
    'Kitsune Shugenja': {source: 'Core Rulebook p.219', given: ['Sense', 'Commune', 'Summon'], choose: [['Earth', 3], ['Water', 2], ['Fire', 1]]},
    'Komori Shugenja': {source: 'Core Rulebook p.216', given: ['Sense', 'Commune', 'Summon'], choose: [['Air', 3], ['Water', 2], ['Fire', 1]]},
    'Kuni Shugenja': {source: 'Core Rulebook p.107', given: ['Sense', 'Commune', 'Summon'], choose: [['Earth', 3], ['Fire', 2], ['Water', 1]]},
    'Moshi Shugenja': {source: 'Core Rulebook p.120', given: ['Sense', 'Commune', 'Summon'], choose: [['Air', 3], ['Fire', 3]]},
    'Moto Death Priest [Shugenja]': {source: 'Imperial Histories p.240', given: ['Sense', 'Commune', 'Summon'], choose: [['Earth', 3], ['Fire', 2], ['Water', 1]]},
    'Ninube Shugenja': {source: 'Great Clans, ' + NO_PAGE, given: ['Sense', 'Commune', 'Summon'], choose: [['Air', 3], ['Fire', 2], ['Water', 1]]},
    'Seppun Shugenja': {source: 'Core Rulebook p.228', given: ['Sense', 'Commune', 'Summon'], choose: [['Fire', 3], ['Water', 2], ['Air', 1]]},
    'Soshi Shugenja': {source: 'Core Rulebook p.127', given: ['Sense', 'Commune', 'Summon'], choose: [['Air', 3], ['Fire', 2], ['Water', 1]]},
    'Tamori Shugenja': {source: 'Core Rulebook p.113', given: ['Sense', 'Commune', 'Summon'], choose: [['Earth', 3], ['Fire', 2], ['Water', 1]]},
    'Tonbo Shugenja': {source: 'Core Rulebook p.218', given: ['Sense', 'Commune', 'Summon'], choose: [['Water', 3], ['Air', 2], ['Earth', 1]]},
    'Yogo Wardmaster [Shugenja]': {source: 'Rulebook ' + NO_PAGE, given: ['Commune', 'Summon'],
      text: 'Commune, Summon, 3 Ward spells, 3 other spells that are not Void spells',
      slots: [
        {want: 3, ward: true, label: 'Ward spells', noun: ['Ward spell', 'Ward spells']},
        {want: 3, notElements: ['Void'], label: 'Other spells, not Void', noun: ['other spell (not Void)', 'other spells (not Void)']},
      ]},
    'Yoritomo Shugenja': {source: 'Rulebook ' + NO_PAGE, given: ['Sense', 'Commune', 'Summon'], choose: [['Water', 3], ['Fire', 2], ['Air', 1]]},
  };

  const CW1124 = (function(){
    const api = {};
    api.enabled = function(){ return WIZARD_STARTING_SPELLS_ALL_ENABLED; };
    api.table = STARTING_SPELLS_EVERY_SCHOOL;
    api.wards = YOGO_TREATED_AS_WARDS;
    const ELEMENTS = ['Air', 'Earth', 'Fire', 'Water', 'Void'];

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
    function sum(list){ return list.reduce(function(a, b){ return a + b; }, 0); }

    api.isWard = function(s){ return (s.keywords || []).indexOf('Wards') >= 0 || YOGO_TREATED_AS_WARDS.indexOf(s.name) >= 0; };
    api.deficiency = function(){
      const f = document.getElementById('f_schoolDeficiencyElement');
      return f ? String(f.value || '').trim() : '';
    };
    // Whether a spell may fill a box at all, whatever Element the box settles on.
    api.fits = function(slot, s, deficiency){
      if(!s || ELEMENTS.indexOf(s.element) < 0) return false;
      const maho = slot.maho || 'no';
      if(maho === 'only' && !s.maho) return false;
      if(maho === 'no' && s.maho) return false;
      if(slot.ward && !api.isWard(s)) return false;
      if(slot.notElements && slot.notElements.indexOf(s.element) >= 0) return false;
      if(slot.notDeficient && deficiency && s.element === deficiency) return false;
      return true;
    };
    // The most spells these boxes can hold, each box holding at most its count: augmenting paths
    // over the boxes (Kuhn's matching, with a box standing for as many seats as it wants).
    function fill(slots, spells, chosen, deficiency){
      const fit = function(si, k){
        return api.fits(slots[k], spells[si], deficiency) && (!slots[k].oneElement || spells[si].element === chosen[k]);
      };
      const load = slots.map(function(){ return []; });
      function seat(si, seen){
        for(let k = 0; k < slots.length; k++){
          if(seen[k] || !fit(si, k)) continue;
          seen[k] = true;
          if(load[k].length < slots[k].want){ load[k].push(si); return true; }
          for(let j = 0; j < load[k].length; j++){
            if(seat(load[k][j], seen)){ load[k][j] = si; return true; }
          }
        }
        return false;
      }
      spells.forEach(function(s, si){ seat(si, []); });
      return load.map(function(l){ return l.length; });
    }
    // Every way of settling the one-Element boxes on an Element (or none yet), boxes of one group
    // on different Elements; the best is the one that fills the most, then fills the earlier
    // boxes first, then gives earlier boxes the Elements learned first.
    api.bestFit = function(slots, spells, deficiency){
      const first = {};
      spells.forEach(function(s, i){ if(!(s.element in first)) first[s.element] = i; });
      const free = [];
      slots.forEach(function(slot, k){ if(slot.oneElement) free.push(k); });
      const options = free.map(function(k){
        const seen = [''];
        spells.forEach(function(s){ if(api.fits(slots[k], s, deficiency) && seen.indexOf(s.element) < 0) seen.push(s.element); });
        return seen;
      });
      const chosen = slots.map(function(){ return ''; });
      let best = null, bestKey = null;
      function key(have){
        return [sum(have)].concat(have).concat(chosen.map(function(e, k){ return have[k] && e ? -first[e] : -spells.length; }));
      }
      function better(a, b){
        for(let i = 0; i < a.length; i++){ if(a[i] !== b[i]) return a[i] > b[i]; }
        return false;
      }
      (function walk(i){
        if(i === free.length){
          for(let a = 0; a < slots.length; a++){
            for(let b = a + 1; b < slots.length; b++){
              if(chosen[a] && chosen[a] === chosen[b] && slots[a].group && slots[a].group === slots[b].group) return;
            }
          }
          const have = fill(slots, spells, chosen, deficiency);
          const k = key(have);
          if(!best || better(k, bestKey)){ best = {have: have, element: chosen.map(function(e, n){ return have[n] ? e : ''; })}; bestKey = k; }
          return;
        }
        options[i].forEach(function(e){ chosen[free[i]] = e; walk(i + 1); });
      })(0);
      return best;
    };
    api.status = function(data){
      const learned = CW1123.learned();
      const given = data.given.map(norm);
      const missing = data.given.filter(function(n){ return !learned.some(function(l){ return norm(l) === norm(n); }); });
      const spells = learned.filter(function(n){ return given.indexOf(norm(n)) < 0; }).map(spellByName).filter(Boolean);
      const fit = api.bestFit(data.slots, spells, api.deficiency());
      return {missing: missing, quotas: data.slots.map(function(slot, k){
        return {slot: slot, want: slot.want, have: fit.have[k], element: fit.element[k]};
      })};
    };
    function openText(q, left){
      if(q.element) return left + ' ' + q.element + (q.slot.maho === 'only' ? ' Maho' : '') + ' spell' + (left === 1 ? '' : 's');
      return left + ' ' + q.slot.noun[left === 1 ? 0 : 1];
    }
    api.open = function(data){
      const st = api.status(data);
      const out = st.missing.map(function(n){ return n + ' (given by your School)'; });
      st.quotas.forEach(function(q){ const left = q.want - q.have; if(left > 0) out.push(openText(q, left)); });
      return out;
    };
    // The spells that would fill one more box, among those the sheet's own Technique picker lets
    // this character learn now. Spells alike in everything a box asks about are tried once.
    api.helpful = function(data){
      const known = CW1123.learned().map(norm);
      const given = data.given.map(norm);
      const deficiency = api.deficiency();
      const spells = CW1123.learned().filter(function(n){ return given.indexOf(norm(n)) < 0; }).map(spellByName).filter(Boolean);
      const now = sum(api.bestFit(data.slots, spells, deficiency).have);
      const tried = {};
      return SPELL_LIBRARY.map(function(s, i){ return {s: s, i: i}; }).filter(function(x){
        const s = x.s;
        if(ELEMENTS.indexOf(s.element) < 0 || known.indexOf(norm(s.name)) >= 0) return false;
        if(!s.maho && !spellEligibility(s).eligible) return false;
        const k = s.element + '|' + !!s.maho + '|' + api.isWard(s);
        if(!(k in tried)) tried[k] = sum(api.bestFit(data.slots, spells.concat([s]), deficiency).have) > now;
        return tried[k];
      });
    };
    api.renderSlots = function(body, data){
      const before = body.querySelector('h3.cw112-sub');
      const st = api.status(data);
      const ward = data.slots.some(function(s){ return s.ward; });
      st.quotas.forEach(function(q){
        const box = el('div', 'cw1121-slot cw1124-slot');
        box.appendChild(el('p', 'cw1121-slot-label', q.slot.label + ': choose ' + q.want + ' · ' + q.have + ' chosen' + (q.element ? ' (' + q.element + ')' : '')));
        if(q.have >= q.want) box.appendChild(el('p', 'cw112-done', 'Done.'));
        if(CW1122.nudged === 'spells' && q.have < q.want) box.classList.add('cw1122-open-slot');
        body.insertBefore(box, before);
      });
      if(st.quotas.every(function(q){ return q.have >= q.want; })) return;
      const box = el('div', 'cw1121-slot cw1124-pick');
      box.appendChild(el('p', 'cw1121-slot-label', 'Add a spell toward these'));
      const opts = api.helpful(data);
      if(!opts.length){
        box.appendChild(el('p', 'cw112-note', 'No spell the sheet lets you learn now would fill one of these.'));
      } else {
        const form = el('div', 'cw1121-add');
        const sel = el('select', 'cw1121-select');
        sel.id = 'cw1124Pick';
        sel.setAttribute('aria-label', 'Spell');
        sel.appendChild(new Option('— choose a spell —', ''));
        ELEMENTS.forEach(function(e){
          const group = opts.filter(function(x){ return x.s.element === e; });
          if(!group.length) return;
          const og = document.createElement('optgroup');
          og.label = e;
          group.forEach(function(x){
            og.appendChild(new Option(x.s.name + ' (Mastery ' + x.s.mastery + ')' + (x.s.maho ? ' · Maho' : '') + (ward && api.isWard(x.s) ? ' · Ward' : ''), String(x.i)));
          });
          sel.appendChild(og);
        });
        const add = el('button', 'ghost cw1121-add-btn', 'Add');
        add.type = 'button';
        add.id = 'cw1124Add';
        add.disabled = true;
        sel.addEventListener('change', function(){ add.disabled = !sel.value; });
        add.addEventListener('click', function(){ if(sel.value){ CW1122.addSpell(parseInt(sel.value, 10)); CW112.render(); } });
        form.appendChild(sel);
        form.appendChild(add);
        box.appendChild(form);
      }
      body.insertBefore(box, before);
    };
    return api;
  })();

  if(WIZARD_STARTING_SPELLS_ALL_ENABLED && typeof CW1123 === 'object' && CW1123){
    // Into Phase 11.2.3's allotments, by property: its table stays Kitsu's alone.
    const cw1124PreviousForSchool = CW1123.forSchool;
    CW1123.forSchool = function(name){
      return (name && CW1124.table[name]) || cw1124PreviousForSchool.apply(this, arguments);
    };
    const cw1124PreviousDescribe = CW1123.describe;
    CW1123.describe = function(data){
      return data.text || cw1124PreviousDescribe.apply(this, arguments);
    };
    const cw1124PreviousOpen = CW1123.open;
    CW1123.open = function(data){
      return data.slots ? CW1124.open(data) : cw1124PreviousOpen.apply(this, arguments);
    };
    // A line with boxes: 11.2.3 draws the allotment, the given spells and "Your spells" (asked for
    // no Element boxes), and these boxes and their picker go in above "Your spells".
    const cw1124PreviousRender = CW1123.render;
    CW1123.render = function(body, data){
      if(!data.slots) return cw1124PreviousRender.apply(this, arguments);
      cw1124PreviousRender.call(this, body, {source: data.source, given: data.given, text: data.text, choose: []});
      CW1124.renderSlots(body, data);
    };
  }
  // ============ END PART K PHASE 11.2.4 ============
