  // ========= PART I FEATURE 4.59: DOUBT =========
  //
  // D03. The first build of the project owner's approved TN-REPORTING CONVENTION, which is why
  // this entry is worth more than its one catalogue row: D04's Benten and Fukurokujin branches
  // reuse the same machinery, so it is built here on the simplest consumer there is.
  //
  // THE CONVENTION, as approved: represent a rule's "TN +N" as "-N to the reported total", for
  // Ring, Trait, Skill, spell-casting and attack rolls only, NEVER for damage. Keep the real rule
  // visible rather than printing a bare number. The equivalence is `R >= T + N` iff `R - N >= T`,
  // so the sheet never needs to know T -- and where it DOES know T, it must apply the adjustment
  // once and once only: an adjusted total against the ORIGINAL TN, never an adjusted total
  // against a raised one. Routing through totalDelta gets that for free, because showRollResult()
  // compares the adjusted total against currentRollTN, which is the original.
  //
  // FOUR THINGS WERE MEASURED BEFORE ANY OF THIS WAS WRITTEN, and two of them changed it.
  //
  // 1. A DAMAGE CONTEXT CARRIES skillName. Driven live: makeRollContext(DAMAGE,{skillName}) keeps
  //    it, and computeDamage() sets it from the weapon. So a modifier that filtered on the skill
  //    name ALONE would penalise the damage roll that follows an affected attack -- exactly what
  //    the audit forbids, and it would have looked correct in review. The kind check below is
  //    load-bearing, not defensive tidiness, and DOUBT459-DAMAGE-01 exists for it specifically.
  //
  // 2. A SPELL CONTEXT CARRIES NO skillName AT ALL -- measured: its keys are exactly
  //    ['kind','round']. The convention lists spell-casting among the eligible roll kinds in
  //    general, but Doubt is scoped to a chosen School Skill, and a spell roll offers no skill to
  //    match. So this entry cannot reach a casting roll, and that is a property of the pipeline
  //    rather than a rule this phase enforces. Stated rather than implied, because "we support
  //    spell rolls" would be a claim this cannot honour.
  //
  // 3. RE-REGISTERING 'adv-config' REPLACES ITS SEAT RATHER THAN ADDING ONE. registerPreRollModifier
  //    overwrites an entry with a matching id, so wrapping Phase 4.5's own contributor keeps the
  //    registry at SEVEN. Phase 1.5 (Part G) baselined that registry and its length is asserted
  //    across several suites, so taking an eighth seat would have needed the owner's ruling all
  //    over again. A plain `const prev = advConfigRollModifiers` wrapper would NOT have worked:
  //    the registry captured the function reference at registration, so reassigning the
  //    identifier afterwards changes nothing. Re-registering is the supported way in.
  //
  // 4. A STALE SKILL KEEPS ITS AWARD AND STOPS APPLYING. Feature 4.5.3 established that this
  //    project does not silently reprice a saved character; zeroing Doubt's 4 XP because the
  //    player changed School would do exactly that, days after the XP was spent. So the award is
  //    retained, the -5 STOPS (its precondition genuinely fails -- the Skill is no longer a
  //    School Skill), and the row says so in terms the player can act on. That is the one place
  //    this entry deliberately diverges from Consumed: Insight, which drops to 0.
  const DISADV_DOUBT_ENABLED = true;

  const R459 = (function(){
    const api = {};
    api.enabled = function(){ return DISADV_DOUBT_ENABLED; };
    api.NAME = 'Doubt';
    api.AWARD = 4;
    api.TN_INCREASE = 5;

    api.skillOf = function(config){
      const text = config && typeof config.skill === 'string' ? config.skill.trim() : '';
      return text || null;
    };

    api.schoolSkills = function(){
      if(typeof D45 !== 'object' || !D45 || typeof D45.state !== 'function') return [];
      const list = D45.state().schoolSkills;
      return Array.isArray(list) ? list : [];
    };

    api.isCurrentSchoolSkill = function(skill){
      return !!skill && api.schoolSkills().indexOf(skill) !== -1;
    };

    // ---------- The D45 definition ----------
    // `skillPick` rather than a new type string: the stored shape IS Great Potential's
    // ({type:'skillPick', skill:'...'}), the string is already in D45.configTypes, and Feature
    // 4.5.8 established that adding to that array breaks 4.5.2's exact-array check with no
    // fixture correction able to span both builds.
    api.definition = {
      type: 'skillPick',
      steps: function(){
        return [{ field: 'skill', label: 'Choose one of your School Skills',
          options: api.schoolSkills().map(function(name){ return { value: name, label: name }; }) }];
      },
      // Lenient by design -- see note 4 above. Completeness means "a Skill was chosen", not
      // "that Skill is still a School Skill today".
      validate: function(config){ return api.skillOf(config) !== null; },
      finalize: function(config){
        // D45.confirm() composes the legacy display field from tenet||element||target||tier||rank,
        // and this entry has none of those. Without this it would read 'Rank undefined'.
        config.value = api.skillOf(config) || '';
      },
      resolve: function(config){
        const skill = api.skillOf(config);
        if(skill === null) return null;
        const stale = !api.isCurrentSchoolSkill(skill);
        return {
          cost: api.AWARD, skill: skill, stale: stale, tnIncrease: api.TN_INCREASE, doubt: true,
          summary: stale
            ? skill + ' is no longer one of your School Skills, so the required Raise is NOT being ' +
              'applied. Your ' + api.AWARD + ' XP is kept — re-pick a current School Skill to restore it.'
            : 'Every roll using ' + skill + ', including a weapon attack with it, requires one extra ' +
              'Raise for no benefit: TN +' + api.TN_INCREASE + ', shown as ' + api.TN_INCREASE +
              ' off the reported total. Raise limits and any other Raises you declare still apply.',
        };
      },
      decorate: function(div, row, config, effect){ api.decorateRow(row, effect); },
    };

    api.isDoubt = function(effect){ return !!(effect && effect.doubt === true); };

    api.active = function(){
      if(!api.enabled() || typeof D45 !== 'object' || !D45 || typeof D45.active !== 'function') return [];
      return D45.active(api.NAME).filter(function(item){ return api.isDoubt(item.effect); });
    };

    api.decorateRow = function(row, effect){
      if(!api.enabled() || !row || !api.isDoubt(effect)) return;
      const badge = document.createElement('span');
      badge.className = 'doubt459-badge' + (effect.stale ? ' doubt459-stale' : '');
      // Deliberately just "TN +5", not "(reported total -5)" -- the roll preview and result
      // already show the adjusted total right next to the rule (see api.modifiers' note below),
      // so restating the equivalence here only added width to a row that does not need it.
      // Reported on a real device: the bracket text made this badge the widest thing on the row.
      badge.textContent = effect.stale
        ? effect.skill + ' — not a current School Skill'
        : effect.skill + ' — TN +' + effect.tnIncrease;
      row.appendChild(badge);
    };

    // ---------- The roll modifier ----------
    // Kind FIRST, name second. Reversing those two lines is the bug described in note 1.
    api.appliesTo = function(context){
      if(!api.enabled() || !context) return false;
      if(typeof ROLL_KINDS !== 'object' || !ROLL_KINDS) return false;
      // Skill rolls and weapon attacks made with the Skill. Damage is excluded even though its
      // context carries the same skillName, and so is every other kind.
      if(context.kind !== ROLL_KINDS.SKILL && context.kind !== ROLL_KINDS.ATTACK) return false;
      return typeof context.skillName === 'string' && context.skillName.trim() !== '';
    };

    api.modifiers = function(context){
      if(!api.appliesTo(context)) return [];
      const name = context.skillName.trim();
      const out = [];
      api.active().forEach(function(item){
        const effect = item.effect;
        if(effect.stale || effect.skill !== name) return;
        out.push({
          source: 'adv-config', label: api.NAME,
          totalDelta: -api.TN_INCREASE,
          // The breakdown prints "-5 to total — <note>", so the note carries the RULE. The
          // convention is explicit that a bare number is not enough: a required Raise is a
          // required Raise, and a player reading only "-5" would not know a Raise was consumed.
          // Kept SHORT deliberately -- reported live as too dense/squished in both the roll
          // preview (Phase 3's .rp-mod) and the roll result (the trunk's .roll-mod-item), which
          // this phase does not own the layout of. The Raise-limit caveat that used to trail this
          // sentence is still true and still stated, just once, in the row's own summary text
          // rather than repeated on every single roll.
          note: 'required Raise, no benefit (TN +' + api.TN_INCREASE + ')',
        });
      });
      return out;
    };

    return api;
  })();

  if(R459.enabled() && typeof D45 === 'object' && D45 && typeof D45.install === 'function'){
    D45.install(R459.NAME, R459.definition);

    // Re-register Phase 4.5's OWN seat rather than taking a new one -- see note 3. The previous
    // function is captured and delegated to, so every earlier 4.5 roll effect still contributes
    // first and this only appends. Removing this fragment leaves 209.8's own registration as the
    // last word, restoring the original contributor with no dangling state.
    if(typeof registerPreRollModifier === 'function' && typeof PREROLL_MODIFIER_REGISTRY !== 'undefined'){
      const r459Seat = PREROLL_MODIFIER_REGISTRY.find(function(m){ return m.id === 'adv-config'; });
      const r459Prev = r459Seat && r459Seat.fn;
      if(typeof r459Prev === 'function'){
        registerPreRollModifier('adv-config', r459Seat.priority, function(context){
          const before = r459Prev(context) || [];
          return (Array.isArray(before) ? before : [before]).concat(R459.modifiers(context));
        });
      }
    }
  }
