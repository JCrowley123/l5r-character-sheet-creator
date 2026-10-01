  // ========= PART I PHASE 4.6: ALTERNATE PATHS (first release) =========
  // The Core Rulebook's 18 Great Clan Alternate Paths (pp. 251-255), and the engine work they need,
  // to the owner's approval of 1 October 2026. The other 9 Core Paths (the magistrate, Legion and
  // Champion Paths) and more than one Path in the same School are the second release.
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
    api.extraUnmet = function(path){
      const req = (path && path.requires) || {}, unmet = [];
      if(req.honor !== undefined && api.honor() < req.honor) unmet.push('Honor Rank ' + req.honor);
      (req.disadvantages || []).forEach(function(d){ if(!api.hasDisadvantage(d)) unmet.push('the ' + d + ' Disadvantage'); });
      (req.skillOfKind || []).forEach(function(s){ if(!api.hasSkillOfKind(s.kinds, s.rank)) unmet.push(s.label); });
      return unmet;
    };

    // ---------- Core p. 246: Kiho and spells for a first Path and a later one ----------
    api.kihoAtPathRank = function(path, schoolName, rank){
      if(!api.isFirst(schoolName, rank)) return 0;
      return path.kihoGrantOverride !== undefined ? Math.min(1, path.kihoGrantOverride) : 1;
    };

    // ---------- The load check: every clause of these Paths must reach a School ----------
    api.skillKnown = function(name){ return !!(findSkill(name) || findSkill(String(name).split(':')[0])); };
    api.describe = function(c){
      return c.school ? c.school + ' ' + c.rank : 'any ' + (c.clan || '') + ' ' + (c.type || '') + ' School ' + c.rank;
    };
    api.assertResolve = function(){
      const bad = [];
      api.PATHS.forEach(function(p){
        (p.replaces || []).forEach(function(c){
          if(!(Number.isInteger(c.rank) && c.rank >= 1 && c.rank <= 5)) bad.push(p.name + ' -> a clause without a Rank 1-5');
          if(c.school && !resolveSchoolName(c.school)) bad.push(p.name + ' -> replaces "' + c.school + '"');
          if(c.clan && !api.clanExists(c.clan)) bad.push(p.name + ' -> unknown Clan "' + c.clan + '"');
          if(c.type && api.TYPES.indexOf(c.type) < 0) bad.push(p.name + ' -> unknown School type "' + c.type + '"');
          if(!c.school && (c.clan || c.type)){
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

    // Clan and School type, on top of everything the trunk's matcher already checks.
    const ap46ClauseMatches = pathClauseMatches;
    pathClauseMatches = function(clause, entry, schoolName, rank){
      if(!ap46ClauseMatches.apply(this, arguments)) return false;
      if(clause.clan && AP46.schoolClans(schoolName).indexOf(clause.clan) < 0) return false;
      if(clause.type && AP46.schoolTypes(entry).indexOf(clause.type) < 0) return false;
      return true;
    };

    // The record, per School. The trunk's pathAtRank() reads getPathTaken(), so it follows.
    getPathTaken = function(schoolName){
      const school = (schoolName === undefined || schoolName === null) ? AP46.contextSchool() : String(schoolName).trim();
      return Object.assign({}, AP46.record()[school] || {});
    };
    // Takes {"<Rank>": "<Path>"} for one School (the active one unless named). Each Path is filed
    // under the Rank it replaces in that School, whatever Rank it was handed with: the picker in
    // 050-kiho-rules.js hands over the Path's techRank.
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
    const ap46Unlock = unlockTechniques;
    unlockTechniques = function(schoolName, rank){
      const self = this, args = arguments;
      return AP46.withSchool(schoolName, function(){ return ap46Unlock.apply(self, args); });
    };

    const ap46Unmet = pathRequirementsUnmet;
    pathRequirementsUnmet = function(path){
      return ap46Unmet.apply(this, arguments).concat(AP46.extraUnmet(path));
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

    // The picker: the trunk's, with each Path's Rank read for this School, and the Core p. 246
    // notes. Its change handler (050-kiho-rules.js) is untouched: it saves through
    // savePathTaken() above, and the listener at the end of this part corrects its message.
    renderPathPicker = function(){
      const wrap = document.getElementById('pathPickerWrap');
      const sel = document.getElementById('pathPicker');
      const note = document.getElementById('pathNote');
      if(!wrap || !sel || !note) return;
      const school = AP46.activeSchool();
      const rank = kihoSchoolRank();
      const taken = getPathTaken(school);
      const seen = {}, avail = [];
      for(let r = 1; r <= Math.max(rank, 1); r++){
        pathsAvailableAt(school, r).forEach(function(p){ if(!seen[p.name]){ seen[p.name] = 1; avail.push(p); } });
      }
      Object.keys(taken).forEach(function(r){
        const p = findPath(taken[r]);
        if(p && !seen[p.name]){ seen[p.name] = 1; avail.push(p); }
      });
      const held = AP46.taken();
      const elsewhere = held.filter(function(t){ return t.school !== school; });
      if(!avail.length && !elsewhere.length){ wrap.style.display = 'none'; note.style.display = 'none'; note.innerHTML = ''; sel.innerHTML = ''; return; }
      const takenNames = Object.keys(taken).map(function(r){ return taken[r]; });
      let html = '<option value="">— no Alternate Path —</option>';
      avail.forEach(function(p){
        const unmet = pathRequirementsUnmet(p);
        const isTaken = takenNames.indexOf(p.name) >= 0;
        let label = p.name + ' (replaces Rank ' + (AP46.rankFor(p, school) || p.techRank) + ')';
        if(unmet.length) label += ' — 🔒 needs ' + unmet.join(', ');
        const blocked = unmet.length > 0 && !isTaken;
        html += '<option value="' + escAttr(p.name) + '"' + (isTaken ? ' selected' : '')
              + (blocked ? ' disabled' : '') + '>' + escAttr(label) + '</option>';
      });
      sel.innerHTML = html;
      wrap.style.display = avail.length ? '' : 'none';
      const entry = findAnySchoolLibraryEntry(school);
      const types = AP46.schoolTypes(entry);
      const bits = [];
      Object.keys(taken).map(Number).sort(function(a, b){ return a - b; }).forEach(function(r){
        const p = findPath(taken[String(r)]);
        if(!p) return;
        const first = AP46.isFirst(school, r);
        bits.push('<strong>' + escHtml(p.name) + '</strong> replaces your Rank ' + r + ' Technique (' + escHtml(p.source) + ')');
        const nar = pathNarrativeRequirements(p);
        if(nar.length) bits.push('confirm with your GM: ' + escHtml(nar.join('; ')));
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

    // The trunk's message names the Path's techRank; this names the Rank it really replaces here.
    // Registered after the trunk's handler, so it runs second; a refused pick records nothing and
    // leaves the trunk's message alone.
    const ap46Picker = document.getElementById('pathPicker');
    if(ap46Picker) ap46Picker.addEventListener('change', function(){
      const chosen = findPath(ap46Picker.value);
      if(!chosen) return;
      const school = AP46.activeSchool();
      const slot = getPathTaken(school);
      const rank = Object.keys(slot).find(function(r){ return slot[r] === chosen.name; });
      if(rank) setStatus('Alternate Path set: ' + chosen.name + ' (replaces Rank ' + rank + (school ? ' of ' + school : '') + ').');
    });
    // Honor is now a Path requirement, and an Honor edit does not recalculate the sheet, so the picker
    // is redrawn on its own when either Honor field changes.
    ['f_honorRank', 'f_honorPts'].forEach(function(id){
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
