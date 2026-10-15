  // ============ BUGFIX PRINTWEAPONS — PRINTED WEAPON TEXT ============
  // A single-line field cannot wrap on paper, so each weapon's name and notes print as wrapping
  // text in its place while printing. Screen layout and saved data are unchanged.
  // Interface: PRINTWEAPONS.enabled(), .prepare(), .restore().
  const PRINTED_WEAPON_TEXT_ENABLED = true;

  const PRINTWEAPONS = (function(){
    const api = {};
    let mirrors = null;

    api.enabled = function(){ return PRINTED_WEAPON_TEXT_ENABLED; };

    api.prepare = function(){
      if(!api.enabled() || mirrors) return;
      mirrors = [];
      document.querySelectorAll('#weaponsBody .wp-name, #weaponsBody .wp-notes').forEach(function(field){
        const text = document.createElement('div');
        text.className = 'pw-print-text';
        text.textContent = field.value || ' ';
        field.insertAdjacentElement('afterend', text);
        field.classList.add('pw-text-source');
        mirrors.push([field, text]);
      });
    };

    api.restore = function(){
      if(!mirrors) return;
      mirrors.forEach(function(pair){ pair[0].classList.remove('pw-text-source'); pair[1].remove(); });
      mirrors = null;
      // The carousel can re-copy an edge page while printing; its copies carry these too.
      document.querySelectorAll('.pw-print-text').forEach(function(n){ n.remove(); });
      document.querySelectorAll('.pw-text-source').forEach(function(n){ n.classList.remove('pw-text-source'); });
    };

    if(api.enabled()){
      // UI hook: the print-only stylesheet activates through this class.
      document.documentElement.classList.add('pw-enabled');
      // UI hook: the browser's print events; Export to PDF prints through window.print(), which fires them too.
      window.addEventListener('beforeprint', api.prepare);
      window.addEventListener('afterprint', api.restore);
    }

    return api;
  })();
  // ============ END BUGFIX PRINTWEAPONS ============
