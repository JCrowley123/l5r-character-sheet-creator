  // ---------- Family bonuses (+1 Trait granted by choice of family) ----------
  const FAMILY_LIBRARY = {
    'Crab': [['Hida','Strength'],['Hiruma','Agility'],['Kaiu','Intelligence'],['Kuni','Intelligence'],['Toritaka','Perception'],['Yasuki','Awareness']],
    'Crane': [['Asahina','Intelligence'],['Daidoji','Stamina'],['Doji','Awareness'],['Kakita','Agility']],
    'Dragon': [['Kitsuki','Awareness'],['Mirumoto','Agility'],['Tamori','Willpower'],['Togashi','Reflexes'],['Hoshi','Void'],['Hitomi','Strength']],
    'Lion': [['Akodo','Agility'],['Ikoma','Awareness'],['Kitsu','Intelligence'],['Matsu','Strength']],
    'Phoenix': [['Agasha','Perception'],['Asako','Awareness'],['Isawa','Willpower'],['Shiba','Perception']],
    'Scorpion': [['Bayushi','Agility'],['Shosuro','Awareness'],['Soshi','Intelligence'],['Yogo','Willpower']],
    'Spider': [['Chuda','Intelligence'],['Daigotsu','Stamina'],['Goju','Agility'],['Spider Monks','Reflexes']],
    'Unicorn': [['Horiuchi','Willpower'],['Ide','Perception'],['Iuchi','Intelligence'],['Moto','Agility'],['Shinjo','Reflexes'],['Utaku','Stamina']],
    'Imperial': [['Miya','Reflexes'],['Otomo','Intelligence'],['Seppun','Agility'],['Hantei','Void'],['Toturi','Willpower'],['Nasu','Awareness']],
    'Ronin': [['Kaeru','Awareness'],['Tsi','Willpower'],['Tsume','Reflexes'],['Yotsu','Intelligence']],
  };

  // ---------- Minor Clan → Family bonuses ----------
  // Second-layer lookup used only when the Clan dropdown is set to the synthetic "Minor Clan"
  // option: keyed by Minor Clan name (Badger, Bat, ...), each holding the same [name, trait]
  // pair shape as FAMILY_LIBRARY above, so refreshFamilyOptions()/Apply Family can treat a
  // selected Minor Clan exactly like a major Clan once its Family list is resolved.
  // Source: http://magicalsamurai.wikidot.com/families
  const MINOR_CLAN_LIBRARY = {
    'Badger':    [['Ichiro','Strength']],
    'Bat':       [['Komori','Intelligence']],
    'Boar':      [['Heichi','Willpower']],
    'Dragonfly': [['Tonbo','Awareness']],
    'Falcon':    [['Toritaka','Perception']],
    'Fox':       [['Kitsune','Willpower']],
    'Hare':      [['Usagi','Awareness'],['Ujina','Agility']],
    'Mantis':    [['Kitsune','Awareness'],['Moshi','Intelligence'],['Tsuruchi','Perception'],['Yoritomo','Stamina']],
    'Monkey':    [['Toku','Stamina'],['Fuzake','Perception']],
    'Oriole':    [['Tsi','Strength']],
    'Ox':        [['Morito','Stamina']],
    'Snake':     [['Chuda','Strength']],
    'Sparrow':   [['Suzume','Awareness']],
    'Tortoise':  [['Kasuga','Perception']],
  };

  // ---------- School library — core "Basic Schools" from the rulebook ----------
  // benefit = trait raised +1; skills = starting School Skill list (as printed; "any one X skill" entries
  // are placeholders for you to choose); honor = starting Honor Rank; outfit = starting gear list.
  // Technique NAMES only are included for reference — full technique text isn't reproduced here,
  // check your rulebook (or the school's sourcebook) for the exact rules text.
  //
  // Optional Kiho-related fields, understood on any School entry here and (once it exists) on
  // any Alternate Path entry, so that adding a sixth or seventh instance stays pure data entry:
  //   brotherhood:true       A Brotherhood of Shinsei School. This is the ONLY flag that earns
  //                          the "Playing a Monk" framework (Core Rulebook p.231) and the 1x
  //                          Kiho rate. It must never be set on a Clan [Monk] School — see the
  //                          long note at kihoAcquisition().
  //   grantsKiho:<n>         Technique text that hands the character Kiho outright.
  //   grantsExemptFromCap    Those granted Kiho do not count against the known-Kiho cap, which
  //                          every source that grants them says explicitly.
  //   banKihoRings:[...]     Kiho this School/Path may never learn, by Ring...
  //   banKihoTypes:[...]     ...or by Type. Both feed the single mechanism in kihoExclusions().
  //   activationCostOverride Character-wide change to what activating a Kiho COSTS (e.g. Dark
  //                          Paragons Rank 3 allows Honor or Taint in place of a Void Point).
  //                          Distinct from a Kiho's own `activation` field: this one is
  //                          per-character and permissive, that one is per-Kiho and restrictive.
  // Five known grantsKiho instances are catalogued but NOT yet implemented, because
  // implementing Technique text is out of scope for this pass: Kuni Witch-Hunter Rank 4 (The
  // Great Clans p.40), Asako Inquisitors Rank 1 (The Great Clans, Phoenix chapter), Dark
  // Paragons Ranks 1 and 3 (Emerald Empire p.207, 2 Kiho each), First Dawn Scholars (Imperial
  // Histories 2 p.29), and Dark Path Sohei (Strongholds of the Empire p.93) — the last being
  // an Alternate Path rather than a School, which is why these fields belong on both libraries.
  const SCHOOL_LIBRARY = {
    'Crab': [
      {name:'Hida Bushi', benefit:'Stamina', skills:'Athletics, Defense, Heavy Weapons (Tetsubo), Intimidation, Kenjutsu, Lore: Shadowlands, any one Bugei Skill', honor:3.5, outfit:'Light or Heavy Armor, Sturdy Clothing, Daisho, Heavy Weapon or Polearm, Traveling Pack, 3 koku', tech:['The Way of the Crab','The Mountain Does Not Move','Two Pincers One Mind','Devastating Blow','The Mountain Does Not Fall']},
      {name:'Hida Pragmatist [Bushi]', benefit:'Agility', skills:'Athletics, Defense, Jiujutsu (Improvised Weapons) 2, Kenjutsu, Lore: Shadowlands, any one Bugei Skill', honor:2.5, outfit:'Light or Heavy Armor, Sturdy Clothing, Daisho, Heavy Weapon or Polearm, Traveling Pack, 3 koku', tech:['The Eternal Stone Unleashed','Wearing Down the Mountain','Fury of the Avalanche','Stone Turns Steel Aside','Fight to the End']},
      {name:'Hiruma Bushi', benefit:'Willpower', skills:'Athletics, Hunting, Kenjutsu (Katana), Kyujutsu, Lore: Shadowlands, Stealth, any one Skill', honor:4.5, outfit:'Ashigaru or Light Armor, Sturdy Clothing, Daisho, Bow with 20 Arrows or Knife, Traveling Pack, 3 koku', tech:['Torch\u2019s Flame Flickers','Wolf\u2019s Little Lesson','Hummingbird Wings','Shark Smells Blood','Daylight Wastes No Movement']},
      {name:'Kaiu Engineer [Artisan/Bushi]', benefit:'Intelligence', skills:'Battle, Craft: Armorsmithing, Craft: Weaponsmithing, Defense, Engineering, Lore: Architecture, War Fans', honor:4.5, outfit:'Light or Heavy Armor, Sturdy Clothing, Daisho, Heavy Weapon or War Fan, Traveling Pack, 3 koku', tech:['The Kaiu Method','The Path of Stone','The Path of the Shell','The Path of War','The Path of Steel']},
      {name:'Kuni Shugenja', benefit:'Willpower', skills:'Calligraphy (Cipher), Defense, Lore: Shadowlands 2, Lore: Theology, Spellcraft, any one Weapon Skill', honor:2.5, outfit:'Robes, Wakizashi, Knife, Scroll Satchel, Traveling Pack, 3 koku', tech:['Gaze Into Shadow'], shugenja:true, affinity:'Earth', deficiency:'Air'},
      {name:'Kuni Witch-Hunter [Monk]', benefit:'Willpower', skills:'Investigation, Jiujutsu, Kenjutsu, Lore: Shadowlands, Lore: Maho, Meditation, any one Skill', honor:5.5, outfit:'Rugged Clothing, Daisho, Knife, Jade Pendant, Traveling Pack, 3 koku', tech:['To See the Darkness','To Ride the Darkness','To Strike the Darkness','To Repel the Darkness','To Shatter the Darkness']},
      {name:'Toritaka Bushi', benefit:'Strength', skills:'Animal Handling (Falcons), Hunting 2, Kenjutsu, Etiquette, Lore: Spirit Realms, Spears, any one Skill', honor:5.5, outfit:'Light Armor, Sturdy Clothing, Daisho, any 1 weapon, Traveling Pack, 3 koku', tech:['The Falcon\u2019s Eyes','The Falcon Takes Flight','The Falcon\u2019s Wings','Vigilant and Strong','Claws of the Falcon']},
      {name:'Yasuki Courtier', benefit:'Perception', skills:'Commerce (Appraisal), Courtier, Defense, Etiquette, Intimidation, Sincerity (Deceit), any one Merchant Skill', honor:2.5, outfit:'Traditional Clothing, Wakizashi, Knife, Calligraphy Set, Traveling Pack, 5 koku', tech:['The Way of the Carp','Do As We Say','Treasures of the Carp','Wiles of the Carp','What is Yours is Mine']},
    ],
    'Crane': [
      {name:'Asahina Shugenja', benefit:'Awareness', skills:'any one Artisan Skill, Calligraphy (Cipher), Etiquette, Lore: Theology, Meditation, Spellcraft, any one High Skill', honor:6.5, outfit:'Robes, Bo, Wakizashi, Scroll Satchel, Traveling Pack, 10 koku', tech:['The Soul\u2019s Grace'], shugenja:true, affinity:'Air', deficiency:'Fire'},
      {name:'Daidoji Iron Warrior [Bushi]', benefit:'Agility', skills:'Battle, Defense 2, Iaijutsu, Kenjutsu (Katana), Kyujutsu, any one Skill', honor:6.5, outfit:'Light or Heavy Armor, Sturdy Clothing, Daisho, Heavy Weapon or Polearm, Traveling Pack, 10 koku', tech:['The Force of Honor','The Shield of Faith','Strike Beneath the Veil','Vigilance of Mind','To Tread on the Sword']},
      {name:'Daidoji Scout [Bushi]', benefit:'Reflexes', skills:'Athletics, Hunting (Traps), Kenjutsu, Knives, Kyujutsu (Yumi), Stealth (Sneaking), any 1 Bugei or Low Skill', honor:3.5, outfit:'Light or Ashigaru Armor, Rugged Clothing, Daisho, Bow, Knife, any 1 weapon, Trap-making Gear, Camouflage Face-paint, Traveling Pack, 5 koku', tech:['Surveying the Land','Scouring the Shadows','Weaken the Resistance','Strike and Move','Cunning of Daidoji']},
      {name:'Doji Courtier', benefit:'Awareness', skills:'Calligraphy, Courtier (Manipulation), Etiquette (Courtesy), Perform: Storytelling, Sincerity, Tea Ceremony, any one Artisan or Perform skill', honor:6.5, outfit:'Extravagant Clothing, Wakizashi, any 1 weapon, Calligraphy Set, Traveling Pack, 10 koku', tech:['The Soul of Honor','Speaking in Silence','The Perfect Gift','Voice of Honor','The Gift of the Lady']},
      {name:'Doji Magistrate [Bushi]', benefit:'Reflexes', skills:'Defense, Horsemanship, Jiujutsu, Kenjutsu, Knives (Jitte), Polearms, any High or Bugei Skill', honor:5.5, outfit:'Light Armor, Sturdy Clothing, Daisho, any 1 weapon (or 2 Knives), Traveling Pack, 10 koku', tech:['Temper Steel With Honor','Flowing Like Water','Breath of the Law','Flowing Like Air','The Willow in the Storm']},
      {name:'Kakita Bushi', benefit:'Reflexes', skills:'Etiquette, Iaijutsu (Focus), Kenjutsu, Kyujutsu, Sincerity, Tea Ceremony, any one Bugei or High Skill', honor:6.5, outfit:'Light Armor, Sturdy Clothing, Daisho, any 1 weapon, Traveling Pack, 10 koku', tech:['The Way of the Crane','Speed of Lightning','First and Last Strike','One Strike Two Cuts','Strike With No Thought']},
      {name:'Kakita Artisan', benefit:'Awareness', skills:'Courtier, Games: Sadane, Etiquette, Sincerity, any 3 skills from Acting/Artisan/Perform', honor:5.5, outfit:'Court Robes, Beautiful Clothing, Wakizashi, Art supplies, Fan, Steed (Rokugan pony), Traveling Pack, 10 koku', tech:['Soul of the Artisan','The Soul\u2019s Dream','Free the Spirit','Undying Name','A Gift Beyond Price']},
    ],
    'Dragon': [
      {name:'Kitsuki Investigator [Courtier]', benefit:'Perception', skills:'Courtier, Etiquette (Courtesy), Investigation (Interrogation), Kenjutsu, Meditation, Sincerity, any one Lore Skill', honor:5.5, outfit:'Traditional Clothing, Wakizashi, Knife, Calligraphy Set, Traveling Pack, 5 koku', tech:['Kitsuki\u2019s Method','Wisdom the Wind Brings','Know the Rhythm of the Heart','Finding the Path','The Eyes Betray the Heart']},
      {name:'Mirumoto Bushi', benefit:'Stamina', skills:'Defense, Iaijutsu, Kenjutsu (Katana), Lore: Shugenja, Meditation, Theology, any one Bugei or High Skill', honor:4.5, outfit:'Light Armor, Sturdy Clothing, Daisho, any 1 weapon, Traveling Pack, 5 koku', tech:['Way of the Dragon','The Calm in Midst of Thunder','Strong and Swift','Furious Retaliation','Heart of the Dragon']},
      {name:'Mirumoto Taoist Swordsman [Bushi]', benefit:'Void', skills:'Athletics, Defense, Iaijutsu, Kenjutsu (Katana), Lore: Theology, Meditation, any 1 Bugei or High Skill', honor:5.5, outfit:'Sturdy Clothing, Katana, Wakizashi, Tanto, Traveling Pack, 1 koku', tech:['Aligned With the Elements','Fist and Blade','Strike of Harmony','Master of Steel','Balance of Nothingness']},
      {name:'Tamori Shugenja', benefit:'Stamina', skills:'Athletics, Calligraphy (Cipher), Defense, Divination, Lore: Theology, Medicine, Spellcraft', honor:4.5, outfit:'Robes, Wakizashi, any 1 weapon, Scroll Satchel, Traveling Pack, 5 koku', tech:['Flesh of the Elements'], shugenja:true, affinity:'Earth', deficiency:'Air'},
      {name:'The Togashi Tattooed Order [Monk]', tags:['tattooed order'], benefit:'Void', skills:'Athletics, Artisan: Tattooing, Defense, Jiujutsu, any one Lore Skill, Meditation, any one non-Low Skill', honor:4.5, outfit:'Robes, Bo, Traveling Pack, 5 koku', tech:['Blood of the Kami','Body of Stone','Blessing of the Kami','Will of Stone','Touch of the Kami']},
      // The one Dragon School that is mechanically a Brotherhood School. Its own Special
      // clause (Imperial Histories p.214) reads: "Though the Tsurui Zumi is a Dragon affiliated
      // School, mechanically this School is treated as a Brotherhood of Shinsei School (as
      // described on page 231 in the L5R 4th Edition Core Rulebook)." Its Technique then adds
      // that the character begins with two Kiho and "may purchase additional Kiho normally as
      // per the rules for a Brotherhood of Shinsei monk".
      //
      // This entry was verified field-for-field against Imperial Histories pp.214-215 - benefit,
      // skills, Honor, Outfit and the single Technique name all match exactly. So the fact that
      // it carries ONE Technique where every other five-Rank School carries five is CORRECT and
      // not a data gap: this School genuinely has one flat Technique, like a Brotherhood School.
      // Do not "fix" it by inventing four more.
      //
      // It stays here under Dragon rather than moving to BROTHERHOOD_SCHOOL_LIBRARY, because it
      // is still a Dragon-affiliated School picked through the Dragon Clan - only its mechanics
      // are Brotherhood. brotherhood:true is what earns it the 1x Kiho rate, the Void Point
      // exemption, and the p.231 creation deltas; startingKiho:2 overrides p.231's three, which
      // its own text explicitly does.
      //
      // Note the deliberate consequence: this School's Trait benefit is +1 Void AND the monk
      // baseline is Void 3, so a Tsurui Zumi character starts at VOID 4. That is the two rules
      // composed literally, and it needs no special case - it is simply what the existing code
      // does. It is called out here because Void 4 at creation is strong and looks like a bug.
      //
      // devotion is null rather than absent: the source names no Devotion for this School, and
      // Phase 6's Devotion-filtered Path matching must read devotion.type and find null, not
      // trip over a missing field. Its Tattoos (one at creation, one more at School Rank 4) are
      // Tattooed-Order machinery that this feature deliberately does not model - see the
      // Technique text in TECH_DESCRIPTIONS, which records them for the player.
      {name:'The Hoshi Tsurui Zumi Order [Monk]', tags:['tattooed order'], benefit:'Void', skills:'Athletics, Defense, Etiquette, Jiujutsu, Meditation (Void Recovery), any 2 Skills', honor:4.5, outfit:'Robes, Bo, Traveling Pack, 2 koku', tech:['Swift Fist, Subtle Heart'], monk:true, brotherhood:true, startingKiho:2, devotion:{type:null, fortune:null}},
      {name:'The Hitomi Kikage Zumi Order [Monk]', tags:['tattooed order'], benefit:'Reflexes', skills:'Athletics, Defense, Jiujutsu, Lore (choose one), Meditation, any 2 Non-Low Skills', honor:4.5, outfit:'Sturdy Clothing, Traveling Pack, 4 koku', tech:['The Gift of the Lady','Strike the Base','Moving the Wind','Strike the Center','Strike the Summit']},
    ],
    'Lion': [
      {name:'Akodo Bushi', benefit:'Perception', skills:'Battle (Mass Combat), Defense, Kenjutsu, Kyujutsu, Lore: History, Sincerity, any one Bugei or High Skill', honor:6.5, outfit:'Light Armor, Sturdy Clothing, Daisho, any 1 weapon, Traveling Pack, 5 koku', tech:['The Way of the Lion','Strength of Purity','Strength of My Ancestors','Triumph Before Battle','Akodo\u2019s Final Lesson']},
      {name:'Ikoma Bard [Courtier]', benefit:'Intelligence', skills:'Courtier, Etiquette, Lore: History (Lion Clan), Perform: Storytelling, Sincerity (Honesty), any one High Skill, any one Bugei Skill', honor:6.5, outfit:'Traditional Clothing, Wakizashi, Knife, Calligraphy Set, Traveling Pack, 5 koku', tech:['The Herald of Glory','The Heart of the Lion','The Voice of the Ancestors','The Strength of Tradition','Every Lion is Your Brother']},
      {name:'Ikoma Lion\u2019s Shadow [Bushi]', benefit:'Awareness', skills:'Courtier, Etiquette, Kenjutsu, Investigation (Notice), Sincerity, Stealth, any 1 High or Low Skill', honor:3.5, outfit:'Traditional Clothing, Daisho, any 1 weapon, Calligraphy Set, Traveling Pack, 5 koku', tech:['No Boundaries','The Lion Cannot Fail','The Spirit of Ikoma','The Quiet Lion\u2019s Claws','Ferocious Determination']},
      {name:'Kitsu Shugenja', benefit:'Perception', skills:'Battle, Calligraphy (Cipher), Etiquette, Lore: History, Lore: Theology, Spellcraft, any one High or Bugei Skill', honor:6.5, outfit:'Robes, Wakizashi, Knife, Scroll Satchel, Traveling Pack, 5 koku', tech:['Eyes of the Ancestors'], shugenja:true, affinity:'Water', deficiency:'Fire'},
      {name:'Lion Elite Spearmen [Bushi]', benefit:'Reflexes', skills:'Battle, Defense, Kenjutsu, Lore: History, Polearms, Spears (Magari-Yari), any one Bugei or High Skill', honor:5.5, outfit:'Normal clothing, daisho, ten nage-yari, spear (magari-yari), any one other spear or polearm, light or ashigaru armor, traveling pack, 5 koku', tech:['The Way of Magari-Yarijutsu','Strike Like The Lion','Strike Through the Eagle','Strike Like the Wind','Strike With the Soul']},
      {name:'Matsu Beastmaster [Bushi]', benefit:'Agility', skills:'Animal Handling 2, Battle, Defense, Iaijutsu, Kenjutsu, any 1 Bugei Skill', honor:5.5, outfit:'Light Armor, Sturdy Clothing, Daisho, any 1 weapon, Traveling Pack, 4 koku', tech:['One with the Pride','Heart of the Beast','The Ferocity Within','All as One','With the Soul of a Lion']},
      {name:'Matsu Berserker [Bushi]', benefit:'Strength', skills:'Battle, Jiujutsu, Kenjutsu (Katana), Kyujutsu, Lore: History, any two Bugei Skills', honor:6.5, outfit:'Light or Heavy Armor, Sturdy Clothing, Daisho, Heavy Weapon or Polearm, Traveling Pack, 5 koku', tech:['The Lion\u2019s Roar','Matsu\u2019s Fury','The Lion\u2019s Charge','Matsu\u2019s Courage','The Lion\u2019s Victory']},
    ],
    'Phoenix': [
      {name:'Agasha Shugenja', benefit:'Intelligence', skills:'Calligraphy (Cipher), any one Craft Skill, Defense, Etiquette, Lore: Theology, Spellcraft, any one High or Bugei Skill', honor:4.5, outfit:'Robes, Wakizashi, any 1 weapon, Scroll Satchel, Traveling Pack, 5 koku', tech:['Elements of All Things'], shugenja:true, affinity:'Fire', deficiency:'Water'},
      {name:'Asako Henshin [Monk]', benefit:'Willpower', skills:'Calligraphy, Jiujutsu, Lore: Elements, Lore: Theology, Meditation 2, any 1 Skill (not Low)', honor:5.5, outfit:'Robes, Bo, Scroll Satchel, Traveling Pack, 5 koku', tech:['The Four Mysteries','The Riddle of Earth','The Riddle of Air','The Riddle of Fire','The Riddle of Water']},
      {name:'Asako Loremaster [Courtier]', benefit:'Intelligence', skills:'Courtier, Etiquette (Courtesy), Lore: History, Lore: Theology (Fortunes), Meditation, Sincerity, any Lore Skill', honor:6.5, outfit:'Sensible Clothing, Wakizashi, Calligraphy Set, Traveling Pack, 5 koku', tech:['Temple of the Soul','From the Ashes','Voice of the Universe','Invincible Mind','Wisdom of the Ages']},
      {name:'Isawa Shugenja', benefit:'Intelligence', skills:'Calligraphy (Cipher), Lore: Theology, any one Lore Skill, Medicine, Meditation, Spellcraft, any one High Skill', honor:4.5, outfit:'Robes, Wakizashi, any 1 weapon, Scroll Satchel, Traveling Pack, 5 koku', tech:['Isawa\u2019s Gift'], shugenja:true, affinityChoice:true},
      {name:'Shiba Artisan [Courtier]', benefit:'Intelligence', skills:'Artisan (pick 2), Calligraphy, Etiquette, Lore (pick 1), Sincerity, any 1 High or Bugei Skill', honor:4.5, outfit:'Sensible Clothing, Wakizashi, tools for chosen specialty, Traveling Pack, 5 koku', tech:['Soul of Brilliance','The Way of Sincerity','The Art Speaks','Bounty of the Craft','The Touch of Destiny']},
      {name:'Shiba Bushi', benefit:'Agility', skills:'Defense, Kenjutsu, Kyujutsu, Meditation (Void Recovery), Spears, Theology, any one Bugei or High Skill', honor:5.5, outfit:'Light Armor, Sturdy Clothing, Daisho, any 1 weapon, Traveling Pack, 5 koku', tech:['The Way of the Phoenix','Dancing With the Elements','One With the Void','Move With the World','Touch of the Void']},
    ],
    'Scorpion': [
      {name:'Bayushi Bushi', benefit:'Intelligence', skills:'Courtier (Manipulation), Defense, Etiquette, Iaijutsu, Kenjutsu, Sincerity, any one Skill', honor:2.5, outfit:'Light Armor, Sturdy Clothing, Daisho, any 1 weapon, Traveling Pack, 5 koku', tech:['The Way of the Scorpion','Pincers and Tail','Strike at the Tail','Strike From Above Strike From Below','The Pincers Hold, The Tail Strikes']},
      {name:'Bayushi Courtier', benefit:'Awareness', skills:'Calligraphy, Courtier (Gossip), Etiquette, Investigation, Sincerity (Deceit), Temptation, any one High skill', honor:2.5, outfit:'Extravagant Clothing, Wakizashi, any 1 weapon, Calligraphy Set, Traveling Pack, 5 koku', tech:['Weakness is My Strength','Shallow Waters','Secrets are Birthmarks','Scrutiny\u2019s Sweet Sting','No More Masks']},
      {name:'Shosuro Actor [Ninja]', benefit:'Awareness', skills:'Acting, Etiquette, Knives, Meditation, Sincerity (Deceit), Stealth, any 1 High or Low Skill', honor:1.5, outfit:'Fine Clothing, Assorted Costumes and Disguises, Knife, Traveling Pack, 10 koku', tech:['The First Face','The Subtle Sting','The Second Face','The Viper\u2019s Kiss','The Third Face']},
      {name:'Shosuro Infiltrator [Ninja]', benefit:'Reflexes', skills:'Acting, Athletics, Ninjutsu, Sincerity, Stealth (Sneaking) 2, any one Skill', honor:1.5, outfit:'Ashigaru or Light Armor, Sturdy Black Clothing, Daisho, Bow or Knife, Traveling Pack, 5 koku', tech:['The Path of Shadows','Strike From Darkness','Steel Within Silk','Whisper of Steel','The Final Silence']},
      {name:'Soshi Magistrate [Bushi]', benefit:'Agility', skills:'Athletics, Defense, Intimidation (Control), Jiujutsu, Kenjutsu, Lore: Underworld, any Bugei Skill', honor:2.5, outfit:'Light Armor, Sturdy Clothing, Daisho, any 1 weapon, Traveling Pack, 5 koku', tech:['The Face of Justice','Rise to Meet the Challenge','The Magistrate\u2019s Cut','Certainty of Purpose','Relentless Resolve']},
      {name:'Soshi Shugenja', benefit:'Awareness', skills:'Calligraphy (Cipher), Courtier, Etiquette, Lore: Theology, Spellcraft, Stealth, any 1 Skill', honor:2.5, outfit:'Robes, Wakizashi, Knife, Scroll Satchel, Traveling Pack, 5 koku', tech:['The Kami\u2019s Whisper'], shugenja:true, affinity:'Air', deficiency:'Earth'},
      {name:'Yogo Wardmaster [Shugenja]', benefit:'Intelligence', skills:'Calligraphy (Cipher), Etiquette, Investigation, Lore: Theology, Spellcraft, Stealth, any 1 High or Low Skill', honor:1.5, outfit:'Robes, Wakizashi, Knife, Scroll Satchel, Traveling Pack, pack of twenty paper wards, 3 koku', tech:['Way of the Wardmaster'], shugenja:true, keywordAffinity:'Wards', keywordDeficiency:['Travel','Craft']},
    ],
    'Unicorn': [
      {name:'Horiuchi Shugenja', benefit:'Stamina', skills:'Calligraphy, Craft: Meishodo, Defense, Lore: Theology, Meditation, Spellcraft (Spell Research), any 1 High or Bugei Skill', honor:4.5, outfit:'Robes, Wakizashi, Knife, Scroll/Amulet Satchel, Traveling Pack, 4 koku', tech:['Mysteries of Meishodo'], shugenja:true, affinity:'Earth', deficiency:'Air'},
      {name:'Ide Emissary [Courtier]', benefit:'Awareness', skills:'Calligraphy, Commerce, Courtier, Etiquette (Conversation), Horsemanship, Sincerity (Honesty), any one High or Perform skill', honor:5.5, outfit:'Extravagant Clothing, Wakizashi, any 1 weapon, Calligraphy Set, Traveling Pack, 10 koku', tech:['The Heart Speaks','Piercing the Veils','The Heart Listens','Answering the Heart','The Immovable Hand of Peace']},
      {name:'Iuchi Shugenja', benefit:'Perception', skills:'Battle, Calligraphy (Cipher), Horsemanship, Lore: Theology, Meditation, Spellcraft, any one High or Bugei Skill', honor:5.5, outfit:'Extravagant clothing, wakizashi, Scroll Satchel, any 1 weapon, Calligraphy Set, Traveling Pack, Horse, 10 koku', tech:['Spirit of the Wind'], shugenja:true, affinity:'Water', deficiency:'Fire'},
      {name:'Moto Bushi', benefit:'Strength', skills:'Athletics, Defense, Horsemanship, Hunting, Kenjutsu (Scimitar), any one Bugei Skill, any one Skill', honor:3.5, outfit:'Riding or Heavy Armor, Sturdy Clothing, Daisho, Heavy Weapon or Polearm, Traveling Pack, Horse, 10 koku, any one weapon', tech:['The Way of the Unicorn','Shinsei\u2019s Smile','Desert Wind Strike','The Charge of Madness','Moto Cannot Yield']},
      {name:'Moto Death Priest [Shugenja]', benefit:'Willpower', skills:'Athletics, Horsemanship, Hunting, Lore: Theology, Meditation, Spellcraft, any 1 Skill', honor:3.5, outfit:'Sturdy Traveling Clothing, Wakizashi, any 1 weapon, Traveling Pack, Horse, 5 koku', tech:['Blessings of the Shi-Tien Yen-Wang'], shugenja:true, affinity:'Earth', deficiency:'Air'},
      {name:'Moto Vindicator [Bushi]', benefit:'Willpower', skills:'Horsemanship, Hunting, Investigation (Notice), Kenjutsu, Kyujutsu, Lore: Shadowlands, any 1 Bugei Skill', honor:3.5, outfit:'Heavy Armor, Sturdy Clothing, Daisho, any 1 Weapon, Traveling Pack, Riding Horse, 5 koku', tech:['Purity of the Breath','Facing the Dark Within','Justice of Our Ancestors','Avenging Our Own','Bloodied but Unbowed']},
      {name:'Shinjo Bushi', benefit:'Agility', skills:'Athletics, Defense, Horsemanship 2, Kenjutsu, Kyujutsu, any 1 Skill', honor:4.5, outfit:'Ashigaru or Light Armor, Sturdy Clothing, Daisho, Bow, Knife, Traveling Pack, Horse, 10 koku', tech:['The Way of the Ki-Rin','Dance of the Blade','The Four Winds Strike','Spirit of the Blade Unleashed','Dancing With the Fortunes']},
      {name:'Utaku Battle Maiden [Bushi]', benefit:'Reflexes', skills:'Battle, Defense, Horsemanship 2, Kenjutsu, Sincerity, any one High or Bugei Skill', honor:6.5, outfit:'Light or Riding Armor, Sturdy Clothing, Daisho, any 1 weapon, Traveling Pack, Horse, 10 koku', tech:['Riding in Harmony','The Void of War','Sensing the Breeze','Wind Never Stops','Otaku\u2019s Blessing']},
      {name:'Utaku Mounted Infantry [Bushi]', benefit:'Agility', skills:'Athletics, Battle, Defense, Kenjutsu, Polearms, Spears, any one Bugei or High Skill', honor:5.5, outfit:'Normal clothing, daisho, any one spear or polearm, light armor, steed, traveling pack, 5 koku', tech:['Choose Your Weapon','Speed of My Sisters','All-Fronts Attack','Utaku\u2019s Thunder','Epic of My Name']},
    ],
    'Spider': [
      {name:'Chuda Shugenja', benefit:'Willpower', skills:'Calligraphy (Cipher), Hunting, Lore: Maho, Lore: Shadowlands, Spellcraft, Stealth, any one Skill', honor:0.5, outfit:'Robes, Wakizashi, Knife, Scroll Satchel, Traveling Pack, 3 koku', tech:['Blood Like Water'], shugenja:true, keywordAffinity:'Maho', elementDeficiencyChoice:true, elementDeficiencyExcludesKeyword:'Maho'},
      {name:'Daigotsu Bushi', benefit:'Strength', skills:'Hunting, Intimidation, Jiujutsu, Kenjutsu (Katana), Kyujutsu, Lore: Shadowlands, any one Bugei or Low Skill', honor:1.5, outfit:'Light Armour, Sturdy Clothing, Daisho, any 1 weapon, Traveling Pack, 3 koku', tech:['The Way of the Spider','Aura of Blood','Ashura\u2019s Wing','Devouring Wrath','Inhuman Assault']},
      {name:'Daigotsu Courtier', benefit:'Perception', skills:'Acting, Courtier (Manipulation), Etiquette, Meditation, Sincerity (Deceit), Temptation, any one High Skill', honor:1.0, outfit:'Sensible Clothing, Wakizashi, Calligraphy Set, Traveling Pack, 3 koku', tech:['Insidious Whispers','Cracks in the Wall','Darkness Cannot be Trapped','The Touch of Sin','The Embrace of Darkness']},
      {name:'Goju Ninja', benefit:'Agility', skills:'Athletics, Kenjutsu, Ninjutsu, Sincerity (Deceit), Stealth 2, any one Skill', honor:0.0, outfit:'Black Clothing, Ninja-to, Tanto, 6 Shuriken or Tsubute, any one weapon, 50 feet of Rope and Grapple, Traveling Pack, 1 koku', tech:['The Cloak of Night','Melting into Shadow','The Shadowed Blade','Step Within Shadow','Shadow upon the Moon']},
      {name:'Ninube Shugenja', benefit:'Awareness', skills:'Calligraphy, Knives, Sincerity (Lying), Spellcraft, Stealth 2, any Low skill', honor:0.0, outfit:'Black Clothing, Wakizashi, Knife, Scroll Satchel, Traveling Pack, 2 Koku', tech:['Mask of the Nothing'], shugenja:true, affinity:'Air', deficiency:'Earth'},
      {name:'The Order of the Spider Monks [Monk]', benefit:'Agility', skills:'Athletics, Jiujutsu 2, Lore: Theology, Meditation, Polearms, any one Skill', honor:1.5, outfit:'Light or Heavy Armour, Sturdy Clothing, any Heavy Weapon or Polearm, Traveling Pack, 3 koku', tech:['The Dark Path','Drawing in the Strike','Speed of Darkness','Guarded by Chi','Darkness Unleashed']},
    ],
    'Imperial': [
      {name:'Miya Herald [Courtier]', benefit:'Awareness', skills:'Courtier (Rhetoric), Defense, Etiquette (Courtesy), Horsemanship, Lore: Heraldry, Sincerity, any 1 High or Bugei skill', honor:6.5, outfit:'Sensible Clothing, Wakizashi, Calligraphy Set, Horse (Rokugani pony), 10 koku', tech:['Voice of the Emperor','Eyes of the Emperor','Hand of the Emperor','Blessing of the Emperor','Glory of the Emperor']},
      {name:'Otomo Courtier', benefit:'Awareness', skills:'Courtier (Manipulation), Defense, Etiquette, Intimidation (Control), Investigation, Sincerity, any 1 High Skill', honor:5.5, outfit:'Traditional Clothing, Wakizashi, Knife, Calligraphy Set, 10 Koku', tech:['The Voice of Heaven','Destiny Has No Secrets','My Master\u2019s Voice','The Emperor\u2019s Protection','The Virtues of Command']},
      {name:'Seppun Guardsman [Bushi]', benefit:'Perception', skills:'Battle, Defense, Etiquette, Iaijutsu, Kenjutsu (Katana), Kyujutsu, any 1 High Skill', honor:6.5, outfit:'Light Armor, Sturdy Clothing, Daisho, any 1 Weapon, Traveling Pack, 10 koku', tech:['Never in Darkness','The Clouds Part','Sun\u2019s Light Reveals','Speed of Heaven','Heaven Never Falls']},
      {name:'Seppun Shugenja', benefit:'Intelligence', skills:'Calligraphy, Defense, Etiquette, Investigation (Notice), Meditation, Lore: Theology, any 1 High or Bugei Skill', honor:6.5, outfit:'Robes, Wakizashi, Bo, Scroll Satchel, Traveling Pack, 10 koku', tech:['In Defense of the Throne'], shugenja:true, affinity:'Fire', deficiency:'Water'},
    ],
  };

  // ---------- Minor Clan School library ----------
  // Same shape/convention as SCHOOL_LIBRARY above, keyed by Minor Clan name (matching
  // MINOR_CLAN_LIBRARY's keys) instead of a major Clan — "Basic Schools" only, per
  // http://magicalsamurai.wikidot.com/schools-minor and .../schools-mantis (Advanced
  // Schools and Alternate Paths are intentionally omitted, matching how major Clans above
  // only list their Basic Schools too). Fuzake Shugenja has no Benefit listed on its source
  // page, so it's left as '' (grantFreeTraitBonus silently no-ops on an empty trait name).
  const MINOR_CLAN_SCHOOL_LIBRARY = {
    'Badger': [
      {name:'Ichiro Bushi', benefit:'Strength', skills:'Athletics, Commerce, Defense, Heavy Weapons, Jiujutsu, Kenjutsu (Katana), any High or Bugei skill', honor:3.5, outfit:'Light or Heavy Armor, Sturdy Clothing, Daisho, any Heavy or Polearm, Traveling Pack, 3 koku', tech:['Transcend the Mountain','Strength of the Badger','Crushing Blow','Crashing Stones','Return the Strike']},
    ],
    'Bat': [
      {name:'Komori Shugenja', benefit:'Awareness', skills:'Calligraphy (Cipher), Lore: Ancestors, Lore: Theology, Meditation, Spellcraft, Tea Ceremony, any one High Skill', honor:4.5, outfit:'Robes, Wakizashi, any 1 weapon, Scroll Satchel, Traveling Pack, 3 koku', tech:['The Kami\u2019s Whispers'], shugenja:true, affinity:'Air', deficiency:'Earth'},
    ],
    'Boar': [
      {name:'Heichi Bushi', benefit:'Strength', skills:'Athletics, Defense, Hunting, Intimidation, Kenjutsu, Spears (Mai Chong), any one Bugei Skill', honor:3.0, outfit:'Light or Heavy Armor, Sturdy Clothing, Daisho, any Spear, Traveling Pack, 3 koku', tech:['The Charge of the Boar','The Strength of Opposition','The Speed of the Boar','The Anger of the Boar','Beyond the Mountains']},
    ],
    'Dragonfly': [
      {name:'Tonbo Shugenja', benefit:'Perception', skills:'Calligraphy, Courtier, Etiquette, Meditation (Void Recovery), Sincerity, Spellcraft, any one High Skill', honor:4.5, outfit:'Robes, Wakizashi, Knife, Scroll Satchel, Traveling Pack, 3 koku', tech:['Guided by Fate'], shugenja:true, affinity:'Water', deficiency:'Fire'},
    ],
    'Falcon': [
      {name:'Toritaka Bushi', benefit:'Strength', skills:'Animal Handling (Falcons), Hunting 2, Kenjutsu, Etiquette, Lore: Spirit Realms, Spears, any one Skill', honor:5.5, outfit:'Light Armor, Sturdy Clothing, Daisho, any 1 weapon, Traveling Pack, 3 koku', tech:['The Falcon\u2019s Eyes','The Falcon Takes Flight','The Falcon\u2019s Wings','Vigilant and Strong','Claws of the Falcon']},
    ],
    'Fox': [
      {name:'Kitsune Shugenja', benefit:'Stamina', skills:'Calligraphy, Defense, Hunting, Medicine (Herbalism), Meditation, Spellcraft, any one High or Bugei skill', honor:4.5, outfit:'Robes, Wakizashi, Knife, Scroll Satchel, Traveling Pack, 3 koku', tech:['Essence of Chikushudo'], shugenja:true, affinity:'Earth', deficiency:'Air'},
    ],
    'Hare': [
      {name:'Usagi Bushi', benefit:'Reflexes', skills:'Athletics (Running), Defense, Hunting, Jiujutsu, Kenjutsu, Lore: Maho, any one High or Bugei skill', honor:4.0, outfit:'Ashigaru or Light Armor, Sturdy Clothing, Daisho, Bow (with 20 arrows) or Knife, Traveling Pack, 3 koku', tech:['Speed of the Hare','Leap of the Hare','Swift as Lightning','Kick of the Hare','Reichin\u2019s Style']},
    ],
    'Mantis': [
      {name:'Kitsune Shugenja [Mantis]', benefit:'Stamina', skills:'Calligraphy, Defense, Hunting, Medicine (Herbalism), Meditation, Spellcraft, any one High or Bugei skill', honor:4.5, outfit:'Robes, Wakizashi, Knife, Scroll Satchel, Traveling Pack, 3 koku', tech:['Essence of Chikushudo'], shugenja:true, affinity:'Earth', deficiency:'Air'},
      {name:'Mantis Brawler [Bushi]', benefit:'Agility', skills:'Athletics, Commerce, Intimidation, Jiujutsu, Knives, Sailing, any 1 Weapon Skill', honor:3.5, outfit:'Rugged Clothing, any 2 weapons, Kama, Tanto, Traveling Pack, 4 koku', tech:['Way of Drunken Fists','Drunk Loses His Sandal','Drunk Never Falls','Two Drunks Dance','Drunk Pounds a Door']},
      {name:'Moshi Shugenja', benefit:'Awareness', skills:'Calligraphy (Cipher), Divination, Lore: Theology, Meditation, Spellcraft, any two High or Bugei Skills', honor:4.5, outfit:'Robes, Wakizashi, Knife, Scroll Satchel, Traveling Pack, 10 koku', tech:['Favor of the Sun'], shugenja:true, affinity:'Air', deficiency:'Earth'},
      {name:'Tsuruchi Archer [Bushi]', benefit:'Reflexes', skills:'Athletics, Defense, Hunting, Investigation, Kyujutsu (Yumi) 2, any one Bugei or High Skill', honor:3.5, outfit:'Ashigaru or Light Armor, Sturdy Clothing, Bow and 20 arrows, Wakizashi, Traveling Pack, 10 koku', tech:['Always Be Ready','The Arrow Knows the Way','The Wasp\u2019s Sting','Flight of No-Mind','Tsuruchi\u2019s Eye']},
      {name:'Tsuruchi Bounty Hunter [Bushi]', benefit:'Agility', skills:'Athletics, Hunting (Tracking), Intimidation, Investigation, Kenjutsu, Kyujutsu, Lore: Underworld', honor:4.5, outfit:'Ashigaru or Light Armor, Sturdy Clothing, Daisho, Bow or Knife, Traveling Pack, 10 koku', tech:['A Hunter\u2019s Sense','No Prey Escapes','Justice of the Wasp','Twin Sting Strike','Eyes of the Wasp']},
      {name:'Yoritomo Bushi', benefit:'Strength', skills:'Commerce, Defense, Jiujutsu (Improved Weapons), Kenjutsu, Knives (Kama), Sailing, any one Skill', honor:3.5, outfit:'Light Armor, Sturdy Clothing, Daisho, any 1 weapon (or pair of Knives), Traveling Pack, 10 koku', tech:['The Way of the Mantis','Voice of the Storm','Strike of the Mantis','The Rolling Wave','Hand of Osano-Wo']},
      {name:'Yoritomo Courtier', benefit:'Willpower', skills:'Commerce (Appraisal), Courtier, Defense, Etiquette, Intimidation (Control), Sincerity, any one Merchant or Lore skill', honor:2.5, outfit:'Extravagant Clothing, Wakizashi, any 1 weapon, Calligraphy Set, Traveling Pack, 10 koku', tech:['Duty Before Honor','Storm Heart','Command the Winds','Will of the Storm','Strength in All Things']},
      {name:'Yoritomo Shugenja', benefit:'Perception', skills:'Athletics, Calligraphy, Knives, Lore: Theology, Meditation, Sailing (Navigation), any 1 Skill', honor:4.5, outfit:'Robes, Wakizashi, any 1 weapon, Scroll Satchel, Traveling Pack, 10 koku', tech:['Child of the Sea'], shugenja:true, affinity:'Water', deficiency:'Earth'},
    ],
    'Monkey': [
      {name:'Toku Bushi', benefit:'Willpower', skills:'Athletics, Defense, Hunting, Investigation (Search), Kenjutsu, Lore: History, any 1 High or Bugei Skill', honor:5.5, outfit:'Light Armor, Sturdy Clothing, Daisho, any 1 Weapon, Traveling Pack, 3 koku', tech:['Toku\u2019s Lesson','The Strength of One Man','Courage Above All','Forge Your Own Fate','Fortune Favors the Mortal Man']},
      {name:'Fuzake Shugenja', benefit:'Willpower', skills:'Calligraphy, Defense, Etiquette, Lore: Theology, Medicine, Spellcraft, any one High or Merchant Skill', honor:5.5, outfit:'Robes, Wakizashi, Knife, Scroll Satchel, Traveling Pack, 2 koku', tech:['The Sideways Path'], shugenja:true, affinity:'Earth', deficiency:'Fire'},
    ],
    'Oriole': [
      {name:'Tsi Smith [Artisan]', benefit:'Intelligence', skills:'Any one Artisan Skill, Commerce, two ranks in any one Craft Skill, Defense, any one Weapon Skill, any one High, Bugei, or Merchant Skill', honor:4.5, outfit:'Sensible Clothing, Wakizashi, Calligraphy Set, Traveling Pack, 3 koku', tech:['Tools of the Fortunes','Tsi Xing Guo\u2019s Blessing','A Crafter\u2019s Dedication','Exhaustive Knowledge','Star-filled Steel']},
    ],
    'Ox': [
      {name:'Morito Bushi', benefit:'Agility', skills:'Defense, Horsemanship, Hunting (Tracking), Kenjutsu, Lore: Kolat, Lore: Underworld, any one Skill', honor:3.5, outfit:'Light or Heavy Armor, Sturdy Clothing, Daisho, Heavy Weapon or Polearm, Horse (Rokugani Pony), Traveling Pack, 3 koku', tech:['Legacy of the Four Winds','The Wind Blows Many Ways','Thunder and Fury','The Blade Upon the Wind','Fast and Furious']},
    ],
    'Snake': [
      {name:'Chuda Shugenja [Snake]', benefit:'Willpower', skills:'Calligraphy (Cipher), Etiquette, Lore: Maho, Lore: Shadowlands, Spellcraft, any 2 Skills', honor:4.5, outfit:'Robes, Wakizashi, Knife, Scroll Satchel, Traveling Pack, 3 koku', tech:['To Punish the Wicked'], shugenja:true, affinity:'Earth', deficiency:'Air'},
    ],
    'Sparrow': [
      {name:'Suzume Bushi', benefit:'Willpower', skills:'Calligraphy, Kenjutsu (Katana), Lore: History, Lore: Theology, Perform: Storytelling, any one Lore Skill, any one Skill', honor:6.5, outfit:'Light Armor, Sturdy Clothing, Daisho, any 1 weapon, Traveling Pack, 3 koku', tech:['All Things in Time','Purity of Chi','Wisdom is the Greatest Weapon','Quiet Spirit, Steady Blade','Slow and Deadly']},
    ],
    'Tortoise': [
      {name:'Kasuga Smuggler [Courtier]', benefit:'Awareness', skills:'Commerce, Etiquette, Investigation (Notice), Lore: Underworld, Sincerity (Deceit), Stealth, any one High, Merchant, or Low Skill', honor:2.0, outfit:'Extravagant Clothing, Wakizashi, any 1 weapon, Calligraphy Set, 5 koku', tech:['Way of the Tortoise','The Shell of the Tortoise','The Eyes of the Emperor','Hand in Hand','The Tortoise Smiles']},
    ],
  };

  // ---------- Brotherhood of Shinsei - Basic Monk Schools (Core Rulebook pp.231-233) ----------
  // These are the OTHER thing called "Monk" on this sheet, and they are not the Clan [Monk]
  // Schools in SCHOOL_LIBRARY above. Two differences matter mechanically:
  //   - They have a Devotion instead of a Clan affiliation, and exactly ONE flat Technique
  //     learned at creation, never a five-Rank list. Core p.231: "Monk Schools are like
  //     shugenja Schools in that they possess only a single basic Technique they learn at
  //     character creation, and never gain others. The other abilities possessed by a monk
  //     are represented by the Kiho he knows."
  //   - ONLY these carry brotherhood:true, which is what earns the "Playing a Monk"
  //     framework (Void 3, Glory 1 / Status 0 with halved Glory gain, starting and per-Rank
  //     Kiho) and the 1x Kiho rate. Setting it on a Clan [Monk] School would be wrong.
  // `tech` is deliberately still an ARRAY, of exactly one name. That is not a five-Rank list
  // trimmed down - it is the shape the existing Rank-unlock machinery already understands
  // (ALL_SCHOOL_TECHNIQUES / f_schoolTechGranted index into it by Rank), so a one-entry array
  // grants the Technique at Rank 1 and nothing at any Rank after, which is exactly the rule.
  // `devotion` is an OBJECT, not a string, because later books need all three shapes:
  // {type:'Shintao'|'Fortunist', fortune:null} for these six, a named Fortune in `fortune`
  // (Order of Peaceful Repose: Emma-O), and type:null for the Fudoist Order, which has no
  // Devotion at all. Anything matching on Devotion must read devotion.type, never the object.
  // Outfit is the sidebar's baseline monk kit (p.231) and is identical across all six.
  // The p.231 baseline monk kit. The Core Rulebook's six Schools all share it, and none of the
  // eleven Elemental-book Schools prints an Outfit line at all - they inherit this one, which is
  // what the sidebar means by "All monks begin with the following outfit".
  const MONK_OUTFIT = 'Bo (or pair of jo), coarse plain Traveling Clothing, Scroll Satchel with passages from the Tao, 2 zeni';
  const BROTHERHOOD_SCHOOL_LIBRARY = [
    {name:'The Four Temples [Monk]', devotion:{type:'Shintao', fortune:null}, benefit:'Awareness', honor:6.5,
     skills:'Courtier, Etiquette, Jiujutsu, Lore: Theology (Shintao), Meditation, any two Skills',
     outfit:MONK_OUTFIT,
     tech:['Soul of Civility'], monk:true, brotherhood:true},
    {name:'The Order of Heroes [Monk]', devotion:{type:'Shintao', fortune:null}, benefit:'Perception', honor:4.5,
     skills:'Athletics, Defense, Jiujutsu, Lore: Theology (pick an Emphasis), Meditation, any two Skills',
     outfit:MONK_OUTFIT,
     tech:['Destiny’s Hand'], monk:true, brotherhood:true},
    // Seven Thunders constrains the THREE starting Kiho to one Element and then raises the
    // effective Rank used to meet that Element's Mastery. Note the book says "Insight Rank"
    // here, while Kiho eligibility on p.261 is School Rank + Ring - a wording mismatch in the
    // source, recorded as-is rather than silently reconciled. Phase 4 enforces this.
    {name:'The Shrine of the Seven Thunders [Monk]', devotion:{type:'Shintao', fortune:null}, benefit:'Stamina', honor:4.5,
     skills:'Athletics, Jiujutsu, Lore: Theology (Shintao), Lore (pick one), Meditation, any two Skills',
     outfit:MONK_OUTFIT,
     tech:['Walk with the Prophet'], monk:true, brotherhood:true,
     startingKihoSameElement:true, kihoElementRankBonus:1},
    {name:'The Temple of Kaimetsu-uo [Monk]', devotion:{type:'Fortunist', fortune:null}, benefit:'Willpower', honor:4.5,
     skills:'Defense, Jiujutsu, Lore: Theology (Fortunes), Meditation, any three Skills',
     outfit:MONK_OUTFIT,
     tech:['The Path of Purity'], monk:true, brotherhood:true},
    {name:'The Temple of Osano-Wo [Monk]', devotion:{type:'Fortunist', fortune:null}, benefit:'Strength', honor:4.5,
     skills:'Battle, Jiujutsu 2, Lore: Theology (Fortunes), Meditation, any two Bugei Skills',
     outfit:MONK_OUTFIT,
     tech:['The Hand of Thunder'], monk:true, brotherhood:true},
    // Thousand Fortunes starts with FOUR Kiho, and its own text says those four "do not count
    // against the additional Kiho you can purchase with Experience Points" - i.e. they are
    // exempt from the purchased-Kiho cap, not merely extra. Phase 4 enforces this.
    {name:'The Temples of the Thousand Fortunes [Monk]', devotion:{type:'Fortunist', fortune:null}, benefit:'Agility', honor:4.5,
     skills:'Jiujutsu, Lore: History, Lore: Theology (Fortunes), any one Lore Skill, Meditation, any two Skills',
     outfit:MONK_OUTFIT,
     tech:['The Thousand Forms'], monk:true, brotherhood:true,
     startingKiho:4, startingKihoExemptFromCap:true},
    // ================= Brotherhood Schools from the five Elemental books =================
    // None of these prints an Outfit line, so all eleven take the p.231 baseline (MONK_OUTFIT).
    // --- Book of Air, pp.193-194 ---
    {name:'Order of the Wind [Monk]', devotion:{type:'Fortunist', fortune:null}, benefit:'Reflexes', honor:4.5,
     skills:'Athletics, Defense, Jiujutsu, Lore: Theology, Meditation, Staves, any one Skill',
     outfit:MONK_OUTFIT, tech:['Essence of the Wind'], monk:true, brotherhood:true},
    // The Asahina crossover runs the OTHER way from Togashi/Asako/Kuni: a Clan family with an
    // opening into a Brotherhood School, rather than a Clan School with monk trappings. An
    // Asahina who attends remains samurai caste, keeps his family Trait bonus, and takes a
    // different Outfit (Book of Air p.194 sidebar). Flagged as data; the sheet does not branch
    // on it, and Phase 3's Void/Glory/Status deltas still apply because this is a brotherhood
    // School whichever route the character took to it.
    {name:'Wind\u2019s Grace Order [Monk]', devotion:{type:'Shintao', fortune:null}, benefit:'Reflexes', honor:6.5,
     skills:'Calligraphy, Jiujutsu, Kyujutsu, Lore: Theology (Shintao), Meditation, any two Skills',
     outfit:MONK_OUTFIT, tech:['Pillars of the Mind\u2019s Eye'], monk:true, brotherhood:true,
     crossoverFamily:'Asahina', crossoverOutfit:'Simple Clothing, Straw Hat, Yumi, Traveling Pack, 3 koku'},
    {name:'Fukurokujin\u2019s Eyes [Monk]', devotion:{type:'Fortunist', fortune:null}, benefit:'Perception', honor:4.5,
     skills:'Calligraphy, Divination, Etiquette, Investigation, Lore: History, Lore: Theology, any one non-Bugei Skill',
     outfit:MONK_OUTFIT, tech:['Way of the Closed Eye'], monk:true, brotherhood:true},
    // --- Book of Earth, p.205 ---
    // FLAGGED, NOT BUILT: this School's Technique grants bonus Void Points per day (equal to the
    // Earth Ring) that may only be spent to reduce damage or raise Armor TN. No other entry in
    // any School library alters the Void Point pool, and this one is a RESTRICTED second pool
    // rather than more of the existing one, so wiring it into the Void tracker would be a new
    // mechanic rather than data entry. Recorded as data plus Technique text and deliberately
    // left unenforced - see the Phase 5 notes.
    {name:'The Order of the Nameless Gift [Monk]', devotion:{type:'Shintao', fortune:null}, benefit:'Stamina', honor:4.5,
     skills:'Athletics, Defense, Jiujutsu, Lore (pick one), Meditation, any two Skills',
     outfit:MONK_OUTFIT, tech:['Shinsei\u2019s Gift'], monk:true, brotherhood:true,
     bonusVoidPointsPerDay:{ring:'Earth', restrictedTo:'damage reduction or Armor TN only', enforced:false}},
    {name:'Temple of Persistence [Monk]', devotion:{type:'Fortunist', fortune:null}, benefit:'Stamina', honor:3.5,
     skills:'Athletics, Defense, Jiujutsu (Martial Arts), Lore: Theology, Meditation, any one Bugei Skill, any one Skill',
     outfit:MONK_OUTFIT, tech:['Unyielding Spirit'], monk:true, brotherhood:true},
    // --- Book of Fire, pp.190-191 ---
    {name:'The Order of Rebirth [Monk]', devotion:{type:'Fortunist', fortune:null}, benefit:'Intelligence', honor:6.5,
     skills:'Athletics, Jiujutsu, Lore: History, Lore: Theology, Meditation, any two Skills',
     outfit:MONK_OUTFIT, tech:['Changing the Way'], monk:true, brotherhood:true},
    {name:'Tengoku\u2019s Fist [Monk]', devotion:{type:'Shintao', fortune:null}, benefit:'Agility', honor:4.5,
     skills:'Athletics, Battle, Jiujutsu 2, Lore: Theology, Meditation, any one Skill',
     outfit:MONK_OUTFIT, tech:['The Hand of the Heavens'], monk:true, brotherhood:true,
     desc:'A philosophical offshoot of the Shrine of the Seven Thunders (Book of Fire p.191). The split was amicable and there is no mechanical link between the two Schools.'},
    {name:'The Temple of Heavenly Wisdom [Monk]', devotion:{type:'Fortunist', fortune:null}, benefit:'Intelligence', honor:6.5,
     skills:'Courtier, Etiquette, Lore: History, Lore: Theology, Meditation, Sincerity, any one High Skill',
     outfit:MONK_OUTFIT, tech:['The Largesse of Fukurokujin'], monk:true, brotherhood:true},
    // --- Book of Water, pp.187-188 ---
    // NOT tagged pacifistic, deliberately. Phase 6's Servants of Mercy matches "any pacifistic
    // Brotherhood School at Rank 4", and this Order looks like the obvious sibling - but Book of
    // Water p.187 says the opposite in as many words: the Servants are "in contrast to the Order
    // of Jurojin's Blessing ... absolute pacifists". Jurojin's Blessing is named explicitly in
    // that Path's replaces clause anyway, so it needs no tag to qualify.
    {name:'The Order of Jurojin\u2019s Blessing [Monk]', devotion:{type:'Fortunist', fortune:null}, benefit:'Intelligence', honor:5.5,
     skills:'Athletics, Jiujutsu, Lore: Anatomy (Disease), Medicine (Disease, Herbalism), Meditation, Staves, any one Skill',
     outfit:MONK_OUTFIT, tech:['Blessings of Longevity'], monk:true, brotherhood:true},
    {name:'The Shrine of Heaven\u2019s Mirror [Monk]', devotion:{type:'Fortunist', fortune:null}, benefit:'Perception', honor:3.5,
     skills:'Athletics, Divination (Omens), Jiujutsu, Lore: Omens, Meditation, any two Skills',
     outfit:MONK_OUTFIT, tech:['Gaze into the Mirror'], monk:true, brotherhood:true,
     conditional:{severity:'reversible', text:'You must be Ascetic and follow the sect\u2019s peculiar practices whatever the social cost. Abandon them and you lose your School Technique\u2019s benefits, and may be expelled from the sect.'}},
    // --- Book of Void, p.193 ---
    // honor is null because the Book of Void prints NO Honor line for this School. That is an
    // omission in the source, verified against the page rather than assumed from a bad text
    // extraction, so Apply School leaves the Honor field untouched rather than writing a guess.
    {name:'The Order of Eternity [Monk]', devotion:{type:'Shintao', fortune:null}, benefit:'Intelligence', honor:null,
     skills:'Defense, Divination (Astrology), Jiujutsu, Meditation, Lore: Theology, any two High Skills',
     outfit:MONK_OUTFIT, tech:['The Touch of Eternity'], monk:true, brotherhood:true},
    // ============ Emerald Empire, Imperial Histories 2, Secrets of the Empire ============
    // Three of these are tied to a specific alternate-history or optional campaign setting
    // rather than being generally available. That changes nothing mechanically - they are
    // ordinary Basic Schools - but the context rides along in `setting` so a player can see
    // why a given GM might not allow one, the same spirit as the sheet leaving GM-optional
    // rules visible-but-labelled rather than hidden.
    {name:'Shinmaki Order [Monk]', devotion:{type:'Shintao', fortune:null}, benefit:'Void', honor:6.5,
     skills:'Divination, Jiujutsu, Lore: Theology (Diamond Sutra), Meditation 2, any two Skills',
     outfit:MONK_OUTFIT, tech:['The Diamond Sutra'], monk:true, brotherhood:true,
     // Second School whose own benefit is +1 Void, after Hoshi Tsurui Zumi, so a Shinmaki monk
     // also starts at VOID 4 - monk baseline 3 plus this School's benefit. Same deliberate
     // composition, and the picker preview quotes the real figure.
     setting:'Emerald Empire p.206. A small, controversial sect studying the Diamond Sutra.'},
    // Its Technique grants "one additional Mystical kiho". Note the wording is weaker than Dark
    // Path Sohei's or Kuni Witch-Hunter's, which say outright that the granted Kiho do not count
    // against the cap; "additional" is read the same way here, which is what the brief catalogues
    // it as, but the difference in wording is recorded rather than smoothed over.
    {name:'First Dawn Scholars [Monk]', devotion:{type:'Fortunist', fortune:null}, benefit:'Intelligence', honor:5.5,
     skills:'Etiquette, Jiujutsu, Lore: Nonhumans, Lore: Theology (Fortunes), Meditation, Staves, any one Skill',
     outfit:MONK_OUTFIT, tech:['Way of the Ancient World'], monk:true, brotherhood:true,
     grantsKiho:1, grantsKihoType:'Mystical', grantsExemptFromCap:true,
     setting:'Imperial Histories 2 p.29. Owl Clan-affiliated, from the "Togashi Dynasty" alternate timeline.'},
    {name:'Order of the Five Rings [Monk]', devotion:{type:'Shintao', fortune:null}, benefit:'Awareness', honor:4.0,
     skills:'Courtier, Defense, Etiquette, Jiujutsu, Lore: Elements, Lore: Theology (Shintao), Meditation',
     outfit:MONK_OUTFIT, tech:['Cracks within the Elements'], monk:true, brotherhood:true,
     setting:'Imperial Histories 2 p.103. From the historical "Heresy of the Five Rings" era.'},
    // Two schema exceptions in one entry. devotion.type is null - the book prints "Devotion:
    // None", and this is the only School in any of the sixteen books with no Devotion at all -
    // and Starting Honor is a CHOICE the player makes at creation rather than a fixed number,
    // because the Technique's bonus scales off the gap between the character's Honor Rank and
    // his opponent's, so a deliberately dishonourable Fudoist is a valid build.
    {name:'Fudoist Order [Monk]', devotion:{type:null, fortune:null}, benefit:'Willpower', honor:null,
     honorChoices:[1.5, 4.5],
     specialisationChoices:['Opposed Social Skill Rolls', 'Attack Rolls'],
     skills:'Courtier, Etiquette, Jiujutsu, Lore: Theology, Meditation, any two Skills',
     outfit:MONK_OUTFIT, tech:['For Each, One Path'], monk:true, brotherhood:true,
     setting:'Imperial Histories 2 p.287. A Colonies / "Age of Exploration" revival of the Fudoist heresy.'},
    // The third Devotion shape: a named Fortune. This is why devotion is an object rather than a
    // string, decided back in Phase 2 before anything needed the sub-field.
    {name:'Order of Peaceful Repose [Monk]', devotion:{type:'Fortunist', fortune:'Emma-O, the Fortune of Death'}, benefit:'Awareness', honor:4.5,
     skills:'Athletics, Calligraphy, Jiujutsu, Lore: Ghosts, Lore: Theology (Emma-O), Meditation, any one Skill',
     outfit:MONK_OUTFIT, tech:['Emma-O\u2019s Insight'], monk:true, brotherhood:true,
     // NOT tagged pacifistic. The brief flags it as a plausible candidate for the tag Servants
     // of Mercy matches on, but says to check rather than assume - and its own pages describe a
     // sect concerned with the dead and with ghosts, never with refusing violence. Untagged.
     setting:'Secrets of the Empire p.242. Devoted to Emma-O, Fortune of Death.'},
  ];

