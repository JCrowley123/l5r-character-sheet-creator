  // BUGFIX LM7: Lord Moon's Curse (Core p.160; owner's design R26 and C5). A full-moon tick on the Disadvantage's row
  // adds a Void Point to the Void card, drawn first so it is spent last, and takes it away when unticked unspent
  // (lost at sunrise). A Willpower roll against TN 15, 20 or 25 for the row's level; on a failure the player loses
  // control of the character for the night. The tick is saved in the row's setting.
  const MOON_CURSE_ENABLED = true;
  const LM7Logic = {
    NAME:'Lord Moon’s Curse',
    TN:{Low:15, Medium:20, High:25},
    tn(level){ return LM7Logic.TN[level] || null; },
    // The Void card holds one more point while the moon is full.
    cap(rank, full){ return rank + (full ? 1 : 0); },
    // Points after the moon rises, or after sunrise: the moon's point is unspent while any point is left.
    rise(points){ return points + 1; },
    set(points){ return points >= 1 ? points - 1 : 0; },
    failText:'You failed to resist Lord Moon’s Curse. You lose control of your character for the night: ' +
      'the GM controls them until sunrise.'
  };
  const LM7 = (() => {
    const api = {};
    const $ = id => document.getElementById(id);
    api.enabled = () => MOON_CURSE_ENABLED && typeof readAdvConfig === 'function' && typeof writeAdvConfig === 'function';
    api.is = div => {
      const name = div && div.querySelector('.en-name');
      return !!name && normalizeAdvName(name.value) === normalizeAdvName(LM7Logic.NAME);
    };
    api.config = div => {
      const config = readAdvConfig(div);
      return config && LM7Logic.tn(config.value) ? config : null;
    };
    api.rows = () => Array.from(document.querySelectorAll('#advList .entry, #disadvList .entry')).filter(api.is);
    api.full = () => api.rows().some(div => { const c = api.config(div); return !!c && c.moon === true; });
    api.points = () => Math.max(0, parseInt($('void_current').value || '0', 10) || 0);
    // full: the moon has risen (true) or set (false). Resolves the Void Points after.
    api.setMoon = (div, full) => {
      const config = api.config(div);
      if(!config || (config.moon === true) === full) return null;
      const before = api.points(), after = full ? LM7Logic.rise(before) : LM7Logic.set(before);
      writeAdvConfig(div, config.type, Object.assign({}, config, {moon:full}));
      $('void_current').value = after;
      renderVoidPips();
      recalcAll();
      setStatus(full ? 'Lord Moon’s Curse: the full moon gives a Void Point until sunrise, spent last.'
        : 'Lord Moon’s Curse: sunrise. ' + (after < before ? 'The moon’s Void Point was lost unspent.' : 'The moon’s Void Point was spent.'));
      return after;
    };
    // Resolves true (passed), false (failed) or null (no roll).
    api.roll = async div => {
      const config = api.config(div);
      if(!config) return null;
      const tn = LM7Logic.tn(config.value), willpower = getTraitValueByName('Willpower');
      if(!Number.isFinite(willpower) || willpower < 1){
        await appAlert('Enter a valid Willpower Rank before making this roll.');
        return null;
      }
      let settle;
      const closed = new Promise(resolve => { settle = resolve; });
      const result = await rollWithModifiers(LM7Logic.NAME + ' — Willpower vs TN ' + tn,
        makeRollContext(ROLL_KINDS.TRAIT, {traitName:'Willpower', traitValue:willpower}), willpower, willpower,
        {tnConfig:{tn, successText:'Willpower roll passed. You keep control tonight.', failText:'Willpower roll failed.',
          onClose:passed => settle(passed === true)}});
      if(!result){ settle(null); return null; }
      const passed = await closed;
      if(passed === false) await appAlert(LM7Logic.failText);
      return passed;
    };
    // UI hook: the tick and the roll button sit under the row's severity summary.
    api.decorate = div => {
      const config = api.config(div);
      if(!config || typeof advConfigRowFor !== 'function') return;
      const row = advConfigRowFor(div);
      const old = row.querySelector('.lm7-moon');
      if(old) old.remove();
      const box = document.createElement('div');
      box.className = 'lm7-moon';
      const label = document.createElement('label');
      label.className = 'lm7-tick';
      const tick = document.createElement('input');
      tick.type = 'checkbox';
      tick.checked = config.moon === true;
      tick.addEventListener('change', () => api.setMoon(div, tick.checked));
      label.appendChild(tick);
      label.appendChild(document.createTextNode(' Full moon tonight (+1 Void Point, spent last)'));
      const roll = document.createElement('button');
      roll.type = 'button';
      roll.className = 'ghost lm7-roll';
      roll.textContent = 'Willpower roll (TN ' + LM7Logic.tn(config.value) + ')';
      roll.addEventListener('click', () => api.roll(div));
      box.appendChild(label);
      box.appendChild(roll);
      row.appendChild(box);
    };
    // The Void card with the moon's point drawn first, so the other points are spent before it.
    api.renderPips = () => {
      const rank = Math.max(1, Math.min(10, parseInt($('ring_void').value || '1', 10)));
      const hidden = $('void_current');
      let current = Math.max(0, parseInt(hidden.value || '0', 10));
      if(prevVoidRank !== null && rank > prevVoidRank) current += rank - prevVoidRank;
      current = Math.max(0, Math.min(LM7Logic.cap(rank, true), current));
      hidden.value = current;
      prevVoidRank = rank;
      const wrap = $('voidPips');
      wrap.innerHTML = '';
      for(let i = 0; i <= rank; i++){
        const pip = document.createElement('button');
        pip.type = 'button';
        pip.className = 'void-pip' + (i === 0 ? ' lm7-moon-pip' : '') + (i < current ? ' filled' : '');
        pip.title = (i === 0 ? 'Lord Moon’s Void Point, lost at sunrise. ' : '') +
          (i < current ? 'Filled — click to spend this Void Point' : 'Blank — click (or right-click) to get this Void Point back');
        wrap.appendChild(pip);
      }
      if(typeof renderQuickAccessPanel === 'function') renderQuickAccessPanel();
    };
    if(api.enabled()){
      const style = document.createElement('style');
      style.textContent = '.void-pip.lm7-moon-pip{border-color:#aebbd0;box-shadow:0 0 0 2px rgba(174,187,208,.4)}' +
        '.void-pip.lm7-moon-pip.filled{background:#c9d3e2}' +
        '.lm7-moon{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:6px;flex-basis:100%}';
      document.head.appendChild(style);
      const previousRefresh = refreshAdvConfigControl;
      refreshAdvConfigControl = function(div){
        const out = previousRefresh.apply(this, arguments);
        if(api.is(div)) api.decorate(div);
        return out;
      };
      const previousPips = renderVoidPips;
      renderVoidPips = function(){ return api.full() ? api.renderPips() : previousPips.apply(this, arguments); };
      if(typeof renderQuickAccessPanel === 'function'){
        const previousQuick = renderQuickAccessPanel;
        renderQuickAccessPanel = function(){
          const out = previousQuick.apply(this, arguments);
          const value = $('qaVoidValue');
          if(value && api.full()) value.textContent = api.points() + ' / ' + $('ring_void').value + ' + the moon’s';
          return out;
        };
      }
    }
    return api;
  })();
