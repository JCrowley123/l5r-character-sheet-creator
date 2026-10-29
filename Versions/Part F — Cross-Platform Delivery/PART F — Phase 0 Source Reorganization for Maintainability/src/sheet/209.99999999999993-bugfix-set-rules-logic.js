  // BUGFIX SR7: the Advantage and Disadvantage sets of Core p.148 (owner ruling R23, 23 October 2026; the owner's answers
  // of 29 October: only Core's four families, and one Fortune may not both bless and curse a character). One entry of
  // each set; an Advantage rules out its partner Disadvantage; Paragon and Dark Paragon, Consumed and Failure of
  // Bushido, exclude each other. A GM may override any of it. No DOM here: rows come in as {name, choice}.
  const SET_RULES_ENABLED = true;
  const SR7Logic = (() => {
    const api = {PAGE:'Core p.148'};
    api.norm = name => String(name || '').trim().toLowerCase().replace(/[’ʼ`']/g, '\'');
    const slug = name => api.norm(name).replace(/'/g, '').replace(/[^a-z0-9]+/g, '-');
    // One row per set: the entry that is the set, and the saved field holding its choice.
    api.SETS = [
      {set:'Paragon', field:'tenet'},
      {set:'Failure of Bushido', field:'tenet'},
      {set:'Dark Paragon', field:'precept'},
      {set:'Consumed', field:'tenet'},
      {set:'Seven Fortunes’ Blessing', field:'fortune', short:'Blessing'},
      {set:'Seven Fortunes’ Curse', field:'fortune', short:'Curse'},
      {set:'Touch of the Spirit Realms', field:'realm'},
      {set:'Cursed by the Realm', field:'realm'}
    ];
    // Pairs that cannot both be held; `same` applies only when both rows hold that same choice.
    api.EXCLUDES = [
      ['Paragon', 'Dark Paragon'],
      ['Consumed', 'Failure of Bushido'],
      ['Paragon', 'Failure of Bushido'],
      ['Dark Paragon', 'Consumed'],
      ['Touch of the Spirit Realms', 'Cursed by the Realm'],
      ['Seven Fortunes’ Blessing', 'Seven Fortunes’ Curse', 'fortune']
    ];
    api.SETS.forEach(s => { s.key = api.norm(s.set); });
    api.setOf = name => { const key = api.norm(name); return api.SETS.find(s => s.key === key) || null; };
    api.RULES = api.EXCLUDES.map(p => ({id:slug(p[0]) + '+' + slug(p[1]), a:p[0], b:p[1], same:p[2] || '',
      label:p[2] ? 'One Fortune’s Blessing and Curse together' : p[0] + ' with ' + p[1]}))
      .concat(api.SETS.map(s => ({id:'second-' + slug(s.set), a:s.set, b:s.set, same:'', label:'A second ' + s.set})));
    api.rule = id => api.RULES.find(r => r.id === id) || null;
    // The saved override list: rule ids, in RULES order; anything unknown is dropped.
    api.parseOverrides = text => {
      let list = [];
      try { list = JSON.parse(text || '[]'); } catch(e){ list = []; }
      return Array.isArray(list) ? api.RULES.map(r => r.id).filter(id => list.indexOf(id) >= 0) : [];
    };
    api.writeOverrides = ids => { const list = api.parseOverrides(JSON.stringify(ids || [])); return list.length ? JSON.stringify(list) : ''; };
    // sx, sy: the sets of rows x and y.
    const matches = (rule, sx, sy, x, y) => {
      const pair = (sx.set === rule.a && sy.set === rule.b) || (sx.set === rule.b && sy.set === rule.a);
      return pair && (!rule.same || (!!x.choice && x.choice === y.choice));
    };
    // Every held pair: {rule, i, j, allowed}. Rows are [{name, choice}]; only rows of a set are paired.
    api.pairs = (rows, overrides) => {
      const held = (rows || []).map((x, i) => ({x, i, s:api.setOf(x.name)})).filter(h => h.s), out = [];
      held.forEach((a, m) => held.slice(m + 1).forEach(b => {
        const rule = api.RULES.find(r => matches(r, a.s, b.s, a.x, b.x));
        if(rule) out.push({rule, i:a.i, j:b.i, allowed:(overrides || []).indexOf(rule.id) >= 0});
      }));
      return out;
    };
    // The rule that rules out adding `name`, or null. With a choice: the rules that depend on the choice, for
    // choosing it on the row `skip`; without one, the rest, for adding the entry.
    api.blocked = (name, choice, rows, overrides, skip) => {
      const sx = api.setOf(name);
      if(!sx) return null;
      const x = {name, choice:choice || ''};
      for(let j = 0; j < (rows || []).length; j++){
        const sy = j === skip ? null : api.setOf(rows[j].name);
        if(!sy) continue;
        const rule = api.RULES.find(r => !r.same === (choice === undefined) && (overrides || []).indexOf(r.id) < 0 && matches(r, sx, sy, x, rows[j]));
        if(rule) return {rule, row:j, by:rows[j]};
      }
      return null;
    };
    const possessive = (by) => { const s = api.setOf(by.name); return s.short ? by.choice + '’s ' + s.short : s.set; };
    // Short, for a greyed picker option or choice.
    api.reason = hit => hit.rule.a === hit.rule.b ? 'one only (' + api.PAGE + ')' : 'ruled out by ' + possessive(hit.by) + ' (' + api.PAGE + ')';
    // A held pair, as both rows and the validator say it.
    api.text = (pair, rows) => {
      const r = pair.rule;
      if(pair.allowed) return 'GM override: ' + r.label + ' (' + api.PAGE + ').';
      const what = r.a === r.b ? api.PAGE + ': only one ' + r.a + ' may be held.'
        : r.same ? api.PAGE + ': ' + rows[pair.i].choice + ' cannot both bless and curse one character.'
        : api.PAGE + ': ' + r.a + ' and ' + r.b + ' cannot both be held.';
      return what + ' Kept as saved; your GM may allow it under GM overrides, in Management.';
    };
    return api;
  })();
