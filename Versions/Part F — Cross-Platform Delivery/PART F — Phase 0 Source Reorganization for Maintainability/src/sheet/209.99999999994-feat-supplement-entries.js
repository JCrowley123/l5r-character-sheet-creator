  // ========= PART I PHASE 4.5.37: SUPPLEMENT ADVANTAGES AND DISADVANTAGES =========
  // The catalogue entries themselves are in 021-lib-supplement-entries.js. This part:
  //   * prices five of them for a Clan, family or School type through Feature 4.5.25 (CP4525), which then fixes,
  //     notes and saves the price as it does the Core Rulebook's. Two are family prices, which 4.5.25 does not
  //     read, so an entry here may list tiers (best first) and CP4525.bookPrice is extended by property for those
  //     entries only. Spy Network's Kolat price (5) is left to the player: the sheet has no Kolat School.
  //   * lists the 23 Naga- and Nezumi-only entries in Search as reference only (owner's ruling, 22 October 2026).
  // Kill switch SUPPLEMENT_ENTRIES_ENABLED (021).
  const SUPP4537 = (function(){
    const api = {};
    api.enabled = function(){ return SUPPLEMENT_ENTRIES_ENABLED; };
    // [name, list, catalogue, [[who, price], ...] best first, page]. who: a Clan, 'family:<Family>' or a School type.
    api.PRICES = [
      ['Inheritance: Trained Falcon', 'adv', 2, [['family:Toritaka', 1]], 'Enemies of the Empire p.10'],
      ['Sage of the Sword and Fan', 'adv', 7, [['courtier', 6]], 'Sword and Fan p.202'],
      ['Spy Network', 'adv', 8, [['Scorpion', 6], ['family:Daidoji', 7]], 'Enemies of the Empire p.49'],
      ['Stolen Identity', 'adv', 6, [['Spider', 5]], 'Strongholds of the Empire p.92'],
      ['Strategist', 'adv', 5, [['Lion', 4]], 'Sword and Fan p.202'],
    ];
    const family = function(who){ return /^family:/.test(who) ? who.slice(7) : ''; };
    // The first tier the character belongs to: { price, basis }, or the catalogue price with no basis.
    api.tierPrice = function(e, f){
      for(let i = 0; i < e.tiers.length; i++){
        const who = e.tiers[i][0], fam = family(who);
        const basis = fam ? (CP4525.norm(f.family) === CP4525.norm(fam) ? fam : '') : CP4525.basis({ who:[who] }, f);
        if(basis) return { price: e.tiers[i][1], basis: basis };
      }
      return { price: e.base, basis: '' };
    };
    api.installPrices = function(){
      if(!api.enabled() || typeof CP4525 !== 'object' || !CP4525 || !CP4525.TABLE) return false;
      api.PRICES.forEach(function(r){
        // `price` and `who` are the best tier, as Search's "Clan or School price" field reads them.
        CP4525.TABLE[CP4525.norm(r[0])] = { name:r[0], list:r[1], base:r[2], price:r[3][0][1],
          who:r[3].filter(function(t){ return t[1] === r[3][0][1]; }).map(function(t){ return family(t[0]) || t[0]; }),
          tiers:r[3], source:r[4] };
      });
      const previousBookPrice = CP4525.bookPrice;
      CP4525.bookPrice = function(e, f){
        return e && Array.isArray(e.tiers) ? api.tierPrice(e, f) : previousBookPrice.apply(this, arguments);
      };
      return true;
    };
    api.installSearch = function(){
      if(!api.enabled() || typeof SEARCH14 !== 'object' || !SEARCH14 || typeof SEARCH14.registerSource !== 'function' ||
        !SEARCH14.enabled()) return false;
      // The last group on Search's home page, so its tiles keep the registry's order (after Ancestors).
      return SEARCH14.registerSource({ id: 'naga-nezumi', label: 'Naga and Nezumi', group: 'Clans', read: function(){
        return SUPPLEMENT_REFERENCE_ENTRIES.map(function(r){
          const adv = r[1] === 'adv';
          return { name: r[0], type: r[2] + (adv ? ' Advantage' : ' Disadvantage'), tags: [r[2] + ' only', r[3]],
            source: 'Enemies of the Empire p.' + r[5],
            fields: [{ label: 'Type', value: r[3] }, { label: adv ? 'Cost' : 'Value', value: r[4] + ' points' }],
            text: [r[6], 'Reference only: for ' + r[2] + ' characters, and the sheet builds none. Not in the Advantage and Disadvantage lists.'] };
        });
      } });
    };
    return api;
  })();
  SUPP4537.installPrices();
  SUPP4537.installSearch();

