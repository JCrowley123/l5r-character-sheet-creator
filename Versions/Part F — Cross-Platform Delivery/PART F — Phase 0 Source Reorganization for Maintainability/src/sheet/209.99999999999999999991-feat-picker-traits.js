  // ============ PART H PHASE 15.2.9 — SKILL PICKER TRAITS FROM THE FINAL LIST ============
  // Phase 15, Release 15b, unit B09 (group 2, action labels and wording), approved by the owner on 24 November 2026
  // ("Approve as recommended": as shown, without naming the subject Skills' range); FT-29, Q1.
  // The Skills page's picker ("— choose a skill to add —") is written once, early, from the Skill list as it stood then.
  // A later fix corrected the list (Intimidation's Trait is Awareness, the Skill-Trait audit of 10 October 2026), so the picker still said
  // "Intimidation (Willpower)" while the row it adds says Awareness. Each option now reads the Skill's Trait from the
  // list as it stands after every layer, in the same words the picker always used ("Name (Trait)"), whenever the
  // picker is drawn: at load, and each time it is drawn again (the Skill list fix redraws it when the rows change).
  // Today only Intimidation changes; all 44 options were checked against the rows they add. A later correction to the
  // list would follow by itself.
  // Words only: the options' values, their order and groups, what is hidden, and the row each one adds are unchanged;
  // the creation wizard reads the values only. Screen only; nothing is saved.
  const PICKER_TRAITS_FINAL_ENABLED = true;

  const SKP15 = (function(){
    const api = {installed: false, observer: null};
    api.picker = function(){ return document.getElementById('skillQuickAdd'); };
    api.enabled = function(){ return PICKER_TRAITS_FINAL_ENABLED === true && typeof findSkill === 'function' && !!api.picker(); };
    // One option's words: the Skill's name and its Trait as the list stands now, or null to leave the option alone.
    api.text = function(value){
      const lib = value ? findSkill(value) : null;
      return lib && typeof lib.name === 'string' && typeof lib.trait === 'string' && lib.trait ? lib.name + ' (' + lib.trait + ')' : null;
    };
    api.relabel = function(){
      const sel = api.picker();
      if(!sel) return 0;
      let changed = 0;
      Array.prototype.forEach.call(sel.querySelectorAll('option'), function(o){
        if(!o.value) return;
        const want = api.text(o.value);
        if(want && o.textContent !== want){ o.textContent = want; changed++; }
      });
      return changed;
    };
    api.install = function(){
      if(api.installed || !api.enabled()) return false;
      api.relabel();
      if(typeof MutationObserver === 'function'){
        // UI hook: the picker is drawn again when the Skill rows change; each new drawing is relabelled before it is
        // painted. A relabel that changes nothing changes nothing, so the observer settles.
        api.observer = new MutationObserver(function(){ api.relabel(); });
        api.observer.observe(api.picker(), {childList: true, subtree: true, characterData: true});
      }
      api.installed = true;
      return true;
    };
    return api;
  })();
  if(PICKER_TRAITS_FINAL_ENABLED) SKP15.install();
  // ============ END PART H PHASE 15.2.9 SKP15 ============
