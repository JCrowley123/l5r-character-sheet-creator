  // ================= PART B: CORE WEAPONS SYSTEM — static reference data =================
  // Canonical L5R 4e weapon list (magicalsamurai.wikidot.com/equipment). This is STATIC
  // reference data in the same sense as SKILL_LIBRARY/SPELL_LIBRARY: it is never mutated,
  // never written to a save file, and is the single source of truth for a weapon's printed
  // stats. A character's *chosen* weapons live in DOM rows (see makeWeaponRow), never here.
  //
  // Field contract (every entry has the five required fields; the rest are optional):
  //   name      — canonical weapon name, used as the library key (case-insensitive lookup)
  //   skill     — the Weapon Skill used to attack with it; MUST match a SKILL_LIBRARY name
  //               exactly, so findSkill() resolves it and structured mastery applies
  //   damage    — {roll, keep} the weapon's own printed DR, before any Trait or mastery
  //   size      — canonical Size keyword ('Small' | 'Medium' | 'Large'), owned by this field
  //   keywords  — every OTHER canonical keyword ('Samurai','Ninja','Peasant','Gaijin').
  //               Size is deliberately NOT duplicated in here — `size` is its only home.
  //
  // Optional fields, all additive and all defaulting to "behaves like a normal melee weapon":
  //   dmgTrait  — which Trait is added to the DR's ROLLED dice. 'Strength' (default, melee and
  //               thrown), 'Perception' (gunpowder weapons), or null (flat DR: blowgun, cannon,
  //               explosives — nothing is added).
  //   bowStrength — bows only. A bow adds its OWN Strength rating to the arrow's rolled dice,
  //               capped by the wielder's Strength ("a character whose Strength is less than
  //               that of the bow uses his Strength instead"). Character Strength is NOT also
  //               added on top, so bows set dmgTrait:null and are handled by this field.
  //   ammo      — bows only: which ammunition table supplies the actual DR (see ARROW_LIBRARY).
  //   range     — printed maximum range in feet, for ranged weapons.
  //   damageOverride — {skillRank: {roll,keep}} explicit DR replacement at/above a Skill Rank.
  //               Only the blowgun needs this (its Ninjutsu scaling is printed as absolute
  //               values, 1k1 at Rank 3 / 2k1 at Rank 7, not as a generic bonus).
  //   masteryDamageExempt — true when the skill's structured dmgBonus must NOT also be added,
  //               because the weapon's own printed rules already bake that scaling in (blowgun).
  //   notes     — the printed Special Rules text, auto-filled into a row's Notes column.
  //
  // Why skill-matching is enough for mastery: the three skills carrying structured dmgBonus/
  // explodeOn (Kenjutsu, Heavy Weapons, Ninjutsu) each describe their bonus in terms of the
  // weapon category the skill already covers — "sword damage" IS every Kenjutsu weapon,
  // "ninjutsu weapons" IS every Ninjutsu weapon. So "this row's weapon uses skill X" is a
  // sound trigger, which is exactly the linkage Phase 1 said it was waiting for.
  const WEAPON_LIBRARY = [
    // ---- Swords (Kenjutsu) ----
    {name:'Katana', skill:'Kenjutsu', damage:{roll:3,keep:2}, size:'Medium', keywords:['Samurai'], notes:'Spend 1 Void Point to increase a katana damage roll by 1k1 (once only, even with extra-Void abilities).'},
    {name:'Ninja-to', skill:'Kenjutsu', damage:{roll:2,keep:2}, size:'Medium', keywords:['Ninja'], notes:'Counts as a Small weapon for concealment. Blade breaks if it inflicts more than 40 Wounds in one attack.'},
    {name:'No-dachi', skill:'Kenjutsu', damage:{roll:3,keep:3}, size:'Large', keywords:[]},
    {name:'Parangu', skill:'Kenjutsu', damage:{roll:2,keep:2}, size:'Medium', keywords:['Peasant'], notes:'Blade breaks if it inflicts more than 30 Wounds in one attack.'},
    {name:'Scimitar', skill:'Kenjutsu', damage:{roll:2,keep:3}, size:'Medium', keywords:[]},
    {name:'Wakizashi', skill:'Kenjutsu', damage:{roll:2,keep:2}, size:'Medium', keywords:['Samurai'], range:20, notes:'May be thrown up to 20 feet.'},

    // ---- Knives ----
    {name:'Aiguchi', skill:'Knives', damage:{roll:1,keep:1}, size:'Small', keywords:[], range:20, notes:'Knives may be thrown up to 20 feet.'},
    {name:'Tanto', skill:'Knives', damage:{roll:1,keep:1}, size:'Small', keywords:[], range:20, notes:'Knives may be thrown up to 20 feet.'},
    {name:'Jitte', skill:'Knives', damage:{roll:1,keep:1}, size:'Small', keywords:[], range:20, notes:'Ideal for disarming. Knives may be thrown up to 20 feet.'},
    {name:'Sai', skill:'Knives', damage:{roll:1,keep:1}, size:'Small', keywords:[], range:20, notes:'Ideal for disarming. Knives may be thrown up to 20 feet.'},
    {name:'Kama', skill:'Knives', damage:{roll:0,keep:2}, size:'Small', keywords:['Peasant'], range:20, notes:'Knives may be thrown up to 20 feet.'},

    // ---- Heavy Weapons ----
    {name:'Dai Tsuchi', skill:'Heavy Weapons', damage:{roll:5,keep:2}, size:'Large', keywords:[], notes:'Two-handed.'},
    {name:'Masakari', skill:'Heavy Weapons', damage:{roll:2,keep:3}, size:'Medium', keywords:[], notes:'One-handed axe.'},
    {name:'Ono', skill:'Heavy Weapons', damage:{roll:0,keep:4}, size:'Large', keywords:[], notes:'Two-handed.'},
    {name:'Tetsubo', skill:'Heavy Weapons', damage:{roll:3,keep:3}, size:'Large', keywords:[], notes:'Two-handed.'},

    // ---- Polearms ----
    {name:'Bisento', skill:'Polearms', damage:{roll:3,keep:3}, size:'Large', keywords:[]},
    {name:'Nagamaki', skill:'Polearms', damage:{roll:2,keep:3}, size:'Large', keywords:[]},
    {name:'Naginata', skill:'Polearms', damage:{roll:3,keep:2}, size:'Large', keywords:['Samurai']},
    {name:'Sasumata', skill:'Polearms', damage:{roll:0,keep:2}, size:'Large', keywords:[], notes:'May be used to initiate and maintain a grapple.'},
    {name:'Sodegarami', skill:'Polearms', damage:{roll:1,keep:1}, size:'Large', keywords:[], notes:'May be used to initiate and maintain a grapple.'},

    // ---- Spears ----
    {name:'Kumade', skill:'Spears', damage:{roll:1,keep:1}, size:'Large', keywords:['Peasant'], notes:'Breaks if it inflicts more than 25 Wounds in a single attack.'},
    {name:'Mai Chong', skill:'Spears', damage:{roll:0,keep:3}, size:'Large', keywords:[], range:25, notes:'Can be thrown accurately up to 25 feet.'},
    {name:'Lance', skill:'Spears', damage:{roll:3,keep:4}, size:'Large', keywords:[], notes:'Listed DR applies only from horseback directly following a Move Action; otherwise DR 1k2. Melee without a Move Action raises attack TN by +5 mounted, +10 on foot. Shatters if it inflicts more than 30 Wounds in one attack.'},
    {name:'Nage-yari', skill:'Spears', damage:{roll:1,keep:2}, size:'Medium', keywords:[], range:50, notes:'May be thrown accurately up to 50 feet.'},
    {name:'Yari', skill:'Spears', damage:{roll:2,keep:2}, size:'Large', keywords:[], range:30, notes:'Two-handed on foot, one-handed mounted. Thrown to a maximum of 30 feet at DR 1k2.'},

    // ---- Staves ----
    {name:'Bo', skill:'Staves', damage:{roll:1,keep:2}, size:'Large', keywords:[], notes:'Staves: double the target’s Armor TN bonus from armor.'},
    {name:'Jo', skill:'Staves', damage:{roll:0,keep:2}, size:'Medium', keywords:[], notes:'Often used in pairs. Staves: double the target’s Armor TN bonus from armor.'},
    {name:'Machi-kanshisha', skill:'Staves', damage:{roll:0,keep:2}, size:'Medium', keywords:[], notes:'Staves: double the target’s Armor TN bonus from armor.'},
    {name:'Nunchaku', skill:'Staves', damage:{roll:1,keep:2}, size:'Small', keywords:['Peasant'], notes:'Staves: double the target’s Armor TN bonus from armor.'},
    {name:'Sang Kauw (Crescent Blade)', skill:'Staves', damage:{roll:1,keep:2}, size:'Medium', keywords:[], notes:'Staves: double the target’s Armor TN bonus from armor.'},
    {name:'Sang Kauw (Shield)', skill:'Staves', damage:{roll:2,keep:1}, size:'Medium', keywords:[], notes:'Shield variant grants increased protection. Staves: double the target’s Armor TN bonus from armor.'},
    {name:'Tonfa', skill:'Staves', damage:{roll:0,keep:3}, size:'Medium', keywords:['Peasant'], notes:'Staves: double the target’s Armor TN bonus from armor.'},

    // ---- Chain Weapons ----
    // Name spellings follow SKILL_LIBRARY's Chain Weapons emphasis list so the two cross-link
    // cleanly; the source page prints "Kyoketsu-Shogi" and "Manrikikusari" for the same weapons.
    {name:'Kusarigama', skill:'Chain Weapons', damage:{roll:0,keep:2}, size:'Large', keywords:[], notes:'DR 0k2 with the kama end, DR 0k1 with the weighted end.'},
    {name:'Kyoketsu-shoge', skill:'Chain Weapons', damage:{roll:0,keep:1}, size:'Large', keywords:[], notes:'Double the target’s Armor TN bonus from armor.'},
    {name:'Manrikigusari', skill:'Chain Weapons', damage:{roll:1,keep:1}, size:'Large', keywords:[]},

    // ---- War Fans ----
    {name:'War Fan (Tessen)', skill:'War Fan', damage:{roll:0,keep:1}, size:'Small', keywords:[]},

    // ---- Bows (Kyujutsu) ----
    // A bow has no DR of its own: the ARROW supplies the DR, and the bow adds its Strength
    // rating to the arrow's rolled dice. dmgTrait is null because the wielder's own Strength
    // is not added separately — see bowStrength handling in getWeaponDamageDice().
    {name:'Dai-kyu', skill:'Kyujutsu', damage:{roll:0,keep:0}, size:'Large', keywords:[], dmgTrait:null, bowStrength:4, ammo:'Arrow', range:500, notes:'Minimum Strength 3 to wield. +10 to the TN of all attack rolls if used on foot.'},
    {name:'Han-kyu', skill:'Kyujutsu', damage:{roll:0,keep:0}, size:'Small', keywords:[], dmgTrait:null, bowStrength:1, ammo:'Arrow', range:100, notes:'+10 to the TN of all attack rolls if used from horseback.'},
    {name:'Yumi', skill:'Kyujutsu', damage:{roll:0,keep:0}, size:'Large', keywords:[], dmgTrait:null, bowStrength:3, ammo:'Arrow', range:250, notes:'+10 to the TN of all attack rolls if used from horseback.'},

    // ---- Ninjutsu Weapons ----
    // Blowgun: printed DR is a flat "1 Wound", and the Ninjutsu Skill raises it to absolute
    // values (1k1 at Rank 3, 2k1 at Rank 7) rather than adding a generic bonus — hence both
    // damageOverride and masteryDamageExempt, so the +1k0/+0k1 dmgBonus is not double-counted.
    {name:'Blowgun', skill:'Ninjutsu', damage:{roll:0,keep:0}, size:'Medium', keywords:['Ninja'], dmgTrait:null, damageOverride:{3:{roll:1,keep:1},7:{roll:2,keep:1}}, masteryDamageExempt:true, notes:'DR is 1 Wound flat below Ninjutsu 3. Triple the target’s Armor TN bonus from armor. Reloading is a Free Action.'},
    {name:'Shuriken', skill:'Ninjutsu', damage:{roll:1,keep:1}, size:'Small', keywords:['Ninja'], range:25, notes:'May be thrown up to 25 feet.'},
    {name:'Tsubute', skill:'Ninjutsu', damage:{roll:1,keep:1}, size:'Small', keywords:['Ninja'], range:30, notes:'May be thrown up to 30 feet.'},

    // ---- Explosives / Nageteppo (thrown; Ninjutsu) ----
    {name:'Nageteppo (Smoke)', skill:'Ninjutsu', damage:{roll:1,keep:1}, size:'Small', keywords:['Ninja'], dmgTrait:null, masteryDamageExempt:true, range:30, notes:'Thrown as a Simple Action. Creates a 15ft blinding smoke cloud for 5 Rounds. A direct hit inflicts 1k1 per Round for two Rounds.'},
    {name:'Nageteppo (Incendiary)', skill:'Ninjutsu', damage:{roll:3,keep:2}, size:'Small', keywords:['Ninja'], dmgTrait:null, masteryDamageExempt:true, range:25, notes:'Thrown as a Simple Action. Direct hit inflicts 3k2 per Round for three Rounds; 1k1 per Round to anything within 5ft. Ignores 3 points of Reduction.'},

    // ---- Gunpowder Weapons (Firearms) ----
    // "A pistol's DR is modified by Perception instead of by Strength" — hence dmgTrait.
    {name:'Pistol', skill:'Firearms', damage:{roll:3,keep:2}, size:'Small', keywords:['Gaijin'], dmgTrait:'Perception', range:20, notes:'DR is modified by Perception, not Strength. Ignores armor’s Armor TN bonus and all Reduction. Possession is an Imperial crime.'},
    {name:'Musket', skill:'Firearms', damage:{roll:4,keep:3}, size:'Large', keywords:['Gaijin'], dmgTrait:'Perception', range:150, notes:'DR is modified by Perception, not Strength. Ignores armor’s Armor TN bonus and all Reduction. A bladed musket may be used in melee with Polearms at DR 2k2. Possession is an Imperial crime.'},

    // ---- Siege Weapons ----
    {name:'Cannon', skill:'Cannon', damage:{roll:10,keep:10}, size:'Large', keywords:['Gaijin'], dmgTrait:null, range:1200, notes:'Crew 4 (2 at half rate of fire); cannot be operated alone. Roundshot inflicts full damage, then 5k5 to anything in a 30ft line beyond the target. Ignores Armor TN bonuses and all Reduction.'},

    // ---- Unarmed (Jiujutsu) ----
    // Not on the Equipment page (unarmed is a combat rule, not a purchasable item), but a
    // weapon row needs it to exist to roll unarmed attacks and to carry Jiujutsu's own
    // free-text mastery ("+1k0 unarmed damage" at Rank 3) in the linked-skill note.
    {name:'Unarmed', skill:'Jiujutsu', damage:{roll:0,keep:1}, size:'Small', keywords:[], notes:'Unarmed strike. Jiujutsu mastery raises unarmed damage at Ranks 3 and 7 (free-text mastery — not auto-applied).'},
  ];
  // Arrow DR table — a bow fires these; the bow contributes only its Strength rating.
  // PART C FEATURE 6 filled in the ammunition half of this table. Every printed DR below is
  // exactly what Part B shipped, so bow damage is unchanged; what Feature 6 added is the data
  // Part B had no use for:
  //   key     — a DOM-safe identifier, used for icon lookup and for element ids.
  //   cost    — price in bu, from the Equipment tables.
  //   special — the short special-rules line, shown in tooltips and in the ammunition popup.
  //   notes   — unchanged: the longer free-text form an Equipment row's Notes column shows.
  // The special rules themselves (ignoring or doubling armour TN, halved range, the Free Raises
  // against objects) are printed, NOT automated — armour TN and Reduction are manual on this
  // sheet, and automating them is explicitly out of Feature 6's scope.
  const ARROW_LIBRARY = [
    {name:'Willow Leaf', key:'willowLeaf', cost:1, damage:{roll:2,keep:2},
     special:'None', notes:'Standard arrow.'},
    {name:'Armor Piercing', key:'armorPiercing', cost:2, damage:{roll:1,keep:1},
     special:'Ignores armor TN bonus', notes:'Ignores the Armor TN bonus provided by armor.'},
    {name:'Flesh Cutter', key:'fleshCutter', cost:5, damage:{roll:2,keep:3},
     special:'Doubles armor TN bonus, 1/2 range', notes:'Double the Armor TN bonus provided by armor; 1/2 range.'},
    {name:'Humming Bulb', key:'hummingBulb', cost:5, damage:{roll:0,keep:1},
     special:'Loud whistling sound', notes:'Makes a loud whistling sound.'},
    {name:'Rope Cutter', key:'ropeCutter', cost:3, damage:{roll:1,keep:1},
     special:'2 Free Raises vs objects, 1/2 range', notes:'2 Free Raises for Called Shots against inanimate objects; 1/2 range.'},
  ];
  const DEFAULT_ARROW = 'Willow Leaf';
  // Case-insensitive library lookup, deliberately mirroring findSkill() exactly.
  function findWeapon(name){
    if(!name) return null;
    const n = String(name).trim().toLowerCase();
    return WEAPON_LIBRARY.find(w=>w.name.toLowerCase()===n) || null;
  }
  function findArrow(name){
    if(!name) return null;
    const n = String(name).trim().toLowerCase();
    return ARROW_LIBRARY.find(a=>a.name.toLowerCase()===n) || null;
  }
  // Reads the character's current Rank in a Skill straight off the Skills table (DOM-as-model).
  // Returns 0 when the character has no row for that skill at all, which is exactly the
  // "Unskilled" case the attack roller has to handle anyway.
  function getCharacterSkillRank(skillName){
    if(!skillName) return 0;
    const target = String(skillName).trim().toLowerCase();
    let best = 0;
    document.querySelectorAll('#skillsBody tr').forEach(tr=>{
      const nameEl = tr.querySelector('.sk-name');
      const rankEl = tr.querySelector('.sk-rank');
      if(!nameEl || !rankEl) return;
      if(nameEl.value.trim().toLowerCase() !== target) return;
      const rank = parseInt(rankEl.value||'0',10) || 0;
      if(rank > best) best = rank;
    });
    return best;
  }
  // Weapon category order for the quick-add dropdown, grouped by Weapon Skill.
  const WEAPON_SKILL_ORDER = ['Kenjutsu','Knives','Heavy Weapons','Polearms','Spears','Staves','Chain Weapons','War Fan','Kyujutsu','Ninjutsu','Firearms','Cannon','Jiujutsu'];
  // ================= END PART B static reference data =================
