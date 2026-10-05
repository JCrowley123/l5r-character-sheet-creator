  // PART I PHASE 4.7.1 — Supplemental Advanced Schools
  const SUPPLEMENTAL_ADVANCED_SCHOOLS_ENABLED = true;
  const SUPPLEMENTAL_ADVANCED_SCHOOL_DATA = [
    {
      "id": "minor-clan-defender",
      "name": "Minor Clan Defender",
      "clan": "Minor Clans",
      "types": [
        "Bushi"
      ],
      "source": "Emerald Empire p.63",
      "requires": {
        "traits": {
          "Agility": 5,
          "Strength": 4
        },
        "advantages": [
          "Paragon"
        ]
      },
      "special": {
        "minorClan": true,
        "weaponSkills": {
          "count": 1,
          "minimumRank": 5
        }
      },
      "narrative": [],
      "techniques": [
        {
          "rank": 1,
          "name": "Know No Boundaries",
          "desc": "Spend a Void Point to gain two Status Ranks for one hour.",
          "source": "Emerald Empire p.63"
        },
        {
          "rank": 2,
          "name": "The Speed of Certainty",
          "desc": "Once per Round, spend a Void Point to make one melee attack as a Free Action; make no other attacks that Round.",
          "source": "Emerald Empire p.63"
        },
        {
          "rank": 3,
          "name": "The Strength of Humility",
          "desc": "Make melee attacks as Simple Actions with Samurai weapons; if that is already available, choose another melee weapon type instead.",
          "source": "Emerald Empire p.63"
        }
      ]
    },
    {
      "id": "imperial-scion",
      "name": "Imperial Scion",
      "clan": "Imperial",
      "types": [
        "Courtier"
      ],
      "source": "Emerald Empire p.79",
      "requires": {
        "traits": {
          "Awareness": 5,
          "Perception": 4
        },
        "skills": {
          "Courtier": 6,
          "Etiquette": 4
        }
      },
      "special": {
        "imperialFamilies": true,
        "statusMinimum": 4
      },
      "narrative": [],
      "techniques": [
        {
          "rank": 1,
          "name": "The Awe of the Throne",
          "desc": "Spend a Void Point when making a Skill Roll or using Glory or Honor Rank to substitute your Status Rank.",
          "source": "Emerald Empire p.79"
        },
        {
          "rank": 2,
          "name": "The Strength of the Throne",
          "desc": "After a few minutes speaking with a lower-Status opponent, win an opposed Courtier/Etiquette roll to reduce their Status by up to twice your Insight Rank in points.",
          "source": "Emerald Empire p.79"
        },
        {
          "rank": 3,
          "name": "The Terror of the Throne",
          "desc": "While conversing with an equal- or lower-Status opponent, win a Contested Void Roll to give a permanent Social Disadvantage. Once per six months you may instead make the opponent ronin, losing 5 points each of Glory, Honor and Status.",
          "source": "Emerald Empire p.79"
        }
      ]
    },
    {
      "id": "kobune-captain",
      "name": "Kobune Captain",
      "clan": "Mantis",
      "types": [
        "Bushi"
      ],
      "source": "Emerald Empire p.143",
      "requires": {
        "rings": {
          "Water": 3
        },
        "skills": {
          "Commerce": 4,
          "Knives": 3,
          "Sailing": 4
        },
        "advantages": [
          "Leadership"
        ]
      },
      "special": {
        "commandAppointment": true
      },
      "narrative": [
        {
          "id": "mantis-command",
          "label": "My character has been appointed to a position of command within the Mantis Clan."
        }
      ],
      "techniques": [
        {
          "rank": 1,
          "name": "The Joy of Plunder",
          "desc": "Count Status as one higher with the Mantis and heimin merchants. A Void-augmented Merchant Skill gains +2k2; once per month, a Commerce/Intelligence roll at TN 25 earns koku equal to the excess.",
          "source": "Emerald Empire p.143"
        },
        {
          "rank": 2,
          "name": "Strength of the Mantis",
          "desc": "Gain 30 XP that may only buy Servants; Budoka servants become Rank 1 Yoritomo Bushi. Spend 10 points for a Rank 1 Moshi Shugenja navigator with Air 3.",
          "source": "Emerald Empire p.143"
        },
        {
          "rank": 3,
          "name": "Master of the Seas",
          "desc": "Spend a Void Point on a non-Craft Merchant Skill roll to roll 10k10; onboard a waterborne vessel, add +3k0 to Bugei Skill Rolls.",
          "source": "Emerald Empire p.143"
        }
      ]
    },
    {
      "id": "dark-paragons",
      "name": "The Dark Paragons",
      "clan": "Spider",
      "types": [
        "Monk"
      ],
      "source": "Emerald Empire p.207",
      "requires": {
        "skills": {
          "Lore: Theology": 4
        },
        "advantages": [
          "Dark Paragon"
        ],
        "honor": 4
      },
      "special": {
        "anyTraitMinimum": 5,
        "simpleMeleeRequired": true
      },
      "narrative": [
        {
          "id": "dark-paragon-simple-melee",
          "label": "My character can make a melee attack as a Simple Action."
        }
      ],
      "techniques": [
        {
          "rank": 1,
          "name": "Ruthless Determination",
          "desc": "Gain two Kiho for which you meet the prerequisites. If you can make armed melee attacks as Simple Actions, you can also make unarmed attacks as Simple Actions, and vice versa.",
          "source": "Emerald Empire p.207"
        },
        {
          "rank": 2,
          "name": "Rising Shadows",
          "desc": "A number of times per skirmish equal to your Void Ring, reroll a failed Bugei Skill Roll using Lore: Theology in place of the original Skill.",
          "source": "Emerald Empire p.207"
        },
        {
          "rank": 3,
          "name": "Absolute and Unwavering",
          "desc": "Gain two Kiho for which you meet the prerequisites. To activate a Kiho, you may lose 2 Honor points or reduce Taint by 1 point instead of spending Void. Taint reduction keeps deformities but can remove powers; subsequent Taint restores lost powers before granting new ones.",
          "source": "Emerald Empire p.207"
        }
      ]
    },
    {
      "id": "kolat-assassin",
      "name": "Kolat Assassin",
      "clan": "Kolat",
      "types": [
        "Ninja"
      ],
      "source": "Enemies of the Empire p.50",
      "requires": {
        "traits": {
          "Agility": 4,
          "Reflexes": 4
        },
        "skills": {
          "Acting": 5,
          "Knives": 5,
          "Stealth": 5
        }
      },
      "special": {
        "kolatLotusRecruit": true,
        "untainted": true
      },
      "narrative": [
        {
          "id": "kolat-lotus-recruit",
          "label": "My character is a Kolat member recruited into the Lotus Sect and is not corrupted by the Nothing."
        }
      ],
      "techniques": [
        {
          "rank": 1,
          "name": "Kiss of the Lotus",
          "desc": "When spending a Void Point on a Stealth or Acting Skill roll, gain +2k2 instead of +1k1.",
          "source": "Enemies of the Empire p.50"
        },
        {
          "rank": 2,
          "name": "Tiger's Claw",
          "desc": "In the first Round against an unaware or unsuspecting opponent, gain +1k0 on attack rolls and make melee attacks as Simple Actions.",
          "source": "Enemies of the Empire p.50"
        },
        {
          "rank": 3,
          "name": "Steal the Light",
          "desc": "Once per opponent per skirmish, call 2 Raises on a melee attack to keep only one damage die and leave the opponent blind, deaf or mute for Water Ring minutes.",
          "source": "Enemies of the Empire p.50"
        }
      ]
    },
    {
      "id": "berserkers",
      "name": "Berserkers (Chitatachikkan)",
      "clan": "Nezumi",
      "types": [
        "Bushi"
      ],
      "source": "Enemies of the Empire p.113",
      "requires": {
        "rings": {
          "Earth": 4
        },
        "traits": {
          "Agility": 4,
          "Strength": 5
        },
        "advantages": [
          "Fearless"
        ]
      },
      "special": {
        "weaponOrJiujutsuMinimum": 5
      },
      "narrative": [],
      "techniques": [
        {
          "rank": 1,
          "name": "Mad Fury",
          "desc": "Gain +1k1 to attack rolls in Full Attack Stance and make melee attacks as Simple Actions.",
          "source": "Enemies of the Empire p.113"
        },
        {
          "rank": 2,
          "name": "Dance of the Doomed",
          "desc": "Once per skirmish, at the start of your Turn as a Free Action, ignore Wound Penalties, including Down and Out, for Strength Rank Rounds. This does not prevent death.",
          "source": "Enemies of the Empire p.113"
        },
        {
          "rank": 3,
          "name": "Sever Tomorrow",
          "desc": "When Wounds would kill you, first make one final melee attack as a Free Action at +3k0 against an opponent within reach, then die. If your killer is within reach, you must choose them.",
          "source": "Enemies of the Empire p.113"
        }
      ],
      "recordedOnly": "Requires Nezumi character creation and School progression, which this sheet does not yet support."
    },
    {
      "id": "legion-of-two-thousand",
      "name": "Legion of Two Thousand",
      "clan": "Ronin",
      "types": [
        "Bushi"
      ],
      "source": "Secrets of the Empire p.233",
      "requires": {
        "rings": {
          "Fire": 3,
          "Water": 3
        },
        "skills": {
          "Battle": 3,
          "Defense": 4,
          "Kenjutsu": 3
        },
        "honor": 5
      },
      "special": {
        "roninBand": true
      },
      "narrative": [
        {
          "id": "legion-recruit",
          "label": "My character has been recruited into the Legion of Two Thousand ronin band."
        }
      ],
      "techniques": [
        {
          "rank": 1,
          "name": "Stand as Two Thousand",
          "desc": "Gain +1k0 to Defense Skill rolls, or +1k1 while defending innocent or common people.",
          "source": "Secrets of the Empire p.233"
        },
        {
          "rank": 2,
          "name": "Kuronada's Honor",
          "desc": "While Honor is at least 5.0, spending a Void Point on a School Skill roll gives +2k1 instead of +1k1; this does not work in Center Stance.",
          "source": "Secrets of the Empire p.233"
        },
        {
          "rank": 3,
          "name": "Tamago's Expertise",
          "desc": "Make melee attacks with Samurai weapons as Simple Actions.",
          "source": "Secrets of the Empire p.233"
        }
      ]
    },
    {
      "id": "disciples-of-sun-tao",
      "name": "Disciples of Sun Tao",
      "clan": "Ronin",
      "types": [
        "Bushi"
      ],
      "source": "Secrets of the Empire p.234",
      "requires": {
        "rings": {
          "Fire": 4,
          "Water": 3
        },
        "skills": {
          "Battle": 4
        }
      },
      "special": {
        "weaponSkills": {
          "count": 2,
          "minimumRank": 4
        },
        "battleEmphasis": 4
      },
      "narrative": [
        {
          "id": "sun-tao-band",
          "label": "My character was born into or recruited into the Disciples of Sun Tao ronin band."
        }
      ],
      "techniques": [
        {
          "rank": 1,
          "name": "Terumoto's Lesson",
          "desc": "Choose three Weapon Skills; gain +1k0 to rolls with them.",
          "source": "Secrets of the Empire p.234"
        },
        {
          "rank": 2,
          "name": "Sun Tao's Legacy",
          "desc": "Gain +1k1 on Battle rolls that determine who is winning a battle and +1k0 on Mass Battle Table status rolls.",
          "source": "Secrets of the Empire p.234"
        },
        {
          "rank": 3,
          "name": "Aikumo's Perfection",
          "desc": "Make attacks with melee weapons as Simple Actions.",
          "source": "Secrets of the Empire p.234"
        }
      ]
    },
    {
      "id": "children-of-doji",
      "name": "Children of Doji",
      "clan": "Crane",
      "types": [
        "Courtier"
      ],
      "source": "Sword and Fan p.204",
      "requires": {
        "rings": {
          "Void": 4
        },
        "skills": {
          "Courtier": 6,
          "Etiquette": 6,
          "Sincerity": 5
        },
        "honor": 5,
        "traits": {
          "Awareness": 5
        },
        "advantages": [
          "Allies"
        ]
      },
      "special": {
        "skillKinds": {
          "kinds": [
            "Perform",
            "Artisan"
          ],
          "minimumRank": 4
        },
        "allyDevotion": true
      },
      "narrative": [
        {
          "id": "children-of-doji-allies",
          "label": "My four or more Allies represent different individuals, including one with Devotion 4."
        }
      ],
      "techniques": [
        {
          "rank": 1,
          "name": "Social Butterfly",
          "desc": "On a Contested Social Skill roll, gain +Xk0 where X is the number of Allies in the court with Devotion 2 or higher, capped at your Insight Rank; with at least three, you may expend one to gain Darling of the Court for the season.",
          "source": "Sword and Fan p.204"
        },
        {
          "rank": 2,
          "name": "All Is Fair",
          "desc": "At a neutral or friendly court with five Allies of Devotion 2+, spend a week working and roll Courtier (Manipulation) / Awareness at TN 40, or a Contested Roll if opposed. Give your favored commander one Free Raise on a Battle roll, plus one per Raise. Each is usable once; unused Raises expire at campaign end. Use once per military campaign.",
          "source": "Sword and Fan p.204"
        },
        {
          "rank": 3,
          "name": "Gild the Lily",
          "desc": "Once per person per month, spend an hour and 1 Void Point. For an Ally, roll Courtier (Manipulation) / Awareness at TN 20 plus 5 per point to grant a Social or Material Advantage costing up to your Honor Rank, subject to GM approval. For an enemy, win Courtier (Manipulation) / Awareness against Etiquette (Courtesy) / Awareness to suppress a Social Advantage within the same cost limit. Either effect lasts one month.",
          "source": "Sword and Fan p.204"
        }
      ]
    },
    {
      "id": "kakita-master-artisan",
      "name": "Kakita Master Artisan",
      "clan": "Crane",
      "types": [
        "Artisan"
      ],
      "source": "The Great Clans p.74",
      "requires": {
        "traits": {
          "Awareness": 5
        },
        "rings": {
          "Void": 5
        }
      },
      "special": {
        "chosenArtMinimum": 8,
        "kakitaArtisanOrCraneProdigy": true
      },
      "narrative": [
        {
          "id": "kakita-chosen-art",
          "label": "The qualifying art and Great Potential Skill are among my chosen arts (Acting, Artisan or Perform); for a non-Kakita Artisan, Great Potential names my single chosen art."
        }
      ],
      "techniques": [
        {
          "rank": 1,
          "name": "The Master's Touch",
          "desc": "Roll a chosen art Skill at TN 40. Gain 5 Glory points plus 1 per Raise. The audience gains 1 bonus Void Point for 24 hours, even above its usual maximum, or 2 points with four Raises. These bonus points do not stack.",
          "source": "The Great Clans p.74"
        },
        {
          "rank": 2,
          "name": "Mastery Unbounded",
          "desc": "Gain +2k0 with chosen art Skills; a trained Kakita Artisan may choose a third art from School Skills.",
          "source": "The Great Clans p.74"
        },
        {
          "rank": 3,
          "name": "The Perfect Art",
          "desc": "Once per month, spend 2 Void Points and roll a chosen art Skill / Awareness at TN 50 to make the work manifest in reality. The GM chooses a beneficial effect lasting a few minutes, or one hour with four Raises.",
          "source": "The Great Clans p.74"
        }
      ]
    },
    {
      "id": "mirumoto-master-sensei",
      "name": "Mirumoto Master Sensei",
      "clan": "Dragon",
      "types": [
        "Bushi"
      ],
      "source": "The Great Clans p.102",
      "requires": {
        "rings": {
          "Air": 5,
          "Earth": 4,
          "Void": 5
        },
        "skills": {
          "Kenjutsu": 5,
          "Meditation": 6
        }
      },
      "special": {
        "masterSensei": true
      },
      "narrative": [
        {
          "id": "master-sensei-teaching",
          "label": "My character was chosen and taught by another Master Sensei."
        }
      ],
      "techniques": [
        {
          "rank": 1,
          "name": "The Sword and the Soul",
          "desc": "When fighting with a sword, reducing an opponent to Down, Out or Dead restores 1 Void Point; temporary excess ends after the skirmish.",
          "source": "The Great Clans p.102"
        },
        {
          "rank": 2,
          "name": "The Body Is Illusion",
          "desc": "Spend a Void Point as a Simple Action to ignore Wound Penalties, including Down but not Out, for the skirmish or ten minutes outside it.",
          "source": "The Great Clans p.102"
        },
        {
          "rank": 3,
          "name": "Sword of the Sensei",
          "desc": "Once per day as a Simple Action, roll Meditation / Awareness at TN 25 plus 5 per ally fighting in the same skirmish. Success grants those allies the Rank One benefit for that skirmish.",
          "source": "The Great Clans p.102"
        }
      ]
    },
    {
      "id": "tamori-master-of-the-mountain",
      "name": "Tamori Master of the Mountain",
      "clan": "Dragon",
      "types": [
        "Shugenja"
      ],
      "source": "The Great Clans pp.102–103",
      "requires": {
        "skills": {
          "Spellcraft": 5
        }
      },
      "special": {
        "ringPattern": {
          "chosenMinimum": 4,
          "otherMinimum": 3,
          "otherCount": 2
        }
      },
      "narrative": [],
      "techniques": [
        {
          "rank": 1,
          "name": "Integration of the Gods",
          "desc": "When casting a spell, spend two slots from another non-opposed Ring instead of one slot from the spell's Ring.",
          "source": "The Great Clans p.102"
        },
        {
          "rank": 2,
          "name": "Inner Fortitude",
          "desc": "Increase your Shugenja School Rank by one for casting. As a Free Action, spend a spell slot for Reduction 2 and +10 Armor TN for Earth Ring Rounds, ending during Reactions or earlier as a Free Action. While this defensive effect lasts, casting requires one extra Raise to no effect.",
          "source": "The Great Clans pp.102–103"
        },
        {
          "rank": 3,
          "name": "Power in Need",
          "desc": "Spend a Void Point and any Ring's spell slot as a Simple Action to gain +4k1 on Spell Casting Rolls for one keyword until the encounter ends, or one hour outside combat.",
          "source": "The Great Clans p.103"
        }
      ]
    },
    {
      "id": "akodo-tactical-master",
      "name": "Akodo Tactical Master",
      "clan": "Lion",
      "types": [
        "Bushi"
      ],
      "source": "The Great Clans p.139",
      "requires": {
        "rings": {
          "Water": 4
        },
        "traits": {
          "Intelligence": 5
        },
        "skills": {
          "Battle": 5
        }
      },
      "special": {
        "skillAny": {
          "skills": [
            "Games: Shogi",
            "Games: Go"
          ],
          "minimumRank": 4
        },
        "battleEmphasis": 5
      },
      "narrative": [],
      "techniques": [
        {
          "rank": 1,
          "name": "The Eyes of the General",
          "desc": "Reroll one die each Battle Turn of Mass Combat, and one die on an attack roll where you called at least one Raise.",
          "source": "The Great Clans p.139"
        },
        {
          "rank": 2,
          "name": "Malleable as the Sea",
          "desc": "Spend a Void Point to choose any suitable Core rulebook Heroic Opportunity for a Mass Battle Turn, subject to GM approval.",
          "source": "The Great Clans p.139"
        },
        {
          "rank": 3,
          "name": "The Soul of the Army",
          "desc": "Spend a Void Point for +5k1 on a Battle Skill Roll instead of +1k1, or +2k2 on a Bugei Skill Roll instead of +1k1.",
          "source": "The Great Clans p.139"
        }
      ]
    },
    {
      "id": "asako-inquisitors",
      "name": "Asako Inquisitors",
      "clan": "Phoenix",
      "types": [
        "Monk"
      ],
      "source": "The Great Clans pp.200–201",
      "requires": {
        "rings": {
          "Void": 4
        },
        "skills": {
          "Lore: Law": 4,
          "Lore: Shugenja": 3
        }
      },
      "special": {
        "ringPattern": {
          "minimum": 3,
          "count": 2,
          "exclude": [
            "Void"
          ]
        },
        "inquisitorEntry": true,
        "untainted": true
      },
      "narrative": [
        {
          "id": "inquisitor-entry",
          "label": "If entering by the Sacred Weapon route, my character can already make melee attacks as Simple Actions. (Spellcasters who qualify to cast Mastery Level 4 spells need no such ability.)"
        }
      ],
      "techniques": [
        {
          "rank": 1,
          "name": "Eye of the Inquisitor",
          "desc": "Increase original Shugenja School Rank by one for spellcasting, or, for a non-shugenja, gain a Kiho whose prerequisites you meet. Prepare a disruption as a Complex Action. Later in the same skirmish, use a Free Action when an opponent casts to require two extra Raises to no effect. Prepare again for each disruption.",
          "source": "The Great Clans pp.200–201"
        },
        {
          "rank": 2,
          "name": "The Trials of Jade",
          "desc": "Spend a Void Point for a spell to count as jade or crystal against Reduction or Invulnerability; if you cannot cast spells, make a melee attack as a Simple Action against a known violator of the Empire's magic laws.",
          "source": "The Great Clans p.201"
        },
        {
          "rank": 3,
          "name": "Conviction of Purity",
          "desc": "Increase original Shugenja School Rank by one more for spellcasting, or, for a non-shugenja, gain one Kiho. Preparing a disruption now takes a Simple Action and the disrupted spell requires three extra Raises to no effect.",
          "source": "The Great Clans p.201"
        }
      ]
    }
  ];
  const SUP47 = (function(){
    const api = {};
    const number = id => parseFloat((document.getElementById(id) || {}).value) || 0;
    const norm = value => String(value || '').trim().toLowerCase();
    const ringNames = ['Air', 'Earth', 'Fire', 'Water', 'Void'];
    const clan = () => norm((document.getElementById('f_clan') || {}).value);
    const configs = name => Array.from(document.querySelectorAll('#advList .entry'))
      .filter(row => norm((row.querySelector('.en-name') || {}).value) === norm(name))
      .map(row => typeof readAdvConfig === 'function' ? readAdvConfig(row) : null).filter(Boolean);
    const art = name => /^(acting|artisan|perform)(?:\s*[:(]|$)/i.test(String(name).trim());
    api.canCastFourth = function(){
      const basic = findAnySchoolLibraryEntry((document.getElementById('f_school') || {}).value);
      const elements = ringNames.filter(r => r !== 'Void' || hasAdvantageNamed('Ishiken-Do'));
      if(basic && basic.shugenja && elements.some(r => effectiveSchoolRankForElement(r) >= 4)) return true;
      // Taking Courtier training does not erase already earned Shugenja training. School
      // records retain the frozen rank; later replacement Paths do not advance casting.
      return getSchoolsList().some(s => {
        if(!s.frozen) return false;
        const school = findAnySchoolLibraryEntry(s.name);
        if(!school || !school.shugenja) return false;
        const rank = Number(s.frozenRank) - AP46.laterPathRanks(s.name,Number(s.frozenRank));
        const affinity = school.affinityChoice ? (document.getElementById('f_schoolAffinity') || {}).value : school.affinity;
        return elements.some(r => rank + (affinity === r ? 1 : 0) - (school.deficiency === r ? 1 : 0) >= 4);
      });
    };
    api.unmet = function(entry){
      if(!entry || !SUPPLEMENTAL_ADVANCED_SCHOOL_DATA.includes(entry)) return [];
      const sp = entry.special || {}, unmet = [];
      if(entry.recordedOnly) unmet.push(entry.recordedOnly);
      if(sp.minorClan && !Object.keys(MINOR_CLAN_LIBRARY).some(n => norm(n) === clan())) unmet.push('membership in a Minor Clan');
      if(sp.imperialFamilies && !AP46.isImperial()) unmet.push('membership in an Imperial family');
      if(sp.statusMinimum && number('f_statusRank') < sp.statusMinimum) unmet.push('Status Rank ' + sp.statusMinimum);
      if(sp.anyTraitMinimum && !Object.keys(TRAIT_ID_MAP).some(t => getTraitValueByName(t) >= sp.anyTraitMinimum)) unmet.push('any Trait at ' + sp.anyTraitMinimum);
      if(sp.weaponOrJiujutsuMinimum && !AP46.hasSkillOfKind(['Weapon'], sp.weaponOrJiujutsuMinimum,1) && getCharacterSkillRank('Jiujutsu') < sp.weaponOrJiujutsuMinimum) unmet.push('a Weapon Skill or Jiujutsu at Rank ' + sp.weaponOrJiujutsuMinimum);
      if(sp.skillKinds && !AP46.hasSkillOfKind(sp.skillKinds.kinds,sp.skillKinds.minimumRank,1)) unmet.push('an Artisan or Perform Skill at Rank ' + sp.skillKinds.minimumRank);
      if(sp.skillAny && !sp.skillAny.skills.some(s => getCharacterSkillRank(s) >= sp.skillAny.minimumRank)) unmet.push(sp.skillAny.skills.join(' or ') + ' at Rank ' + sp.skillAny.minimumRank);
      if(sp.battleEmphasis && (getCharacterSkillRank('Battle') < sp.battleEmphasis || !['Mass Battle','Mass Combat'].some(e => hasSkillEmphasis('Battle',e)))) unmet.push('Battle (Mass Combat / Mass Battle) ' + sp.battleEmphasis);
      if(sp.allyDevotion){
        const allies = configs('Allies').filter(c => c.type === 'dualTierPick' && [1,2,4].includes(Number(c.influence)) && [1,2,4].includes(Number(c.devotion)));
        if(allies.length < 4 || !allies.some(c => Number(c.devotion) >= 4)) unmet.push('four configured Allies, including Devotion 4');
      }
      if(sp.kakitaArtisanOrCraneProdigy){
        const schools = getSchoolsList();
        const trained = schools.some(s => /kakita artisan/i.test(s.name) && (s.frozen ? Number(s.frozenRank) : computeCappedActiveRank(schools,number('f_insightPts'))) >= 1);
        const potential = configs('Great Potential').filter(c => c.type === 'skillPick' && art(c.skill));
        if(!potential.length) unmet.push('Great Potential configured for an art Skill');
        if(!AP46.hasSkillOfKind(['Artisan','Perform','Acting'],sp.chosenArtMinimum,1)) unmet.push('a chosen art at Rank 8');
        if(!trained && (clan() !== 'crane' || !hasAdvantageNamed('Prodigy') || !potential.some(c => getCharacterSkillRank(c.skill) >= 8))) unmet.push('Kakita Artisan training, or Crane membership with Prodigy and Great Potential in the Rank 8 chosen art');
      }
      if(sp.masterSensei && ['Brash','Proud'].some(n => AP46.hasDisadvantage(n))) unmet.push('neither Brash nor Proud');
      if(sp.ringPattern){
        const p = sp.ringPattern, values = ringNames.filter(n => !(p.exclude || []).includes(n)).map(getRingValueByName);
        const met = p.chosenMinimum ? values.some((v,i) => v >= p.chosenMinimum && values.filter((w,j) => j !== i && w >= p.otherMinimum).length >= p.otherCount)
          : values.filter(v => v >= p.minimum).length >= p.count;
        if(!met) unmet.push(p.chosenMinimum ? 'one Ring at 4 and two other Rings at 3' : 'two non-Void Rings at 3');
      }
      if(sp.untainted && number('f_taint') > 0) unmet.push('no Taint');
      if(sp.inquisitorEntry && !api.canCastFourth()){
        const weapon = Array.from(document.querySelectorAll('#weaponsBody .wp-name')).some(e => norm(e.value).replace(/[’‘]/g,"'") === "inquisitor's strike");
        if(!weapon) unmet.push('ability to cast Mastery Level 4 spells, or possession of the Phoenix Sacred Weapon (Inquisitor’s Strike)');
      }
      return unmet;
    };
    return api;
  })();
  if (SUPPLEMENTAL_ADVANCED_SCHOOLS_ENABLED && typeof AS47 === 'object' && AS47 && AS47.enabled()) {
    ADVANCED_SCHOOL_LIBRARY.push(...SUPPLEMENTAL_ADVANCED_SCHOOL_DATA);
    const priorUnmet = AS47.unmet;
    AS47.unmet = function(entry, choices){ return priorUnmet.apply(this, arguments).concat(SUP47.unmet(entry)); };
    const errors = AS47.assertCatalogue();
    if(errors.length) console.error('Supplemental Advanced Schools: ' + errors.join('; '));
    AS47.refresh();
  }
  // END PART I PHASE 4.7.1
  