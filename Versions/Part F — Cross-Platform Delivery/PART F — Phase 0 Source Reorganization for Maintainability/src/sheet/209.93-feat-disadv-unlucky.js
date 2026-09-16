  // ========= PART I FEATURE 4.57: UNLUCKY =========
  //
  // D05, the last of the audit's 23 missing configuration handlers, and the only one of the three
  // remaining that needed dice-engine work rather than a badge.
  //
  // THIS ONE BELONGS ON PHASE 4.5.2's D45, and Feature 4.56's did not. That phase wanted the same
  // free-number rank and could not use D45.install(), because D45.refresh() opens with
  // `div.parentElement?.id !== 'disadvList'` and renders "This entry belongs in Disadvantages."
  // for anything else. Unlucky IS a Disadvantage, so that invariant is satisfied rather than
  // fought, and the whole rank/validate/resolve/decorate surface comes for free.
  //
  // THE RULE, and the two numbers it is easy to conflate. Core p.162: 2 XP per rank, and one use
  // per rank per session. Rank 5 is therefore 10 XP and 5/5 uses, NOT 10/10 -- the award and the
  // resource scale off the same rank but are not the same number. When invoked, the second result
  // is kept IN ALL CASES, even when it is better than the first. The catalogue used to say
  // "keeping the worse result"; Feature 4.53 already corrected that text against the source.
  //
  // WHY THE REROLL CANNOT RESTART THE ACTION. The audit is explicit that a reroll must not re-pay
  // a spell slot, re-run a Willpower gate, spend Void again, re-activate a limited resource or
  // offer a fresh bonus selection. This reuses Phase 4.5's own advConfigLuckRerollResult(), which
  // re-rolls the SAVED dice pool and re-applies the flat modifiers already baked into the first
  // result. It never re-enters the action that produced the roll, so none of those costs can be
  // charged twice -- the property is structural, not a list of things this phase remembers not to
  // do. Reusing that helper rather than copying it also keeps the exploding-dice threshold
  // handling in one place; 100-dice-engine.js has a comment about why that matters.
  const DISADV_UNLUCKY_ENABLED = true;

  const R457 = (function(){
    const api = {};
    api.enabled = function(){ return DISADV_UNLUCKY_ENABLED; };
    api.NAME = 'Unlucky';

    const clamp = function(value, max){
      const number = parseInt(value, 10);
      if(!Number.isFinite(number)) return max;
      return Math.max(0, Math.min(max, number));
    };

    api.rankOf = function(value){
      const text = String(value === undefined || value === null ? '' : value).trim();
      if(!/^\d+$/.test(text)) return null;
      const rank = Number(text);
      return Number.isSafeInteger(rank) && rank >= 1 ? rank : null;
    };

    // ---------- The D45 definition ----------
    api.definition = {
      type: 'rankPick',
      steps: function(){
        return [{ field: 'rank', label: 'Rank — 2 XP per rank, one use per rank', number: true, min: 1 }];
      },
      validate: function(config){ return api.rankOf(config && config.rank) !== null; },
      resolve: function(config){
        const rank = api.rankOf(config.rank);
        if(rank === null) return null;
        // `remaining` is READ here and defaulted, never written: a freshly configured entry shows
        // a full pool without this phase having to write to the row just to render it.
        const remaining = config.remaining === undefined ? rank : clamp(config.remaining, rank);
        return {
          cost: 2 * rank, rank: rank, remaining: remaining, unlucky: true,
          summary: 'Rank ' + rank + ' — the GM may force ' + rank + ' reroll' + (rank === 1 ? '' : 's') +
            ' per session, keeping the second result; ' + remaining + '/' + rank + ' left',
        };
      },
      decorate: function(div, row, config, effect){ api.decorateRow(div, row, effect); },
    };

    api.isUnlucky = function(effect){ return !!(effect && effect.unlucky === true); };

    api.entries = function(){
      if(!api.enabled()) return [];
      const out = [];
      document.querySelectorAll('#disadvList .entry').forEach(function(div){
        const name = div.querySelector('.en-name');
        if(!name || normalizeAdvName(name.value) !== normalizeAdvName(api.NAME)) return;
        const effect = resolveAdvDisadvEffect(name.value, readAdvConfig(div));
        if(api.isUnlucky(effect)) out.push({ div: div, effect: effect });
      });
      return out;
    };

    api.setRemaining = function(div, remaining){
      const config = readAdvConfig(div);
      const name = div && div.querySelector('.en-name');
      const effect = name ? resolveAdvDisadvEffect(name.value, config) : null;
      if(!config || !api.isUnlucky(effect)) return false;
      config.remaining = clamp(remaining, effect.rank);
      writeAdvConfig(div, config.type, config);
      return true;
    };

    api.adjust = function(div, delta, message){
      const entry = api.entries().find(function(item){ return item.div === div; });
      if(!entry) return false;
      if(!api.setRemaining(div, entry.effect.remaining + delta)) return false;
      recalcAll();
      const after = api.entries().find(function(item){ return item.div === div; });
      if(after) setStatus(message + ' — ' + after.effect.remaining + '/' + after.effect.rank + ' left.');
      return true;
    };

    api.reset = function(div){
      const entry = api.entries().find(function(item){ return item.div === div; });
      if(!entry) return false;
      if(!api.setRemaining(div, entry.effect.rank)) return false;
      recalcAll();
      setStatus('Unlucky reset to ' + entry.effect.rank + '/' + entry.effect.rank + ' uses for this session.');
      return true;
    };

    // ---------- The row ----------
    // The manual −/+ pair is not a convenience: the audit requires a correction path because a
    // reroll forced at the table, away from the sheet, still spends a use that nothing here saw.
    api.decorateRow = function(div, row, effect){
      if(!api.enabled() || !api.isUnlucky(effect) || !row) return;
      const controls = document.createElement('span');
      controls.className = 'unlucky-controls';

      const pips = document.createElement('span');
      pips.className = 'unlucky-pips';
      pips.setAttribute('aria-label', effect.remaining + ' of ' + effect.rank + ' Unlucky uses remaining');
      pips.textContent = '●'.repeat(effect.remaining) + '○'.repeat(effect.rank - effect.remaining) +
        ' ' + effect.remaining + '/' + effect.rank;
      controls.appendChild(pips);

      // The description goes on aria-label, NOT title. Feature 4.54 decorates every element
      // carrying an explanatory `title=` with a tappable circled-i, which is right for a rules
      // tooltip a phone could not otherwise reach — but wrong for three small controls whose own
      // labels sit inches away: reported from the device as clutter, one icon per button on a row
      // that is already dense. aria-label keeps the accessible name (a screen reader announcing
      // "−" alone would be useless) without presenting as a tooltip worth decorating.
      const button = function(label, description, handler, disabled){
        const element = document.createElement('button');
        element.type = 'button';
        element.className = 'ghost unlucky-btn';
        element.textContent = label;
        element.setAttribute('aria-label', description);
        element.disabled = !!disabled;
        element.addEventListener('click', handler);
        controls.appendChild(element);
        return element;
      };

      button('−', 'Record an Unlucky use the GM forced away from the sheet',
        function(){ api.adjust(div, -1, 'Unlucky use recorded'); }, effect.remaining <= 0);
      button('+', 'Give back an Unlucky use recorded by mistake',
        function(){ api.adjust(div, 1, 'Unlucky use restored'); }, effect.remaining >= effect.rank);
      button('Reset session', 'Restore Unlucky to its per-session maximum',
        function(){ api.reset(div); }, false);

      row.appendChild(controls);
    };

    // ---------- The roll result ----------
    api.OUTCOME_CLASS = 'unlucky-outcome';

    api.note = function(message){
      const body = document.getElementById('rollModalBody');
      if(!body) return;
      const old = body.querySelector('.' + api.OUTCOME_CLASS);
      if(old) old.remove();
      const note = document.createElement('div');
      note.className = api.OUTCOME_CLASS;
      note.textContent = message;
      body.insertBefore(note, body.firstChild);
    };

    api.invoke = function(entry, title, result){
      if(!entry || entry.effect.remaining <= 0) return false;
      if(typeof advConfigLuckRerollResult !== 'function'){
        setStatus('Unlucky cannot reroll: the session-resource module this reroll depends on is not present.');
        return false;
      }
      const totalEl = document.getElementById('rollTotalDisplay');
      const originalTotal = parseInt(totalEl && totalEl.textContent || String(result.total || 0), 10) || 0;
      const rerolled = advConfigLuckRerollResult(result);
      if(!rerolled){
        setStatus('Unlucky could not reroll this result because its pool was unavailable.');
        return false;
      }
      if(!api.setRemaining(entry.div, entry.effect.remaining - 1)) return false;
      setTimeout(function(){ recalcAll(); }, 0);

      // The second result stands WHETHER OR NOT it is better, which is the whole difference from
      // Luck and the thing the old catalogue text got wrong. So this always re-displays, where
      // Luck only re-displays when its reroll wins. The modal's TN and on-close behaviour are
      // carried across so a reroll of a gated roll still reports success against the same target.
      const savedTN = currentRollTN;
      const savedSuccess = currentRollSuccessText;
      const savedFail = currentRollFailText;
      const savedOnClose = currentRollOnClose;
      showRollResult(title + ' — Unlucky reroll', rerolled, savedTN === null ? undefined : {
        tn: savedTN, successText: savedSuccess, failText: savedFail, onClose: savedOnClose,
      });
      api.note('Unlucky invoked — original ' + originalTotal + ', reroll ' + rerolled.total +
        '. The second result stands' +
        (rerolled.total > originalTotal ? ', even though it is higher.' : '.'));
      return true;
    };

    api.decorateResult = function(title, result){
      if(!api.enabled()) return 0;
      const body = document.getElementById('rollModalBody');
      if(!body) return 0;
      const entries = api.entries();
      if(!entries.length) return 0;
      const wrap = document.createElement('div');
      wrap.className = 'unlucky-actions';
      const head = document.createElement('div');
      head.className = 'unlucky-head';
      head.textContent = 'Unlucky — the GM may force a reroll; the second result stands';
      wrap.appendChild(head);
      entries.forEach(function(entry){
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ghost unlucky-invoke';
        // Visible but disabled at zero, deliberately: a pool the player knows they have should
        // read as spent, not silently vanish.
        button.disabled = entry.effect.remaining <= 0;
        button.textContent = 'GM invokes Unlucky (' + entry.effect.remaining + '/' + entry.effect.rank + ')';
        button.title = entry.effect.remaining > 0
          ? 'Reroll this entire roll and keep the second result'
          : 'No Unlucky uses remain this session';
        button.addEventListener('click', function(){ api.invoke(entry, title, result); });
        wrap.appendChild(button);
      });
      body.appendChild(wrap);
      return entries.length;
    };

    return api;
  })();

  if(R457.enabled() && typeof D45 === 'object' && D45 && typeof D45.install === 'function'){
    D45.install(R457.NAME, R457.definition);

    // Outermost on the result-modal chain, so Luck's own actions are appended first and Unlucky's
    // sit below them. Keeps the previous binding and delegates, as every 4.5 wrapper does.
    if(typeof onAdvConfigRollResult === 'function'){
      const r457PrevResult = onAdvConfigRollResult;
      onAdvConfigRollResult = function(title, result){
        const out = r457PrevResult(title, result);
        R457.decorateResult(title, result);
        return out;
      };
    }

    // The read-only quick-access panel lists session resources. Phase 4.5 builds that list from
    // its own collector, so Unlucky joins it here rather than this phase rendering a second panel.
    if(typeof advConfigAllSessionResources === 'function'){
      const r457PrevResources = advConfigAllSessionResources;
      advConfigAllSessionResources = function(){
        const resources = r457PrevResources() || [];
        R457.entries().forEach(function(entry){
          resources.push({ kind: 'Unlucky', target: '', div: entry.div, effect: entry.effect });
        });
        return resources;
      };
    }
  }
