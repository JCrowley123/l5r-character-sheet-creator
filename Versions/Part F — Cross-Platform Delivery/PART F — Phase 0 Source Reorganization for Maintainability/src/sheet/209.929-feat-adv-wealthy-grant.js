  // ========= PART I FEATURE 4.5.17: WEALTHY KOKU GRANT =========
  // A16's owner-approved grant of 2 koku per Rank, on top of Feature 4.56's Wealthy handler.
  //
  // Money only ever moves on an explicit player action -- confirming the Rank, or a row button --
  // never on recalculation, load, import or render. What this purchase has already put on the
  // sheet is recorded in the row's own config as a receipt ({wealth4517:{revision:1, granted}}),
  // so every later action adds or offers back only the DIFFERENCE. A save without a receipt (older
  // than this release, or edited while it was absent) is never assumed either way: the row asks
  // whether that koku was already added. Nothing is ever taken back without the player choosing to.
  //
  // Also applies Core p.149's 1-XP minimum after discounts to Wealthy's price (Rank 1 for a Crane,
  // Unicorn or Imperial character was 0 XP), by retuning 4.56's own mutable entry from here.
  const ADV_WEALTHY_GRANT_ENABLED = true;

  const W4517 = (function(){
    const api = {};
    api.NAME = 'Wealthy';
    api.KOKU_PER_RANK = 2;
    api.modal = null;
    api.enabled = function(){
      return ADV_WEALTHY_GRANT_ENABLED && ADV_CONFIG_ENABLED && typeof R456 === 'object' && !!R456 &&
        R456.enabled() && !!R456.ENTRIES && !!R456.ENTRIES.Wealthy;
    };
    api.is = function(name){ return normalizeAdvName(name) === normalizeAdvName(api.NAME); };
    api.rowOf = function(div){
      const name = div && div.querySelector('.en-name');
      return !!name && api.is(name.value) && !!div.parentElement && div.parentElement.id === 'advList';
    };
    api.rankOf = function(config){ return config && config.type === R456.TYPE ? R456.rankOf(config.rank) : null; };
    api.target = function(rank){ return api.KOKU_PER_RANK * rank; };

    // {state:'none'} | {state:'ok', granted} | {state:'invalid', raw}. An unreadable receipt is
    // kept exactly and never used to move money.
    api.receipt = function(config){
      if(!config || config.wealth4517 === undefined) return {state:'none'};
      const r = config.wealth4517;
      const ok = r && typeof r === 'object' && !Array.isArray(r) && r.revision === 1 &&
        Object.keys(r).every(function(k){ return k === 'revision' || k === 'granted'; }) &&
        Number.isSafeInteger(r.granted) && r.granted >= 0;
      return ok ? {state:'ok', granted:r.granted} : {state:'invalid', raw:r};
    };

    api.koku = function(){
      const field = document.getElementById('f_koku');
      const n = field && String(field.value).trim() !== '' ? Number(field.value) : 0;
      return Number.isFinite(n) ? n : 0;
    };
    api.setKoku = function(amount){
      const field = document.getElementById('f_koku');
      if(!field) return false;
      field.value = String(amount);
      field.dispatchEvent(new Event('input', {bubbles:true}));
      return true;
    };
    api.writeReceipt = function(div, granted){
      const config = readAdvConfig(div);
      writeAdvConfig(div, R456.TYPE, Object.assign({}, config, {wealth4517:{revision:1, granted:granted}}));
    };

    // What the row should say, from the CURRENT config and rank only.
    api.status = function(div){
      if(!api.enabled() || !api.rowOf(div)) return null;
      const config = readAdvConfig(div), rank = api.rankOf(config);
      if(rank === null) return null;
      const target = api.target(rank), receipt = api.receipt(config);
      if(receipt.state === 'invalid') return {kind:'invalid', target:target};
      if(receipt.state === 'none') return {kind:'unrecorded', target:target, amount:target};
      if(receipt.granted === target) return {kind:'recorded', target:target};
      if(receipt.granted < target) return {kind:'owed', target:target, amount:target - receipt.granted};
      return {kind:'excess', target:target, amount:receipt.granted - target};
    };

    api.act = function(div, action){
      const s = api.status(div);
      if(!s) return;
      let message = '';
      if(action === 'add' && (s.kind === 'unrecorded' || s.kind === 'owed')){
        api.setKoku(api.koku() + s.amount);
        message = s.amount + ' koku added to your Koku for Wealthy.';
      } else if(action === 'already' && (s.kind === 'unrecorded' || s.kind === 'owed')){
        message = 'Wealthy koku recorded as already on your sheet; Koku unchanged.';
      } else if(action === 'return' && s.kind === 'excess'){
        if(api.koku() < s.amount){ setStatus('You have less than ' + s.amount + ' koku; adjust Koku yourself, then choose Keep.'); return; }
        api.setKoku(api.koku() - s.amount);
        message = s.amount + ' koku returned from your Koku.';
      } else if(action === 'keep' && s.kind === 'excess'){
        message = 'Kept the ' + s.amount + ' koku; Koku unchanged.';
      } else return;
      api.writeReceipt(div, s.target);
      recalcAll();
      const focus = div.querySelector('.adv-config-btn');
      if(focus) focus.focus({preventScroll:true});
      setStatus(message);
    };

    // A disabled button's reason is stated in the row text beside it.
    api.button = function(div, text, action, label, disabled){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ghost wealth4517-btn';
      button.textContent = text;
      button.setAttribute('aria-label', label);
      if(disabled) button.disabled = true;
      button.addEventListener('click', function(){ api.act(div, action); });
      return button;
    };
    api.decorateRow = function(div){
      const s = api.status(div);
      const row = div && div.querySelector('.adv-config-row');
      if(!s || !row) return;
      const box = document.createElement('div');
      box.className = 'wealth4517-status wealth4517-' + s.kind;
      const text = document.createElement('span');
      text.className = 'wealth4517-text' + (s.kind === 'recorded' ? '' : ' adv-config-warn');
      box.appendChild(text);
      if(s.kind === 'recorded'){
        text.textContent = s.target + ' koku from Wealthy recorded on your Koku.';
      } else if(s.kind === 'invalid'){
        text.textContent = 'Saved Wealthy koku record not understood — kept unchanged. Adjust Koku yourself if needed.';
      } else if(s.kind === 'unrecorded' || s.kind === 'owed'){
        text.textContent = s.kind === 'unrecorded'
          ? 'Wealthy’s ' + s.amount + ' starting koku is not recorded yet. Was it added to your Koku?'
          : s.amount + ' more koku from Wealthy for your new Rank.';
        box.appendChild(api.button(div, 'Add ' + s.amount + ' koku', 'add', 'Add ' + s.amount + ' koku to Koku now'));
        box.appendChild(api.button(div, 'Already added', 'already', 'Record that the ' + s.amount + ' koku is already on your Koku'));
      } else {
        const short = api.koku() < s.amount;
        text.textContent = s.amount + ' koku were granted for Wealthy Ranks you removed. Return them, or keep them if already spent.' +
          (short ? ' (You have less than ' + s.amount + ' koku now, so Return is unavailable.)' : '');
        box.appendChild(api.button(div, 'Return ' + s.amount + ' koku', 'return', 'Return ' + s.amount + ' koku from Koku', short));
        box.appendChild(api.button(div, 'Keep', 'keep', 'Keep the ' + s.amount + ' koku'));
      }
      row.appendChild(box);
    };

    // The Rank modal (Feature 4.56's) gains one choice when the row has no receipt yet. A row
    // never configured before defaults to adding the koku; a configured row without a receipt
    // (an older save) has no default, because the sheet cannot know what the player already did.
    api.decorateModal = function(div){
      api.modal = null;
      if(!api.rowOf(div)) return;
      const config = readAdvConfig(div), receipt = api.receipt(config);
      const grid = document.getElementById('advConfigGrid');
      if(!grid) return;
      const box = document.createElement('div');
      box.className = 'wealth4517-choice';
      if(receipt.state === 'ok'){
        box.textContent = receipt.granted + ' koku already recorded. Raising the Rank adds 2 koku per extra Rank; lowering it asks what to do with the difference.';
      } else if(receipt.state === 'invalid'){
        box.textContent = 'The saved koku record is not understood. This edit keeps it and does not change Koku.';
      } else {
        const fresh = api.rankOf(config) === null;
        box.innerHTML = '<fieldset class="wealth4517-fieldset"><legend class="wealth4517-legend">Starting koku — 2 per Rank</legend>' +
          '<label class="wealth4517-opt"><input type="radio" name="wealth4517Grant" value="add"' + (fresh ? ' checked' : '') + '> <span>Add it to my Koku now</span></label>' +
          '<label class="wealth4517-opt"><input type="radio" name="wealth4517Grant" value="already"> <span>I have already added it myself</span></label>' +
          '</fieldset><p class="wealth4517-error" role="alert" hidden></p>';
      }
      grid.appendChild(box);
      api.modal = {div:div, receipt:receipt, needsChoice:receipt.state === 'none'};
    };
    api.afterCommit = function(m, choice){
      const div = m.div;
      if(!div.isConnected) return;
      const config = readAdvConfig(div), rank = api.rankOf(config);
      if(rank === null) return;
      const target = api.target(rank);
      let message = '';
      if(m.receipt.state === 'invalid'){
        writeAdvConfig(div, R456.TYPE, Object.assign({}, config, {wealth4517:m.receipt.raw}));
      } else if(m.receipt.state === 'none'){
        if(choice === 'add'){ api.setKoku(api.koku() + target); message = target + ' koku added to your Koku.'; }
        else message = 'Koku unchanged; recorded as already added.';
        api.writeReceipt(div, target);
      } else {
        let granted = m.receipt.granted;
        if(target > granted){ api.setKoku(api.koku() + target - granted); message = (target - granted) + ' koku added to your Koku.'; granted = target; }
        api.writeReceipt(div, granted);
      }
      recalcAll();
      if(message) setStatus('Wealthy: ' + message);
    };
    return api;
  })();

  if(W4517.enabled()){
    // Core p.149: discounts cannot take an Advantage below 1 XP. Retuned on 4.56's own mutable
    // entry, so removing this release restores that release's pricing exactly.
    const wealth4517Entry = R456.ENTRIES.Wealthy;
    const wealth4517PreviousPrice = wealth4517Entry.price;
    wealth4517Entry.price = function(rank){
      const price = wealth4517PreviousPrice(rank);
      return price.cost < 1 ? Object.assign({}, price, {cost:1, floored:true}) : price;
    };
    wealth4517Entry.summary = function(rank, price){
      return 'Rank ' + rank + ' — ' + price.cost + ' XP' +
        (price.discounted ? (price.floored ? ' (clan discount −1; minimum 1 XP)' : ' (clan discount −1)') : '') +
        '; entitles ' + (2 * rank) + ' koku at creation';
    };
    wealth4517Entry.note = 'Each Rank adds 2 koku to your Koku, once: confirming a new purchase adds it, and raising ' +
      'the Rank later adds only the difference. Recalculating, reloading or importing never adds it again. ' +
      'Crane, Unicorn and Imperial characters pay 1 XP less off the total, once, but never less than 1 XP.';

    const wealth4517PreviousRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){ wealth4517PreviousRefresh(div); W4517.decorateRow(div); };
    const wealth4517PreviousOpen = openExtendedAdvConfigModal;
    openExtendedAdvConfigModal = function(div, schema){
      const handled = wealth4517PreviousOpen(div, schema);
      if(handled && schema && W4517.is(schema.name) && advConfigExtendedModal && advConfigExtendedModal.kind === R456.TYPE){
        W4517.decorateModal(div);
      }
      return handled;
    };
    const wealth4517PreviousConfirm = confirmExtendedAdvConfigModal;
    confirmExtendedAdvConfigModal = function(){
      const m = W4517.modal, state = advConfigExtendedModal;
      if(!m || !state || state.kind !== R456.TYPE || advConfigTargetEntry !== m.div) return wealth4517PreviousConfirm();
      let choice = null;
      if(m.needsChoice){
        const picked = document.querySelector('#advConfigGrid input[name="wealth4517Grant"]:checked');
        choice = picked ? picked.value : null;
        if(!choice){
          const error = document.querySelector('#advConfigGrid .wealth4517-error');
          if(error){ error.textContent = 'Choose whether to add the starting koku now or record it as already added.'; error.hidden = false; }
          setStatus('Choose how to record Wealthy’s starting koku.');
          return true;
        }
      }
      const handled = wealth4517PreviousConfirm();
      // Committed only if 4.56's confirm accepted the Rank and closed the modal.
      if(advConfigExtendedModal === null) W4517.afterCommit(m, choice);
      return handled;
    };
    const wealth4517PreviousClose = closeExtendedAdvConfigModal;
    closeExtendedAdvConfigModal = function(){ W4517.modal = null; return wealth4517PreviousClose(); };
  }
