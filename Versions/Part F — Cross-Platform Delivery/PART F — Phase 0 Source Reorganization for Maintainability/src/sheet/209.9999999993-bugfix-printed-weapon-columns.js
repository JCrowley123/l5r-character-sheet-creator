  // ============ BUGFIX WEAPONCOLS — PRINTED WEAPON COLUMNS ============
  // On paper each weapon's Skill, Attack, Damage and Size print as one-line text, so their columns
  // fit their values and Weapon and Notes take the rest. Screen layout and saved data are unchanged.
  // Interface: PRINTWEAPONCOLS.enabled(), .prepare(), .restore().
  const PRINTED_WEAPON_COLUMNS_ENABLED = true;

  const PRINTWEAPONCOLS = (function(){
    const api = {};
    const FIELDS = '#weaponsBody .wp-skill, #weaponsBody .wp-roll, #weaponsBody .wp-dmg, #weaponsBody .wp-size';
    let copies = null;

    api.enabled = function(){ return PRINTED_WEAPON_COLUMNS_ENABLED; };

    api.prepare = function(){
      if(!api.enabled() || copies) return;
      copies = [];
      document.querySelectorAll(FIELDS).forEach(function(field){
        const text = document.createElement('span');
        text.className = 'pwc-print-text';
        text.textContent = field.value;
        field.insertAdjacentElement('afterend', text);
        field.classList.add('pwc-text-source');
        copies.push([field, text]);
      });
    };

    api.restore = function(){
      if(!copies) return;
      copies.forEach(function(pair){ pair[0].classList.remove('pwc-text-source'); pair[1].remove(); });
      copies = null;
      // The carousel can re-copy an edge page while printing; its copies carry these too.
      document.querySelectorAll('.pwc-print-text').forEach(function(n){ n.remove(); });
      document.querySelectorAll('.pwc-text-source').forEach(function(n){ n.classList.remove('pwc-text-source'); });
    };

    if(api.enabled()){
      // UI hook: the print-only stylesheet activates through this class.
      document.documentElement.classList.add('pwc-enabled');
      // UI hook: the browser's print events; Export to PDF prints through window.print(), which fires them too.
      window.addEventListener('beforeprint', api.prepare);
      window.addEventListener('afterprint', api.restore);
    }

    return api;
  })();
  // ============ END BUGFIX WEAPONCOLS ============
