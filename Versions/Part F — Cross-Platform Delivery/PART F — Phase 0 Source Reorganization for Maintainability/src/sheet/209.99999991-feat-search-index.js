  // ============ PART K PHASE 14 — SEARCH: INDEX AND QUERY ============
  // Data layer only: reads the catalogues, never the DOM, never the character.
  // Interface: SEARCH14.categories(), .query(options), .get(id), .registerSource(def), .invalidate().
  // A record is plain data: { id, category, name, type, tags[], source, fields[], text[], sections[] }.
  const SEARCH_ENABLED = true;

  const SEARCH14 = (function(){
    const api = {};
    const sources = [];
    let index = null;

    api.enabled = function(){ return SEARCH_ENABLED; };

    api.normalise = function(value){
      return String(value == null ? '' : value)
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/['’‘`]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    };

    // def: { id, label, group, read }; read() returns records without id or category.
    api.registerSource = function(def){
      if(!def || typeof def.id !== 'string' || typeof def.read !== 'function') return false;
      if(sources.some(function(s){ return s.id === def.id; })) return false;
      sources.push({ id: def.id, label: def.label || def.id, group: def.group || '', read: def.read });
      index = null;
      return true;
    };
    api.invalidate = function(){ index = null; };

    function slug(text){ return api.normalise(text).replace(/ /g, '-') || 'entry'; }
    function flatten(record){
      const parts = [record.name, record.type, record.source].concat(record.tags || []);
      (record.fields || []).forEach(function(f){ parts.push(f.label, f.value); });
      (record.text || []).forEach(function(t){ parts.push(t); });
      (record.sections || []).forEach(function(s){
        parts.push(s.title);
        (s.items || []).forEach(function(i){ parts.push(i.name, i.text, i.note); });
      });
      return api.normalise(parts.filter(Boolean).join(' '));
    }

    function build(){
      const records = [], byId = {}, counts = {};
      sources.forEach(function(src, order){
        let list = [];
        try { list = src.read() || []; } catch(e){ list = []; }
        counts[src.id] = 0;
        list.forEach(function(r){
          if(!r || !r.name) return;
          let id = src.id + ':' + slug(r.name), n = 2;
          while(byId[id]) id = src.id + ':' + slug(r.name) + '-' + (n++);
          const rec = {
            id: id, category: src.id, name: String(r.name), type: r.type || src.label,
            tags: (r.tags || []).filter(Boolean).map(String), source: r.source || '',
            fields: (r.fields || []).filter(function(f){ return f && f.value !== '' && f.value != null; })
              .map(function(f){ return { label: String(f.label), value: String(f.value) }; }),
            text: (r.text || []).filter(Boolean).map(String),
            sections: (r.sections || []).filter(function(s){ return s && (s.items || []).length; })
              .map(function(s){ return { title: String(s.title), items: s.items.map(function(i){
                return { name: String(i.name || ''), text: String(i.text || ''), note: String(i.note || '') }; }) }; })
          };
          records.push({ rec: rec, order: order, n: api.normalise(rec.name),
            t: api.normalise([rec.type].concat(rec.tags).join(' ')), h: flatten(rec) });
          byId[id] = records[records.length - 1];
          counts[src.id]++;
        });
      });
      return { records: records, byId: byId, counts: counts };
    }
    function ensure(){ if(!index) index = build(); return index; }

    function copy(rec){ return JSON.parse(JSON.stringify(rec)); }
    function summary(entry){
      const r = entry.rec, src = sources[entry.order];
      return { id: r.id, category: r.category, categoryLabel: src.label, name: r.name, type: r.type, tags: r.tags.slice(), source: r.source };
    }

    api.categories = function(){
      const ix = ensure();
      return sources.map(function(s){ return { id: s.id, label: s.label, group: s.group, count: ix.counts[s.id] || 0 }; });
    };

    // Rank: 0 exact name, 1 name prefix, 2 every term starts a name word, 3 every term in the name,
    // 4 every term in the type or tags, 5 elsewhere.
    function rank(entry, q, terms){
      if(entry.n === q) return 0;
      if(entry.n.indexOf(q) === 0) return 1;
      const words = entry.n.split(' ');
      if(terms.every(function(t){ return words.some(function(w){ return w.indexOf(t) === 0; }); })) return 2;
      if(terms.every(function(t){ return entry.n.indexOf(t) >= 0; })) return 3;
      if(terms.every(function(t){ return entry.t.indexOf(t) >= 0; })) return 4;
      return 5;
    }

    // options: { text, category, offset, limit }. Empty text lists the category (or everything) A-Z.
    api.query = function(options){
      const o = options || {}, ix = ensure();
      const q = api.normalise(o.text), terms = q ? q.split(' ') : [];
      const offset = Math.max(0, o.offset | 0);
      const limit = o.limit == null ? 50 : Math.max(0, o.limit | 0);
      const hits = [];
      ix.records.forEach(function(e){
        if(o.category && e.rec.category !== o.category) return;
        if(terms.length && !terms.every(function(t){ return e.h.indexOf(t) >= 0; })) return;
        hits.push({ e: e, r: terms.length ? rank(e, q, terms) : 0 });
      });
      hits.sort(function(a, b){
        return a.r - b.r || (a.e.n < b.e.n ? -1 : a.e.n > b.e.n ? 1 : 0) || a.e.order - b.e.order;
      });
      return { total: hits.length, offset: offset,
        results: hits.slice(offset, offset + limit).map(function(h){ return summary(h.e); }) };
    };

    api.get = function(id){
      const entry = ensure().byId[id];
      return entry ? copy(entry.rec) : null;
    };

    return api;
  })();

  // ---- Sources: one per catalogue. Optional catalogues are read only when present. ----
  (function(){
    if(!SEARCH_ENABLED) return;
    const F = function(label, value){ return { label: label, value: value }; };
    const list = function(v){ return Array.isArray(v) ? v.join(', ') : (v || ''); };
    const dice = function(d){ return d ? d.roll + 'k' + d.keep : ''; };
    const SOURCE_TAIL = /\s*\(([^()]*\bpp?\.\s?\d[^()]*)\)\s*$/;
    function splitSource(text){
      const m = String(text || '').match(SOURCE_TAIL);
      return m ? { text: String(text).replace(SOURCE_TAIL, ''), source: m[1] } : { text: String(text || ''), source: '' };
    }
    function techText(name){
      return splitSource(typeof techniqueDescription === 'function' ? techniqueDescription(name) : '');
    }

    // Book pages for the Advantages and Disadvantages, from the Phase 4.5 sourcebook audit (2 October 2026).
    // A number is a Core Rulebook page.
    const ADV_PAGES = { 'Absolute Direction':146, 'Allies':146, 'Balance':146, 'Blackmail':146, 'Bland':146,
      'Blissful Betrothal':146, 'Blood of Osano-Wo':147, 'Chosen by the Oracles':147, 'Clear Thinker':147, 'Crab Hands':147,
      'Crafty':147, 'Dangerous Beauty':147, 'Daredevil':147, 'Dark Paragon':147, 'Darling of the Court':148,
      'Different School':148, 'Elemental Blessing':148, 'Enlightened':148, 'Fame':148, 'Forbidden Knowledge':148,
      'Friend of the Brotherhood':149, 'Friend of the Elements':149, 'Friendly Kami':149, 'Gaijin Gear':149, 'Gentry':149,
      'Great Destiny':150, 'Great Potential':150, 'Hands of Stone':150, 'Heart of Vengeance':150,
      'Heartless':'The Great Clans p.136', 'Hero of the People':150, 'Higher Purpose':150,
      'Imperial Scribe':'Imperial Histories p.67', 'Imperial Spouse':150, 'Inari’s Blessing':150, 'Inheritance':150,
      'Inner Gift':151, 'Irreproachable':151, 'Ishiken-Do':151, 'Kharmic Tie':151, 'Languages':151, 'Large':151,
      'Leadership':151, 'Luck':151, 'Magic Resistance':151, 'Multiple Schools':151,
      'Naishou Citizen':'Naishou Province p.7', 'Paragon':152, 'Perceived Honor':152, 'Precise Memory':152,
      'Prodigy':152, 'Quick':152, 'Quick Healer':152, 'Read Lips':152, 'Sacred Weapon':152, 'Sacrosanct':153,
      'Sage':153, 'Sensation':153, 'Servant':153, 'Seven Fortunes’ Blessing':153,
      'Shadowed Heart':'Enemies of the Empire p.49', 'Silent':154, 'Social Position':154, 'Soul of Artistry':154,
      'Strength of the Earth':154, 'Tactician':154, 'Touch of the Spirit Realms':154, 'Virtuous':155, 'Voice':155,
      'Void Versatility':'The Great Clans p.199', 'Wary':155, 'Way of the Land':155, 'Wealthy':155 };
    const DISADV_PAGES = { 'Anachronism':'Imperial Histories p.240', 'Antisocial':156, 'Ascetic':156, 'Bad Eyesight':156,
      'Bad Fortune':156, 'Bad Health':156, 'Bitter Betrothal':156, 'Black Sheep':156, 'Blackmailed':156, 'Blind':156,
      'Brash':157, 'Can’t Lie':157, 'Cast Out':157, 'Compulsion':157, 'Consumed':157, 'Contrary':158,
      'Cursed by the Realm':158, 'Dark Fate':158, 'Dark Secret':158, 'Dependant':158, 'Disbeliever':158,
      'Dishonored':158, 'Disturbing Countenance':159, 'Doubt':159, 'Driven':159, 'Elemental Imbalance':159,
      'Enlightened Madness':'The Great Clans p.101', 'Epilepsy':159, 'Failure of Bushido':159, 'Fascination':159,
      'Forced Retirement':159, 'Frail Mind':159, 'Gaijin Name':159, 'Greedy':160, 'Gullible':160, 'Haunted':160,
      'Hostage':160, 'Idealistic':160, 'Infamous':160, 'Insensitive':160, 'Jealousy':160, 'Lame':160, 'Lechery':160,
      'Lord Moon’s Curse':160, 'Lost Love':160, 'Low Pain Threshold':160, 'Missing Limb':161, 'Momoku':161,
      'Obligation':161, 'Obtuse':161, 'Overconfident':161, 'Permanent Wound':161, 'Phobia':161, 'Rumormonger':161,
      'Seven Fortunes’ Curse':161, 'Shadowlands Taint':162, 'Small':162, 'Social Disadvantage':162, 'Soft-Hearted':162,
      'Sworn Enemy':162, 'Touch of the Void':162, 'True Love':162, 'Uncentered':'Book of Void p.192', 'Unlucky':162,
      'Weakness':162, 'Wrath of the Kami':162 };
    function pageFor(table, name){
      const key = SEARCH14.normalise(name);
      const hit = Object.keys(table).find(function(k){ return SEARCH14.normalise(k) === key; });
      if(!hit) return '';
      return typeof table[hit] === 'number' ? 'Core Rulebook p.' + table[hit] : table[hit];
    }
    function clanPrice(name){
      if(typeof CP4525 !== 'object' || !CP4525 || !(typeof CP4525.enabled !== 'function' || CP4525.enabled()) || typeof CP4525.entry !== 'function') return '';
      const e = CP4525.entry(name);
      return e && e.price !== e.base ? e.price + ' points for ' + list(e.who) : '';
    }

    function requirementText(req){
      const r = req || {}, out = [];
      ['rings', 'traits', 'skills'].forEach(function(k){
        Object.keys(r[k] || {}).forEach(function(n){ out.push(n + ' ' + r[k][n]); });
      });
      (r.emphases || []).forEach(function(e){ out.push(e[0] + ' (' + e[1] + ') ' + e[2]); });
      if(r.honor != null) out.push('Honor ' + r.honor);
      if(r.honorAtMost != null) out.push('Honor ' + r.honorAtMost + ' or less');
      if(r.honorBelow != null) out.push('Honor below ' + r.honorBelow);
      if(r.glory != null) out.push('Glory ' + r.glory);
      if((r.families || []).length) out.push('Family: ' + r.families.join(' or '));
      (r.advantages || []).forEach(function(a){ out.push(a + ' (Advantage)'); });
      if((r.advantagesAny || []).length) out.push('one of ' + r.advantagesAny.join(', ') + ' (Advantage)');
      (r.disadvantages || []).forEach(function(d){ out.push(d + ' (Disadvantage)'); });
      return out.join('; ');
    }
    function narrativeText(req){
      return ((req || {}).narrative || []).map(function(n){ return typeof n === 'string' ? n : (n && n.label) || ''; })
        .filter(Boolean).join(' ');
    }
    function clauseText(c){
      const rank = c.anyRank ? 'any Rank' : 'Rank ' + (c.rank != null ? c.rank : (c.rankMin != null ? c.rankMin + '+' : ''));
      if(c.school) return c.school + ', ' + rank;
      const who = [c.minorClan ? 'Minor Clan' : '', c.clan || c.family || '', c.any === 'brotherhood' ? 'Brotherhood' : '',
        c.type || (c.types || []).join('/')].filter(Boolean).join(' ');
      return 'any ' + (who ? who + ' ' : '') + 'School, ' + rank;
    }

    // Every Basic School, with its Clan label: [{ s, clan }].
    function allSchools(){
      const out = [];
      if(typeof SCHOOL_LIBRARY === 'object') Object.keys(SCHOOL_LIBRARY).forEach(function(clan){
        SCHOOL_LIBRARY[clan].forEach(function(s){ out.push({ s: s, clan: clan + ' Clan' }); });
      });
      if(typeof MINOR_CLAN_SCHOOL_LIBRARY === 'object') Object.keys(MINOR_CLAN_SCHOOL_LIBRARY).forEach(function(clan){
        MINOR_CLAN_SCHOOL_LIBRARY[clan].forEach(function(s){ out.push({ s: s, clan: clan + ' Clan' }); });
      });
      if(Array.isArray(BROTHERHOOD_SCHOOL_LIBRARY)) BROTHERHOOD_SCHOOL_LIBRARY.forEach(function(s){
        out.push({ s: s, clan: 'Brotherhood of Shinsei' });
      });
      return out;
    }
    function schoolTechniques(s){
      return (s.tech || []).map(function(name, i){
        const own = Array.isArray(s.descriptions) && s.descriptions[i];
        const t = own ? { text: own, source: '' } : techText(name);
        return { rank: i + 1, name: name, text: t.text, source: t.source };
      });
    }

    function advancedSchools(){
      if(typeof AS47 !== 'object' || !AS47 || !(typeof AS47.enabled !== 'function' || AS47.enabled())) return [];
      return typeof ADVANCED_SCHOOL_LIBRARY !== 'undefined' && Array.isArray(ADVANCED_SCHOOL_LIBRARY) ? ADVANCED_SCHOOL_LIBRARY : [];
    }

    const R = SEARCH14.registerSource;

    R({ id: 'skills', label: 'Skills', group: 'Character', read: function(){
      return SKILL_LIBRARY.map(function(s){
        return { name: s.name, type: 'Skill', tags: [s.cat, s.trait],
          fields: [F('Trait', s.trait), F('Type', s.cat), F('Emphases', s.emph)],
          sections: [{ title: 'Mastery Abilities', items: Object.keys(s.m || {}).map(function(k){
            return { name: 'Rank ' + k, text: s.m[k] }; }) }] };
      });
    } });

    R({ id: 'advantages', label: 'Advantages', group: 'Character', read: function(){
      return ADV_LIBRARY.map(function(a){
        return { name: a.name, type: 'Advantage', tags: [a.cat, a.cost + ' points'], source: pageFor(ADV_PAGES, a.name),
          fields: [F('Type', a.cat), F('Cost', a.cost + ' points'), F('Clan or School price', clanPrice(a.name))], text: [a.desc] };
      });
    } });

    R({ id: 'disadvantages', label: 'Disadvantages', group: 'Character', read: function(){
      return DISADV_LIBRARY.map(function(d){
        return { name: d.name, type: 'Disadvantage', tags: [d.cat, d.cost + ' points'], source: pageFor(DISADV_PAGES, d.name),
          fields: [F('Type', d.cat), F('Value', d.cost + ' points'), F('Clan or School price', clanPrice(d.name))], text: [d.desc] };
      });
    } });

    R({ id: 'schools', label: 'Schools', group: 'Schools', read: function(){
      const byName = {};
      allSchools().forEach(function(x){
        const s = x.s;
        if(byName[s.name]){ byName[s.name].clans.push(x.clan); return; }
        byName[s.name] = { s: s, clans: [x.clan] };
      });
      return Object.keys(byName).map(function(name){
        const s = byName[name].s, clans = byName[name].clans.join(', ');
        return { name: name, type: 'School', tags: [clans], source: s.source || '',
          fields: [F('Clan', clans), F('Benefit', s.benefit ? '+1 ' + s.benefit : ''), F('Honor', s.honor != null ? s.honor : list(s.honorChoices).replace(/, /g, ' or ')),
            F('Skills', s.skills), F('Outfit', s.outfit), F('Affinity', s.affinity), F('Deficiency', s.deficiency),
            F('Devotion', s.devotion && s.devotion.type)],
          sections: [{ title: 'Techniques', items: schoolTechniques(s).map(function(t){
            return { name: 'Rank ' + t.rank + ': ' + t.name, text: t.text, note: t.source }; }) }] };
      });
    } });

    R({ id: 'advanced', label: 'Advanced Schools', group: 'Schools', read: function(){
      return advancedSchools().map(function(a){
        return { name: a.name, type: 'Advanced School', tags: [a.clan, list(a.types)], source: a.source || '',
          fields: [F('Clan', a.clan), F('Type', list(a.types)), F('Requirements', requirementText(a.requires)),
            F('Also required', narrativeText(a)), F('On this sheet', a.recordedOnly || '')],
          sections: [{ title: 'Techniques', items: (a.techniques || []).map(function(t){
            return { name: 'Rank ' + t.rank + ': ' + t.name, text: t.desc || '', note: t.source || '' }; }) }] };
      });
    } });

    R({ id: 'paths', label: 'Alternate Paths', group: 'Schools', read: function(){
      return ALTERNATE_PATH_LIBRARY.map(function(p){
        const t = techText(p.tech);
        return { name: p.name, type: 'Alternate Path', tags: [p.techRank != null ? 'Rank ' + p.techRank : ''], source: p.source || '',
          fields: [F('Technique Rank', p.techRank), F('Replaces', (p.replaces || []).map(clauseText).join('; ')),
            F('Requirements', requirementText(p.requires)), F('Also required', narrativeText(p.requires)), F('Note', p.note)],
          sections: [{ title: 'Technique', items: [{ name: p.tech, text: t.text, note: t.source }] }] };
      });
    } });

    R({ id: 'techniques', label: 'School Techniques', group: 'Techniques', read: function(){
      const byName = {}, order = [];
      allSchools().forEach(function(x){
        schoolTechniques(x.s).forEach(function(t){
          if(!byName[t.name]){ byName[t.name] = { t: t, at: [] }; order.push(t.name); }
          const where = x.s.name + ', Rank ' + t.rank;
          if(byName[t.name].at.indexOf(where) < 0) byName[t.name].at.push(where);
        });
      });
      const out = order.map(function(name){
        const e = byName[name];
        return { name: name, type: 'School Technique', tags: [e.at[0] + (e.at.length > 1 ? ' and ' + (e.at.length - 1) + ' more' : '')],
          source: e.t.source, fields: [F('School', e.at.join('; '))], text: [e.t.text] };
      });
      advancedSchools().forEach(function(a){
        (a.techniques || []).forEach(function(t){
          out.push({ name: t.name, type: 'Advanced School Technique', tags: [a.name + ', Rank ' + t.rank], source: t.source || '',
            fields: [F('School', a.name + ', Rank ' + t.rank)], text: [t.desc || ''] });
        });
      });
      return out;
    } });

    R({ id: 'kata', label: 'Kata', group: 'Techniques', read: function(){
      return KATA_LIBRARY.map(function(k){
        return { name: k.name, type: 'Kata', tags: [k.ring, 'Mastery ' + k.mastery],
          fields: [F('Ring', k.ring), F('Mastery', k.mastery), F('Schools', k.schools)], text: [k.desc] };
      });
    } });

    R({ id: 'kiho', label: 'Kiho', group: 'Techniques', read: function(){
      return KIHO_LIBRARY.map(function(k){
        return { name: k.name, type: 'Kiho', tags: [k.ring, k.type, 'Mastery ' + k.mastery],
          fields: [F('Ring', k.ring), F('Mastery', k.mastery), F('Type', k.type), F('Atemi', k.atemi ? 'Yes' : ''),
            F('Schools', k.schools), F('Monks only', k.monksOnly ? 'Yes' : '')], text: [k.desc] };
      });
    } });

    R({ id: 'spells', label: 'Spells', group: 'Techniques', read: function(){
      return SPELL_LIBRARY.map(function(s){
        return { name: s.name, type: 'Spell', tags: [s.element, 'Mastery ' + s.mastery, s.maho ? 'Maho' : ''],
          fields: [F('Element', s.element), F('Mastery', s.mastery), F('Keywords', list(s.keywords)), F('Maho', s.maho ? 'Yes' : '')],
          text: [s.desc] };
      });
    } });

    R({ id: 'weapons', label: 'Weapons', group: 'Equipment', read: function(){
      const out = WEAPON_LIBRARY.map(function(w){
        return { name: w.name, type: 'Weapon', tags: [w.skill, dice(w.damage)],
          fields: [F('Skill', w.skill), F('Damage', dice(w.damage)), F('Size', w.size), F('Keywords', list(w.keywords)),
            F('Range', w.range ? w.range + ' feet' : ''), F('Strength', w.bowStrength), F('Damage Trait', w.dmgTrait)],
          text: [w.notes] };
      });
      if(Array.isArray(ARROW_LIBRARY)) ARROW_LIBRARY.forEach(function(a){
        out.push({ name: a.name, type: 'Arrow', tags: [dice(a.damage)],
          fields: [F('Damage', dice(a.damage)), F('Special', a.special && a.special !== 'None' ? a.special : '')], text: [a.notes] });
      });
      return out;
    } });

    R({ id: 'clans', label: 'Clans & Families', group: 'Clans', read: function(){
      const clans = {}, order = [], families = [];
      [FAMILY_LIBRARY, MINOR_CLAN_LIBRARY].forEach(function(lib){
        Object.keys(lib).forEach(function(clan){
          if(!clans[clan]){ clans[clan] = []; order.push(clan); }
          lib[clan].forEach(function(f){
            if(clans[clan].indexOf(f[0]) >= 0) return;
            clans[clan].push(f[0]);
            families.push({ name: f[0], type: 'Family', tags: [clan + ' Clan', '+1 ' + f[1]],
              fields: [F('Clan', clan), F('Trait bonus', '+1 ' + f[1])] });
          });
        });
      });
      const schools = allSchools();
      return order.map(function(clan){
        const names = schools.filter(function(x){ return x.clan === clan + ' Clan'; }).map(function(x){ return x.s.name; });
        return { name: clan + ' Clan', type: 'Clan', fields: [F('Families', clans[clan].join(', ')), F('Schools', names.join(', '))] };
      }).concat(families);
    } });

    R({ id: 'ancestors', label: 'Ancestors', group: 'Clans', read: function(){
      if(typeof ANC48 !== 'object' || !ANC48 || !(typeof ANC48.enabled !== 'function' || ANC48.enabled()) || !Array.isArray(ANC48.LIBRARY)) return [];
      return ANC48.LIBRARY.map(function(a){
        return { name: a.name, type: 'Ancestor', tags: [a.clan, a.cost + ' points'],
          source: typeof ANC48.bookPage === 'function' ? ANC48.bookPage(a) : '',
          fields: [F('Clan', a.clan), F('Cost', a.cost + ' points')], text: [a.about],
          sections: [{ title: 'Gifts', items: (a.gifts || []).map(function(g){ return { text: g.text, note: g.note || '' }; }) },
            { title: 'Demands', items: a.demands ? [{ text: a.demands }] : [] }] };
      });
    } });
  })();
  // ============ END PART K PHASE 14 SEARCH14 ============
