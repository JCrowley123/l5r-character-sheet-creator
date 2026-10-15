"""Writes src/sheet/209.999999998-feat-skill-weapon-spell-references.js from qa/expected-pages.json.
The oracle is read from the books (SOURCES.md); this only formats it. Run: python qa/gen-lookup.py"""
import json, sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = Q.parent.parent
TARGET = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/src/sheet/209.999999998-feat-skill-weapon-spell-references.js'
rows = json.loads((Q / 'expected-pages.json').read_text(encoding='utf-8'))
out = ['  // ============ PART K PHASE 14.3.1 — SEARCH REFERENCES: SKILLS, WEAPONS AND SPELLS ============',
       '  // Verified printed entry pages for Phase 14.3a; no catalogue or character writes.',
       '  // Interface: SEARCHREF143.source(category, name), .enabled().',
       '  const SEARCH_REFERENCES_143_ENABLED = true;',
       '  var SEARCHREF143 = (function(){',
       '    const pages = {']
for cat in ('skills', 'weapons', 'spells'):
    out.append('      ' + cat + ': {')
    for r in rows:
        if r['category'] == cat:
            out.append('        ' + json.dumps(r['name'], ensure_ascii=False) + ': ' + json.dumps(r['book'] + ' p.' + str(r['page'])) + ',')
    out.append('      },')
out += ['    };',
        '    function normalise(value){ return String(value == null ? "" : value).trim().toLowerCase().replace(/[’‘]/g, "\'").replace(/\\s+/g, " "); }',
        '    const index = {};',
        '    Object.keys(pages).forEach(function(category){',
        '      index[category] = new Map(Object.keys(pages[category]).map(function(name){ return [normalise(name), pages[category][name]]; }));',
        '    });',
        '    return {',
        '      enabled: function(){ return SEARCH_REFERENCES_143_ENABLED; },',
        '      source: function(category, name){',
        '        if(!SEARCH_REFERENCES_143_ENABLED || !Object.prototype.hasOwnProperty.call(index, category)) return "";',
        '        return index[category].get(normalise(name)) || "";',
        '      }',
        '    };',
        '  })();',
        '  // Earlier Search consumers may have cached entries before this layer loaded.',
        "  if(typeof SEARCH14 !== 'undefined') SEARCH14.invalidate();",
        '  // ============ END SEARCHREF143 ============', '']
TARGET.write_bytes('\n'.join(out).encode('utf-8'))
print('wrote', TARGET.name, len(rows), 'entries')
