"""Writes src/sheet/209.9999999995-feat-school-clan-references.js from qa/expected-pages.json.
The oracle is read from the books (SOURCES.md); this only formats it. Run: python qa/gen-lookup.py
Techniques are keyed "School|Technique" and Families "Clan|Family": the same name can belong to two of them."""
import json, sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = Q.parent.parent
TARGET = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/src/sheet/209.9999999995-feat-school-clan-references.js'
rows = json.loads((Q / 'expected-pages.json').read_text(encoding='utf-8'))
CONTEXT = {'techniques': 'school', 'families': 'clan'}
out = ['  // ============ PART K PHASE 14.3.2 — SEARCH REFERENCES: SCHOOLS, TECHNIQUES, CLANS AND FAMILIES ============',
       '  // Verified printed entry pages for Phase 14.3b; no catalogue or character writes.',
       '  // Interface: SCHOOLREF1432.source(category, name, context), .recordSource(record), .enabled().',
       '  const SEARCH_REFERENCES_1432_ENABLED = true;',
       '  var SCHOOLREF1432 = (function(){',
       '    // Techniques are keyed "School|Technique" and Families "Clan|Family".',
       '    const pages = {']
keys = set()
for cat in ('schools', 'techniques', 'clans', 'families'):
    out.append('      ' + cat + ': {')
    for r in rows:
        if r['category'] == cat:
            key = (r[CONTEXT[cat]] + '|' if cat in CONTEXT else '') + r['name']
            assert (cat, key) not in keys and '|' not in r['name'], (cat, key)
            keys.add((cat, key))
            out.append('        ' + json.dumps(key, ensure_ascii=False) + ': ' + json.dumps(r['book'] + ' p.' + str(r['page'])) + ',')
    out.append('      },')
out += ['    };',
        '    function normalise(value){ return String(value == null ? "" : value).trim().toLowerCase().replace(/[’‘]/g, "\'").replace(/\\s+/g, " "); }',
        '    const index = {};',
        '    Object.keys(pages).forEach(function(category){',
        '      index[category] = new Map(Object.keys(pages[category]).map(function(key){',
        '        return [key.split("|").map(normalise).join("|"), pages[category][key]]; }));',
        '    });',
        '    function source(category, name, context){',
        '      if(!SEARCH_REFERENCES_1432_ENABLED || !Object.prototype.hasOwnProperty.call(index, category)) return "";',
        '      const keyed = category === "techniques" || category === "families";',
        '      return index[category].get((keyed ? normalise(context) + "|" : "") + normalise(name)) || "";',
        '    }',
        '    function field(record, label){',
        '      const f = (record.fields || []).find(function(x){ return x && x.label === label; });',
        '      return f ? f.value : "";',
        '    }',
        '    return {',
        '      enabled: function(){ return SEARCH_REFERENCES_1432_ENABLED; },',
        '      source: source,',
        '      // A Search record: Schools and Clans by name, Families by name within their Clan.',
        '      recordSource: function(record){',
        '        if(!record) return "";',
        '        if(record.category === "schools") return source("schools", record.name);',
        '        if(record.category !== "clans") return "";',
        '        return record.type === "Family" ? source("families", record.name, field(record, "Clan")) : source("clans", record.name);',
        '      }',
        '    };',
        '  })();',
        '  // Earlier Search consumers may have cached entries before this layer loaded.',
        "  if(typeof SEARCH14 !== 'undefined') SEARCH14.invalidate();",
        '  // ============ END SCHOOLREF1432 ============', '']
TARGET.write_bytes('\n'.join(out).encode('utf-8'))
print('wrote', TARGET.name, len(rows), 'entries')
