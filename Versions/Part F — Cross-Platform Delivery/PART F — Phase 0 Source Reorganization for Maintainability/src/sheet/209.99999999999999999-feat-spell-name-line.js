  // ============ PART H PHASE 15.1.22 — SPELL ROWS: A READABLE NAME AND ONE SCHOOL TAG ============
  // Phase 15, Release 15a, follow-up 8b.1-UI-02 (group G3), approved as mocked up by the owner on 11 November 2026.
  // The number 22 is this unit's marker only; the finding keeps its identifier, 8b.1-UI-02.
  // A spell row held its name, the School-choice layer's "School: ..." label, Cast, the casting help and Memorised on
  // one line that could not wrap. On a phone the name box was left 20 px wide, with no room for text at all.
  // The stylesheet (1140-spell-name-line.css) lets that line wrap: on a phone the name takes the first line and the
  // controls the second; on a laptop the row stays one line. The School-choice layer's label is kept in the row, with
  // its text, but is not drawn; this unit draws one short tag at the end of the control line instead: "School spell"
  // for a character with one School, the School name or names (the label's own text) for a character with several.
  // A reward has no label, so it gets no tag. The tag is read from the label the School-choice layer drew, never from
  // the saved record, and is not part of the save: the grant data on the row is untouched.
  // The sweep runs after every recalculation (a second School changes the wording) and when the list's rows change.
  // It writes only what differs, so its own change settles at once.
  // Everything waits for body.sn15-on, which the switch sets: with the switch off the rows are exactly as before.
  const SPELL_NAME_LINE_ENABLED = true;

  const SN15 = (function(){
    const api = {installed: false, observer: null};
    api.enabled = function(){ return SPELL_NAME_LINE_ENABLED; };
    api.ROWS = '#techList .entry[data-spell-element]';
    api.ONE = 'School spell';
    api.many = function(){
      try { return typeof getSchoolsList === 'function' && getSchoolsList().length > 1; } catch(e){ return false; }
    };
    // What the tag should read for this row: nothing without the School-choice layer's own label.
    api.text = function(row, many){
      const source = row.querySelector(':scope > .entry-top > .sc8-source');
      if(!source) return '';
      const names = source.textContent.replace(/^School:\s*/, '').trim();
      if(!names) return '';
      return many ? names : api.ONE;
    };
    api.sweep = function(){
      if(!document.body.classList.contains('sn15-on')) return 0;
      const many = api.many();
      let changed = 0;
      document.querySelectorAll(api.ROWS).forEach(function(row){
        const top = row.querySelector(':scope > .entry-top');
        if(!top) return;
        const want = api.text(row, many);
        let tag = top.querySelector(':scope > .sn15-tag');
        if(!want){
          if(tag){ tag.remove(); changed++; }
          return;
        }
        if(!tag){
          tag = document.createElement('span');
          tag.className = 'sn15-tag';
          top.appendChild(tag);
          changed++;
        }
        if(tag.textContent !== want){ tag.textContent = want; changed++; }
      });
      return changed;
    };
    api.install = function(){
      if(api.installed || !SPELL_NAME_LINE_ENABLED) return false;
      const list = document.getElementById('techList');
      if(!list) return false;
      api.installed = true;
      document.body.classList.add('sn15-on');
      if(typeof recalcAll === 'function'){
        const sn15Recalc = recalcAll;
        recalcAll = function(){ const out = sn15Recalc.apply(this, arguments); api.sweep(); return out; };
      }
      if(typeof MutationObserver === 'function'){
        api.observer = new MutationObserver(api.sweep);
        api.observer.observe(list, {childList: true, subtree: true});
      }
      api.sweep();
      return true;
    };
    return api;
  })();
  SN15.install();
  // ============ END PART H PHASE 15.1.22 ============
