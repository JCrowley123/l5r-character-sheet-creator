  // ========= PART I PHASE 4.5: MODAL-CONFIGURED ADVANTAGES / DISADVANTAGES =========
  //
  // Some Advantages and Disadvantages are not one thing -- they are a family of things, and
  // which one you took is a decision the player makes when they buy it. Elemental Blessing is
  // "choose a non-Void Ring"; Lord Moon's Curse is "3, 5 or 7 points" with a different severity
  // at each price. Until this phase the sheet had nowhere to record that decision and no way to
  // act on it: an entry was a name, a number the player typed, and free text.
  //
  // This phase gives those entries a PICK, stored with the character, and makes the pick change
  // the arithmetic the sheet already does.
  //
  // ---------------------------------------------------------------------------------------
  // WHY THE SCHEMA LIVES HERE AND NOT ON ADV_LIBRARY'S ENTRIES
  //
  // The roadmap's Engineering Scope says "add a `config` schema per entry needing one", which
  // reads as a new field on each ADV_LIBRARY/DISADV_LIBRARY row. It is built the other way
  // round -- a name-keyed table in this file -- for one reason: surgical removability.
  //
  // Adding `config:{...}` to seven library rows means seven edited lines inside another phase's
  // (the trunk's) data, each of which a removal has to find and revert precisely. Keeping the
  // table here means ADV_LIBRARY is not touched at all, and deleting this fragment deletes the
  // entire schema with it. The cost is a lookup by name instead of a field read -- and name is
  // already how every other part of the sheet identifies these entries (hasAdvantage(),
  // KIHO_BAN_BY_DISADVANTAGE, the quick-add dropdown all match on the name string), so this
  // introduces no new kind of coupling.
  //
  // ---------------------------------------------------------------------------------------
  // WHAT THIS PHASE DELIBERATELY DOES NOT DO: ROLL MODIFIERS
  //
  // The roadmap's resolver is specified to return "a cost delta and/or a roll-modifier hook",
  // and several configurable entries are roll effects rather than cost effects -- Chosen by the
  // Oracles ("choose a Ring; +1k1 on all Ring Rolls using it") is the clean example.
  //
  // None is wired, and the reason is mechanical rather than a matter of taste. A roll effect
  // belongs in PREROLL_MODIFIER_REGISTRY (130-round-and-pipeline.js), which is the sheet's one
  // documented way to adjust a pool. But Phase 1.5 (Part G) baselined that registry and asserts
  // its exact contents: "registry holds exactly the six documented contributors, in priority
  // order", with `registry.length === 6`. Its own source comment names this phase by number --
  // "later phases (3, 4, 4.5, 6) must not change how these combine". Registering a seventh
  // contributor here would take that suite from 34/34 to 33/34, and the only way to make it
  // pass again is to edit a previous phase's recorded baseline, which CLAUDE.md's working style
  // forbids ("Do not modify previous phases or layers").
  //
  // That is a decision for the project owner, not one to take silently while building something
  // else, so this phase ships the half that needs no such permission: every effect below is a
  // COST effect, landing in the XP tracker the sheet already maintains. The configurable
  // roll-effect entries are listed in this phase's README as a declared follow-up, together
  // with what it would cost to unblock them.
  //
  // The same reasoning applies to 'skillPick'/'traitPick' from the roadmap's named configTypes:
  // the entries that would use them (Great Potential, Doubt) have no cost consequence, so
  // building those types now would add a picker that records a value nothing reads. The two
  // types built here are the two that do something.
  // ---------------------------------------------------------------------------------------

  // One-line kill-switch, per this project's convention for a feature phase. With this false
  // no entry is offered a pick, no stored pick is read, no XP discount is applied, and the
  // sheet behaves exactly as it did before this phase.
  const ADV_CONFIG_ENABLED = true;

  // ---------- The schema ----------
  //
  // Keyed by the entry's name exactly as ADV_LIBRARY/DISADV_LIBRARY spells it. EVERY number and
  // every option below is quoted from the library entry's own `desc` string in
  // 020-lib-skills-advantages.js -- nothing here is recalled from a sourcebook. That is the
  // whole inclusion test, and it is why this table is seven entries rather than thirty: an
  // entry whose own text gives a RANGE rather than named prices ("2-4 points", "roughly 2-6",
  // "8-30") cannot be turned into tiers without inventing the steps in between, which Process
  // Requirement #3 forbids. Those stay as they are -- a free-text cost field the player sets.
  //
  //   type 'ringPick'      -- choose one of the four elemental Rings. Options are read from
  //                           RINGS itself (010-prelude.js), which holds exactly Air/Earth/
  //                           Fire/Water, so "non-Void" needs no list of its own to go stale.
  //   type 'severityTier'  -- choose one named tier; its `cost` becomes the entry's own cost.
  //
  //   effect 'traitXpDiscount' -- each Rank bought in either of the chosen Ring's two Traits
  //                           costs `amount` XP less.
  //   effect 'entryCost'   -- the pick sets what the entry itself costs. No separate resolver
  //                           work: the sheet already totals the cost field.
  const ADV_DISADV_CONFIG_SCHEMA = {
    // "Choose a non-Void Ring; increasing either of its Traits costs 1 XP less. Phoenix pay 3."
    'Elemental Blessing': {
      type: 'ringPick',
      effect: 'traitXpDiscount',
      amount: 1,
      title: 'Choose a Ring',
      prompt: 'Elemental Blessing — choose the blessed Ring',
      note: 'Both of that Ring’s Traits cost 1 XP less per Rank bought.',
    },
    // "3/5/7 points. Gain a bonus Void Point each full moon, but risk losing control for the
    //  night unless you pass a Willpower roll (TN scales with rank)."
    'Lord Moon’s Curse': {
      type: 'severityTier',
      effect: 'entryCost',
      title: 'Choose a severity',
      prompt: 'Lord Moon’s Curse — how severe is it?',
      options: [
        { label: 'Low', cost: 3 },
        { label: 'Medium', cost: 5 },
        { label: 'High', cost: 7 },
      ],
    },
    // "3/6/9 points per rank. That many times per session, reroll any one roll and keep the
    //  better result."
    'Luck': {
      type: 'severityTier',
      effect: 'entryCost',
      title: 'Choose a Rank',
      prompt: 'Luck — how many rerolls per session?',
      options: [
        { label: 'Rank 1', cost: 3 },
        { label: 'Rank 2', cost: 6 },
        { label: 'Rank 3', cost: 9 },
      ],
    },
    // "2/4/6 points per rank. Elemental spells targeting you have their casting TN raised by
    //  +3 per rank (not maho or non-kami magic)."
    'Magic Resistance': {
      type: 'severityTier',
      effect: 'entryCost',
      title: 'Choose a Rank',
      prompt: 'Magic Resistance — how many Ranks?',
      options: [
        { label: 'Rank 1', cost: 2 },
        { label: 'Rank 2', cost: 4 },
        { label: 'Rank 3', cost: 6 },
      ],
    },
    // "2 points for -1k0, 4 points for -1k1, on all Social Skill Rolls. Crab pay 1 more."
    'Antisocial': {
      type: 'severityTier',
      effect: 'entryCost',
      title: 'Choose a severity',
      prompt: 'Antisocial — how bad is the penalty?',
      options: [
        { label: '−1k0', cost: 2 },
        { label: '−1k1', cost: 4 },
      ],
    },
    // "4 or 6 points. Using a chosen Ring, Skill, or tattoo risks temporary GM-controlled
    //  madness unless you pass a Willpower roll (TN 20 or 30)."
    'Enlightened Madness': {
      type: 'severityTier',
      effect: 'entryCost',
      title: 'Choose a severity',
      prompt: 'Enlightened Madness — which Willpower TN?',
      options: [
        { label: 'TN 20', cost: 4 },
        { label: 'TN 30', cost: 6 },
      ],
    },
    // "1 point for a single temple's disapproval, 3 for a major Brotherhood sect; its monks
    //  treat your Glory as Infamy."
    'Cast Out': {
      type: 'severityTier',
      effect: 'entryCost',
      title: 'Choose a scope',
      prompt: 'Cast Out — who has cast you out?',
      options: [
        { label: 'One temple', cost: 1 },
        { label: 'A major Brotherhood sect', cost: 3 },
      ],
    },
  };

  // Entry names are matched loosely on purpose. The library writes Lord Moon's Curse with a
  // curly apostrophe (’); a player who types the name by hand, or whose saved character
  // came from an export that normalised it, will have the straight one. Neither should silently
  // fail to be configurable, and case/whitespace are not meaningful in a name either.
  function normalizeAdvName(name){
    return String(name || '').trim().toLowerCase().replace(/[’ʼ`']/g, '\'');
  }
  const ADV_CONFIG_SCHEMA_BY_NORM_NAME = (function(){
    const map = {};
    Object.keys(ADV_DISADV_CONFIG_SCHEMA).forEach(name=>{
      map[normalizeAdvName(name)] = Object.assign({ name }, ADV_DISADV_CONFIG_SCHEMA[name]);
    });
    return map;
  })();

  // The schema for an entry name, or null if that entry takes no configuration. Also the
  // kill-switch's single choke point: with the phase disabled nothing is ever configurable,
  // so every path below -- badge, button, modal, discount, persistence read -- goes quiet at
  // once rather than each needing its own check.
  function advConfigSchemaFor(name){
    if(!ADV_CONFIG_ENABLED) return null;
    return ADV_CONFIG_SCHEMA_BY_NORM_NAME[normalizeAdvName(name)] || null;
  }

  // The options a ringPick offers. Read from RINGS rather than listed here so "the four
  // elemental Rings" stays one fact in one place; Void is absent from RINGS, which is exactly
  // the "non-Void" restriction Elemental Blessing states.
  function advConfigOptionsFor(schema){
    if(!schema) return [];
    if(schema.type === 'ringPick') return RINGS.map(r=>({ label:r.name, value:r.name, ringKey:r.key }));
    if(schema.type === 'severityTier') return schema.options.map(o=>({ label:o.label, value:o.label, cost:o.cost }));
    return [];
  }

  // ---------- Reading and writing the pick ----------
  //
  // Stored on the entry's own DOM node as JSON in data-adv-config, the same way a spell entry
  // already carries data-spell-element and data-is-memorised. The saved-character shape the
  // roadmap specifies -- {name, cost, desc, config:{type, value}} -- is produced from this by
  // 120-persistence.js, which parses it on the way in and stringifies it on the way out.
  function readAdvConfig(div){
    if(!div || !div.dataset || !div.dataset.advConfig) return null;
    try {
      const parsed = JSON.parse(div.dataset.advConfig);
      if(parsed && typeof parsed === 'object' && parsed.value) return parsed;
    } catch(e){ /* a corrupted value reads as unconfigured, which the badge then flags */ }
    return null;
  }
  function writeAdvConfig(div, type, value){
    div.dataset.advConfig = JSON.stringify({ type, value });
  }

  // ---------- The resolver ----------
  //
  // The roadmap's `AdvDisadvEffect`: given an entry and its picked value, what does it do?
  // Pure -- reads nothing from the DOM, writes nothing -- so a check can drive it directly with
  // a name and a value and never touch a character sheet.
  //
  // Returns null when the entry is not configurable or not yet configured, which is what makes
  // "an unconfigured entry has no effect" true by construction rather than by remembering to
  // check for it at each call site.
  function resolveAdvDisadvEffect(name, config){
    const schema = advConfigSchemaFor(name);
    if(!schema || !config || !config.value) return null;
    if(schema.type === 'ringPick' && schema.effect === 'traitXpDiscount'){
      const ring = RINGS.find(r=>r.name === config.value);
      if(!ring) return null;
      return {
        effect: 'traitXpDiscount',
        ringKey: ring.key,
        ringName: ring.name,
        traitKeys: ring.traits.map(t=>t.key),
        amount: schema.amount,
      };
    }
    if(schema.type === 'severityTier' && schema.effect === 'entryCost'){
      const opt = schema.options.find(o=>o.label === config.value);
      if(!opt) return null;
      return { effect: 'entryCost', cost: opt.cost, label: opt.label };
    }
    return null;
  }

  // ---------- The XP effect ----------
  //
  // Every configured entry currently on the sheet, resolved. Advantages and Disadvantages are
  // both scanned: nothing in the schema is restricted to one list, and a Disadvantage with a
  // cost effect is priced through its own entry cost exactly like an Advantage.
  function activeAdvConfigEffects(){
    if(!ADV_CONFIG_ENABLED) return [];
    const out = [];
    ['advList','disadvList'].forEach(listId=>{
      const list = document.getElementById(listId);
      if(!list) return;
      list.querySelectorAll('.entry').forEach(div=>{
        const nameEl = div.querySelector('.en-name');
        if(!nameEl) return;
        const effect = resolveAdvDisadvEffect(nameEl.value, readAdvConfig(div));
        if(effect) out.push(effect);
      });
    });
    return out;
  }

  // How much less one Trait's total XP cost is, given the Elemental Blessings in effect.
  //
  // Called from recalcAll()'s Trait XP loop with the same rank and free floor traitCost() was
  // given, and subtracted from its result. Two properties matter:
  //
  //  * It discounts only Ranks actually BOUGHT. Ranks below the free floor (Family/School
  //    bonuses) cost nothing to begin with, so there is nothing there to make cheaper -- a
  //    blessing on a Ring whose Traits are both still at their floor is worth 0, not worth
  //    2 XP of nothing.
  //  * It can never exceed what the Trait costs. Clamped against traitCost()'s own answer
  //    rather than assumed safe, so no combination of stacked blessings can turn a Trait into
  //    an XP refund.
  function advConfigTraitXpDiscount(traitKey, rank, freeFloor){
    if(!ADV_CONFIG_ENABLED) return 0;
    const steps = Math.max(0, (rank||0) - (freeFloor==null || isNaN(freeFloor) ? 2 : freeFloor));
    if(steps === 0) return 0;
    let perStep = 0;
    activeAdvConfigEffects().forEach(eff=>{
      if(eff.effect === 'traitXpDiscount' && eff.traitKeys.indexOf(traitKey) !== -1) perStep += eff.amount;
    });
    if(perStep === 0) return 0;
    return Math.min(perStep * steps, traitCost(rank, freeFloor));
  }

  // ---------- The per-entry control ----------
  //
  // A configurable entry grows one button and one status line, both rebuilt from scratch on
  // every refresh pass. Rebuilding rather than patching is what makes a RENAMED entry behave:
  // type "Elemental Blessing" into a blank custom entry and it becomes configurable on the next
  // recalc; type over the name and the control disappears along with its effect.
  function advConfigRowFor(div){
    let row = div.querySelector('.adv-config-row');
    if(!row){
      row = document.createElement('div');
      row.className = 'adv-config-row';
      // Placed after the name/cost line and before the description, so the pick reads as part
      // of the entry's identity rather than as a note appended to its text.
      const top = div.querySelector('.entry-top');
      if(top && top.nextSibling) div.insertBefore(row, top.nextSibling);
      else div.appendChild(row);
    }
    return row;
  }
  function removeAdvConfigRow(div){
    const row = div.querySelector('.adv-config-row');
    if(row) row.remove();
  }

  // Repaint one entry's control. Returns nothing; it is called for its effect on the DOM.
  function refreshAdvConfigControl(div){
    const nameEl = div.querySelector('.en-name');
    const schema = nameEl ? advConfigSchemaFor(nameEl.value) : null;
    if(!schema){
      // Not configurable (any more). The stored pick goes too -- leaving it would mean a
      // renamed-and-renamed-back entry silently recovering a choice the player may not have
      // meant to keep, and an effect that is invisible on the sheet is exactly what this
      // phase exists to stop.
      removeAdvConfigRow(div);
      delete div.dataset.advConfig;
      return;
    }
    const config = readAdvConfig(div);
    const effect = resolveAdvDisadvEffect(nameEl.value, config);
    const row = advConfigRowFor(div);
    if(effect){
      const summary = effect.effect === 'traitXpDiscount'
        ? `${escHtml(effect.ringName)} — ${escHtml(RINGS.find(r=>r.key===effect.ringKey).traits.map(t=>t.name).join(' and '))} cost ${effect.amount} XP less per Rank`
        : `${escHtml(effect.label)} — ${effect.cost} point${effect.cost===1?'':'s'}`;
      row.className = 'adv-config-row configured';
      row.innerHTML = `<span class="adv-config-summary">${summary}</span>` +
        `<button type="button" class="ghost adv-config-btn" title="Change this choice">Change</button>`;
    } else {
      // "Flag any variable entry that's been added but not yet configured -- same visual
      // treatment as an unmet requirement, never a silent default." No Ring is assumed, no
      // tier is assumed, and the entry contributes nothing until the player picks.
      row.className = 'adv-config-row unconfigured';
      row.innerHTML = `<span class="adv-config-warn">Needs a choice</span>` +
        `<button type="button" class="ghost adv-config-btn" title="${escAttr(schema.prompt)}">Choose…</button>`;
    }
    row.querySelector('.adv-config-btn').addEventListener('click', ()=>openAdvConfigModal(div));
  }

  // The one hook recalcAll() calls. Scanning both lists here -- rather than attaching anything
  // at makeEntry() time -- is what lets a single call site cover every way an entry can appear:
  // added from the dropdown, added blank and typed into, restored by a character load, or
  // brought in by a JSON import.
  function refreshAllAdvConfigControls(){
    ['advList','disadvList'].forEach(listId=>{
      const list = document.getElementById(listId);
      if(!list) return;
      list.querySelectorAll('.entry').forEach(div=>{
        if(!ADV_CONFIG_ENABLED){ removeAdvConfigRow(div); return; }
        refreshAdvConfigControl(div);
      });
    });
  }

  // ---------- The modal ----------
  //
  // Built on the existing universal-spell / affinity picker markup pattern (.affinity-pick-grid
  // and .affinity-pick-item), per the roadmap: "Reuse the existing modal component already
  // built for universal spell element picks -- no new modal system." One difference from
  // pickUniversalSpellElement(): that one resolves a Promise because a cast is waiting on the
  // answer. Nothing waits on this one, so it writes the pick and recalcs on confirm.
  let advConfigTargetEntry = null;
  function openAdvConfigModal(div){
    const nameEl = div.querySelector('.en-name');
    const schema = nameEl ? advConfigSchemaFor(nameEl.value) : null;
    if(!schema) return;
    const overlay = document.getElementById('advConfigModalOverlay');
    if(!overlay) return;
    advConfigTargetEntry = div;
    const current = readAdvConfig(div);
    document.getElementById('advConfigTitle').textContent = schema.title;
    document.getElementById('advConfigSubtitle').textContent = schema.prompt;
    const noteEl = document.getElementById('advConfigNote');
    noteEl.textContent = schema.note || '';
    noteEl.style.display = schema.note ? '' : 'none';
    const grid = document.getElementById('advConfigGrid');
    grid.innerHTML = advConfigOptionsFor(schema).map(opt=>{
      const checked = current && current.value === opt.value;
      const cost = (opt.cost !== undefined) ? ` <span class="adv-config-cost">${opt.cost} pt${opt.cost===1?'':'s'}</span>` : '';
      return `
        <div class="affinity-pick-item${checked?' checked':''}" data-value="${escAttr(opt.value)}">
          <label for="advConfigPick_${escAttr(opt.value)}">${escHtml(opt.label)}${cost}</label>
          <input type="checkbox" id="advConfigPick_${escAttr(opt.value)}"${checked?' checked':''}>
        </div>`;
    }).join('');
    overlay.style.display = 'flex';
    const items = Array.from(grid.querySelectorAll('.affinity-pick-item'));
    const boxes = items.map(item=>item.querySelector('input[type="checkbox"]'));
    // Ticking one box unticks the rest -- one pick, exactly as the Element picker does it.
    boxes.forEach((box,i)=>{
      box.addEventListener('change', ()=>{
        if(box.checked){
          boxes.forEach((other,j)=>{ if(j!==i){ other.checked = false; items[j].classList.remove('checked'); } });
          items[i].classList.add('checked');
        } else {
          items[i].classList.remove('checked');
        }
      });
    });
  }
  function closeAdvConfigModal(){
    const overlay = document.getElementById('advConfigModalOverlay');
    if(overlay) overlay.style.display = 'none';
    advConfigTargetEntry = null;
  }

  // Commit. A severityTier writes the entry's own cost field as well as the pick, which is
  // what makes it show up in the XP tracker: the sheet already totals that field, so the tier
  // needs no second place to be counted and cannot disagree with the row the player is reading.
  // Re-picking overwrites both -- the "changing severity after the fact updates totals without
  // double-counting" case is handled by there being only one number, not by unwinding an old one.
  function confirmAdvConfigModal(){
    const div = advConfigTargetEntry;
    if(!div){ closeAdvConfigModal(); return; }
    const grid = document.getElementById('advConfigGrid');
    const chosen = Array.from(grid.querySelectorAll('.affinity-pick-item'))
      .find(item=>item.querySelector('input[type="checkbox"]').checked);
    if(!chosen){ setStatus('Make a choice before confirming.'); return; }
    const nameEl = div.querySelector('.en-name');
    const schema = advConfigSchemaFor(nameEl ? nameEl.value : '');
    if(!schema){ closeAdvConfigModal(); return; }
    const value = chosen.dataset.value;
    writeAdvConfig(div, schema.type, value);
    const effect = resolveAdvDisadvEffect(nameEl.value, readAdvConfig(div));
    if(effect && effect.effect === 'entryCost'){
      const costEl = div.querySelector('.en-cost');
      if(costEl) costEl.value = effect.cost;
    }
    closeAdvConfigModal();
    recalcAll();
    setStatus(`${nameEl.value}: ${value}.`);
  }

  function initAdvConfig(){
    if(!ADV_CONFIG_ENABLED) return;
    const overlay = document.getElementById('advConfigModalOverlay');
    if(!overlay) return;
    document.getElementById('advConfigConfirm').addEventListener('click', confirmAdvConfigModal);
    document.getElementById('advConfigX').addEventListener('click', closeAdvConfigModal);
    overlay.addEventListener('click', (e)=>{ if(e.target.id === 'advConfigModalOverlay') closeAdvConfigModal(); });
    refreshAllAdvConfigControls();
  }
