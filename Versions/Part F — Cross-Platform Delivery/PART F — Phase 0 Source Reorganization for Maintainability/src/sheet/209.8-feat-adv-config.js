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
  // THE ROLL-EFFECT HALF (4.5.1), AND THE RULING IT NEEDED
  //
  // This phase first shipped COST effects only. A roll effect belongs in
  // PREROLL_MODIFIER_REGISTRY (130-round-and-pipeline.js) -- the sheet's one documented way to
  // adjust a pool -- but Phase 1.5 (Part G) baselined that registry and asserted its exact
  // contents ("registry holds exactly the six documented contributors"), and its own source
  // comment names this phase by number: "later phases (3, 4, 4.5, 6) must not change how these
  // combine". Registering a seventh contributor took that suite to 33/34, and the only repair
  // was editing a previous phase's recorded baseline -- not something to do unilaterally.
  //
  // The project owner ruled that the baseline may go from six contributors to seven, on the
  // grounds that Phase 1.5 is an AUDIT phase whose job is to notice pipeline changes rather
  // than forbid them. Its harness now asserts the six core contributors in priority order AND
  // that the only one beyond them is this phase's -- so it passes both with this phase present
  // and with it surgically removed, which a hard `length === 7` would not have.
  //
  // THE THREE ENTRIES, and why one of them moves no dice:
  //
  //   Chosen by the Oracles   "+1k1 on all Ring Rolls using it"     -> a real dice modifier.
  //   Friendly Kami           "+1k1 on Sense/Commune/Summon
  //                            Spell Casting Rolls for it"          -> a real dice modifier.
  //   Friend of the Elements  "Trait Rolls using either of its
  //                            Traits gain a Free Raise"            -> INFORMATIONAL ONLY.
  //
  // A Free Raise is not a dice-pool change -- it is a Raise you did not have to declare, and
  // this sheet has no Raise mechanic to spend it through. Every other Free Raise in the
  // codebase (a dozen Skill Mastery abilities in 020-lib-skills-advantages.js) is likewise
  // descriptive text the player applies by hand. So Friend of the Elements registers an
  // `informational:true` modifier, whose three deltas the pipeline's own normaliser forces to
  // zero -- it appears in the roll preview and the post-roll breakdown saying the Free Raise is
  // available, and changes no arithmetic. Inventing a dice equivalent for it (+0k1, say, or a
  // -5 to TN) would be inventing rules content, which Process Requirement #3 forbids.
  //
  // The precedent for a contributor that reports rather than adds is Feature 6 (Part C)'s
  // arrow entry, which uses the same flag for the same honesty reason.
  //
  // 'skillPick'/'traitPick' from the roadmap's named configTypes remain unbuilt: the entries
  // that would use them (Great Potential, Doubt) have neither a cost nor a roll consequence, so
  // building those types would add a picker that records a value nothing reads.
  // ---------------------------------------------------------------------------------------

  // One-line kill-switch, per this project's convention for a feature phase. With this false
  // no entry is offered a pick, no stored pick is read, no XP discount is applied, and the
  // sheet behaves exactly as it did before this phase.
  const ADV_CONFIG_ENABLED = true;

  // Second kill-switch, for the roll-effect half (4.5.1) alone. With this false the three
  // roll-effect entries still take their pick and still show it, but contribute nothing to any
  // roll -- the cost half is untouched. The contributor stays REGISTERED either way, so the
  // registry Phase 1.5 (Part G) audits reads the same with this flag on or off; an inert
  // registered contributor is still a registered contributor, and saying otherwise would make
  // that phase's report depend on a flag it cannot see.
  const ADV_CONFIG_ROLL_EFFECTS_ENABLED = true;

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
  //   type 'ringPick'      -- choose one Ring. Options are read from RINGS itself
  //                           (010-prelude.js), which holds exactly Air/Earth/Fire/Water, so
  //                           "non-Void" needs no list of its own to go stale. An entry whose
  //                           rules text does NOT exclude Void sets `ringSet:'all'`, which
  //                           appends it -- see Chosen by the Oracles below.
  //   type 'severityTier'  -- choose one named tier; its `cost` becomes the entry's own cost.
  //
  //   effect 'traitXpDiscount'    -- each Rank bought in either of the chosen Ring's two Traits
  //                                  costs `amount` XP less.
  //   effect 'entryCost'          -- the pick sets what the entry itself costs. No separate
  //                                  resolver work: the sheet already totals the cost field.
  //   effect 'ringRollBonus'      -- +1k1 on Ring Rolls of the chosen Ring.
  //   effect 'universalSpellBonus'-- +1k1 on a Universal spell cast in the chosen Element.
  //   effect 'traitFreeRaise'     -- reports a Free Raise on the chosen Ring's Trait Rolls.
  //                                  Informational: it moves no dice. See the header.
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
    // "Choose a Ring; gain +1k1 on all Ring Rolls using it."
    // ringSet 'all' because this one says "a Ring" with no exclusion, and Void IS rollable on
    // this sheet -- the Void card carries its own .ring-name with data-ring-name="Void"
    // (080-identity-build-ui.js), so a Void Ring Roll reaches the pipeline like any other.
    // Elemental Blessing above says "a NON-VOID Ring" and therefore keeps the default set.
    // The two differ in the rules, so they differ here.
    'Chosen by the Oracles': {
      type: 'ringPick',
      ringSet: 'all',
      effect: 'ringRollBonus',
      title: 'Choose a Ring',
      prompt: 'Chosen by the Oracles — choose the Ring',
      note: 'Ring Rolls using that Ring gain +1k1.',
    },
    // "Choose a Ring; Trait Rolls using either of its Traits gain a Free Raise. Shugenja pay 3."
    // Void is absent from the options because Void has no Traits for the effect to apply to.
    'Friend of the Elements': {
      type: 'ringPick',
      effect: 'traitFreeRaise',
      title: 'Choose a Ring',
      prompt: 'Friend of the Elements — choose the Ring',
      note: 'Trait Rolls using either of that Ring’s Traits gain a Free Raise. The roll will say so; it moves no dice.',
    },
    // "Shugenja only. Choose an Element; +1k1 on Sense/Commune/Summon Spell Casting Rolls for it."
    // Those three spell names are exactly the sheet's three Universal spells (SPELL_LIBRARY,
    // element:'Universal'), and casting one asks the player to pick a real Element first -- so
    // "for it" is decidable at roll time by comparing the picked Element against this pick.
    'Friendly Kami': {
      type: 'ringPick',
      effect: 'universalSpellBonus',
      title: 'Choose an Element',
      prompt: 'Friendly Kami — choose the Element',
      note: 'Sense, Commune and Summon gain +1k1 when cast in that Element.',
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

  // Later 4.5 fragments add the configurations whose behaviour needs its own ring-fenced
  // module (resources, Kharmic Tie, and clan weapons). They register through this one small
  // doorway instead of editing ADV_LIBRARY or reaching into this map by hand. Keeping both
  // tables in step matters: the named table is exported to QA, while the normalised table is
  // the only lookup the live sheet uses.
  function registerAdvConfigSchema(name, schema){
    if(!name || !schema || typeof schema !== 'object') return false;
    ADV_DISADV_CONFIG_SCHEMA[name] = schema;
    ADV_CONFIG_SCHEMA_BY_NORM_NAME[normalizeAdvName(name)] = Object.assign({ name }, schema);
    return true;
  }

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
    if(schema.type === 'ringPick'){
      const opts = RINGS.map(r=>({ label:r.name, value:r.name, ringKey:r.key }));
      // ringSet 'all' adds Void, for an entry whose rules text says "a Ring" without excluding
      // it. Void is appended rather than living in RINGS because RINGS is the four ELEMENTAL
      // Rings and the rest of the sheet relies on that (it is what makes "non-Void" free).
      if(schema.ringSet === 'all') opts.push({ label:'Void', value:'Void', ringKey:'void' });
      return opts;
    }
    if(schema.type === 'severityTier') return schema.options.map(o=>({ label:o.label, value:o.label, cost:o.cost }));
    if(schema.type === 'rankPick') return (schema.options || []).map(o=>({
      label:o.label,
      value:o.value === undefined ? o.label : o.value,
      cost:o.cost,
      rank:o.rank,
    }));
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
      if(parsed && typeof parsed === 'object' && parsed.type) return parsed;
    } catch(e){ /* a corrupted value reads as unconfigured, which the badge then flags */ }
    return null;
  }
  function writeAdvConfig(div, type, value){
    if(!div || !div.dataset) return null;
    const config = (value && typeof value === 'object' && !Array.isArray(value))
      ? Object.assign({}, value, { type })
      : { type, value };
    div.dataset.advConfig = JSON.stringify(config);
    return config;
  }
  function advConfigIsComplete(schema, config){
    if(!schema || !config || config.type !== schema.type) return false;
    if(schema.type === 'ringPick' || schema.type === 'severityTier'){
      return !!config.value;
    }
    if(schema.type === 'rankPick'){
      return !!config.value && isFinite(parseInt(config.rank,10));
    }
    // Specialised types validate in their own later Phase 4.5 fragment. A missing fragment
    // therefore makes a saved choice visibly incomplete instead of claiming a half-removed
    // feature is still active.
    if(typeof isExtendedAdvConfigComplete === 'function'){
      return !!isExtendedAdvConfigComplete(schema, config);
    }
    return false;
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
    if(!schema || !advConfigIsComplete(schema, config)) return null;
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
    // ---- the roll effects (4.5.1) ----
    // Each validates the picked value against the options that schema actually offers, so a
    // saved character carrying a stale or hand-edited pick resolves to nothing rather than to
    // a half-built effect. That is the same "what is not declared is not claimed" discipline
    // the ringPick branch above uses.
    if(schema.type === 'ringPick' && schema.effect === 'ringRollBonus'){
      const offered = advConfigOptionsFor(schema).some(o=>o.value === config.value);
      if(!offered) return null;
      return { effect: 'ringRollBonus', entryName: schema.name, ringName: config.value, rolled: 1, kept: 1 };
    }
    if(schema.type === 'ringPick' && schema.effect === 'traitFreeRaise'){
      const ring = RINGS.find(r=>r.name === config.value);
      if(!ring) return null;
      return {
        effect: 'traitFreeRaise',
        entryName: schema.name,
        ringName: ring.name,
        traitNames: ring.traits.map(t=>t.name),
      };
    }
    if(schema.type === 'ringPick' && schema.effect === 'universalSpellBonus'){
      const ring = RINGS.find(r=>r.name === config.value);
      if(!ring) return null;
      return { effect: 'universalSpellBonus', entryName: schema.name, ringName: ring.name, rolled: 1, kept: 1 };
    }
    // All non-original config types live in a later Phase 4.5 fragment. Keeping their rules
    // there lets Kharmic Tie and Sacred Weapon be reworked without disturbing this proven core.
    if(typeof resolveExtendedAdvConfigEffect === 'function'){
      return resolveExtendedAdvConfigEffect(name, config, schema);
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

  // ---------- The roll effects (4.5.1) ----------
  //
  // One contributor for all three roll-effect entries, registered into the pipeline's own
  // registry exactly as Features 4, 6 and 7 (Part C) register theirs -- "each later feature
  // registers its own contributor and never edits this pipeline". Nothing in
  // 130-round-and-pipeline.js is touched by this phase.
  //
  // EVERY CONTEXT KEY READ HERE IS THE TRUNK'S, NOT ANOTHER PHASE'S. `kind`, `ringName`,
  // `traitName`, `spellName` and `element` were all on the roll context before Phase 4 (Part G)
  // existed; the keys Phase 4 added (`ringValue`, `traitValue`, `schoolRank`, ...) are its own
  // and are deliberately NOT read here. That is what keeps this a trunk dependency rather than
  // a cross-phase one -- checked by removing Phase 4 and re-running, not assumed.
  const ADV_CONFIG_UNIVERSAL_SPELLS = ['Commune', 'Sense', 'Summon'];

  function advConfigRollModifiers(context){
    if(!ADV_CONFIG_ENABLED || !ADV_CONFIG_ROLL_EFFECTS_ENABLED) return [];
    if(!context) return [];
    const out = [];
    activeAdvConfigEffects().forEach(eff=>{
      if(eff.effect === 'ringRollBonus'){
        if(context.kind === ROLL_KINDS.RING && context.ringName === eff.ringName){
          out.push({ source:'adv-config', label:eff.entryName,
                     rolledDelta:eff.rolled, keptDelta:eff.kept,
                     note:eff.ringName + ' Ring Roll' });
        }
      } else if(eff.effect === 'universalSpellBonus'){
        // A Maho casting is excluded: it runs its own pipeline, is not a kami spell at all, and
        // Friendly Kami is a bargain with the kami of one Element.
        if(context.kind === ROLL_KINDS.SPELL && !context.maho
           && ADV_CONFIG_UNIVERSAL_SPELLS.indexOf(context.spellName) !== -1
           && context.element === eff.ringName){
          out.push({ source:'adv-config', label:eff.entryName,
                     rolledDelta:eff.rolled, keptDelta:eff.kept,
                     note:context.spellName + ' cast in ' + eff.ringName });
        }
      } else if(eff.effect === 'traitFreeRaise'){
        if(context.kind === ROLL_KINDS.TRAIT && eff.traitNames.indexOf(context.traitName) !== -1){
          // informational: the normaliser forces all three deltas to zero, so this cannot move
          // a die however it is edited later. `display` is what the breakdown prints in place
          // of a delta it does not have.
          out.push({ source:'adv-config', label:eff.entryName, informational:true,
                     display:'Free Raise available',
                     note:'apply it yourself — this sheet has no Raise mechanic to spend it through' });
        }
      }
    });
    // One registry seat, one contributor. Extended 4.5 behaviours return their modifiers
    // through this guarded call; they do not add a second registry entry or alter Phase 1.5's
    // documented registry shape.
    if(typeof advConfigExtendedRollModifiers === 'function'){
      const extra = advConfigExtendedRollModifiers(context);
      if(Array.isArray(extra)) extra.forEach(mod=>{ if(mod) out.push(mod); });
    }
    return out;
  }
  // Priority 60 puts this last, after void (50). Priority only orders the printed breakdown --
  // addition is commutative, so it changes no arithmetic -- and sitting last leaves all six
  // existing contributors at exactly the positions Phase 1.5 (Part G) recorded for them.
  registerPreRollModifier('adv-config', 60, advConfigRollModifiers);

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
    let config = readAdvConfig(div);
    // Sacred Weapon has no player-facing picker: its configuration is derived from the
    // character Clan by a separately removable 4.5 module. If that module is not present,
    // this is intentionally a no-op and the row stays honestly unconfigured.
    if(typeof ensureExtendedAdvConfigAutoConfig === 'function'){
      const generated = ensureExtendedAdvConfigAutoConfig(div, schema, config);
      if(generated){
        writeAdvConfig(div, schema.type, generated);
        config = readAdvConfig(div);
      }
    }
    const effect = resolveAdvDisadvEffect(nameEl.value, config);
    const row = advConfigRowFor(div);
   if(effect){
      // A variable entry's chosen cost is authoritative. This also heals old saves/imports
      // whose editable cost field drifted away from their recorded choice, instead of allowing
      // the XP tracker to silently price a selected tier as something else.
      if(effect.cost !== undefined){
       const costEl = div.querySelector('.en-cost');
       if(costEl) costEl.value = effect.cost;
      }
      const extendedSummary = (typeof advConfigSummaryForEffect === 'function')
        ? advConfigSummaryForEffect(effect, schema, config, div) : '';
      const summary = extendedSummary || (effect.effect === 'traitXpDiscount'
        ? `${escHtml(effect.ringName)} — ${escHtml(RINGS.find(r=>r.key===effect.ringKey).traits.map(t=>t.name).join(' and '))} cost ${effect.amount} XP less per Rank`
        : `${escHtml(effect.label)} — ${effect.cost} point${effect.cost===1?'':'s'}`);
      row.className = 'adv-config-row configured';
      row.innerHTML = `<span class="adv-config-summary">${summary}</span>` +
        `<button type="button" class="ghost adv-config-btn" title="Change this choice">Change</button>`;
   } else {
      // A variable price is not a provisional price. Until its required choice exists, make
      // its contribution visibly zero rather than silently charging the library's lowest tier.
      // Fixed-price entries with a Ring/Skill choice retain their stated cost.
      if(['entryCost','kharmicTie','luck','magicResistanceReminder','sacredWeapon'].indexOf(schema.effect) !== -1){
        const costEl = div.querySelector('.en-cost');
        if(costEl) costEl.value = 0;
      }
     // "Flag any variable entry that's been added but not yet configured -- same visual
      // treatment as an unmet requirement, never a silent default." No Ring is assumed, no
      // tier is assumed, and the entry contributes nothing until the player picks.
      row.className = 'adv-config-row unconfigured';
      row.innerHTML = `<span class="adv-config-warn">Needs a choice</span>` +
        `<button type="button" class="ghost adv-config-btn" title="${escAttr(schema.prompt)}">Choose…</button>`;
   }
   row.querySelector('.adv-config-btn').addEventListener('click', ()=>openAdvConfigModal(div));
    if(typeof decorateExtendedAdvConfigRow === 'function'){
      decorateExtendedAdvConfigRow(div, row, schema, config, effect);
    }
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
    // The session-resource readout is Phase 4.5-owned DOM appended to (not integrated into)
    // the protected Phase 2 quick-access panel. Refresh it only after every Advantage row has
    // settled, so resource pips and their row controls always agree.
    if(typeof renderAdvConfigSessionResources === 'function') renderAdvConfigSessionResources();
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
    if(typeof openExtendedAdvConfigModal === 'function' && openExtendedAdvConfigModal(div, schema)){
      return;
    }
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
    if(typeof closeExtendedAdvConfigModal === 'function') closeExtendedAdvConfigModal();
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
    if(typeof confirmExtendedAdvConfigModal === 'function' && confirmExtendedAdvConfigModal()){
      return;
    }
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
