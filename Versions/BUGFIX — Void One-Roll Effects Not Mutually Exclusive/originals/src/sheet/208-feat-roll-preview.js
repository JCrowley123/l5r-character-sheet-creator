  // ============ PART G PHASE 3: SMART ROLL PREVIEW ============
  // Shows the pool, the modifiers behind it, the TN where one exists, and any Void point the
  // player could still spend -- BEFORE the dice are thrown -- then rolls only on confirmation.
  //
  // WHY THIS NEEDED ALMOST NO NEW ARITHMETIC. Phase 1.5's audit established that the pipeline's
  // two calculating steps are already pure and already separated from the throw:
  // getPreRollModifiers(ctx) asks every registered contributor what applies, and
  // applyPreRollModifiers(base) folds the answers onto the base pool. Neither touches a die.
  // rollWithModifiers() simply called both and then rolled immediately. This phase inserts a
  // gate between those two halves and the throw; the numbers it shows are the pipeline's own,
  // not a second implementation that could drift from it. The roadmap's "introduce a RollContext
  // object that aggregates all roll factors" was, on inspection, already built -- as
  // makeRollContext() plus the registry -- so this phase renders it rather than rebuilding it.
  //
  // THE VOID PROJECTION, AND WHY CANCEL IS SAFE. Arming a one-roll Void effect normally goes
  // through spendVoid(), which deducts a point, writes the once-per-Round ledger entry, AND sets
  // a pending flag. Only that last step is what voidPreRollModifiers() actually reads. So while
  // the preview is open, toggling an option sets ONLY the pending flag -- no point leaves the
  // tracker, no ledger entry is written -- and the projected pool is then recomputed by asking
  // the real contributor, so the preview cannot drift from what the roll will do. Cancelling
  // restores the pending object as found: nothing was spent, because nothing was ever spent.
  // Confirming restores it too and then calls the canonical spendVoid() for each newly chosen
  // key, so the commit path is exactly the Void card's own path, with its own eligibility
  // checks, rather than a duplicate of it.
  //
  // WHICH OPTIONS GET OFFERED is decided the same drift-proof way: a Void option is listed only
  // if arming it actually changes the projected pool for THIS roll. Nothing here re-states the
  // rules about which effects apply to which roll kinds -- voidPreRollModifiers() owns those,
  // and this asks it rather than repeating it.
  //
  // DAMAGE ROLLS GET NO PREVIEW, and correctly so: they never enter rollWithModifiers() at all
  // (Part B rolls them directly; RAW says "Damage Rolls may not be enhanced"). See Phase 1.5's
  // README, "Damage rolls take a different path".
  //
  // Flip this to false to disable the preview everywhere without removing anything: every roll
  // then fires immediately, exactly as before this phase. See this phase's ROLLBACK.md.
  const ROLL_PREVIEW_ENABLED = true;

  // The one-roll Void keys this preview may offer. The non-one-roll spends (Armor TN, Initiative,
  // damage reduction, Kiho) are deliberately absent: they are not properties of the roll you are
  // about to make, so the Void card remains their home.
  const ROLL_PREVIEW_VOID_KEYS = ['k1', 'trait', 'skill'];

  // ---- The shared breakdown renderer -----------------------------------------------------
  // Returns [{label, txt}] describing every modifier that applied. Phase 4 ("Explain This Roll")
  // is the same information rendered AFTER the roll instead of before -- when it is built it can
  // call this rather than growing a second copy. attachRollModifierBreakdown() in
  // 130-round-and-pipeline.js deliberately does NOT call it today: the trunk must not depend on
  // a removable phase, or removing this one would break the post-roll bar. See this phase's
  // README, "What Phase 4 inherits".
  function buildRollModifierRows(adj, tenDiceBonus){
    const rows = [];
    if(tenDiceBonus) rows.push({ label:'Ten Dice Rule', txt:'+' + tenDiceBonus + ' to total' });
    ((adj && adj.applied) || []).forEach(m=>{
      const bits = [];
      if(m.rolledDelta || m.keptDelta){
        bits.push((m.rolledDelta >= 0 ? '+' : '') + m.rolledDelta + 'k' + (m.keptDelta >= 0 ? '' : '') + m.keptDelta);
      }
      if(m.totalDelta) bits.push((m.totalDelta >= 0 ? '+' : '') + m.totalDelta + ' to total');
      if(!bits.length && m.display) bits.push(m.display);
      rows.push({ label:m.label, txt:bits.join(', ') + (m.note ? ' — ' + m.note : '') });
    });
    return rows;
  }

  // ---- Projection ------------------------------------------------------------------------
  // Pure with respect to the player's resources: reads the pipeline, writes nothing but the
  // pending flag its caller already saved and will restore.
  function projectRoll(context, baseRolled, baseKept){
    const mods = getPreRollModifiers(context);
    const adj = applyPreRollModifiers(baseRolled, baseKept, mods);
    return { mods, adj };
  }

  // Would arming `key` change this roll's pool? Asked by simulation rather than by re-stating
  // voidPreRollModifiers()'s own per-kind rules, so the two can never disagree.
  function voidKeyWouldMatter(key, context, baseRolled, baseKept, basis){
    const saved = getVoidPending();
    let changed = false;
    try {
      const trial = Object.assign({}, saved);
      trial[key] = true;
      setVoidPending(trial);
      const p = projectRoll(context, baseRolled, baseKept);
      changed = (p.adj.rolled !== basis.adj.rolled) ||
                (p.adj.kept !== basis.adj.kept) ||
                (p.adj.totalDelta !== basis.adj.totalDelta) ||
                (p.adj.explodeOverride !== basis.adj.explodeOverride);
    } finally {
      setVoidPending(saved);
    }
    return changed;
  }

  // ---- The modal ---------------------------------------------------------------------------
  // Resolves true to roll, false to cancel. Same self-contained Promise-modal pattern as
  // promptWeaponRange() and pickUniversalSpellElement(), which already sit in front of attacks
  // and universal spells -- a preview after one of those is a second step in the same flow, not
  // a competing overlay.
  function showRollPreview(req){
    return new Promise(resolve=>{
      const overlay = document.getElementById('rollPreviewOverlay');
      const body = document.getElementById('rollPreviewBody');
      const sub = document.getElementById('rollPreviewSubtitle');
      // No markup (fragment present but markup rolled back, or a stripped build): fail open and
      // roll, rather than making the sheet unable to roll at all.
      if(!overlay || !body){ resolve(true); return; }

      const context = req.context;
      const baseRolled = req.baseRolled;
      const baseKept = req.baseKept;
      const opts = req.opts || {};
      const pendingAtOpen = getVoidPending();
      const chosen = {};                       // void keys ticked inside this preview
      let done = false;

      const finish = (go)=>{
        if(done) return;
        done = true;
        document.removeEventListener('keydown', onKey);
        overlay.style.display = 'none';
        body.innerHTML = '';
        // Always hand the pending object back exactly as found. On confirm the canonical
        // spendVoid() re-arms whatever was chosen, with its own eligibility checks.
        setVoidPending(pendingAtOpen);
        if(go){
          const keys = Object.keys(chosen).filter(k=>chosen[k]);
          for(let i = 0; i < keys.length; i++){
            // spendVoid() returns false and explains itself if the point cannot be spent after
            // all (none left, or the Round's one spend already used). Abort rather than roll a
            // pool the player was shown but did not actually get.
            if(!spendVoid(keys[i])){ resolve(false); return; }
          }
        }
        resolve(!!go);
      };
      const onKey = (e)=>{ if(e.key === 'Escape') finish(false); };

      function render(){
        const basis = projectRoll(context, baseRolled, baseKept);
        const adj = basis.adj;
        const rows = buildRollModifierRows(adj, 0);
        const tn = (opts.tnConfig && typeof opts.tnConfig.tn === 'number') ? opts.tnConfig.tn : null;

        const poolChanged = (adj.rolled !== baseRolled) || (adj.kept !== baseKept);
        let html = '<div class="rp-pool">' +
          '<span class="rp-pool-final">' + adj.rolled + 'k' + adj.kept + '</span>' +
          (adj.totalDelta ? '<span class="rp-pool-flat">' +
              (adj.totalDelta >= 0 ? '+' : '') + adj.totalDelta + ' to total</span>' : '') +
          (poolChanged ? '<span class="rp-pool-base">base ' + baseRolled + 'k' + baseKept + '</span>' : '') +
          '</div>';

        if(tn !== null){
          html += '<div class="rp-tn">Target Number <b>' + tn + '</b></div>';
        }

        html += rows.length
          ? '<div class="rp-mods">' + rows.map(r=>
              '<div class="rp-mod"><span class="rp-mod-label">' + escHtml(r.label) + '</span>' +
              '<span class="rp-mod-txt">' + escHtml(r.txt) + '</span></div>').join('') + '</div>'
          : '<div class="rp-none">No modifiers apply to this roll.</div>';

        // Void offers. Only keys that would actually change this roll, and only those the Void
        // card itself would allow right now.
        const offers = ROLL_PREVIEW_VOID_KEYS.filter(k=>{
          if(chosen[k]) return true;                       // keep a ticked one listed
          const check = (typeof canSpendVoid === 'function') ? canSpendVoid(k) : { ok:true };
          if(!check.ok) return false;
          return voidKeyWouldMatter(k, context, baseRolled, baseKept, basis);
        });
        if(offers.length){
          html += '<div class="rp-void"><div class="rp-void-head">Spend a Void Point on this roll</div>' +
            offers.map(k=>{
              const opt = findVoidOption(k);
              return '<label class="rp-void-opt"><input type="checkbox" data-void-key="' + escAttr(k) + '"' +
                (chosen[k] ? ' checked' : '') + '><span>' + escHtml(opt ? opt.label : k) + '</span></label>';
            }).join('') +
            '<div class="rp-void-note">Nothing is spent until you roll.</div></div>';
        }

        html += '<div class="rp-actions">' +
          '<button type="button" class="rm-btn" id="rollPreviewCancel">Cancel</button>' +
          '<button type="button" class="rm-btn primary" id="rollPreviewGo">Roll ' +
            adj.rolled + 'k' + adj.kept + '</button>' +
          '</div>';

        body.innerHTML = html;

        Array.prototype.forEach.call(body.querySelectorAll('[data-void-key]'), cb=>{
          cb.addEventListener('change', ()=>{
            const key = cb.getAttribute('data-void-key');
            chosen[key] = cb.checked;
            // Reflect the choice in the pending flag so the next projection reads it through the
            // real contributor. Restored by finish() either way.
            const p = Object.assign({}, pendingAtOpen);
            Object.keys(chosen).forEach(k=>{ if(chosen[k]) p[k] = true; });
            setVoidPending(p);
            render();
          });
        });
        const goBtn = document.getElementById('rollPreviewGo');
        const cancelBtn = document.getElementById('rollPreviewCancel');
        if(goBtn) goBtn.addEventListener('click', ()=>finish(true));
        if(cancelBtn) cancelBtn.addEventListener('click', ()=>finish(false));
      }

      if(sub) sub.textContent = req.title || '';
      overlay.style.display = 'flex';
      document.addEventListener('keydown', onKey);
      overlay.onclick = (e)=>{ if(e.target === overlay) finish(false); };
      const closeBtn = document.getElementById('rollPreviewClose');
      if(closeBtn) closeBtn.onclick = ()=>finish(false);
      render();
    });
  }

  // The gate rollWithModifiers() calls. Kept separate from showRollPreview() so the kill-switch
  // and the "is this roll previewable at all" decision live in one place.
  function rollPreviewGate(req){
    if(!ROLL_PREVIEW_ENABLED) return Promise.resolve(true);
    if(req && req.opts && req.opts.skipPreview) return Promise.resolve(true);
    return showRollPreview(req);
  }
  // ============ END PART G PHASE 3 ============
