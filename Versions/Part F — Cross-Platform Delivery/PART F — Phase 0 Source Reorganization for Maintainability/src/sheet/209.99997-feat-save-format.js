
  // ============ PART J PHASE 7 — SAVE FORMAT AND MIGRATION (first release) ============
  // One authority for the save format. Before this part the number a save carries was set by
  // whichever feature last raised it: the trunk's SHEET_SCHEMA_VERSION says 2, Phase 4.5.2 stamps 3
  // through its own collectData wrapper and migrates on load through its own applyData wrapper,
  // and Phase 11's Import has to ask collectData() what is really written. A feature that needed
  // format 4 would have added a third wrapper around those two.
  //
  // THE FORMAT IS A CHAIN OF REGISTERED STEPS. VersionManager holds one step per format change
  // (1 -> 2, 2 -> 3, ...); the current format is the end of the chain. Every save and export is
  // stamped with it, and anything older is carried up through the steps:
  //   - on the way into storage (Import, and Save As a copy of a character that has not been
  //     opened since an older import), by a wrapper on storageSet() for character records only;
  //   - on the way out (Export JSON, including the Characters list's export of a character that
  //     has never been opened here), by a wrapper on exportJSON();
  //   - on load, by a wrapper on applyData(), which then hands the older layers below the format
  //     they understand.
  // A save that is already current, newer than this sheet, or carries a version that is not a
  // whole number from 1 up is passed through UNTOUCHED, so the existing refusals and messages
  // apply exactly as before. Stored characters are never rewritten in bulk (owner's ruling, 30
  // September 2026): an older one is upgraded when it is next opened, copied or exported.
  //
  // DO NOT RAISE SHEET_SCHEMA_VERSION to "fix" it. That constant is what the trunk ALONE
  // understands. With Phase 4.5.2 removed, a trunk that accepted format 3 would load a format-3
  // save and silently drop its Advantage configurations -- the exact failure the trunk's refusal
  // exists to prevent. The format this build writes is VersionManager.current().
  //
  // A LATER FORMAT CHANGE registers one step here (VersionManager.register(3, name, fn)) and
  // handles its own fields; stamping, Import, Export and the load gate follow the chain.
  //
  // File names: an export keeps the character's name, accents included ("Sairyū.l5r.json", not
  // "Sairy_.l5r.json"): letters and digits of any script stay; anything else becomes "_" as before.
  // Owner's ruling of 25 September: fix it with the next change to export, which this is.
  const SAVE_FORMAT_ENABLED = true;

  const VersionManager = (function(){
    const api = {};
    const steps = {};          // from -> {from, to, name, fn}
    api.bypass = false;        // test seam only: lets a harness read a save through the older layers alone
    api.enabled = function(){ return SAVE_FORMAT_ENABLED; };

    api.register = function(from, name, fn){
      if(!Number.isInteger(from) || from < 1 || typeof fn !== 'function') throw new Error('VersionManager.register(from, name, fn)');
      if(steps[from]) throw new Error('A save-format step from format ' + from + ' is already registered: ' + steps[from].name);
      steps[from] = {from:from, to:from + 1, name:String(name || ''), fn:fn};
    };
    api.steps = function(){
      return Object.keys(steps).map(Number).sort(function(a, b){ return a - b; })
        .map(function(k){ return {from:steps[k].from, to:steps[k].to, name:steps[k].name}; });
    };
    // The end of the unbroken chain from format 1: the format this build writes and reads.
    api.current = function(){ let v = 1; while(steps[v]) v = steps[v].to; return v; };
    // The newest format the layers BELOW this part accept on load: 4.5.2's when it is installed,
    // otherwise the trunk's own. applyData hands them nothing newer.
    api.innerFormat = function(){
      if(typeof D45 === 'object' && D45 && typeof D45.enabled === 'function' && D45.enabled()
        && Number.isInteger(D45.SAVE_SCHEMA_VERSION)) return D45.SAVE_SCHEMA_VERSION;
      return SHEET_SCHEMA_VERSION;
    };

    // A save's format as the load path already reads it: no number is format 1; anything that is
    // not a whole number from 1 up is invalid (null) and left for the existing refusals.
    api.versionOf = function(data){
      if(!data || typeof data !== 'object' || !data.fields || typeof data.fields !== 'object') return null;
      if(data.schemaVersion === undefined) return 1;
      const v = Number(data.schemaVersion);
      return Number.isInteger(v) && v >= 1 ? v : null;
    };
    // 'old' (upgrade it), 'current', 'newer' or 'invalid'.
    api.classify = function(data){
      const v = api.versionOf(data);
      if(v === null) return 'invalid';
      const c = api.current();
      return v < c ? 'old' : v === c ? 'current' : 'newer';
    };
    // A copy of an older save carried up to the current format. Anything else comes back as it is
    // (the same object), so callers can tell that nothing was done.
    api.upgrade = function(data){
      if(api.classify(data) !== 'old') return data;
      let copy = JSON.parse(JSON.stringify(data));
      let v = api.versionOf(copy);
      const target = api.current();
      while(v < target){
        const step = steps[v];
        const next = step.fn(copy);
        if(next && typeof next === 'object') copy = next;
        copy.schemaVersion = step.to;
        v = step.to;
      }
      return copy;
    };
    // The same, for a stored JSON string. A string that is not a character save, or that needs
    // nothing, is returned unchanged -- byte for byte.
    api.upgradeText = function(text){
      if(typeof text !== 'string') return text;
      let data;
      try { data = JSON.parse(text); } catch(e){ return text; }
      const up = api.upgrade(data);
      return up === data ? text : JSON.stringify(up);
    };

    // ---- File names ----
    api.fileBase = function(data){
      const name = String((data && data.fields && data.fields.f_name) || 'character').normalize('NFC');
      return name.replace(/[^\p{L}\p{M}\p{N}\-_]+/gu, '_');
    };
    api.fileName = function(data){ return api.fileBase(data) + '.l5r.json'; };
    // The plain browser download, as the trunk's exportJSON() does it, with this part's file name.
    api.download = function(data){
      const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = api.fileName(data);
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    };
    return api;
  })();

  // The steps that exist today. 1 -> 2 is Feature 1 (Part E), Kiho: it only ADDED optional fields,
  // so a format-1 save needs no change. 2 -> 3 is Phase 4.5.2's own migration, reused as it is,
  // and only while 4.5.2 is installed -- without it this build writes and reads format 2.
  VersionManager.register(1, 'Feature 1 (Part E): Kiho fields added, no change needed', function(data){ return data; });
  if(typeof D45 === 'object' && D45 && typeof D45.enabled === 'function' && D45.enabled() && typeof D45.migrate === 'function'){
    VersionManager.register(2, 'Phase 4.5.2 (Part I): Advantage and Disadvantage configurations', function(data){
      return D45.migrate(data);
    });
  }

  // Called from the trunk's exportJSON() (120-persistence.js, guarded): true when this part made
  // the download, false to let the trunk make it as before.
  function saveFormatDownload(data){
    if(!VersionManager.enabled()) return false;
    VersionManager.download(data);
    return true;
  }

  if(VersionManager.enabled()){
    // Every save and export carries the current format. Never lowers a number a layer below wrote.
    const sf7PreviousCollect = collectData;
    collectData = function(){
      const data = sf7PreviousCollect.apply(this, arguments);
      const inner = Number(data.schemaVersion) || 1;
      data.schemaVersion = Math.max(inner, VersionManager.current());
      return data;
    };

    // Older saves are carried up before the layers below read them; those layers are then handed
    // the newest format THEY accept. Current, newer and invalid saves pass through untouched.
    const sf7PreviousApply = applyData;
    applyData = function(data){
      const kind = VersionManager.classify(data);
      if(VersionManager.bypass || kind === 'invalid' || kind === 'newer') return sf7PreviousApply.apply(this, arguments);
      const up = VersionManager.upgrade(data);
      const inner = VersionManager.innerFormat();
      // A current save the layers below already accept goes down as it is, the same object.
      if(up === data && VersionManager.current() <= inner) return sf7PreviousApply.apply(this, arguments);
      const handed = up === data ? JSON.parse(JSON.stringify(data)) : up;
      if(handed.schemaVersion > inner) handed.schemaVersion = inner;
      return sf7PreviousApply.call(this, handed);
    };

    // Character records only ('l5r-char:<id>'; the index is 'l5r-char-index'). Import and Save As a
    // copy write through here, so an older save is stored in the current format.
    const sf7PreviousStorageSet = storageSet;
    storageSet = function(key, value, shared){
      if(typeof key === 'string' && key.indexOf('l5r-char:') === 0) value = VersionManager.upgradeText(value);
      return sf7PreviousStorageSet.call(this, key, value, shared);
    };

    // Every export, including the Characters list's export of a character never opened here.
    const sf7PreviousExport = exportJSON;
    exportJSON = function(data){
      return sf7PreviousExport.call(this, VersionManager.upgrade(data));
    };

    // The phone's share sheet names the file through Phase 11's own helper.
    if(typeof CL11 === 'object' && CL11 && typeof CL11.fileName === 'function'){
      CL11.fileName = function(data){ return VersionManager.fileName(data); };
    }
  }
  // ============ END PART J PHASE 7 ============
