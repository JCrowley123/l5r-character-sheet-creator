  // PART I PHASE 4.7.2 — Missing Basic Schools
  const MISSING_BASIC_SCHOOLS_ENABLED = true;
  const MISSING_BASIC_SCHOOL_DATA = [
    {
      id:'hiruma-scout', name:'Hiruma Scout [Bushi]', clan:'Crab', family:'Hiruma',
      benefit:'Reflexes', honor:4.5,
      skills:'Athletics, Hunting, Kenjutsu, Kyujutsu, Lore: Shadowlands, Stealth (Sneaking), any one Bugei Skill',
      outfit:'', source:'Imperial Histories p.147 (no outfit specified)',
      tech:["Dance the Razor's Edge",'Run Like the Wind','Veil of the Spirits','Harness the Wind','Strike of the Stalker'],
      descriptions:[
        'Unless surprised or otherwise unaware, add Stealth Rank to Initiative. Food, water and jade rations last twice as long for a number of people equal to Hunting Rank. In the Shadowlands, gain +1k0 to Stealth and always know the direction and approximate distance to the Empire.',
        'You may take Free or Simple Move Actions in Full Defense. Run at high speed for Stamina plus School Rank hours, then become Exhausted until you rest for one hour.',
        'While remaining still with cover, concealment or camouflage approved by the GM, spend 1 Void Point to add School Rank kept dice to Stealth. The benefit ends if you move or make noise.',
        'Make attacks with Samurai weapons, knives or bows as Simple Actions. Against Shadowlands creatures or known Tainted nonhumans, this applies with any weapon.',
        'Against a surprised or unaware opponent, your Raises have no Void-based limit and you ignore 10 points of Reduction.'
      ]
    },
    {
      id:'yotsu-bushi', name:'Yotsu Bushi School (Heroes of Rokugan) [Bushi]', clan:'Tiger', family:'Yotsu',
      benefit:'Agility', honor:5.5,
      skills:'Commerce, Hunting, Kenjutsu, Kyujutsu, any one Skill from Lore: Gaijin or Lore: Shadowlands, Stealth (Sneaking), any one Low or Bugei Skill',
      outfit:'Daisho, Light or Ashigaru Armor, two other weapons, Sturdy Clothing, Traveling Pack, 4 koku',
      source:'Imperial Histories pp.276–277; Tiger Clan in the Heroes of Rokugan alternate timeline',
      tech:["The Tiger's Tread","The Tiger's Pounce",'Rending Claws','Shelter the Blameless (Yotsu Bushi)',"The Tiger's Fangs"],
      descriptions:[
        'Against enemies of the Empire, halve Honor losses from the Ambush and Shadowing uses of Stealth, rounding down. In urban areas, including ruins, gain +1k0 to Stealth and add Stealth Rank to Armor TN.',
        'In the first Round of a skirmish, add Stealth Rank to Initiative. This bonus ends at the Reactions Stage.',
        'Make attacks with Samurai weapons as Simple Actions.',
        'While actively defending or protecting another person, as determined by the GM, gain 1 bonus Void Point for that Round. Any unspent bonus point expires at the end of the Round.',
        'During the first Round of a skirmish, Maneuvers require one fewer Raise.'
      ]
    }
  ];
  const BASIC47 = (function(){
    const api = {};
    api.loreChoice = 'any one Skill from Lore: Gaijin or Lore: Shadowlands';
    api.install = function(){
      const scout = MISSING_BASIC_SCHOOL_DATA[0], yotsu = MISSING_BASIC_SCHOOL_DATA[1];
      SCHOOL_LIBRARY.Crab.push(scout);
      MINOR_CLAN_LIBRARY.Tiger = [['Yotsu','Intelligence']];
      MINOR_CLAN_SCHOOL_LIBRARY.Tiger = [yotsu];
      MISSING_BASIC_SCHOOL_DATA.forEach(school => {
        ALL_SCHOOL_TECHNIQUES[school.name] = school.tech.slice();
        school.tech.forEach((name,i) => {
          if(Object.prototype.hasOwnProperty.call(TECH_DESCRIPTIONS,name)) throw new Error('New School Technique conflicts with existing text: '+name);
          TECH_DESCRIPTIONS[name] = school.descriptions[i] + ' (' + school.source + ')';
        });
      });
      // The qualified Rank 4 title leaves the existing Sword of Yotsu Path intact.
      // Once the Scout is in the library, its formerly unavailable Path clauses resolve normally.
      if(typeof AP46 === 'object' && AP46 && AP46.enabled()){
        ALTERNATE_PATH_LIBRARY.forEach(p => (p.replaces || []).forEach(c => {
          if(c.school === 'Hiruma Scout' && c.notInSheet) delete c.notInSheet;
        }));
      }
      // Reuse the wizard's existing free-choice flow, limiting this particular slot to the
      // two printed Lore subjects. Neither subject becomes a fictitious Emphasis or free third Skill.
      if(typeof CW1122 === 'object' && CW1122){
        const priorGroups = CW1122.groupsForSpec;
        CW1122.groupsForSpec = function(spec){
          if(String(spec.text).toLowerCase() === api.loreChoice.toLowerCase()) return [{label:'High',options:['Lore: Gaijin','Lore: Shadowlands']}];
          return priorGroups.apply(this,arguments);
        };
      }
      if(typeof CW1121 === 'object' && CW1121){
        const priorAddSkill = CW1121.addSkill;
        CW1121.addSkill = function(name, subject, asSchool){
          if((document.getElementById('f_school') || {}).value === yotsu.name && !subject && /^Lore: (Gaijin|Shadowlands)$/.test(name)){
            return priorAddSkill.call(this,'Lore',name.slice(6),asSchool);
          }
          return priorAddSkill.apply(this,arguments);
        };
      }
      const minor = document.getElementById('cfs_minorClan');
      if(minor && !Array.from(minor.options).some(o => o.value === 'Tiger')) minor.add(new Option('Tiger','Tiger'));
      refreshSchoolOptions();
      refreshMultipleSchoolsUI();
    };
    return api;
  })();
  if(MISSING_BASIC_SCHOOLS_ENABLED) BASIC47.install();
  // END PART I PHASE 4.7.2
  
