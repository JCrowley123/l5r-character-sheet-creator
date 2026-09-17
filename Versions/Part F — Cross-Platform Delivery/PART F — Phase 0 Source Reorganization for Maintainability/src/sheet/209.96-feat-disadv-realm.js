  // ========= PART I FEATURE 4.5.10: CURSED BY THE REALM =========
  //
  // D01. Ten realms, ten different shapes of consequence, one catalogue row. The entry is worth
  // more than its row count because four of its branches needed machinery that did not exist:
  // a sustained condition toggle, a fresh per-roll declaration, a standalone GM-called check, and
  // a cross-entry compatibility flag. D04's Ebisu and Jurojin reuse two of those directly.
  //
  // SIX THINGS WERE MEASURED BEFORE ANY OF THIS WAS WRITTEN. Four changed the design.
  //
  // 1. D45.modules IS THE ROUTE IN, AND IT TAKES NO REGISTRY SEAT AT ALL. Feature 4.59 re-registered
  //    Phase 4.5's own 'adv-config' contributor and delegated to the previous one, which keeps the
  //    registry at seven but is delicate -- its own ROLLBACK calls that "the most important line in
  //    this file". Measured: D45.modules entries are consulted generically by D45.modifiers()
  //    (209.85), which is reached through advConfigExtendedRollModifiers from the SINGLE existing
  //    'adv-config' seat. Driven live before a line was written: a probe module registered this way
  //    is seen on SKILL/ATTACK/TRAIT/RING/SPELL, the registry stays at SEVEN seats, and deleting the
  //    key stops the contribution cleanly. So this phase re-registers nothing and wraps nothing.
  //
  // 2. THE DAMAGE EXCLUSION IS INHERITED, NOT ASSERTED. D45.modifiers() returns [] for
  //    ROLL_KINDS.DAMAGE at 209.85 BEFORE it consults api.modules. Measured on the same probe:
  //    damage saw 0 contributions while every other kind saw 1. Feature 4.59's ROLLBACK names the
  //    damage leak as the single easiest way to get the TN convention wrong -- a damage context
  //    carries the same skillName as the attack before it. Routing through D45.modules makes that
  //    bug structurally impossible here rather than something this fragment has to remember.
  //    REALM4510-DAMAGE-01 still proves it, because inherited protection that nobody checks is
  //    protection that a later refactor removes silently.
  //
  // 3. MEIDO SCOPES ON traitName, NOT ON A SKILL LIST. Measured: a SKILL context carries the
  //    skill's own trait (100-dice-engine.js), an ATTACK context carries traitName too, and a
  //    TRAIT context obviously does. Exactly THREE skills in SKILL_LIBRARY roll on Perception --
  //    Battle, Hunting and Investigation -- so a hand-written list would have been three names
  //    that rot the moment the library changes. One traitName test covers all three plus the
  //    Perception Trait Roll itself, and keeps working if a Perception skill is ever added.
  //
  // 4. CHIKUSHUDO AND MEIDO CANNOT COLLIDE. Animal Handling rolls on AWARENESS, not Perception --
  //    measured, and worth stating because "animals, so Perception" is the intuitive wrong answer.
  //    The two branches are disjoint by construction, not by a rule this fragment enforces.
  //
  // 5. YOMI'S ANCESTRAL SURFACE IS EXACTLY TWO ENTRIES. The audit names Inheritance and asks for
  //    other matches to be verified rather than assumed. Measured across BOTH libraries: only
  //    Inheritance (Advantage) and Haunted (Disadvantage) reference an ancestor, heirloom or
  //    lineage at all. Phase 4.8 (Ancestors) is not built, so there is no third thing to find.
  //    This branch FLAGS them and deletes nothing -- the audit is explicit that player entries
  //    must not be silently removed.
  //
  // 6. JIGOKU'S ROLL IS DEFERRED, ON THE PROJECT OWNER'S DECISION. The audit leaves "the
  //    applicable resistance roll" unresolved and the sheet models no Taint rank anywhere; the
  //    only Taint in the source is a catalogue row. Inventing which Trait or Ring resists it
  //    would be inventing rules content (Process Requirement #3). It ships as a badge and an
  //    honest reminder, with the gap named on the row rather than hidden.
  const DISADV_REALM_ENABLED = true;

  const R4510 = (function(){
    const api = {};
    api.enabled = function(){ return DISADV_REALM_ENABLED; };
    api.NAME = 'Cursed by the Realm';
    api.AWARD = 4;
    api.AWARD_SHUGENJA = 5;
    api.TENGOKU_TN = 10;
    api.TOSHIGOKU_TN = 15;
    api.MEIDO_TRAIT = 'Perception';
    api.CHIKUSHUDO_SKILL = 'Animal Handling';

    // Core p.158's ten realms, in the audit's own order. `effect` is this fragment's dispatch key;
    // `note` is what the player reads in the picker (as a <details> disclosure, which D45 renders
    // from opt.note) and, condensed, on the configured row.
    api.REALMS = {
      'Chikushudo': { effect:'skill',
        note:'The realm of animals is closed to you: −1k1 on all Animal Handling rolls. Applied automatically.' },
      'Gaki-do': { effect:'reminder',
        note:'Hungry ghosts single you out. The GM decides when gaki take an interest; nothing is applied automatically.' },
      'Jigoku': { effect:'reminder',
        note:'Resisting the Shadowlands Taint is harder for you. The roll is NOT automated here: this sheet does not state which roll resists the Taint, and inventing one would be inventing a rule. Tell your GM.' },
      'Maigo no Musha': { effect:'declare',
        note:'−1k1 on a roll made against a spirit. Declare it per roll — tick “Against a spirit” in the roll preview. It is never left armed.' },
      'Meido': { effect:'trance', toggle:'In a trance',
        note:'While in a trance: −1k0 on Perception-based rolls (Battle, Hunting, Investigation, and Perception Trait Rolls). You control the toggle; nothing detects a trance.' },
      'Sakkaku': { effect:'reminder',
        note:'Trickster spirits torment you. Narrative only — no pranks, calendar or spirit simulation are modelled.' },
      'Tengoku': { effect:'temple', toggle:'Inside a qualifying temple',
        note:'Inside a qualifying temple: TN +10, shown as 10 off the reported total. Being nearby does not qualify. Damage is never adjusted.' },
      'Toshigoku': { effect:'check',
        note:'On seeing a wounded opponent: Willpower Trait Roll at TN 15, or be overcome by the urge to fight. Use the button on this row when the GM calls for it — the sheet never rolls it for you.' },
      'Yomi': { effect:'conflict',
        note:'Your ancestors have turned from you. Ancestral entries on this sheet are FLAGGED for you and the GM to resolve; nothing is deleted or switched off automatically.' },
      'Yume-do': { effect:'reminder',
        note:'Your sleep is troubled: recovering Void Points takes ten hours of sleep rather than the usual rest. No sleep tracking.' },
    };

    api.realmNames = function(){ return Object.keys(api.REALMS); };
    api.realmOf = function(config){
      const text = config && typeof config.realm === 'string' ? config.realm.trim() : '';
      return Object.prototype.hasOwnProperty.call(api.REALMS, text) ? text : null;
    };
    api.spec = function(realm){ return api.REALMS[realm] || null; };
    // Which stored boolean, if any, this realm owns. Everything else is stripped by finalize, so a
    // realm change cannot leave a stale toggle behind for a branch that no longer applies.
    api.toggleField = function(realm){
      const spec = api.spec(realm);
      if(!spec) return null;
      if(spec.effect === 'trance') return 'inTrance';
      if(spec.effect === 'temple') return 'inTemple';
      return null;
    };

    // ---------- The D45 definition ----------
    // `realmPick` is a NEW configTypes string, added on the project owner's explicit decision
    // rather than reusing a shape whose name would be a lie. Feature 4.5.8's ROLLBACK says never
    // to add one, on the grounds that 4.5.2's exact-array assertion has no expected value passing
    // both with a phase present and removed. That is true of a CONSTANT expected value and not of
    // a CONDITIONAL one: Phase 1.5 (Part G) already solved this exact class of problem by making
    // its registry-length check conditional on Phase 4.5 being present. 4.5.2's D45-SCHEMA-TYPES
    // is now conditional the same way. See this phase's ROLLBACK, "Cross-phase fixture correction".
    api.definition = {
      type: 'realmPick',
      steps: function(){
        return [{ field:'realm', label:'Choose the Spirit Realm that has marked you',
          options: api.realmNames().map(function(name){
            return { value:name, label:name, note:api.REALMS[name].note };
          }) }];
      },
      validate: function(config){
        if(!config || config.type !== 'realmPick') return false;
        const realm = api.realmOf(config);
        if(realm === null) return false;
        const field = api.toggleField(realm);
        // A toggle realm must carry its boolean; the others must not be asked for one.
        return field === null || typeof config[field] === 'boolean';
      },
      finalize: function(config){
        const realm = api.realmOf(config);
        // D45.confirm() composes the legacy `value` display field from
        // tenet||element||target||tier||('Rank '+rank), none of which this entry has. Without this
        // the field reads 'Rank undefined' -- the same hook Features 4.5.8 and 4.5.9 both needed.
        config.value = realm || '';
        const field = api.toggleField(realm);
        // Default the owned toggle, and DROP any toggle the newly-chosen realm does not own, so
        // switching Tengoku -> Chikushudo cannot leave an inTemple:true riding along in the save.
        ['inTrance','inTemple'].forEach(function(key){
          if(key === field) config[key] = config[key] === true;
          else delete config[key];
        });
      },
      resolve: function(config, state){
        const realm = api.realmOf(config);
        if(realm === null) return null;
        const spec = api.spec(realm);
        const shugenja = !!(state && state.shugenja);
        const field = api.toggleField(realm);
        const on = field ? config[field] === true : false;
        return {
          cost: shugenja ? api.AWARD_SHUGENJA : api.AWARD,
          realm: realm, realmEffect: spec.effect, realmNote: spec.note,
          toggleField: field, toggleLabel: spec.toggle || '', active: on,
          cursedRealm: true,
          summary: realm + ' — ' + spec.note,
        };
      },
      decorate: function(div, row, config, effect){ api.decorateRow(div, row, config, effect); },
    };

    api.isRealm = function(effect){ return !!(effect && effect.cursedRealm === true); };
    api.active = function(){
      if(!api.enabled() || typeof D45 !== 'object' || !D45 || typeof D45.active !== 'function') return [];
      return D45.active(api.NAME).filter(function(item){ return api.isRealm(item.effect); });
    };
    api.activeOf = function(realm){
      return api.active().filter(function(item){ return item.effect.realm === realm; });
    };

    // ---------- Yomi: flag ancestral entries, delete nothing ----------
    // Reads the trunk's own entry rows rather than another phase's API, so this keeps working with
    // every optional 4.5.x fragment removed. See measurement 5 for why this list is exactly two.
    api.ANCESTRAL = ['Inheritance', 'Haunted'];
    api.ancestralPresent = function(){
      const found = [];
      ['advList','disadvList'].forEach(function(listId){
        const list = document.getElementById(listId);
        if(!list) return;
        Array.prototype.forEach.call(list.querySelectorAll('.entry'), function(div){
          const nameEl = div.querySelector('.en-name');
          if(!nameEl) return;
          const name = String(nameEl.value || '').trim();
          if(api.ANCESTRAL.indexOf(name) !== -1 && found.indexOf(name) === -1) found.push(name);
        });
      });
      return found;
    };

    // ---------- Toshigoku: a standalone check, only when the GM calls for it ----------
    // Built on the TRUNK's own rollWithModifiers + tnConfig rather than on Phase 4.5.2's gate
    // module: D45.gates' matching() hardcodes Elemental Imbalance and Enlightened Madness by name
    // and offers no registration seam, so there was nothing to ride. Driven live before building:
    // a standalone TRAIT roll with a tnConfig opens Phase 3's preview, rolls, and reports against
    // the TN, with no gate firing on a Willpower Trait Roll.
    api.toshigokuRoll = function(){
      if(!api.enabled()) return Promise.resolve(null);
      if(typeof rollWithModifiers !== 'function' || typeof makeRollContext !== 'function' ||
         typeof ROLL_KINDS !== 'object' || !ROLL_KINDS) return Promise.resolve(null);
      const willpower = typeof getTraitValueByName === 'function' ? getTraitValueByName('Willpower') : NaN;
      if(!Number.isFinite(willpower) || willpower < 1){
        if(typeof appAlert === 'function') appAlert('Enter a valid Willpower Rank before making this check.');
        return Promise.resolve(null);
      }
      const context = makeRollContext(ROLL_KINDS.TRAIT, {
        traitName:'Willpower', traitValue:willpower, realm4510Check:'Toshigoku',
      });
      return rollWithModifiers(api.NAME + ' (Toshigoku) — Willpower vs TN ' + api.TOSHIGOKU_TN,
        context, willpower, willpower, {
          tnConfig:{ tn:api.TOSHIGOKU_TN,
            successText:'You master the urge and hold back.',
            failText:'You are overcome by the urge to fight. Tell the GM — this sheet does not act for you.' },
        });
    };

    // ---------- Maigo no Musha: a fresh per-roll declaration ----------
    // The audit is explicit that this must NOT be a blanket armed penalty, so it is deliberately
    // transient: it is cleared when the preview opens and when it is cancelled, and it is never
    // written to the config, so it cannot round-trip through a save.
    let declarationPending = false;
    api.declarationPending = function(){ return declarationPending === true; };
    api.declarationReset = function(){ declarationPending = false; };
    api.declarationSet = function(checked){ declarationPending = checked === true; };
    api.declarationOffered = function(context){
      if(!api.enabled() || !context || typeof ROLL_KINDS !== 'object' || !ROLL_KINDS) return false;
      // Every roll kind this convention supports can be made against a spirit; damage is excluded
      // here as well as centrally, because an "against a spirit" damage roll is a genuine thing a
      // player might expect to tick and the audit asks for damage applicability to be explicit.
      if(context.kind === ROLL_KINDS.DAMAGE) return false;
      return api.activeOf('Maigo no Musha').length > 0;
    };

    // ---------- The roll modifiers ----------
    // Reached through D45.modules, so DAMAGE never arrives here at all (measurement 2).
    api.modifiers = function(context){
      if(!api.enabled() || !context) return [];
      if(typeof ROLL_KINDS !== 'object' || !ROLL_KINDS) return [];
      if(context.kind === ROLL_KINDS.DAMAGE) return [];   // belt and braces; see REALM4510-DAMAGE-01
      const out = [];
      const skillish = context.kind === ROLL_KINDS.SKILL || context.kind === ROLL_KINDS.ATTACK;
      const skillName = typeof context.skillName === 'string' ? context.skillName.trim() : '';
      const traitName = typeof context.traitName === 'string' ? context.traitName.trim() : '';

      api.active().forEach(function(item){
        const effect = item.effect;

        // Chikushudo — always on, one named Skill. Awareness-based, so it cannot overlap Meido.
        if(effect.realm === 'Chikushudo' && skillish && skillName === api.CHIKUSHUDO_SKILL){
          out.push({ source:'adv-config', label:api.NAME,
            rolledDelta:-1, keptDelta:-1,
            note:'Chikushudo — ' + api.CHIKUSHUDO_SKILL });
        }

        // Meido — sustained, and scoped by the roll's own Trait rather than a skill list.
        if(effect.realm === 'Meido' && effect.active && traitName === api.MEIDO_TRAIT){
          out.push({ source:'adv-config', label:api.NAME,
            rolledDelta:-1, keptDelta:0,
            note:'Meido — in a trance, ' + api.MEIDO_TRAIT + '-based roll' });
        }

        // Tengoku — the TN-reporting convention, second consumer after Doubt. The note carries the
        // RULE, not just the number: the convention is explicit that a bare delta is not enough.
        if(effect.realm === 'Tengoku' && effect.active){
          out.push({ source:'adv-config', label:api.NAME,
            totalDelta:-api.TENGOKU_TN,
            note:'Tengoku — inside a temple (TN +' + api.TENGOKU_TN + ')' });
        }

        // Maigo no Musha — only when declared on this roll, and never left armed.
        if(effect.realm === 'Maigo no Musha' && declarationPending){
          out.push({ source:'adv-config', label:api.NAME,
            rolledDelta:-1, keptDelta:-1,
            note:'Maigo no Musha — declared against a spirit' });
        }
      });
      return out;
    };

    // ---------- The configured row ----------
    api.decorateRow = function(div, row, config, effect){
      if(!api.enabled() || !row || !api.isRealm(effect)) return;

      const badge = document.createElement('span');
      // `realm4510-eff-<effect>` rather than `realm4510-<effect>`. The unprefixed form COLLIDED:
      // Toshigoku's effect key is 'check', which produced a badge carrying `.realm4510-check` --
      // the same class as this branch's button -- so the button's own rules landed on the badge
      // too. Caught by printing element identity during the side-by-side geometry measurement,
      // not by reading the code. The `eff-` segment makes the modifier namespace closed, so no
      // future effect key can collide with a control class however it is named.
      badge.className = 'realm4510-badge realm4510-eff-' + effect.realmEffect;
      badge.textContent = effect.realm;
      row.appendChild(badge);

      if(effect.toggleField && typeof D45 === 'object' && D45 && typeof D45.toggle === 'function'){
        // D45's own toggle helper writes through the entry's REAL config and recalculates, so the
        // sustained state round-trips with the rest of the entry and needs no persistence of this
        // phase's own. It must be handed that config, not a synthesised stand-in: it reads the
        // initial checked state from the object passed here and writes back through readAdvConfig.
        D45.toggle(div, row, config, effect.toggleField, effect.toggleLabel);
      }

      if(effect.realmEffect === 'check'){
        // REAL-DEVICE CORRECTION, 17 September 2026. Measured: this row is 303px wide at 375px
        // viewport, "Change" + the badge already use 160px of it, leaving 143px -- and the
        // button's own label makes it 207px wide, so it can NEVER share that line. It always
        // wraps. The break-span below makes that wrap DELIBERATE (a clean new line, flush left)
        // instead of an accident: a zero-size flex item with flex-basis:100% forces the wrap
        // point without being visible itself, so the button keeps its own natural width rather
        // than being stretched to fill the row the way Yomi's flag (2.) deliberately is.
        const brk = document.createElement('span');
        brk.className = 'realm4510-check-break';
        row.appendChild(brk);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ghost realm4510-check';
        btn.textContent = 'Willpower check (TN ' + api.TOSHIGOKU_TN + ')';
        // aria-label rather than title: since Feature 4.54 an explanatory title= is an opt-in to a
        // VISIBLE circled-i icon, which is right for a rules tooltip and wrong for a button whose
        // own label sits inches away. Feature 4.57 learned this on a real device.
        btn.setAttribute('aria-label',
          'Make the Toshigoku Willpower Trait Roll at TN ' + api.TOSHIGOKU_TN + ', when the GM calls for it');
        btn.onclick = function(){ api.toshigokuRoll(); };
        row.appendChild(btn);
      }

      if(effect.realmEffect === 'conflict'){
        const found = api.ancestralPresent();
        const flag = document.createElement('span');
        flag.className = 'realm4510-flag' + (found.length ? '' : ' realm4510-flag-clear');
        flag.textContent = found.length
          ? 'Ancestral: ' + found.join(', ') + ' — resolve with your GM'
          : 'No ancestral entries on this sheet';
        row.appendChild(flag);
      }
    };

    return api;
  })();

  // ---------- Maigo no Musha's hooks into Phase 3's roll preview ----------
  // FUNCTION DECLARATIONS on purpose, not const. Phase 3's fragment (208) is ordered BEFORE this
  // one and guards each call with `typeof fn === 'function'`. A function declaration is hoisted
  // across the whole IIFE so that guard reads true whenever a preview opens; a `const` would sit
  // in the temporal dead zone and make the very `typeof` test throw. And when this fragment is
  // DELETED the identifier is simply undeclared, where `typeof` is defined to return 'undefined'
  // rather than throwing -- which is what makes Phase 3 degrade to its pre-4.5.10 behaviour with
  // no edit of its own.
  //
  // There are now THREE hardwired consumers of this preview (Void, Kharmic Tie, and this one) and
  // no generic registry. A FOURTH -- D04's Ebisu needs exactly this shape -- should trigger the
  // conversation about generalising it rather than a third copy. Recorded in this phase's ROLLBACK.
  function realm4510PreviewStart(context){
    if(typeof R4510 === 'object' && R4510) R4510.declarationReset();
  }
  function realm4510PreviewCancel(){
    if(typeof R4510 === 'object' && R4510) R4510.declarationReset();
  }
  function realm4510PreviewToggle(checked){
    if(typeof R4510 === 'object' && R4510) R4510.declarationSet(checked);
  }
  function realm4510PreviewHtml(context){
    if(typeof R4510 !== 'object' || !R4510 || !R4510.declarationOffered(context)) return '';
    const checked = R4510.declarationPending() ? ' checked' : '';
    return '<div class="realm4510-declare">' +
      '<div class="realm4510-declare-head">Cursed by the Realm — Maigo no Musha</div>' +
      '<label class="realm4510-declare-opt"><input type="checkbox" data-realm4510-declare="1"' +
      checked + '><span>Against a spirit (−1k1 on this roll)</span></label>' +
      '<div class="realm4510-declare-note">Declared for this roll only.</div></div>';
  }

  if(R4510.enabled() && typeof D45 === 'object' && D45 && typeof D45.install === 'function'){
    D45.install(R4510.NAME, R4510.definition);

    // The array is frozen, so this REPLACES it rather than pushing. Removing this fragment leaves
    // 209.85's own frozen twelve as the last word, with no dangling state -- which is exactly what
    // makes the conditional assertion in 4.5.2's harness able to read correctly in both builds.
    if(Array.isArray(D45.configTypes) && D45.configTypes.indexOf('realmPick') === -1){
      D45.configTypes = Object.freeze(D45.configTypes.concat('realmPick'));
    }

    // NO registry seat, and nothing re-registered: D45.modules is consulted generically by
    // D45.modifiers(), which the single existing 'adv-config' contributor already reaches.
    // See measurement 1. Deleting this fragment deletes the key with it.
    if(D45.modules && typeof D45.modules === 'object'){
      D45.modules.realm4510 = { modifiers: function(context){ return R4510.modifiers(context); } };
    }
  }
