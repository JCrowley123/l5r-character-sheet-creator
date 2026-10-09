  // ========= PART I FEATURE 4.5.34: BLIND'S ARMOR TN NOTE =========
  // The owner's call of 9 October 2026 (check C11 of the 4.5.31 checklist): Blind's Armor TN was right but
  // unexplained. One line under the Combat card's Base TN and one under Quick Access's Armor TN name Blind
  // and the sum (Core Rulebook p.156: the base is Reflexes + 5 instead of Reflexes x 5 + 5).
  // Reads Feature 4.5.31's adjustment (CHK4531, a declared dependency) and never changes a number.
  const BLIND_ARMOR_NOTE_ENABLED = true;

  const BL4534 = (function(){
    const api = {};
    api.enabled = function(){ return BLIND_ARMOR_NOTE_ENABLED; };
    // The note, or '' when Feature 4.5.31 has not set Blind's base on this recalc.
    api.text = function(full){
      if(!api.enabled() || typeof CHK4531 !== 'object' || !CHK4531 || !CHK4531.enabled() || !CHK4531.has('Blind')) return '';
      const base = document.getElementById('f_baseTN');
      if(!base || base.dataset.chk4531 === undefined) return '';
      const reflexes = typeof getTraitValueByName === 'function' ? getTraitValueByName('Reflexes') : NaN;
      if(!Number.isFinite(reflexes)) return '';
      return 'Blind: Reflexes ' + reflexes + ' + 5 = ' + base.value + (full ? ' (Core Rulebook p.156)' : '');
    };
    api.place = function(anchor, id, text){
      let note = document.getElementById(id);
      if(!text){ if(note) note.remove(); return; }
      if(!anchor) return;
      if(!note){
        note = document.createElement('div');
        note.id = id;
        note.className = 'bl4534-note';
        anchor.insertAdjacentElement('afterend', note);
      }
      if(note.textContent !== text) note.textContent = text;
    };
    api.refresh = function(){
      api.place(document.getElementById('f_baseTN'), 'bl4534BaseNote', api.text(true));
      api.place(document.getElementById('qaArmorTNValue'), 'bl4534QaNote', api.text(false));
    };
    return api;
  })();

  if(BL4534.enabled()){
    // After Feature 4.5.31's own refresh, which sets Blind's base inside refreshAllAdvConfigControls.
    if(typeof refreshAllAdvConfigControls === 'function'){
      const bl4534PreviousRefresh = refreshAllAdvConfigControls;
      refreshAllAdvConfigControls = function(){
        const result = bl4534PreviousRefresh.apply(this, arguments);
        BL4534.refresh();
        return result;
      };
    }
  }
  // ========= END PART I FEATURE 4.5.34 BL4534 =========
