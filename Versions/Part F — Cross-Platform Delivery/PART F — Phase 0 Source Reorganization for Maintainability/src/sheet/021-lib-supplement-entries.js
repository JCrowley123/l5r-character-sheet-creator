  // ========= PART I PHASE 4.5.37: SUPPLEMENT ADVANTAGES AND DISADVANTAGES (DATA) =========
  // The Sourcebook Audit's 42 selectable supplement entries (owner's ruling, 15 October 2026), less The World of the
  // Daimyo, The Daimyo's Path and Child of Chikushudo, parked by the owner on 22 October 2026 until Emerald Empire's
  // Station rules and the shapeshifter abilities exist: 26 Advantages and 13 Disadvantages, in our own words with the
  // book and page. Here, right after the catalogue, so the quick-add lists, the wizard and Search read them as
  // catalogue entries. Each goes after the last entry that sorts before it (the catalogue's Uncentered sits out of
  // order near the top of the Disadvantages); the catalogue's own entries keep their order. Each
  // carries its own `source`. Wanderer prints no type: Mental, by the owner's ruling. Trials of the Imperial City
  // follows its printed text (the owner's ruling). The 23 Naga- and Nezumi-only entries are Search reference only
  // (the owner's ruling): SUPPLEMENT_REFERENCE_ENTRIES, registered by 209.99999999994-feat-supplement-entries.js.
  // Kill switch SUPPLEMENT_ENTRIES_ENABLED.
  const SUPPLEMENT_ENTRIES_ENABLED = true;

  const SUPPLEMENT_ADVANTAGES = [
    {name:'Battle Healing', cat:'Mystical', cost:5, source:'Book of Water p.178', desc:'Once a day for each person, spend a Water spell slot (or two slots of another Element) to heal a touched Rokugani of one Wound Rank.'},
    {name:'Broken Wave Citizen', cat:'Social', cost:3, source:'Strongholds of the Empire p.24', desc:'+1k0 on Commerce and Sailing rolls.'},
    {name:'Clear Water Native', cat:'Social', cost:3, source:'Strongholds of the Empire p.44', desc:'+1k0 on Commerce rolls; start with half as much again of your School’s starting koku (rounded up).'},
    {name:'Dark Edge Native', cat:'Social', cost:2, source:'Strongholds of the Empire p.60', desc:'One extra Rank of Lore: Iaijutsu; your Status counts one higher when arranging or representing a duel.'},
    {name:'Imperial City Citizen', cat:'Social', cost:2, source:'Strongholds of the Empire p.134', desc:'Your Glory counts one Rank higher with members of Courtier Schools.'},
    {name:'Imperial City Veteran', cat:'Social', cost:2, source:'Strongholds of the Empire p.134', desc:'Your Glory counts one Rank higher with members of Bushi Schools.'},
    {name:'Inheritance: Asahina Blade', cat:'Material', cost:9, source:'Strongholds of the Empire p.75', desc:'A 3k2 wakizashi; when you Guard with it, your charge’s Armor TN also rises by your Honor Rank.'},
    {name:'Inheritance: Kobune', cat:'Material', cost:10, source:'Strongholds of the Empire p.24', desc:'A small trading ship; each voyage makes about 5–10 koku profit (GM).'},
    {name:'Inheritance: Trained Falcon', cat:'Material', cost:2, source:'Enemies of the Empire p.10', desc:'A bred hunting falcon: +5 Wounds per Wound Rank and one extra die on its attacks. Toritaka pay 1.'},
    {name:'Inheritance: Water Hammer Armor', cat:'Material', cost:4, source:'Strongholds of the Empire p.107', desc:'Armor with Reduction 2 higher than its kind. Costs 4 for ashigaru armor, 7 for light, 12 for heavy and 15 for riding armor.'},
    {name:'Iron Heart Native', cat:'Physical', cost:2, source:'Book of Void p.195', desc:'+1k0 on Stamina Trait rolls and on Strength rolls other than damage, grappling included.'},
    {name:'Laughing Plains Native', cat:'Mental', cost:2, source:'Book of Void p.195', desc:'+5 when resisting Fear.'},
    {name:'Medium', cat:'Spiritual', cost:4, source:'Enemies of the Empire p.244', desc:'Project your spirit into the Spirit Realms in deep concentration; spirits there take you for one of their own unless you show otherwise.'},
    {name:'Naga Ancestry', cat:'Physical', cost:7, source:'Imperial Histories 2 p.287', desc:'Buy Naga-only Advantages at their normal cost; +1k0 on Social Skill rolls with Naga. Costs 7, or 5 if your ancestry shows (the GM’s option), which may cost you with other Rokugani. The book types it Physical and Spiritual.'},
    {name:'Nikesake Citizen', cat:'Social', cost:3, source:'Strongholds of the Empire p.75', desc:'+1k0 on Social Skill rolls with the Crane; Allies within the Crane cost 1 less (minimum 1).'},
    {name:'Reincarnated', cat:'Spiritual', cost:6, source:'Book of Void p.191', desc:'+1k0 on three non-School Skills you choose (GM approves); spending Void on them brings on Anachronism for 1–10 hours. Costs 5 for Henshin or with an Ancestor.'},
    {name:'Ruined City Shadow', cat:'Physical', cost:3, source:'Strongholds of the Empire p.92', desc:'+1k0 on Stealth (Ambush) rolls in a city.'},
    {name:'Sacred Forest Native', cat:'Mental', cost:2, source:'Book of Void p.195', desc:'+1k0 on Lore: Theology and Lore: Spirit Realms rolls.'},
    {name:'Sacred Weapon: Owl Blade', cat:'Material', cost:6, source:'Imperial Histories 2 p.29', desc:'A 3k2 wakizashi that counts as crystal against otherworldly foes.'},
    {name:'Sage of the Sword and Fan', cat:'Mental', cost:7, source:'Sword and Fan p.202', desc:'With the GM’s leave, Battle and Courtier share Mastery benefits from the higher of the two; Insight Rank times a day, use the higher Rank in a Contested roll with either. Courtiers pay 6.'},
    {name:'Spy Network', cat:'Social', cost:8, source:'Enemies of the Empire p.49 (reprinted Book of Water p.185)', desc:'Once a session, if you can reach your network, learn one useful fact of the GM’s choosing. Daidoji pay 7, Scorpion 6, Kolat 5.'},
    {name:'Stolen Identity', cat:'Social', cost:6, source:'Strongholds of the Empire p.92', desc:'A false identity in another Great Clan’s family and School: two Free Raises on Acting to keep it up, and that School’s Outfit (not its koku). Spider pay 5.'},
    {name:'Strategist', cat:'Mental', cost:5, source:'Sword and Fan p.202', desc:'As a commander or on the staff: +2k0 to your side’s roll for who is winning each Battle Turn; +1k0 on your other Battle rolls in a Mass Battle. Lion pay 4.'},
    {name:'Watanu-Trained', cat:'Mental', cost:1, source:'Book of Void p.195', desc:'Choose one Craft Skill for metal goods (not weapons or armor): +1k1 on rolls to make them.'},
    {name:'Water Hammer Citizen', cat:'Social', cost:3, source:'Strongholds of the Empire p.107', desc:'One extra Rank in a Craft Skill you choose (a starting maximum of 4); crafting time is figured one coin size smaller.'},
    {name:'Zakyo Toshi Citizen', cat:'Social', cost:3, source:'Strongholds of the Empire p.152', desc:'One extra Rank in a Games Skill you choose; start with half as much again of your School’s starting koku.'},
  ];

  const SUPPLEMENT_DISADVANTAGES = [
    {name:'Bounty', cat:'Social', cost:2, source:'Strongholds of the Empire p.168', desc:'A price on your head: the offence sets the bounty, who hunts you and the Lore: Law / Perception TN to recognise you (25, 15 or 10). Worth 2, 4 or 6 by the offence.'},
    {name:'Broken Wave Stigma', cat:'Social', cost:2, source:'Strongholds of the Empire p.24', desc:'-1k0 on Social Skill rolls aimed at the Phoenix; Sworn Enemy or Nemesis against a Phoenix is worth 1 point less.'},
    {name:'Clear Water Stigma', cat:'Social', cost:2, source:'Strongholds of the Empire p.44', desc:'Your Glory counts one Rank lower with other Crab; lose either all your Outfit’s koku or one Outfit weapon (worth 2 either way).'},
    {name:'Dark Edge Reputation', cat:'Social', cost:2, source:'Strongholds of the Empire p.60', desc:'About every other session, someone challenges you to a duel (not where a duel makes no sense, such as the Shadowlands).'},
    {name:'Imperial City Stigma', cat:'Social', cost:4, source:'Strongholds of the Empire p.134', desc:'Works as Sworn Enemy, worth 1 point more; the GM changes who the enemy is every month to year.'},
    {name:'Nikesake Stigma', cat:'Social', cost:4, source:'Strongholds of the Empire p.75', desc:'-1k0 on Weapon Skill rolls that are not School Skills.'},
    {name:'Ruined City Survivor', cat:'Material', cost:4, source:'Strongholds of the Empire p.92', desc:'No starting koku, and two Outfit items of your choice are missing.'},
    {name:'Sleeper Agent', cat:'Mental', cost:5, source:'Enemies of the Empire p.49', desc:'Kolat conditioning: whoever speaks your trigger phrase can give you a command of five words or fewer, and you must carry it out. Worth 5, or 8 with a fail-safe: you kill yourself if the mission fails.'},
    {name:'The Chrysanthemum Court', cat:'Social', cost:5, source:'Imperial Histories 2 p.126', desc:'Worth 5. Failing a Social Skill roll at the Imperial Court by more than 10 costs 5 Status points for good, plus 1 per Raise declared; at Status 0 the Emperor has you killed (the Steel Chrysanthemum’s reign). In another era, a court under a cruel or corrupt lord: no death at Status 0, and worth 3.'},
    {name:'Trials of the Imperial City', cat:'Social', cost:4, source:'Strongholds of the Empire p.134', desc:'Works as Sworn Enemy, worth 1 point more; the GM changes who the enemy is every month to year. The book gives it Imperial City Stigma’s rule, for a posting in the city’s tense politics that many Lion find hard.'},
    {name:'Wanderer', cat:'Mental', cost:2, source:'Strongholds of the Empire p.168', desc:'You get lost easily: -15 when using the Navigation emphasis. (The book prints no type.)'},
    {name:'Water Hammer Stigma', cat:'Social', cost:2, source:'Strongholds of the Empire p.107', desc:'-1k0 on Social Skill rolls with any clan but the Dragon.'},
    {name:'Zakyo Toshi Stigma', cat:'Social', cost:3, source:'Strongholds of the Empire p.152', desc:'When gambling is going on, roll Willpower at TN 20 or join in; roll again every ten minutes.'},
  ];

  // Search only: no character the sheet builds can take these (no Naga or Nezumi Schools). [name, list, who, type, XP, page, text]
  const SUPPLEMENT_REFERENCE_ENTRIES = [
    ['Amphibious', 'adv', 'Naga', 'Physical', '3; Chameleon 2', 81, 'Breathe underwater.'],
    ['Divine Focus', 'adv', 'Naga', 'Spiritual', '3', 81, 'Twice a day, +1k0 on a Social roll with another Naga.'],
    ['Enhancing Mutation', 'adv', 'Naga', 'Physical', '5; Abominations and Cobra 4', 81, 'A helpful mutation, rolled or agreed from a table of ten (fins, night vision, Reduction 1 and so on).'],
    ['Hunter of the Foul', 'adv', 'Naga', 'Mental', '6', 82, '+0k1 damage against creatures of the Foul.'],
    ['Prehensile Tail', 'adv', 'Naga', 'Physical', '2', 82, 'Use your tail as another limb.'],
    ['Student of the Past', 'adv', 'Naga', 'Spiritual', 'Varies', 82, 'An ancestor’s mind within yours; the book prints no cost or effect.'],
    ['Adrift from the Akasha', 'disadv', 'Naga', 'Spiritual', '3', 82, '-1k0 on Social rolls and Willpower Trait rolls.'],
    ['Cursed Mutation', 'disadv', 'Naga', 'Physical', '5; Abominations and Cobra 6', 82, 'A harmful mutation from a table; Caste gains 1 less and losses 1 more.'],
    ['Terror of the Foul', 'disadv', 'Naga', 'Mental', '3', 83, 'TNs +5 near creatures of the Foul; -1k0 damage against them.'],
    ['Clever Tail', 'adv', 'Nezumi', 'Physical', '4', 110, 'Hold small objects and Small weapons with your tail; +1k1 on a tail Knockdown’s Contested Roll.'],
    ['Favored Pup of the Chief', 'adv', 'Nezumi', 'Social', '5', 110, 'Start with +1 Rank of Niche.'],
    ['Fearless', 'adv', 'Nezumi', 'Mental', '5', 110, '+3k3 resisting Fear; may join the Nezumi Berserker Advanced School.'],
    ['Forever Memory', 'adv', 'Nezumi', 'Mental', '6, Rememberers only', 110, '+1k1 whenever you make a Memory Stick.'],
    ['Human Allies', 'adv', 'Nezumi', 'Social', '4', 110, 'One extra item of human equipment; may learn human Skills (GM).'],
    ['Namebound', 'adv', 'Nezumi', 'Spiritual', '5, Shamans only', 110, 'One Name spell beyond your limit, cast at +1k1; buy again at each School Rank (GM).'],
    ['Shine-Shiney Eyes', 'adv', 'Nezumi', 'Physical', '3', 110, '+1k1 on Social rolls with Nezumi of the opposite sex.'],
    ['Teeth of Stone', 'adv', 'Nezumi', 'Physical', '4', 110, 'Bites deal +1k1 damage; chew through stone and metal.'],
    ['Tribal Wanderer', 'adv', 'Nezumi', 'Social', '3', 110, 'Learn a School from another tribe, and keep friends there.'],
    ['Kwa’thch', 'disadv', 'Nezumi', 'Physical', '2', 111, '-1k1 on Social rolls with other Nezumi.'],
    ['Lost Tail', 'disadv', 'Nezumi', 'Physical', '4', 111, '-1k0 on Social rolls with Nezumi; the running and jumping bonus drops to +1k0.'],
    ['Nameless', 'disadv', 'Nezumi', 'Spiritual', '9', 111, 'Niche Rank 0, and it cannot rise; no Name Points.'],
    ['Nezumi Madness', 'disadv', 'Nezumi', 'Social', '5', 111, 'Thought mad: you cannot mate or gain Niche, but other Nezumi will not harm you.'],
    ['Nose Blind', 'disadv', 'Nezumi', 'Physical', '2', 111, 'No Memory Sticks or scent messages; -1k0 on Social rolls with Nezumi.'],
  ];

  if(SUPPLEMENT_ENTRIES_ENABLED){
    [[ADV_LIBRARY, SUPPLEMENT_ADVANTAGES], [DISADV_LIBRARY, SUPPLEMENT_DISADVANTAGES]].forEach(function(pair){
      pair[1].forEach(function(entry){
        let at = pair[0].length;
        while(at > 0 && pair[0][at - 1].name.localeCompare(entry.name) > 0) at--;
        pair[0].splice(at, 0, entry);
      });
    });
  }

