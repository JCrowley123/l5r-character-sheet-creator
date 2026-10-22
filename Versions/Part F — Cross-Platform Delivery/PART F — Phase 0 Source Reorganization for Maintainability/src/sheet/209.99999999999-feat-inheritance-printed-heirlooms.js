  // ========= PART I PHASE 4.5.42: INHERITANCE AND THE PRINTED HEIRLOOMS =========
  // Core Inheritance (5 points, a named heirloom; Feature 4.5.13) whose heirloom is named like one of the four printed
  // "Inheritance:" entries says so on its row and offers a one-tap switch to that entry (owner's ruling 5,
  // 22 October 2026, as recommended). Nothing changes unless the player taps. The switch removes the row and adds
  // the printed entry through the quick-add list, so that entry's own price and choices apply.
  // Kill switch INHERITANCE_PRINTED_HEIRLOOMS_ENABLED.
  const INHERITANCE_PRINTED_HEIRLOOMS_ENABLED = true;

  const INH4542 = (function(){
    const api = {};
    api.enabled = function(){
      return INHERITANCE_PRINTED_HEIRLOOMS_ENABLED && typeof N4513 === 'object' && !!N4513 && N4513.enabled();
    };
    // [the words to find in the heirloom's name, the printed entry]
    api.PRINTED = [
      [['kobune'], 'Inheritance: Kobune'],
      [['asahina blade'], 'Inheritance: Asahina Blade'],
      [['trained falcon'], 'Inheritance: Trained Falcon'],
      [['water hammer armor', 'water hammer armour'], 'Inheritance: Water Hammer Armor'],
    ];
    const norm = function(s){ return String(s == null ? '' : s).trim().replace(/\s+/g, ' ').toLowerCase(); };
    api.lib = function(name){
      return (typeof ADV_LIBRARY === 'undefined' ? [] : ADV_LIBRARY).find(function(e){ return e.name === name; }) || null;
    };
    // The printed entry an heirloom name matches, while the catalogue has it; else null.
    api.match = function(itemName){
      const n = norm(itemName);
      const hit = n && api.PRINTED.find(function(p){ return p[0].some(function(w){ return n.indexOf(w) !== -1; }); });
      return hit && api.lib(hit[1]) ? api.lib(hit[1]) : null;
    };
    api.rowMatch = function(div){
      const name = div && div.querySelector('.en-name');
      if(!api.enabled() || !name || norm(name.value) !== 'inheritance' || !div.parentElement || div.parentElement.id !== 'advList') return null;
      const config = readAdvConfig(div);
      return config && typeof config.itemName === 'string' ? api.match(config.itemName) : null;
    };
    api.switchTo = function(div){
      const printed = api.rowMatch(div), add = document.getElementById('advQuickAdd');
      if(!printed || !add) return false;
      const remove = div.querySelector('.rm-btn');
      if(remove) remove.click(); else { div.remove(); recalcAll(); }
      add.value = printed.name;
      add.dispatchEvent(new Event('change'));
      setStatus('Inheritance replaced by ' + printed.name + ' (' + printed.cost + ' points).');
      return true;
    };
    // UI hook: the Inheritance row Feature 4.5.13 draws.
    api.decorate = function(div){
      const printed = api.rowMatch(div), row = div && div.querySelector('.named4513-row');
      if(!printed || !row) return;
      const note = document.createElement('span');
      note.className = 'adv-config-warn inh4542-note';
      note.textContent = 'Printed as its own entry: ' + printed.name + ', ' + printed.cost + ' points (' + printed.source + ').';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ghost inh4542-switch';
      button.textContent = 'Use ' + printed.name;
      button.setAttribute('aria-label', 'Replace Inheritance with ' + printed.name);
      button.addEventListener('click', function(){ api.switchTo(div); });
      row.append(note, button);
    };
    return api;
  })();

  if(INH4542.enabled()){
    const inh4542PreviousRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){
      const result = inh4542PreviousRefresh.apply(this, arguments);
      INH4542.decorate(div);
      return result;
    };
  }
