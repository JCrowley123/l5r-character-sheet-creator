"""Writes src/sheet/209.9999999996-feat-school-flavour.js from qa/school-flavour.json (own words, with pages).
The text was written from the books (memory: sourcebook-rules-text-own-words); this only formats it. Run: python qa/gen-lore.py"""
import json, sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = Q.parent.parent.parent
TARGET = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/src/sheet/209.9999999996-feat-school-flavour.js'
rows = json.loads((Q / 'school-flavour.json').read_text(encoding='utf-8'))
names = [r['name'] for r in rows]
assert len(names) == len(set(names)), 'duplicate School'
out = ['  // ============ PART H PHASE 9.1 — SCHOOL FLAVOUR TEXT ============',
       '  // One or two sentences per School in our own words, with the printed page they come from. Data only.',
       '  // Interface: SCHOOLLORE9.entry(name), .searchText(name), .enabled(). Declared with var: 080 reads it before this loads.',
       '  const SCHOOL_FLAVOUR_ENABLED = true;',
       '  var SCHOOLLORE9 = (function(){',
       '    // name: [book, printed page, text]',
       '    const lore = {']
for r in rows:
    assert r['text'].strip() and isinstance(r['page'], int) and r['page'] > 0, r['name']
    out.append('      ' + json.dumps(r['name'], ensure_ascii=False) + ': ' + json.dumps([r['book'], r['page'], r['text']], ensure_ascii=False) + ',')
out += ['    };',
        '    function normalise(value){ return String(value == null ? "" : value).trim().toLowerCase().replace(/[’‘]/g, "\'").replace(/\\s+/g, " "); }',
        '    const index = new Map(Object.keys(lore).map(function(name){ return [normalise(name), name]; }));',
        '    function entry(name){',
        '      const key = SCHOOL_FLAVOUR_ENABLED ? index.get(normalise(name)) : undefined;',
        '      if(!key) return null;',
        '      const e = lore[key];',
        '      return { text: e[2], book: e[0], page: e[1], source: e[0] + " p." + e[1] };',
        '    }',
        '    return {',
        '      enabled: function(){ return SCHOOL_FLAVOUR_ENABLED; },',
        '      entry: entry,',
        "      // Search's School record text: the sentences followed by their page.",
        '      searchText: function(name){ const e = entry(name); return e ? [e.text + " (" + e.source + ")"] : []; }',
        '    };',
        '  })();',
        '  // Earlier Search consumers may have cached entries before this layer loaded.',
        "  if(typeof SEARCH14 !== 'undefined') SEARCH14.invalidate();",
        "  // UI hook: repaint the School preview drawn before this text loaded (080's renderSchoolInfo).",
        "  if(typeof renderSchoolInfo === 'function') renderSchoolInfo();",
        '  // ============ END SCHOOLLORE9 ============', '']
TARGET.write_bytes('\n'.join(out).encode('utf-8'))
print('wrote', TARGET.name, len(rows), 'Schools')
