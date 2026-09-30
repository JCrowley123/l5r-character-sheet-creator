  // ========= PART I PHASE 4.8: ANCESTORS =========
  // The eighteen Ancestors of the Core Rulebook (pp. 241-244), to the owner's rulings of
  // 30 September 2026:
  //   * An Ancestor lives with the character's Clan and Family, not in the Advantages list: a card
  //     in the Clan & School tab and on the creation wizard's Family screen. It is part of the
  //     character's history, and a player should see that it exists.
  //   * It still costs what the book charges (5 to 14 points, "purchased like any other
  //     Advantage"), added to Experience spent by a guarded block in recalcAll().
  //   * Offered: the character's own Clan; Spider Ancestors to anyone, with the GM's permission
  //     (the p. 244 sidebar); other Clans' Ancestors shown greyed.
  //   * A "Lost ancestor's favour" badge switches every gift off. By the book (p. 241) the favour
  //     may return once; a second loss is final, and no other Ancestor may ever replace one whose
  //     favour was lost. The points are never refunded.
  //
  // Every description below is in this project's own words with its page, never the book's text
  // (owner's ruling, 30 September). How each gift reaches the sheet:
  //   automatic  -- through the adv-config seat (Phase 4.5, Part I), never damage;
  //   damage     -- inside getWeaponDamageDice() by a guarded trunk block, because a damage roll
  //                 does not read the pre-roll pipeline (measured by Feature 4.5.12);
  //   Armor TN   -- Shiba's Intelligence, by a guarded block after the Current TN sum;
  //   declared   -- a tick in the roll preview (Feature 4.5.15's registry), fresh every roll;
  //   reminder   -- written on the card; the player applies it.
  // Demands the sheet can measure (Honor, Taint) raise a warning on the card; they never switch the
  // favour off by themselves. That is the badge's job, and the GM's call.
  const ANCESTORS_ENABLED = true;

  const ANC48 = (function(){
    const api = {};
    api.FIELD = 'f_ancestor';
    api.PROVIDER = 'ancestors';
    api.REVISION = 1;
    api.BADGE = 'Lost ancestor’s favour';
    api.enabled = function(){ return ANCESTORS_ENABLED; };
    const $ = function(id){ return document.getElementById(id); };
    function el(tag, cls, text){
      const node = document.createElement(tag);
      if(cls) node.className = cls;
      if(text !== undefined) node.textContent = text;
      return node;
    }

    // ---------- The rules every Ancestor shares (Core Rulebook p. 241), in our own words ----------
    api.RULES = [
      'An Ancestor is a Spiritual Advantage bought with Experience Points, like any other Advantage: the spirit of a great hero of Rokugan who now dwells in Yomi and guides you. The book leaves it to the GM whether Ancestors are used at all, so ask first.',
      'Loyalty: an Ancestor guides only members of the Clan or faction it served in life, whatever your bloodline.',
      'Piety: you owe your Ancestor about an hour of prayer every day, made up as soon as you can when circumstances stop you. Neglect it and the Ancestor leaves; bringing it back takes at least a month of devout prayer and atonement.',
      'Jealousy: you may only ever have one Ancestor. If you lose its favour, no other Ancestor can be bought to take its place.',
      'Demands: every Ancestor asks something of you. Fail it and the Ancestor leaves. The GM may let you win the favour back once, with sincere repentance and about a month of devotion; a second failure is final.',
    ];
    api.SPIDER_RULE = 'Spider Ancestors (Core Rulebook p. 244) are corrupted souls sent back from Jigoku. The usual rules do not bind them: they favour whoever serves Jigoku’s ends, above all members of the Spider Clan and the Tainted. Your GM decides whether one favours a character from outside the Spider Clan.';

    // ---------- The eighteen Ancestors (Core Rulebook pp. 242-244), in printed order ----------
    // how: 'auto' applied by the sheet; 'declare' ticked in the roll preview; 'remind' reminder only.
    api.LIBRARY = [
      {name:'Hida', clan:'Crab', cost:14, page:'p. 242',
        about:'The Crab Clan’s founder, a giant of strength and endurance who never gave ground to any foe.',
        gifts:[
          {text:'+1k0 on every damage roll.', how:'auto', note:'Added to the damage of weapons chosen from the sheet’s list; add it yourself to a custom weapon.'},
          {text:'Ignore 4 points of an enemy’s Reduction, whatever weapon you use.', how:'remind'},
          {text:'Crab who fight beside you in a skirmish gain 1 extra Void Point, lost if not spent by the end of the skirmish.', how:'remind'},
        ],
        demands:'In any Round in which a fellow Crab is wounded where you can see it, you take 1 Wound as well (never more than 1 a Round; it ignores Reduction and anything that would negate it). You may refuse it, but refusing it, or willingly retreating from a fight with a creature of the Shadowlands, makes Hida leave you.'},
      {name:'Kuni', clan:'Crab', cost:8, page:'p. 242',
        about:'Founder of the Crab’s shugenja school, who knew more of the Shadowlands’ creatures than anyone of his day.',
        gifts:[
          {text:'Once per session, spend a Void Point to add your Earth Rank in kept dice to a Spell Casting Roll.', how:'declare', note:'Tick it in the Casting Roll’s preview; spend the Void Point and keep count of the once per session yourself. The book gives the bonus as kept dice only, so that is how the sheet adds it; you may want to confirm the reading with your GM.'},
          {text:'When you roll to resist gaining Shadowlands Taint, roll twice and keep the better result.', how:'remind'},
        ],
        demands:'Stay pure. Gain even a single point of Shadowlands Taint and Kuni leaves you.',
        flag:{taint:true}},
      {name:'Doji', clan:'Crane', cost:8, page:'p. 242',
        about:'The Lady Doji, who shaped most of the customs and courtesies of Rokugani civilisation.',
        gifts:[
          {text:'+1k0 on Courtier, Etiquette, Perform and Sincerity rolls.', how:'auto'},
        ],
        demands:'Live a civilised life. A Major Breach of Etiquette (see the Honor table in the Book of Earth), or losing more than 3 points of Honor or Glory from a single breach of etiquette, makes Doji leave you.'},
      {name:'Kakita', clan:'Crane', cost:12, page:'p. 242',
        about:'Doji’s husband: the first Emerald Champion, author of The Sword, a duellist and artisan without equal, and the man who began the Crane’s long feud with the Lion.',
        gifts:[
          {text:'Spend a Void Point to re-roll an Iaijutsu or Artisan roll, with +1k1 on the second roll; keep the better result.', how:'declare', note:'Make the second roll yourself and tick Kakita’s re-roll in its preview; spend the Void Point too.'},
          {text:'The price: every member of the Matsu family counts as your Sworn Enemy.', how:'remind'},
        ],
        demands:'Excellence with sword and brush. Lose a duel or an artistic competition and Kakita forsakes you; he also leaves if your Honor falls below 4.0.',
        flag:{honorBelow:4.0}},
      {name:'Agasha Kitsuki', clan:'Dragon', cost:11, page:'p. 242',
        about:'Founder of the Kitsuki family and of the Kitsuki Method, which solves crimes by deduction.',
        gifts:[
          {text:'Use your Perception in place of your Awareness on any Skill or Trait roll that would use Awareness.', how:'auto', note:'Applied whenever your Perception is higher.'},
          {text:'When you spend a Void Point on a Skill or Trait roll to tell whether someone is lying, it gives +2k2 instead of +1k1.', how:'declare', note:'Spend the Void Point in the roll preview as usual and tick Kitsuki’s option for the extra +1k1.'},
        ],
        demands:'Always pursue the truth. Accept an answer to a problem, crime or puzzle that you know or believe to be false, and Kitsuki leaves you.'},
      {name:'Mirumoto', clan:'Dragon', cost:9, page:'p. 242',
        about:'The Dragon’s great swordsman and Kakita’s rival, creator of the two-sword niten style, who died fighting Fu Leng.',
        gifts:[
          {text:'+1k1 on Skill rolls that use Agility; +3k1 instead when the Skill is one of the Mirumoto Bushi School’s Skills.', how:'auto'},
        ],
        demands:'Carry on his rivalry with Kakita. If you issue a challenge and lose the duel, or refuse a duel with someone trained in the Kakita Bushi School, Mirumoto leaves you. Losing a duel you were forced into does not count, unless your opponent was a Kakita.'},
      {name:'Akodo', clan:'Lion', cost:12, page:'pp. 242–243',
        about:'Founder of the Lion Clan, the greatest general and tactician Rokugan has known.',
        gifts:[
          {text:'+1k0 on all Bugei Skill rolls except Iaijutsu.', how:'auto', note:'Bugei and Weapon Skills, not the Low weapon Skills (the sheet’s reading of “Bugei”, as for School choices).'},
          {text:'+1k1 on rolls on the Mass Battle Table.', how:'declare', note:'Tick it in the preview of a Battle roll made on the table.'},
          {text:'Enter a skirmish alongside at least one other Lion bushi and gain 1 extra Void Point, lost if not spent by the end of the skirmish.', how:'remind'},
        ],
        demands:'Be a soldier of steadfast courage and unimpeachable honour. Akodo leaves you if your Honor falls below 5.0, or if you willingly leave a battle or skirmish while other Lion are still fighting.',
        flag:{honorBelow:5.0}},
      {name:'Ikoma', clan:'Lion', cost:9, page:'p. 243',
        about:'Founder of the Lion’s family of historians and storytellers, a cheerful rogue fond of drink, company and a brawl.',
        gifts:[
          {text:'+1k0 on all rolls that use Intelligence.', how:'auto'},
          {text:'+2k0 on damage when you fight unarmed with Jiujutsu.', how:'auto', note:'Added to the damage of the sheet’s Unarmed weapon.'},
        ],
        demands:'Live as he did. Refuse a drink, run from a fight, or insult an attractive or compelling woman, and Ikoma forsakes you.'},
      {name:'Kaimetsu-Uo', clan:'Mantis', cost:9, page:'p. 243',
        about:'The Mantis Clan’s founder, son of Hida Osano-Wo and his Matsu bride, who won his clan a home by deeds rather than words.',
        gifts:[
          {text:'+1k1 on Willpower Trait and Skill rolls, except rolls to avoid being provoked.', how:'auto', note:'When a roll resists provocation, tick “Resisting provocation” in its preview to leave the bonus off.'},
          {text:'+3k0 when using the Improvised Weapon Emphasis of Jiujutsu.', how:'declare', note:'Tick it in the preview of a Jiujutsu roll with an improvised weapon.'},
          {text:'+1k1 on damage with improvised weapons.', how:'remind'},
        ],
        demands:'Take on every challenge, however strange. Back down from any physical competition or challenge, even a foot race, and Kaimetsu-Uo forsakes you.'},
      {name:'Gusai', clan:'Mantis', cost:5, page:'p. 243',
        about:'The Mantis Ancestor who carried a knife into the Emperor’s presence to show what one person can do.',
        gifts:[
          {text:'+3k3 on Stealth or Sleight of Hand rolls to hide a weapon on your person.', how:'declare'},
        ],
        demands:'Never willingly go unarmed into the presence of a rival or an enemy.'},
      {name:'Asako', clan:'Phoenix', cost:5, page:'p. 243',
        about:'Shiba’s favoured follower and founder of the henshin, who prized friendship above everything.',
        gifts:[
          {text:'Each of your Ally Advantages gains +1 Devotion at no cost.', how:'remind'},
          {text:'+1k0 on Social Skill rolls made against someone who is your Ally.', how:'declare'},
          {text:'If an Ally ever betrays you, you gain the Driven Disadvantage (destroy the betrayer) for no points.', how:'remind'},
        ],
        demands:'Be as devoted to your friends as you expect them to be to you. Betray or abandon a friend and Asako forsakes you.'},
      {name:'Shiba', clan:'Phoenix', cost:9, page:'p. 243',
        about:'The Phoenix Clan’s founder, who served the Isawa, wrote down the Tao, and still watches over his descendants.',
        gifts:[
          {text:'+1k1 on Intelligence rolls and on Skill rolls that use Intelligence.', how:'auto'},
          {text:'Add your Intelligence to your Armor TN at all times.', how:'auto'},
          {text:'Enter a skirmish alongside a member of the Isawa family and gain 1 extra Void Point, lost if not spent by the end of the skirmish.', how:'remind'},
        ],
        demands:'Keep high Honor and your oath to the Isawa. Shiba leaves you if your Honor falls below 4.0, if you willingly disobey a higher-ranking Isawa, or if you willingly leave a skirmish while an Isawa ally stays behind.',
        flag:{honorBelow:4.0}},
      {name:'Bayushi', clan:'Scorpion', cost:12, page:'pp. 243–244',
        about:'The Scorpion Clan’s founder: subtle, ruthless, honest in his own cruel way, and devoted to his follower Shosuro.',
        gifts:[
          {text:'If you trained in a Bayushi School (such as Bayushi Bushi or Bayushi Courtier), +1k0 on all your School Skills.', how:'auto'},
          {text:'With that training, a Void Point spent on a School Skill roll gives +2k2 instead of +1k1.', how:'declare', note:'Spend the Void Point in the roll preview as usual and tick Bayushi’s option for the extra +1k1.'},
          {text:'With a Kharmic Tie to another character, each of you may spend the other’s Void Points; if one of you dies, the other gains the Momoku Disadvantage for no points.', how:'remind'},
        ],
        demands:'Loyalty. Willingly and knowingly betray the Scorpion Clan and Bayushi leaves you; he also leaves if your Honor reaches 5.0 or more.',
        flag:{honorAtLeast:5.0}},
      {name:'Shosuro', clan:'Scorpion', cost:8, page:'p. 244',
        about:'Bayushi’s beloved follower, taken by the Lying Darkness and long imprisoned, who now favours her worthy descendants.',
        gifts:[
          {text:'+3k1 on Stealth, Acting and Sincerity (Deceit) rolls.', how:'auto', note:'Stealth and Acting are automatic; tick “Lying” in a Sincerity roll’s preview for Deceit.'},
        ],
        demands:'Never betray the Scorpion Clan, disobey your superiors in it, or fall to the Lying Darkness or the Shadow Dragon.'},
      {name:'Hida Atarasi', clan:'Spider', cost:7, page:'p. 244',
        about:'Hida’s eldest son and the first Crab Thunder, who fell to the Shadowlands’ Taint and was destroyed by his own father.',
        gifts:[
          {text:'Each round of a skirmish, spend a Void Point or take 1 point of Shadowlands Taint (your choice) to add your Taint Rank or your Earth (your choice) in unkept dice to that round’s attack and damage rolls.', how:'declare', note:'Tick it in the attack roll’s preview (the higher of the two is added); pay the Void Point or Taint yourself, and add the same dice to that round’s damage.'},
        ],
        demands:'Atarasi despises purity. If your Honor reaches 3.0 or more, or you ever lose any of your Taint, he forsakes you.',
        flag:{honorAtLeast:3.0}},
      {name:'Kuni Yori', clan:'Spider', cost:5, page:'p. 244',
        about:'A Crab shugenja seduced by the Shadowlands who betrayed his clan and became an undead master of maho.',
        gifts:[
          {text:'+1k0 on Sincerity (Deceit) rolls and on all maho Casting Rolls.', how:'auto', note:'Maho Casting Rolls are automatic; tick “Lying” in a Sincerity roll’s preview for Deceit.'},
          {text:'The price: every maho spell you cast gives you 1 extra point of Taint.', how:'remind'},
        ],
        demands:'None. He is sure his guidance will lead you to complete corruption.'},
      {name:'Moto', clan:'Unicorn', cost:10, page:'p. 244',
        about:'The desert warrior who swore himself to Shinjo and brought his people into the Ki-Rin, bound by nothing but his own choices.',
        gifts:[
          {text:'+2k2 on rolls to resist being physically restrained (such as a grapple) or mentally influenced (such as Temptation).', how:'declare'},
          {text:'A spell that would restrain your movement has its Casting TN raised by 5 × your Willpower.', how:'remind'},
        ],
        demands:'Obey only your lord and clan. Knowingly let yourself be controlled by someone who is not your rightful Unicorn superior (for example, a courtier’s blackmail) and Moto leaves you.'},
      {name:'Shinjo', clan:'Unicorn', cost:8, page:'p. 244',
        about:'The Unicorn Clan’s founder, endlessly curious and compassionate, who led her Ki-Rin out into the world.',
        gifts:[
          {text:'+1k1 on Investigation rolls to understand something new, strange or enigmatic.', how:'declare'},
          {text:'+1k1 on Awareness rolls made with Etiquette or Sincerity (Honesty).', how:'auto', note:'Etiquette is automatic; tick “Telling the truth” in a Sincerity roll’s preview for Honesty.'},
        ],
        demands:'Act with compassion, even towards bitter enemies. Fail to show mercy to a rival or an enemy and Shinjo leaves you (the Kolat and servants of the Lying Darkness or the Shadow Dragon excepted).'},
    ];
    api.HOW = {auto:'Automatic', declare:'Tick it when you roll', remind:'Reminder'};
    api.byName = function(name){
      return api.LIBRARY.find(function(a){ return a.name === name; }) || null;
    };

    // ---------- Saved state: one hidden f_ field, so the trunk's own save and load carry it ----------
    // {v:1, name, lost, regained, final, gm}. final is true exactly when the favour was lost after
    // being regained once; gm records that a Spider Ancestor was taken outside the Spider Clan.
    api.field = function(){ return $(api.FIELD); };
    api.valid = function(s){
      if(!s || typeof s !== 'object' || Array.isArray(s) || s.v !== api.REVISION || !api.byName(s.name)) return false;
      const keys = ['v', 'name', 'lost', 'regained', 'final', 'gm'];
      if(Object.keys(s).some(function(k){ return keys.indexOf(k) === -1; })) return false;
      if(['lost', 'regained', 'final', 'gm'].some(function(k){ return typeof s[k] !== 'boolean'; })) return false;
      return s.final === (s.lost && s.regained);
    };
    // {state, raw}: state is the valid saved Ancestor or null; raw is what the field holds.
    api.read = function(){
      const f = api.field();
      const raw = f ? String(f.value || '') : '';
      if(!raw) return {state:null, raw:''};
      let s = null;
      try { s = JSON.parse(raw); } catch(e){ s = null; }
      return {state: api.valid(s) ? s : null, raw:raw};
    };
    api.current = function(){ return api.enabled() ? api.read().state : null; };
    api.write = function(s){
      const f = api.field();
      if(f) f.value = s ? JSON.stringify(s) : '';
    };
    // Once the favour has been lost even once, the Ancestor can never be changed (Jealousy).
    api.locked = function(s){ return !!s && (s.lost || s.regained || s.final); };

    // ---------- The character ----------
    api.norm = function(s){ return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase(); };
    api.clanKey = function(s){ return api.norm(s).replace(/\s+clan$/, ''); };
    // The applied Clan (#f_clan, written by Apply Family), or the Clan & School picker before one is.
    api.clan = function(){
      const applied = $('f_clan') ? $('f_clan').value.trim() : '';
      if(applied) return applied;
      const pick = $('cfs_clan'), minor = $('cfs_minorClan');
      if(!pick || !pick.value) return '';
      if(pick.value === 'Minor Clan') return minor && minor.value ? minor.value : '';
      return pick.value;
    };
    api.ownClan = function(a){ return !!a && !!api.clan() && api.clanKey(a.clan) === api.clanKey(api.clan()); };
    api.spiderGuest = function(a){ return !!a && a.clan === 'Spider' && !api.ownClan(a); };
    api.choosable = function(a){ return api.ownClan(a) || (a && a.clan === 'Spider'); };
    api.honor = function(){ const v = parseFloat($('f_honorPts') ? $('f_honorPts').value : ''); return Number.isFinite(v) ? v : null; };
    api.taint = function(){ const v = parseFloat($('f_taint') ? $('f_taint').value : ''); return Number.isFinite(v) && v > 0 ? v : 0; };
    api.trait = function(name){ return typeof getTraitValueByName === 'function' ? (parseInt(getTraitValueByName(name), 10) || 0) : 0; };
    api.ring = function(key){ const e = $('ring_' + key); return e ? (parseInt(e.value || '0', 10) || 0) : 0; };
    api.schoolNames = function(){
      return (typeof getSchoolsList === 'function' ? getSchoolsList() : []).map(function(s){ return s && s.name; }).filter(Boolean);
    };
    api.bayushiTrained = function(){ return api.schoolNames().some(function(n){ return /^Bayushi\b/i.test(n); }); };

    // Why a chosen Ancestor's gifts are not applied right now; '' when they are.
    api.inactiveReason = function(s){
      if(!s) return 'none';
      const a = api.byName(s.name);
      if(s.lost) return s.final ? 'Favour lost for good' : 'Favour lost';
      if(!api.choosable(a)) return a.name + ' guides only the ' + a.clan + ' Clan' + (api.clan() ? '; your Clan is ' + api.clan() : '') + ', so the gifts are not applied.';
      if(api.spiderGuest(a) && !s.gm) return 'A Spider Ancestor favours someone outside the Spider Clan only with the GM’s permission.';
      return '';
    };
    // The Ancestor whose gifts apply now, or null.
    api.active = function(){
      const s = api.current();
      return s && !api.inactiveReason(s) ? api.byName(s.name) : null;
    };
    api.is = function(name){ const a = api.active(); return !!a && a.name === name; };
    // Warnings from demands the sheet can measure. They never switch the favour off themselves.
    api.flags = function(a, s){
      const out = [];
      if(!a || !a.flag || (s && s.lost)) return out;
      const honor = api.honor();
      if(a.flag.honorBelow !== undefined && honor !== null && honor < a.flag.honorBelow){
        out.push('Your Honor is ' + honor.toFixed(1) + ', below ' + a.flag.honorBelow.toFixed(1) + ': by the book ' + a.name + ' leaves you. If your GM agrees, press “' + api.BADGE + '”.');
      }
      if(a.flag.honorAtLeast !== undefined && honor !== null && honor >= a.flag.honorAtLeast){
        out.push('Your Honor is ' + honor.toFixed(1) + ', ' + a.flag.honorAtLeast.toFixed(1) + ' or more: by the book ' + a.name + ' leaves you. If your GM agrees, press “' + api.BADGE + '”.');
      }
      if(a.flag.taint && api.taint() > 0){
        out.push('Your Taint Rank is ' + api.taint() + ': by the book ' + a.name + ' leaves anyone who gains Shadowlands Taint. If your GM agrees, press “' + api.BADGE + '”.');
      }
      return out;
    };

    // ---------- Cost ----------
    // Charged while an Ancestor is chosen, favour lost or not: the book refunds nothing.
    api.cost = function(){
      const s = api.current();
      return s ? api.byName(s.name).cost : 0;
    };

    // ---------- Automatic roll bonuses (adv-config seat; never damage) ----------
    // A Skill as a whole ("lore: shugenja"), and its family ("lore"); an Emphasis in brackets drops.
    api.skillId = function(name){ return api.norm(name).replace(/\s*\(.*$/, '').trim(); };
    api.skillFamily = function(name){ return api.skillId(name).replace(/\s*:.*$/, '').trim(); };
    api.skillIn = function(context, list){
      const family = api.skillFamily(context && context.skillName);
      return !!family && list.some(function(s){ return api.norm(s) === family; });
    };
    api.libSkill = function(name){
      const family = api.skillFamily(name);
      return (typeof SKILL_LIBRARY !== 'undefined' ? SKILL_LIBRARY : []).find(function(s){ return api.norm(s.name) === family; }) || null;
    };
    // Bugei and Weapon Skills, not Weapon (Low): the owner's reading of "Bugei" (Phase 11.2.2, Part K).
    api.isBugei = function(name){
      const s = api.libSkill(name);
      return !!s && (s.cat === 'Bugei' || s.cat === 'Weapon');
    };
    api.schoolSkillBases = function(schoolName){
      const out = new Set();
      if(typeof schoolConcreteSkillNames === 'function') schoolConcreteSkillNames(schoolName).forEach(function(n){ out.add(api.skillId(n)); });
      return out;
    };
    // The character's own School Skills: each School's named Skills, and any row ticked as one.
    api.mySchoolSkillBases = function(){
      const out = new Set();
      api.schoolNames().forEach(function(n){ api.schoolSkillBases(n).forEach(function(b){ out.add(b); }); });
      document.querySelectorAll('#skillsBody tr').forEach(function(row){
        const tick = row.querySelector('.sk-school'), name = row.querySelector('.sk-name');
        if(tick && tick.checked && name && name.value.trim()) out.add(api.skillId(name.value));
      });
      out.delete('');
      return out;
    };
    api.mirumotoSkill = function(name){
      const id = api.skillId(name);
      if(api.schoolSkillBases('Mirumoto Bushi').has(id)) return true;
      // A Mirumoto Bushi's own choice of Skill counts too.
      return api.schoolNames().indexOf('Mirumoto Bushi') !== -1 && api.mySchoolSkillBases().has(id);
    };
    api.rollsOn = function(){
      return api.enabled() && (typeof ADV_CONFIG_ROLL_EFFECTS_ENABLED === 'undefined' || ADV_CONFIG_ROLL_EFFECTS_ENABLED);
    };
    api.mod = function(a, rolled, kept, note){
      return {source:'adv-config', label:'Ancestor: ' + a.name, rolledDelta:rolled, keptDelta:kept, totalDelta:0, note:note};
    };
    api.armed = function(context, key){
      return typeof RD4515 === 'object' && !!RD4515 && RD4515.armed(context).indexOf(api.PROVIDER + ':' + key) !== -1;
    };
    api.modifiers = function(context){
      if(!api.rollsOn() || !context) return [];
      const a = api.active();
      if(!a) return [];
      const K = ROLL_KINDS, kind = context.kind;
      if(kind === K.DAMAGE) return [];
      const skill = kind === K.SKILL, attack = kind === K.ATTACK, traitRoll = kind === K.TRAIT;
      const trait = context.traitName;
      const out = [];
      switch(a.name){
        case 'Doji':
          if(skill && api.skillIn(context, ['Courtier', 'Etiquette', 'Perform', 'Sincerity'])) out.push(api.mod(a, 1, 0, context.skillName));
          break;
        case 'Agasha Kitsuki':
          if((skill || traitRoll) && trait === 'Awareness'){
            const gain = api.trait('Perception') - api.trait('Awareness');
            if(gain > 0) out.push(api.mod(a, gain, gain, 'Perception ' + api.trait('Perception') + ' in place of Awareness ' + api.trait('Awareness')));
          }
          break;
        case 'Mirumoto':
          if((skill || attack) && trait === 'Agility'){
            out.push(api.mirumotoSkill(context.skillName) ? api.mod(a, 3, 1, 'Mirumoto Bushi School Skill') : api.mod(a, 1, 1, 'Agility Skill roll'));
          }
          break;
        case 'Akodo':
          if((skill || attack) && api.isBugei(context.skillName) && api.skillFamily(context.skillName) !== 'iaijutsu') out.push(api.mod(a, 1, 0, 'Bugei Skill'));
          break;
        case 'Ikoma':
          if((skill || attack || traitRoll) && trait === 'Intelligence') out.push(api.mod(a, 1, 0, 'Intelligence'));
          break;
        case 'Kaimetsu-Uo':
          if((skill || traitRoll) && trait === 'Willpower' && !api.armed(context, 'kaimetsu-provoked')) out.push(api.mod(a, 1, 1, 'Willpower'));
          break;
        case 'Shiba':
          if((skill || attack || traitRoll) && trait === 'Intelligence') out.push(api.mod(a, 1, 1, 'Intelligence'));
          break;
        case 'Bayushi':
          if((skill || attack) && api.bayushiTrained() && api.mySchoolSkillBases().has(api.skillId(context.skillName))) out.push(api.mod(a, 1, 0, 'School Skill'));
          break;
        case 'Shosuro':
          if(skill && api.skillIn(context, ['Stealth', 'Acting'])) out.push(api.mod(a, 3, 1, context.skillName));
          break;
        case 'Kuni Yori':
          if(kind === K.SPELL && context.maho === true) out.push(api.mod(a, 1, 0, 'maho Casting Roll'));
          break;
        case 'Shinjo':
          if(skill && trait === 'Awareness' && api.skillIn(context, ['Etiquette'])) out.push(api.mod(a, 1, 1, 'Etiquette'));
          break;
      }
      return out;
    };

    // ---------- Per-roll declarations (Feature 4.5.15's registry, Part I) ----------
    const socialSkills = function(){
      return (typeof D45 === 'object' && D45 && Array.isArray(D45.socialSkills)) ? D45.socialSkills : null;
    };
    api.DECLARATIONS = {
      'kuni-cast':{who:'Kuni', label:function(){ return 'Kuni’s gift (once per session, a Void Point) — +0k' + api.ring('earth'); },
        note:'Your Earth Rank in kept dice. Spend the Void Point yourself.',
        when:function(c){ return c.kind === ROLL_KINDS.SPELL; }, mod:function(){ return [0, api.ring('earth')]; }},
      'kakita-reroll':{who:'Kakita', label:function(){ return 'Kakita’s re-roll (a Void Point spent) — +1k1'; },
        note:'Only on the second roll; keep the better of the two.',
        when:function(c){ return c.kind === ROLL_KINDS.SKILL && api.skillIn(c, ['Iaijutsu', 'Artisan']); }, mod:function(){ return [1, 1]; }},
      'kitsuki-lie':{who:'Agasha Kitsuki', label:function(){ return 'A Void Point spent to tell whether someone is lying — +1k1 more'; },
        note:'Makes the Void Point’s +1k1 into +2k2; spend it in this preview too.',
        when:function(c){ return c.kind === ROLL_KINDS.SKILL || c.kind === ROLL_KINDS.TRAIT; }, mod:function(){ return [1, 1]; }},
      'akodo-battle':{who:'Akodo', label:function(){ return 'A roll on the Mass Battle Table — +1k1'; },
        when:function(c){ return c.kind === ROLL_KINDS.SKILL && api.skillIn(c, ['Battle']); }, mod:function(){ return [1, 1]; }},
      'kaimetsu-provoked':{who:'Kaimetsu-Uo', label:function(){ return 'Resisting provocation — no +1k1 from Kaimetsu-Uo'; },
        note:'Kaimetsu-Uo’s Willpower bonus never helps you avoid being provoked.',
        when:function(c){ return (c.kind === ROLL_KINDS.SKILL || c.kind === ROLL_KINDS.TRAIT) && c.traitName === 'Willpower'; }, mod:null},
      'kaimetsu-improvised':{who:'Kaimetsu-Uo', label:function(){ return 'An improvised weapon (Jiujutsu) — +3k0'; },
        when:function(c){ return (c.kind === ROLL_KINDS.SKILL || c.kind === ROLL_KINDS.ATTACK) && api.skillIn(c, ['Jiujutsu']); }, mod:function(){ return [3, 0]; }},
      'gusai-conceal':{who:'Gusai', label:function(){ return 'Hiding a weapon on your person — +3k3'; },
        when:function(c){ return c.kind === ROLL_KINDS.SKILL && api.skillIn(c, ['Stealth', 'Sleight of Hand']); }, mod:function(){ return [3, 3]; }},
      'asako-ally':{who:'Asako', label:function(){ return 'Against one of your Allies — +1k0'; },
        when:function(c){ const list = socialSkills(); return c.kind === ROLL_KINDS.SKILL && (list ? api.skillIn(c, list) : true); }, mod:function(){ return [1, 0]; }},
      'bayushi-void':{who:'Bayushi', label:function(){ return 'A Void Point spent on this School Skill roll — +1k1 more'; },
        note:'Makes the Void Point’s +1k1 into +2k2; spend it in this preview too.',
        when:function(c){ return (c.kind === ROLL_KINDS.SKILL || c.kind === ROLL_KINDS.ATTACK) && api.bayushiTrained() && api.mySchoolSkillBases().has(api.skillId(c.skillName)); }, mod:function(){ return [1, 1]; }},
      'shosuro-deceit':{who:'Shosuro', label:function(){ return 'Lying (Sincerity (Deceit)) — +3k1'; },
        when:function(c){ return c.kind === ROLL_KINDS.SKILL && api.skillIn(c, ['Sincerity']); }, mod:function(){ return [3, 1]; }},
      'yori-deceit':{who:'Kuni Yori', label:function(){ return 'Lying (Sincerity (Deceit)) — +1k0'; },
        when:function(c){ return c.kind === ROLL_KINDS.SKILL && api.skillIn(c, ['Sincerity']); }, mod:function(){ return [1, 0]; }},
      'atarasi-strike':{who:'Hida Atarasi', label:function(){ return 'Atarasi’s corruption this round — +' + api.atarasiDice() + 'k0'; },
        note:'The higher of your Earth and your Taint Rank. Pay a Void Point or 1 Taint yourself, and add the same to this round’s damage.',
        when:function(c){ return c.kind === ROLL_KINDS.ATTACK; }, mod:function(){ return [api.atarasiDice(), 0]; }},
      'moto-resist':{who:'Moto', label:function(){ return 'Resisting restraint or mental influence — +2k2'; },
        note:'For example a grapple, or Temptation.',
        when:function(c){ return [ROLL_KINDS.SKILL, ROLL_KINDS.TRAIT, ROLL_KINDS.RING, ROLL_KINDS.MANUAL].indexOf(c.kind) !== -1; }, mod:function(){ return [2, 2]; }},
      'shinjo-enigma':{who:'Shinjo', label:function(){ return 'Understanding something new, strange or enigmatic — +1k1'; },
        when:function(c){ return c.kind === ROLL_KINDS.SKILL && api.skillIn(c, ['Investigation']); }, mod:function(){ return [1, 1]; }},
      'shinjo-honesty':{who:'Shinjo', label:function(){ return 'Telling the truth (Sincerity (Honesty)) — +1k1'; },
        when:function(c){ return c.kind === ROLL_KINDS.SKILL && api.skillIn(c, ['Sincerity']) && c.traitName === 'Awareness'; }, mod:function(){ return [1, 1]; }},
    };
    api.atarasiDice = function(){ return Math.max(api.ring('earth'), Math.floor(api.taint())); };
    api.offersFor = function(context){
      const a = api.active();
      if(!api.rollsOn() || !a || !context) return [];
      return Object.keys(api.DECLARATIONS).filter(function(k){
        const d = api.DECLARATIONS[k];
        return d.who === a.name && d.when(context);
      });
    };
    api.provider = {
      label:'Ancestor',
      offers:function(context){
        return api.offersFor(context).map(function(k){
          const d = api.DECLARATIONS[k];
          return {key:k, label:d.label(context), note:d.note || ''};
        });
      },
      modifiers:function(context, keys){
        const a = api.active(), offered = api.offersFor(context);
        return keys.filter(function(k){ return offered.indexOf(k) !== -1 && api.DECLARATIONS[k].mod; }).map(function(k){
          const m = api.DECLARATIONS[k].mod(context);
          return {label:'Ancestor: ' + a.name, rolledDelta:m[0], keptDelta:m[1], totalDelta:0, note:'Declared for this roll'};
        });
      },
    };

    // ---------- Damage and Armor TN (guarded trunk blocks call these) ----------
    api.damage = function(entry, skillName){
      const a = api.active();
      if(!a || !entry) return null;
      if(a.name === 'Hida') return {rolled:1, kept:0, note:'Ancestor (Hida): +1k0 damage'};
      if(a.name === 'Ikoma' && api.norm(skillName || entry.skill) === 'jiujutsu') return {rolled:2, kept:0, note:'Ancestor (Ikoma): +2k0 unarmed damage'};
      return null;
    };
    api.armorTN = function(){ return api.is('Shiba') ? api.trait('Intelligence') : 0; };

    // ---------- Choosing, and the favour ----------
    api.after = function(message){
      if(typeof recalcAll === 'function') recalcAll();
      if(message && typeof setStatus === 'function') setStatus(message);
    };
    api.choose = async function(name){
      if(!api.enabled()) return false;
      const read = api.read(), s = read.state;
      if(api.locked(s)){
        api.render();
        if(typeof setStatus === 'function') setStatus('No other Ancestor can take ' + s.name + '’s place: the favour was lost (Core Rulebook p. 241).');
        return false;
      }
      if(!name){
        if(!read.raw) return true;
        api.write(null);
        api.after('No Ancestor.');
        return true;
      }
      const a = api.byName(name);
      if(!a){ api.render(); return false; }
      if(s && s.name === name) return true;
      let gm = false;
      if(!api.ownClan(a)){
        if(a.clan !== 'Spider'){
          api.render();
          if(typeof setStatus === 'function') setStatus(a.name + ' guides only the ' + a.clan + ' Clan.');
          return false;
        }
        const ok = await appConfirm(a.name + ' is a Spider Ancestor. Outside the Spider Clan, a Spider Ancestor favours you only if your GM agrees (Core Rulebook p. 244). Take ' + a.name + ' as your Ancestor?', 'My GM agrees', 'ghost', 'Cancel');
        if(!ok){ api.render(); return false; }
        gm = true;
      }
      api.write({v:api.REVISION, name:a.name, lost:false, regained:false, final:false, gm:gm});
      api.after(a.name + ' is now your Ancestor (' + a.cost + ' XP).');
      return true;
    };
    api.toggleFavour = async function(){
      const s = api.current();
      if(!s) return false;
      const a = api.byName(s.name);
      if(s.final){
        await appAlert(a.name + '’s favour was lost a second time, so it is gone for good (Core Rulebook p. 241).');
        return false;
      }
      if(!s.lost){
        const message = s.regained
          ? 'Mark ' + a.name + '’s favour as lost again? By the book a second loss is final: the gifts stop for good, the points stay spent, and no other Ancestor can take this one’s place.'
          : 'Mark ' + a.name + '’s favour as lost? The gifts stop at once. Your GM may let the favour return once, after sincere repentance and about a month of devotion. The points stay spent, and no other Ancestor can take this one’s place.';
        if(!(await appConfirm(message, s.regained ? 'Lost for good' : 'Favour lost', 'ghost', 'Cancel'))) return false;
        api.write(Object.assign({}, s, {lost:true, final:s.regained}));
        api.after(a.name + '’s favour is lost' + (s.regained ? ' for good.' : '.'));
        return true;
      }
      if(!(await appConfirm('Has your GM let ' + a.name + '’s favour return? By the book it can return only once; a second loss is final.', 'Favour returned', 'ghost', 'Cancel'))) return false;
      api.write(Object.assign({}, s, {lost:false, regained:true, final:false}));
      api.after(a.name + '’s favour has returned.');
      return true;
    };

    // ---------- The card (Clan & School tab) ----------
    api.showInfo = function(){
      if(typeof populateInfoOverlay !== 'function') return;
      const s = api.current(), a = s ? api.byName(s.name) : null;
      populateInfoOverlay('Ancestors', 'Core Rulebook pp. 241–244',
        api.RULES.join('\n\n') + '\n\n' + api.SPIDER_RULE + (a ? '\n\nYour Ancestor: ' + api.detailsText(a) : ''));
    };
    api.detailsText = function(a){
      return a.name + ' (' + a.clan + ', ' + a.cost + ' XP, Core Rulebook ' + a.page + '). ' + a.about + '\n' +
        a.gifts.map(function(g){ return '• ' + g.text + ' [' + api.HOW[g.how] + ']'; }).join('\n') + '\nDemands: ' + a.demands;
    };
    // Who the Ancestor is, what it gives and what it asks: shared by the card and the wizard.
    api.details = function(a){
      const box = el('div', 'anc48-details');
      const head = el('div', 'anc48-card-head');
      head.appendChild(el('span', 'anc48-name', a.name));
      head.appendChild(el('span', 'anc48-meta', a.clan + ' · ' + a.cost + ' XP · Core Rulebook ' + a.page));
      box.appendChild(head);
      box.appendChild(el('p', 'anc48-about', a.about));
      box.appendChild(el('div', 'anc48-sub', 'Gifts'));
      const list = el('ul', 'anc48-gifts');
      a.gifts.forEach(function(g){
        const li = el('li', 'anc48-gift');
        li.appendChild(el('span', 'anc48-gift-text', g.text));
        li.appendChild(el('span', 'anc48-how anc48-how-' + g.how, api.HOW[g.how]));
        if(g.note) li.appendChild(el('span', 'anc48-gift-note', g.note));
        list.appendChild(li);
      });
      box.appendChild(list);
      box.appendChild(el('div', 'anc48-sub', 'Demands'));
      box.appendChild(el('p', 'anc48-demands', a.demands));
      if(a.clan === 'Spider') box.appendChild(el('p', 'anc48-spider', api.SPIDER_RULE));
      return box;
    };
    api.build = function(){
      if(!api.enabled() || $('anc48Section')) return false;
      const anchor = $('cfs_appliedAffinity');
      const host = anchor && anchor.parentElement;
      if(!host) return false;
      const section = el('div', 'anc48-section');
      section.id = 'anc48Section';
      const field = document.createElement('input');
      field.type = 'hidden';
      field.id = api.FIELD;
      field.value = '';
      section.appendChild(field);
      const head = el('div', 'anc48-head');
      head.appendChild(el('h3', 'anc48-title', 'Ancestor'));
      head.appendChild(el('span', 'anc48-optional', 'optional'));
      const info = el('button', 'ghost anc48-info print-hide', 'i');
      info.type = 'button';
      info.id = 'anc48Info';
      info.setAttribute('aria-label', 'About Ancestors');
      info.addEventListener('click', api.showInfo);
      head.appendChild(info);
      section.appendChild(head);
      section.appendChild(el('div', 'hint anc48-hint', 'A great hero of your Clan who watches over you from Yomi. Bought with Experience Points like an Advantage; it gives you gifts and makes demands of you. Ask your GM before taking one.'));
      const pick = el('div', 'field anc48-pick-field');
      const label = el('label', '', 'Ancestor');
      label.htmlFor = 'anc48Pick';
      const select = el('select', 'field anc48-pick');
      select.id = 'anc48Pick';
      select.addEventListener('change', function(){ api.choose(select.value); });
      pick.appendChild(label);
      pick.appendChild(select);
      const fixed = el('p', 'anc48-fixed');
      fixed.id = 'anc48Fixed';
      fixed.hidden = true;
      pick.appendChild(fixed);
      section.appendChild(pick);
      const card = el('div', 'anc48-card');
      card.id = 'anc48Card';
      card.hidden = true;
      section.appendChild(card);
      host.appendChild(section);
      return true;
    };
    api.groups = function(){
      const clan = api.clan();
      const own = api.LIBRARY.filter(function(a){ return api.ownClan(a); });
      const spider = api.LIBRARY.filter(function(a){ return a.clan === 'Spider' && !api.ownClan(a); });
      const other = api.LIBRARY.filter(function(a){ return !api.choosable(a); });
      const groups = [];
      if(own.length) groups.push({label:(own[0].clan === 'Spider' ? 'Spider' : own[0].clan) + ' Clan', items:own, disabled:false});
      if(spider.length) groups.push({label:'Spider — only with your GM’s permission', items:spider, disabled:false});
      groups.push({label:(clan ? 'Other Clans — they guide only their own' : 'Choose your Clan to see its Ancestors'), items:other, disabled:true});
      return groups;
    };
    api.fillOptions = function(select, s){
      const sig = api.clan() + '|' + (s ? s.name : '');
      if(select.dataset.anc48Sig === sig && select.options.length) return;
      select.dataset.anc48Sig = sig;
      select.textContent = '';
      const none = el('option', '', '— No Ancestor —');
      none.value = '';
      select.appendChild(none);
      api.groups().forEach(function(g){
        const group = document.createElement('optgroup');
        group.label = g.label;
        g.items.forEach(function(a){
          const o = el('option', '', a.name + ' — ' + a.cost + ' XP' + (g.disabled ? ' (' + a.clan + ')' : ''));
          o.value = a.name;
          o.disabled = g.disabled;
          group.appendChild(o);
        });
        select.appendChild(group);
      });
      select.value = s ? s.name : '';
    };
    api.render = function(){
      const select = $('anc48Pick'), card = $('anc48Card'), fixed = $('anc48Fixed');
      if(!api.enabled() || !select || !card || !fixed) return false;
      const read = api.read(), s = read.state;
      api.fillOptions(select, s);
      if(select.value !== (s ? s.name : '')) select.value = s ? s.name : '';
      const locked = api.locked(s);
      select.hidden = locked;
      fixed.hidden = !locked;
      fixed.textContent = locked ? s.name + ' — the favour has been lost, so no other Ancestor can take this one’s place (Core Rulebook p. 241).' : '';
      card.textContent = '';
      if(read.raw && !s){
        card.hidden = false;
        card.className = 'anc48-card anc48-inactive';
        card.appendChild(el('p', 'anc48-flag', 'The saved Ancestor setting is not one this sheet recognises, so nothing is applied or charged. It is kept unchanged until you choose again.'));
        return true;
      }
      if(!s){ card.hidden = true; card.className = 'anc48-card'; return true; }
      const a = api.byName(s.name), reason = api.inactiveReason(s);
      card.hidden = false;
      card.className = 'anc48-card' + (s.lost ? ' anc48-lost' : reason ? ' anc48-inactive' : '');
      card.appendChild(api.details(a));
      if(s.gm && api.spiderGuest(a)) card.appendChild(el('p', 'anc48-note', 'Chosen with your GM’s permission (Core Rulebook p. 244).'));
      if(reason && !s.lost) card.appendChild(el('p', 'anc48-flag', reason));
      if(!reason && a.name === 'Bayushi' && !api.bayushiTrained()) card.appendChild(el('p', 'anc48-flag', 'You are not trained in a Bayushi School, so the School Skill bonuses are not applied.'));
      if(!reason && a.name === 'Moto') card.appendChild(el('p', 'anc48-note', 'Right now that raises such a spell’s Casting TN by ' + (5 * api.trait('Willpower')) + '.'));
      api.flags(a, s).forEach(function(t){ card.appendChild(el('p', 'anc48-flag', t)); });
      const favour = el('div', 'anc48-favour');
      const badge = el('button', 'anc48-badge print-hide', api.BADGE);
      badge.type = 'button';
      badge.id = 'anc48Badge';
      badge.setAttribute('aria-pressed', s.lost ? 'true' : 'false');
      badge.disabled = s.final;
      badge.addEventListener('click', function(){ api.toggleFavour(); });
      favour.appendChild(badge);
      const status = s.final ? 'Favour lost for good: lost a second time. The points stay spent.'
        : s.lost ? 'Favour lost: ' + a.name + '’s gifts are switched off. If your GM lets the favour return (once, after about a month of devotion), press the badge again.'
        : s.regained ? 'The favour returned once. A second loss is final.'
        : 'If ' + a.name + ' leaves you, press the badge: every gift stops.';
      favour.appendChild(el('p', 'anc48-status', status));
      card.appendChild(favour);
      return true;
    };

    // ---------- The creation wizard (Phase 11.2, Part K): on the Family screen, and in Review ----------
    api.wizardBlock = function(body){
      if(!api.enabled() || typeof CW112 !== 'object' || !CW112) return;
      const s = api.current();
      const wrap = el('div', 'anc48-wizard');
      wrap.id = 'anc48Wizard';
      wrap.appendChild(el('h3', 'cw112-sub', 'Ancestor (optional)'));
      // The note is a div, so this block's own card grid is never the step's first grid: Phase 11.2's
      // (Part K) checks read the Families from the first one.
      wrap.appendChild(el('div', 'cw112-note', 'A great hero of your Clan can watch over you from Yomi. An Ancestor costs Experience Points like an Advantage, gives you gifts and makes demands of you. Ask your GM first; you can skip this and add one later on the sheet (Clan & School).'));
      if(api.locked(s)){
        wrap.appendChild(el('p', 'cw112-note', s.name + '’s favour has been lost, so no other Ancestor can take this one’s place.'));
      } else {
        const cards = el('div', 'cw112-cards');
        cards.appendChild(CW112.card('No Ancestor', 'Skip this for now', null, !s, async function(){ await api.choose(''); CW112.render(); }));
        api.LIBRARY.filter(api.choosable).forEach(function(a){
          const sub = a.cost + ' XP · ' + (api.spiderGuest(a) ? 'Spider, with your GM’s permission' : a.clan);
          cards.appendChild(CW112.card(a.name, sub, null, !!s && s.name === a.name, async function(){ await api.choose(a.name); CW112.render(); }));
        });
        wrap.appendChild(cards);
      }
      if(s) wrap.appendChild(api.details(api.byName(s.name)));
      body.appendChild(wrap);
    };
    api.wizardReview = function(body){
      const s = api.current();
      const dl = body.querySelector('.cw112-summary');
      if(!dl) return;
      const dts = Array.from(dl.querySelectorAll('dt'));
      // After School, so the summary's first four lines (Name, Clan, Family, School) stay as they were.
      const school = dts.find(function(dt){ return dt.textContent === 'School'; });
      const dt = el('dt', '', 'Ancestor');
      const dd = el('dd', '', s ? s.name + ' (' + api.byName(s.name).cost + ' XP)' : 'None');
      const after = school && school.nextElementSibling;
      if(after){ dl.insertBefore(dd, after.nextSibling); dl.insertBefore(dt, dd); }
      else { dl.appendChild(dt); dl.appendChild(dd); }
    };
    api.wizardInstall = function(){
      if(typeof CW112 !== 'object' || !CW112 || !Array.isArray(CW112.steps)) return false;
      const family = CW112.steps.find(function(st){ return st && st.id === 'family'; });
      if(family && !family.anc48){
        const previous = family.render;
        family.render = function(body){ previous.apply(this, arguments); api.wizardBlock(body); };
        family.anc48 = true;
      }
      const review = CW112.steps.find(function(st){ return st && st.id === 'review'; });
      if(review && !review.anc48){
        const previous = review.render;
        review.render = function(body){ previous.apply(this, arguments); api.wizardReview(body); };
        review.anc48 = true;
      }
      return !!family;
    };
    return api;
  })();

  // Called by guarded blocks in shared files; each is 0 or null while the Ancestor is off.
  function ancestorXpCost(){ return ANC48.enabled() ? ANC48.cost() : 0; }
  function ancestorArmorTNBonus(){ return ANC48.enabled() ? ANC48.armorTN() : 0; }
  function ancestorDamageDice(entry, skillName){ return ANC48.enabled() ? ANC48.damage(entry, skillName) : null; }
  function renderAncestorCard(){ if(ANC48.enabled()) ANC48.render(); }
  // One line in the damage roll's own result naming the Ancestor's dice, as Feature 4.5.12 (Part I)
  // does for Bishamon: the pool already holds them, so this only explains.
  function ancestorDamageRollNote(dmg){
    if(!ANC48.enabled() || !dmg || !Array.isArray(dmg.breakdown)) return;
    const line = dmg.breakdown.filter(function(t){ return /^Ancestor \(/.test(String(t)); })[0];
    const body = document.getElementById('rollModalBody');
    if(!line || !body) return;
    const note = document.createElement('div');
    note.className = 'roll-note anc48-roll-note';
    note.textContent = line;
    body.appendChild(note);
  }

  if(ANC48.enabled()){
    ANC48.build();
    // Gifts reach the dice through Phase 4.5's single adv-config seat (Part I), like every
    // configured Advantage: no new registry seat. Without that phase the card, cost, damage and
    // Armor TN still work and no roll bonus is added.
    if(typeof advConfigExtendedRollModifiers === 'function'){
      const anc48PreviousModifiers = advConfigExtendedRollModifiers;
      advConfigExtendedRollModifiers = function(context){
        return (anc48PreviousModifiers(context) || []).concat(ANC48.modifiers(context));
      };
    }
    // Declared dependency on the roll declaration registry (Feature 4.5.15, Part I); without it
    // the declared gifts stay on the card as text and nothing is offered at roll time.
    if(typeof RD4515 === 'object' && RD4515) RD4515.register(ANC48.PROVIDER, ANC48.provider);
    // A save written before this part has no Ancestor field; after it loads, the previous
    // character's Ancestor must not stay behind. Cleared only after a load that went ahead, so a
    // refused load (and the Characters list's save of the open character) sees the sheet as it was.
    const anc48PreviousApply = applyData;
    applyData = function(data){
      const result = anc48PreviousApply.apply(this, arguments);
      const has = !!(data && data.fields && Object.prototype.hasOwnProperty.call(data.fields, ANC48.FIELD));
      const f = ANC48.field();
      if(result !== false && !has && f && f.value){
        f.value = '';
        if(typeof recalcAll === 'function') recalcAll();
      }
      return result;
    };
    // Play mode (Phase 12, Part K): the picker is locked; the favour badge and information stay live.
    if(typeof MODES12 === 'object' && MODES12 && typeof MODES12.register === 'function') MODES12.register('#anc48Pick');
    ANC48.wizardInstall();
  }
  // ================= END PART I PHASE 4.8 =================
