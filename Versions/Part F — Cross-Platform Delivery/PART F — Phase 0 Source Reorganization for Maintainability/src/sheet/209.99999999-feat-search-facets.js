  // ============ PART K PHASE 14.1 — SEARCH FACETS: LOGIC ============
  // Data layer only: each category's facets, read from SEARCH14's records; no DOM, no writes.
  // Interface: FACETS141.has(category), .facets(category), .query(options), .invalidate().
  // filters: { facetId: [value, ...] }. Any value within a facet, every facet across.
  const SEARCH_FACETS_ENABLED = true;

  const FACETS141 = (function(){
    const api = {};
    const ALL = 1000000;
    const RINGS = ['Air', 'Earth', 'Fire', 'Water', 'Void'];
    let cache = {};

    api.enabled = function(){
      return SEARCH_FACETS_ENABLED && typeof SEARCH14 === 'object' && !!SEARCH14 && SEARCH14.enabled();
    };

    function field(rec, label){
      const f = rec.fields.find(function(x){ return x.label === label; });
      return f ? f.value : '';
    }
    function split(value, sep){
      return value ? value.split(sep).map(function(s){ return s.trim(); }).filter(Boolean) : [];
    }
    function one(value){ return value ? [value] : []; }
    function points(value){ return one(value.replace(/ points?$/, '')); }
    const pts = function(v){ return v + ' points'; };
    const mastery = function(v){ return 'Mastery ' + v; };
    const rank = function(v){ return 'Rank ' + v; };

    // A facet: { id, label, values(part, record) -> [value], order: 'ring' | 'number' | undefined (A to Z), name(value) }.
    // rows(record) splits a record into parts that must each match every filter (a Technique's School and its Rank).
    const DEFS = {
      skills: { facets: [
        { id: 'trait', label: 'Trait', values: function(r){ return split(field(r, 'Trait'), ' or '); } },
        // "Weapon (Low)" is both kinds.
        { id: 'kind', label: 'Type', values: function(r){ return field(r, 'Type').match(/[A-Za-z]+/g) || []; } }] },
      advantages: { facets: [
        { id: 'type', label: 'Type', values: function(r){ return one(field(r, 'Type')); } },
        { id: 'cost', label: 'Cost', order: 'number', name: pts, values: function(r){ return points(field(r, 'Cost')); } }] },
      disadvantages: { facets: [
        { id: 'type', label: 'Type', values: function(r){ return one(field(r, 'Type')); } },
        { id: 'cost', label: 'Value', order: 'number', name: pts, values: function(r){ return points(field(r, 'Value')); } }] },
      schools: { facets: [
        { id: 'clan', label: 'Clan', values: function(r){ return split(field(r, 'Clan'), ','); } }] },
      advanced: { facets: [
        { id: 'clan', label: 'Clan', values: function(r){ return one(field(r, 'Clan')); } },
        { id: 'type', label: 'Type', values: function(r){ return split(field(r, 'Type'), ','); } }] },
      paths: { facets: [
        { id: 'rank', label: 'Technique Rank', order: 'number', name: rank, values: function(r){ return one(field(r, 'Technique Rank')); } }] },
      techniques: {
        // "Akodo Bushi, Rank 1; Matsu Berserker, Rank 2" -> one part per School.
        rows: function(r){
          return split(field(r, 'School'), ';').map(function(at){
            const m = at.match(/^(.*), Rank (\d+)$/);
            return m ? { school: m[1], rank: m[2] } : { school: at, rank: '' };
          });
        },
        facets: [
          { id: 'school', label: 'School', values: function(p){ return one(p.school); } },
          { id: 'rank', label: 'Rank', order: 'number', name: rank, values: function(p){ return one(p.rank); } }] },
      kata: { facets: [
        { id: 'ring', label: 'Ring', order: 'ring', values: function(r){ return one(field(r, 'Ring')); } },
        { id: 'mastery', label: 'Mastery', order: 'number', name: mastery, values: function(r){ return one(field(r, 'Mastery')); } }] },
      kiho: { facets: [
        { id: 'ring', label: 'Ring', order: 'ring', values: function(r){ return one(field(r, 'Ring')); } },
        { id: 'mastery', label: 'Mastery', order: 'number', name: mastery, values: function(r){ return one(field(r, 'Mastery')); } },
        { id: 'type', label: 'Type', values: function(r){ return one(field(r, 'Type')); } }] },
      spells: { group: ['element', 'mastery'], facets: [
        { id: 'element', label: 'Element', order: 'ring', values: function(r){ return one(field(r, 'Element')); } },
        { id: 'mastery', label: 'Mastery', order: 'number', name: mastery, values: function(r){ return one(field(r, 'Mastery')); } },
        { id: 'maho', label: 'Maho', name: function(v){ return v === 'Yes' ? 'Maho' : 'Not maho'; },
          values: function(r){ return [field(r, 'Maho') === 'Yes' ? 'Yes' : 'No']; } }] },
      weapons: { facets: [
        { id: 'skill', label: 'Skill', values: function(r){ return one(field(r, 'Skill')); } },
        { id: 'type', label: 'Type', values: function(r){ return one(r.type); } }] },
      clans: { facets: [
        { id: 'clan', label: 'Clan', values: function(r){
          return one(field(r, 'Clan') || (r.type === 'Clan' ? r.name.replace(/ Clan$/, '') : '')); } }] },
      ancestors: { facets: [
        { id: 'clan', label: 'Clan', values: function(r){ return one(field(r, 'Clan')); } },
        { id: 'cost', label: 'Cost', order: 'number', name: pts, values: function(r){ return points(field(r, 'Cost')); } }] }
    };

    api.has = function(category){ return api.enabled() && !!DEFS[category]; };
    api.invalidate = function(){ cache = {}; };

    function parts(def, rec){
      return (def.rows ? def.rows(rec) : [rec]).map(function(p){
        const row = {};
        def.facets.forEach(function(f){ row[f.id] = f.values(p, rec).map(String).filter(Boolean); });
        return row;
      });
    }
    // Facet values per record id, built once per category.
    function index(category){
      if(cache[category]) return cache[category];
      const def = DEFS[category], rows = {}, ids = [];
      SEARCH14.query({ category: category, limit: ALL }).results.forEach(function(s){
        const rec = SEARCH14.get(s.id);
        if(!rec) return;
        ids.push(s.id);
        rows[s.id] = parts(def, rec);
      });
      cache[category] = { ids: ids, rows: rows };
      return cache[category];
    }

    // Only this category's facets; a value or a list of values per facet.
    function active(def, filters){
      const out = {};
      def.facets.forEach(function(f){
        const v = filters ? filters[f.id] : null;
        const list = (Array.isArray(v) ? v : v == null || v === '' ? [] : [v]).map(String).filter(Boolean);
        if(list.length) out[f.id] = list;
      });
      return out;
    }
    function rowMatches(row, act, skip){
      return Object.keys(act).every(function(id){
        return id === skip || act[id].some(function(v){ return row[id].indexOf(v) >= 0; });
      });
    }
    function matches(rows, act, skip){
      if(!Object.keys(act).some(function(id){ return id !== skip; })) return true;
      return rows.some(function(row){ return rowMatches(row, act, skip); });
    }

    function sorter(f){
      return function(a, b){
        if(f.order === 'number') return (+a - +b) || (a < b ? -1 : a > b ? 1 : 0);
        if(f.order === 'ring'){
          const x = RINGS.indexOf(a), y = RINGS.indexOf(b);
          if(x !== y) return (x < 0 ? 99 : x) - (y < 0 ? 99 : y);
        }
        const p = SEARCH14.normalise(a), q = SEARCH14.normalise(b);
        return p < q ? -1 : p > q ? 1 : 0;
      };
    }
    function label(f, v){ return f.name ? f.name(v) : v; }

    // Options cover the whole category; a count is the hits this option would leave, with the other facets' filters.
    // ids: the typed text's hits before any filter.
    function facetList(def, ix, ids, act){
      return def.facets.map(function(f){
        const all = {}, counts = {};
        ix.ids.forEach(function(id){ ix.rows[id].forEach(function(row){ row[f.id].forEach(function(v){ all[v] = true; }); }); });
        ids.forEach(function(id){
          const seen = {};
          ix.rows[id].forEach(function(row){
            if(!rowMatches(row, act, f.id)) return;
            row[f.id].forEach(function(v){ if(!seen[v]){ seen[v] = true; counts[v] = (counts[v] || 0) + 1; } });
          });
        });
        const chosen = act[f.id] || [];
        return { id: f.id, label: f.label, options: Object.keys(all).sort(sorter(f)).map(function(v){
          return { value: v, label: label(f, v), count: counts[v] || 0, selected: chosen.indexOf(v) >= 0 }; }) };
      });
    }

    api.facets = function(category){
      return api.has(category) ? api.query({ category: category, limit: 0 }).facets : [];
    };

    // options: SEARCH14.query's ({ text, category, offset, limit }) plus filters.
    // Returns SEARCH14.query's shape plus facets, the filters applied, and grouped (each result then has group: [labels]).
    // A category's group order applies while no text is typed; typed text keeps SEARCH14's ranking.
    api.query = function(options){
      const o = options || {};
      const offset = Math.max(0, o.offset | 0);
      const limit = o.limit == null ? 50 : Math.max(0, o.limit | 0);
      const base = SEARCH14.query({ text: o.text, category: o.category, limit: ALL });
      const def = api.has(o.category) ? DEFS[o.category] : null;
      if(!def){
        return { total: base.total, offset: offset, results: base.results.slice(offset, offset + limit),
          facets: [], filters: {}, grouped: false };
      }
      const ix = index(o.category), act = active(def, o.filters);
      const found = base.results.filter(function(r){ return !!ix.rows[r.id]; });
      let hits = found.filter(function(r){ return matches(ix.rows[r.id], act); });
      const grouped = !!def.group && !SEARCH14.normalise(o.text);
      if(grouped){
        const fs = def.group.map(function(id){ return def.facets.find(function(f){ return f.id === id; }); });
        const key = function(r){ const row = ix.rows[r.id][0] || {}; return fs.map(function(f){ return (row[f.id] || [])[0] || ''; }); };
        // Stable: SEARCH14's A to Z order holds within each group.
        hits = hits.map(function(r){ return { r: r, k: key(r) }; }).sort(function(a, b){
          for(let i = 0; i < fs.length; i++){ const c = sorter(fs[i])(a.k[i], b.k[i]); if(c) return c; }
          return 0;
        }).map(function(x){ x.r.group = x.k.map(function(v, i){ return label(fs[i], v); }); return x.r; });
      }
      return { total: hits.length, offset: offset, results: hits.slice(offset, offset + limit),
        facets: facetList(def, ix, found.map(function(r){ return r.id; }), act), filters: act, grouped: grouped };
    };

    // SEARCH14 rebuilds its records after these; the facet values follow.
    if(api.enabled()) ['invalidate', 'registerSource'].forEach(function(name){
      const base = SEARCH14[name];
      SEARCH14[name] = function(){ cache = {}; return base.apply(this, arguments); };
    });

    return api;
  })();
  // ============ END PART K PHASE 14.1 FACETS141 ============
