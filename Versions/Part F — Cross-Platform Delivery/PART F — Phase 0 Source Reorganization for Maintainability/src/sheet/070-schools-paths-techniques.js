  // ==================================================================================
  // ALTERNATE PATHS
  // An Alternate Path replaces ONE Rank of an existing School with a different Technique.
  // Twelve monk Paths across eight books are modelled here.
  //
  // The `replaces` clause is the hard part. Across those twelve it takes five shapes, and the
  // temptation is five code paths. Instead every clause is an object and a Path is available if
  // ANY clause matches while the School is not in `excludes`:
  //   1. named School + Rank      {school:'...', rank:3}
  //   2. a list of named pairs    two or more such clauses
  //   3. unfiltered qualitative   {any:'brotherhood', rank:2}      (or rankMin for "4 or higher")
  //   4. filtered by Devotion     {any:'brotherhood', devotion:'Fortunist', rank:2}
  //   5. carrying an exclusion    shape 3 or 4, plus entry-level `excludes`
  // Shapes 4 and 5 compose (Barefoot Brethren is both) and a tag filter (`tags:['pacifistic']`)
  // is a sixth filter on the same clause rather than a sixth mechanism.
  //
  // Every `school` string and every `excludes` entry is resolved at load by
  // assertPathSchoolsResolve(). A Path that matches nothing looks exactly like a Path that is
  // correctly ineligible - there is no error to notice - so the resolution is asserted rather
  // than trusted. Dark Path Sohei is the known instance: its book says "Order of the Spider 2"
  // while the sheet holds "The Order of the Spider Monks [Monk]".
  const SCHOOL_NAME_ALIASES = {
    'order of the spider': 'The Order of the Spider Monks [Monk]',
    'kikage zumi': 'The Hitomi Kikage Zumi Order [Monk]',
    'shrine of seven thunders monk': 'The Shrine of the Seven Thunders [Monk]',
    'thousand fortunes monk': 'The Temples of the Thousand Fortunes [Monk]',
    'jurojin\u2019s blessing monk': 'The Order of Jurojin\u2019s Blessing [Monk]',
    'order of jurojin\u2019s blessing': 'The Order of Jurojin\u2019s Blessing [Monk]',
    'togashi tattooed order': 'The Togashi Tattooed Order [Monk]',
    'four temples': 'The Four Temples [Monk]',
    'order of osano-wo': 'The Temple of Osano-Wo [Monk]',
  };
  // Exact name, then alias table, then a normalised match that tolerates a leading "The", a
  // trailing "[Monk]"/"Monk", and case. Returns the canonical library name or null.
  function resolveSchoolName(raw){
    const s = String(raw||'').trim();
    if(!s) return null;
    if(findAnySchoolLibraryEntry(s)) return s;
    const key = s.toLowerCase();
    if(SCHOOL_NAME_ALIASES[key] && findAnySchoolLibraryEntry(SCHOOL_NAME_ALIASES[key])){
      return SCHOOL_NAME_ALIASES[key];
    }
    const norm = t => String(t||'').toLowerCase()
      .replace(/\[[^\]]*\]/g, ' ').replace(/^the\s+/, '').replace(/\bmonk\b/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ').trim();
    const want = norm(s);
    let hit = null;
    allSchoolEntries().forEach(e=>{ if(!hit && norm(e.name) === want) hit = e.name; });
    return hit;
  }
  // Every School the sheet knows, from all three libraries.
  function allSchoolEntries(){
    const out = [];
    Object.values(SCHOOL_LIBRARY).forEach(list=>list.forEach(s=>out.push(s)));
    Object.values(MINOR_CLAN_SCHOOL_LIBRARY).forEach(list=>list.forEach(s=>out.push(s)));
    BROTHERHOOD_SCHOOL_LIBRARY.forEach(s=>out.push(s));
    return out;
  }
  const ALTERNATE_PATH_LIBRARY = [
    {name:'Student of Hitsu-do [Monk]', source:'Book of Fire p.179', monkTag:['Monk'], techRank:2,
     devotion:null,
     replaces:[{any:'brotherhood', rank:2},
               {school:'Kikage Zumi', rank:2},
               {school:'Kuni Witch-Hunter [Monk]', rank:2},
               {school:'Asako Henshin [Monk]', rank:2}],
     excludes:[],
     // The book's sidebar notes a GM may open Hitsu-do to any samurai who can find a dojo. That
     // is an explicit optional rule, like the p.266 non-Brotherhood Kiho allowance, so it is a
     // comment rather than a toggle for this pass.
     requires:{rings:{Fire:3}, skills:{}, emphases:[['Jiujutsu','Hitsu-do',4]], advantages:[],
               narrative:['access to a Hitsu-do dojo']},
     // The Technique's own Special clause: "The practice of Hitsu-do makes it easier for its
     // students to master the ways of Fire. Your Fire Ring is considered to be 1 Rank higher
     // for the purpose of learning Fire Kiho." Same shape as Shrine of the Seven Thunders'
     // kihoElementRankBonus, but the Ring is fixed by the Path rather than chosen by the
     // player, so it names its Ring instead of reading monkKihoElement().
     kihoRingRankBonus:{ring:'Fire', bonus:1},
     tech:'The Way of Fire'},
    {name:'The Transcendent Brotherhood [Monk]', source:'Book of Fire p.181', monkTag:['Monk'], techRank:2,
     devotion:null,
     replaces:[{any:'school', tags:['tattooed order'], rank:2}],
     excludes:[],
     requires:{rings:{Fire:3, Earth:3}, skills:{Meditation:3}, emphases:[], advantages:[], narrative:[]},
     tech:'Apotheosis of Fire'},
    {name:'The Servants of Mercy [Monk]', source:'Book of Water p.187', monkTag:['Monk'], techRank:4,
     devotion:{type:'Fortunist', fortune:'Jizo, Fortune of Mercy'},
     replaces:[{school:'Order of Jurojin\u2019s Blessing', rank:4},
               {any:'brotherhood', tags:['pacifistic'], rank:4}],
     excludes:[],
     requires:{rings:{}, skills:{}, emphases:[['Medicine','Wound Treatment',5]], advantages:[],
               narrative:['an oath of absolute pacifism']},
     // "You may not learn any Kiho this Rank."
     kihoGrantOverride:0,
     conditional:{severity:'permanent', text:'Forsake absolute pacifism even once \u2014 any voluntary violence against another creature \u2014 and you lose this Technique\u2019s healing bonus forever.'},
     tech:'Mercy\u2019s Touch'},
    {name:'Order of Ebisu [Monk/Courtier]', source:'Book of Void p.191', monkTag:['Monk','Courtier'], techRank:3,
     devotion:{type:'Fortunist', fortune:null},
     replaces:[{school:'Thousand Fortunes Monk', rank:3},
               {school:'Jurojin\u2019s Blessing Monk', rank:3}],
     excludes:[],
     requires:{rings:{}, skills:{}, emphases:[], advantages:[],
               narrative:['at least two heimin Craft Skills at Rank 3 or higher']},
     tech:'The Voice of Humility'},
    // Abbot and Brotherhood Spy are the two broadest matchers, so between them they are the
    // end-to-end check that qualitative matching really is data-driven: both now resolve
    // against 17 Brotherhood Schools plus Hoshi Tsurui Zumi, not the Core Rulebook's six.
    {name:'Abbot [Monk]', source:'Book of Void p.193', monkTag:['Monk'], techRank:4,
     devotion:null,
     replaces:[{any:'brotherhood', rankMin:4}],
     excludes:[],
     requires:{rings:{}, skills:{}, emphases:[], advantages:[],
               narrative:['appointment as the abbot of a monastery']},
     // The Technique reads "Within the Brotherhood, you are now considered to be Status 4.0."
     // That is Status scoped to the Brotherhood, not Imperial Status, and writing it into
     // f_statusRank would silently overwrite the Status 0 Phase 3 sets for being a monk. Left
     // as descriptive text on purpose.
     tech:'The Reverence of Wisdom'},
    {name:'Togashi Defender [Monk]', source:'The Great Clans p.104', monkTag:['Monk'], techRank:3,
     devotion:null,
     replaces:[{school:'Togashi Tattooed Order', rank:3}],
     excludes:[],
     requires:{rings:{}, skills:{}, emphases:[], advantages:[], narrative:[]},
     tech:'Power Within and Without'},
    {name:'Brotherhood Spy [Monk]', source:'Imperial Histories p.69', monkTag:['Monk'], techRank:2,
     devotion:null,
     replaces:[{any:'brotherhood', rank:2}],
     excludes:[],
     requires:{rings:{}, skills:{'Lore: Theology':3}, emphases:[], advantages:[], narrative:[]},
     tech:'Bearing the Emperor\u2019s Shame'},
    {name:'Defender of the Brotherhood [Monk/Courtier]', source:'Book of Earth p.204', monkTag:['Monk','Courtier'], techRank:2,
     devotion:null,
     replaces:[{any:'brotherhood', rank:2}],
     excludes:['Four Temples'],
     requires:{rings:{}, traits:{Willpower:3}, skills:{Courtier:3, Etiquette:4}, emphases:[], advantages:[], narrative:[]},
     tech:'Harmony in Chaos'},
    {name:'Barefoot Brethren [Monk]', source:'Secrets of the Empire p.241', monkTag:['Monk'], techRank:2,
     devotion:{type:'Fortunist', fortune:'Koshin, Fortune of Roads'},
     replaces:[{any:'brotherhood', devotion:'Fortunist', rank:2}],
     excludes:['Order of Osano-Wo'],
     requires:{rings:{}, skills:{Athletics:4}, emphases:[['Meditation','Fasting',3]], advantages:['Ascetic'], narrative:[]},
     // "You gain only one Kiho at this Rank."
     kihoGrantOverride:1,
     tech:'Koshin\u2019s Favor'},
    {name:'Pure Song [Monk]', source:'Secrets of the Empire pp.242-243', monkTag:['Monk'], techRank:4,
     devotion:{type:'Shintao', fortune:null},
     replaces:[{school:'Shrine of Seven Thunders Monk', rank:4}],
     excludes:[],
     requires:{rings:{}, traits:{Willpower:4}, skills:{Defense:4, Meditation:3}, emphases:[], advantages:[],
               narrative:['any one musical Perform Skill at Rank 3']},
     // Special: "You may not learn or use Martial Kiho." A ban by TYPE, feeding the same
     // exclusion mechanism Uncentered feeds by RING - no new check needed for either.
     banKihoTypes:['Martial'],
     conditional:{severity:'permanent', text:'Deliberately attack a living creature even once and the spiritual pollution costs you the ability to perform Kiho \u2014 permanently.'},
     tech:'The Pure Song'},
    {name:'The Silent Ones [Monk]', source:'Secrets of the Empire p.243', monkTag:['Monk'], techRank:3,
     devotion:{type:'Fortunist', fortune:'Tsugumu, the Fortune of Secrets'},
     replaces:[{any:'brotherhood', devotion:'Fortunist', rank:3}],
     excludes:[],
     requires:{rings:{}, traits:{Willpower:4}, skills:{Meditation:4}, emphases:[], advantages:[], narrative:[]},
     conditional:{severity:'permanent', text:'Taking the full vows leaves you permanently mute \u2014 your tongue vanishes from your mouth as the last word is spoken.'},
     tech:'Tsugumu\u2019s Silence'},
    // The naming trap the resolver exists for: the book says "Order of the Spider 2", the
    // library holds "The Order of the Spider Monks [Monk]". Also note this Path replaces a
    // CATEGORY-1 Clan [Monk] School Rank, so a [Monk] Path must never be assumed to imply a
    // brotherhood:true School.
    {name:'Dark Path Sohei [Monk]', source:'Strongholds of the Empire p.93', monkTag:['Monk'], techRank:2,
     devotion:null,
     replaces:[{school:'Order of the Spider', rank:2}],
     excludes:[],
     requires:{rings:{}, skills:{'Lore: Theology':3}, emphases:[], advantages:[], narrative:[]},
     // "You gain two Kiho ... These Kiho do not count against the normal number of Kiho you
     // may learn as determined by your School Rank."
     grantsKiho:2, grantsExemptFromCap:true,
     tech:'Walk upon the Dark Path'},
  ];

  // ---- Alternate Path matching, requirements and record ----
  function getPathTaken(){
    const raw = document.getElementById('f_pathTaken').value;
    if(!raw) return {};
    try{ const o = JSON.parse(raw); return (o && typeof o === 'object') ? o : {}; }catch(e){ return {}; }
  }
  function savePathTaken(rec){ document.getElementById('f_pathTaken').value = JSON.stringify(rec || {}); }
  function findPath(name){ return ALTERNATE_PATH_LIBRARY.find(p=>p.name===name) || null; }
  function pathAtRank(rank){ return findPath(getPathTaken()[String(rank)]); }
  // Every Path the character has taken, in Rank order. A Path taken at Rank 2 keeps affecting a
  // Rank 5 character, so bans and grant overrides read this rather than only the current Rank.
  function pathsTaken(){
    const rec = getPathTaken();
    return Object.keys(rec).map(Number).sort((a,b)=>a-b)
      .map(r=>findPath(rec[String(r)])).filter(Boolean);
  }
  // Does one `replaces` clause match this School at this Rank?
  function pathClauseMatches(clause, entry, schoolName, rank){
    if(!entry) return false;
    if(clause.rankMin !== undefined){ if(rank < clause.rankMin) return false; }
    else if(clause.rank !== undefined){ if(rank !== clause.rank) return false; }
    if(clause.school){
      const want = resolveSchoolName(clause.school);
      if(!want || want !== schoolName) return false;
    }
    if(clause.any === 'brotherhood' && !entry.brotherhood) return false;
    if(clause.any === 'monk' && !(entry.monk || entry.brotherhood)) return false;
    if(clause.devotion && !(entry.devotion && entry.devotion.type === clause.devotion)) return false;
    if(clause.tags && !clause.tags.every(t=>(entry.tags||[]).includes(t))) return false;
    return true;
  }
  // A Path is available if ANY clause matches and the School is not excluded. `excludes` is
  // resolved through the same name resolver as `replaces`, so "Four Temples" and "Order of
  // Osano-Wo" find their canonical library entries.
  function pathAvailableFor(path, schoolName, rank){
    const entry = findAnySchoolLibraryEntry(schoolName);
    if(!entry) return false;
    if((path.excludes||[]).some(x=>resolveSchoolName(x) === schoolName)) return false;
    return (path.replaces||[]).some(c=>pathClauseMatches(c, entry, schoolName, rank));
  }
  function pathsAvailableAt(schoolName, rank){
    return ALTERNATE_PATH_LIBRARY.filter(p=>pathAvailableFor(p, schoolName, rank));
  }
  function hasAdvantageNamed(name){
    const want = String(name||'').trim().toLowerCase();
    return Array.from(document.querySelectorAll('#advList .en-name'))
      .some(el=>el.value.trim().toLowerCase() === want);
  }
  // Scans EVERY row carrying this Skill's name, not just the first. The sheet allows more than
  // one row per Skill, and a School-granted starting Skill plus a separately added row is the
  // normal way that happens - a Four Temples monk starts with Jiujutsu, so a second Jiujutsu
  // row bought later is where an Emphasis like Hitsu-do actually lives. Checking only the first
  // row silently missed it, and the Path that needed it stayed locked with no way to satisfy it.
  // getCharacterSkillRank already takes the best across all rows; this now matches that.
  function hasSkillEmphasis(skillName, emph){
    const want = String(emph||'').trim().toLowerCase();
    const target = String(skillName||'').trim().toLowerCase();
    return Array.from(document.querySelectorAll('#skillsBody tr')).some(tr=>{
      const nameEl = tr.querySelector('.sk-name');
      if(!nameEl || nameEl.value.trim().toLowerCase() !== target) return false;
      return Array.from(tr.querySelectorAll('.emph-container .emph-item-row')).some(r=>{
        const w = r.querySelector('.sk-emph-select, .sk-emph-text');
        return w && w.value.trim().toLowerCase() === want;
      });
    });
  }
  function getTraitValueByName(traitName){
    const id = TRAIT_ID_MAP[traitName];
    const el = id ? document.getElementById(id) : null;
    return el ? (parseInt(el.value||'0',10) || 0) : 0;
  }
  // Which of a Path's requirements are not met. SOFT-GATED on purpose: the Path stays visible
  // with its shortfalls listed, the same visible-but-explained convention Kata, Spells and Kiho
  // already use. `narrative` requirements (an oath, a dojo, an appointment) are things no sheet
  // can verify, so they are always reported as things to confirm with your GM rather than as
  // failures.
  function pathRequirementsUnmet(path){
    const req = path.requires || {}, unmet = [];
    Object.keys(req.rings||{}).forEach(r=>{ if(getRingValueByName(r) < req.rings[r]) unmet.push(r+' '+req.rings[r]); });
    Object.keys(req.traits||{}).forEach(t=>{ if(getTraitValueByName(t) < req.traits[t]) unmet.push(t+' '+req.traits[t]); });
    Object.keys(req.skills||{}).forEach(s=>{ if(getCharacterSkillRank(s) < req.skills[s]) unmet.push(s+' '+req.skills[s]); });
    (req.emphases||[]).forEach(e=>{
      const [skill, emph, rank] = e;
      if(getCharacterSkillRank(skill) < rank || !hasSkillEmphasis(skill, emph)) unmet.push(skill+' ('+emph+') '+rank);
    });
    (req.advantages||[]).forEach(a=>{ if(!hasAdvantageNamed(a)) unmet.push('the '+a+' Advantage'); });
    return unmet;
  }
  function pathNarrativeRequirements(path){ return ((path.requires||{}).narrative)||[]; }
  // Startup assertion. A Path whose `replaces` names a School that does not resolve matches
  // nothing, and looks identical to a Path that is correctly ineligible - there is no error to
  // notice at runtime. So resolve every name once, loudly, at load. Returns the failures so a
  // harness can assert on them too.
  function assertPathSchoolsResolve(){
    const bad = [];
    ALTERNATE_PATH_LIBRARY.forEach(p=>{
      (p.replaces||[]).forEach(c=>{
        if(c.school && !resolveSchoolName(c.school)) bad.push(p.name+' -> replaces "'+c.school+'"');
      });
      (p.excludes||[]).forEach(x=>{
        if(!resolveSchoolName(x)) bad.push(p.name+' -> excludes "'+x+'"');
      });
    });
    if(bad.length) console.error('ALTERNATE_PATH_LIBRARY: unresolved School names:\n' + bad.join('\n'));
    return bad;
  }
  assertPathSchoolsResolve();


  // ==================================================================================
  // SCHOOL RANK, TECHNIQUE UNLOCKING & INSIGHT MODULE
  // Self-contained: reads the School Rank / Insight state from the existing character
  // fields (f_school, f_insightPts, f_rank) and the existing Techniques list (#techList),
  // and does not touch the dice-roller or any other part of the sheet.
  // ==================================================================================

  // Flattened School -> ordered Technique-name lookup, built once from SCHOOL_LIBRARY (and
  // MINOR_CLAN_SCHOOL_LIBRARY) so techniques are never hard-coded into the unlock logic
  // itself (per allSchoolTechniques).
  const ALL_SCHOOL_TECHNIQUES = {};
  Object.values(SCHOOL_LIBRARY).forEach(schools=>{
    schools.forEach(s=>{ ALL_SCHOOL_TECHNIQUES[s.name] = s.tech || []; });
  });
  Object.values(MINOR_CLAN_SCHOOL_LIBRARY).forEach(schools=>{
    schools.forEach(s=>{ ALL_SCHOOL_TECHNIQUES[s.name] = s.tech || []; });
  });
  // Brotherhood Schools register the same way. Each contributes a one-entry list, so the
  // unlock logic grants its single Technique at Rank 1 and nothing at Ranks 2-5 - no special
  // case needed, and no change to how the unlock logic indexes by Rank.
  BROTHERHOOD_SCHOOL_LIBRARY.forEach(s=>{ ALL_SCHOOL_TECHNIQUES[s.name] = s.tech || []; });

  // Short, accurate paraphrases of official technique text — keyed by exact technique name.
  // Covers all clans currently in SCHOOL_LIBRARY (Crab, Crane, Dragon, Lion, Phoenix, Scorpion,
  // Spider, Imperial, Unicorn); a plain fallback notice handles anything not yet added.
  // (see techniqueDescription()) rather than guessing at unverified rules text.
  const TECH_DESCRIPTIONS = {
    // --- Brotherhood of Shinsei Monk Schools (Core Rulebook pp.231-233) ---
    'Soul of Civility': 'When you spend a Void Point to augment a High Skill Roll or a Social Skill Roll, you gain +2k2 instead of the normal +1k1.',
    'Destiny’s Hand': 'Spend a Void Point as a Free Action to give one ally who has not yet taken his Turn +1k1 on any one roll this Round. Never a roll that cannot normally benefit from Void Points, such as a damage roll.',
    'Walk with the Prophet': 'All three of your starting Kiho must be chosen from a single Element, and your Insight Rank counts as one higher for meeting the Mastery Level of Kiho from that Element.',
    'The Path of Purity': 'In a Contested Social Skill Roll your opponent initiated, you may use any Ring in place of the Trait normally used (typically Awareness).',
    'The Hand of Thunder': 'Gain +0k1 to all damage rolls from unarmed attacks, cumulative with any other effect that lets you roll or keep extra dice on unarmed damage.',
    'The Thousand Forms': 'You begin play knowing four Kiho rather than the usual three. These four do not count against the additional Kiho you may purchase with Experience Points.',
    // --- Monk Alternate Paths (Phase 6) ---
    'The Way of Fire': 'On an unarmed attack you may call on your inner fire, suffering Wounds equal to your Fire x2 (their Wound Penalties apply only after the attack roll resolves). In return that attack\u2019s unarmed damage has a base DR of 0k[Fire] rather than 0k1. Does not stack with Hands of Stone, and counts mechanically as using a Mystical Kiho. Special: your Fire Ring counts as one Rank higher for the purpose of learning Fire Kiho.',
    'Apotheosis of Fire': 'Once per day, meditate at least an hour and roll Meditation / Fire at TN 20. On a success you are immune to damage from ordinary fire and heat \u2014 though not magical fire or extreme natural heat \u2014 for a number of hours equal to your Fire Ring. You still feel every bit of the pain.',
    'Mercy\u2019s Touch': 'So long as you remain absolutely pacifistic and treat all victims with equal care, your Medicine rolls heal an additional +2k1 Wounds. Engage in violence even once and the benefit is lost forever. You learn no Kiho at this Rank.',
    'The Voice of Humility': 'For each week spent labouring alongside peasants at humble tasks you gain a bonus Void Point, holdable up to your Void Rank, spendable only on this Path\u2019s Craft Skills, on Medicine rolls made to help peasants or hinin, or on Social Skill Rolls made against samurai.',
    'The Reverence of Wisdom': 'You are abbot of your monastery, and considered Status 4.0 within the Brotherhood \u2014 a standing inside the Order rather than Imperial Status, so this sheet does not write it into your Status field. Gain +1k1 on Social Skill Rolls with members of your own Order (except Temptation), or +1k0 with anyone else.',
    'Power Within and Without': 'While unarmoured and with no Kiho or Tattoos active, gain Reduction equal to 3 plus your Void Ring. You gain one additional Tattoo.',
    'Bearing the Emperor\u2019s Shame': 'When acting against a known or suspected Gozoku agent, or on orders from a legitimate Imperial authority, gain a Free Raise on all Stealth and Deceit rolls and lose no Honor for making them.',
    'Harmony in Chaos': 'When you spend a Void Point on an Etiquette or Courtier Social Skill Roll you gain +Xk1 instead of the normal +1k1, where X is your Willpower.',
    'Koshin\u2019s Favor': 'You gain only one Kiho at this Rank. Koshin\u2019s strength keeps you from becoming Fatigued by travel or lack of sleep, though not by lack of food or drink, and you gain +1k1 to all Meditation rolls.',
    'The Pure Song': '+1k0 to all musical Perform Skills. You may never deliberately attack a living creature: doing so permanently costs you the ability to perform Kiho. While you remain nonviolent you gain +1k1 to all Defense rolls, and a Void Point spent to negate Wounds negates 20 rather than 10.',
    'Tsugumu\u2019s Silence': 'A secret you are voluntarily told can never be taken from your mind by any means, including torture and intrusive Air magic.',
    'Walk upon the Dark Path': 'You gain two Kiho, for which you must still meet every normal prerequisite. These do not count against the number of Kiho you may learn as determined by your School Rank.',
    // --- Brotherhood Schools from Emerald Empire, Imperial Histories 2, Secrets (Phase 7) ---
    'The Diamond Sutra': 'You start play with the Disturbing Countenance Disadvantage for no points, and gain +1k0 to Meditation rolls, Fear rolls, and all Social Skill Rolls with heimin and hinin. You lose no Honor for touching dead flesh, though Glory and Infamy change as normal.',
    'Way of the Ancient World': 'You may learn one additional Mystical Kiho, and gain +1k0 on all Etiquette and Lore Skill rolls.',
    'Cracks within the Elements': 'On any attack roll or Social Skill Roll against a mortal opponent, add twice the difference between that opponent\u2019s highest and lowest Rings to your total.',
    'For Each, One Path': 'At character creation choose a low or high starting Honor Rank, and choose to specialise in either opposed Social Skill Rolls or Attack rolls. You gain a bonus to that roll type equal to twice the difference between your Honor Rank and your opponent\u2019s.',
    'Emma-O\u2019s Insight': 'Spend 10 minutes in meditation and roll Meditation / Awareness at TN 25 to detect the presence of ghosts \u2014 yorei or goryo, though not gaki. Usable a number of times per day equal to your Void Rank, and Raises on the roll reveal further detail.',
    // --- Brotherhood Schools from the Elemental books (Phase 5) ---
    'Essence of the Wind': 'Any effect that targets you and tries to influence your behaviour \u2014 spell, courtier Technique, Social Skill, Advantage or anything else \u2014 costs its user an additional Void Point to take effect, and that extra point may bypass the normal one-per-Round limit on enhancement effects.',
    'Pillars of the Mind\u2019s Eye': 'Make an archery attack as a Complex Action, gaining +1k0 for each Kiho you currently have active (only one Martial Kiho counts, and active Kiho may have no other effect that Round). If the attack directly kills an intelligent being you lose 3 points of Honor.',
    'Way of the Closed Eye': 'You cannot be surprised by an ambush. Before Initiative is rolled you may spend a Void Point and roll Perception at TN 20 to raise your Initiative Score by 20 \u2014 a bonus lost the instant you make any attack.',
    'Shinsei\u2019s Gift': 'You gain Void Points per day equal to your Earth Ring, spendable only to reduce damage or to raise your Armor TN, never simultaneously with other Void Points or in any other way. This sheet does not track that separate pool for you.',
    'Unyielding Spirit': 'Spend a Void Point as a Free Action to ignore all penalties to the very next roll. If that roll is an Attack Roll, or a Contested Roll you did not initiate, also add +Xk0 where X is your Earth Ring.',
    'Changing the Way': 'Each time in an encounter that you activate a Kiho of a different Element from every Kiho already used that encounter, you gain +5 on the activation roll.',
    'The Hand of the Heavens': 'When attacking unarmed, or with a bisento, a bo staff, or any weapon with the Monk property, gain a Free Raise on the attack roll if your Fire Ring exceeds your opponent\u2019s.',
    'The Largesse of Fukurokujin': 'On any Social Skill Roll, name one Kiho you know: you may not use it for the rest of the day, but you gain +1k1 on the roll. Each Kiho may be spent this way only once per day.',
    'Blessings of Longevity': '+1k1 on Medicine rolls to treat disease or infection and +1k0 to treat Wounds. You may also attempt to treat natural, non-Taint insanity with a Medicine roll, though whether it helps is your GM\u2019s call.',
    'Gaze into the Mirror': '+1k0 on all Divination rolls, or +1k1 when interpreting an omen. Once per day you may spend a Void Point to interpret an omen with absolute accuracy and no roll \u2014 though what the omen truly means remains your GM\u2019s call.',
    'The Touch of Eternity': 'Contemplate a non-combat situation for as long as your GM requires, then roll Meditation / Void at TN 25 or higher. On a success gain +1k1 +Void on Skill Rolls made to resolve that specific situation, for no more rolls than your Void Rank before further contemplation is needed.',
    'The Way of the Crab': 'Ignore TN penalties for wearing heavy armor (except for Stealth), and gain +1k0 to the total of all damage rolls with a Heavy Weapon.',
    'The Mountain Does Not Move': 'Gain Reduction equal to your Earth Ring.',
    'Devastating Blow': 'Once per encounter with a Heavy Weapon, make a calculated strike that lowers the target\'s Reduction by 4; a successful hit also Dazes them, with the recovery TN dropping each time they fail to shake it off.',
    'The Mountain Does Not Fall': 'Spend a Void Point in the Reactions Stage to act as if Healthy next Turn, ignoring Dazed, Fatigued, and Stunned until the next Reactions Stage.',
    'The Eternal Stone Unleashed': '+1k0 to resist Intimidation/Fear, and +1k0 to unarmed or improvised-weapon attack and damage rolls — but you must always keep high dice on those boosted rolls.',
    'Wearing Down the Mountain': 'The Extra Attack Maneuver costs only 3 Raises (instead of 5) when fighting unarmed or with an improvised weapon.',
    'Fury of the Avalanche': 'Attack as a Simple Action when unarmed, using an improvised weapon, or wielding a Samurai-keyword weapon.',
    'Stone Turns Steel Aside': 'A number of times per skirmish equal to your Void, after being hit by a melee attack you may take a Free Action to win a Contested Roll and turn the enemy\'s own weapon against them, using your own Strength for damage. Not usable in an iaijutsu duel.',
    'Fight to the End': 'Spend a Void Point to make a Complex-Action attack that ignores Wound penalties (even Down/Out) and status effects, dealing +3k1 damage.',
    'Hummingbird Wings': 'Once per Round, spend a Void Point when targeted by an attack to gain double your School Rank as an Armor TN bonus against it, stacking with other Armor TN bonuses.',
    'Shark Smells Blood': 'Attack as a Simple Action instead of Complex when using a Samurai-keyword weapon.',
    'Daylight Wastes No Movement': 'If you deal more Wounds than needed to kill your target, carry the excess Wounds over to the next target you hit (not on consecutive attacks, and only within the current skirmish).',
    'The Kaiu Method': '+1k0 on any School Skill Roll; spending a Void Point on a School Skill Roll grants +2k2 instead of +1k1 (the two bonuses don\'t stack).',
    'The Path of Stone': 'When building a large structure, an Engineering roll (TN 25) adds Wounds equal to School Rank x100; when commanding a siege engine, reroll one damage die per shot that rolls below your School Rank.',
    'The Path of the Shell': 'When crafting armor, spend double time/cost to add your School Rank to its Reduction, and half your School Rank (rounded up) to its Armor TN bonus.',
    'The Path of War': 'Modify Mass Battle Chart results by up to half your School Rank; attack as a Simple Action with katana, dai tsuchi, or war fan.',
    'The Path of Steel': 'When crafting a weapon, grant it +1k0 to attack rolls or +0k1 to damage; for a katana, you may spend all Void Points to make it unbreakable, at the cost of not recovering Void Points for a week.',
    'Gaze Into Shadow': '+1k0 on Spell Casting Rolls against non-human creatures; damage spells deal +1k1 against Tainted targets, and gain a Free Raise on any Jade-keyword spell.',
    'To See the Darkness': 'Sense Taint in a target via a Contested Roll (Investigation/Awareness vs. Sincerity/Willpower), gaining +1k0 per full Rank of their Taint; also +1k1 to resist Taint and to attacks against Shadowlands creatures or known Tainted foes.',
    'To Ride the Darkness': 'As a Free Action vs. a Shadowlands creature, roll Lore: Shadowlands/Intelligence (TN 20) to recall one strength or weakness of it, with Raises revealing more.',
    'To Strike the Darkness': 'Attack as a Simple Action against Shadowlands creatures or known Tainted foes.',
    'To Repel the Darkness': '+3k0 to your Rank 1 and Rank 2 detection rolls, and learn one Kiho.',
    'To Shatter the Darkness': '+4k1 to attack and damage rolls against Shadowlands creatures and known Tainted foes, stacking with the Rank 1 bonus.',
    'The Falcon Takes Flight': 'Roll Perception vs. TN equal to a nearby other-realm creature\'s Air Ring x5 to detect its presence.',
    'Vigilant and Strong': 'Spend a Void Point to negate darkness/blinding penalties for about two Rounds.',
    'Claws of the Falcon': 'Ignore up to 5 points of an opponent\'s Reduction; spend a Void Point as a Free Action to reduce a Spirit-Realm creature\'s Reduction by 10 for a Round.',
    'The Way of the Carp': 'Free Raise on Commerce with no Honor/Glory loss for using it publicly; Contested Roll (Commerce/Perception vs. Etiquette/Awareness) to discern what someone wants.',
    'Do As We Say': 'A number of times per session equal to your School Rank, re-roll a failed Sincerity or Intimidation roll (must keep the second result).',
    'Treasures of the Carp': 'Roll Commerce/Awareness (TN 20) to locate a rare item for someone; Raises find rarer items.',
    'Wiles of the Carp': 'Anyone lying to or deceiving you socially faces a TN increase of 5x your School Rank.',
    'What is Yours is Mine': 'If you help someone get something they want, gain +5k0 on Contested Social Rolls against them for 24 hours.',
    'The Way of the Spider': 'Each Round, choose to reduce Wound-Rank TN penalties or increase damage rolls by Strength + Taint Rank; detecting your Taint is also harder (TN +10).',
    'Aura of Blood': 'Spend a Void Point to grant yourself and nearby allies +2k0 to damage rolls for a duration based on Taint + Strength.',
    'Devouring Wrath': 'Regain 5 Wounds whenever you hit an opponent in melee (up to a small cap beyond your max, lost after the skirmish).',
    'Inhuman Assault': 'Once per skirmish, a Complex-Action attack that ignores armor/Stance bonuses; on a hit, the target loses those bonuses for several rounds.',
    'Insidious Whispers': 'Free Raise on Sincerity (Deceit); Taint-detection TN vs. you rises with your School Rank, and your School Rank adds to your effective Honor when others judge it.',
    'Cracks in the Wall': 'Spend a Void Point and roll Courtier/Awareness (TN 25) to penalize everyone nearby\'s Etiquette/Perform rolls for an hour, without them knowing why.',
    'Darkness Cannot be Trapped': 'Spend a Void Point to shift blame for an accusation onto someone else present, via a Contested Roll.',
    'The Touch of Sin': 'A number of times per session equal to your School Rank, a Contested Roll can inflict a Consumed by Shourido Disadvantage on a target temporarily.',
    'The Embrace of Darkness': 'A Contested Roll can convince a target to treat someone else as an enemy (not their lord or the Emperor); easier if they\'re already Consumed by Shourido.',
    'The Cloak of Night': 'Simple Action to raise Armor TN by up to School Rank x5, at the cost of the same penalty to most other rolls, for the skirmish.',
    'Melting into Shadow': 'Bonus rolled dice on Stealth equal to School Rank; detection TN against you rises by School Rank x5; Free Raise attacking unaware foes.',
    'The Shadowed Blade': 'Attack as a Simple Action with knives/Ninjutsu weapons, or make multiple shuriken attacks as a Complex Action equal to School Rank.',
    'Step Within Shadow': 'Move between suitably-sized shadows as a Simple Move Action, range School Rank x100 feet.',
    'Shadow upon the Moon': 'In darkness, dissolve into incorporeal vapor (immune to most harm except crystal), move freely but can\'t interact physically; gain +5 Initiative the first Round after reforming.',
    'Voice of the Emperor': 'Spend a Void Point for the Way of the Land Advantage in your current province until you next sleep; attackers who revere the Emperor lose Honor equal to twice your School Rank.',
    'Eyes of the Emperor': 'Add your Honor Rank to Etiquette (Courtesy) rolls resisting others\' influence.',
    'Hand of the Emperor': 'Spend a Void Point to prevent Emperor-revering Rokugani from harming you until the next Reactions Step, outside of skirmishes/duels.',
    'Blessing of the Emperor': 'A number of times per session equal to your School Rank, a Contested Roll can force honorable onlookers to cease violence for a minute.',
    'Glory of the Emperor': '+5k0 on Courtier or Etiquette rolls against targets with Honor 1.0+.',
    'The Voice of Heaven': 'No Honor loss for Intimidation (Control); a Contested Roll can provoke an argument between two other people.',
    'Destiny Has No Secrets': 'Spend a Void Point to roll Courtier/Awareness (TN 25) and learn one useful piece of GM-chosen information.',
    'The Virtues of Command': '+5k0 on Contested Social Rolls against those who revere Imperial authority.',
    'Never in Darkness': 'Extra unkept dice equal to School Rank resisting Temptation/Intimidation/Courtier meant to pull you from duty; +1k1 to Investigation rolls detecting ambushes.',
    'The Clouds Part': 'Spend a Void Point at the start of your Turn to add Honor Rank to attack and damage rolls until your next Turn.',
    'Speed of Heaven': 'Attack as a Simple Action with Samurai-keyword weapons.',
    'Heaven Never Falls': 'Spend a Void Point to intercept an attack meant for someone you\'re guarding within 20\', taking the damage yourself; if still standing, gain an extra Simple Action.',
    'In Defense of the Throne': 'Free Raise on spells protecting the Emperor or Imperial family (when it wouldn\'t cost Honor), and on spells known only to Imperial families.',
    'Blood Like Water': 'Declare a Raise when casting maho to hide its corrupted nature; a second Raise (or 1 Honor) caps the Taint gained from that spell at 1 point.',
    'Mask of the Nothing': 'Expend a spell slot to become an invisible-in-darkness shadow with a Stealth bonus, immune to most mundane harm; returning to physical form after lethal damage leaves you Stunned but alive.',
    'The Dark Path': '+1k0 to unarmed/polearm attack rolls, and add twice your School Rank to Armor TN against melee attacks.',
    'Drawing in the Strike': 'Choose a non-Void Ring; gain Reduction equal to it, plus your Taint Rank if any.',
    'Speed of Darkness': 'Attack as a Simple Action unarmed or with a polearm.',
    'Guarded by Chi': 'Choose a non-Void Ring; add twice its value (plus Taint Rank) to the TN of spells cast against you, suppressible at will.',
    'Darkness Unleashed': 'Gain extra daily Void Points equal to your Taint Rank or Earth Ring (whichever is higher), usable normally or for +1k1 damage.',
    'The Force of Honor': 'Gain bonus Wounds per Wound Rank equal to (Honor Rank rounded down, minus 4, minimum 1); +1k0 to attack rolls in the Attack Stance.',
    'The Shield of Faith': 'The Guard Maneuver lasts one extra Round and its Armor TN bonus increases by 5 (to both you and your target).',
    'Strike Beneath the Veil': 'Melee attack as a Simple Action while in the Attack Stance.',
    'Vigilance of Mind': 'Spend a Void Point in the Reactions Stage to gain +2k1 to attack/damage next Round against someone who struck you or your Guard target.',
    'To Tread on the Sword': 'Spend two Void Points as a Free Action to redirect an action from your Guard target to yourself, plus a Free Action to move toward them.',
    'Surveying the Land': '+1k0 on Stealth and Hunting rolls; improvised/rural traps deal +1k1 extra damage.',
    'Scouring the Shadows': '+2k0 to attack rolls against unaware opponents.',
    'Weaken the Resistance': 'Ignore Reduction from armor or school techniques (not natural or magical Reduction); +1k0 damage against targets with no such Reduction.',
    'Strike and Move': 'Attack as a Simple Action with katana, wakizashi, knife, or bow; traps deal +2k1 extra damage.',
    'Cunning of Daidoji': 'Spend a Void Point as a Free Action for a precision strike: Maneuvers cost 1 less Raise and a hit gains +1k1 damage; against an unaware foe, Raises aren\'t limited by Void.',
    'The Soul of Honor': 'Free Raise on Courtier, Sincerity, and Etiquette while Honor is 6.0+; a Contested Roll can learn what favor someone needs.',
    'Speaking in Silence': 'Roll Courtier/Intelligence (TN 15) to covertly communicate simple ideas with other trained Doji Courtiers or high-Courtier Crane.',
    'The Perfect Gift': 'Roll Courtier/Awareness (TN 20, Raises for better gifts) to produce a helpful gift/favor; a successful gift can grant a 1-point Devotion Ally at no XP cost.',
    'Voice of Honor': 'A won Contested Roll forces an opponent in debate to concede their position conflicts with Bushido.',
    'The Gift of the Lady': 'A won Contested Roll shifts a target\'s emotions favorably toward your advice (bonus vs. existing Allies).',
    'Temper Steel With Honor': 'Add your Air Ring to Armor TN (unless helpless/unaware); +1k0 attacking with jitte or sasumata.',
    'Flowing Like Water': 'Use your opponent\'s Strength instead of your own when rolling to control a Grapple or Disarm.',
    'Breath of the Law': 'A successful Grapple or Disarm also Dazes the target.',
    'Flowing Like Air': 'Attack as a Simple Action unarmed or with jitte, sasumata, or a Samurai-keyword weapon.',
    'The Willow in the Storm': 'Spend a Void Point in the Reactions Stage so attackers next Round subtract your Air Ring from each die (including exploding dice); not usable in Full Attack or Center Stance.',
    'Speed of Lightning': '+2k0 to attack rolls against targets with lower Initiative than yours.',
    'First and Last Strike': 'Strike first in a duel by winning the Iaijutsu/Void roll by 3+; gain a Free Raise per extra margin of 3 instead of 5.',
    'Strike With No Thought': 'Take a Simple Action (including Move) each Turn while in Center Stance, gaining its benefits immediately and able to hold the stance indefinitely.',
    'Soul of the Artisan': 'Choose a \'chosen art\' Skill: +2k0 to its rolls, unlimited Raises; Free Raise when critiquing others\' art with Games: Sadane.',
    'Free the Spirit': 'Choose a second \'chosen art\'; the bonus for chosen arts rises to +2k1.',
    'Undying Name': 'Roll (chosen art)/Awareness (TN 20 + 5x target\'s Glory) to raise or lower their Glory (or inflict Infamy with Raises); once per target per 6 months.',
    'A Gift Beyond Price': 'Once per month, a Contested Roll gifting your art can permanently shift someone\'s attitude toward your clan, favorably on success.',
    'Two Pincers One Mind': 'Attack as a Simple Action instead of a Complex Action when using Heavy Weapons or Samurai-keyword weapons.',
    'Torch’s Flame Flickers': '+1k0 to attack rolls while in the Attack Stance, and double the duration food/water/jade rations last for a number of people equal to your Hunting Rank.',
    'Wolf’s Little Lesson': 'While in the Attack Stance, gain +5 Armor TN each time you hit with a melee weapon; stacks up to your School Rank times, lasting the rest of the skirmish.',
    'The Falcon’s Eyes': '+1k0 on Perception-based Skill and Trait rolls, and +1k0 to damage against creatures from other Spirit Realms.',
    'The Falcon’s Wings': 'Attack as a Simple Action with a spear or Samurai-keyword weapon.',
    'The Soul’s Grace': 'Spend a Void Point to reduce all opponents\' damage rolls within 20\' by 0k1 for a number of Rounds equal to School Rank (re-triggering resets but doesn\'t stack the duration); Free Raise on Defense-keyword spells.',
    'One Strike Two Cuts': 'Attack as a Simple Action with Samurai-keyword weapons.',
    'The Soul’s Dream': 'A Contested Roll during a public performance can emotionally sway the audience for hours equal to your Insight Rank.',
    'Ashura’s Wing': 'Melee attack as a Simple Action.',
    'My Master’s Voice': 'A Contested Roll (Complex Action) can freeze an honorable target from acting against you or your allies for their next Turn.',
    'The Emperor’s Protection': 'Spend a Void Point in an argument; winning a Contested Roll forces the target to agree or lose 5 Honor.',
    'Sun’s Light Reveals': 'Spend a Void Point (or none near the Emperor) to roll Investigation/Perception (TN 25) and see through all disguises/illusions around you.',
    'The Way of the Crane': 'Add twice your Iaijutsu Skill to Initiative rolls; while in the Center Stance (and the Round after), gain +1k1 plus your School Rank to attack and Focus rolls.',
    'Kitsuki’s Method': 'Free Raise on all Investigation rolls; add your Perception to your Armor TN in a skirmish.',
    'Wisdom the Wind Brings': 'Anyone lying to you, deceiving you socially, or using Feint/Disarm against you adds +5 to their TN per your School Rank.',
    'Know the Rhythm of the Heart': 'After conversing briefly, roll Investigation (Notice)/Perception vs. their Intelligence x5 to accurately read their personality and motivations.',
    'Finding the Path': 'A Contested Roll (Investigation (Interrogation)/Intelligence vs. their Etiquette (Courtesy)/Intelligence) reveals one of a target\'s allies or enemies; each Raise reveals another. Usable once per target per day.',
    'The Eyes Betray the Heart': 'Automatically win a Contested Roll (Investigation (Interrogation)/Perception vs. their Sincerity (Deceit)/Willpower) to detect any deliberate lie told to you; +5k0 if you already suspected the lie, and Raises can extract extra information.',
    'Way of the Dragon': 'Wielding katana and wakizashi together (Niten) removes dual-wield penalties and adds your School Rank to Armor TN, stacking with the normal two-weapon bonus; you may also raise or lower the TN of a spell cast at you by 5.',
    'The Calm in Midst of Thunder': 'While in the Center Stance, add your Kenjutsu Skill Rank to the total of your Iaijutsu rolls.',
    'Strong and Swift': 'Attack as a Simple Action with Samurai-keyword weapons.',
    'Furious Retaliation': 'Choose an opponent who attacked you this Round; gain +3k0 to attack rolls against them on your next Turn.',
    'Heart of the Dragon': 'Wielding katana and wakizashi and attacking twice in a Turn grants one additional off-hand attack as a Free Action.',
    'Aligned With the Elements': 'Wielding a sword while wearing no armor grants Reduction equal to School Rank + 2 and +1k0 to sword damage.',
    'Fist and Blade': 'With a sword, perform Knockdown for 1 less Raise, and a controlled Grapple can deal the sword\'s damage instead of unarmed damage.',
    'Strike of Harmony': 'You may spend a Void Point on damage while wielding any sword, stacking with the katana\'s own Void-spending ability if applicable.',
    'Master of Steel': 'Attack as a Simple Action while wielding a sword.',
    'Balance of Nothingness': 'Once per skirmish, spend unlimited Void Points on a single damage roll while wielding a sword.',
    'Flesh of the Elements': 'Store a person/creature-targeting spell in a potion by expending a spell slot; anyone can trigger it later by drinking (Simple Action) or throwing it (Complex Action, Athletics/Agility). It still counts against your daily spell slots each day it awaits use, and takes hours equal to the spell\'s Mastery Level to brew. Also grants a Free Raise on Craft-keyword spells.',
    'Blood of the Kami': 'Gain two Tattoos at this Rank.',
    'Body of Stone': '+1k1 to the total of all unarmed attack and damage rolls.',
    'Blessing of the Kami': 'Gain two additional Tattoos.',
    'Will of Stone': 'Unarmed attacks become a Simple Action instead of Complex.',
    'Touch of the Kami': 'Gain two additional Tattoos.',
    'Swift Fist, Subtle Heart': 'Spend a Void Point as a Free Action to gain, for a number of Rounds equal to your School Rank, either +1k1 to unarmed attack rolls or +1k0 to unarmed damage (chosen each Turn). You begin with 1 Tattoo and 2 known Kiho (prerequisites still apply), can buy further Kiho as a Brotherhood of Shinsei monk, and gain an additional Tattoo at School Rank 4.',
    'The Gift of the Lady': 'Gain 1 Tattoo; add Reflexes to Armor TN, and may use Reflexes instead of Strength to control a Grapple.',
    'Strike the Base': 'Spend a Void Point on unarmed damage rolls, including damage inflicted in a Grapple.',
    'Moving the Wind': 'Attack as a Simple Action when unarmed; gain one additional Tattoo.',
    'Strike the Center': 'Perform Knockdown unarmed for 1 less Raise, and gain +1k1 to unarmed damage (including Grapple damage).',
    'Strike the Summit': 'Knockdown attempts may call 2 additional Raises, automatically Stunning on a success; thrown Grapple targets must roll Earth (TN 20) or also be Stunned. Gain 1 additional Tattoo.',
    'The Way of the Lion': 'Choose to ignore an opponent\'s Armor-derived Armor TN, or gain a Free Raise when attacking; also +1k0 on your first melee attack against a foe each skirmish, or against anyone who\'s Raised on you since your last Turn (capped at +1k0 regardless of how many times).',
    'Strength of Purity': 'Add your Honor Rank to the total of one roll per Turn during a skirmish (not damage rolls, and not while in the Center Stance).',
    'Strength of My Ancestors': 'Attack as a Simple Action with Samurai-keyword weapons.',
    'Triumph Before Battle': 'Once per skirmish, designate an opponent during the Reactions Stage; ignore their Stance-based Armor TN bonus next Round.',
    'Akodo’s Final Lesson': 'On a Bugei Skill Roll with Raises, if you meet the original TN but miss the Raised TN, you still succeed (just without the Raise benefits).',
    'The Herald of Glory': 'Gain the Precise Memory Advantage free; publicly praising someone\'s heroic deeds via a successful Perform: Storytelling/Awareness roll (TN 20) grants them Glory equal to your School Rank, usable per person per month up to your School Rank times.',
    'The Heart of the Lion': 'No Honor/Glory loss for displaying emotion publicly on behalf of a Lion or an honorable cause; Intimidation/Temptation against you add +5 to their TN per your School Rank.',
    'The Voice of the Ancestors': 'Before a battle, inspire allies with Perform: Oratory/Awareness (TN 15 + 5 per person, +5 more per non-Lion target); success lets each inspired ally add their Honor Rank to one Skill Roll during that battle.',
    'The Strength of Tradition': 'A number of times per session equal to School Rank, encourage an ally (Perform: Storytelling/Awareness, TN 25); on success, their next failed roll that day can be re-rolled with your Honor Rank in unkept dice added — but you lose 2 Honor if that re-roll also fails.',
    'Every Lion is Your Brother': 'Five times per session, add unkept dice equal to your Perform: Storytelling Rank to a Contested Social Roll by citing historical precedent.',
    'No Boundaries': 'No Honor loss for Low Skills used for the Lion Clan\'s benefit; as a Free Action, target a number of foes equal to School Rank for +1k0 on attack and Contested Rolls against them, usable School Rank times per day, lasting the rest of the day.',
    'The Lion Cannot Fail': '+1k0 on all School Skill Rolls.',
    'The Spirit of Ikoma': 'Once per Round, lose 3 Honor as a Free Action for +2k1 to attack, damage, and Contested Social Skill Rolls until the end of the Round.',
    'The Quiet Lion’s Claws': 'Melee weapon attacks become a Simple Action instead of Complex.',
    'Ferocious Determination': 'Spend a Void Point as a Free Action for a Contested Roll (Courtier/Awareness vs. their Etiquette (Courtesy)/Awareness); winning subtracts your Awareness plus their Honor Rank from their attack and Contested Social rolls against you for hours equal to your School Rank. Doesn\'t work on targets without an Honor Rank.',
    'Eyes of the Ancestors': 'Roll a Spell Casting Roll (as a Water spell) vs. the target\'s Willpower x5 to learn all their Spiritual Advantages/Disadvantages; spend a Void Point to suppress one Spiritual Advantage of theirs for minutes equal to School Rank. Also grants a Free Raise on Battle-keyword spells.',
    'The Way of Magari-Yarijutsu': '+1k0 on Spear and Polearm Skill rolls; in Center, Defense, or Full Defense Stance with a spear/polearm, gain Reduction equal to half your Skill Rank.',
    'Strike Like The Lion': 'With a spear or polearm, ignore enemy Reduction equal to half your Honor Rank (rounded up).',
    'Strike Through the Eagle': 'Ready/draw a nage-yari as a Free Action any number of times per Round; nage-yari thrown attacks become a Simple Action.',
    'Strike Like the Wind': 'Melee attacks become a Simple Action when wielding a spear or polearm.',
    'Strike With the Soul': 'The Extra Attack Maneuver costs only 3 Raises with a spear/polearm in melee; thrown spear attacks may include one Free Action attack.',
    'One with the Pride': 'Gain a bonded lion warcat that follows commands and won\'t attack you; direct it to Attack (Complex Action) or it defaults to Guard.',
    'Heart of the Beast': 'Gain a second warcat; you and your lions gain Swift 2 and an extra Wound Rank.',
    'The Ferocity Within': 'Melee attacks become a Simple Action with katana, wakizashi, magari-yari, nage-yari, knives, or unarmed; direct a warcat to Attack as a Simple Action.',
    'All as One': 'Pride members get two claw attacks per Round; you and your pride gain +2k1 on damage while fighting together; a directed warcat Attack may include a Simple Move Action.',
    'With the Soul of a Lion': 'Gain a third warcat; all your warcats gain +10 Armor TN, +2 Reduction, and +2 Fear.',
    'The Lion’s Roar': 'Add your Honor Rank to all damage rolls; Full Attack Stance grants an extra 5\' of movement (within your normal max).',
    'Matsu’s Fury': 'In Full Attack Stance, a hit against a chosen target (within 30\') freezes them from taking Move Actions unless they beat a Willpower roll (TN = damage dealt); immune to Fear-immune creatures.',
    'The Lion’s Charge': 'Melee attacks become a Simple Action instead of Complex.',
    'Matsu’s Courage': 'Ignore Wound Rank TN penalties up to your Honor Rank (double while in Full Attack Stance).',
    'The Lion’s Victory': 'Once per encounter after rolling damage, spend a Void Point as a Free Action so all kept damage dice explode (reroll and add) instead of just 10s.',
    'Elements of All Things': 'Spend a Void Point to cast a spell using a different Ring than the one it normally requires (still uses a spell slot of the Ring actually used). Also grants a Free Raise on Craft-keyword spells.',
    'The Four Mysteries': 'As a Simple Action, raise or lower both Traits tied to one of your Rings by your School Rank (half, rounded down, minimum 1, if targeting someone else — and a Contested Willpower Roll if they\'re unwilling/unaware). Lasts minutes equal to your Insight Rank, usable up to 5x Insight Rank times per day. Doesn\'t change the underlying Ring or Wound Ranks.',
    'The Riddle of Earth': 'As a Simple Action, become immune to all Conditional Effects (except Grappled and Mounted) for hours equal to your Earth Ring.',
    'The Riddle of Air': 'As a Simple Action, see through all illusions and false images for hours equal to your School Rank; if an illusion comes from a spell above your Insight Rank, you must win a Contested Air Roll against the caster to see through it.',
    'The Riddle of Fire': 'As a Complex Action, increase your kept dice on unarmed damage by your Fire Ring for a number of Rounds equal to your School Rank; alternatively, spend a Void Point when hit in melee to force a Contested Fire Roll that reduces the attacker\'s damage dice by your Fire Ring on a win.',
    'The Riddle of Water': 'Succeed at Lore: Elements (Water)/Water (TN 20) to take one Complex and one Simple Action in a Turn, or three Simple Actions instead.',
    'Temple of the Soul': 'Free Raise on any Lore Skill Roll; spending a Void Point on Etiquette grants +3k1 instead of the usual +1k1.',
    'From the Ashes': 'After observing a court for a day, roll Lore: History/Perception (TN 20) for +2k0 on Social Skill Rolls for the next two days while you remain there (re-rollable to extend without further observation).',
    'Voice of the Universe': 'Spend an hour conversing with an ally, then roll Lore: History/Intelligence (TN 25); success lets them add your Lore: History Rank to Social Skill Rolls for 24 hours (two Raises extends this to one more participating ally). Can\'t be reused on the same person until it expires.',
    'Invincible Mind': 'When you fail a Contested Social Roll resisting emotional/social manipulation (not Fear), re-roll using Intelligence instead of the original Trait, keeping the second result.',
    'Wisdom of the Ages': '+5k0 on any Lore Skill Roll, including ones used for your other School Techniques.',
    'Isawa’s Gift': 'Free Raise on all Spell Casting Rolls of your Affinity element.',
    'Soul of Brilliance': 'Choose one Artisan Skill; spending a Void Point on it grants +2k2 instead of the usual +1k1.',
    'The Way of Sincerity': 'Once per month, roll your chosen Artisan Skill (TN 15); the margin of success becomes XP usable only to buy the Allies Advantage, lasting weeks equal to your School Rank.',
    'The Art Speaks': 'Choose one Artisan Skill; substitute its Rank for a called-for Social Skill on a roll (no Mastery Level benefits apply, since you don\'t actually have ranks in that Social Skill).',
    'Bounty of the Craft': 'Once per day (15-minute ritual), roll your Artisan Skill (TN 30); on success, you and up to School Rank others present regain all Void Points. Doesn\'t work in the Shadowlands.',
    'The Touch of Destiny': 'While your art is on display before others, everyone in the room gains 1 extra Void Point (you gain 2, and can deny the effect to anyone), capped at 1 per person per day (2 for you).',
    'The Way of the Phoenix': 'Spending a Void Point for +1k1 can instead be upgraded to spending 2 Void Points for +2k2; Guard as a Free Action, though the target\'s Armor TN bonus drops to +5 instead of +10.',
    'Dancing With the Elements': 'Choose a target within 30\' each Round; you may raise or lower the TN of any spell they cast or are targeted by (by 5), and the same for spells targeting you directly.',
    'One With the Void': 'Automatically regain a Void Point during the Reactions Stage whenever anyone else spends one this Round (even above your max, though excess is lost after combat); usable twice per skirmish.',
    'Move With the World': 'Attack as a Simple Action with Polearms, Spears, or Samurai-keyword weapons.',
    'Touch of the Void': 'Each Void Point spent counts as two where applicable, and you may spend Void Points on enhancements twice in a single Turn.',
    'The Way of the Scorpion': '+1k1 to Initiative Rolls; +5 Armor TN against any opponent with lower Initiative than you.',
    'Pincers and Tail': 'The Feint Maneuver costs only 1 Raise instead of 2.',
    'Strike at the Tail': 'Choose a target within 30\' when you assume a Stance; a successful hit that Turn Fatigues them (as if they\'d gone without rest for 24 hours) unless they beat an Earth Ring roll (TN 25) in the Reactions Stage.',
    'Strike From Above Strike From Below': 'Melee attacks become a Simple Action instead of Complex.',
    'The Pincers Hold, The Tail Strikes': 'Once per encounter, spend a Void Point as a Complex Action for a melee attack that Stuns on a hit; the target can shake it off with an Earth Ring roll (TN = damage dealt) in the Reactions Stage.',
    'Weakness is My Strength': 'In a Contested Social Roll, gain a Free Raise for every 3 points of Mental/Social Disadvantages your opponent has (max 5 Free Raises). Also, Free Raise on Courtier when spreading gossip, without needing a Raise to hide that you\'re the source.',
    'Shallow Waters': 'After conversing briefly, win a Contested Roll (Investigation/Awareness vs. their Etiquette/Awareness) to learn their lowest-Rank Mental Trait and lowest-Rank Social Skill; spend a Void Point to also learn the next-lowest of each.',
    'Secrets are Birthmarks': 'Win a Contested Roll (Courtier (Manipulation)/Awareness vs. their Etiquette (Courtesy)/Awareness) after conversing to force them to reveal one Mental or Social Advantage/Disadvantage (just its title, not details); a revealed Disadvantage lets you claim a free 2-point Blackmail Advantage on them (GM permitting).',
    'Scrutiny’s Sweet Sting': 'Against someone you have Blackmail on, their dice can\'t explode on Contested Social Rolls against you; spend a Void Point on any Contested Social Roll to force the opponent to use a mental Trait of your choice.',
    'No More Masks': 'A number of times per session equal to School Rank, win an Opposed Roll (Courtier (Gossip)/Awareness vs. their Etiquette (Courtesy)/Awareness, +5k0 if you have Blackmail on them) to inflict a Social Disadvantage, Sworn Enemy, or Obligation on the target for a month. Can\'t reuse on the same target until it expires.',
    'The First Face': 'Learn one persona; spending a Void Point on Acting or Sincerity (Deceit) grants +3k1 instead of the usual +1k1.',
    'The Subtle Sting': '+2k0 to attack rolls when wielding a Small weapon.',
    'The Second Face': 'Learn a second persona; may spend 2 Void Points (instead of 1) when enhancing a School Skill Roll, stacking with Rank 1\'s bonus.',
    'The Viper’s Kiss': 'Attack as a Simple Action instead of Complex when using a Small-sized weapon.',
    'The Third Face': 'Learn a third persona; Raises aren\'t limited by Void when attacking an unaware or unsuspecting foe.',
    'The Path of Shadows': 'No Honor loss for Low Skills or Ninjutsu weapons used for the Scorpion Clan; +2k0 to all Stealth Skill rolls.',
    'Strike From Darkness': 'Attacking someone unaware of you removes the Void limit on Raises and adds unkept dice equal to School Rank to the attack roll; against a Condition-afflicted foe (like Stunned/Fatigued) add half that many unkept dice instead — the two don\'t stack, choose one.',
    'Steel Within Silk': 'Attack (melee, or ranged with shuriken/tsubute) as a Simple Action instead of Complex when ambushing or using Ninjutsu/Ninja-keyword weapons.',
    'Whisper of Steel': 'After attacking (only if you make just one attack that Round), opponents/bystanders need a Contested Roll (Investigation (Notice)/Perception vs. your Stealth/Agility) to even detect you.',
    'The Final Silence': 'After a successful damage roll, spend Void Points (any number) to bump up to two damage dice each to 10 (non-exploding).',
    'The Face of Justice': '+1k0 to Intimidation (+2k0 vs. someone of lower Status); +1k0 damage on melee attacks.',
    'Rise to Meet the Challenge': 'While Prone, a Free Action Athletics/Agility roll (TN 20) lets you stand back up; +1k1 to rolls controlling a Grapple.',
    'The Magistrate’s Cut': 'Once per opponent per skirmish, a melee Called Shot with 3 Raises temporarily Blinds the target until the Reactions Stage of the next Round.',
    'Certainty of Purpose': 'Melee attacks (including unarmed) become a Simple Action instead of Complex.',
    'Relentless Resolve': 'Once per skirmish (not in Center Stance), gain unkept dice equal to your Intimidation Rank on all attack rolls for one Round.',
    'The Kami’s Whisper': 'Sacrifice an extra spell slot of the same Element when casting a non-damaging spell to hide all visible signs it was cast; also grants a Free Raise on Illusion-keyword spells.',
    'Way of the Wardmaster': 'Cast a Wards-keyword spell with extra Raises (equal to its Mastery Level) to store it latent in a paper ward; activate it later as a Simple Action by placing it on a target (an unwilling target requires a Spellcraft/Agility attack roll). Destroying an active ward ends its effect; the spell slot isn\'t freed until the ward discharges or is destroyed unused.',
    'Mysteries of Meishodo': 'Craft magical amulets: roll Craft: Meishodo/Ring for the spell\'s Ring (TN 15 + 5x Mastery Level, taking hours equal to the Mastery Level) to store one spell in a charm. Casting from it takes one Complex Action with no Spell Casting Roll needed (and no Raise benefits), still using a spell slot. Only spells of Mastery Level up to your School Rank (never 4-6) can be stored this way, and anyone trained in meishodo can use your amulets.',
    'The Heart Speaks': 'Roll Etiquette (Courtesy)/Awareness (TN 20) to avoid inadvertently giving offense; Free Raise on Sincerity (Honesty), but Sincerity (Deceit) rolls get +5 TN instead.',
    'Piercing the Veils': 'Win a Contested Roll (Etiquette/Awareness vs. their Etiquette/Willpower) to get a general sense of someone\'s true feelings in a social situation; Raises reveal more specific insight.',
    'The Heart Listens': 'After at least 10 minutes of conversation, win a Contested Roll (Sincerity (Honesty)/Awareness vs. their Etiquette (Courtesy)/Willpower) to shift their attitude toward you positively; two Raises makes them a temporary Ally for the day. Doesn\'t work on Sworn Enemies.',
    'Answering the Heart': 'Add unkept dice equal to your School Rank when using your Rank 2 and Rank 3 techniques.',
    'The Immovable Hand of Peace': 'Spend a Void Point to win a Contested Roll (Sincerity (Honesty)/Awareness vs. their Etiquette (Courtesy)/Awareness); on success, the target can\'t take hostile action against you for hours equal to twice your School Rank, as long as you don\'t act hostile toward them either. Doesn\'t work on targets with Honor Rank below 2.0 or no Honor Rank.',
    'Spirit of the Wind': 'As a Complex Action, sacrifice a spell slot of any element to grant a target an extra Simple Move Action on their next Turn (lost if unused). Also grants a Free Raise on Travel-keyword spells.',
    'The Way of the Unicorn': 'Wield any two-handed weapon (except bows) in one hand; +1k0 damage while mounted, using a scimitar, or using a two-handed melee weapon (these don\'t stack); scimitars count as having the Samurai keyword for you.',
    'Shinsei’s Smile': 'Gain a bonus to attack rolls equal to half your opponent\'s current Wound Rank TN penalty (rounded down).',
    'Desert Wind Strike': 'Melee weapon attacks become a Simple Action instead of Complex.',
    'The Charge of Madness': 'Once per skirmish, if you drop a target to the Out Wound Level, immediately make one more attack as a Free Action against a different target (no Raises allowed).',
    'Moto Cannot Yield': 'While mounted or in Full Attack Stance with a two-handed or Samurai-keyword weapon, keep extra damage dice equal to half your Strength (rounded down).',
    'Blessings of the Shi-Tien Yen-Wang': 'As a Simple Action, sacrifice a spell slot to target an enemy within School Rank x100 feet with a Contested Willpower Roll; on success they can\'t benefit from exploding dice or re-roll Advantages for Rounds equal to your School Rank. Also grants a Free Raise on Travel-keyword spells.',
    'Purity of the Breath': 'Each Round, choose either to reduce Wound Rank TN penalties, or add to your Armor TN, by School Rank + Willpower (doubled against Shadowlands creatures).',
    'Facing the Dark Within': '+2k0 on all Investigation rolls (+2k1 specifically to notice Shadowlands Taint).',
    'Justice of Our Ancestors': 'Melee attacks become a Simple Action instead of Complex.',
    'Avenging Our Own': '+2k0 to attack and damage rolls against an enemy who\'s attacked you this skirmish, or against any Tainted creature regardless.',
    'Bloodied but Unbowed': 'Once per skirmish (Free Action), for two Rounds add your current Wound Rank TN penalty to melee damage rolls (extendable a third Round by taking 10 Wounds).',
    'The Way of the Ki-Rin': 'When spending a Void Point for +1k1 on a School Skill Roll, also add your Horsemanship Rank to the total (not usable in Center Stance).',
    'Dance of the Blade': 'In Full Defense Stance, when hit by an attack, take a Free Action to win a Contested Agility Roll and turn the attack into a miss instead; usable School Rank times per Round.',
    'The Four Winds Strike': 'Attack as a Simple Action with Samurai-keyword weapons; while mounted, also with a bow.',
    'Spirit of the Blade Unleashed': 'In Defense or Full Defense Stance, after an opponent\'s melee attack resolves against you, take a Free Action for a melee counterattack (shifting you into Attack Stance); usable School Rank times per skirmish, once per Round.',
    'Dancing With the Fortunes': 'While mounted, instead of spending a Void Point, roll a Void Ring Roll (TN 20, or 30 on foot) as a Free Action; success grants the Void Point\'s effect without spending it. Usable up to your starting Void Points per skirmish.',
    'Riding in Harmony': 'Add your Honor Rank to one attack roll per Round (or a damage roll instead, while mounted); +Honor Rank to all Horsemanship rolls.',
    'The Void of War': 'During Stage 1 of a Combat Round, add +5 to either Initiative Score or Armor TN (lasts until you use this again or the skirmish ends).',
    'Sensing the Breeze': 'While mounted, attacks become a Simple Action instead of Complex.',
    'Wind Never Stops': 'While mounted, spend a Void Point to charge as a Simple Action (move + attack together, at your steed\'s speed); a successful hit grants +2k1 to all damage rolls that Turn.',
    'Otaku’s Blessing': 'Spend a Void Point as a Free Action at the start of your Turn to add your Honor Rank to all damage rolls and Bugei Skill Rolls that Turn (stacks with Riding in Harmony).',
    'Choose Your Weapon': 'Choose Kenjutsu, Polearms, or Spears; gain a free Emphasis in it and +1k0 to attack rolls with it. In Defense/Full Defense Stance with that weapon, add full Skill Rank to Armor TN (Spears/Polearms) or half Skill Rank rounded down (Kenjutsu).',
    'Speed of My Sisters': 'On foot, move as if your Water Ring were 1 Rank higher; +1k0 to Initiative rolls.',
    'All-Fronts Attack': 'Attack as a Simple Action with your chosen weapon Skill.',
    'Utaku’s Thunder': 'Once per skirmish, spend a Void Point to add your Honor Rank in unkept dice to an attack roll with your chosen weapon; your Rank 2 movement bonus improves to Water Rank +2.',
    'Epic of My Name': 'Your Rank 1 Armor TN bonus now also applies in Attack Stance; once per skirmish in Full Attack Stance (or Attack Stance too, for Spears/Polearms), add +4k2 to a damage roll with your chosen weapon.',
  };

  // Official Insight -> School Rank progression: 1–149 Rank 1, then 25-point bands from
  // Rank 2 (150) onward (150–174 R2, 175–199 R3, 200–224 R4, 225–249 R5, 250–274 R6,
  // 275–299 R7, 300–324 R8, +25 Insight per Rank beyond that indefinitely).
  function calculateSchoolRank(insight){
    insight = Math.max(0, Math.round(insight||0));
    let rank, bandFloor, bandCeil;
    if(insight < 150){
      rank = 1; bandFloor = 0; bandCeil = 149;
    } else {
      rank = 2 + Math.floor((insight-150)/25);
      bandFloor = 150 + (rank-2)*25;
      bandCeil = bandFloor + 24;
    }
    const insightToNextRank = Math.max(0, (bandCeil+1) - insight);
    return {
      rank,
      insightToNextRank,
      debugExplanation: `Insight ${insight} falls within the Rank ${rank} band (${bandFloor}\u2013${bandCeil}) \u2192 ${insightToNextRank>0 ? `${insightToNextRank} more Insight needed to reach Rank ${rank+1}.` : `at the top of the Rank ${rank} band.`}`,
    };
  }

  // Case-insensitive lookup of a School's ordered technique-name list.
  function findSchoolTechniques(schoolName){
    if(!schoolName) return [];
    return ALL_SCHOOL_TECHNIQUES[schoolName] || [];
  }

  // Short description of what a technique does. Falls back to a plain, honest notice for
  // clans not yet covered in TECH_DESCRIPTIONS, rather than guessing at unverified rules text.
  function techniqueDescription(techName){
    return TECH_DESCRIPTIONS[techName] || 'Full description not yet available for this technique — check the official rulebook or wiki entry for its exact effect.';
  }

  // Unlocks every technique for schoolName from Rank 1 up to (and including) rank,
  // using whatever the school's technique list actually has at each Rank.
  function unlockTechniques(schoolName, rank){
    const allTech = findSchoolTechniques(schoolName);
    const techniquesUnlocked = [];
    const steps = [];
    const cappedRank = Math.max(0, Math.min(rank, 5)); // core School Techniques only run Rank 1-5
    for(let r=1; r<=cappedRank; r++){
      // An Alternate Path replaces the School's Technique at exactly one Rank. Substituting it
      // here keeps f_schoolTechGranted's existing {school, techs:[]} shape untouched, so Phases
      // 3 and 4 are unaffected and this whole feature reverts by deleting the library, the
      // field and this branch.
      const substitute = pathAtRank(r);
      const techName = substitute ? substitute.tech : allTech[r-1];
      if(techName){
        const desc = techniqueDescription(techName);
        techniquesUnlocked.push({ rank:r, name:techName, desc });
        steps.push(`Rank ${r} technique unlocked: "${techName}" — ${desc}`);
      } else {
        steps.push(`Rank ${r}: ${schoolName||'this School'} has no listed technique at this Rank.`);
      }
    }
    return { schoolName, rank, techniquesUnlocked, debugExplanation: steps.join(' ') || `No School selected — nothing to unlock.` };
  }

  // ---- School Rank Technique "applied contribution" tracking ----
  // Same principle as the Family/School trait-bonus and skill tracking above: Rank
  // Techniques are School-granted data too, so they must be replaced, not stacked, when
  // the active School changes. This reads/writes the small hidden JSON field that records
  // exactly which Technique names in #techList this system granted, and for which School.
  function getSchoolTechGranted(){
    const raw = document.getElementById('f_schoolTechGranted').value;
    if(!raw) return null;
    try{ return JSON.parse(raw); }catch(e){ return null; }
  }
  function saveSchoolTechGranted(rec){
    document.getElementById('f_schoolTechGranted').value = JSON.stringify(rec);
  }
  // Finds the #techList entry (if any) this system auto-granted for `schoolName` under
  // `name` — matched by both name AND the "[School Technique — Rank N, <School>]" tag this
  // system stamps into the entry's own description, so a same-named manually-added or
  // other-source entry is never mistaken for that School's auto-granted one.
  function findSchoolGrantedTechRow(name, schoolName){
    return Array.from(document.querySelectorAll('#techList .entry')).find(div=>{
      const nameEl = div.querySelector('.en-name');
      const descEl = div.querySelector('.en-desc');
      if(!nameEl || nameEl.value.trim().toLowerCase()!==name.trim().toLowerCase()) return false;
      return descEl && descEl.value.includes(`, ${schoolName}]`);
    });
  }

  // Applies newly-unlocked techniques to the existing #techList, skipping anything already
  // present by name (prevents duplicate unlocks within the same School). Auto-unlocked
  // techniques are added at 0 XP, since they're granted by training rather than purchased.
  // If the active School has changed since this last ran, the PREVIOUS School's auto-granted
  // Rank Techniques are removed first — replaced, not stacked — leaving any Technique from
  // another source (Family, manual additions, etc.) untouched.
  function applyUnlockedTechniquesToList(schoolName, rank){
    const prevGrant = getSchoolTechGranted();
    if(prevGrant && prevGrant.school && prevGrant.school !== schoolName){
      (prevGrant.techs||[]).forEach(name=>{
        const row = findSchoolGrantedTechRow(name, prevGrant.school);
        if(row) row.remove();
      });
      // Free Kiho picks are the previous School's grant too, so they revert here for exactly
      // the same reason its Rank Techniques do, matched by the School named in their own tag.
      // PURCHASED Kiho are never touched: the character paid XP for those and keeps them.
      // Note this fires on School CHANGE only - dropping Rank within one School leaves granted
      // rows alone, which is what this function already does for Rank Techniques. A chosen Kiho
      // cannot be regenerated by a recount, so the counter reports the surplus instead.
      kihoRows().filter(r=>kihoRowIsFree(r, prevGrant.school)).forEach(r=>r.remove());
    }
    const result = unlockTechniques(schoolName, rank);
    // SAME School, but the granted set has changed - an Alternate Path was taken, swapped for
    // another, or cleared, or the School Rank fell. Remove the rows for Techniques this system
    // granted that the School no longer grants. Without this a swapped-out Path Technique
    // lingers in the list beside its replacement, so picking two Paths in turn left the
    // character holding both Techniques.
    // Only rows this system granted are touched - findSchoolGrantedTechRow matches on the
    // "[School Technique - Rank N, <School>]" tag as well as the name, so a manually added
    // Technique that happens to share a name is never removed.
    if(prevGrant && prevGrant.school === schoolName){
      const nowGranted = result.techniquesUnlocked.map(t=>t.name);
      (prevGrant.techs||[]).forEach(name=>{
        if(nowGranted.indexOf(name) >= 0) return;
        const row = findSchoolGrantedTechRow(name, schoolName);
        if(row) row.remove();
      });
    }
    const added = [];
    result.techniquesUnlocked.forEach(t=>{
      const already = Array.from(document.querySelectorAll('#techList .en-name'))
        .some(el=>el.value.trim().toLowerCase()===t.name.toLowerCase());
      if(!already){
        document.getElementById('techList').appendChild(makeEntry({
          name: t.name,
          cost: 0,
          desc: `[School Technique — Rank ${t.rank}, ${schoolName}] ${t.desc}`,
        }, true, 'XP'));
        added.push(t.name);
      }
    });
    // Persist the full set of Rank Techniques schoolName currently has unlocked at `rank`, so
    // a later School change (or simply re-running this at a higher Rank) knows exactly what
    // belongs to schoolName and can revert precisely, the same way f_schoolApplied does for
    // trait bonuses and skills.
    saveSchoolTechGranted({ school: schoolName, techs: result.techniquesUnlocked.map(t=>t.name) });
    return { ...result, added };
  }

  // A read-only snapshot matching the requested Character School Module shape, built fresh
  // from the live form state (the sheet's single source of truth is the DOM, so this module
  // is a computed view over it rather than a second, separately-tracked copy of the data).
  function getCharacterSchoolModule(){
    const schoolName = document.getElementById('f_school').value.trim();
    const currentInsight = parseInt(document.getElementById('f_insightPts').value||'0',10);
    const currentRank = parseInt(document.getElementById('f_rank').value||'1',10);
    const rankInfo = calculateSchoolRank(currentInsight);
    const techniquesUnlocked = unlockTechniques(schoolName, currentRank).techniquesUnlocked;
    return {
      schoolName,
      currentInsight,
      currentRank,
      nextRankInsightRequirement: rankInfo.insightToNextRank,
      techniquesUnlocked,
      allSchoolTechniques: ALL_SCHOOL_TECHNIQUES,
      debugExplanation: `${rankInfo.debugExplanation} ${schoolName ? `School: ${schoolName}. Unlocked: ${techniquesUnlocked.map(t=>`R${t.rank} ${t.name} — ${t.desc}`).join(' | ')||'none yet'}.` : 'No School selected yet.'}`,
    };
  }

  // ==================================================================================
  // MULTIPLE SCHOOLS SUPPORT
  // Extends the School Rank module above to support more than one School (via the
  // Multiple Schools Advantage) without disturbing how a single-School character works.
  //
  // Data model: an ordered array of School entries is persisted in the hidden
  // #f_schoolsData field (JSON), swept up automatically by the existing generic
  // collectData/applyData `[id^="f_"]` field logic — no extra save/load plumbing needed.
  // Each entry: { name, frozen, frozenRank, floorRank, anchorInsightRank }
  //   - The LAST entry in the array is always the character's current active School.
  //   - Adding a new School freezes whatever was previously active at its current
  //     (cap-respecting) Rank (frozen:true, frozenRank set) — frozen Schools never change again.
  //   - anchorInsightRank is the raw Insight-derived Rank at the moment a School became
  //     active; the School's own Rank is computed relative to that anchor, so a newly added
  //     School always starts at Rank 0 (Rule 1) and does not begin rising until the
  //     character's Insight Rank climbs past that anchor — i.e. at their *next* Insight Rank,
  //     never immediately (Rule 2). It never inherits whatever Rank Insight already implied.
  //   - floorRank is a high-water mark (never decreases from Insight fluctuating normally) for
  //     the active entry, but is itself always kept within the combined-Rank cap below.
  //   - Rule 3 (combined cap): the SUM of every School's Rank — every frozen entry plus the
  //     active one — can never exceed the character's current Insight Rank. Frozen entries are
  //     immutable, so computeCappedActiveRank() clamps the active entry (down to 0 if needed)
  //     whenever the frozen total alone would otherwise push the combined sum over the cap —
  //     this is what keeps things correct even if Insight Rank later drops.
  // ==================================================================================

  function getSchoolsList(){
    const raw = document.getElementById('f_schoolsData').value;
    if(raw){
      try{ const parsed = JSON.parse(raw); if(Array.isArray(parsed)) return parsed; } catch(e){ /* fall through */ }
    }
    // Migrate a pre-existing single f_school/f_rank pair (older saves, or a fresh chargen
    // that hasn't gone through this module yet) into a one-entry Schools list. anchorInsightRank
    // is 0 (not offset) so this entry's Rank continues to equal the raw Insight Rank directly,
    // exactly matching how the single-School system always behaved.
    const existingName = document.getElementById('f_school').value.trim();
    if(!existingName) return [];
    const existingRank = parseInt(document.getElementById('f_rank').value||'1',10) || 1;
    return [{ name: existingName, frozen:false, frozenRank:null, floorRank: existingRank, anchorInsightRank: 0 }];
  }
  function saveSchoolsList(list){
    document.getElementById('f_schoolsData').value = JSON.stringify(list);
  }

  // True once the character has purchased the Multiple Schools Advantage (matched by name
  // in the existing Advantages list) — this is what enables the "+ Add School" button.
  function hasMultipleSchoolsAdvantage(){
    return Array.from(document.querySelectorAll('#advList .en-name'))
      .some(el=>el.value.trim().toLowerCase()==='multiple schools');
  }
  // True once the character has ALSO purchased the Different School Advantage (matched by
  // name, same pattern as Multiple Schools above). Multiple Schools alone only lets you add
  // a second School from your OWN Clan; Different School is what lifts that Clan restriction.
  function hasDifferentSchoolAdvantage(){
    return Array.from(document.querySelectorAll('#advList .en-name'))
      .some(el=>el.value.trim().toLowerCase()==='different school');
  }
  // Looks up which Clan key in SCHOOL_LIBRARY a given School name belongs to (case-sensitive
  // match on the stored name), used to find the character's "home" Clan for the Add School
  // Clan restriction below. Returns null if the School isn't found (e.g. a custom/typed name).
  function findSchoolClan(schoolName){
    if(!schoolName) return null;
    for(const clan in SCHOOL_LIBRARY){
      if(SCHOOL_LIBRARY[clan].some(s=>s.name===schoolName)) return clan;
    }
    return null;
  }
  // Full SCHOOL_LIBRARY entry (name/skills/tech/shugenja/...) for a given School name,
  // regardless of Clan — used below to tell Bushi and Shugenja Schools apart.
  function findSchoolLibraryEntry(schoolName){
    if(!schoolName) return null;
    for(const clan in SCHOOL_LIBRARY){
      const found = SCHOOL_LIBRARY[clan].find(s=>s.name===schoolName);
      if(found) return found;
    }
    return null;
  }
  // Bushi vs. Shugenja exclusivity: a School is "Shugenja" if SCHOOL_LIBRARY flags it
  // (shugenja:true — every spell-casting School in the library carries this), and "Bushi"
  // if the word "Bushi" appears in its name (matches every Bushi School's naming convention,
  // including hybrid ones like "Kaiu Engineer [Artisan/Bushi]"). Courtier/Ninja/Monk/Artisan-
  // only Schools are neither, and this rule doesn't restrict them either way.
  function schoolCasterCategory(schoolEntry){
    if(!schoolEntry) return null;
    if(schoolEntry.shugenja) return 'shugenja';
    if(/\bbushi\b/i.test(schoolEntry.name)) return 'bushi';
    return null;
  }
  // Scans EVERY School the character has ever had (frozen or active — once trained, always
  // counts) and returns 'bushi' or 'shugenja' the moment one is found, or null if the
  // character hasn't committed to either path yet. Under no circumstances can a character
  // hold ranks in both, so once this returns non-null it locks out the opposite category
  // for every future "Add School" pick, regardless of Clan/Different School permissions.
  function characterCasterLock(){
    const list = getSchoolsList();
    for(const entry of list){
      const cat = schoolCasterCategory(findSchoolLibraryEntry(entry.name));
      if(cat) return cat;
    }
    return null;
  }

  // The concrete (named, non-"any one X") School Skills for a School, used to check skill
  // overlap when a second School is added.
  function schoolConcreteSkillNames(schoolName){
    for(const clan in SCHOOL_LIBRARY){
      const found = SCHOOL_LIBRARY[clan].find(s=>s.name===schoolName);
      if(found){
        return found.skills.split(',').map(s=>s.trim())
          .map(s=>s.replace(/\s*\d+\s*$/,'')) // drop a trailing "2" rank-count like "Horsemanship 2"
          .map(s=>s.replace(/\s*\([^)]*\)\s*$/,'')) // drop a "(Emphasis)" suffix
          .filter(s=>!/^any\b/i.test(s)) // "any one X" is a player choice, not a concrete skill
          .filter(Boolean);
      }
    }
    return [];
  }
  // Rule 4A (updated): a newly-added School's Techniques stay locked until the character has
  // at least 1 Rank in EVERY concrete School Skill that School teaches — not just one of them.
  // "Any one X Skill" choice slots are excluded (schoolConcreteSkillNames already drops those),
  // since there's no single fixed skill name to check for a player's free choice.
  // Example: Daidoji Iron Warrior teaches Battle, Defense, Iaijutsu, Kenjutsu, Kyujutsu (plus
  // "any one other Skill") — the character needs Rank 1+ in ALL FIVE named skills before any
  // of Daidoji Iron Warrior's Techniques unlock, not just one of them.
  function hasSchoolSkillOverlap(schoolName){
    const concrete = schoolConcreteSkillNames(schoolName).map(s=>s.toLowerCase());
    if(!concrete.length) return false;
    const owned = Array.from(document.querySelectorAll('#skillsBody tr'))
      .filter(tr=>parseInt(tr.querySelector('.sk-rank').value||'0',10) >= 1)
      .map(tr=>tr.querySelector('.sk-name').value.trim().toLowerCase());
    return concrete.every(s=>owned.includes(s));
  }

  // Rank of a School entry relative to its own anchor (see anchorInsightRank above), combined
  // with its never-decreasing floor. Frozen entries just return their frozenRank.
  // Rule 1 & 2 (new): a freshly-added School starts at Rank 0, not Rank 1, and does not begin
  // climbing immediately — it only rises once the character's Insight Rank moves past the
  // anchor it was added at (i.e. at the character's *next* Insight Rank), never before.
  function computeEntryRank(entry, insightPts){
    if(entry.frozen) return entry.frozenRank;
    const rawRank = calculateSchoolRank(insightPts).rank;
    const relativeRank = Math.max(0, rawRank - entry.anchorInsightRank); // starts at 0, no head start
    return Math.max(entry.floorRank||0, relativeRank, 0);
  }

  // Rule 3 (new): the combined School Rank total across EVERY School a character has (every
  // frozen entry plus the active one) can never exceed their current Insight Rank. Frozen
  // Schools are immutable once locked, so if Insight Rank ever ends up low enough that the
  // frozen total alone already meets or exceeds it (e.g. Insight dropped on a later
  // recalculation), the active School is the one that gets clamped down — all the way to 0 if
  // necessary — so the combined total can never violate the cap.
  function computeCappedActiveRank(list, insightPts){
    if(!list.length) return 0;
    const rawInsightRank = calculateSchoolRank(insightPts).rank;
    const activeIdx = list.length-1;
    const active = list[activeIdx];
    if(active.frozen) return active.frozenRank; // defensive; the last entry is normally the active one
    const frozenSum = list.slice(0, activeIdx).reduce((sum,e)=>sum + (e.frozenRank||0), 0);
    const uncapped = computeEntryRank(active, insightPts);
    const remainingCap = Math.max(0, rawInsightRank - frozenSum);
    return Math.min(uncapped, remainingCap);
  }

  // Adds a new School to the character (Rule 1 button action / Rule 2 & 3A). Freezes the
  // previously-active School at its current (cap-respecting) Rank, then starts the new one at
  // Rank 0 (Rule 1). Deliberately does NOT touch the skill list (Rule 3B — no automatic skill gains).
  function addSchoolToCharacter(schoolName){
    if(!hasMultipleSchoolsAdvantage()){
      setStatus('The Multiple Schools Advantage is required before adding another School.');
      return;
    }
    const list = getSchoolsList();
    if(list.some(s=>s.name.toLowerCase()===schoolName.toLowerCase())){
      setStatus(`${schoolName} is already one of this character's Schools.`);
      return;
    }
    // Defense in depth: the dropdown already disables Bushi/Shugenja-conflicting options,
    // but guard here too in case this is ever called directly with a blocked School.
    const casterLock = characterCasterLock();
    const newCat = schoolCasterCategory(findSchoolLibraryEntry(schoolName));
    if(casterLock && newCat && newCat!==casterLock){
      setStatus(`Can't add ${schoolName} — a character can never hold ranks in both a Bushi and a Shugenja School.`);
      return;
    }
    const insightPts = parseInt(document.getElementById('f_insightPts').value||'0',10);
    if(list.length){
      const active = list[list.length-1];
      if(!active.frozen){
        const rankBeforeFreeze = computeCappedActiveRank(list, insightPts); // must compute BEFORE marking frozen
        active.frozen = true;
        active.frozenRank = rankBeforeFreeze;
      }
    }
    const anchor = calculateSchoolRank(insightPts).rank;
    list.push({ name: schoolName, frozen:false, frozenRank:null, floorRank:0, anchorInsightRank: anchor });
    saveSchoolsList(list);
    const frozenName = list.length>1 ? list[list.length-2].name : null;
    setStatus(`Added ${schoolName} as a new School.${frozenName?` ${frozenName}'s Rank is now locked at ${list[list.length-2].frozenRank}.`:''} ${schoolName} starts at Rank 0 and won't rise until your next Insight Rank.`);
    recalcAll();
  }

  // Rebuilds the "+ Add School" button state, its dropdown of available Schools, and the
  // read-only Schools panel — called every recalcAll cycle so it always reflects the
  // current Advantages, Insight, and skill state.
  function refreshMultipleSchoolsUI(){
    const btn = document.getElementById('btnAddSchoolToggle');
    const sel = document.getElementById('addSchoolSelect');
    const hintEl = document.getElementById('addSchoolHint');
    const hasAdv = hasMultipleSchoolsAdvantage();
    btn.disabled = !hasAdv;
    btn.title = hasAdv ? 'Add another School (Multiple Schools)' : 'Requires the Multiple Schools Advantage';
    hintEl.textContent = hasAdv ? '' : 'Purchase the Multiple Schools Advantage to enable this.';
    if(!hasAdv) sel.style.display = 'none';

    const list = getSchoolsList();
    const already = new Set(list.map(s=>s.name.toLowerCase()));

    // ---------------------------------------------------------------------------------
    // Clan-restricted "Add School" list (new).
    // - The character's "primary School" is always list[0] — the School they started
    //   chargen with — and findSchoolClan() looks up which Clan key in SCHOOL_LIBRARY
    //   that School lives under.
    // - By default the dropdown is restricted to ONLY that Clan's Schools.
    // - The restriction is lifted (showing every Clan) only when BOTH the Multiple
    //   Schools Advantage AND the Different School Advantage are present — Multiple
    //   Schools alone still confines you to your own Clan; Different School is what
    //   grants permission to cross Clan lines.
    // - If the primary School can't be matched to a Clan (e.g. a custom/typed name not
    //   in SCHOOL_LIBRARY, or no School chosen yet), there's nothing valid to restrict
    //   to, so we fall back to showing every Clan rather than leaving the list empty.
    // ---------------------------------------------------------------------------------
    const hasDifferentSchool = hasDifferentSchoolAdvantage();
    const primaryClan = list.length ? findSchoolClan(list[0].name) : null;
    const showAllClans = (hasAdv && hasDifferentSchool) || !primaryClan;

    // ---------------------------------------------------------------------------------
    // Bushi/Shugenja exclusivity (new). caster is 'bushi', 'shugenja', or null (unlocked
    // path — the character's Schools so far are all Courtier/Ninja/Monk/Artisan-only).
    // This check is independent of, and layered on TOP of, the Clan restriction above —
    // it applies "under no circumstances", even with Different School purchased, so a
    // Bushi character can never add a Shugenja School (or vice versa) from any Clan.
    // Rather than hiding the conflicting option outright, it's kept visible but disabled
    // with a 🔒 explanation, matching how locked Kata options are already presented.
    // ---------------------------------------------------------------------------------
    const casterLock = characterCasterLock();

    let optHtml = '<option value="">— choose a School to add —</option>';
    Object.keys(SCHOOL_LIBRARY).forEach(clan=>{
      if(!showAllClans && clan!==primaryClan) return; // Clan-restricted: skip every other Clan
      const opts = SCHOOL_LIBRARY[clan].filter(s=>!already.has(s.name.toLowerCase()));
      if(!opts.length) return;
      optHtml += `<optgroup label="${escAttr(clan)}">`;
      opts.forEach(s=>{
        const cat = schoolCasterCategory(s);
        const blocked = casterLock && cat && cat!==casterLock;
        const label = blocked
          ? `${s.name} — 🔒 you're already ${casterLock==='bushi'?'a Bushi':'a Shugenja'}, can't also train as ${cat==='bushi'?'a Bushi':'a Shugenja'}`
          : s.name;
        optHtml += `<option value="${escAttr(s.name)}" ${blocked?'disabled':''}>${escAttr(label)}</option>`;
      });
      optHtml += '</optgroup>';
    });
    if(sel.innerHTML !== optHtml) sel.innerHTML = optHtml;

    // Let the player know why the list is (or isn't) restricted.
    if(hasAdv){
      const clanNote = showAllClans
        ? (hasDifferentSchool ? 'Different School purchased — Schools from any Clan are available.' : '')
        : `Restricted to ${primaryClan} Schools — purchase Different School to add Schools from other Clans.`;
      const casterNote = casterLock ? ` You're a ${casterLock==='bushi'?'Bushi':'Shugenja'} — ${casterLock==='bushi'?'Shugenja':'Bushi'} Schools are permanently unavailable.` : '';
      hintEl.textContent = clanNote + casterNote;
    }

    const insightPts = parseInt(document.getElementById('f_insightPts').value||'0',10);
    const panel = document.getElementById('schoolsPanel');
    panel.innerHTML = list.map((entry,i)=>{
      const isActive = i===list.length-1;
      const rank = isActive ? computeCappedActiveRank(list, insightPts) : entry.frozenRank;
      const statusTag = entry.frozen
        ? `<span style="color:var(--ink-soft);">Locked at Rank ${entry.frozenRank}</span>`
        : `<span style="color:var(--shu-dark);font-weight:600;">Active — Rank ${rank}</span>`;
      let gateNote = '';
      if(isActive && !entry.frozen && i>0 && !hasSchoolSkillOverlap(entry.name)){
        gateNote = ` <span style="color:var(--shu);">— Techniques locked until you have Rank 1+ in ALL of this School's own Skills.</span>`;
      }
      return `<div>${escHtml(entry.name)}: ${statusTag}${gateNote}</div>`;
    }).join('') || '<div style="color:var(--ink-soft);font-style:italic;">No School set yet — use Apply School above, or Add School once eligible.</div>';
  }
