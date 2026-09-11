  // ---------- Serialize / Deserialize ----------
  // Saved-character schema version. Bump this whenever a release starts writing fields an
  // older sheet could not resolve. Saves written before versioning existed have no
  // schemaVersion at all and are read as 1.
  //   1  everything up to and including PART D — Feature 3.1
  //   2  PART E — Feature 1: Kiho, and the Monk/Brotherhood libraries built on top of them
  // The forward case is the one that actually bites: a character saved WITH Kiho, opened in a
  // rolled-back sheet that has no KIHO_LIBRARY to resolve them against. applyData() refuses
  // such a save outright rather than loading it partially, because a half-loaded character
  // that silently dropped its monk fields looks exactly like a working one.
  const SHEET_SCHEMA_VERSION = 2;
  function collectData(){
    const data = { schemaVersion: SHEET_SCHEMA_VERSION, fields:{}, rings:{}, traits:{}, traitsFree:{}, voidFree:'2', voidCurrent:0, spellUsed:{}, spellBonusUsed:0, skills:[], weapons:[], equip:[], adv:[], disadv:[], tech:[] };
    document.querySelectorAll('[id^="f_"]').forEach(el=>{ data.fields[el.id]=el.value; });
    RINGS.forEach(r=>{
      data.rings[r.key]=document.getElementById('ring_'+r.key).value;
      r.traits.forEach(t=>{
        const el = document.getElementById('trait_'+t.key);
        data.traits[t.key]=el.value;
        data.traitsFree[t.key]=el.dataset.free||'2';
      });
    });
    data.rings.void = document.getElementById('ring_void').value;
    data.voidFree = document.getElementById('ring_void').dataset.free||'2';
    data.voidCurrent = document.getElementById('void_current').value;
    SPELL_ELEMENTS.forEach(el=>{
      data.spellUsed[el.key] = document.getElementById('spell_used_'+el.key).value;
    });
    data.spellBonusUsed = document.getElementById('spell_bonus_used_shared').value;
    // Per-element bonus-pip fill state — separate from the shared total above, which only
    // gates availability. See renderSpellBonusPips(key).
    data.spellBonusUsedVisual = {};
    SPELL_ELEMENTS.forEach(el=>{
      data.spellBonusUsedVisual[el.key] = document.getElementById('spell_bonus_used_visual_'+el.key).value;
    });

    document.querySelectorAll('#skillsBody tr').forEach(tr=>{
      data.skills.push({
        name: tr.querySelector('.sk-name').value,
        trait: tr.querySelector('.sk-trait').value,
        rank: tr.querySelector('.sk-rank').value,
        emph: getEmphValues(tr).join(', '),
        freeEmph: Array.from(tr.querySelectorAll('.emph-container .emph-item-row'))
          .filter(row=>row.dataset.free==='1')
          .map(row=>{const w=row.querySelector('.sk-emph-select, .sk-emph-text'); return w?w.value.trim():'';})
          .filter(Boolean).join(', '),
        school: tr.querySelector('.sk-school').checked,
        // How much of this skill's current Rank is free (see skillCost/the skillXP loop) —
        // saved explicitly rather than recomputed on reload, since recomputing from just
        // {rank, school} would be wrong once the Rank has been bought up further than what
        // the School originally granted for free (e.g. Kuni's Lore: Shadowlands 2 -> 3).
        freeFloor: tr.querySelector('.sk-rank').dataset.free || '0',
      });
    });
    // PART B: every legacy field (name/roll/dmg/size/notes) is still written exactly as before,
    // so a Part-B save stays readable by the pre-Part-B sheet — it simply ignores the new keys.
    // The added fields are the structured half: `key` is the WEAPON_LIBRARY link (empty string
    // = deliberately custom, which is why makeWeaponRow distinguishes '' from undefined), and
    // the manual flags record which boxes the player took control of.
    document.querySelectorAll('#weaponsBody tr').forEach(tr=>{
      data.weapons.push({
        name: tr.querySelector('.wp-name').value,
        roll: tr.querySelector('.wp-roll').value,
        dmg: tr.querySelector('.wp-dmg').value,
        size: tr.querySelector('.wp-size').value,
        notes: tr.querySelector('.wp-notes').value,
        key: tr.querySelector('.wp-key').value,
        skill: tr.querySelector('.wp-skill').value,
        dmgRoll: tr.querySelector('.wp-dmg-roll').value,
        dmgKeep: tr.querySelector('.wp-dmg-keep').value,
        keywords: tr.querySelector('.wp-keywords').value,
        manualAttack: tr.dataset.manualAttack === '1',
        manualDamage: tr.dataset.manualDamage === '1',
        // PART C FEATURE 6 - wp_arrowType: which arrow this bow is loaded with (spec 5.6.B).
        // The in-flight lastArrowUsed is deliberately NOT here: it is memory-only (spec 5.6.C).
        // Arrow ITEMS need nothing new — they are ordinary Equipment rows, already saved below.
        arrowType: (tr.querySelector('.wp-arrow-type') || {}).value || '',
        // PART C FEATURE 7 - wp_hand. Technique-based overrides deliberately get NO field of
        // their own: they are derived from the Techniques list, which is already saved, so they
        // round-trip by construction. A saved copy would be a second source of truth that could
        // drift away from the Technique that granted it.
        hand: getRowHand(tr),
      });
    });
    document.querySelectorAll('#equipBody tr').forEach(tr=>{
      data.equip.push({
        name: tr.querySelector('.eq-name').value,
        qty: tr.querySelector('.eq-qty').value,
        notes: tr.querySelector('.eq-notes').value,
        schoolGranted: tr.dataset.schoolGranted || '',
      });
    });
    document.querySelectorAll('#advList .entry').forEach(div=>{
      data.adv.push({ name:div.querySelector('.en-name').value, cost:div.querySelector('.en-cost').value, desc:div.querySelector('.en-desc').value });
    });
    document.querySelectorAll('#disadvList .entry').forEach(div=>{
      data.disadv.push({ name:div.querySelector('.en-name').value, cost:div.querySelector('.en-cost').value, desc:div.querySelector('.en-desc').value });
    });
    document.querySelectorAll('#techList .entry').forEach(div=>{
      data.tech.push({ name:div.querySelector('.en-name').value, cost:div.querySelector('.en-cost')?.value ?? 0, desc:div.querySelector('.en-desc').value, spellElement:div.dataset.spellElement||'', spellMastery:div.dataset.spellMastery||'', spellKeywords:div.dataset.spellKeywords||'', spellIsMaho:div.dataset.spellIsMaho==='true', isMemorised:div.dataset.isMemorised==='true', memorisationXpCost:div.dataset.memorisationXpCost||'' });
    });
    return data;
  }

  function applyData(data){
    // Refuse a save from a NEWER sheet rather than loading part of it — see
    // SHEET_SCHEMA_VERSION above. Returns false so callers can skip their success message.
    // An older save (no schemaVersion, or a lower one) still loads exactly as before.
    const saveVersion = parseInt((data && data.schemaVersion) || 1, 10) || 1;
    if(saveVersion > SHEET_SCHEMA_VERSION){
      appAlert('This character was saved by a newer version of the sheet (format '+saveVersion
        +'; this sheet understands '+SHEET_SCHEMA_VERSION+'). Loading it here would silently drop'
        +' whatever it knows that this version does not, so it has not been loaded. Open it in the'
        +' newer sheet instead.');
      setStatus('Load refused — save format '+saveVersion+' is newer than this sheet.');
      return false;
    }
    clearAllRows();
    Object.entries(data.fields||{}).forEach(([id,val])=>{
      const el = document.getElementById(id);
      if(el) el.value = val;
    });
    RINGS.forEach(r=>{
      if(data.rings && data.rings[r.key]!==undefined) document.getElementById('ring_'+r.key).value = data.rings[r.key];
      r.traits.forEach(t=>{
        const el = document.getElementById('trait_'+t.key);
        if(data.traits && data.traits[t.key]!==undefined) el.value = data.traits[t.key];
        el.dataset.free = (data.traitsFree && data.traitsFree[t.key]!==undefined) ? data.traitsFree[t.key] : '2';
      });
    });
    if(data.rings && data.rings.void!==undefined) document.getElementById('ring_void').value = data.rings.void;
    document.getElementById('ring_void').dataset.free = (data.voidFree!==undefined) ? data.voidFree : '2';
    if(data.voidCurrent!==undefined) document.getElementById('void_current').value = data.voidCurrent;
    SPELL_ELEMENTS.forEach(el=>{
      if(data.spellUsed && data.spellUsed[el.key]!==undefined){
        document.getElementById('spell_used_'+el.key).value = data.spellUsed[el.key];
      }
    });
    // Bonus-slot totals are a single shared counter (#spell_bonus_used_shared) that gates
    // availability, plus one #spell_bonus_used_visual_<key> per element for pip-fill display
    // — see renderSpellBonusPips(). Two legacy shapes to handle for the shared total:
    //  - plain number/string: already the shared total, pass through unchanged.
    //  - old per-element object (from the original shared-pool bug, before per-element visual
    //    state existed): take the HIGHEST single element's count as the shared total — the
    //    most usage any one element's row shows is a floor on how much of the pool was
    //    actually spent (summing would double count, since that bug let the same "slot" be
    //    spent more than once across elements).
    if(typeof data.spellBonusUsed === 'number' || typeof data.spellBonusUsed === 'string'){
      document.getElementById('spell_bonus_used_shared').value = data.spellBonusUsed;
    } else if(data.spellBonusUsed && typeof data.spellBonusUsed === 'object'){
      const legacyMax = Math.max(0, ...Object.values(data.spellBonusUsed).map(v=>parseInt(v||'0',10)||0));
      document.getElementById('spell_bonus_used_shared').value = legacyMax;
    }
    // Per-element visual fill: prefer the new dedicated field. If absent, fall back to the old
    // per-element object above (same per-row numbers this feature always needed — the old bug
    // was in what they meant for availability, not in the per-row values themselves). If
    // neither is present (a save from the shared-only, pre-fix version), there's no way to
    // know which row's slots were spent, so every row starts blank; the shared total above
    // still correctly limits how many NEW bonus slots can be spent from here on.
    SPELL_ELEMENTS.forEach(el=>{
      const visualInput = document.getElementById('spell_bonus_used_visual_'+el.key);
      if(data.spellBonusUsedVisual && data.spellBonusUsedVisual[el.key]!==undefined){
        visualInput.value = data.spellBonusUsedVisual[el.key];
      } else if(data.spellBonusUsed && typeof data.spellBonusUsed === 'object' && data.spellBonusUsed[el.key]!==undefined){
        visualInput.value = data.spellBonusUsed[el.key];
      } else {
        visualInput.value = 0;
      }
    });

    (data.skills||[]).forEach(s=>document.getElementById('skillsBody').appendChild(makeSkillRow(s)));
    (data.weapons||[]).forEach(w=>document.getElementById('weaponsBody').appendChild(makeWeaponRow(w)));
    refreshAllWeaponRows();   // PART C FEATURE 7 - selector visibility depends on the row COUNT,
                              // which is only final once every saved row has been appended.
    (data.equip||[]).forEach(eq=>document.getElementById('equipBody').appendChild(makeEquipRow(eq)));
    (data.adv||[]).forEach(a=>document.getElementById('advList').appendChild(makeEntry(a,true)));
    (data.disadv||[]).forEach(d=>document.getElementById('disadvList').appendChild(makeEntry(d,true)));
    (data.tech||[]).forEach(t=>document.getElementById('techList').appendChild(makeEntry(t,true,'XP')));

    document.getElementById('headerName').textContent = (data.fields && data.fields.f_name && data.fields.f_name.trim()) || 'Unnamed Character';
    // Loading a full data set should respect the loaded Void Points / Spell Slots exactly,
    // never auto-fill new pips as if the rank had just been raised in place.
    prevVoidRank = null;
    recalcAll();
  }
  function clearAllRows(){
    ['skillsBody','weaponsBody','equipBody'].forEach(id=>document.getElementById(id).innerHTML='');
    ['advList','disadvList','techList'].forEach(id=>document.getElementById(id).innerHTML='');
    // PART C FEATURE 6 - the arrow in flight is memory-only, and it belongs to the character
    // whose weapon rows have just been thrown away. Loading or resetting a sheet must not carry
    // it across, for exactly the reason applyData() resets prevVoidRank.
    clearLastArrowUsed();
  }

  // Resets the entire sheet to exactly the state it was in when the page first loaded —
  // every field's native `defaultValue` (the value the browser recorded from the original
  // HTML/template markup) is restored, not just the dynamic table rows. This covers text
  // fields, Traits, Rings, Void rank/points, Honor/Glory/Status, XP, Armor, Wounds, money,
  // and the hidden Family/School "applied" tracking fields (so Apply Family/School work
  // again on the fresh sheet instead of staying greyed out).
  function resetToBaseline(){
    clearAllRows();
    document.querySelectorAll('[id^="f_"]').forEach(el=>{
      // Hidden inputs (type="hidden") don't behave like text/number inputs here: setting
      // .value on them rewrites the underlying "value" attribute directly (no separate
      // dirty-value state), so their defaultValue just mirrors whatever was last written —
      // it never remembers the original blank state. These four are all record-keeping
      // fields for Apply Family / Apply School / School-granted Techniques, and their true
      // baseline is always empty, so they're cleared explicitly instead of via defaultValue.
      if(el.type==='hidden'){ el.value = ''; }
      else{ el.value = el.defaultValue; }
    });
    RINGS.forEach(r=>{
      r.traits.forEach(t=>{
        const el = document.getElementById('trait_'+t.key);
        el.value = el.defaultValue;
        el.dataset.free = '2';
      });
    });
    const voidEl = document.getElementById('ring_void');
    voidEl.value = voidEl.defaultValue;
    voidEl.dataset.free = '2';
    const voidCurrentEl = document.getElementById('void_current');
    voidCurrentEl.value = voidCurrentEl.defaultValue;
    SPELL_ELEMENTS.forEach(el=>{
      const spellUsedEl = document.getElementById('spell_used_'+el.key);
      spellUsedEl.value = spellUsedEl.defaultValue;
    });
    const spellBonusUsedEl = document.getElementById('spell_bonus_used_shared');
    spellBonusUsedEl.value = spellBonusUsedEl.defaultValue;
    SPELL_ELEMENTS.forEach(el=>{
      const visualEl = document.getElementById('spell_bonus_used_visual_'+el.key);
      visualEl.value = visualEl.defaultValue;
    });

    document.getElementById('headerName').textContent = 'Unnamed Character';
    prevVoidRank = null; // baseline void_current above is authoritative; don't auto-top-up
    recalcAll();
  }

  // ---------- Storage ----------
  const INDEX_KEY = 'l5r-char-index';

  // window.storage is not a standard browser API — it's a bridge injected by Claude's
  // hosting environment (web app / iOS app). It does not exist at all when this file is
  // opened directly in a browser (e.g. a downloaded copy opened via file:// or a plain
  // http server), and different Claude surfaces have been observed to implement the bridge
  // slightly differently. When window.storage isn't present, these helpers fall back to the
  // browser's own localStorage instead — so a downloaded copy of this sheet still gets a
  // working Save/Load/Delete, just scoped to that browser profile on that device rather
  // than synced through Claude. Both paths are made to return/consume the same
  // {key, value, shared} shape, so nothing above this layer (getIndex, Save, Load, Delete)
  // needs to know or care which one actually served the request.
  function storageAvailable(){
    return typeof window !== 'undefined' && !!window.storage &&
      typeof window.storage.get === 'function' &&
      typeof window.storage.set === 'function' &&
      typeof window.storage.delete === 'function';
  }
  // A raw localStorage key must be unique across the whole browser profile (unlike Claude's
  // bridge, which already scopes storage to this artifact) — prefix everything so this sheet
  // can never collide with anything else living in the same origin's localStorage.
  function localStorageKey(key, shared){ return 'l5r-sheet:'+(shared?'shared':'local')+':'+key; }
  function localStorageAvailable(){
    try{
      const testKey = '__l5r_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    }catch(e){ return false; }
  }
  async function storageGet(key, shared){
    if(storageAvailable()){
      const r = await window.storage.get(key, shared);
      if(r === null || r === undefined) return null;
      if(typeof r !== 'object' || typeof r.value !== 'string'){
        const e = new Error('Storage returned an unexpected response shape'); e.code='BAD_RESPONSE'; throw e;
      }
      return r;
    }
    if(!localStorageAvailable()){ const e=new Error('No storage API in this context'); e.code='NO_STORAGE_API'; throw e; }
    try{
      const value = window.localStorage.getItem(localStorageKey(key, shared));
      return value === null ? null : {key, value, shared: !!shared};
    }catch(e){
      const err = new Error(e && e.message ? e.message : 'localStorage read failed'); err.code='LOCAL_STORAGE_ERROR'; throw err;
    }
  }
  async function storageSet(key, value, shared){
    if(storageAvailable()){
      const r = await window.storage.set(key, value, shared);
      if(!r || typeof r !== 'object'){
        const e = new Error('Storage returned an unexpected response shape'); e.code='BAD_RESPONSE'; throw e;
      }
      return r;
    }
    if(!localStorageAvailable()){ const e=new Error('No storage API in this context'); e.code='NO_STORAGE_API'; throw e; }
    try{
      window.localStorage.setItem(localStorageKey(key, shared), value);
      return {key, value, shared: !!shared};
    }catch(e){
      // Most commonly a quota error (localStorage is typically capped around 5-10MB/origin).
      const err = new Error(e && e.message ? e.message : 'localStorage write failed'); err.code='LOCAL_STORAGE_ERROR'; throw err;
    }
  }
  async function storageDelete(key, shared){
    if(storageAvailable()){
      return await window.storage.delete(key, shared);
    }
    if(!localStorageAvailable()){ const e=new Error('No storage API in this context'); e.code='NO_STORAGE_API'; throw e; }
    try{
      const k = localStorageKey(key, shared);
      const existed = window.localStorage.getItem(k) !== null;
      window.localStorage.removeItem(k);
      return {key, deleted: existed, shared: !!shared};
    }catch(e){
      const err = new Error(e && e.message ? e.message : 'localStorage delete failed'); err.code='LOCAL_STORAGE_ERROR'; throw err;
    }
  }
  function storageErrorMessage(e){
    if(e && e.code==='NO_STORAGE_API') return 'no storage available in this browser (private/incognito browsing or a strict privacy setting may be blocking it) — use Export JSON to save a file instead';
    if(e && e.code==='BAD_RESPONSE') return 'storage returned an unexpected response — try again, or use Export JSON as a backup';
    if(e && e.code==='LOCAL_STORAGE_ERROR') return 'this browser\u2019s local storage failed ('+e.message+') — it may be full or disabled. Use Export JSON to save a file instead';
    // Anything else is an error the storage bridge itself threw (not something this sheet's
    // own code produced) — surface its actual message instead of hiding it behind a generic
    // label, since that's the only way to tell a host/platform bug from something else.
    if(e && e.message) return 'storage error — '+e.message;
    return 'storage error';
  }

  // Replaces window.confirm(), which can be silently blocked inside a sandboxed iframe
  // (some Claude surfaces disallow native dialogs entirely — calling confirm() there can
  // return false immediately with no error and no dialog ever shown, which made Delete
  // look like it was doing nothing). This is a self-contained modal with the same
  // true/false contract, so it works identically everywhere.
  function appConfirm(message, okLabel, okClass, cancelLabel){
    return new Promise(resolve=>{
      const overlay = document.getElementById('appConfirmOverlay');
      document.getElementById('appConfirmTitle').textContent = 'Confirm';
      document.getElementById('appConfirmMsg').textContent = message;
      const okBtnEl = document.getElementById('appConfirmOk');
      okBtnEl.textContent = okLabel || 'OK';
      okBtnEl.className = okClass || 'ghost';
      const cancelBtnEl = document.getElementById('appConfirmCancel');
      cancelBtnEl.style.display = '';
      cancelBtnEl.textContent = cancelLabel || 'Cancel';
      overlay.style.display = 'flex';
      const cleanup = (result)=>{
        overlay.style.display = 'none';
        cancelBtnEl.textContent = 'Cancel'; // restore default for the next caller
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        xBtn.removeEventListener('click', onCancel);
        resolve(result);
      };
      const okBtn = document.getElementById('appConfirmOk');
      const cancelBtn = document.getElementById('appConfirmCancel');
      const xBtn = document.getElementById('appConfirmX');
      const onOk = ()=>cleanup(true);
      const onCancel = ()=>cleanup(false);
      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      xBtn.addEventListener('click', onCancel);
    });
  }
  // Three-way variant of appConfirm(), for a choice where the ✕ (or clicking outside) must
  // mean "abort the whole action" rather than count as the Cancel-labelled option — e.g. the
  // Maho blood-source pop-up (castMahoSpell): Own Blood, Someone Else's Blood, and ✕/outside
  // (abort casting entirely — no Wounds, no Taint, no roll) all need to resolve differently.
  // Resolves 'ok' (OK button), 'cancel' (Cancel-labelled button), or null (✕ / clicking outside).
  function appConfirm3Way(message, okLabel, okClass, cancelLabel){
    return new Promise(resolve=>{
      const overlay = document.getElementById('appConfirmOverlay');
      document.getElementById('appConfirmTitle').textContent = 'Confirm';
      document.getElementById('appConfirmMsg').textContent = message;
      const okBtnEl = document.getElementById('appConfirmOk');
      okBtnEl.textContent = okLabel || 'OK';
      okBtnEl.className = okClass || 'ghost';
      const cancelBtnEl = document.getElementById('appConfirmCancel');
      cancelBtnEl.style.display = '';
      cancelBtnEl.textContent = cancelLabel || 'Cancel';
      overlay.style.display = 'flex';
      const cleanup = (result)=>{
        overlay.style.display = 'none';
        cancelBtnEl.textContent = 'Cancel'; // restore default for the next caller
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        xBtn.removeEventListener('click', onClose);
        resolve(result);
      };
      const okBtn = document.getElementById('appConfirmOk');
      const cancelBtn = document.getElementById('appConfirmCancel');
      const xBtn = document.getElementById('appConfirmX');
      const onOk = ()=>cleanup('ok');
      const onCancel = ()=>cleanup('cancel');
      const onClose = ()=>cleanup(null);
      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      xBtn.addEventListener('click', onClose);
    });
  }
  // Single-button variant of appConfirm(), for messages that just need acknowledging (no
  // Yes/No decision) — e.g. "all spell slots used". Reuses the same modal markup so it gets
  // the same sandboxed-iframe-safe behavior as appConfirm(), just with Cancel hidden.
  function appAlert(message, okLabel){
    return new Promise(resolve=>{
      const overlay = document.getElementById('appConfirmOverlay');
      document.getElementById('appConfirmTitle').textContent = 'Notice';
      document.getElementById('appConfirmMsg').textContent = message;
      const okBtnEl = document.getElementById('appConfirmOk');
      okBtnEl.textContent = okLabel || 'OK';
      okBtnEl.className = 'ghost';
      const cancelBtnEl = document.getElementById('appConfirmCancel');
      cancelBtnEl.style.display = 'none';
      overlay.style.display = 'flex';
      const cleanup = ()=>{
        overlay.style.display = 'none';
        cancelBtnEl.style.display = '';
        okBtn.removeEventListener('click', onOk);
        xBtn.removeEventListener('click', onOk);
        resolve();
      };
      const okBtn = document.getElementById('appConfirmOk');
      const xBtn = document.getElementById('appConfirmX');
      const onOk = ()=>cleanup();
      okBtn.addEventListener('click', onOk);
      xBtn.addEventListener('click', onOk);
    });
  }

  async function getIndex(){
    try{
      const r = await storageGet(INDEX_KEY, false);
      return r ? JSON.parse(r.value) : [];
    }catch(e){ return []; }
  }
  async function setIndex(list){
    await storageSet(INDEX_KEY, JSON.stringify(list), false);
  }
  function charKey(id){ return 'l5r-char:'+id; }

  async function refreshCharSelect(selectId){
    const list = await getIndex();
    const sel = document.getElementById('charSelect');
    sel.innerHTML = '<option value="">— New / unsaved —</option>' +
      list.map(c=>`<option value="${c.id}">${escHtml(c.name||'Unnamed')} ${c.clan? '— '+escHtml(c.clan):''}</option>`).join('');
    if(selectId) sel.value = selectId;
  }

  async function saveCharacter(asNew){
    const data = collectData();
    const name = data.fields.f_name || 'Unnamed';
    const clan = data.fields.f_clan || '';
    let id = currentId;
    if(asNew || !id){
      id = 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
    }
    try{
      await storageSet(charKey(id), JSON.stringify(data), false);
      const list = await getIndex();
      const idx = list.findIndex(c=>c.id===id);
      const entry = { id, name, clan, updatedAt: Date.now() };
      if(idx>=0) list[idx]=entry; else list.push(entry);
      await setIndex(list);
      currentId = id;
      await refreshCharSelect(id);
      stampSeal();
      setStatus('Saved "'+name+'".');
    }catch(e){
      setStatus('Save failed — '+storageErrorMessage(e)+'.');
      console.error(e);
      const wantsExport = await appConfirm('Save failed. Export this character as a JSON file now so your work isn\u2019t lost?', 'Export JSON', 'ghost');
      if(wantsExport){
        exportJSON(data);
        setStatus('Save failed, but exported a backup JSON file.');
      }
    }
  }

  async function loadCharacter(id){
    if(!id){ resetToBaseline(); currentId=null; setStatus('Blank sheet.'); return; }
    try{
      const r = await storageGet(charKey(id), false);
      if(!r){ setStatus('Could not find that character.'); return; }
      const data = JSON.parse(r.value);
      if(applyData(data) === false) return; // newer save format — applyData already explained why
      currentId = id;
      setStatus('Loaded.');
    }catch(e){
      setStatus('Load failed — '+storageErrorMessage(e)+'.');
      console.error(e);
    }
  }

  async function deleteCharacter(){
    if(!currentId){ setStatus('Nothing loaded to delete.'); return; }
    const ok = await appConfirm('Delete this character permanently?', 'Delete', 'danger');
    if(!ok) return;
    try{
      await storageDelete(charKey(currentId), false);
      const list = (await getIndex()).filter(c=>c.id!==currentId);
      await setIndex(list);
      currentId = null;
      resetToBaseline();
      await refreshCharSelect();
      setStatus('Deleted.');
    }catch(e){
      setStatus('Delete failed — '+storageErrorMessage(e)+'.');
      console.error(e);
    }
  }

  document.getElementById('btnSave').addEventListener('click', ()=>saveCharacter(false));
  document.getElementById('btnSaveAs').addEventListener('click', ()=>saveCharacter(true));
  document.getElementById('btnNew').addEventListener('click', async ()=>{
    const ok = await appConfirm('Clear the sheet? Unsaved changes will be lost.', 'Clear Sheet', 'ghost');
    if(ok){
      currentId=null;
      resetToBaseline();
      document.getElementById('charSelect').value='';
      setStatus('New blank sheet.');
    }
  });
  document.getElementById('btnLoad').addEventListener('click', ()=>{
    const id = document.getElementById('charSelect').value;
    loadCharacter(id);
  });
  document.getElementById('btnDelete').addEventListener('click', deleteCharacter);

  // window.print() opens the browser's native print dialog — but native dialogs (print,
  // alert, confirm, prompt) require the sandboxed iframe's `allow-modals` permission, and
  // Claude's artifact hosting has been observed to render pages inside such a sandboxed
  // iframe. When that permission isn't granted, window.print() typically fails *silently*:
  // no error is thrown and no dialog appears, which is exactly what makes this look like
  // "the button does nothing" rather than a clear failure (the same class of issue already
  // worked around for window.confirm() via appConfirm() below). There's no way to fix that
  // from inside this page — printing fundamentally requires the browser's real print
  // pipeline, which can't be reimplemented in-page — so the best this can do is never leave
  // the click looking like it did nothing: attempt the real print, and always follow up with
  // the actual fallback (download the file and print it outside the sandboxed preview).
  document.getElementById('btnPrint').addEventListener('click', ()=>{
    try{
      window.print();
      setStatus('Opening the print dialog\u2026 if nothing appears, this preview may be sandboxed \u2014 download the HTML file and open it directly in your browser, then print from there (Ctrl/Cmd+P).');
    }catch(e){
      setStatus('Print is blocked in this preview \u2014 download the HTML file and open it directly in your browser, then print from there (Ctrl/Cmd+P).');
    }
  });

  function exportJSON(data){
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fname = (data.fields.f_name||'character').replace(/[^a-z0-9\-_]+/gi,'_');
    a.href = url; a.download = fname+'.l5r.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  document.getElementById('btnExport').addEventListener('click', ()=>{
    const data = collectData();
    exportJSON(data);
    setStatus('Exported JSON.');
  });
  document.getElementById('btnImportTrigger').addEventListener('click', ()=>document.getElementById('fileImport').click());
  document.getElementById('fileImport').addEventListener('change', async (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    try{
      const text = await file.text();
      const data = JSON.parse(text);
      // Clear the file input on the way out too, or re-picking the same file fires no change event.
      if(applyData(data) === false){ e.target.value=''; return; } // newer save format — applyData already explained why
      currentId = null;
      document.getElementById('charSelect').value='';
      setStatus('Imported "'+(data.fields && data.fields.f_name || 'character')+'". Save to keep it in your library.');
    }catch(err){
      setStatus('Import failed — invalid file.');
      console.error(err);
    }
    e.target.value='';
  });

  // ---------- Modal stacking (catch-all) ----------
  // Every pop-up on this sheet shares the .roll-modal-overlay class and is opened by setting
  // its own inline style.display='flex' from many separate, independent functions scattered
  // throughout this file (showRollResult, pickAffinityElement, pickUniversalSpellElement,
  // pickDeficiencyElement, appAlert/appConfirm, the Skill/Void/Wound info modals, the
  // Untrained Skills modal, etc.) — rather than hunting down and editing every individual
  // open call site (fragile: any new modal added later would silently fall outside the rule),
  // a single MutationObserver per overlay watches its own `style` attribute and, whenever it
  // transitions from hidden to visible, promotes it above every other currently-visible
  // overlay by handing it the next z-index off one shared, ever-increasing counter. Since
  // every overlay is a full-viewport position:fixed backdrop (see .roll-modal-overlay above),
  // being on top also means it's the only thing that can receive clicks — so "must be closed
  // first" falls out for free, with no separate input-blocking logic, for ANY pop-up opening
  // on top of ANY other, not just the one pairing (appAlert over the Element picker) that
  // originally prompted this.
  let modalStackTop = 999;
  function refreshModalStacking(overlay){
    const isVisible = overlay.style.display !== 'none' && overlay.style.display !== '';
    const wasVisible = overlay.dataset.modalVisible === '1';
    if(isVisible && !wasVisible){
      modalStackTop += 1;
      overlay.style.zIndex = modalStackTop; // mutates 'style' too, but see note below
    }
    // Set AFTER the check above, and BEFORE the MutationObserver callback this same
    // assignment re-triggers actually runs (MutationObserver callbacks are microtasks, queued
    // until this synchronous function returns) — so on that re-entrant call, wasVisible now
    // reads '1' already, isVisible is unchanged, and the `if` above is false: no infinite loop,
    // no double-increment.
    overlay.dataset.modalVisible = isVisible ? '1' : '0';
  }
  document.querySelectorAll('.roll-modal-overlay').forEach(overlay=>{
    refreshModalStacking(overlay); // establishes baseline; none start visible
    new MutationObserver(()=>refreshModalStacking(overlay))
      .observe(overlay, { attributes:true, attributeFilter:['style'] });
  });
