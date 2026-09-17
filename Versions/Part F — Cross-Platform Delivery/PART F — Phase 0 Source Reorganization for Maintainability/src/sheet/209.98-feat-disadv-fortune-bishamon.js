  // ================= PART I FEATURE 4.5.12 — Seven Fortunes' Curse: Bishamon (D04b) =========
  // D04's sixth branch, and the FIRST 4.5.x entry that cannot use the pre-roll modifier
  // pipeline at all. Everything below follows from seven measurements taken before a line was
  // written; the first one overturned the design this phase was scoped with.
  //
  // 1. A PRE-ROLL MODIFIER CANNOT IMPLEMENT THIS, AND FAILS SILENTLY IF YOU TRY.
  //    rollWeaponDamage() (100-dice-engine.js) does NOT call applyPreRollModifiers(). It rolls
  //    getWeaponDamageDice()'s numbers directly, then consults the pipeline AFTERWARDS, in
  //    attachArrowDamageBreakdown(), purely to decorate the already-rendered modal. Measured by
  //    registering a probe returning a real -3k-1 for ROLL_KINDS.DAMAGE and rolling a katana:
  //    the modal PRINTED 'PROBE: -3k-1' and the dice rolled the full, unreduced 5k2. A modifier
  //    would show the player a penalty their dice never received, and would satisfy any harness
  //    that only asked getPreRollModifiers(). So this phase reduces the STRENGTH CONTRIBUTION
  //    inside the damage maths instead -- which is also what the audit asks for in rules terms:
  //    'reduce the character's Strength contribution ... do not subtract a die from every damage
  //    roll indiscriminately.'
  //
  // 2. IT TAKES NO REGISTRY SEAT AND REGISTERS NOTHING. A consequence of 1, and a better
  //    position than Features 4.5.9/4.5.10/4.5.11 could reach: the pipeline is not involved, so
  //    Phase 1.5's baseline of seven contributors is untouched by construction rather than by
  //    care. Measured at 7 with this fragment present.
  //
  // 3. ACTUAL STRENGTH MUST NOT MOVE, AND THE WATER RING IS WHY. Measured: dropping Strength
  //    2 -> 1 moves the Water Ring 2 -> 1 on the live sheet. The audit forbids lowering actual
  //    Strength; the reduction therefore lives entirely in one local variable inside one
  //    function, and the Trait input is never written. Attack rolls are unaffected for a second,
  //    independent reason -- getWeaponAttackDice('Kenjutsu') rolls AGILITY, measured.
  //
  // 4. THE THREE TRAIT BRANCHES ARE ALREADY SEPARATE, WHICH IS WHY THIS IS CHEAP. Section 3 of
  //    getWeaponDamageDice() splits exactly the three ways the audit asks to be checked
  //    separately, and this fragment reads `traitName` to tell them apart:
  //      - 'Bow Strength'  -> traitValue = Math.min(entry.bowStrength, Strength). REDUCED, but
  //                           inside the min(), so a bow whose own rating already binds loses
  //                           nothing. Measured: Han-kyu (rating 1) reads traitValue 1 at every
  //                           Strength from 1 to 5, so Bishamon never changes it; Yumi (rating 3)
  //                           stops changing at Strength 4+. A blanket -1k0 would be wrong on
  //                           precisely these weapons.
  //      - 'Strength'      -> ordinary melee, thrown, AND UNARMED. Unarmed carries no dmgTrait
  //                           key at all, and the branch test is `entry.dmgTrait !== null`, so
  //                           `undefined !== null` sends it here and `dmgTrait || 'Strength'`
  //                           names it. Measured: traitName 'Strength', pool 2k1 at Strength 2.
  //                           That settles the audit's 'check unarmed eligibility separately'.
  //      - 'Perception'    -> Pistol and Musket. NOT reduced: this is not the Strength
  //                           contribution. Measured from the library, not assumed.
  //      - null            -> Cannon, Blowgun, Nageteppo. Flat DR, no Trait added, nothing to
  //                           reduce. The hook returns null and the pool is untouched.
  //
  // 5. THE FLOOR IS A MEASURED DECISION FROM THIS SHEET, NOT A SOURCE CITATION. The sourcebook
  //    does not say what 'one rank lower' means at Strength 1. Measured: #trait_strength has
  //    min="1", so actual Strength is never 0 here; and an effective Strength of 0 makes an
  //    unarmed strike roll 0k1, which rollWeaponDamage() REFUSES to roll at all ('has no damage
  //    dice to roll'). A curse that presents as a broken sheet is worse than a curse that does
  //    nothing, so the effective value floors at MIN_EFFECTIVE_STRENGTH. The consequence is
  //    stated plainly on the row and pinned by F4512-FLOOR-01: at Strength 1, Bishamon costs
  //    nothing on damage. Feature 4.5.8 reached its element list the same way -- a measured
  //    decision from the sheet's own data, which is the one thing here a rulebook could overturn.
  //
  // 6. IT NEEDS NO EDIT TO FEATURE 4.5.11, WHICH OWNS THE ENTRY. Measured: F4511.FORTUNES is a
  //    plain mutable object read live by api.spec(), and definition.decorate reaches
  //    api.decorateRow by PROPERTY LOOKUP at call time. So retuning Bishamon's spec and wrapping
  //    the decorator both work from here -- Feature 4.5.3's pattern, keeping the previous binding
  //    and delegating to it. Changing the effect key away from 'deferred' also makes 4.5.11's own
  //    'not yet automated' note stop rendering and its quiet dashed badge treatment
  //    (.fortune4511-eff-deferred) stop matching, both without touching that file. That is
  //    Feature 4.5.10's Yomi lesson used deliberately rather than hit by omission.
  //
  // 7. DUPLICATES STACK, INHERITED RATHER THAN INVENTED. 4.5.11's modifiers() pushes one entry
  //    per active row, so two Benten rows already stack on this very entry. Bishamon matches that
  //    observable behaviour -- one rank per active Bishamon row -- rather than introducing a
  //    second rule for the same catalogue entry. The floor bounds it, so no number of rows can
  //    produce an unrollable pool. Pinned by F4512-STACK-01.
  //
  // Kill-switch: DISADV_BISHAMON_ENABLED = false stops the install, leaves Bishamon exactly as
  // Feature 4.5.11 shipped it (deferred, with that phase's own honest row note), and makes the
  // damage hook a no-op. Nothing else changes.
  const DISADV_BISHAMON_ENABLED = true;

  const F4512 = (function(){
    const api = {};

    api.FORTUNE = 'Bishamon';
    api.EFFECT = 'damageStrength';          // replaces 4.5.11's 'deferred' for this one Fortune
    api.PENALTY_PER_ENTRY = 1;              // 'one effective rank'
    api.MIN_EFFECTIVE_STRENGTH = 1;         // measurement 5 -- change this line to change the floor
    api.STRENGTH_TRAIT = 'Strength';
    api.BOW_TRAIT = 'Bow Strength';         // the label getWeaponDamageDice() gives the bow branch

    api.NOTE = 'The Fortune of Strength withholds it: your Strength counts for one rank less ' +
      'when it contributes to weapon damage. Melee, thrown and unarmed are affected; a bow is ' +
      'affected only while your Strength, not its own rating, is the limit. Perception weapons ' +
      'and flat-damage weapons are not affected.';

    api.enabled = function(){ return DISADV_BISHAMON_ENABLED === true; };

    // Is Feature 4.5.11 present and usable? Every read below goes through this, so removing that
    // phase makes this one inert rather than broken -- the soft dependency its ROLLBACK declares.
    api.host = function(){
      return (typeof F4511 === 'object' && F4511 && typeof F4511.active === 'function') ? F4511 : null;
    };

    // How many configured rows carry Bishamon. Reads 4.5.11's own active() list rather than
    // walking the DOM, so the two phases cannot disagree about what counts as configured.
    api.count = function(){
      const host = api.host();
      if(!api.enabled() || !host) return 0;
      return host.active().filter(function(item){
        return item.effect && item.effect.fortune === api.FORTUNE;
      }).length;
    };

    api.applies = function(){ return api.count() > 0; };

    // The whole rule, in one place: actual Strength in, effective Strength for weapon damage out.
    api.effectiveStrength = function(actual){
      const base = parseInt(actual, 10) || 0;
      if(!api.applies()) return base;
      return Math.max(api.MIN_EFFECTIVE_STRENGTH, base - (api.PENALTY_PER_ENTRY * api.count()));
    };

    // Called from the one delimited block in 100-dice-engine.js, AFTER its section 3 has chosen
    // the branch and computed traitValue. Returns null to leave the pool exactly as it was --
    // which is the answer for Perception weapons, flat-DR weapons, Strength 1, and a bow whose
    // own rating already caps below the reduced Strength.
    //
    // Only `numDice` can move. Strength reaches the damage pool through `numDice += traitValue`
    // and never touches the kept dice, so reducing it is a rolled-dice change by construction.
    api.adjustDamage = function(entry, traitName, traitValue){
      if(!api.applies()) return null;
      if(traitName !== api.STRENGTH_TRAIT && traitName !== api.BOW_TRAIT) return null;

      const had = parseInt(traitValue, 10) || 0;
      let now;
      if(traitName === api.BOW_TRAIT){
        // Re-derive the cap with the reduced Strength. getWeaponDamageDice() computed
        // min(bowStrength, actualStrength); this is min(bowStrength, effectiveStrength), so a bow
        // already limited by its own rating comes out unchanged and returns null below.
        const rating = (entry && entry.bowStrength !== undefined && entry.bowStrength !== null)
          ? (parseInt(entry.bowStrength, 10) || 0) : 0;
        now = Math.min(rating, api.effectiveStrength(getTraitValueByName(api.STRENGTH_TRAIT)));
      } else {
        now = api.effectiveStrength(had);
      }

      const lost = had - now;
      if(lost <= 0) return null;
      return {
        traitValue: now,
        rolledDelta: -lost,
        note: 'Bishamon: ' + traitName + ' counts as ' + now + ' rather than ' + had +
          ' for damage (−' + lost + 'k0).',
      };
    };

    // ---------- Taking Bishamon over from Feature 4.5.11 ----------
    // Measurement 6. Mutates that phase's spec for this ONE Fortune and wraps its decorator,
    // keeping the previous binding. Idempotent: install() runs once even if called again, so a
    // second call cannot wrap the wrapper and print the note twice.
    api.installed = false;
    api.install = function(){
      if(api.installed || !api.enabled()) return false;
      const host = api.host();
      if(!host || !host.FORTUNES || !host.FORTUNES[api.FORTUNE]) return false;

      const spec = host.FORTUNES[api.FORTUNE];
      api.previousEffect = spec.effect;     // 'deferred', recorded so removal is describable
      api.previousNote = spec.note;
      spec.effect = api.EFFECT;
      spec.note = api.NOTE;

      const prev = host.decorateRow;
      host.decorateRow = function(div, row, config, effect){
        if(typeof prev === 'function') prev.call(host, div, row, config, effect);
        api.decorateRow(row, effect);
      };
      api.installed = true;
      return true;
    };

    // This phase's own row note. Says what is happening to the dice, and says so HONESTLY when
    // the answer is 'nothing' -- a badge implying a penalty that the floor has cancelled would be
    // exactly the kind of quiet lie the deferred note it replaces was written to avoid.
    api.decorateRow = function(row, effect){
      if(!api.enabled() || !row || !effect || effect.fortune !== api.FORTUNE) return;
      if(effect.fortuneEffect !== api.EFFECT) return;

      const actual = getTraitValueByName(api.STRENGTH_TRAIT);
      const eff = api.effectiveStrength(actual);
      const note = document.createElement('span');
      note.className = 'fortune4512-note';
      note.textContent = (eff < actual)
        ? 'Weapon damage uses Strength ' + eff + ' instead of ' + actual +
          '. Bows only while your Strength is the limit; Perception and flat-damage weapons are unaffected.'
        : 'Strength ' + actual + ' is already the lowest this sheet allows, so this curse is ' +
          'costing you nothing on damage right now.';
      row.appendChild(note);
    };

    return api;
  })();

  // The trunk-side entry point. A plain function declaration so it is HOISTED: the delimited
  // block that calls it sits in 100-dice-engine.js, far above this fragment in build order, and
  // hoisting is what makes the guarded `typeof` check there see a function at all. With this
  // fragment removed the identifier does not exist, and `typeof` on an undeclared identifier is
  // safe rather than a ReferenceError -- the guard pattern CLAUDE.md requires.
  function fortuneBishamonAdjustDamage(entry, traitName, traitValue){
    if(typeof F4512 !== 'object' || !F4512) return null;
    return F4512.adjustDamage(entry, traitName, traitValue);
  }

  // Appends one .roll-note to the damage modal naming the reduction, so the shorter pool is not
  // unexplained. Reads the breakdown line getWeaponDamageDice() already recorded rather than
  // recomputing anything, so the note and the dice cannot disagree -- which is the whole failure
  // mode this phase was built to avoid, applied to its own display.
  function fortuneBishamonDamageRollNote(dmg){
    if(typeof F4512 !== 'object' || !F4512 || !F4512.enabled() || !F4512.applies()) return;
    if(!dmg || !Array.isArray(dmg.breakdown)) return;
    const line = dmg.breakdown.filter(function(t){ return /^Bishamon:/.test(String(t)); })[0];
    if(!line) return;                       // the curse applied to no part of THIS weapon's pool
    const body = document.getElementById('rollModalBody');
    if(!body) return;
    const note = document.createElement('div');
    note.className = 'roll-note fortune4512-roll-note';
    note.textContent = line;
    body.appendChild(note);
  }

  // Installed at fragment-evaluation time, the same point Feature 4.5.11 installs its own entry:
  // that fragment is concatenated above this one, so F4511.FORTUNES is fully built by here. This
  // is the only line that changes another phase's behaviour, and removing this fragment removes
  // it, leaving Bishamon exactly as 4.5.11 shipped it.
  if(DISADV_BISHAMON_ENABLED && typeof F4511 === 'object' && F4511){
    F4512.install();
  }
  // ================= END PART I FEATURE 4.5.12 ==============================================
