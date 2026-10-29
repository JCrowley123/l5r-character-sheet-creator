  // ============ PART J PHASE 7.1 — AUDIT LOG ============
  // Phase 7's AuditLog: append-only entries, to the owner's answers of 29 October 2026. It records the changes that cost
  // or award something: XP spent and awarded; Honor, Glory, Status and Taint; Void Points, spell slots and the uses
  // rolls spend (and any given back); Advantages, Disadvantages, Techniques and spells added or removed; memorising;
  // Insight Rank and School. Not every keystroke: the sheet is compared with itself once it has been still for a moment.
  // Saved with the character and in Export JSON, the last 500 entries; an older save starts an empty log. Read-only,
  // newest first, from the sheet's ⋯ menu and each character's menu in the Characters list. There is no clearing.
  const AUDIT_LOG_ENABLED = true;
  const AL71Logic = {
    CAP:500,
    QUIET_MS:1500,
    entry(at, what, from, to){ return Object.freeze({at, what, from:from === undefined ? null : from, to:to === undefined ? null : to}); },
    valid(e){
      return !!e && typeof e === 'object' && typeof e.at === 'string' && !isNaN(Date.parse(e.at)) && typeof e.what === 'string' &&
        [e.from, e.to].every(v => v === null || typeof v === 'string');
    },
    // A saved log, or nothing: the valid entries, frozen, the last CAP of them.
    load(raw){ return Object.freeze(Array.isArray(raw) ? raw.filter(AL71Logic.valid).slice(-AL71Logic.CAP)
      .map(e => AL71Logic.entry(e.at, e.what, e.from, e.to)) : []); },
    append(log, entries){ return Object.freeze(log.concat(entries).slice(-AL71Logic.CAP)); },
    // before, after: {values:{label: text}, lists:{label: [names]}}. The entries for what changed between them.
    diff(before, after, at){
      const out = [];
      Object.keys(after.values).forEach(k => {
        const was = k in before.values ? before.values[k] : null;
        if(was !== after.values[k]) out.push(AL71Logic.entry(at, k, was, after.values[k]));
      });
      Object.keys(before.values).forEach(k => { if(!(k in after.values)) out.push(AL71Logic.entry(at, k, before.values[k], null)); });
      Object.keys(after.lists).forEach(k => {
        const count = names => names.reduce((m, n) => { m[n] = (m[n] || 0) + 1; return m; }, {});
        const was = count(before.lists[k] || []), now = count(after.lists[k]);
        Object.keys(now).forEach(n => { for(let i = was[n] || 0; i < now[n]; i++) out.push(AL71Logic.entry(at, k + ' added', null, n)); });
        Object.keys(was).forEach(n => { for(let i = now[n] || 0; i < was[n]; i++) out.push(AL71Logic.entry(at, k + ' removed', n, null)); });
      });
      return out;
    },
    text(e){
      if(e.from === null && e.to !== null && / added$/.test(e.what)) return e.what + ': ' + e.to;
      if(e.to === null && e.from !== null && / removed$/.test(e.what)) return e.what + ': ' + e.from;
      return e.what + ': ' + (e.from === null ? '—' : e.from) + ' → ' + (e.to === null ? '—' : e.to);
    },
    when(at){ const d = new Date(at); return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); },
    // Newest first, for the History panel.
    newestFirst(log){ return log.slice().reverse(); }
  };
  const AL71 = (() => {
    const api = {};
    const $ = id => document.getElementById(id);
    const val = id => { const el = $(id); return el ? String(el.value) : null; };
    let log = AL71Logic.load(null), base = null, timer = null;
    api.enabled = () => AUDIT_LOG_ENABLED && typeof collectData === 'function' && typeof applyData === 'function';
    api.entries = () => log;
    // What the log watches, read from the sheet.
    api.read = () => {
      const values = {}, lists = {Advantage:[], Disadvantage:[], Technique:[], Spell:[], 'Spell memorised':[]};
      const put = (label, v) => { if(v !== null && v !== undefined) values[label] = String(v); };
      put('XP total', val('f_xpTotal'));
      put('XP spent', val('f_xpSpent'));
      ['honor', 'glory', 'status'].forEach(n => {
        const rank = val('f_' + n + 'Rank'), pts = val('f_' + n + 'Pts');
        if(rank !== null) put(n[0].toUpperCase() + n.slice(1), rank + '.' + (pts || '0'));
      });
      put('Taint', val('f_taint'));
      put('Insight Rank', val('f_insightRank'));
      if(typeof getSchoolsList === 'function') put('School', getSchoolsList().map(s => s.name).join(' / '));
      put('Void Points', val('void_current'));
      document.querySelectorAll('[id^="spell_used_"]').forEach(el => put('Spell slots used (' + el.id.slice(11) + ')', el.value));
      put('Bonus spell slots used', val('spell_bonus_used_shared'));
      const seen = {};
      ['advList', 'disadvList'].forEach(id => document.querySelectorAll('#' + id + ' .entry').forEach(div => {
        const name = div.querySelector('.en-name'), label = name ? name.value.trim() : '';
        if(!label) return;
        lists[id === 'advList' ? 'Advantage' : 'Disadvantage'].push(label);
        let config = null;
        try { config = div.dataset.advConfig ? JSON.parse(div.dataset.advConfig) : null; } catch(e){ config = null; }
        if(config && typeof config.remaining === 'number'){
          seen[label] = (seen[label] || 0) + 1;
          put(label + ' uses left' + (seen[label] > 1 ? ' (' + seen[label] + ')' : ''), config.remaining);
        }
      }));
      document.querySelectorAll('#techList .entry').forEach(div => {
        const name = div.querySelector('.en-name'), label = name ? name.value.trim() : '';
        if(!label) return;
        if(div.dataset.spellElement){
          lists.Spell.push(label);
          if(div.dataset.isMemorised === 'true') lists['Spell memorised'].push(label);
        } else lists.Technique.push(label);
      });
      let ancestor = null;
      try { ancestor = val('f_ancestor') ? JSON.parse(val('f_ancestor')) : null; } catch(e){ ancestor = null; }
      if(ancestor && typeof ancestor.name === 'string') put(ancestor.name + '’s gift this session', ancestor.sessionUsed ? 'used' : 'ready');
      return {values, lists};
    };
    // Compares the sheet with the last look; the first look after a load or a reset only sets the starting point.
    api.check = () => {
      clearTimeout(timer);
      timer = null;
      const now = api.read();
      if(!base){ base = now; return []; }
      const entries = AL71Logic.diff(base, now, new Date().toISOString());
      base = now;
      if(entries.length) log = AL71Logic.append(log, entries);
      return entries;
    };
    api.schedule = () => { clearTimeout(timer); timer = setTimeout(api.check, AL71Logic.QUIET_MS); };
    api.restart = saved => { clearTimeout(timer); log = AL71Logic.load(saved); base = null; api.schedule(); };
    // UI hook: the History panel, read-only, newest first. `entries` defaults to the open character's.
    api.show = (title, entries) => {
      let overlay = $('al71Overlay');
      if(!overlay){
        overlay = document.createElement('div');
        overlay.id = 'al71Overlay';
        overlay.className = 'roll-modal-overlay al71-overlay';
        overlay.innerHTML = '<div class="roll-modal al71-panel" role="dialog" aria-modal="true" aria-labelledby="al71Title">' +
          '<div class="roll-modal-head"><h3 id="al71Title"></h3><button type="button" class="ghost" id="al71Close" aria-label="Close History">✕</button></div>' +
          '<ol class="al71-list" id="al71List"></ol><p class="al71-empty" id="al71Empty">Nothing recorded yet.</p></div>';
        document.body.appendChild(overlay);
        const close = () => { overlay.style.display = 'none'; };
        $('al71Close').addEventListener('click', close);
        overlay.addEventListener('click', e => { if(e.target === overlay) close(); });
        document.addEventListener('keydown', e => { if(e.key === 'Escape' && overlay.style.display === 'flex') close(); });
      }
      if(!entries) api.check();
      const list = AL71Logic.newestFirst(entries || log);
      $('al71Title').textContent = 'History — ' + (title || 'this character');
      const ol = $('al71List');
      ol.innerHTML = '';
      list.forEach(e => {
        const li = document.createElement('li');
        li.className = 'al71-entry';
        const when = document.createElement('span');
        when.className = 'al71-when';
        when.textContent = AL71Logic.when(e.at);
        const what = document.createElement('span');
        what.className = 'al71-what';
        what.textContent = AL71Logic.text(e);
        li.appendChild(when);
        li.appendChild(what);
        ol.appendChild(li);
      });
      $('al71Empty').hidden = list.length > 0;
      overlay.style.display = 'flex';
      $('al71Close').focus({preventScroll:true});
      return list.length;
    };
    // UI hook: History in the sheet's ⋯ menu, after Export JSON.
    api.sheetMenu = () => {
      const menu = $('pm128Menu') || document.querySelector('.pm128-menu');
      if(!menu || $('al71SheetHistory')) return !!menu;
      const b = document.createElement('button');
      b.type = 'button';
      b.id = 'al71SheetHistory';
      b.className = 'pm128-item';
      b.setAttribute('role', 'menuitem');
      b.textContent = 'History';
      b.addEventListener('click', () => api.show(val('f_name') ? val('f_name').trim() : ''));
      menu.appendChild(b);
      return true;
    };
    // UI hook: History in each saved character's menu in the Characters list, before Delete.
    api.listMenus = () => {
      if(typeof CL11 !== 'object' || !CL11 || !CL11.view) return;
      CL11.view.querySelectorAll('.cl11-row').forEach(row => {
        const menu = row.querySelector('.cl11-menu'), entry = CL11.find(row.dataset.id);
        if(!menu || !entry || !entry.data || menu.querySelector('.al71-item')) return;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'cl11-item al71-item';
        b.setAttribute('role', 'menuitem');
        b.textContent = 'History';
        b.addEventListener('click', e => {
          e.stopPropagation();
          CL11.closeMenus();
          const found = CL11.find(row.dataset.id);
          const name = found && found.data && found.data.fields && found.data.fields.f_name;
          api.show(name || 'this character', AL71Logic.load(found && found.data ? found.data.auditLog : null));
        });
        menu.insertBefore(b, menu.querySelector('[data-act="delete"]'));
      });
    };
    if(api.enabled()){
      const style = document.createElement('style');
      style.textContent = '.al71-panel{max-width:560px;width:calc(100% - 32px)}.al71-list{list-style:none;margin:0;padding:0;max-height:60vh;overflow:auto}' +
        '.al71-entry{display:flex;flex-wrap:wrap;gap:4px 12px;padding:6px 0;border-bottom:1px solid rgba(128,128,128,.25)}' +
        '.al71-when{opacity:.7;min-width:9em}.al71-what{flex:1 1 14em}';
      document.head.appendChild(style);
      const previousRecalc = recalcAll;
      recalcAll = function(){ const out = previousRecalc.apply(this, arguments); api.schedule(); return out; };
      const previousApply = applyData;
      applyData = function(data){
        clearTimeout(timer);
        const out = previousApply.apply(this, arguments);
        if(out !== false) api.restart(data && data.auditLog);
        return out;
      };
      const previousCollect = collectData;
      collectData = function(){
        api.check();
        const out = previousCollect.apply(this, arguments);
        if(out && log.length) out.auditLog = log.map(e => Object.assign({}, e));
        return out;
      };
      if(typeof resetToBaseline === 'function'){
        const previousReset = resetToBaseline;
        resetToBaseline = function(){ const out = previousReset.apply(this, arguments); api.restart(null); return out; };
      }
      if(typeof CL11 === 'object' && CL11 && typeof CL11.render === 'function'){
        const previousRender = CL11.render;
        CL11.render = function(){
          const out = previousRender.apply(this, arguments);
          Promise.resolve(out).then(api.listMenus, () => {});
          return out;
        };
      }
      // History joins the ⋯ menu when the toolbar is built, which can follow a slow storage read.
      if(typeof CL11 === 'object' && CL11 && typeof CL11.addToolbarButton === 'function'){
        const previousToolbar = CL11.addToolbarButton;
        CL11.addToolbarButton = function(){ const out = previousToolbar.apply(this, arguments); api.sheetMenu(); return out; };
      }
      api.sheetMenu();
      // Fields whose own listeners reach the sheet's first recalcAll, and Void pip taps, are looked at too.
      ['input', 'change', 'click'].forEach(type => document.addEventListener(type, api.schedule, true));
    }
    return api;
  })();
  // ============ END PART J PHASE 7.1 ============
