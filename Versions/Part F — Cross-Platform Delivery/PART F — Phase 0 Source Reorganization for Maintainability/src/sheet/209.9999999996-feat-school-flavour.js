  // ============ PART H PHASE 9.1 — SCHOOL FLAVOUR TEXT ============
  // One or two sentences per School in our own words, with the printed page they come from. Data only.
  // Interface: SCHOOLLORE9.entry(name), .searchText(name), .enabled(). Declared with var: 080 reads it before this loads.
  const SCHOOL_FLAVOUR_ENABLED = true;
  var SCHOOLLORE9 = (function(){
    // name: [book, printed page, text]
    const lore = {
      "Agasha Shugenja": ["Core Rulebook", 125, "Agasha shugenja pursue unconventional magic, from alchemy to spells that call on several elements at once, and the Phoenix let them take that study as far as it leads."],
      "Akodo Bushi": ["Core Rulebook", 116, "The Akodo refuse narrow specialisation: their School perfects precise, fundamental kenjutsu and pairs it with a thorough study of battle."],
      "Asahina Shugenja": ["Core Rulebook", 110, "Part priests and part monks, the Asahina value preserving life over destruction, treat every ritual as a lesson and prize the making of art. Their magic leans towards protection."],
      "Asako Henshin [Monk]": ["The Great Clans", 199, "A secretive monastic sect of the Asako whose ways few outside the family understand. Its monks study how a person relates to the Elements that make up all things."],
      "Asako Loremaster [Courtier]": ["Core Rulebook", 124, "Scholarly Asako courtiers who study an unusually wide range of subjects and turn that learning into insight and influence at court."],
      "Bayushi Bushi": ["Core Rulebook", 126, "The School behind the Scorpion's villainous reputation trains its students as agents of discord, adding manipulation, stealth and even poison to their swordplay. Its Techniques are dirty tricks that exploit every advantage."],
      "Bayushi Courtier": ["Core Rulebook", 127, "Masters of manipulation whose patient gathering of secrets built the Scorpion's network of informants. They find the weakness in any opponent, or ally, and use it for the Clan."],
      "Chuda Shugenja": ["Core Rulebook", 213, "Heirs of the destroyed Snake Clan, the Chuda keep a secret tradition of maho centuries old and now serve the Spider, always pushing blood magic further whatever it costs."],
      "Chuda Shugenja [Snake]": ["Core Rulebook", 224, "The Snake Clan's original School, founded by an Imperial magistrate sworn to destroy maho-tsukai. Its shugenja hunted Tainted sorcerers and their monsters with Earth and Jade magic."],
      "Daidoji Iron Warrior [Bushi]": ["Core Rulebook", 111, "The Crane's quiet strength: heavy infantry and yojimbo who win the day when words fail, with Techniques for enduring blows and guarding others."],
      "Daidoji Scout [Bushi]": ["The Great Clans", 70, "A Daidoji style of scouting, ambush and precise strikes at commanders and supply lines. Its scouts use traps and surprise, accepting some dishonour for the good of the Crane."],
      "Daigotsu Bushi": ["Core Rulebook", 212, "Spider Clan warriors whose style is pieced together from the Schools they knew in their former lives. Eclectic but brutal, it can even feed on a dying foe's life force."],
      "Daigotsu Courtier": ["Core Rulebook", 213, "Spider courtiers who slip into the courts of the Great Clans in disguise, using blackmail and contacts to steer rivals into conflict while hiding their own Taint."],
      "Doji Courtier": ["Core Rulebook", 110, "The source of the Crane's mastery of court. The Doji School builds vast networks of allies through favours and obligations, with a curriculum broad enough to meet any need."],
      "Doji Magistrate [Bushi]": ["Emerald Empire", 170, "Crane magistrates trained to fight with compassion, avoiding injury where they can and favouring weapons such as the jitte and sasumata that disarm or capture."],
      "First Dawn Scholars [Monk]": ["Imperial Histories 2", 29, "In the Togashi Dynasty setting, the Owl Clan's monastic order: keepers of a library on civilisations older than humanity, who seek enlightenment in the world before the Kami fell."],
      "Fudoist Order [Monk]": ["Imperial Histories 2", 286, "Monks of Fudoism, a heresy the Brotherhood of Shinsei has banned. Each must choose a personal path, and their Technique turns the gap in Honor between them and a foe into an edge."],
      "Fukurokujin’s Eyes [Monk]": ["Book of Air", 194, "A hereditary order of a few bloodlines descended from a tribe older than the Kami's arrival, valued by the Crab for uncannily accurate judgement and prediction."],
      "Fuzake Shugenja": ["Secrets of the Empire", 238, "Begun as ronin shugenja in Toturi's Army under Yasuki Garou, a friend of Toku, the Fuzake swore to the Monkey Clan and devote themselves to healing and an eccentric reverence for the Fortunes."],
      "Goju Ninja": ["The Great Clans", 280, "The faceless servants of the Lying Darkness, people whose identities the Nothing has consumed. They draw on it for infiltration, deception and murder."],
      "Heichi Bushi": ["Core Rulebook", 217, "Shaped by the dangers of the Boar lands, Heichi bushi take the enemy's worst and keep fighting. The School favours the rare curved Mai Chong spear and a patient, defensive style."],
      "Hida Bushi": ["Core Rulebook", 106, "One of the Empire's oldest bushi styles, forged against the Shadowlands: endure the enemy's blows, then crush them with heavy weapons."],
      "Hida Pragmatist [Bushi]": ["Emerald Empire", 247, "Students of Kobo Ichi-Kai, taught at Clear Water Village, who put unarmed fighting above every other kind. Their strength makes them fine yojimbo and a match even for Shadowlands creatures."],
      "Hiruma Bushi": ["Core Rulebook", 108, "Where the Hida endure, the Hiruma evade, striking weak points with lightning speed. Their School is built for movement and survival inside the Shadowlands."],
      "Hiruma Scout [Bushi]": ["Imperial Histories 1", 147, "After Hiruma Castle fell, the family lost the teachers of its old bushi School. The Hiruma Scouts are the stealthy style practised in that era."],
      "Horiuchi Shugenja": ["The Great Clans", 257, "Keepers of meishodo, the talisman magic the Unicorn gathered from many peoples on their travels beyond the Empire. In earlier eras the Iuchi teach it."],
      "Ichiro Bushi": ["Core Rulebook", 215, "Founded by a Hida, the Badger's School stays close to its Crab roots: wrestling, unarmed fighting and sheer strength that answers finesse with overwhelming force."],
      "Ide Emissary [Courtier]": ["Core Rulebook", 131, "The most peaceable courtiers of the Great Clans, the Ide cultivate calm and mediation. Their Techniques never attack; they defuse conflict and protect the Emissary."],
      "Ikoma Bard [Courtier]": ["Core Rulebook", 118, "The Empire's great storytellers. Ikoma bards argue through history and parable, invoking ancestors and heroes to win debates and spread Glory."],
      "Ikoma Lion’s Shadow [Bushi]": ["Emerald Empire", 109, "A small, secretive School that keeps alive the ruthless, pragmatic methods of the first Ikoma, which the family's histories prefer to forget."],
      "Isawa Shugenja": ["Core Rulebook", 124, "The oldest shugenja School in Rokugan and the largest shugenja family. The Isawa have pursued the secrets of the universe for more than a thousand years."],
      "Iuchi Shugenja": ["Core Rulebook", 130, "Free-spirited and unconventional, the Iuchi learned much of their craft on the open plains during the Unicorn's wanderings, meishodo talismans included. Their magic favours speed and travel."],
      "Kaiu Engineer [Artisan/Bushi]": ["The Great Clans", 39, "The Empire's foremost builders, siege engineers and armourers, devoted to the Crab's defence against the Shadowlands. Many also lead troops, turning siegecraft to war."],
      "Kakita Artisan": ["The Great Clans", 71, "The Kakita Artisan Academy studies every art, performed or crafted, and how each can serve the Crane Clan."],
      "Kakita Bushi": ["Core Rulebook", 109, "The Kakita Dueling Academy is devoted to iaijutsu above all. Its champions decide battles before they begin and answer any challenge at court."],
      "Kasuga Smuggler [Courtier]": ["Core Rulebook", 225, "Tortoise agents who move among the Empire's criminals, ruthless and steeped in the underworld, finding allies wherever they can, even among honest peasants."],
      "Kitsu Shugenja": ["Core Rulebook", 117, "Keeping rituals unchanged since the family began, the Kitsu sense and work the bonds between the living, their ancestors and other realms, and command large-scale battle magic."],
      "Kitsuki Investigator [Courtier]": ["Core Rulebook", 114, "Alone in the Empire, the Kitsuki believe in evidence. Their School hones near-perfect memory and observation, making them the Dragon's courtiers and natural magistrates."],
      "Kitsune Shugenja": ["Core Rulebook", 219, "Living beside one of Rokugan's great forests, Fox shugenja learn to love its spirits and creatures, and their School deepens the bond between people and animals."],
      "Komori Shugenja": ["Core Rulebook", 216, "The Bat Clan's shugenja draw on the koumori, kindly bat spirits of Chikushudo, for strange spells and swift messages across the Empire."],
      "Kuni Shugenja": ["Core Rulebook", 107, "Thought of as obsessive madmen who delve into forbidden secrets, the Kuni accept that as the price of fighting the Shadowlands. Their alliance with the Nezumi gives them insight into other nonhumans."],
      "Kuni Witch-Hunter [Monk]": ["The Great Clans", 40, "A small band of mystic warriors who roam the Empire hunting maho-tsukai and Shadowlands infiltrators, ignoring borders. Commoners welcome them; other samurai often do not."],
      "Lion Elite Spearmen [Bushi]": ["Naishou Province", 7, "The Lion's spear units are few in modern times and other Clans see them as a relic of an earlier age. Several escort the new Miya Governor of Naishou Province."],
      "Mantis Brawler [Bushi]": ["The Great Clans", 165, "Born of shipboard fights and tavern brawls among the Mantis Clan's pirates and smugglers, a fighting style even less conventional than the Yoritomo's."],
      "Matsu Beastmaster [Bushi]": ["The Great Clans", 136, "Matsu who take lion warcats into their own pride and communicate with them almost mystically, though the bond can leave them awkward among people."],
      "Matsu Berserker [Bushi]": ["Core Rulebook", 119, "Most Matsu train here. The School teaches total, fearless commitment to the attack, on the principle that a beaten foe cannot strike back."],
      "Mirumoto Bushi": ["Core Rulebook", 112, "The only School that teaches Niten, fighting with katana and wakizashi together, which fuels a long rivalry with the Kakita's single-sword style."],
      "Mirumoto Taoist Swordsman [Bushi]": ["Emerald Empire", 221, "Swordsmen who train beside the Togashi tattooed monks and bring their unconventional methods to the blade."],
      "Miya Herald [Courtier]": ["Core Rulebook", 230, "Imperial messengers who carry the Emperor's word to every corner of Rokugan. They build trust, calm disputes and can defend themselves on dangerous roads."],
      "Morito Bushi": ["Core Rulebook", 223, "The Ox Clan's heavy cavalry, trained to ride down infantry and make the most of a horse's speed; most fight with a polearm."],
      "Moshi Shugenja": ["Core Rulebook", 120, "Long devoted to the Sun Goddess, the Moshi turned to practical weather magic after joining the Mantis and often sail on Yoritomo ships to calm the seas."],
      "Moto Bushi": ["Core Rulebook", 130, "Descended in part from the nomads who joined the Unicorn abroad, the Moto fight as unrestrained heavy cavalry, a style other Clans find both fearsome and improper."],
      "Moto Death Priest [Shugenja]": ["Imperial Histories 1", 240, "Followers of the Shi-Tien Yen-Wang, a wrathful pantheon of foreign death gods, who turn those gods' disfavour on their enemies."],
      "Moto Vindicator [Bushi]": ["The Great Clans", 258, "Born of the shame of Moto Tsume's fall into the Shadowlands, the Vindicators swore to destroy the Tainted Moto and every Shadowlands creature."],
      "Ninube Shugenja": ["The Great Clans", 281, "Called shugenja only for convenience, the Ninube are no longer truly individuals; their power, like the Goju's, comes from the Nothing."],
      "Order of Peaceful Repose [Monk]": ["Secrets of the Empire", 242, "Monks of Emma-O who lay ghosts to rest wherever war or local conditions make them common, whether the dead were peasants or samurai."],
      "Order of the Five Rings [Monk]": ["Imperial Histories 2", 102, "A short-lived order devoted to the charismatic monk Gorinno and his heretical philosophy, its members growing ever more zealous and cult-like."],
      "Order of the Wind [Monk]": ["Book of Air", 193, "Brothers who accept that the world is chaotic and unpredictable and stay steady within it, gaining command of themselves and, quietly, a little of the world around them."],
      "Otomo Courtier": ["Core Rulebook", 229, "Imperial courtiers who protect the throne by sowing suspicion among the Great Clans. They trade on Imperial authority and use every underhanded trick, safe behind their bloodline."],
      "Seppun Guardsman [Bushi]": ["Core Rulebook", 228, "The Miharu, who give up everything to guard the Imperial House. Their School puts defence, and the life of the one they protect, above the guardsman's own."],
      "Seppun Shugenja": ["Core Rulebook", 228, "The Hidden Guard: shugenja who keep constant watch against threats steel cannot answer, with some of the finest wards in Rokugan, as the Emperor's last line of defence."],
      "Shiba Artisan [Courtier]": ["Emerald Empire", 122, "A quiet Shiba tradition that seeks to capture beauty as purely as possible; unlike the Kakita, a Shiba artist needs no audience."],
      "Shiba Bushi": ["Core Rulebook", 123, "Warrior-scholars who look for any alternative to bloodshed, then strike swiftly when it comes. Their Techniques draw on the Void and protect others, suiting them to yojimbo work."],
      "Shinjo Bushi": ["Emerald Empire", 31, "Mounted fighters whose style adopts foreign methods from the Unicorn's travels, such as the active parry and riposte, unfamiliar to most Rokugani."],
      "Shinmaki Order [Monk]": ["Emerald Empire", 206, "A small, controversial sect that studies the Diamond Sutra and meditates on the Seven Thunders in dark, isolated monasteries, emerging only now and then."],
      "Shosuro Actor [Ninja]": ["The Great Clans", 227, "Shinobi who infiltrate in plain sight, disguised as servants, peasants or even particular samurai, which is why the Shosuro have long practised acting."],
      "Shosuro Infiltrator [Ninja]": ["Core Rulebook", 128, "A School few outsiders know exists, training silent killers who strike unsuspecting targets from hiding, without pleasure or remorse."],
      "Soshi Magistrate [Bushi]": ["Emerald Empire", 171, "Grown from techniques taught to the yoriki of Soshi Saibankan, this School trains the Scorpion's magistrates and guards in both armed and unarmed fighting."],
      "Soshi Shugenja": ["Core Rulebook", 127, "Called in when stealth and subtlety are needed, Soshi shugenja coax the amoral kami into trickery and can cast most non-damaging spells without any visible sign."],
      "Suzume Bushi": ["Core Rulebook", 225, "Founded from Crane samurai, the Sparrow keep a katana style that waits for the perfect strike, and their love of stories helps them read the flow of battle."],
      "Tamori Shugenja": ["Core Rulebook", 113, "Formed from the Agasha who stayed with the Dragon, the Tamori inherited their experimental magic, notably sealing a spell's essence in prepared liquids for later use."],
      "Temple of Persistence [Monk]": ["Book of Earth", 205, "A largely martial order devoted to unyielding endurance. Its training tests body, mind and spirit to their limits, and its stubborn monks rarely accept defeat."],
      "Tengoku’s Fist [Monk]": ["Book of Fire", 191, "A friendly offshoot of the Shrine of the Seven Thunders, these sohei see violence as a natural part of life: never a first resort, but an option they use exceptionally well."],
      "The Four Temples [Monk]": ["Core Rulebook", 231, "Monks who believe enlightenment requires staying engaged with society. With a great monastery in the Imperial capital, they advise lords and help travellers."],
      "The Hitomi Kikage Zumi Order [Monk]": ["Imperial Histories 1", 215, "Tattooed monks, mostly of the Hitomi family, who seek enlightenment through violent physical action. They flourish under Lady Hitomi but appear in other eras too."],
      "The Hoshi Tsurui Zumi Order [Monk]": ["Imperial Histories 1", 214, "A branch of the Togashi tattooed monks begun in the Hidden Emperor era, when Togashi Hoshi broke with Hitomi and began tattooing his own followers."],
      "The Order of Eternity [Monk]": ["Book of Void", 193, "Monks who study the nature of time and wait for the right moment to act. Their long stillness and sudden action can make them seem odd, even mad."],
      "The Order of Heroes [Monk]": ["Core Rulebook", 232, "A little-known sect that believes anyone can become a hero. It quietly finds threats to the Empire and the people able to meet them."],
      "The Order of Jurojin’s Blessing [Monk]": ["Book of Water", 187, "Founded during the Great Famine to tend the sick of every caste; some members also treat injuries and, in later centuries, madness."],
      "The Order of Rebirth [Monk]": ["Book of Fire", 190, "Descended from militant sohei of Osano-Wo, these brothers embrace new paths and philosophies to uncover new truths, earning other sects' disdain."],
      "The Order of the Nameless Gift [Monk]": ["Book of Earth", 205, "An offshoot of the Shrine of the Seven Thunders that seeks the Thunders' fate-changing power in every soul through physical rigour and trials of endurance, taking the world plainly as it is."],
      "The Order of the Spider Monks [Monk]": ["Core Rulebook", 215, "Begun with the fallen monk Roshungi and spread by his student Michio, the Order teaches each follower to find their own path whatever it costs others."],
      "The Shrine of Heaven’s Mirror [Monk]": ["Book of Water", 187, "Ascetics who seek trance states, through sleeplessness, drink, wild dance and visionary plants, to receive guidance from the Fortunes and spirits, above all through omens."],
      "The Shrine of the Seven Thunders [Monk]": ["Core Rulebook", 232, "Monks who honour the seven heroes who defeated Fu Leng by devoting their lives to contemplation, rarely leaving their monastery."],
      "The Temple of Heavenly Wisdom [Monk]": ["Book of Fire", 191, "Perhaps the oldest monastic tradition in Crane lands. Its ancient temple helped the Lady Doji spread culture and won its monks unusual prestige."],
      "The Temple of Kaimetsu-uo [Monk]": ["Core Rulebook", 232, "Followers of the Mantis founder who believe he left to avoid a ruinous fight over the Crab's leadership; they seek enlightenment through conciliation and peace."],
      "The Temple of Osano-Wo [Monk]": ["Core Rulebook", 233, "Perhaps the most militant Brotherhood sect, devoted to physical prowess and martial arts; its monks ritually scar themselves to mark their progress."],
      "The Temples of the Thousand Fortunes [Monk]": ["Core Rulebook", 233, "A varied network of temples to Rokugan's countless Fortunes, whose monks mostly believe they must work hard to prove worthy of enlightenment."],
      "The Togashi Tattooed Order [Monk]": ["Core Rulebook", 114, "The ise zumi, whose tattoos, inked with the Kami Togashi's blood, grant supernatural powers. Revered and feared, they excel at unarmed combat and feats of athleticism."],
      "Toku Bushi": ["Core Rulebook", 221, "The Monkey Clan's School teaches calm against overwhelming odds and fighting many foes at once."],
      "Tonbo Shugenja": ["Core Rulebook", 218, "Deeply spiritual priests of the mountains who also serve as go-betweens for the Dragon at court, using their bond with the spirits to sharpen their social graces."],
      "Toritaka Bushi": ["Core Rulebook", 219, "Specialists in destroying creatures from other spirit realms, with a fluid style for unexpected monsters: potent against the otherworldly, less so against people."],
      "Tsi Smith [Artisan]": ["Core Rulebook", 222, "Named for a foreign smith honoured by the second Emperor and revived by a ronin centuries later, the School forges weapons and armour and learns to fight so it knows how they are used."],
      "Tsuruchi Archer [Bushi]": ["Core Rulebook", 122, "The Empire's finest archers since their days as the Wasp Clan, devoted to the purity of the bow: deadly at range, outclassed in melee."],
      "Tsuruchi Bounty Hunter [Bushi]": ["The Great Clans", 167, "The Wasp Clan once lived by hunting fugitives for the Emerald Champion; a few Tsuruchi still learn that relentless trade as a School of its own."],
      "Usagi Bushi": ["Core Rulebook", 220, "Tested by centuries of war, the Hare's School turns their athleticism into hit-and-run attacks that seem to come from every side."],
      "Utaku Battle Maiden [Bushi]": ["Core Rulebook", 132, "The shiotome, the most respected cavalry in the Empire and the only riders allowed to breed the Utaku steeds. Honor strengthens their mounted Techniques."],
      "Utaku Mounted Infantry [Bushi]": ["Imperial Histories 2", 168, "Soldiers who ride to battle and fight on foot, developed during the Unicorn's wanderings; many are Otaku men barred by tradition from fighting on horseback."],
      "Wind’s Grace Order [Monk]": ["Book of Air", 194, "Formed after the Clan War for monks who could not regain their peace after defending the temples. Archery gave them focus, and the order keeps ties to the Asahina and other archery traditions."],
      "Yasuki Courtier": ["Core Rulebook", 107, "Once Crane, the Yasuki joined the Crab and became the Empire's richest merchants. Their courtiers are salesmen who find what a rival needs and supply it, at a price."],
      "Yogo Wardmaster [Shugenja]": ["The Great Clans", 229, "Shugenja of the Yogo's closely guarded ward magic: protective charms more flexible than the Toritaka's exorcism wards."],
      "Yoritomo Bushi": ["Core Rulebook", 120, "Fighters shaped by ship-to-ship combat, with fluid movement, a habit of exploiting weaknesses quickly and skill with peasant weapons that stand up to sea air."],
      "Yoritomo Courtier": ["Core Rulebook", 121, "Created to serve the Mantis's trade, these courtiers rely on intimidation and bullying, a style that has found more success since the Mantis became a Great Clan."],
      "Yoritomo Shugenja": ["The Great Clans", 168, "A small Yoritomo line, begun with a daughter of the Mantis founder, with an unmatched bond to the spirits of the sea and storm."],
      "Yotsu Bushi School (Heroes of Rokugan) [Bushi]": ["Imperial Histories 1", 276, "From the ronin family that guarded the commoners of Otosan Uchi, the School grew into a full bushi style while fighting the Spider in the capital's ruins. In the Heroes of Rokugan timeline the Yotsu become the Tiger Clan."],
    };
    function normalise(value){ return String(value == null ? "" : value).trim().toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " "); }
    const index = new Map(Object.keys(lore).map(function(name){ return [normalise(name), name]; }));
    function entry(name){
      const key = SCHOOL_FLAVOUR_ENABLED ? index.get(normalise(name)) : undefined;
      if(!key) return null;
      const e = lore[key];
      return { text: e[2], book: e[0], page: e[1], source: e[0] + " p." + e[1] };
    }
    return {
      enabled: function(){ return SCHOOL_FLAVOUR_ENABLED; },
      entry: entry,
      // Search's School record text: the sentences followed by their page.
      searchText: function(name){ const e = entry(name); return e ? [e.text + " (" + e.source + ")"] : []; }
    };
  })();
  // Earlier Search consumers may have cached entries before this layer loaded.
  if(typeof SEARCH14 !== 'undefined') SEARCH14.invalidate();
  // UI hook: repaint the School preview drawn before this text loaded (080's renderSchoolInfo).
  if(typeof renderSchoolInfo === 'function') renderSchoolInfo();
  // ============ END SCHOOLLORE9 ============
