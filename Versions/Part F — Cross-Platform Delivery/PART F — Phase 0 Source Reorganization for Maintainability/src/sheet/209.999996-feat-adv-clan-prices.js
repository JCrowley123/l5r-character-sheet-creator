  // ========= PART I FEATURE 4.5.25: CLAN AND SCHOOL PRICES =========
  // 39 Advantages and Disadvantages cost less, or are worth more, for some Clans, families or
  // School types (Core Rulebook pp. 147-162: "Dragon characters may purchase this Advantage for
  // 2 points", "This Disadvantage is worth 4 points to Lion characters"). Until now every one
  // was charged at the catalogue price. This step prices each row from the character.
  //
  // The owner's rulings of 2 October 2026:
  //   1. A price is fixed when it is bought. A Management visit is the purchase: while in
  //      Management a row is PROVISIONAL and follows every change made in that visit (Clan,
  //      family, a School added before or after the row). Leaving Management, or finishing the
  //      wizard, FIXES it; a later visit never re-prices it, it only notes the difference.
  //   2. At that moment every School the character holds counts ("a trained bushi").
  //   3. A cost the player typed is kept and marked, never overwritten.
  //   4. A character saved before this release is priced once, from the Clan, family and the
  //      STARTING School (assumed bought at creation), and fixed, when it is first loaded.
  //      Only a row still at the catalogue price changes; a Clan price on a character that no
  //      longer qualifies is kept and marked, so nothing is taken away silently.
  //
  // "Crab and bushi characters" is a list (either one qualifies), as "Crab and Mantis
  // characters" can only be. Uncentered (Book of Void p. 192) is worth LESS to a Clan monk than the
  // catalogue's Brotherhood price, so it is priced for new purchases only, never re-priced on a
  // saved character (owner's ruling); Blackmail and Way of the Land are left out
  // because their own pickers own the row. Rebinds refreshAdvConfigControl (Phase 4.5's
  // refresh, run for every row by refreshAllAdvConfigControls() from recalcAll()), makeEntry,
  // collectData and applyData; wraps MODES12.set (Phase 12) and CW112.finish (Phase 11.2) when
  // present. Kill switch ADV_CLAN_PRICES_ENABLED.
  const ADV_CLAN_PRICES_ENABLED = true;

  const CP4525 = (function(){
    const api = {};
    api.enabled = function(){ return ADV_CLAN_PRICES_ENABLED; };
    api.loading = false;
    const norm = function(s){ return String(s == null ? '' : s).trim().toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, ' '); };
    api.norm = norm;
    api.TYPES = ['bushi', 'courtier', 'shugenja', 'monk', 'ninja'];

    // [name, list, catalogue, price, who qualifies, Core Rulebook page]. "who" holds Clan names,
    // 'Imperial' (the Imperial Clan or an Imperial family) and School types in lower case.
    const ROWS = [
      ['Blood of Osano-Wo', 'adv', 4, 3, ['Crab', 'Mantis'], 147],
      ['Clear Thinker', 'adv', 3, 2, ['Dragon'], 147],
      ['Crab Hands', 'adv', 3, 2, ['Crab', 'bushi'], 147],
      ['Crafty', 'adv', 3, 2, ['Scorpion', 'Spider', 'ninja'], 147],
      ['Dangerous Beauty', 'adv', 3, 2, ['Scorpion'], 147],
      ['Daredevil', 'adv', 3, 2, ['Mantis'], 147],
      ['Enlightened', 'adv', 6, 5, ['Dragon', 'monk'], 148],
      ['Friend of the Brotherhood', 'adv', 5, 4, ['Dragon'], 149],
      ['Gaijin Gear', 'adv', 5, 4, ['Mantis', 'Unicorn'], 149],
      ['Hands of Stone', 'adv', 6, 5, ['monk'], 150],
      ['Irreproachable', 'adv', 2, 1, ['Imperial'], 151],
      ['Ishiken-Do', 'adv', 8, 6, ['Phoenix'], 151],
      ['Large', 'adv', 4, 3, ['Crab'], 151],
      ['Leadership', 'adv', 6, 5, ['Lion'], 151],
      ['Quick', 'adv', 6, 5, ['ninja'], 152],
      ['Read Lips', 'adv', 4, 3, ['courtier'], 152],
      ['Sacrosanct', 'adv', 4, 3, ['Imperial'], 153],
      ['Sage', 'adv', 4, 3, ['Phoenix', 'shugenja'], 153],
      ['Silent', 'adv', 3, 2, ['ninja'], 154],
      ['Strength of the Earth', 'adv', 3, 2, ['bushi'], 154],
      ['Tactician', 'adv', 4, 3, ['Lion', 'bushi'], 154],
      ['Ascetic', 'disadv', 2, 3, ['Dragon', 'monk'], 156],
      ['Bitter Betrothal', 'disadv', 2, 3, ['Imperial'], 156],
      ['Brash', 'disadv', 3, 4, ['Lion'], 157],
      ['Contrary', 'disadv', 3, 4, ['Imperial', 'courtier'], 158],
      ['Dark Secret', 'disadv', 4, 5, ['ninja'], 158],
      ['Disturbing Countenance', 'disadv', 3, 4, ['Spider'], 159],
      ['Epilepsy', 'disadv', 4, 5, ['Crane'], 159],
      ['Forced Retirement', 'disadv', 4, 5, ['monk'], 159],
      ['Gaijin Name', 'disadv', 1, 2, ['Unicorn'], 159],
      ['Greedy', 'disadv', 3, 4, ['Mantis'], 160],
      ['Idealistic', 'disadv', 2, 3, ['Lion'], 160],
      ['Insensitive', 'disadv', 2, 3, ['Scorpion'], 160],
      ['Obtuse', 'disadv', 3, 4, ['Crab', 'bushi'], 161],
      ['Overconfident', 'disadv', 3, 4, ['Lion', 'Mantis'], 161],
      ['Permanent Wound', 'disadv', 4, 5, ['bushi'], 161],
      ['Rumormonger', 'disadv', 4, 5, ['courtier'], 161],
      ['Soft-Hearted', 'disadv', 2, 3, ['Phoenix'], 162],
      ['Touch of the Void', 'disadv', 3, 4, ['Phoenix'], 162],
      // Owner's ruling, 2 October 2026: a Clan monk holds a [Monk] School of a Clan (the Kuni
      // Witch-Hunter, the Togashi Tattooed Order); a Brotherhood monk holds a School of the
      // Brotherhood of Shinsei itself (BROTHERHOOD_SCHOOL_LIBRARY), which has no Clan. Worth LESS
      // than the catalogue to a Clan monk, so priced for new purchases only (see takesAway).
      ['Uncentered', 'disadv', 4, 2, ['Clan monk'], 'Book of Void p. 192']
    ];
    api.TABLE = {};
    ROWS.forEach(function(r){
      api.TABLE[norm(r[0])] = { name:r[0], list:r[1], base:r[2], price:r[3], who:r[4],
        source: typeof r[5] === 'number' ? 'Core Rulebook p. ' + r[5] : r[5] };
    });
    // An entry whose book price moves AGAINST the player (an Advantage dearer, or a Disadvantage
    // worth less, than the catalogue). A saved row is never re-priced to it, only noted.
    api.takesAway = function(e){ return e.list === 'adv' ? e.price > e.base : e.price < e.base; };
    api.entry = function(name){ return api.TABLE[norm(name)] || null; };

    // The same reading of a School's type as Phase 4.6 (Part I) uses, taken from the trunk's own
    // library so this release does not depend on that phase: the bracketed type in the name
    // ("Shosuro Infiltrator [Ninja]"), else a type word in the name ("Hida Bushi"), plus the
    // library's own shugenja and Brotherhood flags.
    api.schoolTypes = function(schoolName){
      const name = String(schoolName || '');
      if(!name) return [];
      const entry = (typeof findAnySchoolLibraryEntry === 'function' && findAnySchoolLibraryEntry(name)) || { name:name };
      const words = function(text){ return String(text).toLowerCase().split(/[^a-z]+/).filter(function(w){ return api.TYPES.indexOf(w) >= 0; }); };
      let found = words((name.match(/\[[^\]]*\]/g) || []).join(' '));
      if(!found.length) found = words(name.replace(/\[[^\]]*\]/g, ' '));
      if(entry.shugenja) found.push('shugenja');
      if(entry.brotherhood || entry.monk) found.push('monk');
      return found.filter(function(t, i){ return found.indexOf(t) === i; });
    };

    // The character as it stands. startingOnly: the first School alone (ruling 4).
    api.facts = function(startingOnly){
      const val = function(id){ const el = document.getElementById(id); return el ? String(el.value || '').trim() : ''; };
      const clan = val('f_clan'), family = val('f_family');
      let schools = (typeof getSchoolsList === 'function') ? getSchoolsList() : [];
      if(!Array.isArray(schools)) schools = [];
      if(startingOnly) schools = schools.slice(0, 1);
      const types = [];
      schools.forEach(function(s){ api.schoolTypes(s && s.name).forEach(function(t){ if(types.indexOf(t) < 0) types.push(t); }); });
      const brotherhood = (typeof BROTHERHOOD_SCHOOL_LIBRARY !== 'undefined' && Array.isArray(BROTHERHOOD_SCHOOL_LIBRARY))
        ? BROTHERHOOD_SCHOOL_LIBRARY.map(function(s){ return s && s.name; }) : [];
      const clanMonk = schools.some(function(s){
        return s && s.name && brotherhood.indexOf(s.name) < 0 && api.schoolTypes(s.name).indexOf('monk') >= 0;
      });
      const imperialFamilies =(typeof FAMILY_LIBRARY === 'object' && FAMILY_LIBRARY && FAMILY_LIBRARY.Imperial || []).map(function(f){ return norm(f[0]); });
      return { clan:clan, family:family, types:types, clanMonk:clanMonk, schools:schools.map(function(s){ return s && s.name; }),
        imperial: norm(clan) === 'imperial' || imperialFamilies.indexOf(norm(family)) >= 0 };
    };

    // The first group the character belongs to, or '' when the catalogue price applies.
    api.basis = function(e, f){
      for(let i = 0; i < e.who.length; i++){
        const w = e.who[i];
        if(w === 'Imperial'){ if(f.imperial) return 'Imperial'; }
        else if(w === 'Clan monk'){ if(f.clanMonk) return 'Clan monk'; }
        else if(api.TYPES.indexOf(w) >= 0){ if(f.types.indexOf(w) >= 0) return w; }
        else if(norm(f.clan) === norm(w)) return w;
      }
      return '';
    };
    api.bookPrice = function(e, f){ const b = api.basis(e, f); return { price: b ? e.price : e.base, basis: b }; };

    api.read = function(div){
      if(!div || !div.dataset.cp4525) return null;
      try { const r = JSON.parse(div.dataset.cp4525); return (r && r.n && r.s) ? r : null; } catch(err){ return null; }
    };
    api.write = function(div, rec){ div.dataset.cp4525 = JSON.stringify(rec); };

    const label = function(b){ return b ? b.charAt(0).toUpperCase() + b.slice(1) : ''; };
    api.noteText = function(e, rec){
      const now = api.bookPrice(e, api.facts(false));
      const word = e.list === 'adv' ? 'price' : 'value';
      if(rec.s === 'typed'){
        return 'Cost set by hand. Book ' + word + ': ' + now.price + ' XP' + (now.basis ? ' (' + label(now.basis) + ')' : '') + '.';
      }
      if(rec.s === 'fixed' && rec.v !== now.price){
        return 'Fixed when bought: ' + rec.v + ' XP' + (rec.b ? ' (' + label(rec.b) + ')' : '') + '. Book ' + word + ' now: ' + now.price + ' XP' + (now.basis ? ' (' + label(now.basis) + ')' : '') + '.';
      }
      if(!rec.b) return '';
      return label(rec.b) + ' ' + word + ': ' + rec.v + ' XP (catalogue ' + e.base + ')' + (rec.s === 'provisional' ? ' — fixed when you leave Management.' : '.');
    };
    api.note = function(div, text){
      let el = div.querySelector(':scope > .cp4525-note');
      if(!text){ if(el) el.remove(); return; }
      if(!el){
        el = document.createElement('div');
        el.className = 'cp4525-note';
        el.style.cssText = 'font-size:0.78em;font-style:italic;opacity:0.8;margin:2px 0 0;width:100%;';
        div.appendChild(el);
      }
      if(el.textContent !== text) el.textContent = text;
    };
    api.clear = function(div){
      if(div.dataset.cp4525) delete div.dataset.cp4525;
      api.note(div, '');
    };

    // Runs for every row on every recalcAll(), before Phase 4.5's own refresh.
    api.refresh = function(div){
      if(!div) return;
      const nameEl = div.querySelector('.en-name'), costEl = div.querySelector('.en-cost');
      const listId = div.parentElement && div.parentElement.id;
      const e = nameEl ? api.entry(nameEl.value) : null;
      if(!api.enabled() || !e || !costEl || e.list !== (listId === 'advList' ? 'adv' : listId === 'disadvList' ? 'disadv' : '')){
        if(div.dataset.cp4525 || div.querySelector(':scope > .cp4525-note')) api.clear(div);
        return;
      }
      const n = norm(e.name);
      let rec = api.read(div);
      if(rec && rec.n !== n) rec = null;            // renamed: a new purchase
      const raw = String(costEl.value).trim();
      const cur = raw === '' ? NaN : Number(raw);
      if(!rec){
        const book = api.bookPrice(e, api.facts(api.loading));
        const state = api.loading ? 'fixed' : 'provisional';
        // A blank or 0 cost is "not yet priced" only on a row added now, never on a loaded save.
        if(api.loading && api.takesAway(e) && cur !== book.price){
          rec = { n:n, s:'fixed', v:cur, b:'' };    // never taken away from a saved character
        } else if((!api.loading && (isNaN(cur) || cur === 0)) || cur === e.base || cur === book.price){
          if(cur !== book.price) costEl.value = book.price;
          rec = { n:n, s:state, v:book.price, b:book.basis };
        } else {
          rec = { n:n, s:'typed', v:cur, b:'' };
        }
      } else if(rec.s !== 'typed' && cur !== rec.v){
        rec = { n:n, s:'typed', v:cur, b:'' };      // the player changed the cost
      } else if(rec.s === 'provisional'){
        const book = api.bookPrice(e, api.facts(false));
        if(cur !== book.price) costEl.value = book.price;
        rec.v = book.price; rec.b = book.basis;
      } else if(rec.s === 'typed'){
        rec.v = cur;
      }
      api.write(div, rec);
      api.note(div, api.noteText(e, rec));
    };

    // Leaving Management, or finishing the wizard, fixes every provisional price.
    api.fixAll = function(){
      if(!api.enabled()) return 0;
      let fixed = 0;
      document.querySelectorAll('#advList .entry, #disadvList .entry').forEach(function(div){
        const rec = api.read(div);
        if(!rec || rec.s !== 'provisional') return;
        rec.s = 'fixed';
        api.write(div, rec);
        const nameEl = div.querySelector('.en-name');
        const e = nameEl && api.entry(nameEl.value);
        if(e) api.note(div, api.noteText(e, rec));
        fixed++;
      });
      return fixed;
    };
    return api;
  })();

  // PART I FEATURE 4.5.25 hooks. Each keeps the previous binding and delegates to it.
  if(typeof refreshAdvConfigControl === 'function'){
    const cp4525PreviousRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){
      try { CP4525.refresh(div); } catch(err){ console.warn('Clan and School prices:', err); }
      return cp4525PreviousRefresh.apply(this, arguments);
    };
  }
  const cp4525PreviousMakeEntry = makeEntry;
  makeEntry = function(data){
    const div = cp4525PreviousMakeEntry.apply(this, arguments);
    if(div && data && data.clanPrice && typeof data.clanPrice === 'object' && data.clanPrice.n){
      div.dataset.cp4525 = JSON.stringify(data.clanPrice);
    }
    return div;
  };
  const cp4525PreviousCollect = collectData;
  collectData = function(){
    const data = cp4525PreviousCollect.apply(this, arguments);
    [['advList', 'adv'], ['disadvList', 'disadv']].forEach(function(pair){
      const arr = data && data[pair[1]];
      if(!Array.isArray(arr)) return;
      document.querySelectorAll('#' + pair[0] + ' .entry').forEach(function(div, i){
        const rec = CP4525.read(div);
        if(rec && arr[i]) arr[i].clanPrice = rec;
      });
    });
    return data;
  };
  const cp4525PreviousApply = applyData;
  applyData = function(){
    CP4525.loading = true;
    try { return cp4525PreviousApply.apply(this, arguments); }
    finally { CP4525.loading = false; }
  };
  if(typeof MODES12 === 'object' && MODES12 && typeof MODES12.set === 'function'){
    const cp4525PreviousSet = MODES12.set;
    MODES12.set = function(mode){
      const was = MODES12.mode;
      const result = cp4525PreviousSet.apply(this, arguments);
      if(result && was !== 'play' && mode === 'play') CP4525.fixAll();
      return result;
    };
  }
  if(typeof CW112 === 'object' && CW112 && typeof CW112.finish === 'function'){
    const cp4525PreviousFinish = CW112.finish;
    CW112.finish = function(){
      CP4525.fixAll();
      return cp4525PreviousFinish.apply(this, arguments);
    };
  }
