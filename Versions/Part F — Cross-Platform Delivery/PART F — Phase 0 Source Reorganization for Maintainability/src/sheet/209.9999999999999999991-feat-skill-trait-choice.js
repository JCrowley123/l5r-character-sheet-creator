  // ============ PART H PHASE 15.1.34 — A TRAIT FOR ONE SKILL ROLL ============
  // Phase 15, Release 15a, unit A20 (group G6, new functions), approved by the owner on 19 November 2026 as mocked up,
  // with the book-named Traits listed first: FT-28 (parked 10 October 2026 with the Skill Traits audit), included by Q7.
  // The number 34 is this unit's marker only; the unit keeps its identifier, A20.
  // In the roll preview of a roll made from a Skill (trained, or Unskilled from the untrained list; not attacks, Trait
  // or Ring rolls, spells, the dice tray or the Full Defense roll), the Trait line becomes a drop-down showing each Trait
  // with its value. It starts on the Skill's own Trait as the sheet holds it (for Ninjutsu's "Agility or Reflexes" and
  // Sailing's "Agility or Intelligence", the first, which the sheet rolls). Listed first: the Traits the books name
  // for that Skill, with their pages; then every other Trait (the GM names the Skill and Trait pair: Core p.79). Void is
  // listed only for Iaijutsu (Focus: Core p.87). A choice changes the dice ((Trait + Skill Rank) keep Trait; Unskilled:
  // Trait keep Trait, 10s still do not explode) and anything the sheet adds that depends on the Trait; the Skill Rank,
  // the Emphasis re-roll, the Unskilled rule, Void offers, declarations and every other modifier stay, and what is
  // already ticked stays ticked, since the preview redraws in place. A Trait that is not the usual one is outlined, with
  // "This roll only; Intimidation is usually Awareness." and, for a book-named Trait, its page. Each opening starts on
  // the usual Trait; Cancel forgets the choice. Nothing is saved, and no XP is worked out.
  // Three owned hook blocks carry it: the preview's pool comes from its request (top of its render), the control is
  // drawn after each render (after the preview's markup is written), and the roll uses the chosen pool (right after
  // the preview gate in the roll pipeline), as Features 4.5.10, 4.5.11, 4.5.15 and 4.5.26 placed theirs.
  const SKILL_TRAIT_CHOICE_ENABLED = true;

  const TC15 = (function(){
    const api = {installed: false};
    const TRAITS = ['Stamina', 'Willpower', 'Reflexes', 'Awareness', 'Strength', 'Perception', 'Agility', 'Intelligence'];
    // The Traits the books name for a Skill, in our own words (Skill Traits audit of 10 October 2026, pages re-read
    // 19 November 2026). Keyed by the Skill's name before any colon ("Perform: Biwa" is Perform).
    const EARTH = 'Book of Earth p.8: Stamina or Willpower suits some uses; the GM may call for it.';
    const BOOK = {
      'athletics': [{trait: 'Agility', where: 'Core p.139', note: 'Core p.139: Athletics uses Agility for throwing.'},
        {trait: 'Stamina', where: 'Book of Earth p.8', note: 'Book of Earth p.8: the GM may call for Stamina, for endurance.'}],
      'meditation': [{trait: 'Stamina', where: 'Core p.137', note: 'Core p.137: Meditation uses Stamina for fasting.'}],
      'etiquette': [{trait: 'Willpower', where: 'Core p.145; Book of Earth p.8',
        note: 'Core p.145: Etiquette (Courtesy) uses Willpower to resist Intimidation or Temptation.'}],
      'iaijutsu': [{trait: 'Awareness', where: 'Core p.87', note: 'Core p.87: Iaijutsu uses Awareness for a duel’s Assessment.'},
        {trait: 'Void', where: 'Core p.87', note: 'Core p.87: Iaijutsu uses Void for a duel’s Focus.'}],
      'intimidation': [{trait: 'Willpower', where: 'Book of Earth pp.8–9; Control: Core pp.121, 229',
        note: 'Book of Earth p.9: the GM may allow Willpower for Intimidation.'}],
      'investigation': [{trait: 'Intelligence', where: 'Core p.114', note: 'Core p.114: Investigation uses Intelligence for interrogation.'}],
      'jiujutsu': [{trait: 'Strength', where: 'Core p.88', note: 'Core p.88: Jiujutsu uses Strength for a grapple.'}],
      'animal handling': [{trait: 'Willpower', where: 'Book of Earth p.8', note: 'Book of Earth p.8: the GM may call for Willpower to train an animal.'}],
      'artisan': [{trait: 'Stamina', where: 'Book of Earth p.8', note: EARTH}],
      'craft': [{trait: 'Stamina', where: 'Book of Earth p.8', note: EARTH}],
      'perform': [{trait: 'Stamina', where: 'Book of Earth p.9', note: 'Book of Earth p.9: the GM may call for Stamina in a long performance.'}],
      'stealth': [{trait: 'Stamina', where: 'Book of Earth p.9', note: 'Book of Earth p.9: the GM may call for Stamina to stay still and hidden.'}],
      'ninjutsu': [{trait: 'Reflexes', where: 'Core p.142', note: 'Core p.142: Ninjutsu uses Agility or Reflexes.'}],
      'sailing': [{trait: 'Intelligence', where: 'Core p.144', note: 'Core p.144: Sailing uses Agility or Intelligence.'}]
    };
    const chosen = new WeakMap();   // a roll's context → {rolled, kept} once a Trait other than the usual is chosen
    const opened = new WeakMap();   // a preview request → {trait, value, rolled, kept} as it opened
    api.enabled = function(){ return SKILL_TRAIT_CHOICE_ENABLED === true && typeof ROLL_KINDS === 'object' && !!ROLL_KINDS; };
    const base = function(name){ return String(name || '').split(':')[0].trim().toLowerCase(); };
    // The Trait the sheet rolls for a Trait name: the first of "Agility or Reflexes", as the sheet's own reading does.
    api.first = function(name){ return String(name || '').split(/\s+or\s+/i)[0].trim(); };
    api.applies = function(context){
      return api.enabled() && !!context && context.kind === ROLL_KINDS.SKILL && !!context.traitName && !context.fullDefenseDeclaration &&
        TRAITS.concat(['Void']).indexOf(api.first(context.traitName)) !== -1;
    };
    api.value = function(trait){
      const v = trait === 'Void'
        ? (typeof getRingValueByName === 'function' ? getRingValueByName('Void') : NaN)
        : (typeof getTraitValueByName === 'function' ? getTraitValueByName(trait) : NaN);
      return Number.isFinite(v) ? v : null;
    };
    api.named = function(skill, usual){
      return (BOOK[base(skill)] || []).filter(function(x){ return x.trait !== api.first(usual); });
    };
    // The pool with another Trait: (Trait + Skill Rank) keep Trait; Unskilled, Trait keep Trait.
    api.pool = function(context, trait){
      const t = api.value(trait), rank = parseInt(context.skillRank, 10) || 0;
      if(t === null) return null;
      return (context.unskilled === true || rank <= 0) ? {rolled: t, kept: t} : {rolled: t + rank, kept: t};
    };
    // The roll pipeline asks, after the preview: the pool to roll, when another Trait was chosen.
    api.chosenPool = function(context){ return context && chosen.has(context) ? chosen.get(context) : null; };

    function choose(req, trait){
      const context = req.context, first = opened.get(req);
      if(!first) return;
      if(trait === first.trait){
        context.traitName = first.trait; context.traitValue = first.value;
        req.baseRolled = first.rolled; req.baseKept = first.kept;
        chosen.delete(context);
        return;
      }
      const pool = api.pool(context, trait);
      if(!pool) return;
      context.traitName = trait; context.traitValue = pool.kept;
      req.baseRolled = pool.rolled; req.baseKept = pool.kept;
      chosen.set(context, pool);
    }

    // UI hook: after the preview's markup is written. The drop-down goes beside the Trait row's label (Phase 4's first
    // base row); the label itself stays as written, saying the Trait and its value, and is only hidden from view and from
    // screen readers (the drop-down says the same), so whatever reads the preview's rows reads them as before.
    api.decorate = function(body, req, render){
      if(!req || !api.applies(req.context) || !body) return false;
      if(!opened.has(req)) opened.set(req, {trait: req.context.traitName, value: req.context.traitValue, rolled: req.baseRolled, kept: req.baseKept});
      const first = opened.get(req), context = req.context, current = context.traitName;
      const row = body.querySelector('.rp-base .rp-baserow');
      const label = row && row.querySelector('.rp-mod-label');
      if(!label) return false;   // no Trait row to put the control in: the preview stays as it is
      const skill = String(context.skillName || 'This Skill').trim();
      const sel = document.createElement('select');
      sel.className = 'tc15-trait';
      sel.id = 'tc15Trait';
      sel.setAttribute('aria-label', 'Trait for this roll');
      const add = function(parent, trait){
        const shown = api.first(trait), v = api.value(shown);
        const o = document.createElement('option');
        o.value = trait;
        o.textContent = shown + (v === null ? '' : ' ' + v);
        parent.appendChild(o);
      };
      const group = function(text){ const g = document.createElement('optgroup'); g.label = text; sel.appendChild(g); return g; };
      add(group('Usual for ' + skill), first.trait);
      const named = api.named(skill, first.trait);
      named.forEach(function(x){ add(group('Named for ' + base(skill).replace(/^./, function(c){ return c.toUpperCase(); }) + ' (' + x.where + ')'), x.trait); });
      const others = group('Other Traits (the GM’s call, Core p.79)');
      TRAITS.filter(function(t){ return t !== api.first(first.trait) && !named.some(function(x){ return x.trait === t; }); })
        .forEach(function(t){ add(others, t); });
      sel.value = current;
      const control = document.createElement('span');
      control.className = 'tc15-control';
      control.appendChild(sel);
      row.insertBefore(control, label);
      row.classList.add('tc15-has-choice');
      label.classList.add('tc15-label');
      label.setAttribute('aria-hidden', 'true');
      if(current !== first.trait){
        row.classList.add('tc15-changed');
        const book = named.find(function(x){ return x.trait === current; });
        const note = document.createElement('div');
        note.className = 'tc15-note';
        note.textContent = 'This roll only; ' + skill + ' is usually ' + api.first(first.trait) + '.' + (book ? ' ' + book.note : '');
        row.parentNode.insertBefore(note, row.nextSibling);
      }
      sel.addEventListener('change', function(){
        choose(req, sel.value);
        render();
        const again = document.getElementById('tc15Trait');
        if(again) again.focus({preventScroll: true});
      });
      return true;
    };
    api.installed = api.enabled();
    return api;
  })();
  // The hook names the preview and the pipeline call, guarded, so either works without the other.
  function tc1534Decorate(body, req, render){
    try { return TC15.decorate(body, req, render); }
    catch(e){ if(window.console && console.warn) console.warn('L5R sheet: Trait choice not shown —', e && e.message); return false; }
  }
  function tc1534Pool(context){ return TC15.enabled() ? TC15.chosenPool(context) : null; }
  // ============ END PART H PHASE 15.1.34 TC15 ============
