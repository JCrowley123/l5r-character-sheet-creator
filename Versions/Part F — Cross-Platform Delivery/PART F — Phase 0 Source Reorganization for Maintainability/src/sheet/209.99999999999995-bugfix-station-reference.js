  // BUGFIX SH7: The World of the Daimyo, The Daimyo's Path and Child of Chikushudo as Search reference entries (owner
  // ruling R11, 23 October 2026; Search only, the owner's answer of 29 October), beside the Naga and Nezumi ones. The
  // sheet holds neither Emerald Empire's Stations nor the shapeshifter abilities, so none is in the Advantage list.
  const STATION_REFERENCE_ENABLED = true;
  const SH7 = (() => {
    const api = {ID:'station-shapeshifter', LABEL:'Stations and Shapeshifters'};
    api.enabled = () => STATION_REFERENCE_ENABLED && typeof SEARCH14 === 'object' && !!SEARCH14 && SEARCH14.enabled();
    // [name, type, cost, book and page, in our own words, what the sheet does not apply]
    api.ENTRIES = [
      ['The World of the Daimyo', 'Social', '5', 'Emerald Empire p.279',
        'Grants 5 Duty Points to spend on any Station’s Features. May be bought again; each further level costs 3 more XP than the last.',
        'the sheet does not apply Emerald Empire’s Station rules.'],
      ['The Daimyo’s Path', 'Social', '10', 'Emerald Empire p.279',
        'Grants 8 Duty Points for any Station’s Features and opens Level Three Features of the character’s primary Station only. Requires The World of the Daimyo.',
        'the sheet does not apply Emerald Empire’s Station rules.'],
      ['Child of Chikushudo', 'Spiritual', '7', 'Enemies of the Empire p.244',
        'Descended from a spirit of another realm: one Minor Shapeshifter Ability (GM approval) with a special penalty, rolled or agreed with the GM (for example a Social roll penalty, a stutter, or Wounds on each use).',
        'the sheet does not apply the shapeshifter rules.']
    ];
    api.records = () => api.ENTRIES.map(e => ({name:e[0], type:'Advantage', tags:['Reference only', e[1]], source:e[3],
      fields:[{label:'Type', value:e[1]}, {label:'Cost', value:e[2] + ' points'}],
      text:[e[4], 'Reference only: ' + e[5] + ' Not in the Advantage list.']}));
    api.install = () => api.enabled() && SEARCH14.registerSource({id:api.ID, label:api.LABEL, group:'Clans', read:api.records});
    return api;
  })();
  SH7.install();
