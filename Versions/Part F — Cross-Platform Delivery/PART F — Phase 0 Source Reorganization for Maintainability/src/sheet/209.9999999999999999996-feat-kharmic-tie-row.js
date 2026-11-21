  // ============ PART H PHASE 15.2.5 — ONE ROW FOR KHARMIC TIE ============
  // Phase 15, Release 15b, unit B17 (group 1), new at the owner's round-1 answer of 20 November 2026 ("I would have
  // expected a UI of a single change button, a single "i" icon the 3 pips and the reset") and approved in round 3
  // ("I approve round 3"), with "Reset session" kept until B18 decides one word for every such button ("Approve as
  // proposed"). The first use of the owner's A04.2 row pattern: the choice as a badge, then Change, then one i.
  // A configured Kharmic Tie (Phase 4.5 (Part I)) is one row: the badge "Aiko · Rank 3", the pips and Reset session on
  // the left; Change (Manage only, as before) and one i on the right, held to the first line. The summary line
  // "Target: Aiko — Rank 3; 2/3 uses remaining" is hidden on screen (the badge and the pips say it), and the badge's
  // and Reset session's explanatory titles go, so Phase 4.54 (Part I) draws no i for them. The one i opens a window:
  // the rule in a sentence with its page (Core Rulebook p.151, from the Phase 4.5 sourcebook audit), each use +1k1,
  // the uses left, and what the roll preview, Reset session and (in Manage) Change do.
  // Unchanged: the uses, Reset session, Change, the preview's offer, the cost, the pips' spoken label, an unconfigured
  // Tie's "Choose…" row, and the save file. Screen only.
  const KHARMIC_TIE_ROW_ENABLED = true;

  const KT15 = (function(){
    const api = {installed: false};
    const $ = id => document.getElementById(id);
    api.NAME = 'Kharmic Tie';
    api.PAGE = 'Core Rulebook p.151';
    api.enabled = function(){
      return KHARMIC_TIE_ROW_ENABLED === true && typeof refreshAdvConfigControl === 'function' &&
        typeof readAdvConfig === 'function' && typeof resolveAdvDisadvEffect === 'function' &&
        typeof normalizeAdvName === 'function' && typeof populateInfoOverlay === 'function' && !!$('stanceInfoBody');
    };
    // The entry's Kharmic Tie, when it is a configured Advantage; null otherwise.
    api.effectOf = function(div){
      const name = div && div.querySelector ? div.querySelector('.en-name') : null;
      if(!name || normalizeAdvName(name.value) !== normalizeAdvName(api.NAME)) return null;
      if(!div.parentElement || div.parentElement.id !== 'advList') return null;
      const effect = resolveAdvDisadvEffect(name.value, readAdvConfig(div));
      return effect && effect.effect === 'kharmicTie' ? effect : null;
    };
    const para = function(text, cls){ const p = document.createElement('p'); p.className = cls; p.textContent = text; return p; };
    api.show = function(div){
      const effect = api.effectOf(div);
      if(!effect) return;
      const change = div.querySelector('.adv-config-row .adv-config-btn');
      const canChange = !!change && change.getClientRects().length > 0;
      populateInfoOverlay(api.NAME, 'Rank ' + effect.rank + ' · tied to ' + effect.target, '');
      const body = $('stanceInfoBody');
      body.textContent = '';
      body.appendChild(para('Before a weapon attack roll, declare that you are fighting for or protecting ' + effect.target +
        ': +1k1 to that roll. Once per session for each Rank. ' + api.PAGE + '.', 'kt15-rule'));
      const table = document.createElement('table');
      table.className = 'kt15-table';
      [['Each use', '+1k1'], ['Uses left this session', effect.remaining + ' of ' + effect.rank]].forEach(function(r){
        const tr = table.insertRow();
        tr.insertCell().textContent = r[0];
        tr.insertCell().textContent = r[1];
      });
      body.appendChild(table);
      body.appendChild(para('An attack’s roll preview offers the Tie while a use is left; nothing is spent until you roll. ' +
        'Reset session gives back all ' + effect.rank + ' at the start of a session.' +
        (canChange ? ' Change picks another person or Rank; the Rank sets the cost.' : ''), 'kt15-rule'));
    };
    api.makeInfo = function(div){
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sk-info-btn kt15-info';
      b.setAttribute('aria-label', 'Kharmic Tie information');
      b.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); api.show(div); });
      return b;
    };
    // After the row is drawn (and Phase 4.54 and A04 have passed over it): one row, as approved.
    api.shape = function(div){
      const effect = api.effectOf(div);
      const row = effect ? div.querySelector('.adv-config-row') : null;
      if(!row || !row.classList.contains('configured') || row.querySelector('.kt15-main')) return false;
      const badge = row.querySelector('.adv-config-badge'), controls = row.querySelector('.adv-config-kharmic-controls');
      const change = row.querySelector('.adv-config-btn');
      if(!badge || !controls) return false;
      // Phase 4.54's i's, drawn from the badge's and Reset session's titles.
      row.querySelectorAll('.adv-config-info').forEach(function(b){ b.remove(); });
      badge.removeAttribute('title');
      badge.textContent = effect.target + ' · Rank ' + effect.rank;
      const reset = controls.querySelector('.adv-config-reset-session');
      if(reset){ reset.removeAttribute('title'); reset.setAttribute('aria-label', 'Reset session: all ' + effect.rank + ' Kharmic Tie uses back'); }
      if(change){ change.removeAttribute('title'); change.setAttribute('aria-label', 'Change Kharmic Tie: person or Rank'); }
      const main = document.createElement('span');
      main.className = 'kt15-main';
      main.append(badge, controls);
      const end = document.createElement('span');
      end.className = 'kt15-end';
      if(change) end.appendChild(change);
      end.appendChild(api.makeInfo(div));
      row.append(main, end);
      row.classList.add('kt15-row');
      return true;
    };
    api.install = function(){
      if(api.installed || !api.enabled() || !document.body) return false;
      const previousRefresh = refreshAdvConfigControl;
      refreshAdvConfigControl = function(div){
        const result = previousRefresh.apply(this, arguments);
        try { api.shape(div); } catch(e){}
        return result;
      };
      document.body.classList.add('kt15-on');
      api.installed = true;
      return true;
    };
    return api;
  })();
  if(KHARMIC_TIE_ROW_ENABLED) KT15.install();
  // ============ END PART H PHASE 15.2.5 KT15 ============
