  // ================= PART I PHASE 4.5.36 — Weakness and the Curse of Hotei =================
  // Owner's rulings, 16 October 2026 (Core Rulebook p.162 for both):
  //   Weakness       the chosen Trait counts one lower, never below 1, for every roll that uses it and everything
  //                  worked out from it: its Ring when it becomes the lower of the pair, Wounds from Earth, the TN to
  //                  be hit and initiative from Reflexes. Insight, Insight Rank, the purchased Trait, XP and Void Points
  //                  never change. One Trait per row; a second row on the same Trait is refused.
  //   Hotei's Curse  a Technique or Advantage that needs a Void Point to activate needs two. The Void card offers a
  //                  declared two-point spend, checked first, taken in one step and given back as one unit.
  //
  // THE CONTRACT WITH THE TRUNK. The Trait inputs are never written. This release only changes what these return:
  //   getTraitValueByName(name)  wrapped below: the core's value, lowered for a Weakness Trait.
  //   recalcAll()                block weakness-rings writes each Ring as the lower of its two effective Traits;
  //                              block weakness-insight hands Insight the Rings of the Traits as bought;
  //                              block weakness-tn-initiative moves the TN to be hit and the Initiative notation.
  //   the Trait label and the Initiative button roll the effective value (blocks in 080 and 110);
  //   collectData() saves the Rings as bought (block weakness-save).
  // Every Ring reader (Wounds, spell slots, casting, Ring rolls, prerequisites) therefore sees the lowered Ring.
  //
  // Kill switch: WEAKNESS_HOTEI_ENABLED = false makes every hook return the core's value, leaves Weakness a plain
  // entry and Hotei as Feature 4.5.11 shipped it.
  const WEAKNESS_HOTEI_ENABLED = true;

  const WEAK4536 = (function(){
    const api = {};
    api.NAME = 'Weakness';
    api.TYPE = 'traitPick';
    api.COST = 6;
    api.FLOOR = 1;
    api.SOURCE = 'Core Rulebook p.162';
    api.enabled = function(){ return WEAKNESS_HOTEI_ENABLED === true; };

    const TRAITS = RINGS.reduce(function(all, r){
      return all.concat(r.traits.map(function(t){ return {key:t.key, name:t.name, ring:r.key}; }));
    }, []);
    api.traits = function(){ return TRAITS.map(function(t){ return Object.assign({}, t); }); };
    // The core getter's reading of a name: the first of "X or Y", any case.
    api.traitOf = function(name){
      const token = String(name || '').split(/\s+or\s+/i)[0].trim().toLowerCase();
      return TRAITS.find(function(t){ return t.name.toLowerCase() === token || t.key === token; }) || null;
    };
    api.purchased = function(name){
      const t = api.traitOf(name);
      const el = t ? document.getElementById('trait_' + t.key) : null;
      return el ? (parseInt(el.value || '2', 10) || 0) : 0;
    };

    // Configured Weakness rows in Disadvantages, in list order: [{div, trait}] (trait null while unpicked).
    api.rows = function(){
      if(!api.enabled() || typeof D45 !== 'object' || !D45 || !D45.enabled()) return [];
      const out = [];
      document.querySelectorAll('#disadvList .entry').forEach(function(div){
        const nameEl = div.querySelector('.en-name');
        if(!nameEl || nameEl.value.trim().toLowerCase() !== api.NAME.toLowerCase()) return;
        const config = typeof readAdvConfig === 'function' ? readAdvConfig(div) : null;
        const t = config && config.type === api.TYPE ? api.traitOf(config.trait) : null;
        out.push({div:div, trait:t});
      });
      return out;
    };
    // Trait keys lowered: each Trait once, however many rows name it.
    api.lowered = function(){
      const keys = {};
      api.rows().forEach(function(row){ if(row.trait) keys[row.trait.key] = true; });
      return keys;
    };
    // One rank lower, never below the floor.
    api.lowerBy = function(value){ return value > api.FLOOR ? value - 1 : value; };
    // The whole rule: a value of the named Trait in, the value that counts out.
    api.effective = function(name, value){
      const t = api.traitOf(name);
      if(!t || !Number.isFinite(value) || !api.lowered()[t.key]) return value;
      return api.lowerBy(value);
    };
    api.trait = function(name){ return api.effective(name, api.purchased(name)); };
    api.purchasedRing = function(key){
      const ring = RINGS.find(function(r){ return r.key === key; });
      return ring ? Math.min.apply(null, ring.traits.map(function(t){ return api.purchased(t.name); })) : 0;
    };
    api.ring = function(key){
      const ring = RINGS.find(function(r){ return r.key === key; });
      if(!ring) return 0;
      const lowered = api.lowered();
      return Math.min.apply(null, ring.traits.map(function(t){
        const v = api.purchased(t.name);
        return lowered[t.key] ? api.lowerBy(v) : v;
      }));
    };
    api.writeRings = function(){
      if(!api.enabled()) return;
      RINGS.forEach(function(r){
        const el = document.getElementById('ring_' + r.key);
        if(el) el.value = api.ring(r.key);
      });
    };
    // Trait keys already lowered by a row other than `div` (the pick refuses them).
    api.takenElsewhere = function(div){
      const keys = {};
      api.rows().forEach(function(row){ if(row.div !== div && row.trait) keys[row.trait.key] = true; });
      return keys;
    };
    // Is this row the first to name its Trait?
    api.duplicate = function(div){
      const rows = api.rows(), own = rows.find(function(row){ return row.div === div; });
      if(!own || !own.trait) return false;
      return rows.find(function(row){ return row.trait && row.trait.key === own.trait.key; }).div !== div;
    };

    // Phase 4.5's Disadvantage configuration (Feature 4.5.2) installs this definition.
    api.definition = {
      type: api.TYPE,
      steps: function(){
        const target = typeof advConfigTargetEntry !== 'undefined' ? advConfigTargetEntry : null;
        const taken = api.takenElsewhere(target);
        return [{ field:'trait', label:'Choose the Trait that counts one rank lower',
          options: TRAITS.map(function(t){
            return { value:t.name, label:t.name + (taken[t.key] ? ' — already lowered by another Weakness' : ''),
              disabled:!!taken[t.key] };
          }) }];
      },
      validate: function(config){
        return !!config && config.type === api.TYPE && !!api.traitOf(config.trait);
      },
      finalize: function(config){
        const t = api.traitOf(config.trait);
        config.trait = t ? t.name : '';
        config.value = config.trait;
      },
      resolve: function(config){
        const t = api.traitOf(config.trait);
        return { cost:api.COST, trait:t.name, traitKey:t.key,
          summary:t.name + ' counts one rank lower (never below 1) for its rolls, its Ring and what follows from them. ' +
            'Insight and XP use it as bought.' };
      },
      decorate: function(div, row){ if(typeof weakUi4536Row === 'function') weakUi4536Row(div, row); },
    };
    return api;
  })();

  const HOTEI4536 = (function(){
    const api = {};
    api.FORTUNE = 'Hotei';
    api.EFFECT = 'voidDouble';     // replaces Feature 4.5.11's 'deferred' for this one Fortune
    api.COST = 2;
    api.LABEL = 'For a Technique or Advantage';
    api.NOTE = 'The Fortune of Contentment burdens you: a Technique or Advantage that needs a Void Point to ' +
      'activate needs two. Void spent on a roll, Kiho, Kata and spells is unchanged.';
    api.enabled = function(){ return WEAKNESS_HOTEI_ENABLED === true; };
    api.host = function(){
      return (typeof F4511 === 'object' && F4511 && typeof F4511.activeOf === 'function') ? F4511 : null;
    };
    api.applies = function(){
      const host = api.host();
      return api.enabled() && !!host && host.activeOf(api.FORTUNE).length > 0;
    };
    // Checked before anything is spent: {ok, reason}.
    api.check = function(){
      if(!api.applies()) return {ok:false, reason:'Only while Hotei’s Curse is on your Disadvantages.'};
      if(typeof VI4533 === 'object' && VI4533 && typeof VI4533.momoku === 'function' && VI4533.momoku()){
        return {ok:false, reason:VI4533.MOMOKU_REASON};
      }
      const points = getVoidPoints();
      if(points < api.COST){
        return {ok:false, reason:'Hotei’s Curse: this needs ' + api.COST + ' Void Points; you have ' + points + '.'};
      }
      if(isCombatActive() && hasSpentThisRound('void')){
        return {ok:false, reason:'You have already spent a Void Point this Round. RAW allows only one per Round.'};
      }
      return {ok:true, reason:''};
    };
    // The points left right after the latest two-point spend; null once anything else changes them.
    api.lastSpend = null;
    api.outstanding = function(){
      if(api.lastSpend && getVoidPoints() !== api.lastSpend.after) api.lastSpend = null;
      return !!api.lastSpend;
    };
    // Both points in one step, each through consumeVoidPoint so every spend listener sees it.
    api.spend = function(){
      const check = api.check();
      if(!check.ok) return check;
      const before = getVoidPoints();
      if(!consumeVoidPoint()) return {ok:false, reason:'No Void Points remaining.'};
      if(!consumeVoidPoint()){
        api.restore(before);
        return {ok:false, reason:'No Void Points remaining.'};
      }
      if(isCombatActive()) recordRoundSpend('void', 'hotei');
      api.lastSpend = {before:before, after:getVoidPoints()};
      return {ok:true, reason:'', spent:api.COST};
    };
    // Gives both points back together, while the spend is still the latest change.
    api.takeBack = function(){
      if(!api.outstanding()) return false;
      api.restore(api.lastSpend.before);
      api.lastSpend = null;
      return true;
    };
    api.restore = function(points){
      const el = document.getElementById('void_current');
      if(el) el.value = points;
      renderVoidPips();
    };
    // Takes Hotei over from Feature 4.5.11: its spec in place, its row decorator wrapped (the Bishamon pattern).
    api.installed = false;
    api.install = function(){
      if(api.installed || !api.enabled()) return false;
      const host = api.host();
      if(!host || !host.FORTUNES || !host.FORTUNES[api.FORTUNE]) return false;
      const spec = host.FORTUNES[api.FORTUNE];
      api.previousEffect = spec.effect;
      api.previousNote = spec.note;
      spec.effect = api.EFFECT;
      spec.note = api.NOTE;
      const prev = host.decorateRow;
      host.decorateRow = function(div, row, config, effect){
        if(typeof prev === 'function') prev.call(host, div, row, config, effect);
        if(effect && effect.fortune === api.FORTUNE && effect.fortuneEffect === api.EFFECT &&
           typeof hoteiUi4536Row === 'function') hoteiUi4536Row(row);
      };
      api.installed = true;
      return true;
    };
    return api;
  })();

  // ---------- Trunk-side entry points (hoisted; each returns the core's value when switched off) ----------
  function weakness4536WriteRings(){
    if(!WEAK4536.enabled()) return;
    WEAK4536.writeRings();
    weakUi4536Paint();
  }
  // Overwrites a recalcAll ringVals array (RINGS order) with the Rings of the Traits as bought.
  function weakness4536PurchasedRings(ringVals){
    if(!WEAK4536.enabled() || !Array.isArray(ringVals)) return;
    RINGS.forEach(function(r, i){ ringVals[i] = WEAK4536.purchasedRing(r.key); });
  }
  // Overwrites a save's rings object with the Rings of the Traits as bought (Void untouched).
  function weakness4536SaveRings(rings){
    if(!WEAK4536.enabled() || !rings) return;
    RINGS.forEach(function(r){ rings[r.key] = String(WEAK4536.purchasedRing(r.key)); });
  }
  function weakness4536Trait(name, value){
    return WEAK4536.enabled() ? WEAK4536.effective(name, value) : value;
  }
  function weakness4536Reflexes(value){ return weakness4536Trait('Reflexes', value); }

  // ---------- UI (replaceable) ----------
  // UI hook: Rings & Traits card. The Trait box keeps the bought value; a line under it and under a lowered Ring
  // says what counts.
  function weakUi4536Paint(){
    const lowered = WEAK4536.enabled() ? WEAK4536.lowered() : {};
    RINGS.forEach(function(r){
      r.traits.forEach(function(t){
        const input = document.getElementById('trait_' + t.key);
        const bought = WEAK4536.purchased(t.name), eff = WEAK4536.trait(t.name);
        weakUi4536Line(input && input.parentNode, 'weak4536-trait-note', 'weak4536-trait-' + t.key,
          lowered[t.key] ? (eff < bought ? 'Counts as ' + eff + ' (Weakness)' : 'Weakness: already 1, the lowest') : '');
      });
      const ringInput = document.getElementById('ring_' + r.key);
      const asBought = WEAK4536.purchasedRing(r.key), now = WEAK4536.ring(r.key);
      weakUi4536Line(ringInput && ringInput.parentNode, 'weak4536-ring-note', 'weak4536-ring-' + r.key,
        now < asBought ? 'Lowered from ' + asBought + ' (Weakness)' : '');
    });
  }
  function weakUi4536Line(parent, cls, id, text){
    let line = document.getElementById(id);
    if(!text || !parent){ if(line) line.remove(); return; }
    if(!line){ line = document.createElement('span'); line.id = id; line.className = cls; parent.appendChild(line); }
    if(line.textContent !== text) line.textContent = text;
  }
  // UI hook: Feature 4.5.2's Disadvantage row (called from the definition's decorate).
  function weakUi4536Row(div, row){
    const rows = WEAK4536.rows(), own = rows.find(function(x){ return x.div === div; });
    if(!own || !own.trait) return;
    const note = document.createElement('span');
    note.className = 'weak4536-row-note';
    if(WEAK4536.duplicate(div)){
      note.textContent = own.trait.name + ' is already lowered by an earlier Weakness row; this row adds nothing.';
    } else {
      const bought = WEAK4536.purchased(own.trait.name), eff = WEAK4536.trait(own.trait.name);
      note.textContent = eff < bought ? own.trait.name + ' ' + bought + ' counts as ' + eff + '.'
        : own.trait.name + ' is ' + bought + ', the lowest it can count, so nothing changes now.';
    }
    row.appendChild(note);
  }
  // UI hook: Feature 4.5.11's Hotei row.
  function hoteiUi4536Row(row){
    const note = document.createElement('span');
    note.className = 'hotei4536-note';
    note.textContent = 'Void card: “' + HOTEI4536.LABEL + '” takes 2 points at once; tap a blank pip to give both back.';
    row.appendChild(note);
  }
  // UI hook: the Void card (Feature 4 of Part C). One button after the ordinary spends while the Curse is on the sheet.
  function hoteiUi4536Button(){
    const wrap = document.getElementById('voidSpendButtons');
    if(!wrap || !HOTEI4536.applies()) return;
    const check = HOTEI4536.check();
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'void-spend-btn hotei4536-spend';
    btn.textContent = 'Spend Void: ' + HOTEI4536.LABEL + ' (Hotei’s Curse: 2 points)';
    if(!check.ok){ btn.disabled = true; btn.title = check.reason; }
    btn.addEventListener('click', function(){
      const result = HOTEI4536.spend();
      if(!result.ok){ appAlert(result.reason); return; }
      setStatus('Void spent: 2 points ' + HOTEI4536.LABEL.toLowerCase() + ' (Hotei’s Curse). Tap a blank Void pip to give both back.');
      renderVoidPanel();
    });
    wrap.appendChild(btn);
  }
  // UI hook: the Void pips. While the two-point spend is the latest change, a blank pip gives both points back.
  function hoteiUi4536Pip(e){
    const pip = e.target && e.target.closest ? e.target.closest('.void-pip') : null;
    if(!pip || pip.classList.contains('filled') || !HOTEI4536.outstanding()) return;
    e.stopPropagation();
    e.preventDefault();
    HOTEI4536.takeBack();
    setStatus('Hotei’s Curse: both Void Points given back.');
    renderVoidPanel();
  }

  // ---------- Installation ----------
  if(WEAKNESS_HOTEI_ENABLED){
    if(typeof D45 === 'object' && D45 && typeof D45.install === 'function') D45.install(WEAK4536.NAME, WEAK4536.definition);
    if(typeof getTraitValueByName === 'function'){
      const weak4536CoreTrait = getTraitValueByName;
      WEAK4536.coreTrait = weak4536CoreTrait;
      getTraitValueByName = function(name){
        const value = weak4536CoreTrait.apply(this, arguments);
        try { return WEAK4536.effective(name, value); } catch(e){ return value; }
      };
    }
    HOTEI4536.install();
    if(typeof renderVoidPanel === 'function'){
      const hotei4536PreviousPanel = renderVoidPanel;
      renderVoidPanel = function(){
        const result = hotei4536PreviousPanel.apply(this, arguments);
        hoteiUi4536Button();
        return result;
      };
    }
    const hotei4536Pips = document.getElementById('voidPips');
    if(hotei4536Pips){
      hotei4536Pips.addEventListener('click', hoteiUi4536Pip, true);
      hotei4536Pips.addEventListener('contextmenu', hoteiUi4536Pip, true);
    }
  }
  // ================= END PART I PHASE 4.5.36 ===================================================
