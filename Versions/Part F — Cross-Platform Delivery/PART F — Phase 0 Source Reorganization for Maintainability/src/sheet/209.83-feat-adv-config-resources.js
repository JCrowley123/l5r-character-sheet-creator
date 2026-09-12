  // ========= PART I PHASE 4.5: SESSION RESOURCES (LUCK) =========
  //
  // Luck is a whole-roll reroll resource, not an Emphasis-style "reroll 1s" decorator. This
  // isolated module owns its persistent pip pool and the post-roll action. It deliberately
  // hooks the result modal rather than a particular roll button, which is what makes it available
  // after every ordinary sheet roll without adding another pre-roll registry contributor.

  const ADV_CONFIG_SESSION_RESOURCES_ENABLED = true;

  function advConfigLuckEntries(){
    if(!ADV_CONFIG_SESSION_RESOURCES_ENABLED) return [];
    const out = [];
    document.querySelectorAll('#advList .entry').forEach(function(div){
      const name = div.querySelector('.en-name');
      if(!name || normalizeAdvName(name.value) !== normalizeAdvName('Luck')) return;
      const config = readAdvConfig(div);
      const effect = resolveAdvDisadvEffect(name.value, config);
      if(effect && effect.effect === 'luck') out.push({ div:div, config:config, effect:effect });
    });
    return out;
  }

  function advConfigLuckSetRemaining(div, remaining){
    const config = readAdvConfig(div);
    const name = div && div.querySelector('.en-name');
    const effect = name ? resolveAdvDisadvEffect(name.value, config) : null;
    if(!config || !effect || effect.effect !== 'luck') return false;
    config.remaining = Math.max(0, Math.min(effect.rank, parseInt(remaining,10) || 0));
    writeAdvConfig(div, config.type, config);
    return true;
  }

  function resetAdvConfigLuck(div){
    const config = readAdvConfig(div);
    const name = div && div.querySelector('.en-name');
    const effect = name ? resolveAdvDisadvEffect(name.value, config) : null;
    if(!effect || effect.effect !== 'luck') return false;
    if(!advConfigLuckSetRemaining(div, effect.rank)) return false;
    recalcAll();
    setStatus('Luck reset to ' + effect.rank + '/' + effect.rank + ' uses for this session.');
    return true;
  }

  function decorateAdvConfigLuckRow(div, row, effect){
    if(!effect || effect.effect !== 'luck') return;
    const controls = document.createElement('span');
    controls.className = 'adv-config-resource-controls adv-config-luck-controls';
    controls.innerHTML = '<span class="adv-config-pips" aria-label="' + effect.remaining + ' of ' + effect.rank +
      ' Luck uses remaining">' + '●'.repeat(effect.remaining) + '○'.repeat(effect.rank - effect.remaining) +
      '</span><button type="button" class="ghost adv-config-reset-session" title="Restore Luck to its per-session maximum">Reset session</button>';
    row.appendChild(controls);
    controls.querySelector('.adv-config-reset-session').addEventListener('click', function(){
      resetAdvConfigLuck(div);
    });
  }

  function advConfigAllSessionResources(){
    const resources = [];
    advConfigLuckEntries().forEach(function(item){
      resources.push({ kind:'Luck', target:'', div:item.div, effect:item.effect });
    });
    if(typeof advConfigKharmicEntries === 'function'){
      advConfigKharmicEntries().forEach(function(item){
        resources.push({ kind:'Kharmic Tie', target:item.effect.target, div:item.div, effect:item.effect });
      });
    }
    return resources;
  }

  // This is a Phase-4.5-owned appendage inside the existing read-only quick-access panel. It is
  // inserted dynamically only while the character actually has a session resource, so the
  // Phase 2 panel and its five baseline fields remain untouched when this phase is absent.
  function renderAdvConfigSessionResources(){
    const panel = document.getElementById('quickAccessPanel');
    if(!panel) return;
    const old = document.getElementById('advConfigSessionResources');
    if(old) old.remove();
    const resources = advConfigAllSessionResources();
    if(!resources.length) return;
    const block = document.createElement('div');
    block.id = 'advConfigSessionResources';
    block.className = 'qa-field adv-config-session-resources';
    block.innerHTML = '<label>Session Resources</label>' + resources.map(function(resource){
      const target = resource.target ? ' — ' + escHtml(resource.target) : '';
      const e = resource.effect;
      return '<div class="adv-config-session-resource"><span>' + escHtml(resource.kind) + target +
        '</span><span class="adv-config-pips" aria-label="' + e.remaining + ' of ' + e.rank +
        ' remaining">' + '●'.repeat(e.remaining) + '○'.repeat(e.rank - e.remaining) +
        ' <small>' + e.remaining + '/' + e.rank + '</small></span></div>';
    }).join('');
    panel.appendChild(block);
  }

  function advConfigLuckRerollResult(result){
    if(!result || result.rawNumDice === undefined || result.rawKeepDice === undefined) return null;
    // rollWeaponDicePool carries explodeOn when a lower mastery threshold applied. All other
    // rolls faithfully reuse their original exploding/non-exploding setting.
    const rerolled = result.explodeOn !== undefined
      ? rollWeaponDicePool(result.rawNumDice, result.rawKeepDice, result.explodeOn)
      : rollDicePool(result.rawNumDice, result.rawKeepDice, result.explode);
    const baseBonus = applyTenDiceRule(result.rawNumDice, result.rawKeepDice).bonus;
    const extraFlatBonus = (result.bonus || 0) - baseBonus;
    if(extraFlatBonus){
      rerolled.bonus += extraFlatBonus;
      rerolled.total += extraFlatBonus;
    }
    return rerolled;
  }

  function advConfigLuckOutcome(message){
    const body = document.getElementById('rollModalBody');
    if(!body) return;
    const old = body.querySelector('.adv-config-luck-outcome');
    if(old) old.remove();
    const note = document.createElement('div');
    note.className = 'adv-config-luck-outcome';
    note.textContent = message;
    body.insertBefore(note, body.firstChild);
  }

  function spendAdvConfigLuck(item, title, result){
    if(!item || item.effect.remaining <= 0) return;
    const originalTotalEl = document.getElementById('rollTotalDisplay');
    const originalTotal = parseInt(originalTotalEl && originalTotalEl.textContent || String(result.total || 0),10) || 0;
    const rerolled = advConfigLuckRerollResult(result);
    if(!rerolled){
      setStatus('Luck could not reroll this result because its pool was unavailable.');
      return;
    }
    if(!advConfigLuckSetRemaining(item.div, item.effect.remaining - 1)) return;
    const rerolledTotal = rerolled.total;
    const rerollWins = rerolledTotal > originalTotal;
    setTimeout(function(){ recalcAll(); }, 0);
    if(rerollWins){
      // Preserve the result modal's normal TN/on-close behaviour while presenting the winning
      // whole reroll. The original total is retained as a transparent audit line.
      const savedTN = currentRollTN;
      const savedSuccess = currentRollSuccessText;
      const savedFail = currentRollFailText;
      const savedOnClose = currentRollOnClose;
      showRollResult(title + ' — Luck reroll', rerolled, savedTN === null ? undefined : {
        tn:savedTN, successText:savedSuccess, failText:savedFail, onClose:savedOnClose,
      });
      advConfigLuckOutcome('Luck spent — original ' + originalTotal + ', reroll ' + rerolledTotal +
        '. Kept the higher reroll.');
    } else {
      const body = document.getElementById('rollModalBody');
      if(body){
        Array.from(body.querySelectorAll('.adv-config-spend-luck')).forEach(function(button){
          button.disabled = true;
        });
      }
      advConfigLuckOutcome('Luck spent — original ' + originalTotal + ', reroll ' + rerolledTotal +
        '. Kept the higher original result.');
    }
  }

  // Called by the guarded Phase 4.5 hook at the end of showRollResult(). A player with Luck at
  // zero still sees a disabled control, making the exhausted pool explicit rather than silently
  // removing a feature they know they have.
  function onAdvConfigRollResult(title, result){
    if(!ADV_CONFIG_SESSION_RESOURCES_ENABLED) return;
    const body = document.getElementById('rollModalBody');
    if(!body) return;
    const entries = advConfigLuckEntries();
    if(!entries.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'adv-config-luck-actions';
    wrap.innerHTML = '<div class="adv-config-luck-head">Luck — reroll the entire roll, keep the higher result</div>';
    entries.forEach(function(item){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ghost adv-config-spend-luck';
      button.disabled = item.effect.remaining <= 0;
      button.textContent = 'Spend Luck (' + item.effect.remaining + '/' + item.effect.rank + ')';
      button.title = item.effect.remaining > 0
        ? 'Reroll this entire roll and keep the higher result'
        : 'No Luck uses remain this session';
      button.addEventListener('click', function(){
        spendAdvConfigLuck(item, title, result);
      });
      wrap.appendChild(button);
    });
    body.appendChild(wrap);
  }

  // Chain on top of the Kharmic Tie decorator without either module knowing the other module's
  // internals. This is the same narrow, removable extension style used by the preview hooks.
  const advConfigDecorateResourceBase = decorateExtendedAdvConfigRow;
  decorateExtendedAdvConfigRow = function(div, row, schema, config, effect){
    advConfigDecorateResourceBase(div, row, schema, config, effect);
    decorateAdvConfigLuckRow(div, row, effect);
  };
