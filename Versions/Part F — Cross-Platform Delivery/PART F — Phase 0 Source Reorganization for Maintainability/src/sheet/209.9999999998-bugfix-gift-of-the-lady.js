  // ============ BUGFIX GIFTIH — THE GIFT OF THE LADY PER SCHOOL: SEARCH ============
  // "The Gift of the Lady" is two Techniques: Doji Courtier Rank 5 (Core Rulebook p.111) and The Hitomi Kikage Zumi
  // Order [Monk] Rank 1 (Imperial Histories 1 p.215). Search keyed School Techniques by name alone, so both Schools
  // showed the monk's text and one record cited the Doji page. A School's own text for a shared name (TECHNAMES'
  // table, as the sheet unlocks it) now feeds that School's entries, and a record whose Schools differ in text or page
  // becomes one record per School. Data only: no DOM or character writes. The switch GIFT_IH_FIX_ENABLED and the
  // Imperial Histories volumes are a block in 4.7.2's fragment.
  // Interface: GIFTIH.enabled(), .ownText(name, schoolName), .split(records, rows).
  var GIFTIH = (function(){
    const api = {};
    const has = function(o, k){ return !!o && Object.prototype.hasOwnProperty.call(o, k); };
    api.enabled = function(){ return typeof GIFT_IH_FIX_ENABLED !== 'undefined' && GIFT_IH_FIX_ENABLED === true; };
    // The School's own text for a Technique name Schools share, or '' (the shared text stands).
    api.ownText = function(name, schoolName){
      if(!api.enabled() || typeof TECHNAMES !== 'object' || !TECHNAMES || typeof TECHNAMES_ENABLED === 'undefined' || !TECHNAMES_ENABLED) return '';
      const own = has(TECHNAMES.BY_SCHOOL, name) ? TECHNAMES.BY_SCHOOL[name] : null;
      return has(own, schoolName) ? String(own[schoolName]) : '';
    };
    // records: Search's School Technique records, one per name. rows: every School's Techniques in Search's School
    // order, as { school, rank, name, text, source }. A record whose rows differ in text or page is replaced, in
    // place, by one record per text and page, naming only its own Schools and Ranks. Returns records.
    api.split = function(records, rows){
      if(!api.enabled() || !Array.isArray(records) || !Array.isArray(rows)) return records;
      const byName = Object.create(null);
      rows.forEach(function(row){ if(row && row.name) (byName[row.name] = byName[row.name] || []).push(row); });
      for(let i = records.length - 1; i >= 0; i--){
        const r = records[i];
        if(!r || r.type !== 'School Technique' || !byName[r.name]) continue;
        const groups = [];
        byName[r.name].forEach(function(row){
          let g = groups.find(function(x){ return x.text === row.text && x.source === row.source; });
          if(!g){ g = { text: row.text, source: row.source, at: [] }; groups.push(g); }
          const where = row.school + ', Rank ' + row.rank;
          if(g.at.indexOf(where) < 0) g.at.push(where);
        });
        if(groups.length < 2) continue;
        records.splice.apply(records, [i, 1].concat(groups.map(function(g){
          return { name: r.name, type: r.type, tags: [g.at[0] + (g.at.length > 1 ? ' and ' + (g.at.length - 1) + ' more' : '')],
            source: g.source, fields: [{ label: 'School', value: g.at.join('; ') }], text: [g.text] };
        })));
      }
      return records;
    };
    return api;
  })();
  // Earlier Search consumers may have cached entries before this layer loaded.
  if(typeof SEARCH14 !== 'undefined') SEARCH14.invalidate();
  // ============ END GIFTIH ============
