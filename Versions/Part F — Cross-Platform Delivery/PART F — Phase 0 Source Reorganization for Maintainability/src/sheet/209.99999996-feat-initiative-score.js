  // ========= PART I FEATURE 4.5.35: INITIATIVE SCORE =========
  // The owner's V4 note (9 October 2026): the Combat card should say what the Initiative Score is, and Quick's button
  // should change it until the combat is reset. Approved as recommended, with one extension (stated to the owner):
  //   score = the last Initiative roll's total (or a total the player typed)
  //           - the Center, Void and Quick bonuses that total already held
  //           + those bonuses as they stand now (read through the roll pipeline)
  // so nothing counts twice, a Void +10 or a Quick use after the roll adds to it, and Center's +10 (Core Rulebook,
  // the Round after Center) counts only in its Round.
  // Kept in the trunk's round ledger, in the Round it was set: 'Initiative' (the total) and, when not 0,
  // 'Initiative bonuses' (what it held). Transient like the rest of the ledger; Reset rounds clears it.
  const INITIATIVE_SCORE_ENABLED = true;

  // Logic: no DOM.
  const IS4535 = (function(){
    const api = {};
    api.TOTAL = 'Initiative';
    api.HELD = 'Initiative bonuses';
    api.SOURCES = { stance:'Center', 'void':'Void', quick:'Quick' };
    api.enabled = function(){
      return INITIATIVE_SCORE_ENABLED && typeof getRoundLedger === 'function' && typeof recordRoundSpend === 'function';
    };
    // Center, Void and Quick bonuses in a list of roll modifiers: {source: total}.
    api.bonuses = function(mods){
      const out = {};
      (mods || []).forEach(function(m){
        if(m && api.SOURCES[m.source] && Number.isFinite(m.totalDelta) && m.totalDelta) out[m.source] = (out[m.source] || 0) + m.totalDelta;
      });
      return out;
    };
    api.sum = function(b){ return Object.keys(b).reduce(function(s, k){ return s + b[k]; }, 0); };
    // What an Initiative roll made now would get.
    api.bonusesNow = function(){
      if(typeof getPreRollModifiers !== 'function' || typeof makeRollContext !== 'function' || typeof ROLL_KINDS !== 'object') return {};
      const reflexes = typeof getTraitValueByName === 'function' ? getTraitValueByName('Reflexes') : 0;
      const insight = parseInt((document.getElementById('f_insightRank') || {}).value, 10) || 0;
      return api.bonuses(getPreRollModifiers(makeRollContext(ROLL_KINDS.INITIATIVE, { traitValue:reflexes, insightRank:insight })));
    };
    // The latest total in the ledger: {round, total, held}, or null.
    api.entry = function(){
      if(!api.enabled()) return null;
      const ledger = getRoundLedger();
      const rounds = Object.keys(ledger).map(Number).filter(function(r){
        return Number.isFinite(r) && ledger[String(r)] && Number.isFinite(ledger[String(r)][api.TOTAL]);
      }).sort(function(a, b){ return a - b; });
      if(!rounds.length) return null;
      const r = rounds[rounds.length - 1], e = ledger[String(r)];
      return { round:r, total:e[api.TOTAL], held:Number.isFinite(e[api.HELD]) ? e[api.HELD] : 0 };
    };
    // {score, base, bonuses:{source: total}, round}, or null when nothing has been rolled or typed since Reset rounds.
    api.score = function(){
      const e = api.entry();
      if(!e) return null;
      const now = api.bonusesNow();
      return { score:e.total - e.held + api.sum(now), base:e.total - e.held, bonuses:now, round:e.round };
    };
    api.record = function(total, held){
      if(!api.enabled() || !Number.isFinite(total)) return false;
      if(held) recordRoundSpend(api.HELD, held);
      else if(typeof clearRoundSpend === 'function') clearRoundSpend(api.HELD);
      recordRoundSpend(api.TOTAL, total);
      return true;
    };
    // A finished Initiative roll: its total, holding the bonuses its modifiers carried.
    api.rolled = function(total, mods){ return api.record(total, api.sum(api.bonuses(mods))); };
    // A total the player rolled with their own dice: taken as the score now, so it holds today's bonuses.
    api.set = function(value){
      const n = parseInt(value, 10);
      if(!Number.isFinite(n) || String(value).trim() === '') return false;
      return api.record(n, api.sum(api.bonusesNow()));
    };
    return api;
  })();

  // UI: a line under the Combat card's Initiative, a line under Quick Access's, and the score on Quick's row.
  const IS4535UI = (function(){
    const ui = {};
    ui.make = function(tag, cls, text){
      const el = document.createElement(tag);
      if(cls) el.className = cls;
      if(text != null) el.textContent = text;
      return el;
    };
    ui.signed = function(n){ return (n < 0 ? '−' : '+') + Math.abs(n); };
    // {headline, detail} for the current score.
    ui.words = function(){
      const s = IS4535.score();
      if(!s) return { headline:'Initiative Score: not set yet', detail:'Roll Initiative, or type the total you rolled.' };
      const parts = Object.keys(IS4535.SOURCES).filter(function(k){ return s.bonuses[k]; })
        .map(function(k){ return IS4535.SOURCES[k] + ' ' + ui.signed(s.bonuses[k]); });
      return { headline:'Initiative Score: ' + s.score, detail:parts.length ? s.base + ' before bonuses, ' + parts.join(', ') : '' };
    };
    // UI hook: the Combat card, under the Initiative field.
    ui.line = function(){
      const field = document.getElementById('f_initiative');
      const host = field && field.closest('.field');
      if(!host) return null;
      let line = document.getElementById('is4535Line');
      if(!line){
        line = ui.make('div', 'is4535-line');
        line.id = 'is4535Line';
        line.setAttribute('aria-live', 'polite');
        line.appendChild(ui.make('div', 'is4535-score'));
        line.appendChild(ui.make('div', 'is4535-detail'));
        const set = ui.make('div', 'is4535-set');
        const input = ui.make('input', 'is4535-input');
        input.id = 'is4535Input';
        input.type = 'number';
        input.inputMode = 'numeric';
        input.setAttribute('aria-label', 'The Initiative total you rolled');
        input.placeholder = 'Your total';
        const button = ui.make('button', 'is4535-btn', 'Set score');
        button.type = 'button';
        button.id = 'is4535Set';
        const apply = function(){
          if(IS4535.set(input.value)){ input.value = ''; ui.refresh(); }
          else if(typeof setStatus === 'function') setStatus('Type the Initiative total you rolled, then Set score.');
        };
        button.addEventListener('click', apply);
        input.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); apply(); } });
        set.appendChild(input);
        set.appendChild(button);
        line.appendChild(set);
        host.appendChild(line);
      }
      return line;
    };
    ui.refresh = function(){
      if(!IS4535.enabled()) return;
      const w = ui.words();
      const line = ui.line();
      if(line){
        line.querySelector('.is4535-score').textContent = w.headline;
        line.querySelector('.is4535-detail').textContent = w.detail;
        line.querySelector('.is4535-detail').hidden = !w.detail;
      }
      ui.quickAccess(w);
      ui.quickRow();
    };
    // UI hook: Quick Access's Initiative.
    ui.quickAccess = function(w){
      const value = document.getElementById('qaInitiativeValue');
      if(!value || !value.parentElement) return;
      let sub = document.getElementById('is4535Qa');
      if(!sub){
        sub = ui.make('div', 'is4535-qa');
        sub.id = 'is4535Qa';
        value.parentElement.insertBefore(sub, value.nextSibling);
      }
      const s = IS4535.score();
      sub.textContent = s ? 'Score ' + s.score : 'Score not set';
    };
    // UI hook: Quick's row (Feature 4.5.33) names the score its button changes.
    ui.quickRow = function(){
      if(typeof VI4533 !== 'object' || !VI4533 || typeof VI4533.rows !== 'function') return;
      const s = IS4535.score();
      VI4533.rows(VI4533.QUICK || 'Quick').forEach(function(div){
        const row = div.querySelector('.vi4533-row');
        if(!row) return;
        let note = row.querySelector('.is4535-quick');
        if(!note){ note = ui.make('span', 'is4535-quick'); row.appendChild(note); }
        note.textContent = s ? 'Your Initiative Score is ' + s.score + '.' : 'No Initiative Score yet (Combat card).';
      });
    };
    return ui;
  })();

  if(IS4535.enabled()){
    // A finished Initiative roll records its total; the total read again when its window closes follows any
    // dice the player re-kept or rerolled.
    if(typeof rollWithModifiers === 'function'){
      const is4535PreviousRoll = rollWithModifiers;
      let watching = null;
      rollWithModifiers = async function(title, context){
        const res = await is4535PreviousRoll.apply(this, arguments);
        if(res && res.result && context && typeof ROLL_KINDS === 'object' && context.kind === ROLL_KINDS.INITIATIVE){
          IS4535.rolled(res.result.total, res.adj && res.adj.applied);
          watching = { held:IS4535.sum(IS4535.bonuses(res.adj && res.adj.applied)) };
          IS4535UI.refresh();
        }
        return res;
      };
      const overlay = document.getElementById('rollModalOverlay');
      if(overlay && typeof MutationObserver === 'function'){
        new MutationObserver(function(){
          if(!watching || getComputedStyle(overlay).display !== 'none') return;
          const total = parseInt((document.getElementById('rollTotalDisplay') || {}).textContent, 10);
          const e = IS4535.entry();
          if(Number.isFinite(total) && e && total !== e.total) IS4535.record(total, watching.held);
          watching = null;
          IS4535UI.refresh();
        }).observe(overlay, { attributes:true, attributeFilter:['style', 'class', 'hidden'] });
      }
    }
    // The lines follow every recalc and every change to the round ledger.
    if(typeof refreshAllAdvConfigControls === 'function'){
      const is4535PreviousRefresh = refreshAllAdvConfigControls;
      refreshAllAdvConfigControls = function(){
        const result = is4535PreviousRefresh.apply(this, arguments);
        IS4535UI.refresh();
        return result;
      };
    }
    if(typeof renderCombatRoundUI === 'function'){
      const is4535PreviousRound = renderCombatRoundUI;
      renderCombatRoundUI = function(){
        const result = is4535PreviousRound.apply(this, arguments);
        IS4535UI.refresh();
        return result;
      };
    }
    if(typeof renderQuickAccessPanel === 'function'){
      const is4535PreviousQa = renderQuickAccessPanel;
      renderQuickAccessPanel = function(){
        const result = is4535PreviousQa.apply(this, arguments);
        IS4535UI.quickAccess();
        return result;
      };
    }
  }
  // ========= END PART I FEATURE 4.5.35 IS4535 =========
