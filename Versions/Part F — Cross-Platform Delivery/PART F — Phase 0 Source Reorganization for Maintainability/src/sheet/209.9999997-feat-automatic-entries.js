  // ========= PART I FEATURE 4.5.30: AUTOMATIC ROLL ENTRIES =========
  // Six Advantages and Disadvantages that until now only recorded their cost and text. Each is
  // always on: no choice to make and nothing to tick, so each simply applies to every roll it
  // covers. Rules read from the books on 7 October 2026, in our own words:
  //
  //   Silent                  Core p.154               +1k0 on Stealth rolls
  //   Prodigy                 Core p.152               +1k0 on School Skill rolls
  //   Voice                   Core p.155               +1k1 on Perform rolls that use the voice
  //   Bad Eyesight            Core p.156               -1k1 on ranged attack rolls and on rolls
  //                                                    that use Perception
  //   Disturbing Countenance  Core p.159               TN +5 on Social Skill rolls
  //   Anachronism             Imperial Histories p.240 TN +5 on Artisan, Craft and Social Skill
  //                                                    rolls (returned spirits only)
  //
  // The owner's rulings, 7 October 2026 (as recommended, with Storytelling added for Voice):
  //   * Bad Eyesight: a ranged attack is an attack with a weapon the sheet already treats as
  //     ranged (isRangedWeapon: bows, thrown weapons, firearms); a Perception-based roll is any roll
  //     whose Trait is Perception (Wary's Spot ambush included). A roll that is both takes -1k1
  //     once.
  //   * Voice: Perform: Song, Perform: Oratory and Perform: Storytelling.
  //   * Prodigy: the Skills of any School the character has -- each School's named Skills, and any
  //     row ticked as a School Skill. A weapon attack with such a Skill counts: it is a Skill Roll,
  //     as Doubt (Feature 4.5.9) already treats it.
  //   * Disturbing Countenance and Anachronism: TN +5 is reported as -5 to the total, the sheet's
  //     convention since Doubt (the sheet sets no TN for these rolls).
  //   * Anachronism: only returned spirits may buy it. The sheet cannot tell who is one, so its
  //     row says so instead of blocking the purchase.
  //
  // Never on damage. Prices are unchanged (Silent's ninja price and Disturbing Countenance's Spider
  // value stay with the player, as for every entry whose discount the sheet does not model).
  // Different entries stack; the same entry on two rows applies once; only rows on the entry's
  // own list count. Reaches the dice through Phase 4.5's existing adv-config seat (no new
  // registry entry), so the registry stays at seven.
  const AUTOMATIC_ENTRIES_ENABLED = true;

  const AUTO4530 = (function(){
    const api = {};
    api.enabled = function(){
      return AUTOMATIC_ENTRIES_ENABLED && typeof ADV_CONFIG_ENABLED !== 'undefined' && ADV_CONFIG_ENABLED &&
        typeof ADV_CONFIG_ROLL_EFFECTS_ENABLED !== 'undefined' && ADV_CONFIG_ROLL_EFFECTS_ENABLED;
    };
    api.norm = function(value){ return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase(); };
    // "Perform: Song", "Perform (Song)", "Artisan: Origami" -> the Skill ('perform') and the kind ('song').
    api.base = function(name){ return api.norm(String(name || '').replace(/\(.*$/, '').split(':')[0]); };
    api.kind = function(name){
      const s = String(name || ''), colon = s.indexOf(':'), paren = /\(([^)]*)\)/.exec(s);
      return api.norm(colon !== -1 ? s.slice(colon + 1).replace(/\(.*$/, '') : (paren ? paren[1] : ''));
    };
    api.isKind = function(context, kinds){
      return !!context && typeof ROLL_KINDS === 'object' && !!ROLL_KINDS &&
        kinds.some(function(k){ return context.kind === ROLL_KINDS[k]; });
    };
    api.has = function(name, listId){
      const list = document.getElementById(listId);
      return !!list && Array.prototype.some.call(list.querySelectorAll('.entry .en-name'), function(el){
        return api.norm(el.value) === api.norm(name);
      });
    };
    // Core pp.135-145: the seven Skills whose sub-type is Social Skill. Kept here, not borrowed,
    // as every earlier release with a Social list has done, so each removes cleanly on its own.
    api.SOCIAL = Object.freeze(['acting', 'courtier', 'etiquette', 'perform', 'sincerity', 'intimidation', 'temptation']);
    api.VOICE_KINDS = Object.freeze(['song', 'singing', 'oratory', 'storytelling']);
    api.social = function(c){ return api.isKind(c, ['SKILL']) && api.SOCIAL.indexOf(api.base(c.skillName)) !== -1; };
    // The character's School Skills: each School's named Skills, and any row ticked as one.
    api.schoolSkills = function(){
      const out = [];
      const schools = typeof getSchoolsList === 'function' ? getSchoolsList() : [];
      schools.forEach(function(s){
        if(s && typeof schoolConcreteSkillNames === 'function') schoolConcreteSkillNames(s.name).forEach(function(n){ out.push(api.norm(n)); });
      });
      document.querySelectorAll('#skillsBody tr').forEach(function(row){
        const tick = row.querySelector('.sk-school'), name = row.querySelector('.sk-name');
        if(tick && tick.checked && name && name.value.trim()) out.push(api.norm(name.value));
      });
      return out;
    };
    // A School naming a macro-skill ("Artisan") covers every kind of it; one naming a kind
    // ("Lore: Theology") covers that kind only.
    api.isSchoolSkill = function(name){
      const full = api.norm(String(name || '').replace(/\s*\([^)]*\)\s*$/, '')), base = api.base(name);
      return !!full && api.schoolSkills().some(function(s){ return s === full || s === base; });
    };
    api.ranged = function(c){
      return api.isKind(c, ['ATTACK']) && typeof isRangedWeapon === 'function' && !!c.weaponEntry && !!isRangedWeapon(c.weaponEntry);
    };
    api.perception = function(c){ return api.norm(c && c.traitName) === 'perception'; };

    api.ENTRIES = [
      {name:'Silent', list:'advList', source:'Core Rulebook p.154', rolledDelta:1, keptDelta:0,
        when:function(c){ return api.isKind(c, ['SKILL']) && api.base(c.skillName) === 'stealth'; }, note:'Stealth roll'},
      {name:'Prodigy', list:'advList', source:'Core Rulebook p.152', rolledDelta:1, keptDelta:0,
        when:function(c){ return api.isKind(c, ['SKILL', 'ATTACK']) && api.isSchoolSkill(c.skillName); }, note:'School Skill roll'},
      {name:'Voice', list:'advList', source:'Core Rulebook p.155', rolledDelta:1, keptDelta:1,
        when:function(c){ return api.isKind(c, ['SKILL']) && api.base(c.skillName) === 'perform' && api.VOICE_KINDS.indexOf(api.kind(c.skillName)) !== -1; },
        note:'Perform roll using the voice'},
      {name:'Bad Eyesight', list:'disadvList', source:'Core Rulebook p.156', rolledDelta:-1, keptDelta:-1,
        when:function(c){ return !api.isKind(c, ['DAMAGE']) && (api.ranged(c) || api.perception(c)); },
        note:'ranged attack or Perception-based roll'},
      {name:'Disturbing Countenance', list:'disadvList', source:'Core Rulebook p.159', totalDelta:-5,
        when:function(c){ return api.social(c); }, note:'Social Skill roll (TN +5)'},
      {name:'Anachronism', list:'disadvList', source:'Imperial Histories p.240', totalDelta:-5,
        when:function(c){ return api.social(c) || (api.isKind(c, ['SKILL']) && ['artisan', 'craft'].indexOf(api.base(c.skillName)) !== -1); },
        note:'Artisan, Craft or Social Skill roll (TN +5)'},
    ];

    api.modifiers = function(context){
      if(!api.enabled() || !context || api.isKind(context, ['DAMAGE'])) return [];
      const out = [];
      api.ENTRIES.forEach(function(e){
        let applies = false;
        try { applies = api.has(e.name, e.list) && e.when(context) === true; } catch(err){ applies = false; }
        if(!applies) return;
        out.push({source:'adv-config', label:e.name, rolledDelta:e.rolledDelta || 0, keptDelta:e.keptDelta || 0,
          totalDelta:e.totalDelta || 0, note:e.note + '. ' + e.source + '.'});
      });
      return out;
    };

    // Anachronism's row says what the sheet cannot check.
    api.ANACHRONISM_NOTE = 'Only returned spirits may take this. The sheet cannot check that: it is up to you and your GM.';
    api.decorate = function(){
      if(!AUTOMATIC_ENTRIES_ENABLED) return;
      document.querySelectorAll('#advList .entry, #disadvList .entry').forEach(function(div){
        const nameEl = div.querySelector('.en-name');
        const mine = !!nameEl && api.norm(nameEl.value) === 'anachronism' && !!div.parentElement && div.parentElement.id === 'disadvList';
        let note = div.querySelector('.auto4530-note');
        if(!mine){ if(note) note.remove(); return; }
        if(!note){
          note = document.createElement('div');
          note.className = 'auto4530-note';
          const top = div.querySelector('.entry-top');
          if(top && top.nextSibling) div.insertBefore(note, top.nextSibling); else div.appendChild(note);
        }
        if(note.textContent !== api.ANACHRONISM_NOTE) note.textContent = api.ANACHRONISM_NOTE;
      });
    };
    return api;
  })();

  if(AUTOMATIC_ENTRIES_ENABLED){
    if(typeof advConfigExtendedRollModifiers === 'function'){
      const auto4530PreviousModifiers = advConfigExtendedRollModifiers;
      advConfigExtendedRollModifiers = function(context){
        return (auto4530PreviousModifiers(context) || []).concat(AUTO4530.modifiers(context));
      };
    }
    // The row line follows every recalc: refreshAllAdvConfigControls is called by name from the
    // trunk's recalcAll, including the list listeners that never reach a recalcAll wrapper.
    if(typeof refreshAllAdvConfigControls === 'function'){
      const auto4530PreviousRefresh = refreshAllAdvConfigControls;
      refreshAllAdvConfigControls = function(){
        const result = auto4530PreviousRefresh.apply(this, arguments);
        AUTO4530.decorate();
        return result;
      };
    }
  }
