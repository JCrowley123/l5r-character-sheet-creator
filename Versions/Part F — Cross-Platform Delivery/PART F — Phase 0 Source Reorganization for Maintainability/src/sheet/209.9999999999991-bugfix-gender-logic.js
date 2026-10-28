  // BUGFIX GI7: Identity's Gender meets a gender requirement, and the wizard asks gender and age after Name
  // (owner ruling R15, 23 October 2026). Only a clear word counts; anything else leaves the requirement to the
  // player's tick, and a later Identity edit never changes a School already joined.
  const GENDER_IDENTITY_ENABLED = true;
  const GI7Logic = {
    WORDS: {female:['female', 'f', 'woman', 'girl', 'lady'], male:['male', 'm', 'man', 'boy']},
    // Requirements the sheet can read: an Advanced School confirmation id and the gender it needs.
    REQUIREMENTS: {'lions-pride-female':'female'},
    read(text){
      const t = String(text || '').trim().toLowerCase().replace(/[.!]+$/, '');
      if(!t) return '';
      return Object.keys(GI7Logic.WORDS).find(g => GI7Logic.WORDS[g].indexOf(t) !== -1) || '?';
    },
    // 'match', 'conflict' or 'unknown' (empty or unclear) for one confirmation id; '' when it asks no gender.
    status(id, text){
      const need = GI7Logic.REQUIREMENTS[id];
      if(!need) return '';
      const g = GI7Logic.read(text);
      return g === need ? 'match' : (g === '' || g === '?') ? 'unknown' : 'conflict';
    },
    // The confirmations Identity meets by itself.
    met(ids, text){ return (ids || []).filter(id => GI7Logic.status(id, text) === 'match'); }
  };
  const GI7 = (() => {
    const api = {};
    api.enabled = () => GENDER_IDENTITY_ENABLED;
    api.gender = () => (document.getElementById('f_gender') || {}).value || '';
    // A School's choices with the confirmations Identity meets added.
    api.choices = (entry, choices) => {
      const c = Object.assign({}, choices || {});
      const ids = entry && Array.isArray(entry.narrative) ? entry.narrative.map(n => n.id) : [];
      const have = Array.isArray(c.confirmations) ? c.confirmations.slice() : [];
      GI7Logic.met(ids, api.gender()).forEach(id => { if(have.indexOf(id) === -1) have.push(id); });
      c.confirmations = have;
      return c;
    };
    if(api.enabled() && typeof AS47 === 'object' && AS47 && typeof AS47.enter === 'function'){
      const enter = AS47.enter, uiChoices = AS47.uiChoices;
      AS47.enter = function(name, choices){ return enter.call(this, name, api.choices(AS47.find(name), choices)); };
      AS47.uiChoices = function(){
        return api.choices(AS47.find((document.getElementById('advancedSchoolPicker') || {}).value), uiChoices.apply(this, arguments));
      };
    }
    return api;
  })();
