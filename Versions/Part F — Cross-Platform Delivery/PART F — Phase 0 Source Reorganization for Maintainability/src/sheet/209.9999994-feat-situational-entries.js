  // ========= PART I FEATURE 4.5.27: SITUATIONAL ROLL ENTRIES =========
  // Nine Advantages that until now only recorded their cost and text. Each gives a bonus in a
  // circumstance the sheet cannot see (who you are dealing with, why you are rolling), so each
  // is offered as a per-roll declaration through the 4.5.15 registry: unticked on every roll,
  // offered only where the roll type fits, applied to that roll (and a reroll of it) alone, and
  // never saved. Rules read from the books on 7 October 2026, in our own words:
  //
  //   Balance           Core p.146         +1k0 when you add your Honor Rank to resist
  //                                        Intimidation or Temptation
  //   Clear Thinker     Core p.147         +1k0 on a Contested Roll against someone trying to
  //                                        confuse or manipulate you
  //   Dangerous Beauty  Core p.147         +1k0 on Temptation rolls with the opposite sex
  //   Imperial Spouse   Core p.150         +1k1 on Social Skill rolls with Imperial family members
  //   Irreproachable    Core p.151         +1k0 on a Contested Roll where the other side uses
  //                                        Temptation
  //   Precise Memory    Core p.152         +1k1 on an Intelligence Trait Roll to recall exactly
  //   Wary              Core p.155         +1k1 on Investigation / Perception to detect an ambush
  //   Heartless         Great Clans p.136  +1k0 resisting Courtier, Sincerity or Temptation used
  //                                        to persuade, seduce or change your mind
  //   Imperial Scribe   Imperial           +1k0 on Social Skill rolls with shugenja and artisans,
  //                     Histories p.67     and a Free Raise on Calligraphy Skill Rolls
  //
  // Owner's rulings, 7 October 2026 (all as recommended):
  //   * Imperial Scribe's Free Raise is reported on every skilled Calligraphy roll as an
  //     INFORMATIONAL line that moves no dice -- the convention Friend of the Elements set
  //     (Phase 4.5): this sheet has no Raise mechanic, and inventing a dice equivalent for a
  //     Free Raise would be inventing rules. Never on an Unskilled Roll: Core p.80 says those
  //     may not benefit from Raises, Free Raises included.
  //   * Balance adds only its own +1k0. The sheet never adds Honor Rank to a resistance roll
  //     (Core p.91) for anyone; that general rule waits for the end-of-project Glory, Status and
  //     Honour review, so the option reminds the player to add it. While a configured Failure of
  //     Bushido is the Honor tenet (you cannot add your Honor Rank), Balance is not offered:
  //     its condition can never be met.
  //
  // Deliberately NOT here: Imperial Spouse's +0.5 Status and Imperial Scribe's purchase
  // requirements (Status 2+, Calligraphy 4+), both of which wait for that same review;
  // Advantages a Technique grants (an Ikoma Bard adds a 0-XP Precise Memory row; The Clarity
  // of Fire stays manual); Identity gender, which Dangerous Beauty does not read -- the
  // circumstance is the other person's, declared by the player.
  //
  // Different entries stack, as the registry already sums its providers: Core p.149's
  // "Advantage Limits" sidebar leaves any cap on stacked bonuses to the GM. The same entry on
  // two rows is offered once. Only rows on the Advantages list count.
  const SITUATIONAL_ENTRIES_ENABLED = true;

  const SIT4527 = (function(){
    const api = {};
    api.PROVIDER = 'situational-entries';
    api.LABEL = 'Advantages';
    api.enabled = function(){
      return SITUATIONAL_ENTRIES_ENABLED && typeof ADV_CONFIG_ENABLED !== 'undefined' && ADV_CONFIG_ENABLED &&
        typeof ADV_CONFIG_ROLL_EFFECTS_ENABLED !== 'undefined' && ADV_CONFIG_ROLL_EFFECTS_ENABLED;
    };
    // Core pp.135-145: the seven Skills whose sub-type is Social Skill (Perform is a
    // macro-skill, every one of its kinds Social). Kept here rather than borrowed from Feature
    // 4.5.2, whose own comment keeps its list local to its Disadvantage contributor.
    api.SOCIAL_SKILLS = Object.freeze(['acting', 'courtier', 'etiquette', 'perform', 'sincerity', 'intimidation', 'temptation']);
    api.norm = function(value){ return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase(); };
    // "Perform: Song", "Lore: History" or "Sincerity (Honesty)" -> its Skill: perform, lore, sincerity.
    api.skill = function(context){ return api.norm(String(context && context.skillName || '').replace(/\(.*$/, '').split(':')[0]); };
    api.has = function(name){
      return Array.from(document.querySelectorAll('#advList .entry .en-name')).some(function(e){ return api.norm(e.value) === api.norm(name); });
    };
    api.kind = function(context, kinds){
      return !!context && typeof ROLL_KINDS === 'object' && !!ROLL_KINDS &&
        kinds.some(function(k){ return context.kind === ROLL_KINDS[k]; });
    };
    // A roll the player may be making to resist or to contest: any Skill, Trait, Ring or
    // dice-tray roll, as for Heart of Vengeance (4.5.16) and Jurojin's Blessing (4.5.21). Never
    // an attack, spell or initiative roll, and never the Full Defense stance's Defense roll.
    api.resist = function(context){
      return api.kind(context, ['SKILL', 'TRAIT', 'RING', 'MANUAL']) && context.fullDefenseDeclaration !== true;
    };
    api.social = function(context){
      return api.kind(context, ['SKILL']) && context.fullDefenseDeclaration !== true &&
        api.SOCIAL_SKILLS.indexOf(api.skill(context)) !== -1;
    };
    // Failure of Bushido configured with the Honor tenet: "you cannot add your Honor Rank".
    api.honorBarred = function(){
      if(typeof D45 !== 'object' || !D45 || typeof D45.active !== 'function') return false;
      try {
        return D45.active('Failure of Bushido').some(function(i){ return i && i.effect && i.effect.tenet === 'Honor'; });
      } catch(e){ return false; }
    };
    api.ENTRIES = [
      {name:'Balance', key:'balance', source:'Core Rulebook p.146', rolled:1, kept:0,
        when:function(c){ return api.resist(c) && !api.honorBarred(); },
        label:'Resisting Intimidation or Temptation, adding your Honor Rank',
        note:'Add your Honor Rank to the total yourself: the sheet does not add it.'},
      {name:'Clear Thinker', key:'clear-thinker', source:'Core Rulebook p.147', rolled:1, kept:0,
        when:function(c){ return api.resist(c); },
        label:'Contested Roll against someone trying to confuse or manipulate you'},
      {name:'Heartless', key:'heartless', source:'The Great Clans p.136', rolled:1, kept:0,
        when:function(c){ return api.resist(c); },
        label:'Resisting Courtier, Sincerity or Temptation used to persuade, seduce or change your mind'},
      {name:'Irreproachable', key:'irreproachable', source:'Core Rulebook p.151', rolled:1, kept:0,
        when:function(c){ return api.resist(c); },
        label:'Contested Roll in which the other side uses Temptation'},
      {name:'Dangerous Beauty', key:'dangerous-beauty', source:'Core Rulebook p.147', rolled:1, kept:0,
        when:function(c){ return api.kind(c, ['SKILL']) && api.skill(c) === 'temptation'; },
        label:'Temptation with someone of the opposite sex'},
      {name:'Imperial Spouse', key:'imperial-spouse', source:'Core Rulebook p.150', rolled:1, kept:1,
        when:function(c){ return api.social(c); },
        label:'Dealing with a member of an Imperial family'},
      {name:'Imperial Scribe', key:'imperial-scribe', source:'Imperial Histories p.67', rolled:1, kept:0,
        when:function(c){ return api.social(c); },
        label:'Dealing with a shugenja or an artisan'},
      {name:'Precise Memory', key:'precise-memory', source:'Core Rulebook p.152', rolled:1, kept:1,
        when:function(c){ return api.kind(c, ['TRAIT']) && api.norm(c.traitName) === 'intelligence'; },
        label:'Recalling something exactly'},
      {name:'Wary', key:'wary', source:'Core Rulebook p.155', rolled:1, kept:1,
        when:function(c){ return api.kind(c, ['SKILL']) && api.skill(c) === 'investigation' && api.norm(c.traitName) === 'perception'; },
        label:'Detecting an ambush (against Stealth / Agility)'},
    ];
    api.entry = function(key){ return api.ENTRIES.find(function(e){ return e.key === key; }) || null; };
    api.pool = function(e){ return '+' + e.rolled + 'k' + e.kept; };
    api.applies = function(e, context){
      try { return api.enabled() && !!context && api.has(e.name) && e.when(context) === true; } catch(err){ return false; }
    };
    api.provider = {
      label:api.LABEL,
      offers:function(context){
        return api.ENTRIES.filter(function(e){ return api.applies(e, context); }).map(function(e){
          return {key:e.key, label:e.name + ': ' + e.label + ' — ' + api.pool(e),
            note:(e.note ? e.note + ' ' : '') + e.source + '.'};
        });
      },
      modifiers:function(context, keys){
        return (keys || []).map(api.entry).filter(function(e){ return e && api.applies(e, context); }).map(function(e){
          return {label:e.name, rolledDelta:e.rolled, keptDelta:e.kept, note:'Declared: ' + e.label};
        });
      },
    };

    // Imperial Scribe's Free Raise: every skilled Calligraphy Skill Roll, reported, never added.
    api.freeRaise = function(context){
      if(!api.enabled() || !api.kind(context, ['SKILL']) || api.skill(context) !== 'calligraphy') return [];
      if(context.unskilled === true || !(Number(context.skillRank) > 0) || !api.has('Imperial Scribe')) return [];
      return [{source:'adv-config', label:'Imperial Scribe', informational:true, display:'Free Raise available',
        note:'apply it yourself — this sheet has no Raise mechanic to spend it through. Imperial Histories p.67.'}];
    };

    // Catalogue wording reconciled with the books (our own words). Applied at load, so removing
    // this fragment restores the earlier text; rows already on a sheet keep the text they have.
    api.DESCRIPTIONS = {
      'Clear Thinker':'+1k0 on Contested Rolls against someone trying to confuse or manipulate you. Dragon pay 2.',
      'Heartless':'+1k0 on rolls to resist Courtier, Sincerity or Temptation used to persuade you, seduce you or change your mind.',
    };
    api.applyDescriptions = function(){
      if(typeof ADV_LIBRARY === 'undefined' || !Array.isArray(ADV_LIBRARY)) return;
      ADV_LIBRARY.forEach(function(entry){
        if(entry && Object.prototype.hasOwnProperty.call(api.DESCRIPTIONS, entry.name)) entry.desc = api.DESCRIPTIONS[entry.name];
      });
    };
    return api;
  })();

  if(SIT4527.enabled()){
    SIT4527.applyDescriptions();
    if(typeof advConfigExtendedRollModifiers === 'function'){
      const sit4527PreviousModifiers = advConfigExtendedRollModifiers;
      advConfigExtendedRollModifiers = function(context){
        return (sit4527PreviousModifiers(context) || []).concat(SIT4527.freeRaise(context));
      };
    }
    // Declared dependency on the roll declaration registry (Feature 4.5.15): without it the
    // nine entries simply offer nothing, and the Free Raise line still appears.
    if(typeof RD4515 === 'object' && RD4515) RD4515.register(SIT4527.PROVIDER, SIT4527.provider);
  }
