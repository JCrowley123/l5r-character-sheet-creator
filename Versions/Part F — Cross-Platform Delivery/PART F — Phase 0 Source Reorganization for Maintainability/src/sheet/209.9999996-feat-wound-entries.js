  // ========= PART I FEATURE 4.5.29: WOUND ENTRIES =========
  // Four Advantages and Disadvantages that change how Wounds work, which until now only recorded
  // their cost and text. Rules read from the Core Rulebook on 7 October 2026, in our own words:
  //
  //   Strength of the Earth  Advantage     Core p.154  the penalty each Wound Rank gives is 3 lower
  //   Low Pain Threshold     Disadvantage  Core p.160  the penalty each Wound Rank gives is 5 higher
  //   Bad Health             Disadvantage  Core p.156  Earth counts one lower when the Wound Ranks
  //                                                    are worked out (and for resisting disease)
  //   Permanent Wound        Disadvantage  Core p.161  the first Wound Rank (Healthy) always counts
  //                                                    as full
  //
  // The owner's rulings, 7 October 2026 (all as recommended):
  //   1. Low Pain Threshold adds 5 to every rank that HAS a penalty (Nicked to Out). Healthy has
  //      none, so it stays at none.
  //   2. Strength of the Earth takes 3 off every penalised rank, never below none: Nicked's 3
  //      becomes none.
  //   3. A character with both gets both (+5, then -3).
  //   4. Bad Health never takes Earth below 1 for the Wound Ranks: read literally, Earth 1 would
  //      count as 0 and every rank would hold no Wounds at all. Its disease clause is a reminder on
  //      the row only -- the sheet has no disease rolls.
  //   5. Permanent Wound: Healthy is always full, so the first Wound taken makes the character
  //      Nicked, and the track (and the most Wounds the character can take) shrinks by however
  //      many Wounds Healthy would have held.
  //   6. The wound track, its info pop-up and the Quick Access panel show the adjusted penalty and
  //      say which entry adjusted it; so does every roll whose Wound Penalty an entry changed.
  //
  // =================================================================================================
  // THE CONTRACT WITH THE WOUND CORE -- read this before changing how Wounds are calculated.
  // =================================================================================================
  // The owner may change how the sheet calculates Wounds later in the project. This release is
  // built so that such a change does not break it, by NEVER doing any wound arithmetic of its own.
  // It only adjusts what three existing functions of the wound core already return, by wrapping
  // them: each wrapper calls the function it replaced FIRST and then changes only that result.
  // These are the three functions, and the one thing this release assumes about each:
  //
  //   computeWoundThresholds(earth)   [110-modals-trackers.js]
  //       Returns an array with one number per WOUND_LEVELS entry, in order, rising: the most
  //       Wounds a character can have taken and still be at that level. (A character is at the
  //       first level whose number is at least their Wounds taken.)
  //       -> Bad Health hands it a lower Earth; Permanent Wound subtracts the first level's number
  //          from every level's number. Neither cares how the numbers were made.
  //
  //   getWoundPenalty()               [170-feat-wounds.js]
  //       Returns the current level's penalty as one signed number; 0 means no penalty. Its SIZE
  //       is how bad the penalty is. Its SIGN is however the core applies it -- today negative,
  //       because the owner's house rule subtracts it from the roll total (RAW would raise the TN
  //       instead, which would make it positive).
  //       -> Strength of the Earth and Low Pain Threshold change the SIZE only and always hand back
  //          the sign the core chose, so switching between "subtract from the total" and "raise
  //          the TN" needs no change here.
  //
  //   formatWoundPenalty(lvl)         [110-modals-trackers.js]
  //       Returns the text shown for one level, built from that level's own `pen` string -- a
  //       signed number such as '-3', or '—' for none.
  //       -> the display adapter asks it for the text with the number in `pen` replaced by the
  //          adjusted number (and '—' when the adjustment leaves none), so the wording stays the
  //          core's own, then names the entry that adjusted it.
  //
  // If any of the three is renamed or removed, its adapter is simply not installed (every one is
  // guarded), and the CONTRACT checks in this release's harness fail, pointing back here. If an
  // adapter ever throws, it hands back the core's own result unchanged: an error here must never
  // be able to break the wound track or a roll.
  //
  // With none of the four entries on the character, every adapter returns exactly what the core
  // returned -- measured over Earth 1 to 6 and every Wounds total by the harness's IDENTITY checks.
  //
  // REMOVAL: one script (this file), one stylesheet (59.99992-feat-wound-entries.css), one seam
  // block in 210-test-seam-and-init.js and their manifest entries. Nothing in the wound core is
  // edited; deleting this file restores the three functions exactly as they were, because each
  // wrapper only ever rebinds the name and keeps the previous function inside itself.
  // =================================================================================================
  const WOUND_ENTRIES_ENABLED = true;

  const WND4529 = (function(){
    const api = {};
    api.enabled = function(){ return WOUND_ENTRIES_ENABLED; };
    api.norm = function(value){ return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase(); };

    // ---------- The four entries ----------
    // `list` is where the entry belongs: a row only counts there, exactly as for every other
    // configured entry (an Advantage typed onto the Disadvantage list does nothing).
    api.ENTRIES = Object.freeze({
      strength:  {name:'Strength of the Earth', list:'advList',    source:'Core Rulebook p.154'},
      lowPain:   {name:'Low Pain Threshold',    list:'disadvList', source:'Core Rulebook p.160'},
      badHealth: {name:'Bad Health',            list:'disadvList', source:'Core Rulebook p.156'},
      permanent: {name:'Permanent Wound',       list:'disadvList', source:'Core Rulebook p.161'},
    });
    api.STRENGTH_REDUCTION = 3;   // ruling 2
    api.LOW_PAIN_INCREASE = 5;    // ruling 1
    api.EARTH_FLOOR = 1;          // ruling 4

    // True when the entry is on its own list. The same entry on two rows still counts once.
    api.active = function(key){
      if(!api.enabled()) return false;
      const entry = api.ENTRIES[key];
      const list = entry && document.getElementById(entry.list);
      if(!list) return false;
      return Array.prototype.some.call(list.querySelectorAll('.entry .en-name'), function(el){
        return api.norm(el.value) === api.norm(entry.name);
      });
    };

    // ---------- 1. Which Earth the Wound Ranks use (Bad Health) ----------
    api.thresholdEarth = function(earth){
      if(!api.active('badHealth') || !Number.isFinite(earth)) return earth;
      return Math.max(api.EARTH_FLOOR, earth - 1);
    };

    // ---------- 2. The Wound Ranks themselves (Bad Health, then Permanent Wound) ----------
    // `core` is the computeWoundThresholds this release replaced. It does all of the arithmetic;
    // this only chooses its Earth and, for Permanent Wound, slides every number down by the
    // first one, so Healthy holds no Wounds of its own (it is "always full").
    api.thresholds = function(core, earth){
      let numbers = core(api.thresholdEarth(earth));
      if(api.active('permanent') && Array.isArray(numbers) && numbers.length && Number.isFinite(numbers[0])){
        const healthy = numbers[0];
        numbers = numbers.map(function(n){ return Number.isFinite(n) ? Math.max(0, n - healthy) : n; });
      }
      return numbers;
    };

    // ---------- 3. The size of a penalty (Low Pain Threshold, then Strength of the Earth) ----------
    // Takes and returns a SIZE (never negative). 0 stays 0: a rank with no penalty is not given
    // one (ruling 1).
    api.adjustSize = function(size){
      if(!(size > 0)) return size;
      let adjusted = size;
      if(api.active('lowPain')) adjusted += api.LOW_PAIN_INCREASE;
      if(api.active('strength')) adjusted -= api.STRENGTH_REDUCTION;
      return Math.max(0, adjusted);
    };
    // The entries that change a penalty, with how much, for the explanations.
    api.adjusters = function(){
      const out = [];
      if(api.active('lowPain')) out.push({name:api.ENTRIES.lowPain.name, change:'+' + api.LOW_PAIN_INCREASE});
      if(api.active('strength')) out.push({name:api.ENTRIES.strength.name, change:'−' + api.STRENGTH_REDUCTION});
      return out;
    };
    api.adjustersText = function(){
      return api.adjusters().map(function(a){ return a.name + ' ' + a.change; }).join(', ');
    };

    // ---------- 4. The penalty a roll uses ----------
    // `signed` is what the core's getWoundPenalty returned. Its sign is kept as it is (see the
    // contract above); only its size changes.
    api.penalty = function(signed){
      if(typeof signed !== 'number' || !Number.isFinite(signed) || signed === 0) return signed;
      const sign = signed < 0 ? -1 : 1;
      const size = api.adjustSize(Math.abs(signed));
      return size === 0 ? 0 : sign * size;
    };

    // ---------- 5. The text the track shows for one level ----------
    // `core` is the formatWoundPenalty this release replaced. Only a `pen` that is a plain signed
    // number ('-3') is adjusted; anything else ('—', 'Unconscious', or a format a later change
    // introduces) is shown exactly as the core shows it.
    api.PEN_RE = /^([+-]?)(\d+)$/;
    api.format = function(core, lvl){
      const text = core(lvl);
      if(!lvl || typeof lvl.pen !== 'string' || !api.adjusters().length) return text;
      const match = api.PEN_RE.exec(lvl.pen.trim());
      if(!match) return text;
      const size = Number(match[2]);
      const adjusted = api.adjustSize(size);
      if(adjusted === size) return text;
      const pen = adjusted === 0 ? '—' : match[1] + adjusted;
      return core(Object.assign({}, lvl, {pen:pen})) + ' (' + api.adjustersText() + ')';
    };

    // ---------- 6. A line in the roll preview and result whenever an entry changed the penalty ----
    // Informational only: it moves no dice and adds nothing to the total -- the adjusted penalty
    // itself already reached the roll through getWoundPenalty. Without this line a Wound Penalty
    // that Strength of the Earth cancelled would simply be missing from the roll, which reads as
    // "not implemented" rather than "cancelled". Never on damage, which Wounds do not affect.
    api.rollNote = function(context){
      if(!api.enabled() || !context || typeof ROLL_KINDS !== 'object' || !ROLL_KINDS) return [];
      if(context.kind === ROLL_KINDS.DAMAGE || !api.adjusters().length || typeof api.corePenalty !== 'function') return [];
      const before = api.corePenalty();
      if(typeof before !== 'number' || !Number.isFinite(before) || before === 0) return [];
      const size = Math.abs(before), adjusted = api.adjustSize(size);
      if(adjusted === size) return [];
      return [{source:'adv-config', label:'Wound Penalty', informational:true,
        display:size + ' → ' + adjusted + ' (' + api.adjustersText() + ')',
        note:'already included in the Wound Penalty' + (adjusted === 0 ? ', which this cancels' : '') + '.'}];
    };

    // ---------- 7. One line on each entry's row saying what it is doing ----------
    api.rowText = function(key){
      const earthEl = document.getElementById('ring_earth');
      const earth = earthEl ? parseInt(earthEl.value || '2', 10) : NaN;
      if(key === 'strength') return 'In effect: every Wound Rank\'s penalty is 3 lower, never below none.';
      if(key === 'lowPain') return 'In effect: every Wound Rank with a penalty gives 5 more (Healthy stays at none).';
      if(key === 'badHealth'){
        const used = api.thresholdEarth(earth);
        return (Number.isFinite(earth) && used === earth
          ? 'In effect: your Wound Ranks already use Earth ' + earth + ', the lowest they can use.'
          : 'In effect: your Wound Ranks use Earth ' + used + ' (yours is ' + earth + ').') +
          ' For resisting disease, count your Earth one lower yourself: the sheet makes no disease rolls.';
      }
      if(key === 'permanent') return 'In effect: Healthy is always full, so your first Wound makes you Nicked.';
      return '';
    };
    api.decorate = function(){
      if(!api.enabled()) return;
      Object.keys(api.ENTRIES).forEach(function(key){
        const entry = api.ENTRIES[key];
        document.querySelectorAll('#advList .entry, #disadvList .entry').forEach(function(div){
          const nameEl = div.querySelector('.en-name');
          const mine = nameEl && api.norm(nameEl.value) === api.norm(entry.name);
          let note = div.querySelector('.wound4529-note');
          if(!mine || !div.parentElement || div.parentElement.id !== entry.list){
            if(note && note.dataset.wound4529 === key) note.remove();
            return;
          }
          const text = api.rowText(key);
          if(!note){
            note = document.createElement('div');
            note.className = 'wound4529-note';
            const top = div.querySelector('.entry-top');
            if(top && top.nextSibling) div.insertBefore(note, top.nextSibling); else div.appendChild(note);
          }
          note.dataset.wound4529 = key;
          if(note.textContent !== text) note.textContent = text;
        });
      });
    };
    return api;
  })();

  // ---------- The adapters (see THE CONTRACT above) ----------
  // Each keeps the previous binding and calls it first. `WND4529.core*` hold those previous
  // bindings so the harness can prove a character without the four entries is unchanged.
  if(WND4529.enabled()){
    if(typeof computeWoundThresholds === 'function'){
      const wound4529CoreThresholds = computeWoundThresholds;
      WND4529.coreThresholds = wound4529CoreThresholds;
      computeWoundThresholds = function(earth){
        try { return WND4529.thresholds(wound4529CoreThresholds, earth); }
        catch(e){ return wound4529CoreThresholds(earth); }
      };
    }
    if(typeof getWoundPenalty === 'function'){
      const wound4529CorePenalty = getWoundPenalty;
      WND4529.corePenalty = wound4529CorePenalty;
      getWoundPenalty = function(){
        const signed = wound4529CorePenalty();
        try { return WND4529.penalty(signed); }
        catch(e){ return signed; }
      };
    }
    if(typeof formatWoundPenalty === 'function'){
      const wound4529CoreFormat = formatWoundPenalty;
      WND4529.coreFormat = wound4529CoreFormat;
      formatWoundPenalty = function(lvl){
        try { return WND4529.format(wound4529CoreFormat, lvl); }
        catch(e){ return wound4529CoreFormat(lvl); }
      };
    }
    // The roll line rides the existing Advantage modifier seat (no new registry entry).
    if(typeof advConfigExtendedRollModifiers === 'function'){
      const wound4529PreviousModifiers = advConfigExtendedRollModifiers;
      advConfigExtendedRollModifiers = function(context){
        let mine = [];
        try { mine = WND4529.rollNote(context); } catch(e){ mine = []; }
        return (wound4529PreviousModifiers(context) || []).concat(mine);
      };
    }
    // The row lines follow every recalc. refreshAllAdvConfigControls is called by name from the
    // trunk's recalcAll on every pass -- including the list and Skills table listeners, which hold
    // the trunk's own recalcAll and never reach a recalcAll wrapper (found in Phase 4.5.28).
    if(typeof refreshAllAdvConfigControls === 'function'){
      const wound4529PreviousRefresh = refreshAllAdvConfigControls;
      refreshAllAdvConfigControls = function(){
        const result = wound4529PreviousRefresh.apply(this, arguments);
        try { WND4529.decorate(); } catch(e){}
        return result;
      };
    }
  }
