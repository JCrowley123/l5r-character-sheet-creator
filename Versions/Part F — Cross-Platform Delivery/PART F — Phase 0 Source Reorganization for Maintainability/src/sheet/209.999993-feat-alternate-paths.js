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
      // ---------- Book of Air (pp. 171-182), third release ----------
      {name:'Asahina Archer [Bushi]', source:'Book of Air p.171', techRank:4,
       replaces:[{school:'Daidoji Iron Warrior', rank:4}, {school:'Doji Magistrate', rank:4}], excludes:[],
       requires:noReq({rings:{Air:3}, skills:{Kyujutsu:5}, families:['Asahina', 'Daidoji']}), tech:'No Regrets'},
      {name:'Crab Defender [Bushi]', source:'Book of Air p.172', techRank:2,
       replaces:[{school:'Hida Bushi', rank:2}, {school:'Hiruma Bushi', rank:2}], excludes:[],
       requires:noReq({traits:{Awareness:3, Agility:3}, skills:{Iaijutsu:4}}), tech:'Warrior of Earth'},
      {name:'Hiruma Snipers [Bushi]', source:'Book of Air p.172', techRank:4,
       replaces:[{school:'Hiruma Bushi', rank:4}, {school:'Hiruma Scout', rank:4, notInSheet:true}], excludes:[],
       requires:noReq({traits:{Reflexes:4}, skills:{Kyujutsu:5}}),
       note:'the Path exists only from the eighth century, after the fall of the Hiruma lands', tech:'The Crab’s Eye'},
      {name:'The Falcon’s Strike [Bushi]', source:'Book of Air p.172', techRank:2,
       replaces:[{school:'Toritaka Bushi', rank:2}, {school:'Hiruma Bushi', rank:2}, {school:'Hiruma Scout', rank:2, notInSheet:true}], excludes:[],
       requires:noReq({emphases:[['Kyujutsu', 'Yumi', 3]]}),
       note:'Hiruma Schools may take it only after the Falcon join the Crab, early in the twelfth century', tech:'Spotting the Prey'},
      {name:'Tsuruchi Master Bowman [Bushi]', source:'Book of Air p.173', techRank:6,
       replaces:[{school:'Tsuruchi Archer', rank:6}, {school:'Tsuruchi Bounty Hunter', rank:6}], excludes:[],
       requires:noReq({skills:{Kyujutsu:7}, narrative:['selection by the Tsuruchi sensei']}),
       note:'a sixth Technique, after School Rank 5; it replaces nothing', tech:'The Way of the Archer'},
      {name:'Saigo’s Blades [Bushi]', source:'Book of Air p.173', techRank:3,
       replaces:[{school:'Bayushi Bushi', rank:3}], excludes:[],
       requires:noReq({skills:{Iaijutsu:3}}), tech:'Saigo’s Technique'},
      {name:'Unicorn Yomanri Archer [Bushi]', source:'Book of Air pp.173-174', techRank:4,
       replaces:[{school:'Shinjo Bushi', rank:4}, {school:'Moto Bushi', rank:4}, {school:'Moto Vindicator', rank:4}, {school:'Utaku Battle Maiden', rank:4}], excludes:[],
       requires:noReq({traits:{Agility:4}, skills:{Kyujutsu:5}}), tech:'The Way of Yomanri'},
      {name:'Taoist Archer', source:'Book of Air p.174', techRank:5,
       replaces:[{any:'brotherhood', rank:5}], excludes:[],
       requires:noReq({rings:{Void:4}, emphases:[['Kyujutsu', 'Yumi', 5]], skills:{'Lore: Theology':3, Meditation:4}}),
       note:'from the Pre-Coup era ronin may learn it too; the sheet has no ronin Schools', tech:'Flight of Innocence'},
      {name:'Kaze-do Fighter', source:'Book of Air pp.174-175', techRank:2,
       replaces:[{any:'brotherhood', rank:2}], excludes:[],
       requires:noReq({emphases:[['Jiujutsu', 'Kaze-do', 3]]}),
       note:'normally only peasants and Brotherhood monks may learn it; at the GM’s option a ronin or a Tattooed monk who befriends a teacher', tech:'The Way of Air'},
      {name:'Doji Innocents [Courtier]', source:'Book of Air p.177', techRank:3,
       replaces:[{school:'Doji Courtier', rank:3}], excludes:[],
       requires:noReq({honor:5, emphases:[['Sincerity', 'Honesty', 4]]}),
       conditional:{severity:'conditional', text:'Knowingly telling a lie costs 2 Honor and the Technique for a month.'},
       tech:'The Power of Innocence'},
      {name:'Daidoji Trading Council [Courtier]', source:'Book of Air pp.177-178', techRank:3,
       replaces:[{school:'Doji Courtier', rank:3}, {school:'Doji Magistrate', rank:3}, {school:'Daidoji Iron Warrior', rank:3}, {school:'Daidoji Scout', rank:3}], excludes:[],
       requires:noReq({emphases:[['Commerce', 'Merchant', 3]], advantagesAny:[['Gentry', 'Wealthy']]}),
       note:'the GM may waive the Advantage for someone who has proved himself as a merchant', tech:'The Golden Path'},
      {name:'The Hand of Peace [Courtier]', source:'Book of Air p.178', techRank:4,
       replaces:[{school:'Ide Emissary', rank:4}], excludes:[],
       requires:noReq({honor:5}),
       conditional:{severity:'conditional', text:'Damaging a fellow Rokugani by violence, even in self-defence, costs the Technique for a month.'},
       tech:'Ide’s Ideal'},
      {name:'Shosuro Defilers [Courtier]', source:'Book of Air p.178', techRank:3,
       replaces:[{school:'Bayushi Courtier', rank:3}, {school:'Shosuro Actor', rank:3}], excludes:[],
       requires:noReq({glory:3, emphases:[['Sincerity', 'Deceit', 3]]}), tech:'Shameless Slander'},
      {name:'The Dark Whisper [Courtier]', source:'Book of Air pp.178-179', techRank:3,
       replaces:[{school:'Daigotsu Courtier', rank:3}], excludes:[],
       requires:noReq({narrative:['an Air kansen bound into your body by a Chuda ritual (it does not Taint you, but can be sensed and sets off Ward of Purity)']}),
       tech:'Voice of the Kansen'},
      {name:'The Silken Promises [Courtier]', source:'Book of Air p.179', techRank:3, replaces:[], excludes:[],
       unreachable:'a ronin geisha Path (the sheet has no ronin or geisha Schools)',
       requires:noReq({skills:{Acting:3}, narrative:['admission to the Silken Promises as a geisha', 'three Perform Skills at Rank 3']}), tech:'Dance of Silk'},
      {name:'The Asahina Artisans', source:'Book of Air p.180', techRank:3,
       replaces:[{school:'Asahina Shugenja', rank:3}], excludes:[], requires:noReq(), tech:'Hake’s Lesson'},
      {name:'Master of Games [Courtier]', source:'Book of Air p.180', techRank:2, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({skills:{Courtier:3, Etiquette:3}, narrative:['residence in Nanashi Mura (twelfth century) or a ronin group with like resources']}),
       tech:'Forge Your Own Fate'},
      {name:'Kitsu Spirit Legion [Shugenja]', source:'Book of Air p.180', techRank:4,
       replaces:[{school:'Kitsu Shugenja', rank:4}], excludes:[],
       requires:noReq({narrative:['being born with the gift to serve in the Spirit Legion']}), tech:'The Legions of the Dead'},
      {name:'Mist Legion [Shugenja]', source:'Book of Air p.181', techRank:3,
       replaces:[{school:'Isawa Shugenja', rank:3, affinity:'Air'}], excludes:[],
       requires:noReq({narrative:['an Air Affinity']}), tech:'The World Is A Canvas'},
      {name:'Shiba Illusionist [Artisan/Shugenja]', source:'Book of Air pp.181-182', techRank:1,
       replaces:[{school:'Isawa Shugenja', rank:1}, {school:'Shiba Artisan', rank:1}], excludes:[], requires:noReq(),
       note:'you take the Trait, Skills, Honor and Outfit of the School you attend; you always have an Air Affinity, and if this is your first shugenja Technique you start with 3 Air, 2 Water and 1 Earth spell',
       tech:'The Tejina’s Art'},
      {name:'Sisters of the Sacred Light [Shugenja]', source:'Book of Air p.182', techRank:2,
       replaces:[{school:'Asahina Shugenja', rank:2}, {school:'Isawa Shugenja', rank:2, affinity:'Air'}, {school:'Moshi Shugenja', rank:2}], excludes:[],
       requires:noReq(), tech:'Light Banishes Lies'},
      {name:'Soshi Deceiver [Shugenja]', source:'Book of Air p.182', techRank:3,
       replaces:[{school:'Soshi Shugenja', rank:3}], excludes:[], requires:noReq(), tech:'Way of the Shadow'},
      // ---------- Book of Earth (pp. 191-204), third release ----------
      {name:'Hiruma Slayers [Bushi]', source:'Book of Earth p.191', techRank:4,
       replaces:[{school:'Hiruma Bushi', rank:4}, {school:'Hiruma Scout', rank:4, notInSheet:true}], excludes:[],
       requires:noReq({emphases:[['Heavy Weapons', 'Masakari', 5]]}),
       note:'the book lets the GM forbid combining it with the Crab Berserker Path', tech:'Deny the Horde'},
      {name:'Crab Sumai Wrestler [Bushi]', source:'Book of Earth p.191', techRank:2,
       replaces:[{school:'Hida Bushi', rank:2}, {school:'Yasuki Courtier', rank:2}], excludes:[],
       requires:noReq({emphases:[['Jiujutsu', 'Sumai', 4]]}),
       note:'taking it removes the Small Disadvantage for free; if you are not Small you gain Large for free, and if you already have Large its cost is refunded',
       tech:'The Way of Sumai'},
      {name:'Kaiu Siegemaster [Bushi]', source:'Book of Earth p.192', techRank:5,
       replaces:[{school:'Kaiu Engineer', rank:5}], excludes:[],
       requires:noReq({emphases:[['Battle', 'Mass Battle', 5], ['Engineering', 'Siege', 5]]}), tech:'The Hammer of Kaiu'},
      {name:'Daidoji Heavy Regulars [Bushi]', source:'Book of Earth p.192', techRank:4,
       replaces:[{school:'Daidoji Iron Warrior', rank:4}], excludes:[],
       requires:noReq({skills:{'Heavy Weapons':5}}), tech:'Way of the Iron Crane'},
      {name:'Akodo Siege Strategist [Bushi]', source:'Book of Earth p.193', techRank:4,
       replaces:[{school:'Akodo Bushi', rank:4}, {school:'Akodo Tactical Master', rank:2, notInSheet:true}], excludes:[],
       requires:noReq({emphases:[['Battle', 'Mass Battle', 6], ['Engineering', 'Siege', 4]]}), tech:'Broken by Tactics'},
      {name:'Shiba Armorsmith [Bushi/Artisan]', source:'Book of Earth p.193', techRank:2,
       replaces:[{school:'Shiba Bushi', rank:2}], excludes:[],
       requires:noReq({skills:{'Craft: Armorsmithing':3, Defense:3}}), tech:'Brilliant Steel'},
      {name:'Unicorn Bariqu Wrestler [Bushi]', source:'Book of Earth p.193', techRank:2,
       replaces:[{family:'Moto', type:'bushi', rank:2}, {school:'Shinjo Bushi', rank:2}], excludes:[],
       requires:noReq({emphases:[['Jiujutsu', 'Bariqu', 3]]}), tech:'Way of the Ujik-Hai'},
      {name:'Kuni Crystal Master [Shugenja]', source:'Book of Earth p.195', techRank:4,
       replaces:[{school:'Kuni Shugenja', rank:4}], excludes:[],
       requires:noReq({rings:{Earth:5}, skills:{Spellcraft:5}, emphases:[['Lore: Elements', 'Crystal', 5]],
                       narrative:['a piece of pure crystal', 'the GM’s approval']}),
       note:'the Crystal Masters arise in the twelfth century', tech:'Strike of Purity'},
      {name:'Tamori Weaponsmith [Artisan/Shugenja]', source:'Book of Earth p.196', techRank:2,
       replaces:[{school:'Tamori Shugenja', rank:2}], excludes:[],
       requires:noReq({skills:{'Craft: Weaponsmithing':3}, narrative:['the ability to cast a spell that creates a weapon, such as Tetsubo of Earth or Katana of Fire']}),
       tech:'Soul of the Stone'},
      {name:'Child of Chikushudo [Shugenja]', source:'Book of Earth p.196', techRank:3,
       replaces:[{school:'Kitsune Shugenja', rank:3}], excludes:[],
       requires:noReq({skills:{Hunting:3}, emphases:[['Lore: Spirit Realms', 'Chikushudo', 2]]}), tech:'Born of the Earth'},
      {name:'Isawa Temple Guardians [Shugenja]', source:'Book of Earth p.197', techRank:3,
       replaces:[{school:'Isawa Shugenja', rank:3}, {school:'Agasha Shugenja', rank:3}], excludes:[],
       requires:noReq({rings:{Earth:4}, skills:{'Lore: Theology':3}}), tech:'Never This Sacred Ground Shall Fall'},
      {name:'Iuchi Couriers [Shugenja]', source:'Book of Earth p.197', techRank:2,
       replaces:[{school:'Iuchi Shugenja', rank:2}], excludes:[],
       requires:noReq({skills:{Horsemanship:3}, advantages:['Way of the Land']}),
       note:'also called the Lords of the Plains', tech:'Beyond the Wind'},
      {name:'The Severed Hand [Courtier]', source:'Book of Earth p.202', techRank:4,
       replaces:[{clan:'Crab', type:'bushi', rank:4}], excludes:[],
       requires:noReq({narrative:['being sent to the courts because an injury or infirmity ends your service in war (Missing Limb or Lame, for example)']}),
       tech:'Strength of Bamboo'},
      {name:'Yasuki Extortionist [Courtier]', source:'Book of Earth pp.202-203', techRank:4,
       replaces:[{school:'Yasuki Courtier', rank:4}], excludes:[],
       requires:noReq({traits:{Willpower:4}, skills:{Commerce:4, Intimidation:5}}),
       note:'the GM may also open it to Crane characters, replacing Doji Courtier 4 (or Doji Magistrate 4)', tech:'Do Me a Favor'},
      {name:'Yoritomo Sculptors [Artisan]', source:'Book of Earth p.202', techRank:2,
       replaces:[{clan:'Mantis', types:['bushi', 'courtier'], rank:2}], excludes:[],
       requires:noReq({skillsAny:[{skills:['Artisan: Sculpture', 'Craft: Sculpture'], rank:4, label:'Artisan: Sculpture or Craft: Sculpture 4'}]}),
       tech:'Watanabe’s Legacy'},
      {name:'Yoritomo Emissaries [Courtier]', source:'Book of Earth p.203', techRank:4,
       replaces:[{school:'Yoritomo Courtier', rank:4}], excludes:[],
       requires:noReq({emphases:[['Etiquette', 'Courtesy', 4]]}), tech:'Intrepid Negotiator'},
      {name:'Otomo Bureaucrat [Courtier]', source:'Book of Earth p.204', techRank:3,
       replaces:[{school:'Otomo Courtier', rank:3}], excludes:[],
       requires:noReq({emphases:[['Etiquette', 'Bureaucracy', 5]]}), tech:'Imperial Scrutiny'},
      // ---------- Book of Fire (pp. 177-190), third release ----------
      {name:'Crab Knife-fighters [Bushi]', source:'Book of Fire p.177', techRank:4,
       replaces:[{school:'Hida Bushi', rank:4}, {school:'Hida Pragmatist', rank:4}, {school:'Hiruma Bushi', rank:3},
                 {school:'Hiruma Scout', rank:3, notInSheet:true}], excludes:[],
       requires:noReq({skills:{Knives:3}}), tech:'One Blade, Both Hands'},
      {name:'Hojatsu’s Legacy [Bushi]', source:'Book of Fire p.177', techRank:4,
       replaces:[{school:'Mirumoto Bushi', rank:4}, {school:'Mirumoto Taoist Swordsman', rank:5}], excludes:[],
       requires:noReq({skills:{Iaijutsu:5}}), tech:'Strike When You Cannot'},
      // Printed "Craft: Stealth 5"; read as Stealth 5, the Skill a Shosuro assassin trains.
      {name:'Shosuro Assassins [Ninja]', source:'Book of Fire p.178', techRank:6,
       replaces:[{school:'Shosuro Infiltrator', rank:6}, {school:'Shosuro Actor', rank:6}], excludes:[],
       requires:noReq({skills:{Stealth:5, Knives:5}}),
       note:'a sixth Technique, after School Rank 5; it replaces nothing. The book prints the requirement as "Craft: Stealth 5"; the sheet reads it as Stealth 5',
       tech:'The Hidden Blade'},
      {name:'Mantis Whirlwind Fighters [Bushi]', source:'Book of Fire p.178', techRank:4,
       replaces:[{school:'Yoritomo Bushi', rank:4}], excludes:[],
       requires:noReq({emphases:[['Knives', 'Kama', 5]]}), tech:'Waves Rush to Shore'},
      // Printed "Hare Bushi 2": the Hare Clan's School, Usagi Bushi in this sheet.
      {name:'Ujina Skirmishers [Bushi]', source:'Book of Fire p.178', techRank:2,
       replaces:[{school:'Usagi Bushi', rank:2}], excludes:[],
       requires:noReq({emphases:[['Knives', 'Tanto', 3]]}), note:'printed as replacing "Hare Bushi 2", the Usagi Bushi School', tech:'Master of the Quick Blade'},
      {name:'Asahina Fire Sculptors [Shugenja/Artisan]', source:'Book of Fire pp.180-181', techRank:2,
       replaces:[{type:'shugenja', rank:2}], excludes:[],
       requires:noReq({rings:{Fire:3}, skillsAny:[{skills:['Artisan: Sculpture'], rank:2, label:'Artisan (Sculpture) 2'}]}),
       note:'at the GM’s option, one Free Raise on a Fire spell once a day', tech:'The Inner Shape of Fire'},
      {name:'The College of Clarity [Courtier]', source:'Book of Fire p.181', techRank:2,
       replaces:[{rank:2}], excludes:[],
       requires:noReq({rings:{Fire:3}, skills:{Meditation:2}}),
       note:'a duelist may instead take +1k0 on one Iaijutsu (Focus) / Void roll in the same hours', tech:'The Clarity of Fire'},
      {name:'Agasha Alchemist [Shugenja]', source:'Book of Fire p.182', techRank:3,
       replaces:[{school:'Agasha Shugenja', rank:3}], excludes:[],
       requires:noReq({rings:{Fire:3}, skills:{Spellcraft:3}}), tech:'Fury of the Elements'},
      {name:'The Inferno Guard [Shugenja]', source:'Book of Fire p.182', techRank:3,
       replaces:[{school:'Isawa Shugenja', rank:3, affinity:'Fire'}], excludes:[],
       requires:noReq({rings:{Fire:3}, emphases:[['Battle', 'Mass Battle', 3]], narrative:['a Fire Affinity']}), tech:'Menacing Flames'},
      {name:'Asako Scholar [Courtier]', source:'Book of Fire p.190', techRank:3,
       replaces:[{school:'Asako Loremaster', rank:3}, {school:'Asako Henshin', rank:3}], excludes:[],
       requires:noReq({traits:{Intelligence:4}, skills:{Investigation:3}}), tech:'The Hidden Patterns'},
      {name:'Ikoma Historians [Courtier]', source:'Book of Fire p.190', techRank:3,
       replaces:[{school:'Ikoma Bard', rank:3}, {school:'Ikoma Lion’s Shadow', rank:3}], excludes:[],
       requires:noReq({skills:{'Lore: History':5}}), note:'you gain the Forbidden Knowledge (Empire’s True History) Advantage', tech:'The Past and the Present'},
      // ---------- Book of Water (pp. 176-186), third release ----------
      {name:'Cliff’s Edge Student [Bushi]', source:'Book of Water pp.176-177', techRank:3,
       replaces:[{school:'Tsuruchi Bounty Hunter', rank:3}, {school:'Yoritomo Bushi', rank:4}], excludes:[],
       requires:noReq({traits:{Agility:4}, skills:{'Chain Weapons':5}}), tech:'Howl of the Cliff’s Edge'},
      {name:'The Scorpion’s Tail [Bushi/Ninja]', source:'Book of Water p.177', techRank:3,
       replaces:[{school:'Bayushi Bushi', rank:3}, {school:'Shosuro Infiltrator', rank:4}], excludes:[],
       requires:noReq({skills:{Athletics:4, 'Chain Weapons':4}}), tech:'The Tail’s Reach'},
      {name:'Student of Mizu-do [Monk/Artisan]', source:'Book of Water p.178', techRank:3,
       replaces:[{any:'brotherhood', rank:3}, {school:'Doji Courtier', rank:3}, {school:'Kakita Artisan', rank:3}, {school:'Asahina Shugenja', rank:3}], excludes:[],
       requires:noReq({rings:{Water:3}, emphases:[['Jiujutsu', 'Mizu-do', 4]], narrative:['access to a Mizu-do sensei']}),
       note:'only a non-martial Brotherhood order may teach it (the GM decides which); the GM may open it to any courtier School', tech:'The Way of Water'},
      {name:'The Disciples of the River [Shugenja]', source:'Book of Water p.178', techRank:3,
       replaces:[{school:'Kitsu Shugenja', rank:3}], excludes:[],
       requires:noReq({advantages:['Way of the Land'], narrative:['your Way of the Land covers an area with a river']}), tech:'Servant of the River'},
      {name:'The Acolytes of Snow [Shugenja]', source:'Book of Water p.179', techRank:2,
       replaces:[{school:'Isawa Shugenja', rank:2}, {clan:'Phoenix', type:'shugenja', rank:3, exceptSchools:['Isawa Shugenja']}], excludes:[],
       requires:noReq({narrative:['Lore: Yuki no Onna 3, or a Water Affinity']}), tech:'The Maiden’s Icy Grasp'},
      {name:'Kawaru Sages [Shugenja]', source:'Book of Water p.179', techRank:2,
       replaces:[{clan:'Phoenix', type:'shugenja', rank:2}, {school:'Tonbo Shugenja', rank:2}], excludes:[],
       requires:noReq({emphases:[['Divination', 'Kawaru', 3]]}), tech:'The Veil of the Future'},
      {name:'Seppun Astrologers [Shugenja]', source:'Book of Water p.179', techRank:4,
       replaces:[{school:'Seppun Shugenja', rank:4}], excludes:[],
       requires:noReq({emphases:[['Divination', 'Omens', 5]], narrative:['Astrology 4 (as the book prints it)']}), tech:'Wisdom of the Heavens'},
      {name:'Daidoji Spymaster [Courtier/Ninja]', source:'Book of Water p.185', techRank:3,
       replaces:[{school:'Daidoji Iron Warrior', rank:3}, {school:'Daidoji Scout', rank:3}, {school:'Doji Courtier', rank:3}], excludes:[],
       requires:noReq({families:['Daidoji'], narrative:['the Crafty Advantage, or an Honor Rank of 4.0 or less']}), tech:'Truth in Shadows'},
      {name:'Kitsuki’s Eye [Courtier]', source:'Book of Water p.186', techRank:6,
       replaces:[{school:'Kitsuki Investigator', rank:6}], excludes:[],
       requires:noReq({narrative:['recruitment into the Eye by its sensei']}),
       note:'a sixth Technique, after School Rank 5; it replaces nothing', tech:'The Eye Sees All'},
      {name:'Scales of the Carp [Courtier]', source:'Book of Water p.186', techRank:3, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({skills:{Commerce:4, 'Lore: Underworld':3}, narrative:['recruitment by existing members']}), tech:'Swimming Beneath the Waves'},
      // ---------- Book of Void (pp. 182-195), third release ----------
      {name:'Hateru Ninja', source:'Book of Void p.182', techRank:2, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({skills:{Acting:3, Stealth:3}}),
       note:'the ninja families are legends unless the GM makes them real', tech:'The False Dragon'},
      {name:'Sesai Ninja', source:'Book of Void p.182', techRank:2,
       replaces:[{school:'Shiba Bushi', rank:2}], excludes:[],
       requires:noReq({skills:{Stealth:3}}),
       note:'the ninja families are legends unless the GM makes them real', tech:'Anything for the Phoenix'},
      {name:'Koga Ninja', source:'Book of Void p.182', techRank:1, replaces:[], excludes:[],
       unreachable:'a peasant ronin Path with its own Skills and Outfit (the sheet has no peasant or ronin Schools)',
       requires:noReq({narrative:['being born into the Koga "family" or recruited by it']}),
       note:'the ninja families are legends unless the GM makes them real', tech:'The People’s Vengeance'},
      {name:'Fading Shadows [Shugenja]', source:'Book of Void p.183', techRank:5,
       replaces:[{clan:'Scorpion', type:'shugenja', rank:5}], excludes:[],
       requires:noReq({rings:{Void:4}, skills:{Spellcraft:5},
                       narrative:['the Forbidden Knowledge (Lying Darkness) Advantage', 'induction into the Hidden Moon Dojo (only Scorpion of irreproachable loyalty)']}),
       tech:'Unravel the Shadow'},
      {name:'Dragon Channeler [Shugenja]', source:'Book of Void p.184', techRank:6,
       replaces:[{clan:'Phoenix', type:'shugenja', rank:6}], excludes:[],
       requires:noReq({skills:{Meditation:5, Spellcraft:5, 'Lore: Theology':5},
                       narrative:['one Ring at 5 or more and two others at 4 or more', 'being chosen by the Elemental Dragons or trained by a Dragon Channeler']}),
       note:'a sixth Technique, after School Rank 5; it replaces nothing. Phoenix only in the canonical timeline; the GM may change that',
       tech:'Beseech the Dragons'},
      {name:'Ghost of the Forest', source:'Book of Void p.195', techRank:2, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({skills:{'Lore: Spirit Realms':2}, narrative:['the Way of the Land (Nazo Mori) Advantage']}),
       tech:'Walk Among the Trees'},
      // ---------- Enemies of the Empire (pp. 27, 49, 85), third release ----------
      {name:'The Bloodspeaker Technique', source:'Enemies of the Empire p.27', techRank:null,
       replaces:[{anyRank:true}], excludes:[],
       requires:noReq({narrative:['being taught by a senior member of the Bloodspeaker Cult']}),
       note:'anyone may learn it, at any Rank; learned at Rank 1 it lowers starting Honor to 1.0 (Skills and Outfit unchanged). It is maho, and the Cult’s secret',
       tech:'Iuchiban’s Method'},
      {name:'Guardian of the Hidden Temple [Bushi]', source:'Enemies of the Empire p.49', techRank:4, replaces:[], excludes:[],
       unreachable:'a ronin Path of the Kolat (the sheet has no ronin Schools)',
       requires:noReq({narrative:['recruitment by the Kolat for their Hidden Guard', 'no Taint or corruption by the Nothing']}),
       tech:'Tigers Do Not Fall'},
      {name:'Kolat Master', source:'Enemies of the Empire p.49', techRank:6,
       replaces:[{rank:6}], excludes:[],
       requires:noReq({emphases:[['Courtier', 'Manipulation', 5], ['Intimidation', 'Control', 4]],
                       narrative:['two mental Traits at 5 or more', 'membership of the Kolat, chosen to lead one of the ten Sects', 'no Taint or corruption by the Nothing']}),
       note:'at Insight Rank 6 or higher, in place of any Technique or as an extra one; mainly for NPCs, open to players only if the GM allows Kolat characters',
       tech:'Will of the Master'},
      {name:'Master Bowman [Bushi]', source:'Enemies of the Empire p.85', techRank:3, replaces:[], excludes:[],
       unreachable:'a Naga Path, replacing Naga Warrior 3 (the sheet has no Naga Schools)',
       requires:noReq({narrative:['Archery 5 (the Naga Skill)']}), tech:'Arrows from the Ranks'},
      {name:'Disciples of the Dashmar [Courtier]', source:'Enemies of the Empire p.85', techRank:2, replaces:[], excludes:[],
       unreachable:'a Naga Path, replacing Naga Vedic 2 (the sheet has no Naga Schools)',
       requires:noReq(), tech:'Friend of Man'},
      {name:'Pearl Shapers [Shugenja]', source:'Enemies of the Empire p.85', techRank:2, replaces:[], excludes:[],
       unreachable:'a Naga jakla Path; the book prints no Replaces line (the sheet has no Naga Schools)',
       requires:noReq(), tech:'Shards of Light'},
      // ---------- Imperial Histories (pp. 69-306), third release ----------
      // Historical-era Paths: each note says the era the book sets it in; the GM may move it.
      {name:'Gozoku Agent [Courtier]', source:'Imperial Histories p.69', techRank:2,
       replaces:[{rank:2}], excludes:[],
       requires:noReq({narrative:['the Forbidden Knowledge (Gozoku) Advantage']}),
       note:'the Gozoku conspiracy’s technique; it dies out when they are purged and returns in the twelfth century, unless the GM rules otherwise',
       tech:'Overwhelming Presence'},
      {name:'Tortoise Guard [Bushi]', source:'Imperial Histories p.97', techRank:4,
       replaces:[{school:'Kasuga Smuggler', rank:4}], excludes:[],
       requires:noReq({traits:{Strength:3}, skillOfKind:[{kinds:['Weapon'], rank:4, label:'one Weapon Skill at Rank 4'}]}),
       tech:'The Path of One'},
      {name:'Kenburo’s Way [Bushi]', source:'Imperial Histories p.123', techRank:4,
       replaces:[{type:'bushi', rank:4}], excludes:[],
       requires:noReq({skills:{Intimidation:5, Iaijutsu:5}, narrative:['being a student of the Ruby Dojo (normally only Emerald and Jade Magistrates)']}),
       note:'an Imperial and ronin Path; the GM may open it to other ronin', tech:'The Butcher’s Gaze'},
      {name:'People’s Legionnaire [Bushi]', source:'Imperial Histories p.123', techRank:1, replaces:[], excludes:[],
       unreachable:'a peasant ronin Path with its own Skills and Outfit (the sheet has no peasant or ronin Schools)',
       requires:noReq(), note:'the Great Famine era’s peasant army; the GM may use it for any lasting peasant or ronin army', tech:'Unity of Purpose'},
      {name:'Scorpion Loyalist', source:'Imperial Histories p.148', techRank:2,
       replaces:[{clan:'Scorpion', rank:2}], excludes:[],
       requires:noReq({narrative:['Courtier 4 for a courtier, Spellcraft 4 for a shugenja, or one Weapon Skill at 4 for a bushi or ninja']}),
       note:'the era before the Scorpion Clan Coup, with roots in the Gozoku era', tech:'No Matter the Cost'},
      {name:'Kitsuki Justicar [Bushi]', source:'Imperial Histories p.149', techRank:3,
       replaces:[{school:'Kitsuki Investigator', rank:3}], excludes:[],
       requires:noReq({skills:{Iaijutsu:4, Investigation:4}}), tech:'The Purity of Justice'},
      {name:'Three Man Alliance Soldier [Bushi]', source:'Imperial Histories p.149', techRank:2,
       replaces:[{school:'Tsuruchi Archer', rank:2}, {school:'Tsuruchi Bounty Hunter', rank:2}, {school:'Suzume Bushi', rank:2}], excludes:[],
       requires:noReq({skills:{Battle:2}}), note:'formed in the twelfth century, and still taught in Suzume and Tsuruchi dojo decades later',
       tech:'Stand Against Oppression'},
      {name:'The Nameless Ones [Shugenja]', source:'Imperial Histories p.214', techRank:3,
       replaces:[{school:'Isawa Shugenja', rank:3}], excludes:[],
       requires:noReq({advantages:['Ishiken-do']}), note:'from the Pre-Coup era to the Hidden Emperor era', tech:'Darkness Undone'},
      {name:'Tsume Pikemen [Bushi]', source:'Imperial Histories pp.275-276', techRank:3,
       replaces:[{clan:'Crane', type:'bushi', rank:3}], excludes:[],
       requires:noReq({honor:3, skills:{Spears:3, Polearms:3}, narrative:['membership of the Tsume, or close ties to them']}),
       note:'a ronin Path of the Heroes of Rokugan era; the book’s sidebar lets the GM make it a Crane Path at Rank 3 for the Tsume and Doji allied to them, which is how the sheet offers it',
       tech:'Wall of Pikes'},
      {name:'Acolyte of Thunder [Shugenja]', source:'Imperial Histories p.306', techRank:4,
       replaces:[{school:'Yoritomo Shugenja', rank:4}, {school:'Moshi Shugenja', rank:4}], excludes:[],
       requires:noReq({rings:{Fire:3, Void:4}}),
       note:'late twelfth century in the canonical timeline (Yoritomo and Moshi); the Thousand Years of Darkness otherwise', tech:'Thunder’s Call'},
      // ---------- Imperial Histories 2 (pp. 103-287), third release ----------
      {name:'Hawk Purist [Courtier]', source:'Imperial Histories 2 p.103', techRank:1, replaces:[], excludes:[],
       unreachable:'a ronin Path with its own Skills and Honor (the sheet has no ronin Schools)',
       requires:noReq(), note:'ronin of the Heresy of the Five Rings; the GM may use it for any ronin band reaching to become a Minor Clan',
       tech:'Grace from the Shadows'},
      {name:'Order of the Stone Crab [Bushi]', source:'Imperial Histories 2 p.127', techRank:4,
       replaces:[{clan:'Crab', type:'bushi', rank:4}], excludes:[],
       requires:noReq({honorBelow:5}),
       note:'the Steel Chrysanthemum’s reign; printed as "any Bushi School (of appropriate clan)", and the GM may use it for any ruthless band serving a villain',
       tech:'Scorn the Weak'},
      {name:'Chrysanthemum Conspirator', source:'Imperial Histories 2 p.127', techRank:2,
       replaces:[{types:['bushi', 'courtier'], rank:2}], excludes:[],
       requires:noReq({narrative:['the Dark Secret (Rebel) Disadvantage']}),
       note:'the plot against the Steel Chrysanthemum; it may survive or be recreated by later rebels against a tyrant', tech:'No Course But One'},
      {name:'Doji Marines [Bushi]', source:'Imperial Histories 2 p.197', techRank:3,
       replaces:[{school:'Doji Magistrate', rank:3}, {school:'Daidoji Iron Warrior', rank:4}], excludes:[],
       requires:noReq({skills:{Sailing:3}}), note:'the Shattered Empire era', tech:'Chomei’s Courage'},
      {name:'Kaiu Shipmasters [Artisan/Bushi]', source:'Imperial Histories 2 p.197', techRank:3,
       replaces:[{school:'Kaiu Engineer', rank:3}, {school:'Kaiu Siege Master', rank:1, notInSheet:true}], excludes:[],
       requires:noReq({skills:{Battle:4, Sailing:5}}), note:'the Shattered Empire era', tech:'Umasu’s Steel'},
      {name:'Isawa Seaguard [Shugenja]', source:'Imperial Histories 2 p.197', techRank:3,
       replaces:[{school:'Isawa Shugenja', rank:3}], excludes:[],
       requires:noReq({rings:{Water:3, Air:3}, skills:{Sailing:3}}), note:'the Shattered Empire era', tech:'The Ward of the Sea'},
      {name:'The Unbroken [Bushi]', source:'Imperial Histories 2 p.220', techRank:3, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({skills:{'Lore: Shadowlands':3}, narrative:['at least one Rank of Taint, and a way to learn the Technique']}),
       tech:'The Unbroken Technique'},
      {name:'Second Gozoku Agent', source:'Imperial Histories 2 p.245', techRank:2,
       replaces:[{rank:2}], excludes:[],
       requires:noReq({honorAtMost:4, narrative:['an Obligation to the Second Gozoku or its leader']}),
       note:'the Shadowed Throne setting; the Second Gozoku of Bayushi Atsuki in the canonical history too', tech:'To Shield the Empress'},
      {name:'Serpent Hunter [Bushi]', source:'Imperial Histories 2 p.287', techRank:null,
       replaces:[{type:'bushi', anyRank:true}], excludes:[],
       requires:noReq({skills:{'Lore: Naga':3, Hunting:3}}),
       note:'it replaces the Rank of your bushi School whose Technique gives attacks as a Simple Action; the Colonies of the Age of Exploration',
       tech:'Blood of the Serpent'},
      // ---------- Secrets of the Empire (pp. 234-241), third release ----------
      {name:'The Thousand [Bushi]', source:'Secrets of the Empire p.234', techRank:2, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({rings:{Void:3}, skills:{Iaijutsu:4}}), note:'a ronin band of the First Yasuki War, wiped out by the Unicorn in 816',
       tech:'Tamedaore’s Secret'},
      {name:'Order of Isashi [Shugenja]', source:'Secrets of the Empire p.234', techRank:3, replaces:[], excludes:[],
       unreachable:'a ronin Path, replacing any ronin shugenja School at Rank 3 (the sheet has no ronin Schools)',
       requires:noReq({honor:5, skills:{Medicine:3}}), tech:'Isashi’s Mercy'},
      {name:'Order of the Five Weapons [Shugenja]', source:'Secrets of the Empire p.235', techRank:4, replaces:[], excludes:[],
       unreachable:'a ronin Path, replacing any ronin shugenja School at Rank 4 (the sheet has no ronin Schools)',
       requires:noReq({skills:{Kenjutsu:3, 'Heavy Weapons':3, Spears:3, Staves:3},
                       narrative:['the ability to cast two of the four Elemental weapon spells (Yari of Air, Katana of Fire, Tetsubo of Earth, Bo of Water)']}),
       note:'with the Ishiken-do Advantage you may learn the order’s secret spell, Dart of Void', tech:'Ekuro’s Weapons'},
      {name:'Ichiro Pass Warden', source:'Secrets of the Empire p.237', techRank:3,
       replaces:[{school:'Ichiro Bushi', rank:3}], excludes:[],
       requires:noReq({traits:{Strength:4}, skills:{Spears:4, Athletics:4}}), tech:'Hold the Passes'},
      {name:'Dragonfly Advisor [Courtier/Shugenja]', source:'Secrets of the Empire p.237', techRank:3,
       replaces:[{school:'Tonbo Shugenja', rank:3}], excludes:[],
       requires:noReq({traits:{Intelligence:3}, skills:{Meditation:5}}), tech:'Seeing the Pattern'},
      {name:'Ox Clan Vigilant', source:'Secrets of the Empire p.238', techRank:4,
       replaces:[{school:'Morito Bushi', rank:4}], excludes:[],
       requires:noReq({skills:{Investigation:5}}),
       note:'the late twelfth century; the GM may also open it to the Shinjo Bushi School', tech:'Seek the Guilty'},
      {name:'Suzume Storyteller [Courtier/Artisan]', source:'Secrets of the Empire p.238', techRank:2,
       replaces:[{school:'Suzume Bushi', rank:2}], excludes:[],
       requires:noReq({skills:{'Perform: Storytelling':3}, advantages:['Precise Memory']}), tech:'The Heart of the Story'},
      // Printed "Tortoise Smuggler 3": the Tortoise Clan's School, Kasuga Smuggler in this sheet.
      {name:'Tortoise Killer [Bushi]', source:'Secrets of the Empire p.239', techRank:3,
       replaces:[{school:'Kasuga Smuggler', rank:3}], excludes:[],
       requires:noReq({traits:{Agility:3}, skills:{Stealth:4},
                       skillOfKind:[{kinds:['Weapon'], rank:4, count:2, label:'two Weapon Skills at Rank 4'}]}),
       note:'printed as replacing "Tortoise Smuggler 3", the Kasuga Smuggler School', tech:'The Poisoned Frog'},
      {name:'Satoshi’s Legacy [Bushi]', source:'Secrets of the Empire p.241', techRank:4,
       replaces:[{school:'Miya Herald', rank:4}], excludes:[],
       requires:noReq({skills:{Kenjutsu:5}}), tech:'Fire and Ice'},
      {name:'Seppun Hidden Guard [Shugenja]', source:'Secrets of the Empire p.241', techRank:3,
       replaces:[{school:'Seppun Shugenja', rank:3}], excludes:[],
       requires:noReq({narrative:['being chosen to serve in the Hidden Guard']}), tech:'Harmony in All'},
      // ---------- Strongholds of the Empire (pp. 25-169), third release ----------
      // (Dark Path Sohei, p.93, was already in the sheet's library.)
      {name:'Kitsune Artisan', source:'Strongholds of the Empire p.25', techRank:2,
       replaces:[{school:'Kitsune Shugenja', rank:2}], excludes:[],
       requires:noReq({skillOfKind:[{kinds:['Artisan', 'Craft'], rank:3, label:'one Artisan or Craft Skill at Rank 3'}]}),
       tech:'The Beauty of the World'},
      {name:'Tsuruchi Swordsman [Bushi]', source:'Strongholds of the Empire p.25', techRank:4,
       replaces:[{school:'Tsuruchi Archer', rank:4}, {school:'Tsuruchi Bounty Hunter', rank:4}], excludes:[],
       requires:noReq({skills:{Kenjutsu:3}}), tech:'Ascendancy of Steel'},
      {name:'Hiruma Yojimbo [Bushi]', source:'Strongholds of the Empire p.44', techRank:3,
       replaces:[{school:'Hiruma Bushi', rank:3}, {school:'Hiruma Scout', rank:3, notInSheet:true}], excludes:[],
       requires:noReq({skills:{Defense:3}}), tech:'The Crab’s Shell'},
      {name:'Yasuki Enforcer [Bushi]', source:'Strongholds of the Empire p.44', techRank:2,
       replaces:[{school:'Yasuki Courtier', rank:2}, {school:'Hida Pragmatist', rank:2}], excludes:[],
       requires:noReq({skills:{Intimidation:3}}), tech:'Gentle Encouragement'},
      {name:'Calm Heart Duelist [Bushi]', source:'Strongholds of the Empire pp.60-61', techRank:3,
       replaces:[{clan:'Unicorn', type:'bushi', rank:3}], excludes:[],
       requires:noReq({skills:{Iaijutsu:3, 'Lore: Law':1}}), tech:'The Calm Heart Conquers'},
      // Printed "Ide Courtier 1": the Unicorn courtier School, Ide Emissary in this sheet.
      {name:'Ide Caravan Master [Courtier]', source:'Strongholds of the Empire p.61', techRank:1,
       replaces:[{school:'Ide Emissary', rank:1}], excludes:[],
       requires:noReq({skills:{Commerce:2}}),
       note:'printed as replacing "Ide Courtier 1", the Ide Emissary School; it keeps that School’s Benefit, Skills, Honor and Outfit',
       tech:'The Gilded Road'},
      {name:'Asako Philosopher [Courtier]', source:'Strongholds of the Empire p.76', techRank:2,
       replaces:[{school:'Asako Loremaster', rank:2}], excludes:[],
       requires:noReq({skills:{Etiquette:3}, emphases:[['Courtier', 'Rhetoric', 2]]}), tech:'The Winds of Rhetoric'},
      {name:'Provincial Guard [Bushi]', source:'Strongholds of the Empire p.76', techRank:2,
       replaces:[{school:'Shiba Bushi', rank:2}], excludes:[],
       requires:noReq({skills:{Defense:2, Etiquette:2}}), tech:'Maintaining the Peace'},
      {name:'Daigotsu Scout [Bushi]', source:'Strongholds of the Empire pp.92-93', techRank:2,
       replaces:[{school:'Daigotsu Bushi', rank:2}], excludes:[],
       requires:noReq({skills:{Stealth:3}}), tech:'The Cloak of Shadows'},
      {name:'Water Hammer Smith', source:'Strongholds of the Empire p.108', techRank:2,
       replaces:[{clan:'Dragon', rank:2}], excludes:[],
       requires:noReq({skillOfKind:[{kinds:['Craft'], rank:3, label:'one Craft Skill at Rank 3'}]}), tech:'Child of the Water'},
      {name:'Mirumoto Sentinel [Bushi]', source:'Strongholds of the Empire p.108', techRank:4,
       replaces:[{school:'Mirumoto Bushi', rank:4}, {school:'Mirumoto Taoist Swordsman', rank:3}], excludes:[],
       requires:noReq({advantages:['Way of the Land']}),
       note:'the book prints no Technique Rank: it replaces Rank 4 of the Mirumoto Bushi or Rank 3 of the Taoist Swordsman', tech:'Master the Land'},
      {name:'Crane Elite Spearman [Bushi]', source:'Strongholds of the Empire pp.134-135', techRank:2,
       replaces:[{school:'Daidoji Iron Warrior', rank:2}, {school:'Daidoji Scout', rank:2}], excludes:[],
       requires:noReq({skills:{Spears:3}}), tech:'Talons of the Daidoji'},
      {name:'Lioness Legion [Bushi]', source:'Strongholds of the Empire p.135', techRank:2,
       replaces:[{school:'Matsu Berserker', rank:2}, {school:'Akodo Bushi', rank:2}, {school:'Matsu Beastmaster', rank:2}], excludes:[],
       requires:noReq({skills:{Athletics:3}}), tech:'Charge of the Pride'},
      {name:'Ikoma Warden [Bushi]', source:'Strongholds of the Empire p.135', techRank:2,
       replaces:[{school:'Akodo Bushi', rank:2}, {school:'Ikoma Lion’s Shadow', rank:2}], excludes:[],
       requires:noReq({skills:{Horsemanship:3}}), tech:'To Race the Wind'},
      {name:'Doji Warrior-Poet [Bushi]', source:'Strongholds of the Empire p.135', techRank:2,
       replaces:[{school:'Kakita Bushi', rank:2}], excludes:[],
       requires:noReq({skills:{Iaijutsu:2, 'Perform: Poetry':2}}), tech:'Fan & Sword'},
      {name:'Scorpion Weaponmaster [Bushi]', source:'Strongholds of the Empire pp.152-153', techRank:4,
       replaces:[{school:'Bayushi Bushi', rank:4}], excludes:[],
       requires:noReq({skillOfKind:[{kinds:['Weapon'], rank:2, count:3, label:'three Weapon Skills at Rank 2'}]}), tech:'I Am A Weapon'},
      {name:'Shadow Blades [Ninja]', source:'Strongholds of the Empire p.153', techRank:3,
       replaces:[{school:'Bayushi Bushi', rank:3}, {school:'Shosuro Infiltrator', rank:3}], excludes:[],
       requires:noReq({skills:{Ninjutsu:3}}), tech:'Never Beyond My Reach'},
      {name:'The Guards’ Wrath [Bushi]', source:'Strongholds of the Empire p.168', techRank:2, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools); not for Forest Killers or Tengoku’s Justice ronin',
       requires:noReq(), note:'the Guards, honest ronin who hire out as guards and escorts; the GM may use it for any such band',
       tech:'The Guards’ Wrath'},
      {name:'Fireman Gang Lord [Bushi]', source:'Strongholds of the Empire p.169', techRank:2, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq(), note:'the fireman gangs of Ryoko Owari; the GM may use it for any local crime lord', tech:'Master of the Dice'},
      {name:'Minor Clan Alliance Diplomat [Courtier]', source:'Strongholds of the Empire p.169', techRank:4,
       replaces:[{minorClan:true, exceptClans:['Mantis'], rank:4}], excludes:[],
       requires:noReq(), note:'for samurai of a Minor Clan; taught at the Alliance court in Kudo Mura. The Mantis are a Great Clan by then, so their Schools are left out',
       tech:'The Courts of Kudo Mura'},
      // ---------- Sword and Fan (Appendix, pp. 202-211), third release ----------
      {name:'Tsuru’s Legion [Bushi]', source:'Sword and Fan p.202', techRank:2,
       replaces:[{school:'Hida Bushi', rank:2}, {school:'Hiruma Bushi', rank:2}], excludes:[],
       requires:noReq({skills:{Horsemanship:3}}),
       note:'joining adds a steed (Rokugani pony) to your Outfit if you have none', tech:'Overrun'},
      {name:'Yasuki Taskmaster [Bushi]', source:'Sword and Fan p.203', techRank:4,
       replaces:[{school:'Hida Bushi', rank:4}, {school:'Hida Pragmatist', rank:4}, {school:'Yasuki Courtier', rank:3}], excludes:[],
       requires:noReq({traits:{Willpower:4}, skills:{Intimidation:5, Battle:3}}), tech:'Fear is a Gift'},
      {name:'Doji Apologist [Courtier]', source:'Sword and Fan p.203', techRank:4,
       replaces:[{school:'Doji Courtier', rank:4}], excludes:[],
       requires:noReq({emphases:[['Etiquette', 'Courtesy', 5]]}), tech:'All Is Forgiven'},
      {name:'The Dragon’s Wind [Bushi]', source:'Sword and Fan p.205', techRank:3,
       replaces:[{school:'Mirumoto Taoist Swordsman', rank:3}, {school:'Mirumoto Bushi', rank:4}], excludes:[],
       requires:noReq({skills:{Horsemanship:5}, emphases:[['Kyujutsu', 'Dai-Kyu', 5]]}),
       note:'joining adds a steed (Rokugani pony) and a dai-kyu to your Outfit if you have none', tech:'Way of the Horse and Bow'},
      {name:'Ikoma Orator [Courtier]', source:'Sword and Fan pp.205-206', techRank:3,
       replaces:[{school:'Ikoma Bard', rank:3}], excludes:[],
       requires:noReq({skills:{Sincerity:4, 'Lore: Bushido':3, 'Perform: Oratory':4}}), tech:'The Voice of Bushido'},
      {name:'Lion Tactician (Ikoma Tactician) [Bushi]', source:'Sword and Fan p.205', techRank:4,
       replaces:[{clan:'Lion', type:'bushi', rank:4}, {school:'Ikoma Bard', rank:4}], excludes:[],
       requires:noReq({skills:{Battle:4, 'War Fan':4}, narrative:['at least the military rank of gunso']}),
       note:'called Ikoma Tacticians in the twelfth century, while the Akodo family is disbanded', tech:'The Commander’s Fan'},
      {name:'Ikoma Scrapper [Bushi]', source:'Sword and Fan p.206', techRank:4,
       replaces:[{school:'Akodo Bushi', rank:4}, {school:'Matsu Berserker', rank:4}, {school:'Ikoma Lion’s Shadow', rank:4}, {school:'Ikoma Bard', rank:4}], excludes:[],
       requires:noReq({traits:{Strength:4}, skills:{Jiujutsu:5}}), tech:'Every Scar Has a Name'},
      {name:'Mantis Orochi Rider', source:'Sword and Fan p.206', techRank:6,
       replaces:[{clan:'Mantis', rank:6}, {clan:'Mantis', type:'shugenja', rank:5}], excludes:[],
       requires:noReq({rings:{Water:4}, skills:{Athletics:5, 'Lore: Spirit Realms':5},
                       narrative:['being chosen as an Orochi Rider and forming a bond with an Orochi']}),
       note:'at Insight Rank 6 in place of a Mantis School’s Technique, or a Rank with none after Rank 5 of a Mantis Basic School; a Mantis shugenja takes it at Rank 5 instead, as a shugenja Path. The latter twelfth century',
       tech:'The Orochi Pact'},
      {name:'Shiba Advisor [Courtier]', source:'Sword and Fan p.207', techRank:3,
       replaces:[{school:'Asako Loremaster', rank:3}], excludes:[],
       requires:noReq({skills:{'Lore: History':3, 'Lore: War':3}, families:['Shiba']}), tech:'Lessons Never Forgotten'},
      {name:'Asako Mediator [Courtier]', source:'Sword and Fan p.207', techRank:2,
       replaces:[{school:'Asako Loremaster', rank:2}, {school:'Shiba Bushi', rank:2}, {school:'Isawa Shugenja', rank:2}], excludes:[],
       requires:noReq({emphases:[['Sincerity', 'Honesty', 3]], narrative:['the Mediators’ oath never to start violence against a fellow Rokugani']}),
       note:'breaking the oath costs Glory and Honor much as a Blasphemous Breach of Etiquette, and expulsion', tech:'Stand Down'},
      {name:'Bayushi Distracter [Courtier]', source:'Sword and Fan p.208', techRank:3,
       replaces:[{school:'Bayushi Courtier', rank:3}], excludes:[],
       requires:noReq({emphases:[['Sincerity', 'Deceit', 3]]}), tech:'Smoke Screen'},
      {name:'The Scorpion Elite Guard [Bushi]', source:'Sword and Fan pp.208-209', techRank:3,
       replaces:[{school:'Bayushi Bushi', rank:3}, {school:'Shosuro Actor', rank:3}], excludes:[],
       requires:noReq({skills:{Kenjutsu:5}, narrative:['Lore (your chosen Great Clan) 3, or at the GM’s option Heart of Vengeance against that Clan']}),
       note:'the GM may also use it for Bayushi Eiyo’s "Violators" of the twelfth-century exile', tech:'The Eyes of My Enemy'},
      {name:'Unicorn War-Dog Master [Bushi]', source:'Sword and Fan p.209', techRank:4,
       replaces:[{school:'Shinjo Bushi', rank:4}, {school:'Utaku Mounted Infantry', rank:4}, {school:'Moto Bushi', rank:4}], excludes:[],
       requires:noReq({traits:{Awareness:3, Willpower:4}, emphases:[['Animal Handling', 'War-Dogs', 5]]}),
       note:'you gain a pack of Unicorn war-dogs (Core Rulebook p.321), as many as your Awareness', tech:'Ferocity of the Ki-Rin'},
      {name:'Shinjo Magistrate [Bushi]', source:'Sword and Fan p.209', techRank:2,
       replaces:[{school:'Shinjo Bushi', rank:2}, {school:'Utaku Battle Maiden', rank:2}, {school:'Moto Bushi', rank:2}, {school:'Moto Vindicator', rank:2}], excludes:[],
       requires:noReq({skills:{Investigation:3, 'Lore: Law':3}}), tech:'Eyes of the Vigilant'},
      {name:'Imperial Influencer [Courtier]', source:'Sword and Fan p.210', techRank:3,
       replaces:[{school:'Otomo Courtier', rank:3}], excludes:[],
       requires:noReq({traits:{Awareness:4}, skills:{Etiquette:5, Sincerity:5}, narrative:['Status 4.0 or higher']}), tech:'Follow My Lead'},
      {name:'The Rising Sun [Bushi]', source:'Sword and Fan p.210', techRank:5,
       replaces:[{school:'Seppun Guardsman', rank:5}], excludes:[],
       requires:noReq({traits:{Strength:4}, skills:{Horsemanship:5, Spears:5}}),
       note:'with the GM’s permission, any bushi Basic School at Rank 5 for a character in the Imperial Legions; joining adds a steed to your Outfit if you have none',
       tech:'The Storm of Heaven’s Wrath'},
      // Printed "Miya Courtier 4": the Miya School, Miya Herald in this sheet.
      {name:'Imperial Observer [Courtier]', source:'Sword and Fan p.211', techRank:4,
       replaces:[{school:'Otomo Courtier', rank:4}, {school:'Miya Herald', rank:4}], excludes:[],
       requires:noReq({skills:{Sincerity:4}, skillsAny:[{skills:['Battle', 'Lore: War'], rank:4, label:'Battle 4 or Lore: War 4'}],
                       narrative:['Status 3.0 or higher']}),
       note:'printed as replacing "Miya Courtier 4", the Miya Herald School; at the GM’s option any courtier School at Rank 4 with Imperial sponsorship',
       tech:'Pierce the Fog of War'},
      // ---------- The Great Clans (pp. 41-282), third release ----------
      // (Togashi Defender, p.104, was already in the sheet's library.)
      {name:'Toritaka Exorcist [Shugenja]', source:'The Great Clans pp.41-42', techRank:2,
       replaces:[{school:'Kuni Shugenja', rank:2}], excludes:[],
       requires:noReq({traits:{Willpower:3, Perception:3}, skills:{Calligraphy:3}}),
       note:'Exorcists alone can make exorcism wards (sidebar, p.42)', tech:'Purge the Darkness'},
      {name:'Kakita Jester [Artisan]', source:'The Great Clans p.73', techRank:5,
       replaces:[{school:'Kakita Artisan', rank:5}], excludes:[],
       requires:noReq(), note:'the GM should not take Glory or Honor from a Jester for insults or minor breaches made in the role',
       tech:'The Art of Mockery'},
      {name:'Kitsuki Debater [Courtier]', source:'The Great Clans p.103', techRank:3,
       replaces:[{school:'Kitsuki Investigator', rank:3}], excludes:[],
       requires:noReq({skills:{Courtier:3}, emphases:[['Etiquette', 'Conversation', 5]]}),
       note:'before the ninth century the GM may open it to Mirumoto bushi instead', tech:'The Ebb and Flow of Deception'},
      {name:'The Dragon’s Flame [Bushi]', source:'The Great Clans p.103', techRank:4,
       replaces:[{clan:'Dragon', type:'bushi', rank:4}], excludes:[],
       requires:noReq({skills:{Kyujutsu:5}}), tech:'Rain of Death'},
      {name:'Akodo Kensai [Bushi]', source:'The Great Clans p.139', techRank:4,
       replaces:[{clan:'Lion', type:'bushi', rank:4}], excludes:[],
       requires:noReq({skills:{Iaijutsu:4, Kenjutsu:5}, narrative:['the Prodigy Advantage, or else Iaijutsu 5 and Kenjutsu 6 in its place']}),
       tech:'The Heart of the Sword'},
      {name:'Lion Scout [Bushi]', source:'The Great Clans p.140', techRank:2,
       replaces:[{clan:'Lion', type:'bushi', rank:2}], excludes:[],
       requires:noReq({skills:{Battle:2, Hunting:3}}), tech:'Shadow Unseen'},
      {name:'Lion Paragon [Bushi]', source:'The Great Clans p.140', techRank:3,
       replaces:[{clan:'Lion', type:'bushi', rank:3}], excludes:[],
       requires:noReq({honor:7, rings:{Void:4}, skills:{Kenjutsu:5}}), tech:'Pure and Dedicated'},
      {name:'Moshi Guardian of the Sun [Bushi]', source:'The Great Clans pp.169-170', techRank:1,
       replaces:[{clan:'Mantis', type:'bushi', rank:1}], excludes:[],
       requires:noReq(),
       note:'a Rank 1 Path with its own start: Benefit +1 Stamina; Skills Athletics, Defense, Jiujutsu, Kenjutsu, Lore: Theology, Spears and one High or Bugei Skill; Honor 6.5; its own Outfit (p.170). Before the Moshi join the Mantis it may be a schoolless Moshi bushi’s Rank 1',
       tech:'Defended as the Sun'},
      {name:'Kitsune Ranger [Bushi]', source:'The Great Clans p.170', techRank:2,
       replaces:[{clan:'Mantis', type:'bushi', rank:2}], excludes:[],
       requires:noReq({skills:{Hunting:3}}),
       note:'before the Kitsune join the Mantis, any bushi-trained Kitsune may take it at Rank 2, School or none; also a ronin’s Rank 2 Technique with an Ally among the Kitsune',
       tech:'One with the Wild'},
      {name:'Elemental Legions [Bushi]', source:'The Great Clans pp.201-202', techRank:3,
       replaces:[{school:'Shiba Bushi', rank:3}], excludes:[],
       requires:noReq({skills:{'Lore: Elements':2}, narrative:['your Lore: Elements is in your Legion’s Element', 'selection for one of the four Elemental Legions']}),
       note:'the Legions of Wind, Stone, Flame and the Wave, which march with the Isawa Elemental Guard', tech:'Strength of the Five'},
      {name:'Order of Chikai', source:'The Great Clans p.202', techRank:5,
       replaces:[{school:'Shiba Bushi', rank:5}], excludes:[],
       requires:noReq({pathsHeld:['Shiba Yojimbo [Bushi]'], narrative:['selection for the Order of Chikai']}),
       note:'the Shiba Yojimbo Path must have been taken at Rank 3', tech:'None Must Fall'},
      {name:'Kuroiban [Shugenja]', source:'The Great Clans p.230', techRank:4,
       replaces:[{clan:'Scorpion', type:'shugenja', rank:4}], excludes:[],
       requires:noReq({traits:{Willpower:4}, skills:{'Lore: Maho':3, 'Lore: Shadowlands':3}, narrative:['being chosen for the secret order of the Kuroiban']}),
       tech:'The Black Watch'},
      {name:'Ide Trader [Courtier]', source:'The Great Clans p.259', techRank:2,
       replaces:[{school:'Ide Emissary', rank:2}], excludes:[],
       requires:noReq({skills:{Commerce:3}, narrative:['a career as a merchant patron']}),
       note:'under the Way of the Daimyo rules (Emerald Empire), taking it earns a Duty Point', tech:'Brisk Economy'},
      {name:'Moto Fanatic [Bushi]', source:'The Great Clans p.260', techRank:4,
       replaces:[{family:'Moto', type:'bushi', rank:4}], excludes:[],
       requires:noReq(), tech:'Reckless Abandon'},
      {name:'Utaku Horse Master', source:'The Great Clans p.260', techRank:2,
       replaces:[{clan:'Unicorn', rank:2}], excludes:[],
       requires:noReq({families:['Utaku'], narrative:['being a man of the Utaku family']}), tech:'Master of the Open Plains'},
      {name:'Chuda Necromancer [Shugenja]', source:'The Great Clans p.282', techRank:3,
       replaces:[{school:'Chuda Shugenja', rank:3}], excludes:[],
       requires:noReq({skills:{'Lore: Shadowlands':3}, narrative:['knowing the maho spell Summon Undead Champion']}), tech:'The Dead Do Not Rest'},
      // ---------- Ronin Paths: Core Rulebook (pp. 234-235) and Enemies of the Empire (pp. 200-205), third release ----------
      // Ronin Paths are the ronin form of an Alternate Path (Core p.234). The sheet has no ronin Schools,
      // so these are recorded for the audit and cannot be taken.
      {name:'Disciples of Sun Tao [Bushi]', source:'Core Rulebook p.234', techRank:1, replaces:[], excludes:[],
       unreachable:'a Rank 1 ronin Path with its own Benefit, Skills, Honor and Outfit (the sheet has no ronin Schools)',
       requires:noReq(), note:'the GM may use it for any band with an emphasis on dueling', tech:'The Gaze of Sun Tao'},
      {name:'Forest Killers [Bushi]', source:'Core Rulebook pp.234-235', techRank:1, replaces:[], excludes:[],
       unreachable:'a Rank 1 ronin Path with its own Benefit, Skills, Honor and Outfit (the sheet has no ronin Schools)',
       requires:noReq(), note:'bandits of the Shinomen Mori; the GM may use it for any large, menacing band', tech:'Strength of the Forest'},
      {name:'Tawagoto’s Army [Bushi]', source:'Core Rulebook p.235', techRank:1, replaces:[], excludes:[],
       unreachable:'a Rank 1 ronin Path with its own Benefit, Skills, Honor and Outfit (the sheet has no ronin Schools)',
       requires:noReq(), note:'the GM may use it for any band working together for the common good', tech:'The People’s Will'},
      {name:'Tengoku’s Justice [Bushi]', source:'Core Rulebook p.235', techRank:1, replaces:[], excludes:[],
       unreachable:'a Rank 1 ronin Path with its own Benefit, Skills, Honor and Outfit (the sheet has no ronin Schools)',
       requires:noReq(), note:'mountain bandits of the Dragon lands; the GM may use it for any small, fast-striking band', tech:'Heaven’s Curse'},
      {name:'The Tessen [Bushi]', source:'Core Rulebook p.235', techRank:1, replaces:[], excludes:[],
       unreachable:'a Rank 1 ronin Path with its own Benefit, Skills, Honor and Outfit (the sheet has no ronin Schools)',
       requires:noReq(), note:'war-fan ronin of Toshi Ranbo; the GM may use it for any small, defensive band', tech:'Folds of the Iron Fan'},
      {name:'Claws of the Wolf [Bushi]', source:'Enemies of the Empire p.200', techRank:2, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({narrative:['the Wary Advantage and the Driven Disadvantage']}),
       note:'vigilantes following Toturi Sezaru; the GM may use it for any band devoted to a ruthless figure', tech:'Hunting the Darkness'},
      {name:'East Wind [Bushi]', source:'Enemies of the Empire p.200', techRank:2, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({honor:4, skills:{Commerce:1, Horsemanship:2}}), tech:'Shielded by the East'},
      {name:'Eyes of Nanashi [Bushi]', source:'Enemies of the Empire pp.200-201', techRank:2, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({honor:4, skills:{'Lore: Law':3}}), tech:'Strike the Center (Eyes of Nanashi)'},
      {name:'Moonless Riders [Bushi]', source:'Enemies of the Empire p.201', techRank:2, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({skills:{Horsemanship:3}, advantages:['Way of the Land']}), tech:'Moving the Shadow'},
      {name:'Silent Blades [Bushi]', source:'Enemies of the Empire p.201', techRank:2, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({skills:{Ninjutsu:3, Stealth:3}}), tech:'Black Hearts, Red Blades'},
      {name:'Broken Guard [Bushi]', source:'Enemies of the Empire pp.201-202', techRank:3, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({skills:{Polearms:3}, narrative:['the Heart of Vengeance (Unicorn) Disadvantage']}),
       note:'the GM may use it for any anti-cavalry band, or one with a grudge against the Unicorn', tech:'The Tiger’s Teeth'},
      {name:'Hidden Sword [Bushi]', source:'Enemies of the Empire p.202', techRank:3, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({advantages:['Hero of the People']}), tech:'Keeping the Peace'},
      {name:'Machi-kanshisha [Bushi]', source:'Enemies of the Empire p.202', techRank:3, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({skills:{Athletics:2, Staves:3}}), tech:'Smoke and Mirrors'},
      {name:'Serpents of Sanada [Bushi]', source:'Enemies of the Empire p.202', techRank:3, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({honorAtMost:3, skills:{Knives:3, Sailing:3}}), tech:'The Serpents’ Coils'},
      {name:'Snow Riders [Bushi]', source:'Enemies of the Empire p.203', techRank:3, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({skills:{Athletics:3, Horsemanship:4}}), tech:'The Journey’s Beginning'},
      {name:'Seven Waves Mercenaries [Bushi]', source:'Enemies of the Empire p.203', techRank:4, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({narrative:['being a clan ronin (one who learned a clan School before becoming ronin)']}), tech:'Roaring to Shake Heaven'},
      {name:'Sword of Yotsu [Bushi]', source:'Enemies of the Empire p.203', techRank:4, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({honor:5, skills:{Kenjutsu:4}, advantages:['Hero of the People']}), tech:'Shelter the Blameless'},
      {name:'Weavers [Bushi]', source:'Enemies of the Empire pp.203-204', techRank:4, replaces:[], excludes:[],
       unreachable:'a ronin Path of the Kolat (the sheet has no ronin Schools)',
       requires:noReq({narrative:['Allies (Kolat), Dark Secret (Kolat) or Obligation (Kolat)']}), tech:'Twist the Weave'},
      {name:'Iron Gauntlet Brotherhood [Bushi]', source:'Enemies of the Empire p.204', techRank:5, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({rings:{Earth:4}, skillOfKind:[{kinds:['Weapon'], rank:5, label:'one Weapon Skill at Rank 5'}]}), tech:'For My Brothers'},
      {name:'Shadowed Steel [Bushi]', source:'Enemies of the Empire p.204', techRank:5, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({skills:{Athletics:4, Ninjutsu:4, Stealth:4}}), tech:'Death’s Dark Shadow'},
      {name:'Wolf Legion [Bushi]', source:'Enemies of the Empire pp.204-205', techRank:5, replaces:[], excludes:[],
       unreachable:'a ronin Path (the sheet has no ronin Schools)',
       requires:noReq({honor:5}), note:'the ronin of Toturi’s Army after the Clan War', tech:'Black Lion Talon'},
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
      'No Regrets': 'On an archery attack, Called Shots cost one Raise fewer (minimum 1), and you add half your Air Ring, rounded down, as unkept dice to the attack roll. (Asahina Archer, Book of Air p.171)',
      'Warrior of Earth': 'In the Strike step of an iaijutsu duel you have extra Reduction equal to three times your Earth Ring. (Crab Defender, Book of Air p.172)',
      'The Crab’s Eye': 'You may attack with a yumi as a Simple Action. A ranged attack with a yumi ignores the target’s Reduction from armor or natural toughness, and half of any Reduction from magic. (Hiruma Snipers, Book of Air p.172)',
      'Spotting the Prey': 'With a bow you may use Perception instead of Reflexes for ranged attack rolls; with a yumi, also Perception instead of the bow’s Strength for its damage. (The Falcon’s Strike, Book of Air p.172)',
      'The Way of the Archer': 'Your bow’s range grows by 150 feet (before Kyujutsu 5’s 50%). Your Raises with a bow are no longer limited by your Void Ring (or by Skill Rank with Great Potential), and Called Shots cost half the usual Raises, rounded up. (Tsuruchi Master Bowman, Book of Air p.173)',
      'Saigo’s Technique': 'In an iaijutsu duel against someone you have successfully Intimidated before, +5 to your Assessment roll. Spend a Void Point to report one of your statistics as one Rank higher during Assessment. (Saigo’s Blades, Book of Air p.173)',
      'The Way of Yomanri': 'With a yumi or dai-kyu, spend consecutive Simple Actions aiming before you shoot, up to your Agility: each gives +1k1 to the attack or +1k0 to the damage, your choice. Being interrupted loses it all, and it cannot be used in the Center Stance. (Unicorn Yomanri Archer, Book of Air pp.173-174)',
      'Flight of Innocence': 'Your archery attacks ignore every TN and dice penalty for being Blind, for a Missing Eye, or for a target hidden by darkness, illusion or camouflage; physical obstacles and conditions still apply. With a bow, spend a Void Point for +1k1 damage. (Taoist Archer, Book of Air p.174)',
      'The Way of Air': 'While you fight unarmed, an opponent attacking you with a melee weapon takes -Xk0 on the attack roll, X being his own Air Ring; no more opponents a Round than your Insight Rank. (Kaze-do Fighter, Book of Air pp.174-175)',
      'The Power of Innocence': 'Where a lie would help you, tell a person the truth instead and roll Sincerity (Honesty) / Awareness against their Investigation (Interrogation) / Perception: on a success, and with the GM’s leave, they become an Ally with Devotion 1, rising by 1 with each later success (to 4); once a month each. A deliberate lie costs 2 Honor and the Technique for a month. (Doji Innocents, Book of Air p.177)',
      'The Golden Path': 'Once a month, wage commercial war on a rival merchant: a Contested Commerce (Merchant) / Awareness roll. Win and he loses koku equal to your margin; lose and you lose half that. Gentry, Wealthy and Servants bought after creation cost 1 XP less (minimum 1). (Daidoji Trading Council, Book of Air pp.177-178)',
      'Ide’s Ideal': 'When you can propose a peaceful solution, roll Courtier (Rhetoric) / Awareness against your opponent’s Etiquette (Courtesy) / Willpower: a success wins a real concession (the GM decides what). Twice an encounter. Violence that harms a fellow Rokugani, even in self-defence, costs the Technique for a month. (The Hand of Peace, Book of Air p.178)',
      'Shameless Slander': 'Slander someone at court: Sincerity (Deceit) / Awareness against their Etiquette (Courtesy) / Willpower, +1k1 if you use a real secret. Success: they lose Honor and gain Infamy equal to your Glory Rank, and if they do not answer it promptly, 1 Devotion from every Ally. Failure costs you 3 Glory. Once a month a target. (Shosuro Defilers, Book of Air p.178)',
      'Voice of the Kansen': 'As a Simple Action, make a Contested Air roll against one person within 100 feet: on a success you learn one meaningful secret of theirs (the GM chooses). They feel only unease. Once a day a person, and not again for a month after a success. (The Dark Whisper, Book of Air pp.178-179)',
      'Dance of Silk': 'With a performance, roll Perform (or Acting) / Awareness against a client’s Etiquette (Courtesy) / Willpower to steer them toward an attitude or choice you prefer; the GM may make them an Ally with Devotion 1. It is persuasion, not mind control. (The Silken Promises, Book of Air p.179)',
      'Hake’s Lesson': 'On an Artisan roll, expend spell slots for +2 each (+3 for an Air slot), up to twice your Insight Rank in slots. (The Asahina Artisans, Book of Air p.180)',
      'Forge Your Own Fate': '+2k1 on Social Skill rolls against anyone of higher Status, while you keep a modest, subservient manner. (Master of Games, Book of Air p.180)',
      'The Legions of the Dead': 'As a Complex Action, expend two spell slots of one Element and a Void Point to summon a spirit warrior to fight for you: all Rings 2 but that Element’s 3, Kenjutsu 3, Defense 2, a spectral daisho and light armor. It stays for hours equal to your Kitsu Shugenja School Rank, or until dismissed. (Kitsu Spirit Legion, Book of Air p.180)',
      'The World Is A Canvas': 'A number of times a day equal to your Insight Rank, spend a Void Point to cast Summon Fog or False Realm as a Simple Action. (Mist Legion, Book of Air p.181)',
      'The Tejina’s Art': 'Extra spell slots each day equal to your School Rank, usable only for Token of Memory, Flight of Doves or Mists of Illusion. (Shiba Illusionist, Book of Air pp.181-182)',
      'Light Banishes Lies': 'Banishing Air kami needs only two Raises on Sense (not three) and three on Commune (not five). (Sisters of the Sacred Light, Book of Air p.182)',
      'Way of the Shadow': 'Sacrifice a spell slot of any Element for perfect sight in total darkness; or spend an Air or Void slot for +1k1 on a Stealth, Sleight of Hand or Sincerity (Deceit) roll, no more slots on one roll than your Insight Rank. (Soshi Deceiver, Book of Air p.182)',
      'Deny the Horde': 'No off-hand penalty for a masakari (the penalty for two weapons still applies), and you may attack with a masakari as a Simple Action. With a masakari, +3k0 damage in the Full Attack Stance against anyone, or in the Attack Stance against a Shadowlands creature or a foe you know is Tainted. (Hiruma Slayers, Book of Earth p.191)',
      'The Way of Sumai': '+1k0 to control a Grapple (+2k0 if you are Large), and +1k1 to the damage roll when you choose to inflict damage in a Grapple. (Crab Sumai Wrestler, Book of Earth p.191)',
      'The Hammer of Kaiu': 'During a siege, add or subtract your whole School Rank on the Mass Battle Table (in place of the Kaiu Engineer’s half). Defending a siege, +2k0 on Engineering (Siege) rolls to work siege engines, and your side’s structures have 50% more Reduction. (Kaiu Siegemaster, Book of Earth p.192)',
      'Way of the Iron Crane': 'With a heavy weapon in the Attack Stance, +1k1 to attacks against anyone in the Attack or Full Attack Stance; in the Defense or Full Defense Stance, add your Heavy Weapons Rank to your Armor TN. (Daidoji Heavy Regulars, Book of Earth p.192)',
      'Broken by Tactics': 'On the attacking side of a siege, you always get a Heroic Opportunity on the Mass Battle Table, whatever the result, and the defenders’ structures lose half their Reduction (after any defending bonuses). (Akodo Siege Strategist, Book of Earth p.193)',
      'Brilliant Steel': '+1k0 on Craft rolls to make armor. Wearing armor, when you spend a Void Point for +10 Armor TN, add twice your Earth Ring as well. (Shiba Armorsmith, Book of Earth p.193)',
      'Way of the Ujik-Hai': '+1k1 to control a Grapple against an opponent without the Bariqu Emphasis, and +2k0 if your Agility is higher than theirs; the two stack. (Unicorn Bariqu Wrestler, Book of Earth p.193)',
      'Strike of Purity': 'One piece of crystal you own is awakened (lose it and the Technique waits until you find another). Casting a damaging Fire or Earth spell, spend a Void Point to channel it through the crystal: one more Complex Action to cast, +1k1 damage, and it counts as Crystal. (Kuni Crystal Master, Book of Earth p.195)',
      'Soul of the Stone': 'When you finish crafting a Samurai weapon, you may spend all your Void Points to give it Free Raises equal to your Earth Ring, usable on any roll with it and renewed after thirty days. You may never have more such weapons than your Earth Rank. (Tamori Weaponsmith, Book of Earth p.196)',
      'Born of the Earth': 'Sitting on bare earth, sacrifice two Earth spell slots and roll Meditation at TN 15: after ten minutes an animal of your chosen kind rises from the ground with your mind in it, using the higher of its Traits or yours and all its abilities, but unable to speak or cast. It ends when you choose, when your body is disturbed, or when the animal dies. (Child of Chikushudo, Book of Earth p.196)',
      'Never This Sacred Ground Shall Fall': 'Defending a sacred place (a shrine, temple or monastery), a Free Raise on every Earth spell, and a Void Point (Free Action) gives a damaging Earth spell the Jade keyword. (Isawa Temple Guardians, Book of Earth p.197)',
      'Beyond the Wind': 'With a five-minute ritual and a Meditation roll at TN 15, bless a horse: for hours equal to your Earth Ring it ignores terrain movement penalties and never tires. No more horses at once than your Earth Ring. (Iuchi Couriers, Book of Earth p.197)',
      'Strength of Bamboo': 'Resisting an opponent’s Social Skill or courtier Technique, you may use Willpower instead of the usual Trait. Where it clashes with another Technique (Bayushi Courtier 4, say), the GM decides which wins. (The Severed Hand, Book of Earth p.202)',
      'Do Me a Favor': 'Once you have supplied something a person needs, roll a Contested Intimidation (Control) / Willpower against their Etiquette (Courtesy) / Willpower: on a success they are deep in your debt, and take an Obligation to you (if they can repay) or a Blackmail (if not), normally worth 3 points. (Yasuki Extortionist, Book of Earth pp.202-203)',
      'Watanabe’s Legacy': '+1k1 with Artisan: Sculpture and Craft: Sculpture, ignoring circumstantial and environmental penalties (distraction, weather, noise) on those rolls. (Yoritomo Sculptors, Book of Earth p.202)',
      'Intrepid Negotiator': 'Spending a Void Point on an Etiquette or Sincerity roll, add your Willpower in unkept dice; on Etiquette (Courtesy), in kept dice instead. (Yoritomo Emissaries, Book of Earth p.203)',
      'Imperial Scrutiny': 'Use the bureaucracy to stall another samurai’s business at court (an alliance, a treaty, a trade deal, a petition) with a Contested Etiquette (Bureaucracy) / Willpower roll, a Void Point giving +2k2: win and he makes no progress for two weeks, whatever he does. Not again on him until the two weeks are over. (Otomo Bureaucrat, Book of Earth p.204)',
      'One Blade, Both Hands': 'Fighting with a tanto and one empty hand, +3k1 damage with the tanto, ignoring every effect of the opponent’s armor (or 5 points of a creature’s natural Reduction). (Crab Knife-fighters, Book of Fire p.177)',
      'Strike When You Cannot': 'In the Assessment of an iaijutsu duel, take a Free Action and spend a Void Point to force a Contested Kenjutsu / Fire roll: win and your opponent cannot spend Void Points on his Focus roll in that duel. (Hojatsu’s Legacy, Book of Fire p.177)',
      'The Hidden Blade': 'Attacking a surprised or unaware opponent with a knife, spend a Void Point (Free Action) to strike a vital spot: Raises for damage on that attack add +1k1 each instead of +1k0. (Shosuro Assassins, Book of Fire p.178)',
      'Waves Rush to Shore': 'Fighting with a kama in each hand, add your Knives Rank to your Armor TN and +3k0 to damage with kama. (Mantis Whirlwind Fighters, Book of Fire p.178)',
      'Master of the Quick Blade': 'Fighting with a knife in each hand, +1k0 to Initiative and +1k1 to damage with knives. (Ujina Skirmishers, Book of Fire p.178)',
      'The Inner Shape of Fire': 'Expend a Fire spell slot and roll Artisan (Sculpture) / Fire (TN 20, set by the GM for the piece) to make a sculpture of fire, heat, light or smoke that lasts minutes equal to your Fire Ring while you concentrate (Free Actions only). A good performance earns Glory at the GM’s discretion. (Asahina Fire Sculptors, Book of Fire p.181)',
      'The Clarity of Fire': 'Meditate for half an hour and roll Meditation / Fire at TN 15 to gain the Clear Thinker and Precise Memory Advantages for hours equal to your Fire Ring; any you already have give +1k0 more. (The College of Clarity, Book of Fire p.181)',
      'Fury of the Elements': 'Store a Fire spell aimed at one person or creature in an alchemical preparation, released by anyone: drunk as a Simple Action, or thrown as a Complex Action with Athletics (Throwing) / Agility. A slot of another Element (not Void) adds that Elemental keyword to it, or swaps its Fire keyword for it; one extra keyword only. (Agasha Alchemist, Book of Fire p.182)',
      'Menacing Flames': 'Casting a Fire spell whose area is not one target person or creature, spend a Void Point or an extra spell slot to give it Fear X, X being its Mastery Level. (The Inferno Guard, Book of Fire p.182)',
      'The Hidden Patterns': 'After a day watching a court or other gathering, roll Investigation / Intelligence at TN 25: for 24 hours rivals and enemies cannot gain Raises on Social Skill rolls against you or spend Void Points on them. Each Raise shares this with one ally. (Asako Scholar, Book of Fire p.190)',
      'The Past and the Present': 'You gain the Forbidden Knowledge (Empire’s True History) Advantage and a Free Raise on all Calligraphy rolls, and with Lore: History / Intelligence at TN 25 you recount anything you witnessed or heard down to the smallest detail, including ones you missed at the time. (Ikoma Historians, Book of Fire p.190)',
      'Howl of the Cliff’s Edge': '+2k1 on Knockdown and Disarm attacks with a kusarigama. Call three Raises on a kusarigama attack to Entangle a foe up to 15 feet away, until you let go (Free Action) or he wins a Contested Strength roll (Simple Action). (Cliff’s Edge Student, Book of Water pp.176-177)',
      'The Tail’s Reach': '+1k1 on Athletics rolls using a chain weapon to climb. You may attack with a kusarigama from up to 15 feet, and call three Raises on a kusarigama attack to give your opponent the Lame Disadvantage until those Wounds heal. (The Scorpion’s Tail, Book of Water p.177)',
      'The Way of Water': 'In a Grapple you use your opponent’s Strength in place of your own. In the Defense or Full Defense Stance, when a melee attack misses you, spend a Void Point (Free Action) and roll Jiujutsu (Mizu-do) / his Strength against his attack roll: succeed and you Throw him or take control of a Grapple. (Student of Mizu-do, Book of Water p.178)',
      'Servant of the River': 'Casting a Water spell within a hundred feet of a natural river, one Free Raise. (The Disciples of the River, Book of Water p.178)',
      'The Maiden’s Icy Grasp': 'You may cast Armor of Earth, Armor of the Emperor, Be the Mountain, Bonds of Ningen-do, Earth’s Stagnation, Grasp of Earth, Major Binding, Minor Binding and Wall of Earth as Water spells, their effects made of ice. (The Acolytes of Snow, Book of Water p.179)',
      'The Veil of the Future': 'Each morning, meditate for an hour and roll Divination at TN 15: success gives one +1k0 die, and each Raise one more, up to your Water Ring, to add to Spell Casting rolls that day. Unused dice go at nightfall. (Kawaru Sages, Book of Water p.179)',
      'Wisdom of the Heavens': 'Once a month, by ritual and outside a skirmish, give a person one Spiritual Advantage or Spiritual Disadvantage (a Disadvantage needs a Contested Void roll) for a month, or until you use it on someone else. The GM vetoes anything unfitting, and never Ancestors, Momoku or the Shadowlands Taint. (Seppun Astrologers, Book of Water p.179)',
      'Truth in Shadows': 'You gain the Spy Network Advantage for free (or use it twice as often if you have it), +2k0 on Stealth, Investigation and Temptation, and lose only half the Honor, rounded up, for Low Skills and mildly dishonorable acts done for the Crane; never for heinous ones. (Daidoji Spymaster, Book of Water p.185)',
      'The Eye Sees All': 'Entering an area, spend a Void Point and a minute and roll Perception at TN 25 to find every visual clue. Each Raise adds clues from another sense; two Raises tell you whether anything is hidden there. +2k2 on rolls to avoid being surprised. (Kitsuki’s Eye, Book of Water p.186)',
      'Swimming Beneath the Waves': '+1k0 on Temptation (Bribery), +1k1 against a Crab or Crane samurai; if he takes the bribe, with the GM’s leave spend a Void Point to make him an Ally with Devotion 1 until you betray him. (Scales of the Carp, Book of Water p.186)',
      'The False Dragon': '+2k1 on Acting to play a Dragon samurai, and a Free Raise on any Skill roll to avoid leaving clues to who you are or to plant false ones. (Hateru Ninja, Book of Void p.182)',
      'Anything for the Phoenix': 'On a battlefield, +1k1 on Stealth and a Free Raise on attacks made by surprise. Dishonorable acts for the Phoenix cost half the usual Honor, rounded up. (Sesai Ninja, Book of Void p.182)',
      'The People’s Vengeance': '+1k1 on any Skill roll against a member of the samurai caste. (Koga Ninja, Book of Void p.182)',
      'Unravel the Shadow': 'As a Simple Action, spend a Void Point and win a Contested roll of your Void against their Willpower to reveal every Shadowspawn or minion of the Nothing you can see; they cannot take a false identity again while you watch. As a Free Action, a Void Point makes one spell or attack take full effect on a minion of the Nothing, whatever its immunities. (Fading Shadows, Book of Void p.183)',
      'Beseech the Dragons': 'You lose your Affinities and Deficiencies and gain an Affinity for Dragon spells. Each Ring has two fewer spell slots; instead you gain three Dragon spell slots, for Dragon spells only, regained by two hours’ meditation and Meditation / Void at TN 30 each, and you may spend Void Points to cast more. (Dragon Channeler, Book of Void p.184)',
      'Walk Among the Trees': 'In any woodland, a Free Raise on Athletics, Hunting and Stealth rolls; within sight of Nazo Mori, also +1k0 on any roll using Perception. (Ghost of the Forest, Book of Void p.195)',
      'Iuchiban’s Method': 'You learn two maho spells of your choice and gain a Free Raise on maho Spell Casting rolls. Casting maho, take 2 extra Wounds for each point of Taint you avoid (never below 1), or, using another’s blood, push the Taint onto them at 1 point per 2 extra Wounds, down to none for you. (The Bloodspeaker Technique, Enemies of the Empire p.27)',
      'Tigers Do Not Fall': 'When an opponent declares a Maneuver against you, even Increased Damage, spend a Void Point (Free Action) to cancel its benefit; his Raises still count toward hitting you. You never lose Armor TN for being Grappled. (Guardian of the Hidden Temple, Enemies of the Empire p.49)',
      'Will of the Master': 'You count as Status 10 to Kolat of your own Sect and Status 9 to other Kolat, and gain +2k0 on all Courtier and Intimidation rolls. (Kolat Master, Enemies of the Empire p.49)',
      'Arrows from the Ranks': 'With a bow, attack as a Simple Action, and string it as a Free Action. (Master Bowman, Enemies of the Empire p.85)',
      'Friend of Man': '+1k1 on Social rolls to convince humans of your goodwill or to calm a dangerous situation with them. (Disciples of the Dashmar, Enemies of the Empire p.85)',
      'Shards of Light': 'As a Complex Action, crush any pearl and spend a spell slot of any Element for a bolt at one target within 100 feet: attack with Agility plus twice your School Rank, keeping Agility, ignoring armor’s Armor TN bonus; damage your Akasha plus School Rank, keeping Akasha. (Pearl Shapers, Enemies of the Empire p.85)',
      'Overwhelming Presence': 'Add your Intimidation Rank to the total of every Social Skill roll against anyone outside the Gozoku. (Gozoku Agent, Imperial Histories p.69)',
      'The Path of One': 'Attack as a Simple Action with any melee weapon that is not a Samurai weapon, and +1k0 damage with any Peasant weapon. (Tortoise Guard, Imperial Histories p.97)',
      'The Butcher’s Gaze': 'In an iaijutsu duel, before the Assessment rolls, spend a Void Point (Free Action) for a Contested Intimidation / Willpower roll, a Fear effect: win and your opponent’s dice do not explode on his Assessment and Focus rolls this duel. (Kenburo’s Way, Imperial Histories p.123)',
      'Unity of Purpose': 'After Initiative is rolled, lower yours (Free Action) to match an ally with this Technique; each ally on the same Initiative attacking the same foe gives +1k0 to the attack, to no more than your Insight Rank + 1 dice. (People’s Legionnaire, Imperial Histories p.123)',
      'No Matter the Cost': 'Sacrifice up to your Scorpion School Rank in Honor points for +1k0 each on one roll against non-Scorpion foes: attack rolls for bushi and ninja, Contested Social Skill rolls for courtiers, Air spell casting against them for shugenja. (Scorpion Loyalist, Imperial Histories p.148)',
      'The Purity of Justice': 'Add your Investigation Rank to your Assessment in an iaijutsu duel; +1k0 on Focus and Strike against someone declared guilty by an Imperial or Dragon authority above you, and +1k0 on Hunting or Investigation to hunt them. (Kitsuki Justicar, Imperial Histories p.149)',
      'Stand Against Oppression': 'Against an opponent of higher Glory, spend a Void Point for unkept dice on your attack equal to the Glory difference, no more than your Minor Clan School Rank. (Three Man Alliance Soldier, Imperial Histories p.149)',
      'Darkness Undone': 'Casting a spell at a Tainted opponent, expend extra spell slots, up to your Void Ring, to lower its Reduction by your School Rank for each, until the start of your next Turn. (The Nameless Ones, Imperial Histories p.214)',
      'Wall of Pikes': 'In the Defense Stance with a spear or polearm, right after an opponent makes a melee attack on you or an ally within ten feet, hit or miss, spend a Void Point to attack him as a Free Action; in Full Defense it costs two Void Points. (Tsume Pikemen, Imperial Histories pp.275-276)',
      'Thunder’s Call': 'Cast Fury of Osano-Wo as a Simple Action by sacrificing a spell slot of any Element; your Raises for its damage add +1k1 each instead of +1k0. (Acolyte of Thunder, Imperial Histories p.306)',
      'Grace from the Shadows': 'Speaking with someone, claim membership of the "Hawk Clan" with a Contested Awareness roll (a Complex Action if it matters): on a success they treat you as one Status Rank higher. (Hawk Purist, Imperial Histories 2 p.103)',
      'Scorn the Weak': 'Attacking a human opponent, +1k1 on the attack roll for each Physical Disadvantage they have. (Order of the Stone Crab, Imperial Histories 2 p.127)',
      'No Course But One': 'A Free Raise on any attack roll against an opponent whose Status Rank is higher than their Honor Rank. (Chrysanthemum Conspirator, Imperial Histories 2 p.127)',
      'Chomei’s Courage': 'No TN penalty for fighting on slick, uneven or moving ground; where one would apply and you are in the Attack or Full Attack Stance, +Xk0 to melee attacks, X being your Reflexes. (Doji Marines, Imperial Histories 2 p.197)',
      'Umasu’s Steel': 'At the start of a naval battle, commanding a warship, roll Battle / Intelligence at TN 25 to give the ship extra Reduction equal to twice your Sailing Rank (four times on a Turtle Ship). (Kaiu Shipmasters, Imperial Histories 2 p.197)',
      'The Ward of the Sea': 'Aboard a ship on the water, expend a Water or Air slot as a Complex Action for a barrier of three Rounds: the ship has Reduction 10 against physical attacks and 25 against fire, natural or magical, and arrows to and from it are hindered as by Summoning the Gale. (Isawa Seaguard, Imperial Histories 2 p.197)',
      'The Unbroken Technique': 'Against a Shadowlands creature or one of the Lost, add your Taint Rank in unkept dice to an attack, gaining 3 points of Taint each time. Killing one single-handed, spend a Void Point to lose 1 point of Taint; killing a truly powerful one, a Void Point and a Contested Earth roll against it purge all your Taint, and the Technique with it. (The Unbroken, Imperial Histories 2 p.220)',
      'To Shield the Empress': 'When an act would cost you Honor, and doing it spares someone of higher Status a loss of Honor or Glory, you lose half, rounded down. (Second Gozoku Agent, Imperial Histories 2 p.245)',
      'Blood of the Serpent': 'Attack as a Simple Action with melee weapons of the Samurai quality, and against any Naga with any weapon. (Serpent Hunter, Imperial Histories 2 p.287)',
      'Tamedaore’s Secret': 'In the Center Stance, and on the Round after you leave it, +2 × your Void Ring to your Armor TN. (The Thousand, Secrets of the Empire p.234)',
      'Isashi’s Mercy': '+1k0 on Medicine rolls, and a Free Raise on any spell that heals Wounds or cures illness. (Order of Isashi, Secrets of the Empire p.234)',
      'Ekuro’s Weapons': 'Cast the four Elemental weapon spells as Simple Actions, and spend a Void Point (Free Action) to attack with a summoned weapon as a Simple Action for Rounds equal to your Insight Rank. (Order of the Five Weapons, Secrets of the Empire p.235)',
      'Hold the Passes': 'Your range with hand-hurled missiles is doubled, and thrown weapons do +1k0 damage, +1k1 for a nage-yari or a rock. (Ichiro Pass Warden, Secrets of the Empire p.237)',
      'Seeing the Pattern': '+2k0 on all Divination and Etiquette rolls. (Dragonfly Advisor, Secrets of the Empire p.237)',
      'Seek the Guilty': 'Investigating someone for crime or Kolat ties, win a Contested Investigation (Interrogation) / Perception roll against their Sincerity (Deceit) / Awareness and, if they really are guilty, gain +1k1 on Intimidation and attack rolls against them for 24 hours. (Ox Clan Vigilant, Secrets of the Empire p.238)',
      'The Heart of the Story': 'On a Courtier roll, spend a Void Point to add your Perform: Storytelling Rank to the total. (Suzume Storyteller, Secrets of the Empire p.238)',
      'The Poisoned Frog': 'Once per opponent per skirmish, spend a Void Point on an attack so its Raises for damage add +1k1 each instead of +1k0, taking no more Raises than your Void Rank. (Tortoise Killer, Secrets of the Empire p.239)',
      'Fire and Ice': 'In the Full Attack Stance you may attack as a Simple Action. (Satoshi’s Legacy, Secrets of the Empire p.241)',
      'Harmony in All': 'A Free Raise on every spell with the Wards or Defense property. (Seppun Hidden Guard, Secrets of the Empire p.241)',
      'The Beauty of the World': 'Working natural materials, expend an Earth spell slot for +1k0 on an Artisan or Craft roll, up to your School Rank in slots on one roll; this stacks with Void Points. (Kitsune Artisan, Strongholds of the Empire p.25)',
      'Ascendancy of Steel': 'Wielding a sword, make melee attacks as a Simple Action. (Tsuruchi Swordsman, Strongholds of the Empire p.25)',
      'The Crab’s Shell': 'After a successful melee attack, take the Guard Action as a Free Action if your charge is close enough; if you do, add the amount your attack beat the target’s Armor TN by to your charge’s Armor TN until your next Turn. (Hiruma Yojimbo, Strongholds of the Empire p.44)',
      'Gentle Encouragement': 'Make a Contested Willpower / Intimidation roll against someone’s Willpower / Etiquette: win and gain +1k0 on attacks against them in the first Round of your next skirmish with them, +1k0 more per Raise. Used during a skirmish, the roll is a Complex Action. (Yasuki Enforcer, Strongholds of the Empire p.44)',
      'The Calm Heart Conquers': '+1k0 on Iaijutsu rolls when you are not striking to kill, in a duel to first blood or a skirmish, and melee attacks as a Simple Action with a katana or wakizashi. (Calm Heart Duelist, Strongholds of the Empire p.61)',
      'The Gilded Road': '+1k1 on Commerce rolls, and on Social rolls with your customers; you gain one level of the Wealthy Advantage and one Way of the Land for free. (Ide Caravan Master, Strongholds of the Empire p.61)',
      'The Winds of Rhetoric': '+1k1 on every Contested Social roll that uses Etiquette. (Asako Philosopher, Strongholds of the Empire p.76)',
      'Maintaining the Peace': 'In the Defense or Full Defense Stance, when a Void Point raises your Armor TN, add your Etiquette Rank to it as well. (Provincial Guard, Strongholds of the Empire p.76)',
      'The Cloak of Shadows': 'Stealth becomes a School Skill and you gain one extra Stealth Emphasis beyond the usual limit; using Stealth does not reduce your Move Actions, and you ignore terrain penalties to them while you do. (Daigotsu Scout, Strongholds of the Empire p.93)',
      'Child of the Water': 'Spend a Void Point (a shugenja may expend a Water slot instead) to add twice your Water Ring to every Craft roll for the rest of the day; only one use at a time. (Water Hammer Smith, Strongholds of the Empire p.108)',
      'Master the Land': 'In a province where you have Way of the Land, choose three Bugei Skills you know for +1k0 on their rolls there (different Skills per province). At the start of a skirmish, before Initiative, a Contested Void roll against one opponent makes their Water count one Rank lower for movement for the skirmish. (Mirumoto Sentinel, Strongholds of the Empire p.108)',
      'Talons of the Daidoji': 'When your spear hits an opponent who has not yet acted this Round, they need two Raises to hit you for the rest of the Round. (Crane Elite Spearman, Strongholds of the Empire p.135)',
      'Charge of the Pride': 'In the Full Attack Stance, your movement gains 5 feet once per Round; a Complex Move Action moves you your Water Ring × 25 feet. (Lioness Legion, Strongholds of the Empire p.135)',
      'To Race the Wind': 'Mounted, +1k0 on Bugei Skill rolls; a Void Point on a Horsemanship or Investigation roll gives +2k2 instead of +1k1. (Ikoma Warden, Strongholds of the Empire p.135)',
      'Fan & Sword': 'A Void Point on an Iaijutsu or Perform: Poetry roll gives +2k1 instead of +1k1. Winning a duel or a poetry contest earns 1 extra Glory point, and 1 for the person you championed. (Doji Warrior-Poet, Strongholds of the Empire p.135)',
      'I Am A Weapon': 'Up to your School Rank times per skirmish, as a Free Action, attack with your current melee weapon using another melee Weapon Skill you have (no Emphases or Mastery Abilities) for your School Rank in Rounds; meanwhile your melee attacks are Simple Actions. (Scorpion Weaponmaster, Strongholds of the Empire p.153)',
      'Never Beyond My Reach': 'Melee attacks as a Simple Action with a katana or any Ninja weapon, and +1k1 to attack and damage with Ninja weapons. (Shadow Blades, Strongholds of the Empire p.153)',
      'The Guards’ Wrath': 'Taking the Guard Action does not lower your own Armor TN. (The Guards’ Wrath, Strongholds of the Empire p.168)',
      'Master of the Dice': 'Add your Intimidation Rank to the total of every Contested Social roll. (Fireman Gang Lord, Strongholds of the Empire p.169)',
      'The Courts of Kudo Mura': 'Talking with a samurai of a Great Clan or the Imperial families, +3k0 on Contested Etiquette and Sincerity rolls. (Minor Clan Alliance Diplomat, Strongholds of the Empire p.169)',
      'Overrun': 'Mounted, the Knockdown Maneuver costs one Raise less, and a Void Point adds +Xk0 to a weapon attack, X being your mount’s Strength. (Tsuru’s Legion, Sword and Fan p.202)',
      'Fear is a Gift': 'Intimidation counts as a Bugei Skill, not a Low Skill; you may use Willpower for any Battle roll and your Intimidation Rank for Battle at Step 2 (Determination) of the Mass Battle Table; soldiers under your command add your Intimidation Rank to rolls to resist Fear. (Yasuki Taskmaster, Sword and Fan p.203)',
      'All Is Forgiven': 'Undo someone else’s Minor Breach of Etiquette, Glory and Status loss included, with Etiquette (Courtesy) / Awareness at TN 25; with 2 Raises make a Major Breach Minor, with 5 a Blasphemous one Major (GM’s permission). Act within twice your Insight Rank in hours for a Minor Breach, that many minutes for a Major one, at once for a Blasphemous one. (Doji Apologist, Sword and Fan p.203)',
      'Way of the Horse and Bow': 'Mounted, your steed treats Moderate terrain as Basic and Difficult as Moderate, and you attack with a bow as a Simple Action. (The Dragon’s Wind, Sword and Fan p.205)',
      'The Voice of Bushido': 'After a speech before a court, roll Perform: Oratory / Awareness at TN 30 (Contested against Sincerity / Awareness if an enemy answers): an ally gains a Paragon of Bushido Advantage for a week, or an enemy takes a Failure of Bushido Disadvantage, or loses their Paragon, for a week. Not the same person twice in a month. (Ikoma Orator, Sword and Fan p.205)',
      'The Commander’s Fan': '+1k1 on Battle (Mass Battle) rolls where your war-fan helps you signal orders (GM’s call). Carrying a war-fan, add half your War Fan Rank, rounded up, to your Armor TN, or all of it in the Defense or Full Defense Stance or with only the fan in hand; this does not stack. (Lion Tactician, Sword and Fan p.205)',
      'Every Scar Has a Name': 'Attack as a Simple Action unarmed or with an improvised weapon; once per skirmish, call two Raises on such an attack to make it a Fear effect of Rank equal to your Insight Rank. (Ikoma Scrapper, Sword and Fan p.206)',
      'The Orochi Pact': 'You gain an Orochi as a mount (Enemies of the Empire p.252), played by the GM but obeying reasonable orders; +2k0 on Athletics, two Ranks of Magic Resistance against hostile Water magic, and twice as long holding your breath while riding it. (Mantis Orochi Rider, Sword and Fan p.206)',
      'Lessons Never Forgotten': 'Before your side’s military task, review the plans with Lore: War / Intelligence at TN 25 or Lore: History / Intelligence at TN 35: on a success one allied bushi gains a Rank of Luck for the mission, and each Raise adds another ally (not you), up to your School Rank. (Shiba Advisor, Sword and Fan p.207)',
      'Stand Down': 'When samurai prepare for formal hostilities (a duel, a Blood Feud, a war), a Contested Sincerity (Honesty) / Awareness roll against a party’s Etiquette (Courtesy) / Willpower makes them back down without losing Glory. (Asako Mediator, Sword and Fan p.207)',
      'Smoke Screen': 'In conversation, a Contested Sincerity (Deceit) / Awareness roll against Investigation / Awareness (or a fitting Lore / Intelligence) misleads the target on one topic for a week: they must call a Raise for no effect on every Social roll about it, one more per Raise you call, and fail if they cannot. Not the same target twice in a week. (Bayushi Distracter, Sword and Fan p.208)',
      'The Eyes of My Enemy': 'Choose a Great Clan for good. Attack its samurai as a Simple Action, and in a skirmish spend a Void Point as a Simple Action to stop one of them using School Techniques for their next two Turns (not in iaijutsu duels). (The Scorpion Elite Guard, Sword and Fan p.209)',
      'Ferocity of the Ki-Rin': 'As a Complex Action, roll Animal Handling (War-Dogs) / Willpower at TN 20 to give your whole pack a simple command, with Raises for subtler ones; attacks you order them to make gain +1k0 to attack and damage. (Unicorn War-Dog Master, Sword and Fan p.209)',
      'Eyes of the Vigilant': '+1k0 on Investigation to find clues or test someone’s truthfulness, +1k0 on Hunting to track known criminals or traitors, and +1k0 on Weapon Skill rolls against them. (Shinjo Magistrate, Sword and Fan p.209)',
      'Follow My Lead': 'Hosting a courtly event, roll Courtier (Manipulation) / Awareness at TN 30 to set its tone: Social rolls against the tone must call two Raises for no effect (failing because of them is a Minor Breach), and rolls in keeping with it gain +2k0. As a guest the roll is Contested against the host; others may oppose it, with +1k0 per Status Rank of advantage. (Imperial Influencer, Sword and Fan p.210)',
      'The Storm of Heaven’s Wrath': 'Mounted and in the Attack Stance, add your Honor Rank to your Armor TN, and spend a Void Point to add half your Honor Rank, rounded up, in kept dice to an attack. (The Rising Sun, Sword and Fan p.210)',
      'Pierce the Fog of War': 'Reporting on a war, you count as having Sacrosanct. Praise or damn a commander with Sincerity / Awareness at TN 5 × their Glory Rank to raise or lower their Glory by a Rank, or with Raises to add or remove Infamy (half a Rank, plus half per Raise). Once per person per battle. (Imperial Observer, Sword and Fan p.211)',
      'Purge the Darkness': 'Sense dangerous spirits with Investigation (Notice) / Perception at TN 20 or more, two Raises telling you what kind. As a Complex Action, expend a spell slot for a Contested Willpower roll against a possessing spirit, +2k2 if your exorcism ward is on the target: win and it leaves, unable to return to that person for 24 hours. (Toritaka Exorcist, The Great Clans p.42)',
      'The Art of Mockery': 'Publicly mock a deserving target with your chosen art in a Contested [art] / Awareness roll against their Etiquette (Courtesy) / Willpower: win and they lose Glory points equal to your Glory Rank and half that in Honor, rounded up; lose and you lose Glory points equal to their Status Rank. Once a month per target. (Kakita Jester, The Great Clans p.73)',
      'The Ebb and Flow of Deception': 'Roll Etiquette (Conversation) / Awareness at TN 20 plus any Raises to steer talk to a subject uncomfortable for your opponent; they roll Sincerity / Awareness at TN 20 + 5 per Raise or take -1k1 on their next Social roll against you. (Kitsuki Debater, The Great Clans p.103)',
      'Rain of Death': '+1k0 on attack rolls, or +2k2 with a bow. (The Dragon’s Flame, The Great Clans p.103)',
      'The Heart of the Sword': 'With a sword in the Attack Stance, add your Honor Rank to your Armor TN against the first melee attack each Round; once per skirmish, activate a Kata as a Free Action. (Akodo Kensai, The Great Clans p.139)',
      'Shadow Unseen': 'Move at your normal rate while using Stealth, and +1k0 on Stealth and every Agility-based Bugei Skill roll. (Lion Scout, The Great Clans p.140)',
      'Pure and Dedicated': 'Melee attacks as a Simple Action, but then only one attack that Turn, Extra Attack included. Once per skirmish, spend a Void Point (Free Action) to count your Honor Rank double for your other School Techniques until the encounter ends (it may pass 10; take the best if another effect also changes them). (Lion Paragon, The Great Clans p.140)',
      'Defended as the Sun': 'Defending a Moshi person or holding in a skirmish, choose at the start of each Turn: +1k0 on your attack roll, or +1k1 more to the Armor TN of the one you Guard. (Moshi Guardian of the Sun, The Great Clans p.170)',
      'One with the Wild': 'A Free Raise on Hunting rolls and on Stealth rolls in rural places, and +2k0 on Contested rolls to hide or to find someone hidden. (Kitsune Ranger, The Great Clans p.170)',
      'Strength of the Five': 'Choose a non-Void Ring. When an allied shugenja in sight casts a spell of that Element, gain a Void Point for rolls with that Element’s Traits, or for its special use (Air +10 Armor TN for a Round; Earth 10 fewer Wounds from one damage roll; Fire a Skill at 0 counts as 1 for one roll; Water swap Initiative with a willing ally for the skirmish). No more than your School Rank; unused ones end with the skirmish. (Elemental Legions, The Great Clans pp.201-202)',
      'None Must Fall': 'Name a charge at the start of a skirmish. Taking a blow for them with the Shiba Yojimbo Technique, spend a Void Point (Free Action) as you roll: on a success the damage is cancelled instead of passed to you. (Order of Chikai, The Great Clans p.202)',
      'The Black Watch': 'Targeting someone with an instant spell, expend an extra spell slot of any Element (Free Action) for a Contested Willpower roll: win and you learn whether they hold a full Rank of Taint. A Yogo may do this as a ward is placed. (Kuroiban, The Great Clans p.230)',
      'Brisk Economy': 'No Honor or Glory loss for using Commerce in public. Win someone as a trade partner with Courtier (Manipulation) / Awareness plus twice your Commerce Rank (TN 25 for a commoner; Contested against a samurai’s Etiquette (Courtesy) / Willpower plus twice theirs): they become a free Ally with Devotion 1. (Ide Trader, The Great Clans p.259)',
      'Reckless Abandon': 'In the Full Attack Stance, spend a Void Point as a Simple Action for Reduction equal to your School Rank while you stay in that Stance. (Moto Fanatic, The Great Clans p.260)',
      'Master of the Open Plains': '+2k0 on Animal Handling, Horsemanship and Hunting rolls. (Utaku Horse Master, The Great Clans p.260)',
      'The Dead Do Not Rest': 'As a Simple Action, expend a spell slot of any Element to raise zombies from corpses, as many as your Taint Rank; they obey simple orders for a week or until you release them, then crumble. (Chuda Necromancer, The Great Clans p.282)',
      'The Gaze of Sun Tao': 'Add your Honor Rank to the total of every Iaijutsu roll. (Disciples of Sun Tao, Core Rulebook p.234)',
      'Strength of the Forest': 'Extra Wounds per Wound Rank equal to your Stamina, and add your Stamina to melee damage totals. (Forest Killers, Core Rulebook p.235)',
      'The People’s Will': 'When a Void Point adds +1k1 to a Skill or Trait roll, add your Honor Rank to the total as well. (Tawagoto’s Army, Core Rulebook p.235)',
      'Heaven’s Curse': 'When you surprise an opponent in a skirmish, your Strength counts double for the damage dice you roll on that attack. (Tengoku’s Justice, Core Rulebook p.235)',
      'Folds of the Iron Fan': 'No off-hand penalty for attacks with a war fan, and add your War Fan Rank to your Armor TN while you wield one. (The Tessen, Core Rulebook p.235)',
      'Hunting the Darkness': '+2k2 on your first attack roll of a skirmish against someone you know for certain has broken Imperial law. (Claws of the Wolf, Enemies of the Empire p.200)',
      'Shielded by the East': 'In the Defense or Full Defense Stance, taking the Guard Action raises both your Armor TN and your charge’s by 5. (East Wind, Enemies of the Empire p.200)',
      'Strike the Center (Eyes of Nanashi)': '+1k1 on attacks meant to disable rather than kill, such as Disarm, Knockdown or some Called Shots (GM’s call). (Eyes of Nanashi, Enemies of the Empire p.201)',
      'Moving the Shadow': 'No penalties from natural darkness; at night or in darkness, a Void Point on a non-Weapon Bugei Skill gives +2k1 instead of +1k1. (Moonless Riders, Enemies of the Empire p.201)',
      'Black Hearts, Red Blades': 'Attacking someone unaware of you, add your Stealth Rank to your attack and damage totals against them for the rest of the skirmish. (Silent Blades, Enemies of the Empire p.201)',
      'The Tiger’s Teeth': 'Melee attacks as a Simple Action with a polearm, and +1k1 on attacks against mounted targets. (Broken Guard, Enemies of the Empire p.202)',
      'Keeping the Peace': 'Against an opponent of lower Honor Rank, melee attacks as a Simple Action with Samurai weapons. (Hidden Sword, Enemies of the Empire p.202)',
      'Smoke and Mirrors': 'With an iron pipe, a Free Raise on Disarm and Knockdown attacks, and a Void Point makes a melee attack with it a Simple Action (up to two Void Points a Round). (Machi-kanshisha, Enemies of the Empire p.202)',
      'The Serpents’ Coils': 'Melee attacks as a Simple Action with wooden weapons or weapons with the Peasant keyword. (Serpents of Sanada, Enemies of the Empire p.202)',
      'The Journey’s Beginning': 'Ignore movement penalties from snow and ice, and while mounted spend a Void Point to make one attack as a Simple Action. (Snow Riders, Enemies of the Empire p.203)',
      'Roaring to Shake Heaven': 'Fighting alongside allies, +2 to attack and damage totals for each different Basic School among your group, up to twice your Void Ring. (Seven Waves Mercenaries, Enemies of the Empire p.203)',
      'Shelter the Blameless': 'In a Round where you actively defend or protect someone (GM’s call), gain a Void Point for that Round only. (Sword of Yotsu, Enemies of the Empire p.203)',
      'Twist the Weave': 'If you have ever beaten someone in a Contested Sincerity (Deceit), Intimidation or Temptation roll, you gain a Free Raise on an attack against them in the first Round of a later skirmish. (Weavers, Enemies of the Empire p.204)',
      'For My Brothers': 'Fighting beside other Iron Gauntlet brothers, spend a Void Point to reduce the damage an ally takes by five times your Void Ring. (Iron Gauntlet Brotherhood, Enemies of the Empire p.204)',
      'Death’s Dark Shadow': 'After beating someone’s attempt to detect you in a Contested Stealth roll, spend a Void Point within the hour to add your margin of success to your next attack on them. (Shadowed Steel, Enemies of the Empire p.204)',
      'Black Lion Talon': 'When a Void Point adds +1k1 to an attack roll, add your Honor Rank to the total as well. (Wolf Legion, Enemies of the Empire p.205)',
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
    // At least `count` different Skills of these kinds at `rank` ("any two Weapon Skills at 4").
    api.hasSkillOfKind = function(kinds, rank, count){
      const names = [];
      Array.from(document.querySelectorAll('#skillsBody tr')).forEach(function(tr){
        const nameEl = tr.querySelector('.sk-name'), rankEl = tr.querySelector('.sk-rank');
        if(!nameEl || !rankEl) return;
        const name = nameEl.value.replace(/\(.*$/, '').trim().toLowerCase();
        if((parseInt(rankEl.value || '0', 10) || 0) >= rank && api.skillIsKind(nameEl.value, kinds) && names.indexOf(name) < 0) names.push(name);
      });
      return names.length >= (count || 1);
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
      // A ceiling on Honor (the Order of the Stone Crab, the Second Gozoku).
      if(req.honorBelow !== undefined && api.honor() >= req.honorBelow) unmet.push('an Honor Rank below ' + req.honorBelow.toFixed(1));
      if(req.honorAtMost !== undefined && api.honor() > req.honorAtMost) unmet.push('an Honor Rank of ' + req.honorAtMost.toFixed(1) + ' or less');
      (req.disadvantages || []).forEach(function(d){ if(!api.hasDisadvantage(d)) unmet.push('the ' + d + ' Disadvantage'); });
      (req.skillOfKind || []).forEach(function(s){ if(!api.hasSkillOfKind(s.kinds, s.rank, s.count)) unmet.push(s.label); });
      // Family membership, read from the Family the character applied.
      if(req.families && req.families.length){
        const fam = (($('f_family') || {}).value || '').trim().toLowerCase();
        if(req.families.map(function(f){ return f.toLowerCase(); }).indexOf(fam) < 0) {
          unmet.push('a member of the ' + req.families.join(' or ') + ' family');
        }
      }
      // One of several named Skills at a Rank (Artisan: Sculpture or Craft: Sculpture 4).
      (req.skillsAny || []).forEach(function(s){
        if(!s.skills.some(function(n){ return getCharacterSkillRank(n) >= s.rank; })) unmet.push(s.label);
      });
      // One of several Advantages (Gentry or Wealthy).
      (req.advantagesAny || []).forEach(function(group){
        if(!group.some(function(a){ return hasAdvantageNamed(a); })) unmet.push('the ' + group.join(' or ') + ' Advantage');
      });
      // A Path the character must already hold, in any School (the Order of Chikai needs Shiba Yojimbo).
      (req.pathsHeld || []).forEach(function(n){
        if(!pathsTaken().some(function(p){ return p.name === n; })) unmet.push('the ' + n.replace(/\s*\[[^\]]*\]$/, '') + ' Path');
      });
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
        : 'any ' + (c.minorClan ? 'Minor Clan ' : '') + (c.clan || c.family || '') + ' ' + (c.type || (c.types || []).join('/')) + ' School ' + rank;
    };
    // Schools a Path names that the sheet's School library does not hold (marked notInSheet on the
    // clause), and Paths no School in the sheet can take at all (unreachable: ronin and geisha Paths).
    // Reported for the audit; never errors.
    api.notInSheet = function(){
      const out = [];
      api.PATHS.forEach(function(p){
        (p.replaces || []).forEach(function(c){ if(c.notInSheet) out.push(p.name + ': ' + c.school); });
        if(p.unreachable) out.push(p.name + ': ' + p.unreachable);
      });
      return out;
    };
    // Technique names this phase describes that a School already uses for a different Technique.
    // Recorded before this phase's descriptions are added, so a clash is reported, never overwritten.
    api.clashes = [];
    api.assertResolve = function(){
      const bad = api.clashes.map(function(n){ return 'Technique name already used by a School: "' + n + '"'; });
      api.PATHS.forEach(function(p){
        if(!(p.replaces || []).length && !p.unreachable) bad.push(p.name + ' -> replaces nothing');
        (p.replaces || []).forEach(function(c){
          if(!c.anyRank && !(Number.isInteger(c.rank) && c.rank >= 1 && c.rank <= 6)) bad.push(p.name + ' -> a clause without a Rank 1-6');
          if(c.school && !c.notInSheet && !resolveSchoolName(c.school)) bad.push(p.name + ' -> replaces "' + c.school + '"');
          if(c.school && c.notInSheet && resolveSchoolName(c.school)) bad.push(p.name + ' -> "' + c.school + '" is in the sheet after all');
          if(c.clan && !api.clanExists(c.clan)) bad.push(p.name + ' -> unknown Clan "' + c.clan + '"');
          (c.exceptClans || []).forEach(function(x){ if(!api.clanExists(x)) bad.push(p.name + ' -> unknown Clan "' + x + '"'); });
          [c.type].concat(c.types || []).filter(Boolean).forEach(function(t){
            if(api.TYPES.indexOf(t) < 0) bad.push(p.name + ' -> unknown School type "' + t + '"');
          });
          if(!c.school && (c.clan || c.type || c.types || c.family || c.minorClan)){
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
        (req.pathsHeld || []).forEach(function(n){ if(!findPath(n)) bad.push(p.name + ' -> unknown Path "' + n + '"'); });
      });
      return bad;
    };
    return api;
  })();

  if(ALTERNATE_PATHS_ENABLED){
    Array.prototype.push.apply(ALTERNATE_PATH_LIBRARY, AP46.PATHS);
    Object.keys(AP46.DESCRIPTIONS).forEach(function(n){
      if(Object.prototype.hasOwnProperty.call(TECH_DESCRIPTIONS, n) && TECH_DESCRIPTIONS[n] !== AP46.DESCRIPTIONS[n]) AP46.clashes.push(n);
    });
    AP46.clashes.forEach(function(n){ delete AP46.DESCRIPTIONS[n]; });
    Object.assign(TECH_DESCRIPTIONS, AP46.DESCRIPTIONS);

    // Clan and School type (one type, or any of several), on top of everything the trunk's matcher
    // already checks. An "any Rank" clause names no Rank, which the trunk's matcher already accepts
    // at every Rank.
    const ap46ClauseMatches = pathClauseMatches;
    pathClauseMatches = function(clause, entry, schoolName, rank){
      if(!ap46ClauseMatches.apply(this, arguments)) return false;
      if(clause.clan && AP46.schoolClans(schoolName).indexOf(clause.clan) < 0) return false;
      // Any Minor Clan's School: one listed under a Minor Clan.
      if(clause.minorClan && !AP46.schoolClans(schoolName).some(function(c){
        return Object.prototype.hasOwnProperty.call(MINOR_CLAN_SCHOOL_LIBRARY, c);
      })) return false;
      // Clans this clause leaves out (the Mantis, a Great Clan by the Minor Clan Alliance's day).
      if(clause.exceptClans && AP46.schoolClans(schoolName).some(function(c){ return clause.exceptClans.indexOf(c) >= 0; })) return false;
      const types = AP46.schoolTypes(entry);
      if(clause.type && types.indexOf(clause.type) < 0) return false;
      if(clause.types && !clause.types.some(function(t){ return types.indexOf(t) >= 0; })) return false;
      // A family's Schools ("any Moto bushi School"): the School's name begins with the family name.
      if(clause.family && String(schoolName).replace(/^The\s+/i, '').split(/\s+/)[0].toLowerCase() !== clause.family.toLowerCase()) return false;
      // Schools this one clause leaves out ("any other Phoenix shugenja School").
      if(clause.exceptSchools && clause.exceptSchools.some(function(x){ return resolveSchoolName(x) === schoolName; })) return false;
      // An Affinity the School must have been taken with (Isawa Shugenja with Air). Only the active
      // School's Affinity is known, so another School is not ruled out by it.
      if(clause.affinity && schoolName === AP46.activeSchool() && typeof getActiveSchoolElementalProfile === 'function'
         && (getActiveSchoolElementalProfile() || {}).affinity !== clause.affinity) return false;
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
        // A Path at Rank 6 or above adds a Technique beyond the School's five (Tsuruchi Master
        // Bowman); the trunk stops at Rank 5, so it is granted here.
        for(let r = 6; r <= Math.min(rank, 10); r++){
          const p = pathAtRank(r);
          if(p && !res.techniquesUnlocked.some(function(t){ return t.name === p.tech; })){
            res.techniquesUnlocked.push({ rank:r, name:p.tech, desc:techniqueDescription(p.tech) });
          }
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

    // The trunk's School-name check, with one change: a clause marked notInSheet names a School the
    // sheet's library does not hold (Hiruma Scout), which is expected and reported by
    // AP46.notInSheet() for the audit instead of as an error.
    assertPathSchoolsResolve = function(){
      const bad = [];
      ALTERNATE_PATH_LIBRARY.forEach(function(p){
        (p.replaces || []).forEach(function(c){
          if(c.school && !c.notInSheet && !resolveSchoolName(c.school)) bad.push(p.name + ' -> replaces "' + c.school + '"');
        });
        (p.excludes || []).forEach(function(x){ if(!resolveSchoolName(x)) bad.push(p.name + ' -> excludes "' + x + '"'); });
      });
      if(bad.length) console.error('ALTERNATE_PATH_LIBRARY: unresolved School names:\n' + bad.join('\n'));
      return bad;
    };
    // The load check, loudly: a Path that reaches no School looks exactly like one that is correctly
    // ineligible. The trunk's own check ran before these Paths were added, so it runs again here.
    const ap46Unresolved = assertPathSchoolsResolve().concat(AP46.assertResolve());
    if(ap46Unresolved.length) console.error('Phase 4.6 (Part I) Alternate Paths: unresolved:\n' + ap46Unresolved.join('\n'));
  }
  // ========= END PART I PHASE 4.6 =========
