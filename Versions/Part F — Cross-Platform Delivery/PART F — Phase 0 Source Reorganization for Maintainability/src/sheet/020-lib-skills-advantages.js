  const SKILL_LIBRARY = [
    {name:'Acting', trait:'Awareness', cat:'High', emph:'Clan, Gender, Profession', m:{3:'Disguise TN drops by 5',5:'Disguise TN drops by 10 total',7:'Disguise TN drops by 15 total'}},
    {name:'Artisan', trait:'Awareness', cat:'High', emph:'varies by sub-skill', m:{}},
    {name:'Calligraphy', trait:'Intelligence', cat:'High', emph:'Cipher, High Rokugani', m:{5:'+10 to break a code or cipher'}},
    {name:'Courtier', trait:'Awareness', cat:'High', emph:'Gossip, Manipulation, Rhetoric', m:{3:'+3 Insight',5:'+1k0 on Contested Rolls using this skill',7:'Another +7 Insight (stacks with R3)'}},
    {name:'Divination', trait:'Intelligence', cat:'High', emph:'Astrology, Kawaru, Omens', m:{5:'A failed daily divination can be retried without spending a Void Point'}},
    {name:'Etiquette', trait:'Awareness', cat:'High', emph:'Bureaucracy, Conversation, Courtesy', m:{3:'+3 Insight',5:'+1k0 on Contested Rolls using this skill',7:'Another +7 Insight (stacks with R3)'}},
    {name:'Games', trait:'Awareness', cat:'High', emph:'varies by sub-skill', m:{}},
    {name:'Investigation', trait:'Perception', cat:'High', emph:'Interrogation, Notice, Search', m:{3:'A second Search attempt avoids the usual TN increase',5:'+5 on any Contested Roll using this skill',7:'A third Search attempt is allowed even after the second fails'}},
    {name:'Lore', trait:'Intelligence', cat:'High', emph:'varies by subject', m:{}},
    {name:'Medicine', trait:'Intelligence', cat:'High', emph:'Antidotes, Disease, Herbalism, Non-Humans, Wound Treatment', m:{5:'Heals +1k0 more on a successful treatment roll'}},
    {name:'Meditation', trait:'Void', cat:'High', emph:'Akasha Recovery, Fasting, Void Recovery', m:{3:'Recovers up to 2 Void Points per success',5:'Fasting TN is reduced by 5',7:'Recovers up to 3 Void Points per success'}},
    {name:'Perform', trait:'Awareness', cat:'High', emph:'varies by sub-skill', m:{}},
    {name:'Sincerity', trait:'Awareness', cat:'High', emph:'Honesty, Deceit (Low)', m:{5:'+5 on any Contested Roll using this skill'}},
    {name:'Spellcraft', trait:'Intelligence', cat:'High', emph:'Importune, Spell Research', m:{5:'+1k0 on Spell Casting Rolls'}},
    {name:'Tea Ceremony', trait:'Void', cat:'High', emph:'—', m:{5:'Participants recover 2 Void Points instead of 1'}},

    {name:'Athletics', trait:'Strength', cat:'Bugei', emph:'Climbing, Running, Swimming, Throwing', m:{3:'Ignores Moderate Terrain penalties; Difficult Terrain only costs -1 Water instead of -2',5:'No movement penalty from terrain at all',7:'+5ft on one Move Action per round'}},
    {name:'Battle', trait:'Perception', cat:'Bugei', emph:'Mass Combat, Skirmish', m:{5:'Adds Battle Rank to Initiative during Skirmishes'}},
    {name:'Defense', trait:'Reflexes', cat:'Bugei', emph:'—', m:{3:'Can keep a prior Defense roll while holding Full Defense',5:'+3 Armor TN while in Defense or Full Defense',7:'May take one Simple Action while in Full Defense (still no attacks)'}},
    {name:'Horsemanship', trait:'Agility', cat:'Bugei', emph:'Gaijin Riding Horse, Rokugani Pony, Utaku Steed', m:{3:'Can use Full Attack Stance while mounted',5:'Mounting is a Simple Action, dismounting a Free Action',7:'Mounting becomes a Free Action too'}},
    {name:'Hunting', trait:'Perception', cat:'Bugei', emph:'Survival, Tracking, Trailblazing, Traps', m:{5:'+1k0 on Stealth rolls made in the wilderness'}},
    {name:'Iaijutsu', trait:'Reflexes', cat:'Bugei', emph:'Assessment, Focus', m:{3:'Drawing a katana is a Free Action',5:'One Free Raise on the Focus roll during a duel',7:'+2k2 instead of +1k1 to the Focus roll when your Assessment beats the opponent\u2019s by 10+'}},
    {name:'Jiujutsu', trait:'Agility', cat:'Bugei', emph:'Bariqu, Grappling, Hitsu-do, Improvised Weapons, Kaze-do, Martial Arts, Sumai', m:{3:'+1k0 unarmed damage',5:'Free Raise toward starting a Grapple',7:'Another +0k1 unarmed damage (total +1k1)'}},

    // ---- PHASE 1 (mastery refactor): structured mastery fields -----------------------------
    // dmgBonus / explodeOn / reductionMod below are ADDITIVE, parallel data — the free-text
    // `m` map (shown in the Skill Info modal) is untouched and remains the only thing any
    // roller or UI reads. Nothing in this phase parses, applies, or displays these new fields;
    // they exist purely as structured data for Phase 2's helper functions to read later.
    //
    // Only added where the `m` text is an UNCONDITIONAL, always-on numeric bonus that maps
    // cleanly onto one of the three shapes:
    //   dmgBonus:      { rank: {roll, keep} }  — flat addition to a weapon damage roll
    //   explodeOn:     { rank: threshold }     — dice that already explode on 10 also explode
    //                                             on this lower value at/above this rank
    //   reductionMod:  { rank: value }         — signed adjustment to a target's Reduction
    //                                             (negative = target's Reduction treated lower)
    // Deliberately left unstructured (mastery bonus text stays free-text only) where the bonus
    // is conditional on something the sheet doesn't track (situation, subtype, timing) — giving
    // it a structured field would make Phase 5's roller apply it unconditionally, which would
    // be a rules error, not a refactor. Specifically omitted for that reason:
    //   - Polearms 5 ('+1k0 damage vs mounted or much larger foes') — conditional on target
    //   - Spears 3 ('Ignore 3 Reduction on first-round melee attacks') — conditional on round
    //   - Staves 7 ('small staves get +1k0 damage') — conditional on weapon subtype
    //   - Ninjutsu 3 ('Damage dice explode normally') — NOT the same shape as explodeOn above:
    //     Ninjutsu weapons don't explode on 10 by default, so this is "turn exploding on",
    //     not "also explode on a lower number". Modeling it as explodeOn would be wrong; left
    //     as free-text pending a future dedicated field if Ninjutsu weapons are added.
    // Every other mastery bonus (Free Actions, Free Raises, Initiative, Armor TN, off-hand,
    // range, crew size, etc.) isn't a damage/explosion/reduction number at all and is out of
    // scope for this refactor by definition — free-text only, same as today.
    {name:'Cannon', trait:'Intelligence', cat:'Weapon (Low)', emph:'—', m:{5:'Can be crewed by two people instead of four'}},
    {name:'Chain Weapons', trait:'Agility', cat:'Weapon', emph:'Kusarigama, Kyoketsu-shoge, Manrikigusari', m:{3:'Can be used to start a Grapple',5:'+1k0 on Contested Rolls against entangled/grappled foes',7:'Free Raise toward Disarm or Knockdown'}},
    {name:'Firearms', trait:'Intelligence', cat:'Weapon (Low)', emph:'Pistol, Musket', m:{5:'Reloading takes one fewer Complex Action'}},
    {name:'Heavy Weapons', trait:'Agility', cat:'Weapon', emph:'Dai Tsuchi, Masakari, Ono, Tetsubo', m:{3:'Target\u2019s Reduction is treated as 2 lower',5:'Free Raise toward Knockdown',7:'Damage dice explode on 9 as well as 10'}, reductionMod:{3:-2}, explodeOn:{7:9}},
    {name:'Kenjutsu', trait:'Agility', cat:'Weapon', emph:'Katana, Ninja-to, No-dachi, Parangu, Scimitar, Wakizashi', m:{3:'+1k0 sword damage',5:'Drawing/readying a sword is a Free Action',7:'Sword damage dice explode on 9 as well as 10'}, dmgBonus:{3:{roll:1,keep:0}}, explodeOn:{7:9}},
    // PART C FEATURE 7 - offHandExempt declares, structurally, the Rank at which this Skill's
    // printed mastery removes the off-hand penalty. RAW (Core p.141): "Off-hand penalties do
    // not apply when using a knife."
    {name:'Knives', trait:'Agility', cat:'Weapon', emph:'Aiguchi, Jitte, Kama, Sai, Tanto', m:{3:'No off-hand penalty when using a knife',5:'Sai/Jitte grant a Free Raise toward Disarm',7:'Any knife grants a Free Raise toward Extra Attack'}, offHandExempt:3},
    {name:'Kyujutsu', trait:'Reflexes', cat:'Weapon', emph:'Dai-kyu, Han-kyu, Yumi', m:{3:'Stringing a bow is a Simple Action instead of Complex',5:'+50% to a bow\u2019s maximum range',7:'Bow Strength rating +1'}},
    {name:'Ninjutsu', trait:'Agility or Reflexes', cat:'Weapon (Low)', emph:'Blowgun, Shuriken, Tsubute', m:{3:'+1k0 damage with ninjutsu weapons',5:'Damage dice explode normally (they otherwise don\u2019t)',7:'Another +0k1 damage (total +1k1)'}, dmgBonus:{3:{roll:1,keep:0},7:{roll:0,keep:1}}},
    {name:'Polearms', trait:'Agility', cat:'Weapon', emph:'Bisento, Nagamaki, Naginata, Sasumata, Sodegarami', m:{3:'+5 Initiative in the first round of a skirmish',5:'+1k0 damage vs mounted or much larger foes',7:'Readied as a Free Action'}},
    {name:'Spears', trait:'Agility', cat:'Weapon', emph:'Mai Chong, Kumade, Lance, Magari-Yari, Nage-yari, Yari', m:{3:'Ignore 3 Reduction on first-round melee attacks',5:'+5ft to max thrown range',7:'Readied as a Free Action'}},
    {name:'Staves', trait:'Agility', cat:'Weapon', emph:'Bo, Jo, Machi-kanshisha, Sang Kauw, Tonfa', m:{3:'Opponents no longer get doubled armor vs. staff hits',5:'Free Raise toward Knockdown',7:'Large staves ready as a Free Action; small staves get +1k0 damage'}},
    {name:'War Fan', trait:'Agility', cat:'Weapon', emph:'—', m:{3:'No off-hand penalty',5:'+1 Armor TN while wielded',7:'+3 Armor TN total while wielded'}, offHandExempt:3},
    // ---- END PHASE 1 additions ---------------------------------------------------------

    {name:'Animal Handling', trait:'Awareness', cat:'Merchant', emph:'by animal type', m:{3:'Can train animals for others to use',5:'Trained animals can be commanded to attack',7:'Trained animals can be commanded silently'}},
    {name:'Commerce', trait:'Intelligence', cat:'Merchant', emph:'Appraisal, Mathematics, Merchant', m:{5:'Can shift a price up or down by up to 20%'}},
    {name:'Craft', trait:'Awareness', cat:'Merchant', emph:'varies by sub-skill', m:{}},
    {name:'Engineering', trait:'Intelligence', cat:'Merchant', emph:'Construction, Siege, Traps', m:{5:'+5 on Cooperative/Cumulative Engineering rolls'}},
    {name:'Sailing', trait:'Agility or Intelligence', cat:'Merchant', emph:'Knot-work, Navigation', m:{5:'+5 on Cooperative/Cumulative Sailing rolls'}},

    {name:'Forgery', trait:'Agility', cat:'Low', emph:'Artwork, Documents, Personal Seals', m:{3:'+1k0 to the TN needed to detect your forgery',5:'+1k0 when trying to detect someone else\u2019s forgery',7:'Another +0k1 to your forgery\u2019s detection TN (total +1k1)'}},
    {name:'Intimidation', trait:'Willpower', cat:'Low', emph:'Bullying, Control, Torture', m:{5:'+5 on any Contested Roll using this skill'}},
    {name:'Sleight of Hand', trait:'Agility', cat:'Low', emph:'Conceal, Escape, Pick Pocket, Prestidigitation', m:{5:'Can conceal small weapons, not just objects'}},
    {name:'Stealth', trait:'Agility', cat:'Low', emph:'Ambush, Shadowing, Sneaking, Spell Casting', m:{3:'Move Water×5 (instead of Water×1) while sneaking',5:'Move Water×10 while sneaking',7:'Move Actions while sneaking become Free Actions'}},
    {name:'Temptation', trait:'Awareness', cat:'Low', emph:'Bribery, Seduction', m:{5:'+5 on any Contested Roll using this skill'}},
  ];

  // Short, plain-language summaries of what each skill covers — for the Skill Info popup.
  const SKILL_DESCRIPTIONS = {
    'Acting':'Convincingly pass yourself off as someone else — a different role, station, or even a specific individual — and covers knowledge of Rokugani theater styles.',
    'Artisan':'A catch-all for the noble arts (painting, poetry, ikebana, sculpture, and the like); pick a sub-skill and it covers creating that particular kind of art.',
    'Calligraphy':'The craft of formal writing — ciphers, elegant court script, and the sophistication that comes with fine penmanship.',
    'Courtier':'The "social offense" skill of Rokugani politics — maneuvering rivals, spreading or gathering rumors, and steering conversations to your advantage.',
    'Divination':'Glimpsing fragments of fate through astrology or kawaru stones — vague but sometimes useful hints about what is to come.',
    'Etiquette':'Knowing correct court conduct — the "social defense" skill used to resist manipulation and to navigate bureaucracy and polite conversation without giving offense.',
    'Games':'Skill at Rokugan\u2019s traditional pastimes — go, shogi, kemari, and similar contests, usually resolved as a Contested Roll against an opponent.',
    'Investigation':'Reading a scene for clues, tracking down information over time, or catching someone in a lie — the core skill of magistrates and detectives.',
    'Lore':'Scholarly knowledge of a chosen subject — history, theology, a particular Clan, and so on; pick a sub-skill for the topic in question.',
    'Medicine':'Treating wounds, illness, and poison — binding injuries, curing disease, and administering antidotes.',
    'Meditation':'Centering the mind to recover spent Void Points, and — with the right training — to endure fasting and deprivation.',
    'Perform':'Musical and theatrical talent — biwa, song, storytelling, dance, and similar arts performed for an audience.',
    'Sincerity':'Speaking convincingly, whether telling the truth persuasively or lying without being caught — often opposed by an listener\u2019s Investigation.',
    'Spellcraft':'A shugenja\u2019s understanding of how invocations work — researching new spells and entreating kami spirits for aid.',
    'Tea Ceremony':'Conducting the formal, ritual tea ceremony, which lets participants recover a spent Void Point.',
    'Athletics':'Physical prowess beyond simple Trait rolls — climbing, running, swimming, and throwing objects with accuracy.',
    'Battle':'Understanding of warfare, tactics, and command — used for mass combat and skirmish situations.',
    'Defense':'The discipline of positioning blade and body to turn aside attacks — required to use the Defense and Full Defense stances effectively.',
    'Horsemanship':'Riding and controlling a mount, especially in difficult terrain, bad weather, or combat.',
    'Hunting':'Tracking and surviving in the wild — foraging, following trails, and blazing paths for others to follow.',
    'Iaijutsu':'The formal dueling art of Rokugan — assessing an opponent and drawing your blade in a single decisive strike.',
    'Jiujutsu':'Unarmed combat and grappling, also usable to fight effectively with improvised weapons.',
    'Cannon':'Aiming and directing the crew of a cannon; rarely permitted to Rokugani characters.',
    'Chain Weapons':'Fighting with kusari-gama, manrikigusari, and similar chain-based weapons, popular among the Mantis Clan.',
    'Firearms':'Loading and firing gaijin gunpowder weapons — a forbidden and socially disgraceful skill in Rokugan.',
    'Heavy Weapons':'Wielding tetsubo, ono, and other massive weapons, favored by the Crab Clan for their raw power.',
    'Kenjutsu':'The path of the sword — training with the katana and other blades, the signature weapon of the samurai caste.',
    'Knives':'Fighting with tanto, kama, and other small blades — a practical backup skill nearly every bushi carries.',
    'Kyujutsu':'The art of the bow — drawing, aiming by feel, and firing in one smooth motion at range.',
    'Ninjutsu':'Using specialized shinobi weapons like the blowgun and shuriken — a shameful skill no honorable samurai would admit to.',
    'Polearms':'Fighting with naginata, bisento, and other long hafted weapons that keep opponents at a distance.',
    'Spears':'Fighting with yari, lances, and other thrusting spears — especially effective against mounted or armored foes.',
    'Staves':'Fighting with bo, jo, and other staff weapons, more common among monks than bushi.',
    'War Fan':'Using a tessen — a metal fan — both for battlefield signaling and, in a pinch, as a weapon.',
    'Animal Handling':'Training and commanding animals such as dogs, horses, or hunting falcons.',
    'Commerce':'Trade and mercantile know-how — appraising goods and handling the mathematics of tariffs and taxes.',
    'Craft':'A catch-all for practical trades (blacksmithing, carpentry, pottery, cooking, and more); pick a sub-skill for the trade in question.',
    'Engineering':'Understanding how structures are built and how to plan or besiege them — the domain of the Kaiu siege engineers.',
    'Sailing':'Handling a ship at sea — navigation by the stars and working with rope and rigging.',
    'Forgery':'Producing convincing fake documents, seals, or artwork, and judging the quality of a forgery.',
    'Intimidation':'Coercing others through threats, bullying, or long-term psychological pressure — a shameful but sometimes-used skill.',
    'Sleight of Hand':'Manual dexterity for concealing objects, picking pockets, slipping bonds, or performing tricks.',
    'Stealth':'Moving unseen and unheard through sneaking, ambush, and shadowing — generally dishonorable, and most uses (aside from plain Sneaking) cost you Honor.',
    'Temptation':'Offering someone what they desire — money, pleasure, or other vice — to bend them to your will.',
  };

  // Advantage/Disadvantage reference library — paraphrased summaries only (name, category, base point
  // cost, and a short plain-language gist of the effect). Costs shown are the base/example cost; several
  // entries are variable, per-rank, or clan-discounted — adjust the Points field on the entry as needed.
  // Check your rulebook for the exact rules text (Core Rules pp.146-155 for most entries).
  const ADV_LIBRARY = [
    {name:'Absolute Direction', cat:'Mental', cost:1, desc:'Always know true north by instinct, except more than a day deep in the Shadowlands.'},
    {name:'Allies', cat:'Social', cost:1, desc:'Social connections who can help you; cost is set by their Influence (1/2/4) and Devotion (1/2/4). Crane pay 1 less.'},
    {name:'Balance', cat:'Mental', cost:2, desc:'When adding Honor Rank to resist Intimidation or Temptation, also add +1k0 to the roll.'},
    {name:'Blackmail', cat:'Social', cost:1, desc:'You hold proof of someone\u2019s dark secret; cost equals their Status Rank. Scorpion pay 1 less.'},
    {name:'Bland', cat:'Physical', cost:2, desc:'Forgettable in every way; you can raise by 10 the TN for others trying to determine your Honor or Glory/identity.'},
    {name:'Blissful Betrothal', cat:'Social', cost:3, desc:'A loving arranged marriage lets you buy Gentry, Kharmic Tie (spouse only), Social Position, and Wealth for 2 points less each.'},
    {name:'Blood of Osano-Wo', cat:'Spiritual', cost:4, desc:'Immune to weather penalties/damage; reduce damage from nature-themed spells by 1k1. Crab/Mantis pay 3.'},
    {name:'Chosen by the Oracles', cat:'Spiritual', cost:6, desc:'Choose a Ring; gain +1k1 on all Ring Rolls using it.'},
    {name:'Clear Thinker', cat:'Mental', cost:3, desc:'+1k0 on Contested Rolls resisting deception or manipulation. Dragon pay 2.'},
    {name:'Crab Hands', cat:'Physical', cost:3, desc:'Treated as Rank 1 in any Weapon Skill you would otherwise roll Unskilled. Crab/bushi pay 2.'},
    {name:'Crafty', cat:'Mental', cost:3, desc:'Treated as Rank 1 in any Low Skill you would otherwise roll Unskilled. Scorpion/Spider/Ninja pay 2.'},
    {name:'Dangerous Beauty', cat:'Physical', cost:3, desc:'+1k0 on Temptation rolls made against the opposite sex. Scorpion pay 2.'},
    {name:'Daredevil', cat:'Mental', cost:3, desc:'A Void Point spent on Athletics grants +3k1 instead of the usual +1k1. Mantis pay 2.'},
    {name:'Dark Paragon', cat:'Mental', cost:5, desc:'Once/session, spend 5 Honor (or a Void Point) for a +5 bonus tied to a chosen Shourido precept. Spider pay 4.'},
    {name:'Darling of the Court', cat:'Social', cost:2, desc:'Choose a court; your Status counts one rank higher while it is in session. Repeatable per court. Courtier pay 1.'},
    {name:'Different School', cat:'Social', cost:5, desc:'At creation, attend a School belonging to a different Clan than your own.'},
    {name:'Elemental Blessing', cat:'Spiritual', cost:4, desc:'Choose a non-Void Ring; increasing either of its Traits costs 1 XP less. Phoenix pay 3.'},
    {name:'Enlightened', cat:'Spiritual', cost:6, desc:'Increasing your Void Ring costs 2 XP less each time. Dragon/monk pay 5.'},
    {name:'Fame', cat:'Social', cost:3, desc:'+1 Glory Rank.'},
    {name:'Forbidden Knowledge', cat:'Mental', cost:5, desc:'Secret expertise in a taboo subject (gunpowder, Gozoku, Kolat, Lying Darkness, or maho), granting a related Lore rank and situational bonus.'},
    {name:'Friendly Kami', cat:'Spiritual', cost:5, desc:'Shugenja only. Choose an Element; +1k1 on Sense/Commune/Summon Spell Casting Rolls for it.'},
    {name:'Friend of the Brotherhood', cat:'Spiritual', cost:5, desc:'Buy Kiho at Brotherhood-of-Shinsei rates even though you are not from that School. Dragon pay 4.'},
    {name:'Friend of the Elements', cat:'Spiritual', cost:4, desc:'Choose a Ring; Trait Rolls using either of its Traits gain a Free Raise. Shugenja pay 3.'},
    {name:'Gaijin Gear', cat:'Material', cost:5, desc:'You own one foreign-made item (weapon or tool) with its own unique mechanics. Mantis/Unicorn pay 4.'},
    {name:'Gentry', cat:'Material', cost:8, desc:'Variable cost (8-30). Assigned to oversee a holding, from a village up to a full province, sized by points spent.'},
    {name:'Great Destiny', cat:'Spiritual', cost:5, desc:'Once/session, a killing blow instead leaves you at 1 Wound remaining.'},
    {name:'Great Potential', cat:'Varies', cost:5, desc:'Choose a Skill; Raises using it are capped by your Skill Rank (or Void Ring, if higher) instead of Void Ring alone.'},
    {name:'Hands of Stone', cat:'Physical', cost:6, desc:'+0k1 to unarmed Damage Rolls. Monk pay 5.'},
    {name:'Heart of Vengeance', cat:'Social', cost:5, desc:'Choose a rival Clan or faction; +1k1 on Contested Rolls against its members. Spider pay 4.'},
    {name:'Heartless', cat:'Mental', cost:4, desc:'+1k0 resisting Courtier, Sincerity, or Temptation aimed at swaying your emotions.'},
    {name:'Hero of the People', cat:'Social', cost:2, desc:'Commoners\u2019 TN to recognize your Glory Rank drops by 10.'},
    {name:'Higher Purpose', cat:'Mental', cost:3, desc:'Devoted to a long-term personal goal; gain a bonus Experience Point whenever you visibly progress it.'},
    {name:'Imperial Scribe', cat:'Social', cost:4, desc:'Requires Status 2+, Calligraphy 4+. +1k0 Social rolls with shugenja/artisans; Free Raise on Calligraphy rolls.'},
    {name:'Imperial Spouse', cat:'Social', cost:5, desc:'Married into a minor Imperial family line; +0.5 Status, +1k1 Social rolls with Imperial family members.'},
    {name:'Inari\u2019s Blessing', cat:'Spiritual', cost:3, desc:'Fasting no longer blocks Void Point recovery (other fasting penalties still apply).'},
    {name:'Inheritance', cat:'Material', cost:5, desc:'One extra heirloom item beyond your starting gear; +1k1 on non-combat Skill Rolls made using it.'},
    {name:'Inner Gift', cat:'Spiritual', cost:7, desc:'A unique minor supernatural knack, chosen with the GM (e.g. Animal Ken, Empathy, Foresight, Lesser Prophecy, or Spirit Touch).'},
    {name:'Irreproachable', cat:'Mental', cost:2, desc:'+1k0 on Contested Rolls resisting Temptation. Imperial pay 1.'},
    {name:'Ishiken-Do', cat:'Spiritual', cost:8, desc:'Shugenja only. Grants the ability to cast Void spells. Phoenix pay 6.'},
    {name:'Kharmic Tie', cat:'Spiritual', cost:1, desc:'1-5 points. Bonded to a chosen person; per point spent, once/session +1k1 on attack rolls made protecting or fighting for them.'},
    {name:'Languages', cat:'Mental', cost:1, desc:'1 point learns a foreign human language; 3 points grants limited fluency in a non-human language.'},
    {name:'Large', cat:'Physical', cost:4, desc:'Noticeably tall and strong; +1k0 Damage Rolls with large melee weapons. Crab pay 3.'},
    {name:'Leadership', cat:'Social', cost:6, desc:'Once/round, add School Rank +1k1 to an ally\u2019s Initiative Score in a skirmish. Lion pay 5.'},
    {name:'Luck', cat:'Spiritual', cost:3, desc:'3/6/9 points per rank. That many times per session, reroll any one roll and keep the better result.'},
    {name:'Magic Resistance', cat:'Spiritual', cost:2, desc:'2/4/6 points per rank. Elemental spells targeting you have their casting TN raised by +3 per rank (not maho or non-kami magic).'},
    {name:'Multiple Schools', cat:'Social', cost:10, desc:'During play, stop advancing your current School and begin a second School\u2019s Techniques from Rank 1 at your next Insight Rank. Bushi and Shugenja Schools cannot be mixed.'},
    {name:'Naishou Citizen', cat:'Spiritual', cost:3, desc:'Buy Seven Fortunes\u2019 Blessing for 1 point less; Free Raise on Social rolls with monks aligned to your chosen Fortune.'},
    {name:'Paragon', cat:'Mental', cost:7, desc:'Choose one Bushido tenet; gain its matching mechanical bonus, plus extra Honor whenever you are rewarded for that virtue. Lion pay 6.'},
    {name:'Perceived Honor', cat:'Social', cost:3, desc:'3 points per rank. Anyone reading your Honor Rank perceives it as that many ranks higher.'},
    {name:'Precise Memory', cat:'Mental', cost:3, desc:'+1k1 on Intelligence Trait Rolls made to recall exact details.'},
    {name:'Prodigy', cat:'Physical', cost:12, desc:'+1k0 on all School Skill Rolls.'},
    {name:'Quick', cat:'Physical', cost:6, desc:'If you did not act first, add your Reflexes to Initiative Score for the rest of the skirmish\u2019s rounds. Ninja pay 5.'},
    {name:'Quick Healer', cat:'Physical', cost:3, desc:'Treated as two Stamina ranks higher for the purpose of recovering Wounds.'},
    {name:'Read Lips', cat:'Mental', cost:4, desc:'Read speech you cannot hear via a Perception roll whose TN scales with distance. Courtier pay 3.'},
    {name:'Sacred Weapon', cat:'Material', cost:3, desc:'Variable cost (3-6). Own an iconic Clan weapon with its own combat mechanics.'},
    {name:'Sacrosanct', cat:'Social', cost:4, desc:'Requires Honor 6.0+. While your Honor stays 6.0+, Honor Rank 5+ characters cannot attack you first (willing duels excepted). Imperial pay 3.'},
    {name:'Sage', cat:'Mental', cost:4, desc:'Treated as Rank 1 in any Lore Skill you would otherwise roll Unskilled. Phoenix/shugenja pay 3.'},
    {name:'Sensation', cat:'Social', cost:3, desc:'Treated as Rank 1 in any Perform Skill you do not possess.'},
    {name:'Servant', cat:'Material', cost:5, desc:'Gain a servant (Traits 2, one Skill at 3); extra Ranks/Emphases cost 3 points each. Servant type and Clan discount vary.'},
    {name:'Seven Fortunes\u2019 Blessing', cat:'Spiritual', cost:4, desc:'Choose a Fortune\u2019s blessing; each grants its own themed roll bonus. Listed Clans pay 1 less.'},
    {name:'Shadowed Heart', cat:'Mental', cost:5, desc:'+5 TN on rolls made to read your true intentions or motivations.'},
    {name:'Silent', cat:'Physical', cost:3, desc:'+1k0 on Stealth rolls. Ninja pay 2.'},
    {name:'Social Position', cat:'Social', cost:6, desc:'+1 Status Rank.'},
    {name:'Soul of Artistry', cat:'Mental', cost:4, desc:'Choose Artisan or Craft Skills; treated as Rank 1 in that type when you would otherwise roll Unskilled. Crane/courtier pay 3.'},
    {name:'Strength of the Earth', cat:'Physical', cost:3, desc:'Wound-Rank TN penalties reduced by 3. Bushi pay 2.'},
    {name:'Tactician', cat:'Mental', cost:4, desc:'Adjust a Mass Battle Table roll by \u00b15. Lion/bushi pay 3.'},
    {name:'Touch of the Spirit Realms', cat:'Spiritual', cost:5, desc:'Choose a Spirit Realm; gain its themed bonus (varies by realm). Shugenja pay 4.'},
    {name:'Virtuous', cat:'Mental', cost:3, desc:'+1 starting Honor Rank above your School\u2019s normal value.'},
    {name:'Voice', cat:'Physical', cost:3, desc:'+1k1 on vocal Perform Skill Rolls (singing, oratory, etc).'},
    {name:'Void Versatility', cat:'Spiritual', cost:4, desc:'Shugenja with Void affinity only. Choose a non-Void Ring; you may spend that Ring\u2019s spell slots on Void spells too.'},
    {name:'Wary', cat:'Mental', cost:3, desc:'+1k1 on Investigation (Notice)/Perception rolls made to spot an ambush.'},
    {name:'Way of the Land', cat:'Mental', cost:2, desc:'Choose a region; you cannot get lost there and know its resources. Unicorn pay 1.'},
    {name:'Wealthy', cat:'Material', cost:1, desc:'1 point per rank. Each point grants 2 extra starting koku. Crane/Unicorn/Imperial pay 1 less per rank.'},
  ];
  const DISADV_LIBRARY = [
    {name:'Anachronism', cat:'Mental', cost:2, desc:'Returned spirits only. Out of step with modern custom; +5 TN on Artisan, Craft, and Social Skill Rolls.'},
    {name:'Antisocial', cat:'Social', cost:2, desc:'2 points for -1k0, 4 points for -1k1, on all Social Skill Rolls. Crab pay 1 more.'},
    {name:'Ascetic', cat:'Mental', cost:2, desc:'Starting outfit is bare-bones (gear/tools only); Glory awards halved. Dragon/Monk pay 3.'},
    {name:'Bad Eyesight', cat:'Physical', cost:3, desc:'-1k1 on ranged attack rolls and Perception-based rolls.'},
    // Monk only. Book of Void p.192 prices it by category: 2 points for a Clan monk, 4 for a
    // Brotherhood monk - the more the Void is worth to you, the more giving it up is worth.
    // The sheet carries the Brotherhood price and notes the other, since it has no per-School
    // Advantage pricing mechanism. The Void Kiho ban is enforced via KIHO_BAN_BY_DISADVANTAGE.
    {name:'Uncentered', cat:'Spiritual', cost:4, desc:'Monk only. You may not learn any Void Kiho, and may not take the Ishiken-do or Void Versatility Advantages. 4 points for a Brotherhood monk, 2 for a Clan monk.'},
    {name:'Bad Fortune', cat:'Spiritual', cost:3, desc:'A persistent, GM-agreed misfortune (secret admirer, disfigurement, evil eye, allergy, lingering bad luck, unknown enemy, or a Clan-specific curse).'},
    {name:'Bad Health', cat:'Physical', cost:4, desc:'Earth Ring treated one rank lower for Wound Ranks and disease resistance.'},
    {name:'Bitter Betrothal', cat:'Social', cost:2, desc:'Trapped in a loveless arranged marriage that complicates domestic and bureaucratic affairs. Imperial pay 3.'},
    {name:'Blackmailed', cat:'Social', cost:1, desc:'Cost equals your Status Rank. Someone holds a secret over you and periodically extracts favors.'},
    {name:'Black Sheep', cat:'Social', cost:3, desc:'Disowned in practice though not formally ronin; cannot advance in a family School without going to great lengths.'},
    {name:'Blind', cat:'Physical', cost:6, desc:'-3k3 ranged/-1k1 melee attacks; Armor TN from Reflexes+5 only; Water Ring -2 for movement; Perception rolls generally unavailable.'},
    {name:'Brash', cat:'Mental', cost:3, desc:'When threatened or insulted, must pass a Willpower roll (TN 25, +Honor Rank) or attack immediately. Lion pay 4.'},
    {name:'Can\u2019t Lie', cat:'Mental', cost:2, desc:'Physically unable to lie; must correct a known lie told in your presence unless you pass a Willpower roll (TN 20).'},
    {name:'Cast Out', cat:'Social', cost:1, desc:'1 point for a single temple\u2019s disapproval, 3 for a major Brotherhood sect; its monks treat your Glory as Infamy.'},
    {name:'Compulsion', cat:'Mental', cost:2, desc:'2-4 points. An ingrained habit or addiction; resisting it needs a Willpower roll from TN 15 up to TN 25 at 4 points.'},
    {name:'Consumed', cat:'Mental', cost:4, desc:'4-6 points. Fully given over to one Shourido tenet (Control, Determination, Insight, Knowledge, Perfection, Strength, or Will), each with its own penalty. Spider pay 1 more.'},
    {name:'Contrary', cat:'Mental', cost:3, desc:'Compelled to argue your view in disputes; must pass a Willpower roll to hold back. Imperial/courtier pay 4.'},
    {name:'Cursed by the Realm', cat:'Spiritual', cost:4, desc:'Marked as an enemy of a chosen Spirit Realm, with a themed penalty that varies by realm. Shugenja pay 5.'},
    {name:'Dark Fate', cat:'Spiritual', cost:3, desc:'Destined to bring about some future catastrophe; once/session a killing blow instead leaves you at 1 Wound.'},
    {name:'Dark Secret', cat:'Social', cost:4, desc:'You hide a ruinous secret that could mean seppuku or execution if exposed. Ninja pay 5.'},
    {name:'Dependant', cat:'Social', cost:2, desc:'Variable cost (roughly 2-6). Someone helpless relies on you; cost scales with how helpless and how often they appear.'},
    {name:'Dishonored', cat:'Social', cost:5, desc:'Struck from your family\u2019s records; stuck at Status Rank 1 unless you pursue the Deathseeker tradition.'},
    {name:'Disbeliever', cat:'Mental', cost:3, desc:'Secretly lost faith in Rokugani religion; +5 TN on Social rolls with shugenja and monks.'},
    {name:'Disturbing Countenance', cat:'Physical', cost:3, desc:'+5 TN on all your Social Skill Rolls due to an unsettling appearance. Spider pay 4.'},
    {name:'Doubt', cat:'Mental', cost:4, desc:'Choose a School Skill; using it always requires an extra Raise for no benefit.'},
    {name:'Driven', cat:'Mental', cost:2, desc:'Single-mindedly obsessed with a goal, willing to sacrifice honor, family, and friends for it.'},
    {name:'Elemental Imbalance', cat:'Spiritual', cost:2, desc:'2 points per rank, shugenja only. Casting spells of a favored Element risks a botched effect unless you pass a Willpower roll (TN scales with rank).'},
    {name:'Enlightened Madness', cat:'Spiritual', cost:4, desc:'4 or 6 points. Using a chosen Ring, Skill, or tattoo risks temporary GM-controlled madness unless you pass a Willpower roll (TN 20 or 30).'},
    {name:'Epilepsy', cat:'Physical', cost:4, desc:'Stress or flashing lights can trigger a seizure unless you pass a Willpower roll (TN 15). Crane pay 5.'},
    {name:'Fascination', cat:'Mental', cost:1, desc:'An all-consuming hobby or interest that can push you toward dishonorable lengths to indulge it.'},
    {name:'Failure of Bushido', cat:'Mental', cost:3, desc:'3-6 points. Genuinely unable to embody one Bushido tenet, each with its own mechanical penalty. Ninja pay 1 more.'},
    {name:'Forced Retirement', cat:'Social', cost:4, desc:'Forced into a monastery; future Insight Ranks train an unaligned Monk School instead of your own. Monk pay 5.'},
    {name:'Frail Mind', cat:'Mental', cost:3, desc:'Opponents gain +2k0 on Contested Rolls made against your Willpower.'},
    {name:'Gaijin Name', cat:'Social', cost:1, desc:'A foreign-sounding name; dice on Social Skill Rolls can only explode once each. Unicorn pay 2.'},
    {name:'Greedy', cat:'Mental', cost:3, desc:'Temptation (Bribery) used against you gets a +1k1 bonus. Mantis pay 4.'},
    {name:'Gullible', cat:'Mental', cost:4, desc:'Sincerity (Deceit) used against you gets a +1k1 bonus.'},
    {name:'Haunted', cat:'Spiritual', cost:3, desc:'An ancestor demands deference; angering them costs a -1k1 penalty on one GM-chosen roll per session.'},
    {name:'Hostage', cat:'Social', cost:3, desc:'Held as a diplomatic guest of another Clan; cannot leave without escort, and war would endanger your life.'},
    {name:'Idealistic', cat:'Mental', cost:2, desc:'Impossibly high personal standards; Honor losses are increased by 1 point. Lion pay 3.'},
    {name:'Infamous', cat:'Social', cost:2, desc:'Known for the wrong reasons; your starting Glory Rank is Infamy instead.'},
    {name:'Insensitive', cat:'Mental', cost:2, desc:'Must spend a Void Point to risk yourself for anyone besides your lord without personal benefit. Scorpion pay 3.'},
    {name:'Jealousy', cat:'Mental', cost:3, desc:'Fixated on outdoing a chosen rival at any cost; moves to a new rival once bested.'},
    {name:'Lame', cat:'Physical', cost:4, desc:'A crippled leg; Water Ring treated as 1 for movement, +10 TN on lower-body Agility rolls.'},
    {name:'Lechery', cat:'Social', cost:2, desc:'A weakness for physical pleasure; Temptation (Seduction) used against you gets +1k1.'},
    {name:'Lord Moon\u2019s Curse', cat:'Spiritual', cost:3, desc:'3/5/7 points. Gain a bonus Void Point each full moon, but risk losing control for the night unless you pass a Willpower roll (TN scales with rank).'},
    {name:'Lost Love', cat:'Mental', cost:3, desc:'Reminders of a lost love raise all your TNs by 5 until you spend a Void Point to refocus (max twice/day).'},
    {name:'Low Pain Threshold', cat:'Physical', cost:4, desc:'Wound-Rank TN penalties increased by +5 per rank.'},
    {name:'Missing Limb', cat:'Physical', cost:6, desc:'+10 TN on any task requiring the missing limb.'},
    {name:'Momoku', cat:'Spiritual', cost:8, desc:'You keep Void Points but can only spend them on Techniques that specifically require them.'},
    {name:'Obligation', cat:'Social', cost:3, desc:'3 or 6 points. Bound to fulfill a serious duty for someone, minor or major, regardless of personal cost.'},
    {name:'Obtuse', cat:'Mental', cost:3, desc:'XP cost doubled for High Skills other than Investigation or Medicine. Crab/bushi pay 4.'},
    {name:'Overconfident', cat:'Mental', cost:3, desc:'Facing a clearly superior foe, you need a Perception roll (TN 20) to recognize it and disengage instead of pressing on. Lion/Mantis pay 4.'},
    {name:'Permanent Wound', cat:'Physical', cost:4, desc:'Your first Wound Rank is always treated as full. Bushi pay 5.'},
    {name:'Phobia', cat:'Mental', cost:1, desc:'1-3 points. An irrational fear; facing it raises all your TNs by +5 per point.'},
    {name:'Rumormonger', cat:'Social', cost:4, desc:'Compulsive gossip; resisting spreading a rumor needs a Willpower roll scaled to the subject\u2019s Glory. Courtier pay 5.'},
    {name:'Seven Fortunes\u2019 Curse', cat:'Spiritual', cost:3, desc:'A Fortune\u2019s specific curse against you, each with its own themed penalty.'},
    {name:'Shadowlands Taint', cat:'Spiritual', cost:4, desc:'You carry 0.5 ranks of Taint, largely undetectable at this level but essentially incurable.'},
    {name:'Small', cat:'Physical', cost:3, desc:'Water Ring treated one rank lower for movement; -1k0 on melee Damage Rolls; cannot also take Large.'},
    {name:'Social Disadvantage', cat:'Social', cost:3, desc:'You begin at Status Rank 0.'},
    {name:'Soft-Hearted', cat:'Mental', cost:2, desc:'Killing another person requires a Willpower roll (TN 20); after a kill, all TNs +10 for a day. Phoenix pay 3.'},
    {name:'Sworn Enemy', cat:'Social', cost:3, desc:'A dedicated enemy who wants you defeated or dead; cost rises if their Insight Rank exceeds yours, or +2 for a kharmic nemesis.'},
    {name:'Touch of the Void', cat:'Spiritual', cost:3, desc:'Void Points grant +2k1 instead of +1k1, but each use risks being Dazed unless you pass a Willpower roll (TN 30). Phoenix pay 4.'},
    {name:'True Love', cat:'Mental', cost:3, desc:'Choosing duty over your lover requires spending a Void Point first.'},
    {name:'Unlucky', cat:'Spiritual', cost:2, desc:'2 points per rank. That many times per session, the GM may force a reroll of one of your rolls, keeping the worse result.'},
    {name:'Weakness', cat:'Physical', cost:6, desc:'Choose a Trait; it is treated as one rank lower for all purposes.'},
    {name:'Wrath of the Kami', cat:'Spiritual', cost:3, desc:'Choose an Element; spells of that Element cast against you gain a Free Raise. Shugenja pay 4.'},
  ];
  function findSkill(name){
    if(!name) return null;
    const n = name.trim().toLowerCase();
    return SKILL_LIBRARY.find(s=>s.name.toLowerCase()===n) || null;
  }
  // ---- PHASE 2 (mastery refactor): pure structured-mastery helpers -----------------------
  // These read ONLY the Phase 1 structured fields (dmgBonus/explodeOn/reductionMod) added to
  // SKILL_LIBRARY — they do not read the DOM, do not read the free-text `m` map, and are not
  // called from anywhere yet (no roller, no UI, no save/load references them). They exist so
  // Phase 3's debug UI and Phase 4's shadow-mode comparison have something to call. Behaviour
  // of the sheet is unchanged by this phase — these functions are simply unreachable from any
  // existing code path.
  //
  // All four are pure: same (skillName, rank) in, same value out, no side effects. All four
  // treat "rank" as "current Skill Rank" and apply every mastery threshold <= rank (mastery
  // abilities are cumulative — a Rank 7 Kenjutsu has BOTH the Rank 3 and Rank 7 bonuses).
  // An unknown skill name, or a skill with no structured fields at all, yields the same
  // "no bonus" zero-value result a skill legitimately having no bonus would — callers don't
  // need to branch on "does this skill have structured mastery at all".

  // Returns the raw structured-mastery sub-object for a skill (or null fields if none exists),
  // without resolving anything for a specific rank. Callers wanting resolved values for a rank
  // should use getDamageBonus/getExplosionThreshold/getReductionModifier below instead — this
  // is the shared lookup those three build on, exposed separately since Phase 3's "Show
  // Structured Mastery" debug button needs to display the whole raw shape, thresholds included.
  function getStructuredMastery(skillName){
    const skill = findSkill(skillName);
    if(!skill) return { dmgBonus:null, explodeOn:null, reductionMod:null };
    return {
      dmgBonus: skill.dmgBonus || null,
      explodeOn: skill.explodeOn || null,
      reductionMod: skill.reductionMod || null,
    };
  }
  // Sums every dmgBonus threshold at or below `rank` (mastery bonuses stack cumulatively —
  // see Ninjutsu 3+7 = +1k1 total). Returns {roll:0, keep:0} — not null — when the skill has
  // no dmgBonus field or `rank` doesn't reach any threshold, so callers can always add the
  // result directly onto a dice pool without a null check.
  function getDamageBonus(skillName, rank){
    const skill = findSkill(skillName);
    const out = { roll:0, keep:0 };
    if(!skill || !skill.dmgBonus) return out;
    rank = parseInt(rank||0,10);
    Object.keys(skill.dmgBonus).forEach(thresholdKey=>{
      const threshold = parseInt(thresholdKey,10);
      if(rank >= threshold){
        const bonus = skill.dmgBonus[thresholdKey];
        out.roll += bonus.roll||0;
        out.keep += bonus.keep||0;
      }
    });
    return out;
  }
  // Returns the LOWEST explodeOn threshold value unlocked at or below `rank` (a lower value is
  // strictly more generous — dice explode on more results), or null if no explodeOn threshold
  // is unlocked (meaning "no change from the default explode-on-10 behaviour" — this function
  // does not assume or return 10 itself, since whether dice explode at all/on 10 by default is
  // the roller's concern, not this helper's).
  function getExplosionThreshold(skillName, rank){
    const skill = findSkill(skillName);
    if(!skill || !skill.explodeOn) return null;
    rank = parseInt(rank||0,10);
    let lowest = null;
    Object.keys(skill.explodeOn).forEach(thresholdKey=>{
      const threshold = parseInt(thresholdKey,10);
      if(rank >= threshold){
        const value = skill.explodeOn[thresholdKey];
        if(lowest===null || value < lowest) lowest = value;
      }
    });
    return lowest;
  }
  // Sums every reductionMod threshold at or below `rank` (signed — Heavy Weapons 3 is -2,
  // meaning the target's Reduction is treated as 2 LOWER). Returns 0, not null, when the skill
  // has no reductionMod field or rank doesn't reach any threshold, so callers can always add
  // the result directly onto a Reduction value without a null check.
  function getReductionModifier(skillName, rank){
    const skill = findSkill(skillName);
    if(!skill || !skill.reductionMod) return 0;
    rank = parseInt(rank||0,10);
    let total = 0;
    Object.keys(skill.reductionMod).forEach(thresholdKey=>{
      const threshold = parseInt(thresholdKey,10);
      if(rank >= threshold) total += skill.reductionMod[thresholdKey];
    });
    return total;
  }
  // ---- END PHASE 2 additions --------------------------------------------------------------
  (function buildSkillQuickAdd(){
    const sel = document.getElementById('skillQuickAdd');
    const cats = ['High','Bugei','Weapon','Weapon (Low)','Merchant','Low'];
    let html = '<option value="">— choose a skill to add —</option>';
    cats.forEach(cat=>{
      const items = SKILL_LIBRARY.filter(s=>s.cat===cat);
      if(!items.length) return;
      html += `<optgroup label="${escAttr(cat)}">`;
      items.forEach(s=>{ html += `<option value="${escAttr(s.name)}">${escAttr(s.name)} (${escAttr(s.trait)})</option>`; });
      html += '</optgroup>';
    });
    sel.innerHTML = html;
    sel.addEventListener('change', ()=>{
      const lib = findSkill(sel.value);
      if(lib){
        document.getElementById('skillsBody').appendChild(makeSkillRow({name: lib.name, trait: lib.trait, rank:0, emph:''}));
        recalcAll();
        setStatus(`Added ${lib.name}.`);
      }
      sel.value = '';
    });
  })();
