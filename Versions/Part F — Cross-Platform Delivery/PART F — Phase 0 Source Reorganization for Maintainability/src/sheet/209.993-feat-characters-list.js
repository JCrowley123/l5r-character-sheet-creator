  // ============ PART K PHASE 11 — CHARACTERS LIST & SAVE MODEL ============
  // The first stage of Phase 11: a Characters screen that lists every saved character, opens one
  // with a tap, and carries each character's own menu (Export JSON, Save As a copy, Delete), plus
  // Import JSON as a list-level action. Around it: autosave for a character that has been saved
  // once, and an Export JSON that uses the phone's share sheet where there is one.
  //
  // NOTHING IN THE SAVE FORMAT CHANGES. Characters are still written by collectData() under the
  // same 'l5r-char:<id>' keys, listed in the same 'l5r-char-index', through the same storageGet/
  // storageSet helpers (120-persistence.js). This fragment only adds ways to reach them.
  //
  // THE SCREEN IS AN OVERLAY, NOT A SECOND PAGE. It covers the sheet rather than hiding it, so the
  // carousel underneath keeps its layout and scroll position exactly; hiding the sheet with
  // display:none would change every page width the carousel measures.
  //
  // THE OLD TOOLBAR STAYS. The roadmap asks for the Load picker to be replaced by this screen, but
  // ten retained harnesses drive #charSelect and #btnLoad directly, and Phase 12 (Play/Management
  // split) rebuilds that chrome anyway. So this stage adds a Characters button in front of it, and
  // any load, however it is started, closes the Characters screen.
  //
  // AUTOSAVE ONLY FOLLOWS A CHARACTER THAT ALREADY HAS A SAVE. A fresh sheet is not written until
  // Save, Save As or Create New Character gives it one, so trying things out on a blank sheet never
  // fills the list with unnamed entries. A change is detected by comparing collectData() with what
  // was last written, a moment after the last input, so a burst of edits is one write and an
  // unchanged sheet is none. Leaving the page, loading, New Blank or importing over a character
  // first writes its pending changes, so nothing typed in the last moment is lost.
  const CHARACTERS_LIST_ENABLED = true;
  const CHARACTERS_AUTOSAVE_ENABLED = true;
  const CHARACTERS_SHARE_ENABLED = true;

  const CL11 = (function(){
    const api = {};
    api.enabled = function(){ return CHARACTERS_LIST_ENABLED; };
    api.autosaveEnabled = function(){ return CHARACTERS_LIST_ENABLED && CHARACTERS_AUTOSAVE_ENABLED; };
    api.shareEnabled = function(){ return CHARACTERS_LIST_ENABLED && CHARACTERS_SHARE_ENABLED; };
    api.AUTOSAVE_DELAY = 1200;
    api.lastSaved = null;   // collectData() JSON last written for currentId
    api.blank = null;       // collectData() JSON of an untouched sheet
    api.timer = null;
    api.writes = 0;         // autosave writes; lets a harness prove no duplicate saves
    api.failedNotice = false;
    api.entries = [];
    api.view = null;
    api.ready = false;

    api.snapshot = function(){ return JSON.stringify(collectData()); };
    api.newId = function(){ return 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2,8); };
    api.markSaved = function(){ api.lastSaved = currentId ? api.snapshot() : null; };
    api.syncPicker = function(){
      const sel = document.getElementById('charSelect');
      if(sel) sel.value = currentId || '';
    };

    // ---- Autosave ----
    // prepare() is synchronous: it reads the sheet NOW, before whatever is about to replace it.
    api.prepare = function(){
      if(!api.autosaveEnabled() || !currentId) return null;
      const data = collectData();
      const text = JSON.stringify(data);
      if(text === api.lastSaved) return null;
      api.lastSaved = text;   // claimed up front, so an overlapping flush cannot write it twice
      return {id:currentId, data:data, text:text};
    };
    api.write = async function(job){
      if(!job) return false;
      try{
        const list = await getIndex();
        const idx = list.findIndex(function(c){ return c.id === job.id; });
        // Autosave only ever updates a listed character. One deleted meanwhile stays deleted.
        if(idx < 0){ if(api.lastSaved === job.text) api.lastSaved = null; return false; }
        await storageSet(charKey(job.id), job.text, false);
        const name = job.data.fields.f_name || 'Unnamed', clan = job.data.fields.f_clan || '';
        const before = list[idx];
        list[idx] = {id:job.id, name:name, clan:clan, updatedAt:Date.now()};
        await setIndex(list);
        if(before.name !== name || before.clan !== clan){
          await refreshCharSelect(currentId || undefined);
        }
        api.writes += 1;
        api.failedNotice = false;
        if(api.view && !api.view.hidden) api.render();
        return true;
      }catch(e){
        if(api.lastSaved === job.text) api.lastSaved = null;   // try again on the next change
        if(!api.failedNotice){
          setStatus('Autosave failed — ' + storageErrorMessage(e) + '.');
          api.failedNotice = true;
        }
        console.error(e);
        return false;
      }
    };
    api.flush = function(){
      clearTimeout(api.timer);
      api.timer = null;
      return api.write(api.prepare());
    };
    api.schedule = function(){
      if(!api.autosaveEnabled() || !currentId) return;
      clearTimeout(api.timer);
      api.timer = setTimeout(api.flush, api.AUTOSAVE_DELAY);
    };

    // ---- Share-aware export ----
    // The phone's share sheet (Save to Files, AirDrop, Mail...) where the browser offers file
    // sharing on a touch device; everywhere else the sheet's own download. Called straight from a
    // tap with no await before navigator.share(), because Safari only allows sharing while it
    // still counts the tap as the reason.
    api.fileName = function(data){
      return ((data.fields && data.fields.f_name) || 'character').replace(/[^a-z0-9\-_]+/gi, '_') + '.l5r.json';
    };
    api.shareFile = function(data){
      if(!api.shareEnabled() || typeof File !== 'function' || !navigator.share || !navigator.canShare) return null;
      if(!window.matchMedia || !window.matchMedia('(pointer: coarse)').matches) return null;
      const file = new File([JSON.stringify(data, null, 2)], api.fileName(data), {type:'application/json'});
      try { return navigator.canShare({files:[file]}) ? file : null; } catch(e){ return null; }
    };

    // ---- The Characters screen ----
    api.clanKey = function(clan){
      if(typeof CLAN_MON_DATA !== 'object' || !CLAN_MON_DATA || !clan) return null;
      const lower = String(clan).toLowerCase();
      return Object.keys(CLAN_MON_DATA).find(function(k){ return lower.indexOf(k.toLowerCase()) >= 0; }) || null;
    };
    api.summary = function(entry){
      const f = (entry.data && entry.data.fields) || {};
      const school = String(f.f_school || '').trim();
      const rank = parseInt(f.f_insightRank, 10);
      const clan = String(f.f_clan || entry.clan || '').trim();
      const family = String(f.f_family || '').trim();
      return {
        name: String(f.f_name || entry.name || '').trim() || 'Unnamed',
        line: [school || 'No School yet', rank > 0 ? 'Insight Rank ' + rank : ''].filter(Boolean).join(' · '),
        sub: [family, clan].filter(Boolean).join(' · '),
        clan: clan,
      };
    };
    api.load = async function(){
      const list = await getIndex();
      const out = [];
      for(const c of list){
        let data = null;
        try {
          const r = await storageGet(charKey(c.id), false);
          if(r) data = JSON.parse(r.value);
        } catch(e){ data = null; }
        out.push({id:c.id, name:c.name, clan:c.clan, updatedAt:c.updatedAt || 0, data:data});
      }
      out.sort(function(a, b){ return b.updatedAt - a.updatedAt; });
      api.entries = out;
      return out;
    };
    api.find = function(id){ return api.entries.find(function(e){ return e.id === id; }) || null; };

    function el(tag, cls, text){
      const node = document.createElement(tag);
      if(cls) node.className = cls;
      if(text !== undefined) node.textContent = text;
      return node;
    }
    api.build = function(){
      if(api.view) return api.view;
      const view = el('div', 'cl11-view');
      view.id = 'cl11View';
      view.hidden = true;
      view.setAttribute('role', 'region');
      view.setAttribute('aria-label', 'Characters');

      const nav = el('nav', 'cl11-nav');
      nav.setAttribute('aria-label', 'App sections');
      const back = el('button', 'cl11-back', '‹ Sheet');
      back.type = 'button';
      back.id = 'cl11Back';
      back.setAttribute('aria-label', 'Back to sheet');
      nav.appendChild(back);
      [['characters', 'Characters'], ['library', 'Library'], ['search', 'Search']].forEach(function(pair){
        const b = el('button', 'cl11-tab', pair[1]);
        b.type = 'button';
        b.dataset.tab = pair[0];
        nav.appendChild(b);
      });
      view.appendChild(nav);

      const chars = el('section', 'cl11-panel');
      chars.dataset.panel = 'characters';
      const head = el('div', 'cl11-head');
      head.appendChild(el('h2', 'cl11-title', 'Characters'));
      const actions = el('div', 'cl11-actions');
      const create = el('button', 'cl11-create', 'Create New Character');
      create.type = 'button';
      create.id = 'cl11Create';
      const imp = el('button', 'ghost cl11-import', 'Import JSON');
      imp.type = 'button';
      imp.id = 'cl11Import';
      const file = document.createElement('input');
      file.type = 'file';
      file.id = 'cl11ImportFile';
      file.accept = 'application/json,.json';
      file.hidden = true;
      actions.appendChild(create);
      actions.appendChild(imp);
      actions.appendChild(file);
      head.appendChild(actions);
      chars.appendChild(head);
      const list = el('ul', 'cl11-list');
      list.id = 'cl11List';
      chars.appendChild(list);
      const empty = el('p', 'cl11-empty', 'No saved characters yet. Create one, or import a JSON file.');
      empty.id = 'cl11Empty';
      empty.hidden = true;
      chars.appendChild(empty);
      view.appendChild(chars);

      [['library', 'Library', 'The sourcebook Library arrives in Phase 13.'],
       ['search', 'Search', 'Search arrives in Phase 14.']].forEach(function(p){
        const panel = el('section', 'cl11-panel');
        panel.dataset.panel = p[0];
        panel.hidden = true;
        panel.appendChild(el('h2', 'cl11-title', p[1]));
        panel.appendChild(el('p', 'cl11-empty', p[2]));
        view.appendChild(panel);
      });

      document.body.appendChild(view);
      api.view = view;

      nav.addEventListener('click', function(e){
        const tab = e.target.closest('.cl11-tab');
        if(tab) api.showTab(tab.dataset.tab);
      });
      back.addEventListener('click', function(){ api.close(); });
      create.addEventListener('click', function(){ api.createNew(); });
      imp.addEventListener('click', function(){ file.click(); });
      file.addEventListener('change', function(){ api.importFile(file); });
      list.addEventListener('click', function(e){ api.onListClick(e); });
      view.addEventListener('keydown', function(e){
        if(e.key !== 'Escape') return;
        if(api.closeMenus()) return;
        api.close();
      });
      return view;
    };
    api.showTab = function(tab){
      if(!api.view) return;
      api.view.querySelectorAll('.cl11-tab').forEach(function(b){
        const on = b.dataset.tab === tab;
        b.classList.toggle('active', on);
        b.setAttribute('aria-current', on ? 'page' : 'false');
      });
      api.view.querySelectorAll('.cl11-panel').forEach(function(p){ p.hidden = p.dataset.panel !== tab; });
    };
    api.render = async function(){
      if(!api.view) return;
      const entries = await api.load();
      const list = api.view.querySelector('#cl11List');
      list.textContent = '';
      entries.forEach(function(entry){
        const s = api.summary(entry);
        const li = el('li', 'cl11-row' + (entry.id === currentId ? ' cl11-current' : ''));
        li.dataset.id = entry.id;

        const open = el('button', 'cl11-open');
        open.type = 'button';
        open.dataset.act = 'open';
        const portrait = el('span', 'cl11-portrait');
        const key = api.clanKey(s.clan);
        if(key){
          const img = document.createElement('img');
          img.src = CLAN_MON_DATA[key];
          img.alt = '';
          portrait.appendChild(img);
        } else {
          portrait.textContent = s.name.charAt(0).toUpperCase();
        }
        open.appendChild(portrait);
        const text = el('span', 'cl11-text');
        text.appendChild(el('span', 'cl11-name', s.name));
        text.appendChild(el('span', 'cl11-line', entry.data ? s.line : 'Saved data missing'));
        if(s.sub) text.appendChild(el('span', 'cl11-line cl11-sub', s.sub));
        if(entry.id === currentId) text.appendChild(el('span', 'cl11-badge', 'Open now'));
        open.appendChild(text);
        open.setAttribute('aria-label', 'Open ' + s.name);
        li.appendChild(open);

        const more = el('button', 'cl11-more', '⋯');
        more.type = 'button';
        more.dataset.act = 'menu';
        more.setAttribute('aria-haspopup', 'true');
        more.setAttribute('aria-expanded', 'false');
        more.setAttribute('aria-label', 'Options for ' + s.name);
        li.appendChild(more);

        const menu = el('div', 'cl11-menu');
        menu.setAttribute('role', 'menu');
        menu.hidden = true;
        [['export', 'Export JSON'], ['copy', 'Save As a copy'], ['delete', 'Delete']].forEach(function(item){
          if(!entry.data && item[0] !== 'delete') return;
          const b = el('button', 'cl11-item' + (item[0] === 'delete' ? ' cl11-danger' : ''), item[1]);
          b.type = 'button';
          b.setAttribute('role', 'menuitem');
          b.dataset.act = item[0];
          menu.appendChild(b);
        });
        li.appendChild(menu);
        list.appendChild(li);
      });
      api.view.querySelector('#cl11Empty').hidden = entries.length > 0;
    };
    api.closeMenus = function(){
      let closed = false;
      if(!api.view) return false;
      api.view.querySelectorAll('.cl11-menu').forEach(function(m){
        if(!m.hidden){ m.hidden = true; closed = true; }
      });
      api.view.querySelectorAll('.cl11-more').forEach(function(b){ b.setAttribute('aria-expanded', 'false'); });
      return closed;
    };
    api.onListClick = function(e){
      const btn = e.target.closest('button[data-act]');
      if(!btn) { api.closeMenus(); return; }
      const row = btn.closest('.cl11-row');
      const id = row && row.dataset.id;
      const act = btn.dataset.act;
      if(act === 'menu'){
        const menu = row.querySelector('.cl11-menu');
        const opening = menu.hidden;
        api.closeMenus();
        menu.hidden = !opening;
        btn.setAttribute('aria-expanded', opening ? 'true' : 'false');
        if(opening){ const first = menu.querySelector('button'); if(first) first.focus(); }
        return;
      }
      api.closeMenus();
      if(act === 'open') api.openCharacter(id);
      else if(act === 'export') api.exportCharacter(id);
      else if(act === 'copy') api.copyCharacter(id);
      else if(act === 'delete') api.deleteCharacter(id);
    };

    api.open = async function(tab){
      api.build();
      await api.flush();
      api.showTab(tab || 'characters');
      await api.render();
      api.view.hidden = false;
      const title = api.view.querySelector('.cl11-tab.active');
      if(title) title.focus({preventScroll:true});
    };
    api.close = function(){
      if(!api.view) return;
      api.closeMenus();
      api.view.hidden = true;
    };
    api.isOpen = function(){ return !!api.view && !api.view.hidden; };

    // An unsaved sheet with work on it is the one thing a list action could silently lose.
    api.confirmDiscard = async function(action){
      if(currentId || api.blank === null || api.snapshot() === api.blank) return true;
      return appConfirm('This sheet has not been saved. ' + action + ' will discard it.', 'Discard it', 'danger');
    };
    api.openCharacter = async function(id){
      if(id === currentId){ api.close(); return; }
      if(!(await api.confirmDiscard('Opening another character'))) return;
      await loadCharacter(id);
    };
    api.createNew = async function(){
      if(!(await api.confirmDiscard('Creating a new character'))) return;
      await api.flush();
      currentId = null;
      resetToBaseline();
      await saveCharacter(true);
      if(!currentId) return;   // the save failed; saveCharacter has already said why
      api.close();
      setStatus('New character started. It saves automatically as you go.');
    };
    api.exportCharacter = function(id){
      // The open character is read from the sheet itself, so an edit not yet autosaved travels.
      const entry = api.find(id);
      const data = id === currentId ? collectData() : (entry && entry.data);
      if(!data) return;
      exportJSON(data);
    };
    api.copyCharacter = async function(id){
      await api.flush();
      const r = await storageGet(charKey(id), false).catch(function(){ return null; });
      if(!r){ setStatus('Could not read that character to copy it.'); return; }
      try {
        const copy = JSON.parse(r.value);
        copy.fields = copy.fields || {};
        const name = (String(copy.fields.f_name || '').trim() || 'Unnamed') + ' (copy)';
        copy.fields.f_name = name;
        const newId = api.newId();
        await storageSet(charKey(newId), JSON.stringify(copy), false);
        const list = await getIndex();
        list.push({id:newId, name:name, clan:copy.fields.f_clan || '', updatedAt:Date.now()});
        await setIndex(list);
        await refreshCharSelect(currentId || undefined);
        await api.render();
        setStatus('Saved a copy as "' + name + '". The original is unchanged.');
      } catch(e){
        setStatus('Copy failed — ' + storageErrorMessage(e) + '.');
        console.error(e);
      }
    };
    api.deleteCharacter = async function(id){
      const entry = api.find(id);
      const name = entry ? api.summary(entry).name : 'this character';
      const ok = await appConfirm('Delete "' + name + '" permanently? This cannot be undone. Export JSON first if you might want it back.', 'Delete', 'danger');
      if(!ok) return;
      try {
        if(id === currentId){
          clearTimeout(api.timer);
          currentId = null;        // before the reset, so its pending changes are not written back
          api.lastSaved = null;
          resetToBaseline();
        }
        await storageDelete(charKey(id), false);
        const list = (await getIndex()).filter(function(c){ return c.id !== id; });
        await setIndex(list);
        await refreshCharSelect(currentId || undefined);
        await api.render();
        setStatus('Deleted "' + name + '".');
      } catch(e){
        setStatus('Delete failed — ' + storageErrorMessage(e) + '.');
        console.error(e);
      }
    };
    api.importFile = async function(input){
      const file = input.files && input.files[0];
      if(!file) return;
      try {
        const data = JSON.parse(await file.text());
        if(!data || typeof data !== 'object' || !data.fields || typeof data.fields !== 'object'){
          setStatus('Import failed — that file is not a character save.');
          return;
        }
        // The newest format this build reads is the one it writes. SHEET_SCHEMA_VERSION alone is
        // not it: a later release raises the written format through its own collectData wrapper.
        const supported = Math.max(SHEET_SCHEMA_VERSION, parseInt(collectData().schemaVersion, 10) || 1);
        const version = parseInt(data.schemaVersion || 1, 10) || 1;
        if(version > supported){
          appAlert('This character was saved by a newer version of the sheet (format ' + version +
            '; this sheet understands ' + supported + '), so it has not been imported. Open it in the newer sheet instead.');
          return;
        }
        // Always a new entry with a new id: an import never replaces a saved character.
        const id = api.newId();
        const name = String(data.fields.f_name || '').trim() || 'Unnamed';
        await storageSet(charKey(id), JSON.stringify(data), false);
        const list = await getIndex();
        list.push({id:id, name:name, clan:data.fields.f_clan || '', updatedAt:Date.now()});
        await setIndex(list);
        await refreshCharSelect(currentId || undefined);
        await api.render();
        setStatus('Imported "' + name + '" as a new character.');
      } catch(e){
        setStatus(e instanceof SyntaxError ? 'Import failed — that file is not valid JSON.' : 'Import failed — ' + storageErrorMessage(e) + '.');
        console.error(e);
      } finally {
        input.value = '';
      }
    };

    api.addToolbarButton = function(){
      const rail = document.querySelector('.car-toolbar-rail') || document.querySelector('.toolbar');
      if(!rail || document.getElementById('cl11Toolbar')) return;
      const grp = el('div', 'grp cl11-grp');
      const b = el('button', 'ghost cl11-toolbar', 'Characters');
      b.type = 'button';
      b.id = 'cl11Toolbar';
      b.addEventListener('click', function(){ api.open('characters'); });
      grp.appendChild(b);
      rail.insertBefore(grp, rail.firstChild);
    };
    return api;
  })();

  // Called once from init(), after the sheet is reset and the picker is filled.
  async function initCharactersList(){
    if(!CL11.enabled() || CL11.ready) return;
    CL11.ready = true;
    CL11.blank = CL11.snapshot();
    CL11.build();
    CL11.addToolbarButton();
    const onEdit = function(e){
      if(CL11.view && CL11.view.contains(e.target)) return;
      // New Blank forgets the character before it resets the sheet, so the wrapper below
      // would be too late: write now, on the way in.
      if(e.type === 'click' && e.target.closest && e.target.closest('#btnNew')){ CL11.flush(); return; }
      CL11.schedule();
    };
    // contextmenu too: a right-click restores a Void pip with no click event at all.
    ['input', 'change', 'click', 'contextmenu'].forEach(function(type){ document.addEventListener(type, onEdit, true); });
    document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'hidden') CL11.flush(); });
    window.addEventListener('pagehide', function(){ CL11.flush(); });
    const list = await getIndex();
    if(list.length) await CL11.open('characters');
  }

  // Each wrapper keeps the previous binding and delegates to it; every caller reaches these by
  // name at call time, so the toolbar's own buttons get the same behaviour. resetToBaseline() is
  // deliberately NOT wrapped: every path to it has already written or forgotten the character.
  const cl11PreviousSave = saveCharacter;
  saveCharacter = async function(){
    const result = await cl11PreviousSave.apply(this, arguments);
    if(CL11.enabled() && CL11.ready){
      CL11.markSaved();
      if(CL11.isOpen()) await CL11.render();
    }
    return result;
  };
  const cl11PreviousLoad = loadCharacter;
  loadCharacter = async function(id){
    if(!CL11.enabled() || !CL11.ready) return cl11PreviousLoad.apply(this, arguments);
    // Written first: loading '' (the picker's "New / unsaved") resets the sheet with no applyData.
    await CL11.flush();
    const result = await cl11PreviousLoad.apply(this, arguments);
    if(!id || currentId === id){
      CL11.markSaved();
      CL11.syncPicker();
      CL11.close();
    }
    return result;
  };
  // Anything that loads data over the sheet (a load, the toolbar's own Import) writes the open
  // character's pending changes first. prepare() reads the sheet synchronously, before it goes.
  const cl11PreviousApply = applyData;
  applyData = function(){
    if(CL11.enabled() && CL11.ready) CL11.write(CL11.prepare());
    return cl11PreviousApply.apply(this, arguments);
  };
  const cl11PreviousExport = exportJSON;
  exportJSON = function(data){
    const file = CL11.shareFile(data);
    if(!file) return cl11PreviousExport.apply(this, arguments);
    navigator.share({files:[file], title:(data.fields && data.fields.f_name) || 'L5R character'}).then(function(){
      setStatus('Exported "' + file.name + '".');
    }, function(e){
      if(e && e.name === 'AbortError') setStatus('Export cancelled.');
      else cl11PreviousExport(data);   // sharing refused for another reason: download instead
    });
  };
  // ============ END PART K PHASE 11 ============
