  // BUGFIX BK7: the Scorpion Instigator's Blackmail on four different people is checked, not confirmed (owner ruling
  // R17, 23 October 2026; Core pp.249-250, and p.146: one Blackmail is bought per person). Each configured Blackmail
  // row counts once per target name, trimmed, in any case. The Dark Secret disclosure stays a confirmation.
  const INSTIGATOR_BLACKMAIL_ENABLED = true;
  const BK7Logic = {
    CONFIRMATION:'instigator-four-blackmail-targets',
    BARE:'the Blackmail Advantage',
    // targets: the target names of the configured Blackmail rows.
    distinct(targets){
      const seen = {};
      (targets || []).forEach(t => { const key = String(t || '').trim().toLowerCase(); if(key) seen[key] = true; });
      return Object.keys(seen).length;
    },
    message(need, have){ return 'Blackmail on ' + need + ' different people (' + have + ' recorded)'; },
    // A School's unmet requirements with the count in place of the bare Blackmail line.
    unmet(list, need, have){
      const out = (list || []).filter(u => u !== BK7Logic.BARE);
      if(have < need) out.push(BK7Logic.message(need, have));
      return out;
    }
  };
  const BK7 = (() => {
    const api = {};
    api.enabled = () => INSTIGATOR_BLACKMAIL_ENABLED && typeof AS47 === 'object' && !!AS47 && AS47.enabled() &&
      typeof N4513 === 'object' && !!N4513 && N4513.enabled();
    api.targets = () => {
      const schema = advConfigSchemaFor('Blackmail');
      return Array.from(document.querySelectorAll('#advList .entry')).filter(div => {
        const name = div.querySelector('.en-name');
        return name && normalizeAdvName(name.value) === 'blackmail';
      }).map(div => readAdvConfig(div)).filter(c => N4513.complete(schema, c)).map(c => c.target);
    };
    api.count = () => BK7Logic.distinct(api.targets());
    if(api.enabled()){
      ADVANCED_SCHOOL_LIBRARY.forEach(entry => {
        if(entry.special && entry.special.blackmailDistinctPeople) entry.narrative = entry.narrative.filter(n => n.id !== BK7Logic.CONFIRMATION);
      });
      const bk7Unmet = AS47.unmet;
      AS47.unmet = function(entry){
        const unmet = bk7Unmet.apply(this, arguments), need = entry && entry.special && entry.special.blackmailDistinctPeople;
        return need ? BK7Logic.unmet(unmet, need, api.count()) : unmet;
      };
      AS47.refresh();
    }
    return api;
  })();
