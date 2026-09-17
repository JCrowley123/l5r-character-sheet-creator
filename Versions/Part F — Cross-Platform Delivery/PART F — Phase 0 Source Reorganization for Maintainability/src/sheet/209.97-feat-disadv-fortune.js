  // ========= PART I FEATURE 4.5.11: SEVEN FORTUNES' CURSE (D04a) =========
  //
  // D04, first half. Seven Fortunes behind one catalogue row; FIVE are automated here and two are
  // recorded honestly and left for D04b. This release is deliberately cheap because Feature 4.5.10
  // already paid for the machinery: every one of the five reuses a shape that exists, and this
  // fragment adds no new mechanism of its own.
  //
  //   Benten, Fukurokujin  -> the TN-reporting convention, as Tengoku uses it (4.5.9 built it)
  //   Daikoku              -> a named-Skill dice penalty, exactly Chikushudo's shape
  //   Ebisu, Jurojin       -> a fresh per-roll declaration, exactly Maigo no Musha's shape
  //
  // SIX THINGS WERE MEASURED BEFORE ANY OF THIS WAS WRITTEN. Three changed the design, and one
  // overturned what this phase was originally scoped to build.
  //
  // 1. THE AUTHORITATIVE SOCIAL SKILL LIST ALREADY EXISTS, AND IS NOT THIS PHASE'S TO WRITE. The
  //    audit asks Ebisu to "use the authoritative Social Skill list", and the sourcebook PDFs are
  //    desktop-only, so this looked source-gated in the same way Jigoku's resistance roll was.
  //    Measured instead of assumed: Feature 4.5.2 already ships one, supplied by the project owner,
  //    frozen at 209.85 and exposed as D45.socialSkills -- Acting, Courtier, Etiquette, Perform,
  //    Sincerity, Intimidation, Temptation. Antisocial has scoped its penalty on it since 4.5.2.
  //    Ebisu reads THAT list rather than declaring a second one, so the two entries can never
  //    disagree about what a Social Skill Roll is. This is a real dependency on 4.5.2 and is
  //    declared in this phase's ROLLBACK -- though 4.5.2 is already a hard dependency via
  //    D45.install(), so it adds no new removal coupling.
  //
  // 2. SKILL NAMES ARE FREE TEXT, SO FUKUROKUJIN MATCHES A PREFIX RATHER THAN A LIST. Measured: the
  //    skill row's name is an <input type="text"> (090-table-rows-weapons.js) and reaches the roll
  //    context verbatim -- a context built for 'Lore: Shadowlands' carries exactly that string. The
  //    School library alone already spells 23 distinct 'Lore: <subject>' specializations. A
  //    hand-written list of them would be wrong the first time a player invents a 24th, so the rule
  //    is the one the audit states: the Lore Skill INCLUDING its specializations, i.e. 'Lore' or
  //    anything beginning 'Lore:'. LORE_RE is anchored so a skill merely containing the word (a
  //    hypothetical 'Folklore') cannot match.
  //
  // 3. A DAMAGE CONTEXT CARRIES THE ATTACK'S skillName. Re-measured here rather than trusted:
  //    a DAMAGE context built with skillName 'Etiquette' keeps it. Feature 4.5.9's ROLLBACK names
  //    this as the single easiest way to get the TN convention wrong. It cannot bite here, because
  //    D45.modifiers() returns [] for ROLL_KINDS.DAMAGE BEFORE consulting D45.modules -- the same
  //    inherited protection Feature 4.5.10 relies on. FORTUNE4511-DAMAGE-01 proves it anyway.
  //
  // 4. DAIKOKU CANNOT DEBIT MONEY, AND THE PRECEDENT FOR THAT IS ALREADY SET. The audit asks for the
  //    School starting-outfit koku to drop by one "with ownership/transaction safeguards; no
  //    repeated debit on recalc/load and no unexplained subtraction of money already spent in play."
  //    Measured: the sheet's only money is #f_koku, a live player-edited number holding CURRENT
  //    koku, not starting koku; the School's starting koku exists solely as free text inside each
  //    School row's `outfit:` string ("..., Traveling Pack, 3 koku"). There is no starting-koku
  //    state to debit and no way to make a debit idempotent across load and recalc. Feature 4.5.6
  //    hit the mirror image of this with Wealthy and resolved it the same way -- it grants no koku,
  //    so "the repeated-grant lifecycle cannot arise". Daikoku therefore REMINDS and writes nothing.
  //    The dice half of Daikoku (-1k1 Commerce) is fully automated; only the money half is a note.
  //
  // 5. BISHAMON AND HOTEI ARE DEFERRED TO D04b, AND ARE STILL PICKABLE. Both are flagged by the
  //    audit as needing review before implementation -- Bishamon must reduce only the applicable
  //    Strength CONTRIBUTION to weapon damage (bows, flat damage and unarmed all checked
  //    separately), and Hotei must classify which Technique/Advantage activations cost two Void,
  //    check affordability before committing, and charge exactly once. Neither is a line of code;
  //    both are their own piece of work. Omitting them from the picker would make a seven-Fortune
  //    entry look broken and leave a real character unable to record their own curse, so they are
  //    offered, priced correctly (Hotei is the 6 XP exception, not 3) and carry an honest note that
  //    the sheet does not act on them yet. That is Jigoku's shape from Feature 4.5.10, for the same
  //    reason: name the gap on the row rather than hide it.
  //
  // 6. THE PREVIEW STILL HAS NO GENERIC DECLARATION REGISTRY, AND THIS PHASE DOES NOT BUILD ONE.
  //    Feature 4.5.10's fragment records that a fourth consumer "should trigger the conversation
  //    about generalising it rather than a third copy", and this phase brings two. Generalising it
  //    means rewriting the declaration handling inside Phase 3's (Part G) own fragment, which is
  //    modifying a previous phase from inside a feature release -- and it would make 4.5.10 depend
  //    on a registry this phase owns, so removing THIS phase would break THAT one. Instead the
  //    duplication is capped: this phase adds ONE set of four blocks that handles a LIST of
  //    declarations internally, so both Ebisu and Jurojin ride it and D04b adds none. The
  //    generalisation is recorded in this phase's ROLLBACK as work for its own refactor phase.
  //
  // 7. THIS IS THE FIRST D45 ENTRY WHOSE NAME CARRIES A CURLY APOSTROPHE, AND THAT TURNED OUT TO
  //    MATTER. Found by a check written expecting it to pass: D45.schema() matches on its own
  //    norm(), which only trims and lowercases, so "Seven Fortunes' Curse" typed with a straight
  //    quote did not resolve. Measured: .en-name is a free-text <input>, so that is a real thing a
  //    player can do and not a theoretical one, and every earlier D45.install() name ('Phobia',
  //    'Doubt', 'Cursed by the Realm' and the rest) is plain ASCII, which is why the gap had never
  //    been met. Phase 4.5's own separate schema lookup has folded apostrophes since it was built
  //    -- its comment says an entry must not silently fail to be configurable over a quote
  //    character -- so the standard already existed; D45 just never needed it. Two consequences
  //    are handled below, both inside this fragment: this entry installs under BOTH spellings, and
  //    api.active() filters on this phase's own flag rather than on a name comparison that the
  //    straight spelling would fail. Widening D45's own norm() would fix it for every future entry
  //    and is the better long-term answer, but it edits a previous phase and changes name matching
  //    for eleven live entries, so it is declared in this phase's ROLLBACK rather than done here.
  const DISADV_FORTUNE_ENABLED = true;

  const F4511 = (function(){
    const api = {};
    api.enabled = function(){ return DISADV_FORTUNE_ENABLED; };
    // The curly apostrophe is the library's own (020-lib-skills-advantages.js). D45.schema()
    // matches on a normalised name, so a hand-typed straight quote still resolves.
    api.NAME = 'Seven Fortunes’ Curse';
    api.AWARD = 3;
    api.AWARD_HOTEI = 6;
    api.BENTEN_TN = 10;
    api.FUKUROKUJIN_TN = 5;
    api.BENTEN_SKILL = 'Etiquette';
    api.DAIKOKU_SKILL = 'Commerce';
    // 'Lore' itself, or any 'Lore: <subject>' specialization. Anchored at both ends of the stem so
    // a skill that merely contains the word cannot match. See measurement 2.
    api.LORE_RE = /^lore(\s*:.*)?$/i;

    // Core pp.161-162's seven curses, in the audit's own order. `effect` is this fragment's
    // dispatch key; `note` is what the player reads in the picker and, condensed, on the row.
    api.FORTUNES = {
      'Benten': {
        effect: 'tn', skill: api.BENTEN_SKILL, tn: api.BENTEN_TN,
        note: 'The Fortune of Romance has turned from you: Etiquette rolls are harder, TN +10.',
      },
      'Bishamon': {
        effect: 'deferred',
        note: 'The Fortune of Strength withholds it: your Strength counts for one rank less when ' +
          'it contributes to weapon damage. Not yet automated by this sheet — see the row.',
      },
      'Daikoku': {
        effect: 'skillAndKoku', skill: api.DAIKOKU_SKILL,
        note: 'The Fortune of Wealth disfavours you: −1k1 on Commerce, and your School’s ' +
          'starting outfit carries one koku less.',
      },
      'Ebisu': {
        effect: 'declare',
        declareHead: 'Ebisu',
        declareLabel: 'Interacting with non-samurai citizens of Rokugan (−1k1 on this roll)',
        note: 'The Fortune of Honest Work is displeased: −1k1 on Social Skill Rolls when you deal ' +
          'with non-samurai citizens of Rokugan. You declare it per roll; the sheet tracks no NPCs.',
      },
      'Fukurokujin': {
        effect: 'tn', skill: 'Lore', tn: api.FUKUROKUJIN_TN, lore: true,
        note: 'The Fortune of Wisdom withholds it: Lore rolls are harder, TN +5. Applies to your ' +
          'Lore specializations too.',
      },
      'Hotei': {
        effect: 'deferred', award: api.AWARD_HOTEI,
        note: 'The Fortune of Contentment burdens you: activations that would cost one Void Point ' +
          'cost two. Worth 6 points, not 3. Not yet automated by this sheet — see the row.',
      },
      'Jurojin': {
        effect: 'declare',
        declareHead: 'Jurojin',
        declareLabel: 'Resisting poison or disease (−2k0 on this roll)',
        note: 'The Fortune of Longevity has abandoned you: −2k0 when you resist poison or disease. ' +
          'You declare it per roll; the sheet does not decide when you have been poisoned.',
      },
    };

    api.fortuneNames = function(){ return Object.keys(api.FORTUNES); };
    api.fortuneOf = function(config){
      const text = config && typeof config.fortune === 'string' ? config.fortune.trim() : '';
      return Object.prototype.hasOwnProperty.call(api.FORTUNES, text) ? text : null;
    };
    api.spec = function(fortune){ return api.FORTUNES[fortune] || null; };

    // ---------- The D45 definition ----------
    // `fortunePick` is a new configTypes string, added the way Feature 4.5.10 added `realmPick`:
    // the exact-array assertions in the other phases' harnesses are CONDITIONAL on the adding
    // phase being present, so they read correctly both with this fragment and without it.
    api.definition = {
      type: 'fortunePick',
      steps: function(){
        return [{ field:'fortune', label:'Choose the Fortune whose curse has fallen on you',
          options: api.fortuneNames().map(function(name){
            return { value:name, label:name, note:api.FORTUNES[name].note };
          }) }];
      },
      validate: function(config){
        if(!config || config.type !== 'fortunePick') return false;
        return api.fortuneOf(config) !== null;
      },
      finalize: function(config){
        // D45.confirm() composes the legacy `value` display field from
        // tenet||element||target||tier||('Rank '+rank), none of which this entry has. Without this
        // the field reads 'Rank undefined' -- the hook Features 4.5.8, 4.5.9 and 4.5.10 all needed.
        config.value = api.fortuneOf(config) || '';
      },
      resolve: function(config){
        const fortune = api.fortuneOf(config);
        if(fortune === null) return null;
        const spec = api.spec(fortune);
        return {
          // Hotei is the sourcebook's own 6-point exception. Reading the award off the spec keeps
          // that single fact in one place rather than as a condition here and a check there.
          cost: typeof spec.award === 'number' ? spec.award : api.AWARD,
          fortune: fortune, fortuneEffect: spec.effect, fortuneNote: spec.note,
          cursedFortune: true,
          summary: fortune + ' — ' + spec.note,
        };
      },
      decorate: function(div, row, config, effect){ api.decorateRow(div, row, config, effect); },
    };

    api.isFortune = function(effect){ return !!(effect && effect.cursedFortune === true); };
    // D45.active() is called with NO name, and the filter is this phase's own `cursedFortune` flag
    // -- which only this fragment's resolve() sets, so it identifies the entry more precisely than
    // its name does. Feature 4.5.10 passes its name as well; that is belt-and-braces there and
    // would be a BUG here. See measurement 7: D45.active(name) compares norm(effect.name) to
    // norm(name), and norm() does not fold apostrophes, so an entry the player typed with a
    // straight quote resolves to a straight-quoted effect.name and would silently fail the
    // comparison against this phase's curly NAME. Filtering on the flag is immune to the spelling.
    api.active = function(){
      if(!api.enabled() || typeof D45 !== 'object' || !D45 || typeof D45.active !== 'function') return [];
      return D45.active().filter(function(item){ return api.isFortune(item.effect); });
    };
    api.activeOf = function(fortune){
      return api.active().filter(function(item){ return item.effect.fortune === fortune; });
    };

    // ---------- Ebisu and Jurojin: fresh per-roll declarations ----------
    // Keyed by Fortune rather than a single flag, because BOTH can be offered on one roll: a
    // character carrying two Seven Fortunes' Curse entries can hold Ebisu and Jurojin at once, and
    // an Etiquette roll made to resist a poisoner's persuasion is a roll where both are in scope.
    // Like Feature 4.5.10's, they are deliberately transient -- cleared when the preview opens and
    // when it is cancelled, and never written to the config, so they cannot round-trip through a
    // save and leave a blanket penalty armed. The audit is explicit that they must not.
    const declared = {};
    api.declarationPending = function(fortune){ return declared[fortune] === true; };
    api.declarationReset = function(){
      Object.keys(declared).forEach(function(key){ delete declared[key]; });
    };
    api.declarationSet = function(fortune, checked){
      if(!Object.prototype.hasOwnProperty.call(api.FORTUNES, fortune)) return;
      if(checked === true) declared[fortune] = true; else delete declared[fortune];
    };

    // Which declarations this roll should offer. Ebisu is scoped by 4.5.2's Social Skill list;
    // Jurojin is offered on any non-damage roll, because the sourcebook does not state which roll
    // resists a poison and choosing one here would be inventing rules content. That is the same
    // call Feature 4.5.10 made for Maigo no Musha, and the same one it made for Jigoku.
    api.declarationsOffered = function(context){
      if(!api.enabled() || !context) return [];
      if(typeof ROLL_KINDS !== 'object' || !ROLL_KINDS) return [];
      if(context.kind === ROLL_KINDS.DAMAGE) return [];
      const skillish = context.kind === ROLL_KINDS.SKILL || context.kind === ROLL_KINDS.ATTACK;
      const skillName = typeof context.skillName === 'string' ? context.skillName.trim() : '';
      const out = [];
      if(api.activeOf('Ebisu').length > 0 && skillish && api.isSocialSkill(skillName)){
        out.push({ fortune:'Ebisu', head:api.FORTUNES['Ebisu'].declareHead,
          label:api.FORTUNES['Ebisu'].declareLabel });
      }
      if(api.activeOf('Jurojin').length > 0){
        out.push({ fortune:'Jurojin', head:api.FORTUNES['Jurojin'].declareHead,
          label:api.FORTUNES['Jurojin'].declareLabel });
      }
      return out;
    };

    // Reads Feature 4.5.2's list rather than declaring a second one. See measurement 1. If that
    // fragment is ever removed the list is gone, and this returns false -- Ebisu then offers
    // nothing rather than guessing, which is the safe direction to fail in.
    api.isSocialSkill = function(skillName){
      if(typeof D45 !== 'object' || !D45 || !Array.isArray(D45.socialSkills)) return false;
      const target = String(skillName || '').trim().toLowerCase();
      if(!target) return false;
      return D45.socialSkills.some(function(name){
        return String(name).trim().toLowerCase() === target;
      });
    };

    api.isLoreSkill = function(skillName){
      return api.LORE_RE.test(String(skillName || '').trim());
    };

    // ---------- The roll modifiers ----------
    // Reached through D45.modules, so DAMAGE never arrives here at all (measurement 3).
    api.modifiers = function(context){
      if(!api.enabled() || !context) return [];
      if(typeof ROLL_KINDS !== 'object' || !ROLL_KINDS) return [];
      if(context.kind === ROLL_KINDS.DAMAGE) return [];   // belt and braces; see FORTUNE4511-DAMAGE-01
      const out = [];
      const skillish = context.kind === ROLL_KINDS.SKILL || context.kind === ROLL_KINDS.ATTACK;
      const skillName = typeof context.skillName === 'string' ? context.skillName.trim() : '';

      api.active().forEach(function(item){
        const effect = item.effect;

        // Benten and Fukurokujin -- the TN-reporting convention, third and fourth consumers after
        // Doubt and Tengoku. The note carries the RULE rather than a bare number, which the
        // convention requires: a player reading '-10' alone cannot tell it from a dice penalty.
        if(effect.fortuneEffect === 'tn' && skillish){
          const spec = api.spec(effect.fortune);
          const hit = spec.lore ? api.isLoreSkill(skillName)
            : skillName.toLowerCase() === String(spec.skill).toLowerCase();
          if(hit){
            out.push({ source:'adv-config', label:api.NAME,
              totalDelta:-spec.tn,
              note:effect.fortune + ' — ' + spec.skill + ' (TN +' + spec.tn + ')' });
          }
        }

        // Daikoku -- always on, one named Skill. Its koku half is a row reminder, never a debit.
        if(effect.fortuneEffect === 'skillAndKoku' && skillish &&
           skillName.toLowerCase() === api.DAIKOKU_SKILL.toLowerCase()){
          out.push({ source:'adv-config', label:api.NAME,
            rolledDelta:-1, keptDelta:-1,
            note:'Daikoku — ' + api.DAIKOKU_SKILL });
        }

        // Ebisu -- only when declared on this roll, and only on a Social Skill Roll.
        if(effect.fortune === 'Ebisu' && declared['Ebisu'] &&
           skillish && api.isSocialSkill(skillName)){
          out.push({ source:'adv-config', label:api.NAME,
            rolledDelta:-1, keptDelta:-1,
            note:'Ebisu — declared, non-samurai' });
        }

        // Jurojin -- only when declared on this roll. -2k0: two fewer dice ROLLED, same kept.
        if(effect.fortune === 'Jurojin' && declared['Jurojin']){
          out.push({ source:'adv-config', label:api.NAME,
            rolledDelta:-2, keptDelta:0,
            note:'Jurojin — declared, resisting poison or disease' });
        }
      });
      return out;
    };

    // ---------- The configured row ----------
    api.decorateRow = function(div, row, config, effect){
      if(!api.enabled() || !row || !api.isFortune(effect)) return;

      const badge = document.createElement('span');
      // `fortune4511-eff-<effect>` rather than `fortune4511-<effect>`. Feature 4.5.10 shipped the
      // unprefixed form and it COLLIDED -- one of its effect keys was also a control class name,
      // so the control's rules landed on the badge. The `eff-` segment keeps the modifier
      // namespace closed, so no future effect key can collide with a control class here.
      badge.className = 'fortune4511-badge fortune4511-eff-' + effect.fortuneEffect;
      badge.textContent = effect.fortune;
      row.appendChild(badge);

      if(effect.fortuneEffect === 'skillAndKoku'){
        // The money half. A reminder, never a debit -- see measurement 4. It states the rule rather
        // than a number, because this sheet holds no starting-koku figure to subtract one from:
        // the School's starting koku lives only in free text inside its outfit description.
        const note = document.createElement('span');
        note.className = 'fortune4511-note';
        note.textContent = 'Starting outfit: one koku less — adjust when you record it. ' +
          'This sheet does not change your koku.';
        row.appendChild(note);
      }

      if(effect.fortuneEffect === 'deferred'){
        // Jigoku's shape, from Feature 4.5.10: the entry is recorded and priced correctly, and the
        // gap is named on the row rather than hidden behind a badge that implies automation.
        const note = document.createElement('span');
        note.className = 'fortune4511-note fortune4511-note-deferred';
        note.textContent = effect.fortune === 'Hotei'
          ? 'Recorded at 6 points. This sheet does not yet double your Void costs — apply it at the table.'
          : 'Recorded. This sheet does not yet reduce your Strength contribution to damage — apply it at the table.';
        row.appendChild(note);
      }
    };

    return api;
  })();

  // ---------- Ebisu's and Jurojin's hooks into Phase 3's roll preview ----------
  // FUNCTION DECLARATIONS on purpose, not const -- the same reason Feature 4.5.10 gives: Phase 3's
  // fragment (208) is ordered BEFORE this one and guards each call with `typeof fn === 'function'`.
  // A declaration is hoisted across the whole IIFE so the guard reads true whenever a preview
  // opens; a `const` would sit in the temporal dead zone and make the `typeof` test itself throw.
  // Deleting this fragment leaves the identifier simply undeclared, where `typeof` returns
  // 'undefined' rather than throwing -- which is what lets Phase 3 degrade with no edit of its own.
  //
  // These handle a LIST rather than one declaration, so both Fortunes ride one set of blocks and
  // D04b needs none. See measurement 6 for why the generic registry is not built here.
  function fortune4511PreviewStart(context){
    if(typeof F4511 === 'object' && F4511) F4511.declarationReset();
  }
  function fortune4511PreviewCancel(){
    if(typeof F4511 === 'object' && F4511) F4511.declarationReset();
  }
  function fortune4511PreviewToggle(fortune, checked){
    if(typeof F4511 === 'object' && F4511) F4511.declarationSet(fortune, checked);
  }
  function fortune4511PreviewHtml(context){
    if(typeof F4511 !== 'object' || !F4511) return '';
    const offered = F4511.declarationsOffered(context);
    if(!offered.length) return '';
    return offered.map(function(item){
      const checked = F4511.declarationPending(item.fortune) ? ' checked' : '';
      return '<div class="fortune4511-declare">' +
        '<div class="fortune4511-declare-head">Seven Fortunes’ Curse — ' + item.head + '</div>' +
        '<label class="fortune4511-declare-opt"><input type="checkbox" data-fortune4511-declare="' +
        item.fortune + '"' + checked + '><span>' + item.label + '</span></label>' +
        '<div class="fortune4511-declare-note">Declared for this roll only.</div></div>';
    }).join('');
  }

  if(F4511.enabled() && typeof D45 === 'object' && D45 && typeof D45.install === 'function'){
    D45.install(F4511.NAME, F4511.definition);

    // Installed a SECOND time under the straight-apostrophe spelling, pointing at the same
    // definition object. See measurement 7: this is the first entry ever installed through
    // D45.install() whose catalogue name contains a curly apostrophe, and D45's own norm() only
    // trims and lowercases -- so D45.schema() would not find this entry for a player who typed
    // its name with a straight quote into what is a free-text field. Phase 4.5's own separate
    // lookup has folded apostrophes since it was built, for exactly the reason its comment gives:
    // an entry must not silently fail to be configurable because of which quote character was
    // typed. This keeps the fix inside this fragment rather than editing 4.5.2's norm(), which
    // would change name matching for eleven other entries from inside a feature release. The
    // underlying D45 gap is declared in this phase's ROLLBACK as wanting its own one-line fix.
    if(F4511.NAME.indexOf('’') !== -1){
      D45.install(F4511.NAME.replace(/’/g, '\''), F4511.definition);
    }

    // The array is frozen, so this REPLACES it rather than pushing. Removing this fragment leaves
    // whatever the phases below it froze as the last word, with no dangling state -- which is what
    // makes the conditional assertions in the other phases' harnesses read correctly in both builds.
    if(Array.isArray(D45.configTypes) && D45.configTypes.indexOf('fortunePick') === -1){
      D45.configTypes = Object.freeze(D45.configTypes.concat('fortunePick'));
    }

    // NO registry seat, and nothing re-registered: D45.modules is consulted generically by
    // D45.modifiers(), which the single existing 'adv-config' contributor already reaches. This is
    // the route Feature 4.5.10 established and the one its own notes say future entries should
    // prefer. Deleting this fragment deletes the key with it.
    if(D45.modules && typeof D45.modules === 'object'){
      D45.modules.fortune4511 = { modifiers: function(context){ return F4511.modifiers(context); } };
    }
  }
