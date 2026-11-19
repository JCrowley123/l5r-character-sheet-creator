  // ============ PART H PHASE 15.1.33 — UNDO THE LAST VOID SPEND ============
  // Phase 15, Release 15a, unit A19 (group G6, new functions), approved by the owner on 19 November 2026 as mocked up:
  // FT-24 as the owner ruled it on 9 October 2026, an Undo on the Void card for the most recent spend made there (the
  // point back, its effect taken back, its Willpower roll dropped) until the next roll, Next Round or Reset. The number
  // 33 is this unit's marker only; the unit keeps its identifier, A19.
  // After a spend from the Void card on the Combat page (its six buttons and Hotei's Curse's two-point button, all inside
  // #voidSpendButtons, and the damage row's Apply), a line under the buttons shows Undo and what was spent. Undo puts
  // back exactly the values from just before that spend, once: the Void Points, the armed one-roll effect (including
  // one it replaced), the current Round's Void entries (its spend and the +10 TN), the skirmish Initiative flag and the
  // Wounds a damage reduction added. A Touch of the Void Willpower roll still waiting for that spend is dropped
  // (VI4533.owed); one already opened and cancelled is not owed again. Revised after the owner's device round of
  // 19 November 2026 ("Keep Undo"): Touch of the Void's own Willpower roll is part of the spend, so rolling it does not
  // end Undo; Undo then says that roll no longer counts (the sheet does not track Dazed, so the player tells the GM).
  // The line goes at any other roll the sheet makes (the result window opens; a cancelled preview is not a roll), at Next
  // Round and Reset, at another card spend (which takes its place), when another character is opened or the sheet is
  // reset, and on any other change to those values (a pip tap, a Void Point spent in a roll preview). After Undo it reads
  // "Undone: …" with no button until the next change. Spends outside the card are not covered. The roll preview's refund
  // (RF7) and History (AL71) are untouched: History records the spend and the Undo as ordinary changes. Nothing is saved.
  const VOID_SPEND_UNDO_ENABLED = true;

  const VU15 = (function(){
    const api = {installed: false};
    const $ = function(id){ return document.getElementById(id); };
    // What each card spend did, for the line; then what Undo says it put back.
    const SPENT = {k1: '+1k1 on your next roll', skill: 'your next Unskilled roll made Skilled',
      tn: '+10 TN to be hit, this Round', init: '+10 Initiative, this skirmish', kiho: 'activating a Kiho'};
    const UNDONE = {k1: '+1k1 cleared', skill: 'the Skilled roll cleared', tn: 'Armor TN back to normal',
      init: 'Initiative back to normal', kiho: 'the Kiho activation taken back'};
    const ONE_ROLL = {k1: true, skill: true};
    const ROUND_KEYS = ['void', 'voidTN'];
    let last = null;   // the latest card spend Undo can take back: {key, before, after, owed, base, wounds}
    let done = null;   // after Undo, until the next change: {message, after}
    let pre = null;    // the values just before a click on the card, until the click has been handled
    let undoing = false;
    let touchRolling = 0;   // Touch of the Void's own Willpower roll under way (VI4533.check)
    api.enabled = function(){ return VOID_SPEND_UNDO_ENABLED === true && typeof spendVoid === 'function' && !!$('voidSpendButtons'); };
    const num = function(id){ const el = $(id); return el ? el.value : null; };
    const owed = function(){ return typeof VI4533 === 'object' && VI4533 && Number.isFinite(VI4533.owed) ? VI4533.owed : 0; };
    function roundEntry(){
      const entry = (typeof getRoundLedger === 'function' && typeof getCombatRound === 'function')
        ? getRoundLedger()[String(getCombatRound())] || {} : {};
      const out = {};
      ROUND_KEYS.forEach(function(k){ if(entry[k] !== undefined) out[k] = entry[k]; });
      return out;
    }
    // The values a card spend can change.
    function read(){
      return {points: num('void_current'), pending: num('voidPendingEffects'), init: num('voidInitSkirmish'),
        wounds: num('f_woundsTaken'), round: num('combatRoundNumber'), entry: JSON.stringify(roundEntry())};
    }
    const same = function(a, b){
      return !!a && !!b && ['points', 'pending', 'init', 'wounds', 'round', 'entry'].every(function(k){ return a[k] === b[k]; });
    };
    // A Touch of the Void roll this spend still owes: the ones it added that have not opened yet.
    function waiting(){
      return last ? Math.min(Math.max(0, last.owed), Math.max(0, owed() - last.base)) : 0;
    }
    function hoteiLabel(){
      const label = typeof HOTEI4536 === 'object' && HOTEI4536 && HOTEI4536.LABEL ? String(HOTEI4536.LABEL) : 'For a Technique or Advantage';
      return '2 Void Points ' + label.charAt(0).toLowerCase() + label.slice(1) + ' (Hotei’s Curse)';
    }
    function spentText(){
      if(last.key === 'damage') return 'Spent: damage reduced by 10; ' + last.wounds + ' Wound' + (last.wounds === 1 ? '' : 's') + ' taken.';
      if(last.key === 'hotei') return 'Spent: ' + hoteiLabel() + '.';
      return 'Spent: ' + SPENT[last.key] + '.';
    }
    function touchText(){
      if(!last || last.owed <= 0) return '';
      if(last.touchRolled) return ' Touch of the Void’s Willpower roll was made; after Undo it no longer counts.';
      if(waiting() > 0) return ' Touch of the Void’s Willpower roll comes after ' + (ONE_ROLL[last.key] ? 'that roll' : 'your next roll') + '; Undo drops it.';
      return ' Touch of the Void’s Willpower roll was not made.';
    }
    function undoneText(L, dropped){
      const points = L.key === 'hotei' ? 'both Void Points are back' : 'the Void Point is back';
      const effect = L.key === 'damage' ? 'the ' + L.wounds + ' Wound' + (L.wounds === 1 ? '' : 's') + ' taken back'
        : L.key === 'hotei' ? '' : UNDONE[L.key];
      return 'Undone: ' + points + (effect ? '; ' + effect : '') + (dropped ? '; no Touch of the Void roll.' : '.') +
        (L.touchRolled ? ' The Touch of the Void roll made for it no longer counts: tell the GM if it left you Dazed.' : '');
    }
    // A roll preview arms and clears the one-roll effects while it works out what it can offer, and hands them back
    // exactly as found when it closes, so nothing is judged while one is open.
    function previewOpen(){
      const o = $('rollPreviewOverlay');
      return !!o && getComputedStyle(o).display !== 'none';
    }
    // Ends Undo (and the "Undone" line) when anything it covers has changed since.
    function check(){
      if(undoing || previewOpen()) return;
      if(last && !same(last.after, read())) last = null;
      if(done && !same(done.after, read())) done = null;
    }
    api.end = function(){ last = null; done = null; pre = null; draw(); };

    // ---------- The line ----------
    function draw(){
      check();
      const wrap = $('voidSpendButtons');
      if(!wrap || !wrap.parentNode) return;
      let box = $('vu15Line');
      if(!box){
        box = document.createElement('div');
        box.id = 'vu15Line';
        box.className = 'vu15-line';
        box.setAttribute('aria-live', 'polite');
        box.tabIndex = -1;
      }
      const anchor = $('voidWhyReasons') && $('voidWhyReasons').parentNode === wrap.parentNode ? $('voidWhyReasons') : wrap;
      if(box.previousSibling !== anchor) anchor.parentNode.insertBefore(box, anchor.nextSibling);
      const key = last ? 'L|' + spentText() + touchText() : done ? 'D|' + done.message : '';
      if(box.dataset.vu15Key === key) return;
      box.dataset.vu15Key = key;
      box.textContent = '';
      box.hidden = !key;
      if(last){
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ghost vu15-undo';
        b.textContent = 'Undo';
        b.setAttribute('aria-label', 'Undo the last Void spend');
        b.addEventListener('click', function(){ api.undo(); });
        const t = document.createElement('span');
        t.className = 'vu15-text';
        t.textContent = spentText() + touchText();
        box.append(b, t);
      } else if(done){
        const t = document.createElement('span');
        t.className = 'vu15-text';
        t.textContent = done.message;
        box.append(t);
      }
    }

    // ---------- Recording a card spend ----------
    function before(key){ pre = {key: key, values: read(), owed: owed()}; }
    function after(){
      const p = pre;
      pre = null;
      if(!p) return;
      const now = read();
      if(!(Number(now.points) < Number(p.values.points))) return;   // nothing was spent (refused, or no points)
      last = {key: p.key, before: p.values, after: now, owed: owed() - p.owed, base: p.owed,
        wounds: Math.max(0, (parseInt(now.wounds, 10) || 0) - (parseInt(p.values.wounds, 10) || 0))};
      done = null;
      draw();
    }
    function cardKey(button){
      if(!button || button.disabled || !button.classList.contains('void-spend-btn')) return '';
      if(button.dataset.void) return button.dataset.void === 'damage' ? '' : button.dataset.void;   // damage: its row's Apply
      return button.classList.contains('hotei4536-spend') ? 'hotei' : '';
    }

    // ---------- Undo ----------
    api.undo = function(){
      if(previewOpen()) return false;
      check();
      if(!last){ draw(); return false; }
      const L = last, hadFocus = document.activeElement && document.activeElement.classList.contains('vu15-undo');
      const drop = waiting();
      last = null;
      done = null;
      undoing = true;
      try {
        [['void_current', 'points'], ['voidPendingEffects', 'pending'], ['voidInitSkirmish', 'init'], ['f_woundsTaken', 'wounds']]
          .forEach(function(pair){ const el = $(pair[0]); if(el && L.before[pair[1]] !== null) el.value = L.before[pair[1]]; });
        if(typeof getRoundLedger === 'function' && typeof saveRoundLedger === 'function' && typeof getCombatRound === 'function'){
          const ledger = getRoundLedger(), r = String(getCombatRound()), was = JSON.parse(L.before.entry);
          const entry = Object.assign({}, ledger[r] || {});
          ROUND_KEYS.forEach(function(k){ if(was[k] !== undefined) entry[k] = was[k]; else delete entry[k]; });
          if(Object.keys(entry).length) ledger[r] = entry; else delete ledger[r];
          saveRoundLedger(ledger);
        }
        if(drop && typeof VI4533 === 'object' && VI4533) VI4533.owed = Math.max(0, VI4533.owed - drop);
        // UI hook: the pips, the card, the Round tracker and the sheet redraw from the values put back.
        if(typeof renderVoidPips === 'function') renderVoidPips();
        if(typeof renderCombatRoundUI === 'function') renderCombatRoundUI();
        if(typeof recalcAll === 'function') recalcAll();
        if(typeof renderVoidPanel === 'function') renderVoidPanel();
      } finally { undoing = false; }
      const message = undoneText(L, drop > 0);
      done = {message: message, after: read()};
      if(typeof setStatus === 'function') setStatus(message);
      draw();
      if(hadFocus){ const box = $('vu15Line'); if(box) box.focus({preventScroll: true}); }
      return true;
    };
    // For tests: whether Undo is offered, for which spend, and the line's text.
    api.state = function(){
      check();
      const box = $('vu15Line');
      return {offered: !!last, key: last ? last.key : null, waiting: waiting(), undone: !!done,
        line: box && !box.hidden ? box.textContent : ''};
    };

    // ---------- Installation ----------
    api.install = function(){
      if(api.installed || !api.enabled()) return false;
      const wrap = $('voidSpendButtons');
      // The card's buttons are redrawn on every render, so the listeners sit on their holder: capture runs before a
      // button's own handler, bubble after it.
      wrap.addEventListener('click', function(e){
        const key = cardKey(e.target && e.target.closest ? e.target.closest('button') : null);
        if(key) before(key);
      }, true);
      wrap.addEventListener('click', after);
      const row = $('voidDamageRow');
      if(row){
        row.addEventListener('click', function(e){ if(e.target && e.target.closest && e.target.closest('#voidDamageApply')) before('damage'); }, true);
        row.addEventListener('click', after);
      }
      // Touch of the Void's own Willpower roll is part of the spend (owner, 19 November 2026): while it is under way its
      // result window does not end Undo. Wrapped by property, as the roll is asked for (VI4533.check).
      if(typeof VI4533 === 'object' && VI4533 && typeof VI4533.check === 'function'){
        const vu15PreviousTouch = VI4533.check;
        const vu15TouchDone = function(){ touchRolling = Math.max(0, touchRolling - 1); draw(); };
        VI4533.check = function(){
          touchRolling += 1;
          let out;
          try { out = vu15PreviousTouch.apply(this, arguments); }
          catch(e){ vu15TouchDone(); throw e; }
          Promise.resolve(out).then(vu15TouchDone, vu15TouchDone);
          return out;
        };
      }
      // Any other roll made ends it: the result window opening.
      const result = $('rollModalOverlay');
      if(result && typeof MutationObserver === 'function'){
        new MutationObserver(function(){
          if(!(last || done) || getComputedStyle(result).display === 'none') return;
          if(touchRolling > 0){ if(last) last.touchRolled = true; draw(); return; }
          api.end();
        }).observe(result, {attributes: true, attributeFilter: ['style', 'class', 'hidden']});
      }
      // A roll preview closing: judge again, and say whether Touch of the Void's roll was made.
      const preview = $('rollPreviewOverlay');
      if(preview && typeof MutationObserver === 'function'){
        new MutationObserver(function(){ if(!previewOpen()) draw(); })
          .observe(preview, {attributes: true, attributeFilter: ['style', 'class', 'hidden']});
      }
      // Next Round and Reset end it, whatever they change.
      ['btnNextRound', 'btnResetRounds'].forEach(function(id){
        const b = $(id);
        if(b) b.addEventListener('click', function(){ api.end(); }, true);
      });
      // The line follows every redraw of the card and of the pips (every recalc and every pip tap).
      if(typeof renderVoidPanel === 'function'){
        const vu15PreviousPanel = renderVoidPanel;
        renderVoidPanel = function(){
          const out = vu15PreviousPanel.apply(this, arguments);
          try { draw(); } catch(e){ if(window.console && console.warn) console.warn('L5R sheet: Void Undo line not drawn —', e && e.message); }
          return out;
        };
      }
      if(typeof renderVoidPips === 'function'){
        const vu15PreviousPips = renderVoidPips;
        renderVoidPips = function(){
          const out = vu15PreviousPips.apply(this, arguments);
          try { draw(); } catch(e){ if(window.console && console.warn) console.warn('L5R sheet: Void Undo line not drawn —', e && e.message); }
          return out;
        };
      }
      // Another character opened, or the sheet reset: nothing to take back.
      if(typeof applyData === 'function'){
        const vu15PreviousApply = applyData;
        applyData = function(){ api.end(); const out = vu15PreviousApply.apply(this, arguments); api.end(); return out; };
      }
      if(typeof resetToBaseline === 'function'){
        const vu15PreviousReset = resetToBaseline;
        resetToBaseline = function(){ api.end(); const out = vu15PreviousReset.apply(this, arguments); api.end(); return out; };
      }
      api.installed = true;
      draw();
      return true;
    };
    return api;
  })();
  if(VOID_SPEND_UNDO_ENABLED) VU15.install();
  // ============ END PART H PHASE 15.1.33 VU15 ============
