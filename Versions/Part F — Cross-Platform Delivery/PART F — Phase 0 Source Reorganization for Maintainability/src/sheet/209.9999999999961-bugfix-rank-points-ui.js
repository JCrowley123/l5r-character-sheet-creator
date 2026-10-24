  // BUGFIX RP7: replaceable social controls and adapters for existing consumers.
  const RP7 = (() => {
    const api = {}, $ = id => document.getElementById(id);
    api.enabled = () => SOCIAL_RANK_POINTS_ENABLED;
    api.labels = {recognize:'Recognition by your lord'};
    const titles = {honor:'Honour', glory:'Glory', status:'Status'};
    const mounted = new Map();
    const shownMigrationNotices = new Set();
    api.showMigrationNotice = data => {
      if(!data?.socialRankMigration?.notice?.length) return;
      const key = JSON.stringify(data);
      if(shownMigrationNotices.has(key)) return;
      shownMigrationNotices.add(key);
      setStatus('Older save reconciled: ' + data.socialRankMigration.notice.join(', ') +
        '. Honour uses the old Points score; Glory and Status keep the approved Rank and the remaining points.');
    };
    api.read = name => RP7Logic.normalize(name, $('f_' + name + 'Rank')?.value, $('f_' + name + 'Pts')?.value);
    api.rank = name => api.read(name)?.rank ?? null;
    api.value = name => {
      const state = api.read(name);
      return state ? state.rank + (name === 'honor' ? state.points / 10 : 0) : null;
    };
    api.write = (name, rank, points) => {
      const state = RP7Logic.normalize(name, rank, points);
      if(!state) return false;
      $('f_' + name + 'Rank').value = String(state.rank);
      $('f_' + name + 'Pts').value = String(state.points);
      api.render(name);
      return true;
    };
    api.setValue = (name, value) => {
      const state = RP7Logic.fromDecimal(value);
      return !!state && api.write(name, state.rank, state.points);
    };
    api.changePoints = (name, delta) => {
      const state = api.read(name);
      return !!state && api.write(name, state.rank, state.points + delta);
    };
    api.management = () => !(typeof MODES12 === 'object' && MODES12 && MODES12.isPlay());
    api.recognize = name => {
      if(!api.management() || name === 'honor') return false;
      const state = RP7Logic.recognize(name, api.read(name));
      return !!state && api.write(name, state.rank, state.points);
    };
    api.changed = name => {
      // UI hook: existing listeners refresh gates, dirty-state tracking and derived values.
      const input = $('f_' + name + 'Pts');
      input.dispatchEvent(new Event('input', {bubbles:true}));
      recalcAll();
    };
    api.render = name => {
      const ui = mounted.get(name), state = api.read(name);
      if(!ui || !state) return;
      ui.last = state;
      ui.score.textContent = state.points < 10 ? state.rank + '.' + state.points : 'Rank ' + state.rank + ' · ' + state.points + ' points';
      ui.pips.forEach((button, i) => button.setAttribute('aria-pressed', String(i < state.points % 10)));
      if(ui.recognition) {
        ui.recognition.textContent = api.labels.recognize;
        ui.recognition.setAttribute('aria-label', api.labels.recognize + ' — ' + titles[name]);
      }
    };
    api.renderAll = () => RP7Logic.names.forEach(api.render);
    function button(text, label, run, rankOnly = false) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = text;
      b.setAttribute('aria-label', label);
      if(rankOnly) b.dataset.rp7Rank = 'true';
      b.addEventListener('click', () => { if(!rankOnly || api.management()) run(); });
      return b;
    }
    api.mount = () => RP7Logic.names.forEach(name => {
      const rank = $('f_' + name + 'Rank'), points = $('f_' + name + 'Pts');
      if(!rank || !points || mounted.has(name)) return;
      const parent = rank.closest('.rank-block') || rank.parentElement.parentElement;
      const box = document.createElement('div'); box.className = 'rp7-controls'; box.dataset.rp7 = name;
      const rankRow = document.createElement('div'); rankRow.className = 'rp7-rank-row';
      const title = document.createElement('span'); title.textContent = 'Rank';
      const moveRank = delta => {
        const state = api.read(name);
        if(state && api.write(name, Math.max(0, Math.min(10, state.rank + delta)), state.points)) api.changed(name);
      };
      // UI hook: retain the saved inputs and their existing listeners; move only their controls.
      const oldRows = [rank.closest('.row'), points.closest('.row')].filter(Boolean);
      rankRow.append(title, button('−', 'Lower ' + titles[name] + ' Rank', () => moveRank(-1), true), rank,
        button('+', 'Raise ' + titles[name] + ' Rank', () => moveRank(1), true));
      rank.min = '0'; rank.max = '10'; rank.step = '1'; rank.setAttribute('aria-label', titles[name] + ' Rank');
      points.step = '1'; points.removeAttribute('max'); points.removeAttribute('min');
      points.setAttribute('aria-label', titles[name] + ' points');
      const score = document.createElement('output'); score.className = 'rp7-score'; score.setAttribute('aria-live', 'polite');
      const pipsRow = document.createElement('div'); pipsRow.className = 'rp7-pips'; pipsRow.setAttribute('role', 'group');
      pipsRow.setAttribute('aria-label', titles[name] + ' point pips');
      const pips = Array.from({length:9}, (_, i) => button(String(i + 1), titles[name] + ': ' + (i + 1) + ' points in this Rank', () => {
        const state = api.read(name); if(!state) return;
        const next = state.points % 10 === i + 1 ? 0 : i + 1;
        if(api.write(name, state.rank, Math.floor(state.points / 10) * 10 + next)) api.changed(name);
      }));
      pips.forEach(b => pipsRow.append(b));
      const pointRow = document.createElement('div'); pointRow.className = 'rp7-point-row';
      const pointLabel = document.createElement('label'); pointLabel.htmlFor = points.id; pointLabel.textContent = 'Points';
      pointRow.append(pointLabel, button('−', 'Lose one ' + titles[name] + ' point', () => {
        if(api.changePoints(name, -1)) api.changed(name);
      }), points, button('+', 'Gain one ' + titles[name] + ' point', () => {
        if(api.changePoints(name, 1)) api.changed(name);
      }));
      box.append(rankRow, score, pipsRow, pointRow);
      let recognition = null;
      if(name !== 'honor') {
        recognition = button(api.labels.recognize, api.labels.recognize + ' — ' + titles[name], () => {
          if(api.recognize(name)) api.changed(name);
        }, true);
        recognition.className = 'rp7-recognition'; box.append(recognition);
      }
      const hint = document.createElement('p'); hint.className = 'hint';
      hint.textContent = name === 'honor' ? 'Ten points make a Rank. Gains and losses apply immediately.' :
        'Points can build past ten. Recognition awards Ranks; losses apply immediately. The pips show the remainder.';
      box.append(hint); parent.append(box);
      oldRows.forEach(row => { if(row !== parent && !row.contains(rank) && !row.contains(points)) {row.hidden = true; row.classList.add('rp7-old-row');} });
      mounted.set(name, {score, pips, recognition, last:api.read(name)});
      [rank, points].forEach(input => input.addEventListener('change', () => {
        if(!api.write(name, rank.value, points.value)) {
          const last = mounted.get(name).last;
          if(last) api.write(name, last.rank, last.points);
          setStatus(titles[name] + ': enter whole numbers; Rank must be between 0 and 10.');
        }
        api.changed(name);
      }));
    });
    return api;
  })();

  if(RP7.enabled()) {
    // UI hook: convert defaults once before reset/init; saved fields now hold whole points.
    RP7Logic.names.forEach(name => {
      const r = document.getElementById('f_' + name + 'Rank'), p = document.getElementById('f_' + name + 'Pts');
      const state = RP7Logic.legacy(name, r.defaultValue, p.defaultValue);
      r.defaultValue = String(state.rank); p.defaultValue = String(state.points);
      RP7.write(name, state.rank, state.points);
    });
    RP7.mount();
    if(typeof MODES12 === 'object' && MODES12) MODES12.register('[data-rp7-rank]');
    if(typeof VersionManager === 'object' && VersionManager && VersionManager.enabled()) {
      VersionManager.register(VersionManager.current(), 'Social Rank and whole points (C2)', RP7Logic.migrate);
    }
    const rp7Apply = applyData;
    applyData = function(data) {
      if(typeof VersionManager === 'object' && VersionManager?.bypass) return rp7Apply.apply(this, arguments);
      const up = typeof VersionManager === 'object' && VersionManager ? VersionManager.upgrade(data) : data;
      const result = rp7Apply.call(this, up);
      if(result !== false) {
        RP7.renderAll();
        // UI hook: once per unchanged legacy record in this session; the next save drops the notice.
        RP7.showMigrationNotice(up);
      }
      return result;
    };
    const rp7Reset = resetToBaseline;
    resetToBaseline = function() { const result = rp7Reset.apply(this, arguments); RP7.renderAll(); return result; };
    const rp7Recalc = recalcAll;
    recalcAll = function() { const result = rp7Recalc.apply(this, arguments); RP7.renderAll(); return result; };
    // Each existing feature reads the shared rule. Optional layers remain optional.
    if(typeof D45 === 'object' && D45) {
      const prior = D45.state;
      D45.state = function() { return Object.assign({}, prior.apply(this, arguments), {status:RP7.rank('status')}); };
    }
    if(typeof R456 === 'object' && R456) R456.honorRank = () => RP7.rank('honor') ?? 0;
    if(typeof CS4514 === 'object' && CS4514) CS4514.statusRank = () => RP7.rank('status');
    if(typeof ANC48 === 'object' && ANC48) ANC48.honor = () => RP7.value('honor');
    if(typeof AP46 === 'object' && AP46) {
      AP46.honor = () => RP7.value('honor') ?? 0;
      AP46.glory = () => RP7.rank('glory') ?? 0;
    }
    if(typeof SIT4528 === 'object' && SIT4528) SIT4528.value = name => RP7.value(name) ?? 0;
    if(typeof CHK4531 === 'object' && CHK4531) CHK4531.honorRank = () => RP7.rank('honor') ?? 0;
    if(typeof DP4523 === 'object' && DP4523) {
      DP4523.honorPoints = () => RP7.value('honor') ?? 0;
      const priorText = DP4523.priceText;
      DP4523.priceText = pay => pay.method === 'honor' ? 'Sacrifice 5 Honour points: ' + DP4523.fmt(pay.before) + ' → ' +
        DP4523.fmt(pay.after) + '. Rank and points update together.' : priorText(pay);
    }
  }
