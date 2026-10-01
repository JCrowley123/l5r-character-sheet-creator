  // ========= PART I PHASE 4.8: ANCESTORS =========
  // The Ancestors of the Core Rulebook (pp. 241-244), The Great Clans (its eight "New ...
  // Ancestors" sections) and Secrets of the Empire (pp. 243-247), to the owner's rulings of
  // 30 September 2026:
  //   * An Ancestor lives with the character's Clan and Family, not in the Advantages list: a card
  //     in the Clan & School tab and on the creation wizard's Family screen. It is part of the
  //     character's history, and a player should see that it exists.
  //   * It still costs what the book charges ("purchased like any other Advantage"), added to
  //     Experience spent by a guarded block in recalcAll().
  //   * Offered: the character's own Clan or faction (a Great or Minor Clan, the Imperial
  //     families, ronin, the Brotherhood); Spider Ancestors to anyone, with the GM's permission
  //     (the Core p. 244 sidebar); every other shown greyed.
  //   * A "Lost ancestor's favour" badge switches every gift off. By the book (p. 241) the favour
  //     may return once; a second loss is final, and no other Ancestor may ever replace one whose
  //     favour was lost. Chuda Bikimi never returns at all (The Great Clans p. 283). No refund.
  //   * How a gift reaches a roll follows the owner's rule from the first iPhone check (this
  //     folder's AUDIT.md): a gift that changes the dice after the roll is offered in the result,
  //     like Luck; a gift that costs something is offered in the roll preview and paid when the
  //     player rolls; a free modifier is automatic and shown in the preview.
  //
  // Every description below is in this project's own words with its page, never the book's text
  // (owner's ruling, 30 September). How each gift reaches the sheet:
  //   automatic   -- through the adv-config seat (Phase 4.5, Part I), never damage. The "With a
  //                  Void Point" gifts read the preview's armed Void Point, which pays for them;
  //   ticked/paid -- a tick in the roll preview (Feature 4.5.15's registry), fresh every roll. A
  //                  cost is taken by a wrapper on the preview's gate (Phase 3, Part G) once the
  //                  player confirms, never on preview or cancel;
  //   after       -- a block in the roll's result, through Phase 4.5's Luck hook;
  //   damage      -- inside getWeaponDamageDice() by a guarded trunk block, because a damage roll
  //                  does not read the pre-roll pipeline (measured by Feature 4.5.12);
  //   Armor TN    -- Shiba's Intelligence, by a guarded block after the Current TN sum;
  //   reminder    -- written on the card; the player applies it.
  // Demands and loyalties the sheet can measure raise a warning on the card; they never switch the
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
    api.SPIDER_RULE = 'Spider Ancestors (Core Rulebook p. 244; The Great Clans p. 283 applies the same rule to its own) are corrupted souls sent back from Jigoku. The usual rules do not bind them: they favour whoever serves Jigoku’s ends, above all members of the Spider Clan and the Tainted. Your GM decides whether one favours a character from outside the Spider Clan.';
    api.RONIN_RULE = 'Ronin Ancestors (Secrets of the Empire p. 246) watch over true ronin only: a clan ronin can never have one.';
    api.BROTHERHOOD_RULE = 'Brotherhood Ancestors (Secrets of the Empire p. 246) guide monks rather than their own blood: at the least a monk of their own devotion (Shintao, Fortunist and so on), and often only one of their own order or sect. The GM decides.';
    api.BOOK = {core:'Core Rulebook', gc:'The Great Clans', sote:'Secrets of the Empire'};

    // ---------- The Ancestors, book by book, in printed order ----------
    // clan: the faction whose members the Ancestor guides (Loyalty); also: further factions.
    // how: 'auto' applied by the sheet; 'void' applied when the preview's Void Point is spent;
    // 'declare' ticked in the roll preview; 'pay' ticked in the preview and paid when you roll;
    // 'after' offered in the roll's result; 'info' printed in the preview, no dice; 'remind'.
    // who: a loyalty narrower than the faction; check: what of it the sheet can measure (a warning).
    api.LIBRARY = [
      // Core Rulebook pp. 242-244
      {name:'Hida', clan:'Crab', cost:14, book:'core', page:'p. 242',
        about:'The Crab Clan’s founder, a giant of strength and endurance who never gave ground to any foe.',
        gifts:[
          {text:'+1k0 on every damage roll.', how:'auto', note:'Added to the damage of weapons chosen from the sheet’s list; add it yourself to a custom weapon.'},
          {text:'Ignore 4 points of an enemy’s Reduction, whatever weapon you use.', how:'remind'},
          {text:'Crab who fight beside you in a skirmish gain 1 extra Void Point, lost if not spent by the end of the skirmish.', how:'remind'},
        ],
        demands:'In any Round in which a fellow Crab is wounded where you can see it, you take 1 Wound as well (never more than 1 a Round; it ignores Reduction and anything that would negate it). You may refuse it, but refusing it, or willingly retreating from a fight with a creature of the Shadowlands, makes Hida leave you.'},
      {name:'Kuni', clan:'Crab', cost:8, book:'core', page:'p. 242', session:'kuni-cast',
        about:'Founder of the Crab’s shugenja school, who knew more of the Shadowlands’ creatures than anyone of his day.',
        gifts:[
          {text:'Once per session, spend a Void Point to add your Earth Rank in kept dice to a Spell Casting Roll.', how:'pay', price:'a Void Point, once a session', note:'Tick it in the Casting Roll’s preview: the sheet spends the Void Point and marks the session when you roll. The book gives the bonus as kept dice only, so that is how the sheet adds it; you may want to confirm the reading with your GM.'},
          {text:'When you roll to resist gaining Shadowlands Taint, roll twice and keep the better result.', how:'remind'},
        ],
        demands:'Stay pure. Gain even a single point of Shadowlands Taint and Kuni leaves you.',
        flag:{taint:true}},
      {name:'Doji', clan:'Crane', cost:8, book:'core', page:'p. 242',
        about:'The Lady Doji, who shaped most of the customs and courtesies of Rokugani civilisation.',
        gifts:[
          {text:'+1k0 on Courtier, Etiquette, Perform and Sincerity rolls.', how:'auto'},
        ],
        demands:'Live a civilised life. A Major Breach of Etiquette (see the Honor table in the Book of Earth), or losing more than 3 points of Honor or Glory from a single breach of etiquette, makes Doji leave you.'},
      {name:'Kakita', clan:'Crane', cost:12, book:'core', page:'p. 242',
        about:'Doji’s husband: the first Emerald Champion, author of The Sword, a duellist and artisan without equal, and the man who began the Crane’s long feud with the Lion.',
        gifts:[
          {text:'Spend a Void Point to re-roll an Iaijutsu or Artisan roll, with +1k1 on the second roll; keep the better result.', how:'after', price:'a Void Point', note:'Offered in the result of an Iaijutsu or Artisan roll, once you have seen it: the sheet spends the Void Point, rolls again with +1k1 and keeps the better total.'},
          {text:'The price: every member of the Matsu family counts as your Sworn Enemy.', how:'remind'},
        ],
        demands:'Excellence with sword and brush. Lose a duel or an artistic competition and Kakita forsakes you; he also leaves if your Honor falls below 4.0.',
        flag:{honorBelow:4.0}},
      {name:'Agasha Kitsuki', clan:'Dragon', cost:11, book:'core', page:'p. 242',
        about:'Founder of the Kitsuki family and of the Kitsuki Method, which solves crimes by deduction.',
        gifts:[
          {text:'Use your Perception in place of your Awareness on any Skill or Trait roll that would use Awareness.', how:'auto', note:'Applied whenever your Perception is higher.'},
          {text:'When you spend a Void Point on a Skill or Trait roll to tell whether someone is lying, it gives +2k2 instead of +1k1.', how:'void', note:'Tick the Void Point in the roll preview, then tick “to tell whether someone is lying” beneath it.'},
        ],
        demands:'Always pursue the truth. Accept an answer to a problem, crime or puzzle that you know or believe to be false, and Kitsuki leaves you.'},
      {name:'Mirumoto', clan:'Dragon', cost:9, book:'core', page:'p. 242',
        about:'The Dragon’s great swordsman and Kakita’s rival, creator of the two-sword niten style, who died fighting Fu Leng.',
        gifts:[
          {text:'+1k1 on Skill rolls that use Agility; +3k1 instead when the Skill is one of the Mirumoto Bushi School’s Skills.', how:'auto'},
        ],
        demands:'Carry on his rivalry with Kakita. If you issue a challenge and lose the duel, or refuse a duel with someone trained in the Kakita Bushi School, Mirumoto leaves you. Losing a duel you were forced into does not count, unless your opponent was a Kakita.'},
      {name:'Akodo', clan:'Lion', cost:12, book:'core', page:'pp. 242–243',
        about:'Founder of the Lion Clan, the greatest general and tactician Rokugan has known.',
        gifts:[
          {text:'+1k0 on all Bugei Skill rolls except Iaijutsu.', how:'auto', note:'Bugei and Weapon Skills, not the Low weapon Skills (the sheet’s reading of “Bugei”, as for School choices).'},
          {text:'+1k1 on rolls on the Mass Battle Table.', how:'declare', note:'Tick it in the preview of a Battle roll made on the table.'},
          {text:'Enter a skirmish alongside at least one other Lion bushi and gain 1 extra Void Point, lost if not spent by the end of the skirmish.', how:'remind'},
        ],
        demands:'Be a soldier of steadfast courage and unimpeachable honour. Akodo leaves you if your Honor falls below 5.0, or if you willingly leave a battle or skirmish while other Lion are still fighting.',
        flag:{honorBelow:5.0}},
      {name:'Ikoma', clan:'Lion', cost:9, book:'core', page:'p. 243',
        about:'Founder of the Lion’s family of historians and storytellers, a cheerful rogue fond of drink, company and a brawl.',
        gifts:[
          {text:'+1k0 on all rolls that use Intelligence.', how:'auto'},
          {text:'+2k0 on damage when you fight unarmed with Jiujutsu.', how:'auto', note:'Added to the damage of the sheet’s Unarmed weapon.'},
        ],
        demands:'Live as he did. Refuse a drink, run from a fight, or insult an attractive or compelling woman, and Ikoma forsakes you.'},
      {name:'Kaimetsu-Uo', clan:'Mantis', cost:9, book:'core', page:'p. 243',
        about:'The Mantis Clan’s founder, son of Hida Osano-Wo and his Matsu bride, who won his clan a home by deeds rather than words.',
        gifts:[
          {text:'+1k1 on Willpower Trait and Skill rolls, except rolls to avoid being provoked.', how:'auto', note:'When a roll resists provocation, tick “Resisting provocation” in its preview to leave the bonus off.'},
          {text:'+3k0 when using the Improvised Weapon Emphasis of Jiujutsu.', how:'declare', note:'Tick it in the preview of a Jiujutsu roll with an improvised weapon.'},
          {text:'+1k1 on damage with improvised weapons.', how:'remind'},
        ],
        demands:'Take on every challenge, however strange. Back down from any physical competition or challenge, even a foot race, and Kaimetsu-Uo forsakes you.'},
      {name:'Gusai', clan:'Mantis', cost:5, book:'core', page:'p. 243',
        about:'The Mantis Ancestor who carried a knife into the Emperor’s presence to show what one person can do.',
        gifts:[
          {text:'+3k3 on Stealth or Sleight of Hand rolls to hide a weapon on your person.', how:'declare'},
        ],
        demands:'Never willingly go unarmed into the presence of a rival or an enemy.'},
      {name:'Asako', clan:'Phoenix', cost:5, book:'core', page:'p. 243',
        about:'Shiba’s favoured follower and founder of the henshin, who prized friendship above everything.',
        gifts:[
          {text:'Each of your Ally Advantages gains +1 Devotion at no cost.', how:'remind'},
          {text:'+1k0 on Social Skill rolls made against someone who is your Ally.', how:'declare'},
          {text:'If an Ally ever betrays you, you gain the Driven Disadvantage (destroy the betrayer) for no points.', how:'remind'},
        ],
        demands:'Be as devoted to your friends as you expect them to be to you. Betray or abandon a friend and Asako forsakes you.'},
      {name:'Shiba', clan:'Phoenix', cost:9, book:'core', page:'p. 243',
        about:'The Phoenix Clan’s founder, who served the Isawa, wrote down the Tao, and still watches over his descendants.',
        gifts:[
          {text:'+1k1 on Intelligence rolls and on Skill rolls that use Intelligence.', how:'auto'},
          {text:'Add your Intelligence to your Armor TN at all times.', how:'auto'},
          {text:'Enter a skirmish alongside a member of the Isawa family and gain 1 extra Void Point, lost if not spent by the end of the skirmish.', how:'remind'},
        ],
        demands:'Keep high Honor and your oath to the Isawa. Shiba leaves you if your Honor falls below 4.0, if you willingly disobey a higher-ranking Isawa, or if you willingly leave a skirmish while an Isawa ally stays behind.',
        flag:{honorBelow:4.0}},
      {name:'Bayushi', clan:'Scorpion', cost:12, book:'core', page:'pp. 243–244',
        about:'The Scorpion Clan’s founder: subtle, ruthless, honest in his own cruel way, and devoted to his follower Shosuro.',
        gifts:[
          {text:'If you trained in a Bayushi School (such as Bayushi Bushi or Bayushi Courtier), +1k0 on all your School Skills.', how:'auto'},
          {text:'With that training, a Void Point spent on a School Skill roll gives +2k2 instead of +1k1.', how:'void', note:'Tick the Void Point in a School Skill roll’s preview; the extra +1k1 follows by itself.'},
          {text:'With a Kharmic Tie to another character, each of you may spend the other’s Void Points; if one of you dies, the other gains the Momoku Disadvantage for no points.', how:'remind'},
        ],
        demands:'Loyalty. Willingly and knowingly betray the Scorpion Clan and Bayushi leaves you; he also leaves if your Honor reaches 5.0 or more.',
        flag:{honorAtLeast:5.0}},
      {name:'Shosuro', clan:'Scorpion', cost:8, book:'core', page:'p. 244',
        about:'Bayushi’s beloved follower, taken by the Lying Darkness and long imprisoned, who now favours her worthy descendants.',
        gifts:[
          {text:'+3k1 on Stealth, Acting and Sincerity (Deceit) rolls.', how:'auto', note:'Stealth and Acting are automatic; tick “Lying” in a Sincerity roll’s preview for Deceit.'},
        ],
        demands:'Never betray the Scorpion Clan, disobey your superiors in it, or fall to the Lying Darkness or the Shadow Dragon.'},
      {name:'Hida Atarasi', clan:'Spider', cost:7, book:'core', page:'p. 244',
        about:'Hida’s eldest son and the first Crab Thunder, who fell to the Shadowlands’ Taint and was destroyed by his own father.',
        gifts:[
          {text:'Each round of a skirmish, spend a Void Point or take 1 point of Shadowlands Taint (your choice) to add your Taint Rank or your Earth (your choice) in unkept dice to that round’s attack and damage rolls.', how:'pay', price:'a Void Point or a point of Taint', note:'Tick it in the attack roll’s preview (the higher of the two is added). When you roll, the sheet asks which you pay: it spends a Void Point itself; a point of Taint is yours to record. In a combat Round the same dice go on that Round’s damage by themselves.'},
        ],
        demands:'Atarasi despises purity. If your Honor reaches 3.0 or more, or you ever lose any of your Taint, he forsakes you.',
        flag:{honorAtLeast:3.0}},
      {name:'Kuni Yori', clan:'Spider', cost:5, book:'core', page:'p. 244',
        about:'A Crab shugenja seduced by the Shadowlands who betrayed his clan and became an undead master of maho.',
        gifts:[
          {text:'+1k0 on Sincerity (Deceit) rolls and on all maho Casting Rolls.', how:'auto', note:'Maho Casting Rolls are automatic; tick “Lying” in a Sincerity roll’s preview for Deceit.'},
          {text:'The price: every maho spell you cast gives you 1 extra point of Taint.', how:'remind'},
        ],
        demands:'None. He is sure his guidance will lead you to complete corruption.'},
      {name:'Moto', clan:'Unicorn', cost:10, book:'core', page:'p. 244',
        about:'The desert warrior who swore himself to Shinjo and brought his people into the Ki-Rin, bound by nothing but his own choices.',
        gifts:[
          {text:'+2k2 on rolls to resist being physically restrained (such as a grapple) or mentally influenced (such as Temptation).', how:'declare'},
          {text:'A spell that would restrain your movement has its Casting TN raised by 5 × your Willpower.', how:'remind'},
        ],
        demands:'Obey only your lord and clan. Knowingly let yourself be controlled by someone who is not your rightful Unicorn superior (for example, a courtier’s blackmail) and Moto leaves you.'},
      {name:'Shinjo', clan:'Unicorn', cost:8, book:'core', page:'p. 244',
        about:'The Unicorn Clan’s founder, endlessly curious and compassionate, who led her Ki-Rin out into the world.',
        gifts:[
          {text:'+1k1 on Investigation rolls to understand something new, strange or enigmatic.', how:'declare'},
          {text:'+1k1 on Awareness rolls made with Etiquette or Sincerity (Honesty).', how:'auto', note:'Etiquette is automatic; tick “Telling the truth” in a Sincerity roll’s preview for Honesty.'},
        ],
        demands:'Act with compassion, even towards bitter enemies. Fail to show mercy to a rival or an enemy and Shinjo leaves you (the Kolat and servants of the Lying Darkness or the Shadow Dragon excepted).'},
      // The Great Clans: its eight "New ... Ancestors" sections. It prints no Crane section.
      {name:'Hiruma', clan:'Crab', cost:11, book:'gc', page:'p. 42',
        about:'Founder of the Hiruma family, a practical warrior who beat stronger foes with speed, precision and stealth.',
        gifts:[
          {text:'+1k0 on Stealth, Kenjutsu and Kyujutsu rolls.', how:'auto'},
        ],
        demands:'Never willingly betray the Crab Clan. Hiruma has little use for the finer points of Bushido, so he also leaves you if your Honor rises above 5.0.',
        flag:{honorAbove:5.0}},
      {name:'Kaiu', clan:'Crab', cost:9, book:'gc', page:'p. 42',
        about:'The master smith who forged the Crab’s ancestral sword that killed Hatsu-Suru no Oni, founder of the Empire’s finest engineering school, whose line built the Carpenter Wall.',
        gifts:[
          {text:'A Void Point spent on a Craft or Engineering roll gives +3k1 instead of +1k1.', how:'void', note:'Tick the Void Point in the roll preview; the extra +2k0 follows by itself.'},
          {text:'Once a game year, a suitable Craft roll at TN 50 makes a minor awakened nemuranai. The GM chooses its powers, which start modest (such as +1k0 to a Skill or to damage) and grow with time.', how:'remind'},
        ],
        demands:'No deliberately poor work. Produce Craft or Engineering work below your best (keeping low dice on purpose counts) and Kaiu leaves you; the GM judges the subtler cases.'},
      {name:'Agasha', clan:'Dragon', cost:6, book:'gc', page:'p. 104',
        who:'She appears only to her descendants within the Dragon Clan.',
        about:'The reclusive student of the Elements who founded the Agasha family and, unlike most of it, stayed loyal to the Dragon.',
        gifts:[
          {text:'+1k0 on Spell Casting Rolls for spells of any Element but Void.', how:'auto'},
          {text:'+1k1 on Spellcraft rolls.', how:'auto'},
        ],
        demands:'Agasha was a pacifist: serve in a war and she leaves you. A war against the Shadowlands is the one exception.'},
      {name:'Agasha, most favoured', clan:'Dragon', cost:10, book:'gc', page:'p. 104',
        who:'She appears only to her descendants within the Dragon Clan. At 10 points you are among her most favoured.',
        about:'The reclusive student of the Elements who founded the Agasha family and, unlike most of it, stayed loyal to the Dragon.',
        gifts:[
          {text:'+1k0 on Spell Casting Rolls for spells of any Element but Void.', how:'auto'},
          {text:'+1k1 on Spellcraft rolls.', how:'auto'},
          {text:'You know her secret spell, Transmute (The Great Clans p. 104).', how:'remind', note:'Add Transmute to your spells yourself: the sheet’s spell list does not include it.'},
        ],
        demands:'Agasha was a pacifist: serve in a war and she leaves you. A war against the Shadowlands is the one exception.'},
      {name:'Togashi Yamatsu', clan:'Dragon', cost:7, book:'gc', page:'p. 104',
        who:'Only members of the Dragon’s tattooed orders: he has no descendants of his own.', check:{tattooed:true},
        about:'The tattooed man who captured Iuchiban’s soul during the Bloodspeaker’s second rampage, and whose spirit now guides later tattooed men.',
        gifts:[
          {text:'+2k2 on Willpower rolls to resist being possessed or magically controlled.', how:'declare'},
          {text:'Two Ranks of Magic Resistance that work against maho only.', how:'remind'},
        ],
        demands:'Stay clean of the Shadowlands. Reach a Taint of 1.0 or more, or willingly use maho or any Shadowlands power, and Yamatsu leaves you.',
        flag:{taint:true}},
      {name:'Kitsu', clan:'Lion', cost:6, book:'gc', page:'p. 140',
        who:'Only true-blooded descendants of Kitsu.', check:{family:['Kitsu']},
        about:'The spirit Soli Tendo, who took human form, founded the Kitsu family and died defending the clan he had joined so unwillingly.',
        gifts:[
          {text:'+1k1 on Lore: Spirit Realms rolls.', how:'auto'},
          {text:'You can sense spirits and spirit portals: a Perception roll, usually at TN 25 (the GM may raise it for well-hidden ones).', how:'remind'},
        ],
        demands:'Never willingly harm an uncorrupted member of the five ancient races or one of their descendants, and never willingly work with a Tsuno.'},
      {name:'Matsu Hitomi', clan:'Lion', cost:7, book:'gc', page:'p. 140',
        about:'One of the Lion’s greatest heroes, a woman of flawless honour and courage.',
        gifts:[
          {text:'+1k1 on rolls to resist Temptation, Intimidation and Fear.', how:'declare'},
        ],
        demands:'Never knowingly betray your daimyo or the Lion Clan. Hitomi also leaves you if your Honor falls below 5.0.',
        flag:{honorBelow:5.0}},
      {name:'Moshi Azami', clan:'Mantis', cost:6, book:'gc', page:'p. 170',
        who:'Before the twelfth century she guides the Centipede Clan alone (the sheet does not list the Centipede).',
        about:'Once an Isawa, she received the blessing of Lady Sun and made the Centipede the Sun Goddess’s most devout followers.',
        gifts:[
          {text:'The Sun never harms you (no sunburn or dehydration), and you have Reduction 5 against fire, ordinary or magical.', how:'remind'},
        ],
        demands:'Any act of impiety or blasphemy against the Fortunes or the Celestial Heavens, even by accident, and Azami leaves you.'},
      {name:'Osusuki & Akomachi', clan:'Mantis', also:['Fox'], cost:5, book:'gc', page:'p. 170',
        who:'Only members of the Kitsune family with a direct blood tie to them.', check:{family:['Kitsune']},
        about:'Two kitsune spirits, a man and a woman, who allied with the young Fox Clan and married into the Kitsune family, joining the two by blood.',
        gifts:[
          {text:'You can speak with animals and with animal shapeshifter spirits, and you can always find food and water in the wilderness.', how:'remind'},
        ],
        demands:'Never knowingly or willingly kill an animal or an animal spirit. Self-defence they forgive.'},
      {name:'Isawa', clan:'Phoenix', cost:12, book:'gc', page:'p. 202',
        about:'The greatest shugenja of his age, for whose help against Fu Leng the Kami Shiba swore to protect Isawa’s line for ever.',
        gifts:[
          {text:'+1k1 on Spellcraft rolls for Spell Research.', how:'declare'},
          {text:'Each time you gain a Shugenja School Rank, learn one more spell.', how:'remind'},
        ],
        demands:'Isawa thought his family’s magic the finest. Lose a magical or scholarly contest to anyone who is not an Isawa and he leaves you.'},
      {name:'Naka Kaeteru', clan:'Phoenix', cost:10, book:'gc', page:'p. 202',
        about:'A wandering monk and teacher of the early Empire whom the Phoenix named the first Grandmaster of the Elements.',
        gifts:[
          {text:'Two hours of Meditation and a Meditation roll at TN 30 regain one spell slot in each Ring.', how:'remind'},
        ],
        demands:'Keep out of worldly affairs. The book’s measure is more than 3 Ranks in Courtier or in any Merchant or Low Skill; the GM also judges your part in politics and money.',
        flag:{worldly:true}},
      {name:'Yogo', clan:'Scorpion', cost:6, book:'gc', page:'p. 230',
        about:'Asako’s husband, cursed by Fu Leng to betray the one he loved, who joined the Scorpion and began the ward magic of the Yogo.',
        gifts:[
          {text:'+1k1 on the Spell Casting Roll for a Wards spell.', how:'auto', note:'Automatic for a spell the sheet lists as Wards; for any other Wards spell, tick it in the Casting Roll’s preview.'},
          {text:'The price of his blood: you have Bad Fortune (Yogo Curse) for no points.', how:'remind'},
        ],
        demands:'Never fall in love: that is how his curse takes you.'},
      {name:'Soshi Saibankan', clan:'Scorpion', cost:5, book:'gc', page:'p. 230',
        about:'The eccentric Scorpion judge who founded Rokugan’s system of magistrates.',
        gifts:[
          {text:'A Void Point spent on a roll using Perception or Lore: Law gives +3k1 instead of +1k1.', how:'void', note:'Tick the Void Point in the roll preview; the extra +2k0 follows by itself.'},
        ],
        demands:'Never knowingly break the law, or let it be broken in front of you, unless your superiors in the Scorpion Clan ordered it.'},
      {name:'Otaku', clan:'Unicorn', cost:7, book:'gc', page:'p. 260',
        who:'Only women descended from her line (the sheet does not record gender).', check:{family:['Utaku', 'Otaku']},
        about:'Founder of the Otaku (now Utaku) family and the first Unicorn Thunder, who made hers a family led by women.',
        gifts:[
          {text:'+1k1 on Horsemanship rolls.', how:'auto'},
          {text:'+1k0 on attack rolls against a male opponent.', how:'declare'},
        ],
        demands:'Never be deliberately cruel to a horse, and never lose a duel or contest that you challenged a man to.'},
      {name:'Iuchi', clan:'Unicorn', cost:8, book:'gc', page:'p. 260',
        who:'Only shugenja of his bloodline.', check:{family:['Iuchi'], shugenja:true},
        about:'Master of the foreign magic that kept the Unicorn alive beyond the Burning Sands, from whom meishodo grew.',
        gifts:[
          {text:'You have no Deficient Element while he stays.', how:'auto', note:'Your Casting Roll no longer loses the die your Deficiency takes. The Spells tab still lists spells by your School Rank with the Deficiency; ask your GM about those.'},
        ],
        demands:'Never pass up a chance to learn more of magic, however dangerous or forbidden.'},
      {name:'Chuda Bikimi', clan:'Spider', cost:3, book:'gc', page:'p. 283', noReturn:true,
        about:'A maho-tsukai who took his victims unseen from all over the Empire; he still blesses those at the same dark work.',
        gifts:[
          {text:'+1k0 on Stealth rolls.', how:'auto'},
          {text:'A shugenja who practises maho may spend a spell slot for +1k1 on a Stealth roll instead.', how:'pay', price:'a spell slot', note:'Tick it in the Stealth roll’s preview. When you roll, the sheet asks you to mark the slot used: it cannot choose the Element for you.'},
        ],
        demands:'Never willingly show yourself to an enemy. Bikimi leaves you the first time, and his favour never returns.'},
      {name:'Yogo Junzo', clan:'Spider', cost:6, book:'gc', page:'p. 283',
        about:'The Scorpion lord who opened the Black Scrolls after his clan’s fall, became a self-willed undead, and burned temples and libraries.',
        gifts:[
          {text:'+2 to the total of every Spell Casting Roll for each Forbidden Knowledge Advantage you have and for each Rank of Taint; +4 each instead for a maho spell.', how:'auto'},
        ],
        demands:'Always take forbidden knowledge when it is offered (a new Forbidden Knowledge Advantage included), even at the cost of your secrecy.'},
      // Secrets of the Empire pp. 243-247: the Imperial families, the Minor Clans, ronin and the
      // Brotherhood of Shinsei.
      {name:'Otomo', clan:'Imperial', cost:6, book:'sote', page:'p. 243',
        about:'The sly, much-underestimated founder of the Otomo, whose tongue and wits rarely came off second best.',
        gifts:[
          {text:'+1k1 on Courtier rolls made with the Manipulation or Rhetoric Emphasis.', how:'declare'},
        ],
        demands:'Never willingly betray the Imperial house, and never be tricked or outmanoeuvred by a political rival of equal or lower Status. A failed Social roll on its own does not count (the book’s note to the GM).'},
      {name:'Seppun', clan:'Imperial', cost:10, book:'sote', page:'p. 243', session:'seppun-void',
        about:'The first follower of the Kami, and the first of the old priesthood to embrace the ways of Shintao wholeheartedly.',
        gifts:[
          {text:'Once a session, the benefit of a Void Point without spending one.', how:'pay', price:'once a session', note:'Tick it in a roll’s preview for +1k1 and keep your Void Point. For another use of a Void Point (Armor TN, damage and so on), press “Use it now” on this card and apply it yourself.'},
        ],
        demands:'Utter piety and devotion to the Hantei. Embrace a heretical belief, or put your own needs or wishes before the Imperial house in the smallest way, and Seppun leaves you.'},
      {name:'Miya', clan:'Imperial', cost:5, book:'sote', page:'p. 244',
        about:'The first Miya, who carried word of the victory over Fu Leng across the Empire and helped rebuild what the First War destroyed.',
        gifts:[
          {text:'While on the Imperial house’s business, you ignore the effects of going without rest or sleep for as many days as your Honor Rank.', how:'remind'},
        ],
        demands:'Share his compassion. Turn away from people suffering from war or disaster and Miya leaves you.'},
      {name:'Ichiro Fureheshu', clan:'Badger', cost:9, book:'sote', page:'p. 244',
        about:'Founder of the Fureheshu vassal family, strong enough to kill an oni with his bare hands.',
        gifts:[
          {text:'On a Skill roll with a physical Trait, spend a Void Point to use your Strength in its place.', how:'pay', price:'a Void Point', note:'Offered in the roll preview when your Strength is the higher; the sheet spends the Void Point when you roll.'},
        ],
        demands:'Embrace strength as he did: lose a contest of Strength and he leaves you.'},
      {name:'Komori Iongi', clan:'Bat', cost:5, book:'sote', page:'p. 244', session:'iongi-void',
        about:'Yoritomo Iongi, a Mantis samurai who recovered the Tetsubo of Thunder and later swore fealty to the Bat Clan.',
        gifts:[
          {text:'One extra Void Point each session.', how:'pay', price:'once a session', note:'Tick it in a roll’s preview for +1k1 without spending one of your own. For another use, press “Use it now” on this card and apply it yourself. In a skirmish it is still your one Void Point for the Round.'},
        ],
        demands:'Live gloriously. Pass up a chance to do something heroic or glorious and Iongi forsakes you.'},
      {name:'Hida Heichi', clan:'Boar', cost:4, book:'sote', page:'p. 244',
        about:'The Boar Clan’s founder, brave but also wise and tactful: he talked the Shakoki Dogu into freeing his people and found a way to satisfy the Emperor.',
        gifts:[
          {text:'+1k1 on Social Skill rolls against someone more powerful than you.', how:'declare'},
        ],
        demands:'Keep his self-control: lose your temper in a social situation and Heichi forsakes you.'},
      {name:'Tonbo Kuyuden', clan:'Dragonfly', cost:3, book:'sote', page:'p. 244',
        about:'The first true Dragonfly daimyo, who avenged his father and then set down the sword for diplomacy.',
        gifts:[
          {text:'+1k1 on Courtier or Etiquette rolls to calm violence or find a peaceful end to a conflict.', how:'declare'},
        ],
        demands:'Never willingly choose violence while diplomacy is still possible.'},
      {name:'Usagi Reichin', clan:'Hare', cost:7, book:'sote', page:'p. 244',
        about:'The Hare Clan’s cheerful founder, a clever and courageous enemy of the Bloodspeaker cult.',
        gifts:[
          {text:'+1k1 on rolls to resist Fear; +2k2 instead when a Bloodspeaker causes it.', how:'declare'},
        ],
        demands:'Never flee a fight with a Bloodspeaker while it can still be won.'},
      {name:'Toku', clan:'Monkey', cost:3, book:'sote', page:'pp. 244–245', session:'toku-luck',
        about:'The Monkey Clan’s founder, a hero famous for his extraordinary luck.',
        gifts:[
          {text:'You count as having a Rank of Luck (one more Rank if you already have Luck): once a session, re-roll a whole roll and keep the higher result.', how:'after', price:'once a session', note:'Offered in the result of any roll, beside your own Luck.'},
        ],
        demands:'An idealist of Bushido: Toku leaves you if your Honor falls below 5.0, or if you do something outrageously dishonourable whatever your Honor.',
        flag:{honorBelow:5.0}},
      {name:'Tsi', clan:'Oriole', cost:6, book:'sote', page:'p. 245',
        about:'The ronin swordsmith of Tsi Wenfu’s line whose skill made the Emperor declare his family Imperial vassals.',
        gifts:[
          {text:'Your Raises on Craft: Swordsmithing rolls have no limit.', how:'info', note:'Shown in the preview of a Craft: Swordsmithing roll. If your GM uses this book’s alternate crafting rules, Tsi gives one Free Raise instead.'},
        ],
        demands:'Swords are an art, not a way to kill: use one of your own swords in combat for anything but self-defence and Tsi leaves you.'},
      {name:'Morito Garin', clan:'Ox', cost:5, book:'sote', page:'p. 245',
        about:'The Ox who restored his clan’s name after the purge of the Kolat and hunted down what was left of them.',
        gifts:[
          {text:'+1k1 on Perception or Awareness rolls to find out where someone’s loyalties truly lie.', how:'declare'},
        ],
        demands:'Never knowingly work with the Kolat, or leave them be when you could oppose them.'},
      {name:'Doji Suzume', clan:'Sparrow', cost:4, book:'sote', page:'p. 245',
        about:'Founder of the Sparrow Clan, whose careless remark the Empire took for deep wisdom.',
        gifts:[
          {text:'+1k1 on Social Skill rolls to persuade others to follow your lead or example.', how:'declare'},
          {text:'Once in your life, when the GM chooses, a passing remark of yours is taken as profound wisdom, with consequences that may last a lifetime.', how:'remind'},
        ],
        demands:'Stand by the people your words have gathered: abandon them and Suzume forsakes you.'},
      {name:'Agasha Kasuga', clan:'Tortoise', cost:5, book:'sote', page:'p. 245',
        about:'A deeply curious man who put the Empire’s security before everything, his own purity included.',
        gifts:[
          {text:'+1k1 on a Skill roll for a dishonourable act (one that costs you Honor) that your duty to the Imperial house requires.', how:'declare'},
        ],
        demands:'Put the Empire first: set your own Honor above its needs and Kasuga leaves you.'},
      {name:'Sun Tao', clan:'Ronin', cost:10, book:'sote', page:'p. 246',
        who:'Only a true ronin: a clan ronin can never have a ronin Ancestor.',
        about:'Perhaps the greatest ronin soldier in Rokugan’s history; many claim his blood, few win his guidance.',
        gifts:[
          {text:'+1k0 on Battle rolls.', how:'auto'},
          {text:'After a Bugei Skill roll fails, spend a Void Point to roll 1k1 and add it to the roll; you lose the benefit of any Raises on it.', how:'after', price:'a Void Point', note:'Offered in the result of a Bugei Skill roll: the sheet spends the Void Point and adds the die to the dice you kept.'},
        ],
        demands:'Keep learning war: turn down a chance to serve or train with a military force you have not served before and Sun Tao leaves you.'},
      {name:'Chiroru', clan:'Ronin', cost:8, book:'sote', page:'p. 246',
        who:'Only a true ronin: a clan ronin can never have a ronin Ancestor.',
        about:'Leader of the ronin vanguard at the Battle of Sleeping River, who refused the Fox Clan’s offer of fealty to stay one of his wave-men.',
        gifts:[
          {text:'Choose up to your Void Rank of “siblings”: you have a Kharmic Tie with each, and always know when one of them is in danger.', how:'remind', note:'The book suggests choosing them one at a time in play; the GM may allow a new one if a sibling dies or betrays you.'},
        ],
        demands:'Loyalty runs both ways: forsake, abandon or betray a sibling and Chiroru forsakes you.'},
      {name:'Miyuko', clan:'Ronin', cost:12, book:'sote', page:'p. 246',
        who:'Only ronin shugenja (and only a true ronin).', check:{shugenja:true},
        about:'A peasant woman who was Naka Kaeteru’s first and greatest pupil, and who turned down the Phoenix to teach across the Empire.',
        gifts:[
          {text:'You count as one School Rank higher when casting: +1k0 on Spell Casting Rolls.', how:'auto'},
          {text:'The same higher Rank counts for the Mastery Level of spells you may cast and for their effects.', how:'remind', note:'The Spells tab still lists spells by your School Rank.'},
        ],
        demands:'Share what you know: refuse to share magical knowledge with an honourable person and Miyuko leaves you.'},
      {name:'Basso', clan:'Brotherhood of Shinsei', cost:9, book:'sote', page:'p. 247',
        who:'The Shinmaki sect.', check:{school:'Shinmaki Order [Monk]'},
        about:'Founder of the Shinmaki, the Brotherhood’s most controversial sect, who claimed Shinsei himself wrote the Diamond Sutra.',
        gifts:[
          {text:'As a Complex Action, a Meditation (Void) roll at a TN the GM sets lets you see through any illusion or deception.', how:'remind'},
        ],
        demands:'At least four hours of meditation every day, and complete asceticism: any voluntary lapse, however small, and Basso leaves you.'},
      {name:'Sakura', clan:'Brotherhood of Shinsei', cost:10, book:'sote', page:'p. 247',
        who:'Shintao monks.', check:{devotion:'Shintao'},
        about:'Said to be the first mortal to see that Enlightenment was possible; some traditions hold that Shinsei learned from her.',
        gifts:[
          {text:'You count as one Insight Rank higher for learning and using Kiho.', how:'remind'},
        ],
        demands:'Share enlightenment: pass up a chance to teach it, or the Tao, and Sakura leaves you.'},
      {name:'Mizumoto', clan:'Brotherhood of Shinsei', cost:7, book:'sote', page:'p. 247',
        who:'The Questioner sect (the GM decides who belongs).',
        about:'A Crane courtier of Hantei Genji’s day who retired to the Brotherhood and became a great scholar of the Tao.',
        gifts:[
          {text:'+1k1 on rolls that use Intelligence.', how:'auto'},
        ],
        demands:'Never willingly pass up a chance to learn about a teaching, sect or belief of the Brotherhood.'},
      {name:'Togashi Kaze', clan:'Brotherhood of Shinsei', cost:5, book:'sote', page:'p. 247',
        who:'Fortunist monks of the Kaimetsu-Uo order.', check:{devotion:'Fortunist'},
        about:'A Dragon who founded what became the Order of Kaimetsu-Uo, teaching monks a meditative fighting art.',
        gifts:[
          {text:'While your Meditation Rank is at least your Jiujutsu Rank, your unarmed attacks gain a Free Raise.', how:'info', note:'Shown in an unarmed attack’s preview while your Ranks allow it.'},
        ],
        demands:'Violence only in defence, and never to kill: kill a human being with an unarmed attack and Kaze leaves you.'},
    ];
    api.HOW = {auto:'Automatic', void:'With a Void Point', declare:'Tick it when you roll', pay:'Choose it when you roll',
      after:'After the roll', info:'Shown when you roll', remind:'Reminder'};
    api.tag = function(g){ return api.HOW[g.how] + (g.price ? ' · ' + g.price : ''); };
    api.byName = function(name){
      return api.LIBRARY.find(function(a){ return a.name === name; }) || null;
    };
    api.bookPage = function(a){ return api.BOOK[a.book] + ' ' + a.page; };
    // How the faction reads on a card and in the picker.
    api.factionLabel = function(clan){
      if(clan === 'Imperial') return 'Imperial families';
      if(clan === 'Ronin' || clan === 'Brotherhood of Shinsei') return clan;
      return clan + ' Clan';
    };

    // ---------- Saved state: one hidden f_ field, so the trunk's own save and load carry it ----------
    // {v:1, name, lost, regained, final, gm[, sessionUsed]}. final is true exactly when the favour
    // was lost after being regained once, or lost at all for an Ancestor who never returns; gm
    // records that a Spider Ancestor was taken outside the Spider Clan; sessionUsed, written once a
    // once-a-session gift is used, says whether this session's use is spent.
    api.field = function(){ return $(api.FIELD); };
    api.valid = function(s){
      if(!s || typeof s !== 'object' || Array.isArray(s) || s.v !== api.REVISION) return false;
      const a = api.byName(s.name);
      if(!a) return false;
      const keys = ['v', 'name', 'lost', 'regained', 'final', 'gm', 'sessionUsed'];
      if(Object.keys(s).some(function(k){ return keys.indexOf(k) === -1; })) return false;
      if(['lost', 'regained', 'final', 'gm'].some(function(k){ return typeof s[k] !== 'boolean'; })) return false;
      if('sessionUsed' in s && typeof s.sessionUsed !== 'boolean') return false;
      if(a.noReturn && s.regained) return false;
      return s.final === (s.lost && (s.regained || !!a.noReturn));
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
    api.family = function(){ return $('f_family') ? $('f_family').value.trim() : ''; };
    api.schoolNames = function(){
      return (typeof getSchoolsList === 'function' ? getSchoolsList() : []).map(function(s){ return s && s.name; }).filter(Boolean);
    };
    api.schoolEntries = function(){
      if(typeof findAnySchoolLibraryEntry !== 'function') return [];
      return api.schoolNames().map(function(n){ return findAnySchoolLibraryEntry(n); }).filter(Boolean);
    };
    api.isShugenja = function(){ return api.schoolEntries().some(function(e){ return !!e.shugenja; }); };
    api.tattooed = function(){
      return api.schoolEntries().some(function(e){ return (e.tags || []).indexOf('tattooed order') !== -1 || /tattooed/i.test(e.name || ''); });
    };
    api.monkSchools = function(){ return api.schoolEntries().filter(function(e){ return !!e.brotherhood; }); };
    api.monk = function(){
      return api.monkSchools().length > 0 || (typeof activeSchoolIsBrotherhood === 'function' && activeSchoolIsBrotherhood());
    };
    api.serves = function(a){ return [a.clan].concat(a.also || []); };
    // Loyalty: the Ancestor's own Clan or faction. A monk of the Brotherhood is guided by its
    // Ancestors whatever Clan the sheet still records for them.
    api.ownClan = function(a){
      if(!a) return false;
      const mine = api.clanKey(api.clan());
      if(mine && api.serves(a).some(function(c){ return api.clanKey(c) === mine; })) return true;
      return a.clan === 'Brotherhood of Shinsei' && api.monk();
    };
    api.spiderGuest = function(a){ return !!a && a.clan === 'Spider' && !api.ownClan(a); };
    api.choosable = function(a){ return api.ownClan(a) || (a && a.clan === 'Spider'); };
    // "the Crab Clan", "the Imperial families", "ronin": whom an Ancestor guides.
    api.guidesWhom = function(a){
      return api.serves(a).map(function(c){ return c === 'Ronin' ? 'ronin' : 'the ' + api.factionLabel(c); }).join(' and ');
    };
    api.honor = function(){ const v = parseFloat($('f_honorPts') ? $('f_honorPts').value : ''); return Number.isFinite(v) ? v : null; };
    api.taint = function(){ const v = parseFloat($('f_taint') ? $('f_taint').value : ''); return Number.isFinite(v) && v > 0 ? v : 0; };
    api.trait = function(name){ return typeof getTraitValueByName === 'function' ? (parseInt(getTraitValueByName(name), 10) || 0) : 0; };
    api.ring = function(key){ const e = $('ring_' + key); return e ? (parseInt(e.value || '0', 10) || 0) : 0; };
    api.bayushiTrained = function(){ return api.schoolNames().some(function(n){ return /^Bayushi\b/i.test(n); }); };

    // Why a chosen Ancestor's gifts are not applied right now; '' when they are.
    api.inactiveReason = function(s){
      if(!s) return 'none';
      const a = api.byName(s.name);
      if(s.lost) return s.final ? 'Favour lost for good' : 'Favour lost';
      if(!api.choosable(a)) return a.name + ' guides only ' + api.guidesWhom(a) + (api.clan() ? '; your Clan is ' + api.clan() : '') + ', so the gifts are not applied.';
      if(api.spiderGuest(a) && !s.gm) return 'A Spider Ancestor favours someone outside the Spider Clan only with the GM’s permission.';
      return '';
    };
    // The Ancestor whose gifts apply now, or null.
    api.active = function(){
      const s = api.current();
      return s && !api.inactiveReason(s) ? api.byName(s.name) : null;
    };
    api.is = function(name){ const a = api.active(); return !!a && a.name === name; };
    // Courtier, or a Merchant or Low Skill, above Rank 3: Naka Kaeteru's measure of worldliness.
    api.worldlySkills = function(){
      const out = [];
      document.querySelectorAll('#skillsBody tr').forEach(function(row){
        const n = row.querySelector('.sk-name'), r = row.querySelector('.sk-rank');
        const rank = r ? (parseInt(r.value || '0', 10) || 0) : 0;
        if(!n || !n.value.trim() || rank <= 3) return;
        const lib = api.libSkill(n.value);
        if(api.skillFamily(n.value) === 'courtier' || (lib && ['Merchant', 'Low', 'Weapon (Low)'].indexOf(lib.cat) !== -1)) out.push(n.value.trim() + ' ' + rank);
      });
      return out;
    };
    // Warnings from demands the sheet can measure. They never switch the favour off themselves.
    api.flags = function(a, s){
      const out = [];
      if(!a || !a.flag || (s && s.lost)) return out;
      const honor = api.honor();
      const leaves = ': by the book ' + a.name + ' leaves you. If your GM agrees, press “' + api.BADGE + '”.';
      if(a.flag.honorBelow !== undefined && honor !== null && honor < a.flag.honorBelow){
        out.push('Your Honor is ' + honor.toFixed(1) + ', below ' + a.flag.honorBelow.toFixed(1) + leaves);
      }
      if(a.flag.honorAtLeast !== undefined && honor !== null && honor >= a.flag.honorAtLeast){
        out.push('Your Honor is ' + honor.toFixed(1) + ', ' + a.flag.honorAtLeast.toFixed(1) + ' or more' + leaves);
      }
      if(a.flag.honorAbove !== undefined && honor !== null && honor > a.flag.honorAbove){
        out.push('Your Honor is ' + honor.toFixed(1) + ', above ' + a.flag.honorAbove.toFixed(1) + leaves);
      }
      if(a.flag.taint && api.taint() > 0){
        out.push('Your Taint Rank is ' + api.taint() + ': by the book ' + a.name + ' leaves anyone who gains Shadowlands Taint. If your GM agrees, press “' + api.BADGE + '”.');
      }
      if(a.flag.worldly){
        const worldly = api.worldlySkills();
        if(worldly.length) out.push(worldly.join(', ') + ': more than 3 Ranks, the book’s measure of worldliness' + leaves);
      }
      return out;
    };
    // Warnings from loyalties narrower than the faction, where the sheet can see them. Never a block.
    api.checks = function(a, s){
      const out = [];
      if(!a || !a.check || (s && s.lost)) return out;
      const c = a.check, ask = '; check with your GM.';
      if(c.family){
        const fam = api.family();
        if(fam && c.family.indexOf(fam) === -1) out.push(a.who + ' Your Family is ' + fam + ask);
      }
      if(c.shugenja && !api.isShugenja()) out.push(a.who + ' You are not trained in a shugenja School' + ask);
      if(c.tattooed && !api.tattooed()) out.push(a.who + ' You are not trained in a tattooed order’s School' + ask);
      if(c.school && api.schoolNames().indexOf(c.school) === -1) out.push(a.who + ' You are not trained in the ' + c.school.replace(/\s*\[Monk\]$/, '') + ask);
      if(c.devotion){
        const monks = api.monkSchools();
        if(!monks.some(function(e){ return e.devotion && e.devotion.type === c.devotion; })){
          out.push(a.who + (monks.length ? ' Your order’s devotion is ' + ((monks[0].devotion && monks[0].devotion.type) || 'none') : ' You are not trained in a Brotherhood School') + ask);
        }
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
    // The highest Rank on the Skills table for a Skill, whatever Emphasis its row names.
    api.skillRank = function(name){
      const want = api.skillId(name);
      let best = 0;
      document.querySelectorAll('#skillsBody tr').forEach(function(row){
        const n = row.querySelector('.sk-name'), r = row.querySelector('.sk-rank');
        if(n && r && api.skillId(n.value) === want) best = Math.max(best, parseInt(r.value || '0', 10) || 0);
      });
      return best;
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
    api.mod = function(a, rolled, kept, note, total){
      return {source:'adv-config', label:'Ancestor: ' + a.name, rolledDelta:rolled, keptDelta:kept, totalDelta:total || 0, note:note};
    };
    // A Free Raise, or Raises without limit: printed, never a die (Phase 4.5's rule for Friend of
    // the Elements: the sheet has no Raise mechanic to spend it through).
    api.info = function(a, display, note){
      return {source:'adv-config', label:'Ancestor: ' + a.name, informational:true, display:display, note:note};
    };
    api.armed = function(context, key){
      return typeof RD4515 === 'object' && !!RD4515 && RD4515.armed(context).indexOf(api.PROVIDER + ':' + key) !== -1;
    };
    // The Void Point this roll spends on +1k1: ticked in the roll preview, or earlier on the Void card.
    api.pendingVoid = function(){
      if(typeof getVoidPending !== 'function') return {};
      const p = getVoidPending();
      return p && typeof p === 'object' ? p : {};
    };
    api.voidArmed = function(){ return !!api.pendingVoid().k1; };
    api.oneRollVoidArmed = function(){ const p = api.pendingVoid(); return !!(p.k1 || p.skill); };
    const socialSkills = function(){
      return (typeof D45 === 'object' && D45 && Array.isArray(D45.socialSkills)) ? D45.socialSkills : null;
    };
    api.kinds = function(){ return typeof ROLL_KINDS === 'object' && ROLL_KINDS ? ROLL_KINDS : {}; };
    // The rolls a Void Point's +1k1 can go on (Part C's Void rules): never damage.
    api.voidRoll = function(c){ const K = api.kinds(); return [K.SKILL, K.ATTACK, K.TRAIT, K.RING, K.SPELL].indexOf(c.kind) !== -1; };
    api.willpowerRoll = function(c){
      const K = api.kinds();
      return ((c.kind === K.SKILL || c.kind === K.TRAIT) && c.traitName === 'Willpower') || c.kind === K.MANUAL;
    };
    // Fourth Edition resists Fear, Temptation and control with Willpower or the Earth Ring.
    api.resistRoll = function(c){ const K = api.kinds(); return api.willpowerRoll(c) || (c.kind === K.RING && c.ringName === 'Earth'); };
    api.socialRoll = function(c){ const list = socialSkills(); return c.kind === api.kinds().SKILL && (list ? api.skillIn(c, list) : true); };
    api.spellEntry = function(name){
      const want = api.norm(name);
      return (typeof SPELL_LIBRARY !== 'undefined' ? SPELL_LIBRARY : []).find(function(s){ return api.norm(s.name) === want; }) || null;
    };
    api.wardsSpell = function(c){ const s = api.spellEntry(c.spellName); return !!s && (s.keywords || []).indexOf('Wards') !== -1; };
    api.forbiddenKnowledge = function(){
      let n = 0;
      document.querySelectorAll('#advList .entry .en-name').forEach(function(i){ if(/^forbidden knowledge\b/.test(api.norm(i.value))) n++; });
      return n;
    };
    // Iuchi: the School Rank the Deficient Element takes from this Casting Roll. Worked out the way
    // effectiveSchoolRankForSpell() does, and used only when the two agree, so never a guess.
    api.deficiencyDie = function(c){
      if(c.maho === true || typeof effectiveSchoolRankForSpell !== 'function' ||
         typeof getActiveSchoolElementalProfile !== 'function' || typeof getActiveSchoolKeywordProfile !== 'function') return 0;
      const el = c.element, spell = api.spellEntry(c.spellName), words = spell ? (spell.keywords || []) : [];
      const prof = getActiveSchoolElementalProfile() || {}, kw = getActiveSchoolKeywordProfile() || {};
      const base = parseInt(($('f_rank') || {}).value || '0', 10) || 0;
      const aff = prof.affinity && prof.affinity === el ? 1 : 0;
      const def = prof.deficiency && prof.deficiency === el ? 1 : 0;
      const kwAff = !!kw.keywordAffinity && words.indexOf(kw.keywordAffinity) !== -1 && el !== 'Void';
      const kwDef = (kw.keywordDeficiency || []).some(function(k){ return words.indexOf(k) !== -1; });
      const elDef = !!kw.deficiencyElement && el === kw.deficiencyElement &&
        !(kw.deficiencyExcludesKeyword && words.indexOf(kw.deficiencyExcludesKeyword) !== -1);
      const rank = function(elementDef, chosenDef){
        const r = Math.max(0, base + aff - elementDef);
        return Math.max(0, r + (kwAff ? 1 : (kwDef || chosenDef) ? -1 : 0));
      };
      if(rank(def, elDef) !== effectiveSchoolRankForSpell(el, words)) return 0;
      return rank(0, false) - rank(def, elDef);
    };
    api.modifiers = function(context){
      if(!api.rollsOn() || !context) return [];
      const a = api.active();
      if(!a) return [];
      const K = ROLL_KINDS, kind = context.kind;
      if(kind === K.DAMAGE) return [];
      const skill = kind === K.SKILL, attack = kind === K.ATTACK, traitRoll = kind === K.TRAIT, spell = kind === K.SPELL;
      const trait = context.traitName;
      const out = [];
      switch(a.name){
        // Core Rulebook
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
          if((skill || attack) && api.bayushiTrained() && api.mySchoolSkillBases().has(api.skillId(context.skillName))){
            out.push(api.mod(a, 1, 0, 'School Skill'));
            if(api.voidArmed()) out.push(api.mod(a, 1, 1, 'with the Void Point: +2k2 in all'));
          }
          break;
        case 'Shosuro':
          if(skill && api.skillIn(context, ['Stealth', 'Acting'])) out.push(api.mod(a, 3, 1, context.skillName));
          break;
        case 'Kuni Yori':
          if(spell && context.maho === true) out.push(api.mod(a, 1, 0, 'maho Casting Roll'));
          break;
        case 'Shinjo':
          if(skill && trait === 'Awareness' && api.skillIn(context, ['Etiquette'])) out.push(api.mod(a, 1, 1, 'Etiquette'));
          break;
        // The Great Clans
        case 'Hiruma':
          if((skill || attack) && api.skillIn(context, ['Stealth', 'Kenjutsu', 'Kyujutsu'])) out.push(api.mod(a, 1, 0, context.skillName));
          break;
        case 'Kaiu':
          if(skill && api.skillIn(context, ['Craft', 'Engineering']) && api.voidArmed()) out.push(api.mod(a, 2, 0, 'with the Void Point: +3k1 in all'));
          break;
        case 'Agasha':
        case 'Agasha, most favoured':
          if(spell && context.element && context.element !== 'Void') out.push(api.mod(a, 1, 0, context.element + ' spell'));
          if(skill && api.skillIn(context, ['Spellcraft'])) out.push(api.mod(a, 1, 1, 'Spellcraft'));
          break;
        case 'Kitsu':
          if(skill && api.skillId(context.skillName) === 'lore: spirit realms') out.push(api.mod(a, 1, 1, 'Lore: Spirit Realms'));
          break;
        case 'Yogo':
          if(spell && api.wardsSpell(context)) out.push(api.mod(a, 1, 1, 'Wards spell'));
          break;
        case 'Soshi Saibankan':
          if((skill || attack || traitRoll) && api.voidArmed() && (trait === 'Perception' || api.skillId(context.skillName) === 'lore: law')){
            out.push(api.mod(a, 2, 0, 'with the Void Point: +3k1 in all'));
          }
          break;
        case 'Otaku':
          if(skill && api.skillIn(context, ['Horsemanship'])) out.push(api.mod(a, 1, 1, 'Horsemanship'));
          break;
        case 'Iuchi':
          if(spell){ const d = api.deficiencyDie(context); if(d > 0) out.push(api.mod(a, d, 0, 'no Deficient Element')); }
          break;
        case 'Chuda Bikimi':
          if(skill && api.skillIn(context, ['Stealth'])) out.push(api.mod(a, 1, 0, 'Stealth'));
          break;
        case 'Yogo Junzo':
          if(spell){
            const n = api.forbiddenKnowledge() + Math.floor(api.taint()), each = context.maho === true ? 4 : 2;
            if(n > 0) out.push(api.mod(a, 0, 0, n + ' × +' + each + ': Forbidden Knowledge and Taint Ranks' + (each === 4 ? ', maho' : ''), n * each));
          }
          break;
        // Secrets of the Empire
        case 'Tsi':
          if(skill && api.skillFamily(context.skillName) === 'craft' && /swordsmith/i.test(context.skillName || '')){
            out.push(api.info(a, 'Raises not limited', 'Craft: Swordsmithing; declare your Raises as usual'));
          }
          break;
        case 'Sun Tao':
          if(skill && api.skillIn(context, ['Battle'])) out.push(api.mod(a, 1, 0, 'Battle'));
          break;
        case 'Miyuko':
          if(spell) out.push(api.mod(a, 1, 0, 'one School Rank higher'));
          break;
        case 'Mizumoto':
          if((skill || attack || traitRoll) && trait === 'Intelligence') out.push(api.mod(a, 1, 1, 'Intelligence'));
          break;
        case 'Togashi Kaze':
          if(attack && api.skillIn(context, ['Jiujutsu']) && api.skillRank('Meditation') >= api.skillRank('Jiujutsu')){
            out.push(api.info(a, 'Free Raise available', 'an unarmed attack, Meditation at least Jiujutsu; apply it yourself'));
          }
          break;
      }
      return out;
    };

    // ---------- Per-roll ticks, free or paid (Feature 4.5.15's registry, Part I) ----------
    // price: what a tick costs, taken by api.gate() once the player presses Roll in the preview:
    //   void -- a Void Point, by the Void card's rules (none left, or one already spent this Round);
    //   session -- this session's use of a once-a-session gift; round -- in combat it is also the
    //   Round's one Void Point; voidOrTaint -- Atarasi's choice; slot -- a spell slot, marked by the
    //   player because the sheet cannot choose the Element.
    const K = function(){ return api.kinds(); };
    api.DECLARATIONS = {
      // Core Rulebook
      'kuni-cast':{who:'Kuni', price:{void:true, session:true},
        label:function(){ return 'Kuni’s gift — +0k' + api.ring('earth') + ' (a Void Point; once a session)'; },
        note:'Your Earth Rank in kept dice.',
        when:function(c){ return c.kind === K().SPELL; }, mod:function(){ return [0, api.ring('earth')]; }},
      'kitsuki-lie':{who:'Agasha Kitsuki', label:function(){ return 'The Void Point is spent to tell whether someone is lying — +1k1 more'; },
        note:'Makes the Void Point’s +1k1 into +2k2.',
        when:function(c){ return (c.kind === K().SKILL || c.kind === K().TRAIT) && api.voidArmed(); }, mod:function(){ return [1, 1]; }},
      'akodo-battle':{who:'Akodo', label:function(){ return 'A roll on the Mass Battle Table — +1k1'; },
        when:function(c){ return c.kind === K().SKILL && api.skillIn(c, ['Battle']); }, mod:function(){ return [1, 1]; }},
      'kaimetsu-provoked':{who:'Kaimetsu-Uo', label:function(){ return 'Resisting provocation — no +1k1 from Kaimetsu-Uo'; },
        note:'Kaimetsu-Uo’s Willpower bonus never helps you avoid being provoked.',
        when:function(c){ return (c.kind === K().SKILL || c.kind === K().TRAIT) && c.traitName === 'Willpower'; }, mod:null},
      'kaimetsu-improvised':{who:'Kaimetsu-Uo', label:function(){ return 'An improvised weapon (Jiujutsu) — +3k0'; },
        when:function(c){ return (c.kind === K().SKILL || c.kind === K().ATTACK) && api.skillIn(c, ['Jiujutsu']); }, mod:function(){ return [3, 0]; }},
      'gusai-conceal':{who:'Gusai', label:function(){ return 'Hiding a weapon on your person — +3k3'; },
        when:function(c){ return c.kind === K().SKILL && api.skillIn(c, ['Stealth', 'Sleight of Hand']); }, mod:function(){ return [3, 3]; }},
      'asako-ally':{who:'Asako', label:function(){ return 'Against one of your Allies — +1k0'; },
        when:api.socialRoll, mod:function(){ return [1, 0]; }},
      'shosuro-deceit':{who:'Shosuro', label:function(){ return 'Lying (Sincerity (Deceit)) — +3k1'; },
        when:function(c){ return c.kind === K().SKILL && api.skillIn(c, ['Sincerity']); }, mod:function(){ return [3, 1]; }},
      'yori-deceit':{who:'Kuni Yori', label:function(){ return 'Lying (Sincerity (Deceit)) — +1k0'; },
        when:function(c){ return c.kind === K().SKILL && api.skillIn(c, ['Sincerity']); }, mod:function(){ return [1, 0]; }},
      'atarasi-strike':{who:'Hida Atarasi', price:{voidOrTaint:true},
        label:function(){ return 'Atarasi’s corruption this Round — +' + api.atarasiDice() + 'k0 (a Void Point or a point of Taint)'; },
        note:'The higher of your Earth and your Taint Rank. When you roll, the sheet asks which you pay; in a combat Round the same dice go on this Round’s damage.',
        when:function(c){ return c.kind === K().ATTACK; }, mod:function(){ return [api.atarasiDice(), 0]; }},
      'moto-resist':{who:'Moto', label:function(){ return 'Resisting restraint or mental influence — +2k2'; },
        note:'For example a grapple, or Temptation.',
        when:function(c){ return [K().SKILL, K().TRAIT, K().RING, K().MANUAL].indexOf(c.kind) !== -1; }, mod:function(){ return [2, 2]; }},
      'shinjo-enigma':{who:'Shinjo', label:function(){ return 'Understanding something new, strange or enigmatic — +1k1'; },
        when:function(c){ return c.kind === K().SKILL && api.skillIn(c, ['Investigation']); }, mod:function(){ return [1, 1]; }},
      'shinjo-honesty':{who:'Shinjo', label:function(){ return 'Telling the truth (Sincerity (Honesty)) — +1k1'; },
        when:function(c){ return c.kind === K().SKILL && api.skillIn(c, ['Sincerity']) && c.traitName === 'Awareness'; }, mod:function(){ return [1, 1]; }},
      // The Great Clans
      'yamatsu-resist':{who:'Togashi Yamatsu', label:function(){ return 'Resisting possession or magical control — +2k2'; },
        when:api.willpowerRoll, mod:function(){ return [2, 2]; }},
      'hitomi-resist':{who:'Matsu Hitomi', label:function(){ return 'Resisting Temptation, Intimidation or Fear — +1k1'; },
        when:api.resistRoll, mod:function(){ return [1, 1]; }},
      'isawa-research':{who:'Isawa', label:function(){ return 'Spell Research — +1k1'; },
        when:function(c){ return c.kind === K().SKILL && api.skillIn(c, ['Spellcraft']); }, mod:function(){ return [1, 1]; }},
      'yogo-wards':{who:'Yogo', label:function(){ return 'This is a Wards spell — +1k1'; },
        note:'For a spell the sheet does not list; a listed Wards spell has the bonus already.',
        when:function(c){ return c.kind === K().SPELL && !api.spellEntry(c.spellName); }, mod:function(){ return [1, 1]; }},
      'otaku-male':{who:'Otaku', label:function(){ return 'Against a male opponent — +1k0'; },
        when:function(c){ return c.kind === K().ATTACK; }, mod:function(){ return [1, 0]; }},
      'bikimi-slot':{who:'Chuda Bikimi', price:{slot:true}, label:function(){ return 'A spell slot spent instead — +1k1 in place of +1k0'; },
        note:'Only for a shugenja who practises maho. When you roll, the sheet asks you to mark the slot used.',
        when:function(c){ return c.kind === K().SKILL && api.skillIn(c, ['Stealth']) && api.isShugenja(); }, mod:function(){ return [0, 1]; }},
      // Secrets of the Empire
      'otomo-courtier':{who:'Otomo', label:function(){ return 'Using Manipulation or Rhetoric — +1k1'; },
        when:function(c){ return c.kind === K().SKILL && api.skillIn(c, ['Courtier']); }, mod:function(){ return [1, 1]; }},
      'seppun-void':{who:'Seppun', price:{session:true}, label:function(){ return 'Seppun’s gift: a Void Point’s +1k1 without spending one (once a session)'; },
        note:'Your own Void Points are untouched.',
        when:function(c){ return api.voidRoll(c) && !api.oneRollVoidArmed(); }, mod:function(){ return [1, 1]; }},
      'fureheshu-strength':{who:'Ichiro Fureheshu', price:{void:true},
        label:function(c){ const g = api.strengthGain(c); return 'A Void Point to use Strength ' + api.trait('Strength') + ' in place of ' + c.traitName + ' ' + api.trait(c.traitName) + ' — +' + g + 'k' + g; },
        when:function(c){ return api.strengthGain(c) > 0; }, mod:function(c){ const g = api.strengthGain(c); return [g, g]; }},
      'iongi-void':{who:'Komori Iongi', price:{session:true, round:true}, label:function(){ return 'Iongi’s extra Void Point — +1k1 (once a session)'; },
        note:'Your own Void Points are untouched. In combat it is your one Void Point this Round.',
        when:function(c){ return api.voidRoll(c) && !api.oneRollVoidArmed(); }, mod:function(){ return [1, 1]; }},
      'heichi-powerful':{who:'Hida Heichi', label:function(){ return 'Against someone more powerful than you — +1k1'; },
        when:api.socialRoll, mod:function(){ return [1, 1]; }},
      'kuyuden-peace':{who:'Tonbo Kuyuden', label:function(){ return 'To calm violence or find a peaceful end — +1k1'; },
        when:function(c){ return c.kind === K().SKILL && api.skillIn(c, ['Courtier', 'Etiquette']); }, mod:function(){ return [1, 1]; }},
      'reichin-fear':{who:'Usagi Reichin', label:function(){ return 'Resisting Fear — +1k1'; },
        when:api.resistRoll, mod:function(){ return [1, 1]; }},
      'reichin-bloodspeaker':{who:'Usagi Reichin', label:function(){ return 'Resisting a Bloodspeaker’s Fear — +2k2 in place of +1k1'; },
        when:api.resistRoll, mod:function(){ return [2, 2]; }},
      'garin-loyalties':{who:'Morito Garin', label:function(){ return 'To find out where someone’s loyalties lie — +1k1'; },
        when:function(c){ return (c.kind === K().SKILL || c.kind === K().TRAIT) && (c.traitName === 'Perception' || c.traitName === 'Awareness'); }, mod:function(){ return [1, 1]; }},
      'suzume-persuade':{who:'Doji Suzume', label:function(){ return 'To persuade others to follow your lead — +1k1'; },
        when:api.socialRoll, mod:function(){ return [1, 1]; }},
      'kasuga-duty':{who:'Agasha Kasuga', label:function(){ return 'A dishonourable act your Imperial duty requires — +1k1'; },
        when:function(c){ return c.kind === K().SKILL || c.kind === K().ATTACK; }, mod:function(){ return [1, 1]; }},
    };
    // Fureheshu: what Strength adds over a physical Trait on a Skill or attack roll (0 if nothing).
    api.strengthGain = function(c){
      if(!c || (c.kind !== K().SKILL && c.kind !== K().ATTACK) || ['Agility', 'Reflexes', 'Stamina'].indexOf(c.traitName) === -1) return 0;
      return Math.max(0, api.trait('Strength') - api.trait(c.traitName));
    };
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
          return {key:k, label:d.label(context), note:[d.note || '', api.priceNote(d.price, context)].filter(Boolean).join(' ')};
        });
      },
      modifiers:function(context, keys){
        const a = api.active(), offered = api.offersFor(context);
        let chosen = keys.filter(function(k){ return offered.indexOf(k) !== -1 && api.DECLARATIONS[k].mod; });
        // Reichin's +2k2 against a Bloodspeaker takes the place of his +1k1; it never adds to it.
        if(chosen.indexOf('reichin-bloodspeaker') !== -1) chosen = chosen.filter(function(k){ return k !== 'reichin-fear'; });
        return chosen.map(function(k){
          const m = api.DECLARATIONS[k].mod(context);
          return {label:'Ancestor: ' + a.name, rolledDelta:m[0], keptDelta:m[1], totalDelta:0,
            note:api.DECLARATIONS[k].price ? 'Chosen and paid for this roll' : 'Declared for this roll'};
        });
      },
    };

    // ---------- Paying for a chosen gift: after the preview's Roll, before the dice ----------
    api.paidContext = null;   // the one roll whose costs were just taken
    api.inCombat = function(){ return typeof isCombatActive === 'function' && isCombatActive(); };
    api.combatVoidSpent = function(){ return api.inCombat() && typeof hasSpentThisRound === 'function' && hasSpentThisRound('void'); };
    api.voidProblem = function(){
      if(typeof getVoidPoints !== 'function' || typeof consumeVoidPoint !== 'function') return 'The sheet’s Void Points are not available.';
      if(getVoidPoints() <= 0) return 'You have no Void Points left.';
      if(api.combatVoidSpent()) return 'You have already spent a Void Point this Round.';
      return '';
    };
    api.priceProblem = function(p){
      if(!p) return '';
      if(p.session && api.sessionUsed()) return 'This session’s use is already spent.';
      if(p.void){ const v = api.voidProblem(); if(v) return v; }
      if(p.round && api.combatVoidSpent()) return 'You have already spent a Void Point this Round.';
      return '';
    };
    api.priceNote = function(p, context){
      if(!p) return '';
      if(context && context === api.paidContext) return 'Paid for this roll.';
      if(p.slot || p.voidOrTaint) return '';
      const problem = api.priceProblem(p);
      return problem ? problem + ' It cannot be paid right now.' : 'The sheet takes it when you roll.';
    };
    // In combat, a Void Point spent here is the Round's one Void Point, as on the Void card.
    api.roundVoid = function(){
      if(api.inCombat() && typeof recordRoundSpend === 'function') recordRoundSpend('void', 'ancestor');
      if(typeof renderVoidPanel === 'function') renderVoidPanel();
    };
    // Spends one Void Point by the Void card's own rules; false, spending nothing, when it cannot.
    api.payVoid = function(){
      if(api.voidProblem() || !consumeVoidPoint()) return false;
      api.roundVoid();
      return true;
    };
    // Resolves true to roll, false to cancel the roll. Nothing is taken before the player confirms
    // the preview, so a cancelled preview never costs anything.
    api.gate = async function(req){
      api.paidContext = null;
      if(!req || !req.context || typeof RD4515 !== 'object' || !RD4515) return true;
      const prefix = api.PROVIDER + ':';
      const keys = RD4515.armed(req.context).filter(function(k){ return k.indexOf(prefix) === 0; })
        .map(function(k){ return k.slice(prefix.length); })
        .filter(function(k){ return api.DECLARATIONS[k] && api.DECLARATIONS[k].price; });
      let paid = false;
      for(let i = 0; i < keys.length; i++){
        const key = keys[i], d = api.DECLARATIONS[key], p = d.price;
        const drop = function(){ RD4515.toggle(prefix + key, false); };
        if(p.voidOrTaint){
          const problem = api.voidProblem();
          const choice = await appConfirm3Way(d.who + ': this Round’s corruption, +' + api.atarasiDice() + 'k0 on the attack' +
            (api.inCombat() ? ' and on this Round’s damage' : '') + '. Pay with a Void Point, or take a point of Shadowlands Taint?' +
            (problem ? '\n\n' + problem + ' Only the Taint is open to you.' : '') + '\n\n✕ cancels the roll.',
            problem ? 'Roll without it' : 'Spend a Void Point', 'ghost', 'Take a point of Taint');
          if(choice === null) return false;
          if(choice === 'ok'){
            if(problem || !api.payVoid()){ drop(); continue; }
            if(typeof setStatus === 'function') setStatus(d.who + ': a Void Point spent for this Round’s corruption.');
          } else if(typeof setStatus === 'function'){
            setStatus(d.who + ': record 1 point of Shadowlands Taint yourself (the sheet keeps Taint as a Rank, not in points).');
          }
          api.atarasiRound();
          paid = true;
          continue;
        }
        if(p.slot){
          const choice = await appConfirm3Way(d.who + ': spend one of your spell slots for +1k1 in place of +1k0. The sheet cannot choose the Element for you, so mark the slot used on your Spells yourself.\n\n✕ cancels the roll.',
            'Roll with it', 'ghost', 'Roll without it');
          if(choice === null) return false;
          if(choice !== 'ok'){ drop(); continue; }
          paid = true;
          continue;
        }
        const problem = api.priceProblem(p);
        if(problem){
          if(!(await appConfirm(d.who + ': ' + problem + '\n\nRoll without it?', 'Roll without it', 'ghost', 'Cancel roll'))) return false;
          drop();
          continue;
        }
        if(p.void && !api.payVoid()){ drop(); continue; }
        if(p.round) api.roundVoid();
        if(p.session) api.useSession();
        paid = true;
        if(typeof setStatus === 'function') setStatus(d.who + ': ' + (p.void ? 'a Void Point spent' : 'this session’s use taken') + ' for this roll.');
      }
      if(paid) api.paidContext = req.context;
      return true;
    };

    // ---------- Once a session: Kuni, Seppun, Komori Iongi, Toku ----------
    api.sessionUsed = function(){ const s = api.current(); return !!(s && s.sessionUsed); };
    api.useSession = function(){
      const s = api.current();
      if(!s) return false;
      api.write(Object.assign({}, s, {sessionUsed:true}));
      setTimeout(function(){ if(typeof recalcAll === 'function') recalcAll(); }, 0);
      return true;
    };
    api.resetSession = function(){
      const s = api.current();
      if(!s || !s.sessionUsed) return false;
      api.write(Object.assign({}, s, {sessionUsed:false}));
      api.after(s.name + ': a new session, and the once-a-session gift is ready again.');
      return true;
    };
    // Seppun's and Iongi's free Void Point spent on something other than a roll.
    api.useNow = async function(){
      const a = api.active(), s = api.current();
      if(!a || !s || s.sessionUsed || ['seppun-void', 'iongi-void'].indexOf(a.session) === -1) return false;
      const iongi = a.session === 'iongi-void';
      if(iongi && api.combatVoidSpent()){
        await appAlert('Komori Iongi’s gift is still a Void Point, and you have already spent one this Round.');
        return false;
      }
      if(!(await appConfirm(a.name + ': use this session’s free Void Point now, on something other than a roll (for example +10 Armor TN for a Round)? Apply its effect yourself: the sheet marks the session and leaves your own Void Points alone.',
        'Use it now', 'ghost', 'Cancel'))) return false;
      const now = api.current();
      if(!now || now.name !== s.name || now.sessionUsed) return false;
      if(iongi) api.roundVoid();
      api.write(Object.assign({}, now, {sessionUsed:true}));
      api.after(a.name + ': this session’s free Void Point is used.');
      return true;
    };

    // ---------- After the roll: Kakita, Sun Tao, Toku (Phase 4.5's Luck hook, Part I) ----------
    // Offered in the result, like Luck, because a player only knows whether to use them once the
    // dice are down (the owner's point, 30 September: a first roll of 50 is not one to re-roll).
    api.rolling = null;   // {context}: the roll whose result is being drawn, set around rollWithModifiers()
    api.outcome = function(message){
      const body = $('rollModalBody');
      if(!body) return;
      const old = body.querySelector('.anc48-outcome');
      if(old) old.remove();
      body.insertBefore(el('div', 'anc48-outcome', message), body.firstChild);
    };
    // The total on screen, with the dice the player chose to keep.
    api.shownTotal = function(result){
      const t = $('rollTotalDisplay');
      return parseInt((t && t.textContent) || String(result.total || 0), 10) || 0;
    };
    api.keepTN = function(){
      return currentRollTN === null ? undefined : {tn:currentRollTN, successText:currentRollSuccessText,
        failText:currentRollFailText, onClose:currentRollOnClose};
    };
    // The same roll again with +rolled k +kept, keeping every flat modifier it had (Luck's method).
    api.rerollPlus = function(result, rolled, kept){
      if(!result || result.rawNumDice === undefined || result.rawKeepDice === undefined) return null;
      const n = result.rawNumDice + rolled, k = result.rawKeepDice + kept;
      const again = result.explodeOn !== undefined ? rollWeaponDicePool(n, k, result.explodeOn) : rollDicePool(n, k, result.explode);
      const extra = (result.bonus || 0) - applyTenDiceRule(result.rawNumDice, result.rawKeepDice).bonus;
      if(extra){ again.bonus += extra; again.total += extra; }
      return again;
    };
    api.block = function(key, head, label, why, run){
      const wrap = el('div', 'anc48-after');
      wrap.dataset.anc48After = key;
      wrap.appendChild(el('div', 'anc48-after-head', head));
      const button = el('button', 'ghost anc48-after-btn', label);
      button.type = 'button';
      button.disabled = !!why;
      button.addEventListener('click', function(){
        button.disabled = true;
        Promise.resolve().then(run).then(function(done){ if(!done && button.isConnected) button.disabled = false; },
          function(){ if(button.isConnected) button.disabled = false; });
      });
      wrap.appendChild(button);
      if(why) wrap.appendChild(el('div', 'anc48-after-note', why));
      return wrap;
    };
    api.decorateResult = function(title, result){
      const a = api.active(), body = $('rollModalBody');
      if(!api.rollsOn() || !a || !body || !result) return 0;
      const c = api.rolling && api.rolling.context, Ks = api.kinds();
      const skillish = !!c && (c.kind === Ks.SKILL || c.kind === Ks.ATTACK);
      const whole = result.rawNumDice !== undefined && result.rawKeepDice !== undefined;
      let added = 0;
      if(a.name === 'Kakita' && skillish && whole && api.skillIn(c, ['Iaijutsu', 'Artisan'])){
        body.appendChild(api.block('kakita', 'Kakita — spend a Void Point to re-roll with +1k1, and keep the better result',
          'Re-roll with Kakita (a Void Point)', api.voidProblem(), function(){ return api.kakita(title, result); }));
        added++;
      }
      if(a.name === 'Sun Tao' && skillish && whole && api.isBugei(c.skillName)){
        body.appendChild(api.block('sun-tao', 'Sun Tao — if this Bugei roll failed, spend a Void Point to roll 1k1 and add it; any Raises on it are lost',
          'Add Sun Tao’s die (a Void Point)', api.voidProblem(), function(){ return api.sunTao(title, result); }));
        added++;
      }
      if(a.name === 'Toku' && whole && typeof advConfigLuckRerollResult === 'function'){
        const used = api.sessionUsed();
        body.appendChild(api.block('toku', 'Toku — a Rank of Luck: re-roll the whole roll and keep the higher result',
          'Spend Toku’s Luck (' + (used ? 0 : 1) + '/1)', used ? 'Toku’s Luck is already used this session.' : '',
          function(){ return api.toku(title, result); }));
        added++;
      }
      return added;
    };
    api.kakita = function(title, result){
      const first = api.shownTotal(result), tn = api.keepTN();
      if(!api.payVoid()){ api.outcome('Kakita’s re-roll needs a Void Point. ' + (api.voidProblem() || 'None could be spent.')); return false; }
      const again = api.rerollPlus(result, 1, 1);
      const better = again.total > first;
      if(better) showRollResult(title + ' — Kakita’s re-roll (+1k1)', again, tn);
      api.outcome('Kakita’s re-roll: a Void Point spent. First roll ' + first + ', re-roll with +1k1 ' + again.total + '. ' +
        (better ? 'The re-roll is better and is kept.' : 'The first roll is as good or better and is kept.'));
      return true;
    };
    // Sun Tao's die joins the dice the player kept; nothing is re-sorted into a better set.
    api.sunTao = function(title, result){
      const tn = api.keepTN(), shown = api.shownTotal(result);
      if(currentRollTN !== null && shown >= currentRollTN){
        api.outcome('Sun Tao’s gift is for a failed roll, and this one meets its TN of ' + currentRollTN + '. Nothing was spent.');
        return false;
      }
      if(!api.payVoid()){ api.outcome('Sun Tao’s gift needs a Void Point. ' + (api.voidProblem() || 'None could be spent.')); return false; }
      const one = result.explodeOn !== undefined ? rollWeaponDicePool(1, 1, result.explodeOn) : rollDicePool(1, 1, result.explode);
      const die = one.sorted[0];
      const kept = Array.prototype.map.call(document.querySelectorAll('#rollDiceRow .roll-die.kept'), function(e){ return parseInt(e.dataset.total, 10) || 0; });
      const added = Object.assign({}, result, {
        sorted:(result.sorted || []).concat([die]).sort(function(x, y){ return y.total - x.total; }),
        numDice:(result.numDice || 0) + 1, keepDice:(result.keepDice || 0) + 1,
        rawNumDice:result.rawNumDice + 1, rawKeepDice:result.rawKeepDice + 1,
      });
      added.total = kept.reduce(function(s, v){ return s + v; }, 0) + die.total + (result.bonus || 0);
      showRollResult(title + ' — Sun Tao', added, tn);
      const want = kept.concat([die.total]);
      document.querySelectorAll('#rollDiceRow .roll-die').forEach(function(e){
        const at = want.indexOf(parseInt(e.dataset.total, 10));
        e.classList.toggle('kept', at !== -1);
        if(at !== -1) want.splice(at, 1);
      });
      updateRollKeepState(added.keepDice);
      api.outcome('Sun Tao: a Void Point spent; 1k1 rolled and added (' + die.total + '). Any Raises you declared on this roll are lost.');
      return true;
    };
    api.toku = function(title, result){
      if(api.sessionUsed()) return false;
      const first = api.shownTotal(result), tn = api.keepTN();
      const again = advConfigLuckRerollResult(result);
      if(!again){ api.outcome('Toku’s Luck could not re-roll this result.'); return false; }
      api.useSession();
      const better = again.total > first;
      if(better) showRollResult(title + ' — Toku’s Luck', again, tn);
      api.outcome('Toku’s Luck: this session’s use spent. First roll ' + first + ', re-roll ' + again.total + '. ' +
        (better ? 'The re-roll is higher and is kept.' : 'The first roll is as high or higher and is kept.'));
      return true;
    };

    // ---------- Damage and Armor TN (guarded trunk blocks call these) ----------
    api.atarasiDice = function(){ return Math.max(api.ring('earth'), Math.floor(api.taint())); };
    // In a combat Round, Atarasi's dice paid for at the attack go on that Round's damage too.
    api.atarasiRound = function(){
      if(api.inCombat() && typeof recordRoundSpend === 'function') recordRoundSpend('ancestor-atarasi', api.atarasiDice());
    };
    api.damage = function(entry, skillName){
      const a = api.active();
      if(!a || !entry) return null;
      if(a.name === 'Hida') return {rolled:1, kept:0, note:'Ancestor (Hida): +1k0 damage'};
      if(a.name === 'Ikoma' && api.norm(skillName || entry.skill) === 'jiujutsu') return {rolled:2, kept:0, note:'Ancestor (Ikoma): +2k0 unarmed damage'};
      if(a.name === 'Hida Atarasi' && api.inCombat() && typeof getRoundSpend === 'function'){
        const dice = parseInt(getRoundSpend('ancestor-atarasi'), 10) || 0;
        if(dice > 0) return {rolled:dice, kept:0, note:'Ancestor (Hida Atarasi): +' + dice + 'k0 damage this Round'};
      }
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
          if(typeof setStatus === 'function') setStatus(a.name + ' guides only ' + api.guidesWhom(a) + '.');
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
        await appAlert(a.name + '’s favour ' + (a.noReturn ? 'is gone for good: ' + a.name + ' never returns (' + api.bookPage(a) + ').' : 'was lost a second time, so it is gone for good (Core Rulebook p. 241).'));
        return false;
      }
      if(!s.lost){
        const message = a.noReturn
          ? 'Mark ' + a.name + '’s favour as lost? ' + a.name + ' never returns (' + api.bookPage(a) + '): the gifts stop for good, the points stay spent, and no other Ancestor can take this one’s place.'
          : s.regained
            ? 'Mark ' + a.name + '’s favour as lost again? By the book a second loss is final: the gifts stop for good, the points stay spent, and no other Ancestor can take this one’s place.'
            : 'Mark ' + a.name + '’s favour as lost? The gifts stop at once. Your GM may let the favour return once, after sincere repentance and about a month of devotion. The points stay spent, and no other Ancestor can take this one’s place.';
        const final = s.regained || !!a.noReturn;
        if(!(await appConfirm(message, final ? 'Lost for good' : 'Favour lost', 'ghost', 'Cancel'))) return false;
        api.write(Object.assign({}, s, {lost:true, final:final}));
        api.after(a.name + '’s favour is lost' + (final ? ' for good.' : '.'));
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
      populateInfoOverlay('Ancestors', 'Core Rulebook pp. 241–244 · The Great Clans · Secrets of the Empire',
        api.RULES.join('\n\n') + '\n\n' + api.SPIDER_RULE + '\n\n' + api.RONIN_RULE + '\n\n' + api.BROTHERHOOD_RULE +
        (a ? '\n\nYour Ancestor: ' + api.detailsText(a) : ''));
    };
    api.detailsText = function(a){
      return a.name + ' (' + a.clan + ', ' + a.cost + ' XP, ' + api.bookPage(a) + '). ' + a.about + (a.who ? ' ' + a.who : '') + '\n' +
        a.gifts.map(function(g){ return '• ' + g.text + ' [' + api.tag(g) + ']'; }).join('\n') + '\nDemands: ' + a.demands;
    };
    // Who the Ancestor is, what it gives and what it asks: shared by the card and the wizard.
    api.details = function(a){
      const box = el('div', 'anc48-details');
      const head = el('div', 'anc48-card-head');
      head.appendChild(el('span', 'anc48-name', a.name));
      head.appendChild(el('span', 'anc48-meta', a.clan + ' · ' + a.cost + ' XP · ' + api.bookPage(a)));
      box.appendChild(head);
      box.appendChild(el('p', 'anc48-about', a.about));
      if(a.who) box.appendChild(el('p', 'anc48-who', a.who));
      box.appendChild(el('div', 'anc48-sub', 'Gifts'));
      const list = el('ul', 'anc48-gifts');
      a.gifts.forEach(function(g){
        const li = el('li', 'anc48-gift');
        li.appendChild(el('span', 'anc48-gift-text', g.text));
        li.appendChild(el('span', 'anc48-how anc48-how-' + g.how, api.tag(g)));
        if(g.note) li.appendChild(el('span', 'anc48-gift-note', g.note));
        list.appendChild(li);
      });
      box.appendChild(list);
      box.appendChild(el('div', 'anc48-sub', 'Demands'));
      box.appendChild(el('p', 'anc48-demands', a.demands));
      if(a.clan === 'Spider') box.appendChild(el('p', 'anc48-spider', api.SPIDER_RULE));
      return box;
    };
    // Numbers the card can state for a reminder, as the sheet sees them now.
    api.cardNotes = function(a){
      const out = [];
      if(a.name === 'Moto') out.push('Right now that raises such a spell’s Casting TN by ' + (5 * api.trait('Willpower')) + '.');
      if(a.name === 'Miya'){ const h = api.honor(); if(h !== null) out.push('Right now that is ' + Math.floor(h) + ' days: your Honor Rank.'); }
      if(a.name === 'Chiroru') out.push('Your Void Ring is ' + api.ring('void') + ': up to ' + api.ring('void') + ' siblings.');
      if(a.name === 'Yogo'){
        const has = Array.prototype.some.call(document.querySelectorAll('#disadvList .entry .en-name'), function(i){ return /^bad fortune\b/.test(api.norm(i.value)); });
        if(!has) out.push('Add Bad Fortune (Yogo Curse) to your Disadvantages, for no points: the sheet does not find it there yet.');
      }
      return out;
    };
    api.SESSION_NAME = {'kuni-cast':'Kuni’s gift', 'seppun-void':'Seppun’s free Void Point', 'iongi-void':'Iongi’s extra Void Point', 'toku-luck':'Toku’s Luck'};
    api.sessionLine = function(a, s){
      const box = el('div', 'anc48-session');
      box.id = 'anc48Session';
      box.appendChild(el('span', 'anc48-session-state', api.SESSION_NAME[a.session] + ': ' + (s.sessionUsed ? 'used this session (0/1)' : 'ready this session (1/1)')));
      if(!s.sessionUsed && (a.session === 'seppun-void' || a.session === 'iongi-void')){
        const use = el('button', 'ghost anc48-session-use print-hide', 'Use it now');
        use.type = 'button';
        use.id = 'anc48UseNow';
        use.addEventListener('click', function(){ api.useNow(); });
        box.appendChild(use);
      }
      const reset = el('button', 'ghost anc48-session-reset print-hide', 'Reset session');
      reset.type = 'button';
      reset.id = 'anc48ResetSession';
      reset.disabled = !s.sessionUsed;
      reset.title = 'A new session: make the once-a-session gift ready again';
      reset.addEventListener('click', function(){ api.resetSession(); });
      box.appendChild(reset);
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
      // The Advantages list's circled i (Feature 4.54) is the standard: the glyph is drawn by the
      // stylesheet, so the button adds nothing to the heading's text.
      const info = el('button', 'anc48-info print-hide');
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
    // The picker: the character's own faction first (a monk may also see the Brotherhood's), then
    // the Spider Ancestors with the GM's permission, then every other shown greyed.
    api.groups = function(){
      const clan = api.clan(), mine = api.clanKey(clan);
      const own = [];
      api.LIBRARY.filter(api.ownClan).forEach(function(a){
        const match = mine ? api.serves(a).find(function(c){ return api.clanKey(c) === mine; }) : null;
        const key = match || a.clan;
        let g = own.find(function(x){ return x.key === key; });
        if(!g){ g = {key:key, items:[]}; own.push(g); }
        g.items.push(a);
      });
      const spider = api.LIBRARY.filter(function(a){ return a.clan === 'Spider' && !api.ownClan(a); });
      const other = api.LIBRARY.filter(function(a){ return !api.choosable(a); });
      const groups = own.map(function(g){ return {label:api.factionLabel(g.key), items:g.items, disabled:false}; });
      if(spider.length) groups.push({label:'Spider — only with your GM’s permission', items:spider, disabled:false});
      groups.push({label:(clan ? 'Other Clans — they guide only their own' : 'Choose your Clan to see its Ancestors'), items:other, disabled:true});
      return groups;
    };
    api.shortFaction = function(a){ return a.clan === 'Brotherhood of Shinsei' ? 'Brotherhood' : a.clan; };
    api.fillOptions = function(select, s){
      const sig = api.clan() + '|' + api.monk() + '|' + (s ? s.name : '');
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
          const o = el('option', '', a.name + ' — ' + a.cost + ' XP' + (g.disabled ? ' (' + api.shortFaction(a) + ')' : ''));
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
      if(!reason) api.cardNotes(a).forEach(function(t){ card.appendChild(el('p', 'anc48-note', t)); });
      api.checks(a, s).forEach(function(t){ card.appendChild(el('p', 'anc48-flag', t)); });
      api.flags(a, s).forEach(function(t){ card.appendChild(el('p', 'anc48-flag', t)); });
      if(!reason && a.session) card.appendChild(api.sessionLine(a, s));
      const favour = el('div', 'anc48-favour');
      const badge = el('button', 'anc48-badge print-hide', api.BADGE);
      badge.type = 'button';
      badge.id = 'anc48Badge';
      badge.setAttribute('aria-pressed', s.lost ? 'true' : 'false');
      badge.disabled = s.final;
      badge.addEventListener('click', function(){ api.toggleFavour(); });
      favour.appendChild(badge);
      const status = s.final ? (a.noReturn ? 'Favour lost for good: ' + a.name + ' never returns. The points stay spent.' : 'Favour lost for good: lost a second time. The points stay spent.')
        : s.lost ? 'Favour lost: ' + a.name + '’s gifts are switched off. If your GM lets the favour return (once, after about a month of devotion), press the badge again.'
        : s.regained ? 'The favour returned once. A second loss is final.'
        : a.noReturn ? 'If ' + a.name + ' leaves you, press the badge: every gift stops, and he never returns.'
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
        // Your own Clan's first, then the Spider Ancestors, in the order the sheet's picker shows them.
        api.LIBRARY.filter(api.ownClan).concat(api.LIBRARY.filter(api.spiderGuest)).forEach(function(a){
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
    // the ticked gifts stay on the card as text and nothing is offered at roll time.
    if(typeof RD4515 === 'object' && RD4515){
      RD4515.register(ANC48.PROVIDER, ANC48.provider);
      // A chosen gift's cost is taken after the preview's Roll button (Phase 3, Part G), through a
      // wrapper on its gate, as Dark Paragon (Feature 4.5.23) pays for Determination. Declared
      // dependency: without the preview nothing can be ticked, so nothing is ever charged.
      if(typeof rollPreviewGate === 'function'){
        const anc48PreviousGate = rollPreviewGate;
        rollPreviewGate = async function(req){
          const proceed = await anc48PreviousGate.apply(this, arguments);
          if(!proceed || !req) return proceed;
          if(await ANC48.gate(req)) return proceed;
          RD4515.cancel();
          if(typeof setStatus === 'function') setStatus('Roll cancelled; nothing was spent on the Ancestor’s gift.');
          return false;
        };
      }
    }
    // Which roll's result is being drawn, for the gifts offered after it (Kakita, Sun Tao). Set
    // while the roll runs and cleared when it settles; the result is drawn in between.
    const anc48PreviousRoll = rollWithModifiers;
    rollWithModifiers = async function(title, context){
      const token = {context:context};
      ANC48.rolling = token;
      try { return await anc48PreviousRoll.apply(this, arguments); }
      finally { if(ANC48.rolling === token) ANC48.rolling = null; }
    };
    // After-the-roll gifts sit in the result beside Luck, through Phase 4.5's result hook (Part I).
    // Declared dependency: without it they are not offered, and the card still says what they are.
    if(typeof onAdvConfigRollResult === 'function'){
      const anc48PreviousResult = onAdvConfigRollResult;
      onAdvConfigRollResult = function(title, result){
        const out = anc48PreviousResult.apply(this, arguments);
        ANC48.decorateResult(title, result);
        return out;
      };
    }
    // A once-a-session gift joins the Quick Access panel's Session Resources (Phase 4.5, Part I).
    if(typeof advConfigAllSessionResources === 'function'){
      const anc48PreviousResources = advConfigAllSessionResources;
      advConfigAllSessionResources = function(){
        const resources = anc48PreviousResources() || [];
        const a = ANC48.active(), s = ANC48.current();
        if(a && a.session && s) resources.push({kind:ANC48.SESSION_NAME[a.session], target:'', div:null,
          effect:{remaining:s.sessionUsed ? 0 : 1, rank:1}});
        return resources;
      };
    }
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
    // Play mode (Phase 12, Part K): the picker is locked; the favour badge, the session buttons and
    // the information stay live.
    if(typeof MODES12 === 'object' && MODES12 && typeof MODES12.register === 'function') MODES12.register('#anc48Pick');
    ANC48.wizardInstall();
  }
  // ================= END PART I PHASE 4.8 =================
