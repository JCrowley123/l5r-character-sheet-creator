  // ============ PART H PHASE 15.1.28 — YOGO WARDMASTER'S GIVEN SPELLS AND FIVE BOOK PAGES ============
  // Phase 15, Release 15a, unit AE1 (the automatic-entries group), approved as mocked up by the owner on 13 November
  // 2026. The number 28 is this unit's marker only; the unit keeps its identifier, AE1.
  // A book check of all 21 Shugenja Schools against the owner's rulebooks (11 November 2026) found 20 right and one
  // wrong: The Great Clans p.229 gives a Yogo Wardmaster "Sense, Commune, Summon, 3 Wards spells, 3 other spells (not
  // Void)", and the wizard's table for every School gave only Commune and Summon. So the creation wizard never added
  // Sense and the character check never asked for it. Five Schools also had no page recorded; the pages below were
  // read from the owner's PDFs on 13 November 2026 (the printed page, one lower than the PDF page in both books).
  // This unit corrects that table by property, once, as the sheet loads: Yogo's given spells and line, and the five
  // sources. The wizard's own file is not changed; nothing else in any School's entry is touched. Every reader of the
  // table (the wizard, the character check, the older-holdings review, the Rank spell choices) then sees the book.
  const YOGO_GIVEN_SPELLS_ENABLED = true;

  const YG15 = (function(){
    const api = {installed: false, corrected: []};
    api.enabled = function(){ return YOGO_GIVEN_SPELLS_ENABLED; };
    api.YOGO = 'Yogo Wardmaster [Shugenja]';
    api.GIVEN = ['Sense', 'Commune', 'Summon'];
    api.LINE = 'Sense, Commune, Summon, 3 Ward spells, 3 other spells that are not Void spells';
    api.SOURCES = {
      'Fuzake Shugenja': 'Secrets of the Empire p.238',
      'Horiuchi Shugenja': 'The Great Clans p.257–258',
      'Ninube Shugenja': 'The Great Clans p.281',
      'Yogo Wardmaster [Shugenja]': 'The Great Clans p.229',
      'Yoritomo Shugenja': 'The Great Clans p.169',
    };
    api.install = function(){
      if(api.installed || !YOGO_GIVEN_SPELLS_ENABLED) return false;
      const table = typeof CW1124 === 'object' && CW1124 && CW1124.table;
      if(!table) return false;
      api.installed = true;
      Object.keys(api.SOURCES).forEach(function(name){
        if(!table[name]) return;
        table[name].source = api.SOURCES[name];
        api.corrected.push(name);
      });
      const yogo = table[api.YOGO];
      if(yogo){
        yogo.given = api.GIVEN.slice();
        yogo.text = api.LINE;
      }
      return true;
    };
    return api;
  })();
  YG15.install();
  // ============ END PART H PHASE 15.1.28 ============
