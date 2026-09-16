  // ========= PART I FEATURE 4.53: CONFIGURATION REPAIRS =========
  //
  // Eleven confirmed defects in already-shipped Phase 4.5 code, found by the 13 September 2026
  // configuration audit and re-verified against this tree before any of it was written. This
  // fragment adds no new catalogue entry and no new configuration type: every line here exists
  // to make something that already shipped behave the way its own description already claims.
  //
  // WHY IT IS A WRAPPER AND NOT A SET OF EDITS. Three of these defects are wrong values in
  // ADV_LIBRARY/DISADV_LIBRARY and the rest are wrong behaviour in 209.8/209.81. Correcting
  // either in place would rewrite existing lines, and a rewritten line cannot be taken back out
  // by deleting a marked block -- the removal would delete the original along with the fix. So
  // this fragment is purely ADDITIVE, exactly as Phase 4.5 itself was: it corrects the library
  // rows at load time from a table it owns, and it rebinds the handful of functions it repairs,
  // keeping the previous binding and delegating to it. Deleting this file restores every
  // original binding and every original library value, which is what makes the removal rebuild
  // byte-identical.
  //
  // WHAT IS DELIBERATELY NOT HERE. The audit's twelfth finding, Lord Moon's Curse, is parked:
  // its severity tier is configured and correct, but the full-moon bonus Void Point and the
  // rank-scaled Willpower TN are not stated anywhere in this sheet, and inventing the TN map
  // would be inventing rules content (Process Requirement #3). Its entry in the audit is marked
  // PARKED rather than FIXED.
  //
  // A NOTE ON THE THREE CATALOGUE CORRECTIONS. They change the LIBRARY, which is what a newly
  // added entry copies its cost and description from. They deliberately do NOT reach into a
  // character who already added one of these entries: that row carries the cost the player
  // agreed to at the table, and silently repricing a saved character is a data mutation this
  // phase has no business making. The Advantage list will disagree with an old saved row until
  // the player re-adds it, and that is the intended behaviour, not an oversight.
  // -----------------------------------------------------------------------------------------

  // One-line kill-switch, per this project's convention for a feature phase. With this false
  // every repair below goes quiet at once and the sheet behaves exactly as it did before this
  // fragment existed -- which is also how the harness proves the repairs are load-bearing.
  const ADV_CONFIG_REPAIRS_ENABLED = true;

  const R453 = (function(){
    const api = {};

    api.enabled = function(){
      return ADV_CONFIG_REPAIRS_ENABLED && typeof resolveAdvDisadvEffect === 'function';
    };

    // ---------- Shared helpers ----------

    // A strict integer. The audit's concrete finding was that '1x' reaches the sheet as 1,
    // because parseInt stops at the first non-digit and isFinite is happy with the result.
    // Returns null for anything that is not wholly an integer, so a caller cannot mistake a
    // salvaged prefix for a valid value.
    api.strictInt = function(value){
      if(typeof value === 'number') return Number.isInteger(value) ? value : null;
      const text = String(value == null ? '' : value).trim();
      return /^-?\d+$/.test(text) ? parseInt(text, 10) : null;
    };

    // Clan and School facts, read from the sheet's own fields rather than kept as a second
    // copy. Mirrors the shape Phase 4.5.2's own state() reads, and takes Shugenja-ness from
    // characterCasterLock() -- the sheet's existing decider -- rather than re-deriving it.
    api.state = function(){
      const value = function(id){
        const el = document.getElementById(id);
        return el ? String(el.value || '') : '';
      };
      return {
        clan: value('f_clan').trim(),
        shugenja: typeof characterCasterLock === 'function' && characterCasterLock() === 'shugenja',
      };
    };

    // ---------- Defects 5, 6 and 7: three wrong catalogue values ----------
    //
    // Each correction names the page it came from and the exact text it expects to find. The
    // expectation is not decoration: if a later pass corrects the library upstream, the row
    // stops matching and this fragment leaves it alone rather than overwriting a good value
    // with its own idea of one. `applied` records what actually happened, so the harness
    // asserts the repair ran rather than assuming it did.
    api.CATALOGUE_CORRECTIONS = [
      {
        list: 'adv', name: 'Perceived Honor', source: 'Core Rulebook, printed p.152 / PDF p.155',
        expect: { cost: 3 },
        apply: {
          cost: 2,
          desc: '2 points per rank. Anyone reading your Honor Rank perceives it as that many ranks higher.',
        },
        why: 'The rulebook lists PERCEIVED HONOR [SOCIAL] (2 POINTS/RANK). The sheet charged 3.',
      },
      {
        list: 'adv', name: 'Wealthy', source: 'Core Rulebook, printed p.155 / PDF p.158',
        expect: { cost: 1 },
        apply: {
          desc: '1 point per rank. Each point grants 2 extra starting koku. Crane/Unicorn/Imperial pay 1 less off the total.',
        },
        why: 'The discount is a single reduction off the total cost, not one per rank. Five ranks cost 4 XP for an eligible character, not 0.',
      },
      {
        list: 'disadv', name: 'Unlucky', source: 'Core Rulebook, printed p.162 / PDF p.165',
        expect: { cost: 2 },
        apply: {
          desc: '2 points per rank. That many times per session, the GM may force a reroll of one of your rolls, keeping the second result.',
        },
        why: 'The rulebook requires the second roll to be kept in all cases, even when it is better. The sheet said "keeping the worse result".',
      },
    ];

    api.catalogueRepairs = [];
    api.applyCatalogueCorrections = function(){
      api.catalogueRepairs = [];
      api.CATALOGUE_CORRECTIONS.forEach(function(correction){
        const library = correction.list === 'adv' ? ADV_LIBRARY : DISADV_LIBRARY;
        if(!Array.isArray(library)) return;
        const wanted = normalizeAdvName(correction.name);
        const row = library.find(function(entry){ return normalizeAdvName(entry.name) === wanted; });
        if(!row) return;
        const matches = Object.keys(correction.expect).every(function(field){
          return row[field] === correction.expect[field];
        });
        if(!matches){
          api.catalogueRepairs.push({ name: correction.name, applied: false, reason: 'already corrected upstream' });
          return;
        }
        const before = {};
        Object.keys(correction.apply).forEach(function(field){
          before[field] = row[field];
          row[field] = correction.apply[field];
        });
        api.catalogueRepairs.push({ name: correction.name, applied: true, before: before, source: correction.source });
      });
      return api.catalogueRepairs;
    };

    // ---------- Defects 1 and 2: two stated entry-price reductions that never applied ----------
    //
    // Both entries describe a cheaper price for one identity and neither resolver ever returned
    // one, so a Phoenix Elemental Blessing and a Shugenja Friend of the Elements were both
    // charged the full 4. The discounted price is returned as the entry's authoritative cost,
    // the same way a severityTier entry's chosen tier already is -- which also heals a saved
    // row whose cost field has drifted away from the character's actual identity.
    api.CLAN_PRICED = {
      'elemental blessing': {
        base: 4, discounted: 3, qualifier: 'Phoenix',
        qualifies: function(state){ return normalizeAdvName(state.clan) === 'phoenix'; },
      },
      'friend of the elements': {
        base: 4, discounted: 3, qualifier: 'Shugenja',
        qualifies: function(state){ return !!state.shugenja; },
      },
    };

    api.entryPriceFor = function(name){
      const rule = api.CLAN_PRICED[normalizeAdvName(name)];
      if(!rule) return null;
      const discounted = rule.qualifies(api.state());
      return {
        cost: discounted ? rule.discounted : rule.base,
        discounted: discounted,
        qualifier: rule.qualifier,
      };
    };

    // ---------- Defect 3: Friendly Kami's Shugenja requirement was a comment, not a check ----------
    //
    // "Shugenja only" is stated in the entry's own description and in 209.8's own comment above
    // its schema, and nothing enforced either. A non-Shugenja character could configure it and
    // collect the +1k1. The effect now resolves to nothing, and the row says why rather than
    // going quietly inert -- an invisible refusal is the failure mode this whole phase family
    // exists to avoid.
    api.ELIGIBILITY = {
      'friendly kami': {
        needs: 'shugenja',
        message: 'Requires a Shugenja School — no bonus applies.',
      },
    };

    api.ineligibilityReason = function(name){
      const rule = api.ELIGIBILITY[normalizeAdvName(name)];
      if(!rule) return null;
      if(rule.needs === 'shugenja' && !api.state().shugenja) return rule.message;
      return null;
    };

    // ---------- Defect 4: Great Potential never reached a weapon attack ----------
    //
    // Its reminder was gated on ROLL_KINDS.SKILL, so Kenjutsu rolled as a Skill got the
    // raise-limit reminder and the same Kenjutsu rolled as an ATTACK did not -- though an attack
    // is precisely where a Raise limit gets used. The modifier below is the same shape the
    // SKILL branch already produces, deliberately: two reminders that disagreed about the cap
    // would be worse than the one that was missing.
    api.greatPotentialModifier = function(context){
      const skillRank = Math.max(0, parseInt(context.skillRank, 10) || 0);
      const voidInput = document.getElementById('ring_void');
      const voidRank = Math.max(0, parseInt(voidInput && voidInput.value || '0', 10) || 0);
      const allowed = Math.max(skillRank, voidRank);
      return {
        source: 'adv-config', label: 'Great Potential', informational: true,
        display: 'Raise cap ' + allowed,
        note: 'Skill Rank ' + skillRank + '; Void Rank ' + voidRank + '; use the higher limit',
      };
    };

    // ---------- Defect 9: a pick was "complete" if it was merely truthy ----------
    //
    // ringPick and severityTier accepted any non-empty string, so a hand-edited or imported
    // config naming a Ring that does not exist counted as configured. rankPick accepted '1x'
    // as rank 1. This tightens the ORIGINAL Advantage types only: Phase 4.5.2 already validates
    // its own Disadvantage shapes strictly, and reaching into them from here would mean two
    // validators disagreeing about the same data.
    api.strictlyValid = function(schema, config){
      if(!schema || !config) return false;
      if(schema.d45) return true;                       // 4.5.2 owns its own validation
      const offered = function(){
        return (advConfigOptionsFor(schema) || []).map(function(option){ return option.value; });
      };
      if(schema.type === 'ringPick' || schema.type === 'severityTier'){
        return offered().indexOf(config.value) !== -1;
      }
      if(schema.type === 'rankPick'){
        if(api.strictInt(config.rank) === null) return false;
        const options = offered();
        return options.length === 0 || options.indexOf(config.value) !== -1;
      }
      if(schema.type === 'dualTierPick'){
        return api.strictInt(config.influence) !== null && api.strictInt(config.devotion) !== null;
      }
      return true;
    };

    // ---------- Defect 10: an unrecognised config was deleted without a word ----------
    //
    // refreshAdvConfigControl drops a stored pick whenever no schema matches. For a RENAMED
    // entry that is right, and deliberately so -- 209.8's own comment explains it. But the same
    // path also fires when the config is perfectly valid and merely belongs to a module this
    // build does not have, which is what happens to a save made on a fuller build, or after one
    // of the optional 4.5 fragments is removed. That config is now kept and flagged instead.
    // The two cases are told apart by the config's TYPE, not by its name: a type no schema in
    // this build declares cannot be a rename of anything this build knows.
    api.knownConfigTypes = function(){
      const types = {};
      const map = typeof ADV_CONFIG_SCHEMA_BY_NORM_NAME === 'object' ? ADV_CONFIG_SCHEMA_BY_NORM_NAME : {};
      Object.keys(map || {}).forEach(function(key){
        if(map[key] && map[key].type) types[map[key].type] = true;
      });
      if(typeof D45 === 'object' && D45 && Array.isArray(D45.configTypes)){
        D45.configTypes.forEach(function(type){ types[type] = true; });
      }
      return types;
    };

    api.isUnknownConfigType = function(type){
      if(!type) return false;
      return !api.knownConfigTypes()[type];
    };

    // ---------- Defect 11: effects were read from whichever list they sat in ----------
    //
    // activeAdvConfigEffects scanned advList and disadvList and resolved every entry by name,
    // with no check that the name belonged to the list it was found in. A Disadvantage sitting
    // in the Advantage list -- reachable by hand-editing or by a JSON import -- had its effect
    // applied while its cost counted in the opposite direction. The catalogue itself is the
    // oracle for which side a name belongs to; a name in NEITHER library is a custom entry and
    // is left entirely alone, since this phase has no standing to police those.
    api.catalogueSideOf = function(name){
      const wanted = normalizeAdvName(name);
      if(Array.isArray(ADV_LIBRARY) && ADV_LIBRARY.some(function(e){ return normalizeAdvName(e.name) === wanted; })) return 'adv';
      if(Array.isArray(DISADV_LIBRARY) && DISADV_LIBRARY.some(function(e){ return normalizeAdvName(e.name) === wanted; })) return 'disadv';
      return null;
    };

    api.belongsToOtherList = function(name, side){
      const home = api.catalogueSideOf(name);
      return !!home && home !== side;
    };

    // ---------- Row notices ----------
    //
    // Both notices reuse the classes 209.8 already ships for its own "Needs a choice" state, so
    // this phase adds no CSS at all and therefore has nothing to hand back in the stylesheet.
    api.renderNotice = function(div, className, text, title){
      const row = advConfigRowFor(div);
      if(!row) return null;
      row.className = 'adv-config-row unconfigured';
      row.innerHTML = '<span class="adv-config-warn"' + (title ? ' title="' + escHtml(title) + '"' : '') +
        '>' + escHtml(text) + '</span>';
      row.classList.add(className);
      return row;
    };

    return api;
  })();

  if(R453.enabled()){
    // Applied at fragment-execution time rather than from init(), so the corrected values are
    // in place before anything reads the libraries -- the Advantage dropdown is built during
    // init() and would otherwise show the old price for the first paint.
    R453.applyCatalogueCorrections();

    // Every rebinding below keeps the previous binding and delegates to it, so this fragment
    // composes with Phase 4.5.2's own adapters rather than replacing them. It is ordered after
    // 209.88 in the manifest precisely so that "previous binding" means "4.5.2's".
    const r453PrevResolve = resolveAdvDisadvEffect;
    resolveAdvDisadvEffect = function(name, config){
      const effect = r453PrevResolve(name, config);
      if(!effect) return effect;
      if(R453.ineligibilityReason(name)) return null;
      const priced = R453.entryPriceFor(name);
      if(priced && effect.cost === undefined){
        return Object.assign({}, effect, {
          cost: priced.cost,
          costQualifier: priced.discounted ? priced.qualifier : null,
        });
      }
      return effect;
    };

    const r453PrevComplete = advConfigIsComplete;
    advConfigIsComplete = function(schema, config){
      if(!r453PrevComplete(schema, config)) return false;
      return R453.strictlyValid(schema, config);
    };

    const r453PrevModifiers = advConfigExtendedRollModifiers;
    advConfigExtendedRollModifiers = function(context){
      const out = (r453PrevModifiers(context) || []).slice();
      if(context && context.kind === ROLL_KINDS.ATTACK){
        activeAdvConfigEffects().forEach(function(effect){
          if(effect.effect === 'greatPotential' &&
             normalizeAdvName(effect.skill) === normalizeAdvName(context.skillName)){
            out.push(R453.greatPotentialModifier(context));
          }
        });
      }
      return out;
    };

    // A faithful copy of 209.8's own scan with one added guard, rather than a filter over its
    // result: the effects it returns do not all carry an entry name, so which LIST each came
    // from cannot be recovered after the fact. Rebinding means the original is restored intact
    // when this fragment is deleted.
    activeAdvConfigEffects = function(){
      if(!ADV_CONFIG_ENABLED) return [];
      const out = [];
      [['advList', 'adv'], ['disadvList', 'disadv']].forEach(function(pair){
        const list = document.getElementById(pair[0]);
        if(!list) return;
        list.querySelectorAll('.entry').forEach(function(div){
          const nameEl = div.querySelector('.en-name');
          if(!nameEl) return;
          if(R453.belongsToOtherList(nameEl.value, pair[1])) return;
          const effect = resolveAdvDisadvEffect(nameEl.value, readAdvConfig(div));
          if(effect) out.push(effect);
        });
      });
      return out;
    };

    const r453PrevRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){
      const nameEl = div && div.querySelector ? div.querySelector('.en-name') : null;
      const stored = readAdvConfig(div);
      const schema = nameEl ? advConfigSchemaFor(nameEl.value) : null;
      if(!schema && stored && R453.isUnknownConfigType(stored.type)){
        R453.renderNotice(div, 'adv-config-unknown',
          'Saved setting kept — this build cannot show it',
          'This entry carries a configuration of type "' + stored.type + '", which no module in ' +
          'this build understands. It has been left untouched so a fuller build can still read it.');
        return;
      }
      r453PrevRefresh(div);
      if(schema && nameEl){
        const reason = R453.ineligibilityReason(nameEl.value);
        if(reason) R453.renderNotice(div, 'adv-config-ineligible', reason);
      }
    };
  }
