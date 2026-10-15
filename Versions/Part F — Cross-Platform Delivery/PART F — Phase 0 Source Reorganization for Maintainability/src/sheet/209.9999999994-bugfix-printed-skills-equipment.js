  // ============ BUGFIX SKILLSEQUIP — PRINTED SKILLS AND EQUIPMENT TABLES ============
  // On paper the Skills and Equipment fields print as text copies: Rank and Qty on one line, so their
  // columns fit their values; Skill, Trait, Item and Notes wrap between words. Screen layout and saved
  // data are unchanged. Interface: PRINTSKILLSEQUIP.enabled(), .prepare(), .restore().
  const PRINTED_SKILLS_EQUIPMENT_ENABLED = true;

  const PRINTSKILLSEQUIP = (function(){
    const api = {};
    const ONE_LINE = '#skillsBody .sk-rank, #equipBody .eq-qty';
    const WRAPPING = '#skillsBody .sk-name, #skillsBody .sk-trait, #equipBody .eq-name, #equipBody .eq-notes';
    let copies = null;

    function copy(field, className){
      const text = document.createElement('span');
      text.className = className;
      text.textContent = field.value;
      field.insertAdjacentElement('afterend', text);
      field.classList.add('pse-text-source');
      copies.push([field, text]);
    }

    api.enabled = function(){ return PRINTED_SKILLS_EQUIPMENT_ENABLED; };

    api.prepare = function(){
      if(!api.enabled() || copies) return;
      copies = [];
      document.querySelectorAll(ONE_LINE).forEach(function(field){ copy(field, 'pse-print-text'); });
      document.querySelectorAll(WRAPPING).forEach(function(field){ copy(field, 'pse-print-wrap'); });
    };

    api.restore = function(){
      if(!copies) return;
      copies.forEach(function(pair){ pair[0].classList.remove('pse-text-source'); pair[1].remove(); });
      copies = null;
      // The carousel can re-copy an edge page while printing; its copies carry these too.
      document.querySelectorAll('.pse-print-text, .pse-print-wrap').forEach(function(n){ n.remove(); });
      document.querySelectorAll('.pse-text-source').forEach(function(n){ n.classList.remove('pse-text-source'); });
    };

    if(api.enabled()){
      // UI hook: the print-only stylesheet activates through this class.
      document.documentElement.classList.add('pse-enabled');
      // UI hook: the browser's print events; Export to PDF prints through window.print(), which fires them too.
      window.addEventListener('beforeprint', api.prepare);
      window.addEventListener('afterprint', api.restore);
    }

    return api;
  })();
  // ============ END BUGFIX SKILLSEQUIP ============
