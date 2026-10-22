  // ========= PART I PHASE 4.5.38: SUPPLEMENT PRICE CHOICES =========
  // Six of Phase 4.5.37's supplement entries cost (or are worth) what the player chooses. Each is one more
  // 'severityTier' / 'entryCost' entry in Phase 4.5's configuration (209.8), as Antisocial, Cast Out and Gentry are:
  // added to the list, the entry asks for its choice; the pick sets the row's cost and is saved with it. Every
  // option and number is the entry's own book text, as its description in 021 gives it. Registered by name, so with
  // Phase 4.5.37's entries absent nothing here is reachable. Kill switch SUPPLEMENT_CHOICES_ENABLED.
  const SUPPLEMENT_CHOICES_ENABLED = true;

  const SUPP4538 = (function(){
    const api = {};
    api.enabled = function(){ return SUPPLEMENT_CHOICES_ENABLED; };
    api.SCHEMAS = {
      // Strongholds of the Empire p.107.
      'Inheritance: Water Hammer Armor': { title: 'Choose the armor', prompt: 'Inheritance: Water Hammer Armor — which armor?',
        options: [{ label: 'Ashigaru armor', cost: 4 }, { label: 'Light armor', cost: 7 }, { label: 'Heavy armor', cost: 12 },
          { label: 'Riding armor', cost: 15 }] },
      // Imperial Histories 2 p.287.
      'Naga Ancestry': { title: 'Choose how it shows', prompt: 'Naga Ancestry — does your ancestry show (the GM’s option)?',
        options: [{ label: 'No visible signs', cost: 7 }, { label: 'Visible signs', cost: 5 }] },
      // Enemies of the Empire p.49.
      'Sleeper Agent': { title: 'Choose the conditioning', prompt: 'Sleeper Agent — is there a fail-safe?',
        options: [{ label: 'No fail-safe', cost: 5 }, { label: 'With a fail-safe', cost: 8 }] },
      // Imperial Histories 2 p.126.
      'The Chrysanthemum Court': { title: 'Choose the era', prompt: 'The Chrysanthemum Court — Hantei XVI’s reign (the Steel Chrysanthemum), or another era (a cruel or corrupt lord’s court)?',
        options: [{ label: 'Hantei XVI', cost: 5 }, { label: 'Another era', cost: 3 }] },
      // Strongholds of the Empire p.44.
      'Clear Water Stigma': { title: 'Choose what you lose', prompt: 'Clear Water Stigma — lose your Outfit’s koku or one weapon?',
        options: [{ label: 'All your Outfit’s koku', cost: 2 }, { label: 'One Outfit weapon', cost: 2 }] },
      // Strongholds of the Empire p.168.
      'Bounty': { title: 'Choose the offence', prompt: 'Bounty — how serious was the crime? (A bounty of 1–5, 10–15 or 20+ koku; recognised at TN 25, 15 or 10.)',
        options: [{ label: 'Minor offence', cost: 2 }, { label: 'Serious offence', cost: 4 }, { label: 'Violent or heinous', cost: 6 }] },
    };
    api.install = function(){
      if(!api.enabled() || typeof registerAdvConfigSchema !== 'function') return 0;
      return Object.keys(api.SCHEMAS).filter(function(name){
        const s = api.SCHEMAS[name];
        return registerAdvConfigSchema(name, { type: 'severityTier', effect: 'entryCost', title: s.title, prompt: s.prompt, options: s.options });
      }).length;
    };
    return api;
  })();
  SUPP4538.install();

