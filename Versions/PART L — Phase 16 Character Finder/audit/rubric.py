"""The rating audit's rubric: a plain-words definition for every label, Home, complexity and "how unusual" level,
and the evidence that supports each one. Approved method: DESIGN.md section 10 (owner, 25 November 2026).

A definition says what must be TRUE of a School for the rating to hold. The patterns are only how the automatic
pass (step 2) looks for evidence in the app's own text; a pattern match is evidence to weigh, not a verdict.

Evidence weights used by rater.py:
  a Technique that matches    2 each (Techniques define how a School plays)
  the description             2
  the Clan (Homes only)       2
  a School Skill              1
  the Outfit                  1
A rating is BACKED at 2 or more, WEAK at 1, and has NO EVIDENCE at 0. An unrated label scoring 4 or more is
SUGGESTED. Anything not backed goes to the book-reading pass (step 3).
"""

LABELS = {
 'frontline': ("Built to stand in melee and take hits: heavy weapons or armour, Reduction, endurance.",
    [r'Heavy Weapons', r'Polearms', r'Spears'],
    [r'\bReduction\b', r'heavy armou?r', r'Heavy Weapons?\b', r'\bmelee\b', r'front line', r'\bendur', r'heavy infantry', r"enemy's worst", r'keep fighting']),
 'duelist': ("Excels in one-on-one duels: iaijutsu, Focus and Strike, or a School built around the duel.",
    [r'Iaijutsu'],
    [r'\bduel', r'\biaijutsu', r'\bFocus\b', r'one-on-one', r'single combat', r'perfect strike']),
 'archer': ("Fights with the bow: teaches Kyujutsu, and a Technique or the description centres on bows.",
    [r'Kyujutsu'],
    [r'\bbows?\b', r'\barrows?\b', r'\bKyujutsu', r'\barcher', r'\barchery', r'\branged attack']),
 'cavalry': ("Fights from horseback: a Technique works mounted, or the description centres on riding.",
    [r'Horsemanship'],
    [r'\bhorse', r'\bmounted\b', r'horseback', r'\bsteeds?\b', r'\bcavalry', r'\briders?\b', r'\briding\b']),
 'unarmed': ("Fights without weapons: grappling, wrestling or martial arts.",
    [r'Jiujutsu'],
    [r'\bunarmed', r'\bgrappl', r'\bwrestl', r'\bJiujutsu', r'\bfists?\b', r'martial arts', r'bare hand']),
 'skirmisher': ("Fast and mobile: movement, Initiative or hit-and-run Techniques.",
    [],
    [r'Move Action', r'\bInitiative\b', r'hit-and-run', r'\bevade', r'\bmobil', r'lightning speed', r'\bspeed\b', r'from every side', r'strike and']),
 'bodyguard': ("Protects others: yojimbo, guarding a charge, defending allies.",
    [],
    [r'\bprotect', r'\bguard', r'\byojimbo', r'\bbodyguard', r'\bcharge\b', r'defend(ing)? (another|others|an ally)', r'the one they protect']),
 'commander': ("Leads troops: Battle, mass battle, or bonuses to allies in a skirmish.",
    [r'\bBattle\b'],
    [r'\bmass battle', r'Battle Table', r'\barmy\b', r'\btroops\b', r'\bcommand', r'\btactic', r'study of battle', r"allies'? Initiative", r'\blead(s|ing)? troops']),
 'all-out': ("Holds nothing back: Full Attack, fearless or reckless commitment to the attack.",
    [],
    [r'Full Attack', r'\breckless', r'\bfearless', r'commitment to the attack', r'\bberserk', r'\bfrenz', r'\bunrestrained', r'violent physical action']),
 'monster-hunter': ("Hunts Shadowlands creatures, the Tainted, maho-tsukai or otherworldly beings.",
    [r'Lore: Shadowlands', r'Lore: Maho', r'Lore: Spirit Realms'],
    [r'\bShadowlands\b', r'\bTainted\b', r'\bTaint\b', r'\bmaho', r'\boni\b', r'\bmonsters?\b', r'\bcreatures?\b', r'otherworldly', r'non-?human', r'\bJade\b', r'\bcrystal']),
 'stealth': ("Works unseen: Stealth, ambush, disguise, infiltration or scouting.",
    [r'Stealth', r'Ninjutsu'],
    [r'\bStealth', r'\bambush', r'\bunaware', r'\bsurprised\b', r'\bhidden\b', r'\bunseen', r'\binfiltrat', r'\bdisguise', r'\bscout', r'\bsneak', r'\bshadows?\b']),
 'diplomat': ("Wins people over: courtesy, alliances, favours, mediation and calm.",
    [r'Courtier', r'Etiquette', r'Sincerity'],
    [r'\bCourtier\b', r'\bEtiquette', r'\bcourtesy', r'\ballies\b', r'\bfavou?rs?\b', r'\bmediat', r'\bcalm', r'\bpeace', r'\bdiplomat', r'defuse', r'build trust']),
 'schemer': ("Gets their way by secrets, leverage, deceit or fear.",
    [r'Intimidation', r'Temptation', r'Deceit', r'Forgery', r'Sleight of Hand'],
    [r'\bblackmail', r'\bsecrets?\b', r'\bDeceit', r'\bdeceiv', r'\bmanipulat', r'\bIntimidation', r'\bTemptation', r'\bleverage', r'\bdiscord', r'\bbully', r'dirty tricks?', r'\bpoison', r'\bsuspicion']),
 'investigator': ("Finds the truth: Investigation, evidence, interrogation, magistrates and hunting fugitives.",
    [r'Investigation'],
    [r'\bInvestigation', r'\binvestigat', r'\bevidence', r'\bclues?\b', r'\binterrogat', r'\bmagistrate', r'\bfugitive', r'\bbounty', r'\btruth\b']),
 'scholar': ("Knows things: several Lore Skills, study, learning or libraries.",
    [],
    [r'\bLore\b', r'\bknowledge', r'\bstud(y|ies|ied)', r'\bscholar', r'\blibrar', r'\blearning', r'\bhistor']),
 'artist': ("Creates or performs: art, performance, storytelling, beauty.",
    [r'Artisan', r'Perform', r'Acting', r'Tea Ceremony'],
    [r'\bart\b', r'\bartist', r'\bArtisan', r'\bPerform', r'\bbeauty', r'\bstor(y|ies|ytell)', r'\bpoe(m|try)', r'\bmusic', r'\bpaint']),
 'merchant': ("Trades: Commerce, koku, wealth, smuggling.",
    [r'Commerce'],
    [r'\bkoku\b', r'\btrade', r'\bmerchant', r'\bCommerce', r'\bwealth', r'\bsmuggl', r'\bgoods\b', r'\bprice']),
 'craft': ("Makes things: Craft, smithing, engineering, building.",
    [r'Craft', r'Engineering'],
    [r'\bCraft', r'\bforg(e|es|ing)\b', r'\bsmith', r'\bengineer', r'\bbuild', r'\bsiege']),
 'healer': ("Heals: Medicine, healing magic, tending the sick.",
    [r'Medicine'],
    [r'\bheal', r'\bMedicine', r'\btend(s|ing)? (the )?(sick|wounded)', r'\bcure', r'recover(s|ing)? Wounds', r'preserving life']),
 'protector-magic': ("A spellcaster whose magic wards, shields and protects.",
    [],
    [r'\bwards?\b', r'\bprotect', r'\bshield', r'\bdefen[cs]', r'last line of defen']),
 'battle-magic': ("A spellcaster whose magic destroys enemies.",
    [],
    [r'\bdamage spells?', r'\bdestr(oy|uction|uctive)', r'battle magic', r'large-scale', r'Spell Casting Rolls?.*attack', r'\bdamage\b']),
 'spirits': ("Deals with spirits, ancestors, the dead, the Fortunes or the Spirit Realms.",
    [r'Lore: Spirit Realms', r'Divination'],
    [r'\bspirits?\b', r'\bancestors?\b', r'\bthe dead\b', r'\bghosts?\b', r'Spirit Realms?', r'\bFortunes?\b', r'\bomens?\b']),
 'nature': ("Tied to nature: animals, forests, weather, the sea and storms.",
    [r'Animal Handling', r'Hunting'],
    [r'\banimals?\b', r'\bforests?\b', r'\bweather', r'\bstorms?\b', r'\bthe sea\b', r'\bnature\b', r'\bwild\b']),
 'strange-magic': ("Unusual magic: alchemy, experiment, talismans, foreign or multi-element spells.",
    [],
    [r'\bunconventional', r'\balchemy', r'\bexperiment', r'\btalisman', r'\bmeishodo', r'\bforeign', r'several elements', r'prepared liquids', r'death gods']),
 'forbidden': ("Uses forbidden power: maho, blood magic, the Nothing.",
    [],
    [r'blood magic', r'the Nothing', r'Lying Darkness', r'\bmaho\b(?! ?-?tsukai)', r'own Taint', r'feed on']),
 'mystic': ("Spiritual discipline: meditation, enlightenment, the Void, tattoos, kiho.",
    [r'Meditation', r'Theology'],
    [r'\benlighten', r'\bmeditat', r'\btattoo', r'\bmystic', r'\bkiho', r'\bTao\b', r'\bShinsei', r'Void Ring', r'\bthe Void\b', r'\bcontemplat', r'\bmonks?\b']),
 'beast': ("Fights or works with an animal companion.",
    [r'Animal Handling'],
    [r'\bfalcons?\b', r'war-?cats?', r'\banimal companion', r'\bbond with', r'\bhounds?\b', r'\bbats?\b']),
 'sailor': ("At home on ships: Sailing, sea fighting, pirates.",
    [r'Sailing'],
    [r'\bships?\b', r'\bsea\b', r'\bsail', r'\bboats?\b', r'\bpirates?\b', r'\bdeck\b', r'\bislands?\b']),
 'traveller': ("Always on the move: wanderers, roads, journeys beyond their Clan's lands.",
    [],
    [r'\btravel', r'\broam', r'\bwander', r'\bjourney', r'\broads?\b', r'beyond the Empire', r'\bmessengers?\b', r'\bnomad', r'ignoring borders', r'every corner']),
}

HOMES = {
 'wall': ("The Kaiu Wall and the Shadowlands border: a Crab School, or one the description places there.",
    ['Crab'], [r'\bWall\b', r'\bShadowlands\b']),
 'court': ("Courts and castles: a Courtier School, or the description centres on court life.",
    ['Crane', 'Scorpion', 'Imperial'], [r'\bcourts?\b', r'\bcourtiers?\b', r'\bcastles?\b', r'\bpalace']),
 'mountains': ("Mountains and monasteries.",
    ['Dragon', 'Dragonfly'], [r'\bmountains?\b', r'\bmonaster']),
 'library': ("Libraries, temples and places of study.",
    ['Phoenix'], [r'\blibrar', r'\btemples?\b', r'\bstud(y|ies)', r'\bscholar']),
 'plains': ("The open plains, on horseback.",
    ['Unicorn', 'Ox'], [r'\bplains\b', r'\bhorse', r'\bcavalry', r'\bsteeds?\b']),
 'sea': ("The sea, islands and ports.",
    ['Mantis'], [r'\bsea\b', r'\bships?\b', r'\bislands?\b', r'\bports?\b', r'\bpirates?\b', r'\bsmuggl']),
 'battlefield': ("Battlefields, armies and soldiers.",
    ['Lion'], [r'\bbattles?\b', r'\barmy\b', r'\barmies\b', r'\btroops\b', r'\bsoldiers?\b', r'\bwar\b']),
 'wilds': ("Forests and wild places.",
    ['Fox'], [r'\bforests?\b', r'\bwild', r'\bhunt(ing)?\b', r'\bwilderness']),
 'underworld': ("City streets, the underworld, criminals and shadows.",
    ['Tortoise', 'Spider'], [r'\bcriminals?\b', r'\bunderworld', r'\bsmuggl', r'\binfiltrat', r'\bcit(y|ies)\b', r'\bstreets?\b', r'\bninja', r'\bshinobi', r'\bthie(f|ves)']),
 'road': ("The road: wanderers, messengers, travelling monks.",
    ['Brotherhood of Shinsei'], [r'\broam', r'\btravel', r'\bwander', r'\broads?\b', r'\bmessengers?\b', r'\bjourney', r'ignoring borders']),
}

COMPLEXITY = {
 3: "Involved: casts spells, uses kiho, or uses tattoos.",
 2: "Some extra: the Rank 1 Technique has a condition, a choice, a cost, or uses a subsystem (duels, mounted combat, contested rolls, stealth).",
 1: "Straightforward: the Rank 1 Technique is a constant bonus with no condition, choice or cost.",
}
# Words in the Rank 1 Technique that mean a condition, a choice, a cost or a subsystem.
CONDITION_WORDS = [r'\bwhen\b', r'\bwhile\b', r'\bif\b', r'\bunless\b', r'\bagainst\b', r'\bonce per\b', r'\bspend', r'\bchoose',
                   r'\binstead\b', r'\bContested', r'\bduel', r'\bFocus\b', r'\bmounted', r'horseback', r'\bStealth', r'\bunaware',
                   r'\bsurprised', r'\bVoid Point', r'\bRaises?\b', r'\bper\b', r'\bfirst Round']

NICHE = {
 1: "Common: a Great Clan School printed in the Core Rulebook, and none of the Unusual conditions.",
 2: "Uncommon: everything else that is not Unusual (supplements, Minor Clans, Imperial families, the Brotherhood).",
 3: "Unusual: Spider Clan, ninja, a heretical or controversial order, one historical era or an alternate timeline, or a destroyed Clan.",
}
GREAT_CLANS = ['Crab', 'Crane', 'Dragon', 'Lion', 'Phoenix', 'Scorpion', 'Unicorn', 'Mantis']
UNUSUAL_TEXT = [r'\bheres(y|ies)\b', r'\bheretical', r'\bbanned\b', r'\bcontroversial', r'\bcult-?like', r'Heroes of Rokugan',
                r'Togashi Dynasty', r'alternate timeline', r'Hidden Emperor era', r'\bthat era\b', r'short-lived']
