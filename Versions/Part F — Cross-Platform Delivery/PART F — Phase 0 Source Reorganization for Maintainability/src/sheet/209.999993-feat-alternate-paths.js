  // ========= PART I PHASE 4.6: ALTERNATE PATHS (first and second releases) =========
  // The Core Rulebook's 27 Alternate Paths and the engine work they need, to the owner's approvals
  // of 1 October 2026. The first release: the 18 Great Clan Paths (pp. 251-255). The second: the 9
  // Miscellaneous Paths (pp. 256-257: the Emerald and Jade Magistrates, the Imperial and Jade
  // Legionnaires, the five Champions), and more than one Path in the same School.
  //
  // What this part changes in the Alternate Path engine (070-schools-paths-techniques.js and the
  // picker in 050-kiho-rules.js), each by rebinding a trunk function from here:
  //   * A taken Path is recorded against its School. f_pathTaken was {"<Rank>": "<Path>"}, read
  //     against whichever School was active, so a Path taken in a first School replaced a second
  //     School's Technique at the same Rank (measured on 1 October). It is now
  //     {"<School>": {"<Rank>": "<Path>"}}, carried up from the old shape by a Phase 7 (Part J)
  //     format step, and read the old way only for a save that never met that step.
  //   * A `replaces` clause may name a Clan and a School type instead of a School ("any Crab Bushi
  //     School"): {clan:'Crab', type:'bushi', rank:2}. A School's type comes from its tag (the
  //     bracket in its name, or the word its name ends with) and the library's shugenja/monk flags.
  //   * Each clause carries its own Rank: Empress Guard replaces Kakita Bushi 3 or Daidoji Iron
  //     Warrior 4, so the Rank a Path replaces is read from the clause that matched the School.
  //   * Requirements gain Honor, a named Disadvantage and "one Skill of a kind at a Rank".
  //   * Core p. 246: a monk's first Path grants exactly one Kiho at its Rank, and a later Path none
  //     (owner's ruling, 1 October). For a shugenja the same page gives one spell for a first Path
  //     and none for a later one; the sheet keeps no count of spells per Rank, so that is a note.
  //   * Every clause of these Paths is checked at load: a School name that does not resolve, or a
  //     Clan-and-type clause that matches no School, is reported, never silently ineligible.
  // The second release adds:
  //   * Clauses that accept several School types ({types:['bushi','courtier','shugenja']}), and the
  //     Champion Paths' "any Rank" ({anyRank:true}): the player picks the Rank when taking one.
  //   * Glory (the Glory block's Rank field, as Honor reads its Rank field) and appointments (things
  //     to confirm with the GM) as requirements; the Magistrates' rule that a member of the Imperial
  //     families may ignore one Skill Rank requirement.
  //   * Several Paths in one School (Core p. 246): each Rank replaced once; the trunk's picker, which
  //     held one Path, is replaced by one that adds and removes. A Path the character already holds
  //     in another School is not offered again.
  //   * Core p. 246 again: a later Path is not a Rank of the basic School for effects that depend on
  //     School Rank, so Kiho Mastery, the Kiho purchase cap, a shugenja's School Rank for spells and
  //     Mirumoto's Rank-scaled Techniques count without it.
  //   * The Topaz Champion's Technique keeps the one it replaces (p. 257): both are granted.
  //
  // Technique effects are described, not automated, exactly as every School Technique on the sheet
  // is. Every description is this project's own words with its page (owner's ruling, 30 September).
  const ALTERNATE_PATHS_ENABLED = true;

  const AP46 = (function(){
    const api = {};
    api.FIELD = 'f_pathTaken';
    api.STEP_NAME = 'Phase 4.6 (Part I): Alternate Paths recorded against their School';
    api.TYPES = ['bushi', 'courtier', 'shugenja', 'monk', 'ninja', 'artisan'];
    api.enabled = function(){ return ALTERNATE_PATHS_ENABLED; };
    const $ = function(id){ return document.getElementById(id); };

    // ---------- The 18 Great Clan Paths (Core Rulebook pp. 251-255) ----------
    // techRank is the Rank the Path replaces; where its clauses differ (Empress Guard) the clause
    // that matched the School decides, through api.rankFor().
    const noReq = function(extra){
      return Object.assign({rings:{}, traits:{}, skills:{}, emphases:[], advantages:[], narrative:[]}, extra || {});
    };
    api.PATHS = [
      {name:'Oni Slayer [Shugenja]', source:'Core Rulebook p.251', techRank:3,
       replaces:[{school:'Kuni Shugenja', rank:3}], excludes:[],
       requires:noReq({skills:{'Lore: Shadowlands':3}}), tech:'Bound by the World'},
      {name:'Crab Berserker [Bushi]', source:'Core Rulebook p.251', techRank:2,
       replaces:[{clan:'Crab', type:'bushi', rank:2}], excludes:[],
       requires:noReq({rings:{Earth:4}}), tech:'Berserker’s Rage'},
      {name:'Empress Guard [Bushi]', source:'Core Rulebook p.252', techRank:3,
       replaces:[{school:'Kakita Bushi', rank:3}, {school:'Daidoji Iron Warrior', rank:4}], excludes:[],
       requires:noReq({traits:{Perception:3}}), tech:'To Defend Unto Death'},
      {name:'Asahina Fetishist [Shugenja]', source:'Core Rulebook p.252', techRank:2,
       replaces:[{school:'Asahina Shugenja', rank:2}], excludes:[],
       requires:noReq({skillOfKind:[{kinds:['Craft', 'Artisan'], rank:3, label:'one Craft or Artisan Skill at Rank 3'}]}),
       tech:'The World in the Palm of the Hand'},
      {name:'Mirumoto Mountaineer [Bushi]', source:'Core Rulebook p.252', techRank:2,
       replaces:[{school:'Mirumoto Bushi', rank:2}], excludes:[],
       requires:noReq({emphases:[['Athletics', 'Climbing', 3]]}), tech:'Heart of the Mountain'},
      {name:'Tamori Warrior Priest [Shugenja]', source:'Core Rulebook p.252', techRank:4,
       replaces:[{school:'Tamori Shugenja', rank:4}], excludes:[],
       requires:noReq({skillOfKind:[{kinds:['Weapon'], rank:3, label:'one Weapon Skill at Rank 3'}]}),
       tech:'Strength of the Soul'},
      // Printed as "Honor Rank 5, Dishonored Disadvantage" and read as printed: Honor 5.0 or more.
      {name:'Deathseeker [Bushi]', source:'Core Rulebook p.253', techRank:1,
       replaces:[{clan:'Lion', type:'bushi', rank:1}], excludes:[],
       requires:noReq({honor:5, disadvantages:['Dishonored']}), tech:'Honor of the Lion'},
      {name:'Bishamon’s Chosen [Shugenja]', source:'Core Rulebook p.253', techRank:3,
       replaces:[{school:'Kitsu Shugenja', rank:3}], excludes:[],
       requires:noReq({skills:{Battle:3}}), tech:'Scion of Strength'},
      {name:'Yoritomo Scoundrel [Bushi]', source:'Core Rulebook p.253', techRank:2,
       replaces:[{school:'Yoritomo Bushi', rank:2}], excludes:[],
       requires:noReq({skills:{Commerce:2, Sailing:2}}), tech:'Revel in Villainy'},
      // The sheet files the Mantis with the Minor Clans; the clause reads both libraries.
      {name:'Mantis Navigator [Shugenja]', source:'Core Rulebook p.253', techRank:3,
       replaces:[{clan:'Mantis', type:'shugenja', rank:3}], excludes:[],
       requires:noReq({emphases:[['Sailing', 'Navigation', 3]]}), tech:'The Fortunes’ Guidance'},
      {name:'Shiba Yojimbo [Bushi]', source:'Core Rulebook p.254', techRank:3,
       replaces:[{school:'Shiba Bushi', rank:3}], excludes:[],
       requires:noReq({honor:5}), tech:'Shiba’s Sacrifice'},
      {name:'Isawa Tensai [Shugenja]', source:'Core Rulebook p.254', techRank:2,
       replaces:[{school:'Isawa Shugenja', rank:2}], excludes:[],
       requires:noReq({skills:{'Lore: Elements':3, Spellcraft:3}}), tech:'Embrace the Elements'},
      {name:'Bitter Lies Swordsman [Bushi]', source:'Core Rulebook p.254', techRank:3,
       replaces:[{school:'Bayushi Bushi', rank:3}], excludes:[],
       requires:noReq({skills:{Kenjutsu:3}}), tech:'The Dark Sword of Bitter Lies'},
      {name:'Shadow Hunter [Shugenja]', source:'Core Rulebook pp.254-255', techRank:3,
       replaces:[{clan:'Scorpion', type:'shugenja', rank:3}], excludes:[],
       requires:noReq({skills:{Stealth:3}}), tech:'Scourge in Shadow'},
      {name:'Shinjo Scout [Bushi]', source:'Core Rulebook p.255', techRank:2,
       replaces:[{school:'Moto Bushi', rank:2}, {school:'Shinjo Bushi', rank:2}], excludes:[],
       requires:noReq({skills:{Stealth:3}}), tech:'The Swift Soul'},
      {name:'Obsidian Magistrate [Bushi]', source:'Core Rulebook p.255', techRank:1,
       replaces:[{school:'Daigotsu Bushi', rank:1}], excludes:[],
       requires:noReq({skills:{Investigation:2}}), tech:'Strength in Terror'},
      {name:'Iuchi Traveler [Shugenja]', source:'Core Rulebook p.255', techRank:3,
       replaces:[{school:'Iuchi Shugenja', rank:3}, {school:'Horiuchi Shugenja', rank:3}], excludes:[],
       requires:noReq({skills:{Athletics:2, Horsemanship:2}}), tech:'Where the Wind Wills'},
      {name:'Chuda Subversive [Shugenja]', source:'Core Rulebook p.255', techRank:4,
       replaces:[{school:'Chuda Shugenja', rank:4}], excludes:[],
       requires:noReq({skills:{'Lore: Shadowlands':4}}), tech:'The Dark Kami’s Discretion'},
      // ---------- The 9 Miscellaneous Paths (Core Rulebook pp. 256-257), second release ----------
      // An appointment is something no sheet can check, so it is a thing to confirm with the GM.
      // The Champions replace "any level Technique" (p. 256): anyRank, the Rank chosen when taken.
      {name:'Emerald Magistrate', source:'Core Rulebook p.256', techRank:4,
       replaces:[{types:['bushi', 'courtier', 'shugenja'], rank:4}], excludes:[],
       requires:noReq({skills:{Investigation:3, 'Lore: Law':3}, imperialSkillWaiver:true,
                       narrative:['an appointment as an Emerald Magistrate']}),
       note:'a generous GM may let a character whose School makes attacks Simple Actions at Rank 4 take this Path at Rank 3 or 5 instead',
       tech:'Honor Is My Shield'},
      {name:'The Amethyst Champion', source:'Core Rulebook p.256', techRank:null,
       replaces:[{type:'courtier', anyRank:true}], excludes:[],
       requires:noReq({narrative:['appointment as the Amethyst Champion']}), tech:'The Emperor’s Voice'},
      {name:'The Emerald Champion', source:'Core Rulebook p.256', techRank:null,
       replaces:[{type:'bushi', anyRank:true}], excludes:[],
       requires:noReq({narrative:['appointment as the Emerald Champion']}), tech:'The Emperor’s Hand'},
      {name:'Imperial Legionnaire', source:'Core Rulebook p.256', techRank:2,
       replaces:[{type:'bushi', rank:2}], excludes:[],
       requires:noReq({glory:2, narrative:['an appointment to the Imperial Legions']}), tech:'Strength of the Empire'},
      {name:'The Jade Champion', source:'Core Rulebook p.257', techRank:null,
       replaces:[{type:'shugenja', anyRank:true}], excludes:[],
       requires:noReq({narrative:['appointment as the Jade Champion']}), tech:'The Emperor’s Will'},
      {name:'Jade Legionnaire', source:'Core Rulebook p.257', techRank:2,
       replaces:[{types:['bushi', 'shugenja'], rank:2}], excludes:[],
       requires:noReq({glory:2, narrative:['an appointment to the Jade Legion']}), tech:'Purity in Purpose & Deed'},
      {name:'The Ruby Champion', source:'Core Rulebook p.257', techRank:null,
       replaces:[{type:'bushi', anyRank:true}], excludes:[],
       requires:noReq({narrative:['appointment as the Ruby Champion']}), tech:'Master of the Dojo'},
      {name:'Jade Magistrate', source:'Core Rulebook p.257', techRank:4,
       replaces:[{types:['bushi', 'courtier', 'shugenja'], rank:4}], excludes:[],
       requires:noReq({skills:{'Lore: Law':3, Spellcraft:3}, imperialSkillWaiver:true,
                       narrative:['an appointment as a Jade Magistrate']}),
       tech:'Scent of the Kami'},
      // The book prints no School type for the Topaz Champion: any School may take it.
      {name:'The Topaz Champion', source:'Core Rulebook p.257', techRank:null,
       replaces:[{anyRank:true}], excludes:[],
       requires:noReq({narrative:['winning the Topaz Championship']}), keepsReplacedTechnique:true,
       tech:'Soul of Promise'},
    ];

    // ---------- The Techniques, in this project's own words ----------
    api.DESCRIPTIONS = {
      'Bound by the World': 'Spend an hour and expend an Earth spell slot to draw a binding circle, making a Spell Casting Roll with no TN: its total is the circle’s strength. The circle covers up to your School Rank × 5 square feet (other Kuni may join, adding their School Ranks, with one of you rolling). An oni that enters cannot leave without a Willpower roll against that total. While the circle stands you have one fewer Earth spell slot a day. (Oni Slayer, Core Rulebook p.251)',
      'Berserker’s Rage': 'Once per skirmish, in the Reactions Stage, you may enter a rage lasting twice your Earth Ring in Rounds (spend a Void Point in a Reactions Stage to end it sooner). While raging you cannot take the Center, Defense or Full Defense Stances or use any non-Bugei Skill, you ignore every penalty and effect of your Wound Ranks, and you gain +2k1 to attack and damage rolls. Killed while raging, you fight on until the rage ends but cannot be healed unless Force of Will is cast on you first; the rage ends at once if your Wounds reach twice what would kill you. (Crab Berserker, Core Rulebook p.251)',
      'To Defend Unto Death': 'Add half your Honor Rank to the total of every attack roll and Perception roll. While you are defending the Imperial family, +10 to your Armor TN. (Empress Guard, Core Rulebook p.252)',
      'The World in the Palm of the Hand': 'When you make a small token with an Artisan or Craft Skill, you may spend a Void Point to bless it once. Whoever holds the token may call on the blessing at any time for +2k0 on one High Skill Roll. Nobody may use more than one such token a day. (Asahina Fetishist, Core Rulebook p.252)',
      'Heart of the Mountain': 'If you would be surprised in a skirmish because you lost the Investigation (Notice) / Perception Contested Roll, you may at once make a second roll with Athletics / Agility; succeed and you are not surprised. You also add half your Athletics Rank, rounded up, to the total of every ranged attack roll. (Mirumoto Mountaineer, Core Rulebook p.252)',
      'Strength of the Soul': 'Expend a spell slot as a Free Action for +1k0 on any Bugei Skill roll, using no more slots this way in a Round than your School Rank. A melee attack with a weapon made by Bo of Water, Tetsubo of Earth, Katana of Fire or Yari of Air is a Simple Action for you. (Tamori Warrior Priest, Core Rulebook p.252)',
      'Honor of the Lion': 'You gain the Benefit, Skills, Honor and Outfit of a Rank 1 Lion bushi (from any Lion Bushi School). Once in your Turn you may add your Honor Rank to the total of one damage roll; if you do, your Armor TN is 5 lower until the Reactions Stage of the next Round. In the Full Attack Stance you gain +1k0 to attack rolls. (Deathseeker, Core Rulebook p.253)',
      'Scion of Strength': 'Expend a spell slot as a Free Action for +1k0 on any roll that uses Strength, a melee weapon’s damage roll included, or for +1k0 on the Spell Casting Roll of a spell with the Battle keyword. (Bishamon’s Chosen, Core Rulebook p.253)',
      'Revel in Villainy': 'When you spend a Void Point on an Athletics, Commerce, Sailing, Sincerity or Low Skill roll, also add twice your School Rank to its total. (Yoritomo Scoundrel, Core Rulebook p.253)',
      'The Fortunes’ Guidance': 'Spend a Void Point as a Simple Action to calm difficult weather out to your School Rank × 20 feet around you, for School Rank Rounds in a skirmish or School Rank hours otherwise. Weather raised by a spell can be calmed only if its Mastery Level is no higher than your School Rank, and then also costs spell slots equal to that Mastery Level. (Mantis Navigator, Core Rulebook p.253)',
      'Shiba’s Sacrifice': 'At the start of a skirmish name one ally as your charge. Whenever your charge is hit by a physical attack or a damaging spell aimed at them (not an area effect) while you are within 10 feet, you may roll Defense / Reflexes at TN 25; on a success you take the damage instead. A Void Point you spend to reduce that damage removes 20 Wounds rather than 10. (Shiba Yojimbo, Core Rulebook p.254)',
      'Embrace the Elements': 'Take a second Affinity in an Element you already have an Affinity for, and a Deficiency in every other Element. The book’s example: a Rank 1 Isawa with a Fire Affinity becomes a Rank 2 shugenja casting Fire spells up to Mastery 4 but every other Element only up to Mastery 1. The sheet does not change your Affinities for you. (Isawa Tensai, Core Rulebook p.254)',
      'The Dark Sword of Bitter Lies': 'Spend a Void Point to reroll any one roll at once, with no penalty to the TN even if the first roll failed, and keep whichever result you prefer. That roll may never be rerolled again by any means. (Bitter Lies Swordsman, Core Rulebook p.254)',
      'Scourge in Shadow': 'Gain +2k0 on the Spell Casting Roll of a damaging spell aimed at an opponent who does not know you are there. You may also expend one spell slot as a Free Action for +1k1 on a Knives or Stealth roll. (Shadow Hunter, Core Rulebook pp.254-255)',
      'The Swift Soul': 'You can use Stealth on horseback, you count as having the Way of the Land Advantage wherever you are, and you gain +1k0 to all attack rolls while Mounted. (Shinjo Scout, Core Rulebook p.255)',
      'Strength in Terror': 'You gain the Benefit, Skills, Honor and Outfit of a Rank 1 Daigotsu Bushi. Add your Perception plus your Taint Rank to the total of every High and Bugei Skill roll other than Weapon Skills, and add the difference between your Honor and your opponent’s to attack rolls against that opponent. (Obsidian Magistrate, Core Rulebook p.255)',
      'Where the Wind Wills': 'As a Simple Action, spend a Void Point and expend an Air or Water spell slot (never Void) to teleport yourself and what you carry up to your School Rank × 100 feet; more slots carry you farther. A second Void Point brings the horse-sized mount you are riding. (Iuchi Traveler, Core Rulebook p.255)',
      'The Dark Kami’s Discretion': 'Expend three spell slots to hide your own Taint, or that of a willing person you touch, completely for School Rank hours. A Tainted person hidden this way is for the time unharmed by jade and by effects aimed at the Taint, but cannot use maho, Shadowlands Powers or any other Taint ability. A creature Tainted by nature, such as an oni or a goblin, only escapes Taint detection. Physical mutations stay visible. (Chuda Subversive, Core Rulebook p.255)',
      'Honor Is My Shield': 'You gain Reduction equal to half your Honor Rank, rounded up, on top of any Reduction from armor or anything else. (Emerald Magistrate, Core Rulebook p.256)',
      'The Emperor’s Voice': 'As a Free Action, spend a Void Point to gain for a while the use of any courtier Technique that has been used against you in the past seven days. (The Amethyst Champion, Core Rulebook p.256)',
      'The Emperor’s Hand': '+1k1 on all High and Bugei Skill rolls, and a further +1k0 on your School Skills. You also gain bonus Void Points each day equal to your highest Ring, which you cannot spend yourself: once per Round, as a Free Action, you may give them to one subordinate or ally you can see, for any roll they could spend a Void Point on. (The Emerald Champion, Core Rulebook p.256)',
      'Strength of the Empire': 'When you spend a Void Point on a roll while fighting beside other Imperial Legionnaires or Emerald or Jade Magistrates, add the number of such allies within 25 feet to the roll’s total. (Imperial Legionnaire, Core Rulebook p.256)',
      'The Emperor’s Will': 'A Free Raise on every Spell Casting Roll, and a second one against an opponent who practises outlawed magic (maho, yobanjin shamanism, gaijin sorcery and the like) or carries a corrupt power such as the Shadowlands Taint or the Lying Darkness. (The Jade Champion, Core Rulebook p.257)',
      'Purity in Purpose & Deed': 'If your Honor Rank is higher than your opponent’s, add the difference to the total of all your attack and damage rolls against that opponent. Creatures and anyone else without an Honor Rank count as Honor 0. (Jade Legionnaire, Core Rulebook p.257)',
      'Master of the Dojo': 'Fighting beside allies under your command, spend a Void Point as a Complex Action to let one ally you can see use one of your Techniques until the start of your next Turn, as if they were of your School at the same Rank. (The Ruby Champion, Core Rulebook p.257)',
      'Scent of the Kami': 'Roll Perception / Spellcraft to identify any spell cast in an area within the past 48 hours, at that spell’s basic casting TN (its Mastery Level × 5, plus 5). (Jade Magistrate, Core Rulebook p.257)',
      'Soul of Promise': 'When you advance into this Path you also gain the Technique it would normally replace, so this sheet grants both. You gain bonus Void Points each day equal to your highest Ring, spent like ordinary Void Points with all their limits but only on your School Skill rolls. (The Topaz Champion, Core Rulebook p.257)',
    };

    // ---------- School type and Clan ----------
    // A School's type: the tags in its bracket ("[Artisan/Bushi]") when the bracket names one,
    // otherwise the type words in its name ("Hida Bushi", "Chuda Shugenja [Snake]"), plus the
    // library's own shugenja and monk flags. "Shiba Artisan [Courtier]" is a Courtier School.
    api.schoolTypes = function(entry){
      if(!entry || !entry.name) return [];
      const name = String(entry.name);
      const words = function(text){ return String(text).toLowerCase().split(/[^a-z]+/).filter(function(w){ return api.TYPES.indexOf(w) >= 0; }); };
      const brackets = (name.match(/\[[^\]]*\]/g) || []).join(' ');
      let found = words(brackets);
      if(!found.length) found = words(name.replace(/\[[^\]]*\]/g, ' '));
      if(entry.shugenja) found.push('shugenja');
      if(entry.brotherhood || entry.monk) found.push('monk');
      return found.filter(function(t, i){ return found.indexOf(t) === i; });
    };
    // Every Clan (Great or Minor) whose library lists this School; Toritaka Bushi is listed by both
    // the Crab and the Falcon.
    api.schoolClans = function(schoolName){
      const out = [];
      [SCHOOL_LIBRARY, MINOR_CLAN_SCHOOL_LIBRARY].forEach(function(lib){
        Object.keys(lib).forEach(function(clan){
          if(lib[clan].some(function(s){ return s.name === schoolName; }) && out.indexOf(clan) < 0) out.push(clan);
        });
      });
      return out;
    };
    api.clanExists = function(clan){
      return Object.prototype.hasOwnProperty.call(SCHOOL_LIBRARY, clan)
        || Object.prototype.hasOwnProperty.call(MINOR_CLAN_SCHOOL_LIBRARY, clan);
    };
    // The Rank a Path replaces in this School: the Rank of the first clause that matches it there.
    // A Rank-or-higher clause (Abbot) keeps the Path's own techRank, as before.
    api.rankFor = function(path, schoolName){
      const entry = findAnySchoolLibraryEntry(schoolName);
      if(!path || !entry) return null;
      const hit = (path.replaces || []).find(function(c){
        return c.rank !== undefined && pathClauseMatches(c, entry, schoolName, c.rank);
      });
      return hit ? hit.rank : (path.techRank || null);
    };

    // ---------- The record: {"<School>": {"<Rank>": "<Path>"}} ----------
    api.parse = function(raw){
      if(!raw) return {};
      try { const o = JSON.parse(raw); return (o && typeof o === 'object' && !Array.isArray(o)) ? o : {}; }
      catch(e){ return {}; }
    };
    // The record before this part: Rank keys holding Path names, no School.
    api.hasLegacy = function(obj){
      return Object.keys(obj || {}).some(function(k){ return typeof obj[k] === 'string'; });
    };
    // Any record, old or new, in the new shape. An old entry goes to the first of the character's
    // Schools that the Path can replace at that Rank (the School it was taken in: the one whose
    // Technique rows carry it), otherwise to the active School, which is where the old reader put it.
    api.normalise = function(obj, schoolNames, active){
      const out = {};
      const put = function(school, rank, name){
        if(typeof name !== 'string' || !name) return;
        (out[school] = out[school] || {})[String(rank)] = name;
      };
      Object.keys(obj || {}).forEach(function(key){
        const value = obj[key];
        if(typeof value === 'string'){
          const path = findPath(value), rank = parseInt(key, 10);
          const school = (path && rank && (schoolNames || []).find(function(s){ return pathAvailableFor(path, s, rank); })) || active || '';
          put(school, key, value);
        } else if(value && typeof value === 'object' && !Array.isArray(value)){
          Object.keys(value).forEach(function(rank){ put(key, rank, value[rank]); });
        }
      });
      return out;
    };
    api.activeSchool = function(){ const el = $('f_school'); return el ? (el.value || '').trim() : ''; };
    // The character's Schools in the order they were taken (the active one last).
    api.schoolNames = function(){
      let list = [];
      try { list = getSchoolsList() || []; } catch(e){ list = []; }
      const names = list.map(function(e){ return e && e.name; }).filter(Boolean);
      const active = api.activeSchool();
      if(active && names.indexOf(active) < 0) names.push(active);
      return names;
    };
    api.record = function(){
      const el = $(api.FIELD);
      return api.normalise(api.parse(el ? el.value : ''), api.schoolNames(), api.activeSchool());
    };
    api.saveRecord = function(rec){
      const el = $(api.FIELD);
      if(!el) return;
      const clean = {};
      Object.keys(rec || {}).forEach(function(school){
        if(rec[school] && Object.keys(rec[school]).length) clean[school] = rec[school];
      });
      el.value = JSON.stringify(clean);
    };
    // While unlockTechniques() runs for a School, Path lookups answer for that School; otherwise
    // for the active one.
    let context = null;
    api.contextSchool = function(){ return context !== null ? context : api.activeSchool(); };
    api.withSchool = function(schoolName, fn){
      const saved = context;
      context = String(schoolName || '').trim();
      try { return fn(); } finally { context = saved; }
    };
    // Every Path held, in the order the Schools were taken and then by Rank: [{school, rank, path}].
    // A School no longer among the character's Schools keeps its entry, but it is not held.
    api.taken = function(){
      const rec = api.record(), out = [];
      api.schoolNames().forEach(function(school){
        const slot = rec[school];
        if(!slot) return;
        Object.keys(slot).map(Number).sort(function(a, b){ return a - b; }).forEach(function(rank){
          if(findPath(slot[String(rank)])) out.push({school:school, rank:rank, path:slot[String(rank)]});
        });
      });
      return out;
    };
    api.isFirst = function(schoolName, rank){
      const first = api.taken()[0];
      return !!first && first.school === schoolName && first.rank === Number(rank);
    };

    // ---------- Requirements ----------
    // The book asks for an Honor Rank, so the Honor block's Rank field decides (a School writes its
    // starting Honor there, decimals included); its Points field only when Rank is empty.
    api.honor = function(){
      const rank = parseFloat($('f_honorRank') ? $('f_honorRank').value : '');
      if(Number.isFinite(rank)) return rank;
      const pts = parseFloat($('f_honorPts') ? $('f_honorPts').value : '');
      return Number.isFinite(pts) ? pts : 0;
    };
    api.hasDisadvantage = function(name){
      const want = String(name || '').trim().toLowerCase();
      return Array.from(document.querySelectorAll('#disadvList .en-name'))
        .some(function(el){ return el.value.trim().toLowerCase() === want; });
    };
    // Is this Skill row's name of one of these kinds? Craft and Artisan by name ("Craft",
    // "Craft: Armorsmithing", "Artisan (Painting)"); Weapon by the Skill library's category, which
    // counts the Low Weapon Skills too.
    api.skillIsKind = function(skillName, kinds){
      const base = String(skillName || '').replace(/\(.*$/, '').trim();
      return (kinds || []).some(function(kind){
        if(kind === 'Weapon'){
          const lib = findSkill(base);
          return !!(lib && /^Weapon\b/.test(lib.cat));
        }
        return new RegExp('^' + kind + '\\s*(?::|$)', 'i').test(base);
      });
    };
    api.hasSkillOfKind = function(kinds, rank){
      return Array.from(document.querySelectorAll('#skillsBody tr')).some(function(tr){
        const nameEl = tr.querySelector('.sk-name'), rankEl = tr.querySelector('.sk-rank');
        if(!nameEl || !rankEl) return false;
        return (parseInt(rankEl.value || '0', 10) || 0) >= rank && api.skillIsKind(nameEl.value, kinds);
      });
    };
    // Glory the same way: the Glory block's Rank field, Points only when Rank is empty.
    api.glory = function(){
      const rank = parseFloat($('f_gloryRank') ? $('f_gloryRank').value : '');
      if(Number.isFinite(rank)) return rank;
      const pts = parseFloat($('f_gloryPts') ? $('f_gloryPts').value : '');
      return Number.isFinite(pts) ? pts : 0;
    };
    // "Members of the Imperial families" (pp. 256-257): a character of the Imperial Clan.
    api.isImperial = function(){ return (($('f_clan') || {}).value || '').trim() === 'Imperial'; };
    api.extraUnmet = function(path){
      const req = (path && path.requires) || {}, unmet = [];
      if(req.honor !== undefined && api.honor() < req.honor) unmet.push('Honor Rank ' + req.honor);
      if(req.glory !== undefined && api.glory() < req.glory) unmet.push('Glory Rank ' + req.glory);
      (req.disadvantages || []).forEach(function(d){ if(!api.hasDisadvantage(d)) unmet.push('the ' + d + ' Disadvantage'); });
      (req.skillOfKind || []).forEach(function(s){ if(!api.hasSkillOfKind(s.kinds, s.rank)) unmet.push(s.label); });
      return unmet;
    };

    // The one Skill shortfall an Imperial character may ignore, or null. The trunk words a Skill
    // shortfall as "<Skill> <Rank>"; the first such entry in the Path's own order is the one waived.
    api.waivedSkill = function(path, unmet){
      const req = (path && path.requires) || {};
      if(!req.imperialSkillWaiver || !api.isImperial()) return null;
      const words = Object.keys(req.skills || {}).map(function(s){ return s + ' ' + req.skills[s]; });
      return words.find(function(w){ return (unmet || []).indexOf(w) >= 0; }) || null;
    };

    // ---------- Core p. 246: Kiho and spells for a first Path and a later one ----------
    api.kihoAtPathRank = function(path, schoolName, rank){
      if(!api.isFirst(schoolName, rank)) return 0;
      return path.kihoGrantOverride !== undefined ? Math.min(1, path.kihoGrantOverride) : 1;
    };
    // A later Path is not a Rank of the basic School for effects that depend on School Rank: how
    // many of a School's Ranks up to `upTo` are later Paths.
    api.laterPathRanks = function(schoolName, upTo){
      const first = api.taken()[0];
      return api.taken().filter(function(t){
        return t.school === schoolName && t.rank <= upTo && !(first && first.school === t.school && first.rank === t.rank);
      }).length;
    };
    api.activeRank = function(){ return parseInt(($('f_rank') || {}).value || '0', 10) || 0; };
    api.activeLater = function(){ return api.laterPathRanks(api.activeSchool(), api.activeRank()); };

    // ---------- Several Paths in one School ----------
    api.isAnyRank = function(path){ return !!path && (path.replaces || []).some(function(c){ return !!c.anyRank; }); };
    // The Ranks up to `upTo` this School has not had replaced yet.
    api.freeRanks = function(schoolName, upTo){
      const slot = getPathTaken(schoolName), out = [];
      for(let r = 1; r <= Math.min(Math.max(upTo, 1), 5); r++) if(!slot[String(r)]) out.push(r);
      return out;
    };
    // The School (other than this one) in which the character already holds this Path, or null.
    api.heldElsewhere = function(path, schoolName){
      const hit = api.taken().find(function(t){ return t.path === path.name && t.school !== schoolName; });
      return hit ? hit.school : null;
    };
    // The Rank picker for an any-Rank Path, in the sheet's own pick modal (the one the Affinity,
    // Honor and specialisation choices use). Resolves with the Rank, or null if cancelled.
    api.pickRank = function(path, ranks){
      return new Promise(function(resolve){
        const overlay = $('affinityPickModalOverlay'), grid = $('affinityPickGrid');
        const confirmBtn = $('affinityPickConfirm'), xBtn = $('affinityPickX');
        if(!overlay || !grid || !confirmBtn || !xBtn){ resolve(ranks[ranks.length - 1] || null); return; }
        setPickModalText('Choose the Rank', path.name + ' — select one',
          'A Champion Path may replace the Technique of any Rank, usually the one you are advancing into (Core Rulebook p.256).');
        grid.innerHTML = ranks.map(function(r){
          return '<div class="affinity-pick-item" data-el="' + r + '"><label for="ap46Rank_' + r + '">Rank ' + r
            + '</label><input type="checkbox" id="ap46Rank_' + r + '"></div>';
        }).join('');
        overlay.style.display = 'flex';
        const items = Array.from(grid.querySelectorAll('.affinity-pick-item'));
        const boxes = items.map(function(item){ return item.querySelector('input[type="checkbox"]'); });
        boxes.forEach(function(box, i){
          box.addEventListener('change', function(){
            boxes.forEach(function(other, j){ if(j !== i && box.checked){ other.checked = false; items[j].classList.remove('checked'); } });
            items[i].classList.toggle('checked', box.checked);
          });
        });
        const cleanup = function(result){
          overlay.style.display = 'none';
          confirmBtn.removeEventListener('click', onConfirm);
          xBtn.removeEventListener('click', onCancel);
          resolve(result);
        };
        const onConfirm = function(){
          const chosen = items.find(function(item){ return item.querySelector('input[type="checkbox"]').checked; });
          if(!chosen){ setStatus('Select the Rank this Path replaces before confirming.'); return; }
          cleanup(parseInt(chosen.dataset.el, 10));
        };
        const onCancel = function(){ cleanup(null); };
        confirmBtn.addEventListener('click', onConfirm);
        xBtn.addEventListener('click', onCancel);
      });
    };

    // ---------- The load check: every clause of these Paths must reach a School ----------
    api.skillKnown = function(name){ return !!(findSkill(name) || findSkill(String(name).split(':')[0])); };
    api.describe = function(c){
      const rank = c.anyRank ? 'any Rank' : c.rank;
      return c.school ? c.school + ' ' + rank
        : 'any ' + (c.clan || '') + ' ' + (c.type || (c.types || []).join('/')) + ' School ' + rank;
    };
    api.assertResolve = function(){
      const bad = [];
      api.PATHS.forEach(function(p){
        (p.replaces || []).forEach(function(c){
          if(!c.anyRank && !(Number.isInteger(c.rank) && c.rank >= 1 && c.rank <= 5)) bad.push(p.name + ' -> a clause without a Rank 1-5');
          if(c.school && !resolveSchoolName(c.school)) bad.push(p.name + ' -> replaces "' + c.school + '"');
          if(c.clan && !api.clanExists(c.clan)) bad.push(p.name + ' -> unknown Clan "' + c.clan + '"');
          [c.type].concat(c.types || []).filter(Boolean).forEach(function(t){
            if(api.TYPES.indexOf(t) < 0) bad.push(p.name + ' -> unknown School type "' + t + '"');
          });
          if(!c.school && (c.clan || c.type || c.types)){
            const hits = allSchoolEntries().filter(function(e){ return pathClauseMatches(c, e, e.name, c.rank); });
            if(!hits.length) bad.push(p.name + ' -> "' + api.describe(c) + '" matches no School');
          }
        });
        if(!TECH_DESCRIPTIONS[p.tech]) bad.push(p.name + ' -> no description for "' + p.tech + '"');
        const req = p.requires || {};
        Object.keys(req.skills || {}).forEach(function(s){ if(!api.skillKnown(s)) bad.push(p.name + ' -> unknown Skill "' + s + '"'); });
        (req.emphases || []).forEach(function(e){ if(!api.skillKnown(e[0])) bad.push(p.name + ' -> unknown Skill "' + e[0] + '"'); });
        (req.disadvantages || []).forEach(function(d){
          if(!DISADV_LIBRARY.some(function(x){ return x.name === d; })) bad.push(p.name + ' -> unknown Disadvantage "' + d + '"');
        });
      });
      return bad;
    };
    return api;
  })();

  if(ALTERNATE_PATHS_ENABLED){
    Array.prototype.push.apply(ALTERNATE_PATH_LIBRARY, AP46.PATHS);
    Object.assign(TECH_DESCRIPTIONS, AP46.DESCRIPTIONS);

    // Clan and School type (one type, or any of several), on top of everything the trunk's matcher
    // already checks. An "any Rank" clause names no Rank, which the trunk's matcher already accepts
    // at every Rank.
    const ap46ClauseMatches = pathClauseMatches;
    pathClauseMatches = function(clause, entry, schoolName, rank){
      if(!ap46ClauseMatches.apply(this, arguments)) return false;
      if(clause.clan && AP46.schoolClans(schoolName).indexOf(clause.clan) < 0) return false;
      const types = AP46.schoolTypes(entry);
      if(clause.type && types.indexOf(clause.type) < 0) return false;
      if(clause.types && !clause.types.some(function(t){ return types.indexOf(t) >= 0; })) return false;
      return true;
    };

    // The record, per School. The trunk's pathAtRank() reads getPathTaken(), so it follows.
    getPathTaken = function(schoolName){
      const school = (schoolName === undefined || schoolName === null) ? AP46.contextSchool() : String(schoolName).trim();
      return Object.assign({}, AP46.record()[school] || {});
    };
    // Takes {"<Rank>": "<Path>"} for one School (the active one unless named) and makes it that
    // School's Paths. A fixed-Rank Path is filed under the Rank it replaces in that School, whatever
    // Rank it was handed with; an any-Rank Path keeps the Rank it was given.
    savePathTaken = function(flat, schoolName){
      const school = (schoolName === undefined || schoolName === null) ? AP46.contextSchool() : String(schoolName).trim();
      const rec = AP46.record(), slot = {};
      Object.keys(flat || {}).forEach(function(key){
        const name = flat[key];
        if(typeof name !== 'string' || !name) return;
        const path = findPath(name);
        const rank = (path && AP46.rankFor(path, school)) || parseInt(key, 10);
        if(rank) slot[String(rank)] = name;
      });
      if(Object.keys(slot).length) rec[school] = slot; else delete rec[school];
      AP46.saveRecord(rec);
    };
    // Every Path the character holds, in every School: bans, Ring bonuses and exempt grants are
    // the character's, whichever School the Path was taken in.
    pathsTaken = function(){
      return AP46.taken().map(function(t){ return findPath(t.path); }).filter(Boolean);
    };
    // Answers for the School it unlocks. The Topaz Champion's Technique keeps the one it replaces
    // (Core p. 257), so at that Rank both are granted.
    const ap46Unlock = unlockTechniques;
    unlockTechniques = function(schoolName, rank){
      const self = this, args = arguments;
      return AP46.withSchool(schoolName, function(){
        const res = ap46Unlock.apply(self, args);
        const own = findSchoolTechniques(schoolName);
        for(let r = 1; r <= Math.max(0, Math.min(rank, 5)); r++){
          const p = pathAtRank(r), name = own[r - 1];
          if(!p || !p.keepsReplacedTechnique || !name) continue;
          if(res.techniquesUnlocked.some(function(t){ return t.name === name; })) continue;
          res.techniquesUnlocked.push({ rank:r, name:name, desc:techniqueDescription(name) });
        }
        res.techniquesUnlocked.sort(function(a, b){ return a.rank - b.rank; });
        return res;
      });
    };

    // The new requirements, and the Magistrates' Imperial waiver of one Skill shortfall.
    const ap46Unmet = pathRequirementsUnmet;
    pathRequirementsUnmet = function(path){
      const unmet = ap46Unmet.apply(this, arguments).concat(AP46.extraUnmet(path));
      const waived = AP46.waivedSkill(path, unmet);
      if(!waived) return unmet;
      const at = unmet.indexOf(waived);
      return unmet.filter(function(u, i){ return i !== at; });
    };

    // Core p. 246 (owner's ruling, 1 October): the walk over the active School's Ranks is the
    // trunk's, with a Path's Rank giving one Kiho for the character's first Path and none for a later
    // one. A Path's own lower figure still wins (Servants of Mercy: none).
    const ap46Entitlement = kihoEntitlement;
    kihoEntitlement = function(){
      const ent = ap46Entitlement.apply(this, arguments);
      if(!ent || !ent.brotherhood) return ent;
      let granted = ent.startingKiho;
      for(let r = 2; r <= ent.rank; r++){
        const p = pathAtRank(r);
        granted += p ? AP46.kihoAtPathRank(p, ent.schoolName, r) : ent.perRank;
      }
      ent.grantedAllowance = granted;
      ent.freePicksLeft = Math.max(0, granted - ent.grantedTaken);
      ent.overGranted = Math.max(0, ent.grantedTaken - granted);
      return ent;
    };

    // Core p. 246: a later Path is not a Rank of the basic School for effects that depend on School
    // Rank. The School Rank field itself is untouched (it drives Insight and the Technique list);
    // each effect counts without the later Paths.
    //   Kiho Mastery: a monk's reach is Ring + School Rank.
    const ap46KihoEligibility = kihoEligibility;
    kihoEligibility = function(k){
      const res = ap46KihoEligibility.apply(this, arguments);
      const later = AP46.activeLater();
      if(!later || !res || !res.acq || !res.acq.usesSchoolRank) return res;
      res.reach -= later;
      res.masteryOk = res.reach >= k.mastery;
      res.eligible = res.acq.mode !== 'none' && res.masteryOk && !res.banned && !res.monkOnlyBlock;
      return res;
    };
    //   The Kiho purchase cap: cumulative Monk and Shugenja School Rank.
    const ap46CumulativeRank = cumulativeMonkShugenjaRank;
    cumulativeMonkShugenjaRank = function(){
      const total = ap46CumulativeRank.apply(this, arguments);
      let list = [];
      try { list = getSchoolsList() || []; } catch(e){ list = []; }
      let later = 0;
      list.forEach(function(entry){
        const name = entry && entry.name;
        if(!name) return;
        const types = AP46.schoolTypes(findAnySchoolLibraryEntry(name) || { name:name });
        if(types.indexOf('monk') < 0 && types.indexOf('shugenja') < 0) return;
        const upTo = entry.frozen ? (parseInt(entry.frozenRank || 0, 10) || 0) : kihoSchoolRank();
        later += AP46.laterPathRanks(name, upTo);
      });
      return Math.max(0, total - later);
    };
    //   A shugenja's School Rank for learning and casting spells (effectiveSchoolRankForSpell()
    //   starts from this), and the casting breakdown's "base" figure, so the two still agree.
    const ap46ElementRank = effectiveSchoolRankForElement;
    effectiveSchoolRankForElement = function(element){
      return Math.max(0, ap46ElementRank.apply(this, arguments) - AP46.activeLater());
    };
    const ap46RollContext = makeRollContext;
    makeRollContext = function(kind, extra){
      const ctx = ap46RollContext.apply(this, arguments);
      if(ctx && kind === ROLL_KINDS.SPELL && Number.isFinite(ctx.schoolRankBase)){
        ctx.schoolRankBase = Math.max(0, ctx.schoolRankBase - AP46.activeLater());
      }
      return ctx;
    };
    //   Mirumoto's Rank-scaled Techniques (Part C), in whichever Mirumoto School the character has.
    if(typeof getMirumotoRank === 'function' && typeof isMirumotoSchoolName === 'function'){
      const ap46MirumotoRank = getMirumotoRank;
      getMirumotoRank = function(){
        const rank = ap46MirumotoRank.apply(this, arguments);
        if(!rank) return rank;
        let list = [];
        try { list = getSchoolsList() || []; } catch(e){ list = []; }
        const entry = list.find(function(e){ return e && isMirumotoSchoolName(e.name); });
        return entry ? Math.max(0, rank - AP46.laterPathRanks(entry.name, rank)) : rank;
      };
    }

    // The picker. It adds and removes, so a School can hold several Paths (Core p. 246: each Rank
    // replaced once). Paths the School already holds are offered for removal; a Path whose Rank is
    // already replaced, or that the character holds in another School, is listed but locked.
    renderPathPicker = function(){
      const wrap = document.getElementById('pathPickerWrap');
      const sel = document.getElementById('pathPicker');
      const note = document.getElementById('pathNote');
      if(!wrap || !sel || !note) return;
      const school = AP46.activeSchool();
      const rank = kihoSchoolRank();
      const taken = getPathTaken(school);
      const takenRanks = Object.keys(taken).map(Number).filter(function(r){ return findPath(taken[String(r)]); })
        .sort(function(a, b){ return a - b; });
      const takenNames = takenRanks.map(function(r){ return taken[String(r)]; });
      const seen = {}, avail = [];
      for(let r = 1; r <= Math.max(rank, 1); r++){
        pathsAvailableAt(school, r).forEach(function(p){
          if(!seen[p.name] && takenNames.indexOf(p.name) < 0){ seen[p.name] = 1; avail.push(p); }
        });
      }
      // Fixed-Rank Paths by the Rank they replace, then the any-Rank Champions, each in book order.
      const order = function(p){ return AP46.isAnyRank(p) ? 99 : (AP46.rankFor(p, school) || p.techRank || 0); };
      avail.sort(function(a, b){
        return (order(a) - order(b)) || (ALTERNATE_PATH_LIBRARY.indexOf(a) - ALTERNATE_PATH_LIBRARY.indexOf(b));
      });
      const elsewhere = AP46.taken().filter(function(t){ return t.school !== school; });
      const label = function(p){
        const unmet = pathRequirementsUnmet(p);
        const any = AP46.isAnyRank(p);
        const r = any ? null : (AP46.rankFor(p, school) || p.techRank);
        let text = p.name + (any ? ' (replaces a Rank you choose)' : ' (replaces Rank ' + r + ')');
        let blocked = false;
        if(unmet.length){ text += ' — 🔒 needs ' + unmet.join(', '); blocked = true; }
        else if(AP46.heldElsewhere(p, school)){ text += ' — already yours from ' + AP46.heldElsewhere(p, school); blocked = true; }
        else if(any && !AP46.freeRanks(school, rank).length){ text += ' — every Rank you have reached is already replaced'; blocked = true; }
        else if(!any && taken[String(r)]){ text += ' — Rank ' + r + ' is already replaced by ' + taken[String(r)]; blocked = true; }
        return '<option value="' + escAttr('add:' + p.name) + '"' + (blocked ? ' disabled' : '') + '>' + escAttr(text) + '</option>';
      };
      let html = '<option value="">' + (takenRanks.length ? '— add or remove an Alternate Path —' : '— no Alternate Path —') + '</option>';
      if(takenRanks.length){
        if(avail.length) html += '<optgroup label="Take a Path">' + avail.map(label).join('') + '</optgroup>';
        html += '<optgroup label="Remove a Path">' + takenRanks.map(function(r){
          return '<option value="remove:' + r + '">' + escAttr('Remove ' + taken[String(r)] + ' (Rank ' + r + ')') + '</option>';
        }).join('') + '</optgroup>';
      } else {
        html += avail.map(label).join('');
      }
      sel.innerHTML = html;
      sel.value = '';
      wrap.style.display = (avail.length || takenRanks.length) ? '' : 'none';
      const entry = findAnySchoolLibraryEntry(school);
      const types = AP46.schoolTypes(entry);
      const bits = [];
      takenRanks.forEach(function(r){
        const p = findPath(taken[String(r)]);
        const first = AP46.isFirst(school, r);
        bits.push('<strong>' + escHtml(p.name) + '</strong> replaces your Rank ' + r + ' Technique (' + escHtml(p.source) + ')');
        if(p.keepsReplacedTechnique) bits.push('you keep the Technique it replaces as well (' + escHtml(p.source) + ')');
        const nar = pathNarrativeRequirements(p);
        if(nar.length) bits.push('confirm with your GM: ' + escHtml(nar.join('; ')));
        if((p.requires || {}).imperialSkillWaiver && AP46.isImperial()) bits.push('as a member of the Imperial families you may ignore one Skill Rank requirement');
        if(p.note) bits.push('Note: ' + escHtml(p.note));
        if(entry && entry.brotherhood){
          const k = AP46.kihoAtPathRank(p, school, r);
          bits.push(first ? ('as your first Path it grants ' + k + ' Kiho at that Rank instead of the usual ' + KIHO_DEFAULT_GRANT_PER_RANK + ' (Core Rulebook p.246)')
                          : 'as a later Path it grants no Kiho (Core Rulebook p.246)');
        }
        if(types.indexOf('shugenja') >= 0){
          bits.push(first ? 'as your first Path you learn 1 new spell at that Rank rather than the usual number (Core Rulebook p.246)'
                          : 'as a later Path you learn no new spells at that Rank (Core Rulebook p.246)');
        }
        if(!first) bits.push('a later Path does not count as a Rank of your School for effects that depend on School Rank (Core Rulebook p.246)');
        if(p.grantsKiho) bits.push('its Technique grants ' + p.grantsKiho + ' Kiho that do not count against your purchase cap');
        (p.banKihoTypes || []).forEach(function(t){ bits.push('you may not learn or use <strong>' + escHtml(t) + '</strong> Kiho'); });
        if(p.conditional) bits.push((p.conditional.severity === 'permanent' ? '<strong>Permanent:</strong> ' : 'Conditional: ') + escHtml(p.conditional.text));
      });
      elsewhere.forEach(function(t){
        bits.push('Kept from ' + escHtml(t.school) + ': <strong>' + escHtml(t.path) + '</strong> (Rank ' + t.rank + ')');
      });
      if(bits.length){ note.innerHTML = bits.join(' · '); note.style.display = ''; }
      else { note.innerHTML = ''; note.style.display = 'none'; }
    };

    // The trunk's change handler (050-kiho-rules.js) holds one Path per character; the control is
    // swapped for a copy without it, and this one adds or removes a single Path. Nothing else holds
    // the old element: every reader looks the picker up by its id.
    AP46.pick = async function(){
      const sel = document.getElementById('pathPicker');
      const value = sel ? sel.value : '';
      if(!value) return;
      const school = AP46.activeSchool();
      const slot = getPathTaken(school);
      const where = school ? ' of ' + school : '';
      const refuse = function(text){ appAlert(text, 'Got it'); renderPathPicker(); };
      if(value.indexOf('remove:') === 0){
        const r = value.slice(7), name = slot[r];
        delete slot[r];
        savePathTaken(slot, school);
        recalcAll();
        setStatus('Alternate Path removed: ' + name + ' (Rank ' + r + where + ').');
        return;
      }
      const chosen = value.indexOf('add:') === 0 ? findPath(value.slice(4)) : null;
      if(!chosen){ renderPathPicker(); return; }
      // Safety net behind the disabled options, as the trunk's handler had: never trust the control.
      const unmet = pathRequirementsUnmet(chosen);
      if(unmet.length) return refuse(chosen.name + ' requires ' + unmet.join(', ') + '.');
      const other = AP46.heldElsewhere(chosen, school);
      if(other) return refuse(chosen.name + ' is already yours from ' + other + '.');
      let rank;
      if(AP46.isAnyRank(chosen)){
        const free = AP46.freeRanks(school, kihoSchoolRank());
        if(!free.length) return refuse('Every Rank you have reached is already replaced by a Path.');
        rank = free.length === 1 ? free[0] : await AP46.pickRank(chosen, free);
        if(!rank){ renderPathPicker(); return; }
      } else {
        rank = AP46.rankFor(chosen, school) || chosen.techRank;
        if(slot[String(rank)]) return refuse('Your Rank ' + rank + ' Technique is already replaced by ' + slot[String(rank)] + '.');
      }
      slot[String(rank)] = chosen.name;
      savePathTaken(slot, school);
      recalcAll();
      setStatus('Alternate Path set: ' + chosen.name + ' (replaces Rank ' + rank + where + ').');
    };
    const ap46OldPicker = document.getElementById('pathPicker');
    if(ap46OldPicker){
      const ap46NewPicker = ap46OldPicker.cloneNode(false);
      ap46OldPicker.replaceWith(ap46NewPicker);
      ap46NewPicker.addEventListener('change', function(){ AP46.pick(); });
    }
    // Honor and Glory are Path requirements, and editing them does not recalculate the sheet, so the
    // picker is redrawn on its own when one of their fields changes.
    ['f_honorRank', 'f_honorPts', 'f_gloryRank', 'f_gloryPts'].forEach(function(id){
      const field = document.getElementById(id);
      if(field) field.addEventListener('input', function(){ renderPathPicker(); });
    });

    // Saved data: the old record is carried up by a format step (Phase 7, Part J). Registered at the
    // end of whatever chain is present, so it follows Phase 4.5.2 when that is installed.
    if(typeof VersionManager === 'object' && VersionManager && typeof VersionManager.register === 'function'
       && VersionManager.enabled()){
      VersionManager.register(VersionManager.current(), AP46.STEP_NAME, function(data){
        const fields = data && data.fields;
        if(!fields || typeof fields[AP46.FIELD] !== 'string' || !fields[AP46.FIELD]) return data;
        const obj = AP46.parse(fields[AP46.FIELD]);
        if(!AP46.hasLegacy(obj)) return data;
        let list = [];
        try { list = JSON.parse(fields.f_schoolsData || '[]'); } catch(e){ list = []; }
        const names = (Array.isArray(list) ? list : []).map(function(e){ return e && e.name; }).filter(Boolean);
        const school = String(fields.f_school || '').trim();
        if(school && names.indexOf(school) < 0) names.push(school);
        const active = names.length ? names[names.length - 1] : '';
        fields[AP46.FIELD] = JSON.stringify(AP46.normalise(obj, names, active));
        return data;
      });
    }

    // The load check, loudly: a Path that reaches no School looks exactly like one that is correctly
    // ineligible. The trunk's own check ran before these Paths were added, so it runs again here.
    const ap46Unresolved = assertPathSchoolsResolve().concat(AP46.assertResolve());
    if(ap46Unresolved.length) console.error('Phase 4.6 (Part I) Alternate Paths: unresolved:\n' + ap46Unresolved.join('\n'));
  }
  // ========= END PART I PHASE 4.6 =========
