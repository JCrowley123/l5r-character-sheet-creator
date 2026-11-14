  // ============ PART H PHASE 15.1.31 — ONE UNDO FOR QUICK TAPS ============
  // Phase 15, Release 15a, unit A08 (group G5, undo and the roll preview), approved by the owner on 14 November 2026:
  // FT-47 (the owner, 28 October 2026) as Q4 ruled it on 1 November, a rolling five-second group. The number 31 is this
  // unit's marker only; the unit keeps its identifier, A08.
  // Honour, Glory, Status and Taint each have − and + (Phase 7's compact controls, CP7). Each tap is its own change
  // there, and Undo holds only the last. Here consecutive taps on the same card, each within five seconds of the one
  // before, are one change:
  //   - Undo goes back to the value before the group's first tap, in one step. CP7 still takes back the last tap
  //     itself, with its own record, checks and message, and CE7's 20-second window and save rules are untouched;
  //     straight after, this unit writes the rest of the way back as CP7 writes, and says so.
  //   - History (Phase 7.1's audit log, AL71) keeps one entry for the group: when the group ends, the group's own
  //     entries become one, from the value before the first tap to the last value, or none when they cancel out.
  //     Nothing is held back while the group is open, so a save in between still carries every entry; the merged
  //     History is saved by the next autosave of a listed character.
  //   - Once a group holds two taps the message names them: "Honour: Rank 5, Points 0. Undo takes back all 3 taps."
  //     One tap reads exactly as before.
  // − and + both count, whatever amount the box between them holds. The group ends after five seconds without a tap, on
  // a tap on another card, on any other change to Honour, Glory, Status or Taint (a typed Rank or Points, Set Rank,
  // Recognition), on Undo, when the character is opened, loaded or reset (the group is dropped, not merged, since the
  // sheet is another), when Undo expires (a save, or its 20 seconds), on a click on any other control (Save, Export, a
  // roll, a menu, another card's controls), and on an edit anywhere else. Moving between pages does not end it.
  // Values, limits, Rank changes, the save format and autosave are as before. Nothing new is saved.
  const QUICK_TAP_UNDO_ENABLED = true;

  const QT15 = (function(){
    const api = {WINDOW_MS: 5000, installed: false};
    const TITLES = {honor: 'Honour', glory: 'Glory', status: 'Status', taint: 'Taint'};
    const WHAT = {honor: 'Honor', glory: 'Glory', status: 'Status', taint: 'Taint'};   // History's names (AL71.read)
    const TAP = /^(?:Add|Subtract) (?:Honour|Glory|Status|Taint) points$/;              // CP7's − and + labels
    let group = null;     // the open group: {name, before, after, preLast, taps, at, character, epoch, mark, logged}
    let pending = null;   // a group of two or more taps that Undo can still take back
    let timer = null, tapping = false, undoing = false, epoch = 0;
    api.enabled = function(){ return QUICK_TAP_UNDO_ENABLED && typeof CP7 === 'object' && !!CP7 && CP7.enabled(); };
    const logOn = function(){ return typeof AL71 === 'object' && !!AL71 && typeof AL71.enabled === 'function' && AL71.enabled(); };
    const same = function(a, b){ return !!a && !!b && CP7Logic.same(a, b); };
    const describe = function(name, s){ return TITLES[name] + ': Rank ' + s.rank + ', Points ' + s.points + '.'; };
    const notice = function(){ return document.getElementById('cp7-notice'); };
    // For tests: the open group, and how many taps Undo would take back.
    api.state = function(){
      return {open: !!group, name: group ? group.name : null, taps: group ? group.taps : 0,
        before: group ? {rank: group.before.rank, points: group.before.points} : null, undoTaps: pending ? pending.taps : 0};
    };
    // CP7's own write, repeated because CP7 keeps it private: Honour, Glory and Status through RP7, which tells the
    // sheet's listeners; Taint through TA7.
    function write(name, s){
      if(name === 'taint') return TA7.write(s.rank, s.points);
      const ok = RP7.write(name, s.rank, s.points);
      if(ok) RP7.changed(name);
      return ok;
    }
    // History: the entries made since the group began, all about its card, become one (or none). Anything else in
    // them, a sheet replaced meanwhile, or a log that has moved on, leaves the History exactly as it is.
    function merge(g){
      if(!g.logged || g.epoch !== epoch || g.character !== currentId || !logOn()) return;
      AL71.check();
      const all = AL71.entries(), at = g.mark === null ? 0 : all.lastIndexOf(g.mark) + 1;
      if(g.mark !== null && at === 0) return;
      const mine = all.slice(at), what = WHAT[g.name];
      if(!mine.length || mine.some(function(e){ return e.what !== what; })) return;
      const first = mine[0], last = mine[mine.length - 1];
      if(mine.length === 1 && first.from !== first.to) return;
      const merged = first.from === last.to ? [] : [AL71Logic.entry(last.at, what, first.from, last.to)];
      AL71.restart(all.slice(0, at).concat(merged));
      AL71.check();   // the next look starts from the sheet as it is now, so no later change is missed
      if(typeof CL11 === 'object' && CL11 && typeof CL11.schedule === 'function') CL11.schedule();
    }
    api.end = function(){
      clearTimeout(timer);
      timer = null;
      const g = group;
      group = null;
      if(g && g.taps > 1){ try { merge(g); } catch(e){ /* History stays as it is */ } }
    };
    function adjust(original){
      return function(name){
        if(undoing) return original.apply(this, arguments);
        const before = CP7.read(name), now = Date.now();
        const joins = !!group && group.name === name && group.epoch === epoch && group.character === currentId &&
          now - group.at <= api.WINDOW_MS && same(before, group.after);
        let mark = null, logged = false;
        if(!joins){
          api.end();
          if(logOn()){ AL71.check(); const all = AL71.entries(); mark = all.length ? all[all.length - 1] : null; logged = true; }
        }
        tapping = true;
        let ok;
        try { ok = original.apply(this, arguments); } finally { tapping = false; }
        if(ok !== true || !before) return ok;
        const after = CP7.read(name);
        if(joins){ group.preLast = before; group.after = after; group.taps += 1; group.at = Date.now(); }
        else group = {name: name, before: before, after: after, preLast: before, taps: 1, at: Date.now(),
          character: currentId, epoch: epoch, mark: mark, logged: logged};
        pending = group.taps > 1 ? group : null;
        clearTimeout(timer);
        timer = setTimeout(api.end, api.WINDOW_MS);
        const n = notice();
        if(group.taps > 1 && n && n.getAttribute('role') !== 'alert')
          n.textContent = describe(name, after) + ' Undo takes back all ' + group.taps + ' taps.';
        return ok;
      };
    }
    // Undo's own click, before CP7's listener: what CP7 writes for it is not "an edit elsewhere".
    function undoing0(){ undoing = true; }
    // After CP7's own Undo (and CE7's) on the same click: CP7 has taken back the last tap, hidden Undo and said so.
    function undone(){
      undoing = false;
      const p = pending;
      pending = null;
      if(p){
        const n = notice(), button = document.getElementById('cp7-undo'), now = CP7.read(p.name);
        if(button && button.hidden && n && n.getAttribute('role') !== 'alert' && same(now, p.preLast) && !same(now, p.before)){
          undoing = true;
          try {
            if(write(p.name, p.before)){ CP7.renderAll(); n.textContent = 'Undone. ' + describe(p.name, CP7.read(p.name)); }
          } catch(e){ /* CP7's own Undo stands */ } finally { undoing = false; }
        }
      }
      api.end();
    }
    // Any other control ends the group: Save, Export, a roll, a menu, another card's controls. The open card's − and +,
    // the amount boxes, Undo itself and the page tabs and arrows do not.
    function clicked(event){
      if(!group || tapping || undoing) return;
      const target = event.target instanceof Element ? event.target : null;
      const control = target && target.closest('button, a[href], input, select, textarea, label, summary, [role="button"], [role="tab"], [role="menuitem"]');
      if(!control || control.id === 'cp7-undo' || control.closest('.car-tab, .car-arrow')) return;
      if(control.closest('.cp7-adjust') && (control.tagName === 'INPUT' || TAP.test(control.getAttribute('aria-label') || ''))) return;
      api.end();
    }
    // An edit anywhere else ends it too; the taps' own events and the amount boxes do not.
    function edited(event){
      if(!group || tapping || undoing) return;
      const target = event.target instanceof Element ? event.target : null;
      if(target && target.tagName === 'INPUT' && target.closest('.cp7-adjust')) return;
      api.end();
    }
    api.install = function(){
      if(api.installed || !api.enabled()) return false;
      const button = document.getElementById('cp7-undo');
      if(!button) return false;
      api.installed = true;
      // UI hooks on CP7's own entry points, each passing straight through to the layer it wraps.
      CP7.adjust = adjust(CP7.adjust);
      const commit = CP7.commit;
      CP7.commit = function(){
        if(tapping || undoing) return commit.apply(this, arguments);
        api.end();
        const ok = commit.apply(this, arguments);
        if(ok === true) pending = null;   // CP7's Undo now holds this other change
        return ok;
      };
      const clear = CP7.clear;
      CP7.clear = function(){
        epoch += 1;
        clearTimeout(timer);
        timer = null;
        group = null;
        pending = null;
        return clear.apply(this, arguments);
      };
      if(typeof CP7.ce7ExpireUndo === 'function'){
        const expire = CP7.ce7ExpireUndo;
        CP7.ce7ExpireUndo = function(){ api.end(); pending = null; return expire.apply(this, arguments); };
      }
      button.addEventListener('click', undoing0, true);
      button.addEventListener('click', undone);
      document.addEventListener('click', clicked, true);
      document.addEventListener('input', edited, true);
      document.addEventListener('change', edited, true);
      return true;
    };
    return api;
  })();
  QT15.install();
  // ============ END PART H PHASE 15.1.31 ============
