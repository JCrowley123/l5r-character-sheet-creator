  // ============ PART I PHASE 4.7 — CORE ADVANCED SCHOOLS ============
  // Separate training, Core p.245. A chosen track starts at zero and takes the next
  // advancement, like the existing Multiple Schools enrolment. Earlier ranks stay held.
  // Requirements reuse Phase 4.6 (Part I); save formats use Phase 7 (Part J).
  // Technique effects are reference text, following Phase 6 (Part G), not new roll rules.
  const ADVANCED_SCHOOLS_ENABLED = true;
  const ADVANCED_SCHOOL_LIBRARY = [
  {
    "id": "defender-of-the-wall",
    "name": "Defender of the Wall",
    "clan": "Crab",
    "types": [
      "Bushi"
    ],
    "source": "Core Rulebook p.247",
    "requires": {
      "rings": {
        "Earth": 4
      },
      "traits": {
        "Strength": 5
      },
      "skills": {
        "Defense": 4,
        "Heavy Weapons": 4,
        "Lore: Shadowlands": 5
      }
    },
    "special": {},
    "narrative": [],
    "techniques": [
      {
        "rank": 1,
        "name": "The Flames of Purity",
        "desc": "Creatures with Shadowlands Taint cannot explode 10s on attack or damage rolls against you.",
        "source": "Core Rulebook p.247"
      },
      {
        "rank": 2,
        "name": "Hida's Strength",
        "desc": "Gain Reduction 8, added to Reduction from armor and other Techniques.",
        "source": "Core Rulebook p.247"
      },
      {
        "rank": 3,
        "name": "The Crab Are the Wall",
        "desc": "Once each round, immediately remove one Condition affecting you. Mounted and Grappled cannot be removed this way.",
        "source": "Core Rulebook p.247"
      }
    ]
  },
  {
    "id": "kenshinzen",
    "name": "Kenshinzen",
    "clan": "Crane",
    "types": [
      "Bushi"
    ],
    "source": "Core Rulebook p.247",
    "requires": {
      "rings": {
        "Fire": 4,
        "Void": 4
      },
      "skills": {
        "Iaijutsu": 5,
        "Lore: Bushido": 4,
        "Meditation": 5
      }
    },
    "special": {},
    "narrative": [
      {
        "id": "kenshinzen-duel",
        "label": "I fairly defeated a current Kenshinzen in a legal iaijutsu duel. The duel need not have been fatal."
      }
    ],
    "techniques": [
      {
        "rank": 1,
        "name": "Drawing the Void",
        "desc": "While in Center Stance, add 10 to your Armor TN.",
        "source": "Core Rulebook p.247"
      },
      {
        "rank": 2,
        "name": "Kakita's Strength",
        "desc": "During an iaijutsu duel, your Assessment and Focus dice explode on 9 as well as 10.",
        "source": "Core Rulebook p.247"
      },
      {
        "rank": 3,
        "name": "A Single Moment",
        "desc": "If you make only one attack during your Turn, an opponent you hit is Stunned until your next Turn begins.",
        "source": "Core Rulebook p.247"
      }
    ]
  },
  {
    "id": "swordmasters",
    "name": "Swordmasters",
    "clan": "Dragon",
    "types": [
      "Bushi"
    ],
    "source": "Core Rulebook p.247",
    "requires": {
      "rings": {
        "Fire": 4,
        "Void": 4
      },
      "skills": {
        "Iaijutsu": 5,
        "Kenjutsu": 5,
        "Lore: Theology": 4
      }
    },
    "special": {},
    "narrative": [],
    "techniques": [
      {
        "rank": 1,
        "name": "The Silence of Two Strikes",
        "desc": "With a katana in your main hand and a wakizashi in your off hand, you may spend Void Points twice during a Turn.",
        "source": "Core Rulebook p.247"
      },
      {
        "rank": 2,
        "name": "Mirumoto's Strength",
        "desc": "Your Focus roll in an iaijutsu duel always receives the +1k1 Assessment benefit, regardless of the Assessment result. Your opponent may independently earn that benefit too.",
        "source": "Core Rulebook p.247"
      },
      {
        "rank": 3,
        "name": "Harmony and Precision",
        "desc": "While wielding a katana in your main hand and a wakizashi in your off hand, ignore your opponents' Reduction.",
        "source": "Core Rulebook p.247"
      }
    ]
  },
  {
    "id": "lions-pride",
    "name": "The Lion's Pride",
    "clan": "Lion",
    "types": [
      "Bushi"
    ],
    "source": "Core Rulebook p.248",
    "requires": {
      "traits": {
        "Agility": 5,
        "Strength": 5
      },
      "skills": {
        "Battle": 5
      },
      "honor": 6,
      "families": [
        "Matsu"
      ]
    },
    "special": {
      "weaponSkills": {
        "count": 4,
        "minimumRank": 3,
        "distinct": true
      }
    },
    "narrative": [
      {
        "id": "lions-pride-female",
        "label": "My character is female, as required for the Lion's Pride."
      }
    ],
    "techniques": [
      {
        "rank": 1,
        "name": "The Fury of Matsu",
        "desc": "While in Full Attack Stance, add 10 to your Armor TN.",
        "source": "Core Rulebook p.248"
      },
      {
        "rank": 2,
        "name": "Paragon of Honor",
        "desc": "Opponents within 30 feet whose Honor Rank is lower than yours cannot explode 10s. An opponent may spend 2 Void Points during the Reactions Stage to ignore this effect for the encounter.",
        "source": "Core Rulebook p.248"
      },
      {
        "rank": 3,
        "name": "Matsu's Technique",
        "desc": "When an opponent declares a melee attack against you before you have taken your Turn that round, spend 1 Void Point to make a Simple Action attack against them first. Your Turn then has only one Simple Action, with Free Actions still allowed. This response is available in Full Attack Stance.",
        "source": "Core Rulebook p.248"
      }
    ]
  },
  {
    "id": "storm-riders",
    "name": "Storm Riders",
    "clan": "Mantis",
    "types": [
      "Shugenja"
    ],
    "source": "Core Rulebook pp.248-249",
    "requires": {
      "rings": {
        "Air": 3,
        "Fire": 3,
        "Water": 5
      },
      "skills": {
        "Lore: the Sea": 5,
        "Sailing": 3,
        "Spellcraft": 3,
        "Lore: Theology": 3
      }
    },
    "special": {
      "elementalBlessing": "Water",
      "castingElement": "Water"
    },
    "narrative": [],
    "techniques": [
      {
        "rank": 1,
        "name": "Strength of Suitengu",
        "desc": "Treat your Shugenja School Rank as 1 higher when casting Water spells. Spend 1 Void Point and a Complex Action to strike one target within Water Ring x 10 feet with lightning. Damage is Air Ring rolled and kept. Each spell slot spent adds +1k0 damage; spend no more slots than your Storm Rider Rank.",
        "source": "Core Rulebook p.249"
      },
      {
        "rank": 2,
        "name": "The Raging Ocean",
        "desc": "Increase your Shugenja School Rank by 1. Treat your Water Ring as 2 higher when determining your daily Water spell slots.",
        "source": "Core Rulebook p.249"
      },
      {
        "rank": 3,
        "name": "Child of Osano-Wo",
        "desc": "Treat your Shugenja School Rank as another 1 higher when casting Water spells. Spend 1 Void Point as a Free Action to become immune to Thunder-keyword spells of Mastery Level 3 or lower for three rounds.",
        "source": "Core Rulebook p.249"
      }
    ]
  },
  {
    "id": "elemental-guard",
    "name": "Elemental Guard",
    "clan": "Phoenix",
    "types": [
      "Shugenja"
    ],
    "source": "Core Rulebook p.249",
    "requires": {
      "skills": {
        "Spellcraft": 6,
        "Lore: Theology": 6
      }
    },
    "special": {
      "chooseElement": [
        "Air",
        "Earth",
        "Fire",
        "Water"
      ],
      "chosenRingMinimum": 6,
      "chosenElementCastingMastery": 4,
      "castingElement": "chosenElement"
    },
    "narrative": [],
    "techniques": [
      {
        "rank": 1,
        "name": "Name of the Elements",
        "desc": "Treat your Shugenja School Rank as 1 higher when casting spells of your chosen element. Spend 1 Void Point as a Free Action to add twice your chosen Ring to your Armor TN for a number of minutes equal to your Shugenja School Rank. This protection produces a visible elemental effect.",
        "source": "Core Rulebook p.249"
      },
      {
        "rank": 2,
        "name": "Touch of the Elements",
        "desc": "Increase your Shugenja School Rank by 1. Treat your chosen Ring as 2 higher when determining that element's daily spell slots.",
        "source": "Core Rulebook p.249"
      },
      {
        "rank": 3,
        "name": "Shape of the Elements",
        "desc": "Treat your Shugenja School Rank as another 1 higher when casting spells of your chosen element. Select one spell of that element with Mastery Level 3 or higher. A number of times daily equal to your Void Ring, you may cast that spell with one Simple Action.",
        "source": "Core Rulebook p.249"
      }
    ]
  },
  {
    "id": "scorpion-instigator",
    "name": "Scorpion Instigator",
    "clan": "Scorpion",
    "types": [
      "Courtier"
    ],
    "source": "Core Rulebook pp.249-250",
    "requires": {
      "traits": {
        "Awareness": 5,
        "Intelligence": 5,
        "Perception": 3
      },
      "skills": {
        "Courtier": 6,
        "Etiquette": 5,
        "Sincerity": 5,
        "Stealth": 4
      },
      "advantages": [
        "Blackmail"
      ],
      "disadvantages": [
        "Dark Secret"
      ]
    },
    "special": {
      "blackmailDistinctPeople": 4
    },
    "narrative": [
      {
        "id": "instigator-four-blackmail-targets",
        "label": "My Blackmail covers at least four different people."
      },
      {
        "id": "instigator-secret-disclosed",
        "label": "I disclosed at least one of my Dark Secrets to the Instigator sensei on joining."
      }
    ],
    "techniques": [
      {
        "rank": 1,
        "name": "The Depths of Dishonor",
        "desc": "On a contested Social Skill roll, gain extra unkept dice equal to the difference between your Honor Rank and your opponent's Honor Rank.",
        "source": "Core Rulebook p.250"
      },
      {
        "rank": 2,
        "name": "Sheath Your Lies in Truth",
        "desc": "When a contested Social Skill roll determines whether someone detects your lie, spend 1 Void Point for +3k3 instead of the usual +1k1. Obviously false claims can still damage your reputation.",
        "source": "Core Rulebook p.250"
      },
      {
        "rank": 3,
        "name": "Pull the String",
        "desc": "Converse with a Blackmail subject for 10 minutes, then spend 1 Void Point as a Complex Action and win Courtier (Manipulation) / Awareness against their Etiquette (Courtesy) / Willpower. Suggest an action that is neither life-threatening nor worse in consequence than disclosure. They must carry it out or lose 4 Honor points.",
        "source": "Core Rulebook p.250"
      }
    ]
  },
  {
    "id": "obsidian-warrior",
    "name": "Obsidian Warrior",
    "clan": "Spider",
    "types": [
      "Bushi"
    ],
    "source": "Core Rulebook p.250",
    "requires": {
      "rings": {
        "Earth": 4
      },
      "traits": {
        "Agility": 5,
        "Reflexes": 5
      },
      "skills": {
        "Iaijutsu": 5,
        "Intimidation": 5,
        "Lore: Shourido": 4
      }
    },
    "special": {},
    "narrative": [
      {
        "id": "obsidian-sensei-skirmish",
        "label": "I survived a skirmish with an Obsidian Warrior sensei."
      }
    ],
    "techniques": [
      {
        "rank": 1,
        "name": "Darkness Is My Light",
        "desc": "There is no limit on the number of Raises you may call.",
        "source": "Core Rulebook p.250"
      },
      {
        "rank": 2,
        "name": "The Power of Impurity",
        "desc": "Opponents within 30 feet subtract your Strength Rank plus Taint Rank from their Bugei roll and damage roll totals. An opponent may spend 1 Void Point to ignore this effect for their Turn.",
        "source": "Core Rulebook p.250"
      },
      {
        "rank": 3,
        "name": "My Strength Has No Limits",
        "desc": "Add unkept dice equal to your Strength Rank plus Taint Rank when resisting Intimidation or Fear, and on your melee-weapon damage rolls.",
        "source": "Core Rulebook p.250"
      }
    ]
  },
  {
    "id": "white-guard",
    "name": "The White Guard",
    "clan": "Unicorn",
    "types": [
      "Bushi"
    ],
    "source": "Core Rulebook p.250",
    "requires": {
      "rings": {
        "Earth": 5
      },
      "traits": {
        "Agility": 5,
        "Strength": 4
      },
      "skills": {
        "Horsemanship": 5,
        "Lore: Theology": 5
      }
    },
    "special": {
      "lordsOfDeathFaithWaivedBeforeYear": 1160
    },
    "narrative": [
      {
        "id": "white-guard-faith-or-era",
        "label": "I am a devout follower of the Lords of Death, or this campaign is set before the year 1160."
      }
    ],
    "techniques": [
      {
        "rank": 1,
        "name": "Pale Face of Death",
        "desc": "At the start of your Turn, spend 1 Void Point as a Free Action and choose one opponent within 30 feet. Their actions suffer TN penalties equal to your Lore: Theology Rank for the rest of the encounter. Only one target may be affected at a time.",
        "source": "Core Rulebook p.250"
      },
      {
        "rank": 2,
        "name": "Moto's Strength",
        "desc": "Ignore wound TN penalties up to twice your Lore: Theology Rank.",
        "source": "Core Rulebook p.250"
      },
      {
        "rank": 3,
        "name": "Fury of Heaven",
        "desc": "When making an attack, spend 1 Void Point to add five times your Lore: Theology Rank to the attack roll total.",
        "source": "Core Rulebook p.250"
      }
    ]
  }
]; // CORE_ADVANCED_SCHOOL_DATA

  const AS47 = (function(){
    const api = { FIELD:'f_advancedSchoolData', STEP_NAME:'Phase 4.7 (Part I): Advanced School progression' };
    const $ = function(id){ return document.getElementById(id); };
    api.enabled = function(){
      return ADVANCED_SCHOOLS_ENABLED && typeof AP46 === 'object' && AP46
        && typeof ALTERNATE_PATHS_ENABLED !== 'undefined' && ALTERNATE_PATHS_ENABLED
        && typeof VersionManager === 'object' && VersionManager && VersionManager.enabled();
    };
    api.catalogue = ADVANCED_SCHOOL_LIBRARY;
    api.find = function(name){ return ADVANCED_SCHOOL_LIBRARY.find(function(s){ return s.name === name; }) || null; };
    api.casterCategory = function(entry){
      if(!entry) return null;
      return entry.types.indexOf('Shugenja') >= 0 ? 'shugenja' : entry.types.indexOf('Bushi') >= 0 ? 'bushi' : null;
    };
    api.valid = function(r){
      return !!(r && typeof r === 'object' && api.find(r.name)
        && Number.isInteger(r.anchorInsightRank) && r.anchorInsightRank >= 1
        && Number.isInteger(r.earnedRank) && r.earnedRank >= 0 && r.earnedRank <= 3
        && typeof r.basicSchool === 'string' && r.basicSchool
        && Number.isInteger(r.basicRank) && r.basicRank >= 0
        && typeof r.element === 'string' && typeof r.allowBasic === 'boolean' && typeof r.resumed === 'boolean'
        && (!r.resumed || (r.allowBasic && r.earnedRank === 3))
        && Array.isArray(r.confirmations) && r.confirmations.every(function(c){ return typeof c === 'string'; })
        && (!api.find(r.name).special.chooseElement || api.find(r.name).special.chooseElement.indexOf(r.element) >= 0));
    };
    api.record = function(){
      if(!api.enabled() || !$(api.FIELD) || !$(api.FIELD).value) return null;
      try { const r = JSON.parse($(api.FIELD).value); return api.valid(r) ? r : null; } catch(e){ return null; }
    };
    api.save = function(r){ $(api.FIELD).value = r ? JSON.stringify(r) : ''; };
    api.insightRank = function(){ return calculateSchoolRank(parseInt(($('f_insightPts') || {}).value || '0', 10)).rank; };
    api.rank = function(){
      const r = api.record();
      return r ? Math.min(3, Math.max(r.earnedRank, api.insightRank() - r.anchorInsightRank, 0)) : 0;
    };
    api.management = function(){ return !(typeof MODES12 === 'object' && MODES12 && MODES12.isPlay()); };
    api.unmet = function(entry, choices){
      choices = choices || {};
      if(!api.enabled()) return ['Advanced Schools are unavailable'];
      if(!entry || api.find(entry.name) !== entry) return ['a listed Advanced School'];
      const unmet = pathRequirementsUnmet(entry).slice(), sp = entry.special || {};
      const casterLock = characterCasterLock(), newCategory = api.casterCategory(entry);
      if(casterLock && newCategory && casterLock !== newCategory) unmet.push('compatible training: Bushi and Shugenja ranks cannot be combined (Core p.151)');
      if(sp.weaponSkills && !AP46.hasSkillOfKind(['Weapon'], sp.weaponSkills.minimumRank, sp.weaponSkills.count)){
        unmet.push(sp.weaponSkills.count + ' different Weapon Skills at Rank ' + sp.weaponSkills.minimumRank);
      }
      if(sp.elementalBlessing){
        const found = Array.from(document.querySelectorAll('#advList .entry')).some(function(row){
          const n = row.querySelector('.en-name'), c = typeof readAdvConfig === 'function' ? readAdvConfig(row) : null;
          return n && n.value.trim().toLowerCase() === 'elemental blessing' && c && c.type === 'ringPick' && c.value === sp.elementalBlessing;
        });
        if(!found) unmet.push('Elemental Blessing (' + sp.elementalBlessing + ')');
      }
      if(sp.chooseElement){
        if(sp.chooseElement.indexOf(choices.element) < 0) unmet.push('choose Air, Earth, Fire or Water');
        else {
          if(getRingValueByName(choices.element) < sp.chosenRingMinimum) unmet.push(choices.element + ' ' + sp.chosenRingMinimum);
          const basic = findAnySchoolLibraryEntry(($('f_school') || {}).value || '');
          if(!basic || !basic.shugenja || effectiveSchoolRankForElement(choices.element) < sp.chosenElementCastingMastery){
            unmet.push('the ability to cast Mastery Level ' + sp.chosenElementCastingMastery + ' ' + choices.element + ' spells');
          }
        }
      }
      return unmet;
    };
    api.eligibleElements = function(entry){
      return (entry.special.chooseElement || []).filter(function(element){ return !api.unmet(entry, {element:element}).length; });
    };
    api.available = function(){
      if(!api.enabled()) return [];
      return ADVANCED_SCHOOL_LIBRARY.filter(function(s){ return s.special.chooseElement ? api.eligibleElements(s).length : !api.unmet(s).length; });
    };
    api.refuse = function(message){ setStatus(message); return false; };
    api.enter = function(name, choices){
      choices = choices || {};
      if(!api.enabled()) return api.refuse('Advanced Schools are unavailable.');
      if(!api.management()) return api.refuse('Enter Management to choose an Advanced School.');
      if(api.record()) return api.refuse('A character can train in only one Advanced School.');
      if(!hasMultipleSchoolsAdvantage()) return api.refuse('The Multiple Schools Advantage is required.');
      const entry = api.find(name), unmet = api.unmet(entry, choices);
      if(unmet.length) return api.refuse('Requires ' + unmet.join(', ') + '.');
      const confirmations = Array.isArray(choices.confirmations) ? choices.confirmations : [];
      if(entry.narrative.some(function(n){ return confirmations.indexOf(n.id) < 0; })) return api.refuse('Confirm the entry conditions with your GM before joining.');
      const list = getSchoolsList(), active = list[list.length - 1];
      if(!active || active.frozen) return api.refuse('Choose an active basic School before joining.');
      const rankBeforeFreeze = computeCappedActiveRank(list, parseInt($('f_insightPts').value || '0', 10));
      active.frozen = true; active.frozenRank = rankBeforeFreeze;
      saveSchoolsList(list);
      api.save({name:entry.name, element:choices.element || '', confirmations:entry.narrative.map(function(n){ return n.id; }),
        anchorInsightRank:api.insightRank(), earnedRank:0, basicSchool:active.name, basicRank:rankBeforeFreeze,
        allowBasic:false, resumed:false});
      recalcAll();
      setStatus(entry.name + ' chosen. Rank 1 begins at your next Insight Rank; ' + active.name + ' stays at Rank ' + rankBeforeFreeze + '.');
      return true;
    };
    api.allowFurtherTraining = function(approved){
      const r = api.record();
      if(!api.management() || !r || api.rank() < 3 || typeof approved !== 'boolean' || r.resumed) return false;
      r.earnedRank = 3; r.allowBasic = approved; api.save(r); api.refresh(); return true;
    };
    api.resumeBasic = function(choices){
      const r = api.record();
      if(!api.management() || !r || api.rank() < 3 || !choices || choices.gmApproved !== true || r.resumed) return false;
      const list = getSchoolsList(), index = list.findIndex(function(e){ return e.name === r.basicSchool; });
      if(index < 0 || list.some(function(e){ return !e.frozen; })) return false;
      const entry = list.splice(index, 1)[0], rank = entry.frozenRank;
      entry.frozen = false; entry.frozenRank = null; entry.floorRank = rank;
      entry.anchorInsightRank = api.insightRank() - rank;
      list.push(entry); saveSchoolsList(list);
      r.earnedRank = 3; r.allowBasic = true; r.resumed = true; api.save(r);
      recalcAll();
      setStatus('Basic School training resumed with GM permission. Your next Insight Rank advances ' + entry.name + '.');
      return true;
    };
    api.grant = function(r){
      const entry = api.find(r.name), rank = api.rank();
      entry.techniques.filter(function(t){ return t.rank <= rank; }).forEach(function(t){
        const tag = '[Advanced School Technique — Rank ' + t.rank + ', ' + r.name + ']';
        const exists = Array.from(document.querySelectorAll('#techList .entry')).some(function(row){
          return (row.querySelector('.en-desc') || {}).value && row.querySelector('.en-desc').value.indexOf(tag) >= 0;
        });
        if(!exists) $('techList').appendChild(makeEntry({name:t.name, cost:0, desc:tag + ' ' + t.desc + ' (' + t.source + ')\nReference: apply this Technique’s effects yourself; they are not added automatically.'}, true, 'XP'));
      });
    };
    api.uiChoices = function(){
      return {element:($('advancedSchoolElement') || {}).value || '', confirmations:Array.from(document.querySelectorAll('#advancedSchoolConfirmations input:checked')).map(function(el){ return el.value; })};
    };
    api.renderChoice = function(){
      const entry = api.find(($('advancedSchoolPicker') || {}).value), details = $('advancedSchoolDetails');
      if(!details) return;
      const key = entry ? entry.name : '';
      if(details.dataset.school !== key){
        details.dataset.school = key; details.innerHTML = '';
        if(entry){
          let html = '<p>' + escHtml(entry.source) + '. Earlier School ranks stay fixed. Rank 1 starts at your next Insight Rank; three Advanced ranks are available.</p>';
          if(entry.special.chooseElement) html += '<label for="advancedSchoolElement">Element</label><select id="advancedSchoolElement">' + api.eligibleElements(entry).map(function(el){ return '<option>' + el + '</option>'; }).join('') + '</select>';
          html += '<div id="advancedSchoolConfirmations">' + entry.narrative.map(function(n){ return '<label class="as47-confirm"><input type="checkbox" value="' + escAttr(n.id) + '"><span>' + escHtml(n.label) + '</span></label>'; }).join('') + '</div>';
          html += '<button type="button" id="advancedSchoolEnter">Begin training</button>';
          details.innerHTML = html;
          $('advancedSchoolEnter').addEventListener('click', function(){ api.enter(entry.name, api.uiChoices()); });
        }
      }
      if(entry && entry.special.chooseElement && $('advancedSchoolElement')){
        const select = $('advancedSchoolElement'), previous = select.value, elements = api.eligibleElements(entry);
        const html = elements.map(function(el){ return '<option>' + el + '</option>'; }).join('');
        if(select.innerHTML !== html){ select.innerHTML = html; if(elements.indexOf(previous) >= 0) select.value = previous; }
      }
      api.updateEntryButton();
    };
    api.updateEntryButton = function(){
      const button = $('advancedSchoolEnter'), entry = api.find(($('advancedSchoolPicker') || {}).value);
      if(!button || !entry) return;
      const choices = api.uiChoices();
      button.disabled = !api.management() || !hasMultipleSchoolsAdvantage() || api.unmet(entry, choices).length > 0
        || entry.narrative.some(function(n){ return choices.confirmations.indexOf(n.id) < 0; });
    };
    api.refresh = function(){
      if(!api.enabled() || !$('advancedSchoolPanel')) return;
      const panel = $('advancedSchoolPanel'), picker = $('advancedSchoolPicker'), r = api.record();
      const basicPicker = $('addSchoolSelect');
      if(basicPicker.dataset.as47Disabled !== undefined && (!r || (r.allowBasic && api.rank() === 3))){
        basicPicker.disabled = basicPicker.dataset.as47Disabled === 'true'; delete basicPicker.dataset.as47Disabled;
      }
      if(r){
        const rank = api.rank();
        if(r.earnedRank !== rank){ r.earnedRank = rank; api.save(r); }
        api.grant(r);
        panel.hidden = false; $('advancedSchoolChoose').hidden = true; $('advancedSchoolHeld').hidden = false;
        $('advancedSchoolSummary').textContent = r.name + (r.element ? ' (' + r.element + ')' : '') + ' — Rank ' + rank + ' of 3';
        $('advancedSchoolProgress').textContent = rank < 3 ? 'Next Advanced rank at Insight Rank ' + (r.anchorInsightRank + rank + 1) + '. ' + r.basicSchool + ' stays at Rank ' + r.basicRank + '.' : 'All three Advanced ranks learned. Further basic School training requires your GM’s permission.';
        $('advancedSchoolFinish').hidden = rank < 3 || r.resumed;
        $('advancedSchoolGmApproval').checked = !!r.allowBasic;
        $('advancedSchoolGmApproval').disabled = !api.management();
        $('advancedSchoolResume').disabled = !api.management() || !r.allowBasic;
        $('advancedSchoolResume').textContent = 'Resume ' + r.basicSchool;
        if(!r.allowBasic || rank < 3){
          if(basicPicker.dataset.as47Disabled === undefined) basicPicker.dataset.as47Disabled = String(basicPicker.disabled);
          $('btnAddSchoolToggle').disabled = true; $('addSchoolSelect').disabled = true;
          $('addSchoolHint').textContent = 'Finish your Advanced School’s three ranks before starting further basic training with GM permission.';
        }
      } else {
        const entries = api.available(), previous = picker.value;
        panel.hidden = !entries.length; $('advancedSchoolChoose').hidden = false; $('advancedSchoolHeld').hidden = true;
        const html = '<option value="">— choose an Advanced School —</option>' + entries.map(function(s){ return '<option value="' + escAttr(s.name) + '">' + escHtml(s.name + ' [' + s.types.join('/') + ']') + '</option>'; }).join('');
        if(picker.innerHTML !== html){ picker.innerHTML = html; if(entries.some(function(s){ return s.name === previous; })) picker.value = previous; }
        picker.disabled = !api.management() || !hasMultipleSchoolsAdvantage();
        picker.title = hasMultipleSchoolsAdvantage() ? 'Choose an Advanced School' : 'Requires the Multiple Schools Advantage';
        $('advancedSchoolGate').textContent = hasMultipleSchoolsAdvantage() ? 'Only Schools whose measurable requirements you meet are listed. Confirm any story conditions with your GM.' : 'Requires the Multiple Schools Advantage.';
        api.renderChoice();
      }
    };
    api.assertCatalogue = function(){
      const names = new Set(), errors = [];
      ADVANCED_SCHOOL_LIBRARY.forEach(function(s){
        if(s.techniques.length !== 3) errors.push(s.name + ': expected three Techniques');
        s.techniques.forEach(function(t, i){
          if(t.rank !== i + 1 || names.has(t.name) || TECH_DESCRIPTIONS[t.name]) errors.push(s.name + ': Technique conflict ' + t.name);
          names.add(t.name);
        });
      });
      return errors;
    };
    return api;
  })();

  function addAdvancedSchoolToCharacter(name, choices){ return AS47.enter(name, choices); }

  if(AS47.enabled()){
    const as47Field = document.createElement('input');
    as47Field.type = 'hidden'; as47Field.id = AS47.FIELD; as47Field.value = '';
    document.getElementById('f_schoolsData').after(as47Field);
    const as47Panel = document.createElement('section');
    as47Panel.id = 'advancedSchoolPanel'; as47Panel.hidden = true;
    as47Panel.innerHTML = '<h3>Advanced School</h3><div id="advancedSchoolChoose"><label for="advancedSchoolPicker">Advanced School</label><select id="advancedSchoolPicker"></select><p id="advancedSchoolGate"></p><div id="advancedSchoolDetails"></div></div><div id="advancedSchoolHeld" hidden><strong id="advancedSchoolSummary"></strong><p id="advancedSchoolProgress"></p><div id="advancedSchoolFinish"><label class="as47-confirm"><input type="checkbox" id="advancedSchoolGmApproval"><span>My GM permits further basic School training.</span></label><button type="button" id="advancedSchoolResume"></button></div></div><p class="as47-reference">Techniques are added as rules references. Their roll bonuses, spell bonuses, extra slots and other effects must be applied manually.</p>';
    document.getElementById('techList').before(as47Panel);
    const as47Style = document.createElement('style');
    as47Style.textContent = '#advancedSchoolPanel{margin:16px 0;padding:14px;border:1px solid var(--line);border-radius:8px;min-width:0;overflow-wrap:anywhere}#advancedSchoolPanel[hidden],#advancedSchoolPanel [hidden]{display:none!important}#advancedSchoolPanel select{width:100%;max-width:100%;min-width:0;min-height:44px;padding:8px;font:inherit;color:var(--ink);background:var(--card);border:1px solid var(--line);border-radius:6px}#advancedSchoolPanel button{max-width:100%;min-height:44px;white-space:normal}#advancedSchoolPanel p{margin:8px 0}.as47-confirm{display:flex;align-items:center;gap:8px;margin:10px 0;min-height:44px}.as47-confirm input{flex:0 0 auto;width:auto;margin:0}.as47-confirm span{font-size:14px;line-height:1.4;text-transform:none;letter-spacing:normal}.as47-reference{font-size:.9em;color:var(--ink-soft)}';
    document.head.appendChild(as47Style);
    document.getElementById('advancedSchoolPicker').addEventListener('change', AS47.renderChoice);
    document.getElementById('advancedSchoolDetails').addEventListener('change', AS47.updateEntryButton);
    document.getElementById('advancedSchoolGmApproval').addEventListener('change', function(e){ AS47.allowFurtherTraining(e.target.checked); AS47.refresh(); });
    document.getElementById('advancedSchoolResume').addEventListener('click', function(){ AS47.resumeBasic({gmApproved:document.getElementById('advancedSchoolGmApproval').checked}); });

    // Reconciliation must run inside the existing recalc, after Insight and the basic Rank.
    // Earlier listeners captured recalcAll, so rebinding only recalcAll would miss them.
    const as47RefreshSchools = refreshMultipleSchoolsUI;
    refreshMultipleSchoolsUI = function(){ const result = as47RefreshSchools.apply(this, arguments); AS47.refresh(); return result; };
    // The Core's Bushi/Shugenja exclusion applies to ranks already held in either track.
    const as47CasterLock = characterCasterLock;
    characterCasterLock = function(){
      const basic = as47CasterLock.apply(this, arguments), r = AS47.record();
      return basic || (r ? AS47.casterCategory(AS47.find(r.name)) : null);
    };
    // Apply School replaces training history; it cannot rename or unfreeze the basic
    // track behind a saved Advanced School. Capture also covers scripted DOM events.
    document.addEventListener('click', function(e){
      if(AS47.record() && e.target.closest && e.target.closest('#cfs_applySchool')){
        e.preventDefault(); e.stopImmediatePropagation();
        AS47.refuse('An Advanced School keeps your earlier training. Use further basic training after Advanced Rank 3.');
      }
    }, true);
    ['input', 'change'].forEach(function(type){
      document.addEventListener(type, function(e){
        if(AS47.record() && e.target.id === 'f_school'){
          const list = getSchoolsList();
          e.target.value = list.length ? list[list.length - 1].name : '';
          e.stopImmediatePropagation();
          AS47.refuse('The earlier School is preserved with your Advanced School training.');
        }
      }, true);
    });
    const as47BasicCap = computeCappedActiveRank;
    computeCappedActiveRank = function(list, pts){
      const rank = as47BasicCap.apply(this, arguments), record = AS47.record();
      if(!record || !list.length || list[list.length - 1].frozen) return rank;
      const frozen = list.slice(0, -1).reduce(function(sum, e){ return sum + (e.frozenRank || 0); }, 0);
      return Math.min(rank, Math.max(0, calculateSchoolRank(pts).rank - frozen - AS47.rank()));
    };
    const as47AddBasic = addSchoolToCharacter;
    addSchoolToCharacter = function(name){
      const r = AS47.record();
      if(r && (!AS47.management() || AS47.rank() < 3 || !r.allowBasic)) return AS47.refuse('Finish the Advanced School and confirm GM permission before further basic training.');
      const result = as47AddBasic.apply(this, arguments);
      if(r && getSchoolsList().some(function(e){ return !e.frozen; })){ r.earnedRank = 3; r.resumed = true; AS47.save(r); AS47.refresh(); }
      return result;
    };
    // All accepted loads supply the field, including current-format saves without it.
    // Refused loads reach the original refusal untouched and preserve the open character.
    VersionManager.register(VersionManager.current(), AS47.STEP_NAME, function(data){
      if(data && data.fields && data.fields[AS47.FIELD] === undefined) data.fields[AS47.FIELD] = '';
      return data;
    });
    const as47Apply = applyData;
    applyData = function(data){
      const kind = VersionManager.classify(data);
      if(kind === 'invalid' || kind === 'newer' || VersionManager.bypass) return as47Apply.apply(this, arguments);
      const copy = JSON.parse(JSON.stringify(data)), raw = copy.fields[AS47.FIELD];
      if(raw){
        let record;
        try { record = JSON.parse(raw); } catch(e){ record = null; }
        if(!AS47.valid(record)){ appAlert('This save has an invalid Advanced School record. It has not been loaded.'); return false; }
      }
      copy.fields[AS47.FIELD] = raw || '';
      return as47Apply.call(this, copy);
    };
    if(typeof MODES12 === 'object' && MODES12 && typeof MODES12.register === 'function'){
      MODES12.register('#advancedSchoolPanel select, #advancedSchoolPanel input, #advancedSchoolPanel button');
      const as47ModesRefresh = MODES12.refresh;
      MODES12.refresh = function(){ const result = as47ModesRefresh.apply(this, arguments); AS47.refresh(); return result; };
    }
    ['f_honorRank', 'f_honorPts', 'f_family', 'f_gender'].forEach(function(id){
      const field = document.getElementById(id); if(field) field.addEventListener('input', AS47.refresh);
    });
    const as47Errors = AS47.assertCatalogue();
    if(as47Errors.length) console.error('Advanced Schools: ' + as47Errors.join('; '));
  }
  // ============ END PART I PHASE 4.7 END AS47 ============
