  // ---------- Kata & Spell libraries (Techniques quick-add) ----------
  const KATA_LIBRARY = [
    {name:'Striking as Air', ring:'Air', mastery:3, schools:'Any', desc:'Defense Stance: Armor TN increases by your Air Ring.'},
    {name:'Striking as Earth', ring:'Earth', mastery:3, schools:'Any', desc:'Full Defense Stance: gain Reduction equal to your Earth Ring (stacks with other Reduction).'},
    {name:'Striking as Fire', ring:'Fire', mastery:3, schools:'Any', desc:'Full Attack Stance: add your Fire Ring to one attack roll per round.'},
    {name:'Striking as Void', ring:'Void', mastery:3, schools:'Any', desc:'Center Stance: Armor TN increases by your Void Ring.'},
    {name:'Striking as Water', ring:'Water', mastery:4, schools:'Any', desc:'Attack Stance: move 5 extra feet as a Free Action.'},
    {name:'Balance the Elements Style', ring:'Void', mastery:3, schools:'Mirumoto Bushi, Shiba Bushi', desc:'Use your Void Ring instead of Reflexes for Initiative.'},
    {name:'Breath of Wind Style', ring:'Air', mastery:3, schools:'Kakita Bushi, Bayushi Bushi', desc:'Initiative Score rises +2 each Reactions Stage; stacks, but drops if the kata ends.'},
    {name:'Disappearing World Style', ring:'Fire', mastery:4, schools:'Akodo Bushi, Kakita Bushi', desc:'Once per turn vs. a chosen foe, use Agility instead of Strength for damage.'},
    {name:'Hidden Blade Style', ring:'Air', mastery:4, schools:'Bayushi Bushi, Yoritomo Bushi', desc:'Disarm attacks deal normal weapon damage instead of 2k1 (no Raises to boost it).'},
    {name:'Indomitable Warrior Style', ring:'Earth', mastery:4, schools:'Daigotsu Bushi, Hida Bushi, Ichiro Bushi, Moto Bushi', desc:'Reduce TN penalties from Wound Ranks by your Earth Ring.'},
    {name:'Iron Forest Style', ring:'Air', mastery:4, schools:'Daidoji Iron Warrior, Heichi Bushi, Shiba Bushi', desc:'With a spear or polearm, use Air instead of Agility for attack rolls.'},
    {name:'Iron in the Mountains Style', ring:'Earth', mastery:3, schools:'Daidoji Iron Warrior, Hida Bushi', desc:'Use your Earth Ring instead of Air for the Defense Stance.'},
    {name:'Reckless Abandon Style', ring:'Fire', mastery:4, schools:'Daigotsu Bushi, Matsu Berserker, Usagi Bushi', desc:'Add your Fire Ring to Armor TN while in Full Attack Stance.'},
    {name:'Strength in Arms Style', ring:'Water', mastery:4, schools:'Hida Bushi, Ichiro Bushi, Moto Bushi', desc:'Once per turn with a Heavy Weapon, use Strength instead of Agility to attack.'},
    {name:'Strength of Purity Style', ring:'Void', mastery:4, schools:'Akodo Bushi, Kakita Bushi, Matsu Berserker, Utaku Battle Maiden', desc:'Once per turn, roll Honor Rank instead of Strength+DR for damage (keep = weapon DR).'},
    {name:'Spinning Blades Style', ring:'Fire', mastery:5, schools:'Mirumoto Bushi, Yoritomo Bushi', desc:'Dual-wielding: Extra Attack Maneuver costs 3 Raises instead of 5, but neither hit can be boosted by Raises.'},
    {name:'Veiled Menace Style', ring:'Air', mastery:4, schools:'Bayushi Bushi, Hiruma Bushi, Tsuruchi Archer, Yoritomo Bushi', desc:'Once per turn, add your Stealth Rank to Armor TN for a single attack.'},
  ];
  // Kiho are NOT spells and deliberately do not share the spell system's shape: there are no
  // Kiho slots, no preparation step, no scroll ownership and no Affinity/Deficiency. Core
  // Rulebook p.261 (Utilizing Kiho) is the complete activation rule set and contains nothing
  // of the sort. Two separate things limit a monk — how many Kiho he KNOWS (capped by
  // cumulative Monk/Shugenja School Rank) and how many he may have ACTIVE at once — and
  // neither is a slot. This library mirrors KATA_LIBRARY above, not SPELL_LIBRARY below.
  //
  // Fields:
  //   ring/mastery  Element and Mastery Level. Eligibility is Ring + School Rank vs. Mastery
  //                 for a monk (p.261), Ring alone for a Shugenja (p.266) — see kihoEligibility.
  //   type          Internal | Kharmic | Martial | Mystical (p.261).
  //   atemi         Delivered by a precise nerve strike. Per p.261 an atemi Kiho activates as
  //                 part of the activating attack and is a FREE ACTION whether paid for with a
  //                 Void Point or the TN 15 roll, so activation timing is derived from this
  //                 flag rather than duplicated into `activation` below.
  //   activation    A per-Kiho OVERRIDE, null for the overwhelming majority, which use the
  //                 p.261 defaults (Void Point = Free Action; Meditation/Void vs. TN 15 =
  //                 Complex Action; vs. TN 30 = Simple Action). Populated only where the
  //                 Kiho's own text restricts or changes activation — in the Core Rulebook
  //                 that is the three "Void Point only" Kiho plus Death Touch's and Spin the
  //                 Kharmic Wheel's extra costs. NOT to be confused with a School-level
  //                 activationCostOverride, which is per-character and permissive.
  //   schools       'Any' throughout this pass: the Core Rulebook does not spell out
  //                 order-specific Kiho restrictions, and they should not be guessed at.
  //
  // ACTIVE-AT-ONCE RULE — reference only, deliberately not enforced. p.261: a monk may have
  // only one each of Internal, Kharmic and Mystical Kiho active at a time; he may have several
  // Martial Kiho active but may deliver only one Kiho effect per unarmed strike per Turn. That
  // is combat state this sheet does not track, so it is surfaced as a note in the Techniques
  // panel rather than built into an activation tracker.
  const KIHO_LIBRARY = [
    // --- Air (Core Rulebook pp.262-263) ---
    {name:'Air Fist', ring:'Air', mastery:3, type:'Internal', atemi:false, schools:'Any', activation:null, desc:'Initiative Score +5 so long as every attack you make is unarmed; unarmed damage drops by your Air Ring, and any other attack cancels it. Lasts up to one day.'},
    {name:'Flee the Darkness', ring:'Air', mastery:6, type:'Kharmic', atemi:false, schools:'Any', activation:null, desc:'Immune to the Shadowlands Taint and similar corruption for Air Ring Rounds, ignoring both penalties and benefits of any Taint you carry. Ends at once if you court the Taint deliberately.'},
    {name:'The Great Silence', ring:'Air', mastery:4, type:'Mystical', atemi:true, schools:'Any', activation:null, desc:'The target of the activating atemi strike cannot speak for a number of Rounds equal to your Air Ring.'},
    {name:'Harmony of the Mind', ring:'Air', mastery:5, type:'Mystical', atemi:false, schools:'Any', activation:null, desc:'Contested Air Roll against a target in sight to learn their highest or lowest Ring, highest Skill Rank, or highest-cost Spiritual Advantage or Disadvantage; one more fact per Raise. Air Ring times per day.'},
    {name:'Riding the Clouds', ring:'Air', mastery:3, type:'Mystical', atemi:false, schools:'Any', activation:null, desc:'Take a Simple Move Action to leap up to your Air Ring x10 feet. Expended once you have made that leap.'},
    {name:'Soul of the Four Winds', ring:'Air', mastery:4, type:'Internal', atemi:false, schools:'Any', activation:null, desc:'Armor TN increases by your Insight Rank plus your Air Ring while active.'},
    {name:'Stain Upon the Soul', ring:'Air', mastery:3, type:'Martial', atemi:true, schools:'Any', activation:null, desc:'The atemi target suffers TN penalties as though at a number of Wound Ranks equal to your Air Ring, for Insight Rank + Air Ring Rounds. Never stacks with itself, and real Wounds supersede it rather than adding to it.'},
    {name:'Steal the Air Dragon', ring:'Air', mastery:7, type:'Kharmic', atemi:false, schools:'Any', activation:null, desc:'Add rolled and kept dice equal to your Air Ring to every Stealth Roll, for a number of minutes equal to your Insight Rank.'},
    {name:'Way of the Willow', ring:'Air', mastery:5, type:'Internal', atemi:false, schools:'Any', activation:null, desc:'Before your Turn, spend a Void Point to interrupt an opponent declaring a melee attack on you: either move away or make one unarmed attack, after which the Kiho ends. Goes inactive if unused within a day.'},
    // --- Earth (Core Rulebook pp.263-264) ---
    {name:'Cleansing Spirit', ring:'Earth', mastery:4, type:'Internal', atemi:false, schools:'Any', activation:null, desc:'Roll additional dice equal to half your Earth Ring (rounded down) on any roll made to resist poison or disease.'},
    {name:'Earthen Fist', ring:'Earth', mastery:3, type:'Internal', atemi:false, schools:'Any', activation:null, desc:'You may adopt only the Defense or Full Defense Stance; when an opponent\'s melee attack misses you, on your next Turn you may Disarm them for no Raises regardless of stance, which ends the Kiho. Goes inactive if unused within a day.'},
    {name:'Earth Needs No Eyes', ring:'Earth', mastery:3, type:'Internal', atemi:false, schools:'Any', activation:null, desc:'Detect anything moving in contact with the ground within your Insight Rank x50 feet, and you cannot be ambushed or surprised by a land-bound opponent. Lasts Earth Ring minutes.'},
    {name:'Embrace the Stone', ring:'Earth', mastery:5, type:'Mystical', atemi:false, schools:'Any', activation:null, desc:'Gain a Reduction Rating equal to twice your Earth Ring, stacking with armor, spells and any other source, for Earth Ring Rounds.'},
    {name:'Grasp the Earth Dragon', ring:'Earth', mastery:5, type:'Internal', atemi:false, schools:'Any', activation:null, desc:'TN penalties at every Wound Rank are reduced by your Earth Ring, and you may still take Simple Actions at the Down Wound Rank, for Earth Ring Rounds.'},
    {name:'Rest, My Brother', ring:'Earth', mastery:5, type:'Martial', atemi:true, schools:'Any', activation:null, desc:'The activating strike deals normal unarmed damage despite being atemi, plus unkept dice equal to the target\'s Shadowlands Taint Rank. A formerly uncorrupted target loses every benefit of the Taint, and its madness, for Earth Ring Rounds.'},
    {name:'Root the Mountain', ring:'Earth', mastery:5, type:'Internal', atemi:false, schools:'Any', activation:null, desc:'Knockdown against you needs two extra Raises, and any attempt to force you to move needs a Contested Earth Roll on top of its normal cost — but you may not take Move Actions without dispelling the effect.'},
    {name:'Speed of the Mountains', ring:'Earth', mastery:4, type:'Kharmic', atemi:true, schools:'Any', activation:null, desc:'The atemi target\'s Water Ring counts as two Ranks lower for how far a Move Action carries them, for a number of Rounds equal to twice your Earth Ring.'},
    {name:'Way of the Earth', ring:'Earth', mastery:4, type:'Martial', atemi:false, schools:'Any', activation:null, desc:'Anyone Grappling with you suffers extra Wounds equal to your Earth Ring each Round at the Reactions Stage, no matter who is winning the Grapple. Lasts Earth Ring minutes.'},
    // --- Fire (Core Rulebook pp.264-265) ---
    {name:'The Body Is an Anvil', ring:'Fire', mastery:4, type:'Mystical', atemi:false, schools:'Any', activation:null, desc:'Your skin turns searingly hot: anyone who touches you, attacks you unarmed, or is struck by your unarmed attack suffers Wounds equal to your Fire Ring. Lasts twice your Fire Ring in Rounds.'},
    {name:'Breaking Blow', ring:'Fire', mastery:3, type:'Martial', atemi:false, schools:'Any', activation:null, desc:'Unarmed strikes inflict full damage on non-metal substances such as wood and stone without hurting you. Lasts Fire Ring minutes; the GM judges what an object can withstand.'},
    {name:'Channel the Fire Dragon', ring:'Fire', mastery:6, type:'Internal', atemi:false, schools:'Any', activation:null, desc:'Damage from heat or cold, including from spells and other Kiho, is reduced by -2k2 for one day.'},
    {name:'Dance of the Flames', ring:'Fire', mastery:6, type:'Martial', atemi:false, schools:'Any', activation:null, desc:'Unarmed attacks become a Simple Action rather than a Complex Action. You must make an unarmed attack against an opponent every Round or the effect ends immediately.'},
    {name:'Destiny\'s Strike', ring:'Fire', mastery:4, type:'Martial', atemi:false, schools:'Any', activation:null, desc:'Whenever a melee attack strikes you, immediately counterattack with a single unarmed attack that ignores that attack\'s Wound Penalties — your Turn if you have not taken it, a Free Action if you have. Lasts the skirmish.'},
    {name:'Falling Star Strike', ring:'Fire', mastery:7, type:'Martial', atemi:true, schools:'Any', activation:'Void Point only — may not be activated by a Void / Meditation Skill Roll. Also requires two Raises on the unarmed attack.', desc:'The attack inflicts normal damage plus extra damage at a DR equal to your Fire Ring in rolled and kept dice; win a Contested Fire Roll and the target is Blind for Fire Ring hours.'},
    {name:'Fire\'s Fleeting Speed', ring:'Fire', mastery:4, type:'Kharmic', atemi:false, schools:'Any', activation:null, desc:'Every Move Action carries you an extra +5 feet, for a number of Rounds equal to your Fire Ring.'},
    {name:'Flame Fist', ring:'Fire', mastery:3, type:'Martial', atemi:true, schools:'Any', activation:null, desc:'The atemi target suffers a TN penalty to all actions equal to three times your Fire Ring, for Fire Ring Rounds.'},
    {name:'Unbalance the Mind', ring:'Fire', mastery:5, type:'Mystical', atemi:true, schools:'Any', activation:null, desc:'The target of the activating atemi strike is Dazed.'},
    // --- Water (Core Rulebook p.265) ---
    {name:'As the Breakers', ring:'Water', mastery:5, type:'Kharmic', atemi:true, schools:'Any', activation:null, desc:'The atemi target loses one Simple Action this Round. Only usable against someone who has not yet acted, and no opponent may be affected more than once per skirmish.'},
    {name:'Buoyed by the Kami', ring:'Water', mastery:3, type:'Mystical', atemi:false, schools:'Any', activation:null, desc:'Move across the surface of water as if it were basic terrain, for as long as you take Simple Move Actions each Round, up to five minutes.'},
    {name:'Chi Protection', ring:'Water', mastery:4, type:'Martial', atemi:true, schools:'Any', activation:'Void Point only — may not be activated by a Void / Meditation Skill Roll.', desc:'The opponent or willing ally struck regains Wounds equal to your Water Ring at once, and again at the start of your Turn each Round for Insight Rank Rounds. Never usable on yourself.'},
    {name:'Freezing the Lifeblood', ring:'Water', mastery:7, type:'Martial', atemi:true, schools:'Any', activation:null, desc:'The atemi target is paralyzed — effectively Stunned, unable to take Move Actions or move under his own power — for a number of Rounds equal to your Insight Rank.'},
    {name:'Partaking the Waves', ring:'Water', mastery:6, type:'Internal', atemi:false, schools:'Any', activation:null, desc:'Gain Reduction equal to your Water Ring, stacking with armor and spells, for twice your Water Ring in Rounds.'},
    {name:'Ride the Water Dragon', ring:'Water', mastery:3, type:'Kharmic', atemi:false, schools:'Any', activation:null, desc:'Recover Wounds equal to your Water Ring during the Reactions Stage of each Round, for a number of Rounds equal to your Insight Rank.'},
    {name:'Slap the Wave', ring:'Water', mastery:7, type:'Mystical', atemi:false, schools:'Any', activation:'Void Point only — may not be activated by a Void / Meditation Skill Roll.', desc:'Strike your hands together with a kiai shout: everyone in your forward facing arc within your Water Ring x5 feet is Dazed unless they win a Contested Water Roll against you.'},
    {name:'Waves in All Things', ring:'Water', mastery:4, type:'Mystical', atemi:false, schools:'Any', activation:null, desc:'Strike standing water or the earth to land an unarmed attack on one opponent in contact with it within your Water Ring x10 feet. Unmistakably obvious, and it reveals your position if you were concealed.'},
    // --- Void (Core Rulebook pp.265-267) ---
    {name:'Banish All Shadows', ring:'Void', mastery:4, type:'Kharmic', atemi:true, schools:'Any', activation:null, desc:'The target of the activating strike may ignore the effects of his highest-point Disadvantage for Void Ring Rounds. Never affects a Spiritual or Social Disadvantage.'},
    {name:'Death Touch', ring:'Void', mastery:7, type:'Mystical', atemi:true, schools:'Any', activation:'Requires three atemi strikes on three consecutive Rounds immediately after activation, plus one further Void Point after the third strike.', desc:'All the target\'s Rings drop by 1 each hour, to a maximum penalty equal to your Insight Rank. A Ring reaching 0 leaves him catatonic, and he dies if he loses three Contested Void Rolls by 5 or more. Grounds for excommunication from the Brotherhood.'},
    {name:'Eight Directions Awareness', ring:'Void', mastery:5, type:'Mystical', atemi:false, schools:'Any', activation:null, desc:'You become aware of every living thing within your Void Ring x10 feet, and of anything deliberately concealed there — secret doors, hidden compartments, buried objects.'},
    {name:'Silent Solace', ring:'Void', mastery:5, type:'Kharmic', atemi:true, schools:'Any', activation:null, desc:'The target of the activating strike must expend two spell slots to cast a single spell, for a number of Rounds equal to your Void Ring.'},
    {name:'Song of the World', ring:'Void', mastery:3, type:'Kharmic', atemi:false, schools:'Any', activation:null, desc:'Target an opponent within fifty feet and win a Contested Void Roll: his Initiative Score drops by 5 and yours rises by the same amount.'},
    {name:'Spin the Kharmic Wheel', ring:'Void', mastery:8, type:'Kharmic', atemi:true, schools:'Any', activation:'Expends all your remaining Void Points, and must be delivered by an unarmed attack.', desc:'The target loses one randomly determined Social, Spiritual or Mental Disadvantage and gains a new random one of equal value. The GM may choose rather than roll.'},
    {name:'Touch the Void Dragon', ring:'Void', mastery:4, type:'Internal', atemi:false, schools:'Any', activation:null, desc:'One of your Rings and its Traits count as one Rank higher, chosen by your surroundings — mountains raise Earth, the seashore Water, the plains Air, desert or volcanic ground Fire.'},
    {name:'To the Last Breath', ring:'Void', mastery:3, type:'Kharmic', atemi:false, schools:'Any', activation:null, desc:'One chosen person within twenty feet gains a Void Point on their next Turn. No target may benefit more than twice per day.'},
    {name:'Void Fist', ring:'Void', mastery:4, type:'Martial', atemi:true, schools:'Any', activation:null, desc:'A successful Raise to strike inflicts no damage but immediately returns two Void Points to you. Enemies only, and useless against a target who has no Void Points.'},
    // ================= Kiho from the five Elemental books =================
    // Same schema as the Core Rulebook entries above. Two fields appear here for the first time:
    //   requiresWeapon  Book of Water's three "Staff Kiho" can only be used while wielding a bo
    //                   staff or a three-section staff (explicitly NOT a jo or tonfa). Recorded
    //                   as reference text on the entry and shown in the panel, not enforced -
    //                   the same treatment atemi and the one-at-a-time rule already get.
    //   monksOnly       Rebuke of the Heavens says outright "This Kiho is only available to
    //                   monks, not to shugenja" - the one Kiho in any of these books with an
    //                   acquisition restriction of its own. This one IS enforced, in
    //                   kihoEligibility, because it is a flat prohibition rather than combat state.
    // --- Book of Air, pp.190-192 ---
    {name:'Eye of the Eagle', ring:'Air', mastery:5, type:'Internal', atemi:false, schools:'Any', activation:null, desc:'Spend a Complex Action to become utterly still: while you hold that position you can see a number of miles equal to your School Rank, clearly enough to make out a person\u2019s features but not to read.'},
    {name:'The Wind\u2019s Vision', ring:'Air', mastery:4, type:'Internal', atemi:false, schools:'Any', activation:null, desc:'Fire an arrow at a target you cannot see but whose approximate position you know within 30 feet. The arrow still travels in a straight line - through a paper screen, smoke or darkness, but never through stone or around corners.'},
    {name:'Calling the East Wind', ring:'Air', mastery:5, type:'Martial', atemi:false, schools:'Any', activation:null, desc:'Leap up to your Air Ring x10 feet into a single unarmed kick, adding +1k0 damage and gaining one Free Raise toward the Knockdown Maneuver on that attack.'},
    {name:'Censure of Thunder', ring:'Air', mastery:7, type:'Martial', atemi:true, schools:'Any', activation:null, desc:'The atemi target takes 1k1 Wounds of electrical shock and is Disarmed as though by a successful Maneuver. He may spend two Void Points to keep his weapon, but then suffers a further 2k2. This damage bypasses armor Reduction.'},
    {name:'Hurricane Palm', ring:'Air', mastery:7, type:'Martial', atemi:false, schools:'Any', activation:'Spend a Void Point after a successful unarmed strike.', desc:'Your strike deals only half damage (rounded down) but hurls the target back twice your Air Ring in feet and leaves him Prone - even if the blow inflicted no Wounds at all.'},
    {name:'Touch of the Storm', ring:'Air', mastery:6, type:'Martial', atemi:true, schools:'Any', activation:null, desc:'After a successful atemi strike, win a Contested Air Roll to discharge the air around your target for damage at a DR equal to your Air Ring. Ignores every form of Reduction that does not specifically mention electricity.'},
    {name:'Inari\u2019s Wrath', ring:'Air', mastery:8, type:'Mystical', atemi:false, schools:'Any', activation:'Void Point as a Free Action, then a Complex Action to draw breath, released as a Complex Action on the following Round.', desc:'Exhale a cone of freezing air, School Rank x5 feet long and School Rank x2 feet across at its end. Every living creature caught in it suffers cold damage at a DR equal to your Air Ring.'},
    {name:'Strike through the Wind', ring:'Air', mastery:5, type:'Mystical', atemi:false, schools:'Any', activation:'Void Point as a Free Action.', desc:'Unarmed melee attacks become a Complex Action but may reach targets as far away as your School Rank x25 feet, the force carried through the air itself.'},
    {name:'Thunder\u2019s Word', ring:'Air', mastery:6, type:'Mystical', atemi:false, schools:'Any', activation:null, desc:'As a Complex Action, shout a single word of power. Every living being that hears it rolls Contested Air against your single roll; those who fail are Dazed for a number of Rounds equal to your Air Ring.'},
    // --- Book of Earth, pp.205-207 ---
    {name:'Shadowed Mountain', ring:'Earth', mastery:6, type:'Internal', atemi:false, schools:'Any', activation:null, desc:'Once per activation, drop into the Full Defense Stance immediately before you are attacked - not necessarily the first such attack. You then cannot change Stance at your next opportunity. Lasts until used or the day ends.'},
    {name:'Depths of the World', ring:'Earth', mastery:4, type:'Internal', atemi:false, schools:'Any', activation:'Complex Action only. May still be activated while you are unable to act, such as when Stunned.', desc:'Immediately roll to recover from any non-permanent Condition that allows a recovery roll, such as Dazed.'},
    {name:'Harmony in Earth', ring:'Earth', mastery:6, type:'Internal', atemi:false, schools:'Any', activation:null, desc:'Stay perfectly still for ten minus your Earth Ring in Turns, then sense every spiritual and physical impurity within your Earth Ring x50 feet for one Round - direction, general nature and relative strength, up to your Void in total, strongest first. Never a precise location.'},
    {name:'The Rolling Avalanche', ring:'Earth', mastery:5, type:'Martial', atemi:true, schools:'Any', activation:null, desc:'The atemi strike deals normal unarmed damage, and a successful hit adds +Xk0 to the damage roll where X is your Earth Ring.'},
    {name:'Earth Palm', ring:'Earth', mastery:6, type:'Martial', atemi:true, schools:'Any', activation:null, desc:'On a successful atemi strike, attack the target\u2019s Water for -4k0 to all his damage rolls, or his Fire to force two wasted Raises on every attack roll. Both last your Earth Ring in Rounds, stack across applications, and may be used only once per Turn.'},
    {name:'Bishamon\u2019s Grasp', ring:'Earth', mastery:7, type:'Kharmic', atemi:false, schools:'Any', activation:'Only while in the Defense or Full Defense Stance.', desc:'Make Grappling attack rolls as Free Actions against each opponent who has attacked you since your last Turn, Throw a controlled Grapple as a Free Action (at -1k1 damage if your GM allows Throw damage), and hold a Grapple without leaving your defensive Stance.'},
    {name:'Rising Mountain', ring:'Earth', mastery:6, type:'Kharmic', atemi:false, schools:'Any', activation:null, desc:'For your Insight Rank +1 in Rounds, every Raise an attacker declares against you grants Reduction equal to twice that number of Raises, whether or not the attack lands. Cumulative to a maximum of your Earth x5; Free Raises do not trigger it.'},
    {name:'Wholeness In All', ring:'Earth', mastery:6, type:'Kharmic', atemi:false, schools:'Any', activation:'Two hours of uninterrupted meditation first, then a Complex Action - and only in that manner.', desc:'Call one Raise per mundane poison, disease or similar non-supernatural affliction on you. On success your body purges a number of them equal to the Void Points you hold, not counting the one spent to activate.'},
    // --- Book of Fire, pp.191-192 ---
    {name:'The Mind\u2019s Fire', ring:'Fire', mastery:4, type:'Internal', atemi:false, schools:'Any', activation:null, desc:'+2k2 to every Intelligence-based Skill Roll while active. The moment the Kiho ends you are Fatigued.'},
    {name:'Sever the Dark Lord\u2019s Touch', ring:'Fire', mastery:5, type:'Mystical', atemi:true, schools:'Any', activation:null, desc:'A successful atemi strike on an unintelligent undead forces a Contested Roll of your Fire against its Shadowlands Taint; win and the creature is destroyed outright. Kuni Shugenja and Kuni Witch-Hunters treat its Mastery as one Rank lower.'},
    {name:'Seven Storms\u2019 Fist', ring:'Fire', mastery:6, type:'Martial', atemi:true, schools:'Any', activation:null, desc:'A successful atemi strike forces a Contested Fire Roll; win and your opponent is Stunned for one Round.'},
    // --- Book of Water, pp.188-189 (Staff Kiho) ---
    {name:'Musubi', ring:'Water', mastery:5, type:'Internal', atemi:false, schools:'Any', activation:null, requiresWeapon:'staff', desc:'While you keep the staff moving (a Free Action), add your Water Ring plus your Staves Skill Rank to your Armor TN. Each Simple Action you spend on the motion that Round adds your Water Ring again until your next Turn.'},
    {name:'Dharma Technique', ring:'Water', mastery:7, type:'Martial', atemi:false, schools:'Any', activation:null, requiresWeapon:'staff', desc:'Spend a Simple Action each Round on the staff\u2019s motion. When a spell targets you alone, roll Contested Staves/Water against the caster\u2019s Spell Casting Roll to disperse it - Water Ring times per skirmish. Against maho, your GM may allow it at three Raises.'},
    {name:'Tasaii-Do', ring:'Water', mastery:6, type:'Martial', atemi:true, schools:'Any', activation:null, requiresWeapon:'staff', desc:'Activated like an atemi Kiho but delivered with a staff strike rather than unarmed. After it lands, roll Contested Water against the target\u2019s Earth; on a success he is Stunned.'},
    // --- Book of Void, pp.192-193 ---
    {name:'Knowledge from Within', ring:'Void', mastery:4, type:'Internal', atemi:false, schools:'Any', activation:'You must be meditating or in the Center Stance to activate it.', desc:'Sense Elemental spell effects and nemuranai within your Void x10 feet for as long as you maintain the Kiho. You learn direction and general nature - "a Fire spell that way" - never a specific identity or location.'},
    {name:'Mind/No-Mind', ring:'Void', mastery:6, type:'Mystical', atemi:true, schools:'Any', activation:null, desc:'On a successful atemi strike, roll Contested Void against the target\u2019s Fire. Win and his mind empties: he forgets the last minute entirely, and at your GM\u2019s option is Dazed for a Round. Also useful for calming panic or rage.'},
    {name:'Rebuke of the Heavens', ring:'Void', mastery:5, type:'Kharmic', atemi:false, schools:'Any', monksOnly:true, activation:'A Complex Action spent on a gesture of rebuke - a chanted sutra, a shaken ringed staff, a mudra - in addition to the normal activation roll.', desc:'Target one supernatural creature not native to Jigoku or Tengoku and roll Contested Meditation/Void against its highest Ring. On a success it suffers -Xk1 to every roll, X being your total Monk School Ranks, until it is slain or leaves your presence. Monks only, never shugenja.'},
    {name:'Sense the Balance', ring:'Void', mastery:6, type:'Kharmic', atemi:true, schools:'Any', activation:null, desc:'After a successful atemi strike, spend a Void Point to learn how many Spiritual Advantages or Disadvantages the target has (your choice which). Win a Contested Void Roll and you also learn the highest-value one by name. Repeated uses reveal a new one each time.'},
    {name:'Striking Through the Void', ring:'Void', mastery:7, type:'Martial', atemi:false, schools:'Any', activation:null, desc:'While active you may spend a Void Point on the damage roll of an unarmed strike, one Void Point per attack.'},
    {name:'The World Disappears', ring:'Void', mastery:6, type:'Internal', atemi:false, schools:'Any', activation:'You must be meditating or in the Center Stance to activate it.', desc:'Float a few inches above the ground, moving at normal speed over any surface - earth, water, molten lava - without touching it, and immune to Grappling and Entangling while it lasts.'},
  ];
  const SPELL_LIBRARY = [
    {name:'Commune', element:'Universal', mastery:1, desc:'Ask a local elemental spirit questions; it answers honestly (Water/Air/Earth/Fire, not Void).'},
    {name:'Sense', element:'Universal', mastery:1, desc:'Detect the presence, rough quantity, and location of elemental spirits of one element nearby.'},
    {name:'Summon', element:'Universal', mastery:1, desc:'Conjure roughly one cubic foot of the chosen mundane element at range.'},
    {name:'Arrow\'s Flight', element:'Air', mastery:1, desc:'An enchanted arrow fired within the duration unerringly hits its target.', keywords:['Battle']},
    {name:'Blessed Wind', element:'Air', mastery:1, desc:'Swirling winds add +15 Armor TN vs. non-magical ranged attacks while concentrating.', keywords:['Defense']},
    {name:'By the Light of the Moon', element:'Air', mastery:1, desc:'Reveals hidden/concealed objects nearby as faint glowing outlines, visible only to you.'},
    {name:'Cloak of Night', element:'Air', mastery:1, desc:'Renders one small object invisible to the naked eye for the duration.', keywords:['Illusion']},
    {name:'Gathering Swirl', element:'Air', mastery:1, desc:'Winds gather named unattended items into a neat pile wherever you choose within range.'},
    {name:'Legacy of Kaze-no-Kami', element:'Air', mastery:1, desc:'A wind-formed bird carries a short spoken message to a known person far away.', keywords:['Craft']},
    {name:'Nature\'s Touch', element:'Air', mastery:1, desc:'Lets a natural animal fully understand your speech for as long as you hold its attention.'},
    {name:'Tempest of Air', element:'Air', mastery:1, desc:'A cone of wind deals 1k1 and can knock down everyone caught in it.', keywords:['Thunder']},
    {name:'Token of Memory', element:'Air', mastery:1, desc:'Creates a flawless, stationary illusory duplicate of a small object.', keywords:['Craft','Illusion']},
    {name:'To Seek the Truth', element:'Air', mastery:1, desc:'Purges a target\'s mind of temporary mental/social penalties from techniques, wounds, or spells.'},
    {name:'Voice of the Wind', element:'Air', mastery:1, desc:'Grants the Voice Advantage\'s benefit plus a bonus to speech-based Social rolls.'},
    {name:'Way of Deception', element:'Air', mastery:1, desc:'Creates a moving illusory duplicate of yourself nearby that mimics your actions.', keywords:['Illusion']},
    {name:'Yari of Air', element:'Air', mastery:1, desc:'Summons a spectral spear (DR 1k1) usable with Spears Skill or your School Rank.', keywords:['Craft','Thunder']},
    {name:'Benten\'s Touch', element:'Air', mastery:2, desc:'Target gains a bonus (+1k1 plus your Air) to Social Skill rolls.'},
    {name:'Call Upon the Wind', element:'Air', mastery:2, desc:'Grants limited slow flight (up to 10\'/round) via Free Move Actions.', keywords:['Travel']},
    {name:'Elemental Cipher', element:'Air', mastery:2, desc:'Makes written text unreadable to anyone but the intended recipient (Imperial-family spell).', keywords:['Illusion']},
    {name:'Flight of Doves', element:'Air', mastery:2, desc:'Illustrates a storyteller\'s tale with matching visual/auditory illusions.', keywords:['Illusion']},
    {name:'Freedom of the Air', element:'Air', mastery:2, desc:'Cleanses a building of filth and temporarily drives out hostile disembodied spirits.', keywords:['Wards']},
    {name:'Hidden Visage', element:'Air', mastery:2, desc:'Subtly alters your face so you appear to be a different, similar person.', keywords:['Illusion']},
    {name:'The Kami\'s Whisper', element:'Air', mastery:2, desc:'Creates a false sound or short (20-word) voice at a distance.', keywords:['Illusion']},
    {name:'Mists of Illusion', element:'Air', mastery:2, desc:'Crafts a stationary, purely visual illusion of any object, person, or image.', keywords:['Craft','Illusion']},
    {name:'Quiescence of Air', element:'Air', mastery:2, desc:'Creates a sphere of silence that blocks sound from passing in or out.', keywords:['Wards']},
    {name:'Request to Hato-no-Kami', element:'Air', mastery:2, desc:'Summons a bird that can perform a simple task for you.', keywords:['Travel']},
    {name:'Secrets on the Wind', element:'Air', mastery:2, desc:'After a preparation ritual, lets you eavesdrop on a prepared area for up to 48 hours.'},
    {name:'Whispering Wind', element:'Air', mastery:2, desc:'Reveals whether the target\'s last spoken statement was true or a lie.', keywords:['Divination']},
    {name:'Wind-Born Slumbers', element:'Air', mastery:2, desc:'Puts an inactive target to sleep, or Fatigues an active one.'},
    {name:'Wolf\'s Proposal', element:'Air', mastery:2, desc:'Makes you seem more honorable, boosting your effective Honor Rank for Bushido rolls.', keywords:['Illusion']},
    {name:'Air Kami\'s Blessing', element:'Air', mastery:3, desc:'Adds your Air Ring to Awareness-based rolls and to Armor TN for hours.'},
    {name:'Essence of Air', element:'Air', mastery:3, desc:'Turns you insubstantial, letting you pass through solid objects slowly.', keywords:['Defense']},
    {name:'The Eye Shall Not See', element:'Air', mastery:3, desc:'Distracts everyone nearby so they overlook your presence, without true invisibility.', keywords:['Defense']},
    {name:'Garbled Tongue', element:'Air', mastery:3, desc:'Masks a private conversation behind a false one only outsiders can hear.', keywords:['Illusion']},
    {name:'Mask of Wind', element:'Air', mastery:3, desc:'Disguises you as another humanoid of roughly your size.', keywords:['Illusion']},
    {name:'Soul of Kaze-no-Kami', element:'Air', mastery:3, desc:'Numbs the target\'s emotions, resisting Fear/Social pressure but hurting their Awareness-based reads.'},
    {name:'Striking the Storm', element:'Air', mastery:3, desc:'Wraps you in wind, granting +20 Armor TN but deafening you to speech.', keywords:['Defense']},
    {name:'Summoning the Gale', element:'Air', mastery:3, desc:'Boosts allies\' ranged Armor TN in an area, but everyone\'s ranged attacks suffer a penalty too.', keywords:['Defense']},
    {name:'Summon Fog', element:'Air', mastery:3, desc:'Fills an area with thick fog, cutting visibility to five feet.'},
    {name:'Touch of Air\'s Grace', element:'Air', mastery:3, desc:'Enhances a target\'s attractiveness, negating certain appearance Disadvantages for the duration.', keywords:['Illusion']},
    {name:'Your Heart\'s Enemy', element:'Air', mastery:3, desc:'Manifests an illusion of the target\'s worst fear, forcing a Fear 4 check.', keywords:['Illusion']},
    {name:'Call the Spirit', element:'Air', mastery:4, desc:'Summons a specific known spirit from any realm to converse (can be dangerous).'},
    {name:'Castle of Air', element:'Air', mastery:4, desc:'Surrounds you with sound/image illusions that make attackers likely to miss.', keywords:['Defense','Illusion']},
    {name:'False Realm', element:'Air', mastery:4, desc:'Completely disguises the appearance of terrain in a wide area.', keywords:['Battle','Illusion']},
    {name:'Funeral Rites', element:'Air', mastery:4, desc:'Hour-long ritual letting a relative briefly commune with a recently deceased ancestor.'},
    {name:'Gift of Wind', element:'Air', mastery:4, desc:'Renders you fully invisible until you attack someone.', keywords:['Illusion']},
    {name:'Howl of Isora', element:'Air', mastery:4, desc:'A storm blast deals 3k2 to everyone in the area and can Fatigue them.', keywords:['Thunder']},
    {name:'Know the Mind', element:'Air', mastery:4, desc:'Lets you hear a target\'s active surface thoughts for the duration.'},
    {name:'Look into the Soul', element:'Air', mastery:4, desc:'Reveals a target\'s two lowest Rings and their Trait values.', keywords:['Divination']},
    {name:'Netsuke of Wind', element:'Air', mastery:4, desc:'Creates a functional illusory hand-held object, including a usable weapon.', keywords:['Craft','Illusion']},
    {name:'Seeking the Way', element:'Air', mastery:4, desc:'Hides your trail and replaces it with a false one leading elsewhere.', keywords:['Illusion']},
    {name:'Symbol of Air', element:'Air', mastery:4, desc:'A permanent warded passageway that can put trespassers into a deep sleep.', keywords:['Wards']},
    {name:'Tenjin\'s Ear', element:'Air', mastery:4, desc:'Unicorn-only: understand any spoken human language nearby for the duration.', keywords:['Travel']},
    {name:'Whispers of the Forgotten', element:'Air', mastery:4, desc:'Haunts a target with memories of past sins, hurting their Skill/Spellcasting rolls.'},
    {name:'Wisdom of the Kami', element:'Air', mastery:4, desc:'Temporarily grants +1 Rank in all Skills you already possess.'},
    {name:'Cloud the Mind', element:'Air', mastery:5, desc:'Erases roughly a week of a target\'s memories and can implant false ones (widely seen as blasphemous).'},
    {name:'Defender From Beyond', element:'Air', mastery:5, desc:'Kitsu-only: summons an ancestral shiryo spirit to aid you for minutes.', keywords:['Battle']},
    {name:'Draw Back the Shadow', element:'Air', mastery:5, desc:'Dispels illusions and other ongoing magical effects in an area.'},
    {name:'Echoes on the Breeze', element:'Air', mastery:5, desc:'Opens a whispered two-way voice link with someone you know, anywhere in the Empire.'},
    {name:'Facing Your Devils', element:'Air', mastery:5, desc:'Swaps the target\'s highest and lowest Traits, possibly shifting their Rings too.'},
    {name:'Legion of the Moon', element:'Air', mastery:5, desc:'Renders a group of chosen people invisible for minutes.', keywords:['Illusion']},
    {name:'Slayer\'s Knives', element:'Air', mastery:5, desc:'A cutting wind corridor deals your Air Ring+2k0 damage and can knock foes down.', keywords:['Thunder']},
    {name:'Rise, Air', element:'Air', mastery:6, desc:'Summons a powerful Air elemental spirit to fight alongside you.'},
    {name:'The False Legion', element:'Air', mastery:6, desc:'Creates up to Air Ring x10 illusory figures that can act as you direct.', keywords:['Battle','Illusion']},
    {name:'Piercing the Heavens', element:'Air', mastery:6, desc:'Phoenix-only temple ritual to briefly commune with a named Fortune.'},
    {name:'Wind of the Moon', element:'Air', mastery:6, desc:'Lets you plant your own thoughts into a known target\'s mind unnoticed.'},
    {name:'Wrath of Kaze-no-Kami (Hurricane)', element:'Air', mastery:6, desc:'Summons a devastating hurricane around you that batters everyone outside a small safe eye.', keywords:['Thunder']},
    {name:'Armor of Earth', element:'Earth', mastery:1, desc:'Grants Reduction equal to Earth Ring + School Rank, but slows your movement.', keywords:['Battle','Defense']},
    {name:'Courage of the Seven Thunders', element:'Earth', mastery:1, desc:'Bolsters targets against Fear effects for minutes.', keywords:['Battle']},
    {name:'Earth\'s Stagnation', element:'Earth', mastery:1, desc:'Weighs a target down, penalizing Agility rolls and slowing their movement.'},
    {name:'Earth\'s Touch', element:'Earth', mastery:1, desc:'Raises one of a target\'s Earth-linked Traits by 1 for an hour.', keywords:['Defense']},
    {name:'Elemental Ward', element:'Earth', mastery:1, desc:'Makes a target resistant to a chosen element\'s spells for an hour.', keywords:['Wards']},
    {name:'Jade Strike', element:'Earth', mastery:1, desc:'An unerring jade blast burns Tainted flesh but harms the untainted not at all.', keywords:['Jade','Thunder']},
    {name:'Jurojin\'s Balm', element:'Earth', mastery:1, desc:'Helps a target resist poison/toxin effects and cures drunkenness for an hour.'},
    {name:'Minor Binding', element:'Earth', mastery:1, desc:'Binds and immobilizes a weak Shadowlands creature for interrogation.', keywords:['Craft']},
    {name:'Soul of Stone', element:'Earth', mastery:1, desc:'Grants strong resistance to manipulation/temptation, at the cost of reading others\' emotions.', keywords:['Defense']},
    {name:'Tetsubo of Earth', element:'Earth', mastery:1, desc:'Summons a spectral tetsubo (DR 2k2) usable with Heavy Weapons Skill or School Rank.', keywords:['Craft','Jade']},
    {name:'Be the Mountain', element:'Earth', mastery:2, desc:'Grants an ally heavy Reduction but they can\'t take Simple Move Actions.', keywords:['Defense']},
    {name:'Earth Becomes Sky', element:'Earth', mastery:2, desc:'Hurls boulders dealing damage equal to your Earth Rank, splitting among multiple targets.', keywords:['Jade','Thunder']},
    {name:'Embrace of Kenro-Ji-Jin', element:'Earth', mastery:2, desc:'Lets a target move through solid earth as if it were water, for an hour.', keywords:['Travel']},
    {name:'Force of Will', element:'Earth', mastery:2, desc:'Makes a target immune to Wound Rank penalties, even near death, briefly.', keywords:['Battle']},
    {name:'Grasp of Earth', element:'Earth', mastery:2, desc:'A stony grip nearly immobilizes a target unless they break free with Strength.'},
    {name:'Hands of Clay', element:'Earth', mastery:2, desc:'Lets you climb sheer surfaces at half speed for minutes.', keywords:['Travel']},
    {name:'The Mountain\'s Feet', element:'Earth', mastery:2, desc:'Roots a target\'s feet, granting strong resistance to Knockdown and forced movement.', keywords:['Defense']},
    {name:'Wholeness of the World', element:'Earth', mastery:2, desc:'Makes a target\'s Rings and Traits fully resistant to change for minutes.', keywords:['Defense']},
    {name:'Bonds of Ningen-Do', element:'Earth', mastery:3, desc:'Ritual to bind or banish a troublesome spirit-realm creature for a month.', keywords:['Wards']},
    {name:'Earth Kami\'s Blessing', element:'Earth', mastery:3, desc:'Grants bonus Wounds and Earth-related roll bonuses for minutes.', keywords:['Battle']},
    {name:'Earth\'s Protection', element:'Earth', mastery:3, desc:'Weakens hostile Air/Fire/Water spells cast near you and reduces their damage.', keywords:['Defense','Wards']},
    {name:'Purge the Taint', element:'Earth', mastery:3, desc:'Cleanses Shadowlands Taint from land/plants/objects in a wide area, at a magical cost.', keywords:['Jade']},
    {name:'Sharing the Strength of Many', element:'Earth', mastery:3, desc:'Lets up to six people share the group\'s lowest Earth Ring on rolls.'},
    {name:'Strength of the Crow', element:'Earth', mastery:3, desc:'Grants strong resistance to gaining new Shadowlands Taint for hours.', keywords:['Jade']},
    {name:'The Wolf\'s Mercy', element:'Earth', mastery:3, desc:'Weakens a target\'s Earth and Strength Ranks for several rounds.'},
    {name:'Armor of the Emperor', element:'Earth', mastery:4, desc:'Reduces every incoming damage die by your School Rank for several rounds.', keywords:['Defense']},
    {name:'Essence of Earth', element:'Earth', mastery:4, desc:'Temporarily raises a target\'s Earth Ring (and Wounds) — but they drop back when it ends.', keywords:['Battle']},
    {name:'Symbol of Earth', element:'Earth', mastery:4, desc:'A permanent warded passageway that shocks and stuns trespassers.', keywords:['Wards']},
    {name:'Tomb of Jade', element:'Earth', mastery:4, desc:'Slowly petrifies a Tainted target into jade round by round unless they resist.', keywords:['Jade']},
    {name:'Wall of Earth', element:'Earth', mastery:4, desc:'Raises a large, tough shapeable wall of earth for minutes.', keywords:['Defense']},
    {name:'Earthquake', element:'Earth', mastery:5, desc:'Devastates a wide area with a violent quake; a serious act if cast near a city.'},
    {name:'Major Binding', element:'Earth', mastery:5, desc:'Ritual to imprison a powerful Shadowlands creature for interrogation.', keywords:['Jade','Wards']},
    {name:'Strike at the Roots', element:'Earth', mastery:5, desc:'Drains a resisting target\'s Earth Ring down to 1 for several rounds.'},
    {name:'The Kami\'s Strength', element:'Earth', mastery:5, desc:'Grants Reduction 20 and boosts Strength/another Trait, but stops Simple Move Actions.', keywords:['Battle']},
    {name:'The Kami\'s Will', element:'Earth', mastery:5, desc:'Boosts Willpower and resistance to spells, at a cost to Social rolls.', keywords:['Defense']},
    {name:'Essence of Jade', element:'Earth', mastery:6, desc:'Makes a target immune to Taint and maho for the duration.', keywords:['Defense','Jade']},
    {name:'Power of the Earth Dragon', element:'Earth', mastery:6, desc:'Earth spirits absorb damage on the target\'s behalf, up to a large limit.', keywords:['Defense']},
    {name:'Prison of Earth', element:'Earth', mastery:6, desc:'Permanently imprisons a Tainted creature\'s essence inside a gem or similar item.', keywords:['Wards']},
    {name:'Rise, Earth', element:'Earth', mastery:6, desc:'Summons a powerful Earth elemental spirit to fight alongside you.'},
    {name:'Biting Steel', element:'Fire', mastery:1, desc:'Increases a metal bladed weapon\'s damage (+1k1) for a minute.', keywords:['Craft']},
    {name:'Burning Kiss of Steel', element:'Fire', mastery:1, desc:'Wreathes your melee weapon in flame, boosting attack rolls.', keywords:['Battle']},
    {name:'Envious Flames', element:'Fire', mastery:1, desc:'An unerring bolt of flame deals 2k2 damage.'},
    {name:'Extinguish', element:'Fire', mastery:1, desc:'Snuffs out non-magical fire in a wide area and weakens fire damage briefly.'},
    {name:'Fires of Purity', element:'Fire', mastery:1, desc:'Wraps a target in flame that burns anyone who touches or strikes them in melee.', keywords:['Defense']},
    {name:'The Fires That Cleanse', element:'Fire', mastery:1, desc:'Damages everyone (including you, at half) in a burst around the caster.'},
    {name:'Fury of Osano-Wo', element:'Fire', mastery:1, desc:'Calls down a lightning bolt for 5k2 damage, outdoors only.', keywords:['Thunder']},
    {name:'Katana of Fire', element:'Fire', mastery:1, desc:'Summons a spectral katana (DR 2k2) usable with Kenjutsu or School Rank.', keywords:['Battle','Craft']},
    {name:'Never Alone', element:'Fire', mastery:1, desc:'Grants a roll bonus equal to your Fire Ring until the target fails a roll or is hurt.'},
    {name:'The Raging Forge', element:'Fire', mastery:1, desc:'Restores a mundane weapon or armor\'s finish, removing blemishes (not breaks).', keywords:['Craft']},
    {name:'Disrupt the Aura', element:'Fire', mastery:2, desc:'Blocks a target from being magically healed for up to a day.'},
    {name:'Enticing the Dance of Flame', element:'Fire', mastery:2, desc:'Ignites an area, dealing repeated fire damage each round it\'s active.'},
    {name:'The Fires From Within', element:'Fire', mastery:2, desc:'A classic fire bolt attack dealing damage equal to your Fire Ring.'},
    {name:'Hurried Steps', element:'Fire', mastery:2, desc:'Speeds up the casting of your next Fire spell dramatically.'},
    {name:'Mental Quickness', element:'Fire', mastery:2, desc:'Imbues an item that raises its carrier\'s Intelligence by 3 for minutes.'},
    {name:'Relentless Heat', element:'Fire', mastery:2, desc:'Enchants armor so attackers, hit or miss, become Fatigued briefly.', keywords:['Defense']},
    {name:'Tail of the Fire Dragon', element:'Fire', mastery:2, desc:'Grants a reach-30\' fire whip attack for several rounds.'},
    {name:'Ward of Purity', element:'Fire', mastery:2, desc:'Wards an area against Tainted creatures and the Lying Darkness for a day.', keywords:['Wards']},
    {name:'Breath of the Fire Dragon', element:'Fire', mastery:3, desc:'Lets you breathe a fire bolt (DR = Fire Ring) as a Simple Action each round.'},
    {name:'Fiery Wrath', element:'Fire', mastery:3, desc:'Sets one structure or area ablaze, consuming flammable material to ash.'},
    {name:'The Fist of Osano-Wo', element:'Fire', mastery:3, desc:'Lightning strikes ravage a wide area for Fire-Ring damage.', keywords:['Thunder']},
    {name:'Haze of Battle', element:'Fire', mastery:3, desc:'Forces a target into reckless Full Attack Stance (or Brash/Contrary out of combat).', keywords:['Battle']},
    {name:'Hungry Blade', element:'Fire', mastery:3, desc:'Wreathes a weapon in fire, adding attack bonus and exploding damage dice.', keywords:['Craft']},
    {name:'Ravenous Swarms', element:'Fire', mastery:3, desc:'Deals fire damage and punishes the target further if they cast a Fire spell soon after.'},
    {name:'Shining Light', element:'Fire', mastery:3, desc:'Enchants armor to burn and blind melee attackers.', keywords:['Defense']},
    {name:'Death of Flame', element:'Fire', mastery:4, desc:'Suppresses a target\'s elemental fire, lowering their Agility and Intelligence.'},
    {name:'Defense of the Firestorm', element:'Fire', mastery:4, desc:'Burns incoming wooden weapons/arrows to nothing and raises the wearer\'s Armor TN.', keywords:['Defense']},
    {name:'The Mending Forge', element:'Fire', mastery:4, desc:'Fully repairs a broken item, provided all its pieces are present.', keywords:['Craft']},
    {name:'Symbol of Fire', element:'Fire', mastery:4, desc:'A permanent warded passageway that dazes, blinds, and burns trespassers.', keywords:['Wards']},
    {name:'Wall of Fire', element:'Fire', mastery:4, desc:'Raises a shapeable wall of flame that burns anyone touching it.'},
    {name:'Ward of Thunder', element:'Fire', mastery:4, desc:'Wards armor against fire/thunder and hampers hostile Fire spells nearby.', keywords:['Wards']},
    {name:'Destructive Wave', element:'Fire', mastery:5, desc:'A wave of fire damages everyone nearby except the caster.'},
    {name:'Everburning Rage', element:'Fire', mastery:5, desc:'Inflicts crippling pain on a target as if badly wounded, without actual damage.'},
    {name:'Follow the Flame', element:'Fire', mastery:5, desc:'A directed stream of fire burns a distant target and keeps burning them each round.'},
    {name:'Light of the Sun', element:'Fire', mastery:5, desc:'A beam of holy light punishes an area, hurting the dishonorable and Tainted worst.', keywords:['Jade']},
    {name:'Wings of the Phoenix', element:'Fire', mastery:5, desc:'Grants flight for several rounds.', keywords:['Travel']},
    {name:'Beam of the Inferno', element:'Fire', mastery:6, desc:'A devastating fire blast deals 10k10 damage to one target.'},
    {name:'Globe of the Everlasting Sun', element:'Fire', mastery:6, desc:'Wards a wide area against magical fire and hinders Fire spells within it for a day.', keywords:['Defense']},
    {name:'The Soul\'s Blade', element:'Fire', mastery:6, desc:'Imbues a weapon so it bypasses Invulnerability and Stuns every target it hits.', keywords:['Craft']},
    {name:'Bo of Water', element:'Water', mastery:1, desc:'Summons a spectral bo staff (DR 1k2) usable with Staves Skill or School Rank.', keywords:['Craft']},
    {name:'Clarity of Purpose', element:'Water', mastery:1, desc:'Grants nearby allies a bonus to Initiative for a couple of rounds.', keywords:['Battle']},
    {name:'Ebbing Strength', element:'Water', mastery:1, desc:'Transfers a Physical Trait point from you to a target temporarily.', keywords:['Defense']},
    {name:'Path to Inner Peace', element:'Water', mastery:1, desc:'Heals a target\'s Wounds based on how well the casting roll succeeded.'},
    {name:'Reflections of Pan Ku', element:'Water', mastery:1, desc:'Instantly identifies a touched object\'s magical powers and rough origin.', keywords:['Divination']},
    {name:'Reversal of Fortunes', element:'Water', mastery:1, desc:'Lets the target re-roll one roll per round, keeping either result.'},
    {name:'The Rushing Wave', element:'Water', mastery:1, desc:'Grants an extra burst of movement on the target\'s next turn.', keywords:['Travel']},
    {name:'Speed of the Waterfall', element:'Water', mastery:1, desc:'Increases the target\'s maximum movement per round for an hour.', keywords:['Travel']},
    {name:'Spirit of the Water', element:'Water', mastery:1, desc:'Grants an extra Simple (non-attack) Action during the Reactions Stage.', keywords:['Battle']},
    {name:'Sympathetic Energies', element:'Water', mastery:1, desc:'Transfers an existing spell effect from you to a willing target.'},
    {name:'Cloak of the Miya', element:'Water', mastery:2, desc:'Raises your Armor TN by your Water Ring plus School Rank for several rounds.', keywords:['Defense']},
    {name:'Inari\'s Blessing', element:'Water', mastery:2, desc:'Conjures food and drink to sustain several people for a day.', keywords:['Craft']},
    {name:'Reflective Pool', element:'Water', mastery:2, desc:'Lets you view (not hear) a familiar distant location through any body of water.', keywords:['Divination']},
    {name:'Rejuvenating Vapors', element:'Water', mastery:2, desc:'Instantly refreshes a target as if fully rested, restoring Void spell slots.'},
    {name:'Stand Against the Waves', element:'Water', mastery:2, desc:'Grants an extra attack-only action during the current Reactions Stage.', keywords:['Battle']},
    {name:'The Ties That Bind', element:'Water', mastery:2, desc:'Reveals the rough direction and distance to a familiar object.', keywords:['Divination']},
    {name:'Wave-Borne Speed', element:'Water', mastery:2, desc:'Increases your effective Water Ring for movement over the next two rounds.', keywords:['Travel']},
    {name:'Wisdom & Clarity', element:'Water', mastery:2, desc:'Doubles your reading speed and grants perfect recall of what\'s read, for an hour.'},
    {name:'Near to Ice', element:'Water', mastery:3, desc:'Negates a target\'s current Wound Rank penalties for several rounds.'},
    {name:'Regrow the Wound', element:'Water', mastery:3, desc:'Heals a touched target\'s Wounds each round while you concentrate.'},
    {name:'Silent Waters', element:'Water', mastery:3, desc:'Stores a second low-level spell inside you to trigger later on a chosen cue.', keywords:['Defense']},
    {name:'Strike of the Tsunami', element:'Water', mastery:3, desc:'A cone of water deals 3k3 damage and can knock enemies down.', keywords:['Battle']},
    {name:'Visions of the Future', element:'Water', mastery:3, desc:'Grants a symbolic but accurate vision of the future via a still pool.', keywords:['Divination']},
    {name:'Walking Upon the Waves', element:'Water', mastery:3, desc:'Lets a target walk on water as if it were solid ground.', keywords:['Travel']},
    {name:'Water Kami\'s Blessing', element:'Water', mastery:3, desc:'Adds bonus dice to a target\'s Perception-based rolls for several rounds.'},
    {name:'Dominion of Suitengu', element:'Water', mastery:4, desc:'Mantis spell: view (not hear) a distant body of water anywhere in the Empire.', keywords:['Divination']},
    {name:'Ebb & Flow of Battle', element:'Water', mastery:4, desc:'Grants allies nearby a free burst of extra movement for several rounds.', keywords:['Battle']},
    {name:'Heart of the Water Dragon', element:'Water', mastery:4, desc:'Targets regain Wounds automatically whenever they\'re hurt, for a short time.'},
    {name:'The Path Not Taken', element:'Water', mastery:4, desc:'Shifts unused daily spell slots from one Ring to another for a day.'},
    {name:'Strike of the Flowing Waters', element:'Water', mastery:4, desc:'Lets the target ignore certain Armor TN bonuses from armor, low spells, and effects.'},
    {name:'Symbol of Water', element:'Water', mastery:4, desc:'A permanent warded passageway that strikes trespassers with severe Fear.', keywords:['Wards']},
    {name:'Ever-Changing Waves', element:'Water', mastery:5, desc:'Shapeshifts you into a natural animal form for an hour.', keywords:['Illusion']},
    {name:'The Final Bond', element:'Water', mastery:5, desc:'Reveals the rough location of a deeply familiar person or object.', keywords:['Divination']},
    {name:'Hands of the Tides', element:'Water', mastery:5, desc:'Swaps the positions of several willing targets within range.', keywords:['Battle','Travel']},
    {name:'Power of the Ocean', element:'Water', mastery:5, desc:'A ritual removing a willing target\'s need for food, drink, and sleep for days, with heavy Wound/Void recovery.', keywords:['Defense']},
    {name:'Suitengu\'s Embrace', element:'Water', mastery:5, desc:'Fills a target\'s lungs with water, incapacitating and potentially drowning them.', keywords:['Thunder']},
    {name:'Peace of the Kami', element:'Water', mastery:6, desc:'Instantly cures disease and poison and fully heals all Wounds.'},
    {name:'Rise, Water', element:'Water', mastery:6, desc:'Summons a powerful Water elemental spirit to fight alongside you.'},
    {name:'Water\'s Sweet Clarity', element:'Water', mastery:6, desc:'A still pool reveals three linked visions answering one asked question, visible to witnesses too.', keywords:['Divination']},
    {name:'Boundless Sight', element:'Void', mastery:1, desc:'Lets you see/hear a familiar distant location remotely, while your body is left vulnerable.'},
    {name:'Drawing the Void', element:'Void', mastery:1, desc:'Grants bonus temporary Void Points equal to School Rank + 1.'},
    {name:'Flow Through the Void', element:'Void', mastery:1, desc:'Transforms a small amount of one pure element into another.'},
    {name:'See Through Lies', element:'Void', mastery:1, desc:'Reveals a target\'s highest-point Advantage or Disadvantage.'},
    {name:'Sense Void', element:'Void', mastery:1, desc:'Senses the presence and rough location of living creatures nearby while concentrating.'},
    {name:'Touch the Emptiness', element:'Void', mastery:1, desc:'Deals 1k1 damage and Dazes a target.'},
    {name:'The Void\'s Caress', element:'Void', mastery:1, desc:'Temporarily negates one Mental/Spiritual Disadvantage on a target (not Taint).'},
    {name:'Witness the Untold', element:'Void', mastery:1, desc:'Lets you interrupt a delayed target\'s action after it\'s declared but before it happens.', keywords:['Divination']},
    {name:'Altering the Course', element:'Void', mastery:2, desc:'Lets you spend multiple Void Points on eligible rolls for a minute.'},
    {name:'Drink of Your Essence', element:'Void', mastery:2, desc:'Reveals a target\'s Rings, current Wound penalties, and general mood.'},
    {name:'The Empty Voice', element:'Void', mastery:2, desc:'Lets you cast lower-level spells of other elements silently for minutes.'},
    {name:'False Whispers', element:'Void', mastery:2, desc:'Forces a target to unknowingly repeat your next sentence verbatim.'},
    {name:'Reach Through the Void', element:'Void', mastery:2, desc:'Telekinetically moves a small object (up to a few pounds) at range.'},
    {name:'Severed from the Stream', element:'Void', mastery:2, desc:'Forces a target to beat you in a Void roll before they can spend Void Points.'},
    {name:'Echoes in the Void', element:'Void', mastery:3, desc:'Lets you hear a concentrated-on target\'s active thoughts.'},
    {name:'Kharmic Intent', element:'Void', mastery:3, desc:'Pools your and a willing target\'s Void Points so either can spend from it.'},
    {name:'Moment of Clarity', element:'Void', mastery:3, desc:'Grants temporary ranks equal to your Void Ring in one chosen Skill.'},
    {name:'Read the Essence', element:'Void', mastery:3, desc:'Reveals a vision of an object\'s last holder or a major event involving it.', keywords:['Divination']},
    {name:'Void Release', element:'Void', mastery:3, desc:'Steals Void Points from a target via a Contested Void roll.'},
    {name:'Balance of Elements', element:'Void', mastery:4, desc:'Negates a target\'s Disadvantages and recent low-level spell penalties, healing 3k3 Wounds.'},
    {name:'Dart of Void', element:'Void', mastery:4, desc:'An unerring Void bolt deals damage that ignores Invulnerability and Reduction.'},
    {name:'Draw Closed the Veil', element:'Void', mastery:4, desc:'Banishes a spirit back to its home realm for months.'},
    {name:'Fill the Emptiness', element:'Void', mastery:4, desc:'Instantly restores a target\'s Void Points to full.'},
    {name:'Void Strike', element:'Void', mastery:4, desc:'A direct Void attack deals damage equal to your Void Ring.'},
    {name:'Divide the Soul', element:'Void', mastery:5, desc:'Splits your consciousness so you act in two places at once for a minute.'},
    {name:'Reforge', element:'Void', mastery:5, desc:'Permanently transforms one uniform object into another of similar size.'},
    {name:'Unbound Essence', element:'Void', mastery:5, desc:'Randomly scrambles a target\'s Rings and Traits for an hour.'},
    {name:'Ring of the Void', element:'Void', mastery:6, desc:'A rare hour-long ritual to commune directly with the Void Dragon.'},
    {name:'Rise from the Ashes', element:'Void', mastery:6, desc:'Reverts a living target\'s state to how they were eight hours earlier, undoing injury or Taint.'},
    {name:'Unmake the World', element:'Void', mastery:6, desc:'Can utterly erase a resisting creature or object from existence.'},
    // Maho spells (magicalsamurai/lasthaiku "Maho" list). Each entry uses the same
    // element/mastery/desc/keywords fields as every other spell above — Maho isn't a distinct
    // spell system on this sheet, just spells whose Ring/Mastery happen to come from the Maho
    // list rather than a Shugenja Element school. `element`/`mastery` still drive casting,
    // eligibility, and Spell Slot use exactly like any other spell of that Ring — the extra
    // `maho:true` flag is purely a display-grouping marker for the Spell Scrolls picker (see
    // renderSpellScrollsList()), which groups Maho spells under their own "Maho" heading
    // instead of blending into their Ring's group, while everything else (scroll naming,
    // hasSpellScroll gating, the Techniques quick-add dropdown, which still groups these by
    // their real Element, unchanged) works unmodified off the same SPELL_LIBRARY entries.
    // 'Maho' keyword: only the 3 spells the source page itself parenthesizes as "(Maho)" carry
    // it (Dark Wings, Eternal Unrest, Dancing with demons) — matching the same "keywords come
    // only from the page's parenthetical, nothing inferred" rule used for Air/Earth/Fire/Water.
    // This also happens to be the first data that gives Chuda Shugenja's existing
    // keywordAffinity:'Maho' (see SCHOOL_LIBRARY) anything to actually match against — but only
    // against these 3, not the whole Maho list; see the chat response for why that's flagged
    // rather than assumed.
    {name:'Bleeding', element:'Fire', mastery:1, desc:'Causes an already-wounded target to bleed 1 Wound per Round until bandaged or magically healed.', maho:true},
    {name:'Blood Rite', element:'Earth', mastery:1, desc:'Heals 1k1 Wounds and raises one physical Trait a Rank, but inflicts 1k1 Taint on the target.', maho:true},
    {name:'Blood and Darkness', element:'Air', mastery:1, desc:'Blinds everyone but the caster within a stationary area until they leave it.', maho:true},
    {name:'Disrupt the Limb', element:'Water', mastery:1, desc:'Inflicts a +15 TN penalty on actions using one limb; Lame if it\'s a leg.', maho:true},
    {name:'Heart of the Damned', element:'Earth', mastery:1, desc:'Consumes a fresh corpse to heal 2k2 Wounds and restore one reduced Ring or Trait.', maho:true},
    {name:'Inspire Fear', element:'Air', mastery:1, desc:'Inflicts a 3-Point Phobia of the caster\'s choosing on the target for the duration.', maho:true},
    {name:'Legacy of the Dark One', element:'Air', mastery:1, desc:'Strips a Void point from the target and blocks them from regaining it for the duration.', maho:true},
    {name:'Purge the Weak', element:'Earth', mastery:1, desc:'Spoils food and water for several people; eating or drinking it causes lasting illness and a -3k0 penalty.', maho:true},
    {name:'Sinful Dreams', element:'Air', mastery:1, desc:'Plagues a sleeping target with sinful dreams, granting the caster a Free Raise on Temptation/Intimidation against them for a day.', maho:true},
    {name:'Suck the Marrow', element:'Earth', mastery:1, desc:'Blocks natural and Medicine-based healing and weakens resistance to poison or disease for a day.', maho:true},
    {name:'Summon Undead Champion', element:'Earth', mastery:1, desc:'Animates a corpse into an obedient zombie that serves the caster for the duration.', maho:true},
    {name:'Symbol of Blood', element:'Water', mastery:1, desc:'Inscribes a lasting ward that penalizes physical Actions for anyone but the caster inside it.', keywords:['Wards'], maho:true},
    {name:'Ward of Divine Peace', element:'Air', mastery:1, desc:'Creates a false calm that penalizes Awareness and Willpower rolls for anyone in the area.', keywords:['Wards'], maho:true},
    {name:'Written in Blood', element:'Fire', mastery:1, desc:'Writes a hidden blood message that stays undetectable until a chosen condition later reveals it.', maho:true},
    {name:'Caress of Fu Leng', element:'Earth', mastery:2, desc:'Instantly corrupts and destroys one jade item or weapon within range.', maho:true},
    {name:'Curse of the Clan', element:'Air', mastery:2, desc:'Makes a samurai exaggerate his clan\'s worst stereotypical behavior for a month.', maho:true},
    {name:'Curse of the Kansen', element:'Air', mastery:2, desc:'Plagues the target with corrupting whispers, penalizing Courtier/Etiquette/Sincerity and resistance to Temptation.', maho:true},
    {name:'Curse of the Unblinking Eye', element:'Air', mastery:2, desc:'Prevents the target from sleeping, blocking recovery of Void points and spell slots.', maho:true},
    {name:'Curse of Weakness', element:'Water', mastery:2, desc:'Inflicts a +10 TN penalty on physical and mental rolls and a -10 penalty to Armor TN.', maho:true},
    {name:'Dark Wings', element:'Water', mastery:2, desc:'Grants the caster flight and Swift 3 for the duration.', keywords:['Maho'], maho:true},
    {name:'Drain the Soul', element:'Earth', mastery:2, desc:'Reduces the target\'s Stamina Rank by 1 for the duration, potentially lowering their Wounds.', maho:true},
    {name:'Eternal Unrest', element:'Earth', mastery:2, desc:'Prepares corpses in advance so they can later be summoned instantly by spending an Earth spell slot.', keywords:['Maho'], maho:true},
    {name:'Gift of the Maker', element:'Fire', mastery:2, desc:'Grants a target a Greater Shadowlands Power for an hour.', maho:true},
    {name:'Pain', element:'Earth', mastery:2, desc:'Drops the target Prone and helpless in agony, unable to act on their next Turn.', maho:true},
    {name:'Puppet Master', element:'Fire', mastery:2, desc:'Seizes control of an undead creature for several hours.', maho:true},
    {name:'Spreading the Darkness', element:'Earth', mastery:2, desc:'Permanently transfers Shadowlands Taint from one target to another, though never below 1 point.', maho:true},
    {name:'Armor of Obsidian', element:'Fire', mastery:3, desc:'Negates one spell carrying the Jade keyword that would otherwise affect the target.', maho:true},
    {name:'Dancing with demons', element:'Air', mastery:3, desc:'A danced ritual that grants an Advantage or inflicts a Disadvantage on a target for a day.', keywords:['Maho'], maho:true},
    {name:'Death beyond Life', element:'Earth', mastery:3, desc:'If the target dies within the duration, kansen resurrect them at the Down Wound Rank with a full Taint Rank.', maho:true},
    {name:'Essence of Undeath', element:'Earth', mastery:3, desc:'Permanently animates a corpse into a powerful, obedient Tainted revenant.', maho:true},
    {name:'Hate\'s Heart', element:'Air', mastery:3, desc:'Fills the target with murderous rage against whoever they\'re looking at when the spell takes effect.', maho:true},
    {name:'Mists of Fear', element:'Air', mastery:3, desc:'Shows the target a Fear 5 illusion of their worst fear and can trigger any Phobia they have.', keywords:['Illusion'], maho:true},
    {name:'Summon Oni', element:'Earth', mastery:3, desc:'Summons a named oni from Jigoku that the caster must contest for control.', maho:true},
    {name:'Symbol of the Bloodspeaker', element:'Air', mastery:3, desc:'Inscribes a ward that burns non-cultists who enter its radius for 4k3 damage.', keywords:['Wards'], maho:true},
    {name:'Burning Blood', element:'Fire', mastery:4, desc:'Boils the target\'s blood for Fire-rated damage and leaves them Fatigued for two Turns.', maho:true},
    {name:'Chains of Jigoku', element:'Earth', mastery:4, desc:'Binds a living target immobile in iron manacles until they break free or the spell ends.', maho:true},
    {name:'No Pure Breaths', element:'Air', mastery:4, desc:'Ravages the target\'s lungs for damage and a lasting +10 TN penalty until magically healed.', maho:true},
    {name:'Stealing the Soul', element:'Earth', mastery:4, desc:'Drains a Rank from a chosen Trait of a target linked by a fetish, for a day.', maho:true},
    {name:'Tomb of Earth', element:'Earth', mastery:4, desc:'Petrifies an untainted target Round by Round unless they win an opposed Insight roll.', maho:true},
    {name:'Truth is a Scourge', element:'Air', mastery:4, desc:'Forces the target to speak only the truth unless they beat a TN 30 Willpower roll.', maho:true},
    {name:'Blood Armor', element:'Earth', mastery:5, desc:'Redirects 75% of the caster\'s Wound damage onto a linked target for several Rounds.', keywords:['Defense'], maho:true},
    {name:'Fierce Blood of the Earth', element:'Earth', mastery:5, desc:'Kills a helpless or willing victim to fully heal the caster, regrow lost limbs, and extend his life a year.', maho:true},
    {name:'Possession', element:'Air', mastery:5, desc:'Lets the caster\'s soul take over a known target\'s body for a day if he wins a Contested Willpower roll.', maho:true},
    {name:'Strength of Darkness', element:'Fire', mastery:5, desc:'Grants +1 Rank to Earth and all physical Traits, with grotesque visible side effects, for several Rounds.', maho:true},
    {name:'Touch of Death', element:'Earth', mastery:5, desc:'Ages the target 10 years and inflicts 7k7 Wounds.', maho:true},
    {name:'Take the Body', element:'Air', mastery:6, desc:'Permanently swaps the caster\'s soul into a target\'s body if he wins a Contested Willpower roll.', maho:true},
  ];

  // ---------- Advantage / Disadvantage quick-add ----------
  const ADV_DISADV_CAT_ORDER = ['Mental','Physical','Social','Spiritual','Material','Varies'];
  function buildAdvDisadvQuickAdd(selectId, library, listId){
    const sel = document.getElementById(selectId);
    const cats = ADV_DISADV_CAT_ORDER.filter(c=>library.some(i=>i.cat===c));
    let html = '<option value="">— choose one to add —</option>';
    cats.forEach(cat=>{
      html += `<optgroup label="${escAttr(cat)}">`;
      library.filter(i=>i.cat===cat).forEach(item=>{
        html += `<option value="${escAttr(item.name)}">${escAttr(item.name)} (${item.cost} pt${item.cost===1?'':'s'})</option>`;
      });
      html += '</optgroup>';
    });
    sel.innerHTML = html;
    sel.addEventListener('change', ()=>{
      if(!sel.value) return;
      const item = library.find(i=>i.name===sel.value);
      if(item){
        document.getElementById(listId).appendChild(makeEntry({name:item.name, cost:item.cost, desc:item.desc}, true));
        recalcAll();
        setStatus(`Added ${item.name}.`);
      }
      sel.value = '';
    });
  }
  buildAdvDisadvQuickAdd('advQuickAdd', ADV_LIBRARY, 'advList');
  buildAdvDisadvQuickAdd('disadvQuickAdd', DISADV_LIBRARY, 'disadvList');

  // ---------- Technique / Kata / Spell quick-add ----------
  // Kata gating: a Kata can only be picked once the character's School is on its allowed
  // list (or it allows "Any" school) AND the matching Ring meets the Kata's Mastery Level.
  function getRingValueByName(ringName){
    const key = String(ringName||'').trim().toLowerCase();
    const el = document.getElementById('ring_'+key);
    return el ? parseInt(el.value||'0',10) : 0;
  }
  function kataEligibility(k){
    const schoolVal = (document.getElementById('f_school').value||'').trim().toLowerCase();
    const schoolsList = k.schools==='Any' ? null : k.schools.split(',').map(s=>s.trim().toLowerCase());
    const schoolOk = !schoolsList || (schoolVal!=='' && schoolsList.includes(schoolVal));
    const ringVal = getRingValueByName(k.ring);
    const ringOk = ringVal >= k.mastery;
    return { eligible: schoolOk && ringOk, schoolOk, ringOk };
  }