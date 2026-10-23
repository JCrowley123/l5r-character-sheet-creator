  // ========= PART I PHASE 4.5.42: INHERITANCE AND THE PRINTED HEIRLOOMS =========
  // The four printed "Inheritance:" heirlooms are folded into Core Inheritance (5 points, a named heirloom; Feature
  // 4.5.13), on the owner's rulings of 23 October 2026 (Release 5c.1). They leave the Advantages list, and so the
  // creation wizard's copy of it, but stay in the catalogue (saves, Feature 4.5.25's prices and Yomi keep working) and
  // in Search, marked "Added through Inheritance". Ruling 1: a typed heirloom name containing one of them is
  // recognised; the dialog's note says so as the name is typed, and Confirm makes the row that entry, in the same
  // place, priced by its own rules. Water Hammer Armor then asks for its armor; ruling 3: cancelled, the row stays
  // that entry with "Needs a choice". Kill switch INHERITANCE_PRINTED_HEIRLOOMS_ENABLED.
  const INHERITANCE_PRINTED_HEIRLOOMS_ENABLED = true;

  const INH4542 = (function(){
    const api = {};
    api.enabled = function(){
      return INHERITANCE_PRINTED_HEIRLOOMS_ENABLED && typeof N4513 === 'object' && !!N4513 && N4513.enabled();
    };
    // [the words to find in the heirloom's name, the printed entry, what Confirm does after]
    api.PRINTED = [
      [['kobune'], 'Inheritance: Kobune', ''],
      [['asahina blade'], 'Inheritance: Asahina Blade', ''],
      [['trained falcon'], 'Inheritance: Trained Falcon', ''],
      [['water hammer armor', 'water hammer armour'], 'Inheritance: Water Hammer Armor', ', then asks which armor'],
    ];
    api.SEARCH_LINE = 'Added through Inheritance: in Advantages, add Inheritance and name this heirloom; Confirm makes the row this entry.';
    const norm = function(s){ return String(s == null ? '' : s).trim().replace(/\s+/g, ' ').toLowerCase(); };
    api.lib = function(name){
      return (typeof ADV_LIBRARY === 'undefined' ? [] : ADV_LIBRARY).find(function(e){ return e.name === name; }) || null;
    };
    api.folded = function(name){ return api.PRINTED.some(function(p){ return p[1] === name; }) && !!api.lib(name); };
    // The printed entry an heirloom name matches, while the catalogue has it; else null.
    api.match = function(itemName){
      const n = norm(itemName);
      const hit = n && api.PRINTED.find(function(p){ return p[0].some(function(w){ return n.indexOf(w) !== -1; }); });
      return hit && api.lib(hit[1]) ? api.lib(hit[1]) : null;
    };
    // The price the note quotes: the choice's range (the armor), else Feature 4.5.25's price for this character.
    api.price = function(printed){
      const schema = typeof advConfigSchemaFor === 'function' ? advConfigSchemaFor(printed.name) : null;
      const costs = schema ? advConfigOptionsFor(schema).map(function(o){ return o.cost; }).filter(function(c){ return typeof c === 'number'; }) : [];
      if(costs.length) return Math.min.apply(null, costs) + ' to ' + Math.max.apply(null, costs) + ' points';
      let cost = printed.cost;
      if(typeof CP4525 === 'object' && CP4525 && CP4525.enabled() && CP4525.entry(printed.name)){
        cost = CP4525.bookPrice(CP4525.entry(printed.name), CP4525.facts(false)).price;
      }
      return cost + ' point' + (cost === 1 ? '' : 's');
    };
    api.noteFor = function(itemName){
      const printed = api.match(itemName);
      if(!printed) return null;
      const row = api.PRINTED.find(function(p){ return p[1] === printed.name; });
      return printed.name.replace(/^Inheritance: /, '') + ' is printed as its own entry: ' + api.price(printed) +
        '. Confirm uses it' + row[2] + '.';
    };
    api.inDialog = function(){
      const state = typeof advConfigExtendedModal === 'undefined' ? null : advConfigExtendedModal;
      return api.enabled() && !!state && state.kind === 'named4513' && state.entryName === normalizeAdvName('Inheritance');
    };
    // UI hook: Feature 4.5.13's Inheritance dialog; its note follows the typed name.
    api.watch = function(){
      const input = document.getElementById('named4513Item'), note = document.getElementById('advConfigNote');
      if(!api.inDialog() || !input || !note) return;
      const reminder = note.textContent;
      const update = function(){ note.textContent = api.noteFor(input.value) || reminder; };
      input.addEventListener('input', update);
      update();
    };
    // The row becomes the printed entry in its place, made as the quick-add list makes entries; a choice opens next.
    api.useFor = function(div, printed){
      const next = makeEntry({name:printed.name, cost:printed.cost, desc:printed.desc}, true);
      closeAdvConfigModal();
      div.replaceWith(next);
      recalcAll();
      setStatus(printed.name + ' added in place of Inheritance.');
      if(typeof openAdvConfigModal === 'function') openAdvConfigModal(next);
      return next;
    };
    api.confirm = function(){
      if(!api.inDialog()) return false;
      const div = advConfigTargetEntry, input = document.getElementById('named4513Item'), name = div && div.querySelector('.en-name');
      if(!input || !name || !div.isConnected || !div.parentElement || div.parentElement.id !== 'advList' ||
        normalizeAdvName(name.value) !== advConfigExtendedModal.entryName) return false;
      const printed = api.match(input.value);
      if(!printed) return false;
      api.useFor(div, printed);
      return true;
    };
    // The Advantages list is built once, at load; the creation wizard copies it each time it draws.
    api.pruneQuickAdd = function(){
      const select = document.getElementById('advQuickAdd');
      if(!select) return 0;
      const gone = Array.prototype.filter.call(select.options, function(o){ return api.folded(o.value); });
      gone.forEach(function(o){ o.remove(); });
      return gone.length;
    };
    api.searchRecord = function(rec){
      if(rec && rec.category === 'advantages' && api.folded(rec.name) && Array.isArray(rec.text)) rec.text.push(api.SEARCH_LINE);
      return rec;
    };
    return api;
  })();

  if(INH4542.enabled()){
    INH4542.pruneQuickAdd();
    const inh4542PreviousOpen = openExtendedAdvConfigModal;
    openExtendedAdvConfigModal = function(){
      const result = inh4542PreviousOpen.apply(this, arguments);
      if(result) INH4542.watch();
      return result;
    };
    const inh4542PreviousConfirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){ return INH4542.confirm() || inh4542PreviousConfirm.apply(this, arguments); };
    if(typeof SEARCH14 === 'object' && SEARCH14 && typeof SEARCH14.get === 'function'){
      const inh4542PreviousGet = SEARCH14.get;
      SEARCH14.get = function(){ return INH4542.searchRecord(inh4542PreviousGet.apply(this, arguments)); };
    }
  }
