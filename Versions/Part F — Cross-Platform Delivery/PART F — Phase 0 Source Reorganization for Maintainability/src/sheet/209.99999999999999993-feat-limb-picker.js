  // ============ PART H PHASE 15.1.5 — MISSING LIMB'S PICKER IN THE SHARED FIELD ============
  // Phase 15, Release 15a, finding A05 (FT-12; owner's ruling Q1; mock-up approved 7 November 2026). Missing Limb's
  // row (Phase 4.5.31 (Part I), checks and conditions) draws a small native select inside a "Missing" label, beside
  // its note. It stays a native select, as ruled: a short fixed list needs no custom menu. It now reads as a shared
  // field: the field label above it ("Missing limb"), the sheet's field font, border and colour, a 44 px touch
  // height, and the note below it with the shared helper gap (the stylesheet, 1134-limb-picker.css).
  // An observer on the Disadvantages list marks each limb field when its row is drawn (the row is redrawn on every
  // recalculation): it wraps the label's word in its own span, reading "Missing limb", and marks the row. The select,
  // its options, its saved value, its aria-label and Phase 4.5.31's own code are untouched.
  // Everything waits for body.lp15-on, which the switch sets: with the switch off the row is exactly as before.
  const LIMB_PICKER_ENABLED = true;

  const LP15 = (function(){
    const api = {installed: false, observer: null};
    api.enabled = function(){ return LIMB_PICKER_ENABLED; };
    api.LABEL = 'Missing limb';
    // Only marks fields not yet marked, so the mutation it causes finds nothing more and the observer settles at once.
    api.sweep = function(){
      if(!document.body.classList.contains('lp15-on')) return 0;
      let marked = 0;
      document.querySelectorAll('#disadvList label.chk4531-field:not(.lp15-field)').forEach(function(label){
        const select = label.querySelector('select.chk4531-limb');
        if(!select) return;
        const word = Array.from(label.childNodes).find(function(n){ return n.nodeType === 3 && n.textContent.trim(); });
        const span = document.createElement('span');
        span.className = 'lp15-label';
        span.textContent = api.LABEL;
        if(word) word.replaceWith(span); else label.insertBefore(span, select);
        label.classList.add('lp15-field');
        if(label.parentElement && label.parentElement.classList.contains('chk4531-row')) label.parentElement.classList.add('lp15-row');
        marked++;
      });
      return marked;
    };
    api.install = function(){
      if(api.installed || !LIMB_PICKER_ENABLED) return false;
      const list = document.getElementById('disadvList');
      if(!list) return false;
      api.installed = true;
      document.body.classList.add('lp15-on');
      if(typeof MutationObserver === 'function'){
        api.observer = new MutationObserver(api.sweep);
        api.observer.observe(list, {childList: true, subtree: true});
      }
      api.sweep();
      return true;
    };
    return api;
  })();
  LP15.install();
  // ============ END PART H PHASE 15.1.5 ============
