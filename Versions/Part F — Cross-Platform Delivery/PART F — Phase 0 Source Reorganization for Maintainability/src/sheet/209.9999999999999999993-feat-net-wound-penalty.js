  // ============ PART H PHASE 15.2.1 — ONE NET WOUND PENALTY ============
  // Phase 15, Release 15b, unit A14 (group 1, totals and their breakdowns), approved by the owner on 20 November 2026
  // as mocked up and revised: "So in the wound penalty section it would say -5 to total -- nicked ... I think the new
  // "i" icon does a good enough explanation for how the penalty is calculated."
  // When an entry changes the Wound penalty (Phase 4.5.29 (Part I): Low Pain Threshold, Strength of the Earth), the
  // Wounds line, each level's spoken name, the level's window and Quick Access show the one penalty that applies,
  // without the entries' names in brackets. An i on the Wounds line and on Quick Access opens the current level's
  // window, which shows how the penalty is made: the rank's own penalty, each entry signed with its page, and the total,
  // then the rank's rule. A roll's preview keeps its one Wound Penalty row ("-5 to total -- Nicked"); the second,
  // informational row (Phase 4.5.29's rollNote, "3 -> 5 ... already included") goes.
  // No arithmetic here: every figure is Phase 4.5.29's own (its adjusters, adjustSize and the level's pen). Screen only;
  // nothing is saved. The i has no text of its own, so Quick Access's copy of the line (textContent) is unchanged.
  const NET_WOUND_PENALTY_ENABLED = true;

  const WP15 = (function(){
    const api = {installed: false};
    const $ = id => document.getElementById(id);
    api.LABEL = 'Wound penalty: how it is worked out';
    api.enabled = function(){
      return NET_WOUND_PENALTY_ENABLED === true && typeof WND4529 === 'object' && !!WND4529 &&
        typeof WND4529.adjusters === 'function' && typeof WND4529.adjustersText === 'function' &&
        typeof WND4529.adjustSize === 'function' && WND4529.PEN_RE instanceof RegExp && !!WND4529.ENTRIES &&
        typeof formatWoundPenalty === 'function' && typeof showWoundInfoModal === 'function' &&
        typeof renderQuickAccessPanel === 'function' && !!$('woundSummaryLine') && !!$('woundInfoDesc');
    };
    // The names in brackets that Phase 4.5.29 adds after an adjusted penalty: " (Low Pain Threshold +5, Strength of
    // the Earth −3)". Only that exact ending is taken off; any other text is left as it is.
    api.suffix = function(){ const t = WND4529.adjustersText(); return t ? ' (' + t + ')' : ''; };
    api.net = function(text){
      const s = api.suffix();
      return (s && typeof text === 'string' && text.length > s.length && text.slice(-s.length) === s) ? text.slice(0, -s.length) : text;
    };
    // One level's penalty in parts, or null when no entry changes it (no penalty, Unconscious, or no entry).
    api.parts = function(lvl){
      if(!lvl || typeof lvl.pen !== 'string') return null;
      const match = WND4529.PEN_RE.exec(lvl.pen.trim());
      if(!match) return null;
      const size = Number(match[2]);
      if(!(size > 0)) return null;
      const entries = WND4529.adjusters().map(function(a){
        const key = Object.keys(WND4529.ENTRIES).find(function(k){ return WND4529.ENTRIES[k].name === a.name; });
        const entry = key ? WND4529.ENTRIES[key] : {};
        return {name: a.name, change: a.change, note: (entry.list === 'advList' ? 'Advantage' : 'Disadvantage') + (entry.source ? ', ' + entry.source : '')};
      });
      if(!entries.length) return null;
      return {size: size, entries: entries, total: WND4529.adjustSize(size)};
    };
    api.table = function(lvl, parts){
      const table = document.createElement('table');
      table.className = 'wp15-breakdown';
      table.setAttribute('aria-label', lvl.name + ': how the penalty is worked out');
      const row = function(label, value, note, total){
        const tr = table.insertRow();
        if(total) tr.className = 'wp15-total';
        const name = tr.insertCell(), figure = tr.insertCell();
        name.textContent = label;
        if(note){ const small = document.createElement('small'); small.textContent = note; name.appendChild(small); }
        figure.textContent = value;
      };
      row(lvl.name, '+' + parts.size, 'Wound Rank penalty');
      parts.entries.forEach(function(e){ row(e.name, e.change, e.note); });
      row('TN of all rolls', parts.total > 0 ? '+' + parts.total : 'none', '', true);
      return table;
    };
    // The level's window: the breakdown above the rank's own rule.
    api.decorateWindow = function(lvl){
      const desc = $('woundInfoDesc');
      const parts = api.parts(lvl);
      if(!desc || !parts) return;
      const rule = desc.textContent;
      desc.textContent = '';
      desc.appendChild(api.table(lvl, parts));
      const p = document.createElement('p');
      p.className = 'wp15-rule';
      p.textContent = rule;
      desc.appendChild(p);
    };
    // The level the track shows now: the bar's current segment carries the level's name.
    api.current = function(){
      const seg = document.querySelector('#woundBar .wound-seg.current');
      if(!seg || typeof WOUND_LEVELS === 'undefined' || !Array.isArray(WOUND_LEVELS)) return null;
      return WOUND_LEVELS.find(function(l){ return l.name === seg.title; }) || null;
    };
    api.open = function(){ const lvl = api.current(); if(lvl) showWoundInfoModal(lvl); };
    api.makeInfo = function(id){
      const b = document.createElement('button');
      b.type = 'button';
      b.id = id;
      b.className = 'sk-info-btn wp15-info print-hide';
      b.setAttribute('aria-label', api.LABEL);
      b.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); api.open(); });
      return b;
    };
    // After every render of the track: an i at the end of the Wounds line and of Quick Access's copy, while an entry
    // changes the current level's penalty; none otherwise. The track rewrites both lines' text, which drops the i,
    // so it is put back each time.
    api.place = function(){
      const show = !!api.parts(api.current());
      [['woundSummaryLine', 'lineInfo', 'wp15LineInfo'], ['qaWoundsValue', 'qaInfo', 'wp15QaInfo']].forEach(function(spot){
        const host = $(spot[0]);
        if(!api[spot[1]]) api[spot[1]] = api.makeInfo(spot[2]);
        const info = api[spot[1]];
        if(show && host){ if(info.parentElement !== host || host.lastChild !== info) host.appendChild(info); }
        else if(info.parentElement) info.remove();
      });
    };
    api.install = function(){
      if(api.installed || !api.enabled() || !document.body) return false;
      const previousFormat = formatWoundPenalty;
      api.previousFormat = previousFormat;
      formatWoundPenalty = function(lvl){
        const text = previousFormat.apply(this, arguments);
        try { return api.net(text); } catch(e){ return text; }
      };
      const previousShow = showWoundInfoModal;
      showWoundInfoModal = function(lvl){
        const result = previousShow.apply(this, arguments);
        try { api.decorateWindow(lvl); } catch(e){}
        return result;
      };
      const previousQuickAccess = renderQuickAccessPanel;
      renderQuickAccessPanel = function(){
        const result = previousQuickAccess.apply(this, arguments);
        try { api.place(); } catch(e){}
        return result;
      };
      // The preview's informational row goes; the penalty itself still reaches the roll through getWoundPenalty.
      api.previousRollNote = WND4529.rollNote;
      WND4529.rollNote = function(){ return []; };
      document.body.classList.add('wp15-on');
      api.installed = true;
      return true;
    };
    return api;
  })();
  if(NET_WOUND_PENALTY_ENABLED) WP15.install();
  // ============ END PART H PHASE 15.2.1 WP15 ============
