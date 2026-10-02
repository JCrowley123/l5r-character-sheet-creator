  // ========= PART G PHASE 6 — SCHOOL TECHNIQUE TEXT (first release) =========
  // The text of the 72 School Techniques that had none, every one in the 20 Minor Clan and Mantis
  // Schools (measured 2 October 2026; they showed the "not yet available" notice). Written in our
  // own words from the books, each with its book and page: Core Rulebook pp.120-122 and 216-227,
  // The Great Clans pp.166-169, Secrets of the Empire p.238. The first release of Phase 6 (Part G):
  // its synergy detection needs every Technique's text before it can read any.
  //
  // Each entry is [Technique, School, Rank, text]. A name that already has text is never
  // overwritten: it is reported as a clash instead. The load check also reports any School
  // Technique left with no text of its own. A character saved before this release still holds the
  // notice in its rows; the Technique Name Clashes fix rewrites those rows on load, so for
  // existing characters this release depends on it (declared in both ROLLBACK.md files).
  // No CSS, markup or save field. Kill switch: TECHTEXT6_ENABLED.
  const TECHTEXT6_ENABLED = true;
  const TECHTEXT6 = (function(){
    const api = {};
    api.ENTRIES = [
      // --- Core Rulebook p.120, Yoritomo Bushi ---
      ['The Way of the Mantis', 'Yoritomo Bushi', 1, 'Rough or uneven ground costs you nothing on movement or attacks. Fighting with improvised or Peasant-keyword weapons loses you no Honor or Glory, and a Small or Medium Peasant weapon carries no off-hand penalty. +1k0 to all attack rolls. (Core Rulebook p.120)'],
      ['Voice of the Storm', 'Yoritomo Bushi', 2, 'Each time you hit an opponent in melee, their Armor TN against your attacks drops by 5 for 2 Rounds. It stacks up to your School Rank in times, and each new hit restarts the 2 Rounds. (Core Rulebook p.120)'],
      ['Strike of the Mantis', 'Yoritomo Bushi', 3, 'Attacks with Samurai- or Peasant-keyword weapons are Simple Actions for you. (Core Rulebook p.120)'],
      ['The Rolling Wave', 'Yoritomo Bushi', 4, 'Move at least 5 feet and you gain +10 Armor TN until your next Turn. On your Turn, before rolling an attack, you may give that bonus up for two Free Raises usable only on Knockdown. (Core Rulebook p.120)'],
      ['Hand of Osano-Wo', 'Yoritomo Bushi', 5, 'For a Void Point (a Free Action), keep extra damage dice equal to your Strength; against a Prone target you also add +0k2 to the damage. (Core Rulebook p.120)'],
      // --- Core Rulebook p.121, Moshi Shugenja and Yoritomo Courtier ---
      ['Favor of the Sun', 'Moshi Shugenja', 1, 'By day you have a second Affinity, for Fire spells; it lapses at night. Free Raise on spells with the Thunder keyword. (Core Rulebook p.121)'],
      ['Duty Before Honor', 'Yoritomo Courtier', 1, 'Using Commerce in public costs you no Honor or Glory, and Intimidation (Control) costs no Honor. Social Skill Rolls against ronin, bandits, gangsters, mercenaries, pirates and other outlaws gain Free Raises equal to your School Rank. (Core Rulebook p.121)'],
      ['Storm Heart', 'Yoritomo Courtier', 2, 'For Intimidation (Control) your Willpower counts as one Rank higher, or two against a samurai whose Status is lower than yours. (Core Rulebook p.121)'],
      ['Command the Winds', 'Yoritomo Courtier', 3, 'As many times per session as your School Rank, a failed Sincerity Social Skill Roll may be rolled again as Intimidation (Control); the Intimidation result stands. (Core Rulebook p.121)'],
      ['Will of the Storm', 'Yoritomo Courtier', 4, 'When you open a conversation, roll Intimidation (Control) / Willpower against their Etiquette (Courtesy) / Willpower. If you win, for the next hour they cannot spend Void Points against you and take -3k0 on Social rolls against you. Not again until that hour ends. (Core Rulebook p.121)'],
      ['Strength in All Things', 'Yoritomo Courtier', 5, '+5k0 whenever you use Intimidation on someone, and whenever you resist an Intimidation or Temptation roll or a Fear effect. (Core Rulebook p.121)'],
      // --- Core Rulebook p.122, Tsuruchi Archer ---
      ['Always Be Ready', 'Tsuruchi Archer [Bushi]', 1, '+1k0 to the total of your attack rolls with a bow, and +3 to your Initiative Score. (Core Rulebook p.122)'],
      ['The Arrow Knows the Way', 'Tsuruchi Archer [Bushi]', 2, 'A Free Raise usable only for the Called Shot Maneuver, and +2k0 to the total of damage rolls with a bow. (Core Rulebook p.122)'],
      ['The Wasp’s Sting', 'Tsuruchi Archer [Bushi]', 3, 'Bow attacks are Simple Actions for you. (Core Rulebook p.122)'],
      ['Flight of No-Mind', 'Tsuruchi Archer [Bushi]', 4, 'Once per skirmish, spend a Void Point and a Complex Action on one arrow that ignores armor entirely, and any Wound or visibility penalties. You may call Raises, but not Extra Attack, and the target must be within the bow’s normal range. (Core Rulebook p.122)'],
      ['Tsuruchi’s Eye', 'Tsuruchi Archer [Bushi]', 5, 'A ranged attack made as a Complex Action gains +4k1 to both its attack and damage totals. Cannot be combined with Flight of No-Mind. (Core Rulebook p.122)'],
      // --- Core Rulebook p.216, Ichiro Bushi ---
      ['Transcend the Mountain', 'Ichiro Bushi', 1, 'You may re-roll any Skill or Trait roll that uses Strength, but the second result stands. Moderate terrain costs you nothing on movement or combat, and Difficult terrain only half its usual penalty. (Core Rulebook p.216)'],
      ['Strength of the Badger', 'Ichiro Bushi', 2, 'As many times per session as your Strength, re-roll a damage roll and take the higher result. (Core Rulebook p.216)'],
      ['Crushing Blow', 'Ichiro Bushi', 3, 'Your attacks ignore the part of an opponent’s Armor TN that comes from armor, and your unarmed attacks ignore 1 Rank of the target’s Reduction. (Core Rulebook p.216)'],
      ['Crashing Stones', 'Ichiro Bushi', 4, 'Unarmed attacks, and attacks with Samurai weapons, are Simple Actions for you. (Core Rulebook p.216)'],
      ['Return the Strike', 'Ichiro Bushi', 5, 'When a skirmish begins, before anyone rolls Initiative, you may take -20 to your Initiative for the whole skirmish; in return, for the first two Rounds, roll extra unkept dice equal to your Strength on both attack and damage rolls. (Core Rulebook p.216)'],
      // --- Core Rulebook p.217, Komori Shugenja ---
      ['The Kami’s Whispers', 'Komori Shugenja', 1, 'Spend one spell slot to whisper a message to someone you know: up to thirty seconds long per School Rank, carried up to 100 miles per School Rank. (Core Rulebook p.217)'],
      // --- Core Rulebook p.218, Heichi Bushi and Tonbo Shugenja ---
      ['The Charge of the Boar', 'Heichi Bushi', 1, 'While in the Full Attack Stance, readying a Medium weapon or a spear is a Free Action for you, and a spear you fight with gains +0k1 damage. (Core Rulebook p.218)'],
      ['The Strength of Opposition', 'Heichi Bushi', 2, 'Entangling an opponent costs you two Raises with a mai chong, or three with any other spear. (Core Rulebook p.218)'],
      ['The Speed of the Boar', 'Heichi Bushi', 3, 'Attacking with a spear is a Simple Action for you. (Core Rulebook p.218)'],
      ['The Anger of the Boar', 'Heichi Bushi', 4, 'In the Reactions segment you may spend a Void Point to lower your Wound penalty by one Wound Rank for the rest of the skirmish; the Wounds themselves remain. (Core Rulebook p.218)'],
      ['Beyond the Mountains', 'Heichi Bushi', 5, 'In the Full Defense Stance you may still make one ordinary attack with a spear or a Samurai weapon as a Free Action, at +2k0 to the attack roll. (Core Rulebook p.218)'],
      ['Guided by Fate', 'Tonbo Shugenja', 1, 'Spend a spell slot for +1k0 on a Social Skill Roll, never more slots on one roll than your School Rank. Free Raise on spells with the Divination keyword. (Core Rulebook p.218)'],
      // --- Core Rulebook p.220, Kitsune Shugenja ---
      ['Essence of Chikushudo', 'Kitsune Shugenja', 1, 'Your Sense, Commune and Summon can reach Chikushudo’s animal spirits, not only the kami (Summon then brings one animal spirit rather than an amount of an element). Free Raise on any spell cast on an animal that does no damage. (Core Rulebook p.220)'],
      // --- Core Rulebook p.221, Usagi Bushi ---
      ['Speed of the Hare', 'Usagi Bushi', 1, 'Where there is room to dodge and leap (the GM decides), add your Athletics Rank to your Armor TN, except in the Full Attack or Center Stance. For the distance of Move Actions your Water counts as 1 higher. (Core Rulebook p.221)'],
      ['Leap of the Hare', 'Usagi Bushi', 2, 'In the Full Attack Stance you may spring at an opponent up to 15 feet away and attack without a Move Action; every attack you make that Turn must be against that opponent. (Core Rulebook p.221)'],
      ['Swift as Lightning', 'Usagi Bushi', 3, 'Unarmed, knife and Samurai-weapon attacks are Simple Actions for you. (Core Rulebook p.221)'],
      ['Kick of the Hare', 'Usagi Bushi', 4, 'Your Rank 2 leap now works in the Attack Stance too. Used in the Full Attack Stance, your second attack that Round may go to a different opponent within 15 feet of the first. (Core Rulebook p.221)'],
      ['Reichin’s Style', 'Usagi Bushi', 5, 'A Feint costs you only 1 Raise, and the extra damage of a successful Feint is not capped at your Insight Rank x5. (Core Rulebook p.221)'],
      // --- Core Rulebook p.222, Toku Bushi ---
      ['Toku’s Lesson', 'Toku Bushi', 1, '+1k0 on any Skill Roll, attacks included, against a TN of 25 or more. Your Wound penalties are reduced by your Willpower plus twice your School Rank. (Core Rulebook p.222)'],
      ['The Strength of One Man', 'Toku Bushi', 2, '+1k1 to attack and damage rolls while you face more than one opponent, or a foe of higher Insight Rank. (Core Rulebook p.222)'],
      ['Courage Above All', 'Toku Bushi', 3, 'Melee attacks are Simple Actions for you. (Core Rulebook p.222)'],
      ['Forge Your Own Fate', 'Toku Bushi', 4, 'When you are about to take Wounds, spend a Void Point to make the attacker drop the two highest dice of the damage roll, even if that leaves fewer kept dice, though never below 1k1. (Core Rulebook p.222)'],
      ['Fortune Favors the Mortal Man', 'Toku Bushi', 5, 'Once per Round, spend a Void Point to re-roll any roll at +2k1, then keep whichever of the two results you prefer. (Core Rulebook p.222)'],
      // --- Core Rulebook p.223, Tsi Smith ---
      ['Tools of the Fortunes', 'Tsi Smith [Artisan]', 1, 'Every Craft Skill counts as a School Skill for effects that care. A successful Craft roll against a TN of at least 10 plus 5 per School Rank earns 1 point of Glory, and 1 more for each 5 by which you beat the TN. (Core Rulebook p.223)'],
      ['Tsi Xing Guo’s Blessing', 'Tsi Smith [Artisan]', 2, 'Using something you made yourself (a weapon in battle, a fine kimono at court), Void Points spent on the related Skill Rolls give +2k1 instead of +1k1. When an item you made is given as a gift between samurai, you and the giver each gain Glory equal to your School Rank. (Core Rulebook p.223)'],
      ['A Crafter’s Dedication', 'Tsi Smith [Artisan]', 3, 'Crafting time is worked out from half the item’s price. When someone near you uses an item you made, you may spend a Complex Action to give them +Xk1 on the matching Skill Roll, X being your School Rank (Kenjutsu for a katana, Defense for armor, Etiquette for a kimono). (Core Rulebook p.223)'],
      ['Exhaustive Knowledge', 'Tsi Smith [Artisan]', 4, 'For a Void Point (a Free Action), for Rounds equal to your School Rank, attacks with a weapon you made are Simple Actions. (Core Rulebook p.223)'],
      ['Star-filled Steel', 'Tsi Smith [Artisan]', 5, 'Once per day, when you finish a weapon, spending every Void Point you have makes it a Sacred Weapon (as the Advantage), a Tsi weapon with one quality: Balanced (+1k0 to its attack rolls), Swift (+5 Initiative while wielded) or Unbreakable. The GM may also allow Radiant (counts as jade against Invulnerable creatures). (Core Rulebook p.223)'],
      // --- Core Rulebook p.224, Morito Bushi and Chuda Shugenja ---
      ['Legacy of the Four Winds', 'Morito Bushi', 1, 'While Mounted you gain +1k0 to Initiative at the start of combat and +1k0 to attack rolls. (Core Rulebook p.224)'],
      ['The Wind Blows Many Ways', 'Morito Bushi', 2, 'At the start of combat, choose Bugei Skills up to your School Rank in number; every roll that uses one gains +1k0. (Core Rulebook p.224)'],
      ['Thunder and Fury', 'Morito Bushi', 3, 'While Mounted, your attacks are Simple Actions. (Core Rulebook p.224)'],
      ['The Blade Upon the Wind', 'Morito Bushi', 4, 'Once per skirmish, for a Void Point (a Free Action), set your Initiative Score to match any other combatant’s, friend or foe. From then on it drops by 5 in the Reactions Stage of every Round until the encounter ends, and you still have only one Turn per Round. (Core Rulebook p.224)'],
      ['Fast and Furious', 'Morito Bushi', 5, '+2k2 to attack and damage rolls against an opponent whose Initiative is lower than yours. (Core Rulebook p.224)'],
      ['To Punish the Wicked', 'Chuda Shugenja [Snake]', 1, 'For a Void Point (a Free Action), lower one target’s Reduction by your School Rank. Your spells’ damage rolls gain your School Rank against a target with the Shadowlands Taint. (Core Rulebook p.224)'],
      // --- Core Rulebook p.225, Suzume Bushi ---
      ['All Things in Time', 'Suzume Bushi', 1, 'At the start of a Round, before anyone acts, you may lower your Initiative Score by 5 for +1k0 on every attack and damage roll that Round. (Core Rulebook p.225)'],
      ['Purity of Chi', 'Suzume Bushi', 2, 'Armor TN +5 against creatures, and against people whose Honor is lower than yours. (Core Rulebook p.225)'],
      ['Wisdom is the Greatest Weapon', 'Suzume Bushi', 3, 'For a Void Point, add your Honor Rank to a Perform or Lore Skill Roll. (Core Rulebook p.225)'],
      ['Quiet Spirit, Steady Blade', 'Suzume Bushi', 4, 'In the Attack Stance, your melee attacks are Simple Actions. (Core Rulebook p.225)'],
      ['Slow and Deadly', 'Suzume Bushi', 5, 'In the Round after you take the Center Stance, your attack and damage rolls gain +10. Not in iaijutsu duels. (Core Rulebook p.225)'],
      // --- Core Rulebook p.227, Kasuga Smuggler ---
      ['Way of the Tortoise', 'Kasuga Smuggler [Courtier]', 1, 'At character creation each purchase of the Languages Advantage also brings one gaijin language free. While serving your clan you lose no Honor for Low Skills and no Glory for using Commerce in public. +2k0 on all Social Skill Rolls with heimin and hinin (peasants, merchants, eta). (Core Rulebook p.227)'],
      ['The Shell of the Tortoise', 'Kasuga Smuggler [Courtier]', 2, 'A clan or Imperial samurai who attacks or openly slanders you unprovoked (the GM decides) at once loses Honor points equal to twice your School Rank. (Core Rulebook p.227)'],
      ['The Eyes of the Emperor', 'Kasuga Smuggler [Courtier]', 3, 'While acting for your clan, roll extra unkept dice, as many as your School Rank, on any Low Skill in which you have at least 1 Rank, including School Skills that count as Low when used a certain way (Sincerity with Deceit). Skill Ranks that come from Advantages or Techniques (such as Crafty) do not count. (Core Rulebook p.227)'],
      ['Hand in Hand', 'Kasuga Smuggler [Courtier]', 4, 'Once per session, if you can reach the local heimin or hinin, a Lore: Underworld / Awareness roll at TN 25 tells you one useful fact, chosen by the GM, that no other route would give you. (Core Rulebook p.227)'],
      ['The Tortoise Smiles', 'Kasuga Smuggler [Courtier]', 5, 'Your Void does not cap your Raises on rolls with your six named School Skills. As many times per session as your Void, gain +5k0 when rolling any of your School Skills; this stacks with your Rank 3 Technique. (Core Rulebook p.227)'],
      // --- The Great Clans pp.166-167, Mantis Brawler ---
      ['Way of Drunken Fists', 'Mantis Brawler [Bushi]', 1, 'Being Prone costs you nothing on Armor TN, or on attacks with Small weapons or unarmed, and against ranged attacks you still get the usual Prone bonus to Armor TN. +1k0 on rolls to take control of a Grapple, and on damage dealt unarmed or with an improvised or Small weapon. (The Great Clans p.166)'],
      ['Drunk Loses His Sandal', 'Mantis Brawler [Bushi]', 2, 'After a successful Feint you may give up 5 of its extra damage for +5 Armor TN until your next Turn (+10 if you Feinted while Prone). Once any enemy attack against you resolves, hit or miss, you may drop Prone as a Free Action. (The Great Clans p.166)'],
      ['Drunk Never Falls', 'Mantis Brawler [Bushi]', 3, 'In a skirmish you ignore the penalties for being Fatigued, Dazed or drunk. While Stunned you can still take one Simple Action each Round. (The Great Clans p.166)'],
      ['Two Drunks Dance', 'Mantis Brawler [Bushi]', 4, 'Unarmed, improvised-weapon and Small-weapon attacks are Simple Actions for you. (The Great Clans p.167)'],
      ['Drunk Pounds a Door', 'Mantis Brawler [Bushi]', 5, 'Spend a Void Point on a melee attack for +4k1 to both its attack and damage rolls, or +4k2 if you are Prone. (The Great Clans p.167)'],
      // --- The Great Clans p.168, Tsuruchi Bounty Hunter ---
      ['A Hunter’s Sense', 'Tsuruchi Bounty Hunter [Bushi]', 1, '+1k1 on Intimidation against someone of lower caste you think can lead you to your quarry; with samurai the bonus falls to +1k0 but covers every Social Skill Roll. While hunting a particular target, roll extra unkept dice, as many as your School Rank, on Hunting or Investigation rolls to track it down. (The Great Clans p.168)'],
      ['No Prey Escapes', 'Tsuruchi Bounty Hunter [Bushi]', 2, 'Spend a Void Point to pass a Lore: Underworld roll automatically, naming criminals nearby who might tell you about your quarry. Dealing with them still costs Honor as usual. (The Great Clans p.168)'],
      ['Justice of the Wasp', 'Tsuruchi Bounty Hunter [Bushi]', 3, 'Against someone an Imperial authority (or a higher Mantis one) has found guilty of a crime, Disarm and Knockdown cost you one Raise fewer, and a successful one leaves the target Dazed. (The Great Clans p.168)'],
      ['Twin Sting Strike', 'Tsuruchi Bounty Hunter [Bushi]', 4, 'Ranged attacks with a yumi are Simple Actions for you; against a target so condemned (see Rank 3), so are melee attacks with a katana or any knife. (The Great Clans p.168)'],
      ['Eyes of the Wasp', 'Tsuruchi Bounty Hunter [Bushi]', 5, 'Identifying a samurai with Lore: Heraldry tells you their Honor Rank and every Social and Mental Disadvantage, as well as their Glory. Any opponent your Rank 3 Technique applies to is Dazed whenever you hit them, Maneuver or not. (The Great Clans p.168)'],
      // --- The Great Clans p.169, Yoritomo Shugenja ---
      ['Child of the Sea', 'Yoritomo Shugenja', 1, 'Spend a spell slot to shift the wind where you are by one degree, or a slot and a Void Point to shift the whole weather by one degree; no more slots and Void Points together each Round than your School Rank. The change reaches miles equal to your School Rank around you. Free Raise on Thunder spells. (The Great Clans p.169)'],
      // --- Secrets of the Empire p.238, Fuzake Shugenja ---
      ['The Sideways Path', 'Fuzake Shugenja', 1, 'When you cast a healing spell (one that mends Wounds, or cures poison or disease, Path to Inner Peace and Peace of the Kami among them), you may also spend Earth spell slots; each one gives a Free Raise on the Spell Casting Roll. (Secrets of the Empire p.238)'],
    ];
    api.clashes = [];
    // Every problem the load check finds; an empty list is a clean load.
    api.assertResolve = function(){
      const bad = api.clashes.map(function(n){ return 'Technique "' + n + '" already has other text; ours was not used'; });
      const seen = {};
      api.ENTRIES.forEach(function(e){
        const name = e[0], school = e[1], rank = e[2], text = e[3];
        if(seen[name]) bad.push('"' + name + '" is listed twice');
        seen[name] = true;
        if((findSchoolTechniques(school) || [])[rank - 1] !== name) bad.push('"' + name + '" is not ' + school + '’s Rank ' + rank + ' Technique');
        if(!/\((Core Rulebook|The Great Clans|Secrets of the Empire) p\.\d+\)$/.test(text)) bad.push('"' + name + '" does not end with its book and page');
      });
      const fallback = techniqueDescription('\u0000no Technique has this name');
      Object.keys(ALL_SCHOOL_TECHNIQUES).forEach(function(s){
        (ALL_SCHOOL_TECHNIQUES[s] || []).forEach(function(n){
          if(techniqueDescription(n) === fallback) bad.push(s + ': "' + n + '" has no text');
        });
      });
      return bad;
    };
    return api;
  })();

  if(TECHTEXT6_ENABLED){
    TECHTEXT6.ENTRIES.forEach(function(e){
      if(Object.prototype.hasOwnProperty.call(TECH_DESCRIPTIONS, e[0]) && TECH_DESCRIPTIONS[e[0]] !== e[3]) TECHTEXT6.clashes.push(e[0]);
      else TECH_DESCRIPTIONS[e[0]] = e[3];
    });
    const techText6Unresolved = TECHTEXT6.assertResolve();
    if(techText6Unresolved.length) console.error('Phase 6 (Part G) School Technique Text: unresolved:\n' + techText6Unresolved.join('\n'));
  }
  // ========= END PART G PHASE 6 =========
