  // ========= PART I FEATURE 4.5.32: DAMAGE, SESSIONS AND XP =========
  // Nine Advantages and Disadvantages that until now only recorded their cost and text. Rules read
  // from the Core Rulebook on 8 October 2026, in our own words:
  //
  //   DAMAGE (in the damage dice themselves):
  //   Hands of Stone      p.150  +0k1 on unarmed damage rolls
  //   Large               p.151  +1k0 on damage rolls with Large melee weapons
  //   Small               p.162  -1k0 on melee damage rolls; Move: Water counts one lower (a
  //                              reminder); Large and Small cannot both be taken
  //   ONCE PER SESSION (a Use button and a Reset session button on the row):
  //   Great Destiny       p.150  a blow that would kill you leaves you 1 Wound from death instead
  //   Dark Fate           p.158  the same, because your fate is not yet fulfilled
  //   Haunted             p.160  while your ancestor is angry, once a session the GM picks one roll
  //                              to take -1k1 (a tick in the roll preview, used up by the roll)
  //   XP:
  //   Enlightened         p.148  raising the Void Ring costs 2 XP less each time
  //   Obtuse              p.161  High Skills other than Investigation and Medicine cost double XP
  //   Blissful Betrothal  p.146  Gentry, Kharmic Tie (to your spouse), Social Position and Wealthy
  //                              cost 2 less each, never below 1
  //
  // The owner's rulings, 8 October 2026 ("proceed as recommended"): as above. Clan price
  // reductions the books name for these entries stay with Feature 4.5.25 and the player. Obtuse
  // doubles what the Ranks cost; Emphases keep their price. A Kharmic Tie is discounted only when
  // the Betrothal row's "Your Kharmic Tie is to your spouse" switch is on: the sheet cannot tell who
  // the Tie is to. Blissful Betrothal's discount applies while both rows are on the list, as Naishou
  // Citizen's does (Feature 4.5.22).
  //
  // =================================================================================================
  // THE CONTRACTS WITH THE CORE -- read these before changing damage, Wounds or XP.
  // =================================================================================================
  // As in Feature 4.5.29, this release never does the core's arithmetic itself. Each adapter calls
  // the function it wraps FIRST and only adjusts that result:
  //
  //   getWeaponDamageDice(entry, skillRank, opts)   [100-dice-engine.js]
  //       Returns {numDice, keepDice, notation, breakdown, debugExplanation, ...} for one weapon.
  //       -> Hands of Stone, Large and Small add their dice to numDice/keepDice, add one line to the
  //          breakdown, and re-make notation (with the core's formatRollNotation) and
  //          debugExplanation. A damage roll rolls these numbers directly, never through the roll
  //          pipeline (Feature 4.5.12's lesson), which is why the dice are changed here.
  //   computeWoundThresholds(earth)                 [110-modals-trackers.js, via Feature 4.5.29]
  //       Its last number is the most Wounds a character can take. Great Destiny and Dark Fate set
  //       Wounds taken to one less than that, read with Earth exactly as renderWounds() reads it,
  //       so a later change to the Wound calculation (or 4.5.29's entries) is followed.
  //   voidCost(rank, freeFloor)                     [110-modals-trackers.js]
  //       The XP for the Void Ranks above the free floor. Enlightened takes 2 off per Rank bought
  //       (floor read the core's way: 2 when none is given), never below 0.
  //   getPaidEmphCount(tr) then skillCost(rank, emphCount, freeFloor)   [090 / 110]
  //       recalcAll's Skills loop asks the first for a row and then the second for the same row.
  //       Obtuse notes the row in the first; in the second it adds what the core charges for that
  //       row's Ranks alone (skillCost(rank, 0, freeFloor)) once more, so the Ranks cost double.
  //       It only does so when the noted row's Rank is the one being priced; otherwise it adds
  //       nothing.
  //   .en-cost on the Advantage rows                [Phase 4.5's refresh, run by recalcAll]
  //       Blissful Betrothal takes 2 off a target row's cost AFTER every other module has priced it,
  //       remembers the price it started from, and puts that back when the discount stops. Because
  //       the XP totals are summed before the refresh runs, a pass that changes a cost runs the
  //       recalc once more, so the totals agree at once.
  //
  // If an adapter throws, it hands back the core's own result unchanged.
  //
  // Row state (Haunted's switch and use, the two Destinies' use, the Betrothal's spouse switch) is
  // kept in the row's own data-adv-config as {type:'dsx4532', ...}, exactly as Feature 4.5.31 keeps
  // its own; the remembered prices travel in the save as `blissful` on each discounted row.
  //
  // REMOVAL: this file, 59.99995-feat-damage-sessions-xp.css, one seam block and their manifest
  // entries. Every change is a wrapper that keeps the function it replaced, or a registry entry, so
  // deleting this file restores the earlier behaviour exactly. A discounted cost then stays as it
  // is in the box (the player's to change), and a saved setting is kept and flagged by Feature 4.5.3.
  const DAMAGE_SESSIONS_XP_ENABLED = true;

  const DSX4532 = (function(){
    const api = {};
    api.TYPE = 'dsx4532';
    api.PROVIDER = 'damage-sessions-xp';
    api.enabled = function(){ return DAMAGE_SESSIONS_XP_ENABLED; };
    api.rolls = function(){
      return api.enabled() && typeof ADV_CONFIG_ENABLED !== 'undefined' && ADV_CONFIG_ENABLED &&
        typeof ADV_CONFIG_ROLL_EFFECTS_ENABLED !== 'undefined' && ADV_CONFIG_ROLL_EFFECTS_ENABLED;
    };
    api.norm = function(value){
      return String(value || '').trim().replace(/\s+/g, ' ').replace(/[’ʼ`']/g, '\'').toLowerCase();
    };
    api.LIST = {
      'hands of stone':'advList', 'large':'advList', 'small':'disadvList', 'great destiny':'advList',
      'dark fate':'disadvList', 'haunted':'disadvList', 'enlightened':'advList', 'obtuse':'disadvList',
      'blissful betrothal':'advList',
    };
    api.rows = function(name){
      const key = api.norm(name), list = document.getElementById(api.LIST[key] || '');
      if(!list) return [];
      return Array.prototype.filter.call(list.querySelectorAll('.entry'), function(div){
        const n = div.querySelector('.en-name');
        return !!n && api.norm(n.value) === key;
      });
    };
    api.has = function(name){ return api.enabled() && api.rows(name).length > 0; };
    api.owns = function(div){
      const n = div && div.querySelector('.en-name');
      const key = n ? api.norm(n.value) : '';
      return !!key && !!div.parentElement && api.LIST[key] === div.parentElement.id ? key : '';
    };

    // ---------- Row state ----------
    api.STATEFUL = ['great destiny', 'dark fate', 'haunted', 'blissful betrothal'];
    api.state = function(div){
      const c = typeof readAdvConfig === 'function' ? readAdvConfig(div) : null;
      return c && c.type === api.TYPE ? c : {};
    };
    api.setState = function(div, patch){
      if(typeof writeAdvConfig !== 'function') return;
      writeAdvConfig(div, api.TYPE, Object.assign({}, api.state(div), patch));
    };
    api.keep = function(div){
      if(!api.enabled() || !div || !div.dataset || !div.dataset.advConfig) return null;
      if(api.STATEFUL.indexOf(api.owns(div)) === -1) return null;
      return api.state(div).type === api.TYPE ? div.dataset.advConfig : null;
    };
    api.on = function(name, field){
      return api.rows(name).some(function(div){ return api.state(div)[field] === true; });
    };

    // ---------- Large and Small ----------
    api.bothSizes = function(){ return api.has('Large') && api.has('Small'); };
    api.sizeIneligible = function(name){
      const key = api.norm(name);
      if(!api.enabled()) return null;
      if(key === 'large' && api.has('Small')) return 'not with Small';
      if(key === 'small' && api.has('Large')) return 'not with Large';
      return null;
    };

    // ---------- Damage (THE CONTRACT: getWeaponDamageDice) ----------
    api.unarmed = function(entry){ return !!entry && api.norm(entry.skill) === 'jiujutsu'; };
    api.melee = function(entry){ return !!entry && !(typeof isRangedWeapon === 'function' && isRangedWeapon(entry)); };
    api.damageChanges = function(entry){
      const out = [];
      if(!api.enabled() || !entry) return out;
      if(api.has('Hands of Stone') && api.unarmed(entry)) out.push({label:'Hands of Stone', rolled:0, kept:1, note:'unarmed damage'});
      if(!api.bothSizes()){
        if(api.has('Large') && api.melee(entry) && entry.size === 'Large') out.push({label:'Large', rolled:1, kept:0, note:'Large melee weapon'});
        if(api.has('Small') && api.melee(entry)) out.push({label:'Small', rolled:-1, kept:0, note:'melee damage'});
      }
      return out;
    };
    api.adjustDamage = function(dmg, entry){
      try {
        if(!dmg || !Number.isFinite(dmg.numDice) || !Number.isFinite(dmg.keepDice)) return dmg;
        const changes = api.damageChanges(entry);
        if(!changes.length) return dmg;
        let numDice = dmg.numDice, keepDice = dmg.keepDice;
        const lines = [];
        changes.forEach(function(c){
          numDice = Math.max(0, numDice + c.rolled);
          keepDice = Math.max(0, keepDice + c.kept);
          if(keepDice > numDice) keepDice = numDice;   // never keep more dice than are rolled
          lines.push(c.label + ': ' + (c.rolled < 0 || c.kept < 0 ? '−' : '+') + Math.abs(c.rolled) + 'k' + Math.abs(c.kept) +
            ' ' + c.note + ' → ' + numDice + 'k' + keepDice + '.');
        });
        const breakdown = (Array.isArray(dmg.breakdown) ? dmg.breakdown : []).concat(lines);
        return Object.assign({}, dmg, {numDice:numDice, keepDice:keepDice, breakdown:breakdown, dsx4532:lines,
          notation:typeof formatRollNotation === 'function' ? formatRollNotation(numDice, keepDice) : numDice + 'k' + keepDice,
          debugExplanation:breakdown.join(' ')});
      } catch(e){ return dmg; }
    };
    let lastDamage = null;
    api.noteDamage = function(dmg){ lastDamage = dmg; };
    // One line per entry in the damage roll's own result: the pool already holds the dice.
    api.damageNote = function(){
      const lines = lastDamage && lastDamage.dsx4532;
      lastDamage = null;
      const body = document.getElementById('rollModalBody');
      if(!lines || !lines.length || !body) return;
      lines.forEach(function(line){
        const note = document.createElement('div');
        note.className = 'roll-note dsx4532-roll-note';
        note.textContent = line;
        body.appendChild(note);
      });
    };

    // ---------- Great Destiny and Dark Fate (THE CONTRACT: computeWoundThresholds) ----------
    api.woundLimit = function(){
      if(typeof computeWoundThresholds !== 'function') return NaN;
      const earthEl = document.getElementById('ring_earth');
      const earth = parseInt((earthEl && earthEl.value) || '2', 10);
      const t = computeWoundThresholds(earth);
      return Array.isArray(t) && t.length ? t[t.length - 1] : NaN;
    };
    api.DESTINY = {
      'great destiny':{name:'Great Destiny', why:'your destiny is not yet fulfilled'},
      'dark fate':{name:'Dark Fate', why:'your dark fate is not yet fulfilled'},
    };
    api.useDestiny = async function(div, key){
      const d = api.DESTINY[key], taken = document.getElementById('f_woundsTaken');
      if(!d || !taken) return false;
      if(api.state(div).used === true){
        if(typeof appAlert === 'function') appAlert(d.name + ' is already used this session. Reset session to use it again.');
        return false;
      }
      const limit = api.woundLimit();
      if(!Number.isFinite(limit) || limit < 1) return false;
      const target = limit - 1;
      const ok = typeof appConfirm === 'function'
        ? await appConfirm(d.name + ': a blow that would kill you leaves you 1 Wound from death instead, because ' + d.why +
          '. Set Wounds taken to ' + target + ' of ' + limit + '? Once per session.', 'Use ' + d.name)
        : true;
      if(!ok) return false;
      taken.value = target;
      api.setState(div, {used:true});
      if(typeof renderWounds === 'function') renderWounds();
      if(typeof recalcAll === 'function') recalcAll();
      if(typeof setStatus === 'function') setStatus(d.name + ': you are left 1 Wound from death (' + target + ' of ' + limit + ').');
      return true;
    };
    api.resetSession = function(div){
      api.setState(div, {used:false});
      if(typeof recalcAll === 'function') recalcAll();
    };

    // ---------- Haunted ----------
    let hauntedContext = null;   // the roll that used it this session: its reroll keeps the -1k1
    api.hauntedOffered = function(context){
      if(!api.rolls() || !context || !api.has('Haunted') || !api.on('Haunted', 'angry')) return false;
      return !api.on('Haunted', 'used') || context === hauntedContext;
    };
    api.provider = {
      label:'Disadvantages',
      offers:function(context){
        return api.hauntedOffered(context)
          ? [{key:'haunted', label:'Haunted: the GM chose this roll — −1k1', note:'Once a session while your ancestor is angry. Core Rulebook p.160.'}]
          : [];
      },
      modifiers:function(context, keys){
        return (keys || []).indexOf('haunted') !== -1 && api.hauntedOffered(context)
          ? [{label:'Haunted', rolledDelta:-1, keptDelta:-1, note:'Declared: the GM chose this roll for your angry ancestor'}]
          : [];
      },
    };
    // Called after a roll is made: if Haunted's -1k1 reached it, this session's use is spent.
    api.afterRoll = function(context, out){
      if(!out || !Array.isArray(out.mods) || !out.mods.some(function(m){ return m && m.label === 'Haunted'; })) return;
      if(api.on('Haunted', 'used')) return;
      hauntedContext = context;
      api.rows('Haunted').forEach(function(div){ api.setState(div, {used:true}); });
      api.decorate();
    };
    api.resetHaunted = function(div){
      hauntedContext = null;
      api.rows('Haunted').forEach(function(d){ api.setState(d, {used:false}); });
      if(typeof recalcAll === 'function') recalcAll();
    };

    // ---------- Enlightened (THE CONTRACT: voidCost) ----------
    api.voidDiscount = function(core, rank, freeFloor){
      try {
        if(!api.has('Enlightened') || !Number.isFinite(core)) return core;
        const floor = (freeFloor == null || isNaN(freeFloor)) ? 2 : freeFloor;
        const bought = Math.max(0, (rank || 0) - floor);
        return Math.max(0, core - 2 * bought);
      } catch(e){ return core; }
    };

    // ---------- Obtuse (THE CONTRACT: getPaidEmphCount, then skillCost) ----------
    let pricingRow = null;
    api.notePricingRow = function(tr){ pricingRow = tr || null; };
    api.EXEMPT = ['investigation', 'medicine'];
    api.obtuseExtra = function(rank, freeFloor, ranksOnly){
      const tr = pricingRow;
      pricingRow = null;
      try {
        if(!tr || !api.has('Obtuse') || typeof SKILL_LIBRARY === 'undefined') return 0;
        const rankEl = tr.querySelector('.sk-rank'), nameEl = tr.querySelector('.sk-name');
        if(!rankEl || !nameEl || parseInt(rankEl.value || '0', 10) !== rank) return 0;
        const base = api.norm(String(nameEl.value).replace(/\(.*$/, '').split(':')[0]);
        const lib = SKILL_LIBRARY.find(function(s){ return api.norm(s.name) === base; });
        if(!lib || lib.cat !== 'High' || api.EXEMPT.indexOf(base) !== -1) return 0;
        const extra = ranksOnly(rank, 0, freeFloor);
        return Number.isFinite(extra) ? extra : 0;
      } catch(e){ return 0; }
    };

    // ---------- Blissful Betrothal (THE CONTRACT: .en-cost) ----------
    api.TARGETS = ['gentry', 'kharmic tie', 'social position', 'wealthy'];
    api.discounts = function(key){
      if(!api.has('Blissful Betrothal') || api.TARGETS.indexOf(key) === -1) return false;
      return key !== 'kharmic tie' || api.on('Blissful Betrothal', 'spouse');
    };
    api.readPrice = function(div){
      if(!div || !div.dataset.dsx4532) return null;
      try { const r = JSON.parse(div.dataset.dsx4532); return r && r.n ? r : null; } catch(e){ return null; }
    };
    api.changed = false;
    api.price = function(div){
      try {
        const nameEl = div && div.querySelector('.en-name'), costEl = div && div.querySelector('.en-cost');
        if(!nameEl || !costEl) return;
        const key = api.norm(nameEl.value);
        let rec = api.readPrice(div);
        if(!api.enabled() || !div.parentElement || div.parentElement.id !== 'advList' || api.TARGETS.indexOf(key) === -1){
          if(rec) delete div.dataset.dsx4532;
          return;
        }
        if(rec && rec.n !== key) rec = null;   // renamed: a new purchase
        const cur = Number(String(costEl.value).trim());
        if(!Number.isFinite(cur)) return;
        const base = rec && cur === rec.applied ? rec.base : cur;
        const want = api.discounts(key) && base > 0 ? Math.max(1, base - 2) : base;
        if(want !== cur){ costEl.value = want; api.changed = true; }
        if(want !== base) div.dataset.dsx4532 = JSON.stringify({n:key, base:base, applied:want});
        else if(div.dataset.dsx4532) delete div.dataset.dsx4532;
      } catch(e){ /* the cost the other modules set stands */ }
    };

    // ---------- The rows ----------
    api.make = function(tag, cls, text){
      const el = document.createElement(tag);
      if(cls) el.className = cls;
      if(text !== undefined) el.textContent = text;
      return el;
    };
    api.button = function(text, label, run){
      const b = api.make('button', 'ghost dsx4532-btn', text);
      b.type = 'button';
      b.setAttribute('aria-label', label);
      b.addEventListener('click', run);
      return b;
    };
    api.toggle = function(div, field, text, extraClass){
      const wrap = api.make('label', 'dsx4532-switch');
      const input = api.make('input', 'dsx4532-toggle' + (extraClass ? ' ' + extraClass : ''));
      input.type = 'checkbox';
      input.dataset.dsx4532 = field;
      input.checked = api.state(div)[field] === true;
      // Saved on 'input' as well as 'change' (see Feature 4.5.31: a tick fires 'input' first and the
      // list's own listener recalcs on it).
      const save = function(){
        if((api.state(div)[field] === true) === input.checked) return;
        const patch = {}; patch[field] = input.checked;
        api.setState(div, patch);
        if(typeof recalcAll === 'function') recalcAll();
      };
      input.addEventListener('input', save);
      input.addEventListener('change', save);
      wrap.appendChild(input);
      wrap.appendChild(document.createTextNode(text));
      return wrap;
    };
    api.note = function(text){ return api.make('span', 'dsx4532-note', text); };
    api.BOTH = 'Not in effect: Large and Small cannot both be taken.';
    api.want = function(key){
      if(!api.LIST[key]) return null;
      if((key === 'large' || key === 'small') && api.bothSizes()) return {sig:key + '|both'};
      return {sig:key};
    };
    api.build = function(div, key, row){
      const add = function(el){ row.appendChild(el); };
      switch(key){
        case 'hands of stone': add(api.note('Unarmed damage +0k1, in the damage dice.')); break;
        case 'large':
          add(api.note(api.bothSizes() ? api.BOTH : '+1k0 damage with Large melee weapons, in the damage dice.'));
          break;
        case 'small':
          add(api.note(api.bothSizes() ? api.BOTH : '−1k0 on melee damage, in the damage dice. Move: your Water counts one lower.'));
          break;
        case 'great destiny':
        case 'dark fate': {
          const d = api.DESTINY[key];
          add(api.make('span', 'dsx4532-state'));
          add(api.button('Use', d.name + ': a killing blow leaves you 1 Wound from death instead', function(){ api.useDestiny(div, key); }));
          add(api.button('Reset session', d.name + ': make it available again for a new session', function(){ api.resetSession(div); }));
          break;
        }
        case 'haunted':
          add(api.toggle(div, 'angry', 'Ancestor angry'));
          add(api.make('span', 'dsx4532-state'));
          add(api.button('Reset session', 'Haunted: a new session, the GM may choose a roll again', function(){ api.resetHaunted(div); }));
          break;
        case 'enlightened': add(api.note('Your Void Ring costs 2 XP less per Rank.')); break;
        case 'obtuse': add(api.note('High Skills other than Investigation and Medicine cost double XP for their Ranks.')); break;
        case 'blissful betrothal':
          add(api.toggle(div, 'spouse', 'Your Kharmic Tie is to your spouse', 'dsx4532-spouse'));
          add(api.note('Gentry, Social Position and Wealthy (and that Kharmic Tie) cost 2 less each, never below 1.'));
          break;
      }
    };
    api.stateText = function(div, key){
      if(key === 'haunted'){
        if(!api.on('Haunted', 'angry')) return 'Ancestor content: no roll is taken.';
        return api.state(div).used === true ? 'Used this session.' : 'The GM may choose one roll this session (−1k1).';
      }
      return api.state(div).used === true ? 'Used this session.' : 'Available this session.';
    };
    api.decorateRow = function(div){
      const key = api.owns(div);
      const want = key ? api.want(key) : null;
      let row = div.querySelector('.dsx4532-row');
      if(!want){ if(row) row.remove(); return; }
      if(!row || row.dataset.dsx4532 !== want.sig){
        if(!row){
          row = api.make('div', 'dsx4532-row');
          const top = div.querySelector('.entry-top');
          if(top && top.nextSibling) div.insertBefore(row, top.nextSibling); else div.appendChild(row);
        }
        row.dataset.dsx4532 = want.sig;
        row.textContent = '';
        api.build(div, key, row);
      }
      row.querySelectorAll('.dsx4532-toggle').forEach(function(t){ t.checked = api.state(div)[t.dataset.dsx4532] === true; });
      const state = row.querySelector('.dsx4532-state');
      if(state){
        const text = api.stateText(div, key);
        if(state.textContent !== text) state.textContent = text;
        const use = Array.prototype.find.call(row.querySelectorAll('.dsx4532-btn'), function(b){ return b.textContent === 'Use'; });
        if(use) use.disabled = api.state(div).used === true;
      }
    };
    api.decorate = function(){
      if(!api.enabled()) return;
      document.querySelectorAll('#advList .entry, #disadvList .entry').forEach(api.decorateRow);
    };
    return api;
  })();

  if(DSX4532.enabled()){
    // Damage: Hands of Stone, Large and Small in the dice (THE CONTRACT: getWeaponDamageDice).
    if(typeof getWeaponDamageDice === 'function'){
      const dsx4532PreviousDamage = getWeaponDamageDice;
      getWeaponDamageDice = function(entry){
        const dmg = DSX4532.adjustDamage(dsx4532PreviousDamage.apply(this, arguments), entry);
        DSX4532.noteDamage(dmg);
        return dmg;
      };
    }
    if(typeof rollWeaponDamage === 'function'){
      const dsx4532PreviousRollDamage = rollWeaponDamage;
      rollWeaponDamage = function(){
        const result = dsx4532PreviousRollDamage.apply(this, arguments);
        DSX4532.damageNote();
        return result;
      };
    }
    // Large and Small grey each other out in the Advantage pickers (Feature 4.5.5's standard).
    if(typeof R455 === 'object' && R455 && typeof R455.ineligible === 'function'){
      const dsx4532PreviousIneligible = R455.ineligible;
      R455.ineligible = function(name){
        const block = R455.enabled() ? DSX4532.sizeIneligible(name) : null;
        return block || dsx4532PreviousIneligible.apply(this, arguments);
      };
    }
    // Haunted: a tick through the declaration registry (Feature 4.5.15), spent by the roll it reaches.
    if(typeof RD4515 === 'object' && RD4515) RD4515.register(DSX4532.PROVIDER, DSX4532.provider);
    if(typeof rollWithModifiers === 'function'){
      const dsx4532PreviousRoll = rollWithModifiers;
      rollWithModifiers = async function(title, context){
        const out = await dsx4532PreviousRoll.apply(this, arguments);
        try { DSX4532.afterRoll(context, out); } catch(e){ /* a roll is never undone by this */ }
        return out;
      };
    }
    // XP (THE CONTRACTS: voidCost; getPaidEmphCount then skillCost).
    if(typeof voidCost === 'function'){
      const dsx4532PreviousVoidCost = voidCost;
      voidCost = function(rank, freeFloor){
        return DSX4532.voidDiscount(dsx4532PreviousVoidCost.apply(this, arguments), rank, freeFloor);
      };
    }
    if(typeof getPaidEmphCount === 'function' && typeof skillCost === 'function'){
      const dsx4532PreviousEmph = getPaidEmphCount;
      getPaidEmphCount = function(tr){
        DSX4532.notePricingRow(tr);
        return dsx4532PreviousEmph.apply(this, arguments);
      };
      const dsx4532PreviousSkillCost = skillCost;
      skillCost = function(rank, emphCount, freeFloor){
        const core = dsx4532PreviousSkillCost.apply(this, arguments);
        const self = this;
        return core + DSX4532.obtuseExtra(rank, freeFloor, function(){ return dsx4532PreviousSkillCost.apply(self, arguments); });
      };
    }
    // Row settings survive Phase 4.5's repaint; Blissful Betrothal prices last of all.
    if(typeof refreshAdvConfigControl === 'function'){
      const dsx4532PreviousControl = refreshAdvConfigControl;
      refreshAdvConfigControl = function(div){
        const kept = DSX4532.keep(div);
        const result = dsx4532PreviousControl.apply(this, arguments);
        if(kept && div && div.dataset && !div.dataset.advConfig) div.dataset.advConfig = kept;
        DSX4532.price(div);
        return result;
      };
    }
    if(typeof R453 === 'object' && R453 && typeof R453.isUnknownConfigType === 'function'){
      const dsx4532PreviousUnknown = R453.isUnknownConfigType;
      R453.isUnknownConfigType = function(type){
        return type === DSX4532.TYPE ? false : dsx4532PreviousUnknown.apply(this, arguments);
      };
    }
    // The rows follow every recalc; a pass that changed a price is run once more so the XP totals,
    // summed before the refresh, agree at once.
    if(typeof refreshAllAdvConfigControls === 'function'){
      const dsx4532PreviousRefresh = refreshAllAdvConfigControls;
      let dsx4532Again = false;
      refreshAllAdvConfigControls = function(){
        const result = dsx4532PreviousRefresh.apply(this, arguments);
        // Every Advantage row once more, after every module has priced it: this also covers Phase
        // 4.5 being switched off, when the per-row refresh above is never called.
        if(DSX4532.enabled()) document.querySelectorAll('#advList .entry').forEach(DSX4532.price);
        DSX4532.decorate();
        if(DSX4532.changed && !dsx4532Again && typeof recalcAll === 'function'){
          DSX4532.changed = false;
          dsx4532Again = true;
          try { recalcAll(); } finally { dsx4532Again = false; }
        }
        DSX4532.changed = false;
        return result;
      };
    }
    // The remembered prices travel with the save, as Feature 4.5.25's do.
    if(typeof collectData === 'function'){
      const dsx4532PreviousCollect = collectData;
      collectData = function(){
        const data = dsx4532PreviousCollect.apply(this, arguments);
        const arr = data && data.adv;
        if(Array.isArray(arr)){
          document.querySelectorAll('#advList .entry').forEach(function(div, i){
            const rec = DSX4532.readPrice(div);
            if(rec && arr[i]) arr[i].blissful = rec;
          });
        }
        return data;
      };
    }
    if(typeof makeEntry === 'function'){
      const dsx4532PreviousMakeEntry = makeEntry;
      makeEntry = function(data){
        const div = dsx4532PreviousMakeEntry.apply(this, arguments);
        if(div && data && data.blissful && typeof data.blissful === 'object' && data.blissful.n){
          div.dataset.dsx4532 = JSON.stringify(data.blissful);
        }
        return div;
      };
    }
    // The spouse switch is a purchased choice: read-only in Play, like the other row editors.
    if(typeof MODES12 === 'object' && MODES12 && typeof MODES12.register === 'function') MODES12.register('#advList .dsx4532-spouse');
  }
