  // ========= PART I PHASE 4.5: KHARMIC TIE RING-FENCED MODULE =========
  //
  // Kharmic Tie is intentionally isolated from the other configured Advantages. Its player
  // decision is situational ("am I fighting for or protecting this person?"), it has a
  // per-session resource, and it is the most likely entry to be revised after live play. This
  // file owns that behaviour end-to-end. The only shared integration is the existing Phase 4.5
  // modifier contributor and two guarded preview hooks; removing this file leaves those hooks
  // silent and cannot change any other Advantage.

  const ADV_CONFIG_KHARMIC_TIE_ENABLED = true;
  let advConfigKharmicPreviewPending = null;

  function advConfigKharmicEntries(){
    if(!ADV_CONFIG_KHARMIC_TIE_ENABLED) return [];
    const out = [];
    document.querySelectorAll('#advList .entry').forEach(function(div){
      const name = div.querySelector('.en-name');
      if(!name || normalizeAdvName(name.value) !== normalizeAdvName('Kharmic Tie')) return;
      const config = readAdvConfig(div);
      const effect = resolveAdvDisadvEffect(name.value, config);
      if(effect && effect.effect === 'kharmicTie') out.push({ div:div, config:config, effect:effect });
    });
    return out;
  }

  function advConfigKharmicSetRemaining(div, remaining){
    const config = readAdvConfig(div);
    const name = div && div.querySelector('.en-name');
    const effect = name ? resolveAdvDisadvEffect(name.value, config) : null;
    if(!config || !effect || effect.effect !== 'kharmicTie') return false;
    config.remaining = Math.max(0, Math.min(effect.rank, parseInt(remaining,10) || 0));
    writeAdvConfig(div, config.type, config);
    return true;
  }

  function resetAdvConfigKharmicTie(div){
    const config = readAdvConfig(div);
    const name = div && div.querySelector('.en-name');
    const effect = name ? resolveAdvDisadvEffect(name.value, config) : null;
    if(!effect || effect.effect !== 'kharmicTie') return false;
    if(!advConfigKharmicSetRemaining(div, effect.rank)) return false;
    recalcAll();
    setStatus('Kharmic Tie reset to ' + effect.rank + '/' + effect.rank + ' uses for this session.');
    return true;
  }

  function decorateAdvConfigKharmicTieRow(div, row, effect){
    if(!effect || effect.effect !== 'kharmicTie') return;
    const controls = document.createElement('span');
    controls.className = 'adv-config-resource-controls adv-config-kharmic-controls';
    controls.innerHTML = '<span class="adv-config-pips" aria-label="' + effect.remaining + ' of ' + effect.rank +
      ' Kharmic Tie uses remaining">' + '●'.repeat(effect.remaining) + '○'.repeat(effect.rank - effect.remaining) +
      '</span><button type="button" class="ghost adv-config-reset-session" title="Restore this advantage to its per-session maximum">Reset session</button>';
    row.appendChild(controls);
    controls.querySelector('.adv-config-reset-session').addEventListener('click', function(){
      resetAdvConfigKharmicTie(div);
    });
  }

  function advConfigKharmicPreviewStart(context){
    // The preview starts a new isolated decision. No resource changes occur until the player
    // confirms Roll, and canceling wipes this entirely.
    advConfigKharmicPreviewPending = null;
  }

  function advConfigKharmicPreviewChoices(context){
    if(!ADV_CONFIG_KHARMIC_TIE_ENABLED ||
       (typeof ADV_CONFIG_ROLL_EFFECTS_ENABLED !== 'undefined' && !ADV_CONFIG_ROLL_EFFECTS_ENABLED) ||
       !context || context.kind !== ROLL_KINDS.ATTACK) return [];
    return advConfigKharmicEntries().filter(function(item){ return item.effect.remaining > 0; });
  }

  function advConfigKharmicPreviewHtml(context){
    const choices = advConfigKharmicPreviewChoices(context);
    if(!choices.length) return '';
    return '<div class="rp-kharmic"><div class="rp-kharmic-head">Kharmic Tie — declare this attack</div>' +
      choices.map(function(item, index){
        const id = item.config.sourceId || ('legacy-' + index);
        const selected = advConfigKharmicPreviewPending && advConfigKharmicPreviewPending.div === item.div;
        return '<label class="rp-kharmic-opt"><input type="checkbox" data-adv-config-kharmic-use="' +
          escAttr(id) + '"' + (selected ? ' checked' : '') + '><span>+1k1 while fighting for or protecting ' +
          escHtml(item.effect.target) + ' (' + item.effect.remaining + '/' + item.effect.rank + ' left)</span></label>';
      }).join('') +
      '<div class="rp-kharmic-note">Nothing is spent until you roll.</div></div>';
  }

  function advConfigKharmicPreviewToggle(sourceId, checked){
    const choices = advConfigKharmicPreviewChoices({ kind:ROLL_KINDS.ATTACK });
    const choice = choices.find(function(item){
      return String(item.config.sourceId || '') === String(sourceId || '');
    });
    advConfigKharmicPreviewPending = checked && choice ? {
      div:choice.div,
      sourceId:choice.config.sourceId || '',
      target:choice.effect.target,
      committed:false,
    } : null;
  }

  function advConfigKharmicPreviewCancel(){
    advConfigKharmicPreviewPending = null;
  }

  function advConfigKharmicPreviewCommit(){
    if(!advConfigKharmicPreviewPending) return true;
    const selected = advConfigKharmicEntries().find(function(item){
      return item.div === advConfigKharmicPreviewPending.div && item.effect.remaining > 0;
    });
    if(!selected){
      setStatus('Kharmic Tie could not be spent — no use remains.');
      advConfigKharmicPreviewPending = null;
      return false;
    }
    // The actual decrement happens when the one existing pre-roll contributor is asked for the
    // real roll (not while the preview merely projects it). This preserves cancel safety and
    // guarantees the +1k1 and resource spend travel together.
    advConfigKharmicPreviewPending.committed = true;
    return true;
  }

  function advConfigKharmicRollModifiers(context){
    if(!ADV_CONFIG_KHARMIC_TIE_ENABLED ||
       (typeof ADV_CONFIG_ROLL_EFFECTS_ENABLED !== 'undefined' && !ADV_CONFIG_ROLL_EFFECTS_ENABLED) ||
       !context || context.kind !== ROLL_KINDS.ATTACK) return [];
    const pending = advConfigKharmicPreviewPending;
    if(!pending) return [];
    const selected = advConfigKharmicEntries().find(function(item){
      return item.div === pending.div && item.effect.remaining > 0;
    });
    if(!selected) return [];
    const mod = {
      source:'adv-config',
      label:'Kharmic Tie',
      rolledDelta:1,
      keptDelta:1,
      note:'fighting for or protecting ' + selected.effect.target,
    };
    if(pending.committed){
      const didSpend = advConfigKharmicSetRemaining(selected.div, selected.effect.remaining - 1);
      advConfigKharmicPreviewPending = null;
      if(didSpend){
        // The result modal is about to open. Repaint the row/sidebar after the current roll
        // stack unwinds, so this preview's projected modifier is never recomputed mid-roll.
        setTimeout(function(){ recalcAll(); }, 0);
      }
    }
    return [mod];
  }

  // The extended module calls this hook after building the common configured-row controls.
  const advConfigDecorateExtendedBase = decorateExtendedAdvConfigRow;
  decorateExtendedAdvConfigRow = function(div, row, schema, config, effect){
    advConfigDecorateExtendedBase(div, row, schema, config, effect);
    decorateAdvConfigKharmicTieRow(div, row, effect);
  };
